# 🧠 Cheatsheet: Pragmatic Programming

> Referensi cepet — 1 halaman.

## Topik Utama

**Prinsip Clean Code:**
- **DRY** — Don't Repeat Yourself. Extract duplikasi ke function/abstraksi.
- **KISS** — Keep It Simple, Stupid. Jangan over-engineer.
- **YAGNI** — You Ain't Gonna Need It. Jangan tulis kode untuk kebutuhan masa depan yang belum pasti.
- **Boy Scout Rule** — Tinggalkan kode lebih bersih dari sebelumnya.
- **SRP** — Single Responsibility Principle. Satu function/class = satu tanggung jawab.

**Naming Convention:**
- Variable: kata benda, jelas (`userName`, `scores`, `isActive`)
- Function: kata kerja (`fetchUserById`, `calculateTotalPrice`)
- Boolean: prefix `is`/`has`/`can`/`should` (`isVisible`, `hasPermission`)
- Class: PascalCase (`UserController`)
- Constant: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)

**Refactoring Patterns:** Extract function, rename variable, decompose conditional, replace magic number.

**Code Review Checklist:** Functionality, readability, security, performance, testing, naming.

**Estimation:** PERT (Optimistic + 4×Most Likely + Pessimistic / 6), Planning Poker, Reference Task.

## Command / Sintaks Penting

```typescript
// DRY — extract validation
function validateEmail(email: string): void {
  if (!email.includes("@")) throw new Error("Email tidak valid");
}

// Magic numbers → constant
const MAX_RETRY_ATTEMPTS = 3;
const TIMEOUT_MS = 5000;

// SRP — pisah tanggung jawab
function parseInput(raw: string): InputData { /* ... */ }
function validateInput(data: InputData): ValidationResult { /* ... */ }
function processData(data: InputData): Output { /* ... */ }
```

```bash
# ESLint & Prettier
npx eslint src/ --fix
npx prettier --write src/
```

## Tips & Trik

- DRY boleh dilanggar: test code, config/boilerplate, duplikasi kebetulan
- KISS: kalo bisa pake array of objects, jangan bikin class hierarchy
- Naming: `handleClick` > `handler`, `fetchUserData` > `getData`
- Code review: fokus ke logic dulu, style belakangan (bisa auto-format)
- PERT estimation: `(a + 4m + b) / 6` — lebih akurat dari tebak kasar

## Common Mistakes

- **Over-DRY** — bikin abstraksi premature buat 2 baris yang mirip
- **Magic numbers** — `if (x > 86400000)` instead of `if (x > ONE_DAY_MS)`
- **Comment bloat** — ngomongin "what" bukan "why". Kode harus self-documenting
- **Function terlalu panjang** — >20 line biasanya bisa dipecah
- **Ignore ESLint errors** — jangan `// eslint-disable-next-line` tanpa alasan

## Link Cepat

- [Module README](README.md)
- [Quiz](quiz.md)
