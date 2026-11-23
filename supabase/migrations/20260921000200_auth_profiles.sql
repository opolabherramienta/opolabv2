-- No backfill or modification of existing users. Requires reviewed Auth triggers.
begin;
do $$ begin
  if exists (select 1 from pg_catalog.pg_trigger
    where tgrelid = 'auth.users'::regclass and not tgisinternal) then
    raise exception 'Unreviewed custom auth.users trigger; abort without overwriting it';
  end if;
end $$;

create function opolab_security.create_auth_profile()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  -- Never copy role, id or email from editable raw_user_meta_data.
  -- No upsert: collisions fail instead of resetting an existing role.
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'user');
  return new;
end;
$$;
alter function opolab_security.create_auth_profile() owner to postgres;
revoke all on function opolab_security.create_auth_profile() from public, anon, authenticated;
create trigger security_create_auth_profile after insert on auth.users
  for each row execute function opolab_security.create_auth_profile();
commit;
