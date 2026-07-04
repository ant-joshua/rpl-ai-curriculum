# RPP Modul 23: System Runtime & Async Programming

**Durasi:** 3 sesi × 90 menit = 270 menit

## Tujuan Pembelajaran

Setelah modul ini, siswa mampu:
- Memahami stack vs heap, value vs reference
- Menjelaskan event loop + microtask vs macrotask
- Menggunakan Promise combinators (all, allSettled, race, any)
- Mencegah memory leak
- Menggunakan Worker Thread untuk CPU-intensive task

## Tools & Bahan

- Node.js runtime
- Chrome DevTools (Performance tab, Memory tab)
- visual-event-loop.com (opsional)
- Contoh kode sync/async

---

## Sesi 1: Stack, Heap, Value vs Reference + GC (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Memory Fundamentals** | Stack (primitif, call frames, cepat, terbatas). Heap (object, array, lambat, besar). Value vs Reference. Garbage Collector: Mark & Sweep, Generational. |
| 45 menit | **Coding: Mutation Demo** | Demo: primitif vs object assignment. Mutasi object reference (bug umum). Spread operator untuk immutability. |
| 20 menit | **Latihan: Fix Mutation Bug** | Siswa dikasih kode dengan mutation bug (object berubah di 2 tempat). Fix dengan spread / deep clone. |
| 10 menit | **Review** | Kenapa `const` tidak menjamin immutability? Kapan garbage collector jalan? |

**Code demo:**

```typescript
// Value vs Reference
let a = 10;
let b = a;
b = 20;
console.log(a); // 10 — primitif copy value

let obj1 = { count: 0 };
let obj2 = obj1;
obj2.count = 99;
console.log(obj1.count); // 99 — object copy reference!

// Fix: immutability
let obj3 = { ...obj1, count: 50 };
console.log(obj1.count); // 99 (tidak termutasi)

// Memory leak
class Chat {
  private handler: (e: MessageEvent) => void;
  constructor() {
    this.handler = (e) => { /* ... */ };
    window.addEventListener('message', this.handler);
  }
  destroy() {
    window.removeEventListener('message', this.handler); // cleanup!
  }
}
```

**Checklist siswa:**
- [ ] Paham value vs reference
- [ ] Spread operator untuk immutability
- [ ] Identifikasi mutation bug
- [ ] Cleanup event listener / interval

---

## Sesi 2: Event Loop + Microtask vs Macrotask (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Event Loop** | JS single-threaded. Libuv multi-thread (I/O, crypto, DNS). Event loop phases: timers → pending callbacks → poll → check → close. Microtask (Promise) > Macrotask (setTimeout). |
| 45 menit | **Coding: Event Loop Order** | Demo: prediksi output `console.log` + Promise + setTimeout. Async/await adalah syntactic sugar atas Promise. |
| 20 menit | **Latihan: Async Order Quiz** | Siswa tebak output dari kode async. Diskusi kenapa urutannya begitu. |
| 10 menit | **Review** | Kenapa `await` tidak block thread? Bedanya microtask vs macrotask? |

**Code demo:**

```typescript
// Event Loop order
console.log('1'); // sync
setTimeout(() => console.log('2'), 0); // macrotask
Promise.resolve().then(() => console.log('3')); // microtask
console.log('4'); // sync
// Output: 1, 4, 3, 2

// Kenapa? sync dulu → microtask (Promise) → macrotask (setTimeout)

// Promise combinators
const [user, posts] = await Promise.all([
  fetchUser(id), fetchPosts(id),
]);

const result = await Promise.race([
  fetchFromServer(),
  new Promise((_, reject) => setTimeout(() => reject('Timeout'), 5000)),
]);
```

**Checklist siswa:**
- [ ] Prediksi output event loop
- [ ] Paham microtask vs macrotask
- [ ] Promise.all, allSettled, race
- [ ] async/await pattern

---

## Sesi 3: Worker Thread + Async Patterns + Memory Leak (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Worker Threads + Async Patterns** | Worker Thread untuk CPU-intensive (block event loop). Sequential vs parallel vs retry pattern. Memory leak detection. |
| 45 menit | **Coding: Worker Thread + Profiling** | Demo: heavy computation (fibonacci/loop) di main thread → UI freeze. Pindah ke Worker Thread. Show Memory tab di DevTools. |
| 20 menit | **Latihan: Fix Memory Leak** | Siswa dikasih app dengan memory leak (interval tanpa cleanup, event listener). Fix + verify di Memory tab. |
| 10 menit | **Review** | Kapan perlu Worker Thread? Bagaimana detect memory leak di production? |

**Code demo:**

```typescript
// Worker Thread
const worker = new Worker('./heavy-worker.js');
worker.postMessage({ num: 40 });
worker.onmessage = (event) => {
  console.log('Result:', event.data);
};
worker.onerror = (err) => console.error('Worker error:', err);

// heavy-worker.js
self.onmessage = (event) => {
  const result = fibonacci(event.data.num);
  self.postMessage(result);
};

// Retry pattern
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try { return await fetch(url); }
    catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

**Checklist siswa:**
- [ ] Worker thread untuk heavy task
- [ ] Main thread tidak ter-block
- [ ] Fix memory leak (interval, listener)
- [ ] Retry pattern

## Assessment

| Kriteria | Bobot |
|----------|-------|
| Stack, heap, value vs reference | 20% |
| Event loop + microtask/macrotask | 30% |
| Promise combinators + async patterns | 25% |
| Worker threads + memory leak | 25% |
