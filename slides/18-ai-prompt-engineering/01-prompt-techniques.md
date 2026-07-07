---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — Modul 18: AI Prompt Engineering untuk Developer RPL"
footer: "Sesi 01: Prompt Techniques"
---

<!-- _class: title -->
# 1. Prompt Techniques

> **Durasi:** 2 Jam  
> **Fokus:** Zero-shot, few-shot, chain-of-thought, role prompting, structured output, iterative refinement

---

## Zero-Shot vs Few-Shot Prompting

### Zero-Shot

Zero-shot = kasih instruksi langsung tanpa contoh. AI nebak-context dari training data.

```typescript
// Zero-shot: "Klasifikasikan sentimen"
// Prompt: "Klasifikasikan sentimen dari teks ini: positif/negatif/netral"
// Teks: "Aplikasi ini sering error pas checkout"
```

Masalah: hasil bisa vague atau inconsistent. AI tebak sendiri formatnya.

### Few-Shot

Few-shot = kasih 2-5 contoh dulu, baru minta AI kerja.

| Aspek | Zero-Shot | Few-Shot |
|-------|-----------|----------|
| Contoh | 0 | 2-5 |
| Konsistensi | Rendah | Tinggi |
| Cocok untuk | Task simpel, umum | Task spesifik, butuh format pasti |
| Panjang prompt | Pendek | Lebih panjang |
| Akurasi format | Suka melenceng | Stabil |

```typescript
// Few-shot: kasih contoh format dulu
const prompt = `
Klasifikasikan sentimen dari teks e-commerce (POSITIF/NEGATIF/NETRAL).

Contoh:
Teks: "Barang sampai cepat, kualitas bagus"
Sentimen: POSITIF

Teks: "Pengiriman telat 3 hari, barang rusak"
Sentimen: NEGATIF

Teks: "Barang sesuai deskripsi"
Sentimen: NETRAL

Sekarang klasifikasikan:
Teks: "Customer service lambat respon, barang OK"
Sentimen:`;

// Output expected: "NEGATIF" — konsisten dengan format contoh
```

**Kapan pake few-shot:**
- Format output harus ketat (JSON, enum, list)
- Task butuh domain knowledge spesifik
- AI sering salah interpretasi instruksi

---

## Chain-of-Thought (CoT)

Chain-of-thought = suruh AI berpikir step-by-step sebelum jawab.

### Tanpa CoT (langsung jawab)

```typescript
// Prompt: "Hitung diskon: harga 200.000, diskon 15% + tambahan 10rb"
// AI jawab langsung: "20.000" — BISA SALAH
```

### Dengan CoT

```typescript
const prompt = `
Hitung total yang harus dibayar.

Langkah-langkah:
1. Hitung diskon pertama: 15% dari 200.000 = 30.000
2. Harga setelah diskon: 200.000 - 30.000 = 170.000
3. Potong tambahan 10.000: 170.000 - 10.000 = 160.000

Total: 160.000

Sekarang hitung sendiri:
Harga: 500.000, Diskon: 20% + kupon 25.000
`;
```

**Kenapa CoT penting buat coding:**
- Debugging butuh tracing step-by-step
- Refactoring butuh analisis dependensi
- Generate complex query butuh breakdown logika

### Zero-Shot CoT

Cukup tambahin "Mari berpikir step by step" di akhir prompt:

```typescript
// Zero-shot CoT
const prompt = `
Buat function untuk cek apakah suatu string adalah palindrome.
Jelaskan approach lo dulu, baru kasih kode.
Mari berpikir step by step.
`;
```

---

## Role Prompting

Role prompting = kasih AI persona/sistem role biar output sesuai konteks.

### System Message Pattern

```typescript
// System prompt — define persona
const systemPrompt = `
Kamu adalah senior software engineer yang specialize di code review.
Prioritas: security > performance > readability.
Gunakan bahasa Indonesia.
Jangan kasih kode fix — cukup analisis dan rekomendasi.
`;

// User prompt — task spesifik
const userPrompt = `
Review kode ini:
function getUser(id) {
  return db.query("SELECT * FROM users WHERE id = " + id);
}
`;
```

### Role Comparison

| Role | Konteks | Gaya Output |
|------|---------|-------------|
| Senior Developer | Code review, arsitektur | Teknis, detail, prioritas |
| Teacher/Mentor | Explain, tutorial | Analogi, step-by-step, sabar |
| Technical Writer | Dokumentasi | Rapi, konsisten, formal |
| Security Auditor | Vulnerability scan | Paranoia, severity rating |
| Code Reviewer | Pull request review | Constructive, specific |

```typescript
// Contoh: Role sebagai Guru
const prompt = `
Kamu adalah guru programming yang jelasin ke anak SMK.
Pake analogi dunia nyata. Target: siswa yang baru belajar 1 semester.

Jelasin konsep closure di JavaScript pake analogi kantin sekolah.
`;
```

---

## Structured Output (JSON Mode)

Paksa AI output dalam format terstruktur biar bisa diparsing programmatically.

### Tanpa Structured Output

```
Buat data produk:
- Nama: Kopi Susu
- Harga: 15000
- Stok: 100
- Kategori: Minuman
```

AI bisa balik: "Produk Kopi Susu dengan harga Rp15.000 tersedia 100 unit di kategori Minuman" — SUSAH DI-PARSE.

### Dengan Structured Output

```typescript
const prompt = `
Buat data produk dalam format JSON. Jangan tambah teks lain.

{
  "nama": "Kopi Susu",
  "harga": 15000,
  "stok": 100,
  "kategori": "Minuman",
  "tersedia": true
}

Sekarang buat produk berikut:
Nama: Nasi Goreng, Harga: 25000, Stok: 50, Kategori: Makanan
`;

// Output AI:
// {
//   "nama": "Nasi Goreng",
//   "harga": 25000,
//   "stok": 50,
//   "kategori": "Makanan",
//   "tersedia": true
// }
```

### Prompt Template untuk JSON Mode

```typescript
const jsonPromptSchema = `
Kamu akan menghasilkan output JSON. 
Schema yang harus diikuti:
{
  "field_name": "type | description",
  "users": "array of objects | list pengguna",
  "total": "number | total count"
}

Hanya output JSON. No markdown. No explanation.
`;
```

**Kegunaan JSON mode di project:**
- Generate mock data buat testing
- Parse output AI ke variable program
- Chain prompt (output prompt 1 → input prompt 2)
- Auto-generate configuration files

---

## Iterative Refinement

Prompt pertama hampir never perfect. Refinement = improve prompt bertahap.

### Siklus Refinement

```
1. Tulis prompt awal → eval hasil
2. Identifikasi masalah (vague, wrong format, missing context)
3. Tambah constraint / contoh / spesifikasi
4. Test ulang
5. Repeat sampe acceptable
```

### Contoh Refinement

**Iterasi 1 — Terlalu vague:**

```
"Buatin fungsi validasi email"
```

Hasil: fungsi simple, cek `@` doang.

**Iterasi 2 — Tambah spesifikasi:**

```
"Buat fungsi validasi email di TypeScript.
Validasi: format regex, cek domain valid (gmail.com, yahoo.com),
min length 5, max length 100."
```

Hasil: lebih lengkap, tapi regex terlalu strict.

**Iterasi 3 — Tambah constraint:**

```
"Buat fungsi validasi email TypeScript.
- Regex standar RFC 5322 (gampang dibaca, bukan unicode monster)
- Cek domain dari list yang diizinkan: ['gmail.com', 'yahoo.com', 'outlook.com']
- Case insensitive
- Return { valid: boolean, error?: string }
- Unit test juga"
```

Hasil: sesuai ekspektasi.

```typescript
// Final result setelah 3 iterasi
interface EmailValidationResult {
  valid: boolean;
  error?: string;
}

function validateEmail(email: string): EmailValidationResult {
  const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.length < 5 || email.length > 100) {
    return { valid: false, error: 'Email must be 5-100 characters' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  const domain = email.split('@')[1].toLowerCase();
  if (!allowedDomains.includes(domain)) {
    return { valid: false, error: `Domain ${domain} not allowed` };
  }

  return { valid: true };
}
```

### Checklist Evaluasi Prompt

| Kriteria | Check |
|----------|-------|
| Tujuan jelas? | ☐ |
| Format output disebut? | ☐ |
| Konteks cukup? | ☐ |
| Constraint disebut? | ☐ |
| Contoh (few-shot) dikasih? | ☐ |
| Role/persona ditentukan? | ☐ |
| Bahasa konsisten? | ☐ |

---

## Latihan

### 1. Zero-Shot vs Few-Shot

Buat 2 prompt untuk task yang sama: klasifikasi kategori produk (Elektronik, Fashion, Makanan, Lainnya).

- Prompt A: zero-shot — tanpa contoh
- Prompt B: few-shot — kasih 3 contoh

Test ke AI. Bandingin hasilnya. Mana yang lebih konsisten?

### 2. Chain-of-Thought Debugging

Kamu dikasih kode yang error. Tulis prompt CoT buat tracing masalah.

```typescript
function hitungTotal(items: { harga: number; qty: number }[]): number {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].harga * items[i].qty;
  }
  return total;
}
```

Prompt harus: suruh AI jelasin tiap baris dulu, baru kasi saran fix. Jangan langsung kasi fix.

### 3. Role Prompting + JSON Mode

Buat prompt yang pake role "Teknisi Database" dan output dalam format JSON.

Task: generate 3 sample data tabel `transactions` dengan field:
- `id` (number)
- `user_id` (number)
- `total` (number)
- `items` (array of { name, qty, price })
- `created_at` (ISO date)

Output harus pure JSON, no markdown.

### 4. Iterative Refinement Challenge

Mulai dari prompt ini:

```
Buat API endpoint untuk login
```

Refine prompt sampe AI ngasih output yang mencakup:
- TypeScript + Express
- JWT token
- Input validation (email, password min 8)
- Error handling
- Unit test

Dokumentasiin tiap iterasi: apa yang lo tambahin dan kenapa.
