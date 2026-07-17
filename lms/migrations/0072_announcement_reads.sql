-- Migration 0072: Announcement reads tracking
CREATE TABLE IF NOT EXISTS announcement_reads (
  id TEXT PRIMARY KEY,
  announcement_id TEXT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_reads_user ON announcement_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement ON announcement_reads(announcement_id);
