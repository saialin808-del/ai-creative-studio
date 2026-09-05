// AI Creative Studio — Studio Service (Phase 3d — text + image)
import { getCMSData, buildSystemPrompt } from './cms';
import { callGeminiText, callGeminiImage } from './ai';
import * as story from './studios/story';

const IMAGE_STUDIOS = ['IMAGE'];

// ===== Studio Separation Rule =====
// Studio တစ်ခုစီအတွက် ကိုယ်ပိုင် logic ဖိုင် (worker/src/studios/*.js) ရေးပြီး
// ဒီ Registry ထဲ ထည့်လိုက်ရင် ရပါပြီ။ Registry ထဲ မပါသေးသော Studio များ
// (CONTENT/SHORT/VOICE/SHOP) က အောက်ကရှိပြီးသား generic path ကိုပဲ ဆက်သုံးမည်
// ဖြစ်၍ ဒီဖိုင်ကို ပြင်ဆင်ခြင်းသည် သူတို့ကို လုံးဝ မထိခိုက်ပါ။
const STUDIO_MODULES = {
  STORY: story,
  STORYVIDEO: story,
};

async function generateImage(env, { studio, type, idea, plan, apiKey }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, studio, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  const prompt = system ? (system + '\n\n' + String(idea).trim()) : String(idea).trim();
  const img = await callGeminiImage(env, { model: 'gemini-3.1-flash-image', prompt, apiKey });
  return { studio, type, plan, data: img.data, mimeType: img.mimeType };
}

async function generateStudio(env, opts) {
  const key = String(opts.studio || '').toUpperCase();

  // ===== 1) Studio ကိုယ်ပိုင် module ရှိရင် ဒီကိုပဲ လွှဲပေးမည် =====
  const mod = STUDIO_MODULES[key];
  if (mod) {
    const out = await mod.generate(env, opts);
    return { ...out, plan: opts.plan };
  }

  // ===== 2) IMAGE studio — ရှိပြီးသား logic အတိုင်း =====
  if (IMAGE_STUDIOS.includes(key)) {
    return generateImage(env, opts);
  }

  // ===== 3) ကျန် Studio များ (CONTENT/SHORT/VOICE/SHOP) — ရှိပြီးသား
  // generic logic အတိုင်း၊ လုံးဝ မပြောင်းလဲထားပါ =====
  if (!opts.studio) throw new Error('missing_studio');
  if (!opts.idea || !String(opts.idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, opts.studio, opts.plan, opts.type);
  const system = c ? buildSystemPrompt(c) : '';
  const output = await callGeminiText(env, {
    model: opts.model || 'gemini-3.6-flash',
    system: system,
    prompt: String(opts.idea).trim(),
    apiKey: opts.apiKey,
  });
  return { studio: opts.studio, type: opts.type, plan: opts.plan, output };
}

// ===== Generic action dispatcher — "generate" မဟုတ်တဲ့ Studio ကိုယ်ပိုင်
// feature များ (revise, videoPlan, videoImage, စသည်) အတွက်.
// Studio module ထဲမှာ actions[actionName] export ထားရုံပဲ လိုအပ်ပါတယ် =====
async function studioAction(env, { studio, action, ...payload }) {
  const key = String(studio || '').toUpperCase();
  const mod = STUDIO_MODULES[key];
  if (!mod || !mod.actions || typeof mod.actions[action] !== 'function') return null;
  return mod.actions[action](env, payload);
}

export { generateStudio, studioAction, STUDIO_MODULES };
