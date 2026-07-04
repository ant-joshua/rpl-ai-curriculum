# 🧠 Cheatsheet: Design Patterns & SOLID

> Referensi cepet — 1 halaman. Print atau bookmark.

## Topik Utama
- **SOLID Principles**:
  - **S**RP — Satu class satu tanggung jawab
  - **O**CP — Terbuka untuk ekstensi, tertutup untuk modifikasi
  - **L**SP — Subclass bisa ganti parent tanpa rusak
  - **I**SP — Interface jangan dipaksa punya method yang ga dipake
  - **D**IP — Depend on abstractions, not concretions

- **Creational**: Singleton (1 instance global), Factory (bikin object), Builder (complex object step-by-step)
- **Structural**: Adapter (nyambungin 2 interface beda), Decorator (nambah behavior), Proxy (kontrol akses)
- **Behavioral**: Observer (pub/sub), Strategy (tukar algoritma runtime), Command (enkapsulasi action)
- **Functional**: Pure functions, immutability, composition, currying

## Sintaks Penting

```typescript
// SRP
class UserRepository { save(user: User) { /* DB logic */ } }
class EmailService { sendWelcome(email: string) { /* email logic */ } }

// Singleton
class Database {
  private static instance: Database;
  private constructor() {}
  static getInstance(): Database {
    if (!Database.instance) Database.instance = new Database();
    return Database.instance;
  }
}

// Factory
interface Payment { pay(amount: number): void; }
class CreditCardPayment implements Payment { pay(amount) { /* ... */ } }
class PaymentFactory {
  static create(type: string): Payment {
    if (type === 'credit') return new CreditCardPayment();
    throw new Error('Unknown payment type');
  }
}

// Strategy
interface SortStrategy { sort(data: number[]): number[]; }
class BubbleSort implements SortStrategy { sort(data) { /* ... */ } }
class QuickSort implements SortStrategy { sort(data) { /* ... */ } }
```

## Tips & Trik
- Jangan paksa pake pattern — pilih sesuai masalah
- Strategy pattern = ganti algoritma runtime (e.g. sorting method)
- Observer = event emitter (e.g. button click notification)
- Kalo cuma 1 class, ga perlu interface — YAGNI

## Common Mistakes
- ❌ Over-engineering — pake pattern padahal simple function cukup
- ❌ Singleton disalah-gunakan jadi global state
- ❌ LSP violation: subclass ubah behavior parent

## Link Cepat
- [Module README](README.md)
- [Latihan](../exercises/10-design-patterns.md)
- [Quiz](quiz.md)
