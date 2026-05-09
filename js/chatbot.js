/* ============================================================
  chatbot.js – 水博士 for V2 Tasks
  ============================================================ */

const OPENAI_MODEL = 'gpt-5-nano';
const OPENAI_URL = '/api/chat';

function buildSystemPrompt() {
  return `你是「水博士」，一位專門幫助香港小四學生學習「濾水」的教育聊天機械人。

核心規則（必須嚴格遵守）：
1. 無論學生使用中文、英文或其他語言提問，你都必須永遠使用繁體中文回答。
2. 你的對象是小四學生，所以語氣要像一位友善、有耐心、鼓勵學生思考的老師；用簡單、清楚、溫暖的句子回答。
3. 可以少量使用合適 emoji 令語氣更親切，例如 💧、🔍、👍、🌟；但不要每句都用，通常每次回覆 0 至 2 個 emoji 已足夠。
4. 避免艱深術語；如需使用科學詞語，必須用小四學生容易明白的例子解釋。
5. 你只能討論與「濾水」有關的內容，包括：濾材、孔隙大小、濁度、清澈度、水流速度、堵塞、濾材排序、泥濘河水、物理過濾、實驗結果分析。
6. 如果學生提出任何與濾水無關的要求（例如遊戲、故事、功課答案、閒聊、翻譯、編程、天氣、個人問題等），不要回答該要求；請溫和地把話題帶回濾水。
7. 不要提及發臭池塘水、氣味偵測器或活性碳，因為這些已不是本活動內容。
8. 回答一般保持 2 至 5 句；如學生需要步驟，可以用簡短條列。

當你分析實驗結果時，請重點提示：
- 較大孔隙的材料（石頭、粗砂粒）較適合先攔截大顆粒。
- 較小孔隙的材料（細砂粒、棉花）較適合放後面，幫助濾走細小泥沙。
- 如果水流太慢或堵塞，引導學生思考是否太細的材料放得太前。
- 如果水仍然混濁，引導學生比較不同濾材的孔隙大小和排列次序。`;
}

function buildUserPayload(result) {
  const map = { gravel: '石頭/Gravel', pebble: '粗砂粒/Pebble', sand: '細砂粒/Sand', cotton: '棉花/Cotton' };
  const layerNames = (result.layers || []).map((m) => map[m] || m);
  return `學生任務 2 過濾結果：
濾材順序(上到下): ${layerNames.join(' -> ')}
清澈度: ${result.clarity}%
流速: ${result.clogged ? 'clogged' : result.flowTime + 's'}
分數: ${result.score}/100
請給 3-5 句建議。`;
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

  toggle() { this._open ? this.collapse() : this.expand(); }
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
          max_tokens: 400,
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
    lines.push(`評分：${r.score}/100`);
    if (r.clogged) {
      lines.push('你的濾材堵塞了，避免把棉花放在最上層。');
      return lines.join('\n\n');
    }
    if (r.layers[0] !== 'gravel' && r.layers.includes('gravel')) {
      lines.push('建議把石頭放在上層先擋大顆粒。');
    }
    if (r.layers.includes('cotton') && r.layers[r.layers.length - 1] !== 'cotton') {
      lines.push('建議把棉花放在最底部做最後過濾。');
    }
    lines.push(r.clarity >= 70
      ? '清澈度不錯，再微調順序可更好。'
      : '清澈度偏低，試試調整濾材順序。');
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
