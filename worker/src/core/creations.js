// AI Creative Studio — Creations Service (Phase 3e)
function cuid() {
  const s = () => Math.random().toString(36).slice(2, 10);
  return s() + s() + s() + s();
}

async function saveCreation(env, { user_id, studio, title, original_prompt, ai_output, type }) {
  if (!env.DB) throw new Error('no_db');
  const id = cuid();
  await env.DB.prepare(
    'INSERT INTO creations (id, user_id, studio, title, original_prompt, ai_output, type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))'
  ).bind(id, user_id, studio, title || '', original_prompt || '', ai_output || '', type || '1').run();
  return { id };
}

async function listCreations(env, userId) {
  if (!env.DB) throw new Error('no_db');
  const r = await env.DB.prepare(
    'SELECT id, studio, title, type, created_at FROM creations WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(userId).all();
  return (r.results || []).map(row => ({
    id: row.id, studio: row.studio, title: row.title, type: row.type, created_at: row.created_at,
  }));
}

// ===== Delete — User ကိုယ်ပိုင် Creation သာ ဖျက်နိုင်သည် (user_id စစ်သည်) =====
async function deleteCreation(env, userId, id) {
  if (!env.DB) throw new Error('no_db');
  const r = await env.DB.prepare('DELETE FROM creations WHERE id = ? AND user_id = ?').bind(id, userId).run();
  if (!r.meta || r.meta.changes === 0) throw new Error('not_found');
  return { ok: true };
}

export { saveCreation, listCreations, deleteCreation };
