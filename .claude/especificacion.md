# Dashboard IA — Especificación completa
*Fuente de verdad para implementación*

---

## 1. QUÉ RESUELVE

Cuando los tokens de una IA se agotan o la sesión se corta, las ideas se pierden o hay que esperar sin avanzar. Este dashboard permite acumular ideas dictadas, mensajes preparados y temas pendientes mientras se espera, para copiar y pegar cuando la sesión se renueve.

**Usuario:** Arturo. Técnico medio. Trabaja desde ordenador y móvil. Usa Claude principalmente, puede usar otras IAs. Usa OpenWhispr para dictar en ordenador.

---

## 2. JERARQUÍA DE DATOS

```
IA
└── Proyecto
    └── Conversación
        │   nombre
        │   descripción (colapsable)
        │   fecha último mensaje
        │   estado: esperando tokens | activa | zanjada
        └── Tema
            │   nombre
            │   ☐ zanjado (idea terminada de desarrollar)
            │   ☐ enviado (ya copiado y pegado en la IA)
            └── Transcripción
                    texto acumulado
                    fecha y hora
                    etiqueta del tema
                    origen: dictado | pegado manual | audio subido
```

Los dos checks del tema son **independientes**:
- Zanjado ≠ Enviado. Un tema puede estar zanjado pero pendiente de enviar, o enviado pero con más contenido por añadir.

---

## 3. ESTRUCTURA DE CARPETAS DEL PRODUCTO

```
dashboard/
├── index.html
├── app.js
├── styles.css
├── data/
│   ├── ias.json
│   ├── proyectos.json
│   ├── conversaciones.json
│   └── transcripciones.json
├── storage/
│   └── storage.js        ← toda la lógica de lectura/escritura
├── components/
│   ├── ia-card.js
│   ├── proyecto-card.js
│   ├── conversacion-card.js
│   └── tema-item.js
└── tutorial/
    └── index.html
```

---

## 4. DISEÑO VISUAL

**Estilo:** Notion. Limpio, sin adornos, foco en contenido.

### Vista principal
- Selector de IA en cabecera con cronómetro de renovación en tiempo real
- Por IA: lista de proyectos con color personalizable (paleta de 8 colores)
- Por proyecto: tarjetas de conversaciones con temas y checks inline
- "Sin proyecto" como cajón de conversaciones sin asignar

### Vista de conversación
- Se expande inline al hacer clic (estilo Notion)
- Botón para abrir a pantalla completa
- Lista de temas con sus dos checks independientes
- Área de transcripción acumulada con timestamps
- Acciones: copiar todo | dictar | añadir texto

---

## 5. CRONÓMETRO DE RENOVACIÓN

- Configurado manualmente por el usuario (no hay integración automática con las IAs)
- Visible siempre en cabecera de cada sección de IA
- Cambia de color cuando queda poco tiempo
- Notificación cuando llega a cero

**Ciclos preconfigurados (editables):**
| IA | Ciclo orientativo |
|----|-------------------|
| Claude Pro | ~8 horas |
| ChatGPT Plus | ~3 horas |
| Gemini | variable |
| Personalizado | el usuario define |

---

## 6. TRANSCRIPCIÓN EN ORDENADOR

OpenWhispr funciona a nivel de sistema operativo — el texto cae donde esté el cursor.
**El dashboard no gestiona la transcripción.** El usuario pone el cursor en el área activa y dicta. El dashboard organiza el resultado.

Cada fragmento añadido queda registrado con hora y etiqueta del tema activo.
El usuario puede editar cualquier fragmento.
El botón "copiar todo" prepara texto limpio, sin metadatos.

---

## 7. TRANSCRIPCIÓN EN MÓVIL

### Modo A — Transcribir ahora
- Motor de voz del sistema operativo del móvil
- Texto en tiempo real, editable encima
- Audio no se guarda — solo el texto final
- Trade-off: audio pasa momentáneamente por servidores de Google/Apple (algunos móviles tienen motor offline descargable)
- **Pendiente explorar:** qué motor tiene el móvil de Arturo antes de construir

### Modo B — Transcribir después
- Graba audio, lo asocia a conversación y tema, lo guarda localmente en el móvil
- Al llegar a casa con WiFi y ordenador encendido: sincronización automática
- El ordenador procesa con Whisper → texto aparece en dashboard ya etiquetado
- 100% privado

---

## 8. LIMITACIÓN DOCUMENTADA (en el tutorial)

El servidor local requiere el ordenador encendido en la misma red WiFi.

**Workaround offline:** el móvil puede consultar el dashboard en modo offline, ver mensajes preparados, copiar y pegar en la IA manualmente. Actúa como bloc de notas offline.

**Evolución futura (mencionada en tutorial, sin prometer):**
- Raspberry Pi o mini PC siempre encendido en casa
- Versión hosteada con privacidad fuerte

---

## 9. TUTORIAL — filosofía

**Lo que Utipy explica:** montar el dashboard, conectar con OpenWhispr, estructurar conversaciones, flujo completo, limitaciones honestas.

**Lo que Utipy delega con enlace externo:** instalación de OpenWhispr, Node/Python, motor de voz offline del móvil.

**Etapas paralelas al desarrollo:**
1. Solo ordenador, sin servidor, transcripción del navegador como fallback
2. Servidor local con Whisper
3. Conectar móvil por WiFi
4. PWA offline con sincronización

---

## 10. VISIÓN FUTURA (apuntada, no prioritaria)

- Envío directo a Claude por API (sin copiar y pegar)
- Conectores para otras IAs como plugins (contribución de comunidad)
- Contactar OpenWhispr cuando haya esqueleto real — propuesta de visibilidad mutua honesta, no antes
- Arquitectura zero-knowledge si hay tracción
- Versión empaquetada de pago (barata) para quien no quiere gestionar GitHub
