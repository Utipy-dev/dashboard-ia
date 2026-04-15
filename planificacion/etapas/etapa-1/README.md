# Etapa 1 — Vanilla local ✅

**Pitch de la etapa:** "Demostrar que el problema se puede resolver sin servidor, sin cuentas, sin nube. Un solo HTML en tu máquina."

## Qué es esta etapa

La primera versión del Dashboard IA. HTML, CSS y JavaScript puros. Sin frameworks, sin bundlers, sin servidor. Se abre `dashboard/index.html` en Chrome, seleccionas una carpeta local donde guardar tus datos con File System Access API, y el dashboard es tuyo.

## Qué quería demostrar

Que un producto así podía empezar a existir con la menor superficie técnica posible. Si la idea funciona sin servidor, funciona cuando añadas servidor. Si funciona con 4 archivos JSON planos, funcionará con lo que sea. Empezar pequeño para validar el flujo antes de complicarlo.

## Alcance alcanzado

- Layout split tipo galería/panel
- Proyectos como carpetas Notion
- Cronómetro por IA con editor de ciclos
- Temas/etiquetas con colores
- Mensajes con borrador persistente
- Imágenes via Ctrl+V en panel lateral 20% / texto 80%
- Juntar notas: combinar mensajes en uno con orden
- Modal "Preparar envío" con copiado por mensaje

## Limitaciones conocidas que motivan etapa 2

1. **Permiso de File System Access.** Chrome pierde el permiso cuando se cierra la pestaña, forzando al usuario a reseleccionar la carpeta cada sesión.
2. **Sin procesamiento de archivos.** No puede manejar PDFs, no puede copiar múltiples archivos reales (solo imágenes del clipboard).
3. **Sin captura desde IAs.** Todo entra por escritura o Ctrl+V manual.
4. **Sin envío programado.** Los mensajes solo se preparan para copiar a mano.

Todas las limitaciones tienen la misma raíz: ser HTML puro sin servidor. Etapa 2 las resuelve de golpe.

## Bloques

- `bloque-10-base-vanilla.md` — Base del dashboard (layout, cronómetro, temas, mensajes)
- `bloque-11-imagenes.md` — Sistema de imágenes via Ctrl+V
- `bloque-12-juntar-notas.md` — Combinación de varios mensajes
- `bloque-13-modal-envio.md` — Modal "Preparar envío"

**Tag retrospectivo de etapa:** `etapa-1-done` (a aplicar al hacer la primera instantánea completa del repo)
