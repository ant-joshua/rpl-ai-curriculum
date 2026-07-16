-- 0057_report_card_generator.sql
-- Report Cards / Rapor Generator: bulk PDF generation, per-semester

-- 1. report_card_templates: rapor templates per education level
CREATE TABLE IF NOT EXISTS report_card_templates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  education_level TEXT NOT NULL, -- sd, smp, sma, smk, university
  template_type TEXT NOT NULL, -- k13, kurikulum_merdeka, semester
  html_template TEXT NOT NULL, -- base HTML/CSS template
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rpt_templates_tenant ON report_card_templates(tenant_id);

-- 2. report_card_batches: batch generation jobs
CREATE TABLE IF NOT EXISTS report_card_batches (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  template_id TEXT,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  grade_level_id TEXT,
  class_ids TEXT, -- JSON array of class_ids
  status TEXT DEFAULT 'pending', -- pending, generating, completed, failed
  total_count INTEGER DEFAULT 0,
  generated_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  started_at TEXT,
  completed_at TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rpt_batches_tenant ON report_card_batches(tenant_id);

-- 3. report_cards: individual rapor records
CREATE TABLE IF NOT EXISTS report_cards (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  batch_id TEXT,
  student_id TEXT NOT NULL,
  class_id TEXT,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  template_id TEXT,
  status TEXT DEFAULT 'draft', -- draft, generated, published, archived
  pdf_url TEXT, -- R2 path
  published_at TEXT,
  published_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rpt_cards_tenant ON report_cards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rpt_cards_student ON report_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_rpt_cards_batch ON report_cards(batch_id);

-- 4. report_card_sections: per-section data (nilai, attendance, behavior, etc.)
CREATE TABLE IF NOT EXISTS report_card_sections (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  report_card_id TEXT NOT NULL,
  section_type TEXT NOT NULL, -- grades, attendance, behavior, achievements, comments
  section_data TEXT NOT NULL, -- JSON: grades array, attendance counts, etc.
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rpt_sections_card ON report_card_sections(report_card_id);

-- 5. teacher_comments: pre-filled comments per student per subject
CREATE TABLE IF NOT EXISTS teacher_comments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  class_subject_id TEXT,
  teacher_id TEXT,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tchr_comments_tenant ON teacher_comments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tchr_comments_student ON teacher_comments(student_id);
