-- Migration 0035: Grade Weight Configuration
-- Adds configurable per-type weight system + percentage/letter_grade columns

ALTER TABLE course_offerings ADD COLUMN grade_weight_config TEXT;

ALTER TABLE gradebook ADD COLUMN percentage REAL;
ALTER TABLE gradebook ADD COLUMN letter_grade TEXT;
