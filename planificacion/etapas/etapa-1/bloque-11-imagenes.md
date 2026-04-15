# Bloque 1.1 — Imágenes via Ctrl+V

**Etiqueta:** `e1-imagenes`
**Tag de git:** `v1.1.0-imagenes` (retrospectivo)
**Estado:** ✅ done
**Depende de:** 1.0

## Objetivo en una línea

Pegar imágenes con Ctrl+V tanto en el textarea activo como sobre mensajes ya guardados, con panel lateral de thumbnails gestionable.

## Narrativa — por qué este bloque existe

Al usar el dashboard en la práctica, apareció un patrón: muchas veces el contexto que necesita la IA para responder bien no es solo texto, es una captura de pantalla. Un diagrama en un PDF, un error en la consola, un mockup de un diseño. Forzar al usuario a guardar la imagen como archivo, arrastrarla, etc., rompe el flujo. Ctrl+V tenía que funcionar igual que en cualquier editor moderno.

Pero había un matiz: un mensaje puede necesitar varias imágenes, y también el textarea puede necesitar añadir imágenes mientras escribes. Las dos situaciones exigen interfaces distintas. El panel lateral (20% de ancho) sirve como "banco de imágenes" mientras escribes, y el botón "+" sobre mensaje guardado permite añadir imágenes a algo que ya no está activo.

## Decisiones técnicas

- **Panel lateral fijo al 20% / texto al 80%.** Razón: las imágenes necesitan su propio espacio permanente, no un modal que se abre y cierra. Ver todo a la vez reduce fricción.
- **Interceptar Ctrl+V sobre mensaje guardado para redirigir al sistema de imágenes.** Razón: sin esto, pegar sobre un mensaje cerrado insertaba el binario en el texto. Redirigir es más intuitivo.
- **Botón "+" en hover.** Razón: es descubrible sin saturar la UI. Aparece al pasar el ratón.
- **Thumbnails 80×80 con X para eliminar.** Razón: tamaño suficiente para identificar la imagen, X inmediato para no obligar a "entrar" al modo edición.
- **Base64 en el JSON de datos.** Razón: mantiene todo autocontenido, sin referencias a archivos externos que pueden romperse si el usuario mueve la carpeta.

## Qué contiene

- Event listener global de `paste` en el textarea activo
- Interceptor de `paste` en elementos `.mensaje` guardados
- Componente de thumbnail con X de borrado
- Persistencia de imágenes en base64 dentro del mensaje correspondiente

## Archivos afectados

- `dashboard/app.js` — handlers de paste
- `dashboard/components/*.js` — renderizado de thumbnails
- `dashboard/styles.css` — layout 20/80 y estados hover del "+"

## Cómo usarlo

- En el textarea del mensaje activo: Ctrl+V → la imagen aparece en el panel lateral
- Sobre un mensaje ya guardado: hover → aparece el "+" → clic abre selector, o Ctrl+V también funciona
- Para eliminar: hover sobre el thumbnail → clic en la X

## Notas para el agente

- **El tamaño de base64 en JSON puede crecer rápido.** No es un problema a escala actual, pero si en etapas futuras el dashboard guarda cientos de mensajes con imágenes, habrá que migrar a archivos separados. En etapa 2 cuando entre el servidor es buen momento para replantear.
- **El interceptor de paste respeta el tipo MIME.** Solo intercepta image/*. Texto, HTML y otros tipos pasan normalmente.
