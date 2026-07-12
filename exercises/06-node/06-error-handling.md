# Node.js — Exercise #6: Error Handling

> **Level:** Intermediate
> **Topics:** AppError class, async wrapper, centralized error handling, validation

## Instructions

Buat error handling yang terpusat untuk Express API.

1. `AppError` class — custom error dengan `statusCode` dan `isOperational`.
2. `asyncHandler(fn)` — wrapper untuk async route handlers (tangkap error otomatis).
3. `notFound(req, res)` — 404 handler untuk route yang tidak dikenal.
4. Global error handler — bedakan operational error vs programming error.

## Starter Code

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// TODO: AppError class
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.name = 'AppError';
  }
}

// TODO: asyncHandler wrapper
function asyncHandler(fn) {
  // return function yang execute fn dan catch error
}

// TODO: notFound handler
function notFound(req, res, next) {
  // 404 untuk route yang tidak dikenal
}

// Routes (gunakan asyncHandler)
app.get('/users/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (id < 1) {
    throw new AppError(400, 'ID harus >= 1');
  }
  
  // Simulasi database
  const user = { id, name: `User ${id}`, email: `user${id}@test.com` };
  res.json({ data: user });
}));

app.get('/items', asyncHandler(async (req, res) => {
  const items = [];
  if (items.length === 0) {
    throw new AppError(404, 'Belum ada items');
  }
  res.json({ data: items });
}));

app.get('/crash', asyncHandler(async () => {
  throw new Error('Programming error!');  // Bukan AppError
}));

app.use(notFound);

// TODO: Global error handler
app.use((err, req, res, next) => {
  // Jika AppError: return statusCode + message
  // Jika error biasa: 500 Internal Server Error
  // Log error ke console
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
```

## Expected Output

```
GET /users/1 → 200 {"data":{"id":1,"name":"User 1","email":"user1@test.com"}}
GET /users/0 → 400 {"error":"ID harus >= 1"}
GET /items → 404 {"error":"Belum ada items"}
GET /unknown → 404 {"error":"Route tidak ditemukan"}
GET /crash → 500 {"error":"Internal Server Error"}
```

## Test Cases

```javascript
// Test error classes
try { throw new AppError(400, 'Bad request'); } catch(e) {
  console.log(e.statusCode === 400);  // true
  console.log(e.isOperational === true);  // true
}
```
