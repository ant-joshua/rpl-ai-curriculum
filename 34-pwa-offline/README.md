<img src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="PWA" style="width:100%;border-radius:12px;margin:12px 0;">

# 34. PWA & Offline-First

> **Level:** 🌿 Intermediate  
> **Jam:** 8 (4 minggu × 2 sesi)  
> **Prasyarat:** JavaScript/TypeScript, Web Basics (HTML, CSS, Fetch API)  
> **Output:** Progressive Web App dengan dukungan offline + push notifications

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:

- Membuat Service Worker dari nol — lifecycle install, activate, fetch
- Mengelola cache dengan Cache API & strategi caching (stale-while-revalidate, cache-first, network-first)
- Menggunakan IndexedDB untuk penyimpanan data offline dengan library idb
- Sinkronisasi data offline → online pakai Background Sync API
- Membuat & memasang Web App Manifest (name, icons, theme_color, display)
- Memasang PWA ke layar utama via beforeinstallprompt
- Mengirim & menerima push notifications dengan VAPID + web-push
- Melakukan audit PWA dengan Lighthouse
- Memahami offline-first architecture & conflict resolution

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | Service Worker — lifecycle, cache strategies, Workbox, offline fallback | [01-service-worker.md](01-service-worker.md) |
| 2 | IndexedDB — offline storage, Background Sync, conflict resolution | [02-indexeddb-offline.md](02-indexeddb-offline.md) |
| 3 | Web App Manifest — manifest.json, install prompt, splash screen, Lighthouse audit | [03-pwa-manifest.md](03-pwa-manifest.md) |
| 4 | Push Notifications — Push API, VAPID keys, web-push, notification actions | [04-push-notifications.md](04-push-notifications.md) |

## Output Akhir Modul

> **PWA Notes App** — Aplikasi catatan progresif yang:
> - Bisa diinstall ke layar utama (manifest + beforeinstallprompt)
> - Berfungsi offline penuh (Service Worker + Cache API)
> - Menyimpan data di IndexedDB & sync saat online
> - Mengirim reminder via push notification
> - Skor Lighthouse ≥ 90 untuk PWA

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:

- "Explain this Service Worker lifecycle step by step"
- "Find the bug — my SW cache strategy serves stale data"
- "Generate VAPID keys and show me the secure setup"
- "Refactor this IndexedDB code to use the idb library"
- "Simulate a conflict scenario in offline-first sync and resolve it"
- "Audit this PWA manifest against the latest Lighthouse criteria"
- "Generate a push notification payload that handles click actions"
- "Explain why my beforeinstallprompt doesn't fire"
