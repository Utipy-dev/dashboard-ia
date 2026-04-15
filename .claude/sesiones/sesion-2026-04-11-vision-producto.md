# Sesión 2026-04-11 — Visión de producto y rediseño de etapas

## Contexto
Arturo revisó la integración con Whisper que había pedido y constató que no la usaba. Eso abrió una conversación más amplia sobre la dirección del producto.

## Decisiones tomadas

### Transcripción
- **Whisper local descartado del código.** Razón: latencia inaceptable en uso real. Arturo sigue usando el transcriptor de Claude directamente. Whisper queda solo como opción en la guía (sección "privacidad máxima").
- **Web Speech API descartada.** Razón: añade Google como actor externo. El principio que Arturo estableció es minimizar el número de actores que tienen acceso a los datos. Si el usuario ya trabaja en una nube (Claude, ChatGPT...), lo ideal es que la transcripción también quede ahí.
- **Transcriptor propio movido a etapas 4-5.** Problema concreto que debe resolver: el transcriptor de Claude pierde la primera palabra, desaparece si hay texto o imagen en el campo, y no permite alternar voz/escritura. El objetivo es un campo de voz independiente del texto.

### Arquitectura
- **Todo el desarrollo de etapa 2 en adelante: localhost.** No HTML puro.
- **Arquitectura cloud: pendiente de catalogar casos de uso.** Hay demasiadas variantes (móvil sin ordenador encendido, Claude Code vs. chat simple, extensión de Chrome vs. app local) para decidir ahora. Se catalogarán antes de diseñar.

### Nueva funcionalidad en etapa 2
- **Captura desde interfaz de IA.** El usuario tiene sesión abierta en su IA habitual. El dashboard captura el texto antes de que se envíe y lo acumula con contexto (tema, etiqueta, timestamp). El mensaje se envía igualmente — es automatizar el Ctrl+X/Ctrl+V que el usuario ya hacía. Éticamente limpio porque: (a) el usuario usa su propia cuenta, (b) el mensaje llega a la IA de todas formas, (c) el consumo de recursos es idéntico.
- **Configurable por IA.** Cada usuario configura qué interfaz usa (Claude, ChatGPT, Gemini...).
- **Envío programado.** Cronómetro opcional por mensaje. Caso de uso principal: enviar un mensaje de "reserva de sesión" a una hora determinada. El usuario llega con la sesión ya activa y con tiempo limpio por delante, en lugar de perder tiempo de sesión mientras no está.

### Modelo de producto
- **Guía técnica**: cómo montar el dashboard. Sección genérica + sección "privacidad máxima" (Whisper local). Siempre con opción gratuita de hacerlo uno mismo.
- **Código etapa 2** (localhost): ~2€
- **Código etapas 2+3** (localhost + móvil): ~4€
- Posible doble versión: local y extensión de Chrome
- Dónde publicar: pendiente decidir con Director y Comercial

## Razonamiento clave
El argumento de privacidad de Arturo es: cuantos menos actores tengan acceso a los datos, mejor. No es privacidad absoluta (offline), sino privacidad relativa (no multiplicar los actores). Eso descarta Web Speech API y justifica la captura desde la interfaz de la IA que el usuario ya usa.
