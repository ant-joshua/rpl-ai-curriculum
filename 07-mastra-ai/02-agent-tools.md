# Sesi 2: Agent Tools

> **Durasi:** 2 sesi (120 menit)
> **Tujuan:** Paham konsep tools di Mastra, bisa bikin custom tool pake `createTool()` dengan Zod schema, handle error

---

## 1. Konsep Tools

Tools adalah **fungsi eksternal** yang bisa dipanggil agent untuk:
- Ambil data dari API eksternal (cuaca, berita, harga saham)
- Query database
- Kalkulasi matematika
- Manipulasi file
- Apa aja yang bisa dikode

**Cara kerja:**
1. Agent nerima pertanyaan user
2. Agent milih tool yang sesuai (based on `description`)
3. Agent generate parameter sesuai `inputSchema`
4. Tool di-execute
5. Hasil tool dikembalikan ke agent
6. Agent generate jawaban final

```
User → Agent → Pilih Tool → Execute → Hasil → Agent → Jawab User
```

---

## 2. createTool + Zod Schema

### Sintaks Dasar

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const namaTool = createTool({
  id: 'nama-tool',
  description: 'Deskripsi jelas — ini yang dibaca agent buat milih tool',
  inputSchema: z.object({
    param1: z.string().describe('Parameter 1'),
    param2: z.number().describe('Parameter 2'),
  }),
  execute: async ({ param1, param2 }) => {
    // Logic tool di sini
    const result = param1.repeat(param2);
    return { output: result };
  },
});
```

**Penjelasan:**
- `id` — identifier unik tool
- `description` — PENTING! Agent pake ini buat decide kapan pake tool
- `inputSchema` — Zod schema, agent bakal generate parameter sesuai schema
- `execute` — fungsi async yang dipanggil agent

### Contoh: Calculator Tool

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const calculatorTool = createTool({
  id: 'calculator',
  description: 'Hitung operasi matematika dasar: tambah, kurang, kali, bagi',
  inputSchema: z.object({
    a: z.number().describe('Angka pertama'),
    b: z.number().describe('Angka kedua'),
    operation: z.enum(['tambah', 'kurang', 'kali', 'bagi'])
      .describe('Operasi matematika'),
  }),
  execute: async ({ a, b, operation }) => {
    let result: number;
    switch (operation) {
      case 'tambah': result = a + b; break;
      case 'kurang': result = a - b; break;
      case 'kali':   result = a * b; break;
      case 'bagi':
        if (b === 0) throw new Error('Pembagian dengan nol!');
        result = a / b;
        break;
    }
    return { output: `Hasil ${operation}: ${result}` };
  },
});
```

---

## 3. Weather Tool Realistis

Tool yang beneran pake API eksternal:

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const weatherTool = createTool({
  id: 'get-weather',
  description: 'Ambil informasi cuaca terkini untuk suatu kota atau lokasi',
  inputSchema: z.object({
    location: z.string().describe('Nama kota atau lokasi'),
  }),
  execute: async ({ location }) => {
    const apiKey = process.env.WEATHER_API_KEY;
    const res = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`
    );
    if (!res.ok) throw new Error(`Gagal ambil data cuaca: ${res.status}`);

    const data = await res.json();
    return {
      output: `${location}: ${data.current.temp_c}°C, ${data.current.condition.text}`,
    };
  },
});
```

---

## 4. Tool Calling dalam Agent Loop

### Agent dengan Multiple Tools

```typescript
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// --- Tools ---
const searchTool = createTool({
  id: 'web-search',
  description: 'Cari informasi terbaru dari internet',
  inputSchema: z.object({
    query: z.string().describe('Kata kunci pencarian'),
  }),
  execute: async ({ query }) => {
    // Simulasi search — di production pake API beneran
    return { output: `Hasil pencarian untuk: ${query}` };
  },
});

const calculatorTool = createTool({
  id: 'calculator',
  description: 'Hitung matematika: tambah, kurang, kali, bagi',
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
    operation: z.enum(['tambah', 'kurang', 'kali', 'bagi']),
  }),
  execute: async ({ a, b, operation }) => {
    const ops = { tambah: a + b, kurang: a - b, kali: a * b, bagi: a / b };
    return { output: `= ${ops[operation]}` };
  },
});

// --- Agent ---
const assistant = new Agent({
  id: 'super-assistant',
  name: 'Super Asisten',
  instructions: `Kamu asisten serba bisa.
    - Kalo ditanya hitung-hitungan, pake calculatorTool
    - Kalo ditanya informasi, pake searchTool
    - Jawab dalam Bahasa Indonesia`,
  model: 'openai/gpt-4.1-nano',
  tools: { calculatorTool, searchTool },
});

// --- Test ---
async function test() {
  const r1 = await assistant.generate('Berapa 125 + 37?');
  console.log(r1.text); // Agent pake calculatorTool

  const r2 = await assistant.generate('Cari tau tentang AI terbaru');
  console.log(r2.text); // Agent pake searchTool
}

test();
```

### Agent Memilih Tool

Agent milih tool berdasarkan:
1. **Description** tool — makin jelas, makin tepat
2. **Instructions** agent — guidance ke agent
3. **Input schema** — cocokin sama pertanyaan user

**Tips:**
- Description harus jelas dan spesifik
- Instructions harus bilang kapan pake tool apa
- Nama tool yang intuitif (camelCase)

---

## 5. Error Handling di Tools

### Basic Error Handling

```typescript
const divideTool = createTool({
  id: 'divide',
  description: 'Bagi dua angka',
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  execute: async ({ a, b }) => {
    if (b === 0) {
      return {
        output: 'Error: Gak bisa bagi dengan nol!',
        error: 'Division by zero',
      };
    }
    return { output: `${a} / ${b} = ${a / b}` };
  },
});
```

### Try-Catch + Fallback

```typescript
const apiTool = createTool({
  id: 'get-user-data',
  description: 'Ambil data user dari database',
  inputSchema: z.object({
    userId: z.string(),
  }),
  execute: async ({ userId }) => {
    try {
      const res = await fetch(`https://api.example.com/users/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { output: JSON.stringify(data) };
    } catch (error) {
      return {
        output: `Gagal ambil data user ${userId}: ${error}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
```

### Rate Limiting & Retry

```typescript
const rateLimitedTool = createTool({
  id: 'rate-limited-api',
  description: 'API dengan rate limit',
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await fetch(`https://api.example.com/search?q=${query}`);
        if (res.status === 429) {
          await new Promise(r => setTimeout(r, 1000 * (i + 1)));
          continue; // Retry
        }
        return { output: await res.text() };
      } catch (e) {
        if (i === maxRetries - 1) throw e;
      }
    }
    return { output: 'Gagal setelah 3 percobaan' };
  },
});
```

---

## 6. Tool Best Practices

| Praktik | Penjelasan |
|---------|------------|
| Description jelas | Agent pilih tool based on ini |
| Input schema strict | Zod validation, kurangi error |
| Output konsisten | Selalu return `{ output: string }` |
| Error handling | Jangan biarin tool throw unhandled |
| Logging | Console.log tiap tool dipanggil |

### Checklist Tool Production-Ready:

```typescript
const productionTool = createTool({
  id: 'my-tool',
  description: '...',
  inputSchema: z.object({ ... }),
  execute: async (input) => {
    const start = Date.now();
    try {
      // 1. Validasi input
      // 2. Call external API / logic
      // 3. Transform response
      // 4. Return output
      return { output: 'success', metadata: { duration: Date.now() - start } };
    } catch (e) {
      console.error(`[${Date.now()}] Tool error:`, e);
      return { output: 'Error: ...', error: String(e) };
    }
  },
});
```

---

## ✋ Latihan

1. **Calculator Lengkap:** Tambah tool pangkat, akar kuadrat, modulus
2. **Weather Tool:** Integrasi dengan API cuaca gratis (OpenWeatherMap / WeatherAPI)
3. **Multi-Tool Agent:** Bikin agent dengan 3 tools: calculator, weather, dan search
4. **Error Recovery:** Bikin tool yang sengaja error, lalu handle di agent supaya tetap bisa jawab

### Kriteria:
- Setiap tool punya `inputSchema` pake Zod
- Minimal 2 tool dalam satu agent
- Ada error handling di tiap tool
- Agent bisa milih tool yang tepat sesuai pertanyaan

---

**Next → Sesi 3: Agent Memory** — bikin agent yang ingat percakapan sebelumnya.
