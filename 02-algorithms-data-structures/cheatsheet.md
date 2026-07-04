# 🧠 Cheatsheet: Algorithms & Data Structures

> Referensi cepet — 1 halaman. Print atau bookmark.

## Topik Utama
- **Big O Notation**: Ngukur efisiensi kode (langkah, bukan detik)
- **Array**: Index-based, O(1) access, O(n) insert/delete
- **Hash Table (Map/Object)**: Key-value, O(1) lookup rata-rata
- **Stack**: LIFO (push/pop) — undo, bracket matching
- **Queue**: FIFO (enqueue/dequeue) — antrian, BFS
- **Linked List**: Node → next, O(n) access, O(1) insert di head
- **Recursion**: Fungsi panggil diri sendiri, butuh base case
- **Sorting**: Bubble (O(n²)), Merge/Quick (O(n log n))
- **Tree/Graph**: BFS (queue), DFS (stack/rekursif)

## Big O Cheatsheet

```
O(1)      → Constant   — arr[0], obj.key
O(log n)  → Logarithmic — Binary search
O(n)      → Linear     — Loop sekali
O(n log n)→ Linearithmic — Efficient sorting
O(n²)     → Quadratic  — Nested loop
O(2^n)    → Exponential — Rekursif tanpa memo
```

## Tips & Trik
- Drop constants: O(2n) = O(n). Drop non-dominants: O(n + n²) = O(n²)
- Input berbeda → variabel beda: O(a + b), bukan O(2n)
- LeetCode: mulai dari brute force → optimal (tanya constraint dulu)
- Gunakan `Map` / `Set` instead of Object buat frequency counter

## Common Mistakes
- ❌ Lupa base case di rekursif → stack overflow
- ❌ Pake nested loop padahal bisa hash map O(n)
- ❌ Mutate input array tanpa sadar

## Link Cepat
- [Module README](README.md)
- [Latihan](../exercises/02-dsa/)
- [Quiz](quiz.md)
