/* ============================================================
   experiment.js – ClearWater Lab V2 Flow Manager
   ============================================================ */

const Experiment = (() => {
  'use strict';

  const TASK2_UNLOCK_CODE = '2026';
  const MIN_TASK2_TRIALS = 3;
  let _participantId = '';
  let _group = '';
  let _currentStep = 'login-screen';

  function assignGroup(id) {
    let hash = 0;
    const normalized = id.trim().toUpperCase();
    for (let i = 0; i < normalized.length; i++) {
      hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 2 === 0) ? 'ai' : 'control';
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    _currentStep = id;

    const backBtn = document.getElementById('back-btn');
    if (id === 'lab-screen') {
      backBtn.classList.remove('hidden');
    } else {
      backBtn.classList.add('hidden');
    }

    updateChatbotVisibility(id);
    window.scrollTo(0, 0);
  }

  function updateChatbotVisibility(screenId) {
    const chatbot = document.querySelector('dr-h2o');
    if (!chatbot) return;
    const visible = screenId === 'task1-screen' || screenId === 'task1-demo-screen' || screenId === 'lab-screen';
    chatbot.style.display = visible ? '' : 'none';
  }

  function init() {
    setupLogin();
    setupInstructions();
    setupCodeLock();
    setupCompletion();

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
      _group = assignGroup(id);
      DataLogger.init(_participantId, _group);
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
      showScreen('lab-screen');
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

  function setupCompletion() {
    const dlBtn = document.getElementById('download-data-btn');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => DataLogger.downloadJSON());
    }
  }

  function goToCodeLock() {
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

  function finishExperiment() {
    DataLogger.finishSession();
    const data = DataLogger.getData();
    document.getElementById('completion-id-val').textContent = data.participantId;
    document.getElementById('completion-group-val').textContent =
      data.group === 'ai' ? I18n.t('groupAI') : I18n.t('groupControl');
    document.getElementById('completion-task1-val').textContent =
      data.task1.completedAt ? I18n.t('statusDone') : I18n.t('statusPending');
    document.getElementById('completion-task2-val').textContent =
      data.task2.completedAt ? I18n.t('statusDone') : `${data.task2.attempts.length}`;
    showScreen('completion-screen');
  }

  function getTask2UnlockCode() {
    return TASK2_UNLOCK_CODE;
  }

  function getGroup() {
    return _group;
  }

  function getTask2AttemptCount() {
    return DataLogger.getData().task2.attempts.length;
  }

  function canCompleteTask2() {
    return getTask2AttemptCount() >= MIN_TASK2_TRIALS;
  }

  return {
    init,
    showScreen,
    assignGroup,
    goToCodeLock,
    onTask1RankingAttempt,
    onTask1Hint,
    onTask1Completed,
    onTask1DemoCompleted,
    onTask2FilterComplete,
    completeTask2,
    getTask2AttemptCount,
    canCompleteTask2,
    getTask2UnlockCode,
    getGroup,
  };
})();

window.Experiment = Experiment;
