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

## Latihan

1. **Timer dengan Cleanup:** Buat komponen Timer pake `useEffect` + `useRef` buat interval. Tambah tombol Start/Stop. Pastikan interval berhenti pas komponen di-unmount.
2. **Fetch Data:** Buat komponen yang fetch daftar posts dari `https://jsonplaceholder.typicode.com/posts`. Tampilin loading state, data, dan error state.
3. **Theme Toggle:** Implementasi dark/light theme pake `useContext`. Buat `ThemeProvider` dan `useTheme` custom hook.
4. **Todo Reducer:** Buat todo app pake `useReducer`. Actions: ADD_TODO, TOGGLE_TODO, DELETE_TODO. State: array of `{ id, text, completed }`.
5. **Custom Hook:** Buat custom hook `useDocumentTitle` yang update `document.title` otomatis saat nilai berubah.
6. **Form State:** Buat form dengan 4+ field. Pake `useReducer` daripada 4 `useState` terpisah.

---

> **Selanjutnya:** [03 — Next.js & Perbandingan Framework](03-nextjs-frameworks.md)
