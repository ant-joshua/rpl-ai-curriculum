# RPP Modul 20: Frontend Frameworks

**Durasi:** 3 sesi × 90 menit = 270 menit

## Tujuan Pembelajaran

Setelah modul ini, siswa mampu:
- Memahami component model universal (props in, events out)
- Membedakan reaktivitas (Virtual DOM, compile-time, Proxy)
- Mengelola lifecycle component
- Menerapkan state management (local → lifted → global)
- Membedakan SPA vs SSR vs SSG vs ISR

## Tools & Bahan

- React + Vite
- Vue 3 + Vite (opsional)
- Svelte / Solid (opsional, untuk perbandingan)
- Browser DevTools
- Contoh app sederhana (counter, todo, dashboard)

---

## Sesi 1: Component Model + Props + Events (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Universal Component Model** | Props in (read-only), Events out (callback). Data flow 1 arah. React, Vue, Svelte syntax comparison. |
| 45 menit | **Coding: Counter + Todo React** | Live coding: komponen Counter (props + events). Todo list: add, delete, toggle. Lift state ke parent. |
| 20 menit | **Latihan: Product Catalog** | Siswa bikin product catalog: list produk dari array → filter by category → klik detail. |
| 10 menit | **Review** | Kenapa props harus read-only? Bedanya local vs lifted state? |

**Code demo:**

```jsx
// React — Component + Props + Events
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div>
      <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}
            onClick={() => onToggle(todo.id)}>
        {todo.text}
      </span>
      <button onClick={() => onDelete(todo.id)}>✕</button>
    </div>
  );
}

// Vue 3
// <TodoItem :todo="todo" @toggle="onToggle" @delete="onDelete" />
```

**Checklist siswa:**
- [ ] Component dengan props
- [ ] Event handler (callback)
- [ ] Todo list CRUD
- [ ] State lifting

---

## Sesi 2: Lifecycle + Effects + Reactivity (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Lifecycle & Reactivity** | Mount → Update → Unmount. Virtual DOM (React) vs Compile-time (Svelte/Solid) vs Proxy (Vue). `useEffect`, `onMounted`, `$effect`. |
| 45 menit | **Coding: Data Fetching + Cleanup** | Bikin halaman dengan fetch API. Handle loading/error. Setup interval → cleanup di unmount (cegah memory leak). |
| 20 menit | **Latihan: Dashboard with Live Data** | Siswa bikin dashboard: fetch data periodik, cleanup interval, loading/error states. |
| 10 menit | **Review** | Kenapa cleanup penting? Apa beda Virtual DOM vs compile-time reactivity? |

**Code demo:**

```jsx
// React — useEffect + cleanup
function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/data');
      setData(await res.json());
    }, 5000);

    return () => clearInterval(interval); // cleanup!
  }, []);

  if (!data) return <Loading />;
  return <Chart data={data} />;
}
```

**Checklist siswa:**
- [ ] useEffect / onMounted / onMount
- [ ] Cleanup interval & event listener
- [ ] Loading/error states
- [ ] Fetch API

---

## Sesi 3: Routing + Rendering Strategy + Framework Comparison (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Routing + Rendering** | SPA (client routing, SEO jelek) vs SSR (server render, SEO bagus) vs SSG (build time) vs ISR (hybrid). Framework comparison: React (jobs), Vue (Asia), Svelte (ringan), Solid (cepat), Qwik (resumable). |
| 45 menit | **Coding: React Router + Next.js** | React Router: multi-page SPA. Bandingkan dengan Next.js SSR page. Demo: landing page (SSG) vs dashboard (SPA). |
| 20 menit | **Latihan: Mini Portfolio** | Siswa bikin mini portfolio: home (SSR/SSG), projects (SPA), blog (SSG). Deploy ke Vercel. |
| 10 menit | **Review** | Kapan pilih SPA vs SSR? Framework apa cocok untuk project apa? |

**Code demo:**

```jsx
// React Router
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/blog/:slug" element={<BlogPost />} />
  </Routes>
</BrowserRouter>

// Next.js — SSG page (pages/projects.js)
export async function getStaticProps() {
  const projects = await getProjects();
  return { props: { projects } };
}
```

**Checklist siswa:**
- [ ] React Router multi-page
- [ ] SSR/SSG page
- [ ] Deploy ke Vercel
- [ ] Paham perbedaan rendering strategy

## Assessment

| Kriteria | Bobot |
|----------|-------|
| Component model + props/events | 25% |
| Lifecycle + effects + reactivity | 30% |
| Routing + rendering strategy | 30% |
| Partisipasi | 15% |
