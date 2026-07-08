# Ele: Next.js

> **Durasi:** 6 jam | **Level:** 🚀 Advanced | **Mode:** Individu

## 🎯 Tujuan

Setelah menyelesaikan modul ini, mahasiswa mampu:
1. Setup Next.js 14+ dengan App Router
2. Memahami Server Components vs Client Components
3. Routing, Layout, Loading, Error boundaries
4. Data fetching (SSR, SSG, ISR)
5. API Routes & Server Actions
6. Middleware, Auth, dan Deployment

## 📋 Ringkasan Materi

Next.js adalah React framework untuk production — memberikan SSR, SSG, routing, API, dan optimasi out-of-the-box. Dengan Next.js, Anda bisa membangun full-stack React application tanpa perlu konfigurasi Webpack, Babel, atau bundler lain.

### Daftar Isi

- [1. App Router Deep Dive](#1-app-router-deep-dive)
- [2. Layout, Loading, Error, dan Not-Found](#2-layout-loading-error-dan-not-found)
- [3. Server vs Client Components](#3-server-vs-client-components)
- [4. Data Fetching: SSR, SSG, ISR, Client-Side](#4-data-fetching-ssr-ssg-isr-client-side)
- [5. API Routes dan Server Actions](#5-api-routes-dan-server-actions)
- [6. Middleware](#6-middleware)
- [7. Image Optimization, Fonts, SEO](#7-image-optimization-fonts-seo)
- [8. Deployment ke Vercel](#8-deployment-ke-vercel)
- [9. Proyek: Blog → Dashboard → Full App](#9-proyek-blog--dashboard--full-app)
- [10. Latihan Akhir](#10-latihan-akhir)

---

## 1. App Router Deep Dive

Next.js 13+ memperkenalkan **App Router** — sistem routing baru yang dibangun di atas React Server Components. App Router menggunakan file-system routing di dalam direktori `app/`.

### 1.1 File Conventions

| Convention | Fungsi |
|---|---|
| `page.tsx` | Mendefinisikan halaman (public route) |
| `layout.tsx` | Layout yang membungkus halaman |
| `loading.tsx` | UI loading (Suspense boundary) |
| `error.tsx` | Error boundary |
| `not-found.tsx` | Halaman 404 |
| `route.ts` | API endpoint |
| `template.tsx` | Layout yang re-mount tiap navigasi |

### 1.2 Struktur Folder

```tsx
app/
├── layout.tsx            // Root layout — wajib
├── page.tsx              // Halaman / (home)
├── about/
│   └── page.tsx          // Halaman /about
├── blog/
│   ├── layout.tsx        // Layout khusus blog
│   ├── page.tsx          // /blog — list posts
│   └── [slug]/
│       └── page.tsx      // /blog/:slug — dynamic route
├── dashboard/
│   ├── layout.tsx        // Layout dashboard (sidebar)
│   ├── page.tsx          // /dashboard
│   ├── settings/
│   │   └── page.tsx      // /dashboard/settings
│   └── profile/
│       └── page.tsx      // /dashboard/profile
├── api/
│   ├── auth/
│   │   └── route.ts      // /api/auth
│   └── posts/
│       └── route.ts      // /api/posts
├── loading.tsx           // Global loading
└── error.tsx             // Global error boundary
```

### 1.3 Dynamic Routes

```tsx
// app/blog/[slug]/page.tsx
interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogPost({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang = 'id' } = await searchParams;

  const post = await getPost(slug, lang as string);

  if (!post) {
    notFound(); // trigger not-found.tsx
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### 1.4 Catch-All Routes

```tsx
// app/docs/[...slug]/page.tsx — match /docs/a, /docs/a/b, /docs/a/b/c
interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function DocsPage({ params }: Props) {
  const { slug } = await params;
  // slug = ['a', 'b'] untuk /docs/a/b
  return <div>Docs path: {slug.join(' / ')}</div>;
}

// app/docs/[[...slug]]/page.tsx — juga match /docs (slug = [])
// Optional catch-all dengan double bracket
```

### 1.5 Route Groups

Gunakan `(folderName)` untuk mengelompokkan route tanpa mempengaruhi URL path.

```tsx
app/
├── (marketing)/
│   ├── layout.tsx        // Layout marketing (navbar berbeda)
│   ├── page.tsx          // /
│   └── pricing/
│       └── page.tsx      // /pricing
├── (dashboard)/
│   ├── layout.tsx        // Layout dashboard (sidebar)
│   └── settings/
│       └── page.tsx      // /settings (bukan /dashboard/settings)
```

### 1.6 Parallel Routes

Gunakan slot dengan `@folderName` untuk merender beberapa halaman dalam satu layout secara independen.

```tsx
app/
├── layout.tsx
├── page.tsx
├── @analytics/
│   ├── page.tsx          // Slot analytics untuk /
│   └── views/
│       └── page.tsx      // Slot analytics untuk /views
└── @team/
    └── page.tsx          // Slot team untuk /

// app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <aside>
        {analytics}
        {team}
      </aside>
    </div>
  );
}
```

### 1.7 Intercepting Routes

Gunakan `(.)` prefix untuk mencegat route dan menampilkannya dalam modal.

```tsx
app/
├── feed/
│   └── page.tsx          // /feed
├── photo/
│   └── [id]/
│       └── page.tsx      // /photo/1 — halaman penuh
└── feed/
    └── (.)photo/
        └── [id]/
            └── page.tsx  // intercept /photo/1 dari /feed — tampil modal
```

### 🧪 Latihan 1.1 — App Router

1. **Buat struktur folder** untuk aplikasi e-commerce: halaman home, products (dengan kategori), product detail (slug), cart, checkout, dan admin dashboard.
2. **Route group** — Pisahkan layout untuk halaman public (marketing) dan admin.
3. **Dynamic route** — Buat halaman `/products/[id]` yang menerima params dan searchParams (opsi warna, ukuran).

---

## 2. Layout, Loading, Error, dan Not-Found

### 2.1 Root Layout

Root layout wajib ada di `app/layout.tsx`. Ini membungkus semua halaman.

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | RPL AI',
    default: 'RPL AI Curriculum', // fallback jika page tidak define title
  },
  description: 'Kurikulum RPL berbasis AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 2.2 Nested Layout

Layout bisa di-nesting. Layout anak membungkus halaman di dalam segmen route-nya.

```tsx
// app/dashboard/layout.tsx
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main>
        <Navbar />
        {children}
      </main>
    </div>
  );
}
```

**Penting:** Layout **tidak** re-render saat navigasi antar halaman dalam segmen yang sama. State dipertahankan. Gunakan `template.tsx` jika ingin state di-reset tiap navigasi.

### 2.3 Loading UI

Buat `loading.tsx` dalam segmen route untuk menampilkan UI loading otomatis (berbasis React Suspense).

```tsx
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="loading-skeleton">
      <div className="skeleton-header" />
      <div className="skeleton-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-title" />
            <div className="skeleton-body" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2.4 Streaming dengan Suspense

Untuk loading parsial, gunakan Suspense langsung di komponen:

```tsx
import { Suspense } from 'react';

// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Bagian ini loading independen */}
      <Suspense fallback={<div className="skeleton-chart" />}>
        <RevenueChart />
      </Suspense>

      <Suspense fallback={<div className="skeleton-list" />}>
        <RecentOrders />
      </Suspense>
    </div>
  );
}

// Komponen async akan streaming
async function RevenueChart() {
  const data = await fetch('/api/revenue'); // delay 3 detik
  return <Chart data={data} />;
}

async function RecentOrders() {
  const orders = await fetch('/api/orders'); // delay 2 detik
  return <OrderList orders={orders} />;
}
```

### 2.5 Error Boundary

`error.tsx` adalah Client Component yang menangkap error di segmen route-nya.

```tsx
// app/dashboard/error.tsx
'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>Terjadi Kesalahan</h2>
      <p className="error-message">{error.message}</p>
      <button
        onClick={() => reset()} // coba render ulang segmen
        className="btn btn-primary"
      >
        Coba Lagi
      </button>
    </div>
  );
}
```

### 2.6 Not Found

`not-found.tsx` ditampilkan saat `notFound()` dipanggil dari Server Component.

```tsx
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404 — Halaman Tidak Ditemukan</h1>
      <p>Maaf, halaman yang Anda cari tidak tersedia.</p>
      <Link href="/" className="btn">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
```

Trigger dari dalam komponen:

```tsx
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound(); // 404
  }

  return <ProductDetail product={product} />;
}
```

### 🧪 Latihan 2.1 — Layout, Loading, Error

1. **Buat nested layout** — Buat layout untuk `/dashboard` dengan sidebar navigasi (Dashboard, Settings, Profile). Sidebar tetap visible saat navigasi.
2. **Skeleton loading** — Buat loading.tsx dengan skeleton animation untuk dashboard cards.
3. **Custom error** — Buat error.tsx yang menampilkan ilustrasi dan tombol "Coba Lagi".
4. **Not-found page** — Buat halaman 404 khusus untuk route `/products/[id]` jika produk tidak ditemukan.

---

## 3. Server vs Client Components

Ini adalah konsep paling penting di Next.js App Router.

### 3.1 Server Components (Default)

Semua komponen di App Router adalah **Server Components** secara default. Mereka hanya di-render di server.

**Apa yang bisa dilakukan Server Components:**
- Akses database langsung (tanpa API)
- Akses file system
- Baca token dari cookies/headers
- Fetch data tanpa `useEffect`
- Mengirim lebih sedikit JavaScript ke client

```tsx
// app/page.tsx — Server Component (default, tidak perlu 'use client')
import { db } from '@/lib/database';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  // Langsung akses database — tidak butuh API
  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const session = await auth();
  // await headers() atau await cookies() — langsung

  return (
    <main>
      <h1>Selamat datang, {session?.user?.name ?? 'Tamu'}</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

**Yang TIDAK bisa dilakukan Server Components:**
- Menggunakan hooks (`useState`, `useEffect`, `useContext`)
- Menggunakan event handlers (`onClick`, `onChange`)
- Menggunakan browser-only APIs (`localStorage`, `window`)
- Menggunakan custom hooks yang bergantung pada state/effects

### 3.2 Client Components

Tambahkan directive `'use client'` di baris pertama file untuk menjadi Client Component.

```tsx
// app/components/counter.tsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
}
```

### 3.3 Kapan Pakai Client Component?

| Gunakan Client Component ketika... | Alternatif Server Component |
|---|---|
| Interaktivitas (onClick, onChange) | Cari solusi tanpa JS (form action, Link) |
| State lokal (useState, useReducer) | Pindahkan state ke URL (searchParams) |
| useEffect (fetch di client) | Fetch di Server Component |
| Browser-only APIs | Gunakan hook dengan `typeof window !== 'undefined'` |
| Custom hooks (useMediaQuery, dll) | Buat server version jika memungkinkan |

### 3.4 Pola Hybrid — Server + Client

Best practice: Server Component sebagai wrapper, Client Component hanya di bagian interaktif.

```tsx
// app/products/page.tsx — Server Component (default)
import ProductList from './ProductList';
import { db } from '@/lib/database';

export default async function ProductsPage() {
  // Data fetching di server
  const products = await db.product.findMany();

  // Filter categories juga di server
  const categories = await db.category.findMany();

  return (
    <div>
      <h1>Produk</h1>
      {/* Client Component — hanya untuk interaktivitas */}
      <ProductList products={products} categories={categories} />
    </div>
  );
}

// app/products/ProductList.tsx — Client Component
'use client';

import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export default function ProductList({
  products,
  categories,
}: {
  products: Product[];
  categories: { id: string; name: string }[];
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'all' || p.category === category)
  );

  return (
    <div>
      <input
        placeholder="Cari produk..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">Semua</option>
        {categories.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="product-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### 3.5 Server Component di Dalam Client Component

Server Component bisa di-pass sebagai children ke Client Component:

```tsx
// Server Component
export default async function Page() {
  return (
    <ClientWrapper>
      {/* Server Component sebagai children */}
      <ServerContent />
    </ClientWrapper>
  );
}

// Client Component
'use client';
export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && children} {/* Server Content tetap server-rendered */}
    </div>
  );
}

// Server Component
async function ServerContent() {
  const data = await fetch('https://api.example.com/data');
  return <div>{/* render data */}</div>;
}
```

### 🧪 Latihan 3.1 — Server vs Client Components

1. **Analisis** — Dari komponen berikut, tentukan mana yang harus Server Component dan mana Client Component. Beri alasan:
   - Navbar dengan user session
   - Form login
   - Blog post list dari database
   - Image gallery dengan infinite scroll
   - SEO metadata

2. **Refactor** — Ambil komponen yang menggunakan `useEffect` untuk fetch data, pindahkan fetching-nya ke Server Component induk, lalu passing data sebagai props.

3. **Hybrid pattern** — Buat halaman daftar artikel (Server Component untuk fetch data) dengan filter interaktif (Client Component untuk search dan category filter).

---

## 4. Data Fetching: SSR, SSG, ISR, Client-Side

Next.js menyediakan berbagai strategi pengambilan data.

### 4.1 Static Site Generation (SSG) — Default

Tanpa `fetch` caching atau `dynamic` config, Next.js akan **meng-cache data secara statis** saat build.

```tsx
// app/about/page.tsx — SSG (default)
export default async function AboutPage() {
  // Data di-fetch saat build, hasilnya static HTML
  const res = await fetch('https://api.example.com/about');
  const data = await res.json();

  return <div>{data.content}</div>;
}
```

### 4.2 Server-Side Rendering (SSR) — Dynamic

Set `cache: 'no-store'` atau `next: { revalidate: 0 }` untuk SSR — data di-fetch setiap request.

```tsx
// app/dashboard/page.tsx — SSR
export default async function DashboardPage() {
  // Data real-time — no cache
  const res = await fetch('https://api.example.com/stats', {
    cache: 'no-store',
  });
  const stats = await res.json();

  return <Dashboard stats={stats} />;
}

// Alternatif: gunakan export const dynamic = 'force-dynamic'
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Semua fetch di halaman ini akan dinamis
}
```

### 4.3 Incremental Static Regeneration (ISR)

Set `next: { revalidate: N }` untuk ISR — halaman di-generate statis, lalu diregenerasi setiap N detik.

```tsx
// app/products/page.tsx — ISR 60 detik
export default async function ProductsPage() {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 }, // regenerate setiap 60 detik
  });
  const products = await res.json();

  return <ProductGrid products={products} />;
}
```

### 4.4 ISR dengan On-Demand Revalidation

Trigger revalidasi manual via API:

```tsx
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidation-secret');

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Revalidate semua halaman di path /products
  revalidatePath('/products');

  // Atau revalidate berdasarkan tag
  revalidateTag('products');

  return NextResponse.json({ revalidated: true });
}
```

### 4.5 Client-Side Fetching

Untuk data yang sering berubah atau interaktif, fetch di client:

```tsx
// app/components/LiveSearch.tsx
'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export default function LiveSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    async function search() {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${debouncedQuery}`);
        const data = await res.json();
        setResults(data);
      } finally {
        setLoading(false);
      }
    }

    search();
  }, [debouncedQuery]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari..."
      />
      {loading && <p>Memuat...</p>}
      <ul>
        {results.map((item: any) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 4.6 Data Fetching Patterns — Perbandingan

| Strategi | Kapan Pakai | Contoh |
|---|---|---|
| **SSG** | Konten statis, jarang berubah | Blog post, halaman About |
| **SSR** | Data real-time per request | Dashboard, user-specific data |
| **ISR** | Konten berubah periodik | Product catalog, berita |
| **Client** | Data interaktif, real-time | Search, infinite scroll, chat |

### 🧪 Latihan 4.1 — Data Fetching

1. **SSG page** — Buat halaman `/blog` yang fetch posts dari JSONPlaceholder dengan SSG. Jalankan `next build` dan lihat output-nya.
2. **SSR page** — Buat halaman `/products` yang menampilkan data real-time dengan `cache: 'no-store'`.
3. **ISR page** — Buat halaman `/news` dengan revalidate 30 detik. Tambahkan tombol untuk trigger revalidasi manual.
4. **Client fetch** — Buat komponen `UserSearch` yang fetch data user dari API publik berdasarkan input search dengan debounce.

---

## 5. API Routes dan Server Actions

### 5.1 Route Handlers (API Routes)

Buat file `route.ts` di dalam folder `app/api/` untuk endpoint API.

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// GET /api/posts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const posts = await db.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({
    data: posts,
    page,
    limit,
    total: await db.post.count(),
  });
}

// POST /api/posts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, authorId } = body;

    // Validasi
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title dan content wajib diisi' },
        { status: 400 }
      );
    }

    const post = await db.post.create({
      data: { title, content, authorId },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 5.2 Dynamic Route untuk API

```tsx
// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface Props {
  params: Promise<{ id: string }>;
}

// GET /api/posts/:id
export async function GET(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });

  if (!post) {
    return NextResponse.json({ error: 'Post tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(post);
}

// PATCH /api/posts/:id
export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const body = await request.json();

  const updated = await db.post.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(updated);
}

// DELETE /api/posts/:id
export async function DELETE(request: NextRequest, { params }: Props) {
  const { id } = await params;

  await db.post.delete({ where: { id } });

  return NextResponse.json({ message: 'Post dihapus' }, { status: 200 });
}
```

### 5.3 Server Actions

Server Actions adalah fungsi yang berjalan di server dan bisa dipanggil dari Client Component. Gunakan `'use server'` directive.

```tsx
// app/actions/posts.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/database';

const PostSchema = z.object({
  title: z.string().min(3, 'Title minimal 3 karakter'),
  content: z.string().min(10, 'Content minimal 10 karakter'),
});

export async function createPost(formData: FormData) {
  // Validasi di server
  const validated = PostSchema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  // Simpan ke database
  await db.post.create({
    data: validated,
  });

  // Revalidate cache
  revalidatePath('/posts');

  return { success: true };
}
```

### 5.4 Server Actions di Client Component

```tsx
// app/components/PostForm.tsx
'use client';

import { useActionState } from 'react';
import { createPost } from '@/app/actions/posts';

export default function PostForm() {
  const [state, formAction, isPending] = useActionState(
    createPost,
    { success: false, errors: {} }
  );

  return (
    <form action={formAction} className="post-form">
      <div>
        <label>Judul</label>
        <input type="text" name="title" required minLength={3} />
        {state.errors?.title && (
          <p className="error">{state.errors.title}</p>
        )}
      </div>

      <div>
        <label>Konten</label>
        <textarea name="content" required minLength={10} />
        {state.errors?.content && (
          <p className="error">{state.errors.content}</p>
        )}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Menyimpan...' : 'Simpan Post'}
      </button>

      {state.success && <p className="success">Post berhasil dibuat!</p>}
    </form>
  );
}
```

### 5.5 Perbandingan Route Handlers vs Server Actions

| Route Handlers | Server Actions |
|---|---|
| Untuk API endpoint publik | Untuk form mutations |
| Bisa dipanggil dari luar (mobile, third-party) | Hanya dari komponen |
| Perlu fetch dari client | Langsung invoke function |
| Response JSON | Return data langsung |
| Cocok untuk REST API | Cocok untuk form submission |

### 🧪 Latihan 5.1 — API & Server Actions

1. **CRUD API** — Buat Route Handler untuk resource `notes` dengan operasi GET (list + detail), POST, PATCH, DELETE.
2. **Server Action form** — Buat form register user dengan Server Action. Validasi: email unique, password minimal 8 karakter.
3. **Search API** — Buat endpoint `/api/search?q=` yang mencari posts berdasarkan title. Implementasikan pagination.
4. **Error handling** — Tambahkan error handling di semua endpoint dengan status code yang sesuai.

---

## 6. Middleware

Middleware di Next.js memungkinkan Anda mengeksekusi kode sebelum request selesai diproses.

### 6.1 Struktur Middleware

Buat `middleware.ts` di root project (sejajar dengan `app/`):

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('Middleware running for:', request.nextUrl.pathname);
  return NextResponse.next();
}
```

### 6.2 Matcher Config

Tentukan route mana yang dijalankan middleware:

```tsx
// middleware.ts
export const config = {
  matcher: [
    '/dashboard/:path*',    // /dashboard dan semua sub-route
    '/api/:path*',          // semua API routes
    '/((?!_next/static|_next/image|favicon.ico).*)', // semua kecuali static files
  ],
};
```

### 6.3 Authentication Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Route yang tidak perlu auth
  const publicRoutes = ['/login', '/register', '/', '/about'];
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (!token && !isPublic) {
    // Redirect ke login dengan callback URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan mengakses /login, redirect ke dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
```

### 6.4 Role-Based Access Control

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface User {
  role: 'admin' | 'user';
}

function getUser(token: string): User | null {
  // Decode JWT atau query database
  // Ini hanya contoh — implementasi nyata perlu JWT verification
  return token === 'admin-token' ? { role: 'admin' } : { role: 'user' };
}

const roleRoutes: Record<string, string[]> = {
  admin: ['/admin/:path*'],
  user: ['/dashboard/:path*'],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const user = getUser(token);

  if (!user) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }

  // Cek akses berdasarkan role
  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/403', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

### 6.5 Redirect dan Rewrite

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, locale } = request.nextUrl;

  // 1. Redirect — mengubah URL di browser
  // Redirect /old-blog/:slug ke /blog/:slug
  if (pathname.startsWith('/old-blog')) {
    const slug = pathname.replace('/old-blog/', '');
    return NextResponse.redirect(new URL(`/blog/${slug}`, request.url));
  }

  // 2. Rewrite — konten berbeda tanpa mengubah URL
  // Tampilkan halaman berbeda berdasarkan user-agent
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /mobile/i.test(userAgent);

  if (isMobile && pathname === '/') {
    // Tampilkan /mobile-home tapi URL tetap /
    return NextResponse.rewrite(new URL('/mobile-home', request.url));
  }

  // 3. Header modification
  const response = NextResponse.next();
  response.headers.set('X-Custom-Header', 'hello');
  response.headers.set('X-Robots-Tag', 'noindex');

  return response;
}
```

### 6.6 i18n dengan Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['id', 'en'];
const defaultLocale = 'id';

function getLocale(request: NextRequest): string {
  // Cek cookie
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Cek Accept-Language header
  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const preferred = acceptLang.split(',')[0].split('-')[0];
    if (locales.includes(preferred)) return preferred;
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);

  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 🧪 Latihan 6.1 — Middleware

1. **Auth middleware** — Buat middleware yang me-redirect user ke /login jika belum login. Route publik: /, /login, /register, /about.
2. **Role middleware** — Extend auth middleware dengan role checking. Hanya admin yang bisa akses /admin.
3. **Redirect** — Buat redirect dari /blog/:slug ke /artikel/:slug untuk backward compatibility.
4. **Header modification** — Tambahkan security headers (X-Frame-Options, X-Content-Type-Options) via middleware.

---

## 7. Image Optimization, Fonts, SEO

### 7.1 next/image

Komponen `Image` Next.js mengoptimalkan gambar secara otomatis — lazy loading, responsive sizes, WebP conversion.

```tsx
import Image from 'next/image';
import profilePic from '@/public/me.jpg'; // import statis

export default function Profile() {
  return (
    <div>
      {/* Local image — otomatis dapat width, height, blur placeholder */}
      <Image
        src={profilePic}
        alt="Foto Profil"
        className="rounded-full"
        priority // priority untuk LCP images (hero, logo)
      />

      {/* Remote image — perlu konfigurasi domain */}
      <Image
        src="https://picsum.photos/800/600"
        alt="Random"
        width={800}
        height={600}
        className="object-cover"
      />
    </div>
  );
}
```

Konfigurasi domain di `next.config.ts`:

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com', // wildcard
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 1080, 1280, 1920],
  },
};

export default nextConfig;
```

### 7.2 next/font

Optimasi font otomatis — Google Fonts di-self-host, tidak ada request eksternal.

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';
import localFont from 'next/font/local';

// Google Font — otomatis di-download saat build
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

// Local font
const geistSans = localFont({
  src: './fonts/GeistVF.woff2',
  variable: '--font-geist-sans',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 7.3 SEO dengan Metadata API

Next.js memiliki Metadata API untuk SEO — generate `<title>`, `<meta>`, Open Graph, Twitter Cards.

```tsx
// app/layout.tsx — metadata default
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | RPL AI Curriculum',
    default: 'RPL AI Curriculum',
  },
  description: 'Kurikulum Rekayasa Perangkat Lunak berbasis Artificial Intelligence',
  keywords: ['RPL', 'AI', 'Kurikulum', 'Pendidikan'],
  authors: [{ name: 'RPL AI Team' }],
  openGraph: {
    title: 'RPL AI Curriculum',
    description: 'Kurikulum RPL berbasis AI',
    url: 'https://rpl-ai.vercel.app',
    siteName: 'RPL AI',
    images: [
      {
        url: 'https://rpl-ai.vercel.app/og.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RPL AI Curriculum',
    description: 'Kurikulum RPL berbasis AI',
    images: ['https://rpl-ai.vercel.app/og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

Metadata spesifik per halaman — override metadata global:

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'Post Tidak Ditemukan' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  return <article>{/* content */}</article>;
}
```

### 7.4 Sitemap dan Robots

```tsx
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rpl-ai.vercel.app';

  // Static routes
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
  ];

  // Dynamic routes dari database
  const posts = await getPosts();
  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}

// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://rpl-ai.vercel.app/sitemap.xml',
  };
}
```

### 🧪 Latihan 7.1 — Optimization & SEO

1. **Image optimization** — Buat galeri foto yang menggunakan `next/image` dengan berbagai ukuran. Konfigurasi remotePatterns untuk sumber gambar.
2. **Custom font** — Tambahkan Google Font (Poppins) via next/font. Terapkan sebagai variable font di CSS.
3. **SEO** — Buat halaman blog dengan `generateMetadata` dinamis. Setiap post punya title, description, dan Open Graph image yang berbeda.
4. **Sitemap** — Generate sitemap.xml yang mencakup semua halaman statis dan dinamis.

---

## 8. Deployment ke Vercel

### 8.1 Persiapan

```bash
# 1. Build lokal untuk verifikasi
npm run build

# 2. Install Vercel CLI
npm install -g vercel

# 3. Login ke Vercel
vercel login

# 4. Deploy
vercel --prod
```

### 8.2 Environment Variables

Buat `.env.local` untuk development dan set di Vercel Dashboard.

```bash
# .env.local
DATABASE_URL="postgresql://localhost:5432/myapp"
AUTH_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

Di Vercel: **Settings > Environment Variables** atau via CLI:

```bash
vercel env add DATABASE_URL
vercel env add AUTH_SECRET
vercel env add NEXT_PUBLIC_API_URL production
```

> **Catatan:** Variabel dengan prefix `NEXT_PUBLIC_` akan terekspos ke browser. Jangan simpan rahasia di variabel public.

### 8.3 next.config.ts untuk Production

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optimasi production
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.vercel.app' },
    ],
  },

  // Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/old-blog/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

### 8.4 Output File Tracing

Next.js secara otomatis melakukan file tracing untuk production — hanya file yang diperlukan yang di-deploy.

```bash
# Hasil build ada di .next/ — siap di-deploy
.next/
├── standalone/    # Server + dependencies (tracing)
├── static/        # Static assets (JS, CSS)
└── ...
```

### 8.5 Monitoring dan Analytics

Vercel menyediakan built-in analytics dan monitoring:

- **Web Analytics** — page views, visit duration
- **Speed Insights** — Core Web Vitals (LCP, CLS, INP)
- **Error Tracking** — error logs dari server dan client

Aktifkan di Vercel Dashboard > Project > Analytics atau saat deploy.

```tsx
// app/components/Analytics.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function VercelAnalytics() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

### 8.6 Deploy ke Platform Lain

```bash
# Docker
npm run build
docker build -t my-nextjs-app .
docker run -p 3000:3000 my-nextjs-app

# Node.js server (standalone)
node .next/standalone/server.js

# PM2
npm run build
pm2 start .next/standalone/server.js --name nextjs
```

### 🧪 Latihan 8.1 — Deployment

1. **Deploy ke Vercel** — Connect repository GitHub ke Vercel. Configure environment variables. Deploy.
2. **Custom domain** — Setup custom domain di Vercel dashboard (jika punya domain).
3. **Analytics** — Aktifkan Web Analytics dan Speed Insights. Ukur performa dengan Lighthouse.
4. **Docker** — Buat Dockerfile untuk Next.js dan deploy ke platform lain (Railway, Fly.io).

---

## 9. Proyek: Blog → Dashboard → Full App

### 9.1 Proyek 1: Blog App

Buat blog sederhana dengan:
- Halaman home menampilkan daftar posts
- Halaman detail post dengan dynamic route `[slug]`
- Kategori posts
- ISR untuk posts (revalidate 60 detik)
- SEO metadata per post
- Search posts (client-side)
- Admin page untuk create post (Server Action)

```tsx
// app/page.tsx
import Link from 'next/link';
import { db } from '@/lib/database';

export const revalidate = 60; // ISR 60 detik

export default async function HomePage() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const categories = await db.category.findMany();

  return (
    <div>
      <h1>Blog RPL AI</h1>

      <div className="categories">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/category/${cat.slug}`} className="badge">
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="post-grid">
        {posts.map((post) => (
          <article key={post.id} className="post-card">
            {post.coverImage && (
              <img src={post.coverImage} alt={post.title} />
            )}
            <h2>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="excerpt">{post.excerpt}</p>
            <div className="meta">
              <span>{post.author.name}</span>
              <time>{new Date(post.createdAt).toLocaleDateString('id-ID')}</time>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
```

### 9.2 Proyek 2: Dashboard App

Buat admin dashboard dengan:
- Authentication via middleware
- Layout dashboard dengan sidebar
- CRUD posts (Server Actions + Route Handlers)
- Statistik cards (total posts, users, views)
- Data table dengan sorting dan pagination
- Loading skeletons

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { db } from '@/lib/database';

async function StatsCards() {
  const [postCount, userCount, viewCount] = await Promise.all([
    db.post.count(),
    db.user.count(),
    db.view.aggregate({ _sum: { count: true } }),
  ]);

  const stats = [
    { label: 'Total Posts', value: postCount, icon: '📝' },
    { label: 'Total Users', value: userCount, icon: '👥' },
    { label: 'Total Views', value: viewCount._sum.count ?? 0, icon: '👁️' },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card">
          <span className="stat-icon">{stat.icon}</span>
          <div>
            <p className="stat-value">{stat.value.toLocaleString('id-ID')}</p>
            <p className="stat-label">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="stats-grid">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards />
      </Suspense>
    </div>
  );
}
```

### 9.3 Proyek 3: Full App — E-Learning Platform

Gabungkan konsep dari blog dan dashboard menjadi aplikasi e-learning penuh:

**Fitur:**
- **Public pages:** Home, courses list, course detail, instructor profile
- **Auth:** Login/register dengan middleware protection
- **Dashboard Mahasiswa:** Enrolled courses, progress, assignments
- **Dashboard Instruktur:** Manage courses, upload materi, grade assignments
- **Admin:** Manage users, courses, categories
- **API:** REST API untuk mobile app
- **SEO:** Metadata dinamis untuk setiap course
- **Optimasi:** Image optimization untuk course thumbnail, font optimization
- **Deployment:** Production di Vercel

```tsx
// app/courses/[courseId]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/database';
import EnrollButton from './EnrollButton';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ courseId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId } = await params;
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { title: true, description: true, thumbnail: true },
  });

  if (!course) return { title: 'Course Tidak Ditemukan' };

  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: [course.thumbnail],
    },
  };
}

export default async function CourseDetail({ params }: Props) {
  const { courseId } = await params;

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: { select: { name: true, avatar: true } },
      modules: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } },
      },
    },
  });

  if (!course) notFound();

  return (
    <div className="course-detail">
      <div className="course-header">
        <Image
          src={course.thumbnail}
          alt={course.title}
          width={1200}
          height={600}
          className="course-thumbnail"
          priority
        />
        <h1>{course.title}</h1>
        <div className="instructor">
          <Image
            src={course.instructor.avatar}
            alt={course.instructor.name}
            width={48}
            height={48}
            className="avatar"
          />
          <span>{course.instructor.name}</span>
        </div>
        <p>{course.description}</p>
        <EnrollButton courseId={course.id} />
      </div>

      <div className="modules">
        {course.modules.map((module, i) => (
          <div key={module.id} className="module">
            <h3>Modul {i + 1}: {module.title}</h3>
            <ul>
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="lesson">
                  <span>{lesson.title}</span>
                  <span className="duration">{lesson.duration} menit</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 🧪 Latihan 9.1 — Proyek

1. **Blog** — Implementasikan blog dengan ISR, kategori, search, dan admin page dengan Server Actions untuk CRUD posts.
2. **Dashboard** — Buat dashboard dengan statistik, data table dengan sorting/pagination, dan CRUD management.
3. **E-Learning App** — Integrasikan blog + dashboard + auth menjadi aplikasi e-learning penuh. Tambahkan role-based access (siswa, instruktur, admin).

---

## 10. Latihan Akhir

1. **Migrasi Pages Router ke App Router** — Ambil aplikasi Next.js Pages Router yang sudah ada, migrasikan semua halaman ke App Router.
2. **Performance audit** — Gunakan Lighthouse dan Vercel Speed Insights untuk mengaudit performa aplikasi. Optimasi LCP, CLS, INP.
3. **Full-stack features** — Tambahkan real-time features (WebSocket, Server-Sent Events) atau background jobs (Vercel Cron Jobs, Redis Queue).
4. **Internationalization** — Implementasikan i18n dengan middleware + routing. Support bahasa Indonesia dan Inggris.
5. **Testing** — Tulis integration test untuk API Routes dan Server Actions menggunakan Vitest atau Playwright.

## 📚 Referensi

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [Vercel Deploy Documentation](https://vercel.com/docs)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
