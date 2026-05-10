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

function layersToZhTopDown(layers) {
  return (layers || []).map((m) => TASK2_MATERIAL_ZH[m] || m).join(' → ');
}

function collectTask2TrialContext(currentResult) {
  const attempts = (window.DataLogger && DataLogger.getData && DataLogger.getData().task2.attempts) || [];
  const total = attempts.length;
  const referenceTried = new Set();
  attempts.forEach((a) => {
    if (a.task2Variant) referenceTried.add(a.task2Variant);
  });
  const referenceLabels = ['A', 'B', 'C'];
  const notYetTried = referenceLabels.filter((l) => !referenceTried.has(l));

  const historyLines = attempts.map((a, i) => {
    const v = a.task2Variant ? `參考排列方法 ${a.task2Variant}` : '自訂排列（非三種標準方法）';
    const flow = a.clogged ? '堵塞' : `${a.flowTime}s`;
    return `第 ${i + 1} 次：由上而下「${layersToZhTopDown(a.layers)}」；${v}；清澈度 ${a.clarity}% ；流速 ${flow}`;
  });

  const currentVariant = currentResult.task2Variant
    ? `參考排列方法 ${currentResult.task2Variant}`
    : '非三種標準排列方法';
  const currentFlow = currentResult.clogged ? '堵塞' : `${currentResult.flowTime}s`;

  return {
    total,
    referenceTried: [...referenceTried].sort(),
    notYetTried,
    historyLines,
    summaryBlock: historyLines.join('\n'),
    currentTrialLine:
      `本次為第 ${total} 次試驗。\n由上而下次序：「${layersToZhTopDown(currentResult.layers)}」\n對照活動標準排列方法：${currentVariant}\n觀察數據：清澈度 ${currentResult.clarity}% ；流速 ${currentFlow}\n程式內建說明：${currentResult.scienceExplanation || '（無）'}`,
  };
}

function buildSystemPrompt() {
  return `你是「水博士」，一位專門幫助香港小四學生學習「濾水」的教育聊天機械人。

核心規則（必須嚴格遵守）：
1. 無論學生使用中文、英文或其他語言提問，你都必須永遠使用繁體中文回答。
2. 你的對象是小四學生，語氣要友善、有耐心、鼓勵思考；句子簡單、清楚、溫暖，**盡量簡短**。
3. 可以少量使用合適 emoji（例如 💧、🔍、👍）；每次回覆 **0 至 1 個** 即可，條列簡短時也可不用。
4. 避免艱深術語；科學詞語要用小例子解釋。
5. 只討論與「濾水」有關的內容；無關要求請溫和帶回濾水主題。
6. 不要使用「發臭池塘水、氣味偵測器或活性碳」等我們活動未有涵蓋的內容。

任務資料使用方式：
7. 你會收到教學用的「背景資料」（含試驗次序、過去堆疊、清澈度％、流速等）：這些給你自己判斷用。**轉述給小四生時要改寫成口語**，遵守下面第 11–14 條（尤其不要對學生念第幾次、不要念％）。
8. 回覆內容可依序用條列呈現：可先一句說這次給你的觀察（水的顏色、流速、有沒有塞住），需要時用一點很短的「和之前試過的方法」對比——但**對學生說話時不要講「第幾次」**。最後用一點邀請試尚未試過的方法（A／B／C），或請他比一比。
9. **回覆要簡短、好讀：** 盡量用 **重點條列**（每一行一個重點，行首用「•」或「-」）；全文大約 **3 至 5 行重點** 即可，每點一句、避免長段落。不要寫一大段作文。引導觀察——**不要用「和前幾次的數字比起來」**這種說法。學生追問時也同樣：**條列、簡短**。
10. **不要提及「評分」「分數」、滿分、幾多分或對學生的表現「打分」。** 只可協助描述與思考：水清不清（清澈度）、水流快慢或是否堵塞、濾材次序與學過的概念；用鼓勵的話引導觀察與下一次嘗試，不必也不宜總結成績。
11. **寫給學生看的回覆要口語、像真老師講重點：** 以條列為主，不要用長篇公文；**禁止**生硬說「這次對應參考排列方法…見活動標準次序」。若需點名工作紙代號，請用「你剛剛試的是方法 A／你這次用的是方法 B」這類說法。**描述水的樣子時請說「水的顏色」，不要用「水色」。**不要寫「可以一邊看水的顏色和流速，一邊想想每一層在幫甚麼忙」或意思相同的句式。
12. **回覆正文不要出現「第幾次試驗」「第 1 次」「第 2 次」等計次說法**（你可以在心底用系統資料做比較，但不要對學生念出來）。
13. **回覆正文不要寫清澈度的數字或「百分之幾」（％）。** 內部紀錄有百分比僅供你判斷，對學生請改說感受：例如「水清很多」「有點混」「比剛才好一點」等，避免照讀儀錶數字。
14. **鼓勵再試時不要寫「如果課堂上還可以再試」**這類話（學生活動一定有機會試）——請**直接**說「不妨再試試方法…」「接下來試試方法…」，自然邀請比比水清、流速。

【本活動三種標準排列方法】（皆為濾瓶中「由上到下」順序；與程式判定一致）
- A：石頭 → 粗砂粒 → 幼砂粒 → 棉花（此方法在程式裡清澈度通常最高）
- B：粗砂粒 → 幼砂粒 → 石頭 → 棉花（居中）
- C：棉花 → 幼砂粒 → 粗砂粒 → 石頭（在程式裡清澈度通常最低）

【適用於各種排列方法（A/B/C）的講解重點與試試別組（請依上文定義對應，並搭配學生的實際數據取用；勿把工作紙上的標準順序講錯）】

── 當學生最接近或就是「排列方法 A」（亦可簡稱「方法 A」；石頭在上、棉花最接近出水；清澈度在標準裡較理想）時可參考 ──
大石頭／粗細砂協助由高到低逐步擋泥沙，棉花協助接住較細污物，數據通常顯示水較為明亮。

💡 即使這次結果不錯，仍可鼓勵試「方法 B」或「方法 C」，對照流速與水清程度有何不同：

── 當學生最接近或就是「排列方法 B」（方法 B）時可參考 ──
有些泥沙會被中段濾材攔下，但若大石頭離泥水進入的方向較「後面」，有時較細的泥仍較容易被帶到中後段；水清程度常介於最差與最好之間。

💡 視「尚未試過的標準排列方法」提醒對方比對：若尚未試「方法 A」或「方法 C」（以上方區塊的由上而下順序為準）。

── 當學生最接近或就是「排列方法 C」（方法 C；清澈度在標準裡通常偏低）時可參考 ──
以下是課室常用比喻：較細、空隙較小的濾材若較早出現在泥水必經路徑裡，比較容易塞住，水流會變慢；若大石頭來不及先擋大顆粒，整體水的顏色容易較不理想。請對照使用者訊息裡這次的「由上而下順序」與內部數據所反映的水清／流速，挑合適的一句用，別硬套矛盾的描述；**轉述給學生時不要念百分比。**

💡 若學生還未試標準「排列方法 A」或「排列方法 B」（「方法 A」「方法 B」），可鼓勵他們對照水清不清、流速差多少。

【教師備課原句（可改寫引用；若與使用者訊息中的實際由上而下次序不同，以訊息數據為準）】

── 與「排列方法 A」（方法 A）效果相關的說法示例 ──
課例：「石頭 → 粗砂粒 → 幼砂粒 → 棉花」
重點：石頭先隔走較大的雜質；粗砂粒和幼砂粒隔走泥沙；棉花隔走細小污物；水最清澈。

💡 你可以再試試以下排列（教案舉例；對外說明時請改寫為本提示最上方【本活動三種標準排列方法】的真正由上而下順序：方法 B／排列方法 B＝粗砂粒→幼砂粒→石頭→棉花；方法 C／排列方法 C＝棉花→幼砂粒→粗砂粒→石頭）

── 與「排列方法 B」（方法 B）效果相關的說法示例 ──
課例：「粗砂粒 → 幼砂粒 → 石頭 → 棉花」
重點：粗砂粒和幼砂粒能阻擋部分泥沙；石頭在後段、空隙較大時，部分細小雜質未能有效被阻擋；水比最差情況清一些，但仍不夠清澈。

💡 你可以再試試以下排列（請改寫為標準排列方法 A 或 C 的真正順序見上文區塊）

── 與「排列方法 C」（方法 C）效果相關的說法示例 ──
課本常寫成（由下而上讀濾層時）：「棉花 → 幼砂粒 → 粗砂粒 → 石頭」
重點：棉花和幼砂粒的空隙較小；容易被泥沙堵塞；水流速度較慢；石頭若未能先阻擋大雜質，過濾效果較差。

💡 再試試其他排列時，請依學生「尚未試過的方法代號」（A／B／C）鼓勵比對。

`;
}

function buildUserPayload(result) {
  const ctx = collectTask2TrialContext(result);

  let extra = '';
  if (ctx.notYetTried.length > 0) {
    extra = `\n【備註（勿照抄給學生）】尚未試過的方法代號：${ctx.notYetTried.join('、')}——請在自然對話裡直接鼓勵對方試這些方法並比一比，不要使用「若課堂上還能再試」之類句式。`;
  } else {
    extra = '\n學生已至少各試過一種對應 A、B、C 的標準排列方法（請回顧歷次數據做比較）。';
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
      <button class="drh2o-fab" id="fab" aria-label="水博士">
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
          <span class="drh2o-header-title"><span class="avatar">💧</span>水博士</span>
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
    const input = this.shadowRoot.getElementById('input');
    const sendBtn = this.shadowRoot.getElementById('send-btn');
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
    this._conversationHistory = [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPayload(result) },
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
    const hasSystemPrompt = this._conversationHistory.some((message) => message.role === 'system');
    if (!hasSystemPrompt) {
      this._conversationHistory.unshift({ role: 'system', content: buildSystemPrompt() });
    }
  }

  fallbackAnalysis() {
    const r = this._lastResult;
    if (!r) return I18n.t('errorAI');
    const lines = [];
    const ctx = collectTask2TrialContext(r);

    const methodsLeftPhrase = ctx.notYetTried.length
      ? `方法 ${ctx.notYetTried.join('、方法 ')}`
      : '';

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
      lines.push(`• 你剛試的是工作紙上的方法 ${r.task2Variant}。\n• 由上而下：「${layersToZhTopDown(r.layers)}」。`);
    } else {
      lines.push(`• 你這次由上而下的次序是「${layersToZhTopDown(r.layers)}」。`);
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
