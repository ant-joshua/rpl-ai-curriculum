# FSD-005: Attendance Module

**Document ID:** FSD-005  
**Module:** Attendance  
**Phase:** P5  
**Status:** Draft

---

## 1. Overview

Daily attendance tracking for K13 schools, bimbel, and tutoring. Per-class input, monthly recap, parent visibility.

## 2. Routes

| Route | Method | Purpose | Auth |
|---|---|---|---|
| `/t/[slug]/guru/kelas/[id]/absensi` | GET | Attendance input page | teacher |
| `/t/[slug]/guru/kelas/[id]/absensi` | POST | Save attendance | teacher |
| `/t/[slug]/guru/kelas/[id]/absensi/rekap` | GET | Monthly recap | teacher |
| `/t/[slug]/siswa/absensi` | GET | Student attendance view | student |
| `/t/[slug]/admin/absensi/rekap/[classId]` | GET | Admin rekap per class | admin/TU |
| `/api/tenant/attendance/[classId]/[date]` | GET | Get attendance for date | teacher |

## 3. Data Model

```sql
CREATE TABLE attendance (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  subject_id TEXT,                  -- null for general attendance
  status TEXT NOT NULL CHECK(status IN ('hadir','sakit','izin','alpha','dispensasi','terlambat')),
  time_in TEXT,
  minutes_late INTEGER DEFAULT 0,
  reason TEXT,
  documented_by TEXT,              -- bukti URL
  recorded_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(class_id, user_id, date, subject_id)
);

CREATE TABLE attendance_recaps (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  academic_period_id TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_hadir INTEGER DEFAULT 0,
  total_sakit INTEGER DEFAULT 0,
  total_izin INTEGER DEFAULT 0,
  total_alpha INTEGER DEFAULT 0,
  total_dispensasi INTEGER DEFAULT 0,
  total_terlambat INTEGER DEFAULT 0,
  percentage REAL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, academic_period_id, month, year)
);
```

## 4. UI: Attendance Input

```
┌──────────────────────────────────────────────┐
│ Absensi — X IPA 1                             │
│ Tanggal: [17/07/2026  📅]  Mapel: [Mat Wajib]│
├──────┬──────────┬──────────────────────┬──────┤
│ No   │ Nama     │ Status               │ Ket  │
├──────┼──────────┼──────────────────────┼──────┤
│ 1    │ Budi     │ ● Hadir  ○ Sakit ... │      │
│ 2    │ Siti     │ ○ Hadir  ● Sakit ... │ Surat│
│ 3    │ Rudi     │ ○ Hadir  ○ Sakit ... │      │
│ 4    │ Dinda    │ ○ Hadir  ○ Sakit ... │      │
├──────┼──────────┴──────────────────────┴──────┤
│      │ [Simpan]  [Reset]   [Rekap Bulanan]   │
└──────────────────────────────────────────────┘
```

Status radio per student row. Quick check: all hadir button.

## 5. Validation

| Rule | Message |
|---|---|
| Date must not be future | "Tanggal tidak boleh melebihi hari ini" |
| Duplicate entry same date | "Absensi tanggal [date] sudah diinput" |
| Recaps auto-computed on save | — |
