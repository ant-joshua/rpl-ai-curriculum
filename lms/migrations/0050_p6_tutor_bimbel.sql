-- 0050_p6_tutor_bimbel.sql
-- Phase 6: Private Tutor + Bimbel modules

-- ===== PRIVATE TUTOR =====

CREATE TABLE IF NOT EXISTS learning_packages (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('privat_sessions','bimbel_batch','kelompok_kecil','langganan','paket_tryout')),
  duration_sessions INTEGER,
  duration_days INTEGER,
  price REAL,
  max_students INTEGER,
  subjects TEXT,
  includes_tryout INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS batch_enrollments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  batch_id TEXT,
  user_id TEXT NOT NULL,
  package_id TEXT,
  enrollment_date TEXT DEFAULT (datetime('now')),
  paid_amount REAL,
  payment_status TEXT DEFAULT 'pending',
  remaining_sessions INTEGER,
  status TEXT DEFAULT 'active',
  UNIQUE(batch_id, user_id)
);

CREATE TABLE IF NOT EXISTS tutoring_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  batch_id TEXT,
  tutor_id TEXT NOT NULL,
  student_id TEXT,
  type TEXT NOT NULL CHECK(type IN ('privat_1on1','bimbel_kelas','kelompok_kecil','online','tryout')),
  title TEXT,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_minutes INTEGER,
  room TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  materials TEXT,
  homework JSON,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_tutor ON tutoring_sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_date ON tutoring_sessions(date);

CREATE TABLE IF NOT EXISTS session_attendance (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  time_in TEXT,
  minutes_late INTEGER DEFAULT 0,
  recorded_by TEXT,
  UNIQUE(session_id, user_id)
);

CREATE TABLE IF NOT EXISTS session_progress (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  topic_covered TEXT,
  understanding_level TEXT CHECK(understanding_level IN ('paham','cukup','kurang','tidak_paham')),
  notes TEXT,
  next_session_plan TEXT,
  homework_given TEXT,
  homework_completed INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS billing_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  package_id TEXT,
  batch_id TEXT,
  invoice_number TEXT UNIQUE,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  discount REAL DEFAULT 0,
  total REAL NOT NULL,
  status TEXT DEFAULT 'unpaid',
  due_date TEXT,
  paid_at TEXT,
  payment_method TEXT,
  payment_proof TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_billing_user ON billing_records(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing_records(status);

-- ===== BIMBEL =====

CREATE TABLE IF NOT EXISTS tryout_batches (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  batch_id TEXT,
  title TEXT,
  date TEXT,
  duration_minutes INTEGER DEFAULT 180,
  question_count INTEGER DEFAULT 100,
  subjects TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tryout_participants (
  id TEXT PRIMARY KEY,
  tryout_batch_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  session_id TEXT,
  total_score REAL,
  rank INTEGER,
  subject_scores TEXT,
  status TEXT DEFAULT 'registered',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_to_participants_batch ON tryout_participants(tryout_batch_id);

CREATE TABLE IF NOT EXISTS tryout_analysis (
  id TEXT PRIMARY KEY,
  tryout_batch_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  skip_count INTEGER DEFAULT 0,
  difficulty_index REAL,
  discrimination_index REAL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_to_analysis_batch ON tryout_analysis(tryout_batch_id);
