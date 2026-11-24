# OpoLab Planner: estado y siguientes pasos

Documento de relevo. Una sesión nueva debe leer esto antes de tocar nada.
Última actualización: 24 de noviembre de 2026.

## Qué es

Planificador para opositores a profesorado de Secundaria. Objetivo: abrir el
registro cuanto antes (enero de 2027 como tarde), empezando por Biología y
Geología. Rama de trabajo: `opolab-v2` (GitHub `opolabherramienta/opolabv2`).
`main` sigue en el estado de julio.

Se empieza por Castilla-La Mancha: Dani y Silvia son de allí (dicho por Dani
el 23 de noviembre). Al abrir, lo que tiene que estar bien es esa comunidad:
número de bolas del sorteo, fechas de su convocatoria y textos. El resto de
comunidades puede esperar, igual que el resto de especialidades.

## Qué funciona

- Registro (sin confirmación por email), login, recuperación de contraseña,
  onboarding y Ajustes. Dani lo ha probado con una cuenta real el 23 de
  noviembre y dice que va bien.
- Temas (bolas), Prácticos, Calendario, Progreso e Inicio, con la marca
  (violeta, verde, azul, ámbar; Bricolage Grotesque + Figtree).
- Plan automático de estudio: `lib/study/planner.ts`, acción en
  `app/plan/actions.ts`, botón en Inicio y Calendario.
- Pantalla Hoy (`/hoy`, 23 de noviembre): sesiones del día con botón de
  completar, lo atrasado con "Hacerla hoy", "Dejar para mañana" y un vistazo
  a mañana. Lógica en `lib/study/today.ts`; el avance del tema o práctico al
  completar está en `lib/study/progress-sync.ts`, compartido con Calendario.
  Vista con datos de ejemplo en `/dev-preview/hoy`, en escritorio y móvil;
  falta probarla con una cuenta real.
- Rachas, XP y niveles: `lib/study/gamification.ts`, calculados a partir de las
  sesiones completadas. No hay tablas de gamificación.
- Biología y Geología cargada en el catálogo con sus 75 temas (23 de
  noviembre). Las otras 5 especialidades siguen con 5 temas de relleno.
- Seguridad de la base de datos (23 de noviembre): RLS aplicada y comprobada.
  Sin sesión, las 11 tablas devuelven 401; con sesión, cada cuenta solo ve
  sus filas, lee los catálogos, no puede escribir en ellos ni ponerse el rol
  `admin`. Dani ha ejecutado también `20261123_admin_y_perfiles.sql` (su
  cuenta es `admin`) y ha borrado la cuenta de prueba.
- `/dev-preview/*`: pantallas con datos de ejemplo, solo fuera de producción.

Comprobaciones: `npm test`, `npm run lint`, `npm run typecheck`,
`npm run build`.

## Subido el 23 de noviembre (commit `ebcff9f`)

Todo lo de esta sección y la siguiente está ya en GitHub, en `opolab-v2`.
Donde diga "sin subir" o "falta el commit", ya no aplica; lo que sigue
faltando es probarlo en la app con una cuenta real.

Arreglo del recálculo del plan en `lib/study/planner.ts`,
`app/plan/actions.ts` y `tests/logic/study.test.mjs`: antes, al recalcular,
un tema estudiado desde el calendario perdía sus repasos a 3, 7, 14 y 30 días
y el plan cargaba el mismo día otro tema y un repaso. Ahora conserva los
repasos que faltan (los atrasados se quedan en uno solo), cuenta lo ya
estudiado esa semana y deja libre el tiempo de las sesiones completadas y
manuales. Cubierto por pruebas; falta el commit y verlo en la app.

También sin subir: la pantalla Hoy, este documento y lo de la sección
siguiente. Todo está en la carpeta de trabajo, sin commit. Con todo ello
pasan las 47 pruebas, tipos y lint; `npm run build` no se ha ejecutado.

## Página "próximamente" y lista de espera (23 de noviembre)

Para desplegar ya algo con la línea visual nueva sin abrir el registro.
Subida a GitHub (`opolab-v2`) el 24 de noviembre.

- Página en `components/landing/teaser.tsx`, visible siempre en
  `/proximamente`. Con `NEXT_PUBLIC_SITE_MODE=teaser` en el despliegue, la
  portada `/` enseña esa página, `/register` redirige a la portada y la
  acción de registro se niega. `/login` sigue funcionando para quien ya
  tiene cuenta (Dani, Silvia, la beta).
- Lista de espera: formulario (`components/landing/waitlist-form.tsx`) y
  acción (`app/waitlist/actions.ts`) que guarda correo, especialidad y
  comunidad en la tabla `waitlist`.
- Vista en escritorio y móvil. Dani ejecutó el SQL de la tabla `waitlist`
  el 24 de noviembre y el alta se probó en local: sale "Estás dentro". Quedó
  una fila de prueba, `prueba-claude@example.com`, que Dani puede borrar.
- Bajo el botón, el aviso de protección de datos: responsable Daniel
  González López, contacto opolabherramienta@gmail.com (24 de noviembre).

Falta para publicarla:

1. Vercel: el proyecto `opolabv2` existe desde el 24 de noviembre (equipo
   `opolabherramienta-7857s-projects`, plan Hobby), con
   las variables de Supabase, `NEXT_PUBLIC_SITE_MODE=teaser`,
   `NEXT_PUBLIC_SITE_URL` y la rama de
   producción en `opolab-v2` (cada subida a esa rama despliega).
   Desplegado y comprobado el 24 de noviembre en
   https://opolabv2.vercel.app: la portada enseña la página próximamente,
   `/register` redirige a la portada, `/login` responde, `/dev-preview` da
   404 y el formulario devuelve "Estás dentro". Sin comprobar allí: entrar
   con una cuenta real y la vista en móvil.
   Ese mismo día Dani pidió pasar opolab.net: el dominio está ya asignado
   a `opolabv2` (antes estaba en el proyecto `opolab`, que sigue existiendo
   sin dominio) y `NEXT_PUBLIC_SITE_URL` vale `https://opolab.net`.
   `www.opolab.net` no está configurado. En Supabase Auth, la Site URL es
   `https://opolab.net` y las Redirect URLs incluyen
   `https://opolab.net/auth/recovery`, `https://opolab.net/auth/callback`
   y `http://localhost:3000/**`. Sin probar en el dominio: entrar con una
   cuenta real y recuperar la contraseña de principio a fin.
   Ojo: desde ahora cada subida a `opolab-v2` sale a opolab.net.
2. La fecha "enero de 2027" y la frase "Empezamos por Biología y Geología,
   desde Castilla-La Mancha" están escritas en la página: revisarlas.
3. No hay límite de envíos por IP; el formulario solo tiene un campo trampa
   contra bots.

La página incluye el vídeo de presentación (`public/video/`), el mismo de
la portada normal.

## Dónde lo dejamos (23 de noviembre, última sesión)

Dani pidió arreglar los fallos del análisis y después hacer la limpieza. Se
cortó a mitad de los arreglos. Orden para retomar: terminar "Falta", luego
el paso 2 (limpieza), que está sin empezar.

Hecho, sin probar en la app con cuenta real:

- Una sola fecha de "hoy": `madridDateKey()` en `lib/study/sessions.ts`. La
  usan Inicio, Hoy, Calendario, Progreso y `summarizeGame` (racha y XP).
- Lectura de sesiones por páginas (`lib/supabase/fetch-all.ts`,
  `loadCalendarTasks` en `lib/study/load.ts`) en Inicio, Hoy, Calendario,
  Progreso y la acción del plan: ya no depende del tope de 1000 filas.
- Un fallo al leer el perfil ya no manda al onboarding: Hoy y Calendario
  enseñan el error; Temas, Prácticos y Progreso lanzan un error (hoy sale la
  página de error de Next; la propia es parte de la limpieza).
- Progreso cuenta solo los temas elegidos de la especialidad actual y mide
  las sesiones cumplidas sobre las que tocaban hasta hoy.
- Recalcular borra también las sesiones automáticas atrasadas.

Falta, por este orden:

1. Repaso atrasado que vuelve: pasar al planificador la fecha del último
   repaso completado (`lastReviewOnKey` en `PlanTopic`) y dar por hechos los
   repasos que vencían antes. Calcularla en `app/plan/actions.ts`.
2. Plan con pocas horas: presupuesto semanal real en `fits()` (hoy un día
   vacío admite cualquier sesión), prácticos solo si caben, y `reachesExam`
   en falso si quedan temas sin colocar.
3. Rotaciones al recalcular: ordenar prácticos por `last_worked_date` y
   simulacros por `simulation_count`.
4. Sustituir el plan sin dejarlo a medias: insertar el nuevo antes de borrar
   el viejo (por id) y deshacer si falla.
5. El "+XP" al completar: usar `getCompletionXp` (ya escrita en
   `gamification.ts`, sin usar) en Hoy y Calendario.
6. Borrar una sesión completada debe restar su repaso (llamar a
   `syncSessionProgress` con -1 en `deleteSession`).
7. La tarjeta del plan en Inicio debe seguir a la vista tras crearlo.
8. Producto: "Llevar todos los temas", marcar estudiado en Temas con XP y
   repasos, primeros pasos guiados en Inicio y fecha de examen opcional.

## Siguientes pasos, por orden

### 1. Prueba completa y arreglos

Recorrer la app con una cuenta real, en móvil y en escritorio, y arreglar lo
que salga. Puntos sin verificar con datos reales:

- Crear el plan con los 75 temas de Biología y revisar que el reparto tiene
  sentido para Silvia (ritmo, repasos, práctico semanal, simulacros). Se
  puede adelantar sin cuenta: simular el plan con el generador y revisar los
  números (temas por semana, carga de repasos, semanas que no llegan).
- Completar una sesión del plan y ver que el tema pasa a estudiado, sube el
  contador de repasos y se suma el XP.
- Recalcular el plan y comprobar que conserva los repasos y no toca sesiones
  manuales ni completadas (el arreglo de arriba).
- Pantalla Hoy con datos reales: completar, deshacer, "Dejar para mañana" y
  "Hacerla hoy", y que Inicio y Calendario reflejan el cambio.
- Cambiar de especialidad en Ajustes y volver.
- Recuperar contraseña de principio a fin (necesita el paso 3).
- Casos límite: cuenta sin temas elegidos, sin fecha de examen, con muy
  pocas horas a la semana, con el examen a menos de un mes.

### 2. Limpieza antes de abrir (rápido, no depende de nadie)

- Quitar `app/test-supabase` (página de diagnóstico).
- Sugerencias: es un relleno. Quitarla de las rutas o convertirla en un
  buzón real (ver paso 5).
- Esconder en el onboarding y en Ajustes las especialidades que solo tienen
  5 temas de relleno, o marcarlas como "próximamente".
- Páginas de error propias: `not-found`, `error` y estados de carga
  (`loading`) con la marca. Hoy saldrían las de Next por defecto.
- Metadatos para compartir: imagen Open Graph, icono de la marca (revisar
  que `favicon.ico` no es el de la plantilla), `robots` y `sitemap`.
- Cabeceras de seguridad en `next.config.ts` (CSP básica, `X-Frame-Options`,
  `Referrer-Policy`); hoy está vacío.
- `README.md` y `docs/security-foundation.md`: revisarlos y dejarlos al día
  o borrarlos.
- Copiar los SQL ya aplicados de `supabase/proposals/` a
  `supabase/migrations/` para que el esquema real quede registrado.
- Respetar `prefers-reduced-motion` en las animaciones y repasar contraste
  y foco de teclado.

### 3. Despliegue

- Definir `NEXT_PUBLIC_SITE_URL` con el dominio final (opolab.net está en
  Vercel apuntando al proyecto anterior; decidir si este lo sustituye).
- En Supabase Auth: Site URL y, en Redirect URLs,
  `https://<dominio>/auth/recovery` y `https://<dominio>/auth/callback`.
- Decidir si se activa la confirmación por email antes de abrir al público
  (ahora está desactivada). Si se activa, configurar un remitente propio.
  Si no, poner un freno a registros falsos (captcha de Supabase Auth o
  límite por IP).
- El proyecto Supabase se pausa por inactividad en el plan gratuito. Antes
  de abrir: pasar a plan de pago o programar una llamada periódica que lo
  mantenga despierto. Activar también las copias de seguridad.
- Comprobaciones automáticas en GitHub (Actions): pruebas, lint, tipos y
  build en cada subida.
- Avisos de errores en producción (Sentry o los logs de Vercel) y analítica
  sin cookies (Vercel Analytics o Plausible) para saber cuánta gente entra,
  se registra y crea plan.
- Fusionar `opolab-v2` en `main` cuando la prueba completa pase.

### 4. Lo mínimo legal y de producto para abrir

- Aviso legal, política de privacidad y cookies, enlazados desde la portada y
  el registro, con casilla de aceptación en el registro. Hacen falta los
  datos del titular (nombre o sociedad, NIF, dirección, email de contacto).
- Borrado de cuenta desde Ajustes (y exportar sus datos, si da tiempo).
- Cambiar email y contraseña desde Ajustes, si aún no se puede.
- Panel de administración: hoy son pantallas vacías. Lo imprescindible es
  cargar temarios sin SQL (pegar una lista de títulos y crear los temas) y
  ver cuántos usuarios hay. Hasta entonces, cada temario nuevo es un SQL en
  `supabase/proposals/`.
- Temarios reales del resto de especialidades. Los títulos son públicos
  (BOE, Orden de 9 de septiembre de 1993), así que se pueden preparar como
  SQL uno a uno; mirar antes si `C:\Users\danit\opolab` ya los tiene.

### 5. Beta cerrada y captación

- Probarlo primero con Silvia y 5 a 10 opositores de Biología antes de abrir
  el registro a todo el mundo.
- Botón "Cuéntanos qué falla" dentro de la app (una tabla `feedback` con
  texto y pantalla). Puede ocupar el sitio de Sugerencias.
- Lista de espera en la portada (email) mientras no esté abierto, para
  avisar el día del lanzamiento.
- Email de bienvenida al registrarse y, más adelante, recordatorio semanal
  con el plan de la semana. Necesita un remitente propio (Resend o similar).

### 6. Mejoras del planificador

- Calculadora de bolas: probabilidad de que salga un tema estudiado según
  cuántos lleva y cuántas bolas saca su comunidad.
- Franjas horarias por día, como el Excel de estudio de Silvia.
- Aviso cuando el plan se queda atrás (sesiones pendientes de días pasados) y
  botón para recolocarlas.
- Días bloqueados: vacaciones, trabajo o semanas en las que no puede
  estudiar, para que el plan los salte.
- Exportar el calendario (archivo `.ics` o enlace para Google Calendar).
- Instalable en el móvil (PWA: icono en la pantalla de inicio) y, después,
  recordatorio diario.
- Resumen semanal en Progreso: horas hechas frente a previstas y temas
  cerrados esa semana.
- Parte B del examen: programación didáctica y exposición oral, que hoy la
  app no contempla.

### 7. Vídeo de presentación

Primera versión hecha el 23 de noviembre (commit `e06536d`, subido a GitHub): 61,5 s, 1920×1080,
voz de ElevenLabs ("Cristina", castellano neutro), música y efectos del catálogo de
HyperFrames. Está en la portada, sección "OpoLab en un minuto"
(`public/video/opolab-presentacion.mp4` y su `.jpg` de carátula). El proyecto
editable es `video/film` (HyperFrames: `index.html` y `compositions/s1` a
`s8`); el máster sale en `video/film/renders/`, que no se sube a git.

Usa las capturas de `/dev-preview/*` y los datos de ejemplo: se ve "Hola,
Marta" y "Andalucía". Rehacer capturas y render cuando cambien las pantallas
o se quiera Castilla-La Mancha. Falta la versión vertical para Instagram.

### 8. Premium e IA

- Stripe: plan gratis y plan de pago. Decidir antes qué queda en cada uno.
- OpoLab Coach: grabarse exponiendo, transcripción y corrección con IA contra
  el tema del opositor. Presentarlo como compañero de ensayo, no como nota
  del tribunal. Probarlo antes con tres o cuatro exposiciones reales de Silvia.

## Debilidades detectadas (análisis del 23 de noviembre)

Revisión de todo el código. "Confirmado" es que se ve leyendo el código o
simulando el planificador; "por comprobar" depende de la configuración de
Supabase, cuyo esquema base no está en el repositorio. Nada de esto se ha
reproducido todavía en la app con una cuenta real.

Ya arreglados en código (ver "Dónde lo dejamos"): el tope de 1000 filas, las
tres definiciones de "hoy", Progreso y el fallo de red que mandaba al
onboarding. El resto sigue pendiente.

### Fallos que conviene arreglar antes de abrir

- **Tope de 1000 filas** (por comprobar): Hoy, Calendario, Inicio, Progreso
  y la acción del plan leen todas las sesiones del usuario sin límite. Un
  plan de 75 temas son unas 400 sesiones; con historial y recálculos se
  pasa de 1000 y Supabase corta por defecto ahí: desaparecerían sesiones
  futuras y el plan se calcularía con datos incompletos. Arreglo: leer por
  ventana de fechas y sacar XP y racha con una consulta aparte.
- **Repaso atrasado que vuelve** (confirmado, simulado): el plan solo sabe
  cuántos repasos se han hecho, no cuáles. Tras completar un repaso
  atrasado, recalcular lo pone otra vez hoy. Arreglo: pasar al planificador
  la fecha del último repaso completado.
- **Tres definiciones de "hoy"** (confirmado): unas pantallas usan la hora
  de Madrid, otras el reloj del servidor y otras el del navegador. Entre
  las 00:00 y las 02:00, Inicio vive en el día anterior y la racha y el XP
  no cuadran con Hoy y Calendario. Arreglo: una sola función de fecha en
  hora de Madrid para todo, incluida `summarizeGame`.
- **El plan se sustituye en dos pasos** (confirmado): borra y luego inserta.
  Si falla a medias deja el calendario vacío; dos pulsaciones a la vez (dos
  pestañas) duplican el plan. Arreglo: una función SQL que haga las dos
  cosas en una transacción.
- **Con pocas horas el plan se pasa** (confirmado, simulado): con 1 hora a
  la semana planifica 3 la primera semana y dice que se llega al examen.
  Los prácticos se colocan sin mirar si caben en el día.
- **Recalcular reinicia las rotaciones** (confirmado): quien recalcula cada
  semana recibe siempre el mismo primer práctico y el simulacro del mismo
  tema. Usar `last_worked_date`, `last_review_date` y `simulation_count`,
  que se guardan y nadie lee.
- **Deshacer y borrar desincronizan el progreso** (confirmado): desmarcar
  una sesión de estudio quita "estudiado" aunque el tema se marcara a mano;
  borrar una sesión completada no resta el repaso; con Temas abierto en
  otra pestaña, el siguiente toque pisa el contador de repasos.
- **Progreso mezcla especialidades** (confirmado) y mide las sesiones
  cumplidas sobre el total, incluidas las 400 futuras, así que crear un
  plan hunde el porcentaje. Medir sobre las vencidas hasta hoy.
- **Un fallo de red al leer el perfil manda al onboarding** (confirmado) en
  Calendario, Temas, Prácticos y Progreso. Un único
  `requireOnboardedProfile()` para las siete páginas.
- **Crear el plan desde Inicio no enseña el resultado** (confirmado
  leyendo): la tarjeta desaparece al crearse el plan y con ella el aviso de
  "no llegas con tus horas".
- Menores: el "+XP" que se enseña al completar no incluye el extra de racha
  el día que se alcanza; "Próxima sesión" del calendario cuenta completadas
  y canceladas; cada salida de un campo de texto guarda aunque no cambie
  nada y admite título vacío.

### Seguridad

Revisado sin problemas: redirecciones de las rutas de autenticación,
`/admin`, `/dev-preview` en producción y las políticas RLS.

- Todo lo que escribe el usuario va directo del navegador: puede fijar
  `completed_at`, contadores y textos de cualquier longitud. Hoy solo
  afecta a su propia cuenta (XP falsificable, abuso de almacenamiento);
  pesará con rankings o premium. Añadir límites de longitud en la base de
  datos y mover "completar" a una función del servidor.
- Se enseñan al usuario los mensajes de error de Supabase tal cual (en
  inglés y con nombres de columnas). Traducirlos y registrar el detalle.
- Cambiar la contraseña desde Ajustes no pide la actual ni cierra las otras
  sesiones.
- El registro acepta 6 caracteres (solo comprobado en el navegador) y el
  cambio de contraseña exige 8. Una sola regla, validada en el servidor.
- Si falta `NEXT_PUBLIC_SITE_URL`, el enlace de recuperación se construye
  con la cabecera de la petición. En producción debe fallar.
- Quedan `console.error` de depuración con el identificador del usuario.

### Rendimiento

- Cada cambio de pantalla descarga todas las sesiones y hace tres viajes a
  Supabase en serie antes de pintar (proxy, usuario, perfil).
- Por comprobar: que `user_topics` tenga clave única por usuario y tema.
  Si no, un doble clic crea el tema dos veces y el plan lo repite.
  Comprobar también los índices de `calendar_tasks(user_id, task_date)`.
- `calendar-client.tsx` es un solo componente de más de 1100 líneas que
  recalcula todo en cada tecla.

### Producto y experiencia

- **Elegir temas es de uno en uno**: 75 temas son unos 150 toques el primer
  día. Hace falta "Llevar todos / ninguno" y selección tocando las bolas.
- **Temas y Calendario apuntan el progreso por separado**: marcar un tema
  como estudiado en Temas no da XP ni racha ni genera repasos, y su sesión
  sigue pendiente hasta recalcular.
- **No hay primeros pasos guiados**: tras el onboarding, "Crear mi plan"
  falla con "elige primero los temas". El onboarding pide 9 campos de
  golpe, dos de ellos sin uso (`main_goal`, etapa educativa). Dejarlo en 3
  pasos y poner en Inicio una lista: temas, prácticos, plan.
- **La fecha de examen es obligatoria** y admite fechas pasadas. Muchos
  opositores no la saben hasta la convocatoria; el planificador ya funciona
  sin fecha, el formulario no.
- **El plan se queda viejo sin avisar** al cambiar de especialidad, días,
  horas, fecha o temas. Las sesiones de la especialidad anterior siguen en
  Hoy y Calendario. Aviso "Tu plan está desactualizado" con botón.
- **El aviso de "no llegas" solo sale al generar.** Con los valores por
  defecto (12 h/semana, 75 temas, examen en junio) el último tema nuevo cae
  cuatro días antes del examen, sin repasos. Guardar el resumen del plan y
  enseñarlo como semáforo en Inicio y Progreso.
- No se puede borrar un práctico ni restarle un intento.
- En Calendario, repasos y simulacros salen como "Tema", sin duración y
  con el mismo color. Hoy ya los distingue.
- Erratas y jerga: "contrasena", "sesion", "Intentalo", "Priorizar
  practicos", "Supabase no devolvio…", "onboarding" en mensajes de error.
- La racha cuenta días estudiados con hasta 6 de pausa, no días seguidos, y
  el texto no lo explica.
- El logo del menú lleva a la portada pública en vez de a Inicio.
- Accesibilidad: el bombo de Inicio son 75 números sin estado para un
  lector de pantalla; los puntos del calendario distinguen solo por color.

### Código

- El tipo de sesión (repaso, simulacro) sale del título, que el usuario
  puede editar: renombrar cambia el XP y lo que se deshace. Añadir una
  columna `session_kind`.
- No hay tipos generados de Supabase: renombrar una columna no rompe
  `typecheck`. Usar `supabase gen types`.
- El esquema base de las 11 tablas no está en el repositorio: no se puede
  recrear la base de datos ni montar una de pruebas. Volcarlo como
  migración inicial.
- Sin pruebas: cómo la acción del plan deduce fechas de estudio y repasos,
  `syncSessionProgress` y las zonas horarias (las pruebas usan la hora de
  la máquina). Ejecutarlas también con `TZ=UTC`.
- Duplicación: utilidades de fecha en seis archivos, el bloque de usuario y
  perfil en siete páginas y la fila de sesión con confeti en Calendario y
  Hoy.
- Sin uso: tablas `study_logs` y `suggestions`.

## Decisiones que tiene que tomar Dani

- Dominio: si esta versión sustituye a la que hay en opolab.net.
- Confirmación por email al registrarse, sí o no.
- Datos del titular para los textos legales.
- Qué especialidades se enseñan el día de la apertura.
- Supabase: plan de pago o mantenerlo despierto con una llamada periódica.
- Qué queda en el plan gratis y qué en el de pago.

## Cosas que conviene saber

- Next 16: leer `node_modules/next/dist/docs/` antes de escribir código.
- La base de datos solo distingue tres tipos de sesión (`study_topic`,
  `practical`, `rest`). Repasos y simulacros se reconocen por el título
  ("Repaso: …", "Simulacro: …"); ver `lib/study/sessions.ts`.
- Recalcular el plan borra las sesiones con `is_auto_generated = true` y
  pendientes, también las atrasadas (cambiado el 23 de noviembre: antes se
  quedaban para siempre en "Se te ha quedado atrás"). No toca las manuales,
  las completadas ni las canceladas.
- No hay clave de administrador de Supabase en el proyecto. Con la seguridad
  aplicada, los cambios de esquema o de catálogo se entregan como SQL en
  `supabase/proposals/` para que los ejecute Dani.
- Si la API de Supabase devuelve 521, el proyecto está pausado y hay que
  reactivarlo desde su panel.
- Hay un servidor de desarrollo que Dani suele tener abierto en el puerto
  3000; no arrancar otro encima.
- Marca y diseños: `E:\OPOLAB`. Proyecto anterior con más lógica reutilizable:
  `C:\Users\danit\opolab`.
