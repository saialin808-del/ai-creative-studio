// AI Creative Studio — Frontend UI (served at /app) 
export const APP_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI Creative Studio</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F4F3EE;color:#1A1B1C}
header{position:sticky;top:0;background:#1b6d96;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;z-index:10}
.logo{font-weight:700;font-size:16px}
.user{font-size:12px;text-align:right}
.user small{display:block;opacity:.85}
.btn{background:#1b6d96;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-size:14px;cursor:pointer}
.btn.ghost{background:transparent;border:1px solid #fff;color:#fff;padding:6px 12px;font-size:12px;border-radius:6px}
nav{display:flex;overflow-x:auto;background:#fff;border-bottom:1px solid #E4E3DD;position:sticky;top:52px;z-index:9}
nav button{background:transparent;color:#1A1B1C;border:0;border-bottom:3px solid transparent;border-radius:0;padding:11px 16px;font-size:14px;white-space:nowrap;cursor:pointer}
nav button.active{color:#1b6d96;border-bottom-color:#1b6d96;font-weight:600}
main{max-width:680px;margin:0 auto;padding:16px}
.card{background:#fff;border:1px solid #E4E3DD;border-radius:12px;padding:14px;margin-bottom:12px}
label{display:block;font-size:13px;font-weight:600;margin:12px 0 4px}
input,textarea,select{width:100%;font-size:14px;padding:10px;border:1px solid #ccc;border-radius:8px;font-family:inherit;background:#fff}
textarea{min-height:80px;resize:vertical}
.result{background:#fff;border:1px solid #E4E3DD;border-radius:12px;padding:14px;margin-top:12px;white-space:pre-wrap;font-size:14px;line-height:1.7;min-height:60px}
.result img{max-width:100%;border-radius:8px}
.err{color:#d33}
.hidden{display:none}
h2{margin:4px 0 8px;font-size:18px}
</style>
</head>
<body>
<header>
  <div class="logo">🎨 AI Creative Studio</div>
  <div class="user" id="userBox"></div>
</header>
<nav id="nav"></nav>
<main>
  <section id="view-home" class="card">
    <h2>မင်္ဂလာပါ 👋</h2>
    <p>AI Creative Studio မှကြိုဆိုပါတယ်။ Studio များမှ ဇာတ်လမ်း၊ အကြောင်းအရာ၊ ဗီဒီယိုစာသား၊ ပုံ၊ အသံ စသည်တို့ ဖန်တီးနိုင်ပါသည်။</p>
    <p id="homeStatus"></p>
  </section>

  <section id="view-studio" class="hidden">
    <div class="card">
      <label>Studio</label>
      <select id="studioSel"></select>
      <label>Type (1-5)</label>
      <input id="typeInput" value="1" inputmode="numeric">
      <label>သင့် အကြံ / အကြောင်းအရာ</label>
      <textarea id="ideaInput" placeholder="ဤနေရာတွင် ရေးပါ..."></textarea>
      <label>Gemini API Key (ရွေးစရာ — BYOK)</label>
      <input id="keyInput" type="password" placeholder="ထည့်လိုပါက">
      <div style="margin-top:12px"><button class="btn" onclick="runStudio()">▶ ဖန်တီးမယ်</button></div>
    </div>
    <div class="result" id="studioResult">ရလဒ် ဤနေရာတွင် ပေါ်မည်...</div>
  </section>

  <section id="view-creations" class="hidden">
    <div class="card">
      <button class="btn" onclick="loadCreations()">📂 ကျွန်ုပ်၏ ဖန်တီးမှုများ တင်မည်</button>
    </div>
    <div id="creationsList"></div>
  </section>
</main>

<script>
var TOKEN_KEY='aics_token';
var token=localStorage.getItem(TOKEN_KEY)||'';
var STUDIOS=[
 {key:'STORY',label:'📖ဇာတ်လမ်း (Story)'},
 {key:'STORYVIDEO',label:'🎬ဇာတ်လမ်းဗီဒီယို (Story Video)'},
 {key:'CONTENT',label:'📝အကြောင်းအရာ (Content)'},
 {key:'CONTENTVIDEO',label:'🎬အကြောင်းအရာဗီဒီယို (Content Video)'},
 {key:'SHORT',label:'📱ဗီဒီယိုစာသား (Short)'},
 {key:'SHORTVIDEO',label:'🎬 Short Video'},
 {key:'IMAGE',label:'🖼️ပုံ (Image)'},
 {key:'IMAGE',label:'🎁ပုံ (Ad Image)'},
 {key:'VOICE',label:'📃စာသား - အသံ (Voice)'},
 {key:'VOICE',label:'🎙️အသံ - စာသား (Voice)'},
 {key:'SHOP',label:'🛍️ရောင်းချရန် (Shop)'},
 {key:'SHOPVIDEO',label:'🎬 Shop Video'}
];
var NAV=[
 {view:'home',label:'🏠 ပင်မ'},
 {view:'studio',label:'🎨 Studio'},
 {view:'creations',label:'💾 ဖန်တီးမှုများ'}
];

function $(id){return document.getElementById(id);}

function tokenFromHash(){
  var h=location.hash||'';
  if(h.indexOf('#token=')===0){
    localStorage.setItem(TOKEN_KEY,decodeURIComponent(h.slice(7)));
    token=localStorage.getItem(TOKEN_KEY);
    history.replaceState(null,'',location.pathname);
  }
}

function api(path,opts){
  var o=opts||{};
  o.headers=o.headers||{};
  o.headers['Content-Type']='application/json';
  o.headers['Authorization']='Bearer '+token;
  return fetch(path,o).then(function(r){return r.json().catch(function(){return {error:'bad_response'};});});
}

function login(){location.href='/api/auth/login?next='+encodeURIComponent(location.origin+'/app');}

function showUser(){
  var b=$('userBox');
  if(token){
    api('/api/users/me').then(function(d){
      if(d&&d.email){b.innerHTML=d.email+'<small>Plan: '+d.plan+'</small>';}
      else{b.innerHTML='<button class="btn ghost" onclick="login()">Login</button>';}
    });
    $('homeStatus').innerHTML='';
  }else{
    b.innerHTML='<button class="btn ghost" onclick="login()">Login</button>';
    $('homeStatus').innerHTML='<span class="err">⚠️ Login မလုပ်ရသေးပါ။ အပေါ်မှ Login နှိပ်ပါ။</span>';
  }
}

function renderNav(){
  var nav=$('nav');nav.innerHTML='';
  NAV.forEach(function(n,i){
    var b=document.createElement('button');
    b.textContent=n.label;
    b.onclick=function(){showView(n.view);};
    if(n.view==='studio')b.classList.add('active');
    nav.appendChild(b);
  });
}

function showView(v){
  ['home','studio','creations'].forEach(function(x){$('view-'+x).classList.toggle('hidden',x!==v);});
  var nav=$('nav');
  for(var i=0;i<nav.children.length;i++){nav.children[i].classList.toggle('active',NAV[i].view===v);}
  if(v==='creations')loadCreations();
}

function renderStudios(){
  var sel=$('studioSel');sel.innerHTML='';
  STUDIOS.forEach(function(s){
    var o=document.createElement('option');
    o.value=s.key;o.textContent=s.label;
    sel.appendChild(o);
  });
}

function runStudio(){
  var out=$('studioResult');
  if(!token){out.innerHTML='<span class="err">Login ဦးစွာပြုလုပ်ပါ။</span>';return;}
  out.textContent='⏳ ဖန်တီးနေသည်...';
  api('/api/studio/generate',{method:'POST',body:JSON.stringify({
    studio:$('studioSel').value,
    type:$('typeInput').value||'1',
    idea:$('ideaInput').value,
    apiKey:$('keyInput').value
  })}).then(function(d){
    if(d.data){
      out.innerHTML='';
      var im=document.createElement('img');
      im.src='data:'+d.mimeType+';base64,'+d.data;
      out.appendChild(im);
    }else if(d.output){
      out.textContent='['+d.studio+'/'+d.plan+'/'+d.type+']\\n\\n'+d.output;
    }else{
      out.innerHTML='<span class="err">ERROR: '+(d.error||'')+' '+(d.detail||'')+'</span>';
    }
  }).catch(function(e){out.innerHTML='<span class="err">Network error: '+e+'</span>';});
}

function loadCreations(){
  var box=$('creationsList');
  box.innerHTML='⏳ Loading...';
  if(!token){box.innerHTML='<span class="err">Login ဦးစွာပြုလုပ်ပါ။</span>';return;}
  api('/api/creations').then(function(d){
    if(d.error){box.innerHTML='<span class="err">'+d.error+' '+(d.detail||'')+'</span>';return;}
    if(!d.items||d.items.length===0){box.innerHTML='<div class="card">(ဖန်တီးမှု မရှိသေးပါ)</div>';return;}
    box.innerHTML='';
    d.items.forEach(function(it){
      var c=document.createElement('div');
      c.className='card';
      c.innerHTML='<b>['+it.studio+'/'+it.type+']</b> '+it.title+'<br><small>'+it.created_at+'</small>';
      box.appendChild(c);
    });
  }).catch(function(e){box.innerHTML='<span class="err">Network error: '+e+'</span>';});
}

function init(){
  tokenFromHash();
  renderNav();
  renderStudios();
  showUser();
  showView('studio');
}
init();
</script>
</body>
</html>`;
