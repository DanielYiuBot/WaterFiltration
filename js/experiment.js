/* ============================================================
   experiment.js – Experiment Flow Manager
   ============================================================
   Controls the entire experiment sequence:
   login → consent → pretest → instructions → lab (A then B) → posttest → completion
*/

const Experiment = (() => {
  'use strict';

  const MIN_ATTEMPTS_PER_SCENARIO = 2;

  const STEPS = [
    'login-screen',
    'consent-screen',
    'pretest-screen',
    'instructions-screen',
    'landing-screen',
    'lab-screen',
    'posttest-screen',
    'completion-screen',
  ];

  let _participantId = '';
  let _group = '';  // 'ai' or 'control'
  let _currentStep = 'login-screen';
  let _scenariosDone = { A: false, B: false };

  /* ---- Group assignment ----
     Uses deterministic hashing: odd hash → ai, even → control.
     This ensures the same ID always gets the same group,
     even if the student refreshes.
  */
  function assignGroup(id) {
    let hash = 0;
    const normalized = id.trim().toUpperCase();
    for (let i = 0; i < normalized.length; i++) {
      hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 2 === 0) ? 'ai' : 'control';
  }

  /* ---- Screen navigation ---- */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    _currentStep = id;

    const backBtn = document.getElementById('back-btn');
    if (id === 'lab-screen') {
      backBtn.classList.remove('hidden');
    } else {
      backBtn.classList.add('hidden');
    }

    _updateChatbotVisibility(id);
    window.scrollTo(0, 0);
  }

  function _updateChatbotVisibility(screenId) {
    const chatbot = document.querySelector('dr-h2o');
    if (!chatbot) return;

    const labScreens = screenId === 'lab-screen' || screenId === 'landing-screen';
    const isAIGroup = _group === 'ai';

    if (labScreens && isAIGroup) {
      chatbot.style.display = '';
    } else {
      chatbot.style.display = 'none';
    }
  }

  /* ---- Init: bind all experiment UI events ---- */
  function init() {
    _setupLogin();
    _setupConsent();
    _setupTests();
    _setupInstructions();
    _setupCompletion();
    _setupScenarioProgress();

    const chatbot = document.querySelector('dr-h2o');
    if (chatbot) chatbot.style.display = 'none';

    showScreen('login-screen');
  }

  /* ========== LOGIN ========== */
  function _setupLogin() {
    const btn = document.getElementById('login-btn');
    const input = document.getElementById('login-id-input');
    const err = document.getElementById('login-error');

    const doLogin = () => {
      const id = input.value.trim();
      if (!id || id.length < 1) {
        err.classList.remove('hidden');
        return;
      }
      err.classList.add('hidden');
      _participantId = id;
      _group = assignGroup(id);

      DataLogger.init(_participantId, _group);

      console.log(`[Experiment] ID: ${_participantId}, Group: ${_group}`);
      showScreen('consent-screen');
    };

    btn.addEventListener('click', doLogin);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });
  }

  /* ========== CONSENT ========== */
  function _setupConsent() {
    const btn = document.getElementById('consent-btn');
    const cb = document.getElementById('consent-checkbox');

    btn.addEventListener('click', () => {
      if (!cb.checked) {
        cb.parentElement.style.color = 'var(--color-red)';
        setTimeout(() => cb.parentElement.style.color = '', 2000);
        return;
      }
      DataLogger.startPreTest();
      showScreen('pretest-screen');
      _renderTest('pretest');
    });
  }

  /* ========== TESTS ========== */
  function _setupTests() {
    document.getElementById('pretest-submit').addEventListener('click', () => {
      _submitTest('pretest');
    });
    document.getElementById('posttest-submit').addEventListener('click', () => {
      _submitTest('posttest');
    });
  }

  function _renderTest(type) {
    const container = document.getElementById(type + '-questions');
    container.innerHTML = '';
    const questions = type === 'pretest' ? TestQuestions.preTest : TestQuestions.postTest;
    const lang = I18n.getLang();

    questions.forEach((q, idx) => {
      const div = document.createElement('div');
      div.className = 'test-question';

      const label = I18n.t('questionLabel').replace('{n}', idx + 1);
      div.innerHTML = `
        <h4 class="question-number">${label}</h4>
        <p class="question-text">${q.question[lang] || q.question.en}</p>
        <div class="question-options" data-qid="${q.id}">
          ${Object.entries(q.options).map(([key, val]) => `
            <label class="option-label">
              <input type="radio" name="${q.id}" value="${key}" />
              <span class="option-key">${key}</span>
              <span class="option-text">${val[lang] || val.en}</span>
            </label>
          `).join('')}
        </div>
      `;
      container.appendChild(div);
    });
  }

  function _submitTest(type) {
    const questions = type === 'pretest' ? TestQuestions.preTest : TestQuestions.postTest;
    const answers = {};
    let allAnswered = true;

    for (const q of questions) {
      const selected = document.querySelector(`input[name="${q.id}"]:checked`);
      if (selected) {
        answers[q.id] = selected.value;
      } else {
        allAnswered = false;
      }
    }

    const errEl = document.getElementById(type + '-error');
    if (!allAnswered) {
      errEl.classList.remove('hidden');
      return;
    }
    errEl.classList.add('hidden');

    const { score, maxScore } = TestQuestions.gradeTest(type === 'pretest' ? 'preTest' : 'postTest', answers);

    if (type === 'pretest') {
      DataLogger.logPreTest(answers, score, maxScore);
      showScreen('instructions-screen');
    } else {
      DataLogger.logPostTest(answers, score, maxScore);
      _finishExperiment();
    }
  }

  /* ========== INSTRUCTIONS ========== */
  function _setupInstructions() {
    document.getElementById('instructions-btn').addEventListener('click', () => {
      showScreen('landing-screen');
    });
  }

  /* ========== SCENARIO PROGRESS ========== */
  function _setupScenarioProgress() {
    const progressBar = document.getElementById('scenario-progress');
    if (!progressBar) return;
  }

  function onScenarioSelected(scenario) {
    showScreen('lab-screen');
  }

  function onFilterComplete(scenario, result) {
    DataLogger.logAttempt(scenario, result);
    _updateProgressUI();
  }

  function getMinAttemptsRemaining(scenario) {
    const count = DataLogger.getAttemptCount(scenario);
    return Math.max(0, MIN_ATTEMPTS_PER_SCENARIO - count);
  }

  function canProceedFromScenario(scenario) {
    return DataLogger.getAttemptCount(scenario) >= MIN_ATTEMPTS_PER_SCENARIO;
  }

  function markScenarioDone(scenario) {
    _scenariosDone[scenario] = true;
    DataLogger.markScenarioComplete(scenario);
    _updateProgressUI();
  }

  function isScenarioDone(scenario) {
    return _scenariosDone[scenario];
  }

  function areBothScenariosDone() {
    return _scenariosDone.A && _scenariosDone.B;
  }

  function goToPostTest() {
    DataLogger.startPostTest();
    showScreen('posttest-screen');
    _renderTest('posttest');
  }

  function _updateProgressUI() {
    const progressEl = document.getElementById('scenario-progress');
    if (!progressEl) return;

    const attA = DataLogger.getAttemptCount('A');
    const attB = DataLogger.getAttemptCount('B');

    const statusA = document.getElementById('progress-a');
    const statusB = document.getElementById('progress-b');

    if (statusA) {
      if (_scenariosDone.A) {
        statusA.textContent = I18n.t('scenarioAComplete');
        statusA.className = 'progress-item done';
      } else {
        statusA.textContent = `A: ${I18n.t('attemptsCount').replace('{n}', attA)}`;
        statusA.className = 'progress-item';
      }
    }
    if (statusB) {
      if (_scenariosDone.B) {
        statusB.textContent = I18n.t('scenarioBComplete');
        statusB.className = 'progress-item done';
      } else {
        statusB.textContent = `B: ${I18n.t('attemptsCount').replace('{n}', attB)}`;
        statusB.className = 'progress-item';
      }
    }
  }

  /* ========== COMPLETION ========== */
  function _setupCompletion() {
    const dlBtn = document.getElementById('download-data-btn');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        DataLogger.downloadJSON();
      });
    }
  }

  function _finishExperiment() {
    DataLogger.finishSession();

    const data = DataLogger.getData();

    document.getElementById('completion-id-val').textContent = data.participantId;
    document.getElementById('completion-group-val').textContent =
      data.group === 'ai' ? I18n.t('groupAI') : I18n.t('groupControl');
    document.getElementById('completion-pre-val').textContent =
      `${data.preTest.score} / ${data.preTest.maxScore}`;
    document.getElementById('completion-post-val').textContent =
      `${data.postTest.score} / ${data.postTest.maxScore}`;

    showScreen('completion-screen');

    DataLogger.submitToGoogleForm();
  }

  function getParticipantId() { return _participantId; }
  function getGroup() { return _group; }

  return {
    init,
    showScreen,
    assignGroup,
    onScenarioSelected,
    onFilterComplete,
    getMinAttemptsRemaining,
    canProceedFromScenario,
    markScenarioDone,
    isScenarioDone,
    areBothScenariosDone,
    goToPostTest,
    getParticipantId,
    getGroup,
  };
})();

window.Experiment = Experiment;
