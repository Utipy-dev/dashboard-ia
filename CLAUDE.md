# Dashboard IA

Gestor de conversaciones con IA. Etapa 1: HTML/CSS/JS vanilla, JSON local. Etapa 2+: localhost.

## Agente
- `constructor` — implementa por etapas sobre arquitectura escalable

## Fuentes
- `.claude/especificacion.md` — especificación técnica completa
- `operaciones/estado.md` — fase actual, tareas y próximo paso

## Estado actual
**Etapa 1 completa y funcional.** Se abre `dashboard/index.html` en Chrome.

Incluye: layout, cronómetro (ciclo editable), temas, mensajes, imágenes en panel lateral 20%/texto 80%, juntar notas, modal "Preparar envío", botones copiar texto/imágenes por mensaje.

## Mapa de etapas
- **Etapa 1** (completa): HTML/CSS/JS vanilla, sin servidor
- **Etapa 2** (~2€): localhost — captura desde interfaz de IA, envío programado, documentos
- **Etapa 3** (~4€): sincronización móvil por WiFi
- **Etapas 4-5**: transcriptor propio integrado (voz + escritura mezclados)

## Próximo paso
1. Resolver persistencia: mover carpeta `Proyectos` fuera de `Documentos` (OneDrive)
2. Borde en bloques de mensaje (estético menor)
3. Iniciar Etapa 2 (localhost)

---

## Sistema
Cargar `sistema/protocolo.md` (raíz de utipy) al inicio de cada conversación.
