-- 0054_attendance_system.sql
-- Attendance System: QR code, manual, face recognition hooks

-- 1. attendance_sessions: per-meeting session (QR-based)
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  session_type TEXT NOT NULL, -- class, exam, event
  class_subject_id TEXT,
  title TEXT NOT NULL,
  qr_code TEXT NOT NULL, -- unique QR token
  qr_expires_at TEXT,
  location_lat REAL,
  location_lng REAL,
  location_radius INTEGER DEFAULT 100, -- meters
  max_duration INTEGER DEFAULT 60, -- minutes
  status TEXT DEFAULT 'active', -- active, closed
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_att_sessions_tenant ON attendance_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_att_sessions_qr ON attendance_sessions(qr_code);
CREATE INDEX IF NOT EXISTS idx_att_sessions_class ON attendance_sessions(class_subject_id);

-- 2. attendance_records: per-student attendance
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  status TEXT NOT NULL, -- present, late, absent, excused
  check_in_time TEXT,
  check_out_time TEXT,
  method TEXT NOT NULL, -- qr, manual, face_recognition
  device_info TEXT,
  location_lat REAL,
  location_lng REAL,
  distance_meters REAL,
  notes TEXT,
  recorded_by TEXT, -- for manual entry
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_att_records_tenant ON attendance_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_att_records_session ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_att_records_student ON attendance_records(student_id);

-- 3. attendance_exceptions: approved absences (izin, sakit, cuti)
CREATE TABLE IF NOT EXISTS attendance_exceptions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  type TEXT NOT NULL, -- sick, leave, official, other
  reason TEXT,
  attachment_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  approved_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_att_exceptions_tenant ON attendance_exceptions(tenant_id);

-- 4. attendance_summary: pre-computed monthly summaries
CREATE TABLE IF NOT EXISTS attendance_summary (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  class_subject_id TEXT,
  academic_year TEXT,
  semester TEXT,
  total_sessions INTEGER DEFAULT 0,
  present INTEGER DEFAULT 0,
  late INTEGER DEFAULT 0,
  absent INTEGER DEFAULT 0,
  excused INTEGER DEFAULT 0,
  percentage REAL DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_att_summary_tenant ON attendance_summary(tenant_id);
CREATE INDEX IF NOT EXISTS idx_att_summary_student ON attendance_summary(student_id);
