# Node.js — Exercise #3: HTTP Server

> **Level:** Beginner
> **Topics:** http module, createServer, request, response, routing

## Instructions

Buat HTTP server sederhana menggunakan `http` module (tanpa Express).

1. `GET /` — response "Hello, RPL AI!".
2. `GET /about` — response JSON `{ name: "RPL AI", version: "1.0.0" }`.
3. `GET /time` — response JSON dengan current time.
4. `GET /users/:id` — response `{ userId: "42", message: "User ditemukan" }`.
5. Route lainnya — response 404.

## Starter Code

```javascript
const http = require('http');

// TODO: buat server
const server = http.createServer((req, res) => {
  const { method, url } = req;
  
  // Set CORS headers
  res.setHeader('Content-Type', 'application/json');
  
  // TODO: routing berdasarkan url dan method
  // Hint: parse URL dengan new URL(url, 'http://localhost:3000')
  // Gunakan url.split('/') atau URLPattern
  
  if (url === '/') {
    // TODO: return "Hello, RPL AI!"
  } else if (url === '/about') {
    // TODO: return JSON
  } else if (url === '/time') {
    // TODO: return current time
  } else if (url.startsWith('/users/')) {
    // TODO: extract id dari URL
  } else {
    // 404
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
```

## Expected Output

```
$ curl http://localhost:3000/
Hello, RPL AI!

$ curl http://localhost:3000/about
{"name":"RPL AI","version":"1.0.0"}

$ curl http://localhost:3000/time
{"currentTime":"2025-07-12T..."}

$ curl http://localhost:3000/users/42
{"userId":"42","message":"User ditemukan"}

$ curl http://localhost:3000/unknown
{"error":"Route tidak ditemukan"}
```

## Test Cases

```javascript
// Test dengan fetch atau curl
const http = require('http');
// fetch('http://localhost:3000/').then(r => r.text()).then(console.log);
```
