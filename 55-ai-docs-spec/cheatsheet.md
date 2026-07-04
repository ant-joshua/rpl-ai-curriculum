# AI-Assisted Documentation & Spec — Cheatsheet

## Tech Spec with AI

### 8 Sections of Tech Spec
```
1. Context — why? problem? relation to existing system?
2. Goals — measurable outcomes, what success looks like
3. Non-Goals — what we're NOT doing, scope boundaries
4. Architecture — high-level diagram (Mermaid), components, data flow
5. API Design — endpoints, request/response schemas, error handling, auth
6. Data Model — entities, relationships, schema, migration strategy
7. Migration Plan — steps from current to target, rollback, data integrity
8. Risks & Mitigations — known unknowns, failure scenarios, contingency
```

### AI-Assisted Flow
```
PRD → AI Generate Draft → Human Review → AI Iterate → AI Review → Final Spec
```

### Architecture Decision Records (ADR)
```markdown
# ADR-[N]: [Title]
## Status
Proposed | Accepted | Deprecated | Superseded
## Context
## Decision
## Options Considered (table: Option | Pros | Cons)
## Consequences
## References
```

### Mermaid Diagram Types
| Type | Use Case |
|------|----------|
| `sequenceDiagram` | API interaction flow |
| `flowchart TD` | System architecture |
| `classDiagram` | Data model / Entities |
| `stateDiagram-v2` | State machine / Workflow |
| `erDiagram` | Entity-Relationship |
| `C4Context` | C4 model context diagram |

### AI Spec Review Checklist
| Check | Description |
|-------|-------------|
| Completeness | Semua 8 section ada? |
| Consistency | Istilah konsisten? API match data model? |
| Feasibility | Estimasi realistic? Dependencies clear? |
| Clarity | Bagian ambiguous? Perlu detail? |
| Risk Coverage | Risks teridentifikasi? Ada mitigasi? |

---

## Documentation Generation

### README Structure
```
Title + Badge → Description → TOC → Setup → Usage → API → Architecture → Contributing → License
```

### API Doc Tools
| Tool | Description | Command |
|------|-------------|---------|
| TypeDoc | HTML docs from TypeScript | `npx typedoc src/index.ts` |
| swagger-jsdoc | OpenAPI from JSDoc | `npx swagger-jsdoc -d swagger.js` |
| jsdoc-to-markdown | JSDoc → Markdown | `npx jsdoc2md src/*.js > API.md` |

### TSDoc Tags
| Tag | Usage |
|-----|-------|
| `@param` | Parameter (name + description) |
| `@returns` | Return value |
| `@throws` | Error conditions |
| `@example` | Usage example |
| `@deprecated` | Mark deprecated + reason |
| `@see` | Link to related code |

### Conventional Commits → Changelog
| Type | Section | Release |
|------|---------|---------|
| `feat` | Features | MINOR |
| `fix` | Bug Fixes | PATCH |
| `BREAKING CHANGE` | Breaking Changes | MAJOR |
| `docs` | Documentation | - |
| `refactor` | Code Refactoring | - |
| `perf` | Performance | - |

Tools: `standard-version`, `changelogen`, `git-cliff`

### AI Auto-Update Docs
```
Code change → CI detect diff → AI compare old vs new API surface
→ AI generate suggested doc updates → PR created → Developer review
```

---

## Context Files for AI Agents

### Three Main Files
| File | Target AI | Fokus |
|------|-----------|-------|
| `AGENTS.md` | All AI agents (general) | Project overview, structure, conventions |
| `CLAUDE.md` | Claude Code (Anthropic) | Coding style, test strategy, preferred patterns |
| `SOUL.md` | Codex (Cursor) | Project soul, constraints, goals |

### AGENTS.md — Universal Context
```
## Description
## Repo Structure (tree)
## Tech Stack (Runtime, Framework, Language, Database, Auth, UI, Testing, PM)
## Architecture
## Environment Setup (clone → install → env → db → migrate → dev)
## Conventions (naming, imports, error handling, state management, CSS, commits)
## Common Tasks (adding page, adding API route, database migration)
```

### CLAUDE.md — Claude Code Specific
```
## Coding Style (formatting, TypeScript strict, async pattern, error handling)
## Testing Strategy (unit/integration/E2E, coverage target, mocking, file location)
## Preferred Patterns (React components, API routes, DB queries)
## Commands (dev, test, lint, typecheck, build)
## Common Pitfalls
```

### SOUL.md — Codex/Cursor Specific
```
## Project Soul — what is this project about
## Constraints — mobile-first, offline resilience, SSR preferred, GDPR
## Goals — quarterly milestones
## Non-Goals — what we're not building
## Architecture Invariants — rules that must never be violated
## References — Figma, OpenAPI, schema
```

### Per-Stack Templates
| Stack | Key Conventions |
|-------|----------------|
| Node/Express | routes/, controllers/, services/, middleware/, error handling centralized |
| React/Next.js | page.tsx (server default), layout.tsx, loading.tsx, error.tsx, app/api/* |
| Mastra AI | agents/, tools/, workflows/, RAG pipelines/ |
| Docker/K8s | multi-stage builds, Kustomize overlays, Helm charts, health checks |

---

## Rules Files for AI-Assisted Coding

### File Map
| File | Tool | Location |
|------|------|----------|
| `.cursorrules` | Cursor IDE | Root project |
| `.windsurfrules` | Windsurf IDE | Root project |
| `.github/copilot-instructions.md` | GitHub Copilot | `.github/` |
| `.vscode/settings.json` | VS Code | `.vscode/` |

### .cursorrules — Example Structure
```
You are an expert in [tech stack].

Key instructions:
- [rule 1], [rule 2], ...

Code style:
- [PascalCase], [camelCase], [quotes], [semicolons], [indentation]

Error handling:
- [pattern], [class], [middleware]

Testing:
- [framework], [co-location], [mocking]

Naming:
- Components: UserProfile.tsx, Hooks: useAuth.ts, Pages: page.tsx

Project-specific:
- [conventions], [format], [forbidden patterns]
```

### .windsurfrules — YAML Format
```yaml
rules:
  - description: "Use TypeScript strict mode"
    pattern: "*.ts"
    rule: "No 'any' type."
  - description: "Component naming"
    pattern: "src/components/**/*.tsx"
    rule: "PascalCase for file names and exports."
```

### copilot-instructions.md
Sections: Language & Framework → Code Style → Naming → File Organization → Common Patterns → Testing → Documentation

### Rule Content — Detail Sections

**Coding Style:**
- 2-space indentation, single quotes, no semicolons (Prettier default)
- Arrow functions, template literals, destructuring, optional chaining, nullish coalescing

**Naming:**
- PascalCase: Components, Types, Interfaces, Enums, Classes
- camelCase: Functions, Variables, Methods, Parameters
- UPPER_SNAKE_CASE: Constants, Env vars

**Import Order:**
1. Node built-ins (fs, path)
2. External packages (react, express)
3. Internal modules (@/...)
4. Relative imports (./...)
5. Types (`import type`)

**Error Handling:**
- Custom AppError with message, statusCode, code, details
- Known errors → specific code | Unknown errors → 500 + log
- Validation → 400, Auth → 401/403, Not found → 404

### Multi-Rule Strategy (Three-Layer)
```
.cursorrules                    — Global (all files)
.cursor/rules/
  ├── framework.react.mdc       — React-specific
  ├── framework.next.mdc        — Next.js-specific
  ├── database.mdc              — DB-specific
  ├── testing.vitest.mdc        — Testing-specific
  └── project-specific.mdc      — Project-specific
```
