/* ============================================================
   i18n.js – ClearWater Lab  Bilingual Support (zh-TW / EN)
   ============================================================ */

const STRINGS = {
  /* -------- Global / Nav -------- */
  siteTitle:        { zh: 'ClearWater Lab — 互動式濾水實驗室', en: 'ClearWater Lab — Interactive Filtration Lab' },
  langToggle:       { zh: 'EN',  en: '中文' },
  startTask:        { zh: '開始任務', en: 'Start Task' },
  backToScenarios:  { zh: '← 返回選擇場景', en: '← Back to Scenarios' },

  /* -------- Landing / Scenario -------- */
  heroTitle:        { zh: 'ClearWater Lab', en: 'ClearWater Lab' },
  heroSubtitle:     { zh: '探索物理過濾的科學原理', en: 'Explore the Science of Physical Filtration' },
  chooseScenario:   { zh: '選擇實驗場景', en: 'Choose a Scenario' },

  scenarioATitle:   { zh: '泥濘的河水', en: 'Muddy River Water' },
  scenarioADesc:    { zh: '含有大量可見泥沙、碎葉，渾濁度極高。\n目標：降低濁度。', en: 'Contains visible mud, sand and leaves with very high turbidity.\nGoal: Reduce turbidity.' },

  scenarioBTitle:   { zh: '發臭的景觀池水', en: 'Smelly Pond Water' },
  scenarioBDesc:    { zh: '水質帶綠（藻類），有明顯的腐敗腥臭味。\n目標：降低濁度並去除異味。', en: 'Greenish water (algae) with a strong foul odor.\nGoal: Reduce turbidity AND remove odor.' },

  /* -------- Materials -------- */
  materialsTitle:   { zh: '濾材材料庫', en: 'Material Sandbox' },

  gravel:           { zh: '大石子', en: 'Gravel' },
  gravelDesc:       { zh: '攔截大型樹葉與碎石', en: 'Blocks large leaves and debris' },

  sand:             { zh: '細砂', en: 'Sand' },
  sandDesc:         { zh: '過濾中小型懸浮泥沙', en: 'Filters medium & small suspended particles' },

  carbon:           { zh: '活性碳', en: 'Activated Carbon' },
  carbonDesc:       { zh: '物理吸附色素與臭味分子', en: 'Adsorbs pigments and odor molecules' },

  cotton:           { zh: '棉花', en: 'Cotton' },
  cottonDesc:       { zh: '防止細砂流失並捕捉微粒', en: 'Prevents sand loss & catches fine particles' },

  /* -------- Lab Actions -------- */
  bottlePlaceholder:{ zh: '將濾材拖曳至此處', en: 'Drag materials here' },
  startFilter:      { zh: '開始過濾', en: 'Start Filtering' },
  clearAll:         { zh: '清除全部', en: 'Clear All' },
  tryAgain:         { zh: '重新嘗試', en: 'Try Again' },
  filtering:        { zh: '過濾中…', en: 'Filtering…' },

  /* -------- Scenario header in lab -------- */
  taskLabel:        { zh: '當前任務', en: 'Current Task' },

  /* -------- Dashboard -------- */
  dashboardTitle:   { zh: '數據儀表板', en: 'Dashboard' },
  turbidityLabel:   { zh: '濁度（清澈程度）', en: 'Turbidity (Clarity)' },
  odorLabel:        { zh: '氣味偵測器', en: 'Odor Detector' },
  flowLabel:        { zh: '流速監控', en: 'Flow Speed' },
  seconds:          { zh: '秒', en: 's' },

  odorStrong:       { zh: '強', en: 'Strong' },
  odorMedium:       { zh: '中', en: 'Medium' },
  odorNone:         { zh: '無', en: 'None' },

  /* -------- Chatbot / Dr. H2O -------- */
  drH2OTitle:       { zh: 'Dr. H₂O', en: 'Dr. H₂O' },
  analysisReady:    { zh: '分析報告已生成', en: 'Analysis report ready' },
  askPlaceholder:   { zh: '輸入問題，例如「為什麼水流不動？」', en: 'Ask a question, e.g. "Why is the water stuck?"' },
  sendBtn:          { zh: '送出', en: 'Send' },
  thinking:         { zh: 'Dr. H₂O 思考中…', en: 'Dr. H₂O is thinking…' },
  errorAI:          { zh: 'AI 回覆失敗，請稍後再試。', en: 'AI response failed. Please try again later.' },

  /* -------- Misc -------- */
  clogWarning:      { zh: '⚠ 濾材堵塞！水流無法通過。', en: '⚠ Clogged! Water cannot pass through.' },
  removeLayer:      { zh: '移除', en: 'Remove' },

  /* ======== EXPERIMENT FLOW ======== */

  /* -------- Login Screen -------- */
  loginTitle:       { zh: '歡迎參加實驗', en: 'Welcome to the Experiment' },
  loginSubtitle:    { zh: '請輸入你的參與者編號以開始', en: 'Please enter your participant ID to begin' },
  loginIdLabel:     { zh: '參與者編號', en: 'Participant ID' },
  loginIdPlaceholder: { zh: '例如：S01', en: 'e.g. S01' },
  loginBtn:         { zh: '開始實驗', en: 'Start Experiment' },
  loginError:       { zh: '請輸入有效的參與者編號（例如 S01）', en: 'Please enter a valid participant ID (e.g. S01)' },

  /* -------- Consent Screen -------- */
  consentTitle:     { zh: '參與同意書', en: 'Informed Consent' },
  consentText:      {
    zh: '感謝你參加本研究實驗。\n\n本實驗旨在了解不同學習方式對濾水概念理解的影響。實驗過程中，你將完成一份前測問卷、使用虛擬濾水實驗室進行操作，以及完成一份後測問卷。\n\n你的資料將完全匿名處理，僅用於學術研究目的。你的參與完全自願，可隨時退出。\n\n如有任何問題，請向研究人員詢問。',
    en: 'Thank you for participating in this research experiment.\n\nThis experiment aims to understand how different learning approaches affect understanding of water filtration concepts. During the experiment, you will complete a pre-test questionnaire, use a virtual filtration lab, and complete a post-test questionnaire.\n\nYour data will be completely anonymous and used only for academic research purposes. Your participation is entirely voluntary, and you may withdraw at any time.\n\nIf you have any questions, please ask the researcher.'
  },
  consentAgree:     { zh: '我已閱讀並同意參加本實驗', en: 'I have read and agree to participate' },
  consentBtn:       { zh: '繼續', en: 'Continue' },

  /* -------- Pre-test / Post-test -------- */
  pretestTitle:     { zh: '前測問卷', en: 'Pre-Test Questionnaire' },
  pretestDesc:      { zh: '請根據你目前的知識回答以下問題，答不出來也沒關係。', en: 'Please answer the following questions based on your current knowledge. It is okay if you are unsure.' },
  posttestTitle:    { zh: '後測問卷', en: 'Post-Test Questionnaire' },
  posttestDesc:     { zh: '請根據你在實驗中學到的知識回答以下問題。', en: 'Please answer the following questions based on what you learned during the experiment.' },
  submitTest:       { zh: '提交問卷', en: 'Submit' },
  questionLabel:    { zh: '第 {n} 題', en: 'Question {n}' },
  testIncomplete:   { zh: '請回答所有問題後再提交。', en: 'Please answer all questions before submitting.' },

  /* -------- Experiment Instructions -------- */
  instructionsTitle:{ zh: '實驗說明', en: 'Experiment Instructions' },
  instructionsText: {
    zh: '在這個實驗中，你將使用虛擬濾水實驗室來學習物理過濾的原理。\n\n你需要完成兩個場景的實驗：\n1. 場景 A：泥濘的河水 — 目標是降低濁度\n2. 場景 B：發臭的景觀池水 — 目標是降低濁度並去除異味\n\n每個場景至少需要嘗試 2 次不同的濾材組合。\n\n操作方式：\n• 將左側的濾材拖曳到瓶子中\n• 點擊「開始過濾」觀察結果\n• 根據結果調整濾材順序\n• 右側儀表板顯示過濾效果',
    en: 'In this experiment, you will use a virtual filtration lab to learn the principles of physical filtration.\n\nYou need to complete experiments for two scenarios:\n1. Scenario A: Muddy River Water — Goal: reduce turbidity\n2. Scenario B: Smelly Pond Water — Goal: reduce turbidity AND remove odor\n\nYou must try at least 2 different filter configurations for each scenario.\n\nHow to use:\n• Drag filter materials from the left sidebar into the bottle\n• Click "Start Filtering" to see the results\n• Adjust material order based on results\n• The dashboard on the right shows filtration performance'
  },
  instructionsBtn:  { zh: '開始實驗', en: 'Begin Experiment' },

  /* -------- Scenario Progress -------- */
  scenarioComplete:      { zh: '場景 {s} 已完成！', en: 'Scenario {s} complete!' },
  scenarioNeedMore:      { zh: '此場景至少還需要嘗試 {n} 次', en: 'You need at least {n} more attempt(s) for this scenario' },
  nextScenarioBtn:       { zh: '前往場景 B', en: 'Go to Scenario B' },
  finishExperimentBtn:   { zh: '完成實驗', en: 'Finish Experiment' },
  scenarioAComplete:     { zh: '✓ 場景 A 已完成', en: '✓ Scenario A Complete' },
  scenarioBComplete:     { zh: '✓ 場景 B 已完成', en: '✓ Scenario B Complete' },
  attemptsCount:         { zh: '已嘗試 {n} 次', en: '{n} attempt(s)' },
  progressLabel:         { zh: '實驗進度', en: 'Experiment Progress' },

  /* -------- Completion Screen -------- */
  completionTitle:  { zh: '實驗完成！', en: 'Experiment Complete!' },
  completionText:   { zh: '感謝你的參與！你的實驗數據已自動儲存。\n\n你可以關閉此頁面。', en: 'Thank you for your participation! Your experiment data has been saved automatically.\n\nYou may close this page.' },
  completionId:     { zh: '參與者編號', en: 'Participant ID' },
  completionGroup:  { zh: '實驗組別', en: 'Experiment Group' },
  groupAI:          { zh: 'AI 輔助組', en: 'AI-Assisted Group' },
  groupControl:     { zh: '對照組', en: 'Control Group' },
  completionPreScore:  { zh: '前測分數', en: 'Pre-Test Score' },
  completionPostScore: { zh: '後測分數', en: 'Post-Test Score' },
  downloadData:     { zh: '下載實驗數據', en: 'Download Experiment Data' },
};

/* ---------- State ---------- */
let currentLang = 'zh';                 // default language

/* ---------- Public API ---------- */

/** Get a translated string by key */
function t(key) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[currentLang] || entry['en'] || key;
}

/** Get current language code */
function getLang() {
  return currentLang;
}

/** Set language and re-render all [data-i18n] elements */
function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';
  applyI18n();
}

/** Toggle between zh and en */
function toggleLang() {
  setLang(currentLang === 'zh' ? 'en' : 'zh');
}

/** Walk the DOM and update every element that has a data-i18n attribute */
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });
  // Also update the toggle button label itself
  const toggleBtn = document.getElementById('lang-toggle');
  if (toggleBtn) toggleBtn.textContent = t('langToggle');
}

/* ---------- Exports (global) ---------- */
window.I18n = { t, getLang, setLang, toggleLang, applyI18n, STRINGS };
