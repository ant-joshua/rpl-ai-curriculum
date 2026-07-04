# RPP: Testing

| Info | Detail |
|------|--------|
| Kode | RPL-AI-09 |
| Durasi | 3 pertemuan × 90 menit |
| Level | Intermediate |
| Prasyarat | Node.js & Express, TypeScript dasar |

## Pertemuan 1: Unit Test — Vitest

### Tujuan
- Memahami test mindset dan coverage
- Menulis unit test dengan describe/it/expect
- Mocking fungsi dan async

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Apersepsi**: "Kenapa testing?" — demo kode tanpa test vs dengan test | Tanya jawab + demo | Slide, Live code |
| 15' | **Vitest setup**: install, config, script test | Tutorial | Terminal |
| 20' | **Unit test dasar**: describe, it, expect, toBe, toEqual, toHaveLength | Ceramah + demo | Live code |
| 15' | **Mocking**: vi.fn(), vi.mock(), mockReturnValue | Ceramah + demo | Live code |
| 20' | **Async test**: async/await, rejects, resolves | Praktik | Starter code |
| 10' | **Praktik**: Tulis unit test untuk utility functions (filter, sort, format) | Hands-on | Starter functions |

### Bahan Ajar
- [Module 09 - Unit Test](../09-testing/01-unit-test.md)

---

## Pertemuan 2: Integration Test — Supertest, DB, Auth

### Tujuan
- Menulis integration test untuk Express API
- Test database operations
- Test protected routes (auth)

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review unit test** | Review kode | — |
| 20' | **Integration test concept**: endpoint test, DB setup/teardown | Ceramah + demo | Slide + Live code |
| 15' | **Supertest**: request(app), expect status, body | Ceramah + demo | Live code |
| 15' | **Auth in test**: generate JWT, test protected routes | Ceramah + demo | Live code |
| 25' | **Praktik**: Integration test 3 endpoint — GET, POST, protected route | Hands-on | Starter Express API |
| 10' | **Refleksi**: Unit vs integration — mana yang lebih penting? | Diskusi | — |

### Bahan Ajar
- [Module 09 - Integration Test](../09-testing/02-integration-test.md)

---

## Pertemuan 3: CI/CD — GitHub Actions

### Tujuan
- Membuat GitHub Actions workflow
- Auto-run test di setiap push
- Menampilkan coverage report

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review integration test** | Review | — |
| 15' | **CI/CD concept**: pipeline, trigger, job, step | Ceramah + visual | Slide diagram |
| 20' | **GitHub Actions**: .github/workflows, push trigger, run test | Ceramah + demo | GitHub, YAML |
| 15' | **Coverage**: c8/istanbul, badge di README | Ceramah + demo | Live code |
| 25' | **Praktik**: Setup workflow test otomatis + coverage badge | Hands-on | GitHub + Terminal |
| 10' | **Debug failure**: sengaja buat test failure, baca log CI | Demo | GitHub Actions |
| 5' | **Refleksi**: Harus 100% coverage? | Q&A | — |

### Bahan Ajar
- [Module 09 - CI/CD](../09-testing/03-ci-cd.md)
