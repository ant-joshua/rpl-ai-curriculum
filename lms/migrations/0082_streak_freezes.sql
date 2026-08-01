-- Streak Freeze: users earn freezes for maintaining streaks, use them to protect streaks
CREATE TABLE IF NOT EXISTS user_streak_freezes (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL,
	quantity INTEGER NOT NULL DEFAULT 0,
	used_at TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE (user_id)
);
CREATE INDEX IF NOT EXISTS idx_streak_freezes_user ON user_streak_freezes(user_id);
