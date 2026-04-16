# Bloque 4.2 — Firma y publicación definitiva en Chrome Web Store

**Etiqueta:** `e4-firma-store`
**Tag de git:** `v4.2.0-firma-store`
**Estado:** 💭 plan
**Depende de:** 4.1

## Objetivo en una línea

Firmar el código de la extensión, actualizar la publicación en Chrome Web Store con la nueva UI completa y cierre oficial de etapa 4.

## Narrativa — por qué este bloque existe

En etapa 2 se publicó la extensión por primera vez, con el popup mínimo y la captura básica. En etapa 4, la extensión es el producto principal: panel lateral, integración profunda, acciones contextuales. Merece una publicación "oficial" con screenshots actualizados, descripción completa, y si los ingresos lo justifican, firma de código para el instalador del servidor.

## Decisiones técnicas (borrador)

- **Firma del instalador de Windows (~300€/año en etapa 4, si hay ingresos).** En etapa 2 se documentó el aviso de SmartScreen como "aceptable". En etapa 4, si el producto tiene usuarios de pago, la firma es una inversión justificada. Evaluar ingresos reales en el momento.
- **Chrome Web Store: actualización completa.** Nuevos screenshots del panel lateral, descripción actualizada, versión bump mayor (v4.0).
- **`etapa-4-done` tag en git.** Cierre formal de etapa 4.

## Qué hay que construir

- Screenshots del panel lateral para la Web Store (1280x800 y 640x400)
- Descripción actualizada en la Web Store
- Si se firma el instalador: proceso de adquisición de certificado OV/EV
- Release `v4.2.0` en GitHub con assets
- Actualizar `README.md` con capturas de la extensión

## Criterios de terminado (DoD)

- [ ] Extensión v4 publicada en Chrome Web Store con screenshots actualizados
- [ ] Descripción menciona panel lateral, cola multi-IA y sincronización móvil
- [ ] Release `v4.2.0` en GitHub
- [ ] Decisión documentada sobre firma de código (sí/no con justificación)
- [ ] Etiqueta `etapa-4-done`
- [ ] Commit `feat(e4-firma-store): release etapa 4, extensión completa en Web Store`
- [ ] Tag `v4.2.0-firma-store`

## Notas para el agente

- **La revisión de la Web Store puede tardar 1-3 días laborables.** Planificar con margen. Si la revisión es rechazada, leer el motivo, corregir y resubmitir.
- **Hablar con Comercial antes de publicar.** La descripción de la Web Store es marketing y necesita coherencia con el resto de la marca Utipy.
