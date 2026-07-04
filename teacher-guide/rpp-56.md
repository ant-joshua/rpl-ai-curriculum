# RPP: Advanced AI Development Workflow

| Info | Detail |
|------|--------|
| Kode | RPL-AI-56 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Advanced |
| Prasyarat | Modul 38 (CI/CD), Modul 53 (AI Code Generation), Modul 54 (AI Testing & Debug) |

## Pertemuan 1: AI Code Review Pipeline — GitHub Actions, Auto-Fix, Severity Classification, Tool Integrasi

### Tujuan
- Memahami arsitektur AI code review pipeline dengan GitHub Actions
- Mengkonfigurasi workflow review otomatis (style, logic, security, performance, API design)
- Mengklasifikasi severity level (CRITICAL/MAJOR/MINOR/SUGGESTION)
- Mengintegrasikan tools (Codacy, SonarCloud, ESLint, Trivy)
- Menerapkan auto-fix commit & conditional auto-approval

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo PR review manual vs AI otomatis, kenapa pipeline penting | Tanya jawab | Slide, browser PR |
| 20' | Materi inti: pipeline arsitektur (PR→Checkout→AI Review→Comment→Auto-fix→Approve), 6 area review (style, logic, security, performance, test, API design), severity level, prompt AI untuk review, format comment, auto-fix commit, conditional auto-approval, integrasi Codacy, SonarCloud, ESLint, Trivy | Ceramah + demo | Live code (workflow YAML) |
| 25' | Praktik terbimbing: setup GitHub Actions workflow ai-code-review.yml dengan OpenAI + integrasi tools | Hands-on | Starter template YAML |
| 20' | Latihan mandiri: buat PR dengan code sengaja mengandung bugs + test auto-fix commit | Problem solving | Soal, starter code |
| 15' | Diskusi & refleksi: tradeoff auto-fix vs manual review, false positives handling | Q&A | — |

### Bahan Ajar
- [Module README](../56-advanced-ai-dev/)
- [AI Code Review Pipeline](../56-advanced-ai-dev/01-ai-code-review-pipeline.md)

---

## Pertemuan 2: AI Testing Strategy — AI TDD, Test Generation, Edge Case Detection, Fuzzing, Test Maintenance

### Tujuan
- Menerapkan AI TDD loop (Red → Green → Refactor)
- Mengenerate unit test, integration test, E2E test dengan AI
- Memanfaatkan AI untuk edge case detection & property-based testing
- Melakukan fuzzing dengan AI-generated payload
- Mengelola test maintenance otomatis saat kode berubah

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo TDD manual vs AI TDD, perbedaan kecepatan & coverage | Tanya jawab | Slide, live demo |
| 20' | Materi inti: siklus AI TDD (RED→GREEN→REFACTOR), contoh calculateDiscount, test generation prompt (unit, integration, E2E), edge case detection dengan AI, property-based testing (fast-check), fuzzing prompt, test maintenance (update test saat API berubah, flaky test detection, coverage gap detection) | Ceramah + demo | Live code (AI TDD loop) |
| 25' | Praktik terbimbing: AI TDD loop untuk fungsi validatePassword — RED (generate test) → GREEN (generate implementasi) → REFACTOR | Hands-on | Starter code, prompt template |
| 20' | Latihan mandiri: tambah property-based test + fuzz test 100 random input | Problem solving | Soal |
| 15' | Diskusi & refleksi: AI TDD vs traditional TDD, kapan tiap approach | Q&A | — |

### Bahan Ajar
- [Module README](../56-advanced-ai-dev/)
- [AI Testing Strategy](../56-advanced-ai-dev/02-ai-testing-strategy.md)

---

## Pertemuan 3: AI Security & Quality Gates — SAST, Dependency Check, Secret Detection, Automated Gating

### Tujuan
- Melakukan AI-assisted security audit (OWASP Top 10)
- Mengkonfigurasi quality gates pipeline 6 stage (lint→type→test→coverage→security→build)
- Menerapkan automated gating — PR diblokir jika kualitas di bawah threshold
- Menjalankan secret detection otomatis (Gitleaks, TruffleHog)
- Setup AI security remediation workflow

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo PR dengan security vulnerability, kenapa quality gates critical | Tanya jawab | Slide, browser |
| 20' | Materi inti: arsitektur security pipeline (SAST→Dependency→Secret→DAST→Report), OWASP Top 10 audit dengan AI, SAST tools (CodeQL, ESLint security), dependency check (Snyk, Trivy, Dependabot), quality gates configuration 6 stage, threshold matrix, PR blocking logic, secret detection tools (Gitleaks, TruffleHog), ruleset patterns, AI remediation workflow | Ceramah + demo | Live code (quality-gates.yml) |
| 25' | Praktik terbimbing: setup quality-gates.yml 6 stage + threshold + secret detection | Hands-on | Starter template YAML |
| 20' | Latihan mandiri: buat PR dengan hardcoded API key + SQL injection + coverage under threshold, test gate blocking | Problem solving | Soal, starter code |
| 15' | Diskusi & refleksi: branch protection rules, balancing strictness vs developer velocity | Q&A | — |

### Bahan Ajar
- [Module README](../56-advanced-ai-dev/)
- [AI Security & Quality Gates](../56-advanced-ai-dev/03-ai-security-quality.md)

---

## Pertemuan 4: AI Refactoring & Migration — Code Smell Detection, Refactor Strategy, Monolith Extraction, DB Migration

### Tujuan
- Mendeteksi code smell dengan AI (long function, large class, duplicated code, god object)
- Menyusun & menjalankan strategi refactoring (plan→approve→execute→verify→commit)
- Melakukan migration patterns (library upgrade, framework migration, callback→async)
- Mengekstrak service dari monolith dengan strangler fig pattern
- Menangani database migration dengan zero-downtime & rollback plan

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo monolith 300+ lines vs layered architecture, kenapa refactor butuh plan | Tanya jawab | Slide, live demo |
| 20' | Materi inti: 10 jenis code smell (long function, large class, duplicated code, god object, shotgun surgery, feature envy, primitive obsession), AI detection prompt, refactoring workflow (plan→approve→execute→verify→commit), migration patterns (Express v4→v5, JS→TypeScript, callback→async/await), monolith extraction service boundary detection, strangler fig pattern, database migration expand-contract, rollback plan | Ceramah + demo | Live code (smell detection, refactor) |
| 25' | Praktik terbimbing: deteksi code smell di monolith order API + buat refactor plan + extract layered architecture | Hands-on | Starter monolith code |
| 20' | Latihan mandiri: ekstrak emailService jadi event-driven + tambah zero-downtime DB migration | Problem solving | Soal |
| 15' | Refleksi & wrap-up: showcase AI pipeline lengkap (review→test→security→refactor), best practices AI-driven development, kesimpulan seluruh modul | Presentasi | Browser, terminal |

### Bahan Ajar
- [Module README](../56-advanced-ai-dev/)
- [AI Refactoring & Migration](../56-advanced-ai-dev/04-ai-refactoring.md)
