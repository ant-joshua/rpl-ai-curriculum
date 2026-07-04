# 🧠 Cheatsheet: System Runtime & Async Programming

> Referensi cepet — 1 halaman.

## Topik Utama
- **Stack vs Heap**: Stack (primitif, call frames, cepet, terbatas); Heap (object, array, lambat, besar)
- **Value vs Reference**: primitif copy value, object copy reference (mutasi berbahaya)
- **Garbage Collector**: Mark & Sweep, Generational (Young + Old), memory leak kalo ada reference dangling
- **Event Loop**: timers → pending callbacks → poll → check → close; microtask (Promise) > macrotask (setTimeout)
- **Single Thread Myth**: JS single-threaded, runtime (libuv) multi-thread (file I/O, crypto, DNS)
- **Worker Threads**: CPU-intensive task di thread terpisah
- **Async Evolution**: Callback → Promise → async/await
- **Promise Combinators**: `all`, `allSettled`, `race`, `any`
- **Async Patterns**: Sequential (A+B+C), Parallel (Promise.all), Retry

## Command / Sintaks Penting

```typescript
// Event Loop — urutan eksekusi
console.log('1');                          // sync
setTimeout(() => console.log('2'), 0);     // macrotask
Promise.resolve().then(() => console.log('3')); // microtask
console.log('4');                          // sync
// Output: 1, 4, 3, 2

// Promise.all (parallel)
const [user, posts] = await Promise.all([
  fetchUser(id), fetchPosts(id),
]);

// Promise.race (timeout)
const result = await Promise.race([
  fetchFromServer(),
  new Promise((_, reject) => setTimeout(() => reject('Timeout'), 5000)),
]);

// Worker Thread
const worker = new Worker('./heavy-worker.js');
worker.postMessage(data);
worker.on('message', (result) => { ... });
```

```typescript
// Memory leak fix
class Chat {
  private handler: (e: MessageEvent) => void;
  constructor() {
    this.handler = (e) => { /* ... */ };
    window.addEventListener('message', this.handler);
  }
  destroy() {
    window.removeEventListener('message', this.handler);
  }
}
```

## Tips & Trik
- **Jangan block event loop** — CPU-heavy task pake Worker Thread.
- **I/O-bound aman** — fetch, DB query, file read — libvu urus thread pool.
- **`await` bukan block thread** — cuma pause function, event loop jalan terus.
- **Microtask > Macrotask** — Promise `.then()` jalan SEBELUM setTimeout.
- **Immutability** — spread operator `{...obj}` biar ga termutasi.

## Common Mistakes
❌ Callback hell — pake async/await biar linear.
❌ Lupa cleanup event listener / interval — memory leak.
❌ `Promise.all` tanpa `catch` — 1 reject gagal semua. Pake `allSettled` kalo perlu.
❌ Async function tanpa `await` — fire-and-forget, error unhandled.
❌ Heavy computation di main thread — semua request lain ngantri.

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
- [Node.js Event Loop Docs](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [MDN Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop)
