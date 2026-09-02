# AI Creative Studio (Cloudflare)

GAS + Google Sheets + Gemini based AI Creative Studio, migrating to Cloudflare.

- Stage: Setup Step 3 (repo + CI base)
- No application code yet (comes in STEP 4)
- Infra config only (wrangler.toml / GitHub Actions / D1 migrations)

## Structure
- .github/workflows/deploy.yml  -> CI/CD (Worker deploy + D1 migration)
- worker/wrangler.toml          -> Worker config (dev/staging/prod)
- worker/migrations/            -> D1 schema (001-003)
