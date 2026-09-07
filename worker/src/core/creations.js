// ============================================================
// AI CREATIVE STUDIO — Creations Service (Phase 3e + Phase 3)
// Phase 3 — ai_output/is_favorite ပြန်ပို့ခြင်း + Favorite Toggle ထည့်သည်
// ============================================================
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
    'SELECT id, studio, title, type, ai_output, is_favorite, created_at FROM creations WHERE user_id = ? ORDER BY created_at DESC LIMIT 100'
  ).bind(userId).all();
  return (r.results || []).map(row => ({
    id: row.id, studio: row.studio, title: row.title, type: row.type,
    ai_output: row.ai_output || '', is_favorite: row.is_favorite ? 1 : 0, created_at: row.created_at,
  }));
}

// ===== Favorite Toggle — User ကိုယ်ပိုင် Creation သာ ပြောင်းနိုင်သည် (user_id စစ်သည်) =====
async function toggleFavorite(env, userId, id) {
  if (!env.DB) throw new Error('no_db');
  const row = await env.DB.prepare('SELECT is_favorite FROM creations WHERE id = ? AND user_id = ?').bind(id, userId).first();
  if (!row) throw new Error('not_found');
  const next = row.is_favorite ? 0 : 1;
  await env.DB.prepare('UPDATE creations SET is_favorite = ? WHERE id = ? AND user_id = ?').bind(next, id, userId).run();
  return { favorite: next === 1 };
}

// ===== Delete — User ကိုယ်ပိုင် Creation သာ ဖျက်နိုင်သည် (user_id စစ်သည်) =====
async function deleteCreation(env, userId, id) {
  if (!env.DB) throw new Error('no_db');
  const r = await env.DB.prepare('DELETE FROM creations WHERE id = ? AND user_id = ?').bind(id, userId).run();
  if (!r.meta || r.meta.changes === 0) throw new Error('not_found');
  return { ok: true };
}

export { saveCreation, listCreations, deleteCreation, toggleFavorite };
