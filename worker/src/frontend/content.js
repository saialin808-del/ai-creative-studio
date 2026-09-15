// AI Creative Studio — Content Studio Frontend
// Architecture: Content → Output Hub → Branch (Video / Audio)
// Main Stepper   : 01 အကြောင်းအရာ → 02 Content ရလဒ်   (အမြဲမြင်ရသည်)
// Branch Stepper : 01 Video/Audio ပြင်ဆင်ရန် → 02 Video/Audio ရလဒ် (Branch ဝင်မှသာ ပေါ်သည်)
// Content Result ကို Video / Audio Branch သို့ အလိုအလျောက် Pass လုပ်သည် (Copy/Paste မလို)
// AI processing-status steps များကို Stepper ထဲတွင် မပြတော့ပါ — loading ကို Result section အတွင်း၌သာ ပြသည် (Unified)
// Studio Isolation: ဤ File သည် Content Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Shared: renderSidebar / sidebarScript / renderStudioShell (frontend/shared.js) — မပြောင်းပါ
// ⚠️ API Contract / Backend Routes မပြောင်းပါ — Frontend Flow သာ ပြောင်းပါသည်။
// Video Branch State နှင့် Audio Branch State ကို သီးခြားထားသည် (Shared Mutable State မသုံး)
// Stepper = လက်ရှိသွားနေသော လမ်းကြောင်း | MAP = System တစ်ခုလုံး၏ workflow (Internal)

import { renderSidebar, sidebarScript, renderStudioShell, aicsResultLoadingHtml } from './shared.js';

// ===== Shell Stepper (Main — 2 Steps; Shell အတွက် Lock/Req Metadata) =====
const STEPS = [
  { label: '01 အကြောင်းအရာ' },
  { label: '02 Content ရလဒ်', req: [1] },
];

// ============================================================
// Voice Data — Section 15 (Audio Branch Essential)
// အမျိုးသားအသံ (17) + အမျိုးသမီးအသံ (13) — spec အတိုင်း
// ============================================================
const MALE_VOICES = [
  { name: 'Puck', desc: 'တက်ကြွဆန်းသစ်သော အသံ (Upbeat)' },
  { name: 'Charon', desc: 'တည်ငြိမ်ပြီး လုပ်ငန်းသုံး အချက်အလက်ပေး အသံ (Informative / Calm)' },
  { name: 'Fenrir', desc: 'စိတ်လှုပ်ရှားဖွယ် တက်ကြွသော အသံ (Excitable / Energetic)' },
  { name: 'Orus', desc: 'တည်ငြိမ်ပြီး ခိုင်မာသော အသံ (Firm / Calm)' },
  { name: 'Enceladus', desc: 'ငြင်သာပြီး သက်ပြင်းသံပါသော အသံ (Breathy / Soft)' },
  { name: 'Iapetus', desc: 'သလင်းပြင်ကဲ့သို့ ကြည်လင်သော အသံ (Clear)' },
  { name: 'Umbriel', desc: 'ပေါ့ပေါ့ပါးပါး ဖော်ရွေသော အသံ (Easy-going / Relaxed)' },
  { name: 'Algieba', desc: 'ချောမွေ့ပြေပြစ်သော အသံ (Smooth)' },
  { name: 'Algenib', desc: 'သြဇာပါပြီး အနည်းငယ် ရှာရှာအသံ (Gravelly / Textured)' },
  { name: 'Rasalgethi', desc: 'စာဖတ်ပြသူ/သတင်းဖတ်သူ အသံပုံစံ (Informative / Narrator)' },
  { name: 'Alnilam', desc: 'ယုံကြည်မှုရှိပြီး ခိုင်မာသော အသံ (Firm / Confident)' },
  { name: 'Schedar', desc: 'ညီညာတပြ ပုံမှန်အသံ (Even / Steady)' },
  { name: 'Pulcherrima', desc: 'တက်ကြွပြီး ရှေ့သို့ တက်လှမ်းလိုဟန် အသံ (Forward / Enterprising)' },
  { name: 'Achird', desc: 'ဖော်ရွေပြီး ကြင်နာသော အသံ (Friendly / Kind)' },
  { name: 'Zubenelgenubi', desc: 'ပေါ့ပေါ့ပါးပါး ပြောဆိုသည့် အသံ (Casual / Resonant)' },
  { name: 'Sadachbia', desc: 'သက်ဝင်လှုပ်ရှားသော အသံ (Lively)' },
  { name: 'Sadaltager', desc: 'ဗဟုသုတပြည့်ဝသော ပညာရှင်အသံ (Knowledgeable)' },
];
const FEMALE_VOICES = [
  { name: 'Zephyr', desc: 'တောက်ပပြီး ကြည်လင်သော အသံ (Bright / Clear)' },
  { name: 'Kore', desc: 'ခိုင်မာပြီး စိတ်ချရသော အသံ (Firm / Strong)' },
  { name: 'Leda', desc: 'လူငယ်ဆန်ပြီး တက်ကြွသော အသံ (Youthful / Energetic)' },
  { name: 'Aoede', desc: 'အေးဆေးတည်ငြိမ်ပြီး သဘာဝကျသော အသံ (Breezy / Natural)' },
  { name: 'Callirrhoe', desc: 'ဖော်ရွေပြီး သဘောကောင်းသော အသံ (Easy-going / Friendly)' },
  { name: 'Autonoe', desc: 'ရွှင်လန်းတောက်ပသော အသံ (Bright / Cheerful)' },
  { name: 'Despina', desc: 'ငြင်သာပြီး ချောမွေ့သော အသံ (Smooth / Gentle)' },
  { name: 'Erinome', desc: 'ပီပြင်ပြတ်သားသော အသံ (Clear / Articulate)' },
  { name: 'Laomedeia', desc: 'အပြုသဘောဆောင်ပြီး တက်ကြွသော အသံ (Upbeat / Positive)' },
  { name: 'Achernar', desc: 'ငြင်သာပြီး နွေးထွေးသော အသံ (Soft / Warm)' },
  { name: 'Gacrux', desc: 'ရင့်ကျက်ပြီး တည်ငြိမ်သော အသံ (Mature / Steady)' },
  { name: 'Vindemiatrix', desc: 'သိမ်မွေ့ပြီး အေးဆေးသော အသံ (Gentle / Delicate)' },
  { name: 'Sulafat', desc: 'နွေးထွေးပြီး အနီးကပ်ခံစားရသော အသံ (Warm / Approachable)' },
];
function voiceOptionHtml(list, selected) {
  return list.map(function (v) {
    return '<option value="' + v.name + '"' + (v.name === selected ? ' selected' : '') + '>' + v.name + ' — ' + v.desc + '</option>';
  }).join('');
}

// ============================================================
// Step 01 — အကြောင်းအရာ (Input)
// Essential (အမြဲမြင်ရ): Content Idea / Type / Audience / Tone / Language
// Advanced Settings (Accordion): Key Points / Main Message / Length / Generation Level / Additional Instructions
// ============================================================
const STEP1_HTML = `
<div class="aics-step" data-step="1">
<div class="card">
<div class="card-title">&#9997; အကြောင်းအရာ ရေးသားရန် (Create Content)</div>
<p class="form-help" style="margin-bottom:14px;">သင့် Content အကြံကို ထည့်ပြီး "&#10024; Content ရေးသားရန်" နှိပ်ပါ — AI က သင့်အတွက် Content ကို ရေးပေးပါမည်။</p>
<div class="form-group">
<label for="ideaInput">အကြောင်းအရာ (Content Idea) *</label>
<textarea id="ideaInput" placeholder="ဥပမာ — ကော်ဖီဆိုင်တစ်ဆိုင်အတွက် social media content ရေးပါ..." style="min-height:130px;"></textarea>
</div>
<div class="studio-form-grid">
<div class="form-group">
<label for="contentTypeSel">အမျိုးအစား (Type)</label>
<select id="contentTypeSel">
<option value="Article">ဆောင်းပါး (Article)</option>
<option value="Social Media" selected>လူမှုမီဒီယာ (Social Media)</option>
<option value="Blog">ဘလော့ဂ် (Blog)</option>
<option value="Advertisement">ကြော်ငြာ (Advertisement)</option>
<option value="Educational">ပညာရေး (Educational)</option>
<option value="Story / Narrative">ဇာတ်လမ်း / ပုံပြင် (Story / Narrative)</option>
<option value="Other">အခြား (Other)</option>
</select>
</div>
<div class="form-group">
<label for="audSel">ပရိသတ် (Audience)</label>
<select id="audSel">
<option>လူတိုင်း</option>
<option>လူငယ်</option>
<option>လူကြီး</option>
<option>ကလေး</option>
<option>စီးပွားရေးလုပ်ငန်း (Business)</option>
<option>ကျောင်းသား / ကျောင်းသူ (Students)</option>
<option>Gamer</option>
<option>မိဘများ (Parents)</option>
</select>
</div>
<div class="form-group">
<label for="toneSel">ရေးသားပုံစံ (Tone)</label>
<select id="toneSel">
<option>Professional</option>
<option>Friendly</option>
<option selected>Informative</option>
<option>Persuasive</option>
<option>Emotional</option>
<option>Creative</option>
<option>Casual</option>
</select>
</div>
<div class="form-group">
<label for="langSel">ဘာသာစကား (Language)</label>
<select id="langSel">
<option value="မြန်မာ" selected>မြန်မာ (Myanmar)</option>
<option value="English">English</option>
<option value="မြန်မာ + English">မြန်မာ + English</option>
<option value="中文">中文 (Chinese)</option>
<option value="ไทย">ไทย (Thai)</option>
<option value="Auto">ဘာသာစကားမရွေး (Auto)</option>
</select>
</div>
</div>
<button type="button" class="aics-advanced-toggle" id="advToggle" onclick="studioToggleAdvanced('advToggle','advFields')" aria-expanded="false"><span>&#9881; Advanced Settings (အဆင့်မြင့် သတ်မှတ်ချက်များ)</span><span class="aics-adv-arrow">&#9660;</span></button>
<div id="advFields" class="studio-form-grid aics-adv-panel">
<div class="form-group">
<label for="keyPoints">အဓိကအချက်များ (Key Points)</label>
<textarea id="keyPoints" placeholder="ထည့်သွင်းလိုသော အဓိကအချက်များ — တစ်ကြောင်းစီ ရေးပါ..."></textarea>
</div>
<div class="form-group">
<label for="mainMessage">အဓိကအကြောင်းအရာ (Main Message)</label>
<textarea id="mainMessage" placeholder="Content ရဲ့ အဓိက message တစ်ကြောင်းတည်း..."></textarea>
</div>
<div class="form-group">
<label for="lengthSel">Content အရှည် (Length)</label>
<select id="lengthSel">
<option value="Short">တို (Short)</option>
<option value="Medium" selected>အလယ်အလတ် (Medium)</option>
<option value="Long">ရှည် (Long)</option>
</select>
</div>
<div class="form-group">
<label for="typeSelect">Generation Level (Type 1-5)</label>
<select id="typeSelect">
<option value="1">Type 1 — Basic (FREE)</option>
<option value="2">Type 2 — Standard (PRO)</option>
<option value="3">Type 3 — Advanced (PRO)</option>
<option value="4">Type 4 — Premium (PRO)</option>
<option value="5">Type 5 — Ultimate (PRO)</option>
</select>
<p class="form-help">Type 1 = FREE ၊ Type 2-5 = PRO သာ သုံးနိုင်ပါသည်။</p>
</div>
<div class="form-group" style="grid-column:1/-1;">
<label for="additionalInstr">ထပ်မံညွှန်ကြားချက် (Additional Instructions)</label>
<textarea id="additionalInstr" placeholder="AI ကို ထပ်မံ ညွှန်ကြားလိုသည်များ — ဥပမာ: စာကြောင်းတိုများဖြင့် ရေးပါ..."></textarea>
</div>
</div>
<button class="btn btn-primary" id="genBtn" onclick="generateContent()" style="margin-top:4px;">&#10024; Content ရေးသားရန်</button>
<div class="loading" id="genLoading"><div class="spinner"></div> AI ရေးသားနေသည်</div>
<div class="error-box" id="genError"></div>
</div>
</div>`;

// ============================================================
// Step 02 — Content ရလဒ် (+ Actions + Output Hub) — loading ကို ဤနေရာတွင်သာ ပြသည်
// Primary Actions: Video / Audio | Secondary: ပြန်ပြင်ရန် / Copy / သိမ်းရန်
// ============================================================
const STEP3_HTML = `
<div class="aics-step" data-step="2">
<div class="card">
<div class="card-title">&#128221; Content ရလဒ် (Result)</div>
${aicsResultLoadingHtml('contentLoading','AI ရေးသားနေသည်')}
<div id="contentResultBody">
<div id="noResultHint" class="empty-note">Result မရှိသေးပါ — "01 အကြောင်းအရာ" အဆင့်မှာ Generate နှိပ်ပါ</div>
<div class="result-grid" id="resultGrid" style="display:none;">
<div class="result-card">
<div class="result-card-header"><span class="result-card-label">ကွန်တင့် (Content)</span><button class="btn-ghost" onclick="copyText('contentOut')">&#128203; Copy</button></div>
<textarea class="result-card-body auto-expand" id="contentOut" placeholder="AI ရေးထားသော Content ကို ဤနေရာတွင် ပြပါမည် — ကိုယ်တိုင် ပြင်နိုင်ပါသည်" oninput="onContentEdit();autoGrow(this)"></textarea>
</div>
<div class="result-card">
<div class="result-card-header"><span class="result-card-label">ပြောဆိုပုံစံ (Speaking Style)</span><button class="btn-ghost" onclick="copyText('speakingOut')">&#128203; Copy</button></div>
<div class="result-card-body" id="speakingOut"></div>
</div>
<div class="result-card">
<div class="result-card-header"><span class="result-card-label">အသံပုံစံ (Voice Style)</span><button class="btn-ghost" onclick="copyText('voiceOut')">&#128203; Copy</button></div>
<div class="result-card-body" id="voiceOut"></div>
</div>
</div>
</div>
<div class="btn-row" id="resultActionsRow" style="display:none;margin-top:14px;">
<button class="btn btn-primary" onclick="openBranch('video')">&#127916; Video ဆက်ဖန်တီးရန်</button>
<button class="btn btn-secondary" onclick="openBranch('audio')">&#128266; အသံ ဆက်ဖန်တီးရန်</button>
<button class="btn-ghost" onclick="scrollToRevise()">&#9998; ပြန်ပြင်ရန်</button>
<button class="btn-ghost" onclick="copyAllResult()">&#128203; Copy</button>
<button class="btn btn-purple" onclick="saveContentResult()">&#128190; သိမ်းရန်</button>
</div>
<div class="error-box" id="genError2"></div>
<div class="btn-row" id="genRetryRow" style="display:none;justify-content:center;">
<button class="btn btn-secondary" onclick="csNav(1)">&#8592; ပြန်ပြင်ရန်</button>
<button class="btn btn-primary" onclick="generateContent()">&#128260; ပြန်လည်ကြိုးစားရန်</button>
</div>
</div>
</div>
<div class="aics-step" data-step="2b">
<div class="card">
<div class="card-title">&#128172; Edit — Quick Actions</div>
<p class="form-help" style="margin-bottom:12px;">လိုချင်တဲ့ ပြင်ဆင်မှုကို တစ်ချက်နှိပ်ရုံဖြင့် AI က ပြင်ပေးပါမယ် — သို့မဟုတ် အောက်မှာ ကိုယ်တိုင် ညွှန်ကြားချက် ရေးနိုင်ပါတယ်။</p>
<div class="type-chips" id="quickActions"></div>
<div class="revise-section" style="border-top:none;padding-top:0;">
<div class="revise-history" id="reviseHistory"></div>
<div class="revise-input-row">
<textarea id="feedbackInput" placeholder="ဘယ်လိုပြင်စေချင်လဲ? ဥပမာ — ပိုပြီး ရယ်စရာဖြစ်အောင်လုပ်ပါ..."></textarea>
<button class="btn btn-secondary" id="reviseBtn" onclick="reviseContent()">&#128260; ပြင်ပါ</button>
</div>
<div class="loading" id="revLoading"><div class="spinner"></div> ပြင်ဆင်နေပါသည်...</div>
<div class="error-box" id="revError"></div>
</div>
</div>
</div>
<div class="aics-step" data-step="2c">
<div class="aics-out-hub">
<div class="aics-out-hub-title">&#128640; ဆက်လက်ဖန်တီးရန်</div>
<p class="aics-out-hub-sub">သင့် Content ကို နောက်ထပ် Output အဖြစ် ဆက်လက်ဖန်တီးနိုင်ပါသည် — တစ်ခုချင်း သီးသန့် ရွေးနိုင်ပြီး ပြီးတိုင်း ဤနေရာသို့ ပြန်လာနိုင်ပါသည်။</p>
<div class="aics-out-cards">
<div class="aics-out-card">
<div class="aics-out-icon">&#127916;</div>
<div class="aics-out-title">Video</div>
<div class="aics-out-desc">Content &#8594; Video</div>
<button class="btn btn-primary aics-out-btn" onclick="openBranch('video')">&#127916; ဆက်ဖန်တီးရန်</button>
</div>
<div class="aics-out-card">
<div class="aics-out-icon">&#128266;</div>
<div class="aics-out-title">Audio</div>
<div class="aics-out-desc">Content &#8594; Audio</div>
<button class="btn btn-secondary aics-out-btn" onclick="openBranch('audio')">&#128266; ဆက်ဖန်တီးရန်</button>
</div>
</div>
</div>
</div>`;

// ============================================================
// Video Branch — Step 12 (Video Input) / 14 (Result) — AI Processing Step မရှိ
// Essential: Video Type / Duration / Aspect Ratio / Visual Style / Camera Style / Language
// Advanced Accordion: Scene Settings / Visual Settings / Reference / Additional Instructions
// ============================================================
const STEP12_HTML = `
<div class="aics-step" data-step="12">
<div class="card">
<div class="card-title">&#127916; Video ပြင်ဆင်ရန် (Video Setup)</div>
<div class="aics-transfer-note">&#10003; Content Result ကို အလိုအလျောက် ထည့်ထားသည်</div>
<div class="aics-transfer-box" id="videoContentPreview" style="display:none;"></div>
<div class="form-group">
<label for="videoContentText">ဗီဒီယိုအတွက် Content (Content for Video)</label>
<textarea id="videoContentText" class="auto-expand" placeholder="Content ကို အလိုအလျောက် ထည့်ပေးပါမည် — ကိုယ်တိုင်လည်း ပြင်နိုင်ပါသည်" oninput="autoGrow(this)"></textarea>
</div>
<div class="studio-form-grid">
<div class="form-group">
<label for="videoTypeSel">Video Type (ဗီဒီယိုအမျိုးအစား)</label>
<select id="videoTypeSel">
<option>Explainer</option>
<option>Tutorial</option>
<option selected>Product Showcase</option>
<option>Story / Narrative</option>
<option>Advertisement</option>
<option>Social Short</option>
<option>Documentary</option>
<option>Other</option>
</select>
</div>
<div class="form-group">
<label for="videoDuration">ကြာချိန် (Duration) — စက္ကန့်</label>
<input id="videoDuration" type="number" min="5" max="600" step="5" placeholder="ဥပမာ — 60" />
</div>
<div class="form-group">
<label for="videoAspect">အချိုးအစား (Aspect Ratio)</label>
<select id="videoAspect">
<option value="16:9" selected>16:9 (Landscape)</option>
<option value="9:16">9:16 (Vertical)</option>
<option value="1:1">1:1 (Square)</option>
<option value="4:3">4:3</option>
<option value="21:9">21:9 (Cinematic)</option>
</select>
</div>
<div class="form-group">
<label for="videoVisualStyle">ရုပ်ပုံပုံစံ (Visual Style)</label>
<select id="videoVisualStyle">
<option>Realistic</option>
<option>Cinematic</option>
<option>3D Animation</option>
<option>2D Animation</option>
<option>Anime</option>
<option>Minimalist</option>
<option>Vlog Style</option>
<option>Documentary</option>
</select>
</div>
<div class="form-group">
<label for="videoCameraStyle">ကင်မရာပုံစံ (Camera Style)</label>
<select id="videoCameraStyle">
<option>Static</option>
<option>Handheld</option>
<option>Drone</option>
<option>Tracking</option>
<option>Zoom</option>
<option>Pan</option>
<option>Slow Motion</option>
</select>
</div>
<div class="form-group">
<label for="videoLanguage">ဘာသာစကား (Language)</label>
<select id="videoLanguage">
<option value="မြန်မာ" selected>မြန်မာ (Myanmar)</option>
<option value="English">English</option>
<option value="မြန်မာ + English">မြန်မာ + English</option>
<option value="中文">中文 (Chinese)</option>
<option value="ไทย">ไทย (Thai)</option>
<option value="Auto">ဘာသာစကားမရွေး (Auto)</option>
</select>
</div>
</div>
<button type="button" class="aics-advanced-toggle" id="videoAdvToggle" onclick="studioToggleAdvanced('videoAdvToggle','videoAdvFields')" aria-expanded="false"><span>&#9881; Advanced Settings (Scene / Visual / Reference)</span><span class="aics-adv-arrow">&#9660;</span></button>
<div id="videoAdvFields" class="studio-form-grid aics-adv-panel">
<div class="form-group">
<label for="videoSceneSettings">Scene Settings (ဖြစ်စဉ် သတ်မှတ်ချက်)</label>
<textarea id="videoSceneSettings" placeholder="Scene အရေအတွက် / နေရာ / အချိန် စသည်တို့..."></textarea>
</div>
<div class="form-group">
<label for="videoVisualSettings">Visual Settings (ရုပ်ပုံ သတ်မှတ်ချက်)</label>
<textarea id="videoVisualSettings" placeholder="အရောင် / Lighting / Effect များ..."></textarea>
</div>
<div class="form-group">
<label for="videoReference">ကိုးကားချက် (Reference)</label>
<textarea id="videoReference" placeholder="Video ဖန်တီးရာတွင် ကိုးကားလိုသည်များ..."></textarea>
</div>
<div class="form-group">
<label for="videoAdditionalInstructions">ထပ်မံညွှန်ကြားချက် (Additional Instructions)</label>
<textarea id="videoAdditionalInstructions" placeholder="AI ကို ထပ်မံ ညွှန်ကြားလိုသည်များ..."></textarea>
</div>
<div class="form-group">
<label for="videoTypeSelect">Generation Level (Type 1-5)</label>
<select id="videoTypeSelect">
<option value="1">Type 1 — Basic (FREE)</option>
<option value="2">Type 2 — Standard (PRO)</option>
<option value="3">Type 3 — Advanced (PRO)</option>
<option value="4">Type 4 — Premium (PRO)</option>
<option value="5">Type 5 — Ultimate (PRO)</option>
</select>
</div>
</div>
<button class="btn btn-primary" id="videoGenBtn" onclick="generateVideo()">&#9654; Video Plan ဖန်တီးမယ်</button>
<div class="loading" id="videoGenLoading"><div class="spinner"></div> ဗီဒီယိုအစီအစဉ် ရေးဆွဲနေပါသည်...</div>
<div class="error-box" id="videoError"></div>
</div>
</div>`;

const STEP14_HTML = `
<div class="aics-step" data-step="14">
<div class="card">
<div class="card-title">&#127916; Video ရလဒ်</div>
${aicsResultLoadingHtml('videoLoading','AI က သင့်အတွက် Video ကို ပြင်ဆင်နေသည်...')}
<div id="videoResult" style="display:none;">
<div class="card" id="charactersCard" style="display:none;margin-top:16px;">
<div class="card-title">&#128100; ဇာတ်ကောင်များ (Characters)</div>
<div id="charactersList" class="characters-list"></div>
</div>
<div class="card">
<div class="card-title">&#127916; ဖြစ်စဉ်များ (Scenes)</div>
<div id="scenesList"></div>
</div>
</div>
<div class="error-box" id="videoError2"></div>
<div class="btn-row" id="videoRetryRow" style="display:none;justify-content:center;">
<button class="btn btn-secondary" onclick="csNav(12)">&#8592; ပြန်ပြင်ရန်</button>
<button class="btn btn-primary" onclick="generateVideo()">&#128260; ပြန်လည်ကြိုးစားရန်</button>
</div>
<div class="btn-row">
<button class="btn btn-secondary" onclick="backToContentResult()">&#8592; Content ရလဒ်သို့ ပြန်ရန်</button>
<button class="btn btn-purple" onclick="saveContentResult()">&#128190; ဖန်တီးမှုသိမ်းပါ</button>
</div>
</div>
</div>`;

// ============================================================
// Audio Branch — Step 22 (Audio Input) / 24 (Result) — AI Processing Step မရှိ
// Essential: အမျိုးသားအသံ / အမျိုးသမီးအသံ / Voice Style / Language / Speed / Pitch
// Advanced Accordion: Voice Direction / Emotion / Pronunciation
// ============================================================
const STEP22_HTML = `
<div class="aics-step" data-step="22">
<div class="card">
<div class="card-title">&#128266; Audio ပြင်ဆင်ရန် (Audio Setup)</div>
<div class="aics-transfer-note">&#10003; Content Result ကို အလိုအလျောက် ထည့်ထားသည်</div>
<div class="aics-transfer-box" id="audioContentPreview" style="display:none;"></div>
<div class="form-group">
<label for="ttsText">အသံပြောင်းရန် Text (Text for Voice)</label>
<textarea id="ttsText" class="auto-expand" placeholder="Voice ပြောင်းလိုသော Text ကို အလိုအလျောက် ထည့်ပေးပါမည် — ကိုယ်တိုင်လည်း ပြင်နိုင်ပါသည်" oninput="autoGrow(this)"></textarea>
</div>
<div class="studio-form-grid">
<div class="form-group">
<label for="maleVoiceSelect">အမျိုးသားအသံ (Male Voice)</label>
<select id="maleVoiceSelect" onchange="setEffectiveVoice('male')">
${voiceOptionHtml(MALE_VOICES, 'Puck')}
</select>
</div>
<div class="form-group">
<label for="femaleVoiceSelect">အမျိုးသမီးအသံ (Female Voice)</label>
<select id="femaleVoiceSelect" onchange="setEffectiveVoice('female')">
${voiceOptionHtml(FEMALE_VOICES, 'Kore')}
</select>
</div>
<div class="form-group">
<label for="audioVoiceStyleSel">အသံပုံစံ (Voice Style)</label>
<select id="audioVoiceStyleSel">
<option>Natural</option>
<option>Animated</option>
<option>Calm</option>
<option>Energetic</option>
<option>Professional</option>
<option>Friendly</option>
<option>Serious</option>
<option>Warm</option>
</select>
</div>
<div class="form-group">
<label for="audioLangSel">ဘာသာစကား (Language)</label>
<select id="audioLangSel">
<option value="မြန်မာ" selected>မြန်မာ (Myanmar)</option>
<option value="English">English</option>
<option value="မြန်မာ + English">မြန်မာ + English</option>
<option value="中文">中文 (Chinese)</option>
<option value="ไทย">Thai</option>
</select>
</div>
<div class="form-group">
<label for="audioSpeed">Speed (အမြန်နှုန်း)</label>
<input id="audioSpeed" type="number" min="0.5" max="2" step="0.1" value="1" placeholder="1.0" />
</div>
<div class="form-group">
<label for="audioPitch">Pitch (အသံအနိမ့်အမြင့်)</label>
<input id="audioPitch" type="number" min="-10" max="10" step="1" value="0" placeholder="0" />
</div>
</div>
<div class="form-group" style="margin-top:2px;">
<label>လက်ရှိရွေးထားသော အသံ (Selected Voice)</label>
<div class="selected-voice-chip" id="effectiveVoiceLabel">Kore</div>
</div>
<button type="button" class="aics-advanced-toggle" id="audioAdvToggle" onclick="studioToggleAdvanced('audioAdvToggle','audioAdvFields')" aria-expanded="false"><span>&#9881; Advanced Settings (Voice Direction / Emotion / Pronunciation)</span><span class="aics-adv-arrow">&#9660;</span></button>
<div id="audioAdvFields" class="studio-form-grid aics-adv-panel">
<div class="form-group">
<label for="audioDirection">Voice Direction (အသံလမ်းညွှန်)</label>
<textarea id="audioDirection" placeholder="ဥပမာ — နှေးနှေးနဲ့ ရှင်းရှင်းပြောပါ / စိတ်လှုပ်ရှားနေသလို ပြောပါ..."></textarea>
</div>
<div class="form-group">
<label for="audioEmotion">Emotion (စိတ်ခံစားမှု)</label>
<select id="audioEmotion">
<option value="Neutral" selected>Neutral</option>
<option value="Happy">Happy</option>
<option value="Sad">Sad</option>
<option value="Excited">Excited</option>
<option value="Calm">Calm</option>
<option value="Serious">Serious</option>
<option value="Warm">Warm</option>
</select>
</div>
<div class="form-group" style="grid-column:1/-1;">
<label for="audioPronunciation">Pronunciation (အသံထွက်)</label>
<textarea id="audioPronunciation" placeholder="အထူးထွက်ရမည့် စကားလုံးများ / အသံထွက်မှတ်စုများ..."></textarea>
</div>
</div>
<button class="btn btn-secondary" id="voiceBtn" onclick="generateVoice()">&#127908; Generate Voice</button>
<div class="loading" id="voiceGenLoading"><div class="spinner"></div> အသံဖန်တီးနေပါသည်...</div>
<div class="error-box" id="voiceError"></div>
</div>
</div>`;

const STEP24_HTML = `
<div class="aics-step" data-step="24">
<div class="card">
<div class="card-title">&#128266; Audio ရလဒ်</div>
${aicsResultLoadingHtml('audioLoading','AI က သင့်အတွက် အသံကို ပြင်ဆင်နေသည်...')}
<div class="audio-container" id="audioContainer"></div>
<div class="error-box" id="voiceError2"></div>
<div class="btn-row" id="voiceRetryRow" style="display:none;justify-content:center;">
<button class="btn btn-secondary" onclick="csNav(22)">&#8592; ပြန်ပြင်ရန်</button>
<button class="btn btn-primary" onclick="generateVoice()">&#128260; ပြန်လည်ကြိုးစားရန်</button>
</div>
<div class="btn-row">
<button class="btn-ghost" onclick="downloadAudio()">&#128190; Save Audio</button>
</div>
</div>
<div class="card">
<div class="card-title">&#127760; SRT &amp; ဘာသာပြန်</div>
<p class="voice-hint">Generate Voice နှိပ်ပြီးပြီးရင် SRT ကို အလိုအလျောက် ထုတ်နိုင်ပါတယ်။ Box ထဲမှာ တိုက်ရိုက် ပြင်ဆင်နိုင်ပါတယ်။</p>
<div class="btn-row" style="margin-top:12px;">
<button class="btn btn-secondary" id="srtBtn" onclick="generateSrt()">&#128221; Generate SRT (မူရင်း)</button>
</div>
<div class="loading" id="srtLoading"><div class="spinner"></div> SRT ထုတ်နေပါသည်...</div>
<div class="error-box" id="srtError"></div>
<textarea class="srt-box" id="resultSrt" placeholder="Generate Voice ပြီးရင် (သို့) ဒီခလုတ်ကို နှိပ်ရင် SRT ဒီနေရာမှာ ပေါ်ပါမယ်"></textarea>
<div class="btn-row">
<button class="btn-ghost" onclick="copyText('resultSrt')">&#128203; Copy SRT</button>
<button class="btn-ghost" onclick="downloadSrt('resultSrt','content_subtitle.srt')">&#128190; Save .srt</button>
</div>
<hr class="divider">
<p class="voice-hint">ဘာသာပြန်လိုသော ဘက်ကို ရွေးပြီး "ဘာသာပြန်ရန်" နှိပ်ပါ —</p>
<div class="direction-row">
<button class="btn btn-secondary" id="translateBtn" onclick="translateSrt()">&#127760; ဘာသာပြန်ရန်</button>
<div class="direction-chip selected" data-dir="my-to-cn" onclick="selectDirection(this)">&#127480;&#127415; &#8594; &#127464;&#127475; မြန်မာ &#8594; တရုတ်</div>
<div class="direction-chip" data-dir="cn-to-my" onclick="selectDirection(this)">&#127464;&#127475; &#8594; &#127480;&#127415; တရုတ် &#8594; မြန်မာ</div>
</div>
<div class="loading" id="translateLoading"><div class="spinner"></div> ဘာသာပြန်နေပါသည်...</div>
<div class="error-box" id="translateError"></div>
<div class="result-label" id="translatedLabel" style="display:none;">&#9989; ဘာသာပြန်ထားသော SRT</div>
<textarea class="srt-box" id="resultSrtTranslated" placeholder="('ဘာသာပြန်ရန်' ခလုတ်ကို နှိပ်ပါက ဒီနေရာတွင် ပေါ်ပါမည်)"></textarea>
<div class="btn-row">
<button class="btn-ghost" onclick="copyText('resultSrtTranslated')">&#128203; Copy SRT</button>
<button class="btn-ghost" onclick="downloadSrt('resultSrtTranslated','content_subtitle_translated.srt')">&#128190; Save .srt</button>
</div>
</div>
<div class="btn-row">
<button class="btn btn-secondary" onclick="backToContentResult()">&#8592; Content ရလဒ်သို့ ပြန်ရန်</button>
<button class="btn btn-purple" onclick="saveContentResult()">&#128190; ဖန်တီးမှုသိမ်းပါ</button>
</div>
</div>`;

const STEPS_HTML = STEP1_HTML + STEP3_HTML + STEP12_HTML + STEP14_HTML + STEP22_HTML + STEP24_HTML;

export const CONTENT_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Content Studio — AI Creative Studio</title>
<style>
:root{--bg:#080c18;--bg-card:#0d1424;--bg-card2:#111a2e;--bg-input:#0a1020;--border:rgba(0,229,255,0.15);--border-strong:rgba(0,229,255,0.35);--cyan:#00e5ff;--purple:#7b5cff;--text:#e8ecf4;--text2:#8b95a8;--text3:#5a6478;--success:#00e676;--error:#ff5252;--warn:#ffc107}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans Myanmar','Roboto','Segoe UI',Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:14px;line-height:1.6}
a{color:var(--cyan);text-decoration:none}
.aics-work .card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px}
.aics-work .card-title{font-size:15px;font-weight:600;color:var(--cyan);margin-bottom:14px;display:flex;align-items:center;gap:8px}
.aics-work label{display:block;font-size:12.5px;color:var(--text2);margin-bottom:6px;font-weight:500}
.aics-work input,.aics-work textarea,select{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:14px;padding:11px 14px;color:var(--text);font-size:14px;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
.aics-work input:focus,.aics-work textarea:focus,select:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 2px rgba(0,229,255,.1)}
.aics-work textarea{resize:vertical;min-height:90px}
select{cursor:pointer}
select option{background:var(--bg-card);color:var(--text)}
.aics-work .form-group{margin-bottom:16px}
/* Stepper loading — global .loading{display:none!important} နဲ့ မတိုက်အောင် cs-busy သုံး */
.aics-step-btn.cs-busy{border-color:rgba(0,229,255,.6)!important;box-shadow:0 0 18px rgba(0,229,255,.4)!important;}
.aics-step-btn.cs-busy .aics-step-label{color:#00e5ff!important;}
.aics-step-btn.cs-busy .aics-step-loading{display:flex!important;}
/* Video result boxes (Story Studio ပုံစံ) */
.aics-work .final-char-card{background:var(--bg-card2,#0e1626);border:1px solid var(--border,#26324a);border-radius:12px;padding:16px;margin-bottom:12px;}
.aics-work .final-char-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.aics-work .final-char-name{font-weight:700;color:var(--purple,#b7a8ff);font-size:14.5px;}
.aics-work .final-prompt-label{font-size:11.5px;color:var(--cyan);font-weight:700;letter-spacing:.5px;margin:10px 0 4px;text-transform:uppercase;}
.aics-work .final-prompt-text{font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap;word-break:break-word;background:var(--bg-input,#0a1020);padding:10px 12px;border-radius:8px;min-height:20px;}
.aics-work .final-scene-card{background:var(--bg-card2,#0e1626);border:1px solid var(--border,#26324a);border-radius:12px;padding:16px;margin-bottom:14px;}
.aics-work .final-scene-title{font-weight:700;color:var(--purple,#b7a8ff);font-size:14.5px;padding-bottom:10px;margin-bottom:12px;border-bottom:1px solid var(--border,#26324a);}
.aics-work .final-scene-box{margin-bottom:12px;}
.aics-work .final-box-label{font-size:11.5px;color:var(--cyan);font-weight:700;letter-spacing:.5px;margin-bottom:4px;text-transform:uppercase;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;min-height:44px;min-width:44px}
.btn-primary{background:linear-gradient(135deg,var(--cyan),#00b8d4);color:#080c18}
.btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-secondary{background:var(--bg-card2);color:var(--cyan);border:1px solid var(--border-strong)}
.btn-secondary:hover{background:rgba(0,229,255,.1)}
.btn-ghost{background:none;color:var(--text2);border:1px solid var(--border);padding:6px 12px;font-size:12px;min-height:32px}
.btn-ghost:hover{color:var(--cyan);border-color:var(--cyan)}
.btn-purple{background:linear-gradient(135deg,var(--purple),#9c7cff);color:#fff}
.aics-work .btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.aics-work .type-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.aics-work .type-chip{padding:10px 16px;border:1px solid var(--border);border-radius:20px;font-size:13px;cursor:pointer;color:var(--text2);transition:all .2s;user-select:none;min-height:40px;display:inline-flex;align-items:center;gap:6px}
.aics-work .type-chip:hover{border-color:var(--cyan);color:var(--cyan)}
.aics-work .result-grid{display:grid;grid-template-columns:1fr;gap:14px;margin-top:16px}
.aics-work .result-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:16px}
.aics-work .result-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.aics-work .result-card-label{font-size:12px;font-weight:600;color:var(--purple);text-transform:uppercase;letter-spacing:.5px}
.aics-work .result-card-body{font-size:14px;line-height:1.7;color:var(--text);white-space:pre-wrap;word-break:break-word}
.aics-work textarea.result-card-body{white-space:pre-wrap;min-height:150px}
.aics-work .auto-expand{resize:vertical;overflow-y:hidden;min-height:110px}
.aics-work .revise-section{margin-top:20px;padding-top:20px;border-top:1px solid var(--border)}
.aics-work .revise-history{margin-bottom:14px;max-height:280px;overflow-y:auto}
.aics-work .revise-msg{background:var(--bg-input);border-radius:8px;padding:10px 14px;margin-bottom:8px;font-size:13px}
.aics-work .revise-msg.user{border-left:3px solid var(--purple)}
.aics-work .revise-msg .role{font-size:11px;color:var(--text3);margin-bottom:4px}
.aics-work .revise-input-row{display:flex;gap:10px;align-items:flex-end}
.aics-work .revise-input-row textarea{flex:1;min-height:60px}
.aics-work .audio-container{margin-top:12px}
.aics-work .audio-container audio{width:100%;margin-top:8px}
.aics-work .voice-hint{font-size:12px;color:var(--text3);margin-top:8px;font-style:italic}
.aics-work .srt-box{font-family:'Courier New',monospace;font-size:12.5px;min-height:120px;line-height:1.5}
.aics-work .direction-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0}
.aics-work .direction-chip{padding:8px 14px;border:1px solid var(--border);border-radius:20px;font-size:12.5px;cursor:pointer;color:var(--text2);transition:all .2s;user-select:none;min-height:36px;display:inline-flex;align-items:center}
.aics-work .direction-chip:hover{border-color:var(--cyan);color:var(--cyan)}
.aics-work .direction-chip.selected{background:rgba(0,229,255,.12);border-color:var(--cyan);color:var(--cyan);font-weight:600}
.aics-work .divider{border:none;border-top:1px solid var(--border);margin:18px 0}
.aics-work .result-label{font-size:12px;font-weight:600;color:var(--success);margin-bottom:6px}
.aics-work .characters-list{display:flex;flex-wrap:wrap;gap:10px}
.aics-work .scene-image-area{margin-top:12px;text-align:center}
.aics-work .scene-image-area img{max-width:100%;border-radius:8px;border:1px solid var(--border)}
.aics-work .scene-image-placeholder{background:var(--bg-input);border:1px dashed var(--border);border-radius:8px;padding:20px;color:var(--text3);font-size:12px}
.aics-work .loading{display:none !important;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);align-items:center;gap:12px;color:#00e5ff;font-size:15px;font-weight:600;padding:16px 28px;border-radius:16px;background:rgba(8,12,24,.95);border:1px solid rgba(0,229,255,.4);box-shadow:0 8px 40px rgba(0,229,255,.3);z-index:99999;backdrop-filter:blur(12px);white-space:nowrap}
.aics-work .loading.show{display:flex}
.aics-work .spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--cyan);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.aics-work .error-box{display:none;background:rgba(255,82,82,.1);border:1px solid rgba(255,82,82,.3);color:var(--error);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px}
.aics-work .error-box.show{display:block}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:var(--bg-card2);border:1px solid var(--success);color:var(--success);padding:10px 20px;border-radius:8px;font-size:13px;z-index:1000;transition:transform .3s}
.toast.show{transform:translateX(-50%) translateY(0)}
.aics-work .empty-note{color:var(--text3);font-size:13px;padding:16px;background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;text-align:center}
/* ===== Content Studio — Output Hub (Compact — Section 21) ===== */
.aics-work .aics-out-hub{margin-top:4px;padding:20px;background:linear-gradient(135deg,rgba(123,92,255,.07),rgba(0,229,255,.05));border:1px solid rgba(123,92,255,.3);border-radius:14px}
.aics-work .aics-out-hub-title{font-size:16px;font-weight:700;color:var(--purple);margin-bottom:6px;letter-spacing:.3px}
.aics-work .aics-out-hub-sub{font-size:12.5px;color:var(--text2);margin-bottom:16px}
.aics-work .aics-out-cards{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.aics-work .aics-out-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:8px}
.aics-work .aics-out-icon{font-size:30px;line-height:1}
.aics-work .aics-out-title{font-size:15px;font-weight:700;color:var(--text)}
.aics-work .aics-out-desc{font-size:12.5px;color:var(--text2);line-height:1.55;flex:1}
.aics-work .aics-out-btn{margin-top:8px}
.aics-work .aics-transfer-box{background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:14px;font-size:14px;line-height:1.7;white-space:pre-wrap;word-break:break-word;max-height:340px;overflow-y:auto;margin-bottom:14px}
.aics-act:disabled{opacity:.5;cursor:not-allowed}
/* ===== Content Studio — Local Additions (Branch Stepper / Transfer Note / Selected Voice) ===== */
.aics-branch-stepper{display:flex;align-items:center;gap:2px;margin-top:-4px;}
.aics-branch-cap{display:inline-flex;align-items:center;font-size:10.5px;color:var(--purple,#b7a8ff);font-weight:700;letter-spacing:.5px;text-transform:uppercase;white-space:nowrap;padding-right:8px;flex-shrink:0;}
.aics-work .aics-transfer-note{display:flex;align-items:center;gap:6px;background:rgba(0,230,118,.08);border:1px solid rgba(0,230,118,.3);color:var(--success,#00e676);font-size:12.5px;font-weight:600;padding:8px 12px;border-radius:10px;margin-bottom:10px;}
.aics-work .selected-voice-chip{display:inline-block;background:var(--bg-input,#0a1020);border:1px solid var(--border-strong,rgba(0,229,255,.35));color:var(--cyan,#00e5ff);font-weight:700;padding:8px 14px;border-radius:10px;font-size:13px;}
@media(max-width:767px){.aics-work .revise-input-row{flex-direction:column;align-items:stretch}.aics-work .aics-out-cards{grid-template-columns:1fr}.aics-work .aics-out-card{padding:16px}}
</style>
</head>
<body>
<div id="loginView" class="aics-login-overlay" style="display:none;"><div class="aics-login-box"><h2>Login လုပ်ရန် လိုအပ်ပါသည်</h2><p>Content Studio ကို အသုံးပြုရန် Google နဲ့ Login ဝင်ပါ။</p><a href="/api/auth/login?next=/app/content" class="btn btn-primary">Google နဲ့ Login</a></div></div>
${renderStudioShell({
  id: 'content',
  activeId: 'content',
  nameMy: 'Content Studio',
  desc: 'Create engaging content for any platform',
  icon: '✍️',
  modelCat: 'text',
  steps: STEPS,
  content: STEPS_HTML,
})}
${sidebarScript()}
<div class="toast" id="toast">&#9989; ကူးယူပြီးပါပြီ</div>
<style>
/* Compact Output Hub overrides (Content Studio only — higher specificity than shared) */
.aics-work .aics-out-hub{padding:14px 16px;margin-top:2px;}
.aics-work .aics-out-hub .aics-out-hub-title{font-size:14px;margin-bottom:2px;}
.aics-work .aics-out-hub .aics-out-hub-sub{font-size:11.5px;margin-bottom:10px;}
.aics-work .aics-out-hub .aics-out-cards{grid-template-columns:1fr 1fr;gap:10px;}
.aics-work .aics-out-hub .aics-out-card{min-height:0;flex-direction:row;justify-content:flex-start;text-align:left;padding:12px 14px;gap:4px;}
.aics-work .aics-out-hub .aics-out-icon{font-size:20px;}
.aics-work .aics-out-hub .aics-out-title{font-size:13.5px;}
.aics-work .aics-out-hub .aics-out-desc{font-size:11.5px;margin:0;flex:none;}
.aics-work .aics-out-hub .aics-out-btn{margin-top:0;min-height:34px;padding:6px 12px;font-size:12px;}
@media(max-width:767px){
  .aics-work .aics-out-hub .aics-out-cards{grid-template-columns:1fr 1fr;gap:8px;}
  .aics-work .aics-out-hub .aics-out-card{flex-direction:column;align-items:flex-start;padding:10px 12px;}
  .aics-work .aics-out-hub .aics-out-desc{display:none;}
}
</style>
<script>
var token=localStorage.getItem('aics_token')||'';
var userEmail=localStorage.getItem('aics_email')||'';
var userPlan=localStorage.getItem('aics_plan')||'FREE';

// ===== Data Flow State (Section 14 — သီးခြား ခွဲထားသည်) =====
// contentState သည် Source of Truth — video/audio State သည် ၎င်းကို မဖျက်ပါ
// Video Branch နှင့် Audio Branch State များကို သီးခြားထား — Shared Mutable State မသုံး (Section 16)
var contentState = { input: {}, result: null, editedResult: null, status: 'idle' };
var videoState = { content: '', input: {}, result: null, status: 'idle' };
var audioState = { content: '', input: {}, result: null, status: 'idle' };
var lastResult = null;
var videoPlan = null;
var currentAudioBase64 = null;
var currentDirection = 'my-to-cn';
var imgCache = {};
var csBusy = false;
var effectiveVoiceName = 'Kore'; // Audio Branch — Male/Female select မှ နောက်ဆုံး ရွေးထားသော အသံ

// ===== Branch Stepper State Machine (Content.js တွင်သာ — shared.js မပြောင်းပါ) =====
// Main Stepper နှင့် Branch Stepper ကို State အရ သီးခြားထိန်းချုပ်သည် (Section 12)
var CS_MODE = 'main'; // 'main' | 'video' | 'audio'
var csCur = 1;
var csDone = {};
var CS_STEPS = {
  main:  [
    { n: 1,  label: '01 အကြောင်းအရာ' },
    { n: 2,  label: '02 Content ရလဒ်', req: [1] }
  ],
  video: [
    { n: 12, label: '01 Video ပြင်ဆင်ရန်', req: [2] },
    { n: 14, label: '02 Video ရလဒ်', req: [12] }
  ],
  audio: [
    { n: 22, label: '01 Audio ပြင်ဆင်ရန်', req: [2] },
    { n: 24, label: '02 Audio ရလဒ်', req: [22] }
  ]
};

var QUICK_ACTIONS=[
  {label:'&#128260; Rewrite',kind:'rewrite'},
  {label:'&#128259; Shorten',kind:'shorten'},
  {label:'&#128240; Expand',kind:'expand'},
  {label:'&#11088; Improve',kind:'improve'},
  {label:'&#127912; Change Tone',kind:'tone'}
];
var QUICK_PROMPTS={
  rewrite:'ပြန်ရေးပါ (Rewrite) — အဓိကအကြောင်းအရာကို ထိန်းထားပြီး ပုံစံအသစ်နဲ့ လုံးဝပြန်ရေးပါ',
  shorten:'ပိုတိုအောင် အတိုချုံးပါ (Shorten) — အဓိကအချက်များကိုသာ ထားပါ',
  expand:'ပိုရှည်အောင် ချဲ့ပါ (Expand) — အသေးစိတ် ဥပမာများ ထည့်ပြီး ချဲ့ပါ',
  improve:'ပိုကောင်းအောင် ပြင်ပါ (Improve) — စာဖတ်ရလွယ်ကူ၊ ဆွဲဆောင်မှုရှိအောင် ပြင်ပါ',
  tone:'အသံသေချာပြောင်းပါ'
};

(function init(){
  if(!token){document.getElementById('loginView').style.display='flex';document.getElementById('aicsApp').style.display='none';return;}
  var _ue=document.getElementById('userEmail');if(_ue)_ue.textContent=userEmail||'—';
  var _pb=document.getElementById('planBadge');if(_pb)_pb.textContent=userPlan||'FREE';
  buildQuickActions();
})();

// ===== Branch Stepper Helpers =====
function csMeta(n){
  var modes=['main','video','audio'];
  for(var m=0;m<modes.length;m++){
    var steps=CS_STEPS[modes[m]];
    for(var i=0;i<steps.length;i++)if(steps[i].n===n)return steps[i];
  }
  return null;
}
function csModeSteps(){ return CS_STEPS[CS_MODE]||CS_STEPS.main; }
function csAllowed(n){
  if(csDone[n])return true;
  var m=csMeta(n); if(!m)return false;
  var req=m.req||[];
  if(req.length===0)return true;
  for(var i=0;i<req.length;i++)if(!csDone[req[i]])return false;
  return true;
}
function csNav(n){
  var m=csMeta(n); if(!m)return;
  if(m.lock){ showToastMsg('ဤအဆင့်သည် AI ဆောင်ရွက်နေချိန် အဆင့်ဖြစ်ပြီး ကိုယ်တိုင် ရွေးချယ်၍ မရပါ'); return; }
  if(!csAllowed(n)){ showToastMsg('အရင်အဆင့်များ ပြီးမှ ဤအဆင့်သို့ ဆက်သွားနိုင်ပါသည်'); return; }
  csCur=n; csShow(n);
}
// Program အလိုအလျောက် သွားရန် (Branch) — Lock & Req ကို ကျော်သည်
function csGoForce(n){ csCur=n; csShow(n); }
function csMarkDone(n){ csDone[n]=true; csUpdateStepper(); }
// Error ဖြစ်သော Processing Step ကို Done အဖြစ် မသတ်မှတ်စေရန် — Done အခြေအနေကို ပြန်ဖျက်သည်
function csUnmarkDone(n){ csDone[n]=false; csUpdateStepper(); }
function csShow(n){
  var steps=document.querySelectorAll('.aics-step');
  for(var i=0;i<steps.length;i++){
    var ds=steps[i].getAttribute('data-step');
    var match=false;
    if(parseInt(ds,10)===n)match=true;
    else if(n===2&&(ds==='2b'||ds==='2c'))match=true; // Content Result ၃ ပိုင်း (Result / Edit / Output Hub) အတူတူပြရန်
    steps[i].classList.toggle('active',match);
  }
  var w=document.getElementById('aicsWork'); if(w)w.scrollTop=0;
  csUpdateStepper();
  if(window.studioOnStep){ try{ window.studioOnStep(n); }catch(e){} }
}

// ===== Main Stepper + Branch Stepper (Section 12 — State အလိုက် သီးခြား ထိန်းချုပ်) =====
// Main Stepper ကို မဖျောက် — Branch ဝင်လျှင် Branch Stepper ကို ထပ်မံ ပြသည်
function csEnsureBranchStepper(){
  var main=document.getElementById('aicsStepper');
  if(!main)return null;
  var bs=document.getElementById('aicsBranchStepper');
  if(!bs){
    bs=document.createElement('div');
    bs.className='aics-stepper aics-branch-stepper';
    bs.id='aicsBranchStepper';
    main.insertAdjacentElement('afterend',bs);
  }
  return bs;
}
function csStepHtml(s,index){
  var label=((index+1<10)?'0':'')+(index+1)+' '+String(s.label).replace(/^\\d+\\s*/,'');
  return '<button class="aics-step-btn" data-step="'+s.n+'" onclick="csNav('+s.n+')">'+
    '<span class="aics-step-txt"><span class="aics-step-label">'+label+'</span></span>'+
    '<span class="aics-step-loading"><span class="aics-step-spinner"></span>'+(s.loading||'ဖန်တီးနေသည်...')+'</span></button>';
}
function csRenderMainStepper(){
  var c=document.getElementById('aicsStepper'); if(!c)return;
  var steps=CS_STEPS.main;
  var html='<div class="aics-stepper-inner">';
  for(var i=0;i<steps.length;i++){
    html+=csStepHtml(steps[i],i);
    if(i<steps.length-1)html+='<span class="aics-step-link"></span>';
  }
  html+='</div>';
  c.innerHTML=html;
}
function csRenderBranchStepper(){
  var bs=csEnsureBranchStepper();
  if(!bs)return;
  if(CS_MODE==='main'||!CS_STEPS[CS_MODE]){
    bs.style.display='none';
    bs.innerHTML='';
    return;
  }
  bs.style.display='';
  var steps=CS_STEPS[CS_MODE];
  var cap=(CS_MODE==='video')?'&#127916; Video Branch':'&#128266; Audio Branch';
  var html='<span class="aics-branch-cap">'+cap+'</span><div class="aics-stepper-inner">';
  for(var i=0;i<steps.length;i++){
    html+=csStepHtml(steps[i],i);
    if(i<steps.length-1)html+='<span class="aics-step-link"></span>';
  }
  html+='</div>';
  bs.innerHTML=html;
}
function csRenderStepper(){ csRenderMainStepper(); csRenderBranchStepper(); csUpdateStepper(); }
function csUpdateStepper(){
  var btns=document.querySelectorAll('.aics-step-btn');
  for(var i=0;i<btns.length;i++){
    var n=parseInt(btns[i].getAttribute('data-step'),10);
    var m=csMeta(n);
    btns[i].classList.remove('active','done','todo','cs-busy');
    if(n===csCur)btns[i].classList.add('active');
    else if(csDone[n])btns[i].classList.add('done');
    else if(!csAllowed(n)||(m&&m.lock))btns[i].classList.add('todo');
  }
  if(window.studioScrollActiveStep)window.studioScrollActiveStep(true);
}
function csSetMode(mode){ CS_MODE=mode; csRenderStepper(); }

// ===== Output Hub — Branch ဖွင့်ခြင်း (Auto-Transfer — Section 11 / 14) =====
function getEditedContent(){
  var ta=document.getElementById('contentOut');
  var v=(ta&&ta.value!==undefined&&ta.value!==null)?ta.value:'';
  if(typeof v!=='string'||!v.trim())v=(lastResult&&lastResult.content)||'';
  return v;
}
function openBranch(kind){
  if(!lastResult||!lastResult.content){ showToastMsg('အရင် Content ကို ဖန်တီးပါ'); return; }
  var content=getEditedContent();
  contentState.editedResult=content;
  if(kind==='video'){
    videoState.content=content;
    var vt=document.getElementById('videoContentText'); if(vt){vt.value=content;autoGrow(vt);}
    var vp=document.getElementById('videoContentPreview'); if(vp){vp.textContent=content;vp.style.display='';}
    csSetMode('video');
    csGoForce(12);
  }else if(kind==='audio'){
    // Content Studio ၏ ကိုယ်ပိုင် Audio Branch (Step 22→24) သို့ သွားသည် —
    // Voice Studio ကို ပြောင်းမသွားတော့ဘဲ ဤ Studio ထဲမှာပဲ ဆက်လုပ်သည်။
    // Copy/paste မလိုအပ် — နောက်ဆုံး edit လုပ်ထားသော Content ကို Auto-fill လုပ်သည်။
    audioState.content=content;
    var ap=document.getElementById('audioContentPreview'); if(ap){ap.textContent=content;ap.style.display='';}
    var tt=document.getElementById('ttsText'); if(tt){tt.value=content;autoGrow(tt);}
    csSetMode('audio');
    csGoForce(22);
  }
}
function backToContentResult(){
  csSetMode('main');
  if(csDone[2]){ csGoForce(2); } else { csGoForce(1); }
}
function scrollToRevise(){
  var el=document.getElementById('feedbackInput');
  if(el){ try{ el.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){ el.focus(); } }
}

// ===== Helpers — Loading / Error / Toast =====
function setGenButtonsDisabled(off){
  var acts=document.querySelectorAll('.aics-actions .aics-act');
  for(var i=0;i<acts.length;i++)acts[i].disabled=off;
  var ids=['genBtn','videoGenBtn','voiceBtn','reviseBtn','srtBtn','translateBtn'];
  for(var j=0;j<ids.length;j++){var el=document.getElementById(ids[j]);if(el)el.disabled=off;}
}
function setLoading(id,show){
  var el=document.getElementById(id);
  if(el){ if(show)el.classList.add('show'); else el.classList.remove('show'); }
  var meta=csMeta(csCur)||{};
  if(window.studioSetLoading){
    window.studioSetLoading({on:show,step:csCur,text:meta.loading||''});
  }
}
function showError(id,msg){ var el=document.getElementById(id); if(!el)return; el.textContent=msg; el.classList.add('show'); }
function hideError(id){ var el=document.getElementById(id); if(el)el.classList.remove('show'); }
function copyText(id){
  var el=document.getElementById(id); if(!el)return;
  var text=el.value||el.textContent;
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
}
function showToastMsg(msg){ var t=document.getElementById('toast'); if(!t)return; t.textContent=msg||'&#9989; ကူးယူပြီးပါပြီ'; t.classList.add('show'); setTimeout(function(){t.classList.remove('show');},2000); }
function escapeHtml(s){ var d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
function autoGrow(el){ if(!el)return; el.style.height='auto'; el.style.height=(el.scrollHeight+4)+'px'; }
function onContentEdit(){ if(typingNow)return; if(!lastResult)return; lastResult.content=document.getElementById('contentOut').value; contentState.editedResult=lastResult.content; }

// ===== Typewriter Effect + Auto Expand (Section 9) =====
var typeTimer=null;
var typingNow=false;
function stopTypewriter(){ if(typeTimer){clearInterval(typeTimer);typeTimer=null;} typingNow=false; }
function typewriterFill(ta,text,onDone){
  if(!ta)return;
  stopTypewriter();
  var full=text||'';
  if(!full){ta.value='';autoGrow(ta);if(onDone)onDone();return;}
  ta.readOnly=true;
  ta.value='';
  autoGrow(ta);
  typingNow=true;
  var i=0;
  typeTimer=setInterval(function(){
    i+=2;
    if(i>full.length)i=full.length;
    ta.value=full.slice(0,i);
    autoGrow(ta);
    if(i>=full.length){
      clearInterval(typeTimer);typeTimer=null;typingNow=false;ta.readOnly=false;
      if(onDone)onDone();
    }
  },14);
}

function buildQuickActions(){
  var c=document.getElementById('quickActions');if(!c)return;
  c.innerHTML='';
  for(var i=0;i<QUICK_ACTIONS.length;i++){
    (function(a){
      var chip=document.createElement('div');
      chip.className='type-chip';
      chip.innerHTML=a.label;
      chip.onclick=function(){quickAction(a.kind);};
      c.appendChild(chip);
    })(QUICK_ACTIONS[i]);
  }
}

function quickAction(kind){
  if(!lastResult){showError('revError','အရင် Content ကို ဖန်တီးပါ');return;}
  var preset=QUICK_PROMPTS[kind]||'ပြင်ပါ';
  var feedback=preset;
  if(kind==='tone'){
    var tone=prompt('ဘယ်လို Tone ပြောင်းချင်ပါသလဲ? (ဥပမာ — ရယ်စရာ / လေးနက် / ဖော်ရွေ / စိတ်လှုပ်ရှားဖွယ်)','ရယ်စရာ');
    if(tone===null)return;
    feedback='Tone ကို "'+tone+'" ဖြစ်အောင် ပြောင်းပါ';
  }
  document.getElementById('feedbackInput').value=feedback;
  reviseContent();
}

function apiCall(url,body){
  var s=document.getElementById('aiModelSel');if(s&&s.value)body.model=s.value;
  return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.detail||data.error||'Request failed');return data;});});
}

// ===== Step 01 မှ အပိုအချက်များကို Idea ထဲသို့ ပေါင်းသည် (API Contract မပြောင်း) =====
function collectIdeaNotes(){
  var parts=[];
  function val(id){var e=document.getElementById(id);return e?(e.value||'').trim():'';}
  var ct=val('contentTypeSel'); if(ct)parts.push('Content Type: '+ct);
  var aud=val('audSel'); if(aud)parts.push('Audience (ပရိသတ်): '+aud);
  var tone=val('toneSel'); if(tone)parts.push('Tone (ရေးသားပုံစံ): '+tone);
  var lang=val('langSel'); if(lang&&lang!=='Auto')parts.push('Language (ဘာသာစကား): '+lang);
  var kp=val('keyPoints'); if(kp)parts.push('Key Points (အဓိကအချက်များ):\\n'+kp);
  var mm=val('mainMessage'); if(mm)parts.push('Main Message (အဓိကအကြောင်းအရာ): '+mm);
  var len=val('lengthSel'); if(len)parts.push('Length (အရှည်): '+len);
  var ai=val('additionalInstr'); if(ai)parts.push('Additional Instructions (ထပ်မံညွှန်ကြားချက်): '+ai);
  return parts;
}

// ===== Content Generate (Main — Step 01 → 02 Result — Unified Result Loading) =====
function generateContent(){
  if(csBusy)return;
  var idea=document.getElementById('ideaInput').value.trim();
  var type=document.getElementById('typeSelect').value;
  var byok=(document.getElementById('byokInput')||{value:''}).value.trim();
  var audEl=document.getElementById('audSel');
  if(!idea){showError('genError','အကြောင်းအရာ (Content Idea) ထည့်ပါ။');return;}
  if(type!=='1'&&(window.userPlan||localStorage.getItem('aics_plan')||'FREE')!=='PRO'){showError('genError','ဒီ Generation Level ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။ — Settings → Plan မှာ Upgrade လုပ်ပါ။');return;}
  window.aichAud=audEl?audEl.value:'လူတိုင်း';
  var notes=collectIdeaNotes();
  if(notes.length)idea+='\\n\\n'+notes.join('\\n');
  hideError('genError'); hideError('genError2');
  document.getElementById('genRetryRow').style.display='none';
  contentState.input={idea:idea,type:type};
  contentState.status='processing';
  csBusy=true;
  setGenButtonsDisabled(true);
  csMarkDone(1);
  // Unified: Result section အတွင်း loading ပြသည် (processing step မရှိ) — Exact Text: AI ရေးသားနေသည်
  if(window.aicsResultLoading)window.aicsResultLoading.show('contentLoading','AI ရေးသားနေသည်',idea);
  var crb=document.getElementById('contentResultBody');if(crb)crb.style.display='none';
  csGoForce(2);
  setLoading('genLoading',true);
  var body={idea:idea,type:type};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/generate',body)
    .then(function(data){
      lastResult=data;
      contentState.result=data;
      contentState.status='done';
      if(window.aicsResultLoading)window.aicsResultLoading.hide('contentLoading');
      var crb2=document.getElementById('contentResultBody');if(crb2)crb2.style.display='';
      renderContentResult(false); // Typewriter Effect
      document.getElementById('ttsText').value=data.content||'';
      csMarkDone(1);
      csMarkDone(2);
      showToastMsg('&#10004; Content ပြီးပါပြီ');
      csGoForce(2);
    })
    .catch(function(err){
      console.error(err);
      contentState.status='error';
      if(window.aicsResultLoading)window.aicsResultLoading.hide('contentLoading');
      // Error State (Section 8) — Form Data မပျောက်၊ Retry ရှိသည်
      showError('genError2','⚠️ Content ဖန်တီးရာတွင် ပြဿနာရှိပါသည်။');
      document.getElementById('genRetryRow').style.display='flex';
      csUnmarkDone(2);
      showToastMsg('⚠️ Content ဖန်တီး၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ');
    })
    .finally(function(){setLoading('genLoading',false);setGenButtonsDisabled(false);csBusy=false;});
}

function renderContentResult(instant){
  if(!lastResult){
    if(document.getElementById('resultGrid'))document.getElementById('resultGrid').style.display='none';
    if(document.getElementById('noResultHint'))document.getElementById('noResultHint').style.display='block';
    return;
  }
  var ta=document.getElementById('contentOut');
  if(document.getElementById('resultGrid'))document.getElementById('resultGrid').style.display='block';
  if(document.getElementById('noResultHint'))document.getElementById('noResultHint').style.display='none';
  var showMeta=function(){
    if(document.getElementById('speakingOut'))document.getElementById('speakingOut').textContent=lastResult.speakingStyle||'(empty)';
    if(document.getElementById('voiceOut'))document.getElementById('voiceOut').textContent=lastResult.voiceStyle||'(empty)';
    if(document.getElementById('resultActionsRow'))document.getElementById('resultActionsRow').style.display='flex';
  };
  if(instant){
    if(ta){ta.value=lastResult.content||'(empty)';autoGrow(ta);}
    showMeta();
  }else{
    typewriterFill(ta,lastResult.content||'(empty)',showMeta); // Typewriter + Auto Expand
  }
}

// ===== Revise (AI ပြန်ပြင်ရန် — Existing ကို ဆက်သုံးသည်) =====
function reviseContent(){
  if(csBusy)return;
  var feedback=document.getElementById('feedbackInput').value.trim();
  if(!feedback){showError('revError','ပြင်ဆင်ချက် (Feedback) ရေးပါ။');return;}
  if(!lastResult){showError('revError','အရင် Content ကို ဖန်တီးပါ။');return;}
  hideError('revError');
  csBusy=true;
  setGenButtonsDisabled(true);
  setLoading('revLoading',true);
  document.getElementById('reviseBtn').disabled=true;
  addHistory('user',feedback);
  var type=document.getElementById('typeSelect').value;
  var byok=(document.getElementById('byokInput')||{value:''}).value.trim();
  var body={
    originalContent:lastResult.content||'',
    originalSpeaking:lastResult.speakingStyle||'',
    originalVoice:lastResult.voiceStyle||'',
    feedback:feedback,
    type:type
  };
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/revise',body)
    .then(function(data){
      lastResult=data;
      contentState.result=data;
      renderContentResult(false); // Typewriter Effect
      document.getElementById('feedbackInput').value='';
      document.getElementById('ttsText').value=data.content||'';
      addHistory('ai','ပြင်ဆင်ပြီးပါပြီ — အထက်ပါရလဒ်ကို ကြည့်ပါ။');
    })
    .catch(function(err){
      console.error(err);
      showError('revError','Content ပြင်ဆင်ရာတွင် အခက်အခဲရှိနေပါသည်။ ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။');
    })
    .finally(function(){setLoading('revLoading',false);setGenButtonsDisabled(false);document.getElementById('reviseBtn').disabled=false;csBusy=false;});
}
function addHistory(role,text){
  var div=document.createElement('div');
  div.className='revise-msg '+role;
  var roleLabel=role==='user'?'သင် (User)':'AI';
  div.innerHTML='<div class="role">'+roleLabel+'</div>'+escapeHtml(text);
  document.getElementById('reviseHistory').appendChild(div);
  document.getElementById('reviseHistory').scrollTop=document.getElementById('reviseHistory').scrollHeight;
}

// ===== Video Branch — Settings များကို Idea ထဲသို့ ပေါင်းသည် =====
function collectVideoExtras(){
  var parts=[];
  function val(id){var e=document.getElementById(id);return e?(e.value||'').trim():'';}
  var vType=val('videoTypeSel'); if(vType)parts.push('Video Type: '+vType);
  var dur=val('videoDuration'); if(dur)parts.push('Duration: '+dur+' seconds');
  var ar=val('videoAspect'); if(ar)parts.push('Aspect Ratio: '+ar);
  var vs=val('videoVisualStyle'); if(vs)parts.push('Visual Style: '+vs);
  var cs=val('videoCameraStyle'); if(cs)parts.push('Camera Style: '+cs);
  var lang=val('videoLanguage'); if(lang&&lang!=='Auto')parts.push('Language: '+lang);
  var ss=val('videoSceneSettings'); if(ss)parts.push('Scene Settings:\\n'+ss);
  var vv=val('videoVisualSettings'); if(vv)parts.push('Visual Settings:\\n'+vv);
  var ref=val('videoReference'); if(ref)parts.push('Reference:\\n'+ref);
  var ai=val('videoAdditionalInstructions'); if(ai)parts.push('Additional Instructions:\\n'+ai);
  return parts;
}

// ===== Video Branch — Generate (Step 12 → 14 Result — Unified Result Loading) =====
function generateVideo(){
  if(csBusy)return;
  var content=(document.getElementById('videoContentText').value||'').trim();
  var type=document.getElementById('videoTypeSelect').value;
  var byok=(document.getElementById('videoByokInput')||{value:''}).value.trim();
  if(!content){showError('videoError','Content မရှိသေးပါ — Content ကို အရင်ဖန်တီးပါ။');return;}
  hideError('videoError'); hideError('videoError2');
  document.getElementById('videoRetryRow').style.display='none';
  videoState.content=content;
  var extras=collectVideoExtras();
  var idea=content;
  if(extras.length)idea+='\\n\\n'+extras.join('\\n');
  videoState.input={type:type,settings:extras};
  videoState.status='processing';
  csBusy=true;
  setGenButtonsDisabled(true);
  csMarkDone(12);
  // Unified: Video Result section အတွင်း loading ပြသည်
  if(window.aicsResultLoading)window.aicsResultLoading.show('videoLoading','AI က သင့်အတွက် Video ကို ပြင်ဆင်နေသည်...',content);
  var vrc=document.getElementById('videoResult');if(vrc)vrc.style.display='none';
  csGoForce(14);
  setLoading('videoGenLoading',true);
  var body={idea:idea,type:type};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/video',body)
    .then(function(data){
      videoPlan=data;
      videoState.result=data;
      videoState.status='done';
      if(window.aicsResultLoading)window.aicsResultLoading.hide('videoLoading');
      renderVideoPlan(data);
      document.getElementById('videoResult').style.display='block';
      csMarkDone(12);
      csMarkDone(14);
      showToastMsg('&#10004; Video Plan ပြီးပါပြီ');
      csGoForce(14);
    })
    .catch(function(err){
      console.error(err);
      videoState.status='error';
      if(window.aicsResultLoading)window.aicsResultLoading.hide('videoLoading');
      showError('videoError2','Video ဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။ ပြန်လည်ကြိုးစားပါ။');
      document.getElementById('videoRetryRow').style.display='flex';
      csUnmarkDone(14);
      showToastMsg('⚠️ Video ဖန်တီး၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ');
    })
    .finally(function(){setLoading('videoGenLoading',false);setGenButtonsDisabled(false);csBusy=false;});
}
function renderVideoPlan(data){
  var charsCard=document.getElementById('charactersCard');
  var charsList=document.getElementById('charactersList');
  if(data.characters&&data.characters.length>0){
    charsCard.style.display='block';
    charsList.innerHTML='';
    for(var i=0;i<data.characters.length;i++){
      var c=data.characters[i];
      var div=document.createElement('div');
      div.className='final-char-card';
      div.innerHTML='<div class="final-char-head"><span class="final-char-name">&#128100; '+escapeHtml(c.name||('Character '+(i+1)))+'</span></div>'+
                    '<div class="final-prompt-label">Character Reference</div>'+
                    '<div class="final-prompt-text">'+escapeHtml(c.description||'')+'</div>'+
                    '<div class="btn-row"><button class="btn-ghost" onclick="copyCharText('+i+')">&#128203; Copy Prompt</button></div>';
      charsList.appendChild(div);
    }
  }else{
    charsCard.style.display='none';
  }
  var scenesList=document.getElementById('scenesList');
  scenesList.innerHTML='';
  if(data.scenes&&data.scenes.length>0){
    for(var j=0;j<data.scenes.length;j++){
      (function(idx){
        var s=data.scenes[idx];
        var item=document.createElement('div');
        item.className='final-scene-card';
        var html='<div class="final-scene-title">&#127916; SCENE '+(s.number||(idx+1))+(s.duration?' <span style="color:var(--text2,#8b95a8);font-weight:400;">&#9201; '+escapeHtml(s.duration)+'</span>':'')+'</div>';
        if(s.visualPrompt){
          html+='<div class="final-scene-box"><div class="final-box-label">&#127916; Video Prompt</div>'+
                '<div class="final-prompt-text" id="sceneVP_'+idx+'">'+escapeHtml(s.visualPrompt)+'</div>'+
                '<div class="btn-row"><button class="btn-ghost" onclick="copySceneText('+idx+')">&#128203; Copy Video Prompt</button></div></div>';
        }
        if(s.description){
          html+='<div class="final-scene-box"><div class="final-box-label">&#127757; Environment Reference</div>'+
                '<div class="final-prompt-text">'+escapeHtml(s.description)+'</div>'+
                '<div class="btn-row"><button class="btn-ghost" onclick="copyEnvText('+idx+')">&#128203; Copy Environment Prompt</button></div></div>';
        }
        if(s.dialogue){
          html+='<div class="final-scene-box"><div class="final-box-label">&#128172; Dialogue</div>'+
                '<div class="final-prompt-text">'+escapeHtml(s.dialogue)+'</div>'+
                '<div class="btn-row"><button class="btn-ghost" onclick="copyDialogueText('+idx+')">&#128203; Copy Dialogue</button></div></div>';
        }
        html+='<div class="scene-image-area" id="sceneImg_'+idx+'">'+
              (imgCache['scene_'+idx]?'<img src="'+imgCache['scene_'+idx]+'"><div style="margin-top:8px;"><button class="btn-ghost" onclick="generateSceneImage('+idx+')">&#128260; ပြန်ဖန်တီးပါ</button></div>':'<button class="btn btn-secondary" onclick="generateSceneImage('+idx+')">&#128444; ဤဖြစ်စဉ်၏ ရုပ်ပုံဖန်တီးပါ</button>')+
              '</div>';
        item.innerHTML=html;
        scenesList.appendChild(item);
      })(j);
    }
  }else{
    scenesList.innerHTML='<div style="color:var(--text3);text-align:center;padding:20px;">Scenes မတွေ့ရှိပါ</div>';
  }
}
function copySceneText(idx){
  if(!videoPlan||!videoPlan.scenes||!videoPlan.scenes[idx])return;
  var text=videoPlan.scenes[idx].visualPrompt||'';
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
}
function copyCharText(idx){
  if(!videoPlan||!videoPlan.characters||!videoPlan.characters[idx])return;
  var c=videoPlan.characters[idx];
  var text=c.characterPrompt||c.prompt||c.description||'';
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
}
function copyEnvText(idx){
  if(!videoPlan||!videoPlan.scenes||!videoPlan.scenes[idx])return;
  var text=videoPlan.scenes[idx].description||'';
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
}
function copyDialogueText(idx){
  if(!videoPlan||!videoPlan.scenes||!videoPlan.scenes[idx])return;
  var text=videoPlan.scenes[idx].dialogue||'';
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
}
function generateSceneImage(idx){
  if(!videoPlan||!videoPlan.scenes||!videoPlan.scenes[idx])return;
  var scene=videoPlan.scenes[idx];
  var prompt=scene.visualPrompt||scene.description||'';
  if(!prompt){alert('ဒီဖြစ်စဉ်တွင် Visual Prompt မရှိပါ');return;}
  var area=document.getElementById('sceneImg_'+idx);
  if(!area)return;
  area.innerHTML='<div class="loading show" style="justify-content:center;position:static;transform:none;display:flex;"><div class="spinner"></div> ရုပ်ပုံဖန်တီးနေပါသည်...</div>';
  var byok=(document.getElementById('videoByokInput')||{value:''}).value.trim();
  var body={prompt:prompt};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/video-image',body)
    .then(function(data){
      if(data.data){
        var imgSrc='data:'+(data.mimeType||'image/png')+';base64,'+data.data;
        imgCache['scene_'+idx]=imgSrc;
        area.innerHTML='<img src="'+imgSrc+'" alt="Scene '+(idx+1)+'">'+
                       '<div style="margin-top:8px;"><button class="btn-ghost" onclick="generateSceneImage('+idx+')">&#128260; ပြန်ဖန်တီးပါ</button></div>';
      }else{
        area.innerHTML='<div class="scene-image-placeholder">ရုပ်ပုံမထွက်ပါ</div>';
      }
    })
    .catch(function(err){
      console.error(err);
      area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">ရုပ်ပုံဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။</div>'+
                     '<button class="btn-ghost" onclick="generateSceneImage('+idx+')">ထပ်စမ်းပါ</button>';
    });
}

// ===== Audio Branch — Voice Selection (Male / Female — Section 15) =====
function setEffectiveVoice(kind){
  var sel=document.getElementById(kind==='male'?'maleVoiceSelect':'femaleVoiceSelect');
  if(sel&&sel.value)effectiveVoiceName=sel.value;
  var ind=document.getElementById('effectiveVoiceLabel');
  if(ind)ind.textContent=effectiveVoiceName;
}
function collectAudioExtras(){
  var parts=[];
  function val(id){var e=document.getElementById(id);return e?(e.value||'').trim():'';}
  var vs=val('audioVoiceStyleSel'); if(vs)parts.push('Voice Style: '+vs);
  var lang=val('audioLangSel'); if(lang)parts.push('Language: '+lang);
  var sp=val('audioSpeed'); if(sp)parts.push('Speed: '+sp);
  var pt=val('audioPitch'); if(pt)parts.push('Pitch: '+pt);
  var dir=val('audioDirection'); if(dir)parts.push('Voice Direction:\\n'+dir);
  var em=val('audioEmotion'); if(em&&em!=='Neutral')parts.push('Emotion: '+em);
  var pr=val('audioPronunciation'); if(pr)parts.push('Pronunciation:\\n'+pr);
  return parts;
}

// ===== Audio Branch — Generate Voice (Step 22 → 24 Result — Unified Result Loading) =====
function generateVoice(){
  if(csBusy)return;
  var text=(document.getElementById('ttsText').value||'').trim();
  if(!text){showError('voiceError','Text ထည့်ပါ (သို့မဟုတ် Content ကို အရင်ဖန်တီးပါ)။');return;}
  var voiceName=effectiveVoiceName||'Kore';
  var extras=collectAudioExtras();
  var byok=(document.getElementById('byokInput')||{value:''}).value.trim();
  hideError('voiceError'); hideError('voiceError2');
  document.getElementById('voiceRetryRow').style.display='none';
  audioState.content=text;
  audioState.input={voiceName:voiceName,settings:extras};
  audioState.status='processing';
  csBusy=true;
  setGenButtonsDisabled(true);
  csMarkDone(22);
  // Unified: Audio Result section အတွင်း loading ပြသည်
  if(window.aicsResultLoading)window.aicsResultLoading.show('audioLoading','AI က သင့်အတွက် အသံကို ပြင်ဆင်နေသည်...',text);
  var ac=document.getElementById('audioContainer');if(ac)ac.innerHTML='';
  csGoForce(24);
  setLoading('voiceGenLoading',true);
  document.getElementById('voiceBtn').disabled=true;
  var body={text:text,voiceName:voiceName};
  if(extras.length)body.settings=extras;
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/tts',body)
    .then(function(data){
      currentAudioBase64=data.data;
      audioState.result={data:data.data,mimeType:data.mimeType||'audio/wav'};
      audioState.status='done';
      if(window.aicsResultLoading)window.aicsResultLoading.hide('audioLoading');
      var audioUrl='data:'+(data.mimeType||'audio/wav')+';base64,'+data.data;
      var container=document.getElementById('audioContainer');
      container.innerHTML='<audio controls src="'+audioUrl+'"></audio>'+
        '<div class="btn-row"><button class="btn-ghost" onclick="downloadAudio()">&#128190; Save Audio</button></div>';
      csMarkDone(22);
      csMarkDone(24);
      showToastMsg('&#10004; အသံပြီးပါပြီ');
      csGoForce(24);
    })
    .catch(function(err){
      console.error(err);
      audioState.status='error';
      if(window.aicsResultLoading)window.aicsResultLoading.hide('audioLoading');
      showError('voiceError2','အသံဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။ ပြန်လည်ကြိုးစားပါ။');
      document.getElementById('voiceRetryRow').style.display='flex';
      csUnmarkDone(24);
      showToastMsg('⚠️ အသံဖန်တီး၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ');
    })
    .finally(function(){setLoading('voiceGenLoading',false);setGenButtonsDisabled(false);document.getElementById('voiceBtn').disabled=false;csBusy=false;});
}
function downloadAudio(){
  if(!currentAudioBase64)return;
  var byteChars=atob(currentAudioBase64);
  var byteNumbers=new Array(byteChars.length);
  for(var i=0;i<byteChars.length;i++)byteNumbers[i]=byteChars.charCodeAt(i);
  var blob=new Blob([new Uint8Array(byteNumbers)],{type:'audio/wav'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download='content_voice.wav';
  a.click();
  URL.revokeObjectURL(url);
}

// ===== SRT & Translate (Existing — Audio Result တွင် ဆက်သုံးသည်) =====
function generateSrt(){
  if(csBusy)return;
  if(!currentAudioBase64){showError('srtError','အရင် Generate Voice ကို နှိပ်ပါ — Audio မရှိသေးပါ။');return;}
  var byok=(document.getElementById('byokInput')||{value:''}).value.trim();
  hideError('srtError');
  csBusy=true;
  setGenButtonsDisabled(true);
  setLoading('srtLoading',true);
  document.getElementById('srtBtn').disabled=true;
  var body={audioBase64:currentAudioBase64,mimeType:'audio/wav'};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/srt',body)
    .then(function(data){
      document.getElementById('resultSrt').value=data.srt||'';
    })
    .catch(function(err){
      console.error(err);
      showError('srtError','SRT ထုတ်ရာတွင် အခက်အခဲရှိနေပါသည်။ ပြန်ကြိုးစားပါ။');
    })
    .finally(function(){setLoading('srtLoading',false);setGenButtonsDisabled(false);document.getElementById('srtBtn').disabled=false;csBusy=false;});
}
function selectDirection(chip){
  var chips=document.querySelectorAll('.direction-chip');
  for(var i=0;i<chips.length;i++)chips[i].classList.remove('selected');
  chip.classList.add('selected');
  currentDirection=chip.getAttribute('data-dir');
}
function translateSrt(){
  if(csBusy)return;
  var srtText=(document.getElementById('resultSrt').value||'').trim();
  if(!srtText){showError('translateError','မူရင်း SRT မရှိသေးပါ — Generate SRT ကို အရင်နှိပ်ပါ။');return;}
  var byok=(document.getElementById('byokInput')||{value:''}).value.trim();
  hideError('translateError');
  csBusy=true;
  setGenButtonsDisabled(true);
  setLoading('translateLoading',true);
  document.getElementById('translateBtn').disabled=true;
  var body={srtText:srtText,direction:currentDirection};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/translate-srt',body)
    .then(function(data){
      document.getElementById('resultSrtTranslated').value=data.srt||'';
      document.getElementById('translatedLabel').style.display='block';
    })
    .catch(function(err){
      console.error(err);
      showError('translateError','ဘာသာပြန်ရာတွင် အခက်အခဲရှိနေပါသည်။ ပြန်ကြိုးစားပါ။');
    })
    .finally(function(){setLoading('translateLoading',false);setGenButtonsDisabled(false);document.getElementById('translateBtn').disabled=false;csBusy=false;});
}
function downloadSrt(elementId,filename){
  var text=document.getElementById(elementId).value;
  if(!text||!text.trim()){showToastMsg('SRT မရှိသေးပါ');return;}
  var blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download=filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ===== Result — Save / Copy / Export (Existing ကို မဖျက်ပါ) =====
function buildResultText(){
  var parts=[];
  if(lastResult&&lastResult.content)parts.push('CONTENT\\n======================\\n'+lastResult.content);
  if(lastResult&&lastResult.speakingStyle)parts.push('SPEAKING STYLE\\n======================\\n'+lastResult.speakingStyle);
  if(lastResult&&lastResult.voiceStyle)parts.push('VOICE STYLE\\n======================\\n'+lastResult.voiceStyle);
  if(videoPlan&&videoPlan.characters&&videoPlan.characters.length){
    var cp='CHARACTERS\\n======================\\n';
    for(var i=0;i<videoPlan.characters.length;i++){
      var c=videoPlan.characters[i];
      cp+='\\n'+(c.name||'Character '+(i+1))+': '+(c.description||'');
    }
    parts.push(cp);
  }
  if(videoPlan&&videoPlan.scenes&&videoPlan.scenes.length){
    var sp='VIDEO PLAN SCENES\\n======================\\n';
    for(var j=0;j<videoPlan.scenes.length;j++){
      var s=videoPlan.scenes[j];
      sp+='\\nScene '+(s.number||(j+1))+(s.duration?' ('+s.duration+')':'')+'\\n';
      if(s.description)sp+='Description: '+s.description+'\\n';
      if(s.visualPrompt)sp+='Visual Prompt: '+s.visualPrompt+'\\n';
      if(s.dialogue)sp+='Dialogue: '+s.dialogue+'\\n';
    }
    parts.push(sp);
  }
  return parts.join('\\n\\n');
}
function saveContentResult(){
  var text=buildResultText();
  if(!text.trim()){showToastMsg('Save လုပ်ဖို့ Result မရှိသေးပါ');return;}
  var idea=(document.getElementById('ideaInput').value.trim()||'Content Result').substring(0,40);
  var title=prompt('Creation အမည် ပေးပါ:',idea);
  if(title===null)return;
  AICS_CREATIONS.save({studio:'CONTENT',type:document.getElementById('typeSelect').value,title:title||idea,original_prompt:document.getElementById('ideaInput').value,ai_output:text})
    .then(function(){showToastMsg('&#128190; My Creations ထဲ Save ပြီးပါပြီ');})
    .catch(function(err){showToastMsg('Save မအောင်မြင်ပါ: '+(err&&err.message||'Error'));});
}
function copyAllResult(){
  var text=buildResultText();
  if(!text.trim()){showToastMsg('Result မရှိသေးပါ');return;}
  copyToClipboard(text);
}
function exportResult(){
  var text=buildResultText();
  if(!text.trim()){showToastMsg('Export လုပ်ဖို့ Result မရှိသေးပါ');return;}
  var blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='content_result.txt';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
  showToastMsg('&#10004; Export ပြီးပါပြီ');
}
function copyToClipboard(text){
  if(!text){showToastMsg('Text မရှိပါ');return;}
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
}

// ===== Studio Shell Hooks =====
// Stepper = Main + Branch — MAP (System တစ်ခုလုံး) ကို UI တွင် မပြပါ
function studioOnStep(n){
  var backHub={label:'&#8592; Content ရလဒ်သို့ ပြန်ရန်',cls:'ghost',fn:backToContentResult};
  if(n===1){
    var acts=[{label:'Reset',cls:'ghost',fn:studioReset}];
    if(lastResult)acts.push({label:'Next &#8594;',cls:'secondary',fn:function(){csNav(2);}});
    acts.push({label:'&#10024; Content ရေးသားရန်',cls:'primary',fn:generateContent});
    studioSetActions(acts);
  }else if(n===2){
    studioSetActions([{label:'Reset',cls:'ghost',fn:studioReset},{label:'&#128203; Copy',cls:'ghost',fn:copyAllResult},{label:'&#128190; ဖန်တီးမှုသိမ်းပါ',cls:'purple',fn:saveContentResult}]);
  }else if(n===12){
    studioSetActions([backHub]);
  }else if(n===22){
    studioSetActions([backHub]);
  }else if(n===14||n===24){
    studioSetActions([backHub,{label:'&#128190; ဖန်တီးမှုသိမ်းပါ',cls:'purple',fn:saveContentResult}]);
  }
}
window.studioOnStep=studioOnStep;

function studioCollectDraft(){
  function val(id){var e=document.getElementById(id);return e?(e.value||''):'';}
  return {
    mode:CS_MODE,
    csCur:csCur,
    idea:val('ideaInput'),
    type:val('typeSelect')||'1',
    aud:val('audSel'),
    contentType:val('contentTypeSel'),
    tone:val('toneSel'),
    lang:val('langSel'),
    keyPoints:val('keyPoints'),
    mainMessage:val('mainMessage'),
    length:val('lengthSel'),
    additionalInstr:val('additionalInstr'),
    byok:val('byokInput'),
    videoContent:val('videoContentText'),
    videoType:val('videoTypeSelect')||'1',
    videoTypeSel:val('videoTypeSel'),
    videoDuration:val('videoDuration'),
    videoAspect:val('videoAspect'),
    videoVisualStyle:val('videoVisualStyle'),
    videoCameraStyle:val('videoCameraStyle'),
    videoLanguage:val('videoLanguage'),
    videoSceneSettings:val('videoSceneSettings'),
    videoVisualSettings:val('videoVisualSettings'),
    videoReference:val('videoReference'),
    videoAdditionalInstructions:val('videoAdditionalInstructions'),
    videoByok:val('videoByokInput'),
    ttsText:val('ttsText'),
    maleVoice:val('maleVoiceSelect'),
    femaleVoice:val('femaleVoiceSelect'),
    effectiveVoice:effectiveVoiceName,
    audioVoiceStyle:val('audioVoiceStyleSel'),
    audioLang:val('audioLangSel'),
    audioSpeed:val('audioSpeed'),
    audioPitch:val('audioPitch'),
    audioDirection:val('audioDirection'),
    audioEmotion:val('audioEmotion'),
    audioPronunciation:val('audioPronunciation'),
    srt:val('resultSrt'),
    srtTranslated:val('resultSrtTranslated'),
    direction:currentDirection,
    lastResult:lastResult,
    videoPlan:videoPlan,
    audio:currentAudioBase64
  };
}
window.studioCollectDraft=studioCollectDraft;

function studioRestoreDraft(d){
  if(!d)return;
  function setVal(id,v){if(v!==undefined&&v!==null&&document.getElementById(id))document.getElementById(id).value=v;}
  setVal('ideaInput',d.idea);
  setVal('typeSelect',d.type||'1');
  setVal('audSel',d.aud);
  var audEl=document.getElementById('audSel');if(audEl)window.aichAud=audEl.value;
  setVal('contentTypeSel',d.contentType);
  setVal('toneSel',d.tone);
  setVal('langSel',d.lang);
  setVal('keyPoints',d.keyPoints);
  setVal('mainMessage',d.mainMessage);
  setVal('lengthSel',d.length);
  setVal('additionalInstr',d.additionalInstr);
  setVal('byokInput',d.byok);
  setVal('videoContentText',d.videoContent);
  setVal('videoTypeSelect',d.videoType||'1');
  setVal('videoTypeSel',d.videoTypeSel);
  setVal('videoDuration',d.videoDuration);
  setVal('videoAspect',d.videoAspect);
  setVal('videoVisualStyle',d.videoVisualStyle);
  setVal('videoCameraStyle',d.videoCameraStyle);
  setVal('videoLanguage',d.videoLanguage);
  setVal('videoSceneSettings',d.videoSceneSettings);
  setVal('videoVisualSettings',d.videoVisualSettings);
  setVal('videoReference',d.videoReference);
  setVal('videoAdditionalInstructions',d.videoAdditionalInstructions);
  setVal('videoByokInput',d.videoByok);
  setVal('ttsText',d.ttsText);
  setVal('maleVoiceSelect',d.maleVoice);
  setVal('femaleVoiceSelect',d.femaleVoice);
  if(d.effectiveVoice)effectiveVoiceName=d.effectiveVoice;
  setVal('audioVoiceStyleSel',d.audioVoiceStyle);
  setVal('audioLangSel',d.audioLang);
  setVal('audioSpeed',d.audioSpeed);
  setVal('audioPitch',d.audioPitch);
  setVal('audioDirection',d.audioDirection);
  setVal('audioEmotion',d.audioEmotion);
  setVal('audioPronunciation',d.audioPronunciation);
  var ev=document.getElementById('effectiveVoiceLabel');if(ev)ev.textContent=effectiveVoiceName;
  setVal('resultSrt',d.srt);
  setVal('resultSrtTranslated',d.srtTranslated);
  if(d.direction)currentDirection=d.direction;
  lastResult=d.lastResult||null;
  videoPlan=d.videoPlan||null;
  currentAudioBase64=d.audio||null;
  contentState.result=lastResult;
  if(lastResult){
    renderContentResult(true);
    csMarkDone(1);
    csMarkDone(2);
  }
  if(videoPlan){
    renderVideoPlan(videoPlan);
    document.getElementById('videoResult').style.display='block';
    csMarkDone(12);
    csMarkDone(14);
    var vp=document.getElementById('videoContentPreview');
    if(vp&&videoState.content)vp.textContent=videoState.content;
  }
  if(currentAudioBase64){
    var audioUrl='data:audio/wav;base64,'+currentAudioBase64;
    document.getElementById('audioContainer').innerHTML='<audio controls src="'+audioUrl+'"></audio><div class="btn-row"><button class="btn-ghost" onclick="downloadAudio()">&#128190; Save Audio</button></div>';
    csMarkDone(22);
    csMarkDone(24);
    var ap=document.getElementById('audioContentPreview');
    if(ap&&audioState.content)ap.textContent=audioState.content;
  }
  if(d.mode&&CS_STEPS[d.mode]){
    CS_MODE=d.mode;
  }
  csRenderStepper();
  var target=d.csCur||1;
  var m=csMeta(target);
  if(!m||m.lock||!csAllowed(target)){
    var steps=csModeSteps();
    target=steps[steps.length-1].n;
    if(csMeta(target).lock)target=steps[steps.length-2].n;
    if(!csAllowed(target))target=1;
  }
  csCur=target;
  csShow(target);
}
window.studioRestoreDraft=studioRestoreDraft;

// ===== Boot (Shell ပြီးမှ Main + Branch Stepper ကို ကိုယ်ပိုင်ဖြင့် ပြန်ဆောက်သည်) =====
function csBoot(){
  csRenderStepper();
  csShow(csCur);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',csBoot);
else csBoot();
</script>
</body>
</html>`;
