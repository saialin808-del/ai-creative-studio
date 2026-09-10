// AI Creative Studio — Short Studio Frontend (Phase 5 + Master Instruction Phase 7)
// Workflow: Create → Script → Scenes → Edit → Result
// Studio Isolation: ဤ File သည် Short Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Shared: renderSidebar / sidebarScript / renderStudioShell (frontend/shared.js)
// ⚠️ API Contract / Business Logic မပြောင်းပါ — UI အခွံသာ ပြောင်းပါသည်။

import { renderSidebar, sidebarScript, renderStudioShell } from './shared.js';

const STEPS = [
  { label: 'Create', sub: 'Idea & type' },
  { label: 'Script', sub: 'Generate & revise', req: [] },
  { label: 'Scenes', sub: 'Video plan', req: [] },
  { label: 'Edit', sub: 'Fine-tune scenes', req: [3] },
  { label: 'Result', sub: 'Copy & save', req: [3] },
];

const STEP1_HTML = `
<div class="aics-step" data-step="1">
<div class="card">
<div class="card-title">&#127916; Short Script — Create</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">Type ရွေးပြီး အောက်ကနေရာလေးများကို ဖြည့်ရေးပါ — TikTok/Reels/Shorts အတွက် Script ဖန်တီးပေးပါမယ်။</p>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>ရှော့တ် အမျိုးအစား</label>
<select id="typeSel1" onchange="selectedType1=this.value;">
<option value="1" selected>Short Video (Free)</option>
<option value="2">Type 2 (Pro)</option>
<option value="3">Type 3 (Pro)</option>
<option value="4">Type 4 (Pro)</option>
<option value="5">Type 5 (Pro)</option>
</select>
</div>
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>ဘယ်သူအတွက်</label>
<select id="audSel" onchange="window.aichAud=this.value;">
<option>လူတိုင်း</option>
<option>လူငယ်</option>
<option>လူကြီး</option>
<option>ကလေး</option></select>
</div>
</div>
<div id="ideaFields"></div>
</div>
</div>`;

const STEP2_HTML = `
<div class="aics-step" data-step="2">
<div class="card">
<div class="card-title">&#128221; Script ဖန်တီးရန်</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">Generate Short နှိပ်ပါ — ရလာတဲ့ Script ကို ဒီနေရာမှာ တိုက်ရိုက် ပြင်နိုင်ပါတယ်။</p>
<div class="loading" id="genLoading"><div class="spinner"></div> AI Short Script ရေးသားနေပါသည်...</div>
<div class="error-box" id="genError"></div>
<textarea class="result-textarea" id="shortResult" placeholder="Short Script ဒီနေရာမှာ ပေါ်လာပါမယ် — တိုက်ရိုက် ပြင်နိုင်ပါတယ်"></textarea>
<p class="result-hint">&#9999; ဒီနေရာမှာ နှိပ်ပြီး ကိုယ်တိုင် ပြင်ဆင်နိုင်ပါတယ်</p>
<div class="action-row" id="scriptActions" style="display:none;">
<button class="btn btn-success" onclick="copyResult()">&#128203; Copy Short</button>
<button class="btn btn-purple" onclick="saveToCreations()">&#128190; Save to My Creations</button>
<button class="btn btn-orange" onclick="transferToVideo()">&#127909; ဗီဒီယို ဖန်တီးရန် (Scenes သို့)</button>
</div>
<div class="revise-section" id="reviseSection" style="display:none;">
<div class="card-title">&#129302; AI ကို ဆက်ညွှန်ကြားရန် (Revise)</div>
<div class="revise-history" id="reviseHistory"></div>
<div class="revise-input-row">
<textarea id="feedbackInput" placeholder="ဥပမာ — Hook ကို ပိုပြင်းထန်အောင် ပြင်ပေးပါ"></textarea>
<button class="btn btn-secondary" id="reviseBtn" onclick="reviseShort()">&#128260; ပြင်ပါ</button>
</div>
<div class="loading" id="revLoading"><div class="spinner"></div> ပြင်ဆင်နေပါသည်...</div>
<div class="error-box" id="revError"></div>
</div>
</div>
</div>`;

const STEP3_HTML = `
<div class="aics-step" data-step="3">
<div class="card">
<div class="card-title">&#127909; Scenes — Video Plan ဖန်တီးရန်</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">Type ရွေးပြီး Idea/Script ထည့်ပါ — Scene အလိုက်၊ Character အလိုက် ခွဲထားသော Video Production Prompt များ ဖန်တီးပေးပါမယ်။</p>
<div class="type-chips" id="typeChips2"></div>
<div class="form-group">
<label>Idea / Script</label>
<textarea id="videoIdea" placeholder="ဥပမာ — ဒါရိုက်ခိုင်းလိုတဲ့ Script/Idea ကို ထည့်ပါ" style="min-height:140px;"></textarea>
</div>
<div class="ref-upload-area">
<label>&#128444; Reference ပုံများ ပူးတွဲရန် (ချန်ထားလို့ရသည်)</label>
<input type="file" id="refImageInput" accept="image/*" multiple onchange="onRefImageSelected()">
<p class="ref-hint">အများဆုံး ၅ ပုံအထိ Upload တင်နိုင်ပါတယ် (ပုံတစ်ပုံချင်းစီ Max 5MB) — Character/Scene ပုံများ တင်ထားရင် AI က ထိုပုံများကို ကိုးကားပြီး ဒီပုံနှင့် ကိုက်ညီသော Reference Prompt ရေးပေးပါမယ်။</p>
<div class="ref-preview" id="refPreview"></div>
</div>
<div class="loading" id="videoLoading"><div class="spinner"></div> AI Video Plan ရေးသားနေပါသည် (Scene/Character အလိုက် ခွဲနေပါသည်)...</div>
<div class="error-box" id="videoError"></div>
<div class="fallback-note" id="fallbackNote">&#9888; CMS ပုံစံအတိုင်း Scene/Character အပြည့်အစုံ မခွဲနိုင်ခဲ့ပါ — AI ရဲ့ Raw Output ကို Scene 1 အနေနဲ့ ပြထားပါသည်။</div>
</div>
<div id="videoResultSection" style="display:none;">
<div class="section-block">
<div class="section-title"><span class="section-badge">01</span> &#128100; CHARACTER REFERENCE PROMPT</div>
<div id="characterArea"><div class="empty-note">Generate နှိပ်ပြီးရင် ဒီနေရာမှာ Character (ရှိလျှင်) ပေါ်ပါမယ်</div></div>
</div>
<div class="section-block">
<div class="section-title"><span class="section-badge">02</span> &#127757;&#127916; SCENE PROMPT (Environment &amp; Video)</div>
<div id="sceneArea"><div class="empty-note">Generate နှိပ်ပြီးရင် ဒီနေရာမှာ Scene တစ်ခုချင်းစီ ပေါ်ပါမယ်</div></div>
</div>
<p style="color:var(--text3);font-size:12px;margin-top:8px;">&#9888; Text Prompt များသာ Save/Copy ဖြစ်ပါမည် — Image များကို &#128190; Save Image ခလုတ်ကနေ တစ်ပုံချင်း Download ချပေးပါ</p>
</div>
</div>
</div>`;

const STEP4_HTML = `
<div class="aics-step" data-step="4">
<div class="card">
<div class="card-title">&#9999; Edit — Scene အလိုက် ပြင်ဆင်ရန်</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">အောက်က Scene တစ်ခုချင်းစီရဲ့ Video Prompt ကို တိုက်ရိုက် ပြင်နိုင်ပါတယ်။ ပြင်ပြီးရင် Result အဆင့်မှာ Copy/Save လုပ်ပါ။</p>
<div id="editCharArea"></div>
<div id="editSceneArea"></div>
</div>
</div>`;

const STEP5_HTML = `
<div class="aics-step" data-step="5">
<div class="card">
<div class="card-title">&#127894; Result</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">ညာဘက် Preview မှာ နောက်ဆုံး Prompt အားလုံးကို ကြည့်ပြီး အောက်က ခလုတ်များနဲ့ Copy / Save လုပ်နိုင်ပါတယ်။</p>
<div class="action-row">
<button class="btn btn-success" onclick="copyAllPrompts()">&#128203; Copy All</button>
<button class="btn btn-purple" onclick="saveAllToCreations()">&#128190; Save All to My Creations</button>
<button class="btn btn-orange" onclick="studioGoStep(4)">&#9999; Edit ပြန်လုပ်ရန်</button>
</div>
</div>
</div>`;

const STEPS_HTML = STEP1_HTML + STEP2_HTML + STEP3_HTML + STEP4_HTML + STEP5_HTML;

export const SHORT_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Short Studio — AI Creative Studio</title>
<style>
:root{--bg:#080c18;--bg-card:#0d1424;--bg-card2:#111a2e;--bg-input:#0a1020;--border:rgba(0,229,255,0.15);--border-strong:rgba(0,229,255,0.35);--cyan:#00e5ff;--purple:#7b5cff;--text:#e8ecf4;--text2:#8b95a8;--text3:#5a6478;--success:#00e676;--error:#ff5252;--warn:#ffc107;--orange:#ff9f2b}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans Myanmar','Roboto','Segoe UI',Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:14px;line-height:1.6}
a{color:var(--cyan);text-decoration:none}
.header{background:linear-gradient(135deg,#0a1628,#0d1f3c);border-bottom:1px solid var(--border);padding:12px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.header-left{display:flex;align-items:center;gap:12px}
.logo{font-size:18px;font-weight:700;background:linear-gradient(90deg,var(--cyan),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.header-right{display:flex;align-items:center;gap:12px;font-size:13px}
.user-email{color:var(--text2)}
.plan-badge{background:linear-gradient(135deg,var(--purple),var(--cyan));color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
.menu-btn{display:none;background:none;border:1px solid var(--border);color:var(--cyan);padding:8px 12px;border-radius:8px;cursor:pointer;font-size:18px}
.layout{display:flex;min-height:calc(100vh - 57px)}
.sidebar{width:220px;background:#0d1425;border-radius:16px;margin:14px 12px;padding:14px 12px;flex-shrink:0;display:flex;flex-direction:column;}
.brand{margin-bottom:18px;padding:0 4px;}
.brand-title{font-weight:800;font-size:17px;letter-spacing:.5px;background:linear-gradient(90deg,var(--purple),var(--cyan));-webkit-background-clip:text;background-clip:text;color:transparent;}
.nav-label{font-size:11px;color:var(--text3);letter-spacing:1.5px;margin:16px 0 6px 8px;text-transform:uppercase;}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;color:#c6cede;text-decoration:none;cursor:pointer;font-size:13.5px;margin-bottom:2px;border:1px solid transparent;transition:all .2s;}
.nav-item:hover{background:#161d30;}
.nav-item.active{background:linear-gradient(90deg,rgba(123,92,255,.18),rgba(0,229,255,.08));color:#fff;border:1px solid var(--purple);box-shadow:0 0 14px rgba(123,92,255,.35);}
.nav-icon-circle{width:30px;height:30px;border-radius:9px;background:#1a2138;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
.sidebar-bottom{margin-top:auto;padding-top:14px;border-top:1px solid var(--border);}
.license-badge{display:inline-block;font-size:11px;padding:4px 10px;border-radius:20px;margin-bottom:10px;background:#333;color:#aaa;}
.license-badge.pro{background:#103a2a;color:var(--success);box-shadow:0 0 10px rgba(43,255,159,.25);}
.side-email{font-size:11.5px;color:var(--text3);margin-bottom:8px;word-break:break-all;}
.side-btn{display:flex;align-items:center;gap:8px;width:100%;text-align:left;padding:8px 10px;border-radius:10px;background:#161d30;color:#c6cede;border:1px solid var(--border);font-size:12.5px;cursor:pointer;margin-bottom:5px;text-decoration:none;transition:all .2s;box-sizing:border-box;}
.side-btn:hover{background:#1e2740;border-color:var(--cyan);}
.main{flex:1;padding:24px;max-width:960px;margin:0 auto;width:100%}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px}
.card-title{font-size:15px;font-weight:600;color:var(--cyan);margin-bottom:14px;display:flex;align-items:center;gap:8px}
label{display:block;font-size:12.5px;color:var(--text2);margin-bottom:6px;font-weight:500}
input,textarea,select{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:14px;padding:11px 14px;color:var(--text);font-size:14px;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
input:focus,textarea:focus,select:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 2px rgba(0,229,255,.1)}
textarea{resize:vertical;min-height:90px}
select{cursor:pointer}
select option{background:var(--bg-card);color:var(--text)}
.form-group{margin-bottom:16px}
.form-row{display:flex;gap:14px;flex-wrap:wrap}
.form-row .form-group{flex:1;min-width:200px}
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
.type-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.type-chip{padding:8px 16px;background:var(--bg-card2);border:2px solid var(--border);border-radius:8px;color:var(--text2);cursor:pointer;font-size:13px;font-family:inherit;transition:all .2s;min-height:40px}
.type-chip:hover{border-color:var(--cyan);color:var(--text)}
.type-chip.active{border-color:var(--cyan);background:rgba(0,229,255,.1);color:var(--cyan);font-weight:600}
.type-chip.locked{opacity:.45;cursor:not-allowed}
.type-chip.locked:hover{border-color:var(--border);color:var(--text2)}
.result-textarea{width:100%;min-height:200px;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:14px;color:var(--text);font-size:14px;font-family:inherit;line-height:1.7;resize:vertical}
.result-textarea:focus{outline:none;border-color:var(--cyan)}
.result-hint{color:var(--text3);font-size:12px;margin-top:6px;font-style:italic}
.action-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.revise-section{margin-top:20px;padding-top:20px;border-top:1px solid var(--border)}
.revise-history{max-height:240px;overflow-y:auto;background:var(--bg-input);border-radius:8px;padding:12px;margin-bottom:12px}
.revise-msg{padding:8px 12px;border-radius:8px;margin-bottom:8px;font-size:13px;max-width:85%;line-height:1.5}
.revise-msg.user{background:rgba(123,92,255,.15);margin-left:auto;text-align:right}
.revise-msg.ai{background:var(--bg-card2);color:var(--success)}
.revise-input-row{display:flex;gap:10px;align-items:flex-end}
.revise-input-row textarea{flex:1;min-height:60px}
.ref-upload-area{margin-top:14px}
.ref-upload-area input[type="file"]{padding:10px;background:var(--bg-input);color:var(--text2);border:1px dashed var(--border-strong);border-radius:8px;font-size:13px}
.ref-hint{color:var(--text3);font-size:12px;margin-top:6px;line-height:1.5}
.ref-preview{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
.ref-thumb{position:relative;width:72px;height:72px}
.ref-thumb img{width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--border);display:block}
.ref-thumb .remove-x{position:absolute;top:-7px;right:-7px;width:24px;height:24px;border-radius:50%;background:var(--error);color:#fff;border:none;font-size:13px;line-height:24px;text-align:center;cursor:pointer;padding:0;min-height:24px;min-width:24px}
.fallback-note{display:none;background:rgba(255,193,7,.1);border:1px solid rgba(255,193,7,.3);color:var(--warn);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:14px;line-height:1.5}
.fallback-note.show{display:block}
.section-block{margin-top:24px}
.section-title{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:700;color:var(--text);margin-bottom:14px}
.section-badge{background:var(--error);color:#fff;font-weight:700;padding:3px 11px;border-radius:6px;font-size:13px}
.empty-note{color:var(--text3);font-size:13px;padding:16px;background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;text-align:center}
.scene-group{margin-bottom:22px}
.scene-group-title{color:var(--cyan);font-weight:700;font-size:15px;padding-bottom:8px;margin-bottom:12px;border-bottom:1px solid var(--border)}
.scene-card,.character-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px}
.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.card-header span{font-weight:700;color:var(--cyan);font-size:14px}
.card-subtext{color:var(--text2);font-size:13px;margin-bottom:8px}
.card-label{color:var(--text2);font-size:12.5px;margin-top:10px;margin-bottom:5px;font-weight:500}
.card-text{white-space:pre-wrap;line-height:1.6;background:var(--bg-input);padding:12px 14px;border-radius:8px;font-size:13.5px;color:var(--text);min-height:24px}
.card-textarea{width:100%;background:var(--bg-input);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:12px 14px;font-size:13.5px;font-family:inherit;line-height:1.6;outline:none;resize:vertical;min-height:60px}
.card-textarea:focus{border-color:var(--cyan)}
.mini-btn{padding:6px 14px;font-size:12px;background:var(--success);color:#080c18;border:none;border-radius:6px;cursor:pointer;font-family:inherit;font-weight:600;min-height:32px}
.gen-img-btn{margin-top:12px;padding:8px 16px;font-size:13px;background:var(--orange);color:#080c18;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-weight:600;display:block;min-height:40px}
.gen-img-btn:disabled{opacity:.5;cursor:not-allowed}
.image-result-area img{width:100%;border-radius:8px;margin-top:10px}
.image-result-area a{display:inline-block;margin-top:8px}
.loading{display:none;align-items:center;gap:10px;color:var(--cyan);font-size:13px;padding:12px 0}
.loading.show{display:flex}
.spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--cyan);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.error-box{display:none;background:rgba(255,82,82,.1);border:1px solid rgba(255,82,82,.3);color:var(--error);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px}
.error-box.show{display:block}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:var(--bg-card2);border:1px solid var(--success);color:var(--success);padding:10px 20px;border-radius:8px;font-size:13px;z-index:1000;transition:transform .3s}
.toast.show{transform:translateX(-50%) translateY(0)}
.toast.error{border-color:var(--error);color:var(--error)}
.pv-pre{white-space:pre-wrap;line-height:1.6;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:12.5px;color:var(--text2);max-height:420px;overflow-y:auto}
@media(max-width:768px){.menu-btn{display:block}.sidebar{position:fixed;left:-260px;top:57px;bottom:0;z-index:99;transition:left .3s;box-shadow:4px 0 20px rgba(0,0,0,.5)}.sidebar.open{left:0}.main{padding:16px}.header-right .user-email{display:none}.form-row{flex-direction:column}.revise-input-row{flex-direction:column;align-items:stretch}.action-row{flex-direction:column}.action-row .btn{width:100%}}
</style>
</head>
<body>
<div id="loginView" class="aics-login-overlay" style="display:none;"><div class="aics-login-box"><h2>Login လုပ်ရန် လိုအပ်ပါသည်</h2><p>Short Studio ကို အသုံးပြုရန် Google နဲ့ Login ဝင်ပါ။</p><a href="/api/auth/login?next=/app/short" class="btn btn-primary">Google နဲ့ Login</a></div></div>
${renderStudioShell({
  id: 'short',
  activeId: 'short',
  nameMy: 'ရှော့တ် Studio',
  desc: 'Short videos from script to scenes',
  icon: '🎬',
  modelCat: 'text',
  steps: STEPS,
  content: STEPS_HTML,
})}
${sidebarScript()}
<div class="toast" id="toast">&#9989; အောင်မြင်ပါသည်</div>
<script>
var token=localStorage.getItem('aics_token')||'';
var userEmail=localStorage.getItem('aics_email')||'';
var userPlan=localStorage.getItem('aics_plan')||'FREE';
var isPro=(userPlan==='PRO');

var FIELD_CONFIG=[
  {label:"Video ရဲ့ အကြောင်းအရာ",placeholder:"ဥပမာ — ဘာအကြောင်း Video ရေးချင်ပါသလဲ?",required:true,multiline:true},
  {label:"Platform",placeholder:"ဥပမာ — TikTok / Instagram Reels / YouTube Shorts"},
  {label:"Video ကြာချိန်",placeholder:"ဥပမာ — ၁၅ စက္ကန့် / ၃၀ စက္ကန့် / ၁ မိနစ်"},
  {label:"ဘယ်သူတွေအတွက်လဲ",placeholder:"ဥပမာ — လူငယ်များ / စီးပွားရေးလုပ်ငန်းရှင်များ / အခြား"},
  {label:"အသံစံ/Tone",placeholder:"ဥပမာ — ဟာသ / အရှိန်မြှင့် / ရိုးရှင်းရှင်းလင်း / အခြား"}
];
var MAX_REF_IMAGES=5;
var selectedType1='1';
var selectedType2='1';
var currentShort='';
var currentShortIdea='';
var currentScenes=[];
var currentCharacters=[];
var currentVideoIdea='';
var refImages=[];

(function init(){
  if(!token){document.getElementById('loginView').style.display='flex';document.getElementById('aicsApp').style.display='none';return;}
  var _ue=document.getElementById('userEmail');if(_ue)_ue.textContent=userEmail||'—';
  var _pb=document.getElementById('planBadge');if(_pb)_pb.textContent=userPlan||'FREE';
  buildTypeChips('typeChips2',2);
  buildIdeaFields();
})();

function setTypeChip(containerId,val){
  var container=document.getElementById(containerId);
  if(!container)return;
  var chips=container.querySelectorAll('.type-chip');
  for(var i=0;i<chips.length;i++){
    var t=chips[i].getAttribute('data-v');
    if(t===String(val))chips[i].classList.add('active');
    else chips[i].classList.remove('active');
  }
}

function buildTypeChips(containerId,tabNum){
  var container=document.getElementById(containerId);
  if(!container)return;
  var types=[
    {v:'1',label:'Short Video (Free)',pro:false},
    {v:'2',label:'Type 2 (Pro)',pro:true},
    {v:'3',label:'Type 3 (Pro)',pro:true},
    {v:'4',label:'Type 4 (Pro)',pro:true},
    {v:'5',label:'Type 5 (Pro)',pro:true}
  ];
  types.forEach(function(t){
    var chip=document.createElement('button');
    chip.className='type-chip'+(t.v==='1'?' active':'')+(t.pro&&!isPro?' locked':'');
    chip.setAttribute('data-v',t.v);
    chip.textContent=(t.pro&&!isPro?'🔒 ':'')+t.label;
    chip.onclick=function(){
      if(t.pro&&!isPro){showToast('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။ Upgrade လိုအပ်ပါသည်။',true);return;}
      var chips=container.querySelectorAll('.type-chip');
      for(var i=0;i<chips.length;i++)chips[i].classList.remove('active');
      chip.classList.add('active');
      if(tabNum===1)selectedType1=t.v;else selectedType2=t.v;
    };
    container.appendChild(chip);
  });
}

function buildIdeaFields(){
  var container=document.getElementById('ideaFields');
  container.innerHTML='';
  FIELD_CONFIG.forEach(function(field,idx){
    var row=document.createElement('div');
    row.className='form-group';
    var label=document.createElement('label');
    label.textContent=field.label+(field.required?' *':'');
    var input;
    if(field.multiline){input=document.createElement('textarea');input.rows=2;}
    else{input=document.createElement('input');input.type='text';}
    input.placeholder=field.placeholder;
    input.id='field_'+idx;
    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  });
}

function collectIdeaText(){
  var lines=[];
  var valid=true;
  FIELD_CONFIG.forEach(function(field,idx){
    var val=document.getElementById('field_'+idx).value.trim();
    if(field.required&&!val)valid=false;
    if(val)lines.push(field.label+': '+val);
  });
  var audEl=document.getElementById('audSel');
  if(audEl&&audEl.value)lines.push('Audience: '+audEl.value);
  return{text:lines.join('\\n'),valid:valid};
}

function apiCall(url,body){
  var s=document.getElementById('aiModelSel');if(s&&s.value)body.model=s.value;
  return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.detail||data.error||'Request failed');return data;});});
}

// ===== Script =====
function generateShort(){
  var collected=collectIdeaText();
  if(!collected.valid){showToast('Video ရဲ့ အကြောင်းအရာ အနည်းဆုံး ဖြည့်ရေးပါ',true);return;}
  if(selectedType1!=='1'&&!isPro){showToast('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။',true);return;}
  window.aichAud=(document.getElementById('audSel')?document.getElementById('audSel').value:'လူတိုင်း');
  setLoading('genLoading',true);
  hideError('genError');
  document.getElementById('scriptActions').style.display='none';
  apiCall('/api/studio/short/generate',{idea:collected.text,type:selectedType1})
    .then(function(data){
      currentShort=data.short||'';
      currentShortIdea=collected.text;
      document.getElementById('shortResult').value=currentShort;
      document.getElementById('scriptActions').style.display='flex';
      document.getElementById('reviseSection').style.display='block';
      document.getElementById('reviseHistory').innerHTML='';
      studioMarkDone(2);
      showToast('✓ Script ပြီးပါပြီ');
    })
    .catch(function(err){showError('genError',err.message);})
    .finally(function(){setLoading('genLoading',false);});
}

function reviseShort(){
  var feedback=document.getElementById('feedbackInput').value.trim();
  if(!feedback){showToast('ဘယ်လိုပြင်ချင်လဲ ရေးပါ',true);return;}
  if(!currentShort){showToast('အရင် Short Script ကို ဖန်တီးပါ',true);return;}
  setLoading('revLoading',true);
  hideError('revError');
  document.getElementById('reviseBtn').disabled=true;
  addHistory('user',feedback);
  apiCall('/api/studio/short/revise',{
    idea:currentShortIdea,
    type:selectedType1,
    currentShort:document.getElementById('shortResult').value,
    instruction:feedback
  })
    .then(function(data){
      currentShort=data.short||'';
      document.getElementById('shortResult').value=currentShort;
      document.getElementById('feedbackInput').value='';
      addHistory('ai','ပြင်ဆင်ပြီးပါပြီ ✓ (အပေါ်က Script ထဲမှာ ကြည့်ပါ)');
    })
    .catch(function(err){showError('revError',err.message);})
    .finally(function(){setLoading('revLoading',false);document.getElementById('reviseBtn').disabled=false;});
}

function addHistory(role,text){
  var div=document.createElement('div');
  div.className='revise-msg '+role;
  div.textContent=text;
  document.getElementById('reviseHistory').appendChild(div);
  var log=document.getElementById('reviseHistory');
  log.scrollTop=log.scrollHeight;
}

function copyResult(){
  var text=document.getElementById('shortResult').value;
  if(!text){showToast('Copy လုပ်ဖို့ Result မရှိသေးပါ',true);return;}
  copyToClipboard(text);
  showToast('✓ Copy ပြီးပါပြီ');
}

function saveToCreations(){
  var resultText=document.getElementById('shortResult').value;
  if(!resultText){showToast('Save လုပ်ဖို့ Result မရှိသေးပါ',true);return;}
  var topic=document.getElementById('field_0').value.trim()||'Short Video';
  var defaultTitle=topic.substring(0,40)+(topic.length>40?'...':'');
  var title=prompt('Creation အမည် ပေးပါ:',defaultTitle);
  if(title===null)return;
  AICS_CREATIONS.save({
    studio:'SHORT',
    type:selectedType1,
    original_prompt:currentShortIdea,
    ai_output:resultText,
    title:title||defaultTitle
  })
    .then(function(){showToast('💾 My Creations ထဲ Save ပြီးပါပြီ');})
    .catch(function(err){showToast('Save မအောင်မြင်ပါ: '+((err&&err.message)||'Error'),true);});
}

function transferToVideo(){
  var shortText=document.getElementById('shortResult').value;
  if(!shortText||!shortText.trim()){showToast('ဗီဒီယို ဖန်တီးရန် Script မရှိသေးပါ။ Script ကနေ Generate အရင်လုပ်ပါ။',true);return;}
  var videoBox=document.getElementById('videoIdea');
  if(videoBox.value&&videoBox.value.trim()!==''){
    if(!confirm('ဗီဒီယို ဖန်တီးရန် Idea Box ထဲမှာ Info ရှိပြီးသားပါ။ အစားထိုးမလား?'))return;
  }
  videoBox.value=shortText;
  studioGoStep(3);
}

// ===== Video Plan =====
function onRefImageSelected(){
  var fileInput=document.getElementById('refImageInput');
  var files=fileInput.files;
  for(var i=0;i<files.length;i++){
    if(refImages.length>=MAX_REF_IMAGES){
      showToast('Reference ပုံ အများဆုံး '+MAX_REF_IMAGES+' ပုံပဲ တင်လို့ရပါတယ်။',true);
      break;
    }
    var file=files[i];
    if(file.size>5*1024*1024){
      showToast("'"+file.name+"' ပုံသည် 5MB ထက် ကျော်နေလို့ ကျော်သွားပါမည်။",true);
      continue;
    }
    addRefImageFile(file);
  }
  fileInput.value='';
}

function addRefImageFile(file){
  var reader=new FileReader();
  reader.onload=function(e){
    refImages.push({
      dataUrl:e.target.result,
      base64:e.target.result.split(',')[1],
      mimeType:file.type
    });
    renderRefPreviews();
  };
  reader.readAsDataURL(file);
}

function renderRefPreviews(){
  var container=document.getElementById('refPreview');
  container.innerHTML='';
  refImages.forEach(function(img,idx){
    var thumb=document.createElement('div');
    thumb.className='ref-thumb';
    var imgEl=document.createElement('img');
    imgEl.src=img.dataUrl;
    var removeBtn=document.createElement('button');
    removeBtn.className='remove-x';
    removeBtn.textContent='✕';
    removeBtn.onclick=function(){removeRefImage(idx);};
    thumb.appendChild(imgEl);
    thumb.appendChild(removeBtn);
    container.appendChild(thumb);
  });
}

function removeRefImage(idx){
  refImages.splice(idx,1);
  renderRefPreviews();
}

function generateVideoPlan(){
  var idea=document.getElementById('videoIdea').value;
  if(!idea||!idea.trim()){showToast('Idea/Script ထည့်ပါ',true);return;}
  currentVideoIdea=idea;
  setLoading('videoLoading',true);
  hideError('videoError');
  document.getElementById('fallbackNote').classList.remove('show');
  var body={idea:idea,type:selectedType2};
  if(refImages.length>0){
    body.images=refImages.map(function(img){return{base64:img.base64,mimeType:img.mimeType};});
  }
  apiCall('/api/studio/short/video',body)
    .then(function(data){
      currentScenes=data.scenes||[];
      currentCharacters=data.characters||[];
      renderCharacters('characterArea');
      renderScenes('sceneArea');
      if(data.rawFallback)document.getElementById('fallbackNote').classList.add('show');
      document.getElementById('videoResultSection').style.display='block';
      studioMarkDone(3);
      showToast('✓ Video Plan ပြီးပါပြီ');
    })
    .catch(function(err){showError('videoError',err.message);})
    .finally(function(){setLoading('videoLoading',false);});
}

function renderCharacters(targetId){
  var area=document.getElementById(targetId);
  if(!area)return;
  area.innerHTML='';
  if(currentCharacters.length===0){
    area.innerHTML='<div class="empty-note">Character Prompt မရှိသေးပါ (Presenter မလိုအပ်တဲ့ Video ဖြစ်နိုင်ပါသည်)</div>';
    return;
  }
  currentCharacters.forEach(function(char,idx){
    var card=document.createElement('div');
    card.className='character-card';
    var header=document.createElement('div');
    header.className='card-header';
    var title=document.createElement('span');
    title.textContent='🧑 CHARACTER '+(idx+1)+' — '+(char.name||'(အမည်မသိ)');
    var copyBtn=document.createElement('button');
    copyBtn.className='mini-btn';
    copyBtn.textContent='📋 Copy';
    copyBtn.onclick=function(){copyToClipboard(char.prompt||'');showToast('✓ Copy ပြီးပါပြီ');};
    header.appendChild(title);
    header.appendChild(copyBtn);
    var subtext=document.createElement('div');
    subtext.className='card-subtext';
    subtext.textContent='Role: '+(char.role||'-');
    var label=document.createElement('div');
    label.className='card-label';
    label.textContent='Character Reference Prompt:';
    var text=document.createElement('div');
    text.className='card-text';
    text.textContent=char.prompt||'(မရှိပါ)';
    var imgBtn=document.createElement('button');
    imgBtn.className='gen-img-btn';
    imgBtn.textContent='🎨 Character Reference Image ဖန်တီးရန်';
    imgBtn.onclick=function(){generateCardImage(char.prompt,'charImg_'+targetId+'_'+idx,imgBtn);};
    var imgContainer=document.createElement('div');
    imgContainer.className='image-result-area';
    imgContainer.id='charImg_'+targetId+'_'+idx;
    card.appendChild(header);
    card.appendChild(subtext);
    card.appendChild(label);
    card.appendChild(text);
    card.appendChild(imgBtn);
    card.appendChild(imgContainer);
    area.appendChild(card);
  });
}

function renderScenes(targetId){
  var area=document.getElementById(targetId);
  if(!area)return;
  area.innerHTML='';
  if(currentScenes.length===0){
    area.innerHTML='<div class="empty-note">Scene Prompt မရှိသေးပါ</div>';
    return;
  }
  currentScenes.forEach(function(scene,idx){
    var group=document.createElement('div');
    group.className='scene-group';
    var groupTitle=document.createElement('div');
    groupTitle.className='scene-group-title';
    groupTitle.textContent='SCENE '+scene.number;
    group.appendChild(groupTitle);

    var eCard=document.createElement('div');
    eCard.className='scene-card';
    var eHeader=document.createElement('div');
    eHeader.className='card-header';
    var eTitle=document.createElement('span');
    eTitle.textContent='🌍 Environment Reference Prompt';
    var eCopyBtn=document.createElement('button');
    eCopyBtn.className='mini-btn';
    eCopyBtn.textContent='📋 Copy';
    eCopyBtn.onclick=function(){copyToClipboard(scene.environmentPrompt||'');showToast('✓ Copy ပြီးပါပြီ');};
    eHeader.appendChild(eTitle);
    eHeader.appendChild(eCopyBtn);
    var eText=document.createElement('div');
    eText.className='card-text';
    eText.textContent=scene.environmentPrompt||'(မရှိပါ)';
    var eImgBtn=document.createElement('button');
    eImgBtn.className='gen-img-btn';
    eImgBtn.textContent='🎨 Environment Reference Image ဖန်တီးရန်';
    eImgBtn.onclick=function(){generateCardImage(scene.environmentPrompt,'envImg_'+targetId+'_'+idx,eImgBtn);};
    var eImgContainer=document.createElement('div');
    eImgContainer.className='image-result-area';
    eImgContainer.id='envImg_'+targetId+'_'+idx;
    eCard.appendChild(eHeader);
    eCard.appendChild(eText);
    eCard.appendChild(eImgBtn);
    eCard.appendChild(eImgContainer);
    group.appendChild(eCard);

    var vCard=document.createElement('div');
    vCard.className='scene-card';
    var vHeader=document.createElement('div');
    vHeader.className='card-header';
    var vTitle=document.createElement('span');
    vTitle.textContent='🎬 Video Prompt';
    var vCopyBtn=document.createElement('button');
    vCopyBtn.className='mini-btn';
    vCopyBtn.textContent='📋 Copy';
    vCopyBtn.onclick=function(){copyToClipboard(vTextarea.value);showToast('✓ Copy ပြီးပါပြီ');};
    vHeader.appendChild(vTitle);
    vHeader.appendChild(vCopyBtn);
    var vTextarea=document.createElement('textarea');
    vTextarea.className='card-textarea';
    vTextarea.value=scene.videoPrompt||'';
    vTextarea.addEventListener('input',function(){currentScenes[idx].videoPrompt=vTextarea.value;});
    vCard.appendChild(vHeader);
    vCard.appendChild(vTextarea);
    group.appendChild(vCard);

    area.appendChild(group);
  });
}

function generateCardImage(promptText,containerId,btnEl){
  if(!promptText||!promptText.trim()){showToast('Prompt Text မရှိပါ',true);return;}
  var container=document.getElementById(containerId);
  btnEl.disabled=true;
  var originalLabel=btnEl.textContent;
  btnEl.textContent='ပုံဖန်တီးနေပါသည်... (မိနစ်အနည်းငယ် ကြာနိုင်)';
  container.innerHTML='';
  apiCall('/api/studio/short/video-image',{prompt:promptText})
    .then(function(data){
      btnEl.disabled=false;
      btnEl.textContent=originalLabel;
      var dataUri='data:'+data.mimeType+';base64,'+data.data;
      var img=document.createElement('img');
      img.src=dataUri;
      var link=document.createElement('a');
      link.href=dataUri;
      link.download='short_video_reference.png';
      var dlBtn=document.createElement('button');
      dlBtn.className='mini-btn';
      dlBtn.style.background='var(--warn)';
      dlBtn.textContent='💾 Save Image';
      link.appendChild(dlBtn);
      container.appendChild(img);
      container.appendChild(document.createElement('br'));
      container.appendChild(link);
    })
    .catch(function(err){
      btnEl.disabled=false;
      btnEl.textContent=originalLabel;
      container.innerHTML='<div class="empty-note">Error: '+err.message+'</div>';
      showToast('ပုံဖန်တီးမှု မအောင်မြင်ပါ: '+err.message,true);
    });
}

function buildCombinedText(){
  var combined='🧑 CHARACTER REFERENCE PROMPTS\\n\\n';
  currentCharacters.forEach(function(char,idx){
    combined+='CHARACTER '+(idx+1)+'\\n';
    combined+='----------------------\\n\\n';
    combined+='Name: '+(char.name||'-')+'\\n';
    combined+='Role: '+(char.role||'-')+'\\n\\n';
    combined+='Character Reference Prompt:\\n'+(char.prompt||'-')+'\\n\\n';
    combined+='======================\\n\\n';
  });
  combined+='\\n🌍🎬 SCENE PROMPTS (Environment & Video)\\n\\n';
  currentScenes.forEach(function(scene){
    combined+='SCENE '+scene.number+'\\n';
    combined+='----------------------\\n\\n';
    combined+='Environment Prompt:\\n'+(scene.environmentPrompt||'-')+'\\n\\n';
    combined+='----------------------\\n\\n';
    combined+='Video Prompt:\\n'+(scene.videoPrompt||'-')+'\\n\\n';
    combined+='======================\\n\\n';
  });
  return combined;
}

function copyAllPrompts(){
  if(currentScenes.length===0&&currentCharacters.length===0){
    showToast('Copy လုပ်ဖို့ Result မရှိသေးပါ။ Generate အရင်လုပ်ပါ။',true);return;
  }
  copyToClipboard(buildCombinedText());
  showToast('✓ Copy ပြီးပါပြီ');
}

function saveAllToCreations(){
  if(currentScenes.length===0&&currentCharacters.length===0){
    showToast('Save လုပ်ဖို့ Result မရှိသေးပါ။ Generate အရင်လုပ်ပါ။',true);return;
  }
  var combined=buildCombinedText();
  var defaultTitle=currentVideoIdea.substring(0,40)+(currentVideoIdea.length>40?'...':'');
  var title=prompt('Creation အမည် ပေးပါ:',defaultTitle);
  if(title===null)return;
  AICS_CREATIONS.save({
    studio:'SHORTVIDEO',
    type:selectedType2,
    original_prompt:currentVideoIdea,
    ai_output:combined,
    title:title||defaultTitle
  })
    .then(function(){showToast('💾 My Creations ထဲ Save ပြီးပါပြီ');})
    .catch(function(err){showToast('Save မအောင်မြင်ပါ: '+((err&&err.message)||'Error'),true);});
}

// ===== Preview renderers =====
function renderScriptPreview(){
  var text=document.getElementById('shortResult').value;
  if(!text||!text.trim()){studioPreview('');return;}
  studioPreview('<div class="aics-pv-label">&#128221; Script</div><div class="pv-pre">'+escapeHtml(text)+'</div>');
}
function renderPlanPreview(){
  if(currentScenes.length===0&&currentCharacters.length===0){studioPreview('');return;}
  studioPreview('<div class="aics-pv-label">&#127909; Video Plan</div><div class="pv-pre">'+escapeHtml(buildCombinedText())+'</div>');
}
function renderEditView(){
  var cArea=document.getElementById('editCharArea');
  var sArea=document.getElementById('editSceneArea');
  if(!cArea)return;
  cArea.innerHTML='';
  sArea.innerHTML='';
  if(currentCharacters.length===0&&currentScenes.length===0){
    cArea.innerHTML='<div class="empty-note">Scene/Character မရှိသေးပါ — အရင် Scenes အဆင့်မှာ Generate Video Plan လုပ်ပါ။</div>';
    return;
  }
  var title=document.createElement('div');
  title.className='section-title';
  title.textContent='🧑 CHARACTER PROMPTS';
  cArea.appendChild(title);
  if(currentCharacters.length===0){
    cArea.innerHTML+='<div class="empty-note">Character Prompt မရှိပါ</div>';
  }else{
    currentCharacters.forEach(function(char,idx){
      var card=document.createElement('div');
      card.className='character-card';
      var header=document.createElement('div');
      header.className='card-header';
      var t=document.createElement('span');
      t.textContent='🧑 CHARACTER '+(idx+1)+' — '+(char.name||'(အမည်မသိ)');
      header.appendChild(t);
      card.appendChild(header);
      var sub=document.createElement('div');
      sub.className='card-subtext';
      sub.textContent='Role: '+(char.role||'-');
      card.appendChild(sub);
      var label=document.createElement('div');
      label.className='card-label';
      label.textContent='Character Reference Prompt:';
      card.appendChild(label);
      var text=document.createElement('textarea');
      text.className='card-textarea';
      text.value=char.prompt||'';
      text.addEventListener('input',function(){currentCharacters[idx].prompt=text.value;});
      card.appendChild(text);
      cArea.appendChild(card);
    });
  }
  var sTitle=document.createElement('div');
  sTitle.className='section-title';
  sTitle.textContent='🌍🎬 SCENE PROMPTS';
  sArea.appendChild(sTitle);
  if(currentScenes.length===0){
    sArea.innerHTML+='<div class="empty-note">Scene Prompt မရှိပါ</div>';
  }else{
    currentScenes.forEach(function(scene,idx){
      var group=document.createElement('div');
      group.className='scene-group';
      var gt=document.createElement('div');
      gt.className='scene-group-title';
      gt.textContent='SCENE '+scene.number;
      group.appendChild(gt);
      var card=document.createElement('div');
      card.className='scene-card';
      var hl=document.createElement('div');
      hl.className='card-label';
      hl.textContent='Environment Prompt:';
      card.appendChild(hl);
      var env=document.createElement('textarea');
      env.className='card-textarea';
      env.value=scene.environmentPrompt||'';
      env.addEventListener('input',function(){currentScenes[idx].environmentPrompt=env.value;});
      card.appendChild(env);
      var hl2=document.createElement('div');
      hl2.className='card-label';
      hl2.textContent='Video Prompt:';
      card.appendChild(hl2);
      var vp=document.createElement('textarea');
      vp.className='card-textarea';
      vp.value=scene.videoPrompt||'';
      vp.addEventListener('input',function(){currentScenes[idx].videoPrompt=vp.value;});
      card.appendChild(vp);
      group.appendChild(card);
      sArea.appendChild(group);
    });
  }
}

// ===== Studio shell hooks =====
function bBack(){return{label:'&#8592; Back',cls:'ghost',fn:function(){studioGoStep(studioCur()-1);}};}
function bReset(){return{label:'Reset',cls:'ghost',fn:studioReset};}
function bSave(){return null;}

function studioOnStep(n){
  if(n===1){
    studioSetActions([bReset(),bSave(),{label:'Next &#8594;',cls:'primary',fn:function(){studioGoStep(2);}}]);
    studioPreview('');
  }else if(n===2){
    studioSetActions([bBack(),bReset(),bSave(),{label:'Generate Short &#10022;',cls:'primary',fn:generateShort}]);
    renderScriptPreview();
  }else if(n===3){
    studioSetActions([bBack(),bReset(),bSave(),{label:'Generate Video Plan &#10022;',cls:'primary',fn:generateVideoPlan}]);
    renderPlanPreview();
  }else if(n===4){
    studioSetActions([bBack(),bReset(),bSave(),{label:'&#128203; Copy All',cls:'ghost',fn:copyAllPrompts},{label:'&#128190; Save All',cls:'purple',fn:saveAllToCreations}]);
    renderEditView();
    renderPlanPreview();
  }else if(n===5){
    studioSetActions([bBack(),bReset(),bSave(),{label:'&#128203; Copy All',cls:'ghost',fn:copyAllPrompts},{label:'&#128190; Save All',cls:'purple',fn:saveAllToCreations}]);
    renderPlanPreview();
  }
}
window.studioOnStep=studioOnStep;

function studioCollectDraft(){
  var fields={};
  for(var i=0;i<5;i++){
    var el=document.getElementById('field_'+i);
    if(el)fields[i]=el.value;
  }
  return{
    fields:fields,
    videoIdea:document.getElementById('videoIdea').value,
    type1:selectedType1,
    type2:selectedType2,
    aud:(document.getElementById('audSel')?document.getElementById('audSel').value:''),
    shortIdea:currentShortIdea,
    short:document.getElementById('shortResult').value,
    videoIdeaSaved:currentVideoIdea,
    scenes:currentScenes,
    characters:currentCharacters,
    refCount:refImages.length
  };
}
window.studioCollectDraft=studioCollectDraft;

function studioRestoreDraft(d){
  if(!d)return;
  if(d.fields){
    for(var k in d.fields){
      var el=document.getElementById('field_'+k);
      if(el)el.value=d.fields[k];
    }
  }
  if(d.type1){selectedType1=d.type1;var ts1=document.getElementById('typeSel1');if(ts1)ts1.value=String(d.type1);}
  var audEl=document.getElementById('audSel');if(audEl&&d.aud)audEl.value=d.aud;if(audEl)window.aichAud=audEl.value;
  if(d.type2){selectedType2=d.type2;setTypeChip('typeChips2',d.type2);}
  if(d.videoIdea)document.getElementById('videoIdea').value=d.videoIdea;
  if(d.short){currentShort=d.short;document.getElementById('shortResult').value=d.short;document.getElementById('scriptActions').style.display='flex';document.getElementById('reviseSection').style.display='block';}
  if(d.shortIdea)currentShortIdea=d.shortIdea;
  if(d.videoIdeaSaved)currentVideoIdea=d.videoIdeaSaved;
  if(d.scenes)currentScenes=d.scenes;
  if(d.characters)currentCharacters=d.characters;
  if((d.scenes&&d.scenes.length)||(d.characters&&d.characters.length)){
    document.getElementById('videoResultSection').style.display='block';
    renderCharacters('characterArea');
    renderScenes('sceneArea');
    studioMarkDone(3);
  }
  if(d.short)studioMarkDone(2);
}
window.studioRestoreDraft=studioRestoreDraft;

function copyToClipboard(text){
  if(navigator.clipboard)navigator.clipboard.writeText(text);
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);}
}
function showToast(msg,isError){
  var t=document.getElementById('toast');
  t.textContent=msg;
  if(isError)t.classList.add('error');else t.classList.remove('error');
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},2500);
}
function setLoading(id,show){var el=document.getElementById(id);if(show)el.classList.add('show');else el.classList.remove('show');}
function showError(id,msg){var el=document.getElementById(id);el.textContent=msg;el.classList.add('show');}
function hideError(id){document.getElementById(id).classList.remove('show');}
function escapeHtml(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
</script>
</body>
</html>`;
