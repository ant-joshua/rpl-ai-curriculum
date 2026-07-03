# 🛒 Capstone 3: E-Commerce + AI

> Bangun toko online modern dengan fitur AI: semantic search, rekomendasi produk, dan chatbot customer service.
> Estimasi: **8 minggu (4 sprint × 2 minggu)** — kelompok 2-3 orang.

---

## 📋 Overview

Capstone ini menggabungkan e-commerce klasik (CRUD produk, keranjang, order) dengan tiga integrasi AI:

1. **Semantic search** — cari produk pakai embedding vector, bukan keyword exact match
2. **Product recommendation agent** — Mastra agent yang rekomendasi produk berdasarkan riwayat belanja
3. **Chatbot customer service** — chat assistant yang bisa cek status order pake tool

Flow utama: user registrasi → lihat/ cari produk → tambah ke keranjang → checkout → lacak order via chatbot.

---

## 🧰 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React / Next.js (Tailwind CSS) |
| **Backend** | Express.js (TypeScript) |
| **Database** | PostgreSQL + pgvector |
| **AI Framework** | Mastra AI |
| **Embedding Model** | OpenAI `text-embedding-3-small` |
| **LLM** | OpenAI GPT-4o-mini / Gemini |
| **Deploy** | Vercel (FE) + Railway (BE + DB) |
| **Auth** | JWT (access + refresh token) |

---

## 🎯 Learning Outcomes

Setelah capstone ini, peserta mampu:

1. ✅ Membangun REST API e-commerce (CRUD, auth, relasi)
2. ✅ Integrasi semantic search dengan embedding + cosine similarity
3. ✅ Bikin Mastra agent dengan tools untuk rekomendasi produk
4. ✅ Bikin Mastra agent + tool untuk chatbot order tracking
5. ✅ Manage session keranjang dan transaksi order
6. ✅ Deploy fullstack app ke Vercel + Railway
7. ✅ Nulis kode TypeScript rapi dengan error handling

---

## 📆 Features by Sprint

### Sprint 1 — Foundation (Minggu 1-2)

**Backend**
- Setup Express + TypeScript + Prisma ORM
- Auth: register, login, JWT middleware
- DB schema: `users`, `categories`, `products`
- CRUD API: categories, products (admin-only)
- Seeder data produk (min 20 produk)

**Frontend**
- Setup Next.js + Tailwind
- Halaman login / register
- Halaman daftar produk (grid)

**Deliverable:** User bisa register, login, lihat produk.

### Sprint 2 — Core Commerce (Minggu 3-4)

**Backend**
- API `carts` — tambah/hapus item, lihat cart
- API `orders` + `order_items` — checkout, riwayat order
- Validasi stok produk

**Frontend**
- Halaman detail produk
- Keranjang belanja (add/remove/quantity)
- Halaman checkout + form alamat
- Halaman riwayat order

**Deliverable:** Full cart-to-order flow jalan.

### Sprint 3 — AI Integration (Minggu 5-6)

**Backend — AI**
- Generate embedding produk (otomatis via hook/seed)
- Semantic search endpoint: `POST /api/products/search-semantic`
- Mastra agent: **Product Recommendation Agent**
  - Tool: `getUserOrderHistory(userId)`
  - Tool: `getFeaturedProducts(category?)`
  - Agent keluarin rekomendasi personal
- Mastra agent: **Customer Service Chatbot**
  - Tool: `trackOrder(orderId)` → cek status + estimasi
  - Tool: `searchProducts(query)` → semantic search
  - Chat endpoint: `POST /api/chat`

**Frontend**
- Search bar dengan semantic result
- Section "Rekomendasi untuk Kamu" di homepage
- Floating chatbot widget (chat bubble UI)

**Deliverable:** Semantic search jalan, rekomendasi muncul, chatbot bisa jawab.

### Sprint 4 — Polish & Deploy (Minggu 7-8)

- Error handling + loading states (UI/UX)
- Responsive mobile
- Testing: minimal 5 API test (supertest / vitest)
- Deploy BE ke Railway + FE ke Vercel
- Presentasi + demo video

**Deliverable:** App live di production.

---

## 🗃️ Data Model

### Entity Relationship

```
users 1──N carts 1──1 orders
users 1──N orders
categories 1──N products N──N carts (via cart_items)
products N──N orders (via order_items)
```

### SQL Tables

#### `users`

| Column | Type | Keterangan |
|--------|------|------------|
| id | UUID PK | Primary key |
| name | VARCHAR(100) | Nama user |
| email | VARCHAR(255) UNIQUE | Email login |
| password_hash | TEXT | bcrypt hash |
| created_at | TIMESTAMPTZ | Auto |

#### `categories`

| Column | Type | Keterangan |
|--------|------|------------|
| id | UUID PK | — |
| name | VARCHAR(100) | Nama kategori |
| slug | VARCHAR(100) UNIQUE | URL-friendly |
| created_at | TIMESTAMPTZ | Auto |

#### `products`

| Column | Type | Keterangan |
|--------|------|------------|
| id | UUID PK | — |
| name | VARCHAR(200) | Nama produk |
| description | TEXT | Deskripsi |
| price | DECIMAL(12,2) | Harga |
| stock | INTEGER | Stok |
| category_id | UUID FK → categories | — |
| image_url | TEXT | URL gambar |
| embedding | vector(1536) | OpenAI embedding |
| created_at | TIMESTAMPTZ | Auto |

> **Catatan:** `embedding` pakai pgvector type `vector(1536)`. Index pakai `IVFFlat` untuk performa.

#### `carts`

| Column | Type | Keterangan |
|--------|------|------------|
| id | UUID PK | — |
| user_id | UUID FK → users | — |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

#### `cart_items`

| Column | Type | Keterangan |
|--------|------|------------|
| id | UUID PK | — |
| cart_id | UUID FK → carts | — |
| product_id | UUID FK → products | — |
| quantity | INTEGER | Jumlah |
| created_at | TIMESTAMPTZ | Auto |

> **UNIQUE constraint:** `(cart_id, product_id)`

#### `orders`

| Column | Type | Keterangan |
|--------|------|------------|
| id | UUID PK | — |
| user_id | UUID FK → users | — |
| status | VARCHAR(20) | pending / confirmed / shipped / delivered / cancelled |
| total | DECIMAL(12,2) | Total harga |
| shipping_address | TEXT | Alamat kirim |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

#### `order_items`

| Column | Type | Keterangan |
|--------|------|------------|
| id | UUID PK | — |
| order_id | UUID FK → orders | — |
| product_id | UUID FK → products | — |
| quantity | INTEGER | Jumlah |
| price | DECIMAL(12,2) | Harga saat beli |
| created_at | TIMESTAMPTZ | Auto |

### Index SQL (pgvector)

```sql
CREATE INDEX idx_products_embedding ON products
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | /api/auth/register | — | Register user baru |
| POST | /api/auth/login | — | Login, return JWT |
| GET | /api/auth/me | ✅ | Profile user |
| GET | /api/products | — | List produk (pagination) |
| GET | /api/products/:id | — | Detail produk |
| POST | /api/products | ✅ Admin | Tambah produk |
| PUT | /api/products/:id | ✅ Admin | Update produk |
| DELETE | /api/products/:id | ✅ Admin | Hapus produk |
| POST | /api/products/search-semantic | — | Semantic search pakai embedding |
| GET | /api/categories | — | List kategori |
| POST | /api/categories | ✅ Admin | Tambah kategori |
| GET | /api/cart | ✅ | Lihat keranjang |
| POST | /api/cart/items | ✅ | Tambah item ke cart |
| DELETE | /api/cart/items/:id | ✅ | Hapus item dari cart |
| PUT | /api/cart/items/:id | ✅ | Update qty item |
| POST | /api/orders | ✅ | Checkout (create order dari cart) |
| GET | /api/orders | ✅ | Riwayat order user |
| GET | /api/orders/:id | ✅ | Detail order |
| POST | /api/chat | ✅ | Chat dengan AI chatbot |
| POST | /api/ai/recommend | ✅ | Dapat rekomendasi produk |

---

## 🤖 AI Integration Detail

### 1. Semantic Search via Embeddings

**Cara kerja:**

1. Tiap produk baru/update → backend generate embedding via `text-embedding-3-small`
2. Embedding disimpan di kolom `products.embedding` (vector 1536)
3. Search: query user di-embedding → cari produk dengan cosine similarity tertinggi via pgvector `ORDER BY embedding <=> $query_vec LIMIT 10`

**Kode konsep (Mastra tool):**

```typescript
import { openai } from '@mastra/openai';
import { createTool } from '@mastra/core';

const semanticSearchTool = createTool({
  name: 'semanticSearch',
  description: 'Cari produk berdasarkan semantic query',
  inputSchema: { query: { type: 'string' } },
  execute: async ({ query }) => {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    const result = await db.query(
      `SELECT id, name, price,
              1 - (embedding <=> $1) AS similarity
       FROM products
       ORDER BY embedding <=> $1
       LIMIT 10`,
      [embedding.data[0].embedding]
    );
    return result;
  },
});
```

### 2. Product Recommendation Agent

**Agent behavior:**

- Input: user ID (implisit dari token)
- Tools:
  - `getUserOrderHistory(userId)` — ambil produk yang pernah dibeli user
  - `getFeaturedProducts(category?)` — ambil produk unggulan per kategori
- Logic: cari produk dari kategori yang sama dengan riwayat belanja → rekomendasi 5 produk
- Output: daftar produk + alasan kenapa direkomendasikan

```typescript
const productRecAgent = new Agent({
  name: 'Product Recommender',
  instructions: `
    Kamu asisten rekomendasi produk e-commerce.
    1. Ambil riwayat order user pakai getUserOrderHistory
    2. Lihat kategori produk yang sering dibeli
    3. Rekomendasi produk dari kategori serupa pakai getFeaturedProducts
    4. Beri 3-5 rekomendasi dengan alasan
  `,
  model: openai('gpt-4o-mini'),
});
```

### 3. Chatbot Customer Service

**Agent behavior:**

- Input: pesan user (bebas: "cek order aku dong", "cari kemeja batik")
- Tools:
  - `trackOrder(orderId)` — cek status + estimasi pengiriman dari DB
  - `searchProducts(query)` — semantic search via endpoint
- Fallback: kalau di luar konteks, jawab sopan "saya hanya bisa bantu soal produk & order"

```typescript
const csChatbot = new Agent({
  name: 'Customer Service',
  instructions: `
    Kamu CS e-commerce yang ramah.
    - Kalau user minta cek order: panggil trackOrder(orderId)
    - Kalau user cari produk: panggil searchProducts(query)
    - Di luar itu: arahkan ke produk atau order
    Selalu jawab dalam Bahasa Indonesia.
  `,
  model: openai('gpt-4o-mini'),
  tools: [trackOrderTool, semanticSearchTool],
});
```

---

## ✅ Deliverables Checklist

- [ ] **GitHub repo** — README rapi, branch `main` + `develop`
- [ ] **Database** — Migrasi Prisma + seed data (≥20 produk, 5 kategori)
- [ ] **Auth** — Register + login dengan JWT
- [ ] **Produk CRUD** — Admin bisa manage produk
- [ ] **Cart & Order** — Full flow: tambah cart → checkout → riwayat
- [ ] **Semantic Search** — Search pakai embedding, return relevan
- [ ] **Recommendation Agent** — Rekomendasi personal di homepage
- [ ] **Chatbot** — Floating chat widget + tool order tracking
- [ ] **Frontend** — Responsive mobile, loading state, error handling
- [ ] **Deployed** — Frontend di Vercel, Backend di Railway
- [ ] **Demo video** — 3-5 menit (fitur + AI)
- [ ] **Slide presentasi** — Max 5 slide
- [ ] **PROMPT-LOG.md** — Semua prompt yang dipakai ke LLM

---

## 📊 Evaluation Rubric

| Kriteria | Bobot | 4 (Excellent) | 3 (Good) | 2 (Fair) | 1 (Poor) |
|----------|-------|---------------|----------|----------|----------|
| **Semua fitur jalan** | 30% | Semua fitur + edge case handling | Fitur utama jalan semua | 1-2 fitur error | >2 fitur rusak |
| **Frontend rapi + responsive** | 20% | UI konsisten, mobile friendly, loading state | Rapi, responsif, minor issue | Ada layout break | Tidak responsif |
| **Backend + database solid** | 20% | Relasi benar, validasi, error handling baik | Relasi benar, validasi ada | Ada relasi error | Struktur berantakan |
| **AI feature integrated** | 15% | Semantic search + rekomendasi + chatbot semua jalan | 2 dari 3 AI fitur jalan | 1 AI fitur jalan | Tidak ada AI |
| **Deployed + demo** | 10% | Live di Vercel+Railway + video demo jelas | Live + ada demo | Salah satu ada | Tidak ada |
| **Code quality + Git** | 5% | TypeScript strict, commit rapi, docs jelas | TypeScript, commit rapi | Campuran JS/TS | Berantakan |

### Nilai Akhir

| Rentang | Grade |
|---------|-------|
| 85-100 | 🏆 A |
| 75-84 | ⭐ B |
| 65-74 | ✅ C |
| <65 | 🔄 Remedial |

---

> 🚀 **Selamat mengerjakan!** Capstone ini adalah capstone paling komplit — backend, frontend, database, AI agent, dan deploy. Fokus Sprint 3 (AI) karena itu yang bikin beda dari e-commerce biasa.
