# Sesi 1: Pengenalan Mastra & Agent Pertama

> **Durasi:** 2 sesi (120 menit)
> **Tujuan:** Paham konsep AI Agent vs raw API call, bisa setup project Mastra, bikin agent pertama

---

## 1. AI Agent vs Raw API Call

### Raw API Call (Cara Lama)

Bayangin lo mau bikin asisten yang bisa ngasih tau cuaca. Kalo pake OpenAI API langsung, lo harus nulis kode manual:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function tanyaCuaca(prompt: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages: [{ role: 'user', content: prompt }],
  });
  return response.choices[0].message.content;
}

console.log(await tanyaCuaca('Cuaca di Jakarta?'));
```

**Masalahnya:**
- Lo manual handle semua logic
- Gak punya `tools` — agent cuma bisa ngomong, gak bisa akses data real
- Gak ada memory bawaan
- Harus bikin sendiri sistem prompt, history, dll

### AI Agent (Pake Mastra)

Dengan Mastra, agent punya **tools**, **memory**, **instructions** built-in:

```typescript
import { Agent } from '@mastra/core/agent';

const agent = new Agent({
  id: 'asisten-ku',
  name: 'Asisten Saya',
  instructions: 'Kamu asisten yang ramah dan helpful.',
  model: 'openai/gpt-4.1-nano',
});

const response = await agent.generate('Halo! Siapa kamu?');
console.log(response.text);
// Output: "Halo! Saya asisten yang ramah. Ada yang bisa saya bantu?"
```

| Aspek | Raw API | Mastra Agent |
|-------|---------|-------------|
| Setup | Manual prompt + API call | `new Agent({...})` |
| Tools | Koding sendiri | `createTool()` built-in |
| Memory | Lo bikin sendiri | Built-in conversation memory |
| Workflows | Manual state machine | `Workflow` class |
| RAG | Manual vector search | `KnowledgeBase` built-in |

---

## 2. Install Mastra

### Prasyarat

- Node.js 18+
- NPM / PNPM / Yarn
- OpenAI API key (atau provider lain)

### Setup Project

Ada 2 cara:

**Cara 1: `npm create mastra` (recommended)**

```bash
npm create mastra@latest my-ai-project
cd my-ai-project
```

Ikuti wizard:
- Pilih template: `empty` (minimal) atau `starter` (dengan contoh)
- Pilih provider: `openai`
- CLI bakal otomatis bikin struktur folder

**Cara 2: Manual setup**

```bash
mkdir my-ai-project
cd my-ai-project
npm init -y
npm install @mastra/core zod openai
npm install -D @mastra/cli typescript tsx
```

Bikin file `.env`:

```bash
OPENAI_API_KEY=sk-your-key-here
```

Bikin `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Struktur Folder Project Mastra

```
my-ai-project/
├── src/
│   ├── agents/        # Definisi agent
│   ├── tools/         # Custom tools
│   ├── workflows/     # Workflow definitions
│   └── index.ts       # Entry point
├── .env
├── package.json
└── tsconfig.json
```

---

## 3. Bikin Agent Pertama

### Simple Greet Agent

Bikin file `src/agents/greet-agent.ts`:

```typescript
import { Agent } from '@mastra/core/agent';

const greetAgent = new Agent({
  id: 'greet-agent',
  name: 'Greeter',
  instructions: `Kamu adalah asisten ramah dalam Bahasa Indonesia.
    - Sapa user dengan hangat
    - Jawab pertanyaan dengan jelas dan singkat
    - Gunakan bahasa casual tapi sopan`,
  model: 'openai/gpt-4.1-nano',
});

export { greetAgent };
```

Bikin file `src/index.ts` buat test:

```typescript
import { greetAgent } from './agents/greet-agent';

async function main() {
  const response = await greetAgent.generate('Halo! Siapa kamu?');
  console.log('Agent:', response.text);

  const response2 = await greetAgent.generate('Apa yang bisa kamu bantu?');
  console.log('Agent:', response2.text);
}

main().catch(console.error);
```

Jalankan:

```bash
npx tsx src/index.ts
```

### Agent dengan System Prompt Kuat

```typescript
import { Agent } from '@mastra/core/agent';

const mentorAgent = new Agent({
  id: 'mentor-rpl',
  name: 'Mentor RPL',
  instructions: `Kamu mentor programming untuk siswa SMK RPL.
    - Jelaskan konsep dengan analogi sederhana
    - Kalo ada kode, kasih contoh yang bisa langsung dicoba
    - Gunakan Bahasa Indonesia sehari-hari
    - Dorong siswa untuk belajar mandiri`,
  model: 'openai/gpt-4.1-nano',
});
```

---

## 4. Agent Methods

Mastra Agent punya beberapa method utama:

| Method | Fungsi |
|--------|--------|
| `agent.generate(prompt)` | Satu kali generate response |
| `agent.stream(prompt)` | Stream response token-by-token |
| `agent.generateText(prompt, options)` | Generate dengan opsi tambahan |

### Contoh Stream

```typescript
const stream = await mentorAgent.stream('Jelaskan apa itu variable di JS?');
for await (const chunk of stream.textStream) {
  process.stdout.write(chunk); // Token by token
}
```

---

## 5. Comparing Approaches

### Tanpa Agent (Raw)

```typescript
// Harus manual: system prompt, history, parsing
const messages = [
  { role: 'system', content: 'Kamu asisten...' },
  { role: 'user', content: 'Halo' },
];
const result = await openai.chat.completions.create({
  model: 'gpt-4.1-nano',
  messages,
});
```

### Dengan Agent (Mastra)

```typescript
// Semua otomatis: instructions, memory, tools
const result = await agent.generate('Halo');
```

**Keuntungan Agent:**
- Abstraksi kompleksitas LLM
- Tools bawaan (gak perlu parse function calling manual)
- Memory otomatis
- Scalable: tambah tools, RAG, workflows tanpa rewrite

---

## ✋ Latihan

1. **Setup Project:** Install Mastra pake `npm create mastra@latest`
2. **Bikin Agent:** Buat agent "Koki Assistant" yang bisa ngasih resep masakan Indonesia
3. **Streaming:** Modifikasi agent pake `.stream()` biar outputnya real-time
4. **Compare:** Tulis ulang salah satu function di atas pake raw OpenAI API — rasain bedanya

### Kriteria:
- Agent harus punya `id`, `name`, `instructions` jelas
- Instructions minimal 3 kalimat dalam Bahasa Indonesia
- Bisa dijalankan pake `npx tsx`

---

**Next → Sesi 2: Agent Tools** — bikin agent yang bisa panggil fungsi eksternal pake `createTool()`.
