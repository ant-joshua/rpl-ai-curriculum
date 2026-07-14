-- Migration 0033: Add featured flag to courses
ALTER TABLE courses ADD COLUMN featured INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
