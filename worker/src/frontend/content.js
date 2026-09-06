// AI Creative Studio — Content Studio Frontend (Phase 3c)
// Tab 1: Content Generator + Revise (Chat)
// Tab 2: Video Plan + Scenes + Characters + Scene Image Generate
// Tab 3: SRT & Translation (Phase 3d မှာ ထပ်ဖြည့်မည်)
// Dark Theme preserved from Source (Google Apps Script UI)

export const CONTENT_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Content Studio — AI Creative Studio</title>
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
.sidebar {
  width: 220px;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  padding: 16px 0;
  flex-shrink: 0;
}
.sidebar a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 20px;
  color: var(--text2);
  font-size: 13.5px;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}
.sidebar a:hover { background: rgba(0,229,255,0.06); color: var(--text); }
.sidebar a.active {
  background: rgba(0,229,255,0.1);
  color: var(--cyan);
  border-left-color: var(--cyan);
  font-weight: 600;
}
.sidebar .nav-icon { width: 20px; text-align: center; font-size: 15px; }
.sidebar .soon { font-size: 10px; color: var(--text3); margin-left: auto; }
.main { flex: 1; padding: 24px; max-width: 960px; margin: 0 auto; width: 100%; }
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
.result-grid { display: grid; grid-template-columns: 1fr; gap: 14px; margin-top: 16px; }
.result-card {
  background: var(--bg-card2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
}
.result-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.result-card-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--purple);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.result-card-body {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-word;
}
.revise-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
.revise-history { margin-bottom: 14px; }
.revise-msg {
  background: var(--bg-input);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 8px;
  font-size: 13px;
}
.revise-msg.user { border-left: 3px solid var(--purple); }
.revise-msg .role { font-size: 11px; color: var(--text3); margin-bottom: 4px; }
.revise-input-row { display: flex; gap: 10px; align-items: flex-end; }
.revise-input-row textarea { flex: 1; min-height: 60px; }
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
.login-prompt {
  text-align: center;
  padding: 60px 20px;
}
.login-prompt h2 { color: var(--cyan); margin-bottom: 12px; }
.login-prompt p { color: var(--text2); margin-bottom: 20px; }

/* ===== Video Plan (Tab 2) ===== */
.characters-list { display: flex; flex-wrap: wrap; gap: 10px; }
.character-chip {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  flex: 1 1 200px;
  min-width: 180px;
}
.character-name { font-weight: 600; color: var(--cyan); font-size: 13px; margin-bottom: 4px; }
.character-desc { font-size: 12px; color: var(--text2); line-height: 1.5; }
.scene-item {
  background: var(--bg-card2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 14px;
}
.scene-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.scene-num { font-weight: 700; color: var(--cyan); font-size: 14px; }
.scene-duration { font-size: 11px; color: var(--text3); background: var(--bg-input); padding: 2px 8px; border-radius: 10px; }
.scene-field { margin-bottom: 10px; }
.scene-field-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--purple);
  text-transform: uppercase;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.scene-field-text { font-size: 13px; color: var(--text); line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
.scene-image-area { margin-top: 12px; text-align: center; }
.scene-image-area img { max-width: 100%; border-radius: 8px; border: 1px solid var(--border); }
.scene-image-placeholder {
  background: var(--bg-input);
  border: 1px dashed var(--border);
  border-radius: 8px;
  padding: 20px;
  color: var(--text3);
  font-size: 12px;
}

@media (max-width: 768px) {
  .menu-btn { display: block; }
  .sidebar {
    position: fixed;
    left: -240px;
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
  <div class="sidebar" id="sidebar">
    <a href="/app">&#127968; <span>ပင်မ</span></a>
    <a href="/app/story"><span class="nav-icon">&#128214;</span> ဇာတ်လမ်း <span class="soon">မကြာမီ</span></a>
    <a href="/app/content" class="active"><span class="nav-icon">&#9997;</span> ကอนเทนต်</a>
    <a href="/app/short"><span class="nav-icon">&#127916;</span> ရှော့တ် <span class="soon">မကြာမီ</span></a>
    <a href="/app/image"><span class="nav-icon">&#128444;</span> ဓာတ်ပုံ <span class="soon">မကြာမီ</span></a>
    <a href="/app/voice"><span class="nav-icon">&#127908;</span> အသံ <span class="soon">မကြာမီ</span></a>
    <a href="/app/shop"><span class="nav-icon">&#128722;</span> စျေး <span class="soon">မကြာမီ</span></a>
    <a href="/app#creations"><span class="nav-icon">&#128190;</span> ဖန်တီးမှုများ</a>
  </div>
  <div class="main">
    <div id="loginView" class="login-prompt" style="display:none;">
      <h2>Login လုပ်ရန် လိုအပ်ပါသည်</h2>
      <p>Content Studio ကို အသုံးပြုရန် Google နဲ့ Login ဝင်ပါ။</p>
      <a href="/auth/google" class="btn btn-primary">Google နဲ့ Login</a>
    </div>
    <div id="appView">
      <div class="tabs">
        <button class="tab active" onclick="switchTab(1)">Tab 1 — ကอนเทนต်ရေးဆွဲခြင်း</button>
        <button class="tab" onclick="switchTab(2)">Tab 2 — ဗီဒီယိုအစီအစဉ်</button>
        <button class="tab" onclick="switchTab(3)">Tab 3 — SRT & ဘာသာပြန်</button>
      </div>

      <!-- Tab 1: Content Generator -->
      <div class="tab-content active" id="tab1">
        <div class="card">
          <div class="card-title">&#9997; ကอนเทนต် ဖန်တီးရန်</div>
          <div class="form-group">
            <label>သင့် အကြံ / အကြောင်းအရာ (User Idea)</label>
            <textarea id="ideaInput" placeholder="ဥပမာ — ကော်ဖီဆိုင်တစ်ဆင်အတွက် social media ကอนเทนต်ရေးပါ..."></textarea>
          </div>
          <div class="form-row">
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
          <button class="btn btn-primary" id="generateBtn" onclick="generateContent()">&#9654; ဖန်တီးမယ်</button>
          <div class="loading" id="genLoading"><div class="spinner"></div> AI က ရေးနေပါသည်... ကျေးဇူးပြု၍ စောင့်ပါ...</div>
          <div class="error-box" id="genError"></div>
        </div>
        <div id="resultSection" style="display:none;">
          <div class="card">
            <div class="card-title">&#128221; ရလဒ် (Result)</div>
            <div class="result-grid">
              <div class="result-card">
                <div class="result-card-header">
                  <span class="result-card-label">ကอนเทนต် (Content)</span>
                  <button class="btn-ghost" onclick="copyText('contentOut')">&#128203; Copy</button>
                </div>
                <div class="result-card-body" id="contentOut"></div>
              </div>
              <div class="result-card">
                <div class="result-card-header">
                  <span class="result-card-label">ပြောဆိုပုံစံ (Speaking Style)</span>
                  <button class="btn-ghost" onclick="copyText('speakingOut')">&#128203; Copy</button>
                </div>
                <div class="result-card-body" id="speakingOut"></div>
              </div>
              <div class="result-card">
                <div class="result-card-header">
                  <span class="result-card-label">အသံပုံစံ (Voice Style)</span>
                  <button class="btn-ghost" onclick="copyText('voiceOut')">&#128203; Copy</button>
                </div>
                <div class="result-card-body" id="voiceOut"></div>
              </div>
            </div>
          </div>
          <div class="card revise-section">
            <div class="card-title">&#128172; ပြင်ဆင်ရန် (Revise — Chat)</div>
            <div class="revise-history" id="reviseHistory"></div>
            <div class="revise-input-row">
              <textarea id="feedbackInput" placeholder="ဘယ်လိုပြင်စေချင်လဲ? ဥပမာ — ပိုပြီး ရယ်စရာဖြစ်အောင်လုပ်ပါ..."></textarea>
              <button class="btn btn-secondary" id="reviseBtn" onclick="reviseContent()">&#128260; ပြင်ပါ</button>
            </div>
            <div class="loading" id="revLoading"><div class="spinner"></div> ပြင်ဆင်နေပါသည်...</div>
            <div class="error-box" id="revError"></div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Video Plan -->
      <div class="tab-content" id="tab2">
        <div class="card">
          <div class="card-title">&#127916; ဗီဒီယိုအစီအစဉ် ဖန်တီးရန် (Video Plan)</div>
          <div class="form-group">
            <label>သင့် အကြံ / အကြောင်းအရာ (User Idea)</label>
            <textarea id="videoIdeaInput" placeholder="ဥပမာ — ကော်ဖီဆိုင်တစ်ဆင်အတွက် 30-second promo video အစီအစဉ်ရေးပါ..."></textarea>
          </div>
          <div class="form-row">
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
          <button class="btn btn-primary" id="videoGenBtn" onclick="generateVideo()">&#9654; ဗီဒီယိုအစီအစဉ် ဖန်တီးမယ်</button>
          <div class="loading" id="videoLoading"><div class="spinner"></div> ဗီဒီယိုအစီအစဉ် ရေးဆွဲနေပါသည်...</div>
          <div class="error-box" id="videoError"></div>
        </div>
        <div id="videoResult" style="display:none;">
          <div class="card" id="charactersCard" style="display:none;">
            <div class="card-title">&#128100; ဇာတ်ကောင်များ (Characters)</div>
            <div id="charactersList" class="characters-list"></div>
          </div>
          <div class="card">
            <div class="card-title">&#127916; ဖြစ်စဉ်များ (Scenes)</div>
            <div id="scenesList"></div>
          </div>
        </div>
      </div>

      <!-- Tab 3: Coming Soon (Phase 3d) -->
      <div class="tab-content" id="tab3">
        <div class="card" style="text-align:center;padding:40px 20px;">
          <div style="font-size:40px;margin-bottom:12px;">&#127908;</div>
          <div class="card-title" style="justify-content:center;">Tab 3 — SRT & ဘာသာပြန်</div>
          <p style="color:var(--text2);">ဒီ Tab ကို Phase 3d မှာ တည်ဆောက်မည်ဖြစ်သည်။<br>Audio Upload → SRT ထုတ်ခြင်း + မြန်မာ/တရုတ် ဘာသာပြန် ပါဝင်မည်ဖြစ်ပါတယ်။</p>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="toast" id="toast">&#9989; ကူးယူပြီးပါပြီ</div>
<script>
var token = localStorage.getItem('aics_token') || '';
var userEmail = localStorage.getItem('aics_email') || '';
var userPlan = localStorage.getItem('aics_plan') || 'FREE';
var lastResult = null;
var videoPlan = null;

(function init() {
  if (!token) {
    document.getElementById('loginView').style.display = 'block';
    document.getElementById('appView').style.display = 'none';
    return;
  }
  document.getElementById('userEmail').textContent = userEmail || '—';
  document.getElementById('planBadge').textContent = userPlan || 'FREE';
})();

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
function switchTab(n) {
  var tabs = document.querySelectorAll('.tab');
  var contents = document.querySelectorAll('.tab-content');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  for (var i = 0; i < contents.length; i++) contents[i].classList.remove('active');
  tabs[n - 1].classList.add('active');
  document.getElementById('tab' + n).classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
}
function apiCall(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(body)
  }).then(function(res) {
    return res.json().then(function(data) {
      if (!res.ok) throw new Error(data.detail || data.error || 'Request failed');
      return data;
    });
  });
}

// ===== Tab 1: Content =====
function generateContent() {
  var idea = document.getElementById('ideaInput').value.trim();
  var type = document.getElementById('typeSelect').value;
  var byok = document.getElementById('byokInput').value.trim();
  if (!idea) { showError('genError', 'အကြောင်းအရာ (User Idea) ထည့်ပါ။'); return; }
  setLoading('genLoading', true);
  setLoading('revLoading', false);
  hideError('genError');
  document.getElementById('generateBtn').disabled = true;
  var body = { idea: idea, type: type };
  if (byok) body.apiKey = byok;
  apiCall('/api/studio/content/generate', body)
    .then(function(data) {
      lastResult = data;
      document.getElementById('contentOut').textContent = data.content || '(empty)';
      document.getElementById('speakingOut').textContent = data.speakingStyle || '(empty)';
      document.getElementById('voiceOut').textContent = data.voiceStyle || '(empty)';
      document.getElementById('resultSection').style.display = 'block';
      document.getElementById('reviseHistory').innerHTML = '';
    })
    .catch(function(err) { showError('genError', err.message); })
    .finally(function() {
      setLoading('genLoading', false);
      document.getElementById('generateBtn').disabled = false;
    });
}
function reviseContent() {
  var feedback = document.getElementById('feedbackInput').value.trim();
  if (!feedback) { showError('revError', 'ပြင်ဆင်ချက် (Feedback) ရေးပါ။'); return; }
  if (!lastResult) { showError('revError', 'အရင် Content ကို ဖန်တီးပါ။'); return; }
  setLoading('revLoading', true);
  hideError('revError');
  document.getElementById('reviseBtn').disabled = true;
  addHistory('user', feedback);
  var type = document.getElementById('typeSelect').value;
  var byok = document.getElementById('byokInput').value.trim();
  var body = {
    originalContent: lastResult.content || '',
    originalSpeaking: lastResult.speakingStyle || '',
    originalVoice: lastResult.voiceStyle || '',
    feedback: feedback,
    type: type
  };
  if (byok) body.apiKey = byok;
  apiCall('/api/studio/content/revise', body)
    .then(function(data) {
      lastResult = data;
      document.getElementById('contentOut').textContent = data.content || '(empty)';
      document.getElementById('speakingOut').textContent = data.speakingStyle || '(empty)';
      document.getElementById('voiceOut').textContent = data.voiceStyle || '(empty)';
      document.getElementById('feedbackInput').value = '';
      addHistory('ai', 'ပြင်ဆင်ပြီးပါပြီ — အထက်ပါရလဒ်ကို ကြည့်ပါ။');
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
  var roleLabel = role === 'user' ? 'သင် (User)' : 'AI';
  div.innerHTML = '<div class="role">' + roleLabel + '</div>' + escapeHtml(text);
  document.getElementById('reviseHistory').appendChild(div);
}

// ===== Tab 2: Video Plan =====
function generateVideo() {
  var idea = document.getElementById('videoIdeaInput').value.trim();
  var type = document.getElementById('videoTypeSelect').value;
  var byok = document.getElementById('videoByokInput').value.trim();
  if (!idea) { showError('videoError', 'အကြောင်းအရာ (User Idea) ထည့်ပါ။'); return; }
  setLoading('videoLoading', true);
  hideError('videoError');
  document.getElementById('videoGenBtn').disabled = true;
  var body = { idea: idea, type: type };
  if (byok) body.apiKey = byok;
  apiCall('/api/studio/content/video', body)
    .then(function(data) {
      videoPlan = data;
      renderVideoPlan(data);
      document.getElementById('videoResult').style.display = 'block';
    })
    .catch(function(err) { showError('videoError', err.message); })
    .finally(function() {
      setLoading('videoLoading', false);
      document.getElementById('videoGenBtn').disabled = false;
    });
}
function renderVideoPlan(data) {
  var charsCard = document.getElementById('charactersCard');
  var charsList = document.getElementById('charactersList');
  if (data.characters && data.characters.length > 0) {
    charsCard.style.display = 'block';
    charsList.innerHTML = '';
    for (var i = 0; i < data.characters.length; i++) {
      var c = data.characters[i];
      var div = document.createElement('div');
      div.className = 'character-chip';
      div.innerHTML = '<div class="character-name">' + escapeHtml(c.name || 'Character ' + (i + 1)) + '</div>' +
                      '<div class="character-desc">' + escapeHtml(c.description || '') + '</div>';
      charsList.appendChild(div);
    }
  } else {
    charsCard.style.display = 'none';
  }
  var scenesList = document.getElementById('scenesList');
  scenesList.innerHTML = '';
  if (data.scenes && data.scenes.length > 0) {
    for (var i = 0; i < data.scenes.length; i++) {
      (function(idx) {
        var s = data.scenes[idx];
        var item = document.createElement('div');
        item.className = 'scene-item';
        var html = '<div class="scene-header">' +
          '<span class="scene-num">Scene ' + (s.number || (idx + 1)) + '</span>' +
          (s.duration ? '<span class="scene-duration">' + escapeHtml(s.duration) + '</span>' : '') +
          '</div>';
        if (s.description) {
          html += '<div class="scene-field"><div class="scene-field-label">ဖော်ပြချက် (Description)</div>' +
                  '<div class="scene-field-text">' + escapeHtml(s.description) + '</div></div>';
        }
        if (s.visualPrompt) {
          html += '<div class="scene-field"><div class="scene-field-label">' +
                  'ရုပ်ပုံ Prompt <button class="btn-ghost" onclick="copySceneText(' + idx + ')">&#128203; Copy</button></div>' +
                  '<div class="scene-field-text" id="sceneVP_' + idx + '">' + escapeHtml(s.visualPrompt) + '</div></div>';
        }
        if (s.dialogue) {
          html += '<div class="scene-field"><div class="scene-field-label">စကားပြော (Dialogue)</div>' +
                  '<div class="scene-field-text">' + escapeHtml(s.dialogue) + '</div></div>';
        }
        html += '<div class="scene-image-area" id="sceneImg_' + idx + '">' +
                '<button class="btn btn-secondary" onclick="generateSceneImage(' + idx + ')">&#128444; ဤဖြစ်စဉ်၏ ရုပ်ပုံဖန်တီးပါ</button>' +
                '</div>';
        item.innerHTML = html;
        scenesList.appendChild(item);
      })(i);
    }
  } else {
    scenesList.innerHTML = '<div style="color:var(--text3);text-align:center;padding:20px;">Scenes မတွေ့ရှိပါ</div>';
  }
}
function copySceneText(idx) {
  if (!videoPlan || !videoPlan.scenes || !videoPlan.scenes[idx]) return;
  var text = videoPlan.scenes[idx].visualPrompt || '';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() { showToast(); });
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast();
  }
}
function generateSceneImage(idx) {
  if (!videoPlan || !videoPlan.scenes || !videoPlan.scenes[idx]) return;
  var scene = videoPlan.scenes[idx];
  var prompt = scene.visualPrompt || scene.description || '';
  if (!prompt) { alert('ဒီဖြစ်စဉ်တွင် Visual Prompt မရှိပါ'); return; }
  var area = document.getElementById('sceneImg_' + idx);
  area.innerHTML = '<div class="loading show"><div class="spinner"></div> ရုပ်ပုံဖန်တီးနေပါသည်...</div>';
  var byok = document.getElementById('videoByokInput').value.trim();
  var body = { prompt: prompt };
  if (byok) body.apiKey = byok;
  apiCall('/api/studio/content/video-image', body)
    .then(function(data) {
      if (data.data) {
        var imgSrc = 'data:' + (data.mimeType || 'image/png') + ';base64,' + data.data;
        area.innerHTML = '<img src="' + imgSrc + '" alt="Scene ' + (idx + 1) + '">' +
                         '<div style="margin-top:8px;"><button class="btn-ghost" onclick="generateSceneImage(' + idx + ')">&#128260; ပြန်ဖန်တီးပါ</button></div>';
      } else {
        area.innerHTML = '<div class="scene-image-placeholder">ရုပ်ပုံမထွက်ပါ — နောက်မှ ကြိုးစားပါ</div>';
      }
    })
    .catch(function(err) {
      area.innerHTML = '<div style="color:var(--error);font-size:12px;padding:10px;">Error: ' + escapeHtml(err.message) + '</div>' +
                       '<button class="btn-ghost" onclick="generateSceneImage(' + idx + ')">ထပ်စမ်းပါ</button>';
    });
}

// ===== Helpers =====
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
function copyText(id) {
  var text = document.getElementById(id).textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() { showToast(); });
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast();
  }
}
function showToast() {
  var t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2000);
}
function escapeHtml(s) {
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
</script>
</body>
</html>`;
