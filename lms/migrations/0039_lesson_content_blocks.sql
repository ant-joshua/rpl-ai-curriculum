-- Create lesson_content_blocks junction table for multi-block lesson content
CREATE TABLE IF NOT EXISTS lesson_content_blocks (
	id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
	lesson_id TEXT NOT NULL,
	content_block_id TEXT NOT NULL,
	order_index INTEGER NOT NULL DEFAULT 0,
	type_override TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
	FOREIGN KEY (content_block_id) REFERENCES content_blocks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lcb_lesson_id ON lesson_content_blocks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lcb_content_block_id ON lesson_content_blocks(content_block_id);
