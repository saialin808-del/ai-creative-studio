// AI Creative Studio — AI Router (Gemini) — Phase 3
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

async function callGeminiText(env, { model, system, prompt, apiKey }) {
  const key = apiKey || env.GEMINI_API_KEY;
  if (!key) throw new Error('no_api_key');
  const body = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  const res = await fetch(GEMINI_BASE + '/models/' + model + ':generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data.error && data.error.message) || 'gemini_error');
  }
  const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
  if (!parts) return '';
  return parts.map(p => p.text || '').join('').trim();
}

export { callGeminiText };
