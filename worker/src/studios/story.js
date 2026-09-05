// ====== worker/src/studios/story.js ======
// Story Studio ရဲ့ business logic — Studio Separation Rule အရ
// သီးခြားဖိုင်ထဲ ခွဲထားသည်။ ဒီဖိုင်ကို ပြင်ဆင်ခြင်းသည် Studio တခြားများ
// (Content / Short / Image / Voice / Shop) ကို လုံးဝ မထိခိုက်ပါ။
//
// GAS မူရင်း: StoryService.gs ကို တိုက်ရိုက် ကူးပြောင်းထားသည်။

import { getCMSData, buildSystemPrompt } from '../cms';
import { callGeminiText, callGeminiImage } from '../ai';

function requiredPlanForType(type) {
  return String(type) === '1' ? 'FREE' : 'PRO';
}

// ===== ဇာတ်လမ်း ဖန်တီးခြင်း =====
async function generateStoryText(env, { idea, type, apiKey, model }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const t = type || '1';
  const reqPlan = requiredPlanForType(t);
  const c = await getCMSData(env, 'STORY', reqPlan, t);
  if (!c) throw new Error('cms_not_found_STORY_' + reqPlan + '_' + t);
  const system = buildSystemPrompt(c);
  const prompt = 'USER IDEA:\n' + String(idea).trim();
  const output = await callGeminiText(env, { model: model || 'gemini-3.6-flash', system, prompt, apiKey });
  return { studio: 'STORY', type: t, output };
}

// ===== ဇာတ်လမ်း ပြင်ဆင်ခြင်း (chat-style revise) =====
async function reviseStory(env, { idea, type, currentStory, instruction, apiKey, model }) {
  if (!currentStory) throw new Error('missing_current_story');
  if (!instruction) throw new Error('missing_instruction');
  const t = type || '1';
  const reqPlan = requiredPlanForType(t);
  const c = await getCMSData(env, 'STORY', reqPlan, t);
  if (!c) throw new Error('cms_not_found_STORY_' + reqPlan + '_' + t);
  const system = buildSystemPrompt(c);
  const prompt =
    'USER IDEA (မူရင်းစိတ်ကူး):\n' + String(idea || '').trim() +
    '\n\nလက်ရှိ ဇာတ်လမ်း:\n' + String(currentStory) +
    '\n\nUser ရဲ့ ထပ်ညွှန်ကြားချက်:\n' + String(instruction) +
    '\n\nအထက်ပါညွှန်ကြားချက်အတိုင်း ဇာတ်လမ်းကို ပြင်ဆင်ပါ။ ဇာတ်လမ်းအပြည့်အစုံကိုသာ ပြန်ပေးပါ၊ ရှင်းလင်းချက်များ (explanation) မထည့်ပါနှင့်။';
  const output = await callGeminiText(env, { model: model || 'gemini-3.6-flash', system, prompt, apiKey });
  return { studio: 'STORY', type: t, output };
}

// ===== Story Video — AI raw text ကို Scene/Character Array ဖြစ်အောင် ခွဲထုတ်ခြင်း =====
function parseStoryVideoResponse(rawText) {
  const result = { scenes: [], characters: [], rawFallback: false };
  if (!rawText) return result;

  const sceneBlocks = rawText.match(/\[SCENE_START\][\s\S]*?\[SCENE_END\]/gi);
  if (sceneBlocks) {
    sceneBlocks.forEach((block, idx) => {
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
    charBlocks.forEach((block) => {
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

// ===== Story Video — Scene/Character Plan ဖန်တီးခြင်း =====
async function generateStoryVideoPlan(env, { idea, type, apiKey, model }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const t = type || '1';
  const reqPlan = requiredPlanForType(t);
  const c = await getCMSData(env, 'STORYVIDEO', reqPlan, t);
  if (!c) throw new Error('cms_not_found_STORYVIDEO_' + reqPlan + '_' + t);
  const system = buildSystemPrompt(c);
  const prompt = 'USER STORY/IDEA:\n' + String(idea).trim();
  const raw = await callGeminiText(env, { model: model || 'gemini-3.6-flash', system, prompt, apiKey });
  const parsed = parseStoryVideoResponse(raw);
  return { studio: 'STORYVIDEO', type: t, ...parsed };
}

// ===== Story Video — Scene/Character Reference Image ဖန်တီးခြင်း (BYOK) =====
async function generateStoryVideoImage(env, { promptText, apiKey }) {
  if (!promptText || !String(promptText).trim()) throw new Error('missing_prompt');
  const img = await callGeminiImage(env, { model: 'gemini-3.1-flash-image', prompt: String(promptText), apiKey });
  return { data: img.data, mimeType: img.mimeType };
}

// ===== "STORY" / "STORYVIDEO" studio key နှစ်ခုလုံးကို ဒီဖိုင်တစ်ခုတည်းက
// ထိန်းချုပ်ပြီး "generate" ဆိုတာ ဘယ် studio key လာလဲပေါ်မူတည်ပြီး
// မှန်ကန်တဲ့ function ကို ရွေးပေးသည် (studio.js ရဲ့ dispatcher အတွက်) =====
async function generate(env, opts) {
  const key = String(opts.studio || 'STORY').toUpperCase();
  if (key === 'STORYVIDEO') return generateStoryVideoPlan(env, opts);
  return generateStoryText(env, opts);
}

// ===== Extra actions (generate/revise/videoPlan/videoImage) — index.js ရဲ့
// generic /api/studio/action endpoint အတွက်. Studio အသစ်ထည့်ချင်ရင်
// ဒီပုံစံတူ actions object ကို export ရုံလောက်ပဲ လုပ်စရာလိုပါတယ် =====
const actions = {
  generate,
  revise: reviseStory,
  videoPlan: generateStoryVideoPlan,
  videoImage: generateStoryVideoImage,
};

export { generate, generateStoryText, reviseStory, generateStoryVideoPlan, generateStoryVideoImage, actions };
