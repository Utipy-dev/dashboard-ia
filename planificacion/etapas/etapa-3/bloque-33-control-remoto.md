# Bloque 3.3 — Control remoto desde móvil

**Etiqueta:** `e3-control-remoto`
**Tag de git:** `v3.3.0-control-remoto`
**Estado:** 💭 plan
**Depende de:** 3.2, 2.9

## Objetivo en una línea

Desde el móvil, ver los envíos programados pendientes, cancelarlos o dispararlos inmediatamente, y ver el estado de sesiones reservadas.

## Narrativa — por qué este bloque existe

La reserva de sesión (2.10) y el envío programado (2.9) son features de "programa ahora, ejecuta luego". Pero una vez programado algo, el usuario puede querer cambiarlo desde el sofá sin ir al PC. "Ah, ya no necesito mandar ese mensaje a las 15:00" → cancela desde el móvil. O: "Voy a empezar antes de lo planeado" → dispara ahora.

Es también el primer bloque donde el móvil no es solo visualización sino control activo. Establece el patrón de "acción remota vía API REST + confirmación por WS" que la cola multi-IA usará también.

## Decisiones técnicas

- **Las acciones van por REST, no por WS.** El móvil hace `DELETE /api/mensajes/:id/programacion` o `POST /api/mensajes/:id/disparar-ahora`. WS solo para recibir confirmación y actualizaciones. Razón: las acciones son solicitudes únicas con respuesta de éxito/error — el modelo request/response es más apropiado que un mensaje WS.
- **Pantalla dedicada "Pendientes" en la PWA.** Lista de mensajes con `programado_para` activo, ordenados por hora. Para cada uno: "Cancelar" y "Enviar ahora". Razón: la gestión de envíos necesita su propio espacio en el móvil, no debe estar enterrada en la vista de conversación.
- **Vista de sesiones activas del móvil.** El panel de sesiones activas (2.10) también aparece en la PWA. Muestra cada IA con estado: "Sesión reservada — caduca aprox. 15:30" o "Sin sesión activa". Razón: el usuario lo consulta frecuentemente desde el móvil antes de ponerse a trabajar.

## Qué hay que construir

### En el servidor

- No hay endpoints nuevos — los de `2.9` (`GET /api/scheduler/pendientes`, `POST /api/mensajes/:id/disparar-ahora`) ya existen.
- Añadir `DELETE /api/mensajes/:id/programacion` si no existe (limpiar `programado_para`).
- Asegurarse de que el broadcaster emite `sync_delta` cuando cambia el estado de un mensaje programado (disparo, cancelación, envío).

### En la PWA móvil

- **Pantalla `/movil/pendientes`:**
  - Lista de mensajes con programación activa
  - Para cada uno: hora, IA destino, preview del texto, botones "Cancelar" y "Enviar ahora"
  - Actualizada en tiempo real por `sync_delta`

- **Panel de sesiones activas:**
  - Reutilizar lógica del componente PC adaptado a móvil
  - Mostrar en pantalla de inicio como widget

- **Confirmación de acciones destructivas:**
  - "¿Cancelar este envío?" → sí/no antes de borrar
  - Razón: pantalla táctil, fácil tocar sin querer

## Archivos afectados

- `servidor/src/routes/scheduler.js` — añadir DELETE si falta
- `servidor/src/ws/broadcaster.js` — asegurar emit en cambios de scheduler
- `dashboard/movil/pantalla-pendientes.js` — nuevo
- `dashboard/movil/widget-sesiones.js` — nuevo
- `dashboard/movil/index.html` — añadir navegación a pantalla pendientes

## Criterios de terminado (DoD)

- [ ] Lista de envíos pendientes visible en el móvil, ordenada por hora
- [ ] "Cancelar" desde el móvil cancela el programado y desaparece de la lista en PC y móvil
- [ ] "Enviar ahora" desde el móvil dispara el mensaje (verificar en Claude.ai que llega)
- [ ] Widget de sesiones activas muestra estado correcto para cada IA configurada
- [ ] Confirmación antes de cancelar (prevenir toque accidental)
- [ ] Commit `feat(e3-control-remoto): control de envíos programados y sesiones desde móvil`
- [ ] Tag `v3.3.0-control-remoto`

## Cómo usarlo

1. Tienes un mensaje programado para las 15:00
2. A las 14:45 cambias de planes — abres el dashboard en el móvil
3. Pestaña "Pendientes" → ves el mensaje
4. "Cancelar" → el mensaje ya no se enviará
5. O "Enviar ahora" si quieres mandarlo de inmediato

## Notas para el agente

- **Este bloque cierra el hilo "móvil" de etapa 3.** Los bloques 3.4-3.9 son el hilo "cola multi-IA" y son independientes del móvil. Se puede desarrollar uno sin el otro.
- **"Enviar ahora" puede tardar hasta 60s** (abrir pestaña, cargar IA, inyectar texto). La PWA debe mostrar un spinner y estado "enviando..." hasta recibir confirmación por WS.
- **Si el envío falla,** el estado `"error"` debe ser visible en el móvil igual que en el PC.

## Preguntas abiertas

- **¿Crear nuevos envíos programados desde el móvil?** El flujo sería: elige conversación → escribe mensaje → programa hora → confirmar. Complejo para este bloque. **Propuesta:** etapa 3 solo gestiona los ya creados, crear nuevos desde el PC por ahora.
