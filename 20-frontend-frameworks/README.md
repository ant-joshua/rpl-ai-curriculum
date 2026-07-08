# Modul 20: Framework Frontend Modern — Konsep Inti, Bukan Tutorial Framework

**Target:** SMK RPL — siswa sudah paham HTML, CSS, JavaScript dasar  
**Level:** Menengah — butuh dasar JavaScript (function, array, object, Promise)  
**Durasi:** 6 pertemuan (@2 jam) + 3 jam latihan mandiri  
**Prasyarat:** HTML, CSS, JavaScript dasar (ES6+)  
**Output:** Web app React + Next.js multi-halaman, paham pola arsitektur frontend modern

**Tujuan:** Paham pola arsitektur yang SAMA di semua framework frontend modern  
**Amanat:** Setelah modul ini, siswa bisa belajar React, Vue, Svelte, Solid, atau Qwik manapun — karena konsepnya sama

---

## 📚 Sesi Pembelajaran

| # | Sesi | Durasi | Materi |
|---|------|--------|--------|
| 01 | [React Basics — Komponen, Props, State & JSX](01-react-basics.md) | 2 jam (+ 1 jam latihan) | Declarative UI, JSX, function vs class component, props drilling, useState, event handling, conditional rendering, lists & keys, React DevTools |
| 02 | [React Hooks — useEffect, useRef, useContext, useReducer & Custom Hooks](02-react-hooks.md) | 2 jam (+ 1 jam latihan) | useEffect lifecycle & cleanup, useRef DOM refs & mutable values, useContext global state, useReducer complex state, custom hooks, rules of hooks |
| 03 | [Next.js, SSR/SSG/ISR & Perbandingan Framework](03-nextjs-frameworks.md) | 2 jam (+ 1 jam latihan) | Next.js Pages vs App Router, SSR/SSG/ISR, file-based routing, API routes, React Server Components, deployment Vercel, Svelte comparison, choosing framework |

---

## 🎯 Tujuan Pembelajaran

Setelah menyelesaikan 3 sesi ini, siswa mampu:

1. **Memahami arsitektur React** — declarative rendering, component tree, data flow satu arah
2. **Membangun komponen React** dengan JSX, props, dan state lokal (`useState`)
3. **Mengelola side effects** dengan `useEffect` — fetch data, event listener, timer, cleanup
4. **Mengatasi props drilling** dengan `useContext` dan `useReducer` buat state kompleks
5. **Membuat custom hooks** — abstraksi logika reuseable antar komponen
6. **Membangun aplikasi multi-halaman** dengan Next.js App Router — routing, layout, loading
7. **Memilih strategi rendering** yang tepat — SSR, SSG, ISR — sesuai kebutuhan proyek
8. **Membandingkan framework** React, Svelte, Vue, Solid, Qwik — paham tradeoff masing-masing
9. **Mendeploy aplikasi** Next.js ke Vercel

---

## 📖 Konsep Inti

### Component Model — Props In, Events Out

Setiap framework pake **component** sebagai unit UI terkecil. Component itu fungsi/kelas yang nerima input (disebut **props**), dan ngirim output lewat **events**.

```
[Parent Component]
      │
      ├── kirim props ──→ [Child Component]
      │                        │
      └── terima event ←──────┘
```

| Framework | Cara definisi props | Cara emit event |
|-----------|-------------------|-----------------|
| **React** | `function Card({ title })` | `onClick={props.onSave}` |
| **Vue** | `defineProps(['title'])` | `emit('save', data)` |
| **Svelte** | `export let title` | `createEventDispatcher()` |
| **Solid** | `function Card(props)` | props callback |
| **Qwik** | `component$((props) => ...)` | `$(props.onSave)` |

**Data cuma mengalir satu arah:** parent → child lewat props, child → parent lewat events. Ini yang bikin debugging gampang.

---

### Reactivity — Gimana Framework Tahu Ada Perubahan?

```javascript
// React — Virtual DOM
const [count, setCount] = useState(0);
setCount(count + 1);  // trigger re-render seluruh komponen
```

```svelte
<!-- Svelte — Compile-time -->
<script>
  let count = $state(0);
  count++;
</script>
<p>{count}</p>
```

```javascript
// Vue 3 — Proxy-based
const count = ref(0);
count.value++;
```

| Pendekatan | Contoh | Kelebihan | Kekurangan |
|-----------|--------|-----------|-----------|
| Virtual DOM | React | Ekosistem gede, prediktif | Overhead render ulang |
| Compile-time | Svelte, Solid | Bundle kecil, performa tinggi | Harus dikompilasi dulu |
| Proxy-based | Vue 3, Qwik | Reactive otomatis | Proxy punya edge cases |

---

### Component Lifecycle — Lahir, Hidup, Mati

| Fase | React | Vue | Svelte | Solid |
|------|-------|-----|--------|-------|
| **Mount** | `useEffect(fn, [])` | `onMounted()` | `onMount()` | `onMount()` |
| **Update** | `useEffect(fn, [dep])` | `watchEffect()` | `$effect()` | `createEffect()` |
| **Unmount** | return di `useEffect` | `onUnmounted()` | `onDestroy()` | `onCleanup()` |

```javascript
// React — cleanup
useEffect(() => {
  const id = setInterval(() => tick(), 1000);
  return () => clearInterval(id);  // unmount → cleanup
}, []);
```

```vue
<!-- Vue -->
<script setup>
import { onMounted, onUnmounted } from 'vue'
let id;
onMounted(() => { id = setInterval(tick, 1000) })
onUnmounted(() => clearInterval(id))
</script>
```

```svelte
<!-- Svelte -->
<script>
  import { onMount, onDestroy } from 'svelte'
  let id;
  onMount(() => { id = setInterval(tick, 1000) })
  onDestroy(() => clearInterval(id))
</script>
```

---

### State Management — Local, Lifted, Global

**Local state:** nilai input form, toggle dropdown, counter.

```svelte
<script>
  let isOpen = $state(false);
</script>
```

**Lifted state (props drilling):** Dua komponen perlu data yang sama → state di parent.

```
        [App]
          │  count ← state di sini
          │
     ┌────┴────┐
  [CounterView]  [ResetButton]
    count ↑       onClick ↑
```

**Global state:** Zustand, Redux, Context API, Pinia, Svelte stores.

```javascript
// React + Zustand
const useStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 }))
}));
function Counter() {
  const count = useStore((s) => s.count);
}
```

```javascript
// Vue + Pinia
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  function increment() { count.value++ }
  return { count, increment }
});
```

```svelte
<!-- Svelte store (bawaan) -->
<script>
import { count, increment } from './stores/counter';
</script>
<!-- Di template: {$count} -->
```

**Aturan main:** Local → Lifting → Global. Jangan langsung global store dari awal.

---

### Tabel Perbandingan Framework

| Aspek | React | Vue | Svelte | Solid | Qwik |
|-------|-------|-----|--------|-------|------|
| **Dirilis** | 2013 | 2014 | 2019 | 2021 | 2022 |
| **Bundle size (Hello World)** | ~42 KB gzipped | ~16 KB gzipped | ~2 KB gzipped | ~7 KB gzipped | ~1 KB (lazy load) |
| **Learning curve** | Curam (JSX, hooks) | Landai (HTML-based) | Paling landai | Sedang | Sedang |
| **Ecosystem** | Terbesar | Besar | Sedang (tumbuh) | Kecil | Kecil (baru) |
| **Job market** | Paling banyak | Banyak (Asia) | Mulai ada | Niche | Niche |
| **Hydration** | Full hydration | Full hydration | No hydration | No hydration | Resumable |
| **Reactivity model** | Virtual DOM | Proxy (Vue 3) | Compile-time signal | Compile-time signal | Proxy + signal |
| **Mobile** | React Native | NativeScript | (via SvelteKit) | (via SolidStart) | Belum matang |

---

## Latihan (untuk dikerjakan sendiri)

1. Buat component counter (tombol + / -) di framework manapun — liat state, props, events di komponen itu
2. Identifikasi: mana state lokal? Mana yang perlu di-lift?
3. Coba pindahin counter itu ke global store (Zustand / Pinia / Svelte store)
4. Tambah routing: halaman Home, About, Counter — pake router framework masing-masing
5. Ukur bundle size hasil build — bandingkan dengan framework lain

---

## Kesimpulan — Pilih yang Mana?

**Ga ada framework terbaik.** Yang ada adalah framework yang cocok buat situasi tertentu.

| Kalo... | Coba... |
|---------|--------|
| Mau kerja di perusahaan besar | **React** — paling banyak dicari |
| Mau yang sederhana, mirip HTML | **Vue** atau **Svelte** |
| Mau bundle paling ringan | **Svelte** atau **Solid** |
| Mau performa super tinggi | **Solid** (signal-based, ga ada Virtual DOM) |
| Mau yang paling baru & beda | **Qwik** (resumability = masa depan?) |
| Single developer / proyek sendiri | Pake apapun yang paling nyaman |

**Yang lebih penting:** Paham konsep component, reactivity, lifecycle, state management, routing. Begitu paham konsep ini, belajar framework baru tinggal belajar **sintaks** — butuh 1-2 minggu, bukan 6 bulan.

Semua framework pinjam ide satu sama lain. React pake hooks dari Svelte? Vue pake signal dari Solid? Svelte 5 pake runes mirip Solid? Ya — semuanya konvergen ke pola yang sama. **Belajarlah pola-nya, bukan framework-nya.**

---

> **Referensi lanjutan:**
> - [react.dev](https://react.dev)
> - [vuejs.org](https://vuejs.org)
> - [svelte.dev](https://svelte.dev)
> - [solidjs.com](https://solidjs.com)
> - [qwik.dev](https://qwik.dev)
> - [Next.js vs Nuxt vs SvelteKit](https://vercel.com/guides/nextjs-vs-nuxt-vs-sveltekit) — perbandingan meta-framework
