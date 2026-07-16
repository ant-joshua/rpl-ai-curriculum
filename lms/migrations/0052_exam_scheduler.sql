-- 0052_exam_scheduler.sql
-- Exam Scheduler: jadwal ujian, ruangan, conflict detection

-- 1. exam_types: UTS, UAS, Quiz, Practical, Midterm, Final
CREATE TABLE IF NOT EXISTS exam_types (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  weight REAL DEFAULT 1.0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_exam_types_tenant ON exam_types(tenant_id);

-- 2. exam_rooms: ruangan ujian
CREATE TABLE IF NOT EXISTS exam_rooms (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  capacity INTEGER NOT NULL DEFAULT 40,
  building TEXT,
  floor INTEGER,
  facilities TEXT, -- JSON: ["AC","Proyektor","CCTV"]
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_exam_rooms_tenant ON exam_rooms(tenant_id);

-- 3. exams: jadwal ujian utama
CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  exam_type_id TEXT NOT NULL,
  subject_id TEXT,
  class_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  exam_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  room_id TEXT,
  proctor_id TEXT, -- teacher/guru id
  max_participants INTEGER,
  status TEXT DEFAULT 'draft', -- draft, published, ongoing, completed, cancelled
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_exams_tenant ON exams(tenant_id);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(tenant_id, exam_date);
CREATE INDEX IF NOT EXISTS idx_exams_room ON exams(room_id);
CREATE INDEX IF NOT EXISTS idx_exams_proctor ON exams(proctor_id);

-- 4. exam_room_assignments: many-to-many room assignments (one exam can use multiple rooms)
CREATE TABLE IF NOT EXISTS exam_room_assignments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  room_id TEXT NOT NULL,
  capacity_override INTEGER,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_era_tenant ON exam_room_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_era_exam ON exam_room_assignments(exam_id);

-- 5. exam_participants: siswa yang mengikuti ujian
CREATE TABLE IF NOT EXISTS exam_participants (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  room_id TEXT,
  seat_number INTEGER,
  status TEXT DEFAULT 'registered', -- registered, present, absent, excused
  score REAL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ep_tenant ON exam_participants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ep_exam ON exam_participants(exam_id);
CREATE INDEX IF NOT EXISTS idx_ep_student ON exam_participants(student_id);

-- 6. exam_conflicts: detected scheduling conflicts
CREATE TABLE IF NOT EXISTS exam_conflicts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  exam_id_1 TEXT NOT NULL,
  exam_id_2 TEXT NOT NULL,
  conflict_type TEXT NOT NULL, -- room_overlap, teacher_overlap, student_overlap
  conflict_detail TEXT,
  resolved INTEGER DEFAULT 0,
  resolved_at TEXT,
  resolved_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ec_tenant ON exam_conflicts(tenant_id);
