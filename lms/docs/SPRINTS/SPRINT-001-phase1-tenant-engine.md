# Sprint Plan: Phase 1 — Tenant Engine + Drizzle Setup

**Duration:** 1 sprint (~3 days)  
**Status:** Planned  
**Dependencies:** None (additive, no existing code changes)

---

## Sprint Goal

Multi-tenant foundation: tenants table, tenant_id on all tables, routing, Drizzle ORM setup.

## Sprint Backlog

| ID | Task | Est. | Owner | Status |
|---|---|---|---|---|
| **S1-01** | Install Drizzle ORM + deps | 15min | — | ⬜ |
| **S1-02** | Write Drizzle schema for tenants + tenant_users | 30min | — | ⬜ |
| **S1-03** | Write migration 0045 (tenants + ALTER TABLE all) | 1h | — | ⬜ |
| **S1-04** | Apply migration to production DB | 5min | — | ⬜ |
| **S1-05** | hooks.server.ts tenant resolution logic | 1h | — | ⬜ |
| **S1-06** | Tenant CRUD pages (list + create + detail + config) | 2h | — | ⬜ |
| **S1-07** | Admin tenant switcher UI | 30min | — | ⬜ |
| **S1-08** | Base repository + tenant repository | 30min | — | ⬜ |
| **S1-09** | Tenant service (onboard, config defaults) | 30min | — | ⬜ |
| **S1-10** | Auth guard update (check tenant_users) | 30min | — | ⬜ |
| **S1-11** | Seed default tenant + existing users | 15min | — | ⬜ |
| **S1-12** | Verify: existing LMS routes all 200 | 30min | — | ⬜ |
| **S1-13** | Verify: create tenant → route → access | 30min | — | ⬜ |
| **S1-14** | Deployment + smoke test | 15min | — | ⬜ |

**Total:** ~9 hours

## Definition of Done

- [ ] All existing LMS routes return 200 (no regressions)
- [ ] `/t/slug/dashboard` resolves correct tenant
- [ ] Unknown slug returns 404
- [ ] Tenant CRUD works end-to-end
- [ ] Tenant config save/load works
- [ ] Drizzle schema matches DB
- [ ] All migrations applied

## Sprint Backlog: Phase 2 — K13 School Structure

| ID | Task | Est. | Status |
|---|---|---|---|
| **S2-01** | Migration 0046: structure tables | 30min | ✅ |
| **S2-02** | Drizzle schema for K13 structure | 30min | ✅ |
| **S2-03** | School level CRUD page + API | 1h | 🔄 |
| **S2-04** | Grade level + major CRUD | 1h | 🔄 |
| **S2-05** | Class CRUD page | 1.5h | 🔄 |
| **S2-06** | Subject + KD CRUD | 1h | 🔄 |
| **S2-07** | Teacher assignment page | 1h | 🔄 |
| **S2-08** | CSV import siswa | 2h | 🔄 |
| **S2-09** | Build + deploy + test | 30min | ⬜ |

**Total:** ~9 hours
