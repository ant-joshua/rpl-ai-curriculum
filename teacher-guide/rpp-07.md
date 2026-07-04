# RPP: Mastra AI Framework

| Info | Detail |
|------|--------|
| Kode | RPL-AI-07 |
| Durasi | 5 pertemuan × 90 menit |
| Level | Intermediate → Advanced |
| Prasyarat | JavaScript Fundamentals, TypeScript Basics, Node.js Basics |

## Pertemuan 1: Mastra Intro, Project Setup & Agent Pertama

### Tujuan
- Memahami konsep AI agent vs raw API call
- Setup project Mastra
- Membuat agent pertama

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Apersepsi**: "Beda AI chat biasa vs AI agent?" — demo ChatGPT vs custom agent | Tanya jawab | Browser |
| 20' | **Mastra framework**: install, project structure, folder convention | Ceramah + demo | Terminal, VS Code |
| 20' | **Agent pertama**: new Agent(), instructions, model config | Ceramah + demo | Live code |
| 25' | **Praktik**: Buat "Recipe Agent" — terima input bahan, suggest resep | Hands-on | Starter code |
| 10' | **Refleksi**: Instruksi agent — apa yang bikin agent cerdas vs bodoh? | Diskusi | — |
| 5' | **Preview**: Agent punya alat — tools! | Teaser | Slide |

### Bahan Ajar
- [Module 07 - Mastra AI](../07-mastra-ai/)

---

## Pertemuan 2: Tools — createTool + Zod Schema

### Tujuan
- Membuat custom tools (fungsi callable agent)
- Mendefinisikan input/output dengan Zod
- Menghubungkan tools ke agent

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review agent setup** | Demo cepat | — |
| 20' | **Tools concept**: createTool, id, description, inputSchema, execute | Ceramah + demo | Live code |
| 15' | **Zod schema**: z.string(), z.number(), z.object(), required/optional | Ceramah + demo | Live code |
| 25' | **Praktik**: Buat 3 tools — cuaca, kalkulator, search — untuk satu agent | Hands-on | Starter code |
| 15' | **Test tools**: Panggil agent → agent panggil tool → return hasil | Demo + praktik | Live code |
| 10' | **Refleksi**: Kenapa tools butuh description yang jelas? | Diskusi | — |

### Bahan Ajar
- [Module 07 - Mastra AI](../07-mastra-ai/)

---

## Pertemuan 3: Memory — Agent Ingat Percakapan

### Tujuan
- Implementasi memory pada agent
- Memahami perbedaan stateless vs stateful
- Menyimpan context percakapan

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Demo tanpa memory**: Agent lupa nama setelah ganti pertanyaan | Demo | Live code |
| 20' | **Memory concept**: stateless vs stateful, thread/session, storage | Ceramah + demo | Slide + Live code |
| 20' | **Mastra memory**: setup memory, config, conversation history | Ceramah + demo | Live code |
| 25' | **Praktik**: Tambah memory ke Recipe Agent — sebut "namaku X", agent ingat | Hands-on | Starter project |
| 15' | **Test memory**: Chat 5 turn, agent harus ingat nama & preferensi | Praktik | Terminal |
| 5' | **Refleksi**: Memory = aman atau bahaya? (context window, cost) | Diskusi | — |

### Bahan Ajar
- [Module 07 - Mastra AI](../07-mastra-ai/)

---

## Pertemuan 4: RAG — Vector Search & Knowledge Base

### Tujuan
- Memahami RAG (Retrieval-Augmented Generation)
- Implementasi vector search dengan Mastra
- Membuat knowledge base dari dokumen

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Review memory** | Q&A cepat | — |
| 15' | **RAG concept**: retrieval → context → generation, kenapa RAG | Ceramah + visual | Slide diagram |
| 15' | **Embedding & vector**: similarity search, chunking | Ceramah + demo | Slide |
| 20' | **Mastra RAG**: vector store setup, embed docs, query | Ceramah + demo | Live code |
| 25' | **Praktik**: Buat knowledge base dari 3 dokumen (MD), tanya agent tentang isinya | Hands-on | Starter docs |
| 5' | **Refleksi**: RAG vs fine-tuning — kapan pake mana? | Q&A | — |

### Bahan Ajar
- [Module 07 - Mastra AI](../07-mastra-ai/)

---

## Pertemuan 5: Workflows — Multi-step Agent Pipeline

### Tujuan
- Membuat workflow multi-step
- Menghubungkan beberapa tools & agent dalam pipeline
- Review seluruh modul Mastra

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review RAG** | Kuis | — |
| 15' | **Workflow concept**: step, conditional, branching, error handling | Ceramah + demo | Slide + Live code |
| 20' | **Mastra workflow**: setup, define steps, execute | Ceramah + demo | Live code |
| 25' | **Praktik**: Workflow 3 langkah — input user → tool call → summarize | Hands-on | Starter code |
| 15' | **Final project check**: Review agent siswa — agent + tools + memory + RAG | Show & tell | Terminal |
| 10' | **Refleksi & tindak lanjut**: Preview Modul 08 — Final Project | Q&A | — |

### Bahan Ajar
- [Module 07 - Mastra AI](../07-mastra-ai/)
