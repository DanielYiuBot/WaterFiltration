/* ============================================================
  lab.js – ClearWater Lab V2 Task 2 (Muddy River)
  ============================================================ */

const Lab = (() => {
  const MAX_MATERIALS = 4;
  let layers = [];
  let isFiltering = false;
  let lastResult = null;
  let bottleLayers;
  let bottle;
  let btnFilter;
  let btnClear;
  let btnFinishTask2;
  let dashboard;
  let trialStatus;

  function init() {
    bottleLayers = document.getElementById('bottle-layers');
    bottle = document.getElementById('bottle');
    btnFilter = document.getElementById('btn-filter');
    btnClear = document.getElementById('btn-clear');
    btnFinishTask2 = document.getElementById('btn-finish-task2');
    dashboard = document.getElementById('dashboard');
    trialStatus = document.getElementById('task2-trial-status');

    setupDragAndDrop();
    setupButtons();
    resetTask2State();
  }

  function getLabDropTarget(clientX, clientY) {
    const els = document.elementsFromPoint(clientX, clientY);
    for (let i = 0; i < els.length; i++) {
      const node = els[i];
      if (node.classList?.contains('pointer-dnd-ghost')) continue;
      if (node.closest?.('#bottle')) return { kind: 'bottle' };
    }
    return null;
  }

  function labPointerHover(t) {
    bottle.classList.toggle('drag-over', !!(t && t.kind === 'bottle'));
  }

  function labPointerDrop(material, target) {
    bottle.classList.remove('drag-over');
    if (!target || target.kind !== 'bottle' || !material) return;
    if (isFiltering) return;
    addLayer(material);
  }

  function setupDragAndDrop() {
    document.querySelectorAll('#lab-screen .material-card[draggable]').forEach((card) => {
      card.addEventListener('dragstart', onDragStart);
      card.addEventListener('dragend', onDragEnd);
      card.addEventListener('click', () => {
        if (isFiltering) return;
        addLayer(card.dataset.material);
      });

      if (window.PointerDnD) {
        window.PointerDnD.attach(card, {
          canStart: () => !isFiltering,
          getPayload: () => card.dataset.material,
          getDropTarget: getLabDropTarget,
          onDrop: labPointerDrop,
          onHoverChange: labPointerHover,
        });
      }
    });

    bottle.addEventListener('dragover', onDragOver);
    bottle.addEventListener('dragenter', onDragEnter);
    bottle.addEventListener('dragleave', onDragLeave);
    bottle.addEventListener('drop', onDrop);
  }

  function onDragStart(e) {
    if (isFiltering) {
      e.preventDefault();
      return;
    }
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
    if (!bottle.contains(e.relatedTarget)) bottle.classList.remove('drag-over');
  }

  function onDrop(e) {
    e.preventDefault();
    bottle.classList.remove('drag-over');
    if (isFiltering) return;
    const mat = e.dataTransfer.getData('text/plain');
    if (mat) addLayer(mat);
  }

  function setupButtons() {
    btnFilter.addEventListener('click', startFiltering);
    btnClear.addEventListener('click', clearLayers);
    const btnTryAgain = document.getElementById('btn-try-again');
    if (btnTryAgain) btnTryAgain.addEventListener('click', clearLayers);
    if (btnFinishTask2) {
      btnFinishTask2.addEventListener('click', () => {
        Experiment.completeTask2();
      });
    }
  }

  function addLayer(material) {
    if (layers.length >= MAX_MATERIALS) {
      showTask2Message(I18n.t('task2MaxMaterials'), 'error');
      return;
    }
    layers.unshift(material);
    renderLayers();
    hideDashboard();
    if (btnFinishTask2) btnFinishTask2.classList.add('hidden');
    updateTrialStatus();
  }

  function removeLayer(index) {
    if (isFiltering) return;
    layers.splice(index, 1);
    renderLayers();
    hideDashboard();
    if (btnFinishTask2) btnFinishTask2.classList.add('hidden');
    updateTrialStatus();
  }

  function clearLayers() {
    layers = [];
    renderLayers();
    hideDashboard();
    Animation.resetAnimation();
    if (btnFinishTask2) btnFinishTask2.classList.add('hidden');
    updateTrialStatus();
  }

  function resetTask2State() {
    clearLayers();
    const reservoir = document.getElementById('water-reservoir');
    reservoir.className = 'water-reservoir scenario-A';
  }

  function renderLayers() {
    bottleLayers.querySelectorAll('.filter-layer').forEach((el) => el.remove());
    const ph = bottleLayers.querySelector('.placeholder-text');
    if (ph) ph.style.display = layers.length === 0 ? '' : 'none';

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
      removeBtn.textContent = 'x';
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

  async function startFiltering() {
    if (isFiltering || layers.length === 0) return;

    if (layers.length !== MAX_MATERIALS) {
      showTask2Message(I18n.t('task2NeedFourWorksheet'), 'error');
      return;
    }

    if (!Scoring.classifyTask2Variant(layers)) {
      showTask2Message(I18n.t('task2NotWorksheetOrder'), 'error');
      return;
    }

    isFiltering = true;
    btnFilter.disabled = true;
    btnFilter.textContent = I18n.t('filtering');
    if (btnClear) btnClear.classList.add('hidden');

    Animation.resetAnimation();
    const result = Scoring.computeFilterResult(layers);
    lastResult = result;

    await Animation.runFilterAnimation(layers, result);
    showDashboard(result);
    Experiment.onTask2FilterComplete(result);

    if (window.DrH2OElement && window.Experiment && Experiment.isTask2Screen()) {
      window.DrH2OElement.onFilterComplete(result);
    }

    isFiltering = false;
    btnFilter.disabled = false;
    btnFilter.textContent = I18n.t('startFilter');
    if (btnClear) btnClear.classList.remove('hidden');
    updateTrialStatus();
  }

  function showDashboard(result) {
    dashboard.classList.remove('hidden');
    document.querySelector('.lab-layout').classList.add('with-dashboard');
    const turbFill = document.getElementById('turbidity-fill');
    const turbVal = document.getElementById('turbidity-value');
    turbFill.style.width = `${result.clarity}%`;
    turbVal.textContent = `${result.clarity}%`;

    const flowVal = document.getElementById('flow-value');
    flowVal.textContent = result.clogged ? '∞' : `${result.flowTime} ${I18n.t('seconds')}`;
  }

  function hideDashboard() {
    dashboard.classList.add('hidden');
    document.querySelector('.lab-layout').classList.remove('with-dashboard');
  }

  function getLastResult() {
    return lastResult;
  }

  function showTask2Message(message, type) {
    if (!trialStatus) return;
    trialStatus.textContent = message;
    trialStatus.className = `task2-trial-status ${type || ''}`.trim();
  }

  function updateTrialStatus() {
    if (!trialStatus || !window.Experiment) return;

    const count = Experiment.getTask2AttemptCount();
    const canFinish = Experiment.canCompleteTask2();
    trialStatus.textContent = canFinish
      ? I18n.t('task2Ready')
      : I18n.t('task2TrialStatus').replace(/\{done\}/g, String(count));
    trialStatus.className = `task2-trial-status${canFinish ? ' ready' : ''}`;

    if (btnFinishTask2) {
      btnFinishTask2.classList.toggle('hidden', !canFinish);
      btnFinishTask2.disabled = !canFinish;
    }
  }

  return {
    init,
    clearLayers,
    resetTask2State,
    getLastResult,
    updateTrialStatus,
  };
})();
