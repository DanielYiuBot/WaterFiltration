/* ============================================================
  i18n.js – ClearWater Lab V2  Bilingual Support (zh-TW / EN)
  ============================================================ */

const STRINGS = {
  siteTitle: { zh: 'ClearWater Lab — 濾水實驗室 V2', en: 'ClearWater Lab — Water Filtration Lab V2' },
  langToggle: { zh: 'EN', en: '中文' },
  backToTask1: { zh: '← 返回任務 1', en: '← Back to Task 1' },

  heroTitle: { zh: 'ClearWater Lab', en: 'ClearWater Lab' },

  loginTitle: { zh: '歡迎參加實驗', en: 'Welcome to the Experiment' },
  loginSubtitle: { zh: '請輸入你的參與者編號以開始', en: 'Enter your participant ID to begin' },
  loginIdLabel: { zh: '參與者編號', en: 'Participant ID' },
  loginIdPlaceholder: { zh: '例如：S01', en: 'e.g. S01' },
  loginBtn: { zh: '開始實驗', en: 'Start Experiment' },
  loginError: { zh: '請輸入有效的參與者編號', en: 'Please enter a valid participant ID' },

  instructionsTitle: { zh: '實驗說明', en: 'Instructions' },
  instructionsText: {
    zh: '你將完成兩個任務。\n\n任務 1：將濾材依孔隙大小（Gap Size）由大到小排序。\n正確順序後，系統會展示四組平行濾水動畫與各自的清澈度、流速成績。\n\n任務 2：泥濘的河水濾水挑戰。\n請拖曳濾材建立濾水層，並觀察清澈度與流速。',
    en: 'You will complete two tasks.\n\nTask 1: Rank materials by gap size from largest to smallest.\nAfter the correct order is built, the app runs four parallel filtration animations and shows each filter score (clarity and speed).\n\nTask 2: Muddy river water filtration challenge.\nDrag materials to build a filter stack and observe clarity and flow speed.'
  },
  instructionsBtn: { zh: '前往任務 1', en: 'Go to Task 1' },

  task1Title: { zh: '任務 1：濾材孔隙大小排序', en: 'Task 1: Rank by Gap Size' },
  task1Subtitle: {
    zh: '請觀察材料特性，將濾材依孔隙大小由大到小排列。',
    en: 'Observe the material properties and arrange the filters from largest to smallest gap size.'
  },
  materialsTitle: { zh: '材料庫', en: 'Material Inventory' },
  rankingBoardTitle: { zh: '排序區（由左到右）', en: 'Ranking Board (left to right)' },
  rankingSlot: { zh: '位置 {n}', en: 'Slot {n}' },
  rankingReady: { zh: '排序正確！可開始平行濾水展示。', en: 'Correct order! You can start the parallel demo.' },
  startParallelDemo: { zh: '確認次序', en: 'Confirm Order' },
  task1ClearAll: { zh: '清除排序', en: 'Clear Order' },
  task1DemoTitle: { zh: '任務 1：平行濾水展示', en: 'Task 1: Parallel Filtering Demo' },
  task1DemoDesc: { zh: '四種濾材會同時進行濾水，完成時間不同，因此結果卡會依序出現。', en: 'The four materials filter water at the same time. Their result cards appear at different times because each material has a different flow speed.' },
  demoRunning: { zh: '展示進行中…', en: 'Running demo...' },
  proceedCodeLock: { zh: '下一頁', en: 'Next Page' },
  task1FilterLabel: { zh: '濾材：{m}', en: 'Material: {m}' },
  miniScoreTitle: { zh: '結果', en: 'Result' },
  clarityLabel: { zh: '清澈度', en: 'Clarity' },
  flowLabel: { zh: '流速時間', en: 'Flow Time' },
  rankingFeedbackDefault: { zh: '把濾材拖曳到下方排序區。', en: 'Drag materials into the ranking board below.' },
  rankingWrongFeedback: { zh: '{placed} 暫時不能放在這裡。請比較濾材孔隙大小，再試一次。', en: '{placed} does not fit here yet. Compare the materials by gap size and try again.' },
  rankingWrongOrder: { zh: '次序還不正確，請重新比較濾材孔隙大小後再試一次。', en: 'The order is not correct yet. Compare the materials by gap size and try again.' },
  rankingGapReminder: { zh: '提醒：{small} 的孔隙比 {large} 小，孔隙較小的材料不應排在孔隙較大的材料前面。', en: 'Reminder: {small} has a smaller gap size than {large}. A smaller-gap material should not come before a larger-gap material.' },
  rankingIncomplete: { zh: '請先把 4 種濾材都放入排序區，再確認次序。', en: 'Please place all 4 materials in the ranking board before confirming.' },
  rankingSlotOccupied: { zh: '這個位置已有濾材。請先移除或拖曳已放入的濾材來調整位置。', en: 'This slot already has a material. Remove it first or drag ranked materials to reorder.' },
  rankingDuplicate: { zh: '此濾材已在排序區中。', en: 'This material is already in the ranking board.' },
  rankingPebbleBeforeGravel: { zh: '提醒：粗砂粒的孔隙比石頭小，粗砂粒不應排在石頭前面。', en: 'Reminder: Pebble has a smaller gap size than Gravel, so Pebble should not come before Gravel.' },
  rankingSandBeforeGravel: { zh: '提醒：細砂粒的孔隙比石頭小，細砂粒不應排在石頭前面。', en: 'Reminder: Sand has a smaller gap size than Gravel, so Sand should not come before Gravel.' },
  rankingSandBeforePebble: { zh: '提醒：細砂粒的孔隙比粗砂粒小，細砂粒不應排在粗砂粒前面。', en: 'Reminder: Sand has a smaller gap size than Pebble, so Sand should not come before Pebble.' },
  rankingCottonBeforeGravel: { zh: '提醒：棉花的孔隙比石頭小，棉花不應排在石頭前面。', en: 'Reminder: Cotton has a smaller gap size than Gravel, so Cotton should not come before Gravel.' },
  rankingCottonBeforePebble: { zh: '提醒：棉花的孔隙比粗砂粒小，棉花不應排在粗砂粒前面。', en: 'Reminder: Cotton has a smaller gap size than Pebble, so Cotton should not come before Pebble.' },
  rankingCottonBeforeSand: { zh: '提醒：棉花的孔隙比細砂粒小，棉花不應排在細砂粒前面。', en: 'Reminder: Cotton has a smaller gap size than Sand, so Cotton should not come before Sand.' },
  seconds: { zh: '秒', en: 's' },

  codeLockTitle: { zh: '任務解鎖', en: 'Task Unlock' },
  codeLockDesc: { zh: '請輸入正確代碼以進入任務 2。', en: 'Enter the correct code to unlock Task 2.' },
  codeLockPlaceholder: { zh: '輸入代碼', en: 'Enter code' },
  codeLockBtn: { zh: '解鎖任務 2', en: 'Unlock Task 2' },
  codeLockWrong: { zh: '代碼錯誤，請再試一次。', en: 'Incorrect code, please try again.' },
  codeLockSuccess: { zh: '解鎖成功！', en: 'Unlocked successfully!' },

  task2Title: { zh: '任務 2：泥濘的河水', en: 'Task 2: Muddy River Water' },
  taskLabel: { zh: '當前任務', en: 'Current Task' },
  task2Desc: { zh: '目標：提升清澈度並維持合理流速。', en: 'Goal: Improve clarity while keeping a reasonable flow speed.' },
  gravel: { zh: '石頭', en: 'Gravel' },
  pebble: { zh: '粗砂粒', en: 'Pebble' },
  sand: { zh: '細砂粒', en: 'Sand' },
  cotton: { zh: '棉花', en: 'Cotton' },
  gravelDesc: { zh: '攔截最大顆粒雜質', en: 'Blocks largest debris' },
  pebbleDesc: { zh: '過濾中大型顆粒', en: 'Filters medium-large particles' },
  sandDesc: { zh: '過濾細小懸浮顆粒', en: 'Filters fine suspended particles' },
  cottonDesc: { zh: '最後攔截微細顆粒', en: 'Final micro-particle barrier' },
  bottlePlaceholder: { zh: '將濾材拖曳到此', en: 'Drag materials here' },
  startFilter: { zh: '開始過濾', en: 'Start Filtering' },
  filtering: { zh: '過濾中…', en: 'Filtering...' },
  clearAll: { zh: '清除全部', en: 'Clear All' },
  removeLayer: { zh: '移除', en: 'Remove' },
  dashboardTitle: { zh: '結果儀表板', en: 'Result Dashboard' },
  turbidityLabel: { zh: '清澈度', en: 'Clarity' },
  speedLabel: { zh: '流速', en: 'Flow Speed' },
  tryAgain: { zh: '重新嘗試', en: 'Try Again' },
  finishTask2: { zh: '完成任務 2', en: 'Finish Task 2' },
  task2MaxMaterials: { zh: '最多只能放入 4 種濾材，請先移除一層再加入新的濾材。', en: 'You can place at most 4 materials in the filter. Remove one layer before adding another.' },
  task2TrialStatus: { zh: '請至少完成 3 次濾水嘗試。目前：{done}/3', en: 'Complete at least 3 filtration trials. Current: {done}/3' },
  task2Ready: { zh: '已完成 3 次濾水嘗試，可以完成任務 2。', en: 'You have completed 3 filtration trials and can finish Task 2.' },
  clogWarning: { zh: '濾材堵塞，請調整順序', en: 'Filter clogged, adjust the order' },

  completionTitle: { zh: '實驗完成！', en: 'Experiment Complete!' },
  completionText: { zh: '感謝你的參與，資料已儲存。', en: 'Thank you for participating. Data is saved.' },
  completionId: { zh: '參與者編號', en: 'Participant ID' },
  completionGroup: { zh: '實驗組別', en: 'Experiment Group' },
  completionTask1: { zh: '任務 1', en: 'Task 1' },
  completionTask2: { zh: '任務 2', en: 'Task 2' },
  statusDone: { zh: '已完成', en: 'Completed' },
  statusPending: { zh: '未完成', en: 'Pending' },
  groupAI: { zh: 'AI 輔助組', en: 'AI-Assisted Group' },
  groupControl: { zh: '對照組', en: 'Control Group' },
  downloadData: { zh: '下載實驗數據', en: 'Download Data' },

  askPlaceholder: { zh: '輸入問題，例如：為什麼這層放上面？', en: 'Ask a question, e.g. Why should this layer be on top?' },
  sendBtn: { zh: '送出', en: 'Send' },
  thinking: { zh: 'Dr. H2O 思考中…', en: 'Dr. H2O is thinking...' },
  errorAI: { zh: '目前無法連線 AI，請稍後再試。', en: 'AI is unavailable right now. Please try again later.' },
  analysisReady: { zh: '分析完成', en: 'Analysis ready' }
};

let currentLang = 'zh';

function t(key) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[currentLang] || entry.en || key;
}

function getLang() {
  return currentLang;
}

function setLang(lang) {
  currentLang = lang === 'en' ? 'en' : 'zh';
  document.documentElement.lang = currentLang === 'zh' ? 'zh-TW' : 'en';
  if (window.I18n && window.I18n.applyI18n && window.I18n.applyI18n !== applyI18n) {
    window.I18n.applyI18n();
  } else {
    applyI18n();
  }
}

function toggleLang() {
  setLang(currentLang === 'zh' ? 'en' : 'zh');
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  const toggleBtn = document.getElementById('lang-toggle');
  if (toggleBtn) toggleBtn.textContent = t('langToggle');
}

window.I18n = { t, getLang, setLang, toggleLang, applyI18n, STRINGS };
