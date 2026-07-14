CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    issued_at TEXT DEFAULT (datetime('now')),
    metadata TEXT DEFAULT '{}',
    UNIQUE(user_id, course_offering_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_offering ON certificates(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);
