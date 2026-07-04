# AI Coding Agents & Workflow — Cheatsheet

## Tool Comparison

| Tool | Approach | Best For | Cost |
|------|----------|----------|------|
| **Claude Code** | CLI-native, ACP protocol, 200K ctx | Large codebase refactor, multi-agent | $20-100/mo |
| **Codex (OpenAI)** | CLI + sandbox, auto test gen | New project, test-heavy, budget limited | $10-50/mo |
| **Cursor** | IDE-integrated, rules, composer | Daily dev, GUI productivity | $20/mo flat |
| **GitHub Copilot** | IDE plugin, inline completion | Daily boilerplate, GitHub workflow | $10/mo |
| **Hermes Agent** | Agent orchestrator, OSS, MCP | Complex workflow, multi-agent, automation | Free (API cost only) |

### Decision Tree
```
Task Complexity?
├── Simple completion / boilerplate → Copilot
├── Multi-file edit, daily dev → Cursor
├── Large codebase refactor → Claude Code
├── New project + test-heavy → Codex
└── Multi-agent workflow / automation → Hermes Agent
```

---

## Multi-Agent Workflow

### Orchestrator + Worker Pattern
```
Orchestrator — breakdown, delegate, aggregate, quality check
  ├── Worker 1 (Frontend) — React/Next/Tailwind
  ├── Worker 2 (Backend) — FastAPI/NestJS/DB
  ├── Worker 3 (QA) — unit/integration/E2E tests
  └── Worker 4 (Reviewer) — security/style/architecture
```

### Orchestrator Responsibilities
- Task breakdown → sub-task independen
- Delegation → assign ke worker tepat
- Context passing → filtered, need-to-know
- Parallel vs sequential execution
- Result aggregation + quality check

### Context Isolation Rules
1. **Need-to-know** — worker hanya terima context relevan
2. **No cross-agent** — komunikasi cuma via orchestrator
3. **Shared knowledge read-only** — worker baca, jangan ubah
4. **Result owned** — worker output milik worker

### Execution Patterns
```python
# Parallel — tasks independent
await asyncio.gather(
    delegate("frontend", {"task": "UI"}),
    delegate("backend", {"task": "API"})
)

# Sequential — ada dependency
backend = await delegate("backend", {"task": "API"})
qa = await delegate("qa", {"task": "Test API", "depends_on": backend})

# Hybrid — parallel FE+BE, sequential QA, parallel review
```

### Error Handling
```python
# Retry logic
async def delegate_with_retry(agent, task, max_retries=3):
    for attempt in range(max_retries):
        try:
            return await delegate(agent, task)
        except Exception as e:
            if attempt == max_retries - 1:
                return {"status": "failed", "error": str(e)}
```

---

## AI Coding Loop

### The Loop
```
PLAN → CODE → TEST → REVIEW → REFACTOR → (loop or done)
```

### Plan Phase
Input: Product spec → AI breakdown → Acceptance criteria + Task breakdown + Dependencies + Complexity

### Code Phase — Iterative Refinement
| Iteration | Focus | Example |
|-----------|-------|---------|
| v1 | Happy path | Generate main implementation |
| v2 | Error handling | Add edge cases |
| v3 | Performance | Optimize for large inputs |
| v4 | Security | Add security validation |
| v5 | Polish | Type hints, comments, cleanup |

### Test Phase — AI TDD
```
RED: AI generate test dari spec (sebelum code)
GREEN: AI generate code yang pass test
REFACTOR: AI refactor + pastikan test masih pass
```

### Review Checklist
| Area | Check |
|------|-------|
| **Security** | SQLi, XSS, CSRF, hardcoded secrets, path traversal |
| **Style** | Language conventions, consistent naming, no dead code |
| **Architecture** | SRP, DRY, separation of concerns, error handling |
| **Performance** | N+1 queries, memory leaks, unnecessary re-renders |

### Loop Efficiency
- **Skip steps**: Simple function → skip Test+Review. Boilerplate → skip Plan. Bug fix → skip Plan
- **Combine steps**: Code+Test for simple modules. Review+Refactor for small changes
- **Fail fast**: skip review if tests fail, langsung fix
- **Batch review**: multiple files at once

### Time Estimates
| Complexity | Total |
|------------|-------|
| Simple | ~8 min |
| Medium | ~26 min |
| Complex | ~80 min |

---

## Hermes Agent Mastery

### Features
```
HERMES AGENT
├── Delegation — single + batch, auto sub-agent
├── Skills — reusable workflow, versioned
├── Kron — cron job scheduling
├── Profiles — workspace isolation
├── MCP — external tools & services
└── Kanban — multi-session task board
```

### Delegation
- **Single**: `hermes "Build FastAPI CRUD for users"`
- **Batch**: `Delegation.batch([{task, timeout}, ...])`
- Auto-delegasi ke sub-agent: file_ops, terminal, web_search, image_gen, browser

### Kron (Cron Jobs)
```bash
hermes kron create "Daily backup" "0 2 * * *" "Run backup script"
hermes kron list | show | pause | resume | delete | logs
```
| Use Case | Schedule |
|----------|----------|
| Daily backup | `0 2 * * *` |
| Health check | `*/30 * * * *` |
| Weekly report | `0 9 * * 1` |
| Dependency update | `0 8 * * 1` |

### Skills
```bash
hermes skill create my-workflow
hermes skill list | show | run | delete | export | import
hermes skill version | update | rollback
```
Skill structure: YAML with `name`, `version`, `steps[]` (name, prompt, tools, depends_on), `triggers`

### Profiles
```bash
hermes profile list | create | use | current
```
Isolation: per-project skills, plugins, cron, memories
```
~/.hermes/profiles/web-dev/
├── skills/
├── plugins/
├── cron/
├── memories/
└── profile.yaml
```

### MCP (Model Context Protocol)
```bash
hermes mcp add my-server --url https://... --api-key $KEY
hermes mcp list | ping
```
Custom tools: GitHub, Slack, Jira, Database, Kubernetes, custom API

### Kanban
```bash
hermes kanban create "Board Name"
hermes kanban add "Board" --title "Task" --priority high --due "2026-07-06"
hermes kanban move "Task" --to in-progress | done
hermes kanban continue "Task"  # resume multi-session
```
