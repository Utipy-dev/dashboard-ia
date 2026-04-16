# Bloque 3.10 — Historial unificado cross-IA

**Etiqueta:** `e3-historial-cross`
**Tag de git:** `v3.10.0-historial-cross`
**Estado:** 💭 plan
**Depende de:** 3.9

## Objetivo en una línea

Una vista del dashboard que muestra todos los mensajes de todas las IAs en un único timeline cronológico, con filtros y búsqueda.

## Narrativa — por qué este bloque existe

Hasta etapa 2, el dashboard organiza el contenido por proyecto y luego por IA. Para trabajar en profundidad con una IA específica, esa organización es perfecta. Pero para responder "¿qué le mandé a Claude la semana pasada sobre el presupuesto?" tienes que acordarte de en qué proyecto estaba y navegar hasta ahí.

El historial cross-IA es la respuesta: un feed cronológico de todo, con búsqueda de texto libre. Como el historial de un cliente de email, pero para conversaciones con IAs. No reemplaza la vista por proyecto — la complementa.

## Decisiones técnicas

- **Vista nueva `/historial` en el dashboard.** No modifica la vista existente por proyecto/IA. Es una capa de lectura encima del mismo storage.
- **Sin nuevo storage.** El historial se construye leyendo los mensajes existentes con un query cross-conversaciones. Endpoint: `GET /api/historial?q=presupuesto&ia=claude&desde=2026-04-01&tipo=captura,manual`.
- **Paginado por cursor.** La respuesta de `/api/historial` devuelve `{ items: [...], cursor_siguiente }`. El frontend pide la página siguiente con `?cursor=<valor>`. Razón: con 1000+ mensajes, no se puede cargar todo a la vez.
- **Búsqueda de texto libre por `includes()`.** Para un solo usuario y miles de mensajes (no millones), `array.filter(m => m.texto.toLowerCase().includes(q))` es suficientemente rápido. SQLite con FTS sería mejor pero introduce dependencia de etapa superior.
- **Filtros:** por IA, por proyecto, por fecha, por tipo (manual, captura, cola, reserva). Combinables.
- **La vista es de solo lectura.** No se puede editar ni eliminar desde el historial. Las acciones van al contexto original del mensaje. Razón: simplicidad y consistencia.

## Layout del historial

```
┌────────────────────────────────────────────────┐
│ 🔍 [Buscar en todos los mensajes...          ] │
│ Filtros: [Todas las IAs ▼] [Todos los tipos ▼] │
│          [Desde: ──────] [Hasta: ──────]       │
├────────────────────────────────────────────────┤
│ 16 abr 2026, 15:32                             │
│ 🔵 Claude · Proyecto: Dashboard IA             │
│ "Revisa la propuesta y sugiere mejoras en el..." │
│ [Ver en contexto →]                            │
├────────────────────────────────────────────────┤
│ 16 abr 2026, 10:15                             │
│ 🟢 ChatGPT · Proyecto: Marketing               │
│ "¿Qué colores funcionan mejor para CTAs de..." │
│ [Ver en contexto →]                            │
├────────────────────────────────────────────────┤
│ [Cargar más...]                                 │
└────────────────────────────────────────────────┘
```

## Qué hay que construir

### En el servidor

- **`GET /api/historial`:**
  - Parámetros: `q`, `ia_id`, `proyecto_id`, `desde`, `hasta`, `tipo`, `cursor`, `limite` (default 20)
  - Lee todos los mensajes, aplica filtros, ordena por `created_at DESC`, pagina
  - Devuelve: `{ items: [{ id, texto_preview, ia_nombre, proyecto_nombre, tipo, created_at }], cursor_siguiente }`

### En el dashboard

- **`dashboard/components/historial.js`:**
  - Barra de búsqueda con debounce (300ms)
  - Selector de filtros
  - Lista de resultados con scroll infinito (IntersectionObserver)
  - "Ver en contexto" → navega a la conversación y hace scroll al mensaje

- **Entrada en la navegación principal** del dashboard (menú lateral o tab)

## Archivos afectados

- `servidor/src/routes/historial.js` — nuevo
- `servidor/src/index.js` — registrar ruta
- `dashboard/components/historial.js` — nuevo
- `dashboard/app.js` — añadir navegación al historial

## Criterios de terminado (DoD)

- [ ] `GET /api/historial?q=presupuesto` devuelve mensajes que contienen "presupuesto" de cualquier IA
- [ ] Filtro por IA funciona correctamente
- [ ] Paginación: la segunda página no repite ítems de la primera
- [ ] "Ver en contexto" navega al mensaje correcto en la vista por proyecto
- [ ] Con 0 resultados, muestra "No se encontraron mensajes" (no pantalla vacía sin explicación)
- [ ] La búsqueda no bloquea la UI (debounce correcto, no freeze en móvil)
- [ ] Commit `feat(e3-historial-cross): historial unificado cross-IA con búsqueda y filtros`
- [ ] Tag `v3.10.0-historial-cross`

## Notas para el agente

- **`created_at DESC` en memoria.** El storage es un array JSON. Para ordenar todos los mensajes de todas las conversaciones, los concatenas y ordenas. Con 5000 mensajes tarda < 10ms. No es un problema real todavía.
- **El cursor de paginación.** El patrón más simple: `cursor = ultimo_id_devuelto`. En el siguiente request, filtra los mensajes con `id < cursor` (asumiendo UUIDs v4... que no son ordenados). Alternativa: `cursor = timestamp_del_ultimo`. El cursor de timestamp es más robusto para paginación cronológica.
- **"Ver en contexto" requiere saber el `conversacion_id` del mensaje.** Incluirlo en la respuesta del API, aunque no se muestre en la UI. Necesario para construir la URL de navegación.

## Preguntas abiertas

- **¿Historial en el móvil?** La búsqueda global sería muy útil desde el móvil. **Propuesta:** incluir en la PWA como pantalla simplificada (solo búsqueda de texto + lista, sin filtros complejos).
- **¿Exportar historial?** `GET /api/historial/exportar` → devuelve JSON o CSV de todos los mensajes. Útil para backup. **Propuesta:** añadir en el packaging de etapa 3 (3.11) si hay tiempo.
