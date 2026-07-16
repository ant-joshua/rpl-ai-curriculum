# FSD-001: Tenant Foundation Module

**Document ID:** FSD-001  
**Module:** Tenant Engine  
**Phase:** P1  
**Status:** Draft

---

## 1. Overview

Core tenant engine that provisions, isolates, and routes all tenants. Every other module depends on this.

## 2. Routes

| Route | Method | Purpose | Auth |
|---|---|---|---|
| `/admin/tenants` | GET | List all tenants | superadmin |
| `/admin/tenants/new` | GET | Creation form | superadmin |
| `/admin/tenants` | POST | Create tenant | superadmin |
| `/admin/tenants/[id]` | GET | Detail + config editor | superadmin |
| `/admin/tenants/[id]` | PUT | Update tenant | superadmin |
| `/admin/tenants/[id]/deactivate` | POST | Soft deactivate | superadmin |
| `/admin/tenants/[id]/users` | GET | List tenant users | superadmin |
| `/admin/tenants/[id]/users/invite` | POST | Invite user | superadmin |
| `/admin/switch-tenant/[slug]` | GET | Switch active tenant | superadmin |

## 3. Data Model

### 3.1 Tenants Table

```sql
CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('lms','academic_k13','university','bimbel','tutor','kelompok')),
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6c5ce7',
  config TEXT DEFAULT '{}',
  features TEXT DEFAULT '{}',
  is_active INTEGER DEFAULT 1,
  owner_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### 3.2 Tenant Users Table

```sql
CREATE TABLE tenant_users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  joined_at TEXT DEFAULT (datetime('now')),
  UNIQUE(tenant_id, user_id)
);
```

## 4. Validation Rules

| Field | Validation |
|---|---|
| name | Required, 3-100 chars |
| slug | Auto-gen, unique, lowercase alphanumeric + hyphens |
| type | Required, must be valid enum value |
| email | Required for owner, valid format |

## 5. Tenant Routing Logic

```typescript
// hooks.server.ts
async function resolveTenant(event: RequestEvent) {
  const url = new URL(event.request.url);

  // Priority 1: Path-based /t/slug/...
  const pathMatch = url.pathname.match(/^\/t\/([^\/]+)(.*)/);
  if (pathMatch) {
    const tenant = await tenantRepo.findBySlug(pathMatch[1]);
    if (!tenant || !tenant.is_active) throw error(404, 'Tenant not found');
    event.locals.tenant = tenant;
    url.pathname = pathMatch[2] || '/';
    return new Request(url.toString(), event.request);
  }

  // Priority 2: Default tenant (backward compat)
  event.locals.tenant = await tenantRepo.findBySlug('default');
  return event.request;
}
```

## 6. UI States

| State | Tenant List | Create Form |
|---|---|---|
| **Loading** | Skeleton cards | Spinner on submit |
| **Empty** | "No tenants yet" + CTA button | — |
| **Error** | Error banner + retry | Inline field errors |
| **Success** | Toast + redirect to detail | Toast "Tenant created" |

## 7. Error Scenarios

| Scenario | HTTP | Message |
|---|---|---|
| Duplicate slug | 409 | "Slug already taken" |
| Invalid type | 400 | "Invalid tenant type" |
| Tenant not found | 404 | "Tenant not found" |
| Deactivated tenant | 404 | "Tenant not found" (same as 404 to hide existence) |
| Missing fields | 400 | Field-level validation errors |

## 8. Migration

```sql
-- 0045_tenant_engine.sql
CREATE TABLE tenants (...);
CREATE TABLE tenant_users (...);
INSERT INTO tenants (id, name, slug, type, is_active)
  VALUES ('default', 'Default LMS', 'default', 'lms', 1);
-- Seed default tenant_users from existing users
INSERT INTO tenant_users (id, tenant_id, user_id, role, status)
  SELECT uuid(), 'default', id, role, 'active' FROM users;
-- ALTER all existing tables
ALTER TABLE users ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE courses ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
-- ... repeat for 50+ tables
-- Add indexes
CREATE INDEX idx_courses_tenant ON courses(tenant_id);
CREATE INDEX idx_users_tenant ON users(tenant_id);
-- ... per table
```
