// ============================================================
// Story Studio — Shell (frontend/story/shell.js)
// ------------------------------------------------------------
// Step Rail + Work Room + Drawer ကို ပေါင်းစပ်သော Page တစ်ခုလုံး
// - Steps / ပုံစံများကို story/steps/ မှ ယူသည်
// - Shared Engine (stepFlow.js) + Shared UI (ui.js) ကို သုံးသည်
// - index.js သည် frontend/story.js ကိုသာ ဆက်သိသည် (မပြောင်း)
// ============================================================

import { renderSidebar, sidebarScript } from '../shared.js';
import { workRoomCss, stepRailHtml } from '../shared/ui.js';
import { stepFlowScript } from '../shared/stepFlow.js';
import { STORY_STEPS, STORY_STATE_KEY, STORY_STUDIO_NAME, stepsClientJson } from './steps.js';

// ---- Client Data (Browser တွင် လိုအပ်သော Step Config) ----
function buildClientData() {
  const out = {};
  for (let i = 0; i < STORY_STEPS.length; i++) {
    const s = STORY_STEPS[i];
    out[s.id] = s.step.clientData ? s.step.clientData() : null;
  }
  return out;
}

// ---- Step Scripts အားလုံး (တစ်ခုတည်းသော <script> ထဲ ထည့်သည်) ----
function buildStepScripts() {
  let out = '';
  for (let i = 0; i < STORY_STEPS.length; i++) {
    const s = STORY_STEPS[i];
    if (s.step.script) out += s.step.script() + '\n';
  }
  return out;
}

// ---- Step Panels (Server-side Render — Active ကို Client က ပြသည်) ----
function buildPanels() {
  let out = '';
  for (let i = 0; i < STORY_STEPS.length; i++) {
    const s = STORY_STEPS[i];
    out += '<div class="wr-panel" data-panel="' + s.id + '" style="display:none;">' +
      '<div class="wr-room">' + s.step.html() + '</div></div>';
  }
  return out;
}

// ---- Base CSS (လက်ရှိ Dark Theme အတိုင်း) ----
function baseCss() {
  return '<style>' +
    ':root{--bg:#080c18;--bg-card:#0d1424;--bg-card2:#111a2e;--bg-input:#0a1020;--border:rgba(0,229,255,0.15);--border-strong:rgba(0,229,255,0.35);--cyan:#00e5ff;--purple:#7b5cff;--text:#e8ecf4;--text2:#8b95a8;--text3:#5a6478;--success:#00e676;--error:#ff5252;--warn:#ffc107}' +
    '*{margin:0;padding:0;box-sizing:border-box}' +
    'body{font-family:\'Noto Sans Myanmar\',\'Roboto\',\'Segoe UI\',Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:14px;line-height:1.6}' +
    'a{color:var(--cyan);text-decoration:none}' +
    '.header{background:linear-gradient(135deg,#0a1628,#0d1f3c);border-bottom:1px solid var(--border);padding:12px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}' +
    '.header-left{display:flex;align-items:center;gap:12px}.logo{font-size:18px;font-weight:700;background:linear-gradient(90deg,var(--cyan),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}' +
    '.header-right{display:flex;align-items:center;gap:12px;font-size:13px}.user-email{color:var(--text2)}' +
    '.plan-badge{background:linear-gradient(135deg,var(--purple),var(--cyan));color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}' +
    '.menu-btn{display:none;background:none;border:1px solid var(--border);color:var(--cyan);padding:8px 12px;border-radius:8px;cursor:pointer;font-size:18px}' +
    '.layout{display:flex;min-height:calc(100vh - 57px)}' +
    '.sidebar{width:220px;background:#0d1425;border-radius:16px;margin:14px 12px;padding:14px 12px;flex-shrink:0;display:flex;flex-direction:column;}' +
    '.brand{margin-bottom:18px;padding:0 4px;}.brand-title{font-weight:800;font-size:17px;letter-spacing:.5px;background:linear-gradient(90deg,var(--purple),var(--cyan));-webkit-background-clip:text;background-clip:text;color:transparent;}' +
    '.nav-label{font-size:11px;color:var(--text3);letter-spacing:1.5px;margin:16px 0 6px 8px;text-transform:uppercase;}' +
    '.nav-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;color:#c6cede;text-decoration:none;cursor:pointer;font-size:13.5px;margin-bottom:2px;border:1px solid transparent;transition:all .2s;}' +
    '.nav-item:hover{background:#161d30;}.nav-item.active{background:linear-gradient(90deg,rgba(123,92,255,.18),rgba(0,229,255,.08));color:#fff;border:1px solid var(--purple);box-shadow:0 0 14px rgba(123,92,255,.35);}' +
    '.nav-icon-circle{width:30px;height:30px;border-radius:9px;background:#1a2138;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}' +
    '.sidebar-bottom{margin-top:auto;padding-top:14px;border-top:1px solid var(--border);}' +
    '.license-badge{display:inline-block;font-size:11px;padding:4px 10px;border-radius:20px;margin-bottom:10px;background:#333;color:#aaa;}.license-badge.pro{background:#103a2a;color:var(--success);box-shadow:0 0 10px rgba(43,255,159,.25);}' +
    '.side-email{font-size:11.5px;color:var(--text3);margin-bottom:8px;word-break:break-all;}' +
    '.side-btn{display:flex;align-items:center;gap:8px;width:100%;text-align:left;padding:8px 10px;border-radius:10px;background:#161d30;color:#c6cede;border:1px solid var(--border);font-size:12.5px;cursor:pointer;margin-bottom:5px;text-decoration:none;transition:all .2s;box-sizing:border-box;}' +
    '.side-btn:hover{background:#1e2740;border-color:var(--cyan);}' +
    '.main{flex:1;padding:24px;max-width:960px;margin:0 auto;width:100%}' +
    '.card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px}' +
    '.card-title{font-size:15px;font-weight:600;color:var(--cyan);margin-bottom:14px;display:flex;align-items:center;gap:8px}' +
    'label{display:block;font-size:12.5px;color:var(--text2);margin-bottom:6px;font-weight:500}' +
    'input,textarea,select{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:11px 14px;color:var(--text);font-size:14px;font-family:inherit;transition:border-color .2s;box-sizing:border-box}' +
    'input:focus,textarea:focus,select:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 2px rgba(0,229,255,.1)}' +
    'textarea{resize:vertical;min-height:90px}select{cursor:pointer}select option{background:var(--bg-card);color:var(--text)}' +
    '.form-group{margin-bottom:16px}' +
    '.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;min-height:44px;min-width:44px}' +
    '.btn-primary{background:linear-gradient(135deg,var(--cyan),#00b8d4);color:#080c18}.btn-primary:hover{opacity:.9;transform:translateY(-1px)}' +
    '.btn-secondary{background:var(--bg-card2);color:var(--cyan);border:1px solid var(--border-strong)}' +
    '.btn-secondary:hover{background:rgba(0,229,255,.1)}' +
    '.btn-ghost{background:none;color:var(--text2);border:1px solid var(--border);padding:6px 12px;font-size:12px;min-height:32px}.btn-ghost:hover{color:var(--cyan);border-color:var(--cyan)}' +
    '.btn-success{background:linear-gradient(135deg,#00e676,#00c853);color:#080c18}' +
    '.btn-purple{background:linear-gradient(135deg,var(--purple),#9c7cff);color:#fff}' +
    '.btn-orange{background:linear-gradient(135deg,#ff9f2b,#ff6f00);color:#080c18}' +
    '.btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}' +
    '.result-textarea{width:100%;min-height:220px;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:16px;color:var(--text);font-size:15px;line-height:1.7;font-family:inherit;resize:vertical;box-sizing:border-box}' +
    '.result-textarea:focus{outline:none;border-color:var(--cyan)}' +
    '.characters-list{display:flex;flex-wrap:wrap;gap:12px}' +
    '.character-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:16px;flex:1 1 280px;min-width:260px}' +
    '.character-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}' +
    '.character-name{font-weight:700;color:var(--cyan);font-size:14px}' +
    '.character-role{font-size:12px;color:var(--text3);margin-bottom:8px}' +
    '.character-prompt{font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap;word-break:break-word;background:var(--bg-input);padding:10px 12px;border-radius:8px;margin-bottom:8px;min-height:20px}' +
    '.scene-group{margin-bottom:20px}' +
    '.scene-group-title{color:var(--cyan);font-weight:700;font-size:15px;padding-bottom:8px;margin-bottom:12px;border-bottom:1px solid var(--border)}' +
    '.scene-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:12px}' +
    '.scene-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}' +
    '.scene-card-title{font-weight:600;color:var(--purple);font-size:13px}' +
    '.scene-prompt-text{font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap;word-break:break-word;background:var(--bg-input);padding:10px 12px;border-radius:8px;margin-bottom:8px;min-height:20px}' +
    '.scene-prompt-textarea{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--text);font-size:13px;line-height:1.6;font-family:inherit;resize:vertical;min-height:60px;box-sizing:border-box;margin-bottom:8px}' +
    '.scene-image-area{margin-top:10px;text-align:center}.scene-image-area img{max-width:100%;border-radius:8px;border:1px solid var(--border)}' +
    '.loading{display:none;align-items:center;gap:10px;color:var(--cyan);font-size:13px;padding:12px 0}.loading.show{display:flex}' +
    '.spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--cyan);border-radius:50%;animation:spin .8s linear infinite}' +
    '@keyframes spin{to{transform:rotate(360deg)}}' +
    '.error-box{display:none;background:rgba(255,82,82,.1);border:1px solid rgba(255,82,82,.3);color:var(--error);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px}.error-box.show{display:block}' +
    '.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:var(--bg-card2);border:1px solid var(--success);color:var(--success);padding:10px 20px;border-radius:8px;font-size:13px;z-index:1000;transition:transform .3s;max-width:90vw}' +
    '.toast.show{transform:translateX(-50%) translateY(0)}.toast.error{border-color:var(--error);color:var(--error)}' +
    '.login-prompt{text-align:center;padding:60px 20px}.login-prompt h2{color:var(--cyan);margin-bottom:12px}.login-prompt p{color:var(--text2);margin-bottom:20px}' +
    '.empty-note{color:var(--text3);font-size:13px;padding:16px;background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;text-align:center}' +
    '.section-badge{background:var(--error);color:#fff;font-weight:700;padding:3px 10px;border-radius:6px;font-size:12px;margin-right:8px}' +
    '@media(max-width:768px){.menu-btn{display:block}.sidebar{position:fixed;left:-260px;top:57px;bottom:0;z-index:99;transition:left .3s;box-shadow:4px 0 20px rgba(0,0,0,.5)}.sidebar.open{left:0}.main{padding:16px}.header-right .user-email{display:none}.revise-input-row{flex-direction:column;align-items:stretch}}' +
    '</style>';
}

// ---- Client Main Script (Template Literal — Client Code အတိုင်း ထည့်သည်) ----
function clientScript() {
  return `<script>
// ===== Story Studio — Step Flow Client =====
var AICS_STATE_KEY=${JSON.stringify(STORY_STATE_KEY)};
var AICS_STEP_DEFS=${JSON.stringify(stepsClientJson())};
var AICS_STEP_DATA=${JSON.stringify(buildClientData())};
${buildStepScripts()}
// ===== Helpers =====
function showToast(msg,type){var t=document.getElementById('toast');if(!t)return;var isErr=type==='error';t.innerHTML=(isErr?'⚠️ ':'✅ ')+escapeHtml(msg||'ပြီးပါပြီ');t.className='toast show'+(isErr?' error':'');setTimeout(function(){t.className='toast';},2500);}
function setLoading(id,show){var el=document.getElementById(id);if(el){if(show)el.classList.add('show');else el.classList.remove('show');}}
function showError(id,msg){var el=document.getElementById(id);if(!el)return;el.textContent=msg;el.classList.add('show');}
function hideError(id){var el=document.getElementById(id);if(el)el.classList.remove('show');}
function escapeHtml(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
// ===== App State + Engine =====
var AICS={
  steps:AICS_STEP_DEFS,
  flow:null,
  token:localStorage.getItem('aics_token')||'',
  isPro:(localStorage.getItem('aics_plan')||'')==='PRO',
  ideaType:'1',scnType:'1',chrEditIdx:null,
  scnScenes:[],scnChars:[],
  model:function(){var s=document.getElementById('aiModelSel');return s&&s.value?s.value:'';}
};
function apiCall(url,body){
  body.model=AICS.model();
  return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+AICS.token},body:JSON.stringify(body)})
    .then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.detail||data.error||'Request failed');return data;});});
}
function switchStep(id){
  if(AICS.flow.isLocked(id)){showToast('အရင် Step ပြီးအောင် လုပ်ပါ','error');return;}
  AICS.flow.activate(id);renderAll();
}
function renderAll(){
  var r=AICS.flow.resolve();
  var steps=document.querySelectorAll('.wr-step');
  for(var i=0;i<steps.length;i++){
    var id=steps[i].getAttribute('data-step');var st=r[id];
    steps[i].setAttribute('data-state',st);
    var ic=steps[i].querySelector('.st');
    if(ic)ic.textContent=(st==='completed'?'✓':(st==='stale'?'↻':(st==='error'?'✗':(st==='active'?'●':'○'))));
  }
  var cur=AICS.flow.currentId();
  var curIdx=0;for(var j=0;j<AICS.steps.length;j++)if(AICS.steps[j].id===cur)curIdx=j;
  var c=document.getElementById('stepCounter');if(c)c.textContent=' · Step '+(curIdx+1)+' of '+AICS.steps.length;
  var panels=document.querySelectorAll('.wr-panel');
  for(var k=0;k<panels.length;k++){
    var pid=panels[k].getAttribute('data-panel');
    panels[k].style.display=(pid===cur)?'block':'none';
  }
  try{
    if(cur==='idea'&&window.ideaHydrate)ideaHydrate();
    else if(cur==='character'&&window.chrHydrate)chrHydrate();
    else if(cur==='story'&&window.styHydrate)styHydrate();
    else if(cur==='scene'&&window.scnHydrate)scnHydrate();
    else if(cur==='result'&&window.resHydrate)resHydrate();
  }catch(e){console.error('[AICS] hydrate',e);}
}
function toggleDrawer(){
  var d=document.getElementById('drawer'),b=document.getElementById('drawerBackdrop');
  if(!d)return;
  d.classList.toggle('open');if(b)b.classList.toggle('show');
  var q=document.getElementById('drawerQuality');
  if(q){try{q.value=localStorage.getItem('aics_quality')||'standard';}catch(e){}}
  if(q)q.onchange=function(){try{localStorage.setItem('aics_quality',q.value);}catch(e){}};
}
// ===== Init =====
(function(){
  if(!AICS.token){document.getElementById('loginView').style.display='block';document.getElementById('appView').style.display='none';return;}
  var saved=null;try{var raw=localStorage.getItem(AICS_STATE_KEY);if(raw)saved=JSON.parse(raw);}catch(e){}
  AICS.flow=__aicsCreateStepFlow(AICS.steps,saved,AICS_STATE_KEY);
  renderAll();
})();
</script>`;
}

export function storyShellHtml() {
  return '<!DOCTYPE html>\n' +
    '<html lang="my">\n' +
    '<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<title>Story Studio — AI Creative Studio</title>\n' +
    baseCss() + workRoomCss() +
    '</head>\n' +
    '<body>\n' +
    '<div class="header">\n' +
    '<div class="header-left"><button class="menu-btn" onclick="toggleSidebar()">&#9776;</button><div class="logo">&#127912; AI Creative Studio</div></div>\n' +
    '<div class="header-right"><span class="user-email" id="userEmail">—</span><span class="plan-badge" id="planBadge">FREE</span></div>\n' +
    '</div>\n' +
    '<div class="layout">\n' +
    renderSidebar('story', { variant: 'studio' }) +
    '<div class="main">\n' +
    '<div id="loginView" class="login-prompt" style="display:none;"><h2>Login လုပ်ရန် လိုအပ်ပါသည်</h2><p>Story Studio ကို အသုံးပြုရန် Login ဝင်ပါ။</p><a href="/api/auth/login?next=/app/story" class="btn btn-primary">Google နဲ့ Login</a></div>\n' +
    '<div id="appView">\n' +
    '<div class="wr-shell">\n' +
    stepRailHtml(STORY_STEPS, STORY_STUDIO_NAME) +
    buildPanels() +
    '</div>\n' +
    '</div>\n' +
    '</div>\n' +
    '</div>\n' +
    // ---- Drawer (Settings) — Workspace မကျဉ်းအောင် ဘေးထွက် ----
    '<div class="drawer-backdrop" id="drawerBackdrop" onclick="toggleDrawer()"></div>\n' +
    '<div class="drawer" id="drawer">\n' +
    '<h4>&#9881; Settings <span style="font-size:11px;color:var(--text3);font-weight:400;">(Step ၏ ဘေးထွက် Panel)</span></h4>\n' +
    '<div class="form-group"><label>&#129302; AI Model</label><select id="aiModelSel" data-category="text"></select><p class="wr-note">ရွေးထားသော Model ဖြင့် Generate လုပ်ပါမည်</p></div>\n' +
    '<div class="form-group"><label>&#128218; Quality</label><select id="drawerQuality"><option value="standard">Standard</option><option value="high">High</option></select><p class="wr-note">Quality ရွေးချယ်မှုကို ဤ Browser တွင် မှတ်သားထားပါမည်</p></div>\n' +
    '</div>\n' +
    '<div class="toast" id="toast"></div>\n' +
    sidebarScript() +
    stepFlowScript() +
    clientScript() +
    '</body>\n' +
    '</html>';
}
