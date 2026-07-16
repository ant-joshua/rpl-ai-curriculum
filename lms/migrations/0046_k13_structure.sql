-- 0046_k13_structure.sql
-- Phase 2: K13 School Structure for multi-tenant schools

-- 1. school_levels: SD, SMP, SMA, SMK, MA
CREATE TABLE IF NOT EXISTS school_levels (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  education_level TEXT DEFAULT 'menengah',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_school_levels_tenant ON school_levels(tenant_id);

-- 2. grade_levels: X, XI, XII or 1,2,3,4,5,6
CREATE TABLE IF NOT EXISTS grade_levels (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  school_level_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  semester_count INTEGER DEFAULT 2,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_grade_levels_tenant ON grade_levels(tenant_id);

-- 3. majors: IPA, IPS, RPL, AKL
CREATE TABLE IF NOT EXISTS majors (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  type TEXT DEFAULT 'umum',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_majors_tenant ON majors(tenant_id);

-- 4. classes: X IPA 1, XI RPL A, 3 SD A
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  grade_level_id TEXT NOT NULL,
  major_id TEXT,
  name TEXT NOT NULL,
  code TEXT,
  academic_period_id TEXT,
  homeroom_teacher_id TEXT,
  room TEXT,
  shift TEXT DEFAULT 'pagi',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_classes_tenant ON classes(tenant_id);

-- 5. class_members: students in classes
CREATE TABLE IF NOT EXISTS class_members (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'student',
  status TEXT DEFAULT 'active',
  nis TEXT,
  nisn TEXT,
  joined_at TEXT DEFAULT (datetime('now')),
  left_at TEXT,
  UNIQUE(class_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_class_members_tenant ON class_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_class_members_class ON class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_class_members_user ON class_members(user_id);

-- 6. subjects: Matematika Wajib, Bahasa Inggris, etc.
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  curriculum TEXT DEFAULT 'k13',
  type TEXT DEFAULT 'wajib',
  major_id TEXT,
  grade_level_id TEXT,
  group_name TEXT,
  description TEXT,
  min_hours_per_week INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subjects_tenant ON subjects(tenant_id);

-- 7. kompetensi_dasar: KD 3.1, 4.2, etc.
CREATE TABLE IF NOT EXISTS kompetensi_dasar (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  competence_type TEXT NOT NULL,
  description TEXT NOT NULL,
  grade_level_id TEXT,
  semester INTEGER,
  topics TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_kd_tenant ON kompetensi_dasar(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kd_subject ON kompetensi_dasar(subject_id);

-- 8. class_subjects: teacher assignment to class+subject
CREATE TABLE IF NOT EXISTS class_subjects (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  total_hours_per_week INTEGER,
  semester INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  kd_list TEXT,
  UNIQUE(class_id, subject_id, semester)
);

CREATE INDEX IF NOT EXISTS idx_class_subjects_tenant ON class_subjects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_teacher ON class_subjects(teacher_id);
