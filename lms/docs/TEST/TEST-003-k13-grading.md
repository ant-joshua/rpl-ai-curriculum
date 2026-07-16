# TEST-003: K13 Grading Test Spec

**Document ID:** TEST-003  
**Phase:** P3  
**Related User Stories:** US-008, US-009, US-010, US-011

---

## Grade Calculation Tests (Unit)

### TC-021: Basic NA Calculation

| Field | Value |
|---|---|
| **Input** | PH=[80,90], PTS=78, PAS=90, weights=(60/20/20) |
| **Formula** | NPH=(80+90)/2=85, NA=(85×0.6)+(78×0.2)+(90×0.2)=84.6 |
| **Expected** | NA=84.6, Predikat=B |

### TC-022: Perfect Scores

| Field | Value |
|---|---|
| **Input** | PH=[100,100], PTS=100, PAS=100 |
| **Expected** | NA=100, Predikat=A |

### TC-023: Minimum Passing

| Field | Value |
|---|---|
| **Input** | PH=[75,75], PTS=75, PAS=75 |
| **Expected** | NA=75, Predikat=C |

### TC-024: Below Minimum

| Field | Value |
|---|---|
| **Input** | PH=[40,50], PTS=45, PAS=50 |
| **Expected** | NA=45, Predikat=D |

### TC-025: Custom Weights

| Field | Value |
|---|---|
| **Input** | PH=[85], PTS=78, PAS=90, weights=(50/25/25) |
| **Expected** | NA=(85×0.5)+(78×0.25)+(90×0.25)=42.5+19.5+22.5=84.5 |

### TC-026: Custom Predikat Thresholds

| Field | Value |
|---|---|
| **Input** | NA=88, thresholds=(A=90,B=80,C=70,D=0) |
| **Expected** | Predikat=B |

### TC-027: Missing PTS (Incomplete)

| Field | Value |
|---|---|
| **Input** | PH=[80,90], PTS=null, PAS=null |
| **Expected** | NA=null |

### TC-028: Missing PH

| Field | Value |
|---|---|
| **Input** | PH=[], PTS=80, PAS=85 |
| **Expected** | NPH=null, NA=null |

### TC-029: Remedial Score

| Field | Value |
|---|---|
| **Input** | PH score=60, remedial=78 |
| **Expected** | Both stored, remedial flagged |

## Integration Tests

### TC-030: Full Grade Lifecycle

| Field | Value |
|---|---|
| **Steps** | 1. Input 2×PH for 30 students → 2. Input PTS → 3. Input PAS → 4. Compute NA |
| **Expected** | NA computed for all 30, correct per student |

### TC-031: PTS Blocked Without PH

| Field | Value |
|---|---|
| **Input** | Attempt PTS input without any PH scores |
| **Expected** | 422, "Input PH terlebih dahulu" |

### TC-032: PAS Blocked Without PTS

| Field | Value |
|---|---|
| **Input** | Attempt PAS input without PTS |
| **Expected** | 422, "Input PTS terlebih dahulu" |

### TC-033: Score Validation (Upper Bound)

| Field | Value |
|---|---|
| **Input** | score=120 |
| **Expected** | 422, "Nilai maksimal 100" |

### TC-034: Score Validation (Lower Bound)

| Field | Value |
|---|---|
| **Input** | score=-5 |
| **Expected** | 422, "Nilai minimal 0" |

### TC-035: Skills Grade Input

| Field | Value |
|---|---|
| **Input** | type=praktik, KD=3.1, score=88 |
| **Expected** | Saved |

### TC-036: Attitude Input

| Field | Value |
|---|---|
| **Input** | spiritual=SB, deskripsi="Selalu bersyukur" |
| **Expected** | Saved |

### TC-037: Attitude Missing Description

| Field | Value |
|---|---|
| **Input** | predikat=B, deskripsi=empty |
| **Expected** | 422, "Deskripsi sikap wajib diisi" |
