// tema-item.js — Bloque de mensaje con selector de etiqueta e imágenes
// Expone window.TemaItem

(function () {
  'use strict';

  const TemaItem = {

    render(mensaje, temas, temaZanjado, modoJuntar = false, ordenSeleccion = -1) {
      const tema  = temas?.find(t => t.id === mensaje.tema_id);
      const fecha = new Date(mensaje.fecha).toLocaleString('es-ES', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit',
      });

      const imagenes = mensaje.imagenes || [];

      return `
        <div class="mensaje-item ${temaZanjado ? 'mensaje-item--zanjado' : ''} ${mensaje.enviado ? 'mensaje-item--enviado' : ''} ${modoJuntar ? 'mensaje-item--juntar' : ''} ${ordenSeleccion >= 0 ? 'mensaje-item--seleccionado' : ''}"
             data-mensaje-id="${mensaje.id}"
             data-tema-id="${mensaje.tema_id || ''}">

          <div class="mensaje-item__header">
            ${modoJuntar ? `
              <button class="juntar-sel-btn ${ordenSeleccion >= 0 ? 'juntar-sel-btn--activo' : ''}"
                      onclick="App.toggleSeleccionJuntar('${mensaje.conversacion_id}', '${mensaje.id}')"
                      title="${ordenSeleccion >= 0 ? 'Deseleccionar' : 'Seleccionar para juntar'}">
                ${ordenSeleccion >= 0 ? ordenSeleccion + 1 : '○'}
              </button>
            ` : ''}
            <!-- Selector de etiqueta (editable) -->
            <select class="mensaje-etiqueta-select"
                    style="${tema ? `background:${tema.color};color:#fff` : ''}"
                    onchange="App.cambiarEtiquetaMensaje('${mensaje.conversacion_id}', '${mensaje.id}', this.value)"
                    title="Cambiar etiqueta">
              <option value="" ${!mensaje.tema_id ? 'selected' : ''}>Sin etiqueta</option>
              ${(temas || []).map(t =>
                `<option value="${t.id}" ${mensaje.tema_id === t.id ? 'selected' : ''}>${t.nombre}</option>`
              ).join('')}
            </select>

            <span class="mensaje-fecha">${fecha}</span>

            <div class="mensaje-checks">
              <label class="check-label" title="Enviado — ya copiado a la IA">
                <input type="checkbox" ${mensaje.enviado ? 'checked' : ''}
                       onchange="App.toggleMensaje('${mensaje.conversacion_id}', '${mensaje.id}', 'enviado', this.checked)">
                <span>Enviado</span>
              </label>
            </div>
            <button class="btn-icono btn-icono--peligro" title="Eliminar"
                    onclick="App.eliminarMensaje('${mensaje.conversacion_id}', '${mensaje.id}')">×</button>
          </div>

          <div class="mensaje-item__body">
            <div class="mensaje-item__texto-panel">
              <div class="mensaje-item__texto"
                   contenteditable="true"
                   data-m-id="${mensaje.id}"
                   onpaste="App._interceptarPegarTexto(event, '${mensaje.conversacion_id}', '${mensaje.id}')"
                   onblur="App.editarMensaje('${mensaje.conversacion_id}', '${mensaje.id}', this.innerText)">${mensaje.texto}</div>
              <button class="btn-copiar-panel" onclick="App.copiarTextoMensaje('${mensaje.id}')">Copiar texto</button>
            </div>

            <div class="mensaje-item__imgs-panel ${imagenes.length === 0 ? 'mensaje-item__imgs-panel--minimizado' : ''}"
                 id="imgs-panel-${mensaje.id}">
              <button class="imgs-panel__toggle"
                      onclick="App.togglePanelImagenes('${mensaje.id}')"
                      title="${imagenes.length === 0 ? 'Expandir imágenes' : 'Colapsar imágenes'}">
                ${imagenes.length === 0 ? '▸' : `▾ ${imagenes.length}`}
              </button>
              <div class="imgs-panel__scroll">
                ${imagenes.map((img, i) => `
                  <div class="mensaje-imagen-wrapper">
                    <img src="${img.data}" alt="${img.nombre}" class="mensaje-imagen"
                         onclick="App.verImagen('${mensaje.id}', ${i})">
                    <button class="mensaje-imagen-del"
                            onclick="App.eliminarImagenMensaje('${mensaje.conversacion_id}', '${mensaje.id}', ${i})"
                            title="Eliminar">×</button>
                  </div>
                `).join('')}
                <label class="mensaje-imagen-add" title="Añadir imagen">
                  +
                  <input type="file" accept="image/*" multiple style="display:none"
                         onchange="App.agregarImagenMensaje('${mensaje.conversacion_id}', '${mensaje.id}', this.files)">
                </label>
              </div>
              ${imagenes.length > 0 ? `
                <button class="btn-copiar-panel" onclick="App.copiarImagenesMensaje('${mensaje.id}')">Copiar imgs</button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    },
  };

  window.TemaItem = TemaItem;
})();
