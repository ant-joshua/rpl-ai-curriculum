# Flutter Mobile — Latihan

## Level 1: Dasar

### Soal 1 — Widget Tree
Tulis kode Flutter untuk menampilkan halaman profil sederhana:

```
AppBar: "Profil Saya"
Body:
  - CircleAvatar (gambar placeholder)
  - Text: nama user
  - Text: email user
  - Row: [Icon(location), Text: kota]
  - ElevatedButton: "Edit Profil"
```

Gunakan hanya widget dasar (`Scaffold`, `AppBar`, `Column`, `Row`, `CircleAvatar`, `Text`, `Icon`, `ElevatedButton`). Tulis dalam satu file `profile_page.dart`.

### Soal 2 — Navigation & Routing
Buat dua halaman:

1. **HomePage** — daftar item (ListView dari 10 item). Tiap item menampilkan judul.
2. **DetailPage** — menampilkan judul dan deskripsi item yang diklik.

Gunakan `Navigator.pushNamed` dengan named routes. Kirim data dari Home ke Detail via constructor argument.

### Soal 3 — StatefulWidget & Form
Buat halaman **form registrasi** dengan field:

- Nama (TextFormField, validasi: min 3 karakter)
- Email (TextFormField, validasi: format email)
- Password (TextFormField, obscure, validasi: min 8 karakter, ada huruf besar)
- Tanggal Lahir (pakai DatePicker)

Tampilkan error di bawah masing-masing field. Jika validasi lolos, tampilkan **SnackBar** "Registrasi berhasil".

## Level 2: Intermediate

### Soal 4 — State Management dengan Riverpod
Refactor kode counter berikut menggunakan **Riverpod** (bukan setState):

```dart
class CounterPage extends StatefulWidget {
  @override
  _CounterPageState createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _counter = 0;

  void _increment() => setState(() => _counter++);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Counter')),
      body: Center(child: Text('$_counter', style: TextStyle(fontSize: 48))),
      floatingActionButton: FloatingActionButton(
        onPressed: _increment,
        child: Icon(Icons.add),
      ),
    );
  }
}
```

Buat:
- File `providers/counter_provider.dart` — StateProvider
- File `pages/counter_page.dart` — ConsumerWidget
- File `main.dart` — ProviderScope

### Soal 5 — API Integration & JSON Parsing
Buat service yang mengambil data dari REST API publik: `https://jsonplaceholder.typicode.com/posts`.

1. Definisikan model `Post` dengan field: `userId`, `id`, `title`, `body`
2. Buat `PostService` dengan method `Future<List<Post>> fetchPosts()`
3. Buat halaman yang menampilkan daftar post dalam `ListView`
4. Tambahkan loading indicator dan error handling
5. Gunakan `http` package dan `json_serializable` atau manual `fromJson`/`toJson`

### Soal 6 — Firebase Integration
Integrasikan Firebase Authentication + Firestore ke aplikasi **notes app**:

Fitur:
- Login dengan email/password (Firebase Auth)
- CRUD notes (Firestore)
- Setiap user hanya melihat notes miliknya sendiri
- Real-time sync menggunakan `StreamBuilder` / Firestore stream

Buat struktur Firestore:
```
users/{userId}/notes/{noteId}
    - title: string
    - content: string
    - createdAt: timestamp
    - updatedAt: timestamp
```

Tulis minimal: `auth_service.dart`, `notes_service.dart`, `login_page.dart`, `notes_list_page.dart`.

## Level 3: Challenge

### Soal 7 — Offline-First Todo App
Buat aplikasi todo **offline-first** dengan:

- **Local DB**: SQLite via `sqflite` atau `drift`
- **Remote**: Firebase Firestore
- **Sync strategy**: 
  - Saat online → auto-sync ke server
  - Saat offline → simpan lokal, queue perubahan
  - Saat koneksi kembali → replay queue
- **Conflict resolution**: last-write-wins dengan timestamp
- **UI indication**: tampilkan ikon sync status per item (synced/pending/error)

Gunakan `connectivity_plus` untuk deteksi jaringan. Tulis arsitektur lengkap dengan repository pattern.

### Soal 8 — Custom Paint & Animasi
Buat widget **custom circular progress indicator** menggunakan `CustomPainter`:

- Lingkaran progress dengan gradient warna
- Animasi fill dari 0% ke target value (gunakan `AnimationController`)
- Ada label persentase di tengah lingkaran
- Bisa di-reset dengan tombol

Tambahkan halaman demo yang menampilkan 3 indikator dengan target berbeda (30%, 65%, 100%) dalam grid.
