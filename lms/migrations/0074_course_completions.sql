-- Migration 0074: Course completions tracking
CREATE TABLE IF NOT EXISTS course_completions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  certificate_id TEXT REFERENCES certificates(id) ON DELETE SET NULL,
  UNIQUE(user_id, course_offering_id)
);

CREATE INDEX IF NOT EXISTS idx_course_completions_user ON course_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_course_completions_offering ON course_completions(course_offering_id);
