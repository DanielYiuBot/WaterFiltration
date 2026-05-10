/* ============================================================
  data-logger.js – ClearWater Lab V2 Data Collection
  ============================================================ */

const DataLogger = (() => {
  let _data = {
    participantId: '',
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

  function init(participantId) {
    _data.participantId = participantId;
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
      task2Variant: result.task2Variant != null ? result.task2Variant : null,
      scienceExplanation: result.scienceExplanation || '',
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

  function _googleEntryName(id) {
    const s = String(id).trim();
    if (!s) return '';
    return s.startsWith('entry.') ? s : `entry.${s}`;
  }

  /**
   * POSTs to a Google Form via a hidden iframe (avoids fetch CORS).
   * Payload omits codeAttempts, codeUnlocked, codeUnlockedAt. See google-form-config.js.
   */
  function trySubmitGoogleForm() {
    const cfg = typeof window !== 'undefined' ? window.CLEARWATER_GOOGLE_FORM : null;
    const actionUrl = cfg && typeof cfg.actionUrl === 'string' ? cfg.actionUrl.trim() : '';
    if (!actionUrl || !actionUrl.includes('formResponse')) {
      return { ok: false, reason: 'not_configured' };
    }

    const flatFull = getFlatData();
    const dupKey = `clearwater_v2_gform_${flatFull.participantId}_${flatFull.sessionEndTime || 'pending'}`;
    try {
      if (sessionStorage.getItem(dupKey)) {
        return { ok: true, reason: 'already_sent' };
      }
    } catch (e) {
      /* ignore */
    }

    const flat = { ...flatFull };
    delete flat.codeAttempts;
    delete flat.codeUnlocked;
    delete flat.codeUnlockedAt;

    const entries = cfg.entries && typeof cfg.entries === 'object' ? cfg.entries : {};
    const fields = {};

    const payloadId = entries.payload;
    if (payloadId != null && String(payloadId).trim() !== '') {
      const name = _googleEntryName(payloadId);
      if (name) fields[name] = JSON.stringify(flat);
    }

    Object.keys(entries).forEach((key) => {
      if (key === 'payload') return;
      const eid = entries[key];
      if (eid == null || String(eid).trim() === '') return;
      if (!Object.prototype.hasOwnProperty.call(flat, key)) return;
      const name = _googleEntryName(eid);
      if (!name) return;
      fields[name] = flat[key];
    });

    const names = Object.keys(fields);
    if (!names.length) {
      return { ok: false, reason: 'no_fields' };
    }

    _postGoogleFormIframe(actionUrl, fields);

    try {
      sessionStorage.setItem(dupKey, '1');
    } catch (e) {
      /* ignore */
    }

    return { ok: true, reason: 'submitted' };
  }

  function _postGoogleFormIframe(actionUrl, fields) {
    const iframeName = `gf_${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.setAttribute('title', 'Form submit');
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = actionUrl;
    form.target = iframeName;
    form.setAttribute('accept-charset', 'UTF-8');

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    // Removing the form too soon can abort the POST in some browsers.
    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      try {
        form.remove();
      } catch (e) {
        /* ignore */
      }
      setTimeout(() => {
        try {
          iframe.remove();
        } catch (e2) {
          /* ignore */
        }
      }, 8000);
    };

    setTimeout(cleanup, 5000);
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
    trySubmitGoogleForm,
  };
})();

window.DataLogger = DataLogger;
