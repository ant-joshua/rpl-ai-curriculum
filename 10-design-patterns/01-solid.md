# Sesi 1 — Prinsip SOLID

> **SOLID** adalah 5 prinsip desain OOP yang bikin kode gampang dirawat, gampang dikembangin, dan nggak gampang patah pas ada perubahan. Dikenalin Robert C. Martin (Uncle Bob).

---

## S — Single Responsibility Principle (SRP)

> **Satu class = satu tanggung jawab.**  
> Kalau ada alasan lebih dari satu buat ngubah suatu class, berarti class itu kebanyakan kerjaan.

### ❌ Sebelum (langgar SRP)

```typescript
// Satu class ngurusin penyimpanan + notifikasi
class PesananService {
  simpanPesanan(pesanan: any): void {
    // Simpan ke database
    console.log(`Menyimpan pesanan ${pesanan.id} ke DB...`);
    // Kirim email
    console.log(`Mengirim email konfirmasi ke ${pesanan.email}...`);
    // Kirim WhatsApp
    console.log(`Mengirim WhatsApp ke ${pesanan.phone}...`);
  }
}
```

### ✅ Sesudah (SRP)

```typescript
class PesananRepository {
  simpan(pesanan: any): void {
    console.log(`Menyimpan pesanan ${pesanan.id} ke DB...`);
  }
}

class EmailService {
  kirimKonfirmasi(email: string): void {
    console.log(`Mengirim email konfirmasi ke ${email}...`);
  }
}

class WhatsAppService {
  kirimNotifikasi(phone: string): void {
    console.log(`Mengirim WhatsApp ke ${phone}...`);
  }
}

// Orchestrator — tapi tetap SRP karena cuma ngatur urutan
class PesananOrchestrator {
  constructor(
    private repo: PesananRepository,
    private email: EmailService,
    private wa: WhatsAppService
  ) {}

  proses(pesanan: any): void {
    this.repo.simpan(pesanan);
    this.email.kirimKonfirmasi(pesanan.email);
    this.wa.kirimNotifikasi(pesanan.phone);
  }
}
```

**Pakai SRP kalau:** Ada class yang mulai ngurusin banyak hal nggak nyambung — penyimpanan, notifikasi, validasi, logging di satu tempat.

---

## O — Open/Closed Principle (OCP)

> **Tertutup untuk modifikasi, terbuka untuk ekstensi.**  
> Jangan utak-atik kode yang udah jalan. Tambahin fitur baru dengan nambah class baru.

### ❌ Sebelum (langgar OCP)

```typescript
function hitungGaji(jenis: string, pokok: number): number {
  if (jenis === 'tetap') return pokok + 500_000 + pokok * 0.1;
  if (jenis === 'kontrak') return pokok + 200_000;
  if (jenis === 'magang') return pokok;
  // setiap tambah jenis, edit fungsi ini — risiko error!
  return pokok;
}
```

### ✅ Sesudah (OCP)

```typescript
interface KalkulatorGaji {
  hitung(pokok: number): number;
}

class GajiTetap implements KalkulatorGaji {
  hitung(pokok: number): number {
    return pokok + 500_000 + pokok * 0.1;
  }
}

class GajiKontrak implements KalkulatorGaji {
  hitung(pokok: number): number {
    return pokok + 200_000;
  }
}

class GajiMagang implements KalkulatorGaji {
  hitung(pokok: number): number {
    return pokok;
  }
}

class Payroll {
  constructor(private kalkulator: KalkulatorGaji) {}

  proses(pokok: number): number {
    return this.kalkulator.hitung(pokok);
  }
}

// Tambah jenis baru tanpa edit code lama:
class GajiFreelance implements KalkulatorGaji {
  hitung(pokok: number): number {
    return pokok + pokok * 0.05;
  }
}
```

**Pakai OCP kalau:** Sering nambah varian/jenis baru dan capek edit if-else terus.

---

## L — Liskov Substitution Principle (LSP)

> **Objek anak class harus bisa menggantikan objek parent class tanpa bikin error.**

### ❌ Sebelum (langgar LSP)

```typescript
class Rekening {
  constructor(protected saldo: number) {}

  tarik(jumlah: number): void {
    if (jumlah <= this.saldo) {
      this.saldo -= jumlah;
      console.log(`Tarik Rp${jumlah}. Sisa: Rp${this.saldo}`);
    }
  }
}

class RekeningTabungan extends Rekening {
  tarik(jumlah: number): void {
    const biayaAdmin = 5000;
    const total = jumlah + biayaAdmin;
    if (total <= this.saldo) {
      this.saldo -= total;
      console.log(`Tarik Rp${jumlah} + admin Rp${biayaAdmin}. Sisa: Rp${this.saldo}`);
    }
  }
}

function prosesTarik(rekening: Rekening, jumlah: number): void {
  const saldoAwal = rekening['saldo'];
  rekening.tarik(jumlah);
  // ❌ Kalau RekeningTabungan, saldo akhir beda — breaking substitution
}
```

### ✅ Sesudah (LSP)

```typescript
interface Rekening {
  saldo: number;
  tarik(jumlah: number): void;
}

class RekeningReguler implements Rekening {
  constructor(public saldo: number) {}

  tarik(jumlah: number): void {
    if (jumlah <= this.saldo) {
      this.saldo -= jumlah;
      console.log(`Tarik Rp${jumlah}. Sisa: Rp${this.saldo}`);
    }
  }
}

class RekeningPremium implements Rekening {
  constructor(public saldo: number) {}

  tarik(jumlah: number): void {
    const biayaAdmin = 5000;
    const total = jumlah + biayaAdmin;
    if (total <= this.saldo) {
      this.saldo -= total;
      console.log(`Tarik Rp${jumlah} (admin Rp${biayaAdmin}). Sisa: Rp${this.saldo}`);
    }
  }
}

// Fungsi ini kerja buat interface apa pun — LSP aman
function prosesTarik(rekening: Rekening, jumlah: number): void {
  rekening.tarik(jumlah);
}
```

**Pakai LSP kalau:** Kamu bikin inheritance dan ragu apakah anak class benar-benar "adalah" parent-nya.

---

## I — Interface Segregation Principle (ISP)

> **Jangan paksa class implement method yang nggak dia butuhin.**

### ❌ Sebelum (langgar ISP)

```typescript
interface Worker {
  kerja(): void;
  istirahat(): void;
  makan(): void;
}

// Robot nggak makan, tapi dipaksa implement
class RobotWorker implements Worker {
  kerja(): void {
    console.log('Robot bekerja...');
  }
  istirahat(): void {
    console.log('Robot idle...');
  }
  makan(): void {
    throw new Error('Robot tidak makan!');
  }
}
```

### ✅ Sesudah (ISP)

```typescript
interface Workable {
  kerja(): void;
}

interface Restable {
  istirahat(): void;
}

interface Eatable {
  makan(): void;
}

class HumanWorker implements Workable, Restable, Eatable {
  kerja(): void {
    console.log('Manusia bekerja...');
  }
  istirahat(): void {
    console.log('Manusia istirahat...');
  }
  makan(): void {
    console.log('Manusia makan...');
  }
}

class RobotWorkerISP implements Workable, Restable {
  kerja(): void {
    console.log('Robot bekerja...');
  }
  istirahat(): void {
    console.log('Robot idle...');
  }
  // ✅ Nggak perlu implement makan()
}
```

**Pakai ISP kalau:** Ada interface besar dengan banyak method tapi beberapa implementasinya nggak butuh semuanya.

---

## D — Dependency Inversion Principle (DIP)

> **Class tingkat tinggi jangan bergantung langsung ke class tingkat rendah. Dua-duanya harus bergantung ke abstraksi (interface).**

### ❌ Sebelum (langgar DIP)

```typescript
// ❌ Langsung panggil class konkret
class MySQLDatabase {
  simpan(data: string): void {
    console.log(`MySQL: Simpan ${data}`);
  }
}

class UserService {
  private db: MySQLDatabase;

  constructor() {
    this.db = new MySQLDatabase(); // Kaku — ganti PostgreSQL susah
  }

  simpanUser(data: string): void {
    this.db.simpan(data);
  }
}
```

### ✅ Sesudah (DIP)

```typescript
interface Database {
  simpan(data: string): void;
}

class MySQLDatabaseDIP implements Database {
  simpan(data: string): void {
    console.log(`MySQL: Simpan ${data}`);
  }
}

class PostgreSQLDatabase implements Database {
  simpan(data: string): void {
    console.log(`PostgreSQL: Simpan ${data}`);
  }
}

class MongoDBDatabase implements Database {
  simpan(data: string): void {
    console.log(`MongoDB: Simpan ${data}`);
  }
}

class UserServiceDIP {
  constructor(private db: Database) {} // ⚡ Bergantung ke abstraksi

  simpanUser(data: string): void {
    this.db.simpan(data);
  }
}

// Ganti DB tinggal ganti parameter:
const service = new UserServiceDIP(new MongoDBDatabase());
service.simpanUser('Budi');
```

**Pakai DIP kalau:** Kode kamu terikat ke detail teknis (database, API eksternal, file system) yang mungkin berubah.

---

## Latihan

### Soal 1 — SRP

Class berikut langgar SRP. Refactor jadi beberapa class dengan tanggung jawab terpisah.

```typescript
class OrderProcessor {
  process(order: any): void {
    // Validasi
    if (!order.items || order.items.length === 0) {
      throw new Error('Order kosong');
    }
    // Hitung total
    let total = 0;
    for (const item of order.items) {
      total += item.price * item.qty;
    }
    // Simpan
    console.log(`Simpan order ${order.id} — total Rp${total}`);
    // Kirim invoice
    console.log(`Kirim invoice ke ${order.email}`);
  }
}
```

### Soal 2 — OCP

Buat sistem diskon yang OCP-friendly. Saat ini cuma diskon member 10%. Nanti bakal nambah diskon VIP 20%, lebaran 15%, dan banyak lagi.

```typescript
// Implementasi awal — tolong refactor
function hitungDiskon(harga: number, tipe: string): number {
  if (tipe === 'member') return harga * 0.9;
  return harga;
}
```

### Soal 3 — ISP

Interface `MediaPlayer` punya method `playAudio()`, `playVideo()`, `showLyrics()`. Ada class `AudioPlayer` yang cuma butuh `playAudio()`. Refactor pake ISP.

### Soal 4 — DIP

Service berikut langsung panggil `FirebaseAuth` konkret. Refactor pake DIP biar bisa ganti auth provider (Auth0, Supabase, custom).

```typescript
class FirebaseAuth {
  login(email: string, password: string): Promise<string> {
    return Promise.resolve(`firebase-token-${email}`);
  }
}

class AuthService {
  private auth = new FirebaseAuth();

  async loginUser(email: string, password: string): Promise<string> {
    return this.auth.login(email, password);
  }
}
```

---

*Selamat mengerjakan! SOLID bukan aturan saklek — tapi pedoman biar kode lebih sehat.*
