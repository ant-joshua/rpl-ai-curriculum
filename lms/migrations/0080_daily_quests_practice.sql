-- Daily quests + practice review system
-- Quests: daily goals with XP rewards, claimed state per day
CREATE TABLE IF NOT EXISTS daily_quests (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL,
	quest_date TEXT NOT NULL,           -- YYYY-MM-DD
	quest_key TEXT NOT NULL,            -- 'complete_lessons' | 'earn_xp' | 'practice' | 'streak'
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	target INTEGER NOT NULL DEFAULT 1,
	progress INTEGER NOT NULL DEFAULT 0,
	xp_reward INTEGER NOT NULL DEFAULT 20,
	claimed INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE (user_id, quest_date, quest_key)
);
CREATE INDEX IF NOT EXISTS idx_daily_quests_user_date ON daily_quests(user_id, quest_date);

-- Practice review queue: questions answered wrong, shown again until mastered
CREATE TABLE IF NOT EXISTS practice_queue (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL,
	block_id TEXT NOT NULL,             -- content block id (quiz/fillblank/matching/truefalse)
	question_ref TEXT,                  -- JSON pointer to specific question within block
	prompt TEXT NOT NULL,               -- cached question text
	correct_answer TEXT NOT NULL,       -- cached correct answer
	last_wrong_at TEXT NOT NULL DEFAULT (datetime('now')),
	wrong_count INTEGER NOT NULL DEFAULT 1,
	mastered INTEGER NOT NULL DEFAULT 0, -- 1 = answered correctly, removed from practice
	practiced_count INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE (user_id, block_id, question_ref)
);
CREATE INDEX IF NOT EXISTS idx_practice_queue_user ON practice_queue(user_id, mastered, last_wrong_at);
