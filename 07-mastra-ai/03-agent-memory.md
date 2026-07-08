# Sesi 3: Agent Memory

> **Durasi:** 2 sesi (120 menit)
> **Tujuan:** Paham konsep memory pada agent, bisa implementasi conversation history, thread persistence

---

## 1. Kenapa Agent Perlu Memory?

Tanpa memory, tiap pertanyaan ke agent adalah **percakapan baru**:

```typescript
// Tanpa Memory — agent lupa!
const agent = new Agent({
  id: 'pelupa',
  name: 'Si Pelupa',
  instructions: 'Kamu asisten helpful',
  model: 'openai/gpt-4.1-nano',
});

await agent.generate('Namaku Budi');
// Agent: "Halo Budi! Senang bertemu!"

await agent.generate('Siapa namaku?');
// Agent: "Maaf, saya tidak tahu namamu." ❌ Lupa!
```

Dengan memory, agent ingat konteks:

```typescript
// Pake Memory — agent ingat!
const agent = new Agent({
  id: 'si-ingat',
  name: 'Si Ingat',
  instructions: 'Kamu asisten helpful',
  model: 'openai/gpt-4.1-nano',
  memory: { type: 'conversation' },
});

await agent.generate('Namaku Budi');
// Agent: "Halo Budi! Senang bertemu!"

await agent.generate('Siapa namaku?');
// Agent: "Namamu Budi!" ✅ Ingat!
```

---

## 2. Cara Kerja Memory di Mastra

### Conversation History

Memory bekerja dengan nyimpen **riwayat pesan** (message history) dan dikirim ulang ke LLM tiap kali agent dipanggil:

```
User: "Halo"
Agent: "Hai!"
        ↓
History: [{role:user, "Halo"}, {role:assistant, "Hai!"}]
        ↓
User: "Siapa aku?"
        ↓
Prompt ke LLM:
  System: [instructions]
  User: "Halo"
  Assistant: "Hai!"
  User: "Siapa aku?"
        ↓
LLM ngerti konteks → jawab bener
```

### Types of Memory

| Type | Fungsi | Use Case |
|------|--------|----------|
| `conversation` | Chat history dalam session | Obrolan singkat |
| `thread` | Persistent per thread ID | Multi-session chat |
| `summary` | Ringkas history lama | Obrolan panjang |

---

## 3. Implementasi Memory

### Basic Memory

```typescript
import { Agent } from '@mastra/core/agent';

const chatAgent = new Agent({
  id: 'chat-agent',
  name: 'Chatbot',
  instructions: 'Kamu asisten yang ramah. Jawab dalam Bahasa Indonesia.',
  model: 'openai/gpt-4.1-nano',
  memory: { type: 'conversation' },
});

async function chat() {
  // Sesi 1
  const r1 = await chatAgent.generate('Halo! Aku Siti.');
  console.log(r1.text);

  const r2 = await chatAgent.generate('Aku suka coding JavaScript.');
  console.log(r2.text);

  // Sesi 2 — masih ingat!
  const r3 = await chatAgent.generate('Apa bahasa favoritku?');
  console.log(r3.text);
  // "Bahasa favoritmu JavaScript!"
}

chat();
```

### Thread-based Memory

Thread memory buat **multi-session** — user bisa lanjutin obrolan kapan aja:

```typescript
import { Agent } from '@mastra/core/agent';

const supportAgent = new Agent({
  id: 'support-agent',
  name: 'Customer Support',
  instructions: 'Kamu CS yang helpful. Jawab dalam Bahasa Indonesia.',
  model: 'openai/gpt-4.1-nano',
  memory: { type: 'thread' },
});

// Session 1 — user complaint
await supportAgent.generate(
  'Produk A rusak setelah 3 hari pemakaian',
  { threadId: 'user-123' }
);

// Session 2 — next day, masih ingat
await supportAgent.generate(
  'Apa solusi untuk masalah saya?',
  { threadId: 'user-123' }
);
// Agent ingat produk A rusak!
```

### Contoh: Todo List Agent dengan Memory

```typescript
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Simulasi database sederhana
const todos: Array<{ id: string; task: string; done: boolean }> = [];

const addTodoTool = createTool({
  id: 'add-todo',
  description: 'Tambah task ke todo list',
  inputSchema: z.object({ task: z.string() }),
  execute: async ({ task }) => {
    const todo = { id: crypto.randomUUID(), task, done: false };
    todos.push(todo);
    return { output: `Task "${task}" sudah ditambah!` };
  },
});

const listTodoTool = createTool({
  id: 'list-todos',
  description: 'Lihat semua task di todo list',
  inputSchema: z.object({}),
  execute: async () => {
    if (todos.length === 0) return { output: 'Belum ada task.' };
    const list = todos
      .map((t, i) => `${i + 1}. [${t.done ? '✓' : ' '}] ${t.task}`)
      .join('\n');
    return { output: `Todo list:\n${list}` };
  },
});

const todoAgent = new Agent({
  id: 'todo-agent',
  name: 'Todo Manager',
  instructions: `Kamu asisten todo list.
    - Gunakan addTodoTool buat nambah task
    - Gunakan listTodoTool buat lihat task
    - Ingat preferensi user`,
  model: 'openai/gpt-4.1-nano',
  memory: { type: 'conversation' },
  tools: { addTodoTool, listTodoTool },
});

async function test() {
  await todoAgent.generate('Tambah task: belajar Mastra');
  await todoAgent.generate('Tambah task: bikin project AI');
  const resp = await todoAgent.generate('Apa aja task-ku?');
  console.log(resp.text);
}

test();
```

---

## 4. Memory dengan Context Window

LLM punya batas konteks (context window). Memory Mastra bisa **trim** atau **summarize** history lama:

```typescript
const agent = new Agent({
  id: 'long-chat',
  name: 'Long Chat',
  instructions: 'Kamu asisten helpful',
  model: 'openai/gpt-4.1-nano',
  memory: {
    type: 'conversation',
    maxTokens: 4000,     // Potong kalo lebih dari 4000 token
    summarize: true,     // Ringkas history lama
  },
});
```

---

## 5. Working with Conversation State

### Get Conversation History

```typescript
// Cara akses memory langsung (jika agent punya memory)
const history = agent.memory?.getHistory?.();
console.log('Riwayat chat:', history);
```

### Clear Memory

```typescript
// Reset conversation
agent.memory?.clear?.();
```

### Multiple Threads

```typescript
const agent = new Agent({
  id: 'multi-thread',
  name: 'Multi Thread',
  instructions: 'Kamu asisten helpful',
  model: 'openai/gpt-4.1-nano',
  memory: { type: 'thread' },
});

// Tiap user punya thread sendiri
const user1 = await agent.generate('Halo!', { threadId: 'user-1' });
const user2 = await agent.generate('Halo juga!', { threadId: 'user-2' });

// Masing-masing gak saling nyampur
const user1Again = await agent.generate('Siapa aku?', { threadId: 'user-1' });
// User1 ingat percakapan sendiri
```

---

## 6. Memory Patterns yang Sering Dipake

### Pattern 1: Chatbot Sederhana
```typescript
memory: { type: 'conversation' }
// Cocok: chatbot 1 session
```

### Pattern 2: Customer Service
```typescript
memory: { type: 'thread' }
// Cocok: multi-session, tiap user punya thread
```

### Pattern 3: Long Conversation
```typescript
memory: {
  type: 'conversation',
  maxTokens: 8000,
  summarize: true,
}
// Cocok: obrolan panjang, auto-ringkas
```

---

## ✋ Latihan

1. **Chatbot dengan Memory:** Bikin agent yang ingat nama user, hobi, dan preferensi
2. **Multi-Thread Support:** Bikin agent yang handle 3 user berbeda dalam thread terpisah
3. **Todo List + Memory:** Todo agent dengan memory conversation + tools CRUD
4. **Test Memory Loss:** Coba tanya ke agent setelah 10+ pertanyaan — apa masih ingat?

### Kriteria:
- Agent punya `memory` di konfigurasi
- Bisa tes langsung: tanya info, ganti topik, tanya info lama
- (Opsional) implementasi threadId untuk multi-user

---

**Next → Sesi 4: Agent RAG** — bikin agent yang bisa jawab dari dokumen pake vector search.
