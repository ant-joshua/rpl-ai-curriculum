# Sesi 1: Spesifikasi & Arsitektur — E-Commerce AI

> **Durasi:** 2 minggu (Sprint 1) | **Mode:** Kelompok 2-3 orang

---

## 📋 Ringkasan

Sesi ini berfokus pada perancangan domain produk e-commerce, fitur AI (semantic search, rekomendasi, chatbot), dan keputusan arsitektur (microservices vs monolith). Mahasiswa akan menyusun spesifikasi teknis yang menjadi blueprint pengembangan toko online modern dengan kecerdasan buatan.

---

## 1. Product Domain Modeling

### 1.1 Domain Entities & Relationships

```
┌──────────┐     ┌──────────────┐     ┌───────────┐
│   User   │1──N│    Cart      │1──1│   Order   │
└──────────┘     └──────┬───────┘     └─────┬─────┘
       │                │                   │
       │                │                   │
       │         ┌──────▼───────┐    ┌──────▼──────┐
       │         │  CartItem    │    │  OrderItem  │
       │         └──────┬───────┘    └──────┬──────┘
       │                │                   │
       ▼                ▼                   ▼
┌──────────┐     ┌──────────┐     ┌──────────────┐
│ Category │1──N│  Product │N──M│  ProductTag   │
└──────────┘     └────┬─────┘     └──────────────┘
                      │
                      │ vector(1536) embedding
                      ▼
               Semantic Search
               (pgvector cosine sim)
```

### 1.2 UML Class Diagram (TypeScript)

```typescript
// entities.ts
interface User {
  id: string;           // UUID
  name: string;
  email: string;
  password_hash: string;
  role: 'customer' | 'admin';
  created_at: Date;
}

interface Category {
  id: string;
  name: string;
  slug: string;        // URL-friendly
  parent_id: string | null;  // Self-referencing for subcategories
  created_at: Date;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;         // DECIMAL(12,2)
  stock: number;
  category_id: string;
  image_url: string;
  embedding: number[];   // vector(1536) for semantic search
  created_at: Date;
  updated_at: Date;
}

interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  created_at: Date;
  updated_at: Date;
}

interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  created_at: Date;
}

interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shipping_address: string;
  items: OrderItem[];
  created_at: Date;
  updated_at: Date;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;  // Snapshot at purchase time
  quantity: number;
  price: number;          // Price at purchase time
}
```

### 1.3 Domain Events

| Event | Trigger | Handler |
|-------|---------|---------|
| `ProductCreated` | POST /api/products | Generate embedding, index for search |
| `ProductUpdated` | PUT /api/products/:id | Re-generate embedding |
| `OrderPlaced` | POST /api/orders | Reduce stock, send notification |
| `OrderShipped` | PATCH /api/orders/:id/status | Send email tracking |
| `CartAbandoned` | No activity > 24h | Send reminder email (bonus) |

---

## 2. AI Features Architecture

### 2.1 Three AI Features

```
┌─────────────────────────────────────────────────────┐
│                   E-Commerce AI                      │
├─────────────────┬─────────────────┬──────────────────┤
│  Semantic Search│  Recommendation  │  Chatbot CS      │
│                 │  Agent           │  Agent            │
├─────────────────┼─────────────────┼──────────────────┤
│ Embed query →   │ getUserOrderHis- │ trackOrder()     │
│ cosine sim →    │ tory() → getFea- │ searchProducts() │
│ top 10 produk   │ turedProducts()  │ → jawab pertanyaan│
│                 │ → rekomendasi    │                  │
└─────────────────┴─────────────────┴──────────────────┘
```

### 2.2 Semantic Search Pipeline

```
User mengetik "kemeja batik lengan panjang"
        │
        ▼
Embed query → text-embedding-3-small
        │
        ▼
pgvector cosine similarity:
  SELECT id, name, price, 1 - (embedding <=> :query) AS score
  FROM products
  ORDER BY embedding <=> :query
  LIMIT 10
        │
        ▼
Return 10 produk teratas dengan score
```

### 2.3 Recommendation Algorithm

```
Input: userId (from JWT)
        │
        ▼
Tool 1: getUserOrderHistory(userId)
  → List of product IDs yang pernah dibeli
        │
        ▼
Get categories dari riwayat belanja
  → [elektronik, fashion, makanan]
        │
        ▼
Tool 2: getFeaturedProducts(category[])
  → Produk unggulan per kategori
        │
        ▼
Filter out produk yang sudah dibeli
        │
        ▼
LLM Rank & Explain:
  "Kami rekomendasikan 5 produk ini karena..."
        │
        ▼
Return [{product, reason}, ...]
```

### 2.4 Chatbot CS Flow

```
User: "Cek order aku dong"
        │
        ▼
Agent receive message
  → Intent detection: "track_order" or "search_product" or "other"
        │
        ▼
IF intent == "track_order":
  → Tool: trackOrder(orderId)
  → Cek status di database
  → Return status + estimasi

ELIF intent == "search_product":
  → Tool: searchProducts(query)
  → Semantic search
  → Return top 3 produk

ELSE:
  → "Maaf, saya hanya bisa bantu cek order dan cari produk"
```

---

## 3. Microservices vs Monolith Decision

### 3.1 Perbandingan

| Aspek | Monolith | Microservices |
|-------|----------|---------------|
| **Kompleksitas** | Rendah — satu codebase, satu deployment | Tinggi — banyak service, komunikasi network |
| **Development speed** | Cepat di awal | Lambat di awal karena setup infra |
| **Testing** | Mudah — integration test sederhana | Sulit — perlu contract test, mock service |
| **Scalability** | Scale vertical — satu instance besar | Scale horizontal — per service |
| **Team size** | Cocok untuk 2-3 orang | Cocok untuk 5+ orang per service |
| **Deployment** | Satu pipeline | Multiple pipeline, orchestration |
| **Learning curve** | Rendah | Tinggi (Docker, K8s, message broker) |

### 3.2 Keputusan: **Modular Monolith**

Untuk capstone ini (tim 2-3 orang, 8 minggu), arsitektur **Modular Monolith** adalah pilihan terbaik:

```
┌───────────────────────────────────────────────┐
│              Express.js App                    │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Auth     │  │ Product  │  │ Cart/Order │  │
│  │ Module   │  │ Module   │  │ Module     │  │
│  └──────────┘  └──────────┘  └────────────┘  │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ AI       │  │ Payment  │  │ Shared     │  │
│  │ Module   │  │ Module   │  │ (DB, Auth) │  │
│  └──────────┘  └──────────┘  └────────────┘  │
│                                               │
│              PostgreSQL + pgvector            │
└───────────────────────────────────────────────┘
```

**Prinsip Modular Monolith:**
- Satu codebase, satu deployment
- Setiap module punya `routes`, `services`, `models` sendiri
- Module hanya komunikasi via service layer (function call, bukan HTTP)
- Database bersama, tapi module hanya akses tabel miliknya
- Mudah dipisah ke microservices nanti jika diperlukan

### 3.3 Struktur Folder

```
ecommerce-ai/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.middleware.ts
│   │   ├── product/
│   │   │   ├── product.routes.ts
│   │   │   ├── product.service.ts
│   │   │   └── product.model.ts
│   │   ├── cart/
│   │   │   ├── cart.routes.ts
│   │   │   ├── cart.service.ts
│   │   │   └── cart.model.ts
│   │   ├── order/
│   │   │   ├── order.routes.ts
│   │   │   ├── order.service.ts
│   │   │   └── order.model.ts
│   │   └── ai/
│   │       ├── ai.routes.ts
│   │       ├── semantic-search.service.ts
│   │       ├── recommendation.agent.ts
│   │       └── chatbot.agent.ts
│   ├── shared/
│   │   ├── database.ts
│   │   ├── middleware/
│   │   │   ├── error-handler.ts
│   │   │   └── validate.ts
│   │   └── types/
│   └── index.ts
├── tests/
├── prisma/
│   └── schema.prisma
├── docker-compose.yml
└── package.json
```

---

## 4. Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  password_hash String
  role          String   @default("customer") // customer | admin
  cart          Cart?
  orders        Order[]
  created_at    DateTime @default(now())
}

model Category {
  id        String    @id @default(uuid())
  name      String
  slug      String    @unique
  parent_id String?
  parent    Category? @relation("CategoryTree", fields: [parent_id], references: [id])
  children  Category[] @relation("CategoryTree")
  products  Product[]
  created_at DateTime @default(now())
}

model Product {
  id          String         @id @default(uuid())
  name        String
  description String
  price       Decimal        @db.Decimal(12, 2)
  stock       Int
  category_id String
  category    Category       @relation(fields: [category_id], references: [id])
  image_url   String?
  embedding   Unsupported("vector(1536)")? // pgvector
  cart_items  CartItem[]
  order_items OrderItem[]
  created_at  DateTime       @default(now())
  updated_at  DateTime       @updatedAt

  @@index([category_id])
}

model Cart {
  id         String     @id @default(uuid())
  user_id    String     @unique
  user       User       @relation(fields: [user_id], references: [id])
  items      CartItem[]
  created_at DateTime   @default(now())
  updated_at DateTime   @updatedAt
}

model CartItem {
  id         String   @id @default(uuid())
  cart_id    String
  cart       Cart     @relation(fields: [cart_id], references: [id], onDelete: Cascade)
  product_id String
  product    Product  @relation(fields: [product_id], references: [id])
  quantity   Int      @default(1)
  created_at DateTime @default(now())

  @@unique([cart_id, product_id])
}

model Order {
  id               String      @id @default(uuid())
  user_id          String
  user             User        @relation(fields: [user_id], references: [id])
  status           String      @default("pending") // pending|confirmed|shipped|delivered|cancelled
  total            Decimal     @db.Decimal(12, 2)
  shipping_address String
  items            OrderItem[]
  created_at       DateTime    @default(now())
  updated_at       DateTime    @updatedAt

  @@index([user_id])
  @@index([status])
}

model OrderItem {
  id         String   @id @default(uuid())
  order_id   String
  order      Order    @relation(fields: [order_id], references: [id], onDelete: Cascade)
  product_id String
  product    Product  @relation(fields: [product_id], references: [id])
  quantity   Int
  price      Decimal  @db.Decimal(12, 2) // Harga snapshot saat checkout
  created_at DateTime @default(now())
}
```

---

## 5. Latihan

> **Latihan 1:** Product Domain Modeling
> Buat class diagram lengkap untuk domain e-commerce. Sertakan: User, Product, Category, Cart, CartItem, Order, OrderItem. Tentukan relasi, tipe data, dan constraint. Tulis dalam format TypeScript interfaces.

> **Latihan 2:** Arsitektur Decision Document
> Buat dokumen ADR (Architecture Decision Record) yang membandingkan monolith vs microservices untuk proyek ini. Tentukan keputusan akhir dengan alasan. Format: Context → Decision → Consequences.

> **Latihan 3:** SQL Schema Design
> Tulis Prisma schema untuk semua entitas di atas. Sertakan: relasi, indexes, unique constraints, default values. Generate migration dan seed data dummy 20 produk + 5 kategori.

> **Latihan 4:** Semantic Search Flow
> Buat diagram alur semantic search: dari user input → embedding → pgvector query → result. Tulis pseudocode untuk endpoint `POST /api/products/search-semantic`. Sertakan error handling jika embedding API down.

> **Latihan 5:** Recommendation Algorithm Design
> Desain algoritma rekomendasi produk. Tentukan: input, proses (tools yang dipanggil), output format. Buat decision tree untuk menentukan produk apa yang direkomendasikan berdasarkan riwayat belanja.

> **Latihan 6:** Chatbot Intent Mapping
> Buat intent map untuk chatbot CS. Identifikasi 5-8 intent pengguna (track_order, search_product, cancel_order, complaint, return, dll). Tentukan tools apa yang dipanggil untuk setiap intent.

> **Latihan 7:** Modular Monolith Structure
> Setup struktur folder modular monolith untuk proyek ini. Buat file `index.ts` entry point yang mengimpor semua module routes. Pastikan struktur siap untuk development sprint 2.

---

## 💡 Tips

- **Jangan pilih microservices** untuk tim 2-3 orang — kompleksitasnya tidak sebanding.
- **Gunakan Prisma** untuk type safety — schema Prisma adalah source of truth untuk database.
- **Embedding otomatis**: Generate embedding saat produk dibuat/diupdate via Prisma hook atau trigger.
- **Seed data**: Siapkan 20+ produk realistik (nama, harga, deskripsi) untuk development dan demo.

---

| [← Kembali ke README](README.md) | [Lanjut ke Sesi 2: Implementasi & Payment →](02-implementation-payment.md) |
|---|---|
