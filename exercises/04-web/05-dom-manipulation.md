# Web Development — Exercise #5: DOM Manipulation

> **Level:** Intermediate
> **Topics:** createElement, appendChild, classList, removeChild, innerHTML

## Instructions

Buat Todo List dinamis yang bisa:

1. **Add** — menambah item baru ke daftar.
2. **Delete** — menghapus item dari daftar (tombol "Hapus" di setiap item).
3. **Toggle Completed** — menandai item selesai/belum (checkbox).
4. Item yang selesai diberi gaya `text-decoration: line-through`.

Gunakan DOM manipulation methods: `createElement`, `appendChild`, `classList`, `removeChild`.

## Starter Code

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo List DOM</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      max-width: 500px;
      margin: 2rem auto;
      padding: 0 1rem;
      background: #f5f5f5;
    }
    #todo-app {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .input-group {
      display: flex;
      gap: 8px;
      margin-bottom: 1.5rem;
    }
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
    #todo-list {
      list-style: none;
      padding: 0;
    }
    .todo-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    .todo-item.completed span {
      text-decoration: line-through;
      color: #999;
    }
    .todo-item .delete-btn {
      margin-left: auto;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.25rem 0.75rem;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="todo-app">
    <h1>📋 Todo List</h1>
    <div class="input-group">
      <input type="text" id="todo-input" placeholder="Tambah tugas...">
      <button id="add-btn">Tambah</button>
    </div>
    <ul id="todo-list">
      <!-- TODO item akan ditambahkan di sini -->
    </ul>
  </div>

  <script>
    const input = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const list = document.getElementById('todo-list');

    function addTodo() {
      const text = input.value.trim();
      if (!text) return;

      // TODO: buat li element
      // - checkbox untuk toggle completed
      // - span untuk text
      // - button "Hapus" untuk delete

      input.value = '';
      input.focus();
    }

    addBtn.addEventListener('click', addTodo);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTodo();
    });
  </script>
</body>
</html>
```

## Expected Output

Todo list yang bisa menambah, menandai selesai, dan menghapus item.

## Test Cases

```javascript
// Test di console browser
console.log("Todo list siap. Coba tambah, centang, dan hapus item.");
```
