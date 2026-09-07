// AI Creative Studio — Short Studio Frontend (Phase 5)
// Tab 1: Short Script Generator + Revise (Chat)
// Tab 2: Video Maker (with Reference Image Upload — အများဆုံး ၅ ပုံ)
// Dark Theme preserved from Source (Google Apps Script UI)
// Studio Isolation: ဤ File သည် Short Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Phase 4 — Sidebar + Helper Script များကို Shared Component (frontend/shared.js) မှ ယူသည်

import { renderSidebar, sidebarScript } from './shared.js';

export const SHORT_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Short Studio — AI Creative Studio</title>
<style>
:root {
  --bg: #080c18;
  --bg-card: #0d1424;
  --bg-card2: #111a2e;
  --bg-input: #0a1020;
  --border: rgba(0,229,255,0.15);
  --border-strong: rgba(0,229,255,0.35);
  --cyan: #00e5ff;
  --purple: #7b5cff;
  --text: #e8ecf4;
  --text2: #8b95a8;
  --text3: #5a6478;
  --success: #00e676;
  --error: #ff5252;
  --warn: #ffc107;
  --orange: #ff9f2b;
}
* { margin:0; padding:0; box-sizing:border-box; }
body {
  font-family: 'Noto Sans Myanmar', 'Roboto', 'Segoe UI', Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  font-size: 14px;
  line-height: 1.6;
}
a { color: var(--cyan); text-decoration: none; }
.header {
  background: linear-gradient(135deg, #0a1628, #0d1f3c);
  border-bottom: 1px solid var(--border);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.logo {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(90deg, var(--cyan), var(--purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.header-right { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.user-email { color: var(--text2); }
.plan-badge {
  background: linear-gradient(135deg, var(--purple), var(--cyan));
  color: #fff;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.menu-btn {
  display: none;
  background: none;
  border: 1px solid var(--border);
  color: var(--cyan);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
}
.layout { display: flex; min-height: calc(100vh - 57px); }
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
.main { flex: 1; padding: 24px; max-width: 960px; margin: 0 auto; width: 100%; }
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--cyan);
  margin-bottom: 16px;
}
.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 24px;
  overflow-x: auto;
}
.tab {
  padding: 12px 20px;
  background: none;
  border: none;
  color: var(--text2);
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
  min-height: 44px;
}
.tab:hover { color: var(--text); }
.tab.active { color: var(--cyan); border-bottom-color: var(--cyan); font-weight: 600; }
.tab-content { display: none; }
.tab-content.active { display: block; }
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--cyan);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
label {
  display: block;
  font-size: 12.5px;
  color: var(--text2);
  margin-bottom: 6px;
  font-weight: 500;
}
input, textarea, select {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 11px 14px;
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--cyan);
  box-shadow: 0 0 0 2px rgba(0,229,255,0.1);
}
textarea { resize: vertical; min-height: 90px; }
select { cursor: pointer; }
select option { background: var(--bg-card); color: var(--text); }
.form-group { margin-bottom: 16px; }
.form-row { display: flex; gap: 14px; flex-wrap: wrap; }
.form-row .form-group { flex: 1; min-width: 200px; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  min-height: 44px;
  min-width: 44px;
}
.btn-primary {
  background: linear-gradient(135deg, var(--cyan), #00b8d4);
  color: #080c18;
}
.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.btn-secondary {
  background: var(--bg-card2);
  color: var(--cyan);
  border: 1px solid var(--border-strong);
}
.btn-secondary:hover { background: rgba(0,229,255,0.1); }
.btn-ghost {
  background: none;
  color: var(--text2);
  border: 1px solid var(--border);
  padding: 6px 12px;
  font-size: 12px;
  min-height: 32px;
}
.btn-ghost:hover { color: var(--cyan); border-color: var(--cyan); }
.btn-success {
  background: var(--success);
  color: #080c18;
}
.btn-purple {
  background: var(--purple);
  color: #fff;
}
.btn-orange {
  background: var(--orange);
  color: #080c18;
}
.type-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.type-chip {
  padding: 8px 16px;
  background: var(--bg-card2);
  border: 2px solid var(--border);
  border-radius: 8px;
  color: var(--text2);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.2s;
  min-height: 40px;
}
.type-chip:hover { border-color: var(--cyan); color: var(--text); }
.type-chip.active {
  border-color: var(--cyan);
  background: rgba(0,229,255,0.1);
  color: var(--cyan);
  font-weight: 600;
}
.type-chip.locked {
  opacity: 0.45;
  cursor: not-allowed;
}
.type-chip.locked:hover { border-color: var(--border); color: var(--text2); }
.result-textarea {
  width: 100%;
  min-height: 200px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  line-height: 1.7;
  resize: vertical;
}
.result-textarea:focus {
  outline: none;
  border-color: var(--cyan);
}
.result-hint {
  color: var(--text3);
  font-size: 12px;
  margin-top: 6px;
  font-style: italic;
}
.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}
.revise-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
.revise-history {
  max-height: 240px;
  overflow-y: auto;
  background: var(--bg-input);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}
.revise-msg {
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  max-width: 85%;
  line-height: 1.5;
}
.revise-msg.user {
  background: rgba(123,92,255,0.15);
  margin-left: auto;
  text-align: right;
}
.revise-msg.ai {
  background: var(--bg-card2);
  color: var(--success);
}
.revise-input-row { display: flex; gap: 10px; align-items: flex-end; }
.revise-input-row textarea { flex: 1; min-height: 60px; }
/* Reference Image Upload (Short Studio Tab 2) */
.ref-upload-area {
  margin-top: 14px;
}
.ref-upload-area input[type="file"] {
  padding: 10px;
  background: var(--bg-input);
  color: var(--text2);
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
  font-size: 13px;
}
.ref-hint {
  color: var(--text3);
  font-size: 12px;
  margin-top: 6px;
  line-height: 1.5;
}
.ref-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}
.ref-thumb {
  position: relative;
  width: 72px;
  height: 72px;
}
.ref-thumb img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
  display: block;
}
.ref-thumb .remove-x {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--error);
  color: #fff;
  border: none;
  font-size: 13px;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
  padding: 0;
  min-height: 24px;
  min-width: 24px;
}
/* Video Plan — Characters & Scenes */
.fallback-note {
  display: none;
  background: rgba(255,193,7,0.1);
  border: 1px solid rgba(255,193,7,0.3);
  color: var(--warn);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 14px;
  line-height: 1.5;
}
.fallback-note.show { display: block; }
.section-block { margin-top: 24px; }
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 14px;
}
.section-badge {
  background: var(--error);
  color: #fff;
  font-weight: 700;
  padding: 3px 11px;
  border-radius: 6px;
  font-size: 13px;
}
.empty-note {
  color: var(--text3);
  font-size: 13px;
  padding: 16px;
  background: var(--bg-input);
  border: 1px dashed var(--border);
  border-radius: 10px;
  text-align: center;
}
.scene-group { margin-bottom: 22px; }
.scene-group-title {
  color: var(--cyan);
  font-weight: 700;
  font-size: 15px;
  padding-bottom: 8px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.scene-card, .character-card {
  background: var(--bg-card2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 14px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.card-header span {
  font-weight: 700;
  color: var(--cyan);
  font-size: 14px;
}
.card-subtext {
  color: var(--text2);
  font-size: 13px;
  margin-bottom: 8px;
}
.card-label {
  color: var(--text2);
  font-size: 12.5px;
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: 500;
}
.card-text {
  white-space: pre-wrap;
  line-height: 1.6;
  background: var(--bg-input);
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13.5px;
  color: var(--text);
  min-height: 24px;
}
.card-textarea {
  width: 100%;
  background: var(--bg-input);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 13.5px;
  font-family: inherit;
  line-height: 1.6;
  outline: none;
  resize: vertical;
  min-height: 60px;
}
.card-textarea:focus { border-color: var(--cyan); }
.mini-btn {
  padding: 6px 14px;
  font-size: 12px;
  background: var(--success);
  color: #080c18;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  min-height: 32px;
}
.gen-img-btn {
  margin-top: 12px;
  padding: 8px 16px;
  font-size: 13px;
  background: var(--orange);
  color: #080c18;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  display: block;
  min-height: 40px;
}
.gen-img-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.image-result-area img {
  width: 100%;
  border-radius: 8px;
  margin-top: 10px;
}
.image-result-area a {
  display: inline-block;
  margin-top: 8px;
}
.loading {
  display: none;
  align-items: center;
  gap: 10px;
  color: var(--cyan);
  font-size: 13px;
  padding: 12px 0;
}
.loading.show { display: flex; }
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-box {
  display: none;
  background: rgba(255,82,82,0.1);
  border: 1px solid rgba(255,82,82,0.3);
  color: var(--error);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 12px;
}
.error-box.show { display: block; }
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: var(--bg-card2);
  border: 1px solid var(--success);
  color: var(--success);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  z-index: 1000;
  transition: transform 0.3s;
}
.toast.show { transform: translateX(-50%) translateY(0); }
.toast.error { border-color: var(--error); color: var(--error); }
.login-prompt {
  text-align: center;
  padding: 60px 20px;
}
.login-prompt h2 { color: var(--cyan); margin-bottom: 12px; }
.login-prompt p { color: var(--text2); margin-bottom: 20px; }
@media (max-width: 768px) {
  .menu-btn { display: block; }
  .sidebar {
    position: fixed;
    left: -260px;
    top: 57px;
    bottom: 0;
    z-index: 99;
    transition: left 0.3s;
    box-shadow: 4px 0 20px rgba(0,0,0,0.5);
  }
  .sidebar.open { left: 0; }
  .main { padding: 16px; }
  .header-right .user-email { display: none; }
  .form-row { flex-direction: column; }
  .revise-input-row { flex-direction: column; align-items: stretch; }
  .action-row { flex-direction: column; }
  .action-row .btn { width: 100%; }
}
</style>
</head>
<body>
<div class="header">
  <div class="header-left">
    <button class="menu-btn" onclick="toggleSidebar()">&#9776;</button>
    <div class="logo">&#127912; AI Creative Studio</div>
  </div>
  <div class="header-right">
    <span class="user-email" id="userEmail">—</span>
    <span class="plan-badge" id="planBadge">FREE</span>
  </div>
</div>
<div class="layout">
  ${renderSidebar('short', { variant: 'studio' })}
  <div class="main">
    <div id="loginView" class="login-prompt" style="display:none;">
      <h2>Login လုပ်ရန် လိုအပ်ပါသည်</h2>
      <p>Short Studio ကို အသုံးပြုရန် Google နဲ့ Login ဝင်ပါ။</p>
      <a href="/api/auth/login?next=/app/short" class="btn btn-primary">Google နဲ့ Login</a>
    </div>
    <div id="appView">
      <h1 class="page-title">&#127916; Short Studio</h1>
      <div class="tabs">
        <button class="tab active" onclick="switchTab(1)">&#127916; ဇာတ်ညွှန်းအတို ဖန်တီးရန်</button>
        <button class="tab" onclick="switchTab(2)">&#127909; ဗီဒီယို ဖန်တီးရန်</button>
      </div>

      <!-- ================= TAB 1: SHORT SCRIPT ================= -->
      <div class="tab-content active" id="tab1">
        <div class="card">
          <div class="card-title">&#127916; Short Script ဖန်တီးရန်</div>
          <p style="color:var(--text2);font-size:13px;margin-bottom:14px;">
            Type ရွေးပြီး အောက်ကနေရာလေးများကို ဖြည့်ရေးပါ — TikTok/Reels/Shorts အတွက် Script ဖန်တီးပေးပါမယ်။
          </p>
          <div class="type-chips" id="typeChips1"></div>
          <div id="ideaFields"></div>
          <button class="btn btn-primary" id="genBtn" onclick="generateShort()">&#9654; Generate Short</button>
          <div class="loading" id="genLoading"><div class="spinner"></div> AI Short Script ရေးသားနေပါသည်...</div>
          <div class="error-box" id="genError"></div>
        </div>
        <div id="resultSection" style="display:none;">
          <div class="card">
            <div class="card-title">&#128221; ရလဒ် (Short Script)</div>
            <textarea class="result-textarea" id="shortResult" placeholder="Short Script ဒီနေရာမှာ ပေါ်လာပါမယ်..."></textarea>
            <p class="result-hint">&#9999; ဒီနေရာမှာ တိုက်ရိုက် နှိပ်ပြီး ကိုယ်တိုင် ပြင်ဆင်နိုင်ပါတယ်</p>
            <div class="action-row">
              <button class="btn btn-success" onclick="copyResult()">&#128203; Copy Short</button>
              <button class="btn btn-purple" onclick="saveToCreations()">&#128190; Save to My Creations</button>
              <button class="btn btn-orange" onclick="transferToVideo()">&#127909; ဗီဒီယို ဖန်တီးရန်</button>
            </div>
          </div>
          <div class="card revise-section">
            <div class="card-title">&#129302; AI ကို ဆက်ညွှန်ကြားရန် (Revise)</div>
            <div class="revise-history" id="reviseHistory"></div>
            <div class="revise-input-row">
              <textarea id="feedbackInput" placeholder="ဥပမာ — Hook ကို ပိုပြင်းထန်အောင် ပြင်ပေးပါ"></textarea>
              <button class="btn btn-secondary" id="reviseBtn" onclick="reviseShort()">&#128260; ပြင်ပါ</button>
            </div>
            <div class="loading" id="revLoading"><div class="spinner"></div> ပြင်ဆင်နေပါသည်...</div>
            <div class="error-box" id="revError"></div>
          </div>
        </div>
      </div>

      <!-- ================= TAB 2: VIDEO MAKER ================= -->
      <div class="tab-content" id="tab2">
        <div class="card">
          <div class="card-title">&#127909; Video Plan ဖန်တီးရန်</div>
          <p style="color:var(--text2);font-size:13px;margin-bottom:14px;">
            Type ရွေးပြီး Idea/Script ထည့်ပါ — Scene အလိုက်၊ Character အလိုက် ခွဲထားသော Video Production Prompt များ ဖန်တီးပေးပါမယ်။
          </p>
          <div class="type-chips" id="typeChips2"></div>
          <div class="form-group">
            <label>Idea / Script</label>
            <textarea id="videoIdea" placeholder="ဥပမာ — ဒါရိုက်ခိုင်းလိုတဲ့ Script/Idea ကို ထည့်ပါ" style="min-height:140px;"></textarea>
          </div>
          <!-- Reference Image Upload (Short Studio ထူးခြားချက်) -->
          <div class="ref-upload-area">
            <label>&#128444; Reference ပုံများ ပူးတွဲရန် (ချန်ထားလို့ရသည်)</label>
            <input type="file" id="refImageInput" accept="image/*" multiple onchange="onRefImageSelected()">
            <p class="ref-hint">အများဆုံး ၅ ပုံအထိ Upload တင်နိုင်ပါတယ် (ပုံတစ်ပုံချင်းစီ Max 5MB) — Character/Scene ပုံများ တင်ထားရင် AI က ထိုပုံများကို ကိုးကားပြီး ဒီပုံနှင့် ကိုက်ညီသော Reference Prompt ရေးပေးပါမယ်။</p>
            <div class="ref-preview" id="refPreview"></div>
          </div>
          <button class="btn btn-primary" id="videoGenBtn" onclick="generateVideoPlan()" style="margin-top:16px;">&#9654; Generate Video Plan</button>
          <div class="loading" id="videoLoading"><div class="spinner"></div> AI Video Plan ရေးသားနေပါသည် (Scene/Character အလိုက် ခွဲနေပါသည်)...</div>
          <div class="error-box" id="videoError"></div>
          <div class="fallback-note" id="fallbackNote">
            &#9888; CMS ပုံစံအတိုင်း Scene/Character အပြည့်အစုံ မခွဲနိုင်ခဲ့ပါ — AI ရဲ့ Raw Output ကို Scene 1 အနေနဲ့ ပြထားပါသည်။
          </div>
        </div>
        <div id="videoResultSection" style="display:none;">
          <div class="section-block">
            <div class="section-title"><span class="section-badge">01</span> &#128100; CHARACTER REFERENCE PROMPT</div>
            <div id="characterArea"><div class="empty-note">Generate နှိပ်ပြီးရင် ဒီနေရာမှာ Character (ရှိလျှင်) ပေါ်ပါမယ်</div></div>
          </div>
          <div class="section-block">
            <div class="section-title"><span class="section-badge">02</span> &#127757;&#127916; SCENE PROMPT (Environment &amp; Video)</div>
            <div id="sceneArea"><div class="empty-note">Generate နှိပ်ပြီးရင် ဒီနေရာမှာ Scene တစ်ခုချင်းစီ ပေါ်ပါမယ်</div></div>
          </div>
          <div class="action-row" style="margin-top:24px;">
            <button class="btn btn-success" onclick="copyAllPrompts()">&#128203; All Copy</button>
            <button class="btn btn-purple" onclick="saveAllToCreations()">&#128190; Save All to My Creations</button>
          </div>
          <p style="color:var(--text3);font-size:12px;margin-top:8px;">
            (&#9888; Text Prompt များသာ Save/Copy ဖြစ်ပါမည် — Image များကို ကတ်ချင်ရာနေရာမှာ &#128190; Save Image ခလုတ်ကနေ တစ်ပုံချင်း Download ချပေးပါ)
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="toast" id="toast">&#9989; အောင်မြင်ပါသည်</div>
${sidebarScript()}
<script>
var token = localStorage.getItem('aics_token') || '';
var userEmail = localStorage.getItem('aics_email') || '';
var userPlan = localStorage.getItem('aics_plan') || 'FREE';
var isPro = (userPlan === 'PRO');

var FIELD_CONFIG = [
  { label: "Video ရဲ့ အကြောင်းအရာ", placeholder: "ဥပမာ — ဘာအကြောင်း Video ရေးချင်ပါသလဲ?", required: true, multiline: true },
  { label: "Platform", placeholder: "ဥပမာ — TikTok / Instagram Reels / YouTube Shorts" },
  { label: "Video ကြာချိန်", placeholder: "ဥပမာ — ၁၅ စက္ကန့် / ၃၀ စက္ကန့် / ၁ မိနစ်" },
  { label: "ဘယ်သူတွေအတွက်လဲ", placeholder: "ဥပမာ — လူငယ်များ / စီးပွားရေးလုပ်ငန်းရှင်များ / အခြား" },
  { label: "အသံစံ/Tone", placeholder: "ဥပမာ — ဟာသ / အရှိန်မြှင့် / ရိုးရှင်းရှင်းလင်း / အခြား" }
];
var MAX_REF_IMAGES = 5;

var selectedType1 = '1';
var selectedType2 = '1';
var currentShort = '';
var currentShortIdea = '';
var currentScenes = [];
var currentCharacters = [];
var currentVideoIdea = '';
var refImages = []; // { dataUrl, base64, mimeType }

(function init() {
  if (!token) {
    document.getElementById('loginView').style.display = 'block';
    document.getElementById('appView').style.display = 'none';
    return;
  }
  document.getElementById('userEmail').textContent = userEmail || '—';
  document.getElementById('planBadge').textContent = userPlan || 'FREE';
  buildTypeChips('typeChips1', 1);
  buildTypeChips('typeChips2', 2);
  buildIdeaFields();
})();

function switchTab(n) {
  var tabs = document.querySelectorAll('.tab');
  var contents = document.querySelectorAll('.tab-content');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  for (var i = 0; i < contents.length; i++) contents[i].classList.remove('active');
  tabs[n - 1].classList.add('active');
  document.getElementById('tab' + n).classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
}

function buildTypeChips(containerId, tabNum) {
  var container = document.getElementById(containerId);
  var types = [
    { v: '1', label: 'Short Video (Free)', pro: false },
    { v: '2', label: 'Type 2 (Pro)', pro: true },
    { v: '3', label: 'Type 3 (Pro)', pro: true },
    { v: '4', label: 'Type 4 (Pro)', pro: true },
    { v: '5', label: 'Type 5 (Pro)', pro: true }
  ];
  types.forEach(function(t) {
    var chip = document.createElement('button');
    chip.className = 'type-chip' + (t.v === '1' ? ' active' : '') + (t.pro && !isPro ? ' locked' : '');
    chip.textContent = (t.pro && !isPro ? '🔒 ' : '') + t.label;
    chip.onclick = function() {
      if (t.pro && !isPro) { showToast('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။ Upgrade လိုအပ်ပါသည်။', true); return; }
      var chips = container.querySelectorAll('.type-chip');
      for (var i = 0; i < chips.length; i++) chips[i].classList.remove('active');
      chip.classList.add('active');
      if (tabNum === 1) selectedType1 = t.v; else selectedType2 = t.v;
    };
    container.appendChild(chip);
  });
}

function buildIdeaFields() {
  var container = document.getElementById('ideaFields');
  container.innerHTML = '';
  FIELD_CONFIG.forEach(function(field, idx) {
    var row = document.createElement('div');
    row.className = 'form-group';
    var label = document.createElement('label');
    label.textContent = field.label + (field.required ? ' *' : '');
    var input;
    if (field.multiline) {
      input = document.createElement('textarea');
      input.rows = 2;
    } else {
      input = document.createElement('input');
      input.type = 'text';
    }
    input.placeholder = field.placeholder;
    input.id = 'field_' + idx;
    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  });
}

function collectIdeaText() {
  var lines = [];
  var valid = true;
  FIELD_CONFIG.forEach(function(field, idx) {
    var val = document.getElementById('field_' + idx).value.trim();
    if (field.required && !val) valid = false;
    if (val) lines.push(field.label + ': ' + val);
  });
  return { text: lines.join('\\n'), valid: valid };
}

function apiCall(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify(body)
  }).then(function(res) {
    return res.json().then(function(data) {
      if (!res.ok) throw new Error(data.detail || data.error || 'Request failed');
      return data;
    });
  });
}

// ===== Tab 1 — Generate =====
function generateShort() {
  var collected = collectIdeaText();
  if (!collected.valid) { showToast('Video ရဲ့ အကြောင်းအရာ အနည်းဆုံး ဖြည့်ရေးပါ', true); return; }
  setLoading('genLoading', true);
  hideError('genError');
  document.getElementById('genBtn').disabled = true;
  apiCall('/api/studio/short/generate', { idea: collected.text, type: selectedType1 })
    .then(function(data) {
      currentShort = data.short || '';
      currentShortIdea = collected.text;
      document.getElementById('shortResult').value = currentShort;
      document.getElementById('resultSection').style.display = 'block';
      document.getElementById('reviseHistory').innerHTML = '';
    })
    .catch(function(err) { showError('genError', err.message); })
    .finally(function() {
      setLoading('genLoading', false);
      document.getElementById('genBtn').disabled = false;
    });
}

// ===== Tab 1 — Revise =====
function reviseShort() {
  var feedback = document.getElementById('feedbackInput').value.trim();
  if (!feedback) { showToast('ဘယ်လိုပြင်ချင်လဲ ရေးပါ', true); return; }
  if (!currentShort) { showToast('အရင် Short Script ကို ဖန်တီးပါ', true); return; }
  setLoading('revLoading', true);
  hideError('revError');
  document.getElementById('reviseBtn').disabled = true;
  addHistory('user', feedback);
  apiCall('/api/studio/short/revise', {
    idea: currentShortIdea,
    type: selectedType1,
    currentShort: document.getElementById('shortResult').value,
    instruction: feedback
  })
    .then(function(data) {
      currentShort = data.short || '';
      document.getElementById('shortResult').value = currentShort;
      document.getElementById('feedbackInput').value = '';
      addHistory('ai', 'ပြင်ဆင်ပြီးပါပြီ ✓ (အပေါ်က Script ထဲမှာ ကြည့်ပါ)');
    })
    .catch(function(err) { showError('revError', err.message); })
    .finally(function() {
      setLoading('revLoading', false);
      document.getElementById('reviseBtn').disabled = false;
    });
}

function addHistory(role, text) {
  var div = document.createElement('div');
  div.className = 'revise-msg ' + role;
  div.textContent = text;
  document.getElementById('reviseHistory').appendChild(div);
  var log = document.getElementById('reviseHistory');
  log.scrollTop = log.scrollHeight;
}

function copyResult() {
  var text = document.getElementById('shortResult').value;
  if (!text) { showToast('Copy လုပ်ဖို့ Result မရှိသေးပါ', true); return; }
  copyToClipboard(text);
  showToast('✓ Copy ပြီးပါပြီ');
}

function saveToCreations() {
  var resultText = document.getElementById('shortResult').value;
  if (!resultText) { showToast('Save လုပ်ဖို့ Result မရှိသေးပါ', true); return; }
  var topic = document.getElementById('field_0').value.trim() || 'Short Video';
  var defaultTitle = topic.substring(0, 40) + (topic.length > 40 ? '...' : '');
  var title = prompt('Creation အမည် ပေးပါ:', defaultTitle);
  if (title === null) return;
  AICS_CREATIONS.save({
    studio: 'SHORT',
    type: selectedType1,
    original_prompt: currentShortIdea,
    ai_output: resultText,
    title: title || defaultTitle
  })
    .then(function() { showToast('💾 My Creations ထဲ Save ပြီးပါပြီ'); })
    .catch(function(err) { showToast('Save မအောင်မြင်ပါ: ' + ((err && err.message) || 'Error'), true); });
}

function transferToVideo() {
  var shortText = document.getElementById('shortResult').value;
  if (!shortText || !shortText.trim()) { showToast('ဗီဒီယို ဖန်တီးရန် Script မရှိသေးပါ။ Script ကနေ Generate အရင်လုပ်ပါ။', true); return; }
  var videoBox = document.getElementById('videoIdea');
  if (videoBox.value && videoBox.value.trim() !== '') {
    if (!confirm('ဗီဒီယို ဖန်တီးရန် Idea Box ထဲမှာ Info ရှိပြီးသားပါ။ အစားထိုးမလား?')) return;
  }
  switchTab(2);
  videoBox.value = shortText;
  window.scrollTo(0, 0);
}

// ===== Tab 2 — Reference Image Upload =====
function onRefImageSelected() {
  var fileInput = document.getElementById('refImageInput');
  var files = fileInput.files;
  for (var i = 0; i < files.length; i++) {
    if (refImages.length >= MAX_REF_IMAGES) {
      showToast('Reference ပုံ အများဆုံး ' + MAX_REF_IMAGES + ' ပုံပဲ တင်လို့ရပါတယ်။', true);
      break;
    }
    var file = files[i];
    if (file.size > 5 * 1024 * 1024) {
      showToast("'" + file.name + "' ပုံသည် 5MB ထက် ကျော်နေလို့ ကျော်သွားပါမည်။", true);
      continue;
    }
    addRefImageFile(file);
  }
  fileInput.value = '';
}

function addRefImageFile(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    refImages.push({
      dataUrl: e.target.result,
      base64: e.target.result.split(',')[1],
      mimeType: file.type
    });
    renderRefPreviews();
  };
  reader.readAsDataURL(file);
}

function renderRefPreviews() {
  var container = document.getElementById('refPreview');
  container.innerHTML = '';
  refImages.forEach(function(img, idx) {
    var thumb = document.createElement('div');
    thumb.className = 'ref-thumb';
    var imgEl = document.createElement('img');
    imgEl.src = img.dataUrl;
    var removeBtn = document.createElement('button');
    removeBtn.className = 'remove-x';
    removeBtn.textContent = '✕';
    removeBtn.onclick = function() { removeRefImage(idx); };
    thumb.appendChild(imgEl);
    thumb.appendChild(removeBtn);
    container.appendChild(thumb);
  });
}

function removeRefImage(idx) {
  refImages.splice(idx, 1);
  renderRefPreviews();
}

// ===== Tab 2 — Generate Video Plan =====
function generateVideoPlan() {
  var idea = document.getElementById('videoIdea').value;
  if (!idea || !idea.trim()) { showToast('Idea/Script ထည့်ပါ', true); return; }
  currentVideoIdea = idea;
  setLoading('videoLoading', true);
  hideError('videoError');
  document.getElementById('fallbackNote').classList.remove('show');
  document.getElementById('videoGenBtn').disabled = true;
  var body = { idea: idea, type: selectedType2 };
  if (refImages.length > 0) {
    body.images = refImages.map(function(img) { return { base64: img.base64, mimeType: img.mimeType }; });
  }
  apiCall('/api/studio/short/video', body)
    .then(function(data) {
      currentScenes = data.scenes || [];
      currentCharacters = data.characters || [];
      renderCharacters();
      renderScenes();
      if (data.rawFallback) document.getElementById('fallbackNote').classList.add('show');
      document.getElementById('videoResultSection').style.display = 'block';
    })
    .catch(function(err) { showError('videoError', err.message); })
    .finally(function() {
      setLoading('videoLoading', false);
      document.getElementById('videoGenBtn').disabled = false;
    });
}

function renderCharacters() {
  var area = document.getElementById('characterArea');
  area.innerHTML = '';
  if (currentCharacters.length === 0) {
    area.innerHTML = '<div class="empty-note">Character Prompt မရှိသေးပါ (Presenter မလိုအပ်တဲ့ Video ဖြစ်နိုင်ပါသည်)</div>';
    return;
  }
  currentCharacters.forEach(function(char, idx) {
    var card = document.createElement('div');
    card.className = 'character-card';
    var header = document.createElement('div');
    header.className = 'card-header';
    var title = document.createElement('span');
    title.textContent = '🧑 CHARACTER ' + (idx + 1) + ' — ' + (char.name || '(အမည်မသိ)');
    var copyBtn = document.createElement('button');
    copyBtn.className = 'mini-btn';
    copyBtn.textContent = '📋 Copy';
    copyBtn.onclick = function() { copyToClipboard(char.prompt || ''); showToast('✓ Copy ပြီးပါပြီ'); };
    header.appendChild(title);
    header.appendChild(copyBtn);
    var subtext = document.createElement('div');
    subtext.className = 'card-subtext';
    subtext.textContent = 'Role: ' + (char.role || '-');
    var label = document.createElement('div');
    label.className = 'card-label';
    label.textContent = 'Character Reference Prompt:';
    var text = document.createElement('div');
    text.className = 'card-text';
    text.textContent = char.prompt || '(မရှိပါ)';
    var imgBtn = document.createElement('button');
    imgBtn.className = 'gen-img-btn';
    imgBtn.textContent = '🎨 Character Reference Image ဖန်တီးရန်';
    imgBtn.onclick = function() { generateCardImage(char.prompt, 'charImg_' + idx, imgBtn); };
    var imgContainer = document.createElement('div');
    imgContainer.className = 'image-result-area';
    imgContainer.id = 'charImg_' + idx;
    card.appendChild(header);
    card.appendChild(subtext);
    card.appendChild(label);
    card.appendChild(text);
    card.appendChild(imgBtn);
    card.appendChild(imgContainer);
    area.appendChild(card);
  });
}

function renderScenes() {
  var area = document.getElementById('sceneArea');
  area.innerHTML = '';
  if (currentScenes.length === 0) {
    area.innerHTML = '<div class="empty-note">Scene Prompt မရှိသေးပါ</div>';
    return;
  }
  currentScenes.forEach(function(scene, idx) {
    var group = document.createElement('div');
    group.className = 'scene-group';
    var groupTitle = document.createElement('div');
    groupTitle.className = 'scene-group-title';
    groupTitle.textContent = 'SCENE ' + scene.number;
    group.appendChild(groupTitle);

    // Environment Card
    var eCard = document.createElement('div');
    eCard.className = 'scene-card';
    var eHeader = document.createElement('div');
    eHeader.className = 'card-header';
    var eTitle = document.createElement('span');
    eTitle.textContent = '🌍 Environment Reference Prompt';
    var eCopyBtn = document.createElement('button');
    eCopyBtn.className = 'mini-btn';
    eCopyBtn.textContent = '📋 Copy';
    eCopyBtn.onclick = function() { copyToClipboard(scene.environmentPrompt || ''); showToast('✓ Copy ပြီးပါပြီ'); };
    eHeader.appendChild(eTitle);
    eHeader.appendChild(eCopyBtn);
    var eText = document.createElement('div');
    eText.className = 'card-text';
    eText.textContent = scene.environmentPrompt || '(မရှိပါ)';
    var eImgBtn = document.createElement('button');
    eImgBtn.className = 'gen-img-btn';
    eImgBtn.textContent = '🎨 Environment Reference Image ဖန်တီးရန်';
    eImgBtn.onclick = function() { generateCardImage(scene.environmentPrompt, 'envImg_' + idx, eImgBtn); };
    var eImgContainer = document.createElement('div');
    eImgContainer.className = 'image-result-area';
    eImgContainer.id = 'envImg_' + idx;
    eCard.appendChild(eHeader);
    eCard.appendChild(eText);
    eCard.appendChild(eImgBtn);
    eCard.appendChild(eImgContainer);
    group.appendChild(eCard);

    // Video Prompt Card (editable)
    var vCard = document.createElement('div');
    vCard.className = 'scene-card';
    var vHeader = document.createElement('div');
    vHeader.className = 'card-header';
    var vTitle = document.createElement('span');
    vTitle.textContent = '🎬 Video Prompt';
    var vCopyBtn = document.createElement('button');
    vCopyBtn.className = 'mini-btn';
    vCopyBtn.textContent = '📋 Copy';
    vCopyBtn.onclick = function() { copyToClipboard(vTextarea.value); showToast('✓ Copy ပြီးပါပြီ'); };
    vHeader.appendChild(vTitle);
    vHeader.appendChild(vCopyBtn);
    var vTextarea = document.createElement('textarea');
    vTextarea.className = 'card-textarea';
    vTextarea.value = scene.videoPrompt || '';
    vTextarea.addEventListener('input', function() { currentScenes[idx].videoPrompt = vTextarea.value; });
    vCard.appendChild(vHeader);
    vCard.appendChild(vTextarea);
    group.appendChild(vCard);

    area.appendChild(group);
  });
}

function generateCardImage(promptText, containerId, btnEl) {
  if (!promptText || !promptText.trim()) { showToast('Prompt Text မရှိပါ', true); return; }
  var container = document.getElementById(containerId);
  btnEl.disabled = true;
  var originalLabel = btnEl.textContent;
  btnEl.textContent = 'ပုံဖန်တီးနေပါသည်... (မိနစ်အနည်းငယ် ကြာနိုင်)';
  container.innerHTML = '';
  apiCall('/api/studio/short/video-image', { prompt: promptText })
    .then(function(data) {
      btnEl.disabled = false;
      btnEl.textContent = originalLabel;
      var dataUri = 'data:' + data.mimeType + ';base64,' + data.data;
      var img = document.createElement('img');
      img.src = dataUri;
      var link = document.createElement('a');
      link.href = dataUri;
      link.download = 'short_video_reference.png';
      var dlBtn = document.createElement('button');
      dlBtn.className = 'mini-btn';
      dlBtn.style.background = 'var(--warn)';
      dlBtn.textContent = '💾 Save Image';
      link.appendChild(dlBtn);
      container.appendChild(img);
      container.appendChild(document.createElement('br'));
      container.appendChild(link);
    })
    .catch(function(err) {
      btnEl.disabled = false;
      btnEl.textContent = originalLabel;
      container.innerHTML = '<div class="empty-note">Error: ' + err.message + '</div>';
      showToast('ပုံဖန်တီးမှု မအောင်မြင်ပါ: ' + err.message, true);
    });
}

function buildCombinedText() {
  var combined = '🧑 CHARACTER REFERENCE PROMPTS\\n\\n';
  currentCharacters.forEach(function(char, idx) {
    combined += 'CHARACTER ' + (idx + 1) + '\\n';
    combined += '----------------------\\n\\n';
    combined += 'Name: ' + (char.name || '-') + '\\n';
    combined += 'Role: ' + (char.role || '-') + '\\n\\n';
    combined += 'Character Reference Prompt:\\n' + (char.prompt || '-') + '\\n\\n';
    combined += '======================\\n\\n';
  });
  combined += '\\n🌍🎬 SCENE PROMPTS (Environment & Video)\\n\\n';
  currentScenes.forEach(function(scene) {
    combined += 'SCENE ' + scene.number + '\\n';
    combined += '----------------------\\n\\n';
    combined += 'Environment Prompt:\\n' + (scene.environmentPrompt || '-') + '\\n\\n';
    combined += '----------------------\\n\\n';
    combined += 'Video Prompt:\\n' + (scene.videoPrompt || '-') + '\\n\\n';
    combined += '======================\\n\\n';
  });
  return combined;
}

function copyAllPrompts() {
  if (currentScenes.length === 0 && currentCharacters.length === 0) {
    showToast('Copy လုပ်ဖို့ Result မရှိသေးပါ။ Generate အရင်လုပ်ပါ။', true); return;
  }
  copyToClipboard(buildCombinedText());
  showToast('✓ Copy ပြီးပါပြီ');
}

function saveAllToCreations() {
  if (currentScenes.length === 0 && currentCharacters.length === 0) {
    showToast('Save လုပ်ဖို့ Result မရှိသေးပါ။ Generate အရင်လုပ်ပါ။', true); return;
  }
  var combined = buildCombinedText();
  var defaultTitle = currentVideoIdea.substring(0, 40) + (currentVideoIdea.length > 40 ? '...' : '');
  var title = prompt('Creation အမည် ပေးပါ:', defaultTitle);
  if (title === null) return;
  AICS_CREATIONS.save({
    studio: 'SHORTVIDEO',
    type: selectedType2,
    original_prompt: currentVideoIdea,
    ai_output: combined,
    title: title || defaultTitle
  })
    .then(function() { showToast('💾 My Creations ထဲ Save ပြီးပါပြီ'); })
    .catch(function(err) { showToast('Save မအောင်မြင်ပါ: ' + ((err && err.message) || 'Error'), true); });
}

// ===== Utilities =====
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

function showToast(msg, isError) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  if (isError) t.classList.add('error'); else t.classList.remove('error');
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2500);
}

function setLoading(id, show) {
  var el = document.getElementById(id);
  if (show) el.classList.add('show'); else el.classList.remove('show');
}

function showError(id, msg) {
  var el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('show');
}

function hideError(id) {
  document.getElementById(id).classList.remove('show');
}
// (Sidebar Helpers — TG-LINK / me Hydration / setApiKey / logout များကို Shared Sidebar Script သို့ ရွှေ့ပြီးပါပြီ — Phase 4)
</script>
</body>
</html>`;
