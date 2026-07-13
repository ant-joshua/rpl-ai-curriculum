-- Migration 0022: Discussion forums
CREATE TABLE IF NOT EXISTS discussion_threads (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_pinned INTEGER DEFAULT 0,
    is_locked INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS discussion_replies (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    parent_id TEXT REFERENCES discussion_replies(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_discussion_threads_lesson ON discussion_threads(lesson_id);
CREATE INDEX idx_discussion_replies_thread ON discussion_replies(thread_id);
