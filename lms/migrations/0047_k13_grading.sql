-- 0047_k13_grading.sql
-- Phase 3: K13 Grading system (PH, PTS, PAS, Keterampilan, Sikap, Ekstrakurikuler)

-- 1. PENGETAHUAN - PH (Penilaian Harian)
CREATE TABLE IF NOT EXISTS k13_ph (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_subject_id TEXT NOT NULL,
  kompetensi_dasar_id TEXT NOT NULL,
  title TEXT,
  score REAL NOT NULL CHECK(score >= 0 AND score <= 100),
  max_score REAL DEFAULT 100,
  remedial_score REAL,
  semester INTEGER NOT NULL,
  academic_year TEXT,
  graded_by TEXT,
  graded_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_k13_ph_user_cs ON k13_ph(user_id, class_subject_id);
CREATE INDEX IF NOT EXISTS idx_k13_ph_kd ON k13_ph(kompetensi_dasar_id);

-- 2. PTS (Penilaian Tengah Semester)
CREATE TABLE IF NOT EXISTS k13_pts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_subject_id TEXT NOT NULL,
  semester INTEGER NOT NULL,
  academic_year TEXT,
  score REAL NOT NULL CHECK(score >= 0 AND score <= 100),
  max_score REAL DEFAULT 100,
  remedial_score REAL,
  graded_by TEXT,
  graded_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, class_subject_id, semester)
);
CREATE INDEX IF NOT EXISTS idx_k13_pts_user_cs ON k13_pts(user_id, class_subject_id);

-- 3. PAS (Penilaian Akhir Semester)
CREATE TABLE IF NOT EXISTS k13_pas (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_subject_id TEXT NOT NULL,
  semester INTEGER NOT NULL,
  academic_year TEXT,
  score REAL NOT NULL CHECK(score >= 0 AND score <= 100),
  max_score REAL DEFAULT 100,
  remedial_score REAL,
  graded_by TEXT,
  graded_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, class_subject_id, semester)
);
CREATE INDEX IF NOT EXISTS idx_k13_pas_user_cs ON k13_pas(user_id, class_subject_id);

-- 4. KETERAMPILAN (praktik, produk, proyek, portofolio)
CREATE TABLE IF NOT EXISTS k13_skills (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_subject_id TEXT NOT NULL,
  kompetensi_dasar_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('praktik','produk','proyek','portofolio')),
  title TEXT,
  score REAL NOT NULL CHECK(score >= 0 AND score <= 100),
  max_score REAL DEFAULT 100,
  remedial_score REAL,
  semester INTEGER NOT NULL,
  academic_year TEXT,
  graded_by TEXT,
  graded_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_k13_skills_user_cs ON k13_skills(user_id, class_subject_id);
CREATE INDEX IF NOT EXISTS idx_k13_skills_kd ON k13_skills(kompetensi_dasar_id);

-- 5. SIKAP (KI-1 Spiritual, KI-2 Sosial)
CREATE TABLE IF NOT EXISTS k13_attitude (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  competence_type TEXT NOT NULL CHECK(competence_type IN ('spiritual','sosial')),
  semester INTEGER NOT NULL,
  academic_year TEXT,
  predikat TEXT NOT NULL CHECK(predikat IN ('SB','B','C','K')),
  deskripsi TEXT,
  graded_by TEXT,
  graded_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, class_id, competence_type, semester)
);

-- 6. EKSTRAKURIKULER
CREATE TABLE IF NOT EXISTS k13_extracurricular (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  predikat TEXT NOT NULL CHECK(predikat IN ('SB','B','C','K')),
  deskripsi TEXT,
  semester INTEGER NOT NULL,
  academic_year TEXT,
  academic_period_id TEXT,
  graded_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_k13_extracurricular_user ON k13_extracurricular(user_id);

-- 7. GRADE WEIGHTS CONFIGURATION
CREATE TABLE IF NOT EXISTS k13_weight_config (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'default',
  ph_weight REAL NOT NULL DEFAULT 0.6,
  pts_weight REAL NOT NULL DEFAULT 0.2,
  pas_weight REAL NOT NULL DEFAULT 0.2,
  a_threshold REAL NOT NULL DEFAULT 92,
  b_threshold REAL NOT NULL DEFAULT 84,
  c_threshold REAL NOT NULL DEFAULT 75,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
