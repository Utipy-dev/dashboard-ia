# Bloque 5.0 — App shell nativa

**Etiqueta:** `e5-app-shell`
**Tag de git:** `v5.0.0-app-shell`
**Estado:** 💭 plan
**Depende de:** 4.2

## Objetivo en una línea

Envolver el servidor local en una app nativa que arranque con el sistema, viva en la bandeja del sistema y no requiera tener una ventana de terminal abierta.

## Narrativa — por qué este bloque existe

Hasta etapa 4, usar el dashboard requiere: abrir una terminal, ejecutar el script de arranque, no cerrar la terminal. Para usuarios técnicos es aceptable. Para usuarios no técnicos que compraron el paquete, es un punto de fricción que genera soporte.

La app shell resuelve eso: el servidor arranca automáticamente al encender el PC, vive en el icono de la bandeja del sistema, y el usuario simplemente hace clic en "Abrir dashboard". No hay terminal visible.

## Decisiones técnicas (borrador, decidir al llegar)

La decisión principal es la tecnología del shell. Las opciones al llegar a etapa 5:

- **Electron.** Maduro, enorme comunidad, 200MB+. Probablemente excesivo para envolver un servidor Node.js.
- **Tauri.** ~10MB, Rust, pero requiere aprender Rust para el shell nativo. La web UI sigue siendo el dashboard HTML/JS.
- **Node SEA (Single Executable Application).** Node 20+ permite empaquetar un script Node como ejecutable standalone. Con `systray` npm package para el icono. Sin framework extra. La opción más ligera. **Propuesta: Node SEA + systray.**
- **pkg (Vercel).** Alternativa a Node SEA si la versión de Node del usuario no soporta SEA. Madurez probada.

El shell solo necesita: arrancar el servidor Node, mostrar un icono en la bandeja, menú contextual (Abrir dashboard, Detener, Salir).

## Qué hay que construir (borrador)

- `app/main.js` — entrada del ejecutable, arranca el servidor, crea el systray
- `app/systray.js` — icono en bandeja, menú contextual
- `app/autostart/` — scripts para registrar el autoarranque por OS:
  - Windows: clave en `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
  - macOS: `LaunchAgent` plist en `~/Library/LaunchAgents/`
  - Linux: `.desktop` en `~/.config/autostart/`
- Actualizar `src/packaging/` para generar el ejecutable + instalador

## Criterios de terminado (DoD)

- [ ] Instalar el app: el servidor arranca automáticamente en el siguiente inicio del PC
- [ ] Icono en bandeja del sistema con menú: Abrir dashboard / Detener servidor / Salir
- [ ] "Abrir dashboard" abre `localhost:3333` en el navegador por defecto
- [ ] La terminal no es visible durante el uso normal
- [ ] Commit `feat(e5-app-shell): app shell nativa con systray y autoarranque`
- [ ] Tag `v5.0.0-app-shell`

## Notas para el agente

- **La decisión entre Electron/Tauri/SEA se toma en etapa 5, no antes.** El ecosistema cambia rápido. Evaluar las opciones actuales cuando llegue el momento.
- **El autoarranque es opt-in, no obligatorio.** Preguntarlo durante la instalación: "¿Arrancar Dashboard IA automáticamente al iniciar Windows? [Sí / No]".
