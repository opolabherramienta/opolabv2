# OpoLab: hoja de ruta hasta abrir en enero

Propuesta de Claude del 26 de noviembre de 2026, pendiente de que Dani la
confirme. Ordena por fechas lo que `docs/ESTADO.md` tiene por bloques: el
detalle de cada tarea sigue allí. Se revisa con `/lanzamiento`.

Idea de fondo: Silvia y la beta tienen que encontrarse fallos que no
conocemos, no los que ya tenemos apuntados. Por eso primero se arreglan los
fallos conocidos del plan y después entra Silvia.

## Las fechas

| Cuándo | Qué | Hito al terminar |
| --- | --- | --- |
| 26 nov – 29 nov | Arreglar lo conocido | Plan fiable y primeros pasos sin tropiezos |
| 30 nov – 4 dic | Auditoría de Silvia + preparar la beta | Lista para beta |
| 5 – 8 dic | Puente | — |
| 9 – 20 dic | Beta cerrada (5 a 10 opositores) | Lo que diga la beta, apuntado y priorizado |
| 21 dic – 6 ene | Navidad, ritmo bajo: arreglos de la beta y lo legal | Lista para abrir |
| 7 – 10 ene | Congelar, prueba final, preparar el aviso | Todo en verde |
| **Lunes 11 ene 2027** | **Abrir el registro y avisar a la lista** | Abierto (colchón: lunes 18) |
| 11 ene – 31 ene | Atender a los primeros usuarios | Estable |
| Febrero | Empezar la parte de pago (Coach) | — |

## Semana 1 (26 – 29 nov): arreglar lo conocido

Todo es trabajo de Claude con Dani mirando; no depende de nadie.

- [ ] Los arreglos 1 a 7 del plan ("Dónde lo dejamos" en ESTADO.md).
      Hechos el 26 nov y probados ese día por Claude en local con una
      cuenta de prueba real; sin commit ni subir.
  - [ ] 1. Repaso atrasado que vuelve (con pruebas; en la app no se pudo
        reproducir: la cuenta no tenía repasos atrasados).
  - [x] 2. Plan con pocas horas.
  - [x] 3. Rotaciones al recalcular (visto con prácticos; simulacros solo
        en pruebas).
  - [x] 4. Sustituir el plan sin dejarlo a medias.
  - [x] 5. El "+XP" al completar (Calendario con cuenta real; Hoy en la
        vista de ejemplo).
  - [x] 6. Borrar una sesión completada resta el repaso.
  - [x] 7. La tarjeta del plan sigue a la vista en Inicio.
- [ ] Del punto 8, lo que más se nota el primer día:
  - [x] "Llevar todos / ninguno" en Temas (26 nov, probado con cuenta
        real).
  - [x] Fecha de examen opcional (y que no admita fechas pasadas). Hecho
        el 26 nov y probado en Ajustes con cuenta real; el onboarding usa
        el mismo formulario, sin probar con una cuenta nueva.
  - [ ] Primeros pasos en Inicio: temas, prácticos, plan (hecho el 26 nov,
        visto en `/dev-preview/inicio?paso=1`; sin probar con una cuenta
        recién creada).
  - [x] Marcar "Estudiado" en Temas cuenta para el plan, el XP y los
        repasos (26 nov, probado con cuenta real; los repasos entran al
        recalcular).
- [ ] Erratas y mensajes en inglés ("contrasena", "sesion", errores de
      Supabase).
- [ ] Simular el plan con los 75 temas y números de Silvia (horas,
      examen en junio) y revisar que tiene sentido.

**Dani, esta semana:** borrar las filas de prueba de `waitlist`, decidir si
manda la bienvenida a los que se apuntaron antes del 24 de noviembre y
elegir a los 5 a 10 de la beta.

## Semana 2 (30 nov – 4 dic): Silvia audita y se prepara la beta

- [ ] Dani crea la cuenta de Silvia (pasos en ESTADO.md, bloque 2) el lunes
      30. Ella usa la app de verdad toda la semana y apunta con `/silvia`.
- [ ] Dani hace la prueba completa en móvil con su cuenta: entrar y
      recuperar la contraseña en opolab.net, crear plan, Hoy, recalcular.
- [ ] Silvia da los datos de Castilla-La Mancha: número de bolas del sorteo,
      fechas previstas de la convocatoria 2027 y si hay algo propio de CLM.
- [ ] Limpieza rápida: quitar `test-supabase`, esconder o marcar
      "próximamente" las especialidades de relleno, páginas de error y de
      carga propias, título de la pestaña.
- [ ] Botón "Cuéntanos qué falla" dentro de la app (sustituye Sugerencias).
- [ ] Aviso de privacidad mínimo para la beta (qué datos guardamos y para
      qué). El legal completo puede esperar a la semana de Navidad.
- [ ] Supabase no se pausa (lo decide Dani, ver abajo).
- [ ] Avisos de errores en producción, para enterarnos antes que la beta.

**Lista para beta** cuando: los arreglos 1 a 7 están hechos y probados en
opolab.net con una cuenta real; Silvia ha usado la app al menos tres días
sin un fallo grave; hay botón de fallos; Supabase no se pausa.

## Beta (9 – 20 dic)

- [ ] Dani crea las cuentas (el registro sigue cerrado) y les manda un
      mensaje corto: qué es, qué esperamos de ellos, cómo avisar de fallos.
- [ ] Cada lunes (14 y 21 dic): Claude repasa lo que ha llegado por el botón
      y el buzón de Silvia, y propone qué se arregla esa semana.
- [ ] Mirar si usan la app: cuántos crean plan y cuántos vuelven a Hoy.
- [ ] En paralelo, lo que no depende de la beta: borrado de cuenta en
      Ajustes, comprobaciones automáticas en GitHub, `www.opolab.net`.

## Navidad (21 dic – 6 ene): lo que falta para abrir

- [ ] Arreglos de la beta.
- [ ] Aviso legal, privacidad y cookies, con casilla en el registro
      (necesita los datos del titular).
- [ ] Freno a registros falsos o confirmación por correo (decide Dani).
- [ ] Aviso de apertura: pasar la lista a una audiencia de Resend, con
      enlace de baja, y escribir el correo.
- [ ] Imagen para compartir (Open Graph), icono, `robots` y `sitemap`.
- [ ] Rehacer capturas y vídeo con Castilla-La Mancha y el vídeo vertical.
- [ ] Pantalla `/admin/lista-espera` (ver nota abajo).

**Lista para abrir** cuando: sin fallos graves abiertos de la beta; textos
legales publicados; borrado de cuenta funciona; el correo de apertura está
probado en Gmail y en móvil; Supabase con copias de seguridad.

## Apertura (7 – 11 ene)

- [ ] Prueba completa final en móvil y escritorio, con una cuenta nueva.
- [ ] Fusionar `opolab-v2` en `main`.
- [ ] Lunes 11: quitar `NEXT_PUBLIC_SITE_MODE=teaser` en Vercel, comprobar
      el registro en opolab.net y mandar el aviso a la lista.
- [ ] Ese día y los siguientes: mirar errores y altas a diario.

## Decisiones de Dani, con fecha límite

| Antes del | Decisión |
| --- | --- |
| 29 nov | Quiénes son los 5 a 10 de la beta |
| 29 nov | Mandar o no la bienvenida a los primeros apuntados |
| 4 dic | Supabase: plan de pago (unos 25 $/mes, con copias) o llamada periódica. Claude recomienda pago: la beta y la apertura no deben depender de un truco |
| 18 dic | Fecha de apertura: 11 o 18 de enero |
| 18 dic | Especialidades al abrir: solo Biología o también otras con su temario del BOE |
| 18 dic | Confirmar el correo al registrarse, sí o no |
| 18 dic | Datos del titular para los textos legales |

## Cambio respecto a lo hablado el 24 de noviembre

Ese día quedó primero la pantalla `/admin/lista-espera` y después los
arreglos del plan. Claude propone darle la vuelta: la lista se puede mirar
y exportar desde Supabase mientras tanto, y los arreglos son lo que
necesitan Silvia y la beta. La pantalla pasa a Navidad. Si Dani prefiere el
orden anterior, se vuelve a él.

## Fuera hasta después de abrir

Coach de exposición, precio y Stripe, calculadora de bolas, franjas
horarias, días bloqueados, exportar calendario, app instalable, parte B.
Si Silvia o la beta piden algo de esto, se apunta y se valora en febrero.
