# FEATURES.md — RPL AI LMS Master Feature List

**Last updated:** 2026-08-08 (commit `5e4bf02`, deploy `d0004e58`)
**Source of truth:** this file — generated from live `src/routes/**` + `migrations/**` inventory.
**Inventory:** 647 routes · 225 tables · 104 migrations (run `python3 tools/inventory-routes.py --markdown` to refresh).
**Status legend:** ✅ Live & deployed · 🚧 Partial / needs work · 🔜 Planned
**Convention:** One feature = one row. Feature IDs are stable references for agents/docs. When adding a feature, add a row here first.

---

## EPIC 1: Auth & Identity (EP-AUTH)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-0101 | Register (student/instructor/parent) + login + logout, JWT cookie `lms_token` (HttpOnly Secure SameSite=Lax, 7d) | ✅ | `api/auth/register/*`, `api/auth/login`, `api/auth/logout`, `(auth)/*` | `users` |
| FE-0102 | OAuth Google/GitHub + role binding from DB on callback | ✅ | `api/auth/oauth`, `api/auth/oauth/redirect/[provider]`, `api/auth/callback` | `oauth_users` |
| FE-0103 | Email verification (MailChannels, token flow) | ✅ | `api/auth/verify-email`, `api/auth/resend-verification` | `email_verification_tokens` |
| FE-0104 | Forgot/reset password + token check | ✅ | `api/auth/forgot-password`, `api/auth/reset-password`, `api/auth/check-reset-token/[token]` | `password_reset_tokens` |
| FE-0105 | 2FA TOTP + recovery codes | ✅ | `api/auth/2fa/*` | `users` |
| FE-0106 | Roles: `superadmin/admin/instructor/ta/student/parent/guardian`; hooks auto-guard `/api/admin/` + parent guard | ✅ | `src/hooks.server.ts`, `api/auth/me` | `users`, `tenant_users` |
| FE-0107 | Parent portal: register w/ child code, dashboard + per-child detail | ✅ | `parent/*`, `api/parent/overview`, `api/admin/parent-portal/*` | `parent_accounts`, `parent_student_links`, `parent_access_log` |

## EPIC 2: Tenancy & School Ops (EP-TENANT)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-0201 | Tenant CRUD, config, routing, dashboard | ✅ | `api/admin/tenants*`, `admin/tenants/*` | `tenants`, `tenant_users` |
| FE-0202 | Academic periods + semesters | ✅ | `api/admin/academic-periods*`, `api/admin/academic-semesters*` | `academic_semesters`, `academic_periods` |
| FE-0203 | Academic calendar (event types: semester/holiday/exam/event/deadline, color, range) | ✅ | `api/admin/academic-calendar*`, `api/my/schedules` | `academic_calendar` |
| FE-0204 | Notifications: queue, templates, channels, unread count, read-all, settings | ✅ | `api/notifications*`, `api/admin/notifications/*` | `notifications`, `notification_templates`, `notification_queue`, `notification_preferences` |
| FE-0205 | Announcements (global + per-role) + read tracking | ✅ | `api/announcements`, `api/admin/announcements*`, `api/my/announcements*` | `announcements`, `announcement_reads` |
| FE-0206 | Activity feed + audit logs | ✅ | `api/activity/*`, `api/admin/activity-logs` | `activity_log`, `activity_feed` |
| FE-0207 | Error logs + system health (db/env/health) | ✅ | `api/admin/error-logs`, `api/admin/system/*` | `error_logs` |
| FE-0208 | Backup / restore export-import (S3-compatible keyed) | ✅ | `api/admin/export-import*` | — |

## EPIC 3: Catalog, Enrollment, Commerce (EP-COMMERCE)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-0301 | Courses, offerings, bundles, catalog, search, wishlist, reviews | ✅ | `api/my/catalog`, `api/my/courses/search`, `api/bundles*`, `api/wishlist/*`, `api/reviews*`, `catalog`, `search` | `courses`, `course_offerings`, `bundles`, `bundle_items`, `wishlist`, `reviews` |
| FE-0302 | Enrollment mgmt + bulk import/export/template | ✅ | `api/admin/enrollments*` | `enrollments`, `enrollment_logs` |
| FE-0303 | Coupons + validate + redeem | ✅ | `api/admin/coupons*`, `api/coupons/*` | `coupons`, `coupon_redemptions` |
| FE-0304 | Midtrans Snap payment + webhook verify + invoices + fee structures + refunds | ✅ | `api/payment/midtrans/*`, `api/payment/[invoiceId]/status`, `api/admin/payment-gateway/*` | `invoices`, `invoice_items`, `payments`, `payment_attempts`, `payment_callbacks`, `payment_methods`, `fee_structures`, `refunds` |
| FE-0305 | Bundle checkout + orders | ✅ | `api/payment/bundle/checkout` | `bundle_orders`, `orders`, `order_items` |
| FE-0306 | Offering ↔ class binding (`class_id` nullable) + auto-enroll class members | ✅ | `api/instructor/courses` (POST w/ `class_id`), `api/instructor/courses` (GET w/ `class_name`) | `course_offerings.class_id` |
| FE-0307 | Course prerequisites | ✅ | `api/admin/courses/[slug]/prerequisites`, `api/admin/prerequisites*` | `course_prerequisites`, `prerequisites` |
| FE-0308 | Assign instructor to offering | ✅ | `api/admin/course-offerings/assign-instructor` | `course_offerings` |

## EPIC 4: Content & Authoring (A-CONTENT)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-0401 | Modules + lessons + content blocks + resources + reorder (admin) | ✅ | `api/admin/modules*`, `api/admin/lessons*`, `api/admin/content-blocks*`, `api/admin/lessons/[lessonId]/resources*` | `lessons`, `lesson_content_blocks`, `content_blocks`, `lesson_resources` |
| FE-0402 | Instructor course builder (offering-scoped lessons, docs, publish) | ✅ | `api/instructor/courses/[offeringId]/lessons*`, `instructor/courses/[id]/*` | `lessons`, `lesson_aiedu_docs` |
| FE-0403 | Content migration: export/import offering | ✅ | `api/admin/course-migration/*` | `course_offerings` |
| FE-0404 | Static curriculum sync + content tree | ✅ | `api/admin/sync-static`, `api/admin/courses` | `courses`, `curricula` |
| FE-0405 | Slide decks | ✅ | `slides/*`, `api/slides*` | `slides` |

## EPIC 5: Learning Experience (A-LEARN)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-0501 | Learn: lesson player, syllabus, progress, leaderboard | ✅ | `learn/[offeringId]/*`, `api/my/courses/[offeringId]/*`, `api/lessons/[id]/access` | `lessons`, `lesson_completions`, `course_completions` |
| FE-0502 | Progress/XP/streaks/daily-login + planner + notes + bookmarks + practice queue + flashcards (SM-2) | ✅ | `api/my/progress*`, `api/gamification/daily-login`, `api/planner*`, `api/my/notes`, `api/my/bookmarks`, `api/flashcards`, `flashcards/*` | `progress`, `xp_transactions`, `user_streaks`, `study_plans`, `notes`, `bookmarks`, `flashcards`, `practice_queue` |
| FE-0503 | AI-assisted express: lesson context injection (`lesson_id` + `lesson_context`) | ✅ | `api/aiedu/chat*` | `aiedu_chat_threads` |
| FE-0504 | Discussion + mentions + likes per lesson | ✅ | `api/lessons/[lessonId]/discussions*`, `api/discussions` | `lesson_discussions`, `discussion_likes`, `discussion_replies` |
| FE-0505 | Course reviews | ✅ | `api/courses/[offeringId]/reviews`, `api/reviews*` | `reviews` |
| FE-0506 | Tryout packaged + analysis + ranking | ✅ | `tryout/*`, `api/tryout/*` | `tryout_sessions`, `tryout_analysis` |

## EPIC 6: Assessment & Practice (A-ASSESS)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-0601 | Quizzes (module) + attempt + auto-grade | ✅ | `api/quiz`, `quiz/*`, `progress-quiz/*` | `quiz_answers` |
| FE-0602 | Assessments (admin/instructor) + questions + student attempt + submissions | ✅ | `api/admin/assessments*`, `api/instructor/assessments`, `api/my/assessments/[id]/attempt` | `assessments`, `assessment_questions`, `assessment_submissions` |
| FE-0603 | Question bank (admin) + AI generate (material→MCQ) + import | ✅ | `api/admin/question-bank*`, `api/aiedu/soal/generate`, `api/aiedu/soal/import` | `question_bank` |
| FE-0604 | Exercises per module | ✅ | `api/admin/exercises*`, `exercises/*` | `exercises` |
| FE-0605 | Educator essay grading (AI) | ✅ | `api/instructor/grade-essay` | — |
| FE-0606 | Submission grading (admin + instructor review UI + grade) | ✅ | `api/admin/submissions/[id]/grade`, `instructor/courses/[id]/submissions*`, `api/instructor/courses/[offeringId]/submissions*` | `submissions` |
| FE-0607 | Live Quiz (real-time classroom: instructor hosts via 6-digit PIN, students join, per-question polling timer, instant grading, live leaderboard) | ✅ | `instructor/live-quiz/*`, `live-quiz/*`, `api/instructor/live-quizzes*`, `api/my/live-quiz/*` | `live_quizzes`, `live_quiz_participants`, `live_quiz_responses` |

## EPIC 7: AIEdu (A-AIEDU)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-0701 | AIEdu chat (threads, lesson context, voice input id-ID, TTS read-aloud) | ✅ | `api/aiedu/chat*`, `aiedu/chat` | `aiedu_chat_threads`, `aiedu_chat_messages`, `aiedu_documents` |
| FE-0702 | AI generation (doc/soal/test) + save-to-bank | ✅ | `api/aiedu/generate`, `api/aiedu/generations*`, `api/aiedu/soal/generate`, `api/aiedu/soal/import` | `aiedu_generations`, `question_bank` |
| FE-0703 | AI analysis (gradebook, essay) + rapor + history | ✅ | `api/aiedu/analyze*`, `api/aiedu/rapors*`, `aiedu/analisis`, `aiedu/rapor` | `aiedu_analyses`, `aiedu_rapors` |
| FE-0704 | AI tutor (private tutoring session) | ✅ | `api/ai/tutor`, `ai/tutor` | `tutor_sessions` |
| FE-0705 | AI grade essay | ✅ | `api/instructor/grade-essay` | — |

## EPIC 8: Community & Collaboration (A-SOCIAL)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-0801 | Lesson discussions (threads, replies, likes, mentions) | ✅ | `api/lessons/[lessonId]/discussions*`, `api/lessons/[id]/threads*` | `lesson_discussions`, `discussion_likes`, `discussion_replies`, `discussion_threads` |
| FE-0802 | Chat (course chat) | ✅ | `api/chat/[offeringId]`, `api/chat/send`, `my/chat/*` | `course_chat` |
| FE-0803 | Groups (create/join/leave, member list, messages) | ✅ | `api/groups*`, `groups/*` | `groups`, `group_members`, `group_messages` |
| FE-0804 | Live classes (stream/virtual) | ✅ | `api/admin/live-classes*`, `my/live`, `live-classes/*` | `live_classes` |
| FE-0805 | Mentorship | ✅ | `api/mentorship*`, `mentorship/*` | `mentorship_requests` |

## EPIC 9: Gamification (A-GAME)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-0901 | XP + levels + leaderboards (global/offering) | ✅ | `api/gamification/*`, `leaderboard/*` | `user_xp`, `xp_transactions`, `badges`, `user_badges` |
| FE-0902 | Quests + daily + streak freeze + boosts | ✅ | `api/gamification/quests*`, `api/gamification/freeze/buy`, `api/admin/gamification/*` | `quest_config`, `daily_quests`, `user_streak_freezes`, `xp_boost_events` |
| FE-0903 | XP rules + settings (admin) | ✅ | `api/admin/gamification/*` | `xp_rules`, `gamification_settings` |
| FE-0904 | Leaderboard (per offering + global) | ✅ | `api/gamification/leaderboard*`, `api/leaderboard`, `learn/[offeringId]/leaderboard` | `user_xp` |

## EPIC 10: Reporting & Analytics (A-ANALYTICS)

| ID | Feature | Status | Runs | Tables |
|---|---|---|---|---|
| FE-1001 | Student analytics (progress, grades, XP) | ✅ | `api/my/analytics`, `api/my/dashboard`, `my/progress/analytics` | `progress`, `xp`, `grades` |
| FE-1002 | Instructor analytics | ✅ | `api/instructor/courses/[id]/analytics` | `enrollments`, `submissions`, `assessments` |
| FE-1003 | Admin dashboard + analytics (enrollments, completion, attendance, grades, payments, distribution, export) | ✅ | `api/admin/analytics/*`, `api/admin/stats`, `admin/analytics` | `enrollments`, `payments`, `analytics` |
| FE-1004 | Recommendations / insights | ✅ | `api/recommendations/*`, `api/insights` | `recommendations`, `progress` |
| FE-1005 | Export own data (CSV/JSON) | ✅ | `api/my/export` | — |
| FE-1006 | Public network activity feed | ✅ | `api/activity/feed`, `api/activity/my-feed`, `feed` | `activity_feed` |

## EPIC 11: K13 School System (A-K13)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-1101 | School levels, grade levels, majors, classes, class members | ✅ | `api/admin/classes-structure/*` | `school_levels`, `grade_levels`, `majors`, `classes`, `class_members` |
| FE-1102 | Subjects + competencies (KD) | ✅ | `api/admin/classes-structure/subjects*`, `api/admin/classes-structure/competencies*` | `subjects`, `competencies`, `kompetensi_dasar` |
| FE-1103 | Teacher assignment | ✅ | `api/admin/classes-structure/teacher-subjects` | `class_subjects` |
| FE-1104 | Class sessions | ✅ | `api/admin/class-sessions*` | `class_sessions` |
| FE-1105 | CSV import students | ✅ | `api/admin/classes-structure/import-students` | `students`, `class_members` |
| FE-1106 | Attendance: sessions + QR check-in (admin/guru) + student self check-in + exceptions + rekap | ✅ | `api/admin/attendance/*`, `api/my/attendance/check-in`, `api/guru/absensi*`, `siswa/absensi` | `attendance_sessions`, `attendance_records`, `attendance_exceptions`, `attendance_records`, `attendance_summary` |
| FE-1107 | Exam scheduler (rooms, sessions, participants, conflicts) | ✅ | `api/admin/exam-scheduler/*`, `admin/exam-scheduler/*` | `exam_sessions`, `exam_rooms`, `exam_participants`, `exam_conflicts`, `exam_types` |

## EPIC 12: K13 Grading & Rapor (A-GRADE)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-1201 | Grading: PH/PTS/PAS, skills (4 types), sikap | ✅ | `api/guru/nilai/*` | `k13_ph`, `k13_pts`, `k13_pas`, `k13_skills`, `k13_attitude` |
| FE-1202 | Weight config + predikat | ✅ | `api/admin/gradebook/*/weight-config` | `k13_weight_config` |
| FE-1203 | Rapor K13 (generate, list, view, print A4 PDF) | ✅ | `api/guru/rapor/*`, `guru/rapor/*`, `siswa/rapor/*` | `rapor_k13`, `report_cards`, `report_card_batches` |
| FE-1204 | Report card batches (admin) | ✅ | `api/admin/report-cards/*` | `report_cards`, `report_card_batches`, `report_card_sections` |
| FE-1205 | Gradebook (offering-based, export, recalculate) | ✅ | `api/admin/gradebook/[offeringId]/*` | `gradebook`, `grade_weight_config` |
| FE-1206 | Sikap notes (attitude eval) | ✅ | `api/guru/nilai/sikap` | `k13_attitude` |

## EPIC 13: Parent Portal (A-PARENT)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-1301 | Parent link students + access log | ✅ | `api/admin/parent-portal/links*`, `api/admin/parent-portal/parents*` | `parent_student_links`, `parent_access_log` |
| FE-1302 | Parent dashboard (per student overview), messages | ✅ | `api/parent-portal/dashboard`, `api/parent-portal/messages*`, `parent/*` | `parent_accounts`, `parent_messages` |

## EPIC 14: Bimbel & Tryout (A-BIMBEL)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-1401 | Bimbel batch CRUD + enroll | ✅ | `api/bimbel/*`, `bimbel/*` | `bimbel_batches`, `bimbel_enrollments` |
| FE-1402 | Tryout packaged + ranking | ✅ | `api/bimbel/tryout/*`, `bimbel/tryout/*` | `tryout_batches`, `tryout_rankings` |
| FE-1403 | Keuangan | ✅ | `api/bimbel/keuangan`, `bimbel/keuangan` | `billing_records` |

## EPIC 15: Private Tutor (A-TUTOR)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-1501 | Tutor siswa + paket + sesi + absen + progres + billing | ✅ | `api/tutor/*`, `guru/tutor/*`, `tutor` | `tutoring_sessions`, `learning_packages`, `tutor_students`, `tutor_billing` |
| FE-1502 | Bimbel (batch) management | ✅ | `api/bimbel/*` | `tryout_batches` |

## EPIC 16: University (A-UNIV)

| ID | Feature | Status | Key routes | Tables |
|---|---|---|---|---|
| FE-1601 | Faculty/prodi/classes | ✅ | `api/admin/faculties*`, `api/admin/study-programs*` | `faculties`, `study_programs` |
| FE-1602 | KRS (register, approve/reject via kaprodi) | ✅ | `api/kaprodi/krs*`, `api/mahasiswa/krs*`, `kaprodi/krs`, `mahasiswa/krs` | `krs`, `krs_items` |
| FE-1603 | Grade input (dosen) | ✅ | `dosen/*`, `api/dosen/*` | `kelas`, `kelas_kuliah`, `transcript_records` |
| FE-1604 | Transcript (IPK auto) + graduation check | ✅ | `api/mahasiswa/transkrip`, `mahasiswa/transkrip` | `transcript_records` |

## EPIC 17: System & Ops (A-OPS)

| ID | Feature | Status | Key routes |
|---|---|---|---|
| FE-1701 | Health check, system env/db view, error-logs | ✅ | `api/admin/system/*`, `api/admin/error-logs`, `api/health` |
| FE-1702 | DB backup/restore via export-import S3 | ✅ | `api/admin/export-import/*`, `api/admin/export-import/backup`, `api/admin/export-import/restore` |
| FE-1703 | Cron reminders (6h) | ✅ | `api/cron/reminders` |
| FE-1704 | Discord notify + webhooks | ✅ | `api/discord/notify` |
| FE-1705 | PWA (manifest + service worker) | ✅ | `static/manifest.json`, `static/sw.js` |
| FE-1706 | Media upload (R2) + revalidate uploads | ✅ | `api/upload*`, `api/admin/media/*` |
| FE-1707 | SEO (sitemap, robots) | ✅ | `sitemap.xml`, `robots.txt` |

---

## Feature gaps / not-yet-built (candidates)

| ID | Feature | Status | Notes |
|---|---|---|---|
| FE-9991 | Dark mode | 🔜 | Only toggle exists; no full dark theming |
| FE-9992 | Groups (member content) | 🔜 | Skeleton — no member interactions |
| FE-9993 | Teacher/student direct messaging (1:1) | 🔜 | Only course chat + parent messages exist |
| FE-9994 | Live quizzes during class | 🔜 | — |
| FE-9995 | Offline-first PWA (cache) | 🔜 | sw exists, no full offline data |
| FE-9996 | SSO / SAML / LDAP | 🔜 | OAuth only |

---

## Agent instructions (AGENTS.md reference)

- **Source of truth:** this file + `docs/database-schema.md` + migration `0100+` for latest schema.
- **Adding a feature?** → add row in the right EPIC here first, then code.
- **Route → table map:** use `docs/FEATURES.md` EPIC rows above; detailed schema in `docs/database-schema.md`.
- **Never edit this file manually without running the inventory script** (see `tools/inventory-routes.py`).
- Feature IDs are referenced in docs (`docs/PRD/PRD-004-features.md` old numbering is legacy — new IDs are FE-XXXX in this file).