# FSD-006: Private Tutor Module

**Document ID:** FSD-006  
**Module:** Private Tutor  
**Phase:** P6  
**Status:** Draft

---

## 1. Overview

Complete private tutoring operations: student management, session scheduling with calendar, progress notes, package billing, and parent portal.

## 2. Routes

| Route | Method | Purpose | Auth |
|---|---|---|---|
| `/t/[slug]/tutor/jadwal` | GET | Calendar weekly view | tutor |
| `/t/[slug]/tutor/jadwal` | POST | Create session | tutor |
| `/t/[slug]/tutor/jadwal/[id]` | PUT | Update session | tutor |
| `/t/[slug]/tutor/jadwal/[id]/selesai` | POST | Complete session | tutor |
| `/t/[slug]/tutor/siswa` | GET | Student list | tutor |
| `/t/[slug]/tutor/siswa/[id]` | GET | Student detail + progress | tutor |
| `/t/[slug]/tutor/siswa/[id]/paket` | POST | Create package | tutor |
| `/t/[slug]/tutor/sesi/[id]/catatan` | POST | Save session notes | tutor |
| `/t/[slug]/tutor/keuangan` | GET | Billing overview | tutor |
| `/t/[slug]/murid/jadwal` | GET | Student session view | student |
| `/t/[slug]/murid/progres` | GET | Student progress | student |
| `/t/[slug]/wali-murid/anak/[id]` | GET | Parent view | parent |

## 3. Data Model

```sql
CREATE TABLE learning_packages (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('privat_sessions','bimbel_batch','kelompok_kecil','langganan','paket_tryout')),
  duration_sessions INTEGER,
  duration_days INTEGER,
  price REAL,
  max_students INTEGER,
  subjects TEXT,
  includes_tryout INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE batch_enrollments (  -- also used for tutor's student packages
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  batch_id TEXT,                    -- null for private 1-on-1
  user_id TEXT NOT NULL,
  package_id TEXT,
  enrollment_date TEXT DEFAULT (datetime('now')),
  paid_amount REAL,
  payment_status TEXT DEFAULT 'pending',
  remaining_sessions INTEGER,
  status TEXT DEFAULT 'active',
  UNIQUE(batch_id, user_id)
);

CREATE TABLE tutoring_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  batch_id TEXT,
  tutor_id TEXT NOT NULL,
  student_id TEXT,
  type TEXT NOT NULL CHECK(type IN ('privat_1on1','bimbel_kelas','kelompok_kecil','online','tryout')),
  title TEXT,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_minutes INTEGER,
  room TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  materials TEXT,
  homework JSON,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE session_attendance (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  time_in TEXT,
  minutes_late INTEGER DEFAULT 0,
  recorded_by TEXT,
  UNIQUE(session_id, user_id)
);

CREATE TABLE session_progress (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  topic_covered TEXT,
  understanding_level TEXT CHECK(understanding_level IN ('paham','cukup','kurang','tidak_paham')),
  notes TEXT,
  next_session_plan TEXT,
  homework_given TEXT,
  homework_completed INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE billing_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  package_id TEXT,
  batch_id TEXT,
  invoice_number TEXT UNIQUE,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  discount REAL DEFAULT 0,
  total REAL NOT NULL,
  status TEXT DEFAULT 'unpaid',
  due_date TEXT,
  paid_at TEXT,
  payment_method TEXT,
  payment_proof TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

## 4. UI: Tutor Calendar

```
┌──────────────────────────────────────────────────────┐
│  Jadwal — Kak Tono                    [Minggu Ini]  │
│  ┌────────────┬──────────┬──────────┬──────┬────────┐│
│  │ Senin 20/7 │ Sel 21/7 │ Rab 22/7 │ Kam  │ Jum    ││
│  ├────────────┼──────────┼──────────┼──────┼────────┤│
│  │ 15:00-16:30│          │ 15:00-   │      │        ││
│  │ Matematika │          │ 16:30    │      │        ││
│  │ 🟢 Rudi   │          │ 🟡 Siti  │      │        ││
│  │            │          │          │      │        ││
│  │ 17:00-18:30│          │          │      │        ││
│  │ Fisika     │          │          │      │        ││
│  │ 🟢 Alex   │          │          │      │        ││
│  └────────────┴──────────┴──────────┴──────┴────────┘│
│  [+ Tambah Sesi]                                     │
└──────────────────────────────────────────────────────┘

Color legend: 🟢 Scheduled  🟡 Ongoing  ✅ Completed  🔴 Cancelled
```

## 5. Validation

| Rule | Message |
|---|---|
| Session time conflict | "Jadwal bentrok dengan sesi [title]" |
| Package session count 0 | "Sisa sesi habis. Minta top-up paket." |
| Past date can't be scheduled | "Tidak bisa membuat sesi di masa lalu" |
