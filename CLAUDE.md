---
identidad: n3-principal
rol: principal
---

Lee `../sistema/protocolo.md` antes de continuar.

# Dashboard IA

Gestor personal de conversaciones con IA. E1: HTML/CSS/JS vanilla. E2+: localhost Node.

## Contexto
Navega `contexto/` en cascada: `indice.md` → `directorio.md` → `general.md` si hace falta.

## Estado actual
**E1 completa y funcional.** Abre `dashboard/index.html` en Chrome.

## Estructura de código
El código fuente vive en `src/` (dashboard, servidor, extensión). Los archivos de proyecto (planificacion/, operaciones/, contexto/) quedan en la raíz.

## Skills
Las skills del proyecto están en `utipy/.claude/skills/`. Pueden no aparecer en el menú de comandos — búscalas con Grep antes de asumir que no existen. Relevantes para este proyecto: `/estructurar-etapas`.

## Git
Este proyecto usa git con commits y push normales. No usar `--no-verify` ni omitir commits por el bug conocido de Claude Code con git — si hay error, reportar.

## Próximo paso
1. Iniciar E2 (bloque 2.0 — servidor base)
2. Sesión con Comercial para alinear estrategia GitHub
