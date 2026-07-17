-- Course Schedules for offering-level calendar events

CREATE TABLE IF NOT EXISTS course_schedules (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_time TEXT NOT NULL,
  end_time TEXT,
  location TEXT DEFAULT '',
  meeting_link TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cs_offering ON course_schedules(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_cs_start ON course_schedules(start_time);
