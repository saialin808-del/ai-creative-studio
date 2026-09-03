// AI Creative Studio — Cloudflare Worker API (STEP 4 Phase 1)
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
    return json({ error: 'not_found', path }, 404, cors);
  }
};

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}
