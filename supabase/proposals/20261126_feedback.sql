-- CUÉNTANOS QUÉ FALLA: pegar en Supabase > SQL Editor y pulsar Run.
-- Crea la tabla donde se guardan los mensajes que la gente envía desde el
-- botón "Cuéntanos qué falla". Se puede ejecutar más de una vez.
--
-- Cada persona solo puede escribir y leer sus propios mensajes. La cuenta
-- con rol admin los lee todos (pantalla /admin/sugerencias).

begin;

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  message text not null check (char_length(message) between 3 and 4000),
  page text check (page is null or char_length(page) <= 200),
  created_at timestamptz not null default now()
);

create index if not exists feedback_by_date on public.feedback (created_at desc);
create index if not exists feedback_by_user on public.feedback (user_id, created_at desc);

alter table public.feedback enable row level security;
revoke all on public.feedback from public, anon, authenticated;
grant select on public.feedback to authenticated;
grant insert (message, page) on public.feedback to authenticated;

drop policy if exists feedback_read on public.feedback;
create policy feedback_read on public.feedback for select to authenticated
  using (user_id = (select auth.uid()) or (select opolab_security.is_admin()));

drop policy if exists feedback_insert on public.feedback;
create policy feedback_insert on public.feedback for insert to authenticated
  with check (user_id = (select auth.uid()));

commit;

-- Comprobación: debe devolver una fila con rowsecurity = true.
select relname, relrowsecurity as rowsecurity
from pg_class where oid = 'public.feedback'::regclass;
