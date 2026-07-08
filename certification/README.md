# 🎓 Sertifikasi RPL AI Curriculum

> **Panduan Lengkap Sertifikasi — Jalur, Level, Ujian, dan Portofolio**
> **Total Materi:** 4 sesi + panduan referensi lengkap

---

## 📚 Daftar Isi Sertifikasi

| # | Dokumen | Deskripsi | Word Count |
|---|---------|-----------|------------|
| 01 | [Overview Jalur Sertifikasi](./01-overview-jalur-sertifikasi.md) | Skema BNSP/LSP, jenis sertifikasi, self-assessment | ~1.144w |
| 02 | [Strategi Persiapan](./02-strategi-persiapan.md) | Timeline, metode belajar, pola soal, tips uji praktik | ~1.551w |
| 03 | [Portofolio & Proyek](./03-portfolio-proyek.md) | Standar proyek, struktur coding, dokumentasi, demo | ~1.653w |
| 04 | [Simulasi Ujian](./04-simulasi-ujian.md) | Try out teori + praktik + wawancara, final checklist | ~2.388w |
| **README** | **Panduan Ini** | Levels, soal, rubrik, renewal, recognition + latihan kode | **~3.500w** |
| | **Total Sertifikasi** | | **~10.000w+** |

---

## 1. Tingkat Sertifikasi (L1, L2, L3)

Sertifikasi RPL AI Curriculum dibagi menjadi 3 level yang mencerminkan kedalaman kompetensi:

### Level 1: Fundamental (L1) — Junior Developer

| Aspek | Detail |
|-------|--------|
| **Target Peserta** | Pemula coding 0-6 bulan, fresh graduate SMK/S1 non-TI |
| **Durasi Persiapan** | 4-6 minggu |
| **Cakupan** | JavaScript dasar, HTML/CSS, Git, REST API sederhana |
| **Proyek Minimal** | Landing page + 1 REST API endpoint |
| **Setara KKNI** | Level II-III (Junior Programmer) |
| **Setara Industri** | Intern / Junior Developer trainee |

**Unit Kompetensi L1:**
| Kode | Unit Kompetensi | Bobot |
|------|----------------|-------|
| L1.01 | Menggunakan struktur data dasar (array, object) | 20% |
| L1.02 | Membangun halaman web dengan HTML/CSS/JS | 25% |
| L1.03 | Menggunakan version control (Git) | 15% |
| L1.04 | Membuat REST API sederhana | 25% |
| L1.05 | Dokumentasi & deployment dasar | 15% |

**Kriteria Lulus L1:**
- Minimal 70/100 untuk ujian teori
- Minimal 70/100 untuk ujian praktik
- Portofolio: minimal 2 proyek

### Level 2: Intermediate (L2) — Developer

| Aspek | Detail |
|-------|--------|
| **Target Peserta** | 6-18 bulan pengalaman coding |
| **Durasi Persiapan** | 4-8 minggu |
| **Cakupan** | TypeScript, React/Express, PostgreSQL, JWT auth, AI agent dasar |
| **Proyek Minimal** | Full-stack app dengan database + auth |
| **Setara KKNI** | Level III-IV (Programmer / Web Developer) |
| **Setara Industri** | Junior-Mid Developer |

**Unit Kompetensi L2:**
| Kode | Unit Kompetensi | Bobot |
|------|----------------|-------|
| L2.01 | TypeScript & type-safe programming | 15% |
| L2.02 | React component & state management | 20% |
| L2.03 | REST API dengan Express + database | 20% |
| L2.04 | Authentication & authorization (JWT) | 15% |
| L2.05 | AI agent design (Mastra dasar) | 15% |
| L2.06 | Testing & deployment | 15% |

**Kriteria Lulus L2:**
- Minimal 75/100 untuk ujian teori
- Minimal 75/100 untuk ujian praktik
- Portofolio: minimal 4 proyek (2 individual, 2 kolaborasi)

### Level 3: Advanced (L3) — Senior Developer / AI Engineer

| Aspek | Detail |
|-------|--------|
| **Target Peserta** | 2+ tahun pengalaman, atau lulus L2 + proyek tambahan |
| **Durasi Persiapan** | 6-12 minggu |
| **Cakupan** | System design, AI agent lanjutan, RAG, multi-agent, production ops |
| **Proyek Minimal** | Full-stack AI-powered app production-ready |
| **Setara KKNI** | Level IV-V (Senior Programmer / System Analyst) |
| **Setara Industri** | Mid-Senior Developer / AI Engineer |

**Unit Kompetensi L3:**
| Kode | Unit Kompetensi | Bobot |
|------|----------------|-------|
| L3.01 | System design & architecture | 20% |
| L3.02 | AI agent dengan RAG & memory | 20% |
| L3.03 | Multi-agent workflow & orchestration | 15% |
| L3.04 | Performance optimization & monitoring | 15% |
| L3.05 | Security best practices | 10% |
| L3.06 | Team collaboration & code review | 10% |
| L3.07 | Deployment & CI/CD | 10% |

**Kriteria Lulus L3:**
- Minimal 80/100 untuk ujian teori
- Minimal 80/100 untuk ujian praktik
- Portofolio: minimal 6 proyek (termasuk 1 production-grade app)
- Wawancara teknis dengan asesor

---

## 2. Matriks Level Sertifikasi

| Kriteria | L1 | L2 | L3 |
|----------|----|----|----|
| **Teori** | 70/100 | 75/100 | 80/100 |
| **Praktik** | 70/100 | 75/100 | 80/100 |
| **Proyek** | 2+ | 4+ | 6+ |
| **Wawancara** | — | — | ✅ |
| **Masa Berlaku** | 2 tahun | 3 tahun | 3 tahun |
| **Biaya Estimasi** | Rp 500k-1M | Rp 1M-2M | Rp 2M-3M |
| **Pra-syarat** | Tidak ada | L1 atau setara | L2 atau 2 thn kerja |

---

## 3. Contoh Soal Ujian per Track (5-10 Soal + Jawaban)

### Track: Web Developer (L2)

#### Soal Pilihan Ganda (5 Soal)

**Soal 1:**
```typescript
// Manakah deklarasi TypeScript yang PALING TEPAT untuk fungsi
// yang menerima array user dan mengembalikan array email saja?

// A.
function getEmails(users: any[]): string[] {
  return users.map(u => u.email);
}

// B.
function getEmails(users: Array<User>): Array<string> {
  return users.map(u => u.email);
}

// C.
function getEmails<T extends { email: string }>(users: T[]): string[] {
  return users.map(u => u.email);
}

// D.
function getEmails(users: User[]): any {
  return users.map(u => u.email);
}
```

**Jawaban: C**
**Penjelasan:** Opsi C menggunakan generic constraint (`T extends { email: string }`) yang memastikan tipe parameter memiliki properti `email`, mengembalikan `string[]` secara eksplisit. Opsi A menggunakan `any` (tidak type-safe). Opsi B membutuhkan interface `User` didefinisikan. Opsi D mengembalikan `any`.

---

**Soal 2:**
```typescript
// Apa output dari kode JavaScript berikut?

const promise1 = Promise.resolve(1);
const promise2 = new Promise((resolve) => setTimeout(() => resolve(2), 100));
const promise3 = Promise.reject(new Error('gagal'));

Promise.allSettled([promise1, promise2, promise3])
  .then(results => {
    console.log(results.length);
    console.log(results.filter(r => r.status === 'fulfilled').length);
  });
```

**Pilihan:**
A. `3` dan `2`
B. `3` dan `3`
C. `2` dan `2`
D. `error: Promise.allSettled is not a function`

**Jawaban: A**
**Penjelasan:** `Promise.allSettled` mengembalikan array semua hasil (3 promise = 3 hasil). Filter `'fulfilled'` mengembalikan 2 (promise1 dan promise2), promise3 `rejected`.

---

**Soal 3:**
```sql
-- Tabel: products (id, name, price, category_id, created_at)
-- Tabel: categories (id, name)
--
-- Query berikut ingin menampilkan nama produk, harga, dan nama kategori
-- HANYA untuk produk dengan harga di atas rata-rata.

-- Manakah query yang benar?

-- A.
SELECT p.name, p.price, c.name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.price > AVG(p.price);

-- B.
SELECT p.name, p.price, c.name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.price > (SELECT AVG(price) FROM products);

-- C.
SELECT p.name, p.price, c.name
FROM products p, categories c
WHERE p.category_id = c.id AND p.price > AVG(price);

-- D.
SELECT p.name, p.price, c.name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
HAVING p.price > AVG(p.price);
```

**Jawaban: B**
**Penjelasan:** Subquery `(SELECT AVG(price) FROM products)` menghitung rata-rata harga. Opsi A & C salah karena `AVG()` tidak bisa digunakan langsung di `WHERE`. Opsi D salah karena `HAVING` untuk filter setelah `GROUP BY`.

---

**Soal 4:**
```typescript
// Diberikan kode Express.js berikut. Apa masalah keamanan utamanya?

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  db.query(query, (err, result) => {
    if (result.length > 0) {
      const token = jwt.sign({ id: result[0].id }, process.env.JWT_SECRET);
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});
```

**Pilihan:**
A. Tidak ada error handling
B. SQL Injection — input langsung digabung ke query
C. JWT secret tidak aman
D. Password disimpan dalam bentuk plain text

**Jawaban: B**
**Penjelasan:** Input `username` dan `password` langsung dimasukkan ke string query tanpa sanitasi. Ini SQL Injection klasik. Solusi: gunakan parameterized query (`?` placeholder). Untuk keamanan tambahan: hash password dengan bcrypt.

---

**Soal 5:**
```typescript
// Dalam React, apa perbedaan utama antara useEffect dengan dependency array
// kosong `[]` dibanding tanpa dependency array?

// A.
useEffect(() => {
  console.log('efek jalan');
}, []);  // Case 1

// B.
useEffect(() => {
  console.log('efek jalan');
});     // Case 2
```

**Pilihan:**
A. Case 1 jalan sekali (mount), Case 2 jalan setiap render
B. Case 1 jalan setiap render, Case 2 jalan sekali (mount)
C. Case 1 dan 2 sama-sama jalan sekali
D. Case 1 error, Case 2 jalan terus

**Jawaban: A**
**Penjelasan:** Dependency array `[]` berarti efek hanya berjalan sekali saat komponen mount. Tanpa dependency array, efek berjalan setiap kali komponen re-render. Ini adalah fundamental React Hooks yang sering ditanyakan di sertifikasi.

#### Soal Essay (2 Soal)

**Soal 6 (15 poin):**
Jelaskan arsitektur aplikasi full-stack: frontend (React), backend (Express), database (PostgreSQL). Gambarkan alur request dari user klik tombol sampai data muncul di layar. Sebutkan 3 potensi bottleneck dan cara mengatasinya.

**Rubrik Jawaban:**
- [5] Diagram/penjelasan alur lengkap: User → React → Fetch API → Express → PostgreSQL → Response → Render
- [5] 3 bottleneck: network latency, database query lambat, render blocking
- [5] Solusi: caching, indexing, lazy loading, pagination

**Soal 7 (15 poin):**
Buat desain database untuk sistem manajemen tugas dengan fitur: user memiliki banyak tugas, tugas memiliki kategori, tugas bisa diassign ke user lain, dan user bisa memberi komentar. Sertakan:

1. Entity Relationship Diagram (text-based)
2. SQL schema untuk 4+ tabel
3. 3 query contoh dengan JOIN

**Contoh Jawaban:**
```sql
-- ERD:
-- Users --< Tasks --< Comments
-- Categories --< Tasks
-- Tasks >-- Users (assigned_to)

-- Schema:
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  user_id INTEGER REFERENCES users(id),
  assigned_to INTEGER REFERENCES users(id),
  category_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Track: AI Agent Developer (L3)

**Soal 8:**
```typescript
// Diberikan kode Mastra agent berikut. Identifikasi 3 masalah
// dan berikan perbaikannya.

import { Agent } from '@mastra/core';
import { z } from 'zod';

const weatherAgent = new Agent({
  name: 'weather-agent',
  instructions: 'Kamu adalah asisten cuaca',
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-3.5-turbo',
  },
  tools: {
    getWeather: {
      description: 'Mendapatkan cuaca',
      parameters: z.object({
        city: z.string(),
      }),
      execute: async ({ city }) => {
        const res = await fetch(
          `https://api.weather.com/${city}`
        );
        return res.json();
      },
    },
  },
});
```

**Masalah & Perbaikan:**
1. **Model outdated** — `gpt-3.5-turbo` sudah deprecated. Ganti ke `gpt-4o` atau `claude-sonnet-4`
2. **No error handling** — `execute` tidak punya try-catch. Tambah error handling.
3. **No API key** — Tidak ada konfigurasi API key. Harus dari environment variable.
4. **No fallback model** — Jika model utama down, tidak ada cadangan. Tambah fallback.

```typescript
// Perbaikan:
const weatherAgent = new Agent({
  name: 'weather-agent',
  instructions: `Kamu adalah asisten cuaca yang membantu.
  - Gunakan tools untuk mendapatkan data cuaca real-time
  - Jika tool error, beri tahu user dengan jelas
  - Konversi suhu ke Celsius untuk pengguna Indonesia`,
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
  },
  onError: {
    fallbackModel: {
      provider: 'ANTHROPIC',
      name: 'claude-sonnet-4-20250514',
    },
  },
  tools: {
    getWeather: {
      description: 'Mendapatkan data cuaca untuk kota tertentu',
      parameters: z.object({
        city: z.string().min(1, 'Nama kota wajib diisi'),
      }),
      execute: async ({ city }) => {
        try {
          const apiKey = process.env.WEATHER_API_KEY;
          const res = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`
          );
          if (!res.ok) throw new Error(`API error: ${res.status}`);
          return await res.json();
        } catch (error) {
          return {
            error: true,
            message: `Gagal mendapatkan cuaca untuk ${city}: ${error.message}`,
          };
        }
      },
    },
  },
});
```

**Soal 9:**
```typescript
// Implementasikan agent RAG sederhana yang bisa menjawab pertanyaan
// berdasarkan dokumen yang diupload. Gunakan Mastra + Turso (LibSQL).

// Jawaban:
import { Agent } from '@mastra/core';
import { createLibSQLStore } from '@mastra/store-libsql';
import { z } from 'zod';

// 1. Setup vector store untuk RAG
const vectorStore = createLibSQLStore({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// 2. Function untuk indexing dokumen
async function indexDocument(content: string, metadata: Record<string, any>) {
  const chunks = chunkText(content, 500); // 500 karakter per chunk
  for (const chunk of chunks) {
    await vectorStore.upsert({
      id: crypto.randomUUID(),
      vector: await generateEmbedding(chunk),
      metadata: { ...metadata, content: chunk },
    });
  }
}

// 3. Helper: chunking teks
function chunkText(text: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

// 4. Helper: embedding (gunakan OpenAI embedding API)
async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small',
    }),
  });
  const data = await res.json();
  return data.data[0].embedding;
}

// 5. RAG Agent
const ragAgent = new Agent({
  name: 'rag-assistant',
  instructions: `Kamu adalah asisten yang menjawab berdasarkan dokumen.
  Gunakan context yang diberikan untuk menjawab pertanyaan.
  Jika jawaban tidak ditemukan di context, katakan tidak tahu.`,
  model: { provider: 'OPEN_AI', name: 'gpt-4o' },
  tools: {
    searchDocuments: {
      description: 'Cari informasi dari database dokumen',
      parameters: z.object({
        query: z.string().describe('Pertanyaan atau kata kunci'),
      }),
      execute: async ({ query }) => {
        const queryEmbedding = await generateEmbedding(query);
        const results = await vectorStore.query({
          vector: queryEmbedding,
          topK: 3,
        });
        return results.map(r => ({
          content: r.metadata.content,
          source: r.metadata.source,
          score: r.score,
        }));
      },
    },
  },
});
```

---

## 4. Rubrik Penilaian Proyek & Grading Criteria Detail

### Rubrik Penilaian Proyek (100 Poin)

| Kriteria | Bobot | 0 (Kurang) | 1 (Cukup) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-------|-------------|-----------|----------|-----------------|
| **Fungsionalitas** | 30% | <30% fitur jalan | 30-50% fitur | 50-80% fitur | Semua fitur + bonus |
| **Kualitas Kode** | 20% | Spaghetti, no structure | Structured tapi campur aduk | Modular, clean code | Design patterns, DRY, SOLID |
| **Database Design** | 15% | 1 tabel, no relation | 2 tabel, relasi dasar | Normalized (3NF), index | Migration, seeding, query optimized |
| **Keamanan** | 10% | SQL injection risk | Prepared statement | + Input validation | + Rate limit, CORS, helmet |
| **UI/UX** | 10% | Tidak responsive | Responsive dasar | Good UX, loading state | Animasi, error friendly, aksesibel |
| **Dokumentasi** | 10% | No README | README minimal | README lengkap + API docs | + Screenshots, deployment guide |
| **Testing** | 5% | No tests | 1-2 unit test | Coverage >50% | Integration + E2E |

### Konversi Skor ke Grade

| Rentang Nilai | Grade | Keterangan | Tindak Lanjut |
|---------------|-------|------------|---------------|
| 90-100 | A (Sangat Baik) | Lulus dengan pujian | Sertifikat + rekomendasi industri |
| 80-89 | B (Baik) | Lulus | Sertifikat |
| 70-79 | C (Cukup) | Lulus bersyarat | Review area lemah |
| 60-69 | D (Kurang) | Tidak lulus | Ulang dalam 30 hari |
| <60 | E (Sangat Kurang) | Tidak lulus | Ulang modul yang gagal |

### Kriteria Penilaian Spesifik per Level

#### L1 — Fundamental
| Aspek | Minimal | Target Ideal |
|-------|---------|-------------|
| Halaman web responsive | ✅ Bisa dilihat di mobile | ✅ Mobile-first, semua elemen rapi |
| Git workflow | ✅ Init, add, commit, push | ✅ Branching, commit message baik |
| REST API | ✅ 2 endpoint CRUD | ✅ 4+ endpoint, error handling |
| Dokumentasi | ✅ README ada | ✅ README + API docs |
| Keamanan | ✅ Prepared statement | ✅ + validasi input Zod |

#### L2 — Intermediate
| Aspek | Minimal | Target Ideal |
|-------|---------|-------------|
| TypeScript | ✅ Tipe dasar | ✅ Generic, utility types |
| React | ✅ 3 komponen | ✅ Custom hooks, context |
| Database | ✅ 3 tabel | ✅ Index, migration, seed |
| Auth JWT | ✅ Login/logout | ✅ Refresh token, role-based |
| AI Agent | ✅ 1 agent | ✅ 2+ tools, memory |

#### L3 — Advanced
| Aspek | Minimal | Target Ideal |
|-------|---------|-------------|
| System Design | ✅ Diagram arsitektur | ✅ Trade-off analysis |
| RAG Pipeline | ✅ Basic retrieval | ✅ Chunking + reranking |
| Multi-agent | ✅ 2 agents | ✅ Workflow orchestration |
| Testing | ✅ Unit test | ✅ Integration + E2E |
| DevOps | ✅ Deploy | ✅ CI/CD + monitoring |

---

## 5. Panduan Penilaian Portofolio

### Kriteria Portofolio

Portofolio dinilai berdasarkan dokumen [`03-portfolio-proyek.md`](./03-portfolio-proyek.md). Asesor akan mengevaluasi:

### A. Kelengkapan Proyek (40%)

| Aspek | Check | Bobot |
|-------|-------|-------|
| README lengkap (deskripsi, fitur, tech stack, instalasi) | ☐ | 10% |
| Kode terstruktur rapi (folder, naming, modular) | ☐ | 10% |
| Fitur berfungsi sesuai spesifikasi | ☐ | 15% |
| Dokumentasi API (jika backend) | ☐ | 5% |

### B. Kualitas Kode (30%)

| Aspek | Check | Bobot |
|-------|-------|-------|
| TypeScript (tipe strict, interface digunakan) | ☐ | 8% |
| Error handling (try-catch, error boundary) | ☐ | 7% |
| Security (prepared statement, validasi) | ☐ | 8% |
| Code consistency (ESLint, Prettier) | ☐ | 7% |

### C. Inovasi & Kompleksitas (20%)

| Aspek | Check | Bobot |
|-------|-------|-------|
| Fitur di luar minimal requirement | ☐ | 10% |
| Penggunaan teknologi tambahan | ☐ | 5% |
| Problem solving approach | ☐ | 5% |

### D. Presentasi & Demo (10%)

| Aspek | Check | Bobot |
|-------|-------|-------|
| Demo berjalan lancar | ☐ | 5% |
| Bisa menjelaskan keputusan teknis | ☐ | 5% |

### Template Self-Assessment Portofolio

Gunakan template ini untuk self-assessment sebelum submit:

```typescript
interface PortfolioProject {
  name: string;
  description: string;
  techStack: string[];
  level: 'L1' | 'L2' | 'L3';
  
  // Assessment fields — isi dengan jujur
  assessment: {
    functionality: 0 | 1 | 2 | 3;  // 0-3
    codeQuality: 0 | 1 | 2 | 3;
    databaseDesign: 0 | 1 | 2 | 3;
    security: 0 | 1 | 2 | 3;
    uiUx: 0 | 1 | 2 | 3;
    documentation: 0 | 1 | 2 | 3;
    testing: 0 | 1 | 2 | 3;
  };
  
  // Hitung skor otomatis
  getScore(): number {
    const weights = {
      functionality: 0.30,
      codeQuality: 0.20,
      databaseDesign: 0.15,
      security: 0.10,
      uiUx: 0.10,
      documentation: 0.10,
      testing: 0.05,
    };
    
    let total = 0;
    for (const [key, weight] of Object.entries(weights)) {
      total += this.assessment[key as keyof typeof this.assessment] * weight * (100/3);
    }
    return Math.round(total);
  }
  
  getGrade(): string {
    const score = this.getScore();
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
  }
}

// Contoh penggunaan:
const myProject = new PortfolioProject();
myProject.name = 'AI Task Manager';
myProject.description = 'Aplikasi manajemen tugas dengan AI agent';
myProject.techStack = ['React', 'Express', 'PostgreSQL', 'Mastra AI'];
myProject.level = 'L2';
myProject.assessment = {
  functionality: 3,
  codeQuality: 2,
  databaseDesign: 2,
  security: 2,
  uiUx: 2,
  documentation: 2,
  testing: 1,
};
console.log(`Skor: ${myProject.getScore()}/100`);
console.log(`Grade: ${myProject.getGrade()}`);
```

---

## 6. Proses Perpanjangan Sertifikasi (Renewal)

### Masa Berlaku

| Level | Masa Berlaku | Biaya Renewal |
|-------|-------------|---------------|
| L1 — Fundamental | 2 tahun | Rp 300.000 |
| L2 — Intermediate | 3 tahun | Rp 500.000 |
| L3 — Advanced | 3 tahun | Rp 750.000 |

### Syarat Renewal

Untuk memperpanjang sertifikasi, peserta harus:

1. **Mengisi Form Renewal** — Konfirmasi masih aktif di bidang TI
2. **Membayar Biaya** — Sesuai level
3. **Submit Portofolio Terbaru** — Minimal 1 proyek baru dalam 2 tahun terakhir
4. **Self-Assessment** — Evaluasi kompetensi terkini

### Jalur Renewal

**Jalur A: Renewal Langsung** (tanpa uji ulang)
- Syarat: Masih aktif bekerja/belajar di bidang TI
- Melampirkan: CV terbaru + 1 proyek portofolio
- Biaya: 50% dari biaya sertifikasi awal
- Proses: 7 hari kerja

**Jalur B: Uji Ulang** (jika tidak memenuhi Jalur A)
- Syarat: Tidak ada proyek terbaru atau gap >2 tahun
- Melampirkan: Dokumen administrasi
- Biaya: 75% dari biaya sertifikasi awal
- Proses: 1 hari (teori + praktik singkat)

**Jalur C: Upgrade Level** (L1 → L2, L2 → L3)
- Syarat: Sertifikasi level sebelumnya masih berlaku
- Biaya: 100% biaya level tujuan (dikurangi biaya renewal)
- Proses: Uji penuh sesuai level tujuan
- Benefit: Masa berlaku baru 3 tahun dari tanggal lulus

### Timeline Renewal

| Waktu | Aktivitas |
|-------|-----------|
| H-90 | Notifikasi email: sertifikasi akan habis |
| H-60 | Pengingat: urus renewal |
| H-30 | Pengingat akhir: deadline |
| H-0 | Sertifikasi kadaluarsa |
| H+30 | Grace period (masih bisa renewal) |
| H+31 | Sertifikasi non-aktif — harus uji ulang penuh |

### Contoh Form Renewal

```typescript
interface RenewalForm {
  personalInfo: {
    fullName: string;
    email: string;
    certificateNumber: string;
    level: 'L1' | 'L2' | 'L3';
    issueDate: string;
    expiryDate: string;
  };
  
  currentStatus: {
    employment: 'active' | 'student' | 'freelance' | 'unemployed' | 'other';
    company?: string;
    position?: string;
    yearsOfExperience: number;
  };
  
  portfolioUpdate: {
    hasNewProject: boolean;
    projectCount: number;
    latestProjectUrl?: string;
    techStackUsed: string[];
  };
  
  selfAssessment: {
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    areasForImprovement: string[];
    trainingCompleted: string[];
  };
  
  selectRenewalPath(): 'A' | 'B' | 'C' {
    if (this.portfolioUpdate.hasNewProject && this.currentStatus.employment !== 'unemployed') {
      return 'A';  // Jalur langsung
    }
    if (this.portfolioUpdate.projectCount === 0) {
      return 'B';  // Jalur uji ulang
    }
    return 'C';  // Jalur upgrade (jika mau naik level)
  }
}
```

---

## 7. Pemetaan Recognition Industri

### Sertifikasi RPL vs Sertifikasi Industri

| Level RPL | Setara BNSP/LSP | Setara Vendor | Setara Internasional |
|-----------|----------------|---------------|----------------------|
| **L1** | Junior Programmer (KKNI II-III) | Dicoding: Belajar Dasar Pemrograman | CompTIA IT Fundamentals |
| **L2** | Web Developer (KKNI III-IV) | Meta Front-End/Back-End Developer | AWS Certified Developer — Associate |
| **L3** | Senior Programmer (KKNI IV-V) | Google Cloud Engineer / AI | Oracle Certified Professional |

### Skill Mapping ke Kebutuhan Industri

| Skill | Industri | Level RPL | Modul Terkait |
|-------|----------|-----------|---------------|
| JavaScript/TypeScript | Semua perusahaan teknologi | L1-L2 | [`../01-js-fundamentals/`](../01-js-fundamentals/), [`../03-typescript/`](../03-typescript/) |
| React/Next.js | Startup & enterprise frontend | L2 | [`../20-frontend-frameworks/`](../20-frontend-frameworks/) |
| Node.js/Express | Backend API development | L2 | [`../06-node-express/`](../06-node-express/) |
| PostgreSQL | Database management | L2 | [`../06-node-express/03-database.md`](../06-node-express/03-database.md) |
| Docker & Cloud | DevOps & deployment | L2 (opsional) | [`../21-docker/`](../21-docker/), [`../29-cloud-computing/`](../29-cloud-computing/) |
| AI Agent & RAG | AI Engineer | L3 | [`../07-mastra-ai/`](../07-mastra-ai/) |
| System Design | Senior/Lead Engineer | L3 | [`../11-system-design/`](../11-system-design/) |
| Testing & CI/CD | Quality assurance | L2-L3 | [`../09-testing/`](../09-testing/) |

### Perusahaan yang Mengakui Sertifikasi RPL

| Kategori | Contoh Perusahaan |
|----------|-------------------|
| **Enterprise** | Telkom Indonesia, Bank Mandiri, Pertamina, PLN |
| **Tech Startup** | Gojek, Tokopedia, Bukalapak, Traveloka, Ruangguru |
| **EdTech** | Dicoding, Skill Academy, Progate, Codepolitan |
| **Consulting** | Accenture, IBM Indonesia, Deloitte |
| **Government** | Kominfo, BKN, Lembaga Pemerintah (via BNSP) |

### Credit Transfer & Pathways

| Dari | Ke | Kredit |
|------|----|--------|
| L1 RPL | Dicoding — Belajar Dasar Web | Diakui 70% |
| L2 RPL | Amazon AWS Academy | Diakui 60% |
| L3 RPL | Google Cloud Skills Boost | Diakui 50% |
| L2 RPL | S1 Sistem Informasi (RPL) | 10-20 SKS |
| L3 RPL | S2 Teknik Informatika (RPL) | Pertimbangan khusus |

---

## 8. Latihan Praktik dalam Kode (Practice Exam)

### Latihan 1: Implementasi REST API dengan TypeScript

Buat REST API untuk manajemen buku perpustakaan dengan fitur:

```typescript
// TODO: Lengkapi implementasi berikut

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  isAvailable: boolean;
}

interface CreateBookDTO {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
}

// 1. Buat class BookService dengan method:
//    - getAll(): Book[]
//    - getById(id: string): Book | null
//    - create(dto: CreateBookDTO): Book
//    - update(id: string, dto: Partial<CreateBookDTO>): Book
//    - delete(id: string): boolean
//    - search(query: string): Book[]

class BookService {
  private books: Book[] = [];
  
  // TODO: Implementasi method getAll
  getAll(): Book[] {
    // Kode kamu di sini
    return [];
  }
  
  // TODO: Implementasi method create dengan validasi
  create(dto: CreateBookDTO): Book {
    // Validasi:
    // - title minimal 3 karakter
    // - author minimal 3 karakter
    // - isbn harus 13 digit angka
    // - publishedYear tidak boleh di masa depan
    // - isAvailable default true
    
    // Kode kamu di sini
    throw new Error('Not implemented');
  }
  
  // TODO: Implementasi search (case-insensitive, cari di title & author)
  search(query: string): Book[] {
    // Kode kamu di sini
    return [];
  }
}

// 2. Export Express router untuk endpoints
//    GET    /api/books
//    GET    /api/books/:id
//    POST   /api/books
//    PUT    /api/books/:id
//    DELETE /api/books/:id
//    GET    /api/books/search?q=xxx
```

### Latihan 2: Validasi Input dengan Zod

```typescript
import { z } from 'zod';

// TODO: Buat schema validasi untuk form registrasi user
// Field yang diperlukan:
// - name: string, min 3, max 100
// - email: string, valid email format
// - password: string, min 8, harus ada 1 huruf besar, 1 angka
// - age: number, min 13, max 120
// - agreeToTerms: boolean, harus true

const registerSchema = z.object({
  // Kode kamu di sini
});

// TODO: Buat schema untuk update profile (semua field opsional)
const updateProfileSchema = z.object({
  // Kode kamu di sini
});

// TODO: Implementasi handler dengan error messages Bahasa Indonesia
function validateRegister(data: unknown) {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    // Kode kamu: mapping error messages ke Bahasa Indonesia
    // Contoh: "Name is required" → "Nama wajib diisi"
  }
  return result;
}
```

### Latihan 3: AI Agent dengan System Prompt

```typescript
import { Agent } from '@mastra/core';
import { z } from 'zod';

// TODO: Buat AI Agent yang bertindak sebagai mentor coding
// yang bisa menjawab pertanyaan JavaScript/TypeScript

const mentorAgent = new Agent({
  name: 'code-mentor',
  instructions: `
    Kamu adalah mentor coding yang ramah dan sabar.
    
    Aturan:
    - Jawab dalam Bahasa Indonesia
    - Berikan contoh kode jika relevan
    - Jika user bertanya di luar programming, arahkan kembali
    - Jika tidak tahu, akui dengan jujur
    
    TODO: Tambahkan aturan berikut:
    1. Jangan berikan jawaban langsung untuk soal coding challenge
    2. Berikan hints dan guiding questions dulu
    3. Gunakan analogi dunia nyata
    4. Referensikan modul RPL curriculum jika relevan
  `,
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o',
  },
  tools: {
    // TODO: Tambahkan tools:
    // 1. searchDocs: mencari dokumentasi JavaScript dari MDN
    // 2. runCode: menjalankan kode JavaScript di sandbox
    // 3. suggestResources: merekomendasikan modul RPL
  },
});
```

### Latihan 4: React Custom Hook

```typescript
import { useState, useEffect, useCallback } from 'react';

// TODO: Buat custom hook useApi untuk fetch data
// dengan fitur:
// - Loading state
// - Error state
// - Data state
// - Retry function
// - Cache (jika data sudah pernah di-fetch, jangan fetch ulang)

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retry: () => void;
}

function useApi<T>(url: string): UseApiResult<T> {
  // Kode kamu di sini
  return {
    data: null,
    loading: false,
    error: null,
    retry: () => {},
  };
}

// TODO: Buat component yang menggunakan useApi untuk menampilkan daftar user
// function UserList() {
//   const { data, loading, error, retry } = useApi<User[]>('/api/users');
//   // Kode kamu di sini
// }
```

### Latihan 5: Database Migration Script

```typescript
// TODO: Buat migration script untuk membuat tabel e-commerce

interface Migration {
  up: string;    // SQL untuk migrasi naik
  down: string;  // SQL untuk rollback
}

// Migration 1: Membuat tabel users
const createUsersTable: Migration = {
  up: `
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    TODO: Tambahkan index untuk email
    -- CREATE INDEX ...
  `,
  down: `DROP TABLE IF EXISTS users;`,
};

// Migration 2: Membuat tabel products
const createProductsTable: Migration = {
  up: `
    TODO: Buat tabel products dengan kolom:
    - id (SERIAL PRIMARY KEY)
    - name (VARCHAR 200 NOT NULL)
    - description (TEXT)
    - price (DECIMAL 10,2 NOT NULL)
    - stock (INTEGER DEFAULT 0)
    - category_id (INTEGER REFERENCES categories)
    - image_url (VARCHAR 500)
    - is_active (BOOLEAN DEFAULT true)
    - created_at, updated_at (TIMESTAMP)
    
    -- Kode SQL kamu di sini
  `,
  down: `DROP TABLE IF EXISTS products;`,
};

// TODO: Buat fungsi migrator sederhana
async function runMigrations(migrations: Migration[]) {
  // for (const migration of migrations) {
  //   await pool.query(migration.up);
  //   console.log('Migration berhasil:', ...);
  // }
}
```

### Latihan 6: Implementasi JWT Auth Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// TODO: Buat middleware autentikasi JWT

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'user' | 'admin';
  };
}

function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  // 1. Ambil token dari header Authorization (format: "Bearer <token>")
  // 2. Jika tidak ada token → return 401
  // 3. Verify token dengan JWT_SECRET
  // 4. Jika token invalid/expired → return 401
  // 5. Set req.user dengan payload token
  // 6. Panggil next()
  
  // Kode kamu di sini
}

// TODO: Buat middleware authorization (role-based)
function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Cek req.user.role
    // 2. Jika role tidak sesuai → return 403
    // 3. Panggil next()
    
    // Kode kamu di sini
  };
}

// TODO: Export middleware
export { authenticate, authorize };
export type { AuthRequest };
```

### Kunci Jawaban Latihan

Kunci jawaban untuk semua latihan di atas tersedia di direktori:
- [`../quiz/`](../quiz/) — Kumpulan soal & jawaban
- [`../exercises/`](../exercises/) — Latihan coding interaktif
- [`../challenges/`](../challenges/) — Coding challenge mingguan

---

## 9. Referensi Lengkap

### Dokumen Sertifikasi
- [Overview Jalur Sertifikasi](./01-overview-jalur-sertifikasi.md)
- [Strategi Persiapan](./02-strategi-persiapan.md)
- [Portofolio & Proyek](./03-portfolio-proyek.md)
- [Simulasi Ujian](./04-simulasi-ujian.md)

### Modul Pendukung
- [Fundamental — Internet & HTTP](../00-fundamentals/)
- [JavaScript Fundamentals](../01-js-fundamentals/)
- [Algorithms & Data Structures](../02-algorithms-data-structures/)
- [TypeScript Basics](../03-typescript/)
- [Web Basics (HTML/CSS/Tailwind)](../04-web-basics/)
- [Git & GitHub](../05-git-deploy/)
- [Node.js & Express](../06-node-express/)
- [Mastra AI Framework](../07-mastra-ai/)
- [Testing](../09-testing/)
- [Docker](../21-docker/)
- [System Design](../11-system-design/)
- [Security](../14-cybersecurity/)
- [Production Ready Code](../49-production-ready-code/)

### Link Eksternal
- [BNSP — Badan Nasional Sertifikasi Profesi](https://bnsp.go.id)
- [LSP Teknologi Informasi](https://lspti.or.id)
- [KKNI — Kerangka Kualifikasi Nasional](https://kkni.go.id)
- [Dicoding Sertifikasi](https://www.dicoding.com/sertifikasi)
- [AWS Certification](https://aws.amazon.com/certification/)
- [Google Cloud Certification](https://cloud.google.com/certification)

---

## 10. FAQ Sertifikasi

**Q: Apakah sertifikasi RPL diakui perusahaan?**
A: Sertifikasi RPL AI Curriculum mengacu pada standar BNSP/LSP dan kurikulum industri. Beberapa perusahaan partner memberikan prioritas pada pemegang sertifikasi.

**Q: Berapa kali bisa uji ulang?**
A: Tidak ada batasan. Interval minimal 30 hari antar uji ulang. Biaya uji ulang 50% dari biaya awal.

**Q: Apakah sertifikasi bisa diupgrade level?**
A: Ya. Jalur C (Upgrade Level) memungkinkan L1 → L2 → L3. Setiap upgrade memerlukan uji penuh sesuai level tujuan.

**Q: Bagaimana jika sertifikasi hilang?**
A: Cetak ulang dikenakan biaya Rp 100.000. Sertifikat digital (PDF) selalu tersedia di portal peserta.

**Q: Apakah ada sertifikasi online?**
A: Ya. Ujian teori online via platform. Ujian praktik bisa onsite atau online dengan pengawasan proktor.

---

> **💡 Tips Terakhir:** Sertifikasi adalah bukti perjalanan, bukan tujuan akhir. Fokus pada kompetensi nyata, dan sertifikat akan mengikuti.

| 📧 | [Kontak Sertifikasi](mailto:sertifikasi@rpl-ai-curriculum.id) |
|----|--------------------------------------------------------------|
| 💬 | [Discord RPL AI](https://discord.gg/rpl-ai) |
| 📖 | [Kurikulum Lengkap](../README.md) |
