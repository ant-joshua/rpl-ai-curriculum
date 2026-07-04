# RPP: Algorithms & Data Structures

| Info | Detail |
|------|--------|
| Kode | RPL-AI-02 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Beginner |
| Prasyarat | JavaScript Fundamentals (Modul 01) |

## Pertemuan 1: Big O Notation & Analisis Kompleksitas

### Tujuan
- Memahami konsep Big O dan kenapa penting
- Membedakan O(1), O(n), O(n²), O(log n)
- Menganalisis kompleksitas waktu & ruang kode sederhana

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Apersepsi**: "Kenapa ada kode yang lambat?" — analogi antrean | Tanya jawab | Slide analogi |
| 20' | **Big O intro**: O(1), O(n), O(n²), O(log n) — chart visual | Ceramah | Slide + bigocheatsheet.com |
| 15' | **Demo hitung step**: Loop vs nested loop — ukur waktu `performance.now()` | Live code | Terminal |
| 25' | **Praktik**: Klasifikasikan fungsi ke O mana, urutkan dari paling efisien | Hands-on | Kartu soal + starter code |
| 15' | **Latihan mandiri**: Refactor O(n²) → O(n) untuk fungsi sederhana | Problem solving | Soal |
| 5' | **Refleksi**: Tebak Big O kode teman | Q&A | — |

### Bahan Ajar
- [Module 02 - Big O](../02-algorithms-data-structures/01-big-o.md)

---

## Pertemuan 2: Arrays, Hash Tables & Basic DS

### Tujuan
- Memahami array operations dan kompleksitasnya
- Menggunakan hash table / Map / Set
- Memilih struktur data yang tepat

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review Big O** | Kuis cepat | — |
| 20' | **Array**: operasi push/pop/shift/unshift, kompleksitas | Ceramah + demo | Live code |
| 20' | **Hash Table**: Map, Set, kapan pake array vs hash | Ceramah + demo | Live code |
| 25' | **Praktik**: Cek duplikat, two-sum, anagram checker | Hands-on | Starter code |
| 15' | **Latihan mandiri**: Frekuensi counter — hitung kemunculan kata | Problem solving | Soal |
| 5' | **Refleksi**: Kapan pake array vs Map? | Tanya jawab | — |

### Bahan Ajar
- [Module 02 - Arrays & Hash Tables](../02-algorithms-data-structures/02-arrays-hashtables.md)

---

## Pertemuan 3: Stacks, Queues, Linked Lists & Recursion

### Tujuan
- Mengimplementasikan stack & queue dari array
- Memahami konsep pointer & linked list
- Menulis fungsi rekursif

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review hash table** | Kuis | — |
| 15' | **Stack & Queue**: LIFO/FIFO, implementasi array, contoh undo/antrean | Ceramah + demo | Live code |
| 10' | **Linked List**: Pointer, node, singly vs doubly (visual) | Ceramah + visual | Slide diagram |
| 15' | **Recursion**: Base case + recursive case, call stack visual | Ceramah + demo | Live code + visual |
| 25' | **Praktik**: Stack undo/redo sederhana, factorial recursive | Hands-on | Starter code |
| 15' | **Latihan mandiri**: Validasi bracket `{}[]()` pake stack | Problem solving | Soal |
| 5' | **Refleksi**: Rekursif vs loop — kapan pake mana? | Q&A | — |

### Bahan Ajar
- [Module 02 - Stacks, Queues, Linked Lists](../02-algorithms-data-structures/03-stacks-queues-linkedlists.md)
- [Module 02 - Recursion & Sorting](../02-algorithms-data-structures/04-recursion-sorting.md)

---

## Pertemuan 4: Sorting, Trees, Graphs & LeetCode Practice

### Tujuan
- Memahami bubble sort, merge sort, quick sort
- Mengenal tree & graph (traversal dasar)
- Menerapkan strategi brute force → optimal

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Review recursion & stack** | Live code review | — |
| 20' | **Sorting**: Bubble vs Merge vs Quick — visual animasi | Ceramah + demo | visualgo.net |
| 15' | **Tree & Graph intro**: Binary tree, traversal BFS/DFS | Ceramah + visual | Slide diagram |
| 10' | **Strategi LeetCode**: Brute force → optimal — contoh nyata | Ceramah | Slide |
| 25' | **Praktik LeetCode**: Selesaikan 2 soal easy/medium bareng | Hands-on | LeetCode / HackerRank |
| 10' | **Refleksi & tindak lanjut**: Challenge mandiri minggu depan | Q&A | — |

### Bahan Ajar
- [Module 02 - Recursion & Sorting](../02-algorithms-data-structures/04-recursion-sorting.md)
- [Module 02 - Trees & Graphs](../02-algorithms-data-structures/05-trees-graphs.md)
- [Module 02 - LeetCode Practice](../02-algorithms-data-structures/06-leetcode-practice.md)
