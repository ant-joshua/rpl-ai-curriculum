-- Migration 0073: Lesson discussions (simple comment system)
CREATE TABLE IF NOT EXISTS lesson_discussions (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id TEXT REFERENCES lesson_discussions(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_lesson_discussions_lesson ON lesson_discussions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_discussions_parent ON lesson_discussions(parent_id);
CREATE INDEX IF NOT EXISTS idx_lesson_discussions_offering ON lesson_discussions(course_offering_id);
