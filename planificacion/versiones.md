# Versiones — Dashboard IA

Índice maestro de etapas y bloques. Para cualquier bloque, el `.md` detallado está en `planificacion/etapas/etapa-X/bloque-YY-*.md`.

**Leyenda de estado:**
- `✅ done` — terminado, taggeado en git, no se toca
- `🚧 wip` — en curso
- `📋 next` — siguiente en la cola
- `💭 plan` — planificado, aún no empezado
- `❓ doubt` — hay dudas bloqueantes, ver `dudas.md`

**Nomenclatura de tags:** `vX.Y.Z` donde X=etapa, Y=bloque dentro de la etapa, Z=parche. Ej. `v2.3.0` = etapa 2 bloque 3, primera versión.

**Nomenclatura de etiquetas de bloque:** `eX-slug-descriptivo`. Ej. `e2-captura-chrome`, `e3-cola-multiia`.

---

## Etapa 1 — Vanilla local ✅

Base HTML/CSS/JS sin servidor. JSON local. Se abre `dashboard/index.html` en Chrome.

| # | Tag | Bloque | Estado |
|---|-----|--------|--------|
| 1.0 | `v1.0.0-base` | `e1-base-vanilla` — Layout, cronómetro, temas, mensajes | ✅ done |
| 1.1 | `v1.1.0-imagenes` | `e1-imagenes` — Ctrl+V de imágenes, panel lateral, add a mensaje | ✅ done |
| 1.2 | `v1.2.0-juntar` | `e1-juntar-notas` — Combinar varios mensajes en uno | ✅ done |
| 1.3 | `v1.3.0-envio` | `e1-modal-envio` — Modal "Preparar envío" con copiado | ✅ done |

**Etiqueta de etapa:** `etapa-1-done` (pendiente de aplicar cuando hagamos el primer tag retrospectivo)

---

## Etapa 2 — Servidor local 💭

Todo corre en localhost. Node.js como base. Primera versión publicable del producto.

| # | Tag | Bloque | Estado | Dependencias |
|---|-----|--------|--------|---------------|
| 2.0 | `v2.0.0-servidor-base` | `e2-servidor-base` — Fastify, estructura, rutas health | 💭 plan | e1 completa |
| 2.1 | `v2.1.0-storage-api` | `e2-storage-api` — API REST para proyectos/IAs/conversaciones/mensajes | 💭 plan | 2.0 |
| 2.2 | `v2.2.0-migracion-json` | `e2-migracion-json` — Cliente pasa de File System Access a fetch | 💭 plan | 2.1 |
| 2.3 | `v2.3.0-arranque-auto` | `e2-arranque-auto` — Script de arranque cross-OS + abrir navegador | 💭 plan | 2.0 |
| 2.4 | `v2.4.0-extension-base` | `e2-extension-base` — Extensión Chrome mínima (manifest + popup) | 💭 plan | 2.0 |
| 2.5 | `v2.5.0-captura-interfaz` | `e2-captura-interfaz` — Content script captura texto del textarea de la IA | 💭 plan | 2.4, 2.1 |
| 2.6 | `v2.6.0-config-ia` | `e2-config-ia` — Configuración por IA (URL, selectores) en el dashboard | 💭 plan | 2.5 |
| 2.7 | `v2.7.0-documentos` | `e2-documentos` — Soporte PDF y otros: upload, storage, visualización | 💭 plan | 2.2 |
| 2.8 | `v2.8.0-copiar-reales` | `e2-copiar-reales` — Copiar múltiples archivos reales via carpeta temp | 💭 plan | 2.7 |
| 2.9 | `v2.9.0-envio-programado` | `e2-envio-programado` — Scheduler local, cronómetro por mensaje | 💭 plan | 2.5 |
| 2.10 | `v2.10.0-reserva-sesion` | `e2-reserva-sesion` — Caso especial: mensaje de reserva de sesión | 💭 plan | 2.9 |
| 2.11 | `v2.11.0-simplificacion` | `e2-simplificacion` — Repaso general y simplificaciones post-servidor | 💭 plan | 2.1-2.10 |
| 2.12 | `v2.12.0-packaging` | `e2-packaging` — Instalador one-click + primer release público | 💭 plan | 2.11 |

**Etiqueta de etapa:** `etapa-2-done`

---

## Etapa 3 — Sincronización móvil + cola multi-IA 💭

WebSocket sobre WiFi local. Cola de tareas multi-IA ejecutable en segundo plano.

| # | Tag | Bloque | Estado | Dependencias |
|---|-----|--------|--------|---------------|
| 3.0 | `v3.0.0-ws-server` | `e3-ws-server` — WebSocket server en el servidor local, TLS autogenerado | 💭 plan | 2.12 |
| 3.1 | `v3.1.0-cliente-movil` | `e3-cliente-movil` — PWA mínima accesible por IP local | 💭 plan | 3.0 |
| 3.2 | `v3.2.0-sync-datos` | `e3-sync-datos` — Sincronización bidireccional de mensajes y estado | 💭 plan | 3.1 |
| 3.3 | `v3.3.0-control-remoto` | `e3-control-remoto` — Disparar envíos programados desde el móvil | 💭 plan | 3.2, 2.9 |
| 3.4 | `v3.4.0-cola-json` | `e3-cola-json` — Formato JSON de tareas (proyecto, mensaje, contexto) | 💭 plan | 3.0 |
| 3.5 | `v3.5.0-cola-runner` | `e3-cola-runner` — Ejecutor secuencial con estado pending/done/error | 💭 plan | 3.4 |
| 3.6 | `v3.6.0-cola-claude-code` | `e3-cola-claude-code` — Modo comando limpio: `claude -p` | 💭 plan | 3.5 |
| 3.7 | `v3.7.0-cola-contexto` | `e3-cola-contexto` — Modo con contexto: antepone .md al mensaje | 💭 plan | 3.6 |
| 3.8 | `v3.8.0-cola-continuar` | `e3-cola-continuar` — Modo continuar: lee JSONL de conversación anterior | 💭 plan | 3.6 |
| 3.9 | `v3.9.0-cola-output` | `e3-cola-output` — Output .md + resumen automático post-tarea | 💭 plan | 3.6 |
| 3.10 | `v3.10.0-historial-cross` | `e3-historial-cross` — Historial unificado cross-IA en dashboard | 💭 plan | 3.9 |
| 3.11 | `v3.11.0-packaging` | `e3-packaging` — Release etapa 3 con móvil + cola | 💭 plan | 3.10 |

**Etiqueta de etapa:** `etapa-3-done`

---

## Etapa 4 — Extensión de Chrome como producto 💭

La extensión deja de ser "capturador" y pasa a ser una superficie de trabajo completa.

| # | Tag | Bloque | Estado | Dependencias |
|---|-----|--------|--------|---------------|
| 4.0 | `v4.0.0-extension-ui` | `e4-extension-ui` — UI completa de la extensión (no solo popup) | 💭 plan | 3.11 |
| 4.1 | `v4.1.0-extension-dashboard` | `e4-extension-dashboard` — Acceso completo al dashboard desde la extensión | 💭 plan | 4.0 |
| 4.2 | `v4.2.0-firma-store` | `e4-firma-store` — Firmar y publicar en Chrome Web Store | 💭 plan | 4.1 |

**Etiqueta de etapa:** `etapa-4-done`

---

## Etapa 5 — App nativa + transcriptor propio 💭

App de escritorio independiente (Electron/Tauri/Node SEA — decisión diferida). Transcriptor integrado que resuelve las limitaciones del transcriptor de Claude.

| # | Tag | Bloque | Estado | Dependencias |
|---|-----|--------|--------|---------------|
| 5.0 | `v5.0.0-app-shell` | `e5-app-shell` — Shell nativo con web embebida | 💭 plan | 4.2 |
| 5.1 | `v5.1.0-transcriptor` | `e5-transcriptor` — Transcripción con mezcla voz + escritura | 💭 plan | 5.0 |
| 5.2 | `v5.2.0-release-final` | `e5-release-final` — Release estable + guía completa publicada | 💭 plan | 5.1 |

**Etiqueta de etapa:** `etapa-5-done`

---

## Etapas futuras (fuera del roadmap actual)

- Arquitectura cloud opcional (acceso sin PC encendido) — pendiente de catalogar casos de uso
- Soporte de más IAs en la captura conforme salgan interfaces nuevas
- Marketplace de configuraciones de IA compartidas por la comunidad
