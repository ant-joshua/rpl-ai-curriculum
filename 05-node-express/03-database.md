# Database SQL (PostgreSQL)

## Basic SQL

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (name, email) VALUES ('Budi', 'budi@email.com');
SELECT * FROM users;
SELECT name, email FROM users WHERE id = 1;
UPDATE users SET name = 'Andi' WHERE id = 1;
DELETE FROM users WHERE id = 1;
```

## Koneksi dari Node.js

```typescript
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/api/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users');
  res.json(result.rows);
});
```
