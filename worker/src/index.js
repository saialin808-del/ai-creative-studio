// AI Creative Studio — Cloudflare Worker (Phase 3e+ — hardened errors + Phase 2 core modular)
import { signToken, verifyToken } from './core/auth.js';
import { callGeminiText } from './core/ai.js';
import { getCMSData, buildSystemPrompt } from './core/cms.js';
import { generateStudio } from './studio.js';
import { generateContent, reviseContent, generateContentVoice, generateContentVideo, generateContentVideoImage, generateContentSrt, translateContentSrt } from './studios/content.js';
import { generateStory, reviseStory, generateStoryVideoPlan, generateStoryVideoImage } from './studios/story.js';
import { generateShort, reviseShort, generateShortVideoPlan, generateShortVideoImage } from './studios/short.js';
import { generateImagePrompt, generateAdImagePrompt, generateImageFromPrompt } from './studios/image.js';
import { generateVoiceAudio, transcribeAudio, generateVoiceSrt, translateVoiceSrt } from './studios/voice.js';
import { generateShopContent, reviseShopContent, generateShopVideo, generateShopVideoImage } from './studios/shop.js';
import { saveCreation, listCreations, deleteCreation, toggleFavorite } from './core/creations.js';
import { getUserSettings, updateUserSettings, getUserPreferences, updateUserPreferences } from './core/settings.js';
import { createProject, listProjects, deleteProject } from './core/projects.js';
import { trackUsage } from './core/usage.js';
import { getStudioSettings, isStudioEnabled, setStudioEnabled } from './core/studioSettings.js';
import { checkFeature } from './core/featureSettings.js';
import { getStudio } from './config/studios.js';
import { getUserApiKey, saveUserApiKey } from './core/utilities.js';
import { APP_HTML } from './frontend.js';
import { CONTENT_HTML } from './frontend/content.js';
import { STORY_HTML } from './frontend/story.js';
import { SHORT_HTML } from './frontend/short.js';
import { IMAGE_HTML } from './frontend/image.js';
import { VOICE_HTML } from './frontend/voice.js';
import { SHOP_HTML } from './frontend/shop.js';
import { CREATIONS_HTML } from './frontend/creations.js';
import { SETTINGS_HTML } from './frontend/settings.js';
import { PROJECTS_HTML } from './frontend/projects.js';
import { ADMIN_HTML, adminApi } from './admin.js';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status, c) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: { 'Content-Type': 'application/json', ...c } });
}

// Rule 22 — Error Handling: User ကို Technical Error အပြည့်မပြပါ။
// အသေးစိတ် Error ကို Server Log ထဲတွင် သိမ်းပြီး User ကို ဖော်ရွေသော Message သာ ပြသည်
function friendlyError(e) {
  try { console.error('[AICS]', (e && e.stack) || e); } catch (_) {}
  return 'Something went wrong. Please try again.';
}

function htmlPage(html) {
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function bearer(req) {
  const h = req.headers.get('Authorization') || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
}

// Admin Panel ကို Browser မှ တိုက်ရိုက် နှိပ်ဝင်နိုင်ရန် Cookie Session (Phase 11 — Rule 13)
// HttpOnly Cookie — Frontend JS မှ မဖတ်နိုင်၊ CSRF ကာကွယ်ရန် SameSite=Lax
function cookieToken(req) {
  const c = req.headers.get('Cookie') || '';
  const m = c.match(/(?:^|;\s*)aics_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

function clearSessionCookie() {
  return 'aics_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
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

// Usage Tracking — Track လုပ်ရာတွင် မှားယွင်းမှု ရှိလျှင်ပင် အဓိက API မထိခိုက်စေရန် Safe Wrapper (Phase 3)
async function trackUsageSafe(env, userId, category) {
  try { await trackUsage(env, userId, category); } catch (e) {}
}

// Phase 5 — Feature Check (Rule 15): Free/Pro ကို Admin Config (feature_settings) ဖြင့် ထိန်းချုပ်သည်
// မသင့်လျော်ပါက json 403 Response ကို ပြန်ပေးသည် (မှန်လျှင် null)
async function requireFeature(env, featureId, plan, reqType) {
  const r = await checkFeature(env, featureId, plan, reqType);
  if (r.ok) return null;
  const msg = r.reason === 'pro_type'
    ? 'ဒီ feature က PRO အတွက်ပါ။ Type 1 ကို သုံးပါ၊ သို့မဟုတ် upgrade လုပ်ပါ။'
    : (r.reason === 'disabled' ? 'ဒီ feature ကို ယခု ပိတ်ထားပါသည်။' : 'ဒီ feature က PRO အတွက်ပါ။');
  return json({ error: r.reason === 'disabled' ? 'feature_disabled' : 'pro_only', detail: msg }, 403, cors);
}

// Studio Disabled ဖြစ်ပါက ပြမည့် Friendly စာမျက်နှာ (Phase 4 — Rule 14)
function studioDisabledPage(studioId) {
  const s = getStudio(studioId);
  const name = s ? s.nameMy : studioId;
  return '<!DOCTYPE html><html lang="my"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + name + ' — ပိတ်ထားသည်</title></head>' +
    '<body style="font-family:sans-serif;background:#080c18;color:#e8ecf4;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px">' +
    '<div style="max-width:420px;text-align:center;background:#151b2b;border:1px solid #26324a;border-radius:14px;padding:32px">' +
    '<div style="font-size:40px">🔒</div>' +
    '<h2 style="margin:12px 0;color:#00e5ff">' + name + ' ကို ယခု ပိတ်ထားပါသည်</h2>' +
    '<p style="color:#94a3b8;font-size:14px;line-height:1.7">ဤ Studio ကို Admin မှ ခေတ္တ ပိတ်ထားပါသည်။ နောက်မှ ပြန်ဖွင့်ပါမည်။</p>' +
    '<a href="/app" style="display:inline-block;margin-top:16px;padding:11px 22px;background:#00e5ff;color:#001014;border-radius:10px;text-decoration:none;font-weight:bold">🏠 ပင်မသို့ ပြန်သွားရန်</a>' +
    '</div></body></html>';
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
            try { console.error('[AICS] oauth token failed', JSON.stringify(tokenData).slice(0, 300)); } catch (_) {}
            return json({ error: 'auth_failed', detail: 'Login could not be completed. Please try again.' }, 400, cors);
          }
          const ures = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: 'Bearer ' + tokenData.access_token },
          });
          const user = await ures.json().catch(() => ({}));
          if (!user.id || !user.email) {
            try { console.error('[AICS] oauth userinfo failed', JSON.stringify(user).slice(0, 300)); } catch (_) {}
            return json({ error: 'userinfo_failed', detail: 'Login could not be completed. Please try again.' }, 400, cors);
          }

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
          // Phase 11 — Browser မှ Page Navigation များတွင် Header မပါသော်လည်း Admin Panel ဝင်နိုင်ရန်
          // HttpOnly Cookie ကိုပါ ထည့်ပေးသည် (Authorization Header ကို မူလအတိုင်း ထားသည်)
          const sessionCookie = 'aics_token=' + encodeURIComponent(token) + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800';
          return new Response(null, {
            status: 302,
            headers: { Location: state + '#token=' + encodeURIComponent(token), 'Set-Cookie': sessionCookie },
          });
        } catch (e) {
          return json({ error: 'auth_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      if (path === '/auth/result' && request.method === 'GET') return htmlPage(loginResultPage());
      if (path === '/app' || path === '/app/') return htmlPage(APP_HTML);
      // ===== Studio Pages (Phase 4 — Registry + Admin ON/OFF နှင့် ချိတ်သည်) =====
      // Studio Disabled ဖြစ်ပါက Friendly Message ပြပြီး Access ပိတ်သည် (Rule 14 — Server-side)
      // Phase 7 — /app/ မဟုတ်သော Path (ဥပမာ /api/admin/studios/shop) ကို Studio Page နှင့် မရောမှတ်ရန် ပြင်သည်
      {
        const STUDIO_PAGES = { content: CONTENT_HTML, story: STORY_HTML, short: SHORT_HTML, image: IMAGE_HTML, voice: VOICE_HTML, shop: SHOP_HTML };
        const studioSlug = path.startsWith('/app/') ? path.replace(/\/+$/, '').split('/').pop() : '';
        if (STUDIO_PAGES[studioSlug]) {
          const enabled = await isStudioEnabled(env, studioSlug);
          if (!enabled) return htmlPage(studioDisabledPage(studioSlug));
          return htmlPage(STUDIO_PAGES[studioSlug]);
        }
      }
      if (path === '/app/creations' || path === '/app/creations/') return htmlPage(CREATIONS_HTML);
      if (path === '/app/settings' || path === '/app/settings/') return htmlPage(SETTINGS_HTML);
      if (path === '/app/projects' || path === '/app/projects/') return htmlPage(PROJECTS_HTML);
      if (path === '/admin' || path === '/admin/') {
        // Admin Panel — admin မဟုတ်သူတွေ မမြင်ရအောင် Server-side Role Check (Rule 13)
        // Phase 11 — Browser မှ နှိပ်ဝင်သည့်အခါ Authorization Header မပါတတ်သောကြောင့်
        // Cookie Session ကိုပါ လက်ခံသည် (Header က ဦးစားပေး)
        const token = bearer(request) || cookieToken(request);
        if (!token) return Response.redirect(url.origin + '/api/auth/login?next=' + encodeURIComponent(url.origin + '/admin'), 302);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) {
          // Cookie ပျက်သွားပါက Login သို့ ပြန်ပို့ပြီး Cookie ကို ရှင်းသည် (Header ဖြင့်လာပါက 404 ဖြစ်သည်)
          if (cookieToken(request)) {
            return new Response(null, {
              status: 302,
              headers: { Location: url.origin + '/api/auth/login?next=' + encodeURIComponent(url.origin + '/admin'), 'Set-Cookie': clearSessionCookie() },
            });
          }
          return json({ error: 'not_found' }, 404, cors);
        }
        const adminEmail = env.ADMIN_EMAIL || 'saialin808@gmail.com';
        if (String(payload.email).toLowerCase() !== String(adminEmail).toLowerCase()) {
          return json({ error: 'not_found' }, 404, cors);
        }
        return htmlPage(ADMIN_HTML);
      }
      // Phase 11 — Logout: HttpOnly Cookie ကို ရှင်းပြီး ပင်မသို့ ပြန်ပို့သည်
      if (path === '/api/auth/logout' && request.method === 'GET') {
        return new Response(null, {
          status: 302,
          headers: { Location: url.origin + '/app', 'Set-Cookie': clearSessionCookie() },
        });
      }
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
        const adminEmail = env.ADMIN_EMAIL || 'saialin808@gmail.com';
        const isAdmin = String(payload.email || '').toLowerCase() === String(adminEmail).toLowerCase();
        // Phase 3 — User ၏ Settings / Preferences များကိုပါ ပြန်ပို့သည်
        const settings = await getUserSettings(env, payload.sub);
        const preferences = await getUserPreferences(env, payload.sub);
        // Phase 4 — Studio ON/OFF အနေအထားကိုပါ ပြန်ပို့သည် (Sidebar မှ ပိတ်ထားသော Studio ကို ဖျောက်ရန်)
        const studio_settings = await getStudioSettings(env);
        return json({ email: payload.email, plan, user_id: payload.sub, is_admin: isAdmin, settings, preferences, studio_settings }, 200, cors);
      }

      // ===== Personal Settings — Profile/Preferences သိမ်းခြင်း (Phase 3) =====
      // Server-side တွင် Whitelist စစ်ပြီးမှသာ သိမ်းသည် (Frontend ကို မယုံပါ)
      if (path === '/api/users/me/settings' && request.method === 'PUT') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || typeof body !== 'object') return json({ error: 'bad_request' }, 400, cors);
        try {
          const settings = await updateUserSettings(env, payload.sub, body.settings || {});
          const preferences = await updateUserPreferences(env, payload.sub, body.preferences || {});
          return json({ ok: true, settings, preferences }, 200, cors);
        } catch (e) {
          return json({ error: 'settings_error', detail: friendlyError(e) }, 500, cors);
        }
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
          return json({ error: 'db_error', detail: friendlyError(e) }, 500, cors);
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
          return json({ error: 'ai_error', detail: friendlyError(e) }, 500, cors);
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
        { const denied = await requireFeature(env, 'generate', plan, reqType); if (denied) return denied; }
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
          await trackUsageSafe(env, payload.sub, 'ai');
          try {
            if (out.output) await saveCreation(env, {
              user_id: payload.sub, studio: out.studio, type: out.type,
              original_prompt: String(body.idea), ai_output: out.output,
              title: String(body.idea).slice(0, 60),
            });
          } catch (e) {}
          return json(out, 200, cors);
        } catch (e) {
          return json({ error: 'studio_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Content Studio — Tab 1: Generate =====
      // ===== Studio API — Disabled Studio ကို Server-side တွင် ပိတ်သည် (Rule 14) =====
      // UI တွင် ဖျောက်ထားရုံဖြင့် မရ — API ကိုယ်တိုင် စစ်ဆေးသည်
      {
        const studioApiId = (path.match(/^\/api\/studio\/(story|content|short|image|voice|shop)\//) || [])[1];
        if (studioApiId) {
          const enabled = await isStudioEnabled(env, studioApiId);
          if (!enabled) return json({ error: 'studio_disabled', message: 'This studio is currently disabled.' }, 403, cors);
        }
      }

      if (path === '/api/studio/content/generate' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.idea) return json({ error: 'missing_idea' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'content.generate', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateContent(env, { idea: body.idea, type: reqType, plan, apiKey });
          await trackUsageSafe(env, payload.sub, 'ai');
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'content_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Content Studio — Tab 1: Revise (Chat) =====
      if (path === '/api/studio/content/revise' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.feedback) return json({ error: 'missing_feedback' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'content.revise', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await reviseContent(env, {
            originalContent: body.originalContent || '',
            originalSpeaking: body.originalSpeaking || '',
            originalVoice: body.originalVoice || '',
            feedback: body.feedback,
            type: reqType, plan, apiKey,
          });
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'revise_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Content Studio — Tab 1: Text → Voice (TTS) =====
      if (path === '/api/studio/content/tts' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.text) return json({ error: 'missing_text' }, 400, cors);
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateContentVoice(env, {
            text: body.text,
            voiceName: body.voiceName || 'Kore',
            apiKey,
          });
          await trackUsageSafe(env, payload.sub, 'voice');
          return json({ ok: true, data: out.data, mimeType: out.mimeType }, 200, cors);
        } catch (e) {
          return json({ error: 'tts_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Content Studio — Tab 2: Video Plan =====
      if (path === '/api/studio/content/video' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.idea) return json({ error: 'missing_idea' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'content.video', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateContentVideo(env, { idea: body.idea, type: reqType, plan, apiKey });
          await trackUsageSafe(env, payload.sub, 'ai');
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'video_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Content Studio — Tab 2: Video Scene Image =====
      if (path === '/api/studio/content/video-image' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.prompt) return json({ error: 'missing_prompt' }, 400, cors);
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateContentVideoImage(env, { prompt: body.prompt, apiKey });
          return json({ ok: true, data: out.data, mimeType: out.mimeType }, 200, cors);
        } catch (e) {
          return json({ error: 'image_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Content Studio — Tab 3: SRT from Audio =====
      if (path === '/api/studio/content/srt' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.audioBase64) return json({ error: 'missing_audio' }, 400, cors);
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateContentSrt(env, {
            audioBase64: body.audioBase64,
            mimeType: body.mimeType || 'audio/mpeg',
            apiKey,
          });
          return json({ ok: true, srt: out.srt }, 200, cors);
        } catch (e) {
          return json({ error: 'srt_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Content Studio — Tab 3: Translate SRT =====
      if (path === '/api/studio/content/translate-srt' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.srtText) return json({ error: 'missing_srt' }, 400, cors);
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await translateContentSrt(env, {
            srtText: body.srtText,
            direction: body.direction || 'my-to-cn',
            apiKey,
          });
          return json({ ok: true, srt: out.srt }, 200, cors);
        } catch (e) {
          return json({ error: 'translate_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Story Studio — Tab 1: Generate =====
      if (path === '/api/studio/story/generate' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.idea) return json({ error: 'missing_idea' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'story.generate', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateStory(env, { idea: body.idea, type: reqType, plan, apiKey });
          await trackUsageSafe(env, payload.sub, 'ai');
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'story_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Story Studio — Tab 1: Revise (Chat) =====
      if (path === '/api/studio/story/revise' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.instruction) return json({ error: 'missing_instruction' }, 400, cors);
        if (!body.currentStory) return json({ error: 'missing_current_story' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'story.revise', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await reviseStory(env, {
            idea: body.idea || '',
            type: reqType,
            currentStory: body.currentStory,
            instruction: body.instruction,
            plan, apiKey,
          });
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'revise_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Story Studio — Tab 2: Video Plan =====
      if (path === '/api/studio/story/video' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.idea) return json({ error: 'missing_idea' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'story.video', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateStoryVideoPlan(env, { idea: body.idea, type: reqType, plan, apiKey });
          await trackUsageSafe(env, payload.sub, 'ai');
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'video_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Story Studio — Tab 2: Video Scene/Character Image =====
      if (path === '/api/studio/story/video-image' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.prompt) return json({ error: 'missing_prompt' }, 400, cors);
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateStoryVideoImage(env, { prompt: body.prompt, apiKey });
          return json({ ok: true, data: out.data, mimeType: out.mimeType }, 200, cors);
        } catch (e) {
          return json({ error: 'image_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Short Studio — Tab 1: Generate =====
      if (path === '/api/studio/short/generate' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.idea) return json({ error: 'missing_idea' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'short.generate', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateShort(env, { idea: body.idea, type: reqType, plan, apiKey });
          await trackUsageSafe(env, payload.sub, 'ai');
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'short_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Short Studio — Tab 1: Revise (Chat) =====
      if (path === '/api/studio/short/revise' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.instruction) return json({ error: 'missing_instruction' }, 400, cors);
        if (!body.currentShort) return json({ error: 'missing_current_short' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'short.revise', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await reviseShort(env, {
            idea: body.idea || '', type: reqType, currentShort: body.currentShort,
            instruction: body.instruction, plan, apiKey,
          });
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'revise_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Short Studio — Tab 2: Video Plan (with Reference Images) =====
      if (path === '/api/studio/short/video' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.idea) return json({ error: 'missing_idea' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'short.video', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateShortVideoPlan(env, {
            idea: body.idea, type: reqType, plan, apiKey,
            images: body.images || [],
          });
          await trackUsageSafe(env, payload.sub, 'ai');
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'video_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Short Studio — Tab 2: Video Scene/Character Image =====
      if (path === '/api/studio/short/video-image' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.prompt) return json({ error: 'missing_prompt' }, 400, cors);
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateShortVideoImage(env, { prompt: body.prompt, apiKey });
          return json({ ok: true, data: out.data, mimeType: out.mimeType }, 200, cors);
        } catch (e) {
          return json({ error: 'image_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Image Studio — Tab 1: Image Prompt Generate =====
      if (path === '/api/studio/image/prompt' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.idea) return json({ error: 'missing_idea' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'image.prompt', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateImagePrompt(env, {
            idea: body.idea, type: reqType, plan, apiKey,
            images: body.images,
          });
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'image_prompt_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Image Studio — Tab 2: Ad Image Prompt Generate =====
      if (path === '/api/studio/image/ad-prompt' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.idea) return json({ error: 'missing_idea' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'image.ad_prompt', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateAdImagePrompt(env, {
            idea: body.idea, type: reqType, plan, apiKey,
            images: body.images,
          });
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'ad_prompt_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Image Studio — Tab 1 & 2: Generate Actual Image from Prompt =====
      if (path === '/api/studio/image/generate' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.prompt) return json({ error: 'missing_prompt' }, 400, cors);
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateImageFromPrompt(env, { prompt: body.prompt, apiKey });
          await trackUsageSafe(env, payload.sub, 'image');
          return json({ ok: true, data: out.data, mimeType: out.mimeType }, 200, cors);
        } catch (e) {
          return json({ error: 'image_generate_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Voice Studio — Tab 1: Text → Voice (TTS) =====
      if (path === '/api/studio/voice/tts' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.text) return json({ error: 'missing_text' }, 400, cors);
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateVoiceAudio(env, {
            text: body.text,
            voiceName: body.voiceName || 'Kore',
            apiKey,
          });
          await trackUsageSafe(env, payload.sub, 'voice');
          return json({ ok: true, data: out.data, mimeType: out.mimeType }, 200, cors);
        } catch (e) {
          return json({ error: 'tts_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Voice Studio — Tab 2: Audio → Text (Transcribe) =====
      if (path === '/api/studio/voice/transcribe' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.audioBase64) return json({ error: 'missing_audio' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'voice.transcribe', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await transcribeAudio(env, {
            audioBase64: body.audioBase64,
            mimeType: body.mimeType || 'audio/mpeg',
            type: reqType, plan, apiKey,
          });
          await trackUsageSafe(env, payload.sub, 'ai');
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'transcribe_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Voice Studio — Tab 1 & 2: SRT from Audio (PRO only) =====
      if (path === '/api/studio/voice/srt' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.audioBase64) return json({ error: 'missing_audio' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        { const denied = await requireFeature(env, 'voice.srt', plan, String(body.type || '2')); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateVoiceSrt(env, {
            audioBase64: body.audioBase64,
            mimeType: body.mimeType || 'audio/mpeg',
            type: String(body.type || '2'), plan, apiKey,
          });
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'srt_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Voice Studio — Tab 1 & 2: Translate SRT (PRO only) =====
      if (path === '/api/studio/voice/translate-srt' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.srtText) return json({ error: 'missing_srt' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        { const denied = await requireFeature(env, 'voice.translate_srt', plan, String(body.type || '2')); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await translateVoiceSrt(env, {
            srtText: body.srtText,
            direction: body.direction || 'MY_TO_CN',
            type: String(body.type || '2'), plan, apiKey,
          });
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'translate_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Shop Studio — Tab 1: Generate =====
      if (path === '/api/studio/shop/content/generate' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.idea) return json({ error: 'missing_idea' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'shop.content_generate', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateShopContent(env, { idea: body.idea, type: reqType, plan, apiKey, images: body.images || [] });
          await trackUsageSafe(env, payload.sub, 'ai');
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'shop_content_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Shop Studio — Tab 1: Revise (Chat) =====
      if (path === '/api/studio/shop/content/revise' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.instruction) return json({ error: 'missing_instruction' }, 400, cors);
        if (!body.currentContent) return json({ error: 'missing_current_content' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'shop.content_revise', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await reviseShopContent(env, {
            idea: body.idea || '', type: reqType, currentContent: body.currentContent,
            instruction: body.instruction, plan, apiKey,
          });
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'revise_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Shop Studio — Tab 2: Video Plan =====
      if (path === '/api/studio/shop/video/generate' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.idea) return json({ error: 'missing_idea' }, 400, cors);
        const plan = await resolvePlan(env, payload);
        const reqType = String(body.type || '1');
        { const denied = await requireFeature(env, 'shop.video_generate', plan, reqType); if (denied) return denied; }
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateShopVideo(env, { idea: body.idea, type: reqType, plan, apiKey, images: body.images || [] });
          await trackUsageSafe(env, payload.sub, 'ai');
          return json({ ok: true, ...out }, 200, cors);
        } catch (e) {
          return json({ error: 'video_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Shop Studio — Tab 2: Video Scene/Character/Product Image =====
      if (path === '/api/studio/shop/video-image' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.prompt) return json({ error: 'missing_prompt' }, 400, cors);
        try {
          let apiKey = body.apiKey;
          if (!apiKey) apiKey = await getUserApiKey(env, payload.sub);
          const out = await generateShopVideoImage(env, { prompt: body.prompt, apiKey });
          return json({ ok: true, data: out.data, mimeType: out.mimeType }, 200, cors);
        } catch (e) {
          return json({ error: 'image_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Projects — User ကိုယ်ပိုင် Project များ (Phase 3) =====
      // Server-side တွင် user_id ကို အမြဲ စစ်သည် — အခြားသူ၏ Project ကို မမြင်ရ/မဖျက်ရပါ
      if (path === '/api/projects' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.title) return json({ error: 'missing_title' }, 400, cors);
        try {
          const p = await createProject(env, payload.sub, String(body.title), body.description || '');
          return json({ ok: true, project: p }, 200, cors);
        } catch (e) {
          return json({ error: 'project_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      if (path === '/api/projects' && request.method === 'GET') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        try {
          const items = await listProjects(env, payload.sub);
          return json({ items }, 200, cors);
        } catch (e) {
          return json({ error: 'project_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      if (path.startsWith('/api/projects/') && request.method === 'DELETE') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const id = path.split('/').pop();
        if (!id) return json({ error: 'missing_id' }, 400, cors);
        try {
          await deleteProject(env, payload.sub, id);
          return json({ ok: true }, 200, cors);
        } catch (e) {
          return json({ error: 'delete_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Creations — Favorite Toggle (Phase 3 — User ကိုယ်ပိုင် Creation သာ) =====
      if (path.startsWith('/api/creations/') && path.endsWith('/favorite') && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const id = path.split('/')[3];
        if (!id) return json({ error: 'missing_id' }, 400, cors);
        try {
          const r = await toggleFavorite(env, payload.sub, id);
          return json({ ok: true, favorite: r.favorite }, 200, cors);
        } catch (e) {
          return json({ error: 'favorite_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      // ===== Creations — Save (Studio UIs က Save ခလုတ်တွေက ဒီ endpoint ကို သုံးသည်) =====
      if (path === '/api/creations' && request.method === 'POST') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const body = await request.json().catch(() => null);
        if (!body || !body.ai_output) return json({ error: 'missing_output' }, 400, cors);
        try {
          await saveCreation(env, {
            user_id: payload.sub,
            studio: body.studio || 'UNKNOWN',
            type: body.type || '1',
            original_prompt: body.original_prompt || '',
            ai_output: body.ai_output,
            title: body.title || 'Untitled',
          });
          return json({ ok: true }, 200, cors);
        } catch (e) {
          return json({ error: 'save_error', detail: friendlyError(e) }, 500, cors);
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

      // ===== Creations — Delete (User ကိုယ်ပိုင် Creation သာ ဖျက်နိုင်သည်) =====
      if (path.startsWith('/api/creations/') && request.method === 'DELETE') {
        const token = bearer(request);
        if (!token) return json({ error: 'unauthorized' }, 401, cors);
        const payload = await verifyTokenSafe(env, token);
        if (!payload) return json({ error: 'invalid_token' }, 401, cors);
        const id = path.split('/').pop();
        if (!id) return json({ error: 'missing_id' }, 400, cors);
        try {
          await deleteCreation(env, payload.sub, id);
          return json({ ok: true }, 200, cors);
        } catch (e) {
          return json({ error: 'delete_error', detail: friendlyError(e) }, 500, cors);
        }
      }

      return json({ error: 'not_found', path }, 404, cors);
    } catch (e) {
      return json({ error: 'internal', detail: friendlyError(e) }, 500, cors);
    }
  },
};
