// ============================================================
// AI CREATIVE STUDIO — SHARED WORK-ROOM UI (shared)
// ------------------------------------------------------------
// Step Flow အတွက် UI Building Blocks — Studio အားလုံး ဤ File ကို သုံးသည်
// - Studio logic မပါ — စာသား/ပုံစံ သာ
// - Step တစ်ခု၏ "အခန်း" ကို Zone ၄ ပိုင်း ဖြင့် တည်ဆောက်သည်:
//   A. Context (ဘာလုပ်ရမလဲ) → B. Input (ဖြည့်စရာ) → C. Primary Action (ခလုတ် ၁ ခု) → D. Result/Continue
// ============================================================

// ---- Work Room ၏ ပုံစံ (CSS) — Studio Page တိုင်း ထည့်သည် ----
export function workRoomCss() {
  return '<style>\n' +
    '/* ===== Work Room — Shared Step UI ===== */\n' +
    '.wr-shell{max-width:960px;margin:0 auto;width:100%}\n' +
    '.wr-rail{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:16px;padding:12px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px}\n' +
    '.wr-rail-title{font-size:12px;color:var(--text3);margin-bottom:8px;width:100%;display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n' +
    '.wr-step{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:20px;border:1px solid var(--border);background:var(--bg-card2);color:var(--text2);font-size:13px;cursor:pointer;min-height:40px;transition:all .2s;font-family:inherit}\n' +
    '.wr-step:hover{border-color:var(--cyan)}\n' +
    '.wr-step[data-state="completed"]{color:var(--success);border-color:rgba(0,230,118,.45);background:rgba(0,230,118,.08)}\n' +
    '.wr-step[data-state="active"]{color:var(--cyan);border-color:var(--cyan);font-weight:600;background:rgba(0,229,255,.1);box-shadow:0 0 12px rgba(0,229,255,.22)}\n' +
    '.wr-step[data-state="stale"]{color:var(--warn);border-color:rgba(255,193,7,.5)}\n' +
    '.wr-step[data-state="error"]{color:var(--error);border-color:rgba(255,82,82,.5)}\n' +
    '.wr-step[data-state="locked"]{opacity:.45;cursor:not-allowed}\n' +
    '.wr-step[data-state="locked"]:hover{border-color:var(--border);color:var(--text2)}\n' +
    '.wr-arrow{color:var(--text3);font-size:12px}\n' +
    '.wr-room{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:16px}\n' +
    '.wr-zone{margin-bottom:14px}\n' +
    '.wr-zone:last-child{margin-bottom:0}\n' +
    '.wr-ctx{border-left:3px solid var(--purple);padding:10px 14px;background:rgba(123,92,255,.07);border-radius:8px}\n' +
    '.wr-ctx-title{font-size:15px;font-weight:600;color:var(--text)}\n' +
    '.wr-ctx-hint{font-size:13px;color:var(--text2);margin-top:2px}\n' +
    '.wr-input{border-left:3px solid var(--cyan);padding:10px 14px;background:rgba(0,229,255,.04);border-radius:8px}\n' +
    '.wr-action{border-left:3px solid #ff9f2b;padding:10px 14px;background:rgba(255,159,43,.05);border-radius:8px}\n' +
    '.wr-result{border-left:3px solid var(--success);padding:10px 14px;background:rgba(0,230,118,.04);border-radius:8px}\n' +
    '.wr-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;min-height:44px;background:linear-gradient(135deg,var(--cyan),#00b8d4);color:#080c18;transition:all .2s}\n' +
    '.wr-primary:hover{opacity:.9;transform:translateY(-1px)}\n' +
    '.wr-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}\n' +
    '.wr-ghost{background:none;color:var(--text2);border:1px solid var(--border);padding:8px 14px;font-size:12.5px;min-height:36px;border-radius:8px;cursor:pointer;font-family:inherit;transition:all .2s}\n' +
    '.wr-ghost:hover{color:var(--cyan);border-color:var(--cyan)}\n' +
    '.wr-badge-stale{display:block;background:rgba(255,193,7,.12);border:1px solid rgba(255,193,7,.4);color:var(--warn);font-size:12.5px;padding:8px 14px;border-radius:8px;margin-bottom:10px}\n' +
    '.wr-note{font-size:12px;color:var(--text3);margin-top:6px;font-style:italic}\n' +
    '.wr-chip{display:inline-block;padding:6px 12px;border:1px solid var(--border);border-radius:20px;font-size:12.5px;color:var(--text2);margin:0 6px 6px 0;background:var(--bg-input)}\n' +
    '.wr-chip small{color:var(--text3)}\n' +
    '.drawer{position:fixed;top:0;right:-320px;width:300px;max-width:88vw;height:100%;background:var(--bg-card);border-left:1px solid var(--border);z-index:200;transition:right .3s;padding:20px;overflow-y:auto;box-sizing:border-box}\n' +
    '.drawer.open{right:0}\n' +
    '.drawer-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:199}\n' +
    '.drawer-backdrop.show{display:block}\n' +
    '.drawer h4{color:var(--cyan);font-size:14px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}\n' +
    '@media(max-width:768px){.wr-room{padding:14px}.drawer{width:88vw}.wr-step{padding:8px 10px;font-size:12px}}\n' +
    '</style>';
}

// ---- Zone ၄ ပိုင်း Builder များ ----
export function wrCtx(title, hint) {
  return '<div class="wr-ctx"><div class="wr-ctx-title">' + title + '</div>' +
    (hint ? '<div class="wr-ctx-hint">' + hint + '</div>' : '') + '</div>';
}

export function wrInputZone(inner) {
  return '<div class="wr-input">' + inner + '</div>';
}

export function wrActionZone(inner) {
  return '<div class="wr-action">' + inner + '</div>';
}

export function wrResultZone(inner) {
  return '<div class="wr-result">' + inner + '</div>';
}

export function wrPrimaryBtn(id, label, disabled) {
  return '<button class="wr-primary" id="' + id + '"' + (disabled ? ' disabled' : '') + '>' + label + '</button>';
}

export function wrGhostBtn(onclick, label) {
  return '<button class="wr-ghost" onclick="' + onclick + '">' + label + '</button>';
}

export function wrLoading(id, label) {
  return '<div class="loading" id="' + id + '"><div class="spinner"></div> ' + label + '</div>';
}

export function wrError(id) {
  return '<div class="error-box" id="' + id + '"></div>';
}

export function wrStaleBadge(id, label) {
  return '<div class="wr-badge-stale" id="' + id + '" style="display:none;">&#8635; ' + label + '</div>';
}

// ---- Step Rail (အပေါ်ဆုံး Progress + Navigation) ----
// Static HTML — State Badge ကို Client က data-state ဖြင့် ပြောင်းသည်
export function stepRailHtml(steps, studioName) {
  let chips = '';
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (i > 0) chips += '<span class="wr-arrow">&#10132;</span>';
    chips += '<button class="wr-step" data-step="' + s.id + '" data-state="locked" onclick="switchStep(\'' + s.id + '\')">' +
      '<span class="st" data-st="' + s.id + '">&#9711;</span> ' + s.n + '. ' + s.title + '</button>';
  }
  return '<div class="wr-rail">' +
    '<div class="wr-rail-title"><b>' + studioName + '</b><span id="stepCounter" style="color:var(--text3);font-size:11.5px;">—</span>' +
    '<span style="margin-left:auto;"><button class="wr-ghost" onclick="toggleDrawer()">&#9881; Settings</button></span></div>' +
    '<div class="wr-steps">' + chips + '</div>' +
    '</div>';
}
