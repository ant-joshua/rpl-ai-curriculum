# Week 02: JavaScript — CLI Todo App

## Tujuan

Membangun aplikasi **Todo List berbasis CLI (Command Line Interface)** menggunakan JavaScript. Aplikasi ini berjalan di terminal Node.js dan mendukung operasi CRUD sederhana.

## Acceptance Criteria

- [ ] Aplikasi bisa dijalankan dengan `node todo.js`
- [ ] Perintah `add <task>` — menambahkan task baru
- [ ] Perintah `list` — menampilkan semua task (dengan nomor dan status)
- [ ] Perintah `complete <id>` — menandai task selesai
- [ ] Perintah `delete <id>` — menghapus task
- [ ] Data task tetap tersimpan meskipun program dimatikan ulang (gunakan file JSON)
- [ ] Validasi input: error message jika perintah tidak dikenal
- [ ] Format output rapi: warna hijau untuk selesai, merah untuk belum
- [ ] Menggunakan module system (`require` atau `import`)
- [ ] Tidak menggunakan library eksternal (hanya Node.js built-in)

## Step-by-Step

1. **Inisialisasi project**
   ```bash
   mkdir -p challenges/submissions/week-02/nama-kamu
   cd challenges/submissions/week-02/nama-kamu
   npm init -y
   ```
2. **Buat file utama**: `todo.js`
3. **Struktur data task**:
   ```js
   {
     id: 1,
     task: "Belajar Flexbox",
     completed: false,
     createdAt: "2025-07-07T10:00:00Z"
   }
   ```
4. **Simpan/load dari file JSON**
   - Gunakan `fs.readFileSync` / `fs.writeFileSync`
   - File data: `todos.json`
5. **Parse argument CLI**
   - `process.argv[2]` = command
   - `process.argv[3]` = argument (task / id)
6. **Implementasi command handler**
   - `add`: baca args, buat objek task, push ke array, simpan
   - `list`: baca file, tampilkan semua task
   - `complete`: cari task by id, ubah `completed: true`
   - `delete`: filter array, hapus task by id
7. **Format output**
   ```bash
   $ node todo.js list
   #1  [ ] Belajar Flexbox
   #2  [✓] Buat Landing Page     ← warna hijau
   #3  [ ] JavaScript CLI Todo   ← warna merah
   ```
8. **Error handling**
   - Task tidak ditemukan → "Task dengan id X tidak ditemukan"
   - Perintah tidak dikenal → "Perintah tidak dikenal. Gunakan: add, list, complete, delete"

## Bonus (Optional)

- ✅ Warna terminal pakai `chalk` atau ANSI escape codes manual
- ✅ Command `clear` untuk menghapus semua task yang completed
- ✅ Command `priority` — task bisa punya prioritas (high/medium/low)
- ✅ Sorting: task belum selesai tampil di atas

## Submission

```
challenges/submissions/week-02/nama-kamu/
├── todo.js
├── todos.json
└── package.json
```

Buat Pull Request dengan judul `[Week 02] CLI Todo - Nama Kamu` dan sertakan screenshot terminal.
