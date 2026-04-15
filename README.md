# Dashboard IA

> Escribe sin interrupciones. Dashboard local para orquestar conversaciones con IAs y gestionar los límites por ti.

**Estado:** etapa 1 funcional · planificación de etapas 2-5 en curso.

---

## Qué es esto

Dashboard IA es una herramienta local que resuelve un problema concreto de quien trabaja con IAs cada día: perder tiempo de sesión y tokens mientras estructuras tus ideas. En lugar de escribir contra el cronómetro, escribes tranquilo en el dashboard, acumulas mensajes con contexto, y la app los envía cuando tú decidas — o programados, para que cuando llegues a tu IA ya tengas la sesión lista y con tiempo limpio por delante.

No es un cliente de chat. Es un orquestador.

## Cómo se construye

Este repo se publica como **narrativa de progreso**: cada etapa muestra cómo se fue pensando y resolviendo el problema, no solo el resultado. Si eres de los que disfrutan ver el proceso, esa es la parte interesante.

- **Etapa 1** — HTML/CSS/JS vanilla en local. Cero servidor. Funciona abriendo un archivo en Chrome. *Estado: completada.*
- **Etapa 2** — Servidor local en Node.js. Captura de texto desde la interfaz de tu IA, envío programado, soporte de documentos. *Estado: en planificación.*
- **Etapa 3** — Sincronización con móvil por WiFi. Cola de tareas multi-IA ejecutable en segundo plano. *Estado: en planificación.*
- **Etapas 4-5** — Extensión de Chrome dedicada y app de escritorio. Transcriptor integrado. *Estado: esquema inicial.*

Cada etapa se divide en **bloques**. Cada bloque terminado queda etiquetado con un tag de git, lo que te permite volver a cualquier estado funcional en cualquier momento sin reconstruirlo a mano.

## Cómo leer este repo

Si llegas nuevo:

1. `CLAUDE.md` — contexto general
2. `operaciones/estado.md` — fase actual y próximo paso
3. `planificacion/onboarding-agente.md` — orden de lectura completo
4. `planificacion/etapas/` — los bloques por etapa

Si eres un agente automatizado (Claude Code, Cursor, etc.), empieza por `planificacion/onboarding-agente.md`. Está escrito específicamente para que puedas continuar el trabajo sin replanificar.

## Cómo usarlo

Ahora mismo, etapa 1:

1. Clona el repo
2. Abre `dashboard/index.html` en Chrome
3. Selecciona la carpeta donde quieras guardar tus datos
4. Listo

No hay instalación, no hay cuentas, no hay nube. Todo queda en tu máquina.

## Filosofía

Este proyecto forma parte de [Utipy](https://utipy.com). La filosofía de la marca resume el espíritu:

> Nuestro objetivo es que no nos necesites.

Por eso todo el código está abierto bajo MIT. Si sabes montártelo, adelante — la guía completa está publicada. Si prefieres un paquete listo para usar, con instalador, extensión firmada y soporte de configuración, hay una versión empaquetada de pago. Ambas llegan al mismo sitio.

## Contribuir

Todavía no estamos aceptando PRs: el proyecto está en fase de planificación activa y cambian cosas cada semana. Cuando llegue el momento, se abrirá. Mientras tanto, [issues](https://github.com/Utipy-dev/dashboard-ia/issues) con ideas, casos de uso o preguntas son bienvenidos.

## Licencia

MIT — ver [LICENSE](LICENSE).
