/* ============================================================
   chatbot.js – Dr. H2O  Web Component + OpenAI Integration
   ============================================================ */

const OPENAI_MODEL = 'gpt-5-nano';
const OPENAI_URL   = '/api/chat';   // Vercel serverless function (API key stored server-side)

/* ---------- System prompt builder ---------- */
function buildSystemPrompt(lang) {
  const langInstr = lang === 'zh'
    ? '請用繁體中文、親切簡短的口吻回覆。'
    : 'Reply in English, friendly and concise.';

  return `你是 Dr. H₂O，一位專注於物理濾水的科學老師。${langInstr}

你的職責：
1. 檢視學生的實驗數據（濾材順序、場景、水質結果）。
2. 給出 0-100 的評分（已由系統計算，直接引用即可）。
3. 根據以下規則給出建議：
   - 如果大石子（Gravel）沒放在最上層，提醒大顆粒會堵塞下方細砂。
   - 如果沒用活性碳（Activated Carbon）處理池塘水（場景 B），提醒無法去味。
   - 如果棉花（Cotton）沒放在最底層，提醒細砂可能流失。
   - 如果發生堵塞（clogged），解釋細砂或棉花放在頂部會阻擋水流。
   - 如果順序完美，給予鼓勵。
4. 回覆控制在 3-5 句以內。
5. 學生後續提問時，根據物理過濾原理回答，保持友善教學風格。`;
}

function buildUserPayload(result) {
  const layerNames = result.layers.map(m => {
    const map = { gravel: '大石子/Gravel', sand: '細砂/Sand', carbon: '活性碳/Carbon', cotton: '棉花/Cotton' };
    return map[m] || m;
  });

  return `以下是學生的實驗數據：
場景: ${result.scenario === 'A' ? '泥濘的河水 (Muddy River)' : '發臭的景觀池水 (Smelly Pond)'}
濾材順序 (由上到下): ${layerNames.join(' → ')}
清澈度: ${result.clarity}%
氣味等級: ${result.odorLevel}
過濾時間: ${result.clogged ? '堵塞 (clogged)' : result.flowTime + '秒'}
系統評分: ${result.score}/100

請給出你的分析與建議。`;
}

/* ============================================================
   Dr. H2O Custom Element
   ============================================================ */
class DrH2O extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = false;
    this._messages = [];         // { role: 'bot'|'user', text }
    this._conversationHistory = []; // OpenAI messages array
    this._lastResult = null;
    this._busy = false;

    this.render();
    this.setupEvents();
  }

  /* ---- Render (Shadow DOM) ---- */
  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/chatbot.css" />

      <!-- Floating Action Button -->
      <button class="drh2o-fab" id="fab" aria-label="Dr. H₂O">
        <span class="notif-dot" id="notif"></span>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Water drop body -->
          <path d="M16 4 C16 4 6 16 6 21 C6 26.5 10.5 29 16 29 C21.5 29 26 26.5 26 21 C26 16 16 4 16 4Z"
                fill="white" fill-opacity="0.9" stroke="white" stroke-width="0.5"/>
          <!-- Glasses -->
          <circle cx="12.5" cy="19" r="3" stroke="#039BE5" stroke-width="1.2" fill="none"/>
          <circle cx="19.5" cy="19" r="3" stroke="#039BE5" stroke-width="1.2" fill="none"/>
          <line x1="15.5" y1="19" x2="16.5" y2="19" stroke="#039BE5" stroke-width="1"/>
          <!-- Smile -->
          <path d="M13 23.5 Q16 25.5 19 23.5" stroke="#039BE5" stroke-width="1" fill="none" stroke-linecap="round"/>
        </svg>
      </button>

      <!-- Chat Panel -->
      <div class="drh2o-panel" id="panel">
        <div class="drh2o-header">
          <span class="drh2o-header-title">
            <span class="avatar">💧</span>
            Dr. H₂O
          </span>
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
    // Make globally accessible
    window.DrH2OElement = this;
    this.updatePlaceholders();
  }

  updatePlaceholders() {
    const input   = this.shadowRoot.getElementById('input');
    const sendBtn = this.shadowRoot.getElementById('send-btn');
    if (input)   input.placeholder = I18n.t('askPlaceholder');
    if (sendBtn) sendBtn.textContent = I18n.t('sendBtn');
  }

  /* ---- Events ---- */
  setupEvents() {
    const fab      = this.shadowRoot.getElementById('fab');
    const closeBtn = this.shadowRoot.getElementById('close-btn');
    const sendBtn  = this.shadowRoot.getElementById('send-btn');
    const input    = this.shadowRoot.getElementById('input');

    fab.addEventListener('click', () => this.toggle());
    closeBtn.addEventListener('click', () => this.collapse());
    sendBtn.addEventListener('click', () => this.sendUserMessage());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.sendUserMessage();
    });
  }

  /* ---- Expand / Collapse ---- */
  toggle() {
    this._open ? this.collapse() : this.expand();
  }

  expand() {
    this._open = true;
    this.shadowRoot.getElementById('panel').classList.add('open');
    // Clear notification
    this.shadowRoot.getElementById('notif').classList.remove('visible');
    this.shadowRoot.getElementById('fab').classList.remove('shake');
    this.updatePlaceholders();
  }

  collapse() {
    this._open = false;
    this.shadowRoot.getElementById('panel').classList.remove('open');
  }

  /* ---- Called by Lab when filtering completes ---- */
  onFilterComplete(result) {
    this._lastResult = result;

    // Reset conversation for new experiment
    this._messages = [];
    this._conversationHistory = [];

    // Show notification
    const notif = this.shadowRoot.getElementById('notif');
    const fab   = this.shadowRoot.getElementById('fab');
    notif.classList.add('visible');
    fab.classList.add('shake');

    // Auto-generate analysis
    this.generateAnalysis(result);
  }

  /* ---- AI: Generate initial analysis ---- */
  async generateAnalysis(result) {
    const lang = I18n.getLang();
    const systemMsg = buildSystemPrompt(lang);
    const userMsg   = buildUserPayload(result);

    this._conversationHistory = [
      { role: 'system', content: systemMsg },
      { role: 'user',   content: userMsg },
    ];

    /* ---- Debug logging ---- */
    console.group('%c[Dr. H2O] Prompt', 'color:#E91E63;font-weight:bold');
    console.log('%cSystem Prompt:', 'font-weight:bold');
    console.log(systemMsg);
    console.log('%cUser Payload:', 'font-weight:bold');
    console.log(userMsg);
    console.groupEnd();

    // Add thinking indicator
    this.addMessage('bot', I18n.t('thinking'), true);
    this.renderMessages();

    const reply = await this.callOpenAI(this._conversationHistory);

    // Remove thinking, add real reply
    this._messages.pop();
    this.addMessage('bot', reply);
    this._conversationHistory.push({ role: 'assistant', content: reply });
    this.renderMessages();

    console.group('%c[Dr. H2O] AI Reply', 'color:#4CAF50;font-weight:bold');
    console.log(reply);
    console.groupEnd();
  }

  /* ---- AI: Handle user follow-up questions ---- */
  async sendUserMessage() {
    const input = this.shadowRoot.getElementById('input');
    const text = input.value.trim();
    if (!text || this._busy) return;

    input.value = '';
    this.addMessage('user', text);
    this.renderMessages();

    this._conversationHistory.push({ role: 'user', content: text });

    // Thinking
    this.addMessage('bot', I18n.t('thinking'), true);
    this.renderMessages();

    const reply = await this.callOpenAI(this._conversationHistory);

    this._messages.pop(); // remove thinking
    this.addMessage('bot', reply);
    this._conversationHistory.push({ role: 'assistant', content: reply });
    this.renderMessages();
  }

  /* ---- OpenAI API Call (via Vercel serverless proxy) ---- */
  async callOpenAI(messages) {
    this._busy = true;
    this.shadowRoot.getElementById('send-btn').disabled = true;

    try {
      const res = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: messages,
          max_tokens: 500,
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

  /**
   * Offline fallback analysis when no API key is set.
   * Provides rule-based feedback matching the system prompt logic.
   */
  fallbackAnalysis() {
    const r = this._lastResult;
    if (!r) return I18n.t('errorAI');

    const lang = I18n.getLang();
    const lines = [];

    // Score
    if (lang === 'zh') {
      lines.push(`📊 實驗評分：${r.score}/100`);
    } else {
      lines.push(`📊 Experiment Score: ${r.score}/100`);
    }

    // Clog check
    if (r.clogged) {
      lines.push(lang === 'zh'
        ? '⚠️ 你的濾水器堵塞了！棉花放在最上方，纖維太細會被髒水直接堵住。試試把大石子放在最上面吧。'
        : '⚠️ Your filter is clogged! Cotton on top gets saturated instantly by dirty water. Try putting gravel on top.');
      return lines.join('\n\n');
    }

    // Too few materials hint
    const uniqueMats = new Set(r.layers);
    const idealCount = r.scenario === 'B' ? 4 : 3;
    if (uniqueMats.size < idealCount) {
      lines.push(lang === 'zh'
        ? `🧪 你目前只用了 ${uniqueMats.size} 種濾材。試試多加幾層，不同材料各有不同的過濾效果喔！`
        : `🧪 You used only ${uniqueMats.size} material(s). Try adding more – each material filters differently!`);
    }

    // Sand on top warning (not clogged, but suboptimal)
    if (r.layers.length >= 2 && r.layers[0] === 'sand') {
      lines.push(lang === 'zh'
        ? '⚠️ 細砂放在最上方會讓水流變慢。大石子比較適合放在最上層，先攔截大顆粒。'
        : '⚠️ Sand on top slows water flow significantly. Gravel works better as the first layer to catch large debris.');
    }

    // Order check: gravel should be on top
    if (r.layers.length > 0 && r.layers[0] !== 'gravel' && r.layers.includes('gravel')) {
      lines.push(lang === 'zh'
        ? '💡 大石子應該放在最上層，這樣才能先攔截大型雜質，避免堵塞下方的細砂。'
        : '💡 Gravel should be the top layer to catch large debris first and prevent clogging below.');
    }

    // Cotton should be at bottom
    if (r.layers.includes('cotton') && r.layers[r.layers.length - 1] !== 'cotton') {
      lines.push(lang === 'zh'
        ? '💡 棉花適合放在最底層，防止細砂從出水口流出。'
        : '💡 Cotton works best at the bottom to prevent sand from escaping.');
    }

    // Scenario B: need carbon
    if (r.scenario === 'B' && !r.layers.includes('carbon')) {
      lines.push(lang === 'zh'
        ? '🔬 這是池塘水，有臭味！你需要加入活性碳來吸附異味分子喔。'
        : '🔬 This is pond water with odor! You need activated carbon to adsorb smell molecules.');
    }

    // Scenario B: has carbon but odor still medium
    if (r.scenario === 'B' && r.layers.includes('carbon') && r.odorLevel === 'medium') {
      lines.push(lang === 'zh'
        ? '👃 活性碳有發揮作用，但氣味還沒完全消除。可以試試調整順序。'
        : '👃 Activated carbon is helping, but some odor remains. Try adjusting the layer order.');
    }

    // Clarity feedback
    if (r.clarity >= 90) {
      lines.push(lang === 'zh' ? '✨ 水質非常清澈，做得很好！' : '✨ Water is very clear, great job!');
    } else if (r.clarity >= 60) {
      lines.push(lang === 'zh' ? '💧 水質還算可以，但還能更清澈。試試加入更多濾材層。' : '💧 Water clarity is decent but could be better. Try adding more filter layers.');
    } else {
      lines.push(lang === 'zh' ? '🌊 水還是相當渾濁，需要更多濾材來過濾。' : '🌊 Water is still quite turbid. More filter materials are needed.');
    }

    // Perfect order praise
    const ideal = ['gravel', 'sand', 'carbon', 'cotton'];
    if (r.layers.length === 4 && r.layers.every((m, i) => m === ideal[i])) {
      lines.push(lang === 'zh' ? '🏆 完美的濾材順序！你已經掌握了物理過濾的核心原理。' : '🏆 Perfect layer order! You\'ve mastered the core principles of physical filtration.');
    }

    return lines.join('\n\n');
  }

  /* ---- Message management ---- */
  addMessage(role, text, isThinking = false) {
    this._messages.push({ role, text, isThinking });
    if (!isThinking && window.DataLogger) {
      DataLogger.logChatMessage(role === 'bot' ? 'assistant' : 'user', text);
    }
  }

  renderMessages() {
    const container = this.shadowRoot.getElementById('messages');
    container.innerHTML = '';

    for (const msg of this._messages) {
      const div = document.createElement('div');
      div.className = `drh2o-msg ${msg.role}${msg.isThinking ? ' thinking' : ''}`;
      div.textContent = msg.text;
      container.appendChild(div);
    }

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }
}

/* Register the custom element */
customElements.define('dr-h2o', DrH2O);
