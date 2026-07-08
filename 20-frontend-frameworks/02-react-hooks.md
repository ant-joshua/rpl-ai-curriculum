# 02 — React Hooks: useEffect, useRef, useContext, useReducer & Custom Hooks

**Durasi:** 2 jam pertemuan + 1 jam latihan

---

## Apa Itu Hooks?

Hooks adalah **fungsi bawaan React** yang "ngait" (hook into) fitur React state dan lifecycle dari function component. Sebelum hooks (React < 16.8), fitur ini cuma bisa pake class component.

Tiga prinsip hooks:
1. **Panggil hooks di level teratas** — jangan di dalam loop, kondisi, atau nested function.
2. **Panggil hooks dari function React** — dari function component atau custom hooks.
3. **Semua hooks diawali `use`** — React pake konvensi ini buat nge-detect hooks.

---

## useEffect — Side Effects & Lifecycle

`useEffect` adalah hook buat **side effects** — operasi yang terjadi di luar rendering: ambil data API, pasang event listener, timer, manipulasi DOM manual.

```javascript
useEffect(() => {
  // Effect code — jalan setelah render
  return () => {
    // Cleanup code — jalan sebelum unmount / sebelum re-run
  };
}, [dependencies]);
```

### Lifecycle Mapping

| Fase | Cara di useEffect |
|------|-------------------|
| **Mount** (komponen lahir) | `useEffect(fn, [])` — array kosong = jalan sekali |
| **Update** (data berubah) | `useEffect(fn, [dep])` — jalan tiap `dep` berubah |
| **Unmount** (komponen mati) | return function di `useEffect` |

### Contoh: Fetch data API

```javascript
import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []); // [] = jalan sekali pas mount

  if (loading) return <p>Loading...</p>;

  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### Contoh Cleanup

Kalo komponen bikin interval / event listener, cleanup harus di return function — kalo nggak, **memory leak**.

```javascript
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);

    // Cleanup — jalan pas komponen di-unmount
    return () => {
      clearInterval(id);
      console.log('Timer dibersihkan');
    };
  }, []);

  return <p>Detik: {count}</p>;
}
```

### Common `useEffect` Patterns

```javascript
// 1. Fetch data (mount)
useEffect(() => { fetchData() }, []);

// 2. Subscribe event listener
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// 3. Sync dengan localStorage
useEffect(() => {
  localStorage.setItem('theme', theme);
}, [theme]);

// 4. Update document title
useEffect(() => {
  document.title = `Pesan (${unread})`;
}, [unread]);
```

---

## useRef — DOM Refs & Mutable Values

`useRef` bikin objek ref yang **gak berubah antar render**. Bedanya dengan state: ngubah ref **gak trigger re-render**.

```javascript
import { useRef } from 'react';
```

### 1. Referensi DOM

```javascript
function AutoFocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus(); // fokus pas mount
  }, []);

  return <input ref={inputRef} type="text" />;
}
```

### 2. Mutable Values (non-rendering)

Ref bisa nyimpen nilai yang berubah tanpa trigger re-render. Cocok buat: timer ID, scroll position, nilai sebelumnya.

```javascript
function Stopwatch() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);

  function start() {
    intervalRef.current = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);
  }

  function stop() {
    clearInterval(intervalRef.current);
  }

  return (
    <div>
      <p>{count} detik</p>
      <button onClick={start}>Mulai</button>
      <button onClick={stop}>Berhenti</button>
    </div>
  );
}
```

---

## useContext — Global State Tanpa Props Drilling

`useContext` ngasih akses ke **context** — data yang tersedia buat seluruh subtree komponen tanpa di-pass lewat props tiap level.

### Langkah-langkah:

1. **Buat context** dengan `createContext()`
2. **Bungkus komponen** dengan `Provider` dan nilai context
3. **Konsumsi** di komponen manapun pake `useContext()`

```javascript
import { createContext, useContext, useState } from 'react';

// 1. Buat context
const ThemeContext = createContext();

// 2. Provider di parent
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Toolbar />
      <Content />
    </ThemeContext.Provider>
  );
}

// 3. Konsumsi di child manapun
function Toolbar() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <div className={`toolbar ${theme}`}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Ganti Tema
      </button>
    </div>
  );
}
```

Tanpa context, `theme` dan `setTheme` harus di-pass: `App → Layout → Header → Toolbar` — props drilling. Context **melewati** layer yang gak butuh data itu.

**Kapan pake context:** state yang dipake banyak komponen di level beda (tema, user auth, locale). **Jangan** pake context buat gantiin semua props — itu bikin debugging susah.

---

## useReducer — Complex State Logic

`useReducer` mirip `useState` tapi lebih cocok buat state yang **kompleks** (multi-nilai) atau update yang **tergantung state sebelumnya**.

```javascript
import { useReducer } from 'react';

// Reducer function — terima state sekarang + action, return state baru
function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    case 'SET':
      return { count: action.payload };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      <button onClick={() => dispatch({ type: 'SET', payload: 10 })}>Set 10</button>
    </div>
  );
}
```

### useState vs useReducer

| useState | useReducer |
|----------|-----------|
| State sederhana (string, number, boolean) | State kompleks (object, nested) |
| Update langsung | Update via action type |
| Logika update di komponen | Logika update di reducer (terpusat) |
| 2-3 state terpisah | 1 state dengan banyak field |

**Panduan:** Mulai dari `useState`. Kalau udah 3+ `useState` yang saling terkait, refactor ke `useReducer`.

---

## Custom Hooks — Build Your Own

Custom hook adalah **fungsi JavaScript** yang pake hooks React lain. Biar logika reuseable antar komponen.

### Contoh: useLocalStorage

```javascript
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Pake di komponen
function ThemeSwitcher() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme}
    </button>
  );
}
```

### Contoh: useWindowSize

```javascript
import { useState, useEffect } from 'react';

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// Pake di komponen
function ResponsiveLayout() {
  const { width } = useWindowSize();
  return <p>Lebar layar: {width}px</p>;
}
```

**Aturan custom hooks:** Nama harus diawali `use` — React pake ini buat ngecek aturan hooks.

---

## State Management: Zustand (React) & Pinia (Vue)

Saat aplikasi makin besar, Context API mulai terbatas — tiap perubahan context **re-render semua consumer**. Solusinya: state management library eksternal.

### Zustand — State Management Minimalis untuk React

Zustand adalah library state management paling populer untuk React modern. Ringan (~1KB), tanpa boilerplate.

```bash
npm install zustand
```

```javascript
import { create } from 'zustand';

// Store — mirip useState tapi global
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// Pake di komponen mana pun
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

**Keunggulan Zustand vs Context:**
- **Selective subscription** — komponen cuma re-render kalau bagian store yang dipake berubah.
- **No provider** — gak perlu bungkus app pake Provider.
- **Middleware** — dukung persist, immer, devtools.

```javascript
// Zustand dengan persist (localStorage)
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
      })),
    }),
    { name: 'theme-storage' }
  )
);
```

### Pola Zustand yang Sering Dipakai

```javascript
// Store dengan async actions — fetch API
import { create } from 'zustand';

const useUserStore = create((set) => ({
  users: [],
  loading: false,
  error: null,
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const res = await fetch('https://api.example.com/users');
      const users = await res.json();
      set({ users, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

// Store dengan multiple state
const useCartStore = create((set, get) => ({
  items: [],
  addItem: (product) => set((state) => ({
    items: [...state.items, { ...product, qty: 1 }],
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),
  getTotal: () => get().items.reduce((sum, item) => sum + item.price * item.qty, 0),
}));
```

### Pinia — State Management untuk Vue (Perbandingan)

Buat yang nanti belajar Vue, Pinia adalah state management resmi (pengganti Vuex):

```javascript
// stores/counter.js — Pinia
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++;
    },
    async fetchAndSet() {
      const data = await fetch('/api/count').then(r => r.json());
      this.count = data.count;
    },
  },
});

// Di komponen Vue
// <script setup>
// import { useCounterStore } from '@/stores/counter'
// const counter = useCounterStore()
// counter.count         // state
// counter.doubleCount   // getter
// counter.increment()   // action
// </script>
```

**Perbandingan: Zustand vs Pinia vs Context:**

| Aspek | Zustand | Pinia | Context API |
|-------|---------|-------|-------------|
| Bundle size | ~1KB | ~9KB | 0 (built-in) |
| Boilerplate | Sangat minim | Sedang | Minimal |
| Selective re-render | ✅ Otomatis | ✅ Otomatis | ❌ Semua consumer |
| Async actions | Manual (async/await) | Built-in | Manual |
| Middleware | persist, immer, devtools | persist, devtools | None |
| React/Vue | React only | Vue only | React only |

---

## React Hook Form — Form Handling Modern

Form di React bisa pakai `useState` biasa, tapi makin kompleks form makin sulit. **React Hook Form** (RHF) solusi form performa tinggi, minim re-render.

```bash
npm install react-hook-form
```

```javascript
import { useForm } from 'react-hook-form';

function RegisterForm() {
  const {
    register,         // hook input ke form
    handleSubmit,     // wrapper submit
    formState: { errors },  // error tiap field
    watch,            // liat nilai real-time
  } = useForm();

  const onSubmit = (data) => {
    console.log('Data form:', data);
    // Kirim ke API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Nama</label>
        <input {...register('name', { required: 'Nama wajib diisi' })} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <label>Email</label>
        <input
          {...register('email', {
            required: 'Email wajib diisi',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Format email tidak valid',
            },
          })}
        />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          {...register('password', {
            required: true,
            minLength: { value: 6, message: 'Minimal 6 karakter' },
          })}
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <button type="submit">Daftar</button>
    </form>
  );
}
```

### Integrasi dengan UI Library (shadcn/ui, MUI)

```javascript
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select'; // library select

function ProductForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Controller
        name="category"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Select
            {...field}
            options={[
              { value: 'elektronik', label: 'Elektronik' },
              { value: 'pakaian', label: 'Pakaian' },
            ]}
          />
        )}
      />
      <button type="submit">Simpan</button>
    </form>
  );
}
```

### Kenapa React Hook Form?

- **Minim re-render** — tiap field di-register independently, gak trigger render ulang form.
- **Validation built-in** — dukung required, pattern, minLength, custom validate.
- **Integrasi mudah** — bisa pake Yup/Zod untuk schema validation.
- **performace** — cocok buat form besar (>50 field).

```javascript
// Validasi dengan Zod schema
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Minimal 6 karakter'),
});

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      <input type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Aturan Hooks (Rules of Hooks)

Ada dua aturan mutlak:

### 1. Panggil hooks hanya di TOP LEVEL

Jangan panggil hooks di dalam **loop, kondisi, atau fungsi bersarang**.

```javascript
// ❌ SALAH — hooks di dalam kondisi
function BadComponent({ show }) {
  if (show) {
    const [data, setData] = useState(null); // RUNTIME ERROR!
  }
}

// ✅ BENAR — hooks di level teratas
function GoodComponent({ show }) {
  const [data, setData] = useState(null);
  if (!show) return null;
  return <div>{data}</div>;
}
```

### 2. Panggil hooks hanya dari FUNCTION COMPONENT / CUSTOM HOOK

Jangan panggil hooks dari fungsi JavaScript biasa, class component, atau callback biasa.

```javascript
// ❌ SALAH — hooks di fungsi biasa
function fetchUsers() {
  const [users, setUsers] = useState([]); // ERROR!
}

// ✅ BENAR — pake custom hook
function useFetchUsers() {
  const [users, setUsers] = useState([]);
  // ...
  return users;
}
```

React pake **urutan panggilan hooks** buat ngelacak state. Kalau hooks dipanggil di kondisi, urutannya berubah tiap render → React bingung state mana punya siapa. Makanya hooks HARUS di level teratas.

---

## useMemo & useCallback — Performance Hooks

`useMemo` dan `useCallback` mencegah perhitungan ulang yang gak perlu.

### useMemo — Cache Hasil Komputasi

Memoisasi nilai hasil komputasi berat:

```javascript
import { useMemo } from 'react';

function Dashboard({ transactions, filter }) {
  // Hanya hitung ulang kalo transactions atau filter berubah
  const filteredTotal = useMemo(() => {
    console.log('Hitung ulang...');
    return transactions
      .filter(t => t.category === filter)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, filter]);

  return <p>Total: Rp{filteredTotal.toLocaleString()}</p>;
}
```

**Kapan pake:** komputasi berat (filter array gede, mapping data, format data). **Jangan** pake `useMemo` untuk operasi sederhana — overhead lebih gede dari komputasinya.

### useCallback — Cache Fungsi

`useCallback` return fungsi yang sama (referensi stabil) antar render — penting saat fungsi di-pass sebagai prop ke child yang pake `React.memo()`:

```javascript
import { useCallback, useState } from 'react';

function ProductList() {
  const [query, setQuery] = useState('');

  // Tanpa useCallback: fungsi baru tiap render
  // Pake useCallback: referensi fungsi stabil kalo query gak berubah
  const handleSearch = useCallback((term) => {
    setQuery(term);
    // fetch hasil search...
  }, []); // [] → fungsi gak pernah berubah

  return (
    <div>
      <SearchInput onSearch={handleSearch} />
      <Results query={query} />
    </div>
  );
}
```

**useMemo vs useCallback:**

| Hook | Return | Kapan pake |
|------|--------|-----------|
| `useMemo` | Nilai hasil komputasi | Komputasi berat, format data |
| `useCallback` | Fungsi itu sendiri | Callback yang di-pass ke child |

**Aturan:** Jangan optimasi duluan. Tulis kode yang jelas dulu, ukur performa, baru `useMemo`/`useCallback` kalo terbukti ada masalah.

---

## Testing React dengan RTL (React Testing Library)

**RTL** adalah library testing untuk React — fokus ke **behavior**, bukan implementasi. Prinsip: test komponen kayak user pake aplikasi.

### Setup

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest
```

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true },
});
```

### Test Dasar

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Counter from './Counter';

describe('Counter Component', () => {
  it('render initial value 0', () => {
    render(<Counter />);
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('increment saat tombol + diklik', () => {
    render(<Counter />);
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByText('1')).toBeTruthy();
  });
});
```

### Testing Form Submit

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('submit dengan data valid', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByPlaceholderText('Email'), 'user@test.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@test.com',
        password: 'secret123',
      })
    );
  });

  it('tampilkan error validasi', async () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText(/wajib diisi/i)).toBeTruthy();
  });
});
```

**Best practice RTL:**
1. Test behavior, bukan implementasi — jangan test state internal
2. Pake `getByRole`, `getByLabelText`, `getByPlaceholderText` — bukan `getByTestId`
3. Pake `userEvent` daripada `fireEvent` — lebih mirip user beneran
4. Test accessibility secara otomatis

---

## Latihan

1. **Timer dengan Cleanup:** Buat komponen Timer pake `useEffect` + `useRef` buat interval. Tambah tombol Start/Stop. Pastikan interval berhenti pas komponen di-unmount.

2. **Fetch Data:** Buat komponen yang fetch daftar posts dari `https://jsonplaceholder.typicode.com/posts`. Tampilin loading state, data, dan error state.

3. **Theme Toggle:** Implementasi dark/light theme pake `useContext`. Buat `ThemeProvider` dan `useTheme` custom hook.

4. **Todo Reducer:** Buat todo app pake `useReducer`. Actions: ADD_TODO, TOGGLE_TODO, DELETE_TODO. State: array of `{ id, text, completed }`.

5. **Custom Hook:** Buat custom hook `useDocumentTitle` yang update `document.title` otomatis saat nilai berubah.

6. **Form State:** Buat form dengan 4+ field. Pake `useReducer` daripada 4 `useState` terpisah.

7. **Zustand Store:** Buat counter store pake Zustand. Implementasi increment, decrement, reset. Bandingkan jumlah baris kode dengan `useReducer` — mana yang lebih sedikit?

8. **Zustand Async:** Buat store produk pake Zustand yang fetch dari API. State: `products`, `loading`, `error`. Tampilkan di komponen.

9. **React Hook Form:** Buat form registrasi dengan React Hook Form + Zod validation. Field: nama, email, password, confirm password. Validasi: required, email format, password min 6, confirm password harus sama.

10. **Form + Zustand:** Integrasi React Hook Form dengan Zustand store. Simpan data form ke Zustand, tampilkan di halaman lain (simulasi multi-step form).

---

> **Selanjutnya:** [03 — Next.js & Perbandingan Framework](03-nextjs-frameworks.md)
