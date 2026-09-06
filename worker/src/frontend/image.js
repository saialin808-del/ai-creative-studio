// AI Creative Studio — Image Studio Frontend 
// Tab 1: ပုံအမျိုးအစား (Image Prompt → Generate Image)
// Tab 2: ကြော်ငြာပုံ (Ad Image Prompt → Generate Image)
// Dark Theme preserved from Source (Google Apps Script UI)

export const IMAGE_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Image Studio — AI Creative Studio</title>
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
.page-title { font-size: 22px; font-weight: 700; color: var(--cyan); margin-bottom: 16px; }
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
textarea { resize: vertical; min-height: 70px; }
select { cursor: pointer; }
select option { background: var(--bg-card); color: var(--text); }
.form-group { margin-bottom: 16px; }
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
.btn-success { background: var(--success); color: #080c18; }
.btn-purple { background: var(--purple); color: #fff; }
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
.type-chip.locked { opacity: 0.45; cursor: not-allowed; }
.type-chip.locked:hover { border-color: var(--border); color: var(--text2); }
.ref-upload-area { margin-top: 14px; }
.ref-upload-area input[type="file"] {
  padding: 10px;
  background: var(--bg-input);
  color: var(--text2);
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
  font-size: 13px;
}
.ref-hint { color: var(--text3); font-size: 12px; margin-top: 6px; line-height: 1.5; }
.ref-preview { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.ref-thumb { position: relative; width: 72px; height: 72px; }
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
.result-box {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  white-space: pre-wrap;
  line-height: 1.7;
  font-size: 14px;
  min-height: 60px;
  margin-bottom: 12px;
}
.image-result-area img {
  width: 100%;
  border-radius: 10px;
  margin-top: 10px;
}
.image-result-area a { display: inline-block; margin-top: 8px; }
.hint-note { color: var(--text3); font-size: 12px; margin-top: 10px; font-style: italic; }
.action-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
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
.login-prompt { text-align: center; padding: 60px 20px; }
.login-prompt h2 { color: var(--cyan); margin-bottom: 12px; }
.login-prompt p { color: var(--text2); margin-bottom: 20px; }
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
  <div class="sidebar" id="sidebar">
    <a href="/app">&#127968; <span>ပင်မ</span></a>
    <a href="/app/story"><span class="nav-icon">&#128214;</span> ဇာတ်လမ်း</a>
    <a href="/app/content"><span class="nav-icon">&#9997;</span> ကอนเทนต်</a>
    <a href="/app/short"><span class="nav-icon">&#127916;</span> ရှော့တ်</a>
    <a href="/app/image" class="active"><span class="nav-icon">&#128444;</span> ဓာတ်ပုံ</a>
    <a href="/app/voice"><span class="nav-icon">&#127908;</span> အသံ <span class="soon">မကြာမီ</span></a>
    <a href="/app/shop"><span class="nav-icon">&#128722;</span> စျေး <span class="soon">မကြာမီ</span></a>
    <a href="/app#creations"><span class="nav-icon">&#128190;</span> ဖန်တီးမှုများ</a>
  </div>
  <div class="main">
    <div id="loginView" class="login-prompt" style="display:none;">
      <h2>Login လုပ်ရန် လိုအပ်ပါသည်</h2>
      <p>Image Studio ကို အသုံးပြုရန် Google နဲ့ Login ဝင်ပါ။</p>
      <a href="/auth/google" class="btn btn-primary">Google နဲ့ Login</a>
    </div>
    <div id="appView">
      <h1 class="page-title">&#127912; Image Studio</h1>
      <div class="tabs">
        <button class="tab active" onclick="switchTab(1)">&#127912; ပုံအမျိုးအစား</button>
        <button class="tab" onclick="switchTab(2)">&#128228; ကြော်ငြာပုံ</button>
      </div>

      <!-- TAB 1: IMAGE PROMPT -->
      <div class="tab-content active" id="tab1">
        <div class="card">
          <div class="card-title">&#127912; Image Prompt ဖန်တီးရန်</div>
          <p style="color:var(--text2);font-size:13px;margin-bottom:14px;">
            Type ရွေးပြီး အောက်ကနေရာလေးများကို ဖြည့်ရေးပါ — AI Image Prompt ဖန်တီးပေးပါမယ်။
          </p>
          <div class="type-chips" id="typeChips1"></div>
          <div id="ideaFields1"></div>
          <div class="ref-upload-area">
            <label>&#128444; Reference ပုံများ ပူးတွဲရန် (ချန်ထားလို့ရသည်)</label>
            <input type="file" id="refInput1" accept="image/*" multiple onchange="onRefSelected(1)">
            <p class="ref-hint">အများဆုံး ၅ ပုံအထိ Upload တင်နိုင်ပါတယ် (ပုံတစ်ပုံချင်းစီ Max 5MB)</p>
            <div class="ref-preview" id="refPreview1"></div>
          </div>
          <button class="btn btn-primary" id="genBtn1" onclick="generatePrompt(1)" style="margin-top:16px;">&#9654; Generate Image Prompt</button>
          <div class="loading" id="loading1"><div class="spinner"></div> AI Image Prompt ရေးသားနေပါသည်...</div>
          <div class="error-box" id="error1"></div>
        </div>
        <div id="resultSection1" style="display:none;">
          <div class="card">
            <div class="card-title">&#128221; Image Prompt (Text)</div>
            <div class="result-box" id="result1"></div>
            <div class="action-row">
              <button class="btn btn-success" onclick="copyResult(1)">&#128203; Copy Prompt</button>
              <button class="btn btn-purple" onclick="saveToCreations(1)">&#128190; Save to My Creations</button>
            </div>
          </div>
          <div class="card">
            <div class="card-title">&#127912; AI ပုံအစစ် ဖန်တီးရန်</div>
            <button class="btn btn-purple" id="imgBtn1" onclick="generateImage(1)">&#127912; Generate Image</button>
            <div class="loading" id="imgLoading1"><div class="spinner"></div> AI ပုံဆွဲနေပါသည်... (မိနစ်အနည်းငယ် ကြာနိုင်ပါသည်)</div>
            <div class="error-box" id="imgError1"></div>
            <div class="image-result-area" id="imgArea1"></div>
            <p class="hint-note">&#128161; ပုံကို "💾 Save Image" ခလုတ်ကနေ တိုက်ရိုက် Download ဆွဲပါ</p>
          </div>
        </div>
      </div>

      <!-- TAB 2: AD IMAGE -->
      <div class="tab-content" id="tab2">
        <div class="card">
          <div class="card-title">&#128228; ကြော်ငြာပုံ Prompt ဖန်တီးရန်</div>
          <p style="color:var(--text2);font-size:13px;margin-bottom:14px;">
            Type ရွေးပြီး အောက်ကနေရာလေးများကို ဖြည့်ရေးပါ — AI ကြော်ငြာပုံ Prompt ဖန်တီးပေးပါမယ်။
          </p>
          <div class="type-chips" id="typeChips2"></div>
          <div id="ideaFields2"></div>
          <div class="ref-upload-area">
            <label>&#128444; Product Reference ပုံများ ပူးတွဲရန် (ချန်ထားလို့ရသည်)</label>
            <input type="file" id="refInput2" accept="image/*" multiple onchange="onRefSelected(2)">
            <p class="ref-hint">အများဆုံး ၅ ပုံအထိ Upload တင်နိုင်ပါတယ် (ပုံတစ်ပုံချင်းစီ Max 5MB)</p>
            <div class="ref-preview" id="refPreview2"></div>
          </div>
          <button class="btn btn-primary" id="genBtn2" onclick="generatePrompt(2)" style="margin-top:16px;">&#9654; Generate Ad Prompt</button>
          <div class="loading" id="loading2"><div class="spinner"></div> AI ကြော်ငြာပုံ Prompt ရေးသားနေပါသည်...</div>
          <div class="error-box" id="error2"></div>
        </div>
        <div id="resultSection2" style="display:none;">
          <div class="card">
            <div class="card-title">&#128221; Ad Image Prompt (Text)</div>
            <div class="result-box" id="result2"></div>
            <div class="action-row">
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
    </div>
  </div>
</div>
<div class="toast" id="toast">&#9989; အောင်မြင်ပါသည်</div>
<script>
var token = localStorage.getItem('aics_token') || '';
var userEmail = localStorage.getItem('aics_email') || '';
var userPlan = localStorage.getItem('aics_plan') || 'FREE';
var isPro = (userPlan === 'PRO');

var FIELD_CONFIG_1 = [
  { label: "ပုံဖော်ပြချင်တဲ့ အကြောင်းအရာ", placeholder: "ဥပမာ — Image ထဲမှာ ဘယ်လိုမျိုး ပုံစံ ပြချင်တယ်ဆိုတာ ဖော်ပြပါ", required: true, multiline: true },
  { label: "Image Prompt ဘယ်နှစ်မျိုး ထုတ်မလဲ", type: "select", options: ["1 မျိုး", "2 မျိုး", "3 မျိုး", "4 မျိုး"] },
  { label: "Aspect Ratio (ပုံအချိုးအစား)", type: "select", options: ["9:16 (Vertical - Reels / TikTok / Story)", "1:1 (Square - Facebook / IG Post)", "16:9 (Wide - YouTube / Landscape)", "4:5 (Portrait - IG Post)", "အခြား (AI ကို လွတ်လပ်စွာ ဆုံးဖြတ်ခိုင်းမည်)"] },
  { label: "စာတန်းထိုး (Caption Text) နေရာ ထည့်မလား", type: "select", options: ["မလိုအပ်ပါ", "လိုအပ်ပါတယ် - Text ထည့်ဖို့ နေရာချန်ပါ"] }
];

var FIELD_CONFIG_2 = [
  { label: "ကုန်ပစ္စည်း/ဝန်ဆောင်မှု အချက်အလက်", placeholder: "ဥပမာ — ဘာကုန်ပစ္စည်းအတွက် ကြော်ငြာပုံ ဖန်တီးချင်ပါသလဲ", required: true, multiline: true },
  { label: "ဈေးလျှော့/Promotion စာသား (ချန်ထားလို့ရသည်)", placeholder: "ဥပမာ — 30% Off, Buy 1 Get 1, Free Delivery" },
  { label: "Image Prompt ဘယ်နှစ်မျိုး ထုတ်မလဲ", type: "select", options: ["1 မျိုး", "2 မျိုး", "3 မျိုး", "4 မျိုး"] },
  { label: "Aspect Ratio (ပုံအချိုးအစား)", type: "select", options: ["9:16 (Vertical - Reels / TikTok / Story)", "1:1 (Square - Facebook / IG Post)", "16:9 (Wide - YouTube / Landscape)", "4:5 (Portrait - IG Post)", "အခြား (AI ကို လွတ်လပ်စွာ ဆုံးဖြတ်ခိုင်းမည်)"] },
  { label: "စာတန်းထိုး (Caption/CTA Text) နေရာ ထည့်မလား", type: "select", options: ["မလိုအပ်ပါ", "လိုအပ်ပါတယ် - Text ထည့်ဖို့ နေရာချန်ပါ"] }
];

var TYPES_1 = [
  { v: '1', label: '💡 Idea To Image (Free)', pro: false },
  { v: '2', label: '👤 Character Design (Pro)', pro: true },
  { v: '3', label: '📱 Social Media Thumbnail (Pro)', pro: true },
  { v: '4', label: '🛒 Product Image (Pro)', pro: true },
  { v: '5', label: '👤🛒 Character Product Ad (Pro)', pro: true }
];

var TYPES_2 = [
  { v: '1', label: '🛍️ Product Ad Poster (Free)', pro: false },
  { v: '2', label: '💥 Discount / Sale ကြော်ငြာ (Pro)', pro: true },
  { v: '3', label: '👤🛍️ Model ဝတ်ဆင်ပြသ ကြော်ငြာ (Pro)', pro: true },
  { v: '4', label: '⭐ Before / After ကြော်ငြာ (Pro)', pro: true },
  { v: '5', label: '🎬 Social Media Ad Banner (Pro)', pro: true }
];

var MAX_REF = 5;
var selectedType = { 1: '1', 2: '1' };
var currentIdea = { 1: '', 2: '' };
var refImages = { 1: [], 2: [] };

(function init() {
  if (!token) {
    document.getElementById('loginView').style.display = 'block';
    document.getElementById('appView').style.display = 'none';
    return;
  }
  document.getElementById('userEmail').textContent = userEmail || '—';
  document.getElementById('planBadge').textContent = userPlan || 'FREE';
  buildTypeChips(1, TYPES_1);
  buildTypeChips(2, TYPES_2);
  buildFields(1, FIELD_CONFIG_1);
  buildFields(2, FIELD_CONFIG_2);
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

function buildTypeChips(tab, types) {
  var container = document.getElementById('typeChips' + tab);
  types.forEach(function(t) {
    var chip = document.createElement('button');
    chip.className = 'type-chip' + (t.v === '1' ? ' active' : '') + (t.pro && !isPro ? ' locked' : '');
    chip.textContent = (t.pro && !isPro ? '🔒 ' : '') + t.label;
    chip.onclick = function() {
      if (t.pro && !isPro) { showToast('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။ Upgrade လိုအပ်ပါသည်။', true); return; }
      var chips = container.querySelectorAll('.type-chip');
      for (var i = 0; i < chips.length; i++) chips[i].classList.remove('active');
      chip.classList.add('active');
      selectedType[tab] = t.v;
    };
    container.appendChild(chip);
  });
}

function buildFields(tab, config) {
  var container = document.getElementById('ideaFields' + tab);
  container.innerHTML = '';
  config.forEach(function(field, idx) {
    var row = document.createElement('div');
    row.className = 'form-group';
    var label = document.createElement('label');
    label.textContent = field.label + (field.required ? ' *' : '');
    var input;
    if (field.type === 'select') {
      input = document.createElement('select');
      field.options.forEach(function(optText) {
        var option = document.createElement('option');
        option.value = optText;
        option.textContent = optText;
        input.appendChild(option);
      });
    } else if (field.multiline) {
      input = document.createElement('textarea');
      input.rows = 2;
      input.placeholder = field.placeholder || '';
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.placeholder = field.placeholder || '';
    }
    input.id = 'field_' + tab + '_' + idx;
    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  });
}

function collectIdea(tab, config) {
  var lines = [];
  var valid = true;
  config.forEach(function(field, idx) {
    var val = document.getElementById('field_' + tab + '_' + idx).value.trim();
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

function onRefSelected(tab) {
  var fileInput = document.getElementById('refInput' + tab);
  var files = fileInput.files;
  for (var i = 0; i < files.length; i++) {
    if (refImages[tab].length >= MAX_REF) {
      showToast('Reference ပုံ အများဆုံး ' + MAX_REF + ' ပုံပဲ တင်လို့ရပါတယ်။', true);
      break;
    }
    var file = files[i];
    if (file.size > 5 * 1024 * 1024) {
      showToast("'" + file.name + "' ပုံသည် 5MB ထက် ကျော်နေလို့ ကျော်သွားပါမည်။", true);
      continue;
    }
    addRefFile(tab, file);
  }
  fileInput.value = '';
}

function addRefFile(tab, file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    refImages[tab].push({
      dataUrl: e.target.result,
      base64: e.target.result.split(',')[1],
      mimeType: file.type
    });
    renderRefPreviews(tab);
  };
  reader.readAsDataURL(file);
}

function renderRefPreviews(tab) {
  var container = document.getElementById('refPreview' + tab);
  container.innerHTML = '';
  refImages[tab].forEach(function(img, idx) {
    var thumb = document.createElement('div');
    thumb.className = 'ref-thumb';
    var imgEl = document.createElement('img');
    imgEl.src = img.dataUrl;
    var removeBtn = document.createElement('button');
    removeBtn.className = 'remove-x';
    removeBtn.textContent = '✕';
    removeBtn.onclick = function() { removeRef(tab, idx); };
    thumb.appendChild(imgEl);
    thumb.appendChild(removeBtn);
    container.appendChild(thumb);
  });
}

function removeRef(tab, idx) {
  refImages[tab].splice(idx, 1);
  renderRefPreviews(tab);
}

function generatePrompt(tab) {
  var config = (tab === 1) ? FIELD_CONFIG_1 : FIELD_CONFIG_2;
  var collected = collectIdea(tab, config);
  if (!collected.valid) {
    showToast(tab === 1 ? 'ပုံဖော်ပြချင်တဲ့ အကြောင်းအရာ အနည်းဆုံး ဖြည့်ရေးပါ' : 'ကုန်ပစ္စည်း/ဝန်ဆောင်မှု အချက်အလက် အနည်းဆုံး ဖြည့်ရေးပါ', true);
    return;
  }
  currentIdea[tab] = collected.text;
  setLoading('loading' + tab, true);
  hideError('error' + tab);
  document.getElementById('genBtn' + tab).disabled = true;
  var endpoint = (tab === 1) ? '/api/studio/image/prompt' : '/api/studio/image/ad-prompt';
  var body = { idea: collected.text, type: selectedType[tab] };
  if (refImages[tab].length > 0) {
    body.images = refImages[tab].map(function(img) { return { base64: img.base64, mimeType: img.mimeType }; });
  }
  apiCall(endpoint, body)
    .then(function(data) {
      document.getElementById('result' + tab).textContent = data.prompt || '(empty)';
      document.getElementById('resultSection' + tab).style.display = 'block';
      document.getElementById('imgArea' + tab).innerHTML = '';
    })
    .catch(function(err) { showError('error' + tab, err.message); })
    .finally(function() {
      setLoading('loading' + tab, false);
      document.getElementById('genBtn' + tab).disabled = false;
    });
}

function generateImage(tab) {
  var promptText = document.getElementById('result' + tab).textContent;
  if (!promptText || !promptText.trim()) {
    showToast('ပုံဖန်တီးဖို့ Prompt အရင် Generate လုပ်ပါ။', true);
    return;
  }
  setLoading('imgLoading' + tab, true);
  hideError('imgError' + tab);
  document.getElementById('imgBtn' + tab).disabled = true;
  document.getElementById('imgArea' + tab).innerHTML = '';
  apiCall('/api/studio/image/generate', { prompt: promptText })
    .then(function(data) {
      var dataUri = 'data:' + data.mimeType + ';base64,' + data.data;
      var img = document.createElement('img');
      img.src = dataUri;
      var link = document.createElement('a');
      link.href = dataUri;
      link.download = (tab === 1 ? 'image_studio_output.png' : 'ad_image_studio_output.png');
      var dlBtn = document.createElement('button');
      dlBtn.className = 'btn btn-success';
      dlBtn.style.padding = '8px 16px';
      dlBtn.style.fontSize = '13px';
      dlBtn.textContent = '💾 Save Image';
      link.appendChild(dlBtn);
      document.getElementById('imgArea' + tab).appendChild(img);
      document.getElementById('imgArea' + tab).appendChild(document.createElement('br'));
      document.getElementById('imgArea' + tab).appendChild(link);
    })
    .catch(function(err) { showError('imgError' + tab, err.message); })
    .finally(function() {
      setLoading('imgLoading' + tab, false);
      document.getElementById('imgBtn' + tab).disabled = false;
    });
}

function copyResult(tab) {
  var text = document.getElementById('result' + tab).textContent;
  if (!text) { showToast('Copy လုပ်ဖို့ Result မရှိသေးပါ', true); return; }
  copyToClipboard(text);
  showToast('✓ Copy ပြီးပါပြီ');
}

function saveToCreations(tab) {
  var resultText = document.getElementById('result' + tab).textContent;
  if (!resultText) { showToast('Save လုပ်ဖို့ Result မရှိသေးပါ။ Generate အရင်လုပ်ပါ။', true); return; }
  var topic = document.getElementById('field_' + tab + '_0').value.trim() || (tab === 1 ? 'Image Prompt' : 'Ad Image Prompt');
  var defaultTitle = topic.substring(0, 40) + (topic.length > 40 ? '...' : '');
  var title = prompt('Creation အမည် ပေးပါ:', defaultTitle);
  if (title === null) return;
  apiCall('/api/creations', {
    studio: tab === 1 ? 'IMAGE' : 'IMAGEAD',
    type: selectedType[tab],
    original_prompt: currentIdea[tab],
    ai_output: resultText,
    title: title || defaultTitle
  })
    .then(function() { showToast('💾 My Creations ထဲ Save ပြီးပါပြီ'); })
    .catch(function(err) { showToast('Save မအောင်မြင်ပါ: ' + err.message, true); });
}

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
</script>
</body>
</html>`;
