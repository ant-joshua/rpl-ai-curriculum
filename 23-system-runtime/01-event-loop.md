# 01. Event Loop — Jantung Node.js

> **Level:** 📐 Intermediate | **Durasi:** 2 jam | **Topik:** Event Loop, Task Queue, Blocking vs Non-Blocking

---

## 🧠 Tujuan Pembelajaran

Setelah sesi ini, kamu bakal bisa:

- Menjelaskan cara kerja event loop dan 6 phase-nya
- Membedakan microtask vs macrotask dan urutan prioritasnya
- Memprediksi output kode yang melibatkan setTimeout, Promise, process.nextTick
- Memahami kenapa `setImmediate` beda dengan `setTimeout(fn, 0)`
- Mengidentifikasi blocking code yang bisa nge-freeze event loop

---

## Apa Itu Event Loop?

Node.js itu **single-threaded** — artinya cuma ada 1 thread yang jalanin kode JavaScript. Tapi kok bisa handle ribuan request per detik? Jawabannya: **Event Loop**.

Event loop adalah mekanisme yang muter terus-terusan, ngambil tugas dari queue, dan ngejalaninnya di call stack. Selagi nunggu tugas selesai (misalnya baca file atau request network), event loop bisa ngelayani tugas lain.

Call stack itu tempat function yang lagi dijalankan. Kalo function manggil function lain, ditumpuk di atas. Kalo selesai, dikeluarin. Prinsip **LIFO** (Last In, First Out).

```typescript
function multiply(a: number, b: number) {
  return a * b;
}

function square(n: number) {
  return multiply(n, n); // multiply masuk ke call stack
}

console.log(square(5)); // Output: 25
// Call stack: console.log → square → multiply → (balik)
```

Selama call stack kosong, event loop cek queue. Queue ada dua jenis: microtask dan macrotask. **Microtask selalu didahulukan** dibanding macrotask.

---

## 🔄 Event Loop Phases

Event loop punya 6 phase yang diulang terus:

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

**Penjelasan tiap phase:**

1. **timers** — Ngejalanin callback setTimeout & setInterval yang udah waktunya
2. **pending callbacks** — Ngejalanin callback I/O yang ditunda (error, koneksi TCP)
3. **poll** — Ambil event I/O baru. Kalo ada callback, jalanin. Kalo kosong, nunggu
4. **check** — setImmediate() callback dijalanin di phase ini
5. **close callbacks** — Event close kayak `socket.on('close')`

**PENTING:** Di antara setiap phase, event loop ngecek microtask queue. Microtask **selalu dikerjain duluan** sebelum lanjut ke phase berikutnya.

---

## ⚡ Microtask vs Macrotask

Ini konsep paling penting yang sering ngejebak developer baru.

| Microtask | Macrotask |
|-----------|-----------|
| `Promise.then()` | `setTimeout()` |
| `process.nextTick()` | `setInterval()` |
| `queueMicrotask()` | I/O callbacks |
| `await` (lanjutan) | `setImmediate()` |

**Aturan prioritas:**

1. Synchronous code (call stack) — DIJALANIN DULU SEMUA
2. Microtask — setelah call stack kosong
3. Macrotask — setelah microtask abis

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

**Kenapa ini penting?**
- Lo nulis `await` bukan berarti "berhenti" — cuma mindahin kode ke microtask queue
- Event loop tetep jalan ngelayanin request LAIN selagi nunggu
- Makanya Node.js bisa handle ribuan request dengan 1 thread

---

## ⏱ setImmediate vs setTimeout vs process.nextTick

Ketiganya sama-sama "tunda eksekusi", tapi timing-nya beda:

| Method | Phase Eksekusi | Prioritas |
|--------|---------------|-----------|
| `process.nextTick()` | Sebelum phase event loop apapun | Tertinggi (microtask spesial) |
| `Promise.then()` | Microtask queue | Tinggi |
| `setTimeout(fn, 0)` | timers phase (macrotask) | Rendah |
| `setImmediate()` | check phase (macrotask) | Rendah |

```typescript
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('Promise'));
setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate'));

// Output (pasti):
// nextTick
// Promise
// setTimeout (atau setImmediate, tergantung phase)
// setImmediate (atau setTimeout)

// NOTE: process.nextTick selalu jalan duluan dari apapun
// Bahkan duluan dari Promise.then!
```

**Kapan pake apa?**
- `process.nextTick()` — untuk sesuatu yang harus jalan SEBELUM I/O lanjutan. Tapi hati-hati: bisa starvation kalo recursive.
- `setImmediate()` — untuk sesuatu setelah I/O selesai. Lebih aman daripada `nextTick`.
- `setTimeout(fn, 0)` — delay minimal, tapi bukan 0 beneran. Minimum 1ms.

**PITFALL: process.nextTick starvation**

```typescript
function recursiveNextTick() {
  process.nextTick(recursiveNextTick);
  // ⚠️ Event loop GA PERNAH sampe ke phase I/O
  // Karena nextTick terus nambah ke queue
}
```

---

## 🚫 Blocking vs Non-Blocking

**Blocking code** = kode yang ngehold call stack terlalu lama. Akibatnya: event loop ga bisa lanjut, request lain ngantri, aplikasi terasa lemot/beku.

**CPU-bound task** (hitung Fibonacci, loop kompleks, JSON.stringify besar) — ini yang ngeblock.

```typescript
// ❌ INI BAKAL BLOCK EVENT LOOP — semua request lain nunggu
app.get('/heavy', (req, res) => {
  const result = heavyComputation(1000000000); // 1M iterations
  res.json({ result });
});
```

**I/O-bound task** (read file, query DB, fetch API) — ini **aman**. libwu yang nanganin di thread pool terpisah.

```typescript
// ✅ I/O-bound — AMAN, ga block event loop
fs.readFile('file.txt', 'utf-8', (err, data) => {
  console.log(data);
});
// Baris ini LANGSUNG lanjut, ga nunggu file dibaca
```

**Ciri-ciri blocking code:**
- Loop dengan iterasi besar (`for` tanpa `await` di dalemnya)
- `JSON.parse`/`JSON.stringify` object raksasa
- Regex complex di input user
- `crypto.randomBytes` sync (blocking)
- `fs.readFileSync` — versi sync dari method manapun

---

## ⚠️ Common Pitfalls

### 1. Salah mikir `setTimeout(fn, 0)` = langsung jalan
Jangan. Dia tetep macrotask, jalan setelah microtask dan sync code abis.

### 2. Lupa bahwa microtask bisa nge-stall macrotask
```typescript
// Kalo microtask terus nambah, macrotask ga pernah jalan
function loop() {
  Promise.resolve().then(loop); // 🔴 Microtask recursion
  // setTimeout lanjutan GA PERNAH dieksekusi
}
```

### 3. CPU-heavy task di main thread tanpa Worker
Semua request lain nunggu. Pake Worker Thread (dibahas di sesi berikutnya).

### 4. Menganggap `await` itu "ngepause"
`await` cuma ngepause function itu doang, bukan thread. Event loop tetep jalan, request lain dilayani.

---

## 📝 Latihan

1. **Event loop prediction:** Tulis output:
   ```typescript
   console.log('a');
   setTimeout(() => console.log('b'), 0);
   Promise.resolve().then(() => console.log('c'));
   console.log('d');
   ```
   **Jawab:** a, d, c, b

2. **Tambah process.nextTick:** Tebak output kalo ada ini:
   ```typescript
   process.nextTick(() => console.log('x'));
   console.log('1');
   setTimeout(() => console.log('2'), 0);
   Promise.resolve().then(() => console.log('3'));
   console.log('4');
   ```

3. **Blocking detector:** Lihat kode di bawah, mana yang bakal block event loop?
   ```typescript
   // A
   setTimeout(() => {
     for (let i = 0; i < 1e9; i++) {}
   }, 1000);

   // B
   fs.readFile('big-file.txt', (err, data) => {
     console.log(data.length);
   });

   // C
   const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
   ```

4. **Fix blocking code:** Ubah kode blocking di atas jadi non-blocking pake Promise.

5. **Prioritas queue:** Bikin kode yang nunjukin urutan: nextTick → Promise → setTimeout, dan jelasin output-nya.

---

## 📖 Referensi

- [Node.js Event Loop Docs](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Visual Guide to Event Loop — Lydia Hallie](https://dev.to/lydiahallie/javascript-visualized-event-loop-3dif)
- [Philip Roberts — What the heck is the event loop anyway? (JSConf)](https://www.youtube.com/watch?v=8aGhZQkoFbQ)

---

**Lanjut ke:** [02. Async Patterns](02-async-patterns.md) → Promise dan async/await lebih dalem.
