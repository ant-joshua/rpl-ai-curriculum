# Monitoring & Observability — Latihan

## Level 1: Dasar

### 1. Structured Logging — JSON Format
**Pertanyaan:** Konversi console.log ke structured logging:

```typescript
// ❌ SEBELUM: unstructured logging
app.post('/api/orders', async (req, res) => {
  console.log('Creating order for user:', req.body.userId);
  try {
    const order = await createOrder(req.body);
    console.log('Order created:', order.id);
    res.json(order);
  } catch (error) {
    console.log('Error creating order:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// === LENGKAPI: Structured logging ===
// Gunakan library pino atau winston
// Setiap log harus punya:
// - timestamp (ISO 8601)
// - level (info, warn, error, debug)
// - message
// - context (requestId, userId, orderId, dll)
// - stack trace untuk error

import pino from 'pino';

const logger = pino({
  // === LENGKAPI: logger config ===
  // level: berdasarkan NODE_ENV
  // base: tambah service name
  // formatters: custom level label
  // redaction: sembunyi sensitive data
});

app.post('/api/orders', async (req, res) => {
  const requestId = req.headers['x-request-id'] as string;
  const childLogger = logger.child({ requestId });
  
  // === LENGKAPI: logging setiap step ===
});
```

**Hint:** Pino config: `{ level: process.env.LOG_LEVEL || 'info', base: { service: 'order-api' }, formatters: { level: (label) => ({ level: label }) } }`. Redaction: `redact: { paths: ['password', 'creditCard', '*.token'], censor: '***' }`. Child logger: `logger.child({ requestId, userId })` untuk context otomatis di semua logs. Output format: `{ "level": "info", "time": "2024-01-15T10:30:00.000Z", "service": "order-api", "requestId": "abc-123", "msg": "Order created" }`.

---

### 2. Sentry — Error Tracking
**Pertanyaan:** Setup Sentry untuk error tracking di Next.js:

```typescript
// === LENGKAPI: Sentry setup ===
// 1. Install dan konfigurasi Sentry di Next.js
// 2. Initialize Sentry di server-side
// 3. Initialize Sentry di client-side
// 4. Capture error dengan context
// 5. Set user context untuk debugging

// === Sentry config (server-side) ===
// Sentry.init({
//   dsn: process.env.SENTRY_DSN,
//   environment: process.env.NODE_ENV,
//   tracesSampleRate: ? // Sampling rate untuk performance
//   replaysSessionSampleRate: ? // Replays
//   replaysOnErrorSampleRate: ? // Replays on error
// });

// === LENGKAPI: Error boundary component ===
// React error boundary yang:
// 1. Catch render errors
// 2. Kirim ke Sentry
// 3. Tampilkan fallback UI
// 4. Log error untuk debugging

// === LENGKAPI: Custom Sentry configuration ===
// 1. Ignore error tertentu (misal: third-party errors)
// 2. Tambahkan breadcrumbs untuk debugging
// 3. Set tags untuk filtering
// 4. Before send hook untuk filter sensitive data
```

**Hint:** Sentry Next.js: `@sentry/nextjs`. `tracesSampleRate: 0.2` (20% performance traces). `replaysOnErrorSampleRate: 1.0` (100% replay saat error). `beforeSend`: filter sensitive data sebelum dikirim ke Sentry. Breadcrumbs: `Sentry.addBreadcrumb({ message: 'User clicked checkout', category: 'ui', level: 'info' })`. Tags: `Sentry.setTag('order_id', orderId)`.

---

### 3. Health Check Endpoint
**Pertanyaan:** Implementasi health check endpoint yang komprehensif:

```typescript
// === LENGKAPI: Health check endpoint ===
app.get('/health', async (req, res) => {
  // === LENGKAPI ===
  // Check semua dependencies:
  // 1. Database (PostgreSQL) — cek koneksi + response time
  // 2. Redis — cek koneksi + ping
  // 3. External API (payment provider) — cek availability
  // 4. Disk space — cek apakah tersisa cukup
  // 5. Memory usage — cek apakah masih aman
  // 6. Uptime — berapa lama service jalan
  
  // Response format:
  // {
  //   "status": "healthy" | "degraded" | "unhealthy",
  //   "timestamp": "ISO 8601",
  //   "uptime": 12345,
  //   "checks": {
  //     "database": { "status": "healthy", "responseTime": 5 },
  //     "redis": { "status": "healthy", "responseTime": 1 },
  //     "payment_api": { "status": "degraded", "responseTime": 3000 },
  //     "disk": { "status": "healthy", "freeSpace": "45GB" },
  //     "memory": { "status": "healthy", "usedPercent": 65 }
  //   },
  //   "version": "1.2.3",
  //   "environment": "production"
  // }
});

// === LENGKAPI: Readiness check (untuk k8s) ===
app.get('/ready', async (req, res) => {
  // === LENGKAPI ===
  // Hanya check apakah service siap menerima traffic
  // 1. Database connected
  // 2. Redis connected
  // 3. Worker running
  // Return 200 OK atau 503 Service Unavailable
});

// === LENGKAPI: Liveness check (untuk k8s) ===
app.get('/alive', (req, res) => {
  // === LENGKAPI ===
  // Check apakah process masih hidup
  // Return 200 OK atau 503
  // Simple: cek process.memoryUsage()
});
```

**Hint:** `/health` = deep check (semua dependencies). `/ready` =浅 check untuk k8s readiness probe. `/alive` = liveness probe (proses hidup). Response time: `const start = Date.now(); await db.query('SELECT 1'); const responseTime = Date.now() - start;`. Status: `healthy` = semua OK, `degraded` = ada warning, `unhealthy` = ada critical failure. Gunakan `process.uptime()` untuk uptime.

---

### 4. Slack Alert — Notification System
**Pertanyaan:** Implementasi alert ke Slack:

```typescript
// === LENGKAPI: Slack notification ===

interface AlertConfig {
  webhookUrl: string;
  channel: string;
  mentionOnCritical: string[]; // user IDs untuk mention
}

// === LENGKAPI: Alert levels ===
enum AlertLevel {
  INFO = 'info',      // Biru - info biasa
  WARNING = 'warning', // Kuning - perlu diperhatian
  CRITICAL = 'critical', // Merah - perlu action segera
}

// === LENGKAPI: Send alert function ===
async function sendSlackAlert(
  level: AlertLevel,
  title: string,
  message: string,
  context?: Record<string, any>
): Promise<void> {
  // === LENGKAPI ===
  // 1. Format message sesuai level (warna, icon)
  // 2. Tambahkan context (service, environment, timestamp)
  // 3. Mention users jika critical
  // 4. Kirim ke Slack webhook
  // 5. Handle error (jangan crash jika Slack down)
}

// === LENGKAPI: Alert triggers ===
// 1. Error rate > 5% dalam 5 menit
// 2. Response time p99 > 2 detik
// 3. Memory usage > 80%
// 4. Disk space < 20%
// 5. Database connection pool exhausted
// 6. Payment failure rate > 10%

// === LENGKAPI: Monitoring check function ===
async function checkMetricsAndAlert() {
  // === LENGKAPI ===
  // 1. Collect metrics
  // 2. Check thresholds
  // 3. Send alerts jika threshold terlampaui
  // 4. Cooldown: jangan spam alert (max 1 per metric per 15 menit)
}
```

**Hint:** Slack incoming webhook: `fetch(webhookUrl, { method: 'POST', body: JSON.stringify(payload) })`. Payload format: `{ channel: '#alerts', text: title, blocks: [...] }`. Color mapping: info=#36a64f, warning=#ffcc00, critical=#ff0000. Mention: `<@USER_ID>` di message text. Cooldown: simpan last alert time di Map/Set, skip jika < 15 menit.

---

## Level 2: Menengah

### 5. Request Logging — Middleware
**Pertanyaan:** Implementasi request logging middleware:

```typescript
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

// === LENGKAPI: Request logging middleware ===
function requestLogger(logger: pino.Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || generateRequestId();
    
    // === LENGKAPI ===
    // 1. Log incoming request (method, url, query, body tanpa sensitive data)
    // 2. Intercept response untuk log status code dan duration
    // 3. Log completion (status, duration, response size)
    // 4. Special handling untuk error responses (4xx, 5xx)
    
    // Tambahkan requestId ke response headers
    res.setHeader('X-Request-Id', requestId);
    
    // Child logger dengan requestId
    const childLogger = logger.child({ requestId });
    req.log = childLogger;
    
    // === LENGKAPI: Response interceptor ===
    const originalSend = res.send;
    res.send = function(body) {
      const duration = Date.now() - startTime;
      
      // === LENGKAPI: Log response ===
      // Level: info untuk 2xx, warn untuk 4xx, error untuk 5xx
      // Include: status, duration, response size
      // Jangan log body untuk response besar (> 1KB)
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}

// === LENGKAPI: Sensitive data filtering ===
function sanitizeLogData(data: Record<string, any>): Record<string, any> {
  // === LENGKAPI ===
  // Filter: password, token, creditCard, cvv, pin
  // Return sanitized copy (jangan mutate original)
}
```

**Hint:** Request log: `{ method: 'POST', url: '/api/orders', query: {}, body: { userId: 'u123', items: [...] } }`. Response log: `{ status: 200, duration: 45, responseSize: 1024 }`. Level mapping: `< 400`: info, `400-499`: warn, `>= 500`: error. PII filter: jangan log email, phone, address di production. Generate requestId: `crypto.randomUUID()`.

---

### 6. Metrics Collection — Custom Metrics
**Pertanyaan:** Implementasi custom metrics untuk monitoring:

```typescript
// === LENGKAPI: Metrics collection ===
// Gunakan prom-client atau custom implementation

interface Metrics {
  requestCount: number;
  requestDuration: number[];
  errorCount: number;
  activeConnections: number;
  jobQueueDepth: number;
  // === LENGKAPI metrics lainnya ===
}

// === LENGKAPI: Metrics collector ===
class MetricsCollector {
  private metrics: Metrics;
  private histogramBuckets: number[];
  
  constructor() {
    this.metrics = {
      requestCount: 0,
      requestDuration: [],
      errorCount: 0,
      activeConnections: 0,
      jobQueueDepth: 0,
    };
    this.histogramBuckets = [10, 50, 100, 250, 500, 1000, 2500, 5000];
  }
  
  // === LENGKAPI methods ===
  incrementRequestCount(method: string, path: string, statusCode: number) {
    // === LENGKAPI ===
  }
  
  recordRequestDuration(method: string, path: string, duration: number) {
    // === LENGKAPI ===
    // Update histogram
  }
  
  getPercentile(metric: string, percentile: number): number {
    // === LENGKAPI ===
    // Hitung p50, p95, p99
  }
  
  // === LENGKAPI: Export metrics ===
  exportPrometheusFormat(): string {
    // Format: metric_name{label="value"} value
    // Contoh:
    // http_requests_total{method="POST",path="/api/orders",status="200"} 1523
    // http_request_duration_ms{method="POST",path="/api/orders",quantile="0.99"} 1250
  }
}

// === LENGKAPI: Prometheus endpoint ===
app.get('/metrics', (req, res) => {
  // Return metrics in Prometheus format
  // Content-Type: text/plain
});
```

**Hint:** Histogram buckets: `[10, 50, 100, 250, 500, 1000, 2500, 5000]` ms. Percentile: sort array, hitung index = `Math.ceil(percentile * length) - 1`. Prometheus format: `# HELP metric_name Description\n# TYPE metric_name histogram\nmetric_name_bucket{le="100"} 42\nmetric_name_bucket{le="250"} 67`. Labels: method, path, status code.

---

## Level 3: Lanjutan

### 7. Distributed Tracing
**Pertanyaan:** Implementasi distributed tracing untuk microservices:

```typescript
// === LENGKAPI: Trace context propagation ===
// Implementasi W3C Trace Context standard

interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  traceFlags: number;
}

// === LENGKAPI: Trace middleware ===
function traceMiddleware(req: Request, res: Response, next: NextFunction) {
  // === LENGKAPI ===
  // 1. Extract traceparent header dari request
  // 2. Generate atau propagate traceId
  // 3. Create new span untuk request ini
  // 4. Tambahkan traceparent ke response headers
  // 5. Log trace info
}

// === LENGKAPI: Span tracking ===
class TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, string>;
  events: Array<{ name: string; time: number }>;
  
  // === LENGKAPI methods ===
  start(): void { /* ... */ }
  end(): void { /* ... */ }
  addEvent(name: string): void { /* ... */ }
  setAttribute(key: string, value: string): void { /* ... */ }
  
  toJSON(): Record<string, any> {
    // === LENGKAPI ===
  }
}

// === LENGKAPI: Trace storage ===
async function saveTrace(span: TraceSpan) {
  // === LENGKAPI ===
  // 1. Simpan span ke database (table: trace_spans)
  // 2. Batch write untuk performance
  // 3. TTL 7 hari
}

// === LENGKAPI: Trace visualization query ===
async function getTraceTree(traceId: string) {
  // === LENGKAPI ===
  // Ambil semua spans untuk traceId
  // Bangun tree structure
  // Return hierarchy:
  // Request (root)
  // ├── DB Query
  // ├── Cache Check
  // └── External API Call
  //     └── Sub-request
}
```

**Hint:** W3C traceparent format: `00-{traceId}-{spanId}-{traceFlags}`. Header: `traceparent`. Generate traceId: `crypto.randomBytes(16).toString('hex')` (32 hex chars). SpanId: `crypto.randomBytes(8).toString('hex')` (16 hex chars). Storage: batch insert ke PostgreSQL atau kirim ke Jaeger/Zipkin. Query: `SELECT * FROM trace_spans WHERE trace_id = ? ORDER BY start_time`.

---

### 8. Alert Rules — Threshold Configuration
**Pertanyaan:** Implementasi alert rules engine:

```typescript
// === LENGKAPI: Alert rules configuration ===
interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // dalam menit, condition harus terpenuhi selama ini
  severity: 'info' | 'warning' | 'critical';
  channels: ('slack' | 'email' | 'sms' | 'pagerduty')[];
  cooldown: number; // menit, jangan spam alert
  enabled: boolean;
}

const DEFAULT_RULES: AlertRule[] = [
  // === LENGKAPI: Minimal 6 rules ===
  // 1. Error rate > 5% selama 5 menit -> critical
  // 2. P99 latency > 2 detik selama 3 menit -> warning
  // 3. Memory usage > 80% selama 10 menit -> warning
  // 4. Memory usage > 95% selama 2 menit -> critical
  // 5. Queue depth > 1000 selama 5 menit -> warning
  // 6. Database connection pool > 90% selama 3 menit -> critical
];

// === LENGKAPI: Alert evaluation ===
class AlertEvaluator {
  private rules: AlertRule[];
  private cooldownMap: Map<string, number>;
  
  constructor(rules: AlertRule[]) {
    this.rules = rules;
    this.cooldownMap = new Map();
  }
  
  async evaluate(metrics: Record<string, number>): Promise<Alert[]> {
    // === LENGKAPI ===
    // 1. Loop semua rules
    // 2. Cek condition terhadap metric
    // 3. Cek duration (condition harus terpenuhi selama X menit)
    // 4. Cek cooldown
    // 5. Jika semua terpenuhi, generate alert
  }
}

// === LENGKAPI: Alert history ===
interface Alert {
  id: string;
  ruleId: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  status: 'active' | 'resolved';
  resolvedAt?: Date;
}

// === LENGKAPI: Resolve alert ===
async function resolveAlert(alertId: string) {
  // === LENGKAPI ===
  // 1. Update status ke resolved
  // 2. Set resolvedAt timestamp
  // 3. Kirim resolved notification ke channels
  // 4. Log resolution
}
```

**Hint:** Duration check: simpan timestamp pertama condition terpenuhi. Jika condition terpenuhi selama >= duration, fire alert. Cooldown: simpan `lastAlertTime` per rule, skip jika `Date.now() - lastAlertTime < cooldown * 60000`. Resolve: cek jika condition tidak terpenuhi lagi selama 2x duration, auto-resolve. Storage: `alert_history` table dengan TTL.

---

### 9. Log Aggregation — Search & Filter
**Pertanyaan:** Implementasi log search dan filter:

```typescript
// === LENGKAPI: Log search API ===

interface LogSearchQuery {
  service?: string;
  level?: string[];
  message?: string; // full text search
  requestId?: string;
  userId?: string;
  startTime?: string; // ISO 8601
  endTime?: string;
  fields?: Record<string, any>; // custom field filter
  limit?: number;
  offset?: number;
  sort?: 'asc' | 'desc';
}

interface LogSearchResult {
  logs: Array<{
    timestamp: string;
    level: string;
    message: string;
    service: string;
    requestId: string;
    fields: Record<string, any>;
  }>;
  total: number;
  aggregations: {
    byLevel: Record<string, number>;
    byService: Record<string, number>;
    byHour: Array<{ hour: string; count: number }>;
  };
}

// === LENGKAPI: Search function ===
async function searchLogs(query: LogSearchQuery): Promise<LogSearchResult> {
  // === LENGKAPI ===
  // 1. Build SQL query dari search params
  // 2. Full text search di message field
  // 3. Filter by level, service, requestId
  // 4. Filter by time range
  // 5. Limit dan offset untuk pagination
  // 6. Hitung aggregations (by level, by service, by hour)
  // 7. Return results dengan aggregations
}

// === LENGKAPI: Log table schema ===
// CREATE TABLE logs (
//   === LENGKAPI ===
//   - id: UUID
//   - timestamp: TIMESTAMP WITH TIME ZONE
//   - level: VARCHAR (info/warn/error/debug)
//   - service: VARCHAR
//   - message: TEXT
//   - request_id: VARCHAR
//   - user_id: VARCHAR (nullable)
//   - fields: JSONB
//   - created_at: TIMESTAMP DEFAULT NOW()
// );

// === LENGKAPI: Indexes untuk performa ===
```

**Hint:** Schema: gunakan `JSONB` untuk flexible fields. Indexes: `timestamp DESC`, `level`, `service`, `request_id`, GIN index untuk `fields` (JSONB query). Partition: partition by month untuk table besar. Full text search: `WHERE message ILIKE '%search_term%'` atau gunakan PostgreSQL `tsvector`/`tsquery` untuk advanced search. Retention: auto-delete logs > 30 hari dengan `pg_partman` atau cron job.

---

### 10. Dashboard Data — API
**Pertanyaan:** Implementasi API untuk monitoring dashboard:

```typescript
// === LENGKAPI: Dashboard API endpoints ===

// 1. Overview dashboard
app.get('/api/dashboard/overview', async (req, res) => {
  // === LENGKAPI ===
  // Return:
  // {
  //   "requests": { "total24h": 15234, "perMinute": 10.6, "errorRate": 0.3 },
  //   "performance": { "p50": 45, "p95": 230, "p99": 1250 },
  //   "system": { "cpuUsage": 45, "memoryUsage": 65, "diskUsage": 30 },
  //   "services": [
  //     { "name": "order-api", "status": "healthy", "uptime": 99.95 },
  //     { "name": "payment-api", "status": "degraded", "uptime": 98.5 },
  //     { "name": "user-api", "status": "healthy", "uptime": 99.99 }
  //   ],
  //   "alerts": { "active": 2, "resolved24h": 5 },
  //   "jobs": { "waiting": 23, "active": 5, "failed": 1 }
  // }
});

// 2. Request metrics time series
app.get('/api/dashboard/metrics/requests', async (req, res) => {
  // === LENGKAPI ===
  // Query params: period (1h, 6h, 24h, 7d), interval (1m, 5m, 1h)
  // Return array of data points:
  // [
  //   { "timestamp": "...", "requests": 150, "errors": 3, "avgDuration": 45 },
  //   ...
  // ]
});

// 3. Error analysis
app.get('/api/dashboard/metrics/errors', async (req, res) => {
  // === LENGKAPI ===
  // Return:
  // - Top 10 errors by frequency
  // - Error trend over time
  // - Errors by service
  // - Average resolution time
});

// 4. Service health history
app.get('/api/dashboard/services/:serviceName/health', async (req, res) => {
  // === LENGKAPI ===
  // Return uptime history, incidents, response time trend
});

// 5. Live metrics (WebSocket for real-time)
app.get('/api/dashboard/realtime', async (req, res) => {
  // === LENGKAPI ===
  // SSE endpoint untuk real-time metrics
  // Update setiap 5 detik
  // Data: active requests, current response time, error count
});
```

**Hint:** Time series: gunakan `date_trunc('hour', timestamp)` atau `date_trunc('minute', timestamp)` untuk group. Intervals: 1h -> per menit, 24h -> per 5 menit, 7d -> per jam. Error analysis: `GROUP BY error_type ORDER BY count DESC LIMIT 10`. SSE: `res.setHeader('Content-Type', 'text/event-stream')`, `res.write('data: ...\n\n')`. Cache: simpan aggregated data di Redis dengan TTL sesuai interval.
