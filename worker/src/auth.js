// AI Creative Studio — Auth (fixed crypto key handling)
const enc = new TextEncoder();
let keyCache = null;

async function getKey(secret) {
  if (keyCache) return keyCache;
  keyCache = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret || 'dev-fallback-key'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  return keyCache;
}

function b64url(data) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(data)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function signToken(env, payload) {
  const header = b64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = b64url(enc.encode(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  })));
  const key = await getKey(env.SESSION_SIGNING_KEY);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(header + '.' + body));
  return header + '.' + body + '.' + b64url(sig);
}

async function verifyToken(env, token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('bad_token');
  const key = await getKey(env.SESSION_SIGNING_KEY);
  const ok = await crypto.subtle.verify('HMAC', key, b64urlDecode(parts[2]), enc.encode(parts[0] + '.' + parts[1]));
  if (!ok) throw new Error('bad_signature');
  const data = JSON.parse(new TextDecoder().decode(b64urlDecode(parts[1])));
  if (data.exp && data.exp < Math.floor(Date.now() / 1000)) throw new Error('expired');
  return data;
}

export { signToken, verifyToken };
