# 🧠 Cheatsheet: Debugging & DevTools Mastery

> Referensi cepet — 1 halaman.

## Topik Utama

| Sesi | Topik | Tools |
|------|-------|-------|
| 1 | Browser DevTools | Elements, Console, Sources, Network, Performance, Lighthouse |
| 2 | VS Code Debugger | launch.json, breakpoints, watch, call stack, React DevTools |
| 3 | API Debugging | Postman, Thunder Client, waterfall timing, CORS, mock server |
| 4 | Error Tracing & Logging | Pino, Sentry, source maps, unhandled rejection |

## Command / Sintaks Penting

**Browser DevTools shortcuts:**
- `Ctrl+Shift+C` / `Cmd+Shift+C` — Inspect element
- `Ctrl+Shift+J` / `Cmd+Option+J` — Console
- `Ctrl+Shift+P` / `Cmd+Shift+P` — Command palette
- `F8` — Pause/resume script execution
- `Ctrl+\` — Step into next function call

**VS Code debug config (`.vscode/launch.json`):**
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
    }
  ]
}
```

**Breakpoint types:** Regular, Conditional, Logpoint, Hit Count, Function Breakpoint, Exception Breakpoint.

**Postman collection tips:**
- Environments: simpan base URL + auth token, switch via dropdown
- Collection Runner: run all requests sequentially, test via Pre-request / Test scripts
- Mock Server: buat mock dari collection → `POST /mock-server` di Postman API
- Waterfall timing: cek DNS lookup, TCP handshake, TLS, TTFR

**Pino structured logging:**
```typescript
import pino from "pino";
const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport: (process.env.NODE_ENV === "development")
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
  redact: ["req.headers.authorization", "req.body.password"],
  serializers: { req: pino.stdSerializers.req, res: pino.stdSerializers.res, err: pino.stdSerializers.err }
});
logger.info({ userId }, "Fetching user");
```

**Log levels:** `fatal (60)` → `error (50)` → `warn (40)` → `info (30)` → `debug (20)` → `trace (10)`

**Sentry init:**
```typescript
import * as Sentry from "@sentry/node";
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: `v${process.env.npm_package_version}`,
  tracesSampleRate: 1.0,
  integrations: [new Sentry.Integrations.Http({ tracing: true }), new Sentry.Integrations.Express({ app })]
});
app.use(Sentry.Handlers.errorHandler());
Sentry.captureException(err);
```

## Tips & Trik
- **Async stack trace:** run with `node --async-stack-traces dist/index.js`
- **Correlation ID:** middleware generate UUID → pass via header `x-correlation-id` across services
- **Source maps in prod:** build with `--source-maps true`, upload to Sentry via `npx @sentry/cli sourcemaps upload`
- **Network tab:** filter by `status-code:4xx`, `method:POST`, or `larger-than:1M`
- **Lighthouse:** audit langsung dari tab Audit/Performance, target ≥ 90

## Common Mistakes
- ❌ Debug production with `console.log` — use structured logging (Pino)
- ❌ Forget `sourceMaps: true` in launch.json → debug breakpoints miss
- ❌ Expose `X-Powered-By: Express` — helmet removes it
- ❌ Ignore unhandled promise rejections → `process.on('unhandledRejection', handler)`

## Link Cepat
- [Module README](.)
- [Quiz](quiz.md)

### Rekomendasi Tools Debugging 2026

| Kategori | Tool | Use Case |
|----------|------|----------|
| API | Postman / Insomnia | Test REST/GraphQL endpoint, collection runner |
| API | Bruno | Open source, offline-first, git-friendly |
| Database | TablePlus / Beekeeper | UI database client, visual query builder |
| Logging | Datadog / Grafana Loki | Centralized log aggregation, search, alert |
| APM | Sentry / Datadog APM | Error tracking, performance tracing, span view |
| Network | Wireshark / Charles | Packet-level inspection, HTTPS decryption |
| Mobile | Reactotron / Flutter DevTools | Debug Redux, network, async storage |

### Checklist Debugging Harian

- [ ] Cek console error (browser + server)
- [ ] Network tab — status code 4xx/5xx? Response time?
- [ ] Application tab — localStorage/cookies sesuai?
- [ ] Lighthouse — skor performance, accessibility
- [ ] Sentry/Datadog — error rate naik?
- [ ] Server log — ada stack trace baru?

### Latihan Tambahan

1. **Memory Leak Detection** — Buka halaman, ambil heap snapshot. Interaksi 30 detik, ambil snapshot kedua. Bandingkan — object apa yang nambah tapi gak ke-free? Filter "detached" untuk cari DOM nodes yang masih dipegang JavaScript.
2. **Performance Record** — Record 5 detik interaction di halaman kamu. Identifikasi 1 long task (>50ms) dan jelaskan penyebabnya.
3. **Network Waterfall** — Muat halaman, screenshot waterfall. Identifikasi 1 resource yang blocking render dan 1 yang bisa di-lazy load.
4. **React Profiler** — Record render sequence. Cari 1 component yang re-render tanpa perlu (props tidak berubah). Fix dengan React.memo atau useMemo.
5. **Debugging Node.js** — Jalanin , buka , set breakpoint di route handler, inspect variable scope.

5. **Debugging Node.js** — Jalanin `node --inspect app.js`, buka `chrome://inspect`, set breakpoint di route handler, inspect variable scope.


### Pola Debugging Umum

| Pola | Gejala | Solusi |
|------|--------|--------|
| State tidak update | UI tidak berubah setelah setState | Cek apakah state benar diubah (immutable), atau ada stale closure |
| Infinite loop | useEffect + state update dependency | Pastikan dependency array lengkap, atau pake useReducer |
| CORS error | Console: "No 'Access-Control-Allow-Origin'" | Tambah header backend, atau proxy dev server |
| 404 API | Fetch ke URL salah | Cek Network tab → Request URL, bandingkan dengan docs |
| Memory leak | Halaman makin lambat seiring waktu | Cleanup useEffect, hapus event listener, abort fetch on unmount |
| Hydration error | Next.js: "Text content mismatch" | Hapus browser-only code dari SSR, wrap dengan useEffect |
