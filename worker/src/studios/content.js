// AI Creative Studio — Content Studio Backend 
// Studio Isolation: ဤ File သည် Content Studio နှင့်သာ သက်ဆိုင်သည်။
// အခြား Studio (Story/Short/Image/Voice/Shop) ကို မထိခိုက်စေရ။
// Shared Logic (Parser, AI Call, CMS) ကို core/ မှ ခေါ်သုံးသည်။

import { getCMSData, buildSystemPrompt } from '../core/cms.js';
import { callGeminiText, callGeminiImage, callGeminiMultimodal, callGeminiTTS } from '../core/ai.js';
import { resolveModel } from '../core/aiModels.js';
import { parseContentResponse, parseVideoPlan, pcmToWavBase64 } from '../core/utilities.js';

const CMS_STUDIO = 'CONTENT';
const CMS_VIDEO = 'CONTENTVIDEO';

// ============================================================
// Tab 1 — Content Generate
// ============================================================
export async function generateContent(env, { idea, type, plan, apiKey, model }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, CMS_STUDIO, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  const prompt = system
    ? (system + '\n\nUSER IDEA:\n' + String(idea).trim())
    : String(idea).trim();
    const raw = await callGeminiText(env, { model: await resolveModel(env, 'text', plan, model), prompt, apiKey });
  return parseContentResponse(raw);
}

// ============================================================
// Tab 1 — Text → Voice (TTS)
// Gemini TTS မှ L16 PCM ကို WAV အဖြစ် ပြောင်းပြီး ပြန်ပေးသည်
// ============================================================
export async function generateContentVoice(env, { text, voiceName, apiKey, model, plan }) {
  if (!text || !String(text).trim()) throw new Error('missing_text');
  const tts = await callGeminiTTS(env, {
    text: String(text).trim(),
    voiceName: voiceName || 'Kore',
    apiKey,
    model: await resolveModel(env, 'voice', plan, model),
  });
  const wavBase64 = pcmToWavBase64(tts.data, { sampleRate: 24000, bitsPerSample: 16, channels: 1 });
  return { data: wavBase64, mimeType: 'audio/wav' };
}

// ============================================================
// Tab 1 — Content Revise (Chat Revision)
// Original Content + Speaking + Voice ကို ထိန်းသိမ်းပြီး Feedback အရ ပြင်ဆင်သည်
// ============================================================
export async function reviseContent(env, { originalContent, originalSpeaking, originalVoice, feedback, type, plan, apiKey, model }) {
  if (!feedback || !String(feedback).trim()) throw new Error('missing_feedback');
  const c = await getCMSData(env, CMS_STUDIO, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  let prompt = system + '\n\n';
  prompt += 'ORIGINAL CONTENT:\n' + (originalContent || '(empty)') + '\n\n';
  if (originalSpeaking) prompt += 'ORIGINAL SPEAKING STYLE:\n' + originalSpeaking + '\n\n';
  if (originalVoice) prompt += 'ORIGINAL VOICE STYLE:\n' + originalVoice + '\n\n';
  prompt += 'USER FEEDBACK:\n' + String(feedback).trim() + '\n\n';
  prompt += 'Please revise the content based on the user feedback. ' +
    'Return in the same format: [CONTENT], [SPEAKING_STYLE], [VOICE_STYLE].';
  const raw = await callGeminiText(env, { model: await resolveModel(env, 'text', plan, model), prompt, apiKey });
  return parseContentResponse(raw);
}

// ============================================================
// Tab 2 — Content Video Plan (Scenes + Characters)
// ============================================================
export async function generateContentVideo(env, { idea, type, plan, apiKey, model }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, CMS_VIDEO, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  const prompt = system
    ? (system + '\n\nUSER IDEA:\n' + String(idea).trim())
    : String(idea).trim();
  const raw = await callGeminiText(env, { model: await resolveModel(env, 'text', plan, model), prompt, apiKey });
  // Content Video တွင် Product Block မပါဝင် → product: false
  return parseVideoPlan(raw, { product: false });
}

// ============================================================
// Tab 2 — Video Scene Image Generate
// ============================================================
export async function generateContentVideoImage(env, { prompt, apiKey, model, plan }) {
  if (!prompt || !String(prompt).trim()) throw new Error('missing_prompt');
  return callGeminiImage(env, {
    model: await resolveModel(env, 'image', plan, model),
    prompt: String(prompt).trim(),
    apiKey,
  });
}

// ============================================================
// Tab 1 — SRT from Audio (Audio → Transcribe → SRT)
// Gemini Multimodal ဖြင့် Audio ကို တိုက်ရိုက် ပေးပို့သည်
// ============================================================
export async function generateContentSrt(env, { audioBase64, mimeType, apiKey, model, plan }) {
  if (!audioBase64) throw new Error('missing_audio');
  const prompt =
    'Transcribe the following audio carefully. ' +
    'Return the result ONLY in SRT subtitle format:\n' +
    '1\n00:00:01,000 --> 00:00:04,000\nFirst subtitle line\n\n' +
    '2\n00:00:05,000 --> 00:00:08,000\nSecond subtitle line\n\n' +
    'Use sequential numbers, HH:MM:SS,mmm timestamps, and blank lines between entries. ' +
    'Do not add any extra text outside the SRT format.';
  const raw = await callGeminiMultimodal(env, {
    model: await resolveModel(env, 'text', plan, model),
    prompt,
    images: [{ mimeType: mimeType || 'audio/mpeg', base64: audioBase64 }],
    apiKey,
  });
  return { srt: raw ? raw.trim() : '' };
}

// ============================================================
// Tab 1 — Translate SRT (MY ↔ CN)
// SRT Format (နံပါတ် + အချိန်) ကို ထိန်းသိမ်းပြီး စာသားကိုသာ ဘာသာပြန်သည်
// ============================================================
export async function translateContentSrt(env, { srtText, direction, apiKey, model, plan }) {
  if (!srtText || !String(srtText).trim()) throw new Error('missing_srt');
  const langPair = direction === 'cn-to-my'
    ? 'Chinese to Burmese (Myanmar)'
    : 'Burmese (Myanmar) to Chinese';
  const prompt =
    'Translate the following SRT subtitle text from ' + langPair + '.\n' +
    'IMPORTANT: Keep the SRT structure exactly the same — subtitle numbers and ' +
    'timestamps (HH:MM:SS,mmm --> HH:MM:SS,mmm) must NOT change. ' +
    'Only translate the text content lines. Do not add extra commentary.\n\n' +
    String(srtText).trim();
  const raw = await callGeminiText(env, { model: await resolveModel(env, 'text', plan, model), prompt, apiKey });
  return { srt: raw ? raw.trim() : '' };
} 
