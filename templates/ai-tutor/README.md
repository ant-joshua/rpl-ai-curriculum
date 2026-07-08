# AI Tutor — Next.js + Mastra + Prisma

Template aplikasi **AI Tutor** interaktif untuk kurikulum SMK RPL AI. Dibangun dengan **Next.js 14**, **Mastra AI Agent**, dan **Prisma ORM**.

## Stack

| Komponen        | Fungsi                              |
|-----------------|-------------------------------------|
| Next.js 14      | Framework React full-stack          |
| Mastra          | AI Agent framework + tools          |
| Prisma          | ORM untuk database (SQLite default) |
| OpenAI          | LLM provider (gpt-4o-mini)         |
| Tailwind CSS    | Styling UI                          |
| SQLite          | Database lokal (bisa ganti)         |

## Struktur Folder

```
ai-tutor/
├── prisma/
│   └── schema.prisma          # Schema database
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts  # API endpoint chat
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Chat UI
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton
│   └── agent.ts               # Definisi Mastra Agent + tools
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Cara Pake

```bash
# 1. Masuk folder template
cd templates/ai-tutor

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Isi OPENAI_API_KEY di .env

# 4. Setup database
npx prisma db push

# 5. Jalankan development
npm run dev
# Buka http://localhost:3000
```

## Fitur

### AI Agent dengan Tools
Agent tutor pake Mastra dengan dua tool bawaan:
- **getCurrentTime** — Cek waktu & tanggal sekarang
- **calculateGrade** — Hitung nilai akhir (tugas 20%, UTS 30%, UAS 50%)

### Chat Interaktif
- UI chat real-time dengan Tailwind CSS
- Riwayat percakapan tersimpan di database
- Reset percakapan kapan aja

### Database
Pake SQLite via Prisma — ga perlu setup database server. Dua tabel:
- `Conversation` — Sesi chat
- `Message` — Pesan user & agent

## API Endpoint

### `POST /api/chat`

**Request:**
```json
{
  "message": "Jelaskan apa itu REST API",
  "conversationId": "clxxx..." (opsional)
}
```

**Response:**
```json
{
  "reply": "REST API adalah...",
  "conversationId": "clxxx..."
}
```

## Kustomisasi

### Ganti Model AI
Edit `OPENAI_MODEL` di `.env`:
```
OPENAI_MODEL=gpt-4o
```

### Ganti Database ke PostgreSQL
Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Tambah Tool Baru
Edit `src/agent.ts` — tambah object tool dengan schema Zod:
```typescript
const myTool = {
  name: 'toolName',
  description: 'Deskripsi tool',
  parameters: z.object({ ... }),
  execute: async (params) => { ... },
};
```

### Ubah Instruksi Agent
Edit `instructions` di `agent.ts` — ini sistem prompt yang nentuin personality agent.

## Deploy

```bash
npm run build
npm start
```

Bisa deploy ke **Vercel** (serverless) atau **Railway** (long-running).
