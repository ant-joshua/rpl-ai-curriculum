-- Admin view: quest completion stats (no new tables — read from daily_quests)
-- Index already exists on (user_id, quest_date). Add date-only index for admin queries.
CREATE INDEX IF NOT EXISTS idx_daily_quests_date ON daily_quests(quest_date);
