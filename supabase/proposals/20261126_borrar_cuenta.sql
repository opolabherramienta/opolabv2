-- BORRAR MI CUENTA: pegar en Supabase > SQL Editor y pulsar Run.
-- Crea la función que usa el botón "Borrar mi cuenta" de Ajustes. Borra los
-- datos de estudio de quien la llama y después su cuenta. Solo puede
-- borrarse a sí misma: no recibe ningún identificador desde fuera.
-- Se puede ejecutar más de una vez.
--
-- La cuenta con rol admin no se puede borrar desde aquí, para no quedarse
-- sin administrador por un clic.

begin;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  table_name text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if exists (select 1 from public.profiles where id = uid and role::text = 'admin') then
    raise exception 'admin account cannot be deleted here';
  end if;

  -- Datos de estudio, de lo más dependiente a lo menos. Las tablas que no
  -- existan en este proyecto se saltan.
  foreach table_name in array array[
    'study_logs', 'calendar_tasks', 'user_topics', 'user_practicals',
    'user_opposition_profiles', 'suggestions', 'feedback'
  ] loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('delete from public.%I where user_id = $1', table_name) using uid;
    end if;
  end loop;

  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

alter function public.delete_my_account() owner to postgres;
revoke all on function public.delete_my_account() from public, anon, authenticated;
grant execute on function public.delete_my_account() to authenticated;

commit;

-- Comprobación: debe devolver una fila con el nombre de la función.
select proname from pg_proc where proname = 'delete_my_account';
