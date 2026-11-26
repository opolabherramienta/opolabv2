# OpoLab: qué hace la app, pantalla a pantalla

Auditoría funcional en lenguaje llano, para Silvia y para cualquiera que no
programe. Hecha leyendo el código el 24 de noviembre de 2026. Si algo de
aquí no coincide con lo que ves en la app, manda la app: díselo a Claude con
`/silvia` y lo corregimos.

Leyenda: ✅ lo hace · ⚠️ a medias o con fallos conocidos · ❌ no lo hace.
Lo que está pendiente y su orden está en `docs/ESTADO.md`.

## Lo que ve hoy el público (opolab.net)

La web está en modo "próximamente": no se puede crear cuenta. Quien ya
tiene cuenta (Dani, Silvia, la beta) entra por "Ya tengo acceso".

**Página "próximamente"**
- ✅ Dice "Abrimos en enero de 2027" y "Empezamos por Biología y Geología,
  desde Castilla-La Mancha. Los 75 temas ya están dentro".
- ✅ Explica el bombo, el plan que se hace solo, los repasos a los 3, 7, 14
  y 30 días y la racha, experiencia y niveles. Con el vídeo de un minuto.
- ✅ Formulario de lista de espera: correo (obligatorio), especialidad y
  comunidad (opcionales, con "Prefiero no decirlo") y casilla de
  consentimiento.
  - Especialidades del formulario (lista fija): Biología y Geología, Física
    y Química, Matemáticas, Lengua, Geografía e Historia, Inglés, Educación
    Física, Tecnología, Orientación Educativa y "Otra".
  - Comunidades: las 17 más Ceuta y Melilla.
- ✅ Al apuntarse llega un correo de bienvenida ("Estás dentro"). Dice que
  el planificador será gratis y que más adelante habrá un Coach de pago para
  ensayar la exposición. Si alguien repite correo, no recibe otro.
- ✅ Freno a abusos: 5 intentos por hora desde la misma conexión.
- ❌ Darse de baja de la lista uno mismo (hay que escribir por correo).

**Entrar y contraseña**
- ✅ Entrar con correo y contraseña. "He olvidado mi contraseña" manda un
  enlace por correo.
- ⚠️ Recuperar la contraseña en opolab.net está sin probar de principio a fin.
- ⚠️ Algunos errores salen en inglés o sin tildes ("sesion").
- ❌ Entrar con Google, "recordarme".

## Primera vez: configurar la oposición

Obligatorio antes de usar la app. Pide 9 cosas de golpe:
- Etapa educativa, especialidad, comunidad autónoma.
- Fecha del examen (**obligatoria**; ⚠️ muchos opositores no la saben aún).
- Horas por semana (12 por defecto) y días de la semana que estudias.
- Minutos por tema (60) y por práctico (90).
- Objetivo principal (primera vuelta, repasar, prácticos, simulacros,
  preparación general).

Cosas a saber:
- ⚠️ **La comunidad no cambia nada**: ni número de bolas, ni fechas, ni el
  plan. Solo se enseña en Inicio.
- ⚠️ **El objetivo principal se guarda pero no se usa** en ningún sitio.
- ⚠️ Las horas se reparten por igual entre los días marcados. ❌ No se puede
  decir "el martes 3 horas y el jueves 1", ni marcar vacaciones o semanas
  bloqueadas.
- ⚠️ Solo Biología y Geología tiene temario real (75 temas). Las otras
  especialidades del desplegable tienen 5 temas de relleno.

## El menú

- Ordenador: Inicio, Hoy, Temas, Prácticos, Calendario, Progreso, Ajustes y
  Cerrar sesión.
- Móvil: abajo Inicio, Hoy, Temas, Prácticos y Agenda (el calendario);
  Progreso y Ajustes son iconos arriba. Cerrar sesión solo desde Ajustes.

## Inicio

Resumen de cómo vas. Casi todo es para mirar.
- ✅ Cuenta atrás: "N días para tu examen", con fecha, especialidad y
  comunidad.
- ✅ Esta semana: sesiones hechas de las previstas (de lunes a domingo).
- ✅ Racha y nivel con su experiencia (ver "Racha, experiencia y niveles").
- ✅ Tu bombo: todas las bolas coloreadas según cómo las llevas. ❌ No se
  pueden pulsar aquí (sí en Temas).
- ✅ Lo siguiente: las 5 próximas sesiones.
- ✅ Botón "Crear mi plan" si aún no hay plan.
- ⚠️ Al crear el plan desaparece la tarjeta con el resumen (y con ella el
  aviso de "no te da tiempo").
- ❌ Primeros pasos guiados: si alguien pulsa "Crear mi plan" sin elegir
  temas, sale un error.

## El plan automático: cómo decide

Se crea desde Inicio o Calendario y se recalcula desde Calendario.
- Usa: fecha del examen, días y horas, minutos por tema y práctico, los
  temas que marcaste "Lo llevo" (con su prioridad) y tus prácticos no
  dominados.
- **No usa** la comunidad ni el objetivo principal.
- Orden de los temas nuevos: prioridad alta, media, baja; dentro de cada
  una, por número de tema.
- **Ritmo**: intenta terminar la primera vuelta al temario cuando ha pasado
  el 75 % del tiempo hasta el examen, para dejar el último cuarto a repasar.
- **Repasos**: cada tema nuevo trae 4 repasos a los 3, 7, 14 y 30 días
  (cada repaso dura la mitad que el tema, mínimo 20 minutos). Texto:
  "recita el índice sin mirar y comprueba".
- Temas que ya tenías estudiados antes del plan y no dominas: un repaso
  cada 14 días si sobra hueco.
- **Práctico**: uno por semana, el penúltimo día de estudio, rotando entre
  los no dominados.
- **Simulacro**: uno cada dos semanas, el último día de estudio, de un tema
  ya estudiado. Texto: "escribe o canta el tema completo con el tiempo del
  examen, sin apuntes".
- Planifica como mucho 40 semanas.
- Si no da tiempo, avisa: "Harían falta unas X horas a la semana, o llevar
  menos temas".
- Recalcular sustituye las sesiones automáticas pendientes; respeta las que
  pusiste a mano y las hechas.

Fallos conocidos del plan (en arreglo, ver ESTADO.md):
- ⚠️ Con pocas horas se pasa: un día vacío siempre admite una sesión aunque
  no quepa.
- ⚠️ Un repaso atrasado que ya hiciste puede volver a aparecer al recalcular.
- ⚠️ Al recalcular, el práctico y el simulacro empiezan siempre por el mismo.
- ⚠️ Cambiar horas, días, fecha o temas en Ajustes no avisa de que el plan
  ha quedado viejo: hay que recalcular a mano.
- ❌ No contempla la parte B (programación y exposición), ni el número de
  bolas que se sacan en cada comunidad.

## Hoy

Lo que toca hoy, lo atrasado y un vistazo a mañana.
- ✅ Marcar cada sesión como hecha (confeti y "+XP") o desmarcarla.
- ✅ "Dejar para mañana".
- ✅ "Se te ha quedado atrás": lo pendiente de días pasados, con "Hacerla
  hoy".
- ✅ Al completar: un tema nuevo pasa a "estudiado", un repaso o simulacro
  suma uno al tema, un práctico suma un intento.
- ❌ Crear, editar o borrar sesiones (eso en Calendario), moverlas a otro
  día que no sea mañana, ver el tema, cronómetro.

## Temas

Elegir qué temas llevas y apuntar cómo los tienes.
- ✅ El bombo con todas las bolas (75 en Biología y Geología). Colores: gris
  sin elegir, blanco elegido, amarillo en marcha, azul estudiado, verde
  dominado.
- ✅ Filtros: todos, elegidos, en marcha, estudiados, dominados.
- ✅ En cada tema: "Lo llevo", "Resumen hecho", "Estudiado", contadores de
  repasos y simulacros, cuánto lo dominas (bajo, medio, alto), prioridad y
  notas libres. Se guarda solo.
- ⚠️ **Elegir es de uno en uno**: 75 temas son unos 150 toques. ❌ No hay
  "llevar todos".
- ⚠️ **Marcar "Estudiado" aquí no cuenta en el plan**: no da experiencia ni
  racha ni programa los repasos.
- ❌ Buscador, añadir un tema propio, adjuntar archivos.

## Prácticos

Tu lista de supuestos prácticos. Empieza vacía: los apunta cada uno.
- ✅ Añadir práctico (nombre y notas), cambiarle el nombre.
- ✅ Estado: sin empezar, trabajado, dominado. "+1 intento".
- ❌ Borrar un práctico, restar un intento, ligarlo a un tema, filtrar,
  ver las fechas de cada intento.
- ❌ No hay catálogo de prácticos tipo por especialidad.
- ⚠️ No van por especialidad: si cambias, sigues viendo los mismos.

## Calendario

El mes entero con tus sesiones.
- ✅ Vista de mes, con puntos de color por tipo (tema, práctico, descanso,
  hecha).
- ✅ Pulsar un día: ver sus sesiones, marcarlas, editarlas (título, día,
  tipo, estado, notas) o borrarlas.
- ✅ Añadir una sesión a mano (qué vas a hacer, tipo, día, notas).
- ✅ Crear o recalcular el plan.
- ⚠️ Borrar no pide confirmación.
- ⚠️ Repasos y simulacros salen como "Tema", con el mismo color.
- ❌ Una sesión puesta a mano no se puede ligar a un tema concreto.
- ❌ Duración, hora o franjas horarias, sesiones que se repiten, arrastrar
  de un día a otro, vista semanal, pasarlo a Google Calendar.

## Progreso

Porcentaje general y desglose. Solo para mirar.
- ✅ Un porcentaje (media de temas estudiados, temas con resumen, prácticos
  dominados y sesiones cumplidas) con frase según cómo vas.
- ✅ Bloques de temas, prácticos y sesiones.
- ✅ "Tu siguiente paso": consejos según reglas fijas (p. ej. "recalcula el
  plan" si hay 5 o más atrasadas).
- ❌ Gráficas en el tiempo, horas hechas frente a previstas, racha o nivel,
  probabilidad de que salga un tema que llevas (la "calculadora de bolas").

## Ajustes

- ✅ Cambiar todo lo de la configuración inicial. Si cambias de
  especialidad, lo de la anterior se conserva por si vuelves.
- ✅ Cambiar contraseña (⚠️ no pide la actual) y cerrar sesión.
- ❌ Cambiar el nombre o el correo, borrar la cuenta, descargar tus datos,
  avisos o recordatorios.

## Racha, experiencia y niveles

Todo sale de las sesiones marcadas como hechas en Hoy o Calendario.
- Experiencia por sesión: tema nuevo 20, repaso 10, práctico 15,
  simulacro 30, descanso 0. Con racha de 5 días o más, +5 por sesión.
- Racha: días con alguna sesión hecha. ⚠️ Solo se rompe tras 7 días sin
  estudiar, no hace falta estudiar a diario (y la app no lo explica bien).
- 10 niveles: Opositor novel (0), Estudiante constante (200), Preparador
  dedicado (500), Especialista (900), Opositor experto (1400), Maestro del
  temario (2000), Opositor élite (2800), Crack de la oposición (3800), Gran
  maestro (5000), Catedrático supremo (6500).
- ❌ Logros, medallas, ranking, recordatorios.

## Lo que no existe todavía

- Sugerencias: pantalla vacía, no está en el menú. Idea: convertirla en
  "Cuéntanos qué falla".
- Panel de administración: pantallas vacías. Los temarios se cargan a mano
  por Dani. Lo siguiente que se hace es ver la lista de espera.
- Aviso legal, privacidad y cookies; páginas de error propias.
- Parte B (programación didáctica y exposición) y el Coach de exposición con
  IA, que será la parte de pago.
- Datos por comunidad: número de bolas del sorteo y fechas de convocatoria
  de Castilla-La Mancha (es lo que debe estar bien al abrir).

## Para Claude: dónde mirar en el código

Pantallas en `app/(private)/*` y `components/*` (Hoy: `components/today`,
Temas: `components/topics`, Calendario: `components/calendar`...). Plan:
`lib/study/planner.ts` y `app/plan/actions.ts`. Experiencia y niveles:
`lib/study/gamification.ts`. Página próximamente y lista de espera:
`components/landing/`, `app/waitlist/actions.ts`, `lib/email/`. Admin:
`app/admin/`.
