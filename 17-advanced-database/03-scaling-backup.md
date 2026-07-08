# 3. Scaling & Backup Database

Setelah DB lo makin besar (jutaan row), query mulai lambat, backup makin lama, koneksi penuh. Modul ini jawab: scaling strategies + backup/recovery.

## Connection Pooling — Biar Ga Kehabisan Koneksi

Setiap query butuh koneksi DB. Bikin-tutup koneksi tiap query = boros. Connection pool = koleksi koneksi siap pakai.

**Tanpa pool:**
```typescript
// Query 1 → buka koneksi → query → tutup → Query 2 → buka lagi...
```

**Dengan pool (PgBouncer/pg-pool):**
```typescript
// Pool punya 10 koneksi standby
// Query 1 → ambil koneksi dari pool → query → balikin ke pool
// Query 2 → ambil koneksi lain dari pool → (ga perlu buka baru)
```

```typescript
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: "myapp",
  user: "user",
  password: process.env.DB_PASSWORD,
  max: 20,              // maks 20 concurrent koneksi
  idleTimeoutMillis: 30000,  // koneksi idle ditutup setelah 30 detik
  connectionTimeoutMillis: 2000, // timeout kalo ga dapet koneksi
});

// Pakenya gampang
const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
```

### Pool Size — Berapa Ideal?

| Koneksi | CPU Core | Max Pool |
|---------|----------|----------|
| Kecil (< 100) | 1-2 core | 5-10 |
| Sedang | 4-8 core | 20-40 |
| Besar | 16+ core | 50-100 |

**Rule of thumb:** `pool_max = (core_count * 2) + effective_spindle_count`
Tapi buat sebagian besar app, 10-20 udah cukup. Lebih gede pool = lebih banyak context switching = malah lebih lambat.

## Pagination — Ambil Data Bertahap

Jangan `SELECT * FROM users` kalo users = 1 juta. Pake pagination.

### OFFSET Pagination (Standar)

```sql
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 0;  -- page 1
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 20; -- page 2
```

**Masalah:** OFFSET makin besar = makin lambat. OFFSET 100.000 tetap scan 100.000 row dulu.

### Cursor Pagination (Keyset)

```sql
SELECT * FROM users WHERE id > 0 ORDER BY id LIMIT 20;     -- page 1
SELECT * FROM users WHERE id > 20 ORDER BY id LIMIT 20;    -- page 2
SELECT * FROM users WHERE id > 40 ORDER BY id LIMIT 20;    -- page 3
```

**Lebih cepet** karena pake index langsung, ga scan row yang di-skip.

```typescript
// Cursor pagination
async function getUsers(cursor?: number, limit = 20) {
  const query = cursor
    ? "SELECT * FROM users WHERE id > $1 ORDER BY id LIMIT $2"
    : "SELECT * FROM users ORDER BY id LIMIT $1";

  const params = cursor ? [cursor, limit] : [limit];
  const result = await pool.query(query, params);

  const nextCursor = result.rows.length === limit
    ? result.rows[result.rows.length - 1].id
    : null;

  return { data: result.rows, nextCursor };
}
```

### Perbandingan

| Metode | Kelebihan | Kekurangan |
|--------|-----------|------------|
| OFFSET | Gampang, bisa loncat ke page manapun | Lambat di page besar |
| Cursor | Super cepet, scalable | Ga bisa loncat ke page 5 langsung |
| Search After (Elasticsearch) | Pake nilai unik sebagai anchor | Butuh sort field unique |

## Read Replicas — Baca Dari Cadangan

Untuk aplikasi dengan **read >> write** (blog, e-commerce, dashboard):

```
Writer DB (Primary) → Replica 1 (Read-only)
                   → Replica 2 (Read-only)
                   → Replica 3 (Read-only)
```

```typescript
import { Pool } from "pg";

const readerPool = new Pool({
  host: "replica1.example.com", // atau load balancer ke semua replica
  database: "myapp",
  max: 50,
});

const writerPool = new Pool({
  host: "primary.example.com",
  database: "myapp",
  max: 10, // writer butuh lebih sedikit koneksi
});

// Pake yang sesuai
async function getProducts() {
  return readerPool.query("SELECT * FROM products");
}

async function createOrder(data: OrderData) {
  return writerPool.query("INSERT INTO orders ...", [data]);
}
```

## Sharding — Horizontal Scaling

Sharding = **pecah tabel besar jadi beberapa database terpisah**. Tiap shard punya sebagian data.

```
Shard 1 (users 1-100K) → DB Server 1
Shard 2 (users 100K-200K) → DB Server 2
Shard 3 (users 200K-300K) → DB Server 3
```

```typescript
function getShardKey(userId: number): number {
  return userId % 3; // 3 shard
}

function getShardPool(shardId: number): Pool {
  const configs = [
    { host: "shard0.example.com" },
    { host: "shard1.example.com" },
    { host: "shard2.example.com" },
  ];
  return new Pool(configs[shardId]);
}

async function getUser(userId: number) {
  const shard = getShardKey(userId);
  const pool = getShardPool(shard);
  return pool.query("SELECT * FROM users WHERE id = $1", [userId]);
}
```

**Kapan pake sharding?** Hanya kalo data > 1TB atau writes > 10K/detik. Kebanyakan app ga perlu. Coba dulu: index optimization → read replicas → caching → baru sharding.

## Backup Strategy

### pg_dump — Backup Sederhana

```bash
# Backup seluruh database
pg_dump -h localhost -U myapp -d mydatabase > backup.sql

# Backup compressed
pg_dump -h localhost -U myapp -d mydatabase | gzip > backup.sql.gz

# Restore
psql -h localhost -U myapp -d mydatabase < backup.sql
gunzip -c backup.sql.gz | psql -h localhost -U myapp -d mydatabase
```

### PITR (Point-In-Time Recovery)

Pake WAL (Write-Ahead Log) — setiap perubahan dicatat:

```bash
# Di postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backups/wal/%f'
```

```bash
# Backup full mingguan
pg_basebackup -h localhost -U myapp -D /backups/base/$(date +%Y%m%d) -X stream

# Restore ke titik tertentu
# 1. Restore base backup
# 2. Apply WAL sampai timestamp
recovery_target_time = '2026-07-08 14:30:00'
```

### Strategi 3-2-1 Rule

- **3** salinan data
- **2** media berbeda (SSD + cloud)
- **1** di lokasi berbeda (beda DC)

```bash
# Cron job
0 2 * * 0 pg_dump -U myapp mydb | gzip > /backups/weekly/$(date +\%Y\%m\%d).sql.gz
0 3 * * 0 rclone copy /backups/weekly/ s3://myapp-backups/
```

## Monitoring Tools

| Tool | Fungsi |
|------|--------|
| `pg_stat_activity` | Lihat query yang jalan |
| `pg_stat_statements` | Query paling lambat |
| `pgBadger` | Log analyzer → HTML report |
| `pg_top` | `htop` versi PostgreSQL |
| `Datadog / Grafana` | Visualisasi metrik DB |

```sql
-- Slow query detection
SELECT query, calls, total_exec_time, rows,
       total_exec_time / calls AS avg_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

## Latihan

1. **Connection pool setup** — Bikin Pool di Node.js dengan config production-ready (max 20, idle timeout 30s, connection timeout 2s). Test dengan 10 concurrent query
2. **Cursor pagination** — Bikin endpoint `GET /api/products?cursor=0&limit=10` pake cursor pagination. Bandingin latency dengan OFFSET di table 10K row
3. **Reader/Writer split** — Setup 2 pool (reader + writer). Route query SELECT ke reader, INSERT/UPDATE/DELETE ke writer. Test kalo writer down apakah reader masih bisa serve
4. **Backup automation** — Bikin script bash yang: pg_dump → gzip → upload ke S3/rclone → delete backup > 7 hari. Cron job tiap minggu jam 2 pagi
5. **Slow query detection** — Aktifin `pg_stat_statements`. Cari 3 query paling lambat. Analisis pake EXPLAIN ANALYZE. Usul index atau rewrite query
