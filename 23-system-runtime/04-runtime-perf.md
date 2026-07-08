# 04. Runtime Performance — Memory, GC, Profiling, V8 Internals

> **Level:** 📐 Intermediate | **Durasi:** 2 jam | **Topik:** Memory Management, GC, Memory Leaks, CPU Profiling, V8 Engine

---

## 🧠 Tujuan Pembelajaran

Setelah sesi ini, kamu bakal bisa:

- Membedakan stack vs heap memory dan pengaruhnya ke performa
- Menjelaskan cara kerja garbage collector V8 (mark & sweep, generational)
- Mendeteksi memory leak pake heapdump dan tools inspeksi
- Profiling CPU pake clinic.js / flamegraph
- Ngukur event loop lag buat deteksi bottleneck
- Memahami V8 JIT compiler, hidden classes, dan inline caching
- Nulis kode yang "V8-friendly" — optimal buat hidden classes

---

## 🗄 Stack vs Heap

Memory komputer itu ada 2 area utama buat nyimpen data:

**Stack** — memory buat data kecil + sementara.
- Primitives (number, string, boolean, null, undefined)
- Function call frames
- Cepet, otomatis dihapus pas function selesai
- Ukuran terbatas (stack overflow kalo recursion gila-gilaan)

```typescript
function greet(name: string) {
  const msg = "Halo " + name;  // msg di stack
  return msg;
}
// Pas greet selesai, msg otomatis ilang dari stack
```

**Heap** — memory buat data besar + umur panjang.
- Objects, arrays, functions (semua reference types)
- Lebih lambat dari stack
- Ukuran besar
- Harus dibersihin manual... atau pake **Garbage Collector**

```typescript
const user = { name: "Budi", age: 17 };
// user (reference) ada di stack
// { name: "Budi", age: 17 } ada di heap
```

---

## 🔗 Value vs Reference — Visual

Ini yang paling sering bikin bingung. Bedain:

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

---

## 📌 Pointer (Konsep)

JavaScript ga punya pointer explicit kayak C/C++, tapi **semua object pake pointer di belakang layar**.

```typescript
// Reference = pointer yang dibungkus aman
// Ga bisa lo manipulasi alamat memory langsung
// Tapi behavior-nya sama: pointing ke object yang sama

function updateName(user: { name: string }) {
  user.name = "Budi";  // Ngeubah object asli, bukan copy
}
```

Penting: ini beda bahasa. C/C++ lo bisa `*ptr = 5`. JS ngelindungin lo dari pointer arithmetic — lo ga bisa akses memory sembarangan (makanya lebih aman dari segi security).

---

## ♻️ Garbage Collector (GC)

GC = tukang sampah di memory. Ngehapus object yang udah ga dipake.

### Mark & Sweep (algoritma dasar V8)

```
1. MARK: Mulai dari root (global, local variables).
   Tandai semua object yang MASIH bisa diakses.

2. SWEEP: Hapus semua object yang GA ditandai.

Setelah sweep, memory yang dibebasin bisa dipake lagi.
```

**Contoh object jadi sampah:**

```typescript
function createUser() {
  const user = { name: "Budi" };
  return user;
}

const budi = createUser();
// 👆 user di dalem function masih dipake, karena budi nunjuk ke situ

budi = null;
// 👆 Sekarang object { name: "Budi" } GA ADA YANG NUNJUK
// GC bakal hapus ini di siklus berikutnya
```

### V8 Generational GC

V8 bagi memory jadi 2 generasi:

- **Young Generation** — object baru. Di-scan tiap saat (GC cepet).
- **Old Generation** — object yang selamat dari beberapa siklus GC. Jarang di-scan.

Kenapa perlu? Biar GC ga nge-scan SEMUA memory tiap saat — performa tetap lancar.

Konsep **generational hypothesis**: "Most objects die young." Sebagian besar object cuma dipake sebentar, jadi lebih efisien kalo young generation di-scan sering.

### Memory Leak

**Memory leak** terjadi kalo object GA pernah di-GC karena masih ada reference meskipun udah ga dipake.

```typescript
// Memory leak classic: event listener ga di-remove
class Chat {
  messages: string[] = [];
  
  constructor() {
    window.addEventListener('message', () => {
      this.messages.push('...');
    });
    // ❌ GA PERNAH di-remove → Chat object ga bisa di-GC
  }
}

// Fix: simpan reference listener, remove pas ga dipake
```

**Penyebab memory leak umum:**
1. **Event listeners ga di-remove** — object nge-hold reference ke callback
2. **Global variable kebanyakan** — ga pernah di-GC selama app jalan
3. **Closure yang nge-hold reference besar** — function inget scope luar
4. **Timer / interval ga dibersihin** — `setInterval` tanpa `clearInterval`
5. **Cache tanpa limit** — tambah terus tapi ga pernah di-prune

---

## 🔍 Deteksi Memory Leak — heapdump

Heapdump menghasilkan snapshot dari heap memory. Lo bisa compare dua snapshot buat nyari object yang bocor.

```bash
npm install heapdump
```

```typescript
import heapdump from 'heapdump';
import fs from 'fs';

// Trigger heapdump manual
app.get('/debug/heapdump', (req, res) => {
  heapdump.writeSnapshot('/tmp/heap-' + Date.now() + '.heapsnapshot', (err, filename) => {
    if (err) return res.status(500).send('Gagal');
    res.send(`Heapdump: ${filename}`);
  });
});

// Atau trigger dari signal
process.on('SIGUSR2', () => {
  heapdump.writeSnapshot('/tmp/heap-signal.heapsnapshot');
});
```

File `.heapsnapshot` bisa dibuka pake Chrome DevTools (Memory tab → Load) atau VS Code extension.

**Deteksi leak pake heap snapshot:**

1. Ambil snapshot A — pas aplikasi baru jalan
2. Lakuin action yang dicurigai (buka halaman, trigger fitur)
3. Ambil snapshot B — setelah action
4. Compare: filter "Detached" atau object yang jumlahnya naik signifikan
5. Kalo jumlah terus naik dan ga turun — kemungkinan leak

---

## 🔥 CPU Profiling — clinic.js / flamegraph

Clinic.js adalah toolkit profiling buat Node.js. Salah satu tools-nya: **flamegraph** buat visualisasi call stack.

```bash
npm install -g clinic

# Jalanin app dengan flamegraph
clinic flame -- node app.js

# Buka http://localhost:3000, lakuin action, matiin app
# Clinic bakal generate flamegraph.html — buka di browser
```

**Baca flamegraph:**
- Sumbu X: waktu sampling
- Sumbu Y: call stack depth
- Lebar bar: seberapa sering function itu muncul di stack
- Bar yang lebar = hot path → kandidat optimasi

**Deteksi blocking code pake clinic:**
```
clinic bubbleprof -- node app.js
clinic doctor -- node app.js
```

`clinic doctor` ngasih diagnosis otomatis — kategorisasi masalah (event loop delay, GC, I/O bottleneck).

---

## 📊 Performance Monitoring

### Event Loop Lag

Kalo event loop terlalu sibuk, request jadi lambat. Ukur pake **event loop lag**:

```bash
npm install @looker/lookout
```

Lookout monitor event loop lag dan ngasih alert kalo melewati threshold.

```typescript
import lookout from '@looker/lookout';

// Monitor dengan threshold 50ms
const monitor = lookout({
  lagThreshold: 50,   // ms — kalo lag >50, trigger callback
  interval: 1000,      // cek tiap 1 detik
});

monitor.on('lag', (lag: number) => {
  console.warn(`Event loop lag: ${lag}ms`);
  // Bisa kirim alert ke Slack, email, etc.
});
```

**Pengukuran event loop lag manual:**

```typescript
function measureLag() {
  const start = Date.now();
  
  setImmediate(() => {
    const lag = Date.now() - start - 1; // 1ms overhead setImmediate
    console.log(`Event loop lag: ${lag}ms`);
    
    if (lag > 50) {
      console.warn('⚠️ Event loop terlalu sibuk!');
    }
  });
}

setInterval(measureLag, 2000);
```

---

## ⚙️ V8 Engine Internals

V8 adalah JavaScript engine yang pake Node.js. Performa kode lo tergantung gimana V8 nge-optimize kode.

### JIT Compiler (Just-In-Time)

V8 ga nge-parse dan ngejalanin JavaScript langsung. Ada pipeline:

```
Source Code → Parser → AST → Interpreter (Ignition) → Bytecode

Hot code? → Compiler (TurboFan) → Optimized Machine Code (x86/ARM)
```

- Awalnya: kode di-interpret (cepet startup)
- Kalo function sering dipanggil (hot): di-compile ke machine code (cepet eksekusi)
- Kalo asumsi optimization salah: **deoptimize** (balik ke bytecode)

### Hidden Classes

V8 internally ngasih tiap object **hidden class** (map) yang ngedeskripsiin shape-nya.

```typescript
function Point(x: number, y: number) {
  this.x = x;
  this.y = y;
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
// p1 dan p2 pake hidden class YANG SAMA — optimal
```

**Kode yang bikin hidden class berantakan:**

```typescript
// ❌ BURUK — ini bikin hidden class baru tiap kali
const obj = {};
obj.x = 10;    // Hidden class 1
obj.y = 20;    // Hidden class 2 (transisi)
obj.z = 30;    // Hidden class 3 (transisi)

// ✅ BAIK — define semua property di constructor
const obj = { x: 10, y: 20, z: 30 };
// Satu hidden class langsung
```

### Inline Caching (IC)

V8 nyatet tipe object yang pernah dipake di suatu properti akses. Kalo tipe-nya konsisten, dia optimize jadi langsung akses memory tanpa lookup.

```typescript
function getName(obj: any) {
  return obj.name;  // V8 catet: obj selalu Point, name di offset X
}

getName({ name: 'A' });  // IC: catet tipe
getName({ name: 'B' });  // IC: cocok → optimize
getName(42);             // Deoptimize! Tipe beda
```

**Mono-morphic vs Polymorphic vs Megamorphic:**

| Site Type | Kecepatan | Contoh |
|-----------|-----------|--------|
| Monomorphic (1 tipe) | ⚡ Tercepat | Selalu pake obj yang sama |
| Polymorphic (2-4 tipe) | ⚡ Cepet | Kadang Point, kadang Vector |
| Megamorphic (>4 tipe) | 🐢 Lambat | Banyak tipe acak |

---

## ✅ Tips Nulis Kode V8-Friendly

1. **Initialize object properties di constructor** — biar hidden class konsisten
2. **Jangan hapus/add property setelah object dibuat** — ini bikin hidden class baru
3. **Pake array dengan tipe yang konsisten** — `[1, 2, 3]` bukan `[1, 'a', true]`
4. **Function monomorphic** — panggil function dengan argumen tipe yang sama
5. **Hindari `delete`** — delete bikin hidden class baru, slow path
6. **Pake `for` loop instead of `forEach`** buat performa kritis

---

## 📝 Latihan

1. **Memory leak detector:** Cari potential memory leak di kode class Chat di atas. Benerin.

2. **Heap snapshot comparison:** Tambahin heapdump ke aplikasi Express, ambil snapshot sebelum dan sesudah trigger leak, compare pake Chrome DevTools.

3. **CPU flamegraph:** Inject CPU-heavy function ke route Express, jalanin clinic flamegraph, identifikasi mana function yang jadi bottleneck.

4. **Event loop lag monitor:** Bikin monitoring sederhana yang log event loop lag tiap 1 detik dan alert kalo >100ms.

5. **Hidden class optimization:** Cari kode yang bikin hidden class berantakan (polymorphic/megamorphic), refactor jadi monomorphic. Ukur perbedaan performa.

6. **Memory pool:** Bikin object pool pattern buat mengurangi GC pressure di aplikasi high-throughput.

---

## 📖 Referensi

- [V8: How JavaScript works](https://v8.dev/docs)
- [Chrome DevTools: Memory Inspector](https://developer.chrome.com/docs/devtools/memory-problems/)
- [clinic.js Documentation](https://clinicjs.org/documentation/)
- [Node.js: Diagnostics Guide](https://nodejs.org/en/docs/guides/diagnostics/)
- [V8 Hidden Classes — Mathias Bynens](https://mathiasbynens.be/notes/shapes-ics)

---

**Kembali ke:** [README (Index)](README.md)
**Sebelumnya:** [03. Multithreading](03-multithreading.md)
