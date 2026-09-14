// AI Creative Studio — Content Studio Frontend
// Architecture: Content → Output Hub → Branch (Video / Audio)
// Main Stepper: ① အကြောင်းအရာ → ② Content ရလဒ်
// Video Branch : ① Video ပြင်ဆင်ရန် → ② Video ရလဒ်
// Audio Branch : ① Audio ပြင်ဆင်ရန် → ② Audio ရလဒ်
// AI processing-status steps များကို Stepper ထဲတွင် မပြတော့ပါ — loading ကို Result section အတွင်း၌သာ ပြသည် (Unified)
// Studio Isolation: ဤ File သည် Content Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Shared: renderSidebar / sidebarScript / renderStudioShell (frontend/shared.js) — မပြောင်းပါ
// ⚠️ API Contract / Backend Routes မပြောင်းပါ — Frontend Flow သာ ပြောင်းပါသည်။
// Stepper = လက်ရှိသွားနေသော လမ်းကြောင်း | MAP = System တစ်ခုလုံး၏ workflow (Internal)

import { renderSidebar, sidebarScript, renderStudioShell, aicsResultLoadingHtml } from './shared.js';

// ===== Shell Stepper (Main — 2 Steps; Shell အတွက် Lock/Req Metadata) =====
const STEPS = [
  { label: '01 အကြောင်းအရာ' },
  { label: '02 Content ရလဒ် / Output Hub', req: [1] },
];

// ============================================================
// Step 01 — အကြောင်းအရာ (Input)
// ============================================================
const STEP1_HTML = `
<div class="aics-step" data-step="1">
<div class="card">
<div class="card-title">&#9997; Create Content</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">သင့် အကြံ / အကြောင်းအရာကို ထည့်ပြီး Generate နှိပ်ပါ — AI က Content + Speaking Style + Voice Style သုံးမျိုး ရေးပေးပါမယ်။</p>
<div class="adv-grid">
<div class="form-group">
<label>အမျိုးအစား (Type 1-5)</label>
<select id="typeSelect">
<option value="1">Type 1 — Basic (FREE)</option>
<option value="2">Type 2 — Standard (PRO)</option>
<option value="3">Type 3 — Advanced (PRO)</option>
<option value="4">Type 4 — Premium (PRO)</option>
<option value="5">Type 5 — Ultimate (PRO)</option>
</select>
</div>
<div class="form-group">
<label>ဘယ်သူအတွက်</label>
<select id="audSel"><option>လူတိုင်း</option><option>လူငယ်</option><option>လူကြီး</option><option>ကလေး</option></select>
</div>
</div>
<div class="form-group" style="margin-top:4px;">
<label>သင့် အကြံ / အကြောင်းအရာ (User Idea) *</label>
<textarea id="ideaInput" placeholder="ဥပမာ — ကော်ဖီဆိုင်တစ်ဆင်အတွက် social media content ရေးပါ..." style="min-height:130px;"></textarea>
</div>
<button class="btn btn-primary" id="genBtn" onclick="generateContent()" style="margin-top:4px;">&#10024; Generate Content</button>
<div class="loading" id="genLoading"><div class="spinner"></div> AI က ရေးနေပါသည်...</div>
<div class="error-box" id="genError"></div>
</div>
</div>`;

// ============================================================
// Step 02 — Content ရလဒ် (+ Output Hub) — loading ကို ဤနေရာတွင်သာ ပြသည်
// ============================================================
const STEP3_HTML = `
<div class="aics-step" data-step="2">
<div class="card">
<div class="card-title">&#128221; Content (ရလဒ်)</div>
${aicsResultLoadingHtml('contentLoading','AI က သင့်အကြောင်းအရာကို ရေးသားနေသည်...')}
<div id="contentResultBody">
<div id="noResultHint" class="empty-note">Result မရှိသေးပါ — "Create" အဆင့်မှာ Generate နှိပ်ပါ</div>
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
<div class="btn-row">
<button class="btn btn-purple" onclick="saveContentResult()">&#128190; ဖန်တီးမှုသိမ်းပါ</button>
</div>
</div>
</div>
<div class="error-box" id="genError2"></div>
<div class="btn-row" id="genRetryRow" style="display:none;justify-content:center;">
<button class="btn btn-secondary" onclick="csNav(1)">&#8592; ပြန်ပြင်ရန်</button>
<button class="btn btn-primary" onclick="generateContent()">&#128260; ပြန်ကြိုးစားရန်</button>
</div>
</div>
</div>
<div class="aics-step" data-step="2b">
<div class="card">
<div class="card-title">&#128172; Edit — Quick Actions</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:12px;">လိုချင်တဲ့ ပြင်ဆင်မှုကို တစ်ချက်နှိပ်ရုံဖြင့် AI က ပြင်ပေးပါမယ် — သို့မဟုတ် အောက်မှာ ကိုယ်တိုင် ညွှန်ကြားချက် ရေးနိုင်ပါတယ်။</p>
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
<div class="aics-out-title">Video ဆက်ဖန်တီးရန်</div>
<div class="aics-out-desc">Content ကို Video အဖြစ် ဆက်လက်ဖန်တီးနိုင်သည်။</div>
<button class="btn btn-primary aics-out-btn" onclick="openBranch('video')">&#127916; Video ဆက်ဖန်တီးရန်</button>
</div>
<div class="aics-out-card">
<div class="aics-out-icon">&#128266;</div>
<div class="aics-out-title">အသံ ဆက်ဖန်တီးရန်</div>
<div class="aics-out-desc">Content ကို Voice / Audio အဖြစ် ဆက်လက်ဖန်တီးနိုင်သည်။</div>
<button class="btn btn-secondary aics-out-btn" onclick="openBranch('audio')">&#128266; အသံ ဆက်ဖန်တီးရန်</button>
</div>
</div>
</div>
</div>`;

// ============================================================
// Video Branch — Step 12 (Video Input) / 14 (Result) — AI Processing Step မရှိ
// ============================================================
const STEP12_HTML = `
<div class="aics-step" data-step="12">
<div class="card">
<div class="card-title">&#127916; Video</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:12px;">သင့် Content ကို Video အစီအစဉ် (Video Plan) အဖြစ် ဖန်တီးပါမည် — အောက်မှာ လိုအပ်သလို ပြင်နိုင်ပါသည်။</p>
<div class="form-group">
<label>ဗီဒီယိုအတွက် Content (အလိုအလျောက် ယူထားပါသည်)</label>
<textarea id="videoContentText" class="auto-expand" placeholder="Content ကို အလိုအလျောက် ထည့်ပေးပါမည်..." oninput="autoGrow(this)"></textarea>
</div>
<details class="aics-advanced">
<summary>&#9881; Advanced Settings</summary>
<div style="margin-top:12px;">
<div class="adv-grid">
<div class="form-group">
<label>အမျိုးအစား (Type 1-5)</label>
<select id="videoTypeSelect">
<option value="1">Type 1 — Basic (FREE)</option>
<option value="2">Type 2 — Standard (PRO)</option>
<option value="3">Type 3 — Advanced (PRO)</option>
<option value="4">Type 4 — Premium (PRO)</option>
<option value="5">Type 5 — Ultimate (PRO)</option>
</select>
</div>
</div>
</details>
<button class="btn btn-primary" id="videoGenBtn" onclick="generateVideo()">&#9654; Video Plan ဖန်တီးမယ်</button>
<div class="loading" id="videoGenLoading"><div class="spinner"></div> ဗီဒီယိုအစီအစဉ် ရေးဆွဲနေပါသည်...</div>
<div class="error-box" id="videoError"></div>
</div>
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
<button class="btn btn-primary" onclick="generateVideo()">&#128260; ပြန်ကြိုးစားရန်</button>
</div>
<div class="btn-row">
<button class="btn btn-secondary" onclick="backToContentResult()">&#8592; Content ရလဒ်သို့ ပြန်ရန်</button>
<button class="btn btn-purple" onclick="saveContentResult()">&#128190; ဖန်တီးမှုသိမ်းပါ</button>
</div>
</div>
</div>`;

// ============================================================
// Audio Branch — Step 22 (Audio Input) / 24 (Result) — AI Processing Step မရှိ
// ============================================================
const STEP22_HTML = `
<div class="aics-step" data-step="22">
<div class="card">
<div class="card-title">&#128266; Audio</div>
<p class="voice-hint">Content Generate လုပ်ပြီးရင် အောက်က Box ထဲ အလိုအလျောက် ဖြည့်ပေးပါမည်။ Generate Voice နှိပ်ရင် အသံပြောင်းပေးပါမည်။</p>
<div class="form-group" style="margin-top:12px;">
<label>အသံပြောင်းရန် Text (Content)</label>
<textarea id="ttsText" class="auto-expand" placeholder="Voice ပြောင်းလိုသော Text ကို အလိုအလျောက် ထည့်ပေးပါမည်..." oninput="autoGrow(this)"></textarea>
</div>
<div class="form-group">
<label>အသံရွေးချယ်ရန် (Voice — ၃၀ မျိုး)</label>
<select id="voiceNameSelect">
<option value="Zephyr">Zephyr — တောက်ပ (Bright)</option>
<option value="Puck">Puck — တက်ကြွ (Upbeat)</option>
<option value="Charon">Charon — ရှင်းလင်းတိကျ (Informative)</option>
<option value="Kore" selected>Kore — ခိုင်မာတည်ငြိမ် (Firm)</option>
<option value="Fenrir">Fenrir — စိတ်လှုပ်ရှားလွယ် (Excitable)</option>
<option value="Leda">Leda — လူငယ်ဆန် (Youthful)</option>
<option value="Orus">Orus — ခိုင်မာ (Firm)</option>
<option value="Aoede">Aoede — ပေါ့ပါးလန်းဆန်း (Breezy)</option>
<option value="Callirrhoe">Callirrhoe — အေးဆေး (Easy-going)</option>
<option value="Autonoe">Autonoe — တောက်ပ (Bright)</option>
<option value="Enceladus">Enceladus — အသက်ရှူသံပါ (Breathy)</option>
<option value="Iapetus">Iapetus — ရှင်းလင်း (Clear)</option>
<option value="Umbriel">Umbriel — အေးဆေး (Easy-going)</option>
<option value="Algieba">Algieba — ချောမွေ့ (Smooth)</option>
<option value="Despina">Despina — ချောမွေ့ (Smooth)</option>
<option value="Erinome">Erinome — ရှင်းလင်း (Clear)</option>
<option value="Algenib">Algenib — ရိုင်းရင့် (Gravelly)</option>
<option value="Rasalgethi">Rasalgethi — ရှင်းလင်းတိကျ (Informative)</option>
<option value="Laomedeia">Laomedeia — တက်ကြွ (Upbeat)</option>
<option value="Achernar">Achernar — နူးညံ့ (Soft)</option>
<option value="Alnilam">Alnilam — ခိုင်မာ (Firm)</option>
<option value="Schedar">Schedar — တညီတညာ (Even)</option>
<option value="Gacrux">Gacrux — ရင့်ကျက် (Mature)</option>
<option value="Pulcherrima">Pulcherrima — တိုက်ရိုက် (Forward)</option>
<option value="Achird">Achird — ဖော်ရွေ (Friendly)</option>
<option value="Zubenelgenubi">Zubenelgenubi — ပေါ့ပေါ့ပါးပါး (Casual)</option>
<option value="Vindemiatrix">Vindemiatrix — နူးညံ့သိမ်မွေ့ (Gentle)</option>
<option value="Sadachbia">Sadachbia — တက်ကြွရှင်သန် (Lively)</option>
<option value="Sadaltager">Sadaltager — ဗဟုသုတရှိ (Knowledgeable)</option>
<option value="Sulafat">Sulafat — နွေးထွေး (Warm)</option>
</select>
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
<button class="btn btn-primary" onclick="generateVoice()">&#128260; ပြန်ကြိုးစားရန်</button>
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
.aics-work .adv-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.aics-work .adv-grid .form-group{margin-bottom:0;}
/* Stepper loading — global .loading{display:none!important} နဲ့ မတိုက်အောင် cs-busy သုံး */
.aics-step-btn.cs-busy{border-color:rgba(0,229,255,.6)!important;box-shadow:0 0 18px rgba(0,229,255,.4)!important;}
.aics-step-btn.cs-busy .aics-step-label{color:#00e5ff!important;}
.aics-step-btn.cs-busy .aics-step-loading{display:flex!important;}
/* Loading checklist (Story Studio ပုံစံ) */
.aics-work .loading-card{text-align:center;padding:40px 16px;}
.aics-work .loading-card .spinner{width:38px;height:38px;border-width:4px;margin:0 auto 18px;}
.aics-work .loading-title{font-size:18px;font-weight:700;color:var(--cyan);margin-bottom:20px;}
.aics-work .status-list{max-width:440px;margin:0 auto;text-align:left;}
.aics-work .st-line{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;color:var(--text2);font-size:14px;opacity:.5;transition:all .2s;}
.aics-work .st-line .st-marker{width:22px;text-align:center;flex-shrink:0;font-weight:700;color:var(--text3);}
.aics-work .st-line.active{opacity:1;color:var(--text);background:rgba(0,229,255,.06);}
.aics-work .st-line.active .st-marker{color:var(--cyan);}
.aics-work .st-line.done{opacity:1;color:var(--text);}
.aics-work .st-line.done .st-marker{color:var(--success);}
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
.aics-work .form-row{display:flex;gap:14px;flex-wrap:wrap}
.aics-work .form-row .form-group{flex:1;min-width:200px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;min-height:44px;min-width:44px}
.btn-primary{background:linear-gradient(135deg,var(--cyan),#00b8d4);color:#080c18}
.btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-secondary{background:var(--bg-card2);color:var(--cyan);border:1px solid var(--border-strong)}
.btn-secondary:hover{background:rgba(0,229,255,.1)}
.btn-ghost{background:none;color:var(--text2);border:1px solid var(--border);padding:6px 12px;font-size:12px;min-height:32px}
.btn-ghost:hover{color:var(--cyan);border-color:var(--cyan)}
.btn-success{background:linear-gradient(135deg,#00e676,#00c853);color:#080c18}
.btn-purple{background:linear-gradient(135deg,var(--purple),#9c7cff);color:#fff}
.btn-orange{background:linear-gradient(135deg,#ff9f2b,#ff6f00);color:#080c18}
.aics-work .btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.aics-work .type-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.aics-work .type-chip{padding:10px 16px;border:1px solid var(--border);border-radius:20px;font-size:13px;cursor:pointer;color:var(--text2);transition:all .2s;user-select:none;min-height:40px;display:inline-flex;align-items:center;gap:6px}
.aics-work .type-chip:hover{border-color:var(--cyan);color:var(--cyan)}
.aics-work .aics-advanced{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:16px}
.aics-work .aics-advanced summary{cursor:pointer;color:var(--cyan);font-size:13px;font-weight:600;user-select:none;min-height:32px;display:flex;align-items:center}
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
.aics-work .character-chip{background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:10px 14px;flex:1 1 200px;min-width:180px}
.aics-work .character-name{font-weight:600;color:var(--cyan);font-size:13px;margin-bottom:4px}
.aics-work .character-desc{font-size:12px;color:var(--text2);line-height:1.5}
.aics-work .scene-item{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:14px}
.aics-work .scene-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.aics-work .scene-num{font-weight:700;color:var(--cyan);font-size:14px}
.aics-work .scene-duration{font-size:11px;color:var(--text3);background:var(--bg-input);padding:2px 8px;border-radius:10px}
.aics-work .scene-field{margin-bottom:10px}
.aics-work .scene-field-label{font-size:11px;font-weight:600;color:var(--purple);text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between;gap:8px}
.aics-work .scene-field-text{font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap;word-break:break-word}
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
/* ===== Content Studio — Output Hub ===== */
.aics-work .aics-out-hub{margin-top:4px;padding:20px;background:linear-gradient(135deg,rgba(123,92,255,.07),rgba(0,229,255,.05));border:1px solid rgba(123,92,255,.3);border-radius:14px}
.aics-work .aics-out-hub-title{font-size:16px;font-weight:700;color:var(--purple);margin-bottom:6px;letter-spacing:.3px}
.aics-work .aics-out-hub-sub{font-size:12.5px;color:var(--text2);margin-bottom:16px}
.aics-work .aics-out-cards{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.aics-work .aics-out-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:8px}
.aics-work .aics-out-icon{font-size:30px;line-height:1}
.aics-work .aics-out-title{font-size:15px;font-weight:700;color:var(--text)}
.aics-work .aics-out-desc{font-size:12.5px;color:var(--text2);line-height:1.55;flex:1}
.aics-work .aics-out-btn{margin-top:8px}
/* ===== Content Studio — Branch / Processing UI ===== */
.aics-work .aics-process-screen{text-align:center;padding:56px 20px}
.aics-work .aics-process-spinner{width:46px;height:46px;border:3px solid rgba(0,229,255,.2);border-top-color:var(--cyan);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 20px}
.aics-work .aics-process-title{font-size:17px;font-weight:700;color:var(--cyan);margin-bottom:10px}
.aics-work .aics-process-sub{font-size:13px;color:var(--text2);margin-bottom:20px}
.aics-work .aics-transfer-box{background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:14px;font-size:14px;line-height:1.7;white-space:pre-wrap;word-break:break-word;max-height:340px;overflow-y:auto;margin-bottom:14px}
.aics-act:disabled{opacity:.5;cursor:not-allowed}
@media(max-width:767px){.aics-work .form-row{flex-direction:column}.aics-work .revise-input-row{flex-direction:column;align-items:stretch}.aics-work .aics-out-cards{grid-template-columns:1fr}.aics-work .aics-out-card{padding:16px}.aics-work .aics-process-screen{padding:40px 14px}}
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
<script>
var token=localStorage.getItem('aics_token')||'';
var userEmail=localStorage.getItem('aics_email')||'';
var userPlan=localStorage.getItem('aics_plan')||'FREE';

// ===== Data Flow State (Section 14 — သီးခြား ခွဲထားသည်) =====
// contentState သည် Source of Truth — video/audio State သည် ၎င်းကို မဖျက်ပါ
var contentState = { input: {}, result: null, editedResult: null, status: 'idle' };
var videoState = { content: '', input: {}, result: null, status: 'idle' };
var audioState = { content: '', input: {}, result: null, status: 'idle' };
var lastResult = null;
var videoPlan = null;
var currentAudioBase64 = null;
var currentDirection = 'my-to-cn';
var imgCache = {};
var csBusy = false;

// ===== Branch Stepper State Machine (Content.js တွင်သာ — shared.js မပြောင်းပါ) =====
var CS_MODE = 'main'; // 'main' | 'video' | 'audio'
var csCur = 1;
var csDone = {};
var CS_STEPS = {
  main:  [
    { n: 1,  label: '01 အကြောင်းအရာ' },
    { n: 2,  label: '02 Content ရလဒ် / Output Hub', req: [1] }
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
// Main + Branch = Stepper တစ်ခုတည်း — Branch ဝင်လျှင် Main steps ကို မဖျောက်ဘဲ ဆက်ပေါင်းပြသည်
function csVisibleSteps(){
  var main=CS_STEPS.main||[];
  if(CS_MODE==='main'||!CS_STEPS[CS_MODE])return main.slice();
  return main.concat(CS_STEPS[CS_MODE]);
}
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
// Program အလိုအလျောက် သွားရန် (AI Processing / Branch) — Lock & Req ကို ကျော်သည်
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
function csRenderStepper(){
  var c=document.getElementById('aicsStepper'); if(!c)return;
  var steps=csVisibleSteps();
  var html='<div class="aics-stepper-inner">';
  for(var i=0;i<steps.length;i++){
    var s=steps[i];
    var label=((i+1<10)?'0':'')+(i+1)+' '+String(s.label).replace(/^\\d+\\s*/,'');
    html+='<button class="aics-step-btn" data-step="'+s.n+'" onclick="csNav('+s.n+')">'+
      '<span class="aics-step-txt"><span class="aics-step-label">'+label+'</span></span>'+
      '<span class="aics-step-loading"><span class="aics-step-spinner"></span>'+(s.loading||'ဖန်တီးနေသည်...')+'</span></button>';
    if(i<steps.length-1)html+='<span class="aics-step-link"></span>';
  }
  html+='</div>';
  c.innerHTML=html;
  csUpdateStepper();
}
function csSetMode(mode){ CS_MODE=mode; csRenderStepper(); }

// ===== Output Hub — Branch ဖွင့်ခြင်း (Auto-Transfer) =====
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
    var vp=document.getElementById('videoContentPreview'); if(vp)vp.textContent=content;
    csSetMode('video');
    csGoForce(12);
  }else if(kind==='audio'){
    // Content Studio ၏ ကိုယ်ပိုင် Audio Branch (Step 22→24) သို့ သွားသည် —
    // Voice Studio ကို ပြောင်းမသွားတော့ဘဲ ဤ Studio ထဲမှာပဲ ဆက်လုပ်သည်။
    // Copy/paste မလိုအပ် — နောက်ဆုံး edit လုပ်ထားသော Content ကို Auto-fill လုပ်သည်။
    audioState.content=content;
    var ap=document.getElementById('audioContentPreview'); if(ap)ap.textContent=content;
    var tt=document.getElementById('ttsText'); if(tt){tt.value=content;autoGrow(tt);}
    csSetMode('audio');
    csGoForce(22);
  }
}
function backToContentResult(){
  csSetMode('main');
  if(csDone[2]){ csGoForce(2); } else { csGoForce(1); }
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
// ===== Loading checklist animation (Story Studio ပုံစံ) =====
var statusTimers={};
function startStatusAnim(id){
  stopStatusAnim(id,false);
  var box=document.getElementById(id);if(!box)return;
  var lines=box.querySelectorAll('.st-line');
  var cur=0,started=false;
  for(var k=0;k<lines.length;k++){lines[k].className='st-line';var m=lines[k].querySelector('.st-marker');if(m)m.textContent='○';}
  statusTimers[id]=setInterval(function(){
    if(!started){lines[0].className='st-line active';var m0=lines[0].querySelector('.st-marker');if(m0)m0.textContent='●';started=true;return;}
    if(cur<lines.length){
      lines[cur].className='st-line done';
      var md=lines[cur].querySelector('.st-marker');if(md)md.textContent='✓';
      cur++;
      if(cur<lines.length){lines[cur].className='st-line active';var ma=lines[cur].querySelector('.st-marker');if(ma)ma.textContent='●';}
    }
  },1100);
}
function stopStatusAnim(id,allDone){
  if(statusTimers[id]){clearInterval(statusTimers[id]);delete statusTimers[id];}
  var box=document.getElementById(id);if(!box)return;
  var lines=box.querySelectorAll('.st-line');
  if(allDone){
    for(var k=0;k<lines.length;k++){
      lines[k].className='st-line done';
      var m=lines[k].querySelector('.st-marker');if(m)m.textContent='✓';
    }
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
function onContentEdit(){ if(!lastResult)return; lastResult.content=document.getElementById('contentOut').value; contentState.editedResult=lastResult.content; }

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

// ===== Content Generate (Main — Step 01 → 02 Result — Unified Result Loading) =====
function generateContent(){
  if(csBusy)return;
  var idea=document.getElementById('ideaInput').value.trim();
  var type=document.getElementById('typeSelect').value;
  var byok=(document.getElementById('byokInput')||{value:''}).value.trim();
  var audEl=document.getElementById('audSel');
  if(!idea){showError('genError','အကြောင်းအရာ (User Idea) ထည့်ပါ။');return;}
  if(audEl&&audEl.value)idea+='\n\nဘယ်သူအတွက်: '+audEl.value;
  window.aichAud=audEl?audEl.value:'လူတိုင်း';
  hideError('genError'); hideError('genError2');
  document.getElementById('genRetryRow').style.display='none';
  contentState.input={idea:idea,type:type};
  contentState.status='processing';
  csBusy=true;
  setGenButtonsDisabled(true);
  csMarkDone(1);
  // Unified: Result section အတွင်း loading ပြသည် (processing step မရှိ)
  if(window.aicsResultLoading)window.aicsResultLoading.show('contentLoading','AI က သင့်အကြောင်းအရာကို ရေးသားနေသည်...',idea);
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
      renderContentResult();
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
      showError('genError2','Content ဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။ ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။');
      document.getElementById('genRetryRow').style.display='flex';
      // Error → Result section အတွင်းတွင် error + retry ပြသည် (existing error UI ကို ထိန်းထားသည်)
      csUnmarkDone(2);
      showToastMsg('⚠️ Content ဖန်တီး၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ');
    })
    .finally(function(){setLoading('genLoading',false);setGenButtonsDisabled(false);csBusy=false;});
}

function renderContentResult(){
  if(!lastResult){
    if(document.getElementById('resultGrid'))document.getElementById('resultGrid').style.display='none';
    if(document.getElementById('noResultHint'))document.getElementById('noResultHint').style.display='block';
    return;
  }
  var ta=document.getElementById('contentOut');
  if(ta)ta.value=lastResult.content||'(empty)';
  if(document.getElementById('speakingOut'))document.getElementById('speakingOut').textContent=lastResult.speakingStyle||'(empty)';
  if(document.getElementById('voiceOut'))document.getElementById('voiceOut').textContent=lastResult.voiceStyle||'(empty)';
  if(document.getElementById('resultGrid'))document.getElementById('resultGrid').style.display='block';
  if(document.getElementById('noResultHint'))document.getElementById('noResultHint').style.display='none';
  if(ta)autoGrow(ta);
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
      renderContentResult();
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
  videoState.input={type:type};
  videoState.status='processing';
  csBusy=true;
  setGenButtonsDisabled(true);
  csMarkDone(12);
  // Unified: Video Result section အတွင်း loading ပြသည်
  if(window.aicsResultLoading)window.aicsResultLoading.show('videoLoading','AI က သင့်အတွက် Video ကို ပြင်ဆင်နေသည်...',content);
  var vrc=document.getElementById('videoResult');if(vrc)vrc.style.display='none';
  csGoForce(14);
  setLoading('videoGenLoading',true);
  var body={idea:content,type:type};
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
      showError('videoError2','Video ဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။ ပြန်ကြိုးစားပါ။');
      document.getElementById('videoRetryRow').style.display='flex';
      // Error → Result section အတွင်းတွင် error + retry ပြသည် (existing error UI ကို ထိန်းထားသည်)
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

// ===== Audio Branch — Generate Voice (Step 22 → 24 Result — Unified Result Loading) =====
function generateVoice(){
  if(csBusy)return;
  var text=(document.getElementById('ttsText').value||'').trim();
  if(!text){showError('voiceError','Text ထည့်ပါ (သို့မဟုတ် Content ကို အရင်ဖန်တီးပါ)။');return;}
  var voiceName=document.getElementById('voiceNameSelect').value;
  var byok=(document.getElementById('byokInput')||{value:''}).value.trim();
  hideError('voiceError'); hideError('voiceError2');
  document.getElementById('voiceRetryRow').style.display='none';
  audioState.content=text;
  audioState.input={voiceName:voiceName};
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
      showError('voiceError2','အသံဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။ ပြန်ကြိုးစားပါ။');
      document.getElementById('voiceRetryRow').style.display='flex';
      // Error → Result section အတွင်းတွင် error + retry ပြသည် (existing error UI ကို ထိန်းထားသည်)
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
// Stepper = လက်ရှိ သွားနေသော လမ်းကြောင်း (Branch) သာလျှင် — MAP (System တစ်ခုလုံး) ကို UI တွင် မပြပါ
function studioOnStep(n){
  var backHub={label:'&#8592; Content ရလဒ်သို့ ပြန်ရန်',cls:'ghost',fn:backToContentResult};
  if(n===1){
    var acts=[{label:'Reset',cls:'ghost',fn:studioReset}];
    if(lastResult)acts.push({label:'Next &#8594;',cls:'secondary',fn:function(){csNav(2);}});
    acts.push({label:'Generate Content &#10024;',cls:'primary',fn:generateContent});
    studioSetActions(acts);
  }else if(n===2){
    studioSetActions([{label:'Reset',cls:'ghost',fn:studioReset},{label:'&#128190; ဖန်တီးမှုသိမ်းပါ',cls:'purple',fn:saveContentResult}]);
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
  return {
    mode:CS_MODE,
    csCur:csCur,
    idea:(document.getElementById('ideaInput')?document.getElementById('ideaInput').value:''),
    type:(document.getElementById('typeSelect')?document.getElementById('typeSelect').value:'1'),
    aud:(document.getElementById('audSel')?document.getElementById('audSel').value:''),
    byok:(document.getElementById('byokInput')?document.getElementById('byokInput').value:''),
    videoContent:(document.getElementById('videoContentText')?document.getElementById('videoContentText').value:''),
    videoType:(document.getElementById('videoTypeSelect')?document.getElementById('videoTypeSelect').value:'1'),
    videoByok:(document.getElementById('videoByokInput')?document.getElementById('videoByokInput').value:''),
    ttsText:(document.getElementById('ttsText')?document.getElementById('ttsText').value:''),
    voiceName:(document.getElementById('voiceNameSelect')?document.getElementById('voiceNameSelect').value:'Kore'),
    srt:(document.getElementById('resultSrt')?document.getElementById('resultSrt').value:''),
    srtTranslated:(document.getElementById('resultSrtTranslated')?document.getElementById('resultSrtTranslated').value:''),
    direction:currentDirection,
    lastResult:lastResult,
    videoPlan:videoPlan,
    audio:currentAudioBase64
  };
}
window.studioCollectDraft=studioCollectDraft;

function studioRestoreDraft(d){
  if(!d)return;
  if(d.idea)document.getElementById('ideaInput').value=d.idea;
  if(d.type)document.getElementById('typeSelect').value=d.type;
  var audEl=document.getElementById('audSel');if(audEl&&d.aud)audEl.value=d.aud;if(audEl)window.aichAud=audEl.value;
  if(d.byok&&document.getElementById('byokInput'))document.getElementById('byokInput').value=d.byok;
  if(d.videoContent)document.getElementById('videoContentText').value=d.videoContent;
  if(d.videoType)document.getElementById('videoTypeSelect').value=d.videoType;
  if(d.videoByok&&document.getElementById('videoByokInput'))document.getElementById('videoByokInput').value=d.videoByok;
  if(d.ttsText)document.getElementById('ttsText').value=d.ttsText;
  if(d.voiceName)document.getElementById('voiceNameSelect').value=d.voiceName;
  if(d.srt)document.getElementById('resultSrt').value=d.srt;
  if(d.srtTranslated)document.getElementById('resultSrtTranslated').value=d.srtTranslated;
  if(d.direction)currentDirection=d.direction;
  lastResult=d.lastResult||null;
  videoPlan=d.videoPlan||null;
  currentAudioBase64=d.audio||null;
  contentState.result=lastResult;
  if(lastResult){
    renderContentResult();
    csMarkDone(1);
    csMarkDone(2);
  }
  if(videoPlan){
    renderVideoPlan(videoPlan);
    document.getElementById('videoResult').style.display='block';
    csMarkDone(12);
    csMarkDone(14);
    var vp=document.getElementById('videoContentPreview');
    if(vp)vp.textContent=videoState.content||(lastResult?lastResult.content:'')||'';
  }
  if(currentAudioBase64){
    var audioUrl='data:audio/wav;base64,'+currentAudioBase64;
    document.getElementById('audioContainer').innerHTML='<audio controls src="'+audioUrl+'"></audio><div class="btn-row"><button class="btn-ghost" onclick="downloadAudio()">&#128190; Save Audio</button></div>';
    csMarkDone(22);
    csMarkDone(24);
    var ap=document.getElementById('audioContentPreview');
    if(ap)ap.textContent=audioState.content||(lastResult?lastResult.content:'')||'';
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

// ===== Boot (Shell ပြီးမှ Stepper ကို ကိုယ်ပိုင် Branch Stepper ဖြင့် ပြန်ဆောက်သည်) =====
function csBoot(){
  csRenderStepper();
  csShow(csCur);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',csBoot);
else csBoot();
</script>
</body>
</html>`;
