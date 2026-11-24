-- Correo de bienvenida de la lista de espera.
-- Pegar en Supabase > SQL Editor y ejecutar una vez. Se puede repetir sin romper nada.
-- Necesita que 20261124_lista_de_espera_limite.sql esté ya ejecutado.
--
-- Qué cambia:
--   * `join_waitlist` devuelve 'ok_new' cuando el correo es nuevo y 'ok' cuando
--     ya estaba apuntado. La web solo manda la bienvenida con 'ok_new', así que
--     repetir el formulario con el mismo correo no envía nada.
--   * Todo lo demás (los dos límites y el cierre de la inserción directa) sigue igual.
--
-- Hasta que se ejecute, el formulario funciona como antes y no sale ningún correo.

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
    -- Ya estaba apuntado: para quien se apunta es la misma buena noticia,
    -- pero no se le manda otra bienvenida.
    when unique_violation then
      return 'ok';
    when check_violation or not_null_violation then
      return 'invalid';
  end;

  return 'ok_new';
end;
$$;

revoke all on function public.join_waitlist(text, text, text, text) from public;
grant execute on function public.join_waitlist(text, text, text, text) to anon, authenticated;
