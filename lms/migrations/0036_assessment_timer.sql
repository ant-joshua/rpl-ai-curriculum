-- Migration 0036: Assessment timer support
-- Add started_at column to track when user began an assessment attempt

ALTER TABLE assessment_submissions ADD COLUMN started_at TEXT;

CREATE INDEX IF NOT EXISTS idx_assessment_submissions_user_assessment
    ON assessment_submissions(user_id, assessment_id);
