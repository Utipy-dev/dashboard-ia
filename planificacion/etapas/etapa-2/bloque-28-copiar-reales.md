# Bloque 2.8 — Copiar archivos reales al portapapeles

**Etiqueta:** `e2-copiar-reales`
**Tag de git:** `v2.8.0-copiar-reales`
**Estado:** 💭 plan
**Depende de:** 2.7

## Objetivo en una línea

Al preparar un envío con varios documentos adjuntos, el usuario puede copiar todos los archivos reales al portapapeles del sistema con un clic, listos para pegar como archivos en la interfaz de la IA.

## Narrativa — por qué este bloque existe

El portapapeles del navegador es limitado. Puedes copiar texto y, con suerte y según el navegador, una sola imagen. No puedes copiar "tres archivos reales" como harías desde el explorador de Windows. Pero cuando estás pasando contexto a una IA, a menudo quieres enviar múltiples archivos de golpe — en Claude, ChatGPT y similares, "pegar" (Ctrl+V) sobre el área de chat acepta archivos reales del portapapeles del sistema.

El servidor local puede resolver esto que el navegador no puede. Copia los archivos a una carpeta temporal con un nombre conocido, y desde ahí, invoca una herramienta nativa del sistema que los selecciona y los mete en el portapapeles. Es una solución "pegamento": el dashboard pide, el servidor ejecuta, y el usuario usa Ctrl+V normalmente en Claude.

## Decisiones técnicas

- **Carpeta temporal `servidor/data/clipboard-temp/`**, limpiada al arrancar el servidor. Razón: no dejar archivos huérfanos. No persistir temporales.
- **Invocación del portapapeles del sistema depende del OS.** Razón:
  - **Windows:** PowerShell con `Set-Clipboard -Path` (copia archivos reales)
  - **macOS:** `osascript` con `tell application "Finder"` o `pbcopy` con modificación
  - **Linux:** `xclip` con `-selection clipboard -target x-special/gnome-copied-files`
- **Fallback a "abrir la carpeta temp" si no se puede copiar.** Razón: si por lo que sea el OS rechaza o no tenemos permisos, al menos el usuario puede arrastrar los archivos manualmente.
- **Botón "Copiar archivos al portapapeles" en el modal de preparar envío.** Razón: visible en el sitio donde tiene sentido — el momento en que el usuario va a pasar el contenido a la IA.

## Qué hay que construir

### En el servidor

- **Endpoint `POST /api/clipboard/copiar-archivos`:**
  - Body: `{ documento_ids: string[] }`
  - Copia los archivos a `data/clipboard-temp/<timestamp>/`
  - Invoca el comando nativo según OS
  - Devuelve: `{ ok: true, ruta_temp }` o `{ ok: false, motivo, ruta_temp }` (ruta siempre, para fallback)
- **Helper `servidor/src/services/clipboard.js`:** abstrae la diferencia entre OS.
- **Limpieza**: al arrancar, borrar `data/clipboard-temp/` entero.

### En el dashboard

- **Botón "Copiar archivos"** en el modal de preparar envío (solo si hay documentos adjuntos).
- **Feedback:** toast "Archivos listos en el portapapeles" (o fallback "Abre esta carpeta para arrastrarlos: <ruta>").

## Archivos afectados

- `servidor/src/routes/clipboard.js` — nuevo
- `servidor/src/services/clipboard.js` — nuevo
- `servidor/src/index.js` — limpiar temp al arrancar
- `dashboard/app.js` — handler del botón
- `dashboard/components/modal-envio.js` — botón nuevo

## Criterios de terminado (DoD)

- [ ] En Windows: seleccionar 2 documentos en un mensaje, pulsar "Copiar archivos", abrir Claude, Ctrl+V → aparecen los 2 archivos
- [ ] En macOS: igual
- [ ] En Linux: igual (o fallback a abrir carpeta)
- [ ] La carpeta temp se limpia al reiniciar el servidor
- [ ] Si algún comando nativo falla, el fallback funciona
- [ ] Commit `feat(e2-copiar-reales): copiar múltiples archivos reales al portapapeles del sistema`
- [ ] Tag `v2.8.0-copiar-reales`

## Cómo usarlo

1. Mensaje con 3 PDFs adjuntos
2. Clic en "Preparar envío" → modal
3. Clic en "Copiar archivos al portapapeles"
4. Abre Claude → clic en el área de chat → Ctrl+V → los 3 archivos suben

## Notas para el agente

- **PowerShell Set-Clipboard -Path sí copia archivos reales en Windows.** Se puede invocar desde Node con `child_process.exec`. Escapa las rutas con comillas.
- **macOS es el más quisquilloso.** `osascript` necesita una sintaxis específica para `tell application "Finder" to set the clipboard to file ...`. Busca ejemplos de Stack Overflow y prueba.
- **Linux depende del window manager.** X11 usa xclip/xsel. Wayland requiere `wl-clipboard`. Detecta `$WAYLAND_DISPLAY` y elige.
- **Si el comando nativo falla, NO reintentes en bucle.** Devuelve el fallback (ruta) y deja que el usuario decida.
- **Permisos:** en macOS, la primera vez puede pedir permisos de accesibilidad. Documéntalo en el manual de instalación.

## Preguntas abiertas

- **¿Soporte a ZIP automático?** Si el usuario tiene 20 archivos, ¿generar un ZIP y copiar solo ese? Posible feature futura. **Propuesta:** no en este bloque, dejar como idea para etapa 3 si se pide.
