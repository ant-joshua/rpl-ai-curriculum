# Sesi 1: OWASP Top 10 & Injection Attacks

> **Durasi:** 2 jam
> **Tujuan:** Paham OWASP Top 10, bisa cegah SQL Injection & NoSQL Injection

---

## OWASP Top 10 Overview

**OWASP Top 10** = daftar 10 kerentanan web paling kritis, diupdate tiap 4 tahun. Top 3 yang paling sering nimpain aplikasi Express:

| Rank | Kerentanan | Dampak |
|------|-----------|--------|
| A01 | **Broken Access Control** | User bisa akses data orang lain |
| A02 | **Cryptographic Failures** | Password/Token bocor |
| A03 | **Injection** (SQL, NoSQL, Command) | Database/Server diambil alih |

Fokus sesi ini: **Injection Attacks** — yang paling banyak nyebabkan data breach di Indonesia.

---

## SQL Injection — Root Cause

SQL Injection terjadi saat **input user dimasukin langsung ke query SQL** tanpa sanitasi.

```sql
-- Yang lo tulis:
SELECT * FROM users WHERE email = '$email' AND password = '$pass'

-- Yang terjadi kalo attacker masukin: admin' --
SELECT * FROM users WHERE email = 'admin' -- ' AND password = '...'

-- `--` ngomment sisa query — login berhasil tanpa password bener!
```

### Attack Vectors

Attacker bisa nyuntikin SQL lewat:
- **Form input** (login, register, search)
- **URL parameter** (`/api/user?id=1`)
- **Headers** (User-Agent, Cookie)
- **File upload metadata**

### Contoh Eksploitasi

```js
// Express endpoint RENTAN
app.get('/api/user', async (req, res) => {
  const id = req.query.id;

  // ❌ Bencana — langsung concatenate
  const query = `SELECT * FROM users WHERE id = ${id}`;
  const [rows] = await db.query(query);

  res.json(rows[0]);
});

// Attacker panggil:
// GET /api/user?id=1 UNION SELECT * FROM admin_passwords
// ———— semua password admin kebaca!
```

---

## Pencegahan SQL Injection

### 1. Parameterized Query (mysql2)

```typescript
// ✅ AMAN — parameterized query
import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Parameter pake placeholder ?
app.get('/api/user', async (req: any, res: any) => {
  const { id } = req.query;

  // Input dipisah dari query — mysql2 handle escaping
  const [rows] = await db.query(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );

  res.json(rows[0]);
});
```

### 2. ORM — Prisma (Aman Default)

```typescript
// ✅ PALING AMAN — Prisma otomatis parameterized query
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

app.get('/api/user/:id', async (req: any, res: any) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID harus angka' });
  }

  // Prisma handle sanitasi
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, nama: true }, // jangan select password!
  });

  if (!user) {
    return res.status(404).json({ error: 'User tidak ditemukan' });
  }

  res.json(user);
});
```

### 3. Input Validation (express-validator)

```typescript
import { body, param, query, validationResult } from 'express-validator';

// Validasi parameter ID harus integer
app.get(
  '/api/user/:id',
  param('id').isInt().withMessage('ID harus angka'),
  (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req: any, res: any) => {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    res.json(user);
  }
);
```

---

## NoSQL Injection (MongoDB)

Express sering pake MongoDB + Mongoose. Walaupun bukan SQL, **NoSQL juga kena injection**.

```typescript
// ❌ RENTAN — NoSQL Injection
app.post('/api/login', async (req: any, res: any) => {
  const { email, password } = req.body;

  // Attacker kirim: { "email": "admin@mail.com", "password": { "$gt": "" } }
  // Operator $gt (greater than) — query return true buat semua password!
  const user = await User.findOne({ email, password });

  if (user) {
    // Login berhasil meski password salah!
    res.json({ token: jwt.sign({ id: user.id }, process.env.JWT_SECRET) });
  }
});
```

### Pencegahan NoSQL Injection

```typescript
// ✅ AMAN — validasi tipe input sebelum query
app.post('/api/login', async (req: any, res: any) => {
  const { email, password } = req.body;

  // Validasi: email & password harus string
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Input tidak valid' });
  }

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Email/password salah' });
  }

  // Generate JWT...
});
```

---

## Input Validation & Sanitization

**Golden rule: Jangan pernah percaya input user.**

```typescript
import { body, validationResult } from 'express-validator';

const validateUserInput = [
  body('email')
    .isEmail()
    .normalizeEmail()             // lowercase + trim
    .withMessage('Email tidak valid'),
  body('nama')
    .trim()                       // hapus spasi depan/belakang
    .escape()                     // encode HTML (< > &)
    .isLength({ min: 2, max: 50 })
    .withMessage('Nama 2-50 karakter'),
  body('umur')
    .isInt({ min: 13, max: 120 })
    .withMessage('Umur 13-120'),
  body('bio')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 }),
  (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

app.post('/api/profile', validateUserInput, async (req: any, res: any) => {
  // req.body udah divalidasi & disanitasi — aman diproses
  const { email, nama, umur, bio } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { email, nama, umur, bio },
  });

  res.json({ message: 'Profile diupdate', user });
});
```

---

## Prepared Statements di Express + Prisma

**Pattern aman untuk semua operasi database:**

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// CREATE — aman via ORM
app.post('/api/users', async (req: any, res: any) => {
  const { email, password, nama } = req.body;

  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, nama, password: hash },
    select: { id: true, email: true, nama: true }, // jangan balikin password
  });

  res.status(201).json(user);
});

// READ with filter — aman
app.get('/api/users', async (req: any, res: any) => {
  const { search, page = '1', limit = '10' } = req.query;

  const users = await prisma.user.findMany({
    where: search
      ? { nama: { contains: search as string, mode: 'insensitive' } }
      : undefined,
    select: { id: true, email: true, nama: true, createdAt: true },
    skip: (parseInt(page as string) - 1) * parseInt(limit as string),
    take: parseInt(limit as string),
  });

  res.json(users);
});

// UPDATE — aman
app.put('/api/users/:id', async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  const { nama, email } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: { nama, email },
    select: { id: true, email: true, nama: true },
  });

  res.json(user);
});

// DELETE — aman
app.delete('/api/users/:id', async (req: any, res: any) => {
  const id = parseInt(req.params.id);

  await prisma.user.delete({ where: { id } });

  res.json({ message: 'User dihapus' });
});
```

---

## Latihan

### Latihan 1: Audit Endpoint RENTAN

Baca kode di bawah, cari celah injection-nya, jelasin gimana attacker bisa eksploit:

```typescript
app.get('/api/produk', async (req: any, res: any) => {
  const { kategori, harga_min, harga_max, sort } = req.query;

  const query = `
    SELECT * FROM produk
    WHERE kategori = '${kategori}'
    AND harga >= ${harga_min}
    AND harga <= ${harga_max}
    ORDER BY ${sort}
  `;

  const [rows] = await db.query(query);
  res.json(rows);
});
```

**Tugas:**
1. Identifikasi 3 celah SQL Injection
2. Tulis payload buat exploit masing-masing celah
3. Tulis ulang endpoint pake Prisma (aman)

### Latihan 2: Implementasi Register Aman

Buat endpoint register yang aman dari injection:

```typescript
// TODO: Lengkapi endpoint ini
app.post('/api/register',
  // 1. Validasi: email valid, password min 8, nama 2-50 karakter
  // 2. Cek apakah email udah terdaftar (pake Prisma)
  // 3. Hash password pake bcrypt (saltRounds = 12)
  // 4. Simpan user ke database
  // 5. Return user (tanpa password!)
  async (req: any, res: any) => {
    // ...kode lo
  }
);
```

### Latihan 3: Search dengan Proteksi

Buat endpoint search produk yang aman dari NoSQL injection (MongoDB):

```typescript
// TODO: Lengkapi — cegah NoSQL injection
app.get('/api/produk/search', async (req: any, res: any) => {
  const { q, minPrice, maxPrice } = req.query;

  // Jangan lakukan: Product.find({ nama: { $regex: q }, harga: { $gte: minPrice } })
  // Attacker bisa inject operator MongoDB!
});
```

### Latihan 4: Bikin Middleware Validasi Universal

Buat middleware reusable yang bisa dipake di SEMUA endpoint untuk cegah injection:

```typescript
// TODO: Bikin middleware yang:
// 1. Deteksi karakter mencurigakan di body/query/params
// 2. Block request yang mengandung SQL keywords (SELECT, UNION, DROP, --)
// 3. Block request yang mengandung karakter `$` (NoSQL injection)
// 4. Return 400 dengan pesan jelas
function sanitizeInput(req: any, res: any, next: any) {
  // ...kode lo
}
```

---

## Ringkasan

| Ancaman | Pencegahan |
|---------|-----------|
| SQL Injection | Parameterized query / ORM (Prisma) |
| NoSQL Injection | Validasi tipe input + jangan pake operator query dari body |
| Input berbahaya | express-validator (trim, escape, isInt, isEmail) |
| Raw query | Hindari — pake Prisma query builder |

> **Prinsip:** Kalo input bisa nyentuh database, lo harus validasi. ORM aja nggak cukup — validasi tipe & sanitasi input tetap wajib.
