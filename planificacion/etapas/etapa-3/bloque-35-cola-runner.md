# Bloque 3.5 — Runner de la cola

**Etiqueta:** `e3-cola-runner`
**Tag de git:** `v3.5.0-cola-runner`
**Estado:** 💭 plan
**Depende de:** 3.4

## Objetivo en una línea

El servicio que coge tareas de la cola una a una, las ejecuta y actualiza su estado, con pausa, reanudación y reintento en caso de error.

## Narrativa — por qué este bloque existe

El bloque 3.4 es el modelo de datos. Este bloque es el motor. Sin el runner, la cola es una lista estática. El runner la convierte en automatización real: el usuario prepara tareas, pulsa "Iniciar cola", y el servidor las va ejecutando en segundo plano mientras el usuario hace otra cosa.

Es también el bloque que define los contratos de qué se espera de cualquier ejecutor (claude-code, otros futuros): el runner llama a una función `ejecutar(tarea)` y espera `{ ok, output, error }`. Los bloques 3.6-3.8 rellenan esa función para cada modo.

## Decisiones técnicas

- **Ejecución estrictamente secuencial.** Una tarea a la vez. La siguiente no empieza hasta que la actual termina (o falla). Razón: rate limits de las IAs. Dos llamadas simultáneas a Claude Code pueden colisionar.
- **Máquina de estado explícita.** `pendiente → en-curso → done | error`. Si se cancela una `en-curso`, se espera que termine y se marca `cancelado` al final (o se mata el proceso con `SIGTERM` y se marca `cancelado`). No estados ambiguos.
- **Un reintento automático en error.** Si la tarea falla, se reintenta una vez después de 30s. Si falla de nuevo, queda en `estado: "error"` y el runner continúa con la siguiente. Razón: errores transitorios (IA no responde, timeout de red) son comunes.
- **Pausa explícita.** El usuario puede pausar la cola (`estado_cola: "pausado"`). El runner termina la tarea actual y no coge la siguiente hasta que se reanude. Razón: el usuario puede querer interrumpir para revisar el output de la primera tarea antes de continuar.
- **Broadcastea progreso por WS.** Cada cambio de estado de tarea emite `cola_update`. La UI del PC y del móvil muestran progreso en tiempo real.

## Interface del ejecutor

El runner llama al módulo correcto según `tarea.modo`:

```js
// servidor/src/cola/ejecutores/index.js
export function ejecutar(tarea) {
  switch (tarea.modo) {
    case 'limpio':    return ejecutarLimpio(tarea)    // bloque 3.6
    case 'contexto':  return ejecutarContexto(tarea)  // bloque 3.7
    case 'continuar': return ejecutarContinuar(tarea) // bloque 3.8
  }
}
// Cada ejecutor devuelve: { ok: bool, output: string, error?: string }
```

En este bloque (3.5), los ejecutores son stubs que devuelven `{ ok: true, output: "stub" }` para que el runner funcione end-to-end antes de implementar la lógica real.

## Estado global de la cola

```json
// servidor/data/cola/estado.json
{
  "corriendo": false,
  "pausado": false,
  "tarea_activa_id": null
}
```

## Endpoints nuevos

```
POST /api/cola/iniciar   — arranca el runner (si no está corriendo)
POST /api/cola/pausar    — pausa tras la tarea actual
POST /api/cola/reanudar  — reanuda desde donde pausó
GET  /api/cola/estado    — { corriendo, pausado, tarea_activa_id, pendientes_count }
```

## Qué hay que construir

- **`servidor/src/cola/runner.js`:**
  - Loop: `while (corriendo && !pausado) { tarea = cogerSiguiente(); ejecutar(tarea); }`
  - Gestión de estado (corriendo/pausado/tarea_activa)
  - Reintento único con espera de 30s
  - Broadcast de cada cambio de estado

- **`servidor/src/cola/ejecutores/index.js`:** despachador según modo
- **`servidor/src/cola/ejecutores/stub.js`:** implementación stub para probar el runner

- **`servidor/src/routes/cola.js`** (extender 3.4):
  - Añadir `POST /api/cola/iniciar`, `pausar`, `reanudar`, `GET /api/cola/estado`

- **`dashboard/components/cola-controls.js`:**
  - Botones "Iniciar", "Pausar", "Reanudar"
  - Estado visual: barra de progreso, tarea activa en curso, tiempo estimado

## Archivos afectados

- `servidor/src/cola/runner.js` — nuevo
- `servidor/src/cola/ejecutores/index.js` — nuevo
- `servidor/src/cola/ejecutores/stub.js` — nuevo (temporal)
- `servidor/src/routes/cola.js` — extender
- `servidor/src/index.js` — registrar runner al arrancar
- `dashboard/components/cola-controls.js` — nuevo

## Criterios de terminado (DoD)

- [ ] "Iniciar cola" con 3 tareas stub las ejecuta secuencialmente, una a una
- [ ] Estado `pendiente → en-curso → done` visible en la UI en tiempo real
- [ ] "Pausar" espera a que termine la tarea actual y detiene la cola
- [ ] "Reanudar" continúa desde la siguiente pendiente
- [ ] Si el stub falla (forzado), la tarea queda en `error` y la siguiente se ejecuta
- [ ] Reiniciar el servidor con tareas pendientes: el runner no arranca solo (esperando "Iniciar" manual)
- [ ] Commit `feat(e3-cola-runner): runner secuencial con pause/resume y reintento`
- [ ] Tag `v3.5.0-cola-runner`

## Notas para el agente

- **El runner no arranca automáticamente al iniciar el servidor.** El usuario lo inicia explícitamente. Razón: evitar que tareas programadas se disparen solas sin que el usuario esté pendiente. Si en el futuro se quiere autoarranque, es una opción de configuración.
- **Cuidado con `async/await` en el loop.** Un `while (true) { await ejecutar(tarea) }` bloquea la corrutina pero no el event loop de Node — está bien. Pero si `ejecutar` tarda mucho (ej. Claude Code procesando 10 minutos), asegúrate de que otras rutas HTTP siguen respondiendo. Node.js es single-threaded pero I/O-async, debería estar bien.
- **El runner guarda su estado en `estado.json` para sobrevivir reinicios.** Al arrancar el servidor, si `corriendo: true` en el JSON, resetear a `corriendo: false` (el proceso murió, hay que reiniciar manualmente). No reanudar automáticamente.

## Preguntas abiertas

- **¿Tiempo estimado de la cola?** Mostrar "≈ 15 min para terminar la cola" basado en el tiempo promedio de las últimas tareas. Útil pero especulativo. **Propuesta:** mostrar solo el conteo de pendientes, sin estimación de tiempo.
- **¿Notificación al terminar la cola?** Notificación del sistema operativo cuando todas las tareas estén done. **Propuesta:** sí, incluirlo en 3.9 o 3.11 — es un add-on natural al output.
