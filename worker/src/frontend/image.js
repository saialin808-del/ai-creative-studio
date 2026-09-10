// AI Creative Studio — Image Studio Frontend (Phase 6 + Master Instruction Phase 8)
// Workflow: Prompt → Customize → Generate → Result (+ Ad Image step)
// Studio Isolation: ဤ File သည် Image Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Shared: renderSidebar / sidebarScript / renderStudioShell (frontend/shared.js)
// ⚠️ API Contract / Business Logic မပြောင်းပါ — UI အခွံသာ ပြောင်းပါသည်။

import { renderSidebar, sidebarScript, renderStudioShell } from './shared.js';

const STEPS = [
  { label: 'ဖန်တီးရန်' },
  { label: 'ချိန်ညှိရန်', req: [] },
  { label: 'ဖန်တီးနေသည်', req: [2] },
  { label: 'အပြီးသတ်', req: [3] },
  { label: 'ကြော်ငြာပုံ', req: [1] },
];

const STEP1_HTML = `
<div class="aics-step" data-step="1">
<div class="card">
<div class="card-title">&#127912; Image Prompt</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">Type ရွေးပြီး ပုံအကြောင်း ဖော်ပြပါ — နောက်အဆင့်မှာ Customize လုပ်ပြီး Prompt ဖန်တီးပါမယ်။</p>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>ဓာတ်ပုံ အမျိုးအစား</label>
<select id="typeSel1" onchange="selectedType[1]=this.value;">
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
<div id="ideaFields1"></div>
<div class="ref-upload-area">
<label>&#128444; Reference ပုံများ ပူးတွဲရန် (ချန်ထားလို့ရသည်)</label>
<input type="file" id="refInput1" accept="image/*" multiple onchange="onRefSelected(1)">
<p class="ref-hint">အများဆုံး ၅ ပုံအထိ Upload တင်နိုင်ပါတယ် (ပုံတစ်ပုံချင်းစီ Max 5MB)</p>
<div class="ref-preview" id="refPreview1"></div>
</div>
</div>
</div>`;

const STEP2_HTML = `
<div class="aics-step" data-step="2">
<div class="card">
<div class="card-title">&#9881; Customize</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">ပုံအချိုးအစား၊ Caption နေရာ စသည်တို့ကို ရွေးပြီး Generate Image Prompt နှိပ်ပါ။</p>
<div id="customizeFields1"></div>
<div class="loading" id="loading1"><div class="spinner"></div> AI Image Prompt ရေးသားနေပါသည်...</div>
<div class="error-box" id="error1"></div>
</div>
</div>`;

const STEP3_HTML = `
<div class="aics-step" data-step="3">
<div class="card">
<div class="card-title">&#128221; Generated Prompt (Edit လို့ရပါတယ်)</div>
<textarea class="result-textarea" id="result1" placeholder="Prompt ဒီနေရာမှာ ပေါ်ပါမယ် — တိုက်ရိုက်ပြင်နိုင်ပါတယ်" style="min-height:140px;"></textarea>
<div class="btn-row">
<button class="btn btn-success" onclick="copyResult(1)">&#128203; Copy Prompt</button>
<button class="btn btn-purple" onclick="saveToCreations(1)">&#128190; Save to My Creations</button>
</div>
<div class="card" style="margin-top:16px;">
<div class="card-title">&#127912; AI ပုံအစစ် ဖန်တီးရန်</div>
<button class="btn btn-purple" id="imgBtn1" onclick="generateImage(1)">&#127912; Generate Image</button>
<div class="loading" id="imgLoading1"><div class="spinner"></div> AI ပုံဆွဲနေပါသည်... (မိနစ်အနည်းငယ် ကြာနိုင်ပါသည်)</div>
<div class="error-box" id="imgError1"></div>
<div class="image-result-area" id="imgArea1"></div>
<p class="hint-note">&#128161; ပုံကို "💾 Save Image" ခလုတ်ကနေ တိုက်ရိုက် Download ဆွဲပါ</p>
</div>
</div>
</div>`;

const STEP4_HTML = `
<div class="aics-step" data-step="4">
<div class="card">
<div class="card-title">&#127894; Result</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">ညာဘက် Preview မှာ နောက်ဆုံးပုံကို ကြည့်ပြီး အောက်က လုပ်ဆောင်ချက်များကို သုံးနိုင်ပါတယ်။</p>
<div class="btn-row">
<button class="btn btn-success" onclick="copyResult(1)">&#128203; Copy Prompt</button>
<button class="btn btn-purple" onclick="saveToCreations(1)">&#128190; Save to My Creations</button>
<button class="btn btn-orange" onclick="saveImage(1)">&#128190; Save Image (.png)</button>
</div>
</div>
</div>`;

const STEP5_HTML = `
<div class="aics-step" data-step="5">
<div class="card">
<div class="card-title">&#128228; Ad Image (ကြော်ငြာပုံ)</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">ကုန်ပစ္စည်း/ကြော်ငြာအချက်အလက်တွေကို ဖြည့်ပြီး Ad Prompt ဖန်တီး၊ ပုံအစစ် ထုတ်နိုင်ပါတယ်။</p>
<div class="type-chips" id="typeChips2"></div>
<div id="ideaFields2"></div>
<details class="aics-advanced">
<summary>&#9881; Advanced Settings</summary>
<div id="customizeFields2" style="margin-top:12px;"></div>
</details>
<div class="ref-upload-area">
<label>&#128444; Product Reference ပုံများ ပူးတွဲရန် (ချန်ထားလို့ရသည်)</label>
<input type="file" id="refInput2" accept="image/*" multiple onchange="onRefSelected(2)">
<p class="ref-hint">အများဆုံး ၅ ပုံအထိ Upload တင်နိုင်ပါတယ် (ပုံတစ်ပုံချင်းစီ Max 5MB)</p>
<div class="ref-preview" id="refPreview2"></div>
</div>
<div class="loading" id="loading2"><div class="spinner"></div> AI ကြော်ငြာပုံ Prompt ရေးသားနေပါသည်...</div>
<div class="error-box" id="error2"></div>
<div id="adResultSection" style="display:none;margin-top:16px;">
<div class="card">
<div class="card-title">&#128221; Ad Image Prompt</div>
<textarea class="result-textarea" id="result2" placeholder="Ad Prompt ဒီနေရာမှာ ပေါ်ပါမယ်" style="min-height:120px;"></textarea>
<div class="btn-row">
<button class="btn btn-success" onclick="copyResult(2)">&#128203; Copy Prompt</button>
<button class="btn btn-purple" onclick="saveToCreations(2)">&#128190; Save to My Creations</button>
</div>
</div>
<div class="card">
<div class="card-title">&#127912; AI ပုံအစစ် ဖန်တီးရန်</div>
<button class="btn btn-purple" id="imgBtn2" onclick="generateImage(2)">&#127912; Generate Image</button>
<div class="loading" id="imgLoading2"><div class="spinner"></div> AI ပုံဆွဲနေပါသည်... (မိနစ်အနည်းငယ် ကြာနိုင်ပါသည်)</div>
<div class="error-box" id="imgError2"></div>
<div class="image-result-area" id="imgArea2"></div>
<p class="hint-note">&#128161; ပုံကို "💾 Save Image" ခလုတ်ကနေ တိုက်ရိုက် Download ဆွဲပါ</p>
</div>
</div>
</div>
</div>`;

const STEPS_HTML = STEP1_HTML + STEP2_HTML + STEP3_HTML + STEP4_HTML + STEP5_HTML;

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
.btn-orange{background:linear-gradient(135deg,#ff9f2b,#ff6f00);color:#080c18}
.btn-ghost{background:none;color:var(--text2);border:1px solid var(--border);padding:6px 12px;font-size:12px;min-height:32px}
.btn-ghost:hover{color:var(--cyan);border-color:var(--cyan)}
.btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.type-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.type-chip{padding:8px 16px;background:var(--bg-card2);border:2px solid var(--border);border-radius:8px;color:var(--text2);cursor:pointer;font-size:13px;font-family:inherit;transition:all .2s;min-height:40px}
.type-chip:hover{border-color:var(--cyan);color:var(--text)}
.type-chip.active{border-color:var(--cyan);background:rgba(0,229,255,.1);color:var(--cyan);font-weight:600}
.type-chip.locked{opacity:.45;cursor:not-allowed}
.type-chip.locked:hover{border-color:var(--border);color:var(--text2)}
.aics-advanced{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:16px}
.aics-advanced summary{cursor:pointer;color:var(--cyan);font-size:13px;font-weight:600;user-select:none;min-height:32px;display:flex;align-items:center}
.ref-upload-area{margin-top:14px}
.ref-upload-area input[type="file"]{padding:10px;background:var(--bg-input);color:var(--text2);border:1px dashed var(--border-strong);border-radius:8px;font-size:13px}
.ref-hint{color:var(--text3);font-size:12px;margin-top:6px;line-height:1.5}
.ref-preview{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
.ref-thumb{position:relative;width:72px;height:72px}
.ref-thumb img{width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--border);display:block}
.ref-thumb .remove-x{position:absolute;top:-7px;right:-7px;width:24px;height:24px;border-radius:50%;background:var(--error);color:#fff;border:none;font-size:13px;line-height:24px;text-align:center;cursor:pointer;padding:0;min-height:24px;min-width:24px}
.result-textarea{width:100%;min-height:120px;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:14px;color:var(--text);font-size:14px;line-height:1.7;font-family:inherit;resize:vertical;box-sizing:border-box}
.result-textarea:focus{outline:none;border-color:var(--cyan)}
.image-result-area img{width:100%;border-radius:10px;margin-top:10px}
.image-result-area a{display:inline-block;margin-top:8px}
.hint-note{color:var(--text3);font-size:12px;margin-top:10px;font-style:italic}
.action-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.loading{display:none;align-items:center;gap:10px;color:var(--cyan);font-size:13px;padding:12px 0}
.loading.show{display:flex}
.spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--cyan);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.error-box{display:none;background:rgba(255,82,82,.1);border:1px solid rgba(255,82,82,.3);color:var(--error);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px}
.error-box.show{display:block}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:var(--bg-card2);border:1px solid var(--success);color:var(--success);padding:10px 20px;border-radius:8px;font-size:13px;z-index:1000;transition:transform .3s}
.toast.show{transform:translateX(-50%) translateY(0)}
.toast.error{border-color:var(--error);color:var(--error)}
.empty-note{color:var(--text3);font-size:13px;padding:16px;background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;text-align:center}
@media(max-width:768px){.menu-btn{display:block}.sidebar{position:fixed;left:-260px;top:57px;bottom:0;z-index:99;transition:left .3s;box-shadow:4px 0 20px rgba(0,0,0,.5)}.sidebar.open{left:0}.main{padding:16px}.header-right .user-email{display:none}.action-row{flex-direction:column}.action-row .btn{width:100%}}
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

var MAIN_FIELDS_1=[
  {label:"ပုံဖော်ပြချင်တဲ့ အကြောင်းအရာ",placeholder:"ဥပမာ — Image ထဲမှာ ဘယ်လိုမျိုး ပုံစံ ပြချင်တယ်ဆိုတာ ဖော်ပြပါ",required:true,multiline:true}
];
var CUSTOM_FIELDS_1=[
  {label:"Image Prompt ဘယ်နှစ်မျိုး ထုတ်မလဲ",type:"select",options:["1 မျိုး","2 မျိုး","3 မျိုး","4 မျိုး"]},
  {label:"Aspect Ratio (ပုံအချိုးအစား)",type:"select",options:["9:16 (Vertical - Reels / TikTok / Story)","1:1 (Square - Facebook / IG Post)","16:9 (Wide - YouTube / Landscape)","4:5 (Portrait - IG Post)","အခြား (AI ကို လွတ်လပ်စွာ ဆုံးဖြတ်ခိုင်းမည်)"]},
  {label:"စာတန်းထိုး (Caption Text) နေရာ ထည့်မလား",type:"select",options:["မလိုအပ်ပါ","လိုအပ်ပါတယ် - Text ထည့်ဖို့ နေရာချန်ပါ"]}
];
var MAIN_FIELDS_2=[
  {label:"ကုန်ပစ္စည်း/ဝန်ဆောင်မှု အချက်အလက်",placeholder:"ဥပမာ — ဘာကုန်ပစ္စည်းအတွက် ကြော်ငြာပုံ ဖန်တီးချင်ပါသလဲ",required:true,multiline:true}
];
var CUSTOM_FIELDS_2=[
  {label:"ဈေးလျှော့/Promotion စာသား (ချန်ထားလို့ရသည်)",placeholder:"ဥပမာ — 30% Off, Buy 1 Get 1, Free Delivery"},
  {label:"Image Prompt ဘယ်နှစ်မျိုး ထုတ်မလဲ",type:"select",options:["1 မျိုး","2 မျိုး","3 မျိုး","4 မျိုး"]},
  {label:"Aspect Ratio (ပုံအချိုးအစား)",type:"select",options:["9:16 (Vertical - Reels / TikTok / Story)","1:1 (Square - Facebook / IG Post)","16:9 (Wide - YouTube / Landscape)","4:5 (Portrait - IG Post)","အခြား (AI ကို လွတ်လပ်စွာ ဆုံးဖြတ်ခိုင်းမည်)"]},
  {label:"စာတန်းထိုး (Caption/CTA Text) နေရာ ထည့်မလား",type:"select",options:["မလိုအပ်ပါ","လိုအပ်ပါတယ် - Text ထည့်ဖို့ နေရာချန်ပါ"]}
];
var TYPES_1=[
  {v:'1',label:'💡 Idea To Image (Free)',pro:false},
  {v:'2',label:'👤 Character Design (Pro)',pro:true},
  {v:'3',label:'📱 Social Media Thumbnail (Pro)',pro:true},
  {v:'4',label:'🛒 Product Image (Pro)',pro:true},
  {v:'5',label:'👤🛒 Character Product Ad (Pro)',pro:true}
];
var TYPES_2=[
  {v:'1',label:'🛍️ Product Ad Poster (Free)',pro:false},
  {v:'2',label:'💥 Discount / Sale ကြော်ငြာ (Pro)',pro:true},
  {v:'3',label:'👤🛍️ Model ဝတ်ဆင်ပြသ ကြော်ငြာ (Pro)',pro:true},
  {v:'4',label:'⭐ Before / After ကြော်ငြာ (Pro)',pro:true},
  {v:'5',label:'🎬 Social Media Ad Banner (Pro)',pro:true}
];
var MAX_REF=5;
var selectedType={1:'1',2:'1'};
var currentIdea={1:'',2:''};
var refImages={1:[],2:[]};
var lastImageData={1:null,2:null};

(function init(){
  if(!token){document.getElementById('loginView').style.display='flex';document.getElementById('aicsApp').style.display='none';return;}
  var _ue=document.getElementById('userEmail');if(_ue)_ue.textContent=userEmail||'—';
  var _pb=document.getElementById('planBadge');if(_pb)_pb.textContent=userPlan||'FREE';
  buildTypeChips(2,TYPES_2);
  buildFields(1,'ideaFields1',MAIN_FIELDS_1);
  buildFields(1,'customizeFields1',CUSTOM_FIELDS_1);
  buildFields(2,'ideaFields2',MAIN_FIELDS_2);
  buildFields(2,'customizeFields2',CUSTOM_FIELDS_2);
})();

function buildTypeChips(tab,types){
  var container=document.getElementById('typeChips'+tab);
  if(!container)return;
  container.innerHTML='';
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
      selectedType[tab]=t.v;
    };
    container.appendChild(chip);
  });
}

function setTypeChip(tab,val){
  var container=document.getElementById('typeChips'+tab);
  if(!container)return;
  var chips=container.querySelectorAll('.type-chip');
  for(var i=0;i<chips.length;i++){
    if(chips[i].getAttribute('data-v')===String(val))chips[i].classList.add('active');
    else chips[i].classList.remove('active');
  }
}

function buildFields(tab,targetId,config){
  var container=document.getElementById(targetId);
  if(!container)return;
  container.innerHTML='';
  var base=(tab===1?1:2);
  config.forEach(function(field,idx){
    var row=document.createElement('div');
    row.className='form-group';
    var label=document.createElement('label');
    label.textContent=field.label+(field.required?' *':'');
    var input;
    if(field.type==='select'){
      input=document.createElement('select');
      field.options.forEach(function(optText){
        var option=document.createElement('option');
        option.value=optText;
        option.textContent=optText;
        input.appendChild(option);
      });
    }else if(field.multiline){
      input=document.createElement('textarea');
      input.rows=2;
      input.placeholder=field.placeholder||'';
    }else{
      input=document.createElement('input');
      input.type='text';
      input.placeholder=field.placeholder||'';
    }
    input.id='field_'+base+'_'+idx;
    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  });
}

function collectIdea(tab,config){
  var lines=[];
  var valid=true;
  config.forEach(function(field,idx){
    var el=document.getElementById('field_'+tab+'_'+idx);
    var val=el?el.value.trim():'';
    if(field.required&&!val)valid=false;
    if(val)lines.push(field.label+': '+val);
  });
  return{text:lines.join('\\n'),valid:valid};
}

function apiCall(url,body){
  var s=document.getElementById('aiModelSel');if(s&&s.value)body.model=s.value;
  return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.detail||data.error||'Request failed');return data;});});
}

function onRefSelected(tab){
  var fileInput=document.getElementById('refInput'+tab);
  var files=fileInput.files;
  for(var i=0;i<files.length;i++){
    if(refImages[tab].length>=MAX_REF){
      showToast('Reference ပုံ အများဆုံး '+MAX_REF+' ပုံပဲ တင်လို့ရပါတယ်။',true);
      break;
    }
    var file=files[i];
    if(file.size>5*1024*1024){
      showToast("'"+file.name+"' ပုံသည် 5MB ထက် ကျော်နေလို့ ကျော်သွားပါမည်။",true);
      continue;
    }
    addRefFile(tab,file);
  }
  fileInput.value='';
}

function addRefFile(tab,file){
  var reader=new FileReader();
  reader.onload=function(e){
    refImages[tab].push({
      dataUrl:e.target.result,
      base64:e.target.result.split(',')[1],
      mimeType:file.type
    });
    renderRefPreviews(tab);
  };
  reader.readAsDataURL(file);
}

function renderRefPreviews(tab){
  var container=document.getElementById('refPreview'+tab);
  if(!container)return;
  container.innerHTML='';
  refImages[tab].forEach(function(img,idx){
    var thumb=document.createElement('div');
    thumb.className='ref-thumb';
    var imgEl=document.createElement('img');
    imgEl.src=img.dataUrl;
    var removeBtn=document.createElement('button');
    removeBtn.className='remove-x';
    removeBtn.textContent='✕';
    removeBtn.onclick=function(){removeRef(tab,idx);};
    thumb.appendChild(imgEl);
    thumb.appendChild(removeBtn);
    container.appendChild(thumb);
  });
}

function removeRef(tab,idx){
  refImages[tab].splice(idx,1);
  renderRefPreviews(tab);
}

function getConfig(tab){
  return tab===1?MAIN_FIELDS_1.concat(CUSTOM_FIELDS_1):MAIN_FIELDS_2.concat(CUSTOM_FIELDS_2);
}

function generatePrompt(tab){
  var config=getConfig(tab);
  var collected=collectIdea(tab,config);
  if(!collected.valid){
    showToast(tab===1?'ပုံဖော်ပြချင်တဲ့ အကြောင်းအရာ အနည်းဆုံး ဖြည့်ရေးပါ':'ကုန်ပစ္စည်း/ဝန်ဆောင်မှု အချက်အလက် အနည်းဆုံး ဖြည့်ရေးပါ',true);
    return;
  }
  currentIdea[tab]=collected.text;
  if(tab===1&&selectedType[1]!=='1'&&!isPro){showToast('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။',true);setLoading('loading'+tab,false);return;}
  var audEl=document.getElementById('audSel');
  if(tab===1&&audEl&&audEl.value){collected.text+='\\n\\nAudience: '+audEl.value;window.aichAud=audEl.value;}
  setLoading('loading'+tab,true);
  hideError('error'+tab);
  var endpoint=(tab===1)?'/api/studio/image/prompt':'/api/studio/image/ad-prompt';
  var body={idea:collected.text,type:selectedType[tab]};
  if(refImages[tab].length>0){
    body.images=refImages[tab].map(function(img){return{base64:img.base64,mimeType:img.mimeType};});
  }
  apiCall(endpoint,body)
    .then(function(data){
      document.getElementById('result'+tab).value=data.prompt||'(empty)';
      if(tab===1){
        studioMarkDone(1);
        studioMarkDone(2);
        showToast('✓ Prompt ပြီးပါပြီ');
        studioGoStep(3);
      }else{
        document.getElementById('adResultSection').style.display='block';
        document.getElementById('imgArea2').innerHTML='';
        studioMarkDone(5);
        showToast('✓ Ad Prompt ပြီးပါပြီ');
        if(window.studioCur&&window.studioCur()===5)renderAdPreview();
      }
    })
    .catch(function(err){showError('error'+tab,err.message);})
    .finally(function(){setLoading('loading'+tab,false);});
}

function generateImage(tab){
  var el=document.getElementById('result'+tab);
  var promptText=el?(el.value||el.textContent||''):'';
  if(!promptText||!promptText.trim()){
    showToast('ပုံဖန်တီးဖို့ Prompt အရင် Generate လုပ်ပါ။',true);
    return;
  }
  setLoading('imgLoading'+tab,true);
  hideError('imgError'+tab);
  document.getElementById('imgBtn'+tab).disabled=true;
  document.getElementById('imgArea'+tab).innerHTML='';
  apiCall('/api/studio/image/generate',{prompt:promptText})
    .then(function(data){
      lastImageData[tab]={data:data.data,mimeType:data.mimeType};
      var dataUri='data:'+data.mimeType+';base64,'+data.data;
      var img=document.createElement('img');
      img.src=dataUri;
      var link=document.createElement('a');
      link.href=dataUri;
      link.download=(tab===1?'image_studio_output.png':'ad_image_studio_output.png');
      var dlBtn=document.createElement('button');
      dlBtn.className='btn btn-success';
      dlBtn.style.padding='8px 16px';
      dlBtn.style.fontSize='13px';
      dlBtn.textContent='💾 Save Image';
      link.appendChild(dlBtn);
      document.getElementById('imgArea'+tab).appendChild(img);
      document.getElementById('imgArea'+tab).appendChild(document.createElement('br'));
      document.getElementById('imgArea'+tab).appendChild(link);
      if(tab===1){
        studioMarkDone(3);
        showToast('✓ ပုံပြီးပါပြီ');
        studioGoStep(4);
      }else{
        showToast('✓ ပုံပြီးပါပြီ');
        if(window.studioCur&&window.studioCur()===5)renderAdPreview();
      }
    })
    .catch(function(err){showError('imgError'+tab,err.message);})
    .finally(function(){setLoading('imgLoading'+tab,false);document.getElementById('imgBtn'+tab).disabled=false;});
}

function copyResult(tab){
  var el=document.getElementById('result'+tab);
  var text=el?(el.value||el.textContent||''):'';
  if(!text){showToast('Copy လုပ်ဖို့ Result မရှိသေးပါ',true);return;}
  copyToClipboard(text);
  showToast('✓ Copy ပြီးပါပြီ');
}

function saveToCreations(tab){
  var el=document.getElementById('result'+tab);
  var resultText=el?(el.value||el.textContent||''):'';
  if(!resultText){showToast('Save လုပ်ဖို့ Result မရှိသေးပါ။ Generate အရင်လုပ်ပါ။',true);return;}
  var topicEl=document.getElementById('field_'+tab+'_0');
  var topic=(topicEl?topicEl.value.trim():'')||(tab===1?'Image Prompt':'Ad Image Prompt');
  var defaultTitle=topic.substring(0,40)+(topic.length>40?'...':'');
  var title=prompt('Creation အမည် ပေးပါ:',defaultTitle);
  if(title===null)return;
  var media=lastImageData[tab]||null;
  AICS_CREATIONS.save({
    studio:tab===1?'IMAGE':'IMAGEAD',
    type:selectedType[tab],
    original_prompt:currentIdea[tab],
    ai_output:resultText,
    title:title||defaultTitle,
    media_type:media?'image':'',
    media_mime:media?media.mimeType:'',
    media_data:media?media.data:''
  })
    .then(function(){showToast('💾 My Creations ထဲ Save ပြီးပါပြီ');})
    .catch(function(err){showToast('Save မအောင်မြင်ပါ: '+((err&&err.message)||'Error'),true);});
}

function saveImage(tab){
  var media=lastImageData[tab];
  if(!media){showToast('Save လုပ်ဖို့ ပုံမရှိသေးပါ',true);return;}
  var dataUri='data:'+media.mimeType+';base64,'+media.data;
  var a=document.createElement('a');
  a.href=dataUri;
  a.download=(tab===1?'image_studio_output.png':'ad_image_studio_output.png');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('✓ Download စတင်ပါပြီ');
}

function copyToClipboard(text){
  if(navigator.clipboard)navigator.clipboard.writeText(text);
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);}
}

// ===== Preview renderers =====
function renderPromptPreview(){
  var el=document.getElementById('result1');
  var text=el?(el.value||''):'';
  if(!text||!text.trim()){studioPreview('');return;}
  studioPreview('<div class="aics-pv-label">&#128221; Generated Prompt</div><pre>'+escapeHtml(text)+'</pre>');
}
function renderResultPreview(){
  if(lastImageData[1]){
    studioPreview('<div class="aics-pv-label">&#127912; Generated Image</div><img class="aics-pv-img" src="data:'+lastImageData[1].mimeType+';base64,'+lastImageData[1].data+'">');
  }else{
    renderPromptPreview();
  }
}
function renderAdPreview(){
  var el=document.getElementById('result2');
  var text=el?(el.value||''):'';
  var html='<div class="aics-pv-label">&#128228; Ad Image</div>';
  if(text&&text.trim())html+='<pre>'+escapeHtml(text)+'</pre>';
  if(lastImageData[2])html+='<div style="margin-top:10px;"><img class="aics-pv-img" src="data:'+lastImageData[2].mimeType+';base64,'+lastImageData[2].data+'"></div>';
  if(!text&&!lastImageData[2]){studioPreview('');return;}
  studioPreview(html);
}

// ===== Studio shell hooks =====
function bBack(){return {label:'&#8592; Back',cls:'ghost',fn:function(){studioGoStep(studioCur()-1);}};}
function bReset(){return {label:'Reset',cls:'ghost',fn:studioReset};}
function bSave(){return null;}
function bNext(n){return {label:'Next &#8594;',cls:'primary',fn:function(){studioGoStep(n);}};}

function studioOnStep(n){
  if(n===1){
    studioSetActions([bReset(),bSave(),bNext(2)]);
    renderPromptPreview();
  }else if(n===2){
    studioSetActions([bBack(),bReset(),bSave(),{label:'Generate Image Prompt &#10022;',cls:'primary',fn:function(){generatePrompt(1);}}]);
    renderPromptPreview();
  }else if(n===3){
    studioSetActions([bBack(),bReset(),bSave(),{label:'Generate Image &#10022;',cls:'primary',fn:function(){generateImage(1);}}]);
    renderPromptPreview();
  }else if(n===4){
    studioSetActions([bBack(),bReset(),bSave(),{label:'&#128203; Copy Prompt',cls:'ghost',fn:function(){copyResult(1);}},{label:'&#128190; Save to Creations',cls:'purple',fn:function(){saveToCreations(1);}},{label:'&#128190; Save Image',cls:'success',fn:function(){saveImage(1);}}]);
    renderResultPreview();
  }else if(n===5){
    studioSetActions([bBack(),bReset(),bSave(),{label:'Generate Ad Prompt &#10022;',cls:'primary',fn:function(){generatePrompt(2);}}]);
    renderAdPreview();
  }
}
window.studioOnStep=studioOnStep;

function studioCollectDraft(){
  var fields={};
  for(var t=1;t<=2;t++){
    for(var i=0;i<5;i++){
      var el=document.getElementById('field_'+t+'_'+i);
      if(el)fields[t+'_'+i]=el.value;
    }
  }
  return {
    fields:fields,
    type1:selectedType[1],
    type2:selectedType[2],
    aud:(document.getElementById('audSel')?document.getElementById('audSel').value:''),
    idea1:currentIdea[1],
    idea2:currentIdea[2],
    result1:document.getElementById('result1').value,
    result2:document.getElementById('result2').value,
    refCount1:refImages[1].length,
    refCount2:refImages[2].length
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
  if(d.type1){selectedType[1]=d.type1;var ts1=document.getElementById('typeSel1');if(ts1)ts1.value=String(d.type1);}
  var audEl=document.getElementById('audSel');if(audEl&&d.aud)audEl.value=d.aud;if(audEl)window.aichAud=audEl.value;
  if(d.type2){selectedType[2]=d.type2;setTypeChip(2,d.type2);}
  if(d.idea1)currentIdea[1]=d.idea1;
  if(d.idea2)currentIdea[2]=d.idea2;
  if(d.result1)document.getElementById('result1').value=d.result1;
  if(d.result2){
    document.getElementById('result2').value=d.result2;
    document.getElementById('adResultSection').style.display='block';
  }
  if(d.result1)studioMarkDone(2);
  if(d.result2)studioMarkDone(5);
  if(document.getElementById('result1').value.trim())studioMarkDone(1);
}
window.studioRestoreDraft=studioRestoreDraft;

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
