# RPP: Search Implementation

| Info | Detail |
|------|--------|
| Kode | RPL-AI-43 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Intermediate |
| Prasyarat | Node.js, Express, PostgreSQL dasar, REST API |

## Pertemuan 1: PostgreSQL Full-Text Search — tsvector/tsquery, GIN Index, Ranking, Highlighting, Bahasa Indonesia

### Tujuan
- Memahami full-text search concepts vs LIKE query
- Mengimplementasi tsvector/tsquery dengan PostgreSQL
- Setup GIN index untuk performa search
- Menggunakan ranking, highlighting, dan language configuration

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo search pakai LIKE '%keyword%', diskusi masalah performa & akurasi | Tanya jawab | Slide, browser |
| 20' | Materi inti: full-text search vs LIKE, tsvector/tsquery, GIN index, ranking (ts_rank), headline/highlight, language config (pg_catalog.indonesian), weighted search | Ceramah + demo | Live code, PostgreSQL |
| 25' | Praktik terbimbing: create products table + GIN index + search query dengan ranking + highlight | Hands-on | Starter code |
| 20' | Latihan mandiri: implement weighted search (title weight A, desc weight B) + search endpoint API | Problem solving | Soal |
| 15' | Diskusi & refleksi: batasan PostgreSQL FTS (tidak support typo tolerance, fuzzy), kapan perlu dedicated search engine | Q&A | — |

### Bahan Ajar
- [Module README](../43-search-implementation/)
- [PostgreSQL FTS](../43-search-implementation/01-postgres-fts.md)

---

## Pertemuan 2: Meilisearch — Setup, Index, Filterable/Faceted Search, Typo Tolerance, Ranking Rules

### Tujuan
- Setup & konfigurasi Meilisearch sebagai dedicated search engine
- Membuat index & mengelola dokumen
- Mengimplementasi filterable & faceted search
- Mengkonfigurasi typo tolerance & ranking rules

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap FTS keterbatasan, demo Meilisearch autocomplete cepat | Tanya jawab | Slide, browser |
| 20' | Materi inti: Meilisearch architecture, instalasi (Docker/binary), index settings, searchable/ filterable/sortable attributes, typo tolerance, faceted search, ranking rules, API client | Ceramah + demo | Live code, terminal |
| 25' | Praktik terbimbing: install Meilisearch + create index + seed data + search dengan filter + facet distribution | Hands-on | Starter code |
| 20' | Latihan mandiri: implement faceted search (category + price range filter) + custom ranking rules | Problem solving | Soal |
| 15' | Diskusi & refleksi: Meilisearch vs Elasticsearch vs Algolia untuk use case startup, cost & complexity tradeoff | Q&A | — |

### Bahan Ajar
- [Module README](../43-search-implementation/)
- [Meilisearch](../43-search-implementation/02-meilisearch.md)

---

## Pertemuan 3: Client-Side Search — Fuse.js, Lunr.js, Debounce, Autocomplete, Lazy Load Index

### Tujuan
- Implementasi fuzzy search client-side dengan Fuse.js
- Setup lunr.js untuk offline search index
- Membangun autocomplete component dengan debounce
- Lazy load search index untuk performa

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: diskusi search tanpa backend (offline, static site), demo Fuse.js | Tanya jawab | Slide, browser |
| 20' | Materi inti: Fuse.js configuration (keys, threshold, distance, minMatchCharLength), lunr.js index building, debounce pattern (300ms), autocomplete dropdown UX, lazy loading search index | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: implement Fuse.js search di client + debounced input + autocomplete dropdown | Hands-on | Starter code |
| 20' | Latihan mandiri: build lunr.js offline search index + lazy load via fetch + search result highlighting | Problem solving | Soal |
| 15' | Diskusi & refleksi: kapan pake client-side vs server-side search, batasan dataset size client-side, bundle size impact | Q&A | — |

### Bahan Ajar
- [Module README](../43-search-implementation/)
- [Client-Side Search](../43-search-implementation/03-client-side-search.md)

---

## Pertemuan 4: Search Architecture — Single vs Dedicated Service, Data Sync (Webhook/Cron/CDC), Hybrid Search, Analytics, Multi-Language

### Tujuan
- Mendesain search architecture: single service vs dedicated search engine
- Mengimplementasi data sync strategy (webhook, cron, CDC)
- Membangun hybrid search (PostgreSQL + Meilisearch) dengan failover
- Setup search analytics & multi-language search

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap 3 search approach (FTS, Meilisearch, Fuse.js), diskusi bagaimana menggabungkan semuanya | Tanya jawab | Slide, diagram |
| 20' | Materi inti: search architecture patterns (single DB query, dedicated engine, hybrid), data sync strategies (webhook on write, cron batch, CDC/change data capture), hybrid search with failover, search analytics logging, multi-language index strategy | Ceramah + demo | Live code, diagram arsitektur |
| 25' | Praktik terbimbing: build hybrid search — cari di Meilisearch dulu, fallback ke PostgreSQL FTS + logging analytics | Hands-on | Starter code |
| 20' | Latihan mandiri: implement data sync webhook (PostgreSQL → Meilisearch on write) + search analytics dashboard sederhana | Problem solving | Soal |
| 15' | Refleksi & wrap-up: presentasi final search feature, diskusi production concerns (indexing delay, replication, cost) | Presentasi | Browser live demo |

### Bahan Ajar
- [Module README](../43-search-implementation/)
- [Search Architecture](../43-search-implementation/04-search-architecture.md)
