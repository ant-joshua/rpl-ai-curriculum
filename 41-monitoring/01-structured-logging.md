# 41.1 Structured Logging

## Kenapa `console.log` Ga Cukup?

`console.log` works untuk development, tapi di production:

- **Ga terstruktur** — susah parsing, grep, atau split
- **Ga ada level** — error vs debug sama aja
- **Ga ada metadata** — timestamp, requestId, service name ilang
- **Ga bisa routing** — ke file, stdout, Elasticsearch? Manual semua
- **Kinerja** — `console.log` blocking kalo stdout lambat

```
// ❌ console.log — nyampah
[2025-03-15T10:30:00] User login success
[2025-03-15T10:30:01] Error: something happened
[2025-03-15T10:30:02] Query took 150ms

// ✅ JSON structured — bisa diprogram
{"level":30,"time":1742013000000,"msg":"User login success","userId":42}
{"level":50,"time":1742013001000,"msg":"Error: something happened","err":{"message":"..."}}
{"level":20,"time":1742013002000,"msg":"Query took 150ms","query":"SELECT ...","duration":150}
```

## Pino vs Winston

| Fitur | Pino | Winston |
|-------|------|---------|
| **Performance** | 🏆 Tercepat (~2x Winston) | Cepat, tapi kalah dari Pino |
| **Bundle size** | Kecil (~100KB) | Lebih besar |
| **JSON default** | ✅ Ya — output JSON native | ❌ Default string, perlu format |
| **Transports** | Built-in (file, rotate, browser) | Transport system modular |
| **Levels** | fatal, error, warn, info, debug, trace | error, warn, info, http, verbose, debug, silly |
| **Custom level** | Lewat `customLevels` | native support |
| **Piped protocol** | ✅ Bisa pipe ke external | ❌ Ga ada |
| **Redaction** | ✅ `pino.redact` built-in | Perlu library tambahan |
| **Child loggers** | ✅ Native | ✅ Native |
| **Ecosystem** | Cepet berkembang | Mature, banyak plugin |

**Rekomendasi:**
- **Pino** — buat performa tinggi, serverless, atau production skala
- **Winston** — kalo butuh banyak transport custom atau udah legacy pake Winston

## Log Levels

```typescript
// Dari paling penting ke paling detail:
// fatal  → 60 — Aplikasi crash, ga bisa recover
// error  → 50 — Error yang perlu ditindaklanjuti
// warn   → 40 — Something unexpected, tapi ga fatal
// info   → 30 — Normal operation (user login, request sukses)
// debug  → 20 — Development info, matiin di production
// trace  → 10 — Sangat detail, tracing function masuk
```

**Best practice level di production:** `info`
**Development / debugging:** `debug`

## Setup Pino di Express

### Install

```bash
npm install pino
# Atau kalo mau pino-pretty buat development
npm install -D pino-pretty
```

### Logger Config

```typescript
// src/lib/logger.ts
import pino from 'pino';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  
  // Formating prettier di development
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }),
  
  // Redact sensitive fields
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'secret'],
    censor: '[REDACTED]',
  },
});

export default logger;
```

### Pake di Express

```typescript
// src/index.ts
import express from 'express';
import logger from './lib/logger';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/users', async (req, res) => {
  logger.info({ userId: req.query.id }, 'Fetching user data');
  
  try {
    const user = await getUser(req.query.id);
    logger.debug({ user }, 'User fetched successfully');
    res.json(user);
  } catch (err) {
    logger.error({ err, userId: req.query.id }, 'Failed to fetch user');
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});
```

## Request Logging Middleware

Biar tiap request tercatat otomatis — method, url, duration, status code.

```typescript
// src/middleware/requestLogger.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, url } = req;

  // Tangkap response selesai
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    const level = statusCode >= 500 ? 'error' 
                : statusCode >= 400 ? 'warn' 
                : 'info';

    logger[level]({
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
      // Kalo pake correlation ID
      requestId: req.headers['x-request-id'],
    }, 'Request completed');
  });

  next();
}
```

```typescript
// Pakai di app
app.use(express.json());
app.use(requestLogger);

// Output kira-kira:
// {"level":30,"time":...,"msg":"Request completed","method":"GET","url":"/api/users","statusCode":200,"duration":"12ms"}
```

## Log Rotation

Log file di production bisa gede banget. Butuh rotation — putar log setiap hari / setiap sekian MB, simpan N backup, hapus yang lama.

### Pake `pino-roll`

```bash
npm install pino-roll
```

```typescript
// src/lib/logger.ts
import pino from 'pino';
import PINOROLL from 'pino-roll';

const logger = pino({
  level: 'info',
}, PINOROLL.createStream({
  file: path.join(__dirname, '../../logs/app.log'),
  frequency: 'daily',     // Rotasi setiap hari
  maxFiles: 14,            // Simpan 14 hari terakhir
  size: '10m',            // Atau rotasi kalo udah 10MB
}));
```

### Alternatif: Eksternal Log Rotation

Kalo pake PM2 / systemd, bisa pake `logrotate` di Linux:

```bash
# /etc/logrotate.d/myapp
/path/to/app/logs/*.log {
  daily
  rotate 14
  compress
  delaycompress
  missingok
  notifempty
  copytruncate
}
```

## Child Logger — Context Per Request

Biar log terikat ke satu request, pake child logger dengan correlation ID.

```typescript
// src/middleware/attachLogger.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';
import { v4 as uuidv4 } from 'uuid';

export function attachLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  // Child logger — semua log dari request ini punya requestId
  req.log = logger.child({ requestId });
  
  // Kirim balik header
  res.setHeader('x-request-id', requestId);
  
  next();
}
```

```typescript
// Pake di route
app.get('/api/orders/:id', (req, res) => {
  req.log.info({ orderId: req.params.id }, 'Fetching order');
  // Output: {"level":30,"requestId":"abc-123","orderId":"42","msg":"Fetching order"}
});
```

## JSON Logging — Kenapa Penting

### Grepping manual vs tooling

```
// Tanpa JSON — susah filtering
grep "error" app.log | grep "user-42"

// JSON + jq — query powerful
cat app.log | jq 'select(.level >= 50) | {msg, userId, timestamp}'
cat app.log | jq 'select(.duration > 1000) | .url'
```

### Integrasi dengan log management

JSON structure bikin integrasi ke ELK (Elasticsearch, Logstash, Kibana), Datadog, atau Grafana Loki jadi **drop-in** — tinggal kirim log stream, mereka parse otomatis.

```json
// Standard format yang dikenali banyak tools
{
  "level": 30,
  "time": 1742013000000,
  "pid": 1234,
  "hostname": "server-01",
  "requestId": "abc-123",
  "method": "GET",
  "url": "/api/users",
  "statusCode": 200,
  "duration": "12ms",
  "msg": "Request completed"
}
```

## Latihan

1. Setup Pino logger dengan konfigurasi: level `debug` di development, `info` di production. Implementasikan pino-pretty untuk dev dan redact untuk field `password`, `token`, `secret`. Tulis kode setup + contoh 3 log dengan level berbeda.

2. Buat Express middleware `requestLogger` yang mencatat: method, url, duration (ms), status code, dan content-length. Gunakan `res.on('finish')`. Log level: `error` untuk >= 500, `warn` untuk >= 400, `info` untuk sisanya.

3. Implementasikan child logger per-request dengan correlation ID (UUID). Tampilkan bagaimana log dari route `/api/users/:id` dan `/api/orders` memiliki `requestId` yang berbeda tapi konsisten dalam satu request. Tulis kode middleware + contoh output JSON.

4. Buat script log rotation sederhana: simpan log ke `logs/app.log`, rotasi harian, simpan 7 hari terakhir. Pake `pino-roll` atau `logrotate` config. Tulis konfigurasi lengkap dan cara testing rotasi-nya.
