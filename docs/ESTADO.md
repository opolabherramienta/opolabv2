# OpoLab Planner: estado y siguientes pasos

Documento de relevo. Una sesión nueva debe leer esto antes de tocar nada.
Última actualización: 23 de noviembre de 2026.

## Qué es

Planificador para opositores a profesorado de Secundaria. Objetivo: abrir el
registro cuanto antes (enero de 2027 como tarde), empezando por Biología y
Geología. Rama de trabajo: `opolab-v2` (GitHub `opolabherramienta/opolabv2`).
Todo lo hecho está subido a esa rama; `main` sigue en el estado de julio.

## Qué funciona

- Registro (sin confirmación por email), login, recuperación de contraseña,
  onboarding y Ajustes. Dani lo ha probado con una cuenta real el 23 de
  noviembre y dice que va bien.
- Temas (bolas), Prácticos, Calendario, Progreso e Inicio, con la marca
  (violeta, verde, azul, ámbar; Bricolage Grotesque + Figtree).
- Plan automático de estudio: `lib/study/planner.ts`, acción en
  `app/plan/actions.ts`, botón en Inicio y Calendario.
- Rachas, XP y niveles: `lib/study/gamification.ts`, calculados a partir de las
  sesiones completadas. No hay tablas de gamificación.
- Biología y Geología cargada en el catálogo con sus 75 temas (23 de
  noviembre). Las otras 5 especialidades siguen con 5 temas de relleno.
- `/dev-preview/*`: pantallas con datos de ejemplo, solo fuera de producción.

Comprobaciones: `npm test` (40 pruebas), `npm run lint`, `npm run typecheck`,
`npm run build`.

## Siguientes pasos, por orden

### 1. Seguridad de la base de datos (bloquea el lanzamiento)

Las 11 tablas se leen y se escriben sin iniciar sesión. Dani debe ejecutar
`supabase/proposals/20261123_seguridad_lista_para_pegar.sql` en Supabase,
SQL Editor. Va en transacciones: si algo no encaja se detiene con un mensaje
y no cambia nada.

- Si se detiene, lo más probable es que ya exista un trigger en `auth.users`
  o políticas previas. Adaptar el SQL al mensaje y volver a entregarlo.
- Después de aplicarlo, repetir la prueba completa: registro nuevo,
  onboarding, temas, crear plan, completar sesión, recalcular. Comprobar
  también que un visitante sin sesión ya no lee nada (petición REST con la
  clave pública a `profiles` debe devolver 0 filas).
- Tras aplicarlo, los catálogos solo los podrá escribir un administrador.
  Hay que dar el rol `admin` a la cuenta de Dani con un SQL manual
  (`update public.profiles set role = 'admin' where email = '…'`).

### 2. Prueba completa y arreglos

Recorrer la app con una cuenta real, en móvil y en escritorio, y arreglar lo
que salga. Puntos sin verificar con datos reales:

- Crear el plan con los 75 temas de Biología y revisar que el reparto tiene
  sentido para Silvia (ritmo, repasos, práctico semanal, simulacros).
- Completar una sesión del plan y ver que el tema pasa a estudiado, sube el
  contador de repasos y se suma el XP.
- Recalcular el plan y comprobar que no toca sesiones manuales ni completadas.
- Cambiar de especialidad en Ajustes y volver.
- Recuperar contraseña de principio a fin (necesita el paso 3).

### 3. Despliegue

- Definir `NEXT_PUBLIC_SITE_URL` con el dominio final (opolab.net está en
  Vercel apuntando al proyecto anterior; decidir si este lo sustituye).
- En Supabase Auth: Site URL y, en Redirect URLs,
  `https://<dominio>/auth/recovery` y `https://<dominio>/auth/callback`.
- Decidir si se activa la confirmación por email antes de abrir al público
  (ahora está desactivada). Si se activa, configurar un remitente propio.
- Fusionar `opolab-v2` en `main` cuando la prueba completa pase.

### 4. Lo mínimo legal y de producto para abrir

- Aviso legal, política de privacidad y cookies, enlazados desde la portada y
  el registro. Borrado de cuenta desde Ajustes.
- Pantalla de Sugerencias (hoy es un relleno y no está en el menú) o quitarla.
- Panel de administración: hoy son pantallas vacías. Lo imprescindible es
  poder cargar temarios sin SQL. Hasta entonces, cada temario nuevo es un
  SQL en `supabase/proposals/`.
- Temarios reales del resto de especialidades, o esconder las que no los
  tengan para no enseñar 5 temas de relleno.

### 5. Mejoras del planificador

- Pantalla "Hoy" con las sesiones del día y el botón de completar, sin tener
  que ir al Calendario.
- Calculadora de bolas: probabilidad de que salga un tema estudiado según
  cuántos lleva y cuántas bolas saca su comunidad.
- Franjas horarias por día, como el Excel de estudio de Silvia.
- Aviso cuando el plan se queda atrás (sesiones pendientes de días pasados) y
  botón para recolocarlas.
- Parte B del examen: programación didáctica y exposición oral, que hoy la
  app no contempla.

### 6. Vídeo de presentación

Animación con las pantallas reales y voz (ElevenLabs o Silvia), para la
portada e Instagram. Hacerlo cuando los pasos 1 a 3 estén cerrados, para no
tener que rehacerlo.

### 7. Premium e IA

- Stripe: plan gratis y plan de pago. Decidir antes qué queda en cada uno.
- OpoLab Coach: grabarse exponiendo, transcripción y corrección con IA contra
  el tema del opositor. Presentarlo como compañero de ensayo, no como nota
  del tribunal. Probarlo antes con tres o cuatro exposiciones reales de Silvia.

## Cosas que conviene saber

- Next 16: leer `node_modules/next/dist/docs/` antes de escribir código.
- La base de datos solo distingue tres tipos de sesión (`study_topic`,
  `practical`, `rest`). Repasos y simulacros se reconocen por el título
  ("Repaso: …", "Simulacro: …"); ver `lib/study/sessions.ts`.
- Recalcular el plan borra solo sesiones con `is_auto_generated = true`,
  pendientes y de hoy en adelante.
- No hay clave de administrador de Supabase en el proyecto. El temario de
  Biología se pudo cargar con la clave pública solo porque las tablas están
  abiertas; cuando se aplique la seguridad, los cambios de esquema o de
  catálogo se entregan como SQL en `supabase/proposals/` para que los ejecute
  Dani.
- El proyecto Supabase se pausa por inactividad; si la API devuelve 521, hay
  que reactivarlo desde su panel.
- Hay un servidor de desarrollo que Dani suele tener abierto en el puerto
  3000; no arrancar otro encima.
- Marca y diseños: `E:\OPOLAB`. Proyecto anterior con más lógica reutilizable:
  `C:\Users\danit\opolab`.
