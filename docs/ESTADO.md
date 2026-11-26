# OpoLab Planner: estado y siguientes pasos

Documento de relevo. Una sesión nueva debe leer esto antes de tocar nada.
Última actualización: 26 de noviembre de 2026.

## Qué es

Planificador para opositores a profesorado de Secundaria. Objetivo: abrir el
registro cuanto antes (enero de 2027 como tarde), empezando por Biología y
Geología. Rama de trabajo: `opolab-v2` (GitHub `opolabherramienta/opolabv2`).
`main` sigue en el estado de julio.

Se empieza por Castilla-La Mancha: Dani y Silvia son de allí (dicho por Dani
el 23 de noviembre). Al abrir, lo que tiene que estar bien es esa comunidad:
número de bolas del sorteo, fechas de su convocatoria y textos. El resto de
comunidades puede esperar, igual que el resto de especialidades.

## Mapa de lo pendiente (24 de noviembre)

Índice para no perderse. Cinco bloques, por orden; el detalle de cada cosa
está en las secciones de más abajo. Al retomar, empezar por "Lo siguiente".

**Lo siguiente**

- Hoja de ruta con fechas hasta la apertura (11 de enero de 2027):
  `docs/ROADMAP-LANZAMIENTO.md`, propuesta el 26 de noviembre. Se revisa
  con `/lanzamiento`. Hace primero los arreglos del planificador (bloque 2)
  y deja `/admin/lista-espera` para Navidad, al revés de lo acordado el 24
  de noviembre; Dani empezó por ese orden el mismo día 26. Las fechas
  siguen pendientes de que las confirme.
- Para la próxima sesión, por este orden: 1) comprobar que los dos SQL
  del día 26 están ejecutados (Dani dijo que están bien, no consta que
  estén ejecutados) enviando un mensaje desde "Cuéntanos qué falla" y
  mirándolo en `/admin/sugerencias`; 2) probar el borrado de cuenta con
  una cuenta de usar y tirar; 3) mirar que las comprobaciones de GitHub
  salen en verde; 4) simulación con los números de Silvia. Todo lo del
  26 de noviembre está subido a `opolab-v2` y publicado en opolab.net.
- Semana 1 (26 a 29 de noviembre): arreglos 1 a 7 hechos el día 26, sin
  commit y sin probar con cuenta real (la prueba de Dani está en "Dónde lo
  dejamos"). Del punto 8 están hechos "Llevar todos / ninguno" en Temas,
  la fecha de examen opcional, los primeros pasos en Inicio y marcar
  "Estudiado" en Temas (subido en `86cb0a6`). Las erratas y la
  traducción de errores están hechas, sin commit. Queda la simulación
  con los números de Silvia.
- Commit `cb3bfad` del 26 de noviembre en `opolab-v2`, subido y
  desplegado en opolab.net ese día (portada y `/login` responden,
  `/register` sigue cerrado). `package.json` y
  `package-lock.json` (sonner y recharts, de otra sesión) quedan fuera.
- Prueba en la app de los arreglos hecha por Claude el 26 de noviembre con
  una cuenta de prueba: bien en todo salvo el arreglo 1, que no se pudo
  reproducir (detalle en "Dónde lo dejamos").
- Correo de bienvenida: funcionando en opolab.net desde el 24 de noviembre
  (detalle en el bloque 1).

**1. Captar: lista de espera** (casi hecho)

- [x] Página "próximamente" publicada en opolab.net, con vídeo.
- [x] Formulario, aviso del responsable y límite de envíos.
- [ ] Pantalla `/admin/lista-espera`: total, reparto por especialidad y
      comunidad, altas por día y exportar a CSV.
- [x] Correo de bienvenida (24 de noviembre). Sale con Resend en un alta
      nueva (`join_waitlist` devuelve `ok_new`; un correo repetido no recibe
      nada). Texto en `lib/email/welcome.ts`, envío en `lib/email/send.ts`
      (llamada directa a la API, sin dependencia nueva), remitente
      `OpoLab <hola@opolab.net>`, respuestas al Gmail. Imágenes (cabecera
      con bolas, bombo, tres iconos) en `public/email/`, dibujadas desde
      `emails/arte/` con `node emails/arte/render.mjs`.
      Configuración: dominio `opolab.net` verificado en Resend (Irlanda);
      en Namecheap, Advanced DNS, registros `resend._domainkey` (TXT),
      `rsend` y `send` (CNAME) y `_dmarc` (TXT); `RESEND_API_KEY` en el
      proyecto `opolabv2` de Vercel (hay otra, sin uso, en el proyecto viejo
      `opolab`); SQL `20261124_lista_de_espera_bienvenida.sql` ejecutado.
      No añadir el MX de "Enable receiving" de Resend: pisaría el reenvío
      de correo de Namecheap.
      Comprobado: alta desde opolab.net con un alias del Gmail y Resend lo
      marca "Delivered"; llegó a Recibidos (no a spam) de
      opolabherramienta@gmail.com y en Gmail de escritorio se ve bien, con
      las cinco imágenes. Sin comprobar: móvil, Outlook y que repetir un
      correo no envía otro.
      En local no envía (no hay clave en `.env.local`).
- [ ] Dani borra de `waitlist` las filas de prueba
      `opolabherramienta+bienvenida@gmail.com` y `...+bienvenida2@gmail.com`.
- [ ] Mandar la bienvenida a quien se apuntó antes del 24 de noviembre por
      la tarde (no la recibieron). Decide Dani.
- [ ] Aviso del día del lanzamiento: sin empezar. Hará falta pasar la lista
      a una audiencia de Resend y enlace de baja.
- [ ] `www.opolab.net` no existe (registro DNS y añadirlo en Vercel).
- [ ] Título de la pestaña en la portada: sale el genérico, no "Abrimos en
      enero de 2027".
- [ ] Dani revisa los textos "enero de 2027" y "desde Castilla-La Mancha".
- [ ] Dani borra la fila de prueba `prueba-claude@example.com` de `waitlist`.
- [ ] Ver en pantalla el mensaje del sexto intento del formulario.
- [ ] Vídeo vertical para Instagram.

**2. Que la parte gratuita funcione bien** (a medias; lo que más pesa para enero)

- [ ] Los 8 arreglos del planificador: lista "Falta, por este orden" en
      "Dónde lo dejamos".
- [ ] Limpieza antes de abrir: "Siguientes pasos", punto 2.
- [ ] Prueba completa con la cuenta de Dani y la de Silvia, en móvil y
      escritorio: "Siguientes pasos", punto 1. Incluye entrar y recuperar la
      contraseña en opolab.net, que están sin probar.
- [ ] Lo de Castilla-La Mancha: número de bolas, fechas y textos.
- [ ] Cuenta de Silvia para probar en opolab.net desde cualquier ordenador
      (pedido por Dani el 24 de noviembre). El registro está cerrado, así
      que Dani la crea en Supabase > Authentication > Users > Add user >
      Create new user, con "Auto Confirm User". El perfil lo crea el trigger
      de registro con el nombre vacío; ponerlo con
      `update public.profiles set full_name = 'Silvia' where email = '…';`.
      Ella entra por opolab.net/login ("Ya tengo acceso") y hace la
      configuración inicial.

**3. Abrir el registro** (sin empezar)

- [ ] Aviso legal, privacidad y cookies, con casilla en el registro
      (escritos el 26 de noviembre; falta que Dani los confirme).
- [ ] Borrado de cuenta desde Ajustes (hecho el 26 de noviembre; falta el
      SQL y probarlo).
- [ ] Decidir si se confirma el correo al registrarse (Dani).
- [ ] Que Supabase no se pause: plan de pago o llamada periódica (Dani).
      Ya afecta: si se pausa, el formulario público deja de guardar.
- [ ] Comprobaciones automáticas en GitHub (hechas el 26 de noviembre,
      sin estrenar) y avisos de errores (sin empezar).
- [ ] Quitar `NEXT_PUBLIC_SITE_MODE=teaser` en Vercel el día que se abra.
- [ ] Fusionar `opolab-v2` en `main`.

**4. Beta y lanzamiento** (sin empezar)

- [ ] Beta cerrada con Silvia y 5 a 10 opositores de Biología.
- [ ] Botón "Cuéntanos qué falla" dentro de la app.
- [ ] Aviso a la lista de espera el día de la apertura.
- [ ] Decidir qué especialidades se enseñan al abrir (Dani).

**5. Parte de pago** (sin empezar; no tocar hasta que el registro esté abierto)

- [ ] Probar el Coach con tres o cuatro exposiciones reales de Silvia.
- [ ] Construir el Coach de exposición.
- [ ] Decidir precio y qué más lleva el plan de pago (Dani).
- [ ] Pagos con Stripe.
- Detalle y criterio gratis/pago: "Siguientes pasos", punto 8.

Mejoras del planificador sin fecha (calculadora de bolas, franjas horarias,
días bloqueados, exportar calendario, PWA, parte B): "Siguientes pasos",
punto 6.

## Buzón de Silvia

Ideas, fallos, dudas y datos de oposiciones que Silvia apunta con `/silvia`
(ver `.claude/skills/silvia/SKILL.md`). Claude añade cada entrada al final
de "Sin revisar por Dani" con su valoración (esfuerzo, gratis o pago,
cuándo encaja). Dani las revisa: las pasa al mapa de arriba, las descarta o
las deja en "Revisado" con su decisión. Qué hace hoy la app, pantalla a
pantalla y en llano: `docs/MAPA-FUNCIONAL.md`.

### Sin revisar por Dani

(Vacío.)

### Revisado

(Vacío.)

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
3. Límite de envíos (24 de noviembre): hecho. Dani ejecutó
   `supabase/proposals/20261124_lista_de_espera_limite.sql`, que crea la
   función `join_waitlist` (5 intentos por hora desde la misma conexión,
   300 por hora en total) y cierra la inserción directa en `waitlist`. La
   acción manda un resumen diario de la IP, no la IP; se guarda en
   `waitlist_attempts` y se borra al día. Comprobado contra la base de
   datos: cinco intentos entran, el sexto devuelve `rate_limited`, la
   inserción directa da permiso denegado y el alta desde opolab.net
   funciona. Sin ver: el mensaje del sexto intento en pantalla.

### Correo de bienvenida y gestión de la lista (pendiente, pedido por Dani el 24 de noviembre)

Dani quiere que quien se apunte reciba un correo cuidado (qué es OpoLab, qué
costará, que avisaremos al abrir) y tener la lista controlada. Propuesta,
sin empezar; es una sesión aparte:

- Envío con Resend (u otro similar) desde la acción del formulario, tras un
  alta nueva. Necesita de Dani: cuenta, registros DNS de opolab.net en su
  registrador para enviar como `hola@opolab.net`, y la clave como variable
  secreta en Vercel. opolab.net no tiene buzón: las respuestas irían al Gmail.
- El mismo servicio guarda los contactos como audiencia y permite el envío
  masivo del día del lanzamiento con enlace de baja, que es obligatorio. No
  hace falta un CRM aparte para esto.
- Pantalla de administración `/admin/lista-espera`: total, reparto por
  especialidad y comunidad, altas por día y exportar a CSV. La cuenta admin
  ya puede leer la tabla.
- Antes de escribir el correo hay que decidir qué se dice del precio: hoy
  no hay nada decidido sobre el plan gratis y el de pago.
- El aviso legal del formulario habla solo de avisar del lanzamiento; un
  correo de bienvenida encaja, una serie de correos comerciales no.

La página incluye el vídeo de presentación (`public/video/`), el mismo de
la portada normal.

## Dónde lo dejamos (23 de noviembre, última sesión)

Dani pidió arreglar los fallos del análisis y después hacer la limpieza. Se
cortó a mitad de los arreglos. Orden para retomar: terminar "Falta", luego
el paso 2 (limpieza), que está sin empezar. El 24 de noviembre no se tocó
nada de esto: la sesión fue la página pública, Vercel, el dominio y el
límite del formulario. El 26 de noviembre Dani empezó la semana 1 de la
hoja de ruta por estos arreglos, así que `/admin/lista-espera` queda para
Navidad, como propone la hoja de ruta.

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
- Arreglo 1, repaso atrasado que vuelve (26 de noviembre, sin commit):
  `app/plan/actions.ts` calcula el día del último repaso completado de cada
  tema y lo pasa como `lastReviewOnKey` en `PlanTopic`. El planificador da
  por hechos los repasos que vencían ese día o antes, y cuenta desde ese día
  las dos semanas hasta el siguiente repaso de mantenimiento. Esto último
  cubre también dos casos que no estaban apuntados: el tema con los cuatro
  repasos hechos y el tema marcado como estudiado en Temas, a los que el
  repaso de mantenimiento recién hecho les volvía a salir al recalcular.
  Prueba nueva en `tests/logic/study.test.mjs` (falla sin el arreglo); pasan
  las 50 pruebas, tipos, lint y `npm run build`. Para verlo en la app:
  completar un repaso atrasado en Hoy, recalcular y comprobar que no vuelve.

- Arreglo 2, plan con pocas horas (26 de noviembre, sin commit), en
  `lib/study/planner.ts`:
  - Cada semana tiene como tope las horas semanales (`weekRemaining`). La
    semana de hoy y la del examen, que suelen ser más cortas, reciben su
    parte proporcional. Única excepción: una semana vacía admite una sesión
    más larga que su tope, para que con media hora a la semana el plan no
    se quede sin temas.
  - Con poco tiempo van primero los temas. El práctico semanal solo entra
    si después queda sitio para un tema con sus cuatro repasos (con los
    valores por defecto, desde 4,5 h a la semana); el simulacro, si además
    cabe él (desde 4 h sin prácticos, 5,5 h con ellos). Cuando ya no quedan
    temas nuevos, entran en cuanto caben.
  - Si hay prácticos y ninguno ha cabido, el resumen lo dice
    (`practicalsLeftOut`) y la tarjeta del plan enseña un aviso
    (`components/plan/GeneratePlanCard.tsx`). El texto es de Claude: que
    Dani lo revise.
  - `reachesExam` pasa a falso si quedan temas sin colocar antes del
    examen. Sin fecha de examen, o con el examen a más de 40 semanas, solo
    "quedan para más adelante".
  - Las horas que "harían falta" cuentan siempre el práctico semanal, para
    que la cifra no suba cuando el usuario sube sus horas.
  - Simulado con 20 temas y examen en junio: antes, con 1, 2 o 3 horas el
    plan metía entre 3 y 5 horas cada semana; ahora ninguna semana pasa del
    tope. Con 12 horas y 75 temas el plan sale igual que antes. Cuatro
    pruebas nuevas; pasan las 54, tipos, lint y `npm run build`.
  - Para verlo en la app: poner 2 horas a la semana en Ajustes, recalcular
    y mirar en Calendario que ninguna semana pasa de 2 horas y que sale el
    aviso de los prácticos.
  - Visto al simular, sin tocar: con los valores por defecto (12 h, 75
    temas, examen en junio) el plan dice "no llegas, harían falta 14 horas"
    aunque coloca los 75 temas, el último cuatro días antes del examen. Es
    lo que hay que mirar en la simulación con los números de Silvia.

- Arreglo 3, rotaciones al recalcular (26 de noviembre, sin commit):
  - Prácticos: `app/plan/actions.ts` lee `last_worked_date` y
    `times_worked` y el planificador empieza por el que lleva más tiempo
    sin tocar (primero los nunca trabajados; a igualdad, el de menos
    intentos).
  - Simulacros: cada uno va al tema estudiado con menos simulacros
    (`simulation_count` más los que reparte el propio plan); a igualdad, el
    estudiado antes.
  - Prueba nueva (falla sin el arreglo); pasan las 55, tipos, lint y
    `npm run build`.
  - Límite conocido: `last_worked_date` solo se guarda al completar un
    práctico desde Hoy o Calendario. Sumar un intento a mano en Prácticos
    no la toca, así que ahí solo cuenta el número de intentos.
  - Sin comprobar contra la base de datos real: que las columnas
    `last_worked_date` y `times_worked` de `user_practicals` se leen bien
    (el esquema no está en el repositorio; el código ya las escribía). Si
    faltara alguna, crear el plan daría "No se pudieron leer tus temas y
    prácticos". Para verlo en la app: completar el práctico de esta semana,
    recalcular y comprobar que el siguiente es otro.

- Arreglo 4, sustituir el plan sin dejarlo a medias (26 de noviembre, sin
  commit): `lib/study/replace-plan.ts`, usado desde `app/plan/actions.ts`.
  - Primero se guarda el plan nuevo entero y solo después se borran, por
    id, las sesiones pendientes del anterior. El calendario nunca se queda
    vacío.
  - Si falla el guardado, se borra lo que se hubiera escrito del nuevo y el
    plan anterior queda como estaba ("Tu plan anterior sigue como estaba").
  - Si falla el borrado del anterior (se reintenta una vez), el plan nuevo
    queda entero y sobran sesiones viejas; el mensaje pide volver a crear
    el plan, que las limpia.
  - Tres pruebas nuevas con una base de datos simulada que falla a
    propósito; pasan las 58, tipos, lint y `npm run build`.
  - Sin comprobar contra Supabase: el guardado pide ahora los id de las
    filas nuevas (`insert(...).select("id")`), que necesita permiso de
    lectura sobre las filas propias; la RLS lo da, pero no se ha ejecutado.
    Para verlo en la app: recalcular con plan ya creado y comprobar que no
    quedan sesiones duplicadas ni desaparece nada.
  - No resuelto: dos pulsaciones a la vez desde dos pestañas siguen
    pudiendo duplicar el plan (el botón se desactiva mientras guarda, así
    que hace falta otra pestaña). Volver a crear el plan lo limpia. El
    arreglo de fondo es una función SQL en una transacción, que tendría que
    ejecutar Dani; apuntado para después de la beta si no molesta antes.

- Arreglo 5, el "+XP" al completar (26 de noviembre, sin commit): Hoy
  (`components/today/today-client.tsx`) y Calendario
  (`components/calendar/calendar-client.tsx`) enseñan lo que de verdad sube
  el total, con `getCompletionXp`. Antes usaban la racha de antes de
  completar, así que el día que la racha llegaba a 5 enseñaban 20 y se
  sumaban 25. Prueba nueva; pasan las 59, tipos, lint y `npm run build`.
  Visto en `/dev-preview/hoy`: al completar un tema sale "+25 XP", sin
  errores en consola. Sin ver: Calendario (no tiene vista de ejemplo) y una
  cuenta real.

- Arreglo 6, borrar una sesión completada resta su progreso (26 de
  noviembre, sin commit): `deleteSession` en
  `components/calendar/calendar-client.tsx` llama a `syncSessionProgress`
  con -1 cuando `revertsProgressOnDelete` (`lib/study/progress-sync.ts`)
  dice que toca. Borrar un repaso, un simulacro o un práctico completados
  resta uno a su contador, igual que desmarcarlos. Borrar una sesión de
  estudio completada quita "estudiado" al tema solo si no queda otra sesión
  de estudio completada de ese tema (criterio de Claude, para no perder el
  estudiado al limpiar una sesión repetida). Si el borrado va bien y falla
  el progreso, el aviso dice "La sesión se ha eliminado, pero…". Prueba
  nueva de la decisión; pasan las 60, tipos, lint y `npm run build`. Sin
  ver en pantalla: Calendario no tiene vista de ejemplo. Para verlo en la
  app: completar un repaso, borrarlo en Calendario y mirar en Temas que el
  contador de repasos baja.
  Sigue pendiente de la misma debilidad: desmarcar una sesión de estudio
  quita "estudiado" aunque el tema se marcara a mano en Temas, y Temas
  abierto en otra pestaña puede pisar el contador.

- Arreglo 7, la tarjeta del plan en Inicio (26 de noviembre, sin commit):
  `components/dashboard/dashboard-view.tsx` enseña siempre
  `GeneratePlanCard`, como Calendario. Antes solo salía sin plan, así que
  al crearlo desaparecía con su resumen y sus avisos ("no llegas", "no
  caben prácticos"). Con plan, la tarjeta es "Tu plan de estudio" con el
  botón "Recalcular plan". Visto en `/dev-preview/inicio`. Sin ver: crear
  el plan con una cuenta real y que el resumen se quede en pantalla.

Prueba de Dani en la app para dar por buenos los siete (unos 10 minutos,
con su cuenta, en local o en opolab.net cuando esté subido):

1. Inicio > "Crear mi plan" (o "Recalcular plan"): el resumen se queda en
   pantalla (7) y no hay error al leer los prácticos (3).
2. Calendario: no hay sesiones duplicadas ni ha desaparecido nada (4).
3. Hoy: completar un tema y mirar que el "+XP" coincide con lo que sube el
   total en Inicio (5).
4. Completar un repaso atrasado, recalcular y ver que no vuelve (1).
5. Completar el práctico de la semana, recalcular y ver que el siguiente
   es otro (3).
6. Calendario: borrar un repaso completado y ver en Temas que su contador
   baja (6).
7. Ajustes: poner 2 horas a la semana, recalcular y ver que ninguna semana
   pasa de 2 horas y que sale el aviso de los prácticos (2). Volver a
   dejar las horas como estaban y recalcular.

Punto 8, "Llevar todos / ninguno" en Temas (26 de noviembre, sin commit):
`components/topics/topics-client.tsx`, función `selectAll`. Dos botones en
la tarjeta de arriba: "Llevar todos" (o "Llevar todos los demás" si ya hay
alguno) y "No llevar ninguno", que pide confirmación. Solo cambia
`is_selected`; resumen, estudiado, repasos y notas no se tocan. Guarda en
bloque: actualiza por id las filas que existen e inserta las que faltan
(no usa `upsert` porque no está comprobado que `user_topics` tenga clave
única por usuario y tema). Visto en `/dev-preview/temas`, escritorio y
móvil. Sin probar: el guardado, que necesita una cuenta real. Falta del
mismo apartado: elegir tocando las bolas del bombo (no se ha hecho; hoy la
bola abre el tema).

Punto 8, fecha de examen opcional (26 de noviembre, sin commit):
`app/onboarding/actions.ts` y `components/onboarding/OnboardingForm.tsx`
(el mismo formulario sirve para el onboarding y para Ajustes). El campo
pasa a "Fecha del examen (si la sabes)", ya no es obligatorio y el
calendario del navegador no deja elegir días pasados. El servidor guarda
`null` si viene vacía y rechaza una fecha pasada o mal escrita con un
mensaje propio. Inicio, sin fecha, dice "Sin fecha de examen" y que el plan
funciona igual. Probado con la cuenta de prueba en Ajustes: guardar sin
fecha (la columna `opposition_date` admite nulos), crear el plan sin fecha
(447 sesiones hasta el horizonte de 40 semanas), rechazo de una fecha
pasada, y vuelta al 1 de junio. Sin probar: el onboarding con una cuenta
recién creada. Ojo: quien ya tenga guardada una fecha pasada no podrá
guardar otros ajustes hasta cambiarla o vaciarla; el mensaje lo explica.

Punto 8, primeros pasos en Inicio (26 de noviembre):
`components/dashboard/dashboard-view.tsx`, componente `FirstSteps`.
Mientras no hay plan, Inicio enseña "Tus primeros pasos": 1) elegir temas,
2) apuntar prácticos (opcional), 3) crear el plan. Cada paso hecho sale con
su marca y el que toca, resaltado con su botón. La tarjeta "Crear mi plan"
solo aparece cuando hay temas o prácticos, así que ya no se puede pulsar
para recibir "elige primero los temas". Con plan, la lista desaparece.
Vistas de ejemplo nuevas: `/dev-preview/inicio?paso=1`, `?paso=2` y
`?paso=3` (sin parámetro, la de siempre, que usa el vídeo). Visto en
escritorio y móvil. Sin probar: una cuenta recién creada de principio a
fin. No se ha tocado el onboarding (sigue pidiendo `main_goal` y la etapa,
que no se usan): reducirlo a 3 pasos queda pendiente.

Punto 8, "Estudiado" en Temas (26 de noviembre, sin commit):
`syncTopicStudied` y `studiedSessionChange` en `lib/study/progress-sync.ts`,
llamadas desde `components/topics/topics-client.tsx`. Al marcar un tema
como estudiado en Temas, su sesión de estudio pendiente del plan pasa a
completada y se trae a hoy; si no tiene sesión, se escribe una completada
con la descripción "Marcado como estudiado en Temas.". Con eso suma XP y
racha (que salen de las sesiones completadas) y el plan sabe qué día se
estudió, así que al recalcular entran sus repasos a 3, 7, 14 y 30 días. Al
desmarcar se deshace: la sesión del plan vuelve a pendiente y la escrita
por Temas se borra; una sesión escrita a mano por el usuario no se toca.
Temas enseña un aviso con enlace a Inicio para recalcular (no recalcula
solo). Prueba nueva de la decisión; pasan las 61, tipos, lint y build.
Probado con la cuenta de prueba: marcar el Tema 2 (con sesión en el plan)
y el 75 (sin sesión) sube el XP de 35 a 55 y a 75 y los dos salen en Hoy
como hechos; desmarcarlos lo devuelve a 35. Sin comprobar en pantalla: las
fechas de los repasos tras recalcular con un tema marcado (lo cubren las
pruebas del planificador). Límite: los repasos no entran hasta que el
usuario recalcula.

Erratas y mensajes en inglés (26 de noviembre, sin commit):

- `lib/errors.ts`, función `friendlyError`: convierte los errores de
  Supabase y de red en una frase en castellano (credenciales incorrectas,
  correo ya registrado, contraseña corta, sin conexión, sesión caducada,
  sin permiso, demasiados intentos). Lo que no reconoce sale como
  "Inténtalo de nuevo en un momento.". El texto original, en inglés y con
  nombres de tablas, ya no llega a la pantalla: se escribe en la consola.
- La usan las seis páginas privadas al cargar, las acciones de registro,
  entrada, contraseña, configuración y plan, y Calendario, Temas y
  Prácticos al guardar.
- Erratas: "contrasena", "sesion", "Intentalo", "Supabase no devolvio…" y
  "onboarding" en los mensajes. En el formulario de configuración,
  "Priorizar prácticos" y "Preparación general" se leen con tilde; el
  valor guardado en la base de datos sigue sin ella para no romper los
  perfiles que ya existen.
- Pruebas: una nueva de `friendlyError`, y la de seguridad del registro
  comprueba ahora que el texto de Supabase no sale. Pasan las 62, tipos,
  lint y build. Sin ver en pantalla (provocar un error de entrada exige
  escribir una contraseña).
- Queda del mismo apartado: los `console.error` de depuración con el
  identificador del usuario en Calendario y Temas, y la página
  `app/test-supabase`, que se quita en la limpieza.

Sesión del 26 de noviembre, segunda parte (subida ese día). Dani pidió
adelantar lo que no depende de Silvia. Pasan las 62 pruebas, tipos, lint y
`npm run build`; visto en local en desarrollo y con la versión de producción
(`npm run start`, configuración `opolab-prod` en `.claude/launch.json`).

- Seguridad: `next.config.ts` manda cabeceras en todas las páginas (CSP,
  `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, HSTS) y quita `X-Powered-By`. La CSP solo admite
  recursos del propio dominio y llamadas a `*.supabase.co`; si algún día se
  añade analítica, un vídeo externo o fuentes de fuera, hay que abrirla ahí.
  Con la versión de producción en local, portada, Inicio, Temas y
  Calendario cargan sin avisos de CSP en consola. El registro exige ya 8
  caracteres en el servidor, igual que el cambio de contraseña. Fuera los
  `console.error` con el identificador del usuario y lo que enviaba.
- Limpieza: borrada `app/test-supabase`. Página 404 propia
  (`app/not-found.tsx`), página de error (`app/error.tsx`) y esqueleto de
  carga de las pantallas privadas (`app/(private)/loading.tsx`). La portada
  en modo próximamente titula "OpoLab · Abrimos en enero de 2027". Las
  especialidades con menos de 20 temas salen como "(próximamente)" y no se
  pueden elegir (`lib/onboarding/data.ts`); hoy solo se ofrece Biología y
  Geología.
- Icono: `app/icon.svg`, `app/favicon.ico` y `app/apple-icon.png`, con la
  probeta del logo en blanco sobre el violeta de la marca y el líquido en
  verde. Sustituye al de la plantilla.
- Borrado de cuenta: tarjeta en Ajustes (`DeleteAccountCard`), que pide
  escribir BORRAR, y acción `app/account/actions.ts`, que llama a la función
  `delete_my_account()`. NO FUNCIONA hasta que Dani ejecute
  `supabase/proposals/20261126_borrar_cuenta.sql`; mientras, responde "No
  se pudo borrar la cuenta. No se ha eliminado nada". Sin probar de
  principio a fin: hay que hacerlo con una cuenta de usar y tirar. La
  cuenta admin no se puede borrar desde ahí.
- "Cuéntanos qué falla": `/sugerencias` es ahora un formulario
  (`FeedbackForm`), con un enlace al pie de todas las pantallas privadas
  que recuerda desde cuál se escribe. Los mensajes se leen en
  `/admin/sugerencias`. NO GUARDA hasta que Dani ejecute
  `supabase/proposals/20261126_feedback.sql`; probado que, sin la tabla,
  avisa con un mensaje claro y no borra lo escrito. Límite: 10 mensajes por
  hora y cuenta.
- GitHub: `.github/workflows/comprobaciones.yml` pasa lint, tipos, pruebas
  (con `TZ=UTC`) y build en cada subida a `opolab-v2` o `main` y en cada
  pull request. Sin estrenar: se verá en la primera subida. Si GitHub
  rechaza esa subida por permisos, falta dar al acceso de git permiso para
  tocar workflows.
- Textos legales a nombre de ALHAJA PRODUCCIONES SC (datos en
  `lib/legal.ts`): `/aviso-legal`, `/privacidad` y `/cookies`, enlazados en
  el pie de la portada, de las pantallas de entrada y de las privadas. El
  registro lleva casilla obligatoria de aceptación, comprobada en el
  servidor. El aviso bajo el formulario de la lista de espera y el pie del
  correo de bienvenida nombran ya a la sociedad y a
  hola@alhajaproducciones.com (antes, Daniel González López y el Gmail).
  Los ha redactado Claude, que no es abogado. Dani tiene que confirmar:
  1. Que el responsable de la lista de espera pasa a ser la sociedad y que
     las peticiones de datos van a hola@alhajaproducciones.com.
  2. Plazos que Claude ha puesto por su cuenta: lista de espera, doce
     meses como máximo; copias de seguridad, treinta días.
  3. Que Supabase, Vercel y Resend son los únicos proveedores, y en qué
     región está el proyecto de Supabase (el texto dice que algunos
     proveedores están en Estados Unidos).
  4. La edad mínima (14 años) y la frase de que no se usa analítica: si se
     añade, hay que cambiar la política de cookies.
  Dani los dio por buenos el 26 de noviembre ("los textos están bien"),
  incluido el cambio de responsable, y se publicaron ese día. Sigue
  siendo recomendable que los revise alguien que sepa antes de abrir el
  registro.
- Lista de lo que tiene que mirar Silvia, aparte de los fallos:
  `docs/REVISION-SILVIA.md`.

Corrección: `/dev-preview/calendario` existe (más arriba se dice que
Calendario no tiene vista de ejemplo). Los arreglos 5 y 6 no se han mirado
allí.

Prueba en la app, hecha por Claude el 26 de noviembre en local
(`localhost:3000`, base de datos real) con una cuenta de prueba que creó
Dani (Biología, Castilla-La Mancha, examen el 1 de junio de 2027, 12 h,
cinco días). Resultado:

- "Llevar todos los demás": pasa de 3 a 75 temas y se mantiene al recargar.
- Crear y recalcular el plan (arreglos 3, 4 y 7): sin errores; 366
  sesiones; el resumen y el aviso se quedan en Inicio. Recalcular tres
  veces deja siempre el mismo número de pendientes (sin duplicados) y la
  sesión manual atrasada de la cuenta sigue en su sitio.
- "+XP" (5): en Calendario, completar un repaso enseña "+10 XP" y el total
  sube de 20 a 30; un práctico, "+15 XP". En Hoy no había sesiones ese
  día (jueves no es día de estudio en la cuenta): visto solo en ejemplo.
- Borrar (6): al borrar el repaso completado, "Repasos hechos" baja de 5 a
  4 y el XP vuelve a 20. Al recalcular, ese repaso vuelve a planificarse.
- Rotación (3): con dos prácticos, tras completar el primero y recalcular,
  el siguiente (4 de diciembre) es el otro.
- Pocas horas (2): con 2 h a la semana salen 87 sesiones, 18 temas a 1 por
  semana, 0 prácticos y 0 simulacros, el aviso de "no llegas" (56 sin
  planificar) y el de los prácticos. Las horas se devolvieron a 12 y se
  recalculó.
- Sin reproducir: el arreglo 1 (no había repasos atrasados; solo lo cubren
  las pruebas), los simulacros de la rotación y los caminos de fallo del
  arreglo 4.
- Visto de paso: con 12 h, 75 temas y examen el 1 de junio el plan dice "no
  llegas, harían falta 14 horas" y deja 7 temas sin planificar. En "Lo
  siguiente" de Inicio, dos temas del mismo día salieron como Tema 3 y
  luego Tema 2.
- La cuenta de prueba queda con 75 temas elegidos, un práctico añadido
  ("Práctico de prueba 2"), un práctico completado y un repaso borrado.
  Dani puede borrarla en Supabase cuando no haga falta.

Falta, por este orden (del 1 al 7 están hechos, arriba; se sigue por el 8):

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
- Lista de espera en la portada: hecha el 24 de noviembre (ver "Página
  próximamente"). Falta el aviso del día del lanzamiento.
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

- Criterio de Dani (24 de noviembre): todo lo que hay hoy (temario,
  prácticos, calendario, plan, Hoy, progreso) es la parte gratuita y sirve
  para captar. La parte de pago llega después y su pieza principal es el
  Coach: exponer el tema ante una IA que hace de tribunal. Propuesta de
  Claude, sin decidir: de pago lo que corrige y cuesta dinero por uso
  (Coach de exposición, corrección del tema escrito, preguntas de repaso
  generadas del tema, defensa de la programación); gratis lo que organiza.
  Precio sin decidir.
- Stripe: plan gratis y plan de pago, cuando exista la primera pieza de pago.
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
- **Repaso atrasado que vuelve** (arreglado el 26 de noviembre, ver "Dónde
  lo dejamos"; confirmado, simulado): el plan solo sabía
  cuántos repasos se han hecho, no cuáles. Tras completar un repaso
  atrasado, recalcular lo pone otra vez hoy. Arreglo: pasar al planificador
  la fecha del último repaso completado.
- **Tres definiciones de "hoy"** (confirmado): unas pantallas usan la hora
  de Madrid, otras el reloj del servidor y otras el del navegador. Entre
  las 00:00 y las 02:00, Inicio vive en el día anterior y la racha y el XP
  no cuadran con Hoy y Calendario. Arreglo: una sola función de fecha en
  hora de Madrid para todo, incluida `summarizeGame`.
- **El plan se sustituye en dos pasos** (arreglado el 26 de noviembre salvo
  las dos pestañas a la vez, ver "Dónde lo dejamos"; confirmado): borra y luego inserta.
  Si falla a medias deja el calendario vacío; dos pulsaciones a la vez (dos
  pestañas) duplican el plan. Arreglo: una función SQL que haga las dos
  cosas en una transacción.
- **Con pocas horas el plan se pasa** (arreglado el 26 de noviembre, ver
  "Dónde lo dejamos"; confirmado, simulado): con 1 hora a
  la semana planifica 3 la primera semana y dice que se llega al examen.
  Los prácticos se colocan sin mirar si caben en el día.
- **Recalcular reinicia las rotaciones** (arreglado el 26 de noviembre, ver
  "Dónde lo dejamos"; confirmado): quien recalcula cada
  semana recibe siempre el mismo primer práctico y el simulacro del mismo
  tema. Usar `last_worked_date`, `last_review_date` y `simulation_count`,
  que se guardan y nadie lee.
- **Deshacer y borrar desincronizan el progreso** (confirmado): desmarcar
  una sesión de estudio quita "estudiado" aunque el tema se marcara a mano;
  borrar una sesión completada no resta el repaso (esto último, arreglado
  el 26 de noviembre); con Temas abierto en
  otra pestaña, el siguiente toque pisa el contador de repasos.
- **Progreso mezcla especialidades** (confirmado) y mide las sesiones
  cumplidas sobre el total, incluidas las 400 futuras, así que crear un
  plan hunde el porcentaje. Medir sobre las vencidas hasta hoy.
- **Un fallo de red al leer el perfil manda al onboarding** (confirmado) en
  Calendario, Temas, Prácticos y Progreso. Un único
  `requireOnboardedProfile()` para las siete páginas.
- **Crear el plan desde Inicio no enseña el resultado** (arreglado el 26 de
  noviembre; confirmado
  leyendo): la tarjeta desaparece al crearse el plan y con ella el aviso de
  "no llegas con tus horas".
- Menores: el "+XP" que se enseña al completar no incluye el extra de racha
  el día que se alcanza (arreglado el 26 de noviembre); "Próxima sesión" del calendario cuenta completadas
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
- (Arreglado el 26 de noviembre con `lib/errors.ts`.) Se enseñaban al
  usuario los mensajes de error de Supabase tal cual (en inglés y con
  nombres de columnas). Traducirlos y registrar el detalle.
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
- **Temas y Calendario apuntan el progreso por separado** (arreglado el
  26 de noviembre para "Estudiado"): marcar un tema
  como estudiado en Temas no da XP ni racha ni genera repasos, y su sesión
  sigue pendiente hasta recalcular.
- **No hay primeros pasos guiados**: tras el onboarding, "Crear mi plan"
  falla con "elige primero los temas". El onboarding pide 9 campos de
  golpe, dos de ellos sin uso (`main_goal`, etapa educativa). Dejarlo en 3
  pasos y poner en Inicio una lista: temas, prácticos, plan.
- **La fecha de examen es obligatoria** (arreglado el 26 de noviembre) y admite fechas pasadas. Muchos
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
- (Arreglado el 26 de noviembre.) Erratas y jerga: "contrasena", "sesion", "Intentalo", "Priorizar
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
- Precio del plan de pago y qué piezas lleva además del Coach (el criterio
  general ya está: ver "Premium e IA").

## Cosas que conviene saber

- Next 16: leer `node_modules/next/dist/docs/` antes de escribir código.
- La base de datos solo distingue tres tipos de sesión (`study_topic`,
  `practical`, `rest`). Repasos y simulacros se reconocen por el título
  ("Repaso: …", "Simulacro: …"); ver `lib/study/sessions.ts`.
- Recalcular el plan guarda primero el nuevo y después borra, por id, las
  sesiones con `is_auto_generated = true` y pendientes, también las atrasadas (cambiado el 23 de noviembre: antes se
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
