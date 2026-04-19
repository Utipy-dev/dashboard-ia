# Bloque 2.4 — Extensión Chrome base

**Etiqueta:** `e2-extension-base`
**Tag de git:** `v2.4.0-extension-base`
**Estado:** 💭 plan
**Depende de:** 2.0

## Objetivo en una línea

Extensión de Chrome mínima (manifest v3) con un popup que muestra si el servidor local está arriba y permite una ping test.

## Narrativa — por qué este bloque existe

La captura desde la interfaz de la IA (bloque 2.5) solo es posible con una extensión: un HTML normal no puede leer el textarea de otra pestaña. Pero construir una extensión implica tocar muchas piezas: manifest, permisos, content scripts, background workers, comunicación con el servidor. Meter todo eso junto con la lógica de captura es pedir bugs.

Por eso este bloque construye **la infraestructura de la extensión sin captura todavía**. El popup, los permisos, la comunicación con el servidor, la estructura de archivos. Todo preparado para que el bloque 2.5 solo tenga que añadir el content script de captura, sin pensar en empaquetado.

## Decisiones técnicas

- **Manifest v3, no v2.** Razón: v2 está deprecado. Chrome lo retira progresivamente. No hay alternativa viable.
- **Service worker en lugar de background page.** Razón: es lo que manifest v3 obliga. Ligeramente más incómodo pero es el estándar actual.
- **Permisos mínimos iniciales: `storage` y `activeTab`.** Razón: empezar con lo mínimo. Cuando 2.5 añada captura, pedirá `host_permissions` para las URLs de las IAs configuradas. Cuanto más tarde pidamos permisos, menos asustamos al usuario al instalar.
- **Popup en HTML/CSS/JS vanilla, sin frameworks.** Razón: coherencia con el resto del proyecto. Además, los popups son pequeños y no justifican un bundler.
- **La extensión y el servidor se hablan por `fetch` a `localhost:3333`.** Razón: es localhost, la extensión puede hablar directamente con él (aunque con permisos de host_permissions más adelante para esas URLs).
- **Nombre del paquete `dashboard-ia-chrome`.** Razón: diferenciarlo del dashboard web en el repo.

## Qué hay que construir

```
extension/
├── manifest.json
├── popup/
│   ├── popup.html       # UI mínima: estado del servidor + botón "abrir dashboard"
│   ├── popup.css
│   └── popup.js         # llama a localhost:3333/health, muestra OK o error
├── background/
│   └── service-worker.js  # placeholder, sin lógica todavía
└── icons/
    ├── 16.png
    ├── 48.png
    └── 128.png          # iconos placeholder, se sustituyen por reales en 2.12
```

### manifest.json

```json
{
  "manifest_version": 3,
  "name": "Dashboard IA",
  "version": "0.1.0",
  "description": "Captura y orquesta tus conversaciones con IAs",
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["http://localhost:3333/*"],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": { "16": "icons/16.png", "48": "icons/48.png" }
  },
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "icons": { "16": "icons/16.png", "48": "icons/48.png", "128": "icons/128.png" }
}
```

### popup

- Al abrir, hace `fetch('http://localhost:3333/health')`
- Si responde: muestra "Servidor: OK · v2.X.Y" en verde + botón "Abrir dashboard" (que abre `localhost:3333/` en una nueva pestaña)
- Si no responde: muestra "Servidor no accesible" en rojo + pasos para arrancarlo

## Archivos afectados

- `src/extension/**` — todo nuevo

## Criterios de terminado (DoD)

- [ ] La extensión se carga en Chrome en modo desarrollo (`chrome://extensions` → Load unpacked → seleccionar `src/extension/`)
- [ ] El popup muestra el estado real del servidor (verde si arriba, rojo si no)
- [ ] El botón "Abrir dashboard" abre `localhost:3333/` en una nueva pestaña
- [ ] No hay errores en la consola del service worker
- [ ] Commit `feat(e2-extension-base): extensión Chrome manifest v3 con popup de estado`
- [ ] Tag `v2.4.0-extension-base`

## Cómo usarlo

1. Abre Chrome → `chrome://extensions`
2. Activa "Modo de desarrollador"
3. "Cargar descomprimida" → selecciona la carpeta `src/extension/`
4. Aparece el icono en la barra
5. Clic en el icono → ves el estado del servidor

## Notas para el agente

- **Los iconos pueden ser placeholders (un cuadrado de color) en este bloque.** Los iconos definitivos llegan con el packaging en 2.12. No te bloquees buscando un logo.
- **`host_permissions` para `localhost` es necesario en manifest v3.** Sin él, `fetch` desde el popup a localhost falla. Es un error común.
- **El service worker se despierta y se duerme.** No asumas que tiene estado en memoria persistente. Si necesitas guardar algo entre activaciones, usa `chrome.storage`.
- **Carga unpacked no requiere firma.** La firma (Chrome Web Store) es cosa del bloque 2.12 y de etapa 4.
