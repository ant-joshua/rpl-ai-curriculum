# PLAN: Unified Content Tree (content_blocks backbone)

## 1. Problem

**Current:**
```
courses → course_offerings → lessons (per-offering)
                               └─ lesson_content_blocks (junction)
                                    └─ content_blocks (global — no FK to offering/course)

courses → course_offerings → assessments (per-offering, FK to content_blocks)
courses → course_offerings → assignments (per-offering, FK to content_blocks)
```

- 4 tables for hierarchy (lessons, assessments, assignments, lesson_content_blocks)
- No sections/grouping — flat lesson list
- Content_blocks is global (no FK) — reusable accidentally, not by design
- Adding section = need `sections` table + rewire FK

**Goal:**
```
content_blocks (UNIFIED TREE)
  └─ parent_id self-ref for nesting
      type = section | lesson | assessment | assignment | text | video | quiz | code | embed | image | ...

lessons (DETAIL — only lesson-specific fields)
assessments (DETAIL — only assessment-specific fields)
assignments (DETAIL — only assignment-specific fields)
```

## 2. Schema

### content_blocks (live in ~/rpl-ai-curriculum/lms/content-tree)

```
content_blocks
┌──────────────────────┬──────────┬──────────────────────────────────┐
│ Column               │ Type     │ Notes                            │
├──────────────────────┼──────────┼──────────────────────────────────┤
│ id                   │ TEXT PK  │                                  │
│ course_offering_id   │ TEXT FK  │ → course_offerings.id            │
│ course_id            │ TEXT FK  │ → courses.id (template/master)    │
│ parent_id            │ TEXT FK  │ → content_blocks.id (self-ref)    │
│ type                 │ TEXT     │ section|lesson|assessment|       │
│                      │          │ assignment|text|video|quiz|      │
│                      │          │ code|embed|image|playground|file │
│ title                │ TEXT     │                                  │
│ subtitle             │ TEXT     │ optional                         │
│ body                 │ TEXT     │ raw markdown/URL/code             │
│ body_html            │ TEXT     │ rendered HTML                     │
│ meta                 │ TEXT     │ JSON (quiz Qs, video ID, etc)    │
│ slug                 │ TEXT     │ unique per offering (for routing) │
│ status               │ TEXT     │ draft|published|archived         │
│ order_index          │ INT      │ position in parent               │
│ duration_min         │ INT      │ 0                                │
│ is_optional          │ INT      │ 0                                │
│ unlock_days          │ INT      │ null                             │
│ weight               │ REAL     │ 0 (for grading)                  │
│ due_date             │ TEXT     │ null (ISO)                       │
│ created_at           │ TEXT     │                                  │
│ updated_at           │ TEXT     │                                  │
│ source_id            │ TEXT     │ nullable — template content_block │
│                      │          │ id saat cloning dari course       │
├──────────────────────┴──────────┴──────────────────────────────────┤
│ UNIQUE(course_offering_id, slug)  (only for type=lesson)           │
│ INDEX(course_offering_id, parent_id, order_index)                   │
│ INDEX(course_id)   (for template reuse)                             │
└─────────────────────────────────────────────────────────────────────┘
```

### detail tables (simplified — remove FK to content_block_id, move specific fields)

**lessons** — hanya fields yang gak relevan buat content tree di atas:
```
id TEXT PK
content_block_id TEXT FK → content_blocks.id
slug TEXT UNIQUE(course_offering_id)
*body TEXT           (dari content_blocks.body — bisa pindah)
*body_html TEXT      (dari content_blocks.body_html — bisa pindah)
*content... fields   (progress/rating/etc specific ke lesson)
```

→ **Better:** body/body_html pindah ke content_blocks langsung. Lessons simpan `legacy_body` atau kosong. Atau lessons di-drop entirely, slug pindah ke content_blocks. Detail minimal: `content_block_id, extra_fields`.

**assessments:**
```
id TEXT PK, content_block_id TEXT FK
time_limit_minutes, passing_score, shuffle_questions
show_results, max_attempts, questions TEXT (JSON)
```

**assignments:**
```
id TEXT PK, content_block_id TEXT FK
submission_type, max_score, allow_late_submission
late_penalty_percent, rubric TEXT (JSON)
```

### Tree behavior

```
FAA-2026-1
├─ [section] "Fundamentals"           parent_id=null  order_index=0
│   ├─ [lesson] "Apa Itu AI Agent?"   parent_id=<s1>  order_index=0
│   │   ├─ [text] "Definisi..."       parent_id=<l1>  order_index=0
│   │   ├─ [video] "YT link"         parent_id=<l1>  order_index=1
│   │   └─ [quiz] "Cek pemahaman"    parent_id=<l1>  order_index=2
│   ├─ [lesson] "LLM & Provider"      parent_id=<s1>  order_index=1
│   └─ [assessment] "Quiz 1"         parent_id=<s1>  order_index=2
│
├─ [section] "Agent Architecture"     parent_id=null  order_index=1
│   ├─ [lesson] "Agent Loop"          parent_id=<s2>  order_index=0
│   └─ [assessment] "Mid Test"        parent_id=<s2>  order_index=1
│
└─ [assignment] "Final Project"       parent_id=null  order_index=2
```

**Render rule:**
- `section` → header/judul saja, expandable
- `lesson` → clickable card, navigasi ke `/learn/{offeringId}/lessons/{slug}`
- `assessment` → badge + due date
- `assignment` → card + deadline
- `text|video|quiz|code|embed|image` → rendered inline di lesson page

**Current lesson page** → query content_blocks WHERE parent_id=(lesson content_block id)
**Current syllabus page** → query content_blocks WHERE course_offering_id=? ORDER BY order_index, build tree in JS

## 3. Reusability Strategy

### 3a. Content Lifecycle

```
COURSE (template/master)
  └─ course_id on content_blocks = master tree

       ↓ clone-on-create

COURSE_OFFERING (instance)
  └─ course_offering_id on content_blocks = offering tree
  └─ source_id referencing template content_block.id
       ↳ set saat clone: content_blocks.source_id = template.id
       ↳ update tracking: "which template did this come from"
```

### 3b. Clone-on-Create (simple)

When creating new offering from course:
1. Copy all content_blocks WHERE course_id = course.id
2. New id, set `course_offering_id` = new offering.id
3. Set `source_id` = original content_block.id
4. Re-parent: map old parent_id → new id via lookup table

```
INSERT INTO content_blocks (id, course_offering_id, parent_id, type, title, body, ...)
SELECT
  lower(hex(randomblob(16))),          -- new id
  'new-offering-uuid',                  -- new offering
  NULL,                                 -- parent_id mapped later
  type, title, body, body_html, meta, slug,
  status, order_index, duration_min, is_optional, unlock_days, weight, due_date,
  id as source_id                       -- link back to template
FROM content_blocks WHERE course_id = 'template-course-id';
```

### 3c. Push Updates (advanced)

When instructor edits a template content_block:
- All offerings that have `source_id = template.id` and no local edits → auto-update body/title
- Offering that customized → flagged as divergence
- UI: "Update from template" button

*Implementation phase 2 — after tree stable.*

## 4. Migration Phases

### Phase 1: Schema + New content_blocks
**Risk: Low — additive only, zero downtime**

- [ ] Create migration 0041: ALTER TABLE content_blocks add columns
  - `course_offering_id TEXT`
  - `course_id TEXT`
  - `parent_id TEXT`
  - `slug TEXT`
  - `subtitle TEXT`
  - `duration_min INTEGER`
  - `is_optional INTEGER`
  - `unlock_days INTEGER`
  - `weight REAL`
  - `due_date TEXT`
  - `source_id TEXT`
- [ ] Update types (add section/lesson/assessment/assignment to type CHECK)
  - D1 gak enforce CHECK — skip if not in old constraint, just use new data
- [ ] Create indexes

### Phase 2: Data Migration
**Risk: Medium — run in transaction if possible**

- [ ] Insert current lessons as content_blocks (type='lesson')
  - course_offering_id, title, slug, order_index, status, duration_min, is_optional
  - body/body_html from linked content_block (via FK or junction)
- [ ] Insert current lesson_content_blocks children
  - Each junction row → content_block child of lesson
- [ ] Insert assessments as content_blocks (type='assessment')
  - weight, due_date from assessments table
- [ ] Insert assignments as content_blocks (type='assignment')
  - weight, due_date from assignments table
- [ ] Set source_id = content_block.id for tracking

### Phase 3: Code Update
**Risk: Medium — many files, logic changes**

- [ ] Syllabus page: query tree, render sections + lessons + assessments
- [ ] Lesson page: render text/video/quiz children of lesson content_block
- [ ] Dashboard: continue learning → query tree + progress
- [ ] ContentRenderer: unchanged (renders leaf types only)
- [ ] Auth/redirect paths: fix to use content_blocks.slug
- [ ] Remove `lesson_content_blocks` junction usage

### Phase 4: Optional Cleanup
**Risk: Low**

- [ ] Add `course_id` clone-on-create flow
- [ ] Drop `lesson_content_blocks` table (after all code migrated)
- [ ] Deprecate direct `lessons.content_block_id` FK (use tree instead)

## 5. File Change Map

| File | Change |
|---|---|
| `src/routes/learn/[offeringId]/syllabus/+page.svelte` | Render tree from content_blocks query |
| `src/routes/learn/[offeringId]/syllabus/+page.server.ts` | Query tree instead of lessons |
| `src/routes/learn/[offeringId]/lessons/[slug]/+page.server.ts` | Find lesson via content_blocks.slug, render children |
| `src/routes/learn/[offeringId]/+layout.server.ts` | Load offering tree for sidebar |
| `src/lib/components/lesson/LessonSidebar.svelte` | Accept tree data |
| `src/lib/components/content/ContentRenderer.svelte` | Unchanged (renders leaf types) |
| `migrations/0041_content_blocks_tree.sql` | New migration |

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Recursive CTE perf in D1 | Max depth 3 (section→lesson→block). Flat query + JS build tree. |
| Existing slugs break | content_blocks.slug mirrors lessons.slug. Backward compat via redirect. |
| body/body_html migration | Use COALESCE — if lesson has linked content_block, copy body_html. |
| Lesson page 500 on missing tree content | Graceful fallback to direct content_block FK (old path). |
| Large migration rollback | Phase 1 reversible (just drop columns). Phase 2 keep old data until Phase 4. |

## 7. Success Criteria

- [ ] Syllabus page renders grouped by section
- [ ] Lesson page shows multi-block content (text + video + quiz in 1 lesson)
- [ ] `/learn/{offeringId}/lessons/{slug}` 200 (slug from content_blocks)
- [ ] Dashboard continue learning still works
- [ ] Inline content blocks (text/video/quiz) render unchanged
- [ ] Weight + due_date visible for assessments/assignments in tree
