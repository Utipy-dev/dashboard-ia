# Bloque 3.7 — Modo contexto

**Etiqueta:** `e3-cola-contexto`
**Tag de git:** `v3.7.0-cola-contexto`
**Estado:** 💭 plan
**Depende de:** 3.6

## Objetivo en una línea

Modo de tarea que prepende un archivo de contexto (`.md`, `.txt`, `.pdf` convertido) al mensaje antes de enviarlo a Claude Code.

## Narrativa — por qué este bloque existe

El modo limpio envía solo el mensaje. Pero la mayoría de tareas reales necesitan contexto: "revisa *este* documento", "mejora *este* código", "responde con la información de *este* briefing". El contexto es un archivo que ya está en el servidor (subido en 2.7 o generado por el proyecto).

El modo contexto automatiza lo que el usuario haría a mano: copiar el contenido del archivo, pegarlo antes del mensaje, enviarlo. Con la cola, lo prepara una vez y el servidor lo hace cada vez.

## Decisiones técnicas

- **El contexto se incrusta como texto, no como archivo adjunto.** Razón: `claude -p` no tiene interfaz gráfica para adjuntar archivos. El contexto se inyecta como texto antes del mensaje en el mismo string que se pasa a `claude -p`. Formato: `"## Contexto\n\n<contenido>\n\n---\n\n## Tarea\n\n<mensaje>"`.
- **PDFs se convierten a texto en el servidor.** Usando `pdf-parse` (npm). No perfect pero suficiente para la mayoría de documentos. Si falla la conversión, la tarea falla con error claro en lugar de enviar el binario.
- **Límite de tamaño de contexto: 100KB de texto.** Claude Code tiene un límite de contexto. 100KB de texto son ~25.000 palabras, más que suficiente para la mayoría de documentos. Si el archivo supera ese límite, la tarea falla con `"Archivo demasiado grande para contexto (máx. 100KB)"`.
- **`contexto_ruta` apunta a un archivo de `servidor/data/documentos/`.** Es el mismo sistema de storage de 2.7. No hay rutas arbitrarias del sistema de archivos del usuario por seguridad.

## Template de prompt con contexto

```
## Contexto

[Propuesta de proyecto - Q2 2026]

Lorem ipsum dolor sit amet, consultur adipiscing...
[...contenido del archivo...]

---

## Tarea

Revisa la propuesta y sugiere mejoras en el tono ejecutivo. 
Especialmente en la sección de presupuesto.
```

## Qué hay que construir

### `servidor/src/cola/ejecutores/contexto.js`

```js
import { leerContexto } from '../contexto-loader.js'
import { ejecutarLimpio } from './limpio.js'

export async function ejecutarContexto(tarea) {
  const contexto = await leerContexto(tarea.contexto_ruta)
  if (!contexto.ok) return { ok: false, error: contexto.error }
  
  const mensajeConContexto = [
    '## Contexto\n',
    contexto.texto,
    '\n---\n',
    '## Tarea\n',
    tarea.mensaje
  ].join('\n')
  
  return ejecutarLimpio({ ...tarea, mensaje: mensajeConContexto })
}
```

### `servidor/src/cola/contexto-loader.js`

```js
// Lee el archivo, lo convierte a texto si es PDF, verifica límite de tamaño
export async function leerContexto(ruta) {
  // ...
  // return { ok: true, texto: '...' }
  // return { ok: false, error: 'Archivo no encontrado' }
}
```

### En el dashboard

- **Al crear una tarea con modo `contexto`:** selector de archivo de los documentos disponibles (misma lista que en el modal de preparar envío de 2.7)
- **Preview del primer párrafo del contexto** en la tarjeta de la tarea en la cola

## Archivos afectados

- `servidor/src/cola/ejecutores/contexto.js` — nuevo
- `servidor/src/cola/contexto-loader.js` — nuevo
- `servidor/src/cola/ejecutores/index.js` — conectar `contexto`
- `servidor/package.json` — añadir `pdf-parse` si no está
- `dashboard/components/cola-nueva-tarea.js` — selector de contexto para modo `contexto`

## Criterios de terminado (DoD)

- [ ] Tarea modo `contexto` con un `.md` de contexto ejecuta correctamente, la respuesta refleja el contenido del archivo
- [ ] Tarea con PDF como contexto: el texto se extrae y se incluye correctamente
- [ ] Archivo que supera 100KB: error claro, tarea marcada como `error`, runner continúa
- [ ] Archivo no encontrado (borrado desde que se creó la tarea): error claro
- [ ] El preview del contexto se muestra en la tarjeta de tarea del dashboard
- [ ] Commit `feat(e3-cola-contexto): ejecutor modo contexto con incrustación de documento`
- [ ] Tag `v3.7.0-cola-contexto`

## Notas para el agente

- **`pdf-parse` extrae texto plano pero pierde formato.** Tablas, listas, encabezados se aplanan. Para documentos muy estructurados, el resultado puede ser confuso para Claude. Documentar esta limitación.
- **El tamaño del contexto + mensaje + tokens de sistema puede exceder el límite de Claude.** Si Claude devuelve un error de "contexto demasiado largo", capturarlo y marcarlo como error con ese mensaje específico. El usuario necesita saber por qué falló.
- **Seguridad: verificar que `contexto_ruta` está dentro de `servidor/data/documentos/`.** Usar `path.resolve` y verificar que empieza por la ruta permitida. No permitir `../../../etc/passwd` ni nada similar.

## Preguntas abiertas

- **¿Múltiples archivos de contexto?** La tarea tiene un solo `contexto_ruta`. Soportar array. **Propuesta:** posponer, se puede lograr concatenando los archivos en uno antes de crear la tarea.
- **¿Imágenes en el contexto?** `claude -p` puede recibir imágenes como base64 en algunos modos. Complejo. **Propuesta:** solo texto por ahora. Imágenes en etapas posteriores.
