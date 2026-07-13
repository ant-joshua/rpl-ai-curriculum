# Panduan Admin

## Akses Admin Panel

1. Login via OAuth (Google/GitHub) atau device OAuth
2. Admin panel: `https://lms-syllabus.ant-joshua.my.id/admin`

**Admin gate:** `localStorage` key `lms-admin` must be `"true"`.
Set via browser console: `localStorage.setItem('lms-admin', 'true')`

## Role Management

| Role | Access |
|---|---|
| `superadmin` | Full — all endpoints, all menus |
| `admin` | All admin CRUD |
| `instructor` | Can manage own courses |
| `ta` | Can grade submissions |
| `student` | Only student portal |

**Promote user to admin:**
```bash
# Via D1
npx wrangler d1 execute rpl-ai-lms-db --remote \
  --command="UPDATE users SET role='admin' WHERE email='user@email.com'"

# Via API (need admin token)
curl -X PUT /api/admin/users/{id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```

## Membuat Course

1. Buka `/admin` → klik "Courses" di sidebar
2. Create course dengan title, slug, level, category
3. Buka `Course Offerings` → create offering dengan course_id
4. Buka `Lessons` → buat lesson, attach ke offering + content block
5. Publish lesson → student bisa lihat

## Content Types

| Type | body_html | meta |
|---|---|---|
| text | HTML string | — |
| video | — | `{"videoId":"dQw4w9WgXcQ","startTime":30}` |
| code | — | `{"language":"javascript","initialCode":"console.log(1)"}` |
| embed | — | `{"url":"https://...","width":"100%","height":400}` |
| quiz | HTML instruction | `{"questions":[{"question":"...","options":["A","B"],"correct":0}]}` |

## Grading

1. `/admin/gradebook/{offeringId}` → admin gradebook page
2. Click score cell → inline edit
3. Or use API:
```bash
curl -X PUT /api/admin/assessment-submissions/{id}
  -H "Authorization: Bearer {token}"
  -d '{"score":85,"max_score":100,"feedback":"Good job!"}'
```

## Prerequisites

1. `/admin/prerequisites` → manage lesson chains
2. Student must complete prerequisite before accessing
3. Also supports `unlock_days` — time-based release

## Notifications

System auto-notifies:
- Discussion reply → thread owner
- Assignment graded → student
- New lesson in enrolled course → all enrolled students (future)

## Analytics

`/admin/analytics` → dashboard with:
- Overview: user count, enrollments, courses, pending grades
- Enrollments: daily enrollment trend (SVG bar chart)
- Completion: per-offering lesson completion rate

## Course Structure Guide

```
Course (Pemrograman Web)
└── Course Offering (RPL-2026-A)
    ├── Lesson 1: HTML Dasar (content_block: text)
    │   └── Assessment: Quiz 1 (from question_bank)
    ├── Lesson 2: CSS Dasar (content_block: text)
    │   └── Assignment: Buat halaman profil
    ├── Lesson 3: JavaScript (content_block: video + code)
    │   └── Discussion thread per lesson
    └── ... (prerequisites: L1 → L2 → L3)
```

## Troubleshooting

**"FOREIGN KEY constraint failed"**
- Make sure referenced ID exists in parent table
- Use `null` not empty string `''` for FK fields

**"Not authenticated"**
- Include `Authorization: Bearer {token}` header
- Token expired → get new one via OAuth

**"Forbidden — admin role required"**
- User doesn't have superadmin/admin role
- Promote via D1: `UPDATE users SET role='admin' WHERE email='...'`

**Build error (Unexpected block closing tag)**
- Check Svelte template: missing `{#if}` or `{#each}` closing tag
- Ensure every `{/if}` has matching `{#if}`

**Deploy 404 for new routes**
- SvelteKit auto-generates _routes.json
- CF Pages functions routing limits (max 100 includes/excludes)
- Rebuild + redeploy clears stale routes

**Student can't access lesson**
- Check prerequisite requirements
- Check unlock_days from course start_date
- Check lesson status = published
