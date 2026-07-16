-- 0051_university.sql
-- Phase 7: University module (faculty, prodi, KRS, grade, transcript)

CREATE TABLE IF NOT EXISTS faculties (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  dean_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS study_programs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  faculty_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  degree_type TEXT DEFAULT 's1',
  total_sks INTEGER DEFAULT 144,
  accreditation TEXT,
  kaprodi_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_study_programs_faculty ON study_programs(faculty_id);

CREATE TABLE IF NOT EXISTS academic_semesters (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  study_program_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('ganjil','genap','pendek')),
  year TEXT NOT NULL,
  is_active INTEGER DEFAULT 0,
  start_date TEXT,
  end_date TEXT,
  drop_deadline TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS course_catalog (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  study_program_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  sks INTEGER NOT NULL,
  sks_praktikum INTEGER DEFAULT 0,
  semester_level INTEGER,
  type TEXT DEFAULT 'wajib',
  kurikulum TEXT,
  prasyarat TEXT,
  deskripsi TEXT,
  learning_outcomes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_course_catalog_prodi ON course_catalog(study_program_id);

CREATE TABLE IF NOT EXISTS kelas_kuliah (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  course_catalog_id TEXT NOT NULL,
  academic_semester_id TEXT NOT NULL,
  code TEXT NOT NULL,
  dosen_id TEXT NOT NULL,
  schedule_json TEXT,
  max_students INTEGER,
  current_students INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_kelas_kuliah_semester ON kelas_kuliah(academic_semester_id);

CREATE TABLE IF NOT EXISTS krs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  academic_semester_id TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  total_sks INTEGER DEFAULT 0,
  ip_semester REAL,
  approved_by TEXT,
  approved_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_krs_user ON krs(user_id);
CREATE INDEX IF NOT EXISTS idx_krs_semester ON krs(academic_semester_id);
CREATE INDEX IF NOT EXISTS idx_krs_status ON krs(status);

CREATE TABLE IF NOT EXISTS krs_items (
  id TEXT PRIMARY KEY,
  krs_id TEXT NOT NULL,
  kelas_kuliah_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  dropped_at TEXT,
  grade_letter TEXT,
  grade_numeric REAL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(krs_id, kelas_kuliah_id)
);
CREATE INDEX IF NOT EXISTS idx_krs_items_krs ON krs_items(krs_id);

CREATE TABLE IF NOT EXISTS transcript_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  course_catalog_id TEXT NOT NULL,
  kelas_kuliah_id TEXT,
  academic_semester_id TEXT NOT NULL,
  grade_letter TEXT,
  grade_numeric REAL,
  sks INTEGER NOT NULL,
  is_remedial INTEGER DEFAULT 0,
  is_repeated INTEGER DEFAULT 0,
  graded_by TEXT,
  graded_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_transcript_user ON transcript_records(user_id);
CREATE INDEX IF NOT EXISTS idx_transcript_semester ON transcript_records(academic_semester_id);
