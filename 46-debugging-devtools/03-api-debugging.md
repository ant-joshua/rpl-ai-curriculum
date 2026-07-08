# 3. API Debugging

> Durasi: 90 menit

## 3.1 Postman — Collections & Environment

Setup Postman untuk API debugging.

**Collection Structure:**

```
📁 E-Commerce API
  ├── 📁 Auth
  │   ├── POST Register
  │   ├── POST Login
  │   └── POST Refresh Token
  ├── 📁 Products
  │   ├── GET List Products
  │   ├── GET Product by ID
  │   └── POST Create Product
  ├── 📁 Orders
  │   ├── POST Create Order
  │   ├── GET Order by ID
  │   └── PATCH Update Status
  └── 📁 Users
      ├── GET Profile
      └── PATCH Update Profile
```

**Environment Variables:**

```json
{
  "local": {
    "base_url": "http://localhost:3000",
    "api_key": "dev-key-123"
  },
  "staging": {
    "base_url": "https://staging-api.example.com",
    "api_key": "staging-key-456"
  },
  "production": {
    "base_url": "https://api.example.com",
    "api_key": "prod-key-789"
  }
}
```

**Variable Usage di Request:**
```
URL: {{base_url}}/api/products
Header: Authorization: Bearer {{token}}
Body JSON: {"userId": "{{user_id}}"}
```

**Pre-request Script (JavaScript):**

```javascript
// Auto-set token sebelum request
const loginRequest = {
  url: `${pm.environment.get("base_url")}/auth/login`,
  method: "POST",
  header: { "Content-Type": "application/json" },
  body: {
    mode: "raw",
    raw: JSON.stringify({
      email: pm.environment.get("test_email"),
      password: pm.environment.get("test_password"),
    }),
  },
};

pm.sendRequest(loginRequest, (err, res) => {
  if (err) {
    console.error("Login failed:", err);
    return;
  }
  const token = res.json().token;
  pm.environment.set("token", token);
  console.log("Token set:", token.substring(0, 20) + "...");
});
```

**Test Script:**

```javascript
// Assertions otomatis setelah response diterima
pm.test("Status code is 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Response time < 500ms", () => {
  pm.expect(pm.response.responseTime).to.be.below(500);
});

pm.test("Has valid token", () => {
  const json = pm.response.json();
  pm.expect(json).to.have.property("token");
  pm.expect(json.token).to.match(/^eyJ/); // JWT starts with eyJ
});

pm.test("Content-Type is JSON", () => {
  pm.response.to.have.header("Content-Type", /json/);
});

// Data-driven assertion
const schema = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: { type: "string", minLength: 1 },
    email: { type: "string", pattern: "^\\S+@\\S+$" },
    role: { type: "string", enum: ["admin", "user"] },
  },
  required: ["id", "name", "email", "role"],
};

pm.test("Response matches schema", () => {
  const json = pm.response.json();
  pm.expect(json).to.be.an("object");
  pm.expect(json).to.have.all.keys("id", "name", "email", "role");
  pm.expect(json.email).to.match(/^\\S+@\\S+$/);
});
```

**Collection Runner:**

```
# Jalankan semua request di collection
Collections → E-Commerce API → Run
- Iterations: 3 (loop)
- Delay: 1000ms (antar request)
- Data: test-data.csv (data-driven)
- Save Responses: ✓
- Keep variable values: ✓
```

## 3.2 Thunder Client / REST Client (VS Code)

Alternatif Postman langsung di VS Code.

**Thunder Client:**
- Extension: `Thunder Client`
- Config via `thunder-client.json` di `.vscode/`

**REST Client (humao.rest-client):**
- File-based: buat `.rest` atau `.http` file

```http
### Variables
@baseUrl = http://localhost:3000/api
@token = {{$dotenv TOKEN}}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123"
}

### Get Profile (auto-use token from login)
GET {{baseUrl}}/users/profile
Authorization: Bearer {{token}}
Accept: application/json

### Create Product
POST {{baseUrl}}/products
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Kopi Gayo",
  "price": 45000,
  "category": "Minuman",
  "stock": 100
}

### Check Response
# @name createProduct
# HTTP 201
# {
#   "id": 42,
#   "name": "Kopi Gayo",
#   "price": 45000
# }
```

**REST Client Features:**
| Feature | Cara |
|---------|------|
| Variables | `@varName = value` |
| Environment | `{{$dotenv VAR}}` dari `.env` |
| Response testing | `###` block dgn expected status |
| Request history | `.http` file — version-controlled |
| Auth | Bearer, Basic, Digest, OAuth2 |

## 3.3 Network Tab Analysis

Deep dive waterfall timing.

```typescript
// Server-side simulation of slow endpoint
import express from "express";
const app = express();
const PORT = 3000;

// Endpoint sengaja lambat — buat latihan debug timing
app.get("/api/products", async (req, res) => {
  // Simulasi slow DB query
  await new Promise((r) => setTimeout(r, 800));

  // Simulasi slow serialization
  const products = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: Math.random() * 100000,
    description: "x".repeat(5000), // large payload
  }));

  res.json({
    data: products,
    total: products.length,
    page: 1,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Waterfall Timing Breakdown:**

```
Request: GET /api/products
──────────────────────────────────────────────
Queueing                0.12ms     ⬜
Stalled                 2.34ms     ⬜
DNS Lookup              1.12ms     🟡
Initial Connection      3.45ms     🟠
SSL                     2.89ms     🟠
Request Sent            0.12ms     ⬜
Waiting (TTFB)        812.45ms     🔴 ← PROBLEM
Content Download      234.56ms     🟡
──────────────────────────────────────────────
Total                 1056.93ms
```

**What Each Phase Means:**

| Phase | Max | Arti |
|-------|-----|------|
| DNS Lookup | < 50ms | Resolve domain name → IP |
| TCP Connect | < 100ms | Three-way handshake |
| TLS Handshake | < 100ms | SSL/TLS negotiation |
| TTFB | < 600ms | Server processing time |
| Content Download | depends | Ukuran response / bandwidth |
| Total | < 3000ms | End-to-end duration |

**Debugging Slow Phases:**
- **DNS slow ( > 100ms )**: Ganti DNS provider (Cloudflare 1.1.1.1, Google 8.8.8.8)
- **TTFB slow ( > 600ms )**: Optimize server — database query, caching, CDN
- **Content Download slow**: Compress response (gzip/brotli), pagination, smaller payload
- **Connection slow**: Use HTTP/2, keep-alive, CDN edge

## 3.4 Error Debugging

Parse dan debug berbagai HTTP error.

```typescript
// API error response format
interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: string;
  requestId: string;
}

// 400 Bad Request — validation error
async function createUser(data: unknown): Promise<void> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error: ApiErrorResponse = await res.json();

    switch (res.status) {
      case 400:
        // Parse validation errors
        console.error("Validation failed:", error.details);
        // { "email": ["Email already exists"], "name": ["Name is required"] }
        break;

      case 401:
        // Unauthorized — redirect to login
        console.error("Auth failed:", error.message);
        window.location.href = "/login";
        break;

      case 403:
        // Forbidden — insufficient permissions
        console.error("Access denied:", error.message);
        break;

      case 404:
        // Not Found
        console.error("Resource not found:", error.message);
        break;

      case 429:
        // Rate limited
        const retryAfter = res.headers.get("Retry-After") ?? "60";
        console.warn(`Rate limited. Retry after ${retryAfter}s`);
        break;

      case 500:
        // Server error
        console.error("Server error:", error);
        // Log requestId for debugging
        console.error("Request ID:", error.requestId);
        break;

      default:
        console.error(`Unexpected error ${res.status}:`, error);
    }
    throw new Error(error.message);
  }
}
```

**Debugging CORS:**

```typescript
// CORS error: "No 'Access-Control-Allow-Origin' header is present"
// Solution: Server harus set header

import express from "express";
import cors from "cors";

const app = express();

// Opsi 1: Allow all (development only)
app.use(cors());

// Opsi 2: Whitelist specific origins
app.use(
  cors({
    origin: ["https://myapp.com", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // cache preflight 24 jam
  })
);

// Opsi 3: Dynamic origin
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = ["https://myapp.com", "http://localhost:5173"];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
```

**CORS Debug Checklist:**
1. ✅ Apakah preflight OPTIONS request ada di Network tab?
2. ✅ Apakah response punya `Access-Control-Allow-Origin` header?
3. ✅ Apakah origin ada di allowed list?
4. ✅ Apakah method ada di `Access-Control-Allow-Methods`?
5. ✅ Apakah custom headers ada di `Access-Control-Allow-Headers`?
6. ✅ Apakah credentials: true diset kalo pake cookies?

## 3.5 Mock Server

Simulasi API response tanpa backend real.

**Postman Mock Server:**

```json
{
  "mock": {
    "collections": ["E-Commerce API"],
    "environment": "staging",
    "mock_url": "https://e6f3a2b4-e8c7-4a5d-9b1c-3d2e1f4a5b6c.mock.pstmn.io",
    "delay": 200,
    "examples": [
      {
        "request": "GET /api/products",
        "response": {
          "status": 200,
          "body": {
            "data": [
              {
                "id": 1,
                "name": "Mock Product A",
                "price": 50000,
                "stock": 100
              }
            ],
            "total": 1
          }
        }
      },
      {
        "request": "GET /api/products/:id",
        "response": {
          "status": 404,
          "body": {
            "error": "Product not found"
          }
        }
      }
    ]
  }
}
```

**Postman Interceptor:**
- Capture request dari browser langsung
- Forward ke Postman collection
- Bisa mock response
- Berguna buat debug API dari SPA

## Latihan

1. **Debug API Pagination** — Panggil endpoint paginated (`/api/products?page=1&limit=10`). Cek apakah total page sesuai, apakah ada duplicate/cursor issue. Debug pake Postman collection runner.

2. **Debug Auth Error** — Setup 3 environment (local, staging, prod). Pakai pre-request script buat auto-login dan set token. Debug kasus dimana token expired dan harus refresh.

3. **Debug Timeout** — Buat endpoint sengaja slow (setTimeout 10s). Panggil dari Postman dengan timeout 5s. Debug error timeout, analisis waterfall.

4. **CORS Debug** — Buat frontend sederhana (HTML+JS) fetch dari origin berbeda. Catat CORS error. Fix dengan setting cors middleware di server.

5. **Mock Server Setup** — Buat Postman mock server untuk 3 endpoint. Test dari REST Client .http file.
Berikut contoh debugging fetch error: saat endpoint return 500, cek Network tab → Preview/Response. Response JSON biasanya berisi stack trace atau error message. Salin error ke Sentry search atau Google untuk see common solutions.
