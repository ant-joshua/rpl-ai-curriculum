# Advanced AI Development Workflow — Cheatsheet

## AI Code Review Pipeline

### Pipeline Flow
```
PR Created → Checkout Code → AI Review Agent → Post Comment → Auto-fix → Approve/Reject
```

### Trigger
```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
```

### Area Review
| Area | Contoh Detection |
|------|------------------|
| **Code Style** | `snake_case` vs `camelCase`, import order |
| **Logic Bugs** | Off-by-one, null pointer, race condition |
| **Security** | SQLi (`SELECT * FROM users WHERE id = ${id}`), XSS, hardcoded secrets |
| **Performance** | N+1 query, missing index, unnecessary re-render |
| **Test Coverage** | Function tanpa test, low assertion quality |
| **API Design** | Breaking change, missing validation, non-RESTful |

### Severity Level
```
CRITICAL — blocking, must fix before merge
MAJOR    — should fix, high impact
MINOR    — nice to fix, low impact
SUGGESTION — informational, optional
```

### AI Review Prompt Format
```
[SEVERITY: critical|major|minor|suggestion]
**File**: `path/to/file.ts`
**Line**: L12-L18
**Issue**: Description
**Suggestion**: How to fix
**Code**:
```suggestion
// fixed code here
```
```

### Tools Integration
| Tool | Purpose |
|------|---------|
| OpenAI/Claude API | AI review comments |
| Codacy | Static analysis, code quality |
| SonarCloud | Quality gate, tech debt |
| ESLint + Prettier | Linting + formatting |
| Trivy | Container/filesystem security scan |
| Cline | Terminal AI agent for deep review |

### Auto-Fix Workflow
```yaml
- name: Apply AI Fixes
  run: |
    for patch in .ai-review/fixes/*.patch; do
      git apply "$patch"
    done
    git commit -m "fix: AI auto-fix applied"
    git push
```

---

## AI Testing Strategy

### AI TDD Loop
```
RED:   AI generate test suite from spec (sebelum code)
GREEN: AI generate implementation that passes tests
REFACTOR: AI refactor code + update tests, all green
```

### Test Generation — Prompt Template
```
Generate [UNIT|INTEGRATION|E2E] tests for:
[CODE or ENDPOINT SPEC]

Cover:
- Happy path: normal input, boundary values
- Edge cases: null, undefined, empty, boundary
- Error cases: invalid input, auth failure, timeout
- Mock: external API calls, database queries

Framework: [Vitest|Jest|Playwright]
```
| Test Type | Framework | Example |
|-----------|-----------|---------|
| Unit | Vitest | Pure function testing |
| Integration | Supertest + Vitest | API endpoint testing, mock DB |
| E2E | Playwright | User flow: register → login → dashboard |

### Edge Case Detection AI Prompt
```text
Analyze this function and list ALL possible edge cases.
Provide test cases for each.
```

### Property-Based Testing
Use `fast-check` for invariant testing:
```typescript
fc.assert(
  fc.property(
    fc.array(fc.anything()),
    fc.integer({ min: 1, max: 10 }),
    (items, pageSize) => {
      // invariant: all pages combined = total items
    }
  )
);
```

### Test Maintenance
- **Signature change**: AI update existing tests for new signature
- **Flaky test detection**: AI analyze intermittent failures, fix with proper waits
- **Coverage gap**: AI generate tests for uncovered branches/functions

---

## AI Security & Quality Gates

### Pipeline Architecture
```
[Push/PR] → [Lint] → [TypeScript Check] → [Test] → [Coverage] → [Security] → [Build]
```

### Quality Gate Thresholds
| Gate | Threshold | Block Label |
|------|-----------|-------------|
| Lint | Zero errors, warnings < threshold | `blocked:lint` |
| TypeScript | Zero `tsc --noEmit` errors | `blocked:types` |
| Unit Test | All passing | `blocked:tests` |
| Coverage | Lines ≥80%, Branches ≥70% | `blocked:coverage` |
| Security | Zero CRITICAL/HIGH vulns | `blocked:security` |
| Build | Zero build errors | `blocked:build` |

### Gate Check Pattern
```yaml
- name: Gate Check
  if: always()
  run: |
    # Each step with continue-on-error: true
    # Aggregate failures, print summary, exit 1 if any failed
```

### Security Scan Tools
| Tool | Purpose | Command |
|------|---------|---------|
| CodeQL | SAST — semantic analysis | `github/codeql-action` |
| ESLint Security | AST-based security lint | `eslint-plugin-security` |
| Snyk | Dependency vuln scan | `snyk test --severity-threshold=high` |
| Trivy | Filesystem + container scan | `trivy fs --severity HIGH,CRITICAL .` |
| Gitleaks | Secret detection | `gitleaks detect --source .` |
| TruffleHog | Deep secret scanning | `trufflehog filesystem .` |
| OWASP ZAP | DAST — dynamic scan | `zap-full-scan.py` |

### AI Security Audit — OWASP Top 10
```
Prompt: "Perform OWASP Top 10 (2021) audit. For each:
1. OWASP category (A01-A10)
2. Location (file:line)
3. Risk level (Critical/High/Medium/Low)
4. Remediation code
5. CWE reference"
```

### Common Vulnerabilities AI Detects
| Vuln | Pattern | Fix |
|------|---------|-----|
| SQL Injection | `` `SELECT * FROM users WHERE id = ${id}` `` | Parameterized query |
| XSS | `res.send(userInput)` | Escape/sanitize output |
| Hardcoded Secret | `secret: 'abc123'` | Env vars + secret manager |
| Broken Auth | Missing JWT check on `/admin/*` | Auth middleware |
| Insecure CORS | `cors({ origin: '*' })` production | Whitelist specific origins |

### Secret Detection Patterns
```json
{ "pattern": "sk-[a-zA-Z0-9]{20,}", "type": "OpenAI API Key" }
{ "pattern": "AKIA[0-9A-Z]{16}", "type": "AWS Access Key" }
{ "pattern": "ghp_[a-zA-Z0-9]{36}", "type": "GitHub Token" }
{ "pattern": "-----BEGIN PRIVATE KEY-----", "type": "Private Key" }
```

### Branch Protection Rules
Settings → Branches → Add rule:
- Require status checks (`Quality Gates / quality` must pass)
- Require branches up-to-date
- Include administrators

---

## AI Refactoring & Migration

### Code Smell Detection
| Smell | Threshold | Severity |
|-------|-----------|----------|
| Long Function | >50 lines | Medium |
| Large Class | >500 lines, >20 methods | High |
| Duplicated Code | Similar blocks >10 lines across files | High |
| God Object | Single class does too much | Critical |
| Shotgun Surgery | One change → many files | High |
| Feature Envy | Method lebih tertarik data class lain | Medium |
| Long Parameter List | >4 parameters | Medium |
| Dead Code | Unused functions, imports | Low |

### Refactoring Workflow
```
1. PLAN     — AI analisis, propose refactor plan
2. APPROVE  — Developer review plan
3. EXECUTE  — AI execute refactoring
4. VERIFY   — AI run tests, lint, type-check
5. COMMIT   — AI create structured commit message
```

### Migration Patterns
| Type | Example | Approach |
|------|---------|----------|
| Library Upgrade | Express v4 → v5 | Breaking change list + code diffs |
| Framework Migration | JS → TypeScript | Add tsconfig, type annotations, interfaces |
| Pattern Change | Callback → Async/Await | Convert nested callbacks to async/await |
| Monolith → Services | Extract Notification | Strangler Fig: side-by-side → replace |
| Database Schema | Rename `username` → `handle` | Expand-Contract: add column → migrate → drop old |

### Strangler Fig Pattern
```
Phase 1: New service alongside monolith (shared DB)
Phase 2: Migrate consumers — monolith publishes events, new service handles
Phase 3: Delete old code from monolith, transfer data ownership
```

### Database Migration — Expand-Contract
```sql
-- Phase 1: Expand — add new column
ALTER TABLE users ADD COLUMN handle VARCHAR(255);
UPDATE users SET handle = username WHERE handle IS NULL;

-- Phase 2: Migrate application code (deploy update)

-- Phase 3: Contract — drop old column
ALTER TABLE users DROP COLUMN username;
```

### AI Commit Message Format
```
refactor(scope): extract X into focused module

- Extract validation with zod schema
- Break up monolithic function into N smaller functions
- Create [ServiceName] class
- Add characterisation tests for legacy behaviour
- Preserve all existing business rules

Closes #ISSUE
```
