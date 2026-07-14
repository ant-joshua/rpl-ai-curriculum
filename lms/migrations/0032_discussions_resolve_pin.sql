-- Migration 0032: Add is_resolved to discussion_threads, is_instructor_reply to discussion_replies
ALTER TABLE discussion_threads ADD COLUMN is_resolved INTEGER DEFAULT 0;
ALTER TABLE discussion_replies ADD COLUMN is_instructor_reply INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_discussion_threads_resolved ON discussion_threads(is_resolved);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_instructor ON discussion_replies(is_instructor_reply);
