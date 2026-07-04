# AI Coding Agents & Workflow — Latihan

## Level 1: Dasar

### 1. AI Coding Tools — Comparison Matrix
**Pertanyaan:** Bandingkan 5 AI coding tools dan tentukan kapan pakai yang mana:

```markdown
# === LENGKAPI: Tools comparison matrix ===

| Tool | Kelebihan | Kekurangan | Harga | Best for |
|------|-----------|------------|-------|----------|
| Claude Code | ? | ? | ? | ? |
| Codex CLI (OpenAI) | ? | ? | ? | ? |
| Cursor IDE | ? | ? | ? | ? |
| GitHub Copilot | ? | ? | ? | ? |
| Hermes Agent | ? | ? | ? | ? |

# === LENGKAPI: Decision tree ===
# Buat flowchart text untuk memilih tool:
# Pertanyaan 1: Butuh IDE integration? 
#   ├── Ya -> ? (Cursor/Copilot)
#   └── Tidak -> ?
# Pertanyaan 2: ?
#   ├── ?
#   └── ?
# ...
```

```
# === LENGKAPI: Tool selection for scenarios ===
# Scenario 1: Build REST API from scratch (new project)
# Tool terbaik: ? | Kenapa: ?
# Scenario 2: Refactor existing large codebase
# Tool terbaik: ? | Kenapa: ?
# Scenario 3: Debug production issue (need context)
# Tool terbaik: ? | Kenapa: ?
# Scenario 4: Learn new framework/docs
# Tool terbaik: ? | Kenapa: ?
# Scenario 5: Automated CI/CD pipeline with AI
# Tool terbaik: ? | Kenapa: ?
```

1. Lengkapi comparison matrix dengan data akurat
2. Buat decision tree untuk memilih tool
3. Test 2 tools berbeda untuk task yang sama, bandingkan hasilnya

**Hint:** Claude Code: terminal-native, bagus untuk large context, support MCP. Codex CLI: OpenAI, bagus untuk code generation, terminal-based. Cursor: VS Code fork, inline AI, composer. Copilot: IDE integration, autocomplete, chat. Hermes Agent: orchestrator multi-agent, skill system, cron, kanban. Best for: Claude → complex reasoning, Cursor → daily coding, Copilot → autocomplete, Hermes → multi-step workflow.

---

### 2. Orchestrator Pattern — Multi-Agent Workflow
**Pertanyaan:** Bangun orchestrator yang mengkoordinasikan multiple agents:

```typescript
// === LENGKAPI: Orchestrator dengan worker agents ===
// src/orchestrator/index.ts

interface Task {
  id: string;
  type: 'code' | 'review' | 'test' | 'docs';
  description: string;
  context: any;
}

// === LENGKAPI: Agent interface ===
interface Agent {
  name: string;
  role: string;
  canHandle(taskType: string): boolean;
  execute(task: Task): Promise<any>;
}

// === LENGKAPI: Orchestrator class ===
class Orchestrator {
  private agents: Agent[] = [];
  
  registerAgent(agent: Agent) {
    // === LENGKAPI: Register agent ke orchestrator ===
  }
  
  async executeTask(task: Task): Promise<any> {
    // === LENGKAPI: ===
    // 1. Find agent yang bisa handle task
    // 2. Execute task dengan agent
    // 3. Handle error dan retry
    // 4. Log execution
  }
  
  async executeWorkflow(workflow: Task[]): Promise<any[]> {
    // === LENGKAPI: ===
    // 1. Execute tasks secara sequential atau parallel
    // 2. Pass context antar task
    // 3. Aggregate results
  }
}

// === LENGKAPI: Worker agent implementations ===
const codeAgent: Agent = {
  name: 'Code Writer',
  role: 'Generate production-ready code',
  canHandle: (type) => type === 'code',
  execute: async (task) => {
    // === LENGKAPI: Generate code based on task description ===
  }
};

const reviewAgent: Agent = {
  name: 'Code Reviewer',
  role: 'Review code for bugs, security, best practices',
  // === LENGKAPI ===
};

const testAgent: Agent = {
  name: 'Test Writer',
  role: 'Generate unit and integration tests',
  // === LENGKAPI ===
};
```

1. Lengkapi orchestrator pattern dengan worker agents
2. Implementasi 3 agents: writer, reviewer, tester
3. Buat workflow: code → review → test (sequential dengan context passing)

**Hint:** Orchestrator pattern: central coordinator yang manage task distribution, context, error handling, retry. Parallel vs sequential: independent tasks bisa parallel, dependent tasks harus sequential. Context: object yang di-pass antar tasks (file paths, generated code, review comments). Error handling: retry 3x untuk transient errors, abort untuk critical errors.

---

### 3. AI Coding Loop — Plan → Code → Test → Review → Refactor
**Pertanyaan:** Jalankan AI coding loop disiplin untuk satu fitur:

```typescript
// === LENGKAPI: Coding loop implementation ===
// Task: Implement user registration endpoint

// === PHASE 1: PLAN ===
// Buat plan detail sebelum mulai coding
// === LENGKAPI: Tulis plan ===
// 1. Accept: email, password, name
// 2. Validate: email format, password min 8 char, name min 2 char
// 3. Hash password dengan bcrypt (cost 12)
// 4. Store user di PostgreSQL dengan Prisma
// 5. Return: { id, email, name, createdAt }
// 6. Error cases: duplicate email, validation error, server error

// === PHASE 2: CODE ===
// === LENGKAPI: Generate code berdasarkan plan ===
// - Schedule: POST /api/auth/register
// - Validation middleware
// - Controller logic
// - Error handling

// === PHASE 3: TEST ===
// === LENGKAPI: Generate test cases ===
// describe('POST /api/auth/register')
// 1. Should register new user with valid data -> 201
// 2. Should reject duplicate email -> 409
// 3. Should reject invalid email format -> 400
// 4. Should reject short password -> 400
// 5. Should not return password hash -> ?

// === PHASE 4: REVIEW ===
// === LENGKAPI: Review kode ===
// Checklist:
// [ ] Security: password hashed?
// [ ] Validation: semua input divalidasi?
// [ ] Error handling: semua error case covered?
// [ ] Performance: N+1 query?
// [ ] Best practices: async/await, try-catch?

// === PHASE 5: REFACTOR ===
// === LENGKAPI: Refactor improvements ===
// Issues found:
// 1. ?
// 2. ?
// 3. ?
```

1. Jalankan 5 fase coding loop untuk 1 fitur
2. Catat berapa iterasi yang diperlukan sampai semua test pass
3. Dokumentasikan lessons learned: prompt apa yang efektif, apa yang tidak

**Hint:** Disciplined loop: jangan skip fase. Plan dulu — spend 20% waktu untuk plan, 50% code, 20% test, 10% review. Iterasi: biasanya perlu 2-3 iterasi untuk fitur sederhana. AI tips: semakin spesifik plan, semakin baik output. Refactor phase: cek duplication, naming, error handling, performance. Stop ketika semua test pass dan review checklist terpenuhi.

---

## Level 2: Intermediate

### 4. Hermes Agent — Custom Skills & Delegation
**Pertanyaan:** Setup Hermes Agent dengan custom skill dan delegation:

```yaml
# === LENGKAPI: Hermes profile configuration ===
# ~/.hermes/profiles/dev/profile.yaml
name: dev
description: Development profile with coding skills

skills:
  # === LENGKAPI: Buat 3 custom skills ===
  # Skill 1: Code Review
  # - Trigger: review <path>
  # - Action: review code for bugs, security, best practices
  
  # Skill 2: Test Generation
  # - Trigger: test <path>
  # - Action: generate unit tests for selected file
  
  # Skill 3: Documentation
  # - Trigger: docs <path>
  # - Action: generate/update documentation

# === LENGKAPI: Delegation rules ===
# Kapan delegasikan task ke agent?
# 1. ? -> delegate (repetitive task)
# 2. ? -> manual (creative/architectural decision)
# 3. ? -> hybrid (AI generate, human review)
```

```typescript
// === LENGKAPI: Custom skill implementation ===
// ~/.hermes/skills/code-review.ts
import { Skill } from 'hermes-agent';

export const codeReviewSkill: Skill = {
  name: 'code-review',
  description: 'Review kode untuk bugs, security, dan best practices',
  
  async execute(input: { filePath: string }): Promise<any> {
    // === LENGKAPI: ===
    // 1. Read file content
    // 2. Analyze for common issues
    // 3. Generate review report
    // 4. Return structured feedback
  }
};
```

```yaml
# === LENGKAPI: Kron job untuk automated tasks ===
# ~/.hermes/kron.yaml
jobs:
  # === LENGKAPI: Automated tasks ===
  # 1. Daily dependency audit
  # 2. Weekly code quality report
  # 3. Monthly cleanup task
  - name: daily-audit
    schedule: "0 8 * * *"
    command: "hermes run skill dependency-audit"
```

1. Setup Hermes profile dengan custom skills
2. Implementasi 3 custom skills
3. Buat kron jobs untuk task automation
4. Demonstrasi delegation: "review src/auth.ts" → skill terpanggil otomatis

**Hint:** Hermes profile: folder `~/.hermes/profiles/<name>/` dengan profile.yaml, skills/, plugins/, cron/. Custom skill: implement `Skill` interface dengan `name`, `description`, `execute()`. Trigger: pattern matching di profile.yaml. Delegation: rules based on task type, complexity, context. Kron: cron expression + command. Kanban: `hermes kanban` untuk task management.

---

### 5. MCP — Model Context Protocol
**Pertanyaan:** Setup MCP server untuk memberikan context ke AI agents:

```typescript
// === LENGKAPI: MCP Server implementation ===
// src/mcp/codebase-server.ts
import { Server } from '@modelcontextprotocol/sdk';

// === LENGKAPI: ===
// 1. Create MCP server dengan metadata
// 2. Register tools yang available
// 3. Register resources yang bisa diakses
// 4. Start server

const server = new Server(
  { name: 'codebase-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

// === LENGKAPI: Register tools ===
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'read_file',
      description: 'Read file content from codebase',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path relatif ke project root' }
        },
        required: ['path']
      }
    },
    {
      name: 'search_code',
      description: 'Search codebase dengan regex',
      // === LENGKAPI: inputSchema ===
    },
    {
      name: 'get_git_history',
      description: 'Get git log untuk file tertentu',
      // === LENGKAPI: inputSchema ===
    },
    {
      name: 'run_linter',
      description: 'Run linter pada file tertentu',
      // === LENGKAPI: inputSchema ===
    }
  ]
}));

// === LENGKAPI: Tool implementation ===
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'read_file':
      // === LENGKAPI: Read file and return content ===
      break;
    case 'search_code':
      // === LENGKAPI: Search using ripgrep ===
      break;
    // ...
  }
});
```

1. Setup MCP server dengan tools untuk akses codebase
2. Integrasikan dengan Claude Desktop atau Hermes Agent
3. Test: minta AI "read file src/auth.ts" → MCP tool terpanggil

**Hint:** MCP = Model Context Protocol — standard cara AI agents mengakses tools dan resources. Tools: functions yang bisa dipanggil AI. Resources: files, databases, APIs yang bisa diakses. Server: bisa standalone process atau embedded. Integration: configure `mcpServers` di Claude Desktop config atau Hermes profile. Contoh tools: read_file, search_code, get_git_diff, run_tests, lint_code.

---

### 6. AI Coding — Prompt Library
**Pertanyaan:** Buat prompt library untuk berbagai task coding:

```markdown
# === LENGKAPI: Prompt templates ===

## 1. Generate API Endpoint
```
Buat endpoint [METHOD] /[path] yang [deskripsi].

Requirements:
- Validasi input dengan Zod
- TypeScript + Express
- Error handling dengan AppError
- Logging dengan correlation ID

Response format:
{ success: boolean, data?: ..., error?: { code: string, message: string } }

=== LENGKAPI: Fill in specific requirements ===
Method: ?
Path: ?
Deskripsi: ?
Input schema: ?
Business logic: ?
```

## 2. Code Review Prompt
```
Review kode berikut untuk:
- Security vulnerabilities
- Performance issues
- Best practices violations
- Type safety
- Error handling

Kode:
[code]

=== LENGKAPI: Tulis prompt yang lebih spesifik ===
```

## 3. Test Generation Prompt
```
=== LENGKAPI: Buat prompt untuk generate test ===
Include: test cases untuk happy path, error path, edge cases
Framework: Vitest
Setup: describe/it pattern
```

## 4. Refactoring Prompt
```
=== LENGKAPI: Buat prompt untuk refactoring ===
Target: improve readability, maintainability, performance
```

1. Buat 8 prompt templates untuk task developer sehari-hari
2. Test setiap prompt dengan AI coding tool
3. Dokumentasikan mana prompt yang efektif dan mana yang tidak

**Hint:** Effective prompt structure: (1) role & context, (2) task description, (3) requirements, (4) constraints, (5) output format, (6) examples. Prompt categories: code generation, code review, test generation, refactoring, debugging, documentation, database design, architecture. Iterate: kalau output kurang bagus, refine prompt. Save yang berhasil ke prompt library.

---

### 7. AI Code Review — Automated PR Review
**Pertanyaan:** Setup automated PR review dengan AI:

```yaml
# === LENGKAPI: GitHub Action untuk AI code review ===
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
      
      # === LENGKAPI: ===
      # 1. Get PR diff
      # 2. Send diff ke AI (OpenAI/Claude API)
      # 3. Parse review response
      # 4. Post review comments ke PR
      # 5. Add review summary
      
      - name: Get PR diff
        id: diff
        run: |
          # === LENGKAPI: Get diff antara base dan head ===
          
      - name: AI Review
        id: review
        run: |
          # === LENGKAPI: Send diff to AI API ===
          # Gunakan GitHub Secrets untuk API key
      
      - name: Post Review
        # === LENGKAPI: Post comments ke PR ===
```

```typescript
// === LENGKAPI: AI review prompt ===
const reviewPrompt = `
You are a senior developer reviewing a PR. Review the following diff for:

1. **Security**: SQL injection, XSS, insecure auth, hardcoded secrets
2. **Performance**: N+1 queries, memory leaks, unnecessary computations
3. **Best Practices**: SOLID, DRY, error handling, logging
4. **Type Safety**: TypeScript strict mode violations
5. **Testing**: Missing test cases, edge cases not handled

For each issue, provide:
- Severity: CRITICAL / WARNING / SUGGESTION
- File and line number
- Description of the problem
- Suggested fix

Diff:
${diff}
`;

// === LENGKAPI: Parse AI response menjadi structured comments ===
function parseReviewResponse(aiResponse: string): ReviewComment[] {
  // === LENGKAPI: Parse markdown jadi array of comments ===
}
```

1. Setup GitHub Action untuk AI code review
2. Buat prompt yang menghasilkan structured feedback
3. Post review comments otomatis ke PR
4. Test: buat PR dengan intentional bugs → AI harus detect

**Hint:** GitHub API: `octokit.rest.pulls.createReviewComment` untuk post comment. Diff: `git diff origin/main...HEAD` atau Github API `getPullRequestDiff`. AI API: OpenAI `gpt-4o` atau Claude `claude-3-opus`. Rate limiting: batch comments, jangan post satu-satu. Security: jangan expose API key di output. Prompt: minta output dalam format JSON atau markdown terstruktur agar mudah di-parse.

---

### 8. Kanban Board — Task Management dengan Hermes
**Pertanyaan:** Setup kanban board untuk manage tasks dengan Hermes Agent:

```bash
# === LENGKAPI: Hermes kanban commands ===

# 1. Buat task baru
hermes kanban add "Implement user registration" \
  --column "Backlog" \
  --priority high \
  --labels "backend,auth" \
  --assignee me

# 2. === LENGKAPI: Tambah 3 task lain ===
# - Task: Setup database schema
# - Task: Write unit tests
# - Task: Documentation

# 3. Pindah task ke "In Progress"
# === LENGKAPI ===

# 4. Lihat board
# === LENGKAPI ===

# 5. Complete task
# === LENGKAPI ===

# === LENGKAPI: Automation rules ===
# Buat rule otomatis:
# 1. Kalau task pindah ke "Review", auto-assign reviewer
# 2. Kalau task di "In Progress" > 3 hari, kirim reminder
# 3. Kalau task completed, auto-log waktu
```

```yaml
# === LENGKAPI: Kanban profile configuration ===
# ~/.hermes/profiles/dev/profile.yaml
kanban:
  columns:
    - name: Backlog
      wip_limit: 0  # unlimited
    - name: Todo
      wip_limit: 10
    - name: In Progress
      wip_limit: 3  # max 3 tasks at once
    - name: Review
      wip_limit: 5
    - name: Done
      wip_limit: 0
    
  automation:
    # === LENGKAPI: Automation rules ===
    - trigger: "task.moved.to.Review"
      action: "auto-assign reviewer"
    - trigger: "task.completed"
      action: "log time spent"
    - trigger: "task.stale.72h"
      action: "send reminder"
```

1. Setup kanban board dengan Hermes Agent
2. Buat automation rules untuk workflow
3. Demonstrasi: tambah task → assign → move column → complete
4. Integrasikan dengan skill: "kalau task pindah ke Done, auto-run docs skill"

**Hint:** Hermes kanban: `hermes kanban list`, `hermes kanban move <id> <column>`, `hermes kanban detail <id>`. WIP limits: batasi jumlah task per column untuk cegah overload. Automation: triggers based on task events. Label: grouping tasks by type/priority. Integrasi: skill dipanggil otomatis berdasarkan trigger (misal task completed → run documentation skill).
