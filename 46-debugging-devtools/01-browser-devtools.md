# 1. Browser DevTools

> Durasi: 90 menit

## 1.1 Elements Panel

Inspect dan edit HTML/CSS secara live.

```typescript
// Contoh HTML yg bakal di-debug
const brokenLayout = `
  <div style="display: flex; gap: 8px;">
    <div style="flex: 1; padding: 16px;">Kiri</div>
    <div style="flex: 2; padding: 16px;">Tengah</div>
    <div style="padding: 16px;">Kanan</div>
  </div>
`;
document.body.innerHTML = brokenLayout;
```

**Fitur Elements:**
- **Inspect**: klik kanan → Inspect, atau Ctrl+Shift+C
- **Edit HTML**: double-click di Elements panel, atau right-click → Edit as HTML
- **Edit CSS**: klik style di Styles tab, ubah value langsung
- **Box Model**: lihat margin, border, padding, content di Computed tab
- **Force state**: right-click element → Force State → :hover, :focus, :active
- **Break on**: right-click → Break on → subtree modification / attribute modification / node removal

**Box Model Diagram:**

```
+-----------------------------+
|          Margin             |
|  +-----------------------+  |
|  |       Border          |  |
|  |  +-----------------+  |  |
|  |  |    Padding      |  |  |
|  |  |  +-----------+  |  |  |
|  |  |  |  Content  |  |  |  |
|  |  |  +-----------+  |  |  |
|  |  +-----------------+  |  |
|  +-----------------------+  |
+-----------------------------+
```

## 1.2 Console

Multipurpose debugging tool.

```typescript
const users = [
  { id: 1, name: "Budi", role: "admin" },
  { id: 2, name: "Ani", role: "user" },
  { id: 3, name: "Citra", role: "user" },
];

// Log basics
console.log("User data:", users);
console.warn("Deprecated API detected");
console.error("Failed to fetch user", new Error("Network error"));

// Table — tampilin array of objects
console.table(users);

// Dir — inspect object properties
console.dir(document.body);

// Group
console.group("User Processing");
users.forEach((u) => console.log(u.name));
console.groupEnd();

// Timing
console.time("fetch-users");
await fetch("/api/users");
console.timeEnd("fetch-users"); // "fetch-users: 245ms"

// Count
console.count("render"); // render: 1
console.count("render"); // render: 2

// Trace — lihat call stack
function a() { b(); }
function b() { console.trace("called from b"); }
a();
```

**Console Tips:**
- `$0` — refer ke element terakhir yg di-inspect
- `$()` — shortcut `document.querySelector()`
- `$$()` — shortcut `document.querySelectorAll()`
- `$_` — hasil evaluasi terakhir
- `copy(obj)` — copy object ke clipboard
- `monitor(functionName)` — log tiap panggilan function

## 1.3 Sources Panel

Breakpoints dan step-through debugging.

```typescript
// Contoh code untuk di-debug dgn breakpoint
async function processOrder(orderId: string): Promise<void> {
  console.log("Processing order", orderId);

  const user = await fetchUser(orderId);        // Line A
  const items = await fetchOrderItems(orderId);  // Line B
  const total = calculateTotal(items);           // Line C
  const discount = applyDiscount(total, user);   // Line D

  if (discount > 100000) {
    sendNotification(user.email, "Big discount!"); // Line E
  }

  await updateOrderStatus(orderId, "completed");   // Line F
}
```

**Breakpoint Types:**
| Type | Cara Set | Use Case |
|------|----------|----------|
| Line | Klik nomor baris | Pause di baris spesifik |
| Conditional | Right-click → Add conditional breakpoint | Pause kalo kondisi terpenuhi |
| DOM | Elements → Break on → subtree modif | Element berubah |
| XHR | Sources → XHR/Fetch Breakpoints | Request dikirim |
| Event Listener | Sources → Event Listener Breakpoints | Event specific (click, keydown) |

**Step Controls:**
| Button | Shortcut | Fungsi |
|--------|----------|--------|
| ▶ Resume | F8 | Lanjut sampai breakpoint berikutnya |
| ↘ Step over | F10 | Eksekusi baris, lompat ke baris berikutnya |
| ➡ Step into | F11 | Masuk ke function call |
| ⬆ Step out | Shift+F11 | Keluar dari function |
| 🔄 Restart frame | — | Ulangi dari awal function |

**Call Stack & Scope:**
- **Call Stack**: lihat urutan function calls yg menuju ke breakpoint
- **Scope**: lihat local, closure, global variables saat itu
- **Watch**: tambah expression untuk di-track value-nya

## 1.4 Network Panel

Analisis traffic HTTP/HTTPS.

```typescript
// Simulasi fetch yang lambat
async function loadDashboard(): Promise<void> {
  const [users, orders, analytics] = await Promise.all([
    fetch("/api/users?page=1"),             // Cek timing
    fetch("/api/orders", { signal: AbortSignal.timeout(5000) }), // Timeout
    fetch("/api/analytics/dashboard"),       // Mungkin slow query
  ]);

  // Check status
  if (!users.ok) throw new Error(`HTTP ${users.status}`);
}
```

**Network Tab Features:**

| Feature | Fungsi |
|---------|--------|
| Waterfall | Timeline tiap request — liat yg blocking |
| Status column | `200` OK, `304` Not Modified, `404`, `500` |
| Size column | Transfer size vs resource size |
| Time column | Total duration request |
| Filters | XHR, JS, CSS, Img, Media, Font, Doc, WS |
| Blocking | Right-click → Block request URL — simulasi failed load |
| Throttling | Simulasi Slow 3G, Fast 3G, Offline |
| Replay | Right-click → Replay XHR |
| Copy as Fetch | Copy sebagai `fetch()` call |

**Timing Breakdown:**
```
Queued                  0.05ms
Stalled                 2.34ms
DNS Lookup              1.12ms
Initial connection      3.45ms
SSL                     2.89ms
Request sent            0.12ms
Waiting (TTFB)        345.67ms    ← kritis
Content Download       12.34ms
```

TTFB (Time To First Byte) > 600ms biasanya perlu optimize backend.

## 1.5 Performance Panel

Rekam dan analisis runtime performance.

```typescript
// Contoh penyebab performa jelek
function renderLargeList(items: string[]): void {
  const container = document.getElementById("list")!;

  // ❌ Layout thrashing — forced reflow tiap iterasi
  items.forEach((item) => {
    const el = document.createElement("div");
    el.textContent = item;
    container.appendChild(el);
    console.log(container.offsetHeight); // forced reflow!
  });
}

// ✅ Batch operation
function renderLargeListFixed(items: string[]): void {
  const container = document.getElementById("list")!;
  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const el = document.createElement("div");
    el.textContent = item;
    fragment.appendChild(el);
  });

  container.appendChild(fragment); // single reflow
}
```

**Performance Panel Key Metrics:**
| Metric | Arti |
|--------|------|
| FPS | Frames Per Second — target 60fps |
| CPU | CPU usage — kalo 100% terus ada masalah |
| Layout Shift | Visual stability — Cumulative Layout Shift (CLS) |
| Long Tasks | Task > 50ms blocking main thread |
| Flame Chart | Visualisasi call stack per frame |

**Rekaman:**
1. Buka Performance panel
2. Klik ● Record
3. Lakukan action yg mau diukur
4. Klik ■ Stop
5. Analisis flame chart

## 1.6 Lighthouse

Audit otomatis untuk kualitas web app.

```typescript
// Lighthouse via CLI
// npm install -g lighthouse
// lighthouse https://example.com --view

// Lighthouse via Node.js
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

async function runAudit(url: string): Promise<void> {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = {
    logLevel: "info",
    output: "json",
    onlyCategories: ["performance", "accessibility", "seo", "best-practices"],
    port: chrome.port,
  };

  const result = await lighthouse(url, options);
  console.log("Performance:", result.lhr.categories.performance.score);
  console.log("Accessibility:", result.lhr.categories.accessibility.score);
  console.log("SEO:", result.lhr.categories.seo.score);
  console.log("Best Practices:", result.lhr.categories["best-practices"].score);

  await chrome.kill();
}
```

**Lighthouse Categories:**
| Category | Score Target | Berat |
|----------|-------------|-------|
| Performance | ≥ 90 | Largest Contentful Paint, First Input Delay, CLS |
| Accessibility | ≥ 90 | ARIA labels, contrast ratio, keyboard nav |
| Best Practices | ≥ 90 | HTTPS, no console errors, no vulnerabilities |
| SEO | ≥ 90 | Meta tags, viewport, crawlability |
| PWA | ≥ 80 | Service worker, manifest, offline |

## Latihan

1. **Debug Layout Broken** — Buat HTML dengan flex layout rusak (element overflow, wrong alignment). Pakai Elements panel buat diagnose dan fix tanpa reload.

2. **Find Slow API** — Buka web app (atau JSONPlaceholder) di Network panel. Identifikasi request paling lambat. Analisis waterfall — apa yg bikin lama? DNS? TTFB? Download?

3. **Audit with Lighthouse** — Run Lighthouse audit di blog/page favorit. Catat score tiap kategori. Tulis 3 rekomendasi improvement dari hasil audit.

4. **Console Mastery** — Buka console di halaman manapun. Coba: `$0`, `$()`, `$$()`, `copy()`, `console.table()`, `console.time()`. Dokumentasi hasilnya.

5. **Performance Record** — Rekam performance halaman. Identifikasi 1 long task. Jelaskan apa yg terjadi dan gimana cara fix-nya.
