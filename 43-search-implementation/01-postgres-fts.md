# 01. PostgreSQL Full-Text Search

## Kenapa LIKE `%keyword%` Gak Cukup?

Search pake `ILIKE '%cari%'` punya masalah besar:

- **Gak pake index** — query full table scan, lambat di tabel besar
- **Gak ngerti bahasa** — `'lari'` gak match `'berlari'` atau `'larilah'`
- **Gak bisa ranking** — mana hasil paling relevan? semua return
- **Gak handle typo** — `'lari'` vs `'lariii'`

```sql
-- ❌ Lambat & terbatas
SELECT * FROM articles WHERE title ILIKE '%indonesia%';

-- ✅ Cepet & pinter — full-text search
SELECT * FROM articles WHERE search_vector @@ to_tsquery('indonesia');
```

## Tsvector & Tsquery

### tsvector — Ubah teks jadi searchable tokens

`to_tsvector('english', text)` → parse teks, ubah ke lexemes (kata dasar), hapus stop words.

```sql
SELECT to_tsvector('english', 'The cats are running through the garden');
-- output: 'cat':2 'garden':6 'run':3
-- "the", "are", "through" ilang (stop words)
-- "cats" → "cat" (lemma)
-- "running" → "run" (lemma)
```

### tsquery — Query format buat search

```sql
SELECT to_tsquery('english', 'cat & run');
-- output: 'cat' & 'run'

SELECT to_tsquery('english', 'cat | dog');
SELECT to_tsquery('english', '!bird');
SELECT to_tsquery('english', 'cucumber <-> sandwich');
-- <-> = phrase (distance 1)
```

### Match operator `@@`

```sql
-- AND match
SELECT 'cat run garden'::tsvector @@ to_tsquery('cat & run'); -- true

-- OR match
SELECT 'cat dog'::tsvector @@ to_tsquery('cat | bird'); -- true

-- NOT match
SELECT 'cat dog'::tsvector @@ to_tsquery('cat & !bird'); -- true
```

## Setup Full-Text Search di PostgreSQL

### 1. Tambah kolom tsvector

```sql
-- Tambah kolom search_vector
ALTER TABLE articles ADD COLUMN search_vector tsvector;

-- Isi dari kolom title + body
UPDATE articles
SET search_vector = to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,''));
```

### 2. Auto-update pake trigger

```sql
CREATE FUNCTION articles_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.title,'') || ' ' || coalesce(NEW.body,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_articles_search
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION articles_search_update();
```

### 3. GIN Index — biar cepet

```sql
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);
```

**Kenapa GIN (Generalized Inverted Index)?** — nyimpen mapping dari token → row. Sama kayak index di buku: cari kata → langsung ke halaman.

### 4. Query search

```sql
SELECT id, title, body
FROM articles
WHERE search_vector @@ to_tsquery('english', 'indonesia & ekonomi')
ORDER BY ts_rank(search_vector, to_tsquery('english', 'indonesia & ekonomi')) DESC
LIMIT 20;
```

## Search Ranking — `ts_rank` & `ts_rank_cd`

### ts_rank — frekuensi + kemunculan

```sql
SELECT 
  id, title,
  ts_rank(search_vector, query) AS score
FROM articles, to_tsquery('english', 'indonesia & ekonomi') query
WHERE search_vector @@ query
ORDER BY score DESC;
```

Skor tinggi kalau keyword muncul berkali-kali. Tapi biasa bias ke dokumen panjang.

### ts_rank_cd — coverage density

```sql
SELECT 
  id, title,
  ts_rank_cd(search_vector, query) AS score
FROM articles, to_tsquery('english', 'indonesia & ekonomi') query
WHERE search_vector @@ query
ORDER BY score DESC;
```

`ts_rank_cd` bagi skor sama panjang dokumen — fair buat dokumen pendek vs panjang.

### Weighted ranking — judul lebih penting

```sql
-- setweight: A=1.0, B=0.4, C=0.2, D=0.1
SELECT 
  id, title,
  ts_rank(
    setweight(to_tsvector('english', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(body,'')), 'B'),
    query
  ) AS score
FROM articles, to_tsquery('english', 'indonesia') query
WHERE to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,'')) @@ query
ORDER BY score DESC;
```

## Language Config

PostgreSQL support banyak language config buat stemming & stop words.

### English

```sql
SELECT to_tsvector('english', 'running faster'); -- 'run' 'fast'
```

### Simple (no stemming, no stop words)

```sql
SELECT to_tsvector('simple', 'Running running RUNNING'); -- 'running' 'running' 'running'
```

Berguna kalau mau exact match case-insensitive.

### Indonesian

```sql
SELECT to_tsvector('indonesian', 'berlarian berlari'); -- 'lari' 'lari'
```

Daftar language bawaan: `english`, `indonesian`, `simple`, `dutch`, `french`, `german`, `spanish`, dll.

Cek yg tersedia:
```sql
SELECT cfgname FROM pg_ts_config;
```

### Multi-language column

```sql
ALTER TABLE articles ADD COLUMN lang varchar(2) DEFAULT 'en';

CREATE FUNCTION articles_search_update() RETURNS trigger AS $$
DECLARE
  config regconfig := 'simple';
BEGIN
  config := CASE NEW.lang
    WHEN 'en' THEN 'english'::regconfig
    WHEN 'id' THEN 'indonesian'::regconfig
    ELSE 'simple'::regconfig
  END;
  NEW.search_vector := to_tsvector(config, coalesce(NEW.title,'') || ' ' || coalesce(NEW.body,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Query Syntax Variations

### `plainto_tsquery` — plain text → tsquery (AND)

```sql
-- 'indonesia ekonomi' → 'indonesia' & 'ekonomi'
SELECT * FROM articles 
WHERE search_vector @@ plainto_tsquery('english', 'indonesia ekonomi');
```

### `phraseto_tsquery` — exact phrase

```sql
-- 'wisata alam' → 'wisata' <-> 'alam'
SELECT * FROM articles 
WHERE search_vector @@ phraseto_tsquery('english', 'wisata alam');
```

### `websearch_to_tsquery` — Google-like syntax

```sql
-- "wisata alam" = phrase, -jakarta = exclude, OR = or
SELECT * FROM articles 
WHERE search_vector @@ websearch_to_tsquery('english', '"wisata alam" -jakarta OR pantai');
```

Syntax: `"..."` phrase, `-` exclude, `OR` logical OR, sisanya AND.

## Highlight Results — `ts_headline`

Tampilin snippet dengan keyword yang di-highlight.

```sql
SELECT 
  id, title,
  ts_headline('english', body, query, 
    'StartSel=<mark>, StopSel=</mark>, 
     MaxWords=50, MinWords=20, 
     HighlightAll=FALSE'
  ) AS snippet
FROM articles, to_tsquery('english', 'indonesia & ekonomi') query
WHERE search_vector @@ query;
```

Output: `"Perekonomian <mark>Indonesia</mark> tumbuh 5%..."`

Parameter `ts_headline`:
- `StartSel`/`StopSel` — tag HTML buat highlight
- `MaxWords`/`MinWords` — panjang snippet
- `HighlightAll` — semua kata atau cuma sebagian
- `FragmentDelimiter` — pemisah antar fragmen (default `...`)

## Full Query Pattern

```sql
WITH query AS (
  SELECT plainto_tsquery('english', 'wisata alam indonesia') AS q
)
SELECT 
  a.id, a.title, a.slug,
  ts_rank_cd(a.search_vector, q.q) AS score,
  ts_headline('english', a.body, q.q,
    'StartSel=<mark class="hl">, StopSel=</mark>, MaxWords=40, MinWords=15'
  ) AS snippet
FROM articles a, query q
WHERE a.search_vector @@ q.q
  AND a.published = true
ORDER BY score DESC
LIMIT 20;
```

## Performance Tips

1. **Partial index** — cuma search di published articles
```sql
CREATE INDEX idx_articles_search_published 
ON articles USING GIN(search_vector) 
WHERE published = true;
```

2. **Combine dengan filter lain**
```sql
-- GIN + btree — PostgreSQL bisa combine di bitmap scan
CREATE INDEX idx_articles_category ON articles(category_id);
```

3. **Vacuum & analyze** — jaga index tetap optimal
```sql
ANALYZE articles;
```

4. **Limit hasil** — gak perlu return 1000 row
5. **Gunakan `websearch_to_tsquery`** — user-friendly, handle special chars otomatis

## Latihan

### Latihan 1: Setup Full-Text Search
Buat tabel `products` dengan kolom `name`, `description`, `category`. Tambah kolom `search_vector`, trigger auto-update, dan GIN index. Query cari produk berdasarkan kata kunci "kopi robusta".

### Latihan 2: Ranking & Weight
Buat query search produk dengan weighted ranking: judul (weight A), deskripsi (weight B), kategori (weight C). Tampilkan skor dan pastikan produk dengan judul match muncul di atas.

### Latihan 3: Highlight & Snippet
Search artikel dengan keyword "berita politik terbaru". Tampilkan title, score, dan snippet dengan keyword di-highlight pake `<mark>` tag. Batasi snippet 30-50 kata.

### Latihan 4: Multi-Language Search
Buat tabel `documents` dengan kolom `title`, `content`, `lang` (en/id). Konfigurasi trigger pake language config sesuai kolom `lang`. Coba search di kedua bahasa dan bandingkan hasil stemming-nya.
