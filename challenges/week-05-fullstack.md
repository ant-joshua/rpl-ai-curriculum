# Week 05: Fullstack — Todo App dengan React + Express + SQLite

## Tujuan

Membangun aplikasi **Todo List fullstack** dengan:
- **Frontend**: React (Vite)
- **Backend**: Express.js
- **Database**: SQLite (via `better-sqlite3`)
Aplikasi ini menggabungkan frontend dan backend dalam satu repositori (monorepo sederhana).

## Acceptance Criteria

- [ ] Backend Express menyediakan REST API untuk CRUD todo
- [ ] Database menggunakan SQLite dengan tabel `todos` (id, task, completed, created_at)
- [ ] Frontend React bisa **menampilkan daftar todo** dari API
- [ ] Frontend bisa **menambah todo** baru (form input + tombol)
- [ ] Frontend bisa **menandai todo selesai** (toggle checkbox)
- [ ] Frontend bisa **menghapus todo** (tombol delete)
- [ ] Menggunakan **fetch API** di frontend (bukan axios)
- [ ] Styling minimal: CSS modules atau Tailwind CSS
- [ ] Tidak ada error di console browser
- [ ] Kode rapi dengan folder `client/` dan `server/`

## Step-by-Step

1. **Setup folder monorepo**
   ```
   challenges/submissions/week-05/nama-kamu/
   ├── client/        (React Vite)
   ├── server/        (Express + SQLite)
   └── README.md
   ```
2. **Backend setup**
   ```bash
   mkdir server && cd server
   npm init -y
   npm install express better-sqlite3 cors
   ```
3. **Buat database & tabel**
   ```js
   // server/db.js
   const Database = require('better-sqlite3');
   const db = new Database('todos.db');
   db.exec(`CREATE TABLE IF NOT EXISTS todos (...)`);
   module.exports = db;
   ```
4. **Buat CRUD routes** (`server/routes/todos.js`)
   - `GET /api/todos` — semua todo
   - `POST /api/todos` — tambah todo
   - `PATCH /api/todos/:id` — toggle completed
   - `DELETE /api/todos/:id` — hapus todo
5. **Frontend setup**
   ```bash
   npm create vite@latest client -- --template react
   cd client && npm install
   ```
6. **Buat komponen React**
   - `App.jsx` — layout utama
   - `TodoList.jsx` — daftar todo
   - `TodoItem.jsx` — satu item todo
   - `AddTodo.jsx` — form tambah todo
7. **Fetch data dari API**
   ```js
   useEffect(() => {
     fetch('http://localhost:3001/api/todos')
       .then(res => res.json())
       .then(data => setTodos(data));
   }, []);
   ```
8. **CORS**: pasang `cors` middleware di Express
9. **Jalankan bersama**
   - Server: `node server/index.js` (port 3001)
   - Client: `npm run dev` (port 5173)
   - Buka browser di `http://localhost:5173`

## Bonus (Optional)

- ✅ Fitur **edit** todo (inline editing atau modal)
- ✅ **Drag & drop** untuk reorder todo
- ✅ **Filter**: All / Active / Completed
- ✅ Deploy ke Vercel + Render (link di README)

## Submission

```
challenges/submissions/week-05/nama-kamu/
├── client/
├── server/
└── README.md
```

Buat Pull Request dengan judul `[Week 05] Fullstack Todo - Nama Kamu`. Sertakan screenshot aplikasi dan **link Pull Request** sebagai output.

> **Output:** Link Pull Request
