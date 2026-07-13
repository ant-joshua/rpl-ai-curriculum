-- Migration 0022: Gradebook
CREATE TABLE IF NOT EXISTS assessment_submissions (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','graded','returned')),
    answers TEXT,  -- JSON array of answers
    score REAL,
    max_score REAL,
    graded_by TEXT REFERENCES users(id),
    graded_at TEXT,
    feedback TEXT,
    submitted_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id TEXT PRIMARY KEY,
    assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','graded','returned')),
    submission_text TEXT,
    file_urls TEXT,  -- JSON array
    score REAL,
    max_score REAL,
    graded_by TEXT REFERENCES users(id),
    graded_at TEXT,
    feedback TEXT,
    submitted_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gradebook (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    assessment_submission_id TEXT REFERENCES assessment_submissions(id),
    assignment_submission_id TEXT REFERENCES assignment_submissions(id),
    score REAL,
    max_score REAL,
    weight REAL DEFAULT 1.0,
    graded_by TEXT REFERENCES users(id),
    graded_at TEXT,
    feedback TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_gradebook_user_offering ON gradebook(user_id, course_offering_id);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_assessment ON assessment_submissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
