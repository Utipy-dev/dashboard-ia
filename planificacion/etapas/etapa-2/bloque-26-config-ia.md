# Bloque 2.6 — Configuración por IA

**Etiqueta:** `e2-config-ia`
**Tag de git:** `v2.6.0-config-ia`
**Estado:** 💭 plan
**Depende de:** 2.5

## Objetivo en una línea

El usuario puede añadir, editar y probar IAs en el dashboard, cada una con su URL y selectores de captura, y esa configuración llega a la extensión automáticamente.

## Narrativa — por qué este bloque existe

El bloque 2.5 dejó la captura funcional pero con la configuración hardcoded o puesta a mano en `chrome.storage`. Eso no escala. Cada usuario usa IAs distintas, en versiones distintas, y las interfaces cambian. Hace falta una UI para que cualquiera pueda decir "esta es mi IA, aquí su URL, aquí cómo encontrar el textarea" y que la extensión empiece a capturar sin tocar código.

También es el sitio donde la comunidad contribuye al proyecto: cuando Claude cambia su HTML, alguien actualizará los selectores y los compartirá como "preset". Este bloque abre esa posibilidad.

## Decisiones técnicas

- **Configuración guardada en el servidor, no en `chrome.storage` directamente.** Razón: el servidor ya es el dueño de los datos. La extensión consulta al servidor al arrancar y recibe la configuración. Cambios se sincronizan.
- **La extensión se entera de cambios con un endpoint `GET /api/ias/selectores` que se consulta al cargar una página relevante.** Razón: simple y suficiente. En etapa 3 con WebSocket, se actualiza en tiempo real.
- **Presets compartibles.** Cada IA puede exportarse como JSON y otro usuario puede importarlo. Razón: la comunidad puede mantener los selectores colectivamente. Si Claude cambia su HTML, el primero que lo arregle lo comparte.
- **Botón "probar selector".** Antes de guardar, el usuario puede decir "prueba este selector en la pestaña activa" y la extensión reporta si encontró el textarea o no. Razón: sin esto, el usuario se entera de que el selector es malo la primera vez que intenta capturar, y no tiene forma de diagnosticar.

## Qué hay que construir

### En el dashboard

- **Nueva sección "Configuración de IAs"** en la UI (puede ser un modal o una pestaña lateral).
- Lista de IAs con: nombre, URL base, selector del textarea, selector del botón de enviar, color, estado (activa/pausada).
- Botones: editar, probar, exportar preset, importar preset.
- Formulario de alta con validación básica.

### En el servidor

- **Schema de IA ampliado:** añadir campos `url`, `selector_textarea`, `selector_envio`, `tecla_envio` (Enter / Ctrl+Enter).
- **`GET /api/ias/:id/selectores`** — devuelve solo los campos que la extensión necesita.
- **`POST /api/ias/:id/probar-selector`** — enruta la prueba a la extensión si tiene conexión, o devuelve "extensión no conectada".

### En la extensión

- **Al cargar content script**, consulta `GET /api/ias/selectores` para obtener la configuración vigente.
- **Comando `probar-selector`:** cuando el servidor se lo pide, busca el selector en la pestaña activa y reporta si existe.

## Archivos afectados

- `dashboard/components/config-ia.js` — nuevo
- `dashboard/app.js` — rutas a la sección de config
- `servidor/src/storage/schemas/ia.js` — ampliado
- `servidor/src/routes/ias.js` — añadir subrecursos
- `extension/content/content-script.js` — leer config del servidor al cargar

## Criterios de terminado (DoD)

- [ ] El usuario puede añadir una IA nueva desde el dashboard
- [ ] El botón "probar" funciona contra la pestaña activa y reporta OK o KO
- [ ] La extensión respeta el selector configurado sin tocar código
- [ ] Exportar un preset produce un JSON legible
- [ ] Importar un preset crea la IA correcta
- [ ] Commit `feat(e2-config-ia): UI de configuración por IA con presets compartibles`
- [ ] Tag `v2.6.0-config-ia`

## Cómo usarlo

1. En el dashboard, sección "IAs" → "Añadir"
2. Nombre: "Claude", URL: `https://claude.ai`, selector textarea: `div[contenteditable="true"]` (ejemplo)
3. Abre Claude en otra pestaña
4. Clic en "Probar selector" → si OK, guardar
5. La extensión empieza a capturar automáticamente

## Notas para el agente

- **Los selectores iniciales para Claude/ChatGPT/Gemini van como presets por defecto.** Crea `servidor/src/storage/presets-ias.json` con los selectores verificados al momento del bloque. El usuario puede importarlos con un clic.
- **`contenteditable` vs `<textarea>` vs `<input>`.** Claude usa `contenteditable`. ChatGPT usa `<textarea>`. La lógica de lectura del texto es diferente (`innerText` vs `value`). Documéntalo en los presets.
- **El botón "probar" necesita comunicación bidireccional extensión ↔ servidor.** La forma más simple es que el servidor anote "solicito prueba del selector X en la pestaña Y" y la extensión lo consulte con polling cada segundo. En etapa 3 con WebSocket se simplifica.

## Preguntas abiertas

- **¿Actualizaciones de presets online?** Sería útil que cuando alguien mejore el selector de Claude, otros lo reciban. Eso implica un repo aparte de presets o un endpoint comunitario. **Propuesta:** dejar como idea de etapa 3 o 4.
