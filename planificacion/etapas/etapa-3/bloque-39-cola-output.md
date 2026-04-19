# Bloque 3.9 — Output y resumen automático

**Etiqueta:** `e3-cola-output`
**Tag de git:** `v3.9.0-cola-output`
**Estado:** 💭 plan
**Depende de:** 3.6

## Objetivo en una línea

Al terminar una tarea de la cola, guardar la respuesta como archivo `.md` bien formateado, generar un resumen de 2-3 líneas automáticamente, y notificar al usuario.

## Narrativa — por qué este bloque existe

Sin este bloque, el output de una tarea existe solo como campo de texto en `tareas.json`. Es crudo, no navegable, no archivable. Este bloque convierte ese output en un artefacto de primera clase: un `.md` con nombre, fecha y resumen, que el usuario puede abrir en su editor, enlazar desde el dashboard, o compartir.

El resumen automático es el valor añadido clave: cuando tienes 10 tareas ejecutadas, no quieres releer 10 documentos para saber de qué va cada uno. El resumen de 2-3 líneas te da el "de un vistazo" que necesitas.

## Decisiones técnicas

- **Output en `src/servidor/data/outputs/<tarea_id>/respuesta.md`.** Mismo patrón de directorio que los documentos. La ruta se guarda en `tarea.output_ruta`.
- **El `.md` incluye metadatos en frontmatter YAML.** Fecha, nombre de la tarea, IA usada, modo. Permite filtrar y buscar después.
- **El resumen se genera con otra llamada a `claude -p`.** Se le pasa el output y se pide "resume en 2-3 frases". Es una llamada extra (gasto de tokens), pero el resumen es genuinamente útil. Configurable: si `generar_resumen: false`, se omite.
- **Notificación nativa del OS al terminar.** Usando `node-notifier` (npm) o el comando nativo:
  - Windows: `powershell -command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('...')"` — demasiado intrusivo. Mejor `node-notifier`.
  - macOS: `osascript -e 'display notification ...'`
  - Linux: `notify-send`
  Notificación minimalista: "Dashboard IA: tarea terminada — [nombre de la tarea]".

## Formato del `.md` de output

```markdown
---
tarea: Revisar propuesta de proyecto Q2
ia: claude-code
modo: contexto
fecha: 2026-04-16T15:30:00Z
resumen: Claude sugirió fortalecer la sección de presupuesto con datos comparativos, simplificar el timeline y añadir KPIs medibles en los objetivos. Tono general aprobado.
---

# Output: Revisar propuesta de proyecto Q2

## Respuesta de Claude

La propuesta tiene una estructura sólida, pero identifico tres áreas de mejora:

### 1. Sección de presupuesto
...

[respuesta completa]
```

## Qué hay que construir

### `src/servidor/src/cola/output-manager.js`

```js
export async function guardarOutput(tarea, outputRaw) {
  const dir = path.join(DATA_DIR, 'outputs', tarea.id)
  await fs.mkdir(dir, { recursive: true })
  
  const resumen = tarea.generar_resumen !== false
    ? await generarResumen(outputRaw)
    : null
  
  const contenido = formatearMd(tarea, outputRaw, resumen)
  await fs.writeFile(path.join(dir, 'respuesta.md'), contenido, 'utf-8')
  
  await notificar(tarea.nombre)
  
  return path.join(dir, 'respuesta.md')
}
```

### `src/servidor/src/cola/notificador.js`

- Detecta OS (`process.platform`)
- Llama al comando nativo o `node-notifier`
- Si falla, no lanza excepción (notificación no es crítica)

### En el dashboard

- **Link "Ver output"** en cada tarea `done` → abre el `.md` en el explorador de archivos del sistema (`shell.openPath` o endpoint que devuelve el archivo)
- **Resumen visible directamente en la tarjeta de tarea** (sin abrir el archivo)
- **Sección "Outputs recientes"** en el dashboard: lista de los últimos 5 outputs con nombre, fecha y resumen

## Archivos afectados

- `src/servidor/src/cola/output-manager.js` — nuevo
- `src/servidor/src/cola/notificador.js` — nuevo
- `src/servidor/src/cola/runner.js` — llamar `guardarOutput` al terminar cada tarea
- `src/servidor/package.json` — añadir `node-notifier`
- `src/dashboard/components/cola-dashboard.js` — añadir link "Ver output" y sección outputs recientes

## Criterios de terminado (DoD)

- [ ] Al terminar una tarea, se crea `src/servidor/data/outputs/<id>/respuesta.md` con frontmatter correcto
- [ ] El resumen de 2-3 líneas es coherente con el contenido (verificar manualmente)
- [ ] Notificación nativa del sistema aparece en Windows al terminar una tarea
- [ ] Link "Ver output" desde el dashboard abre el archivo
- [ ] El resumen es visible en la tarjeta de tarea sin abrir el archivo
- [ ] Si `generar_resumen: false`, el `.md` se crea sin resumen (y sin la llamada extra a Claude)
- [ ] Commit `feat(e3-cola-output): output .md con resumen automático y notificación nativa`
- [ ] Tag `v3.9.0-cola-output`

## Notas para el agente

- **La llamada de resumen es recursiva: usa la cola para resumir outputs de la cola.** No hagas eso. La llamada de resumen es directa, fuera de la cola, ejecutada en el mismo proceso del runner justo antes de guardar el archivo. No crees una tarea nueva para el resumen.
- **El resumen puede fallar.** Si Claude no está disponible o hay error en la llamada de resumen, guardar el output sin resumen (campo `resumen: null` en frontmatter). No bloquear el guardado del output.
- **`node-notifier` vs comandos nativos.** `node-notifier` funciona en los 3 OS con una API unificada. Es 200KB extra de dependencia. Preferible a mantener 3 caminos distintos de notificación.
- **Los outputs NO van a `.gitignore`.** Son artefactos de trabajo del usuario, no datos personales sensibles. El usuario puede querer commitearlos en su repo de proyecto. Dejar que el usuario decida.

## Preguntas abiertas

- **¿Exportar output a la conversación del dashboard?** Crear un mensaje nuevo en la conversación asociada con el output. Útil para mantener historial. **Propuesta:** opción `vincular_a_conversacion: true` (misma que propusimos en 3.8).
- **¿Vista de outputs en el móvil?** Lista de los últimos outputs con resumen, paginada. Útil para revisar desde el sofá. **Propuesta:** sí, incluirlo como pantalla simple en la PWA (3.11 si no cabe aquí).
