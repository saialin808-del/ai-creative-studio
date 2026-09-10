// AI Creative Studio — Story Studio Frontend (Phase 4 + Master Instruction Phase 5)
// Workflow: Create/Idea → Characters → Story → Scenes → Result
// Studio Isolation: ဤ File သည် Story Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Shared: renderSidebar / sidebarScript / renderStudioShell (frontend/shared.js)
// ⚠️ API Contract / Business Logic မပြောင်းပါ — UI အခွံသာ ပြောင်းပါသည်။

import { renderSidebar, sidebarScript, renderStudioShell } from './shared.js';

const STEPS = [
  { label: 'Create', sub: 'Idea' },
  { label: 'Characters', sub: 'Add characters', req: [1] },
  { label: 'Story', sub: 'Write story', req: [1] },
  { label: 'Scenes', sub: 'Create scenes', req: [2] },
  { label: 'Result', sub: 'Final output', req: [4] },
];

const STEP1_HTML = `
<div class="aics-step" data-step="1">
<div class="card">
<div class="card-title">&#128221; Create Your Story Idea</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">Type ရွေးပြီး အောက်ကနေရာလေးများကို ဖြည့်ရေးပါ — Generate နှိပ်လိုက်ရင် AI က ဇာတ်လမ်းရေးပေးပါမယ်။</p>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>ဇာတ်လမ်းအမျိုးအစား</label>
<select id="storyTypeSel" onchange="selectedStoryType=this.value;">
<option value="1" selected>ဇာတ်လမ်း (Free)</option>
<option value="2">ရုပ်ရှင် (Pro)</option>
<option value="3">ဇာတ်လမ်းတွဲ (Pro)</option>
<option value="4">ဇာတ်လမ်းတို (Pro)</option>
<option value="5">ဟာသဇာတ်လမ်း (Pro)</option>
</select>
</div>
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>ဘယ်သူအတွက်</label>
<select id="audSel" onchange="window.aichAud=this.value;"><option>လူတိုင်း</option><option>လူငယ်</option><option>လူလတ်</option><option>လူကြီး</option><option>ကလေး</option></select>
</div>
</div>
<div class="form-group">
<label>ဇာတ်လမ်းအကြောင်း *</label>
<textarea id="field_0" placeholder="ဥပမာ — ရန်ကုန်မှာ အောင်မြင်မှုရဖို့ ကြိုးစားနေတဲ့ လူငယ်တစ်ယောက်ရဲ့ ခရီး..." style="min-height:110px;"></textarea>
</div>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>Tone</label>
<select id="toneSel"><option>Emotional</option><option>Dark</option><option>Light</option><option>Funny</option><option>Epic</option><option>Mysterious</option></select>
</div>
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>Language</label>
<select id="langSel"><option>မြန်မာဘာသာ</option><option>တရုတ်ဘာသာ</option><option>မြန်မာ + တရုတ်</option></select>
</div>
</div>
<div class="form-group">
<label>Quick Templates</label>
<div id="quickTemplates" class="type-chips" style="margin-bottom:0;"></div>
</div>
<details class="aics-advanced">
<summary>&#9881; Advanced Settings</summary>
<div id="ideaFields" style="margin-top:12px;"></div>
</details>
<div class="loading" id="genLoading"><div class="spinner"></div> AI ဇာတ်လမ်းရေးသားနေပါသည်...</div>
<div class="error-box" id="genError"></div>
</div>
</div>`;

const STEP2_HTML = `
<div class="aics-step" data-step="2">
<div class="card">
<div class="card-title">&#127912; Characters &amp; Scenes</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">ဇာတ်လမ်းကို အခြေခံပြီး Character များနဲ့ Scene အစီအစဉ်ကို AI က ဖန်တီးပေးပါမယ် — ရလဒ်ကို ညာဘက် Preview မှာ ကြည့်နိုင်ပါတယ်။</p>
<div class="type-chips" id="videoTypeChips"></div>
<div class="form-group">
<textarea id="videoIdeaInput" placeholder="ဥပမာ — Character နဲ့ Scene တွေဖန်တီးချင်တဲ့ Story/Idea ကို ထည့်ပါ" style="min-height:120px;"></textarea>
</div>
<button class="btn btn-primary" id="videoGenBtn" onclick="generateVideo()">&#127916; Generate Characters &amp; Scenes</button>
<div class="loading" id="videoLoading"><div class="spinner"></div> AI Video Plan ရေးသားနေပါသည်...</div>
<div class="error-box" id="videoError"></div>
<div class="fallback-note" id="fallbackNote">&#9888; CMS ပုံစံအတိုင်း Scene/Character အပြည့်အစုံ မခွဲနိုင်ခဲ့ပါ — AI ရဲ့ Raw Output ကို Scene 1 အနေနဲ့ ပြထားပါသည်။</div>
</div>
</div>`;

const STEP3_HTML = `
<div class="aics-step" data-step="3">
<div class="card">
<div class="card-title">&#128214; Story</div>
<textarea class="result-textarea" id="storyResult" placeholder="ဇာတ်လမ်း ဒီနေရာမှာ ပေါ်လာပါမယ်..." oninput="onStoryEdit()"></textarea>
<p style="color:var(--text3);font-size:12px;margin-top:6px;font-style:italic;">&#9997; ဒီနေရာမှာ တိုက်ရိုက် နှိပ်ပြီး ကိုယ်တိုင် ပြင်ဆင်နိုင်ပါတယ်</p>
<div class="btn-row">
<button class="btn btn-success" onclick="copyStory()">&#128203; Copy Story</button>
<button class="btn btn-purple" onclick="saveStory()">&#128190; Save to My Creations</button>
</div>
</div>
<div class="card revise-section">
<div class="card-title">&#129302; AI ကို ဆက်ညွှန်ကြားရန် (Revise)</div>
<div class="revise-history" id="reviseHistory"></div>
<div class="revise-input-row">
<input type="text" id="feedbackInput" placeholder="ဥပမာ — နိဂုံးကို ပိုစိတ်ခံစားရအောင်ပြင်ပေးပါ" style="flex:1;" onkeypress="if(event.key==='Enter'){reviseStory();}">
<button class="btn btn-secondary" id="reviseBtn" onclick="reviseStory()">&#128260; ပြင်ပါ</button>
</div>
<div class="loading" id="revLoading"><div class="spinner"></div> ပြင်ဆင်နေပါသည်...</div>
<div class="error-box" id="revError"></div>
</div>
</div>`;

const STEP4_HTML = `
<div class="aics-step" data-step="4">
<div class="card">
<div class="card-title">&#127916; Scenes</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">Scene တစ်ခုချင်းစီကို Environment / Video Prompt များနဲ့ ပြထားပါတယ် — Video Prompt ကို တိုက်ရိုက်ပြင်နိုင်ပြီး Image များကို ဖန်တီးနိုင်ပါတယ်။</p>
<div id="scenesList"></div>
<div id="noScenesHint" class="empty-note">Scene မရှိသေးပါ — "Characters" အဆင့်မှာ Generate Characters &amp; Scenes နှိပ်ပါ</div>
</div>
</div>`;

const STEP5_HTML = `
<div class="aics-step" data-step="5">
<div class="card">
<div class="card-title">&#127894; Result</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">ညာဘက် Preview မှာ နောက်ဆုံးရလဒ် အပြည့်အစုံကို ကြည့်ပြီး Copy / Save / Export လုပ်နိုင်ပါတယ်။</p>
<div class="btn-row">
<button class="btn btn-success" onclick="copyAllResult()">&#128203; Copy All</button>
<button class="btn btn-purple" onclick="saveAllResult()">&#128190; Save to My Creations</button>
<button class="btn btn-orange" onclick="exportResult()">&#128228; Export (.txt)</button>
</div>
</div>
</div>`;

const CONTENT_HTML = STEP1_HTML + STEP2_HTML + STEP3_HTML + STEP4_HTML + STEP5_HTML;

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
input,textarea,select{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:11px 14px;color:var(--text);font-size:14px;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
input:focus,textarea:focus,select:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 2px rgba(0,229,255,.1)}
textarea{resize:vertical;min-height:90px}
select{cursor:pointer}
select option{background:var(--bg-card);color:var(--text)}
.form-group{margin-bottom:16px}
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
.btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.type-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.type-chip{padding:10px 16px;border:1px solid var(--border);border-radius:20px;font-size:13px;cursor:pointer;color:var(--text2);transition:all .2s;user-select:none;min-height:40px;display:inline-flex;align-items:center;gap:6px}
.type-chip:hover{border-color:var(--cyan);color:var(--cyan)}
.type-chip.selected{background:rgba(0,229,255,.12);border-color:var(--cyan);color:var(--cyan);font-weight:600}
.type-chip.locked{opacity:.45;cursor:not-allowed}
.type-chip.locked:hover{border-color:var(--border);color:var(--text2)}
.aics-advanced{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:16px}
.aics-advanced summary{cursor:pointer;color:var(--cyan);font-size:13px;font-weight:600;user-select:none;min-height:32px;display:flex;align-items:center}
.revise-section{margin-top:20px;padding-top:20px;border-top:1px solid var(--border)}
.revise-history{margin-bottom:14px;max-height:280px;overflow-y:auto}
.revise-msg{background:var(--bg-input);border-radius:8px;padding:10px 14px;margin-bottom:8px;font-size:13px}
.revise-msg.user{border-left:3px solid var(--purple)}
.revise-msg .role{font-size:11px;color:var(--text3);margin-bottom:4px}
.revise-input-row{display:flex;gap:10px;align-items:flex-end}
.revise-input-row textarea{flex:1;min-height:60px}
.result-textarea{width:100%;min-height:220px;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:16px;color:var(--text);font-size:15px;line-height:1.7;font-family:inherit;resize:vertical;box-sizing:border-box}
.result-textarea:focus{outline:none;border-color:var(--cyan)}
.characters-list{display:flex;flex-wrap:wrap;gap:12px}
.character-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:16px;flex:1 1 280px;min-width:260px}
.character-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.character-name{font-weight:700;color:var(--cyan);font-size:14px}
.character-role{font-size:12px;color:var(--text3);margin-bottom:8px}
.character-prompt{font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap;word-break:break-word;background:var(--bg-input);padding:10px 12px;border-radius:8px;margin-bottom:8px;min-height:20px}
.scene-group{margin-bottom:20px}
.scene-group-title{color:var(--cyan);font-weight:700;font-size:15px;padding-bottom:8px;margin-bottom:12px;border-bottom:1px solid var(--border)}
.scene-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:12px}
.scene-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.scene-card-title{font-weight:600;color:var(--purple);font-size:13px}
.scene-prompt-text{font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap;word-break:break-word;background:var(--bg-input);padding:10px 12px;border-radius:8px;margin-bottom:8px;min-height:20px}
.scene-prompt-textarea{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--text);font-size:13px;line-height:1.6;font-family:inherit;resize:vertical;min-height:60px;box-sizing:border-box;margin-bottom:8px}
.scene-prompt-textarea:focus{outline:none;border-color:var(--cyan)}
.scene-image-area{margin-top:10px;text-align:center}
.scene-image-area img{max-width:100%;border-radius:8px;border:1px solid var(--border)}
.loading{display:none;align-items:center;gap:10px;color:var(--cyan);font-size:13px;padding:12px 0}
.loading.show{display:flex}
.spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--cyan);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.error-box{display:none;background:rgba(255,82,82,.1);border:1px solid rgba(255,82,82,.3);color:var(--error);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px}
.error-box.show{display:block}
.fallback-note{display:none;background:rgba(255,193,7,.1);border:1px solid rgba(255,193,7,.3);color:var(--warn);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px}
.fallback-note.show{display:block}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:var(--bg-card2);border:1px solid var(--success);color:var(--success);padding:10px 20px;border-radius:8px;font-size:13px;z-index:1000;transition:transform .3s}
.toast.show{transform:translateX(-50%) translateY(0)}
.empty-note{color:var(--text3);font-size:13px;padding:16px;background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;text-align:center}
@media(max-width:768px){.menu-btn{display:block}.sidebar{position:fixed;left:-260px;top:57px;bottom:0;z-index:99;transition:left .3s;box-shadow:4px 0 20px rgba(0,0,0,.5)}.sidebar.open{left:0}.main{padding:16px}.header-right .user-email{display:none}.revise-input-row{flex-direction:column;align-items:stretch}}
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
<div class="toast" id="toast">&#9989; ကူးယူပြီးပါပြီ</div>
<script>
var token=localStorage.getItem('aics_token')||'';
var userEmail=localStorage.getItem('aics_email')||'';
var userPlan=localStorage.getItem('aics_plan')||'FREE';
var isPro=(userPlan==='PRO');
var selectedStoryType='1';
var currentStory='';
var currentStoryIdea='';
var selectedVideoType='1';
var currentVideoIdea='';
var currentScenes=[];
var currentCharacters=[];
var imgCache={};

var STORY_TYPES=[
  {v:'1',label:'ဇာတ်လမ်း',pro:false},
  {v:'2',label:'ရုပ်ရှင်',pro:true},
  {v:'3',label:'ဇာတ်လမ်းတွဲ',pro:true},
  {v:'4',label:'ဇာတ်လမ်းတို',pro:true},
  {v:'5',label:'ဟာသဇာတ်လမ်း',pro:true}
];
var VIDEO_TYPES=[
  {v:'1',label:'Video',pro:false},
  {v:'2',label:'ရုပ်ရှင်',pro:true},
  {v:'3',label:'ဇာတ်လမ်းတွဲ',pro:true},
  {v:'4',label:'ဇာတ်လမ်းတို',pro:true},
  {v:'5',label:'Type 5',pro:true}
];
var QUICK_TEMPLATES=[
  {label:'🧚 Fantasy',text:'ငယ်ရွယ်တဲ့ မြန်မာမိန်းကလေးတစ်ယောက် မှော်ကမ္ဘာထဲ ရောက်သွားပြီး သူမရဲ့ မိသားစုကို ပြန်ရှာတဲ့အကြောင်း'},
  {label:'❤️ Romance',text:'ရန်ကုန်မြို့မှာ မတော်တဆ တွေ့ဆုံမိတဲ့ လူငယ်နှစ်ယောက်ရဲ့ အချစ်ဇာတ်လမ်း'},
  {label:'💥 Action',text:'လျှို့ဝှက်အေးဂျင့်တစ်ယောက် မြန်မာနိုင်ငံအတွက် အန္တရာယ်ကြီးတဲ့ အလုပ်တစ်ခုကို ပြီးမြောက်အောင် လုပ်ရတဲ့အကြောင်း'},
  {label:'😂 Comedy',text:'ရွာကြီးတစ်ရွာမှာ မှားယွင်းမှုတွေနဲ့ ရယ်စရာတွေ ဖြစ်ပျက်နေတဲ့ အကြောင်း'},
  {label:'👻 Horror',text:'သရဲခြောက်တဲ့ အိမ်ကြီးတစ်လုံးထဲ ဝင်နေထိုင်ရတဲ့ မိသားစုတစ်စုရဲ့ ကြောက်စရာအကြောင်း'}
];
var FIELD_CONFIG=[
  {label:'ဇာတ်လမ်းအကြောင်း',placeholder:'ဥပမာ — ဘာအကြောင်းရေးချင်ပါသလဲ?',required:true,multiline:true},
  {label:'ဇာတ်လမ်းအမျိုးအစား',placeholder:'ဥပမာ — အချစ် / Horror / Action / ဟာသ'},
  {label:'အဓိကဇာတ်ကောင်',placeholder:'ဥပမာ — အသက် / အလုပ် / အိပ်မက်'},
  {label:'အဓိကပြဿနာ',placeholder:'ဥပမာ — ဇာတ်ကောင် ဘာအခက်အခဲကရမလဲ?'},
  {label:'ခံစားချက်ပုစံ',placeholder:'ဥပမာ — ဝမ်းနည်း / လှုပ်ရှား / ကြောက်စရာ'},
  {label:'မြင်ကွင်း/ပတ်ဝန်းကျင်',placeholder:'ဥပမာ — မြန်မာကျေးရွာ / မြို့'},
  {label:'ဇာတ်လမ်းအရှည်',placeholder:'ဥပမာ — နာရီ / မိနစ်'}
];

(function init(){
  if(!token){document.getElementById('loginView').style.display='flex';document.getElementById('aicsApp').style.display='none';return;}
  var _ue=document.getElementById('userEmail');if(_ue)_ue.textContent=userEmail||'—';
  var _pb=document.getElementById('planBadge');if(_pb)_pb.textContent=userPlan||'FREE';
  buildTypeChips('videoTypeChips',VIDEO_TYPES,'video');
  buildIdeaFields();
  buildQuickTemplates();
})();

function apiCall(url,body){var s=document.getElementById('aiModelSel');if(s&&s.value)body.model=s.value;return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.detail||data.error||'Request failed');return data;});});}

function buildTypeChips(containerId,types,prefix){
  var c=document.getElementById(containerId);c.innerHTML='';
  for(var i=0;i<types.length;i++){
    (function(t){
      var chip=document.createElement('div');
      chip.className='type-chip'+(t.v==='1'?' selected':'')+(t.pro&&!isPro?' locked':'');
      chip.setAttribute('data-v',t.v);
      chip.innerHTML=(t.pro&&!isPro?'&#128274; ':'')+t.label+(t.pro?' (PRO)':' (FREE)');
      chip.onclick=function(){
        if(t.pro&&!isPro){showToastMsg('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။');return;}
        var chips=c.querySelectorAll('.type-chip');
        for(var j=0;j<chips.length;j++)chips[j].classList.remove('selected');
        chip.classList.add('selected');
        if(prefix==='story')selectedStoryType=t.v;else selectedVideoType=t.v;
      };
      c.appendChild(chip);
    })(types[i]);
  }
}

function setChipByValue(cid,val){
  var c=document.getElementById(cid);if(!c)return;
  var chips=c.querySelectorAll('.type-chip');
  for(var j=0;j<chips.length;j++){
    if(chips[j].getAttribute('data-v')===String(val))chips[j].classList.add('selected');
    else chips[j].classList.remove('selected');
  }
}

function buildQuickTemplates(){
  var c=document.getElementById('quickTemplates');if(!c)return;
  c.innerHTML='';
  for(var i=0;i<QUICK_TEMPLATES.length;i++){
    (function(t){
      var chip=document.createElement('div');
      chip.className='type-chip';
      chip.innerHTML=t.label;
      chip.onclick=function(){
        var f0=document.getElementById('field_0');
        if(f0)f0.value=t.text;
        showToastMsg('&#10004; Template ထည့်ပြီးပါပြီ — Generate နှိပ်ပါ');
      };
      c.appendChild(chip);
    })(QUICK_TEMPLATES[i]);
  }
}

function buildIdeaFields(){
  var c=document.getElementById('ideaFields');c.innerHTML='';
  for(var i=1;i<FIELD_CONFIG.length;i++){
    (function(f,idx){
      var row=document.createElement('div');row.className='form-group';
      var label=document.createElement('label');label.textContent=f.label;
      var input;
      if(f.multiline){input=document.createElement('textarea');input.style.minHeight='70px';}
      else{input=document.createElement('input');input.type='text';}
      input.placeholder=f.placeholder;input.id='field_'+idx;
      row.appendChild(label);row.appendChild(input);c.appendChild(row);
    })(FIELD_CONFIG[i],i);
  }
}

function collectIdeaText(){
  var lines=[],valid=true;
  for(var i=0;i<FIELD_CONFIG.length;i++){
    var val=document.getElementById('field_'+i).value.trim();
    if(FIELD_CONFIG[i].required&&!val)valid=false;
    if(val)lines.push(FIELD_CONFIG[i].label+': '+val);
  }
  var tone=document.getElementById('toneSel');if(tone&&tone.value)lines.push('Tone: '+tone.value);
  var lang=document.getElementById('langSel');if(lang&&lang.value)lines.push('Language: '+lang.value);
  var aud=document.getElementById('audSel');if(aud&&aud.value)lines.push('Audience: '+aud.value);
  return{text:lines.join('\\n'),valid:valid};
}

function generateStory(){
  var collected=collectIdeaText();
  if(!collected.valid){showError('genError','ဇာတ်လမ်းအကြောင်း အနည်းဆုံး ဖြည့်ရေးပါ');return;}
  var stMeta=STORY_TYPES[parseInt(selectedStoryType,10)-1];
  if(stMeta&&stMeta.pro&&!isPro){showToastMsg('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။');return;}
  var idea=collected.text;
  setLoading('genLoading',true);hideError('genError');
  document.getElementById('generateBtn')&&(document.getElementById('generateBtn').disabled=true);
  var byok=document.getElementById('byokInput')?document.getElementById('byokInput').value.trim():'';
  var body={idea:idea,type:selectedStoryType};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/story/generate',body)
    .then(function(data){
      currentStory=data.story||'';
      currentStoryIdea=idea;
      document.getElementById('storyResult').value=currentStory;
      document.getElementById('reviseHistory').innerHTML='';
      studioMarkDone(1);
      showToastMsg('&#10004; ဇာတ်လမ်းရေးပြီးပါပြီ — Story အဆင့်ကို သွားပါမယ်');
      studioGoStep(3);
    })
    .catch(function(err){showError('genError',err.message);})
    .finally(function(){setLoading('genLoading',false);document.getElementById('generateBtn')&&(document.getElementById('generateBtn').disabled=false);});
}

function reviseStory(){
  var instruction=document.getElementById('feedbackInput').value.trim();
  if(!instruction){showError('revError','ဘယ်လိုပြင်ချင်လဲ ရေးပါ');return;}
  if(!currentStory){showError('revError','အရင် Story ကို ဖန်တီးပါ');return;}
  setLoading('revLoading',true);hideError('revError');
  document.getElementById('reviseBtn').disabled=true;
  addHistory('user',instruction);
  document.getElementById('feedbackInput').value='';
  var latestStory=document.getElementById('storyResult').value;
  var body={idea:currentStoryIdea,type:selectedStoryType,currentStory:latestStory,instruction:instruction};
  apiCall('/api/studio/story/revise',body)
    .then(function(data){
      currentStory=data.story||'';
      document.getElementById('storyResult').value=currentStory;
      addHistory('ai','ပြင်ဆင်ပြီးပါပြီ — အထက်က ဇာတ်လမ်းထဲမှာ ကြည့်ပါ');
      if(window.studioCur&&window.studioCur()===3)renderStoryPreview();
    })
    .catch(function(err){showError('revError',err.message);})
    .finally(function(){setLoading('revLoading',false);document.getElementById('reviseBtn').disabled=false;});
}

function addHistory(role,text){
  var div=document.createElement('div');div.className='revise-msg '+role;
  div.innerHTML='<div class="role">'+(role==='user'?'သင် (User)':'AI')+'</div>'+escapeHtml(text);
  document.getElementById('reviseHistory').appendChild(div);
  document.getElementById('reviseHistory').scrollTop=document.getElementById('reviseHistory').scrollHeight;
}

function copyStory(){
  var text=document.getElementById('storyResult').value;
  if(!text){showToastMsg('Copy လုပ်ဖို့ Result မရှိသေးပါ');return;}
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
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

function transferToVideo(){
  var storyText=document.getElementById('storyResult').value;
  if(!storyText||!storyText.trim()){showToastMsg('ဗီဒီယို ဖန်တီးရန် ဇာတ်လမ်း မရှိသေးပါ');return;}
  var videoBox=document.getElementById('videoIdeaInput');
  if(videoBox.value&&videoBox.value.trim()){if(!confirm('Idea Box ထဲမှာ Info ရှိပြီးသားပါ။ အစားထိုးမလား?'))return;}
  studioGoStep(2);
  videoBox.value=storyText;
  window.scrollTo(0,0);
}

function autoFillVideoIdea(){
  var box=document.getElementById('videoIdeaInput');
  if(!box)return;
  if(!box.value.trim()&&currentStory){box.value=currentStory;}
}

function generateVideo(){
  var idea=document.getElementById('videoIdeaInput').value.trim();
  if(!idea){showError('videoError','Story/Idea ထည့်ပါ');return;}
  currentVideoIdea=idea;
  setLoading('videoLoading',true);hideError('videoError');
  document.getElementById('fallbackNote').classList.remove('show');
  document.getElementById('videoGenBtn').disabled=true;
  var body={idea:idea,type:selectedVideoType};
  apiCall('/api/studio/story/video',body)
    .then(function(data){
      currentScenes=data.scenes||[];
      currentCharacters=data.characters||[];
      renderScenes();
      studioMarkDone(2);
      studioMarkDone(4);
      renderCharacters();
      if(data.rawFallback)document.getElementById('fallbackNote').classList.add('show');
      showToastMsg('&#10004; Characters & Scenes ဖန်တီးပြီးပါပြီ');
    })
    .catch(function(err){showError('videoError',err.message);})
    .finally(function(){setLoading('videoLoading',false);document.getElementById('videoGenBtn').disabled=false;});
}

function renderCharacters(){
  if(!currentCharacters||currentCharacters.length===0){studioPreview('');return;}
  var html='<div class="aics-pv-label">&#127934; Characters ('+currentCharacters.length+')</div>';
  for(var i=0;i<currentCharacters.length;i++){
    (function(idx){
      var ch=currentCharacters[idx];
      html+='<div class="aics-pv-card"><h4>&#128100; '+(ch.name||'Character '+(idx+1))+'</h4>'+
        '<p class="aics-pv-sub">Role: '+(ch.role||'-')+'</p>'+
        '<p>'+escapeHtml(ch.prompt||'(မရှိပါ)')+'</p>'+
        '<button class="btn-ghost" onclick="copyCharPrompt('+idx+')">&#128203; Copy</button> '+
        '<button class="btn-ghost" onclick="generateCharImage('+idx+')">&#127912; Character Image</button>'+
        '<div id="charImg_'+idx+'" style="margin-top:6px;">'+(imgCache['char_'+idx]?'<img class="aics-pv-img" src="'+imgCache['char_'+idx]+'">':'')+'</div>'+
        '</div>';
    })(i);
  }
  studioPreview(html);
}

function copyCharPrompt(idx){
  if(!currentCharacters[idx])return;
  var text=currentCharacters[idx].prompt||'';
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
}

function generateCharImage(idx){
  if(!currentCharacters[idx]||!currentCharacters[idx].prompt){showToastMsg('Prompt မရှိပါ');return;}
  var area=document.getElementById('charImg_'+idx);
  if(area)area.innerHTML='<div class="loading show" style="justify-content:center;"><div class="spinner"></div> ပုံဖန်တီးနေပါသည်...</div>';
  apiCall('/api/studio/story/video-image',{prompt:currentCharacters[idx].prompt})
    .then(function(data){
      if(data.data){
        var src='data:'+(data.mimeType||'image/png')+';base64,'+data.data;
        imgCache['char_'+idx]=src;
        if(area)area.innerHTML='<img class="aics-pv-img" src="'+src+'"><div style="margin-top:8px;"><a href="'+src+'" download="story_character_'+(idx+1)+'.png"><button class="btn-ghost">&#128190; Save Image</button></a></div>';
      }else{if(area)area.innerHTML='<div class="empty-note">ရုပ်ပုံမထွက်ပါ</div>';}
    })
    .catch(function(err){if(area)area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">Error: '+escapeHtml(err.message)+'</div><button class="btn-ghost" onclick="generateCharImage('+idx+')">ထပ်စမ်းပါ</button>';});
}

function renderScenes(){
  var list=document.getElementById('scenesList');if(!list)return;
  list.innerHTML='';
  var hint=document.getElementById('noScenesHint');
  if(hint)hint.style.display=(!currentScenes||currentScenes.length===0)?'block':'none';
  if(!currentScenes||currentScenes.length===0)return;
  for(var i=0;i<currentScenes.length;i++){
    (function(idx){
      var s=currentScenes[idx];
      var group=document.createElement('div');group.className='scene-group';
      var html='<div class="scene-group-title">SCENE '+(s.number||(idx+1))+'</div>';
      html+='<div class="scene-card"><div class="scene-card-header"><span class="scene-card-title">&#127757; Environment Reference Prompt</span>'+
        '<button class="btn-ghost" onclick="copyEnvPrompt('+idx+')">&#128203; Copy</button></div>'+
        '<div class="scene-prompt-text">'+escapeHtml(s.environmentPrompt||'(မရှိပါ)')+'</div>'+
        '<div class="scene-image-area" id="envImg_'+idx+'">'+(imgCache['env_'+idx]?'<img src="'+imgCache['env_'+idx]+'">':'<button class="btn btn-orange" style="font-size:12px;padding:8px 14px;min-height:36px;" onclick="generateEnvImage('+idx+')">&#127912; Environment Image ဖန်တီးပါ</button>')+'</div></div>';
      html+='<div class="scene-card"><div class="scene-card-header"><span class="scene-card-title">&#127916; Video Prompt</span>'+
        '<button class="btn-ghost" onclick="copyVideoPrompt('+idx+')">&#128203; Copy</button></div>'+
        '<textarea class="scene-prompt-textarea" id="videoText_'+idx+'" oninput="currentScenes['+idx+'].videoPrompt=this.value">'+escapeHtml(s.videoPrompt||'')+'</textarea></div>';
      group.innerHTML=html;list.appendChild(group);
    })(i);
  }
}

function copyEnvPrompt(idx){if(!currentScenes[idx])return;copyToClipboard(currentScenes[idx].environmentPrompt||'');}
function copyVideoPrompt(idx){if(!currentScenes[idx])return;copyToClipboard(document.getElementById('videoText_'+idx).value);}
function copyToClipboard(text){
  if(!text){showToastMsg('Text မရှိပါ');return;}
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
}

function generateEnvImage(idx){
  if(!currentScenes[idx]||!currentScenes[idx].environmentPrompt){showToastMsg('Prompt မရှိပါ');return;}
  var area=document.getElementById('envImg_'+idx);
  if(area)area.innerHTML='<div class="loading show" style="justify-content:center;"><div class="spinner"></div> ပုံဖန်တီးနေပါသည်...</div>';
  apiCall('/api/studio/story/video-image',{prompt:currentScenes[idx].environmentPrompt})
    .then(function(data){
      if(data.data){
        var src='data:'+(data.mimeType||'image/png')+';base64,'+data.data;
        imgCache['env_'+idx]=src;
        if(area)area.innerHTML='<img src="'+src+'"><div style="margin-top:8px;"><a href="'+src+'" download="story_scene_'+(idx+1)+'_env.png"><button class="btn-ghost">&#128190; Save Image</button></a></div>';
      }else{if(area)area.innerHTML='<div class="empty-note">ရုပ်ပုံမထွက်ပါ</div>';}
    })
    .catch(function(err){if(area)area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">Error: '+escapeHtml(err.message)+'</div><button class="btn-ghost" onclick="generateEnvImage('+idx+')">ထပ်စမ်းပါ</button>';});
}

function buildCombinedText(){
  var combined='&#128100; CHARACTER REFERENCE PROMPTS\\n\\n';
  for(var i=0;i<currentCharacters.length;i++){
    var ch=currentCharacters[i];
    combined+='CHARACTER '+(i+1)+'\\n----------------------\\n';
    combined+='Name: '+(ch.name||'-')+'\\nRole: '+(ch.role||'-')+'\\n\\n';
    combined+='Character Reference Prompt:\\n'+(ch.prompt||'-')+'\\n\\n======================\\n\\n';
  }
  combined+='\\n&#127757;&#127916; SCENE PROMPTS (Environment & Video)\\n\\n';
  for(var j=0;j<currentScenes.length;j++){
    var sc=currentScenes[j];
    combined+='SCENE '+(sc.number||(j+1))+'\\n----------------------\\n';
    combined+='Environment Prompt:\\n'+(sc.environmentPrompt||'-')+'\\n\\n';
    combined+='Video Prompt:\\n'+(document.getElementById('videoText_'+j)?document.getElementById('videoText_'+j).value:(sc.videoPrompt||'-'))+'\\n\\n======================\\n\\n';
  }
  return combined;
}

function buildResultText(){
  var parts=[];
  var storyEl=document.getElementById('storyResult');
  var storyText=(storyEl&&storyEl.value)?storyEl.value:currentStory;
  if(storyText&&storyText.trim())parts.push('STORY\\n======================\\n'+storyText);
  if(currentCharacters&&currentCharacters.length){
    var cp='CHARACTER REFERENCE PROMPTS\\n======================\\n';
    for(var i=0;i<currentCharacters.length;i++){
      var ch=currentCharacters[i];
      cp+='\\nCHARACTER '+(i+1)+'\\nName: '+(ch.name||'-')+'\\nRole: '+(ch.role||'-')+'\\nPrompt: '+(ch.prompt||'-');
    }
    parts.push(cp);
  }
  if(currentScenes&&currentScenes.length){
    var sp='SCENE PROMPTS (Environment & Video)\\n======================\\n';
    for(var j=0;j<currentScenes.length;j++){
      var sc=currentScenes[j];
      sp+='\\nSCENE '+(sc.number||(j+1))+'\\nEnvironment: '+(sc.environmentPrompt||'-')+'\\nVideo: '+(document.getElementById('videoText_'+j)?document.getElementById('videoText_'+j).value:(sc.videoPrompt||'-'));
    }
    parts.push(sp);
  }
  return parts.join('\\n\\n');
}

function copyAllVideo(){
  if(currentScenes.length===0&&currentCharacters.length===0){showToastMsg('Result မရှိသေးပါ');return;}
  copyToClipboard(buildCombinedText());
}

function saveAllVideo(){
  if(currentScenes.length===0&&currentCharacters.length===0){showToastMsg('Result မရှိသေးပါ');return;}
  var combined=buildCombinedText();
  var defaultTitle=currentVideoIdea.substring(0,40)+(currentVideoIdea.length>40?'...':'');
  var title=prompt('Creation အမည် ပေးပါ:',defaultTitle);
  if(title===null)return;
  AICS_CREATIONS.save({studio:'STORYVIDEO',type:selectedVideoType,title:title||defaultTitle,original_prompt:currentVideoIdea,ai_output:combined})
    .then(function(){showToastMsg('&#128190; My Creations ထဲ Save ပြီးပါပြီ');})
    .catch(function(err){showToastMsg('Save မအောင်မြင်ပါ: '+(err&&err.message||'Error'));});
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
  AICS_CREATIONS.save({studio:'STORY',type:selectedStoryType,title:title||defaultTitle,original_prompt:currentStoryIdea,ai_output:text})
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

function onStoryEdit(){
  if(window.studioCur&&window.studioCur()===3)renderStoryPreview();
}

function renderStoryPreview(){
  var storyEl=document.getElementById('storyResult');
  var text=(storyEl&&storyEl.value)?storyEl.value:currentStory;
  if(!text||!text.trim()){studioPreview('');return;}
  studioPreview('<div class="aics-pv-label">&#128214; Story</div><pre>'+escapeHtml(text)+'</pre>');
}

function renderScenesPreview(){
  if(!currentScenes||currentScenes.length===0){studioPreview('');return;}
  var html='<div class="aics-pv-label">&#127916; Scenes ('+currentScenes.length+')</div>';
  for(var i=0;i<currentScenes.length;i++){
    (function(idx){
      var s=currentScenes[idx];
      html+='<div class="aics-pv-card"><h4>Scene '+(s.number||(idx+1))+'</h4>'+
        '<p class="aics-pv-sub">&#127757; Environment</p><p>'+escapeHtml((s.environmentPrompt||'(မရှိပါ)'))+'</p>'+
        '<p class="aics-pv-sub">&#127916; Video</p><p>'+escapeHtml((s.videoPrompt||''))+'</p></div>';
    })(i);
  }
  studioPreview(html);
}

function renderCombinedPreview(){
  var text=buildResultText();
  if(!text.trim()){studioPreview('');return;}
  studioPreview('<div class="aics-pv-label">&#127894; Final Output</div><pre>'+escapeHtml(text)+'</pre>');
}

function bBack(){return {label:'&#8592; Back',cls:'ghost',fn:function(){studioGoStep(studioCur()-1);}};}
function bReset(){return {label:'Reset',cls:'ghost',fn:studioReset};}
function bSave(){return {label:'&#128190; Save Draft',cls:'ghost',fn:studioSaveDraft};}
function bNext(n){return {label:'Next &#8594;',cls:'primary',fn:function(){studioGoStep(n);}};}

function studioOnStep(n){
  if(n===1){
    var acts=[bReset(),bSave()];
    if(currentStory)acts.push({label:'Next &#8594;',cls:'secondary',fn:function(){studioGoStep(2);}});
    acts.push({label:'Generate Story &#10022;',cls:'primary',fn:generateStory});
    studioSetActions(acts);
    renderStoryPreview();
  }else if(n===2){
    autoFillVideoIdea();
    studioSetActions([bBack(),bReset(),bSave(),{label:'Generate Characters &amp; Scenes &#10022;',cls:'primary',fn:generateVideo}]);
    renderCharacters();
  }else if(n===3){
    studioSetActions([bBack(),bReset(),bSave(),bNext(4)]);
    renderStoryPreview();
  }else if(n===4){
    studioSetActions([bBack(),bReset(),bSave(),bNext(5)]);
    renderScenesPreview();
  }else if(n===5){
    studioSetActions([bBack(),{label:'&#9999; Edit',cls:'ghost',fn:function(){studioGoStep(3);}},{label:'&#128260; Regenerate',cls:'ghost',fn:function(){studioGoStep(1);}},{label:'&#128190; Save to Creations',cls:'purple',fn:saveAllResult},{label:'&#128228; Export',cls:'success',fn:exportResult}]);
    renderCombinedPreview();
  }
}
window.studioOnStep=studioOnStep;

function studioCollectDraft(){
  var fields={};
  for(var i=0;i<FIELD_CONFIG.length;i++){var f=document.getElementById('field_'+i);fields[i]=f?f.value:'';}
  return {
    storyType:selectedStoryType,
    videoType:selectedVideoType,
    aud:(document.getElementById('audSel')?document.getElementById('audSel').value:''),
    tone:document.getElementById('toneSel')?document.getElementById('toneSel').value:'',
    lang:document.getElementById('langSel')?document.getElementById('langSel').value:'',
    fields:fields,
    story:document.getElementById('storyResult').value,
    storyIdea:currentStoryIdea,
    videoIdea:document.getElementById('videoIdeaInput').value,
    currentVideoIdea:currentVideoIdea,
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
  document.getElementById('storyResult').value=currentStory;
  document.getElementById('videoIdeaInput').value=d.videoIdea||'';
  currentVideoIdea=d.currentVideoIdea||'';
  currentCharacters=d.characters||[];
  currentScenes=d.scenes||[];
  if(currentStory)studioMarkDone(1);
  if(currentCharacters.length||currentScenes.length){studioMarkDone(2);studioMarkDone(4);}
  setChipByValue('videoTypeChips',selectedVideoType);
  renderScenes();
}
window.studioRestoreDraft=studioRestoreDraft;

function setLoading(id,show){var el=document.getElementById(id);if(show)el.classList.add('show');else el.classList.remove('show');}
function showError(id,msg){var el=document.getElementById(id);el.textContent=msg;el.classList.add('show');}
function hideError(id){document.getElementById(id).classList.remove('show');}
function showToastMsg(msg){var t=document.getElementById('toast');t.textContent=msg||'&#9989; ကူးယူပြီးပါပြီ';t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2000);}
function escapeHtml(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
</script>
</body>
</html>`;
