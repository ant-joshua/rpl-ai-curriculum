-- Course certificates of completion
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  cert_number TEXT UNIQUE NOT NULL,          -- public verify code e.g. RPL-2026-XXXXXX
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  issued_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  metadata TEXT                              -- JSON: course_title, user_name snapshot
);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_offering ON certificates(course_offering_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_user_offering ON certificates(user_id, course_offering_id);

-- Course Q&A forum
CREATE TABLE IF NOT EXISTS course_questions (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  is_resolved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_course_questions_offering ON course_questions(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_course_questions_user ON course_questions(user_id);

CREATE TABLE IF NOT EXISTS course_answers (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES course_questions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_best INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_course_answers_question ON course_answers(question_id);
