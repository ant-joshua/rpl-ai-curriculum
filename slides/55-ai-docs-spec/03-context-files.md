---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — AI-Assisted Documentation & Spec Generation"
footer: "Sesi 03: Context Files"
---

<!-- _class: title -->
# Session 03: Context Files for AI Agents

**Duration:** 60 minutes  
**Objective:** Create AGENTS.md, CLAUDE.md, and SOUL.md — context files that help AI agents understand project context.

---

## 1. What Are Context Files?

Context files adalah markdown files yang AI coding agents baca untuk paham konteks project. Mereka menjawab: "Apa project ini, gimana strukturnya, apa convention-nya, gimana cara testing?"

### Kenapa Penting?

- **Tanpa context**: AI generate kode yang inconsistent dengan project
- **Dengan context**: AI paham arsitektur, pola, dan constraint project
- **Hasil**: Generate code yang lebih akurat, less hallucination

### Tiga File Utama

| File | Target AI | Fokus |
|------|-----------|-------|
| `AGENTS.md` | All AI agents (general) | Project overview, structure, conventions |
| `CLAUDE.md` | Claude Code (Anthropic) | Coding style, test strategy, preferred patterns |
| `SOUL.md` | Codex (Cursor) | Project soul, constraints, goals |

---

## 2. AGENTS.md — Universal Context

AGENTS.md adalah context file universal yang dibaca oleh berbagai AI coding agents.

### Template

```markdown

---

# Project Name

## Description
[1-2 paragraph tentang project]

## Repo Structure
```
src/
  components/    # React components
  pages/         # Route pages
  api/           # API routes
  lib/           # Utilities & helpers
  types/         # TypeScript types
```

## Tech Stack
- **Runtime:** Node.js 22
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL via Drizzle ORM
- **Auth:** NextAuth v5
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Testing:** Vitest + Playwright
- **Package Manager:** pnpm

## Architecture
- Monorepo with apps/web, apps/api, packages/*
- Feature-based folder structure dalam apps/web
- Shared types dan utilities di packages/*
- API routes pake Next.js Route Handlers
- Database migration pake Drizzle Kit

## Environment Setup
1. Clone: `git clone git@github.com:org/project.git`
2. Install: `pnpm install`
3. Copy env: `cp .env.example .env.local`
4. Run DB: `docker compose up -d`
5. Migrate: `pnpm db:migrate`
6. Dev: `pnpm dev`

## Conventions
- **Naming:** PascalCase untuk components, camelCase untuk functions
- **Imports:** Group: external → internal → types. Sort alphabetically.
- **Error handling:** throw new AppError(code, message) — jangan throw Error langsung
- **State management:** Server components preferred. Client only when needed.
- **CSS:** Tailwind utility classes. No CSS modules.
- **Commits:** Conventional Commits (feat:, fix:, chore:, docs:)

## Common Tasks

### Adding a New Page
1. Create file in `src/app/[route]/page.tsx`
2. Add to navigation config di `src/lib/navigation.ts`
3. Write page component (prefer server component)
4. Add E2E test di `e2e/`

### Adding a New API Route
1. Create file in `src/app/api/[route]/route.ts`
2. Define validation schema with Zod
3. Implement handler
4. Add API test di `src/__tests__/api/`

### Database Migration
- `pnpm db:generate` — generate migration from schema changes
- `pnpm db:migrate` — apply pending migrations
- `pnpm db:seed` — seed data for development
```

---

## 3. CLAUDE.md — Claude Code Specific

CLAUDE.md digunakan oleh Claude Code (Anthropic's CLI coding agent). Lebih fokus pada coding style, test strategy, dan patterns.

### Template

```markdown

---

# CLAUDE.md — Project Guidelines for Claude Code

## Coding Style
- **Formatting:** Prettier default config (tab width: 2, single quotes, no semicolons)
- **TypeScript:** Strict mode. No `any`. Use `unknown` + type narrowing.
- **Async:** Prefer `async/await` over `.then()/.catch()`. No callback patterns.
- **Error handling:** Use `Result<T, E>` pattern (neverthrow or custom). No try/catch in business logic — let error boundary handle it.
- **Null checks:** `??` over `||`. `?.` for optional chaining.

## Testing Strategy
- **Unit tests:** Vitest. Test business logic, not implementation details.
- **Integration tests:** Supertest for API routes, msw for external HTTP.
- **E2E tests:** Playwright. Only for critical user flows.
- **Coverage target:** 80%+. Focus on critical paths first.
- **Mocking:** Prefer dependency injection over mocking modules. Use `vi.mock` only when necessary.
- **Test file location:** Co-located with source: `component.tsx` → `component.test.tsx`

## Preferred Patterns

### React Components
```tsx
// Prefer server components
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId);
  return <div>{user.name}</div>;
}

// Client components only when needed
'use client';
function InteractiveButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick}>Click</button>;
}
```

### API Route Handlers
```typescript
export async function GET(request: NextRequest) {
  const schema = z.object({ limit: z.coerce.number().default(10) });
  const params = schema.parse(Object.fromEntries(request.nextUrl.searchParams));

  const result = await getUsers(params);
  return NextResponse.json(result);
}
```

### Database Queries
```typescript
// Use Drizzle queries, not raw SQL
const users = await db.select().from(usersTable).where(eq(usersTable.active, true));
```

## Commands
- `pnpm dev` — Start dev server
- `pnpm test` — Run vitest
- `pnpm test:e2e` — Run Playwright
- `pnpm lint` — ESLint + Prettier check
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm build` — Build for production

## Common Pitfalls
1. Jangan pake `useEffect` untuk data fetching — use server component atau React Query
2. Jangan import dari `@/server/*` di client component
3. Jangan skip error boundaries — wrap new pages with `<ErrorBoundary>`
4. Jangan hardcode environment variables — always use `env.ts` schema
```

---

## 4. SOUL.md — Codex Specific (Cursor)

SOUL.md digunakan oleh Codex di Cursor editor. Fokus pada "soul" project — konteks, constraints, goals.

### Template

```markdown

---

# SOUL.md — Project Context for Codex

## Project Soul
Ini adalah platform manajemen task real-time untuk tim kecil.
Prioritas: kecepatan, UX yang intuitif, dan data consistency.

## Constraints
- **Mobile-first**: All pages must work on 320px+ screens
- **Offline resilience**: Critical operations must queue and retry
- **SSR preferred**: Minimize client JS for SEO and performance
- **GDPR compliance**: User data deletion must cascade to all services
- **Budget**: Free tier PostgreSQL, so queries must be optimized

## Goals
1. **Q1:** Ship MVP with core CRUD + real-time collaboration
2. **Q2:** Add file attachments + search
3. **Q3:** Add integrations (Slack, Discord webhooks)
4. **Q4:** Public API + rate limiting

## Non-Goals
- No native mobile app (PWA is enough)
- No custom auth (NextAuth covers it)
- No real-time sync from 3rd party (polling is fine)

## Architecture Invariants
- Server components are default — client components are explicit opt-in
- All data access through `src/lib/data-access/*` — no direct DB calls in route handlers
- UI components in `src/components/ui/*` are pure — no data fetching
- Business logic in `src/lib/services/*` — testable without HTTP

## References
- Design system: Figma link
- API spec: OpenAPI link
- Database schema: db/schema.ts
```

---

## 5. Perbedaan & Strategi Penggunaan

### Kapan Pake Yang Mana?

| Skenario | File | Alasan |
|----------|------|--------|
| Claude Code CLI | `CLAUDE.md` | Claude Code otomatis baca ini |
| Cursor AI | `SOUL.md` | Codex di Cursor pake SOUL.md |
| GitHub Copilot Chat | `AGENTS.md` + `.github/copilot-instructions.md` | Copilot baca instructions |
| Multiple AI tools | All three | Tiap file serve different AI |
| Open source project | `AGENTS.md` | Universal, tool-agnostic |

### Overlap & Merge Strategy

Ada overlap besar antara ketiga file:

```yaml
Overlap areas:
  - Tech stack: ada di semua file → referensi aja
  - Repo structure: ada di semua file → referensi aja
  - Coding style: AGENTS.md (umum) vs CLAUDE.md (detail)

Strategy:
  - AGENTS.md: high-level overview buat human & AI
  - CLAUDE.md: detail teknis buat Claude Code
  - SOUL.md: philosophy & constraints buat Codex
```

### Recommended Setup

```
project-root/
├── AGENTS.md              # Universal context (human + AI)
├── CLAUDE.md              # Claude Code specific
├── SOUL.md                # Codex/Cursor specific
├── .github/
│   └── copilot-instructions.md  # GitHub Copilot
├── .cursorrules           # Cursor rules (next session)
└── .windsurfrules         # Windsurf rules (next session)
```

---

## 6. Template per Stack

### Node/Express

```markdown

---

# AGENTS.md — Express API

## Tech Stack
- **Runtime:** Node.js 22
- **Framework:** Express.js 4.x
- **Language:** JavaScript (ES2024)
- **Database:** PostgreSQL + Knex.js
- **Auth:** JWT + Passport.js
- **Testing:** Jest + Supertest
- **Validation:** Joi
- **Logging:** Pino

## Conventions
- Route handlers in `src/routes/*.js`
- Controllers in `src/controllers/*.js`
- Middleware in `src/middleware/*.js`
- Error handling: centralized `errorHandler` middleware
- Response format: `{ success: boolean, data?: any, error?: string }`
```

### React/Next.js

```markdown

---

# AGENTS.md — Next.js Project

## Tech Stack
- **Framework:** Next.js 15 App Router
- **Language:** TypeScript 5.x (strict)
- **UI:** Tailwind CSS v4 + shadcn/ui
- **State:** Server Components + React Query
- **Database:** Prisma ORM + PostgreSQL
- **Auth:** Clerk
- **Testing:** Vitest + Testing Library + Playwright

## Conventions
- `page.tsx` — server component by default
- `layout.tsx` — shared layout
- `loading.tsx` — Suspense boundary
- `error.tsx` — Error boundary
- API routes in `src/app/api/*`
```

### Mastra AI

```markdown

---

# AGENTS.md — Mastra AI Project

## Tech Stack
- **Framework:** Mastra AI
- **Runtime:** Node.js 22 + TypeScript
- **Agents:** src/agents/*.ts
- **Tools:** src/tools/*.ts
- **Workflows:** src/workflows/*.ts
- **Memory:** PostgreSQL + pgvector
- **LLM:** OpenAI GPT-4o / Claude 3.5 Sonnet

## Conventions
- Each agent is a class extending `Agent`
- Tools are standalone functions with Zod schemas
- Workflows use `step()` pattern
- RAG pipelines in `src/pipelines/*.ts`
```

### Docker/K8s

```markdown

---

# AGENTS.md — Docker + Kubernetes Project

## Tech Stack
- **Container:** Docker + Docker Compose
- **Orchestration:** Kubernetes (k3s local)
- **Infrastructure as Code:** Terraform
- **CI/CD:** GitHub Actions + ArgoCD
- **Monitoring:** Prometheus + Grafana
- **Logging:** Loki + Promtail

## Conventions
- Multi-stage Docker builds
- Docker Compose for local dev with hot-reload
- K8s manifests in `k8s/overlays/` (Kustomize)
- Helm charts for production deployments
- Health checks wajib di semua service
```

---

## 7. Latihan: Bikin AGENTS.md + CLAUDE.md untuk Express Project

### Scenario
Buat context files untuk Express API project task management dari sesi sebelumnya.

### Steps

1. **Bikin AGENTS.md**: Include project desc, repo structure, tech stack, env setup, conventions, common tasks
2. **Bikin CLAUDE.md**: Include coding style, test strategy, preferred patterns, commands, common pitfalls
3. **Bikin SOUL.md**: Include project soul, constraints, goals, architecture invariants
4. **Review**: Minta AI review ketiga file, identifikasi redundansi

### Deliverable

File di `labs/express-api/`:

- `AGENTS.md`
- `CLAUDE.md`
- `SOUL.md`
- `context-review.md` — Analisis overlap & saran merge

---

## Key Takeaways

- **AGENTS.md** — universal context untuk semua AI agents dan human
- **CLAUDE.md** — spesifik Claude Code, detail coding style & patterns
- **SOUL.md** — spesifik Codex/Cursor, filosofi & constraints project
- Tiap file punya target AI berbeda, tapi ada overlap yang bisa di-merge
- Context files drastically improve AI output quality dan consistency
- Template per stack bikin onboarding AI agents lebih cepat
