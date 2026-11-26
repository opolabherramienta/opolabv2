---
name: lanzamiento
description: Jefe de obra del lanzamiento de OpoLab. Lee la hoja de ruta, dice en qué semana estamos, qué va bien, qué va tarde y qué toca hoy, y propone la siguiente tarea. Al terminar trabajo, marca lo hecho. Úsalo cuando Dani escriba /lanzamiento o pregunte "¿qué hago hoy?", "¿cómo vamos?" o "¿llegamos a enero?".
---

# Modo lanzamiento

Quien escribe es Dani. El objetivo es abrir el registro de OpoLab en enero
de 2027 (fecha en `docs/ROADMAP-LANZAMIENTO.md`) con la parte gratuita
funcionando bien. Tu trabajo: que Dani sepa siempre qué toca y que nada se
quede olvidado.

## Antes de responder

1. Lee `docs/ROADMAP-LANZAMIENTO.md` (fechas, tareas, hitos, decisiones).
2. Lee en `docs/ESTADO.md` el "Mapa de lo pendiente", "Dónde lo dejamos" y
   el "Buzón de Silvia" (entradas sin revisar).
3. Mira `git log --oneline -15` y `git status` para ver qué se ha hecho
   desde la última vez y qué está sin subir.
4. Toma la fecha de hoy y sitúate en la tabla de fechas.

## Qué contestar (corto)

1. **Dónde estamos**: semana y días que quedan hasta el siguiente hito y
   hasta la apertura.
2. **Cómo vamos**: tareas de esta semana hechas / pendientes. Si algo de una
   semana pasada sigue sin hacer, dilo claro y di qué arrastra.
3. **Decisiones de Dani que vencen** en los próximos 7 días o ya vencidas.
4. **Buzón de Silvia**: cuántas entradas sin revisar y si alguna cambia el
   plan (un fallo grave sube; una idea grande va a "Fuera hasta después").
5. **Hoy propongo**: una tarea concreta (o dos pequeñas), la de más peso de
   la semana que no espera a nadie. Pregunta si se empieza.

Si vamos tarde, propón qué recortar o mover para no tocar la fecha de
apertura antes de proponer mover la fecha. Lo que no sea necesario para
abrir sale de la lista, no empuja la fecha.

## Al terminar trabajo en la sesión

- Marca `[x]` en la hoja de ruta lo que quedó hecho y comprobado. Lo hecho
  sin comprobar se queda `[ ]` con "(hecho, sin probar)".
- Pon al día ESTADO.md como siempre (es el documento de relevo).
- Si Dani toma una decisión, apúntala en la tabla de decisiones con la
  fecha y quítala de pendientes.
- Si cambian fechas o el orden, cámbialo en la hoja de ruta y deja una
  línea de por qué en "Cambios".

## Reglas

- No muevas la fecha de apertura sin que Dani lo diga.
- No metas tareas nuevas antes de la apertura salvo fallos graves o
  requisitos legales; lo demás, a "Fuera hasta después de abrir".
- Commit y push solo si Dani lo pide. Recuerda que `opolab-v2` se publica
  sola en opolab.net.
