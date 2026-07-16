# FSD-008: University Module

**Document ID:** FSD-008  
**Module:** University  
**Phase:** P7  
**Status:** Draft

---

## 1. Overview

University academic operations: faculties, study programs, course catalog, KRS workflow (draft→submit→approve), grade input, IP/IPK computation, transcript.

## 2. Routes

| Route | Method | Purpose | Auth |
|---|---|---|---|
| `/t/[slug]/admin/fakultas` | GET | Faculty list | admin |
| `/t/[slug]/admin/prodi` | GET | Study program list | admin |
| `/t/[slug]/admin/katalog-matkul` | GET | Course catalog | admin |
| `/t/[slug]/admin/katalog-matkul` | POST | Add course | admin |
| `/t/[slug]/admin/semester` | GET | Semester mgmt | admin |
| `/t/[slug]/mahasiswa/krs` | GET | KRS page | mahasiswa |
| `/t/[slug]/mahasiswa/krs` | POST | Submit KRS | mahasiswa |
| `/t/[slug]/kaprodi/krs/pending` | GET | Pending KRS list | kaprodi |
| `/t/[slug]/kaprodi/krs/[id]/approve` | POST | Approve KRS | kaprodi |
| `/t/[slug]/kaprodi/krs/[id]/reject` | POST | Reject KRS | kaprodi |
| `/t/[slug]/dosen/nilai/[kelasKuliahId]` | GET | Grade input | dosen |
| `/t/[slug]/dosen/nilai/[kelasKuliahId]` | POST | Save grades | dosen |
| `/t/[slug]/mahasiswa/transkrip` | GET | View transcript | mahasiswa |
| `/t/[slug]/mahasiswa/transkrip/print` | GET | PDF transcript | mahasiswa |
| `/t/[slug]/admin/transkrip/[userId]/print` | GET | Admin print transcript | admin |

## 3. Data Model

```sql
CREATE TABLE faculties (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  dean_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE study_programs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  faculty_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  degree_type TEXT DEFAULT 's1',
  total_sks INTEGER DEFAULT 144,
  accreditation TEXT,
  kaprodi_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE academic_semesters (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  study_program_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('ganjil','genap','pendek')),
  year TEXT NOT NULL,
  is_active INTEGER DEFAULT 0,
  start_date TEXT,
  end_date TEXT,
  drop_deadline TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE course_catalog (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  study_program_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  sks INTEGER NOT NULL,
  sks_praktikum INTEGER DEFAULT 0,
  semester_level INTEGER,
  type TEXT DEFAULT 'wajib',
  kurikulum TEXT,
  prasyarat TEXT,
  deskripsi TEXT,
  learning_outcomes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE kelas_kuliah (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  course_catalog_id TEXT NOT NULL,
  academic_semester_id TEXT NOT NULL,
  code TEXT NOT NULL,
  dosen_id TEXT NOT NULL,
  schedule_json TEXT,
  max_students INTEGER,
  current_students INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE krs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  academic_semester_id TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  total_sks INTEGER DEFAULT 0,
  ip_semester REAL,
  approved_by TEXT,
  approved_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE krs_items (
  id TEXT PRIMARY KEY,
  krs_id TEXT NOT NULL,
  kelas_kuliah_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  dropped_at TEXT,
  grade_letter TEXT,
  grade_numeric REAL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(krs_id, kelas_kuliah_id)
);

CREATE TABLE transcript_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  course_catalog_id TEXT NOT NULL,
  kelas_kuliah_id TEXT,
  academic_semester_id TEXT NOT NULL,
  grade_letter TEXT,
  grade_numeric REAL,
  sks INTEGER NOT NULL,
  is_remedial INTEGER DEFAULT 0,
  is_repeated INTEGER DEFAULT 0,
  graded_by TEXT,
  graded_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);
```

## 4. KRS Workflow

```
┌─────────┐     ┌──────────┐     ┌──────────┐
│ DRAFT   │────>│SUBMITTED │────>│APPROVED  │
│ Student │     │           │     │          │
│ adds    │     │ Kaprodi/ │     │ Grades   │
│ courses │     │ Dosen Wali│     │ input    │
│         │     │ reviews   │     │ opens    │
└─────────┘     └────┬─────┘     └──────────┘
                     │
                     ▼
              ┌──────────┐
              │REVISION │
              │ Kaprodi │
              │ requests│
              │ changes │
              └──────────┘
```

## 5. Grade Conversion

| Grade | Range | Point |
|---|---|---|
| A | ≥85 | 4.0 |
| A- | 80-84 | 3.7 |
| B+ | 75-79 | 3.3 |
| B | 70-74 | 3.0 |
| B- | 65-69 | 2.7 |
| C+ | 60-64 | 2.3 |
| C | 55-59 | 2.0 |
| D | 40-54 | 1.0 |
| E | <40 | 0.0 |

## 6. Validation

| Rule | Message |
|---|---|
| KRS > 24 SKS | "Maksimal 24 SKS per semester" |
| Prerequisite not passed | "Selesaikan [course] terlebih dahulu" |
| Duplicate course in KRS | "Mata kuliah sudah ada di KRS" |
| Class full | "Kelas penuh (max [n] mahasiswa)" |
| KRS already approved | "KRS sudah disetujui" |
