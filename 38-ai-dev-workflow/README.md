# Modul 38 — AI-Assisted Development Workflow

![AI Development Workflow](https://images.pexels.com/photos/8386437/pexels-photo-8386437.jpeg)

**Level:** Madya (Intermediate)  
**Durasi:** 8 Jam (4 sesi × 2 jam)  
**Prasyarat:** Dasar pemrograman (Python/JavaScript), familiar dengan Git & GitHub  
**Output Akhir:** Pull Request (PR) di GitHub yang dibuat dengan bantuan AI — lengkap dengan kode, test, dokumentasi, dan deskripsi PR yang dihasilkan oleh AI

---

## Tujuan Pembelajaran

Setelah menyelesaikan modul ini, peserta mampu:

1. Memahami lanskap alat bantu coding berbasis AI (Cline, Copilot, Cursor, Claude Code)
2. Menggunakan AI sebagai pair programming untuk TDD, debugging, dan commit messaging
3. Melakukan AI-powered code review dan generating dokumentasi/test/PR description
4. Mengintegrasikan AI ke dalam pipeline CI/CD dan memahami praktik responsible AI

---

## Materi

| Sesi | Topik | File | Durasi |
|------|-------|------|--------|
| 01 | AI Coding Tools — Landscape, Setup, Code Generation, AI Refactor | [view](01-ai-coding-tools.md) | 2 Jam |
| 02 | AI Pair Programming — TDD, Debug, Error Analysis, Commit Message | [view](02-ai-pair-programming.md) | 2 Jam |
| 03 | AI Code Review — Review Workflow, Unit Tests, Dokumentasi, PR Description | [view](03-ai-code-review.md) | 2 Jam |
| 04 | AI Workflow — CI/CD, Commit Validation, Code Gen Pipeline, Responsible AI | [view](04-ai-workflow.md) | 2 Jam |

---

## Alur Belajar

```
Sesi 01 ──► Alat & Kode ──► Sesi 02 ──► Pair Programming
     │                                │
     ▼                                ▼
Sesi 03 ──► Review & Docs ──► Sesi 04 ──► CI/CD & Etika
                                      │
                                      ▼
                              OUTPUT: AI-assisted PR di GitHub
```

---

## Output Akhir

Setiap peserta menghasilkan **satu Pull Request** di GitHub yang:

- Berisi kode fitur (min. 1 file implementasi + 1 file test)
- Dilengkapi unit test yang ditulis/direview AI
- Memiliki dokumentasi inline (JSDoc/docstring) buatan AI
- Memiliki PR description yang digenerate AI
- Disertai minimal 3 screenshot/ringkasan prompt AI yang digunakan

---

## AI Prompt Exercises

Setiap sesi mengandung **4 latihan** yang mengharuskan peserta menulis prompt ke AI tool pilihan mereka. Latihan mencakup:

- **Sesi 01:** Prompt kode generation, prompt refactor, prompt optimasi, prompt explain
- **Sesi 02:** Prompt test generation, prompt debug, prompt error analysis, prompt commit message
- **Sesi 03:** Prompt code review, prompt unit test, prompt dokumentasi, prompt PR description
- **Sesi 04:** Prompt CI/CD config, prompt commit validation, prompt pipeline, prompt etika/responsible AI

---

## Tools yang Digunakan

- **Cline** — VS Code extension untuk AI-assisted coding
- **GitHub Copilot** — AI pair programmer inline
- **Cursor** — AI-first IDE
- **Claude Code / Codex CLI** — AI coding agent di terminal
- **GitHub CLI** — Interaksi PR dan CI/CD

---

## Referensi

- [Cline Documentation](https://docs.cline.bot)
- [GitHub Copilot](https://github.com/features/copilot)
- [Cursor](https://cursor.sh)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
