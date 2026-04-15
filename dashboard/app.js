// app.js — Punto de entrada. Orquesta storage y componentes.

(function () {
  'use strict';

  let _state = {
    ias: [],
    proyectos: [],
    conversaciones: [],
    mensajes: [],
    iaActivaId: null,
    cronometros: {},
    filtros: {},          // { [convId]: temaId | null }
    modoJuntar: {},       // { [convId]: boolean }
    panelConvId: null,
    borradorTexto: {},    // { [convId]: string } — persiste al cambiar de panel
    borradorImagenes: {},   // { [convId]: [{nombre, data}] }
    juntarSeleccion: {},    // { [convId]: [mensajeId, ...] } — orden de selección
  };

  let _envioImagenes = []; // Imágenes del modal "Preparar envío"

  // ── Init ───────────────────────────────────────────────────────────────────
  async function init() {
    document.getElementById('btn-abrir-datos').addEventListener('click', abrirCarpeta);
    try {
      const restaurado = await Storage.intentarRestauraHandle();
      if (restaurado) { await cargarDatos(); renderApp(); }
    } catch (e) { /* sin carpeta guardada, el usuario usa el botón */ }
  }

  async function abrirCarpeta() {
    try {
      await Storage.init();
      await cargarDatos();
      renderApp();
    } catch (err) {
      if (err.name !== 'AbortError') { alert('Error: ' + err.message); console.error(err); }
    }
  }

  async function cargarDatos() {
    _state.ias            = await Storage.getIAs();
    _state.proyectos      = await Storage.getProyectos();
    _state.conversaciones = await Storage.getConversaciones();
    _state.mensajes       = await Storage.getTranscripciones();
    _state.iaActivaId     = _state.ias[0]?.id ?? null;
    window._mensajesGlobal = _state.mensajes;
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  function renderApp() {
    document.getElementById('main').hidden = false;
    renderTabs();
    renderGaleria();
  }

  function renderTabs() {
    const contenedor = document.getElementById('ia-tabs');
    contenedor.innerHTML = _state.ias.length === 0
      ? '<span style="color:var(--txt-dim);font-size:13px">Sin IAs —</span>'
      : _state.ias.map(ia => IaCard.renderTab(ia, ia.id === _state.iaActivaId)).join('');
    contenedor.innerHTML += `<button class="btn-texto" onclick="App.nuevaIA()" style="white-space:nowrap">+ Añadir IA</button>`;
    iniciarCronometros();
  }

  function renderGaleria() {
    const contenedor = document.getElementById('ia-content');
    const ia = _state.ias.find(i => i.id === _state.iaActivaId);
    if (!ia) {
      contenedor.innerHTML = `<div class="estado-vacio"><p>Añade una IA para empezar.</p>
        <button class="btn-primary" onclick="App.nuevaIA()">+ Añadir IA</button></div>`;
      return;
    }
    const proyectosDeIA = _state.proyectos
      .filter(p => p.ia_id === ia.id)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    const sinProyecto = { id: '__sin_proyecto__', ia_id: ia.id, nombre: 'Sin proyecto', color: '#9B9A97' };

    contenedor.innerHTML = `
      <div class="galeria-toolbar">
        <button class="btn-texto" onclick="App.nuevoProyecto('${ia.id}')">+ Nuevo proyecto</button>
      </div>
      ${[...proyectosDeIA, sinProyecto].map(p => ProyectoCard.render(p, _state.conversaciones)).join('')}
    `;
  }

  // ── Panel de conversación ──────────────────────────────────────────────────
  function abrirPanel(convId) {
    // Guardar borrador del panel actual antes de cambiar
    _guardarBorradorPanel();

    _state.panelConvId = convId;
    _renderPanel(convId);

    document.getElementById('panel-conversacion').hidden = false;
    document.getElementById('panel-galeria').classList.add('tiene-panel');

    // Restaurar borrador si existe
    _restaurarBorradorPanel(convId);
  }

  function _renderPanel(convId) {
    const conv      = _state.conversaciones.find(c => c.id === convId);
    const msgs      = _state.mensajes.filter(m => m.conversacion_id === convId);
    const filtro    = _state.filtros[convId] || null;
    const juntar    = _state.modoJuntar[convId] || false;
    const juntarSel = _state.juntarSeleccion[convId] || [];
    document.getElementById('panel-conv-contenido').innerHTML =
      ConversacionCard.renderDetalle(conv, msgs, filtro, juntar, _state.proyectos, juntarSel);
  }

  function cerrarPanel() {
    _guardarBorradorPanel();
    _state.panelConvId = null;
    document.getElementById('panel-conversacion').hidden = true;
    document.getElementById('panel-galeria').classList.remove('tiene-panel');
  }

  // Guarda el texto del textarea antes de cambiar de panel
  function _guardarBorradorPanel() {
    const convId = _state.panelConvId;
    if (!convId) return;
    const ta = document.getElementById(`textarea-${convId}`);
    if (ta) _state.borradorTexto[convId] = ta.value;
  }

  // Restaura el texto guardado en el textarea
  function _restaurarBorradorPanel(convId) {
    const texto = _state.borradorTexto[convId];
    const ta = document.getElementById(`textarea-${convId}`);
    if (ta && texto) ta.value = texto;

    // Restaurar preview de imágenes
    const imgs = _state.borradorImagenes[convId];
    if (imgs?.length) _mostrarPreviewImagenes(convId, imgs);

    // Attach paste listener (idempotente)
    _attachPasteListener(convId);
  }

  // ── Cronómetros ────────────────────────────────────────────────────────────
  function iniciarCronometros() {
    Object.values(_state.cronometros).forEach(c => clearInterval(c.intervalo));
    _state.cronometros = {};
    _state.ias.forEach(ia => {
      if (!ia.ciclo_horas) return;
      const totalSeg = ia.ciclo_horas * 3600;
      const inicio   = ia.cronometro_inicio ? new Date(ia.cronometro_inicio).getTime() : Date.now();
      const tick = () => {
        const restantes = Math.max(0, totalSeg - Math.floor((Date.now() - inicio) / 1000));
        IaCard.actualizarCronometro(ia.id, restantes);
        if (restantes === 0) {
          clearInterval(_state.cronometros[ia.id]?.intervalo);
          if (Notification.permission === 'granted')
            new Notification(`${ia.nombre} — Tokens renovados`, { body: 'El ciclo ha terminado.' });
        }
      };
      tick();
      _state.cronometros[ia.id] = { intervalo: setInterval(tick, 1000) };
    });
  }

  async function reiniciarCronometro(iaId) {
    const ia = _state.ias.find(i => i.id === iaId);
    if (!ia) return;
    ia.cronometro_inicio = new Date().toISOString();
    await Storage.saveIAs(_state.ias);
    iniciarCronometros();
  }

  function abrirEditorCronometro(iaId) {
    const ia = _state.ias.find(i => i.id === iaId);
    if (!ia) return;

    // Calcular hora actual de fin del ciclo para mostrarla como valor por defecto
    const inicio = ia.cronometro_inicio ? new Date(ia.cronometro_inicio).getTime() : Date.now();
    const finActual = new Date(inicio + ia.ciclo_horas * 3600000);
    const hh = String(finActual.getHours()).padStart(2, '0');
    const mm = String(finActual.getMinutes()).padStart(2, '0');

    // Crear modal inline
    const overlay = document.createElement('div');
    overlay.className = 'cronometro-overlay';
    overlay.innerHTML = `
      <div class="cronometro-modal">
        <h3>Ajustar cronómetro — ${ia.nombre}</h3>
        <label class="cronometro-modal__label">Ciclo (horas)
          <input type="number" id="cron-ciclo-input" value="${ia.ciclo_horas}" min="1" max="48" step="0.5" class="cron-ciclo-input">
        </label>
        <label class="cronometro-modal__label">¿A qué hora se renuevan los tokens?
          <input type="time" id="cron-hora-input" value="${hh}:${mm}" class="cron-hora-input">
        </label>
        <div class="cronometro-modal__acciones">
          <button class="btn-primary" onclick="App._guardarHoraCronometro('${iaId}')">Guardar</button>
          <button class="btn-texto" onclick="App._cerrarEditorCronometro()">Cancelar</button>
          <button class="btn-texto" onclick="App._reiniciarAhora('${iaId}')">Reiniciar ahora</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('cron-hora-input').focus();
  }

  async function _guardarHoraCronometro(iaId) {
    const input = document.getElementById('cron-hora-input');
    if (!input) return;
    const [hh, mm] = input.value.split(':').map(Number);
    const ia = _state.ias.find(i => i.id === iaId);
    if (!ia) return;

    const cicloInput = document.getElementById('cron-ciclo-input');
    const nuevoCiclo = parseFloat(cicloInput?.value);
    if (!isNaN(nuevoCiclo) && nuevoCiclo > 0) ia.ciclo_horas = nuevoCiclo;

    // Calcular cuándo es esa hora hoy (o mañana si ya pasó)
    const ahora = new Date();
    const objetivo = new Date();
    objetivo.setHours(hh, mm, 0, 0);
    if (objetivo <= ahora) objetivo.setDate(objetivo.getDate() + 1); // mañana

    // El inicio del ciclo = objetivo - ciclo_horas
    const inicioMs = objetivo.getTime() - ia.ciclo_horas * 3600000;
    ia.cronometro_inicio = new Date(inicioMs).toISOString();

    await Storage.saveIAs(_state.ias);
    iniciarCronometros();
    _cerrarEditorCronometro();
  }

  async function _reiniciarAhora(iaId) {
    const ia = _state.ias.find(i => i.id === iaId);
    if (ia) {
      const cicloInput = document.getElementById('cron-ciclo-input');
      const nuevoCiclo = parseFloat(cicloInput?.value);
      if (!isNaN(nuevoCiclo) && nuevoCiclo > 0) ia.ciclo_horas = nuevoCiclo;
    }
    await reiniciarCronometro(iaId);
    _cerrarEditorCronometro();
  }

  function _cerrarEditorCronometro() {
    document.querySelector('.cronometro-overlay')?.remove();
  }

  // ── IAs ────────────────────────────────────────────────────────────────────
  async function nuevaIA() {
    const nombre = prompt('Nombre de la IA (ej: Claude, ChatGPT):');
    if (!nombre?.trim()) return;
    const ciclo = parseFloat(prompt('Ciclo de renovación en horas (ej: 8):') || '8');
    const ia = {
      id: Storage.nuevoId('ia'), nombre: nombre.trim(),
      ciclo_horas: isNaN(ciclo) ? 8 : ciclo,
      cronometro_inicio: new Date().toISOString(),
    };
    _state.ias.push(ia);
    _state.iaActivaId = ia.id;
    await Storage.saveIAs(_state.ias);
    renderApp();
  }

  function seleccionarIA(iaId) {
    _state.iaActivaId = iaId;
    cerrarPanel();
    renderTabs();
    renderGaleria();
  }

  // ── Proyectos ──────────────────────────────────────────────────────────────
  async function nuevoProyecto(iaId) {
    const nombre = prompt('Nombre del proyecto:');
    if (!nombre?.trim()) return;
    const proyecto = {
      id: Storage.nuevoId('proj'), ia_id: iaId, nombre: nombre.trim(),
      color: ProyectoCard.colores[_state.proyectos.filter(p => p.ia_id === iaId).length % ProyectoCard.colores.length],
      orden: _state.proyectos.filter(p => p.ia_id === iaId).length,
    };
    _state.proyectos.push(proyecto);
    await Storage.saveProyectos(_state.proyectos);
    renderGaleria();
  }

  async function cambiarColorProyecto(proyectoId, color) {
    const proyecto = _state.proyectos.find(p => p.id === proyectoId);
    if (!proyecto) return;
    proyecto.color = color;
    await Storage.saveProyectos(_state.proyectos);
    renderGaleria();
  }

  // ── Conversaciones ─────────────────────────────────────────────────────────
  async function nuevaConversacion(proyectoId) {
    const nombre = prompt('Nombre del agente o conversación:');
    if (!nombre?.trim()) return;
    const desc = prompt('Descripción breve (opcional):') || '';
    const conv = {
      id: Storage.nuevoId('conv'),
      proyecto_id: proyectoId === '__sin_proyecto__' ? null : proyectoId,
      ia_id: _state.iaActivaId,
      nombre: nombre.trim(), descripcion: desc.trim(),
      estado: 'activa',
      fecha_ultimo_mensaje: new Date().toISOString(),
      temas: [],
    };
    _state.conversaciones.push(conv);
    await Storage.saveConversaciones(_state.conversaciones);
    renderGaleria();
    abrirPanel(conv.id);
  }

  async function renombrarConversacion(convId, nuevoNombre) {
    const nombre = nuevoNombre.trim();
    if (!nombre) return;
    const conv = _state.conversaciones.find(c => c.id === convId);
    if (!conv || conv.nombre === nombre) return;
    conv.nombre = nombre;
    await Storage.saveConversaciones(_state.conversaciones);
    _actualizarMiniCard(convId);
  }

  async function eliminarConversacion(convId) {
    if (!confirm('¿Eliminar esta conversación y todos sus mensajes?')) return;
    _state.conversaciones = _state.conversaciones.filter(c => c.id !== convId);
    _state.mensajes = _state.mensajes.filter(m => m.conversacion_id !== convId);
    window._mensajesGlobal = _state.mensajes;
    await Promise.all([
      Storage.saveConversaciones(_state.conversaciones),
      Storage.saveTranscripciones(_state.mensajes),
    ]);
    cerrarPanel();
    renderGaleria();
  }

  async function cambiarEstadoConv(convId, nuevoEstado) {
    const conv = _state.conversaciones.find(c => c.id === convId);
    if (!conv) return;
    conv.estado = nuevoEstado;
    await Storage.saveConversaciones(_state.conversaciones);
    _actualizarMiniCard(convId);
  }

  // ── Etiquetas ──────────────────────────────────────────────────────────────
  async function nuevaEtiqueta(convId) {
    const nombre = prompt('Nombre de la etiqueta:');
    if (!nombre?.trim()) return;
    const conv = _state.conversaciones.find(c => c.id === convId);
    if (!conv) return;
    conv.temas = conv.temas || [];
    const color = ConversacionCard.coloresEtiqueta[conv.temas.length % ConversacionCard.coloresEtiqueta.length];
    conv.temas.push({ id: Storage.nuevoId('tema'), nombre: nombre.trim(), color, zanjado: false });
    await Storage.saveConversaciones(_state.conversaciones);
    _refrescarPanel(convId);
  }

  async function cambiarColorEtiqueta(convId, temaId, color) {
    const conv = _state.conversaciones.find(c => c.id === convId);
    const tema = conv?.temas?.find(t => t.id === temaId);
    if (!tema) return;
    tema.color = color;
    await Storage.saveConversaciones(_state.conversaciones);
    _refrescarPanel(convId);
  }

  async function eliminarEtiqueta(convId, temaId) {
    const conv = _state.conversaciones.find(c => c.id === convId);
    if (!conv) return;
    conv.temas = conv.temas.filter(t => t.id !== temaId);
    await Storage.saveConversaciones(_state.conversaciones);
    _refrescarPanel(convId);
  }

  async function toggleTemaZanjado(convId, temaId, valor) {
    const conv = _state.conversaciones.find(c => c.id === convId);
    const tema = conv?.temas?.find(t => t.id === temaId);
    if (!tema) return;
    tema.zanjado = valor;
    await Storage.saveConversaciones(_state.conversaciones);
    _rerenderListaMensajes(convId);
    _actualizarResumenPanel(convId);
    _actualizarMiniCard(convId);
  }

  async function limpiarZanjados(convId) {
    const conv = _state.conversaciones.find(c => c.id === convId);
    if (!conv) return;
    const temasZanjados = (conv.temas || []).filter(t => t.zanjado);
    if (temasZanjados.length === 0) { alert('No hay temas zanjados.'); return; }
    const ids = new Set(temasZanjados.map(t => t.id));
    const msgsAfectados = _state.mensajes.filter(m => m.conversacion_id === convId && ids.has(m.tema_id)).length;
    if (!confirm(`¿Eliminar ${temasZanjados.length} tema${temasZanjados.length !== 1 ? 's' : ''} zanjado${temasZanjados.length !== 1 ? 's' : ''} y sus ${msgsAfectados} mensaje${msgsAfectados !== 1 ? 's' : ''}?`)) return;

    // Eliminar mensajes y los propios temas
    _state.mensajes = _state.mensajes.filter(m => m.conversacion_id !== convId || !ids.has(m.tema_id));
    conv.temas = conv.temas.filter(t => !t.zanjado);
    window._mensajesGlobal = _state.mensajes;
    await Promise.all([
      Storage.saveTranscripciones(_state.mensajes),
      Storage.saveConversaciones(_state.conversaciones),
    ]);
    _refrescarPanel(convId);
    _actualizarMiniCard(convId);
  }

  async function limpiarEnviados(convId) {
    const msgs = _state.mensajes.filter(m => m.conversacion_id === convId && m.enviado);
    if (msgs.length === 0) { alert('No hay mensajes enviados.'); return; }
    if (!confirm(`¿Eliminar ${msgs.length} mensaje${msgs.length !== 1 ? 's' : ''} marcado${msgs.length !== 1 ? 's' : ''} como enviado?`)) return;
    _state.mensajes = _state.mensajes.filter(m => !(m.conversacion_id === convId && m.enviado));
    window._mensajesGlobal = _state.mensajes;
    await Storage.saveTranscripciones(_state.mensajes);
    _rerenderListaMensajes(convId);
    _actualizarResumenPanel(convId);
    _actualizarMiniCard(convId);
  }

  // ── Cambiar etiqueta de un mensaje ─────────────────────────────────────────
  async function cambiarEtiquetaMensaje(convId, mensajeId, temaId) {
    const m = _state.mensajes.find(m => m.id === mensajeId);
    const conv = _state.conversaciones.find(c => c.id === convId);
    if (!m) return;
    m.tema_id = temaId || null;
    m.tema_nombre = conv?.temas?.find(t => t.id === temaId)?.nombre || null;
    await Storage.saveTranscripciones(_state.mensajes);
    // Actualizar color del select visualmente
    const select = document.querySelector(`[data-mensaje-id="${mensajeId}"] .mensaje-etiqueta-select`);
    const tema = conv?.temas?.find(t => t.id === temaId);
    if (select) select.style.cssText = tema ? `background:${tema.color};color:#fff` : '';
  }

  // ── Mensajes ───────────────────────────────────────────────────────────────
  async function guardarMensaje(convId) {
    const textarea   = document.getElementById(`textarea-${convId}`);
    const selectTema = document.getElementById(`select-tema-${convId}`);
    const texto = textarea?.value.trim();
    const imagenesPendientes = _state.borradorImagenes[convId] || [];

    if (!texto && imagenesPendientes.length === 0) return;

    const conv   = _state.conversaciones.find(c => c.id === convId);
    const temaId = selectTema?.value || null;
    const tema   = conv?.temas?.find(t => t.id === temaId);

    const mensaje = {
      id: Storage.nuevoId('msg'),
      conversacion_id: convId,
      tema_id: temaId || null,
      tema_nombre: tema?.nombre || null,
      texto: texto || '',
      fecha: new Date().toISOString(),
      origen: 'manual',
      enviado: false,
      imagenes: imagenesPendientes,
    };

    _state.mensajes.push(mensaje);
    window._mensajesGlobal = _state.mensajes;

    if (conv) {
      conv.fecha_ultimo_mensaje = mensaje.fecha;
      await Storage.saveConversaciones(_state.conversaciones);
    }
    await Storage.saveTranscripciones(_state.mensajes);

    // Limpiar borrador
    if (textarea) textarea.value = '';
    _state.borradorTexto[convId] = '';
    _state.borradorImagenes[convId] = [];
    const preview = document.getElementById(`preview-imgs-${convId}`);
    if (preview) { preview.innerHTML = ''; preview.style.display = 'none'; }

    _rerenderListaMensajes(convId);
    _actualizarResumenPanel(convId);
    _actualizarMiniCard(convId);
  }

  async function editarMensaje(convId, mensajeId, nuevoTexto) {
    const m = _state.mensajes.find(m => m.id === mensajeId);
    if (!m || m.texto === nuevoTexto) return;
    m.texto = nuevoTexto;
    await Storage.saveTranscripciones(_state.mensajes);
  }

  async function eliminarMensaje(convId, mensajeId) {
    _state.mensajes = _state.mensajes.filter(m => m.id !== mensajeId);
    window._mensajesGlobal = _state.mensajes;
    await Storage.saveTranscripciones(_state.mensajes);
    _rerenderListaMensajes(convId);
    _actualizarResumenPanel(convId);
    _actualizarMiniCard(convId);
  }

  async function toggleMensaje(convId, mensajeId, campo, valor) {
    const m = _state.mensajes.find(m => m.id === mensajeId);
    if (!m) return;
    m[campo] = valor;
    await Storage.saveTranscripciones(_state.mensajes);
    const el = document.querySelector(`[data-mensaje-id="${mensajeId}"]`);
    if (el) el.classList.toggle('mensaje-item--enviado', m.enviado);
    _actualizarResumenPanel(convId);
    _actualizarMiniCard(convId);
  }

  function copiarPendientes(convId) {
    _abrirModalEnvio(convId);
  }

  function _abrirModalEnvio(convId) {
    const msgs = _state.mensajes
      .filter(m => m.conversacion_id === convId && !m.enviado)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const texto = msgs.map(m => m.texto).filter(Boolean).join('\n\n');
    _envioImagenes = msgs.flatMap(m => m.imagenes || []);

    const overlay = document.createElement('div');
    overlay.className = 'preparar-envio-overlay';
    overlay.onclick = e => { if (e.target === overlay) _cerrarModalEnvio(); };

    overlay.innerHTML = `
      <div class="preparar-envio-modal">
        <div class="preparar-envio__header">
          <span class="label-seccion">Preparar envío</span>
          <button class="btn-icono" onclick="App._cerrarModalEnvio()">×</button>
        </div>
        <div class="preparar-envio__seccion">
          <div class="preparar-envio__sec-header">
            <span style="font-size:12px;color:var(--txt-dim)">${msgs.length} mensaje${msgs.length !== 1 ? 's' : ''} pendiente${msgs.length !== 1 ? 's' : ''}</span>
            <button class="btn-primary" style="font-size:12px;padding:4px 10px"
                    id="btn-copiar-texto-envio">Copiar texto</button>
          </div>
          <textarea class="preparar-envio__textarea" readonly onclick="this.select()"></textarea>
        </div>
        ${_envioImagenes.length > 0 ? `
          <div class="preparar-envio__seccion">
            <span style="font-size:12px;color:var(--txt-dim)">${_envioImagenes.length} imagen${_envioImagenes.length !== 1 ? 'es' : ''} — copia y pega una por una</span>
            <div class="preparar-envio__imgs">
              ${_envioImagenes.map((img, i) => `
                <div class="preparar-envio__img-item">
                  <img src="${img.data}" alt="${img.nombre}">
                  <button class="btn-copiar-img" onclick="App.copiarImagenPendiente(${i}, this)">Copiar</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        <div style="display:flex;justify-content:flex-end">
          <button class="btn-texto" onclick="App._cerrarModalEnvio()">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Asignar texto al textarea sin riesgo de inyección HTML
    const ta = overlay.querySelector('.preparar-envio__textarea');
    if (ta) ta.value = texto;

    // Botón copiar texto
    const btnCopiar = overlay.querySelector('#btn-copiar-texto-envio');
    if (btnCopiar) btnCopiar.onclick = () => _copiarTextoEnvio(btnCopiar, texto);
  }

  function _cerrarModalEnvio() {
    document.querySelector('.preparar-envio-overlay')?.remove();
    _envioImagenes = [];
  }

  async function _copiarTextoEnvio(btn, texto) {
    await navigator.clipboard.writeText(texto);
    btn.textContent = '✓ Copiado';
    setTimeout(() => { btn.textContent = 'Copiar texto'; }, 2000);
  }

  async function copiarImagenPendiente(idx, btn) {
    const img = _envioImagenes[idx];
    if (!img) return;
    try {
      const resp = await fetch(img.data);
      const blob = await resp.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
    } catch (e) {
      console.error(e);
      alert('No se pudo copiar la imagen al portapapeles.');
    }
  }

  // ── Copiar mensaje individual ──────────────────────────────────────────────
  function togglePanelImagenes(mensajeId) {
    const panel = document.getElementById(`imgs-panel-${mensajeId}`);
    if (!panel) return;
    const minimizado = panel.classList.toggle('mensaje-item__imgs-panel--minimizado');
    const btn = panel.querySelector('.imgs-panel__toggle');
    if (btn) btn.textContent = minimizado ? '▸' : (panel.querySelectorAll('.mensaje-imagen-wrapper').length ? `▾ ${panel.querySelectorAll('.mensaje-imagen-wrapper').length}` : '▾');
  }

  async function copiarTextoMensaje(mensajeId) {
    const m = _state.mensajes.find(msg => msg.id === mensajeId);
    if (!m) return;
    const btn = document.querySelector(`[onclick="App.copiarTextoMensaje('${mensajeId}')"]`);
    await navigator.clipboard.writeText(m.texto || '');
    if (btn) { btn.textContent = '✓ Copiado'; setTimeout(() => { btn.textContent = 'Copiar texto'; }, 2000); }
  }

  function copiarImagenesMensaje(mensajeId) {
    const m = _state.mensajes.find(msg => msg.id === mensajeId);
    if (!m || !m.imagenes?.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'preparar-envio-overlay';
    overlay.innerHTML = `
      <div class="preparar-envio-modal">
        <div class="preparar-envio__header">
          <label class="copy-imgs-sel-todas">
            <input type="checkbox" id="sel-todas-imgs" checked onchange="App._toggleTodasImgs(this.checked)">
            Todas
          </label>
          <button class="btn-primary" onclick="App._copiarSeleccionCanvas('${mensajeId}', this)">Copiar selección</button>
          <button class="btn-icono btn-icono--peligro" onclick="this.closest('.preparar-envio-overlay').remove()">×</button>
        </div>
        <div class="copy-imgs-grid">
          ${m.imagenes.map((img, i) => `
            <div class="copy-imgs-celda">
              <label class="copy-imgs-check-wrap">
                <input type="checkbox" class="envio-img-check" data-idx="${i}" checked>
                <img src="${img.data}" class="copy-imgs-thumb">
              </label>
              <button class="btn-copiar-img" onclick="App._copiarImgMensaje('${mensajeId}', ${i}, this)">Copiar</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function _toggleTodasImgs(checked) {
    document.querySelectorAll('.envio-img-check').forEach(cb => cb.checked = checked);
  }

  async function _copiarSeleccionCanvas(mensajeId, btn) {
    const m = _state.mensajes.find(msg => msg.id === mensajeId);
    if (!m) return;
    const indices = Array.from(document.querySelectorAll('.envio-img-check:checked')).map(cb => parseInt(cb.dataset.idx));
    if (indices.length === 0) { alert('Selecciona al menos una imagen.'); return; }

    const srcs = indices.map(i => m.imagenes[i].data);
    const loaded = await Promise.all(srcs.map(src => new Promise((res, rej) => {
      const el = new Image(); el.onload = () => res(el); el.onerror = rej; el.src = src;
    })));

    const cellSize = 400;
    const gap = 8;
    const cols = Math.min(loaded.length, 2);
    const rows = Math.ceil(loaded.length / cols);
    const canvas = document.createElement('canvas');
    canvas.width  = cols * cellSize + (cols - 1) * gap;
    canvas.height = rows * cellSize + (rows - 1) * gap;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    loaded.forEach((img, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * (cellSize + gap);
      const y = row * (cellSize + gap);
      const scale = Math.max(cellSize / img.naturalWidth, cellSize / img.naturalHeight);
      const sw = cellSize / scale, sh = cellSize / scale;
      const sx = (img.naturalWidth - sw) / 2, sy = (img.naturalHeight - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, x, y, cellSize, cellSize);
    });

    canvas.toBlob(async blob => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        btn.textContent = '✓ Copiado';
        setTimeout(() => { btn.textContent = 'Copiar selección'; }, 2000);
      } catch (e) { alert('No se pudo copiar.'); }
    }, 'image/png');
  }

  async function _copiarImgMensaje(mensajeId, idx, btn) {
    const m = _state.mensajes.find(msg => msg.id === mensajeId);
    const img = m?.imagenes?.[idx];
    if (!img) return;
    try {
      const resp = await fetch(img.data);
      const blob = await resp.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
    } catch (e) {
      alert('No se pudo copiar la imagen.');
    }
  }

  // ── Imágenes ───────────────────────────────────────────────────────────────
  function adjuntarImagenes(convId, files) {
    _state.borradorImagenes[convId] = _state.borradorImagenes[convId] || [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        _state.borradorImagenes[convId].push({ nombre: file.name, data: e.target.result });
        _mostrarPreviewImagenes(convId, _state.borradorImagenes[convId]);
      };
      reader.readAsDataURL(file);
    });
  }

  function _mostrarPreviewImagenes(convId, imgs) {
    const preview = document.getElementById(`preview-imgs-${convId}`);
    if (!preview) return;
    preview.style.display = imgs.length ? 'flex' : 'none';
    preview.innerHTML = imgs.map((img, i) => `
      <div class="preview-img-wrapper">
        <img src="${img.data}" alt="${img.nombre}">
        <button onclick="App.quitarPreviewImagen('${convId}', ${i})">×</button>
      </div>
    `).join('');
  }

  // Intercepta Ctrl+V en el texto editable de un mensaje guardado
  function _interceptarPegarTexto(e, convId, mensajeId) {
    const items = Array.from(e.clipboardData?.items || []);
    const imgItems = items.filter(item => item.type.startsWith('image/'));
    if (imgItems.length === 0) return; // texto normal — dejar que el navegador lo pegue
    e.preventDefault();
    imgItems.forEach(item => {
      const file = item.getAsFile();
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async ev => {
        const m = _state.mensajes.find(msg => msg.id === mensajeId);
        if (!m) return;
        m.imagenes = m.imagenes || [];
        m.imagenes.push({ nombre: 'imagen.png', data: ev.target.result });
        await Storage.saveTranscripciones(_state.mensajes);
        _rerenderListaMensajes(convId);
      };
      reader.readAsDataURL(file);
    });
  }

  function _attachPasteListener(convId) {
    const ta = document.getElementById(`textarea-${convId}`);
    if (!ta || ta._pasteReady) return;
    ta._pasteReady = true;
    ta.addEventListener('paste', e => {
      const items = Array.from(e.clipboardData?.items || []);
      const imgItems = items.filter(item => item.type.startsWith('image/'));
      if (imgItems.length === 0) return;
      e.preventDefault();
      imgItems.forEach(item => {
        const file = item.getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          _state.borradorImagenes[convId] = _state.borradorImagenes[convId] || [];
          _state.borradorImagenes[convId].push({ nombre: 'imagen.png', data: ev.target.result });
          _mostrarPreviewImagenes(convId, _state.borradorImagenes[convId]);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  function quitarPreviewImagen(convId, idx) {
    _state.borradorImagenes[convId]?.splice(idx, 1);
    _mostrarPreviewImagenes(convId, _state.borradorImagenes[convId] || []);
  }

  async function eliminarImagenMensaje(convId, mensajeId, idx) {
    const m = _state.mensajes.find(m => m.id === mensajeId);
    if (!m) return;
    m.imagenes = m.imagenes || [];
    m.imagenes.splice(idx, 1);
    await Storage.saveTranscripciones(_state.mensajes);
    _rerenderListaMensajes(convId);
  }

  async function agregarImagenMensaje(convId, mensajeId, archivos) {
    const m = _state.mensajes.find(msg => msg.id === mensajeId);
    if (!m) return;
    m.imagenes = m.imagenes || [];
    let pendientes = archivos.length;
    Array.from(archivos).forEach(file => {
      const reader = new FileReader();
      reader.onload = async e => {
        m.imagenes.push({ nombre: file.name, data: e.target.result });
        pendientes--;
        if (pendientes === 0) {
          await Storage.saveTranscripciones(_state.mensajes);
          _rerenderListaMensajes(convId);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function verImagen(mensajeId, idx) {
    const m = _state.mensajes.find(m => m.id === mensajeId);
    if (!m?.imagenes?.[idx]) return;
    const w = window.open();
    w.document.write(`<img src="${m.imagenes[idx].data}" style="max-width:100%">`);
  }

  // ── Filtro ─────────────────────────────────────────────────────────────────
  function filtrarMensajes(convId, temaId) {
    _state.filtros[convId] = temaId;
    // Si salimos del filtro de tema, desactivar modo juntar
    if (!temaId) _state.modoJuntar[convId] = false;
    _refrescarPanel(convId);
  }

  // ── Juntar notas ───────────────────────────────────────────────────────────
  function toggleModoJuntar(convId) {
    _state.modoJuntar[convId] = !_state.modoJuntar[convId];
    if (!_state.modoJuntar[convId]) {
      _state.juntarSeleccion[convId] = [];
    }
    _refrescarPanel(convId);
  }

  function toggleSeleccionJuntar(convId, mensajeId) {
    const sel = _state.juntarSeleccion[convId] || [];
    const idx = sel.indexOf(mensajeId);
    _state.juntarSeleccion[convId] = idx === -1
      ? [...sel, mensajeId]
      : sel.filter(id => id !== mensajeId);
    _refrescarPanel(convId);
  }

  function dividirBloqueJuntar(convId, actual) {
    const nuevoNum = actual + 1;
    const contenedor = document.getElementById(`juntar-bloques-${convId}`);
    if (!contenedor || nuevoNum >= 3) return;
    // Quitar botón dividir del bloque actual
    const btnDividir = document.getElementById(`juntar-bloque-${convId}-${actual}`)?.querySelector('.btn-dividir');
    if (btnDividir) btnDividir.remove();
    // Añadir nuevo bloque
    contenedor.insertAdjacentHTML('beforeend', `
      <div class="juntar-bloque" id="juntar-bloque-${convId}-${nuevoNum}">
        <textarea class="juntar-textarea"
                  id="juntar-texto-${convId}-${nuevoNum}"
                  placeholder="Pega o escribe aquí..."></textarea>
        ${nuevoNum < 2 ? `
          <button class="btn-dividir"
                  onclick="App.dividirBloqueJuntar('${convId}', ${nuevoNum})">+ Dividir</button>
        ` : ''}
      </div>
    `);
  }

  async function guardarJuntado(convId) {
    const selIds = _state.juntarSeleccion[convId] || [];
    if (selIds.length === 0) { alert('Selecciona al menos un mensaje.'); return; }

    // Recoger texto e imágenes de los bloques editables (en orden de selección)
    const textos = [];
    const imagenes = [];
    selIds.forEach((msgId, i) => {
      const ta = document.getElementById(`juntar-texto-${convId}-${i}`);
      const txt = ta?.value.trim();
      if (txt) textos.push(txt);
      const m = _state.mensajes.find(msg => msg.id === msgId);
      imagenes.push(...(m?.imagenes || []));
    });

    if (textos.length === 0 && imagenes.length === 0) return;

    const borrar = document.getElementById(`juntar-borrar-${convId}`)?.checked;
    const filtroId = _state.filtros[convId];
    const conv   = _state.conversaciones.find(c => c.id === convId);
    const temaId = filtroId || null;
    const tema   = conv?.temas?.find(t => t.id === temaId);

    const mensaje = {
      id: Storage.nuevoId('msg'),
      conversacion_id: convId,
      tema_id: temaId,
      tema_nombre: tema?.nombre || null,
      texto: textos.join('\n\n'),
      fecha: new Date().toISOString(),
      origen: 'juntado',
      enviado: false,
      imagenes,
    };

    if (borrar) {
      _state.mensajes = _state.mensajes.filter(m => !selIds.includes(m.id));
    }

    _state.mensajes.push(mensaje);
    window._mensajesGlobal = _state.mensajes;
    await Storage.saveTranscripciones(_state.mensajes);

    _state.modoJuntar[convId] = false;
    _state.juntarSeleccion[convId] = [];
    _refrescarPanel(convId);
    _actualizarMiniCard(convId);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function _refrescarPanel(convId) {
    if (_state.panelConvId === convId) {
      _guardarBorradorPanel();
      _renderPanel(convId);
      _restaurarBorradorPanel(convId);
    }
    _actualizarMiniCard(convId);
  }

  function _rerenderListaMensajes(convId) {
    const lista = document.getElementById(`mensajes-${convId}`);
    if (!lista) return;
    const conv      = _state.conversaciones.find(c => c.id === convId);
    const msgs      = _state.mensajes.filter(m => m.conversacion_id === convId);
    const modoJuntar = _state.modoJuntar[convId] || false;
    const juntarSel  = _state.juntarSeleccion[convId] || [];
    lista.innerHTML = ConversacionCard._renderMensajes(msgs, conv?.temas || [], _state.filtros[convId] || null, modoJuntar, juntarSel);
  }

  function _actualizarResumenPanel(convId) {
    const msgs       = _state.mensajes.filter(m => m.conversacion_id === convId);
    const pendientes = msgs.filter(m => !m.enviado).length;
    const enviados   = msgs.filter(m => m.enviado).length;
    const elP = document.querySelector('.panel-conv__stats .conv-card__pendientes');
    const elE = document.querySelector('.panel-conv__stats .conv-card__enviados');
    if (elP) { elP.textContent = `${pendientes} pendiente${pendientes !== 1 ? 's' : ''}`; elP.hidden = pendientes === 0; }
    if (elE) { elE.textContent = `${enviados} enviado${enviados !== 1 ? 's' : ''}`; elE.hidden = enviados === 0; }
  }

  function _actualizarMiniCard(convId) {
    const conv = _state.conversaciones.find(c => c.id === convId);
    if (!conv) return;
    const card = document.querySelector(`.agente-card[data-conv-id="${convId}"]`);
    if (!card) return;
    const proyecto = _state.proyectos.find(p => p.id === conv.proyecto_id);
    card.outerHTML = ProyectoCard._renderMiniCard(conv, _state.mensajes, proyecto?.color || '#9B9A97');
  }

  // ── Drag & drop ────────────────────────────────────────────────────────────
  let _convArrastrada = null;

  function dragInicio(event, convId) {
    _convArrastrada = convId;
    event.dataTransfer.effectAllowed = 'move';
    event.target.closest('.agente-card').classList.add('agente-card--arrastrando');
  }

  function dragFin(event) {
    event.target.closest('.agente-card')?.classList.remove('agente-card--arrastrando');
    document.querySelectorAll('.carpeta-cuerpo--drop').forEach(el => el.classList.remove('carpeta-cuerpo--drop'));
    _convArrastrada = null;
  }

  function dragSobre(event, proyectoId) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.currentTarget.classList.add('carpeta-cuerpo--drop');
  }

  function dragSale(event) {
    // Solo quitar resaltado si salimos del cuerpo real (no de un hijo)
    if (!event.currentTarget.contains(event.relatedTarget)) {
      event.currentTarget.classList.remove('carpeta-cuerpo--drop');
    }
  }

  async function dragSoltar(event, proyectoId) {
    event.preventDefault();
    event.currentTarget.classList.remove('carpeta-cuerpo--drop');
    if (!_convArrastrada) return;
    const destino = proyectoId === '__sin_proyecto__' ? null : proyectoId;
    await moverAProyecto(_convArrastrada, destino);
    _convArrastrada = null;
  }

  async function moverAProyecto(convId, proyectoId) {
    const conv = _state.conversaciones.find(c => c.id === convId);
    if (!conv) return;
    conv.proyecto_id = proyectoId || null;
    await Storage.saveConversaciones(_state.conversaciones);
    renderGaleria();
    // Mantener panel abierto
    if (_state.panelConvId === convId) {
      document.getElementById('panel-galeria').classList.add('tiene-panel');
      _renderPanel(convId);
      _restaurarBorradorPanel(convId);
    }
  }

  // ── API pública ────────────────────────────────────────────────────────────
  window.App = {
    nuevaIA, seleccionarIA, reiniciarCronometro, abrirEditorCronometro,
    _guardarHoraCronometro, _reiniciarAhora, _cerrarEditorCronometro,
    moverAProyecto, dragInicio, dragFin, dragSobre, dragSale, dragSoltar,
    nuevoProyecto, cambiarColorProyecto,
    nuevaConversacion, renombrarConversacion, eliminarConversacion, cambiarEstadoConv,
    abrirPanel, cerrarPanel,
    nuevaEtiqueta, cambiarColorEtiqueta, eliminarEtiqueta,
    toggleTemaZanjado, limpiarZanjados, limpiarEnviados,
    cambiarEtiquetaMensaje,
    guardarMensaje, editarMensaje, eliminarMensaje, toggleMensaje, copiarPendientes,
    adjuntarImagenes, quitarPreviewImagen, eliminarImagenMensaje, agregarImagenMensaje, verImagen,
    _interceptarPegarTexto,
    copiarImagenPendiente, _abrirModalEnvio, _cerrarModalEnvio,
    copiarTextoMensaje, copiarImagenesMensaje, _copiarImgMensaje, togglePanelImagenes,
    _toggleTodasImgs, _copiarSeleccionCanvas,
    filtrarMensajes,
    toggleModoJuntar, toggleSeleccionJuntar, dividirBloqueJuntar, guardarJuntado,
  };

  document.addEventListener('DOMContentLoaded', init);
})();
