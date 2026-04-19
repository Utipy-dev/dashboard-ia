# Bloque 2.2 — Migración del cliente a la API

**Etiqueta:** `e2-migracion-json`
**Tag de git:** `v2.2.0-migracion-json`
**Estado:** 💭 plan
**Depende de:** 2.1

## Objetivo en una línea

El dashboard web deja de usar File System Access y pasa a hablar con el servidor por `fetch`. El comportamiento visible es idéntico, pero la persistencia ya no depende del permiso de Chrome.

## Narrativa — por qué este bloque existe

Este es el bloque donde la etapa 2 "arranca" desde el punto de vista del usuario. Antes de este bloque, el servidor está arriba pero el dashboard no lo usa. Después, el problema crónico de la etapa 1 (Chrome pidiendo permiso cada vez que abres el dashboard) desaparece. El dashboard se abre y ya está, sin preguntas.

Lo importante aquí es **no cambiar nada visible**. Si el usuario nota algo distinto en la UI, has hecho algo mal. La migración es puramente interna: la capa `storage/storage.js` pasa a ser un cliente HTTP y el resto del código no se entera.

## Decisiones técnicas

- **Reescribir `src/dashboard/storage/storage.js` entero, manteniendo su interfaz.** Razón: el resto del código llama a `storage.getProyectos()`, `storage.saveConversacion(...)`, etc. Si la interfaz se respeta, ni un archivo más necesita tocarse.
- **`fetch` nativo, sin axios ni librerías.** Razón: la API es simple, no hace falta más. Menos dependencias = menos sorpresas.
- **Sin loading states ni spinners en este bloque.** Razón: el servidor es local, las llamadas tardan 1-2 ms. Añadir loading es sobreingeniería. Si en algún momento aparece latencia real, se añade.
- **Eliminar File System Access del código.** Razón: dejar código muerto confunde. Se archiva en la historia de git.
- **Migración única de datos.** Si el usuario ya tenía datos en etapa 1, hace falta copiarlos una vez al servidor. Script de migración que lee la carpeta antigua y hace POSTs a la API.

## Qué hay que construir

1. **Nuevo `src/dashboard/storage/storage.js`**: todas las funciones pasan a hacer `fetch` a `http://localhost:3333/api/...`. La interfaz pública (los nombres de funciones y parámetros) no cambia.

2. **Script `src/servidor/scripts/migrar-etapa1.js`**: lee archivos `.json` de la carpeta antigua y llama al servidor entidad por entidad, respetando dependencias (proyectos antes de conversaciones antes de mensajes).

3. **Borrar el selector de carpeta en el dashboard.** La interfaz de "elegir carpeta al abrir" desaparece. El dashboard asume que el servidor está arriba. Si no está, mensaje claro de error.

4. **Health check al arrancar el dashboard.** Antes de renderizar nada, llama a `GET /health`. Si no responde, muestra pantalla "Arranca el servidor con `npm start` o con el acceso directo del escritorio".

## Archivos afectados

- `src/dashboard/storage/storage.js` — reescribir
- `src/dashboard/app.js` — eliminar lógica de selector de carpeta, añadir health check inicial
- `src/dashboard/index.html` — quitar botón/modal de "elegir carpeta"
- `src/dashboard/styles.css` — quitar estilos huérfanos
- `src/servidor/scripts/migrar-etapa1.js` — nuevo

## Criterios de terminado (DoD)

- [ ] El dashboard funciona idéntico a etapa 1 pero sin pedir carpeta
- [ ] Todos los flujos de etapa 1 siguen operativos (cronómetro, mensajes, imágenes, juntar notas, modal envío)
- [ ] Si el servidor no está arriba, el dashboard muestra mensaje claro y no crashea
- [ ] Script de migración prueba: un set de datos de etapa 1 se importa y queda idéntico en el servidor
- [ ] Commit `feat(e2-migracion-json): cliente consume API del servidor, elimina File System Access`
- [ ] Tag `v2.2.0-migracion-json`

## Cómo usarlo

1. Arranca el servidor (`cd servidor && npm start`)
2. Abre `src/dashboard/index.html` en Chrome
3. Si es la primera vez y tenías datos de etapa 1: `node servidor/scripts/migrar-etapa1.js /ruta/a/datos-antiguos`
4. El dashboard carga directamente con tus datos

## Notas para el agente

- **No rompas la compatibilidad de la interfaz `storage.js`.** Los componentes la usan. Si cambias un nombre, tienes que cambiar todos los sitios, y es dolor inútil.
- **Maneja los errores de fetch con mensajes entendibles.** No muestres `Failed to fetch` al usuario, muestra "No hay conexión con el servidor — ¿está arriba?".
- **El health check al arrancar es importante.** Es la primera impresión del usuario después de migrar. Si falla silenciosamente, el dashboard parecerá roto.
- **Este bloque cierra la etapa 1 como fuente de datos.** Después de este bloque, `File System Access API` no aparece en el repo.
