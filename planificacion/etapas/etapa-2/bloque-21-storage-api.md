# Bloque 2.1 — Storage API

**Etiqueta:** `e2-storage-api`
**Tag de git:** `v2.1.0-storage-api`
**Estado:** 💭 plan
**Depende de:** 2.0

## Objetivo en una línea

API REST completa sobre los cuatro archivos JSON de datos (proyectos, IAs, conversaciones, mensajes), con validación y persistencia atómica.

## Narrativa — por qué este bloque existe

El dashboard actual lee y escribe directamente a archivos JSON con File System Access. Eso tiene dos problemas: el permiso se pierde al cerrar la pestaña (la razón principal de toda esta etapa) y cualquier cliente externo — la extensión de Chrome, el móvil en etapa 3, la cola multi-IA — no puede tocar esos archivos. Centralizar toda la lectura/escritura detrás de una API REST lo resuelve: el servidor es el único dueño del disco, y todos los clientes hablan con el servidor.

Además, este bloque es la primera oportunidad real de pensar bien las entidades. Etapa 1 las inventó sobre la marcha. Aquí las formalizamos sin romper nada: los archivos JSON siguen siendo los mismos, el schema es el mismo, solo cambia quién los toca.

## Decisiones técnicas

- **JSON plano, no SQLite.** Razón: coherente con la narrativa del proyecto ("puedes leer tus datos con cualquier editor de texto"). SQLite añade opacidad. Si en algún momento emerge una necesidad real (búsqueda full-text, joins complejos), migramos. Hoy no existe.
- **Escrituras atómicas con `fs.rename`.** Razón: si el servidor muere a mitad de un `writeFile`, puedes quedarte con un JSON corrupto. El patrón estándar es escribir a `archivo.tmp`, `fsync`, y hacer rename al archivo final. Es atómico en todos los sistemas de archivos modernos.
- **Un archivo por entidad, como en etapa 1.** Razón: el formato ya funciona, los ciclos de vida son independientes. Cambiarlo ahora es invitar bugs.
- **Validación de schemas con el validador built-in de Fastify (JSON Schema).** Razón: Fastify lo soporta de serie, es rápido, y los schemas sirven también como documentación.
- **IDs generados por el servidor (`proj_<timestamp>_<random>`), igual que en etapa 1.** Razón: formato conocido, no hay que migrar nada.
- **CORS abierto a `localhost` y `127.0.0.1` en cualquier puerto.** Razón: el dashboard web y la extensión hablan contra esto, ambos son locales.

## Entidades y endpoints

Mantengo el modelo de etapa 1 tal cual. Los schemas están documentados en `.claude/especificacion.md`.

```
GET    /api/proyectos              → lista
POST   /api/proyectos              → crear
GET    /api/proyectos/:id          → leer
PATCH  /api/proyectos/:id          → actualizar parcial
DELETE /api/proyectos/:id          → eliminar (y cascada a conversaciones/mensajes)

GET    /api/ias
POST   /api/ias
GET    /api/ias/:id
PATCH  /api/ias/:id
DELETE /api/ias/:id

GET    /api/conversaciones?proyecto_id=...&ia_id=...
POST   /api/conversaciones
GET    /api/conversaciones/:id
PATCH  /api/conversaciones/:id
DELETE /api/conversaciones/:id

GET    /api/mensajes?conversacion_id=...
POST   /api/mensajes
GET    /api/mensajes/:id
PATCH  /api/mensajes/:id
DELETE /api/mensajes/:id
```

Respuestas siempre `{ data: ... }` o `{ error: { code, message } }`.

## Qué hay que construir

```
servidor/src/
├── storage/
│   ├── json-store.js       # read/write atómico + mutex por archivo
│   ├── entities/
│   │   ├── proyectos.js    # CRUD + cascada a conversaciones
│   │   ├── ias.js
│   │   ├── conversaciones.js
│   │   └── mensajes.js
│   └── schemas/            # JSON Schema de cada entidad
├── routes/
│   ├── proyectos.js
│   ├── ias.js
│   ├── conversaciones.js
│   └── mensajes.js
└── plugins/
    └── cors.js              # @fastify/cors configurado para localhost
```

## Archivos afectados

- `servidor/src/storage/**` — nuevos
- `servidor/src/routes/**` — nuevos
- `servidor/src/plugins/cors.js` — nuevo
- `servidor/package.json` — añadir `@fastify/cors`, `ajv-formats`

## Criterios de terminado (DoD)

- [ ] Todos los endpoints responden según la tabla
- [ ] Borrado de proyecto elimina en cascada sus conversaciones y mensajes
- [ ] Escritura atómica verificada (matar el servidor a mitad no corrompe)
- [ ] JSON Schema valida entradas y rechaza con 400 las mal formadas
- [ ] CORS funciona desde `localhost:anything`
- [ ] Test manual con curl o Postman de cada endpoint
- [ ] Commit `feat(e2-storage-api): API REST sobre JSON con validación y escritura atómica`
- [ ] Tag `v2.1.0-storage-api`

## Notas para el agente

- **Mutex por archivo, no por entidad.** Dos escrituras simultáneas al mismo archivo se pisan. Usa un mutex simple (promise chain) por cada archivo JSON.
- **No inventes un ORM.** El archivo `json-store.js` debe ser ~50-100 líneas. Si crece más, algo va mal.
- **Cascada de borrado solo para proyectos.** Borrar una IA no borra conversaciones (el usuario puede querer "liberar" la conversación y asociarla a otra IA después). Borrar una conversación sí borra sus mensajes.
- **IDs con prefijo** (`proj_`, `ia_`, `conv_`, `msg_`) ayudan a debuggear. Respetar el formato de etapa 1.

## Preguntas abiertas

- ¿Versionado del JSON (campo `schemaVersion`) para futuras migraciones? **Propuesta:** añadirlo ahora con valor `2` y documentarlo, así futuras versiones saben desde dónde migrar.
