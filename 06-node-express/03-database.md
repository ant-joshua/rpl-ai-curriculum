# 6.3 Database SQL (PostgreSQL) + Node.js

## Setup PostgreSQL

### Install & Start PostgreSQL

Di Windows (lewat WSL):

```bash
sudo apt update
sudo apt install postgresql postgresql-client -y
sudo service postgresql start
```

Di macOS:

```bash
brew install postgresql@16
brew services start postgresql@16
```

### Create Database & User

```bash
sudo -u postgres psql
```

Di prompt psql:

```sql
CREATE USER todo_user WITH PASSWORD 'todo_pass';
CREATE DATABASE todo_db OWNER todo_user;
GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;
\q
```

### Test Koneksi

```bash
psql -U todo_user -d todo_db -h localhost
```

---

## pg (node-postgres)

Install:

```bash
npm install pg
npm install -D @types/pg
```

### Pool vs Client

| Pool | Client |
|------|--------|
| Koneksi multi (connection pool) | Satu koneksi |
| Handle concurrent request | Satu-satu |
| **PAKAI INI** buat API | Cuma buat script/CLI |

```
Request 1 ───→ Pool ───→ ┌───────┐
Request 2 ───→        ├───│ DB    │
Request 3 ───→        │   └───────┘
                      │  (koneksi reusable)
```

### Koneksi dengan Pool

File: `src/database/pool.ts`

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'todo_db',
  user: process.env.DB_USER || 'todo_user',
  password: process.env.DB_PASSWORD || 'todo_pass',
});

// Test koneksi
pool.query('SELECT NOW()')
  .then(() => console.log('Database connected ✅'))
  .catch(err => console.error('Database error ❌', err.message));

export default pool;
```

Atau pake connection string:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

---

## Environment Variables

File: `.env`

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_db
DB_USER=todo_user
DB_PASSWORD=todo_pass
PORT=3000
NODE_ENV=development
```

File: `src/config.ts`

```typescript
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'todo_db',
    user: process.env.DB_USER || 'todo_user',
    password: process.env.DB_PASSWORD || 'todo_pass',
  },
};
```

---

## CREATE TABLE dari Node.js

File: `src/database/migrate.ts`

```typescript
import pool from './pool';

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        is_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Migrasi sukses ✅');
  } catch (err) {
    console.error('Migrasi gagal ❌', err);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
```

Jalankan: `npx ts-node src/database/migrate.ts`

---

## CRUD Queries — Parameterized Query

**⚠️ JANGAN PAKE STRING INTERPOLASI** — rawan SQL injection:

```typescript
// ❌ BERBAHAYA — SQL injection
const title = req.body.title; // user input: "'; DROP TABLE todos; --"
await pool.query(`SELECT * FROM todos WHERE title = '${title}'`);

// ✅ AMAN — parameterized query
await pool.query('SELECT * FROM todos WHERE title = $1', [title]);
```

### SELECT

```typescript
import pool from '../database/pool';

// Ambil semua
const getAll = async () => {
  const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
  return result.rows; // Array of objects
};

// Ambil by ID
const getById = async (id: number) => {
  const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
  return result.rows[0] || null; // Satu objek atau null
};
```

### INSERT

```typescript
const create = async (title: string, description?: string) => {
  const result = await pool.query(
    `INSERT INTO todos (title, description)
     VALUES ($1, $2)
     RETURNING *`,
    [title, description || null]
  );
  return result.rows[0]; // Baris yang baru dibuat
};
```

> `RETURNING *` — PostgreSQL spesifik. Balikin data yang barusan diinsert (include id auto-generated, default values).

### UPDATE

```typescript
const update = async (id: number, title: string, isCompleted: boolean) => {
  const result = await pool.query(
    `UPDATE todos
     SET title = $1, is_completed = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [title, isCompleted, id]
  );
  return result.rows[0] || null;
};
```

### DELETE

```typescript
const remove = async (id: number) => {
  const result = await pool.query(
    'DELETE FROM todos WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount ?? 0; // Jumlah baris kehapus
};
```

---

## Query Builder Pattern

Biar gak nulis SQL mentah di route handler, bikin file repository:

File: `src/database/todo.repository.ts`

```typescript
import pool from './pool';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export const todoRepository = {
  async findAll(): Promise<Todo[]> {
    const result = await pool.query<Todo>(
      'SELECT * FROM todos ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async findById(id: number): Promise<Todo | null> {
    const result = await pool.query<Todo>(
      'SELECT * FROM todos WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async create(title: string, description?: string): Promise<Todo> {
    const result = await pool.query<Todo>(
      `INSERT INTO todos (title, description)
       VALUES ($1, $2)
       RETURNING *`,
      [title, description || null]
    );
    return result.rows[0];
  },

  async update(id: number, fields: Partial<Pick<Todo, 'title' | 'description' | 'is_completed'>>): Promise<Todo | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (fields.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      values.push(fields.title);
    }
    if (fields.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(fields.description);
    }
    if (fields.is_completed !== undefined) {
      setClauses.push(`is_completed = $${paramIndex++}`);
      values.push(fields.is_completed);
    }

    if (setClauses.length === 0) return null;

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query<Todo>(
      `UPDATE todos SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async remove(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  },
};
```

---

## Error Handling Database

```typescript
// Error koneksi
try {
  await pool.query('SELECT 1');
} catch (err) {
  console.error('Database connection failed:', err);
  process.exit(1);
}

// Error constraint (duplikat, foreign key)
try {
  await pool.query(
    'INSERT INTO categories (name) VALUES ($1)',
    [name]
  );
} catch (err: any) {
  if (err.code === '23505') { // unique_violation
    return res.status(409).json({ error: 'Kategori sudah ada' });
  }
  throw err; // Re-throw kalo bukan error constraint
}
```

### Kode Error PostgreSQL yang Sering

| Kode | Nama | Arti |
|------|------|------|
| `23505` | unique_violation | Duplikat data (UNIQUE constraint) |
| `23503` | foreign_key_violation | Foreign key conflict |
| `42P01` | undefined_table | Table belum ada |
| `42703` | undefined_column | Column gak ditemukan |
| `23502` | not_null_violation | NOT NULL violation |

---

## Connection Pool Configuration

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                // Maksimal 20 koneksi
  idleTimeoutMillis: 30000, // Tutup idle connection setelah 30 detik
  connectionTimeoutMillis: 5000, // Timeout koneksi 5 detik
});
```

> **Best practice:** Set `max` sesuai kapasitas server. PostgreSQL default = 100 connections. Jangan lebih — tiap koneksi makan 10MB RAM.

---

## Latihan

**Latihan 1: Setup Database**

1. Install PostgreSQL dan buat database `contact_db`
2. Buat user `contact_user` dengan password
3. Buat table `contacts` dengan kolom: `id SERIAL PK`, `name VARCHAR(100) NOT NULL`, `phone VARCHAR(20)`, `email VARCHAR(100)`, `created_at TIMESTAMPTZ DEFAULT NOW()`
4. Test koneksi dari Node.js pake `pool.query('SELECT NOW()')`

**Latihan 2: Repository Pattern**

Buat file `src/database/contact.repository.ts` dengan function:

- `findAll()` — SELECT semua contact
- `findById(id)` — SELECT by id
- `create(name, phone?, email?)` — INSERT dengan RETURNING
- `update(id, fields)` — UPDATE dinamis (partial)
- `remove(id)` — DELETE

Semua pake parameterized query!

**Latihan 3: Error Handling**

Buat middleware Express yang handle error database. Tangkap error code `23505` (duplikat) dan balikin response 409 dengan pesan yang jelas. Error lain balikin 500.

**Latihan 4: Migration Script**

Buat script migration `src/database/migrate.ts` yang bikin 2 table:

- `products` — id serial PK, name varchar(200) NOT NULL, price decimal(10,2), stock int default 0, created_at
- `categories` — id serial PK, name varchar(100) UNIQUE NOT NULL

Tambahkan juga seed data: insert 3 kategori dan 5 produk contoh.
