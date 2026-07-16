# BRD-001: Executive Summary

**Document ID:** BRD-001  
**Version:** 1.0  
**Status:** Draft  
**Date:** 2026-07-15

---

## 1. Product Vision

Single multi-tenant platform serving every learning institution type in Indonesia — from private tutors and bimbel centers to formal K13 schools and universities.

## 2. The Problem

SME learning providers lack affordable digital platforms:
- **Too expensive** — SIAKAD vendors charge Rp50M+
- **Too narrow** — Moodle/Google Classroom have no K13 rapor
- **Not multi-tenant** — must deploy separate instances per client

## 3. The Solution

| Tenant Type | Description | Core Value |
|---|---|---|
| **LMS** | Course marketplace (existing) | Self-paced learning |
| **K13 School** | Formal academic management | Rapor + grading |
| **University** | SIAKAD equivalent | KRS + transcript |
| **Bimbel** | Try out + batch mgmt | Ranking + analysis |
| **Private Tutor** | 1-on-1 sessions | Scheduling + billing |
| **Kelompok** | Small group | Shared materials |

## 4. Key Business Goals

| Goal | Metric | Timeline |
|---|---|---|
| Zero disruption to existing LMS | 0 regressions | P1 |
| 3+ active paying tenants | Active tenant count | P3 |
| <15 min new tenant onboarding | Time-to-first-student | P3 |
| Tenant-specific revenue streams | Revenue per type | P6+ |

## 5. Market Opportunity

| Segment | Size | Est. Monthly Revenue |
|---|---|---|
| Bimbel centers (~50K in ID) | 5K addressable | Rp500K–2M/client |
| Private tutors (~1M in ID) | 100K addressable | Rp100–500K/client |
| SMA/SMK swasta (~14K) | 2K addressable | Rp1–3M/client |
| Universitas swasta (~3K) | 500 addressable | Rp2–5M/client |

## 6. Guiding Principles

1. **Existing users first** — zero breakage
2. **Additive architecture** — never modify existing columns
3. **Tenant-by-default** — every query scoped to tenant_id
4. **Role-shaped UI** — user sees only what their role needs
5. **Mobile-first** — teachers input grades from phone
