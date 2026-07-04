# RPP: Team Git Workflow

| Info | Detail |
|------|--------|
| Kode | RPL-AI-47 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Intermediate |
| Prasyarat | Modul 5 (Git & GitHub Dasar) |

## Pertemuan 1: Branching Strategy

### Tujuan
- Memahami GitFlow, GitHub Flow, dan Trunk-based development
- Memilih branching strategy sesuai tim
- Menulis commit dengan Conventional Commits
- Mengelola semantic versioning, tagging & release

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi: demo repo dengan branch berantakan, tanya "gimana cara kerja tim di satu repo?" | Brainstorming | Slide, browser |
| 20' | Materi inti: GitFlow (main, develop, feature, release, hotfix), GitHub Flow (feature branch → PR), Trunk-based, perbandingan, kapan pakai yang mana | Ceramah + diagram | Slide, whiteboard |
| 20' | Materi lanjutan: Conventional Commits (feat, fix, chore, breaking change), semantic versioning (major.minor.patch), tagging & GitHub Release | Ceramah + demo | Terminal, GitHub |
| 25' | Praktik terbimbing: setup branching strategy dummy project, bikin branch sesuai konvensi, commit pakai conventional commit, tag release | Hands-on | Terminal, GitHub |
| 10' | Latihan mandiri: buat branching strategy dokumen untuk tim 5 orang, tentukan branch naming convention | Problem solving | Soal |
| 5' | Refleksi: GitHub Flow vs GitFlow — mana cocok untuk tim kecil? | Q&A | — |

### Bahan Ajar
- [Module README](../47-team-git-workflow/README.md)
- [Branching Strategy](../47-team-git-workflow/01-branching-strategy.md)

---

## Pertemuan 2: Pull Request Workflow

### Tujuan
- Membuat PR dengan deskripsi berkualitas
- Melakukan code review dengan checklist profesional
- Memahami merge strategies (merge, squash, rebase)
- Setup protected branches & CODEOWNERS

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Review: branching strategy, transisi ke kolaborasi via PR | Q&A | Slide |
| 20' | Materi inti: PR lifecycle (open, review, revise, approve, merge), PR description template, draft PR, linked issues | Ceramah + demo | GitHub |
| 20' | Praktik terbimbing: buat PR dari feature branch, review code teman, approve, merge dengan squash | Hands-on | GitHub |
| 20' | Materi lanjutan: code review checklist (logic, security, performance, style), merge strategies (merge commit vs squash vs rebase), protected branches, CODEOWNERS auto-request | Ceramah + demo | GitHub settings |
| 15' | Latihan mandiri: review PR sample yang sengaja bermasalah, tulis review comments | Problem solving | Soal PR |
| 5' | Refleksi: apa yang bikin code review efektif vs toksik? | Diskusi | — |

### Bahan Ajar
- [Module README](../47-team-git-workflow/README.md)
- [PR Workflow](../47-team-git-workflow/02-pr-workflow.md)

---

## Pertemuan 3: Conflict Resolution

### Tujuan
- Memahami jenis-jenis merge conflict (content, structural, rename/delete)
- Menyelesaikan conflict di VS Code merge editor
- Menguasai rebase workflow
- Menggunakan cherry-pick, revert, reset dengan aman

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Review: PR workflow, situasi conflict terjadi — diskusi "pernah kena conflict?" | Q&A | — |
| 20' | Materi inti: conflict types (content, structural, rename/delete), conflict markers (<<<<, ====, >>>>), VS Code merge editor (accept incoming/current/both) | Ceramah + demo | VS Code |
| 25' | Praktik terbimbing: setup repo dengan conflict sengaja, resolve pakai VS Code merge editor, test hasil | Hands-on | Starter repo |
| 20' | Materi lanjutan: rebase workflow (git rebase vs merge), interactive rebase (squash, reword, drop), cherry-pick, revert (safe), reset (soft/mixed/hard) | Ceramah + demo | Terminal |
| 10' | Latihan mandiri: rebase feature branch, resolve conflict, cherry-pick commit, revert commit | Problem solving | Soal |
| 5' | Refleksi: kapan pakai merge vs rebase? Bahaya reset hard? | Q&A | — |

### Bahan Ajar
- [Module README](../47-team-git-workflow/README.md)
- [Conflict Resolution](../47-team-git-workflow/03-conflict-resolution.md)

---

## Pertemuan 4: GitHub Actions & Project Management

### Tujuan
- Setup GitHub Actions CI/CD pipeline
- Menulis workflow YAML dengan matrix build
- Mengelola project dengan GitHub Projects board
- Membuat issue/PR template

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Review: conflict resolution, otomatisasi dengan CI/CD | Tanya jawab | Slide |
| 20' | Materi inti: GitHub Actions konsep (workflow, job, step, runner, event), YAML syntax, matrix strategy (multi OS/Node version) | Ceramah + demo | GitHub Actions tab |
| 25' | Praktik terbimbing: setup CI workflow lint + test + build, push trigger, lihat action running | Hands-on | Starter repo |
| 20' | Materi lanjutan: GitHub Projects (board, issues, milestones, labels, automation), issue templates (bug, feature), PR template, saved replies | Ceramah + demo | GitHub Projects |
| 10' | Latihan mandiri: buat issue template untuk bug report, setup project board dengan automation, tambah CD stage (deploy) | Problem solving | Soal |
| 5' | Refleksi: CI/CD vs manual — trade-off waktu setup vs waktu saved | Q&A | — |

### Bahan Ajar
- [Module README](../47-team-git-workflow/README.md)
- [GitHub Actions](../47-team-git-workflow/04-github-actions.md)
