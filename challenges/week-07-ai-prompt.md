# Week 07: AI Agent — Tools dengan Mastra

## Tujuan

Membangun **AI agent** sederhana menggunakan **Mastra** framework dengan 3 tool bawaan:
1. **Tool Cuaca** — cek cuaca berdasarkan nama kota
2. **Tool Kalkulator** — operasi matematika dasar
3. **Tool Pencarian** — search web / informasi

Challenge ini memperkenalkan konsep function calling / tool use yang menjadi fondasi AI agent.

## Acceptance Criteria

- [ ] Project menggunakan Mastra (`@mastra/core`)
- [ ] Minimal 3 custom tool terdefinisi: `weatherTool`, `calculatorTool`, `searchTool`
- [ ] Tool cuaca menerima input `kota` dan mengembalikan suhu + deskripsi cuaca (bisa mock data)
- [ ] Tool kalkulator mendukung: tambah, kurang, kali, bagi
- [ ] Tool pencarian menerima query dan mengembalikan hasil (bisa mock atau integrasi API nyata)
- [ ] Agent bisa menerima prompt natural language dan memilih tool yang tepat
- [ ] Output agent ditampilkan di terminal (CLI mode)
- [ ] Ada error handling untuk tool yang gagal (misal: pembagian dengan nol)
- [ ] File utama: `agent.ts` atau `agent.js`
- [ ] Dijalankan dengan `node agent.js` atau `npx tsx agent.ts`

## Step-by-Step

1. **Setup project**
   ```bash
   mkdir -p challenges/submissions/week-07/nama-kamu
   cd challenges/submissions/week-07/nama-kamu
   npm init -y
   npm install @mastra/core dotenv
   npm install -D typescript tsx @types/node  # jika pakai TS
   ```
2. **Buat file** `tools/weather.js`
   ```js
   import { createTool } from '@mastra/core/tools';

   export const weatherTool = createTool({
     id: 'weather',
     description: 'Cek cuaca di suatu kota',
     inputSchema: { type: 'object', properties: { kota: { type: 'string' } } },
     execute: async ({ context: { kota } }) => {
       // Mock: return data cuaca statis berdasarkan kota
       return { suhu: '28°C', kondisi: 'Cerah', kota };
     },
   });
   ```
3. **Buat file** `tools/calculator.js`
   ```js
   export const calculatorTool = createTool({
     id: 'calculator',
     description: 'Operasi matematika dasar',
     inputSchema: {
       type: 'object',
       properties: {
         operasi: { type: 'string', enum: ['tambah', 'kurang', 'kali', 'bagi'] },
         a: { type: 'number' },
         b: { type: 'number' },
       },
     },
     execute: async ({ context: { operasi, a, b } }) => {
       // Implementasi switch case
       // Handle: pembagian dengan 0
     },
   });
   ```
4. **Buat file** `tools/search.js`
   ```js
   export const searchTool = createTool({
     id: 'search',
     description: 'Cari informasi di web',
     inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
     execute: async ({ context: { query } }) => {
       // Bisa mock, atau integrasi dengan SerpAPI / Google Search
       return { results: ['Hasil 1', 'Hasil 2'] };
     },
   });
   ```
5. **Buat file** `agent.js`
   ```js
   import { Agent } from '@mastra/core/agent';
   import { weatherTool } from './tools/weather';
   import { calculatorTool } from './tools/calculator';
   import { searchTool } from './tools/search';

   const agent = new Agent({
     name: 'RPL AI Agent',
     instructions: 'Kamu adalah asisten AI yang bisa cek cuaca, hitung matematika, dan cari informasi.',
     model: { provider: 'OPEN_AI', name: 'gpt-4o' },  // atau provider lain
     tools: { weatherTool, calculatorTool, searchTool },
   });
   ```
6. **Buat CLI runner**
   ```js
   // index.js — baca input dari terminal, panggil agent, tampilkan response
   const response = await agent.generate(userInput);
   console.log(response.text);
   ```

### Contoh Interaksi

```
$ node index.js
> Kamu: Cuaca di Jakarta hari ini?
> Agent: Cuaca di Jakarta saat ini 28°C dengan kondisi Cerah.

> Kamu: Hitung 15000 ditambah 27500
> Agent: Hasil perhitungan: 15000 + 27500 = 42500.

> Kamu: Cari tentang React JS
> Agent: Berikut hasil pencarian tentang React JS: ...
```

## Bonus (Optional)

- ✅ Integrasi **OpenWeatherMap API** real (gunakan API key dari `.env`)
- ✅ Integrasi **Google Search / SerpAPI** real
- ✅ **Web server** mode (Express) — agent bisa dipanggil via HTTP
- ✅ **Memory**: agent ingat konteks percakapan sebelumnya
- ✅ Multi-turn conversation di CLI (loop sampai user ketik "exit")

## Submission

```
challenges/submissions/week-07/nama-kamu/
├── agent.js
├── tools/
│   ├── weather.js
│   ├── calculator.js
│   └── search.js
├── index.js        (CLI runner)
├── package.json
└── .env.example
```

Buat Pull Request dengan judul `[Week 07] AI Agent Tools - Nama Kamu` dan sertakan screenshot hasil eksekusi di terminal.
