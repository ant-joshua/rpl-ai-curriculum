# RPP: Prompt Engineering untuk Developer

| Info | Detail |
|------|--------|
| Kode | RPL-AI-54 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Intermediate |
| Prasyarat | Modul 1 — Dasar AI untuk Developer |

## Pertemuan 1: System Prompt Design — Persona, Anatomy, Rules, Context Injection, Template per Role

### Tujuan
- Memahami anatomi system prompt (Role, Context, Constraints, Output Format, Rules, Safety)
- Merancang persona AI untuk berbagai peran engineering (backend, frontend, fullstack, code reviewer)
- Menerapkan explicit dos & don'ts dengan negative prompts
- Menginject konteks project (tech stack, code structure, conventions)
- Membuat template system prompt per role

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo AI tanpa system prompt vs dengan system prompt, perbedaan kualitas output | Tanya jawab | Slide, live demo |
| 20' | Materi inti: struktur system prompt 6 bagian, choice persona per role, rules & negative prompts, context injection (project structure, tech stack, conventions), template per role (backend, frontend, fullstack, AI agent, code reviewer) | Ceramah + demo | Live code (prompt diff) |
| 25' | Praktik terbimbing: buat 3 system prompt untuk role berbeda (Data Engineer, DevOps/SRE, Mobile Developer) | Hands-on | Starter template |
| 20' | Latihan mandiri: review & refine system prompt, tambah context injection spesifik | Problem solving | Soal |
| 15' | Diskusi & refleksi: tradeoff prompt length vs model context window, guardrails penting | Q&A | — |

### Bahan Ajar
- [Module README](../54-prompt-engineering-dev/)
- [System Prompt Design](../54-prompt-engineering-dev/01-system-prompt-design.md)

---

## Pertemuan 2: Code Generation Prompting — Few-Shot, CoT, Structured Output, Context Window, Iterative Refinement

### Tujuan
- Menguasai few-shot prompting untuk code generation
- Menerapkan chain-of-thought untuk algoritma kompleks
- Menghasilkan structured output (JSON schema, TypeScript types, XML)
- Mengelola context window secara efisien
- Melakukan iterative refinement & prompt chaining

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo prompt sederhana vs few-shot, perbedaan kualitas kode | Tanya jawab | Slide, live demo |
| 20' | Materi inti: few-shot template untuk CRUD API, CoT step-by-step reasoning (rate limiter example), structured output dengan JSON schema & TypeScript types, context window management teknik, iterative refinement siklus, prompt chaining multi-sesi | Ceramah + demo | Live code (few-shot, CoT) |
| 25' | Praktik terbimbing: buat prompt few-shot + JSON schema output untuk CRUD Invoice API | Hands-on | Starter code, template |
| 20' | Latihan mandiri: implement CoT untuk External Merge Sort + prompt chaining 3 sesi (schema → repository → API) | Problem solving | Soal |
| 15' | Diskusi & refleksi: kapan pake few-shot vs CoT vs zero-shot | Q&A | — |

### Bahan Ajar
- [Module README](../54-prompt-engineering-dev/)
- [Code Generation Prompting](../54-prompt-engineering-dev/02-code-generation-prompting.md)

---

## Pertemuan 3: Prompt Patterns — Code Review, Refactoring, Test Generation, Debug, Performance, Security, Documentation

### Tujuan
- Menguasai 8 prompt pattern untuk task developer sehari-hari
- Menerapkan template pattern untuk berbagai konteks
- Membangun prompt library yang reusable

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap teknik prompting, demo problem tanpa pattern vs dengan pattern | Tanya jawab | Slide, live demo |
| 20' | Materi inti: 8 pattern — Code Review (severity levels), Refactoring (source→target), Test Generation (happy/edge/error), Debug (root cause→fix), Performance (bottleneck→optimization), Security (OWASP audit), Documentation (architecture→API→usage), Template library | Ceramah + demo | Live code (tiap pattern) |
| 25' | Praktik terbimbing: aplikasi 3 pattern pada kode yang sama — Code Review + Refactoring + Test Generation | Hands-on | Starter code, template pattern |
| 20' | Latihan mandiri: aplikasi Security pattern (OWASP audit) + Documentation pattern untuk hasil refactor | Problem solving | Soal |
| 15' | Diskusi & refleksi: kapan pattern mana yang paling efektif, kombinasi pattern | Q&A | — |

### Bahan Ajar
- [Module README](../54-prompt-engineering-dev/)
- [Prompt Patterns](../54-prompt-engineering-dev/03-prompt-patterns.md)

---

## Pertemuan 4: Production Prompting — Versioning, Testing, Monitoring, Cost, Injection Prevention, AI-as-a-Service

### Tujuan
- Menerapkan prompt versioning dengan Git & frontmatter metadata
- Membuat automated test pipeline untuk prompt (CI/CD)
- Mengelola monitoring metrics & cost optimization
- Mencegah prompt injection attack (sanitization, isolation, validation)
- Membangun AI-as-a-Service API wrapper dengan rate limiting & caching

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo prompt injection attack, kenapa production prompting beda | Tanya jawab | Slide, live demo injection |
| 20' | Materi inti: prompt repository structure + frontmatter + Git workflow, test framework (pytest + snapshot), CI pipeline GitHub Actions, metrics tracking (latency, tokens, success rate), cost optimization strategies (model routing, caching), defense layers (sanitization→isolation→constraint→validation), FastAPI wrapper with rate limiter | Ceramah + demo | Live code (test, CI, API) |
| 25' | Praktik terbimbing: setup prompt repository + pytest untuk system prompt validation | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah cost estimator + prompt sanitizer + API wrapper endpoint | Problem solving | Soal |
| 15' | Refleksi & wrap-up: showcase prompt library + test pipeline + monitoring dashboard, best practices production prompting | Presentasi | Browser, terminal |

### Bahan Ajar
- [Module README](../54-prompt-engineering-dev/)
- [Production Prompting](../54-prompt-engineering-dev/04-production-prompting.md)
