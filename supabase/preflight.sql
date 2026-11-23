-- Read-only, scoped prerequisite evidence. Prepared, NOT executed remotely.
-- Prefer running against an existing schema-only local baseline.
select c.relname, t.tgname, pg_get_triggerdef(t.oid) as definition,
  pg_get_functiondef(t.tgfoid) as function_definition
from pg_trigger t join pg_class c on c.oid = t.tgrelid
where t.tgrelid in ('auth.users'::regclass, 'public.profiles'::regclass)
  and not t.tgisinternal;

select table_name, column_name, data_type, udt_schema, udt_name,
  is_nullable, column_default
from information_schema.columns where table_schema = 'public'
order by table_name, ordinal_position;

select conrelid::regclass as relation, conname, pg_get_constraintdef(oid) as definition
from pg_constraint where connamespace = 'public'::regnamespace;

-- Existing definer functions/views can bypass table policies. Review rather
-- than blanket-revoking unknown application functions.
select n.nspname, p.proname, p.prosecdef, p.proconfig,
  pg_get_userbyid(p.proowner) as owner, p.proacl,
  pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prokind = 'f';
select schemaname, viewname, definition from pg_views where schemaname = 'public';
select rolname, rolbypassrls from pg_roles where rolname = 'postgres';
select count(*) as auth_users_without_profile from auth.users u
left join public.profiles p on p.id = u.id where p.id is null;
