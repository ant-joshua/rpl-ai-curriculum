# Session 01: AI Coding Tools Comparison

> **Level:** Advanced  
> **Duration:** 2–3 hours  
> **Objective:** Pahami perbedaan, kelebihan, dan kekurangan 5 AI coding tools utama. Tentukan kapan pakai yang mana.

---

## 1. Overview Tools

Ada 5 AI coding tools yang dominan di 2025–2026. Masing-masing punya pendekatan berbeda:

| Tool | Pendekatan | Interface Utama | Ekosistem |
|------|-----------|----------------|-----------|
| **Claude Code** | CLI-native agent | Terminal | Anthropic, MCP |
| **Codex (OpenAI)** | CLI-native + sandbox | Terminal | OpenAI, sandbox |
| **Cursor** | IDE-integrated | Editor GUI | VS Code fork |
| **GitHub Copilot** | IDE-plugin | Editor inline | GitHub, VS Code/JetBrains |
| **Hermes Agent** | Agent orchestrator | Terminal + tools | Nous Research, MCP |

---

## 2. Claude Code

### Cara Kerja
- **claude CLI** — terminal-based agent yang bisa membaca/menulis file, execute command, manage git
- **ACP Protocol** (Agent Communication Protocol) — standard untuk agent-to-agent communication
- **Thinking Mode** — reasoning depth configurable, untuk task kompleks
- **Edit Mode** — two-step: plan dulu, baru execute

### Kelebihan
- Context window besar (200K tokens)
- ACP protocol memungkinkan multi-agent
- Edit mode prevent premature execution
- Bagus untuk refactoring large codebase

### Kekurangan
- CLI-only, no GUI
- Dependency pada Anthropic API
- Cost per token relatif tinggi
- Learning curve untuk ACP

### Use Case
- Codebase besar >10K file — perlu context besar
- Refactoring kompleks
- Multi-agent orchestration via ACP

---

## 3. Codex (OpenAI)

### Cara Kerja
- **codex CLI** — terminal-based, fork dari philosophy yang sama dengan Claude Code
- **Sandbox** — setiap eksekusi diisolasi, rollback otomatis kalau error
- **Automatic Test** — generate test langsung dari spec
- Integrasi dengan OpenAI API (o-series models)

### Kelebihan
- Sandbox aman untuk eksperimen
- Automatic test generation built-in
- Cost lebih murah dari Claude Code
- o-series models bagus untuk coding

### Kekurangan
- Sandbox kadang terlalu restriktif
- Context window lebih kecil (128K)
- Community tools masih kurang
- Masih relatif baru (2025)

### Use Case
- Project baru — sandbox proteksi
- Test-heavy development
- Budget terbatas

---

## 4. Cursor

### Cara Kerja
- **Rules** — custom instructions yang selalu aktif (.cursorrules)
- **Inline Editing** — edit langsung di file dengan Cmd+K
- **Chat + Composer** — sidebar chat + multi-file edit composer
- **Agent Mode** — agent yang bisa read/write/run command otomatis

### Kelebihan
- GUI paling mature — visual diff, inline suggestions
- Rules system powerful untuk consistency
- Multi-file editing via Composer
- Context-aware — baca seluruh project

### Kekurangan
- Berat di RAM/CPU (Electron app)
- Dependency pada VS Code ecosystem
- Agent mode kadang terlalu agresif
- Subscription-based

### Use Case
- Day-to-day development — GUI productivity
- Project dengan coding standards ketat
- Team dengan shared rules

---

## 5. GitHub Copilot

### Cara Kerja
- **Copilot Chat** — AI chat inside IDE
- **Copilot Edits** — multi-file edit mode
- **Inline Completion** — tab completion real-time
- Integrasi mendalam VS Code, JetBrains, Neovim

### Kelebihan
- Inline completion paling cepat dan akurat
- Integrasi GitHub — PR review, issues
- Multi-IDE support luas
- Copilot Edits powerful untuk refactor

### Kekurangan
- Agent mode tidak sekuat Cursor/Claude Code
- Context terbatas pada file yang terbuka
- Kadang suggest nonsense code
- Perlu internet terus-menerus

### Use Case
- Daily coding — boilerplate, completion
- GitHub-heavy workflow (PR, CI/CD)
- Multi-IDE team

---

## 6. Hermes Agent

### Cara Kerja
- **Delegation** — agent utama delegasi task ke sub-agent (single + batch)
- **Skills** — reusable workflow yang bisa di-create, di-version, di-improve
- **Kron** — cron job scheduling untuk periodic tasks
- **Kanban** — board management multi-session
- **MCP** (Model Context Protocol) — add custom tools, webhook triggers

### Kelebihan
- Full control — open source
- Multi-agent orchestration built-in
- Skills system untuk workflow reuse
- Kanban untuk project management
- MCP untuk extensibility

### Kekurangan
- Setup lebih kompleks
- CLI-first, belum ada GUI matang
- Community lebih kecil
- Documentation masih bertumbuh

### Use Case
- Complex workflow orchestration
- Multi-agent systems
- Production automation
- Power users who want full control

---

## 7. Comparison Matrix

| Kriteria | Claude Code | Codex | Cursor | Copilot | Hermes Agent |
|----------|------------|-------|--------|---------|-------------|
| **Setup complexity** | Medium | Medium | Low | Low | Medium-High |
| **Context window** | 200K | 128K | ~varies | ~small | ~varies |
| **Cost (est monthly)** | $20-100 | $10-50 | $20 | $10 (business) | Free (OSS) |
| **GUI** | ❌ | ❌ | ✅ | ✅ | ❌ (CLI) |
| **Multi-agent** | ✅ (ACP) | ❌ | ❌ | ❌ | ✅ built-in |
| **Sandbox** | ❌ | ✅ | ❌ | ❌ | ❌ (terminal) |
| **Skills/Reusable** | ❌ | ❌ | Rules | ❌ | ✅ Skills |
| **Kanban/PM** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Offline mode** | ❌ | ❌ | ❌ (hybrid) | ❌ | ✅ (local models) |
| **Open source** | ❌ | ❌ | ❌ | ❌ | ✅ |

### Decision Tree: Kapan Pakai Yang Mana

```
Task Complexity?
├── Simple completion / boilerplate → Copilot
├── Multi-file edit, daily dev → Cursor
├── Large codebase refactor → Claude Code
├── New project + test-heavy → Codex
└── Multi-agent workflow / automation → Hermes Agent
```

---

## 8. Cost Analysis

| Tool | Model | Approx Cost/1K tokens | Daily typical usage | Monthly est |
|------|-------|---------------------|-------------------|-------------|
| Claude Code | Claude Opus 4 | $0.015 / $0.075 | 50K-200K tokens | $20-100 |
| Codex | o3/o4-mini | $0.010 / $0.040 | 100K-300K tokens | $10-50 |
| Cursor | Multi-model | Flat $20/mo | Unlimited | $20 |
| Copilot | Multi-model | Flat $10/mo | 2K completions/mo | $10 |
| Hermes Agent | Any (user choice) | API cost only | Varies | $0-50 |

> **Note:** Hermes Agent cost tergantung model yang dipake. Bisa pake local LLM (ollama) = $0 API cost.

---

## 9. Latihan

### Latihan 1: Setup 2 Tools Berbeda

1. Pilih 2 tools dari 5 di atas (rekomendasi: Hermes Agent + 1 tool lain)
2. Setup kedua tool di environment kamu
3. Kerjakan task yang SAMA dengan kedua tool:

```python
# Task: Buat REST API endpoint untuk user registration
# - POST /api/register
# - Input: username, email, password
# - Output: user object (tanpa password), JWT token
# - Validation: email format, password min 8 chars
# - Error handling: duplicate username/email
```

4. Catat perbedaan:
   - Waktu yang dibutuhkan
   - Kualitas output
   - Jumlah prompt/iteration
   - Error rate
   - Code style

### Latihan 2: Comparison Report

Buat dokumentasi comparison dalam format:

```markdown
## Tool A vs Tool B

### Setup Experience
[how easy was setup?]

### Task Performance
[which one faster? which one better quality?]

### Code Quality
[style, best practices, error handling]

### Recommendation
[kapan pakai A, kapan pakai B]
```

### Delivery
- Simpan comparison report di `53-ai-coding-agents/labs/comparison-report.md`
- Siap presentasi 5 menit per tool

---

## Key Takeaways

1. **Tidak ada satu tool terbaik** — setiap tool punya niche
2. **Copilot** = daily driver untuk completion cepat
3. **Cursor** = GUI productivity untuk development
4. **Claude Code** = complex codebase refactoring
5. **Codex** = test-heavy + new project with sandbox
6. **Hermes Agent** = orchestrator + automation power user
7. **Combine tools** — gunakan multiple tools untuk different tasks
