CREATE TABLE IF NOT EXISTS project_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_slug TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  completed_steps TEXT NOT NULL DEFAULT '[]',
  code_state TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  UNIQUE(user_id, project_slug)
);
CREATE TABLE IF NOT EXISTS project_completions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
