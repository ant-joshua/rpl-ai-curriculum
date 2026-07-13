# LMS — Full Architecture Implementation Plan

> **For Hermes:** Execute phases sequentially. Each phase is 1-3 parallel subagent tasks. Verify after each phase before next.

**Goal:** Transform coding project platform into proper LMS — course architecture, role management, gradebook, discussions, notifications, prerequisites, analytics, and more.

**Architecture:** D1 (source of truth) → API → Static JSON cache. Admin writes to DB, prebuild syncs DB→JSON for fast CDN reads.

**Tech Stack:** D1, SvelteKit server routes, TipTap (ProseMirror JSON), CRON via Hermes cronjob.

---

## Phase 1: Core Course Architecture (DB + API)

### Task 1.1: Migration 0021 — course tables

**File:** `migrations/0021_lms_core.sql`

```sql
-- ============================================
-- Migration 0021: LMS Core — Course Architecture
-- ============================================

-- USERS upgrade: add role + profile fields
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('superadmin','admin','instructor','ta','student'));
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  icon TEXT DEFAULT '📚',
  cover_image TEXT,
  category TEXT DEFAULT '',          -- 'Pemrograman', 'Database', 'AI', etc
  level TEXT NOT NULL DEFAULT 'beginner' CHECK(level IN ('beginner','intermediate','advanced')),
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_level ON courses(level);

CREATE TABLE IF NOT EXISTS course_offerings (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                -- e.g. "RPL 2026 Kelas A"
  code TEXT UNIQUE,                  -- e.g. "RPL-2026-A"
  instructor_id TEXT REFERENCES users(id),
  start_date TEXT,
  end_date TEXT,
  enrollment_start TEXT,
  enrollment_end TEXT,
  max_students INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','active','archived','completed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_co_course ON course_offerings(course_id);
CREATE INDEX idx_co_instructor ON course_offerings(instructor_id);
CREATE INDEX idx_co_status ON course_offerings(status);

-- Many-to-many: student enrollments in offerings
CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student','ta','auditor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','dropped','completed','pending')),
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  dropped_at TEXT,
  completed_at TEXT,
  final_grade TEXT,                  -- computed: 'A','B','C','D','E'
  final_score REAL,                  -- numeric 0-100
  UNIQUE(user_id, course_offering_id)
);
CREATE INDEX idx_enroll_user ON enrollments(user_id);
CREATE INDEX idx_enroll_offering ON enrollments(course_offering_id);
CREATE INDEX idx_enroll_status ON enrollments(status);

CREATE TABLE IF NOT EXISTS content_blocks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('text','video','code','embed','image','quiz','assignment_placeholder','file','slide','audio')),
  title TEXT DEFAULT '',
  body TEXT,                        -- ProseMirror JSON (structured)
  body_html TEXT,                   -- Rendered HTML cache
  meta TEXT DEFAULT '{}',           -- JSON: {videoUrl, codeLang, fileSize, embedUrl, ...}
  order_index INTEGER NOT NULL DEFAULT 0,
  visibility TEXT NOT NULL DEFAULT 'published' CHECK(visibility IN ('draft','published','archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_cb_type ON content_blocks(type);
CREATE INDEX idx_cb_visibility ON content_blocks(visibility);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  content_block_id TEXT REFERENCES content_blocks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  is_optional INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  unlock_days INTEGER,              -- days after enrollment to unlock (0 = immediate)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(course_offering_id, slug)
);
CREATE INDEX idx_lessons_offering ON lessons(course_offering_id);
CREATE INDEX idx_lessons_order ON lessons(course_offering_id, order_index);

CREATE TABLE IF NOT EXISTS question_bank (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT REFERENCES course_offerings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('multiple_choice','essay','code','true_false','short_answer')),
  question TEXT NOT NULL,            -- ProseMirror JSON
  options TEXT DEFAULT '[]',         -- JSON: [{"id":"a","text":"...","correct":false}]
  code_template TEXT,                -- starter code for 'code' type
  test_cases TEXT DEFAULT '[]',      -- JSON for code type
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK(difficulty IN ('easy','medium','hard')),
  tags TEXT DEFAULT '',
  explanation TEXT,                  -- ProseMirror JSON
  points INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft','published','archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_qb_offering ON question_bank(course_offering_id);
CREATE INDEX idx_qb_type ON question_bank(type);
CREATE INDEX idx_qb_difficulty ON question_bank(difficulty);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  content_block_id TEXT REFERENCES content_blocks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('quiz','midterm','final','practice','exercise')),
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes INTEGER,
  shuffle_questions INTEGER NOT NULL DEFAULT 1,
  show_results INTEGER NOT NULL DEFAULT 1,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  weight REAL NOT NULL DEFAULT 0,    -- weight toward final grade (percentage)
  questions TEXT NOT NULL DEFAULT '[]', -- JSON: [{"question_bank_id":"...","points":10,"order":1}]
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_assess_offering ON assessments(course_offering_id);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  content_block_id TEXT REFERENCES content_blocks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,                  -- ProseMirror JSON
  submission_type TEXT NOT NULL CHECK(submission_type IN ('file','code','text','link','github')),
  max_score INTEGER NOT NULL DEFAULT 100,
  weight REAL NOT NULL DEFAULT 0,    -- weight toward final grade
  due_date TEXT,
  allow_late_submission INTEGER NOT NULL DEFAULT 0,
  late_penalty_percent REAL DEFAULT 10,
  rubric TEXT DEFAULT '[]',          -- JSON: [{"criterion":"...","max_points":25,"description":"..."}]
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_assign_offering ON assignments(course_offering_id);

-- Prerequisite graph: lesson A must be completed before lesson B
CREATE TABLE IF NOT EXISTS prerequisites (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  prerequisite_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  dependent_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE(prerequisite_id, dependent_id)
);
CREATE INDEX idx_prereq_offering ON prerequisites(course_offering_id);
CREATE INDEX idx_prereq_dependent ON prerequisites(dependent_id);

-- ============================================
-- Calendar / Academic Period
-- ============================================
CREATE TABLE IF NOT EXISTS academic_periods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                -- "Semester Genap 2025/2026"
  type TEXT NOT NULL CHECK(type IN ('semester','trimester','quarter','year','custom')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT REFERENCES course_offerings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('class','exam','assignment','holiday','office_hours','other')),
  all_day INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_cal_offering ON calendar_events(course_offering_id);
CREATE INDEX idx_cal_date ON calendar_events(event_date);
```

### Task 1.2: API CRUD — Phase 1 entities

**Files to create (follow existing admin API pattern):**
- `src/routes/api/admin/courses/+server.ts` — GET (list), POST
- `src/routes/api/admin/courses/[slug]/+server.ts` — GET, PUT, DELETE
- `src/routes/api/admin/course-offerings/+server.ts` — GET, POST
- `src/routes/api/admin/course-offerings/[id]/+server.ts` — GET, PUT, DELETE
- `src/routes/api/admin/enrollments/+server.ts` — GET (by offering), POST (bulk enroll)
- `src/routes/api/admin/enrollments/[id]/+server.ts` — PUT (drop/complete), DELETE
- `src/routes/api/admin/content-blocks/+server.ts` — GET, POST
- `src/routes/api/admin/content-blocks/[id]/+server.ts` — GET, PUT, DELETE
- `src/routes/api/admin/lessons/+server.ts` — GET (by offering, ordered)
- `src/routes/api/admin/lessons/[id]/+server.ts` — GET, PUT, DELETE
- `src/routes/api/admin/lessons/reorder/+server.ts` — POST (batch reorder)
- `src/routes/api/admin/question-bank/+server.ts` — GET (filters: type, difficulty, offering), POST
- `src/routes/api/admin/question-bank/[id]/+server.ts` — GET, PUT, DELETE
- `src/routes/api/admin/assessments/+server.ts` — GET, POST
- `src/routes/api/admin/assessments/[id]/+server.ts` — GET, PUT, DELETE
- `src/routes/api/admin/assignments/+server.ts` — GET, POST
- `src/routes/api/admin/assignments/[id]/+server.ts` — GET, PUT, DELETE
- `src/routes/api/admin/prerequisites/+server.ts` — GET, POST (set prerequisite)
- `src/routes/api/admin/prerequisites/[id]/+server.ts` — DELETE
- `src/routes/api/admin/academic-periods/+server.ts` — GET, POST
- `src/routes/api/admin/academic-periods/[id]/+server.ts` — PUT, DELETE
- `src/routes/api/admin/calendar-events/+server.ts` — GET (by date range), POST
- `src/routes/api/admin/calendar-events/[id]/+server.ts` — PUT, DELETE

**Pattern (copy from existing):**
- `import { getDB, jsonResponse } from '$lib/server/d1'`
- `crypto.randomUUID()` for IDs
- Return `{success: true, data: ...}`
- Admin auth gate: check Bearer token + user.role IN ('admin','superadmin')

### Task 1.3: Apply migration

```bash
cd /home/midory/rpl-ai-curriculum/lms
npx wrangler d1 migrations apply rpl-ai-lms-db --remote
npx wrangler d1 migrations apply rpl-ai-lms-db --local
```

**Verify:** `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name` — expect 15+ tables.

---

## Phase 2: Role-Based Access Control

### Task 2.1: Auth middleware upgrade

**File:** `src/hooks.server.ts` — add role check on admin routes

```typescript
// In handle() or existing middleware:
// If route starts with /api/admin/ or /admin, check user.role is admin/superadmin/instructor
// Instructor only can access their own course_offerings
// Admin/superadmin can access all
```

### Task 2.2: User management page (for admin/instructor)

**File:** `src/routes/admin/users/+page.svelte`

Enhance existing page:
- Add role selector (superadmin/admin/instructor/ta/student)
- Add course_offering assignment
- Search/filter by role, status
- Bulk import students (paste emails/CSV) → create accounts + enroll

### Task 2.3: API endpoint for user CRUD

**File:** `src/routes/api/admin/users/[id]/+server.ts` — PUT role, deactivate, etc.

---

## Phase 3: Prerequisite Chains & Lesson Locking

### Task 3.1: Prerequisite check API

**File:** `src/routes/api/lessons/[id]/access/+server.ts`

```
GET /api/lessons/:id/access
→ Check if user has completed all prerequisites (check progress table)
→ Return {accessible: bool, prerequisites: [{lesson_id, title, completed: bool}]}
```

### Task 3.2: UI — locked lesson overlay

When lesson is locked, show:
- Lock icon + "Selesaikan [prerequisite lesson title] terlebih dahulu"
- Link to prerequisite lesson(s)

---

## Phase 4: Admin UI

### Task 4.1: Course Management

**File:** `src/routes/admin/courses/+page.svelte`

- Table: title, icon, level, category, offerings count
- Create/Edit modal: title, slug, description, short_description, icon, cover_image, category, level
- Delete with confirmation
- Click → offering list

### Task 4.2: Offering Management

**File:** `src/routes/admin/courses/[slug]/offerings/+page.svelte`

- List offerings for course
- Create: name, code, instructor (select user), dates, max students, status
- Click → detail with tabs: Lessons, Enrollments, Assessments, Assignments, Calendar, Gradebook

### Task 4.3: Enrollment Management

**File:** `src/routes/admin/course-offerings/[id]/enrollments/+page.svelte`

- Student roster table: name, email, status, enrolled_at
- Search/filter by name, status
- Add student modal (search user or paste list)
- Bulk enroll from CSV
- Drop student (change status to 'dropped')
- Mark complete

### Task 4.4: Lesson Builder

**File:** `src/routes/admin/course-offerings/[id]/lessons/+page.svelte`

- Drag-reorder (simple up/down buttons)
- Create: title, slug, duration, is_optional
- Content: select existing content_block or create new inline
- Prerequisites: multi-select from other lessons in same offering
- Status: draft/published

### Task 4.5: Content Block Library

**File:** `src/routes/admin/content-blocks/+page.svelte`

- Grid/gallery view of reusable blocks
- Filter by type (text, video, code, etc)
- Create inline with RichEditor (JSON mode)
- Duplicate, archive
- Shows which lessons use this block

### Task 4.6: Question Bank Page

**File:** `src/routes/admin/question-bank/+page.svelte`

- Tabs: By Offering / All
- Create question with type selector → dynamic form
  - Multiple choice: question (ProseMirror) + options (add/remove/reorder) + mark correct
  - Code: question + code_template + test cases (JSON editor)
  - Essay: question only
  - True/False: statement + boolean
- Filter by type, difficulty, tags, offering
- Bulk import from existing quiz.json
- Bulk export as JSON

### Task 4.7: Assessment Builder

**File:** `src/routes/admin/course-offerings/[id]/assessments/+page.svelte`

- List existing assessments
- Create: title, type, passing score, time limit, shuffle, max attempts, weight, due date
- Question selector: search/pick from question_bank, set points per question
- Reorder selected questions

### Task 4.8: Assignment Manager

**File:** `src/routes/admin/course-offerings/[id]/assignments/+page.svelte`

- CRUD assignments
- RichEditor for description
- Submission type selector
- Rubric builder: add criterion (name, max points, description)
- Due date picker
- View submissions count

### Task 4.9: Academic Calendar

**File:** `src/routes/admin/calendar/+page.svelte`

- Month grid view (simple CSS grid, no external lib)
- Events per day: class, exam, assignment deadline, holiday
- Create event: title, date, type, all_day, description
- Filter by offering

### Task 4.10: Admin Sidebar Update

**File:** `src/routes/admin/+layout.svelte`

Add links:
- Courses (with offerings dropdown)
- Content Blocks
- Question Bank
- Calendar
- Users

---

## Phase 5: Student Experience

### Task 5.1: Student Dashboard

**File:** `src/routes/dashboard/+page.svelte` — enhance existing

Show per-offering:
- Course name + instructor + progress bar
- Next lesson due
- Upcoming deadlines (assessments/assignments)
- Recent grades
- Quick actions: resume lesson, start quiz

### Task 5.2: Lesson View Page

**File:** `src/routes/learn/[offeringId]/lessons/[slug]/+page.svelte`

- Render content_blocks in order
- RichContent component to display ProseMirror JSON body
- Video embeds, code blocks with copy
- Mark lesson as complete button (track in progress table)
- Prerequisite check — show lock message if not met
- Navigation: prev/next lesson
- Discussions sidebar toggle

### Task 5.3: Assessment Page

**File:** `src/routes/assessments/[id]/+page.svelte`

- Timer countdown (if time_limit set)
- Load questions from assessment (shuffle if enabled)
- Render per type:
  - Multiple choice: custom radio cards
  - Code: CodeEditor component
  - Essay: textarea
  - True/False: toggle buttons
- Auto-save answers to D1 every 30s
- Submit confirmation dialog
- Auto-grade MCQ + True/False immediately
- Show results: score, correct answers, explanations
- Attempt limit check

### Task 5.4: Assignment Submission Page

**File:** `src/routes/assignments/[id]/+page.svelte`

- Show assignment details + rubric table
- Submission form per type:
  - file: drag-drop upload (to R2 bucket)
  - code: CodeEditor
  - text: textarea
  - link: URL input
  - github: repo URL input
- Submit button → save to `assignment_submissions` table
- If already submitted: show submission + status (pending/graded)
- If graded: show score + feedback per rubric criterion

### Task 5.5: Progress & Grade Page

**File:** `src/routes/grades/+page.svelte`

Per offering:
- Summary: current grade (letter + numeric)
- Weighted breakdown: assessments (X%), assignments (Y%), attendance (Z%)
- Each graded item: title, score, max, weight, date
- Overall progress bar

### Task 5.6: Calendar View (Student)

**File:** `src/routes/calendar/+page.svelte`

- Simple month grid
- Events from active offerings
- Click event → detail

---

## Phase 6: Discussion System

### Task 6.1: Discussion tables

**Add to migration (or Phase 6 migration 0022):**

```sql
-- Threaded discussions per lesson/content_block
CREATE TABLE IF NOT EXISTS discussions (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  content_block_id TEXT REFERENCES content_blocks(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT,                     -- ProseMirror JSON
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_resolved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_disc_lesson ON discussions(lesson_id);
CREATE INDEX idx_disc_user ON discussions(user_id);

-- Replies to a discussion thread
CREATE TABLE IF NOT EXISTS discussion_replies (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  parent_reply_id TEXT REFERENCES discussion_replies(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  body TEXT,
  is_instructor_reply INTEGER NOT NULL DEFAULT 0,
  is_solution INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_dr_discussion ON discussion_replies(discussion_id);
CREATE INDEX idx_dr_user ON discussion_replies(user_id);
```

### Task 6.2: Discussion API

- `src/routes/api/discussions/+server.ts` — POST (create thread)
- `src/routes/api/discussions/[id]/+server.ts` — GET (with replies), PUT, DELETE
- `src/routes/api/discussions/[id]/resolve/+server.ts` — PUT (mark resolved)
- `src/routes/api/discussions/[id]/pin/+server.ts` — PUT (pin/unpin)
- `src/routes/api/discussions/[id]/replies/+server.ts` — POST (reply)
- `src/routes/api/discussions/[id]/replies/[rid]/+server.ts` — PUT, DELETE
- `src/routes/api/discussions/[id]/replies/[rid]/solution/+server.ts` — PUT (mark as solution)

### Task 6.3: Discussion UI Component

**File:** `src/lib/components/DiscussionPanel.svelte`

- In lesson page: sidebar or below content
- Thread list with title, author, reply count, resolved badge, date
- Click → expand thread + replies
- Reply form
- Mark solution button (for instructor or thread creator)

---

## Phase 7: Notification System

### Task 7.1: Notifications table

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN (
    'grade_posted','assignment_due','assessment_reminder',
    'discussion_reply','content_published','enrollment_confirmed',
    'deadline_approaching','submission_graded','announcement'
  )),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,                      -- URL to relevant page
  is_read INTEGER NOT NULL DEFAULT 0,
  email_sent INTEGER NOT NULL DEFAULT 0,
  push_sent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_read ON notifications(user_id, is_read);
CREATE INDEX idx_notif_created ON notifications(user_id, created_at);
```

### Task 7.2: Notification API

- `src/routes/api/notifications/+server.ts` — GET (recent, unread count)
- `src/routes/api/notifications/[id]/read/+server.ts` — PUT (mark read)
- `src/routes/api/notifications/read-all/+server.ts` — PUT (mark all as read)

### Task 7.3: Auto-notification triggers

Hook into existing flows:
- After grade submitted → `grade_posted`
- 24h before due date → `deadline_approaching` (via CRON)
- After discussion reply → `discussion_reply`
- After enrollment → `enrollment_confirmed`

### Task 7.4: Notification UI

**File:** `src/lib/components/NotificationBell.svelte`

In sidebar header:
- Bell icon with unread count badge
- Click → dropdown list of recent notifications
- Click notification → navigate to link + mark read
- "Mark all read" button

Also: in-app toast for important notifications.

### Task 7.5: Deadline reminder CRON

Using Hermes cronjob:
```
Daily at 8am: check deadlines within 24h → insert notifications
Daily at 8am: check overdue assignments → notify
```

---

## Phase 8: Gradebook

### Task 8.1: Grade computation engine

**File:** `src/lib/server/gradebook.ts`

```typescript
interface GradeItem {
  type: 'assessment' | 'assignment' | 'attendance';
  id: string;
  title: string;
  score: number;
  maxScore: number;
  weight: number;        // percentage of category
  category: string;      // 'assessments' | 'assignments' | 'attendance'
}

interface GradeCategory {
  name: string;
  weight: number;        // percentage of final grade
  items: GradeItem[];
}

// computeFinalGrade(categories): {score, maxScore, percentage, letter}
function computeFinalGrade(categories: GradeCategory[]): {
  score: number;
  maxScore: number;
  percentage: number;
  letter: string;        // A=85, B=70, C=55, D=40, E=<40
}

// getLetterGrade(pct): 'A'|'B'|'C'|'D'|'E'
```

### Task 8.2: Gradebook API

- `src/routes/api/admin/course-offerings/[id]/gradebook/+server.ts` — GET (all students + grades as CSV/JSON)
- `src/routes/api/admin/assessments/[id]/grade/+server.ts` — POST (instructor grades essay/code)
- `src/routes/api/admin/assignments/[id]/submissions/[sid]/grade/+server.ts` — POST (grade with rubric)

### Task 8.3: Gradebook UI (Instructor)

**File:** `src/routes/admin/course-offerings/[id]/gradebook/+page.svelte`

- Table: rows = students, cols = assessments + assignments + total
- Scores in cells, color-coded (green ≥ passing, red < passing)
- Click cell → detail (submission, rubric scores)
- Total column: weighted computation
- Export to CSV button
- Grade summary stats: class average, median, distribution

### Task 8.4: Submission Grading UI

**File:** `src/routes/admin/course-offerings/[id]/assignments/[aid]/submissions/+page.svelte`

- List submissions: student, submitted_at, status (pending/graded)
- Click → grading view:
  - Student submission (code preview/file download/text)
  - Rubric table with score inputs per criterion
  - Total auto-calculated
  - Feedback textarea
  - Submit grade button

---

## Phase 9: Attendance & Learning Analytics

### Task 9.1: Attendance tracking

**Add to migration:**

```sql
CREATE TABLE IF NOT EXISTS lesson_views (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  lesson_id TEXT NOT NULL REFERENCES lessons(id),
  viewed_at TEXT NOT NULL DEFAULT (datetime('now')),
  duration_seconds INTEGER DEFAULT 0,
  UNIQUE(user_id, lesson_id, viewed_at)
);
CREATE INDEX idx_lv_user ON lesson_views(user_id);
CREATE INDEX idx_lv_lesson ON lesson_views(lesson_id);
```

**Auto-mark:** When student views >80% of content blocks in a lesson, mark as attended.

### Task 9.2: Analytics API

- `src/routes/api/admin/course-offerings/[id]/analytics/+server.ts` — GET
  - Completion rate per lesson
  - Average time spent per lesson
  - Drop-off points (lessons where students stop)
  - Assessment score distribution
  - At-risk students (low engagement, low scores)

### Task 9.3: Analytics Dashboard

**File:** `src/routes/admin/course-offerings/[id]/analytics/+page.svelte`

- Cards: total students, active, dropped, completion rate
- Chart: lesson-by-lesson completion (simple CSS bar chart)
- Chart: score distribution histogram
- Table: at-risk students (engagement <30%, score <50)
- Export analytics to CSV

### Task 9.4: Student Learning Analytics (self)

**File:** `src/routes/analytics/+page.svelte`

- Time spent per course/lesson
- Study streak calendar (heatmap)
- Weak areas by topic/tag
- Comparison: your score vs class average

---

## Phase 10: Advanced Features

### Task 10.1: Bulk Operations

- Bulk enroll via CSV: `POST /api/admin/course-offerings/:id/enrollments/bulk`
- Bulk grade export: `GET /api/admin/course-offerings/:id/gradebook?format=csv`
- Bulk create lessons from template

### Task 10.2: Audit Log

```sql
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
```

Add logging in all admin API endpoints.

### Task 10.3: Certificate Auto-Issue

When a course_offering is completed (final_grade ≥ passing):
- Auto-generate certificate with unique serial number (UUID v4)
- Certificate data: student name, course title, offering code, date, grade, serial
- Store in `certificates` table
- Public verify page: `/certificate/verify?serial=XXX`
- Student can download from `/certificate/[id]`

```sql
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  course_offering_id TEXT NOT NULL REFERENCES course_offerings(id),
  serial TEXT UNIQUE NOT NULL,
  grade TEXT NOT NULL,
  issued_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, course_offering_id)
);
CREATE INDEX idx_cert_user ON certificates(user_id);
CREATE INDEX idx_cert_serial ON certificates(serial);
```

---

## Phase 11: TipTap ProseMirror JSON + RichContent

### Task 11.1: JSON mode in RichEditor

**File:** `src/lib/components/RichEditor.svelte`

Add props:
- `mode: 'html' | 'json' = 'html'`
- `onUpdateJson?: (json: any) => void`
- Call `editor.getJSON()` when mode='json'

### Task 11.2: RichContent renderer

**File:** `src/lib/components/RichContent.svelte`

Simple ProseMirror JSON renderer:
- Accept `content: string | object`
- If string → `{@html content}`
- If object → render recursively:
  - doc → iterate children
  - paragraph → `<p>`
  - heading → `<h1-6>` with level attr
  - bulletList → `<ul>`, orderedList → `<ol>`, listItem → `<li>`
  - codeBlock → `<pre><code>`
  - image → `<img>`
  - text → text content with marks (bold, italic, link, code, strike)

---

## Phase 12: Migration of Static Content

### Task 12.1: Import quiz → question_bank

**File:** `scripts/sync-quiz-to-bank.ts`

Read `static/content/quiz-index.json` + `quiz.json`:
- Create question_bank entries for each question
- Map: multiple_choice → type, options → JSON array
- Map: essay → type, no options
- Tag with source module slug

---

## Files Summary

### Migrations
- `migrations/0021_lms_core.sql` — courses, offerings, enrollments, content_blocks, lessons, question_bank, assessments, assignments, prerequisites, calendar, academic_periods (+ users ALTER)
- `migrations/0022_discussions.sql` — discussions, discussion_replies
- `migrations/0023_notifications.sql` — notifications
- `migrations/0024_attendance_analytics.sql` — lesson_views, audit_log
- `migrations/0025_certificates.sql` — certificates

### API Routes (new)
- 25+ admin API files (see Phase 1 task list + Phase 6/7/8/9)
- Student-facing: discussion, notification, grade, assessment attempts, submissions

### Components
- `RichContent.svelte` — new
- `RichEditor.svelte` — modified
- `DiscussionPanel.svelte` — new
- `NotificationBell.svelte` — new

### Server Lib
- `src/lib/server/gradebook.ts` — new (grade computation engine)

### Admin Pages
- courses, offerings, enrollments, lessons, content blocks, question bank, assessments, assignments, calendar, gradebook, grading, analytics, users

### Student Pages
- /learn/[offeringId]/lessons/[slug] — lesson viewer
- /assessments/[id] — quiz/exam
- /assignments/[id] — submission
- /grades — grade overview
- /calendar — calendar view
- /analytics — learning analytics

### Scripts
- `scripts/sync-quiz-to-bank.ts`

### Cron
- Deadline reminder notifications (daily)

---

## Execution Order

```
Phase 1 (Core DB + API CRUD)
  → Phase 2 (Roles)
  → Phase 3 (Prerequisites)
  → Phase 4 (Admin UI)
  → Phase 5 (Student Experience)
  → Phase 6 (Discussions)
  → Phase 7 (Notifications)
  → Phase 8 (Gradebook)
  → Phase 9 (Analytics)
  → Phase 10 (Advanced: audit, bulk, certificates)
  → Phase 11 (TipTap JSON)
  → Phase 12 (Static migration)
```

**Each phase** = 1 subagent batch of 2-3 parallel tasks. Verify build + curl test after each.

## Risks & Tradeoffs

1. **Scope creep** — 12 phases is big. Start with Phase 1-5 for MVP LMS.
2. **D1 row limits** — D1 free has 5GB storage, 5M rows/day read. Fine for hundreds of students. For thousands, add pagination early.
3. **No real-time** — D1 doesn't do real-time sync. Discussions won't show live updates without polling. Acceptable for MVP.
4. **FTS search** — D1 doesn't have built-in FTS. Use LIKE for now, consider Meilisearch/Typesense later.
5. **File uploads** — Assignment file submissions need R2 bucket. Already have R2 binding "ASSETS".
6. **Existing module content** — Static JSON stays until Phase 12. New content goes directly to DB.
