# 10 — Design Patterns & Prinsip SOLID

> **Panduan Praktis untuk Siswa SMK RPL** | TypeScript + Contoh Nyata

---

## Daftar Isi

1. [Prinsip SOLID](#1-prinsip-solid)
2. [Functional Programming](#2-functional-programming)
3. [Creational Patterns](#3-creational-patterns)
4. [Structural Patterns](#4-structural-patterns)
5. [Behavioral Patterns](#5-behavioral-patterns)

---

## 1. Prinsip SOLID

SOLID adalah 5 prinsip desain OOP yang bikin kode kita gampang dirawat, gampang dikembangin, dan nggak gampang patah kalau ada perubahan. Dikenalin sama Robert C. Martin (Uncle Bob).

### S — Single Responsibility Principle (SRP)

> **Satu class = satu tanggung jawab.**
> Kalau ada alasan lebih dari satu buat ngubah suatu class, berarti class itu kebanyakan kerjaan.

**Analogi:** Tukang masak ya masak aja. Jangan merangkap jadi kasir, pelayan, sama sopir. Kalau dia sakit, semua fungsi restoran berhenti.

```typescript
// ❌ BURUK — class ini ngapain aja?
class User {
  constructor(public name: string, public email: string) {}

  saveToDatabase(): void {
    console.log(`Menyimpan ${this.name} ke DB...`);
  }

  sendEmail(message: string): void {
    console.log(`Mengirim email ke ${this.email}: ${message}`);
  }
}

// ✅ BAIK — pisah tanggung jawab
class UserService {
  save(user: User): void {
    console.log(`Menyimpan ${user.name} ke DB...`);
  }
}

class EmailService {
  send(user: User, message: string): void {
    console.log(`Mengirim email ke ${user.email}: ${message}`);
  }
}
```

**Pakai SRP kalau:** Ada satu class yang mulai melakukan banyak hal yang nggak saling nyambung.

---

### O — Open/Closed Principle (OCP)

> **Tertutup untuk modifikasi, terbuka untuk ekstensi.**
> Jangan utak-atik kode yang udah jalan. Tambahin fitur baru dengan nambah class baru.

**Analogi:** Colokan listrik. Kita nggak perlu bongkar tembok buat colokin kipas angin — tinggal colokin aja.

```typescript
// ❌ BURUK — setiap kali ada diskon baru, kita edit class ini
class DiscountCalculator {
  calculate(price: number, type: string): number {
    if (type === 'member') return price * 0.9;
    if (type === 'vip') return price * 0.8;
    if (type === 'lebaran') return price * 0.85;
    return price;
  }
}

// ✅ BAIK — pakai inheritance/polymorphism
interface Discount {
  apply(price: number): number;
}

class MemberDiscount implements Discount {
  apply(price: number): number {
    return price * 0.9;
  }
}

class VIPDiscount implements Discount {
  apply(price: number): number {
    return price * 0.8;
  }
}

class NoDiscount implements Discount {
  apply(price: number): number {
    return price;
  }
}

class DiscountCalculatorOCP {
  calculate(price: number, discount: Discount): number {
    return discount.apply(price);
  }
}
```

**Pakai OCP kalau:** Fitur sering berubah atau kamu harus nambah jenis-jenis baru terus.

---

### L — Liskov Substitution Principle (LSP)

> **Objek anak class harus bisa menggantikan objek parent class tanpa bikin error.**

**Analogi:** Kalau fungsi butuh "Hewan", boleh kirim "Kucing" atau "Anjing". Tapi kalau fungsi butuh "Bebek" terus kamu kirim "Kucing", ya berantem.

```typescript
// ❌ BURUK — class Kotak bikin pecahin logika
class PersegiPanjang {
  constructor(protected lebar: number, protected tinggi: number) {}

  setLebar(n: number): void {
    this.lebar = n;
  }

  setTinggi(n: number): void {
    this.tinggi = n;
  }

  luas(): number {
    return this.lebar * this.tinggi;
  }
}

class Kotak extends PersegiPanjang {
  setLebar(n: number): void {
    this.lebar = n;
    this.tinggi = n; // ❌ ngubah tinggi juga — melanggar ekspektasi parent
  }

  setTinggi(n: number): void {
    this.tinggi = n;
    this.lebar = n;
  }
}

// ✅ BAIK — pakai interface terpisah
interface Bentuk {
  luas(): number;
}

class Persegi implements Bentuk {
  constructor(private sisi: number) {}
  luas(): number {
    return this.sisi * this.sisi;
  }
}

class PersegiPanjangLSP implements Bentuk {
  constructor(private lebar: number, private tinggi: number) {}
  luas(): number {
    return this.lebar * this.tinggi;
  }
}
```

**Pakai LSP kalau:** Kamu bikin turunan class dan ragu apakah dia benar-benar "adalah" parent-nya.

---

### I — Interface Segregation Principle (ISP)

> **Jangan paksa class implement method yang nggak dia butuhin.**
> Mending beberapa interface kecil daripada satu interface raksasa.

**Analogi:** Kamu nggak perlu kartu pelajar, SIM, dan paspor sekaligus buat masuk sekolah — cukup kartu pelajar aja.

```typescript
// ❌ BURUK — interface raksasa
interface Mesin {
  cetak(doc: string): void;
  scan(doc: string): void;
  fax(doc: string): void;
}

class PrinterMurah implements Mesin {
  cetak(doc: string): void {
    console.log(`Cetak: ${doc}`);
  }
  scan(_doc: string): void {
    throw new Error('Fitur scan nggak ada!');
  }
  fax(_doc: string): void {
    throw new Error('Fitur fax nggak ada!');
  }
}

// ✅ BAIK — interface kecil-kecil
interface Printer {
  cetak(doc: string): void;
}

interface Scanner {
  scan(doc: string): void;
}

interface Fax {
  fax(doc: string): void;
}

class PrinterMurahISP implements Printer {
  cetak(doc: string): void {
    console.log(`Cetak: ${doc}`);
  }
}

class MesinAllInOne implements Printer, Scanner, Fax {
  cetak(doc: string): void {
    console.log(`Cetak: ${doc}`);
  }
  scan(doc: string): void {
    console.log(`Scan: ${doc}`);
  }
  fax(doc: string): void {
    console.log(`Fax: ${doc}`);
  }
}
```

**Pakai ISP kalau:** Ada interface dengan banyak method tapi beberapa class nggak butuh semuanya.

---

### D — Dependency Inversion Principle (DIP)

> **Class tingkat tinggi jangan bergantung langsung ke class tingkat rendah. Dua-duanya harus bergantung ke abstraksi (interface).**

**Analogi:** Remote TV. Remote nggak peduli TV-nya merk apa — yang penting ada tombol ON/OFF.

```typescript
// ❌ BURUK — langsung panggil class konkret
class MySQLDatabase {
  simpan(data: string): void {
    console.log(`MySQL: Simpan ${data}`);
  }
}

class UserServiceBad {
  private db: MySQLDatabase;

  constructor() {
    this.db = new MySQLDatabase(); // ❌ kaku, ganti DB susah
  }

  simpanUser(data: string): void {
    this.db.simpan(data);
  }
}

// ✅ BAIK — bergantung ke interface
interface Database {
  simpan(data: string): void;
}

class MySQLDatabaseDIP implements Database {
  simpan(data: string): void {
    console.log(`MySQL: Simpan ${data}`);
  }
}

class MongoDBDatabase implements Database {
  simpan(data: string): void {
    console.log(`MongoDB: Simpan ${data}`);
  }
}

class UserServiceDIP {
  constructor(private db: Database) {} // abstraksi, bukan konkret

  simpanUser(data: string): void {
    this.db.simpan(data);
  }
}

// Tinggal ganti implementasi:
const service = new UserServiceDIP(new MongoDBDatabase());
```

**Pakai DIP kalau:** Code kamu bergantung ke detail teknis (database, API eksternal, file system) yang mungkin berubah.

---

## 2. Functional Programming

Paradigma yang treat function sebagai "warga negara kelas satu". Code lebih prediktabel dan gampang di-test.

### Pure Function

> **Function murni: input sama → output sama. Nggak ada efek samping. Nggak ubah variable global.**

```typescript
// ❌ IMPURE — pake variable global
let diskon = 0.1;
function hargaDiskon(harga: number): number {
  return harga - harga * diskon; // diskon bisa berubah kapan aja
}

// ✅ PURE — semua parameter eksplisit
function hargaDiskonPure(harga: number, persenDiskon: number): number {
  return harga - harga * persenDiskon;
}
```

**Pakai pure function kalau:** Fungsi harus bisa dipanggil kapan aja dengan hasil yang bisa ditebak.

### Immutability (Immutabel)

> **Data nggak boleh diubah setelah dibuat. Kalau mau "ubah", bikin salinan baru.**

```typescript
// ❌ BURUK — mutasi array asli
function tambahMurid(murid: string[], muridBaru: string): string[] {
  murid.push(muridBaru); // ngerusak array asli!
  return murid;
}

// ✅ BAIK — salinan baru
function tambahMuridImmutable(murid: string[], muridBaru: string): string[] {
  return [...murid, muridBaru]; // array asli aman
}

const kelas = ['Ahmad', 'Siti'];
const kelasBaru = tambahMuridImmutable(kelas, 'Budi');
console.log(kelas); // ['Ahmad', 'Siti'] — nggak berubah
```

**Pakai immutability kalau:** Data dipake bareng di banyak tempat (misal Redux state).

### Function Composition

> **Gabungin beberapa fungsi kecil jadi satu fungsi kompleks. Kayak pipa di pabrik — satu proses nyambung ke proses lain.**

```typescript
// Fungsi-fungsi kecil
const keRupiah = (harga: number): string => `Rp${harga.toLocaleString('id-ID')}`;
const pajak = (harga: number): number => harga * 1.11;
const ongkir = (harga: number): number => harga + 15000;

// Komposisi manual
function totalHarga(harga: number): string {
  return keRupiah(ongkir(pajak(harga)));
}

// Pakai compose helper
function compose<A, B, C>(f: (x: B) => C, g: (x: A) => B): (x: A) => C {
  return (x: A) => f(g(x));
}

const hitungTotal = compose(keRupiah, compose(ongkir, pajak));
console.log(hitungTotal(50000)); // Rp70.500
```

**Pakai composition kalau:** Ada rangkaian transformasi data yang berurutan.

---

## 3. Creational Patterns

Patterns yang ngurusin cara bikin objek. Biar pembuatan objek fleksibel dan nggak kaku.

### Singleton

> **Mastikan suatu class cuma punya satu instance aja sepanjang aplikasi.**

```typescript
class Config {
  private static instance: Config;
  public readonly apiUrl: string;

  private constructor() {
    this.apiUrl = 'https://api.example.com';
  }

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
}

// Dipake di mana aja — instance-nya sama
const config1 = Config.getInstance();
const config2 = Config.getInstance();
console.log(config1 === config2); // true — objek yang sama!
```

**Pakai Singleton kalau:** Butuh satu sumber truth global (config, koneksi database, logger).

---

### Factory

> **Sediakan cara bikin objek tanpa sebut class spesifiknya. Class yang beda-beda bisa muncul dari satu fungsi factory.**

```typescript
interface Kendaraan {
  jalan(): void;
}

class Mobil implements Kendaraan {
  jalan(): void {
    console.log('Mobil jalan dengan 4 roda.');
  }
}

class Motor implements Kendaraan {
  jalan(): void {
    console.log('Motor jalan dengan 2 roda.');
  }
}

// Factory function
function buatKendaraan(jenis: string): Kendaraan {
  if (jenis === 'mobil') return new Mobil();
  if (jenis === 'motor') return new Motor();
  throw new Error('Kendaraan nggak dikenal');
}

const kendaraan = buatKendaraan('mobil');
kendaraan.jalan(); // "Mobil jalan dengan 4 roda."
```

**Pakai Factory kalau:** Pembuatan objek rumit atau jenis objek bisa berubah runtime.

---

### Builder

> **Pisahin pembuatan objek kompleks jadi langkah-langkah kecil. Biar nggak bikin constructor raksasa.**

```typescript
class NasiGoreng {
  constructor(
    public readonly levelPedas: number,
    public readonly telur: boolean,
    public readonly seafood: boolean,
    public readonly extraKeju: boolean,
    public readonly kerupuk: boolean
  ) {}
}

class NasiGorengBuilder {
  private levelPedas = 0;
  private telur = false;
  private seafood = false;
  private extraKeju = false;
  private kerupuk = false;

  setPedas(level: number): this {
    this.levelPedas = level;
    return this;
  }

  tambahTelur(): this {
    this.telur = true;
    return this;
  }

  tambahSeafood(): this {
    this.seafood = true;
    return this;
  }

  tambahKeju(): this {
    this.extraKeju = true;
    return this;
  }

  pesan(): NasiGoreng {
    return new NasiGoreng(
      this.levelPedas,
      this.telur,
      this.seafood,
      this.extraKeju,
      this.kerupuk
    );
  }
}

// Pakenya — jelas dan terbaca
const nasiGoreng = new NasiGorengBuilder()
  .setPedas(5)
  .tambahTelur()
  .tambahSeafood()
  .pesan();
```

**Pakai Builder kalau:** Objek punya banyak parameter opsional atau konfigurasi bertahap.

---

## 4. Structural Patterns

Patterns yang ngatur hubungan antar class/objek biar strukturnya fleksibel.

### Adapter

> **Jembatin dua class yang interface-nya beda biar bisa kerja sama. Kayak adaptor colokan listrik.**

```typescript
// Sistem lama (API asli)
class SistemLama {
  kirimDataXML(xml: string): void {
    console.log(`Kirim XML: ${xml}`);
  }
}

// Interface modern yang kita mau pake
interface SistemBaru {
  kirimJSON(json: string): void;
}

// Adapter
class XMLtoJSONAdapter implements SistemBaru {
  constructor(private sistemLama: SistemLama) {}

  kirimJSON(json: string): void {
    // Ubah JSON ke XML (simulasi)
    const xml = `<data>${json}</data>`;
    this.sistemLama.kirimDataXML(xml);
  }
}

// Pake adapter
const sistemLama = new SistemLama();
const adapter = new XMLtoJSONAdapter(sistemLama);
adapter.kirimJSON('{"nama": "Budi"}');
```

**Pakai Adapter kalau:** Mau pake library lama/eksis yang nggak cocok interface-nya dengan code baru.

---

### Decorator

> **Nambahin perilaku ke objek secara dinamis tanpa ngubah class asli. Kayak topping es krim — es krimnya tetep, topping nambah.**

```typescript
// Interface dasar
interface Kopi {
  harga(): number;
  deskripsi(): string;
}

// Component konkret
class KopiHitam implements Kopi {
  harga(): number {
    return 15000;
  }
  deskripsi(): string {
    return 'Kopi hitam';
  }
}

// Decorator — bungkus objek asli, nambah fungsi
class SusuDecorator implements Kopi {
  constructor(private kopi: Kopi) {}

  harga(): number {
    return this.kopi.harga() + 5000;
  }
  deskripsi(): string {
    return this.kopi.deskripsi() + ', susu';
  }
}

class GulaDecorator implements Kopi {
  constructor(private kopi: Kopi) {}

  harga(): number {
    return this.kopi.harga() + 2000;
  }
  deskripsi(): string {
    return this.kopi.deskripsi() + ', gula aren';
  }
}

// Pake decorator
let kopi: Kopi = new KopiHitam();
kopi = new SusuDecorator(kopi);
kopi = new GulaDecorator(kopi);

console.log(`${kopi.deskripsi()} = Rp${kopi.harga()}`);
// "Kopi hitam, susu, gula aren = Rp22.000"
```

**Pakai Decorator kalau:** Ada kombinasi fitur yang banyak dan nggak mau bikin subclass segalanya.

---

### Facade

> **Sediain interface simpel buat sistem yang kompleks. Kayak remote TV — kamu nggak perlu ngerti cara kerja rangkaian listrik di dalem.**

```typescript
// Subsistem kompleks
class AC {
  nyalakan(): void {
    console.log('AC menyala');
  }
  setSuhu(suhu: number): void {
    console.log(`AC set suhu ${suhu}°C`);
  }
}

class Lampu {
  nyalakan(): void {
    console.log('Lampu menyala');
  }
  warna( warna: string): void {
    console.log(`Lampu warna ${ warna}`);
  }
}

class Musik {
  putarLagu(lagu: string): void {
    console.log(`Memutar: ${lagu}`);
  }
  setVolume(vol: number): void {
    console.log(`Volume ${vol}%`);
  }
}

// Facade — satu tombol buat semuanya
class SuasanaSantaiFacade {
  constructor(
    private ac: AC,
    private lampu: Lampu,
    private musik: Musik
  ) {}

  aktifkan(): void {
    this.ac.nyalakan();
    this.ac.setSuhu(24);
    this.lampu.nyalakan();
    this.lampu.warna('kuning');
    this.musik.putarLagu('Jazz instrumental');
    this.musik.setVolume(30);
    console.log('Mode santai aktif!');
  }
}

// Pakenya tinggal panggil satu method
const suasana = new SuasanaSantaiFacade(new AC(), new Lampu(), new Musik());
suasana.aktifkan();
```

**Pakai Facade kalau:** Mau sederhanain API yang rumit atau banyak class yang harus dipanggil berurutan.

---

## 5. Behavioral Patterns

Patterns yang ngatur komunikasi antar objek — gimana mereka saling ngirim pesan dan koordinasi.

### Observer

> **Satu objek (subject) ngasih tau banyak objek lain (observer) kalau ada perubahan. Kayak YouTube — subscribe ke channel, dapat notifikasi tiap upload.**

```typescript
// Subject — yang dipantau
class ChannelYouTube {
  private pelanggan: Pelanggan[] = [];

  subscribe(p: Pelanggan): void {
    this.pelanggan.push(p);
  }

  unsubscribe(p: Pelanggan): void {
    this.pelanggan = this.pelanggan.filter((pl) => pl !== p);
  }

  uploadVideo(judul: string): void {
    console.log(`📹 Upload: ${judul}`);
    this.pelanggan.forEach((p) => p.notifikasi(judul));
  }
}

// Observer — yang nunggu notif
class Pelanggan {
  constructor(private nama: string) {}

  notifikasi(judul: string): void {
    console.log(`🔔 ${this.nama} dapat notif: "${judul}" sudah diupload!`);
  }
}

// Demo
const channel = new ChannelYouTube();
const budi = new Pelanggan('Budi');
const siti = new Pelanggan('Siti');

channel.subscribe(budi);
channel.subscribe(siti);
channel.uploadVideo('Belajar TypeScript Dasar');
```

**Pakai Observer kalau:** Satu perubahan harus trigger banyak komponen tanpa mereka saling kenal (event system, UI updates, real-time data).

---

### Strategy

> **Definin grup algoritma yang bisa ditukar-tukar runtime. Keluarin logika yang berubah-ubah ke class strategy sendiri.**

```typescript
// Interface strategy
interface Pembayaran {
  bayar(jumlah: number): void;
}

// Strategy konkret
class BayarQRIS implements Pembayaran {
  bayar(jumlah: number): void {
    console.log(`QRIS: Rp${jumlah} — Scan barcode.`);
  }
}

class BayarKartuKredit implements Pembayaran {
  bayar(jumlah: number): void {
    console.log(`Kartu Kredit: Rp${jumlah} — Masukin PIN.`);
  }
}

class BayarCOD implements Pembayaran {
  bayar(jumlah: number): void {
    console.log(`COD: Rp${jumlah} — Bayar di tempat.`);
  }
}

// Context — pake strategy
class KeranjangBelanja {
  constructor(private strategy: Pembayaran) {}

  gantiStrategi(strategy: Pembayaran): void {
    this.strategy = strategy;
  }

  checkout(total: number): void {
    this.strategy.bayar(total);
  }
}

// User bisa gonta-ganti cara bayar
const keranjang = new KeranjangBelanja(new BayarQRIS());
keranjang.checkout(75000); // QRIS
keranjang.gantiStrategi(new BayarCOD());
keranjang.checkout(75000); // COD
```

**Pakai Strategy kalau:** Ada beberapa varian algoritma yang bisa dipilih user/code di runtime.

---

### Command

> **Bungkus request jadi objek. Biar request bisa diantre, di-undo, atau di-log. Kayak remote TV yang punya tombol — setiap tombol adalah command.**

```typescript
// Receiver — yang ngejalanin aksi beneran
class LampuRuang {
  nyala(): void {
    console.log('Lampu ruangan nyala.');
  }
  mati(): void {
    console.log('Lampu ruangan mati.');
  }
}

// Interface Command
interface Command {
  execute(): void;
  undo(): void;
}

// Concrete Command
class NyalakanLampuCommand implements Command {
  constructor(private lampu: LampuRuang) {}
  execute(): void {
    this.lampu.nyala();
  }
  undo(): void {
    this.lampu.mati();
  }
}

class MatikanLampuCommand implements Command {
  constructor(private lampu: LampuRuang) {}
  execute(): void {
    this.lampu.mati();
  }
  undo(): void {
    this.lampu.nyala();
  }
}

// Invoker — remote control
class RemoteControl {
  private history: Command[] = [];

  tekan(tombol: Command): void {
    tombol.execute();
    this.history.push(tombol);
  }

  undo(): void {
    const last = this.history.pop();
    last?.undo();
  }
}

// Demo
const lampu = new LampuRuang();
const remote = new RemoteControl();

remote.tekan(new NyalakanLampuCommand(lampu)); // Lampu nyala
remote.tekan(new MatikanLampuCommand(lampu));  // Lampu mati
remote.undo(); // Lampu nyala lagi (undo)
```

**Pakai Command kalau:** Butuh fitur undo/redo, antrian task, atau logging action.

---

## Ringkasan

| Pattern | Gampangnya | Kapan Pake |
|---------|------------|------------|
| **SRP** | Satu class satu tugas | Class mulai gede dan ngurus banyak hal |
| **OCP** | Tambah fitur tanpa edit code lama | Sering nambah varian/jenis baru |
| **LSP** | Anak class harus bisa gantiin parent | Ragu hubungan inheritance sehat |
| **ISP** | Interface jangan kegedean | Banyak method yang nggak dipake semua class |
| **DIP** | Bergantung ke abstraksi, bukan konkret | Kode terikat ke layanan eksternal |
| **Pure Function** | Input sama = output sama | Butuh fungsi stabil & mudah di-test |
| **Immutability** | Data jangan diubah, bikin baru | Data dipake bareng banyak komponen |
| **Composition** | Gabung fungsi kecil jadi besar | Ada pipeline transformasi data |
| **Singleton** | Cuma boleh satu instance | Koneksi DB / logger / config global |
| **Factory** | Bikin objek tanpa sebut class | Jenis objek ditentukan runtime |
| **Builder** | Bikin objek step-by-step | Constructor penuh parameter opsional |
| **Adapter** | Jembatin interface beda | Integrasi library lama dengan code baru |
| **Decorator** | Nambah fitur tanpa ubah class asli | Banyak kombinasi fitur yang bisa dipilih |
| **Facade** | Sederhanain sistem kompleks | API yang ribet, banyak class harus dipanggil |
| **Observer** | Satu ngasih tau banyak | Event system, notifikasi, real-time UI |
| **Strategy** | Tukar algoritma runtime | Banyak cara/cabang logika dalam satu proses |
| **Command** | Request jadi objek | Undo/redo, queue task, macro |

---

*Selamat belajar! Design patterns bukan buat dipake di semua tempat — pake kalau memang ada masalah yang cocok. Kode sederhana tanpa pattern > kode rumit pake pattern yang dipaksakan.*
