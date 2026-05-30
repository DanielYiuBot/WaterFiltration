/* ============================================================
  i18n.js – ClearWater Lab V2  Bilingual Support (zh-TW / EN)
  ============================================================ */

const STRINGS = {
  siteTitle: { zh: 'ClearWater Lab — 濾水實驗室 V2', en: 'ClearWater Lab — Water Filtration Lab V2' },
  langToggle: { zh: 'EN', en: '中文' },
  backToTask1: { zh: '← 返回任務一', en: '← Back to Task 1' },

  heroTitle: { zh: 'ClearWater Lab', en: 'ClearWater Lab' },

  loginTitle: { zh: '歡迎來到實驗室', en: 'Welcome to the Laboratory' },
  loginSubtitle: { zh: '請輸入你的班別學號', en: 'Enter your class and student number' },
  loginIdLabel: { zh: '參與者編號', en: 'Participant ID' },
  loginIdPlaceholder: { zh: '例如：4B01', en: 'e.g. 4B01' },
  loginBtn: { zh: '開始', en: 'Start' },
  loginError: { zh: '請輸入有效的參與者編號', en: 'Please enter a valid participant ID' },

  instructionsTitle: { zh: '實驗說明', en: 'Instructions' },
  instructionsText: {
    zh: '任務一:\n比較不同濾水物料的過濾效果\n\n任務二：\n泥濘的河水濾水挑戰\n怎樣排列不同濾材，才能令河水變得較清澈？',
    en: 'Task 1:\nCompare the filtering effectiveness of different water‑filtering materials.\n\nTask 2:\nMuddy river water filtration challenge\nhow should different filter materials be arranged to make the river water clearer?'
  },
  instructionsBtn: { zh: '前往任務一', en: 'Go to Task 1' },

  task1Title: { zh: '任務一：比較不同濾水物料的過濾效果', en: 'Task 1: Compare the filtering effectiveness of different water‑filtering materials' },
  task1Subtitle: {
    zh: '請觀察物料的特性，請把不同物料由「顆粒最大」至「顆粒最小」排列。',
    en: 'Observe the characteristics of the materials, and arrange them in order from “largest particles” to “smallest particles.”'
  },
  materialsTitle: { zh: '材料庫', en: 'Material Inventory' },
  task1MaterialsTitle: { zh: '濾材選擇區', en: 'Filter Material Selection' },
  task1MaterialsSubtitle: { zh: '（拖動到右邊排序區）', en: '(Drag to the ranking board on the right)' },
  task1MaterialsHint: { zh: '拖動濾材卡到右邊的排序區', en: 'Drag material cards to the ranking board on the right' },
  rankingBoardTitle: { zh: '排序區', en: 'Ranking Board' },
  rankingSlot: { zh: '位置 {n}', en: 'Slot {n}' },
  largestParticle: { zh: '顆粒最大', en: 'Largest particles' },
  smallestParticle: { zh: '顆粒最小', en: 'Smallest particles' },
  rankingReady: { zh: '排序正確！可開始平行濾水展示。', en: 'Correct order! You can start the parallel demo.' },
  startParallelDemo: { zh: '確認次序', en: 'Confirm Order' },
  task1ClearAll: { zh: '清除排序', en: 'Clear Order' },
  task1DemoTitle: { zh: '任務 一：平行濾水展示', en: 'Task 1: Parallel Filtering Demo' },
  task1DemoDesc: { zh: '四種濾材會同時進行濾水，完成時間不同，因此結果卡會依序出現。', en: 'The four materials filter water at the same time. Their result cards appear at different times because each material has a different flow speed.' },
  demoRunning: { zh: '展示進行中…', en: 'Running demo...' },
  proceedCodeLock: { zh: '下一頁', en: 'Next Page' },
  task1FilterLabel: { zh: '濾材：{m}', en: 'Material: {m}' },
  miniScoreTitle: { zh: '結果', en: 'Result' },
  clarityLabel: { zh: '清澈度', en: 'Clarity' },
  flowLabel: { zh: '流速時間', en: 'Flow Time' },
  rankingFeedbackDefault: { zh: '把濾材拖曳到下方排序區。', en: 'Drag materials into the ranking board below.' },
  rankingWrongFeedback: { zh: '{placed} 暫時不能放在這裡。請比較濾材空隙大小，再試一次。', en: '{placed} does not fit here yet. Compare the materials by gap size and try again.' },
  rankingWrongOrder: { zh: '次序還不正確，請重新比較濾材空隙大小後再試一次。', en: 'The order is not correct yet. Compare the materials by gap size and try again.' },
  rankingGapReminder: { zh: '提醒：{small} 的空隙比 {large} 小，空隙較小的材料不應排在空隙較大的材料前面。', en: 'Reminder: {small} has a smaller gap size than {large}. A smaller-gap material should not come before a larger-gap material.' },
  rankingIncomplete: { zh: '請先把 4 種濾材都放入排序區，再確認次序。', en: 'Please place all 4 materials in the ranking board before confirming.' },
  rankingSlotOccupied: { zh: '這個位置已有濾材。請先移除或拖曳已放入的濾材來調整位置。', en: 'This slot already has a material. Remove it first or drag ranked materials to reorder.' },
  rankingDuplicate: { zh: '此濾材已在排序區中。', en: 'This material is already in the ranking board.' },
  rankingCoarseSandBeforeGravel: { zh: '提醒：粗砂粒的空隙比石頭小，粗砂粒不應排在石頭前面。', en: 'Reminder: Coarse Sand has a smaller gap size than Gravel, so Coarse Sand should not come before Gravel.' },
  rankingSandBeforeGravel: { zh: '提醒：幼砂粒的空隙比石頭小，幼砂粒不應排在石頭前面。', en: 'Reminder: Fine Sand has a smaller gap size than Gravel, so Fine Sand should not come before Gravel.' },
  rankingSandBeforeCoarseSand: { zh: '提醒：幼砂粒的空隙比粗砂粒小，幼砂粒不應排在粗砂粒前面。', en: 'Reminder: Fine Sand has a smaller gap size than Coarse Sand, so Fine Sand should not come before Coarse Sand.' },
  rankingCottonBeforeGravel: { zh: '提醒：棉花的空隙比石頭小，棉花不應排在石頭前面。', en: 'Reminder: Cotton has a smaller gap size than Gravel, so Cotton should not come before Gravel.' },
  rankingCottonBeforeCoarseSand: { zh: '提醒：棉花的空隙比粗砂粒小，棉花不應排在粗砂粒前面。', en: 'Reminder: Cotton has a smaller gap size than Coarse Sand, so Cotton should not come before Coarse Sand.' },
  rankingCottonBeforeSand: { zh: '提醒：棉花的空隙比幼砂粒小，棉花不應排在幼砂粒前面。', en: 'Reminder: Cotton has a smaller gap size than Fine Sand, so Cotton should not come before Fine Sand.' },
  seconds: { zh: '秒', en: 's' },

  codeLockTitle: { zh: '任務解鎖', en: 'Task Unlock' },
  codeLockDesc: { zh: '請輸入正確代碼以進入任務 2。', en: 'Enter the correct code to unlock Task 2.' },
  codeLockPrefilled: { zh: '代碼已預先輸入，請直接按「解鎖任務二」按鈕繼續。', en: 'The code has been preinputted. Please proceed by clicking the “Unlock Task 2” button directly.' },
  codeLockPlaceholder: { zh: '輸入代碼', en: 'Enter code' },
  codeLockBtn: { zh: '解鎖任務二', en: 'Unlock Task 2' },
  codeLockBackBtn: { zh: '上一頁', en: 'Previous Page' },
  codeLockWrong: { zh: '代碼錯誤，請再試一次。', en: 'Incorrect code, please try again.' },
  codeLockSuccess: { zh: '解鎖成功！', en: 'Unlocked successfully!' },

  task2Title: { zh: '任務 二：泥濘河水濾水挑戰', en: 'Task 2: Muddy River Water Water Filtration Challenge' },
  taskLabel: { zh: '當前任務', en: 'Current Task' },
  task2Desc: { zh: '目標：提升清澈度並維持合理流速。', en: 'Goal: Improve clarity while keeping a reasonable flow speed.' },
  gravel: { zh: '石頭', en: 'Gravel' },
  coarseSand: { zh: '粗砂粒', en: 'Coarse Sand' },
  sand: { zh: '幼砂粒', en: 'Fine Sand' },
  cotton: { zh: '棉花', en: 'Cotton' },
  gravelDesc: { zh: '空隙最大，阻擋大顆粒雜質', en: 'Largest gaps, block large particles/impurities' },
  coarseSandDesc: { zh: '空隙較大，阻擋中顆粒雜質', en: 'Relatively large gaps, block medium particles/impurities' },
  sandDesc: { zh: '空隙較小，阻擋細小雜質', en: 'Smaller gaps, block fine particles/impurities' },
  cottonDesc: { zh: '空隙最小，阻擋微細雜質', en: 'Smallest gaps, block very fine particles/impurities' },
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
  task2NeedFourWorksheet: {
    zh: '請先按照工作紙，把全部 4 種濾材放入濾瓶，並排成工作紙上的其中一種標準排列方法（方法 A、B 或 C），再按「開始過濾」。',
    en: 'Follow your worksheet: place all four materials in the bottle using one of the stacking methods given (methods A, B, or C), then press Start Filtering.',
  },
  task2NotWorksheetOrder: {
    zh: '此次序並非工作紙上所規定的任一種標準排列方法（並不符合方法 A、B 或 C）。請對照工作紙調整後再按「開始過濾」。',
    en: 'This stack does not match any of methods A, B, or C on your worksheet. Match your worksheet layout, then press Start Filtering again.',
  },
  task2TrialStatus: {
    zh: '請至少完成 3 次濾水嘗試。目前：{done}/3',
    en: 'Please complete at least 3 water filtration attempts. Current: {done}/3',
  },
  task2Ready: { zh: '已完成 3 次濾水嘗試，可以完成任務 2。', en: 'You have completed 3 filtration trials and can finish Task 2.' },
  clogWarning: { zh: '濾材堵塞，請調整順序', en: 'Filter clogged, adjust the order' },

  completionTitle: { zh: '實驗完成！', en: 'Experiment Complete!' },
  completionText: { zh: '感謝你的參與，資料已儲存。', en: 'Thank you for participating. Data is saved.' },
  completionId: { zh: '參與者編號', en: 'Participant ID' },
  completionTask1: { zh: '任務 1', en: 'Task 1' },
  completionTask2: { zh: '任務 2', en: 'Task 2' },
  statusDone: { zh: '已完成', en: 'Completed' },
  statusPending: { zh: '未完成', en: 'Pending' },
  chatbotName: { zh: '水博士', en: 'Dr. H2O' },
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
