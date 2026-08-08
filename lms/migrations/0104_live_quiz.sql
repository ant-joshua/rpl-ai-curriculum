-- 0104_live_quiz.sql
-- Real-time classroom quiz (polling-based, CF Pages compatible)
-- Teacher hosts from question_bank, students join via 6-digit PIN

CREATE TABLE IF NOT EXISTS live_quizzes (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pin TEXT NOT NULL UNIQUE,                    -- 6-digit join code
  status TEXT NOT NULL DEFAULT 'lobby' CHECK(status IN ('lobby','running','finished')),
  question_ids TEXT NOT NULL DEFAULT '[]',     -- JSON array of question_bank ids
  question_times TEXT NOT NULL DEFAULT '[]',   -- JSON array of per-question seconds
  current_index INTEGER NOT NULL DEFAULT -1,   -- -1 = lobby
  question_started_at TEXT,
  shuffled_questions INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_lq_offering ON live_quizzes(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_lq_pin ON live_quizzes(pin);

CREATE TABLE IF NOT EXISTS live_quiz_participants (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES live_quizzes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  answered INTEGER NOT NULL DEFAULT 0,
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(quiz_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_lqp_quiz ON live_quiz_participants(quiz_id);

CREATE TABLE IF NOT EXISTS live_quiz_responses (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES live_quizzes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  answer TEXT,                                  -- JSON: selected option / text answer
  is_correct INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  response_time_ms INTEGER,                     -- ms from question start
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(quiz_id, user_id, question_index)
);
CREATE INDEX IF NOT EXISTS idx_lqr_quiz ON live_quiz_responses(quiz_id);
