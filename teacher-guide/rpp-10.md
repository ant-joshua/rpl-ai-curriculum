# RPP: Design Patterns & Prinsip SOLID

| Info | Detail |
|------|--------|
| Kode | RPL-AI-10 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Beginner–Intermediate |
| Prasyarat | Paham class & interface di TypeScript |

## Pertemuan 1: SOLID Principles

### Tujuan
- Memahami 5 prinsip SOLID
- Mengidentifikasi violation di kode nyata
- Merefactor kode ke SOLID

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Apersepsi**: "Kode lo susah diubah?" — demo kode rapuh vs modular | Tanya jawab + demo | Slide |
| 20' | **SOLID overview**: SRP, OCP, LSP, ISP, DIP — tiap prinsip 4 menit | Ceramah | Slide + contoh kode |
| 20' | **Demo per prinsip**: Violation → refactor untuk SRP, OCP, DIP | Live code | Live code |
| 25' | **Praktik**: Identifikasi SOLID violation di code Express route, refactor | Hands-on | Starter code |
| 15' | **Praktik mandiri**: Pisahkan service layer dari route handler | Problem solving | Soal |
| 5' | **Refleksi**: Prinsip mana paling sulit diterapkan? | Q&A | — |

### Bahan Ajar
- [Module 10 - SOLID](../10-design-patterns/01-solid.md)

---

## Pertemuan 2: Creational Patterns — Singleton, Factory, Builder

### Tujuan
- Menerapkan Singleton pattern (database connection)
- Menggunakan Factory pattern untuk membuat objek
- Builder pattern untuk objek kompleks

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review SOLID** | Kuis | — |
| 15' | **Singleton**: DB connection pool, global state | Ceramah + demo | Live code |
| 15' | **Factory**: Kapan butuh factory, flexible object creation | Ceramah + demo | Live code |
| 10' | **Builder**: Chaining, objek dengan banyak optional params | Ceramah + demo | Live code |
| 30' | **Praktik**: Refactor koneksi DB jadi Singleton + Factory untuk create user/handler | Hands-on | Starter project |
| 10' | **Refleksi**: Singleton anti-pattern? Kapan bahaya? | Diskusi | — |

### Bahan Ajar
- [Module 10 - Creational Patterns](../10-design-patterns/02-creational.md)

---

## Pertemuan 3: Structural & Behavioral Patterns

### Tujuan
- Menerapkan Adapter, Decorator, Proxy pattern
- Menggunakan Observer dan Strategy pattern
- Memilih pattern yang tepat untuk masalah

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review creational patterns** | Review | — |
| 15' | **Structural**: Adapter (API lama→baru), Decorator (middleware pattern), Proxy | Ceramah + demo | Live code |
| 20' | **Behavioral**: Observer (event emitter), Strategy (multiple algorithm), Command | Ceramah + demo | Live code |
| 30' | **Praktik**: Implementasi Strategy pattern untuk payment method + Observer untuk event | Hands-on | Starter code |
| 15' | **Praktik mandiri**: Pilih 1 pattern untuk masalah di project Express | Problem solving | Soal |
| 5' | **Refleksi**: Pattern yang paling sering dipake di web dev? | Q&A | — |

### Bahan Ajar
- [Module 10 - Structural & Behavioral Patterns](../10-design-patterns/03-structural-behavioral.md)

---

## Pertemuan 4: Functional Programming & Real-world Patterns

### Tujuan
- Menulis pure function dan immutability
- Menerapkan composition dan currying
- Mengintegrasikan patterns ke Express & Mastra

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Review patterns** | Q&A | — |
| 15' | **Functional**: pure function, immutability, no side effects | Ceramah + demo | Live code |
| 15' | **Composition & currying**: compose, pipe, partial application | Ceramah + demo | Live code |
| 15' | **Patterns in Express**: middleware chain (Decorator), route factory (Factory) | Ceramah + demo | Live code |
| 15' | **Patterns in Mastra**: tool factory, agent composition | Ceramah + demo | Live code |
| 15' | **Praktik**: Refactor 1 Express route + 1 Mastra tool pake patterns | Hands-on | Starter project |
| 5' | **Refleksi**: Pattern itu tools, bukan aturan — kapan jangan pake pattern? | Diskusi | — |

### Bahan Ajar
- [Module 10 - Functional & Real-world](../10-design-patterns/04-functional-realworld.md)
