# 🗄️ Database Terms

> Istilah-istilah database — nyimpen, ngatur, dan ngambil data.

---

### SQL (Structured Query Language)
Bahasa buat ngomong sama database relational. Standar industri — dipake di PostgreSQL, MySQL, SQLite.

```sql
-- SELECT statement
SELECT id, name, email FROM users WHERE age > 17 ORDER BY name ASC;

-- INSERT
INSERT INTO users (name, email, age) VALUES ('Budi', 'budi@email.com', 20);

-- UPDATE
UPDATE users SET age = 21 WHERE id = 1;

-- DELETE
DELETE FROM users WHERE id = 1;
```

### NoSQL
Database yang gak pake tabel kaku kayak SQL. Document-based (MongoDB), Key-Value (Redis), Graph (Neo4j).

```ts
// MongoDB — document-based, pake JSON-like documents
const user = {
  _id: ObjectId("..."),
  name: "Budi",
  email: "budi@email.com",
  tags: ["student", "premium"],
  address: { city: "Jakarta", zip: "12345" } // Nested object — gak perlu JOIN
};

// Mongoose (ODM) — query
const users = await User.find({ age: { $gt: 17 } }).sort({ name: 1 });
```

### Index
Struktur data di database yang mempercepat pencarian. Kayak indeks di buku — nyari langsung ke halaman, gak perlu baca satu-satu.

```sql
-- Bikin index
CREATE INDEX idx_users_email ON users(email);

-- Query jadi cepet karena pake index
SELECT * FROM users WHERE email = 'budi@email.com';
-- Tanpa index: database scan SEMUA baris (full table scan) 🐌
-- Dengan index: langsung lompat ke baris yang cocok 🚀
```

### JOIN
Nggabungin tabel berdasarkan relasi. INNER JOIN, LEFT JOIN, RIGHT JOIN.

```sql
-- Contoh: users punya orders
SELECT 
  users.name, 
  orders.product, 
  orders.total
FROM users
INNER JOIN orders ON users.id = orders.user_id;
-- Hanya user yang punya order yang muncul

-- LEFT JOIN — semua user tetap muncul (walau gak punya order)
SELECT users.name, orders.product
FROM users
LEFT JOIN orders ON users.id = orders.user_id;
```

### Transaction
Kumpulan operasi database yang atomic — semua berhasil atau semua gagal. Kaya transfer bank: debit + credit harus sukses bareng.

```sql
START TRANSACTION;

UPDATE accounts SET balance = balance - 500000 WHERE id = 1;  -- Debit
UPDATE accounts SET balance = balance + 500000 WHERE id = 2;  -- Credit

-- Kalau ada error di salah satu, ROLLBACK balikin ke awal
COMMIT;  -- Atau ROLLBACK kalau gagal
```

```ts
// Prisma — transaction
await prisma.$transaction([
  prisma.accounts.update({
    where: { id: 1 },
    data: { balance: { decrement: 500000 } }
  }),
  prisma.accounts.update({
    where: { id: 2 },
    data: { balance: { increment: 500000 } }
  })
]);
```

### Migration
Perubahan struktur database yang ke-track Git. Biar tim bisa sinkron skema database.

```ts
// Contoh migration file (Knex.js)
export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').unique();
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('users');
}

// Jalanin: npx knex migrate:latest
// Rollback: npx knex migrate:rollback
```

### ORM (Object Relational Mapping)
Library yang nge-map database table ke object di kode. Prisma, Sequelize, TypeORM, Drizzle.

```ts
// Prisma — define schema
// model User {
//   id    Int     @id @default(autoincrement())
//   name  String
//   email String  @unique
//   posts Post[]
// }

// Query pake Prisma — gak perlu nulis SQL manual
const users = await prisma.user.findMany({
  where: { age: { gte: 17 } },
  include: { posts: true },
  orderBy: { name: 'asc' }
});

// Type-safe — hasil query punya type otomatis
console.log(users[0].name); // TypeScript tau ini string
```

### Shard
Membagi database jadi beberapa bagian (shard) berdasarkan kriteria. Biar muat data besar.

```ts
// Sharding strategy — misal berdasarkan region
// Shard 1: users dengan region 'Jakarta'
// Shard 2: users dengan region 'Bandung'
// Shard 3: sisanya

function getShard(region: string): string {
  if (region === 'Jakarta') return 'db_shard_1';
  if (region === 'Bandung') return 'db_shard_2';
  return 'db_shard_3';
}
```

### Replica
Copy database buat read-only. Biar beban read gak menumpuk di satu server.

```sql
-- Setup replication (conceptual)
-- Primary: handle INSERT/UPDATE/DELETE
-- Replica 1: handle SELECT
-- Replica 2: handle SELECT (backup)

-- Query ke replica (read) — beda connection string
SELECT * FROM users;  -- Bisa jalan di replica
-- INSERT INTO users ... -- Harus di primary
```

### Schema
Struktur database: table apa aja, kolom apa, tipe data, relasi.

```sql
-- Schema definition
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  age INTEGER CHECK (age >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
```

### Normalization
Proses merapikan struktur database biar gak redundant. 1NF, 2NF, 3NF.

```sql
-- ❌ Gak normal (redundant)
-- orders: id | customer_name | customer_email | product1 | product2

-- ✅ Normalized (3NF)
-- customers: id | name | email
-- orders: id | customer_id | order_date
-- order_items: id | order_id | product_name | quantity
```

### View (SQL)
Query yang disimpen kayak table virtual. Buat laporan / akses data terbatas.

```sql
CREATE VIEW active_users AS
SELECT id, name, email, last_login
FROM users
WHERE deleted_at IS NULL AND verified = true;

-- Pake view kayak table biasa
SELECT * FROM active_users WHERE last_login > '2024-01-01';
```

### N+1 Problem
Masalah performa: query utama ngambil N baris, trus query terpisah buat tiap baris (total N+1 query). ORM sering kena ini.

```ts
// ❌ N+1 — 1 query users + N query posts (kalo 100 user = 101 query)
const users = await prisma.user.findMany();
for (const user of users) {
  console.log(user.name, await prisma.post.count({ where: { userId: user.id } }));
}

// ✅ Fix — pake include/join (1 query)
const usersWithPosts = await prisma.user.findMany({
  include: { _count: { select: { posts: true } } }
});
```

### ACID
Empat properti transaction database: Atomicity, Consistency, Isolation, Durability.

| Property | Arti | Contoh |
|----------|------|--------|
| **Atomicity** | Semua berhasil atau semua gagal | Transfer bank |
| **Consistency** | Data selalu valid | Gak boleh age negatif |
| **Isolation** | Transaction gak saling ganggu | Dua user transfer bersamaan |
| **Durability** | Data aman meski server mati | Udah commit → selamanya |

### Connection Pool
Kumpulan koneksi database yang dipake ulang. Biar gak bikin koneksi baru tiap request (mahal).

```ts
// Prisma udah pake connection pool otomatis
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
  // Pool size: default 10 connections
});
```

---

*Next: [05-devops-terms.md](05-devops-terms.md) — Istilah DevOps*
