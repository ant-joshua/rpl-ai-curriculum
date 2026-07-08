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

## Compound Components Pattern

Compound components adalah pola di mana **beberapa komponen bekerja bersama sebagai satu unit**, mirip elemen HTML native (`<select>` + `<option>`).

```jsx
// Contoh: Tabs dengan compound components
import { useState, createContext, useContext } from 'react';

const TabsContext = createContext();

function Tabs({ children, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function Tab({ label, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      className={activeTab === label ? 'active' : ''}
      onClick={() => setActiveTab(label)}
    >
      {children}
    </button>
  );
}

function TabPanel({ label, children }) {
  const { activeTab } = useContext(TabsContext);
  return activeTab === label ? <div className="tab-panel">{children}</div> : null;
}

// Pemakaian:
<Tabs defaultTab="profile">
  <Tab label="profile">Profil</Tab>
  <Tab label="settings">Pengaturan</Tab>
  <TabPanel label="profile">Halaman profil...</TabPanel>
  <TabPanel label="settings">Halaman pengaturan...</TabPanel>
</Tabs>
```

**Keuntungan:** API deklaratif, fleksibel, user bisa ngatur layout.

Library populer pake pola ini: `react-bootstrap`, `chakra-ui`, `headless-ui`.

### Contoh Lain: Accordion

```jsx
function Accordion({ children }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <AccordionContext.Provider value={{ openIndex, setOpenIndex }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ index, title, children }) {
  const { openIndex, setOpenIndex } = useContext(AccordionContext);
  const isOpen = openIndex === index;
  return (
    <div className="accordion-item">
      <button onClick={() => setOpenIndex(isOpen ? null : index)}>
        {title}
      </button>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
}

// Pemakaian:
<Accordion>
  <AccordionItem index={0} title="Fitur 1">Penjelasan fitur 1...</AccordionItem>
  <AccordionItem index={1} title="Fitur 2">Penjelasan fitur 2...</AccordionItem>
</Accordion>
```

---

## Render Props Pattern

Render props adalah pola di mana sebuah komponen **nerima fungsi sebagai prop** untuk nge-determin apa yang harus di-render.

```jsx
// Komponen yang ngasih data, child yang nentuin tampilan
function DataFetcher({ url, render }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [url]);

  if (loading) return <p>Loading...</p>;
  return render(data);
}

// Pemakaian — user kontrol tampilan
<DataFetcher
  url="https://api.example.com/users"
  render={(data) => (
    <ul>
      {data.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )}
/>

// Bisa juga pake children sebagai fungsi
function MouseTracker({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  return (
    <div onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}>
      {children(position)}
    </div>
  );
}

<MouseTracker>
  {({ x, y }) => <h1>Mouse: {x}, {y}</h1>}
</MouseTracker>
```

**Kapan pake render props vs compound components?**
- Render props: ketika **1 child** perlu data dari parent.
- Compound components: ketika **banyak child** perlu state bersama.

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

6. **Compound Components:** Buat komponen `Dropdown` dengan pola compound components — `Dropdown.Trigger`, `Dropdown.Menu`, `Dropdown.Item`. Implementasi pakai Context.

7. **Render Props:** Buat komponen `Toggle` yang nerima fungsi render prop. Fungsi ini nerima `{ on, toggle }`. Bikin contoh penggunaan: toggle dark mode switch.

---

| **Selanjutnya:** [02 — React Hooks (useEffect, useRef, useContext, useReducer)](02-react-hooks.md)

---

## Virtual DOM & Reconciliation

React pake **Virtual DOM** — representasi ringan dari DOM asli di memori. Setiap state berubah:

1. React render ulang Virtual DOM tree
2. **Diffing** — bandingkan Virtual DOM lama vs baru (reconciliation)
3. Hitung **operasi minimal** yang perlu dilakukan ke DOM asli
4. Apply batch update ke real DOM

Tanpa Virtual DOM, update langsung ke DOM tiap state change boros — DOM API (`.appendChild`, `.innerHTML`) lambat.

```jsx
function ExpensiveList({ items }) {
  // React cuma update <li> yang berubah, bukan seluruh <ul>
  return (
    <ul>
      {items.map(item => <li key={item.id}>{item.text}</li>)}
    </ul>
  );
}
```

**Kenapa `key` penting di reconciliation?** React pake key buat tahu item mana yang berubah, ditambah, atau dihapus — tanpa key, React render ulang semua item. Makanya index array sebagai key itu bahaya: pas item dihapus dari tengah, index semua item berubah → React kira semua item baru → render ulang semua.

**Fiber Architecture** (React 16+): mesin reconciliation baru yang nge-prioritasin update penting (input user) daripada update yang bisa ditunda (animasi). Render bisa di-interupsi, di-resume, atau di-skip — namanya **concurrent mode**.
