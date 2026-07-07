# RPL AI Tutor — Mastra Agent

Agent tutor otomatis untuk kurikulum SMK RPL AI. Dibangun dengan **Mastra AI** + **Express** + **OpenAI**.

## Struktur Project

```
templates/ai-tutor/
├── src/
│   ├── agent.ts      # Definisi agent Mastra
│   ├── index.ts      # Express server (API endpoint)
│   └── rag.ts        # RAG pipeline sederhana
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Prerequisites

- Node.js >= 18
- npm atau yarn
- API key OpenAI (atau provider lain)

## Setup

```bash
# Clone / masuk ke direktori project
cd templates/ai-tutor

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Isi .env dengan API key
# OPENAI_API_KEY=sk-...
# MODULE_DIR=../../modul  # path ke direktori modul kurikulum

# Compile TypeScript
npx tsc

# Jalankan server
node dist/index.js
```

Atau dengan ts-node untuk development:

```bash
npx ts-node src/index.ts
```

## Environment Variables

| Variable       | Default            | Description                           |
| -------------- | ------------------ | ------------------------------------- |
| `OPENAI_API_KEY` | —                | API key OpenAI                         |
| `MODEL_NAME`   | `gpt-4o`           | Model OpenAI yang digunakan            |
| `MODULE_DIR`   | `../../modul`      | Path ke direktori modul (.md files)    |
| `PORT`         | `3000`             | Port server                            |
| `RATE_LIMIT`   | `10`               | Max request per menit per IP           |

## API

### POST /api/chat

Streaming chat ke agent tutor.

**Request Body:**

```json
{
  "message": "Apa itu neural network?",
  "history": [
    {"role": "user", "content": "Halo"},
    {"role": "assistant", "content": "Halo! Ada yang bisa dibantu?"}
  ]
}
```

**Response:** SSE (Server-Sent Events) stream.

## RAG Pipeline

Agent otomatis mencari konteks relevan dari file .md di direktori modul sebelum menjawab. Pipeline:

1. Baca semua file `.md` dari `MODULE_DIR`
2. Split per section (`##` header)
3. Embed dengan OpenAI embeddings
4. Cari section paling relevan dengan cosine similarity
5. Kirim konteks ke agent sebagai context

## Rate Limiting

Simple in-memory rate limiter — 10 request/menit per IP. Ubah via env `RATE_LIMIT`.
