-- Migration 0034: Study Planner
-- Drop old planner tables from 0005 (unused schema)
DROP TABLE IF EXISTS plan_progress;
DROP TABLE IF EXISTS study_plans;

CREATE TABLE IF NOT EXISTS study_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_offering_id TEXT NOT NULL,
  target_lessons_per_week INTEGER NOT NULL DEFAULT 3,
  start_week TEXT NOT NULL,
  daily_reminder INTEGER NOT NULL DEFAULT 0,
  reminder_time TEXT DEFAULT '09:00',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, course_offering_id)
);

CREATE INDEX IF NOT EXISTS idx_study_plans_user ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_offering ON study_plans(course_offering_id);
