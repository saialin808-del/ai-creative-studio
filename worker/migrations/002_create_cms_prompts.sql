-- cms_prompts table (from Google Sheets CMS: studio/plan/type + 8 prompt columns)
CREATE TABLE IF NOT EXISTS cms_prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studio TEXT NOT NULL,
  plan TEXT NOT NULL,
  type TEXT NOT NULL,
  core TEXT, memory TEXT, knowledge TEXT, workflow TEXT, template TEXT,
  prompt TEXT, quality_check TEXT, final_output TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE(studio, plan, type)
);
