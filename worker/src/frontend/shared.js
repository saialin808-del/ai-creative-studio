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
function myWorkLinks(creationsActive) {
  return (
    '<a class="nav-item' + creationsActive + '" href="/app/creations"><span class="nav-icon-circle">📁</span> ဖန်တီးမှုများ</a>\n' +
    '  <a class="nav-item" href="/app/creations?fav=1"><span class="nav-icon-circle">⭐</span> အနှစ်သက်ဆုံး</a>\n' +
    '  <div class="nav-label">SETTINGS</div>\n' +
    '  <a class="nav-item" href="/app/settings"><span class="nav-icon-circle">🛠️</span> ဆက်တင်များ</a>'
  );
}

// ---- App Shell Sidebar (Home / Creations ပုံစံ — Hamburger + Backdrop + Brand) ----
function appShellSidebar(activeId) {
  const homeActive = activeId === 'home' ? ' active' : '';
  const creationsActive = activeId === 'creations' ? ' active' : '';
  return (
    '<button class="hamburger" onclick="toggleSidebar()">☰</button>\n' +
    '<div class="backdrop" id="backdrop" onclick="toggleSidebar()"></div>\n' +
    '<nav class="sidebar" id="sidebar">\n' +
    '  <div class="brand"><div class="brand-title">🎨 AI Creative Studio</div></div>\n' +
    '  <a class="nav-item' + homeActive + '" href="/app"><span class="nav-icon-circle">🏠</span> ပင်မ</a>\n' +
    '  <div class="nav-label">STUDIOS</div>\n' +
    '  ' + studioLinks(activeId) + '\n' +
    '  <div class="nav-label">MY WORK</div>\n' +
    '  ' + myWorkLinks(creationsActive) + '\n' +
    '  <div class="sidebar-bottom">\n' +
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
  const creationsActive = activeId === 'creations' ? ' active' : '';
  return (
    '<div class="sidebar" id="sidebar" style="display:flex;flex-direction:column;">\n' +
    '  <a class="nav-item' + homeActive + '" href="/app"><span class="nav-icon-circle">🏠</span> ပင်မ</a>\n' +
    '  <div class="nav-label">STUDIOS</div>\n' +
    '  ' + studioLinks(activeId) + '\n' +
    '  <div class="nav-label">MY WORK</div>\n' +
    '  ' + myWorkLinks(creationsActive) + '\n' +
    '  <div class="sidebar-bottom">\n' +
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
// activeId: 'home' | 'creations' | studioId (ဥပမာ 'story')
// opts.variant: 'app' (Home/Creations) | 'studio' (Studio မျက်နှာများ)
export function renderSidebar(activeId, opts) {
  opts = opts || {};
  return opts.variant === 'studio' ? studioPageSidebar(activeId) : appShellSidebar(activeId);
}

// ---- Shared Sidebar Script (Browser တွင် လုပ်ဆောင်သည်) ----
// toggleSidebar / logout / setApiKey / User Info Hydration / Admin Link
// ကိုယ်ပိုင် Token ဖတ်သောကြောင့် Page Script နှင့် အစဉ်လိုက် မမှီခိုပါ။
export function sidebarScript() {
  return '<script>\n' +
    '// ===== AI Creative Studio — Shared Sidebar Script (Phase 2 — App Shell) =====\n' +
    'var SB_TOKEN = localStorage.getItem(\'aics_token\') || \'\';\n' +
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
    '  location.href = \'/app\';\n' +
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
    '      if (d.error) { localStorage.removeItem(\'aics_token\'); location.reload(); return; }\n' +
    '      var badge = document.getElementById(\'licenseBadge\') || document.getElementById(\'sidePlan\');\n' +
    '      if (badge) {\n' +
    '        if (d.plan === \'PRO\') { badge.innerText = \'⭐ PRO Plan\'; badge.classList.add(\'pro\'); }\n' +
    '        else { badge.innerText = \'FREE Plan\'; }\n' +
    '      }\n' +
    '      var se = document.getElementById(\'sideEmail\');\n' +
    '      if (se) se.textContent = d.email || \'—\';\n' +
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
    '</script>';
}
