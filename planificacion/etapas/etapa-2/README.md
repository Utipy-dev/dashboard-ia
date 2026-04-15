# Etapa 2 — Servidor local 💭

**Pitch de la etapa:** "El servidor local resuelve todo lo que la etapa 1 no podía tocar: permisos persistentes, documentos, captura desde la IA, envío programado. Sin salir de tu máquina."

## Qué es esta etapa

La primera versión publicable del producto. Todo sigue corriendo en `localhost`, nada se envía a la nube, nada requiere cuentas. Pero por debajo del dashboard ahora hay un servidor Node.js que arranca con el sistema, expone una API REST para los datos, atiende una extensión de Chrome que captura lo que escribes en tu IA, y programa envíos futuros.

## Por qué "localhost" y no "HTML puro"

La etapa 1 demostró que el flujo funciona. Pero funcionaba a medias por tres razones concretas:

1. **Chrome pierde el permiso del File System Access al cerrar la pestaña.** Cada sesión volvía a empezar con "elige carpeta". En uso diario eso es una fricción insoportable.
2. **No se pueden manejar archivos reales.** Imágenes vía Ctrl+V sí, pero PDFs, múltiples archivos al portapapeles, documentos de Office — imposible sin un proceso que los toque desde fuera del sandbox del navegador.
3. **No se puede tocar otras pestañas.** La extensión de Chrome sí puede, y para hablar con ella necesitas un servidor local que haga de pegamento entre el dashboard y el content script que lee la pestaña de la IA.

Un servidor local elimina las tres de golpe. Sigue siendo "solo tu máquina" — el principio de minimizar actores externos se mantiene — pero con las manos libres.

## Por qué Node.js

- **Un solo lenguaje en todas las capas.** Dashboard en JS, extensión Chrome en JS, servidor en JS. Para un proyecto publicado como narrativa, la legibilidad cruzada es valor real.
- **`child_process` para la cola multi-IA.** En etapa 3, el servidor lanzará `claude -p` como subproceso. Node lo hace trivial.
- **WebSocket sin fricción con Fastify o similar.** Lo vamos a necesitar en etapa 3 para el móvil.
- **Comunidad GitHub de herramientas de IA mayoritariamente JS/TS.** Más probable que alguien contribuya si el lenguaje le resulta familiar.

Alternativas consideradas y descartadas: Python (mezclaría lenguajes y aleja al público técnico JS), Go (excelente pero menos familiar para la comunidad objetivo), Rust (overkill para lo que hay que hacer).

## Qué quedará al final de esta etapa

- Un servicio `dashboard-ia-server` corriendo en background, con arranque automático al iniciar sesión en el sistema
- Un dashboard web idéntico por fuera pero consumiendo API REST por dentro
- Una extensión de Chrome que captura texto de las interfaces de Claude, ChatGPT, Gemini, etc.
- Un sistema de envío programado con cronómetro por mensaje
- Soporte de documentos (PDF y otros) con visualización como icono + nombre
- Copiado real de múltiples archivos al portapapeles del sistema
- Un instalador one-click que lo deja todo listo
- Primer release público bajo `v2.12.0`

## Cómo se ordenan los bloques

Los bloques están ordenados para que cada uno sea demostrable solo, sin necesitar a los siguientes. Si en cualquier momento decides "ya basta con lo que hay", el producto sigue siendo usable — solo con menos funciones.

1. **2.0 Servidor base** — servidor arriba, responde "hola" en `/health`
2. **2.1 Storage API** — API REST completa sobre los 4 JSON
3. **2.2 Migración del cliente** — dashboard deja de usar File System Access y pasa a `fetch`
4. **2.3 Arranque automático** — script que arranca el servidor con el sistema y abre el dashboard en Chrome
5. **2.4 Extensión base** — extensión Chrome mínima con popup
6. **2.5 Captura desde interfaz IA** — content script que lee el textarea de la IA antes del envío
7. **2.6 Configuración por IA** — UI en el dashboard para añadir IAs con sus selectores
8. **2.7 Documentos** — soporte de PDF y otros
9. **2.8 Copiar archivos reales** — múltiples archivos al portapapeles via carpeta temp
10. **2.9 Envío programado** — scheduler local con cronómetro por mensaje
11. **2.10 Reserva de sesión** — caso especial del scheduler para mantener sesión viva
12. **2.11 Simplificación** — repaso general y limpieza aprovechando el servidor
13. **2.12 Packaging** — instalador y primer release público

## Demostrabilidad

Al terminar esta etapa, un usuario cualquiera debería poder:

1. Descargar el release desde GitHub
2. Ejecutar el instalador (o seguir la guía)
3. Abrir el dashboard automáticamente
4. Instalar la extensión desde la Chrome Web Store
5. Configurar su IA favorita
6. Escribir, acumular, programar envíos
7. Ver sus mensajes aparecer en el dashboard cuando los escribe en la interfaz de la IA

Sin tocar terminal. Sin editar configs. Sin entender cómo funciona por dentro.

## Demostrabilidad del técnico

El técnico que clona el repo debería poder:

1. `git clone`
2. `npm install`
3. `npm run dev`
4. Abrir `localhost:3333`
5. Cargar la extensión en Chrome modo desarrollo

Y trabajar. Sin instalador, sin packaging. Esa es la diferencia entre los dos públicos — y lo que hace coherente el modelo "código abierto, paquete de pago".
