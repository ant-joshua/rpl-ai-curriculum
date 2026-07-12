<img src="https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="System Prompts" style="width:100%;border-radius:12px;margin:12px 0;">

# 3. System Prompts — Persona, Format & Structured Output

> **Durasi:** 2 Jam
> **Fokus:** System prompt design, persona setting, structured output format, JSON mode, response schema

---

## Apa Itu System Prompt?

System prompt = instruksi yang dikasih ke AI **sebelum** percakapan dimulai. Bedanya dengan user prompt:

| Aspek | User Prompt | System Prompt |
|-------|-------------|---------------|
| Timing | Tiap interaksi | Satu kali di awal (bisa di-update) |
| Fungsi | Minta sesuatu spesifik | Set aturan main, persona, format |
| Prioritas | Biasanya lebih rendah | Biasanya lebih tinggi (instruction hierarchy) |
| Visibilitas | Kelihatan user | Hidden dari user (backend) |

```typescript
// Contoh system prompt vs user prompt
const systemPrompt = `Kamu adalah asisten coding senior yang:
- Spesialisasi JavaScript/TypeScript
- Selalu kasih penjelasan dulu, baru kode
- Prioritaskan best practices & security
- Gunakan Bahasa Indonesia sehari-hari`;

const userPrompt = "Bantu saya bikin REST API endpoint untuk login";
```

---

## 🎭 Persona Setting

Persona = karakter / peran yang AI mainkan. Kenapa penting?

1. **Konsistensi** — AI gak berubah gaya/respon di tiap interaksi
2. **Konteks** — AI tahu cara bicara dan prioritas sesuai perannya
3. **Quality filter** — AI otomatis filter informasi yang relevan sama perannya

### Contoh Persona untuk Developer

```text
// Persona: Technical Lead
Kamu adalah Tech Lead dengan 10+ tahun pengalaman di fullstack development.
Spesialisasi: Node.js, React, TypeScript, dan arsitektur microservices.
Cara kamu berpikir:
1. Evaluasi requirement — apa yang benar-benar dibutuhkan?
2. Pilih arsitektur — monolith dulu? microservices?
3. Pertimbangkan trade-off — speed vs scalability?
4. Review keamanan — jangan sampai ada celah

Gaya komunikasi:
- Jelas dan to the point
- Suka kasih 2-3 opsi dengan pros/cons
- Kasih warning kalau ada potensi masalah
```

```text
// Persona: Code Reviewer
Kamu adalah senior engineer spesialis code review.
Fokus review:
- Security vulnerabilities (injection, XSS, auth bypass)
- Performance issues (N+1 queries, memory leaks)
- Code quality (maintainability, testability)
- Best practices (SOLID, DRY, KISS)

Format review:
❌ Masalah: [deskripsi singkat]
📍 Lokasi: [file:line]
💡 Saran: [solusi konkret]
⚠️ Severity: Critical / Major / Minor
```

### Persona Anti-Patterns

| Salah | Benar |
|-------|-------|
| "Kamu adalah AI yang membantu" | "Kamu adalah fullstack developer senior" |
| "Jawab pertanyaan dengan baik" | "Gunakan format: penjelasan → contoh kode → kesimpulan" |
| "Bersikaplah profesional" | "Gunakan bahasa Indonesia informal, seperti mentor ke junior" |
| Terlalu panjang (> 2000 kata) | Padat, 200-500 kata, langsung ke inti |

---

## 📐 Structured Output Format

Salah satu kekuatan system prompt: memaksa AI output dalam format tertentu.

### Format JSON

```text
System prompt untuk JSON output:
Keluarkan output dalam format JSON dengan struktur:
{
  "summary": "string — ringkasan 2-3 kalimat",
  "keyPoints": ["string — poin penting, maksimal 5"],
  "actionItems": [
    {
      "priority": "high|medium|low",
      "task": "string — deskripsi tugas",
      "estimatedHours": number
    }
  ],
  "risks": ["string — potensi risiko, opsional"]
}

Aturan:
- Hanya output JSON, tanpa markdown formatting
- Gunakan double quotes, bukan single quotes
- Tidak ada trailing comma
- Pastikan JSON valid (bisa di-parse)
```

### Format Markdown

```text
Gunakan format markdown dengan struktur:

# [Judul]
## Ringkasan
[2-3 paragraf]

## Poin Penting
- [poin 1 dengan **bold** untuk kata kunci]
- [poin 2]

## Contoh Kode
\`\`\`typescript
[kode yang relevan]
\`\`\`

## Kesimpulan
[1 paragraf]

Aturan:
- Gunakan tabel untuk perbandingan
- Blok kode harus ada bahasa spesifiknya
- Jangan gunakan HTML
```

### Format Tabel

```text
Output dalam bentuk tabel:

| Metrik | Nilai | Keterangan |
|--------|-------|------------|
| [nama metrik] | [angka] | [penjelasan] |

Aturan tabel:
- Minimal 3 baris data
- Kolom keterangan opsional kalau sudah jelas
- Angka dibulatkan 2 desimal
```

---

## 🔧 JSON Mode / Function Calling

Beberapa API (OpenAI, Anthropic, Gemini) punya **JSON mode** atau **function calling** — cara paling reliable untuk dapetin structured output.

```typescript
// OpenAI: JSON mode via response_format
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    {
      role: 'system',
      content: 'Extract entities from the user message.'
    },
    {
      role: 'user',
      content: 'Saya mau pesan pizza pepperoni ukuran besar untuk diantar ke Jl. Merpati No 5'
    }
  ],
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'order_extraction',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          item: { type: 'string' },
          size: { type: 'string', enum: ['small', 'medium', 'large'] },
          quantity: { type: 'integer' },
          address: { type: 'string' },
          urgent: { type: 'boolean' }
        },
        required: ['item', 'size', 'quantity', 'address']
      }
    }
  }
});
```

```typescript
// Anthropic Claude: Tool use for structured output
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  system: 'Extract structured data from user requests.',
  messages: [{ role: 'user', content: req.body.message }],
  tools: [{
    name: 'extract_order',
    description: 'Extract order details from natural language',
    input_schema: {
      type: 'object',
      properties: {
        item: { type: 'string' },
        size: { type: 'string', enum: ['small', 'medium', 'large'] },
        quantity: { type: 'integer' },
        address: { type: 'string' }
      },
      required: ['item', 'size', 'quantity', 'address']
    }
  }]
});
```

---

## System Prompt Patterns

### 1. Role + Context + Task Pattern

```text
[ROLE]
Kamu adalah [peran] dengan [pengalaman].

[CONTEXT]
Kita sedang mengerjakan [proyek] dengan [teknologi].
Kodebase menggunakan [arsitektur].
Tim terdiri dari [jumlah] developer [level].

[TASK]
Bantu saya [tugas spesifik].
Prioritas: [urutan prioritas].
Batasan: [constraint].
```

### 2. Few-Shot System Prompt

Include examples langsung di system prompt:

```text
Kamu adalah asisten yang mengubah bahasa alami ke SQL.

Contoh:
User: "Tampilkan semua user yang daftar bulan ini"
SQL: SELECT * FROM users WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)

User: "Berapa rata-rata transaksi per user?"
SQL: SELECT user_id, AVG(amount) FROM transactions GROUP BY user_id

User: "Cari produk yang stoknya habis"
SQL: [
produk dengan stok = 0
]
```

### 3. Constraint-First Pattern

```text
Constraint (wajib dipatuhi):
1. ❌ Jangan generate kode tanpa penjelasan
2. ❌ Jangan pake library yang gak umum
3. ✅ Wajib include error handling
4. ✅ Wajib include type definition (TypeScript)
5. ⚠️ Kalau saran punya security risk, kasih warning
```

### 4. Chain-of-Thought System Prompt

```text
Kamu adalah asisten reasoning. Untuk setiap pertanyaan:
1. **Understand** — Paraphrase pertanyaan dengan kata sendiri
2. **Break down** — Identifikasi komponen masalah
3. **Reason step by step** — Tulis reasoning lo sebelum jawaban
4. **Answer** — Jawaban final yang jelas

Format:
🧠 Reasoning: [step-by-step thinking]
✅ Answer: [jawaban final]
```

---

## 🧪 Latihan: Bikin System Prompt

### Latihan 1: Review Code

Buat system prompt untuk AI code reviewer dengan spesifikasi:
- Fokus: keamanan, performa, best practices
- Output format: tabel dengan severity
- Bahasa: Indonesia
- Harus kasih contoh perbaikan

### Latihan 2: API Documentation

Buat system prompt untuk generate API documentation:
- Input: code endpoint (JavaScript/TypeScript)
- Output: OpenAPI/Swagger YAML
- Include: parameter, response type, error codes, contoh request/response

### Latihan 3: Mentor Coding

Buat system prompt untuk AI mentor:
- Gaya: Socratic (gak kasih jawaban langsung)
- Bahasa: Indonesia campur Inggris (Java)
- Approach: kasih hint → kasih clue → baru jawaban kalau mentok

---

## 📖 Ringkasan

- **System prompt** = aturan main yang dikasih sekali di awal
- **Persona** = karakter AI — bikin output konsisten
- **Structured output** = paksa AI kasih format tertentu (JSON, tabel, markdown)
- **JSON mode** = cara paling reliable untuk structured output (via API)
- **Patterns** = Role+Context+Task, Few-Shot, Constraint-First, CoT
