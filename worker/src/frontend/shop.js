// AI Creative Studio — Shop Studio Frontend (Phase 14 — Main Stepper + Branch Stepper)
// Workflow:
//   Main: 01 Content → 02 Shop Content ရလဒ် (AI processing ကို Result နေရာတွင် ပြသည်)
//   Branch 02 မှ:  🎬 Video Branch (Content → Video Setup → Video Result)
//                  🔊 Audio Branch (Content → Audio Setup → Audio Result → SRT → Translation)
// Studio Isolation: ဤ File သည် Shop Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Shared: renderSidebar / sidebarScript / renderStudioShell (frontend/shared.js)
// ⚠️ ရှိပြီးသား API (shop/content/generate, revise, video/generate, video-image,
//    voice/tts, voice/srt, voice/translate-srt) ကိုသာ reuse လုပ်သည် — API အသစ် မထည့်ပါ။
// ⚠️ Video Branch နှင့် Audio Branch သည် independent — branch state သီးခြားထားသည်။

import { renderSidebar, sidebarScript, renderStudioShell } from './shared.js';

// ===================== MAIN STEPPER (အမြဲမြင်ရမည် — ၂ ဆင့်) =====================
// AI processing loading ကို Stepper ထဲမှာ မပြတော့ဘဲ Result နေရာတွင် ပြသည်
const STEPS = [
  { label: '01 အကြောင်းအရာ' },
  { label: '02 Shop Content ရလဒ်', req: [2] },
];

const STEP1_HTML = `
<div class="aics-step" data-step="1">
<div class="card">
<div class="card-title">&#128230; အကြောင်းအရာ — ကုန်ပစ္စည်း အချက်အလက်</div>
<p class="hint">Type ရွေးပြီး အောက်ကနေရာလေးများကို ဖြည့်ရေးပါ — AI Marketing Content ဖန်တီးပေးပါမယ်။</p>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>ဈေးကွန်တင့် အမျိုးအစား</label>
<select id="contentTypeSel" onchange="contentType=this.value;">
<option value="1" selected>📦 Product Description (Free)</option>
<option value="2">💰 Sales Copy (Pro)</option>
<option value="3">📢 Marketing Script (Pro)</option>
<option value="4">📄 Content Type 4 (Pro)</option>
<option value="5">📄 Content Type 5 (Pro)</option>
</select>
</div>
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>ဘယ်သူအတွက်</label>
<select id="audSel" onchange="window.aichAud=this.value;"><option>လူတိုင်း</option><option>လူငယ်</option><option>လူကြီး</option><option>ကလေး</option></select>
</div>
</div>
<div id="contentFields"></div>
<div class="form-group">
<label>&#128444; Product Reference ပုံများ ပူးတွဲရန် (ချန်ထားလို့ရသည် — အများဆုံး ၅ ပုံ)</label>
<input type="file" id="refImgContent" accept="image/*" multiple>
<div class="ref-preview" id="refPreviewContent"></div>
</div>
</div>
</div>`;

// ===================== MAIN STEP 02 — Shop Content ရလဒ် + Branch ၂ ခု =====================

const STEP3_HTML = `
<div class="aics-step" data-step="3">

<!-- ===== VIEW: Content Result ===== -->
<div id="viewContent">
<div class="shop-view-head">
<span class="shop-view-title">&#128717;&#65039; Shop Content ရလဒ်</span>
</div>
<div class="card">
<div class="card-title">&#128221; AI ရေးသားထားသော Content <span class="edit-hint">&#9999;&#65039; ပြင်ဆင်လို့ရသည်</span></div>
<textarea class="shop-result" id="resultContent" placeholder="(Generate လုပ်ပြီးရင် ဒီနေရာမှာ ပေါ်ပါမယ် — တိုက်ရိုက် ပြင်ဆင်နိုင်ပါတယ်)" oninput="onContentEdit()"></textarea>
<div class="btn-row">
<button class="btn btn-green btn-sm" onclick="copyResult()">&#128203; Copy</button>
<button class="btn btn-purple btn-sm" onclick="saveContent()">&#128190; ဖန်တီးမှုသိမ်းပါ</button>
<button class="btn btn-secondary btn-sm" onclick="toggleChat()">&#129302; ပြင်ဆင်ချင်ပါသလား</button>
</div>
<div class="chat-section" id="chatSection">
<div class="chat-log" id="chatLog"></div>
<div class="chat-input-row">
<input type="text" id="chatInput" placeholder="ဥပမာ - ပိုစိတ်ခံစားရအောင် ပြင်ပေးပါ" onkeypress="if(event.key==='Enter')sendRevision()">
<button class="btn btn-primary btn-sm" onclick="sendRevision()">ပြင်ပါ</button>
</div>
<div class="loading" id="loadingChat">&#9203; ပြင်ဆင်နေပါသည်...</div>
</div>
</div>
<div class="branch-action-grid">
<div class="branch-action-card" onclick="goVideoBranch()">
<div class="ba-icon">&#127916;</div>
<div class="ba-title">Video ဆက်ဖန်တီးရန်</div>
<div class="ba-sub">Product / Character / Scene ဖြင့် Video Plan</div>
</div>
<div class="branch-action-card" onclick="goAudioBranch()">
<div class="ba-icon">&#128266;</div>
<div class="ba-title">အသံ ဆက်ဖန်တီးရန်</div>
<div class="ba-sub">Voice / SRT / ဘာသာပြန်</div>
</div>
</div>
</div>

<!-- ===== VIEW: VIDEO BRANCH ===== -->
<div id="viewVideo" style="display:none;">
<div class="shop-branch-stepper" id="videoBranchStepper"></div>

<div class="card" id="videoSetupCard">
<div class="card-title">&#127916; Video Setup</div>
<p class="hint">Shop Content Result မှ Content ကို အလိုအလျောက် ထည့်ပေးထားပါသည် — လိုအပ်သလို ထပ်ပြင်နိုင်ပါတယ်။</p>
<div class="form-group">
<label>Video ဖန်တီးရန် Content *</label>
<textarea id="videoText" class="shop-result" style="min-height:120px;" oninput="onVideoTextEdit()"></textarea>
</div>
<div class="form-group">
<label>Video Type</label>
<div class="type-chips" id="videoTypes"></div>
</div>
<div class="form-group">
<label>&#128444; Reference ပုံများ ပူးတွဲရန် (ချန်ထားလို့ရသည် — အများဆုံး ၅ ပုံ)</label>
<input type="file" id="refImgVideo" accept="image/*" multiple>
<div class="ref-preview" id="refPreviewVideo"></div>
</div>
<div class="error-box" id="videoErr"></div>
<div class="btn-row">
<button class="btn btn-primary" id="genVideoBtn" onclick="generateVideo()">&#127916; Video Generate</button>
</div>
</div>


<div class="card-title">&#127916; Video Result — Story Map</div>
<div id="videoResultMap"></div>
<div class="btn-row" style="margin-top:16px;">
<button class="btn btn-green" onclick="copyAllVideo()">&#128203; Copy</button>
<button class="btn btn-purple" onclick="saveAllVideo()">&#128190; ဖန်တီးမှုအားလုံးသိမ်း</button>
</div>
</div>
</div>

<!-- ===== VIEW: AUDIO BRANCH ===== -->
<div id="viewAudio" style="display:none;">
<div class="shop-branch-stepper" id="audioBranchStepper"></div>

<div class="card" id="audioSetupCard">
<div class="card-title">&#128266; Audio Setup</div>
<p class="hint">Shop Content Result မှ Content ကို အလိုအလျောက် ထည့်ပေးထားပါသည် — လိုအပ်သလို ထပ်ပြင်နိုင်ပါတယ်။</p>
<div class="form-group">
<label>အသံဖတ်ရန် စာသား *</label>
<textarea id="audioText" class="shop-result" style="min-height:120px;" oninput="onAudioTextEdit()"></textarea>
</div>
<div class="form-group">
<label>&#127908; Voice ရွေးချယ်ရန် (၃၀ မျိုး)</label>
<select id="voiceSelect" onchange="onVoiceChange()">
<option value="Zephyr">Zephyr — တောက်ပ</option><option value="Puck">Puck — တက်ကြွ</option>
<option value="Charon">Charon — ရှင်းလင်းတိကျ</option><option value="Kore" selected>Kore — ခိုင်မာတည်ငြိမ်</option>
<option value="Fenrir">Fenrir — စိတ်လှုပ်ရှားလွယ်</option><option value="Leda">Leda — လူငယ်ဆန်</option>
<option value="Orus">Orus — ခိုင်မာ</option><option value="Aoede">Aoede — ပေါ့ပါးလန်းဆန်း</option>
<option value="Callirrhoe">Callirrhoe — အေးဆေး</option><option value="Autonoe">Autonoe — တောက်ပ</option>
<option value="Enceladus">Enceladus — အသက်ရှူသံပါ</option><option value="Iapetus">Iapetus — ရှင်းလင်း</option>
<option value="Umbriel">Umbriel — အေးဆေး</option><option value="Algieba">Algieba — ချောမွေ့</option>
<option value="Despina">Despina — ချောမွေ့</option><option value="Erinome">Erinome — ရှင်းလင်း</option>
<option value="Algenib">Algenib — ရိုင်းရင့်</option><option value="Rasalgethi">Rasalgethi — ရှင်းလင်းတိကျ</option>
<option value="Laomedeia">Laomedeia — တက်ကြွ</option><option value="Achernar">Achernar — နူးညံ့</option>
<option value="Alnilam">Alnilam — ခိုင်မာ</option><option value="Schedar">Schedar — တညီတညာ</option>
<option value="Gacrux">Gacrux — ရင့်ကျက်</option><option value="Pulcherrima">Pulcherrima — တိုက်ရိုက်</option>
<option value="Achird">Achird — ဖော်ရွေ</option><option value="Zubenelgenubi">Zubenelgenubi — ပေါ့ပေါ့ပါးပါး</option>
<option value="Vindemiatrix">Vindemiatrix — နူးညံ့သိမ်မွေ့</option><option value="Sadachbia">Sadachbia — တက်ကြွရှင်သန်</option>
<option value="Sadaltager">Sadaltager — ဗဟုသုတရှိ</option><option value="Sulafat">Sulafat — နွေးထွေး</option>
</select>
</div>
<div class="error-box" id="audioErr"></div>
<div class="btn-row">
<button class="btn btn-primary" id="genAudioBtn" onclick="generateAudio()">&#128266; Generate Audio</button>
<button class="btn btn-green btn-sm" onclick="copyAudioText()">&#128203; Copy</button>
</div>
</div>


<div class="card-title">&#128266; Audio Result</div>
<div class="audio-player-row">
<button class="btn btn-primary" id="audioPlayBtn" onclick="toggleAudioPlay()">&#9654; Play</button>
<audio id="audioPlayer" controls style="flex:1;min-width:220px;"></audio>
</div>
<div class="audio-info" id="audioInfo">Audio မရှိသေးပါ</div>
<div class="btn-row">
<button class="btn btn-secondary btn-sm" onclick="downloadAudio()">&#128190; Save Audio</button>
</div>
<hr class="divider">
<div class="srt-label">&#128221; မူရင်း SRT စာတန်းထိုး ဖန်တီးရန် <span class="pro-tag">PRO</span></div>
<p class="hint">Audio ကနေ SRT Subtitle ကို ထုတ်နိုင်ပါတယ်။</p>
<button class="btn btn-secondary btn-sm" id="genSrtBtn" onclick="generateSrt()">&#128260; မူရင်း SRT စာတန်းထိုး ဖန်တီးရန်</button>
<div class="pro-lock-note" id="srtLockNote"></div>
</div>


<div class="shop-view-subhead">
<button class="btn btn-secondary btn-sm" onclick="backToAudioResult()">&#8592; Audio Result</button>
<span class="shop-view-title">&#128221; မူရင်း SRT</span>
</div>
<div class="srt-label">&#127916; မူရင်း SRT <span class="edit-hint">&#9999;&#65039; ပြင်ဆင်လို့ရသည်</span></div>
<textarea class="srt-editable" id="srtOriginal" placeholder="(Generate SRT နှိပ်ပြီးမှ ဒီနေရာမှာ ပေါ်ပါမယ်)" oninput="onSrtEdit()"></textarea>
<div class="btn-row">
<button class="btn btn-green btn-sm" onclick="copySrt()">&#128203; Copy</button>
<button class="btn btn-secondary btn-sm" onclick="downloadSrt()">&#128190; Save .srt</button>
</div>
<hr class="divider">
<div class="card-title" style="margin-top:2px;">&#127760; ဘာသာပြန် <span class="pro-tag">PRO</span></div>
<div class="form-group">
<label>ဘာသာစကား (Language)</label>
<select id="transLangSel" onchange="onTransLangChange()">
<option value="my">မြန်မာ</option>
<option value="cn">တရုတ်</option>
</select>
</div>
<div class="dir-row">
<label style="margin:0 8px 0 0;display:inline;">Direction:</label>
<label class="dir-radio"><input type="radio" name="transDir" value="MY_TO_CN" checked onchange="onTransDirChange(this)"><span>မြန်မာ &#8594; တရုတ်</span></label>
<label class="dir-radio"><input type="radio" name="transDir" value="CN_TO_MY" onchange="onTransDirChange(this)"><span>တရုတ် &#8594; မြန်မာ</span></label>
</div>
<div class="btn-row">
<button class="btn btn-primary" id="translateBtn" onclick="translateSrt()">ဘာသာပြန်ရန်</button>
</div>
<div class="pro-lock-note" id="transLockNote"></div>
</div>


<div class="shop-view-subhead">
<button class="btn btn-secondary btn-sm" onclick="backToSrtResult()">&#8592; Original SRT</button>
<span class="shop-view-title">&#127760; Translated SRT</span>
</div>
<div class="srt-label">&#9989; ဘာသာပြန်ထားသော SRT (line-by-line)</div>
<div class="trans-view" id="transResultView"></div>
<div class="btn-row">
<button class="btn btn-green btn-sm" onclick="copyTranslated()">&#128203; Copy</button>
<button class="btn btn-secondary btn-sm" onclick="downloadTranslated()">&#128190; Save .srt</button>
</div>
</div>

</div>
</div>`;

const STEPS_HTML = STEP1_HTML + STEP3_HTML;
export const SHOP_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Shop Studio — AI Creative Studio</title>
<style>
:root{--bg:#080c18;--bg-card:#0d1424;--bg-card2:#111a2e;--bg-input:#0a1020;--border:rgba(0,229,255,0.15);--border-strong:rgba(0,229,255,0.35);--cyan:#00e5ff;--purple:#7b5cff;--text:#e8ecf4;--text2:#8b95a8;--text3:#5a6478;--success:#00e676;--error:#ff5252;--warn:#ffc107;--orange:#ff9f2b}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans Myanmar','Roboto','Segoe UI',Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:14px;line-height:1.6}
a{color:var(--cyan);text-decoration:none}
.aics-work .card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px}
.aics-work .card-title{font-size:15px;font-weight:600;color:var(--cyan);margin-bottom:14px;display:flex;align-items:center;gap:8px}
.aics-work .pro-tag{background:rgba(123,92,255,.2);color:var(--purple);font-size:11px;padding:2px 8px;border-radius:6px;font-weight:600}
.aics-work label{display:block;font-size:12.5px;color:var(--text2);margin-bottom:6px;font-weight:500}
.aics-work input,.aics-work textarea,select{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:14px;padding:11px 14px;color:var(--text);font-size:14px;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
.aics-work input:focus,.aics-work textarea:focus,select:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 2px rgba(0,229,255,.1)}
.aics-work textarea{resize:vertical;min-height:80px}
select{cursor:pointer}
select option{background:var(--bg-card);color:var(--text)}
.aics-work input[type="file"]{padding:10px;cursor:pointer;font-size:13px}
.aics-work .form-group{margin-bottom:14px}
.aics-work .type-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.aics-work .type-chip{padding:8px 14px;background:var(--bg-input);border:2px solid var(--border);border-radius:20px;cursor:pointer;font-size:12.5px;transition:all .2s;color:var(--text2);user-select:none}
.aics-work .type-chip:hover{border-color:var(--cyan)}
.aics-work .type-chip.active{border-color:var(--cyan);background:rgba(0,229,255,.1);color:var(--text)}
.aics-work .type-chip.pro{opacity:.7}
.aics-work .type-chip.locked{opacity:.4;cursor:not-allowed}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;min-height:44px;min-width:44px}
.btn-primary{background:linear-gradient(135deg,var(--cyan),#00b8d4);color:#080c18}
.btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-secondary{background:var(--bg-card2);color:var(--cyan);border:1px solid var(--border-strong)}
.btn-secondary:hover{background:rgba(0,229,255,.1)}
.btn-purple{background:linear-gradient(135deg,var(--purple),#9b7dff);color:#fff}
.btn-green{background:rgba(0,230,118,.15);color:var(--success);border:1px solid rgba(0,230,118,.3)}
.btn-orange{background:rgba(255,159,43,.15);color:var(--orange);border:1px solid rgba(255,159,43,.3)}
.btn-sm{padding:8px 16px;font-size:12.5px;min-height:36px}
.aics-work .btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.aics-work .hint{font-size:12.5px;color:var(--text2);margin-bottom:14px;line-height:1.5}
.aics-work .loading{display:none !important;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);align-items:center;gap:12px;color:#00e5ff;font-size:15px;font-weight:600;padding:16px 28px;border-radius:16px;background:rgba(8,12,24,.95);border:1px solid rgba(0,229,255,.4);box-shadow:0 8px 40px rgba(0,229,255,.3);z-index:99999;backdrop-filter:blur(12px);white-space:nowrap}
.aics-work .loading.show{display:flex}
.aics-work .ref-preview{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}
.aics-work .ref-thumb{position:relative;width:72px;height:72px}
.aics-work .ref-thumb img{width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--border);display:block}
.aics-work .ref-thumb .remove-x{position:absolute;top:-7px;right:-7px;width:22px;height:22px;border-radius:50%;background:var(--error);color:#fff;border:none;font-size:12px;line-height:22px;text-align:center;cursor:pointer;padding:0}
.aics-work .chat-section{margin-top:20px;border-top:1px solid var(--border);padding-top:16px;display:none}
.aics-work .chat-log{max-height:240px;overflow-y:auto;background:var(--bg-input);border-radius:10px;padding:12px;margin-bottom:10px}
.aics-work .chat-bubble{padding:8px 12px;border-radius:10px;margin-bottom:8px;max-width:85%;line-height:1.4;font-size:13px}
.aics-work .chat-user{background:rgba(0,229,255,.1);margin-left:auto;text-align:right}
.aics-work .chat-ai{background:var(--bg-card2);margin-right:auto;color:var(--success)}
.aics-work .chat-input-row{display:flex;gap:8px}
.aics-work .chat-input-row input{flex:1}
.aics-work .srt-editable{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:14px;color:var(--text);font-family:'Courier New',monospace;font-size:12.5px;line-height:1.6;resize:vertical;min-height:140px;margin-top:8px;box-sizing:border-box}
.aics-work .srt-editable:focus{outline:none;border-color:var(--cyan)}
.aics-work .srt-label{font-size:13px;font-weight:600;color:var(--cyan);margin-top:16px;display:flex;align-items:center;gap:8px}
.aics-work .edit-hint{font-size:10.5px;color:var(--text2);background:var(--bg-card2);padding:2px 8px;border-radius:6px;font-weight:normal}
.aics-work .dir-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px}
.aics-work .divider{border:none;border-top:1px solid var(--border);margin:18px 0}
.aics-work .empty-note{color:var(--text3);font-size:13px;padding:14px;background:var(--bg-input);border:1px dashed var(--border);border-radius:10px}
.aics-work audio{width:100%;margin-top:10px}
.aics-work .pro-lock-note{color:var(--warn);font-size:12.5px;margin-top:12px}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg-card2);border:1px solid var(--border-strong);color:var(--text);padding:12px 24px;border-radius:10px;font-size:13.5px;z-index:1000;display:none;box-shadow:0 4px 20px rgba(0,0,0,.4)}
.toast.show{display:block}
.toast.error{border-color:var(--error);color:var(--error)}
.toast.success{border-color:var(--success);color:var(--success)}
/* ===== Main Stepper: done state ✓ ကို shared.js ၏ ::before ဖြင့် ပြသသည် (duplicate မဖြစ်စေရန် local rule ကို ဖယ်သည်) ===== */
/* ===== Branch Stepper (Video / Audio) ===== */
/* Main + Branch = Stepper တစ်ခုတည်း — အောက်က branch stepper container များကို ဖျောက်ပြီး
   #aicsStepper တစ်ခုတည်းတွင် Main + Branch ကို ဆက်ပေါင်းပြသည် */
.aics-work .shop-branch-stepper{display:none!important}
.aics-work .shop-branch-stepper{margin:8px 0 12px;background:#0f1830;border:1px solid rgba(123,92,255,.3);border-radius:10px;padding:6px 8px;overflow-x:auto}
.aics-work .shop-branch-inner{display:flex;align-items:center;gap:3px;min-width:max-content}
.aics-work .shop-bstep{display:flex;align-items:center;gap:5px;padding:6px 9px;border-radius:8px;border:1px solid transparent;color:#5a6478;font-size:12px;white-space:nowrap}
.aics-work .shop-bstep .shop-bstep-marker{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;background:#1a2138;color:#5a6478;flex-shrink:0}
.aics-work .shop-bstep.done{color:#4ade80}
.aics-work .shop-bstep.done .shop-bstep-marker{background:rgba(0,230,118,.15);color:#00e676}
.aics-work .shop-bstep.active{background:linear-gradient(90deg,rgba(123,92,255,.2),rgba(0,229,255,.08));border-color:rgba(123,92,255,.55);color:#fff}
.aics-work .shop-bstep.active .shop-bstep-marker{background:rgba(123,92,255,.35);color:#fff}
.aics-work .shop-bstep-link{width:12px;height:1px;background:rgba(123,92,255,.3);flex-shrink:0}
/* ===== View Head / Branch Head ===== */
.aics-work .shop-view-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.aics-work .shop-view-subhead{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.aics-work .shop-view-title{font-size:15px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:8px}
/* ===== Content Result / Setup textarea (auto-expand) ===== */
.aics-work .shop-result{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:14px;color:var(--text);font-size:14px;line-height:1.7;font-family:inherit;resize:vertical;min-height:120px;box-sizing:border-box;overflow:hidden}
.aics-work .shop-result:focus{outline:none;border-color:var(--cyan)}
/* ===== Branch Action Cards ===== */
.aics-work .branch-action-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:6px}
.aics-work .branch-action-card{background:linear-gradient(135deg,#111a2e,#0d1424);border:1px solid var(--border-strong);border-radius:16px;padding:22px 18px;text-align:center;cursor:pointer;transition:all .2s}
.aics-work .branch-action-card:hover{transform:translateY(-2px);border-color:var(--cyan);box-shadow:0 6px 24px rgba(0,229,255,.15)}
.aics-work .ba-icon{font-size:34px;margin-bottom:8px}
.aics-work .ba-title{font-size:15px;font-weight:700;color:var(--text)}
.aics-work .ba-sub{font-size:12px;color:var(--text2);margin-top:4px}
/* ===== Loading (status lines) ===== */
.aics-work .shop-loading-card{text-align:center;padding:28px 16px}
.aics-work .shop-loading-card .spinner{width:36px;height:36px;border-width:4px;margin:0 auto 16px}
.aics-work .spinner{width:20px;height:20px;border:3px solid rgba(0,229,255,.2);border-top-color:#00e5ff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}
.aics-work .shop-loading-title{font-size:17px;font-weight:700;color:var(--cyan);margin-bottom:18px}
.aics-work .shop-status-list{max-width:440px;margin:0 auto;text-align:left}
.aics-work .st-line{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;color:var(--text2);font-size:13.5px;opacity:.5;transition:all .2s}
.aics-work .st-line .st-marker{width:22px;text-align:center;flex-shrink:0;font-weight:700;color:var(--text3)}
.aics-work .st-line.active{opacity:1;color:var(--text);background:rgba(0,229,255,.06)}
.aics-work .st-line.active .st-marker{color:var(--cyan)}
.aics-work .st-line.done{opacity:1;color:var(--text)}
.aics-work .st-line.done .st-marker{color:var(--success)}
.aics-work .error-box{display:none;background:rgba(255,82,82,.1);border:1px solid rgba(255,82,82,.3);color:var(--error);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px;line-height:1.7;white-space:pre-line;text-align:left}
.aics-work .error-box.show{display:block}
.aics-work .retry-row{display:none;justify-content:center;gap:10px;margin-top:16px;flex-wrap:wrap}
.aics-work .retry-row.show{display:flex}
/* ===== Story Map (Video Result) ===== */
.aics-work .story-map .sm-section{margin-top:22px}
.aics-work .story-map .sm-section:first-child{margin-top:0}
.aics-work .sm-section-title{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;color:var(--text);margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border)}
.aics-work .sm-card{background:var(--bg-input);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:14px}
.aics-work .sm-card-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}
.aics-work .sm-card-name{font-weight:700;color:var(--cyan);font-size:14px}
.aics-work .sm-id{font-size:10.5px;color:var(--purple);background:rgba(123,92,255,.12);border:1px solid rgba(123,92,255,.3);padding:2px 10px;border-radius:20px;font-family:'Courier New',monospace;word-break:break-all}
.aics-work .sm-lbl{font-size:11.5px;color:var(--text2);font-weight:700;letter-spacing:.4px;margin:10px 0 6px;text-transform:uppercase}
.aics-work .sm-txt{white-space:pre-wrap;line-height:1.6;background:var(--bg-card);padding:10px 12px;border-radius:8px;font-size:13px;word-break:break-word}
.aics-work .sm-meta{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:12.5px;color:var(--text2);padding:8px 0;margin-bottom:4px}
.aics-work .sm-meta-item{display:inline-flex;align-items:center;gap:5px}
.aics-work .sm-meta-item b{color:var(--text);font-weight:600}
.aics-work .sm-scene{position:relative;padding:0 0 22px 26px;margin-left:6px;border-left:2px solid rgba(123,92,255,.35)}
.aics-work .sm-scene:last-child{border-left-color:transparent;padding-bottom:0}
.aics-work .sm-scene::before{content:'';position:absolute;left:-7px;top:4px;width:12px;height:12px;border-radius:50%;background:var(--purple);box-shadow:0 0 0 3px rgba(123,92,255,.15)}
.aics-work .sm-scene-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px}
.aics-work .sm-scene-title{font-weight:700;color:var(--purple);font-size:14.5px}
.aics-work .sm-box{margin-top:10px}
.aics-work .shop-gen-img{width:100%;max-width:420px;border-radius:8px;border:1px solid var(--border);margin-top:8px;display:block}
/* ===== Audio ===== */
.aics-work .audio-player-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:4px}
.aics-work .audio-player-row audio{flex:1;min-width:220px;margin-top:0}
.aics-work .audio-info{font-size:12.5px;color:var(--text2);margin-top:10px}
/* ===== Translation (line-by-line) ===== */
.aics-work .trans-view{margin-top:10px}
.aics-work .trans-pair{background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:10px}
.aics-work .trans-ts{font-size:11px;color:var(--text3);font-family:'Courier New',monospace;margin-bottom:6px}
.aics-work .trans-src{font-size:13.5px;color:var(--cyan);line-height:1.6;word-break:break-word}
.aics-work .trans-out{font-size:13.5px;color:var(--success);line-height:1.6;margin-top:4px;padding-top:4px;border-top:1px dashed rgba(0,230,118,.2);word-break:break-word}
.aics-work .dir-radio{display:inline-flex;align-items:center;gap:6px;background:var(--bg-input);border:1px solid var(--border);border-radius:20px;padding:8px 14px;font-size:12.5px;color:var(--text2);cursor:pointer;user-select:none}
.aics-work .dir-radio input{width:auto;margin:0;accent-color:var(--cyan);min-height:0;padding:0}
.aics-work .dir-radio.selected{border-color:var(--cyan);background:rgba(0,229,255,.1);color:var(--text)}
/* ===== Responsive ===== */
@media(max-width:767px){
.aics-work .branch-action-grid{grid-template-columns:1fr}
.aics-work .sm-meta{gap:4px 12px}
.aics-work .audio-player-row audio{min-width:100%}
.aics-work .shop-view-title{font-size:13.5px}
.aics-work .card{padding:14px}
}
</style>
</head>
<body>
<div id="loginView" class="aics-login-overlay" style="display:none;"><div class="aics-login-box"><h2>Login လုပ်ရန် လိုအပ်ပါသည်</h2><p>Shop Studio ကို အသုံးပြုရန် Google နဲ့ Login ဝင်ပါ။</p><a href="/api/auth/login?next=/app/shop" class="btn btn-primary">Google နဲ့ Login</a></div></div>
${renderStudioShell({
  id: 'shop',
  activeId: 'shop',
  nameMy: 'ဈေး Studio',
  desc: 'Marketing content & product videos',
  icon: '🛒',
  modelCat: 'text',
  steps: STEPS,
  content: STEPS_HTML,
})}
${sidebarScript()}
<div class="toast" id="toast"></div>
<script>
var TOKEN=localStorage.getItem('aics_token')||'';
var USER_PLAN='FREE';
var contentType='1';
var videoType='1';
var refImagesContent=[];
var refImagesVideo=[];
var lastAudioBase64='';
var shopBusy=false;
var twTimer=null;
var twRunning=false;
var audioDuration='';
var saveTimer=null;

// ===================== SHOP MAIN STEPS (Main + Branch Combined Stepper အတွက်) =====================
// Module-level STEPS (shell) နှင့် တူညီသော data — page script ထဲတွင် သုံးနိုင်ရန် ဤနေရာတွင် ထည့်သည်
var SHOP_MAIN_STEPS=${JSON.stringify(STEPS.map(function(s){return {label:s.label,lock:!!s.lock,loading:s.loading||''};}))};

// ===================== SHOP STATE (Branch အလိုက် သီးခြား) =====================
// shopContent သည် source/root data ဖြစ်သည်။
// Video Branch ပြင်ခြင်းက Audio ကို မထိခိုက်၊ Audio Branch ပြင်ခြင်းက Video ကို မထိခိုက်ရပါ။
var shopState={
  mainStep:1,
  view:'content', // 'content' | 'video' | 'audio'
  content:{
    input:{idea:'',type:'1',images:[]},
    result:'' // နောက်ဆုံး edited content — latest source
  },
  video:{
    step:1, // 1=setup 2=loading 3=result
    input:{text:'',type:'1',images:[]},
    result:{product:null,characters:[],scenes:[]}
  },
  audio:{
    step:1, // 1=setup 2=loading 3=result 4=srtLoading 5=srt 6=transLoading 7=trans
    input:{text:'',voiceName:'Kore'},
    result:{data:'',mimeType:'audio/wav',url:'',voiceName:''},
    srt:{text:''},
    translation:{dir:'MY_TO_CN',srt:'',text:''}
  }
};

var CONTENT_FIELDS=[
  {label:'ကုန်ပစ္စည်း/ဝန်ဆောင်မှု အချက်အလက်',placeholder:'ဥပမာ - မီးဖို သုံးလုံးအစုံ, Non-stick coating, size 3 မျိုး',required:true,multiline:true},
  {label:'ကုန်ပစ္စည်း အမျိုးအစား',placeholder:'ဥပမာ - အိမ်သုံးပစ္စည်း / အလှကုန် / အဝတ်အစား'},
  {label:'ဘယ်သူတွေအတွက်လဲ (Target Customer)',placeholder:'ဥပမာ - မိသားစုသုံး / အမျိုးသမီးများ'},
  {label:'Platform',placeholder:'ဥပမာ - Facebook / TikTok / Shop Page'},
  {label:'အထူး Promotion ရှိလား',placeholder:'ဥပမာ - လျှော့စျေး ၂၀% / Free Delivery / မရှိပါ'}
];
var VIDEO_TYPES=[
  {val:'1',label:'🎬 Product Video (Free)'},
  {val:'2',label:'🎬 Scene Planning (Pro)',pro:true},
  {val:'3',label:'🎬 Product Showcase (Pro)',pro:true},
  {val:'4',label:'🎬 Customer Targeting (Pro)',pro:true},
  {val:'5',label:'🎬 Video Type 5 (Pro)',pro:true}
];

// ===================== Helpers =====================
function api(path,opts){
  opts=opts||{};
  var s=document.getElementById('aiModelSel');
  if(s&&s.value&&opts.body)opts.body.model=s.value;
  var headers=opts.headers||{};
  headers['Content-Type']='application/json';
  if(TOKEN)headers['Authorization']='Bearer '+TOKEN;
  return fetch(path,{method:opts.method||'GET',headers:headers,body:opts.body?JSON.stringify(opts.body):undefined})
    .then(function(r){return r.json().catch(function(){return {error:'bad_response',detail:'Server မှ တုံ့ပြန်မှု မရရှိပါ'};});});
}
function showToast(msg,type){var t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.className='toast show'+(type?' '+type:'');setTimeout(function(){t.className='toast';},2500);}
function base64ToBlob(b64,mime){var bin=atob(b64);var arr=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);return new Blob([arr],{type:mime});}
function escapeHtml(s){var d=document.createElement('div');d.textContent=(s==null?'':String(s));return d.innerHTML;}
function escapeAttr(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function safeUrl(u){u=String(u||'').trim();return (u.indexOf('http://')===0||u.indexOf('https://')===0||u.indexOf('data:image/')===0||u.indexOf('/')===0)?u:'';}
function pad2(n){return String(n).padStart(2,'0');}

// User-friendly Burmese error message (API error object မှ)
function friendlyApiError(d){
  var msg=(d&&d.error)?String(d.error):'';
  var detail=(d&&d.detail)?String(d.detail):'';
  var hay=msg+' '+detail;
  if(/unauthorized|invalid_token/.test(hay))return 'Login သက်တမ်း ကုန်သွားပါပြီ။ ပြန် Login ဝင်ပါ။';
  if(/pro_only|feature_disabled|denied|disabled/i.test(hay))return 'ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။';
  if(/usage|limit|quota/i.test(hay))return 'Usage Limit ပြည့်သွားပါပြီ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
  if(!msg&&!detail)return 'ဖန်တီး၍ မရပါ။ ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
  return msg+(detail?': '+detail:'');
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

// ===================== Typewriter + Auto-expand =====================
function typewrite(ta,text){
  stopTypewriter();
  if(!ta)return;
  var i=0,total=text.length;
  var step=Math.max(1,Math.round(total/150));
  twRunning=true;
  ta.value='';
  twTimer=setInterval(function(){
    i+=step;
    if(i>=total){ta.value=text;twRunning=false;stopTypewriter();autoExpand(ta);return;}
    ta.value=text.slice(0,i);
    autoExpand(ta);
  },16);
}
function stopTypewriter(){if(twTimer){clearInterval(twTimer);twTimer=null;}twRunning=false;}
function autoExpand(ta){
  if(!ta)return;
  ta.style.height='auto';
  ta.style.height=(ta.scrollHeight+2)+'px';
}

// ===================== Draft Save (autoSave — Refresh ပြီးနောက် မပျောက်ရ) =====================
function sanitizeForDraft(state){
  var s=JSON.parse(JSON.stringify(state));
  if(s.video&&s.video.result){
    (s.video.result.characters||[]).forEach(function(c){if(c.referenceImage&&c.referenceImage.indexOf('data:')===0)c.referenceImage='';});
    (s.video.result.scenes||[]).forEach(function(sc){if(sc.envImage&&sc.envImage.indexOf('data:')===0)sc.envImage='';});
    if(s.video.result.product&&s.video.result.product.image&&s.video.result.product.image.indexOf('data:')===0)s.video.result.product.image='';
  }
  return s;
}
function autoSave(){
  try{
    var data=studioCollectDraft();
    localStorage.setItem('aics_draft_shop',JSON.stringify({step:window.studioCur?window.studioCur():1,data:data,savedAt:new Date().toISOString()}));
  }catch(e){
    try{
      var data2=studioCollectDraft();
      var s=sanitizeForDraft(data2.shopState);
      data2.shopState=s;
      localStorage.setItem('aics_draft_shop',JSON.stringify({step:window.studioCur?window.studioCur():1,data:data2,savedAt:new Date().toISOString()}));
    }catch(e2){}
  }
}
function scheduleSave(){if(saveTimer)clearTimeout(saveTimer);saveTimer=setTimeout(autoSave,400);}

// ===================== Content Input =====================
function buildContentFields(){
  var c=document.getElementById('contentFields');
  if(!c)return;
  CONTENT_FIELDS.forEach(function(f,i){
    var grp=document.createElement('div');grp.className='form-group';
    var lbl=document.createElement('label');lbl.textContent=f.label+(f.required?' *':'');
    var inp=f.multiline?document.createElement('textarea'):document.createElement('input');
    inp.id='cf'+i;inp.placeholder=f.placeholder;
    grp.appendChild(lbl);grp.appendChild(inp);c.appendChild(grp);
  });
}
function collectContentIdea(){
  var parts=[];
  CONTENT_FIELDS.forEach(function(f,i){
    var v=document.getElementById('cf'+i).value.trim();
    if(v)parts.push(f.label+': '+v);
  });
  var audEl=document.getElementById('audSel');
  if(audEl&&audEl.value){parts.push('ဘယ်သူအတွက်: '+audEl.value);window.aichAud=audEl.value;}
  return parts.join('\\n\\n');
}
function syncContent(){
  var ta=document.getElementById('resultContent');
  if(ta&&ta.value!==undefined){
    // Typewriter ဖွင့်နေစဉ် textarea သည် partial value သာ ရှိနေသေးသည် —
    // ထိုအခါ full generated content (source) ကို မဖျောက်ရပါ။
    if(!twRunning)shopState.content.result=ta.value;
  }
  shopState.content.input.idea=collectContentIdea();
  shopState.content.input.type=contentType;
}
function onContentEdit(){
  stopTypewriter();
  var ta=document.getElementById('resultContent');
  if(!ta)return;
  shopState.content.result=ta.value;
  autoExpand(ta);
  scheduleSave();
}

// ===================== Reference Image Upload =====================
function setupRefUpload(inputId,previewId,arr){
  var inp=document.getElementById(inputId);
  if(!inp)return;
  inp.addEventListener('change',function(e){
    var files=e.target.files;
    for(var i=0;i<files.length;i++){
      if(arr.length>=5){showToast('အများဆုံး ၅ ပုံသာ တင်နိုင်ပါတယ်','error');break;}
      if(files[i].size>5*1024*1024){showToast('ပုံတစ်ပုံသည် 5MB ထက် မကျော်ရပါ','error');continue;}
      (function(file){
        var reader=new FileReader();
        reader.onload=function(ev){
          var b64=ev.target.result.split(',')[1];
          arr.push({base64:b64,mimeType:file.type||'image/png'});
          renderRefPreview(previewId,arr);
        };
        reader.readAsDataURL(file);
      })(files[i]);
    }
    e.target.value='';
  });
}
function renderRefPreview(id,arr){
  var c=document.getElementById(id);
  if(!c)return;
  c.innerHTML='';
  arr.forEach(function(img,idx){
    var d=document.createElement('div');d.className='ref-thumb';
    var im=document.createElement('img');im.src='data:'+img.mimeType+';base64,'+img.base64;
    var x=document.createElement('button');x.className='remove-x';x.textContent='✕';
    x.onclick=function(){arr.splice(idx,1);renderRefPreview(id,arr);};
    d.appendChild(im);d.appendChild(x);c.appendChild(d);
  });
}

// ===================== Type Chips (Video) =====================
function buildTypes(containerId,types,varName){
  var c=document.getElementById(containerId);
  if(!c)return;
  c.innerHTML='';
  types.forEach(function(t){
    var d=document.createElement('div');
    d.className='type-chip'+(t.pro?' pro':'')+(t.val==='1'?' active':'');
    d.setAttribute('data-val',t.val);
    d.textContent=t.label;
    d.onclick=function(){
      if(t.pro&&USER_PLAN!=='PRO'){showToast('ဒီ Type ကို Pro User သာ သုံးနိုင်ပါတယ်','error');return;}
      c.querySelectorAll('.type-chip').forEach(function(x){x.classList.remove('active');});
      d.classList.add('active');
      if(varName==='video'){videoType=t.val;shopState.video.input.type=t.val;scheduleSave();}
    };
    c.appendChild(d);
  });
}
function setTypeChip(containerId,val){
  var c=document.getElementById(containerId);
  if(!c)return;
  c.querySelectorAll('.type-chip').forEach(function(x){
    if(x.getAttribute('data-val')===String(val))x.classList.add('active');
    else x.classList.remove('active');
  });
}

// ===================== MAIN STEP 01 → 02 → 03 (Content Generate) =====================
function generateContent(){
  if(shopBusy)return;
  var idea=collectContentIdea();
  if(!idea){showToast('အနည်းဆုံး Product Info ကို ထည့်ပါ','error');return;}
  if(contentType!=='1'&&USER_PLAN!=='PRO'){showToast('ဒီ Type ကို Pro User သာ သုံးနိုင်ပါတယ်','error');return;}
  shopState.content.input.idea=idea;
  shopState.content.input.type=contentType;
  shopState.content.input.images=refImagesContent;
  shopBusy=true;
  if(window.studioForceGoStep)window.studioForceGoStep(2);
  else window.studioGoStep(2);
  if(window.studioSetActions)window.studioSetActions([]);
  // Unified Result Loading — Processing Step ကို Stepper မှာ မပြတော့ဘဲ Result နေရာတွင် Loading ပြသည်
  if(window.studioShowResultLoading)window.studioShowResultLoading('AI က သင့်အတွက် Shop Content ကို ရေးသားနေသည်...', '“'+(window.studioPreviewText?window.studioPreviewText(idea):'')+'”');
  api('/api/studio/shop/content/generate',{method:'POST',body:{idea:idea,type:contentType,images:refImagesContent}})
  .then(function(d){
    if(window.studioHideResultLoading)window.studioHideResultLoading();
    shopBusy=false;
    if(d.error){
      console.error('Shop Content Generate Error:', d.error);
      if(window.studioUnmarkDone)window.studioUnmarkDone(2);
      showToast('⚠️ Content ဖန်တီး၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ','error');
      // Error → Result နေရာတွင် unified error card (Retry / Back) ဖြင့် ပြသည်
      if(window.studioShowResultError)window.studioShowResultError('❌ Content ဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။\\n'+friendlyApiError(d),generateContent,function(){if(window.studioGoStep)window.studioGoStep(1);});
      return;
    }
    var text=d.content||'';
    if(d.speakingStyle)text+='\\n\\n[SPEAKING STYLE]\\n'+d.speakingStyle;
    if(d.voiceStyle)text+='\\n\\n[VOICE STYLE]\\n'+d.voiceStyle;
    shopState.content.result=text;
    studioMarkDone(1);
    studioMarkDone(2);
    var ta=document.getElementById('resultContent');
    if(ta){ta.value=text;}
    shopState.view='content';
    if(window.studioOnStep){try{window.studioOnStep(2);}catch(e){}}
    if(ta)typewrite(ta,text);
    showToast('✓ Content ဖန်တီးပြီးပါပြီ','success');
    autoSave();
  })
  .catch(function(err){
    console.error('Shop Content Generate Error:', err);
    if(window.studioHideResultLoading)window.studioHideResultLoading();
    shopBusy=false;
    if(window.studioUnmarkDone)window.studioUnmarkDone(2);
    showToast('⚠️ Content ဖန်တီး၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ','error');
    // Error → Result နေရာတွင် unified error card (Retry / Back) ဖြင့် ပြသည်
    if(window.studioShowResultError)window.studioShowResultError('❌ Content ဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။\\nNetwork error — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။',generateContent,function(){if(window.studioGoStep)window.studioGoStep(1);});
  });
}
function retryContent(){
  generateContent();
}
function copyResult(){var t=document.getElementById('resultContent').value;if(!t){showToast('Copy လုပ်ဖို့ မရှိပါ','error');return;}navigator.clipboard.writeText(t);showToast('✓ Copy ပြီးပါပြီ','success');}
function saveContent(){
  var t=document.getElementById('resultContent').value;
  if(!t){showToast('Save လုပ်ဖို့ မရှိပါ','error');return;}
  var title=prompt('Creation အမည်:',t.substring(0,40));
  if(title===null)return;
  AICS_CREATIONS.save({studio:'SHOPCONTENT',type:contentType,title:title||'Shop Content',original_prompt:collectContentIdea(),ai_output:t})
  .then(function(){showToast('💾 Save ပြီးပါပြီ','success');})
  .catch(function(){showToast('Browser Storage မအောင်မြင်','error');});
}
function toggleChat(){var s=document.getElementById('chatSection');if(!s)return;s.style.display=s.style.display==='block'?'none':'block';}
function sendRevision(){
  var instr=document.getElementById('chatInput').value.trim();
  if(!instr){showToast('ညွှန်ကြားချက် ထည့်ပါ','error');return;}
  var current=document.getElementById('resultContent').value;
  if(!current){showToast('Content အရင် Generate လုပ်ပါ','error');return;}
  var log=document.getElementById('chatLog');
  log.innerHTML+='<div class="chat-bubble chat-user">'+escapeHtml(instr)+'</div>';
  document.getElementById('chatInput').value='';
  document.getElementById('loadingChat').classList.add('show');
  api('/api/studio/shop/content/revise',{method:'POST',body:{idea:collectContentIdea(),type:contentType,currentContent:current,instruction:instr}})
  .then(function(d){
    document.getElementById('loadingChat').classList.remove('show');
    if(d.error){showToast(friendlyApiError(d),'error');return;}
    var text=d.content||'';
    if(d.speakingStyle)text+='\\n\\n[SPEAKING STYLE]\\n'+d.speakingStyle;
    if(d.voiceStyle)text+='\\n\\n[VOICE STYLE]\\n'+d.voiceStyle;
    var ta=document.getElementById('resultContent');
    if(ta){ta.value=text;autoExpand(ta);}
    shopState.content.result=text;
    log.innerHTML+='<div class="chat-bubble chat-ai">✓ ပြင်ဆင်ပြီးပါပြီ</div>';
    log.scrollTop=log.scrollHeight;
    autoSave();
  })
  .catch(function(){
    document.getElementById('loadingChat').classList.remove('show');
    showToast('Network error','error');
  });
}

// ===================== Branch Stepper Render =====================
function renderBranchStepper(id,steps,cur,doneMap){
  var c=document.getElementById(id);
  if(!c)return;
  var html='<div class="shop-branch-inner">';
  for(var i=0;i<steps.length;i++){
    var done=doneMap.indexOf(i)!==-1;
    var cls='shop-bstep'+(done?' done':(i===cur?' active':' todo'));
    var marker=done?'✓':(i===cur?'●':'○');
    html+='<div class="'+cls+'"><span class="shop-bstep-marker">'+marker+'</span><span class="shop-bstep-label">'+steps[i]+'</span></div>';
    if(i<steps.length-1)html+='<span class="shop-bstep-link"></span>';
  }
  html+='</div>';
  c.innerHTML=html;
}
// ===================== Combined Stepper (Main + Branch = ONE line) =====================
// Main Stepper ကို မဖျောက်ဘဲ Branch steps များကို Main steps နောက်တွင် ဆက်ပေါင်းပြသည်
function shopStepDefs(){
  var defs=[];
  var i;
  var hasResult=!!(shopState.content.result&&shopState.content.result.trim());
  var shellCur=(window.studioCur)?window.studioCur():1;
  // Main steps (SHOP_MAIN_STEPS — shell STEPS နှင့် တူညီသည် — 01/02/03)
  for(i=0;i<SHOP_MAIN_STEPS.length;i++){
    var s=SHOP_MAIN_STEPS[i];
    var n=i+1;
    var cls='';
    if(n===shellCur)cls='active';
    else if((n===1||n===2)&&hasResult)cls='done';
    else if(n===2||(n===3&&!hasResult))cls='todo';
    defs.push({n:n,label:s.label,loading:s.loading||'',main:true,state:cls,lock:!!s.lock});
  }
  // Branch steps (active branch ရှိလျှင် Main နောက်တွင် ဆက်ပေါင်းသည်)
  var meta=null;
  if(shopState.view==='video')meta=videoBranchMeta();
  else if(shopState.view==='audio')meta=audioBranchMeta();
  if(meta){
    var n0=defs.length;
    for(i=0;i<meta.steps.length;i++){
      var loading='';
      var st='todo';
      if(i===meta.cur)st='active';
      else if(meta.done.indexOf(i)!==-1)st='done';
      defs.push({n:n0+i+1,label:meta.steps[i],loading:loading,main:false,state:st});
    }
  }
  return defs;
}
function renderShopStepper(){
  var c=document.getElementById('aicsStepper');if(!c)return;
  var defs=shopStepDefs();
  var html='<div class="aics-stepper-inner">';
  for(var i=0;i<defs.length;i++){
    var d=defs[i];
    var label=((i+1<10)?'0':'')+(i+1)+' '+String(d.label).replace(/^\\d+\\s*/,'');
    var cls='aics-step-btn';
    if(d.state)cls+=' '+d.state;
    var loadingSpan='<span class="aics-step-loading"><span class="aics-step-spinner"></span>'+(d.loading||'ဖန်တီးနေသည်...')+'</span>';
    if(d.main){
      html+='<button type="button" class="'+cls+'" data-step="'+d.n+'" onclick="shopMainNav('+d.n+')">'+
        '<span class="aics-step-txt"><span class="aics-step-label">'+label+'</span></span>'+loadingSpan+'</button>';
    }else{
      if(d.state==='active'&&d.loading)cls+=' aics-loading';
      html+='<button type="button" class="'+cls+'" data-step="'+d.n+'" onclick="shopBranchStepHint()">'+
        '<span class="aics-step-txt"><span class="aics-step-label">'+label+'</span></span>'+loadingSpan+'</button>';
    }
    if(i<defs.length-1)html+='<span class="aics-step-link"></span>';
  }
  html+='</div>';
  c.innerHTML=html;
}
function shopMainNav(n){
  if(window.studioGoStep)window.studioGoStep(n);
  // Shell update ပြီးနောက် Branch steps state ကို ပြန်ထိန်းရန် ပြန် render သည်
  renderShopStepper();
}
function shopBranchStepHint(){showToast('ဤအဆင့်သို့ တိုက်ရိုက် မသွားနိုင်ပါ — အောက်ရှိ ခလုတ်များဖြင့် ဆက်လုပ်ပါ');}
function videoBranchMeta(){
  var steps=['Video ပြင်ဆင်ရန်','Video ရလဒ်'];
  var cur,done;
  if(shopState.video.step===1||shopState.video.step===2){cur=0;done=[];}
  else{cur=1;done=[0];}
  return {steps:steps,cur:cur,done:done};
}
function audioBranchMeta(){
  var steps=['Audio ပြင်ဆင်ရန်','Audio ရလဒ်','SRT','SRT ရလဒ်','ဘာသာပြန်','ဘာသာပြန်ရလဒ်'];
  var cur,done;
  switch(shopState.audio.step){
    case 1:cur=0;done=[];break;
    case 2:cur=0;done=[];break;
    case 3:cur=1;done=[0];break;
    case 4:cur=2;done=[0,1];break;
    case 5:cur=3;done=[0,1,2];break;
    case 6:cur=4;done=[0,1,2,3];break;
    case 7:cur=5;done=[0,1,2,3,4];break;
    default:cur=0;done=[];break;
  }
  return {steps:steps,cur:cur,done:done};
}


function showBranchViews(){
  document.getElementById('viewContent').style.display=shopState.view==='content'?'':'none';
  document.getElementById('viewVideo').style.display=shopState.view==='video'?'':'none';
  document.getElementById('viewAudio').style.display=shopState.view==='audio'?'':'none';
  // Main + Branch = Stepper တစ်ခုတည်း — Main Stepper ကို မဖျောက်ဘဲ Branch steps ကို ဆက်ပေါင်းသည်
  renderShopStepper();
  if(shopState.view==='video')showVideoPhase();
  else if(shopState.view==='audio')showAudioPhase();
}
function goContentResult(){
  stopTypewriter();
  syncContent();
  shopState.view='content';
  showBranchViews();
  setActionsForCurrent();
  autoSave();
}
function goVideoBranch(){
  if(!shopState.content.result||!shopState.content.result.trim()){showToast('Content အရင် ဖန်တီးပါ','error');return;}
  stopTypewriter();
  syncContent();
  shopState.view='video';
  var vta=document.getElementById('videoText');
  if(vta){vta.value=shopState.content.result;autoExpand(vta);}
  shopState.video.input.text=shopState.content.result;
  showBranchViews();
  setActionsForCurrent();
  autoSave();
}
function goAudioBranch(){
  if(!shopState.content.result||!shopState.content.result.trim()){showToast('Content အရင် ဖန်တီးပါ','error');return;}
  stopTypewriter();
  syncContent();
  shopState.view='audio';
  var ata=document.getElementById('audioText');
  if(ata){ata.value=shopState.content.result;autoExpand(ata);}
  shopState.audio.input.text=shopState.content.result;
  showBranchViews();
  setActionsForCurrent();
  autoSave();
}

// ===================== VIDEO BRANCH =====================
function showVideoPhase(){
  var meta=videoBranchMeta();
  renderShopStepper();
  document.getElementById('videoSetupCard').style.display=shopState.video.step===1?'':'none';
  document.getElementById('videoResultCard').style.display=shopState.video.step===3?'':'none';
  if(shopState.video.step===3)renderVideoResultMap();
}
function onVideoTextEdit(){
  var ta=document.getElementById('videoText');
  if(!ta)return;
  shopState.video.input.text=ta.value;
  autoExpand(ta);
  scheduleSave();
}
function generateVideo(){
  if(shopBusy)return;
  var text=document.getElementById('videoText').value.trim();
  if(!text){showToast('Video ဖန်တီးရန် Content ထည့်ပါ','error');return;}
  if(videoType!=='1'&&USER_PLAN!=='PRO'){showToast('ဒီ Type ကို Pro User သာ သုံးနိုင်ပါတယ်','error');return;}
  shopState.video.input.text=text;
  shopState.video.input.type=videoType;
  shopState.video.input.images=refImagesVideo;
  shopState.video.step=2;
  showVideoPhase();
  if(window.studioSetActions)window.studioSetActions([]);
  shopBusy=true;
  // Unified Result Loading — Processing Step ကို Stepper မှာ မပြတော့ဘဲ Result နေရာတွင် Loading ပြသည်
  if(window.studioShowResultLoading)window.studioShowResultLoading('AI က သင့်အတွက် Video Plan ကို ပြင်ဆင်နေသည်...', '“'+(window.studioPreviewText?window.studioPreviewText(text):'')+'”');
  api('/api/studio/shop/video/generate',{method:'POST',body:{idea:text,type:videoType,images:refImagesVideo}})
  .then(function(d){
    if(window.studioHideResultLoading)window.studioHideResultLoading();
    shopBusy=false;
    if(d.error){
      console.error('Shop Video Generate Error:', d.error);
      showToast('⚠️ Video ဖန်တီး၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ','error');
      // Error → Result နေရာတွင် unified error card (Retry / Back) ဖြင့် ပြသည်
      if(window.studioShowResultError)window.studioShowResultError('❌ Video ဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။\\n'+friendlyApiError(d),generateVideo,function(){shopState.video.step=1;showVideoPhase();setActionsForCurrent();autoSave();});
      return;
    }
    shopState.video.result={product:d.product||null,characters:d.characters||[],scenes:d.scenes||[]};
    shopState.video.step=3;
    showVideoPhase();
    setActionsForCurrent();
    showToast('✓ Video Plan ပြီးပါပြီ','success');
    autoSave();
  })
  .catch(function(err){
    console.error('Shop Video Generate Error:', err);
    if(window.studioHideResultLoading)window.studioHideResultLoading();
    shopBusy=false;
    showToast('⚠️ Video ဖန်တီး၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ','error');
    // Error → Result နေရာတွင် unified error card (Retry / Back) ဖြင့် ပြသည်
    if(window.studioShowResultError)window.studioShowResultError('❌ Video ဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။\\nNetwork error — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။',generateVideo,function(){shopState.video.step=1;showVideoPhase();setActionsForCurrent();autoSave();});
  });
}
function retryVideo(){
  generateVideo();
}
function backFromVideoLoading(){
  if(window.studioHideResultLoading)window.studioHideResultLoading();
  shopState.video.step=1;
  showVideoPhase();
  setActionsForCurrent();
  autoSave();
}



// ===================== Video Result — Story Map =====================
function durText(v){
  if(v===undefined||v===null||v==='')return '-';
  if(typeof v==='number')return v+' sec';
  var s=String(v).trim();
  return /sec/i.test(s)?s:(s+' sec');
}
function resolveCharNames(ids){
  if(!Array.isArray(ids)||!ids.length)return '-';
  var chars=(shopState.video.result&&shopState.video.result.characters)||[];
  var names=[];
  ids.forEach(function(id){
    var found=null;
    for(var i=0;i<chars.length;i++){
      if(chars[i].id===id||chars[i].name===id){found=chars[i];break;}
    }
    names.push(found?('👤 '+found.name):String(id));
  });
  return names.join(', ');
}
function renderVideoResultMap(){
  var c=document.getElementById('videoResultMap');
  if(!c)return;
  var r=shopState.video.result||{product:null,characters:[],scenes:[]};
  var html='<div class="story-map">';
  // 1) Product Reference
  html+='<div class="sm-section"><div class="sm-section-title">🛍️ PRODUCT REFERENCE</div>';
  if(r.product&&r.product.prompt){
    html+='<div class="sm-card">';
    html+='<div class="sm-card-head"><span class="sm-card-name">🛍️ '+escapeHtml(r.product.name||'Product')+'</span></div>';
    html+='<div class="sm-lbl">Product Prompt</div><div class="sm-txt">'+escapeHtml(r.product.prompt)+'</div>';
    html+='<div class="btn-row"><button class="btn-ghost btn-sm" onclick="smCopyProduct()">&#128203; Copy Product Prompt</button></div>';
    html+='<div class="sm-img-area" id="img_product">'+(r.product.image?'<img class="shop-gen-img" src="'+safeUrl(r.product.image)+'" alt="Product">':'')+'</div>';
    html+='<div class="btn-row"><button class="btn btn-orange btn-sm" data-prompt="'+escapeAttr(r.product.prompt)+'" data-key="product" onclick="genImage(this)">🖼️ Generate Image</button></div>';
    html+='</div>';
  }else{
    html+='<div class="empty-note">Product Reference မရှိပါ</div>';
  }
  html+='</div>';
  // 2) Character Reference
  html+='<div class="sm-section"><div class="sm-section-title">👤 CHARACTER REFERENCE</div>';
  if(r.characters&&r.characters.length){
    for(var i=0;i<r.characters.length;i++){
      (function(idx){
        var ch=r.characters[idx]||{};
        var prompt=ch.characterPrompt||ch.prompt||'(မရှိပါ)';
        html+='<div class="sm-card sm-char">';
        html+='<div class="sm-card-head"><span class="sm-card-name">👤 '+escapeHtml(ch.name||'Character '+(idx+1))+'</span><span class="sm-id">'+escapeHtml(ch.id||('char_'+pad2(idx+1)))+'</span></div>';
        var meta='';
        if(ch.role)meta+='<span class="sm-meta-item">🎭 Role: <b>'+escapeHtml(ch.role)+'</b></span>';
        if(ch.age)meta+='<span class="sm-meta-item">🎂 Age: <b>'+escapeHtml(ch.age)+'</b></span>';
        if(meta)html+='<div class="sm-meta">'+meta+'</div>';
        if(ch.description)html+='<div class="sm-lbl">Description</div><div class="sm-txt">'+escapeHtml(ch.description)+'</div>';
        html+='<div class="sm-img-area" id="img_char'+idx+'">'+(ch.referenceImage?'<img class="shop-gen-img" src="'+safeUrl(ch.referenceImage)+'" alt="Character">':'')+'</div>';
        html+='<div class="sm-lbl">Reference Prompt</div><div class="sm-txt">'+escapeHtml(prompt)+'</div>';
        html+='<div class="btn-row"><button class="btn-ghost btn-sm" onclick="smCopyChar('+idx+')">&#128203; Copy Character Prompt</button><button class="btn btn-orange btn-sm" data-prompt="'+escapeAttr(prompt)+'" data-key="char'+idx+'" onclick="genImage(this)">🖼️ Generate Reference Image</button></div>';
        html+='</div>';
      })(i);
    }
  }else{
    html+='<div class="empty-note">Character မရှိပါ</div>';
  }
  html+='</div>';
  // 3) Scene Map (vertical timeline)
  html+='<div class="sm-section"><div class="sm-section-title">🎬 SCENE MAP</div>';
  if(r.scenes&&r.scenes.length){
    for(var j=0;j<r.scenes.length;j++){
      (function(idx){
        var sc=r.scenes[idx]||{};
        var num=sc.number||(idx+1);
        html+='<div class="sm-scene">';
        html+='<div class="sm-scene-head"><span class="sm-scene-title">🎬 Scene '+escapeHtml(num)+(sc.title?' — '+escapeHtml(sc.title):'')+'</span><span class="sm-id">'+escapeHtml(sc.id||('scene_'+pad2(num)))+'</span></div>';
        html+='<div class="sm-meta">';
        html+='<span class="sm-meta-item">⏱ Duration: <b>'+escapeHtml(durText(sc.duration))+'</b></span>';
        html+='<span class="sm-meta-item">👥 Characters: <b>'+resolveCharNames(sc.characterIds)+'</b></span>';
        html+='<span class="sm-meta-item">🎭 Emotion: <b>'+escapeHtml(sc.emotion||'-')+'</b></span>';
        html+='<span class="sm-meta-item">🎥 Camera: <b>'+escapeHtml(sc.camera||'-')+'</b></span>';
        html+='<span class="sm-meta-item">💡 Lighting: <b>'+escapeHtml(sc.lighting||'-')+'</b></span>';
        html+='</div>';
        html+='<div class="sm-box"><div class="sm-lbl">🎬 Video Prompt</div><div class="sm-txt">'+escapeHtml(sc.videoPrompt||'(မရှိပါ)')+'</div><div class="btn-row"><button class="btn-ghost btn-sm" onclick="smCopyVideoPrompt('+idx+')">&#128203; Copy Video Prompt</button></div></div>';
        html+='<div class="sm-box"><div class="sm-lbl">🌍 Environment Reference</div><div class="sm-txt">'+escapeHtml(sc.environmentPrompt||'(မရှိပါ)')+'</div>';
        html+='<div class="btn-row"><button class="btn-ghost btn-sm" onclick="smCopyEnvPrompt('+idx+')">&#128203; Copy Environment Prompt</button></div>';
        html+='<div class="sm-img-area" id="img_env'+idx+'">'+(sc.envImage?'<img class="shop-gen-img" src="'+safeUrl(sc.envImage)+'" alt="Environment">':'')+'</div>';
        if(sc.environmentPrompt)html+='<div class="btn-row"><button class="btn btn-orange btn-sm" data-prompt="'+escapeAttr(sc.environmentPrompt)+'" data-key="env'+idx+'" onclick="genImage(this)">🖼️ Generate Environment Image</button></div>';
        html+='</div>';
        html+='</div>';
      })(j);
    }
  }else{
    html+='<div class="empty-note">Scene မရှိပါ</div>';
  }
  html+='</div>';
  html+='</div>';
  c.innerHTML=html;
}
function storeImage(key,src){
  var r=shopState.video.result||{};
  if(key==='product'){if(r.product)r.product.image=src;}
  else if(key.indexOf('char')===0){var i=parseInt(key.slice(4),10);if(r.characters&&r.characters[i])r.characters[i].referenceImage=src;}
  else if(key.indexOf('env')===0){var j=parseInt(key.slice(3),10);if(r.scenes&&r.scenes[j])r.scenes[j].envImage=src;}
}
function genImage(btn){
  if(!btn)return;
  var prompt=(btn.getAttribute('data-prompt')||'').trim();
  var key=btn.getAttribute('data-key')||'';
  if(!prompt){showToast('Prompt မရှိပါ','error');return;}
  btn.disabled=true;btn.textContent='⏳ ဖန်တီးနေသည်...';
  api('/api/studio/shop/video-image',{method:'POST',body:{prompt:prompt}})
  .then(function(d){
    btn.disabled=false;btn.textContent='🖼️ Generate Image';
    if(d.error){showToast(friendlyApiError(d),'error');return;}
    var src='data:'+(d.mimeType||'image/png')+';base64,'+d.data;
    storeImage(key,src);
    var area=document.getElementById('img_'+key);
    if(area)area.innerHTML='<img class="shop-gen-img" src="'+src+'" alt="Generated"><div class="btn-row"><a href="'+src+'" download="shop_image.png"><button class="btn btn-secondary btn-sm">💾 Save Image</button></a></div>';
    autoSave();
  })
  .catch(function(){
    btn.disabled=false;btn.textContent='🖼️ Generate Image';
    showToast('Network error','error');
  });
}
function buildCombinedVideo(){
  var r=shopState.video.result||{};
  var t='';
  if(r.product&&r.product.prompt){t+='=== PRODUCT ===\\n'+(r.product.name||'')+'\\n'+(r.product.prompt||'')+'\\n\\n';}
  (r.characters||[]).forEach(function(ch,i){
    t+='=== CHARACTER '+(i+1)+' ===\\nID: '+(ch.id||'-')+'\\nName: '+(ch.name||'')+'\\nRole: '+(ch.role||'')+'\\nDescription: '+(ch.description||'')+'\\nPrompt: '+(ch.characterPrompt||ch.prompt||'')+'\\n\\n';
  });
  (r.scenes||[]).forEach(function(sc,i){
    t+='=== SCENE '+(sc.number||(i+1))+' ===\\nID: '+(sc.id||'-')+'\\nDuration: '+durText(sc.duration)+'\\nCharacters: '+((sc.characterIds||[]).join(', ')||'-')+'\\nEmotion: '+(sc.emotion||'-')+'\\nCamera: '+(sc.camera||'-')+'\\nLighting: '+(sc.lighting||'-')+'\\nENV: '+(sc.environmentPrompt||'')+'\\nVIDEO: '+(sc.videoPrompt||'')+'\\n\\n';
  });
  return t;
}
function copyAllVideo(){
  var r=shopState.video.result||{};
  if(!r.product&&!(r.scenes&&r.scenes.length)&&!(r.characters&&r.characters.length)){showToast('Result မရှိပါ','error');return;}
  navigator.clipboard.writeText(buildCombinedVideo());
  showToast('✓ Copy ပြီးပါပြီ','success');
}
function smCopy(text){
  if(!text){showToast('Copy စရာ မရှိပါ','error');return;}
  navigator.clipboard.writeText(text);
  showToast('&#128203; Copy ပြီးပါပြီ','success');
}
function smCopyProduct(){var r=shopState.video.result||{};smCopy((r.product&&r.product.prompt)||'');}
function smCopyChar(idx){var r=shopState.video.result||{};var ch=r.characters&&r.characters[idx];if(!ch)return;smCopy(ch.characterPrompt||ch.prompt||'');}
function smCopyVideoPrompt(idx){var r=shopState.video.result||{};var sc=r.scenes&&r.scenes[idx];if(!sc)return;smCopy(sc.videoPrompt||'');}
function smCopyEnvPrompt(idx){var r=shopState.video.result||{};var sc=r.scenes&&r.scenes[idx];if(!sc)return;smCopy(sc.environmentPrompt||'');}
function saveAllVideo(){
  var r=shopState.video.result||{};
  if(!r.product&&!(r.scenes&&r.scenes.length)&&!(r.characters&&r.characters.length)){showToast('Result မရှိပါ','error');return;}
  var title=prompt('Creation အမည်:',(shopState.video.input.text||'').substring(0,40));
  if(title===null)return;
  AICS_CREATIONS.save({studio:'SHOPVIDEO',type:videoType,title:title||'Shop Video',original_prompt:shopState.video.input.text||'',ai_output:buildCombinedVideo()})
  .then(function(){showToast('💾 Save ပြီးပါပြီ','success');})
  .catch(function(){showToast('Browser Storage မအောင်မြင်','error');});
}

// ===================== AUDIO BRANCH =====================
function showAudioPhase(){
  var meta=audioBranchMeta();
  renderShopStepper();
  document.getElementById('audioSetupCard').style.display=shopState.audio.step===1?'':'none';
  document.getElementById('audioResultCard').style.display=shopState.audio.step===3?'':'none';
  document.getElementById('srtResultCard').style.display=shopState.audio.step===5?'':'none';
  document.getElementById('transResultCard').style.display=shopState.audio.step===7?'':'none';
  if(shopState.audio.step>=3)updateAudioInfo();
}
function onAudioTextEdit(){
  var ta=document.getElementById('audioText');
  if(!ta)return;
  shopState.audio.input.text=ta.value;
  autoExpand(ta);
  scheduleSave();
}
function onVoiceChange(){
  var sel=document.getElementById('voiceSelect');
  if(sel)shopState.audio.input.voiceName=sel.value;
  scheduleSave();
}
function copyAudioText(){
  var t=document.getElementById('audioText').value;
  if(!t){showToast('မရှိပါ','error');return;}
  navigator.clipboard.writeText(t);
  showToast('✓ Copy ပြီးပါပြီ','success');
}
function generateAudio(){
  if(shopBusy)return;
  var text=document.getElementById('audioText').value.trim();
  if(!text){showToast('အသံဖန်တီးရန် စာသား ထည့်ပါ','error');return;}
  var voice=document.getElementById('voiceSelect').value;
  shopState.audio.input.text=text;
  shopState.audio.input.voiceName=voice;
  shopState.audio.step=2;
  showAudioPhase();
  if(window.studioSetActions)window.studioSetActions([]);
  shopBusy=true;
  // Unified Result Loading — Processing Step ကို Stepper မှာ မပြတော့ဘဲ Result နေရာတွင် Loading ပြသည်
  if(window.studioShowResultLoading)window.studioShowResultLoading('AI က သင့်အတွက် အသံကို ဖန်တီးနေသည်...', '“'+(window.studioPreviewText?window.studioPreviewText(text):'')+'”');
  api('/api/studio/voice/tts',{method:'POST',body:{text:text,voiceName:voice}})
  .then(function(d){
    if(window.studioHideResultLoading)window.studioHideResultLoading();
    shopBusy=false;
    if(d.error){
      console.error('Shop Audio Generate Error:', d.error);
      showToast('⚠️ အသံဖန်တီး၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ','error');
      // Error → Result နေရာတွင် unified error card (Retry / Back) ဖြင့် ပြသည်
      if(window.studioShowResultError)window.studioShowResultError('❌ အသံဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။\\n'+friendlyApiError(d),generateAudio,function(){shopState.audio.step=1;showAudioPhase();setActionsForCurrent();autoSave();});
      return;
    }
    var blob=base64ToBlob(d.data,d.mimeType||'audio/wav');
    var url=URL.createObjectURL(blob);
    shopState.audio.result={data:d.data,mimeType:d.mimeType||'audio/wav',url:url,voiceName:voice};
    lastAudioBase64=d.data;
    audioDuration='';
    var ap=document.getElementById('audioPlayer');
    if(ap){ap.src=url;ap.load();}
    var pb=document.getElementById('audioPlayBtn');
    if(pb)pb.textContent='▶ Play';
    shopState.audio.step=3;
    showAudioPhase();
    setActionsForCurrent();
    showToast('✓ အသံဖန်တီးပြီးပါပြီ','success');
    autoSave();
  })
  .catch(function(err){
    console.error('Shop Audio Generate Error:', err);
    if(window.studioHideResultLoading)window.studioHideResultLoading();
    shopBusy=false;
    showToast('⚠️ အသံဖန်တီး၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ','error');
    // Error → Result နေရာတွင် unified error card (Retry / Back) ဖြင့် ပြသည်
    if(window.studioShowResultError)window.studioShowResultError('❌ အသံဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။\\nNetwork error — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။',generateAudio,function(){shopState.audio.step=1;showAudioPhase();setActionsForCurrent();autoSave();});
  });
}
function retryAudio(){
  generateAudio();
}
function backFromAudioLoading(){
  if(window.studioHideResultLoading)window.studioHideResultLoading();
  shopState.audio.step=1;
  showAudioPhase();
  setActionsForCurrent();
  autoSave();
}



// ===== Audio Result =====
function updateAudioInfo(){
  var el=document.getElementById('audioInfo');
  if(!el)return;
  var d=shopState.audio.result;
  if(!d||!d.data){el.textContent='Audio မရှိသေးပါ';return;}
  var parts=['🎙️ '+(d.voiceName||'Voice'),'💽 '+(d.mimeType||'audio/wav')];
  if(audioDuration)parts.push('⏱ '+audioDuration);
  el.textContent=parts.join(' · ');
}
function toggleAudioPlay(){
  var ap=document.getElementById('audioPlayer');
  if(!ap||!ap.src){showToast('Audio မရှိသေးပါ','error');return;}
  if(ap.paused)ap.play();else ap.pause();
  var pb=document.getElementById('audioPlayBtn');
  if(pb)pb.textContent=ap.paused?'▶ Play':'⏸ Pause';
}
function downloadAudio(){
  var d=shopState.audio.result;
  if(!d||!d.data){showToast('Audio မရှိပါ','error');return;}
  var a=document.createElement('a');
  a.href='data:'+(d.mimeType||'audio/wav')+';base64,'+d.data;
  a.download='shop_audio.wav';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
}
// ===== SRT =====
function generateSrt(){
  if(USER_PLAN!=='PRO'){showToast('Pro Feature ပါ','error');return;}
  if(shopBusy)return;
  if(!lastAudioBase64){showToast('Audio မရှိသေးပါ။ အသံကို အရင်ဖန်တီးပါ','error');return;}
  shopState.audio.step=4;
  showAudioPhase();
  if(window.studioSetActions)window.studioSetActions([]);
  shopBusy=true;
  // Unified Result Loading — Processing Step ကို Stepper မှာ မပြတော့ဘဲ Result နေရာတွင် Loading ပြသည်
  var aText=(document.getElementById('audioText')?document.getElementById('audioText').value:'');
  if(window.studioShowResultLoading)window.studioShowResultLoading('AI က သင့်အတွက် စာတန်းထိုး (SRT) ကို ဖန်တီးနေသည်...', '“'+(window.studioPreviewText?window.studioPreviewText(aText):'')+'”');
  api('/api/studio/voice/srt',{method:'POST',body:{audioBase64:lastAudioBase64,mimeType:(shopState.audio.result.mimeType||'audio/wav'),type:'2'}})
  .then(function(d){
    if(window.studioHideResultLoading)window.studioHideResultLoading();
    shopBusy=false;
    if(d.error){
      console.error('Shop SRT Generate Error:', d.error);
      showToast('⚠️ SRT ဖန်တီး၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ','error');
      // Error → Result နေရာတွင် unified error card (Retry / Back) ဖြင့် ပြသည်
      if(window.studioShowResultError)window.studioShowResultError('❌ စာတန်းထိုးဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။\\n'+friendlyApiError(d),generateSrt,function(){shopState.audio.step=3;showAudioPhase();setActionsForCurrent();autoSave();});
      return;
    }
    shopState.audio.srt.text=d.srt||'';
    var so=document.getElementById('srtOriginal');
    if(so)so.value=shopState.audio.srt.text;
    shopState.audio.step=5;
    showAudioPhase();
    setActionsForCurrent();
    showToast('✓ SRT ပြီးပါပြီ','success');
    autoSave();
  })
  .catch(function(err){
    console.error('Shop SRT Generate Error:', err);
    if(window.studioHideResultLoading)window.studioHideResultLoading();
    shopBusy=false;
    showToast('⚠️ SRT ဖန်တီး၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ','error');
    // Error → Result နေရာတွင် unified error card (Retry / Back) ဖြင့် ပြသည်
    if(window.studioShowResultError)window.studioShowResultError('❌ စာတန်းထိုးဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။\\nNetwork error — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။',generateSrt,function(){shopState.audio.step=3;showAudioPhase();setActionsForCurrent();autoSave();});
  });
}
function retrySrt(){
  generateSrt();
}
function backFromSrtLoading(){
  if(window.studioHideResultLoading)window.studioHideResultLoading();
  shopState.audio.step=3;
  showAudioPhase();
  setActionsForCurrent();
  autoSave();
}
function onSrtEdit(){
  var ta=document.getElementById('srtOriginal');
  if(!ta)return;
  shopState.audio.srt.text=ta.value;
  scheduleSave();
}
function copySrt(){
  var t=document.getElementById('srtOriginal').value;
  if(!t){showToast('မရှိပါ','error');return;}
  navigator.clipboard.writeText(t);
  showToast('✓ Copy ပြီးပါပြီ','success');
}
function downloadSrt(){
  var t=document.getElementById('srtOriginal').value;
  if(!t){showToast('မရှိပါ','error');return;}
  var blob=new Blob([t],{type:'application/octet-stream'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='original.srt';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
}
function backToAudioResult(){
  shopState.audio.step=3;
  showAudioPhase();
  setActionsForCurrent();
  autoSave();
}
// ===== Translation =====
function onTransLangChange(){
  var sel=document.getElementById('transLangSel');
  if(!sel)return;
  var val=sel.value==='cn'?'CN_TO_MY':'MY_TO_CN';
  setTransDir(val);
}
function onTransDirChange(input){
  if(!input)return;
  setTransDir(input.value);
}
function setTransDir(val){
  shopState.audio.translation.dir=val;
  var radios=document.querySelectorAll('input[name="transDir"]');
  for(var i=0;i<radios.length;i++){
    var r=radios[i];
    var lb=r.closest('.dir-radio');
    if(r.value===val){r.checked=true;if(lb)lb.classList.add('selected');}
    else{if(lb)lb.classList.remove('selected');}
  }
}
function getTransDir(){
  var checked=document.querySelector('input[name="transDir"]:checked');
  return checked?checked.value:(shopState.audio.translation.dir||'MY_TO_CN');
}
function translateSrt(){
  if(USER_PLAN!=='PRO'){showToast('Pro Feature ပါ','error');return;}
  if(shopBusy)return;
  var srt=document.getElementById('srtOriginal').value;
  if(!srt||!srt.trim()){showToast('မူရင်း SRT မရှိပါ','error');return;}
  shopState.audio.srt.text=srt;
  var dir=getTransDir();
  shopState.audio.translation.dir=dir;
  shopState.audio.step=6;
  showAudioPhase();
  if(window.studioSetActions)window.studioSetActions([]);
  shopBusy=true;
  // Unified Result Loading — Processing Step ကို Stepper မှာ မပြတော့ဘဲ Result နေရာတွင် Loading ပြသည်
  if(window.studioShowResultLoading)window.studioShowResultLoading('AI က သင့်အတွက် ဘာသာပြန်ကို ဖန်တီးနေသည်...', '“'+(window.studioPreviewText?window.studioPreviewText(srt):'')+'”');
  api('/api/studio/voice/translate-srt',{method:'POST',body:{srtText:srt,direction:dir,type:'2'}})
  .then(function(d){
    if(window.studioHideResultLoading)window.studioHideResultLoading();
    shopBusy=false;
    if(d.error){
      console.error('Shop Translate Error:', d.error);
      showToast('⚠️ ဘာသာပြန်၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ','error');
      // Error → Result နေရာတွင် unified error card (Retry / Back) ဖြင့် ပြသည်
      if(window.studioShowResultError)window.studioShowResultError('❌ ဘာသာပြန်ဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။\\n'+friendlyApiError(d),translateSrt,function(){shopState.audio.step=5;showAudioPhase();setActionsForCurrent();autoSave();});
      return;
    }
    shopState.audio.translation.srt=d.srt||'';
    shopState.audio.translation.text=d.srt||'';
    shopState.audio.step=7;
    showAudioPhase();
    renderTransResult();
    setActionsForCurrent();
    showToast('✓ ဘာသာပြန်ပြီးပါပြီ','success');
    autoSave();
  })
  .catch(function(err){
    console.error('Shop Translate Error:', err);
    if(window.studioHideResultLoading)window.studioHideResultLoading();
    shopBusy=false;
    showToast('⚠️ ဘာသာပြန်၍ မရပါ — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ','error');
    // Error → Result နေရာတွင် unified error card (Retry / Back) ဖြင့် ပြသည်
    if(window.studioShowResultError)window.studioShowResultError('❌ ဘာသာပြန်ဖန်တီးရာတွင် အခက်အခဲရှိနေပါသည်။\\nNetwork error — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။',translateSrt,function(){shopState.audio.step=5;showAudioPhase();setActionsForCurrent();autoSave();});
  });
}
function retryTrans(){
  translateSrt();
}
function backFromTransLoading(){
  if(window.studioHideResultLoading)window.studioHideResultLoading();
  shopState.audio.step=5;
  showAudioPhase();
  setActionsForCurrent();
  autoSave();
}
function parseSrtBlocks(srtText){
  var blocks=[];
  var lines=String(srtText||'').replace(/\\r/g,'').split('\\n');
  var i=0;
  while(i<lines.length){
    var line=lines[i].trim();
    if(/^\\d+$/.test(line)){
      var num=line;
      var ts=lines[i+1]?lines[i+1].trim():'';
      var texts=[];
      var j=i+2;
      while(j<lines.length&&lines[j].trim()!==''&&!/^\\d+$/.test(lines[j].trim())){
        texts.push(lines[j]);
        j++;
      }
      blocks.push({num:num,ts:ts,lines:texts});
      i=j;
    }else{
      i++;
    }
  }
  return blocks;
}
function renderTransResult(){
  var view=document.getElementById('transResultView');
  if(!view)return;
  var srt=shopState.audio.translation.srt||'';
  var blocks=parseSrtBlocks(srt);
  if(!blocks.length){
    view.innerHTML='<div class="empty-note">ဘာသာပြန်ထားသော SRT မရှိပါ</div>';
    return;
  }
  var html='';
  for(var b=0;b<blocks.length;b++){
    var blk=blocks[b];
    var src=blk.lines[0]||'';
    var tr=blk.lines.slice(1).join(' ');
    html+='<div class="trans-pair">';
    html+='<div class="trans-ts">'+escapeHtml(blk.num)+' · '+escapeHtml(blk.ts)+'</div>';
    html+='<div class="trans-src">'+escapeHtml(src)+'</div>';
    if(tr)html+='<div class="trans-out">'+escapeHtml(tr)+'</div>';
    html+='</div>';
  }
  view.innerHTML=html;
}
function copyTranslated(){
  var t=shopState.audio.translation.srt;
  if(!t){showToast('မရှိပါ','error');return;}
  navigator.clipboard.writeText(t);
  showToast('✓ Copy ပြီးပါပြီ','success');
}
function downloadTranslated(){
  var t=shopState.audio.translation.srt;
  if(!t){showToast('မရှိပါ','error');return;}
  var blob=new Blob([t],{type:'application/octet-stream'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='translated.srt';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
}
function backToSrtResult(){
  shopState.audio.step=5;
  showAudioPhase();
  setActionsForCurrent();
  autoSave();
}

// ===================== Studio Shell Hooks (Main Stepper) =====================
function bReset(){return{label:'Reset',cls:'ghost',fn:studioReset};}

function setActionsForCurrent(){
  if(window.studioCur&&window.studioCur()!==2&&window.studioCur()!==3)return;
  var list=[];
  if(shopState.view==='content'){
    list=[bReset(),{label:'📝 Copy',cls:'secondary',fn:copyResult},{label:'💾 ဖန်တီးမှုသိမ်းပါ',cls:'purple',fn:saveContent}];
  }else if(shopState.view==='video'){
    list=[{label:'← Shop Content Result',cls:'ghost',fn:goContentResult},bReset()];
    if(shopState.video.step===3){
      list.push({label:'📋 Copy',cls:'secondary',fn:copyAllVideo});
      list.push({label:'💾 ဖန်တီးမှုအားလုံးသိမ်း',cls:'purple',fn:saveAllVideo});
    }
  }else if(shopState.view==='audio'){
    list=[{label:'← Shop Content Result',cls:'ghost',fn:goContentResult},bReset()];
    if(shopState.audio.step===5)list.push({label:'📋 Copy SRT',cls:'secondary',fn:copySrt});
    if(shopState.audio.step===7)list.push({label:'📋 Copy Translated',cls:'secondary',fn:copyTranslated});
  }
  studioSetActions(list);
}
window.setActionsForCurrent=setActionsForCurrent;

function studioOnStep(n){
  shopState.mainStep=n;
  if(n===1){
    studioSetActions([bReset(),{label:'✨ Generate Content',cls:'primary',fn:generateContent}]);
  }else if(n===2||n===3){
    // Result Step — AI processing loading ကို Stepper မှာ မပြတော့ဘဲ Result နေရာတွင် ပြသည်
    showBranchViews();
    setActionsForCurrent();
    var ta=document.getElementById('resultContent');
    if(ta&&ta.value)autoExpand(ta);
  }
}


// ===================== Draft (studioCollectDraft / studioRestoreDraft) =====================
function normalizeState(s){
  var base={
    mainStep:1,
    view:'content',
    content:{input:{idea:'',type:'1',images:[]},result:''},
    video:{step:1,input:{text:'',type:'1',images:[]},result:{product:null,characters:[],scenes:[]}},
    audio:{step:1,input:{text:'',voiceName:'Kore'},result:{data:'',mimeType:'audio/wav',url:'',voiceName:''},srt:{text:''},translation:{dir:'MY_TO_CN',srt:'',text:''}}
  };
  function merge(b,o){
    if(!o||typeof o!=='object')return b;
    var out=Object.assign({},b);
    for(var k in o){
      if(o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])&&b[k]&&typeof b[k]==='object'){
        out[k]=merge(b[k],o[k]);
      }else{
        out[k]=o[k];
      }
    }
    return out;
  }
  return merge(base,s||{});
}

function studioCollectDraft(){
  syncContent();
  var fields={};
  for(var i=0;i<CONTENT_FIELDS.length;i++){
    var el=document.getElementById('cf'+i);
    if(el)fields[i]=el.value;
  }
  return{
    shopState:sanitizeForDraft(shopState),
    contentType:contentType,
    videoType:videoType,
    fields:fields,
    aud:(document.getElementById('audSel')?document.getElementById('audSel').value:''),
    refCountContent:refImagesContent.length,
    refCountVideo:refImagesVideo.length
  };
}
window.studioCollectDraft=studioCollectDraft;

function studioRestoreDraft(d){
  if(!d)return;
  if(d.shopState&&typeof d.shopState==='object'){
    shopState=normalizeState(d.shopState);
  }
  contentType=d.contentType||'1';
  videoType=d.videoType||'1';
  var cts=document.getElementById('contentTypeSel');
  if(cts)cts.value=String(contentType);
  setTypeChip('videoTypes',videoType);
  var audEl=document.getElementById('audSel');
  if(audEl&&d.aud)audEl.value=d.aud;
  if(audEl)window.aichAud=audEl.value;
  if(d.fields){
    for(var k in d.fields){
      var el=document.getElementById('cf'+k);
      if(el)el.value=d.fields[k];
    }
  }
  var res=shopState.content.result||'';
  var rta=document.getElementById('resultContent');
  if(rta){rta.value=res;if(res)autoExpand(rta);}
  var vta=document.getElementById('videoText');
  if(vta&&shopState.video.input.text)vta.value=shopState.video.input.text;
  var ata=document.getElementById('audioText');
  if(ata&&shopState.audio.input.text)ata.value=shopState.audio.input.text;
  var voiceSel=document.getElementById('voiceSelect');
  if(voiceSel&&shopState.audio.input.voiceName)voiceSel.value=shopState.audio.input.voiceName;
  if(shopState.audio.result&&shopState.audio.result.data){
    lastAudioBase64=shopState.audio.result.data;
    try{
      var url=URL.createObjectURL(base64ToBlob(shopState.audio.result.data,shopState.audio.result.mimeType||'audio/wav'));
      shopState.audio.result.url=url;
      var ap=document.getElementById('audioPlayer');
      if(ap)ap.src=url;
    }catch(e){}
  }
  var so=document.getElementById('srtOriginal');
  if(so&&shopState.audio.srt)so.value=shopState.audio.srt.text||'';
  if(shopState.audio.translation&&shopState.audio.translation.dir)setTransDir(shopState.audio.translation.dir);
  if(res){studioMarkDone(1);studioMarkDone(2);}
}
window.studioRestoreDraft=studioRestoreDraft;

// ===================== Init =====================
(function init(){
  if(!TOKEN){
    document.getElementById('loginView').style.display='flex';
    document.getElementById('aicsApp').style.display='none';
    return;
  }
  var _ve=document.getElementById('userEmail');if(_ve)_ve.textContent=localStorage.getItem('aics_email')||'—';
  var _vp=document.getElementById('planBadge');if(_vp)_vp.textContent=localStorage.getItem('aics_plan')||'FREE';
  buildContentFields();
  buildTypes('videoTypes',VIDEO_TYPES,'video');
  setupRefUpload('refImgContent','refPreviewContent',refImagesContent);
  setupRefUpload('refImgVideo','refPreviewVideo',refImagesVideo);
  var ap=document.getElementById('audioPlayer');
  if(ap){
    ap.addEventListener('loadedmetadata',function(){
      if(isFinite(ap.duration)){audioDuration=Math.round(ap.duration)+' sec';updateAudioInfo();}
    });
    ap.addEventListener('play',function(){var pb=document.getElementById('audioPlayBtn');if(pb)pb.textContent='⏸ Pause';});
    ap.addEventListener('pause',function(){var pb=document.getElementById('audioPlayBtn');if(pb)pb.textContent='▶ Play';});
  }
  api('/api/users/me').then(function(d){
    if(d.error){
      localStorage.removeItem('aics_token');
      location.reload();
      return;
    }
    var _ve2=document.getElementById('userEmail');if(_ve2)_ve2.textContent=d.email||'';
    var _vp2=document.getElementById('planBadge');if(_vp2)_vp2.textContent=d.plan||'FREE';
    var al=document.getElementById('adminLink');
    if(al)al.style.display=d.is_admin?'flex':'none';
    USER_PLAN=d.plan||'FREE';
    applyPlanGate();
  }).catch(function(){});
})();

function applyPlanGate(){
  var pro=USER_PLAN==='PRO';
  var gs=document.getElementById('genSrtBtn');
  var tb=document.getElementById('translateBtn');
  var srtNote=document.getElementById('srtLockNote');
  var transNote=document.getElementById('transLockNote');
  if(!pro){
    if(gs){gs.disabled=true;gs.title='Pro Feature';}
    if(tb){tb.disabled=true;tb.title='Pro Feature';}
    if(srtNote)srtNote.textContent='🔒 ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်';
    if(transNote)transNote.textContent='🔒 ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်';
  }
  var cts=document.getElementById('contentTypeSel');
  if(cts){
    for(var i=0;i<cts.options.length;i++){
      cts.options[i].disabled=(!pro&&cts.options[i].value!=='1');
    }
  }
  var chips=document.querySelectorAll('.type-chip.pro');
  for(var j=0;j<chips.length;j++){
    if(pro)chips[j].classList.remove('locked');
    else chips[j].classList.add('locked');
  }
}
window.applyPlanGate=applyPlanGate;
</script>
</body>
</html>`;
