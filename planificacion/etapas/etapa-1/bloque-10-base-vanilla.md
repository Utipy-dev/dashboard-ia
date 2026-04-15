# Bloque 1.0 — Base vanilla

**Etiqueta:** `e1-base-vanilla`
**Tag de git:** `v1.0.0-base` (retrospectivo)
**Estado:** ✅ done
**Depende de:** — (primer bloque)

## Objetivo en una línea

Dashboard funcional como HTML abierto en Chrome, con persistencia local vía File System Access API y estructura de datos mínima.

## Narrativa — por qué este bloque existe

Antes de construir un servidor, un backend, una cola o cualquier pieza compleja, había que responder una pregunta: ¿el flujo de "preparar mensajes antes de enviarlos a la IA" tiene sentido para un usuario real? La forma más barata de responder esa pregunta era construir la versión más simple posible — un HTML que guarda en archivos JSON locales — y usarla a diario durante semanas. Si el flujo resultaba útil, añadir capas tendría sentido. Si no, habríamos evitado construir un servidor para un producto que nadie quería.

El flujo resultó útil. Por eso existen las etapas siguientes.

## Decisiones técnicas

- **HTML + CSS + JS puros, sin frameworks.** Razón: reducir al mínimo la superficie técnica. Un framework añade decisiones que luego hay que desandar.
- **File System Access API.** Razón: permite persistencia real en el disco del usuario sin servidor ni IndexedDB. Es lo más cercano a "un programa de escritorio" que ofrece el navegador.
- **4 archivos JSON separados** (`proyectos`, `ias`, `conversaciones`, `transcripciones`). Razón: cada uno tiene un ciclo de vida distinto. Separarlos facilita debugging y evita reescrituras grandes en cada cambio.
- **Layout split galería/panel.** Razón: el usuario necesita ver el contexto (galería) mientras trabaja en un mensaje (panel). Pantalla dividida minimiza clics y cambios de contexto.
- **Cronómetro por IA (no global).** Razón: cada IA tiene ritmos y ciclos distintos. Un único cronómetro global no captura cómo trabaja quien usa varias IAs al día.

## Qué contiene

- **`dashboard/index.html`** — punto de entrada
- **`dashboard/app.js`** — orquestador de estado y eventos
- **`dashboard/styles.css`** — todos los estilos, sin preprocesadores
- **`dashboard/storage/storage.js`** — capa de File System Access
- **`dashboard/components/*.js`** — componentes renderizados con innerHTML, sin Shadow DOM
- **`*.json`** — archivos de datos (ignorados en git, locales por diseño)

## Flujo principal

1. Usuario abre `dashboard/index.html` en Chrome
2. Primera vez: Chrome pide seleccionar carpeta donde guardar datos
3. Se cargan los 4 archivos JSON (o se crean vacíos si no existen)
4. Usuario navega proyectos → IAs → conversaciones → mensajes
5. Cada acción se persiste inmediatamente en el JSON correspondiente

## Archivos afectados

Ver sección "Qué contiene". Todo el código de `dashboard/` corresponde a este bloque + los bloques 1.1, 1.2 y 1.3 añadidos encima.

## Cómo usarlo

1. Clona el repo
2. Abre `dashboard/index.html` en Chrome (no Firefox — File System Access es Chromium-only)
3. Selecciona una carpeta cuando Chrome te lo pida (puede ser cualquiera)
4. Crea un proyecto → una IA → una conversación → empieza a escribir mensajes

## Notas para el agente

- **Chrome pierde el permiso del File System Access al cerrar la pestaña.** Esto no es un bug — es cómo funciona la API. Es la razón principal por la que la etapa 2 introduce un servidor: resuelve este problema de raíz.
- **No hay build.** Si cambias un archivo JS, refrescas Chrome y listo. No toques esta propiedad si modificas este bloque — es una decisión de diseño.
- **El `innerHTML` intencional.** Sí, usar innerHTML es "malo" por XSS en contextos con datos externos. Aquí todo el contenido viene de archivos locales del usuario, el vector XSS es el propio usuario sobre sí mismo. La simplicidad vale más que el framework defensivo en este contexto.
