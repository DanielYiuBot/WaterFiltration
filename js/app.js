/* ============================================================
  app.js – ClearWater Lab V2 Main Controller
  ============================================================ */

(function () {
  'use strict';

  const ORDER = ['gravel', 'pebble', 'sand', 'cotton'];
  const ranking = [null, null, null, null];
  const backBtn = document.getElementById('back-btn');
  const codeBtn = document.getElementById('task1-code-btn');
  const confirmBtn = document.getElementById('task1-confirm-btn');
  const clearBtn = document.getElementById('task1-clear-btn');
  const demoBtn = document.getElementById('task1-demo-btn');
  const readyEl = document.getElementById('task1-ready');
  const filtersWrap = document.getElementById('task1-filters');
  const feedbackEl = document.getElementById('ranking-feedback');
  const slots = [...document.querySelectorAll('.ranking-slot')];
  let task1Confirmed = false;
  let lastDemoResults = [];
  const GAP_RANK = { gravel: 4, pebble: 3, sand: 2, cotton: 1 };
  const INVERSION_HINT_KEYS = {
    'pebble>gravel': 'rankingPebbleBeforeGravel',
    'sand>gravel': 'rankingSandBeforeGravel',
    'sand>pebble': 'rankingSandBeforePebble',
    'cotton>gravel': 'rankingCottonBeforeGravel',
    'cotton>pebble': 'rankingCottonBeforePebble',
    'cotton>sand': 'rankingCottonBeforeSand',
  };

  function setupTask1() {
    const cards = [...document.querySelectorAll('.task1-material')];
    cards.forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        setDragPayload(e, { source: 'inventory', material: card.dataset.material });
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
      card.addEventListener('click', () => {
        const nextIdx = ranking.findIndex((v) => v === null);
        if (nextIdx !== -1) placeMaterial(card.dataset.material, nextIdx);
      });
    });

    const inventory = document.querySelector('.task1-inventory');
    if (inventory) {
      inventory.addEventListener('dragover', (e) => {
        e.preventDefault();
        inventory.classList.add('drag-over');
      });
      inventory.addEventListener('dragleave', () => inventory.classList.remove('drag-over'));
      inventory.addEventListener('drop', (e) => {
        e.preventDefault();
        inventory.classList.remove('drag-over');
        const payload = getDragPayload(e);
        if (payload.source === 'ranking') removeMaterialAt(payload.index);
      });
    }

    slots.forEach((slot) => {
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('drag-over');
      });
      slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        const payload = getDragPayload(e);
        const material = payload.material;
        const idx = Number(slot.dataset.index);
        if (!material || Number.isNaN(idx)) return;
        if (payload.source === 'ranking') {
          moveRankedMaterial(payload.index, idx);
        } else {
          placeMaterial(material, idx);
        }
      });
    });

    if (confirmBtn) confirmBtn.addEventListener('click', confirmRanking);
    if (clearBtn) clearBtn.addEventListener('click', clearRanking);
    if (demoBtn) {
      demoBtn.classList.add('hidden');
      demoBtn.addEventListener('click', runParallelDemo);
    }
    if (codeBtn) codeBtn.classList.add('hidden');
    if (codeBtn) {
      codeBtn.addEventListener('click', () => {
        Experiment.goToCodeLock();
      });
    }
  }

  function placeMaterial(material, index) {
    if (ranking.includes(material)) {
      showRankingFeedback(I18n.t('rankingDuplicate'), 'error');
      return;
    }
    if (ranking[index]) {
      showRankingFeedback(I18n.t('rankingSlotOccupied'), 'error');
      return;
    }

    ranking[index] = material;
    afterRankingChanged(true);
  }

  function moveRankedMaterial(fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const moving = ranking[fromIndex];
    if (!moving) return;

    const target = ranking[toIndex];
    ranking[toIndex] = moving;
    ranking[fromIndex] = target || null;
    afterRankingChanged(true);
  }

  function removeMaterialAt(index) {
    if (index < 0 || !ranking[index]) return;
    ranking[index] = null;
    afterRankingChanged(true);
  }

  function clearRanking() {
    ranking.fill(null);
    afterRankingChanged(false);
    showRankingFeedback(I18n.t('rankingFeedbackDefault'), '');
  }

  function afterRankingChanged(showImmediateHint) {
    task1Confirmed = false;
    if (codeBtn) codeBtn.classList.add('hidden');
    if (demoBtn) demoBtn.classList.add('hidden');
    if (readyEl) readyEl.classList.add('hidden');
    renderRanking();
    updateConfirmButton();

    const reminder = getWrongOrderReminders();
    if (showImmediateHint && reminder) {
      showRankingFeedback(reminder, 'error');
    } else {
      showRankingFeedback(I18n.t('rankingFeedbackDefault'), '');
    }
  }

  function renderRanking() {
    slots.forEach((slot, idx) => {
      slot.innerHTML = '';
      const current = ranking[idx];
      if (!current) {
        const text = document.createElement('span');
        const label = I18n.t('rankingSlot').replace('{n}', idx + 1);
        text.textContent = label;
        slot.appendChild(text);
        return;
      }

      const chip = document.createElement('div');
      chip.className = `rank-chip layer-${current}`;
      chip.textContent = I18n.t(current);
      chip.draggable = true;
      chip.addEventListener('dragstart', (e) => {
        setDragPayload(e, { source: 'ranking', material: current, index: idx });
        chip.classList.add('dragging');
      });
      chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
      chip.addEventListener('click', () => {
        if (task1Confirmed) return;
        removeMaterialAt(idx);
      });
      slot.appendChild(chip);
    });
  }

  function updateConfirmButton() {
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = I18n.t('startParallelDemo');
    }
    if (demoBtn) {
      demoBtn.textContent = I18n.t('proceedCodeLock');
      demoBtn.classList.toggle('hidden', !task1Confirmed);
    }
  }

  function confirmRanking() {
    if (ranking.some((mat) => mat === null)) {
      showRankingFeedback(I18n.t('rankingIncomplete'), 'error');
      return false;
    }

    const done = ORDER.every((mat, idx) => ranking[idx] === mat);
    Experiment.onTask1RankingAttempt({
      order: [...ranking],
      expectedOrder: [...ORDER],
      success: done,
    });

    if (!done) {
      showRankingFeedback(getWrongOrderReminders() || I18n.t('rankingWrongOrder'), 'error');
      Experiment.onTask1Hint({ order: [...ranking], expectedOrder: [...ORDER] });
      task1Confirmed = false;
      if (codeBtn) codeBtn.classList.add('hidden');
      if (demoBtn) demoBtn.classList.add('hidden');
      renderRanking();
      updateConfirmButton();
      return false;
    }

    task1Confirmed = true;
    if (readyEl) readyEl.classList.remove('hidden');
    if (confirmBtn) confirmBtn.classList.add('hidden');
    if (clearBtn) clearBtn.classList.add('hidden');
    showRankingFeedback(I18n.t('rankingReady'), 'success');
    Experiment.onTask1Completed([...ranking]);
    updateConfirmButton();
    return true;
  }

  async function runParallelDemo() {
    if (!demoBtn) return;
    if (!task1Confirmed) return;
    demoBtn.disabled = true;
    demoBtn.textContent = I18n.t('demoRunning');
    Experiment.showScreen('task1-demo-screen');
    if (filtersWrap) filtersWrap.classList.remove('hidden');
    if (codeBtn) codeBtn.classList.add('hidden');

    const materialResults = {};
    ORDER.forEach((mat) => {
      materialResults[mat] = Scoring.getTask1MaterialDemoResult(mat);
    });

    lastDemoResults = await Animation.runTask1ParallelDemo(materialResults);
    Experiment.onTask1DemoCompleted(lastDemoResults);
    if (task1Confirmed && codeBtn) codeBtn.classList.remove('hidden');
    demoBtn.textContent = I18n.t('proceedCodeLock');
    demoBtn.disabled = false;
    updateMiniScores();
  }

  function updateInstructionsBody() {
    const el = document.getElementById('instructions-body');
    if (!el) return;
    el.textContent = I18n.t('instructionsText');
    el.style.whiteSpace = 'pre-line';
  }

  function showRankingFeedback(message, type) {
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.className = `ranking-feedback ${type || ''}`.trim();
  }

  function getWrongOrderReminders() {
    const reminders = [];
    for (let i = 0; i < ranking.length - 1; i++) {
      for (let j = i + 1; j < ranking.length; j++) {
        const first = ranking[i];
        const later = ranking[j];
        if (!first || !later) continue;
        if (GAP_RANK[first] < GAP_RANK[later]) {
          reminders.push(
            I18n.t(INVERSION_HINT_KEYS[`${first}>${later}`] || 'rankingGapReminder')
              .replace('{small}', I18n.t(first))
              .replace('{large}', I18n.t(later))
          );
        }
      }
    }
    return reminders.join('\n');
  }

  function setDragPayload(e, payload) {
    const json = JSON.stringify(payload);
    e.dataTransfer.setData('application/json', json);
    e.dataTransfer.setData('text/plain', payload.material);
    e.dataTransfer.effectAllowed = 'move';
  }

  function getDragPayload(e) {
    const json = e.dataTransfer.getData('application/json');
    if (json) {
      try {
        return JSON.parse(json);
      } catch (err) {
        // Fall through to text payload.
      }
    }
    return {
      source: 'inventory',
      material: e.dataTransfer.getData('text/plain'),
    };
  }

  function setupNav() {
    backBtn.addEventListener('click', () => {
      Lab.clearLayers();
      Experiment.showScreen('task1-screen');
    });
  }

  const originalApply = I18n.applyI18n;
  I18n.applyI18n = function () {
    originalApply();
    updateInstructionsBody();
    renderRanking();
    if (feedbackEl) {
      if (feedbackEl.classList.contains('success')) {
        feedbackEl.textContent = I18n.t('rankingReady');
      } else if (!feedbackEl.classList.contains('error')) {
        feedbackEl.textContent = I18n.t('rankingFeedbackDefault');
      }
    }
    if (readyEl && !readyEl.classList.contains('hidden')) {
      readyEl.textContent = I18n.t('rankingReady');
    }
    updateConfirmButton();
    if (window.Lab && Lab.updateTrialStatus) {
      Lab.updateTrialStatus();
    }

    document.querySelectorAll('.mini-filter').forEach((card) => {
      const mat = card.dataset.material;
      const nameEl = card.querySelector('.mini-filter-name');
      if (nameEl && mat) nameEl.textContent = I18n.t(mat);
    });
    updateMiniScores();

    if (window.DrH2OElement) window.DrH2OElement.updatePlaceholders();
  };

  function updateMiniScores() {
    if (!lastDemoResults.length) return;
    lastDemoResults.forEach((result) => {
      const card = document.querySelector(`#task1-filters .mini-filter[data-material="${result.material}"]`);
      const score = card?.querySelector('.mini-score');
      if (!score || score.classList.contains('hidden')) return;
      score.textContent = `${I18n.t('clarityLabel')} ${result.clarity}% | ${I18n.t('speedLabel')} ${result.flowTime}${I18n.t('seconds')}`;
    });
  }

  Lab.init();
  setupTask1();
  setupNav();
  I18n.applyI18n();
  updateInstructionsBody();
  updateConfirmButton();
  Experiment.init();
})();
