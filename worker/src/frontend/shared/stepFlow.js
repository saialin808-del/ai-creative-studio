// ============================================================
// AI CREATIVE STUDIO — STEP FLOW ENGINE (shared)
// ------------------------------------------------------------
// Studio အားလုံးအတွက် တစ်ခုတည်းသော Step State Engine
// - Studio logic (Story/Image/Voice ...) လုံးဝမပါ — ဤ File ကို ပြင်လျှင် အားလုံး သက်ရောက်သည်
// - State ကို Browser localStorage တွင်သာ သိမ်းသည် — Server/D1 မထိ
// - Server (SSR) နှင့် Client (Browser) နှစ်ဖက်လုံးတွင် အလုပ်လုပ်နိုင်သည်
//   Client Script ကို stepFlowScript() ဖြင့် Page ထဲ ထည့်သည်
// ============================================================

// ---- State ၆ မျိုး ----
// locked    : မဝင်နိုင် (အရှေ့ step မပြီးသေး / stale ဖြစ်နေ)
// available : ဝင်လို့ရ (ရှေ့ step အားလုံး ပြီးစီး)
// active    : လက်ရှိ လုပ်နေသော step (တစ်ခုတည်းသာ)
// completed : ပြီးစီး
// error     : API မအောင်မြင် (input မဖျက်၊ retry ရ)
// stale     : အပေါ်က step ပြောင်းလို့ ရလဒ် နောက်ကျနေ (badge: ↻ Update)

// ---- Lock Rule: Step ၏ လက်ရှိ State ကို တွက်သည် ----
// Unsaved Step သည် ၎င်းရှေ့ Step အားလုံး 'completed' ဖြစ်မှသာ 'available'
// မဟုတ်ပါက 'locked' — အရှေ့မှာ stale/error/available/active ရှိနေလျှင် မဝင်ရ
export function resolveStates(steps, savedStates) {
  const st = savedStates || {};
  const out = {};
  for (let i = 0; i < steps.length; i++) {
    const id = steps[i].id;
    if (st[id] === 'completed' || st[id] === 'stale' || st[id] === 'error' || st[id] === 'active') {
      out[id] = st[id];
      continue;
    }
    let allPrevDone = true;
    for (let j = 0; j < i; j++) {
      if (out[steps[j].id] !== 'completed') { allPrevDone = false; break; }
    }
    out[id] = allPrevDone ? 'available' : 'locked';
  }
  return out;
}

// ---- Step Flow Instance (Client ဘက်တွင် သုံးသည်) ----
export function createStepFlow(steps, saved, storageKey) {
  const state = {
    states: (saved && saved.states) || {},
    data: (saved && saved.data) || {},
  };
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (e) {}
  }
  function resolve() { return resolveStates(steps, state.states); }
  function currentId() {
    const r = resolve();
    for (let i = 0; i < steps.length; i++) {
      if (r[steps[i].id] === 'active') return steps[i].id;
    }
    for (let i = 0; i < steps.length; i++) {
      if (r[steps[i].id] === 'available') return steps[i].id;
    }
    return steps[0].id;
  }
  const api = {
    state,
    save,
    resolve,
    currentId,
    isLocked(id) { return resolve()[id] === 'locked'; },
    canEnter(id) {
      const s = resolve()[id];
      return s === 'available' || s === 'active' || s === 'completed' || s === 'stale' || s === 'error';
    },
    setData(id, patch) { state.data[id] = Object.assign({}, state.data[id] || {}, patch); save(); },
    getData(id) { return state.data[id] || {}; },
    fail(id) { state.states[id] = 'error'; save(); },
    activate(id) {
      if (!api.canEnter(id)) return false;
      for (let i = 0; i < steps.length; i++) {
        if (state.states[steps[i].id] === 'active') delete state.states[steps[i].id];
      }
      state.states[id] = 'active';
      save();
      return true;
    },
    // complete(id) = ပြီးစီး + အောက်က completed step အားလုံး → stale
    // (အပေါ်က ရလဒ် ပြောင်းလဲသွားသောကြောင့် အောက်က ရလဒ်တွေ နောက်ကျသည်)
    complete(id) {
      state.states[id] = 'completed';
      api.invalidate(id);
    },
    // အပေါ်က step ၏ Input ပြောင်းလိုက်သော် — အောက်က completed step အားလုံး → stale
    invalidate(fromId) {
      let hit = false;
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        if (s.id === fromId) { hit = true; continue; }
        if (!hit) continue;
        if (state.states[s.id] === 'completed') state.states[s.id] = 'stale';
      }
      save();
    },
  };
  return api;
}

// ---- Client Script (Browser ထဲ ထည့်ရန်) ----
// Function Source ကို ထည့်သွင်းသည် — Build Tooling မလို
// createStepFlow ၏ Source ထဲတွင် resolveStates ကို Free Variable အဖြစ် ခေါ်သည် —
// ထို့ကြောင့် Client Scope တွင် နာမည် အတိအကျ တူသော Function ရှိရမည်
export function stepFlowScript() {
  return '<script>\n' +
    '(function () {\n' +
    resolveStates.toString() + '\n' +
    createStepFlow.toString() + '\n' +
    '  window.__aicsResolveStates = resolveStates;\n' +
    '  window.__aicsCreateStepFlow = createStepFlow;\n' +
    '})();\n' +
    '</script>';
}
