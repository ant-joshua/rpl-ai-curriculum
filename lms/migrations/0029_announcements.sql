-- Migration 0029: Course Announcements (admin broadcast)
CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK(priority IN ('low','normal','high','urgent')),
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_announcements_offering ON announcements(course_offering_id);
CREATE INDEX idx_announcements_created ON announcements(created_at DESC);
