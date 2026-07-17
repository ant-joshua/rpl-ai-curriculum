-- Migration 0070: Lesson completion tracking
CREATE TABLE IF NOT EXISTS lesson_completions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_lc_user ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lc_lesson ON lesson_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lc_offering ON lesson_completions(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_lc_completed ON lesson_completions(completed_at);
