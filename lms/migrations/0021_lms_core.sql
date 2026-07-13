-- ============================================
-- Migration 0021: LMS Core — Course Architecture
-- ============================================

-- Upgrade users table with role + profile fields
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('superadmin','admin','instructor','ta','student'));
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  icon TEXT DEFAULT '📚',
  cover_image TEXT,
  category TEXT DEFAULT '',
  level TEXT NOT NULL DEFAULT 'beginner' CHECK(level IN ('beginner','intermediate','advanced')),
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_level ON courses(level);

CREATE TABLE IF NOT EXISTS course_offerings (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  instructor_id TEXT REFERENCES users(id),
  start_date TEXT,
  end_date TEXT,
  enrollment_start TEXT,
  enrollment_end TEXT,
  max_students INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','active','archived','completed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_co_course ON course_offerings(course_id);
CREATE INDEX idx_co_instructor ON course_offerings(instructor_id);
CREATE INDEX idx_co_status ON course_offerings(status);

CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student','ta','auditor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','dropped','completed','pending')),
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  dropped_at TEXT,
  completed_at TEXT,
  final_grade TEXT,
  final_score REAL,
  UNIQUE(user_id, course_offering_id)
);
CREATE INDEX idx_enroll_user ON enrollments(user_id);
CREATE INDEX idx_enroll_offering ON enrollments(course_offering_id);
CREATE INDEX idx_enroll_status ON enrollments(status);

CREATE TABLE IF NOT EXISTS content_blocks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('text','video','code','embed','image','quiz','assignment_placeholder','file','slide','audio')),
  title TEXT DEFAULT '',
  body TEXT,
  body_html TEXT,
  meta TEXT DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  visibility TEXT NOT NULL DEFAULT 'published' CHECK(visibility IN ('draft','published','archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_cb_type ON content_blocks(type);
CREATE INDEX idx_cb_visibility ON content_blocks(visibility);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  content_block_id TEXT REFERENCES content_blocks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  is_optional INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  unlock_days INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(course_offering_id, slug)
);
CREATE INDEX idx_lessons_offering ON lessons(course_offering_id);
CREATE INDEX idx_lessons_order ON lessons(course_offering_id, order_index);

CREATE TABLE IF NOT EXISTS question_bank (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT REFERENCES course_offerings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('multiple_choice','essay','code','true_false','short_answer')),
  question TEXT NOT NULL,
  options TEXT DEFAULT '[]',
  code_template TEXT,
  test_cases TEXT DEFAULT '[]',
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK(difficulty IN ('easy','medium','hard')),
  tags TEXT DEFAULT '',
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft','published','archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_qb_offering ON question_bank(course_offering_id);
CREATE INDEX idx_qb_type ON question_bank(type);
CREATE INDEX idx_qb_difficulty ON question_bank(difficulty);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  content_block_id TEXT REFERENCES content_blocks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('quiz','midterm','final','practice','exercise')),
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes INTEGER,
  shuffle_questions INTEGER NOT NULL DEFAULT 1,
  show_results INTEGER NOT NULL DEFAULT 1,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  weight REAL NOT NULL DEFAULT 0,
  questions TEXT NOT NULL DEFAULT '[]',
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_assess_offering ON assessments(course_offering_id);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  content_block_id TEXT REFERENCES content_blocks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  submission_type TEXT NOT NULL CHECK(submission_type IN ('file','code','text','link','github')),
  max_score INTEGER NOT NULL DEFAULT 100,
  weight REAL NOT NULL DEFAULT 0,
  due_date TEXT,
  allow_late_submission INTEGER NOT NULL DEFAULT 0,
  late_penalty_percent REAL DEFAULT 10,
  rubric TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_assign_offering ON assignments(course_offering_id);

CREATE TABLE IF NOT EXISTS prerequisites (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  prerequisite_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  dependent_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE(prerequisite_id, dependent_id)
);
CREATE INDEX idx_prereq_offering ON prerequisites(course_offering_id);
CREATE INDEX idx_prereq_dependent ON prerequisites(dependent_id);

CREATE TABLE IF NOT EXISTS academic_periods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('semester','trimester','quarter','year','custom')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT REFERENCES course_offerings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('class','exam','assignment','holiday','office_hours','other')),
  all_day INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_cal_offering ON calendar_events(course_offering_id);
CREATE INDEX idx_cal_date ON calendar_events(event_date);
