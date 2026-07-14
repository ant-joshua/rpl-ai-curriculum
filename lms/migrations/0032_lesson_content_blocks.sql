-- Add lesson_content_blocks junction table for multi-block lessons
-- Enables a single lesson to contain multiple content blocks (text, video, quiz, code)
-- while maintaining backward compatibility with lessons.content_block_id

CREATE TABLE IF NOT EXISTS lesson_content_blocks (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    content_block_id TEXT NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    type_override TEXT CHECK(type_override IN ('text','video','code','embed','image','quiz','file','slide','audio')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(lesson_id, content_block_id)
);

CREATE INDEX IF NOT EXISTS idx_lcb_lesson ON lesson_content_blocks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lcb_content_block ON lesson_content_blocks(content_block_id);
CREATE INDEX IF NOT EXISTS idx_lcb_order ON lesson_content_blocks(lesson_id, order_index);
