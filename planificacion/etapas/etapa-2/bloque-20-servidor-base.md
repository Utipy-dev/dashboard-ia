# Bloque 2.0 — Servidor base

**Etiqueta:** `e2-servidor-base`
**Tag de git:** `v2.0.0-servidor-base`
**Estado:** 💭 plan
**Depende de:** Etapa 1 completa

## Objetivo en una línea

Servidor Node.js arriba en `localhost:3333`, con estructura de proyecto clara y endpoint `/health` que responde.

## Narrativa — por qué este bloque existe

Todo lo que hace interesante la etapa 2 depende de tener un proceso corriendo en tu máquina fuera del navegador. Antes de añadir funciones, necesitas el esqueleto: un servidor que arranca, escucha en un puerto conocido, y muestra que está vivo. Lo simple, hecho bien, una sola vez. El resto de bloques de etapa 2 se apilan encima de este.

## Decisiones técnicas

- **Fastify como framework HTTP.** Razón: más rápido y moderno que Express, con mejor DX (validación de schemas built-in, logging integrado). Pesa menos que NestJS. Popular en la comunidad JS reciente.
- **Puerto 3333 por defecto, configurable.** Razón: el 3000 lo usa medio mundo (create-react-app, Next.js). El 3333 es suficientemente raro como para no chocar y suficientemente memorable.
- **Estructura modular con `src/routes/`, `src/services/`, `src/storage/`.** Razón: aunque ahora solo hay una ruta, la estructura prepara los bloques siguientes. Añadir sin mover.
- **ESM (`"type": "module"`) y no CommonJS.** Razón: es el estándar moderno en Node y la extensión de Chrome también usa ESM. Consistencia.
- **Sin TypeScript (de momento).** Razón: añade una capa de build y tooling que no aporta valor en esta fase — el proyecto es pequeño y el código va a cambiar mucho. Si en etapas 4-5 el proyecto crece y se justifica, migramos.
- **`pino` para logging.** Razón: viene de serie con Fastify, es el logger más rápido de Node, y en modo dev tiene `pino-pretty`.

## Qué hay que construir

```
servidor/
├── package.json          # "type": "module", deps: fastify, pino, pino-pretty
├── src/
│   ├── index.js          # entry point — arranca Fastify, registra plugins
│   ├── config.js         # puerto, host, paths, leyendo de env con defaults
│   ├── routes/
│   │   └── health.js     # GET /health → { status: "ok", version, uptime }
│   ├── services/         # (vacío, para bloques siguientes)
│   └── storage/          # (vacío, 2.1 lo llena)
└── README.md             # cómo arrancar en dev
```

Comando `npm run dev` que arranca con `pino-pretty` activo.
Comando `npm start` que arranca en modo producción.

## Endpoint

```
GET /health
→ 200 { status: "ok", version: "2.0.0", uptime: <segundos> }
```

## Archivos afectados

- `servidor/package.json` — nuevo
- `servidor/src/index.js` — nuevo
- `servidor/src/config.js` — nuevo
- `servidor/src/routes/health.js` — nuevo
- `servidor/README.md` — nuevo
- `.gitignore` raíz — añadir `servidor/node_modules/`

## Criterios de terminado (DoD)

- [ ] `cd servidor && npm install && npm run dev` arranca el servidor
- [ ] `curl localhost:3333/health` responde con 200 y el JSON esperado
- [ ] El log en consola es legible (pino-pretty activo en dev)
- [ ] Al matar el proceso, el puerto queda libre (no hay listeners colgados)
- [ ] `MANIFEST.md` del bloque actualizado
- [ ] Commit `feat(e2-servidor-base): servidor Fastify base con endpoint health`
- [ ] Tag `v2.0.0-servidor-base`
- [ ] `planificacion/versiones.md` → ✅ done

## Cómo usarlo

```bash
cd servidor
npm install
npm run dev
# en otra terminal:
curl localhost:3333/health
```

## Notas para el agente

- **No añadas CORS todavía.** Lo añade el bloque 2.2 cuando el cliente deje de ser File System Access y pase a `fetch`. Si lo añades aquí, te puedes olvidar de configurarlo bien y dejar el servidor abierto a cualquier origen.
- **Puerto 3333 en constante en `config.js`, no hardcoded.** Lee `process.env.PORT` si existe.
- **No pongas rate limiting aquí.** Es localhost, no está expuesto. Añadirlo sería defensa contra ti mismo.
