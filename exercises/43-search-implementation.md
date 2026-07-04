# Search Implementation — Latihan

## Level 1: Dasar

### 1. PostgreSQL FTS — Basic Query
**Pertanyaan:** Implementasi Full Text Search di PostgreSQL:

```sql
-- === LENGKAPI: Buat table dengan FTS support ===
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2),
  -- === LENGKAPI: tambah kolom untuk FTS ===
  -- 1. Tambahkan kolom search_vector tipe tsvector
  -- 2. Buat GIN index untuk search_vector
  -- 3. Buat trigger untuk auto-update search_vector saat data berubah
);

-- === LENGKAPI: FTS Query ===
-- 1. Search produk dengan keyword "laptop gaming"
SELECT *, ts_rank(search_vector, plainto_tsquery('indonesian', 'laptop gaming')) AS rank
FROM products
WHERE search_vector @@ plainto_tsquery('indonesian', 'laptop gaming')
ORDER BY rank DESC;

-- 2. Search dengan ranking dan highlight
-- === LENGKAPI ===

-- 3. Search dengan fuzzy matching (typo tolerance)
-- === LENGKAPI ===

-- 4. Search dengan BOOLEAN operators
-- Cari produk yang mengandung "laptop" DAN ("gaming" ATAU "professional")
-- === LENGKAPI ===
```

**Hint:** Kolom: `search_vector tsvector`. Trigger: `CREATE TRIGGER trigger_search_update BEFORE INSERT OR UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_search_vector()`. Function: `NEW.search_vector := setweight(to_tsvector('indonesian', NEW.name), 'A') || setweight(to_tsvector('indonesian', NEW.description), 'B')`. Rank: `ts_rank()` atau `ts_rank_cd()` (coverage rank). Highlight: `ts_headline('indonesian', description, plainto_tsquery('indonesian', 'laptop'))`.

---

### 2. Meilisearch — Index Setup
**Pertanyaan:** Setup Meilisearch untuk product search:

```typescript
import { MeiliSearch } from 'meilisearch';

const meili = new MeiliSearch({
  host: process.env.MEILI_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILI_MASTER_KEY,
});

// === LENGKAPI: Setup index ===
async function setupProductIndex() {
  // === LENGKAPI ===
  // 1. Buat index 'products'
  // 2. Set searchable attributes (name, description, category)
  // 3. Set filterable attributes (category, price, rating)
  // 4. Set sortable attributes (price, rating, created_at)
  // 5. Set ranking rules
  // 6. Set synonyms
  // 7. Set stop words
}

// === LENGKAPI: Add documents ===
async function syncProductsToMeili(products: Product[]) {
  // === LENGKAPI ===
  // 1. Transform products ke Meilisearch format
  // 2. Add/update documents
  // 3. Handle errors
  // 4. Return task ID untuk monitoring
}

// === LENGKAPI: Search function ===
async function searchProducts(
  query: string,
  filters?: {
    category?: string;
    priceMin?: number;
    priceMax?: number;
    rating?: number;
  },
  options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
  }
): Promise<{
  hits: Product[];
  totalHits: number;
  processingTimeMs: number;
  facets: Record<string, Record<string, number>>;
}> {
  // === LENGKAPI ===
  // 1. Build filter string
  // 2. Execute search dengan facets
  // 3. Return results dengan metadata
}
```

**Hint:** Meilisearch index settings: `index.updateSettings({ searchableAttributes: ['name^3', 'description', 'category'], filterableAttributes: ['category', 'price'], sortableAttributes: ['price', 'rating'] })`. Search: `index.search(query, { filter, facets, limit, offset })`. Ranking: `['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness']`. Synonyms: `{ laptop: ['nb', 'notebook'], hp: ['handphone', 'smartphone'] }`.

---

### 3. Fuse.js — Client-Side Search
**Pertanyaan:** Implementasi fuzzy search di client-side:

```typescript
import Fuse from 'fuse.js';

interface Article {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
}

const articles: Article[] = [
  // ... data
];

// === LENGKAPI: Fuse.js setup ===
const fuse = new Fuse(articles, {
  // === LENGKAPI: konfigurasi ===
  // 1. Keys untuk search (title: weight 0.4, content: weight 0.3, tags: weight 0.3)
  // 2. Threshold (0.0 = exact match, 1.0 = match semua)
  // 3. Include matches (highlight positions)
  // 4. Include score
  // 5. Min match char length
  // 6. Use extended search
});

// === LENGKAPI: Search function ===
function searchArticles(
  query: string,
  options?: {
    threshold?: number;
    keys?: string[];
    limit?: number;
  }
): Array<{
  item: Article;
  score: number;
  matches: Array<{
    key: string;
    indices: Array<[number, number]>;
    value: string;
  }>;
}> {
  // === LENGKAPI ===
  // 1. Execute fuzzy search
  // 2. Filter by threshold
  // 3. Limit results
  // 4. Return dengan scores
}

// === LENGKAPI: Highlight function ===
function highlightMatch(text: string, indices: Array<[number, number]>): string {
  // === LENGKAPI ===
  // Wrap matched characters dengan <mark> tags
  // Contoh: "Laptop Gaming" dengan indices [[0,4], [6,11]]
  // Return: "<mark>Lapt</mark>p Ga<mark>ming</mark>"
}

// === LENGKAPI: Search UI hook ===
function useSearch() {
  // === LENGKAPI ===
  // 1. State: query, results, isLoading, error
  // 2. Debounced search (300ms delay)
  // 3. Clear function
  // 4. Recent searches (localStorage)
}
```

**Hint:** Fuse config: `{ keys: [{ name: 'title', weight: 0.4 }, { name: 'content', weight: 0.3 }, { name: 'tags', weight: 0.3 }], threshold: 0.3, includeMatches: true, includeScore: true, minMatchCharLength: 2 }`. Threshold 0.3: cukup fuzzy, toleransi typo. Extended search: `"laptop | gaming"` (OR), `"laptop & gaming"` (AND), `"laptop -gaming"` (NOT). Debounce: `setTimeout` + `clearTimeout`.

---

### 4. Search Autocomplete
**Pertanyaan:** Implementasi search autocomplete:

```typescript
// === LENGKAPI: Autocomplete API ===
app.get('/api/search/autocomplete', async (req, res) => {
  const { q, type } = req.query;
  
  // === LENGKAPI ===
  // Return suggestions berdasarkan query:
  // {
  //   queries: ["laptop gaming", "laptop murah", "laptop second"],
  //   products: [
  //     { id: 1, name: "Laptop Gaming ROG", category: "Elektronik", thumbnail: "..." },
  //     { id: 2, name: "Laptop Gaming Acer", category: "Elektronik", thumbnail: "..." }
  //   ],
  //   categories: ["Laptop Gaming", "Laptop Kantor"]
  // }
});

// === LENGKAPI: Autocomplete engine ===
class AutocompleteEngine {
  private trie: TrieNode;
  private popularQueries: Map<string, number>;
  
  constructor() {
    this.trie = new TrieNode();
    this.popularQueries = new Map();
  }
  
  // === LENGKAPI ===
  addQuery(query: string) {
    // Tambah query ke trie dan increment popularity
  }
  
  getSuggestions(prefix: string, limit: number = 5): string[] {
    // Return top suggestions berdasarkan prefix dan popularity
  }
  
  trackSearch(query: string) {
    // Track queries untuk improve suggestions
  }
}

// === LENGKAPI: Trie implementation ===
class TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  frequency: number;
  // === LENGKAPI ===
}
```

**Hint:** Trie: prefix tree untuk fast autocomplete. Setiap node punya children map, isEnd flag, dan frequency. Search: traverse trie berdasarkan prefix, collect all words di subtree, sort by frequency. Popularity: increment counter setiap query digunakan. Cache: simpan top 1000 queries di Redis. Debounce: 150ms delay sebelum API call (lebih cepat dari search biasa).

---

## Level 2: Menengah

### 5. Hybrid Search Architecture
**Pertanyaan:** Desain hybrid search yang menggabungkan beberapa search engine:

```typescript
// === LENGKAPI: Hybrid search architecture ===
// Gabungkan: PostgreSQL FTS + Meilisearch + Fuse.js

interface SearchStrategy {
  name: string;
  search: (query: string, options: SearchOptions) => Promise<SearchResult[]>;
  weight: number; // bobot untuk scoring
}

// === LENGKAPI: Search orchestrator ===
class HybridSearchEngine {
  private strategies: SearchStrategy[];
  
  constructor() {
    this.strategies = [
      // === LENGKAPI ===
      // 1. Meilisearch: full-text + typo tolerance (weight: 0.5)
      // 2. PostgreSQL FTS: exact match + ranking (weight: 0.3)
      // 3. Fuse.js: fuzzy match client-side (weight: 0.2)
    ];
  }
  
  async search(query: string, options: SearchOptions): Promise<{
    results: MergedResult[];
    strategy: string; // mana yang paling banyak contribute
    processingTime: number;
  }> {
    // === LENGKAPI ===
    // 1. Execute semua strategies in parallel
    // 2. Merge results berdasarkan ID
    // 3. Hitung combined score
    // 4. Sort by combined score
    // 5. Return merged results
  }
  
  // === LENGKAPI: Score merging ===
  private mergeScores(results: SearchResult[][]): MergedResult[] {
    // === LENGKAPI ===
    // Untuk setiap result:
    // combinedScore = sum(weight_i * score_i) / count(strategies yang return result)
    // Higher weight = lebih dipercaya
  }
}

// === LENGKAPI: Search result merger ===
interface MergedResult {
  id: string;
  type: 'product' | 'article' | 'user';
  title: string;
  snippet: string;
  combinedScore: number;
  individualScores: Record<string, number>;
  highlights: Highlight[];
}
```

**Hint:** Hybrid approach: (1) Meilisearch: cepat, typo-toleran, good untuk product search. (2) PostgreSQL FTS: akurat, bisa JOIN data, bagus untuk exact match. (3) Fuse.js: client-side, bagus untuk small dataset atau instant feedback. Merge: gunakan Reciprocal Rank Fusion (RRF) atau weighted average. Parallel execution: `Promise.all(strategies.map(s => s.search(query, options)))`.

---

### 6. Search Analytics
**Pertanyaan:** Implementasi search analytics:

```typescript
// === LENGKAPI: Search event tracking ===
interface SearchEvent {
  query: string;
  userId?: string;
  resultsCount: number;
  selectedResultId?: string;
  selectedPosition?: number;
  processingTimeMs: number;
  timestamp: Date;
  filters?: Record<string, any>;
}

// === LENGKAPI: Track search ===
async function trackSearch(event: SearchEvent) {
  // === LENGKAPI ===
  // 1. Simpan event ke database
  // 2. Update popular queries
  // 3. Update zero-result queries
  // 4. Update search-to-click ratio
}

// === LENGKAPI: Analytics queries ===
// 1. Top queries (7 hari terakhir)
async function getTopQueries(days: number = 7, limit: number = 20) {
  // === LENGKAPI ===
  // SELECT query, COUNT(*) as count, AVG(results_count) as avg_results
  // FROM search_events
  // WHERE timestamp > NOW() - INTERVAL '7 days'
  // GROUP BY query
  // ORDER BY count DESC
  // LIMIT 20
}

// 2. Zero-result queries (query yang tidak ada hasil)
async function getZeroResultQueries(days: number = 7) {
  // === LENGKAPI ===
  // Query yang resultsCount = 0
  // Ini menunjukkan gap di content/produk
}

// 3. Search-to-click ratio
async function getSearchToClickRatio(days: number = 7) {
  // === LENGKAPI ===
  // Hitung: (searches dengan click) / total searches
  // Ratio tinggi = search relevan
  // Ratio rendah = perlu perbaikan
}

// 4. Average position of clicked results
async function getAverageClickPosition(days: number = 7) {
  // === LENGKAPI ===
  // Jika rata-rata position > 5, ranking perlu diperbaiki
}

// === LENGKAPI: Search suggestions improvement ===
async function getQuerySuggestions(partialQuery: string) {
  // === LENGKAPI ===
  // Berdasarkan search history:
  // 1. Complete queries yang mirip
  // 2. Sort by frequency
  // 3. Filter by recent activity
}
```

**Hint:** Schema: `CREATE TABLE search_events (id UUID, query TEXT, user_id UUID, results_count INT, selected_result_id UUID, selected_position INT, processing_time_ms INT, filters JSONB, created_at TIMESTAMP)`. Indexes: `(query, created_at)`, `(created_at)`. Zero-result: `WHERE results_count = 0 GROUP BY query ORDER BY COUNT(*) DESC`. Click ratio: `COUNT(selected_result_id)::float / COUNT(*)`.

---

### 7. Search Filters & Facets
**Pertanyaan:** Implementasi advanced search filters:

```typescript
// === LENGKAPI: Filter builder ===
interface SearchFilters {
  categories?: string[];
  priceRange?: { min?: number; max?: number };
  rating?: number;
  inStock?: boolean;
  brand?: string[];
  tags?: string[];
  dateRange?: { from?: Date; to?: Date };
}

// === LENGKAPI: Build filter query ===
function buildFilterQuery(filters: SearchFilters): string {
  // === LENGKAPI ===
  // Build filter string untuk Meilisearch:
  // category = 'Elektronik' AND price > 1000000 AND rating >= 4
  // atau untuk PostgreSQL:
  // WHERE category IN (...) AND price BETWEEN ... AND ...
}

// === LENGKAPI: Facets computation ===
async function getSearchFacets(baseQuery: string): Promise<{
  categories: Array<{ name: string; count: number }>;
  priceRanges: Array<{ label: string; min: number; max: number; count: number }>;
  ratings: Array<{ rating: number; count: number }>;
  brands: Array<{ name: string; count: number }>;
}> {
  // === LENGKAPI ===
  // Hitung jumlah hasil untuk setiap filter value
  // Contoh: jika search "laptop":
  // categories: [{ name: "Elektronik", count: 45 }, { name: "Accessories", count: 12 }]
  // priceRanges: [{ label: "< 5jt", count: 20 }, { label: "5-10jt", count: 25 }]
}

// === LENGKAPI: Dynamic facets ===
// Meilisearch facets:
const searchWithFacets = async (query: string) => {
  // === LENGKAPI ===
  // const results = await index.search(query, {
  //   facets: ['category', 'price_range', 'rating', 'brand'],
  //   filter: buildFilterQuery(currentFilters)
  // });
  // return {
  //   hits: results.hits,
  //   facets: results.facetsDistribution
  // };
};
```

**Hint:** Meilisearch facets: `index.search(query, { facets: ['category', 'brand'] })` return `facetsDistribution`. Filter syntax: `category = 'Elektronik' AND price > 100000`. Price ranges: definisikan ranges di config (0-1jt, 1-5jt, 5-10jt, 10jt+). Dynamic: gunakan actual data untuk generate ranges. **PENTING**: facets harus dihitung setelah filter diterapkan (untuk menunjukkan jumlah yang relevan).

---

## Level 3: Lanjutan

### 8. Search Ranking Algorithm
**Pertanyaan:** Implementasi custom ranking algorithm:

```typescript
// === LENGKAPI: Custom ranking ===
interface RankedResult {
  id: string;
  score: number;
  factors: {
    textRelevance: number;  // seberapa cocok dengan query
    popularity: number;     // seberapa populer (views, purchases)
    recency: number;        // seberapa baru
    availability: number;   // apakah masih tersedia
    priceRange: number;     // apakah di range yang wajar
  };
}

// === LENGKAPI: Scoring function ===
function calculateRankScore(
  product: Product,
  query: string,
  userContext?: UserContext
): RankedResult {
  // === LENGKAPI ===
  // Text relevance (40% weight)
  // 1. Exact match di name: 1.0
  // 2. Partial match di name: 0.7
  // 3. Match di description: 0.4
  // 4. Match di category: 0.3
  
  // Popularity (25% weight)
  // 1. Normalize: views/1000 (max 1.0)
  // 2. Sales history bonus
  // 3. Rating bonus (4+ stars)
  
  // Recency (15% weight)
  // 1. Products < 7 hari: 1.0
  // 2. Products < 30 hari: 0.7
  // 3. Products < 90 hari: 0.4
  // 4. Products > 90 hari: 0.2
  
  // Availability (15% weight)
  // 1. In stock: 1.0
  // 2. Low stock (< 5): 0.7
  // 3. Out of stock: 0.0
  
  // Personalization (5% weight)
  // 1. Match user's past purchases category
  // 2. Match user's preferred price range
  
  return {
    id: product.id,
    score: /* === HITUNG WEIGHTED AVERAGE === */,
    factors: { /* === ISI === */ }
  };
}

// === LENGKAPI: A/B test ranking ===
class RankingABTest {
  private variants: Map<string, (product: Product, query: string) => RankedResult>;
  
  constructor() {
    this.variants = new Map();
    // Variant A: original ranking
    // Variant B: boosted recency
    // Variant C: boosted popularity
  }
  
  assignVariant(userId: string): string {
    // === LENGKAPI ===
    // Deterministic: hash(userId) % 3
    // Pastikan user selalu dapet variant yang sama
  }
  
  async trackConversion(userId: string, variant: string, clicked: boolean) {
    // === LENGKAPI ===
    // Track click-through rate per variant
  }
}
```

**Hint:** Weighted scoring: `score = textRelevance * 0.40 + popularity * 0.25 + recency * 0.15 + availability * 0.15 + personalization * 0.05`. Normalize semua factors ke range [0, 1]. A/B test: deterministic assignment berdasarkan user ID hash. Conversion tracking: `clicks / impressions` per variant. **PENTING**: jangan terlalu banyak weight ke personalization — bisa bikin filter bubble.

---

### 9. Search Performance Optimization
**Pertanyaan:** Optimasi performa search:

```typescript
// === LENGKAPI: Search cache ===
class SearchCache {
  private redis: Redis;
  private defaultTTL: number;
  
  constructor(redis: Redis, defaultTTL: number = 300) {
    this.redis = redis;
    this.defaultTTL = defaultTTL;
  }
  
  // === LENGKAPI: Cache key generation ===
  getCacheKey(query: string, filters: SearchFilters, page: number): string {
    // === LENGKAPI ===
    // Hash query + filters + page untuk cache key
    // Contoh: "search:a1b2c3d4" 
  }
  
  // === LENGKAPI: Get/Set ===
  async get(key: string): Promise<SearchResult | null> {
    // === LENGKAPI ===
    // Get dari Redis, parse JSON
  }
  
  async set(key: string, result: SearchResult, ttl?: number) {
    // === LENGKAPI ===
    // Set ke Redis dengan TTL
  }
  
  // === LENGKAPI: Cache invalidation ===
  async invalidatePattern(pattern: string) {
    // === LENGKAPI ===
    // Hapus cache yang match pattern
    // Contoh: invalidate semua cache untuk "laptop"
  }
}

// === LENGKAPI: Query optimization ===
// 1. Query suggestion cache
// 2. Popular query pre-computation
// 3. Result set caching
// 4. Facet caching

// === LENGKAPI: Search performance monitoring ===
async function monitorSearchPerformance() {
  // === LENGKAPI ===
  // Track:
  // - P50, P95, P99 search latency
  // - Cache hit rate
  // - Queries per second
  // - Slow queries (> 200ms)
  // - Index size dan growth rate
}
```

**Hint:** Cache key: `crypto.createHash('md5').update(JSON.stringify({ query, filters, page })).digest('hex')`. TTL: populer queries cache lebih lama (1 jam), rarely searched cache lebih pendek (5 menit). Invalidation: saat data berubah, invalidate related cache entries. Pre-computation: top 100 queries di-cache permanen. **PENTING**: cache perlu invalidate saat products ditambah/dihapus/updated.

---

### 10. Search UI Component
**Pertanyaan:** Implementasi search UI component yang komprehensif:

```tsx
// === LENGKAPI: Search page component ===
interface SearchPageProps {
  initialQuery?: string;
}

export default function SearchPage({ initialQuery }: SearchPageProps) {
  // === LENGKAPI ===
  // 1. Search input dengan autocomplete
  // 2. Filter sidebar
  // 3. Results grid/list
  // 4. Pagination
  // 5. Sort options
  // 6. Loading states
  // 7. Empty state
  // 8. Error handling
}

// === LENGKAPI: Search input component ===
function SearchInput() {
  // === LENGKAPI ===
  // Features:
  // 1. Debounced input (300ms)
  // 2. Autocomplete dropdown
  // 3. Recent searches (localStorage)
  // 4. Keyboard navigation (arrow keys, enter, escape)
  // 5. Clear button
  // 6. Search history
  // 7. Voice search (Web Speech API)
}

// === LENGKAPI: Filter sidebar component ===
function FilterSidebar({ facets, onFilterChange }) {
  // === LENGKAPI ===
  // Features:
  // 1. Category checkboxes dengan count
  // 2. Price range slider
  // 3. Rating filter (bintang)
  // 4. Brand filter
  // 5. Active filters chips
  // 6. Clear all filters
  // 7. Mobile: slide-in drawer
}

// === LENGKAPI: Search results component ===
function SearchResults({ results, loading, error }) {
  // === LENGKAPI ===
  // Features:
  // 1. Grid/List view toggle
  // 2. Product card dengan image, title, price, rating
  // 3. Highlight matching text
  // 4. Loading skeleton
  // 5. Empty state (no results)
  // 6. Result count
  // 7. "Did you mean?" suggestions
}
```

**Hint:** Keyboard navigation: `onKeyDown` handler untuk arrow keys (navigate autocomplete), Enter (select), Escape (close). Voice search: `webkitSpeechRecognition` API. Highlight: wrap matched text dengan `<mark>` tags. Skeleton: gunakan CSS animation untuk loading state. Mobile: use `<Drawer>` component untuk filters. **PENTING**: accessibility — proper ARIA labels, keyboard navigation, screen reader support.
