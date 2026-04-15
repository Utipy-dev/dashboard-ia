// ia-card.js — Pestaña de IA con cronómetro editable
// Expone window.IaCard

(function () {
  'use strict';

  const IaCard = {

    renderTab(ia, activa) {
      return `
        <div class="ia-tab-wrapper">
          <button class="ia-tab ${activa ? 'ia-tab--activa' : ''}"
                  data-ia-id="${ia.id}"
                  onclick="App.seleccionarIA('${ia.id}')">
            ${ia.nombre}
            <span class="ia-tab__cronometro" id="cronometro-${ia.id}">--:--:--</span>
          </button>
          <button class="ia-tab__edit-btn" title="Ajustar cronómetro"
                  onclick="App.abrirEditorCronometro('${ia.id}')">⏱</button>
        </div>
      `;
    },

    actualizarCronometro(iaId, segundosRestantes) {
      const el = document.getElementById(`cronometro-${iaId}`);
      if (!el) return;
      const h = Math.floor(segundosRestantes / 3600);
      const m = Math.floor((segundosRestantes % 3600) / 60);
      const s = segundosRestantes % 60;
      el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      el.classList.toggle('ia-tab__cronometro--urgente', segundosRestantes < 1800 && segundosRestantes > 0);
      el.classList.toggle('ia-tab__cronometro--critico', segundosRestantes < 300 && segundosRestantes > 0);
    },
  };

  window.IaCard = IaCard;
})();
