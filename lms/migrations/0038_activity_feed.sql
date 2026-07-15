-- Migration 0038: Activity Feed — log student actions for timeline display

CREATE TABLE IF NOT EXISTS activity_feed (
  id TEXT PRIMARY KEY,
  offering_id TEXT,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- lesson_complete, assignment_submit, discussion_post, enrolled, certificate_earned, assessment_done
  description TEXT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  metadata TEXT, -- JSON blob for extra data (lesson titles, assignment names, etc.)
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_activity_offering ON activity_feed(offering_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_feed(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_feed(activity_type);
