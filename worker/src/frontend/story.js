// AI Creative Studio — Story Studio Frontend (Main Stepper + Video Branch Stepper)
// Main: 01 ဇာတ်လမ်းအချက်အလက် → 02 AI ရေးသားနေသည် → 03 ဇာတ်လမ်းရလဒ်
// Video Branch (Step 03 မှ): 01 Video ပြင်ဆင်ရန် → 02 AI ပြင်ဆင်နေသည် → 03 နောက်ဆုံးရလဒ်
// Studio Isolation: ဤ File သည် Story Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Shared: renderSidebar / sidebarScript / renderStudioShell (frontend/shared.js)
// ⚠️ API Contract ကို မပျက်စီးစေရ — /api/studio/story/generate, /revise, /video, /video-image ကို ဆက်ထိန်းထားသည်။

import { renderSidebar, sidebarScript, renderStudioShell } from './shared.js';

// Main Stepper (၃ ဆင့်) — Video Branch သည် အောက်က state machine တွင် သီးခြားစီ
const STEPS = [
  { label: '01 ဇာတ်လမ်းအချက်အလက်' },
  { label: '02 AI ရေးသားနေသည်', lock: true, loading: 'ဇာတ်လမ်းရေးသားနေသည်...' },
  { label: '03 ဇာတ်လမ်းရလဒ်', req: [2] },
];

const STEP1_HTML = `
<div class="aics-step" data-step="1">
<div class="card">
<div class="card-title">&#128221; ဇာတ်လမ်းရေးရန်</div>
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
<select id="audSel" onchange="window.aichAud=this.value;"><option>လူတိုင်း</option><option>လူငယ်</option><option>လူကြီး</option><option>ကလေး</option></select>
</div>
</div>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>Tone</label>
<select id="toneSel"><option>Emotional</option><option>Dark</option><option>Light</option><option>Funny</option><option>Epic</option><option>Mysterious</option></select>
</div>
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>Language</label>
<select id="langSel"><option>မြန်မာ (ဘာသာ)</option><option>English</option><option>မြန်မာ + English</option></select>
</div>
</div>
<div class="form-group">
<label>ဇာတ်လမ်းအကြောင်း *</label>
<textarea id="field_0" placeholder="ဥပမာ — ရန်ကုန်မှာ အောင်မြင်မှုရဖို့ ကြိုးစားနေတဲ့ လူငယ်တစ်ယောက်ရဲ့ ခရီး..." style="min-height:110px;resize:vertical;"></textarea>
</div>
<button type="button" id="advToggle" onclick="document.getElementById('ideaFields').style.display=(document.getElementById('ideaFields').style.display==='none'?'grid':'none');this.querySelector('span').textContent=document.getElementById('ideaFields').style.display==='none'?'အပိုဆောင်းသတ်မှတ်ချက် ▼':'ချုံ့ရန် ▲'" style="width:100%;padding:11px;border-radius:14px;background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.25);color:#00e5ff;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:12px;"><span>အပိုဆောင်းသတ်မှတ်ချက် ▼</span></button>
<div id="ideaFields" class="adv-grid" style="margin-top:4px;display:none;"></div>
<div class="error-box" id="genError"></div>
</div>
</div>`;

const STEP2_HTML = `
<div class="aics-step" data-step="2">
<div class="card">
<div class="loading-card">
<div class="spinner"></div>
<div class="loading-title">&#10024; AI ရေးသားနေသည်...</div>
<div class="status-list" id="storyStatus">
<div class="st-line" data-idx="0"><span class="st-marker">○</span><span>အချက်အလက်များကို ဖတ်နေသည်</span></div>
<div class="st-line" data-idx="1"><span class="st-marker">○</span><span>ဇာတ်လမ်းအကြောင်းအရာကို ခွဲခြမ်းနေသည်</span></div>
<div class="st-line" data-idx="2"><span class="st-marker">○</span><span>ဇာတ်လမ်းရေးသားနေသည်</span></div>
<div class="st-line" data-idx="3"><span class="st-marker">○</span><span>ဇာတ်လမ်းကို စစ်ဆေးနေသည်</span></div>
</div>
<div class="error-box" id="genError2"></div>
<div class="retry-row" id="genRetry2"><button class="btn btn-secondary" onclick="generateStory()">&#8635; ပြန်ကြိုးစားရန်</button></div>
</div>
</div>
</div>`;

const STEP3_HTML = `
<div class="aics-step" data-step="3">
<div class="card">
<div class="card-title">&#128214; ဇာတ်လမ်းရလဒ်</div>
<textarea class="result-textarea" id="storyResult" placeholder="ဇာတ်လမ်း ဒီနေရာမှာ ပေါ်လာပါမယ်..." oninput="onStoryEdit()"></textarea>
<p style="color:var(--text3);font-size:12px;margin-top:6px;font-style:italic;">&#9997; ဒီနေရာမှာ တိုက်ရိုက် နှိပ်ပြီး ကိုယ်တိုင် ပြင်ဆင်နိုင်ပါတယ် — ပြင်ထားတဲ့ ဇာတ်လမ်းကို Video အဆင့်ကို အလိုအလျောက် ပို့ပေးပါမယ်</p>
<div class="btn-row">
<button class="btn btn-success" onclick="copyStory()">&#128203; Copy Story</button>
<button class="btn btn-purple" onclick="saveStory()">&#128190; ဖန်တီးမှုသိမ်းပါ</button>
<button class="btn btn-secondary" onclick="focusRevise()">&#9999;&#65039; ပြန်ပြင်ရန်</button>
<button class="btn btn-primary" onclick="goToVideoForm()">&#127916; Video ဆက်ဖန်တီးရန်</button>
</div>
</div>
<div class="card revise-section" id="revise-section">
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
<div class="card-title">&#127916; Video ဇာတ်လမ်းဖန်တီးရန်</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">Step 03 မှာ ရရှိထားသော ဇာတ်လမ်းကို အလိုအလျောက် ထည့်ပေးထားပါသည် — Video အတွက် ဆက်တင်များရွေးပြီး ဖန်တီးပါ။</p>
<div class="form-group">
<label>&#128214; အသုံးပြုမည့် ဇာတ်လမ်း</label>
<textarea id="videoStoryInput" style="min-height:150px;" oninput="autoExpand(this)"></textarea>
</div>
<div class="vf-grid">
<div class="form-group"><label>Video Type</label><select id="vidTypeSel"></select></div>
<div class="form-group"><label>Video Duration</label><select id="vidDurationSel"></select></div>
<div class="form-group"><label>Scene Duration</label><select id="vidSceneSel"></select></div>
<div class="form-group"><label>Aspect Ratio</label><select id="vidRatioSel"></select></div>
<div class="form-group"><label>Visual Style</label><select id="vidStyleSel"></select></div>
<div class="form-group"><label>Camera Style</label><select id="vidCamSel"></select></div>
<div class="form-group"><label>Language</label><select id="vidLangSel"></select></div>
<div class="form-group"><label>Environment Style</label><select id="vidEnvSel"></select></div>
</div>
<label style="display:flex;align-items:center;gap:8px;margin:2px 0 16px;cursor:pointer;color:var(--text2);">
<input type="checkbox" id="vidContinuity" checked style="width:18px;height:18px;flex-shrink:0;accent-color:var(--cyan);"> &#10004; Maintain Same Character (Character Continuity)
</label>
<div class="form-group">
<label>Additional Instructions</label>
<textarea id="vidExtra" placeholder="ဥပမာ — နောက်ဆုံး Scene မှာ မိုးရွာပြီး စိတ်ခံစားချက်ကို ပိုဖော်ပြပါ..." style="min-height:80px;"></textarea>
</div>
<div class="error-box" id="planError"></div>
<div class="btn-row" style="margin-top:14px;">
<button class="btn btn-primary" id="videoPlanBtn" onclick="generateVideoPlan()" style="flex:1;">&#127916; Video ဇာတ်လမ်း ဖန်တီးရန်</button>
</div>
</div>
</div>`;

const STEP5_HTML = `
<div class="aics-step" data-step="5">
<div class="card">
<div class="loading-card">
<div class="spinner"></div>
<div class="loading-title">&#10024; AI ပြင်ဆင်နေသည်...</div>
<div class="status-list" id="planStatus">
<div class="st-line" data-idx="0"><span class="st-marker">○</span><span>ဇာတ်လမ်းကို ဖတ်ပြီးပါပြီ</span></div>
<div class="st-line" data-idx="1"><span class="st-marker">○</span><span>ဇာတ်ကောင်များကို ရှာဖွေနေသည်</span></div>
<div class="st-line" data-idx="2"><span class="st-marker">○</span><span>Scene များ ခွဲခြားနေသည်</span></div>
<div class="st-line" data-idx="3"><span class="st-marker">○</span><span>Character Reference ပြင်ဆင်နေသည်</span></div>
<div class="st-line" data-idx="4"><span class="st-marker">○</span><span>Environment Reference ပြင်ဆင်နေသည်</span></div>
<div class="st-line" data-idx="5"><span class="st-marker">○</span><span>Video Prompt များ ရေးသားနေသည်</span></div>
</div>
<div class="error-box" id="planError5"></div>
<div class="retry-row" id="planRetry5"><button class="btn btn-secondary" onclick="generateVideoPlan()">&#8635; ပြန်ကြိုးစားရန်</button></div>
</div>
</div>
</div>`;

const STEP6_HTML = `
<div class="aics-step" data-step="6">
<div id="finalResult"></div>
</div>`;

const CONTENT_HTML = STEP1_HTML + STEP2_HTML + STEP3_HTML + STEP4_HTML + STEP5_HTML + STEP6_HTML;

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
.aics-work .card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px}
.aics-work .card-title{font-size:15px;font-weight:600;color:var(--cyan);margin-bottom:14px;display:flex;align-items:center;gap:8px}
.aics-work label{display:block;font-size:12.5px;color:var(--text2);margin-bottom:6px;font-weight:500}
.aics-work input,.aics-work textarea,select{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:14px;padding:11px 14px;color:var(--text);font-size:14px;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
.aics-work input:focus,.aics-work textarea:focus,select:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 2px rgba(0,229,255,.1)}
.aics-work textarea{resize:vertical;min-height:90px}
select{cursor:pointer}
select option{background:var(--bg-card);color:var(--text)}
.aics-work .form-group{margin-bottom:16px}
.aics-work .adv-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.aics-work .adv-grid .form-group{margin-bottom:0;}
#typeSel,#audSel,#toneSel,#langSel{border-radius:20px;padding:13px 18px;background:rgba(123,92,255,.08);border:1px solid rgba(123,92,255,.22);color:#e8ecf4;min-height:50px;}
#typeSel:hover,#audSel:hover,#toneSel:hover,#langSel:hover{background:rgba(123,92,255,.15);border-color:rgba(123,92,255,.4);}
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
.aics-work .btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.aics-work .type-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.aics-work .type-chip{padding:10px 16px;border:1px solid var(--border);border-radius:20px;font-size:13px;cursor:pointer;color:var(--text2);transition:all .2s;user-select:none;min-height:40px;display:inline-flex;align-items:center;gap:6px}
.aics-work .type-chip:hover{border-color:var(--cyan);color:var(--cyan)}
.aics-work .type-chip.selected{background:rgba(0,229,255,.12);border-color:var(--cyan);color:var(--cyan);font-weight:600}
.aics-work .type-chip.locked{opacity:.45;cursor:not-allowed}
.aics-work .type-chip.locked:hover{border-color:var(--border);color:var(--text2)}
.aics-work .aics-advanced{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:16px}
.aics-work .aics-advanced summary{cursor:pointer;color:var(--cyan);font-size:13px;font-weight:600;user-select:none;min-height:32px;display:flex;align-items:center}
.aics-work .revise-section{margin-top:20px;padding-top:20px;border-top:1px solid var(--border)}
.aics-work .revise-history{margin-bottom:14px;max-height:280px;overflow-y:auto}
.aics-work .revise-msg{background:var(--bg-input);border-radius:8px;padding:10px 14px;margin-bottom:8px;font-size:13px}
.aics-work .revise-msg.user{border-left:3px solid var(--purple)}
.aics-work .revise-msg .role{font-size:11px;color:var(--text3);margin-bottom:4px}
.aics-work .revise-input-row{display:flex;gap:10px;align-items:flex-end}
.aics-work .revise-input-row textarea{flex:1;min-height:60px}
.aics-work .result-textarea{width:100%;min-height:220px;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:16px;color:var(--text);font-size:15px;line-height:1.7;font-family:inherit;resize:vertical;box-sizing:border-box;overflow:hidden}
.aics-work .result-textarea:focus{outline:none;border-color:var(--cyan)}
.aics-work .characters-list{display:flex;flex-wrap:wrap;gap:12px}
.aics-work .character-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:16px;flex:1 1 280px;min-width:260px}
.aics-work .character-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.aics-work .character-name{font-weight:700;color:var(--cyan);font-size:14px}
.aics-work .character-role{font-size:12px;color:var(--text3);margin-bottom:8px}
.aics-work .character-prompt{font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap;word-break:break-word;background:var(--bg-input);padding:10px 12px;border-radius:8px;margin-bottom:8px;min-height:20px}
.aics-work .scene-group{margin-bottom:20px}
.aics-work .scene-group-title{color:var(--cyan);font-weight:700;font-size:15px;padding-bottom:8px;margin-bottom:12px;border-bottom:1px solid var(--border)}
.aics-work .scene-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:12px}
.aics-work .scene-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.aics-work .scene-card-title{font-weight:600;color:var(--purple);font-size:13px}
.aics-work .scene-prompt-text{font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap;word-break:break-word;background:var(--bg-input);padding:10px 12px;border-radius:8px;margin-bottom:8px;min-height:20px}
.aics-work .scene-prompt-textarea{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--text);font-size:13px;line-height:1.6;font-family:inherit;resize:vertical;min-height:60px;box-sizing:border-box;margin-bottom:8px}
.aics-work .scene-prompt-textarea:focus{outline:none;border-color:var(--cyan)}
.aics-work .scene-image-area{margin-top:10px;text-align:center}
.aics-work .scene-image-area img{max-width:100%;border-radius:8px;border:1px solid var(--border)}
.aics-work .loading{display:none !important;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);align-items:center;gap:12px;color:#00e5ff;font-size:15px;font-weight:600;padding:16px 28px;border-radius:16px;background:rgba(8,12,24,.95);border:1px solid rgba(0,229,255,.4);box-shadow:0 8px 40px rgba(0,229,255,.3);z-index:99999;backdrop-filter:blur(12px);white-space:nowrap;}
.aics-work .loading.show{display:flex}
.aics-work .spinner{width:20px;height:20px;border:3px solid rgba(0,229,255,.2);border-top-color:#00e5ff;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.aics-work .error-box{display:none;background:rgba(255,82,82,.1);border:1px solid rgba(255,82,82,.3);color:var(--error);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px;line-height:1.7;white-space:pre-line}
.aics-work .error-box.show{display:block}
.aics-work .fallback-note{display:none;background:rgba(255,193,7,.1);border:1px solid rgba(255,193,7,.3);color:var(--warn);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px}
.aics-work .fallback-note.show{display:block}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:var(--bg-card2);border:1px solid var(--success);color:var(--success);padding:10px 20px;border-radius:8px;font-size:13px;z-index:1000;transition:transform .3s}
.toast.show{transform:translateX(-50%) translateY(0)}
.aics-work .empty-note{color:var(--text3);font-size:13px;padding:16px;background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;text-align:center}
@media(max-width:767px){.aics-work .revise-input-row{flex-direction:column;align-items:stretch}}
/* ===== Story Studio Workflow 01→06 — Additional Styles ===== */
.aics-work .vf-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.aics-work .vf-grid .form-group{margin-bottom:14px;}
.aics-work .loading-card{text-align:center;padding:40px 16px;}
.aics-work .loading-card .spinner{width:38px;height:38px;border-width:4px;margin:0 auto 18px;}
.aics-work .loading-title{font-size:18px;font-weight:700;color:var(--cyan);margin-bottom:20px;}
.aics-work .status-list{max-width:440px;margin:0 auto;text-align:left;}
.aics-work .st-line{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;color:var(--text2);font-size:14px;opacity:.5;transition:all .2s;}
.aics-work .st-line .st-marker{width:22px;text-align:center;flex-shrink:0;font-weight:700;color:var(--text3);}
.aics-work .st-line.active{opacity:1;color:var(--text);background:rgba(0,229,255,.06);}
.aics-work .st-line.active .st-marker{color:var(--cyan);}
.aics-work .st-line.done{opacity:1;color:var(--text);}
.aics-work .st-line.done .st-marker{color:var(--success);}
.aics-work .retry-row{display:none;justify-content:center;margin-top:16px;}
.aics-work .retry-row.show{display:flex;}
.aics-work .final-char-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px;}
.aics-work .final-char-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;flex-wrap:wrap;}
.aics-work .final-char-name{font-weight:700;color:var(--cyan);font-size:15px;}
.aics-work .final-char-id{font-size:11px;color:var(--purple);background:rgba(123,92,255,.12);border:1px solid rgba(123,92,255,.3);padding:2px 10px;border-radius:20px;}
.aics-work .final-char-meta{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12.5px;color:var(--text2);margin-bottom:10px;}
.aics-work .final-char-img{background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;padding:10px;margin-bottom:10px;text-align:center;}
.aics-work .final-char-img img{max-width:100%;max-height:340px;border-radius:8px;}
.aics-work .final-prompt-label{font-size:11.5px;color:var(--text3);font-weight:700;letter-spacing:.4px;margin:8px 0 6px;text-transform:uppercase;}
.aics-work .final-prompt-text{font-size:13px;color:var(--text);line-height:1.7;white-space:pre-wrap;word-break:break-word;background:var(--bg-input);padding:12px 14px;border-radius:10px;min-height:20px;}
.aics-work .final-scene-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px;}
.aics-work .final-scene-title{font-weight:700;color:var(--purple);font-size:14.5px;padding-bottom:10px;margin-bottom:12px;border-bottom:1px solid var(--border);}
.aics-work .final-scene-box{margin-bottom:12px;}
.aics-work .final-box-label{font-size:12px;color:var(--cyan);font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
.aics-work .final-scene-meta{font-size:12.5px;color:var(--text2);border-top:1px solid var(--border);padding-top:10px;margin-top:4px;display:flex;flex-wrap:wrap;gap:6px 16px;}
@media(max-width:767px){.aics-work .vf-grid{grid-template-columns:1fr;}}
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
var selectedVideoType='1';
var currentStory='';
var currentStoryIdea='';
var currentCharacters=[];
var currentScenes=[];
var imgCache={};
var videoStarted=false;
var storyBusy=false;
var planBusy=false;
var typewriterTimer=null;

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
  {label:'အဓိကဇာတ်ကောင်',placeholder:'ဥပမာ — မောင်မင်း'},
  {label:'ဇာတ်ကောင်အသက် / အလုပ် / ရည်မှန်းချက်',placeholder:'ဥပမာ — ၂၅ နှစ် / ဆော့ဖ်ဝဲ အင်ဂျင်နီယာ / ကိုယ်ပိုင်လုပ်ငန်း ထူထောင်ချင်သည်'},
  {label:'အဓိကပြဿနာ',placeholder:'ဥပမာ — ဇာတ်ကောင် ဘာအခက်အခဲကရမလဲ?'},
  {label:'ခံစားချက်',placeholder:'ဥပမာ — ဝမ်းနည်း / လှုပ်ရှား / ကြောက်စရာ'},
  {label:'နေရာ / ပတ်ဝန်းကျင်',placeholder:'ဥပမာ — မြန်မာကျေးရွာ / ရန်ကုန်မြို့'},
  {label:'အချိန်ကာလ',placeholder:'ဥပမာ — ၂၀၂၀ / ရှေးခေတ် / အနာဂတ်'},
  {label:'ဇာတ်လမ်းအရှည်',placeholder:'ဥပမာ — မိနစ် ၃၀ / နာရီဝက်'},
  {label:'နိဂုံးပုံစံ (Ending)',placeholder:'ဥပမာ — ပျော်ရွှင်စရာ အဆုံးသတ် / လှည့်ကွက်နဲ့ အဆုံးသတ်'}
];
var DURATIONS=['15 sec','30 sec','45 sec','60 sec','90 sec','120 sec'];
var SCENE_DURATIONS=['5 sec','8 sec','10 sec','12 sec','15 sec'];
var RATIOS=['16:9','9:16','1:1','4:3','21:9'];
var VISUAL_STYLES=['Cinematic Realism','Anime','3D Animation','2D Illustration','Stop Motion','Documentary','Film Noir','Fantasy'];
var CAMERA_STYLES=['Feature Film','Documentary','Drone Shot','Handheld','Static Shot','Slow Motion','Tracking Shot','Aerial'];
var LANGUAGES=['မြန်မာ','English','မြန်မာ + English'];
var ENV_STYLES=['Realistic','Stylized','Minimalist','Fantasy','Sci-Fi','Historical','Urban','Nature'];

(function init(){
  if(!token){document.getElementById('loginView').style.display='flex';document.getElementById('aicsApp').style.display='none';return;}
  var _ue=document.getElementById('userEmail');if(_ue)_ue.textContent=userEmail||'—';
  var _pb=document.getElementById('planBadge');if(_pb)_pb.textContent=userPlan||'FREE';
  try{var ic=localStorage.getItem('aics_draft_story_imgcache');if(ic){imgCache=JSON.parse(ic)||{};}}catch(e){}
  buildIdeaFields();
  buildVideoTypeSel();
  fillSelect('vidDurationSel',DURATIONS,'30 sec');
  fillSelect('vidSceneSel',SCENE_DURATIONS,'8 sec');
  fillSelect('vidRatioSel',RATIOS,'16:9');
  fillSelect('vidStyleSel',VISUAL_STYLES,'Cinematic Realism');
  fillSelect('vidCamSel',CAMERA_STYLES,'Feature Film');
  fillSelect('vidLangSel',LANGUAGES,'မြန်မာ');
  fillSelect('vidEnvSel',ENV_STYLES,'Realistic');
  var _ta=document.getElementById('field_0');
  if(_ta){_ta.addEventListener('input',function(){this.style.height='auto';this.style.height=(this.scrollHeight)+'px';});}
  var sr=document.getElementById('storyResult');
  if(sr){
    sr.addEventListener('keydown',function(){stopTypewriter();});
    sr.addEventListener('pointerdown',function(){stopTypewriter();});
  }
  var _db=debounce(autoSave,400);
  document.addEventListener('input',function(e){if(e.target&&e.target.closest&&e.target.closest('#aicsApp'))_db();},true);
  document.addEventListener('change',function(e){if(e.target&&e.target.closest&&e.target.closest('#aicsApp'))_db();},true);
})();

function debounce(fn,ms){var t=null;return function(){var a=arguments,c=this;clearTimeout(t);t=setTimeout(function(){fn.apply(c,a);},ms);};}
function sel(id){var e=document.getElementById(id);return e?e.value:'';}
function fillSelect(id,opts,defVal){
  var s=document.getElementById(id);if(!s)return;
  s.innerHTML='';
  for(var i=0;i<opts.length;i++){
    var o=document.createElement('option');o.value=opts[i];o.textContent=opts[i];
    if(opts[i]===defVal)o.selected=true;
    s.appendChild(o);
  }
}
function buildVideoTypeSel(){
  var selEl=document.getElementById('vidTypeSel');if(!selEl)return;
  selEl.innerHTML='';
  for(var i=0;i<VIDEO_TYPES.length;i++){
    (function(t){
      var o=document.createElement('option');
      o.value=t.v;
      o.textContent=t.label+(t.pro?' (PRO)':'');
      if(t.pro&&!isPro)o.disabled=true;
      selEl.appendChild(o);
    })(VIDEO_TYPES[i]);
  }
  if(!isPro&&selectedVideoType!=='1')selectedVideoType='1';
  selEl.value=selectedVideoType;
  selEl.onchange=function(){
    var v=selEl.value;
    var meta=VIDEO_TYPES[parseInt(v,10)-1];
    if(meta&&meta.pro&&!isPro){showToastMsg('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။');selEl.value=selectedVideoType;return;}
    selectedVideoType=v;
  };
}

function apiCall(url,body){var s=document.getElementById('aiModelSel');if(s&&s.value)body.model=s.value;return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.detail||data.error||'Request failed');return data;});});}

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

// ===================== Typewriter + Auto Expand =====================
function stopTypewriter(){if(typewriterTimer){clearInterval(typewriterTimer);typewriterTimer=null;}}
function autoExpand(ta){if(!ta)return;ta.style.height='auto';ta.style.height=(ta.scrollHeight+2)+'px';}
function typewriteStory(text,ta){
  stopTypewriter();
  if(!ta)return;
  ta.value='';autoExpand(ta);
  var i=0,total=text.length;
  var step=Math.max(1,Math.round(total/150));
  typewriterTimer=setInterval(function(){
    i+=step;
    if(i>=total){ta.value=text;stopTypewriter();autoExpand(ta);currentStory=text;return;}
    ta.value=text.slice(0,i);
    autoExpand(ta);
  },18);
}
function onStoryEdit(){
  stopTypewriter();
  var ta=document.getElementById('storyResult');
  if(ta){currentStory=ta.value;autoExpand(ta);}
}

// ===================== Status Animation (Loading Steps 02/05) =====================
var statusTimers={};
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
  if(kind==='story'){
    if(/missing_idea/.test(m))return 'ဇာတ်လမ်းအကြောင်း အနည်းဆုံး ဖြည့်ရေးပါ။';
    if(/pro_only|feature_disabled/.test(m))return 'ဒီ Feature ကို ယခု အသုံးပြုခွင့် မရှိပါ။';
    if(/unauthorized|invalid_token/.test(m))return 'Login သက်တမ်း ကုန်သွားပါပြီ။ ပြန် Login ဝင်ပါ။';
    if(/fetch|network|failed/i.test(m))return '⚠️ ဇာတ်လမ်းရေးသား၍ မရပါ။\\nAI Server မှ တုံ့ပြန်မှု မရရှိပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
    return '⚠️ ဇာတ်လမ်းရေးသား၍ မရပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
  }
  if(kind==='video'){
    if(/missing_idea/.test(m))return 'ဇာတ်လမ်း ထည့်ရန် လိုအပ်ပါသည် — Step 03 မှာ ဇာတ်လမ်းရေးပြီးမှ ဆက်လုပ်ပါ။';
    if(/pro_only|feature_disabled/.test(m))return 'ဒီ Feature ကို ယခု အသုံးပြုခွင့် မရှိပါ။';
    if(/unauthorized|invalid_token/.test(m))return 'Login သက်တမ်း ကုန်သွားပါပြီ။ ပြန် Login ဝင်ပါ။';
    if(/fetch|network|failed/i.test(m))return '⚠️ Video ဇာတ်လမ်း ပြင်ဆင်၍ မရပါ။\\nAI Server မှ တုံ့ပြန်မှု မရရှိပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
    return '⚠️ Video ဇာတ်လမ်း ပြင်ဆင်၍ မရပါ။\\nScene များကို ခွဲခြားရာတွင် အခက်အခဲ ဖြစ်ပေါ်ခဲ့ပါသည်။';
  }
  if(kind==='image'){
    if(/fetch|network|failed/i.test(m))return '⚠️ ရုပ်ပုံ ဖန်တီး၍ မရပါ။\\nAI Server မှ တုံ့ပြန်မှု မရရှိပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
    return '⚠️ ရုပ်ပုံ ဖန်တီး၍ မရပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
  }
  return '⚠️ လုပ်ဆောင်၍ မရပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
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
function showToastMsg(msg){var t=document.getElementById('toast');t.textContent=msg||'&#9989; ကူးယူပြီးပါပြီ';t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2500);}
function escapeHtml(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function copyToClipboard(text){
  if(!text){showToastMsg('Text မရှိပါ');return;}
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg();}
}

// ===================== Step 01 → 02 → 03 (Story Generate) =====================
function generateStory(){
  if(storyBusy)return;
  var collected=collectIdeaText();
  if(!collected.valid){showError('genError','ဇာတ်လမ်းအကြောင်း အနည်းဆုံး ဖြည့်ရေးပါ');return;}
  var stMeta=STORY_TYPES[parseInt(selectedStoryType,10)-1];
  if(stMeta&&stMeta.pro&&!isPro){showToastMsg('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။');return;}
  var idea=collected.text;
  hideError('genError');hideStepError('genError2','genRetry2');
  storyBusy=true;
  currentStory='';
  if(window.studioForceGoStep)window.studioForceGoStep(2);
  else window.studioGoStep(2);
  startStatusAnim('storyStatus');
  if(window.studioSetLoading)window.studioSetLoading({on:true});
  var byok=document.getElementById('byokInput')?document.getElementById('byokInput').value.trim():'';
  var body={idea:idea,type:selectedStoryType};
  if(byok)body.apiKey=byok;
  apiCall('/api/studio/story/generate',body)
    .then(function(data){
      currentStory=data.story||'';
      currentStoryIdea=idea;
      stopStatusAnim('storyStatus',true);
      if(window.studioSetLoading)window.studioSetLoading({on:false});
      studioMarkDone(1);studioMarkDone(2);
      document.getElementById('reviseHistory').innerHTML='';
      var ta=document.getElementById('storyResult');
      typewriteStory(currentStory,ta);
      storyBusy=false;
      if(window.studioForceGoStep)window.studioForceGoStep(3);
      else window.studioGoStep(3);
      showToastMsg('&#10004; ဇာတ်လမ်းရေးပြီးပါပြီ');
      autoSave();
    })
    .catch(function(err){
      console.error('Story Generate Error:', err);
      stopStatusAnim('storyStatus',false);
      if(window.studioSetLoading)window.studioSetLoading({on:false});
      storyBusy=false;
      showStepError('genError2','genRetry2',friendlyMsg(err,'story'));
      // Error → သက်ဆိုင်ရာ Input Step (01) သို့ Auto Back — Processing Step (02) ကို Done မသတ်မှတ်ရ
      if(window.studioUnmarkDone)window.studioUnmarkDone(2);
      showToastMsg('⚠️ '+(friendlyMsg(err,'story').replace(/\\n/g,' ')));
      if(window.studioForceGoStep)window.studioForceGoStep(1);
    });
}

// ===================== Revise (03) =====================
function reviseStory(){
  var instruction=document.getElementById('feedbackInput').value.trim();
  if(!instruction){showError('revError','ဘယ်လိုပြင်ချင်လဲ ရေးပါ');return;}
  if(!currentStory){showError('revError','အရင် Story ကို ဖန်တီးပါ');return;}
  hideError('revError');
  document.getElementById('revLoading').classList.add('show');
  document.getElementById('reviseBtn').disabled=true;
  addHistory('user',instruction);
  document.getElementById('feedbackInput').value='';
  var latestStory=document.getElementById('storyResult').value;
  var body={idea:currentStoryIdea,type:selectedStoryType,currentStory:latestStory,instruction:instruction};
  apiCall('/api/studio/story/revise',body)
    .then(function(data){
      currentStory=data.story||'';
      var ta=document.getElementById('storyResult');
      if(ta){ta.value=currentStory;autoExpand(ta);}
      addHistory('ai','ပြင်ဆင်ပြီးပါပြီ — အထက်က ဇာတ်လမ်းထဲမှာ ကြည့်ပါ');
      autoSave();
    })
    .catch(function(err){showError('revError',friendlyMsg(err,'story'));})
    .finally(function(){document.getElementById('revLoading').classList.remove('show');document.getElementById('reviseBtn').disabled=false;});
}
function addHistory(role,text){
  var div=document.createElement('div');div.className='revise-msg '+role;
  div.innerHTML='<div class="role">'+(role==='user'?'သင် (User)':'AI')+'</div>'+escapeHtml(text);
  document.getElementById('reviseHistory').appendChild(div);
  document.getElementById('reviseHistory').scrollTop=document.getElementById('reviseHistory').scrollHeight;
}
function focusRevise(){
  var r=document.getElementById('revise-section');
  if(r)r.scrollIntoView({behavior:'smooth',block:'center'});
  var f=document.getElementById('feedbackInput');
  if(f)f.focus();
}

// ===================== 03 → 04 (User နောက်ဆုံးပြင်ထားသော Story ကို ပို့သည်) =====================
function goToVideoForm(){
  var ta=document.getElementById('storyResult');
  stopTypewriter();
  if(ta)currentStory=ta.value;
  if(!currentStory||!currentStory.trim()){showToastMsg('ဗီဒီယို ဖန်တီးရန် ဇာတ်လမ်း မရှိသေးပါ');return;}
  stMarkDone(3);
  videoStarted=true;
  fillVideoStoryField();
  stSetMode('video');
  stGoForce(4);
  autoSave();
}
function fillVideoStoryField(){
  var ta=document.getElementById('videoStoryInput');
  if(!ta)return;
  ta.value=currentStory||'';
  autoExpand(ta);
}

// ===================== Step 04 → 05 → 06 (Video Plan) =====================
function generateVideoPlan(){
  if(planBusy)return;
  var story=document.getElementById('videoStoryInput').value.trim();
  if(!story){showError('planError','ဇာတ်လမ်း ထည့်ရန် လိုအပ်ပါသည် — Step 03 မှာ ဇာတ်လမ်းရေးပြီးမှ ဆက်လုပ်ပါ');return;}
  hideError('planError');hideStepError('planError5','planRetry5');
  planBusy=true;
  var btn=document.getElementById('videoPlanBtn');
  if(btn)btn.disabled=true;
  studioMarkDone(4);
  if(window.studioForceGoStep)window.studioForceGoStep(5);
  else window.studioGoStep(5);
  startStatusAnim('planStatus');
  if(window.studioSetLoading)window.studioSetLoading({on:true});
  var continuity=document.getElementById('vidContinuity');
  var body={
    story:story,
    type:selectedVideoType,
    videoType:sel('vidTypeSel'),
    duration:sel('vidDurationSel'),
    sceneDuration:sel('vidSceneSel'),
    aspectRatio:sel('vidRatioSel'),
    visualStyle:sel('vidStyleSel'),
    cameraStyle:sel('vidCamSel'),
    language:sel('vidLangSel'),
    environmentStyle:sel('vidEnvSel'),
    characterContinuity:(continuity&&continuity.checked)?'true':'false',
    additionalInstructions:document.getElementById('vidExtra')?document.getElementById('vidExtra').value.trim():''
  };
  apiCall('/api/studio/story/video',body)
    .then(function(data){
      currentScenes=data.scenes||[];
      currentCharacters=data.characters||[];
      stopStatusAnim('planStatus',true);
      if(window.studioSetLoading)window.studioSetLoading({on:false});
      studioMarkDone(4);studioMarkDone(5);
      planBusy=false;
      if(btn)btn.disabled=false;
      if(window.studioForceGoStep)window.studioForceGoStep(6);
      else window.studioGoStep(6);
      renderFinalResult();
      showToastMsg('&#10004; Video ဇာတ်လမ်း ပြင်ဆင်ပြီးပါပြီ');
      autoSave();
    })
    .catch(function(err){
      console.error('Story Video Plan Error:', err);
      stopStatusAnim('planStatus',false);
      if(window.studioSetLoading)window.studioSetLoading({on:false});
      planBusy=false;
      if(btn)btn.disabled=false;
      showStepError('planError5','planRetry5',friendlyMsg(err,'video'));
      // Error → သက်ဆိုင်ရာ Input / Setup Step (04) သို့ Auto Back — Processing Step (05) ကို Done မသတ်မှတ်ရ
      if(window.studioUnmarkDone)window.studioUnmarkDone(5);
      showToastMsg('⚠️ '+(friendlyMsg(err,'video').replace(/\\n/g,' ')));
      if(window.studioForceGoStep)window.studioForceGoStep(4);
    });
}

// ===================== Step 06 — Final Result (Characters + Scenes) =====================
function durText(d){
  if(d===undefined||d===null||d==='')return '';
  if(typeof d==='number')return d+' sec';
  var s=String(d).trim();
  return /sec/i.test(s)?s:(s+' sec');
}
function resolveSceneCharacters(idx){
  var s=currentScenes[idx];if(!s)return '-';
  var ids=(s.characterIds&&s.characterIds.length)?s.characterIds:(Array.isArray(s.characters)?s.characters:[]);
  if(!ids.length)return '-';
  var names=[];
  for(var i=0;i<ids.length;i++){
    var id=ids[i],found=null;
    for(var k=0;k<currentCharacters.length;k++){
      if(currentCharacters[k].id===id||currentCharacters[k].name===id){found=currentCharacters[k];break;}
    }
    names.push(found?(found.name||id):id);
  }
  return names.join(', ');
}
function renderFinalResult(){
  var c=document.getElementById('finalResult');if(!c)return;
  var html='';
  if(currentCharacters&&currentCharacters.length){
    html+='<div class="card"><div class="card-title">&#127934; ဇာတ်ကောင်များ (Characters)</div>';
    for(var i=0;i<currentCharacters.length;i++){
      (function(idx){
        var ch=currentCharacters[idx]||{};
        var prompt=ch.characterPrompt||ch.prompt||'(မရှိပါ)';
        var img=imgCache['char_'+idx]||ch.referenceImage||'';
        html+='<div class="final-char-card">';
        html+='<div class="final-char-head"><span class="final-char-name">&#128100; '+escapeHtml(ch.name||'Character '+(idx+1))+'</span><span class="final-char-id">'+escapeHtml(ch.id||('char_'+String(idx+1).padStart(2,'0')))+'</span></div>';
        var meta='';
        if(ch.age)meta+='<div>&#127875; အသက် '+escapeHtml(ch.age)+'</div>';
        if(ch.role)meta+='<div>&#127917; Role: '+escapeHtml(ch.role)+'</div>';
        if(ch.description)meta+='<div>&#128221; '+escapeHtml(ch.description)+'</div>';
        if(meta)html+='<div class="final-char-meta">'+meta+'</div>';
        html+='<div class="final-char-img" id="charImg_'+idx+'">'+(img?'<img class="aics-pv-img" src="'+img+'">':'<div class="empty-note">ရုပ်ပုံ မရှိသေးပါ</div>')+'</div>';
        html+='<div class="final-prompt-label">Character Reference Prompt</div>';
        html+='<div class="final-prompt-text">'+escapeHtml(prompt)+'</div>';
        html+='<div class="btn-row"><button class="btn-ghost" onclick="copyCharPrompt('+idx+')">&#128203; Copy Prompt</button><button class="btn-ghost" onclick="generateCharImage('+idx+')">&#127912; Character Image ဖန်တီးရန်</button></div>';
        html+='</div>';
      })(i);
    }
    html+='</div>';
  }
  if(currentScenes&&currentScenes.length){
    html+='<div class="card"><div class="card-title">&#127916; ဇာတ်လမ်းမြင်ကွင်းများ (Story Scenes)</div>';
    for(var j=0;j<currentScenes.length;j++){
      (function(idx){
        var s=currentScenes[idx]||{};
        var num=String(s.number||(idx+1));
        var title=s.title?(' — '+escapeHtml(s.title)):'';
        html+='<div class="final-scene-card">';
        html+='<div class="final-scene-title">&#127916; SCENE '+num+title+'</div>';
        html+='<div class="final-scene-box"><div class="final-box-label">&#127916; Video Prompt</div><div class="final-prompt-text">'+escapeHtml(s.videoPrompt||'(မရှိပါ)')+'</div><div class="btn-row"><button class="btn-ghost" onclick="copyVideoPrompt('+idx+')">&#128203; Copy Video Prompt</button></div></div>';
        html+='<div class="final-scene-box"><div class="final-box-label">&#127757; Environment Reference</div><div class="final-prompt-text">'+escapeHtml(s.environmentPrompt||'(မရှိပါ)')+'</div>';
        html+='<div class="scene-image-area" id="envImg_'+idx+'">'+(imgCache['env_'+idx]?'<img src="'+imgCache['env_'+idx]+'">':'<button class="btn btn-orange" style="font-size:12px;padding:8px 14px;min-height:36px;" onclick="generateEnvImage('+idx+')">&#127912; Environment Image ဖန်တီးပါ</button>')+'</div>';
        html+='<div class="btn-row"><button class="btn-ghost" onclick="copyEnvPrompt('+idx+')">&#128203; Copy Environment Prompt</button></div></div>';
        html+='<div class="final-scene-meta"><span>&#128100; Characters: '+escapeHtml(resolveSceneCharacters(idx))+'</span><span>&#9201; '+escapeHtml(durText(s.duration))+'</span></div>';
        html+='</div>';
      })(j);
    }
    html+='</div>';
  }
  if(!html)html='<div class="card"><div class="empty-note">ရလဒ် မရှိသေးပါ — Step 04 မှာ Video ဇာတ်လမ်း ဖန်တီးပါ</div></div>';
  c.innerHTML=html;
}

// ===================== Copy / Save / Export =====================
function copyStory(){
  var text=document.getElementById('storyResult').value;
  if(!text){showToastMsg('Copy လုပ်ဖို့ Result မရှိသေးပါ');return;}
  copyToClipboard(text);
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
function copyCharPrompt(idx){
  if(!currentCharacters[idx])return;
  copyToClipboard(currentCharacters[idx].characterPrompt||currentCharacters[idx].prompt||'');
}
function copyVideoPrompt(idx){if(!currentScenes[idx])return;copyToClipboard(currentScenes[idx].videoPrompt||'');}
function copyEnvPrompt(idx){if(!currentScenes[idx])return;copyToClipboard(currentScenes[idx].environmentPrompt||'');}

// ===================== Image Generation (Character / Environment) =====================
function generateCharImage(idx){
  if(!currentCharacters[idx])return;
  var prompt=currentCharacters[idx].characterPrompt||currentCharacters[idx].prompt||'';
  if(!prompt){showToastMsg('Prompt မရှိပါ');return;}
  var area=document.getElementById('charImg_'+idx);
  if(area)area.innerHTML='<div style="display:flex;align-items:center;gap:8px;justify-content:center;padding:14px;"><div class="spinner"></div><span style="font-size:13px;color:var(--cyan);">ရုပ်ပုံ ဖန်တီးနေပါသည်...</span></div>';
  apiCall('/api/studio/story/video-image',{prompt:prompt})
    .then(function(data){
      if(data.data){
        var src='data:'+(data.mimeType||'image/png')+';base64,'+data.data;
        imgCache['char_'+idx]=src;
        currentCharacters[idx].referenceImage=src;
        if(area)area.innerHTML='<img class="aics-pv-img" src="'+src+'"><div style="margin-top:8px;"><a href="'+src+'" download="story_character_'+(idx+1)+'.png"><button class="btn-ghost">&#128190; Save Image</button></a></div>';
        autoSave();autoSaveImgCache();
      }else{if(area)area.innerHTML='<div class="empty-note">ရုပ်ပုံ မထွက်ပါ — ထပ်စမ်းပါ</div>';}
    })
    .catch(function(err){if(area)area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">'+escapeHtml(friendlyMsg(err,'image'))+'</div><div style="text-align:center;margin-top:4px;"><button class="btn-ghost" onclick="generateCharImage('+idx+')">&#8635; ထပ်စမ်းပါ</button></div>';});
}
function generateEnvImage(idx){
  if(!currentScenes[idx]||!currentScenes[idx].environmentPrompt){showToastMsg('Prompt မရှိပါ');return;}
  var area=document.getElementById('envImg_'+idx);
  if(area)area.innerHTML='<div style="display:flex;align-items:center;gap:8px;justify-content:center;padding:12px;"><div class="spinner"></div><span style="font-size:13px;color:var(--cyan);">ရုပ်ပုံ ဖန်တီးနေပါသည်...</span></div>';
  apiCall('/api/studio/story/video-image',{prompt:currentScenes[idx].environmentPrompt})
    .then(function(data){
      if(data.data){
        var src='data:'+(data.mimeType||'image/png')+';base64,'+data.data;
        imgCache['env_'+idx]=src;
        if(area)area.innerHTML='<img src="'+src+'"><div style="margin-top:8px;"><a href="'+src+'" download="story_scene_'+(idx+1)+'_env.png"><button class="btn-ghost">&#128190; Save Image</button></a></div>';
        autoSave();autoSaveImgCache();
      }else{if(area)area.innerHTML='<div class="empty-note">ရုပ်ပုံ မထွက်ပါ — ထပ်စမ်းပါ</div>';}
    })
    .catch(function(err){if(area)area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">'+escapeHtml(friendlyMsg(err,'image'))+'</div><div style="text-align:center;margin-top:4px;"><button class="btn-ghost" onclick="generateEnvImage('+idx+')">&#8635; ထပ်စမ်းပါ</button></div>';});
}

// ===================== Result Text / Export =====================
function buildResultText(){
  var parts=[];
  if(currentStory&&currentStory.trim())parts.push('STORY\\n======================\\n'+currentStory);
  if(currentCharacters&&currentCharacters.length){
    var cp='CHARACTER REFERENCE PROMPTS\\n======================\\n';
    for(var i=0;i<currentCharacters.length;i++){
      var ch=currentCharacters[i];
      cp+='\\nCHARACTER '+(i+1)+'\\nID: '+(ch.id||'-')+'\\nName: '+(ch.name||'-')+'\\nRole: '+(ch.role||'-')+(ch.age?'\\nAge: '+ch.age:'')+(ch.description?'\\nDescription: '+ch.description:'')+'\\nPrompt: '+(ch.characterPrompt||ch.prompt||'-');
    }
    parts.push(cp);
  }
  if(currentScenes&&currentScenes.length){
    var sp='SCENE PROMPTS (Environment & Video)\\n======================\\n';
    for(var j=0;j<currentScenes.length;j++){
      var sc=currentScenes[j];
      sp+='\\nSCENE '+(sc.number||(j+1))+(sc.title?' — '+sc.title:'')+'\\nCharacters: '+resolveSceneCharacters(j)+'\\nDuration: '+durText(sc.duration)+'\\nEnvironment: '+(sc.environmentPrompt||'-')+'\\nVideo: '+(sc.videoPrompt||'-');
    }
    parts.push(sp);
  }
  return parts.join('\\n\\n');
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
  AICS_CREATIONS.save({studio:'STORY',type:selectedVideoType,title:title||defaultTitle,original_prompt:currentStoryIdea,ai_output:text})
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

// ===================== Stepper Actions =====================
function bReset(){return {label:'Reset',cls:'ghost',fn:studioReset};}
function studioOnStep(n){
  if(n===1){
    studioSetActions([bReset(),{label:'&#10024; Generate Story',cls:'primary',fn:generateStory}]);
  }else if(n===2){
    studioSetActions([]);
  }else if(n===3){
    studioSetActions([
      {label:'&#8592; Back',cls:'ghost',fn:function(){window.studioGoStep(1);}},
      bReset(),
      {label:'&#128203; Copy Story',cls:'secondary',fn:copyStory},
      {label:'&#128190; ဖန်တီးမှုသိမ်းပါ',cls:'purple',fn:saveStory},
      {label:'&#128203; Copy All',cls:'secondary',fn:copyAllResult},
      {label:'&#128190; ဖန်တီးမှုအားလုံးသိမ်း',cls:'purple',fn:saveAllResult}
    ]);
    var ta=document.getElementById('storyResult');
    if(ta)autoExpand(ta);
  }else if(n===4){
    fillVideoStoryField();
    var pb=document.getElementById('videoPlanBtn');
    if(pb)pb.disabled=false;
    studioSetActions([
      {label:'&#8592; Content ရလဒ်သို့ ပြန်ရန်',cls:'ghost',fn:function(){stSetMode('main');stGoForce(3);}},
      bReset()
    ]);
  }else if(n===5){
    studioSetActions([]);
  }else if(n===6){
    studioSetActions([
      {label:'&#8592; Back',cls:'ghost',fn:function(){window.studioGoStep(4);}},
      {label:'&#128203; Copy All',cls:'secondary',fn:copyAllResult},
      {label:'&#128190; ဖန်တီးမှုအားလုံးသိမ်း',cls:'purple',fn:saveAllResult}
    ]);
    renderFinalResult();
  }
}
window.studioOnStep=studioOnStep;

// ===================== Draft (studioCollectDraft / studioRestoreDraft) =====================
function studioCollectDraft(){
  var fields={};
  for(var i=0;i<FIELD_CONFIG.length;i++){var f=document.getElementById('field_'+i);fields[i]=f?f.value:'';}
  return {
    stepNow:window.studioCur?window.studioCur():1,
    mode:ST_MODE,
    storyType:selectedStoryType,
    videoType:selectedVideoType,
    aud:(document.getElementById('audSel')?document.getElementById('audSel').value:''),
    tone:document.getElementById('toneSel')?document.getElementById('toneSel').value:'',
    lang:document.getElementById('langSel')?document.getElementById('langSel').value:'',
    fields:fields,
    story:currentStory,
    storyIdea:currentStoryIdea,
    videoStarted:videoStarted,
    videoForm:{
      story:document.getElementById('videoStoryInput')?document.getElementById('videoStoryInput').value:'',
      videoType:selectedVideoType,
      duration:sel('vidDurationSel'),
      sceneDuration:sel('vidSceneSel'),
      aspectRatio:sel('vidRatioSel'),
      visualStyle:sel('vidStyleSel'),
      cameraStyle:sel('vidCamSel'),
      language:sel('vidLangSel'),
      environmentStyle:sel('vidEnvSel'),
      characterContinuity:document.getElementById('vidContinuity')?document.getElementById('vidContinuity').checked:true,
      additionalInstructions:document.getElementById('vidExtra')?document.getElementById('vidExtra').value:''
    },
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
  videoStarted=!!d.videoStarted;
  document.getElementById('storyResult').value=currentStory;
  if(d.videoForm){
    var vf=d.videoForm;
    var vs=document.getElementById('videoStoryInput');if(vs){vs.value=vf.story||currentStory;autoExpand(vs);}
    var vt=document.getElementById('vidTypeSel');
    if(vt){vt.value=(!isPro&&vf.videoType&&vf.videoType!=='1')?'1':(vf.videoType||'1');selectedVideoType=vt.value||'1';}
    var setf=function(id,v){var e=document.getElementById(id);if(e&&v)e.value=v;};
    setf('vidDurationSel',vf.duration);setf('vidSceneSel',vf.sceneDuration);setf('vidRatioSel',vf.aspectRatio);
    setf('vidStyleSel',vf.visualStyle);setf('vidCamSel',vf.cameraStyle);setf('vidLangSel',vf.language);
    setf('vidEnvSel',vf.environmentStyle);
    var cc=document.getElementById('vidContinuity');if(cc)cc.checked=vf.characterContinuity!==false;
    var ve=document.getElementById('vidExtra');if(ve)ve.value=vf.additionalInstructions||'';
  }
  currentCharacters=d.characters||[];
  currentScenes=d.scenes||[];
  var was=d.stepNow||1;
  if(currentStory){studioMarkDone(1);studioMarkDone(2);}
  if((videoStarted||was>=4)&&currentStory){studioMarkDone(3);}
  if(currentCharacters.length||currentScenes.length){studioMarkDone(4);studioMarkDone(5);}
  if(currentScenes.length||currentCharacters.length)renderFinalResult();
  // Restore mode (main vs video branch)
  if(d.mode==='video'&&(videoStarted||was>=4)&&currentStory){ST_MODE='video';}
  // Resolve target step
  var target=was;
  var tm=stMeta(target);
  if(!tm||tm.lock||!stAllowed(target)){
    var steps=stModeSteps();
    target=steps[steps.length-1].n;
    if(stMeta(target).lock)target=steps[steps.length-2].n;
    if(!stAllowed(target))target=1;
  }
  stCur=target;
  stShow(target);
}
window.studioRestoreDraft=studioRestoreDraft;

// ===================== Auto Save (Refresh ပြီးနောက် Data မပျောက်စေရ) =====================
function autoSave(){
  try{
    var data=studioCollectDraft();
    localStorage.setItem('aics_draft_story',JSON.stringify({step:window.studioCur?window.studioCur():1,data:data,savedAt:new Date().toISOString()}));
  }catch(e){}
}
function autoSaveImgCache(){
  try{localStorage.setItem('aics_draft_story_imgcache',JSON.stringify(imgCache));}catch(e){}
}

// ============================================================
// Branch Stepper State Machine (Content Studio ပုံစံ — Main + Video Branch)
// Main: 1,2,3 | Video Branch: 4,5,6
// Shell ၏ stepper ကို boot ပြီးမှ ကိုယ်ပိုင် render နှင့် mode-switch ထပ်ဆောက်သည်
// ============================================================
var ST_MODE='main';
var stCur=1;
var stDone={};
var ST_STEPS={
  main:[
    { n:1, label:'01 ဇာတ်လမ်းအချက်အလက်' },
    { n:2, label:'02 AI ရေးသားနေသည်', lock:true, loading:'ဇာတ်လမ်းရေးသားနေသည်...' },
    { n:3, label:'03 ဇာတ်လမ်းရလဒ်', req:[2] }
  ],
  video:[
    { n:4, label:'01 Video ပြင်ဆင်ရန်', req:[3] },
    { n:5, label:'02 AI ပြင်ဆင်နေသည်', lock:true, req:[4], loading:'Video ပြင်ဆင်နေသည်...' },
    { n:6, label:'03 နောက်ဆုံးရလဒ်', req:[5] }
  ]
};
function stMeta(n){
  var modes=['main','video'];
  for(var m=0;m<modes.length;m++){var s=ST_STEPS[modes[m]];for(var i=0;i<s.length;i++)if(s[i].n===n)return s[i];}
  return null;
}
function stModeSteps(){return ST_STEPS[ST_MODE]||ST_STEPS.main;}
// Main + Branch = Stepper တစ်ခုတည်း — Branch ဝင်လျှင် Main steps ကို မဖျောက်ဘဲ ဆက်ပေါင်းပြသည်
function stVisibleSteps(){
  var main=ST_STEPS.main||[];
  if(ST_MODE==='main'||!ST_STEPS[ST_MODE])return main.slice();
  return main.concat(ST_STEPS[ST_MODE]);
}
function stAllowed(n){
  if(stDone[n])return true;
  var m=stMeta(n);if(!m)return false;
  var req=m.req||[];
  if(req.length===0)return true;
  for(var i=0;i<req.length;i++)if(!stDone[req[i]])return false;
  return true;
}
function stNav(n){
  var m=stMeta(n);if(!m)return;
  if(m.lock){showToastMsg('ဤအဆင့်သည် AI ဆောင်ရွက်နေချိန် အဆင့်ဖြစ်ပြီး ကိုယ်တိုင် ရွေးချယ်၍ မရပါ');return;}
  if(!stAllowed(n)){showToastMsg('အရင်အဆင့်များ ပြီးမှ ဤအဆင့်သို့ ဆက်သွားနိုင်ပါသည်');return;}
  stGoForce(n);
}
function stGoForce(n){stCur=n;stShow(n);}
function stMarkDone(n){stDone[n]=true;stUpdateStepper();}
function stUnmarkDone(n){stDone[n]=false;stUpdateStepper();}
function stShow(n){
  var steps=document.querySelectorAll('.aics-step');
  for(var i=0;i<steps.length;i++){
    var ds=steps[i].getAttribute('data-step');
    steps[i].classList.toggle('active',parseInt(ds,10)===n);
  }
  var w=document.getElementById('aicsWork');if(w)w.scrollTop=0;
  stUpdateStepper();
  if(window.studioOnStep){try{window.studioOnStep(n);}catch(e){}}
}
function stUpdateStepper(){
  var btns=document.querySelectorAll('.aics-step-btn');
  for(var i=0;i<btns.length;i++){
    var n=parseInt(btns[i].getAttribute('data-step'),10);
    var m=stMeta(n);
    btns[i].classList.remove('active','done','todo');
    if(n===stCur)btns[i].classList.add('active');
    else if(stDone[n])btns[i].classList.add('done');
    else if(!stAllowed(n)||(m&&m.lock))btns[i].classList.add('todo');
  }
  if(window.studioScrollActiveStep)window.studioScrollActiveStep(true);
}
function stRenderStepper(){
  var c=document.getElementById('aicsStepper');if(!c)return;
  var steps=stVisibleSteps();
  var html='<div class="aics-stepper-inner">';
  for(var i=0;i<steps.length;i++){
    var s=steps[i];
    var label=((i+1<10)?'0':'')+(i+1)+' '+String(s.label).replace(/^\\d+\\s*/,'');
    html+='<button class="aics-step-btn" data-step="'+s.n+'" onclick="stNav('+s.n+')">'+
      '<span class="aics-step-txt"><span class="aics-step-label">'+label+'</span></span>'+
      '<span class="aics-step-loading"><span class="aics-step-spinner"></span>'+(s.loading||'ဖန်တီးနေသည်...')+'</span></button>';
    if(i<steps.length-1)html+='<span class="aics-step-link"></span>';
  }
  html+='</div>';
  c.innerHTML=html;
  stUpdateStepper();
}
function stSetMode(mode){ST_MODE=mode;stRenderStepper();}
// Shell globals များကို mode-aware versions နဲ့ override
window.studioGoStep=stNav;
window.studioForceGoStep=stGoForce;
window.studioMarkDone=stMarkDone;
window.studioUnmarkDone=stUnmarkDone;
window.studioCur=function(){return stCur;};
// Boot — Shell ပြီးမှ Stepper ကို ကိုယ်ပိုင် Branch Stepper ဖြင့် ပြန်ဆောက်သည်
function stBoot(){
  stRenderStepper();
  stShow(stCur);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',stBoot);
else stBoot();
</script>
</body>
</html>`;
