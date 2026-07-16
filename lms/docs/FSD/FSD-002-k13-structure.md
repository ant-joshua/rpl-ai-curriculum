# FSD-002: K13 School Structure Module

**Document ID:** FSD-002  
**Module:** K13 School — Structure  
**Phase:** P2  
**Status:** Draft

---

## 1. Overview

Academic structure for formal K13 schools: school levels, grade levels, majors, classes, subjects, Kompetensi Dasar, and teacher assignments.

## 2. Routes

| Route | Method | Purpose | Auth |
|---|---|---|---|
| `/t/[slug]/admin/struktur/tingkat` | GET | List school levels | admin |
| `/t/[slug]/admin/struktur/tingkat` | POST | Create level | admin |
| `/t/[slug]/admin/struktur/kelas` | GET | List classes | admin |
| `/t/[slug]/admin/struktur/kelas` | POST | Create class | admin |
| `/t/[slug]/admin/struktur/kelas/[id]` | GET | Class detail + students | admin/teacher |
| `/t/[slug]/admin/struktur/jurusan` | GET | List majors | admin |
| `/t/[slug]/admin/struktur/jurusan` | POST | Create major | admin |
| `/t/[slug]/admin/struktur/mapel` | GET | List subjects | admin |
| `/t/[slug]/admin/struktur/mapel` | POST | Create subject | admin |
| `/t/[slug]/admin/struktur/mapel/[id]` | GET | Subject detail + KD | admin/teacher |
| `/t/[slug]/admin/struktur/kd` | POST | Add KD (batch) | admin |
| `/t/[slug]/admin/struktur/guru-mapel` | GET | Teacher assignments | admin |
| `/t/[slug]/admin/struktur/guru-mapel` | POST | Assign teacher | admin |
| `/t/[slug]/admin/struktur/import-siswa` | GET | Import page | admin |
| `/t/[slug]/admin/struktur/import-siswa` | POST | CSV upload + process | admin |

## 3. Data Model

### 3.1 Core Tables

```sql
CREATE TABLE school_levels (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,                -- 'SD', 'SMP', 'SMA', 'SMK', 'MA'
  slug TEXT NOT NULL,
  education_level TEXT DEFAULT 'menengah',  -- dasar|menengah|tinggi
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE grade_levels (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  school_level_id TEXT NOT NULL,
  name TEXT NOT NULL,                -- 'X', 'XI', 'XII' or '1', '2', ... '6'
  sequence INTEGER NOT NULL,         -- 10, 11, 12 or 1-6
  semester_count INTEGER DEFAULT 2,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE majors (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,                -- 'IPA', 'IPS', 'RPL', 'AKL'
  code TEXT,
  type TEXT DEFAULT 'umum',          -- umum|kejuruan|agama
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE classes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  grade_level_id TEXT NOT NULL,
  major_id TEXT,                     -- null for SD/SMP or non-major
  name TEXT NOT NULL,                -- 'X IPA 1', 'XI RPL A', '3 SD A'
  code TEXT,                         -- '10-IPA-1', '11-RPL-A'
  academic_period_id TEXT NOT NULL,
  homeroom_teacher_id TEXT,
  room TEXT,
  shift TEXT DEFAULT 'pagi',         -- pagi|siang
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE class_members (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'student',       -- student|assistant
  status TEXT DEFAULT 'active',
  nis TEXT,                          -- NIS number
  nisn TEXT,                         -- NISN national
  joined_at TEXT DEFAULT (datetime('now')),
  left_at TEXT,
  UNIQUE(class_id, user_id)
);

CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,                -- 'Matematika Wajib'
  code TEXT,                         -- 'MAT-W'
  curriculum TEXT DEFAULT 'k13',     -- k13|merdeka|kustom
  type TEXT DEFAULT 'wajib',         -- wajib|peminatan|lintas_minat|muatan_lokal|ekstrakurikuler
  major_id TEXT,
  grade_level_id TEXT,
  group_name TEXT,                   -- A|B|C
  description TEXT,
  min_hours_per_week INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE kompetensi_dasar (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  code TEXT NOT NULL,                -- '3.1', '4.2'
  type TEXT NOT NULL,                -- pengetahuan|keterampilan|spiritual|sosial
  competence_type TEXT NOT NULL,     -- ki_1|ki_2|ki_3|ki_4|kd_3|kd_4
  description TEXT NOT NULL,
  grade_level_id TEXT,
  semester INTEGER,                  -- 1 (ganjil) | 2 (genap)
  topics TEXT,                       -- JSON array
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE class_subjects (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  total_hours_per_week INTEGER,
  semester INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  kd_list TEXT,                      -- JSON: selected KD IDs for this semester
  UNIQUE(class_id, subject_id, semester)
);
```

## 4. UI Specifications

### 4.1 Class List Page

```
┌──────────────────────────────────────────────┐
│  Kelas — SMA Kembang                 [+ Baru] │
├──────┬─────────┬──────────┬─────────┬─────────┤
│ Kelas│ Wali    │ Jurusan  │ Siswa   │ Aksi    │
├──────┼─────────┼──────────┼─────────┼─────────┤
│X IPA1│ Ani, S.Pd│ IPA      │ 32/36   │ ✏️ 🗑️  │
│X IPA2│ Budi,.. │ IPA      │ 30/36   │ ✏️ 🗑️  │
│XI IPA1│ ...    │ IPA      │ 28/36   │ ✏️ 🗑️  │
└──────┴─────────┴──────────┴─────────┴─────────┘
```

### 4.2 Create Class Form

```
┌──────────────────────────────────────┐
│ Buat Kelas Baru                      │
│                                      │
│ Tingkat: [SMA        ▼]             │
│ Kelas:   [X          ▼]             │
│ Jurusan: [IPA        ▼]             │
│ Wali:    [Ibu Ani, S.Pd        ▼]   │
│ Ruang:   [RK-101                    ]│
│                                      │
│ Nama otomatis: X IPA 1               │
│ Urutan: 1                            │
│                                      │
│               [Batal]    [Simpan]    │
└──────────────────────────────────────┘
```

### 4.3 CSV Import Preview

```
┌───────────────────────────────────────────────┐
│ Import Siswa dari CSV                          │
│ [Download Template CSV]  [Pilih File] 📎      │
├───────────────────────────────────────────────┤
│ Preview (10 of 50 baris ditemukan):           │
│ ┌───────┬──────────────┬──────────┬─────────┐ │
│ │ NIS   │ Nama         │ Kelas    │ NISN    │ │
│ ├───────┼──────────────┼──────────┼─────────┤ │
│ │ 12345 │ Budi Santoso │ X IPA 1 │ 9987654 │ │
│ │ 12346 │ Siti Rahayu  │ X IPA 1 │ 9987655 │ │
│ └───────┴──────────────┴──────────┴─────────┘ │
│                                                │
│ Ringkasan: 48 baru, 2 duplikat (skip), 0 error │
│                                                │
│                    [Batal]    [Import 48 Siswa] │
└────────────────────────────────────────────────┘
```

## 5. Validation Rules

| Rule | Entity | Error Message |
|---|---|---|
| Unique class name per tenant | class | "Nama kelas sudah digunakan" |
| KD code format `{ki}.{number}` | kd | "Format KD tidak valid" |
| NIS unique within tenant | class_members | "NIS sudah terdaftar" |
| Teacher must be active | class_subjects | "Guru tidak aktif" |
| CSV requires nis, nama, kelas columns | import | "CSV harus memiliki kolom nis, nama, kelas" |

## 6. Error Scenarios

| Scenario | HTTP | Message |
|---|---|---|
| Class name duplicate | 409 | "Nama kelas sudah digunakan" |
| Invalid KD code | 400 | "Format KD tidak valid. Gunakan format 3.1" |
| CSV no rows | 400 | "File CSV tidak boleh kosong" |
| CSV wrong columns | 400 | "Kolom nis, nama, dan kelas wajib ada" |
| Teacher not in tenant | 404 | "Guru tidak ditemukan" |
