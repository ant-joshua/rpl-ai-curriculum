# TECH-003: Database Migration Plan

**Document ID:** TECH-003  
**Version:** 1.0

---

## 1. Migration Inventory

| # | File | Phase | Description | Tables Added | Tables Altered |
|---|---|---|---|---|---|
| 0045 | tenant_engine.sql | P1 | tenants, tenant_users, +tenant_id on all tables | 2 | 55 |
| 0046 | k13_structure.sql | P2 | schools, classes, subjects, kd, class_members | 8 | 0 |
| 0047 | k13_grading.sql | P3 | k13_ph, pts, pas, skills, attitude, extracurricular | 6 | 0 |
| 0048 | k13_rapor.sql | P4 | rapor_k13 | 1 | 4 |
| 0049 | attendance.sql | P5 | attendance, attendance_recaps | 2 | 0 |
| 0050 | tutoring.sql | P6 | packages, sessions, progress, billing | 6 | 0 |
| 0051 | university.sql | P7 | faculties, prodi, krs, transcript | 8 | 0 |

Total new tables: ~33

## 2. Migration 0045 Detail (P1)

```sql
-- 0045_tenant_engine.sql

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
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

-- Seed default tenant
INSERT OR IGNORE INTO tenants (id, name, slug, type, is_active)
  VALUES ('default', 'Default LMS', 'default', 'lms', 1);

-- Tenant users junction
CREATE TABLE IF NOT EXISTS tenant_users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  joined_at TEXT DEFAULT (datetime('now')),
  UNIQUE(tenant_id, user_id)
);

-- Seed existing users as default tenant members
INSERT OR IGNORE INTO tenant_users (id, tenant_id, user_id, role, status)
  SELECT lower(hex(randomblob(16))), 'default', id, role, 'active' FROM users WHERE role IS NOT NULL;

-- ALTER existing tables
PRAGMA legacy_alter_table = ON;

ALTER TABLE users ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE courses ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE course_offerings ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE enrollments ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE lessons ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE assessments ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE assignments ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE gradebook ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE content_blocks ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE users ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
-- ... repeat for every existing table (55 total)

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_users(user_id);

-- Per-table indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_courses_tenant ON courses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_course_offerings_tenant ON course_offerings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_tenant ON enrollments(tenant_id);
-- ... per table
```

## 3. Execution Strategy

| Step | Command | Duration |
|---|---|---|
| Generate | `drizzle-kit generate` | ~2s |
| Review | Manual check .sql output | ~30s |
| Apply dry-run | `wrangler d1 execute ... --dry-run` | ~2s |
| Apply live | `wrangler d1 execute ... --remote --file=...` | ~5s per migration |
| Verify | `wrangler d1 execute ... --command="SELECT count(*)"` | ~1s |

## 4. Rollback Plan

Since all changes are ADDITIVE (ALTER TABLE ADD COLUMN, CREATE TABLE), rollback is:
- Deploy code revert (previous deployment)
- Data not lost — new columns just not used
- Can manually drop new tables later if needed

## 5. Final Table Count

| Category | Count |
|---|---|
| Existing tables | 55 |
| P1: Tenant engine | 2 new |
| P2: K13 structure | 8 new |
| P3: K13 grading | 6 new |
| P4: K13 rapor | 1 new |
| P5: Attendance | 2 new |
| P6: Tutoring | 6 new |
| P7: University | 8 new |
| **Total** | **~88 tables** |

Within D1 100-table limit. Buffer: 12 tables.
