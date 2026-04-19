# Bloque 2.5 — Captura desde interfaz de IA

**Etiqueta:** `e2-captura-interfaz`
**Tag de git:** `v2.5.0-captura-interfaz`
**Estado:** 💭 plan
**Depende de:** 2.4, 2.1

## Objetivo en una línea

La extensión observa el textarea de la IA configurada (Claude, ChatGPT, Gemini…) y, antes de que el usuario envíe un mensaje, captura el texto y lo guarda en el dashboard con contexto (proyecto, tema, timestamp).

## Narrativa — por qué este bloque existe

Es el corazón de la etapa 2. Todo lo demás (servidor, API, extensión base) existe para llegar aquí. Este bloque cierra el bucle que la etapa 1 no pudo cerrar: que el usuario siga trabajando en la interfaz que ya le gusta (Claude, ChatGPT, lo que sea), y que el dashboard se alimente solo de ese trabajo, sin pedirle al usuario que copie-y-pegue manualmente.

**Vale la pena aclarar la decisión ética.** La idea original era "interceptar" el envío del mensaje al servidor de la IA, de forma que no llegara a procesarse (y por tanto no consumiera tokens). Esa versión es problemática: aprovecha infraestructura ajena sin dar nada a cambio. La versión que se construye aquí es distinta: **el mensaje se envía a la IA igual**. Lo que hace la extensión es una copia adicional al dashboard local, como si el usuario hubiera hecho Ctrl+C antes de darle a enviar. El mensaje llega a la IA; el dashboard solo se queda con una réplica para que tengas historial unificado cross-IA. Consumo de recursos de la IA: idéntico a no usar la extensión.

Esta distinción importa decirla. La comunidad técnica se dará cuenta, y hay que dejar claro que la implementación es legítima.

## Decisiones técnicas

- **Content script inyectado en las URLs configuradas.** Razón: los content scripts pueden tocar el DOM de la página. Es lo único que puede leer el textarea de otra pestaña.
- **Selector CSS del textarea configurable por cada IA.** Razón: cada interfaz (Claude, ChatGPT, Gemini) tiene su propio HTML. Hardcodear un selector implica que cambies la extensión cada vez que Anthropic retoque la UI. Configurable = sobrevive cambios menores.
- **Escuchar el evento "envío".** Detectar que el usuario pulsó el botón de enviar o Enter. Razón: queremos capturar **el texto final** justo en el momento del envío, no drafts intermedios.
- **Copiar el texto, no interceptarlo.** Razón: ver la narrativa arriba. El mensaje sigue llegando a la IA normalmente. El content script solo hace una copia asíncrona al servidor local.
- **Contexto: proyecto/conversación activa en el dashboard.** Razón: el usuario tiene que haber seleccionado previamente a qué conversación va lo que capture. La extensión lee ese "contexto activo" del servidor al momento de capturar.
- **Captura solo texto en este bloque. Imágenes vienen después.** Razón: las imágenes son caso aparte (base64 desde el DOM, tamaños grandes, edge cases). Cerrar texto primero, añadir imágenes como sub-bloque si hace falta.
- **Feedback visual mínimo en la página capturada: un toast verde "Guardado en Dashboard".** Razón: el usuario tiene que saber que la captura ocurrió, sin que sea intrusivo.

## Qué hay que construir

### En la extensión

```
extension/
├── content/
│   ├── content-script.js    # se inyecta, observa el textarea, envía al servidor
│   └── toast.css            # estilos del toast
└── background/
    └── service-worker.js    # enruta mensajes entre content scripts y servidor
```

**Flujo del content script:**

1. Al cargar, lee la configuración de la IA activa (qué selectores usar) desde `chrome.storage` (puesto por el popup en 2.6).
2. Busca el textarea con el selector. Si no existe, reintenta cada 500ms con `MutationObserver` (las SPAs cargan después del load).
3. Engancha listeners al botón de enviar y a la tecla Enter en el textarea.
4. Cuando se detecta envío: lee el texto del textarea → enviar a `localhost:3333/api/captura` con el payload `{ ia_id, texto, url, timestamp }`.
5. El servidor decide en qué conversación guardarlo (la "activa" para esa IA).
6. Muestra toast verde "Guardado".

### En el servidor

```
servidor/src/routes/captura.js
```

**Endpoint:**

```
POST /api/captura
Body: { ia_id, texto, url, timestamp }
→ 201 { data: { mensaje_id, conversacion_id } }
```

El servidor:
1. Busca la conversación activa para esa `ia_id` (la que el usuario tenga abierta en el dashboard).
2. Si no hay conversación activa, crea una nueva con nombre autogenerado (`Captura — YYYY-MM-DD HH:MM`).
3. Crea el mensaje con el texto, marca `origen: "captura"` y lo guarda.
4. Emite un evento (en 3.x será por WebSocket; en este bloque, por simple cambio en el JSON que el dashboard detecta al refrescar).

### En el dashboard

- Lee `origen: "captura"` en los mensajes y los muestra con un indicador visual (icono o color) para distinguirlos de los escritos manualmente.

## Archivos afectados

- `src/extension/content/content-script.js` — nuevo
- `src/extension/content/toast.css` — nuevo
- `src/extension/background/service-worker.js` — ampliado
- `src/extension/manifest.json` — añadir `"content_scripts"` con matches configurables
- `src/servidor/src/routes/captura.js` — nuevo
- `src/servidor/src/storage/entities/conversaciones.js` — añadir "conversación activa"
- `src/dashboard/components/conversacion-card.js` — mostrar indicador de origen

## Criterios de terminado (DoD)

- [ ] Instalada la extensión, visitando Claude.ai, escribiendo un mensaje y pulsando enviar → el mensaje aparece en el dashboard en la conversación activa
- [ ] El mensaje también llega a Claude normalmente (verificar que la respuesta aparece en Claude)
- [ ] Toast verde visible en Claude.ai después del envío
- [ ] Si no hay conversación activa, se crea una nueva automáticamente
- [ ] Los mensajes capturados se distinguen visualmente en el dashboard
- [ ] Commit `feat(e2-captura-interfaz): captura automática del textarea de la IA antes del envío`
- [ ] Tag `v2.5.0-captura-interfaz`

## Cómo usarlo

1. Servidor arriba, extensión cargada
2. Desde el dashboard, configura Claude con su URL y selector (bloque 2.6)
3. Abre Claude.ai
4. Selecciona una conversación activa en el dashboard
5. Escribe en Claude y envía → aparece en el dashboard, y en Claude

## Notas para el agente

- **Los selectores cambian.** Documenta los selectores conocidos en `planificacion/selectores-ia.md` (a crear) y trata cada uno como "mejor esfuerzo", no como API estable. Cuando una IA cambia su HTML, hay que actualizar los selectores.
- **El botón de enviar y Enter son dos caminos distintos.** Asegúrate de capturar ambos. En Claude, Enter envía y Shift+Enter hace newline.
- **El `MutationObserver` puede dispararse a lo bruto en SPAs con mucho DOM.** Ponle un debounce razonable (200-500ms) y desconéctalo cuando ya hayas encontrado el textarea.
- **El toast debe ser añadido al `document.body`, no al DOM de la app.** Si lo añades dentro del contenedor de Claude, React lo puede arrastrar fuera en el siguiente render.
- **Ética.** Si en algún momento alguien propone "también interceptamos para no consumir tokens", recuerda la narrativa de este bloque. Rechaza.

## Preguntas abiertas

- **¿Captura de imágenes pegadas en el textarea?** En esta primera versión no. Como sub-bloque 2.5.1 si se pide explícitamente. El uso principal es texto.
- **¿Qué pasa si el usuario edita un mensaje en Claude y lo reenvía?** De momento, cada envío es una captura independiente. Deduplicar es complicado y no está claro que sea deseable.
