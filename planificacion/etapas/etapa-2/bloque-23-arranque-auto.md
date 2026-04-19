# Bloque 2.3 — Arranque automático

**Etiqueta:** `e2-arranque-auto`
**Tag de git:** `v2.3.0-arranque-auto`
**Estado:** 💭 plan
**Depende de:** 2.0

## Objetivo en una línea

Un acceso directo o script que arranca el servidor y abre el dashboard en Chrome en un solo clic, sin que el usuario toque la terminal.

## Narrativa — por qué este bloque existe

Lo decisivo para un usuario no técnico es que el proyecto "se abra como cualquier otra cosa". No vale pedir "abre una terminal, escribe `npm start`, luego abre el navegador en localhost:3333". Eso es la frontera entre "producto usable" y "proyecto para programadores". Este bloque cruza esa frontera.

El técnico que clona el repo no necesita este bloque para nada — ya sabe arrancar Node. Pero el paquete de pago, y la experiencia del usuario final, dependen de que arrancar sea trivial. Por eso este bloque existe y por eso es simple.

## Decisiones técnicas

- **Script `.bat` para Windows, `.command` para macOS, `.sh` para Linux.** Razón: cada OS tiene su forma de "doble clic en un archivo para ejecutar". No unificamos con Electron o similar porque eso es etapa 5.
- **El script arranca el servidor como proceso hijo y abre el navegador.** Razón: un solo archivo, un solo clic, todo lo que el usuario espera.
- **Detectar si el servidor ya está arriba antes de arrancarlo.** Razón: si el usuario hace doble clic dos veces, no queremos dos procesos chocando en el puerto 3333.
- **Auto-arranque con el sistema operativo es opcional y viene deshabilitado.** Razón: que algo arranque solo sin preguntar es intrusivo. Poner un botón "Arrancar con el sistema" en el dashboard en una fase posterior.
- **Usar `npx open` o equivalente para abrir el navegador.** Razón: maneja la diferencia entre Chrome por defecto y "abre con Chrome específicamente" en cada OS.
- **Abrir Chrome con `--app=http://localhost:3333`** para modo ventana sin barra de pestañas. Razón: se siente como una app nativa, es lo que el usuario no técnico espera de un "programa".

## Qué hay que construir

```
scripts/
├── arrancar.bat         # Windows
├── arrancar.command     # macOS
└── arrancar.sh          # Linux
```

Contenido mínimo (Windows como ejemplo):

```bat
@echo off
cd /d "%~dp0.."
cd servidor
:: Comprobar si el servidor ya responde
curl -s http://localhost:3333/health >nul 2>&1
if %errorlevel% neq 0 (
  start "Dashboard IA Server" /B node src/index.js
  timeout /t 2 /nobreak >nul
)
start chrome --app=http://localhost:3333
```

Versión mac/linux equivalente.

Además:

- **`src/dashboard/index.html` servido por el servidor en `/`.** Razón: unificar el origen. La API está en `localhost:3333`, el HTML también. Evita CORS para el caso más común.
- **`src/servidor/src/plugins/static.js`** — sirve `src/dashboard/` como estático.

## Archivos afectados

- `src/scripts/arrancar.bat` — nuevo
- `src/scripts/arrancar.command` — nuevo
- `src/scripts/arrancar.sh` — nuevo
- `src/servidor/src/plugins/static.js` — nuevo
- `src/servidor/src/index.js` — registrar plugin estático

## Criterios de terminado (DoD)

- [ ] Doble clic en `arrancar.bat` (Windows) arranca servidor + abre Chrome en modo app
- [ ] El segundo doble clic no duplica procesos
- [ ] El dashboard se ve en `localhost:3333/` (servido por el servidor, no abierto como archivo)
- [ ] Cerrar el servidor (matar el proceso) no deja ficheros colgados
- [ ] Commit `feat(e2-arranque-auto): scripts de arranque y servir dashboard estático`
- [ ] Tag `v2.3.0-arranque-auto`

## Notas para el agente

- **No metas Electron aquí.** Es tentador. No lo hagas. Esto debe ser un script bash/bat simple. Electron es parte de etapa 5.
- **Testea los tres OS.** Si no tienes macOS/Linux a mano, al menos deja los scripts escritos y marcados como "sin probar" en el MANIFEST. El agente que siga lo probará.
- **El modo `--app` de Chrome es clave.** Sin él, la experiencia se siente como "una página web más", y se pierde la sensación de aplicación.
- **El `timeout 2` espera a que el servidor arranque antes de abrir el navegador.** Si es demasiado rápido, el navegador llega antes y muestra error. Si es demasiado lento, el usuario percibe lentitud. 2 segundos es el sweet spot empírico.

## Preguntas abiertas

- ¿Auto-arranque con el sistema en esta etapa o más tarde? **Propuesta:** más tarde. Añadir ahora complica el bloque con decisiones per-OS (launchd, systemd, startup folder). Ponerlo como feature opcional en el bloque de packaging (2.12).
