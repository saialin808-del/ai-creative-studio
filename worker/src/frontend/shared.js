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
    '  <a class="nav-item' + favActive + '" href="/app/creations?fav=1"><span class="nav-icon-circle">⭐</span> အနှစ်သက်ဆုံး</a>\n' +
    '  <div class="nav-label">SETTINGS</div>\n' +
    '  <a class="nav-item' + setActive + '" href="/app/settings"><span class="nav-icon-circle">🛠️</span> ဆက်တင်များ</a>'
  );
}

// ---- App Shell Sidebar (Home / Creations ပုံစံ — Hamburger + Backdrop + Brand) ----
function appShellSidebar(activeId) {
  const homeActive = activeId === 'home' ? ' active' : '';
  return (
    '<button class="hamburger" onclick="toggleSidebar()">☰</button>\n' +
    '<div class="backdrop" id="backdrop" onclick="toggleSidebar()"></div>\n' +
    '<nav class="sidebar" id="sidebar">\n' +
    '  <div class="sidebar-nav">\n' +
    '  <div class="brand"><div class="brand-title">🎨 AI Creative Studio</div></div>\n' +
    '  <a class="nav-item' + homeActive + '" href="/app"><span class="nav-icon-circle">🏠</span> ပင်မ</a>\n' +
    '  <div class="nav-label">STUDIOS</div>\n' +
    '  ' + studioLinks(activeId) + '\n' +
    '  <div class="nav-label">MY WORK</div>\n' +
    '  ' + myWorkLinks(activeId) + '\n' +
    '  </div>\n' +
    '  <div class="sidebar-bottom">\n' +
    '    <div class="side-user"><div class="avatar" id="sideAvatar">👤</div><div class="side-name" id="sideName">—</div></div>\n' +
    '    <div class="license-badge" id="licenseBadge">Checking plan...</div>\n' +
    '    <div class="side-email" id="sideEmail" style="font-size:11.5px;color:var(--text3);margin-bottom:8px;word-break:break-all;">—</div>\n' +
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
  return (
    '<div class="backdrop" id="backdrop" onclick="toggleSidebar()"></div>\n' +
    '<div class="sidebar" id="sidebar" style="display:flex;flex-direction:column;">\n' +
    '  <div class="sidebar-nav">\n' +
    '  <a class="nav-item' + homeActive + '" href="/app"><span class="nav-icon-circle">🏠</span> ပင်မ</a>\n' +
    '  <div class="nav-label">STUDIOS</div>\n' +
    '  ' + studioLinks(activeId) + '\n' +
    '  <div class="nav-label">MY WORK</div>\n' +
    '  ' + myWorkLinks(activeId) + '\n' +
    '  </div>\n' +
    '  <div class="sidebar-bottom">\n' +
    '  <div class="side-user"><div class="avatar" id="sideAvatar">👤</div><div class="side-name" id="sideName">—</div></div>\n' +
    '  <div class="license-badge" id="sidePlan">—</div>\n' +
    '  <div class="side-email" id="sideEmail">—</div>\n' +
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
    '.sidebar-bottom{flex-shrink:0;margin-top:auto;}\n' +
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
    '  .layout > .sidebar .sidebar-bottom{flex-shrink:0;margin-top:auto;padding-top:12px;}\n' +
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
    '</script>';
}
