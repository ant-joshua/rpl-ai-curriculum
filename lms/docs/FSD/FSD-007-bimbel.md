# FSD-007: Bimbel Module

**Document ID:** FSD-007  
**Module:** Bimbel  
**Phase:** P6  
**Status:** Draft

---

## 1. Overview

Bimbel center operations: batch management, try out with ranking, per-question analysis, billing.

## 2. Routes

| Route | Method | Purpose | Auth |
|---|---|---|---|
| `/t/[slug]/bimbel/batch` | GET | Batch list | admin/tentor |
| `/t/[slug]/bimbel/batch` | POST | Create batch | admin |
| `/t/[slug]/bimbel/batch/[id]` | GET | Batch detail + students | admin/tentor |
| `/t/[slug]/bimbel/batch/[id]/enroll` | POST | Enroll student | admin |
| `/t/[slug]/bimbel/tryout` | GET | Try out list | admin/tentor |
| `/t/[slug]/bimbel/tryout` | POST | Create try out | admin/tentor |
| `/t/[slug]/bimbel/tryout/[id]` | GET | Try out detail + results | admin/tentor |
| `/t/[slug]/bimbel/tryout/[id]/analysis` | GET | Per-question analysis | admin/tentor |
| `/t/[slug]/bimbel/keuangan` | GET | Billing overview | admin |
| `/api/tenant/tryout/[id]/register` | POST | Student registers | student |

## 3. Data Model (additional to tryout_sessions)

```sql
CREATE TABLE tryout_batches (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  batch_id TEXT,
  title TEXT,
  date TEXT,
  duration_minutes INTEGER DEFAULT 180,
  question_count INTEGER DEFAULT 100,
  subjects TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE tryout_participants (
  id TEXT PRIMARY KEY,
  tryout_batch_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  session_id TEXT,
  total_score REAL,
  rank INTEGER,
  subject_scores TEXT,
  status TEXT DEFAULT 'registered',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE tryout_analysis (
  id TEXT PRIMARY KEY,
  tryout_batch_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  skip_count INTEGER DEFAULT 0,
  difficulty_index REAL,
  discrimination_index REAL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

## 4. UI: Try Out Ranking

```
┌──────────────────────────────────────────────┐
│  Ranking — Try Out UTBK Batch A              │
│  Peserta: 42/50   Rata-rata: 62.4            │
├──────┬──────────┬───────┬──────┬──────┬──────┤
│ Rank │ Nama     │ TPS   │ Lit  │ Mat  │ Total│
├──────┼──────────┼───────┼──────┼──────┼──────┤
│ 🥇 1 │ Budi     │ 85    │ 78   │ 92   │ 85   │
│ 🥈 2 │ Siti     │ 82    │ 80   │ 80   │ 81   │
│ 🥉 3 │ Rudi     │ 78    │ 82   │ 76   │ 79   │
│  4   │ Dinda    │ 75    │ 80   │ 72   │ 76   │
│ ...  │          │       │      │      │      │
└──────┴──────────┴───────┴──────┴──────┴──────┘
[Export CSV]  [Lihat Analisis Soal]
```

## 5. Validation

| Rule | Message |
|---|---|
| Try out already taken | "Anda sudah mengikuti try out ini" |
| Timer expired → auto submit | — |
| Max students per batch | "Batch sudah penuh" |
