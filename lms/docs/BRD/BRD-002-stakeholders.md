# BRD-002: Stakeholder Analysis

**Document ID:** BRD-002  
**Version:** 1.0

---

## 1. Stakeholder Map

| Stakeholder | Role in Ecosystem | Primary Needs | Pain Points | Success Metric |
|---|---|---|---|---|
| **Platform Owner** (Ant Joshua) | Product owner + developer | Unified platform, revenue, maintainable code | Feature requests from many client types | Single codebase serving paying customers |
| **LMS Users** | Course creators & learners | Existing features work, no migration | Fear of breaking changes | Zero regressions |
| **School Admin / TU** | School operators | Easy class setup, rapor generation | Manual Excel rekap, paper rapor | 1-click rapor for all students |
| **Teacher (Guru)** | Subject teachers | Simple grade input, attendance, RPP | Heavy paperwork, multiple logins | <5 minutes per class input PH |
| **Student (Siswa)** | End learner | View grades, schedule, rapor | No single app, lost report cards | All academic info in one app |
| **Parent (Wali Murid)** | Payer & monitor | Progress reports, fee tracking | Zero visibility until rapor | Weekly progress delivered |
| **Bimbel Owner** | Business operator | Batch mgmt, try out analysis, billing | Manual admin overhead | 80% less admin time |
| **Tutor** | Independent educator | Session scheduling, billing, tracking | No system, everything manual | All students from one calendar |
| **Tutor's Parent** | Monitoring parent | Session schedule, homework, payments | No ROI visibility | See daily learning topic |
| **Dosen** | University lecturer | Grade input, class roster | Complex grade input system | <5 minutes per class |
| **Mahasiswa** | University student | KRS, transcript, IPK | Legacy system downtime | 100% uptime during KRS |

## 2. Stakeholder Power-Interest Matrix

```
High Power
  │
  │  Platform Owner ●        ● School Admin
  │                          ● Bimbel Owner
  │
  │  Teacher ●               ● Student
  │  Tutor   ●               ● Parent
  │  Dosen  ●                ● Mahasiswa
  │
  └─────────────────────────────
  Low Interest           High Interest
```

## 3. Stakeholder Requirements Mapping

| BRD-ID | Requirements | Stakeholders |
|---|---|---|
| BR-01 | Multi-tenant foundation | Platform Owner |
| BR-02 | Backward compatibility | LMS Users |
| BR-03 | K13 grading | Teacher, School Admin |
| BR-04 | K13 rapor | School Admin, Student, Parent |
| BR-05 | Bimbel operations | Bimbel Owner |
| BR-06 | Private tutoring | Tutor, Tutor's Parent |
| BR-07 | University operations | Dosen, Mahasiswa |
| BR-08 | Role-based access | All |
| BR-09 | CSV import | School Admin (TU) |
