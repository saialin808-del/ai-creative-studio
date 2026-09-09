// ============================================================
// Story Studio — Step Config (frontend/story/steps.js)
// ------------------------------------------------------------
// Studio ၏ Step အားလုံး၏ တစ်ခုတည်းသော အရင်းအမြစ် (Single Source of Truth)
// Step အသစ် ထည့်ရန် / Step ပြောင်းရန် — ဤဖိုင်ကိုသာ ပြင်ပါ
// ------------------------------------------------------------
// Code Update လွယ်ကူရေးစည်းမျဉ်း:
// - Studio တစ်ခုချင်းစီက သူ့ရဲ့ Steps ကို ကိုယ်ပိုင်ပိုင်
// - Story ၏ Steps ကို ပြင်လျှင် Image / Voice / ကျန် Studio မထိခိုက်
// - Shared (shared/stepFlow.js, shared/ui.js) တွင် Studio Logic မပါ
// ============================================================

import { ideaStep } from './steps/idea.js';
import { characterStep } from './steps/character.js';
import { storyStep } from './steps/story.js';
import { sceneStep } from './steps/scene.js';
import { resultStep } from './steps/result.js';

// Step State ကို Browser localStorage တွင် သိမ်းရန် Key
export const STORY_STATE_KEY = 'aics_story_state_v1';

export const STORY_STUDIO_NAME = 'Story Studio';

// Step အစဉ် (Workflow)
export const STORY_STEPS = [
  { id: 'idea', n: 1, title: 'Idea', step: ideaStep },
  { id: 'character', n: 2, title: 'Character', step: characterStep },
  { id: 'story', n: 3, title: 'Story', step: storyStep },
  { id: 'scene', n: 4, title: 'Scene', step: sceneStep },
  { id: 'result', n: 5, title: 'Result', step: resultStep },
];

// Client (Browser) ထဲ ထည့်ရန် — Steps ၏ အခြေခံ အချက်အလက်များ
export function stepsClientJson() {
  return STORY_STEPS.map((s) => ({ id: s.id, n: s.n, title: s.title }));
}
