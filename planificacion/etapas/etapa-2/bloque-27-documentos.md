# Bloque 2.7 — Soporte de documentos

**Etiqueta:** `e2-documentos`
**Tag de git:** `v2.7.0-documentos`
**Estado:** 💭 plan
**Depende de:** 2.2

## Objetivo en una línea

El usuario puede adjuntar PDFs y otros archivos (texto, Office, markdown) a un mensaje, verlos como icono + nombre en el dashboard, y recuperarlos cuando envía el mensaje a la IA.

## Narrativa — por qué este bloque existe

En uso real, las conversaciones con una IA no son solo texto e imágenes. Muchas veces el contexto importante está en un PDF (un contrato, un estudio, un documento técnico), en un .docx (un borrador que el usuario está escribiendo), o en un .md (notas previas, especificaciones). La etapa 1 no podía manejarlos: File System Access no expone archivos arbitrarios al portapapeles, y el ecosistema de Chrome no tiene forma limpia de pegar un PDF como lo harías con una imagen.

El servidor local sí puede: tiene acceso al sistema de archivos. Puede guardar, organizar, y entregar archivos de vuelta cuando se piden. Este bloque introduce eso.

No busca "leer el contenido del PDF" (eso es trabajo de la IA receptora, no del dashboard). Solo gestiona el archivo como entidad: guardarlo, mostrarlo con su nombre, entregarlo al usuario cuando lo pida para copiarlo a la IA.

## Decisiones técnicas

- **Archivos guardados en `servidor/data/documentos/<mensaje_id>/` .** Razón: agrupar por mensaje facilita el borrado en cascada y el backup.
- **Nombres originales conservados.** Razón: si el usuario sube `contrato-v3.pdf`, que se llame así. No renombramos con hashes.
- **Sin parseo de contenido.** Razón: parsear PDF o Office es complejidad grande para poco valor. El usuario los copia al portapapeles y los pega en la IA tal cual.
- **Upload por drag-and-drop + botón "+".** Razón: consistencia con cómo funcionan las imágenes en etapa 1. Los usuarios ya conocen ese patrón.
- **Previsualización solo como icono + nombre + tamaño.** Razón: renderizar PDFs en el navegador es caro (PDF.js, workers, etc.) y no aporta. El usuario sabe qué documento ha subido porque tiene el nombre.
- **Límite de tamaño razonable (50MB por archivo).** Razón: proteger el servidor de subidas accidentales (alguien arrastra una ISO). Configurable.
- **Tipo detectado por extensión y MIME.** Razón: decidir qué icono mostrar. No validar contenido profundamente.

## Qué hay que construir

### En el servidor

- **Endpoint `POST /api/documentos`** (multipart/form-data):
  - Campos: `mensaje_id`, archivo en `file`
  - Guarda en `data/documentos/<mensaje_id>/<nombre-original>`
  - Devuelve: `{ id, nombre, tipo, tamaño, ruta_relativa }`
- **Endpoint `GET /api/documentos/:id`**: devuelve el binario con Content-Type correcto
- **Endpoint `DELETE /api/documentos/:id`**: borra el archivo y referencia
- **Schema de mensaje ampliado**: campo `documentos: string[]` (array de ids)

### En el dashboard

- **Zona de drop en el textarea**: al arrastrar archivo, destacar la zona
- **Botón "+" sobre mensaje guardado**: añadir documento (igual que con imágenes)
- **Componente `documento-chip.js`**: icono según tipo (pdf, doc, txt…), nombre, tamaño, X para eliminar
- **Modal "Preparar envío" ampliado**: lista los documentos adjuntos con botón "Abrir" (abre en nueva pestaña vía `GET /api/documentos/:id`)

## Archivos afectados

- `servidor/src/routes/documentos.js` — nuevo
- `servidor/src/storage/documentos.js` — nuevo (gestión de archivos en disco)
- `servidor/src/storage/schemas/mensaje.js` — ampliar con `documentos`
- `servidor/package.json` — añadir `@fastify/multipart`
- `dashboard/components/documento-chip.js` — nuevo
- `dashboard/app.js` — handlers de drop y attach
- `dashboard/styles.css` — zona de drop, chips de documento

## Criterios de terminado (DoD)

- [ ] Arrastrar un PDF sobre el textarea lo sube al mensaje activo y aparece como chip
- [ ] Click sobre chip abre el documento en nueva pestaña
- [ ] Borrar el chip elimina el archivo del disco
- [ ] Borrar el mensaje borra todos sus documentos en cascada
- [ ] El modal "Preparar envío" lista los documentos adjuntos
- [ ] Archivos mayores de 50MB dan error claro
- [ ] Commit `feat(e2-documentos): soporte de PDF y otros documentos con upload drag-drop`
- [ ] Tag `v2.7.0-documentos`

## Cómo usarlo

1. En un mensaje activo, arrastra un PDF desde el explorador al textarea
2. Aparece un chip con el icono y el nombre
3. Guarda el mensaje → el documento queda vinculado
4. Al preparar el envío, el documento aparece en el modal con botón "Abrir"

## Notas para el agente

- **`@fastify/multipart` tiene dos modos: busboy (streaming) y body (buffer).** Usa streaming — mejor para archivos grandes.
- **Sanear el nombre del archivo.** Rutas como `../../etc/passwd` o caracteres no válidos en Windows (`<>:"/\|?*`) deben filtrarse antes de guardar.
- **Iconos por tipo de archivo.** Mantén una pequeña biblioteca de iconos SVG en `dashboard/assets/iconos-documento/` — pdf, doc, txt, md, xls, zip, default. No uses dependencias externas tipo "react-icons".
- **El `POST` debe validar que el `mensaje_id` existe** antes de guardar el archivo, o te quedas con archivos huérfanos.
