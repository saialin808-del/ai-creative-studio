// AI Creative Studio — Cloudflare Worker API (STEP 4 Phase 2)
import { signToken, verifyToken, getKey, makeState, parseState, exchangeCode, fetchUserInfo } from './auth';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
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
      try {
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
      } catch (e) {
        return json({ error: 'auth_failed', detail: String(e.message || e) }, 500, cors);
      }
    }

    if (path === '/auth/result') {
      return new Response(resultPage(), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    if (path === '/api/users/me') {
      const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
      if (!token) return json({ error: 'unauthorized' }, 401, cors);
      const key = await getKey(env.SESSION_SIGNING_KEY);
      const payload = await verifyToken(token, key);
      if (!payload) return json({ error: 'invalid_token' }, 401, cors);
      return json({ email: payload.email, name: payload.name, plan: payload.plan }, 200, cors);
    }

    return json({ error: 'not_found', path }, 404, cors);
  }
};

async function resolvePlan(env, email) {
  try {
    const { results } = await env.DB.prepare('SELECT plan, expiry FROM users WHERE email = ?').bind(email).all();
    if (!results || results.length === 0) return 'FREE';
    const u = results[0];
    if (u.plan === 'PRO' && u.expiry && new Date(u.expiry).getTime() < Date.now()) return 'FREE';
    return (u.plan || 'FREE').toUpperCase();
  } catch (e) { return 'FREE'; }
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

function resultPage() {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Login OK</title></head>' +
    '<body style="font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 16px;background:#F4F3EE;color:#1A1B1C">' +
    '<h2 style="color:#0b6b46">✅ Login OK</h2>' +
    '<p id="status" style="font-size:14px">Loading...</p>' +
    '<textarea id="tok" rows="6" style="width:100%;font-family:monospace;font-size:12px;box-sizing:border-box"></textarea>' +
    '<br><button onclick="copyT()" style="margin-top:8px;padding:10px 18px;font-size:14px">Copy token</button>' +
    '<p style="font-size:12px;color:#666">Use: Authorization: Bearer &lt;token&gt;</p>' +
    '<script>var m=location.hash.match(/token=([^&]+)/);var t=m?decodeURIComponent(m[1]):"";' +
    'if(t){document.getElementById("tok").value=t;document.getElementById("status").textContent="Token ready below.";}' +
    'else{document.getElementById("status").textContent="No token found.";}' +
    'function copyT(){var x=document.getElementById("tok");x.select();try{document.execCommand("copy");}catch(e){}}<\/script>' +
    '</body></html>';
}
