-- 0048_k13_rapor.sql
-- Phase 4: K13 Rapor generation and management

-- 1. RAPOR K13 - master rapor record
CREATE TABLE IF NOT EXISTS rapor_k13 (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  academic_period_id TEXT NOT NULL,
  semester INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft','finalized','printed')),
  -- Per-subject summary (JSON for performance)
  subject_grades TEXT,
  -- Attendance summary
  attendance_sick INTEGER DEFAULT 0,
  attendance_permit INTEGER DEFAULT 0,
  attendance_absent INTEGER DEFAULT 0,
  -- Attitude
  attitude_spiritual TEXT,
  attitude_spiritual_desc TEXT,
  attitude_social TEXT,
  attitude_social_desc TEXT,
  -- Extracurricular
  extracurriculars TEXT,
  -- Notes
  homeroom_notes TEXT,
  -- Audit
  finalized_by TEXT,
  finalized_at TEXT,
  printed_count INTEGER DEFAULT 0,
  printed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, class_id, academic_period_id, semester)
);
CREATE INDEX IF NOT EXISTS idx_rapor_k13_class ON rapor_k13(class_id, semester);
CREATE INDEX IF NOT EXISTS idx_rapor_k13_user ON rapor_k13(user_id);
CREATE INDEX IF NOT EXISTS idx_rapor_k13_status ON rapor_k13(status);

-- 2. RAPOR AUDIT LOG
CREATE TABLE IF NOT EXISTS rapor_audit_log (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  rapor_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('create','update','finalize','unlock','print','edit_notes')),
  actor_id TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rapor_audit_rapor ON rapor_audit_log(rapor_id);
