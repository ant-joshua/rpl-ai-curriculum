# TEST-002: K13 School Structure Test Spec

**Document ID:** TEST-002  
**Phase:** P2  
**Related User Stories:** US-004, US-005, US-006, US-007

---

## TC-011: Create SMA Structure

| Field | Value |
|---|---|
| **Input** | level=SMA → grades=X,XI,XII → major=IPA,IPS → class="X IPA 1" |
| **Expected** | Class created with grade=X, major=IPA, teacher assigned |

## TC-012: Duplicate Class Name

| Field | Value |
|---|---|
| **Input** | class name "X IPA 1" already exists |
| **Expected** | 409, "Nama kelas sudah digunakan" |

## TC-013: Create SD Structure (No Majors)

| Field | Value |
|---|---|
| **Input** | level=SD → grades=1,2,3,4,5,6 → no major |
| **Expected** | Classes "1 SD A", "2 SD A", ... "6 SD A" created |

## TC-014: Add Subject with KD

| Field | Value |
|---|---|
| **Input** | subject="Matematika Wajib", code="MAT-W", KD: 3.1, 3.2, 4.1 |
| **Expected** | Subject created, 3 KD linked |

## TC-015: Invalid KD Code

| Field | Value |
|---|---|
| **Input** | KD code "abc" |
| **Expected** | 422, "Format KD tidak valid. Gunakan format 3.1" |

## TC-016: CSV Import Students

| Field | Value |
|---|---|
| **Input** | 50 students in valid CSV format |
| **Expected** | 50 created, summary: "50 baru, 0 duplikat, 0 error" |

## TC-017: CSV Duplicate NIS

| Field | Value |
|---|---|
| **Input** | 50 students, 2 with same NIS |
| **Expected** | 48 created, 2 skipped |

## TC-018: CSV Wrong Columns

| Field | Value |
|---|---|
| **Input** | CSV without nis/nama/kelas |
| **Expected** | 400, "Kolom nis, nama, dan kelas wajib ada" |

## TC-019: Teacher Assignment

| Field | Value |
|---|---|
| **Input** | teacher=Bu Ani, class="X IPA 1", subject="Matematika" |
| **Expected** | Assigned, Bu Ani sees class in dashboard |

## TC-020: Teacher Sees Only Assigned Classes

| Field | Value |
|---|---|
| **Input** | Bu Ani has 2 classes, Pak Budi has 0 |
| **Expected** | Bu Ani sees 2, Pak Budi sees "Belum ada kelas" |
