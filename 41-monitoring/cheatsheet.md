# 🧠 Cheatsheet: Monitoring & Error Tracking

> Referensi cepet — 1 halaman. Modul 41: Observability production — logging, Sentry, health check, alerting.

## Topik Utama

| Sesi | Topik | Tools |
|------|-------|-------|
| 01 | Structured Logging — Pino vs Winston, log levels, request logging, child logger, rotation | Pino, Winston, pino-roll |
| 02 | Sentry Error Tracking — DSN setup, Express middleware, source maps, breadcrumbs, performance tracing | Sentry |
| 03 | Health Check & Monitoring — /healthz, /readyz, dependency check, graceful shutdown | express-status-monitor |
| 04 | Production Monitoring — uptime monitor, alerting, APM, incident response checklist | Uptime Kuma, Better Uptime, Slack/Discord webhook |

## Command / Sintaks Penting

```bash
npm install pino
npm install -D pino-pretty     # development
npm install pino-roll          # rotation
npm install @sentry/node
npm install @sentry/profiling-node
npm install express-status-monitor
```

### Pino Logger Setup

```javascript
const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  ...(isProduction ? {} : {
    transport: { target: 'pino-pretty', options: { colorize: true } },
  }),
  redact: { paths: ['req.headers.authorization', 'password', 'secret'], censor: '[REDACTED]' },
});

logger.info({ userId: 42 }, 'User login success');
logger.error({ err, orderId: 'ORD-123' }, 'Payment failed');
```

### Request Logging Middleware

```javascript
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]({ method: req.method, url: req.url, statusCode: res.statusCode, duration: `${duration}ms` }, 'Request completed');
  });
  next();
}
```

### Sentry — Express Setup

```javascript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.RELEASE_VERSION,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  attachStacktrace: true,
  maxBreadcrumbs: 50,
});
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
// ... routes ...
app.use(Sentry.Handlers.errorHandler({ shouldHandleError: (err) => err.status >= 500 }));
```

### Health Check Endpoints

```javascript
// Liveness — app masih jalan?
router.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Readiness — dependensi siap?
router.get('/readyz', async (_req, res) => {
  const checks = [];
  try { await pgPool.query('SELECT 1'); checks.push({ name: 'postgres', status: 'ok' }); }
  catch (e) { checks.push({ name: 'postgres', status: 'error', error: e.message }); }
  // ... cek Redis, external API ...
  const allOk = checks.every(c => c.status === 'ok');
  res.status(allOk ? 200 : 503).json({ status: allOk ? 'ok' : 'degraded', checks });
});
```

### Graceful Shutdown

```javascript
async function gracefulShutdown(signal) {
  logger.info({ signal }, 'Shutting down...');
  server.close(() => logger.info('HTTP server closed'));
  const forceExit = setTimeout(() => process.exit(1), 30000);
  await pgPool.end();
  await redisClient.disconnect();
  clearTimeout(forceExit);
  process.exit(0);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

### Slack Alert Webhook

```javascript
await fetch(SLACK_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    attachments: [{ color: '#FF0000', blocks: [
      { type: 'header', text: { type: 'plain_text', text: '🚨 Error Rate Threshold Breached' } },
      { type: 'section', fields: [
        { type: 'mrkdwn', text: `*Service:*\napi` },
        { type: 'mrkdwn', text: `*Severity:*\ncritical` },
      ]},
    ]}],
  }),
});
```

## Tips & Trik

- **Log level production**: `info`. Debug cuma di dev
- **Child logger**: pake correlation ID (UUID) biar log per request terikat
- **JSON logging**: output native JSON — tinggal stream ke ELK/Datadog/Grafana Loki
- **Sentry tracesSampleRate**: 1.0 di dev, 0.1-0.2 di production (irit quota)
- **Fingerprint**: custom grouping biar error sama gak tercecer jadi banyak issue
- **Breadcrumbs**: tambah manual di flow kritis (checkout, payment) — jejak user sebelum error
- **/healthz vs /readyz**: liveness cek app hidup, readiness cek dependensi siap
- **Timeout per health check**: 3 detik max, jangan biar 1 check lambat nahan yang lain

## Common Mistakes

- ❌ **console.log di production** — gak terstruktur, gak ada level, gak bisa parsing
- ❌ **Sentry init di tengah file** — harus PALING ATAS, sebelum middleware/router
- ❌ **Upload source maps ke public** — cuma Sentry yang butuh, jangan expose
- ❌ **Gak bedain liveness vs readiness** — kalau DB mati, app jangan di-restart (liveness OK), tapi traffic dialihkan (readiness FAIL)
- ❌ **SIGKILL paksa** — gak ada graceful shutdown, koneksi DB/Redis putus mendadak
- ❌ **Lupa timeout di health check** — check DB lambat bikin health endpoint ikut lambat
- ❌ **No incident runbook** — pas production down, panic, gak tau langkah pertama

## Link Cepat

- [Module README](.)
- [Sesi 01 — Structured Logging](01-structured-logging.md)
- [Sesi 02 — Sentry Error Tracking](02-sentry-error-tracking.md)
- [Sesi 03 — Health Check & Monitoring](03-health-check-monitoring.md)
- [Sesi 04 — Production Monitoring](04-production-monitoring.md)
