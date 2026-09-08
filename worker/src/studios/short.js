// AI Creative Studio — Short Studio Backend 
// Studio Isolation: ဤ File သည် Short Studio နှင့်သာ သက်ဆိုင်သည်။
// အခြား Studio (Story/Content/Image/Voice/Shop) ကို မထိခိုက်စေရ။
// Short Studio ၏ ထူးခြားချက် — Tab 2 တွင် Reference Image Upload (အများဆုံး ၅ ပုံ) ပါဝင်သည်။

import { getCMSData, buildSystemPrompt } from '../core/cms.js';
import { callGeminiText, callGeminiImage, callGeminiMultimodal } from '../core/ai.js';
import { resolveModel } from '../core/aiModels.js';

const CMS_STUDIO = 'SHORT';
const CMS_VIDEO = 'SHORTVIDEO';

// ============================================================
// Tab 1 — Short Script Generate
// ============================================================
export async function generateShort(env, { idea, type, plan, apiKey, model }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, CMS_STUDIO, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  const prompt = system
    ? (system + '\n\nUSER IDEA:\n' + String(idea).trim())
    : String(idea).trim();
  const raw = await callGeminiText(env, { model: await resolveModel(env, 'text', plan, model), prompt, apiKey });
  return { short: raw ? raw.trim() : '' };
}

// ============================================================
// Tab 1 — Short Revise (Chat Revision)
// ============================================================
export async function reviseShort(env, { idea, type, currentShort, instruction, plan, apiKey, model }) {
  if (!instruction || !String(instruction).trim()) throw new Error('missing_instruction');
  if (!currentShort) throw new Error('missing_current_short');
  const c = await getCMSData(env, CMS_STUDIO, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  let prompt = system + '\n\n';
  prompt += 'USER IDEA (မူရင်းစိတ်ကူး):\n' + (idea || '(empty)') + '\n\n';
  prompt += 'လက်ရှိ Short Content:\n' + String(currentShort) + '\n\n';
  prompt += 'User ရဲ့ ထပ်ညွှန်ကြားချက်:\n' + String(instruction).trim() + '\n\n';
  prompt += 'အထက်ပါညွှန်ကြားချက်အတိုင်း Short Content ကို ပြင်ဆင်ပါ။ ' +
    'Content အပြည့်အစုံကိုသာ ပြန်ပေးပါ၊ ရှင်းလင်းချက်များ မထည့်ပါနှင့်။';
  const raw = await callGeminiText(env, { model: await resolveModel(env, 'text', plan, model), prompt, apiKey });
  return { short: raw ? raw.trim() : '' };
}

// ============================================================
// Tab 2 — Short Video Plan (Scenes + Characters)
// Reference ပုံများ ပါလျှင် Multimodal (Text + Images) ကို သုံးသည်။
// ============================================================
export async function generateShortVideoPlan(env, { idea, type, plan, apiKey, images, model }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, CMS_VIDEO, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  let prompt = system
    ? (system + '\n\nUSER STORY/IDEA:\n' + String(idea).trim())
    : String(idea).trim();

  let raw;
  if (images && images.length > 0) {
    prompt +=
      '\n\n(User သည် Reference ပုံ ' + images.length + ' ပုံ ပူးတွဲပေးထားပါသည် — ' +
      'ဒီပုံများထဲက Character (ရှိလျှင်) ရဲ့ အဓိကအင်္ဂါရပ်များ (မျက်နှာ/ပုံပန်းသဏ္ဌာန်/' +
      'ဝတ်စုံ/ပတ်ဝန်းကျင်/အရောင်) ကို လေ့လာပြီး Character Reference Prompt ထဲမှာ ' +
      'ပုံအစစ်နှင့် ကိုက်ညီအောင် အသေးစိတ် ထည့်သွင်းရေးပါ။ Environment/Video Prompt ' +
      'များကိုလည်း ဒီ Character ပုံစံနှင့် ကိုက်ညီအောင် ချိတ်ဆက်ရေးပါ။)';
    raw = await callGeminiMultimodal(env, {
      model: await resolveModel(env, 'text', plan, model),
      prompt,
      images: images,
      apiKey,
    });
  } else {
    raw = await callGeminiText(env, { model: await resolveModel(env, 'text', plan, model), prompt, apiKey });
  }
  return parseShortVideoResponse(raw);
}

// ============================================================
// Tab 2 — Short Video Scene/Character Image Generate
// ============================================================
export async function generateShortVideoImage(env, { prompt, apiKey, model, plan }) {
  if (!prompt || !String(prompt).trim()) throw new Error('missing_prompt');
  return callGeminiImage(env, {
    model: await resolveModel(env, 'image', plan, model),
    prompt: String(prompt).trim(),
    apiKey,
  });
}

// ============================================================
// Studio-specific Parser — Short Video Response
// [SCENE_START]...[SCENE_END] နှင့် [CHARACTER_START]...[CHARACTER_END]
// (Story Studio ၏ parser နဲ့ Tag Format တူသော်လည်း Studio Isolation Rule အရ
//  ဤ File ထဲတွင် သီးခြား ထားသည်)
// ============================================================
export function parseShortVideoResponse(rawText) {
  const result = { scenes: [], characters: [], rawFallback: false };
  if (!rawText) return result;

  const sceneBlocks = rawText.match(/\[SCENE_START\][\s\S]*?\[SCENE_END\]/gi);
  if (sceneBlocks) {
    sceneBlocks.forEach(function (block, idx) {
      const numberMatch = block.match(/SCENE_NUMBER:\s*([\s\S]*?)(?=\n\s*VIDEO_PROMPT:|\[SCENE_END\])/i);
      const videoMatch = block.match(/VIDEO_PROMPT:\s*([\s\S]*?)(?=\n\s*ENVIRONMENT_PROMPT:|\[SCENE_END\])/i);
      const envMatch = block.match(/ENVIRONMENT_PROMPT:\s*([\s\S]*?)\[SCENE_END\]/i);
      result.scenes.push({
        number: numberMatch ? numberMatch[1].trim() : String(idx + 1),
        videoPrompt: videoMatch ? videoMatch[1].trim() : '',
        environmentPrompt: envMatch ? envMatch[1].trim() : '',
      });
    });
  }

  const charBlocks = rawText.match(/\[CHARACTER_START\][\s\S]*?\[CHARACTER_END\]/gi);
  if (charBlocks) {
    charBlocks.forEach(function (block) {
      const nameMatch = block.match(/CHARACTER_NAME:\s*([\s\S]*?)(?=\n\s*CHARACTER_ROLE:|\[CHARACTER_END\])/i);
      const roleMatch = block.match(/CHARACTER_ROLE:\s*([\s\S]*?)(?=\n\s*CHARACTER_PROMPT:|\[CHARACTER_END\])/i);
      const promptMatch = block.match(/CHARACTER_PROMPT:\s*([\s\S]*?)\[CHARACTER_END\]/i);
      result.characters.push({
        name: nameMatch ? nameMatch[1].trim() : '(အမည်မသိ)',
        role: roleMatch ? roleMatch[1].trim() : '',
        prompt: promptMatch ? promptMatch[1].trim() : '',
      });
    });
  }

  if (result.scenes.length === 0 && result.characters.length === 0) {
    result.scenes.push({ number: '1', videoPrompt: rawText.trim(), environmentPrompt: '' });
    result.rawFallback = true;
  }
  return result;
}
