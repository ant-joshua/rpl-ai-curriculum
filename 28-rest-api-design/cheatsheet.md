# 🧠 Cheatsheet: REST API Design

> Referensi cepet — 1 halaman.

## Topik Utama

**6 REST Constraints:** Stateless, Client-Server, Cacheable, Uniform Interface, Layered System, Code on Demand (optional)

**HTTP Methods:**
| Method | Fungsi | Idempotent | Safe |
|--------|--------|-----------|------|
| `GET` | Ambil resource | ✅ | ✅ |
| `POST` | Buat resource | ❌ | ❌ |
| `PUT` | Replace resource | ✅ | ❌ |
| `PATCH` | Update partial | ❌ | ❌ |
| `DELETE` | Hapus resource | ✅ | ❌ |

**HTTP Status Codes:** 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable, 429 Too Many, 500 Internal Server Error

**OpenAPI 3.0:** Spec YAML/JSON — info, servers, paths, components/schemas, responses

**Error Handling:** RFC 7807 Problem Details (`type`, `title`, `status`, `detail`, `instance`)

**Pagination:** Offset-based (`?page=1&limit=20`) vs Cursor-based (`?cursor=abc123`)

## Command / Sintaks Penting

```yaml
# OpenAPI 3.0 spec snippet
openapi: "3.0.3"
info:
  title: "Todo API"
  version: "1.0.0"
paths:
  /todos:
    get:
      summary: "List todos"
      parameters:
        - name: page
          in: query
          schema: { type: integer }
      responses:
        "200":
          description: "OK"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/TodoList"
```

```typescript
// Error response RFC 7807
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation Error",
  "status": 422,
  "detail": "Email already exists",
  "instance": "/api/users",
  "errors": { "email": "Must be unique" }
}
```

```typescript
// JWT middleware Express
import jwt from 'jsonwebtoken';
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { res.status(403).json({ error: 'Invalid token' }); }
}
```

## Tips & Trik

- URL pake **nouns** (resources), jangan verbs: `GET /users/:id` ✅, `GET /getUser` ❌
- Version API lewat header (`Accept: application/vnd.api+json;version=1`) atau URL prefix (`/api/v1/`)
- Gunakan `helmet` + `cors` + rate limiting di semua API Express
- Sorting: `?sort=-created_at` (minus = descending)
- Filtering: `?status=active&category=tech`
- Pagination: selalu return `{ data: [...], meta: { page, limit, total } }`

## Common Mistakes

- **Verb di URL** (`/getUsers`, `/deleteUser`) — pake HTTP method instead
- **Status code salah** — return 200 for create (harusnya 201), 500 for validation (harusnya 400)
- **No pagination** — return semua data tanpa limit = performance bomb
- **Error response inconsistent** — kadang `{error}`, kadang `{message}`, kadang `{errors}`
- **Lupa security headers** — helmet, CORS config, rate limiting

## Link Cepat

- [Module README](README.md)
- [Quiz](quiz.md)
