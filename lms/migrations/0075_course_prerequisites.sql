-- Course Prerequisites for chaining courses
-- Allows setting prerequisites that must be completed before enrolling

CREATE TABLE IF NOT EXISTS course_prerequisites (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  prerequisite_course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(course_id, prerequisite_course_id)
);

CREATE INDEX IF NOT EXISTS idx_cp_course_id ON course_prerequisites(course_id);
CREATE INDEX IF NOT EXISTS idx_cp_prereq ON course_prerequisites(prerequisite_course_id);
