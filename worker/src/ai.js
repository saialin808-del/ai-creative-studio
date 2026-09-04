// AI Creative Studio — AI Router (Gemini) — Phase 3d (text + image)
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

async function callGeminiText(env, { model, system, prompt, apiKey }) {
  const key = apiKey || env.GEMINI_API_KEY;
  if (!key) throw new Error('no_api_key');
  const body = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(GEMINI_BASE + '/models/' + model + ':generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch (e) { lastErr = new Error('bad_response (gateway/timeout)'); continue; }
      if (!res.ok) {
        lastErr = new Error((data.error && data.error.message) || ('gemini_error_' + res.status));
        if (res.status === 429 || res.status >= 500) continue;
        break;
      }
      const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
      return parts ? parts.map(p => p.text || '').join('').trim() : '';
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 800));
    }
  }
  throw lastErr || new Error('gemini_failed');
}

async function callGeminiImage(env, { model, prompt, apiKey }) {
  const key = apiKey || env.GEMINI_API_KEY;
  if (!key) throw new Error('no_api_key');
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(GEMINI_BASE + '/models/' + model + ':generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch (e) { lastErr = new Error('bad_response (gateway/timeout)'); continue; }
      if (!res.ok) {
        lastErr = new Error((data.error && data.error.message) || ('gemini_error_' + res.status));
        if (res.status === 429 || res.status >= 500) continue;
        break;
      }
      const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
      const img = parts && parts.find(p => p.inlineData && p.inlineData.data);
      if (!img) throw new Error('no_image');
      return { data: img.inlineData.data, mimeType: img.inlineData.mimeType || 'image/png' };
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 800));
    }
  }
  throw lastErr || new Error('image_failed');
}

export { callGeminiText, callGeminiImage };
