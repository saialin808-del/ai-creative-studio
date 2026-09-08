// AI Creative Studio — Image Studio Backend 
// Studio Isolation: ဤ File သည် Image Studio နှင့်သာ သက်ဆိုင်သည်။
// အခြား Studio ကို မထိခိုက်စေရ။

import { getCMSData, buildSystemPrompt } from '../core/cms.js';
import { callGeminiText, callGeminiImage, callGeminiMultimodal } from '../core/ai.js';
import { resolveModel } from '../core/aiModels.js';

const CMS_IMAGE = 'IMAGE';
const CMS_IMAGEAD = 'IMAGEAD';

// Tab 1 — Image Prompt Generate (ပုံအမျိုးအစား)
export async function generateImagePrompt(env, { idea, type, plan, apiKey, images, model }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, CMS_IMAGE, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  let prompt = system
    ? (system + '\n\nUSER DESCRIPTION:\n' + String(idea).trim())
    : String(idea).trim();

  let raw;
  if (images && images.length > 0) {
    prompt +=
      '\n\n(User သည် Reference ပုံ ' + images.length + ' ပုံ ပူးတွဲပေးထားပါသည် — ' +
      'ဒီပုံများထဲက အဓိကအင်္ဂါရပ်များ (မျက်နှာ/ပုံပန်းသဏ္ဌာန်/ဝတ်စုံ/ပတ်ဝန်းကျင်/အရောင်) ' +
      'ကို လေ့လာပြီး အထက်ပါ CORE/WORKFLOW instruction အတိုင်း Prompt ထဲ ' +
      'ထည့်သွင်းရေးပါ။ ပုံများအားလုံးကို ချိတ်ဆက်ပြီး တစ်ညီတည်း Consistent ' +
      'ဖြစ်အောင် ဆင်ခြင်ပါ။)';
    raw = await callGeminiMultimodal(env, { model: await resolveModel(env, 'text', plan, model), prompt, images, apiKey });
  } else {
    raw = await callGeminiText(env, { model: await resolveModel(env, 'text', plan, model), prompt, apiKey });
  }
  return { prompt: raw ? raw.trim() : '' };
}

// Tab 2 — Ad Image Prompt Generate (ကြော်ငြာပုံ)
export async function generateAdImagePrompt(env, { idea, type, plan, apiKey, images, model }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, CMS_IMAGEAD, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  let prompt = system
    ? (system + '\n\nPRODUCT/AD DESCRIPTION:\n' + String(idea).trim())
    : String(idea).trim();

  let raw;
  if (images && images.length > 0) {
    prompt +=
      '\n\n(User သည် Product Reference ပုံ ' + images.length + ' ပုံ ပူးတွဲပေးထားပါသည် — ' +
      'ဒီပုံများထဲက ကုန်ပစ္စည်း/Product ရဲ့ တကယ့် အရောင်/ပုံသဏ္ဌာန်/Design ကို လေ့လာပြီး ' +
      'ကြော်ငြာပုံ Prompt ရေးတဲ့အခါ ပုံနှင့် ကိုက်ညီအောင် တိကျစွာ ထည့်သွင်းရေးပါ။ PRODUCT/AD ' +
      'DESCRIPTION Text ထက် ပုံအစစ်ကို ဦးစားပေး ကိုးကားပါ။)';
    raw = await callGeminiMultimodal(env, { model: await resolveModel(env, 'text', plan, model), prompt, images, apiKey });
  } else {
    raw = await callGeminiText(env, { model: await resolveModel(env, 'text', plan, model), prompt, apiKey });
  }
  return { prompt: raw ? raw.trim() : '' };
}

// Tab 1 & 2 — Image Prompt (Text) ကို အခြေခံပြီး AI ပုံအစစ် ထုတ်ခြင်း
export async function generateImageFromPrompt(env, { prompt, apiKey, model, plan }) {
  if (!prompt || !String(prompt).trim()) throw new Error('missing_prompt');
  return callGeminiImage(env, { model: await resolveModel(env, 'image', plan, model), prompt: String(prompt).trim(), apiKey });
}
