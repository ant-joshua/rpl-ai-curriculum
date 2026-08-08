-- 0103_offering_class_id.sql
-- Course offerings can optionally be bound to a class (K13 path)
-- NULL = standalone (private / self-paced), set = bound to class

ALTER TABLE course_offerings ADD COLUMN class_id TEXT REFERENCES classes(id);

CREATE INDEX IF NOT EXISTS idx_offerings_class ON course_offerings(class_id);
