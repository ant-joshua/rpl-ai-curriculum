# 1.1 Dart Syntax & Widget Dasar

## Variabel & Tipe Data

```dart
// Type inference
var nama = 'Budi';       // → String
var umur = 17;            // → int
var suhu = 36.5;          // → double
var aktif = true;         // → bool

// Eksplisit
String nama2 = 'Sari';
int umur2 = 17;
double suhu2 = 36.5;
bool aktif2 = true;

// Final = sekali assign (runtime constant)
final apiKey = 'rahasia123';
// apiKey = 'baru'; // ERROR!

// Const = compile-time constant
const pi = 3.14;
const kuadratPi = pi * pi;

// Null safety — WAJIB paham!
String? alamat;   // nullable → bisa null
String kota = 'Jakarta'; // non-null → error kalo diisi null
// kota = null; // COMPILE ERROR!
```

|> **Null safety:** Dart beda sama JS/TS. `String` artinya **never null**. Kalo lo butuh null, pake `String?`. Ini ngilangin null pointer error dari awal.

### Collections — List, Set, Map

```dart
// List — array berurutan
final listAngka = [1, 2, 3, 4, 5];
final listNama = <String>['Budi', 'Sari', 'Adi'];
print(listAngka[0]); // 1
print(listNama.length); // 3

// List methods
listNama.add('Rina'); // tambah
listNama.remove('Adi'); // hapus value
listNama.removeAt(0); // hapus index
listNama.contains('Budi'); // cek ada ga?

// Spread operator
final allNumbers = [...listAngka, 6, 7, 8];

// Collection for
final doubled = [for (var n in listAngka) n * 2];

// Set — unik, ga ada duplikasi
final uniqueNames = <String>{'Budi', 'Sari', 'Budi'};
print(uniqueNames); // {Budi, Sari} — duplikat otomatis ilang

// Map — key-value
final user = <String, dynamic>{
  'name': 'Budi',
  'age': 17,
  'kelas': 'XII RPL',
};
print(user['name']); // Budi
user['alamat'] = 'Jakarta'; // nambah key baru
```

### Generics — Type Safety

```dart
// Generic class — type ditentukan pas pake
class Box<T> {
  final T value;
  Box(this.value);
}

final intBox = Box<int>(42);
final stringBox = Box<String>('Halo');

// Generic function
T first<T>(List<T> list) => list[0];
print(first<int>([1, 2, 3])); // 1

// Type constraint
class Repository<T extends Model> {
  final List<T> _items = [];

  void save(T item) => _items.add(item);
  T findById(int id) => _items.firstWhere((i) => i.id == id);
}

abstract class Model {
  int get id;
}
```

### Records & Pattern Matching (Dart 3+)

```dart
// Record — multi-return value tanpa class
(String, int) getUserInfo() {
  return ('Budi', 17);
}

final (name, age) = getUserInfo();
print('$name berumur $age tahun');

// Named record
({String name, int age}) getUser() {
  return (name: 'Sari', age: 16);
}

final user2 = getUser();
print(user2.name);

// Switch expression
String getGrade(int score) => switch (score) {
  >= 90 => 'A',
  >= 75 => 'B',
  >= 60 => 'C',
  _ => 'D',
};

// Sealed class — exhaustive switch
sealed class ApiState {}
class Loading extends ApiState {}
class Success<T> extends ApiState { final T data; Success(this.data); }
class Error extends ApiState { final String message; Error(this.message); }

String handleState(ApiState state) => switch (state) {
  Loading() => 'Memuat...',
  Success(data: var d) => 'Data: $d',
  Error(message: var m) => 'Error: $m',
};
```

### Mixin — Reusable Behavior

```dart
// Mixin = kumpulan method yang bisa dipake banyak class
mixin Loggable {
  void log(String message) {
    print('[LOG]: $message');
  }
}

mixin Timestampable {
  final DateTime createdAt = DateTime.now();
}

// Pake with keyword
class User with Loggable, Timestampable {
  final String name;
  User(this.name);

  void save() {
    log('Menyimpan user $name');
    // log() dari mixin Loggable
  }
}

final user3 = User('Budi');
user3.save();
print(user3.createdAt); // dari Timestampable
```

## Function

```dart
// Regular function
int tambah(int a, int b) {
  return a + b;
}

// Expression body (arrow) — kaya JS arrow function
int kali(int a, int b) => a * b;

// Named parameter (wajib {})
void sapa({required String nama, int? umur}) {
  print('Halo $nama');
  if (umur != null) print('Umur $umur');
}

// Panggil: sapa(nama: 'Budi', umur: 17)

// Optional positional parameter
void greet(String nama, [String? gelar]) {
  if (gelar != null) {
    print('Halo $gelar $nama');
  } else {
    print('Halo $nama');
  }
}

// Higher-order function (callback)
void prosesList(List<int> angka, Function(int) callback) {
  for (var a in angka) {
    callback(a);
  }
}
```

## Class

```dart
// Constructor ringkas pake this.
class User {
  final String name;
  final int age;
  final String? email;

  // Constructor: langsung assign
  User({required this.name, required this.age, this.email});

  // Method
  void greet() => print('Halo, saya $name');

  // Named constructor
  User.admin(String name, {this.email})
      : name = name,
        age = 18;

  // Factory constructor
  factory User.fromMap(Map<String, dynamic> map) {
    return User(
      name: map['name'] as String,
      age: map['age'] as int,
      email: map['email'] as String?,
    );
  }
}

// Pake
void main() {
  final user = User(name: 'Budi', age: 17);
  user.greet(); // Halo, saya Budi

  final admin = User.admin('Admin', email: 'admin@test.com');
  print(admin.age); // 18
}
```

## Async / Await

```dart
// Future = Promise di JS
Future<String> fetchData() async {
  await Future.delayed(Duration(seconds: 2)); // simulasi delay
  return 'Data dari server';
}

// Async function return Future
Future<void> main() async {
  print('Mulai loading...');
  final data = await fetchData();
  print(data); // Data dari server
  print('Selesai');
}

// Error handling
Future<void> getData() async {
  try {
    final data = await fetchData();
    print(data);
  } catch (e) {
    print('Error: $e');
  } finally {
    print('Selesai');
  }
}
```

## Widget Tree

Di Flutter, **semua adalah Widget**. Layar, tombol, teks, padding — semuanya widget. Widget disusun **nested** jadi tree.

```
MaterialApp
 └── Scaffold
      ├── AppBar
      │    └── Text (judul)
      └── Body
           └── Center
                └── Column
                     ├── Text
                     ├── SizedBox (jarak)
                     └── ElevatedButton
```

## StatelessWidget

Widget yang **tidak berubah** setelah di-render.

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
            const SizedBox(height: 8),
            Text('$age tahun'),
          ],
        ),
      ),
    );
  }
}
```

## StatefulWidget

Widget yang **bisa berubah** — tombol counter, input form, timer.

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

  void _reset() {
    setState(() => _count = 0);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Counter')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Kamu tekan tombol:'),
            Text('$_count',
                style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _reset,
              child: const Text('Reset'),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

> **Pola penting:** `State` dipisah dari `Widget`. Widgetnya immutable, Statenya yang pegang data. `setState()` kasih tau Flutter "bangun ulang widget-ku".

## MaterialApp & Scaffold

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aplikasi Pertama',
      theme: ThemeData(
        colorSchemeSeed: Colors.blue,
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        centerTitle: true,
      ),
      body: const Center(
        child: Text('Hello Flutter!', style: TextStyle(fontSize: 24)),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          print('Tombol ditekan!');
        },
        child: const Icon(Icons.star),
      ),
    );
  }
}
```

## Widget Dasar Lainnya

```dart
// Text — teks dengan style
Text('Halo Dunia',
    style: TextStyle(fontSize: 18, color: Colors.blue, fontWeight: FontWeight.bold));

// Container — box dengan padding, margin, decoration
Container(
  padding: EdgeInsets.all(16),
  margin: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    boxShadow: [
      BoxShadow(color: Colors.black26, blurRadius: 4),
    ],
  ),
  child: Text('Ini container'),
);

// SizedBox — spacer
SizedBox(width: 16, height: 16); // kotak transparan
SizedBox(height: 20); // vertical spacer

// Row & Column — sudah di sesi 2
```

---

## Latihan

1. **Buat ProfileCard Widget** — Widget StatelessWidget yang nerima `name`, `nim`, `kelas`. Tampilin pake Card + ListTile.

2. **Buat Counter App** — Di atas ada CounterScreen. Tambahin tombol Decrement (-) dan tombol reset. Bonus: jangan biarin counter minus (min 0).

3. **Buat App Sederhana** — `MaterialApp` + `Scaffold` + `AppBar` + body `Center` + `Column`. Isinya: Text nama lo, SizedBox, Text kelas lo, SizedBox, ElevatedButton yang print "Halo!" ke console.

4. **Bongkar Null Safety** — Bikin class `Product` dengan field `name` (String non-null), `price` (double non-null), `description` (String? nullable). Bikin constructor + method `printInfo()` yang nge-print "Produk: [name] — Rp[price]" dan kalo description ada, print juga description.

5. **Generic Repository** — Bikin generic class `Repository<T>` dengan method `save(T item)`, `findAll() -> List<T>`, `delete(int index)`. Implementasiin `UserRepository extends Repository<User>`. User punya field: id, name, email.

6. **Record + Switch Expression** — Bikin function yang nerima `(String name, String role)` record. Pake switch expression buat nentuin akses: 'admin' -> 'Full Akses', 'editor' -> 'Edit Konten', 'viewer' -> 'Liat Doang'. Gunakan sealed class `UserRole`.

7. **Mixin Logging** — Bikin mixin `Logger` dengan method `info(String)` dan `error(String)`. Mixin `DatabaseMixin` dengan method `connect()` dan `disconnect()`. Class `UserService` pake kedua mixin. Simulasiin save user dengan logging.
