---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 🧩 Microservices Hands-On"
footer: "Sesi 01: Monolith To Micro"
---

<!-- _class: title -->
# Sesi 01: Monolith to Microservices

**Durasi:** 120 menit

---

## 📌 Tujuan

- Memahami masalah arsitektur monolith
- Menerapkan Domain-Driven Design untuk bounded context
- Menggunakan Strangler Fig pattern untuk migrasi
- Merancang service boundaries yang tepat

---

## 1. Masalah Arsitektur Monolith

### 1.1 Deployment Coupling

Dalam monolith, satu perubahan kecil membutuhkan deploy seluruh aplikasi. Contoh nyata:

```typescript
// monolith/src/order.ts — satu perubahan di order
function calculateShipping(order: Order) {
  // fix: tax calculation for international orders
}

// deploy seluruh app — termasuk user, product, payment
// padahal cuma berubah satu fungsi
```

**Akibat:**
- Deploy risk tinggi — satu error bisa bikin semua fitur down
- Release cycle lambat — harus tunggu fitur lain selesai
- Rollback susah — harus rollback semuanya

### 1.2 Scaling Terbatas

```typescript
// monolith — semua fitur dalam satu proses
const app = express();
app.use('/api/users', userRoutes);    // heavy I/O
app.use('/api/products', productRoutes); // read-heavy
app.use('/api/orders', orderRoutes);     // write-heavy
app.use('/api/payments', paymentRoutes); // compliance-heavy

// Mau scale cuma bagian payment? Ga bisa.
// Harus scale seluruh app — boros resource.
app.listen(3000);
```

**Masalah:** Semua fitur scale bareng. Bagian yang berat (payment) butuh resource besar, bagian ringan (products) ikut kebawa.

### 1.3 Technology Lock-In

Monolith biasanya pilih satu tech stack. Susah ganti:
- Mau coba database baru? Ga bisa — seluruh app tergantung database lama
- Mau pake bahasa lain? Ga bisa — semua dalam 1 codebase
- Mau upgrade library? Resiko tinggi — bisa break fitur lain

---

## 2. Bounded Context — Domain-Driven Design

### 2.1 Apa Itu Bounded Context?

Bounded context adalah batasan logis dalam domain bisnis. Setiap context punya:
- **Model data sendiri** — tabel/collection terpisah
- **Bahasa sendiri** — Ubiquitous Language
- **Tim sendiri** — ownership jelas

### 2.2 Identifikasi Bounded Context

Ambil contoh e-commerce:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Context   │     │  Product Context │     │  Order Context  │
│                 │     │                 │     │                 │
│ - Register      │     │ - Catalog       │     │ - Checkout      │
│ - Login         │     │ - Inventory     │     │ - Payment       │
│ - Profile       │     │ - Pricing       │     │ - Shipping      │
│ - Auth tokens   │     │ - Reviews       │     │ - Refunds       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  PostgreSQL     │     │  MongoDB        │     │  MySQL          │
│  (relational)   │     │  (document)     │     │  (relational)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Setiap context punya database sendiri.** Ini kunci microservices.

### 2.3 Ubiquitous Language

Setiap context punya istilah sendiri. Contoh:

| Istilah | User Context | Product Context | Order Context |
|---------|-------------|----------------|---------------|
| User | Customer | Seller | Buyer |
| Product | - | Item, SKU | Merchandise |
| Order | Transaction | - | Purchase |
| Stock | - | Inventory | Availability |

### 2.4 Mapping Domain

Langkah identifikasi:

```typescript
// Step 1: Identifikasi domain events
const domainEvents = {
  'UserRegistered',     // -> User Context
  'ProductAdded',       // -> Product Context
  'ProductSold',        // -> Order Context
  'PaymentProcessed',   // -> Order Context
  'OrderShipped',       // -> Order Context
  'ReviewSubmitted',    // -> Product Context
};

// Step 2: Kelompokkan per context
const boundedContexts = {
  user: {
    events: ['UserRegistered'],
    entities: ['User', 'Role', 'Permission'],
    services: ['AuthService', 'ProfileService'],
  },
  product: {
    events: ['ProductAdded', 'ReviewSubmitted'],
    entities: ['Product', 'Category', 'Review'],
    services: ['CatalogService', 'InventoryService'],
  },
  order: {
    events: ['ProductSold', 'PaymentProcessed', 'OrderShipped'],
    entities: ['Order', 'Payment', 'Shipment'],
    services: ['CheckoutService', 'PaymentService'],
  },
};
```

---

## 3. Strangler Fig Pattern

### 3.1 Konsep

Strangler Fig — pohon yang tumbuh melilit pohon inang sampai inangnya mati. Dalam software: fitur baru dibangun sebagai service terpisah, lalu routing dialihkan perlahan.

```
Phase 1: Monolith melayani semua
┌─────────┐    ┌─────────────┐
│ Client  │───▶│  Monolith   │
└─────────┘    └─────────────┘

Phase 2: Satu fitur dipindah
┌─────────┐    ┌─────────────┐
│ Client  │───▶│  Monolith   │────▶ User Service
│         │    │  (minus     │
│         │    │   user)     │
└─────────┘    └─────────────┘

Phase 3: Semua fitur terpisah
┌─────────┐    ┌─────────────┐
│ Client  │───▶│  API GW     │───▶ User Service
│         │    │             │───▶ Product Service
│         │    │             │───▶ Order Service
└─────────┘    └─────────────┘
```

### 3.2 Route-by-Route Migration

```typescript
// Monolith — sebelum refactor
app.use('/api/users', userRoutes);     // akan dipindah
app.use('/api/products', productRoutes); // masih di monolith
app.use('/api/orders', orderRoutes);     // masih di monolith

// Langkah 1: Proxy di monolith untuk route yang sudah dipindah
app.use('/api/users', createProxy('http://user-service:3001'));
// Request /api/users diteruskan ke service baru

// Langkah 2: Route baru langsung ke service baru
// Monolith hanya jadi proxy router

// Langkah 3: Matikan monolith, API Gateway ambil alih
```

### 3.3 Implementation Pattern

```typescript
// strangler-proxy.ts — proxy di monolith
import httpProxy from 'http-proxy-middleware';

const migratedRoutes = {
  '/api/users': 'http://user-service:3001',
  '/api/auth': 'http://user-service:3001',
};

for (const [route, target] of Object.entries(migratedRoutes)) {
  app.use(route, createProxy({
    target,
    changeOrigin: true,
    // log migration status
    on: {
      proxyReq: (proxyReq) => console.log(`[Strangler] ${proxyReq.path} -> ${target}`),
      proxyRes: (proxyRes) => proxyRes.headers['x-migrated'] = 'true',
    }
  }));
}
```

---

## 4. Shared Kernel vs Anti-Corruption Layer

### 4.1 Shared Kernel

Bagian kode yang **dipakai bersama** antar context. Minimal dan stabil.

```typescript
// shared-kernel/types.ts — tipe dasar yang dipakai semua service
export type UUID = string;
export type Email = string;
export type Timestamp = string; // ISO 8601

export interface BaseEntity {
  id: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  correlationId: string;
}
```

**Aturan Shared Kernel:**
- Hanya tipe dasar — tidak ada business logic
- Jarang berubah (stable)
- Semua service depend on it

### 4.2 Anti-Corruption Layer (ACL)

Lapisan yang **melindungi** context dari perubahan di context lain. Berguna saat integrasi dengan legacy system.

```typescript
// order-service/acl/user-acl.ts
// ACL melindungi Order Service dari model User yang berubah-ubah

interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

// ACL — translate dari user service model ke order context model
export class UserAcl {
  async getUser(userId: string): Promise<UserResponse> {
    const raw = await this.userServiceClient.getUser(userId);
    
    // translate ke format yang dipahami Order Context
    return {
      id: raw.id,
      name: `${raw.firstName} ${raw.lastName}`, // gabung field
      email: raw.email,
      role: raw.role === 'premium' ? 'VIP' : 'Regular', // translate enum
    };
  }
}
```

**Kapan pake ACL:**
- Integrasi dengan legacy system yang modelnya beda
- Context external yang sering berubah
- Butuh isolation kuat antar tim

---

## 5. Service Boundaries — Studi Kasus

### 5.1 User Service

```typescript
// Boundaries:
// - Registration & authentication
// - Profile management
// - Role & permission

interface User {
  id: UUID;
  email: Email;
  passwordHash: string;
  profile: {
    name: string;
    avatar?: string;
  };
  role: 'customer' | 'admin';
  createdAt: Timestamp;
}

// Owns: users table
// Exposes: POST /register, POST /login, GET /profile, PUT /profile
// Depends on: nothing (auth sendiri)
```

### 5.2 Product Service

```typescript
// Boundaries:
// - Product catalog
// - Inventory management
// - Categories & search

interface Product {
  id: UUID;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: UUID;
  reviews: Review[];
  createdAt: Timestamp;
}

// Owns: products, categories, reviews tables
// Exposes: CRUD products, search, stock check
// Depends on: User Service (for seller info, via ACL)
```

### 5.3 Order Service

```typescript
// Boundaries:
// - Shopping cart
// - Checkout process
// - Payment processing
// - Shipping & tracking

interface Order {
  id: UUID;
  userId: UUID;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  payment: PaymentInfo;
  shipping: ShippingInfo;
  createdAt: Timestamp;
}

interface OrderItem {
  productId: UUID;
  quantity: number;
  price: number;
}

// Owns: orders, payments, shipments tables
// Exposes: POST /checkout, GET /orders, POST /pay
// Depends on: Product Service (for price/stock), User Service (for address)
```

---

## 6. Latihan: Identify Bounded Contexts

### Studi Kasus: Platform Learning Management System (LMS)

Sebuah LMS monolith ingin dipecah jadi microservices. Fitur-fiturnya:

1. **Manajemen Kursus** — CRUD kursus, materi, quiz
2. **Manajemen Pengguna** — daftar, login, profil, roles (siswa, instruktur, admin)
3. **Enrollment** — daftar kursus, progres belajar, sertifikat
4. **Pembayaran** — checkout kursus, refund, invoice
5. **Forum Diskusi** — tanya-jawab per kursus, komentar

### Tugas

1. Identifikasi minimal 3 bounded context
2. Tentukan entities utama per context
3. Tentukan service boundary — apa yang di-own dan apa yang di-expose
4. Identifikasi shared kernel (tipe data yang dipakai bersama)
5. Apakah perlu Anti-Corruption Layer? Dimana?

### Template Jawaban

```markdown
## Bounded Context 1: [Nama Context]
- Entities: ...
- Owns: ...
- Exposes: ...
- Depends on: ...

## Bounded Context 2: [Nama Context]
- Entities: ...
- Owns: ...
- Exposes: ...
- Depends on: ...

## Shared Kernel:
- ...
```

---

## 📖 Referensi

- [Domain-Driven Design — Eric Evans](https://www.domainlanguage.com/ddd/)
- [Strangler Fig Pattern — Martin Fowler](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Bounded Context — Martin Fowler](https://martinfowler.com/bliki/BoundedContext.html)
- [Anti-Corruption Layer](https://docs.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer)
