-- 0058_parent_portal.sql
-- Parent Portal: orang tua akses nilai, absensi, SPP anak

-- 1. parent_accounts: parent/guardian linked to students
CREATE TABLE IF NOT EXISTS parent_accounts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  relationship TEXT NOT NULL, -- father, mother, guardian
  is_primary INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_parent_accounts_tenant ON parent_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parent_accounts_user ON parent_accounts(user_id);

-- 2. parent_student_links: many-to-many parent ↔ student
CREATE TABLE IF NOT EXISTS parent_student_links (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  relationship TEXT NOT NULL, -- father, mother, guardian
  is_primary INTEGER DEFAULT 0,
  access_level TEXT DEFAULT 'full', -- full, academic_only, financial_only
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_psl_tenant ON parent_student_links(tenant_id);
CREATE INDEX IF NOT EXISTS idx_psl_parent ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_psl_student ON parent_student_links(student_id);

-- 3. parent_access_log: audit trail for parent access
CREATE TABLE IF NOT EXISTS parent_access_log (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  action TEXT NOT NULL, -- view_grades, view_attendance, view_fees, download_rapor
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pal_tenant ON parent_access_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pal_parent ON parent_access_log(parent_id);

-- 4. parent_messages: messaging between parents and teachers
CREATE TABLE IF NOT EXISTS parent_messages (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  sender_id TEXT NOT NULL, -- user_id
  sender_role TEXT NOT NULL, -- parent, teacher, admin
  recipient_id TEXT NOT NULL, -- user_id
  student_id TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  read_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pm_tenant ON parent_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pm_recipient ON parent_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_pm_student ON parent_messages(student_id);

-- 5. parent_push_tokens: separate push tokens for parent app
CREATE TABLE IF NOT EXISTS parent_push_tokens (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  token TEXT NOT NULL,
  platform TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ppt_parent ON parent_push_tokens(parent_id);
