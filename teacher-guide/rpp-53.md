# RPP: AI Coding Agents & Workflow

| Info | Detail |
|------|--------|
| Kode | RPL-AI-53 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Advanced |
| Prasyarat | Module 1 (AI Fundamentals), Module 38 (AI Coding Tools Pengenalan) |

## Pertemuan 1: AI Coding Tools Comparison — Claude Code, Codex, Cursor, Copilot, Hermes Agent

### Tujuan
- Memahami perbedaan pendekatan 5 AI coding tools utama
- Membandingkan setup complexity, context window, cost, fitur multi-agent
- Membuat decision tree kapan pakai tool mana berdasarkan task complexity
- Mampu setup 2 tools berbeda dan menjalankan task yang sama untuk perbandingan

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo AI coding tools di 2025-2026, perbandingan cepat CLI vs GUI | Tanya jawab | Slide, terminal/browser |
| 20' | Materi inti: overview 5 tools (pendekatan, interface, ekosistem), deep dive tiap tool (Claude Code, Codex, Cursor, Copilot, Hermes Agent), comparison matrix, decision tree, cost analysis | Ceramah + demo | Live code (setup 2 tools) |
| 25' | Praktik terbimbing: setup 2 tools (Hermes Agent + pilihan) + kerjakan task REST API user registration | Hands-on | Starter code, terminal |
| 20' | Latihan mandiri: buat comparison report — waktu, kualitas, prompt iteration, error rate | Problem solving | Soal, template report |
| 15' | Diskusi & refleksi: tidak ada satu tool terbaik, kombinasi tools untuk task berbeda | Q&A | — |

### Bahan Ajar
- [Module README](../53-ai-coding-agents/)
- [AI Coding Tools Comparison](../53-ai-coding-agents/01-ai-coding-tools-compare.md)

---

## Pertemuan 2: Multi-Agent Workflow — Orchestrator + Worker, Role-Based Agents, Context Isolation

### Tujuan
- Memahami pattern fundamental orchestrator + worker
- Mendesain role-based agents (Frontend, Backend, QA, Reviewer)
- Mengelola tools delegation & access control per agent
- Menerapkan context isolation & parallel vs sequential execution
- Membangun error handling & recovery strategy

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap single agent limitation, kenapa butuh multi-agent | Tanya jawab | Slide, diagram |
| 20' | Materi inti: orchestrator responsibilities, worker responsibilities, role-based agent prompts, tools delegation, context isolation rules, parallel vs sequential vs hybrid execution, error handling & retry | Ceramah + demo | Live code (orchestrator skeleton) |
| 25' | Praktik terbimbing: build orchestrator workflow dengan 3 workers (Generator, Reviewer, Tester) untuk Calculator API | Hands-on | Starter code Python |
| 20' | Latihan mandiri: tambah flow diagram + async hybrid execution + error recovery | Problem solving | Soal |
| 15' | Diskusi & refleksi: context boundaries, tradeoff parallel vs sequential | Q&A | — |

### Bahan Ajar
- [Module README](../53-ai-coding-agents/)
- [Multi-Agent Workflow](../53-ai-coding-agents/02-multi-agent-workflow.md)

---

## Pertemuan 3: AI Coding Loop — Plan → Code → Test → Review → Refactor, Loop Efficiency

### Tujuan
- Menguasai siklus AI Coding Loop 5 fase
- Menerapkan prompt iteration strategy (happy path → error → performance → security → polish)
- Menggunakan TDD dengan AI (Red → Green → Refactor)
- Melakukan code review dengan AI checklist (security, style, architecture)
- Mengidentifikasi code smell & refactoring dengan AI

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo AI generate kode langsung tanpa plan → error, kenapa perlu loop | Tanya jawab | Slide, live demo |
| 20' | Materi inti: 5 fase loop (Plan→Code→Test→Review→Refactor), prompt iteration strategy, TDD dengan AI, review checklist (security, style, architecture), code smell detection, loop efficiency (skip/combine steps) | Ceramah + demo | Live code (full loop) |
| 25' | Praktik terbimbing: 3 iterasi loop untuk To-Do List API — Plan→Code→Test→Review→Refactor | Hands-on | Starter code, template |
| 20' | Latihan mandiri: tambah error handling (iterasi 2) + security & logging (iterasi 3) | Problem solving | Soal |
| 15' | Diskusi & refleksi: kapan stop loop, kombinasi step untuk overhead reduction | Q&A | — |

### Bahan Ajar
- [Module README](../53-ai-coding-agents/)
- [AI Coding Loop](../53-ai-coding-agents/03-coding-loop.md)

---

## Pertemuan 4: Hermes Agent Mastery — Delegation, Skills, Kron, Profiles, MCP, Kanban

### Tujuan
- Menguasai delegation (single & batch) di Hermes Agent
- Membuat reusable skill workflow dengan versioning
- Menjadwalkan periodic tasks dengan kron jobs
- Mengelola workspace isolation dengan profiles
- Mengextend Hermes dengan MCP custom tools & webhooks
- Menggunakan kanban board untuk multi-session task management

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap Hermes Agent features, demo power user workflow | Tanya jawab | Slide, terminal |
| 20' | Materi inti: delegation flow (orchestrator→sub-agent), kron job format & management, skill structure YAML, versioning & rollback, profile structure & isolation, MCP tools definition, webhook triggers, kanban board commands | Ceramah + demo | Live code (hermes CLI) |
| 25' | Praktik terbimbing: buat skill setup-fastapi + profile untuk project + kanban board dengan 3 tasks | Hands-on | Hermes CLI, starter |
| 20' | Latihan mandiri: tambah kron job + MCP integration test | Problem solving | Soal |
| 15' | Refleksi & wrap-up: showcase Hermes workflow lengkap (skill + profile + kanban), next steps (MCP marketplace, CI/CD, multi-profile workspace) | Presentasi | Terminal browser |

### Bahan Ajar
- [Module README](../53-ai-coding-agents/)
- [Hermes Agent Mastery](../53-ai-coding-agents/04-hermes-agent-mastery.md)
