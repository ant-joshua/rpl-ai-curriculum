# 01 — React Basics: Komponen, Props, State & JSX

**Durasi:** 2 jam pertemuan + 1 jam latihan

---

## Apa Itu React?

React adalah **library JavaScript untuk membangun antarmuka pengguna (UI)**. Dibuat oleh Facebook (Meta) tahun 2013. React bukan framework penuh — dia library yang fokus ke *view layer* aja. Tapi karena ekosistemnya gede, React sering disebut framework.

Dua konsep fundamental React:

### 1. Declarative

Declarative artinya **kamu bilang "apa" yang mau tampil, bukan "bagaimana" cara nge-render-nya**.

- **Imperatif (vanilla JS):** `document.getElementById('root').innerHTML = '<h1>Halo</h1>'` — kamu ngasih instruksi langkah demi langkah.
- **Deklaratif (React):** `<h1>Halo</h1>` — kamu cuma bilang hasil akhirnya, React yang urus DOM.

```jsx
// Declarative — React
function Salam({ nama }) {
  return <h1>Halo, {nama}!</h1>;
}
```

### 2. Component-Based

UI dipecah menjadi **komponen** kecil yang independen dan reusable. Setiap komponen punya tanggung jawab sendiri.

```
[App]
 ├── [Header] — logo, navigasi
 ├── [Sidebar] — daftar link
 ├── [MainContent]
 │    ├── [Card]
 │    ├── [Card]
 │    └── [Card]
 └── [Footer] — copyright, link
```

Komponen bisa berupa **fungsi** atau **class** (tapi React modern pake fungsi).

---

## JSX — JavaScript XML

JSX adalah **extension sintaks JavaScript** yang mirip HTML. JSX bukan HTML — dia *syntactic sugar* buat `React.createElement()`.

```jsx
// JSX — kelihatan seperti HTML
const element = <h1 className="judul">Hello World</h1>;

// Tanpa JSX — pake createElement
const element = React.createElement('h1', { className: 'judul' }, 'Hello World');
```

### Aturan JSX:

1. **Satu parent element** — semua JSX harus dibungkus satu elemen. Pake `<div>` atau `<></>` (Fragment).
2. **`className` bukan `class`** — karena `class` kata kunci JavaScript.
3. **Ekspresi JavaScript di `{}`** — koma masukin variable atau ekspresi.
4. **Tag harus ditutup** — `<br />`, `<img />` harus self-closing.

```jsx
function Card({ title, image }) {
  return (
    <div className="card">
      <img src={image} alt={title} />
      <h2>{title.toUpperCase()}</h2>
    </div>
  );
}
```

---

## Function Component vs Class Component

### Function Component (modern, React 16.8+)

```jsx
function Counter() {
  const [count, setCount] = React.useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

- Pake **hooks** (`useState`, `useEffect`)
- Lebih sederhana, gak perlu `this`
- Recommended buat semua kasus

### Class Component (legacy)

```jsx
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  render() {
    return <button onClick={() => this.setState({ count: this.state.count + 1 })}>
      {this.state.count}
    </button>;
  }
}
```

**React modern pake function component.** Class component masih dipelihara tapi gak dianjurkan buat kode baru.

---

## Props — Data dari Parent ke Child

Props itu **input** (baca aja) dari parent ke child. Child **gak boleh** ngubah props langsung.

```jsx
// Parent
function App() {
  return <Card title="Judul" image="https://..." />;
}

// Child — props sebagai parameter fungsi
function Card({ title, image }) {
  return (
    <div>
      <img src={image} />
      <h2>{title}</h2>
    </div>
  );
}
```

### Props Drilling

Props drilling terjadi saat data harus di-pass lewat **banyak lapisan komponen** yang gak butuh data itu.

```
[App] ← state ada di sini
  └── [Layout]
        └── [Sidebar]
              └── [UserMenu] ← butuh user data
                    └── [Avatar] ← butuh avatar URL
```

Di sini `Layout` dan `Sidebar` gak butuh data user, tapi harus nerima dan nge-pass props — namanya *props drilling*. Nanti di sesi 02 kita liat solusinya (Context API).

---

## State dengan useState

State adalah **data yang berubah** selama aplikasi jalan. Kalau state berubah, React render ulang komponen.

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  // count     → nilai state sekarang
  // setCount  → fungsi buat ngubah state

  return (
    <div>
      <p>Kamu klik {count} kali</p>
      <button onClick={() => setCount(count + 1)}>Tambah</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### Aturan useState:

1. **Jangan panggil hooks di dalam kondisi** — hooks harus dipanggil di urutan yang sama setiap render.
2. **Jangan ngubah state langsung** — `count = 5` gak trigger re-render. Pake `setCount(5)`.
3. **State update asynchronous** — kalau butuh nilai sebelumnya, pake callback: `setCount(prev => prev + 1)`.

---

## Event Handling

Di React, event handler ditulis di JSX pake **camelCase** (`onClick`, `onChange`, `onSubmit`), bukan lowercase (`onclick`).

```jsx
function Form() {
  const [name, setName] = useState('');

  function handleSubmit(e) {
    e.preventDefault(); // cegah reload halaman
    alert('Submit: ' + name);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Kirim</button>
    </form>
  );
}
```

Event React punya `SyntheticEvent` — wrapper dari event asli browser, biar konsisten di semua browser.

---

## Conditional Rendering

Di React, kondisi di-render pake JavaScript biasa di dalam JSX.

```jsx
function Greeting({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <h1>Selamat datang kembali!</h1>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

Pola umum:

| Pola | Cara |
|------|------|
| `if/else` | Ternary `condition ? A : B` |
| `if` saja | `{condition && <Component />}` |
| Switch/Map | Function biasa, return komponen |

---

## Lists & Keys

Rendering daftar pake `map()`. Setiap item butuh **key** unik — React pake key buat nge-track perubahan.

```jsx
function TodoList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}
```

**Kenapa butuh key?** React pake key buat tahu item mana yang berubah, ditambah, atau dihapus — efisien.

Aturan key:
- Pake ID unik (dari database atau `crypto.randomUUID()`)
- Jangan pake index array — kecuali daftar statis dan gak pernah berubah urutan
- Key harus stabil antar render

---

## React DevTools

React DevTools adalah **extension browser** (Chrome/Firefox) buat debugging React.

Fitur utama:
1. **Components tab** — liat pohon komponen, props, state setiap komponen
2. **Profiler tab** — ukur performa render, cari komponen yang render ulang gak perlu
3. **Source code** — klik komponen → liat kode sumbernya
4. **Edit state langsung** — ubah state di DevTools buat testing

Cara install: [React DevTools Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

---

## Latihan

1. **Counter Sederhana:** Buat komponen Counter dengan tombol +1, -1, dan Reset. Tampilkan jumlah klik total.
2. **Daftar Tugas:** Buat komponen TodoList yang nerima array items sebagai props. Render setiap item ke `<li>`. Tambahin form input buat nambah item (pake state lokal di parent).
3. **Kartu Profil:** Buat komponen `ProfileCard` props `{name, age, avatar}`. Render dengan conditional — kalau avatar kosong, tampilkan inisial nama.
4. **Conditional Login:** Buat komponen yang nampilin tombol Login kalau user belum login, dan profil user kalau udah login.
5. **Debugging:** Install React DevTools, buka tab Components, dan liat pohon komponen + state dari latihan-latihan di atas.

---

> **Selanjutnya:** [02 — React Hooks (useEffect, useRef, useContext, useReducer)](02-react-hooks.md)
