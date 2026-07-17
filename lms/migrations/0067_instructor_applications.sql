-- Instructor Applications table
-- Allows instructors to self-register and admins to approve/reject

CREATE TABLE IF NOT EXISTS instructor_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_offering_id TEXT REFERENCES course_offerings(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  bio TEXT DEFAULT '',
  course_interests TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ia_user ON instructor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_ia_status ON instructor_applications(status);
CREATE INDEX IF NOT EXISTS idx_ia_offering ON instructor_applications(course_offering_id);
