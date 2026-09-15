// AI Creative Studio — Story Studio Frontend (Main Stepper + Video Branch Stepper)
// Master Instruction refactor:
//   Main: 01 ဇာတ်လမ်းအချက်အလက် → 02 ဇာတ်လမ်းရလဒ်
//   Video Branch (Step 02 မှ): 01 Video ပြင်ဆင်ရန် → 02 နောက်ဆုံးရလဒ်
// Main Stepper ကို မဖျောက်ပါ — Branch ဝင်လျှင် Main Steps ကို ဆက်မြင်ရသည် (Main + Branch Stepper)
// AI loading/processing ကို Stepper ထဲတွင် မထည့်ပါ — Result section အတွင်း၌သာ ပြသည်
// Studio Isolation: ဤ File သည် Story Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Shared: renderSidebar / sidebarScript / renderStudioShell (frontend/shared.js)
// ⚠️ API Contract ကို မပျက်စီးစေရ — /api/studio/story/generate, /revise, /video, /video-image ကို ဆက်ထိန်းထားသည်။

import { renderSidebar, sidebarScript, renderStudioShell, aicsResultLoadingHtml } from './shared.js';

// Main Stepper (၂ ဆင့် — AI Processing Step မရှိ) — Video Branch သည် အောက်က state machine တွင် သီးခြားစီ
const STEPS = [
  { label: '01 ဇာတ်လမ်းအချက်အလက်' },
  { label: '02 ဇာတ်လမ်းရလဒ်', req: [1] },
];

// ============================================================
// Step 01 — ဇာတ်လမ်းအချက်အလက် (Essential Settings + Advanced Settings Accordion)
// ============================================================
const STEP1_HTML = `
<div class="aics-step" data-step="1">
<div class="card">
<div class="card-title">&#128221; ဇာတ်လမ်းရေးရန် <span class="card-title-sub">(Story Creator)</span></div>
<p class="story-intro">ဇာတ်လမ်းအကြောင်းအရာ ဖြည့်ပြီး အောက်က <b>「ဇာတ်လမ်းရေးသားရန်」</b> ခလုတ်ကို နှိပ်လိုက်ရင် AI က သင့်အတွက် ဇာတ်လမ်းတစ်ပုဒ် အပြည့်အစုံ ရေးပေးပါမယ်။</p>

<div class="aics-section-label"><span class="aics-section-title">အခြေခံ သတ်မှတ်ချက်များ</span><span class="aics-section-sub">Essential Settings</span></div>
<div class="studio-form-grid">
<div class="form-group">
<label for="storyTypeSel">ဇာတ်လမ်းအမျိုးအစား (Story Type)</label>
<select id="storyTypeSel" onchange="selectedStoryType=this.value;">
<option value="1" selected>ဇာတ်လမ်း (Free)</option>
<option value="2">ရုပ်ရှင် (Pro)</option>
<option value="3">ဇာတ်လမ်းတွဲ (Pro)</option>
<option value="4">ဇာတ်လမ်းတို (Pro)</option>
<option value="5">ဟာသဇာတ်လမ်း (Pro)</option>
</select>
</div>
<div class="form-group">
<label for="audSel">ပရိသတ် (Audience)</label>
<select id="audSel" onchange="window.aichAud=this.value;"><option>လူတိုင်း</option><option>လူငယ်</option><option>လူကြီး</option><option>ကလေး</option></select>
</div>
<div class="form-group">
<label for="toneSel">ရေးသားပုံစံ (Tone)</label>
<select id="toneSel"><option>Emotional (စိတ်ခံစားမှု)</option><option>Dark (မှောင်မိုက်)</option><option>Light (ပေါ့ပါး)</option><option>Funny (ရယ်စရာ)</option><option>Epic (ခမ်းနား)</option><option>Mysterious (လျှို့ဝှက်ဆန်းကြယ်)</option></select>
</div>
<div class="form-group">
<label for="langSel">ဘာသာစကား (Language)</label>
<select id="langSel"><option>မြန်မာ (ဘာသာ)</option><option>English</option><option>မြန်မာ + English</option></select>
</div>
</div>

<div class="form-group story-content-group">
<label for="field_0">ဇာတ်လမ်းအကြောင်းအရာ (Story Content) <span class="req-star" aria-hidden="true">*</span></label>
<textarea id="field_0" class="story-content-input" aria-required="true" placeholder="ဥပမာ — ရန်ကုန်မှာ အောင်မြင်မှုရဖို့ ကြိုးစားနေတဲ့ လူငယ်တစ်ယောက်ရဲ့ ခရီး..." oninput="onStoryContentInput()"></textarea>
<div class="form-error" id="field0Error">ဇာတ်လမ်းအကြောင်းအရာကို အနည်းဆုံး ဖြည့်ရေးပါ</div>
</div>

<button type="button" class="aics-advanced-toggle" id="advToggle" onclick="studioToggleAdvanced('advToggle','ideaFields')" aria-expanded="false"><span>&#8964; အပိုဆောင်းသတ်မှတ်ချက် (Advanced Settings)</span><span class="aics-adv-arrow">&#9660;</span></button>
<div id="ideaFields" class="adv-grid aics-adv-panel" style="margin-top:2px;"></div>

<div class="error-box" id="genError"></div>
<button type="button" class="btn btn-primary story-generate-btn" id="genStoryBtn" onclick="generateStory()" disabled>&#10024; ဇာတ်လမ်းရေးသားရန်</button>
</div>
</div>`;

// ============================================================
// Step 02 — ဇာတ်လမ်းရလဒ် (Result — loading ကို ဤနေရာတွင်သာ ပြသည်)
// ============================================================
const STEP3_HTML = `
<div class="aics-step" data-step="2">
<div class="card">
<div class="card-title">&#128214; ဇာတ်လမ်းရလဒ် <span class="card-title-sub">(Story Result)</span></div>
${aicsResultLoadingHtml('storyLoading','AI ရေးသားနေသည်...')}
<div id="storyResultBody">
<div class="result-label">ဇာတ်လမ်း (Story)</div>
<textarea class="result-textarea" id="storyResult" placeholder="ဇာတ်လမ်း ဒီနေရာမှာ ပေါ်လာပါမယ်..." oninput="onStoryEdit()"></textarea>
<p class="result-hint">&#9997; ဒီနေရာမှာ တိုက်ရိုက် နှိပ်ပြီး ကိုယ်တိုင် ပြင်ဆင်နိုင်ပါတယ် — ပြင်ထားတဲ့ ဇာတ်လမ်းကို Video အဆင့်ကို အလိုအလျောက် ပို့ပေးပါမယ်</p>

<div class="story-actions-primary">
<button class="btn btn-primary story-action-primary" onclick="goToVideoForm()">&#127916; Video ဆက်ဖန်တီးရန်</button>
</div>
<div class="story-actions-secondary">
<button class="btn btn-secondary" onclick="focusRevise()">&#9999;&#65039; ပြန်ပြင်ရန်</button>
<button class="btn btn-secondary" onclick="copyStory()">&#128203; Copy</button>
<button class="btn btn-secondary" onclick="saveStory()">&#128190; သိမ်းရန်</button>
</div>
</div>
<div class="error-box" id="genError2"></div>
<div class="retry-row" id="genRetry2">
<button class="btn btn-primary" onclick="generateStory()">&#128260; ပြန်ကြိုးစားရန်</button>
<button class="btn btn-secondary" onclick="stGoForce(1)">&#8592; ပြန်ပြင်ရန်</button>
</div>
</div>
<div class="card revise-section" id="revise-section">
<button type="button" class="aics-advanced-toggle" id="reviseToggle" onclick="studioToggleAdvanced('reviseToggle','revisePanel')" aria-expanded="false"><span>&#8964; AI ကို ဆက်ညွှန်ကြားရန် (Revise with AI)</span><span class="aics-adv-arrow">&#9660;</span></button>
<div id="revisePanel" class="aics-adv-panel revise-panel">
<p class="form-help" style="margin-bottom:10px;">ဥပမာ — 「နိဂုံးကို ပိုစိတ်လှုပ်ရှားစရာဖြစ်အောင် ပြင်ပါ」 ဆိုပြီး ရေးပြီး ပြင်ပါ ကို နှိပ်ပါ။</p>
<div class="revise-history" id="reviseHistory"></div>
<div class="revise-input-row">
<input type="text" id="feedbackInput" placeholder="ဥပမာ — နိဂုံးကို ပိုစိတ်ခံစားရအောင်ပြင်ပေးပါ" style="flex:1;" onkeypress="if(event.key==='Enter'){reviseStory();}">
<button class="btn btn-secondary" id="reviseBtn" onclick="reviseStory()">&#128260; ပြင်ပါ</button>
</div>
<div class="loading" id="revLoading"><div class="spinner"></div> ပြင်ဆင်နေပါသည်...</div>
<div class="error-box" id="revError"></div>
</div>
</div>
</div>`;

// ============================================================
// Step 03 — Video Branch: Video Setup Form
// (Story Result ကို အလိုအလျောက် ထည့်ပေးထားသည် — Essential + Advanced accordion)
// ============================================================
const STEP4_HTML = `
<div class="aics-step" data-step="3">
<div class="card">
<div class="card-title">&#127916; Video ဇာတ်လမ်းဖန်တီးရန် <span class="card-title-sub">(Video Creation)</span></div>
<div class="story-auto-status">&#10004; Story Result ကို အလိုအလျောက် ထည့်ထားသည်</div>
<p class="story-intro">Step 02 မှ ဇာတ်လမ်းကို အောက်မှာ Preview ကြည့်နိုင်ပါသည်။ Video အတွက် ဆက်တင်များ ရွေးပြီး ဖန်တီးပါ။</p>
<div class="form-group">
<label for="videoStoryInput">အသုံးပြုမည့် ဇာတ်လမ်း (Story to Use)</label>
<textarea id="videoStoryInput" class="video-story-input" oninput="autoExpand(this)"></textarea>
</div>

<div class="aics-section-label"><span class="aics-section-title">ဗီဒီယို သတ်မှတ်ချက်များ</span><span class="aics-section-sub">Video Settings</span></div>
<div class="vf-grid">
<div class="form-group"><label for="vidTypeSel">Video အမျိုးအစား (Video Type)</label><select id="vidTypeSel"></select></div>
<div class="form-group"><label for="vidDurationSel">Video ကြာချိန် (Video Duration)</label><select id="vidDurationSel"></select></div>
<div class="form-group"><label for="vidSceneSel">Scene ကြာချိန် (Scene Duration)</label><select id="vidSceneSel"></select></div>
<div class="form-group"><label for="vidRatioSel">ပုံရိပ်အချိုး (Aspect Ratio)</label><select id="vidRatioSel"></select></div>
<div class="form-group"><label for="vidStyleSel">ရုပ်ပုံစတိုင် (Visual Style)</label><select id="vidStyleSel"></select></div>
<div class="form-group"><label for="vidCamSel">ကင်မရာစတိုင် (Camera Style)</label><select id="vidCamSel"></select></div>
<div class="form-group"><label for="vidLangSel">ဘာသာစကား (Language)</label><select id="vidLangSel"></select></div>
</div>

<button type="button" class="aics-advanced-toggle" id="vidAdvToggle" onclick="studioToggleAdvanced('vidAdvToggle','vidAdvFields')" aria-expanded="false"><span>&#8964; အပိုဆောင်း Video Settings (Advanced Video Settings)</span><span class="aics-adv-arrow">&#9660;</span></button>
<div id="vidAdvFields" class="adv-grid aics-adv-panel" style="margin-top:2px;">
<div class="form-group adv-check">
<span class="group-label">ဇာတ်ကောင် ဆက်လက်ထားရှိမှု (Character Continuity)</span>
<label class="aics-check-row" for="vidContinuity"><input type="checkbox" id="vidContinuity" checked> Scene တိုင်းတွင် ဇာတ်ကောင် ID တူညီစွာ ထားပါ</label>
</div>
<div class="form-group adv-check">
<span class="group-label">ဇာတ်ကောင် ပုံစံတူညီမှု (Character Consistency)</span>
<label class="aics-check-row" for="vidConsistency"><input type="checkbox" id="vidConsistency" checked> ဇာတ်ကောင်အသွင်အပြင်ကို Scene တိုင်း တစ်သမတ်တည်း ဖော်ပြပါ</label>
</div>
<div class="form-group">
<label for="vidEnvSel">ပတ်ဝန်းကျင်စတိုင် (Environment Style)</label>
<select id="vidEnvSel"></select>
</div>
<div class="form-group">
<label for="vidRefImgInput">ရည်ညွှန်းရုပ်ပုံ (Reference Image)</label>
<input type="file" id="vidRefImgInput" accept="image/*" onchange="onRefImageSelect(this)">
<div class="ref-img-preview" id="vidRefImgPreview"></div>
<p class="form-help">Character / Style အတွက် ရည်ညွှန်းရုပ်ပုံ ထည့်နိုင်သည် (PNG / JPG, max 4MB)</p>
</div>
<div class="form-group adv-full">
<label for="vidExtra">အပိုဆောင်း ညွှန်ကြားချက် (Additional Instructions)</label>
<textarea id="vidExtra" placeholder="ဥပမာ — နောက်ဆုံး Scene မှာ မိုးရွာပြီး စိတ်ခံစားချက်ကို ပိုဖော်ပြပါ..." style="min-height:70px;"></textarea>
</div>
</div>

<div class="error-box" id="planError"></div>
<button type="button" class="btn btn-primary video-generate-btn" id="videoPlanBtn" onclick="generateVideoPlan()">&#127916; Video ဇာတ်လမ်း ဖန်တီးရန်</button>
</div>
</div>`;

// ============================================================
// Step 04 — Video Branch Result (loading ကို ဤနေရာတွင်သာ ပြသည်)
// ============================================================
const STEP6_HTML = `
<div class="aics-step" data-step="4">
${aicsResultLoadingHtml('planLoading','AI ပြင်ဆင်နေသည်...')}
<div id="finalResult"></div>
<div class="error-box" id="planError5"></div>
<div class="retry-row" id="planRetry5">
<button class="btn btn-primary" onclick="generateVideoPlan()">&#128260; ပြန်ကြိုးစားရန်</button>
<button class="btn btn-secondary" onclick="stGoForce(3)">&#8592; ပြန်ပြင်ရန်</button>
</div>
</div>`;

const CONTENT_HTML = STEP1_HTML + STEP3_HTML + STEP4_HTML + STEP6_HTML;

export const STORY_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Story Studio — AI Creative Studio</title>
<style>
:root{--bg:#080c18;--bg-card:#0d1424;--bg-card2:#111a2e;--bg-input:#0a1020;--border:rgba(0,229,255,0.15);--border-strong:rgba(0,229,255,0.35);--cyan:#00e5ff;--purple:#7b5cff;--text:#e8ecf4;--text2:#8b95a8;--text3:#5a6478;--success:#00e676;--error:#ff5252;--warn:#ffc107}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans Myanmar','Roboto','Segoe UI',Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:14px;line-height:1.6}
a{color:var(--cyan);text-decoration:none}

/* ===== Card / Section Label ===== */
.aics-work .card{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:16px}
.aics-work .card-title{font-size:15.5px;font-weight:700;color:var(--cyan);margin-bottom:14px;display:flex;align-items:center;gap:8px;line-height:1.4}
.aics-work .card-title-sub{font-size:11.5px;font-weight:600;color:var(--text3);letter-spacing:.3px}
.aics-work .story-intro{color:var(--text2);font-size:13px;margin-bottom:16px;line-height:1.7}
.aics-section-label{display:flex;align-items:baseline;gap:8px;margin:4px 0 12px;padding-left:10px;border-left:3px solid var(--cyan);}
.aics-section-title{font-size:13.5px;font-weight:700;color:var(--text);letter-spacing:.2px}
.aics-section-sub{font-size:11px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.6px}

/* ===== Unified Form Controls (Input / Select / Textarea — same height, radius, padding) ===== */
.aics-work label{display:block;font-size:12.5px;color:var(--text2);margin-bottom:7px;font-weight:600;line-height:1.4}
.aics-work .group-label{display:block;font-size:12.5px;color:var(--text2);margin-bottom:7px;font-weight:600;line-height:1.4}
.aics-work input:not([type=checkbox]):not([type=radio]),.aics-work textarea,.aics-work select{width:100%;min-height:46px;background:var(--bg-input);border:1px solid rgba(148,163,184,.20);border-radius:12px;padding:11px 13px;color:var(--text);font-size:14px;line-height:1.5;font-family:inherit;transition:border-color .18s,box-shadow .18s,background .18s;box-sizing:border-box}
.aics-work textarea{min-height:108px;resize:vertical;line-height:1.7}
.aics-work input:not([type=checkbox]):not([type=radio]):hover,.aics-work textarea:hover,.aics-work select:hover{border-color:rgba(0,229,255,.35);background:rgba(8,16,32,.92)}
.aics-work input:not([type=checkbox]):not([type=radio]):focus,.aics-work textarea:focus,.aics-work select:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,229,255,.12);background:#0a1020}
.aics-work select{cursor:pointer}
.aics-work select option{background:var(--bg-card);color:var(--text)}
.aics-work input:disabled,.aics-work textarea:disabled,.aics-work select:disabled,.aics-work button:disabled{opacity:.5;cursor:not-allowed}
.aics-work .form-group{margin-bottom:16px}
.aics-work .form-group.has-error input,.aics-work .form-group.has-error textarea,.aics-work .form-group.has-error select{border-color:rgba(255,82,82,.7);box-shadow:0 0 0 2px rgba(255,82,82,.14)}
.aics-work .form-error{display:none;color:#ff8a8a;font-size:12px;margin-top:6px;line-height:1.5}
.aics-work .form-group.has-error .form-error{display:block}
.aics-work .form-help{font-size:11.5px;color:var(--text3);margin-top:6px;line-height:1.55}
.aics-work .req-star{color:var(--error)}

/* ===== Story Content Primary Textarea ===== */
.aics-work .story-content-group{margin-top:2px}
.aics-work .story-content-input{min-height:150px;font-size:15px;background:linear-gradient(180deg,rgba(6,12,25,.9),rgba(10,16,32,.9));border-color:rgba(0,229,255,.28)}
.aics-work .story-content-input:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,229,255,.16)}
.aics-work .story-content-input:disabled{background:rgba(6,12,25,.5)}

/* ===== Checkbox Rows (Video Advanced) ===== */
.aics-work .adv-check .aics-check-row{display:flex;align-items:center;gap:9px;min-height:44px;padding:9px 12px;background:rgba(8,14,28,.55);border:1px solid rgba(148,163,184,.14);border-radius:10px;cursor:pointer;color:var(--text2);font-size:12.5px;line-height:1.5;transition:border-color .2s,background .2s}
.aics-work .adv-check .aics-check-row:hover{border-color:rgba(0,229,255,.4)}
.aics-work .adv-check .aics-check-row input{width:18px;height:18px;min-height:0;flex-shrink:0;accent-color:var(--cyan);cursor:pointer}
.aics-work .adv-check{min-width:0}

/* ===== Reference Image ===== */
.aics-work .ref-img-preview{margin-top:8px;text-align:center}
.aics-work .ref-img-preview img{max-width:100%;max-height:180px;border-radius:10px;border:1px solid var(--border);display:block;margin:0 auto 6px}
.aics-work .ref-img-preview .btn-ghost{display:inline-flex}
.aics-work input[type=file]{padding:10px;cursor:pointer}

/* ===== Accordion (Advanced Settings) ===== */
.aics-work .aics-advanced-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 16px;border-radius:12px;background:rgba(123,92,255,.07);border:1px solid rgba(123,92,255,.28);color:#c7bbff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;min-height:46px;margin:2px 0 12px;text-align:left;transition:background .2s,border-color .2s;box-sizing:border-box}
.aics-work .aics-advanced-toggle:hover{background:rgba(123,92,255,.13);border-color:rgba(123,92,255,.52)}
.aics-work .aics-advanced-toggle:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 2px rgba(0,229,255,.18)}
.aics-work .aics-advanced-toggle .aics-adv-arrow{display:inline-block;font-size:11px;flex-shrink:0;transition:transform .2s;color:var(--cyan)}
.aics-work .aics-advanced-toggle.open .aics-adv-arrow{transform:rotate(180deg)}
.aics-work .aics-adv-panel{padding:14px;background:rgba(8,14,28,.52);border:1px solid rgba(148,163,184,.12);border-radius:14px;margin-bottom:16px}

/* ===== Grids — 2-column on Desktop / iPad / Mobile (Story-specific) ===== */
.aics-work .studio-form-grid,.aics-work .adv-grid,.aics-work .vf-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 16px}
.aics-work .studio-form-grid .form-group,.aics-work .adv-grid .form-group,.aics-work .vf-grid .form-group{margin-bottom:0;min-width:0}
/* Accordion hide/show — grid display rules ပြီးမှ ထားရမည် (cascade) */
.aics-work .aics-adv-panel{display:none}
.aics-work .aics-adv-panel.open{display:grid}
.aics-work .adv-full{grid-column:1 / -1}
.aics-work .story-content-group{grid-column:1 / -1}

/* ===== Buttons ===== */
.aics-work .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 22px;border-radius:11px;border:none;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;min-height:46px;line-height:1.4}
.aics-work .btn-primary{background:linear-gradient(135deg,var(--cyan),#00b8d4);color:#080c18;box-shadow:0 2px 14px rgba(0,229,255,.25)}
.aics-work .btn-primary:hover{opacity:.92;transform:translateY(-1px);box-shadow:0 4px 18px rgba(0,229,255,.35)}
.aics-work .btn-primary:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
.aics-work .btn-secondary{background:var(--bg-card2);color:var(--cyan);border:1px solid var(--border-strong)}
.aics-work .btn-secondary:hover{background:rgba(0,229,255,.1)}
.aics-work .btn-ghost{background:none;color:var(--text2);border:1px solid var(--border);padding:8px 14px;font-size:12.5px;min-height:40px;border-radius:10px}
.aics-work .btn-ghost:hover{color:var(--cyan);border-color:var(--cyan)}
.aics-work .btn-success{background:linear-gradient(135deg,#00e676,#00c853);color:#080c18}
.aics-work .btn-purple{background:linear-gradient(135deg,var(--purple),#9c7cff);color:#fff}
.aics-work .btn-orange{background:linear-gradient(135deg,#ff9f2b,#ff6f00);color:#080c18}
.aics-work .btn:focus-visible,.aics-advanced-toggle:focus-visible,.aics-step-btn:focus-visible{outline:2px solid rgba(0,229,255,.8);outline-offset:2px}

/* ===== Story Generate / Video Generate (Primary actions in forms) ===== */
.aics-work .story-generate-btn,.aics-work .video-generate-btn{width:100%;min-height:52px;font-size:15px;margin-top:4px}
.aics-work .story-generate-btn:disabled{opacity:.45;cursor:not-allowed}

/* ===== Story Result Actions (Primary + Secondary hierarchy) ===== */
.aics-work .story-actions-primary{margin:14px 0 10px}
.aics-work .story-action-primary{width:100%;min-height:52px;font-size:15px}
.aics-work .story-actions-secondary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.aics-work .story-actions-secondary .btn{width:100%}

/* ===== Result Textarea ===== */
.aics-work .result-label{font-size:12.5px;color:var(--text2);font-weight:600;margin-bottom:7px}
.aics-work .result-textarea{width:100%;min-height:240px;background:var(--bg-input);border:1px solid var(--border-strong);border-radius:14px;padding:16px;color:var(--text);font-size:15px;line-height:1.8;font-family:inherit;resize:vertical;box-sizing:border-box;overflow:hidden}
.aics-work .result-textarea:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,229,255,.12)}
.aics-work .result-hint{color:var(--text3);font-size:12px;margin-top:8px;font-style:italic;line-height:1.6}

/* ===== Video Auto-Transfer Status ===== */
.aics-work .story-auto-status{display:flex;align-items:center;gap:8px;background:rgba(0,230,118,.08);border:1px solid rgba(0,230,118,.35);color:var(--success);font-size:12.5px;font-weight:600;padding:10px 14px;border-radius:10px;margin-bottom:14px;line-height:1.5}
.aics-work .video-story-input{min-height:150px;font-size:14px}

/* ===== Loading (Result area only) ===== */
.aics-work .loading{display:none !important;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);align-items:center;gap:12px;color:#00e5ff;font-size:15px;font-weight:600;padding:16px 28px;border-radius:16px;background:rgba(8,12,24,.95);border:1px solid rgba(0,229,255,.4);box-shadow:0 8px 40px rgba(0,229,255,.3);z-index:99999;backdrop-filter:blur(12px);white-space:nowrap}
.aics-work .loading.show{display:flex}
.aics-work .spinner{width:20px;height:20px;border:3px solid rgba(0,229,255,.2);border-top-color:#00e5ff;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* ===== Error / Retry ===== */
.aics-work .error-box{display:none;background:rgba(255,82,82,.1);border:1px solid rgba(255,82,82,.3);color:var(--error);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px;line-height:1.7;white-space:pre-line}
.aics-work .error-box.show{display:block}
.aics-work .retry-row{display:none;justify-content:center;margin-top:16px;gap:10px;flex-wrap:wrap}
.aics-work .retry-row.show{display:flex}

/* ===== Revise Section ===== */
.aics-work .revise-section{margin-top:20px}
.aics-work .revise-panel{margin-top:-4px}
.aics-work .revise-history{margin-bottom:14px;max-height:280px;overflow-y:auto}
.aics-work .revise-msg{background:var(--bg-input);border-radius:8px;padding:10px 14px;margin-bottom:8px;font-size:13px}
.aics-work .revise-msg.user{border-left:3px solid var(--purple)}
.aics-work .revise-msg .role{font-size:11px;color:var(--text3);margin-bottom:4px}
.aics-work .revise-input-row{display:flex;gap:10px;align-items:flex-end}
.aics-work .revise-input-row input{flex:1}
.aics-work .revise-input-row .btn{flex-shrink:0}

/* ===== Characters (Video Result) ===== */
.aics-work .final-char-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px}
.aics-work .final-char-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;flex-wrap:wrap}
.aics-work .final-char-name{font-weight:700;color:var(--cyan);font-size:15px}
.aics-work .final-char-id{font-size:11px;color:var(--purple);background:rgba(123,92,255,.12);border:1px solid rgba(123,92,255,.3);padding:2px 10px;border-radius:20px}
.aics-work .final-char-meta{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12.5px;color:var(--text2);margin-bottom:10px}
.aics-work .final-char-img{background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;padding:10px;margin-bottom:10px;text-align:center}
.aics-work .final-char-img img{max-width:100%;max-height:340px;border-radius:8px}
.aics-work .final-char-ref{background:var(--bg-input);border:1px dashed rgba(123,92,255,.4);border-radius:10px;padding:12px 14px;margin-bottom:10px}
.aics-work .final-prompt-label{font-size:11.5px;color:var(--text3);font-weight:700;letter-spacing:.4px;margin:8px 0 6px;text-transform:uppercase}
.aics-work .final-prompt-text{font-size:13px;color:var(--text);line-height:1.7;white-space:pre-wrap;word-break:break-word;background:var(--bg-input);padding:12px 14px;border-radius:10px;min-height:20px}

/* ===== Story Map (Scenes) ===== */
.aics-work .storymap-card .card-title{font-size:16px}
.aics-work .smap-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px}
.aics-work .smap-head{display:flex;align-items:center;justify-content:space-between;gap:8px;border-bottom:1px solid var(--border);padding-bottom:10px;margin-bottom:12px;flex-wrap:wrap}
.aics-work .smap-num{font-size:11px;font-weight:700;color:#fff;background:linear-gradient(135deg,var(--purple),#9c7cff);border-radius:20px;padding:3px 12px;flex-shrink:0}
.aics-work .smap-title{font-weight:700;color:var(--purple);font-size:14.5px;min-width:0}
.aics-work .smap-row{margin-bottom:11px}
.aics-work .smap-row:last-child{margin-bottom:0}
.aics-work .smap-label{font-size:11.5px;color:var(--cyan);font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:6px;letter-spacing:.3px}
.aics-work .smap-text{font-size:13px;color:var(--text);line-height:1.7;white-space:pre-wrap;word-break:break-word;background:var(--bg-input);padding:11px 13px;border-radius:10px;min-height:20px}
.aics-work .smap-meta{font-size:12.5px;color:var(--text2);border-top:1px solid var(--border);padding-top:10px;margin-top:4px;display:flex;flex-wrap:wrap;gap:6px 16px}
.aics-work .smap-meta span{display:inline-flex;align-items:center;gap:5px}
.aics-work .scene-image-area{margin-top:8px;text-align:center}
.aics-work .scene-image-area img{max-width:100%;border-radius:8px;border:1px solid var(--border)}

/* ===== Misc ===== */
.aics-work .empty-note{color:var(--text3);font-size:13px;padding:16px;background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;text-align:center}
.aics-work .btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:var(--bg-card2);border:1px solid var(--success);color:var(--success);padding:10px 20px;border-radius:8px;font-size:13px;z-index:1000;transition:transform .3s}
.toast.show{transform:translateX(-50%) translateY(0)}

/* ===== Responsive — iPad (769–1199) & Mobile (≤767): keep 2-column grids ===== */
@media (min-width:768px) and (max-width:1199px){
  .aics-work .studio-form-grid,.aics-work .adv-grid,.aics-work .vf-grid{gap:12px}
  .aics-work .card{padding:18px}
}
@media (max-width:767px){
  .aics-work .card{padding:16px;border-radius:14px}
  .aics-work .studio-form-grid,.aics-work .adv-grid,.aics-work .vf-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 10px}
  .aics-work input:not([type=checkbox]):not([type=radio]),.aics-work textarea,.aics-work select{min-height:48px}
  .aics-work textarea{min-height:100px}
  .aics-work .story-content-input{min-height:130px}
  .aics-work .story-actions-secondary{grid-template-columns:repeat(2,minmax(0,1fr))}
  .aics-work .story-actions-secondary .btn:last-child{grid-column:1 / -1}
  .aics-work .revise-input-row{flex-direction:column;align-items:stretch}
  .aics-work .revise-input-row .btn{width:100%}
  .aics-work .story-generate-btn,.aics-work .video-generate-btn,.aics-work .story-action-primary{min-height:50px;font-size:14.5px}
  .aics-work .aics-advanced-toggle{min-height:48px}
}
</style>
</head>
<body>
<div id="loginView" class="aics-login-overlay" style="display:none;"><div class="aics-login-box"><h2>Login လုပ်ရန် လိုအပ်ပါသည်</h2><p>Story Studio ကို အသုံးပြုရန် Google နဲ့ Login ဝင်ပါ။</p><a href="/api/auth/login?next=/app/story" class="btn btn-primary">Google နဲ့ Login</a></div></div>
${renderStudioShell({
  id: 'story',
  activeId: 'story',
  nameMy: 'ဇာတ်လမ်း Studio',
  desc: 'Turn your ideas into cinematic stories',
  icon: '📖',
  modelCat: 'text',
  steps: STEPS,
  content: CONTENT_HTML,
})}
${sidebarScript()}
<style>
/* ===== Story Studio — cascade override (after shared shell styles) ===== */
/* Story Studio ပုံစံများကို shared mobile 1-column rule ထက် အသာဖြစ်စေရန် */
@media (max-width:767px){
  .aics-work .studio-form-grid,.aics-work .adv-grid,.aics-work .vf-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .aics-work .vf-grid .form-group,.aics-work .adv-grid .form-group,.aics-work .studio-form-grid .form-group{margin-bottom:0}
}
</style>
<div class="toast" id="toast">&#9989; ကူးယူပြီးပါပြီ</div>
<script>
var token=localStorage.getItem('aics_token')||'';
var userEmail=localStorage.getItem('aics_email')||'';
var userPlan=localStorage.getItem('aics_plan')||'FREE';
var isPro=(userPlan==='PRO');
var selectedStoryType='1';
var selectedVideoType='1';
var currentStory='';
var currentStoryIdea='';
var currentCharacters=[];
var currentScenes=[];
var imgCache={};
var videoStarted=false;
var storyBusy=false;
var planBusy=false;
var typewriterTimer=null;
var currentRefImage='';

var STORY_TYPES=[
  {v:'1',label:'ဇာတ်လမ်း',pro:false},
  {v:'2',label:'ရုပ်ရှင်',pro:true},
  {v:'3',label:'ဇာတ်လမ်းတွဲ',pro:true},
  {v:'4',label:'ဇာတ်လမ်းတို',pro:true},
  {v:'5',label:'ဟာသဇာတ်လမ်း',pro:true}
];
var VIDEO_TYPES=[
  {v:'1',label:'Video',pro:false},
  {v:'2',label:'ရုပ်ရှင် (Film)',pro:true},
  {v:'3',label:'ဇာတ်လမ်းတွဲ (Series)',pro:true},
  {v:'4',label:'ဇာတ်လမ်းတို (Short)',pro:true},
  {v:'5',label:'ဟာသဇာတ်လမ်း (Comedy)',pro:true}
];
// Advanced Settings fields (field_0 = ဇာတ်လမ်းအကြောင်းအရာ — Essential, Required)
// အောက်ပါတို့သည် Optional ဖြစ်ပြီး Advanced Accordion အတွင်းတွင် ပြသည်
var FIELD_CONFIG=[
  {label:'ဇာတ်လမ်းအကြောင်းအရာ (Story Content)',placeholder:'ဥပမာ — ဘာအကြောင်းရေးချင်ပါသလဲ?',required:true,multiline:true},
  {label:'အဓိကဇာတ်ကောင် (Main Character)',placeholder:'ဥပမာ — မောင်မင်း'},
  {label:'ဇာတ်ကောင်အသေးစိတ် (Character Details)',placeholder:'ဥပမာ — ၂၅ နှစ် / ဆော့ဖ်ဝဲ အင်ဂျင်နီယာ / ရဲရင့်သော စိတ်ထား'},
  {label:'အဓိကပြဿနာ (Main Conflict)',placeholder:'ဥပမာ — ဇာတ်ကောင် ဘာအခက်အခဲကရမလဲ?'},
  {label:'ဇာတ်ကောင်ရည်မှန်းချက် (Character Goal)',placeholder:'ဥပမာ — ကိုယ်ပိုင်လုပ်ငန်း ထူထောင်ချင်သည်'},
  {label:'နေရာ / ပတ်ဝန်းကျင် (Setting / Environment)',placeholder:'ဥပမာ — မြန်မာကျေးရွာ / ရန်ကုန်မြို့'},
  {label:'အချိန်ကာလ (Time Period)',placeholder:'ဥပမာ — ၂၀၂၀ / ရှေးခေတ် / အနာဂတ်'},
  {label:'ခံစားချက် (Mood / Emotion)',placeholder:'ဥပမာ — ဝမ်းနည်း / လှုပ်ရှား / ကြောက်စရာ'},
  {label:'ဇာတ်လမ်းအရှည် (Story Length)',placeholder:'ဥပမာ — မိနစ် ၃၀ / နာရီဝက်'},
  {label:'နိဂုံးပုံစံ (Ending)',placeholder:'ဥပမာ — ပျော်ရွှင်စရာ အဆုံးသတ် / လှည့်ကွက်နဲ့ အဆုံးသတ်'},
  {label:'အပိုဆောင်းညွှန်ကြားချက် (Additional Instructions)',placeholder:'ဥပမာ — ဇာတ်လမ်းထဲမှာ မြန်မာ့ယဉ်ကျေးမှု အသေးစိတ်များ ထည့်ပေးပါ',multiline:true}
];
var DURATIONS=['15 sec','30 sec','45 sec','60 sec','90 sec','120 sec'];
var SCENE_DURATIONS=['5 sec','8 sec','10 sec','12 sec','15 sec'];
var RATIOS=['16:9','9:16','1:1','4:3','21:9'];
var VISUAL_STYLES=['Cinematic Realism','Anime','3D Animation','2D Illustration','Stop Motion','Documentary','Film Noir','Fantasy'];
var CAMERA_STYLES=['Feature Film','Documentary','Drone Shot','Handheld','Static Shot','Slow Motion','Tracking Shot','Aerial'];
var LANGUAGES=['မြန်မာ','English','မြန်မာ + English'];
var ENV_STYLES=['Realistic','Stylized','Minimalist','Fantasy','Sci-Fi','Historical','Urban','Nature'];

(function init(){
  if(!token){document.getElementById('loginView').style.display='flex';document.getElementById('aicsApp').style.display='none';return;}
  var _ue=document.getElementById('userEmail');if(_ue)_ue.textContent=userEmail||'—';
  var _pb=document.getElementById('planBadge');if(_pb)_pb.textContent=userPlan||'FREE';
  try{var ic=localStorage.getItem('aics_draft_story_imgcache');if(ic){imgCache=JSON.parse(ic)||{};}}catch(e){}
  buildIdeaFields();
  buildVideoTypeSel();
  fillSelect('vidDurationSel',DURATIONS,'30 sec');
  fillSelect('vidSceneSel',SCENE_DURATIONS,'8 sec');
  fillSelect('vidRatioSel',RATIOS,'16:9');
  fillSelect('vidStyleSel',VISUAL_STYLES,'Cinematic Realism');
  fillSelect('vidCamSel',CAMERA_STYLES,'Feature Film');
  fillSelect('vidLangSel',LANGUAGES,'မြန်မာ');
  fillSelect('vidEnvSel',ENV_STYLES,'Realistic');
  var _ta=document.getElementById('field_0');
  if(_ta){_ta.addEventListener('input',function(){this.style.height='auto';this.style.height=(this.scrollHeight)+'px';});}
  updateGenBtn();
  renderRefPreview();
  var sr=document.getElementById('storyResult');
  if(sr){
    sr.addEventListener('keydown',function(){stopTypewriter();});
    sr.addEventListener('pointerdown',function(){stopTypewriter();});
  }
  var _db=debounce(autoSave,400);
  document.addEventListener('input',function(e){if(e.target&&e.target.closest&&e.target.closest('#aicsApp'))_db();},true);
  document.addEventListener('change',function(e){if(e.target&&e.target.closest&&e.target.closest('#aicsApp'))_db();},true);
})();

function debounce(fn,ms){var t=null;return function(){var a=arguments,c=this;clearTimeout(t);t=setTimeout(function(){fn.apply(c,a);},ms);};}
function sel(id){var e=document.getElementById(id);return e?e.value:'';}
function fillSelect(id,opts,defVal){
  var s=document.getElementById(id);if(!s)return;
  s.innerHTML='';
  for(var i=0;i<opts.length;i++){
    var o=document.createElement('option');o.value=opts[i];o.textContent=opts[i];
    if(opts[i]===defVal)o.selected=true;
    s.appendChild(o);
  }
}
function buildVideoTypeSel(){
  var selEl=document.getElementById('vidTypeSel');if(!selEl)return;
  selEl.innerHTML='';
  for(var i=0;i<VIDEO_TYPES.length;i++){
    (function(t){
      var o=document.createElement('option');
      o.value=t.v;
      o.textContent=t.label+(t.pro?' (PRO)':'');
      if(t.pro&&!isPro)o.disabled=true;
      selEl.appendChild(o);
    })(VIDEO_TYPES[i]);
  }
  if(!isPro&&selectedVideoType!=='1')selectedVideoType='1';
  selEl.value=selectedVideoType;
  selEl.onchange=function(){
    var v=selEl.value;
    var meta=VIDEO_TYPES[parseInt(v,10)-1];
    if(meta&&meta.pro&&!isPro){showToastMsg('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။');selEl.value=selectedVideoType;return;}
    selectedVideoType=v;
  };
}

function apiCall(url,body){var s=document.getElementById('aiModelSel');if(s&&s.value)body.model=s.value;return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.detail||data.error||'Request failed');return data;});});}

// ===================== Advanced Settings Fields =====================
function buildIdeaFields(){
  var c=document.getElementById('ideaFields');if(!c)return;
  c.innerHTML='';
  for(var i=1;i<FIELD_CONFIG.length;i++){
    (function(f,idx){
      var row=document.createElement('div');row.className='form-group';
      var label=document.createElement('label');label.textContent=f.label;
      var input;
      if(f.multiline){
        input=document.createElement('textarea');
        input.style.minHeight='70px';
        input.addEventListener('input',function(){autoExpand(this);});
      }else{
        input=document.createElement('input');input.type='text';
      }
      input.id='field_'+idx;
      input.placeholder=f.placeholder;
      label.htmlFor=input.id;
      row.appendChild(label);row.appendChild(input);c.appendChild(row);
    })(FIELD_CONFIG[i],i);
  }
}

function collectIdeaText(){
  var lines=[],valid=true;
  for(var i=0;i<FIELD_CONFIG.length;i++){
    var el=document.getElementById('field_'+i);
    var val=el?el.value.trim():'';
    if(FIELD_CONFIG[i].required&&!val)valid=false;
    if(val)lines.push(FIELD_CONFIG[i].label.split(' (')[0]+': '+val);
  }
  var tone=document.getElementById('toneSel');if(tone&&tone.value)lines.push('ရေးသားပုံစံ (Tone): '+tone.value);
  var lang=document.getElementById('langSel');if(lang&&lang.value)lines.push('ဘာသာစကား (Language): '+lang.value);
  var aud=document.getElementById('audSel');if(aud&&aud.value)lines.push('ပရိသတ် (Audience): '+aud.value);
  return{text:lines.join('\\n'),valid:valid};
}

// ===================== Form Validation (Generate Button) =====================
function onStoryContentInput(){
  var ta=document.getElementById('field_0');
  if(ta){autoExpand(ta);}
  updateGenBtn();
}
function updateGenBtn(){
  var btn=document.getElementById('genStoryBtn');
  if(!btn)return;
  var ta=document.getElementById('field_0');
  var v=ta?ta.value.trim():'';
  btn.disabled=!v;
  if(v){hideField0Error();}
}
function showField0Error(){
  var g=document.getElementById('field_0');
  if(g&&g.closest){var grp=g.closest('.form-group');if(grp)grp.classList.add('has-error');}
}
function hideField0Error(){
  var g=document.getElementById('field_0');
  if(g&&g.closest){var grp=g.closest('.form-group');if(grp)grp.classList.remove('has-error');}
}

// ===================== Typewriter + Auto Expand =====================
function stopTypewriter(){if(typewriterTimer){clearInterval(typewriterTimer);typewriterTimer=null;}}
function autoExpand(ta){if(!ta)return;ta.style.height='auto';ta.style.height=(ta.scrollHeight+2)+'px';}
function typewriteStory(text,ta){
  stopTypewriter();
  if(!ta)return;
  ta.value='';autoExpand(ta);
  var i=0,total=text.length;
  var step=Math.max(1,Math.round(total/150));
  typewriterTimer=setInterval(function(){
    i+=step;
    if(i>=total){ta.value=text;stopTypewriter();autoExpand(ta);currentStory=text;return;}
    ta.value=text.slice(0,i);
    autoExpand(ta);
  },18);
}
function onStoryEdit(){
  stopTypewriter();
  var ta=document.getElementById('storyResult');
  if(ta){currentStory=ta.value;autoExpand(ta);}
}

// ===================== Error Helpers =====================
function friendlyMsg(err,kind){
  var m=(err&&err.message)?String(err.message):'';
  if(kind==='story'){
    if(/missing_idea/.test(m))return 'ဇာတ်လမ်းအကြောင်း အနည်းဆုံး ဖြည့်ရေးပါ။';
    if(/pro_only|feature_disabled/.test(m))return 'ဒီ Feature ကို ယခု အသုံးပြုခွင့် မရှိပါ။';
    if(/unauthorized|invalid_token/.test(m))return 'Login သက်တမ်း ကုန်သွားပါပြီ။ ပြန် Login ဝင်ပါ။';
    if(/fetch|network|failed/i.test(m))return 'ဇာတ်လမ်းရေးသားရာတွင် ပြဿနာတစ်ခု ဖြစ်ပေါ်ခဲ့သည်။\\nAI Server မှ တုံ့ပြန်မှု မရရှိပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
    return 'ဇာတ်လမ်းရေးသားရာတွင် ပြဿနာတစ်ခု ဖြစ်ပေါ်ခဲ့သည်။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
  }
  if(kind==='video'){
    if(/missing_idea/.test(m))return 'ဇာတ်လမ်း ထည့်ရန် လိုအပ်ပါသည် — Step 02 မှာ ဇာတ်လမ်းရေးပြီးမှ ဆက်လုပ်ပါ။';
    if(/pro_only|feature_disabled/.test(m))return 'ဒီ Feature ကို ယခု အသုံးပြုခွင့် မရှိပါ။';
    if(/unauthorized|invalid_token/.test(m))return 'Login သက်တမ်း ကုန်သွားပါပြီ။ ပြန် Login ဝင်ပါ။';
    if(/fetch|network|failed/i.test(m))return 'Video ပြင်ဆင်ရာတွင် ပြဿနာတစ်ခု ဖြစ်ပေါ်ခဲ့သည်။\\nAI Server မှ တုံ့ပြန်မှု မရရှိပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
    return 'Video ပြင်ဆင်ရာတွင် ပြဿနာတစ်ခု ဖြစ်ပေါ်ခဲ့သည်။\\nScene များကို ခွဲခြားရာတွင် အခက်အခဲ ဖြစ်ပေါ်ခဲ့ပါသည်။';
  }
  if(kind==='image'){
    if(/fetch|network|failed/i.test(m))return 'ရုပ်ပုံ ဖန်တီး၍ မရပါ။\\nAI Server မှ တုံ့ပြန်မှု မရရှိပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
    return 'ရုပ်ပုံ ဖန်တီး၍ မရပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
  }
  return 'လုပ်ဆောင်၍ မရပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
}
function showError(id,msg){var el=document.getElementById(id);if(!el)return;el.textContent=msg;el.classList.add('show');}
function hideError(id){var el=document.getElementById(id);if(el)el.classList.remove('show');}
function showStepError(id,rid,msg){
  var el=document.getElementById(id);
  if(el){el.innerHTML=String(msg).replace(/\\n/g,'<br>');el.classList.add('show');}
  var r=document.getElementById(rid);
  if(r)r.classList.add('show');
}
function hideStepError(id,rid){
  var el=document.getElementById(id);if(el)el.classList.remove('show');
  var r=document.getElementById(rid);if(r)r.classList.remove('show');
}
function showToastMsg(msg){var t=document.getElementById('toast');t.textContent=msg||'&#9989; ကူးယူပြီးပါပြီ';t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2500);}
function escapeHtml(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function copyToClipboard(text){
  if(!text){showToastMsg('Text မရှိပါ');return;}
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
}

// ===================== Step 01 → 02 (Story Generate — Unified Result Loading) =====================
function generateStory(){
  if(storyBusy)return;
  var collected=collectIdeaText();
  if(!collected.valid){showError('genError','ဇာတ်လမ်းအကြောင်း အနည်းဆုံး ဖြည့်ရေးပါ');showField0Error();return;}
  var stMeta=STORY_TYPES[parseInt(selectedStoryType,10)-1];
  if(stMeta&&stMeta.pro&&!isPro){showToastMsg('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။');return;}
  var idea=collected.text;
  hideError('genError');hideStepError('genError2','genRetry2');
  storyBusy=true;
  currentStory='';
  studioMarkDone(1);
  // Unified: Result section အတွင်း loading ပြသည် (Stepper ထဲတွင် မပြ)
  if(window.aicsResultLoading)window.aicsResultLoading.show('storyLoading','AI ရေးသားနေသည်...',idea);
  var sb=document.getElementById('storyResultBody');if(sb)sb.style.display='none';
  var gb=document.getElementById('genStoryBtn');
  if(gb){gb.disabled=true;gb.innerHTML='&#9203; ဇာတ်လမ်းရေးသားနေသည်...';}
  var f0=document.getElementById('field_0');if(f0)f0.disabled=true;
  if(window.studioForceGoStep)window.studioForceGoStep(2);
  else window.studioGoStep(2);
  var byok=document.getElementById('byokInput')?document.getElementById('byokInput').value.trim():'';
  var body={idea:idea,type:selectedStoryType};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/story/generate',body)
    .then(function(data){
      currentStory=data.story||'';
      currentStoryIdea=idea;
      if(window.aicsResultLoading)window.aicsResultLoading.hide('storyLoading');
      var sb2=document.getElementById('storyResultBody');if(sb2)sb2.style.display='';
      studioMarkDone(1);studioMarkDone(2);
      document.getElementById('reviseHistory').innerHTML='';
      var ta=document.getElementById('storyResult');
      typewriteStory(currentStory,ta);
      storyBusy=false;
      if(f0)f0.disabled=false;
      if(gb){gb.disabled=false;gb.innerHTML='&#10024; ဇာတ်လမ်းရေးသားရန်';}
      if(window.studioForceGoStep)window.studioForceGoStep(2);
      else window.studioGoStep(2);
      showToastMsg('&#10004; ဇာတ်လမ်းရေးပြီးပါပြီ');
      autoSave();
    })
    .catch(function(err){
      console.error('Story Generate Error:', err);
      if(window.aicsResultLoading)window.aicsResultLoading.hide('storyLoading');
      storyBusy=false;
      if(f0)f0.disabled=false;
      if(gb){gb.disabled=false;gb.innerHTML='&#10024; ဇာတ်လမ်းရေးသားရန်';}
      var sb3=document.getElementById('storyResultBody');if(sb3)sb3.style.display='none';
      showStepError('genError2','genRetry2',friendlyMsg(err,'story'));
      // Error → Result section အတွင်းတွင် error + retry ပြသည်
      if(window.studioUnmarkDone)window.studioUnmarkDone(2);
      showToastMsg('⚠️ '+(friendlyMsg(err,'story').replace(/\\n/g,' ')));
    });
}

// ===================== Revise =====================
function reviseStory(){
  var instruction=document.getElementById('feedbackInput').value.trim();
  if(!instruction){showError('revError','ဘယ်လိုပြင်ချင်လဲ ရေးပါ');return;}
  if(!currentStory){showError('revError','အရင် Story ကို ဖန်တီးပါ');return;}
  hideError('revError');
  document.getElementById('revLoading').classList.add('show');
  document.getElementById('reviseBtn').disabled=true;
  addHistory('user',instruction);
  document.getElementById('feedbackInput').value='';
  var latestStory=document.getElementById('storyResult').value;
  var body={idea:currentStoryIdea,type:selectedStoryType,currentStory:latestStory,instruction:instruction};
  apiCall('/api/studio/story/revise',body)
    .then(function(data){
      currentStory=data.story||'';
      var ta=document.getElementById('storyResult');
      if(ta){ta.value=currentStory;autoExpand(ta);}
      addHistory('ai','ပြင်ဆင်ပြီးပါပြီ — အထက်က ဇာတ်လမ်းထဲမှာ ကြည့်ပါ');
      autoSave();
    })
    .catch(function(err){showError('revError',friendlyMsg(err,'story'));})
    .finally(function(){document.getElementById('revLoading').classList.remove('show');document.getElementById('reviseBtn').disabled=false;});
}
function addHistory(role,text){
  var div=document.createElement('div');div.className='revise-msg '+role;
  div.innerHTML='<div class="role">'+(role==='user'?'သင် (User)':'AI')+'</div>'+escapeHtml(text);
  document.getElementById('reviseHistory').appendChild(div);
  document.getElementById('reviseHistory').scrollTop=document.getElementById('reviseHistory').scrollHeight;
}
function focusRevise(){
  var t=document.getElementById('reviseToggle');
  var p=document.getElementById('revisePanel');
  if(t&&p&&!p.classList.contains('open')){if(window.studioToggleAdvanced)window.studioToggleAdvanced('reviseToggle','revisePanel');}
  var r=document.getElementById('revise-section');
  if(r)r.scrollIntoView({behavior:'smooth',block:'center'});
  var f=document.getElementById('feedbackInput');
  if(f)f.focus();
}

// ===================== 02 → 03 (User နောက်ဆုံးပြင်ထားသော Story ကို ပို့သည် — Auto Transfer) =====================
function goToVideoForm(){
  var ta=document.getElementById('storyResult');
  stopTypewriter();
  if(ta)currentStory=ta.value;
  if(!currentStory||!currentStory.trim()){showToastMsg('ဗီဒီယို ဖန်တီးရန် ဇာတ်လမ်း မရှိသေးပါ');return;}
  stMarkDone(2);
  videoStarted=true;
  fillVideoStoryField();
  stSetMode('video');
  stGoForce(3);
  autoSave();
}
function fillVideoStoryField(){
  var ta=document.getElementById('videoStoryInput');
  if(!ta)return;
  ta.value=currentStory||'';
  autoExpand(ta);
}

// ===================== Reference Image (Video Advanced) =====================
function onRefImageSelect(input){
  var f=input.files&&input.files[0];
  if(!f)return;
  if(!/^image\\//.test(f.type)){showToastMsg('ပုံဖိုင် (Image) သာ ထည့်နိုင်ပါသည်');input.value='';return;}
  if(f.size>4*1024*1024){showToastMsg('ပုံဖိုင် အရွယ်အစား 4MB ထက် မကြီးရပါ');input.value='';return;}
  var r=new FileReader();
  r.onload=function(){currentRefImage=String(r.result);renderRefPreview();autoSave();};
  r.readAsDataURL(f);
}
function renderRefPreview(){
  var p=document.getElementById('vidRefImgPreview');
  if(!p)return;
  if(currentRefImage){
    p.innerHTML='<img src="'+currentRefImage+'" alt="ရည်ညွှန်းရုပ်ပုံ (Reference Image)"><button type="button" class="btn-ghost" onclick="clearRefImage()">&#10005; ဖျက်ရန်</button>';
  }else{p.innerHTML='';}
}
function clearRefImage(){
  currentRefImage='';
  var i=document.getElementById('vidRefImgInput');if(i)i.value='';
  renderRefPreview();
  autoSave();
}

// ===================== Step 03 → 04 (Video Plan — Unified Result Loading) =====================
function generateVideoPlan(){
  if(planBusy)return;
  var story=document.getElementById('videoStoryInput').value.trim();
  if(!story){showError('planError','ဇာတ်လမ်း ထည့်ရန် လိုအပ်ပါသည် — Step 02 မှာ ဇာတ်လမ်းရေးပြီးမှ ဆက်လုပ်ပါ');return;}
  hideError('planError');hideStepError('planError5','planRetry5');
  planBusy=true;
  var btn=document.getElementById('videoPlanBtn');
  if(btn){btn.disabled=true;btn.innerHTML='&#9203; Video ပြင်ဆင်နေသည်...';}
  studioMarkDone(3);
  // Unified: Video Result section အတွင်း loading ပြသည်
  if(window.aicsResultLoading)window.aicsResultLoading.show('planLoading','AI ပြင်ဆင်နေသည်...',story);
  if(window.studioForceGoStep)window.studioForceGoStep(4);
  else window.studioGoStep(4);
  var continuity=document.getElementById('vidContinuity');
  var consistency=document.getElementById('vidConsistency');
  var body={
    story:story,
    type:selectedVideoType,
    videoType:sel('vidTypeSel'),
    duration:sel('vidDurationSel'),
    sceneDuration:sel('vidSceneSel'),
    aspectRatio:sel('vidRatioSel'),
    visualStyle:sel('vidStyleSel'),
    cameraStyle:sel('vidCamSel'),
    language:sel('vidLangSel'),
    environmentStyle:sel('vidEnvSel'),
    characterContinuity:(continuity&&continuity.checked)?'true':'false',
    characterConsistency:(consistency&&consistency.checked)?'true':'false',
    referenceImage:currentRefImage||'',
    additionalInstructions:document.getElementById('vidExtra')?document.getElementById('vidExtra').value.trim():''
  };
  apiCall('/api/studio/story/video',body)
    .then(function(data){
      currentScenes=data.scenes||[];
      currentCharacters=data.characters||[];
      if(window.aicsResultLoading)window.aicsResultLoading.hide('planLoading');
      studioMarkDone(3);studioMarkDone(4);
      planBusy=false;
      if(btn){btn.disabled=false;btn.innerHTML='&#127916; Video ဇာတ်လမ်း ဖန်တီးရန်';}
      if(window.studioForceGoStep)window.studioForceGoStep(4);
      else window.studioGoStep(4);
      renderFinalResult();
      showToastMsg('&#10004; Video ဇာတ်လမ်း ပြင်ဆင်ပြီးပါပြီ');
      autoSave();
    })
    .catch(function(err){
      console.error('Story Video Plan Error:', err);
      if(window.aicsResultLoading)window.aicsResultLoading.hide('planLoading');
      planBusy=false;
      if(btn){btn.disabled=false;btn.innerHTML='&#127916; Video ဇာတ်လမ်း ဖန်တီးရန်';}
      showStepError('planError5','planRetry5',friendlyMsg(err,'video'));
      // Error → Result section အတွင်းတွင် error + retry ပြသည်
      if(window.studioUnmarkDone)window.studioUnmarkDone(4);
      showToastMsg('⚠️ '+(friendlyMsg(err,'video').replace(/\\n/g,' ')));
    });
}

// ===================== Video Result — Characters + Story Map =====================
function durText(d){
  if(d===undefined||d===null||d==='')return '';
  if(typeof d==='number')return d+' sec';
  var s=String(d).trim();
  return /sec/i.test(s)?s:(s+' sec');
}
function resolveSceneCharacters(idx){
  var s=currentScenes[idx];if(!s)return '-';
  var ids=(s.characterIds&&s.characterIds.length)?s.characterIds:(Array.isArray(s.characters)?s.characters:[]);
  if(!ids.length)return '-';
  var names=[];
  for(var i=0;i<ids.length;i++){
    var id=ids[i],found=null;
    for(var k=0;k<currentCharacters.length;k++){
      if(currentCharacters[k].id===id||currentCharacters[k].name===id){found=currentCharacters[k];break;}
    }
    names.push(found?(found.name||id):id);
  }
  return names.join(', ');
}
function sceneDescription(s){
  if(s.description)return s.description;
  var parts=[];
  if(s.location)parts.push('နေရာ — '+s.location);
  if(s.emotion)parts.push('ခံစားချက် — '+s.emotion);
  return parts.length?parts.join(' · '):'(မရှိပါ)';
}
function sceneVisualDesc(s){
  if(s.visualDescription)return s.visualDescription;
  var parts=[];
  if(s.visualStyle)parts.push(s.visualStyle);
  if(s.camera)parts.push(s.camera);
  if(s.lighting)parts.push('Lighting — '+s.lighting);
  return parts.length?parts.join(' · '):'(မရှိပါ)';
}
function renderFinalResult(){
  var c=document.getElementById('finalResult');if(!c)return;
  var html='';
  // ---- Characters ----
  if(currentCharacters&&currentCharacters.length){
    html+='<div class="card"><div class="card-title">&#128100; ဇာတ်ကောင်များ (Characters)</div>';
    for(var i=0;i<currentCharacters.length;i++){
      (function(idx){
        var ch=currentCharacters[idx]||{};
        var prompt=ch.characterPrompt||ch.prompt||'(မရှိပါ)';
        var img=imgCache['char_'+idx]||ch.referenceImage||'';
        html+='<div class="final-char-card">';
        html+='<div class="final-char-head"><span class="final-char-name">&#128100; '+escapeHtml(ch.name||'Character '+(idx+1))+'</span><span class="final-char-id">'+escapeHtml(ch.id||('char_'+String(idx+1).padStart(2,'0')))+'</span></div>';
        var meta='';
        if(ch.age)meta+='<div>&#127875; အသက် '+escapeHtml(ch.age)+'</div>';
        if(ch.role)meta+='<div>&#127917; '+escapeHtml(ch.role)+'</div>';
        if(ch.description)meta+='<div>&#128221; '+escapeHtml(ch.description)+'</div>';
        if(meta)html+='<div class="final-char-meta">'+meta+'</div>';
        html+='<div class="final-char-ref"><div class="final-prompt-label">Character Reference</div><div class="final-prompt-text">'+escapeHtml(prompt)+'</div></div>';
        html+='<div class="final-char-img" id="charImg_'+idx+'">'+(img?'<img class="aics-pv-img" src="'+img+'">':'<div class="empty-note">ရုပ်ပုံ မရှိသေးပါ</div>')+'</div>';
        html+='<div class="btn-row"><button class="btn-ghost" onclick="copyCharPrompt('+idx+')">&#128203; Copy Prompt</button><button class="btn-ghost" onclick="generateCharImage('+idx+')">&#127912; Character Image ဖန်တီးရန်</button></div>';
        html+='</div>';
      })(i);
    }
    html+='</div>';
  }
  // ---- Story Map (Scenes) ----
  if(currentScenes&&currentScenes.length){
    html+='<div class="card storymap-card"><div class="card-title">&#128506; Story Map <span class="card-title-sub">(ဇာတ်လမ်းမြေပုံ — Scenes)</span></div>';
    for(var j=0;j<currentScenes.length;j++){
      (function(idx){
        var s=currentScenes[idx]||{};
        var num=String(s.number||(idx+1));
        var title=s.title?escapeHtml(s.title):'(Scene '+num+')';
        html+='<div class="smap-card">';
        html+='<div class="smap-head"><span class="smap-num">SCENE '+num+'</span><span class="smap-title">'+title+'</span></div>';
        html+='<div class="smap-row"><div class="smap-label">&#128221; Scene Description</div><div class="smap-text">'+escapeHtml(sceneDescription(s))+'</div></div>';
        html+='<div class="smap-row"><div class="smap-label">&#127912; Visual Description</div><div class="smap-text">'+escapeHtml(sceneVisualDesc(s))+'</div></div>';
        html+='<div class="smap-row"><div class="smap-label">&#127757; Environment</div><div class="smap-text">'+escapeHtml(s.environmentPrompt||'(မရှိပါ)')+'</div>';
        html+='<div class="scene-image-area" id="envImg_'+idx+'">'+(imgCache['env_'+idx]?'<img src="'+imgCache['env_'+idx]+'">':'<button class="btn btn-orange" style="font-size:12px;padding:8px 14px;min-height:38px;" onclick="generateEnvImage('+idx+')">&#127912; Environment Image ဖန်တီးပါ</button>')+'</div>';
        html+='<div class="btn-row"><button class="btn-ghost" onclick="copyEnvPrompt('+idx+')">&#128203; Copy Environment Prompt</button></div></div>';
        html+='<div class="smap-row"><div class="smap-label">&#127916; Video Prompt</div><div class="smap-text">'+escapeHtml(s.videoPrompt||'(မရှိပါ)')+'</div><div class="btn-row"><button class="btn-ghost" onclick="copyVideoPrompt('+idx+')">&#128203; Copy Video Prompt</button></div></div>';
        html+='<div class="smap-meta"><span>&#128100; Characters: '+escapeHtml(resolveSceneCharacters(idx))+'</span><span>&#9201; '+escapeHtml(durText(s.duration))+'</span></div>';
        html+='</div>';
      })(j);
    }
    html+='</div>';
  }
  if(!html)html='<div class="card"><div class="empty-note">ရလဒ် မရှိသေးပါ — Video ဇာတ်လမ်း ဖန်တီးပါ</div></div>';
  c.innerHTML=html;
}

// ===================== Copy / Save / Export =====================
function copyStory(){
  var text=document.getElementById('storyResult').value;
  if(!text){showToastMsg('Copy လုပ်ဖို့ Result မရှိသေးပါ');return;}
  copyToClipboard(text);
}
function saveStory(){
  var text=document.getElementById('storyResult').value;
  if(!text){showToastMsg('Save လုပ်ဖို့ Result မရှိသေးပါ');return;}
  var topic=document.getElementById('field_0').value.trim()||'ဇာတ်လမ်း';
  var defaultTitle=topic.substring(0,40)+(topic.length>40?'...':'');
  var title=prompt('Creation အမည် ပေးပါ:',defaultTitle);
  if(title===null)return;
  AICS_CREATIONS.save({studio:'STORY',type:selectedStoryType,title:title||defaultTitle,original_prompt:currentStoryIdea,ai_output:text})
    .then(function(){showToastMsg('&#128190; My Creations ထဲ Save ပြီးပါပြီ');})
    .catch(function(err){showToastMsg('Save မအောင်မြင်ပါ: '+(err&&err.message||'Error'));});
}
function copyCharPrompt(idx){
  if(!currentCharacters[idx])return;
  copyToClipboard(currentCharacters[idx].characterPrompt||currentCharacters[idx].prompt||'');
}
function copyVideoPrompt(idx){if(!currentScenes[idx])return;copyToClipboard(currentScenes[idx].videoPrompt||'');}
function copyEnvPrompt(idx){if(!currentScenes[idx])return;copyToClipboard(currentScenes[idx].environmentPrompt||'');}

// ===================== Image Generation (Character / Environment) =====================
function generateCharImage(idx){
  if(!currentCharacters[idx])return;
  var prompt=currentCharacters[idx].characterPrompt||currentCharacters[idx].prompt||'';
  if(!prompt){showToastMsg('Prompt မရှိပါ');return;}
  var area=document.getElementById('charImg_'+idx);
  if(area)area.innerHTML='<div style="display:flex;align-items:center;gap:8px;justify-content:center;padding:14px;"><div class="spinner"></div><span style="font-size:13px;color:var(--cyan);">ရုပ်ပုံ ဖန်တီးနေပါသည်...</span></div>';
  apiCall('/api/studio/story/video-image',{prompt:prompt})
    .then(function(data){
      if(data.data){
        var src='data:'+(data.mimeType||'image/png')+';base64,'+data.data;
        imgCache['char_'+idx]=src;
        currentCharacters[idx].referenceImage=src;
        if(area)area.innerHTML='<img class="aics-pv-img" src="'+src+'"><div style="margin-top:8px;"><a href="'+src+'" download="story_character_'+(idx+1)+'.png"><button class="btn-ghost">&#128190; Save Image</button></a></div>';
        autoSave();autoSaveImgCache();
      }else{if(area)area.innerHTML='<div class="empty-note">ရုပ်ပုံ မထွက်ပါ — ထပ်စမ်းပါ</div>';}
    })
    .catch(function(err){if(area)area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">'+escapeHtml(friendlyMsg(err,'image'))+'</div><div style="text-align:center;margin-top:4px;"><button class="btn-ghost" onclick="generateCharImage('+idx+')">&#8635; ထပ်စမ်းပါ</button></div>';});
}
function generateEnvImage(idx){
  if(!currentScenes[idx]||!currentScenes[idx].environmentPrompt){showToastMsg('Prompt မရှိပါ');return;}
  var area=document.getElementById('envImg_'+idx);
  if(area)area.innerHTML='<div style="display:flex;align-items:center;gap:8px;justify-content:center;padding:12px;"><div class="spinner"></div><span style="font-size:13px;color:var(--cyan);">ရုပ်ပုံ ဖန်တီးနေပါသည်...</span></div>';
  apiCall('/api/studio/story/video-image',{prompt:currentScenes[idx].environmentPrompt})
    .then(function(data){
      if(data.data){
        var src='data:'+(data.mimeType||'image/png')+';base64,'+data.data;
        imgCache['env_'+idx]=src;
        if(area)area.innerHTML='<img src="'+src+'"><div style="margin-top:8px;"><a href="'+src+'" download="story_scene_'+(idx+1)+'_env.png"><button class="btn-ghost">&#128190; Save Image</button></a></div>';
        autoSave();autoSaveImgCache();
      }else{if(area)area.innerHTML='<div class="empty-note">ရုပ်ပုံ မထွက်ပါ — ထပ်စမ်းပါ</div>';}
    })
    .catch(function(err){if(area)area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">'+escapeHtml(friendlyMsg(err,'image'))+'</div><div style="text-align:center;margin-top:4px;"><button class="btn-ghost" onclick="generateEnvImage('+idx+')">&#8635; ထပ်စမ်းပါ</button></div>';});
}

// ===================== Result Text / Export =====================
function buildResultText(){
  var parts=[];
  if(currentStory&&currentStory.trim())parts.push('STORY\\n======================\\n'+currentStory);
  if(currentCharacters&&currentCharacters.length){
    var cp='CHARACTER REFERENCE PROMPTS\\n======================\\n';
    for(var i=0;i<currentCharacters.length;i++){
      var ch=currentCharacters[i];
      cp+='\\nCHARACTER '+(i+1)+'\\nID: '+(ch.id||'-')+'\\nName: '+(ch.name||'-')+'\\nRole: '+(ch.role||'-')+(ch.age?'\\nAge: '+ch.age:'')+(ch.description?'\\nDescription: '+ch.description:'')+'\\nPrompt: '+(ch.characterPrompt||ch.prompt||'-');
    }
    parts.push(cp);
  }
  if(currentScenes&&currentScenes.length){
    var sp='SCENE PROMPTS (Environment & Video)\\n======================\\n';
    for(var j=0;j<currentScenes.length;j++){
      var sc=currentScenes[j];
      sp+='\\nSCENE '+(sc.number||(j+1))+(sc.title?' — '+sc.title:'')+'\\nCharacters: '+resolveSceneCharacters(j)+'\\nDuration: '+durText(sc.duration)+'\\nEnvironment: '+(sc.environmentPrompt||'-')+'\\nVideo: '+(sc.videoPrompt||'-');
    }
    parts.push(sp);
  }
  return parts.join('\\n\\n');
}
function copyAllResult(){
  var text=buildResultText();
  if(!text.trim()){showToastMsg('Result မရှိသေးပါ');return;}
  copyToClipboard(text);
}
function saveAllResult(){
  var text=buildResultText();
  if(!text.trim()){showToastMsg('Save လုပ်ဖို့ Result မရှိသေးပါ');return;}
  var defaultTitle=(document.getElementById('field_0').value.trim()||'Story Result').substring(0,40);
  var title=prompt('Creation အမည် ပေးပါ:',defaultTitle);
  if(title===null)return;
  AICS_CREATIONS.save({studio:'STORY',type:selectedVideoType,title:title||defaultTitle,original_prompt:currentStoryIdea,ai_output:text})
    .then(function(){showToastMsg('&#128190; My Creations ထဲ Save ပြီးပါပြီ');})
    .catch(function(err){showToastMsg('Save မအောင်မြင်ပါ: '+(err&&err.message||'Error'));});
}
function exportResult(){
  var text=buildResultText();
  if(!text.trim()){showToastMsg('Export လုပ်ဖို့ Result မရှိသေးပါ');return;}
  var blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='story_result.txt';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
  showToastMsg('&#10004; Export ပြီးပါပြီ');
}

// ===================== Stepper Actions =====================
function bReset(){return {label:'Reset',cls:'ghost',fn:studioReset};}
function studioOnStep(n){
  if(n===1){
    // Story Form အောက်ရှိ Generate Button ကို Primary Action အဖြစ် ထားသည်
    studioSetActions([bReset()]);
  }else if(n===2){
    studioSetActions([
      {label:'&#8592; Back',cls:'ghost',fn:function(){window.studioGoStep(1);}},
      bReset()
    ]);
    var ta=document.getElementById('storyResult');
    if(ta)autoExpand(ta);
  }else if(n===3){
    fillVideoStoryField();
    var pb=document.getElementById('videoPlanBtn');
    if(pb)pb.disabled=false;
    studioSetActions([
      {label:'&#8592; ရလဒ်သို့ ပြန်ရန်',cls:'ghost',fn:function(){stSetMode('main');stGoForce(2);}},
      bReset()
    ]);
  }else if(n===4){
    studioSetActions([
      {label:'&#8592; Back',cls:'ghost',fn:function(){window.studioGoStep(3);}},
      {label:'&#128203; Copy All',cls:'secondary',fn:copyAllResult},
      {label:'&#128190; သိမ်းရန် (All)',cls:'purple',fn:saveAllResult},
      bReset()
    ]);
    renderFinalResult();
  }
}
window.studioOnStep=studioOnStep;

// ===================== Draft (studioCollectDraft / studioRestoreDraft) =====================
function studioCollectDraft(){
  var fields={};
  for(var i=0;i<FIELD_CONFIG.length;i++){var f=document.getElementById('field_'+i);fields[i]=f?f.value:'';}
  return {
    stepNow:window.studioCur?window.studioCur():1,
    mode:ST_MODE,
    storyType:selectedStoryType,
    videoType:selectedVideoType,
    aud:(document.getElementById('audSel')?document.getElementById('audSel').value:''),
    tone:document.getElementById('toneSel')?document.getElementById('toneSel').value:'',
    lang:document.getElementById('langSel')?document.getElementById('langSel').value:'',
    fields:fields,
    story:currentStory,
    storyIdea:currentStoryIdea,
    videoStarted:videoStarted,
    videoForm:{
      story:document.getElementById('videoStoryInput')?document.getElementById('videoStoryInput').value:'',
      videoType:selectedVideoType,
      duration:sel('vidDurationSel'),
      sceneDuration:sel('vidSceneSel'),
      aspectRatio:sel('vidRatioSel'),
      visualStyle:sel('vidStyleSel'),
      cameraStyle:sel('vidCamSel'),
      language:sel('vidLangSel'),
      environmentStyle:sel('vidEnvSel'),
      characterContinuity:document.getElementById('vidContinuity')?document.getElementById('vidContinuity').checked:true,
      characterConsistency:document.getElementById('vidConsistency')?document.getElementById('vidConsistency').checked:true,
      referenceImage:currentRefImage||'',
      additionalInstructions:document.getElementById('vidExtra')?document.getElementById('vidExtra').value:''
    },
    characters:currentCharacters,
    scenes:currentScenes
  };
}
window.studioCollectDraft=studioCollectDraft;

function studioRestoreDraft(d){
  if(!d)return;
  selectedStoryType=d.storyType||'1';
  selectedVideoType=d.videoType||'1';
  var sts=document.getElementById('storyTypeSel');if(sts)sts.value=selectedStoryType;
  var aud=document.getElementById('audSel');if(aud&&d.aud)aud.value=d.aud;window.aichAud=(aud?aud.value:'လူတိုင်း');
  var tone=document.getElementById('toneSel');if(tone&&d.tone)tone.value=d.tone;
  var lang=document.getElementById('langSel');if(lang&&d.lang)lang.value=d.lang;
  if(d.fields){for(var i=0;i<FIELD_CONFIG.length;i++){var f=document.getElementById('field_'+i);if(f)f.value=d.fields[i]||'';}}
  currentStory=d.story||'';
  currentStoryIdea=d.storyIdea||'';
  videoStarted=!!d.videoStarted;
  document.getElementById('storyResult').value=currentStory;
  if(d.videoForm){
    var vf=d.videoForm;
    var vs=document.getElementById('videoStoryInput');if(vs){vs.value=vf.story||currentStory;autoExpand(vs);}
    var vt=document.getElementById('vidTypeSel');
    if(vt){vt.value=(!isPro&&vf.videoType&&vf.videoType!=='1')?'1':(vf.videoType||'1');selectedVideoType=vt.value||'1';}
    var setf=function(id,v){var e=document.getElementById(id);if(e&&v)e.value=v;};
    setf('vidDurationSel',vf.duration);setf('vidSceneSel',vf.sceneDuration);setf('vidRatioSel',vf.aspectRatio);
    setf('vidStyleSel',vf.visualStyle);setf('vidCamSel',vf.cameraStyle);setf('vidLangSel',vf.language);
    setf('vidEnvSel',vf.environmentStyle);
    var cc=document.getElementById('vidContinuity');if(cc)cc.checked=vf.characterContinuity!==false;
    var cs=document.getElementById('vidConsistency');if(cs)cs.checked=vf.characterConsistency!==false;
    currentRefImage=vf.referenceImage||'';
    renderRefPreview();
    var ve=document.getElementById('vidExtra');if(ve)ve.value=vf.additionalInstructions||'';
  }
  currentCharacters=d.characters||[];
  currentScenes=d.scenes||[];
  var was=d.stepNow||1;
  if(currentStory){studioMarkDone(1);studioMarkDone(2);}
  if((videoStarted||was>=3)&&currentStory){studioMarkDone(2);}
  if(currentCharacters.length||currentScenes.length){studioMarkDone(3);studioMarkDone(4);}
  if(currentScenes.length||currentCharacters.length)renderFinalResult();
  // Restore mode (main vs video branch)
  if(d.mode==='video'&&(videoStarted||was>=3)&&currentStory){ST_MODE='video';}
  // Resolve target step
  var target=was;
  var tm=stMeta(target);
  if(!tm||tm.lock||!stAllowed(target)){
    var steps=stModeSteps();
    target=steps[steps.length-1].n;
    if(stMeta(target).lock)target=steps[steps.length-2].n;
    if(!stAllowed(target))target=1;
  }
  stCur=target;
  stShow(target);
  updateGenBtn();
}
window.studioRestoreDraft=studioRestoreDraft;

// ===================== Auto Save (Refresh ပြီးနောက် Data မပျောက်စေရ) =====================
function autoSave(){
  try{
    var data=studioCollectDraft();
    localStorage.setItem('aics_draft_story',JSON.stringify({step:window.studioCur?window.studioCur():1,data:data,savedAt:new Date().toISOString()}));
  }catch(e){}
}
function autoSaveImgCache(){
  try{localStorage.setItem('aics_draft_story_imgcache',JSON.stringify(imgCache));}catch(e){}
}

// ============================================================
// Branch Stepper State Machine (Main + Video Branch)
// Main: 1,2 | Video Branch: 3,4 (AI Processing Step များ မရှိ — loading က Result အတွင်း)
// Branch ဝင်လျှင် Main Stepper ကို မဖျောက်ဘဲ ဆက်ပေါင်းပြသည်
// ============================================================
var ST_MODE='main';
var stCur=1;
var stDone={};
var ST_STEPS={
  main:[
    { n:1, label:'01 ဇာတ်လမ်းအချက်အလက်' },
    { n:2, label:'02 ဇာတ်လမ်းရလဒ်', req:[1] }
  ],
  video:[
    { n:3, label:'01 Video ပြင်ဆင်ရန်', req:[2] },
    { n:4, label:'02 နောက်ဆုံးရလဒ်', req:[3] }
  ]
};
function stMeta(n){
  var modes=['main','video'];
  for(var m=0;m<modes.length;m++){var s=ST_STEPS[modes[m]];for(var i=0;i<s.length;i++)if(s[i].n===n)return s[i];}
  return null;
}
function stModeSteps(){return ST_STEPS[ST_MODE]||ST_STEPS.main;}
// Main + Branch = Stepper တစ်ခုတည်း — Branch ဝင်လျှင် Main steps ကို မဖျောက်ဘဲ ဆက်ပေါင်းပြသည်
function stVisibleSteps(){
  var main=ST_STEPS.main||[];
  if(ST_MODE==='main'||!ST_STEPS[ST_MODE])return main.slice();
  return main.concat(ST_STEPS[ST_MODE]);
}
function stAllowed(n){
  if(stDone[n])return true;
  var m=stMeta(n);if(!m)return false;
  var req=m.req||[];
  if(req.length===0)return true;
  for(var i=0;i<req.length;i++)if(!stDone[req[i]])return false;
  return true;
}
function stNav(n){
  var m=stMeta(n);if(!m)return;
  if(m.lock){showToastMsg('ဤအဆင့်သည် AI ဆောင်ရွက်နေချိန် အဆင့်ဖြစ်ပြီး ကိုယ်တိုင် ရွေးချယ်၍ မရပါ');return;}
  if(!stAllowed(n)){showToastMsg('အရင်အဆင့်များ ပြီးမှ ဤအဆင့်သို့ ဆက်သွားနိုင်ပါသည်');return;}
  stGoForce(n);
}
function stGoForce(n){stCur=n;stShow(n);}
function stMarkDone(n){stDone[n]=true;stUpdateStepper();}
function stUnmarkDone(n){stDone[n]=false;stUpdateStepper();}
function stShow(n){
  var steps=document.querySelectorAll('.aics-step');
  for(var i=0;i<steps.length;i++){
    var ds=steps[i].getAttribute('data-step');
    steps[i].classList.toggle('active',parseInt(ds,10)===n);
  }
  var w=document.getElementById('aicsWork');if(w)w.scrollTop=0;
  stUpdateStepper();
  if(window.studioOnStep){try{window.studioOnStep(n);}catch(e){}}
}
function stUpdateStepper(){
  var btns=document.querySelectorAll('.aics-step-btn');
  for(var i=0;i<btns.length;i++){
    var n=parseInt(btns[i].getAttribute('data-step'),10);
    var m=stMeta(n);
    btns[i].classList.remove('active','done','todo');
    if(n===stCur)btns[i].classList.add('active');
    else if(stDone[n])btns[i].classList.add('done');
    else if(!stAllowed(n)||(m&&m.lock))btns[i].classList.add('todo');
  }
  if(window.studioScrollActiveStep)window.studioScrollActiveStep(true);
}
function stRenderStepper(){
  var c=document.getElementById('aicsStepper');if(!c)return;
  var steps=stVisibleSteps();
  var html='<div class="aics-stepper-inner">';
  for(var i=0;i<steps.length;i++){
    var s=steps[i];
    var label=((i+1<10)?'0':'')+(i+1)+' '+String(s.label).replace(/^\\d+\\s*/,'');
    html+='<button class="aics-step-btn" data-step="'+s.n+'" onclick="stNav('+s.n+')">'+
      '<span class="aics-step-txt"><span class="aics-step-label">'+label+'</span></span>'+
      '<span class="aics-step-loading"><span class="aics-step-spinner"></span>'+(s.loading||'ဖန်တီးနေသည်...')+'</span></button>';
    if(i<steps.length-1)html+='<span class="aics-step-link"></span>';
  }
  html+='</div>';
  c.innerHTML=html;
  stUpdateStepper();
}
function stSetMode(mode){ST_MODE=mode;stRenderStepper();}
// Shell globals များကို mode-aware versions နဲ့ override
window.studioGoStep=stNav;
window.studioForceGoStep=stGoForce;
window.studioMarkDone=stMarkDone;
window.studioUnmarkDone=stUnmarkDone;
window.studioCur=function(){return stCur;};
// Boot — Shell ပြီးမှ Stepper ကို ကိုယ်ပိုင် Branch Stepper ဖြင့် ပြန်ဆောက်သည်
function stBoot(){
  stRenderStepper();
  stShow(stCur);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',stBoot);
else stBoot();
</script>
</body>
</html>`;
