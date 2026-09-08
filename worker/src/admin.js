// Phase 5 — AI Creative Studio Admin Panel (Dashboard / CMS / Users / Studios / Features / Usage / Logs)
// Phase 4 — Studio Control (ON/OFF) ထည့်သည် (Rule 14 — Admin က Code မပြင်ဘဲ ထိန်းချုပ်နိုင်)
// Phase 5 — Free/Pro Feature ထိန်းချုပ် + Usage Statistics + Admin Logs (Rules 12/15/16/18)
// Served at /admin. Admin-only — Server-side တွင် အမြဲ စစ်ဆေးသည် (Rule 13).

import { setStudioEnabled, getStudioSettings } from './core/studioSettings.js';
import { STUDIO_REGISTRY } from './config/studios.js';
import { FEATURE_REGISTRY } from './config/features.js';
import { getFeatureSettings, setFeatureSetting } from './core/featureSettings.js';
import { getAiModels, setAiModel, deleteAiModel } from './core/aiModels.js';
import { logAdminAction, listAdminLogs } from './core/adminLogs.js';

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
    <button class="btn active" id="tabDashboard" onclick="switchTab('dashboard')">📊 Dashboard</button>
    <button class="btn inactive" id="tabCms" onclick="switchTab('cms')">📋 CMS</button>
    <button class="btn inactive" id="tabUsers" onclick="switchTab('users')">👥 Users</button>
    <button class="btn inactive" id="tabStudios" onclick="switchTab('studios')">🎛️ Studios</button>
    <button class="btn inactive" id="tabFeatures" onclick="switchTab('features')">⚙️ Features</button>
    <button class="btn inactive" id="tabModels" onclick="switchTab('models')">🤖 AI Models</button>
    <button class="btn inactive" id="tabUsage" onclick="switchTab('usage')">📈 Usage</button>
    <button class="btn inactive" id="tabLogs" onclick="switchTab('logs')">🧾 Logs</button>
  </div>
  <div id="dashboardView">
    <div class="card row" style="gap:8px;">
      <button class="btn" onclick="loadDashboard()">⟳ Refresh</button>
    </div>
    <div class="card row" id="statCards" style="gap:8px;"></div>
    <div class="card"><b>🆕 နောက်ဆုံး User များ</b><div id="recentUsers"></div></div>
  </div>
  <div id="cmsView" class="hidden">
    <div class="card row">
      <select id="fStudio"></select>
      <select id="fPlan">
        <option value="">Plan (all)</option>
        <option value="FREE">FREE</option>
        <option value="PRO">PRO</option>
      </select>
      <input id="fType" placeholder="Type (1-5)" style="width:110px;">
      <button class="btn" onclick="load()">⟳ Refresh</button>
      <button class="btn green" onclick="addEdit(null)">＋ Add New</button>
    </div>
    <div id="list"></div>
  </div>
  <div id="usersView" class="hidden">
    <div class="card row">
      <button class="btn" onclick="loadUsers()">⟳ Refresh</button>
      <span style="font-size:12px;color:#6B7280;">Tap button to toggle user plan</span>
    </div>
    <div id="usersList"></div>
  </div>
  <div id="studiosView" class="hidden">
    <div class="card row">
      <button class="btn" onclick="loadStudios()">⟳ Refresh</button>
      <span style="font-size:12px;color:#6B7280;">Studio ကို ON/OFF ပြုလုပ်ပါက User App ၏ Sidebar နှင့် Access ချက်ချင်း ပြောင်းပါမည်</span>
    </div>
    <div id="studiosList"></div>
  </div>
  <div id="featuresView" class="hidden">
    <div class="card row">
      <button class="btn" onclick="loadFeatures()">⟳ Refresh</button>
      <span style="font-size:12px;color:#6B7280;">Free/Pro Feature ကို Code မပြင်ဘဲ ဤနေရာမှ ထိန်းချုပ်နိုင်သည် (Rule 15)</span>
    </div>
    <div id="featuresList"></div>
  </div>
  <div id="modelsView" class="hidden">
    <div class="card row">
      <button class="btn" onclick="loadModels()">⟳ Refresh</button>
      <span style="font-size:12px;color:#6B7280;">AI Model များကို Code မပြင်ဘဲ ထည့်/ပြင်/ဖွင့်/ပိတ်/ဖျက် လုပ်နိုင်သည် (Phase C) — User တို့သည် Studio မှ Model ရွေးသုံးနိုင်မည်</span>
    </div>
    <div id="modelsList"></div>
  </div>
  <div id="usageView" class="hidden">
    <div class="card row">
      <button class="btn" onclick="loadUsage()">⟳ Refresh</button>
      <span style="font-size:12px;color:#6B7280;">သုံးစွဲမှု Statistics — Daily + Top Users</span>
    </div>
    <div class="card"><b>📅 နေ့အလိုက် သုံးစွဲမှု</b><div id="usageDaily"></div></div>
    <div class="card"><b>🏆 Top Users</b><div id="usageTop"></div></div>
  </div>
  <div id="logsView" class="hidden">
    <div class="card row">
      <button class="btn" onclick="loadLogs()">⟳ Refresh</button>
      <span style="font-size:12px;color:#6B7280;">Admin လုပ်ဆောင်ချက် မှတ်တမ်း (Audit)</span>
    </div>
    <div id="logsList"></div>
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
        <button class="btn" onclick="save()">💾 Save</button>
        <button class="btn gray" onclick="closeForm()">Cancel</button>
      </div>
    </div>
  </div>
</div>
</div>

<script>
window.onerror = function(msg, url, line) {
  var el = document.getElementById('loading');
  if (el) el.innerHTML = '<div style="color:#d33;text-align:left;"><b>JS Error:</b> ' + String(msg) + '<br><b>Line:</b> ' + line + '</div>';
};

var TOKEN_KEY='aics_token';
var token='';
try { token = localStorage.getItem(TOKEN_KEY) || ''; } catch(e) {}
var STUDIOS=['STORY','STORYVIDEO','CONTENT','CONTENTVIDEO','SHORT','SHORTVIDEO','IMAGE','VOICE','SHOPCONTENT','SHOPVIDEO'];
var FIELDS=['core','memory','knowledge','workflow','template','prompt','quality_check','final_output'];
var items=[];
var users=[];
var editingId=null;
var currentTab='cms';

function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function showError(msg){
  $('loading').style.display='block';
  $('loading').innerHTML='<div style="color:#d33;"><b>Error:</b> '+esc(String(msg))+'</div>';
}
function showApp(){
  $('loading').style.display='none';
  $('app').classList.remove('hidden');
}
function login(){location.href='/api/auth/login?next='+encodeURIComponent(location.origin+'/admin');}
function api(path,method,body){
  return fetch(path,{method:method||'GET',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:body?JSON.stringify(body):undefined})
    .then(function(r){return r.json().catch(function(){return {error:'bad_response'};});});
}

function fillStudios(){
  var ss=$('fStudio');
  ss.innerHTML='<option value="">Studio (all)</option>';
  STUDIOS.forEach(function(x){var o=document.createElement('option');o.value=x;o.textContent=x;ss.appendChild(o);});
  var fs=$('iStudio');fs.innerHTML='';
  STUDIOS.forEach(function(x){var o=document.createElement('option');o.value=x;o.textContent=x;fs.appendChild(o);});
}

function switchTab(tab){
  currentTab=tab;
  ['dashboard','cms','users','studios','features','models','usage','logs'].forEach(function(t){
    $('tab'+t.charAt(0).toUpperCase()+t.slice(1)).className='btn '+(tab===t?'active':'inactive');
    $(t+'View').classList.toggle('hidden',tab!==t);
  });
  if(tab==='users') loadUsers();
  if(tab==='studios') loadStudios();
  if(tab==='features') loadFeatures();
  if(tab==='models') loadModels();
  if(tab==='usage') loadUsage();
  if(tab==='logs') loadLogs();
  if(tab==='dashboard') loadDashboard();
}

// ===== Phase 5 — Dashboard (Statistics) =====
function loadDashboard(){
  api('/api/admin/dashboard').then(function(d){
    if(d.error==='forbidden'){location.href='/app';return;}
    if(d.error){$('statCards').innerHTML='<span class="err">'+(d.detail||d.error)+'</span>';return;}
    var st=d.stats||{};
    var cards=[
      ['👥 Users',st.users||0],
      ['⭐ PRO',st.pro||0],
      ['🗂️ Projects',st.projects||0],
      ['🤖 AI (ယနေ့)',st.ai_today||0],
      ['🎙️ Voice (ယနေ့)',st.voice_today||0],
      ['🖼️ Image (ယနေ့)',st.image_today||0]
    ];
    var html='';
    cards.forEach(function(c){html+='<div style="flex:1 1 120px;min-width:0;background:#f4f6fb;border:1px solid #E4E3DD;border-radius:10px;padding:10px;text-align:center;"><div style="font-size:11px;color:#6B7280;">'+c[0]+'</div><div style="font-size:20px;font-weight:700;color:#1b6d96;">'+esc(c[1])+'</div></div>';});
    $('statCards').innerHTML=html;
    var ru=$('recentUsers');ru.innerHTML='';
    (d.recent||[]).forEach(function(u){
      ru.innerHTML+='<div class="user-meta" style="margin-top:6px;">• '+esc(u.email||'')+' <span class="badge '+(u.plan==='PRO'?'pro':'free')+'">'+esc(u.plan||'FREE')+'</span> · '+esc(u.created_at||'')+'</div>';
    });
  }).catch(function(e){
    $('statCards').innerHTML='<span class="err">Network error: '+esc(String(e&&e.message||e))+'</span>';
  });
}

// ===== Phase 5 — Features (Free/Pro Config — Rule 15) =====
function loadFeatures(){
  api('/api/admin/features').then(function(d){
    if(d.error==='forbidden'){location.href='/app';return;}
    if(d.error){$('featuresList').innerHTML='<div class="card"><span class="err">'+(d.detail||d.error)+'</span></div>';return;}
    var list=$('featuresList');list.innerHTML='';
    (d.items||[]).forEach(function(f){
      var c=document.createElement('div');
      c.className='card';
      c.innerHTML='<div class="user-row"><div><b>'+esc(f.nameMy)+'</b> <span style="font-size:11px;color:#6B7280;">('+esc(f.id)+')</span>'+
        '<div class="user-meta">'+esc(f.desc||'')+' · '+(f.enabled?'<span class="badge pro">ON</span>':'<span class="badge free">OFF</span>')+'</div></div>'+
        '<div class="row" style="gap:6px;">'+
        '<select id="acc-'+esc(f.id)+'"><option value="FREE"'+(f.access!=='PRO'?' selected':'')+'>FREE</option><option value="PRO"'+(f.access==='PRO'?' selected':'')+'>PRO</option></select>'+
        '<input id="lim-'+esc(f.id)+'" type="number" min="0" value="'+esc(f.limit_value||0)+'" title="Limit" style="width:70px;">'+
        '<button class="btn sm '+(f.enabled?'red':'green')+'" data-on="'+(f.enabled?'1':'0')+'" onclick="toggleFeature(\\''+esc(f.id)+'\\',this)">'+(f.enabled?'⏻ ပိတ်မည်':'⏻ ဖွင့်မည်')+'</button>'+
        '<button class="btn sm" onclick="saveFeature(\\''+esc(f.id)+'\\')">💾 Save</button>'+
        '</div></div>';
      list.appendChild(c);
    });
  }).catch(function(e){
    $('featuresList').innerHTML='<div class="card"><span class="err">Network error: '+esc(String(e&&e.message||e))+'</span></div>';
  });
}
function saveFeature(id){
  var access=$('acc-'+id).value;
  var limit=$('lim-'+id).value;
  api('/api/admin/features/'+id,'PUT',{access:access,limit_value:limit}).then(function(d){
    if(d.ok){loadFeatures();}else{alert('ERROR: '+(d.detail||d.error||'unknown'));}
  }).catch(function(e){alert('Network error: '+(e&&e.message||e));});
}
function toggleFeature(id,btn){
  var next=!(btn.getAttribute('data-on')==='1');
  api('/api/admin/features/'+id,'PUT',{enabled:next}).then(function(d){
    if(d.ok){loadFeatures();}else{alert('ERROR: '+(d.detail||d.error||'unknown'));}
  }).catch(function(e){alert('Network error: '+(e&&e.message||e));});
}

// ===== Phase C — AI Models (ထည့်/ပြင်/ဖွင့်/ပိတ်/ဖျက်) =====
function catLabel(c){return c==='image'?'🖼️ ပုံ':(c==='voice'?'🎙️ အသံ':(c==='transcribe'?'🎧 အသံ→စာသား':'📝 စာသား'));}
function loadModels(){
  api('/api/admin/models').then(function(d){
    if(d.error==='forbidden'){location.href='/app';return;}
    if(d.error){$('modelsList').innerHTML='<div class="card"><span class="err">'+(d.detail||d.error)+'</span></div>';return;}
    var html='<div class="card"><b>＋ Model အသစ် ထည့်ရန်</b>'+
      '<div class="row" style="margin-top:8px;">'+
      '<input id="nm_id" placeholder="Model ID (ဥပမာ gemini-2.5-pro)" style="flex:2;min-width:150px;">'+
      '<input id="nm_name" placeholder="ပြမည့်နာမည်" style="flex:2;min-width:120px;">'+
      '<select id="nm_cat"><option value="text">📝 စာသား</option><option value="image">🖼️ ပုံ</option><option value="voice">🎙️ အသံ</option><option value="transcribe">🎧 အသံ→စာသား</option></select>'+
      '<select id="nm_plan"><option value="FREE">လူတိုင်း</option><option value="PRO">PRO သာ</option></select>'+
      '<button class="btn green" onclick="addModel()">＋ Add</button></div>'+
      '<div style="font-size:11px;color:#6B7280;margin-top:6px;">⚠️ Model ID သည် Google Gemini API တွင် တကယ်ရှိသော နာမည် ဖြစ်ရမည် — မမှန်ပါက Generate လုပ်သော အခါ အမှား ပြပါမည်။</div></div>';
    (d.items||[]).forEach(function(m){
      var mid=esc(m.id);
      html+='<div class="card"><div class="user-row"><div><b>'+esc(m.name||m.id)+'</b> <span style="font-size:11px;color:#6B7280;">('+mid+')</span>'+
        '<div class="user-meta">'+catLabel(m.category)+' · '+(m.plan_access==='PRO'?'<span class="badge pro">PRO သာ</span>':'<span class="badge free">လူတိုင်း</span>')+
        (m.is_default?' · <span class="badge pro">★ မူရင်း</span>':'')+'</div></div>'+
        '<div class="row" style="gap:6px;margin-top:6px;">'+
        '<input id="nm_'+mid+'" value="'+esc(m.name||m.id)+'" placeholder="ပြမည့်နာမည်" style="flex:2;min-width:110px;">'+
        '<select id="pm_'+mid+'"><option value="FREE"'+(m.plan_access!=='PRO'?' selected':'')+'>လူတိုင်း</option><option value="PRO"'+(m.plan_access==='PRO'?' selected':'')+'>PRO သာ</option></select>'+
        '<button class="btn sm" onclick="saveModel(\\''+mid+'\\')">💾 Save</button>'+
        '<button class="btn sm '+(m.enabled?'red':'green')+'" data-on="'+(m.enabled?'1':'0')+'" onclick="toggleModel(\\''+mid+'\\',this)">'+(m.enabled?'⏻ ပိတ်မည်':'⏻ ဖွင့်မည်')+'</button>'+
        '<button class="btn sm '+(m.is_default?'gray':'')+'" onclick="setDefault(\\''+mid+'\\')">★ မူရင်း</button>'+
        '<button class="btn sm red" onclick="delModel(\\''+mid+'\\')">🗑 ဖျက်</button>'+
        '</div></div></div>';
    });
    $('modelsList').innerHTML=html;
  }).catch(function(e){
    $('modelsList').innerHTML='<div class="card"><span class="err">Network error: '+esc(String(e&&e.message||e))+'</span></div>';
  });
}
function addModel(){
  var id=($('nm_id').value||'').trim();
  if(!id){alert('Model ID ထည့်ပါ');return;}
  api('/api/admin/models','POST',{
    id:id,
    name:$('nm_name').value.trim(),
    category:$('nm_cat').value,
    plan_access:$('nm_plan').value,
    enabled:true
  }).then(function(d){
    if(d.ok){loadModels();}else{alert('ERROR: '+(d.detail||d.error||'unknown'));}
  }).catch(function(e){alert('Network error: '+(e&&e.message||e));});
}
function saveModel(id){
  var payload={plan_access:$('pm_'+id).value};
  var nm=$('nm_'+id);
  if(nm&&String(nm.value||'').trim())payload.name=String(nm.value).trim();
  api('/api/admin/models/'+id,'PUT',payload).then(function(d){
    if(d.ok){loadModels();}else{alert('ERROR: '+(d.detail||d.error||'unknown'));}
  }).catch(function(e){alert('Network error: '+(e&&e.message||e));});
}
function toggleModel(id,btn){
  var next=!(btn.getAttribute('data-on')==='1');
  api('/api/admin/models/'+id,'PUT',{enabled:next}).then(function(d){
    if(d.ok){loadModels();}else{alert('ERROR: '+(d.detail||d.error||'unknown'));}
  }).catch(function(e){alert('Network error: '+(e&&e.message||e));});
}
function setDefault(id){
  api('/api/admin/models/'+id,'PUT',{is_default:true}).then(function(d){
    if(d.ok){loadModels();}else{alert('ERROR: '+(d.detail||d.error||'unknown'));}
  }).catch(function(e){alert('Network error: '+(e&&e.message||e));});
}
function delModel(id){
  if(!confirm('ဤ Model ကို ဖျက်မှာလား?'))return;
  api('/api/admin/models/'+id,'DELETE').then(function(d){
    if(d.ok||d.ok===undefined){loadModels();}else{alert('ERROR: '+(d.detail||d.error||'unknown'));}
  }).catch(function(e){alert('Network error: '+(e&&e.message||e));});
}

// ===== Phase 5 — Usage Statistics =====
function loadUsage(){
  api('/api/admin/usage').then(function(d){
    if(d.error==='forbidden'){location.href='/app';return;}
    if(d.error){$('usageDaily').innerHTML='<span class="err">'+(d.detail||d.error)+'</span>';return;}
    var h='';
    (d.daily||[]).forEach(function(r){h+='<div class="user-meta" style="margin-top:5px;">'+esc(r.day||'')+' — '+esc(r.category||'')+': <b>'+esc(r.total)+'</b></div>';});
    $('usageDaily').innerHTML=h||'(no data yet)';
    var t='';
    (d.byUser||[]).forEach(function(r){t+='<div class="user-meta" style="margin-top:5px;">'+esc(r.email||'')+' — calls: <b>'+esc(r.calls)+'</b> · total: <b>'+esc(r.total)+'</b></div>';});
    $('usageTop').innerHTML=t||'(no data yet)';
  }).catch(function(e){
    $('usageDaily').innerHTML='<span class="err">Network error: '+esc(String(e&&e.message||e))+'</span>';
  });
}

// ===== Phase 5 — Admin Logs (Audit) =====
function loadLogs(){
  api('/api/admin/logs').then(function(d){
    if(d.error==='forbidden'){location.href='/app';return;}
    if(d.error){$('logsList').innerHTML='<div class="card"><span class="err">'+(d.detail||d.error)+'</span></div>';return;}
    var list=$('logsList');list.innerHTML='';
    var rows=d.items||[];
    if(rows.length===0){list.innerHTML='<div class="card">(no logs yet)</div>';return;}
    rows.forEach(function(r){
      var c=document.createElement('div');
      c.className='card';
      c.innerHTML='<div class="user-meta"><b>'+esc(r.created_at||'')+'</b> · '+esc(r.admin_email||'')+' · <b>'+esc(r.action||'')+'</b></div>'+
        '<div style="font-size:12px;color:#333;margin-top:4px;">'+esc(r.detail||'')+'</div>';
      list.appendChild(c);
    });
  }).catch(function(e){
    $('logsList').innerHTML='<div class="card"><span class="err">Network error: '+esc(String(e&&e.message||e))+'</span></div>';
  });
}

function load(){
  api('/api/cms').then(function(d){
    if(d.error==='forbidden'){location.href='/app';return;}
    if(d.error){$('list').innerHTML='<div class="card"><span class="err">'+(d.detail||d.error)+'</span></div>';return;}
    items=d.items||[];
    renderList();
  }).catch(function(e){
    $('list').innerHTML='<div class="card"><span class="err">Network error: '+esc(String(e&&e.message||e))+'</span></div>';
  });
}

function applyFilter(){
  var s=$('fStudio').value,p=$('fPlan').value,t=$('fType').value.trim();
  return items.filter(function(it){
    if(s&&it.studio!==s)return false;
    if(p&&it.plan!==p)return false;
    if(t&&it.type!==t)return false;
    return true;
  });
}

function renderList(){
  var list=$('list');list.innerHTML='';
  var rows=applyFilter();
  if(rows.length===0){list.innerHTML='<div class="card">(no rows yet — tap + Add New)</div>';return;}
  rows.forEach(function(it){
    var c=document.createElement('div');
    c.className='card';
    c.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">'+
      '<b>['+esc(it.studio)+' / '+esc(it.plan)+' / '+esc(it.type)+']</b>'+
      '<span><button class="btn sm" onclick="copyRow('+it.id+')">📋</button> <button class="btn sm" onclick="addEdit('+it.id+')">✏️</button> <button class="btn sm red" onclick="del('+it.id+')">🗑️</button></span></div>'+
      '<div style="font-size:12px;color:#6B7280;margin-top:6px;"><b>core:</b> '+esc((it.core||'').slice(0,80))+'</div>'+
      '<div style="font-size:12px;color:#6B7280;margin-top:2px;"><b>prompt:</b> '+esc((it.prompt||'').slice(0,80))+'</div>';
    list.appendChild(c);
  });
}

function addEdit(id){
  editingId=id;
  var it=null;
  if(id){it=items.filter(function(x){return x.id==id;})[0];}
  $('formTitle').textContent=it?('Edit — '+it.studio+'/'+it.plan+'/'+it.type):'+ Add New';
  $('iStudio').value=it?it.studio:'STORY';
  $('iPlan').value=it?it.plan:'FREE';
  $('iType').value=it?it.type:'1';
  FIELDS.forEach(function(f){$('i'+f.charAt(0).toUpperCase()+f.slice(1)).value=it?(it[f]||''):'';});
  $('formWrap').classList.remove('hidden');
  window.scrollTo(0,0);
}

function copyRow(id){
  var it=items.filter(function(x){return x.id==id;})[0];
  if(!it)return;
  addEdit(null);
  $('formTitle').textContent='Copy — '+it.studio+'/'+it.plan+'/'+it.type;
  $('iStudio').value=it.studio||'STORY';
  $('iPlan').value=it.plan||'FREE';
  $('iType').value=it.type||'1';
  FIELDS.forEach(function(f){$('i'+f.charAt(0).toUpperCase()+f.slice(1)).value=it[f]||'';});
}

function closeForm(){$('formWrap').classList.add('hidden');}

function save(){
  var data={studio:$('iStudio').value,plan:$('iPlan').value,type:$('iType').value};
  FIELDS.forEach(function(f){data[f]=$('i'+f.charAt(0).toUpperCase()+f.slice(1)).value;});
  var url='/api/cms'+(editingId?'/'+editingId:'');
  api(url,editingId?'PUT':'POST',data).then(function(d){
    if(d.ok){closeForm();load();}
    else{alert('ERROR: '+(d.detail||d.error||'unknown'));}
  }).catch(function(e){alert('Network error: '+(e&&e.message||e));});
}

function del(id){
  if(!confirm('Delete this row?'))return;
  api('/api/cms/'+id,'DELETE').then(function(d){
    if(d.ok){load();}else{alert('ERROR: '+(d.detail||d.error||'unknown'));}
  }).catch(function(e){alert('Network error: '+(e&&e.message||e));});
}

function loadUsers(){
  api('/api/admin/users').then(function(d){
    if(d.error==='forbidden'){location.href='/app';return;}
    if(d.error){$('usersList').innerHTML='<div class="card"><span class="err">'+(d.detail||d.error)+'</span></div>';return;}
    users=d.items||[];
    renderUsers();
  }).catch(function(e){
    $('usersList').innerHTML='<div class="card"><span class="err">Network error: '+esc(String(e&&e.message||e))+'</span></div>';
  });
}

// ===== Studios Control (Phase 4 — Admin က Studio ON/OFF ပြုလုပ်နိုင်) =====
function loadStudios(){
  api('/api/admin/studios').then(function(d){
    if(d.error==='forbidden'){location.href='/app';return;}
    if(d.error){$('studiosList').innerHTML='<div class="card"><span class="err">'+(d.detail||d.error)+'</span></div>';return;}
    var list=$('studiosList');list.innerHTML='';
    (d.items||[]).forEach(function(s){
      var c=document.createElement('div');
      c.className='card';
      c.innerHTML='<div class="user-row"><div><b>'+esc(s.nameMy)+'</b> <span style="font-size:11px;color:#6B7280;">('+esc(s.name)+')</span>'+
        '<div class="user-meta">'+(s.enabled?'<span class="badge pro">ON</span>':'<span class="badge free">OFF</span>')+'</div></div>'+
        '<button class="btn sm '+(s.enabled?'red':'green')+'" data-on="'+(s.enabled?'1':'0')+'" onclick="toggleStudio(\\''+esc(s.id)+'\\',this)">'+(s.enabled?'⏻ ပိတ်မည်':'⏻ ဖွင့်မည်')+'</button></div>';
      list.appendChild(c);
    });
  }).catch(function(e){
    $('studiosList').innerHTML='<div class="card"><span class="err">Network error: '+esc(String(e&&e.message||e))+'</span></div>';
  });
}
function toggleStudio(id,btn){
  var next=!(btn.getAttribute('data-on')==='1');
  btn.disabled=true;
  api('/api/admin/studios/'+id,'PUT',{enabled:next}).then(function(d){
    if(d.error){alert('ERROR: '+(d.detail||d.error||'unknown'));btn.disabled=false;return;}
    loadStudios();
  }).catch(function(e){alert('Network error: '+(e&&e.message||e));btn.disabled=false;});
}

function renderUsers(){
  var list=$('usersList');list.innerHTML='';
  if(users.length===0){list.innerHTML='<div class="card">(no users yet)</div>';return;}
  users.forEach(function(u){
    var isPro=(u.plan==='PRO');
    var c=document.createElement('div');
    c.className='card';
    var btnLabel=isPro?'→ FREE':'→ PRO';
    var btnClass=isPro?'gray':'green';
    var newPlan=isPro?'FREE':'PRO';
    c.innerHTML='<div class="user-row">'+
      '<div><b>'+esc(u.email)+'</b> '+
      '<span class="badge '+(isPro?'pro':'free')+'">'+esc(u.plan||'FREE')+'</span></div>'+
      '<button class="btn sm '+btnClass+'" data-id="'+u.id+'" data-plan="'+newPlan+'">'+btnLabel+'</button></div>'+
      '<div class="user-meta">ID: '+u.id+' · created: '+esc(u.created_at||'-')+(u.expiry?' · expiry: '+esc(u.expiry):'')+'</div>';
    list.appendChild(c);
  });
  var btns=list.querySelectorAll('button[data-id]');
  for(var i=0;i<btns.length;i++){
    btns[i].addEventListener('click',function(){
      togglePlan(this.getAttribute('data-id'),this.getAttribute('data-plan'));
    });
  }
}

function togglePlan(id,plan){
  var label=plan==='PRO'?'Set PRO?':'Set FREE?';
  if(!confirm(label))return;
  api('/api/admin/users/'+id,'PUT',{plan:plan}).then(function(d){
    if(d.ok){loadUsers();}else{alert('ERROR: '+(d.detail||d.error||'unknown'));}
  }).catch(function(e){alert('Network error: '+(e&&e.message||e));});
}

function tokenFromHash(){
  var h=location.hash||'';
  if(h.indexOf('#token=')===0){
    try{localStorage.setItem(TOKEN_KEY,decodeURIComponent(h.slice(7)));}catch(e){}
    try{token=localStorage.getItem(TOKEN_KEY)||'';}catch(e){}
    history.replaceState(null,'',location.pathname);
  }
}

function init(){
  try{
    tokenFromHash();
    if(!token){
      $('loading').innerHTML='🔄 Redirecting to Google login...';
      setTimeout(login,300);
      return;
    }
    $('loading').innerHTML='🔍 Checking login...';
    api('/api/users/me').then(function(d){
      if(!d||!d.email){
        $('loading').innerHTML='🔄 Login expired — redirecting...';
        setTimeout(login,500);
        return;
      }
      $('userBox').textContent=d.email+' · '+d.plan;
      fillStudios();
      showApp();
      switchTab('dashboard');
    }).catch(function(e){
      showError('Login failed: '+String(e&&e.message||e));
    });
  }catch(e){
    showError('Init error: '+String(e&&e.message||e));
  }
}
init();
</script>
</body>
</html>`;

export async function adminApi(request, path, env, verifyToken) {
  const isCms = (path === '/api/cms' || path.indexOf('/api/cms/') === 0);
  const isUsers = (path === '/api/admin/users' || path.indexOf('/api/admin/users/') === 0);
  const isStudios = (path === '/api/admin/studios' || path.indexOf('/api/admin/studios/') === 0);
  const isFeatures = (path === '/api/admin/features' || path.indexOf('/api/admin/features/') === 0);
  const isModels = (path === '/api/admin/models' || path.indexOf('/api/admin/models/') === 0);
  const isDashboard = (path === '/api/admin/dashboard');
  const isUsage = (path === '/api/admin/usage');
  const isLogs = (path === '/api/admin/logs');
  if (!isCms && !isUsers && !isStudios && !isFeatures && !isModels && !isDashboard && !isUsage && !isLogs) return null;

  const method = request.method;
  const authHeader = request.headers.get('Authorization') || '';
  let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  // Phase 11 — Admin Panel Page မှ Fetch များတွင် Cookie Session ကိုပါ လက်ခံသည် (Header ဦးစားပေး)
  if (!token) {
    const c = request.headers.get('Cookie') || '';
    const m = c.match(/(?:^|;\s*)aics_token=([^;]+)/);
    if (m) token = decodeURIComponent(m[1]);
  }
  if (!token) return json({ error: 'unauthorized', detail: 'login required' }, 401);
  const user = await verifyToken(env, token);
  if (!user || !user.email) return json({ error: 'unauthorized', detail: 'login required' }, 401);
  const adminEmail = env.ADMIN_EMAIL || 'saialin808@gmail.com';
  if (String(user.email).toLowerCase() !== String(adminEmail).toLowerCase()) {
    return json({ error: 'forbidden', detail: 'admin only' }, 403);
  }

  const COLS = ['studio','plan','type','core','memory','knowledge','workflow','template','prompt','quality_check','final_output'];

  if (path === '/api/cms' && method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM cms_prompts ORDER BY studio, plan, type').all();
    return json({ ok: true, items: results });
  }

  if (path === '/api/cms' && method === 'POST') {
    const body = await readBody(request);
    if (!body || !body.studio || !body.plan || !body.type) return json({ error: 'missing_fields', detail: 'studio, plan, type required' }, 400);
    const vals = COLS.map(c => (body[c] === undefined || body[c] === null) ? '' : String(body[c]));
    vals[0] = vals[0].toUpperCase();
    vals[1] = vals[1].toUpperCase();
    try {
      await env.DB.prepare('INSERT OR REPLACE INTO cms_prompts (studio,plan,type,core,memory,knowledge,workflow,template,prompt,quality_check,final_output,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,datetime(\'now\'))').bind(...vals).run();
      await logAdminAction(env, user.email, 'cms_create', vals[0] + '/' + vals[1] + '/' + vals[2]);
      return json({ ok: true });
    } catch (e) { return json({ error: 'db_error', detail: String(e && e.message || e) }, 500); }
  }

  if (path.indexOf('/api/cms/') === 0) {
    const id = decodeURIComponent(path.slice('/api/cms/'.length));
    if (method === 'PUT') {
      const body = await readBody(request);
      const sets = COLS.map(c => c + '=?').join(',');
      const vals = COLS.map(c => (body && body[c] !== undefined && body[c] !== null) ? String(body[c]) : '');
      vals[0] = vals[0].toUpperCase();
      vals[1] = vals[1].toUpperCase();
      try {
        await env.DB.prepare('UPDATE cms_prompts SET ' + sets + ', updated_at=datetime(\'now\') WHERE id=?').bind(...vals, id).run();
        await logAdminAction(env, user.email, 'cms_update', 'id=' + id + ' ' + vals[0] + '/' + vals[1] + '/' + vals[2]);
        return json({ ok: true });
      } catch (e) { return json({ error: 'db_error', detail: String(e && e.message || e) }, 500); }
    }
    if (method === 'DELETE') {
      await env.DB.prepare('DELETE FROM cms_prompts WHERE id=?').bind(id).run();
      await logAdminAction(env, user.email, 'cms_delete', 'id=' + id);
      return json({ ok: true });
    }
  }

  if (path === '/api/admin/users' && method === 'GET') {
    const { results } = await env.DB.prepare('SELECT id, email, plan, expiry, created_at FROM users ORDER BY created_at DESC').all();
    return json({ ok: true, items: results });
  }

  if (path.indexOf('/api/admin/users/') === 0 && method === 'PUT') {
    const id = decodeURIComponent(path.slice('/api/admin/users/'.length));
    const body = await readBody(request);
    const plan = (body && body.plan === 'PRO') ? 'PRO' : 'FREE';
    const expiry = (body && body.expiry) ? String(body.expiry) : null;
    try {
      await env.DB.prepare('UPDATE users SET plan=?, expiry=?, updated_at=datetime(\'now\') WHERE id=?').bind(plan, expiry, id).run();
      await logAdminAction(env, user.email, 'user_plan', 'user_id=' + id + ' → ' + plan);
      return json({ ok: true });
    } catch (e) { return json({ error: 'db_error', detail: String(e && e.message || e) }, 500); }
  }

  // ===== Studios Control (Phase 4 — Admin က Code မပြင်ဘဲ ON/OFF ပြုလုပ်နိုင်) =====
  if (path === '/api/admin/studios' && method === 'GET') {
    try {
      const settings = await getStudioSettings(env);
      const items = Object.keys(STUDIO_REGISTRY).map((id) => ({
        id,
        name: STUDIO_REGISTRY[id].name,
        nameMy: STUDIO_REGISTRY[id].nameMy,
        enabled: settings[id] !== false,
      }));
      return json({ ok: true, items });
    } catch (e) { return json({ error: 'db_error', detail: String(e && e.message || e) }, 500); }
  }

  if (path.indexOf('/api/admin/studios/') === 0 && method === 'PUT') {
    const id = decodeURIComponent(path.slice('/api/admin/studios/'.length));
    const body = await readBody(request);
    try {
      const r = await setStudioEnabled(env, id, !!(body && body.enabled));
      await logAdminAction(env, user.email, 'studio_toggle', r.id + ' → ' + (r.enabled ? 'ON' : 'OFF'));
      return json({ ok: true, id: r.id, enabled: r.enabled });
    } catch (e) { return json({ error: 'db_error', detail: String(e && e.message || e) }, 500); }
  }

  // ===== Phase 5 — Features (Free/Pro Config — Rule 15) =====
  if (path === '/api/admin/features' && method === 'GET') {
    try {
      const settings = await getFeatureSettings(env);
      const items = Object.keys(FEATURE_REGISTRY).map((id) => ({
        id,
        name: FEATURE_REGISTRY[id].name,
        nameMy: FEATURE_REGISTRY[id].nameMy,
        desc: FEATURE_REGISTRY[id].desc || '',
        enabled: settings[id].enabled,
        access: settings[id].access,
        limit_value: settings[id].limit_value,
      }));
      return json({ ok: true, items });
    } catch (e) { return json({ error: 'db_error', detail: String(e && e.message || e) }, 500); }
  }

  if (path.indexOf('/api/admin/features/') === 0 && method === 'PUT') {
    const id = decodeURIComponent(path.slice('/api/admin/features/'.length));
    const body = await readBody(request);
    try {
      const r = await setFeatureSetting(env, id, body || {});
      await logAdminAction(env, user.email, 'feature_update', r.id + ' → enabled=' + r.enabled + ', access=' + r.access + ', limit=' + r.limit_value);
      return json({ ok: true, id: r.id, enabled: r.enabled, access: r.access, limit_value: r.limit_value });
    } catch (e) { return json({ error: 'unknown_feature', detail: String(e && e.message || e) }, 400); }
  }

  // ===== Phase C — AI Models (List / Add / Update / Delete) =====
  if (path === '/api/admin/models' && method === 'GET') {
    try {
      const items = await getAiModels(env);
      return json({ ok: true, items });
    } catch (e) { return json({ error: 'db_error', detail: String(e && e.message || e) }, 500); }
  }

  if (path === '/api/admin/models' && method === 'POST') {
    const body = await readBody(request);
    try {
      const r = await setAiModel(env, body || {});
      await logAdminAction(env, user.email, 'model_create', r.id + ' [' + r.category + ']');
      return json({ ok: true, ...r });
    } catch (e) { return json({ error: String(e && e.message || e) === 'last_model' ? 'last_model' : 'model_error', detail: String(e && e.message || e) }, 400); }
  }

  if (path.indexOf('/api/admin/models/') === 0 && method === 'PUT') {
    const id = decodeURIComponent(path.slice('/api/admin/models/'.length));
    const body = await readBody(request);
    try {
      const r = await setAiModel(env, Object.assign({ id }, body || {}));
      await logAdminAction(env, user.email, 'model_update', r.id + ' → enabled=' + r.enabled + ', plan=' + r.plan_access + ', default=' + r.is_default);
      return json({ ok: true, ...r });
    } catch (e) { return json({ error: String(e && e.message || e) === 'last_model' ? 'last_model' : 'model_error', detail: String(e && e.message || e) }, 400); }
  }

  if (path.indexOf('/api/admin/models/') === 0 && method === 'DELETE') {
    const id = decodeURIComponent(path.slice('/api/admin/models/'.length));
    try {
      const r = await deleteAiModel(env, id);
      if (r.ok) {
        await logAdminAction(env, user.email, 'model_delete', id);
        return json({ ok: true });
      }
      return json({ error: 'not_found', detail: 'Model မတွေ့ပါ' }, 404);
    } catch (e) { return json({ error: 'last_model', detail: String(e && e.message || e) }, 400); }
  }

  // ===== Phase 5 — Dashboard Statistics =====
  if (path === '/api/admin/dashboard' && method === 'GET') {
    try {
      const users = await env.DB.prepare('SELECT COUNT(*) AS c FROM users').first();
      const pro = await env.DB.prepare("SELECT COUNT(*) AS c FROM users WHERE plan='PRO'").first();
      // Phase 13 (Option 2): Creations ကို Browser IndexedDB တွင်သာ သိမ်းသည် — Dashboard တွင် မရေတွက်တော့ပါ
      const projects = await env.DB.prepare('SELECT COUNT(*) AS c FROM projects').first();
      const aiToday = await env.DB.prepare("SELECT COALESCE(SUM(amount),0) AS s FROM usage WHERE category='ai' AND date(created_at)=date('now')").first();
      const voiceToday = await env.DB.prepare("SELECT COALESCE(SUM(amount),0) AS s FROM usage WHERE category='voice' AND date(created_at)=date('now')").first();
      const imageToday = await env.DB.prepare("SELECT COALESCE(SUM(amount),0) AS s FROM usage WHERE category='image' AND date(created_at)=date('now')").first();
      const recent = await env.DB.prepare('SELECT email, plan, created_at FROM users ORDER BY created_at DESC LIMIT 5').all();
      return json({
        ok: true,
        stats: {
          users: (users && users.c) || 0,
          pro: (pro && pro.c) || 0,
          projects: (projects && projects.c) || 0,
          ai_today: (aiToday && aiToday.s) || 0,
          voice_today: (voiceToday && voiceToday.s) || 0,
          image_today: (imageToday && imageToday.s) || 0,
        },
        recent: (recent && recent.results) || [],
      });
    } catch (e) { return json({ error: 'db_error', detail: String(e && e.message || e) }, 500); }
  }

  // ===== Phase 5 — Usage Statistics =====
  if (path === '/api/admin/usage' && method === 'GET') {
    try {
      const daily = await env.DB.prepare("SELECT date(created_at) AS day, category, SUM(amount) AS total FROM usage GROUP BY day, category ORDER BY day DESC LIMIT 28").all();
      const byUser = await env.DB.prepare("SELECT u.email, COUNT(*) AS calls, SUM(us.amount) AS total FROM usage us JOIN users u ON u.id=us.user_id GROUP BY us.user_id ORDER BY total DESC LIMIT 10").all();
      return json({ ok: true, daily: (daily && daily.results) || [], byUser: (byUser && byUser.results) || [] });
    } catch (e) { return json({ error: 'db_error', detail: String(e && e.message || e) }, 500); }
  }

  // ===== Phase 5 — Admin Logs (Audit) =====
  if (path === '/api/admin/logs' && method === 'GET') {
    try {
      const items = await listAdminLogs(env, 100);
      return json({ ok: true, items });
    } catch (e) { return json({ error: 'db_error', detail: String(e && e.message || e) }, 500); }
  }

  return null;
}

async function readBody(request) { try { return await request.json(); } catch (e) { return null; } }
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }); }
