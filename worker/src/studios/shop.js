// AI Creative Studio — Shop Studio Backend 
// Studio Isolation: ဤ File သည် Shop Studio နှင့်သာ သက်ဆိုင်သည်။
// အခြား Studio (Content/Story/Short/Image/Voice) ကို မထိခိုက်စေရ။
// Shared Logic (AI Call, CMS, Parser) ကို core/ မှ ခေါ်သုံးသည်။

import { getCMSData, buildSystemPrompt } from '../core/cms';
import { callGeminiText, callGeminiImage, callGeminiMultimodal } from '../core/ai';
import { parseContentResponse, parseVideoPlan, referenceImageInstruction } from '../core/utilities';

const CMS_CONTENT = 'SHOPCONTENT';
const CMS_VIDEO = 'SHOPVIDEO';
const TEXT_MODEL = 'gemini-3.6-flash';
const IMAGE_MODEL = 'gemini-3.1-flash-image';

// ============================================================
// Tab 1 — Content Maker: Generate
// Reference ပုံ (Optional) ပါလျှင် Multimodal Call သုံးသည်
// ============================================================
export async function generateShopContent(env, { idea, type, plan, apiKey, images }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, CMS_CONTENT, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  let prompt = system
    ? (system + '\n\nPRODUCT INFO:\n' + String(idea).trim())
    : ('PRODUCT INFO:\n' + String(idea).trim());

  const imgList = Array.isArray(images) ? images.filter(Boolean) : [];
  if (imgList.length > 0) {
    prompt += referenceImageInstruction(imgList, 'product');
    const raw = await callGeminiMultimodal(env, {
      model: TEXT_MODEL, prompt, images: imgList, apiKey,
    });
    return parseContentResponse(raw);
  }

  const raw = await callGeminiText(env, { model: TEXT_MODEL, prompt, apiKey });
  return parseContentResponse(raw);
}

// ============================================================
// Tab 1 — Content Maker: Revise (Chat)
// ============================================================
export async function reviseShopContent(env, { idea, type, currentContent, instruction, plan, apiKey }) {
  if (!currentContent) throw new Error('missing_current_content');
  if (!instruction || !String(instruction).trim()) throw new Error('missing_instruction');
  const c = await getCMSData(env, CMS_CONTENT, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  let prompt = system + '\n\n';
  prompt += 'PRODUCT INFO (မူရင်းအချက်အလက်):\n' + (idea || '') + '\n\n';
  prompt += 'လက်ရှိ Content:\n' + currentContent + '\n\n';
  prompt += 'User ရဲ့ ထပ်ညွှန်ကြားချက်:\n' + String(instruction).trim() + '\n\n';
  prompt += 'အထက်ပါညွှန်ကြားချက်အတိုင်း Content ကို ပြင်ဆင်ပါ။ Content အပြည့်အစုံကိုသာ ပြန်ပေးပါ၊ ရှင်းလင်းချက် မထည့်ပါနှင့်။';
  const raw = await callGeminiText(env, { model: TEXT_MODEL, prompt, apiKey });
  return parseContentResponse(raw);
}

// ============================================================
// Tab 2 — Video Maker: Generate Video Plan
// Reference ပုံ (Optional) ပါလျှင် Multimodal Call သုံးသည်
// Product Block ပါသော Parser ကို သုံးသည် (parseVideoPlan default product:true)
// ============================================================
export async function generateShopVideo(env, { idea, type, plan, apiKey, images }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, CMS_VIDEO, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  let prompt = system
    ? (system + '\n\nPRODUCT INFO:\n' + String(idea).trim())
    : ('PRODUCT INFO:\n' + String(idea).trim());

  const imgList = Array.isArray(images) ? images.filter(Boolean) : [];
  if (imgList.length > 0) {
    prompt += referenceImageInstruction(imgList, 'product');
    const raw = await callGeminiMultimodal(env, {
      model: TEXT_MODEL, prompt, images: imgList, apiKey,
    });
    return parseVideoPlan(raw, { product: true });
  }

  const raw = await callGeminiText(env, { model: TEXT_MODEL, prompt, apiKey });
  return parseVideoPlan(raw, { product: true });
}

// ============================================================
// Tab 2 — Video Maker: Generate Scene/Character/Product Image
// ============================================================
export async function generateShopVideoImage(env, { prompt, apiKey }) {
  if (!prompt || !String(prompt).trim()) throw new Error('missing_prompt');
  const out = await callGeminiImage(env, {
    model: IMAGE_MODEL,
    prompt: String(prompt).trim(),
    apiKey,
  });
  return { data: out.data, mimeType: out.mimeType };
}
