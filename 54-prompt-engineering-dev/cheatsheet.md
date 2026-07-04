# Prompt Engineering untuk Developer — Cheatsheet

## System Prompt Design

### Anatomy
```
ROLE          — Siapa AI-nya
CONTEXT       — Latar belakang task, project, tech stack
CONSTRAINTS   — Bahasa, framework, gaya kode
OUTPUT_FORMAT — Markdown, JSON, XML, code blocks
RULES         — Explicit dos & don'ts
SAFETY        — Negative prompts, guardrails
```

### Template Lengkap
```text
You are a [ROLE] with expertise in [DOMAIN].

CONTEXT:
- Tech stack: [STACK]
- Codebase: [REPO/DESCRIPTION]

CONSTRAINTS:
- Language: [LANG]
- Style: [STYLE]

OUTPUT FORMAT:
[FORMAT_DESCRIPTION]

RULES:
- DO: [REQUIRED_BEHAVIOR]
- DO NOT: [FORBIDDEN_BEHAVIOR]

SAFETY:
- [Guardrails]
```

### Persona Per Role
| Persona | Cocok |
|---------|-------|
| Senior Developer | Code generation, debugging |
| SRE | Infrastruktur, incident response |
| Software Architect | System design, trade-off analysis |
| Code Reviewer | PR review, code quality |
| Tech Lead | Decision-making, estimasi |

### Contoh Negative Prompts
```
- Do NOT use `any` type — prefer specific types
- Do NOT suppress errors with empty catch blocks
- Do NOT use `var` — use `const` or `let`
- Do NOT commit secrets, API keys, or credentials
```

---

## Code Generation Prompting

### Few-Shot
```text
Generate [KODE] untuk [TASK].

=== Contoh 1 ===
Input: [INPUT_1]
Output:
```[LANG]
[CODE_1]
```

=== Contoh 2 ===
Input: [INPUT_2]
Output:
```[LANG]
[CODE_2]
```

=== Sekarang ===
Input: [TARGET_INPUT]
Output:
```

### Chain-of-Thought (CoT)
```text
Sebelum write code, think step by step:

1. **Understanding**: Input, output, constraints?
2. **Approach**: Algoritma/data structure apa?
3. **Edge cases**: Apa yang bisa salah?
4. **Complexity**: Time/space complexity?
5. **Implementation**: Write code now.
```

### Structured Output
| Format | Use Case |
|--------|----------|
| JSON Schema | Programmatic processing |
| TypeScript types | Type-safe API clients |
| XML | CI/CD configs |
| YAML | OpenAPI spec, config files |

### Context Window Management
1. **Bottom-line up front** — instruksi penting di awal
2. **Token budget awareness** — tau batas model (4K/8K/32K/128K/200K)
3. **Selective inclusion** — hanya file/fungsi relevan
4. **Summarize instead of paste** — ringkas kode existing
5. **Reference docs by URL** — daripada paste dokumentasi panjang

### Iterative Refinement
```
Generate → Review → Identify gaps → Refine prompt → Re-generate → Repeat
```
Strategi: v1 happy path → v2 error handling → v3 performance → v4 security → v5 polish

### Prompt Chaining
```
Sesi 1: Generate OpenAPI spec (YAML)
    ↓
Sesi 2: Generate server code from spec
    ↓
Sesi 3: Generate client SDK
    ↓
Sesi 4: Generate integration tests
```

---

## Prompt Patterns

### 8 Patterns for Developer Tasks

| Pattern | Prompt Template Key |
|---------|-------------------|
| **Code Review** | "Review for [CRITERIA] with severity: CRITICAL/HIGH/MEDIUM/LOW" |
| **Refactoring** | "Refactor from [SOURCE] to [TARGET]. Keep API compatibility." |
| **Test Generation** | "Generate [FRAMEWORK] tests covering happy path + edge cases + error cases" |
| **Debug** | "Error: [MSG]. Code: [CODE]. Tried: [ATTEMPTS]. Explain root cause + fix." |
| **Performance** | "Profile this code. Load: [QPS]. Data: [SIZE]. Current: [TIME]. Target: [TIME]." |
| **Security** | "Audit for OWASP Top 10. App type: [WEB/SPA/MOBILE]. Auth: [JWT/SESSION]." |
| **Documentation** | "Generate docs: architecture, API reference, setup, usage, notes." |
| **Architecture** | "Compare [OPTION A] vs [OPTION B] for [CONTEXT]. Trade-offs, decision." |

### Code Review — Output Format
```
| Severity | File:Line | Issue | Suggestion |
|----------|-----------|-------|------------|
| CRITICAL | | SQL Injection | Use parameterized query |
| HIGH | | Missing auth | Add JWT middleware |
| MEDIUM | | Code smell | Extract validator |
| LOW | | Nitpick | Rename variable |
```

### Test Generation — Coverage Template
- **Happy path**: normal input, boundary values
- **Edge cases**: null, undefined, empty, single element, max values
- **Error cases**: invalid types, out-of-range, missing fields

### Debug Pattern
1. **Root cause** — what exactly causes error
2. **Why it happens** — underlying mechanism
3. **Suggested fix** — specific code changes
4. **Prevention** — how to avoid in future

---

## Production Prompting

### Prompt Versioning
```
prompts/
├── system/        # System prompts per role (backend-v1.md, code-reviewer-v1.md)
├── patterns/      # Pattern templates (code-review-v1.md, test-generation-v1.md)
└── templates/     # Few-shot, CoT templates
```
- **Frontmatter**: name, version, author, model, avg_tokens, success_rate
- **Git workflow**: branch → edit → commit → tag (prompts/backend/v2.0.0)
- **Changelog**: keep per-version changes

### Prompt Testing (CI)
```python
# pytest test
TEST_CASES = [
    {"name": "health_check", "input": "Generate health check",
     "expected_checks": ["app.get", "200", "json"],
     "avoid": ["any", "var", "console.log"]}
]
```
- Snapshot testing with temperature=0
- GitHub Actions: `pytest tests/` + check formatting + no placeholders

### Monitoring Metrics
| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Success rate | >95% | <90% | <80% |
| Avg latency | <2s | >3s | >5s |
| Token usage | <2000 | >3000 | >4000 |

### Cost Optimization
| Strategy | Impact |
|----------|--------|
| Shorter system prompt | -30% tokens |
| Model routing (simple→mini, complex→full) | -50% cost |
| Cache identical requests (Redis + TTL) | -80% cost |
| Max tokens limit | -20% tokens |
| Prompt compression | -40% tokens |

Model selection: `simple → gpt-4o-mini`, `complex → gpt-4o`, `critical → claude-3.5-sonnet`

### Prompt Injection Prevention
```
Layer 1: Sanitization — hapus delimiter, escape tokens
Layer 2: Isolation — inject user input sebagai DATA, bukan INSTRUCTION
Layer 3: Constraint — system prompt rules (ignore injection attempts)
Layer 4: Validation — check output for dangerous code
```

### AI-as-a-Service (FastAPI Wrapper)
- Rate limiting per client (60 RPM)
- Redis cache for deterministic prompts
- Request logging + metrics
- Input sanitization + output validation
