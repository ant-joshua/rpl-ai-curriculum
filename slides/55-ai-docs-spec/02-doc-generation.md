---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — AI-Assisted Documentation & Spec Generation"
footer: "Sesi 02: Doc Generation"
---

<!-- _class: title -->
# Session 02: Documentation Generation

**Duration:** 90 minutes  
**Objective:** Generate README, API docs, changelog, and auto-update documentation from code changes.

---

## 1. README Generation

README adalah first impression project. AI bisa generate draf awal dari struktur project.

### README Structure

| Section | Description |
|---------|-------------|
| Title + Badge | Nama project, CI status, version, license |
| Description | 1-2 paragraph tentang project |
| Table of Contents | Navigasi untuk README panjang |
| Setup | Prerequisites, install steps, konfigurasi |
| Usage | Contoh penggunaan, CLI commands, screenshots |
| API | Endpoints, request/response (bisa link ke API docs) |
| Architecture | High-level architecture diagram |
| Contributing | Cara kontribusi, code style, PR process |
| License | License information |

### Prompt: Generate README

```
Dari struktur project berikut, generate README.md yang profesional:

Project: [nama project] — [deskripsi singkat]
Stack: [tech stack]
Structure:
[tree output]

Include:
- Setup instructions dengan npm/pnpm/yarn
- Usage examples
- API documentation section (endpoint summary)
- Architecture overview
- Contributing guidelines
- License (MIT)

Gunakan badge untuk: version, license, CI status.
```

## 2. API Documentation

### JSDoc/TSDoc

JSDoc/TSDoc adalah standard untuk dokumentasi kode JavaScript/TypeScript.

```typescript
/**
 * Creates a new user in the system
 *
 * @param email - User email address (must be unique)
 * @param password - User password (min 8 characters)
 * @param role - User role (default: 'user')
 * @returns The created user object
 * @throws {ValidationError} When email format is invalid
 * @throws {DuplicateError} When email already exists
 *
 * @example
 * ```ts
 * const user = await createUser('john@example.com', 'secure123', 'admin');
 * // => { id: 1, email: 'john@example.com', role: 'admin' }
 * ```
 */
async function createUser(
  email: string,
  password: string,
  role?: UserRole
): Promise<User>
```

### TSDoc Tags Reference

| Tag | Usage |
|-----|-------|
| `@param` | Document parameter (name + description + type) |
| `@returns` | Document return value |
| `@throws` | Document error conditions |
| `@example` | Show usage example |
| `@deprecated` | Mark as deprecated with reason |
| `@see` | Link to related code |
| `@typeParam` | Document generic type parameter |

### OpenAPI / Swagger

OpenAPI spec bisa digenerate dari kode atau ditulis manual, lalu AI bantu generate.

```yaml

---

# Petikan generated oleh swagger-jsdoc
paths:
  /users:
    post:
      summary: Create a new user
      tags: [Users]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Validation error
        '409':
          description: Duplicate email
```

### Tools

| Tool | Description | Command |
|------|-------------|---------|
| TypeDoc | Generate HTML docs from TypeScript | `npx typedoc src/index.ts` |
| swagger-jsdoc | Generate OpenAPI spec from JSDoc | `npx swagger-jsdoc -d swagger.js` |
| jsdoc-to-markdown | JSDoc → Markdown | `npx jsdoc2md src/*.js > API.md` |

### AI Enhance Docs

```
Dari kode berikut, generate JSDoc comments untuk tiap fungsi:

[kode tanpa JSDoc]

Format:
- @param untuk setiap parameter
- @returns untuk return value
- @throws untuk error cases
- @example untuk usage example
- Deskripsi dalam Bahasa Indonesia
```

---

## 3. Changelog Generation

Conventional Commits → automated changelog.

### Conventional Commits Format

```
<type>(<scope>): <description>

[body]
[footer]
```

| Type | Release | Changelog Section |
|------|---------|-------------------|
| `feat` | MINOR | Features |
| `fix` | PATCH | Bug Fixes |
| `BREAKING CHANGE` foot | MAJOR | Breaking Changes |
| `docs` | - | Documentation |
| `refactor` | - | Code Refactoring |
| `perf` | - | Performance |
| `test` | - | Tests |
| `chore` | - | Chores |

### Tools

```bash

---

# standard-version
npx standard-version


---

# changelogen (pilihan buat monorepo)
npx changelogen --from=v1.0.0 --to=v2.0.0


---

# git-cliff (Rust, fast)
npx git-cliff -o CHANGELOG.md
```

### AI Generate Changelog

```
Dari git log berikut, generate CHANGELOG.md yang rapi:

[output git log --oneline]

Format:
- Group by type (Features, Bug Fixes, Documentation, etc.)
- Tiap entry ada PR number kalo ada (#123)
- Human-readable descriptions (bukan commit message mentah)
- Versi berdasarkan conventional commits
```

---

## 4. AI Auto-Update Documentation

Siklus: Code change → AI detect → Suggest update → Generate PR.

### Workflow

```
1. Developer commit code change
2. CI/CD atau pre-commit hook trigger AI check
3. AI bandingkan old vs new API surface
4. AI generate suggested doc updates
5. Format sebagai PR atau patch
6. Developer review & merge
```

### Implementation

```yaml

---

# .github/workflows/docs-auto-update.yml
name: Auto-Update Docs
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  docs-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check API changes
        run: |
          # Diff API surface
          git diff origin/main -- src/ > api-diff.txt

      - name: AI Generate Doc Updates
        run: |
          # Kirim diff ke AI → dapatkan suggested doc changes
          ai-cli suggest-docs --diff api-diff.txt

      - name: Create Doc PR
        run: |
          # Auto-create PR dengan doc updates
          gh pr create --title "docs: auto-update from API changes" \
                       --body "AI-generated doc updates" \
                       --base main
```

### Prompt: Detect & Suggest Doc Update

```
Dari diff code berikut, identifikasi API surface changes
dan generate suggested doc updates:

Diff:
[diff output]

Check:
1. Ada endpoint baru? → Generate OpenAPI spec
2. Ada parameter baru? → Update JSDoc/TSDoc
3. Ada field baru di response? → Update response example
4. Ada behavior change? → Update README usage section

Output:
- List perubahan yang terdeteksi
- Code block for each doc update
- PR description yang ready-to-use
```

---

## 5. Latihan: Generate README + API Docs dari Express Code

### Scenario
Kamu punya Express API sederhana untuk task management. Generate dokumentasi lengkap.

### Starter Code

```javascript
// src/routes/tasks.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id });
  res.json(tasks);
});

router.post('/', async (req, res) => {
  const task = await Task.create({
    ...req.body,
    userId: req.user.id
  });
  res.status(201).json(task);
});

router.put('/:id', async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id, userId: req.user.id
  });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.status(204).send();
});
```

### Steps

1. **Generate README**: Prompt AI dengan struktur project & hasil tree
2. **Add JSDoc**: Tambah komentar JSDoc ke tiap endpoint pakai AI
3. **Generate OpenAPI**: Setup swagger-jsdoc, generate spec
4. **Generate Changelog**: Buat 5+ conventional commits, lalu generate changelog
5. **AI Auto-Update Demo**: Simulasi code change + AI suggest doc update

### Deliverable

Folder `labs/express-api/docs/` yang berisi:

- `README.md` — Complete README with setup, usage, API
- `API.md` — API documentation (bisa dari swagger atau jsdoc2md)
- `CHANGELOG.md` — Generated changelog
- `suggested-update.md` — Contoh AI-suggested doc update dari code change

---

## Key Takeaways

- README punya struktur baku yang bisa digenerate AI dari project structure
- JSDoc/TSDoc standard untuk inline code documentation
- OpenAPI spec bisa digenerate dari kode atau JSDoc
- Conventional Commits enable automated changelog generation
- AI auto-update docs detect code changes & suggest updates
