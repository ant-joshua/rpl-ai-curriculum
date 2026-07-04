# 🧠 Cheatsheet: AI-Assisted Development Workflow

> Referensi cepet — 1 halaman. Modul 38: Pake AI buat coding, TDD, review, CI/CD.

## Topik Utama

| Sesi | Topik | Tools |
|------|-------|-------|
| 01 | AI Coding Tools — code gen, refactor, optimasi, explain | Cline, Copilot, Cursor, Claude Code |
| 02 | AI Pair Programming — TDD, debug, error analysis, commit message | Copilot, Claude Code |
| 03 | AI Code Review — review workflow, unit test, dokumentasi, PR description | Cline, Claude Code |
| 04 | AI Workflow — CI/CD, commit validation, code gen pipeline, responsible AI | GitHub Actions, Claude Code |

## Command / Sintaks Penting

```bash
# Git diff buat AI commit message
git diff --cached | head -100

# Git diff antar branch buat PR description
git diff main...HEAD

# Auto-generate commit message via AI
git diff --cached | claude -p "Buat conventional commit message dari git diff ini. Format: type(scope): description. Bahasa Indonesia."
```

### Conventional Commits

| Type | Kegunaan |
|------|----------|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `refactor` | Refaktor kode |
| `test` | Tambah/ubah test |
| `docs` | Dokumentasi |
| `chore` | Maintenance |

### Prompt Template Penting

| Situasi | Prompt |
|---------|--------|
| **Code Generation** | "Buat fungsi Python yang membaca file CSV, validasi kolom required, return list of dict" |
| **Extract Function** | "Extract function: pisahkan validasi, transformasi, dan formatting dari process_user_data" |
| **Optimasi** | "Optimasi fungsi ini: pakai list comprehension, kurangi nested loop, tambahkan type hints" |
| **Code Review** | "Review kode Python berikut. Cari: security issues, bug, performance bottleneck, code style violation. Format: tiap issue punya severity (HIGH/MEDIUM/LOW), lokasi (file:line), dan saran fix." |
| **TDD Test** | "Buat unit test pytest untuk fungsi X dengan fixture. Include: happy path, edge cases, boundary values" |
| **Docstring** | "Buat Google-style docstring untuk fungsi berikut. Include: deskripsi, Args, Returns, Raises. Bahasa Indonesia" |
| **PR Description** | "Generate PR description dari diff berikut. Format: ## Description ## Changes ## Testing. Bahasa Indonesia" |

### GitHub Action — AI Review PR Otomatis

```yaml
# .github/workflows/ai-review.yml
name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: AI Code Review
        uses: coderabbitai/openai-pr-reviewer@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        with:
          language: id-ID
```

## Tips & Trik

- **Jangan copy-paste blind** — review & pahami setiap baris kode AI
- **Prinsip 5 langkah**: Prompt spesifik → Review → Adaptasi konteks → Test → Iterasi
- **TDD + AI**: Tulis test dulu (RED), prompt AI generate kode (GREEN), minta AI refactor
- **Debug efektif**: kirim error + konteks (file, input, expected vs actual) ke AI
- **Git hook validasi**: pake `prepare-commit-msg` hook + AI buat validasi Conventional Commits
- **README auto**: minta AI generate README.md dari deskripsi proyek
- **AI adalah mitra, bukan pengganti** — 30% waktu buat pahami & modifikasi kode AI

## Common Mistakes

- ❌ **Copy-paste tanpa paham** — kode bisa hallucination, library fiktif, security loophole
- ❌ **Prompt terlalu umum** — makin spesifik prompt, makin bagus output
- ❌ **Auto-approve PR cuma karena AI review lolos** — AI bisa miss security issue (`eval()`)
- ❌ **Kirim data sensitif ke AI** — anonimisasi dulu sebelum kirim ke API AI
- ❌ **Over-reliance** — coding manual tetap penting (coba 1 hari/minggu tanpa AI)
- ❌ **Gak test kode hasil AI** — AI bisa generate kode yang keliatan benar tapi rusak

## Link Cepat

- [Module README](.)
- [Sesi 01 — AI Coding Tools](01-ai-coding-tools.md)
- [Sesi 02 — AI Pair Programming](02-ai-pair-programming.md)
- [Sesi 03 — AI Code Review](03-ai-code-review.md)
- [Sesi 04 — AI Workflow](04-ai-workflow.md)
