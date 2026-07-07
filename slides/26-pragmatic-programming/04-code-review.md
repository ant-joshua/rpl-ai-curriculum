---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/546819/pexels-pho"
footer: "Sesi 04: Code Review"
---

<!-- _class: title -->
# 26.4 Code Review

## Code Review Checklist

### Functional Correctness

- [ ] Apakah kode menyelesaikan requirement yang diminta?
- [ ] Apakah edge cases di-handle (empty, null, invalid input)?
- [ ] Apakah error handling sudah sesuai (try/catch, proper error types)?
- [ ] Apakah perubahan tidak nge-break flow yang existing?

### Code Quality

- [ ] Apakah nama variable/function/class jelas?
- [ ] Apakah tidak ada magic numbers / hardcoded values?
- [ ] Apakah function cukup kecil dan single responsibility?
- [ ] Apakah tidak ada duplikasi kode (DRY)?
- [ ] Apakah kode mengikuti style guide tim (ESLint/Prettier)?

### Maintainability

- [ ] Apakah test menyertakan perubahan? (unit test, integration test)
- [ ] Apakah ada komentar yang menjelaskan "mengapa" bukan "apa"?
- [ ] Apakah perubahan mudah di-revert?
- [ ] Apakah dependensi baru justified? (tidak nambah library untuk hal sederhana)

### Security

- [ ] Apakah input tervalidasi dan tersanitasi? (SQL injection, XSS)
- [ ] Apakah tidak ada credential/token hardcoded?
- [ ] Apakah authorization dicek untuk setiap endpoint?
- [ ] Apakah rate limiting perlu ditambah?

### Performance

- [ ] Apakah tidak ada N+1 query?
- [ ] Apakah loop efisien? (tidak nested loop O(n²) kalau bisa O(n))
- [ ] Apakah resource (file handle, DB connection) di-close dengan benar?

---

## Constructive Feedback

### Sandwich Method

```
+ Positif: "Bagus, validasi inputnya lengkap dan rapi."
- Perbaikan: "Function ini 60 baris, mungkin bisa di-extract jadi 3-4 function kecil."
+ Motivasi: "Overall approachnya solid, minor refactor aja."
```

### Format Feedback Efektif

```typescript
// ❌ Feedback buruk (menyerang orang, terlalu umum, tanpa solusi)
// "Ini kode jelek."
// "Logic-nya salah."
// "Kok gitu sih?"

// ✅ Feedback konstruktif (spesifik, deskriptif, kasih saran)
/*
 * Issue: Function `handlePayment` melakukan 4 hal sekaligus
 * (validasi, kalkulasi, simpan DB, kirim email).
 *
 * Saran: Extract jadi 4 function terpisah sesuai SRP.
 * - validatePayment(order, payment)
 * - calculateNetAmount(payment)
 * - saveTransaction(order, netAmount)
 * - notifyCustomer(order, netAmount)
 *
 * Benefit: lebih mudah di-test, debug, dan reuse.
 */
```

### Contoh Code Review Komentar

```typescript
// REVIEW COMMENT: Nama function kurang deskriptif
// handleData() → bikin bingung. Mungkin → processRefund() ?

// REVIEW COMMENT: Magic number
// if (age > 55) → constant RETIREMENT_AGE = 55

// REVIEW COMMENT: N+1 query
// Ini panggil db.items.findMany() dalam loop. Pake JOIN atau batch query.

// REVIEW QUESTION: Clarify intent
// Apakah `status === 3` itu cancelled? Lebih baik pake enum.
```

---

## Security & Performance Review: Case Studies

### Security: SQL Injection

```typescript
// ❌ RAW STRING CONCATENATION — SQL injection risk
async function getUser(name: string) {
  return db.query(`SELECT * FROM users WHERE name = '${name}'`);
}

// ✅ PARAMETERIZED QUERY
async function getUser(name: string) {
  return db.query(`SELECT * FROM users WHERE name = $1`, [name]);
}
```

### Security: Stored XSS

```typescript
// ❌ Langsung render user input tanpa sanitasi
function renderComment(comment: string): string {
  return `<div>${comment}</div>`;
}

// ✅ Sanitasi / escape HTML
function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function renderComment(comment: string): string {
  return `<div>${sanitizeHtml(comment)}</div>`;
}
```

### Performance: N+1 Query

```typescript
// ❌ N+1 queries — 1 query for orders + N queries for order items
async function getOrdersWithItems(userId: string) {
  const orders = await db.orders.findMany({ where: { userId } });
  for (const order of orders) {
    order.items = await db.items.findMany({ where: { orderId: order.id } });
  }
  return orders;
}

// ✅ Single query with JOIN or batch
async function getOrdersWithItems(userId: string) {
  return db.orders.findMany({
    where: { userId },
    include: { items: true },  // JOIN via Prisma/ORM
  });
}
```

### Performance: Unnecessary Computation

```typescript
// ❌ Hitung ulang tiap render
function getTotalItems(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.qty, 0);
}

// ✅ Cache / memoize kalau data tidak berubah
let cachedTotal: number | null = null;
let lastCartVersion = 0;

function getTotalItems(cart: Cart): number {
  if (cart.version !== lastCartVersion) {
    cachedTotal = cart.items.reduce((sum, item) => sum + item.qty, 0);
    lastCartVersion = cart.version;
  }
  return cachedTotal!;
}
```

---

## PR Description Template

```markdown
## Description
[Explain what this PR does and why]

## Related Ticket
Closes #[ticket-number]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactor
- [ ] Documentation
- [ ] Performance

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Screenshots (if applicable)

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have self-reviewed my own code
- [ ] I have added tests that prove my fix/feature works
- [ ] No new warnings
- [ ] Breaking changes documented

## Additional Notes
[Anything reviewers should know]
```

### Contoh PR Deskripsi Nyata

```
## Description
Refactor `processInvoice()` — extract inline logic into focused
functions per SRP. No behavior change; all existing tests pass.

## Related Ticket
Closes #142 — Payment flow refactoring

## Type of Change
- [x] Refactor

## Checklist
- [x] Code follows style guide
- [x] Self-reviewed
- [x] All tests pass (see CI)
```

---

## Tools: ESLint & Prettier

### Setup ESLint + Prettier untuk TypeScript

```bash
npm init -y
npm install -D typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier
```

```jsonc
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": "warn",
    "prettier/prettier": [
      "error",
      { "semi": true, "singleQuote": false, "tabWidth": 2, "trailingComma": "all" }
    ]
  }
}
```

```jsonc
// .prettierrc
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

### Rules yang Paling Berguna

| Rule | Efek |
|------|------|
| `no-explicit-any` | Larang `any`, paksa pake tipe yang proper |
| `no-unused-vars` | Tangkap variable nganggur |
| `no-console` | Cegah console.log masuk production |
| `no-magic-numbers` | Tangkap magic numbers |
| `max-lines-per-function` | Batasi panjang function |
| `prefer-const` | Paksa pake `const` kalau tidak di-reassign |

### Integrasi Git Hook (Husky)

```bash
npm install -D husky lint-staged

// package.json tambahin:
"lint-staged": {
  "*.ts": ["eslint --fix", "prettier --write"]
}
```

---

## Latihan

1. **Code Review Simulation** — Review PR berikut. Kasih 3 feedback konstruktif (1 positif, 2 improvement):

   ```typescript
   // src/services/user.service.ts
   // PR: Add user registration endpoint
   async function reg(a: any, b: any) {
     if (!a || !b) {
       return 0;
     }
     const x = await db.query(`SELECT * FROM users WHERE email = '${b}'`);
     if (x.length > 0) {
       return "exists";
     }
     const y = await db.query(`INSERT INTO users(name,email) VALUES('${a}','${b}')`);
     sendEmail(b, "Welcome");
     return y;
   }
   ```

2. **Security Review** — Temukan 3 security issues dalam kode berikut dan perbaiki:
   ```typescript
   async function login(req: any, res: any) {
     const { username, password } = req.body;
     const user = await db.query(`SELECT * FROM users WHERE username = '${username}'`);
     if (user[0].password === password) {
       res.send({ token: "secret-token-" + user[0].id });
     }
     res.send({ error: "Login failed" });
   }
   ```

3. **Performance Review** — Temukan performance issue dan refactor:
   ```typescript
   async function getUserDashboard(userId: string) {
     const user = await db.users.findOne({ id: userId });
     const posts = await db.posts.find({ authorId: userId });
     for (const post of posts) {
       post.comments = await db.comments.find({ postId: post.id });
       for (const comment of post.comments) {
         comment.likes = await db.likes.count({ commentId: comment.id });
       }
     }
     return { user, posts };
   }
   ```

4. **PR Description** — Tulis PR description lengkap untuk refactoring function berikut (gunakan template PR di atas):
   ```typescript
   // Before — monolithic
   function handleOrder(o: any) { /* 150 baris: validasi, payment, stock, email, log */ }

   // After — refactored into 5 focused functions
   ```
