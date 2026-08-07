-- Migration 0101: discussion upvotes/likes + role badges
CREATE TABLE IF NOT EXISTS discussion_likes (
  discussion_id TEXT NOT NULL REFERENCES lesson_discussions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (discussion_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_discussion_likes_user ON discussion_likes(user_id);