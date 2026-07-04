<img src="https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Debugging" style="width:100%;border-radius:12px;margin:12px 0;">

# 46. Debugging & DevTools Mastery

> **Level:** 🔶 Intermediate  
> **Jam:** 6 (4 sesi × 90 menit)  
> **Prasyarat:** Modul 1 (JS Fundamentals), Modul 4 (Web Basics)  
> **Output:** Debugging toolkit, debuggable project setup, error monitoring integration

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:
- Debug layout, network, dan performance pakai Browser DevTools
- Setup dan pakai VS Code Debugger buat breakpoint, watch, call stack
- Debug REST API dengan Postman dan analisis waterfall timing
- Setup structured logging, baca stack trace, handle unhandled rejection

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | Browser DevTools — Elements, Console, Sources, Network, Performance, Lighthouse | [01-browser-devtools.md](01-browser-devtools.md) |
| 2 | VS Code Debugger — launch config, breakpoint types, React DevTools, multi-target | [02-vscode-debugger.md](02-vscode-debugger.md) |
| 3 | API Debugging — Postman, Thunder Client, waterfall timing, CORS, mock server | [03-api-debugging.md](03-api-debugging.md) |
| 4 | Error Tracing & Logging — stack trace, structured logging, unhandled rejection, source maps | [04-error-tracing-logging.md](04-error-tracing-logging.md) |

## Output Akhir Modul

> **Debug Dashboard** — project Express/Next.js dengan:
> - Structured logging (Pino) + log correlation ID
> - Error handler middleware + global unhandled rejection
> - Source maps di production
> - Lighthouse audit score ≥ 90

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:
- "Explain this stack trace — what caused the error?"
- "Why is this API call slow? Analyze the waterfall timing"
- "Generate a structured logger setup for this Express app"
- "Find the memory leak in this code using Chrome DevTools"
