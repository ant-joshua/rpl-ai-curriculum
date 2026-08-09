-- 0108_direct_messages.sql
-- 1:1 direct messaging between any users (teacher<->student, teacher<->teacher, etc.)
-- Table-based conversation: any pair = conversation keyed by sender/recipient.

CREATE TABLE IF NOT EXISTS direct_messages (
	id TEXT PRIMARY KEY,
	tenant_id TEXT,
	sender_id TEXT NOT NULL,
	recipient_id TEXT NOT NULL,
	content TEXT NOT NULL,
	read_at TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id, created_at);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON direct_messages(recipient_id, read_at);
CREATE INDEX IF NOT EXISTS idx_direct_messages_pair ON direct_messages(sender_id, recipient_id);
