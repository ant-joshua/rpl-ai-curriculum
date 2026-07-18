-- Migration #0077: TOTP 2FA
-- Add TOTP columns to users table
ALTER TABLE users ADD COLUMN totp_secret TEXT;
ALTER TABLE users ADD COLUMN totp_verified INTEGER NOT NULL DEFAULT 0;

-- Temp sessions table for 2FA challenge flow
CREATE TABLE IF NOT EXISTS temp_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
