# 🧑‍🏫 Panduan Mengajar — RPL AI Curriculum

> Buat guru/dosen yang ngajar short course ini.

## Format Sesi

- **Durasi:** 90 menit per sesi
- **Struktur:** 15 menit teori + 45 menit coding + 20 menit latihan + 10 menit review
- **Tools:** Projector, VS Code live share, GitHub Classroom

## Tips Mengajar

1. **Jangan bacain slide** — langsung demo coding. Ini kurikulum coding, bukan teori.
2. **Pair programming** — siswa coding berpasangan. Satu ngetik, satu review. Ganti tiap 15 menit.
3. **Break down** — tiap tugas pecah jadi langkah kecil. "Bikin variable" dulu, baru "bikin function".
4. **Error = belajar** — kalo error, jangan buru-buru benerin. Ajak siswa baca traceback.
5. **AI is allowed** — demonstrasikan cara pake AI buat debug. Jangan anti-AI.

## Sesinya Ngapain Aja

### Modul 1: JavaScript (4 sesi)
| Sesi | Topik | Aktivitas Utama |
|------|-------|-----------------|
| 1 | Variable, tipe, operator | Live coding: konversi suhu, kalkulator |
| 2 | If/else, loop | Game tebak angka, tabel perkalian |
| 3 | Array, object, function | Contact book sederhana |
| 4 | Async, error, fetch | Fetch API publik + debug challenge |

### Modul 2: DSA (4 sesi)
| Sesi | Topik | Aktivitas Utama |
|------|-------|-----------------|
| 1 | Big O + Array | Analisis kecepatan kode, Two Sum |
| 2 | Hash Table | Freq counter, Valid Anagram |
| 3 | Stack/Queue/Linked List | Valid Parentheses, implementasi |
| 4 | Recursion/Sorting + LeetCode | Merge sort, 3 soal LeetCode |

### Modul 3: TypeScript (2 sesi)
| Sesi | Topik |
|------|-------|
| 1 | Types + Interface + Refactor JS ke TS |
| 2 | Generics + Utility Types |

### Modul 4: Web Basics (3 sesi)
| Sesi | Topik |
|------|-------|
| 1 | HTML semantic + CSS Flexbox/Grid |
| 2 | Tailwind CSS + Dark Mode |
| 3 | DOM + Fetch + Deploy Vercel |

### Modul 5: Git & Deploy (2 sesi)
| Sesi | Topik |
|------|-------|
| 1 | Git init, add, commit, push, pull |
| 2 | Branch, merge, PR, GitHub flow |

### Modul 6: Node.js & Express (3 sesi)
| Sesi | Topik |
|------|-------|
| 1 | Node.js runtime + npm + module system |
| 2 | Express routing + middleware + error handling |
| 3 | PostgreSQL + CRUD API |

### Modul 7: Mastra AI (3 sesi)
| Sesi | Topik |
|------|-------|
| 1 | Mastra setup + agent pertama |
| 2 | Tools + Memory |
| 3 | RAG + Workflows |

### Modul 8: Final Project (4 sesi)
| Sesi | Aktivitas |
|------|-----------|
| 1 | Brainstorm + planning + GitHub project |
| 2 | Sprint coding |
| 3 | Sprint coding + polish |
| 4 | Deploy + presentasi |

## Assessment

- **Tugas mingguan:** 40% (dikumpulin di GitHub)
- **Final project:** 40% (app live + presentasi)
- **Partisipasi:** 20%

## Common Issues & Solutions

| Masalah | Solusi |
|---------|--------|
| "Error: module not found" | Cek `package.json`, `npm install` ulang |
| "Ga muncul di browser" | Cek console browser (F12). Cek port. |
| "Merge conflict di Git" | Jangan panik. Baca file, hapus `<<<<<` dan `=====` |
| "API error CORS" | Tambah header CORS di backend |
| "LeetCode timeout" | Cari solusi O(n²) -> O(n). Biasanya pake hash map. |
| "Mastra ga connect" | Cek API key di .env |
