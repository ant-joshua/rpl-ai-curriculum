-- 0056_survey_feedback.sql
-- Survey/Feedback: evaluasi dosen, satisfaction surveys

-- 1. survey_templates: reusable survey forms
CREATE TABLE IF NOT EXISTS survey_templates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  survey_type TEXT NOT NULL, -- dosen_evaluation, satisfaction, feedback, other
  is_anonymous INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_survey_templates_tenant ON survey_templates(tenant_id);

-- 2. survey_questions: questions per template
CREATE TABLE IF NOT EXISTS survey_questions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- rating, text, multiple_choice, yes_no
  options TEXT, -- JSON array for multiple_choice
  required INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_survey_questions_tenant ON survey_questions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_template ON survey_questions(template_id);

-- 3. survey_instances: deployed surveys
CREATE TABLE IF NOT EXISTS survey_instances (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  title TEXT NOT NULL,
  target_type TEXT NOT NULL, -- class, teacher, course
  target_id TEXT, -- class_subject_id, teacher_id, or course_id
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'draft', -- draft, active, closed
  response_count INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_survey_instances_tenant ON survey_instances(tenant_id);

-- 4. survey_responses: individual submissions
CREATE TABLE IF NOT EXISTS survey_responses (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  respondent_id TEXT, -- NULL if anonymous
  completed INTEGER DEFAULT 0,
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  UNIQUE(instance_id, respondent_id)
);
CREATE INDEX IF NOT EXISTS idx_survey_responses_tenant ON survey_responses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_instance ON survey_responses(instance_id);

-- 5. survey_answers: individual answers
CREATE TABLE IF NOT EXISTS survey_answers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  response_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer_text TEXT,
  answer_numeric REAL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_survey_answers_tenant ON survey_answers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_survey_answers_response ON survey_answers(response_id);

-- 6. survey_analytics: pre-computed analytics per instance
CREATE TABLE IF NOT EXISTS survey_analytics (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  avg_numeric REAL,
  distribution TEXT, -- JSON: { "5": 10, "4": 5, "3": 2 }
  text_responses_count INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_survey_analytics_instance ON survey_analytics(instance_id);
