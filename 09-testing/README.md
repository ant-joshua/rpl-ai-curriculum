<img src="https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Testing" style="width:100%;border-radius:12px;margin:12px 0;">

# 09. Testing (Elektif)

> **Level:** 🟡 Intermediate  
> **Jam:** 6 (3 sesi)  
> **Prasyarat:** Node.js & Express, TypeScript dasar  
> **Output:** Test suite unit + integration berjalan otomatis via CI

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:
- Memahami **test mindset**: kenapa testing penting, apa itu test coverage
- Nulis **unit test** pakai Vitest (describe/it/expect, matchers, mocking)
- Nulis **integration test** buat Express API pakai supertest
- Ngerjain **CI/CD pipeline** dengan GitHub Actions yang auto-run test
- Baca & debug test failure dari log CI

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | Unit Test — Vitest (matchers, mocking, async) | [01-unit-test.md](01-unit-test.md) |
| 2 | Integration Test — Supertest, DB, auth | [02-integration-test.md](02-integration-test.md) |
| 3 | CI/CD — GitHub Actions, coverage, matrix | [03-ci-cd.md](03-ci-cd.md) |

## Output Akhir Modul

> **Test Suite Otomatis CI** — Repo dengan test unit + integration yang jalan otomatis tiap push via GitHub Actions, lengkap dengan coverage report.

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:
- "Explain this test case: what does it test and what could go wrong?"
- "Generate edge cases for this function I need to test"
- "Why did this test fail? Here's the error log: ..."
- "Refactor this test to use `test.each` for parameterized testing"
- "Generate a GitHub Actions workflow that runs tests on push and PR"
