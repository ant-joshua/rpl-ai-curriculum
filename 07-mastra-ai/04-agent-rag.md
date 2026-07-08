# Sesi 4: Agent RAG (Retrieval-Augmented Generation)

> **Durasi:** 2 sesi (120 menit)
> **Tujuan:** Paham konsep RAG, bisa implementasi vector embeddings, knowledge base, semantic search

---

## 1. Konsep RAG

### Masalah: LLM Punya Batas Pengetahuan

LLM cuma tau data sampe **tanggal training**-nya. Contoh:

```typescript
const agent = new Agent({
  id: 'bertanya',
  name: 'Si Tanya',
  instructions: 'Jawab berdasarkan pengetahuanmu',
  model: 'openai/gpt-4.1-nano',
});

await agent.generate(
  'Apa isi dokumen kebijakan sekolah kita?'
);
// ❌ Gak tau — itu dokumen internal!
```

### Solusi: RAG

RAG = **R**etrieval-**A**ugmented **G**eneration

Cara kerja:
1. **Load** dokumen (PDF, TXT, MD, dll)
2. **Chunk** dokumen jadi potongan kecil
3. **Embed** tiap chunk jadi vector (angka-angka)
4. **Simpan** di vector store (database khusus)
5. **Search** pas user nanya — cari chunk yang relevan
6. **Inject** chunk itu ke prompt agent

```
Flow:
Dokumen → Chunks → Embeddings → Vector Store
                                    ↑
User Question → Embed → Search → Cocokin → Inject ke Prompt → Agent Jawab
```

### Kenapa RAG penting buat SMK?

- **Dokumen sekolah**: Tata tertib, kurikulum, jadwal
- **Materi ajar**: Modul, catatan guru, buku referensi
- **Data internal**: Nilai siswa, inventaris lab
- **Kebijakan**: SOP, aturan praktikum

---

## 2. Vector Embeddings

Embedding = cara ngubah teks jadi **angka-angka** (vector) yang mewakili **makna** teks.

```
"Cuaca panas" → [0.12, -0.45, 0.78, ..., 0.33]  (1536 angka)
"Hari ini cerah" → [0.15, -0.42, 0.80, ..., 0.30]  (mirip!)
"Belajar coding" → [-0.5, 0.3, -0.1, ..., 0.6]  (beda!)
```

**Semantic Search**: Cari berdasarkan makna, bukan keyword doang.

### Install Vector Dependencies

```bash
npm install @mastra/core @mastra/vector-store @mastra/embeddings openai
```

Atau pake provider embedding lain:

```bash
npm install @mastra/embeddings-covector
```

---

## 3. Membuat Knowledge Base

### Struktur Knowledge Base di Mastra

```typescript
import { Document } from '@mastra/core/document';
import { KnowledgeBase } from '@mastra/core/knowledge';
import { VectorStore } from '@mastra/vector-store';

// Pseudo-code — implementasi tergantung provider vector store
const kb = new KnowledgeBase({
  name: 'pengetahuan-sekolah',
  vectorStore: new VectorStore(...),
  embeddingModel: 'openai/text-embedding-3-small',
});
```

### Contoh: Load Dokumen dari File

Karena Mastra v1 masih berkembang, kita pake pendekatan praktis:

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Simulasi vector store — di production pake database beneran
const vectorStore: Array<{
  id: string;
  content: string;
  metadata: Record<string, string>;
}> = [];

// 1. Load dokumen
function loadDocuments(directory: string) {
  const files = fs.readdirSync(directory).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(directory, file), 'utf-8');
    const chunks = chunkText(content, 500); // 500 karakter per chunk
    chunks.forEach((chunk, i) => {
      vectorStore.push({
        id: `${file}-${i}`,
        content: chunk,
        metadata: { source: file },
      });
    });
  }
  console.log(`Loaded ${vectorStore.length} chunks dari ${files.length} file`);
}

// 2. Chunking sederhana
function chunkText(text: string, maxLength: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLength && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += ' ' + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// 3. Semantic search (keyword-based untuk simulasi)
function searchSimilar(query: string, topK = 3): typeof vectorStore {
  const keywords = query.toLowerCase().split(' ');
  const scored = vectorStore.map(doc => ({
    doc,
    score: keywords.filter(k => doc.content.toLowerCase().includes(k)).length,
  }));
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.doc);
}

export { loadDocuments, searchSimilar, vectorStore };
```

---

## 4. RAG Tool untuk Agent

### RAG Search Tool

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { searchSimilar } from '../lib/rag-store';

const ragSearchTool = createTool({
  id: 'cari-dokumen',
  description: 'Cari informasi dari database dokumen internal (pengetahuan sekolah)',
  inputSchema: z.object({
    query: z.string().describe('Pertanyaan atau kata kunci pencarian'),
  }),
  execute: async ({ query }) => {
    const results = searchSimilar(query, 5);
    if (results.length === 0) {
      return { output: 'Tidak ada dokumen yang relevan.' };
    }
    const context = results
      .map(r => `[${r.metadata.source}]: ${r.content}`)
      .join('\n\n---\n\n');
    return {
      output: `Ditemukan ${results.length} dokumen relevan:\n\n${context}`,
    };
  },
});
```

### Agent dengan RAG

```typescript
import { Agent } from '@mastra/core/agent';

// Load dokumen dulu
loadDocuments('./documents');

const ragAgent = new Agent({
  id: 'rag-agent',
  name: 'Knowledge Assistant',
  instructions: `Kamu asisten yang punya akses ke database dokumen internal.
    - Kalo ditanya tentang informasi spesifik, pake cari-dokumen tool
    - Jawab berdasarkan konteks dari dokumen
    - Kalo gak nemu, bilang gak tau — jangan ngasal
    - Jawab dalam Bahasa Indonesia`,
  model: 'openai/gpt-4.1-nano',
  tools: { ragSearchTool },
});

async function test() {
  const resp = await ragAgent.generate(
    'Apa isi dokumen tentang tata tertib?'
  );
  console.log(resp.text);
}

test();
```

---

## 5. Full RAG Pipeline

```typescript
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// ==== STEP 1: Vector Store (sederhana) ====
interface Chunk {
  id: string;
  content: string;
  source: string;
}

const store: Chunk[] = [];

// ==== STEP 2: Ingest Dokumen ====
function ingestFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const name = path.basename(filePath);
  const chunks = content
    .split('\n\n')    // Split by paragraph
    .filter(c => c.trim().length > 50) // Skip kecil
    .map((c, i) => ({
      id: `${name}-${i}`,
      content: c.trim(),
      source: name,
    }));
  store.push(...chunks);
  console.log(`Ingested ${chunks.length} chunks dari ${name}`);
}

// ==== STEP 3: Search ====
function semanticSearch(query: string, topK = 3): Chunk[] {
  const q = query.toLowerCase();
  const scored = store.map(chunk => ({
    chunk,
    score: (chunk.content.toLowerCase().match(new RegExp(q, 'g')) || []).length,
  }));
  return scored.sort((a, b) => b.score - a.score).slice(0, topK).map(s => s.chunk);
}

// ==== STEP 4: RAG Tool ====
const cariTool = createTool({
  id: 'cari-pengetahuan',
  description: 'Cari informasi dari database pengetahuan internal',
  inputSchema: z.object({
    query: z.string(),
  }),
  execute: async ({ query }) => {
    const hasil = semanticSearch(query);
    if (!hasil.length) return { output: 'Tidak ditemukan.' };
    return {
      output: hasil.map(h => `[${h.source}]: ${h.content}`).join('\n\n'),
    };
  },
});

// ==== STEP 5: Agent ====
const knowledgeAgent = new Agent({
  id: 'knowledge-agent',
  name: 'Knowledge Base AI',
  instructions: `Kamu asisten yang menjawab berdasarkan dokumen internal.
    - Selalu pake cari-pengetahuan tool sebelum jawab
    - Kutip sumber dokumen di jawaban
    - Kalo gak yakin, bilang "berdasarkan dokumen yang saya punya..."`,
  model: 'openai/gpt-4.1-nano',
  tools: { cariTool },
});

// ==== STEP 6: Jalankan ====
async function main() {
  // Ingest semua file md di folder documents
  const dir = './documents';
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .forEach(f => ingestFile(path.join(dir, f)));
  }

  const resp = await knowledgeAgent.generate(
    'Jelaskan tentang prosedur praktikum RPL'
  );
  console.log(resp.text);
}

main();
```

---

## 6. RAG Best Practices

| Praktik | Kenapa |
|---------|--------|
| **Chunk size** 500-1000 karakter | Terlalu kecil = konteks hilang, terlalu besar = noise |
| **Overlap chunk** 50-100 karakter | Biar konteks antar chunk nyambung |
| **Top-K** 3-5 chunk | Cukup buat jawab tanpa overload |
| **Source tracking** | Biar agent bisa citation |
| **Pre-processing** | Bersihin dokumen dari formatting gak penting |

### Chunking dengan Overlap

```typescript
function chunkWithOverlap(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
  }
  return chunks;
}
// chunkWithOverlap(text, 500, 50) → overlap 50 karakter antar chunk
```

---

## 7. Studi Kasus: Agent Dokumen Sekolah

Bayangin sekolah punya dokumen:

| Dokumen | Isi |
|---------|-----|
| `tata-tertib.md` | Aturan sekolah, seragam, jam |
| `kurikulum.md` | Mata pelajaran, kompetensi |
| `praktikum.md` | SOP lab, alat, safety |

Dengan RAG, agent bisa jawab:

```
Student: "Jam berapa masuk sekolah?"
Agent: [Pake RAG → cari di tata-tertib.md → jawab]
"Berdasarkan tata tertib sekolah, jam masuk adalah pukul 07:00 WIB."

Student: "Apa aja alat yang perlu dibawa pas praktikum jaringan?"
Agent: [Pake RAG → cari di praktikum.md → jawab]
"Berdasarkan SOP praktikum jaringan, alat yang perlu dibawa: laptop, kabel RJ45, dan crimping tool."
```

---

## ✋ Latihan

1. **Mini RAG:** Bikin 3 file `.md` tentang topik berbeda, lalu bikin agent yang bisa tanya jawab dari file-file itu
2. **Chunking Strategy:** Coba chunk size 200 vs 1000 — mana yang jawabannya lebih akurat?
3. **Multiple Sources:** Agent harus bilang sumber mana yang dipake buat jawab
4. **RAG + Tools:** Gabungin RAG dengan tool lain (calculator, weather) dalam satu agent

### Kriteria:
- Minimal 2 dokumen sebagai sumber pengetahuan
- Agent pake tool search sebelum jawab
- Jawaban menyertakan sumber dokumen
- Handle kasau dokumen gak relevan

---

**Next → Sesi 5: Agent Workflows** — bikin multi-step agent pipeline dengan branching dan parallel execution.
