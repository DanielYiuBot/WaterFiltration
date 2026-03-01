/* ============================================================
   app.js – ClearWater Lab  Main Application Controller
   ============================================================ */

(function () {
  'use strict';

  const backBtn = document.getElementById('back-btn');

  /* ---------- Scenario selection ---------- */
  document.querySelectorAll('.scenario-card').forEach(card => {
    const handler = () => {
      const scenario = card.dataset.scenario;

      if (Experiment.isScenarioDone(scenario)) {
        return;
      }

      Lab.setScenario(scenario);
      Experiment.showScreen('lab-screen');
    };

    card.addEventListener('click', handler);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  });

  /* ---------- Back to scenarios ---------- */
  backBtn.addEventListener('click', () => {
    Lab.clearLayers();
    Experiment.showScreen('landing-screen');
    _updateScenarioCards();
  });

  /* ---------- Update scenario cards with completion state ---------- */
  function _updateScenarioCards() {
    document.querySelectorAll('.scenario-card').forEach(card => {
      const s = card.dataset.scenario;
      if (Experiment.isScenarioDone(s)) {
        card.classList.add('scenario-done');
        const btn = card.querySelector('.btn-primary');
        if (btn) btn.textContent = s === 'A'
          ? I18n.t('scenarioAComplete')
          : I18n.t('scenarioBComplete');
      }
    });

    if (Experiment.areBothScenariosDone()) {
      let proceedBtn = document.getElementById('proceed-posttest-btn');
      if (!proceedBtn) {
        proceedBtn = document.createElement('button');
        proceedBtn.id = 'proceed-posttest-btn';
        proceedBtn.className = 'btn btn-primary btn-lg';
        proceedBtn.style.margin = '20px auto';
        proceedBtn.style.display = 'block';
        proceedBtn.textContent = I18n.t('finishExperimentBtn');
        proceedBtn.addEventListener('click', () => {
          Experiment.goToPostTest();
        });
        const grid = document.querySelector('.scenario-grid');
        grid.parentNode.insertBefore(proceedBtn, grid.nextSibling);
      }
    }
  }

  /* ---------- Language toggle re-render hook ---------- */
  const origApply = I18n.applyI18n;
  I18n.applyI18n = function () {
    origApply();
    if (Lab.getScenario()) {
      const taskName = document.getElementById('task-name');
      const s = Lab.getScenario();
      taskName.textContent = s === 'A' ? I18n.t('scenarioATitle') : I18n.t('scenarioBTitle');
    }
    if (window.DrH2OElement) {
      window.DrH2OElement.updatePlaceholders();
    }
    _updateConsentBody();
    _updateInstructionsBody();
    _updateScenarioCards();
  };

  /* ---------- Populate consent & instructions text ---------- */
  function _updateConsentBody() {
    const el = document.getElementById('consent-body');
    if (el) {
      el.textContent = I18n.t('consentText');
      el.style.whiteSpace = 'pre-line';
    }
  }

  function _updateInstructionsBody() {
    const el = document.getElementById('instructions-body');
    if (el) {
      el.textContent = I18n.t('instructionsText');
      el.style.whiteSpace = 'pre-line';
    }
  }

  /* ---------- Init ---------- */
  Lab.init();
  I18n.applyI18n();
  _updateConsentBody();
  _updateInstructionsBody();
  Experiment.init();

  /* Expose for lab.js to call */
  window.AppUpdateScenarioCards = _updateScenarioCards;
})();
