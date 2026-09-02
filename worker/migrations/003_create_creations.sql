-- creations table (user's saved AI outputs, scoped by user_id)
CREATE TABLE IF NOT EXISTS creations (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  studio TEXT NOT NULL,
  title TEXT, original_prompt TEXT, ai_output TEXT, type TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_creations_user_created ON creations(user_id, created_at DESC);
