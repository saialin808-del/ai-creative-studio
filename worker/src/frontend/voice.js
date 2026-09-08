// AI Creative Studio — Voice Studio Frontend (Phase 7)
// Tab 1: Text → Voice (TTS with 30 voices + PRO SRT/Translation)
// Tab 2: Voice → Text (Audio Transcribe + PRO SRT/Translation)
// Dark Theme preserved from Source (Google Apps Script UI)
// Studio Isolation: ဤ File သည် Voice Studio UI နှင့်သာ သက်ဆိုင်သည်။
// Phase 4 — Sidebar + Helper Script များကို Shared Component (frontend/shared.js) မှ ယူသည်

import { renderSidebar, sidebarScript } from './shared.js';

export const VOICE_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Voice Studio — AI Creative Studio</title>
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
.card.locked { opacity: 0.45; pointer-events: none; }
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--cyan);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.pro-tag {
  background: rgba(123,92,255,0.2);
  color: var(--purple);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
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
input[type="file"] {
  padding: 10px;
  cursor: pointer;
  font-size: 13px;
}
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
.btn-secondary {
  background: var(--bg-card2);
  color: var(--cyan);
  border: 1px solid var(--border-strong);
}
.btn-secondary:hover { background: rgba(0,229,255,0.1); }
.btn-purple {
  background: linear-gradient(135deg, var(--purple), #9b7dff);
  color: #fff;
}
.btn-purple:hover { opacity: 0.9; }
.btn-green {
  background: rgba(0,230,118,0.15);
  color: var(--success);
  border: 1px solid rgba(0,230,118,0.3);
}
.btn-green:hover { background: rgba(0,230,118,0.25); }
.btn-sm { padding: 8px 16px; font-size: 12.5px; min-height: 36px; }
.btn-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
.hint {
  font-size: 12.5px;
  color: var(--text2);
  margin-bottom: 14px;
  line-height: 1.5;
}
.loading {
  color: var(--cyan);
  font-size: 13px;
  margin-top: 12px;
  display: none;
}
.loading.show { display: block; }
.result-box {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  margin-top: 12px;
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 13.5px;
  min-height: 40px;
}
.srt-editable {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  color: var(--text);
  font-family: 'Courier New', monospace;
  font-size: 12.5px;
  line-height: 1.6;
  resize: vertical;
  min-height: 130px;
  margin-top: 8px;
  box-sizing: border-box;
}
.srt-editable:focus {
  outline: none;
  border-color: var(--cyan);
}
.srt-readonly {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  margin-top: 8px;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 12.5px;
  line-height: 1.6;
  min-height: 60px;
  color: var(--text);
}
.srt-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--cyan);
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.edit-hint {
  font-size: 10.5px;
  color: var(--text2);
  background: var(--bg-card2);
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: normal;
}
.direction-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}
.dir-chip {
  background: var(--bg-input);
  border: 2px solid var(--border);
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 12.5px;
  transition: all 0.2s;
  color: var(--text2);
  user-select: none;
}
.dir-chip:hover { border-color: var(--cyan); }
.dir-chip.selected {
  border-color: var(--cyan);
  background: rgba(0,229,255,0.1);
  color: var(--text);
}
.dir-chip.locked { opacity: 0.4; pointer-events: none; }
.audio-container { margin-top: 14px; }
audio { width: 100%; margin-top: 10px; }
.pro-lock-note {
  color: var(--warn);
  font-size: 12.5px;
  margin-top: 12px;
}
.divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 20px 0;
}
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card2);
  border: 1px solid var(--border-strong);
  color: var(--text);
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 13.5px;
  z-index: 1000;
  display: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
.toast.show { display: block; }
.toast.error { border-color: var(--error); color: var(--error); }
.toast.success { border-color: var(--success); color: var(--success); }
@media (max-width: 768px) {
  .sidebar { display: none; }
  .sidebar.open { display: block; position: fixed; left: 0; top: 57px; bottom: 0; z-index: 99; width: 240px; }
  .menu-btn { display: block; }
  .main { padding: 16px; }
  .header-right .user-email { display: none; }
}
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <button class="menu-btn" onclick="toggleSidebar()">☰</button>
    <div class="logo">🎨 AI Creative Studio</div>
  </div>
  <div class="header-right">
    <span class="user-email" id="userEmail"></span>
    <span class="plan-badge" id="planBadge">FREE</span>
  </div>
</div>

<div class="layout">
  ${renderSidebar('voice', { variant: 'studio' })}

  <main class="main">
    <h1 class="page-title">🎙 Voice Studio</h1>
<div class="card" style="padding:14px 18px;margin-bottom:16px;">
<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
<label style="margin:0;white-space:nowrap;font-weight:600;">&#129302; AI Model</label>
<select id="aiModelSel" data-category="voice" style="max-width:340px;flex:1;"></select>
<span style="font-size:11.5px;color:var(--text3);">ရွေးထားသော Model ဖြင့် Generate လုပ်ပါမည်</span>
</div></div>

    <div class="tabs">
      <button class="tab active" onclick="switchTab('01')">📝 Text → Voice</button>
      <button class="tab" onclick="switchTab('02')">🎙 Voice → Text</button>
    </div>

    <!-- ===== TAB 01: Text → Voice ===== -->
    <div class="tab-content active" id="tab01">
      <div class="card">
        <div class="card-title">🔊 Idea Text → Voice</div>
        <p class="hint">Text ရေးပြီး AI Voice Audio ဖန်တီးပါ။ Audio ကို "💾 Save Audio" ကနေ download ဆွဲပါ။</p>
        <div class="form-group">
          <label>Voice ပြောင်းလိုသော Text</label>
          <textarea id="ttsText01" placeholder="Voice ပြောင်းလိုသော Text ကို ထည့်ပါ"></textarea>
        </div>
        <div class="form-group">
          <label>🗣️ Speaking & Voice Style ညွှန်ကြားချက် (ချန်ထားလို့ရပါသည်)</label>
          <textarea id="styleInstruction01" style="min-height:60px;" placeholder="ဥပမာ - နှေးညင်းစွာ ခံစားချက်ပါပြောပါ / တက်ကြွစွာ လျင်မြန်စွာ ပြောပါ"></textarea>
        </div>
        <div class="form-group">
          <label>🎭 Voice ရွေးချယ်ရန် (၃၀ မျိုး)</label>
          <select id="voiceNameSelect01">
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
        <div class="btn-row">
          <button class="btn btn-primary" id="genVoiceBtn01" onclick="generateVoice01()">🎙 Generate Voice</button>
          <button class="btn btn-green btn-sm" onclick="copyText01()">📋 Copy Content</button>
          <button class="btn btn-purple btn-sm" onclick="saveText01()">💾 Save to Creations</button>
        </div>
        <div class="loading" id="loading01a">⏳ AI Voice ဖန်တီးနေပါသည်...</div>
        <div class="audio-container" id="audioContainer01"></div>
      </div>

      <div class="card" id="proCard01">
        <div class="card-title">🌐 Translation & SRT <span class="pro-tag">PRO</span></div>
        <p class="hint">အပေါ်က "Generate Voice" ကနေ ဖန်တီးလိုက်တဲ့ Audio ကနေ SRT Subtitle ကို ထုတ်နိုင်ပါတယ်။ Timestamp များသည် အကြမ်းဖျင်း ခန့်မှန်းချက်သာ ဖြစ်ပါသည်။</p>
        <div class="srt-label">🎬 မူရင်း SRT <span class="edit-hint">✏️ ပြင်ဆင်လို့ရသည်</span></div>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px;" id="genSrtBtn01" onclick="generateSrt01()">🔄 Generate SRT (မူရင်း)</button>
        <textarea class="srt-editable" id="srtOriginal01" placeholder="(အပေါ်က 'Generate Voice' ကနေ Audio ဖန်တီးပြီးမှ 'Generate SRT' ကို နှိပ်ပါ)"></textarea>
        <div class="btn-row">
          <button class="btn btn-green btn-sm" onclick="copySrt('srtOriginal01')">📋 Copy SRT</button>
          <button class="btn btn-secondary btn-sm" onclick="downloadSrt('srtOriginal01','original_subtitle.srt')">💾 Save .srt</button>
          <button class="btn btn-purple btn-sm" onclick="saveSrt01('original')">💾 Save to Creations</button>
        </div>
        <hr class="divider">
        <p class="hint">ဘာသာပြန်လိုသော ဘက်ကို ရွေးပြီး "ဘာသာပြန်ရန်" နှိပ်ပါ (အပေါ်က မူရင်း SRT ကို ပြင်ဆင်ထားပါက ပြင်ဆင်ထားသော Text အတိုင်း ဘာသာပြန်ပါမည်):</p>
        <div class="direction-row">
          <button class="btn btn-primary btn-sm" id="translateBtn01" onclick="translateSrt01()">ဘာသာပြန်ရန်</button>
          <div class="dir-chip selected" data-dir="MY_TO_CN" onclick="selectDir01(this)">🇲🇲→🇨🇳 မြန်မာ → တရုတ်</div>
          <div class="dir-chip" data-dir="CN_TO_MY" onclick="selectDir01(this)">🇨🇳→🇲🇲 တရုတ် → မြန်မာ</div>
        </div>
        <div class="loading" id="loading01b">⏳ SRT ဘာသာပြန်နေပါသည်...</div>
        <div class="srt-label">✅ ဘာသာပြန်ထားသော SRT</div>
        <div class="srt-readonly" id="srtTranslated01">("ဘာသာပြန်ရန်" ခလုတ်ကို နှိပ်ပါက ဒီနေရာတွင် ပေါ်ပါမည်)</div>
        <div class="btn-row">
          <button class="btn btn-green btn-sm" onclick="copyTranslated01()">📋 Copy SRT</button>
          <button class="btn btn-secondary btn-sm" onclick="downloadTranslated01()">💾 Save .srt</button>
          <button class="btn btn-purple btn-sm" onclick="saveSrt01('translated')">💾 Save to Creations</button>
        </div>
        <div class="pro-lock-note" id="proLock01"></div>
      </div>
    </div>

    <!-- ===== TAB 02: Voice → Text ===== -->
    <div class="tab-content" id="tab02">
      <div class="card">
        <div class="card-title">🎙 Audio → Text (Transcribe)</div>
        <p class="hint">Audio file တင်ပြီး Text အဖြစ် Transcribe လုပ်ပါ (5MB ထက် မကျော်ရပါ)။</p>
        <div class="form-group">
          <label>Audio File (mp3, wav, m4a, aac, ogg)</label>
          <input type="file" id="audioFile02" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm">
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="transcribeBtn02" onclick="transcribe02()">📝 Transcribe</button>
        </div>
        <div class="loading" id="loading02a">⏳ Audio ကို Text ပြောင်းနေပါသည်... (မိနစ်အနည်းငယ် ကြာနိုင်ပါသည်)</div>
        <div class="result-box" id="transcriptResult02"></div>
        <div class="btn-row" id="transcriptActions02" style="display:none;">
          <button class="btn btn-green btn-sm" onclick="copyTranscript02()">📋 Copy Text</button>
          <button class="btn btn-purple btn-sm" onclick="saveTranscript02()">💾 Save to Creations</button>
        </div>
      </div>

      <div class="card" id="proCard02">
        <div class="card-title">🌐 Translation & SRT <span class="pro-tag">PRO</span></div>
        <p class="hint">အပေါ်က "Transcribe" လုပ်ထားတဲ့ Audio file ကနေ SRT Subtitle ကို ထုတ်နိုင်ပါတယ်။</p>
        <div class="srt-label">🎬 မူရင်း SRT <span class="edit-hint">✏️ ပြင်ဆင်လို့ရသည်</span></div>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px;" id="genSrtBtn02" onclick="generateSrt02()">🔄 Generate SRT (မူရင်း)</button>
        <textarea class="srt-editable" id="srtOriginal02" placeholder="(အပေါ်က Audio file ရွေးပြီး 'Generate SRT' ကို နှိပ်ပါ)"></textarea>
        <div class="btn-row">
          <button class="btn btn-green btn-sm" onclick="copySrt('srtOriginal02')">📋 Copy SRT</button>
          <button class="btn btn-secondary btn-sm" onclick="downloadSrt('srtOriginal02','original_subtitle.srt')">💾 Save .srt</button>
          <button class="btn btn-purple btn-sm" onclick="saveSrt02('original')">💾 Save to Creations</button>
        </div>
        <hr class="divider">
        <p class="hint">ဘာသာပြန်လိုသော ဘက်ကို ရွေးပြီး "ဘာသာပြန်ရန်" နှိပ်ပါ:</p>
        <div class="direction-row">
          <button class="btn btn-primary btn-sm" id="translateBtn02" onclick="translateSrt02()">ဘာသာပြန်ရန်</button>
          <div class="dir-chip selected" data-dir="MY_TO_CN" onclick="selectDir02(this)">🇲🇲→🇨🇳 မြန်မာ → တရုတ်</div>
          <div class="dir-chip" data-dir="CN_TO_MY" onclick="selectDir02(this)">🇨🇳→🇲🇲 တရုတ် → မြန်မာ</div>
        </div>
        <div class="loading" id="loading02b">⏳ SRT ဘာသာပြန်နေပါသည်...</div>
        <div class="srt-label">✅ ဘာသာပြန်ထားသော SRT</div>
        <div class="srt-readonly" id="srtTranslated02">("ဘာသာပြန်ရန်" ခလုတ်ကို နှိပ်ပါက ဒီနေရာတွင် ပေါ်ပါမည်)</div>
        <div class="btn-row">
          <button class="btn btn-green btn-sm" onclick="copyTranslated02()">📋 Copy SRT</button>
          <button class="btn btn-secondary btn-sm" onclick="downloadTranslated02()">💾 Save .srt</button>
          <button class="btn btn-purple btn-sm" onclick="saveSrt02('translated')">💾 Save to Creations</button>
        </div>
        <div class="pro-lock-note" id="proLock02"></div>
      </div>
    </div>

  </main>
</div>

<div class="toast" id="toast"></div>
${sidebarScript()}
<script>
var TOKEN = localStorage.getItem('aics_token') || '';
var USER_PLAN = 'FREE';
var lastAudioBase64_01 = '';
var lastAudioMime_01 = 'audio/wav';
var lastAudioBase64_02 = '';
var lastAudioMime_02 = 'audio/mpeg';
var selectedDir01 = 'MY_TO_CN';
var selectedDir02 = 'MY_TO_CN';
var translatedSrt01 = '';
var translatedSrt02 = '';

function api(path, opts) {
  opts = opts || {};
  var s = document.getElementById('aiModelSel');
  if (s && s.value && opts.body) opts.body.model = s.value;
  var headers = opts.headers || {};
  headers['Content-Type'] = 'application/json';
  if (TOKEN) headers['Authorization'] = 'Bearer ' + TOKEN;
  return fetch(path, {
    method: opts.method || 'GET',
    headers: headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }).then(function(r) { return r.json(); });
}

function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(function() { t.className = 'toast'; }, 2500);
}

function switchTab(id) {
  document.querySelectorAll('.tab').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
  event.target.classList.add('active');
  document.getElementById('tab' + id).classList.add('active');
}

function base64ToBlob(base64, mimeType) {
  var bin = atob(base64);
  var arr = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mimeType });
}

// ===== Init: Check auth + plan =====
if (!TOKEN) {
  document.body.innerHTML = '<div style="padding:40px;text-align:center;"><h2>🔒 Login လိုအပ်ပါသည်</h2><p><a href="/login" style="text-decoration:underline;">Login / Sign Up သို့ သွားရန်</a></p></div>';
} else {
  api('/api/users/me').then(function(d) {
    if (d.error) {
      localStorage.removeItem('aics_token');
      location.reload();
      return;
    }
    document.getElementById('userEmail').textContent = d.email || '';
    document.getElementById('planBadge').textContent = d.plan || 'FREE';
    var al = document.getElementById('adminLink');
    if (al) al.style.display = d.is_admin ? 'flex' : 'none';
    USER_PLAN = d.plan || 'FREE';
    if (USER_PLAN !== 'PRO') {
      document.getElementById('proCard01').classList.add('locked');
      document.getElementById('proCard02').classList.add('locked');
      document.getElementById('genSrtBtn01').disabled = true;
      document.getElementById('genSrtBtn02').disabled = true;
      document.getElementById('translateBtn01').disabled = true;
      document.getElementById('translateBtn02').disabled = true;
      document.querySelectorAll('#tab01 .dir-chip').forEach(function(c) { c.classList.add('locked'); });
      document.querySelectorAll('#tab02 .dir-chip').forEach(function(c) { c.classList.add('locked'); });
      document.getElementById('proLock01').textContent = '🔒 ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်';
      document.getElementById('proLock02').textContent = '🔒 ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်';
    }
  });
}

// ================================================= //
// ===== TAB 01: Text → Voice =====                 //
// ================================================= //

function generateVoice01() {
  var text = document.getElementById('ttsText01').value;
  if (!text || !text.trim()) { showToast('Voice ပြောင်းလိုသော Text ကို ထည့်ပါ', 'error'); return; }
  var style = document.getElementById('styleInstruction01').value.trim();
  var voiceName = document.getElementById('voiceNameSelect01').value;
  var combined = style ? '[Speaking & Voice Style Instruction: ' + style + ']\\n\\n' + text : text;

  var btn = document.getElementById('genVoiceBtn01');
  btn.disabled = true;
  document.getElementById('loading01a').classList.add('show');
  document.getElementById('audioContainer01').innerHTML = '';

  api('/api/studio/voice/tts', { method: 'POST', body: { text: combined, voiceName: voiceName } })
  .then(function(d) {
    document.getElementById('loading01a').classList.remove('show');
    btn.disabled = false;
    if (d.error) { showToast(d.error + ': ' + (d.detail || ''), 'error'); return; }
    lastAudioBase64_01 = d.data;
    lastAudioMime_01 = d.mimeType || 'audio/wav';
    var blob = base64ToBlob(d.data, d.mimeType || 'audio/wav');
    var url = URL.createObjectURL(blob);
    document.getElementById('audioContainer01').innerHTML =
      '<audio controls src="' + url + '"></audio>' +
      '<div class="btn-row"><a href="' + url + '" download="voice_output.wav"><button class="btn btn-secondary btn-sm">💾 Save Audio</button></a></div>';
    showToast('✓ Voice ဖန်တီးပြီးပါပြီ', 'success');
  })
  .catch(function(e) {
    document.getElementById('loading01a').classList.remove('show');
    btn.disabled = false;
    showToast('Network error: ' + e.message, 'error');
  });
}

function copyText01() {
  var text = document.getElementById('ttsText01').value;
  if (!text) { showToast('Copy လုပ်ဖို့ Text မရှိပါ', 'error'); return; }
  navigator.clipboard.writeText(text);
  showToast('✓ Copy ပြီးပါပြီ', 'success');
}

function saveText01() {
  var text = document.getElementById('ttsText01').value;
  if (!text || !text.trim()) { showToast('Save လုပ်ဖို့ Text မရှိသေးပါ', 'error'); return; }
  var title = prompt('Creation အမည် ပေးပါ:', text.substring(0, 40));
  if (title === null) return;
  AICS_CREATIONS.save({
    studio: 'VOICE', type: '1', title: title || 'Voice Text',
    original_prompt: text, ai_output: text,
    media_type: lastAudioBase64_01 ? 'audio' : '', media_mime: lastAudioMime_01 || 'audio/wav', media_data: lastAudioBase64_01 || ''
  }).then(function() {
    showToast('💾 Save ပြီးပါပြီ', 'success');
  }).catch(function() { showToast('Browser Storage မအောင်မြင်', 'error'); });
}

function generateSrt01() {
  if (USER_PLAN !== 'PRO') { showToast('ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်', 'error'); return; }
  if (!lastAudioBase64_01) { showToast('SRT ထုတ်ဖို့ Audio မရှိသေးပါ။ Generate Voice ကို အရင်နှိပ်ပါ', 'error'); return; }
  var btn = document.getElementById('genSrtBtn01');
  btn.disabled = true;
  document.getElementById('srtOriginal01').value = '⏳ SRT ဖန်တီးနေပါသည်...';
  api('/api/studio/voice/srt', { method: 'POST', body: {
    audioBase64: lastAudioBase64_01, mimeType: lastAudioMime_01, type: '2',
  }}).then(function(d) {
    btn.disabled = false;
    if (d.error) { document.getElementById('srtOriginal01').value = ''; showToast(d.error + ': ' + (d.detail || ''), 'error'); return; }
    document.getElementById('srtOriginal01').value = d.srt || '';
    showToast('✓ SRT ပြီးပါပြီ', 'success');
  }).catch(function(e) {
    btn.disabled = false;
    document.getElementById('srtOriginal01').value = '';
    showToast('Network error: ' + e.message, 'error');
  });
}

function selectDir01(el) {
  if (USER_PLAN !== 'PRO') return;
  document.querySelectorAll('#tab01 .dir-chip').forEach(function(c) { c.classList.remove('selected'); });
  el.classList.add('selected');
  selectedDir01 = el.getAttribute('data-dir');
}

function translateSrt01() {
  if (USER_PLAN !== 'PRO') { showToast('ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်', 'error'); return; }
  var srt = document.getElementById('srtOriginal01').value;
  if (!srt || !srt.trim()) { showToast('ဘာသာပြန်ဖို့ မူရင်း SRT မရှိသေးပါ', 'error'); return; }
  var btn = document.getElementById('translateBtn01');
  btn.disabled = true;
  document.getElementById('loading01b').classList.add('show');
  document.getElementById('srtTranslated01').textContent = '';
  api('/api/studio/voice/translate-srt', { method: 'POST', body: {
    srtText: srt, direction: selectedDir01, type: '2',
  }}).then(function(d) {
    document.getElementById('loading01b').classList.remove('show');
    btn.disabled = false;
    if (d.error) { showToast(d.error + ': ' + (d.detail || ''), 'error'); return; }
    translatedSrt01 = d.srt || '';
    document.getElementById('srtTranslated01').textContent = translatedSrt01;
    showToast('✓ ဘာသာပြန်ပြီးပါပြီ', 'success');
  }).catch(function(e) {
    document.getElementById('loading01b').classList.remove('show');
    btn.disabled = false;
    showToast('Network error: ' + e.message, 'error');
  });
}

function copySrt(id) {
  var text = document.getElementById(id).value;
  if (!text) { showToast('Copy လုပ်ဖို့ SRT မရှိပါ', 'error'); return; }
  navigator.clipboard.writeText(text);
  showToast('✓ Copy ပြီးပါပြီ', 'success');
}

function downloadSrt(id, filename) {
  var text = document.getElementById(id).value;
  if (!text) { showToast('Download လုပ်ဖို့ SRT မရှိပါ', 'error'); return; }
  var blob = new Blob([text], { type: 'application/octet-stream' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function copyTranslated01() {
  if (!translatedSrt01) { showToast('Copy လုပ်ဖို့ ဘာသာပြန် SRT မရှိပါ', 'error'); return; }
  navigator.clipboard.writeText(translatedSrt01);
  showToast('✓ Copy ပြီးပါပြီ', 'success');
}

function downloadTranslated01() {
  if (!translatedSrt01) { showToast('Download လုပ်ဖို့ ဘာသာပြန် SRT မရှိပါ', 'error'); return; }
  var blob = new Blob([translatedSrt01], { type: 'application/octet-stream' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'translated_subtitle.srt'; a.click();
  URL.revokeObjectURL(url);
}

function saveSrt01(kind) {
  if (USER_PLAN !== 'PRO') { showToast('ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်', 'error'); return; }
  var srt = kind === 'translated' ? translatedSrt01 : document.getElementById('srtOriginal01').value;
  if (!srt) { showToast('Save လုပ်ဖို့ SRT မရှိပါ', 'error'); return; }
  var title = prompt('Creation အမည် ပေးပါ:', kind === 'translated' ? 'Voice Translated SRT' : 'Voice Original SRT');
  if (title === null) return;
  AICS_CREATIONS.save({
    studio: 'VOICE', type: '2', title: title || 'Voice SRT',
    original_prompt: document.getElementById('srtOriginal01').value, ai_output: srt,
    media_type: lastAudioBase64_01 ? 'audio' : '', media_mime: lastAudioMime_01 || 'audio/wav', media_data: lastAudioBase64_01 || ''
  }).then(function() {
    showToast('💾 Save ပြီးပါပြီ', 'success');
  }).catch(function() { showToast('Browser Storage မအောင်မြင်', 'error'); });
}

// ================================================= //
// ===== TAB 02: Voice → Text =====                 //
// ================================================= //

function transcribe02() {
  var fileInput = document.getElementById('audioFile02');
  var file = fileInput.files[0];
  if (!file) { showToast('Audio file ရွေးပါ', 'error'); return; }
  if (file.size > 5 * 1024 * 1024) { showToast('Audio file သည် 5MB ထက် မကျော်ရပါ', 'error'); return; }

  var btn = document.getElementById('transcribeBtn02');
  btn.disabled = true;
  document.getElementById('loading02a').classList.add('show');
  document.getElementById('transcriptResult02').textContent = '';
  document.getElementById('transcriptActions02').style.display = 'none';

  var reader = new FileReader();
  reader.onload = function(e) {
    var base64 = e.target.result.split(',')[1];
    var mime = file.type || 'audio/mpeg';
    lastAudioBase64_02 = base64;
    lastAudioMime_02 = mime;
    api('/api/studio/voice/transcribe', { method: 'POST', body: {
      audioBase64: base64, mimeType: mime, type: '1',
    }}).then(function(d) {
      document.getElementById('loading02a').classList.remove('show');
      btn.disabled = false;
      if (d.error) { showToast(d.error + ': ' + (d.detail || ''), 'error'); return; }
      document.getElementById('transcriptResult02').textContent = d.text || '';
      document.getElementById('transcriptActions02').style.display = 'flex';
      showToast('✓ Transcribe ပြီးပါပြီ', 'success');
    }).catch(function(err) {
      document.getElementById('loading02a').classList.remove('show');
      btn.disabled = false;
      showToast('Network error: ' + err.message, 'error');
    });
  };
  reader.readAsDataURL(file);
}

function copyTranscript02() {
  var text = document.getElementById('transcriptResult02').textContent;
  if (!text) { showToast('Copy လုပ်ဖို့ Result မရှိပါ', 'error'); return; }
  navigator.clipboard.writeText(text);
  showToast('✓ Copy ပြီးပါပြီ', 'success');
}

function saveTranscript02() {
  var text = document.getElementById('transcriptResult02').textContent;
  if (!text) { showToast('Save လုပ်ဖို့ Result မရှိပါ', 'error'); return; }
  var title = prompt('Creation အမည် ပေးပါ:', 'Voice Transcript');
  if (title === null) return;
  AICS_CREATIONS.save({
    studio: 'VOICETRANSCRIBE', type: '1', title: title || 'Voice Transcript',
    original_prompt: '(Audio transcription)', ai_output: text,
    media_type: lastAudioBase64_02 ? 'audio' : '', media_mime: lastAudioMime_02 || 'audio/mpeg', media_data: lastAudioBase64_02 || ''
  }).then(function() {
    showToast('💾 Save ပြီးပါပြီ', 'success');
  }).catch(function() { showToast('Browser Storage မအောင်မြင်', 'error'); });
}

function generateSrt02() {
  if (USER_PLAN !== 'PRO') { showToast('ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်', 'error'); return; }
  if (!lastAudioBase64_02) {
    var fileInput = document.getElementById('audioFile02');
    var file = fileInput.files[0];
    if (!file) { showToast('SRT ထုတ်ဖို့ Audio file အရင် ရွေးပါ', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Audio file သည် 5MB ထက် မကျော်ရပါ', 'error'); return; }
    var reader = new FileReader();
    reader.onload = function(e) {
      lastAudioBase64_02 = e.target.result.split(',')[1];
      lastAudioMime_02 = file.type || 'audio/mpeg';
      doGenerateSrt02();
    };
    reader.readAsDataURL(file);
  } else {
    doGenerateSrt02();
  }
}

function doGenerateSrt02() {
  var btn = document.getElementById('genSrtBtn02');
  btn.disabled = true;
  document.getElementById('srtOriginal02').value = '⏳ SRT ဖန်တီးနေပါသည်...';
  api('/api/studio/voice/srt', { method: 'POST', body: {
    audioBase64: lastAudioBase64_02, mimeType: lastAudioMime_02, type: '2',
  }}).then(function(d) {
    btn.disabled = false;
    if (d.error) { document.getElementById('srtOriginal02').value = ''; showToast(d.error + ': ' + (d.detail || ''), 'error'); return; }
    document.getElementById('srtOriginal02').value = d.srt || '';
    showToast('✓ SRT ပြီးပါပြီ', 'success');
  }).catch(function(e) {
    btn.disabled = false;
    document.getElementById('srtOriginal02').value = '';
    showToast('Network error: ' + e.message, 'error');
  });
}

function selectDir02(el) {
  if (USER_PLAN !== 'PRO') return;
  document.querySelectorAll('#tab02 .dir-chip').forEach(function(c) { c.classList.remove('selected'); });
  el.classList.add('selected');
  selectedDir02 = el.getAttribute('data-dir');
}

function translateSrt02() {
  if (USER_PLAN !== 'PRO') { showToast('ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်', 'error'); return; }
  var srt = document.getElementById('srtOriginal02').value;
  if (!srt || !srt.trim()) { showToast('ဘာသာပြန်ဖို့ မူရင်း SRT မရှိသေးပါ', 'error'); return; }
  var btn = document.getElementById('translateBtn02');
  btn.disabled = true;
  document.getElementById('loading02b').classList.add('show');
  document.getElementById('srtTranslated02').textContent = '';
  api('/api/studio/voice/translate-srt', { method: 'POST', body: {
    srtText: srt, direction: selectedDir02, type: '2',
  }}).then(function(d) {
    document.getElementById('loading02b').classList.remove('show');
    btn.disabled = false;
    if (d.error) { showToast(d.error + ': ' + (d.detail || ''), 'error'); return; }
    translatedSrt02 = d.srt || '';
    document.getElementById('srtTranslated02').textContent = translatedSrt02;
    showToast('✓ ဘာသာပြန်ပြီးပါပြီ', 'success');
  }).catch(function(e) {
    document.getElementById('loading02b').classList.remove('show');
    btn.disabled = false;
    showToast('Network error: ' + e.message, 'error');
  });
}

function copyTranslated02() {
  if (!translatedSrt02) { showToast('Copy လုပ်ဖို့ ဘာသာပြန် SRT မရှိပါ', 'error'); return; }
  navigator.clipboard.writeText(translatedSrt02);
  showToast('✓ Copy ပြီးပါပြီ', 'success');
}

function downloadTranslated02() {
  if (!translatedSrt02) { showToast('Download လုပ်ဖို့ ဘာသာပြန် SRT မရှိပါ', 'error'); return; }
  var blob = new Blob([translatedSrt02], { type: 'application/octet-stream' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'translated_subtitle.srt'; a.click();
  URL.revokeObjectURL(url);
}

function saveSrt02(kind) {
  if (USER_PLAN !== 'PRO') { showToast('ဒီ Feature ကို Pro User သာ အသုံးပြုနိုင်ပါသည်', 'error'); return; }
  var srt = kind === 'translated' ? translatedSrt02 : document.getElementById('srtOriginal02').value;
  if (!srt) { showToast('Save လုပ်ဖို့ SRT မရှိပါ', 'error'); return; }
  var title = prompt('Creation အမည် ပေးပါ:', kind === 'translated' ? 'Voice Translated SRT' : 'Voice Original SRT');
  if (title === null) return;
  AICS_CREATIONS.save({
    studio: 'VOICETRANSCRIBE', type: '2', title: title || 'Voice SRT',
    original_prompt: document.getElementById('srtOriginal02').value, ai_output: srt,
    media_type: lastAudioBase64_02 ? 'audio' : '', media_mime: lastAudioMime_02 || 'audio/mpeg', media_data: lastAudioBase64_02 || ''
  }).then(function() {
    showToast('💾 Save ပြီးပါပြီ', 'success');
  }).catch(function() { showToast('Browser Storage မအောင်မြင်', 'error'); });
}
// ===== Unified Sidebar helpers (Phase 4 — Shared Sidebar Script သို့ ရွှေ့ပြီးပါပြီ) =====
</script>
</body>
</html>`;
