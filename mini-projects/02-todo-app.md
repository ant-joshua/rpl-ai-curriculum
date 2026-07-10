# ✅ 02. Todo List App

> **Level:** 🌱 Beginner | **Estimasi:** 2 sesi | **Modul Terkait:** 01-JS Dasar, 05-React

---

## 🎯 Tujuan

Membangun aplikasi Todo List yang interaktif dengan dua versi: **Vanilla JavaScript** dan **React**. Projek ini fokus pada:

- **CRUD Operations**: Create, Read, Update, Delete — operasi paling fundamental di aplikasi apapun
- **Data Persistence**: Menyimpan dan membaca data dari `localStorage` (survive browser restart)
- **State Management**: Mengelola array of objects, update UI saat state berubah
- **Filter, Sort & Search**: Memanipulasi tampilan data tanpa mengubah data asli
- **Component Thinking**: Memisahkan UI menjadi komponen-komponen kecil (modal, form, list)
- **React Fundamentals** (versi React): props, state, hooks (useState, useEffect), controlled components

Todo List adalah "Hello World"-nya CRUD apps. Setelah ini, kamu bisa apply pattern yang sama ke aplikasi yang lebih kompleks.

---

## 🛠 Tech Stack

### Versi Vanilla JS

| Teknologi | Keterangan |
|-----------|------------|
| HTML5 + CSS3 (Flexbox/Grid) | Struktur dan styling |
| Vanilla JavaScript (ES6+) | DOM manipulation, event listeners |
| localStorage | Penyimpanan data di browser |
| Web Storage API (`setItem`, `getItem`) | Read/write JSON ke storage |

### Versi React

| Teknologi | Keterangan |
|-----------|------------|
| Vite + React | Build tool dan framework |
| TypeScript (opsional) | Type safety |
| CSS Modules / Tailwind | Styling |
| localStorage | Sama, persist data |
| React Hooks (`useState`, `useEffect`, `useCallback`) | State dan side effects |

---

## 📋 Requirements

### Fungsional

| # | Fitur | Vanilla | React |
|---|-------|---------|-------|
| 1 | Tambah todo baru (input + tombol submit) | ✅ | ✅ |
| 2 | Tandai todo selesai / belum (toggle checkbox) | ✅ | ✅ |
| 3 | Edit todo yang sudah ada (inline edit atau modal) | ✅ | ✅ |
| 4 | Hapus todo (dengan konfirmasi) | ✅ | ✅ |
| 5 | Tampilkan daftar todo (list atau cards) | ✅ | ✅ |
| 6 | Filter: All / Active / Completed | ✅ | ✅ |
| 7 | Sort: berdasarkan tanggal, alfabet, status | ✅ | ✅ |
| 8 | Search / cari todo berdasarkan teks | ✅ | ✅ |
| 9 | Simpan ke localStorage, restore saat load | ✅ | ✅ |
| 10 | Tampilkan jumlah todo (total, sisa, selesai) | ✅ | ✅ |
| 11 | Hapus semua yang sudah completed (clear completed) | ✅ | ✅ |
| 12 | Tema gelap/terang (dark mode) | Bonus | Bonus |
| 13 | Drag and drop reorder | Bonus | Bonus |
| 14 | Due date + overdue indicator | Bonus | Bonus |
| 15 | Animasi transisi (add/remove) | Bonus | Bonus |

### Non-Fungsional

- **Zero bug**: Jangan sampai todo ilang, data corrupt, atau duplicate key
- **Responsive**: Berfungsi baik di mobile dan desktop
- **Fast**: Render ulang hanya elemen yang berubah (di React pakai key)
- **User-friendly**: Konfirmasi sebelum hapus, feedback visual (toast/alert)
- **Accessible**: Label untuk input, focus management, ARIA

---

## 🚀 Starter Code

### Vanilla JS Version

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Todo App</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, sans-serif;
      background: #f1f5f9;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .container { max-width: 600px; width: 100%; }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; color: #1e293b; }

    .todo-form {
      display: flex; gap: 0.5rem; margin-bottom: 1.5rem;
    }
    .todo-form input {
      flex: 1; padding: 0.75rem 1rem; border: 2px solid #cbd5e1;
      border-radius: 0.75rem; font-size: 1rem; outline: none;
    }
    .todo-form input:focus { border-color: #3b82f6; }
    .todo-form button {
      padding: 0.75rem 1.5rem; background: #3b82f6; color: #fff;
      border: none; border-radius: 0.75rem; font-size: 1rem;
      cursor: pointer; font-weight: 600;
    }
    .todo-form button:hover { background: #2563eb; }

    .controls {
      display: flex; gap: 0.5rem; flex-wrap: wrap;
      margin-bottom: 1rem; align-items: center;
    }
    .controls button, .controls select {
      padding: 0.4rem 0.8rem; border: 1px solid #cbd5e1;
      border-radius: 0.5rem; background: #fff; cursor: pointer;
      font-size: 0.875rem;
    }
    .controls button.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
    .controls input[type="search"] {
      flex: 1; min-width: 140px; padding: 0.4rem 0.8rem;
      border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem;
    }

    .todo-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
    .todo-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem; background: #fff; border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.2s;
    }
    .todo-item.completed { opacity: 0.6; }
    .todo-item.completed .todo-text { text-decoration: line-through; color: #94a3b8; }
    .todo-text { flex: 1; font-size: 1rem; }
    .todo-actions { display: flex; gap: 0.3rem; }
    .todo-actions button {
      padding: 0.3rem 0.6rem; border: none; border-radius: 0.4rem;
      cursor: pointer; font-size: 0.8rem; background: transparent;
    }
    .todo-actions .edit-btn { color: #3b82f6; }
    .todo-actions .delete-btn { color: #ef4444; }
    .todo-actions .edit-btn:hover { background: #dbeafe; }
    .todo-actions .delete-btn:hover { background: #fee2e2; }
    .todo-checkbox { width: 1.2rem; height: 1.2rem; cursor: pointer; }

    .stats {
      margin-top: 1rem; text-align: center; color: #64748b;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>✅ Todo App</h1>

    <!-- FORM -->
    <form class="todo-form" id="todoForm">
      <input type="text" id="todoInput" placeholder="Tambahkan todo baru..." required />
      <button type="submit">Tambah</button>
    </form>

    <!-- CONTROLS -->
    <div class="controls">
      <button class="active" data-filter="all">All</button>
      <button data-filter="active">Active</button>
      <button data-filter="completed">Completed</button>
      <select id="sortSelect">
        <option value="newest">Terbaru</option>
        <option value="oldest">Terlama</option>
        <option value="az">A-Z</option>
        <option value="za">Z-A</option>
      </select>
      <input type="search" id="searchInput" placeholder="Cari todo..." />
      <button id="clearCompleted" style="color:#ef4444;">Hapus selesai</button>
    </div>

    <!-- LIST -->
    <ul class="todo-list" id="todoList"></ul>

    <!-- STATS -->
    <div class="stats" id="stats"></div>
  </div>

  <script>
    // --- STATE ---
    let todos = [];
    let filter = 'all';
    let sortBy = 'newest';
    let searchQuery = '';

    const STORAGE_KEY = 'todo-app';

    // --- DOM REFS ---
    const form = document.getElementById('todoForm');
    const input = document.getElementById('todoInput');
    const list = document.getElementById('todoList');
    const stats = document.getElementById('stats');
    const sortSelect = document.getElementById('sortSelect');
    const searchInput = document.getElementById('searchInput');
    const clearCompletedBtn = document.getElementById('clearCompleted');

    // --- STORAGE ---
    function loadTodos() {
      const data = localStorage.getItem(STORAGE_KEY);
      todos = data ? JSON.parse(data) : [];
    }
    function saveTodos() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }

    // --- CRUD ---
    function addTodo(text) {
      const todo = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      todos.push(todo);
      saveTodos();
      render();
    }

    function toggleTodo(id) {
      const todo = todos.find(t => t.id === id);
      if (todo) { todo.completed = !todo.completed; saveTodos(); render(); }
    }

    function editTodo(id, newText) {
      const todo = todos.find(t => t.id === id);
      if (todo) { todo.text = newText.trim(); saveTodos(); render(); }
    }

    function deleteTodo(id) {
      if (!confirm('Hapus todo ini?')) return;
      todos = todos.filter(t => t.id !== id);
      saveTodos();
      render();
    }

    function clearCompleted() {
      todos = todos.filter(t => !t.completed);
      saveTodos();
      render();
    }

    // --- FILTER, SORT, SEARCH ---
    function getFilteredTodos() {
      let result = [...todos];
      // Filter
      if (filter === 'active') result = result.filter(t => !t.completed);
      else if (filter === 'completed') result = result.filter(t => t.completed);
      // Search
      if (searchQuery) {
        result = result.filter(t =>
          t.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      // Sort
      if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      else if (sortBy === 'oldest') result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      else if (sortBy === 'az') result.sort((a, b) => a.text.localeCompare(b.text));
      else if (sortBy === 'za') result.sort((a, b) => b.text.localeCompare(a.text));
      return result;
    }

    // --- RENDER ---
    function render() {
      const filtered = getFilteredTodos();
      const total = todos.length;
      const completed = todos.filter(t => t.completed).length;
      const active = total - completed;

      // Render list
      list.innerHTML = filtered.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
          <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} />
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          <div class="todo-actions">
            <button class="edit-btn" data-action="edit">✏️</button>
            <button class="delete-btn" data-action="delete">🗑</button>
          </div>
        </li>
      `).join('');

      // Stats
      stats.textContent = `${total} total · ${active} tersisa · ${completed} selesai`;

      // Update active filter button
      document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
      });
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // --- EVENTS ---
    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      addTodo(text);
      input.value = '';
      input.focus();
    });

    list.addEventListener('click', e => {
      const item = e.target.closest('.todo-item');
      if (!item) return;
      const id = item.dataset.id;

      if (e.target.classList.contains('todo-checkbox')) {
        toggleTodo(id);
      } else if (e.target.dataset.action === 'delete') {
        deleteTodo(id);
      } else if (e.target.dataset.action === 'edit') {
        const todo = todos.find(t => t.id === id);
        const newText = prompt('Edit todo:', todo?.text);
        if (newText && newText.trim()) editTodo(id, newText);
      }
    });

    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        filter = btn.dataset.filter;
        render();
      });
    });

    sortSelect.addEventListener('change', () => { sortBy = sortSelect.value; render(); });
    searchInput.addEventListener('input', () => { searchQuery = searchInput.value; render(); });
    clearCompletedBtn.addEventListener('click', clearCompleted);

    // --- INIT ---
    loadTodos();
    render();
  </script>
</body>
</html>
```

### React Version (struktur komponen)

Untuk versi React, buat project dengan Vite:

```bash
npm create vite@latest todo-app-react -- --template react-ts
cd todo-app-react
npm install
```

Struktur komponen yang disarankan:

```
src/
├── components/
│   ├── TodoForm.tsx       # Form input + tombol tambah
│   ├── TodoList.tsx       # Daftar todos (render list)
│   ├── TodoItem.tsx       # Satu item todo (checkbox, text, actions)
│   ├── TodoControls.tsx   # Filter, sort, search
│   └── TodoStats.tsx      # Statistik
├── hooks/
│   └── useTodos.ts        # Custom hook: state + CRUD + localStorage
├── types.ts               # Interface Todo
├── App.tsx                # Root component
└── main.tsx               # Entry point
```

---

## 🖼 Expected Output

Setelah selesai, aplikasi Todo akan tampak seperti ini:

- **Header**: Judul "✅ Todo App"
- **Form input**: Text input + tombol "Tambah" — setelah submit, todo baru muncul di list
- **Controls bar**: Tombol filter (All / Active / Completed), dropdown sort, search input
- **Todo list**: Setiap item punya checkbox (kiri), teks (tengah), tombol edit + delete (kanan)
- **Item selesai**: Teks dicoret (strikethrough), warna memudar
- **Stats footer**: Menampilkan jumlah total, active, completed
- **Data persist**: Refresh browser — data tetap ada dari localStorage

Di versi React, semua state dikelola di custom hook `useTodos`. Komponen terpisah rapi.

---

## 💡 Latihan Tambahan

1. **Drag & Drop Reorder**: Pustaka `@dnd-kit/core` (React) atau vanilla HTML5 Drag API
2. **Kategori / Tag**: Tambah kategori (Pekerjaan, Pribadi, Belajar) dengan filter per kategori
3. **Due Date**: Input tanggal + overdue styling (merah kalau lewat)
4. **Prioritas**: High / Medium / Low — dengan badge warna
5. **Animasi**: Transisi saat todo ditambah / dihapus (CSS transition + class toggling)
6. **Undo / Redo**: Stack riwayat perubahan, tombol undo setelah hapus
7. **Export / Import**: Tombol download JSON dan upload restore
8. **PWA**: Jadikan Progressive Web App — installable di HP
9. **React Router**: Bikin halaman terpisah untuk Today, Upcoming, All
10. **Backend sync**: Simpan ke API (pake json-server atau Supabase)

---

## 📝 Rubrik Penilaian

| Kriteria | Belum (0) | Cukup (1) | Baik (2) | Istimewa (3) |
|----------|-----------|-----------|----------|--------------|
| **CRUD** | Kurang dari 3 operasi | Tambah + Tampil + Hapus | + Edit + toggle completed | + Clear completed + konfirmasi |
| **Persistence** | Data hilang saat refresh | localStorage (load/save) | + Error handling storage penuh | + Backup otomatis |
| **Filter/Sort/Search** | Tidak ada | Salah satu | Dua fitur | Semua: filter + sort + search |
| **UI/UX** | HTML polos | Layout rapi dengan CSS | + Hover + checkbox style | + Dark mode + animasi + responsive |
| **Code Quality (Vanilla)** | Global functions | Object state + render function | + CRUD terpisah + reusable | + Helper functions + JSDoc |
| **Code Quality (React)** | Satu komponen besar | Dipisah 3-4 komponen | + Custom hook | + TypeScript + unit test |

---

## 📚 Referensi

- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [React: useState Hook](https://react.dev/reference/react/useState)
- [React: useEffect Hook](https://react.dev/reference/react/useEffect)
- [Vite Guide](https://vitejs.dev/guide/)
- [CSS Filter & Sort Patterns](https://css-tricks.com/implementing-filter-functionality-in-css/)
