# 🧠 Cheatsheet: Pengenalan Database

> Referensi cepet — 1 halaman.

## Topik Utama

**Database vs Spreadsheet:** Database = structured, scalable, SQL queries, relationships, concurrent access. Spreadsheet = manual, limited, single-user friendly.

**DBMS Types:** Relational (PostgreSQL, MySQL, SQLite) vs NoSQL (MongoDB, Redis, DynamoDB)

**SQL Categories:**
- **DDL** — `CREATE`, `ALTER`, `DROP` (define structure)
- **DML** — `SELECT`, `INSERT`, `UPDATE`, `DELETE` (manipulate data)
- **DCL** — `GRANT`, `REVOKE` (access control)
- **TCL** — `COMMIT`, `ROLLBACK`, `BEGIN` (transactions)

**Data Types:** `INT`, `VARCHAR(n)`, `TEXT`, `DECIMAL(p,s)`, `BOOLEAN`, `TIMESTAMP`, `SERIAL` (auto-increment)

**Constraints:** `NOT NULL`, `UNIQUE`, `PRIMARY KEY`, `DEFAULT`, `CHECK`, `FOREIGN KEY`

**Relationships:** 1:1, 1:N, N:M (junction table)

**Normalization:** 1NF (atomic values) → 2NF (no partial dependency) → 3NF (no transitive dependency)

**ERD (Entity-Relationship Diagram):** Visual representasi entities, attributes, relationships

## Command / Sintaks Penting

```sql
-- CREATE TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INSERT
INSERT INTO users (name, email, password_hash)
VALUES ('Budi', 'budi@test.com', '$2b$12$...');

-- SELECT (basic → advanced)
SELECT * FROM users WHERE email = 'budi@test.com';
SELECT name, COUNT(*) FROM users GROUP BY name HAVING COUNT(*) > 1;
SELECT * FROM users ORDER BY created_at DESC LIMIT 10 OFFSET 20;

-- UPDATE
UPDATE users SET name = 'Budi Santoso' WHERE id = 1;

-- DELETE
DELETE FROM users WHERE id = 1;

-- Aggregate functions
SELECT COUNT(*), AVG(price), MIN(price), MAX(price) FROM products;

-- JOIN (1:N)
SELECT u.name, p.title
FROM users u
INNER JOIN posts p ON u.id = p.author_id;

-- Junction table (N:M)
CREATE TABLE user_roles (
    user_id INT REFERENCES users(id),
    role_id INT REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- Index — speed up queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_author ON posts(author_id);

-- Migration (conceptual)
-- 1. CREATE TABLE dengan struktur baru
-- 2. INSERT data dari tabel lama
-- 3. DROP tabel lama
-- 4. RENAME tabel baru
```

## Tips & Trik

- **`SERIAL` / `GENERATED ALWAYS AS IDENTITY`** — auto-increment ID
- **`VARCHAR(255)`** — practical maximum untuk email, name. `TEXT` untuk content panjang
- **`DECIMAL(10,2)`** untuk uang, jangan `FLOAT` (imprecise)
- **`TIMESTAMP WITH TIME ZONE`** — selalu pake T zone, jangan `TIMESTAMP` tanpa timezone
- **Index on foreign keys** — JOIN queries jadi lebih cepat
- **Naming convention:** snake_case untuk tables & columns (`user_roles`, `created_at`)
- **ERD tools:** dbdiagram.io, Mermaid ER diagram, draw.io

## Common Mistakes

- **`VARCHAR` tanpa length** — MySQL butuh length, PostgreSQL gak tapi tetap define
- **Float untuk money** — `0.1 + 0.2 ≠ 0.3` di float, pake `DECIMAL`
- **No foreign key** — data inconsistency, orphan records
- **Normalization overkill** — 3NF itu cukup, jangan over-normalize sampai 6NF
- **SELECT * in production** — select only needed columns for performance
- **No index** — full table scan lambat untuk tabel besar
- **`DELETE` tanpa `WHERE`** — hapus semua data!
- **Mixed naming** — `userName` vs `user_name` — pick one (snake_case recommended)

## Link Cepat

- [Module README](README.md)
- [Quiz](quiz.md)
