-- AIEdu: kurikulum document bank + generation history
CREATE TABLE IF NOT EXISTS aiedu_documents (
  id TEXT PRIMARY KEY,
  doc_type TEXT NOT NULL,            -- cp | atp | modul_ajar | lkpd | soal | rubrik | ppt | buku_guru | buku_siswa | panduan_asesmen | panduan_projek
  subject TEXT NOT NULL,             -- mapel
  title TEXT NOT NULL,
  content TEXT,                      -- markdown / text
  file_url TEXT,
  source TEXT DEFAULT 'seed',        -- seed | generated | upload
  tags TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_aiedu_docs_type ON aiedu_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_aiedu_docs_subject ON aiedu_documents(subject);

CREATE TABLE IF NOT EXISTS aiedu_generations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  subject TEXT,
  input TEXT,                        -- prompt context
  output TEXT,                       -- generated markdown
  status TEXT NOT NULL DEFAULT 'done',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_aiedu_gen_user ON aiedu_generations(user_id);
