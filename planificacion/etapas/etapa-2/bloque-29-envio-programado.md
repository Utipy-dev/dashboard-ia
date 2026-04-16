# Bloque 2.9 — Envío programado

**Etiqueta:** `e2-envio-programado`
**Tag de git:** `v2.9.0-envio-programado`
**Estado:** 💭 plan
**Depende de:** 2.5

## Objetivo en una línea

Cualquier mensaje del dashboard puede tener un cronómetro opcional: cuando llegue la hora, el servidor abre la interfaz de la IA configurada, inyecta el mensaje y lo envía.

## Narrativa — por qué este bloque existe

Es la segunda gran novedad de etapa 2 (junto a la captura). Y es la más útil para el caso de uso real que motiva el producto: los tokens y las sesiones de las IAs están limitados. Una sesión de Claude se abre cuando envías el primer mensaje y "dura" unas horas. Si la abres a las 10:00, a las 15:00 ya está caducada — aunque no hayas usado casi nada. Mucha gente lo resuelve a mano: envían un mensaje tonto por la mañana ("Cuando te ponga 1, respóndeme 0") para reservar sesión y esperar a la tarde con tiempo por delante.

Este bloque automatiza ese patrón. El usuario prepara el mensaje con calma, le pone "envíalo a las 10:30", se olvida. A las 10:30, el servidor dispara el envío. Cuando el usuario llega a Claude a las 13:00, la sesión lleva 2.5 horas rodando y tiene las 2-3 horas siguientes disponibles.

No es un truco — es el uso óptimo del recurso que pagas. Los límites de tiempo de las IAs son ventanas deslizantes, y quien sabe empezarlas cuando le conviene las usa mejor.

## Decisiones técnicas

- **Scheduler en el servidor, no en el navegador.** Razón: el navegador puede estar cerrado. El servidor local corre en segundo plano, es el único que puede garantizar que el mensaje salga a la hora exacta.
- **Cron-like con precisión de minuto.** Razón: no necesitamos precisión de segundo. Simplifica y consume menos recursos.
- **Un mensaje tiene campo opcional `programado_para: ISO8601 | null`.** Razón: poner la fecha directamente en el mensaje (no tabla separada) mantiene el modelo simple. Para cancelar, basta con limpiar el campo.
- **El envío usa la misma extensión que captura.** Razón: reutilizamos infraestructura. El servidor indica a la extensión "abre `https://claude.ai`, pega este texto, envía". La extensión ya sabe tocar los textareas porque es lo que hace el bloque 2.5 (a la inversa).
- **Si al momento del envío la pestaña de la IA no está abierta, la abrimos.** Razón: requisito del caso de uso. El usuario puede estar fuera de casa, pero el PC local está encendido, y el servidor lanza una pestaña nueva.
- **Registro de envíos programados:** al dispararse, se marca `enviado_en: ISO8601` y `estado: "enviado" | "error"`. Razón: auditoría + permitir reintentos manuales.
- **Cola de mensajes "pendientes de envío" visible en el dashboard.** Razón: el usuario necesita ver qué va a salir y a qué hora.

## Qué hay que construir

### En el servidor

- **Servicio `scheduler.js`:**
  - Al arrancar, lee todos los mensajes con `programado_para` futuro → los carga en memoria
  - Al guardarse/actualizarse un mensaje con `programado_para`, se re-registra
  - Usa `setTimeout` por mensaje (o `node-cron` si son muchos)
  - Al disparar, llama al servicio `enviador.js`
- **Servicio `enviador.js`:**
  - Recibe `{ mensaje_id, ia_id }`
  - Construye la instrucción para la extensión: `{ accion: "enviar", url, texto, selector_textarea, selector_boton }`
  - La coloca en una cola que la extensión consulta (o por WebSocket en etapa 3)
  - Espera confirmación (con timeout)
  - Marca el mensaje como `enviado_en` o `estado: "error"`
- **Endpoint `GET /api/scheduler/pendientes`** — lista de mensajes con envío programado
- **Endpoint `POST /api/mensajes/:id/disparar-ahora`** — fuerza el envío inmediato (para debug y "enviar ya, no esperes")

### En el dashboard

- **Cronómetro por mensaje:** botón "⏰ Programar envío" en cada mensaje
- **Modal de programación:** selector de fecha/hora relativo ("+15 min", "+1h", "mañana 10:00") y absoluto
- **Sección "Pendientes de envío"** en el dashboard que lista los mensajes con programación activa

### En la extensión

- **Content script reconoce el comando "enviar desde servidor":**
  - Al cargar página de una IA configurada, consulta al servidor si hay algo pendiente
  - Si lo hay: inyecta el texto en el textarea, dispara el botón de enviar
  - Reporta al servidor: éxito o error
- **Service worker escucha:** si el servidor manda "abre Claude.ai", crea pestaña (`chrome.tabs.create`) y luego el content script hace el resto.

## Archivos afectados

- `servidor/src/services/scheduler.js` — nuevo
- `servidor/src/services/enviador.js` — nuevo
- `servidor/src/routes/scheduler.js` — nuevo
- `servidor/src/storage/schemas/mensaje.js` — campos `programado_para`, `enviado_en`, `estado`
- `dashboard/components/modal-programar.js` — nuevo
- `dashboard/components/pendientes-envio.js` — nuevo
- `extension/content/content-script.js` — acción "enviar"
- `extension/background/service-worker.js` — abrir pestañas bajo demanda

## Criterios de terminado (DoD)

- [ ] Un mensaje con `programado_para: ahora+2min` se envía efectivamente a la IA a los 2 minutos
- [ ] El mensaje aparece en la conversación de la IA (verificar en Claude.ai, por ejemplo)
- [ ] El mensaje queda marcado como `enviado_en` en el dashboard
- [ ] Si la extensión no está instalada o la IA no responde, el mensaje queda en `estado: "error"` y visible en la sección de pendientes
- [ ] Reiniciar el servidor con mensajes programados futuros los reprograma correctamente
- [ ] "Disparar ahora" desde el dashboard funciona
- [ ] Commit `feat(e2-envio-programado): scheduler local con envío a IA mediante extensión`
- [ ] Tag `v2.9.0-envio-programado`

## Cómo usarlo

1. Escribe un mensaje en el dashboard
2. Clic en "⏰ Programar envío" → elige hora
3. El mensaje queda marcado con el icono y la hora
4. A esa hora exacta, el servidor abre Claude (o la IA configurada) y envía el mensaje
5. Aparece en Claude con la respuesta llegando sola

## Notas para el agente

- **`setTimeout` tiene un límite práctico de ~24 días.** Para programaciones más largas, usa `node-cron` o recalcula. En uso real, programar más de un día de anticipación es raro, pero tenlo presente.
- **La hora del servidor es la que cuenta.** Documenta en la UI que el cronómetro usa la hora del servidor local, no del navegador. Pueden diferir si el usuario tiene pestaña abierta desde otro dispositivo.
- **El timeout entre "mandar instrucción a la extensión" y "recibir confirmación" debe ser generoso (30-60s).** Abrir la pestaña, cargar la IA, esperar al textarea — puede tardar.
- **Si el usuario pone `programado_para` a una hora pasada (por error), disparar inmediato.** No dejar el mensaje en limbo.
- **Al reiniciar el servidor, cancela todos los `setTimeout` activos y vuelve a leer la BD.** No confíes en el estado en memoria.

## Preguntas abiertas

- **¿Programar varios envíos secuenciales?** Ej: "Manda este a las 10, este otro a las 10:15, este otro a las 10:30". Se puede lograr con 3 programaciones independientes. Pero una UI de "secuencia" sería más ergonómica. **Propuesta:** evaluarlo después de usar el feature básico un tiempo.
- **¿Notificación al usuario cuando se dispara?** Ejemplo: notificación nativa del SO. Útil, pero añade complejidad por OS. **Propuesta:** dejarlo como feature opcional que se añade al packaging (2.12) o posterior.
