# Bloque 4.1 — Extensión: acceso completo al dashboard

**Etiqueta:** `e4-extension-dashboard`
**Tag de git:** `v4.1.0-extension-dashboard`
**Estado:** 💭 plan
**Depende de:** 4.0

## Objetivo en una línea

Integración profunda entre el panel lateral y las páginas de IA: captura automática al enviar, indicadores contextuales sobre los mensajes, acciones rápidas directamente en la página.

## Narrativa — por qué este bloque existe

El bloque 4.0 pone el dashboard en el panel lateral. Este bloque hace que ese panel "reaccione" a lo que ocurre en la página de la IA. Cuando el usuario envía un mensaje a Claude, el panel muestra automáticamente el mensaje capturado. Cuando hay un envío programado para esta IA, aparece un indicador discreta sobre el textarea.

Es la diferencia entre "el dashboard está al lado" y "el dashboard está integrado".

## Decisiones técnicas (borrador)

- **Eventos del content script → service worker → panel.** El content script detecta envíos, los manda al service worker vía `chrome.runtime.sendMessage`, el service worker los reenvía al panel. El panel actualiza su estado.
- **Indicadores contextuales no intrusivos.** Un pequeño badge o tooltip sobre el textarea de la IA si hay algo relevante (sesión reservada, envío pendiente). No banners, no overlays que interfieran con el uso de la IA.
- **Acciones rápidas en el panel al detectar la IA activa.** Si el panel detecta que la pestaña activa es Claude.ai, muestra shortcuts específicos: "Capturar ahora", "Programar envío", "Ver historial de esta IA".

## Qué hay que construir

- `src/extension/content/integrador.js` — nuevo: puente entre página y panel
- `src/extension/side-panel/panel.js` — escuchar eventos del content script y actualizar UI
- `src/dashboard/components/ia-activa.js` — componente que muestra contexto de la IA activa actual
- Indicadores CSS no intrusivos inyectados en páginas de IA

## Criterios de terminado (DoD)

- [ ] Enviar un mensaje en Claude → el panel muestra el mensaje capturado en < 1s
- [ ] Con envío programado para la IA activa: badge discreto visible en la página
- [ ] Shortcuts contextuales en el panel cuando se detecta una IA conocida
- [ ] Los indicadores no interfieren con el uso normal de Claude/ChatGPT
- [ ] Commit `feat(e4-extension-dashboard): integración profunda panel ↔ páginas de IA`
- [ ] Tag `v4.1.0-extension-dashboard`

## Notas para el agente

- **Cada actualización de UI de Claude puede romper los selectores.** El sistema de configuración de 2.6 (selectores editables) es la defensa. Asegurarse de que los indicadores contextuales también usan esos selectores configurables.
- **No inyectar demasiado en páginas de terceros.** Menos código inyectado = menos superficie de ruptura. Los indicadores contextuales deben ser opcionales y activables por el usuario.
