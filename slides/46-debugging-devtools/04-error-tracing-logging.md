---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/546819/pexels-pho"
footer: "Sesi 04: Error Tracing Logging"
---

<!-- _class: title -->
# 4. Error Tracing & Logging

> Durasi: 90 menit

## 4.1 Stack Trace Anatomy

Baca dan pahami stack trace.

```typescript
// Contoh error dengan stack trace lengkap
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

function calculateAverage(numbers: number[]): number {
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  return divide(sum, numbers.length);
}

function processGrades(grades: number[]): void {
  // ❌ Array kosong → length = 0 → divide by zero
  const avg = calculateAverage(grades);
  console.log("Average:", avg);
}

// Panggil
processGrades([]);
```

**Stack Trace Output:**
```
Error: Division by zero
    at divide (stack.ts:3:11)
    at calculateAverage (stack.ts:9:12)
    at processGrades (stack.ts:15:15)
    at Object.<anonymous> (stack.ts:19:1)
    at Module._compile (node:internal/modules/cjs/loader:1256:14)
    at Module._extensions (node:internal/modules/cjs/loader:1310:10)
    at Module.load (node:internal/modules/cjs/loader:1115:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint (node:internal/modules/run_main:81:12)
    at Object.<anonymous> (node:internal/modules/run_main:81:12)
```

**Stack Trace Anatomy:**

```
Error: Division by zero          ← Error name + message
    at divide (stack.ts:3:11)    ← File:line:column
         ↑            ↑  ↑
    function name     line column
    at calculateAverage (stack.ts:9:12)
    at processGrades (stack.ts:15:15)
    at Object.<anonymous> (stack.ts:19:1) ← Entry point
    at Module._compile ...                ↓
    at Module._extensions ...             Node.js internal
    at Module.load ...                    (ignore for debugging)
```

**Async Stack Trace:**

```typescript
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: User not found`);
  return res.json();
}

async function loadDashboard(userId: string): Promise<void> {
  try {
    const user = await fetchUser(userId);
    renderProfile(user);
  } catch (err) {
    // Async stack trace menunjukkan dari mana async call berasal
    console.error("Dashboard failed:", err);
  }
}

loadDashboard("invalid-id");
```

**Async Stack Trace Output:**
```
Error: HTTP 404: User not found
    at fetchUser (async.ts:4:11)
    at async loadDashboard (async.ts:10:22)  ← async boundary
    at async Object.<anonymous> (async.ts:17:1)
```

**Node.js flag untuk async stack trace lebih detail:**
```bash

---

# Async stack trace — biar ga ilang async context
node --async-stack-traces dist/index.js
```

## 4.2 Error Types & Handling

Berbagai jenis error dan cara handle.

```typescript
// 1. TRY-CATCH — synchronous error
function parseJSON(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error("Invalid JSON:", (err as Error).message);
      return null;
    }
    throw err; // rethrow kalo bukan yg dihandle
  }
}

// 2. ERROR-FIRST CALLBACK (Node.js legacy)
import fs from "fs";
fs.readFile("/path/to/file.txt", "utf-8", (err, data) => {
  if (err) {
    console.error("Failed to read file:", err.message);
    return;
  }
  console.log("File content:", data);
});

// 3. PROMISE REJECTION
import { readFile } from "fs/promises";

async function readConfig(): Promise<Config> {
  try {
    const data = await readFile("config.json", "utf-8");
    return JSON.parse(data);
  } catch (err) {
    // Handle both file-not-found AND parse error
    if (err instanceof SyntaxError) {
      throw new Error("Config file is malformed");
    }
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("Config file not found");
    }
    throw err;
  }
}

// 4. PROMISE CHAIN .catch()
fetch("/api/users")
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((data) => processUsers(data))
  .catch((err) => {
    console.error("Request failed:", err);
    // Continue with fallback
    return [];
  });

// 5. EVENT EMITTER ERROR
import { EventEmitter } from "events";

class DatabaseConnection extends EventEmitter {
  connect(): void {
    // Simulate connection error
    process.nextTick(() => {
      this.emit("error", new Error("Connection refused"));
    });
  }
}

const db = new DatabaseConnection();
db.on("error", (err: Error) => {
  console.error("Database error:", err.message);
  // Reconnect logic here
});
db.connect();

// IMPORTANT: EventEmitter ERROR tanpa listener → crash process!
```

**Error Handling Decision Table:**

| Scenario | Strategy |
|----------|----------|
| User input validation | Try-catch + return user-friendly message |
| Network request | Promise `.catch()` or async/await try-catch |
| File I/O | Handle specific error codes (ENOENT, EACCES) |
| Third-party library | Wrap in try-catch, log, rethrow as known error |
| EventEmitter | Wajib ada `error` listener — crash kalo ga ada |
| Unhandled rejection | `process.on("unhandledRejection")` — see 4.4 |

## 4.3 Structured Logging

Log yang bisa dibaca mesin — JSON format, levels, correlation ID.

**Setup dengan Pino:**

```typescript
import pino from "pino";
import { randomUUID } from "crypto";
import http from "http";

// Logger instance
const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
        }
      : undefined,
  redact: ["req.headers.authorization", "req.body.password", "user.token"],
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});

// Correlation ID — track request across services
function generateCorrelationId(): string {
  return randomUUID();
}

// Middleware Express + Pino
import express from "express";
const app = express();

app.use((req, res, next) => {
  const correlationId =
    (req.headers["x-correlation-id"] as string) ?? generateCorrelationId();
  res.setHeader("x-correlation-id", correlationId);

  // Child logger dengan correlation ID
  req.log = logger.child({ correlationId, service: "api-gateway" });
  next();
});

// Usage in route handler
app.get("/api/users/:id", async (req, res) => {
  const log = (req as any).log;

  log.info({ userId: req.params.id }, "Fetching user");

  try {
    const user = await fetchUser(req.params.id);
    log.info({ userId: req.params.id, status: "found" }, "User fetched");
    res.json(user);
  } catch (err) {
    log.error(
      { err, userId: req.params.id },
      "Failed to fetch user"
    );
    res.status(500).json({ error: "Internal server error" });
  }
});
```

**Log Levels:**

| Level | Nilai | Kapan Pakai |
|-------|-------|-------------|
| `fatal` | 60 | App will crash / can't continue |
| `error` | 50 | Error yg butuh immediate attention |
| `warn` | 40 | Something unexpected, app still works |
| `info` | 30 | Normal operation — request processed |
| `debug` | 20 | Development detail — query, timing |
| `trace` | 10 | Very verbose — full payload dump |

**JSON Log Output:**

```json
// Contoh log entry
{
  "level": 30,
  "time": 1720123456789,
  "pid": 12345,
  "hostname": "server-01",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "service": "api-gateway",
  "userId": "usr_42",
  "msg": "User fetched",
  "status": "found"
}
```

**Winston Alternative:**

```typescript
import winston from "winston";

const winstonLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 10,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  winstonLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}
```

**Pino vs Winston:**

| Aspek | Pino | Winston |
|-------|------|---------|
| Speed | 🚀 2-3x faster | Slower (more features) |
| Bundle size | ~10KB | ~50KB |
| Transports | Stream-based | Multi-transport built-in |
| JSON default | Yes | Optional |
| Ecosystem | Growing | Mature, more plugins |

## 4.4 Unhandled Rejection & Global Error Handler

Tangkap error yg tidak tertangani.

```typescript
// GLOBAL UNHANDLED REJECTION
process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
  console.error("UNHANDLED REJECTION:", reason);

  // Log ke file / monitoring
  logger.fatal(
    {
      err: reason instanceof Error ? reason : new Error(String(reason)),
      promise,
    },
    "Unhandled Promise Rejection"
  );

  // Opsi A: Crash — exit process biar restart manager (PM2/Docker)
  process.exitCode = 1;

  // Opsi B: Recover — kalo error non-fatal
  // process.exitCode tetap 0, tapi log warning
});

// UNCAUGHT EXCEPTION
process.on("uncaughtException", (err: Error, origin: string) => {
  console.error("UNCAUGHT EXCEPTION:", err);

  logger.fatal(
    {
      err,
      origin,
      pid: process.pid,
    },
    "Uncaught Exception — process will exit"
  );

  // Uncaught exception → state mungkin corrupted
  // Harus exit, biar process manager restart
  process.exit(1);
});

// WARNING — deprecation, multiple listeners
process.on("warning", (warning: Error) => {
  logger.warn(
    { warning: warning.message, stack: warning.stack },
    "Process warning"
  );
});
```

**Best Practices:**

| Practice | Kenapa |
|----------|--------|
| **Jangan recover dari uncaughtException** | State app mungkin corrupted — lebih aman restart |
| **Use process manager** (PM2, Docker restart) | Biar auto-restart pas crash |
| **Log correlation ID di error** | Traceability antar service |
| **Source maps di production** | Stack trace readable walau minified |
| **Error boundary di UI** | Jangan sampe white screen |
| **Alert monitoring** | Sentry, Datadog, New Relic integration |

**Source Maps untuk Production:**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSources": true
  }
}

// Atau di Node.js runtime
// node --enable-source-maps dist/index.js

// Di package.json
{
  "scripts": {
    "start": "node --enable-source-maps dist/index.js",
    "start:prod": "node --enable-source-maps dist/index.js"
  }
}

// Upload ke error monitoring
// npx @sentry/cli sourcemaps upload --org=myorg --project=myproject dist/
```

**Sentry Integration:**

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "development",
  release: `v${process.env.npm_package_version}`,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
});

// Express error handler
app.use(Sentry.Handlers.errorHandler());

// Manual capture
try {
  dangerousOperation();
} catch (err) {
  Sentry.captureException(err);
}
```

## Latihan

1. **Setup Structured Logging** — Buat Express app dengan Pino. Implement correlation ID di middleware. Log setiap request (method, url, duration, status code). Output JSON file.

2. **Trace Error Across Async Chain** — Buat 3 function async (A → B → C) dimana C throw error. Pastikan stack trace show full chain. Test dengan dan tanpa `--async-stack-traces`.

3. **Read Minified Stack Trace** — Build TypeScript dengan `--minify`. Dapatkan stack trace minified. Trace balik ke source asli pake source maps.

4. **Global Error Handler** — Tambah `unhandledRejection` dan `uncaughtException` handler di app. Buat 2 kasus: crash (exit) dan recover (warning). Log dengan struktur JSON.

5. **Sentry Setup** — Integrasi Sentry di Express app. Capture manual error, verify di Sentry dashboard.
