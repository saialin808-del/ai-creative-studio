// AI Creative Studio — Story Studio Backend (Phase 4)
// Studio Isolation: ဤ File သည် Story Studio နှင့်သာ သက်ဆိုင်သည်။
import { getCMSData, buildSystemPrompt } from '../core/cms';
import { callGeminiText, callGeminiImage } from '../core/ai';

const CMS_STUDIO = 'STORY';
const CMS_VIDEO = 'STORYVIDEO';
const TEXT_MODEL = 'gemini-3.6-flash';
const IMAGE_MODEL = 'gemini-3.1-flash-image';

export async function generateStory(env, { idea, type, plan, apiKey }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, CMS_STUDIO, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  const prompt = system ? (system + '\n\nUSER IDEA:\n' + String(idea).trim()) : String(idea).trim();
  const raw = await callGeminiText(env, { model: TEXT_MODEL, prompt, apiKey });
  return { story: raw ? raw.trim() : '' };
}

export async function reviseStory(env, { idea, type, currentStory, instruction, plan, apiKey }) {
  if (!instruction || !String(instruction).trim()) throw new Error('missing_instruction');
  if (!currentStory) throw new Error('missing_current_story');
  const c = await getCMSData(env, CMS_STUDIO, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  let prompt = system + '\n\n';
  prompt += 'USER IDEA (မူရင်းစိတ်ကူး):\n' + (idea || '(empty)') + '\n\n';
  prompt += 'လက်ရှိ ဇာတ်လမ်း:\n' + String(currentStory) + '\n\n';
  prompt += 'User ရဲ့ ထပ်ညွှန်ကြားချက်:\n' + String(instruction).trim() + '\n\n';
  prompt += 'အထက်ပါညွှန်ကြားချက်အတိုင်း ဇာတ်လမ်းကို ပြင်ဆင်ပါ။ ဇာတ်လမ်းအပြည့်အစုံကိုသာ ပြန်ပေးပါ၊ ရှင်းလင်းချက်များ မထည့်ပါနှင့်။';
  const raw = await callGeminiText(env, { model: TEXT_MODEL, prompt, apiKey });
  return { story: raw ? raw.trim() : '' };
}

export async function generateStoryVideoPlan(env, { idea, type, plan, apiKey }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, CMS_VIDEO, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  const prompt = system ? (system + '\n\nUSER STORY/IDEA:\n' + String(idea).trim()) : String(idea).trim();
  const raw = await callGeminiText(env, { model: TEXT_MODEL, prompt, apiKey });
  return parseStoryVideoResponse(raw);
}

export async function generateStoryVideoImage(env, { prompt, apiKey }) {
  if (!prompt || !String(prompt).trim()) throw new Error('missing_prompt');
  return callGeminiImage(env, { model: IMAGE_MODEL, prompt: String(prompt).trim(), apiKey });
}

export function parseStoryVideoResponse(rawText) {
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
