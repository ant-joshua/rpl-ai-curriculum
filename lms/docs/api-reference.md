# API Reference

Base URL: `https://lms-syllabus.ant-joshua.my.id`

## Authentication

Admin endpoints require Bearer token via `Authorization: Bearer <token>` header.

Tokens obtained via OAuth:
```bash
# Device-based (no OAuth setup)
curl -X POST /api/auth/oauth \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@email.com"}'
# → {"success":true,"data":{"token":"..."}}
```

| Role | Permissions |
|---|---|
| `superadmin` | Full access |
| `admin` | All admin endpoints |
| `instructor` | Course management (future) |
| `ta` | Limited grading |
| `student` | My/* endpoints only |

## Admin APIs

### Courses

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/courses` | List all courses |
| POST | `/api/admin/courses` | Create course |
| GET | `/api/admin/courses/[slug]` | Get single course |
| PUT | `/api/admin/courses/[slug]` | Update course |
| DELETE | `/api/admin/courses/[slug]` | Delete course |

**POST/PUT body:**
```json
{
  "title": "Pemrograman Web",
  "slug": "pemrograman-web",
  "description": "Belajar HTML CSS JS",
  "short_description": "HTML CSS dasar",
  "icon": "🌐",
  "category": "Pemrograman",
  "level": "beginner|intermediate|advanced",
  "cover_image": "url"
}
```

### Course Offerings

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/course-offerings` | List all offerings |
| POST | `/api/admin/course-offerings` | Create offering |
| GET | `/api/admin/course-offerings/[slug]` | Get offering |
| PUT | `/api/admin/course-offerings/[slug]` | Update offering |
| DELETE | `/api/admin/course-offerings/[slug]` | Delete offering |

### Enrollments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/enrollments` | List enrollments |
| POST | `/api/admin/enrollments` | Enroll user |
| PUT | `/api/admin/enrollments/[slug]` | Update enrollment |
| DELETE | `/api/admin/enrollments/[slug]` | Unenroll |

### Lessons

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/lessons` | List lessons |
| POST | `/api/admin/lessons` | Create lesson |
| GET | `/api/admin/lessons/[slug]` | Get lesson |
| PUT | `/api/admin/lessons/[slug]` | Update lesson |
| DELETE | `/api/admin/lessons/[slug]` | Delete lesson |

### Content Blocks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/content-blocks` | List content blocks |
| POST | `/api/admin/content-blocks` | Create block |
| GET | `/api/admin/content-blocks/[slug]` | Get block |
| PUT | `/api/admin/content-blocks/[slug]` | Update block |
| DELETE | `/api/admin/content-blocks/[slug]` | Delete block |

**Content block types:**
- `text` — HTML content (body_html)
- `video` — YouTube embed (meta: {videoId, startTime})
- `code` — Code display (meta: {language, initialCode})
- `embed` — Iframe embed (meta: {url, width, height})
- `quiz` — Inline quiz (meta: {questions: [...]})

**POST body:**
```json
{
  "type": "text|video|code|embed|quiz",
  "title": "Judul",
  "body_html": "<h2>HTML Content</h2>",
  "body": "{\"type\":\"doc\",\"content\":[...]}",
  "meta": "{}",
  "order_index": 0,
  "visibility": "draft|published|archived"
}
```

### Prerequisites

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/prerequisites` | List all prerequisites |
| POST | `/api/admin/prerequisites` | Create prerequisite |
| DELETE | `/api/admin/prerequisites/[id]` | Remove prerequisite |

### Assessments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/assessments` | List assessments |
| POST | `/api/admin/assessments` | Create assessment |
| PUT | `/api/admin/assessments/[slug]` | Update assessment |
| DELETE | `/api/admin/assessments/[slug]` | Delete assessment |

### Assignments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/assignments` | List assignments |
| POST | `/api/admin/assignments` | Create assignment |
| PUT | `/api/admin/assignments/[slug]` | Update |
| DELETE | `/api/admin/assignments/[slug]` | Delete |

### Question Bank

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/question-bank` | List questions |
| POST | `/api/admin/question-bank` | Create question |
| PUT | `/api/admin/question-bank/[slug]` | Update |
| DELETE | `/api/admin/question-bank/[slug]` | Delete |

**Question types:** `multiple_choice`, `essay`, `code`, `true_false`, `short_answer`

### Academic Periods & Calendar

| Method | Endpoint |
|---|---|
| GET/POST | `/api/admin/academic-periods` |
| GET/PUT/DELETE | `/api/admin/academic-periods/[slug]` |
| GET/POST | `/api/admin/calendar-events` |
| GET/PUT/DELETE | `/api/admin/calendar-events/[slug]` |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/[id]` | Update user role/status |

**PUT body:**
```json
{
  "role": "superadmin|admin|instructor|ta|student",
  "display_name": "string",
  "email": "string",
  "is_active": true
}
```

### Badges

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/admin/badges` | List/create badges |
| GET/PUT/DELETE | `/api/admin/badges/[id]` | Single badge CRUD |

### Assessment Submissions

| Method | Endpoint |
|---|---|
| GET/POST | `/api/admin/assessment-submissions` |
| GET/PUT | `/api/admin/assessment-submissions/[id]` |

### Assignment Submissions

| Method | Endpoint |
|---|---|
| GET/POST | `/api/admin/assignment-submissions` |
| GET/PUT | `/api/admin/assignment-submissions/[id]` |

### Gradebook

| Method | Endpoint |
|---|---|
| GET | `/api/admin/gradebook/[offeringId]` |

### Analytics

| Method | Endpoint |
|---|---|
| GET | `/api/admin/analytics/overview` |
| GET | `/api/admin/analytics/enrollments` |
| GET | `/api/admin/analytics/completion` |
| GET | `/api/admin/analytics/course/[offeringId]` |

### Sync

| Method | Endpoint |
|---|---|
| POST | `/api/admin/sync-static` | Import static JSON content to D1 |

## Student APIs

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/my/grades` | Bearer |
| GET | `/api/my/badges` | Bearer |
| GET | `/api/notifications` | Bearer |
| POST | `/api/notifications` | Admin only |
| PUT | `/api/notifications/[id]/read` | Bearer |
| PUT | `/api/notifications/read-all` | Bearer |

## Lesson APIs

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/lessons/[id]/access` | Bearer — check unlock/prereq |
| GET/POST | `/api/lessons/[id]/threads` | Bearer — discussion |
| GET/POST | `/api/lessons/[id]/threads/[threadId]/replies` | Bearer — replies |

**Access API response:**
```json
{
  "success": true,
  "data": {
    "accessible": true,
    "lesson_id": "...",
    "lesson_title": "...",
    "prerequisites": [
      {"lesson_id": "...", "title": "Prasyarat", "completed": true}
    ]
  }
}
```

## Error Format

```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP status: 200 (success), 400 (bad request), 401 (no auth), 403 (wrong role), 404 (not found), 500 (server error).
