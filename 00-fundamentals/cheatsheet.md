# 🧠 Cheatsheet: Fundamental Pemrograman & Web

> Referensi cepet — 1 halaman. Print atau bookmark.

## Topik Utama
- **Client-Server**: Browser (client) → request → Server → response → Browser
- **Frontend vs Backend**: FE = HTML/CSS/JS (browser), BE = server logic + API + DB
- **HTTP Methods**: GET (ambil), POST (buat), PUT/PATCH (ubah), DELETE (hapus)
- **Status Codes**: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error
- **API**: Jembatan antar aplikasi (REST API paling umum)
- **Database**: SQL (relasional) vs NoSQL (fleksibel)
- **Deployment**: Vercel (FE), Railway (BE), VPS (full prod)
- **Git**: Version control — snapshot kode

## Command Penting

```bash
# Terminal
ls               # Lihat file
cd folder        # Pindah folder
mkdir nama       # Buat folder
node file.js     # Jalanin JS
npm install      # Download dependencies

# Git
git init         # Aktifkan git
git add .        # Stage semua
git commit -m "" # Snapshot
git push         # Upload ke GitHub
```

```sql
CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR, email VARCHAR UNIQUE);
INSERT INTO users (name, email) VALUES ('Budi', 'budi@email.com');
SELECT * FROM users WHERE name = 'Budi';
```

## Tips & Trik
- URL breakdown: `https://domain.com/path?query=value` — protocol, domain, path, query
- Ctrl+C di terminal buat cancel command apapun
- Git = mesin waktu — bisa balik ke versi sebelumnya

## Common Mistakes
- ❌ Pake `var` di JS → pake `let` / `const`
- ❌ Lupa bedain FE vs BE — FE urus tampilan, BE urus data + logic
- ❌ Pikir API itu magic — API cuma jembatan HTTP biasa

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
