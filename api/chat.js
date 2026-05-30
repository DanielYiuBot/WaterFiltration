import { randomInt } from 'node:crypto';

/**
 * Collect all configured OpenAI-compatible API keys (deduped).
 * Sources (any combination):
 * - OPENAI_API_KEYS: comma- or newline-separated list
 * - OPENAI_API_KEY_1 … OPENAI_API_KEY_10 (or more indices if you add env vars)
 * - OPENAI_API_KEY: single key (backward compatible)
 */
function collectApiKeys() {
  const raw = [];

  const list = process.env.OPENAI_API_KEYS;
  if (typeof list === 'string' && list.trim()) {
    raw.push(...list.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean));
  }

  for (let i = 1; i <= 10; i++) {
    const v = process.env[`OPENAI_API_KEY_${i}`];
    if (typeof v === 'string' && v.trim()) raw.push(v.trim());
  }

  const single = process.env.OPENAI_API_KEY;
  if (typeof single === 'string' && single.trim()) raw.push(single.trim());

  return [...new Set(raw)];
}

function pickApiKey(keys) {
  if (!keys.length) return '';
  return keys[randomInt(keys.length)];
}

function normalizeLanguage(language) {
  return language === 'en' ? 'en' : 'zh';
}

function buildLanguageGuard(language) {
  if (normalizeLanguage(language) === 'en') {
    return 'The user interface language setting is English. You MUST respond only in English for this reply. Do not answer in Chinese unless the user explicitly asks for translation.';
  }

  return '使用者介面語言設定是中文。你必須只使用繁體中文回覆這一次訊息。除非使用者明確要求翻譯，否則不要使用英文作答。';
}

function withLanguageGuard(messages, language) {
  const safeMessages = Array.isArray(messages) ? messages : [];
  return [
    { role: 'system', content: buildLanguageGuard(language) },
    ...safeMessages,
  ];
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKeys = collectApiKeys();
  const apiKey = pickApiKey(apiKeys);
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://ai01.ev-cuhk.net/v1').replace(/\/$/, '');

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const { model, messages, max_tokens, temperature, language } = req.body;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-5',
        messages: withLanguageGuard(messages, language),
        max_tokens: max_tokens || 500,
        temperature: temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);
  } catch (err) {
    console.error('[api/chat] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
