# RPL AI LMS — Documentation Index

Learning Management System untuk RPL 2026 — SvelteKit + Cloudflare Pages + D1.

> **Agents: read `../AGENTS.md` first.** Feature master list in `FEATURES.md`.

## Docs map

| File | Content |
|---|---|
| **`FEATURES.md`** | **Master feature list** — 17 epics, FE-XXXX IDs, status, routes, tables |
| `architecture.md` | Architecture overview |
| `database-schema.md` | Full DB schema reference |
| `api-reference.md` | API endpoints reference |
| `dev-guide.md` | Dev workflow / conventions |
| `admin-guide.md` | Admin user guide |
| `PRD/` | Product requirements (incl. `PRD-004-features.md` legacy) |
| `BRD/` | Business requirements |
| `FSD/` | Functional specs per module |
| `TECH/` | Stack, architecture, migrations |
| `TEST/` | Test plans |
| `API/`, `DB/`, `UX/`, `PLAN/`, `SPRINTS/` | (growing) |

## Snapshot (2026-08-08)

- **Routes:** 647 (pages + API endpoints)
- **Tables:** 225 (104 migrations, incl. seed/legacy)
- Latest deploy: `d0004e58` (commit `5e4bf02`)

Refresh: `python3 tools/inventory-routes.py --markdown`

## Stack

- **Frontend/Backend**: Svelte 5 (runes) + TypeScript
- **Hosting**: Cloudflare Pages (adapter-cloudflare)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (Assets)
- **AI**: 9router API (`ocg/deepseek-v4-flash`)
- **Auth**: cookie `lms_token` (HttpOnly Secure SameSite=Lax 7d), OAuth Google/GitHub, 2FA, email verify

## Quick Start

```bash
cd lms
npm install
npm run dev
```

## Deployment

```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name rpl-ai-curriculum --branch main
```

Build ~9 min (RAM heavy) — run background with notify.