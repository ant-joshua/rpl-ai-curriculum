-- Migration 0069: Enrollment activity logs
CREATE TABLE IF NOT EXISTS enrollment_logs (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT REFERENCES enrollments(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_enrollment_logs_user ON enrollment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_logs_offering ON enrollment_logs(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_logs_created ON enrollment_logs(created_at);
