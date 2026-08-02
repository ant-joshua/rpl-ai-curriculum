-- Course bundles (buy multiple courses at once)
CREATE TABLE IF NOT EXISTS bundles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,        -- discounted bundle price (IDR)
  original_price INTEGER,                  -- sum of course prices
  cover_icon TEXT DEFAULT '📦',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bundle_items (
  id TEXT PRIMARY KEY,
  bundle_id TEXT NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  UNIQUE(bundle_id, course_offering_id)
);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items(bundle_id);

-- Lesson resources (attachments per lesson, Udemy-style)
CREATE TABLE IF NOT EXISTS lesson_resources (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT DEFAULT 'file',           -- pdf | zip | code | link
  file_size INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id);

-- Instructor public profile extension (columns added via separate ALTER, D1 lacks IF NOT EXISTS)
