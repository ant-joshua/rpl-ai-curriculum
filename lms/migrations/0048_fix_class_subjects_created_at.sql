-- 0048_fix_class_subjects_created_at.sql
-- Add missing created_at column to class_subjects table

ALTER TABLE class_subjects ADD COLUMN created_at TEXT DEFAULT (datetime('now'));
