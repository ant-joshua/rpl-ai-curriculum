# 03. Multithreading — Worker, Cluster, Child Process

> **Level:** 📐 Intermediate | **Durasi:** 2 jam | **Topik:** Worker Threads, Cluster Module, Child Process, CPU-bound

---

## 🧠 Tujuan Pembelajaran

Setelah sesi ini, kamu bakal bisa:

- Membedakan Worker Threads vs Cluster vs Child Process — kapan pake yang mana
- Mindahin CPU-intensive task ke Worker Thread biar event loop ga kena blockage
- Paham soal thread pool libuv dan jenis tugas yang pake itu
- Setup cluster forking buat maximize multi-core CPU
- Pake child_process exec, spawn, fork untuk running external commands
- Ngomunikasiin data antara main thread dan worker via message passing

---

## Mitos: "JavaScript itu Single-Threaded"

**Mitos:** "JavaScript itu single-threaded."
**Fakta:** JavaScript **language** single-threaded. Tapi **runtime** (Node.js, browser) pake banyak thread.

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

**Contoh block event loop:**

```typescript
// ❌ INI BAKAL BLOCK EVENT LOOP — semua request lain nunggu
app.get('/heavy', (req, res) => {
  const result = heavyComputation(1000000000); // 1M iterations
  res.json({ result });
});

// ✅ PAKE WORKER THREAD
import { Worker } from 'worker_threads';

app.get('/heavy', (req, res) => {
  const worker = new Worker('./heavy-worker.js');
  worker.on('message', (result) => {
    res.json({ result });
  });
});
```

---

## 🧵 Worker Threads — Untuk CPU-bound Task

Worker Threads adalah fitur Node.js (tersedia sejak v10) yang ngasih lo kemampuan bikin thread JavaScript terpisah. Setiap worker punya V8 instance sendiri, event loop sendiri, dan memory sendiri.

**Kapan pake Worker Thread:**
- Image processing (resize, compress)
- Data parsing (CSV/XML besar)
- Hashing / encryption (bcrypt, scrypt)
- Komputasi berat (Fibonacci, matrix multiplication)
- JSON.stringify/parse object raksasa

### Basic Worker Thread

**File: heavy-worker.js**

```typescript
import { parentPort } from 'worker_threads';

// Terima pesan dari main thread
parentPort?.on('message', (data) => {
  const result = heavyComputation(data);
  
  // Kirim hasil balik ke main thread
  parentPort?.postMessage(result);
});

function heavyComputation(n: number): number {
  let result = 0;
  for (let i = 0; i < n; i++) {
    result += Math.sqrt(i) * Math.sin(i);
  }
  return result;
}
```

**File: main.js**

```typescript
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workerPath = path.join(__dirname, 'heavy-worker.js');

function runHeavy(n: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath);
    
    worker.postMessage(n); // Kirim data ke worker
    
    worker.on('message', resolve); // Terima hasil
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker berhenti dengan code ${code}`));
      }
    });
  });
}

// Pake di route Express
app.get('/compute', async (req, res) => {
  const result = await runHeavy(1_000_000_000);
  res.json({ result });
});
```

### Worker Communication (parentPort)

Main thread ↔ Worker komunikasi via **message passing** — ngirim data lewat `postMessage`, nerima lewat event `message`.

```
┌──────────────────┐          postMessage()          ┌──────────────────┐
│   Main Thread    │ ──────────────────────────────→  │    Worker        │
│                  │                                   │                  │
│  new Worker()    │ ←──────────────────────────────  │  parentPort      │
│  worker.on()     │          postMessage()            │  .on('message')  │
└──────────────────┘                                   └──────────────────┘
```

Data yang dikirim lewat postMessage di-*clone* (struktur clone algorithm), bukan shared reference. Jadi modifikasi di worker ga ngefek ke main thread.

```typescript
// Worker
parentPort?.postMessage({ result: 42, status: 'done' });

// Main thread
worker.on('message', (msg) => {
  console.log(msg.result); // 42
  console.log(msg.status); // 'done'
});
```

---

## 🗂 Thread Pool (libuv)

Node.js punya **internal thread pool** yang dikelola libuv. Default: **4 threads**. Bisa diubah lewat `UV_THREADPOOL_SIZE`.

```bash
# Naikin thread pool jadi 8
UV_THREADPOOL_SIZE=8 node app.js
```

**Operasi yang pake thread pool:**

| Operasi | Async? | Pake Thread Pool? |
|---------|--------|-------------------|
| `fs.readFile` | ✅ | ✅ |
| `fs.writeFile` | ✅ | ✅ |
| `crypto.pbkdf2` | ✅ | ✅ |
| `crypto.randomBytes` | ✅ | ✅ |
| `dns.lookup` | ✅ | ✅ |
| `zlib.gzip` | ✅ | ✅ |
| `fetch` / `http.request` | ✅ | ❌ (event loop) |

**Kapan perlu naikin thread pool:** Kalo lo banyak pake crypto/file I/O paralel dan liat bottleneck. Tapi hati-hati — tiap thread pake memory sendiri.

---

## 🔄 Cluster Module — Multi-Process buat Multi-Core

Node.js jalan di 1 CPU doang default. Cluster module ngeloopin lo make **semua CPU** dengan forking process.

```typescript
import cluster from 'cluster';
import { cpus } from 'os';
import http from 'http';

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork worker buat tiap CPU
  const numCPUs = cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} mati`);
    cluster.fork(); // Auto-restart kalo mati
  });
} else {
  // Worker — jalanin server
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Hello from worker ' + process.pid);
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```

**Cara kerja cluster:**
1. Primary process listen di port 8000
2. OS distribute incoming connections ke worker secara round-robin (default Linux)
3. Tiap worker punya event loop sendiri
4. Kalo satu worker mati, yang lain tetep jalan

**Kapan pake Cluster:**
- HTTP server yang pengen manfaatkan semua CPU
- Load balancing built-in tanpa reverse proxy
- Zero-downtime restart (rolling restart workers)

**Batasan Cluster:**
- Sharing memory ga semudah Worker Threads
- Butuh lebih banyak memory (tiap worker V8 copy-an sendiri)
- Komunikasi antar worker butuh message passing via primary

---

## ⚙️ Child Process — exec, spawn, fork

Kadang lo perlu jalanin **program lain** dari Node.js — Python script, shell command, binary.

### exec — tangkap output lengkap

Ngejalanin command dan dapetin output sebagai buffer (pas buat command kecil).

```typescript
import { exec } from 'child_process';

exec('ls -la', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout:\n${stdout}`);
});
```

**Peringatan:** `exec` buffer **semua output** di memory. Jangan pake buat command yang output-nya gede (file besar, stream panjang).

### spawn — stream output

Ngejalanin command dan dapetin output sebagai stream. Cocok buat output gede.

```typescript
import { spawn } from 'child_process';

const child = spawn('find', ['/', '-name', '*.log']);

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

child.on('close', (code) => {
  console.log(`Child process exit dengan code ${code}`);
});
```

### fork — child process khusus Node.js

Mirip spawn tapi bikin child process yang jalanin module Node.js. Bisa komunikasi pake IPC (inter-process communication).

```typescript
import { fork } from 'child_process';

// child.js dijalankan sebagai child process
const child = fork('./child-process.js');

child.on('message', (msg) => {
  console.log('Dari child:', msg);
});

child.send({ hello: 'dari parent' });
```

---

## 🎯 Kapan Pake Apa?

| Situasi | Solusi | Kenapa |
|---------|--------|--------|
| CPU-heavy task (resize gambar, parse CSV) | **Worker Threads** | Shared memory ga ribet, pake V8 barengan |
| HTTP server skalabilitas multi-core | **Cluster** | Built-in load balancing, zero-downtime restart |
| Jalanin Python script dari Node | **spawn** | Stream output, ga buffer semua |
| Butuh hasil command cepat (ls, git status) | **exec** | Simple, panggil callback langsung |
| Child process khusus Node yang perlu komunikasi | **fork** | IPC built-in via send/on('message') |
| File I/O / DNS / Crypto banyak paralel | **Naikin UV_THREADPOOL_SIZE** | Libuv pool default 4, bisa bottleneck |
| Background job (email, report generation) | **Worker Thread atau queue system** | Ga blok main thread |

---

## ⚠️ Common Pitfalls

### 1. Pake Worker Thread buat I/O task — mubazir
I/O udah ditangani libuv. Worker Thread khusus buat CPU-bound.

### 2. Lupa handle error di Worker
Kalo worker throw error dan ga di-handle, process bisa mati.

### 3. Fork terlalu banyak worker di cluster
Tiap worker = 1 V8 instance = ~30-40MB. Fork secukupnya (sesuai jumlah CPU).

### 4. exec dengan input user — risk command injection
```typescript
// ❌ DANGER: user bisa inject command
exec(`rm -rf ${userInput}`);

// ✅ Pake spawn dengan array argumen (aman)
spawn('rm', ['-rf', userInput]);
```

### 5. Lupa kill worker yang udah selesai
Worker tetep jalan di background sampe di-explicit kill atau exit.

---

## 📝 Latihan

1. **Heavy computation:** Simulasi CPU-bound task (loop 1M) di main thread. Ukur berapa lama block event loop. Trus pindahin ke Worker Thread.

2. **Worker pool:** Bikin pool yang bisa manage beberapa Worker Thread sekaligus. Setiap request dapet worker dari pool, kalo abis antri.

3. **Cluster setup:** Bikin HTTP server pake cluster module yang fork sesuai jumlah CPU. Tes pake `wrk` atau `ab`.

4. **Child process:** Jalanin perintah shell dari Node.js pake spawn, stream output-nya ke terminal.

5. **Compare performance:** Ukur perbedaan waktu eksekusi tugas berat di main thread vs Worker Thread vs Cluster (fork). Cari tau mana yang paling cocok buat skenario lo.

---

## 📖 Referensi

- [Node.js: Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Node.js: Cluster Module](https://nodejs.org/api/cluster.html)
- [Node.js: Child Process](https://nodejs.org/api/child_process.html)
- [Libuv Design Overview](https://docs.libuv.org/en/v1.x/design.html)

---

**Lanjut ke:** [04. Runtime Performance](04-runtime-perf.md) → Memory, GC, Profiling, V8 Internals.
**Sebelumnya:** [02. Async Patterns](02-async-patterns.md)
