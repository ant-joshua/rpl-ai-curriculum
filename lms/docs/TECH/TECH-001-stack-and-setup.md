# TECH-001: Technology Stack & Setup

**Document ID:** TECH-001  
**Version:** 1.0  
**Status:** Draft

---

## 1. Stack Overview

| Layer | Technology | Version | Reason |
|---|---|---|---|
| **Frontend** | Svelte 5 | latest | Existing, runes, reactive |
| **Language** | TypeScript | 5.x | Type safety |
| **CSS** | CSS vars + custom | — | Linear design tokens |
| **ORM** | Drizzle ORM | ^0.38 | Type-safe, D1 native |
| **DB** | Cloudflare D1 (SQLite) | — | Existing, serverless |
| **Storage** | Cloudflare R2 | — | Existing ASSETS binding |
| **Hosting** | Cloudflare Pages | — | Existing, unlimited requests |
| **Auth** | Custom OAuth + sessions | — | Existing |
| **ID Generation** | crypto.randomUUID() | — | Built-in |

## 2. Dependencies to Add

```json
{
  "dependencies": {
    "drizzle-orm": "^0.38.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.0",
    "@types/node": "^22"
  }
}
```

## 3. Drizzle Setup

### 3.1 Client Initialization

```typescript
// src/lib/db/client.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

let db: ReturnType<typeof drizzle>;

export function getDB(platform: App.Platform) {
  if (!db) {
    db = drizzle(platform.env.DB, { schema, logger: true });
  }
  return db;
}
```

### 3.2 Schema Definition Pattern

```typescript
// src/lib/db/schema/tenants.ts
import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  type: text('type').$type<'lms' | 'academic_k13' | 'university' | 'bimbel' | 'tutor' | 'kelompok'>().notNull(),
  subdomain: text('subdomain').unique(),
  customDomain: text('custom_domain').unique(),
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color').default('#6c5ce7'),
  config: text('config').default('{}'),
  features: text('features').default('{}'),
  isActive: integer('is_active').default(1),
  ownerId: text('owner_id'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// src/lib/db/schema/index.ts — re-export all
export * from './tenants';
export * from './tenant-users';
export * from './k13-structure';
export * from './k13-grading';
export * from './tutoring';
export * from './university';
```

### 3.3 drizzle.config.ts

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema/*.ts',
  out: './migrations/drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
} satisfies Config;
```

## 4. Repository Pattern

```typescript
// src/lib/repositories/base.repository.ts
import { getDB } from '$lib/db/client';
import type { App } from '$lib/types';

export abstract class BaseRepository<T extends { id: string }> {
  protected db: ReturnType<typeof getDB>;

  constructor(platform: App.Platform) {
    this.db = getDB(platform);
  }

  protected async findAll(table: any, tenantId: string, opts?: { orderBy?: any, limit?: number }): Promise<T[]> {
    let query = this.db.select().from(table).where(
      eq(table.tenantId, tenantId)
    );
    if (opts?.orderBy) query = query.orderBy(opts.orderBy);
    if (opts?.limit) query = query.limit(opts.limit);
    return query.all() as Promise<T[]>;
  }

  protected async findById(table: any, id: string): Promise<T | undefined> {
    return this.db.select().from(table).where(eq(table.id, id)).get() as Promise<T | undefined>;
  }

  protected async create(table: any, data: Partial<T>): Promise<T> {
    return this.db.insert(table).values({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    } as any).returning().get() as Promise<T>;
  }

  protected async update(table: any, id: string, data: Partial<T>): Promise<T> {
    return this.db.update(table).set(data).where(eq(table.id, id)).returning().get() as Promise<T>;
  }
}
```

## 5. Service Pattern

```typescript
// src/lib/services/grading.service.ts
import { eq, avg, sql } from 'drizzle-orm';
import { getDB } from '$lib/db/client';
import * as schema from '$lib/db/schema';

export class GradingService {
  constructor(private platform: App.Platform) {}

  async calcNA(tenantId: string, classSubjectId: string, semester: number): Promise<any> {
    const db = getDB(this.platform);

    // Get grade weights from tenant config
    const tenant = await db.select().from(schema.tenants)
      .where(eq(schema.tenants.id, tenantId)).get();

    const config = JSON.parse(tenant?.config || '{}');
    const weights = config.k13_weight || { ph: 0.6, pts: 0.2, pas: 0.2 };
    const thresholds = config.grade_predikat || { A: 92, B: 84, C: 75, D: 0 };

    // Get all students in this class-subject
    const cs = await db.select().from(schema.classSubjects)
      .where(eq(schema.classSubjects.id, classSubjectId)).get();
    if (!cs) throw new Error('Class-subject not found');

    const members = await db.select().from(schema.classMembers)
      .where(and(
        eq(schema.classMembers.classId, cs.classId),
        eq(schema.classMembers.role, 'student'),
        eq(schema.classMembers.status, 'active'),
      )).all();

    return await Promise.all(members.map(async (member) => {
      // Get PH scores
      const phScores = await db.select({ score: schema.k13Ph.score })
        .from(schema.k13Ph)
        .where(and(
          eq(schema.k13Ph.userId, member.userId),
          eq(schema.k13Ph.classSubjectId, classSubjectId),
          eq(schema.k13Ph.semester, semester),
        )).all();

      // Get PTS
      const pts = await db.select({ score: schema.k13Pts.score })
        .from(schema.k13Pts)
        .where(and(
          eq(schema.k13Pts.userId, member.userId),
          eq(schema.k13Pts.classSubjectId, classSubjectId),
          eq(schema.k13Pts.semester, semester),
        )).get();

      // Get PAS
      const pas = await db.select({ score: schema.k13Pas.score })
        .from(schema.k13Pas)
        .where(and(
          eq(schema.k13Pas.userId, member.userId),
          eq(schema.k13Pas.classSubjectId, classSubjectId),
          eq(schema.k13Pas.semester, semester),
        )).get();

      // Calculate
      const phAvg = phScores.length > 0
        ? phScores.reduce((a, b) => a + b.score, 0) / phScores.length
        : null;
      const na = (phAvg !== null && pts?.score && pas?.score)
        ? (phAvg * weights.ph) + (pts.score * weights.pts) + (pas.score * weights.pas)
        : null;

      const predikat = na !== null
        ? na >= thresholds.A ? 'A' : na >= thresholds.B ? 'B' : na >= thresholds.C ? 'C' : 'D'
        : null;

      return {
        userId: member.userId,
        phAvg,
        pts: pts?.score ?? null,
        pas: pas?.score ?? null,
        na,
        predikat,
      };
    }));
  }
}
```

## 6. Route Structure

```
src/routes/
  +layout.svelte                    ← existing (default tenant)
  +layout.server.ts                 ← existing auth guard
  +page.svelte                      ← existing landing

  (backoffice)/
    admin/
      tenants/                      ← new: tenant management
        +page.svelte
        [id]/
          +page.svelte
          config/
            +page.svelte

  t/                                ← new: tenant-aware routes
    [slug]/
      +layout.svelte                ← tenant layout (school/bimbel/tutor)
      +layout.server.ts             ← tenant resolver + auth
      dashboard/
        +page.svelte
      admin/
        struktur/...                ← P2: school structure
      guru/
        kelas/[id]/nilai-ph/...     ← P3: grading
        rapor/[id]/...              ← P4: rapor
      bimbel/
        batch/...                   ← P6
        tryout/...                  ← P6
      tutor/
        jadwal/...                  ← P6
        siswa/...                   ← P6
        keuangan/...                ← P6
      mahasiswa/
        krs/...                     ← P7
        transkrip/...               ← P7
      dosen/
        nilai/...                   ← P7
```

## 7. Error Handling

```typescript
// src/lib/errors/index.ts
export class TenantNotFound extends Error {
  constructor(slug: string) {
    super(`Tenant '${slug}' not found`);
    this.name = 'TenantNotFound';
  }
}

export class GradeLockedError extends Error {
  constructor() {
    super('Rapor sudah difinalisasi. Nilai tidak bisa diubah.');
    this.name = 'GradeLockedError';
  }
}
```

## 8. Testing

```
vitest run src/lib/services/__tests__/grading.service.test.ts
vitest run src/lib/repositories/__tests__/tenant.repository.test.ts

Test structure:
- Unit test each grade calculation formula
- Unit test predikat assignment
- Integration test with temp D1 instance
- E2E test via Playwright for critical flows (input PH → see NA)
```
