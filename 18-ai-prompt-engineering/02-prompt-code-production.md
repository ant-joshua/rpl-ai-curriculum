<img src="https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Code & Production" style="width:100%;border-radius:12px;margin:12px 0;">

# 2. Prompt for Code & Production

> **Durasi:** 2 Jam  
> **Fokus:** Code generation, test generation, API doc generation, error explanation, code review prompts, Mastra templates, prompt versioning, ethical considerations

---

## Code Generation dengan AI

Code generation = minta AI tulis kode berdasarkan deskripsi. Paling berbahaya kalau lo pake tanpa paham.

### Aturan Generate Kode

1. **Minta spesifik** — sebut bahasa, framework, library, pattern
2. **Minta boilerplate doang** — logic bisnis tulis manual
3. **Generate batch kecil** — 1 fungsi per prompt, bukan 1 app
4. **Review setiap baris** — sebelum pake, lo harus paham

```typescript
// ✅ Prompt yang bener — spesifik, terbatas
const prompt = `
Buat Express.js route handler TypeScript untuk GET /api/products.
Gunakan Prisma untuk database.
Return: { success: boolean, data: Product[], message: string }
Handler ini cuma butuh: pagination (page, limit), filter by category.
JANGAN include auth middleware atau logika bisnis lain.
`;

// ❌ Prompt yang salah — vague, minta full app
const prompt = `
Buat aplikasi toko online pake MERN stack.
`;
```

### Contoh Generate Handler

```typescript
// Hasil generate dari prompt di atas
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProducts(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;

    const where = category ? { category } : {};
    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      success: true,
      data: products,
      message: 'Products fetched successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      message: 'Failed to fetch products',
    });
  }
}
```

### Generate Utility Function

```typescript
const prompt = `
Buat fungsi TypeScript untuk format angka ke format Rupiah.
Contoh: 15000 → "Rp15.000", 1000000 → "Rp1.000.000"
Bisa handle: integer, float, null, undefined, string number.
Unit test juga.
`;

// Output AI
export function formatRupiah(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return 'Rp0';

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return 'Rp0';

  return `Rp${Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
```

---

## Unit Test Generation

Test case = area di mana AI excel. Pola input → edge case → output sudah jelas.

### Prompt Template untuk Generate Test

```typescript
const prompt = `
Buat unit test Jest untuk fungsi di bawah.
Cover:
1. Happy path (positive cases)
2. Edge cases (null, empty, boundary)
3. Error cases (invalid input, exception)

Gunakan describe/it pattern. Jangan ubah fungsi asli.

Fungsi yang di-test:
${fungsiString}
`;
```

### Contoh Generate Test

```typescript
// Fungsi
export function calculateDiscount(price: number, tier: string): number {
  const discounts: Record<string, number> = {
    silver: 0.05,
    gold: 0.1,
    platinum: 0.2,
  };

  const discount = discounts[tier] || 0;
  return price - price * discount;
}

// AI-generated test
describe('calculateDiscount', () => {
  it('should apply 5% discount for silver tier', () => {
    expect(calculateDiscount(100000, 'silver')).toBe(95000);
  });

  it('should apply 10% discount for gold tier', () => {
    expect(calculateDiscount(100000, 'gold')).toBe(90000);
  });

  it('should apply 20% discount for platinum tier', () => {
    expect(calculateDiscount(100000, 'platinum')).toBe(80000);
  });

  it('should return same price for unknown tier', () => {
    expect(calculateDiscount(100000, 'bronze')).toBe(100000);
  });

  it('should handle zero price', () => {
    expect(calculateDiscount(0, 'gold')).toBe(0);
  });

  it('should handle decimal price', () => {
    expect(calculateDiscount(99999, 'silver')).toBeCloseTo(94999.05);
  });

  it('should handle large numbers', () => {
    expect(calculateDiscount(1_000_000_000, 'platinum')).toBe(800_000_000);
  });
});
```

### Test Coverage Checklist

| Skenario | Wajib? |
|----------|--------|
| Happy path (input valid) | ✅ |
| Invalid input type | ✅ |
| Null/undefined | ✅ |
| Empty array/string | ✅ |
| Boundary values | ✅ |
| Large numbers | ⚠️ Kalau relevan |
| Concurrent calls | ⚠️ Kalau async |

---

## API Documentation Generation

Minta AI generate JSDoc/TSDoc biar dokumentasi rapi.

```typescript
const prompt = `
Generate TSDoc untuk fungsi di bawah.
Format: @param, @returns, @throws, @example.
Bahasa: Indonesia.

Fungsi:
`;

// Contoh fungsi
async function createOrder(
  userId: string,
  items: Array<{ productId: string; qty: number }>,
  shippingAddress: string
): Promise<{ orderId: string; total: number; estimatedDelivery: Date }> {
  // implementation...
}

// AI-generated TSDoc
/**
 * Membuat pesanan baru untuk user.
 *
 * @param userId - ID user yang memesan
 * @param items - Daftar produk yang dipesan (productId + quantity)
 * @param shippingAddress - Alamat pengiriman lengkap
 * @returns Object berisi orderId, total harga, dan estimasi pengiriman
 * @throws {Error} Jika stok tidak mencukupi
 * @throws {Error} Jika userId tidak ditemukan
 *
 * @example
 * const order = await createOrder(
 *   'user_123',
 *   [{ productId: 'prod_456', qty: 2 }],
 *   'Jl. Merdeka No. 1, Jakarta'
 * );
 * // { orderId: 'ORD-001', total: 50000, estimatedDelivery: Date }
 */
```

---

## Error Explanation

Error explanation = minta AI jelasin error daripada fix langsung.

### Prompt Template Error Explain

```typescript
const prompt = `
Saya dapet error di project Node.js + TypeScript.

Error message:
${errorMessage}

Stack trace:
${stackTrace}

Kode yang relevan:
${relevantCode}

Yang udah saya coba:
- Restart server
- Cek import statement

Tolong:
1. Jelasin kenapa error ini terjadi (dalam bahasa Indonesia)
2. Kasih referensi konsep yang harus saya pelajari
3. JANGAN kasih code fix — saya mau coba sendiri
`;
```

### Error Explain Flow

```
Error muncul
    ↓
Copy error + stack trace + kode relevan
    ↓
Prompt AI minta penjelasan (bukan fix)
    ↓
Paham penyebab → fix manual
    ↓
Kalau mentok → prompt iterasi 2 minta saran
```

---

## Code Review Prompts

Review kode pake AI sebelum commit. Bedanya dengan "bikin kode": review fokus evaluasi, bukan generate.

### Prompt Review by Scope

```typescript
// Security-focused review
const securityReview = `
Review kode ini dari sisi security only.
Cari:
- SQL injection
- XSS
- CSRF
- Hardcoded secrets
- Insecure direct object reference (IDOR)
- Broken authentication

Prioritas: critical > high > medium > low.
`;

// Performance review
const perfReview = `
Review kode ini dari sisi performa.
Cari:
- N+1 query
- Unnecessary loops
- Memory leak potential
- Sync blocking code di async context
- Large payload tanpa pagination
`;

// Code quality review
const qualityReview = `
Review kode ini dari sisi maintainability.
Cari:
- Magic numbers
- Duplicate code
- Function terlalu panjang (>50 line)
- Naming yang misleading
- Missing error handling
- Tight coupling
`;
```

### Contoh Full Code Review Prompt

```typescript
// Kode yang akan di-review
async function getUsers(req: Request, res: Response) {
  const users = await db.query('SELECT * FROM users');
  let html = '<table>';
  for (let u of users) {
    html += `<tr><td>${u.name}</td><td>${u.email}</td></tr>`;
  }
  html += '</table>';
  res.send(html);
}

// Prompt review
const prompt = `
Review kode ini sebagai senior developer.
Konteks: Express.js API, PostgreSQL.

Kode:
${kodeString}

Evaluasi:
1. Security issues (prioritas tertinggi)
2. SQL injection potential
3. XSS potential
4. Performance bottleneck
5. Code smell
6. Best practice violation

Format output:
| Issue | Severity | Line | Explanation |
|-------|----------|------|-------------|
| ... | Critical/High/Medium/Low | 2 | ... |

Jangan kasih fix. Cukup identifikasi.
`;
```

---

## Prompt Templates dengan Mastra

Mastra = framework AI untuk bikin prompt templates terstruktur.

### Kenapa Mastra?

- Prompt versioning built-in
- Template variables ({{variable}})
- Multi-provider support (OpenAI, Anthropic)
- Tool calling integration

### Mastra Prompt Template Example

```typescript
import { Mastra } from '@mastra/core';

const mastra = new Mastra({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define prompt template
const codeReviewPrompt = mastra.prompt({
  name: 'code-review',
  description: 'Review kode untuk security & quality',
  template: `
Kamu adalah senior developer yang melakukan code review.
Konteks proyek: {{projectContext}}
Teknologi: {{techStack}}

Tugas: review kode berikut dengan fokus pada:
1. Security vulnerabilities
2. Performance issues
3. Code quality & maintainability

Kode:
\`\`\`
{{codeContent}}
\`\`\`

Format output:
### Security ({{securityCount}} issues)
- ...

### Performance ({{perfCount}} issues)
- ...

### Quality ({{qualityCount}} issues)
- ...
  `,
});

// Execute template
const review = await mastra.executePrompt('code-review', {
  variables: {
    projectContext: 'Aplikasi POS untuk toko kelontong',
    techStack: 'Next.js 14, Prisma, PostgreSQL',
    codeContent: fs.readFileSync('./src/api/products.ts', 'utf8'),
    securityCount: 3,
    perfCount: 2,
    qualityCount: 3,
  },
});
```

### Prompt Template untuk Code Generation

```typescript
const generateHandlerPrompt = mastra.prompt({
  name: 'generate-api-handler',
  description: 'Generate Express/Next.js API handler',
  template: `
Kamu adalah backend developer expert.
Buat {{method}} handler untuk endpoint {{endpoint}}.

Stack: {{stack}}
Database: {{database}}

Spesifikasi:
- Input: {{inputSchema}}
- Output: {{outputSchema}}
- Auth: {{authRequired}}
- Error handling: {{errorHandling}}

### Constraint:
- {{constraint1}}
- {{constraint2}}
- Generated code only, no explanation
  `,
});
```

---

## Version Control untuk Prompts

Prompt = asset yang butuh versioning sama kayak kode.

### Kenapa Versioning Penting

- **Rollback** — prompt usang gampang balik
- **Audit trail** — tau siapa ngubah apa dan kapan
- **A/B testing** — bandingin prompt lama vs baru
- **Reproducibility** — hasil lama bisa direproduksi

### Strategi Versioning

```
prompts/
├── v1/
│   ├── code-review.md
│   ├── generate-test.md
│   └── error-explain.md
├── v2/
│   ├── code-review.md
│   └── generate-test.md
└── CHANGELOG.md
```

### Prompt Changelog Format

```markdown
# Prompts Changelog

## v2.0.0 - 2025-03-15

### code-review.md
- Added: security severity rating (critical/high/medium/low)
- Changed: output format from prose to markdown table
- Removed: auto-fix suggestion (bikin siswa males)

### generate-test.md
- Added: edge case coverage checklist
- Changed: template variable from {{fnName}} to {{functionCode}}
```

### Integrasi dengan Git

```bash
# Simpan prompt di repo yang sama
project/
├── prompts/
│   └── v1/
│       └── code-review.md
├── src/
└── package.json

# Git tracking
git add prompts/
git commit -m "prompts: update code-review v2 - tambah severity rating"
```

---

## Ethical Considerations dalam Prompt Engineering

### ❌ Jangan

1. **Prompt injection** — jangan nyuruh AI ngelakuin hal ilegal
2. **Generate malware** — AI bisa, tapi lo jangan
3. **Plagiarism** — generate kode orang lain tanpa atribusi
4. **Over-reliance** — minta AI ngerjain semua tanpa belajar
5. **Data privacy** — jangan tempel credential / API key / data user di prompt

### ✅ Lakukan

1. **Review output** — setiap baris kode dari AI harus lo paham
2. **Atribusi** — kalau pake prompt orang lain, sebut sumber
3. **Transparansi** — bilang kalau pake AI, dokumentasi di PROMPT-LOG
4. **Limit scope** — AI buat bantu, bukan ganti otak lo
5. **Data sanitasi** — hapus data sensitif sebelum di-prompt

### Checklist Etis per Prompt

| Pertanyaan | Ya/Tidak |
|------------|----------|
| Apaku prompt ini ngasih value ke skill coding lo? | ☐ |
| Apakah lo paham tiap baris output AI? | ☐ |
| Apakah lo udah hapus data sensitif dari prompt? | ☐ |
| Apakah prompt ini ngerjain tugas yang harusnya lo kerjain? | ☐ |
| Apakah lo akan nyaman kalau prompt ini dipublikasi? | ☐ |

---

## Latihan

### 1. Generate + Test

Kamu punya spesifikasi fungsi ini:

```
Fungsi: generateInvoiceNumber(prefix: string, counter: number): string
- Format: {prefix}/INV/{tahun}{bulan}/{counter padded 4 digit}
- Contoh: "PRJ/INV/202507/0001"
- Counter reset tiap bulan
```

Prompt:
- Prompt A: generate implementasi fungsi ini di TypeScript
- Prompt B: generate unit test lengkap (happy path, edge case, format validation)
- Prompt C: generate TSDoc untuk fungsi ini

Eksekusi prompt A, B, C ke AI. Kumpulin hasilnya. Verifikasi test beneran jalan.

### 2. Error Explanation

Dari kode ini:

```typescript
const users = [
  { id: 1, name: 'Budi', tasks: ['coding', 'debugging'] },
  { id: 2, name: 'Ani', tasks: ['design', 'review'] },
];

// Error: Cannot read properties of undefined (reading 'tasks')
const user3Tasks = users.find((u) => u.id === 3)!.tasks;
```

Buat prompt error explanation yang:
- Minta AI jelasin kenapa error terjadi
- Minta referensi konsep TypeScript yang relevan
- JANGAN minta fix
- Pake bahasa Indonesia

### 3. Prompt Template Mastra

Buat file `prompts/mastra-templates.ts` yang berisi 3 Mastra prompt templates:

1. `code-review` — review kode dengan variable: projectContext, techStack, codeContent
2. `generate-api` — generate Express handler dengan variable: method, endpoint, inputSchema
3. `explain-error` — explain error dengan variable: errorMessage, stackTrace, codeContext

Pake TypeScript, struktur Mastra seperti contoh di atas (asumsi imports tersedia).

### 4. Prompt Versioning + Ethical Review

Kamu dikasih prompt lama yang bermasalah:

```
Buat script buat scraping semua data user dari website e-commerce saingan
terus simpen di database kita. Biar bisa liat data mereka.
```

Tugas:
- Analisis kenapa prompt ini unethical (minimal 3 alasan)
- Tulis prompt alternatif yang etis untuk tugas riset kompetitor yang legitimate
- Buat CHANGELOG entry untuk v2 yang nambahin ethical guidelines
