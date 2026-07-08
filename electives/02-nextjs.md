# Next.js

> **Durasi:** 6 jam | **Level:** 🚀 Advanced | **Mode:** Individu

## 🎯 Tujuan

Setelah menyelesaikan modul ini, mahasiswa mampu:
1. Setup Next.js 14+ App Router
2. Server Components vs Client Components
3. Routing, Layout, Loading, Error boundaries
4. Data fetching (SSR, SSG, ISR)
5. API Routes & Server Actions
6. Middleware, Auth, dan Deployment

## 📋 Ringkasan Materi

Next.js adalah React framework untuk production — memberikan SSR, SSG, routing, API, dan optimasi out-of-the-box.

### App Router (Next.js 13+)

```tsx
// app/layout.tsx — root layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
```

### Server vs Client Components

```tsx
// app/page.tsx — Server Component (default)
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
}

// app/components/counter.tsx — Client Component
'use client';
import { useState } from 'react';
export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## 🛠️ Latihan

1. **Setup Next.js** — `npx create-next-app@latest`, pilih App Router + TypeScript + Tailwind
2. **Routing** — Buat halaman: `/`, `/about`, `/blog/[slug]`, `/dashboard`
3. **Layout** — Buat root layout + dashboard layout (sidebar)
4. **Loading UI** — Tambah loading.tsx + error.tsx
5. **Data Fetching** — SSR halaman blog, ISR revalidate 60 detik
6. **API Route** — Buat `app/api/notes/route.ts` CRUD
7. **Deploy** — `vercel --prod`

## 📚 Referensi

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Deploy](https://vercel.com/docs)
