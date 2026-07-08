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

### Data Fetching di App Router

App Router punya **tiga cara caching** — kontrol penuh lewat opsi `fetch()`:

```javascript
// 1. Static (SSG) — cache selamanya, di-build sekali
fetch(url, { cache: 'force-cache' });

// 2. Dynamic (SSR) — fetch tiap request, gak di-cache
fetch(url, { cache: 'no-store' });

// 3. ISR — revalidate otomatis tiap N detik
fetch(url, { next: { revalidate: 60 } });

// 4. On-demand revalidation — trigger dari server action / webhook
// panggil revalidateTag('posts') atau revalidatePath('/blog')
fetch(url, { next: { tags: ['posts'] } });
```

**Parallel data fetching** — fetch beberapa data sekaligus, gak sequential:

```javascript
// ❌ Sequential — lambat
export default async function Page() {
  const user = await getUser();        // 200ms
  const posts = await getPosts();      // 300ms → total 500ms
}

// ✅ Parallel — cepat
export default async function Page() {
  const [user, posts] = await Promise.all([
    getUser(),     // 200ms
    getPosts(),    // 300ms → total 300ms
  ]);
}
```

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

## Advanced Routing: App Router Depth

### Nested Layouts

Layout di App Router bisa **bersarang** — layout induk tetap ada sementara layout anak nambah.

```javascript
// app/layout.js — layout root untuk semua halaman
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <header>Navbar Global</header>
        {children}
        <footer>Footer Global</footer>
      </body>
    </html>
  );
}
```

```javascript
// app/dashboard/layout.js — layout khusus dashboard
export default function DashboardLayout({ children }) {
  return (
    <section>
      <nav>Sidebar Dashboard</nav>
      <main>{children}</main>
    </section>
  );
}
```

```javascript
// app/dashboard/settings/page.js — URL: /dashboard/settings
// Layout yang dipake: RootLayout → DashboardLayout → page
export default function Settings() {
  return <h1>Pengaturan Akun</h1>;
}
```

### Group Routes — Tanpa Ngaruh ke URL

Bisa kelompokkan route tanpa nambah segmen URL — pake `(groupName)`:

```
app/
  (marketing)/
    page.js          → /
    about/page.js    → /about
  (dashboard)/
    dashboard/
      page.js        → /dashboard
    settings/
      page.js        → /settings
```

Berguna buat misahin layout marketing (publik) vs dashboard (private) tanpa URL berubah.

### Parallel Routes — Multiple Pages dalam Satu Route

Tampilkan beberapa halaman secara **independen** dalam satu layout — pake slot (`@slotName`):

```
app/
  dashboard/
    layout.js
    @analytics/
      page.js
    @settings/
      page.js
    page.js
```

```javascript
// app/dashboard/layout.js
export default function DashboardLayout({ children, analytics, settings }) {
  return (
    <div>
      <section>{children}</section>    {/* main content */}
      <aside>{analytics}</aside>       {/* analytics slot */}
      <aside>{settings}</aside>        {/* settings slot */}
    </div>
  );
}
```

Tiap slot punya error & loading sendiri — salah satu gagal gak ngaruh ke slot lain.

### Intercepting Routes — Modal dari Link

Bisa nge-intercept route untuk tampilin modal tanpa navigasi penuh:

```javascript
// app/feed/page.js — feed utama
// app/feed/(..)photo/[id]/page.js — intercept route /photo/[id]
// app/photo/[id]/page.js — halaman photo penuh

// Kalo user klik foto dari feed: tampil modal (intercept)
// Kalo user buka URL langsung /photo/123: tampil halaman penuh
```

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

### Streaming & Suspense

App Router dukung **Streaming** — server ngirim HTML secara bertahap, gak nunggu semua data siap. Pake `Suspense` buat bungkus komponen yang butuh data.

```javascript
import { Suspense } from 'react';

async function SlowPosts() {
  const posts = await fetch('https://api.example.com/posts', { cache: 'no-store' });
  const data = await posts.json();
  return <ul>{data.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}

async function FastProfile() {
  const user = await fetch('https://api.example.com/user');
  const data = await user.json();
  return <h1>Halo, {data.name}</h1>;
}

export default function Dashboard() {
  return (
    <div>
      <FastProfile />        {/* render dulu */}
      <Suspense fallback={<p>Loading posts...</p>}>
        <SlowPosts />        {/* render belakangan */}
      </Suspense>
    </div>
  );
}
```

**TTFB** (Time To First Byte) lebih kecil karena server ngirim shell halaman dulu. Konten berat jalan di background. Cocok buat halaman dengan campuran data cepat + lambat.

---

## Server Actions — Mutasi Data Tanpa API Routes

Server Actions adalah **fungsi yang jalan di server** tapi bisa dipanggil langsung dari client component. Gausah bikin API endpoint.

### Setup (next.config.js)

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: true,
  },
};
```

Di Next.js 14+, server actions udah **stable** (gak perlu experimental flag).

### Contoh: Form dengan Server Action

```javascript
// app/actions.js — 'use server' directive
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');

  // Validasi server-side
  if (!title || title.length < 3) {
    return { error: 'Judul minimal 3 karakter' };
  }

  // Simpan ke database
  await db.posts.create({
    data: { title, content },
  });

  // Revalidate halaman — refresh data
  revalidatePath('/blog');

  return { success: true };
}
```

```javascript
// app/blog/new/page.js — client component
'use client';

import { createPost } from '../actions';

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Judul" required />
      <textarea name="content" placeholder="Konten" required />
      <button type="submit">Simpan</button>
    </form>
  );
}
```

### Server Action dengan useActionState

Buat handle loading, error, dan validasi di client:

```javascript
'use client';

import { useActionState } from 'react';
import { createPost } from '../actions';

// Initial state
const initialState = { error: null, success: false };

export default function NewPost() {
  const [state, formAction, isPending] = useActionState(createPost, initialState);

  return (
    <form action={formAction}>
      <input name="title" placeholder="Judul" />
      {state?.error && <p className="error">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  );
}
```

### Server Action Best Practices

```javascript
// 1. Pisahkan action ke file terpisah (bukan inline di komponen)
// app/actions/posts.js

// 2. Validasi input selalu di server (client validation bisa dilewati)
// 3. Gunakan Zod untuk validasi
'use server';
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
});

export async function createPost(formData) {
  const parsed = PostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  // ...simpan ke DB
}

// 4. RevalidatePath / revalidateTag setelah mutasi data
// 5. Jangan expose data sensitif di return value
```

---

## RTL Testing (React Testing Library)

Testing komponen React penting buat produksi. Library standar: **React Testing Library (RTL)**.

### Setup

```bash
npm install -D @testing-library/react @testing-library/jest-dom vitest
```

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './test-setup.js',
  },
});
```

### Contoh Test Dasar

```javascript
// Counter.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

describe('Counter Component', () => {
  test('render count awal 0', () => {
    render(<Counter />);
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  test('tombol tambah naikin count', () => {
    render(<Counter />);
    fireEvent.click(screen.getByText('Tambah'));
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });
});
```

### Test Async (fetch data)

```javascript
// UserList.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import UserList from './UserList';

// Mock fetch global
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([
      { id: 1, name: 'Budi' },
      { id: 2, name: 'Siti' },
    ]),
  })
);

describe('UserList', () => {
  test('munculin loading state awal', () => {
    render(<UserList />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('render users setelah fetch', async () => {
    render(<UserList />);
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
      expect(screen.getByText('Siti')).toBeInTheDocument();
    });
  });
});
```

### Tes User Interaction

```javascript
// Form.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from './RegisterForm';

describe('RegisterForm', () => {
  test('validasi required muncul kalo input kosong', async () => {
    render(<RegisterForm />);

    // Klik submit tanpa isi form
    fireEvent.click(screen.getByText('Daftar'));

    // Tunggu validasi muncul
    expect(await screen.findByText(/wajib diisi/i)).toBeInTheDocument();
  });

  test('submit panggil handler dengan data bener', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/nama/i), 'Budi');
    await user.type(screen.getByLabelText(/email/i), 'budi@test.com');
    await user.click(screen.getByText('Daftar'));
  });
});
```

### Prinsip RTL

> **"Test software cara user menggunakannya, bukan implementasi detail."**

- Jangan test state internal — test output di DOM
- Jangan test className — test teks/role yang keliatan user
- Prioritaskan `getByRole`, `getByLabelText`, `getByText` — mirip cara user interaksi
- Hindari `getByTestId` — itu pilihan terakhir

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

6. **Server Action:** Buat form komentar pake Server Action. Simpan komentar ke array in-memory. Tampilkan daftar komentar setelah submit. Gunakan `revalidatePath` buat refresh.

7. **Server Action + Zod:** Buat Server Action untuk registrasi user. Validasi dengan Zod schema. Tampilkan error per-field di client component menggunakan `useActionState`.

8. **Nested Layouts:** Buat dashboard dengan nested layout: sidebar navigasi + konten utama. Layout dashboard harus punya navigasi sendiri terpisah dari layout root.

9. **Group Routes:** Buat route group `(marketing)` untuk homepage + about, dan `(app)` untuk dashboard + settings. Tiap group punya layout sendiri.

10. **RTL Test:** Install RTL + Vitest di Next.js app. Tulis test untuk:
    - Komponen Counter (render, click, state change)
    - Form login dengan validasi (submit kosong → error muncul)

11. **Perbandingan:** Install SvelteKit (`npx sv create my-svelte-app`), bikin halaman yang sama. Bandingkan ukuran bundle hasil build.

12. **Deploy:** Push Next.js ke GitHub, deploy ke Vercel (gratis). Dapetin URL publik.

---

> **Kembali ke:** [📖 Index Modul](README.md)
