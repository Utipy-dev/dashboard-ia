# Bloque 2.11 — Simplificación post-servidor

**Etiqueta:** `e2-simplificacion`
**Tag de git:** `v2.11.0-simplificacion`
**Estado:** 💭 plan
**Depende de:** 2.1 a 2.10

## Objetivo en una línea

Repasar el código heredado de etapa 1 y todos los bloques construidos en etapa 2, identificar duplicación, workarounds innecesarios y complejidad que el servidor hace innecesaria, y limpiarlos antes del packaging.

## Narrativa — por qué este bloque existe

La etapa 1 se construyó con restricciones que ya no existen: no había servidor, no había API, no había persistencia estable, no había forma de tocar otras pestañas. Muchas partes del código del dashboard son workarounds para esas limitaciones. Con el servidor arriba y funcionando, esos workarounds son deuda técnica pura: hacen el código más complicado de lo necesario y generan confusión al siguiente agente que intente entender el proyecto.

Este bloque no añade funcionalidad. Elimina. Y es tan importante como los que añaden, porque un proyecto que se publica como narrativa pierde mucho valor si la narrativa se lee como "aquí hay 4 formas de hacer la misma cosa, las 4 vivas".

## Qué hay que revisar

### Código heredado de etapa 1

- **`src/dashboard/storage/storage.js`** — después del bloque 2.2 debería estar limpio, pero revisar que no queden comentarios o ramas muertas
- **Gestión de imágenes en base64 dentro de JSON** — ahora que hay servidor, las imágenes podrían vivir como archivos separados igual que los documentos. Evaluación: ¿lo hacemos o lo dejamos para etapa 3? *Recomendación: dejarlo a menos que haya problemas de rendimiento medibles.*
- **Modal "Preparar envío"** — con captura automática y envío programado, este modal es opcional. Evaluar si se convierte en "preview" sin botones de copiado, o se elimina y se deja solo la captura/envío.
- **Lógica de "conversación activa"** — se introdujo en 2.5 como concepto nuevo. Revisar que sea consistente en todas las vistas.

### Duplicación entre bloques de etapa 2

- **Handlers de `fetch` a la API** — si cada componente hace su propio fetch, considerar un pequeño cliente API centralizado en `src/dashboard/api-client.js`.
- **Schemas JSON** — verificar que el schema del servidor y el del cliente no diverjan.
- **Estilos de modales** — los modales de preparar envío, programar envío y reservar sesión comparten 80% de estilos. Extraer a una clase común.
- **Toasts y feedback visual** — si hay tres implementaciones de toast (extensión, dashboard, respuesta del scheduler), unificarlas.

### Documentación

- **README del dashboard actualizado** con la nueva arquitectura
- **Comentarios en código que referencian etapa 1** — actualizados o eliminados
- **`operaciones/estado.md`** al día

## Decisiones de criterio

- **Conservación agresiva del comportamiento visible.** No cambiar nada que el usuario note. Este bloque es silencioso para el usuario final.
- **Cambios pequeños y verificables.** Cada sub-cambio hay que probar en la UI. Si un cambio rompe algo, revertir y replanificar.
- **No introducir abstracciones nuevas gratis.** Si un `api-client.js` centralizado no elimina código neto, no se introduce.
- **Medir antes de optimizar.** Si alguien propone "vamos a mover las imágenes a archivos por rendimiento", pedir métricas. En uso real probablemente no aporta nada medible.

## Qué hay que construir / eliminar

Este bloque es diferente a los demás porque es una lista de TODO de limpieza, no código nuevo. Se materializa como:

1. **`planificacion/revision-simplificacion.md`** — inventario de hallazgos con decisión tomada para cada uno (eliminar / refactor / dejar / sub-bloque futuro)
2. **Cambios de código efectivos** con un commit por cambio independiente
3. **Documentación actualizada**

## Criterios de terminado (DoD)

- [ ] Inventario escrito y revisado
- [ ] Cada hallazgo tiene decisión explícita
- [ ] Los cambios acordados están ejecutados y no rompen funcionalidad (prueba manual exhaustiva: etapas 1 y 2 completas)
- [ ] README del dashboard actualizado
- [ ] `operaciones/estado.md` actualizado al nuevo estado "post-simplificación"
- [ ] Commit `refactor(e2-simplificacion): limpieza post-servidor, ver revision-simplificacion.md`
- [ ] Tag `v2.11.0-simplificacion`

## Notas para el agente

- **No es un bloque para "reescribir todo a tu gusto".** Es un bloque para quitar lo que sobra. Si te entran ganas de refactorizar algo que funciona, resiste.
- **Si durante la revisión encuentras un bug latente de etapa 1, arregla el bug pero no lo mezcles con la limpieza.** Un commit por bug, separado del commit de simplificación.
- **Si identificas una mejora sustantiva que requeriría mucho trabajo, créala como sub-bloque `2.11.x` y documéntala pero no la ejecutes aquí.** Este bloque se cierra cuando la lista de limpieza está hecha.
- **Al terminar, el proyecto debería leerse más fácil de lo que entraste.** Ese es el test. Si no cumple el test, vuelve atrás.
