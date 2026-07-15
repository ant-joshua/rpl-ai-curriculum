-- Migration 0044: SBMPTN Mock Try Out sessions and answers
-- Tracks full-length tryout attempts with timed sessions

CREATE TABLE IF NOT EXISTS tryout_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_offering_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  submitted_at TEXT,
  time_limit_minutes INTEGER DEFAULT 180,
  status TEXT DEFAULT 'active', -- active|submitted|expired
  questions_json TEXT, -- JSON array of full question objects (needed for offline scoring display)
  score_total REAL,
  score_tps REAL,
  score_literasi REAL,
  score_matematika REAL,
  answers_count INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 100,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tryout_answers (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  selected_answer TEXT, -- e.g. "A", "B", "C", "D", "E" or null if not answered
  is_correct INTEGER DEFAULT 0,
  answered_at TEXT,
  time_spent_seconds INTEGER
);

CREATE INDEX IF NOT EXISTS idx_tryout_sessions_user ON tryout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tryout_sessions_offering ON tryout_sessions(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_tryout_answers_session ON tryout_answers(session_id);
