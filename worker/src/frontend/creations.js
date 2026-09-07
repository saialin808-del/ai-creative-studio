// AI Creative Studio — Creations UI Frontend (Phase 9 + Phase 3)
// Dark theme, sidebar nav, list/view/copy/delete creations
// Phase 2 — Sidebar + Helper Script များကို Shared Component (frontend/shared.js) မှ ယူသည်
// Phase 3 — Filter / Sort / Search + Favorite Star ထည့်သည်

import { renderSidebar, sidebarScript } from './shared.js';

export const CREATIONS_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My Creations — AI Creative Studio</title>
<style>
:root{--bg:#080c18;--bg-sidebar:#0d1220;--card:#151b2b;--card2:#111827;--cyan:#00e5ff;--purple:#7b5cff;--text:#e8ecf4;--text2:#94a3b8;--text3:#5b6785;--border:#26324a;--success:#2bff9f;--error:#ff4d4d;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Noto Sans Myanmar','Roboto','Segoe UI',Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:14px;line-height:1.6;}
a{color:var(--cyan);text-decoration:none;}
.hamburger{display:none;position:fixed;top:14px;left:14px;z-index:200;background:var(--card);border:1px solid #333;color:#fff;font-size:18px;width:42px;height:42px;border-radius:10px;cursor:pointer;}
.backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99;}
.backdrop.show{display:block;}
.sidebar{position:fixed;left:14px;top:14px;width:220px;height:calc(100vh - 28px);background:#0d1425;border-radius:16px;padding:22px 14px;overflow-y:auto;z-index:100;transition:transform 0.3s,left 0.3s;}
.brand{margin-bottom:22px;}
.brand-title{font-weight:800;font-size:18px;letter-spacing:0.5px;background:linear-gradient(90deg,var(--purple),var(--cyan));-webkit-background-clip:text;background-clip:text;color:transparent;}
.nav-label{font-size:11px;color:var(--text3);letter-spacing:1.5px;margin:18px 0 8px 10px;text-transform:uppercase;}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;color:#ccc;text-decoration:none;cursor:pointer;font-size:14px;margin-bottom:4px;border:1px solid transparent;transition:all 0.2s;}
.nav-item:hover{background:#161d30;transform:translateX(2px);}
.nav-item.active{background:linear-gradient(90deg,rgba(123,92,255,0.18),rgba(0,229,255,0.08));color:#fff;border:1px solid var(--purple);box-shadow:0 0 14px rgba(123,92,255,0.35);}
.nav-icon-circle{width:30px;height:30px;border-radius:9px;background:#1a2138;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
.sidebar-bottom{margin-top:24px;padding-top:18px;border-top:1px solid var(--border);}
.license-badge{display:inline-block;font-size:12px;padding:5px 12px;border-radius:20px;margin-bottom:12px;background:#333;color:#aaa;}
.license-badge.pro{background:#103a2a;color:var(--success);}
.side-btn{display:block;width:100%;text-align:left;padding:10px 12px;border-radius:12px;background:#161d30;color:#ccc;border:1px solid var(--border);font-size:13px;cursor:pointer;margin-bottom:6px;text-decoration:none;transition:all 0.2s;}
.side-btn:hover{background:#1e2740;border-color:var(--cyan);}
.main-content{margin-left:262px;padding:24px;max-width:900px;}
.page-title{font-size:22px;font-weight:700;color:var(--cyan);margin-bottom:8px;}
.page-subtitle{color:var(--text2);font-size:13.5px;margin-bottom:20px;}
/* Phase 3 — Toolbar (Search / Filter / Sort) */
.toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;}
.search-input{flex:1 1 200px;min-width:0;padding:11px 14px;border-radius:10px;border:1px solid var(--border);background:var(--card2);color:var(--text);font-size:14px;outline:none;}
.search-input:focus{border-color:var(--cyan);}
.select{padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--card2);color:var(--text);font-size:13.5px;outline:none;cursor:pointer;}
.count-info{color:var(--text3);font-size:12.5px;margin-bottom:12px;}
.creation-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px;margin-bottom:14px;}
.creation-header{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;}
.creation-title{font-weight:bold;font-size:16px;}
.creation-meta{color:var(--text3);font-size:12px;margin-top:4px;}
.creation-preview{margin-top:10px;color:#ccc;font-size:14px;line-height:1.5;max-height:60px;overflow:hidden;}
.creation-full{margin-top:10px;color:#ccc;font-size:14px;line-height:1.5;white-space:pre-wrap;display:none;background:var(--card2);padding:12px;border-radius:8px;max-height:400px;overflow-y:auto;}
.btn-row{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;}
.btn{padding:8px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:13px;min-height:36px;transition:opacity 0.2s;}
.btn:hover{opacity:0.85;}
.btn-primary{background:var(--cyan);color:#001014;}
.btn-secondary{background:#26324a;color:#ccc;}
.btn-danger{background:#4a2626;color:#ff8080;}
.btn-fav{background:#33270d;color:#b9a05a;}
.btn-fav.on{background:#4a3510;color:#ffd166;border:1px solid #ffd166;}
.empty-state{text-align:center;color:var(--text3);padding:60px 20px;}
.loading-state{text-align:center;color:var(--cyan);padding:40px 20px;}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--card);border:1px solid var(--border);color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;z-index:9999;display:none;box-shadow:0 4px 16px rgba(0,0,0,0.4);}
.toast.show{display:block;}
.toast.success{border-color:var(--success);}
.toast.error{border-color:var(--error);}
@media(max-width:768px){
  .sidebar{transform:translateX(-130%);}
  .sidebar.open{transform:translateX(0);}
  .hamburger{display:block;}
  .main-content{margin-left:0;padding:70px 16px 24px 16px;}
}
</style>
</head>
<body>
${renderSidebar('creations')}
<main class="main-content">
  <h1 class="page-title">📁 My Creations</h1>
  <p class="page-subtitle">သင် Save လုပ်ထားသော AI Result များ — ဒီ Data ကို သင့်အကောင့်ထဲမှာသာ သိမ်းထားပါသည်။</p>
  <div id="loadingState" class="loading-state">Loading...</div>
  <div id="emptyState" class="empty-state" style="display:none;">
    📭 Save ထားသော Creation များ မရှိသေးပါ။<br>
    Studio တစ်ခုခုမှာ Generate လုပ်ပြီး "Save to My Creations" နှိပ်ကြည့်ပါ။
  </div>
  <div id="toolbar" class="toolbar" style="display:none;">
    <input id="searchInput" class="search-input" type="text" placeholder="🔍 ရှာဖွေရန် (ခေါင်းစဉ် / အကြောင်းအရာ)..." oninput="renderList()">
    <select id="filterSelect" class="select" onchange="renderList()">
      <option value="ALL">အားလုံး</option>
      <option value="FAV">⭐ အနှစ်သက်ဆုံး</option>
      <option value="STORY">📖 Story</option>
      <option value="CONTENT">✍️ Content</option>
      <option value="SHORT">🎬 Short</option>
      <option value="IMAGE">🎨 Image</option>
      <option value="VOICE">🎙 Voice</option>
      <option value="SHOP">🛒 Shop</option>
    </select>
    <select id="sortSelect" class="select" onchange="renderList()">
      <option value="newest">အသစ်ဆုံး</option>
      <option value="oldest">အဟောင်းဆုံး</option>
    </select>
  </div>
  <div id="countInfo" class="count-info"></div>
  <div id="noMatch" class="empty-state" style="display:none;">🔍 ရှာလို့ မတွေ့ပါ။</div>
  <div id="creationsList"></div>
</main>
<div class="toast" id="toast"></div>
${sidebarScript()}
<script>
var TOKEN = localStorage.getItem('aics_token') || '';
var STUDIO_ICONS={"STORY":"📖","STORYVIDEO":"🎬","CONTENT":"✍️","CONTENTVIDEO":"🎥","SHORT":"🎬","SHORTVIDEO":"🎬","IMAGE":"🎨","VOICE":"🎙","VOICETRANSCRIBE":"📝","SHOPCONTENT":"🛒","SHOPVIDEO":"🛒"};
function api(path,opts){opts=opts||{};var h=opts.headers||{};h['Content-Type']='application/json';if(TOKEN)h['Authorization']='Bearer '+TOKEN;return fetch(path,{method:opts.method||'GET',headers:h,body:opts.body?JSON.stringify(opts.body):undefined}).then(function(r){return r.json();});}
function showToast(msg,type){var t=document.getElementById('toast');t.textContent=msg;t.className='toast show'+(type?' '+type:'');setTimeout(function(){t.className='toast';},2500);}
// (toggleSidebar / logout / setApiKey / TG-FB link များကို Shared Sidebar Script သို့ ရွှေ့ပြီးပါပြီ — Phase 2)
function escapeHtml(text){var div=document.createElement('div');div.innerText=text;return div.innerHTML;}
var allItems=[];
if(!TOKEN){
  document.querySelector('.main-content').innerHTML='<div style="padding:40px;text-align:center;"><h2>🔒 Login လိုအပ်ပါသည်</h2><p style="margin:16px 0;"><a href="/login" style="text-decoration:underline;">Login / Sign Up သို့ သွားရန်</a></p></div>';
}else{
  loadCreations();
}
function loadCreations(){
  api('/api/creations').then(function(d){
    document.getElementById('loadingState').style.display='none';
    if(d.error||!d.items||d.items.length===0){
      document.getElementById('emptyState').style.display='block';
      return;
    }
    allItems=d.items;
    // Sidebar ရဲ့ "အနှစ်သက်ဆုံး" လင့်ခ်က fav=1 နှင့် လာပါက Favorite Filter ဖွင့်ပေးသည်
    var favParam=new URLSearchParams(location.search).get('fav');
    if(favParam==='1'){
      document.getElementById('filterSelect').value='FAV';
    }
    document.getElementById('toolbar').style.display='flex';
    renderList();
  }).catch(function(){
    document.getElementById('loadingState').innerHTML='Error: Network problem';
  });
}
function filteredItems(){
  var filter=document.getElementById('filterSelect').value;
  var q=(document.getElementById('searchInput').value||'').toLowerCase().trim();
  var items=allItems.filter(function(c){
    if(filter==='FAV' && !c.is_favorite) return false;
    if(filter!=='ALL' && filter!=='FAV' && c.studio!==filter) return false;
    if(q){
      var hay=(escapeHtml(c.title||'')+' '+escapeHtml((c.ai_output||'').substring(0,600))).toLowerCase();
      if(hay.indexOf(q)===-1) return false;
    }
    return true;
  });
  var sort=document.getElementById('sortSelect').value;
  items.sort(function(a,b){
    var ta=a.created_at||'',tb=b.created_at||'';
    return sort==='oldest'?(ta>tb?1:ta<tb?-1:0):(tb>ta?1:tb<ta?-1:0);
  });
  return items;
}
function renderList(){
  var items=filteredItems();
  var container=document.getElementById('creationsList');
  var noMatch=document.getElementById('noMatch');
  container.innerHTML='';
  document.getElementById('countInfo').textContent='✏️ စုစုပေါင်း '+items.length+' ခု';
  noMatch.style.display=(items.length===0)?'block':'none';
  items.forEach(function(c){
    var icon=STUDIO_ICONS[c.studio]||'📄';
    var dateStr=c.created_at?new Date(c.created_at.replace(' ','T')+'Z').toLocaleDateString():'';
    var card=document.createElement('div');
    card.className='creation-card';
    card.innerHTML=
      '<div class="creation-header"><div>'+
      '<div class="creation-title">'+icon+' '+escapeHtml(c.title||'(Untitled)')+'</div>'+
      '<div class="creation-meta">'+c.studio+' • Type '+(c.type||'1')+' • '+dateStr+'</div>'+
      '</div></div>'+
      '<div class="creation-preview" id="preview-'+c.id+'">'+escapeHtml((c.ai_output||'').substring(0,120))+((c.ai_output||'').length>120?'...':'')+'</div>'+
      '<div class="creation-full" id="full-'+c.id+'">'+escapeHtml(c.ai_output||'')+'</div>'+
      '<div class="btn-row">'+
      '<button class="btn btn-fav'+(c.is_favorite?' on':'')+'" onclick="toggleFav(\\''+c.id+'\\',this)">'+(c.is_favorite?'⭐':'☆')+'</button>'+
      '<button class="btn btn-primary" onclick="toggleFull(\\''+c.id+'\\')">👁 View Full</button>'+
      '<button class="btn btn-secondary" onclick="copyCreation(\\''+c.id+'\\',this)">📋 Copy</button>'+
      '<button class="btn btn-danger" onclick="removeCreation(\\''+c.id+'\\',this)">🗑 Delete</button>'+
      '</div>';
    container.appendChild(card);
  });
}
function toggleFav(id,btn){
  api('/api/creations/'+id+'/favorite',{method:'POST'}).then(function(d){
    if(d.error){showToast('မပြောင်းနိုင်ပါ','error');return;}
    var item=null;
    allItems.forEach(function(c){if(c.id===id)item=c;});
    if(item)item.is_favorite=d.favorite?1:0;
    showToast(d.favorite?'⭐ အနှစ်သက်ဆုံး ထဲသို့ ထည့်ပြီးပါပြီ':'အနှစ်သက်ဆုံး မှ ဖယ်ပြီးပါပြီ');
    renderList();
  }).catch(function(){showToast('Network error','error');});
}
function toggleFull(id){
  var preview=document.getElementById('preview-'+id);
  var full=document.getElementById('full-'+id);
  if(full.style.display==='block'){full.style.display='none';preview.style.display='block';}
  else{full.style.display='block';preview.style.display='none';}
}
function copyCreation(id,btn){
  var full=document.getElementById('full-'+id);
  navigator.clipboard.writeText(full.innerText);
  showToast('✓ Copy ပြီးပါပြီ','success');
  var orig=btn.textContent;btn.textContent='✓ Copied';btn.disabled=true;
  setTimeout(function(){btn.textContent=orig;btn.disabled=false;},1200);
}
function removeCreation(id,btn){
  if(!confirm('ဒီ Creation ကို ဖျက်မှာ သေချာပါသလား?'))return;
  var orig=btn.textContent;btn.textContent='⏳ ဖျက်နေသည်…';btn.disabled=true;
  fetch('/api/creations/'+id,{method:'DELETE',headers:{'Authorization':'Bearer '+TOKEN}})
  .then(function(r){return r.json();})
  .then(function(d){
    if(d.error){showToast('ဖျက်မရပါ','error');btn.textContent=orig;btn.disabled=false;return;}
    allItems=allItems.filter(function(c){return c.id!==id;});
    renderList();
    showToast('✓ Creation ဖျက်ပြီးပါပြီ','success');
    if(allItems.length===0)document.getElementById('emptyState').style.display='block';
  }).catch(function(){showToast('Network error','error');btn.textContent=orig;btn.disabled=false;});
}
</script>
</body>
</html>`;
