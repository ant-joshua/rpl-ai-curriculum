# Sesi 5: Agent Workflows

> **Durasi:** 2 sesi (120 menit)
> **Tujuan:** Paham multi-step agent workflows, bisa bikin chaining, conditional branching, parallel execution

---

## 1. Konsep Workflow

Workflow = **urutan langkah** yang agent jalanin secara terstruktur.

### Kenapa perlu workflow?

- **Multi-step task**: Research → Summarize → Format → Send email
- **Complex logic**: Validasi → Transform → Analisis → Report
- **Error recovery**: Kalo langkah A gagal, fallback ke langkah B
- **Parallel tasks**: Cari data dari 3 sumber sekaligus

### Tanpa Workflow (Chaotic)

```typescript
// Kode campur aduk, susah di-maintain
const data = await search('AI terbaru');
const summary = await summarize(data);
const report = await format(summary);
await sendEmail(report);
```

### Dengan Workflow (Structured)

```typescript
// Setiap langkah jelas, reusable, testable
const workflow = new Workflow({
  steps: [
    { name: 'research', execute: search },
    { name: 'summarize', execute: summarize, dependsOn: ['research'] },
    { name: 'format', execute: format, dependsOn: ['summarize'] },
    { name: 'send', execute: sendEmail, dependsOn: ['format'] },
  ],
});
```

---

## 2. Workflow Dasar di Mastra

### Simple Sequential Workflow

```typescript
import { Workflow } from '@mastra/core/workflows';

// Bikin workflow
const researchWorkflow = new Workflow({
  name: 'research-pipeline',
  steps: [
    {
      name: 'cari-info',
      execute: async () => {
        console.log('Step 1: Mencari informasi...');
        return { hasil: 'Data AI terbaru 2024' };
      },
    },
    {
      name: 'summarize',
      dependsOn: ['cari-info'],
      execute: async (context) => {
        const hasil = context.getResult('cari-info');
        console.log('Step 2: Summarize...');
        return { summary: `Ringkasan: ${hasil}` };
      },
    },
  ],
});

// Jalankan
const result = await researchWorkflow.execute();
console.log(result.results);
```

### Penjelasan `dependsOn`

```typescript
dependsOn: ['nama-step']
```
- Step bakal **nunggu** step di `dependsOn` selesai dulu
- Bisa dependsOn multiple step: `dependsOn: ['step1', 'step2']`
- Kalo kosong: jalan langsung (entry point)

---

## 3. Chaining Agents

Chain = output agent 1 jadi input agent 2.

### Contoh: Research → Write → Review

```typescript
import { Agent } from '@mastra/core/agent';
import { Workflow } from '@mastra/core/workflows';

// Agent 1: Research
const researcher = new Agent({
  id: 'researcher',
  name: 'Peneliti',
  instructions: 'Cari dan kumpulkan informasi tentang topik yang diberikan.',
  model: 'openai/gpt-4.1-nano',
});

// Agent 2: Writer
const writer = new Agent({
  id: 'writer',
  name: 'Penulis',
  instructions: 'Buat artikel informatif dari hasil research dalam Bahasa Indonesia.',
  model: 'openai/gpt-4.1-nano',
});

// Agent 3: Reviewer
const reviewer = new Agent({
  id: 'reviewer',
  name: 'Reviewer',
  instructions: 'Review artikel: cek grammar, kejelasan, dan kelengkapan. Beri skor 1-10.',
  model: 'openai/gpt-4.1-nano',
});

// Workflow
const contentPipeline = new Workflow({
  name: 'content-pipeline',
  steps: [
    {
      name: 'research',
      execute: async () => {
        const r = await researcher.generate('AI dalam pendidikan SMK');
        return { content: r.text };
      },
    },
    {
      name: 'write',
      dependsOn: ['research'],
      execute: async (context) => {
        const research = context.getResult('research');
        const r = await writer.generate(research.content);
        return { article: r.text };
      },
    },
    {
      name: 'review',
      dependsOn: ['write'],
      execute: async (context) => {
        const write = context.getResult('write');
        const r = await reviewer.generate(write.article);
        return { review: r.text };
      },
    },
  ],
});

// Jalankan
async function main() {
  const result = await contentPipeline.execute();
  console.log('Final Review:', result.results.review);
}

main();
```

---

## 4. Conditional Branching

Workflow bisa **percabangan** — beda langkah tergantung kondisi.

```typescript
const gradingWorkflow = new Workflow({
  name: 'grading-pipeline',
  steps: [
    {
      name: 'nilai-tugas',
      execute: async () => {
        return { score: 85 }; // Contoh nilai
      },
    },
    {
      name: 'cek-kelulusan',
      dependsOn: ['nilai-tugas'],
      execute: async (context) => {
        const { score } = context.getResult('nilai-tugas');
        return { lulus: score >= 75 };
      },
    },
    {
      name: 'kasih-sertifikat',
      dependsOn: ['cek-kelulusan'],
      // Conditional: cuma jalan kalo lulus
      execute: async (context) => {
        const { lulus } = context.getResult('cek-kelulusan');
        console.log(lulus ? '✅ Kasih sertifikat' : '❌ Tidak lulus');
        return { action: lulus ? 'sertifikat-dikirim' : 'tugas-diulang' };
      },
    },
  ],
});
```

### Branching dengan If-Else di Workflow

Workflow Mastra support **conditional steps**:

```typescript
const workflow = new Workflow({
  name: 'customer-support-workflow',
  steps: [
    {
      name: 'klasifikasi',
      execute: async (context) => {
        const { message } = context.triggerData;
        // Klasifikasi: 'teknis' | 'billing' | 'umum'
        return { category: klasifikasi(message) };
      },
    },
    {
      name: 'handle-teknis',
      dependsOn: ['klasifikasi'],
      if: (context) => context.getResult('klasifikasi').category === 'teknis',
      execute: async () => {
        return { response: 'Tim teknis akan menghubungi...' };
      },
    },
    {
      name: 'handle-billing',
      dependsOn: ['klasifikasi'],
      if: (context) => context.getResult('klasifikasi').category === 'billing',
      execute: async () => {
        return { response: 'Masalah billing dalam proses...' };
      },
    },
    {
      name: 'handle-umum',
      dependsOn: ['klasifikasi'],
      if: (context) => context.getResult('klasifikasi').category === 'umum',
      execute: async () => {
        return { response: 'Baik, akan kami bantu...' };
      },
    },
  ],
});
```

---

## 5. Parallel Execution

Jalankan beberapa step **barengan** — kalo gak saling dependen.

```typescript
const parallelWorkflow = new Workflow({
  name: 'parallel-research',
  steps: [
    // Step 1, 2, 3 jalan parallel — gak ada dependsOn
    {
      name: 'cari-dari-google',
      execute: async () => {
        return { data: 'Hasil dari Google...' };
      },
    },
    {
      name: 'cari-dari-wikipedia',
      execute: async () => {
        return { data: 'Hasil dari Wikipedia...' };
      },
    },
    {
      name: 'cari-dari-news',
      execute: async () => {
        return { data: 'Hasil dari News API...' };
      },
    },
    // Step 4 jalan setelah 3 parallel step selesai
    {
      name: 'gabungin-hasil',
      dependsOn: ['cari-dari-google', 'cari-dari-wikipedia', 'cari-dari-news'],
      execute: async (context) => {
        const google = context.getResult('cari-dari-google');
        const wiki = context.getResult('cari-dari-wikipedia');
        const news = context.getResult('cari-dari-news');
        return {
          gabungan: `${google.data}\n${wiki.data}\n${news.data}`,
        };
      },
    },
  ],
});
```

### Lebih Cepat dengan Parallel

```
Sequential:  step1(2s) → step2(2s) → step3(2s) = 6 detik
Parallel:    step1(2s) + step2(2s) + step3(2s) = 2 detik (semua jalan bareng)
```

---

## 6. Event-Driven Workflows

Workflow bisa **nunggu event** dari luar — cocok buat:
- User upload file → trigger workflow
- Email masuk → auto-reply
- Jadwal tertentu → daily report

```typescript
// Pseudo-code — event-driven di Mastra
const eventWorkflow = new Workflow({
  name: 'on-upload-workflow',
  trigger: {
    type: 'event',
    name: 'file.uploaded',
  },
  steps: [
    {
      name: 'validate-file',
      execute: async (context) => {
        const { file } = context.triggerData;
        return { valid: file.size < 10 * 1024 * 1024 }; // Max 10MB
      },
    },
    {
      name: 'process-file',
      dependsOn: ['validate-file'],
      if: (context) => context.getResult('validate-file').valid,
      execute: async (context) => {
        const { file } = context.triggerData;
        // Proses file...
        return { status: 'processed' };
      },
    },
  ],
});

// Trigger dari luar
// await eventWorkflow.emit('file.uploaded', { file: { name: 'tugas.pdf', size: 2048 } });
```

---

## 7. Workflow Realistis: Report Generator

```typescript
import { Agent } from '@mastra/core/agent';
import { Workflow } from '@mastra/core/workflows';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// === AGENTS ===
const dataCollector = new Agent({
  id: 'data-collector',
  name: 'Pengumpul Data',
  instructions: 'Kumpulkan data tentang topik yang diminta.',
  model: 'openai/gpt-4.1-nano',
});

const analyst = new Agent({
  id: 'analyst',
  name: 'Analis',
  instructions: 'Analisis data dan berikan insight penting. Jawab Bahasa Indonesia.',
  model: 'openai/gpt-4.1-nano',
});

const reportWriter = new Agent({
  id: 'report-writer',
  name: 'Penulis Laporan',
  instructions: 'Buat laporan profesional format markdown dari hasil analisis.',
  model: 'openai/gpt-4.1-nano',
});

// === TOOLS ===
const saveFileTool = createTool({
  id: 'save-report',
  description: 'Simpan laporan ke file',
  inputSchema: z.object({
    filename: z.string(),
    content: z.string(),
  }),
  execute: async ({ filename, content }) => {
    await fs.promises.writeFile(filename, content, 'utf-8');
    return { output: `Laporan disimpan: ${filename}` };
  },
});

// === WORKFLOW ===
const reportWorkflow = new Workflow({
  name: 'report-generator',
  steps: [
    {
      name: 'collect-data',
      execute: async (context) => {
        const r = await dataCollector.generate(
          'Kumpulkan data tentang tren AI di Indonesia 2024'
        );
        return { data: r.text };
      },
    },
    {
      name: 'analyze',
      dependsOn: ['collect-data'],
      execute: async (context) => {
        const { data } = context.getResult('collect-data');
        const r = await analyst.generate(data);
        return { analysis: r.text };
      },
    },
    {
      name: 'write-report',
      dependsOn: ['analyze'],
      execute: async (context) => {
        const { analysis } = context.getResult('analyze');
        const r = await reportWriter.generate(analysis);
        return { report: r.text };
      },
    },
    {
      name: 'save',
      dependsOn: ['write-report'],
      execute: async (context) => {
        const { report } = context.getResult('write-report');
        const filename = `laporan-ai-indonesia-${Date.now()}.md`;
        await fs.promises.writeFile(filename, report, 'utf-8');
        return { saved: true, filename };
      },
    },
  ],
});

async function main() {
  const result = await reportWorkflow.execute();
  console.log('✅ Laporan selesai:', result.results.save.filename);
}

main();
```

---

## 8. Workflow Best Practices

| Praktik | Kenapa |
|---------|--------|
| **Step names jelas** | `cari-data` lebih baik dari `step1` |
| **dependsOn minimal** | Jangan over-specify biar parallel optimal |
| **Error handling tiap step** | Jangan biarin 1 step gagal hancurin semua |
| **Context kecil** | Jangan simpan data gede di context |
| **Test tiap step** | Unit test tiap execute function |

### Workflow Error Handling

```typescript
const safeWorkflow = new Workflow({
  name: 'safe-workflow',
  steps: [
    {
      name: 'risky-step',
      execute: async () => {
        try {
          const data = await fetchData();
          return { data };
        } catch (e) {
          return { error: String(e), fallback: true };
        }
      },
    },
    {
      name: 'fallback-step',
      dependsOn: ['risky-step'],
      if: (ctx) => ctx.getResult('risky-step').fallback,
      execute: async () => {
        return { data: 'Data default (fallback)' };
      },
    },
  ],
});
```

---

## ✋ Latihan

1. **Research Pipeline:** Bikin workflow 3 step: research → summarize → translate ke Indonesia
2. **Conditional Support:** Workflow customer service dengan branching (teknis / billing / umum)
3. **Parallel Scraper:** Cari informasi dari 3 sumber parallel, gabungin hasilnya
4. **Report Generator:** Workflow lengkap: collect → analyze → write → save ke file

### Kriteria:
- Minimal 3 step dalam workflow
- Ada `dependsOn` yang bener
- (Opsional) conditional branching
- (Opsional) parallel execution
- Workflow bisa dijalankan dan menghasilkan output

---

**Selesai! 🎉** Lo sekarang udah bisa:
1. Bikin agent Mastra dari awal ✅
2. Tambah tools dengan Zod schema ✅
3. Memory dan conversation history ✅
4. RAG untuk jawab dari dokumen ✅
5. Multi-step workflows ✅

Lanjut ke [cheatsheet](cheatsheet.md) buat referensi cepat, atau [quiz](quiz.md) buat tes pemahaman!
