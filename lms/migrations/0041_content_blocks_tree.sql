-- Phase 1: Add tree columns to content_blocks
-- Additive only, zero downtime

ALTER TABLE content_blocks ADD COLUMN course_offering_id TEXT;
ALTER TABLE content_blocks ADD COLUMN course_id TEXT;
ALTER TABLE content_blocks ADD COLUMN parent_id TEXT;
ALTER TABLE content_blocks ADD COLUMN slug TEXT;
ALTER TABLE content_blocks ADD COLUMN subtitle TEXT;
ALTER TABLE content_blocks ADD COLUMN duration_min INTEGER NOT NULL DEFAULT 0;
ALTER TABLE content_blocks ADD COLUMN is_optional INTEGER NOT NULL DEFAULT 0;
ALTER TABLE content_blocks ADD COLUMN unlock_days INTEGER;
ALTER TABLE content_blocks ADD COLUMN weight REAL NOT NULL DEFAULT 0;
ALTER TABLE content_blocks ADD COLUMN due_date TEXT;
ALTER TABLE content_blocks ADD COLUMN source_id TEXT;

-- Indexes for tree queries
CREATE INDEX IF NOT EXISTS idx_cb_course_offering ON content_blocks(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_cb_course ON content_blocks(course_id);
CREATE INDEX IF NOT EXISTS idx_cb_parent ON content_blocks(parent_id);
CREATE INDEX IF NOT EXISTS idx_cb_offering_slug ON content_blocks(course_offering_id, slug);
CREATE INDEX IF NOT EXISTS idx_cb_offering_order ON content_blocks(course_offering_id, parent_id, order_index);
