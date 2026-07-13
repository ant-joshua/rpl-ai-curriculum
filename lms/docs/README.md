# RPL AI LMS

Learning Management System untuk RPL 2026 — SvelteKit + Cloudflare Pages + D1.

## Tech Stack

- **Frontend/Backend**: Svelte 5 (runes) + TypeScript
- **Hosting**: Cloudflare Pages (adapter-cloudflare)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (Assets)
- **AI**: 9router API (`ocg/deepseek-v4-flash`)
- **Auth**: OAuth (Google/GitHub) + device_id fallback

## Quick Start

```bash
git clone <repo>
cd lms
npm install
npx wrangler d1 execute rpl-ai-lms-db --local --file=migrations/0001_init.sql
npm run dev
```

## Environment

| Variable | Description |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | CF account |
| `CLOUDFLARE_API_TOKEN` | CF API token |
| `GOOGLE_CLIENT_ID` | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `GITHUB_CLIENT_ID` | OAuth GitHub |
| `GITHUB_CLIENT_SECRET` | OAuth GitHub |

## Project Structure

```
src/
├── lib/
│   ├── components/       # UI components
│   │   ├── content/      # Content type renderers
│   │   ├── BadgeShowcase.svelte
│   │   ├── DiscussionPanel.svelte
│   │   ├── LockedLesson.svelte
│   │   └── NotificationBell.svelte
│   ├── server/
│   │   ├── auth.ts       # Session/token management
│   │   ├── d1.ts         # DB helpers
│   │   ├── analytics.ts  # Activity logging
│   │   └── badges.ts     # Badge award logic
│   ├── stores/           # Client-side state
│   └── i18n/             # Translations (EN/ID)
├── routes/
│   ├── api/
│   │   ├── admin/        # Admin CRUD endpoints
│   │   ├── auth/         # OAuth login/callback
│   │   ├── lessons/      # Prereq access check
│   │   ├── notifications/
│   │   ├── threads/      # Discussion threads
│   │   └── my/           # Student endpoints
│   ├── admin/            # Admin dashboard pages
│   ├── learn/            # Student course viewer
│   └── my/               # Student profile pages
├── hooks.server.ts       # Auth middleware
└── app.html
migrations/               # D1 migrations (0026)
static/                   # Static assets
```

## Deployment

```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name rpl-ai-lms
```

## Migrations

```bash
# Local dev
npx wrangler d1 migrations apply rpl-ai-lms-db

# Production
CLOUDFLARE_ACCOUNT_ID=xxx npx wrangler d1 migrations apply rpl-ai-lms-db --remote
```
