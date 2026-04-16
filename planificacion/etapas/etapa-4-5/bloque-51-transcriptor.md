# Bloque 5.1 — Transcriptor propio: mezcla voz + escritura

**Etiqueta:** `e5-transcriptor`
**Tag de git:** `v5.1.0-transcriptor`
**Estado:** 💭 plan
**Depende de:** 5.0

## Objetivo en una línea

Un transcriptor local que captura voz desde el micrófono, mezcla la transcripción con texto escrito en tiempo real, y la almacena en el historial propio del dashboard.

## Narrativa — por qué este bloque existe

El transcriptor de Claude (en Claude.ai) tiene limitaciones importantes desde el punto de vista del usuario que usa el dashboard:

1. **No mezcla voz y escritura.** Si dictas y luego escribes, son dos cosas separadas.
2. **No guarda historial fuera de la sesión de Claude.** Si la ventana se cierra, se pierde.
3. **Pasa por los servidores de Anthropic.** Toda voz grabada sale del PC.
4. **No funciona offline.**

El transcriptor propio del dashboard resuelve todos estos puntos. Es local, guarda historial, mezcla voz y texto, funciona sin internet. Es también la pieza que diferencia el producto en las etapas finales.

## Motor de transcripción: decisión diferida

La decisión del motor de transcripción se toma cuando llegue etapa 5. Opciones vigentes:

- **Whisper local (OpenAI, modelo small/medium).** Alta calidad, funciona offline, en español es bueno. ~150MB para el modelo small. Requiere Python o `whisper.cpp` (C++). La latencia de transcripción es de 2-10s por fragmento.
- **Whisper.cpp binario.** Compilado como ejecutable, sin Python. Más ligero de integrar desde Node (`child_process.spawn`). La opción más probable.
- **Web Speech API en el móvil.** Para el cliente móvil (PWA), usar la API del navegador del móvil como input. La voz se procesa en el dispositivo (en iOS/Android el speech-to-text es local o semi-local). No requiere Whisper.
- **Deepgram/AssemblyAI como fallback en la nube.** Para usuarios que no quieran el modelo local (espacio en disco). Con API key propia del usuario, no de Utipy.

**El modelo de mixtura voz+escritura es el valor diferencial.** La interfaz no es "habla ENTONCES escribe". Es un textarea donde puedes alternar libremente: dictar un párrafo, escribir una corrección a mano, dictar otra frase. El texto final es la mezcla cohesionada.

## Qué hay que construir (borrador)

### Módulo de transcripción local

- `transcriptor/` — nueva carpeta en la raíz del proyecto (no en servidor, no en dashboard)
- `transcriptor/recorder.js` — captura audio del micrófono en chunks de 3-5s
- `transcriptor/whisper-runner.js` — lanza `whisper.cpp` como proceso hijo, recibe texto
- `transcriptor/mixer.js` — mantiene el buffer de texto mezclado (voz + escritura)
- Endpoint `POST /api/transcriptor/chunk` — recibe audio como base64, devuelve transcripción

### Interface en el dashboard

- **Modo "transcripción activa"** en el área de mensaje: micrófono activo + textarea editable simultáneamente
- El texto de voz aparece en gris mientras llega, se confirma en negro al procesarse
- La escritura manual siempre en negro, inmediata

### Historial propio

- Las transcripciones se guardan en `servidor/data/transcripciones/<id>.json` con: texto, audio original (opcional), timestamps por frase, proyecto_id
- Independiente de las conversaciones con IAs — es el diario de voz/escritura del usuario

## Criterios de terminado (DoD)

- [ ] Dictar una frase → aparece transcrita en el dashboard en < 5s (latencia aceptable)
- [ ] Mezcla: dictar un párrafo, escribir una corrección a mano, dictar otro párrafo → el texto final es coherente
- [ ] El historial de transcripciones es visible y navegable en el dashboard
- [ ] Funciona completamente offline (sin internet)
- [ ] Commit `feat(e5-transcriptor): transcriptor local con mezcla voz+escritura`
- [ ] Tag `v5.1.0-transcriptor`

## Notas para el agente

- **Whisper.cpp necesita compilación para cada OS.** Incluir los binarios precompilados en el paquete de instalación. No pedir al usuario que compile. ~20MB por OS.
- **El audio NO se sube a ningún servidor externo.** Documentarlo explícitamente en la política de privacidad y en el README. Es un punto de venta fuerte frente a competidores cloud.
- **La latencia de 2-5s para transcripción en tiempo real puede ser molesta.** La UI debe mostrar claramente que "está procesando" con una animación. No hacer que el usuario piense que el micro no funciona.

## Preguntas abiertas

- **¿Edición del audio?** Si el usuario quiere borrar un fragmento de audio y retranscribirlo. Complejo. **Propuesta:** no en etapa 5.
- **¿Soporte multiidioma?** Whisper soporta >90 idiomas. Configurar idioma en las opciones del transcriptor. **Propuesta:** español + inglés como defaults configurables.
