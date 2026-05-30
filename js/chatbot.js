/* ============================================================
  chatbot.js – 水博士 (Task 2 lab assistant)
  ============================================================ */

const OPENAI_MODEL = 'gpt-5-nano';
const OPENAI_URL = '/api/chat';

/** Dr. H2O is only for Task 2 (lab screen); keep API traffic and UI off elsewhere. */
function isTask2LabContextActive() {
  return typeof window.Experiment !== 'undefined'
    && typeof window.Experiment.isTask2Screen === 'function'
    && window.Experiment.isTask2Screen();
}

const TASK2_MATERIAL_ZH = {
  gravel: '石頭',
  coarseSand: '粗砂粒',
  sand: '幼砂粒',
  cotton: '棉花',
};

const TASK2_MATERIAL_EN = {
  gravel: 'Gravel',
  coarseSand: 'Coarse Sand',
  sand: 'Fine Sand',
  cotton: 'Cotton',
};

function getChatLanguage() {
  return window.I18n && I18n.getLang && I18n.getLang() === 'en' ? 'en' : 'zh';
}

function layersToTopDown(layers, lang = getChatLanguage()) {
  const labels = lang === 'en' ? TASK2_MATERIAL_EN : TASK2_MATERIAL_ZH;
  return (layers || []).map((m) => labels[m] || m).join(' → ');
}

function translateScienceExplanation(text, lang = getChatLanguage()) {
  if (lang !== 'en' || !text) return text || '';
  const map = {
    '過濾效果：水最清澈。濾材由大空隙到小空隙，能逐步阻擋不同大小雜質。':
      'Filtering result: the water is the clearest. The materials go from large gaps to small gaps, so they block dirt step by step.',
    '過濾效果：水較混濁。次序未完全由大到小，清澈度與流速居中。':
      'Filtering result: the water is still a bit cloudy. The order is not fully from large gaps to small gaps, so the result is in the middle.',
    '過濾效果：水最混濁。細小空隙濾材在下方時較易堵塞，泥沙較難順序阻擋。':
      'Filtering result: the water is the cloudiest. Small-gap material near the top can slow the water, and dirt is not blocked step by step.',
    '濾材堵塞，請調整順序':
      'The filter is clogged. Try changing the order.',
    '排列未能完全由大空隙到小空隙，部分雜質可能較難逐層阻擋':
      'The order is not fully from large gaps to small gaps, so some dirt may be harder to block layer by layer.',
    '濾材排列較接近由大空隙到小空隙，可逐步阻擋不同大小的雜質':
      'The order is closer to large gaps then small gaps, so it can block different sizes of dirt step by step.',
  };
  return map[text] || text;
}

function collectTask2TrialContext(currentResult, lang = getChatLanguage()) {
  const attempts = (window.DataLogger && DataLogger.getData && DataLogger.getData().task2.attempts) || [];
  const total = attempts.length;
  const referenceTried = new Set();
  attempts.forEach((a) => {
    if (a.task2Variant) referenceTried.add(a.task2Variant);
  });
  const referenceLabels = ['A', 'B', 'C'];
  const notYetTried = referenceLabels.filter((l) => !referenceTried.has(l));

  const historyLines = attempts.map((a, i) => {
    if (lang === 'en') {
      const v = a.task2Variant ? `worksheet method ${a.task2Variant}` : 'custom order (not methods A, B, or C)';
      const flow = a.clogged ? 'clogged' : `${a.flowTime}s`;
      return `Trial ${i + 1}: top to bottom "${layersToTopDown(a.layers, lang)}"; ${v}; clarity ${a.clarity}%; flow time ${flow}`;
    }
    const v = a.task2Variant ? `參考排列方法 ${a.task2Variant}` : '自訂排列（非三種標準方法）';
    const flow = a.clogged ? '堵塞' : `${a.flowTime}s`;
    return `第 ${i + 1} 次：由上而下「${layersToTopDown(a.layers, lang)}」；${v}；清澈度 ${a.clarity}% ；流速 ${flow}`;
  });

  const currentVariant = lang === 'en'
    ? (currentResult.task2Variant ? `worksheet method ${currentResult.task2Variant}` : 'not methods A, B, or C')
    : (currentResult.task2Variant ? `參考排列方法 ${currentResult.task2Variant}` : '非三種標準排列方法');
  const currentFlow = currentResult.clogged
    ? (lang === 'en' ? 'clogged' : '堵塞')
    : `${currentResult.flowTime}s`;
  const scienceExplanation = translateScienceExplanation(currentResult.scienceExplanation, lang) || (lang === 'en' ? '(none)' : '（無）');

  return {
    total,
    referenceTried: [...referenceTried].sort(),
    notYetTried,
    historyLines,
    summaryBlock: historyLines.join('\n'),
    currentTrialLine: lang === 'en'
      ? `This is trial ${total}.\nTop-to-bottom order: "${layersToTopDown(currentResult.layers, lang)}"\nWorksheet method match: ${currentVariant}\nObservation data: clarity ${currentResult.clarity}%; flow time ${currentFlow}\nBuilt-in science note: ${scienceExplanation}`
      : `本次為第 ${total} 次試驗。\n由上而下次序：「${layersToTopDown(currentResult.layers, lang)}」\n對照活動標準排列方法：${currentVariant}\n觀察數據：清澈度 ${currentResult.clarity}% ；流速 ${currentFlow}\n程式內建說明：${scienceExplanation}`,
  };
}

function buildSystemPrompt(lang = getChatLanguage()) {
  if (lang === 'en') {
    return `You are "Dr. H2O", a friendly, professional, encouraging educational chatbot. Your goal is to guide Hong Kong Primary 4 students to learn the science of water filtration through observation.

---

### Core Role

* **Audience:** Primary 4 students.
* **Language:** Always respond in **English** because the user's current language setting is English.
* **Tone:** Friendly, short, warm, simple, and direct.
* **Emoji:** Use **0 to 1 emoji** per reply at most.

---

### Reply Format Rules (Strict)

1. **Very short bullets:** Write **3 to 5 key points**, one point per line, starting with "•".
2. **Do not show data or trial counts:**
* Do **not** mention trial numbers, percentages (%), or exact numeric data.
* Do **not** mention scores, marks, or full marks.
3. **Natural classroom language:** Explain observations like a nearby teacher. Avoid stiff technical wording.

---

### Filtration Methods (Top to Bottom)

Use these required ideas according to the student's selected method:

#### **Method A: Cotton → Fine Sand → Coarse Sand → Gravel**

* **Required ideas:**
• You tried method A.
• The water is the cloudiest.
• Cotton is near the top, so the water flows more slowly.
• Some tiny dirt is not fully filtered out.
• The water is the cloudiest.
* **Guidance:** Invite the student to try method B or C.

#### **Method B: Coarse Sand → Fine Sand → Gravel → Cotton**

* **Required ideas:**
• You tried method B.
• The water is still a bit cloudy.
• The gravel and sand are not in the best order.
• Some dirt is not fully filtered out.
• The water is still a bit cloudy.
* **Guidance:** Invite the student to try method A or C.

#### **Method C: Gravel → Coarse Sand → Fine Sand → Cotton**

* **Required ideas:**
• You tried method C.
• The water is the clearest.
• Gravel blocks large dirt first.
• Cotton blocks tiny dirt at the end.
• The water is the clearest.
* **Guidance:** Even if the result is good, invite the student to try method A or B to compare flow speed.

---

### Correct Example

• You tried method C.
• The water is the clearest.
• Gravel blocks large dirt first, and cotton blocks tiny dirt at the end.
• Next, try method A and see whether the water flows more slowly. 💧`;
  }

  return `你是「水博士」，一位友善、專業且充滿鼓勵的教育聊天機械人。你的目標是引導香港小四學生透過實驗觀察，學習「濾水」的科學原理。

---

### 🎓 核心角色設定

* **對象：** 小學四年級學生。
* **語言：** 永遠使用**繁體中文**，因為使用者目前的語言設定是中文。
* **語氣：** 友善、簡短、溫暖。句子要簡單、直接。
* **表情符號：** 每次回覆限用 **0 至 1 個**（例如 💧, 🔍, 👍）。

---

### 📝 回覆格式規範（嚴格執行）

1. **極簡條列：** 全文控制在 **3 至 5 行重點**，每行一個重點，使用「•」開頭。
2. **禁止數據與計次：**
* **不可**說「第幾次試驗」、「百分比 (%)」或「數字」。
* **不可**提及「評分」、「分數」或「滿分」。


3. **自然口語：** 轉述觀察時要像老師在身邊指導，禁止生硬的術語。

---

### 🧪 濾水方法與標準說明（由上至下排列）

根據學生選擇的方法，你**必須使用以下指定字句**進行解釋：

#### **方法 A：棉花 → 幼砂粒 → 粗砂粒 → 石頭**

* **說明重點：**
• 你這次用的是方法 A。
• 水最混濁。
• 棉花放在上面，水流得較慢。
• 細小污糟未能完全隔走。
• 水最混濁。
* **引導：** 邀請試試方法 B 或 C。

#### **方法 B：粗砂粒 → 幼砂粒 → 石頭 → 棉花**

* **說明重點：**
• 你這次用的是方法 B。
• 水較混濁。
• 石頭和砂粒排列不正確。
• 部分污糟未能隔走。
• 水較混濁。
* **引導：** 邀請試試方法 A 或 C。

#### **方法 C：石頭 → 粗砂粒 → 幼砂粒 → 棉花**

* **說明重點：**
• 你這次用的是方法 C。
• 水最清澈。
• 石頭先隔走大垃圾。
• 棉花最後隔走細小污糟。
• 水最清澈。
* **引導：** 即使結果好，也可邀請試試方法 A 或 B 來對比流速。

---

### 💬 回覆範例（正確示範）

你這次用的是方法 C。
• 水最清澈。
• 石頭先隔走大垃圾，棉花最後隔走細小污糟。
• 水最清澈。
接下來，你要不要試試方法 A，看看水流會不會變慢？ 💧
`;
}

function buildUserPayload(result, lang = getChatLanguage()) {
  const ctx = collectTask2TrialContext(result, lang);

  let extra = '';
  if (ctx.notYetTried.length > 0) {
    extra = lang === 'en'
      ? `\n[Note for internal use only] Methods not tried yet: ${ctx.notYetTried.join(', ')}. Naturally encourage the student to try these methods and compare them. Do not say "if there is still time in class".`
      : `\n【備註（勿照抄給學生）】尚未試過的方法代號：${ctx.notYetTried.join('、')}——請在自然對話裡直接鼓勵對方試這些方法並比一比，不要使用「若課堂上還能再試」之類句式。`;
  } else {
    extra = lang === 'en'
      ? '\nThe student has tried at least one standard method for A, B, and C. Compare the past observations.'
      : '\n學生已至少各試過一種對應 A、B、C 的標準排列方法（請回顧歷次數據做比較）。';
  }

  if (lang === 'en') {
    return `The user's current language setting is English. Write the chatbot response in English only.

Use the background below to write a response for a Primary 4 student.

**Format (required):** Write **3-5 short bullet points** using **• or -**. Keep the whole reply brief.

**Speaking style (required):** Start naturally like a teacher, for example "You just tried method X..." Do not use formal phrases such as "corresponding reference arrangement". Do not tell the student the trial number, clarity percentage, or exact numeric data. Do not mention scores. Do not say "if there is still time in class"; directly encourage trying another method and comparing.

[Background: total trials, internal only] ${ctx.total}
[Background: methods already tried] ${ctx.referenceTried.length ? ctx.referenceTried.join(', ') : '(none yet)'}

[All stacks and data, internal reference only; rewrite as observations and do not copy percentages or trial numbers]
${ctx.summaryBlock || '(none)'}

[Current focus, internal reference only]
${ctx.currentTrialLine}${extra}

Now write a **short, warm, bullet-point** science guide in English.`;
  }

  return `請根據以下「背景資料」撰寫給小四學生的繁體中文回覆（遵守系統提示規則 1–14）。\n\n**格式（強制）：** 以 **• 或 - 條列** 寫 **3–5 個重點**，全文 **簡短**，不要長段落。\n\n**口語要求（強制）：** 開頭請像老師講話，例如「你剛試了方法 X…」不要用「對應參考排列方法／見標準次序」等公文句。**不要對學生寫：**第幾次試驗、清澈度的百分比。**不要說：**如果課堂上還可以再試——請直接鼓勵再試別的方法並比對。\n請勿評分或使用「型式」。\n\n【背景：累積試驗數（僅自用，勿寫進回覆）】${ctx.total}\n【背景：已用過的方法代號】${ctx.referenceTried.length ? ctx.referenceTried.join('、') : '（尚無紀錄）'}\n\n【各次堆疊與數據（內部參考；回覆請改寫成感受，勿照讀％或「第ｎ次」）】\n${ctx.summaryBlock || '（無）'}\n\n【本次重點（內部參考）】\n${ctx.currentTrialLine}${extra}\n\n請寫出 **條列、簡短、溫暖** 的科學引導（不給評分）。`;
}

class DrH2O extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = false;
    this._messages = [];
    this._conversationHistory = [];
    this._lastResult = null;
    this._busy = false;
    this.render();
    this.setupEvents();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/chatbot.css" />
      <button class="drh2o-fab" id="fab" aria-label="">
        <span class="notif-dot" id="notif"></span>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4 C16 4 6 16 6 21 C6 26.5 10.5 29 16 29 C21.5 29 26 26.5 26 21 C26 16 16 4 16 4Z"
                fill="white" fill-opacity="0.9" stroke="white" stroke-width="0.5"/>
          <circle cx="12.5" cy="19" r="3" stroke="#039BE5" stroke-width="1.2" fill="none"/>
          <circle cx="19.5" cy="19" r="3" stroke="#039BE5" stroke-width="1.2" fill="none"/>
          <line x1="15.5" y1="19" x2="16.5" y2="19" stroke="#039BE5" stroke-width="1"/>
          <path d="M13 23.5 Q16 25.5 19 23.5" stroke="#039BE5" stroke-width="1" fill="none" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="drh2o-panel" id="panel">
        <div class="drh2o-header">
          <span class="drh2o-header-title"><span class="avatar">💧</span><span id="chatbot-name"></span></span>
          <button class="drh2o-close" id="close-btn" aria-label="Close">&times;</button>
        </div>
        <div class="drh2o-messages" id="messages"></div>
        <div class="drh2o-input-area">
          <input class="drh2o-input" id="input" type="text" placeholder="" />
          <button class="drh2o-send" id="send-btn">Send</button>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    window.DrH2OElement = this;
    this.updatePlaceholders();
  }

  updatePlaceholders() {
    const fab = this.shadowRoot.getElementById('fab');
    const name = this.shadowRoot.getElementById('chatbot-name');
    const input = this.shadowRoot.getElementById('input');
    const sendBtn = this.shadowRoot.getElementById('send-btn');
    if (fab) fab.setAttribute('aria-label', I18n.t('chatbotName'));
    if (name) name.textContent = I18n.t('chatbotName');
    if (input) input.placeholder = I18n.t('askPlaceholder');
    if (sendBtn) sendBtn.textContent = I18n.t('sendBtn');
  }

  setupEvents() {
    const fab = this.shadowRoot.getElementById('fab');
    const closeBtn = this.shadowRoot.getElementById('close-btn');
    const sendBtn = this.shadowRoot.getElementById('send-btn');
    const input = this.shadowRoot.getElementById('input');
    fab.addEventListener('click', () => this.toggle());
    closeBtn.addEventListener('click', () => this.collapse());
    sendBtn.addEventListener('click', () => this.sendUserMessage());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.sendUserMessage();
    });
  }

  toggle() {
    if (!isTask2LabContextActive()) return;
    this._open ? this.collapse() : this.expand();
  }
  expand() {
    this._open = true;
    this.shadowRoot.getElementById('panel').classList.add('open');
    this.shadowRoot.getElementById('notif').classList.remove('visible');
    this.shadowRoot.getElementById('fab').classList.remove('shake');
    this.updatePlaceholders();
  }
  collapse() {
    this._open = false;
    this.shadowRoot.getElementById('panel').classList.remove('open');
  }

  onFilterComplete(result) {
    if (!isTask2LabContextActive()) return;
    this._lastResult = result;
    this._messages = [];
    this._conversationHistory = [];
    const notif = this.shadowRoot.getElementById('notif');
    const fab = this.shadowRoot.getElementById('fab');
    notif.classList.add('visible');
    fab.classList.add('shake');
    this.generateAnalysis(result);
  }

  async generateAnalysis(result) {
    if (!isTask2LabContextActive()) return;
    const lang = getChatLanguage();
    this._conversationHistory = [
      { role: 'system', content: buildSystemPrompt(lang) },
      { role: 'user', content: buildUserPayload(result, lang) },
    ];
    this.addMessage('bot', I18n.t('thinking'), true);
    this.renderMessages();
    const reply = await this.callOpenAI(this._conversationHistory);
    this._messages.pop();
    this.addMessage('bot', reply);
    this._conversationHistory.push({ role: 'assistant', content: reply });
    this.renderMessages();
  }

  async sendUserMessage() {
    if (!isTask2LabContextActive()) return;
    const input = this.shadowRoot.getElementById('input');
    const text = input.value.trim();
    if (!text || this._busy) return;
    input.value = '';
    this.addMessage('user', text);
    this.renderMessages();
    this.ensureSystemPrompt();
    this._conversationHistory.push({ role: 'user', content: text });
    this.addMessage('bot', I18n.t('thinking'), true);
    this.renderMessages();
    const reply = await this.callOpenAI(this._conversationHistory);
    this._messages.pop();
    this.addMessage('bot', reply);
    this._conversationHistory.push({ role: 'assistant', content: reply });
    this.renderMessages();
  }

  async callOpenAI(messages) {
    this._busy = true;
    this.shadowRoot.getElementById('send-btn').disabled = true;
    try {
      const res = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          language: getChatLanguage(),
          messages,
          max_tokens: 320,
          temperature: 0.7,
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content || I18n.t('errorAI');
    } catch (err) {
      console.error('Dr. H2O API error:', err);
      return this.fallbackAnalysis();
    } finally {
      this._busy = false;
      this.shadowRoot.getElementById('send-btn').disabled = false;
    }
  }

  ensureSystemPrompt() {
    const prompt = buildSystemPrompt(getChatLanguage());
    const systemPrompt = this._conversationHistory.find((message) => message.role === 'system');
    if (systemPrompt) {
      systemPrompt.content = prompt;
    } else {
      this._conversationHistory.unshift({ role: 'system', content: prompt });
    }
  }

  fallbackAnalysis() {
    const r = this._lastResult;
    if (!r) return I18n.t('errorAI');
    const lang = getChatLanguage();
    const lines = [];
    const ctx = collectTask2TrialContext(r, lang);

    const methodsLeftPhrase = ctx.notYetTried.length
      ? (lang === 'en' ? `method ${ctx.notYetTried.join(', method ')}` : `方法 ${ctx.notYetTried.join('、方法 ')}`)
      : '';

    if (lang === 'en') {
      if (r.clogged) {
        lines.push(
          '• The water does not pass through easily, almost like it is blocked.\n• Small-gap materials near the top can slow muddy water down.\n• Try changing the order, then compare whether the water flows better.'
        );
        if (methodsLeftPhrase) {
          lines.push(`• You can also try ${methodsLeftPhrase} from the worksheet and compare which water looks clearer.`);
        }
        lines.push('🔍 Look carefully: is the water clear, and does it flow quickly?');
        return lines.join('\n\n');
      }

      if (r.task2Variant) {
        lines.push(`• You just tried worksheet method ${r.task2Variant}.\n• Top to bottom: "${layersToTopDown(r.layers, lang)}".`);
      } else {
        lines.push(`• This order is "${layersToTopDown(r.layers, lang)}" from top to bottom.`);
      }

      const explanation = translateScienceExplanation(r.scienceExplanation, lang);
      if (explanation) lines.push(`• ${explanation}`);
      else {
        if (r.layers[0] !== 'gravel' && r.layers.includes('gravel')) {
          lines.push('• Gravel works well near the top because it can catch larger dirt first.');
        }
        if (r.layers.includes('cotton') && r.layers[r.layers.length - 1] !== 'cotton') {
          lines.push('• Cotton has small gaps, so it often works well near the end to catch tiny dirt.');
        }
      }

      if (methodsLeftPhrase) {
        lines.push(`• Try ${methodsLeftPhrase} next and compare the water colour and flow speed.`);
      } else if (ctx.referenceTried.length >= 3) {
        lines.push('• Now compare all three methods: which looked clearest, and which flowed most smoothly?');
      }

      lines.push('🔍 Look carefully: what changes when you switch the order?');
      return lines.join('\n\n');
    }

    if (r.clogged) {
      lines.push(
        '• 水流好像不太容易穿過，有點像「卡住」了。\n• 細小、孔隙小的濾材若在泥水要先經過的地方，比較容易塞住。\n• 不妨調整上下的次序，再看看流得快不快。'
      );
      if (methodsLeftPhrase) {
        lines.push(`• 也可以照工作紙試試 ${methodsLeftPhrase}，比一比哪種水清、哪種流得順。`);
      }
      lines.push('🔍 看看：流出的水快慢怎樣？再換個方法時，水清不清有沒有變化？');
      return lines.join('\n\n');
    }

    if (r.task2Variant) {
      lines.push(`• 你剛試的是工作紙上的方法 ${r.task2Variant}。\n• 由上而下：「${layersToTopDown(r.layers, lang)}」。`);
    } else {
      lines.push(`• 你這次由上而下的次序是「${layersToTopDown(r.layers, lang)}」。`);
    }

    if (r.scienceExplanation) lines.push(`• ${r.scienceExplanation}`);
    else {
      if (r.layers[0] !== 'gravel' && r.layers.includes('gravel')) {
        lines.push('• 大石頭若在比較靠近出水的那一側，就比較難先擋住最大的雜質。');
      }
      if (r.layers.includes('cotton') && r.layers[r.layers.length - 1] !== 'cotton') {
        lines.push('• 棉花孔隙小，常放在最接近出水的那一層，幫忙擋細細的污物。');
      }
    }

    if (methodsLeftPhrase) {
      lines.push(`• 再試試 ${methodsLeftPhrase}吧，把水的顏色和流速跟這次比一比。`);
    } else if (ctx.referenceTried.length >= 3) {
      lines.push('• 三種方法都試過的話，回想哪一次水看起來最亮、哪一次流得最爽快。');
    }

    lines.push('🔍 看看：水清嗎？水流得快不快？換一種排法時，你有甚麼新發現？');
    return lines.join('\n\n');
  }

  addMessage(role, text, isThinking = false) {
    this._messages.push({ role, text, isThinking });
    if (!isThinking && window.DataLogger) {
      DataLogger.logChatMessage(role === 'bot' ? 'assistant' : 'user', text);
    }
  }

  renderMessages() {
    const container = this.shadowRoot.getElementById('messages');
    container.innerHTML = '';
    this._messages.forEach((msg) => {
      const div = document.createElement('div');
      div.className = `drh2o-msg ${msg.role}${msg.isThinking ? ' thinking' : ''}`;
      div.textContent = msg.text;
      container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
  }
}

customElements.define('dr-h2o', DrH2O);
