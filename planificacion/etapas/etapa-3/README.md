# Etapa 3 — Sincronización móvil + cola multi-IA

**Estado:** 💭 plan
**Depende de:** Etapa 2 completa (`etapa-2-done`)
**Precio objetivo:** ~4€/mes en infraestructura externa (0 si todo es local WiFi)

## Qué se construye en esta etapa

Dos grandes bloques independientes que comparten infraestructura WebSocket:

### 1. Sincronización móvil

El dashboard pasa a ser accesible desde cualquier dispositivo en la misma red WiFi. Sin apps, sin cloud, sin cuenta: escribes `192.168.1.X:3333` en el navegador del móvil y tienes el dashboard completo con datos sincronizados en tiempo real.

Casos de uso concretos:
- Estás en el sofá con el móvil, ves la respuesta que acaba de llegar de Claude en el PC
- Desde el móvil cancelas un envío programado que ya no quieres mandar
- Dictado en el móvil, texto aparece en el PC

### 2. Cola multi-IA

Un sistema de tareas asíncronas: preparas mensajes para Claude Code (u otras IAs CLI), los metes en cola, y el servidor los ejecuta en segundo plano uno a uno. Los resultados se guardan como `.md` con resumen automático.

Casos de uso concretos:
- "Necesito que Claude Code revise estos 4 archivos, uno por uno" → los encolas y te vas
- "Cuando tenga sesión, ejecuta estas 3 tareas en secuencia"
- Integración con reserva de sesión (etapa 2.10): reservas sesión + encolas tareas, a la hora indicada se ejecuta todo solo

## Orden de los bloques

```
3.0 → WebSocket server (base para todo lo demás)
3.1 → PWA móvil básica
3.2 → Sincronización bidireccional
3.3 → Control remoto desde móvil
    ← aquí el hilo del móvil está completo
3.4 → Formato JSON de la cola
3.5 → Ejecutor secuencial (runner)
3.6 → Modo claude-code CLI
3.7 → Modo con contexto (.md adjunto)
3.8 → Modo continuar (conversación anterior)
3.9 → Output .md + resumen
3.10 → Historial unificado cross-IA
3.11 → Packaging release etapa 3
```

Los bloques 3.0-3.3 y 3.4-3.9 son semi-independientes entre sí: WebSocket (3.0) sirve a ambos hilos. Se puede construir el hilo del móvil sin la cola, o la cola sin el móvil.

## Decisiones de arquitectura de etapa

- **WebSocket, no polling.** Razón: la sincronización móvil con polling introduce latencia y batería. WS es la elección natural. `ws` (npm) se integra con Fastify limpiamente.
- **TLS autofirmado con mkcert.** Razón: los navegadores modernos bloquean WS no seguro (`ws://`) en páginas HTTPS. `mkcert` genera certificados de confianza local en segundos. El usuario acepta el certificado una sola vez.
- **PWA, no app nativa.** Razón: no hay que publicar en App Store, no hay dependencia de Apple/Google, funciona en cualquier dispositivo con navegador. La limitación es que necesita WiFi local — pero esa es exactamente la premisa del producto.
- **Cola secuencial, no paralela.** Razón: los rate limits de las IAs son el cuello de botella real. Ejecutar 3 tareas en paralelo probablemente acabe con errores por límite de velocidad. Secuencial es conservador y correcto.
- **`claude -p` para CLI.** Razón: Claude Code expone un modo print (`-p`) que ejecuta un mensaje y devuelve la respuesta sin interfaz interactiva. Es exactamente lo que necesita el runner. Si el usuario no tiene Claude Code instalado, la cola muestra error claro.

## Demostración de valor (pitch de etapa)

**Usuario:**
> "Tengo 6 tareas para Claude Code. Antes las ejecutaba una a una, esperando cada respuesta. Ahora las meto en cola, voy al móvil, y cuando vuelvo están todas resueltas con su `.md` de resultado."

**Técnico:**
> WebSocket con `@fastify/websocket`. Cola en `src/servidor/data/cola/` como JSON. Runner con `child_process.spawn('claude', ['-p', mensaje])`. PWA en `src/dashboard/movil/`. TLS con `mkcert localhost 192.168.X.X`.
