# Prompt Engineering untuk Developer — Latihan

## Level 1: Dasar

### 1. System Prompt — Role & Behavior Definition
**Pertanyaan:** Rancang system prompt untuk berbagai peran engineering:

```markdown
# === LENGKAPI: System prompt untuk 3 role ===

## Role 1: Senior Code Reviewer
<!-- System prompt untuk AI yang review pull request -->
<!-- === LENGKAPI === -->
Kamu adalah senior developer dengan 10+ tahun pengalaman. Tugas kamu adalah me-review kode dengan fokus pada:
- Security vulnerabilities
- Performance bottlenecks
- Code smells dan anti-patterns
- TypeScript strict mode compliance
- ?

Behavior rules:
- Prioritaskan critical issues
- ...
- ...

## Role 2: Technical Writer
<!-- System prompt untuk AI yang generate documentation -->
<!-- === LENGKAPI === -->

## Role 3: Database Architect
<!-- System prompt untuk AI yang design database schema -->
<!-- === LENGKAPI === -->
```

```markdown
# === LENGKAPI: System prompt components analysis ===
# Untuk tiap komponen, jelaskan kenapa penting:
# 1. Role statement: ?
# 2. Expertise level: ?
# 3. Task focus areas: ?
# 4. Behavior rules: ?
# 5. Output format: ?
# 6. Constraints: ?
# 7. Examples (few-shot): ?
```

1. Buat 3 system prompt untuk peran developer berbeda
2. Analisis setiap komponen system prompt
3. Test: kirim kode yang sama ke 3 role berbeda → bandingkan output

**Hint:** System prompt components: (1) Role — siapa AI ini? (2) Context — project/tech stack apa? (3) Task — apa yang harus dilakukan? (4) Constraints — apa yang tidak boleh dilakukan? (5) Output format — bagaimana format jawaban? (6) Tone — formal/kasual/detail/ringkas? (7) Examples — 1-2 contoh output yang diharapkan. Effective system prompt: spesifik, actionable, memiliki guardrails.

---

### 2. Few-Shot Prompting — Code Generation with Examples
**Pertanyaan:** Gunakan few-shot prompting untuk generate kode konsisten:

```markdown
# === LENGKAPI: Few-shot prompt untuk API endpoint ===

## System
Kamu adalah engineer yang membuat REST API dengan Express.js + TypeScript + Zod.
Setiap endpoint harus punya: validation, error handling, logging, typed response.

## Examples

### Example 1: GET /api/users/:id
Input: Get user by ID
```typescript
// Generated code:
export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    req.log.info({ userId: id }, 'Fetching user');
    
    const user = await userService.findById(id);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User tidak ditemukan');
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
```

### Example 2: POST /api/users
Input: Create new user with validation
```typescript
// === LENGKAPI: Generate kode seperti Example 1 ===
```

### Example 3: PUT /api/users/:id
Input: Update user data
```typescript
// === LENGKAPI: Generate kode dengan format konsisten ===
```

### Now: DELETE /api/users/:id
<!-- === LENGKAPI: Prompt untuk generate DELETE endpoint === -->
Buat endpoint DELETE /api/users/:id dengan:
- Soft delete (set deletedAt)
- Return 200 dengan success message
- Handle case user not found
- Ikuti format dari examples di atas
```

```
# === LENGKAPI: Analisis few-shot ===
# 1. Berapa contoh yang optimal? (1, 2, 3, 5?)
# 2. Apa yang terjadi kalau contoh terlalu mirip?
# 3. Apa yang terjadi kalau contoh terlalu beda?
```

1. Buat few-shot prompt dengan 2 contoh yang baik
2. Test generate 3 endpoint berbeda
3. Bandingkan konsistensi output dengan dan tanpa few-shot

**Hint:** Few-shot: berikan contoh input → output yang diharapkan. Jumlah contoh: 2-3 biasanya optimal (>5 bikin prompt terlalu panjang). Kualitas > kuantitas: 2 contoh baik > 5 contoh biasa. Contoh harus cover pattern yang ingin direplikasi. Consistency: format, naming convention, error handling pattern harus sama di semua contoh.

---

### 3. Chain-of-Thought — Complex Problem Solving
**Pertanyaan:** Buat prompt CoT untuk problem solving yang kompleks:

```markdown
# === LENGKAPI: CoT prompt untuk debugging ===

## Problem
Aplikasi Next.js kadang return 504 Gateway Timeout. 
Error muncul random, tidak selalu reproducible.
Stack trace: AsyncLocalStorage async_hooks.js:191

## Chain of Thought
Langkah-langkah debugging:

1. **Analisis Error Pattern**
   - Error: 504 Gateway Timeout → request terlalu lama atau ada bottleneck
   - Random muncul → mungkin related ke memory leak atau race condition
   - Stack trace: AsyncLocalStorage → ada async operation yang tidak proper cleanup

2. **Hypothesis**
   - Hypothesis 1: Database connection pool exhausted
   - Hypothesis 2: Memory leak di serverless function
   - Hypothesis 3: ? (=== LENGKAPI ===)

3. **Verification Plan**
   - Untuk Hypothesis 1: Monitor active connections, cek pool config
   - Untuk Hypothesis 2: 
   - Untuk Hypothesis 3:

4. **Solution**
   - Kalau Hypothesis 1 benar: 
   - Kalau Hypothesis 2 benar:
```

```
# === LENGKAPI: CoT untuk architecture decision ===
# Problem: Pilih database untuk real-time chat app
# Users: 1M MAU, messages: 100M/day, perlu full-text search
#
# Chain of Thought:
# 1. Requirements analysis: ?
# 2. Options evaluation: ?
# 3. Trade-off analysis: ?
# 4. Recommendation: ?
```

1. Buat CoT prompt untuk 3 problem kompleks
2. Test dengan AI dan analisis apakah reasoning-nya benar
3. Bandingkan dengan direct prompt (tanpa CoT)

**Hint:** CoT = minta AI berpikir step-by-step sebelum jawab. Effective CoT: (1) breakdown problem ke sub-problems, (2) generate multiple hypotheses, (3) evaluate each hypothesis, (4) pick best solution. Teknik: "Let's think step by step", "First, analyze...", "Second, consider...", "Finally...". Zero-shot CoT: cukup "Let's think step by step" tanpa contoh. Few-shot CoT: berikan contoh reasoning + answer.

---

## Level 2: Intermediate

### 4. Prompt Pattern — Persona Pattern
**Pertanyaan:** Gunakan persona pattern untuk mendapatkan output dari perspektif berbeda:

```markdown
# === LENGKAPI: Persona pattern ===

## Persona 1: Security Auditor
Act as a senior security auditor reviewing this code. Focus on OWASP Top 10 vulnerabilities.
Identify: SQL injection, XSS, CSRF, insecure auth, sensitive data exposure.
=== LENGKAPI: Tambah behavior spesifik untuk persona ini ===

## Persona 2: Performance Engineer
Act as a performance engineer. Analyze this code for bottlenecks.
=== LENGKAPI: Focus areas dan output format ===

## Persona 3: Junior Developer Mentee
Act as a junior developer who needs explanation.
=== LENGKAPI: Tone dan level detail ===
```

```typescript
// === LENGKAPI: Kode yang akan di-review oleh persona di atas ===
app.post('/api/orders', async (req, res) => {
  const { userId, items, paymentMethod } = req.body;
  
  const total = items.reduce((sum, item) => sum + item.price, 0);
  
  const order = await db.query(
    `INSERT INTO orders (user_id, total, payment_method) VALUES (?, ?, ?)`,
    [userId, total, paymentMethod]
  );
  
  for (const item of items) {
    await db.query(
      `UPDATE products SET stock = stock - 1 WHERE id = ?`,
      [item.productId]
    );
  }
  
  res.json({ orderId: order.insertId, total });
});
```

1. Buat 3 persona prompt untuk review kode yang sama
2. Bandingkan output dari tiap persona
3. Analisis: persona mana yang paling membantu untuk skenario apa?

**Hint:** Persona pattern: "Act as a [role] who [task]. Your expertise is [area]. You always [behavior]." Persona membuat AI mengadopsi knowledge, tone, dan priority yang sesuai. Persona berbeda → fokus review berbeda. Security auditor: fokus ke vulnerability. Performance engineer: fokus ke bottleneck. Junior: fokus ke explanation. Pilih persona sesuai tujuan review.

---

### 5. Prompt Pattern — Flipped Interaction
**Pertanyaan:** Gunakan flipped interaction pattern untuk AI yang bertanya ke user:

```markdown
# === LENGKAPI: Flipped interaction prompt ===

## Scenario: Build a REST API
You are a senior backend architect. I want you to help me build a REST API.
But instead of me telling you everything, you should ASK ME questions to gather requirements.

Start by asking me questions one at a time about:
1. === LENGKAPI: 5 questions untuk gather requirements ===
   - What is the domain/model?
   - What endpoints do you need?
   - ?
   - ?
   - ?

After I answer all questions, generate the complete code.
```

```markdown
# === LENGKAPI: Implementasi flipped interaction ===
# Simulasi sesi:
# AI: "What is the main entity/model for this API?"
# User: "Product with fields: id, name, price, category, stock"
# AI: "What endpoints do you need?"
# User: "CRUD + search by name + filter by category"
# AI: "What database are you using?"
# User: "PostgreSQL with Prisma"
# ...
# AI: [Generate complete API based on answers]
```

1. Buat flipped interaction prompt untuk 3 skenario
2. Simulasi sesi tanya jawab dengan AI
3. Evaluasi: apakah hasil akhir lebih sesuai dengan kebutuhan?

**Hint:** Flipped interaction: AI yang bertanya, user yang jawab. Berguna ketika: (1) user belum jelas mau apa, (2) requirements kompleks, (3) butuh explore options. Cara kerja: AI ask → user answer → AI ask next → ... → AI generate final output. Keuntungan: hasil lebih sesuai, user lebih paham, uncover hidden requirements. Risiko: terlalu banyak pertanyaan → user capek. Batasi 5-7 pertanyaan.

---

### 6. Prompt Pattern — Template Pattern
**Pertanyaan:** Buat template prompt yang bisa diisi parameter:

```markdown
# === LENGKAPI: Prompt template dengan variable ===

## Template: API Endpoint Generator
```
Buat endpoint [METHOD] /api/[RESOURCE]/[ACTION] di [FRAMEWORK] dengan:

Resource: [RESOURCE]
Fields: [FIELDS]
Actions: [ACTIONS]
Auth required: [AUTH]
Tech stack: [STACK]

Requirements:
- [REQUIREMENTS]

Output format: [FORMAT]
```

## Example usage:
<!-- === LENGKAPI: Fill in template untuk create user endpoint === -->
METHOD: POST
RESOURCE: users
ACTION: create
...

## === LENGKAPI: Buat 3 template prompt lainnya ===
# Template 1: Test Generator
# Variable: framework, file_path, coverage_target
#
# Template 2: Database Schema Designer
# Variable: entities, relationships, database_type
#
# Template 3: Error Handler Generator
# Variable: language, error_types, logging_framework
```

```yaml
# === LENGKAPI: Structured prompt as YAML ===
# Format alternatif untuk prompt yang terstruktur
prompt:
  role: "senior_developer"
  task: "generate_api_endpoint"
  parameters:
    method: "POST"
    path: "/api/products"
    framework: "Express.js"
    database: "Prisma + PostgreSQL"
  requirements:
    - "Input validation with Zod"
    - "Error handling"
    - "Request logging"
    - "TypeScript"
  output:
    format: "single_file"
    inclusions: ["route", "validation", "service"]
```

1. Buat 4 prompt template dengan variable
2. Test template yang sama dengan parameter berbeda
3. Buat versi YAML/JSON untuk structured prompting

**Hint:** Template pattern: prompt yang punya variable `[VARIABLE]` yang bisa diisi. Keuntungan: reusable, consistent, mudah di-scale. Variable types: resource (model name), action (CRUD), framework, requirements. Fill-in: ganti `[VARIABLE]` dengan nilai spesifik. Structured format: YAML/JSON lebih mudah di-parse dan di-version control. Template library: simpan di folder `prompts/templates/`.

---

### 7. Meta Prompt — Self-Improving Prompt
**Pertanyaan:** Buat meta prompt yang meminta AI mengevaluasi dan memperbaiki prompt:

```markdown
# === LENGKAPI: Meta prompt evaluator ===

Kamu adalah prompt engineer expert. Evaluasi prompt berikut untuk task [CODING]:
[INSERT PROMPT HERE]

Evaluasi berdasarkan:
1. **Clarity** — Apakah instruksi jelas? (1-10)
   - Score: ?
   - Saran: ?
2. **Completeness** — Apakah semua requirements tercakup? (1-10)
   - Score: ?
   - Saran: ?
3. **Specificity** — Apakah cukup spesifik? (1-10)
   - Score: ?
   - Saran: ?
4. **Constraints** — Apakah guardrails cukup? (1-10)
   - Score: ?
   - Saran: ?
5. **Examples** — Apakah contoh membantu? (1-10)
   - Score: ?
   - Saran: ?

Overall score: ?/50
Improved version of the prompt:
<!-- === LENGKAPI: Generate improved version === -->
```

```markdown
# === LENGKAPI: Meta prompt untuk iterate prompt ===
Kamu akan membantu saya memperbaiki prompt untuk [TASK].
Saya akan memberikan prompt saya, dan kamu akan:
1. Mengidentifikasi 3 kelemahan utama
2. Memberikan 3 saran spesifik untuk improvement
3. Menulis ulang prompt yang lebih baik

Prompt saya:
[INSERT PROMPT]

Iterasi #1:
<!-- === LENGKAPI: Hasil perbaikan === -->
```

1. Buat meta prompt evaluator dengan scoring system
2. Test dengan prompt yang sengaja dibuat jelek
3. Iterasi prompt berdasarkan feedback meta prompt
4. Dokumentasikan perbaikan dari iterasi 1 ke iterasi 3

**Hint:** Meta prompt = prompt tentang prompt. Gunakan untuk: (1) evaluate prompt effectiveness, (2) identify gaps, (3) suggest improvements, (4) generate improved version. Evaluation criteria: clarity, specificity, context, constraints, examples. Iterative improvement: tiap iterasi fokus ke 1-2 improvement saja. Track perubahan: simpan versi prompt untuk melihat progres.

---

### 8. Production Prompt — Monitoring & Versioning
**Pertanyaan:** Setup prompt management untuk production:

```typescript
// === LENGKAPI: Prompt versioning system ===
// prompts/index.ts
const prompts = {
  'v1.0.0': {
    systemPrompt: '...',
    templates: { ... }
  },
  'v1.1.0': {
    systemPrompt: '...',  // Updated
    templates: { ... }
  },
  // === LENGKAPI: Tambah version management ===
  // 1. Function to get prompt by version
  // 2. Function to get latest version
  // 3. Function to compare versions
  // 4. Auto-rollback kalau performance turun
};

// === LENGKAPI: Prompt monitoring ===
// 1. Track tiap prompt usage: timestamp, version, response time, success rate
// 2. A/B testing: compare v1.0.0 vs v1.1.0
// 3. Alert kalau success rate turun > 10%
// 4. Dashboard untuk monitoring prompt performance

interface PromptMetric {
  version: string;
  timestamp: Date;
  task: string;
  responseTime: number;
  success: boolean;
  userSatisfaction?: number;  // 1-5
}

// === LENGKAPI: Implementasi metrics tracker ===
class PromptMetricsTracker {
  private metrics: PromptMetric[] = [];
  
  track(metric: PromptMetric) {
    // === LENGKAPI: Send ke monitoring system ===
  }
  
  getPerformance(version: string): { avgResponseTime: number; successRate: number } {
    // === LENGKAPI: Calculate metrics for version ===
  }
}
```

1. Setup prompt versioning dengan semantic version
2. Implementasi metrics tracking untuk prompt performance
3. Buat A/B testing framework untuk prompt comparison
4. Setup alert kalau prompt performance degraded

**Hint:** Prompt versioning: simpan di folder `prompts/v1.0.0/`, `prompts/v1.1.0/`. Version bump: major (breaking change), minor (improvement), patch (fix). Metrics: response time, success rate (valid JSON? error handling?), user feedback. A/B testing: split traffic 50/50, compare metrics. Fallback: kalau versi baru performa turun, auto-rollback ke versi sebelumnya. Alert: threshold based on historical data.
