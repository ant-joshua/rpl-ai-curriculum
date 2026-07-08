<img src="https://images.pexels.com/photos/8386437/pexels-photo-8386437.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="AI Agents" style="width:100%;border-radius:12px;margin:12px 0;">

# 07. Mastra AI Framework

> **Level:** 📐 Intermediate -> 🚀 Advanced  
> **Jam:** 12 (5 minggu x 2 sesi)  
> **Prasyarat:** JavaScript Fundamentals, TypeScript Basics, Node.js Basics  
> **Output:** AI agents dengan tools, memory, RAG, workflows

## 📚 Tujuan Pembelajaran

Setelah menyelesaikan modul ini, siswa mampu:

1. **Paham konsep AI Agents** — beda antara panggil API langsung vs pake agent framework
2. **Setup project Mastra** — install, init project, konfigurasi environment
3. **Bikin agent pertama** — agent dengan instructions, model, dan basic generate/stream
4. **Bikin tools kustom** — `createTool()` dengan Zod schema untuk input validation
5. **Implementasi memory** — agent ingat percakapan, thread persistence, multi-session
6. **RAG (Retrieval-Augmented Generation)** — agent jawab dari dokumen internal pake vector search
7. **Multi-step workflows** — chaining agent, conditional branching, parallel execution
8. **Production patterns** — error handling, best practices, debugging agent

## 🗺️ Sesi Pembelajaran

| Sesi | Topik | File | Prasyarat |
|------|-------|------|-----------|
| 1 | Mastra Intro, Project Setup, Agent Pertama | [01-mastra-intro.md](01-mastra-intro.md) | - |
| 2 | Tools: createTool + Zod Schema | [02-agent-tools.md](02-agent-tools.md) | Sesi 1 |
| 3 | Memory: Conversation History & Thread | [03-agent-memory.md](03-agent-memory.md) | Sesi 2 |
| 4 | RAG: Vector Search & Knowledge Base | [04-agent-rag.md](04-agent-rag.md) | Sesi 3 |
| 5 | Workflows: Multi-Step Agent Pipeline | [05-agent-workflows.md](05-agent-workflows.md) | Sesi 4 |

## 🚀 Contoh Agent

```typescript
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get weather for a city',
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    return { output: `${location}: 28°C, cerah` };
  },
});

const agent = new Agent({
  id: 'weather-agent',
  name: 'Cuaca Assistant',
  instructions: 'Kamu asisten cuaca. Pake weatherTool.',
  model: 'openai/gpt-4.1-nano',
  tools: { weatherTool },
});

const response = await agent.generate('Cuaca di Jakarta?');
console.log(response.text);
```

## 📖 Referensi Cepat

| Resource | Deskripsi |
|----------|-----------|
| [Cheatsheet](cheatsheet.md) | Sintaks penting & tips dalam 1 halaman |
| [Quiz](quiz.md) | Tes pemahaman 10 soal interaktif |

## 🛠️ Prasyarat Detail

- **JavaScript ES6+**: arrow functions, async/await, destructuring
- **TypeScript dasar**: tipe, interface, generic
- **Node.js**: npm, module system, environment variables
- **API concept**: HTTP, JSON, REST API basics (optional)

## 📦 Dependencies Utama

```bash
npm install @mastra/core zod openai
npm install -D @mastra/cli typescript tsx
```

## 📝 Catatan Penting

- Semua kode menggunakan **Mastra v1.x** dengan import pattern `@mastra/core/agent`
- Bahasa pemrograman: **TypeScript** (JavaScript dengan tipe)
- Bahasa instruksi: **Bahasa Indonesia**
- Wajib punya **API key** (OpenAI / Anthropic / provider lain)
- Kode bisa dijalankan dengan `npx tsx src/index.ts`
