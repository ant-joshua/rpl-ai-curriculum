# Mastra AI Agent Starter

Template starter untuk membangun **AI agent** pake **Mastra** framework. Udah include Express server, tool definition, chat endpoint, dan integrasi OpenAI.

## Stack

| Komponen        | Versi        |
|-----------------|--------------|
| Mastra          | ^0.1.17      |
| Express         | ^4.21        |
| TypeScript      | ^5.7         |
| tsx             | ^4.19        |
| Zod             | ^3.24        |
| OpenAI          | (via Mastra) |

## Prerequisites

- Node.js >= 18
- API key OpenAI (atau provider LLM lain)
- Basic pemahaman tentang AI agents & tools

## Struktur Folder

```
mastra-agent/
├── src/
│   ├── index.ts        # Express server + /api/chat endpoint
│   └── agent.ts        # Definisi agent, tools, dan handler
├── .env.example        # Template environment variables
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
└── README.md           # Dokumentasi (ini)
```

## Cara Pake

```bash
# 1. Clone template
npx degit path/ke/mastra-agent my-agent
cd my-agent

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Isi OPENAI_API_KEY di .env

# 4. Jalankan (development)
npm run dev

# 5. Build & production
npm run build
npm start
```

## Environment Variables

| Variable        | Default     | Deskripsi                   |
|-----------------|-------------|-----------------------------|
| `OPENAI_API_KEY`  | —         | API key OpenAI               |
| `PORT`          | `3000`      | Port server                  |
| `MODEL_NAME`    | `gpt-4o-mini` | Model OpenAI yang dipake   |

## API Endpoints

### `POST /api/chat`
Kirim pesan ke AI agent.

**Request:**
```json
{
  "message": "Jam berapa sekarang?"
}
```

**Response:**
```json
{
  "reply": "Sekarang pukul 14:30 WIB"
}
```

### `GET /api/health`
Health check server.

## Cara Kerja Agent

Agent di template ini pake arsitektur Mastra:

1. **Agent definition** (`agent.ts`) — Instance `Agent` dari `@mastra/core` dengan instruksi sistem dan model config.
2. **Tools** — Fungsi yang bisa dipanggil agent. Contoh: `getCurrentTime()`.
3. **Model provider** — Connect ke OpenAI (support provider lain juga).
4. **Chat handler** — `agent.generate(message)` ngembaliin response teks.

## Konsep Mastra

### Agent
Agents di Mastra adalah entity AI yang bisa:
- Generate teks (chat completion)
- Panggil tools/functions
- Maintain context dari percakapan

### Tools
Tools adalah fungsi yang agent bisa panggil secara otonom. Setiap tool punya:
- `name` — Nama unik
- `description` — Deskripsi biar agent tau kapan pake tool ini
- `parameters` — Schema parameter pake Zod
- `execute` — Fungsi yang dijalanin

### Model Providers
Mastra support berbagai LLM provider:
- **OpenAI** — gpt-4o, gpt-4o-mini
- **Anthropic** — Claude 3/3.5
- **Google** — Gemini
- **Groq** — Fast inference
- **Ollama** — Local LLM
- **OpenAI Compatible** — Provider yang pake API format OpenAI

## Contoh Pake di Code

```typescript
import { Agent } from '@mastra/core';

const agent = new Agent({
  name: 'MyAgent',
  instructions: 'Kamu asisten yang helpful.',
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o-mini',
  },
  tools: [myTool],
});

const response = await agent.generate('Halo!');
console.log(response.text);
```

## Development Tips

1. Tambah tools sendiri sesuai kebutuhan (search, kalkulasi, database query, dll).
2. Ganti provider LLM di config agent — bisa pake local LLM via Ollama buat hemat biaya.
3. Tambah memory biar agent ingat context percakapan sebelumnya.
4. Integrasi RAG pipeline biar agent bisa akses knowledge base.

## Catatan

- Template ini pake OpenAI secara default. Ganti provider di `agent.ts` sesuai kebutuhan.
- Tool didefinisikan pake Zod schema — otomatis divalidasi.
- Mode development pake `tsx` buat hot-reload.
- Error dari agent otomatis ditangkap dan dibalikin sebagai JSON error response.

Selamat membangun agent!
