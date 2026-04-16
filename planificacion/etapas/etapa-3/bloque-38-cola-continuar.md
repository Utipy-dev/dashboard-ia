# Bloque 3.8 — Modo continuar

**Etiqueta:** `e3-cola-continuar`
**Tag de git:** `v3.8.0-cola-continuar`
**Estado:** 💭 plan
**Depende de:** 3.6

## Objetivo en una línea

Modo de tarea que retoma una conversación anterior con Claude Code, inyectando el historial previo para que Claude recuerde el contexto sin tener que repetirlo.

## Narrativa — por qué este bloque existe

Los modos `limpio` y `contexto` tratan cada tarea como independiente. Pero muchas veces el trabajo es iterativo: "ayer Claude me ayudó con el análisis, hoy quiero que siga con la siguiente sección partiendo de donde lo dejamos". 

Sin este modo, el usuario tendría que copiar y pegar el historial anterior manualmente. Con él, apunta a una conversación anterior del dashboard y el servidor construye el prompt con el contexto de esa conversación.

## Decisiones técnicas

- **Historial como texto, no como JSONL de Claude Code.** Razón: `claude -p` no acepta un archivo de historial de sesión como argumento directo de forma documentada y estable. El modo más robusto es inyectar el historial como texto en el prompt. Formato: serie de pares `**Usuario:** ... \n\n**Asistente:** ...` antes del mensaje nuevo.
- **Límite de 10 intercambios previos.** 10 pares usuario/asistente son suficientes para dar contexto sin reventar el límite de tokens. Configurable por tarea. Si la conversación tiene más, se toman los 10 más recientes.
- **`conversacion_anterior_id` apunta a una conversación del dashboard.** No a un archivo externo. El servidor lee los mensajes de esa conversación desde su propio storage y construye el historial.
- **Solo mensajes de texto.** Imágenes y documentos del historial se omiten (se menciona `[adjunto: nombre_archivo]` pero no se incluye el binario). Razón: límites de tokens y complejidad.

## Template de prompt modo continuar

```
## Historial de conversación anterior

**Usuario:** ¿Puedes analizar la estructura de este módulo de autenticación?

**Asistente:** Claro. El módulo tiene tres capas principales...
[respuesta completa de Claude]

**Usuario:** ¿Cómo mejorarías el manejo de errores?

**Asistente:** Para el manejo de errores, sugiero...
[respuesta completa de Claude]

---

## Nuevo mensaje

Basándote en el análisis anterior, redacta los tests unitarios para la capa de validación.
```

## Qué hay que construir

### `servidor/src/cola/ejecutores/continuar.js`

```js
import { construirHistorial } from '../historial-builder.js'
import { ejecutarLimpio } from './limpio.js'

export async function ejecutarContinuar(tarea) {
  const historial = await construirHistorial(
    tarea.conversacion_anterior_id,
    tarea.max_intercambios ?? 10
  )
  if (!historial.ok) return { ok: false, error: historial.error }
  
  const mensajeConHistorial = [
    '## Historial de conversación anterior\n',
    historial.texto,
    '\n---\n',
    '## Nuevo mensaje\n',
    tarea.mensaje
  ].join('\n')
  
  return ejecutarLimpio({ ...tarea, mensaje: mensajeConHistorial })
}
```

### `servidor/src/cola/historial-builder.js`

```js
// Lee mensajes de una conversación, filtra los últimos N intercambios,
// formatea como texto plano y devuelve { ok, texto }
export async function construirHistorial(conversacionId, maxIntercambios) {
  // Lee de storage.conversaciones y storage.mensajes
  // Ordena por created_at
  // Toma los últimos N pares usuario/asistente
  // Formatea como texto
}
```

### En el dashboard

- **Al crear una tarea con modo `continuar`:** selector de conversación previa (con búsqueda por texto)
- **Campo `max_intercambios`** con default 10 (opcional, colapsado)
- **Preview de "continuando conversación: [nombre]"** en la tarjeta de la tarea

## Archivos afectados

- `servidor/src/cola/ejecutores/continuar.js` — nuevo
- `servidor/src/cola/historial-builder.js` — nuevo
- `servidor/src/cola/ejecutores/index.js` — conectar `continuar`
- `dashboard/components/cola-nueva-tarea.js` — selector de conversación anterior

## Criterios de terminado (DoD)

- [ ] Tarea modo `continuar` con conversación de 5 intercambios: Claude responde coherentemente al historial
- [ ] Conversación con 20 mensajes: se toman solo los últimos 10 pares
- [ ] Conversación con adjuntos: se menciona `[adjunto]` pero no se envía el binario
- [ ] Conversación no encontrada: error claro, runner continúa
- [ ] El preview en el dashboard muestra el nombre de la conversación elegida
- [ ] Commit `feat(e3-cola-continuar): ejecutor modo continuar con historial de conversación`
- [ ] Tag `v3.8.0-cola-continuar`

## Notas para el agente

- **Qué es "un intercambio" en el contexto del dashboard:** un mensaje del usuario + la respuesta capturada de la IA. No todos los mensajes del dashboard tienen respuesta capturada (algunos son solo notas). Filtrar solo los pares completos para el historial.
- **El historial puede ser largo incluso con 10 intercambios.** Si una respuesta de Claude tiene 2000 palabras y hay 10 pares, son 20.000 palabras de historial más el mensaje nuevo. Verificar que no supera el límite de Claude antes de enviar. Si supera, reducir `max_intercambios` automáticamente hasta que quepa.
- **No modificar la conversación original.** El modo `continuar` lee la conversación pero no añade nada a ella. La respuesta va al output de la tarea, no a la conversación fuente. Si el usuario quiere añadir la respuesta a la conversación, lo hace manualmente.

## Preguntas abiertas

- **¿Añadir automáticamente el output al historial de la conversación fuente?** Al terminar, crear un nuevo mensaje en la conversación origen con el output. Útil para mantener el hilo cohesionado. **Propuesta:** opción `vincular_a_conversacion: true` en la tarea, off by default.
- **¿Soporte para JSONL de Claude Code como historial?** Si el usuario tiene una sesión de Claude Code guardada como JSONL, usarla como historial. Más fiel pero más complejo. **Propuesta:** investigar la API de `claude --resume` en etapa 4.
