# Node.js — Exercise #5: Middleware

> **Level:** Intermediate
> **Topics:** middleware, next(), custom middleware, error handling middleware

## Instructions

Buat middleware kustom untuk Express:

1. **Logger Middleware** — catat method, URL, status code, dan durasi request.
2. **Auth Middleware** — cek header `Authorization: Bearer <token>`. Token valid: "rahasia123".
3. **Error Handler Middleware** — global error handler dengan 4 parameter.
4. **Rate Limiter Middleware** — batasi 5 request per menit per IP (sederhana).

## Starter Code

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// TODO: Logger Middleware
function logger(req, res, next) {
  // Catat method + URL + timestamp
  // Catat status code + durasi saat response selesai
}

// TODO: Auth Middleware
function authenticate(req, res, next) {
  // Cek header Authorization
  // Token valid: "rahasia123"
  // 401 jika tidak ada / salah
}

// TODO: Rate Limiter Middleware
function rateLimiter(req, res, next) {
  // Sederhana: counter per IP, reset tiap menit
  // Max 5 request per menit
  // 429 jika melebihi batas
}

app.use(logger);
// app.use(rateLimiter);  // uncomment untuk tes

// Route publik
app.get('/', (req, res) => {
  res.json({ message: 'Hello Public' });
});

// Route terproteksi (pake auth middleware)
app.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'Ini data rahasia', user: req.user });
});

// Route yang sengaja error
app.get('/error', (req, res, next) => {
  next(new Error('Ada yang error!'));
});

// TODO: Global Error Handler (4 parameters!)
app.use((err, req, res, next) => {
  // Log error
  // Return 500 + error message
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
```

## Expected Output

```
GET / → 200 {"message":"Hello Public"}

GET /protected → 401 {"error":"Token tidak ditemukan"}

GET /protected (dengan header Authorization: Bearer rahasia123)
→ 200 {"message":"Ini data rahasia","user":{"role":"admin"}}

GET /error → 500 {"error":"Ada yang error!"}
```

## Test Cases

```javascript
// Logger harus mencetak ke console:
// [2025-07-12T10:00:00.000Z] GET / -> 200 (12ms)
```
