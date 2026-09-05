// AI Creative Studio — Cloudflare Worker (Phase 3e+ — hardened errors + Phase 2 core modular)
import { signToken, verifyToken } from './core/auth';
import { callGeminiText } from './core/ai';
import { getCMSData, buildSystemPrompt } from './core/cms';
import { generateStudio } from './studio';
import { saveCreation, listCreations } from './core/creations';
import { getUserApiKey, saveUserApiKey } from './core/utilities';
import { APP_HTML } from './frontend';
import { ADMIN_HTML, adminApi } from './admin';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status, c) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: { 'Content-Type': 'application/json', ...c } });
}

function htmlPage(html) {
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function bearer(req) {
  const h = req.headers.get('Authorization') || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
}

async function verifyTokenSafe(env, token) {
  try { return await verifyToken(env, token); } catch (e) { return null; }
}

async function resolvePlan(env, payload) {
  if (!payload || !payload.sub || !env.DB) return 'FREE';
  try {
    const row = await env.DB.prepare('SELECT plan, expiry FROM users WHERE id = ?').bind(payload.sub).first();
    if (!row) return 'FREE';
    if (row.plan === 'PRO' && row.expiry && new Date(row.expiry) < new Date()) return 'FREE';
    return row.plan || 'FREE';
  } catch (e) { return 'FREE'; }
}

function homePage() {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI Creative Studio</title></head>' +
    '<body style="font-family:sans-serif;max-width:640px;margin:24px auto;padding:0 16px;background:#F4F3EE;color:#1A1B1C">' +
    '<h1 style="color:#1b6d96">🎨 AI Creative Studio</h1>' +
    '<p>API is running.</p>' +
    '<ul><li><a href="/auth/result">Login (Google)</a></li><li><a href="/ai-test">AI Router Test</a></li><li><a href="/cms-test">CMS Test</a></li><li><a href="/studio-test">Studio Test</a></li><li><a href="/creations-test">Creations Test</a></li></ul>' +
    '</body></html>';
}

function loginResultPage() {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Login OK</title></head>' +
    '<body style="font-family:sans-serif;max-width:640px;margin:24px auto;padding:0 16px;background:#F4F3EE;color:#1A1B1C">' +
    '<h2 style="color:#52C41A">✅ Login OK</h2>' +
    '<p>Copy your token below.</p>' +
    '<textarea id="tok" rows="4" style="width:100%;font-family:monospace;font-size:12px;box-sizing:border-box"></textarea>' +
    '<br><button onclick="cp()" style="margin-top:8px;padding:10px 22px;font-size:14px">📋 Copy Token</button>' +
    '<div id="status" style="margin-top:8px;font-size:13px"></div>' +
    '<script>' +
    'var h=location.hash.replace("#token=","");' +
    'document.getElementById("tok").value=decodeURIComponent(h);' +
    'function cp(){var t=document.getElementById("tok");t.select();document.execCommand("copy");document.getElementById("status").textContent="Copied ✅";}' +
    '<\/script></body></html>';
}

function aiTestPage() {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI Test</title></head>' +
    '<body style="font-family:sans-serif;max-width:640px;margin:24px auto;padding:0 16px;background:#F4F3EE;color:#1A1B1C">' +
    '<h2 style="color:#1b6d96">🤖 AI Router Test</h2>' +
    '<label style="font-size:13px;font-weight:600">Prompt</label><br>' +
    '<textarea id="p" rows="3" style="width:100%;font-size:13px;box-sizing:border-box">Hello</textarea>' +
    '<label style="font-size:13px;font-weight:600">Gemini API Key (BYOK — optional)</label><br>' +
    '<input id="key" type="password" style="width:100%;font-size:13px;box-sizing:border-box;padding:8px">' +
    '<br><button onclick="run()" style="margin-top:8px;padding:10px 22px;font-size:14px">▶ Run</button>' +
    '<div id="out" style="margin-top:10px;padding:12px;background:#fff;border-radius:8px;border:1px solid #E4E3DD;font-size:13px;white-space:pre-wrap;min-height:60px">Result will show here.</div>' +
    '<script>' +
    'function run(){var o=document.getElementById("out");o.textContent="Loading...";' +
    'fetch("/api/ai/test",{method:"POST",headers:{"Content-Type":"application/json"},' +
    'body:JSON.stringify({prompt:document.getElementById("p").value,apiKey:document.getElementById("key").value})})' +
    '.then(function(r){return r.json();}).then(function(d){o.textContent=d.output?("✅ "+d.output):("ERROR: "+(d.error||"")+" "+(d.detail||""));})' +
    '.catch(function(e){o.textContent="Network error: "+e;});}' +
    '<\/script></body></html>';
}

function cmsTestPage() {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CMS Test</title></head>' +
    '<body style="font-family:sans-serif;max-width:640px;margin:24px auto;padding:0 16px;background:#F4F3EE;color:#1A1B1C">' +
    '<h2 style="color:#1b6d96">📋 CMS Test</h2>' +
    '<label style="font-size:13px;font-weight:600">Session Token</label><br>' +
    '<textarea id="tok" rows="3" style="width:100%;font-family:monospace;font-size:12px;box-sizing:border-box"></textarea>' +
    '<label style="font-size:13px;font-weight:600">Studio</label><br>' +
    '<input id="st" value="STORY" style="width:100%;font-size:13px;box-sizing:border-box;padding:8px">' +
    '<label style="font-size:13px;font-weight:600">Type (1-5)</label><br>' +
    '<input id="ty" value="1" style="width:100%;font-size:13px;box-sizing:border-box;padding:8px">' +
    '<br><button onclick="run()" style="margin-top:8px;padding:10px 22px;font-size:14px">📥 Get Prompt</button>' +
    '<div id="out" style="margin-top:10px;padding:12px;background:#fff;border-radius:8px;border:1px solid #E4E3DD;font-size:13px;white-space:pre-wrap;min-height:60px">Result will show here.</div>' +
    '<script>' +
    'function run(){var o=document.getElementById("out");o.textContent="Loading...";' +
    'fetch("/api/cms/prompt",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+document.getElementById("tok").value},' +
    'body:JSON.stringify({studio:document.getElementById("st").value,type:document.getElementById("ty").value})})' +
    '.then(function(r){return r.json();}).then(function(d){' +
    'if(d.found){o.textContent="FOUND ✅ "+d.studio+"/"+d.plan+"/"+d.type+"\\n\\n"+d.system_prompt;}' +
    'else{o.textContent="NOT FOUND — "+document.getElementById("st").value+"/"+document.getElementById("ty").value;}})' +
    '.catch(function(e){o.textContent="Network error: "+e;});}' +
    '<\/script></body></html>';
}

function studioTestPage() {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Studio Test</title></head>' +
    '<body style="font-family:sans-serif;max-width:640px;margin:24px auto;padding:0 16px;background:#F4F3EE;color:#1A1B1C">' +
    '<h2 style="color:#1b6d96">🎨 Studio Engine Test</h2>' +
    '<label style="font-size:13px;font-weight:600">Session Token</label><br>' +
    '<textarea id="tok" rows="3" style="width:100%;font-family:monospace;font-size:12px;box-sizing:border-box"></textarea>' +
    '<label style="font-size:13px;font-weight:600">Studio (STORY / IMAGE / CONTENT ...)</label><br>' +
    '<input id="st" value="STORY" style="width:100%;font-size:13px;box-sizing:border-box;padding:8px">' +
    '<label style="font-size:13px;font-weight:600">Type (1-5)</label><br>' +
    '<input id="ty" value="1" style="width:100%;font-size:13px;box-sizing:border-box;padding:8px">' +
    '<label style="font-size:13px;font-weight:600">User Idea</label><br>' +
    '<textarea id="id" rows="3" style="width:100%;font-size:13px;box-sizing:border-box">Write a short story about a boy and his dog.</textarea>' +
    '<label style="font-size:13px;font-weight:600">Gemini API Key (BYOK — optional)</label><br>' +
    '<input id="key" type="password" style="width:100%;font-size:13px;box-sizing:border-box;padding:8px">' +
    '<br><button onclick="run()" style="margin-top:8px;padding:10px 22px;font-size:14px">▶ Run Studio</button>' +
    '<div id="out" style="margin-top:10px;padding:12px;background:#fff;border-radius:8px;border:1px solid #E4E3DD;font-size:13px;white-space:pre-wrap;min-height:80px">Result will show here.</div>' +
    '<script>' +
    'function run(){var o=document.getElementById("out");o.textContent="Loading...";' +
    'fetch("/api/studio/generate",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+document.getElementById("tok").value},' +
    'body:JSON.stringify({studio:document.getElementById("st").value,type:document.getElementById("ty").value,idea:document.getElementById("id").value,apiKey:document.getElementById("key").value})})' +
    '.then(function(r){return r.json();}).then(function(d){' +
    'if(d.data){o.innerHTML="";var im=document.createElement("img");im.src="data:"+d.mimeType+";base64,"+d.data;im.style.maxWidth="100%";im.style.borderRadius="8px";o.appendChild(im);return;}' +
    'o.textContent=d.output?("["+d.studio+"/"+d.plan+"/"+d.type+"]\\n\\n"+d.output):("ERROR: "+(d.error||"")+" "+(d.detail||""));})' +
    '.catch(function(e){o.textContent="Network error: "+e;});}' +
    '<\/script></body></html>';
}

function creationsTestPage() {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Creations Test</title></head>' +
    '<body style="font-family:sans-serif;max-width:640px;margin:24px auto;padding:0 16px;background:#F4F3EE;color:#1A1B1C">' +
    '<h2 style="color:#1b6d96">💾 Creations Test</h2>' +
    '<label style="font-size:13px;font-weight:600">Session Token</label><br>' +
    '<textarea id="tok" rows="3" style="width:100%;font-family:monospace;font-size:12px;box-sizing:border-box"></textarea>' +
    '<br><button onclick="load()" style="margin-top:8px;padding:10px 22px;font-size:14px">📋 Load My Creations</button>' +
    '<div id="out" style="margin-top:10px;padding:12px;background:#fff;border-radius:8px;border:1px solid #E4E3DD;font-size:13px;white-space:pre-wrap;min-height:80px">Result will show here.</div>' +
    '<script>' +
    'function load(){var o=document.getElementById("out");o.textContent="Loading...";' +
    'fetch("/api/creations",{headers:{"Authorization":"Bearer "+document.getElementById("tok").value}})' +
    '.then(function(r){return r.json();}).then(function(d){' +
    'if(d.error){o.textContent="ERROR: "+d.error+" "+(d.detail||"");return;}' +
    'if(!d.items||d.items.length===0){o.textContent="(no creations yet)";return;}' +
    'var s="TOTAL: "+d.items.length+"\\n\\n";d.items.forEach(function(it,i){s+=(i+1)+". ["+it.studio+"/"+it.type+"] "+it.title+" — "+it.created_at+"\\n";});' +
    'o.textContent=s;})' +
    '.catch(function(e){o.textContent="Network error: "+e;});}' +
    '<\/script></body></html>';
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      if (request.method === 'OPTIONS') return new Response('ok', { status: 204, headers: cors });

      if (path === '/' && request.method === 'GET') return htmlPage(homePage());

      if (path === '/api/auth/login' && request.method === 'GET') {
        const origin = url.origin;
        let next = url.searchParams.get('next') || (origin + '/auth/result');
        const okNext = next.indexOf(origin) === 0 || /^https:\/\/aics-frontend-/.test(next) || /^http:\/\/localhost/.test(next);
        if (!okNext) next = origin + '/auth/result';
        const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=' + env.GOOGLE_OAUTH_CLIENT_ID +
          '&redirect_uri=' + encodeURIComponent(origin + '/api/auth/callback') +
          '&response_type=code&scope=openid%20email%20profile' +
          '&state=' + encodeURIComponent(next) + '&access_type=online';
        return Response.redirect(authUrl, 302);
      }

      if (path === '/api/auth/callback' && request.method === 'GET') {
        try {
          const code = url.searchParams.get('code');
          if (!code) return json({ error: 'no_code' }, 400, cors);
          const origin = url.origin;
          const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'code=' + encodeURIComponent(code) +
              '&client_id=' + encodeURIComponent(env.GOOGLE_OAUTH_CLIENT_ID) +
              '&client_secret=' + encodeURIComponent(env.GOOGLE_OAUTH_CLIENT_SECRET) +
              '&redirect_uri=' + encodeURIComponent(origin + '/api/auth/callback') +
              '&grant_type=authorization_code',
          });
          const tokenData = await res.json().catch(() => ({}));
          if (!tokenData.access_token) {
            return json({ error: 'auth_failed', detail: JSON.stringify(tokenData).slice(0, 300) }, 400, cors);
          }
          const ures = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: 'Bearer ' + tokenData.access_token },
          });
          const user = await ures.json().catch(() => ({}));
          if (!user.id || !user.email) return json({ error: 'userinfo_failed', detail: JSON.stringify(user).slice(0, 300) }, 400, cors);

          const existing = env.DB ? await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(user.email).first() : null;
          let userId;
          if (existing) {
            userId = existing.id;
            await env.DB.prepare('UPDATE users SET updated_at = datetime(\'now\') WHERE id = ?').bind(userId).run();
          } else {
            const ins = await env.DB.prepare('INSERT INTO users (email, plan, created_at, updated_at) VALUES (?, \'FREE\', datetime(\'now\'), datetime(\'now\'))').bind(user.email).run();
            userId = ins.meta.last_row_id;
          }

          const token = await signToken(env, { sub: String(userId), email: user.email, plan: 'FREE' });
          const state = url.searchParams.get('state') || (origin + '/auth/result');
          return Response.redirect(state + '#token=' + encodeURIComponent(token), 302);
        } catch (e) {
          return json({ error: 'auth_error', detail: String((e && e.message) || e) }, 500, cors);
        }
      }

      if (path === '/auth/result' && request.method === 'GET') return htmlPage(loginResultPage());
      if (path === '/app' || path === '/app/') return htmlPage(APP_HTML);
      if (path === '/admin' || path === '/admin/') return htmlPage(ADMIN_HTML);
      const adminResp = await adminApi(request, path, env, verifyToken);
      if (adminResp) return adminResp;
      if (path === '/ai-test') return htmlPage(aiTestPage());
      if (path === '/cms-test') return htmlPage(cmsTestPage());
      if (path === '/studio-test') return htmlPage(studioTestPage());
      if (path === '/creations-test') return htmlPage(creationsTestPage());

      if (path === '/api/users/me' && request.method === 'GET') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const plan = await resolvePlan(env, payload);
        return json({ email: payload.email, plan, user_id: payload.sub }, 200, cors);
      }

      // ===== BYOK — User ကိုယ်ပိုင် Gemini Key သိမ်းခြင်း / အခြေအနေ စစ်ခြင်း =====
      if (path === '/api/user/apikey' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.key || !String(body.key).trim()) return json({ error: 'missing_key' }, 400, cors);
        try {
          await saveUserApiKey(env, payload.sub, String(body.key).trim());
          return json({ ok: true }, 200, cors);
        } catch (e) {
          return json({ error: 'db_error', detail: String((e && e.message) || e) }, 500, cors);
        }
      }

      if (path === '/api/user/apikey/status' && request.method === 'GET') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const key = await getUserApiKey(env, payload.sub);
        return json({ hasKey: !!key }, 200, cors);
      }

      if (path === '/api/ai/test' && request.method === 'POST') {
        const body = await request.json().catch(() => null);
        if (!body) return json({ error: 'bad_request' }, 400, cors);
        try {
          const out = await callGeminiText(env, {
            model: body.model || 'gemini-3.6-flash',
            prompt: body.prompt || 'Hello',
            apiKey: body.apiKey,
          });
          return json({ output: out }, 200, cors);
        } catch (e) {
          return json({ error: 'ai_error', detail: String((e && e.message) || e) }, 500, cors);
        }
      }

      if (path === '/api/cms/prompt' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body) return json({ error: 'bad_request' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const c = await getCMSData(env, body.studio || 'STORY', plan, body.type || '1');
        if (!c) return json({ found: false }, 200, cors);
        return json({ found: true, studio: c.studio, plan: c.plan, type: c.type, system_prompt: buildSystemPrompt(c) }, 200, cors);
      }

      if (path === '/api/studio/generate' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.studio || !body.idea) return json({ error: 'missing_studio_or_idea' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        if (plan === 'FREE' && reqType !== '1') {
          return json({ error: 'pro_only', detail: 'ဒီ feature က PRO အတွက်ပါ။ Type 1 ကို သုံးပါ၊ သို့မဟုတ် upgrade လုပ်ပါ။' }, 403, cors);
        }
        try {
          // BYOK: Request ထဲ Key မပါလျှင် User သိမ်းထားသော Key ကို အလိုအလျောက် ရှာသည်
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateStudio(env, {
            studio: String(body.studio).toUpperCase(),
            type: String(body.type || '1'),
            idea: body.idea,
            plan,
            apiKey,
            model: body.model,
          });
          try {
            if (out.output) await saveCreation(env, {
              user_id: payload.sub, studio: out.studio, type: out.type,
              original_prompt: String(body.idea), ai_output: out.output,
              title: String(body.idea).slice(0, 60),
            });
          } catch (e) {}
          return json(out, 200, cors);
        } catch (e) {
          return json({ error: 'studio_error', detail: String((e && e.message) || e) }, 500, cors);
        }
      }

      if (path === '/api/creations' && request.method === 'GET') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const items = await listCreations(env, payload.sub);
        return json({ items }, 200, cors);
      }

      return json({ error: 'not_found', path }, 404, cors);
    } catch (e) {
      return json({ error: 'internal', detail: String((e && e.message) || e) }, 500, cors);
    }
  },
};
