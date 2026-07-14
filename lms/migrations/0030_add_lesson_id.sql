-- 0030_add_lesson_id.sql
-- Add lesson_id to notes and bookmarks for direct FK association.
-- (ALTER TABLE ADD COLUMN in SQLite cannot add constraints — FK is semantic only)

ALTER TABLE notes ADD COLUMN lesson_id TEXT;
ALTER TABLE bookmarks ADD COLUMN lesson_id TEXT;

CREATE INDEX IF NOT EXISTS idx_notes_lesson_id ON notes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_lesson_id ON bookmarks(lesson_id);
