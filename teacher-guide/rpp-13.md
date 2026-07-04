# RPP Modul 13: Flutter Mobile

**Durasi:** 3 sesi × 90 menit = 270 menit

## Tujuan Pembelajaran

Setelah modul ini, siswa mampu:
- Membuat aplikasi Flutter dengan widget tree
- Mengelola state lokal dengan setState dan global dengan Provider
- Integrasi API dan Firebase
- Build & deploy APK ke Play Store

## Tools & Bahan

- Flutter SDK, Dart, VS Code
- Android Emulator / physical device
- Firebase project
- http, provider packages

---

## Sesi 1: Dart + Widget Fundamentals (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Dart Basics** | Sintaks Dart: null safety, `final`/`const`, arrow function, class, async. Perbedaan dengan TS. |
| 45 menit | **Coding: Widget Tree + Layout** | Live coding: `flutter create`. Bikin Row/Column/Expanded. `StatelessWidget` vs `StatefulWidget`, `setState()` trigger rebuild. |
| 20 menit | **Latihan: Counter App + Layout** | Siswa bikin counter app + halaman profil (avatar, nama, bio) pake ListView. |
| 10 menit | **Review** | Tanya jawab: kapan pakai Stateless vs Stateful? Hot reload vs hot restart? |

**Code demo:**

```dart
class Counter extends StatefulWidget {
  @override
  _CounterState createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int count = 0;
  void _increment() => setState(() => count++);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('$count'),
        ElevatedButton(onPressed: _increment, child: Text('+1')),
      ],
    );
  }
}
```

**Checklist siswa:**
- [ ] `flutter create` berhasil
- [ ] StatelessWidget dan StatefulWidget
- [ ] Layout Row/Column/Expanded
- [ ] ListView untuk profil

---

## Sesi 2: Navigasi + State Management + API (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Navigator + Provider** | `Navigator.push`/`pop`. Named routes. Provider: `ChangeNotifierProvider`, `context.watch`, `context.read`. |
| 45 menit | **Coding: Multi-Halaman + API** | Bikin 2 halaman: Home → Detail. Pake Provider buat share state. Fetch API pake `http` + `FutureBuilder`. |
| 20 menit | **Latihan: Contact Book** | Siswa bikin contact book: list contact → detail. Data dari API dummy. Loading/error state pakai FutureBuilder. |
| 10 menit | **Review** | Debug: error koneksi API. Kapan Provider lebih baik dari setState? |

**Code demo:**

```dart
// Provider
ChangeNotifierProvider(
  create: (_) => ContactProvider(),
  child: MaterialApp(home: HomePage()),
)

// Fetch API
FutureBuilder(
  future: fetchContacts(),
  builder: (ctx, snap) {
    if (snap.hasError) return Text('Error: ${snap.error}');
    if (!snap.hasData) return CircularProgressIndicator();
    return ListView.builder(/* ... */);
  },
)
```

**Checklist siswa:**
- [ ] Navigator.push/pop ke halaman detail
- [ ] Provider untuk state
- [ ] FutureBuilder handle loading/error/data
- [ ] http package fetch API

---

## Sesi 3: Firebase + Deploy (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Firebase + Deployment** | Firestore CRUD, Auth login/register, security rules. Build APK: keystore → key.properties → `flutter build appbundle`. |
| 45 menit | **Coding: Firebase CRUD + Auth** | Integrasi Firebase. Bikin form login, simpan data ke Firestore. Build APK release. |
| 20 menit | **Latihan: Todo App Firebase** | Siswa bikin todo app: login → CRUD todo → realtime sync. |
| 10 menit | **Review** | Security rules: jangan `allow read, write: if true;`. Null safety wajib. |

**Code demo:**

```dart
// Firestore add
await FirebaseFirestore.instance.collection('todos').add({
  'title': title,
  'done': false,
  'userId': user.uid,
});

// Auth
await FirebaseAuth.instance.signInWithEmailAndPassword(
  email: email, password: password,
);
```

**Checklist siswa:**
- [ ] Firebase project terhubung
- [ ] Firestore CRUD berfungsi
- [ ] Auth login/register
- [ ] `flutter build appbundle` sukses

## Assessment

| Kriteria | Bobot |
|----------|-------|
| Widget Tree & Layout | 25% |
| State Management + API | 30% |
| Firebase + Deploy | 30% |
| Partisipasi | 15% |
