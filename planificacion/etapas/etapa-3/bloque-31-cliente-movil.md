# Bloque 3.1 — Cliente móvil (PWA)

**Etiqueta:** `e3-cliente-movil`
**Tag de git:** `v3.1.0-cliente-movil`
**Estado:** 💭 plan
**Depende de:** 3.0

## Objetivo en una línea

Una PWA mínima accesible desde cualquier dispositivo de la red WiFi local, que muestra el dashboard completo adaptado a pantalla pequeña.

## Narrativa — por qué este bloque existe

El dashboard de PC es perfecto para trabajar en profundidad. El móvil cubre otro caso: consulta rápida, dictado corto, ver la respuesta que acaba de llegar mientras estás en otra habitación. No queremos duplicar el dashboard — queremos que el mismo servidor sirva una vista optimizada para táctil y pantalla pequeña.

La clave es que no hay instalación. El usuario escribe la IP local en Safari o Chrome del móvil, acepta el certificado autofirmado una vez, y ya lo tiene. Puede añadirlo a la pantalla de inicio como app — eso es PWA.

## Decisiones técnicas

- **Mismo servidor, distinta ruta.** El servidor ya sirve el dashboard en `/`. La PWA móvil se sirve en `/movil/` (o se detecta automáticamente si el viewport es pequeño). Razón: no levantar otro servidor, no duplicar lógica de backend.
- **Detección automática de mobile.** `User-Agent` y viewport width. Si el cliente es claramente móvil, redirigir a `/movil/`. Si no, respeta la ruta. Razón: los usuarios no deberían tener que recordar dos URLs.
- **`manifest.json` para "Añadir a pantalla de inicio".** Define nombre, icono, color de tema, `display: standalone`. Razón: la experiencia de app sin pasar por tienda.
- **Service Worker mínimo.** Solo para que el navegador registre la PWA y permita instalación. Sin cache offline agresiva — el producto necesita WiFi local de todas formas. Razón: no complicar con estrategias de cache que no aportan dado el caso de uso.
- **Mismo token de autenticación que WS.** La PWA obtiene el token en el primer acceso (embed en la página HTML servida por el servidor, no hardcodeado). Si el token no coincide, la página redirige a pantalla de configuración.

## Layout de la PWA

Pantalla de inicio (lista de conversaciones):
```
┌─────────────────────────┐
│ Dashboard IA    [⚙️] [+] │
├─────────────────────────┤
│ 🔵 Claude               │
│   Última msg: hace 2h   │
├─────────────────────────┤
│ 🟢 ChatGPT              │
│   Última msg: ayer      │
├─────────────────────────┤
│ ⏱ Próximo envío: 15:30  │
└─────────────────────────┘
```

Pantalla de conversación:
```
┌─────────────────────────┐
│ ← Claude                │
├─────────────────────────┤
│ [burbuja de mensaje]    │
│ [burbuja de mensaje]    │
│ [burbuja capturada 🔵]  │
├─────────────────────────┤
│ [textarea] [🎤] [enviar]│
└─────────────────────────┘
```

## Qué hay que construir

### En el servidor

- **Ruta `/movil/`** que sirve `dashboard/movil/index.html`
- **Middleware de detección mobile** que redirige automáticamente si aplica

### Nueva carpeta `dashboard/movil/`

- **`index.html`** — entrada, carga el manifiesto y el JS
- **`manifest.json`** — PWA manifest
- **`sw.js`** — Service Worker mínimo (registro, no cache)
- **`movil.css`** — estilos: touch-friendly (botones grandes, sin hover), sin sidebar, una columna
- **`movil.js`** — lógica: conecta al WS del servidor (`ws-client.js` adaptado), renderiza la lista y las conversaciones

### Reutilización del código existente

La PWA no duplica la lógica de datos — llama a los mismos endpoints REST que el dashboard de PC (`/api/conversaciones`, `/api/mensajes`, etc.). El WS client es el mismo `ws-client.js` del dashboard. Solo difiere el HTML/CSS/comportamiento de UI.

## Archivos afectados

- `dashboard/movil/` — nuevo (carpeta completa)
- `servidor/src/routes/static.js` — añadir ruta `/movil/`
- `servidor/src/plugins/mobile-detect.js` — nuevo (middleware detección)
- `servidor/src/index.js` — registrar plugin

## Criterios de terminado (DoD)

- [ ] Escribir `192.168.X.X:3333` en Chrome del móvil muestra la PWA (con WiFi local)
- [ ] Lista de conversaciones actualizada en tiempo real cuando llega una captura desde el PC
- [ ] Pantalla de conversación muestra mensajes scroll correctamente en móvil
- [ ] "Añadir a pantalla de inicio" funciona en iOS Safari y Android Chrome
- [ ] La autenticación rechaza conexiones sin token
- [ ] Commit `feat(e3-cliente-movil): PWA móvil con detección automática y manifest`
- [ ] Tag `v3.1.0-cliente-movil`

## Cómo usarlo

1. Con el servidor corriendo, abre Chrome en el móvil
2. Escribe `192.168.X.X:3333` (la IP del PC)
3. Primera vez: acepta el certificado autofirmado
4. Ves el dashboard adaptado a móvil
5. Opcional: "Añadir a pantalla de inicio" → icono de app

## Notas para el agente

- **Encontrar la IP local en Windows:** `ipconfig | findstr "IPv4"`. Mostrarla en el dashboard de PC para facilitar al usuario.
- **iOS Safari y WS:** Safari en iOS tiene soporte WS completo desde iOS 14+. Sin problemas.
- **El dictado de voz del móvil (`🎤`) usa la API del propio navegador móvil (Web Speech).** Recuerda que está desactivado en el PC (bloque 1.0), pero en móvil es el micrófono nativo del propio dispositivo y no pasa por Google Desktop — el contexto es diferente. Evaluar si incluirlo aquí o dejarlo para etapa 5.
- **No hagas la PWA demasiado "app completa".** El caso de uso del móvil es leer y dictar, no editar configuración compleja. Si algo no cabe en móvil, es señal de que no pertenece ahí.

## Preguntas abiertas

- **¿Vista de cola en el móvil?** Ver las tareas en cola y su estado. Útil pero no urgente. **Propuesta:** incluir como pantalla simple (lista de tareas con estado), no como control completo.
- **¿QR code en el dashboard de PC para facilitar el acceso inicial desde móvil?** El PC muestra un QR con `wss://192.168.X.X:3333` que el móvil escanea. Comodidad pura. **Propuesta:** si es trivial de implementar, incluirlo en 3.1; si no, en 3.11.
