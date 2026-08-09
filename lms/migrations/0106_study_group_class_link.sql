-- 0106_study_group_class_link.sql
-- Link study_groups to classes: every class gets an auto-created study group
-- class_id nullable + UNIQUE: one group per class

ALTER TABLE study_groups ADD COLUMN class_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_groups_class ON study_groups(class_id) WHERE class_id IS NOT NULL;