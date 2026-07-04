# 2. VS Code Debugger

> Durasi: 90 menit

## 2.1 Launch Configuration

Setup debugger di VS Code.

**`.vscode/launch.json`:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Node.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/index.js",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "processId": "${command:PickProcess}",
      "restart": true,
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app"
    },
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--testTimeout", "30000"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug with nodemon",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "nodemon",
      "args": ["--exec", "node", "--inspect-brk", "dist/index.js"],
      "restart": true,
      "console": "integratedTerminal"
    }
  ]
}
```

**Launch vs Attach:**

| Mode | Kapan Pakai |
|------|-------------|
| `launch` | VS Code yg jalanin program (start debugging) |
| `attach` | Program udah jalan — tinggal sambung debugger |

**Key Config Fields:**

| Field | Fungsi |
|-------|--------|
| `program` | Entry point file |
| `preLaunchTask` | Task yg dijalankan sebelum debug (misal: compile) |
| `outFiles` | Lokasi output JS untuk source maps |
| `sourceMaps` | Enable source maps — biar bisa debug .ts asli |
| `skipFiles` | File yg di-skip pas step (biar ga masuk node_modules) |
| `restart` | Restart otomatis pas file berubah (kombinasi nodemon) |
| `envFile` | File `.env` untuk environment variables |

## 2.2 Breakpoint Types

VS Code support 6 jenis breakpoint.

```typescript
// Contoh code untuk breakpoint demo

// 1. LINE BREAKPOINT — klik kiri di gutter
function calculateTotal(items: { price: number; qty: number }[]): number {
  let sum = 0;
  for (const item of items) {  // ← line breakpoint di sini
    sum += item.price * item.qty;
  }
  return sum;
}

// 2. LOGPOINT — log tanpa pause
function processPayment(amount: number): string {
  // Logpoint: "Processing payment: ${amount}"
  // Hasil console tanpa stop eksekusi
  const formatted = `Rp ${amount.toLocaleString("id-ID")}`;
  return `Paid: ${formatted}`;
}

// 3. CONDITIONAL BREAKPOINT
function findUser(id: number): User | null {
  // Right-click → Add Conditional Breakpoint
  // Condition: id < 0
  // Hanya pause kalo id negatif (invalid)
  return users.find((u) => u.id === id) ?? null;
}

// 4. HIT COUNT BREAKPOINT
function processBatch(items: string[]): void {
  for (let i = 0; i < items.length; i++) {
    // Hit count: 3
    // Pause pas iterasi ke-3
    console.log(`Processing ${items[i]}`);
  }
}

// 5. FUNCTION BREAKPOINT — set di Breakpoints panel
function sendEmail(to: string, subject: string): void {
  // Function breakpoint: sendEmail
  // Pause tiap kali sendEmail dipanggil
  console.log(`Sending email to ${to}: ${subject}`);
}

// 6. INLINE BREAKPOINT — break di tengah expression
const result = someAsyncFunction(); // ← inline breakpoint di dalam expression
```

**Breakpoint Summary Table:**

| Type | Cara Set | Use Case |
|------|----------|----------|
| Line | Klik gutter | Pause di baris spesifik |
| Logpoint | Right-click → Logpoint | Debug tanpa pause ("printf debugging") |
| Conditional | Right-click → Conditional | Pause kalo condition `true` |
| Hit Count | Right-click → Hit Count | Pause pas iterasi ke-n |
| Function | Breakpoints panel → Tambah | Set breakpoint di function manapun |
| Inline | Shift+F9 | Break di tengah expression |

## 2.3 Debug Console

Evaluasi expression dan execute command saat debug.

```typescript
// Saat paused di breakpoint, bisa eval di Debug Console:

// 1. Cek nilai variable
// > user.name
// "Budi"

// 2. Execute function
// > calculateTotal(items)
// 250000

// 3. Modifikasi value
// > user.role = "admin"
// "admin"

// 4. Async expression
// > await fetchUser(1)
// { id: 1, name: "Budi" }

// 5. Import dan panggil
// > require("lodash").cloneDeep(items)
// [...]

// 6. Error handling
// > try { JSON.parse(invalid) } catch(e) { e.message }
// "Unexpected token"
```

**Shortcuts:**

| Shortcut | Fungsi |
|----------|--------|
| `F5` | Start / Continue debug |
| `Shift+F5` | Stop debug |
| `F10` | Step over |
| `F11` | Step into |
| `Shift+F11` | Step out |
| `Ctrl+Shift+F9` | Delete all breakpoints |
| `Ctrl+F5` | Start without debugging |

## 2.4 Watch, Variables, Call Stack

Panel penting di Debug view.

```typescript
interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped";
}

async function processOrder(orderId: string): Promise<void> {
  const order = await fetchOrder(orderId); // Pause di sini
  // Di Debug panel:
  //   VARIABLES: order = { id: "ORD-001", userId: "USR-1", ... }
  //   WATCH:
  //     - order.items.length
  //     - order.status === "pending"
  //     - typeof order.total
  //   CALL STACK:
  //     - processOrder (this file)
  //     - handleRequest (server.ts:45)
  //     - router.handle (router.ts:120)
  //     - <anonymous> (server.ts:10)

  const user = await fetchUser(order.userId);
  // Sekarang CALL STACK bertambah 1 frame lagi

  const success = await executePayment(order, user);
  if (!success) {
    throw new Error("Payment failed");
  }
}
```

**Watch Expressions:**
- Bisa pake expression kompleks: `items.reduce((s,i) => s + i.price, 0)`
- Method chaining: `users.filter(u => u.active).map(u => u.name)`
- Type check: `typeof x === "string" ? x.length : "N/A"`

**Variables Panel:**
- **Local**: variable dalam scope function saat ini
- **Closure**: variable dari outer function yg di-capture
- **Global**: variable global (window/globalThis)
- **Module**: variable module scope

## 2.5 Debug React

React DevTools dan debugging specific.

**React DevTools Extension:**

```typescript
// Install:
// Chrome: React Developer Tools
// Firefox: React DevTools

// Component tree — inspect props dan state
function UserCard({ user }: { user: User }) {
  const [expanded, setExpanded] = useState(false);
  // Di React DevTools:
  //   <UserCard>
  //     props: { user: { id: 1, name: "Budi" } }
  //     hooks:
  //       State(0): expanded = false
  //       State(1): setExpanded = ƒ ()
  return (
    <div onClick={() => setExpanded(!expanded)}>
      <h3>{user.name}</h3>
      {expanded && <p>{user.email}</p>}
    </div>
  );
}
```

**React DevTools Features:**

| Feature | Fungsi |
|---------|--------|
| Components tree | Lihat hierarchy komponen |
| Props & State | Inspect nilai saat ini |
| Highlight updates | Highlight komponen yg re-render |
| Profiler | Record render performance — flame chart komponen |
| Source | Klik komponen → buka source code di Sources tab |

**React Profiler:**

```typescript
// Buka React DevTools → Profiler tab
// Klik Record → lakukan action → Stop

// Analisis flame chart:
// - Warna: hijau (cepat) → kuning → merah (lambat)
// - Durasi render tiap komponen
// - Ranked chart — komponen paling lambat di atas

// Fix re-render:
const UserCard = React.memo(function UserCard({ user }: { user: User }) {
  // Hanya re-render kalo props user berubah
  return <div>{user.name}</div>;
});
```

## 2.6 Multi-Target Debugging

Debug multiple proses sekaligus.

**Compound Launch Config:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/src/index.ts",
      "preLaunchTask": "tsc: build - server/tsconfig.json",
      "outFiles": ["${workspaceFolder}/server/dist/**/*.js"]
    },
    {
      "name": "Client",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/client/src",
      "sourceMaps": true
    },
    {
      "name": "Worker",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/worker/src/index.ts",
      "preLaunchTask": "tsc: build - worker/tsconfig.json",
      "outFiles": ["${workspaceFolder}/worker/dist/**/*.js"]
    }
  ],
  "compounds": [
    {
      "name": "Full Stack: Server + Client",
      "configurations": ["Server", "Client"],
      "preLaunchTask": "npm: dev"
    },
    {
      "name": "All Services: Server + Client + Worker",
      "configurations": ["Server", "Client", "Worker"],
      "stopAll": true
    }
  ]
}
```

**Multi-target Debugging Tips:**
- `stopAll: true` — stop semua proses pas satu berhenti
- Tiap proses punya Debug Console sendiri
- Switch antar proses di Call Stack dropdown

## Latihan

1. **Debug Infinite Loop** — Tulis kode dengan infinite loop. Set breakpoint, identifikasi exit condition yg salah. Fix and verify.

2. **Debug Async Waterfall** — Buat 3 function async berantai (A → B → C). Set breakpoint di tiap function. Step through pake Step Into dan Step Over. Catat urutan eksekusi.

3. **Debug Race Condition** — Tulis kode dengan Promise.all dan race condition di shared variable. Set conditional breakpoint untuk track perubahan variable.

4. **Setup Compound Config** — Buat launch.json dengan Server (Node.js) + Client (Chrome debug). Jalankan compound debug.

5. **React DevTools Practice** — Buka React project (atau buat minimal), record Profiler, temukan komponen yg re-render tidak perlu.
