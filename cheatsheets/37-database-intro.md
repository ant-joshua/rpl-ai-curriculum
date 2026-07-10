# 37. 🗄️ Database Intro

## SQL vs NoSQL
| | SQL (Relasional) | NoSQL (Non-relasional) |
|--|-----------------|------------------------|
| Model | Table, Row, Col | Document, Key-Value, Graph |
| Schema | Fixed (strict) | Flexible |
| Contoh | PostgreSQL, MySQL | MongoDB, Redis, Firebase |
| Relasi | Foreign Key | Embedding / Reference |
| Scaling | Vertical | Horizontal |

## SQL Basics
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  age INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (name, email, age)
VALUES ('Budi', 'budi@mail.com', 17);

SELECT * FROM users WHERE age >= 17 ORDER BY name ASC;

UPDATE users SET age = 18 WHERE id = 1;

DELETE FROM users WHERE id = 1;
```

## Normalization
| Level | Aturan |
|-------|--------|
| 1NF | Setiap kolom atomic (satu nilai) |
| 2NF | 1NF + no partial dependency |
| 3NF | 2NF + no transitive dependency |

```sql
-- Normalized: pisahkan orders dan customers
-- ❌ Satu tabel: order_id, customer_name, customer_email, product_name
-- ✅ Tiga tabel: orders, customers, products
```

## Joins
```sql
SELECT users.name, orders.total
FROM users
JOIN orders ON users.id = orders.user_id;

LEFT JOIN  -- semua dari kiri, cocok dari kanan (null jika tidak ada)
RIGHT JOIN -- sebaliknya
FULL JOIN  -- semua dari kedua sisi
```

## Indexing
```sql
CREATE INDEX idx_email ON users(email);
-- SELECT dengan WHERE email = '...' jadi O(log n) vs O(n)
-- Trade-off: INSERT/UPDATE lebih lambat
```

## Query Clauses
```sql
WHERE     -- filter
ORDER BY  -- urutkan
LIMIT     -- batasi jumlah
OFFSET    -- skip (pagination)
GROUP BY  -- grup row
HAVING    -- filter setelah GROUP BY
```

```sql
SELECT status, COUNT(*) FROM orders
WHERE created_at > '2024-01-01'
GROUP BY status
HAVING COUNT(*) > 5
ORDER BY COUNT(*) DESC;
```

## NoSQL Example (MongoDB)
```js
// Collection = table, Document = row
db.users.insertOne({ name: "Budi", email: "b@mail.com" });
db.users.find({ age: { $gte: 17 } }).sort({ name: 1 });
db.users.updateOne({ _id: 1 }, { $set: { age: 18 } });
db.users.deleteOne({ _id: 1 });
```

## Common Pitfalls
- ❌ NoSQL untuk data relasional (e.g. transaksi bank)
- ❌ Lupa indexing → query lambat di data besar
- ❌ N+1 query — join lebih efisien daripada loop query
- ❌ Tidak pakai parameterized query → SQL injection
- ❌ `SELECT *` ambil semua kolom — pilih yang diperlukan

## Related Links
- [36 Web Architecture](36-web-architecture.md)
