# TEST-001: Tenant Engine Test Spec

**Document ID:** TEST-001  
**Phase:** P1  
**Related User Stories:** US-001, US-002, US-003

---

## TC-001: Create Tenant — Valid Data

| Field | Value |
|---|---|
| **Input** | name="SMA Kembang", type="academic_k13", email="admin@smakembang.sch.id" |
| **Expected** | Created, slug="sma-kembang", redirect to detail page |
| **Assertions** | `tenants` row exists with matching data |

## TC-002: Create Tenant — Duplicate Slug

| Field | Value |
|---|---|
| **Input** | name="SMA Kembang" (slug "sma-kembang" already exists) |
| **Expected** | 409 error, "Slug already taken" |
| **Assertions** | No duplicate row created |

## TC-003: Create Tenant — Invalid Slug Characters

| Field | Value |
|---|---|
| **Input** | name="SMA Kembang!!" |
| **Expected** | Slug sanitized to "sma-kembang" |
| **Assertions** | Slug only contains lowercase alphanumeric + hyphens |

## TC-004: Tenant Routing — Valid Path

| Field | Value |
|---|---|
| **Input** | GET `/t/sma-kembang/dashboard` |
| **Expected** | 200, shows tenant-specific dashboard |
| **Assertions** | `event.locals.tenant.id` matches SMA Kembang |

## TC-005: Tenant Routing — Default Tenant

| Field | Value |
|---|---|
| **Input** | GET `/dashboard` |
| **Expected** | 200, shows LMS dashboard (unchanged) |
| **Assertions** | `event.locals.tenant.id == 'default'` |

## TC-006: Tenant Routing — Unknown Slug

| Field | Value |
|---|---|
| **Input** | GET `/t/tidak-ada/dashboard` |
| **Expected** | 404, "Tenant not found" |

## TC-007: Tenant Routing — Deactivated Tenant

| Field | Value |
|---|---|
| **Prerequisite** | Deactivate a tenant |
| **Input** | GET `/t/deactivated/dashboard` |
| **Expected** | 404 |

## TC-008: Existing Routes Unchanged

| Field | Value |
|---|---|
| **Input** | GET `/learn/308c607f/lessons/...` |
| **Expected** | 200, same response as before tenant implementation |

## TC-009: Tenant Config — Save Grade Weights

| Field | Value |
|---|---|
| **Input** | update config: `{"k13_weight": {"ph": 50, "pts": 25, "pas": 25}}` |
| **Expected** | Saved, grade calc uses new weights |

## TC-010: Tenant Config — Validation Fail

| Field | Value |
|---|---|
| **Input** | weights: `{"ph": 50, "pts": 30, "pas": 30}` (sum ≠ 100) |
| **Expected** | 422, "Total bobot harus 100%" |
