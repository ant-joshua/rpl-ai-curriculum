-- Migration 0020: OAuth users, sessions, and admin content
CREATE TABLE IF NOT EXISTS oauth_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  device_ids TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'oauth',
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_content (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_users_provider ON oauth_users(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_oauth_users_email ON oauth_users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_content_type ON admin_content(type);
CREATE INDEX IF NOT EXISTS idx_admin_content_key ON admin_content(key);
