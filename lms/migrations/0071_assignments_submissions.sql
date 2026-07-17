-- Migration 0071: Add missing columns to existing assignments/submissions tables
ALTER TABLE assignments ADD COLUMN lesson_id TEXT REFERENCES lessons(id) ON DELETE SET NULL;
ALTER TABLE assignments ADD COLUMN created_by TEXT REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE assignment_submissions ADD COLUMN notes TEXT;
