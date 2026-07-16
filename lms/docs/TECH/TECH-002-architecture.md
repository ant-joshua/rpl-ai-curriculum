# TECH-002: Architecture & Routing

**Document ID:** TECH-002  
**Version:** 1.0

---

## 1. System Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│              │    │              │    │              │
│  Cloudflare  │───>│  CF Pages    │───>│  D1 Database │
│  DNS/CDN     │    │  (SvelteKit) │    │  (SQLite)    │
│              │    │              │    │              │
│  *.my.id     │    │  hooks.ts    │    │  55+ tables  │
│  → CF proxy  │    │  resolve-    │    │  + new ~20   │
│              │    │  tenant      │    │              │
└──────────────┘    └──────┬───────┘    └──────────────┘
                           │
                    ┌──────┴───────┐
                    │              │
                    ▼              ▼
             ┌──────────┐  ┌──────────┐
             │ R2       │  │ AI API   │
             │ Storage  │  │ (9router)│
             │ (assets) │  │          │
             └──────────┘  └──────────┘
```

## 2. Tenant Resolution Flow

```
Request → Host: lms-syllabus.my.id/t/sma-kembang/dashboard
                                 │
                  ┌──────────────┴──────────────┐
                  │  hooks.server.ts             │
                  │  resolveTenant()             │
                  └──────────────┬──────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │ pathMatch: /t/([^/]+)/  │
                    │ slug = 'sma-kembang'     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │ DB: SELECT * FROM       │
                    │ tenants WHERE slug = ?  │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │ event.locals.tenant = {  │
                    │   id: '...',             │
                    │   type: 'academic_k13',  │
                    │   config: {...}          │
                    │ }                        │
                    │                          │
                    │ url.pathname → /dashboard│
                    └─────────────────────────┘
```

## 3. Tenant-Aware Query Pattern

```typescript
// In every load function + API handler:
export async function load({ locals, platform }) {
  const db = getDB(platform);
  const tenantId = locals.tenant.id;

  // Always filter by tenant
  const courses = await db.select()
    .from(schema.courses)
    .where(eq(schema.courses.tenantId, tenantId))
    .all();
}
```

## 4. Authentication & Authorization

### 4.1 Auth Flow

```
1. User visits /t/sma-kembang/dashboard
2. If not authenticated → redirect to /t/sma-kembang/login
3. After login → check tenant_users for this user
4. If not in tenant → 403 "Not a member of this tenant"
5. If role mismatch (student accessing admin) → 403
```

### 4.2 Role Check Utility

```typescript
// src/lib/server/auth.ts
import { error, redirect } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { eq, and } from 'drizzle-orm';
import * as schema from '$lib/db/schema';

type AllowedRole = 'superadmin' | 'admin' | 'guru' | 'siswa' | 'tentor' | 'tutor' | 'mahasiswa' | 'dosen';

export async function requireRole(event: any, allowedRoles: AllowedRole[]) {
  const user = event.locals.user;
  if (!user) throw redirect(302, '/login');

  const db = getDB(event.platform);
  const tu = await db.select().from(schema.tenantUsers)
    .where(and(
      eq(schema.tenantUsers.tenantId, event.locals.tenant.id),
      eq(schema.tenantUsers.userId, user.id),
    )).get();

  if (!tu) throw error(403, 'Anda tidak memiliki akses ke tenant ini');
  if (!allowedRoles.includes(tu.role as AllowedRole)) {
    throw error(403, 'Role tidak memiliki akses ke halaman ini');
  }
  return tu;
}
```

## 5. Directory Structure (New)

```
src/lib/
  db/
    client.ts              ← Drizzle client init
    schema/
      index.ts
      tenants.ts
      k13-structure.ts
      k13-grading.ts
      k13-rapor.ts
      attendance.ts
      tutoring.ts
      bimbel.ts
      university.ts
  repositories/
    base.repository.ts
    tenant.repository.ts
    grade.repository.ts
    class.repository.ts
    session.repository.ts
    billing.repository.ts
  services/
    tenant.service.ts
    grading.service.ts
    rapor.service.ts
    attendance.service.ts
    billing.service.ts
    tryout.service.ts
  utils/
    k13-calc.ts            ← Pure functions: calcNA, getPredikat
    grade-scale.ts         ← University grade conversion
    id.ts                  ← UUID generator
  constants/
    predikat.ts            ← Default predikat thresholds
    grade-weights.ts       ← Default K13 weights
    feature-matrix.ts      ← Feature flags per type
  errors/
    index.ts
```

## 6. Performance Considerations

| Concern | Solution |
|---|---|
| 50+ tenant_id indexes on INSERT | Acceptable. SQLite single-writer. |
| Rapor generation (30 students) | Query per student with batch SQL, cache in rapor_k13 JSON |
| Try out ranking (500+ students) | Compute rank on submit, store don't recalculate |
| CSV import (500+ rows) | Batch INSERT in transaction of 50 |
| Grade calculation (full class) | Single query with AVG+GROUP BY, not row-by-row |
