# AI-Assisted Documentation & Spec Generation — Latihan

## Level 1: Dasar

### 1. Tech Spec — Generate dari PRD dengan AI
**Pertanyaan:** Generate technical specification dari Product Requirements Document (PRD):

```markdown
# === LENGKAPI: PRD → Tech Spec ===

## PRD (Input)
**Fitur:** User Registration dengan Email Verification
**Deskripsi:** User bisa daftar dengan email, terima email verifikasi, baru bisa login.
**Acceptance Criteria:**
1. User submit form registrasi (email, password, name)
2. System kirim email verifikasi
3. User klik link di email → email terverifikasi
4. User bisa login setelah verifikasi
5. Kalau email sudah terdaftar → tampilkan error

## Tech Spec (Output — === LENGKAPI ===)

### Architecture
<!-- Diagram urutan: Frontend → API → Email Service → Database -->
<!-- === LENGKAPI: Sequence diagram atau component diagram === -->

### Database Schema
```sql
-- === LENGKAPI: Design database schema ===
-- Table: users
-- Fields: id, email, password_hash, name, email_verified (boolean), verification_token, token_expires_at, created_at, updated_at
```

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register user baru |
| ? | ? | Verifikasi email |
| ? | ? | Login setelah verifikasi |

### Flow
```
1. POST /api/auth/register
   - Input: { email, password, name }
   - Validasi: email format, password min 8, name min 2
   - Hash password (bcrypt cost 12)
   - Generate verification token (crypto.randomUUID)
   - Save user ke DB (email_verified = false)
   - Send verification email
   - Return: { message: "Cek email untuk verifikasi" }

2. GET /api/auth/verify?token=xxx
   <!-- === LENGKAPI: Lengkapi flow === -->
```

### Error Handling
<!-- === LENGKAPI: List error scenarios === -->
```

1. Lengkapi tech spec dari PRD
2. Generate sequence diagram (text-based atau Mermaid)
3. Include ADR (Architecture Decision Record) untuk 3 keputusan arsitektur

**Hint:** Tech spec komponen: (1) Overview & goals, (2) Architecture diagram, (3) Data model, (4) API spec, (5) Flow details, (6) Error handling, (7) Security considerations, (8) Testing strategy. ADR format: Title, Context, Decision, Consequences. Mermaid: ```mermaid sequenceDiagram ... ```. AI prompt: "Generate tech spec from this PRD, include API endpoints, database schema, and flow diagram."

---

### 2. README — Project Documentation Generator
**Pertanyaan:** Generate README.md komprehensif untuk project:

```markdown
# === LENGKAPI: Generate README.md dari codebase ===

## Informasi Project
- Nama: ?
- Tech Stack: ?
- Deskripsi: ?
- Struktur Folder: ?

## README Sections (lengkapi semua):
```markdown
# Project Name

## 📋 Deskripsi
<!-- === LENGKAPI: Generate deskripsi dari package.json dan codebase === -->

## 🚀 Fitur
<!-- === LENGKAPI: Extract dari route definitions === -->

## 🛠️ Tech Stack
<!-- === LENGKAPI: Extract dari package.json dependencies === -->

## 📁 Struktur Folder
```
src/
├── controllers/    # Route handlers
├── services/       # Business logic
├── middleware/     # Express middleware
├── models/        # Database models
├── validations/   # Zod schemas
├── config/        # Configuration
└── utils/         # Helper functions
```

## ⚡ Installation
```bash
# === LENGKAPI: Generate dari package.json scripts ===
```

## 🔧 Environment Variables
<!-- === LENGKAPI: Extract dari .env.example atau config files === -->

## 📚 API Documentation
<!-- === LENGKAPI: Generate dari route definitions === -->

## 🧪 Testing
<!-- === LENGKAPI: Extract dari test configuration === -->

## 🚢 Deployment
<!-- === LENGKAPI: Generate dari Dockerfile atau deploy config === -->
```

1. Generate README dari codebase yang sudah ada
2. Ekstrak informasi dari package.json, route files, config files
3. Buat AI prompt template untuk auto-generate README dari project baru

**Hint:** README sections: (1) Project name + badge, (2) Description, (3) Features, (4) Tech stack, (5) Installation, (6) Usage, (7) API docs, (8) Environment variables, (9) Testing, (10) Deployment, (11) Contributing, (12) License. AI: prompt bisa include file list + content snippets. Badge: shields.io untuk build status, coverage, license. API docs: bisa dari JSDoc/TSDoc comments.

---

### 3. AGENTS.md — Context File untuk AI Agents
**Pertanyaan:** Buat AGENTS.md yang memberikan konteks lengkap ke AI coding agents:

```markdown
# === LENGKAPI: AGENTS.md ===

# AGENTS.md — Project Context for AI Agents

## Project Overview
<!-- === LENGKAPI: Deskripsi project, tech stack, architecture === -->

## Code Style & Conventions
### TypeScript
- Strict mode: enabled
- Naming: camelCase untuk variables/functions, PascalCase untuk types/interfaces
- === LENGKAPI: Tambah rules spesifik ===

### React/Next.js
- Component structure: ?
- State management: ?
- Styling approach: ?

### Express.js
- Route structure: ?
- Error handling pattern: ?
- Validation: Zod schemas di folder `validations/`

## Database
- ORM: Prisma
- Migration: ?
- Naming convention: ?

## Architecture Decisions
<!-- === LENGKAPI: Key ADRs === -->
1. Why Prisma? → ?
2. Why Zod? → ?
3. Why Docker? → ?

## Common Patterns
### API Response Format
```typescript
// === LENGKAPI: Response format yang konsisten ===
{ success: boolean, data?: T, error?: { code: string, message: string } }
```

### Error Handling
<!-- === LENGKAPI: Error handling pattern === -->

## Testing Conventions
- Framework: Vitest
- Pattern: ?
- Coverage target: ?

## Important Files & Paths
| File | Purpose |
|------|---------|
| src/config/env.ts | Environment validation |
| src/middleware/auth.ts | JWT authentication |
| src/middleware/errorHandler.ts | Global error handler |
<!-- === LENGKAPI: Tambah 5 file penting lainnya === -->
```

1. Buat AGENTS.md yang komprehensif
2. Cover: code style, architecture, patterns, file structure
3. Pastikan AI bisa langsung produktif setelah membaca AGENTS.md

**Hint:** AGENTS.md = context file untuk AI coding agents. Isinya: project overview, tech stack, code conventions, architecture decisions, file structure, common patterns, testing strategy, deployment. Tujuan: AI bisa generate kode yang konsisten dengan existing codebase tanpa perlu belajar dari nol. Similar files: CLAUDE.md (Claude Code), SOUL.md (alternative). Update: tambahkan setiap kali ada architectural decision baru.

---

## Level 2: Intermediate

### 4. .cursorrules — IDE Configuration untuk AI
**Pertanyaan:** Buat .cursorrules untuk mengontrol behavior AI di Cursor IDE:

```markdown
# === LENGKAPI: .cursorrules ===

# Cursor AI Rules — Project Configuration

## AI Behavior
You are a senior fullstack developer specializing in TypeScript, React, Next.js, Node.js, Prisma, and PostgreSQL.

## Code Generation Rules
1. Always use TypeScript with strict mode
2. Use functional components with hooks (no classes)
3. === LENGKAPI: Tambah 5 rules spesifik ===
4. 
5. 
6. 
7. 

## Response Format
- Provide complete code (not "rest of the code is same as above")
- Include error handling in every function
- Include JSDoc comments for public APIs

## Imports
- Use import type for type-only imports
- Group imports: (1) external, (2) internal, (3) types
- === LENGKAPI: Contoh format imports ===

## Testing
- Every function should have corresponding test
- Test pattern: describe/it
- Coverage target: 80%+

## What NOT to do
- Don't use `any` type (use `unknown` if necessary)
- Don't ignore errors with empty catch blocks
- Don't use magic numbers or strings
- === LENGKAPI: Tambah 3 larangan ===
```

```markdown
# === LENGKAPI: copilot-instructions.md ===
# Untuk GitHub Copilot — instructions serupa tapi format berbeda
<!-- === LENGKAPI: === -->
```

1. Buat .cursorrules untuk project TypeScript/Next.js
2. Buat copilot-instructions.md untuk GitHub Copilot
3. Test: generate kode dengan Cursor → harus ikut rules

**Hint:** .cursorrules: file di root project yang mengontrol bagaimana Cursor AI behave. Format: markdown dengan instruksi untuk AI. Rules categories: (1) Role & expertise, (2) Code style & conventions, (3) Architecture patterns, (4) Imports & organization, (5) Testing requirements, (6) What NOT to do. Copilot instructions: `copilot-instructions.md` atau `.github/copilot-instructions.md`. Content mirip tapi format beda. Rules harus spesifik dan actionable.

---

### 5. OpenAPI Spec — Auto-generate dari Kode
**Pertanyaan:** Generate OpenAPI/Swagger spec dari kode yang sudah ada:

```typescript
// === LENGKAPI: Generate OpenAPI spec dari kode ===

// Input: Express route handlers dengan JSDoc
/**
 * Register new user
 * @route POST /api/auth/register
 * @param {string} email.body.required - User email
 * @param {string} password.body.required - User password (min 8 chars)
 * @param {string} name.body.required - User full name
 * @returns {object} 201 - User created successfully
 * @returns {Error} 400 - Validation error
 * @returns {Error} 409 - Email already exists
 */
router.post('/auth/register', validate(registerSchema), async (req, res) => {
  // ...
});

// === LENGKAPI: OpenAPI 3.0 YAML output ===
openapi: "3.0.0"
info:
  title: "E-Commerce API"
  version: "1.0.0"
  description: "API untuk aplikasi e-commerce"

paths:
  /api/auth/register:
    post:
      summary: "Register new user"
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                name:
                  type: string
                  minLength: 2
      responses:
        '201':
          description: "User created successfully"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/ValidationError'
        '409':
          $ref: '#/components/responses/ConflictError'
  
  # === LENGKAPI: Tambah endpoint lain ===
  /api/auth/login:
    post:
      # === LENGKAPI: Generate spec ===
  
  /api/products:
    get:
      # === LENGKAPI: Generate spec ===
```

1. Generate OpenAPI spec dari route definitions
2. Setup Swagger UI untuk visualisasi
3. Implementasi auto-sync: update spec saat kode berubah

**Hint:** OpenAPI/Swagger: standard untuk mendokumentasikan REST API. Tools: `swagger-autogen` (auto-generate dari JSDoc), `@asteasolutions/zod-to-openapi` (dari Zod schemas). Setup: `swagger-ui-express` untuk serve UI. Auto-sync: run swagger-autogen di prebuild script. Components: reuse schema definitions untuk DRY. Response examples: tambah contoh response untuk tiap status code.

---

### 6. ADR — Architecture Decision Records dengan AI
**Pertanyaan:** Buat ADR untuk keputusan arsitektur dengan bantuan AI:

```markdown
# === LENGKAPI: ADR template ===

# ADR-001: Database Selection

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
<!-- === LENGKAPI: Deskripsi masalah dan konteks === -->
Kami perlu memilih database untuk aplikasi e-commerce dengan:
- 100K products
- 1M users
- High write volume untuk orders
- Full-text search untuk product catalog
- Relasi kompleks (product → category → supplier)

## Decision
<!-- === LENGKAPI: Keputusan yang diambil === -->
Kami akan menggunakan PostgreSQL sebagai primary database dan Redis untuk caching.

## Options Considered

### Option 1: PostgreSQL
- Pros: ACID compliance, strong relational support, JSONB untuk flexible schema, full-text search
- Cons: Vertical scaling, complex sharding
- === LENGKAPI: Tambah pros/cons ===

### Option 2: MongoDB
- Pros: ?
- Cons: ?

### Option 3: PlanetScale (MySQL-compatible)
- Pros: ?
- Cons: ?

## Rationale
<!-- === LENGKAPI: Kenapa milih opsi ini === -->

## Consequences
<!-- === LENGKAPI: Dampak dari keputusan ini === -->
- Positive: ACID transaction untuk orders, rich query untuk reporting
- Negative: Perlu belajar full-text search PostgreSQL
- Migration: ?

## Related ADRs
- ADR-002: Caching Strategy
```

1. Buat 3 ADR untuk project e-commerce
2. Gunakan AI untuk generate pros/cons setiap opsi
3. Dokumentasikan consequences dan migration plan

**Hint:** ADR format: Title, Status, Context, Decision, Options Considered, Rationale, Consequences, Related ADRs. ADR harus: (1) jelas konteksnya, (2) pertimbangkan multiple options, (3) berikan rationale kenapa pilih opsi tertentu, (4) sebutkan consequences. ADR bukan dokumen sekali jadi — update status kalau keputusan berubah. Tools: `adr-tools` CLI, atau simpan di folder `docs/adr/`.

---

### 7. Changelog & Release Notes — Auto-generate
**Pertanyaan:** Setup auto-generate changelog dari conventional commits:

```markdown
# === LENGKAPI: Generate changelog dari git log ===

# Input: git log dengan conventional commits
```
git log --oneline --pretty="%s" v1.0.0..HEAD
feat(auth): add Google OAuth login
feat(api): add product search endpoint
fix(cart): fix quantity update bug
fix(payment): handle timeout error
docs(api): update OpenAPI spec
refactor(utils): extract date formatter
chore(deps): update express to 4.19
test(api): add integration tests for auth
```

# Output: CHANGELOG.md
<!-- === LENGKAPI: Generate changelog terstruktur === -->

# Changelog

## [1.1.0] - 2024-01-15

### Added
- Google OAuth login (feat)
- Product search endpoint (feat)

### Fixed
- Cart quantity update bug (fix)
- Payment timeout handling (fix)

### Changed
- Extracted date formatter utility (refactor)
- Updated Express to 4.19 (chore)

### Documentation
- Updated OpenAPI spec (docs)

### Testing
- Added auth integration tests (test)
```

```bash
# === LENGKAPI: Script auto-changelog ===
#!/bin/bash
# Auto-generate changelog dari git tags + conventional commits
# === LENGKAPI: Script untuk generate changelog ===
```

1. Setup auto-changelog generator
2. Generate release notes dari changelog
3. Integrasikan dengan GitHub Releases (auto-publish saat tag)

**Hint:** Conventional Commits → Changelog: feat → Added, fix → Fixed, refactor → Changed, docs → Documentation, test → Testing, chore → Maintenance. Tools: `standard-version`, `semantic-release`, `auto-changelog`. Auto-publish: GitHub Action trigger on tag push → generate release notes → publish to GitHub Releases. Format: keepachangelog.com format.

---

### 8. Doc-as-Code — Auto-update Documentation
**Pertanyaan:** Setup sistem documentation-as-code yang auto-update:

```yaml
# === LENGKAPI: GitHub Action untuk auto-docs ===
# .github/workflows/auto-docs.yml
name: Auto Documentation

on:
  push:
    branches: [main]
    paths:
      - 'src/**/*.ts'
      - 'prisma/schema.prisma'
      - 'package.json'

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # === LENGKAPI: ===
      # 1. Setup Node.js
      # 2. Install dependencies
      # 3. Generate TypeScript docs (TypeDoc)
      # 4. Generate OpenAPI spec
      # 5. Update README (API endpoints, tech stack)
      # 6. Update AGENTS.md
      # 7. Commit changes (kalau ada perubahan)
      
      - name: Generate TypeDoc
        run: npx typedoc --out docs/api src/
      
      - name: Generate OpenAPI
        run: npx swagger-autogen
      
      - name: Update README
        run: |
          # === LENGKAPI: Script untuk auto-update README ===
      
      - name: Commit changes
        # === LENGKAPI: Commit auto-generated docs ===
```

```typescript
// === LENGKAPI: Pre-commit hook untuk docs ===
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky"

# === LENGKAPI: ===
# 1. Check apa ada file source yang berubah
# 2. Kalau ada: generate docs
# 3. Stage file docs yang berubah
# 4. Lanjut commit
```

1. Setup auto-docs pipeline di GitHub Actions
2. Integrasikan pre-commit hook untuk generate docs
3. Test: ubah 1 route → docs auto-update → commit

**Hint:** Doc-as-Code: dokumentasi diperlakukan seperti kode — version controlled, auto-generated, reviewed di PR. Tools: TypeDoc (TypeScript), JSDoc (JavaScript), Swagger Autogen (API docs), `readme-md-generator` (README). CI pipeline: trigger on push to main, only regenerate docs when source files change. Pre-commit: husky hook untuk regenerate docs sebelum commit. Commit message: `docs: auto-update API documentation`.
