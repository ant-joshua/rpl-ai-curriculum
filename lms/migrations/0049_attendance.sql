-- 0049_attendance.sql
-- Phase 5: Attendance tracking system

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  subject_id TEXT,
  status TEXT NOT NULL CHECK(status IN ('hadir','sakit','izin','alpha','dispensasi','terlambat')),
  time_in TEXT,
  minutes_late INTEGER DEFAULT 0,
  reason TEXT,
  documented_by TEXT,
  recorded_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(class_id, user_id, date, subject_id)
);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance(class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

CREATE TABLE IF NOT EXISTS attendance_recaps (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  academic_period_id TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_hadir INTEGER DEFAULT 0,
  total_sakit INTEGER DEFAULT 0,
  total_izin INTEGER DEFAULT 0,
  total_alpha INTEGER DEFAULT 0,
  total_dispensasi INTEGER DEFAULT 0,
  total_terlambat INTEGER DEFAULT 0,
  percentage REAL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, academic_period_id, month, year)
);
CREATE INDEX IF NOT EXISTS idx_att_recaps_user ON attendance_recaps(user_id);
CREATE INDEX IF NOT EXISTS idx_att_recaps_period ON attendance_recaps(academic_period_id);
