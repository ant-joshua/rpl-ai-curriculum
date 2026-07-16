-- 0045_tenant_engine.sql
-- Phase 1: Multi-Tenant Foundation
-- Adds tenants + tenant_users tables, seeds default tenant, adds tenant_id to all existing tables

-- =====================================================================
-- 1. NEW TABLES
-- =====================================================================

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6c5ce7',
  config TEXT DEFAULT '{}',
  features TEXT DEFAULT '{}',
  is_active INTEGER DEFAULT 1,
  owner_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tenant_users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  joined_at TEXT DEFAULT (datetime('now')),
  UNIQUE(tenant_id, user_id)
);

-- =====================================================================
-- 2. SEED DEFAULT TENANT
-- =====================================================================

INSERT OR IGNORE INTO tenants (id, name, slug, type, is_active)
  VALUES ('default', 'Default LMS', 'default', 'lms', 1);

-- Seed existing users as default tenant members
INSERT OR IGNORE INTO tenant_users (id, tenant_id, user_id, role, status)
  SELECT lower(hex(randomblob(16))), 'default', id, role, 'active' FROM users WHERE role IS NOT NULL;

-- =====================================================================
-- 3. ADD TENANT_ID TO ALL EXISTING TABLES
-- =====================================================================

PRAGMA legacy_alter_table = ON;

ALTER TABLE academic_periods ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE activity_feed ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE activity_log ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE admin_content ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE announcements ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE assessment_questions ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE assessment_submissions ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE assessments ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE assignment_submissions ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE assignments ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE badges ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE bookmarks ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE calendar_events ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE capstone_projects ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE certificates ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE content_blocks ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE course_offerings ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE courses ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE discussion_replies ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE discussion_threads ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE discussions ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE enrollments ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE flashcards ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE gradebook ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE group_members ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE group_messages ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE lesson_content_blocks ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE lessons ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE mentorship_requests ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE notes ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE notifications ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE oauth_users ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE plan_progress ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE prerequisites ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE progress ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE project_completions ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE project_progress ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE question_bank ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE quiz_answers ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE recommendations ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE review_requests ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE reviews ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE sessions ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE study_groups ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE study_plans ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE submissions ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE tryout_answers ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE tryout_sessions ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE user_activity_log ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE user_badges ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE user_streaks ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE user_xp ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE users ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE xp_transactions ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';

-- =====================================================================
-- 4. INDEXES
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_type ON tenants(type);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role ON tenant_users(role);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_courses_tenant ON courses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lessons_tenant ON lessons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_tenant ON enrollments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_tenant ON content_blocks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gradebook_tenant ON gradebook(tenant_id);
CREATE INDEX IF NOT EXISTS idx_course_offerings_tenant ON course_offerings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assignments_tenant ON assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_tenant ON assignment_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_progress_tenant ON progress(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tryout_sessions_tenant ON tryout_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tryout_answers_tenant ON tryout_answers(tenant_id);
