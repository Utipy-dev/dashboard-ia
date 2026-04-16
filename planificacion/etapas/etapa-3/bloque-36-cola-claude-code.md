# Bloque 3.6 — Modo limpio: ejecutor Claude Code

**Etiqueta:** `e3-cola-claude-code`
**Tag de git:** `v3.6.0-cola-claude-code`
**Estado:** 💭 plan
**Depende de:** 3.5

## Objetivo en una línea

El primer ejecutor real de la cola: llama a `claude -p "mensaje"` via `child_process`, captura la respuesta y la devuelve al runner.

## Narrativa — por qué este bloque existe

El bloque 3.5 tiene un runner funcional pero con stubs. Este bloque pone el primer ejecutor real: el modo `limpio`, el más simple. Solo el mensaje, sin contexto adicional. `claude -p "¿Cuál es el capital de Francia?"` → `"París"`.

Es el bloque donde la automatización deja de ser teórica. Una vez esto funciona, los modos `contexto` y `continuar` (3.7 y 3.8) son variaciones sobre este mismo patrón.

El modo se llama "limpio" porque no hay nada que ensuciar la solicitud: es el mensaje del usuario, tal cual, enviado a Claude Code.

## Decisiones técnicas

- **`child_process.spawn` sobre `exec`.** Razón: `spawn` permite leer el output en streaming (importante para tareas largas donde el timeout de `exec` puede cortar la respuesta). La respuesta de Claude Code puede ser 3 líneas o 500 líneas.
- **`claude -p` (modo print).** Claude Code en modo `--print` (`-p`) ejecuta una sola consulta y sale. No hay sesión interactiva. Es exactamente lo que necesita el runner.
- **Timeout configurable por tarea, default 5 minutos.** Claude Code puede tardar bastante en tareas complejas. 5 minutos es generoso. Si el proceso no termina, `SIGTERM` y marcar como `error: "timeout"`.
- **Requiere `claude` en PATH.** Si no está instalado, la tarea falla con error claro: `"claude CLI no encontrado. Instálalo con: npm install -g @anthropic-ai/claude-code"`. El runner continúa con la siguiente tarea.
- **Capturar stdout y stderr por separado.** `stdout` es la respuesta. `stderr` es errores o warnings de Claude Code (ej. rate limit, autenticación expirada). Ambos se guardan en el output de la tarea para diagnóstico.

## Qué hay que construir

### `servidor/src/cola/ejecutores/limpio.js`

```js
import { spawn } from 'child_process'

export async function ejecutarLimpio(tarea) {
  return new Promise((resolve) => {
    const proc = spawn('claude', ['-p', tarea.mensaje], {
      timeout: tarea.timeout_ms ?? 5 * 60 * 1000,
      stdio: ['ignore', 'pipe', 'pipe']
    })
    
    let stdout = ''
    let stderr = ''
    
    proc.stdout.on('data', chunk => stdout += chunk)
    proc.stderr.on('data', chunk => stderr += chunk)
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ ok: true, output: stdout.trim(), stderr })
      } else {
        resolve({ ok: false, output: stdout, error: stderr || `exit code ${code}` })
      }
    })
    
    proc.on('error', (err) => {
      if (err.code === 'ENOENT') {
        resolve({ ok: false, error: 'claude CLI no encontrado. Instálalo con: npm install -g @anthropic-ai/claude-code' })
      } else {
        resolve({ ok: false, error: err.message })
      }
    })
  })
}
```

### Verificación de prerequisitos al arrancar

Al iniciar el servidor, verificar que `claude` está en PATH. Si no, loggear un warning claro pero no impedir el arranque (el usuario puede querer usar el servidor sin la cola).

### Feedback en la UI

- Durante ejecución: mostrar "Ejecutando..." con spinner y tiempo transcurrido
- Si hay stdout parcial (streaming): mostrarlo en tiempo real en el panel de la tarea activa
- Al terminar: preview de las primeras 3 líneas del output en la lista de tareas

## Archivos afectados

- `servidor/src/cola/ejecutores/limpio.js` — nuevo
- `servidor/src/cola/ejecutores/index.js` — conectar `limpio` (reemplazar stub)
- `servidor/src/index.js` — añadir verificación de `claude` en PATH al arrancar
- `dashboard/components/cola-tarea-activa.js` — nuevo (panel con output en vivo)

## Criterios de terminado (DoD)

- [ ] Tarea modo `limpio` con mensaje simple se ejecuta y guarda la respuesta
- [ ] Output visible en la UI al terminar
- [ ] Si `claude` no está instalado, error claro con instrucción de instalación
- [ ] Timeout de 5 minutos mata el proceso y marca la tarea como error
- [ ] Tarea con error de rate-limit (429 de Claude) queda en `error` con el mensaje legible
- [ ] Commit `feat(e3-cola-claude-code): ejecutor modo limpio con claude -p`
- [ ] Tag `v3.6.0-cola-claude-code`

## Cómo usarlo

1. Crea una tarea: modo `limpio`, mensaje "Resume este texto en 3 puntos: ..."
2. Pulsa "Iniciar cola"
3. El servidor lanza `claude -p "Resume este texto..."` en segundo plano
4. La respuesta aparece en el dashboard cuando termina

## Notas para el agente

- **Claude Code CLI usa la misma sesión del usuario.** Si el usuario está autenticado en Claude Code (ya lo está si lo usa a diario), no hay que reautenticar. Las tareas de la cola usan su token.
- **`claude -p` en Windows:** el comando puede ser `claude.cmd` en algunos sistemas. `spawn('claude', ...)` debería resolverlo con `shell: true` como opción del spawn, o usar `cross-spawn` npm package.
- **El output de Claude Code puede incluir ANSI codes** (colores si hay TTY). Sin TTY (pipe), suele ser limpio. Si aparecen caracteres raros, strippear con `strip-ansi` npm package.
- **No guardes el output en el mensaje principal del dashboard todavía.** El output va a `output_ruta` (bloque 3.9). Por ahora guardarlo como campo `output_raw` en la tarea.

## Preguntas abiertas

- **¿Soporte para otros CLIs (aider, copilot-cli, etc.)?** El pattern `spawn(cli, ['-p', msg])` es genérico. Con una propiedad `cli_comando` en la tarea, podría soportarse cualquier CLI compatible. **Propuesta:** dejar el groundwork (campo en schema) pero solo implementar `claude` ahora.
- **¿Variables de entorno para la tarea?** Pasar `ANTHROPIC_API_KEY`, `CLAUDE_MODEL`, etc. al proceso hijo. **Propuesta:** heredar el entorno del servidor por defecto. Personalización en etapa posterior.
