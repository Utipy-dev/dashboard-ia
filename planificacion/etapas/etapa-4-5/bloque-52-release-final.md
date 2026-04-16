# Bloque 5.2 — Release final y guía completa

**Etiqueta:** `e5-release-final`
**Tag de git:** `v5.2.0-release-final`
**Estado:** 💭 plan
**Depende de:** 5.1

## Objetivo en una línea

Release `v5.2.0` como versión estable definitiva del producto, con guía completa publicada, instaladores pulidos para los 3 OS y cierre formal del roadmap de 5 etapas.

## Narrativa — por qué este bloque existe

Este es el punto de llegada del roadmap. No significa que el producto deje de evolucionar — significa que todas las promesas del pitch original están cumplidas:

- ✅ Captura desde interfaz de IA
- ✅ Envío programado y reserva de sesión
- ✅ Documentos adjuntos
- ✅ Sincronización móvil
- ✅ Cola multi-IA con Claude Code
- ✅ App nativa (sin terminal)
- ✅ Transcriptor local propio
- ✅ Historial unificado cross-IA
- ✅ Extensión completa en Chrome Web Store

El release final es también el momento de publicar la narrativa completa: cómo se construyó etapa por etapa, qué decisiones se tomaron y por qué. Ese relato es el activo más valioso del repositorio público.

## Qué hay que construir

### Release y assets

- `v5.2.0` como GitHub Release con assets para Windows, macOS y Linux
- Changelogs completos por etapa
- Etiqueta `dashboard-ia-v1.0-stable` (alias human-readable del tag técnico)

### Documentación final

- **`README.md`** — actualización final con todas las features, capturas de pantalla del estado final, enlace a la guía
- **`INSTALL.md`** — guía completa probada con usuarios no técnicos
- **`FAQ.md`** — consolidado de todas las preguntas reales recibidas durante el desarrollo
- **Guía premium** — el documento que acompaña el paquete de pago: casos de uso avanzados, configuración óptima por tipo de trabajo, workflows recomendados

### Narrativa pública

- Post o serie de posts (decisión de Lore/Comercial) sobre "cómo construimos Dashboard IA etapa por etapa"
- El código del repo ya cuenta la historia (commits, bloques, planificación) — el post extrae los aprendizajes más interesantes

### Retrospectiva

- `planificacion/etapas/etapa-5/retrospectiva.md` — qué salió según el plan, qué cambió, qué haríamos diferente, qué viene después del roadmap actual

## Criterios de terminado (DoD)

- [ ] Release `v5.2.0` en GitHub con assets probados en los 3 OS
- [ ] `README.md` actualizado con capturas del estado final
- [ ] `INSTALL.md` revisada con usuario no técnico real (no solo Arturo)
- [ ] Guía premium escrita y revisada por Comercial
- [ ] Retrospectiva escrita
- [ ] Etiqueta `etapa-5-done` aplicada
- [ ] Commit `docs(e5-release-final): release estable v5, guía completa, cierre roadmap`
- [ ] Tag `v5.2.0-release-final`

## Notas para el agente

- **Este bloque es en gran parte editorial, no de código.** El agente Constructor puede ayudar con el código de assets y automatización del release, pero la guía premium y la narrativa pública son trabajo de Lore y Comercial.
- **La retrospectiva es valiosa para el siguiente ciclo.** Documenta explícitamente las decisiones que cambiarían y los patrones que se repetirían. Es el onboarding para el agente que retome el proyecto en 6 meses.

## Preguntas abiertas

- **¿Etapa 6?** No está en el roadmap actual. Si el producto tiene usuarios y feedback, etapa 6 se define en base a eso. No especular ahora.
- **¿Cloud opcional?** Acceso sin PC encendido. Requiere backend propio (costes). Solo si hay usuarios dispuestos a pagar más. **Propuesta:** evaluar al terminar etapa 5 con datos reales de uso.
