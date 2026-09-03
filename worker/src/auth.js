// AI Creative Studio — Google OAuth + session helpers (Phase 2)
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const OAUTH_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const enc = new TextEncoder();

function b64urlEncode(buf) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  return Uint8Array.from(atob(s + pad), c => c.charCodeAt(0));
}
async function getKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function signToken(payload, key) {
  const data = enc.encode(JSON.stringify(payload));
  const sig = await crypto.subtle.sign('HMAC', key, data);
  return b64urlEncode(data) + '.' + b64urlEncode(sig);
}
async function verifyToken(token, key) {
  try {
    const [p, s] = token.split('.');
    if (!p || !s) return null;
    const data = b64urlDecode(p);
    const sig = b64urlDecode(s);
    const ok = await crypto.subtle.verify('HMAC', key, sig, data);
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(data));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch (e) { return null; }
}
function makeState(redirect) {
  const rnd = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const encR = btoa(encodeURIComponent(redirect || '/auth/result'));
  return rnd + '.' + encR;
}
function parseState(state) {
  try {
    const i = state.indexOf('.');
    return decodeURIComponent(atob(state.slice(i + 1)));
  } catch (e) { return '/auth/result'; }
}
async function exchangeCode(code, clientId, clientSecret, redirectUri) {
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: clientId, client_secret: clientSecret,
      redirect_uri: redirectUri, grant_type: 'authorization_code',
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error('token_exchange_failed');
  return data;
}
async function fetchUserInfo(accessToken) {
  const res = await fetch(OAUTH_USERINFO_URL, { headers: { Authorization: 'Bearer ' + accessToken } });
  return res.json();
}

export { signToken, verifyToken, getKey, makeState, parseState, exchangeCode, fetchUserInfo };
