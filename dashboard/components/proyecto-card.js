// proyecto-card.js — Carpeta con pestaña real + tarjetas con barra de color
// Expone window.ProyectoCard

(function () {
  'use strict';

  const COLORES = ['#4A90D9','#27AE60','#E67E22','#9B59B6','#E74C3C','#1ABC9C','#F39C12','#95A5A6'];

  function colorFondo(hex, op) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${op})`;
  }

  const ProyectoCard = {

    render(proyecto, conversaciones) {
      const convs = conversaciones.filter(c =>
        proyecto.id === '__sin_proyecto__'
          ? (c.proyecto_id === null || c.proyecto_id === undefined) && c.ia_id === proyecto.ia_id
          : c.proyecto_id === proyecto.id
      );
      const color         = proyecto.color || COLORES[0];
      const esSinProyecto = proyecto.id === '__sin_proyecto__';
      const bgFondo       = colorFondo(color, 0.06);
      const bgBorde       = colorFondo(color, 0.2);

      return `
        <div class="carpeta-wrapper">
          <!-- Pestaña de la carpeta -->
          <div class="carpeta-tab" style="background:${color}">
            ${esSinProyecto
              ? `<span class="carpeta-tab__nombre">Sin proyecto</span>`
              : `<label class="proyecto-color-picker" title="Cambiar color"
                        onclick="event.stopPropagation()">
                   <span class="carpeta-tab__nombre">${proyecto.nombre}</span>
                   <input type="color" value="${color}"
                          onchange="App.cambiarColorProyecto('${proyecto.id}', this.value)"
                          style="opacity:0;position:absolute;width:0;height:0">
                 </label>`
            }
            <span class="carpeta-tab__contador"
                  style="background:rgba(255,255,255,.25);color:#fff">${convs.length}</span>
            <button class="carpeta-tab__add" title="Nuevo agente"
                    onclick="App.nuevaConversacion('${proyecto.id}')">+</button>
          </div>

          <!-- Cuerpo de la carpeta (zona de drop) -->
          <section class="carpeta-cuerpo"
                   style="background:${bgFondo};border-color:${bgBorde}"
                   ondragover="App.dragSobre(event, '${proyecto.id}')"
                   ondragleave="App.dragSale(event)"
                   ondrop="App.dragSoltar(event, '${proyecto.id}')">
            <div class="galeria-convs" id="convs-${proyecto.id}">
              ${convs.length === 0
                ? `<div class="galeria-vacia">Sin agentes. Haz clic en + para añadir uno.</div>`
                : convs.map(c => ProyectoCard._renderMiniCard(c, window._mensajesGlobal || [], color)).join('')
              }
              <div class="galeria-add-card-wrapper">
                <button class="galeria-add-card"
                        onclick="App.nuevaConversacion('${proyecto.id}')">
                  <span>+</span><span>Nuevo agente</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      `;
    },

    _renderMiniCard(conv, mensajes, proyectoColor) {
      const msgs         = mensajes.filter(m => m.conversacion_id === conv.id);
      const pendientes   = msgs.filter(m => !m.enviado).length;
      const temasActivos = (conv.temas || []).filter(t => !t.zanjado); // solo activos
      const color        = proyectoColor || '#9B9A97';

      const estadoClases    = { esperando_tokens:'estado--espera', activa:'estado--activa', zanjada:'estado--zanjada' };
      const estadoEtiquetas = { esperando_tokens:'Esperando', activa:'Activa', zanjada:'Zanjada' };

      return `
        <div class="agente-card"
             draggable="true"
             data-conv-id="${conv.id}"
             ondragstart="App.dragInicio(event, '${conv.id}')"
             ondragend="App.dragFin(event)"
             onclick="App.abrirPanel('${conv.id}')" title="${conv.nombre}">
          <div class="agente-card__barra" style="background:${color}">
            <span class="agente-card__nombre">${conv.nombre}</span>
            <button class="agente-card__del" title="Eliminar agente"
                    onclick="event.stopPropagation();App.eliminarConversacion('${conv.id}')">×</button>
          </div>
          <div class="agente-card__cuerpo">
            <div class="agente-card__badges">
              <span class="estado-badge ${estadoClases[conv.estado] || 'estado--activa'}">
                ${estadoEtiquetas[conv.estado] || 'Activa'}
              </span>
              ${pendientes > 0
                ? `<span class="conv-card__pendientes">${pendientes} pendiente${pendientes !== 1 ? 's' : ''}</span>`
                : ''}
            </div>

            ${temasActivos.length > 0 ? `
              <div class="galeria-card__temas">
                ${temasActivos.slice(0, 4).map(t => `
                  <span class="galeria-tema-chip" style="background:${t.color || '#9B9A97'}">
                    ${t.nombre}
                  </span>
                `).join('')}
                ${temasActivos.length > 4
                  ? `<span class="galeria-card__mas">+${temasActivos.length - 4}</span>`
                  : ''}
              </div>
            ` : ''}

            ${conv.descripcion
              ? `<p class="galeria-card__desc">${conv.descripcion}</p>`
              : ''}
          </div>
        </div>
      `;
    },

    colorFondo,
    colores: COLORES,
  };

  window.ProyectoCard = ProyectoCard;
})();
