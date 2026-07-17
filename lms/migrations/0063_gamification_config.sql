-- Migration 0063: Gamification config — XP rules, settings, badge xp_reward

-- XP rules: configurable points per action type
CREATE TABLE IF NOT EXISTS xp_rules (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL UNIQUE CHECK(action_type IN ('lesson_complete','daily_login','assignment_graded','assessment_completed','discussion_post','streak_milestone','custom')),
  xp_amount INTEGER NOT NULL DEFAULT 10,
  description TEXT DEFAULT '',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Gamification settings: level thresholds, leaderboard config
CREATE TABLE IF NOT EXISTS gamification_settings (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Seed default XP rules
INSERT OR IGNORE INTO xp_rules (id, action_type, xp_amount, description) VALUES
  ('xp_rule_lesson', 'lesson_complete', 10, 'Menyelesaikan satu pelajaran'),
  ('xp_rule_login', 'daily_login', 5, 'Login harian'),
  ('xp_rule_assignment', 'assignment_graded', 25, 'Tugas dinilai'),
  ('xp_rule_assessment', 'assessment_completed', 20, 'Menyelesaikan assessment'),
  ('xp_rule_discussion', 'discussion_post', 5, 'Posting diskusi'),
  ('xp_rule_streak', 'streak_milestone', 20, 'Bonus streak');

-- Seed default settings
INSERT OR IGNORE INTO gamification_settings (id, key, value) VALUES
  ('gs_leaderboard', 'leaderboard', '{"topCount":20,"periodFilter":"all","showGlobal":true}'),
  ('gs_levels', 'level_thresholds', '{"xpPerLevel":100,"maxLevel":100}');

-- Add xp_reward column to badges
ALTER TABLE badges ADD COLUMN xp_reward INTEGER DEFAULT 0;

-- Add badges as configurable (unlocked_at only for seeded badges column — just keep column check)
-- Note: badges table already has created_at
