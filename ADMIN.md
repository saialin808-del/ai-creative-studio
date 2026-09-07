# ADMIN.md

## Access

- **Route** — `/admin` (UI) and `/api/admin/*` (API).
- **Role model** — server-side, resolved from the verified JWT, never from a frontend flag:
  - `USER` → User App only
  - `ADMIN` → Admin Panel
  - `SUPER_ADMIN` → full system control
- **Fallback admin email** — `index.js` / `admin.js` use `env.ADMIN_EMAIL || 'saialin808@gmail.com'` to decide who is admin. Set `ADMIN_EMAIL` in Cloudflare secrets for production.

Admin routes are protected **server-side**; the Admin UI is a separate app (light theme `#F4F3EE`) split from the User App UI/routes.

## Admin tabs

| Tab | Source | Description |
|---|---|---|
| Dashboard | `/api/admin/dashboard` | overview stats |
| CMS | existing CMS API | edit prompt templates (create/update/delete → logged) |
| Users | admin user list + plan change | manage users, set Free/Pro (→ logged) |
| Studios | `/api/admin/studios` GET + PUT | toggle a studio ON/OFF (server-enforced; → logged) |
| Features | `/api/admin/features` GET + PUT | per-feature Enabled / Disabled / FREE / PRO / limit (→ logged) |
| Usage | `/api/admin/usage` | per-user usage statistics |
| Logs | `/api/admin/logs` | admin action audit trail |

## Studio control (Rule 14)

Admin toggles `studio_settings.enabled`; the **API** rejects disabled studios with 403 even if the UI tried to call them. See `STUDIOS.md`.

## Free/Pro control (Rule 15)

- Defaults live in `config/features.js` (`FEATURE_REGISTRY`, 27 features).
- Admin can override per feature: `enabled`, `access` (`FREE`/`PRO`), `limit_value` via `feature_settings`.
- Resolution: `enabled = DB_value ?? registry_default`; `access = DB_value ?? registry_default`.

## Audit

Key admin actions write a row to `admin_logs` (best-effort): CMS create/update/delete, user plan change, studio toggle, feature update.

## Do not

- Do **not** hide admin buttons in the UI and call that security — every admin API re-checks the role on the server.
