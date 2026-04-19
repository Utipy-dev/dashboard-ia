# Bloque 4.0 — Extensión: UI completa

**Etiqueta:** `e4-extension-ui`
**Tag de git:** `v4.0.0-extension-ui`
**Estado:** 💭 plan
**Depende de:** 3.11

## Objetivo en una línea

Expandir la extensión de Chrome de un popup mínimo a un panel lateral completo (Side Panel API) con toda la funcionalidad del dashboard.

## Narrativa — por qué este bloque existe

Hasta etapa 3, la extensión tiene un popup pequeño para verificar la conexión con el servidor. El valor real está en el dashboard web en `localhost:3333`. Pero tener que cambiar entre la pestaña de Claude y la pestaña del dashboard interrumpe el flujo.

Chrome tiene una Side Panel API que permite mostrar una panel a la derecha de cualquier página web. Si el dashboard vive en ese panel, el usuario puede estar hablando con Claude a la izquierda y ver sus notas a la derecha, sin cambiar de pestaña.

## Decisiones técnicas (borrador)

- **Chrome Side Panel API.** Introducida en Chrome 114 (2023). Permite mostrar contenido HTML en un panel de ~350px a la derecha. El panel persiste entre pestañas. Es la superficie correcta para el dashboard.
- **El panel carga el dashboard desde el servidor local.** `http://localhost:3333` en un `<iframe>` dentro del panel, o directamente como URL del side panel. La segunda opción es más limpia (no `<iframe>`, el panel es la página).
- **Permisos nuevos en `manifest.json`:** `sidePanel`. Sin cambios en `host_permissions`.
- **El popup original se convierte en "abrir/cerrar panel".** El pequeño popup de estado pasa a ser simplemente el activador del panel lateral.

## Qué hay que construir

- `src/extension/side-panel/panel.html` — carga el dashboard del servidor
- `src/extension/side-panel/panel.js` — lógica de comunicación panel ↔ content script
- `src/extension/manifest.json` — añadir `side_panel` y permisos
- `src/extension/background/service-worker.js` — abrir panel al clicar el icono de la extensión
- `src/dashboard/` — ajustes CSS para que el layout funcione en 350px de ancho

## Criterios de terminado (DoD)

- [ ] Clic en el icono de la extensión abre el panel lateral con el dashboard
- [ ] El panel permanece visible al navegar entre pestañas
- [ ] El dashboard en el panel funciona igual que en la pestaña standalone
- [ ] En una pestaña de Claude: el panel muestra el dashboard y la captura funciona simultáneamente
- [ ] Commit `feat(e4-extension-ui): panel lateral Chrome con dashboard completo`
- [ ] Tag `v4.0.0-extension-ui`

## Notas para el agente

- **La Side Panel API puede evolucionar.** Google ha cambiado la API varias veces desde 2023. Antes de implementar, verificar la documentación actual y los permisos necesarios.
- **El dashboard en 350px necesita diseño responsivo adicional.** El CSS de etapa 1-3 está pensado para ventanas más anchas. Revisar layout en ese ancho antes de declarar terminado.
- **El panel puede quedar obsoleto con Manifest v4.** Si Google anuncia MV4 antes de esta etapa, evaluar alternativas (Offscreen Documents, etc.).

## Preguntas abiertas

- **¿El panel funciona en Firefox (extensions)?** Firefox tiene Side Panel parcial. **Propuesta:** solo Chrome/Chromium en etapa 4. Firefox en etapa futura si hay demanda.
