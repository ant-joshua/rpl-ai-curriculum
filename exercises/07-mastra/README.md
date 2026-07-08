# 🤖 Latihan Mastra AI

> 10+ latihan Mastra AI Framework — dari agent sederhana sampai multi-agent workflow.
> Semua latihan pake TypeScript. Install Mastra dulu: `npm create mastra@latest`

---

## 📋 Daftar Isi

| # | Topik | Konsep | Level |
|---|-------|--------|-------|
| 1 | Hello Agent | Agent dasar, generate text | 🌱 Beginner |
| 2 | Agent with Instructions | System prompt, persona | 🌱 Beginner |
| 3 | Agent with Tools | Tool definition, tool calling | 🌱 Beginner |
| 4 | Streaming Response | Stream text ke user | 🌱 Beginner |
| 5 | Structured Output | JSON schema output | 🌱 Beginner |
| 6 | Multi-Tool Agent | Calculator + Weather + Search | 📐 Intermediate |
| 7 | Agent Memory | Working memory, conversation history | 📐 Intermediate |
| 8 | Workflow — Sequential | Multi-step agent pipeline | 📐 Intermediate |
| 9 | RAG Pipeline | Retrieval Augmented Generation | 📐 Intermediate |
| 10 | Agent Evaluation | Eval metrics, test cases | 📐 Intermediate |
| 11 | Multi-Agent Workflow | Orchestrator + specialist agents | 🚀 Advanced |
| 12 | Agent with External API | REST API calling from tools | 🚀 Advanced |
| 13 | Agent Guardrails | Input/output validation | 🚀 Advanced |
| 14 | Agent with Vision | Image analysis | 🚀 Advanced |

---

## 📦 Setup Project

```bash
# Pake Mastra CLI (rekomendasi)
npm create mastra@latest latihan-mastra
cd latihan-mastra

# Atau manual
mkdir latihan-mastra && cd latihan-mastra
npm init -y
npm install @mastra/core @mastra/memory zod openai
npm install -D @types/node typescript tsx
npx tsc --init

# Set API key
export OPENAI_API_KEY=sk-...  # atau ANTHROPIC_API_KEY
```

**Struktur Folder:**
```
latihan-mastra/
├── src/
│   ├── agents/       # Definisi agent
│   ├── tools/        # Definisi tools
│   ├── workflows/    # Workflow definitions
│   └── index.ts      # Entry point
├── package.json
└── tsconfig.json
```

---

## 🌱 Beginner

### 1. Hello Agent

**Tujuan:** Bikin agent paling sederhana yang bisa jawab pertanyaan.

```typescript
// src/agents/hello.agent.ts
import { Agent } from "@mastra/core";

const helloAgent = new Agent({
  name: "HelloAgent",
  instructions: "Kamu adalah asisten yang ramah. Jawab dengan singkat dan jelas.",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
  },
});

// === KODE LO DISINI ===
// Panggil agent dengan prompt "Siapa presiden Indonesia?"
// Hint: await helloAgent.generate("Siapa presiden Indonesia?")
async function main() {
  // === KODE LO DISINI ===
}

main();
```

**Expected Output:**
```
Presiden Indonesia saat ini adalah Prabowo Subianto.
```

---

### 2. Agent with Instructions

**Tujuan:** Agent dengan persona spesifik — guru ngaji.

```typescript
// src/agents/guru.agent.ts
import { Agent } from "@mastra/core";

const guruAgent = new Agent({
  name: "GuruNgaji",
  instructions: `
    Kamu adalah guru pemrograman yang sabar dan suka pake analogi.
    
    Aturan:
    - Jawab pake bahasa Indonesia
    - Pake analogi dunia nyata (masak, motor, sekolah)
    - Kalo ditanya konsep sulit, jelasin kayak ke anak SMK
    - Kalo user ngasih kode, review dengan sopan
    - Jangan pake jargon terlalu tinggi
  `,
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
});

// Test
async function main() {
  const response = await guruAgent.generate("Jelasin apa itu Promise di JavaScript pake analogi");
  console.log(response.text);
}

main();
```

**Tugas Tambahan:**
- Ubah instruction jadi "Kamu adalah teman ngobrol yang suka bercanda"
- Bandingkan outputnya

---

### 3. Agent with Tools

**Tujuan:** Agent yang bisa pake tool kalkulator.

```typescript
// src/tools/kalkulator.tool.ts
import { createTool } from "@mastra/core";
import { z } from "zod";

const calculatorTool = createTool({
  name: "kalkulator",
  description: "Kalkulator sederhana buat operasi matematika dasar",
  schema: z.object({
    operasi: z.enum(["tambah", "kurang", "kali", "bagi"]),
    a: z.number(),
    b: z.number(),
  }),
  executor: async ({ operasi, a, b }) => {
    // === KODE LO DISINI ===
    // Handle operasi: tambah, kurang, kali, bagi
    // Jangan lupa handle bagi dengan 0!
  },
});

// src/agents/kalkulator.agent.ts
import { Agent } from "@mastra/core";

const kalkulatorAgent = new Agent({
  name: "KalkulatorAgent",
  instructions: "Kamu adalah kalkulator pintar. Pake tool kalkulator untuk hitung.",
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
  tools: { kalkulator: calculatorTool },
});

async function main() {
  const response = await kalkulatorAgent.generate("Berapa 12345 dikali 6789?");
  console.log(response.text);
}

main();
```

**Expected Output:**
```
12345 × 6789 = 83.828.205
```

---

### 4. Streaming Response

**Tujuan:** Agent yang ngirim response secara streaming (token by token).

```typescript
// src/agents/streaming.agent.ts
import { Agent } from "@mastra/core";

const streamingAgent = new Agent({
  name: "StreamingAgent",
  instructions: "Kamu adalah asisten yang suka cerita panjang.",
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
});

async function main() {
  const stream = await streamingAgent.stream(
    "Ceritain dongeng tentang kancil dan buaya versi modern"
  );

  // Stream text
  for await (const chunk of stream.textStream) {
    process.stdout.write(chunk); // Muncul pelan-pelan kayak ngetik
  }
}

main();
```

**Tugas:** Hitung berapa detik streaming selesai dibanding non-streaming.

---

### 5. Structured Output

**Tujuan:** Agent yang return data dalam format JSON terstruktur.

```typescript
// src/agents/structured.agent.ts
import { Agent } from "@mastra/core";
import { z } from "zod";

// Define output schema
const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  ringkasan: z.string(),
  kategori: z.enum(["positif", "netral", "negatif"]),
  saran: z.string().optional(),
});

const reviewAnalyzer = new Agent({
  name: "ReviewAnalyzer",
  instructions: "Analisis review dan return data terstruktur.",
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
  output: ReviewSchema, // Pakai structured output
});

async function main() {
  const result = await reviewAnalyzer.generate(
    "Barang ini bagus banget! Cepet sampe, kualitas ok. Tapi sayang packingnya kurang rapi."
  );
  
  // Hasilnya sudah auto-parse ke tipe ReviewSchema
  console.log("Rating:", result.rating);
  console.log("Kategori:", result.kategori);
  console.log("Saran:", result.saran);
}

main();
```

**Expected Output:**
```
Rating: 4
Kategori: positif
Saran: Tingkatkan kualitas packing
```

---

## 📐 Intermediate

### 6. Multi-Tool Agent

**Tujuan:** Agent yang punya banyak tools — cuaca, kalkulator, search.

```typescript
// src/tools/weather.tool.ts
import { createTool } from "@mastra/core";
import { z } from "zod";

const weatherTool = createTool({
  name: "cekCuaca",
  description: "Cek cuaca di kota tertentu",
  schema: z.object({
    kota: z.string(),
  }),
  executor: async ({ kota }) => {
    // Simulasi API cuaca (ganti dengan API beneran kalo mau)
    const cuacaData: Record<string, string> = {
      jakarta: "30°C, cerah berawan",
      bandung: "22°C, hujan ringan",
      surabaya: "32°C, panas terik",
      yogya: "28°C, berawan",
    };
    
    return cuacaData[kota.toLowerCase()] ?? `Data cuaca ${kota} tidak tersedia`;
  },
});

// src/tools/search.tool.ts
import { createTool } from "@mastra/core";
import { z } from "zod";

const searchTool = createTool({
  name: "cariInfo",
  description: "Cari informasi di internet (simulasi)",
  schema: z.object({
    query: z.string(),
  }),
  executor: async ({ query }) => {
    // Simulasi search
    return `Hasil pencarian untuk "${query}": ... (simulasi)`;
  },
});

// src/agents/multi-tool.agent.ts
import { Agent } from "@mastra/core";

const multiAgent = new Agent({
  name: "SuperAssistant",
  instructions: "Kamu adalah asisten serba bisa. Pake tool yang sesuai.",
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
  tools: { 
    kalkulator: calculatorTool, // dari latihan 3
    cekCuaca: weatherTool,
    cariInfo: searchTool,
  },
});

async function main() {
  const res1 = await multiAgent.generate("Cuaca di Bandung gimana?");
  console.log(res1.text);
  
  const res2 = await multiAgent.generate("Hitung 15% dari 250000");
  console.log(res2.text);
}

main();
```

**Expected Output:**
```
Cuaca di Bandung: 22°C, hujan ringan. Jangan lupa bawa payung!
15% dari 250.000 adalah 37.500.
```

---

### 7. Agent Memory

**Tujuan:** Agent yang ingat percakapan sebelumnya.

```typescript
// src/agents/memory.agent.ts
import { Agent } from "@mastra/core";
import { Memory } from "@mastra/memory";

const memoryAgent = new Agent({
  name: "MemoryAgent",
  instructions: "Kamu adalah asisten yang ramah. Ingat percakapan sebelumnya.",
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
  memory: new Memory({
    maxTokens: 2000, // Batas memory
  }),
});

async function main() {
  // Sesi 1
  const res1 = await memoryAgent.generate("Halo! Nama saya Budi");
  console.log(res1.text);
  
  // Sesi 2 — agent harusnya ingat nama Budi
  const res2 = await memoryAgent.generate("Siapa nama saya?");
  console.log(res2.text);
  
  // Sesi 3 — tanya hobi
  const res3 = await memoryAgent.generate("Saya suka main game");
  console.log(res3.text);
  
  // Sesi 4 — harus ingat nama + hobi
  const res4 = await memoryAgent.generate("Apa yang kamu tau tentang saya?");
  console.log(res4.text);
}
```

**Expected Output:**
```
Halo Budi! Senang bertemu denganmu. Ada yang bisa saya bantu?
Nama kamu Budi, kan?
Wah, main game! Game apa yang kamu suka?
Kamu Budi, hobi main game. Ada yang bisa saya bantu hari ini?
```

---

### 8. Workflow — Sequential

**Tujuan:** Multi-step workflow — agent jalanin langkah demi langkah.

```typescript
// src/workflows/writing.workflow.ts
import { Agent, Workflow } from "@mastra/core";

const writerAgent = new Agent({
  name: "Writer",
  instructions: "Kamu adalah penulis artikel.",
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
});

const editorAgent = new Agent({
  name: "Editor",
  instructions: "Kamu adalah editor. Review dan perbaiki artikel.",
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
});

// === KODE LO DISINI ===
// Bikin workflow: Writer nulis -> Editor review -> Output final
const writingWorkflow = new Workflow({
  name: "WritingPipeline",
  // Definisikan steps
  steps: [
    {
      name: "draft",
      agent: writerAgent,
      input: "Tulis artikel tentang AI untuk anak SMK (300 kata)",
    },
    {
      name: "review",
      agent: editorAgent,
      input: (ctx) => `Review dan perbaiki artikel ini:\n${ctx.draft.text}`,
    },
  ],
});

async function main() {
  const result = await writingWorkflow.run();
  console.log("Final article:", result.review.text);
}

main();
```

---

### 9. RAG Pipeline

**Tujuan:** Agent yang bisa jawab berdasarkan dokumen (RAG).

```typescript
// src/agents/rag.agent.ts
import { Agent } from "@mastra/core";
import { Memory } from "@mastra/memory";

// === KODE LO DISINI ===
// 1. Siapkan dokumen knowledge base (array of strings)
const documents = [
  "RPL AI Curriculum memiliki 57 modul dari beginner sampai advanced",
  "Modul 07 membahas Mastra AI — Agents, Tools, Memory & RAG",
  "Setiap modul punya 4 sesi: materi, demo, praktik, dan tugas",
  "Final project adalah full-stack app dengan AI feature",
  "Nilai akhir = (Tugas × 30%) + (Kuis × 10%) + (Mini Project × 20%) + (Final Project × 35%) + (Partisipasi × 5%)",
];

// 2. Buat RAG agent dengan memory
const ragAgent = new Agent({
  name: "RAGAgent",
  instructions: `
    Kamu adalah asisten kurikulum RPL AI.
    Jawab berdasarkan dokumen yang tersedia.
    Kalau tidak tau, bilang "Saya tidak punya informasi itu."
  `,
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
});

async function main() {
  // Simulasi RAG: inject context ke prompt
  const context = documents.join("\n");
  
  const res1 = await ragAgent.generate(
    `Dokumen:\n${context}\n\nPertanyaan: Ada berapa modul di RPL AI?`
  );
  console.log(res1.text);
  
  const res2 = await ragAgent.generate(
    `Dokumen:\n${context}\n\nPertanyaan: Gimana cara hitung nilai akhir?`
  );
  console.log(res2.text);
  
  const res3 = await ragAgent.generate(
    `Dokumen:\n${context}\n\nPertanyaan: Apa itu quantum computing?`
  );
  console.log(res3.text);
}
```

**Expected Output:**
```
RPL AI Curriculum memiliki 57 modul, dari level beginner sampai advanced.
Nilai akhir dihitung dari: Tugas (30%), Kuis (10%), Mini Project (20%), Final Project (35%), dan Partisipasi (5%).
Saya tidak punya informasi tentang quantum computing.
```

---

### 10. Agent Evaluation

**Tujuan:** Evaluasi performa agent pake metrics.

```typescript
// src/eval/agent-eval.ts
import { Agent } from "@mastra/core";

// === KODE LO DISINI ===
// 1. Bikin test cases
interface TestCase {
  input: string;
  expectedKeywords: string[];
  minLength: number;
}

const testCases: TestCase[] = [
  { 
    input: "Apa itu JavaScript?", 
    expectedKeywords: ["bahasa", "program", "web"],
    minLength: 20,
  },
  { 
    input: "Jelaskan Promise", 
    expectedKeywords: ["async", "then", "await"],
    minLength: 30,
  },
  { 
    input: "Apa itu Node.js?", 
    expectedKeywords: ["runtime", "server", "javascript"],
    minLength: 20,
  },
];

// 2. Bikin evaluation function
async function evaluateAgent(
  agent: Agent,
  testCases: TestCase[]
): Promise<{ passRate: number; results: any[] }> {
  const results = [];
  
  for (const tc of testCases) {
    const response = await agent.generate(tc.input);
    const text = response.text.toLowerCase();
    
    const keywordCheck = tc.expectedKeywords.every(k => 
      text.includes(k.toLowerCase())
    );
    const lengthCheck = text.length >= tc.minLength;
    const passed = keywordCheck && lengthCheck;
    
    results.push({
      input: tc.input,
      passed,
      keywordCheck,
      lengthCheck,
      responseLength: text.length,
    });
  }
  
  const passRate = results.filter(r => r.passed).length / results.length;
  return { passRate, results };
}

// 3. Run evaluation
async function main() {
  const agent = new Agent({
    name: "TestAgent",
    instructions: "Jawab pertanyaan tentang programming.",
    model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
  });
  
  const evalResult = await evaluateAgent(agent, testCases);
  console.log(`Pass Rate: ${evalResult.passRate * 100}%`);
  console.table(evalResult.results);
}

main();
```

---

## 🚀 Advanced

### 11. Multi-Agent Workflow

**Tujuan:** Orchestrator agent yang delegasi tugas ke specialist agents.

```typescript
// src/workflows/multi-agent.workflow.ts
import { Agent, Workflow } from "@mastra/core";

// Specialist agents
const researchAgent = new Agent({
  name: "Researcher",
  instructions: "Kamu adalah peneliti. Cari fakta dan data.",
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
});

const writerAgent = new Agent({
  name: "Writer",
  instructions: "Kamu adalah penulis. Buat artikel engaging.",
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
});

const reviewerAgent = new Agent({
  name: "Reviewer",
  instructions: "Kamu adalah reviewer. Cek akurasi dan kualitas.",
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
});

// Orchestrator
const orchestrator = new Agent({
  name: "Orchestrator",
  instructions: `
    Kamu adalah project manager AI.
    Tugasmu: terima topik, delegasi ke researcher, writer, reviewer.
    Pastikan output akhir berkualitas.
  `,
  model: { provider: "OPEN_AI", name: "gpt-4o" },
});

// === KODE LO DISINI ===
// Buat workflow yang:
// 1. Orchestrator terima topik
// 2. ResearchAgent cari data
// 3. WriterAgent bikin draft
// 4. ReviewerAgent review
// 5. Orchestrator final check

const contentWorkflow = new Workflow({
  name: "ContentCreationPipeline",
  steps: [
    { name: "research", agent: researchAgent },
    { name: "write", agent: writerAgent, input: (ctx) => `Buat artikel dari data:\n${ctx.research.text}` },
    { name: "review", agent: reviewerAgent, input: (ctx) => `Review artikel:\n${ctx.write.text}` },
    { name: "finalize", agent: orchestrator, input: (ctx) => `Research: ${ctx.research.text}\n\nArticle: ${ctx.write.text}\n\nReview: ${ctx.review.text}\n\nFinal check and output.` },
  ],
});

async function main() {
  const result = await contentWorkflow.run({
    triggerData: { topic: "Dampak AI di Dunia Kerja 2025" },
  });
  console.log(result.finalize.text);
}

main();
```

---

### 12. Agent with External API

**Tujuan:** Tool yang manggil API beneran (GitHub API).

```typescript
// src/tools/github.tool.ts
import { createTool } from "@mastra/core";
import { z } from "zod";

const githubTool = createTool({
  name: "githubInfo",
  description: "Ambil informasi user GitHub",
  schema: z.object({
    username: z.string(),
  }),
  executor: async ({ username }) => {
    const response = await fetch(`https://api.github.com/users/${username}`);
    
    if (!response.ok) {
      return `User ${username} tidak ditemukan`;
    }
    
    const data = await response.json();
    return {
      username: data.login,
      nama: data.name,
      repos: data.public_repos,
      followers: data.followers,
      following: data.following,
      bio: data.bio,
      url: data.html_url,
    };
  },
});

const apiAgent = new Agent({
  name: "APIAgent",
  instructions: "Kamu bisa cek info GitHub user.",
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
  tools: { github: githubTool },
});

async function main() {
  const res = await apiAgent.generate("Cek profil GitHub user 'vercel'");
  console.log(res.text);
}

main();
```

---

### 13. Agent Guardrails

**Tujuan:** Filter input/output biar agent gak ngomong sembarangan.

```typescript
// src/guards/guardrails.ts

// === KODE LO DISINI ===

// Input guard — cek prompt user
function inputGuard(prompt: string): { allowed: boolean; reason?: string } {
  const blockedPatterns = [
    /bagaimana cara (hack|meretas)/i,
    /buat saya (narkoba|obat terlarang)/i,
    /prompt injection/i,
    /abaikan instruksi sebelumnya/i,
  ];
  
  for (const pattern of blockedPatterns) {
    if (pattern.test(prompt)) {
      return { allowed: false, reason: "Prompt mengandung konten terlarang" };
    }
  }
  
  return { allowed: true };
}

// Output guard — cek response agent
function outputGuard(response: string): { safe: boolean; issue?: string } {
  const unsafePatterns = [
    /kode (carding|phishing)/i,
    /rahasia (negara|perusahaan)/i,
  ];
  
  if (response.includes("ERROR") || response.includes("undefined")) {
    return { safe: false, issue: "Response mengandung error" };
  }
  
  return { safe: true };
}

// Agent dengan guard
const guardedAgent = new Agent({
  name: "GuardedAgent",
  instructions: "Kamu adalah asisten yang aman dan sopan.",
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
});

async function main() {
  const testPrompts = [
    "Halo!",
    "Bagaimana cara hack WiFi?",
    "Buatkan saya website toko online",
  ];
  
  for (const prompt of testPrompts) {
    const guard = inputGuard(prompt);
    if (!guard.allowed) {
      console.log(`❌ Blocked: ${guard.reason}`);
      continue;
    }
    
    const response = await guardedAgent.generate(prompt);
    
    const outGuard = outputGuard(response.text);
    if (!outGuard.safe) {
      console.log(`⚠️ Unsafe output: ${outGuard.issue}`);
    } else {
      console.log(`✅ ${response.text.substring(0, 50)}...`);
    }
  }
}

main();
```

---

### 14. Agent with Vision

**Tujuan:** Agent yang bisa analisis gambar.

```typescript
// src/agents/vision.agent.ts
import { Agent } from "@mastra/core";

const visionAgent = new Agent({
  name: "VisionAgent",
  instructions: "Kamu bisa lihat dan analisis gambar.",
  model: { provider: "OPEN_AI", name: "gpt-4o" }, // harus model vision
});

async function main() {
  // Analisis gambar dari URL
  const response = await visionAgent.generate([
    "Jelaskan apa yang ada di gambar ini",
    { type: "image_url", image_url: { url: "https://example.com/foto.jpg" } },
  ]);
  
  console.log(response.text);
}

main();

// Atau dari file lokal (perlu upload atau base64)
import * as fs from "fs";
import * as path from "path";

async function analyzeLocalImage(imagePath: string) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64 = imageBuffer.toString("base64");
  const dataUrl = `data:image/jpeg;base64,${base64}`;
  
  const response = await visionAgent.generate([
    "Apa yang ada di gambar ini? Jelaskan detail.",
    { type: "image_url", image_url: { url: dataUrl } },
  ]);
  
  return response.text;
}
```

---

## 📋 Comparison: Agent Types

| Tipe | Use Case | Kelebihan |
|------|----------|-----------|
| Single Agent | Chatbot, FAQ | Simpel, cepat |
| Agent + Tools | Kalkulator, API | Fungsional |
| Agent + Memory | Customer service | Konteks percakapan |
| RAG Agent | Knowledge base | Jawab berdasarkan dokumen |
| Workflow | Multi-step task | Terstruktur |
| Multi-Agent | Complex task | Spesialisasi |
| Guarded Agent | Production safety | Aman, terfilter |

---

## 💡 Tips Mengerjakan

1. **Baca dokumentasi Mastra** — mastra.ai/docs
2. **Mulai dari agent sederhana** — tambah tools satu per satu
3. **Debug dengan console.log** di executor tool
4. **Gunakan model kecil** (gpt-4o-mini) untuk development, gpt-4o untuk production
5. **Test dengan berbagai prompt** — jangan cuma 1 test case
6. **Handle error** di setiap tool — jangan sampai agent crash

## 🔍 Troubleshooting

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `API key not set` | Belum export key | `export OPENAI_API_KEY=sk-...` |
| `Tool not found` | Tools gak di-register | Pastiin tools ada di constructor |
| `Rate limit` | Terlalu banyak request | Kurangi concurrency / ganti model |
| `Token limit` | Context terlalu panjang | Kurangi memory / chunk dokumen |
| `Tool execution error` | Bug di executor | Console.log input/output tool |

---

Selamat bikin agent! 🚀
