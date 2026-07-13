-- Migration 0025: Activity tracking for analytics
CREATE TABLE IF NOT EXISTS user_activity_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    metadata TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user ON user_activity_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON user_activity_log(action, created_at);
