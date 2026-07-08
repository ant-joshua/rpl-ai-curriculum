# Sesi 2: Implementasi & Payment — E-Commerce AI

> **Durasi:** 4 minggu (Sprint 2–3) | **Mode:** Kelompok 2-3 orang

---

## 📋 Ringkasan

Sesi ini mencakup implementasi core e-commerce: Next.js storefront, integrasi payment gateway (Midtrans/Xendit), cart logic, dan order management. Mahasiswa akan membangun full flow dari browsing produk hingga checkout dan pembayaran.

---

## 1. Next.js Storefront

### 1.1 Setup Project

```bash
npx create-next-app@latest ecommerce-ai --typescript --tailwind --app
cd ecommerce-ai
npm install @prisma/client next-auth bcryptjs zustand
npm install -D prisma @types/bcryptjs
```

### 1.2 Halaman Produk

```tsx
// src/app/page.tsx — Homepage
'use client';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import SearchBar from '@/components/product/SearchBar';
import RecommendationSection from '@/components/product/RecommendationSection';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: { name: string };
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?limit=12')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-4">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl mb-8">
        <h1 className="text-4xl font-bold mb-4">Belanja Cerdas dengan AI</h1>
        <p className="text-gray-600 mb-6">Temukan produk dengan pencarian semantic dan rekomendasi personal</p>
        <SearchBar />
      </section>

      {/* Rekomendasi AI */}
      <RecommendationSection />

      {/* Semua Produk */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Semua Produk</h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

### 1.3 Product Card Component

```tsx
// src/components/product/ProductCard.tsx
import Link from 'next/link';

export default function ProductCard({ product }: { product: any }) {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              📷 No Image
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Habis
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
          <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
          <p className="text-blue-600 font-bold">{formatter.format(product.price)}</p>
        </div>
      </div>
    </Link>
  );
}
```

### 1.4 Search Bar dengan Semantic Search

```tsx
// src/components/product/SearchBar.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }

    const res = await fetch('/api/products/search-semantic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: value, limit: 5 }),
    });
    const data = await res.json();
    setResults(data.products || []);
    setShowResults(true);
  };

  return (
    <div className="relative max-w-xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={e => handleSearch(e.target.value)}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        placeholder="Cari produk... contoh: 'kemeja batik lengan panjang'"
        className="w-full p-3 pl-10 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>

      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border z-50">
          {results.map((product: any) => (
            <button
              key={product.id}
              onClick={() => router.push(`/products/${product.id}`)}
              className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0"
            >
              <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {product.image_url && <img src={product.image_url} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-blue-600 text-xs">Rp {product.price.toLocaleString()}</p>
              </div>
              <span className="text-xs text-gray-400">
                {(product.score * 100).toFixed(0)}% cocok
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 2. Payment Integration (Midtrans / Xendit)

### 2.1 Midtrans Setup

```bash
npm install midtrans-client
```

### 2.2 Payment Service

```typescript
// src/services/payment.ts
import Midtrans from 'midtrans-client';

const snap = new Midtrans.Snap({
  isProduction: false, // Sandbox mode
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export interface PaymentRequest {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export class PaymentService {
  async createTransaction(params: PaymentRequest) {
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
      },
      item_details: params.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  }

  async handleNotification(notificationJson: any) {
    const statusResponse = await snap.transaction.notification(notificationJson);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let orderStatus: string;
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      orderStatus = 'confirmed';
    } else if (transactionStatus === 'pending') {
      orderStatus = 'pending';
    } else {
      orderStatus = 'cancelled';
    }

    return { orderId, orderStatus };
  }
}
```

### 2.3 Checkout Flow

```tsx
// src/app/cart/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CartPage() {
  const { data: session } = useSession();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipping_address: form.address }),
      });
      const order = await orderRes.json();

      // 2. Get payment token
      const payRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.id }),
      });
      const { token } = await payRes.json();

      // 3. Open Midtrans Snap
      window.snap.pay(token, {
        onSuccess: () => {
          router.push(`/orders/${order.id}?status=success`);
        },
        onPending: () => {
          router.push(`/orders/${order.id}?status=pending`);
        },
        onError: () => {
          alert('Pembayaran gagal, silakan coba lagi');
        },
      });
    } catch (error) {
      alert('Terjadi kesalahan saat checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>
      {/* Cart items list */}
      <div className="space-y-4 mb-6">
        {cart?.items?.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
            <img src={item.product.image_url} className="w-20 h-20 object-cover rounded" />
            <div className="flex-1">
              <h3 className="font-medium">{item.product.name}</h3>
              <p className="text-sm text-gray-500">Rp {item.product.price.toLocaleString()} × {item.quantity}</p>
            </div>
            <button className="text-red-500 text-sm hover:underline">Hapus</button>
          </div>
        ))}
      </div>

      {/* Checkout button */}
      <button
        onClick={handleCheckout}
        disabled={loading || !cart?.items?.length}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
      >
        {loading ? 'Memproses...' : `Checkout — Rp ${cart?.total?.toLocaleString() || 0}`}
      </button>
    </div>
  );
}
```

### 2.4 Payment Notification Webhook

```typescript
// src/app/api/payments/notification/route.ts
import { PaymentService } from '@/services/payment';

export async function POST(request: Request) {
  const notificationJson = await request.json();
  const paymentService = new PaymentService();

  try {
    const { orderId, orderStatus } = await paymentService.handleNotification(notificationJson);

    // Update order status in database
    await prisma.order.update({
      where: { id: orderId },
      data: { status: orderStatus },
    });

    return Response.json({ status: 'ok' });
  } catch (error) {
    console.error('Payment notification error:', error);
    return Response.json({ status: 'error' }, { status: 500 });
  }
}
```

---

## 3. Cart Logic

### 3.1 Cart Service (Backend)

```typescript
// src/modules/cart/cart.service.ts
export class CartService {
  async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { user_id: userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: userId },
        include: { items: { include: { product: true } } },
      });
    }

    return cart;
  }

  async addItem(userId: string, productId: string, quantity: number = 1) {
    const cart = await this.getOrCreateCart(userId);

    // Check stock
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.stock < quantity) {
      throw new Error('Stok tidak mencukupi');
    }

    // Check if item already in cart
    const existingItem = cart.items.find(item => item.product_id === productId);
    if (existingItem) {
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    }

    return prisma.cartItem.create({
      data: { cart_id: cart.id, product_id: productId, quantity },
    });
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    if (quantity < 1) {
      return this.removeItem(userId, itemId);
    }
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cart_id: cart.id },
    });
    if (!item) throw new Error('Item tidak ditemukan');
    return prisma.cartItem.delete({ where: { id: itemId } });
  }
}
```

---

## 4. Order Management

### 4.1 Order Service

```typescript
// src/modules/order/order.service.ts
export class OrderService {
  async checkout(userId: string, shippingAddress: string) {
    // 1. Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { user_id: userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Keranjang kosong');
    }

    // 2. Validate stock
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Stok ${item.product.name} tidak mencukupi`);
      }
    }

    // 3. Calculate total
    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    // 4. Create order & order items (transaction)
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          user_id: userId,
          status: 'pending',
          total,
          shipping_address: shippingAddress,
          items: {
            create: cart.items.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      // Reduce stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.product_id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cart_id: cart.id } });

      return newOrder;
    });

    return order;
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    return prisma.order.findMany({
      where: { user_id: userId },
      include: { items: { include: { product: true } } },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getOrderDetail(orderId: string, userId: string) {
    return prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
      include: { items: { include: { product: true } } },
    });
  }
}
```

---

## 5. Latihan

> **Latihan 1:** Product Listing Page
> Buat halaman product listing dengan grid responsif (2 kolom mobile, 4 kolom desktop). Implementasi loading skeleton, empty state, dan error state. Fetch dari `GET /api/products` dengan pagination.

> **Latihan 2:** Semantic Search Frontend
> Implementasi search bar dengan semantic search. Gunakan endpoint `POST /api/products/search-semantic`. Tampilkan hasil sebagai dropdown dengan: thumbnail, nama, harga, dan persentase kecocokan. Handle debounce 300ms.

> **Latihan 3:** Cart CRUD Operations
> Implementasi cart backend: add item (validasi stok), update quantity, remove item, get cart. Buat halaman cart di frontend dengan daftar item, total harga, dan tombol checkout.

> **Latihan 4:** Checkout & Payment
> Implementasi checkout flow: create order dari cart → hitung total → validasi stok → panggil Midtrans → redirect ke Snap payment page. Handle callback: success redirect ke halaman order detail.

> **Latihan 5:** Order History
> Buat halaman riwayat order dengan daftar order, status badge (warna berbeda per status), dan tombol lihat detail. Implementasi pagination dengan infinite scroll atau page numbers.

> **Latihan 6:** Stock Management
> Implementasi stock management: saat order dibuat, kurangi stok produk. Jika checkout gagal (payment failed/kadaluarsa), kembalikan stok. Gunakan Prisma transaction untuk atomicity.

> **Latihan 7:** Payment Notification Handler
> Buat webhook endpoint `POST /api/payments/notification` yang menerima notifikasi dari Midtrans. Update status order berdasarkan transaction_status. Test dengan Midtrans simulator/sandbox.

---

## 💡 Tips

- **Gunakan Zustand** untuk state management cart di frontend — lebih ringan dari Redux.
- **Prisma transaction** untuk checkout — pastikan stock reduction dan order creation atomic.
- **Midtrans sandbox**: Gunakan kartu kredit test `4811 1111 1111 1114` dengan expiry bulan depan.
- **Loading state**: Setiap tombol checkout harus punya loading state + disable double-click.

---

| [← Sesi 1: Spesifikasi & Arsitektur](01-spec-architecture.md) | [Lanjut ke Sesi 3: AI & Deploy →](03-ai-deploy.md) |
|---|---|
