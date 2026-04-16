# Bloque 3.0 — WebSocket server

**Etiqueta:** `e3-ws-server`
**Tag de git:** `v3.0.0-ws-server`
**Estado:** 💭 plan
**Depende de:** 2.12

## Objetivo en una línea

Añadir un WebSocket server al servidor Fastify existente con TLS autofirmado, autenticación por token y protocolo de mensajes base para sincronización y cola.

## Narrativa — por qué este bloque existe

El servidor de etapa 2 es HTTP puro: el cliente pregunta, el servidor responde. Para sincronización en tiempo real (móvil, estado de cola) necesitamos la dirección inversa: el servidor empuja cambios al cliente sin que este pregunte. WebSocket es la pieza que falta.

Este bloque no construye nada visible para el usuario final — es infraestructura pura. Pero sin él, los bloques 3.1-3.10 no tienen base sobre la que construir.

## Decisiones técnicas

- **`@fastify/websocket`.** Se integra con el servidor Fastify existente como plugin. No hay que levantar un servidor separado ni abrir otro puerto. Limpio.
- **Puerto único (3333).** WS corre en el mismo puerto que HTTP/HTTPS, diferenciado por el path (`/ws`). Razón: menos configuración de firewall/router para el usuario.
- **TLS autofirmado con `mkcert`.** Razón: los navegadores modernos bloquean `ws://` (WebSocket sin cifrar) cuando la página está en HTTPS. Con `mkcert localhost 192.168.X.X`, el certificado es de confianza local: el usuario lo acepta una vez en el navegador del PC y una vez en el móvil. Alternativa rechazada: Let's Encrypt requiere dominio público, incompatible con uso local.
- **Autenticación por token.** Al conectar, el cliente envía `?token=<hash>` en la URL del handshake. El servidor verifica contra `servidor/data/config.json`. Si no coincide, cierra la conexión. Razón: evitar que cualquier dispositivo de la red local espíe o inyecte.
- **Protocolo JSON tipado.** Todos los mensajes WS tienen forma `{ tipo, payload, ts }`. Los tipos se definen en `servidor/src/ws/tipos.js` como constantes. Razón: los consumidores (móvil, cola) deserializan el mismo protocolo sin asumir nada.
- **Heartbeat cada 30s.** Si un cliente no responde al ping en 10s, se desconecta. Razón: detectar dispositivos que cierran WiFi sin avisar (móvil con pantalla apagada).

## Tipos de mensaje (protocolo inicial)

```js
// Servidor → cliente
{ tipo: "ping", payload: {}, ts }
{ tipo: "sync_delta", payload: { entidad, operacion, datos }, ts }
{ tipo: "cola_update", payload: { tarea_id, estado, progreso }, ts }

// Cliente → servidor
{ tipo: "pong", payload: {}, ts }
{ tipo: "subscribe", payload: { entidades: ["mensajes", "cola"] }, ts }
```

## Qué hay que construir

### En el servidor

- **Plugin `servidor/src/ws/plugin.js`:**
  - Registra `@fastify/websocket`
  - Maneja handshake con validación de token
  - Mantiene `Map<socket, { entidades }>`
  - Emite `ping` cada 30s, desconecta si no hay `pong`

- **`servidor/src/ws/broadcaster.js`:**
  - `broadcast(tipo, payload, filtro?)` — envía a todos los suscritos a `filtro.entidad`
  - Se llama desde los servicios de storage cada vez que hay un cambio (create/update/delete)

- **`servidor/src/ws/tipos.js`:**
  - Constantes de tipos de mensaje (evita strings sueltos)

- **Script `scripts/generar-cert.sh`:**
  - Usa `mkcert` (requiere instalado) para generar `cert.pem` + `key.pem`
  - Los guarda en `servidor/data/certs/`
  - Si `mkcert` no está, da instrucciones claras

- **`servidor/src/config.js`:**
  - Leer cert/key al arrancar
  - Generar token random si no existe en `config.json`

### En el dashboard (PC)

- **`dashboard/ws-client.js`:**
  - Conexión automática a `wss://localhost:3333/ws?token=...`
  - Reconexión con backoff exponencial (1s, 2s, 4s, max 30s)
  - Emite eventos DOM que los componentes pueden escuchar

## Archivos afectados

- `servidor/src/ws/plugin.js` — nuevo
- `servidor/src/ws/broadcaster.js` — nuevo
- `servidor/src/ws/tipos.js` — nuevo
- `servidor/src/config.js` — añadir cert/key/token
- `servidor/src/index.js` — registrar plugin WS
- `servidor/src/services/storage.js` — llamar broadcaster en cada write
- `scripts/generar-cert.sh` — nuevo
- `dashboard/ws-client.js` — nuevo
- `package.json` del servidor — añadir `@fastify/websocket`

## Criterios de terminado (DoD)

- [ ] `wss://localhost:3333/ws` acepta conexiones con token válido y las rechaza sin token
- [ ] El heartbeat detecta y desconecta clientes caídos en ≤ 40s
- [ ] Al crear un mensaje desde el dashboard, el evento `sync_delta` llega por WS al mismo cliente (eco de verificación)
- [ ] `scripts/generar-cert.sh` genera el certificado sin errores en Windows (Git Bash) y macOS
- [ ] El dashboard se reconecta solo si el servidor se reinicia
- [ ] Commit `feat(e3-ws-server): WebSocket server con TLS, autenticación y protocolo base`
- [ ] Tag `v3.0.0-ws-server`

## Notas para el agente

- **`mkcert` en Windows:** se instala con `winget install FiloSottile.mkcert` o descargando el `.exe`. El script debe detectar si no está y dar instrucciones.
- **El certificado va a `.gitignore`.** `servidor/data/certs/` contiene claves privadas. Nunca subir al repo.
- **El token también va a `.gitignore`.** Se genera local, no se comparte. Igual que un `.env`.
- **En desarrollo, no fuerces TLS.** Si `NODE_ENV=development` y no hay cert, usar `ws://` para facilitar pruebas. Documentar claramente.
- **`@fastify/websocket` v9+ requiere Fastify v4+.** Verificar compatibilidad con la versión elegida en 2.0.

## Preguntas abiertas

- **¿TLS en el puerto HTTP también?** Si el servidor pasa a HTTPS, el dashboard se sirve por HTTPS y WS puede ser WSS fácilmente. Pero complica el arranque. **Propuesta:** HTTP para dashboard servido localmente, HTTPS solo para WS (el path `/ws` usa TLS, el resto no). Técnicamente posible con Fastify.
- **¿Qué pasa si el usuario tiene dos PCs en la misma red?** Ambos se conectarían al mismo servidor. El sistema aguanta, pero puede haber confusión. **Propuesta:** documentarlo, no resolverlo en esta etapa.
