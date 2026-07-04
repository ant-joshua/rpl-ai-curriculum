# 🧠 Cheatsheet: System Design

> Referensi cepet — 1 halaman. Print atau bookmark.

## Topik Utama
- **Arsitektur**: Monolitik vs Microservices — trade-off complexity vs scalability
- **Database Design**: Normalisasi (1NF/2NF/3NF), Indexing (B-tree, composite), N+1 problem
- **Caching**: Redis (in-memory), CDN (static assets), Cache Aside, Write Through, Write Behind
- **CAP Theorem**: Consistency, Availability, Partition Tolerance — pilih 2 dari 3
- **Message Queue**: RabbitMQ / Redis Pub/Sub — decouple service, async processing
- **Hosting**: Vercel (FE), Railway/Render (BE), Biznet/DO (VPS), DOKS (Kubernetes)
- **CI/CD**: GitHub Actions — auto test → build → deploy

## Command Penting

```sql
-- Normalization rules
-- 1NF: Atomic values, no repeating groups
-- 2NF: 1NF + no partial dependency (all columns depend on full PK)
-- 3NF: 2NF + no transitive dependency

-- Index
CREATE INDEX idx_users_email ON users (email);

-- Composite index
CREATE INDEX idx_orders_user_status ON orders (user_id, status);
```

```typescript
// Redis caching
const cached = await redis.get(`user:${id}`);
if (cached) return JSON.parse(cached);
const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600);
```

## Tips & Trik
- Cache aside pattern: cek cache dulu → miss → ambil dari DB → simpan ke cache
- Index kolom yang sering dipake di WHERE / JOIN — jangan semua kolom
- CAP theorem: network partition pasti terjadi, pilih CP atau AP
- N+1 problem: pake JOIN atau eager loading instead of loop query

## Common Mistakes
- ❌ Normalisasi berlebihan → query terlalu banyak JOIN (denormalize carefully)
- ❌ Cache semua data → cache cuma buat data yang sering di-read, jarang di-write
- ❌ Ga mikir CAP trade-off → milih microservices tanpa handle network failure
- ❌ Lupa indexing → query lemot pas data mulai banyak

## Link Cepat
- [Module README](README.md)
- [Latihan](../exercises/11-system-design.md)
- [Quiz](quiz.md)
