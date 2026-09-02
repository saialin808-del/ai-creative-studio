-- users table (from Google Sheets Users: email/plan/expiry)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'FREE',
  expiry TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
