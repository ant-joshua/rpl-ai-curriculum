# RPP: PWA & Offline-First

| Info | Detail |
|------|--------|
| Kode | RPL-AI-34 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Intermediate |
| Prasyarat | JavaScript/TypeScript, Web Basics (HTML, CSS, Fetch API) |

## Pertemuan 1: Service Worker

### Tujuan
- Memahami Service Worker lifecycle (install, activate, fetch)
- Mengelola cache dengan Cache API & strategi caching
- Setup Workbox untuk caching otomatis

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: SW lifecycle, cache strategies, Workbox, offline fallback | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: register Service Worker + implement cache strategies | Hands-on | Starter code |
| 20' | Latihan mandiri: setup Workbox & offline fallback page | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Module README](../34-pwa-offline/)
- [Service Worker](../34-pwa-offline/01-service-worker.md)

---

## Pertemuan 2: IndexedDB & Offline Sync

### Tujuan
- Menggunakan IndexedDB untuk penyimpanan offline (library idb)
- Sinkronisasi data offline → online dengan Background Sync API
- Memahami offline-first architecture & conflict resolution

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: IndexedDB, Background Sync, conflict resolution | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: implement IndexedDB CRUD + sync queue | Hands-on | Starter code |
| 20' | Latihan mandiri: handle conflict resolution & retry logic | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [IndexedDB & Offline](../34-pwa-offline/02-indexeddb-offline.md)

---

## Pertemuan 3: Web App Manifest

### Tujuan
- Membuat manifest.json (name, icons, theme_color, display)
- Memasang PWA ke layar utama via beforeinstallprompt
- Melakukan audit PWA dengan Lighthouse

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: manifest.json, install prompt, splash screen, Lighthouse audit | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: bikin manifest.json + beforeinstallprompt handler | Hands-on | Starter code |
| 20' | Latihan mandiri: audit PWA & perbaiki skor Lighthouse | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Web App Manifest](../34-pwa-offline/03-pwa-manifest.md)

---

## Pertemuan 4: Push Notifications

### Tujuan
- Setup Push API dengan VAPID keys
- Kirim & terima push notifications
- Handle notification click actions

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: Push API, VAPID keys, web-push, notification actions | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: setup push notification server + client | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah notification actions & reminder | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Push Notifications](../34-pwa-offline/04-push-notifications.md)
