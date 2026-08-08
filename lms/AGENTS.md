# AGENTS.md — RPL AI LMS

Guidance for AI coding agents working in this repo. Read fully before touching code.

## Project

Multi-tenant LMS (K13 sekolah / bimbel / tutor / universitas) built with SvelteKit + Cloudflare Pages + D1 + R2. Live at `https://rpl-ai-curriculum.pages.dev`.

## Stack (TECH-001)

- SvelteKit 5 (runes), TypeScript, adapter-cloudflare
- **Zero new npm deps** unless explicitly approved
- D1 SQLite (edge), R2 for uploads, Workers for cron
- AI helper: env `AI_API_KEY` + `AI_API_URL`, model `ocg/deepseek-v4-flash`
- Auth: cookie `lms_token` (HttpOnly, Secure, SameSite=Lax, path=/, 7d) via `getTokenFromRequest()`

## Docs map (docs/)

| File | Content |
|---|---|
| `FEATURES.md` | **Master feature list** — 17 epics, FE-XXXX IDs, status, routes, tables. ADD a row here when building a feature |
| `database-schema.md` | Full table reference (225 tables) |
| `api-reference.md` | API endpoints reference |
| `architecture.md` | Architecture overview |
| `dev-guide.md` | Dev workflow |
| `PRD/` `BRD/` `FSD/` `TECH/` | Requirements & design docs (legacy numbering) |
| `admin-guide.md` | Admin user guide |

**Convention: new feature → FEATURES.md row first, then code.**

## Code conventions (STRICT)

- **All code/identifiers/SQL/comments in English.** UI strings may be Indonesian.
- Svelte 5 runes (`$state`, `$derived`, `$props`). No legacy `let x = $state()` misuse.
- Pages in `src/routes/**`, API endpoints in `src/routes/api/**` (one `+server.ts` per route dir, one method export per file).
- D1 queries: `db.prepare(...).bind(...)`, `first()` returns untyped → cast `as any`.
- Auth: `locals.user` for instructor, `getSession` + `getTokenFromRequest` for aiedu, hooks guard `/api/admin/` for admin role.
- Component props: Select uses `options` (not `items`); EmptyState uses `description` (not `desc`). Alert variant valid: `'danger'` not `'error'`.
- D1 `datetime('now')` NOT allowed as default in `ALTER TABLE ADD COLUMN` — nullable column instead.

## Migrations (TECH-003)

- One file per change: `migrations/NNNN_name.sql` (next: `0104_`)
- D1 has no `ADD COLUMN IF NOT EXISTS`, no cross-connection `PRAGMA foreign_keys=OFF` persistence, no transaction across `execute` calls → single-file migrations with `PRAGMA foreign_keys=OFF` at top.
- Apply: `CLOUDFLARE_ACCOUNT_ID=32b2efbe93d68a826eb2f250e9bb7df6 npx wrangler d1 execute rpl-ai-lms-db --remote --file migrations/NNNN.sql`
- After migration: check `pragma_table_info` before INSERT/UPDATE (e.g. `bundle_orders` has no `updated_at`; `coupon_redemptions` needs explicit `created_at`).
- Notifications table: `tenant_id TEXT NOT NULL` + `type` CHECK — 'success'/'cert'/'info' rejected; use `assessment|assignment|attendance|payment|grade|system|announcement`.

## Build & Deploy

```sh
cd lms && npm run build   # ~9 min, RAM-heavy
npx wrangler pages deploy .svelte-kit/cloudflare --project-name rpl-ai-curriculum --branch main
```

- Build slow → run background with `notify_on_complete=true`; deploy only after exit 0.
- Deploy twice if upload flakes; commit BEFORE deploy (rollback safety).
- Wrangler account: `32b2efbe93d68a826eb2f250e9bb7df6` (R2/DB).

## Pitfalls learned (do not repeat)

1. Two POST exports in same file → split routes.
2. `first()` untyped → `as any` cast.
3. D1 ALTER with `datetime('now')` default → rejected. Use nullable.
4. Offerings: fields `name`/`code`, not `subject`.
5. Users table has NO `tenant_id` — academic calendar uses `tenant_id='default'`.
6. Offering `class_id` is nullable (self-paced/private) — auto-enroll class members on create when set.
7. Alerts: `'danger'` not `'error'`.
8. Select `options`, EmptyState `description`.
9. SvelteKit layout: sidebar + main need flex (not grid) to avoid overflow.
10. `$app/state` page URL → `$derived($page.url...)` in runes mode.

## Roles

`superadmin` > `admin` > `instructor` > `ta` > `student`; `parent`/`guardian` portal separate. API admin routes auto-guarded in `hooks.server.ts`.

## Health check

`npm run build` clean + `api/health` returns ok + deploy hash visible on pages.dev → done.
