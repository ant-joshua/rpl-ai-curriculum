# FSD-003: K13 Grading Module

**Document ID:** FSD-003  
**Module:** K13 — Grading  
**Phase:** P3  
**Status:** Draft

---

## 1. Overview

Full K13 grading system: Pengetahuan (PH/PTS/PAS), Keterampilan, Sikap, remedial tracking, and auto-calculation of Nilai Akhir (NA) with predikat.

## 2. Routes

| Route | Method | Purpose | Auth |
|---|---|---|---|
| `/t/[slug]/guru/kelas/[id]/nilai-ph` | GET | PH input page | teacher |
| `/t/[slug]/guru/kelas/[id]/nilai-ph` | POST | Save PH batch | teacher |
| `/t/[slug]/guru/kelas/[id]/nilai-pts` | GET | PTS input page | teacher |
| `/t/[slug]/guru/kelas/[id]/nilai-pts` | POST | Save PTS | teacher |
| `/t/[slug]/guru/kelas/[id]/nilai-pas` | GET | PAS input page | teacher |
| `/t/[slug]/guru/kelas/[id]/nilai-pas` | POST | Save PAS | teacher |
| `/t/[slug]/guru/kelas/[id]/nilai-keterampilan` | GET | Skills input | teacher |
| `/t/[slug]/guru/kelas/[id]/nilai-keterampilan` | POST | Save skills | teacher |
| `/t/[slug]/guru/kelas/[id]/nilai-sikap` | GET | Attitude input | teacher |
| `/t/[slug]/guru/kelas/[id]/nilai-sikap` | POST | Save attitude | teacher |
| `/t/[slug]/guru/kelas/[id]/rekap` | GET | Grade recap + NA | teacher |
| `/t/[slug]/siswa/nilai` | GET | Student grade view | student |
| `/api/tenant/grades/calc/[classSubjectId]` | GET | Compute NA (JSON) | teacher |

## 3. Data Model

```sql
-- PENGETAHUAN - PH (Penilaian Harian)
CREATE TABLE k13_ph (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_subject_id TEXT NOT NULL,
  kompetensi_dasar_id TEXT NOT NULL,
  title TEXT,
  score REAL NOT NULL,
  max_score REAL DEFAULT 100,
  remedial_score REAL,
  semester INTEGER NOT NULL,
  graded_by TEXT,
  graded_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- PTS (Penilaian Tengah Semester)
CREATE TABLE k13_pts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_subject_id TEXT NOT NULL,
  semester INTEGER NOT NULL,
  score REAL NOT NULL,
  max_score REAL DEFAULT 100,
  remedial_score REAL,
  graded_by TEXT,
  graded_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- PAS (Penilaian Akhir Semester)
CREATE TABLE k13_pas (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_subject_id TEXT NOT NULL,
  semester INTEGER NOT NULL,
  score REAL NOT NULL,
  max_score REAL DEFAULT 100,
  remedial_score REAL,
  graded_by TEXT,
  graded_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- KETERAMPILAN (praktik, produk, proyek, portofolio)
CREATE TABLE k13_skills (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_subject_id TEXT NOT NULL,
  kompetensi_dasar_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('praktik','produk','proyek','portofolio')),
  title TEXT,
  score REAL NOT NULL,
  max_score REAL DEFAULT 100,
  remedial_score REAL,
  semester INTEGER NOT NULL,
  graded_by TEXT,
  graded_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- SIKAP (KI-1 Spiritual, KI-2 Sosial)
CREATE TABLE k13_attitude (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  competence_type TEXT NOT NULL CHECK(competence_type IN ('spiritual','sosial')),
  semester INTEGER NOT NULL,
  predikat TEXT NOT NULL CHECK(predikat IN ('SB','B','C','K')),
  deskripsi TEXT,
  graded_by TEXT,
  graded_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, class_id, competence_type, semester)
);

-- EKSTRAKURIKULER
CREATE TABLE k13_extracurricular (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  predikat TEXT NOT NULL CHECK(predikat IN ('SB','B','C','K')),
  deskripsi TEXT,
  semester INTEGER NOT NULL,
  academic_period_id TEXT NOT NULL,
  graded_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

## 4. Grade Calculation Logic

### 4.1 Pengetahuan

```typescript
function calcNilaiPengetahuan(phScores: number[], ptsScore: number, pasScore: number, weights: GradeWeights): number {
  const nph = phScores.reduce((a, b) => a + b, 0) / phScores.length;
  return (nph * weights.ph) + (ptsScore * weights.pts) + (pasScore * weights.pas);
}
```

Default weights: PH=0.6, PTS=0.2, PAS=0.2

### 4.2 Predikat

```typescript
function getPredikat(na: number, thresholds: PredikatThresholds): string {
  if (na >= thresholds.A) return 'A';
  if (na >= thresholds.B) return 'B';
  if (na >= thresholds.C) return 'C';
  return 'D';
}
```

Default: A(≥92), B(≥84), C(≥75), D(<75)

### 4.3 Keterampilan

```typescript
function calcNilaiKeterampilan(skillsScores: number[]): number {
  return skillsScores.reduce((a, b) => a + b, 0) / skillsScores.length;
}
```

### 4.4 Nilai Akhir Rapor

```typescript
interface RaporSubjectGrade {
  subjectId: string;
  naPengetahuan: number;
  predikatPengetahuan: string;
  naKeterampilan: number;
  predikatKeterampilan: string;
  finalPredikat: string; // same as pengetahuan predikat
}
```

## 5. UI: PH Input Page

```
┌──────────────────────────────────────────────────────────┐
│ Kelas: X IPA 1   Mapel: Matematika Wajib   KD: 3.1      │
│ Semester: 1 (Ganjil)                   [Kembali ke KD]  │
├──────┬──────────┬─────┬─────┬─────┬──────┬───────────────┤
│ No   │ Nama     │ PH1 │ PH2 │ PH3 │ NPH  │ Status       │
├──────┼──────────┼─────┼─────┼─────┼──────┼───────────────┤
│ 1    │ Budi     │ 80  │ 85  │ —   │ 82.5 │ ⏳ Kurang PH3 │
│ 2    │ Siti     │ 90  │ 88  │ 92  │ 90   │ ✅            │
│ 3    │ Rudi     │ 70  │ 75  │ 68  │ 71   │ ⚠️ Rendah     │
├──────┼──────────┼─────┼─────┼─────┼──────┼───────────────┤
│      │ Rata-rata│ 80  │ 83  │ 80  │ 81.2 │               │
└──────┴──────────┴─────┴─────┴─────┴──────┴───────────────┘
[Auto-save on change]  [Simpan Manual]  [Export Excel]
```

## 6. Validation & Rules

| Rule | Entity | Message |
|---|---|---|
| Score 0-100 | k13_ph, etc | "Nilai maksimal 100" |
| PTS requires at least 1 PH | k13_pts | "Input PH terlebih dahulu" |
| PAS requires PTS | k13_pas | "Input PTS terlebih dahulu" |
| Remedial ≤ max_score | all | "Nilai remedial melebihi maksimal" |
| Attitude requires deskripsi | k13_attitude | "Deskripsi sikap wajib diisi" |
| Rapor finalized = no edit | all grade tables | "Rapor sudah difinalisasi" |

## 7. Error Scenarios

| Scenario | HTTP | Message |
|---|---|---|
| Score > 100 | 422 | "Nilai pada baris 3 melebihi 100" |
| Score < 0 | 422 | "Nilai minimal 0" |
| Teacher not assigned to class | 403 | "Anda tidak mengajar kelas ini" |
| Rapor locked | 423 | "Rapor sudah difinalisasi. Hubungi admin." |
