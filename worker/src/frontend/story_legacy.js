// AI Creative Studio — Story Studio Frontend (Phase 4)
// Tab 1: Story Generator + Revise (Chat) + Save Creations + Transfer to Video
// Tab 2: Video Plan (Characters + Scenes with Environment/Video Prompts + Images)
// Dark Theme preserved from Source (Google Apps Script UI)
// Studio Isolation: ဤ File သည် Story Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Phase 4 — Sidebar + Helper Script များကို Shared Component (frontend/shared.js) မှ ယူသည်

import { renderSidebar, sidebarScript } from './shared.js';

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
.tabs{display:flex;gap:4px;border-bottom:1px solid var(--border);margin-bottom:24px;overflow-x:auto}
.tab{padding:12px 20px;background:none;border:none;color:var(--text2);cursor:pointer;font-size:14px;font-family:inherit;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;min-height:44px}
.tab:hover{color:var(--text)}
.tab.active{color:var(--cyan);border-bottom-color:var(--cyan);font-weight:600}
.tab-content{display:none}
.tab-content.active{display:block}
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
.login-prompt{text-align:center;padding:60px 20px}
.login-prompt h2{color:var(--cyan);margin-bottom:12px}
.login-prompt p{color:var(--text2);margin-bottom:20px}
.empty-note{color:var(--text3);font-size:13px;padding:16px;background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;text-align:center}
.section-badge{background:var(--error);color:#fff;font-weight:700;padding:3px 10px;border-radius:6px;font-size:12px;margin-right:8px}
@media(max-width:767px){.menu-btn{display:block}.sidebar{position:fixed;left:-260px;top:57px;bottom:0;z-index:99;transition:left .3s;box-shadow:4px 0 20px rgba(0,0,0,.5)}.sidebar.open{left:0}.main{padding:16px}.header-right .user-email{display:none}.revise-input-row{flex-direction:column;align-items:stretch}}
</style>
</head>
<body>
<div class="header">
<div class="header-left"><button class="menu-btn" onclick="toggleSidebar()">&#9776;</button><div class="logo">&#127912; AI Creative Studio</div></div>
<div class="header-right"><span class="user-email" id="userEmail">—</span><span class="plan-badge" id="planBadge">FREE</span></div>
</div>
<div class="layout">
${renderSidebar('story', { variant: 'studio' })}
<div class="main">
<div id="loginView" class="login-prompt" style="display:none;"><h2>Login လုပ်ရန် လိုအပ်ပါသည်</h2><p>Story Studio ကို အသုံးပြုရန် Google နဲ့ Login ဝင်ပါ။</p><a href="/api/auth/login?next=/app/story" class="btn btn-primary">Google နဲ့ Login</a></div>
<div id="appView">
<div class="card" style="padding:14px 18px;margin-bottom:16px;">
<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
<label style="margin:0;white-space:nowrap;font-weight:600;">&#129302; AI Model</label>
<select id="aiModelSel" data-category="text" style="max-width:340px;flex:1;"></select>
<span style="font-size:11.5px;color:var(--text3);">ရွေးထားသော Model ဖြင့် Generate လုပ်ပါမည်</span>
</div></div>
<div class="tabs">
<button class="tab active" onclick="switchTab(1)">Tab 1 — ဇာတ်လမ်းဖန်တီးရန်</button>
<button class="tab" onclick="switchTab(2)">Tab 2 — ဗီဒီယိုဖန်တီးရန်</button>
</div>

<!-- TAB 1: STORY GENERATOR -->
<div class="tab-content active" id="tab1">
<div class="card">
<div class="card-title">&#128214; ဇာတ်လမ်း ဖန်တီးရန်</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">Type ရွေးပြီး အောက်ကနေရာလေးများကို ဖြည့်ရေးပါ။</p>
<div class="type-chips" id="storyTypeChips"></div>
<div id="ideaFields"></div>
<button class="btn btn-primary" id="generateBtn" onclick="generateStory()">&#9654; Generate Story</button>
<div class="loading" id="genLoading"><div class="spinner"></div> AI ဇာတ်လမ်းရေးသားနေပါသည်...</div>
<div class="error-box" id="genError"></div>
</div>

<div id="resultSection" style="display:none;">
<div class="card">
<div class="card-title">&#128221; ရလဒ် (ဇာတ်လမ်း)</div>
<textarea class="result-textarea" id="storyResult" placeholder="ဇာတ်လမ်း ဒီနေရာမှာ ပေါ်လာပါမယ်..."></textarea>
<p style="color:var(--text3);font-size:12px;margin-top:6px;font-style:italic;">&#9997; ဒီနေရာမှာ တိုက်ရိုက် နှိပ်ပြီး ကိုယ်တိုင် ပြင်ဆင်နိုင်ပါတယ်</p>
<div class="btn-row">
<button class="btn btn-success" onclick="copyStory()">&#128203; Copy Story</button>
<button class="btn btn-purple" onclick="saveStory()">&#128190; Save to My Creations</button>
<button class="btn btn-orange" onclick="transferToVideo()">&#127916; ဗီဒီယိုဖန်တီးရန်</button>
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
</div>
</div>

<!-- TAB 2: STORY VIDEO PLAN -->
<div class="tab-content" id="tab2">
<div class="card">
<div class="card-title">&#127916; ဗီဒီယိုအစီအစဉ် ဖန်တီးရန် (Story Video)</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">Type ရွေးပြီး Story/Idea ထည့်ပါ — Scene အလိုက်၊ Character အလိုက် ခွဲထားသော Video Production Prompt များ ဖန်တီးပေးပါမယ်။</p>
<div class="type-chips" id="videoTypeChips"></div>
<div class="form-group">
<textarea id="videoIdeaInput" placeholder="ဥပမာ — ဒါရိုက်ခိုင်းလိုတဲ့ Story/Idea ကို ထည့်ပါ" style="min-height:140px;"></textarea>
</div>
<button class="btn btn-primary" id="videoGenBtn" onclick="generateVideo()">&#9654; Generate Video Plan</button>
<div class="loading" id="videoLoading"><div class="spinner"></div> AI Video Plan ရေးသားနေပါသည်...</div>
<div class="error-box" id="videoError"></div>
<div class="fallback-note" id="fallbackNote">&#9888; CMS ပုံစံအတိုင်း Scene/Character အပြည့်အစုံ မခွဲနိုင်ခဲ့ပါ — AI ရဲ့ Raw Output ကို Scene 1 အနေနဲ့ ပြထားပါသည်။</div>
</div>

<div id="videoResult" style="display:none;">
<div class="card" id="charactersCard" style="display:none;">
<div class="card-title"><span class="section-badge">01</span> &#128100; CHARACTER REFERENCE PROMPT</div>
<div id="charactersList" class="characters-list"></div>
</div>
<div class="card">
<div class="card-title"><span class="section-badge">02</span> &#127757;&#127916; SCENE PROMPT (Environment &amp; Video)</div>
<div id="scenesList"></div>
</div>
<div class="card">
<div class="btn-row">
<button class="btn btn-success" onclick="copyAllVideo()">&#128203; All Copy</button>
<button class="btn btn-purple" onclick="saveAllVideo()">&#128190; Save All to My Creations</button>
</div>
<p style="color:var(--text3);font-size:12px;margin-top:8px;">(Text Prompt များသာ Save/Copy ဖြစ်ပါမည် — Image များကို ကတ်ချင်ရာနေရာမှာ တစ်ပုံချင်း Download ချပေးပါ)</p>
</div>
</div>
</div>

</div>
</div>
</div>
<div class="toast" id="toast">&#9989; ကူးယူပြီးပါပြီ</div>
${sidebarScript()}
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
  if(!token){document.getElementById('loginView').style.display='block';document.getElementById('appView').style.display='none';return;}
  document.getElementById('userEmail').textContent=userEmail||'—';
  document.getElementById('planBadge').textContent=userPlan||'FREE';
  buildTypeChips('storyTypeChips',STORY_TYPES,'story');
  buildTypeChips('videoTypeChips',VIDEO_TYPES,'video');
  buildIdeaFields();
})();

function switchTab(n){var tabs=document.querySelectorAll('.tab'),contents=document.querySelectorAll('.tab-content');for(var i=0;i<tabs.length;i++)tabs[i].classList.remove('active');for(var i=0;i<contents.length;i++)contents[i].classList.remove('active');tabs[n-1].classList.add('active');document.getElementById('tab'+n).classList.add('active');document.getElementById('sidebar').classList.remove('open');}
function apiCall(url,body){var s=document.getElementById('aiModelSel');if(s&&s.value)body.model=s.value;return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.detail||data.error||'Request failed');return data;});});}

function buildTypeChips(containerId,types,prefix){
  var c=document.getElementById(containerId);c.innerHTML='';
  for(var i=0;i<types.length;i++){
    (function(t){
      var chip=document.createElement('div');
      chip.className='type-chip'+(t.v==='1'?' selected':'')+(t.pro&&!isPro?' locked':'');
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

function buildIdeaFields(){
  var c=document.getElementById('ideaFields');c.innerHTML='';
  for(var i=0;i<FIELD_CONFIG.length;i++){
    (function(f,idx){
      var row=document.createElement('div');row.className='form-group';
      var label=document.createElement('label');label.textContent=f.label+(f.required?' *':'');
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
  return{text:lines.join('\\n'),valid:valid};
}

function generateStory(){
  var collected=collectIdeaText();
  if(!collected.valid){showError('genError','ဇာတ်လမ်းအကြောင်း အနည်းဆုံး ဖြည့်ရေးပါ');return;}
  var idea=collected.text;
  setLoading('genLoading',true);hideError('genError');
  document.getElementById('generateBtn').disabled=true;
  var byok=document.getElementById('byokInput')?document.getElementById('byokInput').value.trim():'';
  var body={idea:idea,type:selectedStoryType};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/story/generate',body)
    .then(function(data){
      currentStory=data.story||'';
      currentStoryIdea=idea;
      document.getElementById('storyResult').value=currentStory;
      document.getElementById('resultSection').style.display='block';
      document.getElementById('reviseHistory').innerHTML='';
    })
    .catch(function(err){showError('genError',err.message);})
    .finally(function(){setLoading('genLoading',false);document.getElementById('generateBtn').disabled=false;});
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
  switchTab(2);
  videoBox.value=storyText;
  window.scrollTo(0,0);
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
      renderCharacters();
      renderScenes();
      if(data.rawFallback)document.getElementById('fallbackNote').classList.add('show');
      document.getElementById('videoResult').style.display='block';
    })
    .catch(function(err){showError('videoError',err.message);})
    .finally(function(){setLoading('videoLoading',false);document.getElementById('videoGenBtn').disabled=false;});
}

function renderCharacters(){
  var card=document.getElementById('charactersCard'),list=document.getElementById('charactersList');
  if(!currentCharacters||currentCharacters.length===0){card.style.display='none';return;}
  card.style.display='block';list.innerHTML='';
  for(var i=0;i<currentCharacters.length;i++){
    (function(idx){
      var ch=currentCharacters[idx];
      var div=document.createElement('div');div.className='character-card';
      var html='<div class="character-header"><span class="character-name">&#129489; '+(ch.name||'Character '+(idx+1))+'</span>'+
        '<button class="btn-ghost" onclick="copyCharPrompt('+idx+')">&#128203; Copy</button></div>'+
        '<div class="character-role">Role: '+(ch.role||'-')+'</div>'+
        '<div class="character-prompt" id="charPrompt_'+idx+'">'+escapeHtml(ch.prompt||'(မရှိပါ)')+'</div>'+
        '<div class="scene-image-area" id="charImg_'+idx+'"><button class="btn btn-orange" style="font-size:12px;padding:8px 14px;min-height:36px;" onclick="generateCharImage('+idx+')">&#127912; Character Image ဖန်တီးပါ</button></div>';
      div.innerHTML=html;list.appendChild(div);
    })(i);
  }
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
  area.innerHTML='<div class="loading show"><div class="spinner"></div> ပုံဖန်တီးနေပါသည်...</div>';
  apiCall('/api/studio/story/video-image',{prompt:currentCharacters[idx].prompt})
    .then(function(data){
      if(data.data){
        var src='data:'+(data.mimeType||'image/png')+';base64,'+data.data;
        area.innerHTML='<img src="'+src+'" alt="Character '+(idx+1)+'"><div style="margin-top:8px;"><a href="'+src+'" download="story_character_'+(idx+1)+'.png"><button class="btn-ghost">&#128190; Save Image</button></a></div>';
      }else{area.innerHTML='<div class="empty-note">ရုပ်ပုံမထွက်ပါ</div>';}
    })
    .catch(function(err){area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">Error: '+escapeHtml(err.message)+'</div><button class="btn-ghost" onclick="generateCharImage('+idx+')">ထပ်စမ်းပါ</button>';});
}

function renderScenes(){
  var list=document.getElementById('scenesList');list.innerHTML='';
  if(!currentScenes||currentScenes.length===0){list.innerHTML='<div class="empty-note">Scene Prompt မရှိသေးပါ</div>';return;}
  for(var i=0;i<currentScenes.length;i++){
    (function(idx){
      var s=currentScenes[idx];
      var group=document.createElement('div');group.className='scene-group';
      var html='<div class="scene-group-title">SCENE '+(s.number||(idx+1))+'</div>';
      // Environment card
      html+='<div class="scene-card"><div class="scene-card-header"><span class="scene-card-title">&#127757; Environment Reference Prompt</span>'+
        '<button class="btn-ghost" onclick="copyEnvPrompt('+idx+')">&#128203; Copy</button></div>'+
        '<div class="scene-prompt-text" id="envText_'+idx+'">'+escapeHtml(s.environmentPrompt||'(မရှိပါ)')+'</div>'+
        '<div class="scene-image-area" id="envImg_'+idx+'"><button class="btn btn-orange" style="font-size:12px;padding:8px 14px;min-height:36px;" onclick="generateEnvImage('+idx+')">&#127912; Environment Image ဖန်တီးပါ</button></div></div>';
      // Video card (editable)
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
  area.innerHTML='<div class="loading show"><div class="spinner"></div> ပုံဖန်တီးနေပါသည်...</div>';
  apiCall('/api/studio/story/video-image',{prompt:currentScenes[idx].environmentPrompt})
    .then(function(data){
      if(data.data){
        var src='data:'+(data.mimeType||'image/png')+';base64,'+data.data;
        area.innerHTML='<img src="'+src+'" alt="Scene '+(idx+1)+'"><div style="margin-top:8px;"><a href="'+src+'" download="story_scene_'+(idx+1)+'_env.png"><button class="btn-ghost">&#128190; Save Image</button></a></div>';
      }else{area.innerHTML='<div class="empty-note">ရုပ်ပုံမထွက်ပါ</div>';}
    })
    .catch(function(err){area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">Error: '+escapeHtml(err.message)+'</div><button class="btn-ghost" onclick="generateEnvImage('+idx+')">ထပ်စမ်းပါ</button>';});
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

function setLoading(id,show){var el=document.getElementById(id);if(show)el.classList.add('show');else el.classList.remove('show');}
function showError(id,msg){var el=document.getElementById(id);el.textContent=msg;el.classList.add('show');}
function hideError(id){document.getElementById(id).classList.remove('show');}
function showToastMsg(msg){var t=document.getElementById('toast');t.textContent=msg||'&#9989; ကူးယူပြီးပါပြီ';t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2000);}
function escapeHtml(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
// (Sidebar Helpers — TG-LINK / me Hydration / setApiKey / logout များကို Shared Sidebar Script သို့ ရွှေ့ပြီးပါပြီ — Phase 4)
</script>
</body>
</html>`;
