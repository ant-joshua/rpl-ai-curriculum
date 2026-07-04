# Session 04: Hermes Agent Mastery

> **Level:** Advanced  
> **Duration:** 2–3 hours  
> **Objective:** Kuasai Hermes Agent — delegation, skills, kron, profiles, MCP, kanban. Jadi power user yang bisa build workflow kompleks.

---

## 1. Features Overview

Hermes Agent adalah **agent orchestrator** — bukan cuma AI chat. Feature set-nya dirancang untuk multi-agent workflow automation.

```
┌──────────────────────────────────────────┐
│            HERMES AGENT                   │
│                                           │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Delegation│  │  Skills  │  │  Kron  │ │
│  │ single   │  │  create  │  │  cron  │ │
│  │ batch    │  │  manage  │  │  jobs  │ │
│  └──────────┘  └──────────┘  └────────┘ │
│                                           │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Profiles │  │   MCP    │  │ Kanban │ │
│  │ workspace│  │  custom  │  │ boards │ │
│  │ isolation│  │  tools   │  │ tasks  │ │
│  └──────────┘  └──────────┘  └────────┘ │
└──────────────────────────────────────────┘
```

---

## 2. Delegation

Delegation adalah cara Hermes Agent men-turunkan task ke sub-agent.

### Single Delegation

```bash
# Delegate task langsung ke Hermes
hermes "Build a FastAPI CRUD for users"

# Hermes akan:
# 1. Breakdown task
# 2. Execute subtasks (read/write files, run commands)
# 3. Report result
```

Di dalam session Hermes, delegasi terjadi otomatis ketika task membutuhkan:

- **File operations** → sub-agent file handler
- **Code execution** → sub-agent terminal executor
- **Web search** → sub-agent web search (Firecrawl)
- **Image generation** → sub-agent FAL
- **Browser automation** → sub-agent browser use

### Batch Delegation

```python
# Dalam skill atau script, kamu bisa batch delegate
from hermes import Delegation

results = Delegation.batch([
    {"task": "Check API health", "timeout": 30},
    {"task": "Run database migration", "timeout": 120},
    {"task": "Deploy to staging", "timeout": 300},
])
```

### Delegation Flow

```
User Task
    │
    ▼
Hermes Agent (Orchestrator)
    │
    ├── Task Analysis → breakdown → priority
    │
    ├── Delegate to Sub-Agent 1: [tool: file_ops]
    │   └── Read/modify files
    │
    ├── Delegate to Sub-Agent 2: [tool: terminal]
    │   └── Execute commands
    │
    ├── Delegate to Sub-Agent 3: [tool: web_search]
    │   └── Fetch documentation
    │
    └── Aggregate → verify → report to user
```

### Delegation Tips

| Tip | Detail |
|-----|--------|
| **Be specific** | "Create file auth.py with login function" > "Buat auth" |
| **One task at a time** | Complex task: break into multiple delegations |
| **Set expectations** | "Run test, if fail, report error and stop" |
| **Use context** | Provide file paths, function names, examples |

---

## 3. Kron Jobs

Kron = cron job system di Hermes Agent. Untuk menjadwalkan task periodic.

### Create Kron Job

```bash
# Via hermes CLI
hermes kron create "Daily backup" "0 2 * * *" "Run backup script"
hermes kron create "Weekly report" "0 9 * * 1" "Generate weekly metrics"
hermes kron list
```

### Kron Job Format

```yaml
# ~/.hermes/kron/daily-backup.yaml
name: Daily Backup
schedule: "0 2 * * *"      # Every day at 2 AM
task: |
  1. Run database dump
  2. Compress backup files
  3. Upload to S3
  4. Clean up old backups (retain 7 days)
notify: true                # Notify on completion
timeout: 600                # Max 10 minutes
retry: 3                    # Retry 3 times on failure
```

### Kron Management Commands

```bash
hermes kron list                   # List all jobs
hermes kron show daily-backup      # Show job details
hermes kron pause daily-backup     # Pause without deleting
hermes kron resume daily-backup    # Resume paused job
hermes kron delete daily-backup    # Remove job
hermes kron logs daily-backup      # View execution logs
```

### Kron Use Cases

| Use Case | Schedule | Task |
|----------|----------|------|
| Daily backup | `0 2 * * *` | Database + file backup |
| Code cleanup | `0 0 * * 0` | Remove temp files, prune branches |
| Health check | `*/30 * * * *` | Ping services, report status |
| Weekly report | `0 9 * * 1` | Generate metrics, send email |
| Dependency update | `0 8 * * 1` | Check + update outdated packages |

---

## 4. Skills

Skills adalah **reusable workflow** — kumpulan instruksi yang bisa kamu simpan, version, dan panggil ulang.

### Create Skill

```bash
# Via CLI
hermes skill create my-workflow

# Ini akan buat file di ~/.hermes/skills/my-workflow/
```

### Skill Structure

```yaml
# ~/.hermes/skills/my-workflow/skill.yaml
name: my-workflow
version: 1.0.0
description: "Standard workflow for creating a new API endpoint"
author: "user"
tags: [api, fastapi, backend]

steps:
  - name: analyze-spec
    prompt: "Analyze this API spec and create task breakdown"
    tools: [web_search]

  - name: generate-code
    prompt: "Generate FastAPI implementation based on spec"
    tools: [file_ops, terminal]
    depends_on: [analyze-spec]

  - name: generate-tests
    prompt: "Generate pytest for the API"
    tools: [file_ops, code_execution]
    depends_on: [generate-code]

  - name: review-code
    prompt: "Review generated code for security + style"
    tools: [file_ops]
    depends_on: [generate-code]

triggers:
  - type: command
    pattern: "create endpoint *"
  - type: file_watch
    pattern: "specs/*.yaml"
```

### Skill Versioning

```bash
hermes skill version my-workflow    # Show version history
hermes skill update my-workflow     # Update to new version
hermes skill rollback my-workflow 1 # Rollback to v1
```

### Skill Management Commands

```bash
hermes skill list                   # List all skills
hermes skill show my-workflow       # Show skill details
hermes skill run my-workflow        # Run skill immediately
hermes skill delete my-workflow     # Remove skill
hermes skill export my-workflow     # Export as sharable file
hermes skill import ./skill.yaml    # Import skill from file
```

### Skill Improvement

Setelah skill digunakan beberapa kali, review dan improve:

```yaml
# Improved version 1.1.0
version: 1.1.0
changelog:
  - "Added error handling step"
  - "Improved prompt specificity"
  - "Added async support"

steps:
  - name: analyze-spec
    prompt: "Analyze API spec. Identify: endpoints, params, auth, error codes"
    tools: [web_search]

  - name: generate-code
    prompt: |
      Generate FastAPI implementation with:
      - Input validation (Pydantic)
      - Error handling for all HTTP status codes
      - Async database queries
      - Proper HTTP exception handling
    tools: [file_ops, terminal]
    depends_on: [analyze-spec]
  # ... etc
```

---

## 5. Profiles

Profiles memungkinkan **workspace isolation**. Setiap profile punya skills, plugins, cron, dan memory sendiri.

### Why Use Profiles?

| Scenario | Without Profile | With Profile |
|----------|----------------|--------------|
| Work on 2 projects | Skills campur aduk | Isolasi per project |
| Personal vs work | Context pollution | Clean separation |
| Different tech stacks | Prompt confusion | Tailored skills |
| Team collaboration | Override conflicts | Shared profile |

### Setup Profile

```bash
# List profiles
hermes profile list

# Create new profile
hermes profile create web-dev

# Switch profile
hermes profile use web-dev

# Current profile
hermes profile current
```

### Profile Structure

```
~/.hermes/profiles/web-dev/
├── skills/               # Profile-specific skills
├── plugins/              # Profile-specific plugins
├── cron/                 # Profile-specific cron jobs
├── memories/             # Profile-specific memory
└── profile.yaml          # Profile config
```

### Profile Config

```yaml
# ~/.hermes/profiles/web-dev/profile.yaml
name: web-dev
model: claude-3.5-sonnet
tools:
  - web_search
  - file_ops
  - terminal
  - code_execution
environment:
  python_version: "3.11"
  node_version: "20"
  workdir: "/projects/web-dev"

skills:
  enabled:
    - fastapi-crud
    - react-component
    - test-generator
  disabled:
    - data-pipeline
    - devops-deploy
```

### Per-Project Profile

```bash
# Setup profile for current project
cd /home/midory/rpl-ai-curriculum
hermes profile create rpl-curriculum
hermes profile use rpl-curriculum

# Profile will remember project context
```

### Memory Isolation

```yaml
# ~/.hermes/profiles/web-dev/memories/context.yaml
project_name: "Web Dev Platform"
tech_stack: "FastAPI + React + PostgreSQL"
coding_standards: "PEP8, Prettier, ESLint"
team: ["alice", "bob", "charlie"]
repository: "git@github.com:org/web-platform.git"
```

---

## 6. MCP (Model Context Protocol)

MCP memungkinkan Hermes Agent terhubung dengan **external tools dan services**.

### Add MCP Server

```bash
# Add MCP server
hermes mcp add my-server \
  --url https://mcp.my-server.com \
  --api-key $MCP_KEY

# List connected MCP servers
hermes mcp list

# Test connection
hermes mcp ping my-server
```

### Custom Tools via MCP

```yaml
# ~/.hermes/mcp/custom-tools.yaml
tools:
  - name: github_issue_create
    description: "Create GitHub issue"
    input:
      repo: string
      title: string
      body: string
      labels: string[]
    server: github-mcp

  - name: slack_notify
    description: "Send Slack notification"
    input:
      channel: string
      message: string
      priority: "low" | "normal" | "high"
    server: slack-mcp

  - name: deploy_service
    description: "Deploy service to Kubernetes"
    input:
      service: string
      namespace: string
      image_tag: string
    server: k8s-mcp
```

### Webhook Triggers

```yaml
# ~/.hermes/mcp/webhooks.yaml
webhooks:
  - name: github-push
    url: /webhooks/github
    events: ["push", "pull_request"]
    action: "Run tests on push"

  - name: deploy-complete
    url: /webhooks/deploy
    events: ["deploy.success", "deploy.failure"]
    action: "Notify team via slack"
```

### MCP Use Cases

| MCP Server | Tools Provided | Use Case |
|------------|---------------|----------|
| GitHub MCP | Issues, PR, commits, reviews | Dev workflow automation |
| Slack MCP | Messages, channels, threads | Team notifications |
| Jira MCP | Tickets, sprints, boards | Project management |
| Database MCP | SQL queries, migrations | Data operations |
| Kubernetes MCP | Deployments, pods, logs | Infrastructure management |
| Custom API MCP | Any REST/GraphQL API | Business-specific tools |

---

## 7. Kanban

Kanban board untuk **task management multi-session**. Mirip Trello/Notion tapi di dalam Hermes.

### Create Board

```bash
# Create new board
hermes kanban create "Module 53 Development"

# List boards
hermes kanban list
```

### Manage Tasks

```bash
# Add task
hermes kanban add "Module 53" \
  --title "Write session 01" \
  --description "AI coding tools comparison" \
  --priority high \
  --due "2026-07-06"

# Move task
hermes kanban move "Write session 01" --to in-progress
hermes kanban move "Write session 01" --to done

# List board
hermes kanban show "Module 53"
```

### Board Structure

```yaml
# ~/.hermes/kanban/module-53.yaml
board:
  name: "Module 53 Development"
  columns:
    - name: backlog
      tasks:
        - title: "Finalize session 04"
          priority: high
          status: open

    - name: in-progress
      tasks:
        - title: "Write session 03"
          priority: high
          status: active
          started: "2026-07-05"

    - name: review
      tasks:
        - title: "Write session 02"
          priority: medium
          status: review

    - name: done
      tasks:
        - title: "Write session 01"
          priority: high
          status: completed
          completed: "2026-07-05"
```

### Multi-Session Tracking

```bash
# Continue task from previous session
hermes kanban continue "Write session 03"

# This will:
# 1. Check current session context
# 2. Load relevant files
# 3. Resume where left off
```

### Kanban Commands

```bash
hermes kanban list                          # List all boards
hermes kanban create "Board Name"           # Create board
hermes kanban show "Board Name"             # Show board with tasks
hermes kanban add "Board" --title "T"       # Add task
hermes kanban move "Task" --to "column"     # Move task
hermes kanban done "Task"                   # Mark done
hermes kanban delete "Task"                 # Remove task
hermes kanban continue "Task"               # Resume task
hermes kanban archive "Board Name"          # Archive board
```

---

## 8. Tips: Prompting Hermes

### Prompt Structure

```
[Context] + [Task] + [Constraints] + [Output Format]

Contoh baik:
"Di project /projects/my-api, buat file auth.py
dengan fungsi login(email, password) yang return JWT token.
Gunakan FastAPI + python-jose. Include error handling.
Output: complete file content."

Contoh kurang baik:
"Buat auth."
```

### Context Management

```markdown
# Cara inject context ke Hermes:

## 1. File context
"Baca /projects/my-api/README.md, lalu implementasi sesuai doc"

## 2. Code context
"Lihat fungsi get_user() di models.py, buat test untuk fungsi itu"

## 3. Session context
(dalam sesi yang sama, Hermes ingat konteks percakapan)

## 4. Skill context
"Gunakan skill fastapi-crud untuk buat endpoint products"
```

### Tool Selection Tips

| Tool | When to Use | Prompt Pattern |
|------|------------|----------------|
| **file_ops** | Read/write files | "Buat file ... berisi ..." |
| **terminal** | Run commands | "Jalankan ..." |
| **web_search** | Research | "Cari dokumentasi tentang ..." |
| **code_execution** | Test code | "Jalankan test untuk ..." |
| **browser_use** | Web tasks | "Buka website ..., lakukan ..." |

### Power User Tips

1. **Multi-step prompting** — Break complex request into steps
2. **Use skills** — Jangan repeat workflow, simpan sebagai skill
3. **Context window** — File besar? Baca sebagian, bukan seluruhnya
4. **Iterative refinement** — "Better", "Add error handling", "Now optimize"
5. **File references** — Use absolute paths, jangan relatif ambiguous
6. **Be explicit about tools** — "Cari di web..." triggers web search
7. **Use profiles** — Switch profile per project untuk memory isolation

---

## 9. Latihan

### Latihan 1: Create Skill from Workflow

1. Pilih workflow yang sering kamu lakukan (misal: setup FastAPI project, create React component, run test suite)
2. Catat langkah-langkahnya

Contoh workflow: "Setup FastAPI Project"

```yaml
name: setup-fastapi
version: 1.0.0
description: "Setup new FastAPI project with standard structure"

steps:
  - name: create-project-structure
    prompt: |
      Buat struktur folder FastAPI project:
      - src/ (main app)
      - src/api/ (routers)
      - src/models/ (database models)
      - src/schemas/ (pydantic schemas)
      - src/services/ (business logic)
      - tests/
      - alembic/ (migrations)

  - name: setup-dependencies
    prompt: |
      Buat requirements.txt dengan:
      fastapi, uvicorn, sqlalchemy, alembic,
      pydantic, python-jose, passlib, pytest

  - name: create-base-app
    prompt: |
      Buat src/main.py FastAPI app dengan:
      - CORS middleware
      - Health check endpoint
      - Router includes
      - Exception handlers
```

3. Simpan sebagai skill:

```bash
hermes skill create setup-fastapi
# Edit ~/.hermes/skills/setup-fastapi/skill.yaml
hermes skill run setup-fastapi
```

### Latihan 2: Setup Profile + Kanban

1. Buat profile baru untuk salah satu project kamu:

```bash
hermes profile create my-project
hermes profile use my-project
```

2. Setup kanban board untuk project:

```bash
hermes kanban create "My Project"
hermes kanban add "My Project" \
  --title "Task 1" --priority high
hermes kanban add "My Project" \
  --title "Task 2" --priority medium
hermes kanban add "My Project" \
  --title "Task 3" --priority low
```

3. Practice move tasks:

```bash
hermes kanban move "Task 1" --to in-progress
hermes kanban show "My Project"
```

### Latihan 3: MCP Integration

Jika punya akses ke MCP server:

1. Add MCP server:

```bash
hermes mcp add my-server --url <mcp-url>
hermes mcp list
```

2. Create custom tool yang menggunakan MCP

3. Test tool via Hermes

### Delivery

- [ ] Skill file di `~/.hermes/skills/<nama-skill>/skill.yaml`
- [ ] Profile aktif untuk project
- [ ] Kanban board dengan minimal 3 tasks
- [ ] Screenshot/catatan dari latihan

---

## Key Takeaways

1. **Delegation** — Hermes auto-delegate task ke sub-agent yang tepat
2. **Skills** — Simpan workflow reusable, version, improve
3. **Kron** — Jadwalkan periodic tasks dengan cron syntax
4. **Profiles** — Isolasi workspace per project, memory terpisah
5. **MCP** — Extend Hermes dengan custom tools dan webhooks
6. **Kanban** — Track tasks multi-session, resume kapan saja
7. **Power user** — Combine semua feature untuk workflow automation

---

## Next Steps After Module 53

- Explore **MCP marketplace** untuk tools tambahan
- Build **complex skill chains** (skill yang memanggil skill lain)
- Setup **multi-profile workspace** untuk semua project
- Automate **CI/CD pipeline** dengan kron + MCP
- Build **custom MCP server** untuk business-specific tools
