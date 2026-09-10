// ============================================================
// AI CREATIVE STUDIO — SHARED SIDEBAR COMPONENT (Phase 2 — App Shell)
// ------------------------------------------------------------
// Sidebar HTML + Sidebar Script များကို ဤနေရာတစ်ခုတည်းတွင် ထားပါသည်။
// စာမျက်နှာတိုင်းသည် renderSidebar() နှင့် sidebarScript() ကိုသာ ခေါ်ယူပါမည်။
// Studio စာရင်းကို config/studios.js (STUDIO_REGISTRY) မှ အလိုအလျောက် ယူပါသည်။
// ============================================================

import { listEnabledStudios, SITE_LINKS } from '../config/studios.js';

// ---- Sidebar အတွင်း Studio Link များ (Registry မှ ထုတ်သည်) ----
// data-studio attribute — Admin မှ Studio ပိတ်ထားပါက Script က ဤ Link ကို ဖျောက်သည် (Phase 4)
function studioLinks(activeId) {
  return listEnabledStudios()
    .map(function (s) {
      const act = s.id === activeId ? ' active' : '';
      return (
        '<a class="nav-item' + act + '" href="' + s.route + '" data-studio="' + s.id + '">' +
        '<span class="nav-icon-circle">' + s.icon + '</span> ' + s.nameMy + '</a>'
      );
    })
    .join('\n  ');
}

// ---- MY WORK / SETTINGS လင့်ခ်များ (Phase 3 — Favorites + Settings) ----
// activeId: 'creations' | 'favorites' | 'settings' — ရောက်နေသော နေရာကို Active ပြသည် (Phase 9 fix)
function myWorkLinks(activeId) {
  const creActive = activeId === 'creations' ? ' active' : '';
  const favActive = activeId === 'favorites' ? ' active' : '';
  const setActive = activeId === 'settings' ? ' active' : '';
  return (
    '<a class="nav-item' + creActive + '" href="/app/creations"><span class="nav-icon-circle">📁</span> ဖန်တီးမှုများ</a>\n' +
    '  <a class="nav-item' + favActive + '" href="/app/creations?fav=1"><span class="nav-icon-circle">⭐</span> အနှစ်သက်ဆုံး</a>'
  );
}

// ---- App Shell Sidebar (Home / Creations ပုံစံ — Hamburger + Backdrop + Brand) ----
function appShellSidebar(activeId) {
  const homeActive = activeId === 'home' ? ' active' : '';
  return (
    '<div class="backdrop" id="backdrop" onclick="toggleSidebar()"></div>\n' +
    '<nav class="sidebar" id="sidebar">\n' +
    '  <div class="sidebar-nav">\n' +
    '  <a class="nav-item' + homeActive + '" href="/app"><span class="nav-icon-circle">🏠</span> ပင်မ</a>\n' +
    '  <div class="nav-label">STUDIOS</div>\n' +
    '  ' + studioLinks(activeId) + '\n' +
    '  <div class="nav-label">MY WORK</div>\n' +
    '  ' + myWorkLinks(activeId) + '\n' +
    '  </div>\n' +
    '  <div class="sidebar-bottom">\n' +
    '    <div class="nav-label">SETTINGS</div>\n' +
    '    <a class="side-btn' + (activeId === 'settings' ? ' active' : '') + '" href="/app/settings">🛠️ ဆက်တင်များ</a>\n' +
    '    <button class="side-btn" onclick="setApiKey()">🔑 API Key Setting</button>\n' +
    '    <a class="side-btn" id="adminLink" href="/admin" style="display:none;">⚙️ Admin Panel</a>\n' +
    '    <a class="side-btn" id="tgLink" href="' + SITE_LINKS.telegram + '" target="_blank">📨 Telegram</a>\n' +
    '    <a class="side-btn" id="fbLink" href="' + SITE_LINKS.facebook + '" target="_blank">📘 Facebook</a>\n' +
    '    <button class="side-btn" onclick="logout()">🚪 Logout</button>\n' +
    '  </div>\n' +
    '</nav>'
  );
}

// ---- Studio Page Sidebar (Studio မျက်နှာများ ပုံစံ — Header ထဲက Menu Button နှင့် တွဲသည်) ----
// (Phase 4 တွင် Studio ၆ ခု၏ UI Shell ကို ဤပုံစံဖြင့် တစ်ညီတည်း ဖြစ်အောင် ပြုလုပ်ပါမည်)
function studioPageSidebar(activeId) {
  const homeActive = activeId === 'home' ? ' active' : '';
  const creActive = activeId === 'creations' ? ' active' : '';
  const favActive = activeId === 'favorites' ? ' active' : '';
  return (
    '<div class="backdrop" id="backdrop" onclick="toggleSidebar()"></div>\n' +
    '<div class="sidebar" id="sidebar" style="display:flex;flex-direction:column;">\n' +
    '  <div class="sidebar-nav">\n' +
    '  <a class="nav-item' + homeActive + '" href="/app"><span class="nav-icon-circle">🏠</span> ပင်မ</a>\n' +
    '  <div class="nav-label">STUDIOS</div>\n' +
    '  ' + studioLinks(activeId) + '\n' +
    '  <div class="nav-label">MY WORK</div>\n' +
    '  <a class="nav-item' + creActive + '" href="/app/creations"><span class="nav-icon-circle">📁</span> ဖန်တီးမှုများ</a>\n' +
    '  <a class="nav-item' + favActive + '" href="/app/creations?fav=1"><span class="nav-icon-circle">⭐</span> အနှစ်သက်ဆုံး</a>\n' +
    '  </div>\n' +
    '  <div class="sidebar-bottom">\n' +
    '  <a class="side-btn' + (activeId === 'settings' ? ' active' : '') + '" href="/app/settings">🛠️ ဆက်တင်များ</a>\n' +
    '  <a class="side-btn" onclick="setApiKey()">🔑 API Key Setting</a>\n' +
    '  <a class="side-btn" id="tgLink" href="' + SITE_LINKS.telegram + '" target="_blank">📨 Telegram</a>\n' +
    '  <a class="side-btn" id="fbLink" href="' + SITE_LINKS.facebook + '" target="_blank">📘 Facebook</a>\n' +
    '  <a class="side-btn" id="adminLink" href="/admin" style="display:none;">⚙️ Admin Panel</a>\n' +
    '  <a class="side-btn" onclick="logout()">🚪 Logout</a>\n' +
    '  </div>\n' +
    '</div>'
  );
}

// ---- Sidebar HTML Renderer ----
// activeId: 'home' | 'creations' | 'favorites' | 'settings' | studioId (ဥပမာ 'story')
// opts.variant: 'app' (Home/Creations) | 'studio' (Studio မျက်နှာများ)
export function renderSidebar(activeId, opts) {
  opts = opts || {};
  return responsiveStyles() + (opts.variant === 'studio' ? studioPageSidebar(activeId) : appShellSidebar(activeId));
}

// ---- Shared Responsive CSS (Phase 6 — Rule 7) ----
// Desktop ≥1200px / iPad 769–1199px (Compact Sidebar) / Phone ≤768px (Topbar + Drawer Sidebar + Touch)
// စာမျက်နှာတိုင်း ဤ Style ကို ရရှိသောကြောင့် Responsive ကို နေရာတစ်ခုတည်းမှ ထိန်းချုပ်သည်
function responsiveStyles() {
  return '<style>\n' +
    '/* ===== AI Creative Studio — Shared Responsive (Phase 6 + 8 — Rule 7) ===== */\n' +
    '/* Sidebar ကို Flex Column ဖြစ်စေပြီး Nav အလယ်တွင် Scroll လုပ်နိုင်၊ အောက်ခလုတ်များ အမြဲမြင်ရအောင် (Phase 8) */\n' +
    '.sidebar{display:flex;flex-direction:column;}\n' +
    '.sidebar-nav{flex:1 1 auto;overflow-y:auto;min-height:0;}\n' +
    '.sidebar > .brand{flex-shrink:0;}\n' +
    '.sidebar-bottom{flex-shrink:0;margin-top:16px;}\n' +
    '/* ===== Phase 12-fix — Unified Menu Button (စာမျက်နှာအားလုံး တစ်ပုံစံတည်း) ===== */\n' +
    '/* App Pages (.hamburger) + Studio Pages (.menu-btn) — နေရာ/အရောင်/အရွယ် တူညီအောင် ပေါင်းထားသည် */\n' +
    '.hamburger,.menu-btn{\n' +
    '  display:none;\n' +
    '  position:fixed;top:14px;left:14px;z-index:300;\n' +
    '  background:#151b2b;border:1px solid #2a3350;color:#fff;\n' +
    '  font-size:20px;width:44px;height:44px;border-radius:10px;\n' +
    '  cursor:pointer;align-items:center;justify-content:center;\n' +
    '  box-shadow:0 2px 12px rgba(0,0,0,.45);padding:0;line-height:1;\n' +
    '}\n' +
    '/* Phase 12 — Personal Profile (Name + Avatar) */\n' +
    '.side-user{display:flex;align-items:center;gap:10px;margin-bottom:10px;}\n' +
    '.side-user .avatar{width:36px;height:36px;flex-shrink:0;border-radius:50%;background:linear-gradient(135deg,#7b5cff,#00e5ff);color:#041018;font-weight:700;font-size:16px;display:flex;align-items:center;justify-content:center;}\n' +
    '.side-user .side-name{font-size:13.5px;font-weight:600;color:#e8ecf4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\n' +
    '/* Studio Drawer Backdrop — ပြင်ပ Screen ကို ထိလျှင် Sidebar ပိတ်စေရန် (Phase 9 fix) */\n' +
    '.layout > .backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:98;}\n' +
    '.layout > .backdrop.show{display:block;}\n' +
    '/* Desktop ≥1200px — Sticky Sidebar (နေရာလွတ်ကြီးနှင့် ခလုတ်ပျောက်ခြင်း မဖြစ်ရအောင်) */\n' +
    '@media (min-width:1200px){\n' +
    '  .layout > .sidebar{position:sticky;top:71px;height:calc(100vh - 85px);}\n' +
    '}\n' +
    '/* iPad / Tablet 769–1199px — Compact + Sticky Sidebar */\n' +
    '@media (min-width:769px) and (max-width:1199px){\n' +
    '  .layout > .sidebar{position:sticky;top:71px;height:calc(100vh - 85px);}\n' +
    '  .sidebar{width:200px;padding:18px 12px;}\n' +
    '  .main-content{margin-left:240px;padding:20px;}\n' +
    '  .layout > .sidebar{width:190px;padding:12px 10px;margin:12px 10px;}\n' +
    '  .layout > .sidebar .nav-item{font-size:13px;padding:8px 10px;gap:8px;min-height:42px;}\n' +
    '  .layout > .sidebar .nav-icon-circle{width:26px;height:26px;font-size:13px;border-radius:8px;}\n' +
    '  .layout > .sidebar .nav-label{font-size:9.5px;margin:14px 0 6px 8px;}\n' +
    '  .layout > .sidebar .side-btn{padding:8px 10px;font-size:12px;}\n' +
    '  .layout > .sidebar .license-badge{font-size:11px;padding:4px 10px;}\n' +
    '  .layout > .main,.layout > main.main{padding:20px;}\n' +
    '}\n' +
    '/* Phone ≤768px — Topbar + Drawer Sidebar + Touch-friendly */\n' +
    '@media (max-width:768px){\n' +
    '  .sidebar{width:220px;}\n' +
    '  /* Voice/Shop မူလ CSS တွင် Sidebar ကို ဖျောက်ထားသော Bug ကို ပြင် → Drawer ပြုလုပ်သည် */\n' +
    '  .layout > .sidebar{display:flex !important;}\n' +
    '  .layout > .sidebar{position:fixed;left:-280px;top:57px;bottom:0;z-index:99;width:256px;max-width:82vw;margin:0;border-radius:0 16px 16px 0;padding:16px 14px;transition:left .3s;box-shadow:4px 0 20px rgba(0,0,0,.5);}\n' +
    '  /* Drawer ထဲတွင် Nav သာ Scroll ဖြစ်ပြီး အောက်ခလုတ် (API Key/Logout စသည်) အမြဲမြင်ရမည် */\n' +
    '  .layout > .sidebar .sidebar-nav{flex:1 1 auto;overflow-y:auto;min-height:0;}\n' +
    '  .layout > .sidebar .sidebar-bottom{flex-shrink:0;margin-top:16px;padding-top:12px;}\n' +
    '  .layout > .sidebar.open{left:0;}\n' +
    '  .layout > .main,.layout > main.main{padding:14px;}\n' +
    '  .main-content{margin-left:0;padding:64px 14px 20px;}\n' +
    '  .hamburger,.menu-btn{display:flex;}\n' +
    '  /* Studio Header Logo ကို Fixed Menu Button နှင့် မထိအောင် ဘယ်ဘက် ချန်ပေးသည် (Phone) */\n' +
    '  .header{padding-left:64px;}\n' +
    '  .nav-item,.side-btn{min-height:46px;}\n' +
    '  .btn,button,select,input,textarea{min-height:44px;}\n' +
    '  .card{padding:14px;}\n' +
    '  .quick-grid,.recent-grid{grid-template-columns:1fr;}\n' +
    '}\n' +
    '</style>';
}

// ---- Shared Sidebar Script (Browser တွင် လုပ်ဆောင်သည်) ----
// toggleSidebar / logout / setApiKey / User Info Hydration / Admin Link
// ကိုယ်ပိုင် Token ဖတ်သောကြောင့် Page Script နှင့် အစဉ်လိုက် မမှီခိုပါ။
export function sidebarScript() {
  return '<script>\n' +
    '// ===== AI Creative Studio — Client-side Creations Store (Phase 13 — Option 2) =====\n' +
    '// User ဖန်တီးမှုအားလုံးကို Browser IndexedDB တွင် သိမ်းသည်။ Server/D1 သို့ မပို့ပါ။\n' +
    'function __aicsDbOpen() {\n' +
    '  return new Promise(function (resolve, reject) {\n' +
    '    if (window.__aicsDb) return resolve(window.__aicsDb);\n' +
    '    if (!window.indexedDB) { reject(new Error(\'no_indexeddb\')); return; }\n' +
    '    var req = indexedDB.open(\'aics_creations_v1\', 1);\n' +
    '    req.onupgradeneeded = function () {\n' +
    '      var db = req.result;\n' +
    '      if (!db.objectStoreNames.contains(\'creations\')) {\n' +
    '        var s = db.createObjectStore(\'creations\', { keyPath: \'id\' });\n' +
    '        s.createIndex(\'user_id\', \'user_id\', { unique: false });\n' +
    '      }\n' +
    '    };\n' +
    '    req.onsuccess = function () { window.__aicsDb = req.result; resolve(req.result); };\n' +
    '    req.onerror = function () { reject(req.error); };\n' +
    '  });\n' +
    '}\n' +
    'function __aicsUserId() {\n' +
    '  var t = \'\';\n' +
    '  try { t = localStorage.getItem(\'aics_token\') || \'\'; } catch (e) {}\n' +
    '  if (!t) return \'\';\n' +
    '  try {\n' +
    '    var part = t.split(\'.\')[1] || \'\';\n' +
    '    part = part.replace(/-/g, \'+\').replace(/_/g, \'/\');\n' +
    '    while (part.length % 4) part += \'=\';\n' +
    '    var p = JSON.parse(atob(part));\n' +
    '    return p.sub || p.user_id || \'\';\n' +
    '  } catch (e) { return \'\'; }\n' +
    '}\n' +
    'function __aicsTx(mode, fn) {\n' +
    '  return __aicsDbOpen().then(function (db) {\n' +
    '    return new Promise(function (resolve, reject) {\n' +
    '      var t = db.transaction(\'creations\', mode);\n' +
    '      var s = t.objectStore(\'creations\');\n' +
    '      var out = null;\n' +
    '      try { out = fn(s); } catch (e) { reject(e); return; }\n' +
    '      t.oncomplete = function () { resolve(out); };\n' +
    '      t.onerror = function () { reject(t.error); };\n' +
    '      t.onabort = function () { reject(t.error); };\n' +
    '    });\n' +
    '  });\n' +
    '}\n' +
    'function __aicsGenId() { return \'c\' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9); }\n' +
    'window.AICS_CREATIONS = {\n' +
    '  save: function (rec) {\n' +
    '    var now = new Date().toISOString();\n' +
    '    var item = {\n' +
    '      id: rec.id || __aicsGenId(),\n' +
    '      user_id: __aicsUserId(),\n' +
    '      studio: rec.studio || \'UNKNOWN\',\n' +
    '      type: String(rec.type || \'1\'),\n' +
    '      title: rec.title || \'Untitled\',\n' +
    '      original_prompt: rec.original_prompt || \'\',\n' +
    '      ai_output: rec.ai_output || \'\',\n' +
    '      media_type: rec.media_type || \'\',\n' +
    '      media_mime: rec.media_mime || \'\',\n' +
    '      media_data: rec.media_data || \'\',\n' +
    '      is_favorite: rec.is_favorite ? 1 : 0,\n' +
    '      created_at: rec.created_at || now,\n' +
    '      updated_at: now\n' +
    '    };\n' +
    '    return __aicsTx(\'readwrite\', function (s) { s.put(item); return item; });\n' +
    '  },\n' +
    '  list: function () {\n' +
    '    var uid = __aicsUserId();\n' +
    '    return __aicsDbOpen().then(function (db) {\n' +
    '      return new Promise(function (resolve, reject) {\n' +
    '        var t = db.transaction(\'creations\', \'readonly\');\n' +
    '        var req = t.objectStore(\'creations\').getAll();\n' +
    '        req.onsuccess = function () {\n' +
    '          var items = (req.result || []).filter(function (c) { return !uid || (c.user_id || \'\') === uid; });\n' +
    '          items.sort(function (a, b) { return ((b.created_at || \'\') > (a.created_at || \'\')) ? 1 : (((b.created_at || \'\') < (a.created_at || \'\')) ? -1 : 0); });\n' +
    '          resolve(items);\n' +
    '        };\n' +
    '        req.onerror = function () { reject(req.error); };\n' +
    '      });\n' +
    '    });\n' +
    '  },\n' +
    '  remove: function (id) {\n' +
    '    return __aicsTx(\'readwrite\', function (s) { s.delete(id); return true; });\n' +
    '  },\n' +
    '  toggleFav: function (id) {\n' +
    '    return __aicsDbOpen().then(function (db) {\n' +
    '      return new Promise(function (resolve, reject) {\n' +
    '        var t = db.transaction(\'creations\', \'readwrite\');\n' +
    '        var s = t.objectStore(\'creations\');\n' +
    '        var g = s.get(id);\n' +
    '        g.onsuccess = function () {\n' +
    '          var c = g.result;\n' +
    '          if (!c) { reject(new Error(\'not_found\')); return; }\n' +
    '          c.is_favorite = c.is_favorite ? 0 : 1;\n' +
    '          c.updated_at = new Date().toISOString();\n' +
    '          s.put(c);\n' +
    '          t.oncomplete = function () { resolve({ favorite: c.is_favorite === 1 }); };\n' +
    '        };\n' +
    '        g.onerror = function () { reject(g.error); };\n' +
    '      });\n' +
    '    });\n' +
    '  }\n' +
    '};\n' +
    '// ===== AI Creative Studio — Shared Sidebar Script (Phase 2 — App Shell) =====\n' +
    '// Phase 12 — Google Login ပြီးနောက် #token ကို ကမ္ဘာလုံးဆိုင်ရာ သိမ်းသည် (App စာမျက်နှာအားလုံးအတွက်)\n' +
    '(function () {\n' +
    '  var h = location.hash || \'\';\n' +
    '  if (h.indexOf(\'#token=\') === 0) {\n' +
    '    try { localStorage.setItem(\'aics_token\', decodeURIComponent(h.slice(7))); } catch (e) {}\n' +
    '    try { history.replaceState(null, \'\', location.pathname); } catch (e) {}\n' +
    '    location.reload();\n' +
    '  }\n' +
    '})();\n' +
    'var SB_TOKEN = localStorage.getItem(\'aics_token\') || \'\';\n' +
    '// Phase 12-fix — Remember Session: localStorage မရှိသော်လည်း Cookie ရှိလျှင် Token ပြန်ရယူသည် (Rule 14)\n' +
    'if (!SB_TOKEN) {\n' +
    '  fetch(\'/api/auth/session\').then(function (r) { return r.json(); }).then(function (d) {\n' +
    '    if (d && d.token) {\n' +
    '      try { localStorage.setItem(\'aics_token\', d.token); } catch (e) {}\n' +
    '      location.reload();\n' +
    '    }\n' +
    '  }).catch(function () {});\n' +
    '}\n' +
    'function __sbToast(msg, isError) {\n' +
    '  try { if (typeof showToast === \'function\') { showToast(msg, isError ? \'error\' : \'success\'); return; } } catch (e) {}\n' +
    '  try {\n' +
    '    var t = document.getElementById(\'toast\');\n' +
    '    if (t) { t.textContent = msg; t.className = \'toast show\' + (isError ? \' error\' : \'\'); setTimeout(function(){ t.className = \'toast\'; }, 2500); return; }\n' +
    '  } catch (e2) {}\n' +
    '  alert(msg);\n' +
    '}\n' +
    'function toggleSidebar() {\n' +
    '  var sb = document.getElementById(\'sidebar\');\n' +
    '  if (!sb) return;\n' +
    '  sb.classList.toggle(\'open\');\n' +
    '  var bd = document.getElementById(\'backdrop\');\n' +
    '  if (bd) bd.classList.toggle(\'show\');\n' +
    '}\n' +
    'function logout() {\n' +
    '  if (!confirm(\'Logout လုပ်မှာလား?\')) return;\n' +
    '  localStorage.removeItem(\'aics_token\'); localStorage.removeItem(\'aics_email\'); localStorage.removeItem(\'aics_plan\');\n' +
    '  location.href = \'/api/auth/logout\';\n' +
    '}\n' +
    'function setApiKey() {\n' +
    '  var key = prompt(\'မင်းရဲ့ Gemini API Key ကို ထည့်ပါ (aistudio.google.com ကနေ ရနိုင်ပါတယ်):\');\n' +
    '  if (!key) return;\n' +
    '  if (!SB_TOKEN) { __sbToast(\'Login လုပ်ပြီးမှ API Key သိမ်းလို့ရပါတယ်\', true); return; }\n' +
    '  fetch(\'/api/user/apikey\', {\n' +
    '    method: \'POST\',\n' +
    '    headers: { \'Content-Type\': \'application/json\', \'Authorization\': \'Bearer \' + SB_TOKEN },\n' +
    '    body: JSON.stringify({ key: key })\n' +
    '  }).then(function (r) { return r.json(); }).then(function (d) {\n' +
    '    if (d.error) { __sbToast(\'Save မအောင်မြင်\', true); return; }\n' +
    '    __sbToast(\'✓ API Key သိမ်းပြီးပါပြီ\', false);\n' +
    '  }).catch(function () { __sbToast(\'Network error\', true); });\n' +
    '}\n' +
    '(function () {\n' +
    '  if (!SB_TOKEN) return;\n' +
    '  fetch(\'/api/users/me\', { headers: { \'Authorization\': \'Bearer \' + SB_TOKEN } })\n' +
    '    .then(function (r) { return r.json(); })\n' +
    '    .then(function (d) {\n' +
    '      if (!d) return;\n' +
    '      if (d.error) { localStorage.removeItem(\'aics_token\'); location.href = \'/api/auth/logout\'; return; }\n' +
    '      var badge = document.getElementById(\'licenseBadge\') || document.getElementById(\'sidePlan\');\n' +
    '      if (badge) {\n' +
    '        if (d.plan === \'PRO\') { badge.innerText = \'⭐ PRO Plan\'; badge.classList.add(\'pro\'); }\n' +
    '        else { badge.innerText = \'FREE Plan\'; }\n' +
    '      }\n' +
    '      var se = document.getElementById(\'sideEmail\');\n' +
    '      if (se) se.textContent = d.email || \'—\';\n' +
    '      var sn = document.getElementById(\'sideName\');\n' +
    '      if (sn) {\n' +
    '        var disp = d.name || (d.email || \'\').split(\'@\')[0] || \'User\';\n' +
    '        sn.textContent = disp;\n' +
    '        var av = document.getElementById(\'sideAvatar\');\n' +
    '        if (av) av.textContent = disp.charAt(0).toUpperCase();\n' +
    '      }\n' +
    '      var ue = document.getElementById(\'userEmail\');\n' +
    '      if (ue) ue.textContent = d.email || \'\';\n' +
    '      var pb = document.getElementById(\'planBadge\');\n' +
    '      if (pb) pb.textContent = d.plan || \'FREE\';\n' +
    '      var al = document.getElementById(\'adminLink\');\n' +
    '      if (al) al.style.display = d.is_admin ? \'\' : \'none\';\n' +
    '      var ss = d.studio_settings || null;\n' +
    '      if (ss) {\n' +
    '        var links = document.querySelectorAll(\'[data-studio]\');\n' +
    '        for (var i = 0; i < links.length; i++) {\n' +
    '          var sid = links[i].getAttribute(\'data-studio\');\n' +
    '          if (ss[sid] === false) links[i].style.display = \'none\';\n' +
    '        }\n' +
    '      }\n' +
    '      localStorage.setItem(\'aics_email\', d.email || \'\'); localStorage.setItem(\'aics_plan\', d.plan || \'\');\n' +
    '    }).catch(function () {});\n' +
    '})();\n' +
    '// Favorites စာမျက်နှာ (fav=1) — Sidebar ထဲက "အနှစ်သက်ဆုံး" လင့်ခ်ကို Active ပြသည် (Phase 9 fix)\n' +
    '(function () {\n' +
    '  if (location.search.indexOf(\'fav=1\') === -1) return;\n' +
    '  var sbL = document.querySelectorAll(\'.sidebar .nav-item\');\n' +
    '  for (var j = 0; j < sbL.length; j++) {\n' +
    '    var h = sbL[j].getAttribute(\'href\') || \'\';\n' +
    '    if (h.indexOf(\'fav=1\') > -1) sbL[j].classList.add(\'active\');\n' +
    '    else if (h === \'/app/creations\') sbL[j].classList.remove(\'active\');\n' +
    '  }\n' +
    '})();\n' +
    '// ===== Phase C — Studio AI Model Selector (User ရွေးသုံးနိုင်သည်) =====\n' +
    '// စာမျက်နှာထဲတွင် <select id="aiModelSel" data-category="..."> (Voice Studio မှာ aiModelSel2 ပါ) ရှိပါက အလိုအလျောက် ဖြည့်ပေးသည်\n' +
    '(function () {\n' +
    '  var sels = document.querySelectorAll(\'select[id^="aiModelSel"]\');\n' +
    '  if (!sels || sels.length === 0) return;\n' +
    '  for (var k = 0; k < sels.length; k++) {\n' +
    '    (function (sel) {\n' +
    '      var cat = sel.getAttribute(\'data-category\') || \'text\';\n' +
    '      var key = sel.id === \'aiModelSel\' ? \'aics_default_model\' : \'aics_default_model_\' + cat;\n' +
    '      var saved = \'\';\n' +
    '      try { saved = localStorage.getItem(key) || \'\'; } catch (e) {}\n' +
    '      function fill(opts, selected) {\n' +
    '        if (!opts || opts.length === 0) { sel.innerHTML = \'<option value="">(Model မရှိ)</option>\'; return; }\n' +
    '        var html = \'\';\n' +
    '        for (var i = 0; i < opts.length; i++) {\n' +
    '          var m = opts[i];\n' +
    '          var isSel = m.id === selected;\n' +
    '          html += \'<option value="\' + m.id + \'"\' + (isSel ? \' selected\' : \'\') + \'>\' + String(m.name || m.id) + \'</option>\';\n' +
    '        }\n' +
    '        sel.innerHTML = html;\n' +
    '        if (!sel.value) sel.value = opts[0].id;\n' +
    '      }\n' +
    '      fetch(\'/api/ai-models?category=\' + encodeURIComponent(cat), { headers: { \'Authorization\': \'Bearer \' + SB_TOKEN } })\n' +
    '        .then(function (r) { return r.json(); })\n' +
    '        .then(function (d) {\n' +
    '          if (!d || d.error || !d.items || d.items.length === 0) { sel.innerHTML = \'<option value="">(Model မရှိ)</option>\'; return; }\n' +
    '          fill(d.items, saved);\n' +
    '        })\n' +
    '        .catch(function () { sel.innerHTML = \'<option value="">(Default)</option>\'; });\n' +
    '      sel.addEventListener(\'change\', function () {\n' +
    '        try { localStorage.setItem(key, sel.value); } catch (e) {}\n' +
    '      });\n' +
    '    })(sels[k]);\n' +
    '  }\n' +
    '})();\n' +
    '</script>';
}

// ============================================================
// AI CREATIVE STUDIO — SHARED STUDIO SHELL (Master Instruction — Phase 4)
// ------------------------------------------------------------
// တူညီသော Studio UI အခွံ — Studio Header + Workflow Stepper
// + Work Area / Preview Grid + Bottom Action Bar
// Studio စာမျက်နှာများသည် renderStudioShell(opts) ကို ခေါ်ယူရုံဖြင့်
// ပုံစံတူ layout ကို ရရှိပြီး မိမိ step အကြောင်းအရာများကို
// <div class="aics-step" data-step="N"> ထဲတွင် ထည့်ပါသည်။
// Page Script မှ သုံးနိုင်သော Global Helpers:
//   studioGoStep(n) / studioMarkDone(n) / studioSetActions(list)
//   studioPreview(html) / studioSaveDraft() / studioReset()
//   studioCollectDraft() / studioRestoreDraft(data) / studioOnStep(n)
// ============================================================

function aicsShellCss() {
  return (
    '<style>\n' +
    '/* ===== AI Creative Studio — Shared Studio Shell (Phase 4) ===== */\n' +
    '.aics-login-overlay{position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;background:var(--bg,#080c18);padding:20px;}\n' +
    '.aics-login-box{background:#0d1424;border:1px solid rgba(0,229,255,.2);border-radius:16px;padding:40px 32px;max-width:400px;width:100%;text-align:center;}\n' +
    '.aics-login-box h2{color:#00e5ff;margin-bottom:10px;font-size:18px;}\n' +
    '.aics-login-box p{color:#94a3b8;font-size:13.5px;margin-bottom:22px;}\n' +
    '.aics-header{display:flex;align-items:center;gap:14px;padding:10px 20px;background:linear-gradient(135deg,#0a1628,#0d1f3c);border-bottom:1px solid rgba(0,229,255,.12);position:sticky;top:0;z-index:100;width:100%;box-sizing:border-box;}\n' +
    '.aics-menu-btn{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(0,229,255,.2);color:#00e5ff;font-size:19px;cursor:pointer;flex-shrink:0;transition:all .2s;padding:0;box-shadow:none;}\n' +
    '.aics-menu-btn:hover{background:rgba(0,229,255,.14);}\n' +
    '.aics-brand{display:flex;align-items:center;gap:10px;flex:1;min-width:0;}\n' +
    '.aics-brand-icon{font-size:20px;flex-shrink:0;}\n' +
    '.aics-title{font-size:17px;font-weight:800;letter-spacing:.3px;background:linear-gradient(90deg,#00e5ff,#7b5cff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\n' +
    '.aics-pro{padding:6px 16px;border-radius:999px;background:linear-gradient(135deg,#7b5cff,#00e5ff);color:#fff;font-size:12px;font-weight:700;letter-spacing:.5px;flex-shrink:0;box-shadow:0 2px 12px rgba(123,92,255,.35);}\n' +
    '.aics-header-left{display:flex;align-items:center;gap:12px;min-width:0;}\n' +
    '.aics-back{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:10px;border:1px solid rgba(0,229,255,.28);color:#00e5ff;background:rgba(0,229,255,.06);font-size:17px;text-decoration:none;flex-shrink:0;transition:all .2s;}\n' +
    '.aics-back:hover{background:rgba(0,229,255,.14);transform:translateX(-2px);}\n' +
    '.aics-title{font-size:16.5px;font-weight:800;letter-spacing:.3px;background:linear-gradient(90deg,#00e5ff,#7b5cff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap;}\n' +
    '.aics-desc{font-size:11.5px;color:#8b95a8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:340px;}\n' +
    '.aics-header-right{display:flex;align-items:center;gap:10px;}\n' +
    '.aics-model{display:flex;align-items:center;gap:8px;}\n' +
    '.aics-model-label{font-size:11.5px;color:#8b95a8;font-weight:600;white-space:nowrap;}\n' +
    '.aics-model select{width:auto;min-width:150px;max-width:210px;padding:8px 10px;}\n' +
    '.aics-hd-save{display:inline-flex;align-items:center;gap:6px;background:#111a2e;border:1px solid rgba(0,229,255,.35);color:#00e5ff;padding:8px 14px;border-radius:10px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;min-height:38px;transition:all .2s;}\n' +
    '.aics-hd-save:hover{background:rgba(0,229,255,.12);}\n' +
    '.aics-user{display:flex;align-items:center;gap:8px;}\n' +
    '.aics-gear{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:10px;border:1px solid rgba(0,229,255,.28);color:#00e5ff;background:rgba(0,229,255,.06);font-size:17px;text-decoration:none;flex-shrink:0;transition:all .2s;}\n' +
    '.aics-gear:hover{background:rgba(0,229,255,.14);}\n' +
    '.aics-userblock{display:flex;align-items:center;gap:9px;}\n' +
    '.aics-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#7b5cff,#00e5ff);color:#041018;font-weight:700;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}\n' +
    '.aics-username{font-size:13px;font-weight:600;color:#e8ecf4;white-space:nowrap;}\n' +
    '.aics-planbadge{font-size:10.5px;font-weight:700;color:#00e5ff;border:1px solid rgba(0,229,255,.4);border-radius:999px;padding:2px 9px;white-space:nowrap;}\n' +
    '.aich-label{font-size:11.5px;color:#8b95a8;font-weight:700;letter-spacing:.4px;margin:16px 0 8px;}\n' +
    '.aich-chips{display:flex;flex-wrap:wrap;gap:8px;}\n' +
    '.aich-chip{display:inline-flex;align-items:center;gap:6px;background:#111a2e;border:1px solid #26324a;color:#c7d0e0;padding:9px 16px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;}\n' +
    '.aich-chip:hover{border-color:rgba(0,229,255,.45);color:#fff;}\n' +
    '.aich-chip.active{background:rgba(0,229,255,.12);border-color:#00e5ff;color:#00e5ff;}\n' +
    '.aich-chip.pro{border-color:rgba(123,92,255,.4);color:#b7a8ff;}\n' +
    '.aich-chip.pro.active{background:rgba(123,92,255,.16);color:#b7a8ff;}\n' +
    '.aich-model-wrap{margin-top:16px;}\n' +
    '.aich-model-wrap select{width:100%;padding:11px 12px;border-radius:10px;background:#0d1424;border:1px solid #26324a;color:#fff;font-size:13.5px;font-family:inherit;}\n' +
    '.aics-main{max-width:1280px;margin:0 auto;width:100%;padding:20px 24px;}\n' +
    '.aics-stepper{margin-bottom:18px;background:#0d1424;border:1px solid rgba(0,229,255,.12);border-radius:14px;padding:10px 12px;overflow-x:auto;}\n' +
    '.aics-stepper-inner{display:flex;align-items:center;gap:6px;min-width:max-content;}\n' +
    '.aics-step-btn{display:flex;align-items:center;gap:9px;background:none;border:none;color:#5a6478;padding:8px 12px;border-radius:10px;cursor:pointer;font-family:inherit;font-size:13px;white-space:nowrap;transition:all .2s;}\n' +
    '.aics-step-btn .aics-step-num{width:23px;height:23px;border-radius:50%;background:#1a2138;color:#94a3b8;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;border:1px solid transparent;}\n' +
    '.aics-step-btn .aics-step-label{font-weight:600;color:#94a3b8;}\n' +
    '.aics-step-btn .aics-step-sub{display:block;font-size:10.5px;color:#5a6478;font-weight:400;}\n' +
    '.aics-step-btn:hover .aics-step-label{color:#e8ecf4;}\n' +
    '.aics-step-btn.active{background:linear-gradient(90deg,rgba(123,92,255,.18),rgba(0,229,255,.08));border:1px solid rgba(123,92,255,.55);box-shadow:0 0 14px rgba(123,92,255,.25);}\n' +
    '.aics-step-btn.active .aics-step-num{background:linear-gradient(135deg,#7b5cff,#00e5ff);color:#041018;border-color:transparent;}\n' +
    '.aics-step-btn.active .aics-step-label{color:#fff;}\n' +
    '.aics-step-btn.done .aics-step-num{background:rgba(74,222,128,.15);border-color:rgba(74,222,128,.55);color:#4ade80;}\n' +
    '.aics-step-btn.done .aics-step-label{color:#4ade80;}\n' +
    '.aics-step-btn.todo{cursor:not-allowed;opacity:.5;}\n' +
    '.aics-step-link{width:20px;height:1px;background:rgba(0,229,255,.22);flex-shrink:0;}\n' +
    '.aics-grid{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:18px;align-items:start;}\n' +
    '.aics-work{min-width:0;}\n' +
    '.aics-step{display:none;}\n' +
    '.aics-step.active{display:block;}\n' +
    '.aics-panel{position:sticky;top:80px;background:#0d1424;border:1px solid rgba(0,229,255,.15);border-radius:14px;min-height:360px;max-height:calc(100vh - 110px);overflow:auto;}\n' +
    '.aics-panel-head{padding:12px 16px;font-weight:700;color:#00e5ff;font-size:12.5px;border-bottom:1px solid rgba(0,229,255,.12);letter-spacing:.5px;display:flex;align-items:center;gap:8px;position:sticky;top:0;background:#0d1424;border-radius:14px 14px 0 0;z-index:2;}\n' +
    '.aics-panel-body{padding:16px;}\n' +
    '.aics-empty{text-align:center;padding:44px 16px;color:#5a6478;}\n' +
    '.aics-empty-icon{font-size:34px;margin-bottom:10px;opacity:.7;}\n' +
    '.aics-empty-title{color:#94a3b8;font-weight:600;font-size:14px;margin-bottom:4px;}\n' +
    '.aics-empty-sub{font-size:12px;}\n' +
    '.aics-preview-content{line-height:1.7;font-size:13.5px;word-break:break-word;}\n' +
    '.aics-preview-content pre{white-space:pre-wrap;word-break:break-word;font-family:inherit;background:#0a1020;border:1px solid rgba(0,229,255,.12);border-radius:10px;padding:14px;font-size:13px;line-height:1.7;margin:0;}\n' +
    '.aics-pv-label{font-size:11px;color:#8b95a8;font-weight:700;letter-spacing:.5px;margin-bottom:8px;text-transform:uppercase;}\n' +
    '.aics-pv-card{background:#0a1020;border:1px solid rgba(0,229,255,.12);border-radius:10px;padding:12px 14px;margin-bottom:10px;}\n' +
    '.aics-pv-card h4{margin:0 0 4px;color:#00e5ff;font-size:13px;}\n' +
    '.aics-pv-card p{margin:0 0 6px;color:#e8ecf4;font-size:12.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word;}\n' +
    '.aics-pv-card .aics-pv-sub{color:#8b95a8;font-size:11.5px;}\n' +
    '.aics-pv-img{max-width:100%;border-radius:8px;border:1px solid rgba(0,229,255,.15);margin-top:6px;}\n' +
    '.aics-actions{position:sticky;bottom:10px;margin-top:18px;background:rgba(21,27,43,.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(0,229,255,.22);border-radius:14px;padding:12px 16px;z-index:50;box-shadow:0 6px 24px rgba(0,0,0,.4);}\n' +
    '.aics-actions-inner{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:space-between;}\n' +
    '.aics-actions-model{display:flex;align-items:center;gap:8px;flex-shrink:0;}\n' +
    '.aics-actions-model-label{font-size:11.5px;color:#94a3b8;font-weight:700;white-space:nowrap;letter-spacing:.4px;}\n' +
    '.aics-actions-model select{min-width:130px;max-width:200px;padding:9px 10px;background:rgba(123,92,255,.12);border:1px solid rgba(123,92,255,.4);color:#c4b5fd;border-radius:12px;font-size:13px;font-family:inherit;}\n' +
    '.aics-actions-model select:hover{border-color:rgba(123,92,255,.7);background:rgba(123,92,255,.18);}\n' +
    '.aics-actions-inner{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end;}\n' +
    '.aics-act{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 22px;border-radius:12px;border:none;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit;min-height:44px;transition:all .2s;}\n' +
    '.aics-act.primary{background:linear-gradient(135deg,#00e5ff,#00b8d4);color:#080c18;box-shadow:0 2px 14px rgba(0,229,255,.3);}\n' +
    '.aics-act.primary:hover{opacity:.92;transform:translateY(-1px);box-shadow:0 4px 18px rgba(0,229,255,.4);}\n' +
    '.aics-act.success{background:linear-gradient(135deg,#00e676,#00c853);color:#080c18;box-shadow:0 2px 14px rgba(0,230,118,.3);}\n' +
    '.aics-act.success:hover{opacity:.92;transform:translateY(-1px);}\n' +
    '.aics-act.purple{background:linear-gradient(135deg,#7b5cff,#9c7cff);color:#fff;box-shadow:0 2px 14px rgba(123,92,255,.3);}\n' +
    '.aics-act.purple:hover{opacity:.92;transform:translateY(-1px);}\n' +
    '.aics-act.secondary{background:rgba(255,159,43,.1);color:#ffb84d;border:1px solid rgba(255,159,43,.35);}\n' +
    '.aics-act.secondary:hover{background:rgba(0,229,255,.16);}\n' +
    '.aics-act.ghost{background:rgba(255,255,255,.04);color:#94a3b8;border:1px solid rgba(148,163,184,.25);}\n' +
    '.aics-act.ghost:hover{color:#00e5ff;border-color:rgba(0,229,255,.4);background:rgba(0,229,255,.06);}\n' +
    '@media (min-width:769px) and (max-width:1199px){.aics-grid{grid-template-columns:minmax(0,3fr) minmax(0,2fr);}.aics-desc{max-width:200px;}}\n' +
    '@media (max-width:768px){\n' +
    '  .aics-header{padding:8px 12px;gap:10px;}\n' +
    '  .aics-title{font-size:15px;}\n' +
    '  .aics-brand-icon{font-size:17px;}\n' +
    '  .aics-pro{padding:5px 12px;font-size:11px;}\n' +
    '  .aics-desc{display:none;}\n' +
    '  .aics-user .user-email{display:none;}\n' +
    '  .aics-model-label{display:none;}\n' +
    '  .aics-model select{min-width:0;max-width:120px;padding:7px 8px;font-size:12px;}\n' +
    '  .aics-hd-save{padding:8px 10px;font-size:12px;}\n' +
    '  .aics-grid{grid-template-columns:1fr;}\n' +
    '  .aics-panel{position:static;max-height:none;min-height:0;}\n' +
    '  .aics-main{padding:14px;}\n' +
    '  .aics-actions{position:sticky;bottom:8px;padding:10px 12px;}\n' +
    '  .aics-actions-inner{justify-content:flex-end;gap:8px;}\n' +
    '  .aics-actions-model{flex:0 0 auto;}\n' +
    '  .aics-actions-model select{min-width:0;max-width:130px;padding:8px;font-size:12px;}\n' +
    '  .aics-actions-model-label{font-size:10.5px;}\n' +
    '  .aics-act{flex:1;padding:10px 8px;font-size:12.5px;min-height:42px;}\n' +
    '  .aics-stepper{padding:8px;}\n' +
    '}\n' +
    '</style>'
  );
}

// opts: { id, activeId, nameMy, desc, icon, modelCat, steps:[{label,sub,req?}], content }
export function renderStudioShell(opts) {
  opts = opts || {};
  const id = opts.id || 'studio';
  const activeId = opts.activeId || id;
  const nameMy = opts.nameMy || 'Studio';
  const desc = opts.desc || '';
  const icon = opts.icon || '🎨';
  const modelCat = opts.modelCat || 'text';
  const steps = opts.steps || [];
  const content = opts.content || '';
  const stepsJson = JSON.stringify(steps.map(function (s, i) {
    return { n: i + 1, label: s.label || 'Step ' + (i + 1), sub: s.sub || '', req: s.req || (i === 0 ? [] : [i]) };
  }));

  return (
    aicsShellCss() +
    '<div class="aics-app" id="aicsApp">\n' +
    '<header class="header aics-header">\n' +
    '<button class="aics-menu-btn" onclick="toggleSidebar()">&#9776;</button>\n' +
    '<div class="aics-brand"><span class="aics-brand-icon">' + icon + '</span><span class="aics-title">' + nameMy + '</span></div>\n' +
    '<div class="aics-pro" id="sidePlan">FREE</div>\n' +
    '</header>\n' +
    '<div class="layout">\n' +
    renderSidebar(activeId, { variant: 'studio' }) +
    '<main class="main aics-main">\n' +
    '<div class="aics-stepper" id="aicsStepper"></div>\n' +
    '<div class="aics-grid">\n' +
    '<section class="aics-work" id="aicsWork">\n' +
    content +
    '</section>\n' +
    '<aside class="aics-panel" id="aicsPanel">\n' +
    '<div class="aics-panel-head">&#128065; Preview</div>\n' +
    '<div class="aics-panel-body">\n' +
    '<div class="aics-empty" id="aicsEmpty">\n' +
    '<div class="aics-empty-icon">&#127912;</div>\n' +
    '<div class="aics-empty-title">Your result will appear here.</div>\n' +
    '<div class="aics-empty-sub">Complete the steps to generate your result.</div>\n' +
    '</div>\n' +
    '<div class="aics-preview-content" id="aicsPreviewContent" style="display:none;"></div>\n' +
    '</div>\n' +
    '</aside>\n' +
    '</div>\n' +
    '<div class="aics-actions">\n' +
    '<div class="aics-actions-inner" id="aicsActionsInner"><div class="aics-actions-model"><span class="aics-actions-model-label">&#129302; AI မော်ဒယ်</span><select id="aiModelSel" data-category="' + modelCat + '"></select></div></div>\n' +
    '</div>\n' +
    '</main>\n' +
    '</div>\n' +
    '</div>\n' +
    '<script>\n' +
    '(function () {\n' +
    '  var SHELL_ID = ' + JSON.stringify(id) + ';\n' +
    '  var STEPS = ' + stepsJson + ';\n' +
    '  var draftKey = "aics_draft_" + SHELL_ID;\n' +
    '  var cur = 1;\n' +
    '  var doneMap = {};\n' +
    '  var started = false;\n' +
    '  function el(id) { return document.getElementById(id); }\n' +
    '  function toast(msg, isErr) { try { __sbToast(msg, isErr); } catch (e) { try { alert(msg); } catch (e2) {} } }\n' +
    '  function allowed(n) {\n' +
    '    if (doneMap[n]) return true;\n' +
    '    if (n === 1) return true;\n' +
    '    for (var i = 0; i < STEPS.length; i++) {\n' +
    '      if (STEPS[i].n === n) {\n' +
    '        var req = STEPS[i].req || [];\n' +
    '        for (var r = 0; r < req.length; r++) { if (!doneMap[req[r]]) return false; }\n' +
    '        return true;\n' +
    '      }\n' +
    '    }\n' +
    '    return false;\n' +
    '  }\n' +
    '  function renderStepper() {\n' +
    '    var c = el("aicsStepper"); if (!c) return;\n' +
    '    var html = \'<div class="aics-stepper-inner">\';\n' +
    '    for (var i = 0; i < STEPS.length; i++) {\n' +
    '      var s = STEPS[i];\n' +
    '      html += \'<button class="aics-step-btn" data-step="\' + s.n + \'" onclick="studioGoStep(\' + s.n + \')">\' +\n' +
    '        \'<span class="aics-step-num">\' + s.n + \'</span>\' +\n' +
    '        \'<span class="aics-step-txt"><span class="aics-step-label">\' + s.label + \'</span>\' + (s.sub ? \'<span class="aics-step-sub">\' + s.sub + \'</span>\' : \'\') + \'</span></button>\';\n' +
    '      if (i < STEPS.length - 1) html += \'<span class="aics-step-link"></span>\';\n' +
    '    }\n' +
    '    html += \'</div>\';\n' +
    '    c.innerHTML = html;\n' +
    '  }\n' +
    '  function updateStepper() {\n' +
    '    var btns = document.querySelectorAll(".aics-step-btn");\n' +
    '    for (var i = 0; i < btns.length; i++) {\n' +
    '      var n = parseInt(btns[i].getAttribute("data-step"), 10);\n' +
    '      btns[i].classList.remove("active", "done", "todo");\n' +
    '      if (n === cur) btns[i].classList.add("active");\n' +
    '      else if (doneMap[n]) btns[i].classList.add("done");\n' +
    '      else if (!allowed(n)) btns[i].classList.add("todo");\n' +
    '    }\n' +
    '  }\n' +
    '  function showStep(n) {\n' +
    '    var steps = document.querySelectorAll(".aics-step");\n' +
    '    for (var i = 0; i < steps.length; i++) {\n' +
    '      var sn = parseInt(steps[i].getAttribute("data-step"), 10);\n' +
    '      steps[i].classList.toggle("active", sn === n);\n' +
    '    }\n' +
    '    var w = el("aicsWork"); if (w) w.scrollTop = 0;\n' +
    '    updateStepper();\n' +
    '    if (window.studioOnStep) { try { window.studioOnStep(n); } catch (e) {} }\n' +
    '  }\n' +
    '  window.studioGoStep = function (n) {\n' +
    '    if (!allowed(n)) return;\n' +
    '    cur = n;\n' +
    '    showStep(n);\n' +
    '  };\n' +
    '  window.studioMarkDone = function (n) {\n' +
    '    doneMap[n] = true;\n' +
    '    updateStepper();\n' +
    '  };\n' +
    '  window.studioCur = function () { return cur; };\n' +
    '  window.aichAudChoices = [\'လူတိုင်း\', \'လူငယ်\', \'လူကြီး\', \'ကလေး\'];\n' +
    '  window.aichAud = \'လူတိုင်း\';\n' +
    '  window.aichBuildAud = function (containerId, selected) {\n' +
    '    var c = el(containerId); if (!c) return;\n' +
    '    window.aichAud = selected || window.aichAud;\n' +
    '    var html = \'\';\n' +
    '    for (var i = 0; i < window.aichAudChoices.length; i++) {\n' +
    '      var v = window.aichAudChoices[i];\n' +
    '      html += \'<button type="button" class="aich-chip\' + (v === window.aichAud ? \' active\' : \'\') + \'" onclick="aichPickAud(this)">\' + v + \'</button>\';\n' +
    '    }\n' +
    '    c.innerHTML = html;\n' +
    '  };\n' +
    '  window.aichPickAud = function (btn) {\n' +
    '    var p = btn.parentElement;\n' +
    '    var btns = p.querySelectorAll(".aich-chip");\n' +
    '    for (var i = 0; i < btns.length; i++) btns[i].classList.remove("active");\n' +
    '    btn.classList.add("active");\n' +
    '    window.aichAud = btn.textContent;\n' +
    '  };\n' +
    '  window.studioSetActions = function (list) {\n' +
    '    var c = el("aicsActionsInner"); if (!c) return;\n' +
    '    var model = c.querySelector(".aics-actions-model");\n' +
    '    var acts = (list || []).filter(function(a){ return a && a.label; });\n' +
    '    var html = \'\';\n' +
    '    for (var i = 0; i < acts.length; i++) {\n' +
    '      var a = acts[i];\n' +
    '      html += \'<button class="aics-act \' + (a.cls || "secondary") + \'" onclick="studioAct(\' + i + \')">\' + a.label + \'</button>\';\n' +
    '    }\n' +
    '    c.innerHTML = \'\';\n' +
    '    if (model) c.appendChild(model);\n' +
    '    c.insertAdjacentHTML("beforeend", html);\n' +
    '    window.__studioActions = acts;\n' +
    '  };\n' +
    '  window.studioAct = function (i) {\n' +
    '    var list = window.__studioActions || [];\n' +
    '    var a = list[i];\n' +
    '    if (!a) return;\n' +
    '    if (typeof a.fn === "function") { try { a.fn(); } catch (e) { toast("Action error: " + (e && e.message || ""), true); } }\n' +
    '    else if (a.fn && window[a.fn]) { try { window[a.fn](); } catch (e) { toast("Action error: " + (e && e.message || ""), true); } }\n' +
    '  };\n' +
    '  window.studioPreview = function (html) {\n' +
    '    var pc = el("aicsPreviewContent"), em = el("aicsEmpty");\n' +
    '    if (html === null || html === undefined || html === "") {\n' +
    '      if (pc) { pc.style.display = "none"; pc.innerHTML = ""; }\n' +
    '      if (em) em.style.display = "block";\n' +
    '      return;\n' +
    '    }\n' +
    '    if (em) em.style.display = "none";\n' +
    '    if (pc) { pc.innerHTML = html; pc.style.display = "block"; }\n' +
    '  };\n' +
    '  window.studioSaveDraft = function () {\n' +
    '    var data = null;\n' +
    '    if (window.studioCollectDraft) { try { data = window.studioCollectDraft(); } catch (e) { data = null; } }\n' +
    '    try {\n' +
    '      localStorage.setItem(draftKey, JSON.stringify({ step: cur, data: data, savedAt: new Date().toISOString() }));\n' +
    '      toast("&#10004; Draft သိမ်းပြီးပါပြီ");\n' +
    '    } catch (e) { toast("Save မအောင်မြင်ပါ", true); }\n' +
    '  };\n' +
    '  window.studioReset = function () {\n' +
    '    if (!confirm("ဤ Studio ရဲ့ အချက်အလက်အားလုံးကို ဖျက်ပြီး အစကပြန်စမလား?")) return;\n' +
    '    try { localStorage.removeItem(draftKey); } catch (e) {}\n' +
    '    location.reload();\n' +
    '  };\n' +
    '  function init() {\n' +
    '    renderStepper();\n' +
    '    var raw = null;\n' +
    '    try { raw = localStorage.getItem(draftKey); } catch (e) {}\n' +
    '    if (raw) {\n' +
    '      try {\n' +
    '        var d = JSON.parse(raw);\n' +
    '        if (d && d.data && window.studioRestoreDraft) { window.studioRestoreDraft(d.data); }\n' +
    '        if (d && d.step && allowed(d.step)) cur = d.step;\n' +
    '      } catch (e) {}\n' +
    '    }\n' +
    '    showStep(cur);\n' +
    '  }\n' +
    '  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);\n' +
    '  else init();\n' +
    '})();\n' +
    '</script>'
  );
}
