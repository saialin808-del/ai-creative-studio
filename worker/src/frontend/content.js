// AI Creative Studio — Content Studio Frontend (Phase 3 + Master Instruction Phase 6)
// Workflow: Create/Topic → Content → Edit → Voice/Format → Video Plan → Result
// Studio Isolation: ဤ File သည် Content Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Shared: renderSidebar / sidebarScript / renderStudioShell (frontend/shared.js)
// ⚠️ API Contract / Business Logic မပြောင်းပါ — UI အခွံသာ ပြောင်းပါသည်။

import { renderSidebar, sidebarScript, renderStudioShell } from './shared.js';

const STEPS = [
  { label: 'ဖန်တီးရန်' },
  { label: 'အကြောင်းအရာ', req: [1] },
  { label: 'ပြင်ဆင်ရန်', req: [2] },
  { label: 'အသံ/ပုံစံ', req: [2] },
  { label: 'ဗီဒီယာ', req: [1] },
  { label: 'အပြီးသတ်', req: [2] },
];

const STEP1_HTML = `
<div class="aics-step" data-step="1">
<div class="card">
<div class="card-title">&#9997; Create Content</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">သင့် အကြံ / အကြောင်းအရာကို ထည့်ပြီး Generate နှိပ်ပါ — AI က Content + Speaking Style + Voice Style သုံးမျိုး ရေးပေးပါမယ်။</p>
<div class="form-group">
<label>သင့် အကြံ / အကြောင်းအရာ (User Idea) *</label>
<textarea id="ideaInput" placeholder="ဥပမာ — ကော်ဖီဆိုင်တစ်ဆင်အတွက် social media content ရေးပါ..." style="min-height:130px;"></textarea>
</div>
<div class="form-group" style="margin-bottom:16px;">
<label>ဘယ်သူအတွက်</label>
<select id="audSel"><option>လူတိုင်း</option><option>လူငယ်</option><option>လူကြီး</option><option>ကလေး</option></select>
</div>
<div class="adv-grid" style="margin-top:16px;">
<div class="form-group">
<label>အမျိုးအစား (Type 1-5)</label>
<select id="typeSelect">
<option value="1">Type 1 — Basic (FREE)</option>
<option value="2">Type 2 — Standard (PRO)</option>
<option value="3">Type 3 — Advanced (PRO)</option>
<option value="4">Type 4 — Premium (PRO)</option>
<option value="5">Type 5 — Ultimate (PRO)</option>
</select>
</div>
<div class="form-group">
<label>Gemini API Key (ရွေးစရာ — BYOK)</label>
<input type="password" id="byokInput" placeholder="ထည့်လိုပါက သင့် Key ကိုထည့်ပါ">
</div>
</div>
<div class="loading" id="genLoading"><div class="spinner"></div> AI က ရေးနေပါသည်...</div>
<div class="error-box" id="genError"></div>
</div>
</div>`;

const STEP2_HTML = `
<div class="aics-step" data-step="2">
<div class="card">
<div class="card-title">&#128221; Content (ရလဒ်)</div>
<div id="noResultHint" class="empty-note">Result မရှိသေးပါ — "Create" အဆင့်မှာ Generate နှိပ်ပါ</div>
<div class="result-grid" id="resultGrid" style="display:none;">
<div class="result-card">
<div class="result-card-header"><span class="result-card-label">ကွန်တင့် (Content)</span><button class="btn-ghost" onclick="copyText('contentOut')">&#128203; Copy</button></div>
<div class="result-card-body" id="contentOut"></div>
</div>
<div class="result-card">
<div class="result-card-header"><span class="result-card-label">ပြောဆိုပုံစံ (Speaking Style)</span><button class="btn-ghost" onclick="copyText('speakingOut')">&#128203; Copy</button></div>
<div class="result-card-body" id="speakingOut"></div>
</div>
<div class="result-card">
<div class="result-card-header"><span class="result-card-label">အသံပုံစံ (Voice Style)</span><button class="btn-ghost" onclick="copyText('voiceOut')">&#128203; Copy</button></div>
<div class="result-card-body" id="voiceOut"></div>
</div>
<div class="btn-row">
<button class="btn btn-purple" onclick="saveContentResult()">&#128190; Save to My Creations</button>
</div>
</div>
</div>
</div>`;

const STEP3_HTML = `
<div class="aics-step" data-step="3">
<div class="card">
<div class="card-title">&#128172; Edit — Quick Actions</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:12px;">လိုချင်တဲ့ ပြင်ဆင်မှုကို တစ်ချက်နှိပ်ရုံဖြင့် AI က ပြင်ပေးပါမယ် — သို့မဟုတ် အောက်မှာ ကိုယ်တိုင် ညွှန်ကြားချက် ရေးနိုင်ပါတယ်။</p>
<div class="type-chips" id="quickActions"></div>
<div class="revise-section" style="border-top:none;padding-top:0;">
<div class="revise-history" id="reviseHistory"></div>
<div class="revise-input-row">
<textarea id="feedbackInput" placeholder="ဘယ်လိုပြင်စေချင်လဲ? ဥပမာ — ပိုပြီး ရယ်စရာဖြစ်အောင်လုပ်ပါ..."></textarea>
<button class="btn btn-secondary" id="reviseBtn" onclick="reviseContent()">&#128260; ပြင်ပါ</button>
</div>
<div class="loading" id="revLoading"><div class="spinner"></div> ပြင်ဆင်နေပါသည်...</div>
<div class="error-box" id="revError"></div>
</div>
</div>
</div>`;

const STEP4_HTML = `
<div class="aics-step" data-step="4">
<div class="card">
<div class="card-title">&#128266; Text → Voice</div>
<p class="voice-hint">Content Generate လုပ်ပြီးရင် အောက်က Box ထဲ အလိုအလျောက် ဖြည့်ပေးပါမယ်။ Generate Voice နှိပ်ရင် အသံပြောင်းပေးပါမယ်။</p>
<div class="form-group" style="margin-top:12px;">
<textarea id="ttsText" placeholder="Voice ပြောင်းလိုသော Text ကို ထည့်ပါ"></textarea>
</div>
<div class="form-group">
<label>အသံရွေးချယ်ရန် (Voice — ၃၀ မျိုး)</label>
<select id="voiceNameSelect">
<option value="Zephyr">Zephyr — တောက်ပ (Bright)</option>
<option value="Puck">Puck — တက်ကြွ (Upbeat)</option>
<option value="Charon">Charon — ရှင်းလင်းတိကျ (Informative)</option>
<option value="Kore" selected>Kore — ခိုင်မာတည်ငြိမ် (Firm)</option>
<option value="Fenrir">Fenrir — စိတ်လှုပ်ရှားလွယ် (Excitable)</option>
<option value="Leda">Leda — လူငယ်ဆန် (Youthful)</option>
<option value="Orus">Orus — ခိုင်မာ (Firm)</option>
<option value="Aoede">Aoede — ပေါ့ပါးလန်းဆန်း (Breezy)</option>
<option value="Callirrhoe">Callirrhoe — အေးဆေး (Easy-going)</option>
<option value="Autonoe">Autonoe — တောက်ပ (Bright)</option>
<option value="Enceladus">Enceladus — အသက်ရှူသံပါ (Breathy)</option>
<option value="Iapetus">Iapetus — ရှင်းလင်း (Clear)</option>
<option value="Umbriel">Umbriel — အေးဆေး (Easy-going)</option>
<option value="Algieba">Algieba — ချောမွေ့ (Smooth)</option>
<option value="Despina">Despina — ချောမွေ့ (Smooth)</option>
<option value="Erinome">Erinome — ရှင်းလင်း (Clear)</option>
<option value="Algenib">Algenib — ရိုင်းရင့် (Gravelly)</option>
<option value="Rasalgethi">Rasalgethi — ရှင်းလင်းတိကျ (Informative)</option>
<option value="Laomedeia">Laomedeia — တက်ကြွ (Upbeat)</option>
<option value="Achernar">Achernar — နူးညံ့ (Soft)</option>
<option value="Alnilam">Alnilam — ခိုင်မာ (Firm)</option>
<option value="Schedar">Schedar — တညီတညာ (Even)</option>
<option value="Gacrux">Gacrux — ရင့်ကျက် (Mature)</option>
<option value="Pulcherrima">Pulcherrima — တိုက်ရိုက် (Forward)</option>
<option value="Achird">Achird — ဖော်ရွေ (Friendly)</option>
<option value="Zubenelgenubi">Zubenelgenubi — ပေါ့ပေါ့ပါးပါး (Casual)</option>
<option value="Vindemiatrix">Vindemiatrix — နူးညံ့သိမ်မွေ့ (Gentle)</option>
<option value="Sadachbia">Sadachbia — တက်ကြွရှင်သန် (Lively)</option>
<option value="Sadaltager">Sadaltager — ဗဟုသုတရှိ (Knowledgeable)</option>
<option value="Sulafat">Sulafat — နွေးထွေး (Warm)</option>
</select>
</div>
<button class="btn btn-secondary" id="voiceBtn" onclick="generateVoice()">&#127908; Generate Voice</button>
<div class="loading" id="voiceLoading"><div class="spinner"></div> အသံဖန်တီးနေပါသည်...</div>
<div class="error-box" id="voiceError"></div>
<div class="audio-container" id="audioContainer"></div>
</div>
<div class="card">
<div class="card-title">&#127760; SRT &amp; ဘာသာပြန်</div>
<p class="voice-hint">Generate Voice နှိပ်ပြီးပြီးရင် SRT ကို အလိုအလျောက် ထုတ်နိုင်ပါတယ်။ Box ထဲမှာ တိုက်ရိုက် ပြင်ဆင်နိုင်ပါတယ်။</p>
<div class="btn-row" style="margin-top:12px;">
<button class="btn btn-secondary" id="srtBtn" onclick="generateSrt()">&#128221; Generate SRT (မူရင်း)</button>
</div>
<div class="loading" id="srtLoading"><div class="spinner"></div> SRT ထုတ်နေပါသည်...</div>
<div class="error-box" id="srtError"></div>
<textarea class="srt-box" id="resultSrt" placeholder="Generate Voice ပြီးရင် (သို့) ဒီခလုတ်ကို နှိပ်ရင် SRT ဒီနေရာမှာ ပေါ်ပါမယ်"></textarea>
<div class="btn-row">
<button class="btn-ghost" onclick="copyText('resultSrt')">&#128203; Copy SRT</button>
<button class="btn-ghost" onclick="downloadSrt('resultSrt','content_subtitle.srt')">&#128190; Save .srt</button>
</div>
<hr class="divider">
<p class="voice-hint">ဘာသာပြန်လိုသော ဘက်ကို ရွေးပြီး "ဘာသာပြန်ရန်" နှိပ်ပါ —</p>
<div class="direction-row">
<button class="btn btn-secondary" id="translateBtn" onclick="translateSrt()">&#127760; ဘာသာပြန်ရန်</button>
<div class="direction-chip selected" data-dir="my-to-cn" onclick="selectDirection(this)">&#127480;&#127415; &#8594; &#127464;&#127475; မြန်မာ &#8594; တရုတ်</div>
<div class="direction-chip" data-dir="cn-to-my" onclick="selectDirection(this)">&#127464;&#127475; &#8594; &#127480;&#127415; တရုတ် &#8594; မြန်မာ</div>
</div>
<div class="loading" id="translateLoading"><div class="spinner"></div> ဘာသာပြန်နေပါသည်...</div>
<div class="error-box" id="translateError"></div>
<div class="result-label" id="translatedLabel" style="display:none;">&#9989; ဘာသာပြန်ထားသော SRT</div>
<textarea class="srt-box" id="resultSrtTranslated" placeholder="('ဘာသာပြန်ရန်' ခလုတ်ကို နှိပ်ပါက ဒီနေရာတွင် ပေါ်ပါမည်)"></textarea>
<div class="btn-row">
<button class="btn-ghost" onclick="copyText('resultSrtTranslated')">&#128203; Copy SRT</button>
<button class="btn-ghost" onclick="downloadSrt('resultSrtTranslated','content_subtitle_translated.srt')">&#128190; Save .srt</button>
</div>
</div>
</div>`;

const STEP5_HTML = `
<div class="aics-step" data-step="5">
<div class="card">
<div class="card-title">&#127916; Video Plan (ဗီဒီယိုအစီအစဉ်)</div>
<div class="form-group">
<label>သင့် အကြံ / အကြောင်းအရာ (User Idea) *</label>
<textarea id="videoIdeaInput" placeholder="ဥပမာ — ကော်ဖီဆိုင်တစ်ဆင်အတွက် 30-second promo video အစီအစဉ်ရေးပါ..." style="min-height:110px;"></textarea>
</div>
<details class="aics-advanced">
<summary>&#9881; Advanced Settings</summary>
<div style="margin-top:12px;">
<div class="form-group">
<label>အမျိုးအစား (Type 1-5)</label>
<select id="videoTypeSelect">
<option value="1">Type 1 — Basic (FREE)</option>
<option value="2">Type 2 — Standard (PRO)</option>
<option value="3">Type 3 — Advanced (PRO)</option>
<option value="4">Type 4 — Premium (PRO)</option>
<option value="5">Type 5 — Ultimate (PRO)</option>
</select>
</div>
<div class="form-group">
<label>Gemini API Key (ရွေးစရာ — BYOK)</label>
<input type="password" id="videoByokInput" placeholder="ထည့်လိုပါက သင့် Key ကိုထည့်ပါ">
</div>
</div>
</details>
<button class="btn btn-primary" id="videoGenBtn" onclick="generateVideo()">&#9654; Video Plan ဖန်တီးမယ်</button>
<div class="loading" id="videoLoading"><div class="spinner"></div> ဗီဒီယိုအစီအစဉ် ရေးဆွဲနေပါသည်...</div>
<div class="error-box" id="videoError"></div>
<div id="videoResult" style="display:none;">
<div class="card" id="charactersCard" style="display:none;margin-top:16px;">
<div class="card-title">&#128100; ဇာတ်ကောင်များ (Characters)</div>
<div id="charactersList" class="characters-list"></div>
</div>
<div class="card">
<div class="card-title">&#127916; ဖြစ်စဉ်များ (Scenes)</div>
<div id="scenesList"></div>
</div>
</div>
</div>
</div>`;

const STEP6_HTML = `
<div class="aics-step" data-step="6">
<div class="card">
<div class="card-title">&#127894; Result</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">ညာဘက် Preview မှာ နောက်ဆုံးရလဒ် အပြည့်အစုံကို ကြည့်ပြီး Copy / Save / Export လုပ်နိုင်ပါတယ်။</p>
<div class="btn-row">
<button class="btn btn-success" onclick="copyAllResult()">&#128203; Copy All</button>
<button class="btn btn-purple" onclick="saveContentResult()">&#128190; Save to My Creations</button>
<button class="btn btn-orange" onclick="exportResult()">&#128228; Export (.txt)</button>
</div>
</div>
</div>`;

const STEPS_HTML = STEP1_HTML + STEP2_HTML + STEP3_HTML + STEP4_HTML + STEP5_HTML + STEP6_HTML;

export const CONTENT_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Content Studio — AI Creative Studio</title>
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
textarea{resize:vertical;min-height:90px}
select{cursor:pointer}
select option{background:var(--bg-card);color:var(--text)}
.form-group{margin-bottom:16px}
.adv-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.adv-grid .form-group{margin-bottom:0;}
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
.btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.type-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.type-chip{padding:10px 16px;border:1px solid var(--border);border-radius:20px;font-size:13px;cursor:pointer;color:var(--text2);transition:all .2s;user-select:none;min-height:40px;display:inline-flex;align-items:center;gap:6px}
.type-chip:hover{border-color:var(--cyan);color:var(--cyan)}
.aics-advanced{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:16px}
.aics-advanced summary{cursor:pointer;color:var(--cyan);font-size:13px;font-weight:600;user-select:none;min-height:32px;display:flex;align-items:center}
.result-grid{display:grid;grid-template-columns:1fr;gap:14px;margin-top:16px}
.result-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:16px}
.result-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.result-card-label{font-size:12px;font-weight:600;color:var(--purple);text-transform:uppercase;letter-spacing:.5px}
.result-card-body{font-size:14px;line-height:1.7;color:var(--text);white-space:pre-wrap;word-break:break-word}
.revise-section{margin-top:20px;padding-top:20px;border-top:1px solid var(--border)}
.revise-history{margin-bottom:14px;max-height:280px;overflow-y:auto}
.revise-msg{background:var(--bg-input);border-radius:8px;padding:10px 14px;margin-bottom:8px;font-size:13px}
.revise-msg.user{border-left:3px solid var(--purple)}
.revise-msg .role{font-size:11px;color:var(--text3);margin-bottom:4px}
.revise-input-row{display:flex;gap:10px;align-items:flex-end}
.revise-input-row textarea{flex:1;min-height:60px}
.audio-container{margin-top:12px}
.audio-container audio{width:100%;margin-top:8px}
.voice-hint{font-size:12px;color:var(--text3);margin-top:8px;font-style:italic}
.srt-box{font-family:'Courier New',monospace;font-size:12.5px;min-height:120px;line-height:1.5}
.direction-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0}
.direction-chip{padding:8px 14px;border:1px solid var(--border);border-radius:20px;font-size:12.5px;cursor:pointer;color:var(--text2);transition:all .2s;user-select:none;min-height:36px;display:inline-flex;align-items:center}
.direction-chip:hover{border-color:var(--cyan);color:var(--cyan)}
.direction-chip.selected{background:rgba(0,229,255,.12);border-color:var(--cyan);color:var(--cyan);font-weight:600}
.divider{border:none;border-top:1px solid var(--border);margin:18px 0}
.result-label{font-size:12px;font-weight:600;color:var(--success);margin-bottom:6px}
.characters-list{display:flex;flex-wrap:wrap;gap:10px}
.character-chip{background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:10px 14px;flex:1 1 200px;min-width:180px}
.character-name{font-weight:600;color:var(--cyan);font-size:13px;margin-bottom:4px}
.character-desc{font-size:12px;color:var(--text2);line-height:1.5}
.scene-item{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:14px}
.scene-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.scene-num{font-weight:700;color:var(--cyan);font-size:14px}
.scene-duration{font-size:11px;color:var(--text3);background:var(--bg-input);padding:2px 8px;border-radius:10px}
.scene-field{margin-bottom:10px}
.scene-field-label{font-size:11px;font-weight:600;color:var(--purple);text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between;gap:8px}
.scene-field-text{font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap;word-break:break-word}
.scene-image-area{margin-top:12px;text-align:center}
.scene-image-area img{max-width:100%;border-radius:8px;border:1px solid var(--border)}
.scene-image-placeholder{background:var(--bg-input);border:1px dashed var(--border);border-radius:8px;padding:20px;color:var(--text3);font-size:12px}
.loading{display:none !important;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);align-items:center;gap:12px;color:#00e5ff;font-size:15px;font-weight:600;padding:16px 28px;border-radius:16px;background:rgba(8,12,24,.95);border:1px solid rgba(0,229,255,.4);box-shadow:0 8px 40px rgba(0,229,255,.3);z-index:99999;backdrop-filter:blur(12px);white-space:nowrap}
.loading.show{display:flex}
.spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--cyan);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.error-box{display:none;background:rgba(255,82,82,.1);border:1px solid rgba(255,82,82,.3);color:var(--error);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px}
.error-box.show{display:block}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:var(--bg-card2);border:1px solid var(--success);color:var(--success);padding:10px 20px;border-radius:8px;font-size:13px;z-index:1000;transition:transform .3s}
.toast.show{transform:translateX(-50%) translateY(0)}
.empty-note{color:var(--text3);font-size:13px;padding:16px;background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;text-align:center}
@media(max-width:768px){.menu-btn{display:block}.sidebar{position:fixed;left:-260px;top:57px;bottom:0;z-index:99;transition:left .3s;box-shadow:4px 0 20px rgba(0,0,0,.5)}.sidebar.open{left:0}.main{padding:16px}.header-right .user-email{display:none}.form-row{flex-direction:column}.revise-input-row{flex-direction:column;align-items:stretch}}
</style>
</head>
<body>
<div id="loginView" class="aics-login-overlay" style="display:none;"><div class="aics-login-box"><h2>Login လုပ်ရန် လိုအပ်ပါသည်</h2><p>Content Studio ကို အသုံးပြုရန် Google နဲ့ Login ဝင်ပါ။</p><a href="/api/auth/login?next=/app/content" class="btn btn-primary">Google နဲ့ Login</a></div></div>
${renderStudioShell({
  id: 'content',
  activeId: 'content',
  nameMy: 'Content Studio',
  desc: 'Create engaging content for any platform',
  icon: '✍️',
  modelCat: 'text',
  steps: STEPS,
  content: STEPS_HTML,
})}
${sidebarScript()}
<div class="toast" id="toast">&#9989; ကူးယူပြီးပါပြီ</div>
<script>
var token=localStorage.getItem('aics_token')||'';
var userEmail=localStorage.getItem('aics_email')||'';
var userPlan=localStorage.getItem('aics_plan')||'FREE';
var lastResult=null;
var videoPlan=null;
var currentAudioBase64=null;
var currentDirection='my-to-cn';
var imgCache={};

var QUICK_ACTIONS=[
  {label:'&#128260; Rewrite',kind:'rewrite'},
  {label:'&#128259; Shorten',kind:'shorten'},
  {label:'&#128240; Expand',kind:'expand'},
  {label:'&#11088; Improve',kind:'improve'},
  {label:'&#127912; Change Tone',kind:'tone'}
];
var QUICK_PROMPTS={
  rewrite:'ပြန်ရေးပါ (Rewrite) — အဓိကအကြောင်းအရာကို ထိန်းထားပြီး ပုံစံအသစ်နဲ့ လုံးဝပြန်ရေးပါ',
  shorten:'ပိုတိုအောင် အတိုချုံးပါ (Shorten) — အဓိကအချက်များကိုသာ ထားပါ',
  expand:'ပိုရှည်အောင် ချဲ့ပါ (Expand) — အသေးစိတ် ဥပမာများ ထည့်ပြီး ချဲ့ပါ',
  improve:'ပိုကောင်းအောင် ပြင်ပါ (Improve) — စာဖတ်ရလွယ်ကူ၊ ဆွဲဆောင်မှုရှိအောင် ပြင်ပါ',
  tone:'အသံသေချာပြောင်းပါ'
};

(function init(){
  if(!token){document.getElementById('loginView').style.display='flex';document.getElementById('aicsApp').style.display='none';return;}
  var _ue=document.getElementById('userEmail');if(_ue)_ue.textContent=userEmail||'—';
  var _pb=document.getElementById('planBadge');if(_pb)_pb.textContent=userPlan||'FREE';
  buildQuickActions();
})();

function buildQuickActions(){
  var c=document.getElementById('quickActions');if(!c)return;
  c.innerHTML='';
  for(var i=0;i<QUICK_ACTIONS.length;i++){
    (function(a){
      var chip=document.createElement('div');
      chip.className='type-chip';
      chip.innerHTML=a.label;
      chip.onclick=function(){quickAction(a.kind);};
      c.appendChild(chip);
    })(QUICK_ACTIONS[i]);
  }
}

function quickAction(kind){
  if(!lastResult){showError('revError','အရင် Content ကို ဖန်တီးပါ');return;}
  var preset=QUICK_PROMPTS[kind]||'ပြင်ပါ';
  var feedback=preset;
  if(kind==='tone'){
    var tone=prompt('ဘယ်လို Tone ပြောင်းချင်ပါသလဲ? (ဥပမာ — ရယ်စရာ / လေးနက် / ဖော်ရွေ / စိတ်လှုပ်ရှားဖွယ်)','ရယ်စရာ');
    if(tone===null)return;
    feedback='Tone ကို "'+tone+'" ဖြစ်အောင် ပြောင်းပါ';
  }
  document.getElementById('feedbackInput').value=feedback;
  reviseContent();
}

function apiCall(url,body){
  var s=document.getElementById('aiModelSel');if(s&&s.value)body.model=s.value;
  return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.detail||data.error||'Request failed');return data;});});
}

// ===== Content Generate =====
function generateContent(){
  var idea=document.getElementById('ideaInput').value.trim();
  var type=document.getElementById('typeSelect').value;
  var byok=document.getElementById('byokInput').value.trim();
  var audEl=document.getElementById('audSel');
  if(!idea){showError('genError','အကြောင်းအရာ (User Idea) ထည့်ပါ။');return;}
  if(audEl&&audEl.value)idea+='\\n\\nဘယ်သူအတွက်: '+audEl.value;
  window.aichAud=audEl?audEl.value:'လူတိုင်း';
  setLoading('genLoading',true);
  hideError('genError');
  var body={idea:idea,type:type};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/generate',body)
    .then(function(data){
      lastResult=data;
      renderContentResult();
      document.getElementById('ttsText').value=data.content||'';
      studioMarkDone(1);
      studioMarkDone(2);
      showToastMsg('&#10004; Content ပြီးပါပြီ');
      studioGoStep(2);
    })
    .catch(function(err){showError('genError',err.message);})
    .finally(function(){setLoading('genLoading',false);});
}

function renderContentResult(){
  if(!lastResult){document.getElementById('resultGrid').style.display='none';if(document.getElementById('noResultHint'))document.getElementById('noResultHint').style.display='block';return;}
  document.getElementById('contentOut').textContent=lastResult.content||'(empty)';
  document.getElementById('speakingOut').textContent=lastResult.speakingStyle||'(empty)';
  document.getElementById('voiceOut').textContent=lastResult.voiceStyle||'(empty)';
  document.getElementById('resultGrid').style.display='block';
  if(document.getElementById('noResultHint'))document.getElementById('noResultHint').style.display='none';
}

// ===== Revise =====
function reviseContent(){
  var feedback=document.getElementById('feedbackInput').value.trim();
  if(!feedback){showError('revError','ပြင်ဆင်ချက် (Feedback) ရေးပါ။');return;}
  if(!lastResult){showError('revError','အရင် Content ကို ဖန်တီးပါ။');return;}
  setLoading('revLoading',true);
  hideError('revError');
  document.getElementById('reviseBtn').disabled=true;
  addHistory('user',feedback);
  var type=document.getElementById('typeSelect').value;
  var byok=document.getElementById('byokInput').value.trim();
  var body={
    originalContent:lastResult.content||'',
    originalSpeaking:lastResult.speakingStyle||'',
    originalVoice:lastResult.voiceStyle||'',
    feedback:feedback,
    type:type
  };
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/revise',body)
    .then(function(data){
      lastResult=data;
      renderContentResult();
      document.getElementById('feedbackInput').value='';
      document.getElementById('ttsText').value=data.content||'';
      addHistory('ai','ပြင်ဆင်ပြီးပါပြီ — အထက်ပါရလဒ်ကို ကြည့်ပါ။');
      if(window.studioCur&&window.studioCur()===3)renderContentPreview();
    })
    .catch(function(err){showError('revError',err.message);})
    .finally(function(){setLoading('revLoading',false);document.getElementById('reviseBtn').disabled=false;});
}
function addHistory(role,text){
  var div=document.createElement('div');
  div.className='revise-msg '+role;
  var roleLabel=role==='user'?'သင် (User)':'AI';
  div.innerHTML='<div class="role">'+roleLabel+'</div>'+escapeHtml(text);
  document.getElementById('reviseHistory').appendChild(div);
  document.getElementById('reviseHistory').scrollTop=document.getElementById('reviseHistory').scrollHeight;
}

// ===== Text → Voice (TTS) =====
function generateVoice(){
  var text=document.getElementById('ttsText').value.trim();
  if(!text){showError('voiceError','Text ထည့်ပါ (သို့မဟုတ် Content ကို အရင်ဖန်တီးပါ)။');return;}
  var voiceName=document.getElementById('voiceNameSelect').value;
  var byok=document.getElementById('byokInput').value.trim();
  setLoading('voiceLoading',true);
  hideError('voiceError');
  document.getElementById('voiceBtn').disabled=true;
  var body={text:text,voiceName:voiceName};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/tts',body)
    .then(function(data){
      currentAudioBase64=data.data;
      var audioUrl='data:'+(data.mimeType||'audio/wav')+';base64,'+data.data;
      var container=document.getElementById('audioContainer');
      container.innerHTML='<audio controls src="'+audioUrl+'"></audio>'+
        '<div class="btn-row"><button class="btn-ghost" onclick="downloadAudio()">&#128190; Save Audio</button></div>';
      showToastMsg('&#10004; အသံပြီးပါပြီ');
    })
    .catch(function(err){showError('voiceError',err.message);})
    .finally(function(){setLoading('voiceLoading',false);document.getElementById('voiceBtn').disabled=false;});
}
function downloadAudio(){
  if(!currentAudioBase64)return;
  var byteChars=atob(currentAudioBase64);
  var byteNumbers=new Array(byteChars.length);
  for(var i=0;i<byteChars.length;i++)byteNumbers[i]=byteChars.charCodeAt(i);
  var blob=new Blob([new Uint8Array(byteNumbers)],{type:'audio/wav'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download='content_voice.wav';
  a.click();
  URL.revokeObjectURL(url);
}

// ===== SRT =====
function generateSrt(){
  if(!currentAudioBase64){showError('srtError','အရင် Generate Voice ကို နှိပ်ပါ — Audio မရှိသေးပါ။');return;}
  var byok=document.getElementById('byokInput').value.trim();
  setLoading('srtLoading',true);
  hideError('srtError');
  document.getElementById('srtBtn').disabled=true;
  var body={audioBase64:currentAudioBase64,mimeType:'audio/wav'};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/srt',body)
    .then(function(data){
      document.getElementById('resultSrt').value=data.srt||'';
    })
    .catch(function(err){showError('srtError',err.message);})
    .finally(function(){setLoading('srtLoading',false);document.getElementById('srtBtn').disabled=false;});
}

// ===== Translate SRT =====
function selectDirection(chip){
  var chips=document.querySelectorAll('.direction-chip');
  for(var i=0;i<chips.length;i++)chips[i].classList.remove('selected');
  chip.classList.add('selected');
  currentDirection=chip.getAttribute('data-dir');
}
function translateSrt(){
  var srtText=document.getElementById('resultSrt').value.trim();
  if(!srtText){showError('translateError','မူရင်း SRT မရှိသေးပါ — Generate SRT ကို အရင်နှိပ်ပါ။');return;}
  var byok=document.getElementById('byokInput').value.trim();
  setLoading('translateLoading',true);
  hideError('translateError');
  document.getElementById('translateBtn').disabled=true;
  var body={srtText:srtText,direction:currentDirection};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/translate-srt',body)
    .then(function(data){
      document.getElementById('resultSrtTranslated').value=data.srt||'';
      document.getElementById('translatedLabel').style.display='block';
    })
    .catch(function(err){showError('translateError',err.message);})
    .finally(function(){setLoading('translateLoading',false);document.getElementById('translateBtn').disabled=false;});
}
function downloadSrt(elementId,filename){
  var text=document.getElementById(elementId).value;
  if(!text||!text.trim()){showToastMsg('SRT မရှိသေးပါ');return;}
  var blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download=filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ===== Video Plan =====
function generateVideo(){
  var idea=document.getElementById('videoIdeaInput').value.trim();
  var type=document.getElementById('videoTypeSelect').value;
  var byok=document.getElementById('videoByokInput').value.trim();
  if(!idea){showError('videoError','အကြောင်းအရာ (User Idea) ထည့်ပါ။');return;}
  setLoading('videoLoading',true);
  hideError('videoError');
  document.getElementById('videoGenBtn').disabled=true;
  var body={idea:idea,type:type};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/video',body)
    .then(function(data){
      videoPlan=data;
      renderVideoPlan(data);
      document.getElementById('videoResult').style.display='block';
      studioMarkDone(5);
      showToastMsg('&#10004; Video Plan ပြီးပါပြီ');
      if(window.studioCur&&window.studioCur()===5)renderVideoPreview();
    })
    .catch(function(err){showError('videoError',err.message);})
    .finally(function(){setLoading('videoLoading',false);document.getElementById('videoGenBtn').disabled=false;});
}
function renderVideoPlan(data){
  var charsCard=document.getElementById('charactersCard');
  var charsList=document.getElementById('charactersList');
  if(data.characters&&data.characters.length>0){
    charsCard.style.display='block';
    charsList.innerHTML='';
    for(var i=0;i<data.characters.length;i++){
      var c=data.characters[i];
      var div=document.createElement('div');
      div.className='character-chip';
      div.innerHTML='<div class="character-name">'+escapeHtml(c.name||'Character '+(i+1))+'</div>'+
                    '<div class="character-desc">'+escapeHtml(c.description||'')+'</div>';
      charsList.appendChild(div);
    }
  }else{
    charsCard.style.display='none';
  }
  var scenesList=document.getElementById('scenesList');
  scenesList.innerHTML='';
  if(data.scenes&&data.scenes.length>0){
    for(var j=0;j<data.scenes.length;j++){
      (function(idx){
        var s=data.scenes[idx];
        var item=document.createElement('div');
        item.className='scene-item';
        var html='<div class="scene-header">'+
          '<span class="scene-num">Scene '+(s.number||(idx+1))+'</span>'+
          (s.duration?'<span class="scene-duration">'+escapeHtml(s.duration)+'</span>':'')+
          '</div>';
        if(s.description){
          html+='<div class="scene-field"><div class="scene-field-label">ဖော်ပြချက် (Description)</div>'+
                '<div class="scene-field-text">'+escapeHtml(s.description)+'</div></div>';
        }
        if(s.visualPrompt){
          html+='<div class="scene-field"><div class="scene-field-label">'+
                'ရုပ်ပုံ Prompt <button class="btn-ghost" onclick="copySceneText('+idx+')">&#128203; Copy</button></div>'+
                '<div class="scene-field-text" id="sceneVP_'+idx+'">'+escapeHtml(s.visualPrompt)+'</div></div>';
        }
        if(s.dialogue){
          html+='<div class="scene-field"><div class="scene-field-label">စကားပြော (Dialogue)</div>'+
                '<div class="scene-field-text">'+escapeHtml(s.dialogue)+'</div></div>';
        }
        html+='<div class="scene-image-area" id="sceneImg_'+idx+'">'+
              (imgCache['scene_'+idx]?'<img src="'+imgCache['scene_'+idx]+'"><div style="margin-top:8px;"><button class="btn-ghost" onclick="generateSceneImage('+idx+')">&#128260; ပြန်ဖန်တီးပါ</button></div>':'<button class="btn btn-secondary" onclick="generateSceneImage('+idx+')">&#128444; ဤဖြစ်စဉ်၏ ရုပ်ပုံဖန်တီးပါ</button>')+
              '</div>';
        item.innerHTML=html;
        scenesList.appendChild(item);
      })(j);
    }
  }else{
    scenesList.innerHTML='<div style="color:var(--text3);text-align:center;padding:20px;">Scenes မတွေ့ရှိပါ</div>';
  }
}
function copySceneText(idx){
  if(!videoPlan||!videoPlan.scenes||!videoPlan.scenes[idx])return;
  var text=videoPlan.scenes[idx].visualPrompt||'';
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
}
function generateSceneImage(idx){
  if(!videoPlan||!videoPlan.scenes||!videoPlan.scenes[idx])return;
  var scene=videoPlan.scenes[idx];
  var prompt=scene.visualPrompt||scene.description||'';
  if(!prompt){alert('ဒီဖြစ်စဉ်တွင် Visual Prompt မရှိပါ');return;}
  var area=document.getElementById('sceneImg_'+idx);
  if(!area)return;
  area.innerHTML='<div class="loading show" style="justify-content:center;"><div class="spinner"></div> ရုပ်ပုံဖန်တီးနေပါသည်...</div>';
  var byok=document.getElementById('videoByokInput').value.trim();
  var body={prompt:prompt};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/content/video-image',body)
    .then(function(data){
      if(data.data){
        var imgSrc='data:'+(data.mimeType||'image/png')+';base64,'+data.data;
        imgCache['scene_'+idx]=imgSrc;
        area.innerHTML='<img src="'+imgSrc+'" alt="Scene '+(idx+1)+'">'+
                       '<div style="margin-top:8px;"><button class="btn-ghost" onclick="generateSceneImage('+idx+')">&#128260; ပြန်ဖန်တီးပါ</button></div>';
      }else{
        area.innerHTML='<div class="scene-image-placeholder">ရုပ်ပုံမထွက်ပါ</div>';
      }
    })
    .catch(function(err){
      area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">Error: '+escapeHtml(err.message)+'</div>'+
                     '<button class="btn-ghost" onclick="generateSceneImage('+idx+')">ထပ်စမ်းပါ</button>';
    });
}

// ===== Result =====
function buildResultText(){
  var parts=[];
  if(lastResult&&lastResult.content)parts.push('CONTENT\\n======================\\n'+lastResult.content);
  if(lastResult&&lastResult.speakingStyle)parts.push('SPEAKING STYLE\\n======================\\n'+lastResult.speakingStyle);
  if(lastResult&&lastResult.voiceStyle)parts.push('VOICE STYLE\\n======================\\n'+lastResult.voiceStyle);
  if(videoPlan&&videoPlan.characters&&videoPlan.characters.length){
    var cp='CHARACTERS\\n======================\\n';
    for(var i=0;i<videoPlan.characters.length;i++){
      var c=videoPlan.characters[i];
      cp+='\\n'+(c.name||'Character '+(i+1))+': '+(c.description||'');
    }
    parts.push(cp);
  }
  if(videoPlan&&videoPlan.scenes&&videoPlan.scenes.length){
    var sp='VIDEO PLAN SCENES\\n======================\\n';
    for(var j=0;j<videoPlan.scenes.length;j++){
      var s=videoPlan.scenes[j];
      sp+='\\nScene '+(s.number||(j+1))+(s.duration?' ('+s.duration+')':'')+'\\n';
      if(s.description)sp+='Description: '+s.description+'\\n';
      if(s.visualPrompt)sp+='Visual Prompt: '+s.visualPrompt+'\\n';
      if(s.dialogue)sp+='Dialogue: '+s.dialogue+'\\n';
    }
    parts.push(sp);
  }
  return parts.join('\\n\\n');
}
function saveContentResult(){
  var text=buildResultText();
  if(!text.trim()){showToastMsg('Save လုပ်ဖို့ Result မရှိသေးပါ');return;}
  var idea=(document.getElementById('ideaInput').value.trim()||'Content Result').substring(0,40);
  var title=prompt('Creation အမည် ပေးပါ:',idea);
  if(title===null)return;
  AICS_CREATIONS.save({studio:'CONTENT',type:document.getElementById('typeSelect').value,title:title||idea,original_prompt:document.getElementById('ideaInput').value,ai_output:text})
    .then(function(){showToastMsg('&#128190; My Creations ထဲ Save ပြီးပါပြီ');})
    .catch(function(err){showToastMsg('Save မအောင်မြင်ပါ: '+(err&&err.message||'Error'));});
}
function copyAllResult(){
  var text=buildResultText();
  if(!text.trim()){showToastMsg('Result မရှိသေးပါ');return;}
  copyToClipboard(text);
}
function exportResult(){
  var text=buildResultText();
  if(!text.trim()){showToastMsg('Export လုပ်ဖို့ Result မရှိသေးပါ');return;}
  var blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='content_result.txt';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
  showToastMsg('&#10004; Export ပြီးပါပြီ');
}
function copyToClipboard(text){
  if(!text){showToastMsg('Text မရှိပါ');return;}
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
}

// ===== Preview renderers =====
function renderContentPreview(){
  if(!lastResult){studioPreview('');return;}
  var html='<div class="aics-pv-label">&#9997; Content</div><pre>'+escapeHtml(lastResult.content||'(empty)')+'</pre>';
  studioPreview(html);
}
function renderContentFullPreview(){
  if(!lastResult){studioPreview('');return;}
  var html='<div class="aics-pv-label">&#128221; Content Result</div>';
  html+='<div class="aics-pv-card"><h4>Content</h4><p>'+escapeHtml(lastResult.content||'(empty)')+'</p></div>';
  html+='<div class="aics-pv-card"><h4>Speaking Style</h4><p>'+escapeHtml(lastResult.speakingStyle||'(empty)')+'</p></div>';
  html+='<div class="aics-pv-card"><h4>Voice Style</h4><p>'+escapeHtml(lastResult.voiceStyle||'(empty)')+'</p></div>';
  studioPreview(html);
}
function renderVoicePreview(){
  if(!lastResult&&!currentAudioBase64){studioPreview('');return;}
  var html='<div class="aics-pv-label">&#128266; Voice &amp; Format</div>';
  if(lastResult&&lastResult.content)html+='<div class="aics-pv-card"><h4>Content (အသံအတွက်)</h4><p>'+escapeHtml(lastResult.content.substring(0,400))+(lastResult.content.length>400?'…':'')+'</p></div>';
  if(currentAudioBase64)html+='<div class="aics-pv-card"><h4>&#9989; Audio ဖန်တီးပြီးပါပြီ</h4><p class="aics-pv-sub">Audio Player ကို အလုပ်နေရာမှာ ကြည့်ပါ</p></div>';
  studioPreview(html);
}
function renderVideoPreview(){
  if(!videoPlan){studioPreview('');return;}
  var html='<div class="aics-pv-label">&#127916; Video Plan</div>';
  if(videoPlan.characters&&videoPlan.characters.length){
    html+='<div class="aics-pv-card"><h4>Characters ('+videoPlan.characters.length+')</h4>';
    for(var i=0;i<videoPlan.characters.length;i++){
      var c=videoPlan.characters[i];
      html+='<p><b>'+(c.name||'Character '+(i+1))+'</b> — '+escapeHtml(c.description||'')+'</p>';
    }
    html+='</div>';
  }
  if(videoPlan.scenes&&videoPlan.scenes.length){
    for(var j=0;j<videoPlan.scenes.length;j++){
      var s=videoPlan.scenes[j];
      html+='<div class="aics-pv-card"><h4>Scene '+(s.number||(j+1))+'</h4><p>'+escapeHtml((s.description||''))+'</p><p class="aics-pv-sub">'+(s.visualPrompt?('Visual: '+s.visualPrompt.substring(0,160)):'')+'</p></div>';
    }
  }
  studioPreview(html);
}
function renderCombinedPreview(){
  var text=buildResultText();
  if(!text.trim()){studioPreview('');return;}
  studioPreview('<div class="aics-pv-label">&#127894; Final Output</div><pre>'+escapeHtml(text)+'</pre>');
}

// ===== Studio shell hooks =====
function bBack(){return {label:'&#8592; Back',cls:'ghost',fn:function(){studioGoStep(studioCur()-1);}};}
function bReset(){return {label:'Reset',cls:'ghost',fn:studioReset};}
function bSave(){return null;}
function bNext(n){return {label:'Next &#8594;',cls:'primary',fn:function(){studioGoStep(n);}};}

function studioOnStep(n){
  if(n===1){
    var acts=[bReset(),bSave()];
    if(lastResult)acts.push({label:'Next &#8594;',cls:'secondary',fn:function(){studioGoStep(2);}});
    acts.push({label:'Generate Content &#10022;',cls:'primary',fn:generateContent});
    studioSetActions(acts);
    renderContentFullPreview();
  }else if(n===2){
    studioSetActions([bBack(),bReset(),bSave(),bNext(3)]);
    renderContentFullPreview();
  }else if(n===3){
    studioSetActions([bBack(),bReset(),bSave(),bNext(4)]);
    renderContentPreview();
  }else if(n===4){
    studioSetActions([bBack(),bReset(),bSave(),bNext(5)]);
    renderVoicePreview();
  }else if(n===5){
    studioSetActions([bBack(),bReset(),bSave(),bNext(6)]);
    renderVideoPreview();
  }else if(n===6){
    studioSetActions([bBack(),{label:'&#9999; Edit',cls:'ghost',fn:function(){studioGoStep(3);}},{label:'&#128260; Regenerate',cls:'ghost',fn:function(){studioGoStep(1);}},{label:'&#128190; Save to Creations',cls:'purple',fn:saveContentResult},{label:'&#128228; Export',cls:'success',fn:exportResult}]);
    renderCombinedPreview();
  }
}
window.studioOnStep=studioOnStep;

function studioCollectDraft(){
  return {
    idea:document.getElementById('ideaInput').value,
    type:document.getElementById('typeSelect').value,
    aud:(document.getElementById('audSel')?document.getElementById('audSel').value:''),
    byok:document.getElementById('byokInput').value,
    videoIdea:document.getElementById('videoIdeaInput').value,
    videoType:document.getElementById('videoTypeSelect').value,
    videoByok:document.getElementById('videoByokInput').value,
    ttsText:document.getElementById('ttsText').value,
    voiceName:document.getElementById('voiceNameSelect').value,
    srt:document.getElementById('resultSrt').value,
    srtTranslated:document.getElementById('resultSrtTranslated').value,
    direction:currentDirection,
    lastResult:lastResult,
    videoPlan:videoPlan,
    audio:currentAudioBase64
  };
}
window.studioCollectDraft=studioCollectDraft;

function studioRestoreDraft(d){
  if(!d)return;
  if(d.idea)document.getElementById('ideaInput').value=d.idea;
  if(d.type)document.getElementById('typeSelect').value=d.type;
  var audEl=document.getElementById('audSel');if(audEl&&d.aud)audEl.value=d.aud;if(audEl)window.aichAud=audEl.value;
  if(d.byok)document.getElementById('byokInput').value=d.byok;
  if(d.videoIdea)document.getElementById('videoIdeaInput').value=d.videoIdea;
  if(d.videoType)document.getElementById('videoTypeSelect').value=d.videoType;
  if(d.videoByok)document.getElementById('videoByokInput').value=d.videoByok;
  if(d.ttsText)document.getElementById('ttsText').value=d.ttsText;
  if(d.voiceName)document.getElementById('voiceNameSelect').value=d.voiceName;
  if(d.srt)document.getElementById('resultSrt').value=d.srt;
  if(d.srtTranslated)document.getElementById('resultSrtTranslated').value=d.srtTranslated;
  if(d.direction)currentDirection=d.direction;
  lastResult=d.lastResult||null;
  videoPlan=d.videoPlan||null;
  currentAudioBase64=d.audio||null;
  if(lastResult){
    renderContentResult();
    studioMarkDone(1);
    studioMarkDone(2);
  }
  if(videoPlan){
    renderVideoPlan(videoPlan);
    document.getElementById('videoResult').style.display='block';
    studioMarkDone(5);
  }
  if(currentAudioBase64){
    var audioUrl='data:audio/wav;base64,'+currentAudioBase64;
    document.getElementById('audioContainer').innerHTML='<audio controls src="'+audioUrl+'"></audio><div class="btn-row"><button class="btn-ghost" onclick="downloadAudio()">&#128190; Save Audio</button></div>';
  }
}
window.studioRestoreDraft=studioRestoreDraft;

// ===== Helpers =====
function setLoading(id,show){var el=document.getElementById(id);if(show){el.classList.add("show");if(window.studioSetLoading)studioSetLoading(true);}else{el.classList.remove("show");if(window.studioSetLoading)studioSetLoading(false);}}
function showError(id,msg){var el=document.getElementById(id);el.textContent=msg;el.classList.add('show');}
function hideError(id){document.getElementById(id).classList.remove('show');}
function copyText(id){
  var el=document.getElementById(id);
  var text=el.value||el.textContent;
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
}
function showToastMsg(msg){var t=document.getElementById('toast');t.textContent=msg||'&#9989; ကူးယူပြီးပါပြီ';t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2000);}
function escapeHtml(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
</script>
</body>
</html>`;
