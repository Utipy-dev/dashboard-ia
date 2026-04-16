# Sesión 2026-04-16 — Planificación completa etapas 2-5

## Contexto
Sesión nocturna autorizada por Arturo ("te dejo haciendo todo"). Continuación de la sesión del 11/04 donde se redefinió la visión de producto. El objetivo era escribir toda la planificación de bloques para que agentes futuros puedan continuar desde cualquier punto.

## Lo que se hizo

### Etapa 2 (bloques 2.7-2.12)
Se completaron los 6 bloques restantes de etapa 2 (los 2.0-2.6 se habían escrito en la sesión anterior):
- 2.7: Soporte de documentos (PDF/otros, upload streaming, 50MB limit)
- 2.8: Copiar archivos reales al portapapeles del sistema (PowerShell/osascript/xclip)
- 2.9: Envío programado (scheduler con setTimeout, campo `programado_para`)
- 2.10: Reserva de sesión (botón dedicado, +1h/+2h/+3h, panel sesiones activas)
- 2.11: Simplificación post-servidor (limpieza de workarounds de etapa 1)
- 2.12: Packaging (instaladores por OS, Chrome Web Store $5, GitHub Releases)

### Etapa 3 (12 bloques, desde cero)
Dos hilos: sincronización móvil (3.0-3.3) y cola multi-IA (3.4-3.9), más historial y packaging:
- 3.0: WebSocket server con TLS autofirmado (mkcert), auth por token, protocolo JSON
- 3.1: PWA móvil accesible por IP local, manifest.json, detección automática de mobile
- 3.2: Sync bidireccional PC-móvil (push desde servidor, delta + full, last-write-wins)
- 3.3: Control remoto (cancelar/disparar envíos desde móvil, widget sesiones)
- 3.4: Schema JSON de tarea (3 modos: limpio/contexto/continuar, CRUD, prioridad)
- 3.5: Runner secuencial (máquina de estado, pause/resume, 1 reintento, broadcast WS)
- 3.6: Ejecutor claude-code (`claude -p`, spawn, timeout 5min, detección ENOENT)
- 3.7: Modo contexto (prepende .md al mensaje, pdf-parse, límite 100KB)
- 3.8: Modo continuar (historial de conversación como texto, últimos 10 intercambios)
- 3.9: Output .md con frontmatter + resumen automático + notificación nativa
- 3.10: Historial cross-IA (timeline cronológico, búsqueda texto, paginación cursor)
- 3.11: Packaging etapa 3 (mkcert en instalador, QR para móvil, FAQ actualizado)

### Etapas 4-5 (6 bloques, nivel intención)
- 4.0: Side Panel API de Chrome para dashboard en panel lateral
- 4.1: Integración profunda panel-páginas de IA (indicadores contextuales)
- 4.2: Firma y publicación definitiva en Chrome Web Store
- 5.0: App shell nativa (Node SEA + systray, autoarranque)
- 5.1: Transcriptor local (whisper.cpp, mezcla voz+escritura)
- 5.2: Release final y guía completa

### Skill `/estructurar-etapas`
Arturo pidió convertir el proceso de planificación en skill reutilizable. Creada en `utipy/.claude/skills/estructurar-etapas/SKILL.md` con 7 fases: leer terreno, clasificar decisiones, definir mapa, escribir bloques, archivos soporte, commit/push, cierre. Pendiente de depuración.

## Commits
- `a346f46` docs(e2): bloques 2.7-2.12 etapa 2
- `1e6cb6e` docs(e3): bloques 3.0-3.11 etapa 3
- `dd87cbe` docs(e4-e5): bloques 4.0-5.2 etapa 4-5 + operaciones

## Decisiones clave
- Etapas 4-5 escritas a nivel de intención, no de implementación. Las decisiones técnicas se toman al llegar.
- La cola multi-IA en etapa 3 solo soporta Claude Code CLI. Otros CLIs como campo en schema pero sin implementar.
- TLS autofirmado con mkcert, no Let's Encrypt (incompatible con uso local).
- Sync con last-write-wins, sin CRDTs (un solo usuario, conflictos rarísimos).
- Node SEA como propuesta para app shell en etapa 5 (decisión diferida).
