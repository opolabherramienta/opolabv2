-- Lista de espera de la página "próximamente".
-- Pegar en Supabase > SQL Editor y ejecutar una vez. Se puede repetir sin romper nada.
--
-- Cualquiera puede apuntarse (insertar). Nadie puede leer, cambiar ni borrar
-- la lista desde la web salvo una cuenta con rol admin, que solo puede leerla.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  specialty text,
  community text,
  created_at timestamptz not null default now(),
  constraint waitlist_email_format check (
    char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  constraint waitlist_specialty_length check (specialty is null or char_length(specialty) <= 80),
  constraint waitlist_community_length check (community is null or char_length(community) <= 80)
);

-- Un correo, una fila, sin distinguir mayúsculas.
create unique index if not exists waitlist_email_unique on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

revoke all on public.waitlist from public, anon, authenticated;
grant insert (email, specialty, community) on public.waitlist to anon, authenticated;
grant select on public.waitlist to authenticated;

drop policy if exists waitlist_insert on public.waitlist;
create policy waitlist_insert on public.waitlist
  for insert to anon, authenticated
  with check (true);

drop policy if exists waitlist_admin_select on public.waitlist;
create policy waitlist_admin_select on public.waitlist
  for select to authenticated
  using (public.security_is_admin());

-- Para ver quién se ha apuntado (desde el SQL Editor):
--   select email, specialty, community, created_at from public.waitlist order by created_at desc;
-- Para borrar a alguien que lo pida:
--   delete from public.waitlist where lower(email) = lower('correo@ejemplo.com');
