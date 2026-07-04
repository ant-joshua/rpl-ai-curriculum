# 🧠 Cheatsheet: Flutter Mobile

> Referensi cepet — 1 halaman.

## Topik Utama
- **Dart**: sintaks mirip TS, null safety default, `final`/`const`
- **Widget Tree**: StatelessWidget (statis) vs StatefulWidget (dinamis), `setState()` trigger rebuild
- **Layout**: Row, Column, Expanded, ListView, GridView, EdgeInsets, Padding
- **Navigasi**: `Navigator.push()` / `pop()`, named routes, `onGenerateRoute`
- **State Management**: `setState` lokal, **Provider** global
- **API**: `http` package, `dart:convert`, `FutureBuilder`
- **Firebase**: Firestore CRUD, Auth login/register, security rules
- **Deploy**: Keystore → key.properties → `flutter build appbundle` → Play Console

## Command / Sintaks Penting

```bash
flutter create my_app
flutter run
flutter build appbundle     # Android release
flutter build ios            # iOS release
flutter pub add <package>    # Tambah dependency
```

```dart
// StatefulWidget
class CounterWidget extends StatefulWidget { ... }

class _CounterWidgetState extends State<CounterWidget> {
  int count = 0;
  void _increment() => setState(() => count++);
  // ...
}

// Provider
ChangeNotifierProvider(create: (_) => CounterProvider())
context.watch<CounterProvider>()   // baca
context.read<CounterProvider>()    // panggil method
```

## Tips & Trik
- **Hot Reload** — simpan file, UI update instan (jaga state). Hot Restart kalo state perlu reset.
- **const constructor**: optimize widget tree — pake `const Text(...)` kalo statis.
- **Avoid rebuild besar**: bikin widget kecil-kecil, jangan 1 screen 1 widget raksasa.
- **API call pake FutureBuilder** — handle loading/error/data dalam 1 widget.
- **Provider over setState** untuk data yang dipake banyak screen.

## Common Mistakes
❌ Panggil `setState()` di dalam callback async tanpa cek `mounted` — crash.
❌ Taruh semua logic di widget — pisah ke service/controller.
❌ Lupa null safety — Dart null safety WAJIB, handle null pake `?` / `late`.
❌ Firebase rules open — atur security rules Firestore, jangan `allow read, write: if true;`.

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
- [Flutter Docs](https://docs.flutter.dev)
- [Dart Null Safety](https://dart.dev/null-safety)
- [Provider Package](https://pub.dev/packages/provider)
