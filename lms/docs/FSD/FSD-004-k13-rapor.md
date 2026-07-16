# FSD-004: K13 Rapor Module

**Document ID:** FSD-004  
**Module:** K13 — Rapor  
**Phase:** P4  
**Status:** Draft

---

## 1. Overview

Rapor K13 generation: preview, finalize, PDF print, batch printing. The output must match Indonesian K13 rapor standards.

## 2. Routes

| Route | Method | Purpose | Auth |
|---|---|---|---|
| `/t/[slug]/guru/kelas/[id]/rapor` | GET | Rapor list per class + finalize | teacher/wali |
| `/t/[slug]/guru/rapor/[studentId]/preview` | GET | Preview single rapor | teacher/wali |
| `/t/[slug]/guru/rapor/[studentId]/finalize` | POST | Lock rapor | wali kelas |
| `/t/[slug]/guru/rapor/[studentId]/print` | GET | Print-optimized rapor PDF | teacher/TU |
| `/t/[slug]/admin/rapor/batch-print/[classId]` | GET | Print all students | TU |
| `/t/[slug]/siswa/rapor/[semester]` | GET | Student rapor view | student |
| `/t/[slug]/siswa/rapor/[semester]/print` | GET | Print own rapor | student |

## 3. Data Model

```sql
CREATE TABLE rapor_k13 (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  academic_period_id TEXT NOT NULL,
  semester INTEGER NOT NULL,
  status TEXT DEFAULT 'draft',
  printed_count INTEGER DEFAULT 0,
  -- Per-subject summary (JSON for performance)
  subject_grades TEXT,
  -- Attendance summary
  attendance_sick INTEGER DEFAULT 0,
  attendance_permit INTEGER DEFAULT 0,
  attendance_absent INTEGER DEFAULT 0,
  -- Attitude
  attitude_spiritual TEXT,
  attitude_spiritual_desc TEXT,
  attitude_social TEXT,
  attitude_social_desc TEXT,
  -- Extracurricular
  extracurriculars TEXT,  -- JSON array
  -- Notes
  homeroom_notes TEXT,
  semester_notes TEXT,
  -- Audit
  finalized_by TEXT,
  finalized_at TEXT,
  printed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

## 4. Rapor PDF Specification

### 4.1 Layout (A4 Portrait)

```
┌────────────────────────────────────────────────┐
│     SEKOLAHKU SMA                               │
│  Jl. Pendidikan No. 1, Jakarta                  │
│  NPSN: 12345678   Akreditasi: A               │
│                                                  │
│            RAPOR PESERTA DIDIK                   │
│            SEMESTER GANJIL 2025/2026             │
│                                                  │
│  NIS: 12345          Kelas: X IPA 1             │
│  Nama: Budi Santoso  Wali Kelas: Ani, S.Pd   │
├────────────────────────────────────────────────┤
│  A. PENGETAHUAN                                 │
│  ┌────┬──────────────┬─────┬─────┬────┬────┬───┤ │
│  │ No │ Mata Pelajaran│ PH  │PTS │PAS │ NA │Pr │ │
│  ├────┼──────────────┼─────┼─────┼────┼────┼───┤ │
│  │ 1  │ Pend Agama   │ 85  │ 80  │ 90 │ 86 │ B │ │
│  │ 2  │ PPKn         │ 90  │ 88  │ 92 │ 91 │ B │ │
│  │ 3  │ Bhs Indonesia│ 78  │ 82  │ 80 │ 80 │ B │ │
│  │    │ ...          │     │     │    │    │   │ │
│  └────┴──────────────┴─────┴─────┴────┴────┴───┘ │
│                                                  │
│  B. KETERAMPILAN                                 │
│  ┌────┬──────────────┬────────┬────┬────┐       │
│  │ No │ Mata Pelajaran│ Praktik│ NA │ Pr │       │
│  ├────┼──────────────┼────────┼────┼────┤       │
│  │ 1  │ Pend Agama   │ 88     │ 88 │ B  │       │
│  └────┴──────────────┴────────┴────┴────┘       │
│                                                  │
│  C. SIKAP                                        │
│  Spiritual: SB (Sangat Baik)                     │
│  - Selalu bersyukur dan berdoa sebelum belajar  │
│  Sosial: B (Baik)                                │
│  - Aktif dalam kerja kelompok                    │
│                                                  │
│  D. EKSTRAKURIKULER                              │
│  Pramuka: SB   Basket: B                        │
│                                                  │
│  E. ABSENSI                                      │
│  Sakit: 2   Izin: 1   Alpha: 0                  │
│                                                  │
│  Catatan Wali Kelas:                             │
│  Budi memiliki potensi besar di bidang IPA.      │
│  Perlu meningkatkan kedisiplinan.                │
│                                                  │
│                          Jakarta, 20 Des 2025    │
│  Wali Kelas,                     Kepala Sekolah, │
│                                                  │
│  (Ani, S.Pd)                    (Drs. Rektor)    │
│  NIP. 123456                     NIP. 654321     │
│                                                  │
│  Status: FINALIZED                               │
└────────────────────────────────────────────────┘
```

## 5. Workflow

```
Grades complete
  │
  ▼
Wali kelas opens rapor preview → sees all subjects + NA
  │
  ├─ If incomplete → "Nilai [subject] belum lengkap" warning
  │
  ▼
Wali kelas writes homeroom notes
  │
  ▼
Click "Finalize" → confirmation dialog
  │  "Setelah difinalisasi, nilai tidak bisa diubah."
  │
  ▼
Status = 'finalized' → grades locked
  │
  ▼
TU prints → printed_count++
```

## 6. Validation

| Rule | Message |
|---|---|
| All subjects must have NA | "Nilai [subject] belum lengkap" |
| Attitude must be input | "Sikap spiritual/sosial belum diisi" |
| Attendance must be entered | "Absensi belum lengkap" |
| Homeroom notes required | "Catatan wali kelas wajib diisi" |
| Can't finalize if already finalized | "Rapor sudah difinalisasi" |
