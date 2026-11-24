-- Límite de envíos de la lista de espera.
-- Pegar en Supabase > SQL Editor y ejecutar una vez. Se puede repetir sin romper nada.
-- Necesita que 20261123_lista_de_espera.sql esté ya ejecutado.
--
-- Qué cambia:
--   * Ya no se puede insertar en `waitlist` directamente desde la web: solo a
--     través de la función `join_waitlist`.
--   * La función admite 5 intentos por hora desde la misma conexión y 300 por
--     hora en total. El segundo tope es el que frena a quien llame a Supabase
--     saltándose la web, porque ahí la conexión se puede falsear.
--   * La huella de la conexión (un resumen de la IP, no la IP) se guarda aparte,
--     en `waitlist_attempts`, y se borra sola pasado un día.

create table if not exists public.waitlist_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null check (char_length(ip_hash) <= 64),
  created_at timestamptz not null default now()
);

create index if not exists waitlist_attempts_by_ip
  on public.waitlist_attempts (ip_hash, created_at);
create index if not exists waitlist_attempts_by_date
  on public.waitlist_attempts (created_at);

-- Nadie la lee ni la escribe desde la web: solo la función de abajo.
alter table public.waitlist_attempts enable row level security;
revoke all on public.waitlist_attempts from public, anon, authenticated;

create or replace function public.join_waitlist(
  p_email text,
  p_specialty text,
  p_community text,
  p_ip_hash text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text := left(coalesce(nullif(trim(p_ip_hash), ''), 'unknown'), 64);
begin
  delete from public.waitlist_attempts
  where created_at < now() - interval '1 day';

  if (
    select count(*) from public.waitlist_attempts
    where ip_hash = v_hash and created_at > now() - interval '1 hour'
  ) >= 5 then
    return 'rate_limited';
  end if;

  if (
    select count(*) from public.waitlist_attempts
    where created_at > now() - interval '1 hour'
  ) >= 300 then
    return 'busy';
  end if;

  insert into public.waitlist_attempts (ip_hash) values (v_hash);

  begin
    insert into public.waitlist (email, specialty, community)
    values (
      lower(trim(p_email)),
      nullif(trim(p_specialty), ''),
      nullif(trim(p_community), '')
    );
  exception
    -- Ya estaba apuntado: para quien se apunta es la misma buena noticia.
    when unique_violation then
      return 'ok';
    when check_violation or not_null_violation then
      return 'invalid';
  end;

  return 'ok';
end;
$$;

revoke all on function public.join_waitlist(text, text, text, text) from public;
grant execute on function public.join_waitlist(text, text, text, text) to anon, authenticated;

-- Se cierra la puerta directa: a partir de aquí solo entra la función.
drop policy if exists waitlist_insert on public.waitlist;
revoke insert on public.waitlist from anon, authenticated;

-- Para ver los intentos de la última hora (desde el SQL Editor):
--   select ip_hash, count(*) from public.waitlist_attempts
--   where created_at > now() - interval '1 hour' group by ip_hash order by 2 desc;
