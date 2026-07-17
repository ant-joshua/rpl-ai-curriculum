-- Migration 0064: Course chat / live chat table
-- Polling-based real-time chat for courses

CREATE TABLE IF NOT EXISTS course_chat (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_course_chat_offering_created ON course_chat(course_offering_id, created_at);
