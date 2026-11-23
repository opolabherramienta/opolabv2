-- ONLY on a disposable LOCAL Supabase database with the reviewed baseline
-- and both migrations installed. Synthetic identities; all changes roll back.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

select ok(c.relrowsecurity, format('%I has RLS', c.relname))
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r';
select is((select count(*)::integer from pg_tables where schemaname = 'public'), 11, '11 baseline tables');
select ok(not has_any_column_privilege('anon', format('public.%I', tablename), 'SELECT,INSERT,UPDATE,REFERENCES'),
  tablename || ': anonymous has no column access') from pg_tables where schemaname = 'public';
select ok(not has_table_privilege('anon', format('public.%I', tablename), 'DELETE,TRUNCATE'),
  tablename || ': anonymous cannot delete/truncate') from pg_tables where schemaname = 'public';
select ok(not has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE'), 'role update revoked');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'id', 'UPDATE'), 'identity update revoked');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'role', 'INSERT'), 'profile role insert revoked');
select ok(not has_column_privilege('authenticated', 'public.suggestions', 'admin_notes', 'SELECT'), 'notes not exposed by table reads');
select ok(not has_function_privilege('anon', 'public.security_is_admin()', 'EXECUTE'), 'anonymous cannot invoke admin check');
select ok(not has_function_privilege('authenticated', 'opolab_security.create_auth_profile()', 'EXECUTE'), 'signup trigger is not an RPC');
select ok(prosecdef and proconfig @> array['search_path=""'] and pg_get_userbyid(proowner) = 'postgres',
  'admin helper is definer with fixed owner and empty search path')
from pg_proc where oid = 'opolab_security.is_admin()'::regprocedure;

-- Auth inserts exercise the real profile trigger, including forged metadata.
insert into auth.users (id, email, raw_user_meta_data) values
 ('a1000000-0000-4000-8000-000000000001', 'sf-a@example.invalid', '{"full_name":"Student A","role":"admin"}'),
 ('a1000000-0000-4000-8000-000000000002', 'sf-b@example.invalid', '{"full_name":"Student B"}'),
 ('a1000000-0000-4000-8000-000000000003', 'sf-admin@example.invalid', '{}');
select is((select role::text from public.profiles where id = 'a1000000-0000-4000-8000-000000000001'),
  'user', 'metadata cannot choose initial role');
select is((select count(*)::integer from public.profiles where id in (
  'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002',
  'a1000000-0000-4000-8000-000000000003')), 3, 'profiles created without a client session');
-- Trusted test setup only, never exposed as an application action.
update public.profiles set role = 'admin' where id = 'a1000000-0000-4000-8000-000000000003';
insert into public.suggestions (id, user_id, message, admin_notes) values
 ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'A suggestion', 'Internal A'),
 ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002', 'B suggestion', 'Internal B');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"a1000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select is(public.security_is_admin(), false, 'student is not admin; no RLS recursion');
select is((select count(*)::integer from public.profiles), 1, 'student reads only own profile');
select lives_ok($$update public.profiles set full_name = 'Changed' where id = auth.uid()$$, 'own name can change');
select throws_ok($$update public.profiles set role = 'admin' where id = auth.uid()$$, '42501', null, 'self promotion denied');
select throws_ok($$update public.profiles set id = 'a1000000-0000-4000-8000-000000000002' where id = auth.uid()$$,
  '42501', null, 'identity change denied');
select throws_ok($$insert into public.profiles (id, role) values (auth.uid(), 'admin') on conflict(id) do update set role = excluded.role$$,
  '42501', null, 'profile upsert escalation denied');
select results_eq($$update public.profiles set full_name = 'Attack' where id = 'a1000000-0000-4000-8000-000000000002' returning id$$,
  $$select null::uuid where false$$, 'other profile update affects no rows');
select is((select count(id)::integer from public.suggestions), 1, 'student sees own suggestions only');
select throws_ok($$select admin_notes from public.suggestions$$, '42501', null, 'student cannot read internal notes');
select throws_ok($$select public.security_suggestion_admin_notes('b1000000-0000-4000-8000-000000000001')$$,
  '42501', null, 'RPC cannot reveal internal notes to author');
select lives_ok($$insert into public.suggestions(user_id, message) values(auth.uid(), 'New')$$, 'author can submit');
select throws_ok($$insert into public.suggestions(user_id, message) values('a1000000-0000-4000-8000-000000000002', 'Forged')$$,
  '42501', null, 'forged owner denied');
select throws_ok($$insert into public.suggestions(user_id, message, admin_notes) values(auth.uid(), 'New', 'Forged')$$,
  '42501', null, 'author cannot supply moderation fields');
select results_eq($$update public.suggestions set admin_notes = 'Attack' where user_id = auth.uid() returning id$$,
  $$select null::uuid where false$$, 'author cannot moderate own suggestion');

-- Simulate a future mistaken column grant: the trigger remains a second barrier.
reset role;
grant update (role) on public.profiles to authenticated;
set local role authenticated;
select throws_ok($$update public.profiles set role = 'admin' where id = auth.uid()$$,
  '42501', 'Profile identity and role are protected', 'trigger blocks escalation even after a mistaken grant');
reset role;
revoke update (role) on public.profiles from authenticated;

-- All five study-table policies must constrain old and new row ownership.
reset role;
select is((select count(*)::integer from pg_policies where schemaname = 'public'
  and tablename = t.name and roles = array['authenticated']::name[]), 4, t.name || ': four authenticated policies')
from unnest(array['user_opposition_profiles', 'user_topics', 'user_practicals', 'calendar_tasks', 'study_logs']) t(name);
select ok(qual like '%user_id%' and qual like '%auth.uid()%' and with_check like '%user_id%' and with_check like '%auth.uid()%',
  tablename || ': UPDATE checks old and new owner')
from pg_policies where schemaname = 'public' and policyname = 'personal_update';

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a1000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claims', '{"sub":"a1000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
select is(public.security_is_admin(), true, 'admin recognized from protected database role');
select is(public.security_suggestion_admin_notes('b1000000-0000-4000-8000-000000000001'), 'Internal A', 'admin can read notes via guarded RPC');
select lives_ok($$update public.suggestions set admin_notes = 'Reviewed' where id = 'b1000000-0000-4000-8000-000000000001'$$,
  'admin can moderate');
select throws_ok($$update public.profiles set role = 'admin' where id = 'a1000000-0000-4000-8000-000000000002'$$,
  '42501', null, 'admin session cannot assign roles through generic update');
reset role;
update public.profiles set role = 'user' where id = 'a1000000-0000-4000-8000-000000000003';
set local role authenticated;
select is(public.security_is_admin(), false, 'role revocation is immediate without JWT refresh');
reset role;
select * from finish();
rollback;
