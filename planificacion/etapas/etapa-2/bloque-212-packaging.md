# Bloque 2.12 — Packaging y primer release público

**Etiqueta:** `e2-packaging`
**Tag de git:** `v2.12.0-packaging`
**Estado:** 💭 plan
**Depende de:** 2.11

## Objetivo en una línea

Convertir el proyecto en algo que un usuario no técnico pueda descargar, instalar con un clic y usar, y publicar el primer release en GitHub junto con la versión de pago.

## Narrativa — por qué este bloque existe

Hasta este punto, el proyecto está dirigido a alguien que sepa clonar un repo, instalar Node y ejecutar comandos. Ese público es el que contribuye a GitHub y aprende del proyecto. Pero el producto también se vende a quien no quiere pasar por todo eso. Ese usuario necesita "descargar → doble clic → funciona". Este bloque es el puente.

Además, es el primer release público. Cierre oficial de etapa 2 visible al mundo. Tiene que estar pulido.

## Decisiones técnicas

- **Instalador por OS.** Razón: cada OS tiene sus expectativas y no hay un formato universal aceptable sin Electron.
  - **Windows:** instalador con NSIS (script simple) o script `.exe` autoextraíble. Incluye Node portátil, o requiere Node instalado y muestra instrucciones si no lo está.
  - **macOS:** `.pkg` o `.dmg` con las instrucciones. Requiere Node.
  - **Linux:** tarball con script `install.sh` que usa `apt`/`dnf`/`pacman` para Node si hace falta.
- **Node portátil para Windows.** Razón: el 80% de usuarios Windows no tienen Node instalado. Bundlearlo elimina una fricción enorme. ~40MB más, aceptable.
- **Extensión de Chrome firmada en Chrome Web Store.** Razón: para usuarios no desarrolladores, cargar una extensión unpacked es imposible. La Web Store cobra $5 de alta, es una sola vez. Publicar oficialmente.
- **Release en GitHub Releases con assets por OS.** Razón: GitHub es donde la gente va a descargar. Releases es la forma estándar.
- **Dos releases paralelos:** el código libre (repo) y el paquete de pago (Gumroad o similar, pendiente de Comercial). Razón: los usuarios técnicos compilan desde código, los no técnicos compran el paquete.

## Qué hay que construir

### Scripts de empaquetado

```
packaging/
├── windows/
│   ├── build.sh             # empaqueta servidor + dashboard + extensión + node portátil
│   └── installer.nsi        # script NSIS (si se usa)
├── macos/
│   └── build.sh             # genera .pkg
├── linux/
│   ├── build.sh             # genera tarball
│   └── install.sh           # instalador interactivo
└── assets/
    ├── icono.ico
    ├── icono.icns
    └── icono.png
```

### Iconos definitivos

Sustituir los placeholders de la extensión y del dashboard. Iconos que encajen con la identidad de Utipy (consultar con el Diseñador Web o Lore).

### Documentación de instalación

- **`INSTALL.md`** en la raíz del repo con pasos detallados por OS
- **`FAQ.md`** con problemas comunes
- **Vídeo de 2 minutos de onboarding** (opcional pero recomendado)

### Publicación de la extensión

- Registro en Chrome Web Store ($5 una sola vez)
- Screenshots y descripción listos
- Política de privacidad (obligatoria en la Store) — dejar claro que la extensión solo habla con `localhost`

### Release en GitHub

- Crear `v2.12.0-packaging` como release formal (no solo tag)
- Adjuntar los artefactos compilados por OS
- Release notes con lo que incluye etapa 2

### Paquete de pago

- Pendiente de trabajar con Comercial. El ZIP del instalador + guía premium + soporte por email.

## Archivos afectados

- `packaging/**` — nuevo
- `INSTALL.md` — nuevo
- `FAQ.md` — nuevo
- Iconos en `extension/icons/` y `dashboard/assets/` — sustituidos
- `README.md` — actualizar con enlaces a los releases

## Criterios de terminado (DoD)

- [ ] Instalador de Windows probado en máquina limpia (sin Node instalado)
- [ ] Instalador de macOS probado si hay hardware disponible (si no, marcar "beta" y pedir testers)
- [ ] Instalador de Linux probado en Ubuntu
- [ ] Extensión publicada en Chrome Web Store (o en revisión)
- [ ] Release `v2.12.0` en GitHub con assets
- [ ] Iconos definitivos en su sitio
- [ ] `INSTALL.md` y `FAQ.md` escritos
- [ ] Sesión con Comercial para alinear el paquete de pago con el release
- [ ] Etiqueta `etapa-2-done` aplicada tras cierre
- [ ] Commit `feat(e2-packaging): primer release público, instaladores por OS, extensión en Web Store`
- [ ] Tag `v2.12.0-packaging`

## Cómo usarlo

**Usuario no técnico:**
1. Entra a `github.com/Utipy-dev/dashboard-ia/releases`
2. Descarga el instalador de su OS
3. Doble clic → instala
4. Instala la extensión desde la Chrome Web Store
5. Abre Dashboard IA desde el menú inicio / Launchpad
6. Primer wizard guía para conectar su primera IA

**Usuario técnico:**
1. `git clone`
2. `cd servidor && npm install && npm start`
3. Abre `localhost:3333`
4. Carga la extensión desde `chrome://extensions` en modo desarrollador
5. Configura IAs y usa

## Notas para el agente

- **El $5 de la Chrome Web Store es un gasto real.** Avisar a Arturo antes de pagar.
- **La política de privacidad de la extensión es obligatoria.** Es breve: no recogemos datos, todo es local, la única comunicación externa es con el servidor local del usuario.
- **Los instaladores pueden tener virus falsos positivos.** Windows SmartScreen avisa de ejecutables no firmados. Si se pide firma de código, eso son ~300€/año. *Recomendación:* no firmar en etapa 2, documentar en FAQ cómo aceptar el warning, y firmar en etapa 3 o 4 cuando el producto tenga ingresos.
- **Al terminar este bloque, la etapa 2 está formalmente publicada.** Hacerlo bien vale más que hacerlo rápido.

## Preguntas abiertas

- **¿Nombre del instalador para la versión gratuita vs la de pago?** Pueden ser el mismo archivo, con la diferencia en la "guía premium" aparte. O binarios distintos. **Propuesta:** mismo archivo + guía aparte. Simplifica mantenimiento.
- **¿Auto-actualización?** Que el instalador compruebe si hay versión nueva. Útil pero complejo. **Propuesta:** posponer a etapa 3 o 4.
