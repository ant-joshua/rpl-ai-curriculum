# Database Schema

Database: Cloudflare D1 (SQLite). 26 migrations applied.

## Tables Overview

```
users ─────────────► course_offerings ◄──────────── courses
  │                        │                              │
  │                        ├─── enrollments                │
  │                        ├─── lessons                    │
  │                        └─── gradebook                  │
  │                                                        │
  ├──► notifications                                       │
  ├──► user_badges ──── badges                             │
  ├──► user_activity_log                                   │
  ├──► sessions                                            │
  ├──► progress                                            │
  ├──► discussion_threads ──── replies                     │
  ├──► assessment_submissions ──── assessments             │
  ├──► assignment_submissions ──── assignments             │
  └──► enrollments                                         │
                                                           │
content_blocks ◄─── lessons ──── prerequisites ──── lessons
                                                           │
question_bank ◄─── assessments ◄─── lessons
```

## Users

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'student'
        CHECK(role IN ('superadmin','admin','instructor','ta','student')),
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

## Courses

```sql
CREATE TABLE courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    icon TEXT,
    cover_image TEXT,
    category TEXT,
    level TEXT CHECK(level IN ('beginner','intermediate','advanced')),
    created_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

## Course Offerings

```sql
CREATE TABLE course_offerings (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    instructor_id TEXT REFERENCES users(id),
    start_date TEXT,
    end_date TEXT,
    enrollment_start TEXT,
    enrollment_end TEXT,
    max_students INTEGER,
    status TEXT DEFAULT 'draft'
        CHECK(status IN ('draft','active','archived')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

## Enrollments

```sql
CREATE TABLE enrollments (
    id TEXT PRIMARY KEY,
    course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active'
        CHECK(status IN ('active','completed','dropped')),
    enrolled_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    UNIQUE(course_offering_id, user_id)
);
```

## Content Blocks

```sql
CREATE TABLE content_blocks (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'text'
        CHECK(type IN ('text','video','code','embed','quiz')),
    title TEXT NOT NULL,
    body TEXT,          -- ProseMirror JSON
    body_html TEXT,     -- Rendered HTML
    meta TEXT DEFAULT '{}', -- JSON metadata
    order_index INTEGER DEFAULT 0,
    visibility TEXT DEFAULT 'draft'
        CHECK(visibility IN ('draft','published','archived')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

## Lessons

```sql
CREATE TABLE lessons (
    id TEXT PRIMARY KEY,
    course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    content_block_id TEXT REFERENCES content_blocks(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 30,
    is_optional INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft'
        CHECK(status IN ('draft','published','archived')),
    unlock_days INTEGER, -- Release after N days from course start
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(course_offering_id, slug)
);
```

## Prerequisites

```sql
CREATE TABLE prerequisites (
    id TEXT PRIMARY KEY,
    prerequisite_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    dependent_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE(prerequisite_id, dependent_id)
);
```

## Question Bank

```sql
CREATE TABLE question_bank (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL
        CHECK(type IN ('multiple_choice','essay','code','true_false','short_answer')),
    question TEXT NOT NULL,
    options TEXT,  -- JSON array for MC
    correct_answer TEXT,
    points INTEGER DEFAULT 1,
    category TEXT,
    tags TEXT,
    difficulty TEXT DEFAULT 'medium'
        CHECK(difficulty IN ('easy','medium','hard')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

## Assessments

```sql
CREATE TABLE assessments (
    id TEXT PRIMARY KEY,
    lesson_id TEXT REFERENCES lessons(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    assessment_type TEXT DEFAULT 'quiz'
        CHECK(assessment_type IN ('quiz','midterm','final','practice','exercise')),
    time_limit_minutes INTEGER,
    passing_score REAL DEFAULT 60,
    max_attempts INTEGER DEFAULT 1,
    shuffle_questions INTEGER DEFAULT 0,
    show_results INTEGER DEFAULT 1,
    status TEXT DEFAULT 'draft'
        CHECK(status IN ('draft','published','archived')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

## Assignments

```sql
CREATE TABLE assignments (
    id TEXT PRIMARY KEY,
    lesson_id TEXT REFERENCES lessons(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    max_score REAL DEFAULT 100,
    submission_type TEXT DEFAULT 'text'
        CHECK(submission_type IN ('text','file','both')),
    status TEXT DEFAULT 'draft',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

## Assessment Submissions

```sql
CREATE TABLE assessment_submissions (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft'
        CHECK(status IN ('draft','submitted','graded','returned')),
    answers TEXT,       -- JSON array
    score REAL,
    max_score REAL,
    graded_by TEXT REFERENCES users(id),
    graded_at TEXT,
    feedback TEXT,
    submitted_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

## Assignment Submissions

```sql
CREATE TABLE assignment_submissions (
    id TEXT PRIMARY KEY,
    assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft'
        CHECK(status IN ('draft','submitted','graded','returned')),
    submission_text TEXT,
    file_urls TEXT,     -- JSON array
    score REAL,
    max_score REAL,
    graded_by TEXT REFERENCES users(id),
    graded_at TEXT,
    feedback TEXT,
    submitted_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

## Gradebook

```sql
CREATE TABLE gradebook (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_offering_id TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    assessment_submission_id TEXT REFERENCES assessment_submissions(id),
    assignment_submission_id TEXT REFERENCES assignment_submissions(id),
    score REAL,
    max_score REAL,
    weight REAL DEFAULT 1.0,
    graded_by TEXT REFERENCES users(id),
    graded_at TEXT,
    feedback TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

## Discussion

```sql
CREATE TABLE discussion_threads (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_pinned INTEGER DEFAULT 0,
    is_locked INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE discussion_replies (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    parent_id TEXT REFERENCES discussion_replies(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

## Notifications

```sql
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL
        CHECK(type IN ('course_update','new_lesson','discussion_reply','assignment_grade','system','announcement')),
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);
```

## Badges

```sql
CREATE TABLE badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    criteria_type TEXT NOT NULL
        CHECK(criteria_type IN ('lessons_completed','assessments_passed','streak_days','courses_completed','discussion_posts','custom')),
    criteria_value INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE user_badges (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, badge_id)
);
```

## Activity Log

```sql
CREATE TABLE user_activity_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    metadata TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
```

## Progress

```sql
CREATE TABLE progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_slug TEXT NOT NULL,
    session_id TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    completed_at TEXT,
    score REAL,
    time_spent INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
);
```


## Sessions

```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    provider TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);
```

## Migrations

| # | File | Tables |
|---|---|---|
| 0001 | init | users, sessions, progress |
| 0021 | lms_core | courses, course_offerings, enrollments, content_blocks, lessons, prerequisites, question_bank, assessments, assignments, academic_periods, calendar_events + users upgrade |
| 0022 | discussions | discussion_threads, discussion_replies |
| 0023 | notifications | notifications |
| 0024 | gradebook | assessment_submissions, assignment_submissions, gradebook |
| 0025 | analytics | user_activity_log |
| 0026 | badges | badges, user_badges |
