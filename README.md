# AI Creative Studio

**Personal + Modular + Maintainable + Secure + Responsive + Scalable + Admin-Controlled**
AI Creative Studio — a multi-studio content creation platform (Story / Content / Short / Image / Voice / Shop), rebuilt from a Google Apps Script + Google Sheets + Gemini web app onto **Cloudflare Worker + D1 + GitHub Actions**.

This is the fully re-architected version produced under the **Master Development Instruction** (Phases 1–7): App Shell → Personal User System → Studio System → Admin Panel → Responsive → Testing & Documentation.

## ✨ Features

- **6 Studios** — Story, Content, Short, Image, Voice, Shop (Studio Registry — new studios plug in without touching core).
- **Personal User System** — every user sees only their own Profile, Settings, Preferences, Projects, Creations, API Keys, Usage. Ownership is enforced **server-side**.
- **Global Shared Sidebar** — one component, responsive across Desktop / iPad / Phone.
- **Free / Pro** — controlled by configuration (feature registry), not hard-coded.
- **Usage Tracking** — AI requests, images, voice, projects per user, viewable in Admin.
- **Admin Panel** — Dashboard, Users, Studios, Features, AI Models/API, Usage, Plans, Projects, Announcements, Logs, System Settings (role-protected: `USER` / `ADMIN` / `SUPER_ADMIN`).
- **BYOK** — user API keys stored & used only server-side (never returned to the frontend).
- **Dark theme** preserved; shared UI components; responsive layout.

## 🚀 Quick Start (local)

```bash
# 1. Install Wrangler
npm i -g wrangler

# 2. Authenticate
wrangler login

# 3. Create D1 database & bind it (see wrangler.toml; binding name: DB)
#    Then apply all migrations in order:
wrangler d1 execute DB --local --file=worker/migrations/001_create_users.sql
# ... repeat for 002..008

# 4. Local dev
cd worker && npm run dev        # or: wrangler dev

# 5. Deploy (GitHub Actions does this automatically on push to main)
wrangler deploy
```

> `wrangler.toml` defines `dev / staging / prod` environments. GitHub Actions `.github/workflows/deploy.yml` runs deploy + D1 migrations.

## 📁 Structure (top level)

```
ai-creative-studio-main/
├── .github/workflows/deploy.yml   # CI/CD — Worker deploy + D1 migrations
├── README.md / ARCHITECTURE.md / DATABASE.md / STUDIOS.md / ADMIN.md / SECURITY.md
├── worker/
│   ├── wrangler.toml              # environments + D1 binding
│   ├── migrations/                # 001–009 D1 schema (see DATABASE.md)
│   └── src/
│       ├── index.js               # entry: routing, auth, plan/feature gates, pages
│       ├── admin.js               # Admin panel HTML + admin API
│       ├── studio.js              # legacy generic generator (Story/Content)
│       ├── config/                # STUDIO_REGISTRY, FEATURE_REGISTRY
│       ├── core/                  # auth, ai, cms, creations, projects, settings,
│       │                          #   usage, studioSettings, featureSettings, adminLogs, utilities
│       ├── studios/               # story, content, short, image, voice, shop (business logic)
│       └── frontend/              # per-page UI (all use shared.js sidebar + responsive)
```

See **ARCHITECTURE.md**, **DATABASE.md**, **STUDIOS.md**, **ADMIN.md**, **SECURITY.md** for details.

## ✅ How to extend

- **Add a Studio** → see `STUDIOS.md` (Registry + module, no core changes).
- **Toggle Free/Pro** → Admin → Features, or edit `config/features.js`.
- **Enable/disable a Studio** → Admin → Studios (server-side enforced).

## 📝 Note on placeholders

`SITE_LINKS` (Telegram / Facebook) in `worker/src/config/studios.js` are placeholders — replace with your real links before launch.
