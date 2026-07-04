# 🧠 Cheatsheet: Frontend Frameworks

> Referensi cepet — 1 halaman.

## Topik Utama
- **Component Model**: Props in (read-only), Events out (callback) — data 1 arah
- **Reactivity**: Virtual DOM (React), Compile-time (Svelte/Solid), Proxy (Vue 3/Qwik)
- **Lifecycle**: Mount → Update → Unmount (nama API beda, konsep sama)
- **State Management**: Local → Lifted (props drilling) → Global (store)
- **Routing**: SPA (client-side, cepat, SEO jelek) vs SSR (server render, SEO bagus)
- **Rendering**: SSR, SSG (build time), ISR (hybrid, revalidate periodik)
- **Framework**: React (jobs), Vue (Asia), Svelte (ringan), Solid (cepat), Qwik (resumable)

## Command / Sintaks Penting

```javascript
// React — useState + useEffect
const [count, setCount] = useState(0);
useEffect(() => { document.title = `Count: ${count}`; }, [count]);

// Vue 3 — ref + onMounted
const count = ref(0);
onMounted(() => { console.log('mounted'); });

// Svelte — $state + onMount
let count = $state(0);
onMount(() => { /* ... */ });
```

```text
# Pola Universal Component
[Parent]
  │ kirim props ──→ [Child]
  └── terima event ←──┘

# Kapan pilih framework?
React      → kerja di perusahaan besar
Vue/Svelte → sederhana, mirip HTML
Solid      → performa super tinggi
Qwik       → bundle terkecil (resumable)
```

## Tips & Trik
- **Belajar pola, bukan framework** — reactivity, lifecycle, state management sama di semua.
- **Start local state**, lift kalo perlu, global store kalo props drilling sakit.
- **SPA buat dashboard**, SSR/SSG buat landing page & e-commerce.
- **Cleanup lifecycle** — hapus interval, remove listener di unmount (cegah memory leak).

## Common Mistakes
❌ Langsung global store — over-engineering untuk state sederhana.
❌ Lupa cleanup di lifecycle — memory leak (interval, event listener).
❌ Mutasi props langsung — React/Vue warning, data flow rusak.
❌ Pilih framework based on hype, bukan kebutuhan project.
❌ SPA for SEO-heavy site tanpa SSR — Google indexed content kosong.

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
- [React Docs](https://react.dev)
- [Vue Docs](https://vuejs.org)
- [Svelte Docs](https://svelte.dev)
