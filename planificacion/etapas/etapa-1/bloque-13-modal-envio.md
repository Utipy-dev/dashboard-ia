# Bloque 1.3 — Modal "Preparar envío"

**Etiqueta:** `e1-modal-envio`
**Tag de git:** `v1.3.0-envio` (retrospectivo)
**Estado:** ✅ done
**Depende de:** 1.0, 1.1

## Objetivo en una línea

Previsualizar cómo va a llegar el mensaje a la IA, con botones para copiar texto e imágenes por separado.

## Narrativa — por qué este bloque existe

En etapa 1, "enviar" significa literalmente "pegar en la interfaz de la IA". No hay captura, no hay automatización. Por eso el paso de preparación importa mucho: el usuario necesita ver exactamente qué va a pegar, en qué orden, con qué imágenes, antes de saltar a la pestaña de Claude o ChatGPT.

El modal también cumple una función psicológica: marca un "momento" entre escribir y enviar. Permite revisar sin presión. Es lo contrario del flujo "escribo y enter manda", que es justo lo que el dashboard quiere evitar.

## Decisiones técnicas

- **Modal y no página/panel.** Razón: el modal bloquea el resto de la UI, que es exactamente lo que queremos cuando revisas antes de enviar. No quieres que un clic accidental te saque del flujo.
- **Botones de copiado separados por texto e imágenes.** Razón: al pegar en Claude, primero pegas el texto y luego arrastras las imágenes una a una (o Ctrl+V si funciona). Tener botones separados permite dos pulsaciones limpias en lugar de una compleja.
- **Copia al portapapeles, no "envío directo".** Razón: en etapa 1 no hay forma limpia de enviar directamente a la IA sin interfaz. El portapapeles es el denominador común.

## Qué contiene

- Botón "Preparar envío" en cada mensaje guardado
- Modal con vista previa del texto final
- Grid de imágenes del mensaje
- Botón "Copiar texto" que usa `navigator.clipboard.writeText`
- Botón "Copiar imágenes" que usa `ClipboardItem` con blobs

## Archivos afectados

- `dashboard/app.js` — lógica del modal y handlers de copia
- `dashboard/index.html` — estructura del modal
- `dashboard/styles.css` — estilos del modal

## Cómo usarlo

1. Clica "Preparar envío" sobre un mensaje guardado
2. Revisa el texto y las imágenes en el modal
3. Clica "Copiar texto" → pega en la interfaz de tu IA
4. Clica "Copiar imágenes" → también pega en la interfaz de tu IA (o arrastra desde el portapapeles)

## Notas para el agente

- **ClipboardItem con múltiples imágenes no es homogéneo entre navegadores.** Chrome lo soporta, Firefox parcialmente. Como el dashboard requiere Chrome por el File System Access, no es bloqueante, pero si alguien prueba en otro navegador, fallará aquí.
- **Este bloque queda obsoleto en etapa 2** una vez haya captura directa desde la interfaz de la IA. Pero no se elimina — se deja como fallback manual para quien prefiera flujo explícito o use una IA que no tenga captura configurada.
