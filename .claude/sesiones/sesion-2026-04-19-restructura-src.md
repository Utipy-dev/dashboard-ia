# Sesión 2026-04-19 — Reconstrucción carpeta, convención src/, skill depurada

## Contexto
Sesión de mantenimiento. La carpeta dashboard-ia estaba corrupta por un bug conocido de Claude Code con git (reportado en web). Arturo reconstruyó la carpeta manualmente copiando los archivos visibles. Esta sesión restauró lo que faltaba y formalizó cambios de sistema.

## Lo que se hizo

### Reconstrucción de la carpeta
- Arturo copió los archivos visibles de dashboard-ia a una carpeta nueva
- Renombró la antigua como `dashboard-ia-old`
- En sesión: se copió `.git` desde old a new con `cp -r`
- Se restauraron `.claude/sesiones/` con `git checkout -- .claude/sesiones/`
- `CLAUDE.md` y `operaciones/estado.md` tenían cambios del 17/04 no commiteados — se conservaron (eran más nuevos que git)
- `dashboard-ia-old` eliminada al cerrar sesión (ya no sirve)

### Convención src/
- Creada carpeta `src/` en la raíz
- `dashboard/` movida a `src/dashboard/` con `git mv`
- 130 rutas actualizadas en 30 archivos de planificación (etapas 2-3-4-5) con sed en lote
- Convención documentada en `CLAUDE.md`: código en `src/`, docs en raíz

### Skill `/estructurar-etapas` creada y depurada
- Primera depuración completada en esta sesión
- Añadida nota de detección de skills (buscar con ls/Grep, no fiarse del menú)
- Nota añadida también en `CLAUDE.md` del proyecto

### Git workflow documentado
- utipy-web: sin git continuo, solo push
- dashboard-ia: git normal (commits y push), bug conocido documentado

## Commits
- `87285bf` chore: convención src/, detección skills, git workflow
- `239ea4e` refactor: mover dashboard a src/dashboard/
- `22861e5` docs: actualizar rutas a src/ en bloques etapa 2-3-4-5

## Estado al cierre
- Repo limpio, up to date con origin/main
- Próximo paso: iniciar E2 bloque 2.0 (servidor base)
- `dashboard-ia-old` eliminada por Arturo
