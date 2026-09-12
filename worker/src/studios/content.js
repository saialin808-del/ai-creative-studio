// AI Creative Studio — Content Studio Backend
// Studio Isolation: ဤ File သည် Content Studio နှင့်သာ သက်ဆိုင်သည်။
// Story/Short/Voice/Image/Shop ၏ State/Data/API ကို မသုံးပါ — Content-specific သီးခြားထားသည်။
// Shared core များသာ ခေါ်သည် (core/cms.js, core/ai.js, core/aiModels.js, core/utilities.js)။
// API Contract (index.js နှင့် ညီရမည်):
//   generateContent(env,{idea,type,plan,apiKey,model})          → { content, speakingStyle, voiceStyle }
//   reviseContent(env,{originalContent,originalSpeaking,originalVoice,feedback,type,...}) → { content, speakingStyle, voiceStyle }
//   generateContentVoice(env,{text,voiceName,plan,apiKey,model}) → { data, mimeType }  (TTS — WAV)
//   generateContentVideo(env,{idea,type,plan,apiKey,model})      → { characters, scenes, rawFallback }
//   generateContentVideoImage(env,{prompt,plan,apiKey,model})    → { data, mimeType }
//   generateContentSrt(env,{audioBase64,mimeType,apiKey,model})  → { srt }
//   translateContentSrt(env,{srtText,direction,apiKey,model})    → { srt }
// ⚠️ Content Scene Schema သည် Story/Short နှင့် မတူပါ (frontend/content.js ကြောင့်):
//   characters: [ { name, description } ]
//   scenes:     [ { number, duration, visualPrompt, description, dialogue } ]

import { getCMSData, buildSystemPrompt } from '../core/cms.js';
import { callGeminiText, callGeminiImage, callGeminiMultimodal, callGeminiTTS } from '../core/ai.js';
import { resolveModel } from '../core/aiModels.js';
import { pcmToWavBase64 } from '../core/utilities.js';

const CMS_STUDIO = 'CONTENT';
const CMS_VIDEO = 'CONTENTVIDEO';

// ============================================================
// Tab 1 — Generate Content
// Social Media / Marketing Content + Speaking Style + Voice Style
// ============================================================
export async function generateContent(env, { idea, type, plan, apiKey, model }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, CMS_STUDIO, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  const prompt = [
    system,
    'USER IDEA:',
    String(idea).trim(),
    '',
    'အောက်ပါ Social Media / Marketing Content ကို ရေးပါ:',
    '1. ပရိသတ်ကို ချက်ချင်း ဆွဲဆောင်မည့် နိဒါန်း (Hook) ဖြင့် စပါ။',
    '2. ရှင်းလင်း၍ အကျိုးရှိသော အကြောင်းအရာ — စာကြောင်းတိုများ၊ ဖတ်ရလွယ်သော ပုံစံ။',
    '3. လုပ်ဆောင်ရန် တိုက်တွန်းချက် (Call To Action) ဖြင့် အဆုံးသတ်ပါ။',
    '4. Language — User idea ထဲတွင် ဖော်ပြထားသော ဘာသာစကား (မပါလျှင် မြန်မာ) ဖြင့် ရေးပါ။',
    '5. Speaking Style — ဤ Content ကို မည်သည့် အသံဟန်ဖြင့် ပြောသင့်သည် (ဥပမာ: အေးဆေးသော၊ စိတ်လှုပ်ရှားဖွယ်) — အတိုချုံး ဖော်ပြပါ။',
    '6. Voice Style — ဤ Content အတွက် သင့်တော်သော Voice အမည်/အမျိုးအစား — အတိုချုံး ဖော်ပြပါ။',
    '',
    'ရလဒ်ကို အောက်ပါ JSON format အတိုင်းသာ ပြန်ပေးပါ (ရှင်းလင်းချက် မထည့်ပါနှင့်):',
    '{ "content": "...", "speakingStyle": "...", "voiceStyle": "..." }',
  ].filter(Boolean).join('\n');
  const raw = await callGeminiText(env, { model: await resolveModel(env, 'text', plan, model), prompt, apiKey });
  return parseContentResult(raw);
}

// ============================================================
// Tab 1 — Revise Content (Chat)
// User ရဲ့ Feedback အတိုင်း Content + Styles ကို ပြန်ရေးသည်
// ============================================================
export async function reviseContent(env, { originalContent, originalSpeaking, originalVoice, feedback, type, plan, apiKey, model }) {
  if (!feedback || !String(feedback).trim()) throw new Error('missing_feedback');
  const c = await getCMSData(env, CMS_STUDIO, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  const prompt = [
    system,
    'မူရင်း Content:',
    String(originalContent || '(empty)'),
    originalSpeaking ? ('မူရင်း Speaking Style: ' + String(originalSpeaking)) : '',
    originalVoice ? ('မူရင်း Voice Style: ' + String(originalVoice)) : '',
    '',
    'User ရဲ့ ပြင်ဆင်ချက် (Feedback):',
    String(feedback).trim(),
    '',
    'Feedback အတိုင်း Content အပြည့်အစုံကို ပြန်ရေးပါ (Hook → အကြောင်းအရာ → CTA ပုံစံ ဆက်ထိန်းပါ)။',
    'ရလဒ်ကို အောက်ပါ JSON format အတိုင်းသာ ပြန်ပေးပါ:',
    '{ "content": "...", "speakingStyle": "...", "voiceStyle": "..." }',
  ].filter(Boolean).join('\n');
  const raw = await callGeminiText(env, { model: await resolveModel(env, 'text', plan, model), prompt, apiKey });
  return parseContentResult(raw);
}

// ============================================================
// Tab 1 — Text → Voice (TTS)
// Gemini TTS မှ L16 PCM ကို WAV အဖြစ် ပြောင်းသည် (Voice.js နှင့် မမှီခို — core မှ တိုက်ရိုက်)
// ============================================================
export async function generateContentVoice(env, { text, voiceName, plan, apiKey, model }) {
  if (!text || !String(text).trim()) throw new Error('missing_text');
  const tts = await callGeminiTTS(env, {
    text: String(text).trim(),
    voiceName: voiceName || 'Kore',
    apiKey,
    model: await resolveModel(env, 'voice', plan, model),
  });
  const wavBase64 = pcmToWavBase64(tts.data, 24000, 1, 16);
  return { data: wavBase64, mimeType: 'audio/wav' };
}

// ============================================================
// Tab 2 — Content Video Plan (Characters + Scenes — Structured JSON)
// Content-specific schema: characters {name, description}, scenes {number, duration, visualPrompt, description, dialogue}
// ============================================================
export async function generateContentVideo(env, { idea, type, plan, apiKey, model }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, CMS_VIDEO, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  const prompt = [
    system,
    'USER CONTENT:',
    String(idea).trim(),
    '',
    'အောက်ပါ Video Production Plan ကို ရေးပါ:',
    '1. Content ထဲမှ ဇာတ်ကောင်များကို ရှာပြီး characters array တွင် name + description ဖြင့် ထည့်ပါ။',
    '2. Content ကို Scene များအဖြစ် ခွဲပါ — Scene တစ်ခုစီတွင်:',
    '   - visualPrompt: ရုပ်မြင်သံကြားအတွက် Video Prompt (သဘာဝကျသော ပုံရိပ်)',
    '   - description: Environment Reference / နောက်ခံဖော်ပြချက်',
    '   - dialogue: ထို Scene တွင် ပြောရမည့် စကား (မပါလျှင် အလွတ်)',
    '3. Scene တစ်ခုစီ၏ duration သည် 5-10 စက္ကန့်ခန့် ဖြစ်ပါစေ။',
    '4. Scene အရေအတွက်သည် Content အရှည်နှင့် လိုက်ဖက်ပါစေ (Content ရှည်လျှင် Scene များ၍ နိုင်သည်)။',
    '',
    'ရလဒ်ကို အောက်ပါ JSON format အတိုင်းသာ ပြန်ပေးပါ (ရှင်းလင်းချက် မထည့်ပါနှင့်):',
    '{ "characters": [ { "name": "", "description": "" } ], "scenes": [ { "number": 1, "duration": 8, "visualPrompt": "", "description": "", "dialogue": "" } ] }',
  ].filter(Boolean).join('\n');
  const raw = await callGeminiText(env, { model: await resolveModel(env, 'text', plan, model), prompt, apiKey });
  return parseContentVideoResponse(raw);
}

// ============================================================
// Tab 2 — Content Scene Image
// ============================================================
export async function generateContentVideoImage(env, { prompt, plan, apiKey, model }) {
  if (!prompt || !String(prompt).trim()) throw new Error('missing_prompt');
  return callGeminiImage(env, {
    model: await resolveModel(env, 'image', plan, model),
    prompt: String(prompt).trim(),
    apiKey,
  });
}

// ============================================================
// Tab 3 — SRT Subtitle from Audio
// ============================================================
export async function generateContentSrt(env, { audioBase64, mimeType, apiKey, model }) {
  if (!audioBase64) throw new Error('missing_audio');
  const instruction =
    'အောက်ပါ Audio ကို SRT (SubRip Subtitle) format အတိုင်း Transcribe လုပ်ပါ။ ' +
    'Audio ရဲ့ speech pacing ကို ကြည့်ပြီး Timestamp ကို အကြမ်းဖျင်း ခန့်မှန်းပါ။ ' +
    'TEXT LINE RULE (အရေးကြီး): Subtitle Block တစ်ခုစီရဲ့ Text Line ကို ' +
    "'အဓိပ္ပါယ်ပြည့်စုံပြီး အလယ်အလတ် ရှည်လျားမှုရှိသော စကားစု (Phrase)' တစ်ခုအလိုက်သာ ခွဲပါ — " +
    'Character အရေအတွက် ရေတွက်၍ လုံးဝ မခွဲပါနှင့်။ ' +
    'အရမ်းတိုတို (စကားလုံး ၁-၂ လုံးတည်း) မဖြစ်စေရပါ။ ' +
    'SRT format text ကိုသာ ပြန်ပေးပါ၊ ရှင်းလင်းချက် မထည့်ပါနှင့်။';
  const srt = await callGeminiMultimodal(env, {
    model: await resolveModel(env, 'transcribe', undefined, model),
    prompt: instruction,
    images: [{ mimeType: mimeType || 'audio/mpeg', base64: audioBase64 }],
    apiKey,
  });
  return { srt };
}

// ============================================================
// Tab 3 — Translate SRT (my ↔ cn)
// ============================================================
export async function translateContentSrt(env, { srtText, direction, apiKey, model }) {
  if (!srtText || !String(srtText).trim()) throw new Error('missing_srt');
  const dir = String(direction || 'my-to-cn').replace(/-/g, '_').toUpperCase();

  let langInstruction;
  if (dir === 'MY_TO_CN') {
    langInstruction =
      'အောက်ပါ SRT ထဲက Text များသည် မြန်မာဘာသာ ဖြစ်ပါသည်။ Text line တစ်ကြောင်းစီအောက်မှာ ' +
      'ယင်းစာကြောင်း၏ တရုတ်ဘာသာပြန် line တစ်ကြောင်းကို ထပ်ထည့်ပါ။';
  } else {
    langInstruction =
      'အောက်ပါ SRT ထဲက Text များသည် တရုတ်ဘာသာ ဖြစ်ပါသည်။ Text line တစ်ကြောင်းစီအောက်မှာ ' +
      'ယင်းစာကြောင်း၏ မြန်မာဘာသာပြန် line တစ်ကြောင်းကို ထပ်ထည့်ပါ။ ' +
      'TEXT LINE WRAPPING RULE: မြန်မာဘာသာပြန် Line ကို စာလုံးရေ ၁၅ လုံးထက် မကျော်စေရပါ။ ' +
      '၁၅ လုံးကျော်ရင် Number/Timestamp အသစ် မဖန်တီးဘဲ Subtitle block တူညီတဲ့အတွင်းမှာပဲ ဘာသာပြန် line ကို line အသစ် ထပ်ခွဲပြီး ရေးပါ။';
  }

  const instruction =
    'အောက်ပါ SRT (SubRip Subtitle) Text ကို ဖတ်ပါ။ ' + langInstruction + ' ' +
    'SRT Number (1, 2, 3...) နှင့် Timestamp (00:00:00,000 --> 00:00:03,000 ပုံစံ) များကို ' +
    'လုံးဝ မပြောင်းလဲပါနှင့် — မူရင်းအတိုင်းသာ ထားပါ။ မူရင်း Text Line ကိုလည်း မပြောင်းလဲပါနှင့်၊ ' +
    'ဖျက်လည်း မဖျက်ပါနှင့်။ Format ဥပမာ:\n' +
    '1\n00:00:00,000 --> 00:00:03,000\n[မူရင်းစာကြောင်း]\n[ဘာသာပြန်စာကြောင်း]\n\n' +
    '2\n00:00:03,000 --> 00:00:06,000\n[မူရင်းစာကြောင်း]\n[ဘာသာပြန်စာကြောင်း]\n\n' +
    'SRT format text ကိုသာ ပြန်ပေးပါ၊ ရှင်းလင်းချက် (explanation) မထည့်ပါနှင့်။\n\n' +
    'SRT:\n' + String(srtText).trim();

  const srt = await callGeminiText(env, {
    model: await resolveModel(env, 'transcribe', undefined, model),
    prompt: instruction,
    apiKey,
  });
  return { srt };
}

// ============================================================
// Content-specific Parsers (Story/Short နှင့် သီးခြား)
// ============================================================
function tryParseContentJson(rawText) {
  let text = String(rawText || '').trim();
  if (!text) return null;
  text = text.replace(/```json\s*([\s\S]*?)```/gi, '$1').replace(/```\s*([\s\S]*?)```/gi, '$1');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    return (obj && typeof obj === 'object') ? obj : null;
  } catch (e) {
    return null;
  }
}

export function parseContentResult(raw) {
  const text = String(raw || '').trim();
  if (!text) return { content: '', speakingStyle: '', voiceStyle: '' };
  const obj = tryParseContentJson(text);
  if (obj && (obj.content || obj.speakingStyle || obj.voiceStyle)) {
    return {
      content: String(obj.content || '').trim(),
      speakingStyle: String(obj.speakingStyle || obj.speaking_style || '').trim(),
      voiceStyle: String(obj.voiceStyle || obj.voice_style || '').trim(),
    };
  }
  // JSON မဟုတ်ပါက Plain Text ကို Content အဖြစ် သုံးသည်
  return { content: text, speakingStyle: '', voiceStyle: '' };
}

export function parseContentVideoResponse(rawText) {
  const result = { characters: [], scenes: [], rawFallback: false };
  if (!rawText) return result;
  const parsed = tryParseContentJson(rawText);
  if (parsed && (Array.isArray(parsed.scenes) || Array.isArray(parsed.characters))) {
    result.characters = (parsed.characters || []).filter(function (c) {
      return c && typeof c === 'object';
    }).map(function (c) {
      return {
        name: String(c.name || 'Character').trim(),
        description: String(c.description || '').trim(),
      };
    });
    result.scenes = (parsed.scenes || []).filter(function (s) {
      return s && typeof s === 'object';
    }).map(function (s, i) {
      const num = parseInt(String(s.number), 10);
      const dur = parseInt(String(s.duration), 10);
      return {
        number: isNaN(num) ? (i + 1) : num,
        duration: isNaN(dur) ? 8 : dur,
        visualPrompt: String(s.visualPrompt || s.videoPrompt || '').trim(),
        description: String(s.description || s.environmentPrompt || '').trim(),
        dialogue: String(s.dialogue || '').trim(),
      };
    });
    if (result.scenes.length === 0 && result.characters.length === 0) {
      result.scenes.push({ number: 1, duration: 8, visualPrompt: String(rawText).trim(), description: '', dialogue: '' });
      result.rawFallback = true;
    }
    return result;
  }
  result.scenes.push({ number: 1, duration: 8, visualPrompt: String(rawText).trim(), description: '', dialogue: '' });
  result.rawFallback = true;
  return result;
}
