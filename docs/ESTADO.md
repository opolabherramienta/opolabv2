# OpoLab Planner: estado y siguientes pasos

Documento de relevo. Una sesión nueva debe leer esto antes de tocar nada.
Última actualización: 23 de noviembre de 2026.

## Qué es

Planificador para opositores a profesorado de Secundaria. Objetivo: abrir el
registro cuanto antes (enero de 2027 como tarde), empezando por Biología y
Geología. Rama de trabajo: `opolab-v2` (GitHub `opolabherramienta/opolabv2`).

## Qué funciona

- Registro, login, recuperación de contraseña, onboarding y Ajustes.
- Temas (bolas), Prácticos, Calendario, Progreso e Inicio, rediseñados con la
  marca (violeta, verde, azul, ámbar; Bricolage Grotesque + Figtree).
- Plan automático de estudio: `lib/study/planner.ts`, acción en
  `app/plan/actions.ts`, botón en Inicio y Calendario.
- Rachas, XP y niveles: `lib/study/gamification.ts`, calculados a partir de las
  sesiones completadas. No hay tablas de gamificación.
- `/dev-preview/*`: pantallas con datos de ejemplo, solo fuera de producción.

Comprobaciones: `npm test` (40 pruebas), `npm run lint`, `npm run typecheck`,
`npm run build`.

## Pendiente, por orden

1. **Seguridad de la base de datos.** Las tablas son legibles sin sesión.
   Ejecutar `supabase/proposals/20261123_seguridad_lista_para_pegar.sql` en el
   editor SQL de Supabase. Si se detiene con un mensaje, adaptar el SQL a lo
   que diga (lo más probable: ya existe un trigger en `auth.users`).
2. **Temario de Biología y Geología.** Ejecutar
   `supabase/proposals/20261123_biologia_geologia_temario.sql`. El catálogo
   actual son 5 especialidades con 5 temas de relleno.
3. **Prueba completa con una cuenta real:** registro, onboarding, elegir temas,
   crear plan, completar sesiones, ver racha y XP, recalcular plan, cambiar
   contraseña. Hasta ahora solo se ha visto con datos de ejemplo.
4. **Despliegue.** Definir `NEXT_PUBLIC_SITE_URL` y añadir
   `https://<dominio>/auth/recovery` a las URLs de redirección de Supabase Auth.
5. **Vídeo de presentación** (animación + voz), cuando lo anterior funcione.
6. **Premium e IA** (más adelante): pagos con Stripe y OpoLab Coach
   (grabarse exponiendo y recibir corrección). Sin empezar.

## Cosas que conviene saber

- Next 16: leer `node_modules/next/dist/docs/` antes de escribir código.
- La base de datos solo distingue tres tipos de sesión (`study_topic`,
  `practical`, `rest`). Repasos y simulacros se reconocen por el título
  ("Repaso: …", "Simulacro: …"); ver `lib/study/sessions.ts`.
- Recalcular el plan borra solo sesiones con `is_auto_generated = true`,
  pendientes y de hoy en adelante.
- Sin acceso de administrador a Supabase desde el código: cualquier cambio de
  esquema o de datos de catálogo se entrega como SQL en `supabase/proposals/`
  para que lo ejecute Dani.
- El proyecto Supabase se pausa por inactividad; si la API devuelve 521, hay
  que reactivarlo desde su panel.
- Marca y diseños: `E:\OPOLAB`. Proyecto anterior con más lógica reutilizable:
  `C:\Users\danit\opolab`.
