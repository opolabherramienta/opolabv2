-- Prepared locally only; no production application is authorized.
-- Requires the existing baseline. See docs/security-foundation.md.
begin;
-- Abort before any changes when an unreviewed signup trigger exists.
do $auth_preflight$
begin
  if exists (select 1 from pg_catalog.pg_trigger
    where tgrelid = 'auth.users'::regclass and not tgisinternal) then
    raise exception 'Review existing custom auth.users triggers before installing profile creation';
  end if;
  if (select count(*) from pg_catalog.pg_tables where schemaname = 'public') <> 11 then
    raise exception 'Expected the confirmed 11-table public baseline';
  end if;
end
$auth_preflight$;

-- Validate rather than create/reconstruct existing application tables or enums.
do $preflight$
declare
  table_name text;
  role_type oid;
begin
  foreach table_name in array array[
    'profiles', 'education_stages', 'specialties', 'autonomous_communities',
    'base_topics', 'user_opposition_profiles', 'user_topics', 'user_practicals',
    'calendar_tasks', 'study_logs', 'suggestions'
  ] loop
    if to_regclass(format('public.%I', table_name)) is null then
      raise exception 'Missing baseline table: %', table_name;
    end if;
  end loop;
  select atttypid into role_type from pg_catalog.pg_attribute
    where attrelid = 'public.profiles'::regclass and attname = 'role' and not attisdropped;
  if not exists (select 1 from pg_catalog.pg_enum where enumtypid = role_type and enumlabel = 'user')
    or not exists (select 1 from pg_catalog.pg_enum where enumtypid = role_type and enumlabel = 'admin') then
    raise exception 'Confirm user_role labels before enabling the proposed admin check';
  end if;
  if exists (select 1 from pg_catalog.pg_policies where schemaname = 'public') then
    raise exception 'Unexpected policies: reconcile baseline before applying';
  end if;
end
$preflight$;

-- New, non-exposed schema; CREATE fails on collision rather than trusting an
-- existing schema or overwriting an existing privileged function.
create schema opolab_security;
revoke all on schema opolab_security from public, anon, authenticated;
grant usage on schema opolab_security to authenticated;

-- Must be owned by the trusted migration role (postgres), which bypasses RLS.
-- No caller-supplied user id, dynamic SQL, metadata or JWT role claims.
create function opolab_security.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role::text = 'admin'
  );
$$;
alter function opolab_security.is_admin() owner to postgres;
revoke all on function opolab_security.is_admin() from public, anon, authenticated;
grant execute on function opolab_security.is_admin() to authenticated;

-- Only this invoker wrapper is exposed via RPC; returns the caller's status.
create function public.security_is_admin()
returns boolean
language sql stable security invoker
set search_path = ''
as $$ select opolab_security.is_admin(); $$;
revoke all on function public.security_is_admin() from public, anon, authenticated;
grant execute on function public.security_is_admin() to authenticated;

-- Column privileges are separate from row ownership. No browser role,
-- including an administrator's authenticated session, can assign roles.
revoke all on public.profiles from public, anon, authenticated;
do $column_acl$
declare column_name text;
begin
  for column_name in select attname from pg_catalog.pg_attribute
    where attrelid = 'public.profiles'::regclass and attnum > 0 and not attisdropped
  loop
    execute format('revoke all (%I) on public.profiles from public, anon, authenticated', column_name);
  end loop;
end
$column_acl$;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
alter table public.profiles enable row level security;
create policy profiles_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select opolab_security.is_admin()));
create policy profiles_update_name on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Defense in depth if a future grant mistakenly re-enables role/id writes.
-- Trusted offline SQL maintenance can manage roles; no public role-edit RPC.
create function opolab_security.guard_profile_identity()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') and
    (new.role is distinct from old.role or new.id is distinct from old.id) then
    raise exception 'Profile identity and role are protected' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function opolab_security.guard_profile_identity() from public, anon, authenticated;
create trigger security_guard_profile_identity before update on public.profiles
  for each row execute function opolab_security.guard_profile_identity();

-- Catalogs: authenticated read, administrative writes; anonymous access denied.
do $catalog_policies$
declare table_name text; column_name text;
begin
  foreach table_name in array array[
    'education_stages', 'specialties', 'autonomous_communities', 'base_topics'
  ] loop
    execute format('revoke all on public.%I from public, anon, authenticated', table_name);
    for column_name in select attname from pg_catalog.pg_attribute
      where attrelid = to_regclass(format('public.%I', table_name)) and attnum > 0 and not attisdropped
    loop
      execute format('revoke all (%I) on public.%I from public, anon, authenticated', column_name, table_name);
    end loop;
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy catalog_read on public.%I for select to authenticated using (true)', table_name);
    execute format('create policy catalog_insert on public.%I for insert to authenticated with check ((select opolab_security.is_admin()))', table_name);
    execute format('create policy catalog_update on public.%I for update to authenticated using ((select opolab_security.is_admin())) with check ((select opolab_security.is_admin()))', table_name);
    execute format('create policy catalog_delete on public.%I for delete to authenticated using ((select opolab_security.is_admin()))', table_name);
  end loop;
end
$catalog_policies$;

-- Personal records: even administrators are limited to their own study data.
do $personal_policies$
declare table_name text; column_name text;
begin
  foreach table_name in array array[
    'user_opposition_profiles', 'user_topics', 'user_practicals', 'calendar_tasks', 'study_logs'
  ] loop
    execute format('revoke all on public.%I from public, anon, authenticated', table_name);
    for column_name in select attname from pg_catalog.pg_attribute
      where attrelid = to_regclass(format('public.%I', table_name)) and attnum > 0 and not attisdropped
    loop
      execute format('revoke all (%I) on public.%I from public, anon, authenticated', column_name, table_name);
    end loop;
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy personal_read on public.%I for select to authenticated using (user_id = (select auth.uid()))', table_name);
    execute format('create policy personal_insert on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', table_name);
    execute format('create policy personal_update on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', table_name);
    execute format('create policy personal_delete on public.%I for delete to authenticated using (user_id = (select auth.uid()))', table_name);
  end loop;
end
$personal_policies$;
-- Suggestions: authors submit/read; only admins can moderate.
-- Column grants prevent authors from supplying status/admin_notes at creation.
revoke all on public.suggestions from public, anon, authenticated;
do $suggestion_acl$
declare column_name text;
begin
  for column_name in select attname from pg_catalog.pg_attribute
    where attrelid = 'public.suggestions'::regclass and attnum > 0 and not attisdropped
  loop
    execute format('revoke all (%I) on public.suggestions from public, anon, authenticated', column_name);
  end loop;
end
$suggestion_acl$;
grant select (id, user_id, suggestion_type, message, specialty_id,
  autonomous_community_id, status, created_at, updated_at) on public.suggestions to authenticated;
grant insert (user_id, suggestion_type, message, specialty_id,
  autonomous_community_id) on public.suggestions to authenticated;
grant update (status, admin_notes) on public.suggestions to authenticated;
alter table public.suggestions enable row level security;
create policy suggestions_read on public.suggestions for select to authenticated
  using (user_id = (select auth.uid()) or (select opolab_security.is_admin()));
create policy suggestions_insert on public.suggestions for insert to authenticated
  with check (user_id = (select auth.uid()) and status::text = 'pending' and admin_notes is null);
create policy suggestions_moderate on public.suggestions for update to authenticated
  using ((select opolab_security.is_admin())) with check ((select opolab_security.is_admin()));
-- No DELETE policy or grant: moderation preserves the submitted record.

-- Notes are private even when an author reads their suggestion. Admins use
-- this narrowly scoped RPC instead of granting SELECT(admin_notes) to everyone.
create function opolab_security.suggestion_admin_notes(suggestion_id uuid)
returns text language plpgsql stable security definer set search_path = ''
as $$
begin
  if not opolab_security.is_admin() then
    raise exception 'Administrator required' using errcode = '42501';
  end if;
  return (select admin_notes from public.suggestions where id = suggestion_id);
end;
$$;
alter function opolab_security.suggestion_admin_notes(uuid) owner to postgres;
revoke all on function opolab_security.suggestion_admin_notes(uuid) from public, anon, authenticated;
grant execute on function opolab_security.suggestion_admin_notes(uuid) to authenticated;
create function public.security_suggestion_admin_notes(suggestion_id uuid)
returns text language sql stable security invoker set search_path = ''
as $$ select opolab_security.suggestion_admin_notes(suggestion_id); $$;
revoke all on function public.security_suggestion_admin_notes(uuid) from public, anon, authenticated;
grant execute on function public.security_suggestion_admin_notes(uuid) to authenticated;
commit;
