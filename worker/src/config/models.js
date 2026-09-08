// ============================================================
// AI CREATIVE STUDIO — AI Model Registry (Phase C — Rule: Admin AI Models)
// ------------------------------------------------------------
// Model များ၏ မူလပုံသေ (Default) စာရင်း — Admin Panel မှ Database
// (ai_models) တွင် ထည့်/ပြင်/ဖျက် လုပ်နိုင်သည်။
// Database တွင် Row မရှိလျှင် / ချို့ယွင်းလျှင် ဤ Registry ကို အရံအဖြစ် သုံးသည်။
// ============================================================

export const AI_MODEL_REGISTRY = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash (စာသား)', category: 'text', enabled: true, is_default: true, plan_access: 'FREE' },
  { id: 'gemini-3.1-flash-image', name: 'Gemini 3.1 Flash Image (ပုံ)', category: 'image', enabled: true, is_default: true, plan_access: 'FREE' },
  { id: 'gemini-3.1-flash-tts-preview', name: 'Gemini 3.1 Flash TTS (အသံ)', category: 'voice', enabled: true, is_default: true, plan_access: 'FREE' },
];

// Category တစ်ခုချင်းစီအတွက် နောက်ဆုံး အရံ Model (Registry မှာလည်း မရှိတဲ့အခါသာ)
export const DEFAULT_MODELS = {
  text: 'gemini-3.6-flash',
  image: 'gemini-3.1-flash-image',
  voice: 'gemini-3.1-flash-tts-preview',
};

export const MODEL_CATEGORIES = ['text', 'image', 'voice'];
