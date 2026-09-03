// AI Creative Studio — Cloudflare Worker API (STEP 4 Phase 3b — robust)
import { signToken, verifyToken, getKey, makeState, parseState, exchangeCode, fetchUserInfo } from './auth';
import { callGeminiText } from './ai';
import { getCMSData, buildSystemPrompt } from './cms';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

function htmlPage(body) {
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function bearer(request) {
  return (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
}

async function verifyTokenSafe(env, token) {
  try {
    const key = await getKey(env.SESSION_SIGNING_KEY);
    return await verifyToken(token, key);
  } catch (e) { return null; }
}

async function resolvePlan(env, email) {
  try {
    const { results } = await env.DB.prepare('SELECT plan, expiry FROM users WHERE email = ?').bind(email).all();
    if (!results || results.length === 0) return 'FREE';
    const u = results[0];
    if (u.plan === 'PRO' && u.expiry && new Date(u.expiry).getTime() < Date.now()) return 'FREE';
    return (u.plan || 'FREE').toUpperCase();
  } catch (e) { return 'FREE'; }
}

async function route(request, env, ctx) {
  const url = new URL(request.url);
  const cors = corsHeaders();
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const path = url.pathname;

  if (path === '/api/health') {
    return json({ status: 'ok', service: 'aics-api', env: env.ENVIRONMENT || 'dev' }, 200, cors);
  }

  if (path === '/api/auth/login') {
    if (!env.GOOGLE_OAUTH_CLIENT_ID) return json({ error: 'not_configured' }, 500, cors);
    const redirect = url.searchParams.get('redirect') || '';
    const redirectUri = url.origin + '/api/auth/callback';
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
      client_id: env.GOOGLE_OAUTH_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: makeState(redirect),
      prompt: 'select_account',
    });
    return Response.redirect(authUrl, 302);
  }

  if (path === '/api/auth/callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state') || '';
    const redirect = parseState(state);
    if (!code) return json({ error: 'missing_code' }, 400, cors);
    const redirectUri = url.origin + '/api/auth/callback';
    const tokens = await exchangeCode(code, env.GOOGLE_OAUTH_CLIENT_ID, env.GOOGLE_OAUTH_CLIENT_SECRET, redirectUri);
    const info = await fetchUserInfo(tokens.access_token);
    if (!info || !info.email) throw new Error('no_email');
    const plan = await resolvePlan(env, info.email);
    const key = await getKey(env.SESSION_SIGNING_KEY);
    const token = await signToken({
      email: info.email, name: info.name || '', picture: info.picture || '',
      plan, exp: Date.now() + 7 * 86400000,
    }, key);
    const target = redirect || '/auth/result';
    const abs = /^https?:\/\//.test(target) ? target : url.origin + target;
    return Response.redirect(abs + '#token=' + encodeURIComponent(token), 302);
  }

  if (path === '/auth/result') return htmlPage(resultPage());

  if (path === '/api/users/me') {
    const token = bearer(request);
    if (!token) return json({ error: 'unauthorized' }, 401, cors);
    const payload = await verifyTokenSafe(env, token);
    if (!payload) return json({ error: 'invalid_token' }, 401, cors);
    return json({ email: payload.email, name: payload.name, plan: payload.plan }, 200, cors);
  }

  if (path === '/api/ai/test' && request.method === 'POST') {
    const token = bearer(request);
    if (!token) return json({ error: 'unauthorized' }, 401, cors);
    const payload = await verifyTokenSafe(env, token);
    if (!payload) return json({ error: 'invalid_token' }, 401, cors);
    const body = await request.json().catch(() => null);
    if (!body || !body.prompt) return json({ error: 'missing_prompt' }, 400, cors);
    try {
      const out = await callGeminiText(env, {
        model: body.model || 'gemini-3.6-flash',
        system: body.system || '',
        prompt: body.prompt,
        apiKey: body.apiKey,
      });
      return json({ output: out }, 200, cors);
    } catch (e) {
      return json({ error: 'ai_error', detail: String((e && e.message) || e) }, 500, cors);
    }
  }

  if (path === '/api/cms/prompt') {
    const token = bearer(request);
    if (!token) return json({ error: 'unauthorized' }, 401, cors);
    const payload = await verifyTokenSafe(env, token);
    if (!payload) return json({ error: 'invalid_token' }, 401, cors);
    const studio = (url.searchParams.get('studio') || '').toUpperCase();
    const type = url.searchParams.get('type') || '1';
    const plan = payload.plan;
    const c = await getCMSData(env, studio, plan, type);
    if (!c) return json({ found: false, studio, plan, type }, 200, cors);
    return json({ found: true, studio, plan, type, systemPrompt: buildSystemPrompt(c) }, 200, cors);
  }

  if (path === '/ai-test') return htmlPage(aiTestPage());
  if (path === '/cms-test') return htmlPage(cmsTestPage());

  return json({ error: 'not_found', path }, 404, cors);
}

function resultPage() {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Login OK</title></head>' +
    '<body style="font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 16px;background:#F4F3EE;color:#1A1B1C">' +
    '<h2 style="color:#0b6b46">✅ Login OK</h2>' +
    '<p id="status" style="font-size:14px">Loading...</p>' +
    '<div id="me" style="font-size:14px;margin:8px 0;padding:10px;background:#fff;border-radius:8px;border:1px solid #E4E3DD"></div>' +
    '<textarea id="tok" rows="5" style="width:100%;font-family:monospace;font-size:12px;box-sizing:border-box"></textarea>' +
    '<br><button onclick="copyT()" style="margin-top:8px;padding:10px 18px;font-size:14px">Copy token</button>' +
    '<p style="font-size:12px;color:#666">Use: Authorization: Bearer &lt;token&gt;</p>' +
    '<script>var m=location.hash.match(/token=([^&]+)/);var t=m?decodeURIComponent(m[1]):"";' +
    'if(t){document.getElementById("tok").value=t;document.getElementById("status").textContent="Token ready. Checking /api/users/me ...";' +
    'fetch("/api/users/me",{headers:{Authorization:"Bearer "+t}}).then(function(r){return r.json();}).then(function(d){' +
    'document.getElementById("me").textContent="Email: "+(d.email||"?")+"   Plan: "+(d.plan||"?")+(d.error?"   (error: "+d.error+")":"");' +
    '}).catch(function(e){document.getElementById("me").textContent="check failed";});' +
    '}else{document.getElementById("status").textContent="No token found.";}' +
    'function copyT(){var x=document.getElementById("tok");x.select();try{document.execCommand("copy");}catch(e){}}<\/script>' +
    '</body></html>';
}

function aiTestPage() {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI Test</title></head>' +
    '<body style="font-family:sans-serif;max-width:640px;margin:24px auto;padding:0 16px;background:#F4F3EE;color:#1A1B1C">' +
    '<h2 style="color:#1b6d96">🤖 AI Router Test</h2>' +
    '<label style="font-size:13px;font-weight:600">Session Token (Login OK page ကနေ Copy)</label><br>' +
    '<textarea id="tok" rows="3" style="width:100%;font-family:monospace;font-size:12px;box-sizing:border-box"></textarea>' +
    '<label style="font-size:13px;font-weight:600">Your Gemini API Key (BYOK)</label><br>' +
    '<input id="key" type="password" style="width:100%;font-size:13px;box-sizing:border-box;padding:8px">' +
    '<label style="font-size:13px;font-weight:600">System (optional)</label><br>' +
    '<textarea id="sys" rows="2" style="width:100%;font-size:13px;box-sizing:border-box"></textarea>' +
    '<label style="font-size:13px;font-weight:600">Prompt</label><br>' +
    '<textarea id="pr" rows="3" style="width:100%;font-size:13px;box-sizing:border-box">Say hello in one short sentence.</textarea>' +
    '<br><button id="btn" onclick="run()" style="margin-top:8px;padding:10px 22px;font-size:14px">▶ Run Gemini</button>' +
    '<div id="out" style="margin-top:10px;padding:12px;background:#fff;border-radius:8px;border:1px solid #E4E3DD;font-size:13px;white-space:pre-wrap;min-height:60px">Result will show here.</div>' +
    '<script>' +
    'function run(){var o=document.getElementById("out");o.textContent="Loading...";' +
    'fetch("/api/ai/test",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+document.getElementById("tok").value},' +
    'body:JSON.stringify({apiKey:document.getElementById("key").value,system:document.getElementById("sys").value,prompt:document.getElementById("pr").value})})' +
    '.then(function(r){return r.json();}).then(function(d){o.textContent=d.output||("ERROR: "+(d.error||"")+" "+(d.detail||""));})' +
    '.catch(function(e){o.textContent="Network error: "+e;});}' +
    '<\/script></body></html>';
}

function cmsTestPage() {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CMS Test</title></head>' +
    '<body style="font-family:sans-serif;max-width:640px;margin:24px auto;padding:0 16px;background:#F4F3EE;color:#1A1B1C">' +
    '<h2 style="color:#1b6d96">📋 CMS Engine Test</h2>' +
    '<label style="font-size:13px;font-weight:600">Session Token</label><br>' +
    '<textarea id="tok" rows="3" style="width:100%;font-family:monospace;font-size:12px;box-sizing:border-box"></textarea>' +
    '<label style="font-size:13px;font-weight:600">Studio (STORY / CONTENT / SHORT / IMAGE / VOICE / SHOPCONTENT ...)</label><br>' +
    '<input id="st" value="STORY" style="width:100%;font-size:13px;box-sizing:border-box;padding:8px">' +
    '<label style="font-size:13px;font-weight:600">Type (1-5)</label><br>' +
    '<input id="ty" value="1" style="width:100%;font-size:13px;box-sizing:border-box;padding:8px">' +
    '<br><button onclick="run()" style="margin-top:8px;padding:10px 22px;font-size:14px">🔍 Get Prompt</button>' +
    '<div id="out" style="margin-top:10px;padding:12px;background:#fff;border-radius:8px;border:1px solid #E4E3DD;font-size:13px;white-space:pre-wrap;min-height:60px">Result will show here.</div>' +
    '<script>' +
    'function run(){var o=document.getElementById("out");o.textContent="Loading...";' +
    'var url="/api/cms/prompt?studio="+encodeURIComponent(document.getElementById("st").value)+"&type="+encodeURIComponent(document.getElementById("ty").value);' +
    'fetch(url,{headers:{"Authorization":"Bearer "+document.getElementById("tok").value}})' +
    '.then(function(r){return r.text().then(function(t){return {status:r.status,text:t};});})' +
    '.then(function(res){var d;try{d=JSON.parse(res.text);}catch(e){o.textContent="HTTP "+res.status+" | NOT JSON | raw: "+res.text.slice(0,500);return;}' +
    'if(d.error){o.textContent="ERROR: "+d.error+(d.detail?(" | "+d.detail):"");return;}' +
    'o.textContent=d.found?("FOUND ✅ "+d.studio+"/"+d.plan+"/"+d.type+"\\n\\n"+d.systemPrompt):("NOT FOUND "+d.studio+"/"+d.plan+"/"+d.type+" (database ထဲ ဒေတာမရှိသေးဘူး)");})' +
    '.catch(function(e){o.textContent="Network error: "+e;});}' +
    '<\/script></body></html>';
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await route(request, env, ctx);
    } catch (e) {
      return json({ error: 'internal', detail: String((e && e.message) || e) }, 500, corsHeaders());
    }
  }
};
