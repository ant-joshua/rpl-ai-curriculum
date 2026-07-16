# BRD-005: Business Rules & Glossary

**Document ID:** BRD-005  
**Version:** 1.0

---

## 1. Business Rules

### RULE-001: Tenant Isolation
Every query MUST filter by `tenant_id`. Cross-tenant data access is superadmin-only. Violation = security incident.

### RULE-002: Grade Locking
Once `rapor_k13.status = 'finalized'`, all associated grade tables are read-only. Cannot modify PH/PTS/PAS/skills/attitude.

### RULE-003: Grade Calculation (Default)
```
NPH = average of all PH scores for the subject
NA = (NPH × 60%) + (PTS × 20%) + (PAS × 20%)
```
Percentages configurable per tenant via `tenants.config.k13_weight`.

### RULE-004: Predikat Thresholds (Default)
| Predikat | Range |
|---|---|
| A (Sangat Baik) | ≥92 |
| B (Baik) | 84–91 |
| C (Cukup) | 75–83 |
| D (Kurang) | <75 |

### RULE-005: University Grade Scale
| Grade | Range | Point |
|---|---|---|
| A | ≥85 | 4.0 |
| A- | 80–84 | 3.7 |
| B+ | 75–79 | 3.3 |
| B | 70–74 | 3.0 |
| B- | 65–69 | 2.7 |
| C+ | 60–64 | 2.3 |
| C | 55–59 | 2.0 |
| D | 40–54 | 1.0 |
| E | <40 | 0.0 |

### RULE-006: IP/IPK Formula
```
IP = Σ(SKS × GradePoint) / Σ(SKS)  — per semester
IPK = Σ(all_semester_bobot) / Σ(all_semester_sks)  — cumulative
```

### RULE-007: Maximum SKS per Semester
Default 24 SKS. Configurable per study program.

### RULE-008: Prerequisite Validation
Course enrollment blocked if prerequisite course(s) not passed (grade ≥ D or equivalent). Message: "Selesaikan [prerequisite] terlebih dahulu."

### RULE-009: Rapor Print Tracking
`rapor_k13.printed_count` incremented each print. No modification after first print unless unfinalized by superadmin.

### RULE-010: Attendance Categories

| Status | Allows Subject Filter | Requires Proof |
|---|---|---|
| Hadir | No | No |
| Sakit | No | Yes (doctor note) |
| Izin | No | Yes (parent letter) |
| Alpha | No | No |
| Dispensasi | Yes (school activity) | Yes |
| Terlambat | Yes (minutes_late) | No |

Monthly recap auto-computed from individual entries.

### RULE-011: Tutoring Session Billing
- **Package-based:** Upfront payment. `remaining_sessions` decremented per session. At 0, must top-up.
- **Per-session:** Invoice generated on session completion. Due date +7 days. Late fee configurable.

### RULE-012: Try Out Auto-Submit
When timer expires, system auto-submits with current answers. Auto-graded. No retake option (unless re-opened by admin).

### RULE-013: Data Retention
Soft delete only (`is_active = 0`). Hard delete only on explicit superadmin request with confirmation. Grade data retained minimum 5 years.

---

## 2. Glossary

| Term | Definition | Context |
|---|---|---|
| **Tenant** | Independent institution instance with isolated data and config | Platform |
| **K13** | Kurikulum 2013 — Indonesian national curriculum for primary/secondary | Academic |
| **KD (Kompetensi Dasar)** | Basic competency — smallest assessable unit in K13 | Academic |
| **KI (Kompetensi Inti)** | Core competency (KI-1 spiritual, KI-2 sosial, KI-3 pengetahuan, KI-4 keterampilan) | Academic |
| **PH (Penilaian Harian)** | Daily assessment — quiz/test per KD, multiple per semester | K13 Grading |
| **PTS (Penilaian Tengah Semester)** | Mid-semester exam covering KD from first half | K13 Grading |
| **PAS (Penilaian Akhir Semester)** | Final exam covering KD from entire semester | K13 Grading |
| **NA (Nilai Akhir)** | Final grade — weighted combination of PH/PTS/PAS | K13 Grading |
| **RPP (Rencana Pelaksanaan Pembelajaran)** | Lesson plan document | Teaching |
| **SKS (Satuan Kredit Semester)** | Credit hour for university courses (1 SKS = ~50min/week/semester) | University |
| **KRS (Kartu Rencana Studi)** | Semester course enrollment plan | University |
| **IP (Indeks Prestasi)** | Semester GPA (0.0–4.0) | University |
| **IPK (Indeks Prestasi Kumulatif)** | Cumulative GPA across all semesters | University |
| **TU (Tata Usaha)** | School administration staff | K13 School |
| **Tentor** | Bimbel center teacher | Bimbel |
| **Wali Kelas** | Homeroom teacher — responsible for one class | K13 School |
| **Wali Murid** | Parent or legal guardian | All |
| **Rapor** | Semester report card (K13 format) | K13 School |
| **Bimbel** | Bimbingan Belajar — tutoring center/learning center | Bimbel |
| **Try Out** | Practice exam simulating UTBK/SBMPTN format | Bimbel |
| **TPS** | Tes Potensi Skolastik (scholastic potential test) — SBMPTN component | Try Out |
| **Literasi** | Literacy test — SBMPTN component | Try Out |
| **Batch** | A specific class instance (e.g., "Intensif UTBK - Senin Sore") | Bimbel |
| **Superadmin** | Cross-tenant administrator with full system access | Platform |
| **PHB** | Penilaian Harian Bebas — remedial daily test | K13 Grading |
| **Tuntas / Remedial** | Passed / needs improvement (remedial threshold = KKM) | K13 Grading |
