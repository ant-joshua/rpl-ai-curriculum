# BRD-003: Business Requirements

**Document ID:** BRD-003  
**Version:** 1.0

---

## BR-01: Multi-Tenant Foundation

| Field | Value |
|---|---|
| Priority | **P0 — Critical** |
| Description | Platform supports multiple isolated tenants from single codebase |
| Rationale | Without isolation, can't serve multiple clients. Separate deployments not scalable. |
| Dependencies | None |
| Success Criteria | 3+ tenants running simultaneously with fully isolated data |

## BR-02: Backward Compatibility

| Field | Value |
|---|---|
| Priority | **P0 — Critical** |
| Description | Existing LMS users experience zero change after multi-tenant migration |
| Rationale | Revenue from existing users must not be disrupted |
| Dependencies | BR-01 |
| Success Criteria | All existing routes + API responses identical before/after migration |

## BR-03: K13 Grading (PH/PTS/PAS + Skills + Attitude)

| Field | Value |
|---|---|
| Priority | **P1 — High** |
| Description | Full K13 grading: Pengetahuan (PH/PTS/PAS), Keterampilan, Sikap |
| Rationale | Core requirement for school clients. Without this, no school will adopt. |
| Dependencies | BR-01 |
| Success Criteria | Teacher inputs PH → system auto-computes NA → predikat assigned |

## BR-04: K13 Rapor PDF

| Field | Value |
|---|---|
| Priority | **P1 — High** |
| Description | Rapor format matching Indonesian K13 standard (mapel, predikat, deskripsi, tanda tangan) |
| Rationale | Legal reporting requirement. Schools must produce printed rapor. |
| Dependencies | BR-03 |
| Success Criteria | Output matches standard K13 rapor format accepted by Depdiknas |

## BR-05: Bimbel Operations

| Field | Value |
|---|---|
| Priority | **P1 — High** |
| Description | Batch management, packaged try out, ranking, per-question analysis |
| Rationale | Bimbel is highest priority revenue segment (quickest path to paying clients) |
| Dependencies | BR-01 |
| Success Criteria | Bimbel creates batch → enrolls students → runs try out → sees ranking in <5 minutes |

## BR-06: Private Tutoring

| Field | Value |
|---|---|
| Priority | **P2 — Medium** |
| Description | Session scheduling, 1-on-1 tracking, package billing, parent monitoring |
| Rationale | Largest potential user base but lowest willingness to pay |
| Dependencies | BR-01 |
| Success Criteria | Tutor creates session → student attends → billing auto-generated |

## BR-07: University Operations

| Field | Value |
|---|---|
| Priority | **P3 — Low** |
| Description | KRS workflow, SKS tracking, grade input, transcript, IP/IPK |
| Rationale | High-ticket segment but complex implementation, deferred |
| Dependencies | BR-01 |
| Success Criteria | Student creates KRS → submits → approved → grades → transcript generated |

## BR-08: Role-Based Access Control

| Field | Value |
|---|---|
| Priority | **P1 — High** |
| Description | Different roles (admin, teacher, student, parent, tentor, tutor, dosen) have appropriate UI and data access |
| Rationale | Data privacy, usability. Teacher must not see another teacher's grades. |
| Dependencies | BR-01 |
| Success Criteria | Teacher can only see own class-subjects; student read-only; admin full tenant access |

## BR-09: Bulk CSV Import

| Field | Value |
|---|---|
| Priority | **P2 — Medium** |
| Description | Bulk import students, classes, subjects via CSV |
| Rationale | Schools have hundreds of students; manual input not feasible |
| Dependencies | BR-03 |
| Success Criteria | 500 students imported, validated, and enrolled in <1 click |

## BR-10: Tenant Isolation & Data Security

| Field | Value |
|---|---|
| Priority | **P0 — Critical** |
| Description | All queries filtered by `tenant_id`. Cross-tenant access restricted to superadmin. |
| Rationale | Data privacy. Tenant A must not see Tenant B's data. |
| Dependencies | BR-01 |
| Success Criteria | Penetration test: cross-tenant data access attempts blocked |

## BR-11: Configurable Grade Weights

| Field | Value |
|---|---|
| Priority | **P1 — High** |
| Description | K13 grade weights (PH/PTS/PAS %) and predikat thresholds configurable per tenant |
| Rationale | Different schools may have different assessment policies |
| Dependencies | BR-03 |
| Success Criteria | Tenant A: 60/20/20 → NA=85. Tenant B: 50/25/25 → NA=83 (same raw scores) |

## BR-12: Rapor Locking & Audit

| Field | Value |
|---|---|
| Priority | **P1 — High** |
| Description | Once rapor finalized, grades locked (read-only). Finalized-by, finalized-at tracked. |
| Rationale | Prevent grade manipulation after report cards issued |
| Dependencies | BR-04 |
| Success Criteria | Post-finalization grade edits rejected with "Rapor sudah difinalisasi" error |

## BR-13: Billing Management

| Field | Value |
|---|---|
| Priority | **P2 — Medium** |
| Description | Package-based billing (10 sessions) or subscription for tutor/bimbel |
| Rationale | Revenue tracking; pay-to-use model for tutor/bimbel tenants |
| Dependencies | BR-05, BR-06 |
| Success Criteria | Completed session → invoice generated. Unpaid session → service limited (configurable). |

## BR-14: Audit Trail

| Field | Value |
|---|---|
| Priority | **P2 — Medium** |
| Description | All grade changes logged: who changed what, when, old value, new value |
| Rationale | Academic integrity; parent/school board may request audit |
| Dependencies | BR-03 |
| Success Criteria | Grade audit table shows full history per student per KD |
