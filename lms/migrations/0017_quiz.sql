CREATE TABLE IF NOT EXISTS quiz_answers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  module_slug TEXT NOT NULL,
  session_id TEXT NOT NULL,
  question TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  correct INTEGER NOT NULL DEFAULT 0,
  answered_at TEXT NOT NULL DEFAULT (datetime('now'))
);
