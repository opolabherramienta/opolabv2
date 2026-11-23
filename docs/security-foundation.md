# Security Foundation — entrega local

Estado: implementación local preparada; **no aplicada ni desplegada**.
No se han usado credenciales de producción, modificado archivos de entorno,
operado sobre usuarios reales, hecho commits/pushes ni reconstruido tablas.

## A. Archivos

Nuevos:

- `supabase/config.toml`, `supabase/.gitignore`, `supabase/README.md`: estructura local sin enlace remoto.
- `supabase/migrations/20260921000100_security_foundation.sql`: RLS, ACL de columnas, funciones administrativas y protección de identidad/rol.
- `supabase/migrations/20260921000200_auth_profiles.sql`: creación de perfiles desde Auth.
- `supabase/preflight.sql`: consultas de lectura pendientes para los requisitos concretos de estas migraciones.
- `supabase/tests/database/security_foundation.test.sql`: pruebas PostgreSQL/pgTAP preparadas.
- `lib/auth/authorization.ts`: autorización de servidor centralizada.
- `app/auth/callback/route.ts`: intercambio PKCE con destino fijo.
- `app/auth/confirm/route.ts`: confirmación por token hash con destino fijo.
- `tests/security/security.test.mjs`: pruebas sin red ejecutando los módulos TS con dependencias simuladas explícitas.
- `docs/security-foundation.md`: esta entrega.

Modificados:

- `app/admin/layout.tsx` y las cinco páginas: raíz, especialidades, temas, sugerencias y usuarios.
- `app/test-supabase/page.tsx`: diagnóstico restringido a administración antes de consultar tablas.
- `app/auth/actions.ts`: elimina upsert de perfiles y distingue confirmación/sesión inmediata; conserva espacios de contraseñas en registro e inicio de sesión.
- `components/auth/RegisterForm.tsx`: muestra el mensaje de confirmación.
- `package.json`: comandos de pruebas de seguridad y comprobación de tipos.

## B. Políticas propuestas para las 11 tablas

Visitante significa rol Postgres `anon`; no tiene acceso a ninguna de las once tablas.
El registro público utiliza Supabase Auth, sin necesitar permisos de INSERT en `profiles`.
Un administrador sigue usando `authenticated` y se identifica mediante el rol protegido en `profiles`.

| Tabla | Estudiante autenticado | Administrador autenticado |
| --- | --- | --- |
| `profiles` | SELECT propio, UPDATE de su `full_name` | SELECT de perfiles, UPDATE de su propio `full_name` |
| `education_stages` | SELECT | SELECT/INSERT/UPDATE/DELETE |
| `specialties` | SELECT | SELECT/INSERT/UPDATE/DELETE |
| `autonomous_communities` | SELECT | SELECT/INSERT/UPDATE/DELETE |
| `base_topics` | SELECT | SELECT/INSERT/UPDATE/DELETE |
| `user_opposition_profiles` | CRUD propio | CRUD propio |
| `user_topics` | CRUD propio | CRUD propio |
| `user_practicals` | CRUD propio | CRUD propio |
| `calendar_tasks` | CRUD propio | CRUD propio |
| `study_logs` | CRUD propio | CRUD propio |
| `suggestions` | INSERT propio y SELECT propio sin notas internas | SELECT de todas sin notas por tabla, moderación de `status`/`admin_notes`, notas vía RPC protegida |

En las cinco tablas personales se usan políticas independientes por operación.
SELECT/DELETE comprueban `user_id = (select auth.uid())`; INSERT usa WITH CHECK;
UPDATE verifica tanto la fila anterior (USING) como la nueva (WITH CHECK).
Esto bloquea cambios de propietario y mantiene los upserts de onboarding/temas
con las restricciones UNIQUE confirmadas, sin alterarlas.

Las sugerencias solo se crean con estado `pending` y notas nulas. El cliente no
puede suministrar id, status, notas ni timestamps al insertar. No hay DELETE ni
edición del mensaje después de enviado. No se inventan otros valores de sus enums.
El RPC de notas exige administrador y solo devuelve una nota para el id solicitado.
Las futuras consultas a sugerencias deberán enumerar columnas: `select('*')`
incluye `admin_notes` y será rechazado incluso para un administrador.

Se revocan privilegios previos tanto de tabla como de columnas para PUBLIC,
anon y authenticated antes de otorgar la lista permitida. Así se elimina también
el UPDATE explícito existente sobre `profiles.role`.

## C. Roles y administración

`profiles` no admite INSERT/DELETE por sesiones de aplicación. Solo se concede
UPDATE de `full_name`: rol, id, email y timestamps no son editables por el cliente.
Un trigger invoker añade una segunda barrera contra cambios de rol/id por anon o
authenticated si un grant futuro los habilitara accidentalmente. No se modifica
el trigger existente de `updated_at`.

La función `opolab_security.is_admin()` es SECURITY DEFINER, propiedad de postgres,
con search_path vacío y referencias calificadas. Consulta exclusivamente el usuario
actual, sin argumentos ni metadata editable. Su propietario debe poder saltar RLS:
esto evita recursión al usarla en políticas de `profiles`. El esquema no se expone
en la API; solo tiene USAGE/EXECUTE mínimos para authenticated. Los wrappers públicos
son SECURITY INVOKER; anon y PUBLIC no tienen EXECUTE.

`requireAdmin()` valida la sesión con `auth.getUser()` y exige que el RPC devuelva
exactamente `true`. Error, función ausente o perfil ausente deniegan acceso.
Se invoca en el layout y cada página admin, sin depender del proxy ni de ocultar UI.
No utiliza service role ni caché persistente del rol. Futuras Server Actions admin
deben invocarlo dentro de cada acción antes de consultar/mutar datos.

No se crea una API de cambio de roles. La asignación de administradores queda fuera
de esta entrega, reservada a un procedimiento privilegiado explícitamente autorizado.
Los administradores no reciben acceso a la actividad personal de otros estudiantes.

Revisión acotada de las cuatro Server Actions existentes:

| Acción | Autorización |
| --- | --- |
| `signUpAction` | Pública por diseño; solo Auth, nombre/email/password; no acepta rol/id ni escribe perfiles |
| `signInAction` | Pública por diseño; verificación de contraseña en Auth |
| `signOutAction` | Solo cierra la sesión del cliente de cookies; sin usuario objetivo ni privilegios globales |
| `saveOnboardingAction` | Ya comprueba getUser dentro de la acción; deriva user_id de la sesión, ignora el enviado; conserva validación y upsert |

No existen Server Actions administrativas adicionales. Temas, prácticos y calendario
escriben con el cliente Supabase del navegador: su frontera de autorización será RLS.
No se han cambiado sus formularios, consultas ni los de dashboard/progreso.

## D. Registro y confirmación

El trigger AFTER INSERT en `auth.users` crea un perfil usando NEW.id, NEW.email,
nombre de metadata y el literal `user`. No lee un rol de metadata y no usa upsert.
Funciona sin sesión de cliente y antes de confirmar email; el usuario no accede a
las tablas hasta estar autenticado. Si crear el perfil falla, falla la transacción
de registro: no se informa falsamente de una creación completa.

Con sesión inmediata, la acción redirige a onboarding. Sin sesión, muestra el aviso
para revisar el correo. El cambio de la acción debe publicarse coordinado con las
dos migraciones: **no desplegar el frontend de registro antes del trigger**.

Se preparan dos rutas alternativas compatibles con SSR:

- `/auth/callback`: para redirect PKCE configurado por Auth; intercambia code por sesión.
- `/auth/confirm`: para una plantilla de confirmación con enlace
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}`; verifica el token como email.

Ninguna acepta un destino arbitrario `next`; ambas van a onboarding o login. No se
ha cambiado ninguna plantilla remota, Site URL, redirect allowlist ni configuración
de confirmación. Hay que confirmar el flujo real antes de publicar. Si se conserva
el enlace estándar que confirma en Auth, el usuario puede iniciar sesión después.

## E. Pruebas y límites

Los comandos `npm run test:security`, `npm run typecheck` y `npm run lint` son locales.
Las pruebas ejecutan las implementaciones reales de autorización, acciones y rutas
con clientes simulados; no cargan .env, no arrancan Next ni llaman a Supabase.
Resultado final: **20/20 pruebas aprobadas**, `typecheck` sin errores,
`lint` sin errores y `git diff --check` sin errores de whitespace.

La suite pgTAP comprueba las once tablas con RLS/ACL, creación de perfiles sin sesión,
metadata con rol falsificado, lectura/escritura cruzada de perfiles y sugerencias,
escalada por UPDATE/upsert, notas internas, moderación y revocación inmediata.
Usa tres identidades sintéticas en transacción con ROLLBACK. No se ha ejecutado:
no hay CLI Supabase, Docker ni psql disponibles en PATH ni baseline SQL completo.
No se afirma validación real de PostgreSQL, Auth por email ni pruebas end-to-end.
Para las cinco tablas personales aún se deben añadir fixtures válidos y comprobar
CRUD/upsert cruzado real: las comprobaciones actuales de pgTAP inspeccionan políticas.

## F. Pendiente antes de aplicar

1. Certificar triggers personalizados de `auth.users` usando `not tgisinternal`.
   Ambas migraciones abortan si hay alguno; no se sustituye ninguna función/trigger
   desconocido. Resolver su compatibilidad si aparece uno.
2. Obtener el baseline SQL completo de las once tablas, índices/FK/checks/defaults,
   funciones y vistas existentes. Revisar particularmente referencias entre tablas
   personales: si permiten apuntar a objetos de otro estudiante, añadir verificación
   de propietario de la referencia o FK compuestas según el DDL real.
3. Revisar funciones SECURITY DEFINER/RPC/vistas existentes y sus EXECUTE/grants:
   podrían saltar RLS. No se revocan a ciegas funciones no identificadas.
4. Confirmar versión PostgreSQL, propietario/BYPASSRLS de postgres, esquemas expuestos
   (excluir opolab_security) y privilegios efectivos/heredados. La migración exige
   las once tablas, etiquetas user/admin, cero políticas y no colisionar con objetos nuevos.
5. Comprobar si existen auth.users sin profiles. No se hace backfill ni cambios de
   roles/datos históricos; cualquier reparación requiere una propuesta separada.
6. Confirmar email confirmations, Site URL, redirect URLs y plantilla real de Auth.
   Ejecutar registro con/sin confirmación, login, logout y confirmación inválida/repetida
   en el stack local, con usuarios exclusivamente sintéticos.
7. Ejecutar pgTAP y los flujos de onboarding, dashboard, temas, prácticos, calendario
   y progreso en una base local con DDL fiel. Verificar upserts y referencias cruzadas.
8. Revisar y autorizar explícitamente aplicación/despliegue coordinado. No ejecutado.

No se incluye una migración base de creación de tablas: hacerlo sin el DDL real
inventaría estructura. Las migraciones preparadas no son todavía un bootstrap local.

Referencias oficiales consultadas:

- [Migraciones Supabase](https://supabase.com/docs/guides/local-development/database-migrations).
- [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [Perfiles y triggers de Auth](https://supabase.com/docs/guides/auth/managing-user-data).
- [Privilegios de columnas](https://supabase.com/docs/guides/database/postgres/column-level-security).
- [Cliente SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client).
- Guías instaladas Next 16.2.9: `node_modules/next/dist/docs/01-app/02-guides/authentication.md`,
  `01-app/03-api-reference/01-directives/use-server.md` y `03-file-conventions/route.md`.
