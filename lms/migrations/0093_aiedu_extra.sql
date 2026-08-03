-- AIEdu: chat guru threads, grade analysis history, rapor history
CREATE TABLE IF NOT EXISTS aiedu_chat_threads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Chat Baru',
  subject TEXT DEFAULT '',
  grade TEXT DEFAULT '',
  curriculum_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_aiedu_chat_user ON aiedu_chat_threads(user_id);

CREATE TABLE IF NOT EXISTS aiedu_chat_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES aiedu_chat_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_aiedu_chat_msg_thread ON aiedu_chat_messages(thread_id);

CREATE TABLE IF NOT EXISTS aiedu_analyses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subject TEXT DEFAULT '',
  grade TEXT DEFAULT '',
  curriculum_id TEXT,
  input JSON NOT NULL DEFAULT '{}',
  output TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_aiedu_analysis_user ON aiedu_analyses(user_id);

CREATE TABLE IF NOT EXISTS aiedu_rapors (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  subject TEXT DEFAULT '',
  grade TEXT DEFAULT '',
  curriculum_id TEXT,
  input JSON NOT NULL DEFAULT '{}',
  output TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_aiedu_rapor_user ON aiedu_rapors(user_id);
