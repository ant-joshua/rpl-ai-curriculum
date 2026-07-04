# RPP: Debugging & DevTools Mastery

| Info | Detail |
|------|--------|
| Kode | RPL-AI-46 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Intermediate |
| Prasyarat | Modul 1 (JS Fundamentals), Modul 4 (Web Basics) |

## Pertemuan 1: Browser DevTools

### Tujuan
- Menguasai panel Elements, Console, Sources, Network, Performance di Chrome DevTools
- Debug layout dan CSS dengan Elements panel
- Menganalisis waterfall timing di Network panel
- Menggunakan Lighthouse audit

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi: demo website broken, diskusi "gimana cara cari masalahnya?" tanpa DevTools | Tanya jawab | Browser |
| 25' | Materi inti: panel Elements (inspeksi, edit CSS live), Console (log, warn, error, filter), Sources (breakpoint, step over/into) | Ceramah + demo live | Chrome DevTools |
| 20' | Praktik terbimbing: buka website riil, inspeksi element, modif CSS live, set breakpoint JS, trace call stack | Hands-on | Browser + starter code |
| 15' | Materi lanjutan: Network tab (waterfall, status code, timing breakdown), Performance tab (recording, FPS), Lighthouse audit | Ceramah + demo | DevTools |
| 15' | Latihan mandiri: lighthouse audit website sendiri, target score ≥ 80, identifikasi 3 bottleneck | Problem solving | Soal, browser |
| 5' | Refleksi: hal paling berguna di DevTools hari ini | Q&A | — |

### Bahan Ajar
- [Module README](../46-debugging-devtools/README.md)
- [Browser DevTools](../46-debugging-devtools/01-browser-devtools.md)

---

## Pertemuan 2: VS Code Debugger

### Tujuan
- Setup launch.json configuration untuk Node.js dan browser
- Menguasai breakpoint types: line, conditional, logpoint, function
- Menggunakan Watch, Call Stack, Debug Console
- Integrasi React DevTools & multi-target debugging

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | Review: DevTools debugging, perbedaan dengan VS Code Debugger | Q&A | Slide |
| 20' | Materi inti: launch.json (Node.js, attach, browser), breakpoint types, watch expressions, call stack navigation | Ceramah + demo | VS Code |
| 25' | Praktik terbimbing: setup debug config Express app, set breakpoint, step through request lifecycle, inspect variables | Hands-on | Starter code |
| 20' | Materi lanjutan: conditional breakpoint, logpoint (console.log tanpa edit code), React DevTools (component tree, props, state) | Ceramah + demo | VS Code, React DevTools |
| 15' | Latihan mandiri: debug Express API endpoint yang sengaja broken, find root cause pakai debugger | Problem solving | Soal |
| 5' | Refleksi: perbedaan line breakpoint vs conditional vs logpoint | Tanya jawab | — |

### Bahan Ajar
- [Module README](../46-debugging-devtools/README.md)
- [VS Code Debugger](../46-debugging-devtools/02-vscode-debugger.md)

---

## Pertemuan 3: API Debugging

### Tujuan
- Menggunakan Postman / Thunder Client untuk testing API
- Menganalisis waterfall timing dan response headers
- Debug CORS issues
- Setup mock server

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | Review: VS Code debugger, transisi ke API debugging | Q&A | — |
| 20' | Materi inti: Postman collections, environment variables, pre-request scripts, tests; Thunder Client di VS Code | Ceramah + demo | Postman, VS Code |
| 20' | Praktik terbimbing: buat Postman collection untuk REST API, test GET/POST/PUT/DELETE, analyze response time waterfall | Hands-on | Starter API |
| 20' | Materi lanjutan: waterfall timing analysis (DNS, TCP, TLS, TTFR, Content Download), CORS debugging (preflight, headers), mock server dengan Postman | Ceramah + demo | Postman, browser |
| 20' | Latihan mandiri: debug CORS error, setup mock server, test endpoint dengan delay simulasi | Problem solving | Soal |
| 5' | Refleksi: cara baca waterfall timing — mana yang paling sering jadi bottleneck | Q&A | — |

### Bahan Ajar
- [Module README](../46-debugging-devtools/README.md)
- [API Debugging](../46-debugging-devtools/03-api-debugging.md)

---

## Pertemuan 4: Error Tracing & Logging

### Tujuan
- Membaca dan memahami stack trace
- Setup structured logging dengan Pino/Winston
- Handle unhandled rejection & global error
- Menggunakan source maps di production

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | Review: API debugging, pentingnya logging untuk production | Tanya jawab | Slide |
| 20' | Materi inti: stack trace anatomy (message, stack frame, line/column), error types (SyntaxError, ReferenceError, TypeError), source maps | Ceramah + demo | Live code |
| 20' | Praktik terbimbing: setup Pino structured logger, log levels, log correlation ID per request, error handler middleware Express | Hands-on | Starter code |
| 20' | Materi lanjutan: global error handling (process.on uncaughtException, unhandledRejection), source maps di production, error tracking tools (Sentry) | Ceramah + demo | Live code, Sentry dashboard |
| 20' | Latihan mandiri: integrasi structured logging + error handler di project Express, test error scenario baca stack trace | Problem solving | Soal |
| 5' | Refleksi: structured vs unstructured logging, kapan perlu error tracking service | Q&A | — |

### Bahan Ajar
- [Module README](../46-debugging-devtools/README.md)
- [Error Tracing & Logging](../46-debugging-devtools/04-error-tracing-logging.md)
