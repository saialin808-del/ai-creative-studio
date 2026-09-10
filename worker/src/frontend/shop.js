// AI Creative Studio — Shop Studio Frontend (Phase 8 + Master Instruction Phase 10)
// Workflow: Product → Goal → Content → Visual/Voice → Video/Result
// Studio Isolation: ဤ File သည် Shop Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Shared: renderSidebar / sidebarScript / renderStudioShell (frontend/shared.js)
// ⚠️ API Contract / Business Logic မပြောင်းပါ — UI အခွံသာ ပြောင်းပါသည်။

import { renderSidebar, sidebarScript, renderStudioShell } from './shared.js';

const STEPS = [
  { label: 'ဖန်တီးရန်' },
  { label: 'ရည်ရွယ်ချက်', req: [] },
  { label: 'အကြောင်းအရာ', req: [2] },
  { label: 'အသံ', req: [] },
  { label: 'ဗီဒီယို', req: [] },
];

const STEP1_HTML = `
<div class="aics-step" data-step="1">
<div class="card">
<div class="card-title">&#128230; Product — ကုန်ပစ္စည်း အချက်အလက်</div>
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
</div>
</div>`;

const STEP2_HTML = `
<div class="aics-step" data-step="2">
<div class="card">
<div class="card-title">&#127919; Goal — Content ဖန်တီးရန်</div>
<p class="hint">Reference ပုံများ တင်နိုင်ပါတယ် (ချန်ထားလို့ရသည် — အများဆုံး ၅ ပုံ)၊ ပြီးရင် Generate Content နှိပ်ပါ။</p>
<div class="form-group">
<label>&#128444; Product Reference ပုံများ ပူးတွဲရန်</label>
<input type="file" id="refImgContent" accept="image/*" multiple>
<div class="ref-preview" id="refPreviewContent"></div>
</div>
<div class="loading" id="loadingContent">&#9203; Content ဖန်တီးနေပါသည်...</div>
</div>
</div>`;

const STEP3_HTML = `
<div class="aics-step" data-step="3">
<div class="card">
<div class="card-title">&#128221; Content — ရလဒ်ကို ပြင်ဆင်ရန်</div>
<p class="hint">Content ကို တိုက်ရိုက် ပြင်နိုင်ပါတယ်။ "&#129302; ပြင်ဆင်ချင်ပါသလား" နဲ့ AI ကို ဆက်ညွှန်ကြားနိုင်ပါတယ်။</p>
<div class="srt-label">&#127913; Marketing Content <span class="edit-hint">&#9999; ပြင်ဆင်လို့ရသည်</span></div>
<textarea class="srt-editable" id="resultContent" style="font-family:inherit;font-size:14px;" placeholder="(Generate လုပ်ပြီးရင် ဒီနေရာမှာ ပေါ်ပါမယ် — တိုက်ရိုက် ပြင်ဆင်နိုင်ပါတယ်)"></textarea>
<div class="btn-row">
<button class="btn btn-green btn-sm" onclick="copyResult()">&#128203; Copy</button>
<button class="btn btn-purple btn-sm" onclick="saveContent()">&#128190; Save to Creations</button>
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
</div>`;

const STEP4_HTML = `
<div class="aics-step" data-step="4">
<div class="card">
<div class="card-title">&#127908; Visual / Voice — အသံဖန်တီးရန်</div>
<p class="hint">Content က ဒီ Box ထဲ အလိုအလျောက် ဖြည့်ပေးပါမယ်။ Generate Voice နှိပ်ရင် အသံပြောင်းပေးပါတယ်။</p>
<textarea id="ttsText" placeholder="Voice ပြောင်းလိုသော Text ကို ထည့်ပါ"></textarea>
<div class="form-group" style="margin-top:12px;">
<label>&#127908; Voice ရွေးချယ်ရန် (၃၀ မျိုး)</label>
<select id="voiceSelect">
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
<div class="btn-row">
<button class="btn btn-primary" id="genVoiceBtn" onclick="generateVoice()">&#127908; Generate Voice</button>
<button class="btn btn-green btn-sm" onclick="copyTts()">&#128203; Copy</button>
</div>
<div class="loading" id="loadingVoice">&#9203; Voice ဖန်တီးနေပါသည်...</div>
<div id="audioContainer"></div>
</div>
<div class="card" id="srtCard">
<div class="card-title">&#127894; SRT &amp; Translation <span class="pro-tag">PRO</span></div>
<p class="hint">"Generate Voice" ကနေ ဖန်တီးလိုက်တဲ့ Audio ကနေ SRT Subtitle ကို ထုတ်နိုင်ပါတယ်။</p>
<div class="srt-label">&#127916; မူရင်း SRT <span class="edit-hint">&#9999; ပြင်ဆင်လို့ရသည်</span></div>
<button class="btn btn-secondary btn-sm" style="margin-top:8px;" id="genSrtBtn" onclick="generateSrt()">&#128260; Generate SRT</button>
<textarea class="srt-editable" id="srtOriginal" placeholder="(Generate Voice လုပ်ပြီးမှ Generate SRT ကို နှိပ်ပါ)"></textarea>
<div class="btn-row">
<button class="btn btn-green btn-sm" onclick="copySrt('srtOriginal')">&#128203; Copy</button>
<button class="btn btn-secondary btn-sm" onclick="downloadSrt('srtOriginal','original.srt')">&#128190; Save .srt</button>
</div>
<hr class="divider">
<div class="dir-row">
<button class="btn btn-primary btn-sm" id="translateBtn" onclick="translateSrt()">ဘာသာပြန်ရန်</button>
<div class="dir-chip dir-chip-shop selected" data-dir="MY_TO_CN" onclick="selectDir(this)">&#127479;&#127482;&#8594;&#127464;&#127475; မြန်မာ &#8594; တရုတ်</div>
<div class="dir-chip dir-chip-shop" data-dir="CN_TO_MY" onclick="selectDir(this)">&#127464;&#127475;&#8594;&#127479;&#127482; တရုတ် &#8594; မြန်မာ</div>
</div>
<div class="loading" id="loadingTranslate">&#9203; ဘာသာပြန်နေပါသည်...</div>
<div class="srt-label">&#9989; ဘာသာပြန်ထားသော SRT</div>
<div class="srt-readonly" id="srtTranslated">("ဘာသာပြန်ရန်" နှိပ်ပါက ပေါ်ပါမည်)</div>
<div class="btn-row">
<button class="btn btn-green btn-sm" onclick="copyTranslated()">&#128203; Copy</button>
<button class="btn btn-secondary btn-sm" onclick="downloadTranslated()">&#128190; Save .srt</button>
</div>
<div class="pro-lock-note" id="proLockNote"></div>
</div>
</div>
</div>`;

const STEP5_HTML = `
<div class="aics-step" data-step="5">
<div class="card">
<div class="card-title">&#127916; Video / Result — Visual &amp; နောက်ဆုံးထွက်ကုန်</div>
<p class="hint">Type ရွေးပြီး Product Info ထည့်ပါ — Product/Character/Scene အလိုက် ခွဲထားသော Video Prompt များ ဖန်တီးပေးပါမယ်။</p>
<div class="type-chips" id="videoTypes"></div>
<div class="form-group">
<label>ကုန်ပစ္စည်း/ဝန်ဆောင်မှု အချက်အလက်</label>
<textarea id="videoIdea" placeholder="ဥပမာ - မီးဖို သုံးလုံးအစုံ, Non-stick coating, size 3 မျိုး"></textarea>
</div>
<div class="form-group">
<label>&#128444; Reference ပုံများ ပူးတွဲရန် (ချန်ထားလို့ရသည် — အများဆုံး ၅ ပုံ)</label>
<input type="file" id="refImgVideo" accept="image/*" multiple>
<div class="ref-preview" id="refPreviewVideo"></div>
</div>
<div class="loading" id="loadingVideo">&#9203; Video Plan ဖန်တီးနေပါသည်...</div>
</div>
<div id="videoResultWrap" style="display:none;">
<div class="card">
<div class="video-section">
<div class="video-section-title"><span class="section-badge">01</span> &#128230; PRODUCT REFERENCE</div>
<div id="productArea"><div class="empty-note">Generate နှိပ်ပြီးရင် ဒီနေရာမှာ ပေါ်ပါမယ်</div></div>
</div>
<div class="video-section">
<div class="video-section-title"><span class="section-badge">02</span> &#128100; CHARACTER REFERENCE</div>
<div id="characterArea"><div class="empty-note">Generate နှိပ်ပြီးရင် Character ရှိလျှင် ပေါ်ပါမယ်</div></div>
</div>
<div class="video-section">
<div class="video-section-title"><span class="section-badge">03</span> &#127757;&#127916; SCENE PROMPT (Environment &amp; Video)</div>
<div id="sceneArea"><div class="empty-note">Generate နှိပ်ပြီးရင် Scene တစ်ခုချင်းစီ ပေါ်ပါမယ်</div></div>
</div>
<div class="btn-row" style="margin-top:20px;">
<button class="btn btn-green" onclick="copyAllVideo()">&#128203; All Copy</button>
<button class="btn btn-purple" onclick="saveAllVideo()">&#128190; Save All to Creations</button>
</div>
</div>
</div>
</div>
</div>`;

const STEPS_HTML = STEP1_HTML + STEP2_HTML + STEP3_HTML + STEP4_HTML + STEP5_HTML;

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
.card.locked{opacity:.45;pointer-events:none}
.card-title{font-size:15px;font-weight:600;color:var(--cyan);margin-bottom:14px;display:flex;align-items:center;gap:8px}
.pro-tag{background:rgba(123,92,255,.2);color:var(--purple);font-size:11px;padding:2px 8px;border-radius:6px;font-weight:600}
label{display:block;font-size:12.5px;color:var(--text2);margin-bottom:6px;font-weight:500}
input,textarea,select{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:14px;padding:11px 14px;color:var(--text);font-size:14px;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
input:focus,textarea:focus,select:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 2px rgba(0,229,255,.1)}
textarea{resize:vertical;min-height:80px}
select{cursor:pointer}
select option{background:var(--bg-card);color:var(--text)}
input[type="file"]{padding:10px;cursor:pointer;font-size:13px}
.form-group{margin-bottom:14px}
.type-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.type-chip{padding:8px 14px;background:var(--bg-input);border:2px solid var(--border);border-radius:20px;cursor:pointer;font-size:12.5px;transition:all .2s;color:var(--text2);user-select:none}
.type-chip:hover{border-color:var(--cyan)}
.type-chip.active{border-color:var(--cyan);background:rgba(0,229,255,.1);color:var(--text)}
.type-chip.pro{opacity:.7}
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
.btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.hint{font-size:12.5px;color:var(--text2);margin-bottom:14px;line-height:1.5}
.loading{display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);align-items:center;gap:12px;color:#00e5ff;font-size:15px;font-weight:600;padding:16px 28px;border-radius:16px;background:rgba(8,12,24,.95);border:1px solid rgba(0,229,255,.4);box-shadow:0 8px 40px rgba(0,229,255,.3);z-index:99999;backdrop-filter:blur(12px);white-space:nowrap}
.loading.show{display:flex}
.result-box{background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:14px;margin-top:12px;white-space:pre-wrap;line-height:1.6;font-size:13.5px;min-height:40px}
.ref-preview{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}
.ref-thumb{position:relative;width:72px;height:72px}
.ref-thumb img{width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--border);display:block}
.ref-thumb .remove-x{position:absolute;top:-7px;right:-7px;width:22px;height:22px;border-radius:50%;background:var(--error);color:#fff;border:none;font-size:12px;line-height:22px;text-align:center;cursor:pointer;padding:0}
.chat-section{margin-top:20px;border-top:1px solid var(--border);padding-top:16px;display:none}
.chat-log{max-height:240px;overflow-y:auto;background:var(--bg-input);border-radius:10px;padding:12px;margin-bottom:10px}
.chat-bubble{padding:8px 12px;border-radius:10px;margin-bottom:8px;max-width:85%;line-height:1.4;font-size:13px}
.chat-user{background:rgba(0,229,255,.1);margin-left:auto;text-align:right}
.chat-ai{background:var(--bg-card2);margin-right:auto;color:var(--success)}
.chat-input-row{display:flex;gap:8px}
.chat-input-row input{flex:1}
.srt-editable{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:14px;color:var(--text);font-family:'Courier New',monospace;font-size:12.5px;line-height:1.6;resize:vertical;min-height:120px;margin-top:8px;box-sizing:border-box}
.srt-editable:focus{outline:none;border-color:var(--cyan)}
.srt-readonly{background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:14px;margin-top:8px;white-space:pre-wrap;font-family:'Courier New',monospace;font-size:12.5px;line-height:1.6;min-height:60px}
.srt-label{font-size:13px;font-weight:600;color:var(--cyan);margin-top:16px;display:flex;align-items:center;gap:8px}
.edit-hint{font-size:10.5px;color:var(--text2);background:var(--bg-card2);padding:2px 8px;border-radius:6px;font-weight:normal}
.dir-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px}
.dir-chip{background:var(--bg-input);border:2px solid var(--border);border-radius:20px;padding:8px 16px;cursor:pointer;font-size:12.5px;transition:all .2s;color:var(--text2);user-select:none}
.dir-chip:hover{border-color:var(--cyan)}
.dir-chip.selected{border-color:var(--cyan);background:rgba(0,229,255,.1);color:var(--text)}
.dir-chip.locked{opacity:.4;pointer-events:none}
.divider{border:none;border-top:1px solid var(--border);margin:18px 0}
.video-section{margin-top:24px}
.video-section-title{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:700;color:var(--text);margin-bottom:12px}
.section-badge{background:var(--error);color:#fff;font-weight:bold;padding:3px 11px;border-radius:6px;font-size:13px}
.scene-group{margin-bottom:20px}
.scene-group-title{color:var(--cyan);font-weight:bold;font-size:15px;padding-bottom:6px;margin-bottom:10px;border-bottom:1px solid var(--border)}
.detail-card{background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:12px}
.detail-card .card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.detail-card .card-head span{font-weight:bold;color:var(--cyan);font-size:14px}
.detail-card .card-sub{color:var(--text2);font-size:12.5px;margin-bottom:6px}
.detail-card .card-lbl{color:var(--text2);font-size:12.5px;margin-top:8px;margin-bottom:4px}
.detail-card .card-txt{white-space:pre-wrap;line-height:1.5;background:var(--bg-card);padding:10px 12px;border-radius:8px;font-size:13px}
.empty-note{color:var(--text3);font-size:13px;padding:14px;background:var(--bg-input);border:1px dashed var(--border);border-radius:10px}
audio{width:100%;margin-top:10px}
.pro-lock-note{color:var(--warn);font-size:12.5px;margin-top:12px}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg-card2);border:1px solid var(--border-strong);color:var(--text);padding:12px 24px;border-radius:10px;font-size:13.5px;z-index:1000;display:none;box-shadow:0 4px 20px rgba(0,0,0,.4)}
.toast.show{display:block}
.toast.error{border-color:var(--error);color:var(--error)}
.toast.success{border-color:var(--success);color:var(--success)}
.pv-pre{white-space:pre-wrap;line-height:1.6;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:12.5px;color:var(--text2);max-height:420px;overflow-y:auto}
@media(max-width:768px){.sidebar{display:none}.sidebar.open{display:block;position:fixed;left:0;top:57px;bottom:0;z-index:99;width:240px}.menu-btn{display:block}.main{padding:16px}.header-right .user-email{display:none}}
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
var selectedDir='MY_TO_CN';
var translatedSrt='';
var videoResult={scenes:[],characters:[],product:null};
var videoIdeaText='';

var CONTENT_FIELDS=[
  {label:'ကုန်ပစ္စည်း/ဝန်ဆောင်မှု အချက်အလက်',placeholder:'ဥပမာ - မီးဖို သုံးလုံးအစုံ, Non-stick coating, size 3 မျိုး',required:true,multiline:true},
  {label:'ကုန်ပစ္စည်း အမျိုးအစား',placeholder:'ဥပမာ - အိမ်သုံးပစ္စည်း / အလှကုန် / အဝတ်အစား'},
  {label:'ဘယ်သူတွေအတွက်လဲ (Target Customer)',placeholder:'ဥပမာ - မိသားစုသုံး / အမျိုးသမီးများ'},
  {label:'Platform',placeholder:'ဥပမာ - Facebook / TikTok / Shop Page'},
  {label:'အထူး Promotion ရှိလား',placeholder:'ဥပမာ - လျှော့စျေး ၂၀% / Free Delivery / မရှိပါ'}
];

function api(path,opts){
  opts=opts||{};
  var s=document.getElementById('aiModelSel');
  if(s&&s.value&&opts.body)opts.body.model=s.value;
  var headers=opts.headers||{};
  headers['Content-Type']='application/json';
  if(TOKEN)headers['Authorization']='Bearer '+TOKEN;
  return fetch(path,{method:opts.method||'GET',headers:headers,body:opts.body?JSON.stringify(opts.body):undefined}).then(function(r){return r.json();});
}
function showToast(msg,type){var t=document.getElementById('toast');t.textContent=msg;t.className='toast show'+(type?' '+type:'');setTimeout(function(){t.className='toast';},2500);}
function base64ToBlob(b64,mime){var bin=atob(b64);var arr=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);return new Blob([arr],{type:mime});}

// Init
(function init(){
  if(!TOKEN){
    document.getElementById('loginView').style.display='flex';
    document.getElementById('aicsApp').style.display='none';
    return;
  }
  var _ve=document.getElementById('userEmail');if(_ve)_ve.textContent=localStorage.getItem('aics_email')||'—';
  var _vp=document.getElementById('planBadge');if(_vp)_vp.textContent=localStorage.getItem('aics_plan')||'FREE';
  api('/api/users/me').then(function(d){
    if(d.error){localStorage.removeItem('aics_token');location.reload();return;}
    var _ve2=document.getElementById('userEmail');if(_ve2)_ve2.textContent=d.email||'';
    var _vp2=document.getElementById('planBadge');if(_vp2)_vp2.textContent=d.plan||'FREE';
    var al=document.getElementById('adminLink');
    if(al)al.style.display=d.is_admin?'flex':'none';
    USER_PLAN=d.plan||'FREE';
    if(USER_PLAN!=='PRO'){
      document.getElementById('srtCard').classList.add('locked');
      document.getElementById('genSrtBtn').disabled=true;
      document.getElementById('translateBtn').disabled=true;
      document.querySelectorAll('.dir-chip-shop').forEach(function(c){c.classList.add('locked');});
      document.getElementById('proLockNote').textContent='🔒 ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်';
    }
  });
})();

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
      c.querySelectorAll('.type-chip').forEach(function(x){x.classList.remove('active');});
      d.classList.add('active');
      if(varName==='content')contentType=t.val;else videoType=t.val;
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

buildTypes('videoTypes',[
  {val:'1',label:'🎬 Product Video (Free)'},
  {val:'2',label:'🎬 Scene Planning (Pro)'},
  {val:'3',label:'🎬 Product Showcase (Pro)'},
  {val:'4',label:'🎬 Customer Targeting (Pro)'},
  {val:'5',label:'🎬 Video Type 5 (Pro)'}
],'video');

(function(){
  var c=document.getElementById('contentFields');
  CONTENT_FIELDS.forEach(function(f,i){
    var grp=document.createElement('div');grp.className='form-group';
    var lbl=document.createElement('label');lbl.textContent=f.label+(f.required?' *':'');
    var inp=f.multiline?document.createElement('textarea'):document.createElement('input');
    inp.id='cf'+i;inp.placeholder=f.placeholder;
    grp.appendChild(lbl);grp.appendChild(inp);c.appendChild(grp);
  });
})();

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
setupRefUpload('refImgContent','refPreviewContent',refImagesContent);
setupRefUpload('refImgVideo','refPreviewVideo',refImagesVideo);

// ===== Content Maker =====
function generateContent(){
  var idea=collectContentIdea();
  if(!idea){showToast('အနည်းဆုံး Product Info ကို ထည့်ပါ','error');return;}
  if(contentType!=='1'&&USER_PLAN!=='PRO'){showToast('ဒီ Type ကို Pro User သာ သုံးနိုင်ပါတယ်','error');return;}
  var btn=document.getElementById('genContentBtn');btn.disabled=true;
  document.getElementById('loadingContent').classList.add('show');
  api('/api/studio/shop/content/generate',{method:'POST',body:{idea:idea,type:contentType,images:refImagesContent}})
  .then(function(d){
    document.getElementById('loadingContent').classList.remove('show');btn.disabled=false;
    if(d.error){showToast(d.error+': '+(d.detail||''),'error');return;}
    var text=d.content||'';
    if(d.speakingStyle)text+='\\n\\n[SPEAKING STYLE]\\n'+d.speakingStyle;
    if(d.voiceStyle)text+='\\n\\n[VOICE STYLE]\\n'+d.voiceStyle;
    document.getElementById('resultContent').value=text;
    document.getElementById('ttsText').value=d.content||'';
    studioMarkDone(1);
    studioMarkDone(2);
    showToast('✓ Content ဖန်တီးပြီးပါပြီ','success');
    studioGoStep(3);
  }).catch(function(e){document.getElementById('loadingContent').classList.remove('show');btn.disabled=false;showToast('Network error','error');});
}
function copyResult(){var t=document.getElementById('resultContent').value;if(!t){showToast('Copy လုပ်ဖို့ မရှိပါ','error');return;}navigator.clipboard.writeText(t);showToast('✓ Copy ပြီးပါပြီ','success');}
function saveContent(){var t=document.getElementById('resultContent').value;if(!t){showToast('Save လုပ်ဖို့ မရှိပါ','error');return;}var title=prompt('Creation အမည်:',t.substring(0,40));if(title===null)return;AICS_CREATIONS.save({studio:'SHOPCONTENT',type:contentType,title:title||'Shop Content',original_prompt:collectContentIdea(),ai_output:t}).then(function(){showToast('💾 Save ပြီးပါပြီ','success');}).catch(function(){showToast('Browser Storage မအောင်မြင်','error');});}
function toggleChat(){var s=document.getElementById('chatSection');s.style.display=s.style.display==='block'?'none':'block';}
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
    if(d.error){showToast(d.error+': '+(d.detail||''),'error');return;}
    var text=d.content||'';
    if(d.speakingStyle)text+='\\n\\n[SPEAKING STYLE]\\n'+d.speakingStyle;
    if(d.voiceStyle)text+='\\n\\n[VOICE STYLE]\\n'+d.voiceStyle;
    document.getElementById('resultContent').value=text;
    document.getElementById('ttsText').value=d.content||'';
    log.innerHTML+='<div class="chat-bubble chat-ai">✓ ပြင်ဆင်ပြီးပါပြီ</div>';
    log.scrollTop=log.scrollHeight;
  }).catch(function(){document.getElementById('loadingChat').classList.remove('show');showToast('Network error','error');});
}

// ===== TTS =====
function generateVoice(){
  var text=document.getElementById('ttsText').value;
  if(!text||!text.trim()){showToast('Text ကို ထည့်ပါ','error');return;}
  var voice=document.getElementById('voiceSelect').value;
  var btn=document.getElementById('genVoiceBtn');btn.disabled=true;
  document.getElementById('loadingVoice').classList.add('show');
  document.getElementById('audioContainer').innerHTML='';
  api('/api/studio/voice/tts',{method:'POST',body:{text:text,voiceName:voice}})
  .then(function(d){
    document.getElementById('loadingVoice').classList.remove('show');btn.disabled=false;
    if(d.error){showToast(d.error+': '+(d.detail||''),'error');return;}
    lastAudioBase64=d.data;
    var blob=base64ToBlob(d.data,d.mimeType||'audio/wav');
    var url=URL.createObjectURL(blob);
    document.getElementById('audioContainer').innerHTML='<audio controls src="'+url+'"></audio><div class="btn-row"><a href="'+url+'" download="shop_voice.wav"><button class="btn btn-secondary btn-sm">💾 Save Audio</button></a></div>';
    studioMarkDone(4);
    showToast('✓ Voice ဖန်တီးပြီးပါပြီ','success');
  }).catch(function(){document.getElementById('loadingVoice').classList.remove('show');btn.disabled=false;showToast('Network error','error');});
}
function copyTts(){var t=document.getElementById('ttsText').value;if(!t){showToast('မရှိပါ','error');return;}navigator.clipboard.writeText(t);showToast('✓ Copy ပြီးပါပြီ','success');}

// ===== SRT & Translation =====
function generateSrt(){
  if(USER_PLAN!=='PRO'){showToast('Pro Feature ပါ','error');return;}
  if(!lastAudioBase64){showToast('Audio မရှိသေးပါ။ Generate Voice ကို အရင်နှိပ်ပါ','error');return;}
  var btn=document.getElementById('genSrtBtn');btn.disabled=true;
  document.getElementById('srtOriginal').value='⏳ SRT ဖန်တီးနေပါသည်...';
  api('/api/studio/voice/srt',{method:'POST',body:{audioBase64:lastAudioBase64,mimeType:'audio/wav',type:'2'}})
  .then(function(d){btn.disabled=false;if(d.error){document.getElementById('srtOriginal').value='';showToast(d.error,'error');return;}document.getElementById('srtOriginal').value=d.srt||'';showToast('✓ SRT ပြီးပါပြီ','success');})
  .catch(function(){btn.disabled=false;document.getElementById('srtOriginal').value='';showToast('Network error','error');});
}
function selectDir(el){if(USER_PLAN!=='PRO')return;document.querySelectorAll('.dir-chip-shop').forEach(function(c){c.classList.remove('selected');});el.classList.add('selected');selectedDir=el.getAttribute('data-dir');}
function translateSrt(){
  if(USER_PLAN!=='PRO'){showToast('Pro Feature ပါ','error');return;}
  var srt=document.getElementById('srtOriginal').value;
  if(!srt){showToast('မူရင်း SRT မရှိပါ','error');return;}
  var btn=document.getElementById('translateBtn');btn.disabled=true;
  document.getElementById('loadingTranslate').classList.add('show');
  document.getElementById('srtTranslated').textContent='';
  api('/api/studio/voice/translate-srt',{method:'POST',body:{srtText:srt,direction:selectedDir,type:'2'}})
  .then(function(d){document.getElementById('loadingTranslate').classList.remove('show');btn.disabled=false;if(d.error){showToast(d.error,'error');return;}translatedSrt=d.srt||'';document.getElementById('srtTranslated').textContent=translatedSrt;showToast('✓ ဘာသာပြန်ပြီးပါပြီ','success');})
  .catch(function(){document.getElementById('loadingTranslate').classList.remove('show');btn.disabled=false;showToast('Network error','error');});
}
function copySrt(id){var t=document.getElementById(id).value;if(!t){showToast('မရှိပါ','error');return;}navigator.clipboard.writeText(t);showToast('✓ Copy ပြီးပါပြီ','success');}
function downloadSrt(id,fn){var t=document.getElementById(id).value;if(!t){showToast('မရှိပါ','error');return;}var blob=new Blob([t],{type:'application/octet-stream'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download=fn;a.click();URL.revokeObjectURL(url);}
function copyTranslated(){if(!translatedSrt){showToast('မရှိပါ','error');return;}navigator.clipboard.writeText(translatedSrt);showToast('✓ Copy ပြီးပါပြီ','success');}
function downloadTranslated(){if(!translatedSrt){showToast('မရှိပါ','error');return;}var blob=new Blob([translatedSrt],{type:'application/octet-stream'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='translated.srt';a.click();URL.revokeObjectURL(url);}

// ===== Video Maker =====
function generateVideo(){
  var idea=document.getElementById('videoIdea').value;
  if(!idea||!idea.trim()){showToast('Product Info ကို ထည့်ပါ','error');return;}
  if(videoType!=='1'&&USER_PLAN!=='PRO'){showToast('ဒီ Type ကို Pro User သာ သုံးနိုင်ပါတယ်','error');return;}
  videoIdeaText=idea;
  var btn=document.getElementById('genVideoBtn');btn.disabled=true;
  document.getElementById('loadingVideo').classList.add('show');
  api('/api/studio/shop/video/generate',{method:'POST',body:{idea:idea,type:videoType,images:refImagesVideo}})
  .then(function(d){
    document.getElementById('loadingVideo').classList.remove('show');btn.disabled=false;
    if(d.error){showToast(d.error+': '+(d.detail||''),'error');return;}
    videoResult={scenes:d.scenes||[],characters:d.characters||[],product:d.product||null};
    renderVideoResult();
    document.getElementById('videoResultWrap').style.display='block';
    studioMarkDone(5);
    showToast('✓ Video Plan ပြီးပါပြီ','success');
  }).catch(function(){document.getElementById('loadingVideo').classList.remove('show');btn.disabled=false;showToast('Network error','error');});
}

function renderVideoResult(){
  var pa=document.getElementById('productArea');
  if(videoResult.product){
    pa.innerHTML='<div class="detail-card"><div class="card-head"><span>'+escapeHtml(videoResult.product.name||'Product')+'</span></div>'+
      '<div class="card-lbl">Product Prompt</div><div class="card-txt">'+escapeHtml(videoResult.product.prompt||'-')+'</div>'+
      '<button class="btn btn-orange btn-sm" style="margin-top:10px;" onclick="genImage(this,\\''+escapeJs(videoResult.product.prompt||'')+'\\',\\'product\\')">🖼️ Generate Image</button>'+
      '<div class="image-area"></div></div>';
  } else { pa.innerHTML='<div class="empty-note">Product Prompt မရှိပါ</div>'; }
  var ca=document.getElementById('characterArea');
  if(videoResult.characters.length>0){
    ca.innerHTML=videoResult.characters.map(function(ch,i){
      return '<div class="detail-card"><div class="card-head"><span>'+escapeHtml(ch.name||'Character '+(i+1))+'</span></div>'+
        '<div class="card-sub">'+escapeHtml(ch.role||'')+'</div>'+
        '<div class="card-lbl">Character Prompt</div><div class="card-txt">'+escapeHtml(ch.prompt||'-')+'</div>'+
        '<button class="btn btn-orange btn-sm" style="margin-top:10px;" onclick="genImage(this,\\''+escapeJs(ch.prompt||'')+'\\',\\'char'+i+'\\')">🖼️ Generate Image</button>'+
        '<div class="image-area"></div></div>';
    }).join('');
  } else { ca.innerHTML='<div class="empty-note">Character မရှိပါ</div>'; }
  var sa=document.getElementById('sceneArea');
  if(videoResult.scenes.length>0){
    sa.innerHTML=videoResult.scenes.map(function(sc,i){
      return '<div class="scene-group"><div class="scene-group-title">Scene '+escapeHtml(sc.number||i+1)+'</div>'+
        '<div class="detail-card"><div class="card-lbl">🌍 Environment Prompt</div><div class="card-txt">'+escapeHtml(sc.environmentPrompt||'-')+'</div>'+
        '<button class="btn btn-orange btn-sm" style="margin-top:10px;" onclick="genImage(this,\\''+escapeJs(sc.environmentPrompt||'')+'\\',\\'env'+i+'\\')">🖼️ Generate Env Image</button>'+
        '<div class="image-area"></div></div>'+
        '<div class="detail-card"><div class="card-lbl">🎬 Video Prompt</div><div class="card-txt">'+escapeHtml(sc.videoPrompt||'-')+'</div>'+
        '<button class="btn btn-orange btn-sm" style="margin-top:10px;" onclick="genImage(this,\\''+escapeJs(sc.videoPrompt||'')+'\\',\\'vid'+i+'\\')">🖼️ Generate Video Image</button>'+
        '<div class="image-area"></div></div></div>';
    }).join('');
  } else { sa.innerHTML='<div class="empty-note">Scene မရှိပါ</div>'; }
}

function escapeJs(s){return String(s||'').replace(/\\\\/g,'\\\\\\\\').replace(/'/g,"\\\\'").replace(/\\n/g,'\\\\n');}
function escapeHtml(s){var d=document.createElement('div');d.textContent=(s==null?'':String(s));return d.innerHTML;}
function safeUrl(u){u=String(u||'').trim();return /^(https?:|data:image\\/|\\/)/.test(u)?u:'';}

function genImage(btn,prompt,key){
  if(!prompt){showToast('Prompt မရှိပါ','error');return;}
  btn.disabled=true;btn.textContent='⏳ ဖန်တီးနေသည်...';
  var area=btn.parentElement.querySelector('.image-area');
  api('/api/studio/shop/video-image',{method:'POST',body:{prompt:prompt}})
  .then(function(d){
    btn.disabled=false;btn.textContent='🖼️ Generate Image';
    if(d.error){showToast(d.error+': '+(d.detail||''),'error');return;}
    area.innerHTML='<img src="data:'+(d.mimeType||'image/png')+';base64,'+d.data+'" style="width:100%;border-radius:8px;margin-top:10px;">'+
      '<div class="btn-row"><a href="data:'+(d.mimeType||'image/png')+';base64,'+d.data+'" download="shop_image.png"><button class="btn btn-secondary btn-sm">💾 Save Image</button></a></div>';
  }).catch(function(){btn.disabled=false;btn.textContent='🖼️ Generate Image';showToast('Network error','error');});
}

function buildCombinedVideo(){
  var t='';
  if(videoResult.product){t+='=== PRODUCT ===\\n'+(videoResult.product.name||'')+'\\n'+(videoResult.product.prompt||'')+'\\n\\n';}
  videoResult.characters.forEach(function(ch,i){t+='=== CHARACTER '+(i+1)+' ===\\n'+(ch.name||'')+' ('+(ch.role||'')+')\\n'+(ch.prompt||'')+'\\n\\n';});
  videoResult.scenes.forEach(function(sc,i){t+='=== SCENE '+(sc.number||i+1)+' ===\\nENV: '+(sc.environmentPrompt||'')+'\\nVIDEO: '+(sc.videoPrompt||'')+'\\n\\n';});
  return t;
}
function copyAllVideo(){
  if(videoResult.scenes.length===0&&videoResult.characters.length===0&&!videoResult.product){showToast('Result မရှိပါ','error');return;}
  navigator.clipboard.writeText(buildCombinedVideo());showToast('✓ Copy ပြီးပါပြီ','success');
}
function saveAllVideo(){
  if(videoResult.scenes.length===0&&videoResult.characters.length===0&&!videoResult.product){showToast('Result မရှိပါ','error');return;}
  var title=prompt('Creation အမည်:',videoIdeaText.substring(0,40));if(title===null)return;
  AICS_CREATIONS.save({studio:'SHOPVIDEO',type:videoType,title:title||'Shop Video',original_prompt:videoIdeaText,ai_output:buildCombinedVideo()})
  .then(function(){showToast('💾 Save ပြီးပါပြီ','success');}).catch(function(){showToast('Browser Storage မအောင်မြင်','error');});
}

// ===== Preview renderers =====
function renderContentPreview(){
  var text=document.getElementById('resultContent').value;
  if(!text||!text.trim()){studioPreview('');return;}
  studioPreview('<div class="aics-pv-label">&#128221; Marketing Content</div><div class="pv-pre">'+escapeHtml(text)+'</div>');
}
function renderVoicePreview(){
  if(lastAudioBase64){
    var blob=base64ToBlob(lastAudioBase64,'audio/wav');
    var url=URL.createObjectURL(blob);
    studioPreview('<div class="aics-pv-label">&#127911; Generated Audio</div><audio controls src="'+url+'" style="width:100%;"></audio>');
  }else{
    renderContentPreview();
  }
}
function renderVideoPreview(){
  if(!videoResult.product&&videoResult.scenes.length===0&&videoResult.characters.length===0){studioPreview('');return;}
  studioPreview('<div class="aics-pv-label">&#127916; Video Plan</div><div class="pv-pre">'+escapeHtml(buildCombinedVideo())+'</div>');
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
    studioSetActions([bBack(),bReset(),bSave(),{label:'Generate Content &#10022;',cls:'primary',fn:generateContent}]);
    renderContentPreview();
  }else if(n===3){
    studioSetActions([bBack(),bReset(),bSave(),{label:'&#128203; Copy',cls:'ghost',fn:copyResult},{label:'&#128190; Save to Creations',cls:'purple',fn:saveContent},{label:'Next &#8594;',cls:'primary',fn:function(){studioGoStep(4);}}]);
    renderContentPreview();
  }else if(n===4){
    studioSetActions([bBack(),bReset(),bSave(),{label:'Generate Voice &#10022;',cls:'primary',fn:generateVoice}]);
    renderVoicePreview();
  }else if(n===5){
    studioSetActions([bBack(),bReset(),bSave(),{label:'Generate Video Plan &#10022;',cls:'primary',fn:generateVideo}]);
    renderVideoPreview();
  }
}
window.studioOnStep=studioOnStep;

function studioCollectDraft(){
  var fields={};
  for(var i=0;i<5;i++){
    var el=document.getElementById('cf'+i);
    if(el)fields[i]=el.value;
  }
  return{
    fields:fields,
    contentType:contentType,
    videoType:videoType,
    aud:(document.getElementById('audSel')?document.getElementById('audSel').value:''),
    resultContent:document.getElementById('resultContent').value,
    ttsText:document.getElementById('ttsText').value,
    voiceName:document.getElementById('voiceSelect').value,
    srtOriginal:document.getElementById('srtOriginal').value,
    translatedSrt:translatedSrt,
    videoIdea:document.getElementById('videoIdea').value,
    videoIdeaText:videoIdeaText,
    videoResult:videoResult,
    refCountContent:refImagesContent.length,
    refCountVideo:refImagesVideo.length
  };
}
window.studioCollectDraft=studioCollectDraft;

function studioRestoreDraft(d){
  if(!d)return;
  if(d.fields){
    for(var k in d.fields){
      var el=document.getElementById('cf'+k);
      if(el)el.value=d.fields[k];
    }
  }
  if(d.contentType){contentType=d.contentType;var cts=document.getElementById('contentTypeSel');if(cts)cts.value=String(d.contentType);}
  var audEl=document.getElementById('audSel');if(audEl&&d.aud)audEl.value=d.aud;if(audEl)window.aichAud=audEl.value;
  if(d.videoType){videoType=d.videoType;setTypeChip('videoTypes',d.videoType);}
  if(d.resultContent)document.getElementById('resultContent').value=d.resultContent;
  if(d.ttsText)document.getElementById('ttsText').value=d.ttsText;
  if(d.voiceName){
    var sel=document.getElementById('voiceSelect');
    for(var i=0;i<sel.options.length;i++){
      if(sel.options[i].value===d.voiceName){sel.selectedIndex=i;break;}
    }
  }
  if(d.srtOriginal)document.getElementById('srtOriginal').value=d.srtOriginal;
  if(d.translatedSrt){translatedSrt=d.translatedSrt;document.getElementById('srtTranslated').textContent=d.translatedSrt;}
  if(d.videoIdea)document.getElementById('videoIdea').value=d.videoIdea;
  if(d.videoIdeaText)videoIdeaText=d.videoIdeaText;
  if(d.videoResult){
    videoResult=d.videoResult;
    if(videoResult.product||(videoResult.scenes&&videoResult.scenes.length)||(videoResult.characters&&videoResult.characters.length)){
      document.getElementById('videoResultWrap').style.display='block';
      renderVideoResult();
      studioMarkDone(5);
    }
  }
  if(d.resultContent)studioMarkDone(2);
  if(d.ttsText)studioMarkDone(1);
}
window.studioRestoreDraft=studioRestoreDraft;
</script>
</body>
</html>`;
