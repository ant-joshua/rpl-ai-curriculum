-- Media Files table for R2 asset management
-- Stores metadata for files uploaded to Cloudflare R2

CREATE TABLE IF NOT EXISTS media_files (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size INTEGER NOT NULL DEFAULT 0,
  url TEXT NOT NULL,
  key TEXT NOT NULL,
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE SET NULL,
  course_offering_id TEXT REFERENCES course_offerings(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mf_uploaded_by ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_mf_lesson ON media_files(lesson_id);
CREATE INDEX IF NOT EXISTS idx_mf_offering ON media_files(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_mf_mime ON media_files(mime_type);
CREATE INDEX IF NOT EXISTS idx_mf_created ON media_files(created_at);
