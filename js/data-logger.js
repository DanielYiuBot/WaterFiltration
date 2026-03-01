/* ============================================================
   data-logger.js – ClearWater Lab  Experiment Data Collection
   ============================================================ */

const DataLogger = (() => {
  let _data = {
    participantId: '',
    group: '',              // 'ai' or 'control'
    language: '',
    sessionStartTime: null,
    sessionEndTime: null,

    preTest: {
      answers: {},          // { q1: 'a', q2: 'c', ... }
      score: 0,
      maxScore: 0,
      startTime: null,
      endTime: null,
    },

    postTest: {
      answers: {},
      score: 0,
      maxScore: 0,
      startTime: null,
      endTime: null,
    },

    scenarios: {
      A: { attempts: [], completed: false },
      B: { attempts: [], completed: false },
    },

    chatLogs: [],           // [{ timestamp, role, text }, ...]
  };

  function init(participantId, group) {
    _data.participantId = participantId;
    _data.group = group;
    _data.language = I18n.getLang();
    _data.sessionStartTime = new Date().toISOString();
  }

  function logPreTest(answers, score, maxScore) {
    _data.preTest.answers = { ...answers };
    _data.preTest.score = score;
    _data.preTest.maxScore = maxScore;
    _data.preTest.endTime = new Date().toISOString();
  }

  function startPreTest() {
    _data.preTest.startTime = new Date().toISOString();
  }

  function logPostTest(answers, score, maxScore) {
    _data.postTest.answers = { ...answers };
    _data.postTest.score = score;
    _data.postTest.maxScore = maxScore;
    _data.postTest.endTime = new Date().toISOString();
  }

  function startPostTest() {
    _data.postTest.startTime = new Date().toISOString();
  }

  function logAttempt(scenario, result) {
    const attempt = {
      timestamp: new Date().toISOString(),
      layers: [...result.layers],
      turbidity: result.turbidity,
      clarity: result.clarity,
      odor: result.odor,
      odorLevel: result.odorLevel,
      flowTime: result.flowTime,
      clogged: result.clogged,
      score: result.score,
    };

    _data.scenarios[scenario].attempts.push(attempt);
    _save();
  }

  function markScenarioComplete(scenario) {
    _data.scenarios[scenario].completed = true;
    _save();
  }

  function getAttemptCount(scenario) {
    return _data.scenarios[scenario].attempts.length;
  }

  function isScenarioComplete(scenario) {
    return _data.scenarios[scenario].completed;
  }

  function logChatMessage(role, text) {
    _data.chatLogs.push({
      timestamp: new Date().toISOString(),
      role,
      text,
    });
  }

  function finishSession() {
    _data.sessionEndTime = new Date().toISOString();
    _save();
  }

  function getData() {
    return JSON.parse(JSON.stringify(_data));
  }

  function getFlatData() {
    const d = getData();
    const totalAttempts = d.scenarios.A.attempts.length + d.scenarios.B.attempts.length;
    const bestScoreA = d.scenarios.A.attempts.length > 0
      ? Math.max(...d.scenarios.A.attempts.map(a => a.score)) : 0;
    const bestScoreB = d.scenarios.B.attempts.length > 0
      ? Math.max(...d.scenarios.B.attempts.map(a => a.score)) : 0;

    const sessionDuration = d.sessionStartTime && d.sessionEndTime
      ? Math.round((new Date(d.sessionEndTime) - new Date(d.sessionStartTime)) / 1000)
      : 0;

    return {
      participantId: d.participantId,
      group: d.group,
      language: d.language,
      sessionStartTime: d.sessionStartTime,
      sessionEndTime: d.sessionEndTime,
      sessionDurationSec: sessionDuration,

      preTestScore: d.preTest.score,
      preTestMaxScore: d.preTest.maxScore,
      preTestAnswers: JSON.stringify(d.preTest.answers),

      postTestScore: d.postTest.score,
      postTestMaxScore: d.postTest.maxScore,
      postTestAnswers: JSON.stringify(d.postTest.answers),

      learningGain: d.postTest.score - d.preTest.score,

      scenarioAAttempts: d.scenarios.A.attempts.length,
      scenarioBAttempts: d.scenarios.B.attempts.length,
      totalAttempts,
      bestScoreA,
      bestScoreB,

      scenarioADetails: JSON.stringify(d.scenarios.A.attempts),
      scenarioBDetails: JSON.stringify(d.scenarios.B.attempts),

      chatLogCount: d.chatLogs.length,
      chatLogs: JSON.stringify(d.chatLogs),
    };
  }

  function downloadCSV() {
    const flat = getFlatData();
    const headers = Object.keys(flat);
    const values = headers.map(h => {
      const v = String(flat[h]);
      return '"' + v.replace(/"/g, '""') + '"';
    });
    const csv = headers.join(',') + '\n' + values.join(',');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clearwater_${_data.participantId}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJSON() {
    const json = JSON.stringify(getData(), null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clearwater_${_data.participantId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* Auto-save to localStorage as backup */
  function _save() {
    try {
      localStorage.setItem('clearwater_data_' + _data.participantId, JSON.stringify(_data));
    } catch (e) { /* ignore */ }
  }

  /**
   * Submit data to a Google Form.
   * RESEARCHER: Replace GOOGLE_FORM_URL and field entry IDs with your own.
   * See README for setup instructions.
   */
  async function submitToGoogleForm() {
    const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfM5ofopfcZUaJ7QLDrAdOuORKfI7MeiV0HgS2zR4FGZy9dQg/formResponse';

    if (GOOGLE_FORM_URL === 'YOUR_GOOGLE_FORM_URL_HERE') {
      console.warn('[DataLogger] Google Form URL not configured. Skipping submission.');
      return false;
    }

    const flat = getFlatData();

    const formData = new URLSearchParams();
    formData.append('entry.103577797',  flat.participantId);
    formData.append('entry.871655434',  flat.group);
    formData.append('entry.130534101',  flat.language);
    formData.append('entry.1082703810', flat.sessionStartTime);
    formData.append('entry.381375574',  flat.sessionEndTime);
    formData.append('entry.1156566626', String(flat.sessionDurationSec));
    formData.append('entry.704301771',  String(flat.preTestScore));
    formData.append('entry.19248783',   String(flat.preTestMaxScore));
    formData.append('entry.1183941190', flat.preTestAnswers);
    formData.append('entry.1244706623', String(flat.postTestScore));
    formData.append('entry.124527542',  String(flat.postTestMaxScore));
    formData.append('entry.1632967581', flat.postTestAnswers);
    formData.append('entry.101429895',  String(flat.learningGain));
    formData.append('entry.753595185',  String(flat.scenarioAAttempts));
    formData.append('entry.1032364199', String(flat.scenarioBAttempts));
    formData.append('entry.1925892085', String(flat.totalAttempts));
    formData.append('entry.91880466',   String(flat.bestScoreA));
    formData.append('entry.1380014986', String(flat.bestScoreB));
    formData.append('entry.889834511',  flat.scenarioADetails);
    formData.append('entry.1878177482', flat.scenarioBDetails);
    formData.append('entry.1604191968', String(flat.chatLogCount));
    formData.append('entry.1758189449', flat.chatLogs);

    try {
      await fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      });
      console.log('[DataLogger] Google Form submitted.');
      return true;
    } catch (e) {
      console.error('[DataLogger] Google Form submission failed:', e);
      return false;
    }
  }

  return {
    init,
    startPreTest,
    logPreTest,
    startPostTest,
    logPostTest,
    logAttempt,
    markScenarioComplete,
    getAttemptCount,
    isScenarioComplete,
    logChatMessage,
    finishSession,
    getData,
    getFlatData,
    downloadCSV,
    downloadJSON,
    submitToGoogleForm,
  };
})();

window.DataLogger = DataLogger;
