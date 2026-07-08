# Sesi 3: AI Engine, Deployment & Testing — E-Commerce AI

> **Durasi:** 2 minggu (Sprint 4) | **Mode:** Kelompok 2-3 orang

---

## 📋 Ringkasan

Sesi terakhir mencakup implementasi AI recommendation engine, deployment ke Vercel/Railway, load testing, dan SEO optimization. Mahasiswa akan menyelesaikan integrasi AI (semantic search, recommendation agent, chatbot), mendeploy aplikasi ke production, dan mengoptimalkan performa serta visibilitas search engine.

---

## 1. AI Recommendation Engine

### 1.1 Recommendation Agent (Mastra)

```typescript
// src/modules/ai/recommendation.agent.ts
import { Agent } from '@mastra/core';
import { openai } from '@mastra/providers';
import { createTool } from '@mastra/core';

export const getUserOrderHistory = createTool({
  name: 'getUserOrderHistory',
  description: 'Ambil riwayat order user untuk analisis preferensi',
  inputSchema: { userId: { type: 'string' } },
  execute: async ({ userId }) => {
    const orders = await prisma.order.findMany({
      where: { user_id: userId, status: { in: ['confirmed', 'delivered'] } },
      include: { items: { include: { product: { include: { category: true } } } } },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    // Aggregate categories
    const categoryCount: Record<string, { name: string; count: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const catName = item.product.category.name;
        if (!categoryCount[catName]) {
          categoryCount[catName] = { name: catName, count: 0 };
        }
        categoryCount[catName].count += item.quantity;
      }
    }

    return {
      recentOrders: orders.length,
      topCategories: Object.values(categoryCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
      totalSpent: orders.reduce((sum, o) => sum + Number(o.total), 0),
    };
  },
});

export const getFeaturedProducts = createTool({
  name: 'getFeaturedProducts',
  description: 'Ambil produk unggulan berdasarkan kategori',
  inputSchema: {
    categories: { type: 'array', items: { type: 'string' } },
    limit: { type: 'number', defaultValue: 5 },
  },
  execute: async ({ categories, limit }) => {
    const products = await prisma.product.findMany({
      where: {
        category: { name: { in: categories } },
        stock: { gt: 0 },
      },
      include: { category: true },
      orderBy: { created_at: 'desc' },
      take: limit * 3, // Ambil lebih banyak untuk filtering
    });

    return products;
  },
});

export const recommendationAgent = new Agent({
  name: 'product-recommender',
  instructions: `
    Kamu adalah asisten rekomendasi produk e-commerce.
    Tugasmu:
    1. Gunakan getUserOrderHistory untuk analisis riwayat belanja user
    2. Identifikasi kategori favorit dari riwayat
    3. Gunakan getFeaturedProducts untuk ambil produk unggulan dari kategori tersebut
    4. Filter out produk yang sudah dibeli user
    5. Berikan 3-5 rekomendasi dengan alasan personal untuk setiap produk
    6. Jawab dalam Bahasa Indonesia yang ramah
  `,
  model: openai('gpt-4o-mini'),
  tools: { getUserOrderHistory, getFeaturedProducts },
});
```

### 1.2 Recommendation API Endpoint

```typescript
// src/modules/ai/ai.routes.ts
router.post('/ai/recommend', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await recommendationAgent.execute({
      task: 'recommend products',
      data: { userId },
    });

    // Parse structured output or use raw text
    res.json({
      success: true,
      data: {
        recommendations: result.recommendations || result,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    // Fallback: return featured products without AI
    const fallback = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { created_at: 'desc' },
      take: 5,
    });
    res.json({
      success: true,
      data: { recommendations: fallback, isFallback: true },
    });
  }
});
```

### 1.3 Chatbot Agent (Customer Service)

```typescript
// src/modules/ai/chatbot.agent.ts
import { Agent } from '@mastra/core';
import { openai } from '@mastra/providers';
import { createTool } from '@mastra/core';

export const trackOrder = createTool({
  name: 'trackOrder',
  description: 'Cek status dan estimasi pengiriman order',
  inputSchema: { orderId: { type: 'string' } },
  execute: async ({ orderId }) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) return { error: 'Order tidak ditemukan' };

    const statusLabels: Record<string, string> = {
      pending: 'Menunggu pembayaran',
      confirmed: 'Dikonfirmasi',
      shipped: 'Dalam pengiriman',
      delivered: 'Telah diterima',
      cancelled: 'Dibatalkan',
    };

    return {
      orderId: order.id,
      status: statusLabels[order.status] || order.status,
      total: Number(order.total),
      items: order.items.map(i => ({ name: i.product.name, quantity: i.quantity })),
      createdAt: order.created_at,
    };
  },
});

export const chatbotAgent = new Agent({
  name: 'customer-service',
  instructions: `
    Kamu adalah CS e-commerce yang ramah dan membantu.
    Aturan:
    - Jika user minta cek order: minta nomor order, lalu panggil trackOrder
    - Jika user cari produk: panggil searchProducts (tool semantic search)
    - Jika user complaint: minta maaf dan arahkan ke email cs@tokomu.com
    - Di luar konteks: arahkan ke produk atau order
    - Selalu jawab dalam Bahasa Indonesia yang sopan
    - Jangan pernah meminta informasi sensitif (password, PIN)
  `,
  model: openai('gpt-4o-mini'),
  tools: { trackOrder },
});
```

---

## 2. Deployment Strategy

### 2.1 Architecture Production

```
                         ┌──────────────┐
                         │   Vercel     │
                         │  Next.js SSR │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │   Railway    │
                         │  Express API │
                         └──────┬───────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                  ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │  PostgreSQL   │  │    Redis     │  │  OpenAI API  │
     │  + pgvector   │  │  (caching)   │  │  (embed+LLM) │
     └──────────────┘  └──────────────┘  └──────────────┘
```

### 2.2 Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://ecommerce-api.railway.app/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### 2.3 Railway Dockerfile

```dockerfile
# Dockerfile (backend)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
```

---

## 3. Load Testing

### 3.1 k6 Load Test Script

```javascript
// tests/load/k6-script.js
import http from 'k6/http';
import { sleep, check } from 'k6';
import { SharedArray } from 'k6/data';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% requests under 2s
    http_req_failed: ['rate<0.05'],    // <5% error rate
  },
};

const products = new SharedArray('products', function () {
  return JSON.parse(open('./products.json')).products;
});

export default function () {
  // 1. Homepage
  const homeRes = http.get('https://ecommerce-ai.vercel.app/');
  check(homeRes, { 'homepage status 200': (r) => r.status === 200 });

  // 2. Product list
  const listRes = http.get('https://ecommerce-api.railway.app/api/products?limit=12');
  check(listRes, { 'products list status 200': (r) => r.status === 200 });

  // 3. Product detail (random)
  const product = products[Math.floor(Math.random() * products.length)];
  const detailRes = http.get(`https://ecommerce-api.railway.app/api/products/${product.id}`);
  check(detailRes, { 'product detail status 200': (r) => r.status === 200 });

  // 4. Semantic search
  const searchRes = http.post(
    'https://ecommerce-api.railway.app/api/products/search-semantic',
    JSON.stringify({ query: 'kemeja' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(searchRes, { 'semantic search status 200': (r) => r.status === 200 });

  sleep(1);
}
```

### 3.2 Hasil yang Diharapkan

| Endpoint | Target p95 | Actual | Status |
|----------|------------|--------|--------|
| GET / | < 2s | — | ⬜ |
| GET /api/products | < 1s | — | ⬜ |
| GET /api/products/:id | < 1s | — | ⬜ |
| POST /api/products/search-semantic | < 3s | — | ⬜ |
| POST /api/ai/recommend | < 5s | — | ⬜ |

### 3.3 Optimasi Performa

| Issue | Solusi |
|-------|--------|
| Query produk lambat | Tambah index di `category_id`, `name`, `price` |
| Embedding search lambat | Gunakan IVFFlat index dengan lists=100 |
| Image loading lambat | Implementasi next/image untuk optimasi gambar |
| API response besar | Implementasi pagination, selective fields |
| Cold start Lambda | Gunakan Railway (server-based, bukan serverless) |

---

## 4. SEO Optimization

### 4.1 Metadata & Open Graph

```tsx
// src/app/products/[id]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);

  return {
    title: `${product.name} | Toko AI`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: [{ url: product.image_url, width: 800, height: 800 }],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description.slice(0, 160),
    },
  };
}
```

### 4.2 Struktur Data Product (JSON-LD)

```tsx
// src/components/product/ProductJsonLd.tsx
export default function ProductJsonLd({ product }: { product: any }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image_url,
    offers: {
      '@type': 'Offer',
      price: Number(product.price),
      priceCurrency: 'IDR',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### 4.3 Sitemap & Robots

```tsx
// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ecommerce-ai.vercel.app';

  const products = await prisma.product.findMany({
    select: { id: true, updated_at: true },
  });

  const productUrls = products.map(product => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...productUrls,
  ];
}
```

---

## 5. Latihan

> **Latihan 1:** Recommendation Agent Implementation
> Implementasi Mastra recommendation agent dengan 2 tools: `getUserOrderHistory` dan `getFeaturedProducts`. Integrasikan ke endpoint `POST /api/ai/recommend`. Test dengan user yang punya riwayat belanja vs user baru (fallback).

> **Latihan 2:** Chatbot CS Integration
> Buat floating chat widget di frontend. Implementasi endpoint `POST /api/chat` yang memanggil Mastra chatbot agent. Tool `trackOrder` harus berfungsi — user bisa cek status order lewat chat.

> **Latihan 3:** Semantic Search Optimization
> Optimasi semantic search: (a) tambah IVFFlat index, (b) implementasi hybrid search (keyword + vector), (c) cache hasil search populer di Redis selama 5 menit. Bandingkan latency sebelum dan sesudah optimasi.

> **Latihan 4:** Deploy Backend ke Railway
> Deploy Express backend ke Railway. Setup PostgreSQL + pgvector. Konfigurasi environment variables. Pastikan semua endpoint bisa diakses dari Postman. Catat langkah-langkah di README.

> **Latihan 5:** Deploy Frontend ke Vercel
> Deploy Next.js frontend ke Vercel. Konfigurasi rewrites untuk proxy API ke Railway. Setup custom domain (opsional). Test full flow: browse → search → add to cart → checkout → payment.

> **Latihan 6:** Load Test with k6
> Install k6 dan jalankan load test script. Target 50 concurrent users. Catat metrik: response time (p50, p95, p99), error rate, throughput. Identifikasi bottleneck dan buat rekomendasi perbaikan.

> **Latihan 7:** SEO Audit
> Audit SEO halaman produk: (a) meta tags lengkap, (b) Open Graph & Twitter card, (c) JSON-LD structured data, (d) sitemap.xml, (e) robots.txt. Gunakan Google Lighthouse untuk validasi. Skor target: ≥90.

---

## 📊 Evaluation Rubric (Sesi 3)

| Kriteria | Bobot | 4 (Excellent) | 3 (Good) | 2 (Fair) | 1 (Poor) |
|----------|-------|---------------|----------|----------|----------|
| **AI Integration** | 30% | 3 fitur AI berfungsi: semantic search, recommendation, chatbot. Fallback handling. | 2 fitur AI berfungsi, 1 partial | 1 fitur AI berfungsi | Tidak ada AI |
| **Deployment** | 25% | Frontend Vercel + Backend Railway, live URL, environment variable rapi, CI/CD jalan | Deployed, ada URL, CI setup | Deployed tapi error | Tidak deploy |
| **Load Testing** | 15% | k6 test dengan 50 user, threshold terpenuhi, bottleneck teridentifikasi | k6 test ada, threshold belum semua terpenuhi | Load test manual | Tidak ada |
| **SEO** | 15% | Meta tags, OG, JSON-LD, sitemap, robots.txt, Lighthouse ≥90 | Meta tags + OG + sitemap | Meta tags minimal | Tidak ada SEO |
| **Code Quality** | 15% | TypeScript strict, error handling, logging, modular structure | TS strict, minor issues | TS loose | JS tanpa type |

---

## 💡 Tips

- **Deploy backend dulu** sebelum frontend — frontend butuh API endpoint untuk testing.
- **Gunakan environment variables** untuk semua konfigurasi — jangan hardcode API key.
- **Test payment di sandbox** dulu sebelum production — jangan sampai tagihan beneran.
- **Monitor biaya OpenAI** — set spending limit di dashboard OpenAI.
- **Sitemap otomatis** regenerate setiap kali produk ditambah/diupdate.

---

| [← Sesi 2: Implementasi & Payment](02-implementation-payment.md) | [Kembali ke README →](README.md) |
|---|---|
