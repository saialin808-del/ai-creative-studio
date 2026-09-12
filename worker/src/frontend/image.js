// AI Creative Studio — Image Studio Frontend (IMAGE MAP + Workflow Implementation)
// Workflow: 01 Input → 02 AI Prepare → 03 Prompt → 04 Prepare Image → 05 AI Generate → 06 Image MAP
// Studio Isolation: ဤ File သည် Image Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Shared: renderSidebar / sidebarScript / renderStudioShell (frontend/shared.js)
// ⚠️ API Contract ကို မပျက်စီးစေရ — /api/studio/image/prompt (map field ပါ), /api/studio/image/generate ကို ဆက်ထိန်းသည်။
// Future Mode (Text→Image / Image→Image / Image Edit) အတွက် subject.referenceImage /
// environment.referenceImage field များကို structure တွင် ထားရှိသည် (ယခု null — မထည့်သွင်းရသေး)။

import { renderSidebar, sidebarScript, renderStudioShell } from './shared.js';

const STEPS = [
  { label: '01 အချက်အလက်' },
  { label: '02 AI ပြင်ဆင်နေသည်', lock: true },
  { label: '03 Prompt ရလဒ်', req: [2] },
  { label: '04 ပုံဖန်တီးရန် ပြင်ဆင်နေသည်', req: [3] },
  { label: '05 AI ပုံဖန်တီးနေသည်', lock: true, req: [4] },
  { label: '06 Image MAP / နောက်ဆုံးရလဒ်', req: [5] },
];

const STEP1_HTML = `
<div class="aics-step" data-step="1">
<div class="card">
<div class="card-title">&#127912; Image ဖန်တီးရန် အချက်အလက်</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">Type ရွေးပြီး ပုံအကြောင်း အပြည့်အစုံ ဖော်ပြပါ — AI က သင့်အတွက် Image Prompt ပြင်ဆင်ပေးပါမယ်။</p>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>ဓာတ်ပုံ အမျိုးအစား</label>
<select id="imgTypeSel" onchange="selectedImageType=this.value;">
<option value="1" selected>💡 Idea To Image (Free)</option>
<option value="2">👤 Character Design (Pro)</option>
<option value="3">📱 Social Media Thumbnail (Pro)</option>
<option value="4">🛒 Product Image (Pro)</option>
<option value="5">👤🛒 Character Product Ad (Pro)</option>
</select>
</div>
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>ဘယ်သူအတွက်</label>
<select id="audSel" onchange="window.aichAud=this.value;"><option>လူတိုင်း</option><option>လူငယ်</option><option>လူကြီး</option><option>ကလေး</option></select>
</div>
</div>
<div class="form-group">
<label>ပုံဖော်ပြချင်တဲ့ အကြောင်းအရာ *</label>
<textarea id="ideaInput" placeholder="ဥပမာ — အသက် ၂၅ နှစ် အမျိုးသား၊ အနက်ရောင် Jacket ဝတ်ထားပြီး Tokyo ညဈေးလမ်းမှာ ရပ်နေသည်..." style="min-height:120px;" oninput="autoExpand(this)"></textarea>
</div>
<div class="ref-upload-area">
<label>&#128444; Reference ပုံများ ပူးတွဲရန် (ချန်ထားလို့ရသည်)</label>
<input type="file" id="refInput" accept="image/*" multiple onchange="onRefSelected()">
<p class="ref-hint">အများဆုံး ၅ ပုံအထိ Upload တင်နိုင်ပါတယ် (ပုံတစ်ပုံချင်းစီ Max 5MB) — Image→Image Mode အတွက် နောင်တွင် အသုံးပြုနိုင်ပါမည်</p>
<div class="ref-preview" id="refPreview"></div>
</div>
<div class="error-box" id="prepareErr"></div>
</div>
</div>`;

const STEP2_HTML = `
<div class="aics-step" data-step="2">
<div class="card">
<div class="loading-card">
<div class="spinner"></div>
<div class="loading-title">&#10024; AI ပြင်ဆင်နေသည်...</div>
<p class="loading-sub">သင့်အချက်အလက်ကို အခြေခံပြီး Image Prompt ကို ပြင်ဆင်နေပါသည် — မိနစ်အနည်းငယ် ကြာနိုင်ပါသည်</p>
<div class="status-list" id="prepareStatus">
<div class="st-line" data-idx="0"><span class="st-marker">○</span><span>အချက်အလက်များကို ဖတ်နေသည်</span></div>
<div class="st-line" data-idx="1"><span class="st-marker">○</span><span>ပုံအကြောင်းအရာကို ခွဲခြမ်းနေသည်</span></div>
<div class="st-line" data-idx="2"><span class="st-marker">○</span><span>Image Prompt ရေးသားနေသည်</span></div>
<div class="st-line" data-idx="3"><span class="st-marker">○</span><span>Prompt ကို စစ်ဆေးနေသည်</span></div>
</div>
<div class="error-box" id="prepareErr2"></div>
<div class="retry-row" id="prepareRetry"><button class="btn btn-secondary" onclick="preparePrompt()">&#8635; ပြန်ကြိုးစားရန်</button></div>
</div>
</div>
</div>`;

const STEP3_HTML = `
<div class="aics-step" data-step="3">
<div class="card">
<div class="card-title">&#128221; Image Prompt Result</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">AI က သင့်အချက်အလက်ကို အခြေခံပြီး Image Prompt ပြင်ဆင်ပေးပြီးပါပြီ — အောက်က Prompt ကို တိုက်ရိုက် ပြင်ဆင်နိုင်ပါတယ်။</p>
<textarea class="result-textarea" id="promptResult" placeholder="Prompt ဒီနေရာမှာ ပေါ်ပါမယ် — တိုက်ရိုက်ပြင်နိုင်ပါတယ်" oninput="onPromptEdit(this)"></textarea>
<p class="hint-note">&#9997; ပြင်ဆင်ထားသော Prompt ကို နောက်အဆင့်သို့ အလိုအလျောက် ပို့ပေးပါမည် — Copy / Paste မလိုပါ</p>
</div>
</div>`;

const STEP4_HTML = `
<div class="aics-step" data-step="4">
<div class="card">
<div class="card-title">&#128295; Image ဖန်တီးရန် ပြင်ဆင်ခြင်း</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">Step 03 မှာ သင်ပြင်ဆင်ထားသော နောက်ဆုံး Prompt ကို အလိုအလျောက် ထည့်ပေးထားပါသည် — လိုအပ်ရင် ထပ်ပြင်ပြီး "AI ပုံဖန်တီးရန်" နှိပ်ပါ။</p>
<div class="form-group">
<label>&#128221; အသုံးပြုမည့် နောက်ဆုံး Prompt</label>
<textarea id="prepPromptInput" placeholder="Prompt ဒီနေရာမှာ အလိုအလျောက် ရောက်ပါမယ်" style="min-height:160px;" oninput="autoExpand(this)"></textarea>
</div>
<div class="error-box" id="genErr"></div>
</div>
</div>`;

const STEP5_HTML = `
<div class="aics-step" data-step="5">
<div class="card">
<div class="loading-card">
<div class="spinner"></div>
<div class="loading-title">&#10024; AI ဖန်တီးနေသည်...</div>
<p class="loading-sub">သင့် Prompt ကို အခြေခံပြီး ပုံအစစ် ဖန်တီးနေပါသည် — မိနစ်အနည်းငယ် ကြာနိုင်ပါသည်</p>
<div class="status-list" id="genStatus">
<div class="st-line" data-idx="0"><span class="st-marker">○</span><span>Prompt ကို ဖတ်နေသည်</span></div>
<div class="st-line" data-idx="1"><span class="st-marker">○</span><span>ပုံဖွဲ့စည်းပုံကို ဆုံးဖြတ်နေသည်</span></div>
<div class="st-line" data-idx="2"><span class="st-marker">○</span><span>AI ပုံဆွဲနေသည်</span></div>
<div class="st-line" data-idx="3"><span class="st-marker">○</span><span>ပုံအရည်အသွေး စစ်ဆေးနေသည်</span></div>
</div>
<div class="error-box" id="genErr5"></div>
<div class="retry-row" id="genRetry5"><button class="btn btn-secondary" onclick="startGenerate()">&#8635; ပြန်ကြိုးစားရန်</button></div>
</div>
</div>
</div>`;

const STEP6_HTML = `
<div class="aics-step" data-step="6">
<div id="imageMapArea"></div>
</div>`;

const STEPS_HTML = STEP1_HTML + STEP2_HTML + STEP3_HTML + STEP4_HTML + STEP5_HTML + STEP6_HTML;

export const IMAGE_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Image Studio — AI Creative Studio</title>
<style>
:root{--bg:#080c18;--bg-card:#0d1424;--bg-card2:#111a2e;--bg-input:#0a1020;--border:rgba(0,229,255,0.15);--border-strong:rgba(0,229,255,0.35);--cyan:#00e5ff;--purple:#7b5cff;--text:#e8ecf4;--text2:#8b95a8;--text3:#5a6478;--success:#00e676;--error:#ff5252;--warn:#ffc107}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans Myanmar','Roboto','Segoe UI',Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:14px;line-height:1.6}
a{color:var(--cyan);text-decoration:none}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px}
.card-title{font-size:15px;font-weight:600;color:var(--cyan);margin-bottom:14px;display:flex;align-items:center;gap:8px}
label{display:block;font-size:12.5px;color:var(--text2);margin-bottom:6px;font-weight:500}
input,textarea,select{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:14px;padding:11px 14px;color:var(--text);font-size:14px;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
input:focus,textarea:focus,select:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 2px rgba(0,229,255,.1)}
textarea{resize:vertical;min-height:70px}
select{cursor:pointer}
select option{background:var(--bg-card);color:var(--text)}
.form-group{margin-bottom:16px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;min-height:44px;min-width:44px}
.btn-primary{background:linear-gradient(135deg,var(--cyan),#00b8d4);color:#080c18}
.btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-success{background:linear-gradient(135deg,#00e676,#00c853);color:#080c18}
.btn-purple{background:linear-gradient(135deg,var(--purple),#9c7cff);color:#fff}
.btn-secondary{background:var(--bg-card2);color:var(--cyan);border:1px solid var(--border-strong)}
.btn-secondary:hover{background:rgba(0,229,255,.1)}
.btn-ghost{background:none;color:var(--text2);border:1px solid var(--border);padding:6px 12px;font-size:12px;min-height:32px}
.btn-ghost:hover{color:var(--cyan);border-color:var(--cyan)}
.btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.ref-upload-area{margin-top:14px}
.ref-upload-area input[type="file"]{padding:10px;background:var(--bg-input);color:var(--text2);border:1px dashed var(--border-strong);border-radius:8px;font-size:13px}
.ref-hint{color:var(--text3);font-size:12px;margin-top:6px;line-height:1.5}
.ref-preview{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
.ref-thumb{position:relative;width:72px;height:72px}
.ref-thumb img{width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--border);display:block}
.ref-thumb .remove-x{position:absolute;top:-7px;right:-7px;width:24px;height:24px;border-radius:50%;background:var(--error);color:#fff;border:none;font-size:13px;line-height:24px;text-align:center;cursor:pointer;padding:0;min-height:24px;min-width:24px}
.result-textarea{width:100%;min-height:160px;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:14px;color:var(--text);font-size:14px;line-height:1.7;font-family:inherit;resize:vertical;box-sizing:border-box;overflow:hidden}
.result-textarea:focus{outline:none;border-color:var(--cyan)}
.hint-note{color:var(--text3);font-size:12px;margin-top:10px;font-style:italic}
.error-box{display:none;background:rgba(255,82,82,.1);border:1px solid rgba(255,82,82,.3);color:var(--error);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px;white-space:pre-wrap}
.error-box.show{display:block}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:var(--bg-card2);border:1px solid var(--success);color:var(--success);padding:10px 20px;border-radius:8px;font-size:13px;z-index:1000;transition:transform .3s}
.toast.show{transform:translateX(-50%) translateY(0)}
.toast.error{border-color:var(--error);color:var(--error)}
.empty-note{color:var(--text3);font-size:13px;padding:16px;background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;text-align:center}
/* ===== Loading Cards (Step 02 / 05) ===== */
.loading-card{text-align:center;padding:40px 16px}
.loading-card .spinner{width:38px;height:38px;border-width:4px;margin:0 auto 18px}
.spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--cyan);border-radius:50%;animation:spin .8s linear infinite;display:inline-block;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-title{font-size:17px;font-weight:700;color:var(--cyan);margin-bottom:6px}
.loading-sub{color:var(--text2);font-size:13px;margin-bottom:16px}
.status-list{max-width:440px;margin:0 auto;text-align:left}
.st-line{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;color:var(--text2);font-size:14px;opacity:.5;transition:all .2s}
.st-line .st-marker{width:22px;text-align:center;flex-shrink:0;font-weight:700;color:var(--text3)}
.st-line.active{opacity:1;color:var(--text);background:rgba(0,229,255,.06)}
.st-line.active .st-marker{color:var(--cyan)}
.st-line.done{opacity:1;color:var(--text)}
.st-line.done .st-marker{color:var(--success)}
.retry-row{display:none;justify-content:center;margin-top:16px}
.retry-row.show{display:flex}
/* ===== IMAGE MAP (Step 06) ===== */
.map-intro{text-align:center;margin-bottom:18px}
.map-title-lg{font-size:20px;font-weight:800;letter-spacing:.5px;background:linear-gradient(90deg,var(--purple),var(--cyan));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.map-intro p{color:var(--text2);font-size:13px;margin-top:4px}
.map-card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;margin-bottom:14px;overflow:hidden}
.map-card-head{display:flex;align-items:center;gap:10px;padding:13px 16px;background:linear-gradient(90deg,rgba(123,92,255,.10),rgba(0,229,255,.04));border-bottom:1px solid var(--border)}
.map-icon{font-size:17px;flex-shrink:0}
.map-title{font-size:13.5px;font-weight:700;letter-spacing:.8px;color:var(--text);flex:1}
.map-edit-btn{margin-left:auto;background:rgba(0,229,255,.10);border:1px solid rgba(0,229,255,.35);color:var(--cyan);padding:6px 14px;border-radius:8px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;flex-shrink:0;transition:all .2s}
.map-edit-btn:hover{background:rgba(0,229,255,.2)}
.map-card-body{padding:14px 16px}
.map-desc{color:var(--text);font-size:14px;line-height:1.7;white-space:pre-wrap;word-break:break-word}
.map-desc.map-empty{color:var(--text3);font-style:italic}
.map-edit-ta{width:100%;min-height:90px;background:var(--bg-input);border:1px solid var(--border-strong);border-radius:10px;padding:12px;color:var(--text);font-size:14px;line-height:1.6;font-family:inherit;box-sizing:border-box}
.map-edit-ta:focus{outline:none;border-color:var(--cyan)}
.map-edit-actions{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.map-regen-btn{margin-top:12px}
.map-final-img img{width:100%;border-radius:10px;border:1px solid var(--border-strong);display:block}
.map-img-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.map-img-actions .btn{flex:1;min-width:120px;padding:10px 12px;font-size:13px}
.map-loading{text-align:center;padding:30px 16px}
.map-loading .spinner{width:34px;height:34px;border-width:4px;margin:0 auto 14px}
.map-card .error-box{margin-top:12px}
@media(max-width:768px){.map-img-actions{flex-direction:column}.map-img-actions .btn{width:100%}.card{padding:14px}.map-card-head{padding:12px 14px}.map-card-body{padding:12px 14px}}
</style>
</head>
<body>
<div id="loginView" class="aics-login-overlay" style="display:none;"><div class="aics-login-box"><h2>Login လုပ်ရန် လိုအပ်ပါသည်</h2><p>Image Studio ကို အသုံးပြုရန် Google နဲ့ Login ဝင်ပါ။</p><a href="/api/auth/login?next=/app/image" class="btn btn-primary">Google နဲ့ Login</a></div></div>
${renderStudioShell({
  id: 'image',
  activeId: 'image',
  nameMy: 'ပုံ Studio',
  desc: 'Generate stunning images with AI',
  icon: '🖼️',
  modelCat: 'image',
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

var MAX_REF=5;
var selectedImageType='1';
var refImages=[];
var originalIdea='';
var latestPrompt='';
var prepPrompt='';
var finalPromptManual=false;
var typewriterTimer=null;
var prepareBusy=false;
var generateBusy=false;
var regenBusy=false;
var statusTimers={};

// ===== IMAGE MAP State (Instruction Section 11) =====
var imageMap={
  subject:{description:'',referenceImage:null},
  style:{description:''},
  environment:{description:'',referenceImage:null},
  lighting:{description:''},
  camera:{description:''},
  finalPrompt:'',
  finalImage:null
};

(function init(){
  if(!token){document.getElementById('loginView').style.display='flex';document.getElementById('aicsApp').style.display='none';return;}
})();

// ===================== API =====================
function apiCall(url,body){
  var s=document.getElementById('aiModelSel');if(s&&s.value)body.model=s.value;
  return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.detail||data.error||'Request failed');return data;});});
}

// ===================== Reference Images (Tab 1) =====================
function onRefSelected(){
  var fileInput=document.getElementById('refInput');
  var files=fileInput.files;
  for(var i=0;i<files.length;i++){
    if(refImages.length>=MAX_REF){showToast('Reference ပုံ အများဆုံး '+MAX_REF+' ပုံပဲ တင်လို့ရပါတယ်။',true);break;}
    var file=files[i];
    if(file.size>5*1024*1024){showToast("'"+file.name+"' ပုံသည် 5MB ထက် ကျော်နေလို့ ကျော်သွားပါမည်။",true);continue;}
    addRefFile(file);
  }
  fileInput.value='';
}
function addRefFile(file){
  var reader=new FileReader();
  reader.onload=function(e){
    refImages.push({dataUrl:e.target.result,base64:e.target.result.split(',')[1],mimeType:file.type});
    renderRefPreviews();
  };
  reader.readAsDataURL(file);
}
function renderRefPreviews(){
  var container=document.getElementById('refPreview');
  if(!container)return;
  container.innerHTML='';
  refImages.forEach(function(img,idx){
    var thumb=document.createElement('div');
    thumb.className='ref-thumb';
    var imgEl=document.createElement('img');
    imgEl.src=img.dataUrl;
    var removeBtn=document.createElement('button');
    removeBtn.className='remove-x';
    removeBtn.textContent='✕';
    removeBtn.onclick=function(){removeRef(idx);};
    thumb.appendChild(imgEl);
    thumb.appendChild(removeBtn);
    container.appendChild(thumb);
  });
}
function removeRef(idx){
  refImages.splice(idx,1);
  renderRefPreviews();
}

// ===================== Step 01 → 02 → 03 (AI Prepare Prompt) =====================
function checkTypeAllowed(){
  var proTypes={2:true,3:true,4:true,5:true};
  if(proTypes[selectedImageType]&&!isPro){
    showToast('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။',true);
    return false;
  }
  return true;
}

function preparePrompt(){
  if(prepareBusy)return;
  var ideaEl=document.getElementById('ideaInput');
  var idea=ideaEl?ideaEl.value.trim():'';
  if(!idea){showError('prepareErr','ပုံဖော်ပြချင်တဲ့ အကြောင်းအရာ အနည်းဆုံး ဖြည့်ရေးပါ');return;}
  if(!checkTypeAllowed())return;
  hideError('prepareErr');
  hideStepError('prepareErr2','prepareRetry');
  var aud=document.getElementById('audSel');
  originalIdea=idea;
  if(aud&&aud.value)idea+='\\n\\nAudience: '+aud.value;
  prepareBusy=true;
  stopTypewriter();
  if(window.studioForceGoStep)window.studioForceGoStep(2);else window.studioGoStep(2);
  startStatusAnim('prepareStatus');
  if(window.studioSetLoading)window.studioSetLoading(true);
  var body={idea:idea,type:selectedImageType};
  if(refImages.length>0){
    body.images=refImages.map(function(img){return{base64:img.base64,mimeType:img.mimeType};});
  }
  apiCall('/api/studio/image/prompt',body)
    .then(function(data){
      var promptText=(data&&data.prompt)?data.prompt:'';
      applyMapData((data&&data.map)?data.map:null,promptText);
      latestPrompt=promptText||buildFinalPromptFromMap();
      stopStatusAnim('prepareStatus',true);
      if(window.studioSetLoading)window.studioSetLoading(false);
      prepareBusy=false;
      studioMarkDone(1);
      studioMarkDone(2);
      var ta=document.getElementById('promptResult');
      if(ta)typewrite(latestPrompt,ta);
      if(window.studioForceGoStep)window.studioForceGoStep(3);else window.studioGoStep(3);
      showToast('✓ Image Prompt ပြင်ဆင်ပြီးပါပြီ');
      autoSave();
    })
    .catch(function(err){
      console.error('Image Prompt Prepare Error:', err);
      stopStatusAnim('prepareStatus',false);
      if(window.studioSetLoading)window.studioSetLoading(false);
      prepareBusy=false;
      showStepError('prepareErr2','prepareRetry',friendlyMsg(err,'prepare'));
      // Error → သက်ဆိုင်ရာ Input Step (01) သို့ Auto Back — Processing Step (02) ကို Done မသတ်မှတ်ရ
      if(window.studioUnmarkDone)window.studioUnmarkDone(2);
      showToast('⚠️ '+(friendlyMsg(err,'prepare').replace(/\\n/g,' ')),true);
      if(window.studioForceGoStep)window.studioForceGoStep(1);
    });
}

// Backend MAP (ရှိလျှင်) ကို imageMap state သို့ ထည့်သည် — မရှိလျှင် fallback (တစ်ပိုင်းလုံး subject)
function applyMapData(map,promptText){
  var p=promptText||'';
  if(map&&(map.subject||map.style||map.environment||map.lighting||map.camera||map.finalPrompt)){
    imageMap.subject.description=(map.subject&&map.subject.description)?map.subject.description:'';
    imageMap.style.description=(map.style&&map.style.description)?map.style.description:'';
    imageMap.environment.description=(map.environment&&map.environment.description)?map.environment.description:'';
    imageMap.lighting.description=(map.lighting&&map.lighting.description)?map.lighting.description:'';
    imageMap.camera.description=(map.camera&&map.camera.description)?map.camera.description:'';
    imageMap.finalPrompt=(map.finalPrompt&&map.finalPrompt.trim())?map.finalPrompt:buildFinalPromptFromMap();
  }else{
    imageMap.subject.description=p;
    imageMap.style.description='';
    imageMap.environment.description='';
    imageMap.lighting.description='';
    imageMap.camera.description='';
    imageMap.finalPrompt=p;
  }
  finalPromptManual=false;
  imageMap.finalImage=null;
}

function buildFinalPromptFromMap(){
  var parts=[
    imageMap.subject.description,
    imageMap.style.description,
    imageMap.environment.description,
    imageMap.lighting.description,
    imageMap.camera.description
  ];
  return parts.filter(function(s){return s&&s.trim();}).join(', ');
}

// ===================== 03 → 04 (Latest Prompt auto-transfer) =====================
function goPrepare(){
  var ta=document.getElementById('promptResult');
  stopTypewriter();
  if(ta)latestPrompt=ta.value;
  if(!latestPrompt||!latestPrompt.trim()){showToast('Prompt မရှိသေးပါ — ပြန်ပြင်ဆင်ပါ',true);return;}
  prepPrompt=latestPrompt;
  imageMap.finalPrompt=latestPrompt;
  finalPromptManual=false;
  var pta=document.getElementById('prepPromptInput');
  if(pta){pta.value=prepPrompt;autoExpand(pta);}
  studioMarkDone(3);
  window.studioGoStep(4);
  autoSave();
}

// ===================== Step 04 → 05 → 06 (Generate Actual Image) =====================
function startGenerate(){
  if(generateBusy)return;
  var ta=document.getElementById('prepPromptInput');
  var p=ta?(ta.value||'').trim():'';
  if(!p){showError('genErr','ပုံဖန်တီးဖို့ Prompt လိုအပ်ပါသည် — အရင်ဆုံး Prompt ပြင်ဆင်ပါ');return;}
  hideError('genErr');
  hideStepError('genErr5','genRetry5');
  generateBusy=true;
  prepPrompt=p;
  if(window.studioForceGoStep)window.studioForceGoStep(5);else window.studioGoStep(5);
  startStatusAnim('genStatus');
  if(window.studioSetLoading)window.studioSetLoading(true);
  apiCall('/api/studio/image/generate',{prompt:p})
    .then(function(data){
      imageMap.finalImage={data:data.data,mimeType:data.mimeType};
      stopStatusAnim('genStatus',true);
      if(window.studioSetLoading)window.studioSetLoading(false);
      generateBusy=false;
      studioMarkDone(4);
      studioMarkDone(5);
      if(window.studioForceGoStep)window.studioForceGoStep(6);else window.studioGoStep(6);
      renderMap();
      showToast('✓ ပုံဖန်တီးပြီးပါပြီ');
      autoSave();
    })
    .catch(function(err){
      console.error('Image Generate Error:', err);
      stopStatusAnim('genStatus',false);
      if(window.studioSetLoading)window.studioSetLoading(false);
      generateBusy=false;
      showStepError('genErr5','genRetry5',friendlyMsg(err,'generate'));
      // Error → သက်ဆိုင်ရာ Input / Setup Step (04) သို့ Auto Back — Processing Step (05) ကို Done မသတ်မှတ်ရ
      if(window.studioUnmarkDone)window.studioUnmarkDone(5);
      showToast('⚠️ '+(friendlyMsg(err,'generate').replace(/\\n/g,' ')),true);
      if(window.studioForceGoStep)window.studioForceGoStep(4);
    });
}

// ===================== MAP Regenerate (Updated MAP → Final Prompt → API → New Image) =====================
function regenerateImage(){
  if(regenBusy)return;
  var p=(imageMap.finalPrompt&&imageMap.finalPrompt.trim())?imageMap.finalPrompt:buildFinalPromptFromMap();
  if(!p){showToast('MAP ထဲမှာ ဖော်ပြချက် မရှိသေးပါ — အရင်ဆုံး Prompt ပြင်ဆင်ပါ',true);return;}
  hideError('regenError');
  regenBusy=true;
  setRegenLoading(true);
  apiCall('/api/studio/image/generate',{prompt:p})
    .then(function(data){
      imageMap.finalImage={data:data.data,mimeType:data.mimeType};
      regenBusy=false;
      setRegenLoading(false);
      renderMap();
      showToast('✓ ပုံအသစ် ဖန်တီးပြီးပါပြီ');
      autoSave();
    })
    .catch(function(err){
      regenBusy=false;
      setRegenLoading(false);
      var wrap=document.getElementById('mapImgWrap');
      if(wrap)renderMapImageInto(wrap);
      showError('regenError',friendlyMsg(err,'generate'));
    });
}
function setRegenLoading(on){
  var wrap=document.getElementById('mapImgWrap');
  if(!wrap)return;
  if(on){
    wrap.innerHTML='<div class="map-loading"><div class="spinner"></div><div class="loading-title" style="font-size:15px;">&#10024; AI ဖန်တီးနေသည်...</div><p class="loading-sub">ပုံအသစ် ဖန်တီးနေပါသည်</p></div>';
  }
}

// ===================== IMAGE MAP Render (Step 06) =====================
function renderMap(){
  var area=document.getElementById('imageMapArea');
  if(!area)return;
  var sections=[
    {key:'subject',icon:'👤',title:'SUBJECT'},
    {key:'style',icon:'🎨',title:'STYLE'},
    {key:'environment',icon:'🌍',title:'ENVIRONMENT'},
    {key:'lighting',icon:'💡',title:'LIGHTING'},
    {key:'camera',icon:'📷',title:'CAMERA'}
  ];
  var html='<div class="map-intro"><div class="map-title-lg">🗺️ IMAGE MAP</div><p>ပုံဖန်တီးမှု အချက်အလက်များ — Section တစ်ခုချင်းစီကို ✏️ Edit နှိပ်ပြီး ပြင်နိုင်ပါသည်။ Section တစ်ခုပြင်လျှင် Final Prompt သာ အလိုအလျောက် Update ဖြစ်ပါမည်။</p></div>';
  for(var i=0;i<sections.length;i++){
    var s=sections[i];
    var desc=(imageMap[s.key]&&imageMap[s.key].description)?imageMap[s.key].description:'';
    html+=mapCardHTML(s.icon,s.title,s.key,desc,false);
  }
  html+=mapCardHTML('✨','FINAL PROMPT','finalPrompt',imageMap.finalPrompt||'',true);
  html+='<div class="map-card map-image-card">' +
    '<div class="map-card-head"><span class="map-icon">🖼️</span><span class="map-title">FINAL IMAGE</span></div>' +
    '<div class="map-card-body"><div id="mapImgWrap"></div>' +
    '<div class="map-img-actions">' +
    '<button class="btn btn-secondary" onclick="scrollMapTop()">✏️ MAP ပြင်ရန်</button>' +
    '<button class="btn btn-purple" onclick="regenerateImage()">🔄 ပြန်ဖန်တီးရန်</button>' +
    '<button class="btn btn-success" onclick="downloadImage()">⬇️ Download</button>' +
    '</div>' +
    '<div class="error-box" id="regenError"></div>' +
    '</div></div>';
  area.innerHTML=html;
  var wrap=document.getElementById('mapImgWrap');
  if(wrap)renderMapImageInto(wrap);
}

function mapCardHTML(icon,title,key,desc,isPrompt){
  var descHtml=desc
    ?('<div class="map-desc">'+escapeHtml(desc)+'</div>')
    :('<div class="map-desc map-empty">(မဖြည့်ရသေးပါ)</div>');
  var extra='';
  if(isPrompt&&imageMap.finalPrompt){
    extra='<button class="btn btn-purple map-regen-btn" onclick="regenerateImage()">🔄 ပြန်ဖန်တီးရန်</button>';
  }
  return '<div class="map-card">' +
    '<div class="map-card-head"><span class="map-icon">'+icon+'</span><span class="map-title">'+title+'</span>' +
    '<button class="map-edit-btn" onclick="editMapSection(\\''+key+'\\')">✏️ Edit</button></div>' +
    '<div class="map-card-body" id="mapBody_'+key+'">'+descHtml+extra+'</div>' +
    '</div>';
}

// ===================== MAP Section Edit (တစ်ခုချင်းစီသာ ပြင်သည်) =====================
function editMapSection(key){
  var body=document.getElementById('mapBody_'+key);
  if(!body)return;
  var cur=(key==='finalPrompt')
    ?imageMap.finalPrompt
    :((imageMap[key]&&imageMap[key].description)||'');
  var ph=(key==='finalPrompt')?'Final Prompt ရေးပါ':'ဖော်ပြချက် ရေးပါ';
  body.innerHTML='<textarea class="map-edit-ta" id="mapEdit_'+key+'" placeholder="'+ph+'">'+escapeHtml(cur)+'</textarea>' +
    '<div class="map-edit-actions">' +
    '<button class="btn btn-success" onclick="saveMapSection(\\''+key+'\\')">💾 သိမ်းရန်</button>' +
    '<button class="btn btn-ghost" onclick="renderMap()">မလုပ်တော့ပါ</button>' +
    '</div>';
  var ta=document.getElementById('mapEdit_'+key);
  if(ta){ta.focus();autoExpand(ta);}
}

function saveMapSection(key){
  var ta=document.getElementById('mapEdit_'+key);
  var val=ta?(ta.value||'').trim():'';
  if(key==='finalPrompt'){
    imageMap.finalPrompt=val;
    finalPromptManual=true;
  }else{
    if(imageMap[key])imageMap[key].description=val;
    imageMap.finalPrompt=buildFinalPromptFromMap();
    finalPromptManual=false;
  }
  renderMap();
  showToast('✓ MAP ပြင်ပြီးပါပြီ — Final Prompt ကိုလည်း Update လုပ်ပြီးပါပြီ');
  autoSave();
}

function scrollMapTop(){
  var area=document.getElementById('imageMapArea');
  if(area)area.scrollIntoView({behavior:'smooth',block:'start'});
}

function renderMapImageInto(wrap){
  if(!wrap)return;
  if(imageMap.finalImage){
    wrap.innerHTML='<div class="map-final-img"><img src="data:'+imageMap.finalImage.mimeType+';base64,'+imageMap.finalImage.data+'" alt="Final Image"></div>';
  }else{
    wrap.innerHTML='<div class="empty-note">🖼️ ပုံမရှိသေးပါ — "🔄 ပြန်ဖန်တီးရန်" နှိပ်ပြီး Final Prompt မှ ပုံဖန်တီးပါ</div>';
  }
}

// ===================== Actions =====================
function copyPrompt(){
  var text=imageMap.finalPrompt||latestPrompt||'';
  if(!text){showToast('Copy လုပ်ဖို့ Prompt မရှိသေးပါ',true);return;}
  copyToClipboard(text);
  showToast('✓ Copy ပြီးပါပြီ');
}

function saveToCreations(){
  var resultText=imageMap.finalPrompt||latestPrompt||'';
  if(!resultText){showToast('Save လုပ်ဖို့ Result မရှိသေးပါ',true);return;}
  var topic=originalIdea||'Image Creation';
  var defaultTitle=topic.substring(0,40)+(topic.length>40?'...':'');
  var title=prompt('Creation အမည် ပေးပါ:',defaultTitle);
  if(title===null)return;
  var media=imageMap.finalImage||null;
  AICS_CREATIONS.save({
    studio:'IMAGE',
    type:selectedImageType,
    original_prompt:originalIdea,
    ai_output:resultText,
    title:title||defaultTitle,
    media_type:media?'image':'',
    media_mime:media?media.mimeType:'',
    media_data:media?media.data:''
  })
    .then(function(){showToast('💾 My Creations ထဲ Save ပြီးပါပြီ');})
    .catch(function(err){showToast('Save မအောင်မြင်ပါ: '+((err&&err.message)||'Error'),true);});
}

function downloadImage(){
  var m=imageMap.finalImage;
  if(!m){showToast('Download လုပ်ဖို့ ပုံမရှိသေးပါ',true);return;}
  var a=document.createElement('a');
  a.href='data:'+m.mimeType+';base64,'+m.data;
  a.download='image_studio_output.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('✓ Download စတင်ပါပြီ');
}

// ===================== Typewriter + Auto Expand =====================
function stopTypewriter(){if(typewriterTimer){clearInterval(typewriterTimer);typewriterTimer=null;}}
function autoExpand(ta){if(!ta)return;ta.style.height='auto';ta.style.height=(ta.scrollHeight+2)+'px';}
function typewrite(text,ta){
  stopTypewriter();
  if(!ta)return;
  ta.value='';autoExpand(ta);
  var i=0,total=text.length;
  var step=Math.max(1,Math.round(total/150));
  typewriterTimer=setInterval(function(){
    i+=step;
    if(i>=total){ta.value=text;stopTypewriter();autoExpand(ta);latestPrompt=text;return;}
    ta.value=text.slice(0,i);
    autoExpand(ta);
  },18);
}
function onPromptEdit(ta){
  stopTypewriter();
  if(ta){latestPrompt=ta.value;autoExpand(ta);}
}

// ===================== Status Animation =====================
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

// ===================== Error Helpers =====================
function friendlyMsg(err,kind){
  var m=(err&&err.message)?String(err.message):'';
  if(kind==='prepare'){
    if(/missing_idea/.test(m))return 'ပုံဖော်ပြချင်တဲ့ အကြောင်းအရာ အနည်းဆုံး ဖြည့်ရေးပါ။';
    if(/pro_only|feature_disabled/.test(m))return 'ဒီ Feature ကို ယခု အသုံးပြုခွင့် မရှိပါ။';
    if(/unauthorized|invalid_token/.test(m))return 'Login သက်တမ်း ကုန်သွားပါပြီ။ ပြန် Login ဝင်ပါ။';
    if(/fetch|network|failed/i.test(m))return '⚠️ Image Prompt ပြင်ဆင်၍ မရပါ။\\nAI Server မှ တုံ့ပြန်မှု မရရှိပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
    return '⚠️ Image Prompt ပြင်ဆင်၍ မရပါ။\\nကျေးဇူးပြု၍ ပြန်လည်ကြိုးစားပါ။';
  }
  if(kind==='generate'){
    if(/missing_prompt/.test(m))return 'Prompt မရှိပါ — ပြန်ပြင်ဆင်ပါ။';
    if(/unauthorized|invalid_token/.test(m))return 'Login သက်တမ်း ကုန်သွားပါပြီ။ ပြန် Login ဝင်ပါ။';
    if(/fetch|network|failed/i.test(m))return '❌ Image ဖန်တီး၍ မရပါ။\\nAI Server မှ တုံ့ပြန်မှု မရရှိပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
    return '❌ Image ဖန်တီး၍ မရပါ။\\nကျေးဇူးပြု၍ ပြန်လည်ကြိုးစားပါ။';
  }
  return '⚠️ လုပ်ဆောင်၍ မရပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
}
function showError(id,msg){var el=document.getElementById(id);if(!el)return;el.textContent=msg;el.classList.add('show');}
function hideError(id){var el=document.getElementById(id);if(!el)return;el.classList.remove('show');}
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
function showToast(msg,isError){
  var t=document.getElementById('toast');
  t.textContent=msg;
  if(isError)t.classList.add('error');else t.classList.remove('error');
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},2500);
}
function escapeHtml(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function copyToClipboard(text){
  if(navigator.clipboard)navigator.clipboard.writeText(text);
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);}
}

// ===================== Stepper Actions =====================
function bReset(){return {label:'Reset',cls:'ghost',fn:studioReset};}

function studioOnStep(n){
  if(n===1){
    studioSetActions([bReset(),{label:'✨ Image Prompt ဖန်တီးရန်',cls:'primary',fn:preparePrompt}]);
  }else if(n===2){
    studioSetActions([]);
  }else if(n===3){
    var ta=document.getElementById('promptResult');
    if(ta)autoExpand(ta);
    studioSetActions([
      {label:'&#8592; Back',cls:'ghost',fn:function(){window.studioGoStep(1);}},
      bReset(),
      {label:'&#128203; Copy Prompt',cls:'secondary',fn:copyPrompt},
      {label:'&#128190; ဖန်တီးမှုသိမ်းပါ',cls:'purple',fn:saveToCreations},
      {label:'&#128295; ပုံဖန်တီးရန် ပြင်ဆင်မည်',cls:'primary',fn:goPrepare}
    ]);
  }else if(n===4){
    var pta=document.getElementById('prepPromptInput');
    if(pta&&!pta.value){pta.value=prepPrompt||'';autoExpand(pta);}
    studioSetActions([
      {label:'&#8592; Back',cls:'ghost',fn:function(){window.studioGoStep(3);}},
      bReset(),
      {label:'&#10024; AI ပုံဖန်တီးရန်',cls:'primary',fn:startGenerate}
    ]);
  }else if(n===5){
    studioSetActions([]);
  }else if(n===6){
    studioSetActions([
      {label:'&#8592; Back',cls:'ghost',fn:function(){window.studioGoStep(4);}},
      bReset(),
      {label:'&#128203; Copy Prompt',cls:'secondary',fn:copyPrompt},
      {label:'&#128190; ဖန်တီးမှုသိမ်းပါ',cls:'purple',fn:saveToCreations},
      {label:'&#128190; Save Image',cls:'success',fn:downloadImage}
    ]);
    renderMap();
  }
}
window.studioOnStep=studioOnStep;

// ===================== Draft (studioCollectDraft / studioRestoreDraft) =====================
function studioCollectDraft(){
  return {
    stepNow:window.studioCur?window.studioCur():1,
    imageType:selectedImageType,
    aud:document.getElementById('audSel')?document.getElementById('audSel').value:'',
    idea:originalIdea,
    ideaText:document.getElementById('ideaInput')?document.getElementById('ideaInput').value:'',
    refCount:refImages.length,
    latestPrompt:latestPrompt,
    prepPrompt:document.getElementById('prepPromptInput')?document.getElementById('prepPromptInput').value:'',
    resultText:document.getElementById('promptResult')?document.getElementById('promptResult').value:'',
    map:{
      subject:imageMap.subject.description,
      style:imageMap.style.description,
      environment:imageMap.environment.description,
      lighting:imageMap.lighting.description,
      camera:imageMap.camera.description,
      finalPrompt:imageMap.finalPrompt
    },
    finalPromptManual:finalPromptManual,
    hasFinalImage:!!imageMap.finalImage,
    finalImage:imageMap.finalImage
  };
}
window.studioCollectDraft=studioCollectDraft;

function studioRestoreDraft(d){
  if(!d)return;
  if(d.imageType){selectedImageType=d.imageType;var ts=document.getElementById('imgTypeSel');if(ts)ts.value=String(selectedImageType);}
  var aud=document.getElementById('audSel');
  if(aud&&d.aud)aud.value=d.aud;
  if(aud)window.aichAud=aud.value;
  if(d.idea)originalIdea=d.idea;
  var ie=document.getElementById('ideaInput');
  if(ie&&d.ideaText!=null)ie.value=d.ideaText;
  latestPrompt=d.latestPrompt||'';
  var rt=document.getElementById('promptResult');
  if(rt&&d.resultText!=null){rt.value=d.resultText;autoExpand(rt);}
  prepPrompt=d.prepPrompt||latestPrompt;
  var pt=document.getElementById('prepPromptInput');
  if(pt&&d.prepPrompt!=null){pt.value=d.prepPrompt;autoExpand(pt);}
  if(d.map){
    imageMap.subject.description=d.map.subject||'';
    imageMap.style.description=d.map.style||'';
    imageMap.environment.description=d.map.environment||'';
    imageMap.lighting.description=d.map.lighting||'';
    imageMap.camera.description=d.map.camera||'';
    imageMap.finalPrompt=d.map.finalPrompt||'';
  }
  finalPromptManual=!!d.finalPromptManual;
  imageMap.finalImage=(d.finalImage&&d.finalImage.data)?d.finalImage:null;
  if(!imageMap.finalPrompt&&(imageMap.subject.description||latestPrompt)){
    imageMap.finalPrompt=latestPrompt||buildFinalPromptFromMap();
  }
  if(latestPrompt){studioMarkDone(1);studioMarkDone(2);}
  if(prepPrompt||latestPrompt){studioMarkDone(3);}
  if(imageMap.finalImage){studioMarkDone(4);studioMarkDone(5);}
  if(d.map&&(imageMap.subject.description||imageMap.style.description||imageMap.finalPrompt))renderMap();
  setTimeout(function(){
    var c=window.studioCur?window.studioCur():1;
    if(c===2){window.studioGoStep(latestPrompt?3:1);}
    else if(c===5){window.studioGoStep(imageMap.finalImage?6:4);}
    else if(c===3&&!latestPrompt){window.studioGoStep(1);}
    else if(c===4&&!prepPrompt&&!latestPrompt){window.studioGoStep(1);}
  },0);
}
window.studioRestoreDraft=studioRestoreDraft;

// ===================== Auto Save (Refresh ပြီးနောက် Data မပျောက်စေရ) =====================
function autoSave(){
  try{
    var data=studioCollectDraft();
    var envelope={step:window.studioCur?window.studioCur():1,data:data,savedAt:new Date().toISOString()};
    try{
      localStorage.setItem('aics_draft_image',JSON.stringify(envelope));
    }catch(e){
      // ပုံကြီးလွန်းလျှင် — Final Image မပါဘဲ သိမ်းသည် (flag သာ ထားသည်)
      data.hasFinalImage=!!imageMap.finalImage;
      data.finalImage=null;
      try{localStorage.setItem('aics_draft_image',JSON.stringify({step:envelope.step,data:data,savedAt:envelope.savedAt}));}catch(e2){}
    }
  }catch(e){}
}
</script>
</body>
</html>`;
