---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — AI-Assisted Documentation & Spec Generation"
footer: "Sesi 04: Rules Files"
---

<!-- _class: title -->
# Session 04: Rules Files for AI-Assisted Coding

**Duration:** 60 minutes  
**Objective:** Configure .cursorrules, .windsurfrules, copilot-instructions, and VS Code settings for AI-assisted coding.

---

## 1. What Are Rules Files?

Rules files adalah konfigurasi yang ngontrol behavior AI coding tools di IDE/editor. Mereka define coding style, naming conventions, test patterns, import order, error handling patterns — semua yang AI perlu tau biar generate code yang sesuai dengan project.

### Kenapa Rules Files?

- **Tanpa rules**: AI generate code dengan gaya random
- **Dengan rules**: AI generate code yang match project convention
- **Scalable**: Sekali setup, semua developer di team dapat benefit

### File-File Rules

| File | Tool | Location |
|------|------|----------|
| `.cursorrules` | Cursor IDE | Root project |
| `.windsurfrules` | Windsurf IDE | Root project |
| `.github/copilot-instructions.md` | GitHub Copilot | `.github/` |
| `.vscode/settings.json` | VS Code | `.vscode/` |

---

## 2. .cursorrules

Cursor IDE membaca `.cursorrules` untuk guide AI behavior.

### Format

```
You are an expert in [tech stack].

Key instructions:
- [rule 1]
- [rule 2]
- [rule 3]

Code style:
- [style rule 1]
- [style rule 2]
- [style rule 3]

Testing:
- [test rule 1]
- [test rule 2]

Project-specific:
- [project rule 1]
- [project rule 2]
```

### Example: TypeScript Next.js Project

```
You are an expert in TypeScript, Next.js 15 (App Router), React 19, Tailwind CSS v4, and PostgreSQL.

Key instructions:
- Write concise, type-safe TypeScript code
- Prefer server components over client components
- Use 'use client' directive only for interactive components
- Always use Zod for input validation
- Use Drizzle ORM for database queries, never raw SQL
- Follow Next.js App Router conventions

Code style:
- PascalCase for components and types
- camelCase for functions, variables, and files
- Single quotes for strings
- No semicolons (Prettier default)
- 2-space indentation
- Sort imports: external → internal → types
- Use named exports, no default exports (except for pages)

Error handling:
- Use Result pattern (neverthrow lib) for business logic
- Use AppError class for known error types
- Let error boundary handle unexpected errors
- Centralized error handling in middleware

Testing:
- Vitest for unit and integration tests
- Playwright for E2E tests
- Co-locate test files with source files
- Test business logic, not implementation details
- Mock external services with msw

Naming:
- Components: UserProfile.tsx, NotificationsList.tsx
- Pages: page.tsx, layout.tsx, loading.tsx, error.tsx
- API routes: route.ts inside app/api/[route]/
- Utilities: formatDate.ts, validateEmail.ts
- Types: types/user.ts, types/api.ts

Project-specific:
- Database migrations go in db/migrations/
- Environment variables validated in src/lib/env.ts
- API responses format: { success: boolean, data?: T, error?: string }
- All user-facing text must support i18n (next-intl)
- Console.log is forbidden — use logger from src/lib/logger.ts
```

### Example: Express API Project

```
You are an expert in Node.js 22, Express.js, PostgreSQL, and REST API design.

Key instructions:
- Write clean, modular JavaScript (ES2024)
- Use ES modules (import/export), not CommonJS
- Always validate request data with Joi schemas
- Implement proper error handling middleware
- Use async/await for all asynchronous operations

Code style:
- camelCase for functions and variables
- PascalCase for classes and constructor functions
- Semicolons required
- 2-space indentation
- Arrow functions preferred over function declarations
- Early returns for guard clauses

Project structure:
- routes/ → route definitions only (thin)
- controllers/ → request handling logic
- services/ → business logic
- middleware/ → Express middleware
- models/ → database models (Knex)
- validators/ → Joi schemas
- utils/ → helper functions

Error handling:
- Centralized errorHandler middleware in app.js
- Custom AppError class with statusCode and code
- All async routes wrapped in asyncHandler
- Never expose stack traces in production

API conventions:
- RESTful endpoints (plural nouns: /users, /tasks)
- Version prefix: /api/v1/
- Standard response format: { success: boolean, data?: any, error?: string }
- Pagination: ?page=1&limit=20 → { data, pagination: { page, limit, total, pages } }
- HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

Testing:
- Jest + Supertest for integration tests
- Test files: *.test.js co-located or in __tests__/
- Each endpoint test covers: success case, validation error, auth error, not found
- Mock database with test containers or in-memory SQLite
```

---

## 3. .windsurfrules

Windsurf (Codeium) menggunakan `.windsurfrules` — mirip cursor rules tapi dengan format sedikit berbeda.

### Format

```yaml

---

# .windsurfrules
rules:
  - description: "Use TypeScript strict mode"
    pattern: "*.ts"
    rule: "Always enable strict mode in tsconfig.json. No 'any' type."

  - description: "Component naming"
    pattern: "src/components/**/*.tsx"
    rule: "Use PascalCase for component file names and export names."

  - description: "API route pattern"
    pattern: "src/app/api/**/route.ts"
    rule: "Each route file exports GET, POST, PUT, DELETE handlers. Validate input with Zod."

  - description: "Import order"
    pattern: "*.{ts,tsx}"
    rule: "Group: 1) external packages 2) internal modules (@/) 3) types. Sort alphabetically."

  - description: "No console.log"
    pattern: "*.{ts,tsx}"
    rule: "Use the project's logger instead of console.log. Console.log fails CI lint check."

  - description: "Error boundary"
    pattern: "src/app/**/page.tsx"
    rule: "Wrap new pages with <ErrorBoundary>. Export error.tsx for each route segment."
```

### Windsurf vs Cursor Rules

| Aspect | .cursorrules | .windsurfrules |
|--------|-------------|----------------|
| Format | Free text / Markdown | YAML with pattern matching |
| Scoping | Global per file | Per-file-pattern rules |
| Rule granularity | Top-down instructions | Per-glob pattern rules |
| Complexity | Simpler, more narrative | Structured, scoped |

---

## 4. .github/copilot-instructions.md

GitHub Copilot membaca file ini untuk instructions saat generate code atau chat.

### Format

```markdown

---

# Copilot Instructions

## Language & Framework
- Language: TypeScript 5.x (strict mode)
- Framework: Next.js 15 (App Router)
- Database: PostgreSQL + Drizzle ORM
- UI: Tailwind CSS v4 + shadcn/ui

## Code Style
- Use TypeScript strict mode with proper type annotations
- Prefer `const` over `let`. Avoid `var`.
- Use template literals over string concatenation
- Destructure objects and arrays when accessing multiple properties
- Use `Array.prototype` methods (.map, .filter, .reduce) over imperative loops

## Naming Conventions
- PascalCase: Components, Types, Interfaces, Classes
- camelCase: Functions, Variables, Methods, Files
- UPPER_CASE: Constants (environment variables, configuration values)
- kebab-case: Directories, CSS classes

## File Organization
- One component per file
- Related logic in directories with index.ts barrel exports
- Types co-located or in types/ directory
- Test files co-located: `Component.tsx` → `Component.test.tsx`

## Common Patterns
- React Server Components by default; 'use client' only for interactivity
- Server Actions for form mutations
- Route Groups for layout organization
- Loading UI with loading.tsx (Suspense equivalent)
- Error UI with error.tsx (Error Boundary equivalent)

## Testing
- Write tests for all new features
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names ("should ... when ...")
- Mock network requests with msw

## Documentation
- Add JSDoc comments for public functions and APIs
- Include @example tags for complex usage
- Document breaking changes in PR descriptions
```

---

## 5. .vscode/settings.json

VS Code settings bisa include AI-prompt configurations.

### AI Settings in settings.json

```json
{
  // GitHub Copilot
  "github.copilot.enable": {
    "*": true,
    "plaintext": false,
    "markdown": false,
    "yaml": true
  },
  "github.copilot.inlineSuggest.enable": true,
  "github.copilot.chat.localeOverride": "en",

  // Cursor settings (if using Cursor)
  "cursor.ai.enable": true,
  "cursor.cpp.enableCompletions": true,

  // General AI settings
  "editor.inlineSuggest.enabled": true,
  "editor.suggest.preview": true,
  "editor.suggest.showStatusBar": true,

  // Formatting
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },

  // TypeScript
  "typescript.preferences.importModuleSpecifier": "shortest",
  "typescript.preferences.quoteStyle": "single",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.tsdk": "node_modules/typescript/lib",

  // Files
  "files.exclude": {
    "**/.git": true,
    "**/.next": true,
    "**/node_modules": true,
    "**/dist": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

---

## 6. Rule Content — Detail Sections

### Coding Style

```
- 2-space indentation
- Single quotes for strings (Prettier)
- No semicolons (default)
- Trailing commas in objects/arrays
- Arrow functions over `function` keyword
- Template literals over string concatenation Example: `Hello ${name}`
- Destructuring: `const { name, age } = user`
- Spread operator: `const newObj = { ...oldObj, updatedField }`
- Optional chaining: `user?.profile?.name`
- Nullish coalescing: `const val = input ?? defaultValue`
```

### Naming Convention

```
TypeScript/JavaScript:
- PascalCase: Components, Types, Interfaces, Enums, Classes
- camelCase: Functions, Variables, Methods, Parameters
- UPPER_SNAKE_CASE: Constants, Env vars, Configuration
- Private fields prefix: `_privateField`

Files:
- Components: PascalCase (UserCard.tsx)
- Hooks: camelCase with 'use' prefix (useAuth.ts)
- Utilities: camelCase (formatDate.ts)
- Pages: page.tsx, layout.tsx, loading.tsx, error.tsx
- Tests: *.test.ts, *.spec.ts (co-located)
```

### Test Pattern

```
Structure:
- Unit tests: Vitest, co-located *.test.ts
- Integration tests: Supertest, co-located *.test.ts
- E2E tests: Playwright, in e2e/ directory

Pattern (AAA):
- Arrange: Setup data, mocks, spies
- Act: Execute function/method
- Assert: Verify expected outcome

Naming:
- describe('ComponentName') for grouping
- it('should x when y') for test cases

Coverage:
- Test success paths
- Test error/edge cases
- Test boundary conditions
- Mock external dependencies
```

### Import Order

```
Group order (separated by blank line):
1. Node built-ins: fs, path, os
2. External packages: react, express, zod
3. Internal modules: @/components/..., @/lib/...
4. Relative imports: ./utils, ../types
5. Types: import type { X } from '...'

Within each group: alphabetical
No default imports (except for React, express)
Barrel imports via index.ts for directories
```

### Error Handling Pattern

```
Application errors:
- Custom AppError class with: message, statusCode, code, details
- Business logic returns Result<T, E> (neverthrow)
- Controllers catch errors and pass to errorHandler middleware
- errorHandler middleware sends consistent error response

API errors format:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email format is invalid",
    "details": [{ "field": "email", "message": "Invalid format" }]
  }
}

Known vs unknown:
- Known errors: AppError with specific code
- Unknown errors: 500 Internal Server Error + log full error
- Validation errors: 400 with field-level details
- Auth errors: 401 / 403
- Not found: 404
```

---

## 7. Multi-Rule Strategy

Project complex? Break rules into layers.

### Three-Layer Approach

```
project-root/
├── .cursorrules                    # Global rules (all files)
├── .cursor/rules/
│   ├── framework.react.mdc         # React-specific rules
│   ├── framework.next.mdc          # Next.js-specific rules
│   ├── database.mdc                # Database-specific rules
│   ├── testing.vitest.mdc          # Testing rules
│   └── project-specific.mdc        # Project-specific rules
└── .cursor/rules/
    └── team-wide/                  # Shared across repos
        └── conventions.mdc
```

### Rule Priority

| Level | Scope | Override |
|-------|-------|----------|
| Global `.cursorrules` | All files | Base rules |
| Framework rules (`*.react.mdc`) | React files | Add framework specifics |
| Project-specific rules | Specific to this project | Override generic rules |
| Team-wide rules | Across repos | Lowest priority |

### Multi-Rule Example

**`.cursor/rules/testing.vitest.mdc`**:

```
<rule>
name: Testing with Vitest
description: Rules for writing tests with Vitest and Testing Library
filters:
  - file: "*.test.ts"
  - file: "*.test.tsx"
  - file: "*.spec.ts"

rules:
  - Use describe/it blocks for test structure
  - Prefer screen queries over render destructuring
  - Use userEvent over fireEvent for user interactions
  - Mock API calls with msw, never mock fetch directly
  - Test accessibility with @testing-library/jest-dom
  - Co-locate test files with source files
</rule>
```

**`.cursor/rules/framework.next.mdc`**:

```
<rule>
name: Next.js App Router Conventions
description: Rules for Next.js 15 App Router patterns
filters:
  - file: "src/app/**"
  - glob: "**/page.tsx"
  - glob: "**/layout.tsx"
  - glob: "**/route.ts"

rules:
  - Pages are server components by default
  - Add 'use client' only for interactive components
  - Use generateMetadata for SEO metadata
  - Route handlers export named functions (GET, POST, etc.)
  - Dynamic routes use [param] folder naming
  - Parallel routes use @slot naming convention
</rule>
```

---

## 8. Latihan: Bikin .cursorrules + copilot-instructions untuk Project TypeScript

### Scenario
Buat rules files untuk project TypeScript Express API (task management).

### Steps

1. **Bikin .cursorrules**: Include coding style, naming, test pattern, import order, error handling — semua spesifik TypeScript
2. **Bikin .github/copilot-instructions.md**: Instructions untuk GitHub Copilot
3. **Bikin rule modular**: Buat at least 2 .cursor/rules/*.mdc files (testing + express)
4. **Bikin .windsurfrules**: Convert cursor rules ke format YAML
5. **Bikin .vscode/settings.json**: AI settings + formatter config

### Deliverable

File di `labs/express-api/`:

- `.cursorrules`
- `.github/copilot-instructions.md`
- `.cursor/rules/testing.mdc`
- `.cursor/rules/express-api.mdc`
- `.windsurfrules`
- `.vscode/settings.json`

---

## Key Takeaways

- `.cursorrules` guide Cursor AI with free-text instructions
- `.windsurfrules` pakai YAML format dengan per-file-pattern rules
- `.github/copilot-instructions.md` instructions untuk GitHub Copilot
- `.vscode/settings.json` bisa configure AI behavior + formatting
- Rule content covers: coding style, naming, testing, imports, error handling
- Multi-rule approach: global → framework → project → team-wide
