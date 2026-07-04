# 02. Meilisearch

## Apa itu Meilisearch?

Meilisearch adalah search engine dedicated yang:

- **Typo-tolerant** — otomatis handle typo sampai configurable distance
- **Instant search** — response < 50ms, cocok buat autocomplete
- **Filter & faceted** — filter + aggregasi data di hasil search
- **Ranking rules** — bisa atur prioritas relevansi
- **Auto-complete** — built-in, gak perlu setup sendiri
- **REST API** — gak perlu SDK khusus, pake HTTP biasa

Perbandingan:

| Fitur | PostgreSQL FTS | Meilisearch | Elasticsearch |
|-------|---------------|-------------|---------------|
| Setup | Built-in | Docker/paket | Docker/JVM |
| Typo tolerance | ❌ Manual | ✅ Built-in | ✅ Custom |
| Speed (1M docs) | ~50-200ms | ~10-50ms | ~50-200ms |
| Complex query syntax | ✅ TSQuery | ✅ REST API | ✅ DSL JSON |
| Devops overhead | None | Minimal | Tinggi |
| Use case | Secondary search | Primary search | Enterprise search |

## Setup Meilisearch

### Docker (recommended)

```bash
docker run -d --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY=master-key-rahasia \
  -v $(pwd)/meili_data:/meili_data \
  getmeili/meilisearch:v1.10
```

Default: `http://localhost:7700`. Master key wajib di production.

### Local binary (Linux)

```bash
curl -L https://github.com/meilisearch/meilisearch/releases/latest/download/meilisearch-linux-amd64 -o meilisearch
chmod +x meilisearch
./meilisearch --master-key=master-key-rahasia
```

### Node.js SDK

```bash
npm install meilisearch
```

```js
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: 'http://localhost:7700',
  apiKey: 'master-key-rahasia'
});
```

## Index & Documents

### Buat index

```bash
curl -X POST 'http://localhost:7700/indexes' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer master-key-rahasia' \
  --data-binary '{ "uid": "products", "primaryKey": "id" }'
```

`uid` = nama index, `primaryKey` = field unique identifier.

### Add documents

```js
const documents = [
  {
    id: 1,
    name: "Kopi Robusta Aceh",
    description: "Kopi robusta dari dataran tinggi Aceh dengan rasa earthy",
    category: "Minuman",
    price: 45000,
    stock: 100,
    tags: ["kopi", "robusta", "aceh"]
  },
  {
    id: 2,
    name: "Teh Hijau Jawa Barat",
    description: "Teh hijau premium dari perkebunan Gambung",
    category: "Minuman",
    price: 35000,
    stock: 200,
    tags: ["teh", "hijau", "jawa"]
  }
];

const response = await client.index('products').addDocuments(documents);
// { taskUid: 1 }
```

### Cek status indexing

```js
const task = await client.getTask(1);
// { status: "succeeded", type: "documentAdditionOrUpdate", ... }
```

Meilisearch async — addDocuments return taskUid, cek status pake `getTask`.

## Searchable Attributes

### Default — semua attribute bisa di-search

Pengaturan:

```
searchableAttributes = ["*"]
```

### Custom — tentuin field mana yg di-search

```js
await client.index('products').updateSearchableAttributes([
  'name',
  'description',
  'tags'
]);
```

Prioritas sesuai urutan array. Name paling penting, terus description, terus tags.

```js
// Cari keyword "kopi" — name > description > tags
const results = await client.index('products').search('kopi');
```

## Filterable & Faceted Search

### Filterable attributes

Set attribute mana yg bisa di-filter:

```js
await client.index('products').updateFilterableAttributes([
  'category',
  'price',
  'stock',
  'tags'
]);
```

### Filter syntax

```js
// Filter by kategori
const results = await client.index('products').search('kopi', {
  filter: 'category = "Minuman"'
});

// Range filter
const results = await client.index('products').search('kopi', {
  filter: 'price >= 40000 AND price <= 100000'
});

// Array filter
const results = await client.index('products').search('teh', {
  filter: 'tags IN [teh, hijau]'
});
```

Filter bisa numeric, string, boolean, dan array.

### Faceted search — aggregasi

```js
await client.index('products').updateFilterableAttributes([
  'category',
  'price'
]);

const results = await client.index('products').search('', {
  facets: ['category', 'price']
});

console.log(results.facetDistribution);
// {
//   category: { Minuman: 25, Makanan: 15 },
//   price: { '0-50000': 20, '50000-100000': 15, ... }
// }
```

Cocok buat e-commerce filter sidebar — kategori, harga, rating.

### Numeric filter

```js
// Numeric comparison
filter: 'price >= 10000 AND price <= 50000'

// OR
filter: 'category = "Minuman" OR category = "Snack"'

// Nested
filter: '(price >= 10000 AND price <= 50000) OR stock > 0'
```

## Pagination & Typo Tolerance

### Pagination

```js
const results = await client.index('products').search('kopi', {
  limit: 20,   // default 20, max 1000
  offset: 0    // halaman ke-1
});

// Hitung halaman
const totalPages = Math.ceil(results.totalHits / results.limit);
const currentPage = Math.floor(results.offset / results.limit) + 1;
```

### Typo tolerance — configurable

Meilisearch otomatis tolerate typo. Default rules:

| Panjang kata | Max typo |
|-------------|----------|
| 1-4 char | 1 typo |
| 5-8 char | 2 typo |
| 9+ char | 2 typo |

Override:

```js
await client.index('products').updateTypoTolerance({
  enabled: true,
  minWordSizeForTypos: {
    oneTypo: 4,    // kata 4+ char: 1 typo
    twoTypos: 8    // kata 8+ char: 2 typo
  },
  disableOnWords: [],
  disableOnAttributes: []
});
```

Matikan typo buat field tertentu (misal kode produk):

```js
await client.index('products').updateTypoTolerance({
  enabled: true,
  disableOnAttributes: ['sku', 'barcode']
});
```

### Cara kerja typo tolerance

Meilisearch pake Levenshtein distance algorithm:

- `kpi` → match `kopi` (distance 1 — k vs o)
- `robusta` → match `robusta` (distance 0 — exact)
- `robusta` → match `robusta` (distance 1 — transposisi)

## Search Relevance Tuning

### Ranking rules — urutan prioritas relevansi

Default ranking rules:

```
["words", "typo", "proximity", "attribute", "sort", "exactness"]
```

| Rule | Fungsi |
|------|--------|
| `words` | Makin banyak kata match → makin tinggi |
| `typo` | Makin sedikit typo → makin tinggi |
| `proximity` | Kata berdekatan → makin tinggi |
| `attribute` | Match di field prioritas (searchableAttributes) |
| `sort` | Sort manual (kalau ada) |
| `exactness` | Exact phrase match → tertinggi |

Custom ranking:

```js
await client.index('products').updateRankingRules([
  'words',
  'typo',
  'proximity',
  'attribute',
  'sort',
  'exactness',
  'price:asc'     // ascending price
]);
```

### Custom ranking attributes

Buat sorting pake data sendiri:

```js
// 1. Set custom ranking
await client.index('products').updateRankingRules([
  'words',
  'typo',
  'proximity',
  'attribute',
  'sort',
  'exactness',
  'popularity:desc'  // produk populer dulu
]);

// 2. Pastiin field ada di dokumen
const documents = [
  {
    id: 1,
    name: "Kopi Robusta Aceh",
    popularity: 95,   // 0-100
    // ...
  }
];
```

### Sort parameter di query

```js
// Sort asc
await client.index('products').search('kopi', {
  sort: ['price:asc']
});

// Sort desc
await client.index('products').search('kopi', {
  sort: ['popularity:desc']
});

// Multi-sort
await client.index('products').search('kopi', {
  sort: ['popularity:desc', 'price:asc']
});
```

## Full Integration Example — Node.js

```js
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: 'http://localhost:7700',
  apiKey: process.env.MEILI_MASTER_KEY
});

const INDEX_NAME = 'products';

// 1. Setup index
async function setupIndex() {
  await client.createIndex(INDEX_NAME, { primaryKey: 'id' });
  
  await client.index(INDEX_NAME).updateSearchableAttributes([
    'name', 'description', 'tags'
  ]);
  
  await client.index(INDEX_NAME).updateFilterableAttributes([
    'category', 'price', 'stock', 'tags'
  ]);
  
  await client.index(INDEX_NAME).updateRankingRules([
    'words', 'typo', 'proximity', 'attribute', 
    'sort', 'exactness', 'popularity:desc'
  ]);
}

// 2. Index products from DB
async function indexProducts(products) {
  const { taskUid } = await client.index(INDEX_NAME).addDocuments(products);
  
  // Wait for indexing
  let task = await client.getTask(taskUid);
  while (task.status === 'processing' || task.status === 'enqueued') {
    await new Promise(r => setTimeout(r, 100));
    task = await client.getTask(taskUid);
  }
  
  if (task.status === 'failed') {
    throw new Error(`Indexing failed: ${task.error.message}`);
  }
  
  return task;
}

// 3. Search API handler
async function searchProducts(query, filters = {}) {
  const searchParams = {
    limit: filters.limit || 20,
    offset: filters.offset || 0,
    filter: buildFilter(filters),
    sort: filters.sort || ['popularity:desc'],
    facets: ['category']
  };
  
  const results = await client.index(INDEX_NAME).search(query, searchParams);
  
  return {
    hits: results.hits,
    totalHits: results.totalHits,
    facetDistribution: results.facetDistribution,
    processingTimeMs: results.processingTimeMs
  };
}

function buildFilter(filters) {
  const conditions = [];
  
  if (filters.category) {
    conditions.push(`category = "${filters.category}"`);
  }
  if (filters.minPrice) {
    conditions.push(`price >= ${filters.minPrice}`);
  }
  if (filters.maxPrice) {
    conditions.push(`price <= ${filters.maxPrice}`);
  }
  if (filters.inStock) {
    conditions.push(`stock > 0`);
  }
  
  return conditions.length > 0 ? conditions.join(' AND ') : undefined;
}

export { setupIndex, indexProducts, searchProducts };
```

## Production Checklist

- **Set master key** — gak ada anonymous access
- **Dump & backup** — `curl .../dump` buat backup index
- **Snapshots** — enable auto-snapshot `--snapshot-interval-sec=3600`
- **Resource** — Meilisearch butuh ~500MB RAM per 1M docs
- **API rate limit** — Meilisearch gak punya built-in, pake reverse proxy
- **Environments** — separate index for dev/staging/production

```bash
docker run -d --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY=master-key-prod \
  -e MEILI_ENV=production \
  -e MEILI_DUMP_DIR=/meili_data/dumps \
  -e MEILI_SNAPSHOT_INTERVAL_SEC=3600 \
  -v $(pwd)/meili_data:/meili_data \
  getmeili/meilisearch:v1.10
```

## Latihan

### Latihan 1: Setup & Index
Setup Meilisearch pake Docker. Buat index `movies` dengan primary key `id`. Add 10 dokumen film (title, director, year, genre, rating). Cek task status sampe succeeded.

### Latihan 2: Filterable & Faceted Search
Dari data film di atas, config searchable attributes (title, director, genre), filterable attributes (year, genre, rating). Search "action" dengan filter `year >= 2020 AND genre = "Action"`. Tampilkan facet distribution by genre.

### Latihan 3: Typo Tolerance
Cari film "interstallar" (sengaja typo). Catat hasilnya. Terus ubah typo tolerance settings — disable typo buat field `title`. Cek apakah hasil berubah. Atur minWordSizeForTypos biar kata < 5 char gak kena typo.

### Latihan 4: Ranking Rules Integration
Buat endpoint Express GET `/api/search?q=...&category=...&minPrice=...&sort=...`. Integrasiin Meilisearch. Implementasi custom ranking `popularity:desc`. Return response: `{ hits, totalHits, facetDistribution, processingTimeMs }`.
