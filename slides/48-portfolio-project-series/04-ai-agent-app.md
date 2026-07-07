---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 🚀 Portfolio Project Series"
footer: "Sesi 04: Ai Agent App"
---

<!-- _class: title -->
# Sesi 04: AI Chat Assistant

> **Project 4 dari 5** — AI Chat Assistant dengan Mastra AI + Next.js

---

## 🎯 Tujuan

- Setup framework Mastra AI untuk membangun AI agent
- Membuat agent dengan tools (function calling)
- Implementasi streaming response
- Menambahkan RAG memory untuk konteks percakapan
- Membangun frontend chat interface dengan Next.js
- Deploy ke Vercel

---

## 📋 Deliverable

- Live AI agent app: `https://ai-chat-namakamu.vercel.app`
- GitHub repo: `github.com/namakamu/ai-chat-assistant`

---

## 🧰 Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| Mastra AI | Framework AI agent |
| OpenAI / Claude | LLM provider |
| Next.js 14 | Frontend + API routes |
| Tailwind CSS | Styling UI |
| Vercel AI SDK | Streaming chat |
| Upstash / Redis | RAG memory storage |

---

## 📝 Langkah 1: Setup Project

```bash
npx create-mastra@latest ai-chat-assistant
cd ai-chat-assistant


---

# Atau manual:
mkdir ai-chat-assistant && cd ai-chat-assistant
npm init -y
npm install @mastra/core @mastra/memory @mastra/tts openai ai @ai-sdk/openai
npm install next react react-dom
npm install -D typescript @types/node @types/react tailwindcss
```

Struktur project:

```
ai-chat-assistant/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts
│   ├── agents/
│   │   └── assistant.ts
│   ├── tools/
│   │   ├── weather.ts
│   │   └── search.ts
│   ├── memory/
│   │   └── index.ts
│   └── lib/
│       └── mastra.ts
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── .env.local
```

---

## 📝 Langkah 2: Environment Variables

`.env.local`:

```env

---

# Pilih salah satu provider:
OPENAI_API_KEY="sk-..."

---

# ATAU
ANTHROPIC_API_KEY="sk-ant-..."


---

# Redis untuk memory (opsional)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

---

## 📝 Langkah 3: Setup Mastra Client

`src/lib/mastra.ts`:

```typescript
import { Mastra } from '@mastra/core';
import { assistantAgent } from '../agents/assistant';

export const mastra = new Mastra({
  agents: { assistant: assistantAgent },
});
```

---

## 📝 Langkah 4: Tools

### Tool 1: Weather

`src/tools/weather.ts`:

```typescript
import { createTool } from '@mastra/core';
import { z } from 'zod';

interface WeatherResponse {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Dapatkan informasi cuaca untuk suatu kota',
  inputSchema: z.object({
    location: z.string().describe('Nama kota atau lokasi'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    description: z.string(),
    humidity: z.number(),
    windSpeed: z.number(),
    location: z.string(),
  }),
  execute: async ({ context: { location } }): Promise<WeatherResponse> => {
    // Dalam production, panggil API cuaca sungguhan
    // Contoh: https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}

    // Simulasi response untuk development
    const mockData: Record<string, WeatherResponse> = {
      jakarta: {
        temperature: 32,
        description: 'Cerah berawan',
        humidity: 78,
        windSpeed: 12,
        location: 'Jakarta, Indonesia',
      },
      bandung: {
        temperature: 24,
        description: 'Berawan',
        humidity: 65,
        windSpeed: 8,
        location: 'Bandung, Indonesia',
      },
      surabaya: {
        temperature: 33,
        description: 'Cerah',
        humidity: 70,
        windSpeed: 10,
        location: 'Surabaya, Indonesia',
      },
      'new york': {
        temperature: 18,
        description: 'Partly cloudy',
        humidity: 55,
        windSpeed: 15,
        location: 'New York, US',
      },
      tokyo: {
        temperature: 22,
        description: 'Light rain',
        humidity: 80,
        windSpeed: 10,
        location: 'Tokyo, Japan',
      },
    };

    const key = location.toLowerCase().trim();
    const data = mockData[key];

    if (!data) {
      return {
        temperature: 28,
        description: 'Data tidak tersedia, menampilkan perkiraan default',
        humidity: 60,
        windSpeed: 5,
        location: location,
      };
    }

    return data;
  },
});
```

### Tool 2: Calculator

`src/tools/calculator.ts`:

```typescript
import { createTool } from '@mastra/core';
import { z } from 'zod';

export const calculatorTool = createTool({
  id: 'calculator',
  description: 'Lakukan operasi matematika',
  inputSchema: z.object({
    expression: z.string().describe('Ekspresi matematika (contoh: 2 + 3 * 4)'),
  }),
  execute: async ({ context: { expression } }) => {
    // Hanya izinkan karakter yang aman
    const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
    try {
      // Gunakan Function constructor (AMAN karena sudah di-sanitize)
      const result = new Function(`return (${sanitized})`)();
      return {
        expression,
        result: String(result),
      };
    } catch {
      return {
        expression,
        result: 'Error: ekspresi tidak valid',
      };
    }
  },
});
```

### Tool 3: Web Search (Simulasi)

`src/tools/search.ts`:

```typescript
import { createTool } from '@mastra/core';
import { z } from 'zod';

export const searchTool = createTool({
  id: 'web-search',
  description: 'Cari informasi di web. Gunakan ketika user bertanya tentang berita atau informasi terkini.',
  inputSchema: z.object({
    query: z.string().describe('Pertanyaan atau kata kunci pencarian'),
  }),
  execute: async ({ context: { query } }) => {
    // Dalam production, gunakan API search seperti SerpAPI, Tavily, atau Firecrawl
    // const result = await firecrawl.search(query);

    return {
      query,
      results: [
        {
          title: `${query} - Wikipedia`,
          snippet: `Informasi lengkap tentang ${query} dari ensiklopedia digital terbesar di dunia.`,
          url: `https://id.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        },
        {
          title: `Berita terbaru ${query}`,
          snippet: `Kumpulan berita dan artikel terbaru mengenai ${query}.`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        },
      ],
    };
  },
});
```

---

## 📝 Langkah 5: Memory (RAG Context)

`src/memory/index.ts`:

```typescript
import { Memory } from '@mastra/memory';

// In-memory storage untuk development
// Dalam production, ganti dengan memori persisten (Redis/PostgreSQL)
interface MemoryEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

class ChatMemory {
  private conversations: Map<string, MemoryEntry[]> = new Map();
  private maxEntries = 50; // Max entries per session

  async add(sessionId: string, entry: MemoryEntry): Promise<void> {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, []);
    }
    const entries = this.conversations.get(sessionId)!;
    entries.push(entry);

    // Prune jika terlalu panjang
    if (entries.length > this.maxEntries) {
      this.conversations.set(sessionId, entries.slice(-this.maxEntries));
    }
  }

  async getContext(sessionId: string): Promise<string> {
    const entries = this.conversations.get(sessionId) || [];
    return entries
      .slice(-10) // Ambil 10 pesan terakhir untuk konteks
      .map((e) => `${e.role === 'user' ? 'User' : 'Assistant'}: ${e.content}`)
      .join('\n');
  }

  async clear(sessionId: string): Promise<void> {
    this.conversations.delete(sessionId);
  }
}

export const chatMemory = new ChatMemory();
```

---

## 📝 Langkah 6: AI Agent

`src/agents/assistant.ts`:

```typescript
import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { weatherTool } from '../tools/weather';
import { calculatorTool } from '../tools/calculator';
import { searchTool } from '../tools/search';
import { chatMemory } from '../memory';

// Pilih provider:
// OpenAI: openai('gpt-4o')
// Claude: anthropic('claude-3-5-sonnet-20241022')
const model = openai('gpt-4o');

export const assistantAgent = new Agent({
  name: 'AI Assistant',
  instructions: `
Kamu adalah asisten AI yang membantu dan ramah. Kamu bisa:

1. Menjawab pertanyaan umum dengan akurat
2. Mencari informasi cuaca (gunakan tool get-weather)
3. Menghitung matematika (gunakan tool calculator)
4. Mencari informasi terbaru (gunakan tool web-search)
5. Mengingat konteks percakapan sebelumnya

Gunakan tools saat dibutuhkan. Jika tidak yakin, akui saja.
Bahasa utama: Bahasa Indonesia. Jawab dengan jelas dan ringkas.

Ketika user bertanya tentang cuaca, SELALU gunakan tool get-weather.
Ketika user meminta perhitungan, SELALU gunakan tool calculator.
Ketika user bertanya tentang berita atau informasi terkini, gunakan tool web-search.
  `,
  model,
  tools: [weatherTool, calculatorTool, searchTool],
  memory: {
    // Integrasi dengan memory system Mastra
    // Konfigurasikan sesuai dokumentasi @mastra/memory
  },
});

// Helper untuk chat dengan memory
export async function chatWithAgent(sessionId: string, message: string) {
  // Dapatkan konteks dari memory
  const context = await chatMemory.getContext(sessionId);

  // Kirim pesan ke agent
  const response = await assistantAgent.generate([
    {
      role: 'system',
      content: `Context percakapan sebelumnya:\n${context}\n---`,
    },
    {
      role: 'user',
      content: message,
    },
  ]);

  // Simpan ke memory
  await chatMemory.add(sessionId, { role: 'user', content: message, timestamp: Date.now() });
  await chatMemory.add(sessionId, {
    role: 'assistant',
    content: response.text,
    timestamp: Date.now(),
  });

  return response;
}
```

---

## 📝 Langkah 7: API Route (Next.js)

`src/app/api/chat/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Tools untuk AI SDK
const weatherTool = tool({
  description: 'Dapatkan informasi cuaca untuk suatu kota',
  parameters: z.object({
    location: z.string().describe('Nama kota'),
  }),
  execute: async ({ location }) => {
    const mockData: Record<string, any> = {
      jakarta: { temperature: 32, description: 'Cerah berawan' },
      bandung: { temperature: 24, description: 'Berawan' },
    };
    return mockData[location.toLowerCase()] || { temperature: 28, description: 'Data tidak tersedia' };
  },
});

const calculatorTool = tool({
  description: 'Lakukan operasi matematika',
  parameters: z.object({
    expression: z.string().describe('Ekspresi matematika'),
  }),
  execute: async ({ expression }) => {
    const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
    try {
      const result = new Function(`return (${sanitized})`)();
      return { result: String(result) };
    } catch {
      return { error: 'Ekspresi tidak valid' };
    }
  },
});

// Pilih model
const model = openai('gpt-4o');

// Memory sederhana (in-memory)
const sessions = new Map<string, any[]>();

export async function POST(req: NextRequest) {
  const { messages, sessionId } = await req.json();

  // Simpan session untuk memory
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  const history = sessions.get(sessionId)!;

  // Ambil 10 pesan terakhir dari history
  const contextMessages = history.slice(-10);

  const result = streamText({
    model,
    system: `Kamu asisten AI ramah berbahasa Indonesia. Gunakan tools jika perlu.`,
    messages: [...contextMessages, ...messages],
    tools: {
      getWeather: weatherTool,
      calculate: calculatorTool,
    },
  });

  // Simpan pesan user ke history setelah response
  const lastUserMsg = messages[messages.length - 1];
  if (lastUserMsg?.role === 'user') {
    history.push(lastUserMsg);
  }

  // Streaming response
  return result.toDataStreamResponse({
    onFinish: async (event) => {
      // Simpan response assistant ke history
      history.push({
        role: 'assistant',
        content: event.text,
      });
      sessions.set(sessionId, history);
    },
  });
}

// Endpoint untuk clear session
export async function DELETE(req: NextRequest) {
  const { sessionId } = await req.json();
  sessions.delete(sessionId);
  return Response.json({ success: true });
}
```

---

## 📝 Langkah 8: Frontend Chat Interface

`src/app/page.tsx`:

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: { sessionId },
    onFinish: () => {
      // Scroll ke bawah setelah selesai
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
  });

  // Auto-scroll saat pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChat = async () => {
    await fetch('/api/chat', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Chat Assistant</h1>
            <p className="text-sm text-gray-500">Tanya apa saja — AI siap membantu</p>
          </div>
          <button
            onClick={clearChat}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
          >
            Hapus Percakapan
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Halo! Ada yang bisa dibantu?</h2>
              <p className="text-gray-500">
                Coba tanyakan cuaca, hitung matematika, atau diskusi apa saja.
              </p>
            </div>
          )}

          {messages.map((m: Message) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-3 ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white shadow-sm border rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                {m.role === 'assistant' && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                    <button className="text-xs text-gray-400 hover:text-gray-600">Copy</button>
                    <button className="text-xs text-gray-400 hover:text-gray-600">👍</button>
                    <button className="text-xs text-gray-400 hover:text-gray-600">👎</button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm border rounded-2xl rounded-bl-md px-6 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="bg-white border-t px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ketik pesan..."
              disabled={isLoading}
              className="flex-1 px-5 py-3 border rounded-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kirim
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI dapat membuat kesalahan. Verifikasi informasi penting.
          </p>
        </div>
      </footer>
    </div>
  );
}
```

---

## 📝 Langkah 9: Layout & Styling

`src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Chat Assistant',
  description: 'AI Chat Assistant dengan Mastra AI + Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

`src/app/globals.css`:

```css
@import "tailwindcss";
```

---

## 📝 Langkah 10: Konfigurasi

`next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@mastra/core', '@mastra/memory'],
  },
};

module.exports = nextConfig;
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 📝 Langkah 11: Test Lokal

```bash
npm run dev

---

# → http://localhost:3000
```

Coba:
1. "Apa cuaca di Jakarta?"
2. "Hitung 25 * 4 + 10"
3. "Siapa presiden pertama Indonesia?"
4. "Apa yang kita bicarakan sebelumnya?" (test memory)

> ![Screenshot](https://via.placeholder.com/800x400?text=AI+Chat+Assistant+Local)

---

## 📝 Langkah 12: Deploy ke Vercel

```bash

---

# Install Vercel CLI
npm i -g vercel


---

# Deploy
vercel


---

# Atau hubungkan GitHub:

---

# 1. Push ke GitHub

---

# 2. Buka vercel.com → Import repo

---

# 3. Set environment variables:

---

#    - OPENAI_API_KEY

---

# 4. Deploy
```

> ![Screenshot](https://via.placeholder.com/800x400?text=AI+Chat+Deploy+Vercel)

---

## 📝 Pengembangan Lanjutan: RAG dengan Dokumen

Untuk membuat agent bisa membaca dokumen (PDF, website, dll):

```bash
npm install @mastra/rag @mastra/embeddings
```

`src/memory/rag.ts`:

```typescript
import { RAG } from '@mastra/rag';

// Inisialisasi RAG dengan embedding
const rag = new RAG({
  embeddings: {
    provider: 'openai',
    model: 'text-embedding-3-small',
  },
  // Vector store bisa pakai:
  // - PostgreSQL (pgvector)
  // - Pinecone
  // - Supabase
  storage: {
    type: 'postgres',
    connectionString: process.env.DATABASE_URL!,
  },
});

// Index dokumen
export async function indexDocument(content: string, metadata?: any) {
  await rag.index({
    documents: [{ content, metadata }],
  });
}

// Search konteks relevan
export async function searchContext(query: string) {
  const results = await rag.search(query, { topK: 3 });
  return results.map((r) => r.content).join('\n\n');
}
```

---

## 🧪 Latihan

1. **Multiple models** — tambahkan toggle antara GPT-4o dan Claude 3.5 Sonnet
2. **Voice input** — integrasikan Web Speech API untuk input suara
3. **Image analysis** — buat tool yang bisa menganalisa gambar menggunakan GPT-4 Vision
4. **Code execution** — tambahkan tool untuk menjalankan kode Python/JS di sandbox
5. **Markdown rendering** — render kode block dengan syntax highlighting (react-markdown + rehype)
6. **Persistent memory** — ganti in-memory dengan Redis/PostgreSQL
7. **Chat history** — tampilkan list percakapan sebelumnya, bisa switch
8. **Share chat** — fitur export/share percakapan sebagai link

---

## ✅ Checklist

- [ ] Setup Mastra AI project
- [ ] Weather tool berfungsi
- [ ] Calculator tool berfungsi
- [ ] Search tool berfungsi
- [ ] Agent bisa memanggil tools sesuai konteks
- [ ] Streaming response (typing effect)
- [ ] Memory percakapan (konteks berlanjut)
- [ ] Chat UI (input, bubble, scroll)
- [ ] Responsive design
- [ ] Deploy ke Vercel
- [ ] API key terkonfigurasi di environment

---

> **Project 4 selesai!** Lanjut ke [Sesi 05: Production Deploy](./05-production-deploy.md)
