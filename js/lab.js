/* ============================================================
   lab.js – ClearWater Lab  Drag-and-Drop & Material Stacking
   ============================================================ */

/**
 * Lab state – managed here, consumed by animation/scoring/chatbot.
 */
const Lab = (() => {
  let currentScenario = null;   // 'A' or 'B'
  let layers = [];               // top-to-bottom order of material names
  let isFiltering = false;
  let lastResult = null;

  /* ---------- DOM refs (resolved on init) ---------- */
  let bottleLayers, bottle, btnFilter, btnClear, dashboard;

  function init() {
    bottleLayers = document.getElementById('bottle-layers');
    bottle       = document.getElementById('bottle');
    btnFilter    = document.getElementById('btn-filter');
    btnClear     = document.getElementById('btn-clear');
    dashboard    = document.getElementById('dashboard');

    setupDragAndDrop();
    setupButtons();
  }

  /* =====================================================
     DRAG AND DROP
     ===================================================== */
  function setupDragAndDrop() {
    // Draggable material cards
    document.querySelectorAll('.material-card[draggable]').forEach(card => {
      card.addEventListener('dragstart', onDragStart);
      card.addEventListener('dragend', onDragEnd);
    });

    // Drop target = bottle
    bottle.addEventListener('dragover', onDragOver);
    bottle.addEventListener('dragenter', onDragEnter);
    bottle.addEventListener('dragleave', onDragLeave);
    bottle.addEventListener('drop', onDrop);

    // Touch support (basic)
    document.querySelectorAll('.material-card[draggable]').forEach(card => {
      card.addEventListener('click', () => {
        if (isFiltering) return;
        const mat = card.dataset.material;
        addLayer(mat);
      });
    });
  }

  function onDragStart(e) {
    if (isFiltering) { e.preventDefault(); return; }
    e.dataTransfer.setData('text/plain', e.currentTarget.dataset.material);
    e.dataTransfer.effectAllowed = 'copy';
    e.currentTarget.classList.add('dragging');
  }

  function onDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  function onDragEnter(e) {
    e.preventDefault();
    bottle.classList.add('drag-over');
  }

  function onDragLeave(e) {
    // Only remove if actually leaving the bottle
    if (!bottle.contains(e.relatedTarget)) {
      bottle.classList.remove('drag-over');
    }
  }

  function onDrop(e) {
    e.preventDefault();
    bottle.classList.remove('drag-over');
    if (isFiltering) return;

    const mat = e.dataTransfer.getData('text/plain');
    if (mat) addLayer(mat);
  }

  /* =====================================================
     LAYER MANAGEMENT
     ===================================================== */

  /** Add a material layer (appears at top of the stack). Max 6 layers. */
  function addLayer(material) {
    if (layers.length >= 6) return; // reasonable cap

    layers.unshift(material);       // add to top (index 0 = topmost)
    renderLayers();
    hideDashboard();
  }

  /** Remove a layer by its index (in the layers array, 0 = top). */
  function removeLayer(index) {
    if (isFiltering) return;
    layers.splice(index, 1);
    renderLayers();
    hideDashboard();
  }

  /** Clear all layers. */
  function clearLayers() {
    layers = [];
    renderLayers();
    hideDashboard();
    Animation.resetAnimation(currentScenario);
  }

  /** Render layers inside the bottle. */
  function renderLayers() {
    // Remove existing layer elements
    bottleLayers.querySelectorAll('.filter-layer').forEach(el => el.remove());

    // Hide/show placeholder
    const ph = bottleLayers.querySelector('.placeholder-text');
    if (ph) ph.style.display = layers.length === 0 ? '' : 'none';

    // Layers array is top-to-bottom, but CSS column-reverse means
    // we append in reverse so the first element in DOM = bottom-most visually.
    // Actually, with column-reverse, the FIRST child renders at the BOTTOM.
    // So we append layers in reverse order (bottom first).
    for (let i = layers.length - 1; i >= 0; i--) {
      const mat = layers[i];
      const el = document.createElement('div');
      el.className = `filter-layer layer-${mat}`;
      el.dataset.index = i;

      const label = document.createElement('span');
      label.className = 'layer-label';
      label.textContent = I18n.t(mat);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'layer-remove';
      removeBtn.textContent = '✕';
      removeBtn.title = I18n.t('removeLayer');
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeLayer(i);
      });

      el.appendChild(label);
      el.appendChild(removeBtn);
      bottleLayers.appendChild(el);
    }
  }

  /* =====================================================
     FILTER BUTTON
     ===================================================== */
  function setupButtons() {
    btnFilter.addEventListener('click', startFiltering);
    btnClear.addEventListener('click', clearLayers);

    const btnTryAgain = document.getElementById('btn-try-again');
    if (btnTryAgain) {
      btnTryAgain.addEventListener('click', () => {
        clearLayers();
      });
    }
  }

  async function startFiltering() {
    if (isFiltering || layers.length === 0) return;

    isFiltering = true;
    btnFilter.disabled = true;
    btnFilter.textContent = I18n.t('filtering');

    Animation.resetAnimation(currentScenario);

    const result = Scoring.computeFilterResult(currentScenario, layers);
    lastResult = result;

    await Animation.runFilterAnimation(currentScenario, layers, result);

    showDashboard(result);

    Experiment.onFilterComplete(currentScenario, result);

    if (window.DrH2OElement && document.querySelector('dr-h2o').style.display !== 'none') {
      window.DrH2OElement.onFilterComplete(result);
    }

    _showScenarioStatus();

    isFiltering = false;
    btnFilter.disabled = false;
    btnFilter.textContent = I18n.t('startFilter');
  }

  function _showScenarioStatus() {
    let statusEl = document.getElementById('scenario-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'scenario-status';
      statusEl.className = 'scenario-status';
      const actions = document.querySelector('.bottle-actions');
      actions.parentNode.insertBefore(statusEl, actions.nextSibling);
    }

    const remaining = Experiment.getMinAttemptsRemaining(currentScenario);

    if (remaining > 0) {
      statusEl.innerHTML = `<p class="status-msg">${I18n.t('scenarioNeedMore').replace('{n}', remaining)}</p>`;
    } else if (!Experiment.isScenarioDone(currentScenario)) {
      const btnId = currentScenario === 'A' ? 'finish-scenario-a' : 'finish-scenario-b';
      const isLastScenario = currentScenario === 'B' || Experiment.isScenarioDone('B');

      let btnLabel, btnAction;
      if (currentScenario === 'A' && !Experiment.isScenarioDone('B')) {
        btnLabel = I18n.t('nextScenarioBtn');
        btnAction = () => {
          Experiment.markScenarioDone('A');
          Lab.clearLayers();
          Lab.setScenario('B');
          _removeScenarioStatus();
        };
      } else {
        btnLabel = I18n.t('finishExperimentBtn');
        btnAction = () => {
          Experiment.markScenarioDone(currentScenario);
          if (Experiment.areBothScenariosDone()) {
            Experiment.goToPostTest();
          } else {
            Experiment.showScreen('landing-screen');
            if (window.AppUpdateScenarioCards) window.AppUpdateScenarioCards();
          }
        };
      }

      statusEl.innerHTML = `
        <p class="status-msg status-complete">${I18n.t('scenarioComplete').replace('{s}', currentScenario)}</p>
        <button id="${btnId}" class="btn btn-primary">${btnLabel}</button>
      `;
      document.getElementById(btnId).addEventListener('click', btnAction);
    }
  }

  function _removeScenarioStatus() {
    const el = document.getElementById('scenario-status');
    if (el) el.remove();
  }

  /* =====================================================
     DASHBOARD
     ===================================================== */
  function showDashboard(result) {
    dashboard.classList.remove('hidden');
    document.querySelector('.lab-layout').classList.add('with-dashboard');

    // Turbidity (clarity %)
    const turbFill = document.getElementById('turbidity-fill');
    const turbVal  = document.getElementById('turbidity-value');
    turbFill.style.width = result.clarity + '%';
    turbVal.textContent = result.clarity + '%';

    // Odor
    const odorVal = document.getElementById('odor-value');
    odorVal.className = 'odor-value';
    if (result.odorLevel === 'strong') {
      odorVal.textContent = I18n.t('odorStrong');
      odorVal.classList.add('odor--strong');
    } else if (result.odorLevel === 'medium') {
      odorVal.textContent = I18n.t('odorMedium');
      odorVal.classList.add('odor--medium');
    } else {
      odorVal.textContent = I18n.t('odorNone');
      odorVal.classList.add('odor--none');
    }

    // Flow
    const flowVal = document.getElementById('flow-value');
    if (result.clogged) {
      flowVal.textContent = '∞';
    } else {
      flowVal.textContent = result.flowTime + ' ' + I18n.t('seconds');
    }
  }

  function hideDashboard() {
    dashboard.classList.add('hidden');
    document.querySelector('.lab-layout').classList.remove('with-dashboard');
  }

  /* =====================================================
     SCENARIO
     ===================================================== */
  function setScenario(s) {
    currentScenario = s;
    clearLayers();

    // Set reservoir color
    const reservoir = document.getElementById('water-reservoir');
    reservoir.className = 'water-reservoir';
    reservoir.classList.add('scenario-' + s);

    // Update task name
    const taskName = document.getElementById('task-name');
    taskName.textContent = s === 'A' ? I18n.t('scenarioATitle') : I18n.t('scenarioBTitle');
  }

  function getScenario() { return currentScenario; }
  function getLayers()    { return [...layers]; }
  function getLastResult(){ return lastResult; }

  return { init, setScenario, getScenario, getLayers, getLastResult, clearLayers };
})();
