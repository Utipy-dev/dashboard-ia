# Estado operaciones — Dashboard IA

## Fase actual
**Etapa 1 completada + imágenes + juntar notas**

**Actualización sistema:** 2026-04-17 — bloques 1,2,3,4,6,7,8 aplicados. Creada `contexto/` (indice, directorio, general). CLAUDE.md con frontmatter identidad/rol y carga de protocolo.md. settings.json con additionalDirectories.

**Actualización sistema:** 2026-04-19 — convención `src/` para código fuente. Git: este proyecto sigue con commits normales (bug Claude Code conocido, reportado). Skills: detectar desde `utipy/.claude/skills/` aunque no aparezcan en menú.

El dashboard es funcional. Se abre `dashboard/index.html` en Chrome, se selecciona la carpeta de datos y funciona sin servidor.

---

## Lo que está implementado y funcionando

### Base (Etapa 1)
- Layout split galería/panel, proyectos tipo carpeta Notion, drag & drop
- Cronómetro por IA con editor de hora
- Temas/etiquetas con colores, zanjado/activo, limpieza
- Mensajes con etiqueta editable, check enviado, borrador persistente

### Imágenes
- Ctrl+V en textarea → thumbnail en panel lateral derecho
- Ctrl+V en texto de mensaje guardado → interceptado, va al sistema de imágenes
- Botón "+" en hover sobre mensaje → añadir imagen a mensaje existente
- Thumbnails 80×80px con X para eliminar

### Juntar notas (rediseñado)
- Círculos ○ junto a cada mensaje en modo juntar
- Clic → numeración en orden (1, 2, 3...)
- Panel derecho: bloques por mensaje seleccionado (texto editable + imágenes)
- Guardar combina todo en orden

---

## Pendiente inmediato

| Tarea | Prioridad | Notas |
|-------|-----------|-------|
| Borde en bloques de mensaje | Baja | Blanco sobre blanco, queda todo pegado |
| Resolver persistencia de datos | Alta | Mover carpeta Proyectos fuera de Documentos (OneDrive). Pendiente de que Arturo lo haga manualmente |

---

## Mapa de etapas (revisado)

### Etapa 2 — Servidor local · ~2€
Primera versión publicable. Todo corre en localhost.

- Servidor local + repaso y simplificación del código
- Captura de texto desde interfaz de IA: el usuario tiene sesión abierta en su IA (Claude, ChatGPT, etc.), el dashboard captura el texto antes del envío y lo acumula con contexto (tema, etiqueta, timestamp). El mensaje se envía igualmente — es automatizar el Ctrl+X / Ctrl+V que el usuario ya hacía
- Configuración por IA: cada usuario configura qué interfaz usa
- Soporte de documentos (PDF y otros): captura, almacenamiento, visualización como icono + nombre
- Copiar múltiples imágenes/archivos como archivos reales (via carpeta temporal del servidor)
- Envío programado: cronómetro opcional por mensaje. Caso de uso principal: enviar un mensaje de "reserva de sesión" a una hora determinada para que cuando el usuario llegue, la sesión lleve X horas activa y tenga tiempo limpio por delante

### Etapa 3 — Sincronización móvil · ~4€
- Sincronización por WiFi entre escritorio y móvil
- Control remoto desde móvil: ver mensajes acumulados, disparar envíos programados
- **Cola de tareas para Claude Code:** desde el móvil (fuera de casa) se preparan tareas con proyecto + mensaje. Al llegar a casa se sincronizan y el PC las ejecuta automáticamente vía `claude -p`. Permite lanzar múltiples agentes en distintas ventanas del día sin estar en el PC.
- Nota: la arquitectura cloud (sin necesidad de tener el ordenador encendido) queda pendiente de catalogar casos de uso antes de decidir. Posible bifurcación en paralelo: local + extensión de Chrome

#### * Ampliación cola de tareas — sesión Director 2026-04-14
> Estos puntos vienen de sesión de exploración con el Director. El operario los integra como propios cuando los trabaje.

- * **Cola multi-IA:** la cola de tareas no es solo para Claude Code. Aplica a cualquier IA. Claude Code es el caso especial por ser terminal; el resto se gestiona por interfaz o API
- * **Formato de tarea JSON con dos modos:**
  - Modo 1 (comando limpio): `{ "proyecto": "x", "mensaje": "..." }` — tarea autocontenida
  - Modo 2 (con contexto): añade campo `"contexto": "ruta/archivo.md"` — el skill lee el .md y lo antepone al mensaje. Reutilizable entre varias tareas
- * **Ejecución secuencial**, no paralela — evita saturación de tokens. Una tarea termina antes de lanzar la siguiente
- * **Output guardado:** cada tarea genera un `.md` de resultado. El JSON se actualiza con estado (`pending/done/error`) y ruta del output
- * **Dos modos de conversación:**
  - Nueva: `claude -p "mensaje"` directo
  - Continuar: lee el JSONL de la conversación anterior (`~/.claude/projects/[hash]/`), extrae últimos N mensajes, los antepone como contexto. Más tokens pero permite continuidad real
- * **Resumen automático post-tarea:** al terminar, el skill genera resumen de 3-5 líneas de lo ocurrido y lo guarda en el registro del Dashboard. El Dashboard muestra historial real de lo que hizo Claude Code, no solo las tareas programadas
- * **Acceso remoto desde móvil:** si el PC está encendido, se puede lanzar el skill por SSH/acceso remoto y ver el output en tiempo real. No requiere infraestructura adicional

### Etapas 4-5 — Transcripción propia (app formal)
Transcriptor integrado en el dashboard que resuelve las limitaciones del transcriptor de Claude:
- Pierde la primera palabra
- El micrófono desaparece si hay texto o imagen en el campo
- No permite alternar hablar / editar / hablar

Objetivo: modo mixto voz + escritura sin restricciones, el campo de voz independiente del texto.
Arquitectura pendiente de decidir. Se publicará mostrando el desarrollo por etapas.

---

## Modelo de producto (revisado)

- **Guía técnica**: cómo montar el dashboard. Sección genérica + sección "privacidad máxima" (Whisper local como opción avanzada autodocumentada). Siempre con opción gratuita de hacerlo uno mismo
- **Código etapa 2** (localhost): ~2€
- **Código etapas 2+3** (localhost + móvil): ~4€
- Dónde publicar: pendiente decidir con Director y Comercial
- Posible doble versión: local y extensión de Chrome

#### * Estrategia de producto — sesión Director 2026-04-14
- * **Pitch revisado:** "escribe sin interrupciones, la app gestiona los límites por ti". El origen del producto es el problema de quedarse sin tokens a mitad de una idea. El cronómetro + cola resuelven exactamente eso. Conecta emocionalmente con cualquier usuario de IA
- * **Moat real:** cola + historial unificado cross-IA. Ninguna IA individual lo construirá porque no les interesa que el usuario use a la competencia
- * **Urgencia:** la parte del skill/cola es lo suficientemente simple para que alguien más lo replique. Prioridad alta
- * **Estrategia GitHub:** parte del código a la comunidad para darse a conocer. Precio bajo para quien no quiera montarlo desde 0. Definir con Comercial qué va abierto y qué de pago
- * **Sesión pendiente con Comercial + operario:** redefinir etapas, qué va a GitHub, precio por tier, cómo hacer los tutoriales

---

## Decisiones cerradas

- Whisper local descartado del código principal. Queda como opción en la guía (privacidad máxima) para quien quiera instalarlo
- Web Speech API descartada: añade Google como actor externo cuando el usuario ya está en la nube de su IA. Sustituida por captura desde la interfaz de la IA
- Todo el desarrollo de etapa 2 en adelante: localhost
- La arquitectura cloud se cataloga antes de decidir, no se diseña ahora

---

## Novedades para el Director

- **Skill `/estructurar-etapas` creada** en `utipy/.claude/skills/estructurar-etapas/`. Permite planificar cualquier proyecto en etapas y bloques con validación paso a paso con Arturo. Reutilizable para cualquier proyecto del workspace. Pendiente de depuración.

---

## Planificación (referencia)

Planificación completa de todas las etapas en `planificacion/`. Cada bloque tiene narrativa, decisiones técnicas, DoD y notas para el agente.

- `planificacion/versiones.md` — índice maestro con todos los tags
- `planificacion/onboarding-agente.md` — guía para agentes nuevos
- `planificacion/etapas/etapa-1/` — 4 bloques retrospectivos (done)
- `planificacion/etapas/etapa-2/` — 13 bloques (2.0-2.12) detallados
- `planificacion/etapas/etapa-3/` — 12 bloques (3.0-3.11) detallados
- `planificacion/etapas/etapa-4-5/` — 6 bloques de horizonte lejano

Repositorio público: `github.com/Utipy-dev/dashboard-ia`

---

## Gestor

**Plazos:** Sin fecha límite definida. Urgencia relativa: la parte del skill/cola es replicable.
**Próximo paso:** Iniciar Etapa 2 (bloque 2.0 — servidor base). Sesión con Comercial para alinear estrategia GitHub antes de publicar.
