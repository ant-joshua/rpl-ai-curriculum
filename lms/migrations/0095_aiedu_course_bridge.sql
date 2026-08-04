-- AIEdu ↔ Courses: link generated docs to lessons
CREATE TABLE IF NOT EXISTS lesson_aiedu_docs (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    document_id TEXT NOT NULL REFERENCES aiedu_documents(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(lesson_id, document_id)
);
CREATE INDEX IF NOT EXISTS idx_lad_lesson ON lesson_aiedu_docs(lesson_id);

-- Soal imports: track which question bank entries came from generated soal
ALTER TABLE question_bank ADD COLUMN source_doc_id TEXT REFERENCES aiedu_documents(id);
ALTER TABLE question_bank ADD COLUMN imported_by TEXT REFERENCES users(id);
