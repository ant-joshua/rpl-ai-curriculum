# 23. System Runtime & Async Programming

> **Level:** 📐 Intermediate  
> **Jam:** 8 (2 sesi)  
> **Prasyarat:** Module 1 (JS Fundamentals) — udah pake Promise tapi belum paham dalemnya  
> **Output:** Paham gimana JS jalan di komputer — memory, event loop, thread, Promise beneran

---

## 🎯 Tujuan Modul

Setelah menyelesaikan modul ini, kamu bakal bisa:

1. **Memahami event loop** — fase-fase, microtask vs macrotask, blocking vs non-blocking, dan cara prediksi urutan eksekusi
2. **Menguasai Promise patterns** — combinators (all, allSettled, race, any), error handling, sequential vs parallel
3. **Membedakan Worker Threads, Cluster, dan Child Process** — kapan pake yang mana untuk CPU-bound task
4. **Mendeteksi dan memperbaiki memory leak** — heap snapshot, GC, V8 generational collection
5. **Profiling performa Node.js** — flamegraph, event loop lag, CPU profiling pake clinic.js
6. **Memahami V8 engine internals** — JIT compiler, hidden classes, inline caching, dan nulis kode yang V8-friendly
7. **Mengaplikasikan async patterns di production** — retry, batch processing, stream handling, race condition avoidance
8. **Mengoptimasi runtime** — nge-balance antara CPU-bound vs I/O-bound, thread pool management

---

## 📚 Sesi Pembelajaran

| # | Sesi | Durasi | Topik |
|---|------|--------|-------|
| 01 | [Event Loop — Jantung Node.js](01-event-loop.md) | 2 jam | Event loop phases, call stack, microtask/macrotask, blocking vs non-blocking, setImmediate vs setTimeout vs process.nextTick |
| 02 | [Async Patterns — Promise & async/await](02-async-patterns.md) | 2 jam | Promise combinators, async/await best practices, error handling, sequential vs parallel, retry pattern, async iterators |
| 03 | [Multithreading — Worker, Cluster, Child Process](03-multithreading.md) | 2 jam | Worker Threads, libuv thread pool, cluster module, child_process exec/spawn/fork, CPU-bound offloading |
| 04 | [Runtime Performance — Memory, GC, Profiling](04-runtime-perf.md) | 2 jam | Stack vs Heap, garbage collection, memory leak detection, CPU profiling, V8 internals (JIT, hidden classes, inline caching) |

---

## 📋 Ringkasan Materi

### Stack vs Heap

Memory komputer itu ada 2 area utama buat nyimpen data:

**Stack** — memory buat data kecil + sementara (primitives, function call frames). Cepet, otomatis dihapus pas function selesai.

```typescript
function greet(name: string) {
  const msg = "Halo " + name;  // msg di stack
  return msg;
}
// Pas greet selesai, msg otomatis ilang dari stack
```

**Heap** — memory buat data besar + umur panjang (objects, arrays, functions). Lebih lambat, harus dibersihin pake Garbage Collector.

```typescript
const user = { name: "Budi", age: 17 };
// user (reference) ada di stack
// { name: "Budi", age: 17 } ada di heap
```

### Value vs Reference — Visual

```
Primitive (value):
  let a = 10;
  let b = a;   // b = 10, duplikat
  b = 20;
  console.log(a); // 10 — aman, a ga berubah

Object (reference):
  let obj1 = { count: 10 };
  let obj2 = obj1;   // obj2 pointing ke OBJECT YANG SAMA
  obj2.count = 20;
  console.log(obj1.count); // 20 — obj1 ikut berubah!
```

**Visual memory:**
```
Stack:
  [a: 10]
  [b: 20]      ← bebas, punya sendiri
  
Stack:
  [obj1] ─────┐
  [obj2] ─────┤
              ▼
           Heap:
           { count: 20 }   ← satu object, diubah barengan
```

**Imutability pattern:**
```typescript
// Biar object ga termutasi, spread aja:
const updated = { ...obj1, count: 20 };
// Sekarang obj1.count masih 10, updated.count = 20
```

### Event Loop — Jantung Node.js

Node.js itu **single-threaded**... tapi bisa handle ribuan request per detik. Kok bisa? **Event Loop.**

```
┌───────────────────────────┐
│         timers            │ ← setTimeout, setInterval
└──────────┬────────────────┘
┌──────────▼────────────────┐
│      pending callbacks    │ ← I/O callback (file, network)
└──────────┬────────────────┘
┌──────────▼────────────────┐
│         poll              │ ← Ambil event I/O baru
│  (kalo kosong, nunggu)    │
└──────────┬────────────────┘
┌──────────▼────────────────┐
│        check              │ ← setImmediate
└──────────┬────────────────┘
┌──────────▼────────────────┐
│   close callbacks         │ ← socket.on('close', ...)
└───────────────────────────┘
     │
     ▼  (loop lagi dari atas)
```

**Cara kerja:**
1. Jalanin synchronous code dulu (call stack)
2. Kalo ada setTimeout / I/O / Promise, kirim ke sistem
3. Kalo call stack kosong, cek queue
4. Prioritaskan **microtask** (Promise, process.nextTick) DULU
5. Baru **macrotask** (setTimeout, setInterval, I/O)

**Contoh:**
```typescript
console.log('1');  // Jalan duluan (sync)

setTimeout(() => {
  console.log('2');  // Macrotask — jalan paling akhir
}, 0);

Promise.resolve().then(() => {
  console.log('3');  // Microtask — jalan sebelum macrotask
});

console.log('4');  // Sync

// Output: 1, 4, 3, 2
// Kenapa? Sync → Microtask (Promise) → Macrotask (setTimeout)
```

### Single Core vs Multi Thread

```
JavaScript main thread:
  - Jalanin kode lo
  - Event loop
  - Call stack

libuv thread pool (4 thread default):
  - File system (readFile, writeFile)
  - DNS lookup
  - Crypto (hash, bcrypt)
  - Compression (zlib)

Worker Threads (Node.js 10+):
  - CPU-intensive task (image processing, data parsing)
  - Lo bikin explicit
```

**CPU-bound vs I/O-bound:**
```
CPU-bound (hitung Fibonacci besar):
  ❌ Jangan di main thread → blockage event loop
  ✅ Pake Worker Thread / pindahin ke microservice

I/O-bound (read file, query DB, fetch API):
  ✅ Aman di main thread → libuv yang urus
  Event loop tetep jalan karena nunggu callback doang
```

### Callback → Promise → async/await (Evolusi)

**Callback (sekarang udah jarang dipake langsung):**
```typescript
getUser(1, (err, user) => {
  if (err) return console.error(err);
  getPosts(user.id, (err, posts) => {
    if (err) return console.error(err);
    getComments(posts[0].id, (err, comments) => {
      if (err) return console.error(err);
      console.log(comments);
    });
  });
});
```

**async/await (baca kayak sync code):**
```typescript
async function main() {
  try {
    const user = await getUser(1);
    const posts = await getPosts(user.id);
    const comments = await getComments(posts[0].id);
    console.log(comments);
  } catch (err) {
    console.error(err);
  }
}
```

---

## 🧩 Rangkuman Visual

```
┌─────────────────────────────────────────────────────┐
│                  Node.js Runtime                      │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │         JavaScript Main Thread               │   │
│  │  ┌──────────┐  ┌───────────┐                │   │
│  │  │Call Stack│  │ Event Loop │                │   │
│  │  └──────────┘  └─────┬─────┘                │   │
│  │                      │                       │   │
│  │  ┌───────────────────▼──────────────────┐   │   │
│  │  │      Microtask Queue                 │   │   │
│  │  │  Promise.then, process.nextTick      │   │   │
│  │  └──────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────┐   │   │
│  │  │      Macrotask Queue                 │   │   │
│  │  │  setTimeout, setInterval, I/O        │   │   │
│  │  └──────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │        libuv Thread Pool (4 threads)         │   │
│  │  File I/O │ DNS │ Crypto │ Compression      │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  Memory:                                              │
│  ┌──────────┐  ┌──────────────────────────────────┐  │
│  │  Stack   │  │          Heap                    │  │
│  │  kecil   │  │  besar, object, array            │  │
│  │  primitf │  │  diurus GC (mark & sweep)        │  │
│  └──────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 📝 Latihan Modul

1. **Event loop prediction:** Tulis output dari kode ini:
   ```typescript
   console.log('a');
   setTimeout(() => console.log('b'), 0);
   Promise.resolve().then(() => console.log('c'));
   console.log('d');
   ```

2. **Memory leak detector:** Cari potential memory leak di kode class Chat di atas. Benerin.

3. **Async refactor:** Ubah callback hell jadi async/await (3 level nesting).

4. **Promise combinator:** Dari 4 API calls, jalankan paralel, tapi kalo salah satu gagal, tetap ambil yang berhasil.

5. **Heavy computation:** Simulasi CPU-bound task (loop 1M) di main thread. Ukur berapa lama block event loop. Trus pindahin ke Worker Thread.

---

## 🔗 Navigasi Cepat

| Dari | Ke |
|------|-----|
| 🏠 **README (Index)** | ← Kamu di sini |
| 📄 [01. Event Loop](01-event-loop.md) | Call stack, microtask/macrotask, phases, blocking |
| 📄 [02. Async Patterns](02-async-patterns.md) | Promise combinators, async/await, streams |
| 📄 [03. Multithreading](03-multithreading.md) | Worker Threads, Cluster, Child Process |
| 📄 [04. Runtime Performance](04-runtime-perf.md) | Memory, GC, profiling, V8 internals |

> **Lanjut ke Sesi 1:** [Event Loop — Jantung Node.js](01-event-loop.md)
