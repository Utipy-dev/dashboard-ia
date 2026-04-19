# Bloque 3.4 — Formato JSON de la cola

**Etiqueta:** `e3-cola-json`
**Tag de git:** `v3.4.0-cola-json`
**Estado:** 💭 plan
**Depende de:** 3.0

## Objetivo en una línea

Definir el schema de una tarea de cola, crear la API REST para gestionarlas y el storage correspondiente, sin ejecutar todavía ninguna tarea.

## Narrativa — por qué este bloque existe

La cola es el corazón de la automatización de etapa 3. Pero antes de ejecutar nada, hay que definir exactamente qué es una tarea: qué campos tiene, qué modos soporta, cómo se almacena. Un schema mal pensado ahora es deuda técnica en cada bloque posterior.

Este bloque es puramente definitorio y CRUD: modelar, persistir, exponer vía API. Sin ejecución. Es el tipo de bloque que se puede hacer con cabeza fría antes de entrar en la complejidad del runner.

## Schema de tarea

```json
{
  "id": "uuid-v4",
  "nombre": "Revisar propuesta.md",
  "ia_destino": "claude-code",
  "modo": "limpio | contexto | continuar",
  "mensaje": "Revisa la propuesta y sugiere mejoras en el tono ejecutivo",
  "contexto_ruta": "servidor/data/documentos/abc123/propuesta.md",
  "conversacion_anterior_id": null,
  "prioridad": 0,
  "estado": "pendiente | en-curso | done | error | cancelado",
  "creado_en": "2026-04-16T10:00:00Z",
  "iniciado_en": null,
  "terminado_en": null,
  "output_ruta": null,
  "error_mensaje": null,
  "proyecto_id": "uuid-proyecto",
  "conversacion_id": "uuid-conversacion"
}
```

### Modos explicados

- **`limpio`:** solo el `mensaje`, sin nada más. `claude -p "mensaje"`. Caso: comando directo.
- **`contexto`:** prepende el archivo en `contexto_ruta` antes del `mensaje`. Caso: "revisa este documento y...".
- **`continuar`:** pasa la conversación anterior como historial. Caso: "sigue desde donde lo dejamos".

## Endpoints de la API

```
GET    /api/cola                    — lista todas las tareas (con filtros: estado, ia_destino)
POST   /api/cola                    — crea nueva tarea (estado inicial: pendiente)
GET    /api/cola/:id                — detalle de una tarea
PATCH  /api/cola/:id                — actualizar (nombre, mensaje, prioridad)
DELETE /api/cola/:id                — cancelar (solo si pendiente; si en-curso, error)
POST   /api/cola/:id/mover-arriba   — subir en la cola (disminuir prioridad)
POST   /api/cola/:id/mover-abajo    — bajar en la cola
GET    /api/cola/siguiente          — la siguiente tarea pendiente (usada por el runner)
```

## Storage

Las tareas se guardan en `src/servidor/data/cola/tareas.json` (array). Mismo patrón que los otros JSON: escritura atómica con `fs.rename`, mutex por archivo.

Alternativa evaluada: una tarea por archivo (`src/servidor/data/cola/<id>.json`). Descartada: más compleja de listar y más costosa de reordenar.

## Qué hay que construir

- **`src/servidor/src/storage/schemas/tarea.js`** — JSON Schema para validación
- **`src/servidor/src/storage/cola.js`** — CRUD sobre `tareas.json`
- **`src/servidor/src/routes/cola.js`** — endpoints REST listados arriba
- **`src/servidor/src/index.js`** — registrar las rutas
- **`src/dashboard/components/cola-dashboard.js`** — UI básica: lista de tareas con estado, botón "nueva tarea", reorder
- **`src/dashboard/movil/pantalla-cola.js`** — versión simplificada para móvil (ver estado, no crear)

## Archivos afectados

- `src/servidor/src/storage/schemas/tarea.js` — nuevo
- `src/servidor/src/storage/cola.js` — nuevo
- `src/servidor/src/routes/cola.js` — nuevo
- `src/servidor/src/index.js` — registrar rutas
- `src/dashboard/components/cola-dashboard.js` — nuevo
- `src/dashboard/movil/pantalla-cola.js` — nuevo

## Criterios de terminado (DoD)

- [ ] `POST /api/cola` crea una tarea válida con todos los campos
- [ ] `GET /api/cola` devuelve las tareas filtradas correctamente
- [ ] Validación rechaza tareas con modo inválido o falta de `mensaje`
- [ ] El dashboard muestra la cola con estados visualizados correctamente
- [ ] `DELETE /api/cola/:id` rechaza cancelar una tarea `en-curso` con error claro
- [ ] El WS emite `sync_delta` al crear/actualizar tareas (la PWA los verá en 3.5)
- [ ] Commit `feat(e3-cola-json): schema y CRUD de cola de tareas multi-IA`
- [ ] Tag `v3.4.0-cola-json`

## Notas para el agente

- **`ia_destino` en etapa 3 es siempre `"claude-code"`.** El runner de 3.6 solo soporta Claude Code CLI. Otros destinos (claude.ai web, chatgpt) se consideran en etapas posteriores. El campo existe en el schema para extensibilidad, pero no filtres en él todavía.
- **El campo `prioridad` es un entero: menor número = mayor prioridad.** La tarea 0 va antes que la 1. `mover-arriba` decrementa, `mover-abajo` incrementa. Reordenar el array antes de guardar.
- **`conversacion_id` y `proyecto_id` son opcionales.** Una tarea puede existir "suelta" sin pertenecer a una conversación específica. Pero si se especifican, el output se asocia a esa conversación.

## Preguntas abiertas

- **¿Límite de tareas en cola?** ¿Cuántas puede haber? 50 parece razonable para una persona. **Propuesta:** límite de 100 con aviso visual al llegar a 50. No bloquear, advertir.
- **¿Programar tareas para una hora?** Combinar cola con scheduler: "ejecuta esta tarea a las 10:00". Interesante pero compleja. **Propuesta:** en 3.5, si la tarea tiene `programado_para`, el runner espera hasta esa hora.
