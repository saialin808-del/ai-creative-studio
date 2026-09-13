// AI Creative Studio — Short Studio Frontend (Workflow 01→06)
// Workflow: 01 Short အချက်အလက် → 02 AI ရေးသားနေသည် → 03 Short Script ရလဒ်
//           → 04 Short Video ဖန်တီးရန် → 05 AI ပြင်ဆင်နေသည် → 06 MAP / ရလဒ်
// Studio Isolation: ဤ File သည် Short Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Story Studio ၏ State/Data/API/Result ကို တိုက်ရိုက်မသုံးပါ — Short-specific သီးခြားထားသည်။
// Shared: renderSidebar / sidebarScript / renderStudioShell (frontend/shared.js) — မျှဝေသုံးသော UI အခွံသာ။
// ⚠️ API Contract ကို မပျက်စီးစေရ — /api/studio/short/{generate,revise,video,video-image} ကို ဆက်ထိန်းသည်။

import { renderSidebar, sidebarScript, renderStudioShell } from './shared.js';

const STEPS = [
  { label: '01 Short အချက်အလက်' },
  { label: '02 AI ရေးသားနေသည်', lock: true },
  { label: '03 Short Script ရလဒ်', req: [2] },
  { label: '04 Short Video ပြင်ဆင်ရန်', req: [3] },
  { label: '05 AI ပြင်ဆင်နေသည်', lock: true, req: [4] },
  { label: '06 MAP / နောက်ဆုံးရလဒ်', req: [5] },
];

const STEP1_HTML = `
<div class="aics-step" data-step="1">
<div class="card">
<div class="card-title">&#128221;&#65039; Short အချက်အလက် ဖြည့်ရန်</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">Short Video / Short Content ရေးသားရန် လိုအပ်သော အချက်အလက်များကို အောက်တွင် ဖြည့်ပါ — Generate နှိပ်လိုက်ရင် AI က Short Script ရေးပေးပါမယ်။</p>
<div class="form-row">
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>Short Type</label>
<select id="shortTypeSel"></select>
</div>
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>Duration</label>
<select id="durSel"></select>
</div>
</div>
<div class="form-row">
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>Tone</label>
<select id="toneSel"></select>
</div>
<div class="form-group" style="flex:1;min-width:170px;margin-bottom:0;">
<label>Language</label>
<select id="langSel"></select>
</div>
</div>
<div class="form-group">
<label>Topic / Idea *</label>
<textarea id="field_0" placeholder="ဥပမာ — မြန်မာပြည်ရဲ့ လက်ဖက်ရည်ဆိုင်ယဉ်ကျေးမှု အကြောင်း 30 စက္ကန့် Short..." style="min-height:110px;resize:vertical;"></textarea>
</div>
<div class="form-group">
<label>Target Audience</label>
<input type="text" id="audInput" placeholder="ဥပမာ — လူငယ်များ / Gen Z / စီးပွားရေးလုပ်ငန်းရှင်များ">
</div>
<div class="form-group">
<label>Main Message</label>
<textarea id="mainMsg" placeholder="ဥပမာ — ရိုးရာလက်ဖက်ရည်ဆိုင်က မြန်မာလူမှုဘဝရဲ့ နွေးထွေးမှုကို ဖော်ပြသည်" style="min-height:70px;"></textarea>
</div>
<div class="form-group">
<label>Additional Instructions</label>
<textarea id="extraInstr" placeholder="ဥပမာ — စိတ်ခံစားချက်ကို ပိုဖော်ပြပါ / အဆုံးမှာ Follow လုပ်ဖို့ တိုက်တွန်းပါ" style="min-height:70px;"></textarea>
</div>
<button type="button" id="advToggle" onclick="toggleAdvFields()" style="width:100%;padding:11px;border-radius:14px;background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.25);color:#00e5ff;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:12px;"><span>အပိုဆောင်းသတ်မှတ်ချက် (Advanced Options) ▼</span></button>
<div id="advFields" class="adv-grid" style="display:none;">
<div class="form-group"><label>Hook</label><textarea id="advHook" placeholder="ဥပမာ — "ဒီနေ့ မင်းတို့ကို မြန်မာတစ်ပြည်လုံး ချစ်တဲ့ လက်ဖက်ရည်ဆိုင် ပြပေးမယ်"" style="min-height:60px;"></textarea></div>
<div class="form-group"><label>Call To Action</label><textarea id="advCta" placeholder="ဥပမာ — Follow + Like နှိပ်ဖို့ မမေ့နဲ့နော်" style="min-height:60px;"></textarea></div>
<div class="form-group"><label>Character Information</label><textarea id="advCharInfo" placeholder="ဥပမာ — အသက် ၄၅ နှစ် ဆိုင်ရှင် ဦးဘ" style="min-height:60px;"></textarea></div>
<div class="form-group"><label>Location</label><input type="text" id="advLocation" placeholder="ဥပမာ — ရန်ကုန် / ကျေးရွာ"></div>
<div class="form-group"><label>Visual Style</label><input type="text" id="advVisualStyle" placeholder="ဥပမာ — Warm Tone / Cinematic"></div>
<div class="form-group"><label>Ending Style</label><input type="text" id="advEnding" placeholder="ဥပမာ — ပြုံးရွှင်သော အဆုံးသတ်"></div>
</div>
<div class="error-box" id="genError"></div>
</div>
</div>`;

const STEP2_HTML = `
<div class="aics-step" data-step="2">
<div class="card">
<div class="loading-card">
<div class="spinner"></div>
<div class="loading-title">&#10024; AI ရေးသားနေသည်...</div>
<div class="status-list" id="shortStatus">
<div class="st-line" data-idx="0"><span class="st-marker">○</span><span>အချက်အလက်များကို ဖတ်နေသည်</span></div>
<div class="st-line" data-idx="1"><span class="st-marker">○</span><span>Short Structure ပြင်ဆင်နေသည်</span></div>
<div class="st-line" data-idx="2"><span class="st-marker">○</span><span>Script ရေးသားနေသည်</span></div>
<div class="st-line" data-idx="3"><span class="st-marker">○</span><span>Script ကို စစ်ဆေးနေသည်</span></div>
</div>
<div class="error-box" id="genError2"></div>
<div class="retry-row" id="genRetry2"><button class="btn btn-secondary" onclick="generateShort()">&#8635; ပြန်ကြိုးစားရန်</button></div>
</div>
</div>
</div>`;

const STEP3_HTML = `
<div class="aics-step" data-step="3">
<div class="card">
<div class="card-title">&#128241; Short Script ရလဒ်</div>
<textarea class="result-textarea" id="shortResult" placeholder="Short Script ဒီနေရာမှာ ပေါ်လာပါမယ်..." oninput="onShortEdit()"></textarea>
<p style="color:var(--text3);font-size:12px;margin-top:6px;font-style:italic;">&#9997;&#65039; ဒီနေရာမှာ တိုက်ရိုက် နှိပ်ပြီး ကိုယ်တိုင် ပြင်ဆင်နိုင်ပါတယ် — ပြင်ထားတဲ့ Script ကို "Final Short Script" အဖြစ် Video အဆင့်ကို အလိုအလျောက် ပို့ပေးပါမယ်</p>
<div class="btn-row">
<button class="btn btn-success" onclick="copyShort()">&#128203; Copy Short</button>
<button class="btn btn-purple" onclick="saveShort()">&#128190; ဖန်တီးမှုသိမ်းပါ</button>
<button class="btn btn-secondary" onclick="focusRevise()">&#9999;&#65039; ပြန်ပြင်ရန်</button>
<button class="btn btn-primary" onclick="goToVideoForm()">&#127916; Video ဆက်ဖန်တီးရန်</button>
</div>
</div>
<div class="card revise-section" id="revise-section">
<div class="card-title">&#129302; AI ကို ဆက်ညွှန်ကြားရန် (Revise)</div>
<div class="revise-history" id="reviseHistory"></div>
<div class="revise-input-row">
<textarea id="feedbackInput" placeholder="ဥပမာ — Hook ကို ပိုပြင်းထန်အောင် ပြင်ပေးပါ" onkeypress="if(event.key==='Enter'){reviseShort();}"></textarea>
<button class="btn btn-secondary" id="reviseBtn" onclick="reviseShort()">&#128260; ပြင်ပါ</button>
</div>
<div class="loading" id="revLoading"><div class="spinner"></div> ပြင်ဆင်နေပါသည်...</div>
<div class="error-box" id="revError"></div>
</div>
</div>`;

const STEP4_HTML = `
<div class="aics-step" data-step="4">
<div class="card">
<div class="card-title">&#127916; Short Video ဖန်တီးရန်</div>
<p style="color:var(--text2);font-size:13px;margin-bottom:14px;">Step 03 မှာ ရရှိထားသော Final Short Script ကို အလိုအလျောက် ထည့်ပေးထားပါသည် — Video အတွက် ဆက်တင်များရွေးပြီး ဖန်တီးပါ။</p>
<div class="form-group">
<label>&#128241; အသုံးပြုမည့် Short Script</label>
<textarea id="videoScriptInput" style="min-height:150px;" oninput="autoExpand(this)"></textarea>
</div>
<div class="vf-grid">
<div class="form-group"><label>Video Style</label><select id="vidStyleSel"></select></div>
<div class="form-group"><label>Aspect Ratio</label><select id="vidRatioSel"></select></div>
<div class="form-group"><label>Duration</label><select id="vidDurationSel"></select></div>
<div class="form-group"><label>Scene Duration</label><select id="vidSceneSel"></select></div>
<div class="form-group"><label>Visual Style</label><select id="vidVisualSel"></select></div>
<div class="form-group"><label>Camera Style</label><select id="vidCamSel"></select></div>
<div class="form-group"><label>Language</label><select id="vidLangSel"></select></div>
</div>
<label style="display:flex;align-items:center;gap:8px;margin:2px 0 16px;cursor:pointer;color:var(--text2);">
<input type="checkbox" id="vidContinuity" checked style="width:18px;height:18px;flex-shrink:0;accent-color:var(--cyan);"> &#10004; Maintain Same Character (Character Continuity)
</label>
<div class="form-group">
<label>Additional Instructions</label>
<textarea id="vidExtra" placeholder="ဥပမာ — နောက်ဆုံး Scene မှာ Logo ပြပါ / Background Music အရှိန်မြှင့်ပါ..." style="min-height:80px;"></textarea>
</div>
<div class="ref-upload-area">
<label>&#128444;&#65039; Reference ပုံများ ပူးတွဲရန် (ချန်ထားလို့ရသည်)</label>
<input type="file" id="refImageInput" accept="image/*" multiple onchange="onRefImageSelected()">
<p class="ref-hint">အများဆုံး ၅ ပုံအထိ Upload တင်နိုင်ပါတယ် (ပုံတစ်ပုံချင်းစီ Max 5MB) — Character/Scene ပုံများ တင်ထားရင် AI က ထိုပုံများကို ကိုးကားပြီး ဒီပုံနှင့် ကိုက်ညီသော Reference Prompt ရေးပေးပါမယ်။</p>
<div class="ref-preview" id="refPreview"></div>
</div>
<div class="error-box" id="planError"></div>
<div class="btn-row" style="margin-top:14px;">
<button class="btn btn-primary" id="shortVideoBtn" onclick="generateShortVideoPlan()" style="flex:1;">&#127916; Short Video ဖန်တီးရန်</button>
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
<div class="st-line" data-idx="0"><span class="st-marker">○</span><span>Short Script ကို ဖတ်ပြီးပါပြီ</span></div>
<div class="st-line" data-idx="1"><span class="st-marker">○</span><span>ဇာတ်ကောင်များကို ရှာဖွေနေသည်</span></div>
<div class="st-line" data-idx="2"><span class="st-marker">○</span><span>Scene များ ခွဲခြားနေသည်</span></div>
<div class="st-line" data-idx="3"><span class="st-marker">○</span><span>Character Reference ပြင်ဆင်နေသည်</span></div>
<div class="st-line" data-idx="4"><span class="st-marker">○</span><span>Environment Reference ပြင်ဆင်နေသည်</span></div>
<div class="st-line" data-idx="5"><span class="st-marker">○</span><span>Video Prompt များ ရေးသားနေသည်</span></div>
</div>
<div class="error-box" id="planError5"></div>
<div class="retry-row" id="planRetry5"><button class="btn btn-secondary" onclick="generateShortVideoPlan()">&#8635; ပြန်ကြိုးစားရန်</button></div>
</div>
</div>
</div>`;

const STEP6_HTML = `
<div class="aics-step" data-step="6">
<div id="finalResult"></div>
</div>`;

const CONTENT_HTML = STEP1_HTML + STEP2_HTML + STEP3_HTML + STEP4_HTML + STEP5_HTML + STEP6_HTML;

export const SHORT_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Short Studio — AI Creative Studio</title>
<style>
:root{--bg:#080c18;--bg-card:#0d1424;--bg-card2:#111a2e;--bg-input:#0a1020;--border:rgba(0,229,255,0.15);--border-strong:rgba(0,229,255,0.35);--cyan:#00e5ff;--purple:#7b5cff;--text:#e8ecf4;--text2:#8b95a8;--text3:#5a6478;--success:#00e676;--error:#ff5252;--warn:#ffc107;--orange:#ff9f2b}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans Myanmar','Roboto','Segoe UI',Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:14px;line-height:1.6}
a{color:var(--cyan);text-decoration:none}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px}
.card-title{font-size:15px;font-weight:600;color:var(--cyan);margin-bottom:14px;display:flex;align-items:center;gap:8px}
label{display:block;font-size:12.5px;color:var(--text2);margin-bottom:6px;font-weight:500}
input,textarea,select{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:14px;padding:11px 14px;color:var(--text);font-size:14px;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
input:focus,textarea:focus,select:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 2px rgba(0,229,255,.1)}
textarea{resize:vertical;min-height:90px}
select{cursor:pointer}
select option{background:var(--bg-card);color:var(--text)}
.form-group{margin-bottom:16px}
.form-row{display:flex;gap:14px;flex-wrap:wrap}
.form-row .form-group{flex:1;min-width:200px}
.adv-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.adv-grid .form-group{margin-bottom:0;}
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
.result-textarea{width:100%;min-height:220px;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:16px;color:var(--text);font-size:15px;line-height:1.7;font-family:inherit;resize:vertical;overflow:hidden;box-sizing:border-box}
.result-textarea:focus{outline:none;border-color:var(--cyan)}
.result-hint{color:var(--text3);font-size:12px;margin-top:6px;font-style:italic}
.revise-section{margin-top:20px;padding-top:20px;border-top:1px solid var(--border)}
.revise-history{margin-bottom:14px;max-height:280px;overflow-y:auto}
.revise-msg{background:var(--bg-input);border-radius:8px;padding:10px 14px;margin-bottom:8px;font-size:13px}
.revise-msg.user{border-left:3px solid var(--purple)}
.revise-msg .role{font-size:11px;color:var(--text3);margin-bottom:4px}
.revise-input-row{display:flex;gap:10px;align-items:flex-end}
.revise-input-row textarea{flex:1;min-height:60px}
.ref-upload-area{margin-top:14px}
.ref-upload-area input[type="file"]{padding:10px;background:var(--bg-input);color:var(--text2);border:1px dashed var(--border-strong);border-radius:8px;font-size:13px}
.ref-hint{color:var(--text3);font-size:12px;margin-top:6px;line-height:1.5}
.ref-preview{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
.ref-thumb{position:relative;width:72px;height:72px}
.ref-thumb img{width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--border);display:block}
.ref-thumb .remove-x{position:absolute;top:-7px;right:-7px;width:24px;height:24px;border-radius:50%;background:var(--error);color:#fff;border:none;font-size:13px;line-height:24px;text-align:center;cursor:pointer;padding:0;min-height:24px;min-width:24px}
.loading{display:none !important;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);align-items:center;gap:12px;color:#00e5ff;font-size:15px;font-weight:600;padding:16px 28px;border-radius:16px;background:rgba(8,12,24,.95);border:1px solid rgba(0,229,255,.4);box-shadow:0 8px 40px rgba(0,229,255,.3);z-index:99999;backdrop-filter:blur(12px);white-space:nowrap;}
.loading.show{display:flex}
.spinner{width:20px;height:20px;border:3px solid rgba(0,229,255,.2);border-top-color:#00e5ff;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.error-box{display:none;background:rgba(255,82,82,.1);border:1px solid rgba(255,82,82,.3);color:var(--error);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px;line-height:1.7;white-space:pre-line}
.error-box.show{display:block}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:var(--bg-card2);border:1px solid var(--success);color:var(--success);padding:10px 20px;border-radius:8px;font-size:13px;z-index:1000;transition:transform .3s}
.toast.show{transform:translateX(-50%) translateY(0)}
.toast.error{border-color:var(--error);color:var(--error)}
.empty-note{color:var(--text3);font-size:13px;padding:16px;background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;text-align:center}
/* ===== Short Studio Workflow 01→06 — Styles ===== */
.vf-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.vf-grid .form-group{margin-bottom:14px;}
.loading-card{text-align:center;padding:40px 16px;}
.loading-card .spinner{width:38px;height:38px;border-width:4px;margin:0 auto 18px;}
.loading-title{font-size:18px;font-weight:700;color:var(--cyan);margin-bottom:20px;}
.status-list{max-width:440px;margin:0 auto;text-align:left;}
.st-line{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;color:var(--text2);font-size:14px;opacity:.5;transition:all .2s;}
.st-line .st-marker{width:22px;text-align:center;flex-shrink:0;font-weight:700;color:var(--text3);}
.st-line.active{opacity:1;color:var(--text);background:rgba(0,229,255,.06);}
.st-line.active .st-marker{color:var(--cyan);}
.st-line.done{opacity:1;color:var(--text);}
.st-line.done .st-marker{color:var(--success);}
.retry-row{display:none;justify-content:center;margin-top:16px;}
.retry-row.show{display:flex;}
.final-char-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px;}
.final-char-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;flex-wrap:wrap;}
.final-char-name{font-weight:700;color:var(--cyan);font-size:15px;}
.final-char-id{font-size:11px;color:var(--purple);background:rgba(123,92,255,.12);border:1px solid rgba(123,92,255,.3);padding:2px 10px;border-radius:20px;}
.final-char-meta{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12.5px;color:var(--text2);margin-bottom:10px;}
.final-char-img{background:var(--bg-input);border:1px dashed var(--border);border-radius:10px;padding:10px;margin-bottom:10px;text-align:center;}
.final-char-img img{max-width:100%;max-height:340px;border-radius:8px;}
.final-prompt-label{font-size:11.5px;color:var(--text3);font-weight:700;letter-spacing:.4px;margin:8px 0 6px;text-transform:uppercase;}
.final-prompt-text{font-size:13px;color:var(--text);line-height:1.7;white-space:pre-wrap;word-break:break-word;background:var(--bg-input);padding:12px 14px;border-radius:10px;min-height:20px;}
.final-scene-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px;}
.final-scene-title{font-weight:700;color:var(--purple);font-size:14.5px;padding-bottom:10px;margin-bottom:12px;border-bottom:1px solid var(--border);}
.final-scene-box{margin-bottom:12px;}
.final-box-label{font-size:12px;color:var(--cyan);font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
.final-scene-meta{font-size:12.5px;color:var(--text2);border-top:1px solid var(--border);padding-top:10px;margin-top:4px;display:flex;flex-wrap:wrap;gap:6px 16px;}
.scene-image-area{margin-top:10px;text-align:center}
.scene-image-area img{max-width:100%;border-radius:8px;border:1px solid var(--border)}
@media(max-width:767px){.form-row{flex-direction:column}.revise-input-row{flex-direction:column;align-items:stretch}.action-row{flex-direction:column}.action-row .btn{width:100%}.vf-grid{grid-template-columns:1fr;}.adv-grid{grid-template-columns:1fr;}.btn-row .btn{flex:1 1 100%;}}
</style>
</head>
<body>
<div id="loginView" class="aics-login-overlay" style="display:none;"><div class="aics-login-box"><h2>Login လုပ်ရန် လိုအပ်ပါသည်</h2><p>Short Studio ကို အသုံးပြုရန် Google နဲ့ Login ဝင်ပါ။</p><a href="/api/auth/login?next=/app/short" class="btn btn-primary">Google နဲ့ Login</a></div></div>
${renderStudioShell({
  id: 'short',
  activeId: 'short',
  nameMy: 'ရှော့တ် Studio',
  desc: 'Short videos from script to MAP',
  icon: '🎬',
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

// ===================== Short-specific State (Story နှင့် သီးခြား) =====================
var selectedShortType='1';
var currentShort='';        // Final Short Script (User နောက်ဆုံး ပြင်ထားသော Script)
var currentShortIdea='';
var currentScenes=[];
var currentCharacters=[];
var imgCache={};
var videoStarted=false;
var shortBusy=false;
var planBusy=false;
var typewriterTimer=null;
var refImages=[];
var MAX_REF_IMAGES=5;

var SHORT_TYPES=[
  {v:'1',label:'Short Video (Free)',pro:false},
  {v:'2',label:'Type 2 (Pro)',pro:true},
  {v:'3',label:'Type 3 (Pro)',pro:true},
  {v:'4',label:'Type 4 (Pro)',pro:true},
  {v:'5',label:'Type 5 (Pro)',pro:true}
];
var DURATIONS=['15 sec','30 sec','45 sec','60 sec','90 sec','120 sec'];
var SCENE_DURATIONS=['3 sec','5 sec','8 sec','10 sec','12 sec'];
var RATIOS=['9:16','16:9','1:1','4:5','21:9'];
var VIDEO_STYLES=['Cinematic','Vlog Style','TikTok Trend','Music Sync','Talking Head','Storytime','ASMR','Documentary'];
var VISUAL_STYLES=['Realistic','Cinematic Realism','Anime','3D Animation','2D Illustration','Stylized','Fantasy'];
var CAMERA_STYLES=['Dynamic','Static Shot','Handheld','Tracking Shot','Slow Motion','Drone Shot','Feature Film'];
var LANGUAGES=['မြန်မာ','English','မြန်မာ + English'];
var TONES=['Emotional','Funny','Epic','Motivational','Mysterious','Educational'];

(function init(){
  if(!token){document.getElementById('loginView').style.display='flex';document.getElementById('aicsApp').style.display='none';return;}
  var _ue=document.getElementById('userEmail');if(_ue)_ue.textContent=userEmail||'—';
  var _pb=document.getElementById('planBadge');if(_pb)_pb.textContent=userPlan||'FREE';
  try{var ic=localStorage.getItem('aics_draft_short_imgcache');if(ic){imgCache=JSON.parse(ic)||{};}}catch(e){}
  buildShortTypeSel();
  fillSelect('durSel',DURATIONS,'30 sec');
  fillSelect('toneSel',TONES,'Emotional');
  fillSelect('langSel',LANGUAGES,'မြန်မာ');
  fillSelect('vidStyleSel',VIDEO_STYLES,'Cinematic');
  fillSelect('vidRatioSel',RATIOS,'9:16');
  fillSelect('vidDurationSel',DURATIONS,'30 sec');
  fillSelect('vidSceneSel',SCENE_DURATIONS,'5 sec');
  fillSelect('vidVisualSel',VISUAL_STYLES,'Realistic');
  fillSelect('vidCamSel',CAMERA_STYLES,'Dynamic');
  fillSelect('vidLangSel',LANGUAGES,'မြန်မာ');
  var _ta=document.getElementById('field_0');
  if(_ta){_ta.addEventListener('input',function(){this.style.height='auto';this.style.height=(this.scrollHeight)+'px';});}
  var sr=document.getElementById('shortResult');
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
function buildShortTypeSel(){
  var selEl=document.getElementById('shortTypeSel');if(!selEl)return;
  selEl.innerHTML='';
  for(var i=0;i<SHORT_TYPES.length;i++){
    (function(t){
      var o=document.createElement('option');
      o.value=t.v;
      o.textContent=t.label+(t.pro?' (PRO)':'');
      if(t.pro&&!isPro)o.disabled=true;
      selEl.appendChild(o);
    })(SHORT_TYPES[i]);
  }
  if(!isPro&&selectedShortType!=='1')selectedShortType='1';
  selEl.value=selectedShortType;
  selEl.onchange=function(){
    var v=selEl.value;
    var meta=SHORT_TYPES[parseInt(v,10)-1];
    if(meta&&meta.pro&&!isPro){showToastMsg('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။');selEl.value=selectedShortType;return;}
    selectedShortType=v;
  };
}

function toggleAdvFields(){
  var box=document.getElementById('advFields');
  var label=document.querySelector('#advToggle span');
  if(box.style.display==='none'){box.style.display='grid';if(label)label.textContent='ချုံ့ရန် ▲';}
  else{box.style.display='none';if(label)label.textContent='အပိုဆောင်းသတ်မှတ်ချက် (Advanced Options) ▼';}
}

function apiCall(url,body){var s=document.getElementById('aiModelSel');if(s&&s.value)body.model=s.value;return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.detail||data.error||'Request failed');return data;});});}

// ===================== Step 01 → 02 → 03 (Short Generate) =====================
function collectShortIdea(){
  var lines=[],valid=true;
  var topic=document.getElementById('field_0').value.trim();
  if(!topic)valid=false;
  function add(label,val){if(val&&String(val).trim())lines.push(label+': '+String(val).trim());}
  var stMeta=SHORT_TYPES[parseInt(selectedShortType,10)-1];
  add('Short Type',stMeta?stMeta.label:selectedShortType);
  add('Duration',sel('durSel'));
  add('Tone',sel('toneSel'));
  add('Language',sel('langSel'));
  add('Target Audience',document.getElementById('audInput')?document.getElementById('audInput').value:'');
  add('Topic',topic);
  add('Main Message',document.getElementById('mainMsg')?document.getElementById('mainMsg').value:'');
  add('Additional Instructions',document.getElementById('extraInstr')?document.getElementById('extraInstr').value:'');
  add('Hook',document.getElementById('advHook')?document.getElementById('advHook').value:'');
  add('Call To Action',document.getElementById('advCta')?document.getElementById('advCta').value:'');
  add('Character Information',document.getElementById('advCharInfo')?document.getElementById('advCharInfo').value:'');
  add('Location',document.getElementById('advLocation')?document.getElementById('advLocation').value:'');
  add('Visual Style',document.getElementById('advVisualStyle')?document.getElementById('advVisualStyle').value:'');
  add('Ending Style',document.getElementById('advEnding')?document.getElementById('advEnding').value:'');
  return{text:lines.join('\\n'),valid:valid};
}

function generateShort(){
  if(shortBusy)return;
  var collected=collectShortIdea();
  if(!collected.valid){showError('genError','Short အကြောင်းအရာကို အနည်းဆုံး ဖြည့်ရေးပါ။');return;}
  var stMeta=SHORT_TYPES[parseInt(selectedShortType,10)-1];
  if(stMeta&&stMeta.pro&&!isPro){showToastMsg('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။');return;}
  var idea=collected.text;
  hideError('genError');hideStepError('genError2','genRetry2');
  shortBusy=true;
  currentShort='';
  if(window.studioForceGoStep)window.studioForceGoStep(2);
  else window.studioGoStep(2);
  startStatusAnim('shortStatus');
  if(window.studioSetLoading)window.studioSetLoading(true);
  apiCall('/api/studio/short/generate',{idea:idea,type:selectedShortType})
    .then(function(data){
      currentShort=data.short||'';
      currentShortIdea=idea;
      stopStatusAnim('shortStatus',true);
      if(window.studioSetLoading)window.studioSetLoading(false);
      studioMarkDone(1);studioMarkDone(2);
      document.getElementById('reviseHistory').innerHTML='';
      var ta=document.getElementById('shortResult');
      typewriteShort(currentShort,ta);
      shortBusy=false;
      if(window.studioForceGoStep)window.studioForceGoStep(3);
      else window.studioGoStep(3);
      showToastMsg('✓ Short Script ရေးပြီးပါပြီ');
      autoSave();
    })
    .catch(function(err){
      console.error('Short Generate Error:', err);
      stopStatusAnim('shortStatus',false);
      if(window.studioSetLoading)window.studioSetLoading(false);
      shortBusy=false;
      showStepError('genError2','genRetry2',friendlyMsg(err,'short'));
      // Error → သက်ဆိုင်ရာ Input Step (01) သို့ Auto Back — Processing Step (02) ကို Done မသတ်မှတ်ရ
      if(window.studioUnmarkDone)window.studioUnmarkDone(2);
      showToastMsg('⚠️ '+(friendlyMsg(err,'short').replace(/\\n/g,' ')));
      if(window.studioForceGoStep)window.studioForceGoStep(1);
    });
}

// ===================== Typewriter + Auto Expand =====================
function stopTypewriter(){if(typewriterTimer){clearInterval(typewriterTimer);typewriterTimer=null;}}
function autoExpand(ta){if(!ta)return;ta.style.height='auto';ta.style.height=(ta.scrollHeight+2)+'px';}
function typewriteShort(text,ta){
  stopTypewriter();
  if(!ta)return;
  ta.value='';autoExpand(ta);
  var i=0,total=text.length;
  var step=Math.max(1,Math.round(total/150));
  typewriterTimer=setInterval(function(){
    i+=step;
    if(i>=total){ta.value=text;stopTypewriter();autoExpand(ta);currentShort=text;return;}
    ta.value=text.slice(0,i);
    autoExpand(ta);
  },18);
}
function onShortEdit(){
  stopTypewriter();
  var ta=document.getElementById('shortResult');
  if(ta){currentShort=ta.value;autoExpand(ta);}
}

// ===================== Step 03 — Revise =====================
function reviseShort(){
  var instruction=document.getElementById('feedbackInput').value.trim();
  if(!instruction){showError('revError','ဘယ်လိုပြင်ချင်လဲ ရေးပါ');return;}
  if(!currentShort){showError('revError','အရင် Short Script ကို ဖန်တီးပါ');return;}
  hideError('revError');
  document.getElementById('revLoading').classList.add('show');
  document.getElementById('reviseBtn').disabled=true;
  addHistory('user',instruction);
  document.getElementById('feedbackInput').value='';
  var latestShort=document.getElementById('shortResult').value;
  apiCall('/api/studio/short/revise',{idea:currentShortIdea,type:selectedShortType,currentShort:latestShort,instruction:instruction})
    .then(function(data){
      currentShort=data.short||'';
      var ta=document.getElementById('shortResult');
      if(ta){ta.value=currentShort;autoExpand(ta);}
      addHistory('ai','ပြင်ဆင်ပြီးပါပြီ — အထက်က Short Script ထဲမှာ ကြည့်ပါ');
      autoSave();
    })
    .catch(function(err){showError('revError',friendlyMsg(err,'short'));})
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

// ===================== 03 → 04 (User နောက်ဆုံးပြင်ထားသော Final Short Script ကို ပို့သည်) =====================
function goToVideoForm(){
  var ta=document.getElementById('shortResult');
  stopTypewriter();
  if(ta)currentShort=ta.value;
  if(!currentShort||!currentShort.trim()){showToastMsg('ဗီဒီယို ဖန်တီးရန် Short Script မရှိသေးပါ');return;}
  studioMarkDone(3);
  videoStarted=true;
  fillVideoScriptField();
  window.studioGoStep(4);
  autoSave();
}
function fillVideoScriptField(){
  var ta=document.getElementById('videoScriptInput');
  if(!ta)return;
  ta.value=currentShort||'';
  autoExpand(ta);
}

// ===================== Step 04 → 05 → 06 (Short Video Plan) =====================
function generateShortVideoPlan(){
  if(planBusy)return;
  var script=document.getElementById('videoScriptInput').value.trim();
  if(!script){showError('planError','Short Script ထည့်ရန် လိုအပ်ပါသည် — Step 03 မှာ Script ရေးပြီးမှ ဆက်လုပ်ပါ');return;}
  hideError('planError');hideStepError('planError5','planRetry5');
  planBusy=true;
  var btn=document.getElementById('shortVideoBtn');
  if(btn)btn.disabled=true;
  studioMarkDone(4);
  if(window.studioForceGoStep)window.studioForceGoStep(5);
  else window.studioGoStep(5);
  startStatusAnim('planStatus');
  if(window.studioSetLoading)window.studioSetLoading(true);
  var continuity=document.getElementById('vidContinuity');
  var body={
    idea:script,
    type:selectedShortType,
    videoStyle:sel('vidStyleSel'),
    aspectRatio:sel('vidRatioSel'),
    duration:sel('vidDurationSel'),
    sceneDuration:sel('vidSceneSel'),
    visualStyle:sel('vidVisualSel'),
    cameraStyle:sel('vidCamSel'),
    language:sel('vidLangSel'),
    characterContinuity:(continuity&&continuity.checked)?'true':'false',
    additionalInstructions:document.getElementById('vidExtra')?document.getElementById('vidExtra').value.trim():''
  };
  if(refImages.length>0){
    body.images=refImages.map(function(img){return{base64:img.base64,mimeType:img.mimeType};});
  }
  apiCall('/api/studio/short/video',body)
    .then(function(data){
      currentScenes=data.scenes||[];
      currentCharacters=data.characters||[];
      stopStatusAnim('planStatus',true);
      if(window.studioSetLoading)window.studioSetLoading(false);
      studioMarkDone(4);studioMarkDone(5);
      planBusy=false;
      if(btn)btn.disabled=false;
      if(window.studioForceGoStep)window.studioForceGoStep(6);
      else window.studioGoStep(6);
      renderFinalResult();
      showToastMsg('✓ Short Video ပြင်ဆင်ပြီးပါပြီ');
      autoSave();
    })
    .catch(function(err){
      console.error('Short Video Plan Error:', err);
      stopStatusAnim('planStatus',false);
      if(window.studioSetLoading)window.studioSetLoading(false);
      planBusy=false;
      if(btn)btn.disabled=false;
      showStepError('planError5','planRetry5',friendlyMsg(err,'video'));
      // Error → သက်ဆိုင်ရာ Input / Setup Step (04) သို့ Auto Back — Processing Step (05) ကို Done မသတ်မှတ်ရ
      if(window.studioUnmarkDone)window.studioUnmarkDone(5);
      showToastMsg('⚠️ '+(friendlyMsg(err,'video').replace(/\\n/g,' ')));
      if(window.studioForceGoStep)window.studioForceGoStep(4);
    });
}

// ===================== Reference Images (Short-specific) =====================
function onRefImageSelected(){
  var fileInput=document.getElementById('refImageInput');
  var files=fileInput.files;
  for(var i=0;i<files.length;i++){
    if(refImages.length>=MAX_REF_IMAGES){
      showToastMsg('Reference ပုံ အများဆုံး '+MAX_REF_IMAGES+' ပုံပဲ တင်လို့ရပါတယ်။');
      break;
    }
    var file=files[i];
    if(file.size>5*1024*1024){
      showToastMsg("'"+file.name+"' ပုံသည် 5MB ထက် ကျော်နေလို့ ကျော်သွားပါမည်။");
      continue;
    }
    addRefImageFile(file);
  }
  fileInput.value='';
}
function addRefImageFile(file){
  var reader=new FileReader();
  reader.onload=function(e){
    refImages.push({
      dataUrl:e.target.result,
      base64:e.target.result.split(',')[1],
      mimeType:file.type
    });
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
    removeBtn.onclick=function(){removeRefImage(idx);};
    thumb.appendChild(imgEl);
    thumb.appendChild(removeBtn);
    container.appendChild(thumb);
  });
}
function removeRefImage(idx){
  refImages.splice(idx,1);
  renderRefPreviews();
}

// ===================== Step 06 — Short MAP (Characters + Scenes) =====================
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
    html+='<div class="card"><div class="card-title">&#127934; Characters</div>';
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
    html+='<div class="card"><div class="card-title">&#127916; Scenes</div>';
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
  if(!html)html='<div class="card"><div class="empty-note">ရလဒ် မရှိသေးပါ — Step 04 မှာ Short Video ဖန်တီးပါ</div></div>';
  c.innerHTML=html;
}

// ===================== Copy / Save / Export (Short-specific) =====================
function copyShort(){
  var text=document.getElementById('shortResult').value;
  if(!text){showToastMsg('Copy လုပ်ဖို့ Result မရှိသေးပါ');return;}
  copyToClipboard(text);
}
function saveShort(){
  var text=document.getElementById('shortResult').value;
  if(!text){showToastMsg('Save လုပ်ဖို့ Result မရှိသေးပါ');return;}
  var topic=document.getElementById('field_0').value.trim()||'Short Video';
  var defaultTitle=topic.substring(0,40)+(topic.length>40?'...':'');
  var title=prompt('Creation အမည် ပေးပါ:',defaultTitle);
  if(title===null)return;
  AICS_CREATIONS.save({studio:'SHORT',type:selectedShortType,title:title||defaultTitle,original_prompt:currentShortIdea,ai_output:text})
    .then(function(){showToastMsg('💾 My Creations ထဲ Save ပြီးပါပြီ');})
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
  apiCall('/api/studio/short/video-image',{prompt:prompt})
    .then(function(data){
      if(data.data){
        var src='data:'+(data.mimeType||'image/png')+';base64,'+data.data;
        imgCache['char_'+idx]=src;
        currentCharacters[idx].referenceImage=src;
        if(area)area.innerHTML='<img class="aics-pv-img" src="'+src+'"><div style="margin-top:8px;"><a href="'+src+'" download="short_character_'+(idx+1)+'.png"><button class="btn-ghost">&#128190; Save Image</button></a></div>';
        autoSave();autoSaveImgCache();
      }else{if(area)area.innerHTML='<div class="empty-note">ရုပ်ပုံ မထွက်ပါ — ထပ်စမ်းပါ</div>';}
    })
    .catch(function(err){if(area)area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">'+escapeHtml(friendlyMsg(err,'image'))+'</div><div style="text-align:center;margin-top:4px;"><button class="btn-ghost" onclick="generateCharImage('+idx+')">&#8635; ထပ်စမ်းပါ</button></div>';});
}
function generateEnvImage(idx){
  if(!currentScenes[idx]||!currentScenes[idx].environmentPrompt){showToastMsg('Prompt မရှိပါ');return;}
  var area=document.getElementById('envImg_'+idx);
  if(area)area.innerHTML='<div style="display:flex;align-items:center;gap:8px;justify-content:center;padding:12px;"><div class="spinner"></div><span style="font-size:13px;color:var(--cyan);">ရုပ်ပုံ ဖန်တီးနေပါသည်...</span></div>';
  apiCall('/api/studio/short/video-image',{prompt:currentScenes[idx].environmentPrompt})
    .then(function(data){
      if(data.data){
        var src='data:'+(data.mimeType||'image/png')+';base64,'+data.data;
        imgCache['env_'+idx]=src;
        if(area)area.innerHTML='<img src="'+src+'"><div style="margin-top:8px;"><a href="'+src+'" download="short_scene_'+(idx+1)+'_env.png"><button class="btn-ghost">&#128190; Save Image</button></a></div>';
        autoSave();autoSaveImgCache();
      }else{if(area)area.innerHTML='<div class="empty-note">ရုပ်ပုံ မထွက်ပါ — ထပ်စမ်းပါ</div>';}
    })
    .catch(function(err){if(area)area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">'+escapeHtml(friendlyMsg(err,'image'))+'</div><div style="text-align:center;margin-top:4px;"><button class="btn-ghost" onclick="generateEnvImage('+idx+')">&#8635; ထပ်စမ်းပါ</button></div>';});
}

// ===================== Result Text / Export =====================
function buildShortResultText(){
  var parts=[];
  if(currentShort&&currentShort.trim())parts.push('SHORT SCRIPT\\n======================\\n'+currentShort);
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
  var text=buildShortResultText();
  if(!text.trim()){showToastMsg('Result မရှိသေးပါ');return;}
  copyToClipboard(text);
}
function saveAllResult(){
  var text=buildShortResultText();
  if(!text.trim()){showToastMsg('Save လုပ်ဖို့ Result မရှိသေးပါ');return;}
  var defaultTitle=(document.getElementById('field_0').value.trim()||'Short Result').substring(0,40);
  var title=prompt('Creation အမည် ပေးပါ:',defaultTitle);
  if(title===null)return;
  AICS_CREATIONS.save({studio:'SHORTVIDEO',type:selectedShortType,title:title||defaultTitle,original_prompt:currentShortIdea,ai_output:text})
    .then(function(){showToastMsg('💾 My Creations ထဲ Save ပြီးပါပြီ');})
    .catch(function(err){showToastMsg('Save မအောင်မြင်ပါ: '+(err&&err.message||'Error'));});
}
function exportResult(){
  var text=buildShortResultText();
  if(!text.trim()){showToastMsg('Export လုပ်ဖို့ Result မရှိသေးပါ');return;}
  var blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='short_result.txt';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
  showToastMsg('✓ Export ပြီးပါပြီ');
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

// ===================== Error Helpers (Myanmar — Technical error ကို မပြပါ) =====================
function friendlyMsg(err,kind){
  var m=(err&&err.message)?String(err.message):'';
  if(kind==='short'){
    if(/missing_idea/.test(m))return 'Short အကြောင်းအရာကို အနည်းဆုံး ဖြည့်ရေးပါ။';
    if(/pro_only|feature_disabled/.test(m))return 'ဒီ Feature ကို ယခု အသုံးပြုခွင့် မရှိပါ။';
    if(/unauthorized|invalid_token/.test(m))return 'Login သက်တမ်း ကုန်သွားပါပြီ။ ပြန် Login ဝင်ပါ။';
    if(/fetch|network|failed/i.test(m))return '⚠️ Short Script ရေးသား၍ မရပါ။\\nAI Server မှ တုံ့ပြန်မှု မရရှိပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
    return '⚠️ Short Script ရေးသား၍ မရပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
  }
  if(kind==='video'){
    if(/missing_idea/.test(m))return 'Short Script ထည့်ရန် လိုအပ်ပါသည် — Step 03 မှာ Script ရေးပြီးမှ ဆက်လုပ်ပါ။';
    if(/pro_only|feature_disabled/.test(m))return 'ဒီ Feature ကို ယခု အသုံးပြုခွင့် မရှိပါ။';
    if(/unauthorized|invalid_token/.test(m))return 'Login သက်တမ်း ကုန်သွားပါပြီ။ ပြန် Login ဝင်ပါ။';
    if(/fetch|network|failed/i.test(m))return '⚠️ Short Video အတွက် ပြင်ဆင်၍ မရပါ။\\nAI Server မှ တုံ့ပြန်မှု မရရှိပါ။\\nခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။';
    return '⚠️ Short Video အတွက် ပြင်ဆင်၍ မရပါ။\\nScene များကို ခွဲခြားရာတွင် အခက်အခဲ ဖြစ်ပေါ်ခဲ့ပါသည်။';
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
function showToastMsg(msg){var t=document.getElementById('toast');t.textContent=msg||'✅ ကူးယူပြီးပါပြီ';t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2500);}
function escapeHtml(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function copyToClipboard(text){
  if(!text){showToastMsg('Text မရှိပါ');return;}
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToastMsg('✅ ကူးယူပြီးပါပြီ');});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToastMsg('✅ ကူးယူပြီးပါပြီ');}
}

// ===================== Stepper Actions =====================
function bReset(){return {label:'Reset',cls:'ghost',fn:studioReset};}
function studioOnStep(n){
  if(n===1){
    studioSetActions([bReset(),{label:'&#10024; Generate Short',cls:'primary',fn:generateShort}]);
  }else if(n===2){
    studioSetActions([]);
  }else if(n===3){
    studioSetActions([
      {label:'&#8592; Back',cls:'ghost',fn:function(){window.studioGoStep(1);}},
      bReset(),
      {label:'&#128203; Copy Short',cls:'secondary',fn:copyShort},
      {label:'&#128190; ဖန်တီးမှုသိမ်းပါ',cls:'purple',fn:saveShort},
      {label:'&#128203; Copy All',cls:'secondary',fn:copyAllResult},
      {label:'&#128190; ဖန်တီးမှုအားလုံးသိမ်း',cls:'purple',fn:saveAllResult}
    ]);
    var ta=document.getElementById('shortResult');
    if(ta)autoExpand(ta);
  }else if(n===4){
    fillVideoScriptField();
    var pb=document.getElementById('shortVideoBtn');
    if(pb)pb.disabled=false;
    studioSetActions([
      {label:'&#8592; Back',cls:'ghost',fn:function(){window.studioGoStep(3);}},
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
// localStorage key: aics_draft_short — Story (aics_draft_story) နှင့် သီးခြား
function studioCollectDraft(){
  var fields={};
  var f0=document.getElementById('field_0');fields[0]=f0?f0.value:'';
  function v(id){var e=document.getElementById(id);return e?e.value:'';}
  return {
    stepNow:window.studioCur?window.studioCur():1,
    shortType:selectedShortType,
    fields:fields,
    aud:v('audInput'),
    dur:sel('durSel'),
    tone:sel('toneSel'),
    lang:sel('langSel'),
    mainMsg:v('mainMsg'),
    extraInstr:v('extraInstr'),
    adv:{hook:v('advHook'),cta:v('advCta'),charInfo:v('advCharInfo'),location:v('advLocation'),visualStyle:v('advVisualStyle'),ending:v('advEnding')},
    short:currentShort,
    shortIdea:currentShortIdea,
    videoStarted:videoStarted,
    videoForm:{
      script:document.getElementById('videoScriptInput')?document.getElementById('videoScriptInput').value:'',
      videoStyle:sel('vidStyleSel'),
      aspectRatio:sel('vidRatioSel'),
      duration:sel('vidDurationSel'),
      sceneDuration:sel('vidSceneSel'),
      visualStyle:sel('vidVisualSel'),
      cameraStyle:sel('vidCamSel'),
      language:sel('vidLangSel'),
      characterContinuity:document.getElementById('vidContinuity')?document.getElementById('vidContinuity').checked:true,
      additionalInstructions:v('vidExtra')
    },
    characters:currentCharacters,
    scenes:currentScenes,
    refCount:refImages.length
  };
}
window.studioCollectDraft=studioCollectDraft;

function studioRestoreDraft(d){
  if(!d)return;
  selectedShortType=d.shortType||'1';
  var sts=document.getElementById('shortTypeSel');if(sts)sts.value=selectedShortType;
  if(d.fields){var f0=document.getElementById('field_0');if(f0)f0.value=d.fields[0]||'';}
  var aud=document.getElementById('audInput');if(aud&&d.aud)aud.value=d.aud;
  function setv(id,val){var e=document.getElementById(id);if(e&&val)e.value=val;}
  setv('durSel',d.dur);setv('toneSel',d.tone);setv('langSel',d.lang);
  setv('mainMsg',d.mainMsg);setv('extraInstr',d.extraInstr);
  if(d.adv){
    setv('advHook',d.adv.hook);setv('advCta',d.adv.cta);setv('advCharInfo',d.adv.charInfo);
    setv('advLocation',d.adv.location);setv('advVisualStyle',d.adv.visualStyle);setv('advEnding',d.adv.ending);
  }
  currentShort=d.short||'';
  currentShortIdea=d.shortIdea||'';
  videoStarted=!!d.videoStarted;
  document.getElementById('shortResult').value=currentShort;
  if(d.videoForm){
    var vf=d.videoForm;
    var vs=document.getElementById('videoScriptInput');if(vs){vs.value=vf.script||currentShort;autoExpand(vs);}
    setv('vidStyleSel',vf.videoStyle);setv('vidRatioSel',vf.aspectRatio);
    setv('vidDurationSel',vf.duration);setv('vidSceneSel',vf.sceneDuration);
    setv('vidVisualSel',vf.visualStyle);setv('vidCamSel',vf.cameraStyle);setv('vidLangSel',vf.language);
    var cc=document.getElementById('vidContinuity');if(cc)cc.checked=vf.characterContinuity!==false;
    setv('vidExtra',vf.additionalInstructions);
  }
  currentCharacters=d.characters||[];
  currentScenes=d.scenes||[];
  var was=d.stepNow||1;
  if(currentShort){studioMarkDone(1);studioMarkDone(2);}
  if((videoStarted||was>=4)&&currentShort){studioMarkDone(3);studioMarkDone(4);}
  if(currentCharacters.length||currentScenes.length){studioMarkDone(4);studioMarkDone(5);}
  if(currentScenes.length||currentCharacters.length)renderFinalResult();
  setTimeout(function(){
    var c=window.studioCur?window.studioCur():1;
    if(c===2){window.studioGoStep(currentShort?3:1);}
    else if(c===5){window.studioGoStep((currentScenes.length||currentCharacters.length)?6:4);}
    else if(c===4&&!currentShort){window.studioGoStep(1);}
  },0);
}
window.studioRestoreDraft=studioRestoreDraft;

// ===================== Auto Save (Refresh ပြီးနောက် Data မပျောက်စေရ) =====================
function autoSave(){
  try{
    var data=studioCollectDraft();
    localStorage.setItem('aics_draft_short',JSON.stringify({step:window.studioCur?window.studioCur():1,data:data,savedAt:new Date().toISOString()}));
  }catch(e){}
}
function autoSaveImgCache(){
  try{localStorage.setItem('aics_draft_short_imgcache',JSON.stringify(imgCache));}catch(e){}
}

// Reset — Shared Reset ၏ Draft ဖျက်ခြင်းနှင့်အတူ Short Image Cache ကိုပါ ရှင်းသည်
window.studioReset=function(){
  if(!confirm('ဤ Studio ရဲ့ အချက်အလက်အားလုံးကို ဖျက်ပြီး အစကပြန်စမလား?'))return;
  try{localStorage.removeItem('aics_draft_short');}catch(e){}
  try{localStorage.removeItem('aics_draft_short_imgcache');}catch(e){}
  location.reload();
};
</script>
</body>
</html>`;
