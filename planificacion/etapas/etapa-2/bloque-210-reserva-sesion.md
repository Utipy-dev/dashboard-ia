# Bloque 2.10 — Reserva de sesión

**Etiqueta:** `e2-reserva-sesion`
**Tag de git:** `v2.10.0-reserva-sesion`
**Estado:** 💭 plan
**Depende de:** 2.9

## Objetivo en una línea

Un botón de un clic que programa un mensaje trivial para que se envíe a una hora concreta, con el único propósito de "reservar" la ventana de sesión de la IA para usarla más tarde.

## Narrativa — por qué este bloque existe

La reserva de sesión es un patrón de uso real y concreto, suficientemente importante como para merecer su propia UI en lugar de quedarse como "un envío programado más". La mayoría de usuarios de Claude/ChatGPT no saben que las sesiones funcionan por ventanas deslizantes, y los que lo saben lo hacen a mano con mensajes tipo "responde 0". Convertir eso en un botón etiquetado "Reservar sesión" educa al usuario sobre el patrón, le explica por qué existe, y se lo pone trivial.

Es también una demo perfecta del valor del producto en medio minuto: llegas, pulsas "Reservar sesión a las 10", y entiendes inmediatamente qué hace el dashboard y por qué vale la pena.

## Decisiones técnicas

- **El mensaje de reserva es una plantilla fija pero editable.** Razón: hay un default razonable ("Cuando te ponga el número 1, respóndeme con un 0 — estoy reservando sesión"), pero el usuario puede personalizarlo. Algunas IAs responden mejor a unos fraseos que otros.
- **UI específica en el dashboard: botón "Reservar sesión" en cada IA.** Razón: descubribilidad. Si lo entierras en el menú de "envío programado", nadie lo encuentra.
- **Pregunta rápida: ¿para qué hora?** Selector simple con opciones ("+1h", "+2h", "+3h", "A las 10:00 de mañana", "Personalizado"). Razón: 80% de los casos son ahora+N horas.
- **El mensaje de reserva queda marcado en el dashboard con un indicador específico.** Razón: no confundirlo con mensajes normales que el usuario haya escrito. Puede ignorarlo en el historial.
- **La respuesta que la IA devuelva (el "0" o lo que sea) también queda capturada.** Razón: cierra el bucle y demuestra que todo funcionó. Pero se marca visualmente como "ruido de reserva", no contenido real.

## Qué hay que construir

### En el dashboard

- **Botón "⏱️ Reservar sesión"** visible en la cabecera de cada IA configurada
- **Modal con opciones rápidas** ("+1h", "+2h", "+3h", "Mañana 10:00", "Personalizado" → abre el modal de programación normal)
- **Campo editable con el texto del mensaje de reserva** (con un default razonable persistente por IA)
- **Al confirmar: crea un mensaje programado con `origen: "reserva"` + `programado_para: ahora+N`**

### En el servidor

- Schema de mensaje: añadir `origen: "manual" | "captura" | "reserva"`
- El scheduler trata los mensajes de reserva igual que cualquier otro programado — solo cambia el origen para UI.
- Plantilla de reserva por defecto en `servidor/src/config.js`, configurable por IA.

### Aprovechar para UX

- **Panel "Sesiones activas"** en el dashboard: muestra cada IA configurada con un indicador visual de "sesión reservada activa" cuando hay un mensaje de reserva reciente y una estimación de cuándo caduca (basada en 5 horas desde el envío, configurable).

## Archivos afectados

- `dashboard/components/reservar-sesion.js` — nuevo
- `dashboard/components/panel-sesiones.js` — nuevo
- `dashboard/app.js` — integración
- `servidor/src/config.js` — plantilla por defecto
- `servidor/src/storage/schemas/mensaje.js` — campo `origen`

## Criterios de terminado (DoD)

- [ ] Clic en "Reservar sesión" → "+2h" → se crea un mensaje programado con el texto de reserva
- [ ] A las 2 horas, el mensaje se envía a la IA (verificable manualmente)
- [ ] La respuesta de la IA aparece capturada en el dashboard
- [ ] El panel "Sesiones activas" muestra la IA como "reservada"
- [ ] La plantilla de mensaje de reserva se puede editar por IA
- [ ] Commit `feat(e2-reserva-sesion): reserva de sesión con un clic y panel de sesiones activas`
- [ ] Tag `v2.10.0-reserva-sesion`

## Cómo usarlo

1. En el dashboard, sobre la cabecera de Claude, clic "⏱️ Reservar sesión"
2. Elige "+3h" (o la hora que quieras)
3. El dashboard confirma
4. Vete a hacer otra cosa
5. 3 horas después, Claude habrá recibido y respondido el mensaje
6. Cuando te sientes a trabajar con Claude, te quedan ~2h efectivas limpias

## Notas para el agente

- **El valor emocional importa.** Cuando diseñes el botón y el modal, que se sienta como un "botón especial", no una variante más del envío programado. Es el selling point visible del producto.
- **La estimación de "2h restantes" es aproximada.** Cada IA tiene su propia política. Documenta en un tooltip que es una estimación y que puede variar.
- **Cuidado con los mensajes de reserva capturados accidentalmente.** Si el usuario manda un mensaje real a los pocos segundos del de reserva, la respuesta de reserva ("0") puede confundirse. Marca claramente con un indicador distinto.
- **Habla con Comercial sobre cómo explicar esto en la web.** Es contenido clave para la narrativa del producto.

## Preguntas abiertas

- **¿Detectar cuándo caduca una sesión para avisar?** Algunas IAs devuelven "estás cerca del límite" en ciertas respuestas. Parsear eso para mostrar estado real en el panel. Complejo pero útil. **Propuesta:** etapa 3 o posterior.
- **¿Reserva encadenada automática?** "Cuando caduque esta sesión, reserva otra automáticamente durante toda la semana laboral". Feature premium de etapa 3-4.
