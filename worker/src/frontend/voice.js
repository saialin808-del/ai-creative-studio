// AI Creative Studio — Voice Studio Frontend
// Architecture: Home → two independent branches.
// Existing Voice APIs, Gemini integration, authentication, save/download are reused.
// Studio-specific workflow/state lives here; shared shell remains backward-compatible.

import { sidebarScript, renderStudioShell } from './shared.js';

// NOTE — Voice Steppers / Voices / esc() / voiceOptions() တို့သည်
// Browser စာမျက်နှာ script ထဲတွင် ရှိရမည့် Constants/Functions များဖြစ်သည်။
// Module scope တွင်ထားပါက HTML ထဲသို့ မပါဝင်ဘဲ
// "VOICE_STEPPER is not defined" ReferenceError ဖြစ်ပြီး Branch Workflow UI မပေါ်နိုင်ပါ။
// → အောက် page <script> ၏ ထိပ်တွင် သတ်မှတ်ထားပါသည်။

const HOME_HTML = `
<div class="voice-screen active" id="voiceHome">
  <div class="voice-hero">
    <div class="voice-hero-icon">🎙️</div>
    <h1>VOICE STUDIO</h1>
    <p>ဘာလုပ်ချင်ပါသလဲ?</p>
  </div>
  <div class="mode-grid">
    <button type="button" class="mode-card" onclick="voiceStartMode('text-to-voice')">
      <span class="mode-icon">📝</span><span class="mode-title">စာသား → အသံ</span>
      <span class="mode-desc">စာသားကို AI အသံအဖြစ် ဖန်တီးရန်</span><span class="mode-action">စတင်ရန် →</span>
    </button>
    <button type="button" class="mode-card" onclick="voiceStartMode('media-to-text')">
      <span class="mode-icon">🎧</span><span class="mode-title">အသံ / Video → စာသား</span>
      <span class="mode-desc">အသံ သို့မဟုတ် Video မှ စာသား / SRT ဖန်တီးရန်</span><span class="mode-action">စတင်ရန် →</span>
    </button>
  </div>
</div>

<div class="voice-screen" id="voiceWorkflow">
  <div id="voiceStepper" class="voice-stepper"></div>
  <div id="voiceWorkflowBody"></div>
</div>`;

export const VOICE_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Voice Studio — AI Creative Studio</title>
<style>
:root{--bg:#080c18;--card:#0d1424;--card2:#111a2e;--input:#0a1020;--border:rgba(0,229,255,.15);--strong:rgba(0,229,255,.35);--cyan:#00e5ff;--purple:#7b5cff;--text:#e8ecf4;--muted:#8b95a8;--success:#00e676;--error:#ff5252;--warn:#ffc107;--bg-card:var(--card);--bg-card2:var(--card2);--bg-input:var(--input);--border-strong:var(--strong);--text2:var(--muted)}
*{box-sizing:border-box}body{font-family:'Noto Sans Myanmar','Roboto','Segoe UI',Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:14px;line-height:1.6}
.aics-work .voice-screen{display:none}.aics-work .voice-screen.active{display:block}.aics-work .voice-hero{text-align:center;padding:26px 12px 22px}.aics-work .voice-hero-icon{font-size:42px}.aics-work .voice-hero h1{font-size:23px;margin:5px 0;background:linear-gradient(90deg,var(--purple),var(--cyan));-webkit-background-clip:text;background-clip:text;color:transparent}.aics-work .voice-hero p{color:var(--muted);font-size:15px}
.aics-work .mode-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;max-width:760px;margin:0 auto}.aics-work .mode-card{appearance:none;text-align:left;background:linear-gradient(145deg,var(--card),var(--card2));border:1px solid var(--border);border-radius:18px;padding:22px;min-height:190px;color:var(--text);cursor:pointer;display:flex;flex-direction:column;gap:8px;transition:.2s}.aics-work .mode-card:hover,.aics-work .mode-card:focus{border-color:var(--cyan);transform:translateY(-2px);outline:none;box-shadow:0 8px 28px rgba(0,229,255,.1)}.aics-work .mode-icon{font-size:30px}.aics-work .mode-title{font-size:17px;font-weight:700;color:var(--cyan)}.aics-work .mode-desc{color:var(--muted);font-size:13px}.aics-work .mode-action{margin-top:auto;font-weight:700;color:#fff}
.aics-work .voice-stepper{display:flex;align-items:center;justify-content:center;gap:0;margin:0 auto 18px;max-width:820px;overflow-x:auto;padding:3px 2px 9px}.aics-work .vstep.loading{border-color:rgba(0,229,255,.6);box-shadow:0 0 18px rgba(0,229,255,.35);}\n.aics-work .vstep{border:1px solid var(--border);background:var(--card);color:var(--muted);padding:9px 13px;border-radius:10px;white-space:nowrap;font-size:12px}.aics-work .vstep.active{border-color:var(--cyan);color:#fff;background:rgba(0,229,255,.1)}.aics-work .vstep.done{border-color:rgba(0,230,118,.4);color:var(--success)}.aics-work .vlink{height:1px;background:var(--border);width:34px;flex:0 0 34px}
.aics-work .vcard{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:14px}.aics-work .vtitle{font-size:16px;font-weight:700;color:var(--cyan);margin-bottom:7px}.aics-work .hint{color:var(--muted);font-size:12.5px;margin-bottom:15px}.aics-work .form-group{margin-bottom:15px}.aics-work label{display:block;color:var(--muted);font-size:12.5px;margin-bottom:6px;font-weight:600}.aics-work input,.aics-work textarea,select{width:100%;background:var(--input);border:1px solid var(--border);border-radius:12px;color:var(--text);font:inherit;padding:11px 13px;min-height:44px}.aics-work textarea{min-height:120px;resize:vertical}.aics-work input:focus,.aics-work textarea:focus,select:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 2px rgba(0,229,255,.1)}.aics-work input[type=file]{padding:9px}.aics-work .btn-row{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px;padding:10px 17px;border-radius:9px;border:1px solid transparent;font:600 13px inherit;cursor:pointer}.btn:disabled{opacity:.5;cursor:not-allowed}.aics-work .primary{background:linear-gradient(135deg,var(--cyan),#00b8d4);color:#07101b}.aics-work .secondary{background:var(--card2);border-color:var(--strong);color:var(--cyan)}.aics-work .purple{background:linear-gradient(135deg,var(--purple),#9b7dff);color:#fff}.aics-work .ghost{background:transparent;border-color:var(--border);color:var(--muted)}.aics-work .success{background:rgba(0,230,118,.12);border-color:rgba(0,230,118,.3);color:var(--success)}.aics-work .danger{background:rgba(255,82,82,.1);border-color:rgba(255,82,82,.3);color:#ff8a8a}
.aics-work .choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.aics-work .choice-card{background:var(--card2);border:1px solid var(--border);border-radius:13px;padding:16px;text-align:left;color:var(--text);cursor:pointer}.aics-work .choice-card:hover{border-color:var(--cyan)}.aics-work .choice-card strong{display:block;color:var(--cyan);font-size:15px;margin-bottom:4px}.aics-work .choice-card span{color:var(--muted);font-size:12px}
.aics-work .process{text-align:center;padding:30px 15px}.aics-work .process-icon{font-size:34px;margin-bottom:7px}.aics-work .process h2{font-size:18px;color:var(--cyan);margin-bottom:16px}.aics-work .status-list{max-width:470px;margin:auto;text-align:left;background:var(--input);border:1px solid var(--border);border-radius:12px;padding:14px}.aics-work .status-line{padding:6px 0;color:var(--muted)}.aics-work .status-line.current{color:var(--cyan);font-weight:700}.aics-work .status-line.done{color:var(--success)}
.aics-work .audio-box{background:var(--input);border:1px solid var(--border);border-radius:12px;padding:16px}.aics-work .audio-box audio{width:100%}.aics-work .result-text{background:var(--input);border:1px solid var(--border);border-radius:10px;padding:13px;white-space:pre-wrap;min-height:120px}.aics-work .srt-box{font-family:'Courier New',monospace;font-size:12.5px;line-height:1.6;min-height:230px}.aics-work .result-label{font-weight:700;color:var(--cyan);margin:12px 0 7px}.aics-work .pro-note{color:var(--warn);font-size:12px;margin-top:10px}.aics-work .error-box{background:rgba(255,82,82,.08);border:1px solid rgba(255,82,82,.3);color:#ffb0b0;border-radius:10px;padding:12px;margin-top:12px}.aics-work .top-actions{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}.aics-work .source-note{font-size:11.5px;color:var(--muted);background:rgba(123,92,255,.08);border:1px solid rgba(123,92,255,.2);border-radius:8px;padding:8px 10px;margin-bottom:12px}
.loading-overlay{position:fixed;inset:0;background:rgba(5,8,17,.72);backdrop-filter:blur(5px);z-index:10000;display:none;align-items:center;justify-content:center;padding:20px}.loading-overlay.show{display:flex}.loading-box{width:min(420px,92vw);background:var(--card);border:1px solid var(--strong);border-radius:16px;padding:24px;text-align:center;box-shadow:0 15px 50px rgba(0,0,0,.45)}.spinner{width:28px;height:28px;border:3px solid rgba(0,229,255,.2);border-top-color:var(--cyan);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}@keyframes spin{to{transform:rotate(360deg)}}
.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:11000;background:var(--card2);border:1px solid var(--strong);padding:11px 18px;border-radius:10px;display:none;box-shadow:0 6px 24px rgba(0,0,0,.4)}.toast.show{display:block}.toast.error{border-color:var(--error);color:#ffb0b0}.toast.success{border-color:var(--success);color:#9fffc4}
@media(max-width:700px){.aics-work .mode-grid,.aics-work .choice-grid{grid-template-columns:1fr}.aics-work .mode-card{min-height:155px}.aics-work .vcard{padding:15px}.aics-work .voice-stepper{justify-content:flex-start}.aics-work .vlink{width:18px;flex-basis:18px}.btn{flex:0 1 auto}.aics-work .top-actions .btn{width:100%}}
@media(min-width:701px) and (max-width:900px){.aics-work .mode-grid{grid-template-columns:1fr;max-width:620px}}
@media(min-width:901px) and (max-width:1000px){.aics-work .mode-grid{grid-template-columns:repeat(2,minmax(0,1fr));max-width:760px}}
</style>
</head>
<body>
<div id="loginView" class="aics-login-overlay" style="display:none;"><div class="aics-login-box"><h2>Login လုပ်ရန် လိုအပ်ပါသည်</h2><p>Voice Studio ကို အသုံးပြုရန် Google နဲ့ Login ဝင်ပါ။</p><a href="/api/auth/login?next=/app/voice" class="btn btn-primary">Google နဲ့ Login</a></div></div>
${renderStudioShell({id:'voice',activeId:'voice',nameMy:'အသံ Studio',desc:'Text to voice, voice to text',icon:'🎙️',modelCat:'voice',steps:[],content:HOME_HTML})}
<div class="loading-overlay" id="voiceLoading"><div class="loading-box"><div class="spinner"></div><div id="voiceLoadingText">AI ဆောင်ရွက်နေပါသည်...</div></div></div>
<div class="toast" id="toast"></div>
${sidebarScript()}
<script>
// ==== Voice Studio Browser-side Constants / Helpers ====
// (Module scope တွင်မထားဘဲ ဤ page script ထဲတွင် သတ်မှတ်သည် —
//  Browser page တွင် ဤ Variables/Functions ရှိမှသာ Branch Workflow UI render နိုင်သည်)
const VOICES = [
  ['Zephyr','တောက်ပ (Bright)'],['Puck','တက်ကြွ (Upbeat)'],['Charon','ရှင်းလင်းတိကျ (Informative)'],
  ['Kore','ခိုင်မာတည်ငြိမ် (Firm)'],['Fenrir','စိတ်လှုပ်ရှားလွယ် (Excitable)'],['Leda','လူငယ်ဆန် (Youthful)'],
  ['Orus','ခိုင်မာ (Firm)'],['Aoede','ပေါ့ပါးလန်းဆန်း (Breezy)'],['Callirrhoe','အေးဆေး (Easy-going)'],
  ['Autonoe','တောက်ပ (Bright)'],['Enceladus','အသက်ရှူသံပါ (Breathy)'],['Iapetus','ရှင်းလင်း (Clear)'],
  ['Umbriel','အေးဆေး (Easy-going)'],['Algieba','ချောမွေ့ (Smooth)'],['Despina','ချောမွေ့ (Smooth)'],
  ['Erinome','ရှင်းလင်း (Clear)'],['Algenib','ရိုင်းရင့် (Gravelly)'],['Rasalgethi','ရှင်းလင်းတိကျ (Informative)'],
  ['Laomedeia','တက်ကြွ (Upbeat)'],['Achernar','နူးညံ့ (Soft)'],['Alnilam','ခိုင်မာ (Firm)'],
  ['Schedar','တညီတညာ (Even)'],['Gacrux','ရင့်ကျက် (Mature)'],['Pulcherrima','တိုက်ရိုက် (Forward)'],
  ['Achird','ဖော်ရွေ (Friendly)'],['Zubenelgenubi','ပေါ့ပေါ့ပါးပါး (Casual)'],
  ['Vindemiatrix','နူးညံ့သိမ်မွေ့ (Gentle)'],['Sadachbia','တက်ကြွရှင်သန် (Lively)'],
  ['Sadaltager','ဗဟုသုတရှိ (Knowledgeable)'],['Sulafat','နွေးထွေး (Warm)']
];
const VOICE_STEPPER = [
  {n:1,label:'စာသား'},{n:2,label:'AI အသံဖန်တီးနေသည်'},{n:3,label:'အသံရလဒ်'}
];
const MEDIA_STEPPER = [
  {n:1,label:'အသံ / Video'},{n:2,label:'AI စာသားဖန်တီးနေသည်'},{n:3,label:'စာသားရလဒ်'}
];
const SRT_STEPPER = [
  {n:1,label:'အချက်အလက်'},{n:2,label:'AI SRT ပြုလုပ်နေသည်'},{n:3,label:'SRT ရလဒ်'}
];
const TRANSLATE_STEPPER = [
  {n:1,label:'SRT'},{n:2,label:'AI ဘာသာပြန်နေသည်'},{n:3,label:'ဘာသာပြန်ရလဒ်'}
];
function esc(s) {
  const value = s == null ? '' : String(s);
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;').replace(/'/g, '&#39;');
}
function voiceOptions() {
  return VOICES.map(v => '<option value="' + esc(v[0]) + '"' + (v[0] === 'Kore' ? ' selected' : '') + '>' +
    esc(v[0] + ' — ' + v[1]) + '</option>').join('');
}
var TOKEN=localStorage.getItem('aics_token')||'';
var USER_PLAN='FREE';
var VOICE_STATE={
  voiceMode:null, voiceStep:0, voiceInput:null, voiceResult:null, audioResult:null,
  srtResult:null, translationDirection:'MY_TO_CN', translationResult:null,
  processingState:null, errorState:null, source:'', srtSource:null
};
var VOICE_DRAFT_VALUES=null;
var LAST_AUDIO={base64:'',mime:'audio/wav',url:''};
var MEDIA_AUDIO={base64:'',mime:'',fileName:''};
var translatedSrt='';
var voiceDraftKey='aics_voice_workflow_v2';
var VOICE_REQUEST_ID=0;

function toast(msg,type){var t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.className='toast show'+(type?' '+type:'');setTimeout(function(){t.className='toast';},2600);}
// Error ဖြစ်ပြီး Input Step သို့ Auto Back ဖြစ်သောအခါ Input Screen ထဲတွင် ရှင်းလင်းသော Error Message ပြရန်
function voiceErrorBanner(){
  return VOICE_STATE.errorState?('<div class="error-box">'+esc(VOICE_STATE.errorState)+'</div>'):'';
}
function friendlyError(d,fallback){
  var e=(d&&d.error)||'', detail=(d&&d.detail)||'';
  var map={
    unauthorized:'Login ဝင်ထားခြင်း မရှိပါ။ ပြန်လည် Login ဝင်ပါ။',
    invalid_token:'Login အချက်အလက် မမှန်ကန်ပါ။ ပြန်လည် Login ဝင်ပါ။',
    missing_text:'စာသား ထည့်ပေးပါ။',
    missing_audio:'အသံ သို့မဟုတ် Video ဖိုင် ရွေးပေးပါ။',
    missing_srt:'SRT စာသား မရှိသေးပါ။',
    tts_error:'အသံဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။ ခဏအကြာတွင် ထပ်မံကြိုးစားပါ။',
    transcribe_error:'စာသားဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။ ခဏအကြာတွင် ထပ်မံကြိုးစားပါ။',
    srt_error:'SRT ဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။ ခဏအကြာတွင် ထပ်မံကြိုးစားပါ။',
    translate_error:'ဘာသာပြန်ဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။ ခဏအကြာတွင် ထပ်မံကြိုးစားပါ။',
    feature_denied:'ဒီ Feature ကို သင့် Plan နဲ့ အသုံးပြုခွင့်မရှိသေးပါ။',
    pro_only:'ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။',
    feature_disabled:'ဒီ Feature ကို ယခု ပိတ်ထားပါသည်။',
    usage_limit:'အသုံးပြုခွင့် အကန့်အသတ် ပြည့်သွားပါပြီ။',
    forbidden:'အသုံးပြုခွင့် မရှိပါ။'
  };
  return map[e]||fallback||'ဆောင်ရွက်ရာတွင် အခက်အခဲရှိနေပါသည်။ ခဏအကြာတွင် ထပ်မံကြိုးစားပါ။';
}
function api(path,body){
  body=body||{};
  var sel=document.getElementById((path.indexOf('/transcribe')>-1||path.indexOf('/srt')>-1)?'aiModelSel2':'aiModelSel')||document.getElementById('aiModelSel');
  if(sel&&sel.value)body.model=sel.value;
  var h={'Content-Type':'application/json'};if(TOKEN)h.Authorization='Bearer '+TOKEN;
  return fetch(path,{method:'POST',headers:h,body:JSON.stringify(body)}).then(function(r){
    return r.json().catch(function(){return {error:'request_error'};}).then(function(d){if(!r.ok&&!d.error)d.error='request_error';return d;});
  });
}
function base64Blob(b,m){var bin=atob(b),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:m});}
var VOICE_LOADING_STEP=0;
function showLoading(text){
  document.getElementById('voiceLoadingText').textContent=text;
  document.getElementById('voiceLoading').classList.add('show');
  VOICE_LOADING_STEP=2;
  if(window.studioSetLoading)window.studioSetLoading({on:true,step:VOICE_LOADING_STEP,text:text,buttonSelector:'#voiceStepper .vstep[data-step="'+VOICE_LOADING_STEP+'"]',containerSelector:'#voiceStepper'});
}
function hideLoading(){
  document.getElementById('voiceLoading').classList.remove('show');
  if(window.studioSetLoading&&VOICE_LOADING_STEP){
    window.studioSetLoading({on:false,step:VOICE_LOADING_STEP,buttonSelector:'#voiceStepper .vstep[data-step="'+VOICE_LOADING_STEP+'"]',containerSelector:'#voiceStepper'});
  }
  VOICE_LOADING_STEP=0;
}
function saveDraft(){
  try{localStorage.setItem(voiceDraftKey,JSON.stringify({
    state:VOICE_STATE,tts:val('ttsText'),speaking:val('speakingStyle'),voice:val('voiceName'),
    instruction:val('voiceInstruction'),audience:val('audience'),srt:val('srtEditor'),
    mediaType:val('mediaOutput'),mediaFileName:MEDIA_AUDIO.fileName,transcript:val('textResult'),
    translation:translatedSrt,dir:VOICE_STATE.translationDirection
  }));}catch(e){}
}
function val(id){var x=document.getElementById(id);return x?(x.value||''):'';}
function restoreDraft(){
  try{
    var raw=localStorage.getItem(voiceDraftKey);if(!raw)return false;
    var d=JSON.parse(raw)||{},s=d.state||{};
    VOICE_DRAFT_VALUES={tts:d.tts||'',speaking:d.speaking||'',voice:d.voice||'Kore',instruction:d.instruction||'',audience:d.audience||'လူတိုင်း',srt:d.srt||'',transcript:d.transcript||''};
    if(s.voiceMode)VOICE_STATE=s;
    VOICE_STATE.translationDirection=d.dir||VOICE_STATE.translationDirection||'MY_TO_CN';
    if(d.translation)translatedSrt=d.translation;
    if(s.audioResult&&s.audioResult.data){LAST_AUDIO.base64=s.audioResult.data;LAST_AUDIO.mime=s.audioResult.mimeType||'audio/wav';}
    return true;
  }catch(e){VOICE_DRAFT_VALUES=null;return false;}
}
function applyDraftToForm(){
  var d=VOICE_DRAFT_VALUES;
  var vi=VOICE_STATE.voiceInput||null;
  // Error → Auto Back ဖြစ်သောအခါ နောက်ဆုံး ထည့်ထားသော Input များ မပျောက်စေရန် voiceInput ကို ဦးစားပေး ပြန်ဖြည့်သည်
  var tts=(d&&d.tts)||(vi&&vi.text)||'';
  var speaking=(d&&d.speaking)||(vi&&vi.speakingStyle)||'';
  var voice=(d&&d.voice)||(vi&&vi.voiceStyle)||'Kore';
  var instruction=(d&&d.instruction)||(vi&&vi.instruction)||'';
  var audience=(d&&d.audience)||(vi&&vi.audience)||'လူတိုင်း';
  var map={ttsText:tts,speakingStyle:speaking,voiceName:voice,voiceInstruction:instruction,audience:audience};
  Object.keys(map).forEach(function(id){var x=document.getElementById(id);if(x&&map[id]!==undefined&&map[id]!==null)x.value=map[id];});
  var s=document.getElementById('srtEditor');if(s&&d.srt)s.value=d.srt;
  var t=document.getElementById('textResult');if(t&&d.transcript)t.value=d.transcript;
  autoGrow(document.getElementById('ttsText'));autoGrow(document.getElementById('speakingStyle'));autoGrow(document.getElementById('voiceInstruction'));
}
function renderStepper(items,current){
  var c=document.getElementById('voiceStepper'),h='';
  items.forEach(function(x,i){
    var cls=x.n===current?'active':(x.n<current?'done':'');
    h+='<div class="vstep '+cls+'" data-step="'+x.n+'">'+(x.n<current?'✓ ':'')+esc(x.label)+'</div>';
    if(i<items.length-1)h+='<span class="vlink"></span>';
  });c.innerHTML=h;
  var active=c.querySelector('.vstep.active');
  if(active&&window.studioScrollElementIntoView)window.studioScrollElementIntoView(active,'#voiceStepper',true);
}
// Main + Branch = Stepper တစ်ခုတည်း —
// Main workflow (3 steps) ပြီးနောက် SRT / ဘာသာပြန် Branch steps များကို ဆက်ပေါင်းပြသည်
function voiceRenderCombinedStepper(phase,step){
  var main=(VOICE_STATE.voiceMode==='text-to-voice')?VOICE_STEPPER:MEDIA_STEPPER;
  var steps=main.slice();
  var offset=0;
  if(phase==='srt'){
    offset=main.length;
    steps=steps.concat(SRT_STEPPER.map(function(s){return {n:s.n+offset,label:s.label};}));
  }else if(phase==='translation'){
    offset=main.length;
    steps=steps.concat(SRT_STEPPER.map(function(s){return {n:s.n+offset,label:s.label};}));
    offset=main.length*2;
    steps=steps.concat(TRANSLATE_STEPPER.map(function(s){return {n:s.n+offset,label:s.label};}));
  }
  renderStepper(steps,step+offset);
}
function setScreen(active){
  document.getElementById('voiceHome').classList.toggle('active',active==='home');
  document.getElementById('voiceWorkflow').classList.toggle('active',active!=='home');
}
function goHome(clear){
  VOICE_REQUEST_ID++;
  hideLoading();
  if(clear){VOICE_STATE={voiceMode:null,voiceStep:0,voiceInput:null,voiceResult:null,audioResult:null,srtResult:null,translationDirection:'MY_TO_CN',translationResult:null,processingState:null,errorState:null,source:'',srtSource:null};LAST_AUDIO={base64:'',mime:'audio/wav',url:''};MEDIA_AUDIO={base64:'',mime:'',fileName:''};translatedSrt='';}
  setScreen('home');document.getElementById('voiceStepper').innerHTML='';document.getElementById('voiceWorkflowBody').innerHTML='';
}
function resetVoiceBranch(mode,source){
  source=source||'';
  VOICE_STATE={voiceMode:mode,voiceStep:1,voiceInput:null,voiceResult:null,audioResult:null,srtResult:null,translationDirection:'MY_TO_CN',translationResult:null,processingState:null,errorState:null,source:source,srtSource:null};
  translatedSrt='';LAST_AUDIO={base64:'',mime:'audio/wav',url:''};MEDIA_AUDIO={base64:'',mime:'',fileName:''};
}
function voiceStartMode(mode,restore){
  if(!restore)resetVoiceBranch(mode);
  else VOICE_STATE.voiceMode=mode;
  VOICE_STATE.voiceStep=1;VOICE_STATE.errorState=null;
  setScreen('workflow');
  if(mode==='text-to-voice')renderTextInput();else renderMediaInput();
}
function workflowTop(title){
  return '<div class="top-actions"><button class="btn ghost" onclick="goHome(false)">← Voice Studio Home</button><div style="color:var(--muted);font-size:12px;padding:9px 2px;">'+esc(title)+'</div></div>';
}
function renderTextInput(){
  VOICE_STATE.voiceStep=1;voiceRenderCombinedStepper('main',1);
  document.getElementById('voiceWorkflowBody').innerHTML=workflowTop('📝 စာသား → အသံ')+voiceErrorBanner()+\`
  <div class="vcard">
    <div class="vtitle">📝 စာသား</div><p class="hint">Voice အဖြစ် ဖန်တီးလိုသော စာသားနှင့် စကားပြောပုံစံကို ထည့်ပါ။</p>
    \${VOICE_STATE.source?'<div class="source-note">Content Studio မှ နောက်ဆုံးပြင်ထားသော Content ကို အလိုအလျောက် ထည့်ပေးထားပါသည်။</div>':''}
    <div class="form-group"><label>စာသားအကြောင်းအရာ *</label><textarea id="ttsText" placeholder="Voice ပြောင်းလိုသော Text ကို ထည့်ပါ" oninput="autoGrow(this)"></textarea></div>
    <div class="form-group"><label>Speaking Style</label><textarea id="speakingStyle" placeholder="ဥပမာ - နူးညံ့စွာ၊ တက်ကြွစွာ၊ သဘာဝကျစွာ ပြောပါ" oninput="autoGrow(this)"></textarea></div>
    <div class="form-group"><label>Voice Style</label><select id="voiceName">\${voiceOptions()}</select></div>
    <div class="form-group"><label>ညွှန်ကြားချက် (Optional)</label><textarea id="voiceInstruction" placeholder="AI အသံအတွက် ထပ်မံညွှန်ကြားလိုသည်များ" oninput="autoGrow(this)"></textarea></div>
    <div class="form-group"><label>ပရိသတ်</label><select id="audience"><option>လူတိုင်း</option><option>လူငယ်</option><option>လူကြီး</option><option>ကလေး</option></select></div>
    <div class="btn-row"><button class="btn primary" id="voiceNextBtn" onclick="submitTextToVoice()">အသံဖန်တီးရန် →</button></div>
  </div>\`;
  applyDraftToForm();
}
function composeVoiceText(){
  var text=val('ttsText').trim(),parts=[];
  var speaking=val('speakingStyle').trim(),instruction=val('voiceInstruction').trim(),aud=val('audience').trim();
  if(speaking)parts.push('[Speaking Style: '+speaking+']');
  if(instruction)parts.push('[Voice Instruction: '+instruction+']');
  if(aud)parts.push('[Target audience: '+aud+']');
  parts.push(text);
  return parts.join('\\n\\n');
}
function submitTextToVoice(){
  var text=val('ttsText').trim();if(!text){toast('Voice ပြောင်းလိုသော စာသားကို ထည့်ပါ','error');return;}
  VOICE_STATE.errorState=null;
  var btn=document.getElementById('voiceNextBtn');if(btn.disabled)return;btn.disabled=true;
  var requestId=++VOICE_REQUEST_ID;
  VOICE_STATE.voiceInput={text:text,speakingStyle:val('speakingStyle'),voiceStyle:val('voiceName'),instruction:val('voiceInstruction'),audience:val('audience')};
  renderVoiceProcessing();
  showLoading('✨ AI အသံဖန်တီးနေသည်...');
  api('/api/studio/voice/tts',{text:composeVoiceText(),voiceName:val('voiceName')}).then(function(d){
    if(requestId!==VOICE_REQUEST_ID)return;
    hideLoading();
    if(d.error)throw new Error(d.error+'|'+(d.detail||''));
    LAST_AUDIO.base64=d.data;LAST_AUDIO.mime=d.mimeType||'audio/wav';
    VOICE_STATE.audioResult={data:d.data,mimeType:LAST_AUDIO.mime};
    VOICE_STATE.voiceResult=d;
    renderVoiceResult();
    toast('✓ Voice ဖန်တီးပြီးပါပြီ','success');saveDraft();
  }).catch(function(e){if(requestId===VOICE_REQUEST_ID){hideLoading();renderVoiceError('tts',e);}});
}
function renderVoiceProcessing(){
  VOICE_STATE.voiceStep=2;voiceRenderCombinedStepper('main',2);
  document.getElementById('voiceWorkflowBody').innerHTML=workflowTop('📝 စာသား → အသံ')+processHtml('✨ AI အသံဖန်တီးနေသည်...',[
    ['✓','အချက်အလက်များကို ဖတ်နေသည်'],['✓','အသံအကြောင်းအရာကို ခွဲခြမ်းနေသည်'],['●','AI အသံဖန်တီးနေသည်'],['○','အသံကို စစ်ဆေးနေသည်']
  ]);
}
function renderVoiceResult(){
  VOICE_STATE.voiceStep=3;voiceRenderCombinedStepper('main',3);
  var url=URL.createObjectURL(base64Blob(LAST_AUDIO.base64,LAST_AUDIO.mime));LAST_AUDIO.url=url;
  document.getElementById('voiceWorkflowBody').innerHTML=workflowTop('🎧 အသံ ရလဒ်')+\`
  <div class="vcard"><div class="vtitle">🎧 အသံ ရလဒ်</div>
    <div class="audio-box"><audio controls src="\${esc(url)}"></audio>
      <div class="btn-row"><a class="btn secondary" href="\${esc(url)}" download="voice_output.wav">💾 Download Audio</a></div>
    </div>
    <div class="btn-row"><button class="btn secondary" onclick="saveVoiceCreation()">💾 သိမ်းရန်</button><button class="btn ghost" onclick="renderTextInput()">← ပြန်ပြင်ရန်</button></div>
  </div>
  <div class="vcard"><div class="vtitle">📝 မူရင်း SRT စာတန်းထိုး</div><p class="hint">အသံမှ SRT စာတန်းထိုး လိုအပ်မှသာ ဆက်လုပ်ပါ။</p>
    <button class="btn primary" onclick="startSrtFromVoice()">SRT ဖန်တီးရန် →</button>
  </div>\`;
}
function renderVoiceError(kind,e){
  var msg=friendlyError({error:(e.message||'').split('|')[0],detail:(e.message||'').split('|').slice(1).join('|')},kind==='tts'?'အသံဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။ ခဏအကြာတွင် ထပ်မံကြိုးစားပါ။':'ဆောင်ရွက်ရာတွင် အခက်အခဲရှိနေပါသည်။');
  console.error('Voice TTS Error:', e);
  VOICE_STATE.errorState=msg;
  toast(msg,'error');
  // Error → သက်ဆိုင်ရာ Input Step (စာသား) သို့ Auto Back — ထည့်ထားသော Input များ မပျောက်စေရ
  renderTextInput();
}
function startSrtFromVoice(){
  if(USER_PLAN!=='PRO'){toast('ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်','error');return;}
  VOICE_STATE.processingState='srt';VOICE_STATE.srtSource='voice';renderSrtInput('voice');
}
function renderSrtInput(source){
  VOICE_STATE.srtSource=source;VOICE_STATE.voiceStep=1;voiceRenderCombinedStepper('srt',1);
  document.getElementById('voiceWorkflowBody').innerHTML=workflowTop('📄 SRT')+voiceErrorBanner()+\`
  <div class="vcard"><div class="vtitle">📄 SRT ဖန်တီးရန်</div><p class="hint">လက်ရှိ Audio မှ Timestamp ပါသော SRT ကို ဖန်တီးပါ။</p>
    <div class="source-note">မူရင်း Audio ရလဒ်ကို အသုံးပြုပါမည်။ SRT ကို အလိုအလျောက် မဖန်တီးပါ။</div>
    <div class="btn-row"><button class="btn primary" onclick="submitSrt('\${source}')">SRT ဖန်တီးရန် →</button><button class="btn ghost" onclick="\${source==='voice'?'renderVoiceResult()':'renderMediaResult()'}">← နောက်သို့</button></div>
  </div>\`;
}
function submitSrt(source){
  if(USER_PLAN!=='PRO'){toast('ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်','error');return;}
  var b=source==='voice'?LAST_AUDIO:MEDIA_AUDIO;if(!b.base64){toast('SRT ထုတ်ဖို့ Audio/Video မရှိသေးပါ','error');return;}
  VOICE_STATE.errorState=null;
  var requestId=++VOICE_REQUEST_ID;
  VOICE_STATE.processingState='srt';renderSrtProcessing();
  showLoading('✨ AI စာတန်းထိုးဖန်တီးနေသည်...');
  api('/api/studio/voice/srt',{audioBase64:b.base64,mimeType:b.mime,type:'2'}).then(function(d){
    if(requestId!==VOICE_REQUEST_ID)return;
    hideLoading();
    if(d.error)throw new Error(d.error+'|'+(d.detail||''));VOICE_STATE.srtResult=d.srt||'';renderSrtResult(source);toast('✓ SRT ပြီးပါပြီ','success');saveDraft();
  }).catch(function(e){if(requestId===VOICE_REQUEST_ID){hideLoading();renderGenericError('srt',source,e);}});
}
function renderSrtProcessing(){
  VOICE_STATE.voiceStep=2;voiceRenderCombinedStepper('srt',2);
  document.getElementById('voiceWorkflowBody').innerHTML=workflowTop('📄 SRT')+processHtml('✨ AI စာတန်းထိုးဖန်တီးနေသည်...',[['✓','စာသား / အသံအချက်အလက်များကို ဖတ်နေသည်'],['✓','အသံအကြောင်းအရာကို ခွဲခြမ်းနေသည်'],['●','AI စာတန်းထိုးဖန်တီးနေသည်'],['○','စာတန်းထိုးကို စစ်ဆေးနေသည်']]);
}
function renderSrtResult(source){
  VOICE_STATE.voiceStep=3;voiceRenderCombinedStepper('srt',3);
  document.getElementById('voiceWorkflowBody').innerHTML=workflowTop('📄 SRT ရလဒ်')+\`
  <div class="vcard"><div class="vtitle">📄 SRT ရလဒ်</div><p class="hint">Timestamp များကို မူရင်းအတိုင်း ထိန်းသိမ်းထားပါသည်။ လိုအပ်သလို စာသားကို ပြင်နိုင်ပါသည်။</p>
    <textarea class="srt-box" id="srtEditor" oninput="autoGrow(this)">\${esc(VOICE_STATE.srtResult)}</textarea>
    <div class="btn-row"><button class="btn success" onclick="copyValue('srtEditor')">📋 Copy SRT</button><button class="btn secondary" onclick="downloadValue('srtEditor','original_subtitle.srt')">💾 Save .srt</button><button class="btn purple" onclick="saveSrtCreation('original')">💾 သိမ်းရန်</button></div>
  </div>
  <div class="vcard"><div class="vtitle">🌐 ဘာသာပြန်</div><p class="hint">လိုအပ်မှသာ ဘာသာပြန်လုပ်ပါ။</p><button class="btn primary" onclick="startTranslation('\${source}')">ဘာသာပြန်ဖန်တီးရန် →</button></div>\`;
}
function startTranslation(source){
  if(USER_PLAN!=='PRO'){toast('ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်','error');return;}
  var edited=val('srtEditor').trim();if(edited)VOICE_STATE.srtResult=edited;
  VOICE_STATE.processingState='translation';renderTranslationInput(source);
}
function renderTranslationInput(source){
  VOICE_STATE.voiceStep=1;voiceRenderCombinedStepper('translation',1);
  document.getElementById('voiceWorkflowBody').innerHTML=workflowTop('🌐 ဘာသာပြန်')+voiceErrorBanner()+\`
  <div class="vcard"><div class="vtitle">🌐 ဘာသာပြန်</div>
    <div class="form-group"><label>ဘာသာပြန်ဦးတည်ချက်</label><select id="translationDirection" onchange="VOICE_STATE.translationDirection=this.value">
      <option value="MY_TO_CN"\${VOICE_STATE.translationDirection==='MY_TO_CN'?' selected':''}>မြန်မာ → တရုတ်</option>
      <option value="CN_TO_MY"\${VOICE_STATE.translationDirection==='CN_TO_MY'?' selected':''}>တရုတ် → မြန်မာ</option>
    </select></div>
    <div class="btn-row"><button class="btn primary" onclick="submitTranslation('\${source}')">ဘာသာပြန်ဖန်တီးရန် →</button><button class="btn ghost" onclick="renderSrtResult('\${source}')">← SRT ရလဒ်</button></div>
  </div>\`;
}
function submitTranslation(source){
  if(USER_PLAN!=='PRO'){toast('ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်','error');return;}
  var srt=val('srtEditor')||VOICE_STATE.srtResult;if(!srt.trim()){toast('ဘာသာပြန်ဖို့ SRT မရှိသေးပါ','error');return;}
  VOICE_STATE.errorState=null;
  VOICE_STATE.translationDirection=val('translationDirection')||VOICE_STATE.translationDirection;
  var requestId=++VOICE_REQUEST_ID;
  VOICE_STATE.processingState='translation';renderTranslationProcessing();
  showLoading('✨ AI ဘာသာပြန်ဖန်တီးနေသည်...');
  api('/api/studio/voice/translate-srt',{srtText:srt,direction:VOICE_STATE.translationDirection,type:'2'}).then(function(d){
    if(requestId!==VOICE_REQUEST_ID)return;
    hideLoading();
    if(d.error)throw new Error(d.error+'|'+(d.detail||''));translatedSrt=d.srt||'';VOICE_STATE.translationResult=translatedSrt;renderTranslationResult(source);toast('✓ ဘာသာပြန်ပြီးပါပြီ','success');saveDraft();
  }).catch(function(e){if(requestId===VOICE_REQUEST_ID){hideLoading();renderGenericError('translation',source,e);}});
}
function renderTranslationProcessing(){
  VOICE_STATE.voiceStep=2;voiceRenderCombinedStepper('translation',2);
  document.getElementById('voiceWorkflowBody').innerHTML=workflowTop('🌐 ဘာသာပြန်')+processHtml('✨ AI ဘာသာပြန်ဖန်တီးနေသည်...',[['✓','စာသားများကို ဖတ်နေသည်'],['✓','ဘာသာပြန်အကြောင်းအရာကို ခွဲခြမ်းနေသည်'],['●','ဘာသာပြန်ဖန်တီးနေသည်'],['○','ဘာသာပြန်ကို စစ်ဆေးနေသည်']]);
}
function renderTranslationResult(source){
  VOICE_STATE.voiceStep=3;voiceRenderCombinedStepper('translation',3);
  var s=VOICE_STATE.translationResult||translatedSrt;
  document.getElementById('voiceWorkflowBody').innerHTML=workflowTop('🌐 ဘာသာပြန် ရလဒ်')+\`
  <div class="vcard"><div class="vtitle">🌐 ဘာသာပြန် ရလဒ်</div><p class="hint">မူရင်း SRT Number နှင့် Timestamp များကို မပြောင်းထားပါ။</p>
    <textarea class="srt-box" id="translatedEditor">\${esc(s)}</textarea>
    <div class="btn-row"><button class="btn success" onclick="copyValue('translatedEditor')">📋 Copy SRT</button><button class="btn secondary" onclick="downloadValue('translatedEditor','translated_subtitle.srt')">💾 Save .srt</button><button class="btn purple" onclick="saveSrtCreation('translated')">💾 သိမ်းရန်</button></div>
  </div>\`;
}
function renderGenericError(kind,source,e){
  var raw=(e&&e.message)||'';var actual=(raw.split('|')[0]||'').trim();
  var key=actual|| (kind==='translation'?'translate_error':kind==='srt'?'srt_error':'request_error');
  var msg=friendlyError({error:key},kind==='translation'?'ဘာသာပြန်ဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။ ခဏအကြာတွင် ထပ်မံကြိုးစားပါ။':kind==='srt'?'SRT ဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။ ခဏအကြာတွင် ထပ်မံကြိုးစားပါ။':'ဆောင်ရွက်ရာတွင် အခက်အခဲရှိနေပါသည်။');
  console.error(kind==='srt'?'Voice SRT Error:':'Voice Translate Error:', e);
  VOICE_STATE.errorState=msg;
  toast(msg,'error');
  // Error → သက်ဆိုင်ရာ Input / Setup Step သို့ Auto Back — Processing Step တွင် မရပ်ပါ
  if(kind==='srt'){renderSrtInput(source);}
  else{renderTranslationInput(source);}
}
function processHtml(title,items){
  return '<div class="vcard process"><div class="process-icon">✨</div><h2>'+esc(title)+'</h2><div class="status-list">'+items.map(function(x){return '<div class="status-line '+(x[0]==='✓'?'done':'current')+'">'+esc(x[0]+' '+x[1])+'</div>';}).join('')+'</div></div>';
}
function renderMediaInput(){
  VOICE_STATE.voiceStep=1;voiceRenderCombinedStepper('main',1);
  var reuseNote=(MEDIA_AUDIO.base64)?'<div class="source-note">ယခင် ဖိုင်ကို မှတ်ထားပါသည် — အောက်က ခလုတ်ဖြင့် ပြန်လည်ကြိုးစားနိုင်ပါသည်။</div><div class="btn-row"><button class="btn secondary" onclick="submitMedia(&#39;text&#39;)">&#8635; ယခင် ဖိုင်ဖြင့် ထပ်မံကြိုးစားရန်</button></div>':'';
  document.getElementById('voiceWorkflowBody').innerHTML=workflowTop('🎧 အသံ / Video → စာသား')+voiceErrorBanner()+\`
  <div class="vcard"><div class="vtitle">🎧 အသံ / Video</div><p class="hint">Audio သို့မဟုတ် Video ဖိုင်ကို တင်ပါ။ 5MB အထိ အသုံးပြုနိုင်ပါသည်။</p>
    <div class="form-group"><label>Audio / Video File</label><input type="file" id="mediaFile" accept="audio/*,video/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm,.mp4,.mov,.mkv" onchange="previewMediaChoice()"></div>
    \${reuseNote}
  </div>
  <div class="vcard" id="mediaOutputCard" style="display:none"><div class="vtitle">Output ရွေးချယ်ရန်</div><p class="hint">ဖိုင်တင်ပြီးနောက် လိုချင်သော result တစ်ခုကို ရွေးပါ။</p><div class="choice-grid">
    <button class="choice-card" onclick="submitMedia('text')"><strong>📝 စာသား</strong><span>အသံ/Video ထဲက စကားပြောစာသားကို ရိုးရိုး Text အဖြစ်ရယူရန်</span></button>
    <button class="choice-card" onclick="submitMedia('srt')"><strong>📄 မူရင်း SRT</strong><span>Timestamp ပါတဲ့ subtitle အဖြစ် ရယူရန်</span></button>
  </div></div>\`;
}
function previewMediaChoice(){
  var f=document.getElementById('mediaFile')&&document.getElementById('mediaFile').files[0];
  var card=document.getElementById('mediaOutputCard');
  if(card)card.style.display=f?'block':'none';
}
function readMedia(cb){
  var f=document.getElementById('mediaFile')?document.getElementById('mediaFile').files[0]:null;
  if(!f){
    // Error → Auto Back ပြီးနောက် ဖိုင်အသစ် ပြန်ရွေးမထားလျှင် ယခင် ဖိုင်ကို ပြန်သုံးသည် (Data မပျောက်စေရ)
    if(MEDIA_AUDIO.base64){cb();return;}
    toast('Audio သို့မဟုတ် Video ဖိုင် ရွေးပါ','error');return;
  }
  if(f.size>5*1024*1024){toast('ဖိုင်သည် 5MB ထက် မကျော်ရပါ','error');return;}
  var r=new FileReader();r.onload=function(e){MEDIA_AUDIO={base64:e.target.result.split(',')[1],mime:f.type||'application/octet-stream',fileName:f.name};cb();};r.onerror=function(){toast('ဖိုင်ဖတ်ရာတွင် အခက်အခဲရှိနေပါသည်','error');};r.readAsDataURL(f);
}
function submitMedia(type){
  VOICE_STATE.errorState=null;
  readMedia(function(){
    if(type==='srt'){startSrtMedia();return;}
    var requestId=++VOICE_REQUEST_ID;
    renderMediaProcessing();
    showLoading('✨ AI စာသားဖန်တီးနေသည်...');
    api('/api/studio/voice/transcribe',{audioBase64:MEDIA_AUDIO.base64,mimeType:MEDIA_AUDIO.mime,type:'1'}).then(function(d){
      if(requestId!==VOICE_REQUEST_ID)return;
      hideLoading();
      if(d.error)throw new Error(d.error+'|'+(d.detail||''));VOICE_STATE.voiceResult={text:d.text||''};renderMediaResult();toast('✓ စာသားဖန်တီးပြီးပါပြီ','success');saveDraft();
    }).catch(function(e){if(requestId===VOICE_REQUEST_ID){hideLoading();renderMediaError(e);}});
  });
}
function renderMediaProcessing(){
  VOICE_STATE.voiceStep=2;voiceRenderCombinedStepper('main',2);
  document.getElementById('voiceWorkflowBody').innerHTML=workflowTop('🎧 အသံ / Video → စာသား')+processHtml('✨ AI စာသားဖန်တီးနေသည်...',[['✓','အသံ / Video ကို ဖတ်နေသည်'],['✓','အကြောင်းအရာကို ခွဲခြမ်းနေသည်'],['●','စာသားကို ဖန်တီးနေသည်'],['○','စာသားကို စစ်ဆေးနေသည်']]);
}
function renderMediaError(e){
  var msg=friendlyError({error:(e.message||'').split('|')[0]},'စာသားဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။ ခဏအကြာတွင် ထပ်မံကြိုးစားပါ။');
  console.error('Voice Transcribe Error:', e);
  VOICE_STATE.errorState=msg;
  toast(msg,'error');
  // Error → သက်ဆိုင်ရာ Input Step (အသံ / Video) သို့ Auto Back — ယခင် ဖိုင်ကို ပြန်သုံးနိုင်ရန် ထားပေးသည်
  renderMediaInput();
}
function renderMediaResult(){
  VOICE_STATE.voiceStep=3;voiceRenderCombinedStepper('main',3);
  document.getElementById('voiceWorkflowBody').innerHTML=workflowTop('📝 စာသား ရလဒ်')+\`
  <div class="vcard"><div class="vtitle">📝 စာသား ရလဒ်</div><p class="hint">စာသားကို လိုအပ်သလို ပြင်ဆင်နိုင်ပါသည်။</p>
    <textarea id="textResult" class="result-text" oninput="autoGrow(this)">\${esc((VOICE_STATE.voiceResult&&VOICE_STATE.voiceResult.text)||'')}</textarea>
    <div class="btn-row"><button class="btn success" onclick="copyValue('textResult')">📋 Copy</button><button class="btn purple" onclick="saveTranscript()">💾 သိမ်းရန်</button><button class="btn ghost" onclick="renderMediaInput()">← ပြန်ဖန်တီးရန်</button></div>
  </div>\`;
}
function startSrtMedia(){if(USER_PLAN!=='PRO'){toast('ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်','error');return;}VOICE_STATE.processingState='srt';VOICE_STATE.srtSource='media';renderSrtInput('media');}
function autoGrow(x){if(!x)return;x.style.height='auto';x.style.height=Math.min(Math.max(x.scrollHeight,100),520)+'px';}
function copyValue(id){var x=document.getElementById(id),t=x?(x.value!==undefined?x.value:x.textContent):'';if(!t.trim()){toast('Copy လုပ်ဖို့ Result မရှိပါ','error');return;}if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast('✓ Copy ပြီးပါပြီ','success');});}
function downloadValue(id,name){var x=document.getElementById(id),t=x?x.value:'';if(!t.trim()){toast('Save လုပ်ဖို့ Result မရှိပါ','error');return;}var u=URL.createObjectURL(new Blob([t],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},500);}
function saveVoiceCreation(){
  var text=val('ttsText')||VOICE_STATE.voiceInput&&VOICE_STATE.voiceInput.text;if(!text)return;
  var title=prompt('Creation အမည် ပေးပါ:',text.substring(0,40));if(title===null)return;
  AICS_CREATIONS.save({studio:'VOICE',type:'1',title:title||'Voice Text',original_prompt:text,ai_output:text,media_type:LAST_AUDIO.base64?'audio':'',media_mime:LAST_AUDIO.mime,media_data:LAST_AUDIO.base64||''}).then(function(){toast('💾 Save ပြီးပါပြီ','success');}).catch(function(){toast('Save မအောင်မြင်ပါ','error');});
}
function saveTranscript(){
  var text=val('textResult');if(!text.trim()){toast('Save လုပ်ဖို့ Result မရှိပါ','error');return;}
  var title=prompt('Creation အမည် ပေးပါ:','Voice Transcript');if(title===null)return;
  AICS_CREATIONS.save({studio:'VOICETRANSCRIBE',type:'1',title:title||'Voice Transcript',original_prompt:'(Audio / Video transcription)',ai_output:text,media_type:MEDIA_AUDIO.base64?'audio':'',media_mime:MEDIA_AUDIO.mime||'',media_data:MEDIA_AUDIO.base64||''}).then(function(){toast('💾 Save ပြီးပါပြီ','success');}).catch(function(){toast('Save မအောင်မြင်ပါ','error');});
}
function saveSrtCreation(kind){
  if(USER_PLAN!=='PRO'){toast('ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်','error');return;}
  var srt=kind==='translated'?(val('translatedEditor')||translatedSrt):val('srtEditor');
  if(!srt.trim()){toast('Save လုပ်ဖို့ SRT မရှိပါ','error');return;}
  var title=prompt('Creation အမည် ပေးပါ:',kind==='translated'?'Voice Translated SRT':'Voice Original SRT');if(title===null)return;
  var b=VOICE_STATE.voiceMode==='media-to-text'?MEDIA_AUDIO:LAST_AUDIO;
  AICS_CREATIONS.save({studio:'VOICE',type:'2',title:title||'Voice SRT',original_prompt:val('srtEditor'),ai_output:srt,media_type:b.base64?'audio':'',media_mime:b.mime||'',media_data:b.base64||''}).then(function(){toast('💾 Save ပြီးပါပြီ','success');}).catch(function(){toast('Save မအောင်မြင်ပါ','error');});
}
function hydratePlan(){
  apiGet('/api/users/me').then(function(d){
    if(d.error){localStorage.removeItem('aics_token');location.reload();return;}
    USER_PLAN=d.plan||'FREE';var p=document.getElementById('sidePlan');if(p)p.textContent=USER_PLAN;
  }).catch(function(){});
}
function apiGet(path){var h={};if(TOKEN)h.Authorization='Bearer '+TOKEN;return fetch(path,{headers:h}).then(function(r){return r.json();});}
function applyContentTransfer(){
  try{
    var raw=localStorage.getItem('aics_voice_transfer');if(!raw)return;
    var d=JSON.parse(raw);if(!d||!d.text)return;
    var transferSource=d.source||'content';
    resetVoiceBranch('text-to-voice',transferSource);
    setScreen('workflow');
    renderTextInput();
    document.getElementById('ttsText').value=d.text;
    var s=document.getElementById('speakingStyle');if(s&&d.speakingStyle)s.value=d.speakingStyle;
    var v=document.getElementById('voiceName');if(v&&d.voiceStyle)v.value=d.voiceStyle;
    var ins=document.getElementById('voiceInstruction');if(ins&&d.instruction)ins.value=d.instruction;
    var a=document.getElementById('audience');if(a&&d.audience)a.value=d.audience;
    autoGrow(document.getElementById('ttsText'));localStorage.removeItem('aics_voice_transfer');saveDraft();
  }catch(e){}
}
function studioOnStep(){/* Voice Studio owns its branch stepper; shared shell stepper is intentionally unused. */}
window.studioOnStep=studioOnStep;
function studioCollectDraft(){return{voiceState:VOICE_STATE,translation:translatedSrt};}
window.studioCollectDraft=studioCollectDraft;
function studioRestoreDraft(){/* Draft is restored by Voice Studio after its DOM is ready. */}
window.studioRestoreDraft=studioRestoreDraft;

(function initVoice(){
  if(!TOKEN){document.getElementById('loginView').style.display='flex';document.getElementById('aicsApp').style.display='none';return;}
  hydratePlan();
  var restored=restoreDraft();
  if(restored && VOICE_STATE.voiceMode){
    setScreen('workflow');
    var src=VOICE_STATE.srtSource||'voice';
    if(VOICE_STATE.processingState==='srt' && VOICE_STATE.srtResult){
      renderSrtResult(src);
    }else if(VOICE_STATE.processingState==='translation' && VOICE_STATE.translationResult){
      renderTranslationResult(src);
    }else if(VOICE_STATE.voiceMode==='text-to-voice' && VOICE_STATE.audioResult && VOICE_STATE.audioResult.data){
      renderVoiceResult();
    }else if(VOICE_STATE.voiceMode==='media-to-text' && VOICE_STATE.voiceResult && VOICE_STATE.voiceResult.text){
      renderMediaResult();
    }else{
      // Draft မှာ Branch ရွေးထားပြီး Result မရသေးလျှင် — ထို Branch ၏ Input UI ကို ပြန်ပြသည် (Branch state မပျောက်စေရ)
      voiceStartMode(VOICE_STATE.voiceMode,true);
    }
  }else if(restored && VOICE_STATE.voiceMode==='text-to-voice' && VOICE_DRAFT_VALUES && VOICE_DRAFT_VALUES.tts){
    voiceStartMode('text-to-voice',true);
  }
  applyContentTransfer();
})();
</script>
</body></html>`;
