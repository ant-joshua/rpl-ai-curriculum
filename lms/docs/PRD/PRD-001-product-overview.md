# PRD-001: Product Overview

**Document ID:** PRD-001  
**Version:** 1.0  
**Status:** Draft  
**Date:** 2026-07-15

---

## 1. Product Identity

| Field | Value |
|---|---|
| **Product Name** | Sekolahku LMS |
| **Tagline** | One platform, every learning model |
| **Type** | Multi-tenant learning management platform |
| **Target Users** | Students, teachers, tutors, bimbel owners, school admins, university staff, parents |

## 2. Product Description

Sekolahku LMS is a multi-tenant platform that serves 6 institution types from a single codebase:

1. **LMS** — course marketplace with self-paced content
2. **K13 School** — formal education with Indonesian K13 curriculum support
3. **University** — SIAKAD with KRS, SKS, transcript, IPK
4. **Bimbel** — batch management, packaged try out, ranking analysis
5. **Private Tutor** — 1-on-1 session scheduling, billing, progress reports
6. **Kelompok** — small group learning with shared materials

## 3. Core Differentiators

| Differentiator | Description | Why Matters |
|---|---|---|
| **K13-native** | Built for Indonesian curriculum, not adapted Western LMS | Schools can't use generic LMS |
| **Upgradable** | Tutor → Bimbel → School (grow on same platform) | Low entry barrier, high ceiling |
| **Single codebase** | Cheaper to maintain than separate instances | Better margins, faster iteration |
| **Type-safe DB** | Drizzle ORM eliminates runtime schema errors | Fewer production bugs |
| **Linear design** | Modern, minimal UI | Differentiates from legacy education software |

## 4. Product Principles

1. **Zero disruption** to existing LMS users
2. **Additive** — new tables only, never modify existing columns
3. **Tenant-scoped** — every query, every feature, every page
4. **Role-shaped** — UI adapts to who you are
5. **Mobile-responsiveness** — teachers use phones in class
6. **Offline-capable** (future) — rapor generation works with intermittent internet

## 5. Tenants Feature Matrix

| Feature | LMS | K13 | Univ | Bimbel | Tutor | Kelompok |
|---|---|---|---|---|---|---|
| Course/content tree | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quiz/assessment | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assignments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Certificates | ✅ | ✅ | ⬜ | ✅ | ⬜ | ⬜ |
| School structure | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| KD + RPP | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| K13 grading (PH/PTS/PAS) | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Rapor PDF | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Attendance | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Teaching schedule | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| KRS | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Transcript | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Try out + ranking | ❌ | ⬜ | ❌ | ✅ | ❌ | ❌ |
| Session mgmt | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Billing | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Parent portal | ❌ | ⬜ | ❌ | ⬜ | ✅ | ✅ |
| Progress report | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

✅ = core  ⬜ = nice-to-have  ❌ = not applicable

## 6. Platform Constraints

| Constraint | Impact |
|---|---|
| D1 < 100 table limit | ~75 tables feasible |
| No wildcard subdomain (CF Pages) | Path-based `/t/slug` routing only |
| Single DB for all tenants | Row-level isolation via `tenant_id` |
| Existing LMS users on default tenant | Must not break |
