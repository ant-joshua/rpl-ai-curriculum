# 🤖 Latihan Mastra AI

> 8 latihan konsep Mastra AI Framework — dari agent dasar sampai multi-agent workflow.
> Karena Mastra membutuhkan Node.js + API key, setiap latihan juga menyediakan simulasi browser-friendly
> yang bisa dijalankan di ExerciseRunner.

---

## 📋 Daftar Latihan

| # | File | Topik | Level |
|---|------|-------|-------|
| 1 | [01-agent-basic.md](./01-agent-basic.md) | Agent Dasar, Generate Text, Simulasi Knowledge | 🌱 Beginner |
| 2 | [02-agent-tools.md](./02-agent-tools.md) | Calculator Tool, Tool Executor, Error Handling | 🌱 Beginner |
| 3 | [03-agent-memory.md](./03-agent-memory.md) | Memory, Conversational Context, SimpleMemory | 📐 Intermediate |
| 4 | [04-agent-rag.md](./04-agent-rag.md) | RAG Pipeline, Document Retrieval, Context Injection | 📐 Intermediate |
| 5 | [05-workflow-chain.md](./05-workflow-chain.md) | Sequential Workflow, Writer → Editor → Formatter | 📐 Intermediate |
| 6 | [06-workflow-parallel.md](./06-workflow-parallel.md) | Parallel Execution, Promise.all, Merge Results | 📐 Intermediate |
| 7 | [07-llm-call.md](./07-llm-call.md) | Structured Output, Zod Schema, Review Analysis | 📐 Intermediate |
| 8 | [08-agent-communication.md](./08-agent-communication.md) | Multi-Agent, Orchestrator, Specialist Agents | 🚀 Advanced |

---

## Cara Menjalankan

1. Buka file `.md` di LMS.
2. Untuk **simulasi browser**: copy simulasi JS ke ExerciseRunner, klik Run.
3. Untuk **Mastra asli** (butuh Node.js):
   - `npm create mastra@latest`
   - Copy starter code Mastra ke project.
   - Set API key: `export OPENAI_API_KEY=sk-...`
   - Jalankan dengan `tsx src/index.ts`

> **Catatan:** Simulasi browser sudah mencakup konsep inti (tools, memory, RAG, workflow)
> tanpa perlu API key. Cocok untuk belajar konsep sebelum implementasi dengan Mastra asli.
