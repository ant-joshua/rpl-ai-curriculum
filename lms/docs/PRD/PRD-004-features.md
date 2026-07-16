# PRD-004: Feature Catalog

**Document ID:** PRD-004  
**Version:** 1.0

---

## Feature List by Epic

### EPIC 1: Tenant Engine

| ID | Feature | Priority | Description | Dependencies |
|---|---|---|---|---|
| FE-001 | Tenant CRUD | P0 | Create, read, update, deactivate tenants with type selection | — |
| FE-002 | Auto-provisioning | P0 | New tenant gets config defaults + admin user | FE-001 |
| FE-003 | Tenant routing | P0 | `/t/slug/...` resolves tenant, strips prefix | — |
| FE-004 | Tenant config editor | P1 | UI for grade weights, predikat thresholds, feature flags | FE-001 |
| FE-005 | User invitation | P1 | Invite user with role, email notification | FE-001 |
| FE-006 | Tenant switcher | P1 | Admin dropdown to switch active tenant | FE-001 |
| FE-007 | Tenant dashboard | P1 | Stats per tenant (users, classes, revenue) | FE-004 |
| FE-008 | Audit log | P2 | User/grade changes per tenant | — |

### EPIC 2: K13 School Core

| ID | Feature | Priority | Description | Dependencies |
|---|---|---|---|---|
| FE-101 | School level mgmt | P0 | SD/SMP/SMA/SMK levels | FE-001 |
| FE-102 | Grade level mgmt | P0 | X/XI/XII or 1-6 per school level | FE-101 |
| FE-103 | Major mgmt | P0 | IPA/IPS/RPL, etc | FE-001 |
| FE-104 | Class CRUD | P0 | Create class with grade+major+teacher | FE-102, FE-103 |
| FE-105 | Subject CRUD | P0 | Subjects with code, group, type | FE-001 |
| FE-106 | KD CRUD | P0 | Add KI/KD per subject with codes | FE-105 |
| FE-107 | Teacher assignment | P0 | Assign teacher to class-subject | FE-104, FE-105 |
| FE-108 | CSV student import | P1 | Bulk import + validate + preview | FE-104 |
| FE-109 | Teaching schedule | P1 | Weekly grid per class | FE-107 |
| FE-110 | RPP / lesson plans | P2 | Create RPP linked to KD | FE-106 |

### EPIC 3: K13 Grading

| ID | Feature | Priority | Description | Dependencies |
|---|---|---|---|---|
| FE-201 | PH input | P0 | Daily test scores per student per KD | FE-107 |
| FE-202 | PTS input | P0 | Mid-semester scores per subject | FE-107 |
| FE-203 | PAS input | P0 | Final exam scores per subject | FE-107 |
| FE-204 | Skills grading | P0 | Praktik/produk/proyek/portofolio per KD | FE-107 |
| FE-205 | Attitude grading | P0 | Spiritual + sosial (SB/B/C/K) | FE-104 |
| FE-206 | NA auto-calc | P0 | Weighted NA + predikat assignment | FE-201, FE-202, FE-203 |
| FE-207 | Remedial tracking | P1 | Remedial score + status per student | FE-206 |
| FE-208 | Grade analysis | P2 | Per-class avg, per-KD difficulty, distribution | FE-206 |
| FE-209 | Grade audit | P2 | Track all grade changes | FE-201–FE-205 |

### EPIC 4: K13 Rapor

| ID | Feature | Priority | Description | Dependencies |
|---|---|---|---|---|
| FE-301 | Rapor preview | P0 | Digital preview with all components | FE-206 |
| FE-302 | Rapor PDF | P0 | Print-optimized, A4 format | FE-301 |
| FE-303 | Extracurricular input | P0 | Ekstrakurikuler grades per student | FE-104 |
| FE-304 | Wali kelas notes | P0 | Homeroom notes field | FE-301 |
| FE-305 | Finalize + lock | P0 | Lock grades, audit trail | FE-301 |
| FE-306 | Batch print | P1 | Print all students in class | FE-302 |
| FE-307 | Rapor history | P1 | View/print past semester rapor | FE-305 |
| FE-308 | Cover page | P2 | School cover + student identity page | FE-302 |

### EPIC 5: Attendance

| ID | Feature | Priority | Description | Dependencies |
|---|---|---|---|---|
| FE-401 | Daily attendance | P0 | Per class, student checkboxes | FE-104 |
| FE-402 | Monthly recap | P0 | Auto-computed stats | FE-401 |
| FE-403 | Subject-filtered | P1 | Attendance per subject hour | FE-401, FE-109 |
| FE-404 | Parent notification | P2 | Auto-WA if absent (future) | FE-401 |

### EPIC 6: Bimbel

| ID | Feature | Priority | Description | Dependencies |
|---|---|---|---|---|
| FE-501 | Batch CRUD | P0 | Create batch with schedule, tutor | FE-001 |
| FE-502 | Batch enrollment | P0 | Enroll students + manage | FE-501 |
| FE-503 | Session scheduling | P0 | Calendar per batch | FE-501 |
| FE-504 | Packaged try out | P0 | Try out linked to batch | FE-502 |
| FE-505 | Try out ranking | P0 | Per-batch ranking + score distribution | FE-504 |
| FE-506 | Question analysis | P1 | Correct %, discrimination index | FE-504 |
| FE-507 | Batch billing | P1 | Monthly billing per student | FE-502 |
| FE-508 | Progress report | P2 | Per-period report card PDF | FE-503 |

### EPIC 7: Private Tutor

| ID | Feature | Priority | Description | Dependencies |
|---|---|---|---|---|
| FE-601 | Student mgmt | P0 | Add students, set subjects, level | FE-001 |
| FE-602 | Session scheduling | P0 | Calendar 1-on-1 appointment | FE-601 |
| FE-603 | Session notes | P0 | Topic, understanding, homework | FE-602 |
| FE-604 | Package system | P0 | "10 sesi Rp1M" package | FE-601 |
| FE-605 | Billing | P0 | Paid/unpaid tracking, invoice | FE-604 |
| FE-606 | Parent portal | P1 | View sessions, payments | FE-603 |
| FE-607 | Monthly report | P1 | Auto-generated progress PDF | FE-603 |

### EPIC 8: University

| ID | Feature | Priority | Description | Dependencies |
|---|---|---|---|---|
| FE-701 | Faculty/prodi CRUD | P0 | Academic university structure | FE-001 |
| FE-702 | Course catalog | P0 | Mata kuliah, SKS, prerequisites | FE-701 |
| FE-703 | Semester mgmt | P0 | Academic semester, active flag | FE-701 |
| FE-704 | KRS workflow | P0 | Draft → submit → approve | FE-702, FE-703 |
| FE-705 | Grade input | P0 | Dosen inputs per-matkul grades | FE-704 |
| FE-706 | IP/IPK auto-calc | P0 | Per-semester + cumulative | FE-705 |
| FE-707 | Transcript PDF | P0 | All semesters, SKS, grades, IPK | FE-706 |
| FE-708 | Graduation check | P1 | Total SKS ≥ required + IPK ≥ pass | FE-706 |
