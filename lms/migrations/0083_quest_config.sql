-- Quest config: admin overrides for daily quest targets + XP rewards
CREATE TABLE IF NOT EXISTS quest_config (
	quest_key TEXT PRIMARY KEY,
	target INTEGER NOT NULL,
	xp_reward INTEGER NOT NULL,
	enabled INTEGER NOT NULL DEFAULT 1,
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed with defaults (match the hardcoded questDefs in the API)
INSERT OR IGNORE INTO quest_config (quest_key, target, xp_reward, enabled) VALUES
	('complete_lessons', 2, 30, 1),
	('earn_xp', 50, 40, 1),
	('practice', 1, 20, 1),
	('streak', 3, 25, 1);
