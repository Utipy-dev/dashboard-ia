# Onboarding del agente — Dashboard IA

**Si eres un agente con MCPs leyendo este repo por primera vez: lee este documento antes de tocar nada.**

---

## 1. Qué es este proyecto

Dashboard IA es una herramienta local para orquestar conversaciones con IAs (Claude, ChatGPT, Gemini, etc.). Resuelve un problema concreto: los usuarios de IA pierden tokens y tiempo de sesión mientras estructuran sus ideas. El dashboard gestiona los límites por ti — acumula mensajes, los envía programados, y mantiene historial unificado entre IAs.

**Pitch:** "Escribe sin interrupciones. La app gestiona los límites por ti."

**Moat:** cola + historial unificado cross-IA. Las IAs individuales no lo construirán porque no les interesa que uses a la competencia.

## 2. Cómo leer este repo

El repo está pensado para que un agente (o persona) pueda continuar el trabajo sin replanificar. Tiene dos capas:

- **Código** (`/dashboard`, `/servidor`, etc.) — lo que funciona
- **Planificación** (`/planificacion`) — por qué funciona así y qué falta

**Orden de lectura obligatorio para agentes nuevos:**

1. `CLAUDE.md` en la raíz del proyecto — contexto general, estado y próximo paso
2. `operaciones/estado.md` — fase actual, tareas vivas, decisiones cerradas
3. Este archivo (`planificacion/onboarding-agente.md`)
4. `planificacion/versiones.md` — índice maestro de qué bloques existen y su estado
5. `planificacion/etapas/etapa-X/` — la etapa en la que estés trabajando
6. Dentro de cada etapa, los bloques en orden numérico

**No saltes pasos.** El valor del sistema es que cada bloque sabe qué hay antes y qué hay después. Si lo rompes, el siguiente agente lo nota.

## 3. Qué significa "bloque" y "etapa"

- **Etapa** = hito visible de progreso. Etapa 1 = versión HTML local, etapa 2 = servidor local, etapa 3 = móvil + cola, etapas 4-5 = extensión y app.
- **Bloque** = unidad de trabajo dentro de una etapa. Cada bloque es un .md con objetivo, dependencias, criterios de terminado y archivos afectados.
- **Bloque terminado** = tag de git + manifest actualizado + DoD cumplido. Una vez terminado, **no se toca salvo bug grave**. Si necesitas cambiar algo, creas un bloque nuevo que modifica el anterior. No editas el bloque original.

## 4. Qué NO debes tocar

- Código de bloques ya terminados (tienen tag en git)
- Los .md de bloques terminados (son histórico)
- `CLAUDE.md` de la raíz, salvo que cambie el estado general
- `operaciones/estado.md`, salvo que cambien plazos o el próximo paso
- El lore de Utipy (solo el Director puede modificarlo)
- Las decisiones cerradas (sección al final de `operaciones/estado.md`)

## 5. Qué SÍ haces al arrancar sesión

1. Lee en orden (sección 2)
2. Identifica el próximo bloque no terminado
3. Verifica que sus dependencias están todas hechas
4. Si falta alguna, párate y reporta — no inventes
5. Si están todas, ejecuta el bloque siguiendo su .md

## 6. Stack técnico

- **Etapa 1:** HTML + CSS + JS vanilla, JSON local (ya terminada)
- **Etapas 2 en adelante:** Node.js como base. JS tanto en servidor como en frontend como en la extensión Chrome. Binarios externos (ffmpeg, whisper.cpp) cuando convenga en etapas futuras.
- **Frontend:** sin frameworks pesados, mínimo posible
- **Persistencia:** archivos locales (JSON/SQLite según bloque)
- **Comunicación móvil (etapa 3):** WebSocket sobre WiFi local, certificados autogenerados

**Razón del stack:** un solo lenguaje en todas las capas baja la fricción para el público técnico de GitHub, que es mayoritariamente JS/TS. La legibilidad importa porque este proyecto se publica con narrativa de "así se hizo".

## 7. Filosofía de decisión

Si dudas entre dos caminos, elige el que:

1. **Minimiza actores externos con acceso a los datos del usuario.** Si ya usa una IA, que la transcripción/captura también quede en esa IA. No multiplicar nubes.
2. **Respeta que el usuario es dueño de su instalación.** No cloud obligatoria, no dependencias propietarias, no telemetría.
3. **Es legible antes que corto.** Este código se lee en GitHub como narrativa. Un truco ingenioso que nadie entiende vale menos que una solución clara.
4. **No crea dependencia de Utipy.** Filosofía de marca: "nuestro objetivo es que no nos necesites."

Si una decisión contradice los valores, avisa al humano antes de ejecutar.

## 8. Qué hago cuando termino un bloque

1. Verifico DoD del bloque
2. Actualizo el manifest del bloque (`MANIFEST.md` dentro de la carpeta del bloque) con los archivos que lo componen
3. Actualizo `planificacion/versiones.md` marcando el bloque como terminado
4. Commit con convenio: `feat(eX-bloque): descripción breve`
5. Tag con versión: `vX.Y.Z-kebab-case` (X=etapa, Y=bloque dentro de etapa, Z=parche)
6. Si la etapa entera queda terminada, etiqueto también la etapa: `etapa-X-done`
7. Actualizo `operaciones/estado.md` si cambia el próximo paso

## 9. Qué hago si me piden volver a un bloque anterior

1. `git checkout` del tag del bloque destino
2. Leo el MANIFEST.md de ese bloque para saber qué archivos lo componen
3. Leo el .md del bloque para entender su razonamiento
4. Decido: (a) modificar ese bloque — raro, solo por bug grave — o (b) crear bloque nuevo que lo reemplaza
5. Si (b), el bloque nuevo marca en sus dependencias qué reemplaza

## 10. Convenciones

- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- **Versiones:** SemVer adaptado. `vX.Y.Z` = `etapa.bloque.parche`. Ej. `v2.3.0` = etapa 2, bloque 3, primera versión
- **Etiquetas de bloque:** kebab-case descriptivo. Ej. `e2-captura-chrome`, `e3-cola-multiia`
- **Nombres de archivos .md:** `bloque-NN-slug.md` dentro de `planificacion/etapas/etapa-X/`
- **Idioma:** español en documentación y commits, inglés en código cuando convenga (nombres de variables, APIs)

## 11. Lo que aún no está decidido

Si te topas con algo de esta lista, NO decidas solo. Pregunta al humano o déjalo bloqueado.

- Arquitectura cloud (multi-dispositivo sin PC encendido) — pendiente de catalogar casos de uso
- Qué del código va en el paquete de pago y qué en el repo abierto — pendiente sesión con Comercial
- Licencia del repo — propuesta MIT, pendiente confirmación
- Nombre exacto del repo en GitHub — propuesta `dashboard-ia` bajo org `Utipy-dev`

---

**Última actualización:** 2026-04-16 por planificación inicial.
