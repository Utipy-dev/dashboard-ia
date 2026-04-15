// conversacion-card.js — Panel de detalle con juntar notas e imágenes
// Expone window.ConversacionCard

(function () {
  'use strict';

  const ESTADOS = {
    esperando_tokens: { etiqueta: 'Esperando tokens', clase: 'estado--espera' },
    activa:           { etiqueta: 'Activa',           clase: 'estado--activa' },
    zanjada:          { etiqueta: 'Zanjada',          clase: 'estado--zanjada' },
  };

  const COLORES_ETIQUETA = ['#6366F1','#10B981','#F59E0B','#EF4444','#3B82F6','#8B5CF6','#EC4899','#14B8A6'];

  const ConversacionCard = {

    renderDetalle(conv, mensajes, filtroTemaId, modoJuntar, proyectos, juntarSel = []) {
      const temas        = conv.temas || [];
      const temasActivos = temas.filter(t => !t.zanjado);
      const temasZanjados = temas.filter(t => t.zanjado);
      const msgs         = (mensajes || []).filter(m => m.conversacion_id === conv.id);
      const pendientes   = msgs.filter(m => !m.enviado).length;
      const enviados     = msgs.filter(m => m.enviado).length;
      const proyectosIA  = (proyectos || []).filter(p => p.ia_id === conv.ia_id);

      return `
        <div class="panel-conv__cabecera">
          <div class="panel-conv__nombre-row">
            <h2 class="panel-conv__nombre"
                contenteditable="true"
                onblur="App.renombrarConversacion('${conv.id}', this.textContent)"
                title="Clic para editar">${conv.nombre}</h2>
            <select class="estado-select-inline"
                    onchange="App.cambiarEstadoConv('${conv.id}', this.value)">
              ${Object.entries(ESTADOS).map(([val, { etiqueta }]) =>
                `<option value="${val}" ${conv.estado === val ? 'selected' : ''}>${etiqueta}</option>`
              ).join('')}
            </select>
            <button class="btn-icono btn-icono--peligro" title="Eliminar conversación"
                    onclick="App.eliminarConversacion('${conv.id}')">×</button>
          </div>
          ${conv.descripcion ? `<p class="panel-conv__desc">${conv.descripcion}</p>` : ''}
          <div class="panel-conv__meta">
            <div class="panel-conv__stats">
              ${pendientes > 0 ? `<span class="conv-card__pendientes">${pendientes} pendiente${pendientes !== 1 ? 's' : ''}</span>` : ''}
              ${enviados > 0   ? `<span class="conv-card__enviados">${enviados} enviado${enviados !== 1 ? 's' : ''}</span>` : ''}
            </div>
            ${proyectosIA.length > 0 ? `
              <label class="mover-proyecto-label">
                Proyecto:
                <select class="estado-select-inline"
                        onchange="App.moverAProyecto('${conv.id}', this.value)">
                  <option value="">Sin proyecto</option>
                  ${proyectosIA.map(p =>
                    `<option value="${p.id}" ${conv.proyecto_id === p.id ? 'selected' : ''}>${p.nombre}</option>`
                  ).join('')}
                </select>
              </label>
            ` : ''}
          </div>
        </div>

        <!-- Temas -->
        <div class="panel-conv__temas-section">
          <div class="panel-conv__temas-header">
            <span class="label-seccion">Temas</span>
            <div style="display:flex;gap:6px;align-items:center">
              <button class="btn-texto" onclick="App.nuevaEtiqueta('${conv.id}')">+ Añadir</button>
              <button class="btn-texto btn-texto--peligro"
                      onclick="App.limpiarEnviados('${conv.id}')">🗑 Limpiar enviados</button>
              <button class="btn-texto btn-texto--peligro"
                      onclick="App.limpiarZanjados('${conv.id}')">🗑 Limpiar zanjados</button>
            </div>
          </div>

          <!-- Temas activos -->
          <div class="temas-checklist" id="checklist-${conv.id}">
            ${temasActivos.length === 0
              ? '<span style="font-size:12px;color:var(--txt-dim)">Sin temas activos.</span>'
              : temasActivos.map(t => `
                <label class="tema-check">
                  <input type="checkbox"
                         onchange="App.toggleTemaZanjado('${conv.id}', '${t.id}', this.checked)">
                  <span class="tema-check__punto" style="background:${t.color}"></span>
                  <span class="tema-check__nombre">${t.nombre}</span>
                  <input type="color" value="${t.color}" title="Color"
                         onchange="App.cambiarColorEtiqueta('${conv.id}', '${t.id}', this.value)"
                         class="color-picker-inline">
                  <button onclick="event.stopPropagation();App.eliminarEtiqueta('${conv.id}','${t.id}')"
                          class="tema-check__del">×</button>
                </label>
              `).join('')
            }
          </div>

          <!-- Temas zanjados (colapsados) -->
          ${temasZanjados.length > 0 ? `
            <details class="temas-zanjados-details">
              <summary class="temas-zanjados-summary">
                ${temasZanjados.length} zanjado${temasZanjados.length !== 1 ? 's' : ''}
              </summary>
              <div class="temas-checklist temas-checklist--zanjados">
                ${temasZanjados.map(t => `
                  <label class="tema-check tema-check--zanjado">
                    <input type="checkbox" checked
                           onchange="App.toggleTemaZanjado('${conv.id}', '${t.id}', this.checked)">
                    <span class="tema-check__punto" style="background:${t.color}"></span>
                    <span class="tema-check__nombre">${t.nombre}</span>
                    <button onclick="event.stopPropagation();App.eliminarEtiqueta('${conv.id}','${t.id}')"
                            class="tema-check__del">×</button>
                  </label>
                `).join('')}
              </div>
            </details>
          ` : ''}

          <!-- Filtros + Juntar notas (solo temas activos) -->
          ${temasActivos.length > 0 ? `
            <div class="filtros-row" id="filtros-${conv.id}" style="margin-top:10px">
              <button class="filtro-pill ${!filtroTemaId ? 'filtro-pill--activo' : ''}"
                      onclick="App.filtrarMensajes('${conv.id}', null)">Todos</button>
              ${temasActivos.map(t => `
                <button class="filtro-pill ${filtroTemaId === t.id ? 'filtro-pill--activo' : ''}"
                        style="${filtroTemaId === t.id ? `background:${t.color};border-color:${t.color};color:#fff` : ''}"
                        onclick="App.filtrarMensajes('${conv.id}', '${t.id}')">
                  ${t.nombre}
                </button>
              `).join('')}
              ${filtroTemaId ? `
                <button class="btn-juntar ${modoJuntar ? 'btn-juntar--activo' : ''}"
                        onclick="App.toggleModoJuntar('${conv.id}')">
                  ${modoJuntar ? '✕ Cerrar juntar' : '⊕ Juntar notas'}
                </button>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Layout: mensajes + panel juntar (si activo) -->
        <div class="panel-conv__mensajes-layout ${modoJuntar ? 'panel-conv__mensajes-layout--split' : ''}">

          <!-- Mensajes -->
          <div class="panel-conv__mensajes">
            <div class="mensajes-lista" id="mensajes-${conv.id}">
              ${ConversacionCard._renderMensajes(msgs, temas, filtroTemaId, modoJuntar, juntarSel)}
            </div>
          </div>

          <!-- Panel juntar notas (visible solo en modo juntar) -->
          ${modoJuntar ? `
            <div class="juntar-panel" id="juntar-panel-${conv.id}">
              <div class="juntar-panel__header">
                <span class="label-seccion">Juntar notas</span>
                <span style="font-size:12px;color:var(--txt-dim)">
                  ${juntarSel.length === 0
                    ? 'Haz clic en ○ junto a cada mensaje para seleccionarlos en orden'
                    : `${juntarSel.length} seleccionado${juntarSel.length !== 1 ? 's' : ''}`
                  }
                </span>
              </div>
              ${juntarSel.length > 0 ? `
                <div id="juntar-bloques-${conv.id}">
                  ${juntarSel.map((msgId, i) => {
                    const m = (mensajes || []).find(msg => msg.id === msgId);
                    return ConversacionCard._renderBloqueJuntar(conv.id, i, m);
                  }).join('')}
                </div>
                <div class="juntar-panel__acciones">
                  <label class="check-label">
                    <input type="checkbox" id="juntar-borrar-${conv.id}">
                    <span>Borrar originales al guardar</span>
                  </label>
                  <button class="btn-primary"
                          onclick="App.guardarJuntado('${conv.id}')">
                    Guardar como mensaje
                  </button>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Nuevo mensaje -->
        <div class="nuevo-mensaje" id="nuevo-msg-${conv.id}">
          <div class="nuevo-mensaje__controles">
            <select id="select-tema-${conv.id}" class="select-etiqueta">
              <option value="">Sin etiqueta</option>
              ${temas.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('')}
            </select>
            <div style="display:flex;gap:8px;align-items:center">
              <label class="btn-adjuntar" title="Adjuntar imagen (también Ctrl+V en el texto)">
                📎
                <input type="file" accept="image/*" multiple style="display:none"
                       onchange="App.adjuntarImagenes('${conv.id}', this.files)">
              </label>
              <button class="btn-texto" onclick="App.copiarPendientes('${conv.id}')">
                Copiar pendientes
              </button>
            </div>
          </div>
          <div class="nuevo-mensaje__composicion">
            <textarea id="textarea-${conv.id}"
                      class="nuevo-mensaje__textarea"
                      placeholder="Escribe, pega o dicta. Ctrl+V para imágenes."
                      rows="4"></textarea>
            <div id="preview-imgs-${conv.id}" class="preview-imagenes-lateral" style="display:none"></div>
          </div>
          <div class="nuevo-mensaje__footer">
            <button class="btn-primary" onclick="App.guardarMensaje('${conv.id}')">Guardar mensaje</button>
          </div>
        </div>
      `;
    },

    _renderBloqueJuntar(convId, idx, mensaje) {
      const imagenes = mensaje?.imagenes || [];
      const fecha = mensaje
        ? new Date(mensaje.fecha).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
        : '';
      return `
        <div class="juntar-bloque" id="juntar-bloque-${convId}-${idx}">
          <div class="juntar-bloque__header">
            <span class="juntar-bloque__num">${idx + 1}</span>
            <span class="juntar-bloque__fecha">${fecha}</span>
          </div>
          <textarea class="juntar-textarea"
                    id="juntar-texto-${convId}-${idx}"
                    placeholder="Sin texto">${mensaje?.texto || ''}</textarea>
          ${imagenes.length > 0 ? `
            <div class="juntar-imgs">
              ${imagenes.map(img => `
                <img src="${img.data}" alt="${img.nombre}" class="mensaje-imagen"
                     width="80" height="80">
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    },

    _renderMensajes(msgs, temas, filtroTemaId, modoJuntar = false, juntarSel = []) {
      const temaZanjadoIds = new Set((temas || []).filter(t => t.zanjado).map(t => t.id));
      let filtrados = filtroTemaId
        ? msgs.filter(m => m.tema_id === filtroTemaId)
        : msgs;
      filtrados = filtrados.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      if (filtrados.length === 0) {
        return '<p class="vacio">Sin mensajes. Escribe o dicta en el campo de abajo.</p>';
      }
      return filtrados.map(m => {
        const orden = juntarSel.indexOf(m.id);
        return window.TemaItem.render(m, temas, temaZanjadoIds.has(m.tema_id), modoJuntar, orden);
      }).join('');
    },

    coloresEtiqueta: COLORES_ETIQUETA,
  };

  window.ConversacionCard = ConversacionCard;
})();
