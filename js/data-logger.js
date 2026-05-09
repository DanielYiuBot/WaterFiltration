/* ============================================================
  data-logger.js – ClearWater Lab V2 Data Collection
  ============================================================ */

const DataLogger = (() => {
  let _data = {
    participantId: '',
    group: '',
    language: '',
    sessionStartTime: null,
    sessionEndTime: null,
    task1: {
      rankingAttempts: [],
      hintEvents: [],
      correctOrder: [],
      completedAt: null,
      demoRuns: [],
    },
    codeLock: {
      attempts: [],
      unlockedAt: null,
    },
    task2: {
      attempts: [],
      completedAt: null,
    },
    chatLogs: [],
  };

  function init(participantId, group) {
    _data.participantId = participantId;
    _data.group = group;
    _data.language = I18n.getLang();
    _data.sessionStartTime = new Date().toISOString();
    _save();
  }

  function logTask1RankingAttempt(payload) {
    _data.task1.rankingAttempts.push({
      timestamp: new Date().toISOString(),
      ...payload,
    });
    _save();
  }

  function logTask1Hint(payload) {
    _data.task1.hintEvents.push({
      timestamp: new Date().toISOString(),
      ...payload,
    });
    _save();
  }

  function markTask1RankingComplete(order) {
    _data.task1.correctOrder = [...order];
    _data.task1.completedAt = new Date().toISOString();
    _save();
  }

  function logTask1DemoRun(results) {
    _data.task1.demoRuns.push({
      timestamp: new Date().toISOString(),
      results: [...results],
    });
    _save();
  }

  function logCodeAttempt(code, success) {
    _data.codeLock.attempts.push({
      timestamp: new Date().toISOString(),
      code,
      success,
    });
    _save();
  }

  function markCodeUnlocked() {
    _data.codeLock.unlockedAt = new Date().toISOString();
    _save();
  }

  function logTask2Attempt(result) {
    _data.task2.attempts.push({
      timestamp: new Date().toISOString(),
      layers: [...result.layers],
      turbidity: result.turbidity,
      clarity: result.clarity,
      flowTime: result.flowTime,
      clogged: result.clogged,
      score: result.score,
    });
    _save();
  }

  function markTask2Complete() {
    _data.task2.completedAt = new Date().toISOString();
    _save();
  }

  function logChatMessage(role, text) {
    _data.chatLogs.push({
      timestamp: new Date().toISOString(),
      role,
      text,
    });
    _save();
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
    const sessionDuration = d.sessionStartTime && d.sessionEndTime
      ? Math.round((new Date(d.sessionEndTime) - new Date(d.sessionStartTime)) / 1000)
      : 0;
    const task2Best = d.task2.attempts.length
      ? Math.max(...d.task2.attempts.map((a) => a.score))
      : 0;

    return {
      participantId: d.participantId,
      group: d.group,
      language: d.language,
      sessionStartTime: d.sessionStartTime,
      sessionEndTime: d.sessionEndTime,
      sessionDurationSec: sessionDuration,
      task1Completed: !!d.task1.completedAt,
      task1CompletedAt: d.task1.completedAt || '',
      task1RankingAttempts: d.task1.rankingAttempts.length,
      task1Hints: d.task1.hintEvents.length,
      task1CorrectOrder: JSON.stringify(d.task1.correctOrder),
      task1DemoRuns: d.task1.demoRuns.length,
      codeAttempts: d.codeLock.attempts.length,
      codeUnlocked: !!d.codeLock.unlockedAt,
      codeUnlockedAt: d.codeLock.unlockedAt || '',
      task2Attempts: d.task2.attempts.length,
      task2BestScore: task2Best,
      task2Completed: !!d.task2.completedAt,
      task2CompletedAt: d.task2.completedAt || '',
      task2Details: JSON.stringify(d.task2.attempts),
      chatLogCount: d.chatLogs.length,
      chatLogs: JSON.stringify(d.chatLogs),
    };
  }

  function downloadCSV() {
    const flat = getFlatData();
    const headers = Object.keys(flat);
    const values = headers.map((h) => {
      const v = String(flat[h]);
      return `"${v.replace(/"/g, '""')}"`;
    });
    const csv = `${headers.join(',')}\n${values.join(',')}`;
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clearwater_v2_${_data.participantId}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJSON() {
    const json = JSON.stringify(getData(), null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clearwater_v2_${_data.participantId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function _save() {
    try {
      localStorage.setItem(`clearwater_v2_data_${_data.participantId}`, JSON.stringify(_data));
    } catch (e) {
      /* ignore */
    }
  }

  return {
    init,
    logTask1RankingAttempt,
    logTask1Hint,
    markTask1RankingComplete,
    logTask1DemoRun,
    logCodeAttempt,
    markCodeUnlocked,
    logTask2Attempt,
    markTask2Complete,
    logChatMessage,
    finishSession,
    getData,
    getFlatData,
    downloadCSV,
    downloadJSON,
  };
})();

window.DataLogger = DataLogger;
