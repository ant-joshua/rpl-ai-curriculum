# 13 — Flutter Mobile: Dari Dart ke Play Store

> **Panduan Praktis untuk Siswa SMK RPL** | TypeScript → Dart | Target: Mobile Developer

---

## Kenapa Flutter?

Flutter adalah framework UI **open-source** dari Google buat bikin aplikasi mobile, web, dan desktop dari **satu codebase**. Bahasa yang dipake: **Dart**.

**Flutter paling besar di Indonesia** — buktinya:

- **Gojek, Tokopedia, BCA Mobile, Lapak Gaming, Ralali** pake Flutter.
- Lebih dari **40% developer mobile** Indonesia pake Flutter (Survey IDS 2024).
- **Startup dan agensi** di Indonesia dominan Flutter karena biaya lebih murah (satu tim, dua platform: Android + iOS).
- **Komunitas Flutter Indonesia** aktif banget — Telegram, Discord, meetup tiap bulan.

Kalau lo udah bisa JavaScript/TypeScript, lo udah bekal. Tinggal belajar **sintaks Dart** dan mental **widget tree**.

---

## Daftar Isi

1. [Dart Basics (variabel, function, class vs TS)](#1-dart-basics)
2. [Widget Tree — Stateless vs Stateful](#2-widget-tree)
3. [Navigasi & Routing](#3-navigasi--routing)
4. [State Management — setState ke Provider](#4-state-management)
5. [API Calls & JSON Parsing](#5-api-calls--json-parsing)
6. [Deploy ke Play Store](#6-deploy-ke-play-store)

---

## 1. Dart Basics

Dart mirip banget sama TypeScript. Ini tabel perbandingan biar cepet adaptasi:

| Konsep | TypeScript | Dart |
|--------|-----------|------|
| Deklarasi variabel | `let`, `const` | `var`, `final`, `const` |
| Tipe data | `string`, `number`, `boolean`, `any` | `String`, `int`, `double`, `bool`, `dynamic` |
| Null safety | `?` opsional (strict mode) | **Wajib** — `String?` = nullable, `String` = not null |
| Arrow function | `=>` | `=>` sama, `(int x) => x * 2` |
| Class | `class` + `constructor` | `class` + konstruktor `Class(this.prop)` |
| Async | `async/await` | `async/await` (sama) |
| Export/Import | `import`, `export` | `import`, `export` (mirip) |

### Variabel

```dart
// Deklarasi
var name = 'Budi';       // type inference → String
String nama = 'Sari';     // eksplisit
int umur = 17;
double suhu = 36.5;
bool aktif = true;

// Final = sekali assign (mirip const di JS)
final apiKey = 'rahasia';

// Const = compile-time constant
const pi = 3.14;

// Null safety — wajib paham!
String? alamat;   // null-able → bisa null
String kota = 'Jakarta'; // NOT null → error kalau diisi null
```

> **Catatan buat anak TS:** `null safety` di Dart itu **default**. `String` artinya `String & not null`. Kalau lo butuh null, lo harus tulis `String?`. Ini ngilangin `Cannot read property of undefined` — best practice dari awal.

### Fungsi

```dart
// Regular function
int tambah(int a, int b) {
  return a + b;
}

// Expression body (arrow) — kaya TS
int kali(int a, int b) => a * b;

// Named parameter (wajib kurung kurawal)
void sapa({required String nama, int? umur}) {
  print('Halo $nama');
  if (umur != null) print('Umur $umur');
}

// Panggil: sapa(nama: 'Budi', umur: 17)
```

### Class — Dart vs TypeScript

Dart class syntax lebih ringkas:

```dart
// Dart — constructor ringkas pake `this.`
class User {
  final String name;
  final int age;
  final String? email;

  // Constructor: langsung assign parameter ke property
  User({required this.name, required this.age, this.email});

  // Method
  void greet() => print('Halo, saya $name');
}

// Pake
final user = User(name: 'Budi', age: 17);
user.greet(); // Halo, saya Budi
```

```typescript
// TypeScript — harus explicit assignment
class User {
  readonly name: string;
  readonly age: number;
  email?: string;

  constructor(name: string, age: number, email?: string) {
    this.name = name;
    this.age = age;
    this.email = email;
  }
}
```

Dart constructor pake `this.name` langsung — lebih hemat kode.

---

## 2. Widget Tree

Di Flutter, **semua adalah Widget**. Layar, tombol, teks, padding, jarak — semuanya widget. Widget disusun **nested** jadi tree.

### StatelessWidget

Widget yang **tidak berubah** setelah di-render. Cocok buat tampilan statis.

```dart
import 'package:flutter/material.dart';

class ProfileCard extends StatelessWidget {
  final String name;
  final int age;

  const ProfileCard({super.key, required this.name, required this.age});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(name, style: const TextStyle(fontSize: 20)),
            Text('$age tahun'),
          ],
        ),
      ),
    );
  }
}
```

### StatefulWidget

Widget yang bisa berubah — misal tombol counter, input form, timer.

```dart
class CounterScreen extends StatefulWidget {
  const CounterScreen({super.key});

  @override
  State<CounterScreen> createState() => _CounterScreenState();
}

class _CounterScreenState extends State<CounterScreen> {
  int _count = 0; // state internal

  void _increment() {
    setState(() {
      _count++;
    }); // ← trigger build ulang
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Counter')),
      body: Center(child: Text('$_count', style: const TextStyle(fontSize: 48))),
      floatingActionButton: FloatingActionButton(
        onPressed: _increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

> **Pola penting:** `State` dipisah dari `Widget`. Widgetnya immutable, Statenya yang pegang data. `setState()` kasih tau Flutter "bangun ulang widget-ku".

---

## 3. Navigasi & Routing

Flutter pake sistem **routing**. Cara dasar pake `Navigator.push` dan `Navigator.pop`.

### Push & Pop

```dart
// Di screen A
ElevatedButton(
  onPressed: () {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => DetailScreen(id: '123')),
    );
  },
  child: const Text('Ke Detail'),
);

// Di screen B — balik
Navigator.pop(context); // balik ke A
```

### Named Routes (kayak React Router)

```dart
// Di main.dart
MaterialApp(
  initialRoute: '/',
  routes: {
    '/': (_) => const HomeScreen(),
    '/profile': (_) => const ProfileScreen(),
    '/settings': (_) => const SettingsScreen(),
  },
);

// Navigasi
Navigator.pushNamed(context, '/profile');

// Kirim data lewat arguments
Navigator.pushNamed(context, '/detail', arguments: user);
// Terima: ModalRoute.of(context)!.settings.arguments as User
```

### Generate Route — buat app gede

```dart
MaterialApp(
  onGenerateRoute: (settings) {
    if (settings.name == '/product') {
      final id = settings.arguments as String;
      return MaterialPageRoute(builder: (_) => ProductScreen(productId: id));
    }
    return MaterialPageRoute(builder: (_) => const NotFoundScreen());
  },
);
```

---

## 4. State Management

State management = cara handle data yang **dipakai banyak widget**.

### Level 1: setState (built-in)

Cocok buat state lokal — form input, toggle, counter. Udah liat contoh di atas.

**Masalah `setState`:** Kalau data dipake widget beda cabang, lo harus "angkat" state ke parent dan turunin lewat constructor — ribet. Makanya butuh Provider.

### Level 2: Provider (standar industri)

Provider cara state management paling populer di Flutter. **Pake `ChangeNotifier` + `Provider`**.

#### Step 1: Tambah dependensi

```yaml
# pubspec.yaml
dependencies:
  provider: ^6.0.0
```

#### Step 2: Buat model + ChangeNotifier

```dart
// models/cart.dart
class CartItem {
  final String name;
  final int quantity;
  CartItem({required this.name, required this.quantity});
}

class CartProvider extends ChangeNotifier {
  final List<CartItem> _items = [];
  List<CartItem> get items => _items;
  int get totalItems => _items.length;

  void addItem(String name) {
    _items.add(CartItem(name: name, quantity: 1));
    notifyListeners(); // ← kasih tau Provider ada perubahan
  }

  void removeItem(int index) {
    _items.removeAt(index);
    notifyListeners();
  }
}
```

#### Step 3: Bungkus app pake Provider

```dart
// main.dart
void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => CartProvider(),
      child: const MyApp(),
    ),
  );
}
```

#### Step 4: Pake di widget

```dart
// Di widget mana aja
final cart = context.watch<CartProvider>(); // listen perubahan
// atau
final cart = context.read<CartProvider>(); // panggil method, ga listen

// Contoh
Text('Total: ${cart.totalItems}');
cart.addItem('Nasi Goreng');
```

> **Urutan belajar state management:** `setState` → `Provider` → `Riverpod` / `Bloc` (level lanjutan). SMK cukup Provider dulu.

---

## 5. API Calls & JSON Parsing

Flutter pake package `http` buat call API. JSON di-parsing pake `dart:convert`.

### Step 1: Tambah http

```yaml
dependencies:
  http: ^1.0.0
```

### Step 2: Buat model dari JSON

```dart
// models/product.dart
class Product {
  final int id;
  final String name;
  final double price;

  Product({required this.id, required this.name, required this.price});

  // Factory constructor — parse JSON ke object
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as int,
      name: json['name'] as String,
      price: (json['price'] as num).toDouble(),
    );
  }

  // Convert object ke JSON (kalo perlu kirim data)
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'price': price,
  };
}
```

### Step 3: Service layer

```dart
// services/product_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product.dart';

class ProductService {
  final String baseUrl = 'https://api.example.com';

  Future<List<Product>> fetchProducts() async {
    final response = await http.get(Uri.parse('$baseUrl/products'));

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body) as List<dynamic>;
      return data.map((json) => Product.fromJson(json as Map<String, dynamic>)).toList();
    } else {
      throw Exception('Gagal load produk: ${response.statusCode}');
    }
  }
}
```

### Step 4: Pake di UI pake FutureBuilder

```dart
class ProductListScreen extends StatelessWidget {
  final ProductService service = ProductService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Produk')),
      body: FutureBuilder<List<Product>>(
        future: service.fetchProducts(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final products = snapshot.data!;
          return ListView.builder(
            itemCount: products.length,
            itemBuilder: (context, index) {
              final p = products[index];
              return ListTile(
                title: Text(p.name),
                trailing: Text('Rp${p.price.toStringAsFixed(0)}'),
              );
            },
          );
        },
      ),
    );
  }
}
```

> **Best practice buat app real:** Gabungin API call pake Provider + Service. Provider pegang state loading/error/data, Service urus HTTP.

---

## 6. Deploy ke Play Store

### Prasyarat

1. **Akun Developer Google Play** — bayar $25 sekali seumur hidup.
2. **Keystore** — file `.jks` buat sign APK.
3. **App sudah stabil** — udah di-test di device real.

### Step-by-step

#### 1. Setup Keystore

```bash
# Generate keystore (pake Java keytool)
keytool -genkey -v -keystore ~/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload
```

#### 2. Konfigurasi Gradle

Edit `android/key.properties`:

```properties
storePassword=passwordkamu
keyPassword=passwordkamu
keyAlias=upload
storeFile=/home/user/upload-keystore.jks
```

Edit `android/app/build.gradle` — tambah di `android { }`:

```groovy
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

#### 3. Build APK atau App Bundle

```bash
# Build Android App Bundle (.aab) — recommended buat Play Store
flutter build appbundle --release

# Hasil: build/app/outputs/bundle/release/app-release.aab

# Atau APK
flutter build apk --release
# Hasil: build/app/outputs/flutter-apk/app-release.apk
```

#### 4. Upload ke Play Console

1. Buka **[play.google.com/console](https://play.google.com/console)**
2. Buat app baru → kasih nama, deskripsi, screenshot, icon
3. Production → pilih **App Bundle (.aab)**
4. Isi form content rating, target audience, privacy policy
5. Review & publish

> **Tips buat SMK:**
> - Pake **internal testing** dulu biar ga langsung publik
> - Upload .aab ukuran lebih kecil, Google Play optimasiin per device
> - Pastiin `android/app/build.gradle` version code naikin tiap update
> - App pertama lo: siapin nama unik, cek dulu di Play Store apa udah ada yang pake

---

## Rangkuman

| Konsep | Poin Penting |
|--------|-------------|
| **Dart** | Sintaks mirip TS, null safety default, `final`/`const` |
| **Widget** | Stateless (statis) vs Stateful (dinamis), `setState()` trigger rebuild |
| **Navigasi** | `push`/`pop`, named routes, `onGenerateRoute` |
| **State Management** | `setState` buat lokal, **Provider** buat global |
| **API** | `http` package, `dart:convert`, `FutureBuilder` |
| **Deploy** | Keystore → key.properties → `flutter build appbundle` → Play Console |

**Flutter + Dart** = skill yang **paling dicari** pasar mobile Indonesia. Dari Tokopedia sampai startup Garasi, semuanya pake Flutter. Lo udah bekal TypeScript, tinggal transisi ke Dart — 80% udah familiar. Fokus aja bedain: widget tree, state management, dan null safety.

---

## Referensi

- [Flutter Documentation](https://docs.flutter.dev) — resmi dari Google
- [Dart Null Safety](https://dart.dev/null-safety) — wajib baca
- [Provider Package](https://pub.dev/packages/provider) — state management
- [Komunitas Flutter Indonesia](https://t.me/FlutterIndonesia) — tanya-tanya di Telegram
- [Google Play Console](https://play.google.com/console) — deploy app

---

> **SMK Bisa!** Dengan Flutter, lo bisa bikin app Android + iOS sendirian. Modal laptop, koneksi internet, dan konsisten ngoding tiap hari. Mulai dari widget sederhana, API call, sampe publish ke Play Store.
