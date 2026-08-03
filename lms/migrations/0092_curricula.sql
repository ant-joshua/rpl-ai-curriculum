-- Curricula table: distinguish curriculum used per course (Merdeka, K13, IB, custom school/institution)
CREATE TABLE IF NOT EXISTS curricula (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'merdeka' CHECK(type IN ('merdeka','k13','ib','cambridge','sekolah','institusi','custom')),
  description TEXT DEFAULT '',
  authority TEXT NOT NULL DEFAULT 'kemdikbud' CHECK(authority IN ('kemdikbud','sekolah','institusi','internasional')),
  is_default INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed defaults
INSERT OR IGNORE INTO curricula (id, name, slug, type, description, authority, is_default, metadata) VALUES
('cur-merdeka', 'Kurikulum Merdeka', 'kurikulum-merdeka', 'merdeka', 'Kurikulum Merdeka Kemendikbudristek — CP, ATP, P5', 'kemdikbud', 1,
 '{"phases":["A","B","C","D","E","F"],"structure":"cp-atp-modul-ajar-lkpd-soal-rubrik","has_p5":true}'),
('cur-k13', 'Kurikulum 2013', 'kurikulum-2013', 'k13', 'Kurikulum 2013 — KI/KD, silabus, RPP', 'kemdikbud', 0,
 '{"structure":"ki-kd-silabus-rpp","has_p5":false}'),
('cur-cambridge', 'Cambridge International', 'cambridge-international', 'cambridge', 'Cambridge International Curriculum — IGCSE/A-Level', 'internasional', 0,
 '{"structure":"syllabus-exam","has_p5":false}'),
('cur-sekolah', 'Kurikulum Sekolah (Custom)', 'kurikulum-sekolah', 'sekolah', 'Kurikulum khas sekolah — bisa custom CP/ATP sendiri', 'sekolah', 0,
 '{"structure":"custom","has_p5":false}'),
('cur-institusi', 'Kurikulum Institusi (Private)', 'kurikulum-institusi', 'institusi', 'Kurikulum institusi/private — proprietary, sesuai standar lembaga', 'institusi', 0,
 '{"structure":"custom","has_p5":false}');

-- Link curricula to courses/offerings/documents
ALTER TABLE courses ADD COLUMN curriculum_id TEXT REFERENCES curricula(id);
ALTER TABLE course_offerings ADD COLUMN curriculum_id TEXT REFERENCES curricula(id);
ALTER TABLE aiedu_documents ADD COLUMN curriculum_id TEXT REFERENCES curricula(id);
