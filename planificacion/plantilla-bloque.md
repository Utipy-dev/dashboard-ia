# Plantilla de bloque

**Usa esta plantilla para crear un .md de bloque nuevo.** Cópiala entera, rellena los campos, y guárdala en `planificacion/etapas/etapa-X/bloque-YY-slug.md`.

---

```markdown
# Bloque X.Y — Título corto

**Etiqueta:** `eX-slug-descriptivo`
**Tag de git al terminar:** `vX.Y.0-slug-descriptivo`
**Estado:** 💭 plan | 🚧 wip | ✅ done | ❓ doubt
**Depende de:** [lista de bloques previos que deben estar terminados]

---

## Objetivo en una línea

[Qué consigue este bloque cuando esté hecho. Una sola frase.]

## Narrativa — por qué este bloque existe

[El "por qué" de la decisión. Esta sección importa tanto como la técnica.
Explica el problema que resuelve, por qué se aborda ahora y no antes o
después, y qué alternativas se descartaron. Es lo que la comunidad de GitHub
va a leer para entender el proceso. No te la ahorres.]

## Decisiones técnicas

- **Decisión 1:** qué se hace. **Razón:** por qué así y no de otra forma.
- **Decisión 2:** ...
- **Decisión 3:** ...

## Qué hay que construir

[Descripción técnica de lo que se construye. Lo suficiente para que un agente
pueda ejecutar, pero sin convertirse en pseudocódigo línea a línea. Incluye:
endpoints, estructuras de datos clave, flujos principales.]

## Archivos afectados

[Lista previa — se actualiza al MANIFEST.md al terminar]

- `ruta/archivo-nuevo.js` — nuevo
- `ruta/archivo-existente.js` — modificar
- `ruta/archivo-eliminado.js` — eliminar

## Criterios de terminado (DoD)

- [ ] Funcionalidad demostrable manualmente (pasos exactos)
- [ ] No rompe bloques anteriores (verificación rápida)
- [ ] Documentado en este .md (sección "Cómo usarlo")
- [ ] MANIFEST.md del bloque actualizado
- [ ] Commit con convenio `feat(eX-slug): descripción`
- [ ] Tag `vX.Y.0-slug` aplicado
- [ ] `planificacion/versiones.md` actualizado a ✅ done

## Cómo usarlo (después de terminar)

[Pasos para que alguien que clone el repo pueda probar lo que este bloque añade]

## Notas para el agente

[Gotchas, detalles no obvios, dependencias sutiles. Lo que a ti te habría ahorrado tiempo si alguien te lo hubiera dicho antes.]

## Preguntas abiertas

[Cosas que no sabes resolver aún. Si está vacío, mejor.]
```

---

## Cómo se llena la plantilla

**Narrativa — por qué este bloque existe.** Esta sección es el corazón del proyecto "publicado como narrativa". Mientras escribes, pregúntate: si alguien que no conoce el proyecto lee solo esta sección, ¿entiende por qué el bloque existe? ¿Y por qué se eligió este camino y no otro? Si no, reescribe.

**Decisiones técnicas.** Cada bullet es una micro-decisión explicada. No solo "Fastify", sino "Fastify porque es más rápido que Express y tiene plugins modernos sin la sobrecarga de NestJS". La razón es lo que la comunidad lee.

**Archivos afectados.** Se llena en dos momentos: al planificar (lista aproximada) y al terminar (lista definitiva en el MANIFEST.md). El MANIFEST es lo que permite "cargar el bloque entero" si hay que volver atrás.

**Criterios de terminado.** Usa la misma lista en todos los bloques. Consistencia importa. Si un bloque necesita criterios extra, añádelos al final de la lista, no reemplaces los estándar.

**Notas para el agente.** Escribe aquí todo lo que te diste cuenta mientras construías y que no era obvio desde la especificación. Ejemplos: "el middleware X hay que cargarlo antes del Y o no funcionan los cookies", "en Windows el path necesita forward slashes", "el puerto 3000 lo usa Node por defecto para otras cosas, elegí 3333". Este bloque se lee el primero cuando alguien duda.
