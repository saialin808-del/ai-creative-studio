// Phase 5 — AI Creative Studio CMS Manager + Users Manager (Admin)
// Served at /admin. CMS CRUD via /api/cms. Users via /api/admin/users. Admin-only.

export const ADMIN_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CMS Manager — AI Creative Studio</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F4F3EE;color:#1A1B1C;display:none}
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
<header>
  <div class="logo">🗂️ Admin Panel</div>
  <div class="user"><span id="userBox"></span> · <a href="/app" style="color:#fff;">→ App</a></div>
</header>
<main>
  <div class="card row" style="gap:4px;">
    <button class="btn active" id="tabCms" onclick="switchTab('cms')">📋 CMS</button>
    <button class="btn inactive" id="tabUsers" onclick="switchTab('users')">👥 Users</button>
  </div>

  <div id="cmsView">
    <div class="card row">
      <select id="fStudio"></select>
      <select id="fPlan">
        <option value="">Plan (အကုန်)</option>
        <option value="FREE">FREE</option>
        <option value="PRO">PRO</option>
      </select>
      <input id="fType" placeholder="Type (1-5)" style="width:110px;">
      <button class="btn" onclick="load()">⟳ Refresh</button>
      <button class="btn green" onclick="addEdit(null)">＋ အသစ်ထည့်</button>
    </div>
    <div id="list"></div>
  </div>

  <div id="usersView" class="hidden">
    <div class="card row">
      <button class="btn" onclick="loadUsers()">⟳ Refresh</button>
      <span style="font-size:12px;color:#6B7280;">User plan ကို တစ်ခါနှိပ်နဲ့ ပြောင်းလို့ရတယ်</span>
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
        <button class="btn" onclick="save()">💾 Save</button>
        <button class="btn gray" onclick="closeForm()">Cancel</button>
      </div>
    </div>
  </div>
</div>

<script>
var TOKEN_KEY='aics_token';
var token=localStorage.getItem(TOKEN_KEY)||'';
var STUDIOS=['STORY','STORYVIDEO','CONTENT','CONTENTVIDEO','SHORT','SHORTVIDEO','IMAGE','VOICE','SHOPCONTENT','SHOPVIDEO'];
var FIELDS=['core','memory','knowledge','workflow','template','prompt','quality_check','final_output'];
var items=[];
var users=[];
var editingId=null;
var currentTab='cms';

window.onerror=function(msg,url,line){
  document.body.style.display='block';
  document.body.innerHTML='<div style="padding:20px;color:#d33;font-size:14px;"><b>JS Error:</b> '+String(msg)+'<br>line: '+line+'</div>';
  return true;
};

function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function login(){location.href='/api/auth/login?next='+encodeURIComponent(location.origin+'/admin');}
function api(path,method,body){
  return fetch(path,{method:method||'GET',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:body?JSON.stringify(body):undefined})
    .then(function(r){return r.json().catch(function(){return {error:'bad_response'};});});
}

function fillStudios(){
  var ss=$('fStudio');
  ss.innerHTML='<option value="">Studio (အကုန်)</option>';
  STUDIOS.forEach(function(x){var o=document.createElement('option');o.value=x;o.textContent=x;ss.appendChild(o);});
  var fs=$('iStudio');fs.innerHTML='';
  STUDIOS.forEach(function(x){var o=document.createElement('option');o.value=x;o.textContent=x;fs.appendChild(o);});
}

function switchTab(tab){
  currentTab=tab;
  $('cmsView').classList.toggle('hidden',tab!=='cms');
  $('usersView').classList.toggle('hidden',tab!=='users');
  $('tabCms').className='btn '+(tab==='cms'?'active':'inactive');
  $('tabUsers').className='btn '+(tab==='users'?'active':'inactive');
  if(tab==='users') loadUsers();
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
  if(rows.length===0){list.innerHTML='<div class="card">(row မရှိသေးပါ — ＋ အသစ်ထည့် နှိပ်ပါ)</div>';return;}
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
  $('formTitle').textContent=it?('✏️ Edit — '+it.studio+'/'+it.plan+'/'+it.type):'＋ အသစ်ထည့်';
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
  $('formTitle').textContent='📋 Copy — '+it.studio+'/'+it.plan+'/'+it.type;
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
  if(!confirm('ဒီ row ကို ဖျက်မှာ သေချာလား?'))return;
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

function renderUsers(){
  var list=$('usersList');list.innerHTML='';
  if(users.length===0){list.innerHTML='<div class="card">(user မရှိသေးပါ)</div>';return;}
  users.forEach(function(u){
    var isPro=u.plan==='PRO';
    var c=document.createElement('div');
    c.className='card';
    c.innerHTML='<div class="user-row">'+
      '<div><b>'+esc(u.email)+'</b> '+
      '<span class="badge '+(isPro?'pro':'free')+'">'+esc(u.plan||'FREE')+'</span></div>'+
      '<button class="btn sm '+(isPro?'gray':'green')+'" onclick="togglePlan('+u.id+','+(isPro?'\'FREE\'':'\'PRO\'')+')">'+
      (isPro?'→ FREE':'→ PRO')+'</button></div>'+
      '<div class="user-meta">ID: '+u.id+' · created: '+esc(u.created_at||'-')+(u.expiry?' · expiry: '+esc(u.expiry):'')+'</div>';
    list.appendChild(c);
  });
}

function togglePlan(id,plan){
  var label=plan==='PRO'?'PRO လုပ်မှာ သေချာလား?':'FREE ပြန်လုပ်မှာ သေချာလား?';
  if(!confirm(label))return;
  api('/api/admin/users/'+id,'PUT',{plan:plan}).then(function(d){
    if(d.ok){loadUsers();}else{alert('ERROR: '+(d.detail||d.error||'unknown'));}
  }).catch(function(e){alert('Network error: '+(e&&e.message||e));});
}

function tokenFromHash(){
  var h=location.hash||'';
  if(h.indexOf('#token=')===0){
    localStorage.setItem(TOKEN_KEY,decodeURIComponent(h.slice(7)));
    token=localStorage.getItem(TOKEN_KEY);
    history.replaceState(null,'',location.pathname);
  }
}

function init(){
  tokenFromHash();
  if(!token){login();return;}
  api('/api/users/me').then(function(d){
    if(!d||!d.email){login();return;}
    $('userBox').textContent=d.email+' · '+d.plan;
    fillStudios();
    document.body.style.display='block';
    load();
  }).catch(function(e){
    document.body.style.display='block';
    $('list').innerHTML='<div class="card"><span class="err">Login error: '+esc(String(e&&e.message||e))+' — ပြန်ဝင်ပါ</span></div>';
  });
}
init();
</script>
</body>
</html>`;

export async function adminApi(request, path, env, verifyToken) {
  const isCms = (path === '/api/cms' || path.indexOf('/api/cms/') === 0);
  const isUsers = (path === '/api/admin/users' || path.indexOf('/api/admin/users/') === 0);
  if (!isCms && !isUsers) return null;

  const method = request.method;

  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return json({ error: 'unauthorized', detail: 'login required' }, 401);
  const user = await verifyToken(env, token);
  if (!user || !user.email) return json({ error: 'unauthorized', detail: 'login required — ပြန်ဝင်ပါ' }, 401);
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
        return json({ ok: true });
      } catch (e) { return json({ error: 'db_error', detail: String(e && e.message || e) }, 500); }
    }
    if (method === 'DELETE') {
      await env.DB.prepare('DELETE FROM cms_prompts WHERE id=?').bind(id).run();
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
      return json({ ok: true });
    } catch (e) { return json({ error: 'db_error', detail: String(e && e.message || e) }, 500); }
  }

  return null;
}

async function readBody(request) { try { return await request.json(); } catch (e) { return null; } }
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }); }
