CREATE TABLE IF NOT EXISTS capstone_projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  path_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  repo_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  mentor_id TEXT,
  score INTEGER,
  feedback TEXT,
  submitted_at TEXT,
  graded_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
