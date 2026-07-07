---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/7325498/pexels-ph"
footer: "Sesi 04: Firebase Deploy"
---

<!-- _class: title -->
# 1.4 Firebase & Deploy ke Play Store

## Firebase Setup

### 1. Buat Project Firebase

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Klik **Add project** → kasih nama → create
3. Non-aktifin Google Analytics (kecuali butuh)
4. Tunggu provisioning

### 2. Register App Android

1. Di Firebase Console → project → **Android icon** (+)
2. Isi **Android package name** — cocokin sama `android/app/build.gradle` → `applicationId`
   ```groovy
   defaultConfig {
       applicationId "com.example.myapp" // ini yang lo isi
       minSdkVersion 21
       targetSdkVersion 34
   }
   ```
3. Isi **App nickname** (opsional)
4. Debug signing certificate — skip dulu
5. Download `google-services.json`
6. Letakin di: `android/app/google-services.json`

### 3. Update android/build.gradle

```groovy
// android/build.gradle — level project
buildscript {
    dependencies {
        // ... classpath existing
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### 4. Update android/app/build.gradle

```groovy
// android/app/build.gradle — level app
apply plugin: 'com.google.gms.google-services' // paling bawah

android {
    defaultConfig {
        minSdkVersion 21 // minimal 21 buat Firebase
    }
}
```

### 5. Install FlutterFire CLI

```bash

---

# Install CLI
dart pub global activate flutterfire_cli


---

# Configure Flutter project
flutterfire configure


---

# Ini generate:

---

# - lib/firebase_options.dart

---

# - Update google-services.json (kalo perlu)
```

### 6. Init Firebase di main.dart

```dart
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}
```

### Tambah dependensi di pubspec.yaml

```yaml
dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^2.24.0
  cloud_firestore: ^4.15.0
  firebase_auth: ^4.16.0
```

---

## Firestore CRUD

### Setup Firestore Database

1. Firebase Console → **Firestore Database** → Create database
2. Pilih **Start in test mode** (development)
3. Pilih region (pilih `asia-southeast2` — Jakarta)

### Model + Service

```dart
// models/note.dart
class Note {
  final String id;
  final String title;
  final String content;
  final DateTime createdAt;

  Note({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
  });

  // Firestore document → Note
  factory Note.fromFirestore(Map<String, dynamic> data, String docId) {
    return Note(
      id: docId,
      title: data['title'] as String? ?? '',
      content: data['content'] as String? ?? '',
      createdAt: (data['created_at'] as dynamic)?.toDate() ?? DateTime.now(),
    );
  }

  // Note → Map buat Firestore
  Map<String, dynamic> toFirestore() => {
    'title': title,
    'content': content,
    'created_at': Timestamp.fromDate(createdAt),
  };
}
```

```dart
// services/note_service.dart
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/note.dart';

class NoteService {
  final CollectionReference _notes =
      FirebaseFirestore.instance.collection('notes');

  Stream<List<Note>> getNotes() {
    return _notes.orderBy('created_at', descending: true).snapshots().map(
          (snapshot) => snapshot.docs
              .map((doc) => Note.fromFirestore(
                    doc.data() as Map<String, dynamic>,
                    doc.id,
                  ))
              .toList(),
        );
  }

  Future<void> addNote(String title, String content) {
    return _notes.add({
      'title': title,
      'content': content,
      'created_at': Timestamp.now(),
    });
  }

  Future<void> updateNote(String id, String title, String content) {
    return _notes.doc(id).update({
      'title': title,
      'content': content,
    });
  }

  Future<void> deleteNote(String id) {
    return _notes.doc(id).delete();
  }
}
```

### UI dengan StreamBuilder

```dart
class NotesScreen extends StatelessWidget {
  final NoteService _noteService = NoteService();

  NotesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Catatan')),
      body: StreamBuilder<List<Note>>(
        stream: _noteService.getNotes(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final notes = snapshot.data!;
          if (notes.isEmpty) {
            return const Center(
              child: Text('Belum ada catatan. Tambah sekarang!'),
            );
          }

          return ListView.builder(
            itemCount: notes.length,
            itemBuilder: (context, index) {
              final note = notes[index];
              return Dismissible(
                key: Key(note.id),
                onDismissed: (_) => _noteService.deleteNote(note.id),
                background: Container(color: Colors.red),
                child: ListTile(
                  title: Text(note.title),
                  subtitle: Text(note.content),
                  trailing: Text(
                    '${note.createdAt.day}/${note.createdAt.month}',
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddDialog(BuildContext context) {
    // ... dialog title + content → _noteService.addNote()
  }
}
```

> **Stream vs Future:** Firestore pake `Stream` (real-time). Bedanya ama `Future`: Stream terus-terusan ngirim data baru. UI auto update tiap ada perubahan di Firestore. Future cuma sekali.

---

## Firebase Auth

### Auth Service

```dart
// services/auth_service.dart
import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Stream auth state — auto detect login/logout
  Stream<User?> get user => _auth.authStateChanges();

  // Register
  Future<UserCredential> register(String email, String password) async {
    return await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
  }

  // Login
  Future<UserCredential> login(String email, String password) async {
    return await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
  }

  // Logout
  Future<void> logout() async {
    await _auth.signOut();
  }

  // Get current user
  User? get currentUser => _auth.currentUser;
}
```

### Login Screen

```dart
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;

  Future<void> _login() async {
    setState(() => _isLoading = true);
    try {
      await _authService.login(
        _emailController.text.trim(),
        _passwordController.text,
      );
      // Success → Navigator bakal otomatis pindah
      // karena auth state listener di main
    } on FirebaseAuthException catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_getErrorMessage(e.code))),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  String _getErrorMessage(String code) {
    switch (code) {
      case 'user-not-found':
        return 'Email tidak terdaftar';
      case 'wrong-password':
        return 'Password salah';
      case 'invalid-credential':
        return 'Email atau password salah';
      case 'too-many-requests':
        return 'Terlalu banyak percobaan. Coba lagi nanti';
      default:
        return 'Login gagal: $code';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email',
                prefixIcon: Icon(Icons.email),
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(
                labelText: 'Password',
                prefixIcon: Icon(Icons.lock),
                border: OutlineInputBorder(),
              ),
              obscureText: true,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _login,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Login'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
```

### Auth State Listener — Redirect Otomatis

```dart
// main.dart
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: StreamBuilder<User?>(
        stream: FirebaseAuth.instance.authStateChanges(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }

          // Kalo login → NotesScreen, kalo enggak → LoginScreen
          if (snapshot.hasData) {
            return const NotesScreen();
          } else {
            return const LoginScreen();
          }
        },
      ),
    );
  }
}
```

### Firestore Security Rules

```text
// Firebase Console → Firestore → Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Cuma user login yang bisa akses
    match /notes/{noteId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.user_id;

      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.user_id;
    }
  }
}
```

---

## Deploy ke Play Store

### Prasyarat

1. **Akun Developer Google Play** — bayar $25 sekali
2. **Keystore** — file `.jks` buat sign APK
3. **App sudah stabil** — di-test di device real

### 1. Generate Keystore

```bash

---

# Generate keystore
keytool -genkey -v -keystore ~/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload
```

Simpan password! Lo butuh ini.

### 2. Konfigurasi Signing

Buat `android/key.properties`:

```properties
storePassword=passwordkamu
keyPassword=passwordkamu
keyAlias=upload
storeFile=/home/user/upload-keystore.jks
```

Edit `android/app/build.gradle`:

```groovy
// Di dalam android { ... }
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... defaultConfig, dll

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

### 3. Build APK / App Bundle

```bash

---

# Clean dulu
flutter clean
flutter pub get


---

# Build Android App Bundle (.aab) — recommended buat Play Store
flutter build appbundle --release

---

# Hasil: build/app/outputs/bundle/release/app-release.aab


---

# Atau APK (buat test internal)
flutter build apk --release

---

# Hasil: build/app/outputs/flutter-apk/app-release.apk
```

### 4. Versioning

```groovy
// android/app/build.gradle
android {
    defaultConfig {
        applicationId "com.example.myapp"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 2  // naikin tiap update
        versionName "1.0.1" // semantic version
    }
}
```

### 5. Upload ke Play Console

1. Buka [play.google.com/console](https://play.google.com/console)
2. **Buat app** → kasih nama, pilih app/game, pilih free/paid
3. Isi **Store listing**:
   - Deskripsi pendek & panjang
   - Screenshot (min 2, rekomendasi 8)
   - Icon 512×512px
   - Feature graphic 1024×500px
   - Kategori & tags
4. **Production** → **Create new release**
   - Upload `.aab`
   - Isi release notes (what's new)
5. **Content rating** → isi kuesioner
6. **Target audience & privacy policy**
7. **Pricing & distribution** → pilih negara

> **Tips:**
> - Pake **internal testing** dulu — ga langsung publik
> - App pertama: cek dulu nama unik di Play Store
> - Siapin privacy policy — bisa pake generator online

---

## Build Flavors (Dev vs Production)

```groovy
// android/app/build.gradle
android {
    flavorDimensions "environment"
    productFlavors {
        dev {
            dimension "environment"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
        }
        prod {
            dimension "environment"
        }
    }
}
```

```dart
// lib/config.dart
class AppConfig {
  static String get apiBaseUrl {
    // Detect flavor dari string constant
    const isDev = String.fromEnvironment('FLUTTER_APP_FLAVOR') == 'dev';
    return isDev ? 'https://dev.api.com' : 'https://api.com';
  }

  static String get projectName {
    const isDev = String.fromEnvironment('FLUTTER_APP_FLAVOR') == 'dev';
    return isDev ? 'MyApp (Dev)' : 'MyApp';
  }
}
```

```bash

---

# Build dengan flavor
flutter build appbundle --flavor dev --release
flutter build appbundle --flavor prod --release


---

# Run dengan flavor
flutter run --flavor dev
```

---

## Play Store Checklist

| Item | Status |
|------|--------|
| App icon 512×512px | ☐ |
| Feature graphic 1024×500px | ☐ |
| Screenshot minimal 2 (rekomendasi 8) | ☐ |
| Deskripsi pendek max 80 karakter | ☐ |
| Deskripsi panjang max 4000 karakter | ☐ |
| Privacy policy URL | ☐ |
| Content rating selesai | ☐ |
| APK/.aab sudah di-sign release | ☐ |
| Version code & name di-increment | ☐ |
| Test di device real | ☐ |

---

## Latihan

1. **Buat Notes App** — Firebase Firestore CRUD. StreamBuilder + ListView. Tambah note via dialog. Swipe-to-delete pake Dismissible. Pull-to-refresh.

2. **Buat Auth Flow** — Login + Register screen pake Firebase Auth. Kalo user login → HomeScreen. Kalo logout → LoginScreen. Pake `authStateChanges()` stream. Kasih error handling buat: wrong-password, user-not-found, email-already-in-use, weak-password.

3. **Buat Protected Notes** — Notes cuma bisa dibaca/ditulis sama user yang bikin. Tambah field `user_id` di setiap dokumen. Set Firestore security rules: `request.auth.uid == resource.data.user_id`.

4. **Build APK & Simulasikan Deploy** — Generate keystore, setup signing config, build appbundle release. Print daftar file hasil build. Bikin dummy Google Play Store listing (nama app, deskripsi, screenshot list).
