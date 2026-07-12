CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_slug TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  result TEXT,
  passed INTEGER DEFAULT 0,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_exercise ON submissions(exercise_slug);
