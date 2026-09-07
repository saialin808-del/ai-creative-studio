# DATABASE.md

Cloudflare **D1** (SQLite). Schema is applied by migrations in `worker/migrations/`, **in order 001 → 008**. Each migration is incremental and additive — existing tables are never dropped.

## Migrations

| # | File | Adds |
|---|---|---|
| 001 | `001_create_users.sql` | `users` |
| 002 | `002_create_cms_prompts.sql` | `cms_prompts` |
| 003 | `003_create_creations.sql` | `creations` (+ index) |
| 004 | `004_create_user_keys.sql` | `user_keys` (BYOK) |
| 005 | `005_create_user_settings.sql` | `user_settings`, `user_preferences` |
| 006 | `006_create_projects_usage.sql` | `projects`, `usage`, `creations.is_favorite` |
| 007 | `007_create_studio_settings.sql` | `studio_settings` (Admin ON/OFF) |
| 008 | `008_create_feature_settings_logs.sql` | `feature_settings`, `admin_logs` |

## Tables

### users (001)
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| email | TEXT UNIQUE NOT NULL | Google OAuth email |
| plan | TEXT DEFAULT 'FREE' | `FREE` / `PRO` |
| expiry | TEXT | plan expiry |
| created_at / updated_at | TEXT | |

### cms_prompts (002)
Studio prompt templates — `UNIQUE(studio, plan, type)`; columns `core`, `memory`, `knowledge`, `workflow`, `template`, `prompt`, `quality_check`, `final_output`, `updated_at`.

### creations (003)
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | |
| user_id | INTEGER FK→users | **ownership scope** |
| studio | TEXT | |
| title / original_prompt / ai_output / type | TEXT | |
| is_favorite | INTEGER (added in 006) | 0/1 |
| created_at | TEXT | index `(user_id, created_at DESC)` |

### user_keys (004) — BYOK
| Column | Type | Notes |
|---|---|---|
| user_id | INTEGER PK FK→users | |
| gemini_key | TEXT | stored server-side, never returned to frontend |
| updated_at | TEXT | |

### user_settings (005)
Per-user defaults: `default_studio`, `default_voice`, `default_model`, `language` (default `my`), `theme` (default `dark`), `updated_at`. PK = `user_id`.

### user_preferences (005)
Key-value extensible preferences: `(user_id, pref_key)` PK, `pref_value`, `updated_at`.

### projects (006)
`id` TEXT PK, `user_id` FK (ownership), `title`, `description`, `created_at`, `updated_at`; index `(user_id, created_at DESC)`.

### usage (006)
`id` PK, `user_id` FK, `category` (e.g. `ai`, `image`, `voice`), `amount` default 1, `created_at`; index `(user_id, created_at)` — powers Admin usage statistics.

### studio_settings (007) — Admin control
`studio_id` TEXT PK, `enabled` INTEGER default 1, `updated_at`. Overrides the `enabled` flag in `config/studios.js` registry.

### feature_settings (008) — Free/Pro control
`feature_id` TEXT PK, `enabled` INTEGER default 1, `access` TEXT default `FREE` (`FREE`/`PRO`), `limit_value` INTEGER default 0, `updated_at`. Overrides `config/features.js`.

### admin_logs (008) — Audit
`id` PK, `admin_email`, `action`, `detail`, `created_at`. Written (best-effort) on admin actions: CMS create/update/delete, user plan change, studio toggle, feature update.

## Ownership rule

**Every** query in `core/` (`creations`, `projects`, `settings`, `usage`, `user_keys`) filters by `user_id` taken from the **verified JWT** (`payload.sub`), never from client-supplied values. This guarantees User A cannot access User B's data.

## Adding a new migration

Create `worker/migrations/009_xxx.sql` (additive `CREATE TABLE` / `ALTER TABLE ... ADD COLUMN`), apply it, and update this file. Do **not** drop or rename existing tables/columns without a documented plan.
