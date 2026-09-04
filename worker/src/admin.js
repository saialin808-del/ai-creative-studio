// Admin — HTML/CSS test (JS minimal)
export const ADMIN_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CMS Manager — AI Creative Studio</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F4F3EE;color:#1A1B1C}
#loading{padding:40px 20px;text-align:center;color:#6B7280;font-size:14px}
header{position:sticky;top:0;background:#1b6d96;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;z-index:10}
.logo{font-weight:700;font-size:16px}
.user{font-size:12px}
main{max-width:720px;margin:0 auto;padding:16px}
.card{background:#fff;border:1px solid #E4E3DD;border-radius:12px;padding:12px;margin-bottom:10px}
.btn{background:#1b6d96;color:#fff;border:0;border-radius:8px;padding:9px 14px;font-size:13px;cursor:pointer}
.btn.green{background:#52C41A}
.btn.red{background:#EA6668}
.btn.gray{background:#bbb}
.btn.sm{padding:6px 10px;font-size:12px}
.btn.active{background:#1b6d96}
.btn.inactive{background:#ccc;color:#555}
.err{color:#d33}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
.badge.free{background:#eee;color:#666}
.badge.pro{background:#d4edda;color:#155724}
select,input,textarea{width:100%;font-size:14px;padding:9px;border:1px solid #ccc;border-radius:8px;font-family:inherit;background:#fff}
select,input{width:auto}
textarea{min-height:64px;resize:vertical}
label{display:block;font-size:12px;font-weight:600;margin:10px 0 3px}
.hidden{display:none}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);overflow-y:auto;z-index:50;padding:16px}
.form{max-width:680px;margin:0 auto}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.user-row{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.user-meta{font-size:11px;color:#6B7280;margin-top:2px}
</style>
</head>
<body>
<div id="loading">⏳ Loading admin panel...</div>
<div id="app" class="hidden">
<header>
  <div class="logo">🗂️ Admin Panel</div>
  <div class="user"><span id="userBox"></span> · <a href="/app" style="color:#fff;">→ App</a></div>
</header>
<main>
  <div class="card row" style="gap:4px;">
    <button class="btn active" id="tabCms">📋 CMS</button>
    <button class="btn inactive" id="tabUsers">👥 Users</button>
  </div>
  <div id="cmsView">
    <div class="card row">
      <select id="fStudio"></select>
      <select id="fPlan">
        <option value="">Plan (all)</option>
        <option value="FREE">FREE</option>
        <option value="PRO">PRO</option>
      </select>
      <input id="fType" placeholder="Type (1-5)" style="width:110px;">
      <button class="btn">⟳ Refresh</button>
      <button class="btn green">+ Add New</button>
    </div>
    <div id="list"></div>
  </div>
  <div id="usersView" class="hidden">
    <div class="card row">
      <button class="btn">⟳ Refresh</button>
      <span style="font-size:12px;color:#6B7280;">User plan management</span>
    </div>
    <div id="usersList"></div>
  </div>
</main>
<div id="formWrap" class="hidden">
  <div class="overlay">
    <div class="card form">
      <h3 id="formTitle" style="margin:0 0 4px;">+ CMS Row</h3>
      <label>Studio</label><select id="iStudio"></select>
      <label>Plan</label>
      <select id="iPlan"><option value="FREE">FREE</option><option value="PRO">PRO</option></select>
      <label>Type (1-5)</label><input id="iType" value="1" style="width:90px;">
      <label>core</label><textarea id="iCore"></textarea>
      <label>memory</label><textarea id="iMemory"></textarea>
      <label>knowledge</label><textarea id="iKnowledge"></textarea>
      <label>workflow</label><textarea id="iWorkflow"></textarea>
      <label>template</label><textarea id="iTemplate"></textarea>
      <label>prompt</label><textarea id="iPrompt"></textarea>
      <label>quality_check</label><textarea id="iQuality_check"></textarea>
      <label>final_output</label><textarea id="iFinal_output"></textarea>
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
        <button class="btn">💾 Save</button>
        <button class="btn gray">Cancel</button>
      </div>
    </div>
  </div>
</div>
</div>

<script>
document.getElementById('loading').innerHTML = '✅ HTML + CSS + JS — all OK!';
document.getElementById('app').classList.remove('hidden');
</script>
</body>
</html>`;

export async function adminApi(request, path, env, verifyToken) {
  return null;
}
