# Web Development — Exercise #9: LocalStorage

> **Level:** Advanced
> **Topics:** localStorage, JSON.parse, JSON.stringify, data persistence

## Instructions

Buat Todo List dengan persistence menggunakan localStorage.

Fitur:
1. Semua data todo tersimpan di localStorage.
2. Saat halaman di-reload, data tetap ada.
3. Bisa: tambah, toggle completed, hapus item.
4. Tombol **"Hapus Semua"** untuk clear semua todo.
5. Tampilkan jumlah todo yang belum selesai.

## Starter Code

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo List with localStorage</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, sans-serif;
      max-width: 550px;
      margin: 2rem auto;
      padding: 0 1rem;
      background: #f5f5f5;
    }
    #app {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    h1 { margin-bottom: 0.5rem; }
    .stats { color: #999; margin-bottom: 1rem; font-size: 0.9rem; }
    .input-group { display: flex; gap: 8px; margin-bottom: 1rem; }
    #todo-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
    }
    #add-btn {
      padding: 0.75rem 1.5rem;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    #todo-list { list-style: none; padding: 0; }
    .todo-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    .todo-item.completed span { text-decoration: line-through; color: #999; }
    .todo-item .delete-btn {
      margin-left: auto;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.25rem 0.75rem;
      cursor: pointer;
    }
    #clear-all {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
    }
  </style>
</head>
<body>
  <div id="app">
    <h1>📋 Todo List</h1>
    <div class="stats" id="stats">0 tugas tersisa</div>

    <div class="input-group">
      <input type="text" id="todo-input" placeholder="Tambah tugas...">
      <button id="add-btn">Tambah</button>
    </div>

    <ul id="todo-list"></ul>
    <button id="clear-all">🗑️ Hapus Semua</button>
  </div>

  <script>
    // TODO: load todos dari localStorage
    let todos = [];

    function saveTodos() {
      // TODO: simpan todos ke localStorage
    }

    function loadTodos() {
      // TODO: load todos dari localStorage
      // Gunakan JSON.parse
    }

    function renderTodos() {
      // TODO: render semua todo ke DOM
      // Update stats
    }

    function addTodo() {
      const text = document.getElementById('todo-input').value.trim();
      if (!text) return;

      // TODO: tambah todo ke array
      // { id: Date.now(), text, completed: false }
      // saveTodos() + renderTodos()
    }

    function toggleTodo(id) {
      // TODO: toggle completed status
    }

    function deleteTodo(id) {
      // TODO: hapus todo dari array
    }

    function clearAll() {
      // TODO: hapus semua
    }

    // TODO: event listeners
    document.getElementById('add-btn').addEventListener('click', addTodo);
    document.getElementById('todo-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTodo();
    });
    document.getElementById('clear-all').addEventListener('click', clearAll);

    // Delegate events untuk tombol di dalam list
    document.getElementById('todo-list').addEventListener('click', (e) => {
      // TODO: handle checkbox dan delete button clicks
    });

    // Load initial data
    loadTodos();
    renderTodos();
  </script>
</body>
</html>
```

## Expected Output

Todo list dengan persistence: data tetap ada setelah refresh browser.

## Test Cases

```javascript
// Test di console browser
console.log("localStorage todo siap. Tambah todo, refresh browser, lihat data tetap ada.");
```
