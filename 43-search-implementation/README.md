<img src="https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Search Implementation" style="width:100%;border-radius:12px;margin:12px 0;">

# 43. Search Implementation

> **Level:** 🔧 Intermediate  
> **Jam:** 8 (4 sesi)  
> **Prasyarat:** Paham Node.js, Express, PostgreSQL dasar, REST API  
> **Output:** Search feature with autocomplete, full-text search, typo tolerance

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:

- Implementasi full-text search di PostgreSQL pake tsvector/tsquery + GIN index
- Setup Meilisearch sebagai dedicated search engine — index, filter, faceted search
- Bangun client-side fuzzy search pake Fuse.js & lunr.js
- Desain search architecture: hybrid search, data sync, search analytics
- Handle typo tolerance, autocomplete, search result highlighting

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | PostgreSQL Full-Text Search — tsvector/tsquery, GIN index, ranking, highlight, bahasa | [01-postgres-fts.md](01-postgres-fts.md) |
| 2 | Meilisearch — setup, index, filterable/faceted search, typo tolerance, ranking rules | [02-meilisearch.md](02-meilisearch.md) |
| 3 | Client-Side Search — Fuse.js, lunr.js, debounce, autocomplete, lazy load index | [03-client-side-search.md](03-client-side-search.md) |
| 4 | Search Architecture — single vs dedicated service, data sync (webhook/cron/CDC), hybrid, analytics, multi-language | [04-search-architecture.md](04-search-architecture.md) |

## Output Akhir Modul

> **Search Feature** — aplikasi dengan full-text search di PostgreSQL untuk query akurat, Meilisearch untuk fast typo-tolerant search, dan Fuse.js untuk client-side fuzzy fallback. Dilengkapi autocomplete dropdown, search result highlighting, dan search analytics dashboard.

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:

- "Explain the difference between LIKE '%keyword%' and PostgreSQL full-text search using tsvector — include performance and feature comparison"
- "Generate SQL to create a GIN index on a products table with name and description columns for full-text search in Indonesian language config"
- "Compare Meilisearch vs Elasticsearch vs PostgreSQL FTS for a startup building a search feature with < 100k documents — include cost, complexity, and performance considerations"
- "Write a Fuse.js configuration that searches across title, description, and tags with typo tolerance of 2 and returns top 10 results sorted by score"
- "Design a search sync architecture: a Node.js app writes to PostgreSQL, data needs to be indexed in Meilisearch within 30 seconds. Compare webhook, cron-based, and CDC approaches"
- "Generate code for a debounced search input component with autocomplete dropdown that calls an API endpoint after 300ms idle"
- "How to handle multi-language search where some documents are in English and others in Indonesian? Compare per-language index vs unified approach"
