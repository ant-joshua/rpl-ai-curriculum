# 02. Async Patterns — Promise & async/await Deep Dive

> **Level:** 📐 Intermediate | **Durasi:** 2 jam | **Topik:** Promise Combinators, async/await, Error Handling, Stream

---

## 🧠 Tujuan Pembelajaran

Setelah sesi ini, kamu bakal bisa:

- Menggunakan Promise combinators (all, allSettled, race, any) di skenario nyata
- Nulis async/await yang bersih dengan error handling yang bener
- Memahami beda sequential vs parallel execution
- Nge-refactor callback hell ke Promise chain lalu ke async/await
- Paham Promise internals — executor jalan sync, .then() microtask
- Nulis retry pattern dan async iterator dengan bener

---

## Kenapa Async Penting?

Tanpa async, kode lo jalan **sequential** — satu per satu, nunggu yang sebelumnya selesai.

```typescript
// ❌ Synchronous (blocking)
const data = fs.readFileSync('file.txt', 'utf-8');
// Baris ini NUNGGU file selesai dibaca
// Selagi nunggu, aplikasi lo BEKU
console.log(data);
```

Dengan async, sistem bisa kerja LAIN sambil nunggu:

```typescript
// ✅ Async (non-blocking)
fs.readFile('file.txt', 'utf-8', (err, data) => {
  console.log(data);
});
// Baris ini LANGSUNG lanjut, ga nunggu file dibaca
// readFile dikirim ke libuv thread pool
// Pas selesai, callback masuk ke event loop
```

---

## Callback → Promise → async/await (Evolusi)

**Callback (sekarang udah jarang dipake langsung):**

```typescript
getUser(1, (err, user) => {
  if (err) return console.error(err);
  getPosts(user.id, (err, posts) => {
    if (err) return console.error(err);
    getComments(posts[0].id, (err, comments) => {
      if (err) return console.error(err);
      console.log(comments);
      // 👇 Bayangin kalo nested 5 level
      // Ini namanya CALLBACK HELL
    });
  });
});
```

**Promise (nge-flat chain):**

```typescript
getUser(1)
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .then(comments => console.log(comments))
  .catch(err => console.error(err));
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

## 🔬 Promise Internals

Promise itu Cuma state machine dengan 3 state:

```
Pending ──> Fulfilled (resolve)
Pending ──> Rejected (reject)
Fulfilled ──> (udah final, ga bisa balik)
Rejected ──> (udah final)
```

**Promise sederhana dari awal:**

```typescript
const myPromise = new Promise<string>((resolve, reject) => {
  // Ini executor — jalan SEGERA pas Promise dibuat
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve("Selesai!");
    } else {
      reject(new Error("Gagal!"));
    }
  }, 1000);
});

myPromise
  .then(result => console.log(result))  // Microtask
  .catch(err => console.error(err))
  .finally(() => console.log("Always")); // Jalan apapun hasilnya
```

**PENTING:** Promise dibuat, executornya jalan SEKARANG juga (synchronous). Yang async cuma `.then()` callbacks.

```typescript
console.log('1');
const p = new Promise(resolve => {
  console.log('2');  // ← Jalan sync di executor
  resolve('3');
});
p.then(console.log); // ← .then itu microtask, jalan belakangan
console.log('4');
// Output: 1, 2, 4, 3
```

---

## async/await Under the Hood

`await` itu cuma syntactic sugar buat Promise.then().

```typescript
// Lo nulis:
async function fetchData() {
  const data = await fetch('/api/data');
  return data.json();
}

// Sebenernya compiler ngubah jadi:
function fetchData() {
  return fetch('/api/data').then(data => data.json());
}
```

**await menghentikan function, bukan thread:**

```typescript
async function getUsers() {
  const response = await fetch('/api/users');
  // 👆 Pas await, getUsers pause
  // Tapi event loop jalan terus
  // Thread bebas ngelayani request LAIN
  
  const data = await response.json();
  return data;
}
```

**Error handling dengan async/await:**

```typescript
// ❌ Ini ga akan catch error yang di-throw:
async function broken() {
  throw new Error("Oops"); // Promise.reject()
  // Tapi ga ada yang nangkep
}
broken(); // Unhandled Promise rejection

// ✅ Pake .catch atau try/catch:
async function fixed() {
  try {
    await somethingRisky();
  } catch (err) {
    console.error("Ketangkep:", err);
  }
}
```

---

## 🧩 Promise Combinators

### Promise.all — semua berhasil atau gagal total

Tunggu SEMUA Promise selesai. Kalo 1 reject, semua langsung gagal.

```typescript
const [user, posts, comments] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
  fetchComments(id),
]);
// Semua jalan PARALEL
// Total waktu = paling lambat dari 3
```

**Use case:** Dashboard yang butuh data dari 3 endpoint berbeda — ga ada gunanya kalo salah satu gagal.

**PITFALL:** Promise.all **fail-fast**. Kalo 1 reject, hasil yang lain ilang. Kalo lo butuh hasil parsial, pake `allSettled`.

### Promise.allSettled — catat hasil masing-masing

Tunggu semua, catet hasil tiap Promise terlepas dari gagal/berhasil.

```typescript
const results = await Promise.allSettled([
  fetchPrimaryData(),
  fetchBackupData(),  // Mungkin gagal
]);

results.forEach(r => {
  if (r.status === 'fulfilled') {
    console.log('Berhasil:', r.value);
  } else {
    console.log('Gagal:', r.reason);
  }
});
```

**Use case:** Batch job dimana lo mau tau mana yang gagal tanpa menggagalkan sisanya.

### Promise.race — ambil yang pertama selesai

Siapapun selesai duluan, dialah pemenangnya.

```typescript
const result = await Promise.race([
  fetchFromServer(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout!')), 5000)
  ),
]);
// Kalo server > 5 detik, timeout
```

**Use case:** Timeout handler, atau pake multiple source ambil yang paling cepet respon.

### Promise.any — ambil yang pertama BERHASIL

Mirip race, tapi ignore rejection. Cari yang pertama fulfilled.

```typescript
const fastest = await Promise.any([
  fetchFromCDN(),
  fetchFromOrigin(),
  fetchFromBackup(),
]);
// Ambil yang paling cepet respon
```

**Use case:** Multiple sumber data, ambil yang paling cepet available.

---

## 🔄 Sequential vs Parallel

**Sequential (satu-satu, total = A + B + C):**

```typescript
const a = await taskA();  // 2 detik
const b = await taskB();  // 2 detik
const c = await taskC();  // 2 detik
// Total: 6 detik
```

Pake sequential kalo:
- Task B butuh hasil dari Task A
- Resource terbatas (koneksi DB terbatas)
- Mau ngehindarin race condition

**Parallel (barengan, total = max(A, B, C)):**

```typescript
const [a, b, c] = await Promise.all([
  taskA(),  // 2 detik
  taskB(),  // 2 detik
  taskC(),  // 2 detik
]);
// Total: ~2 detik
```

Pake parallel kalo:
- Task independent, ga saling butuh
- Mau performa cepet
- Resource cukup (bukan bottleneck)

---

## 🔁 Retry Pattern

Gagal? Coba ulang. Tapi jangan langsung — pake **exponential backoff**.

```typescript
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Gagal, coba lagi (${i + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      // Exponential backoff: 1s, 2s, 4s
    }
  }
  throw new Error('Ga pernah berhasil');
}
```

**Kenapa exponential backoff?** Biaya server ga kewalahan kalo semua klien retry barengan (thundering herd problem).

---

## 🔄 Async Iterator & Batch Processing

Async iterator berguna buat proses data stream yang gede — ga feasible loading semua ke memory.

**Batch processing pattern:**

```typescript
async function processInBatches(items: string[]) {
  const batchSize = 5;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(item => processItem(item))
    );
    console.log(`Batch ${i / batchSize + 1} selesai`);
  }
}
```

**Stream handling dengan async iterable:**

```typescript
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

async function processFileLineByLine(path: string) {
  const stream = createReadStream(path);
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    // Proses tiap baris tanpa loading semua file ke memory
    console.log('Line:', line);
  }
}
```

---

## ⚠️ Common Pitfalls

### 1. Sequential padahal harus parallel
```typescript
// ❌ SALAH: await satu per satu, 6 detik total
const user = await fetchUser(id);
const posts = await fetchPosts(id);

// ✅ BENAR: parallel, ~2 detik
const [user, posts] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
]);
```

### 2. Lupa catch error di async function
```typescript
// ❌ Unhandled Promise rejection
app.get('/data', async (req, res) => {
  const data = await fetch('/api'); // Kalo reject → crash
  res.json(data);
});

// ✅ Handle error
app.get('/data', async (req, res) => {
  try {
    const data = await fetch('/api');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal' });
  }
});
```

### 3. Gagal paham bahwa Promise executor itu sync
```typescript
console.log('start');
new Promise((resolve) => {
  console.log('executor'); // ← Ini sync, jalan SEKARANG
  resolve();
});
console.log('end');
// Output: start → executor → end (bukan start → end → executor)
```

---

## 📝 Latihan

1. **Callback → async/await refactor:** Ubah callback hell 3 level jadi async/await:
   ```typescript
   // Callback hell:
   getUser(1, (err, user) => {
     getOrders(user.id, (err, orders) => {
       getDetails(orders[0].id, (err, details) => {
         console.log(details);
       });
     });
   });
   ```

2. **Promise combinator:** Dari 4 API calls, jalankan paralel, tapi kalo salah satu gagal, tetap ambil yang berhasil. Pake combinator yang tepat.

3. **Retry pattern:** Bikin fungsi `fetchJSON` yang retry 3 kali dengan exponential backoff kalo gagal.

4. **Race condition detector:** Kode dibawah punya race condition. Cari dan benerin:
   ```typescript
   let data: any;
   fetch('/api/users').then(r => r.json()).then(d => data = d);
   fetch('/api/posts').then(r => r.json()).then(d => data = d);
   // Data siapa yang kebaca di sini?
   ```

5. **Batch processor:** Bikin fungsi yang proses 1000 item pake batch size 10, setiap batch jalan parallel.

---

## 📖 Referensi

- [MDN: Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN: async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [Node.js: Stream](https://nodejs.org/api/stream.html)

---

**Lanjut ke:** [03. Multithreading](03-multithreading.md) → Worker Threads, Cluster, Child Process.
**Sebelumnya:** [01. Event Loop](01-event-loop.md)
