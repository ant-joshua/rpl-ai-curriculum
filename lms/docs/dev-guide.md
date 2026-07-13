# Development Guide

## Local Setup

```bash
# Clone
git clone <repo>
cd lms

# Install
npm install

# Create local D1 DB
npx wrangler d1 create rpl-ai-lms-db

# Apply migrations
npx wrangler d1 migrations apply rpl-ai-lms-db

# Copy wrangler.toml
cp wrangler.toml.example wrangler.toml  # fill your IDs

# Run dev server
npm run dev
```

## Adding a Migration

1. Create file: `migrations/0027_your_name.sql`
2. Write SQL (use CREATE TABLE IF NOT EXISTS, CREATE INDEX IF NOT EXISTS)
3. Apply: `npx wrangler d1 migrations apply rpl-ai-lms-db --remote`

**Migration naming:** `{number}_{description}.sql`

**Rules:**
- Always `IF NOT EXISTS` for tables/indexes
- Use `REFERENCES` with `ON DELETE CASCADE`
- `id TEXT PRIMARY KEY` with UUIDs
- All timestamps: `TEXT DEFAULT (datetime('now'))`
- Use CHECK constraints instead of ENUM

## Adding an Admin API Route

1. Create `src/routes/api/admin/{entity}/+server.ts`
2. Use pattern:

```typescript
import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
    try {
        const db = getDB(platform);
        const rows = await db.prepare('SELECT * FROM table ORDER BY created_at DESC').all();
        return jsonResponse({ success: true, data: rows.results || [] });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        return jsonResponse({ success: false, error: msg }, 500);
    }
}

export async function POST({ platform, request }: { platform: App.Platform; request: Request }): Promise<Response> {
    try {
        const db = getDB(platform);
        const body = await request.json();
        const id = crypto.randomUUID();
        await db.prepare('INSERT INTO table (id, name) VALUES (?, ?)').bind(id, body.name).run();
        return jsonResponse({ success: true, data: { id } });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        return jsonResponse({ success: false, error: msg }, 500);
    }
}
```

3. Single item: `src/routes/api/admin/{entity}/[slug]/+server.ts`

## Adding a Student Page

1. Create `src/routes/learn/[offeringId]/lessons/[slug]/+page.server.ts`
2. Data loads via `load()` function — direct D1 query
3. Page Svelte receives `data` prop

```typescript
// +page.server.ts
import { getDB } from '$lib/server/d1';

export async function load({ params, platform }) {
    const db = getDB(platform);
    const lesson = await db.prepare(
        'SELECT * FROM lessons WHERE slug = ? AND course_offering_id = ?'
    ).bind(params.slug, params.offeringId).first();
    return { lesson };
}
```

## Architecture Rules

| Rule | Reason |
|---|---|
| Admin API → direct D1, no ORM | Simpler, faster, D1-specific |
| Student pages → server load functions | Avoid extra API calls |
| Auth → hooks.server.ts for admin routes | Single gate, not per-route |
| Tokens → sessions table, not JWT | D1 is fast, revokable easily |
| IDs → crypto.randomUUID() | Unique, no sequence issues |
| Timestamps → `datetime('now')` in D1 | Timezone-safe |

## Content Type Guard

```svelte
<script lang="ts">
    interface ContentMeta {
        videoId?: string;
        startTime?: number;
        language?: string;
        initialCode?: string;
        url?: string;
        width?: string | number;
        height?: string | number;
        questions?: Array<{
            question: string;
            options: string[];
            correct: number;
        }>;
    }

    let { block }: { block: any } = $props();
    
    let meta: ContentMeta = $derived(
        typeof block.meta === 'string' 
            ? JSON.parse(block.meta || '{}') 
            : (block.meta || {})
    );
</script>
```

## Deployment Checklist

- [ ] `npm run build` — zero errors
- [ ] `svelte-check` — zero new errors
- [ ] D1 migrations applied (check `_cf_MIGRATIONS`)
- [ ] `npx wrangler pages deploy`
- [ ] Smoke test: 200 on admin endpoints
- [ ] Smoke test: 200 on student pages

## Git Workflow

```bash
# Batch all changes
git add -A
git commit -m "feat: description of feature"

# Push
git push origin main
```

## Performance Notes

- D1 reads: ~20ms cold, ~1ms warm
- First request after deploy: cold start (~500ms)
- Use `?_cf_migration=yes` to trigger warm-up
- Keep tool output <50KB for token budget
- 9router API fallback: auto if primary fails
