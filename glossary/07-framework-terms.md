# ⚛️ Framework Terms

> Istilah-istilah framework frontend & build tools — React, Next.js, Vite, dll.

---

### SPA (Single Page Application)
Aplikasi web yang gak perlu reload halaman. React, Vue, Angular. Semua konten dimuat di satu halaman HTML, routing pake JavaScript.

```tsx
// React Router — routing tanpa reload
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/users/:id" element={<UserDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
// Navigasi gak reload — langsung render komponen baru
```

### SSR (Server-Side Rendering)
Halaman HTML di-render di server dulu, baru dikirim ke browser. SEO lebih bagus, first paint lebih cepet.

```tsx
// Next.js — SSR pake getServerSideProps
// Halaman ini di-render tiap request di server
export default function Page({ data }: { data: any }) {
  return <div>{data.title}</div>;
}

// Fungsi ini jalan di SERVER, bukan browser
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/post/1');
  const data = await res.json();
  
  return { props: { data } };
  // Props dikirim ke komponen sebagai JSON (udah di-fetch di server)
}
```

### SSG (Static Site Generation)
Halaman HTML dibikin pas build time (bukan tiap request). Super cepet karena tinggal serve file statis.

```tsx
// Next.js — SSG pake getStaticProps
export default function Blog({ posts }: { posts: Post[] }) {
  return (
    <ul>
      {posts.map(p => <li key={p.id}>{p.title}</li>)}
    </ul>
  );
}

// Jalan pas build (npm run build) — gak tiap request
export async function getStaticProps() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());
  
  return {
    props: { posts },
    revalidate: 60 // ISR: rebuild tiap 60 detik kalo ada request
  };
}

// Output build:
// info  - Generated /blog
// info  - Generated /blog/post-1
// info  - Generated /blog/post-2
```

### Hydration
Proses React \"ngaktifin\" HTML statis jadi interaktif di browser. HTML dari server dikasih event listener.

```tsx
// Server kirim HTML:
// <button id="counter-btn">0</button>
// 
// Hydration: React "ngambil alih" button ini
// Tambahin onClick, state, event listener
// Tanpa nge-render ulang dari awal

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  );
}
// HTML awal dari server: <button>0</button>
// Setelah hydration: button bisa diklik
```

### Component
Bagian UI yang reusable di React/Next.js. Bisa diatur props-nya. Komponen kecil disusun jadi halaman.

```tsx
// Component — reusable piece of UI
interface ButtonProps {
  label: string;
  variant: 'primary' | 'secondary';
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, variant, onClick, disabled }: ButtonProps) {
  const baseClass = 'px-4 py-2 rounded font-medium';
  const variantClass = variant === 'primary'
    ? 'bg-blue-500 text-white'
    : 'bg-gray-200 text-gray-800';
    
  return (
    <button
      className={`${baseClass} ${variantClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

// Pake komponen
function LoginForm() {
  return (
    <div>
      <Button label="Login" variant="primary" onClick={() => console.log('login')} />
      <Button label="Batal" variant="secondary" onClick={() => console.log('cancel')} />
    </div>
  );
}
```

### Reactive (Reaktivitas)
Mekanisme di mana UI otomatis update saat data berubah. Gak perlu manipulasi DOM manual.

```tsx
// React — state reactif
import { useState } from 'react';

function Counter() {
  // state — kalau berubah, komponen auto re-render
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Kamu klik {count} kali</p>
      <button onClick={() => setCount(count + 1)}>
        Tambah
      </button>
    </div>
  );
}

// Vue — lebih magic dengan ref/reactive
// <script setup>
// import { ref } from 'vue'
// const count = ref(0)
// </script>
// 
// <template>
//   <p>{{ count }}</p>  <!-- Auto update pas count berubah -->
//   <button @click="count++">Tambah</button>
// </template>
```

### Webpack
Module bundler. Gabungin semua JS, CSS, gambar jadi file bundle. Dulu standar industri, sekarang mulai diganti Vite.

```js
// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js',     // Starting point
  output: {
    filename: 'bundle.js',     // Output file
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader' },  // Handle TypeScript
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }, // Handle CSS
      { test: /\.(png|jpg)$/, type: 'asset/resource' }, // Handle images
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' }),
  ],
  devServer: {
    port: 3000,
    hot: true, // Hot Module Replacement
  },
};
```

### Vite
Build tool modern. Cepet banget dibanding Webpack pake native ESM di dev dan Rollup di build.

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000', // Proxy API ke backend
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
  },
});

// Dev start: < 1 detik (pake native ESM, gak perlu bundle)
// Webpack: 5-10 detik buat start dev server
// Vite: < 1 detik 🚀
```

### Hot Module Replacement (HMR)
Ganti module/modul di browser tanpa reload halaman penuh. State aplikasi tetap terjaga.

```tsx
// Webpack HMR
if (module.hot) {
  module.hot.accept('./Button', () => {
    // Ganti Button component tanpa reload
    render(<App />);
  });
}

// Vite HMR — jalan otomatis, gak perlu konfigurasi
// Ubah CSS → langsung update tanpa reload ✅
// Ubah komponen → state tetap, cuma komponen itu yg di-render ulang ✅
// Error di komponen → gak ngaruh ke komponen lain ✅
```

### Tree Shaking
Fitur bundler yang ngehapus kode yang gak dipake biar file size lebih kecil.

```ts
// utils.ts
export function add(a: number, b: number) { return a + b; }
export function subtract(a: number, b: number) { return a - b; }
export const PI = 3.14159; // Gak dipake di main.ts

// main.ts — cuma import add
import { add } from './utils';
console.log(add(2, 3));

// Setelah tree shaking: subtract dan PI dihapus dari bundle
// Bundle size lebih kecil 🎉
```

### Lazy Loading
Teknik loading cuma pas dibutuhin. Biar website makin cepet — gak perlu download semua kode di awal.

```tsx
// React.lazy — komponen di-load pas dibutuhin
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('./pages/Dashboard'));
const SettingsPage = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  );
}
// Dashboard.tsx cuma di-download pas user buka /dashboard
```

### Virtual DOM
Representasi ringan dari DOM di memory. React pake ini buat optimasi rendering — bedain DOM lama & baru, terus update perbedaan aja di real DOM.

```tsx
// React Virtual DOM — cara kerjanya
// 1. Render: bikin Virtual DOM tree
// 2. Diff: bandingin sama Virtual DOM sebelumnya
// 3. Patch: update real DOM cuma yang beda

function UserList({ users }: { users: string[] }) {
  return (
    <ul>
      {users.map((name, i) => <li key={i}>{name}</li>)}
    </ul>
  );
}
// Kalau users berubah dari ["Budi"] → ["Budi", "Sari"]
// React cuma nambah <li>Sari</li> di DOM
// Gak nge-render ulang seluruh list
```

### State Management
Cara ngatur data global di aplikasi React. Redux, Zustand, Jotai, Context API.

```ts
// Zustand — state management simple
import { create } from 'zustand';

interface CartStore {
  items: string[];
  addItem: (item: string) => void;
  clear: () => void;
}

const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  clear: () => set({ items: [] }),
}));

// Pake di komponen — auto re-render pas state berubah
function Cart() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  
  return (
    <div>
      <p>Items: {items.length}</p>
      <button onClick={() => addItem('Buku')}>Tambah Buku</button>
    </div>
  );
}
```

### Next.js vs React

| Fitur | React | Next.js |
|-------|-------|---------|
| Routing | Pake library (React Router) | File-system routing (build-in) |
| Rendering | Client-side only | SSR, SSG, ISR, CSR |
| Data fetching | useEffect / library | getServerSideProps, getStaticProps |
| Image optimization | Manual | next/image otomatis |
| SEO | Jelek (client-only) | Bagus (server-rendered) |
| API routes | Bikin server terpisah | Built-in API routes |

---

*[Kembali ke Daftar Istilah](README.md)*
