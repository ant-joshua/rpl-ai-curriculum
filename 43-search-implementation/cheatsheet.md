# 🧠 Cheatsheet: Search Implementation

> Referensi cepet — 1 halaman. Modul 43: Full-text search, Meilisearch, client-side fuzzy search, search architecture.

## Topik Utama

| Sesi | Topik | Tools |
|------|-------|-------|
| 01 | PostgreSQL Full-Text Search — tsvector/tsquery, GIN index, ranking, highlight, bahasa | PostgreSQL |
| 02 | Meilisearch — setup, index, filterable/faceted search, typo tolerance, ranking rules | Meilisearch |
| 03 | Client-Side Search — Fuse.js, lunr.js, debounce, autocomplete, lazy load index | Fuse.js, lunr.js |
| 04 | Search Architecture — dedicated service, data sync (webhook/cron/CDC), hybrid, analytics | — |

## Command / Sintaks Penting

```bash
# Meilisearch (Docker)
docker run -d --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY=master-key-rahasia \
  -v $(pwd)/meili_data:/meili_data \
  getmeili/meilisearch:v1.10

npm install meilisearch
npm install fuse.js
npm install lunr
```

### PostgreSQL Full-Text Search

```sql
-- 1. Tambah kolom tsvector
ALTER TABLE articles ADD COLUMN search_vector tsvector;

-- 2. Auto-update trigger
CREATE FUNCTION articles_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.title,'') || ' ' || coalesce(NEW.body,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_articles_search
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION articles_search_update();

-- 3. GIN Index
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- 4. Search query
SELECT id, title, body
FROM articles
WHERE search_vector @@ to_tsquery('indonesia & ekonomi')
ORDER BY ts_rank(search_vector, to_tsquery('indonesia & ekonomi')) DESC;

-- 5. Highlight
SELECT id, title, ts_headline('english', body, to_tsquery('indonesia')) AS highlighted
FROM articles WHERE search_vector @@ to_tsquery('indonesia');
```

**Tsquery operators:**
| Operator | Arti | Contoh |
|----------|------|--------|
| `&` | AND | `'cat & run'` |
| `\|` | OR | `'cat \| dog'` |
| `!` | NOT | `'!bird'` |
| `<->` | Phrase (adjacent) | `'cat <-> garden'` |

### Meilisearch — Setup & Index

```javascript
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: 'http://localhost:7700',
  apiKey: 'master-key-rahasia'
});

// Add documents
const response = await client.index('products').addDocuments(documents);

// Search
const results = await client.index('products').search('kopi', {
  limit: 10,
  filter: ['category = Minuman'],
  sort: ['price:asc']
});

// Typo tolerance (default on, max 2 typos)
// Ranking rules (order matters):
//   words → typo → proximity → attribute → sort → exactness
```

### Meilisearch — Filterable & Faceted

```javascript
// Update settings — set filterable + sortable attributes
await client.index('products').updateSettings({
  filterableAttributes: ['category', 'tags', 'price'],
  sortableAttributes: ['price', 'createdAt'],
  searchableAttributes: ['name', 'description', 'tags']
});

// Search with filter
const results = await client.index('products').search('kopi', {
  filter: ['category = Minuman', 'price < 50000'],
  sort: ['price:asc']
});

// Faceted search (get counts)
const results = await client.index('products').search('kopi', {
  facets: ['category', 'tags']
});
// results.facetDistribution = { category: { "Minuman": 5, "Makanan": 2 } }
```

### Fuse.js — Client-Side Fuzzy Search

```javascript
import Fuse from 'fuse.js';

const items = [
  { id: 1, title: 'Kopi Robusta Aceh', category: 'Minuman' },
  { id: 2, title: 'Teh Hijau Jawa', category: 'Minuman' }
];

const fuse = new Fuse(items, {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'description', weight: 1 },
    { name: 'tags', weight: 1.5 }
  ],
  threshold: 0.4,        // 0=exact, 1=match all
  distance: 100,          // max fuzzy distance
  includeScore: true,
  includeMatches: true    // for highlighting
});

const results = fuse.search('kopi');
// [{ item: {...}, refIndex: 0, score: 0.081 }]
```

**Fuse.js Threshold:**
| Threshold | Behavior | Use Case |
|-----------|----------|----------|
| 0.0 | Exact only | Code / SKU search |
| 0.2 | Strict, minor typo | Product codes |
| 0.4 | Moderate fuzzy | General search (default) |
| 0.6-1.0 | Loose | Catch-all, typo-heavy |

### Debounced Autocomplete

```javascript
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

const searchInput = document.getElementById('search');
searchInput.addEventListener('input', debounce(async (e) => {
  const results = await client.index('products').search(e.target.value);
  renderDropdown(results.hits);
}, 300));
```

### Search Sync Architecture

| Method | Latency | Complexity | Reliability |
|--------|---------|------------|-------------|
| **Webhook** (DB → API → Meilisearch) | ~1s | Low | Needs retry logic |
| **Cron polling** | 5-30s | Low | Simple but delayed |
| **CDC** (Debezium/WAL) | <1s | High | Most reliable |
| **Application-level** | Immediate | Low | Tightly coupled |

## Tips & Trik

- **PostgreSQL FTS** untuk data kecil (< 100k) — gak perlu infra tambahan
- **Meilisearch** untuk UX pencarian — typo tolerance + instant response built-in
- **Fuse.js** untuk dataset < 5k items, static data, offline support
- **Threshold 0.4** sweet spot untuk general search
- **Include matches: true** untuk highlight posisi match di result
- **Debounce 300ms** — standard untuk autocomplete, gak trigger tiap keystroke
- **Meilisearch ranking rules** — urutan matters: `words → typo → proximity → attribute → sort → exactness`
- **Hybrid approach** — PostgreSQL FTS untuk exact query, Meilisearch untuk explore/search UI
- **Search analytics** — track query kosong, zero-result queries → improve content/index

## Common Mistakes

- ❌ **LIKE '%keyword%'** — full table scan, gak pake index, gak bisa ranking
- ❌ **Gak bikin GIN index** — full-text search tanpa index tetap lambat
- ❌ **Fuse.js threshold terlalu tinggi (> 0.6)** — terlalu banyak noise di hasil
- ❌ **Search tanpa debounce** — trigger request tiap keystroke, bikin spam API
- ❌ **Gak handle zero results** — user gak tau query gak ada hasil
- ❌ **Satu search engine buat semua** — PostgreSQL FTS + Meilisearch punya use case beda
- ❌ **Gak sync data ke Meilisearch** — data di DB tapi search index outdated
- ❌ **Missing `stopWords` config** — query kosong seperti "the", "di", "yang" bikin noise

## Link Cepat

- [Module README](.)
- [Sesi 01 — PostgreSQL Full-Text Search](01-postgres-fts.md)
- [Sesi 02 — Meilisearch](02-meilisearch.md)
- [Sesi 03 — Client-Side Search](03-client-side-search.md)
- [Sesi 04 — Search Architecture](04-search-architecture.md)
- [Quiz](quiz.md)
