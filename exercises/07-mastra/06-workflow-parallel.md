# Mastra AI — Exercise #6: Workflow Parallel

> **Level:** Intermediate
> **Topics:** parallel execution, Promise.all, fan-out, merge results

## Instructions

Buat workflow yang menjalankan beberapa task secara paralel:

1. **Research Agent** — mencari informasi tentang topik.
2. **Data Collector** — mengumpulkan data statistik.
3. **Image Describer** — mendeskripsikan gambar (simulasi).
4. **Merge Results** — menggabungkan semua hasil setelah semuanya selesai.

Gunakan `Promise.all` untuk eksekusi paralel.

## Starter Code

```javascript
// === SIMULASI BROWSER ===

// Simulasi tugas paralel
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function researchAgent(topic) {
  console.log(`🔍 [Research] Mencari informasi tentang "${topic}"...`);
  await delay(800);
  return {
    topic,
    summary: `${topic} adalah teknologi yang berkembang pesat.`,
    key_points: [`${topic} digunakan di berbagai industri`, `Pasar ${topic} terus bertumbuh`],
    source: 'simulasi research agent',
  };
}

async function dataCollector(topic) {
  console.log(`📊 [Data Collector] Mengumpulkan data tentang "${topic}"...`);
  await delay(600);
  return {
    topic,
    stats: {
      pertumbuhan: '25% per tahun',
      pengguna: '500 juta+',
      investasi: '$10 miliar',
    },
  };
}

async function imageDescriber(topic) {
  console.log(`🖼️ [Image Describer] Menganalisis gambar terkait "${topic}"...`);
  await delay(400);
  return {
    topic,
    description: `Gambar menunjukkan ilustrasi tentang ${topic}`,
    tags: ['teknologi', topic.toLowerCase(), 'digital'],
  };
}

async function mergeResults(research, data, image) {
  console.log('🔄 [Merger] Menggabungkan semua hasil...');
  await delay(300);
  
  return {
    title: `Laporan Lengkap: ${research.topic}`,
    summary: research.summary,
    keyPoints: research.key_points,
    statistics: data.stats,
    visualDescription: image.description,
    tags: image.tags,
    generatedAt: new Date().toISOString(),
  };
}

// Eksekusi paralel
async function runParallelWorkflow(topic) {
  console.log(`\n===== Parallel Workflow: ${topic} =====\n`);
  
  const startTime = Date.now();
  
  // TODO: jalankan semua agent secara paralel
  // const [research, data, image] = await Promise.all([
  //   researchAgent(topic),
  //   dataCollector(topic),
  //   imageDescriber(topic),
  // ]);
  
  // Lalu merge
  // const final = await mergeResults(research, data, image);
  
  const duration = Date.now() - startTime;
  console.log(`\n⏱️ Selesai dalam ${duration}ms`);
  
  return final;
}

// Test
runParallelWorkflow('Kecerdasan Buatan').then(result => {
  console.log('\n=== HASIL FINAL ===');
  console.log(JSON.stringify(result, null, 2));
});
```

## Expected Output

```
===== Parallel Workflow: Kecerdasan Buatan =====

🔍 [Research] Mencari informasi...
📊 [Data Collector] Mengumpulkan data...
🖼️ [Image Describer] Menganalisis gambar...
🔄 [Merger] Menggabungkan semua hasil...

⏱️ Selesai dalam ~800ms (bukan 1800ms karena paralel!)

=== HASIL FINAL ===
{
  "title": "Laporan Lengkap: Kecerdasan Buatan",
  "summary": "...",
  ...
}
```

## Test Cases

```javascript
// Test paralel: harus lebih cepat dari sequential
const start = Date.now();
await Promise.all([delay(500), delay(300), delay(200)]);
const dur = Date.now() - start;
console.log(dur < 800);  // true: paralel, max 500ms bukan 1000ms
```
