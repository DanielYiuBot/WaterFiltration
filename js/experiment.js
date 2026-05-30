/* ============================================================
   experiment.js – ClearWater Lab V2 Flow Manager
   ============================================================ */

const Experiment = (() => {
  'use strict';

  const TASK2_UNLOCK_CODE = '2026';
  const MIN_TASK2_TRIALS = 3;
  /** Task 2 UI lives in this section; Dr. H2O is only visible here (not Task 1 or other screens). */
  const TASK2_SCREEN_ID = 'lab-screen';
  let _participantId = '';
  let _currentStep = 'login-screen';

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    _currentStep = id;

    const backBtn = document.getElementById('back-btn');
    if (id === TASK2_SCREEN_ID) {
      backBtn.classList.remove('hidden');
    } else {
      backBtn.classList.add('hidden');
    }

    updateChatbotVisibility(id);
    if (id === TASK2_SCREEN_ID && window.Lab && typeof Lab.updateTrialStatus === 'function') {
      Lab.updateTrialStatus();
    }
    if (id === 'completion-screen') {
      updateCompletionSummary();
    }
    window.scrollTo(0, 0);
  }

  function updateChatbotVisibility(screenId) {
    const chatbot = document.querySelector('dr-h2o');
    if (!chatbot) return;
    const visible = screenId === TASK2_SCREEN_ID;
    if (!visible && window.DrH2OElement) {
      window.DrH2OElement.collapse();
    }
    chatbot.style.display = visible ? '' : 'none';
  }

  function init() {
    setupLogin();
    setupInstructions();
    setupCodeLock();

    const chatbot = document.querySelector('dr-h2o');
    if (chatbot) chatbot.style.display = 'none';

    showScreen('login-screen');
  }

  function setupLogin() {
    const btn = document.getElementById('login-btn');
    const input = document.getElementById('login-id-input');
    const err = document.getElementById('login-error');

    const doLogin = () => {
      const id = input.value.trim();
      if (!id) {
        err.classList.remove('hidden');
        return;
      }
      err.classList.add('hidden');
      _participantId = id;
      DataLogger.init(_participantId);
      showScreen('instructions-screen');
    };

    btn.addEventListener('click', doLogin);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doLogin();
    });
  }

  function setupInstructions() {
    const btn = document.getElementById('instructions-btn');
    if (btn) {
      btn.addEventListener('click', () => showScreen('task1-screen'));
    }
  }

  function setupCodeLock() {
    const btn = document.getElementById('code-lock-btn');
    const backBtn = document.getElementById('code-lock-back-btn');
    const input = document.getElementById('code-lock-input');
    const err = document.getElementById('code-lock-error');
    if (!btn || !input || !err) return;

    const unlock = () => {
      const code = input.value.trim();
      const success = code.toUpperCase() === TASK2_UNLOCK_CODE;
      DataLogger.logCodeAttempt(code, success);
      if (!success) {
        err.classList.remove('hidden');
        return;
      }
      err.classList.add('hidden');
      DataLogger.markCodeUnlocked();
      Lab.resetTask2State();
      showScreen(TASK2_SCREEN_ID);
    };

    btn.addEventListener('click', unlock);
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        err.classList.add('hidden');
        showScreen('task1-demo-screen');
      });
    }
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') unlock();
    });
  }

  function goToCodeLock() {
    const input = document.getElementById('code-lock-input');
    if (input) input.value = TASK2_UNLOCK_CODE;
    showScreen('code-screen');
  }

  function onTask1RankingAttempt(payload) {
    DataLogger.logTask1RankingAttempt(payload);
  }

  function onTask1Hint(payload) {
    DataLogger.logTask1Hint(payload);
  }

  function onTask1Completed(order) {
    DataLogger.markTask1RankingComplete(order);
  }

  function onTask1DemoCompleted(demoResults) {
    DataLogger.logTask1DemoRun(demoResults);
  }

  function onTask2FilterComplete(result) {
    DataLogger.logTask2Attempt(result);
    return getTask2AttemptCount();
  }

  function completeTask2() {
    if (!canCompleteTask2()) return false;
    DataLogger.markTask2Complete();
    finishExperiment();
    return true;
  }

  function updateCompletionSummary() {
    const data = DataLogger.getData();
    const idEl = document.getElementById('completion-id-val');
    const t1 = document.getElementById('completion-task1-val');
    const t2 = document.getElementById('completion-task2-val');
    if (!idEl || !t1 || !t2) return;
    idEl.textContent = data.participantId;
    t1.textContent = data.task1.completedAt ? I18n.t('statusDone') : I18n.t('statusPending');
    t2.textContent = data.task2.completedAt ? I18n.t('statusDone') : `${data.task2.attempts.length}`;
  }

  function finishExperiment() {
    DataLogger.finishSession();
    try {
      DataLogger.trySubmitGoogleForm();
    } catch (err) {
      console.error('trySubmitGoogleForm failed (completion still proceeds)', err);
    }
    updateCompletionSummary();
    showScreen('completion-screen');
  }

  function getTask2UnlockCode() {
    return TASK2_UNLOCK_CODE;
  }

  function getTask2AttemptCount() {
    return DataLogger.getData().task2.attempts.length;
  }

  function canCompleteTask2() {
    return getTask2AttemptCount() >= MIN_TASK2_TRIALS;
  }

  function isTask2Screen() {
    return _currentStep === TASK2_SCREEN_ID;
  }

  return {
    init,
    showScreen,
    isTask2Screen,
    goToCodeLock,
    onTask1RankingAttempt,
    onTask1Hint,
    onTask1Completed,
    onTask1DemoCompleted,
    onTask2FilterComplete,
    completeTask2,
    getTask2AttemptCount,
    canCompleteTask2,
    updateCompletionSummary,
    getTask2UnlockCode,
  };
})();

window.Experiment = Experiment;
