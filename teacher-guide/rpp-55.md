# RPP: AI-Assisted Documentation & Spec Generation

| Info | Detail |
|------|--------|
| Kode | RPL-AI-55 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Advanced |
| Prasyarat | Module 38 — AI Code Review & Refactoring |

## Pertemuan 1: Tech Spec with AI — Spec Structure, ADR, Mermaid Diagram, AI Review

### Tujuan
- Generate tech spec lengkap dari PRD menggunakan AI (8 section)
- Membuat Architecture Decision Records (ADR) dengan format baku
- Generate Mermaid diagram (sequence, flowchart, class, ER) dari deskripsi teks
- Melakukan AI review spec untuk completeness, consistency, feasibility

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo tech spec tanpa AI vs dengan AI, kenapa dokumentasi sering terlewat | Tanya jawab | Slide, browser |
| 20' | Materi inti: 8 section tech spec (Context, Goals, Non-Goals, Architecture, API, Data Model, Migration, Risks), AI generation flow PRD→Draft→Review→Iterate, ADR template (Context, Decision, Options, Consequences), Mermaid diagram types (sequenceDiagram, flowchart, classDiagram, erDiagram, C4Context), AI spec review checklist | Ceramah + demo | Live code (generate spec, ADR, diagram) |
| 25' | Praktik terbimbing: generate tech spec dari PRD fitur User Notification Preferences + 1 ADR + 1 Mermaid diagram | Hands-on | Starter PRD, template |
| 20' | Latihan mandiri: AI review draft spec + iterasi perbaikan berdasarkan feedback | Problem solving | Soal |
| 15' | Diskusi & refleksi: AI→Human→AI iteration cycle, kualitas output vs human review | Q&A | — |

### Bahan Ajar
- [Module README](../55-ai-docs-spec/)
- [Tech Spec with AI](../55-ai-docs-spec/01-tech-spec-with-ai.md)

---

## Pertemuan 2: Documentation Generation — README, API Docs, Changelog, Auto-Update

### Tujuan
- Generate README profesional dari struktur project
- Membuat JSDoc/TSDoc untuk inline code documentation
- Generate OpenAPI/Swagger spec dari kode
- Membuat changelog otomatis dari conventional commits
- Setup auto-update documentation saat kode berubah

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo project tanpa README vs dengan README profesional, dampak pada onboarding | Tanya jawab | Slide, browser |
| 20' | Materi inti: README structure (Title, Setup, Usage, API, Architecture, Contributing), JSDoc/TSDoc tags (@param, @returns, @throws, @example), OpenAPI generation tools (swagger-jsdoc, TypeDoc), conventional commits types (feat/fix/breaking), changelog tools (standard-version, git-cliff), auto-update workflow (code change→detect→suggest→PR) | Ceramah + demo | Live code (generate README, JSDoc, OpenAPI) |
| 25' | Praktik terbimbing: generate README + JSDoc + OpenAPI spec dari Express task management API | Hands-on | Starter code Express |
| 20' | Latihan mandiri: buat 5+ conventional commits + generate changelog + simulasi AI auto-update doc | Problem solving | Soal |
| 15' | Diskusi & refleksi: tools comparison, maintainability docs vs code | Q&A | — |

### Bahan Ajar
- [Module README](../55-ai-docs-spec/)
- [Documentation Generation](../55-ai-docs-spec/02-doc-generation.md)

---

## Pertemuan 3: Context Files — AGENTS.md, CLAUDE.md, SOUL.md, Template per Stack

### Tujuan
- Memahami fungsi & perbedaan 3 context files utama
- Membuat AGENTS.md untuk universal context (project, stack, conventions)
- Membuat CLAUDE.md spesifik untuk Claude Code (coding style, test strategy)
- Membuat SOUL.md spesifik untuk Codex/Cursor (philosophy, constraints, goals)
- Menerapkan template per stack (Node/Express, React/Next.js, Mastra AI, Docker/K8s)

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo AI tanpa context file vs dengan context file, perbedaan kualitas output | Tanya jawab | Slide, live demo |
| 20' | Materi inti: 3 file utama (AGENTS.md universal, CLAUDE.md Claude Code, SOUL.md Codex/Cursor), template AGENTS.md (description, structure, tech stack, architecture, conventions, common tasks), template CLAUDE.md (coding style, testing strategy, preferred patterns, commands, pitfalls), template SOUL.md (soul, constraints, goals, non-goals, invariants), template per stack, overlap & merge strategy | Ceramah + demo | Live code (buat AGENTS.md) |
| 25' | Praktik terbimbing: buat AGENTS.md + CLAUDE.md + SOUL.md untuk Express task management API | Hands-on | Starter template |
| 20' | Latihan mandiri: review AI ketiga file, identifikasi redundansi + saran merge | Problem solving | Soal |
| 15' | Diskusi & refleksi: kapan pake file mana, recommended project setup | Q&A | — |

### Bahan Ajar
- [Module README](../55-ai-docs-spec/)
- [Context Files](../55-ai-docs-spec/03-context-files.md)

---

## Pertemuan 4: Rules Files — .cursorrules, .windsurfrules, copilot-instructions, VS Code Settings

### Tujuan
- Mengkonfigurasi .cursorrules untuk mengontrol AI behavior di Cursor IDE
- Membuat .windsurfrules dengan format YAML per-file-pattern
- Menyusun .github/copilot-instructions.md untuk GitHub Copilot
- Mengatur VS Code settings.json untuk AI-assisted coding
- Menerapkan multi-rule strategy (global → framework → project → team)

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo AI tanpa rules vs dengan rules, bagaimana rules mengontrol output | Tanya jawab | Slide, live demo |
| 20' | Materi inti: file rules per tool (.cursorrules, .windsurfrules, copilot-instructions), format & syntax, contoh per stack (Next.js, Express), rule content detail (coding style, naming, test pattern, import order, error handling), multi-rule approach 3 layer, priority override, .vscode/settings.json AI config | Ceramah + demo | Live code (buat .cursorrules) |
| 25' | Praktik terbimbing: buat .cursorrules + copilot-instructions.md + .windsurfrules untuk TypeScript Express API | Hands-on | Starter template |
| 20' | Latihan mandiri: tambah 2 .cursor/rules/*.mdc modular (testing + express) + .vscode/settings.json | Problem solving | Soal |
| 15' | Refleksi & wrap-up: showcase project dengan context files + rules files lengkap, best practices documentation automation | Presentasi | Browser, terminal |

### Bahan Ajar
- [Module README](../55-ai-docs-spec/)
- [Rules Files](../55-ai-docs-spec/04-rules-files.md)
