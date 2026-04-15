# Bloque 1.2 — Juntar notas

**Etiqueta:** `e1-juntar-notas`
**Tag de git:** `v1.2.0-juntar` (retrospectivo)
**Estado:** ✅ done
**Depende de:** 1.0, 1.1

## Objetivo en una línea

Combinar varios mensajes dispersos en uno solo, respetando el orden que el usuario elige y arrastrando las imágenes de cada uno.

## Narrativa — por qué este bloque existe

Al usar el dashboard, surgió otro patrón: muchos usuarios (empezando por Arturo) escriben ideas sueltas a lo largo del día — una observación aquí, una pregunta más tarde, un ejemplo después. Cuando llega el momento de enviar a la IA, esas notas tienen sentido juntas, no por separado. Pero el orden correcto de envío no siempre es el orden cronológico: a veces es mejor poner primero el contexto y después la pregunta, aunque las escribieras al revés.

Un sistema "select + combine" con numeración manual resuelve ambas cosas: elegir qué notas y en qué orden.

## Decisiones técnicas

- **Círculos ○ para marcar selección, numerados al clic.** Razón: más informativo que checkboxes. El número muestra el orden resultante sin necesidad de otra interfaz.
- **Panel derecho con bloques en el orden seleccionado.** Razón: el usuario ve inmediatamente cómo va a quedar el mensaje combinado. Puede editar cada bloque antes de guardar.
- **Imágenes se arrastran automáticamente con cada bloque.** Razón: si seleccionas un mensaje que tenía imágenes, las imágenes forman parte del mensaje. Dejarlas fuera al combinar sería una trampa.
- **Al guardar, se genera un mensaje nuevo que reemplaza a los originales.** Los originales se borran. Razón: si se mantuvieran, el usuario tendría contenido duplicado y se confundiría al buscar algo después.

## Qué contiene

- Modo "juntar" activable con un toggle en la UI
- Estado de selección con orden (array ordenado por clic)
- Panel derecho con bloques editables por mensaje seleccionado
- Acción "Guardar combinación" que crea un mensaje nuevo y borra los seleccionados

## Archivos afectados

- `dashboard/app.js` — lógica de modo juntar y combinación
- `dashboard/components/conversacion-card.js` — renderizado de círculos ○ y numeración
- `dashboard/styles.css` — estados del modo juntar

## Cómo usarlo

1. Activa modo "juntar" desde la cabecera de la conversación
2. Clica los ○ en el orden deseado (aparecen 1, 2, 3...)
3. En el panel derecho, revisa o edita cada bloque
4. Clica "Guardar combinación" → se crea un mensaje nuevo con todo junto

## Notas para el agente

- **El orden es el de clic, no el visual.** Si clicas el mensaje de abajo primero, irá primero en el resultado. Es intencional.
- **Deseleccionar un mensaje renumera los siguientes.** Si tenías 1, 2, 3 y deseleccionas el 2, pasa a ser 1, 2 otra vez. No dejes huecos.
- **Borra los originales con confirmación implícita.** Si alguien se queja de perder contenido, considera añadir un "¿seguro?" antes de guardar la combinación.
