-- 0096_chat_lesson_context.sql
-- Add lesson_id to aiedu_chat_threads for lesson-contextual AI tutor
ALTER TABLE aiedu_chat_threads ADD COLUMN lesson_id TEXT REFERENCES lessons(id) ON DELETE SET NULL;

-- Store lesson content blocks as context text for quick access
ALTER TABLE aiedu_chat_threads ADD COLUMN lesson_context TEXT;
