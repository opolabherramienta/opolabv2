-- ADMIN Y PERFILES: pegar en Supabase > SQL Editor y pulsar Run.
-- Antes de ejecutarlo, cambia TU_EMAIL por el email de tu cuenta de OpoLab.
-- Se puede ejecutar más de una vez sin problema.

begin;

-- 1. Crea el perfil de las cuentas que se registraron antes de que existiera
--    el trigger de registro y se quedaron sin él. No toca los que ya existen.
insert into public.profiles (id, email, full_name, role)
select u.id, u.email, coalesce(u.raw_user_meta_data ->> 'full_name', ''), 'user'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- 2. Da el rol de administrador a tu cuenta.
update public.profiles set role = 'admin' where email = 'TU_EMAIL';

commit;

-- Comprobación: una fila por cuenta, y la tuya con role = admin.
select p.email, p.role
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at;
