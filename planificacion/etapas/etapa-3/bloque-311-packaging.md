# Bloque 3.11 — Packaging release etapa 3

**Etiqueta:** `e3-packaging`
**Tag de git:** `v3.11.0-packaging`
**Estado:** 💭 plan
**Depende de:** 3.10

## Objetivo en una línea

Actualizar los instaladores de etapa 2 para incluir las nuevas capacidades (WebSocket, PWA móvil, cola multi-IA), publicar el release `v3.11.0` en GitHub y actualizar la documentación.

## Narrativa — por qué este bloque existe

Etapa 2 tuvo su propio packaging (2.12). Etapa 3 añade complejidad técnica visible para el usuario: hay que aceptar un certificado TLS, acceder por IP desde el móvil, tener Claude Code instalado para la cola. Sin documentación clara, estos pasos rompen la experiencia de "doble clic y funciona".

Este bloque no construye funcionalidad nueva — convierte la funcionalidad de etapa 3 en algo que un usuario no técnico puede usar.

## Qué ha cambiado respecto a etapa 2

- **Nuevo prerrequisito:** `mkcert` para el certificado TLS (o se instala con el instalador)
- **Nuevo prerrequisito opcional:** Claude Code CLI (`npm install -g @anthropic-ai/claude-code`) para la cola
- **Acceso móvil:** el usuario necesita saber su IP local (el dashboard la muestra ahora)
- **Nuevas permisos de la extensión Chrome:** ninguno nuevo en etapa 3, pero actualizar la descripción

## Qué hay que construir

### Actualizar scripts de instalación

- **`packaging/windows/build.sh`:** incluir `mkcert.exe` en el bundle
- **`packaging/windows/installer.nsi`:** añadir paso de instalación de `mkcert` + generación de cert
- **`packaging/macos/build.sh`:** idem con `brew install mkcert` o binario incluido
- **Todos:** añadir step de "instalar Claude Code CLI (opcional)" con prompt sí/no

### Documentación actualizada

- **`INSTALL.md`:** secciones nuevas:
  - "Acceso desde móvil" — paso a paso con screenshots
  - "Cola multi-IA (requiere Claude Code)" — cómo instalar Claude Code, cómo crear tareas
  - "Certificado TLS — qué hacer si el navegador avisa"
- **`FAQ.md`:** nuevas entradas:
  - "¿Por qué el móvil me pide aceptar un certificado?"
  - "¿Qué es Claude Code y necesito instalarlo?"
  - "La cola dice 'claude CLI no encontrado'"
  - "¿Funciona con ChatGPT la cola?" (respuesta: aún no)

### Actualización de la extensión de Chrome

- Versión bump en `manifest.json`
- Actualizar descripción en la Chrome Web Store mencionando sincronización móvil
- Subir a la Web Store (revisión 1-3 días hábiles)

### QR code en el dashboard

- El dashboard de PC muestra un QR con la URL `wss://192.168.X.X:3333` para facilitar el primer acceso desde el móvil
- Librería: `qrcode` (npm, ~100KB)

### Release en GitHub

- Tag `v3.11.0-packaging` como release formal
- Assets por OS (actualización de los de etapa 2)
- Release notes: qué incluye etapa 3, cómo activar las nuevas features

## Archivos afectados

- `packaging/windows/build.sh` — actualizar
- `packaging/windows/installer.nsi` — actualizar
- `packaging/macos/build.sh` — actualizar
- `packaging/linux/build.sh` — actualizar
- `INSTALL.md` — actualizar con nuevas secciones
- `FAQ.md` — actualizar con nuevas entradas
- `extension/manifest.json` — version bump
- `dashboard/components/qr-movil.js` — nuevo
- `servidor/package.json` — añadir `qrcode`

## Criterios de terminado (DoD)

- [ ] Instalador de Windows incluye `mkcert` y genera el certificado automáticamente
- [ ] La sección "Acceso desde móvil" de `INSTALL.md` es comprensible para un usuario no técnico (prueba con alguien ajeno al proyecto)
- [ ] QR code visible en el dashboard apunta a la URL correcta de la red local
- [ ] Release `v3.11.0` en GitHub con assets actualizados
- [ ] Extensión actualizada en Chrome Web Store (o en revisión)
- [ ] FAQ responde las preguntas sobre certificado y Claude Code CLI
- [ ] Etiqueta `etapa-3-done` aplicada al tag
- [ ] Commit `feat(e3-packaging): release etapa 3, móvil + cola, instaladores actualizados`
- [ ] Tag `v3.11.0-packaging`

## Notas para el agente

- **El certificado TLS es el punto de fricción más grande de etapa 3.** El navegador del móvil va a mostrar un aviso rojo la primera vez. Es inevitable con certificados autofirmados. La documentación tiene que ser muy clara: "esto es normal, haz exactamente estos pasos".
- **`mkcert` en el instalador de Windows.** La opción más limpia es incluir el binario `mkcert.exe` en el paquete (es un ejecutable estático de ~5MB) y ejecutarlo desde el script de instalación. No depender de `winget` o internet durante la instalación.
- **La cola multi-IA es "opcional" para el usuario no técnico.** No todos usarán Claude Code. El INSTALL.md lo presenta como feature avanzada con su propia sección, no bloqueante.

## Preguntas abiertas

- **¿Auto-actualización para etapa 3?** Ya se pospuso en 2.12. Con WebSocket ya instalado, se podría añadir un canal de notificación de actualizaciones. **Propuesta:** planificar en etapa 4.
- **¿Precio del paquete de pago en etapa 3?** El paquete de etapa 2 incluía instaladores + guía. El de etapa 3 añade guía de cola multi-IA. **Propuesta:** misma estrategia, mismo archivo + guía actualizada. Coordinar con Comercial.
