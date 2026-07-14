-- Migration 0028: Search indexes for LIKE-based full-text search
-- Adds indexes on searched text columns for performance

-- Courses: search title + description
CREATE INDEX IF NOT EXISTS idx_courses_title ON courses(title);
CREATE INDEX IF NOT EXISTS idx_courses_description ON courses(description);

-- Course offerings: search name + code
CREATE INDEX IF NOT EXISTS idx_co_name ON course_offerings(name);
CREATE INDEX IF NOT EXISTS idx_co_code ON course_offerings(code);

-- Lessons: search title
CREATE INDEX IF NOT EXISTS idx_lessons_title ON lessons(title);

-- Content blocks: search body_html
CREATE INDEX IF NOT EXISTS idx_cb_body_html ON content_blocks(body_html);
