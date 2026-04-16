# Bloque 3.2 — Sincronización bidireccional

**Etiqueta:** `e3-sync-datos`
**Tag de git:** `v3.2.0-sync-datos`
**Estado:** 💭 plan
**Depende de:** 3.1

## Objetivo en una línea

Mensajes y estado del dashboard se sincronizan en tiempo real entre PC y móvil: lo que ocurre en uno aparece inmediatamente en el otro.

## Narrativa — por qué este bloque existe

El bloque 3.1 establece la conexión WS y sirve la PWA. Pero sin sincronización, el móvil es un snapshot estático que se queda desactualizado en segundos. Este bloque es el que convierte "puedo ver el dashboard en el móvil" en "el móvil y el PC están siempre sincronizados".

La sincronización tiene que ser práctica, no teórica perfecta. El producto corre en red local con un solo usuario. No necesitamos CRDTs ni resolución de conflictos distribuida. Necesitamos que cuando Claude responde en el PC, el móvil lo vea de inmediato.

## Decisiones técnicas

- **Modelo push desde servidor.** Cuando cualquier cliente (PC o móvil) crea/modifica un dato, lo manda al servidor via REST. El servidor persiste y luego emite `sync_delta` por WS a todos los conectados (incluido el cliente que lo creó, como confirmación). Razón: el servidor es la fuente de verdad, no hay estado duplicado en el cliente.
- **`sync_delta` con entidad + operación.** Cada cambio es `{ entidad: "mensaje", operacion: "create", datos: {...} }`. Los clientes suscritos aplican el delta a su estado local en memoria sin refetch. Razón: eficiencia (no recargar 200 mensajes porque llegó uno nuevo).
- **`sync_full` al conectar.** Al conectar por WS, el cliente pide `sync_full` para las entidades que le interesan. El servidor responde con el estado completo. A partir de ahí, solo deltas. Razón: estado inicial coherente sin polling.
- **Last-write-wins para conflictos.** Si PC y móvil modifican el mismo mensaje offline simultáneamente (improbable pero posible si hay pérdida de conexión), gana el último en llegar al servidor. Se guarda `updated_at` en cada entidad. Razón: en uso real de una sola persona, los conflictos son rarísimos. No vale la complejidad de OT/CRDT.
- **Cola offline en el cliente.** Si el WS cae (móvil pierde WiFi momentáneamente), las acciones del usuario se encolan localmente (`Array` en memoria, no localStorage). Al reconectar, se envían en orden. Razón: no perder el mensaje que el usuario dictó mientras había lag.

## Protocolo detallado

```js
// Al conectar: cliente pide estado inicial
→ { tipo: "subscribe", payload: { entidades: ["proyectos", "conversaciones", "mensajes"] } }

// Servidor responde con sync_full por entidad
← { tipo: "sync_full", payload: { entidad: "mensajes", datos: [...] } }

// A partir de ahí, deltas
← { tipo: "sync_delta", payload: { entidad: "mensaje", operacion: "create", datos: { id, texto, ... } } }
← { tipo: "sync_delta", payload: { entidad: "mensaje", operacion: "update", datos: { id, texto, ... } } }
← { tipo: "sync_delta", payload: { entidad: "mensaje", operacion: "delete", datos: { id } } }
```

## Qué hay que construir

### En el servidor

- **`broadcaster.js` (extender 3.0):**
  - `emitDelta(entidad, operacion, datos)` — se llama desde cada ruta REST tras persistir
  - `handleSubscribe(socket, entidades)` — gestiona qué entidades sigue cada cliente
  - `enviarSyncFull(socket, entidades)` — lee storage y manda el estado completo

### En el dashboard (PC y móvil)

- **`sync-manager.js`** (compartido):
  - Recibe eventos WS (`sync_delta`, `sync_full`)
  - Aplica deltas al store en memoria
  - Emite eventos DOM `'datos:actualizado'` para que los componentes re-rendericen
  - Gestiona la cola offline

- **Actualizar componentes** para escuchar `'datos:actualizado'` en lugar de fetch manual periódico

## Archivos afectados

- `servidor/src/ws/broadcaster.js` — extender con `emitDelta` y `handleSubscribe`
- `servidor/src/routes/mensajes.js` — llamar broadcaster tras cada write
- `servidor/src/routes/proyectos.js` — ídem
- `servidor/src/routes/conversaciones.js` — ídem
- `dashboard/sync-manager.js` — nuevo (PC)
- `dashboard/movil/sync-manager.js` — nuevo (móvil) o importar el mismo

## Criterios de terminado (DoD)

- [ ] Crear un mensaje en el PC → aparece en el móvil en < 500ms sin recargar
- [ ] Crear un mensaje en el móvil → aparece en el PC en < 500ms
- [ ] Eliminar un mensaje en el PC → desaparece del móvil
- [ ] Si el móvil pierde WiFi 10s y vuelve, los mensajes creados durante la pérdida llegan correctamente
- [ ] `sync_full` al conectar devuelve el estado actual sin inconsistencias
- [ ] Commit `feat(e3-sync-datos): sincronización bidireccional en tiempo real PC ↔ móvil`
- [ ] Tag `v3.2.0-sync-datos`

## Notas para el agente

- **No emitas sync_delta al cliente que originó el cambio si no es necesario.** La mayoría de implementaciones lo envían a todos incluido el originador (más simple). Si eso causa dobles renders, filtrarlo por `socket.id`. Empezar simple (todos) y ajustar si hay problema.
- **Los arrays de mensajes pueden ser grandes (200+ items) en `sync_full`.** Considerar límite: solo los últimos 50 de cada conversación en el `sync_full` inicial, el resto por demanda. Posponer si no hay problemas de rendimiento reales.
- **Probar en red real, no solo localhost.** La latencia WiFi (aunque mínima) puede revelar condiciones de carrera que en localhost no aparecen.

## Preguntas abiertas

- **¿Sincronizar también documentos adjuntos (PDFs)?** Los archivos son pesados para transmitir por WS. **Propuesta:** no sincronizar binarios — el móvil muestra el nombre del archivo con un enlace para descargarlo vía HTTP si lo necesita.
- **¿Qué pasa con múltiples PCs en la misma red?** Todos ven los cambios de todos. Puede ser deseable (compartir sesión) o no (privacidad). **Propuesta:** documentarlo como "feature", no gestionarlo como problema.
