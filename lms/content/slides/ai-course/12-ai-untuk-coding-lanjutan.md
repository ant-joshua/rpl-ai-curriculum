---
title: "AI untuk Coding Level Lanjutan"
module: 12
"ai-complete-course"
---

# Module 12: AI untuk Coding Level Intermediate-Advanced

## 🎯 Tujuan Pembelajaran

Setelah modul ini, kamu akan menguasai penggunaan AI untuk level coding lanjutan — refactoring, arsitektur, desain database, API design, testing, optimasi performa, dan full-stack development.

---

## 1. Tools untuk Level Lanjutan

### Tools AI Coding Premium

| Tool | Harga | Kemampuan Utama | Level |
|------|-------|-----------------|-------|
| **Cursor** | Gratis / Pro $20/bulan | AI-native editor, multi-file edit | Intermediate+ |
| **Claude Code** | $20/bulan | CLI-based, deep reasoning | Advanced |
| **v0.dev** | Gratis / Premium | Generate UI components | Full-stack |
| **GitHub Copilot** | $10/bulan | Auto-complete, chat, inline | Intermediate |
| **Windsurf** | Gratis / Pro | AI coding dengan context awareness | Intermediate+ |

### Kapan Pakai Tool Mana?

```
Pemula      → ChatGPT / DeepSeek (gratis, penjelasan detail)
Intermediate → Cursor + GitHub Copilot (cepat, terintegrasi editor)
Advanced    → Claude Code + Cursor (reasoning kuat, multi-file)
UI/UX       → v0.dev + Figma AI (generate komponen UI)
```

---

## 2. Refactoring dengan AI

### Kategori 1: Clean Code

**Prompt 1 — Refactor Spaghetti Code:**
```
Refactor kode Python berikut menjadi lebih clean dan maintainable.
Gunakan:
- Single Responsibility Principle
- Meaningful variable names
- DRY (Don't Repeat Yourself)
- Proper error handling

[Paste kode yang berantakan]

Berikan perubahan yang dibuat dan penjelasannya.
```

```python
# SEBELUM: Spaghetti code
def process(d, t):
    total = 0
    for i in d:
        if t == "a":
            if i["q"] > 0:
                total += i["p"] * i["q"]
        elif t == "b":
            if i["q"] > 0:
                total += i["p"] * i["q"] * 0.9
    return total

# SESUDAH: Clean code
def calculate_total(items: list, discount_type: str) -> float:
    """
    Calculate total price of items with optional discount.

    Args:
        items: List of dicts with 'name', 'price', 'quantity'
        discount_type: 'regular' or 'bulk'

    Returns:
        Total price after applicable discount
    """
    total = 0.0

    for item in items:
        quantity = item.get("quantity", 0)
        if quantity <= 0:
            continue

        subtotal = item["price"] * quantity

        if discount_type == "bulk":
            subtotal *= 0.9  # 10% discount for bulk orders

        total += subtotal

    return round(total, 2)
```

**Prompt 2 — Extract Function:**
```
Fungsi saya sudah terlalu panjang (200+ baris).
Tolong bantu saya:
1. Identifikasi bagian-bagian yang bisa di-extract
2. Rename fungsi dan variabel dengan nama yang lebih deskriptif
3. Buatkan modular structure
4. Tambahkan type hints

[Paste kode fungsi panjang]
```

---

## 3. Architecture Design

### Kategori 2: Arsitektur Aplikasi

**Prompt 3 — Pilih Arsitektur:**
```
Saya mau membangun aplikasi untuk [DESKRIPSI APLIKASI].
Data: [estimated users, data volume]
Platform: [web/mobile/both]
Budget infra: [Rp/bulan]

Bandingkan arsitektur yang relevan:
1. Monolith
2. Microservices
3. Serverless
4. Monorepo

Untuk masing-masing, jelaskan:
- Struktur folder
- Pro dan kontra
- Contoh tech stack
- Estimasi biaya
- Rekomendasi untuk kasus saya
```

**Prompt 4 — System Architecture:**
```
Buatkan system architecture untuk aplikasi e-commerce:
- Frontend: React.js
- Backend: Node.js + Express
- Database: PostgreSQL + Redis
- Auth: JWT + OAuth2
- Deployment: Docker + AWS

Sertakan:
1. High-level architecture diagram (ASCII)
2. Data flow untuk checkout process
3. Component interaction
4. Security considerations
5. Scaling strategy
```

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  CloudFront  │────▶│   EC2/ ECS  │
│  (React)    │     │    (CDN)     │     │  (Node.js)  │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                    ┌───────────────┬────────────┼────────────┐
                    ▼               ▼            ▼            ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐ ┌──────────┐
              │ PostgreSQL│  │  Redis   │  │ S3 Buck- │ │ Stripe   │
              │  (Main)   │  │ (Cache)  │  │   et     │ │ (Payment)│
              └──────────┘  └──────────┘  └──────────┘ └──────────┘
```

---

## 4. Database Schema Design

### Kategori 3: Desain Database

**Prompt 5 — Database Schema:**
```
Buatkan database schema untuk aplikasi e-learning:
- Users (siswa, guru, admin)
- Courses (matkul, deskripsi, harga)
- Enrollments
- Lessons (video, materi, quiz)
- Submissions (tugas)
- Grades (nilai)

Untuk masing-masing table, berikan:
1. Nama kolom dan tipe data
2. Primary key dan foreign key
3. Index yang dibutuhkan
4. Sample data (3-5 baris)

Gunakan PostgreSQL syntax.
```

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'instructor', 'admin')),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    category VARCHAR(50),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    UNIQUE(user_id, course_id)
);

-- Indexes
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
```

**Prompt 6 — Optimize Query:**
```
Query ini lambat saat data mencapai 1 juta baris:

SELECT u.name, COUNT(e.id) as total_courses
FROM users u
JOIN enrollments e ON u.id = e.user_id
WHERE e.status = 'active'
GROUP BY u.name
HAVING COUNT(e.id) > 3;

Bantu saya:
1. Jalankan EXPLAIN ANALYZE (simulasi)
2. Identifikasi bottleneck
3. Buatkan index yang tepat
4. Rewrite query jika perlu
```

---

## 5. API Design

### Kategori 4: RESTful API

**Prompt 7 — Design API:**
```
Buatkan REST API design untuk aplikasi todo list:
- Endpoint untuk CRUD todos
- Endpoint untuk user management
- Authentication flow
- Pagination, filtering, sorting
- Error response format

Format: OpenAPI specification (YAML)
Include: request/response example untuk setiap endpoint
```

```yaml
# Todo API Endpoints
# Base URL: /api/v1

# Authentication
POST   /api/v1/auth/register    # Register user
POST   /api/v1/auth/login       # Login → JWT token
POST   /api/v1/auth/refresh     # Refresh token

# Todos (requires Bearer token)
GET    /api/v1/todos             # List todos (paginated)
POST   /api/v1/todos             # Create todo
GET    /api/v1/todos/:id         # Get todo detail
PUT    /api/v1/todos/:id         # Update todo
DELETE /api/v1/todos/:id         # Delete todo
PATCH  /api/v1/todos/:id/status  # Toggle status

# Query Parameters
# ?page=1&limit=20
# ?status=completed
# ?sort=created_at&order=desc
# ?search=keyword

# Response Format
{
  "status": "success",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}

# Error Format
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required"
  }
}
```

**Prompt 8 — Implementasi API:**
```
Buatkan implementasi REST API menggunakan Express.js
untuk endpoint /api/v1/todos di atas.

Sertakan:
1. File structure
2. Routes, controllers, services (separation of concerns)
3. Input validation (zod/joi)
4. Error handling middleware
5. Rate limiting
6. Unit test skeleton
```

---

## 6. Testing

### Kategori 5: Automated Testing

**Prompt 9 — Unit Test:**
```
Buatkan unit test untuk fungsi berikut menggunakan Jest:

\`\`\`python
def calculate_discount(price, percentage, min_purchase=100000):
    """Calculate discount with minimum purchase requirement."""
    if price < min_purchase:
        return 0
    if percentage < 0 or percentage > 100:
        raise ValueError("Percentage must be 0-100")
    return price * (percentage / 100)
\`\`\`

Include:
1. Happy path tests
2. Edge cases (boundary values)
3. Error cases
4. Test description yang deskriptif
```

```javascript
// calculateDiscount.test.js
const calculateDiscount = require('./calculateDiscount');

describe('calculateDiscount', () => {
  // Happy path
  test('should calculate 10% discount on Rp 200,000', () => {
    expect(calculateDiscount(200000, 10)).toBe(20000);
  });

  test('should calculate 50% discount on Rp 1,000,000', () => {
    expect(calculateDiscount(1000000, 50)).toBe(500000);
  });

  // Edge cases
  test('should return 0 for purchase below minimum', () => {
    expect(calculateDiscount(50000, 10)).toBe(0);
  });

  test('should handle exactly minimum purchase', () => {
    expect(calculateDiscount(100000, 10)).toBe(10000);
  });

  test('should handle 0% discount', () => {
    expect(calculateDiscount(200000, 0)).toBe(0);
  });

  test('should handle 100% discount', () => {
    expect(calculateDiscount(200000, 100)).toBe(200000);
  });

  // Error cases
  test('should throw error for negative percentage', () => {
    expect(() => calculateDiscount(200000, -10))
      .toThrow('Percentage must be 0-100');
  });

  test('should throw error for percentage > 100', () => {
    expect(() => calculateDiscount(200000, 150))
      .toThrow('Percentage must be 0-100');
  });

  // Custom minimum
  test('should respect custom minimum purchase', () => {
    expect(calculateDiscount(50000, 10, 30000)).toBe(5000);
  });
});
```

---

## 7. Performance Optimization

### Kategori 6: Optimasi

**Prompt 10 — Performance Audit:**
```
Website saya lambat. Berikut metrics Lighthouse:
- Performance: 45
- First Contentful Paint: 3.2s
- Largest Contentful Paint: 5.1s
- Time to Interactive: 6.8s
- Cumulative Layout Shift: 0.25

Tech stack: Next.js 14, PostgreSQL, deployed on Vercel

Bantu saya:
1. Identifikasi masalah utama
2. Buatkan prioritas perbaikan (high/medium/low)
3. Code example untuk setiap perbaikan
4. Estimasi dampak per perbaikan
```

**Prompt 11 — Database Optimization:**
```
Query saya lambat untuk dashboard analytics.
Tabel: transactions (5M rows), products (10K rows)

Query yang lambat:
SELECT p.name, COUNT(*) as sales_count, SUM(t.amount) as revenue
FROM transactions t
JOIN products p ON t.product_id = p.id
WHERE t.created_at BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY p.name
ORDER BY revenue DESC
LIMIT 10;

Bantu saya optimasi:
1. Tambahkan index yang tepat
2. Rewrite query jika perlu
3. Pertimbangkan materialized view
4. Redis caching strategy
```

---

## 8. Full-Stack Project

### Kategori 7: Build Complete App

**Prompt 12 — Plan Full-Stack App:**
```
Saya mau membangun real-time chat application.

Requirements:
- User registration & login
- 1-on-1 and group chat
- Real-time messaging (WebSocket)
- File/image sharing
- Read receipts
- Online status
- Mobile responsive

Buatkan:
1. Tech stack recommendation
2. Database schema
3. API endpoints
4. Component architecture (React)
5. WebSocket event design
6. Deployment plan
```

**Prompt 13 — Dashboard E-Commerce:**
```
Buatkan admin dashboard untuk e-commerce:
- Ringkasan penjualan harian/mingguan/bulanan
- Grafik trend penjualan
- Daftar pesanan terbaru
- Manajemen produk (CRUD)
- Filter by date range, status, category

Tech: Next.js 14, Tailwind CSS, Chart.js
Database: mock data dulu

Berikan kode untuk halaman dashboard utama
dengan komponen yang reusable.
```

---

## Key Takeaways

1. **AI membantu di semua level coding** — dari refactoring hingga architecture design
2. **Gunakan AI untuk code review** — temukan masalah sebelum ke production
3. **Testing adalah investasi** — AI bisa membantu menulis test yang komprehensif
4. **Performance matters** — gunakan AI untuk audit dan optimasi
5. **Full-stack project = learning terbaik** — AI mempercepat setiap tahap
6. **Pilih tool yang tepat** — setiap level dan task punya tool optimal

---

## Practice Exercises

1. **Refactor Challenge:** Ambil kode project lama yang berantakan. Gunakan AI untuk refactor dan terapkan clean code principles.

2. **Architecture Design:** Desain arsitektur untuk aplikasi yang ingin kamu bangun. Gunakan AI untuk review dan bandingkan dengan best practices.

3. **Database Schema:** Buat database schema lengkap untuk project semester menggunakan PostgreSQL. Minta AI review untuk normalisasi dan indexing.

4. **API + Test:** Buat REST API sederhana (3-4 endpoints). Buatkan unit test dengan coverage minimal 80%.

5. **Full-Stack Sprint:** Dalam 1 minggu, bangun mini full-stack app (todo list atau chat sederhana) menggunakan bantuan AI untuk setiap tahap.

---

## Next Module

👉 **Module 13: AI untuk Presentasi** — Membahas cara membuat presentasi yang profesional menggunakan AI: dari outline, konten, speaker notes, hingga desain visual.
