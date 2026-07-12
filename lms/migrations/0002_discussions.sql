CREATE TABLE IF NOT EXISTS discussions (
  id TEXT PRIMARY KEY,
  module_slug TEXT NOT NULL,
  session_id TEXT,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_discussions_module ON discussions(module_slug);
CREATE INDEX IF NOT EXISTS idx_discussions_session ON discussions(session_id);
