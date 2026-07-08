# 03 — Next.js, SSR/SSG/ISR & Perbandingan Framework

**Durasi:** 2 jam pertemuan + 1 jam latihan

---

## Dari React ke Meta-Framework

React sendiri cuma library buat **render UI di browser**. Urusan routing, SEO, gambar optimalisasi, API — itu gak ada di React murni. Makanya lahir **meta-framework**:

| Client Framework | Meta-Framework | Keunggulan |
|-----------------|---------------|------------|
| React | **Next.js**, Remix | Routing, SSR, API routes |
| Vue | **Nuxt** | Sama, tapi buat Vue |
| Svelte | **SvelteKit** | Routing + SSR + semua bawaan |
| Solid | **SolidStart** | Solid + routing + SSR |
| Qwik | **Qwik City** | Qwik + routing + resumable |

Next.js adalah meta-framework **React paling populer**. Buat yang udah bisa React, belajar Next.js tinggal nambah: routing, rendering strategy, dan deployment.

---

## Pages Router vs App Router

Next.js punya dua approach routing:

### Pages Router (legacy, Next.js < 13)

```
pages/
  index.js          → /
  about.js           → /about
  blog/
    [slug].js        → /blog/:slug
```

### App Router (modern, Next.js 13+)

```
app/
  page.js            → /
  about/
    page.js          → /about
  blog/
    [slug]/
      page.js        → /blog/:slug
  layout.js          → layout bersama
  loading.js         → loading state
  error.js           → error boundary
```

**App Router recommended** buat proyek baru. Pake React Server Components by default — bundle JS lebih kecil.

---

## File-Based Routing

Next.js pake **file system sebagai router**. Letak file di folder `pages/` atau `app/` langsung jadi URL.

```javascript
// app/about/page.js → halaman /about
export default function About() {
  return <h1>Tentang Kami</h1>;
}
```

```javascript
// app/produk/[id]/page.js → /produk/123
export default function ProdukDetail({ params }) {
  return <h1>Produk {params.id}</h1>;
}
```

| File Pattern | URL |
|-------------|-----|
| `page.js` | Halaman utama route |
| `layout.js` | Layout bersama (nested) |
| `loading.js` | UI loading otomatis |
| `error.js` | Error boundary |
| `not-found.js` | Halaman 404 |
| `[param]/page.js` | Dynamic route |
| `[...catchAll]/page.js` | Catch-all route |

---

## SSR, SSG, ISR — Kapan Pakai Apa?

### SSR (Server-Side Rendering)

HTML di-render **setiap request**. Data selalu segar.

```javascript
// app/profil/page.js — App Router (default server component)
export default async function Profil() {
  const res = await fetch('https://api.example.com/user');
  const user = await res.json();
  return <h1>Halo, {user.name}</h1>;
}
```

### SSG (Static Site Generation)

HTML di-render **pas build time**. Super cepat, cocok buat konten statis.

```javascript
// app/blog/page.js — otomatis static kalau gak pake fetch dinamis
export default async function Blog() {
  const posts = await fetch('https://api.example.com/posts', {
    cache: 'force-cache' // SSG — data di-cache pas build
  }).then(r => r.json());

  return (
    <ul>
      {posts.map(post => <li key={post.id}>{post.title}</li>)}
    </ul>
  );
}
```

### ISR (Incremental Static Regeneration)

Hybrid. HTML statis, tapi di-regen di background tiap X detik.

```javascript
// app/produk/[id]/page.js — ISR
export default async function Produk({ params }) {
  const res = await fetch(`https://api.example.com/produk/${params.id}`, {
    next: { revalidate: 60 } // regen tiap 60 detik
  });
  const produk = await res.json();
  return <div>{produk.nama} — Rp{produk.harga}</div>;
}
```

### Tabel Keputusan

| Skenario | Metode | Kenapa |
|---------|--------|--------|
| Dashboard admin | SPA | Cepet navigasi, SEO ga penting |
| Blog / dokumentasi | SSG | Konten statis, super cepet |
| Toko: halaman produk | SSG + ISR | Produk ribuan, harga bisa berubah |
| Landing page personal | SSG | Satu halaman, jarang di-update |
| Aplikasi chat realtime | SPA | State client berat |
| Portal berita | SSR / ISR | SEO penting, konten dinamis |

**Intinya:** Ga ada satu metode yang paling benar. Tergantung seberapa sering konten berubah, seberapa penting SEO, dan seberapa kompleks interaksi user.

---

## API Routes

Next.js bisa bikin **API endpoint** di proyek yang sama — gausah backend terpisah.

```javascript
// app/api/users/route.js — App Router
export async function GET() {
  const users = await db.users.findAll();
  return Response.json(users);
}

export async function POST(request) {
  const body = await request.json();
  const user = await db.users.create(body);
  return Response.json(user, { status: 201 });
}
```

```javascript
// app/api/users/[id]/route.js — Dynamic API
export async function GET(_, { params }) {
  const user = await db.users.find(params.id);
  return Response.json(user);
}
```

Cocok buat: BFF (Backend For Frontend), proxy API eksternal, handle form submission.

---

## React Server Components (RSC)

**Server Components** adalah komponen React yang **cuma jalan di server**. Kode mereka gak dikirim ke browser — bundle JS jadi lebih kecil.

```javascript
// app/page.js — by default ini Server Component
import { getPosts } from '@/lib/db';

export default async function Home() {
  const posts = await getPosts();

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

Kalau butuh interaktivitas (onClick, useState, useEffect), kasih `'use client'` di atas file:

```javascript
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**Best practice:** server component sebanyak mungkin, client component seminimal mungkin.

---

## Deployment ke Vercel

Vercel adalah **platform deployment** buat Next.js (dibuat oleh tim yang sama).

```
1. Push repo ke GitHub/GitLab/Bitbucket
2. Import di vercel.com
3. Vercel detect Next.js → build otomatis
4. Dapet URL: my-app.vercel.app
5. Setiap push → auto deploy
```

Fitur Vercel:
- **Edge Functions** — serverless di 18 lokasi global
- **Analytics** — liat performa real user
- **Preview Deployments** — tiap PR dapet URL sendiri
- **Image Optimization** — `next/image` otomatis optimasi
- **ISR** — incremental static regeneration handle di Vercel

---

## Svelte — Perbandingan Singkat

Svelte beda dari React: **gak pake Virtual DOM**. Svelte adalah **kompiler** — kode diubah jadi JavaScript vanilla pas build time.

```svelte
<!-- Svelte — mirip HTML -->
<script>
  let count = $state(0);
</script>

<button onclick={() => count++}>
  Count: {count}
</button>
```

### React vs Svelte

| Aspek | React | Svelte |
|-------|-------|--------|
| Paradigma | Library (runtime) | Compiler (build time) |
| Bundle size | ~42 KB gzipped | ~2 KB gzipped |
| Sintaks | JSX (HTML di JS) | HTML + script (mirip HTML) |
| Reactivity | `useState` → re-render | `$state` → update tepat |
| Learning curve | Curam (hooks, JSX) | Landai (mirip HTML) |
| Router | Butuh React Router | Bawaan di SvelteKit |
| Job market | Paling banyak | Mulai tumbuh |

**Svelte bagus buat:** proyek kecil-sedang, bundle kecil, developer yang suka sintaks sederhana.

**React bagus buat:** proyek besar, ekosistem luas, banyak pilihan library, pasar kerja luas.

---

## Memilih Framework yang Tepat

Tujuan modul ini bukan nge-judge framework mana yang terbaik. **Semua framework modern pake pola yang sama:** komponen, props, state, reactivity, lifecycle, routing.

| Kalo... | Coba... |
|---------|--------|
| Mau kerja di perusahaan besar | **React** — paling banyak dicari |
| Mau yang sederhana, mirip HTML | **Vue** atau **Svelte** |
| Mau bundle paling ringan | **Svelte** atau **Solid** |
| Mau performa super tinggi | **Solid** (signal-based, gak ada Virtual DOM) |
| Mau yang paling baru & beda | **Qwik** (resumability) |
| Single developer / proyek sendiri | Pake apapun yang paling nyaman |

**Yang lebih penting:** Paham konsep component, reactivity, lifecycle, state management, routing. Begitu paham konsep ini, belajar framework baru tinggal belajar **sintaks** — butuh 1-2 minggu, bukan 6 bulan.

Semua framework pinjam ide satu sama lain. React pake hooks dari Svelte? Vue pake signal dari Solid? Svelte 5 pake runes mirip Solid? Ya — semuanya konvergen ke pola yang sama. **Belajarlah pola-nya, bukan framework-nya.**

---

## Latihan

1. **Setup Next.js:** `npx create-next-app@latest my-app --app`. Jalankan di `localhost:3000`.
2. **Routing:** Buat halaman `/`, `/about`, `/produk/[id]`. Pake App Router.
3. **SSG:** Buat halaman blog yang fetch data dari JSONPlaceholder di build time (`cache: 'force-cache'`).
4. **ISR:** Buat halaman produk dengan revalidate 30 detik. Coba ubah data — liat perubahan.
5. **API Route:** Buat endpoint `/api/hello` yang return JSON `{ message: 'Halo dunia' }`. Panggil dari frontend.
6. **Perbandingan:** Install SvelteKit (`npx sv create my-svelte-app`), bikin halaman yang sama. Bandingkan ukuran bundle hasil build.
7. **Deploy:** Push Next.js ke GitHub, deploy ke Vercel (gratis). Dapetin URL publik.

---

> **Kembali ke:** [📖 Index Modul](README.md)
