-- Migration 0027: Assessment Questions pivot table
-- Links assessments to question_bank with ordering, points, and correct answer

CREATE TABLE IF NOT EXISTS assessment_questions (
    assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    points INTEGER DEFAULT 1,
    correct_answer TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (assessment_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_aq_assessment ON assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_aq_question ON assessment_questions(question_id);
