# Ele: React Dasar

> **Level:** Intermediate  
> **Jam:** 6  
> **Prasyarat:** JavaScript Fundamentals, Web Basics

## 📋 Ringkasan Materi

React adalah library JavaScript untuk membangun antarmuka pengguna (UI). Dikembangkan oleh Meta (Facebook), React memungkinkan kita membuat UI yang interaktif dan reusable dengan pendekatan deklaratif — Anda mendeskripsikan *apa* yang ingin ditampilkan, bukan *bagaimana* cara menampilkannya.

### Daftar Isi

- [1. React Fundamentals](#1-react-fundamentals)
- [2. JSX — JavaScript XML](#2-jsx--javascript-xml)
- [3. Komponen](#3-komponen)
- [4. Props](#4-props)
- [5. State dan useState](#5-state-dan-usestate)
- [6. useEffect dan Side Effects](#6-useeffect-dan-side-effects)
- [7. useContext](#7-usecontext)
- [8. Conditional Rendering dan Lists](#8-conditional-rendering-dan-lists)
- [9. Forms dan Controlled Components](#9-forms-dan-controlled-components)
- [10. Custom Hooks](#10-custom-hooks)
- [11. React DevTools](#11-react-devtools)
- [12. Proyek: Counter → Todo → Weather App](#12-proyek-counter--todo--weather-app)

---

## 1. React Fundamentals

React mengusung tiga konsep fundamental yang menjadi fondasi setiap aplikasi React:

### 1.1 Deklaratif

React memungkinkan Anda mendeskripsikan UI untuk setiap state aplikasi. React akan mengupdate dan me-render komponen yang tepat ketika data berubah.

```tsx
// Deklaratif — kita bilang APA yang mau ditampilkan
function Greeting({ name }: { name: string }) {
  return <h1>Halo, {name}!</h1>;
}
```

### 1.2 Component-Based

Setiap bagian UI adalah komponen independen dan reusable. Komponen besar dibangun dari komponen-komponen kecil.

```tsx
function App() {
  return (
    <div>
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}
```

### 1.3 Learn Once, Write Anywhere

React bisa digunakan di web (React DOM), mobile (React Native), dan bahkan desktop (Electron). Konsepnya sama — hanya *renderer*-nya yang berbeda.

### 🧪 Latihan 1.1 — React Fundamentals

1. **Jelaskan** dalam satu paragraf perbedaan antara pendekatan deklaratif dan imperatif dalam membangun UI.
2. **Refactor** kode HTML berikut menjadi struktur komponen React:

   ```html
   <div class="app">
     <header><h1>My App</h1></header>
     <main><p>Welcome</p></main>
     <footer><p>&copy; 2026</p></footer>
   </div>
   ```

---

## 2. JSX — JavaScript XML

JSX adalah extension syntax JavaScript yang mirip HTML. JSX bukan template string atau HTML biasa — JSX adalah *syntactic sugar* untuk `React.createElement()`.

### 2.1 Aturan JSX

1. **Satu root element** — JSX harus punya satu parent element. Gunakan `<></>` (Fragment) jika tidak ingin DOM tambahan.
2. **Tutup semua tag** — `<br />`, `<img />`, `<input />`.
3. **className, bukan class** — karena `class` adalah reserved word di JavaScript.
4. **CamelCase untuk atribut** — `onClick`, `tabIndex`, `backgroundColor`.
5. **Ekspresi JavaScript di dalam `{}`**.

```tsx
// Ekspresi dalam JSX
const user = { name: 'Budi', age: 20 };

function Profile() {
  return (
    <>
      <h1 className="title">{user.name}</h1>
      <p>{user.age >= 18 ? 'Dewasa' : 'Anak-anak'}</p>
      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} />
    </>
  );
}
```

### 2.2 JSX vs createElement

```tsx
// JSX — lebih mudah dibaca
const element = <h1 className="greeting">Hello!</h1>;

// Setara dengan:
const element = React.createElement(
  'h1',
  { className: 'greeting' },
  'Hello!'
);
```

### 2.3 Kapan Pakai Kurung?

Multiline JSX perlu dibungkus kurung `()` agar parser tidak bingung dengan *automatic semicolon insertion*.

```tsx
// ✅ Benar
function List() {
  return (
    <ul>
      <li>Satu</li>
      <li>Dua</li>
    </ul>
  );
}

// ❌ Salah — return diikuti newline tanpa kurung bikin undefined
function ListBroken() {
  return
    <ul>
      <li>Satu</li>
    </ul>;
}
```

### 🧪 Latihan 2.1 — JSX

1. **Perbaiki** kode JSX berikut:

   ```tsx
   function Card() {
     return (
       <div class="card">
         <img src="https://picsum.photos/200">
         <h2>Judul</h2>
         <p>Deskripsi</p>
       </div>
     )
   }
   ```

2. **Buat komponen** `Bio` yang menerima `name` dan `bio`, lalu render keduanya dengan JSX yang benar (termasuk alt text untuk avatar).

---

## 3. Komponen

Komponen React adalah fungsi JavaScript (atau class) yang mengembalikan JSX.

### 3.1 Functional Component (Modern)

```tsx
// Komponen sederhana — fungsi yang return JSX
function Welcome() {
  return <h2>Selamat Datang di React!</h2>;
}

// Arrow function juga valid
const WelcomeArrow = () => {
  return <h2>Selamat Datang!</h2>;
};

// Implicit return untuk komponen satu-liner
const WelcomeShort = () => <h2>Selamat Datang!</h2>;
```

### 3.2 Component Composition (Komposisi)

Komponen bisa memuat komponen lain. Ini adalah inti dari arsitektur React.

```tsx
function Avatar({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="avatar" />;
}

function UserInfo({ name, avatar }: { name: string; avatar: string }) {
  return (
    <div className="user-info">
      <Avatar src={avatar} alt={name} />
      <span>{name}</span>
    </div>
  );
}

function Comment({ author, text }: { author: { name: string; avatar: string }; text: string }) {
  return (
    <div className="comment">
      <UserInfo name={author.name} avatar={author.avatar} />
      <p>{text}</p>
    </div>
  );
}
```

### 3.3 Komponen sebagai Anak (Children)

```tsx
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  );
}

// Penggunaan:
<Card title="Profil">
  <p>Halo, saya Budi.</p>
</Card>
```

### 🧪 Latihan 3.1 — Komponen

1. **Buat komponen** `Button` dengan props `label` dan `variant` ('primary' | 'secondary'). Render dengan style berbeda.
2. **Buat komponen** `List` yang menerima `items: string[]` dan `renderItem` sebagai children function. Petunjuk: gunakan `children` sebagai render prop.

---

## 4. Props

Props (properties) adalah argumen yang dikirim ke komponen. Props bersifat *read-only* — komponen tidak boleh mengubah props-nya sendiri.

### 4.1 TypeScript Props

```tsx
// Interface untuk props
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary'; // opsional
  disabled?: boolean;
  onClick: () => void;
}

function Button({ label, variant = 'primary', disabled = false, onClick }: ButtonProps) {
  const className = `btn btn-${variant} ${disabled ? 'btn-disabled' : ''}`;

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### 4.2 Destructuring Props

```tsx
// Tanpa destructuring
function Profile(props: { name: string; age: number }) {
  return <p>{props.name} berusia {props.age} tahun</p>;
}

// Dengan destructuring (lebih bersih)
function Profile({ name, age }: { name: string; age: number }) {
  return <p>{name} berusia {age} tahun</p>;
}

// Destructuring + default value
function Card({ title = 'Untitled', children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
```

### 4.3 Spread Props

```tsx
interface InputProps {
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
}

function FormInput({ label, error, ...rest }: InputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label>{label}</label>
      <input {...rest} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

### 🧪 Latihan 4.1 — Props

1. **Buat komponen** `ProductCard` dengan props: `name`, `price`, `imageUrl`, `inStock: boolean`.
2. **Buat komponen** `Table` yang generic dengan props: `data: T[]`, `columns: { key: keyof T; label: string }[]`.

---

## 5. State dan useState

State adalah data yang berubah seiring waktu. Ketika state berubah, React akan *re-render* komponen.

### 5.1 useState Dasar

```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### 5.2 Mengupdate State dengan Fungsi Sebelumnya

```tsx
function CounterSafe() {
  const [count, setCount] = useState(0);

  // ❌ Masalah — kalau dipanggil 2 kali, hanya +1
  function handleClickWrong() {
    setCount(count + 1); // count masih old value
    setCount(count + 1); // count masih old value yang sama
  }

  // ✅ Benar — pakai updater function
  function handleClickCorrect() {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1); // prev sudah diupdate
  }

  return <button onClick={handleClickCorrect}>{count}</button>;
}
```

### 5.3 State dengan Object dan Array

```tsx
function UserForm() {
  const [user, setUser] = useState({ name: '', email: '', age: 0 });

  function updateField<K extends keyof typeof user>(key: K, value: (typeof user)[K]) {
    setUser((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <input
        value={user.name}
        onChange={(e) => updateField('name', e.target.value)}
        placeholder="Nama"
      />
      <input
        value={user.email}
        onChange={(e) => updateField('email', e.target.value)}
        placeholder="Email"
      />
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
```

### 5.4 State Array — Tambah, Hapus, Update

```tsx
function TodoList() {
  const [todos, setTodos] = useState<string[]>([]);
  const [input, setInput] = useState('');

  function addTodo() {
    if (input.trim() === '') return;
    setTodos((prev) => [...prev, input.trim()]);
    setInput('');
  }

  function removeTodo(index: number) {
    setTodos((prev) => prev.filter((_, i) => i !== index));
  }

  function updateTodo(index: number, newText: string) {
    setTodos((prev) => prev.map((item, i) => (i === index ? newText : item)));
  }

  return (
    <div>
      <div>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button onClick={addTodo}>Tambah</button>
      </div>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            {todo}
            <button onClick={() => removeTodo(index)}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5.5 Aturan useState

1. **Jangan panggil useState dalam loop, if, atau nested function** — hooks harus dipanggil di urutan yang sama setiap render.
2. **State update bersifat async** — jangan langsung baca state setelah setState.
3. **Gunakan spread operator** untuk update object/array (immutability).

### 🧪 Latihan 5.1 — useState

1. **Counter dengan step** — Buat counter yang bisa di-increment/decrement dengan step yang bisa diubah user (1, 5, 10).
2. **Color picker** — Buat komponen yang menyimpan warna favorit user dalam state object `{ hex: string, name: string }`.
3. **Shopping cart** — Buat keranjang belanja dengan state array of objects `{ id, name, qty }`. Bisa tambah, kurang qty, dan hapus item.

---

## 6. useEffect dan Side Effects

`useEffect` digunakan untuk melakukan *side effects*: fetch data, manipulasi DOM, subscription, timer.

### 6.1 useEffect Tanpa Dependencies

```tsx
import { useEffect, useState } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Cleanup — dijalankan saat komponen unmount
    return () => clearInterval(interval);
  }, []); // empty array = jalan sekali saat mount

  return <p>Timer: {seconds}s</p>;
}
```

### 6.2 useEffect dengan Dependencies

```tsx
function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // AbortController untuk cancel fetch jika query berubah
    const controller = new AbortController();

    async function fetchResults() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`https://api.example.com/search?q=${query}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResults(data.results);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchResults();

    // Cancel fetch jika query berubah sebelum selesai
    return () => controller.abort();
  }, [query]); // re-run saat query berubah

  if (loading) return <p>Memuat...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {results.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}
```

### 6.3 Lifecycle Mapping

| Lifecycle (Class) | useEffect |
|---|---|
| `componentDidMount` | `useEffect(() => { ... }, [])` |
| `componentDidUpdate` | `useEffect(() => { ... }, [dep])` |
| `componentWillUnmount` | `useEffect(() => { return () => { ... } }, [])` |

### 6.4 Multiple useEffect

Pisahkan concerns ke useEffect berbeda — jangan satukan semuanya dalam satu useEffect.

```tsx
function Dashboard({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  // Effect 1: Fetch user
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then(setUser);
  }, [userId]);

  // Effect 2: Fetch posts — concern terpisah
  useEffect(() => {
    fetch(`/api/users/${userId}/posts`)
      .then((res) => res.json())
      .then(setPosts);
  }, [userId]);

  return <div>...</div>;
}
```

### 🧪 Latihan 6.1 — useEffect

1. **Clock digital** — Buat komponen clock yang update tiap detik. Tampilkan dalam format `HH:MM:SS`.
2. **Auto-saving** — Buat form yang auto-save ke localStorage setiap 3 detik menggunakan useEffect + setInterval.
3. **Window resize listener** — Buat komponen yang menampilkan ukuran window saat ini dan update ketika user resize.
4. **Fetch data dengan error handling** — Fetch data dari API publik (https://jsonplaceholder.typicode.com/posts). Tampilkan loading, error, dan data.

---

## 7. useContext

`useContext` memberikan akses ke global state tanpa harus *prop drilling* (passing props melalui banyak level komponen).

### 7.1 Membuat Context

```tsx
import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Define tipe
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 2. Buat context dengan default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 3. Provider component
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 7.2 Custom Hook untuk Context

```tsx
// Custom hook — aman dengan type checking
function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

### 7.3 Menggunakan Context

```tsx
// components/Header.tsx
function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`header-${theme}`}>
      <h1>Aplikasi Saya</h1>
      <button onClick={toggleTheme}>
        Ganti ke {theme === 'light' ? 'dark' : 'light'}
      </button>
    </header>
  );
}

// components/Profile.tsx — deep di dalam tree, tanpa props
function Profile() {
  const { theme } = useTheme();

  return (
    <div className={`card-${theme}`}>
      <p>Tema saat ini: {theme}</p>
    </div>
  );
}

// App.tsx
function App() {
  return (
    <ThemeProvider>
      <Header />
      <main>
        <Profile />
      </main>
    </ThemeProvider>
  );
}
```

### 7.4 Multi Context

```tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

function MainApp() {
  const { user } = useAuth();
  const { theme } = useTheme();

  return <div>{user.name} — {theme}</div>;
}
```

### 🧪 Latihan 7.1 — useContext

1. **Auth Context** — Buat AuthContext dengan state `user: { username: string, role: string } | null`, fungsi `login` dan `logout`. Gunakan di komponen Navbar dan Profile.
2. **Cart Context** — Buat CartContext untuk shopping cart global. Operasi: addItem, removeItem, clearCart, totalItems. Akses dari Header (badge) dan CartPage.

---

## 8. Conditional Rendering dan Lists

### 8.1 Conditional Rendering

Beberapa cara menampilkan komponen secara kondisional:

```tsx
interface StatusProps {
  isLoggedIn: boolean;
  role: 'admin' | 'user' | 'guest';
  notifications: number;
}

function UserStatus({ isLoggedIn, role, notifications }: StatusProps) {
  return (
    <div>
      {/* 1. Ternary — untuk if/else */}
      {isLoggedIn ? (
        <span>Selamat datang kembali!</span>
      ) : (
        <button>Login</button>
      )}

      {/* 2. Logical AND — untuk if tanpa else */}
      {role === 'admin' && <AdminPanel />}

      {/* 3. Logical OR — default value */}
      {notifications || 'Tidak ada notifikasi'}

      {/* 4. If-else dengan early return */}
      {isLoggedIn ? <Dashboard /> : <LoginPage />}
    </div>
  );
}
```

### 8.2 Rendering List dengan .map()

```tsx
interface Item {
  id: number;
  name: string;
  price: number;
}

function ProductList({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.name} — Rp {item.price.toLocaleString('id-ID')}
        </li>
      ))}
    </ul>
  );
}
```

### 8.3 Key Prop — Kenapa Penting?

`key` membantu React mengidentifikasi elemen mana yang berubah, ditambah, atau dihapus. Gunakan key yang stabil dan unik — jangan pakai index array jika urutan bisa berubah.

```tsx
// ✅ Key dari ID (stabil)
todos.map((todo) => <TodoItem key={todo.id} todo={todo} />);

// ⚠️ Key dari index (hanya aman untuk static list)
items.map((item, i) => <li key={i}>{item}</li>);

// ❌ Key dari Math.random() — re-render tiap kali!
items.map((item) => <li key={Math.random()}>{item}</li>);
```

### 8.4 Filter dan Sort List

```tsx
function SearchableList({ items }: { items: Item[] }) {
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = items
    .filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortAsc ? a.price - b.price : b.price - a.price
    );

  return (
    <div>
      <input
        placeholder="Cari..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={() => setSortAsc(!sortAsc)}>
        {sortAsc ? 'Harga ↑' : 'Harga ↓'}
      </button>
      <ul>
        {filtered.map((item) => (
          <li key={item.id}>{item.name} — Rp{item.price}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 🧪 Latihan 8.1 — Conditional & Lists

1. **Status badge** — Buat komponen `StatusBadge` yang menampilkan badge hijau/kuning/merah berdasarkan nilai `status: 'active' | 'pending' | 'inactive'`.
2. **Product table** — Buat tabel produk yang bisa di-sort berdasarkan nama atau harga. Tambahkan search filter.
3. **Pagination** — Buat komponen pagination yang menampilkan 10 item per halaman dari array besar.

---

## 9. Forms dan Controlled Components

Di React, form input dikelola oleh state komponen (*controlled component*), bukan oleh DOM.

### 9.1 Controlled Input

```tsx
function SimpleForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // cegah reload
    console.log({ name, email });
    alert(`Nama: ${name}, Email: ${email}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nama:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="submit" disabled={!name || !email}>
        Submit
      </button>
    </form>
  );
}
```

### 9.2 Multi Input dengan Satu State

```tsx
interface FormData {
  name: string;
  email: string;
  age: number;
  role: string;
  agreeTerms: boolean;
}

function RegistrationForm() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    age: 0,
    role: 'user',
    agreeTerms: false,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? Number(value)
          : value,
    }));
  }

  return (
    <form>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Nama" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <input name="age" type="number" value={form.age} onChange={handleChange} />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <label>
        <input name="agreeTerms" type="checkbox" checked={form.agreeTerms} onChange={handleChange} />
        Setuju syarat & ketentuan
      </label>
    </form>
  );
}
```

### 9.3 Form Validation

```tsx
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

function ValidatedForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Nama wajib diisi';
    if (!form.email.includes('@')) errs.email = 'Email tidak valid';
    if (form.password.length < 6) errs.password = 'Password minimal 6 karakter';
    return errs;
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    setTouched((prev) => new Set(prev).add(e.target.name));
    setErrors(validate());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      alert('Form valid! Data: ' + JSON.stringify(form));
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {(['name', 'email', 'password'] as const).map((field) => (
        <div key={field}>
          <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
          <input
            name={field}
            type={field === 'password' ? 'password' : 'text'}
            value={form[field]}
            onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
            onBlur={handleBlur}
            className={touched.has(field) && errors[field] ? 'error' : ''}
          />
          {touched.has(field) && errors[field] && (
            <span className="error-msg">{errors[field]}</span>
          )}
        </div>
      ))}
      <button type="submit">Daftar</button>
    </form>
  );
}
```

### 🧪 Latihan 9.1 — Forms

1. **Login form** — Buat form login dengan validasi: email valid, password minimal 8 karakter. Tampilkan pesan error spesifik.
2. **Survey form** — Buat form survey dengan berbagai jenis input: text, radio button, checkbox, select, textarea. Simpan semua data dalam satu state object.
3. **Dynamic field** — Buat form yang bisa menambah input field dinamis (misal: daftar anggota tim, setiap anggota punya nama dan role).

---

## 10. Custom Hooks

Custom hooks adalah fungsi JavaScript yang menggunakan hooks React. Mereka memungkinkan ekstraksi logic yang reusable antar komponen.

### 10.1 useLocalStorage

```tsx
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Baca dari localStorage saat init
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Simpan ke localStorage setiap nilai berubah
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
```

### 10.2 useDebounce

```tsx
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel timer jika value berubah sebelum delay
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Penggunaan:
function SearchPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch) {
      fetch(`/api/search?q=${debouncedSearch}`);
    }
  }, [debouncedSearch]);

  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
}
```

### 10.3 useFetch

```tsx
interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useFetch<T>(url: string | null): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();

    async function fetchData() {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = (await res.json()) as T;
        setState({ data, loading: false, error: null });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setState({ data: null, loading: false, error: err.message });
        }
      }
    }

    fetchData();

    return () => controller.abort();
  }, [url]);

  return state;
}

// Penggunaan:
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

function Posts() {
  const { data: posts, loading, error } = useFetch<Post[]>(
    'https://jsonplaceholder.typicode.com/posts'
  );

  if (loading) return <p>Memuat...</p>;
  if (error) return <p>Gagal memuat: {error}</p>;

  return (
    <ul>
      {posts?.map((post) => (
        <li key={post.id}>
          <h4>{post.title}</h4>
          <p>{post.body}</p>
        </li>
      ))}
    </ul>
  );
}
```

### 10.4 useMediaQuery

```tsx
import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Penggunaan:
function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TableView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

### 🧪 Latihan 10.1 — Custom Hooks

1. **useDocumentTitle** — Buat hook yang mengupdate `document.title` dan mengembalikan ke title awal saat unmount.
2. **useOnlineStatus** — Buat hook yang mendeteksi apakah user online/offline (menggunakan `navigator.onLine` dan event `online`/`offline`).
3. **useCounter** — Buat hook `useCounter` dengan fungsi increment, decrement, reset, setValue.
4. **useToggle** — Buat hook `useToggle` untuk boolean value yang sering toggle (dark mode, modal, dll).

---

## 11. React DevTools

React DevTools adalah browser extension yang sangat membantu debugging aplikasi React.

### 11.1 Instalasi

- **Chrome/Edge**: Install [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) dari Chrome Web Store.
- **Firefox**: Install dari [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/).
- **Standalone**: `npx react-devtools` untuk React Native atau environment non-browser.

### 11.2 Fitur Utama

1. **Components Tab** — Lihat hierarki komponen, props, state, hooks. Edit props secara real-time.
2. **Profiler Tab** — Rekam performa render. Lihat komponen mana yang re-render dan berapa lama.
3. **Source** — Klik komponen untuk langsung buka source code-nya di browser DevTools.
4. **Search** — Cari komponen berdasarkan nama.

### 11.3 Debugging dengan DevTools

```tsx
// Gunakan displayName untuk komponen yang dibungkus HOC
const EnhancedButton = withAuth(Button);
EnhancedButton.displayName = 'EnhancedButton(WithAuth)';

// DevTools akan menampilkan nama ini

// React.memo — DevTools tunjukkan "Memo(ComponentName)"
const MemoizedList = React.memo(ListComponent);

// Profiler API — measure performa
import { Profiler } from 'react';

function onRender(id: string, phase: string, actualDuration: number) {
  console.log(`${id} (${phase}): ${actualDuration}ms`);
}

<Profiler id="Sidebar" onRender={onRender}>
  <Sidebar />
</Profiler>
```

### 🧪 Latihan 11.1 — DevTools

1. **Profile aplikasi** — Buka React DevTools Profiler, lakukan interaksi, rekam flamegraph. Identifikasi komponen yang re-render tidak perlu.
2. **Debug state** — Gunakan Components tab untuk mengubah state komponen secara langsung. Amati perubahan UI real-time.

---

## 12. Proyek: Counter → Todo → Weather App

### 12.1 Proyek 1: Counter App

Buat counter dengan fitur:
- Increment, decrement, reset
- Step value (1, 5, 10) — bisa diubah user
- History log (array of { value, timestamp })
- Local storage persistence

```tsx
interface HistoryEntry {
  value: number;
  timestamp: Date;
}

function CounterApp() {
  const [count, setCount] = useLocalStorage('counter-value', 0);
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  function updateCount(delta: number) {
    setCount((prev) => {
      const newValue = prev + delta * step;
      setHistory((h) => [
        ...h.slice(-49), // simpan max 50 entries
        { value: newValue, timestamp: new Date() },
      ]);
      return newValue;
    });
  }

  return (
    <div>
      <h1>Counter: {count}</h1>
      <div>
        <button onClick={() => updateCount(-1)}>-{step}</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => updateCount(1)}>+{step}</button>
      </div>
      <div>
        <label>Step:</label>
        {[1, 5, 10].map((s) => (
          <button key={s} onClick={() => setStep(s)} disabled={step === s}>
            {s}
          </button>
        ))}
      </div>
      <details>
        <summary>History ({history.length})</summary>
        <ul>
          {history.map((entry, i) => (
            <li key={i}>
              Value: {entry.value} — {new Date(entry.timestamp).toLocaleTimeString('id-ID')}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
```

### 12.2 Proyek 2: Todo App

Buat todo app dengan fitur:
- Tambah, edit, hapus todo
- Mark as complete
- Filter: all, active, completed
- Search todos
- Local storage persistence
- Counter badge untuk jumlah item tersisa

```tsx
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

type Filter = 'all' | 'active' | 'completed';

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  function addTodo() {
    if (!input.trim()) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: input.trim(),
      completed: false,
      createdAt: new Date(),
    };
    setTodos((prev) => [...prev, newTodo]);
    setInput('');
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
  }

  function saveEdit(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: editText } : t))
    );
    setEditingId(null);
    setEditText('');
  }

  const filteredTodos = todos
    .filter((t) => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    })
    .filter((t) => t.text.toLowerCase().includes(search.toLowerCase()));

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="todo-app">
      <h1>Todo App</h1>
      <p>Sisa tugas: {activeCount}</p>

      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Tambah todo..."
        />
        <button onClick={addTodo}>Tambah</button>
      </div>

      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari..."
        />
      </div>

      <div>
        {(['all', 'active', 'completed'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} disabled={filter === f}>
            {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : 'Selesai'}
          </button>
        ))}
      </div>

      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            {editingId === todo.id ? (
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => saveEdit(todo.id)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                autoFocus
              />
            ) : (
              <span onDoubleClick={() => startEdit(todo)}>{todo.text}</span>
            )}
            <button onClick={() => deleteTodo(todo.id)}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 12.3 Proyek 3: Weather App

Buat weather app dengan fitur:
- Search city
- Fetch dari OpenWeatherMap API (atau mock)
- Tampilkan: suhu, cuaca, humidity, wind speed
- 5-day forecast
- Recent searches
- Loading & error states

```tsx
interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface ForecastDay {
  date: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
}

function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentCities, setRecentCities] = useState<string[]>([]);

  async function searchWeather(cityName: string) {
    if (!cityName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Ganti dengan API key sungguhan untuk production
      const API_KEY = 'YOUR_API_KEY';
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=id`
      );
      if (!weatherRes.ok) throw new Error('Kota tidak ditemukan');
      const weatherData = await weatherRes.json();

      setWeather({
        city: weatherData.name,
        temperature: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
      });

      // Set recent cities
      setRecentCities((prev) => {
        const updated = [cityName, ...prev.filter((c) => c !== cityName)];
        return updated.slice(0, 5);
      });

      // Fetch 5-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();

      // Group by date
      const dailyMap = new Map<string, ForecastDay>();
      forecastData.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            date,
            tempMin: item.main.temp_min,
            tempMax: item.main.temp_max,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
          });
        } else {
          const existing = dailyMap.get(date)!;
          existing.tempMin = Math.min(existing.tempMin, item.main.temp_min);
          existing.tempMax = Math.max(existing.tempMax, item.main.temp_max);
        }
      });

      setForecast(Array.from(dailyMap.values()).slice(0, 5));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="weather-app">
      <h1>Weather App</h1>

      <div>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchWeather(city)}
          placeholder="Cari kota..."
        />
        <button onClick={() => searchWeather(city)} disabled={loading}>
          {loading ? 'Memuat...' : 'Cari'}
        </button>
      </div>

      {recentCities.length > 0 && (
        <div>
          <span>Recent: </span>
          {recentCities.map((c) => (
            <button key={c} onClick={() => searchWeather(c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      {error && <p className="error">⚠️ {error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>{weather.city}</h2>
          <img src={weather.icon} alt={weather.description} />
          <p className="temp">{weather.temperature}°C</p>
          <p>{weather.description}</p>
          <p>💧 Kelembaban: {weather.humidity}%</p>
          <p>💨 Angin: {weather.windSpeed} m/s</p>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast">
          <h3>Prakiraan 5 Hari</h3>
          <div className="forecast-grid">
            {forecast.map((day) => (
              <div key={day.date} className="forecast-day">
                <p>{new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short' })}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                  alt={day.description}
                />
                <p>{day.tempMin}° / {day.tempMax}°</p>
                <p>{day.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 📚 Referensi

- [React Docs](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [JSONPlaceholder API](https://jsonplaceholder.typicode.com/) — API untuk testing
- [OpenWeatherMap API](https://openweathermap.org/api)

## 🧪 Latihan Akhir

1. **Refactor** aplikasi Counter menggunakan custom hook `useCounter`.
2. **Tambah fitur** drag-and-drop reorder di Todo App.
3. **Integrasi** OpenWeatherMap API dengan API key sungguhan di Weather App.
4. **Buat** aplikasi catatan (notes app) dengan fitur: CRUD, search, markdown preview, localStorage persistence.
