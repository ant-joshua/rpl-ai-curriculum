# 1.3 Navigation & API Integration

## Navigator — Push & Pop

```dart
import 'package:flutter/material.dart';

// Screen A → Screen B
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const DetailScreen(itemId: '123'),
              ),
            );
          },
          child: const Text('Ke Detail'),
        ),
      ),
    );
  }
}

class DetailScreen extends StatelessWidget {
  final String itemId;
  const DetailScreen({super.key, required this.itemId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Detail $itemId')),
      body: Center(
        child: ElevatedButton(
          onPressed: () => Navigator.pop(context), // balik
          child: const Text('Kembali'),
        ),
      ),
    );
  }
}
```

### Passing Data Antar Screen

```dart
// Kirim data
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (_) => ProductDetail(product: selectedProduct),
  ),
);

// Terima data balik (result)
final result = await Navigator.push<bool>(
  context,
  MaterialPageRoute(
    builder: (_) => const ConfirmScreen(message: 'Yakin hapus?'),
  ),
);
if (result == true) {
  print('User konfirmasi');
}
```

## Named Routes

```dart
// main.dart
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
Navigator.pushNamed(context, '/detail', arguments: userData);

// Terima arguments
// Di DetailScreen:
final userData = ModalRoute.of(context)!.settings.arguments as User;
```

### Named Route dengan Parameter Dinamis

```dart
// Route definition
MaterialApp(
  initialRoute: '/',
  onGenerateRoute: (settings) {
    // /product/42
    final uri = Uri.parse(settings.name!);
    final segments = uri.pathSegments;

    if (segments.length == 2 && segments[0] == 'product') {
      final id = segments[1];
      return MaterialPageRoute(
        builder: (_) => ProductScreen(productId: id),
      );
    }

    // Arguments-based
    if (settings.name == '/checkout') {
      final cart = settings.arguments as CartProvider;
      return MaterialPageRoute(
        builder: (_) => CheckoutScreen(cart: cart),
      );
    }

    // Fallback — 404
    return MaterialPageRoute(
      builder: (_) => const NotFoundScreen(),
    );
  },
);

// Navigasi
Navigator.pushNamed(context, '/product/42');
Navigator.pushNamed(context, '/checkout', arguments: cartProvider);
```

### Bottom Navigation

```dart
class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    HomeTab(),
    SearchTab(),
    ProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.search), label: 'Cari'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }
}
```

### Drawer Navigation

```dart
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Aplikasi Saya')),
      drawer: Drawer(
        child: ListView(
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: Colors.blue),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(radius: 30, child: Icon(Icons.person, size: 40)),
                  SizedBox(height: 8),
                  Text('Budi Santoso', style: TextStyle(color: Colors.white, fontSize: 18)),
                  Text('budi@email.com', style: TextStyle(color: Colors.white70)),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.home),
              title: const Text('Beranda'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.settings),
              title: const Text('Pengaturan'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/settings');
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text('Keluar', style: TextStyle(color: Colors.red)),
              onTap: () {
                // Logout logic
              },
            ),
          ],
        ),
      ),
      body: const Center(child: Text('Home Content')),
    );
  }
}
```

### TabBar — Tab Navigation

```dart
class TabScreen extends StatelessWidget {
  const TabScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Kategori'),
          bottom: const TabBar(
            tabs: [
              Tab(icon: Icon(Icons.phone), text: 'Elektronik'),
              Tab(icon: Icon(Icons.checkroom), text: 'Fashion'),
              Tab(icon: Icon(Icons.restaurant), text: 'Makanan'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            ElektronikTab(),
            FashionTab(),
            MakananTab(),
          ],
        ),
      ),
    );
  }
}
```

---

## API Integration

### Setup http package

```yaml
# pubspec.yaml
dependencies:
  http: ^1.0.0
```

### Step 1: Model + JSON Serialization

```dart
// models/product.dart
class Product {
  final int id;
  final String name;
  final double price;
  final String? imageUrl;

  Product({
    required this.id,
    required this.name,
    required this.price,
    this.imageUrl,
  });

  // JSON → Dart object
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as int,
      name: json['name'] as String,
      price: (json['price'] as num).toDouble(),
      imageUrl: json['image_url'] as String?,
    );
  }

  // Dart object → JSON (buat kirim data)
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'price': price,
    'image_url': imageUrl,
  };
}
```

### Step 2: Service Layer

```dart
// services/product_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product.dart';

class ProductService {
  final String baseUrl;

  ProductService({this.baseUrl = 'https://api.example.com'});

  Future<List<Product>> fetchProducts() async {
    final response = await http.get(Uri.parse('$baseUrl/products'));

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body) as List<dynamic>;
      return data
          .map((json) => Product.fromJson(json as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception('Gagal load produk: ${response.statusCode}');
    }
  }

  Future<Product> fetchProduct(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/products/$id'));

    if (response.statusCode == 200) {
      return Product.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
    } else {
      throw Exception('Produk tidak ditemukan: $id');
    }
  }

  Future<Product> createProduct(Product product) async {
    final response = await http.post(
      Uri.parse('$baseUrl/products'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(product.toJson()),
    );

    if (response.statusCode == 201) {
      return Product.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
    } else {
      throw Exception('Gagal buat produk: ${response.statusCode}');
    }
  }
}
```

### Step 3: FutureBuilder di UI

```dart
class ProductListScreen extends StatelessWidget {
  final ProductService service = ProductService();

  ProductListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Produk')),
      body: FutureBuilder<List<Product>>(
        future: service.fetchProducts(),
        builder: (context, snapshot) {
          // Loading state
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          // Error state
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('Error: ${snapshot.error}',
                      textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      // Trigger rebuild → refetch
                      (context as Element).reassemble();
                    },
                    child: const Text('Coba Lagi'),
                  ),
                ],
              ),
            );
          }

          // Success state (data ada)
          final products = snapshot.data!;
          return ListView.builder(
            itemCount: products.length,
            itemBuilder: (context, index) {
              final p = products[index];
              return ListTile(
                leading: p.imageUrl != null
                    ? Image.network(p.imageUrl!, width: 50, height: 50,
                        fit: BoxFit.cover)
                    : const CircleAvatar(child: Icon(Icons.inventory)),
                title: Text(p.name),
                subtitle: Text('Rp${p.price.toStringAsFixed(0)}'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {
                  Navigator.pushNamed(context, '/product/${p.id}');
                },
              );
            },
          );
        },
      ),
    );
  }
}
```

### Error Handling yang Lebih Baik

```dart
// services/api_result.dart
class ApiResult<T> {
  final T? data;
  final String? error;
  final bool isLoading;

  ApiResult({this.data, this.error, this.isLoading = false});

  factory ApiResult.loading() => ApiResult(isLoading: true);
  factory ApiResult.success(T data) => ApiResult(data: data);
  factory ApiResult.failure(String error) => ApiResult(error: error);
}
```

### Provider + API (Best Practice)

```dart
// providers/product_provider.dart
import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../services/product_service.dart';

class ProductProvider extends ChangeNotifier {
  final ProductService _service = ProductService();

  List<Product> _products = [];
  bool _isLoading = false;
  String? _error;

  List<Product> get products => _products;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadProducts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _products = await _service.fetchProducts();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

### Dio — HTTP Client yang Lebih Canggih

Selain `http` package, ada **Dio** — HTTP client production-ready dengan fitur: interceptor, retry, timeout, cancel token.

```yaml
# pubspec.yaml
dependencies:
  dio: ^5.4.0
```

```dart
// services/api_client.dart
import 'package:dio/dio.dart';

class ApiClient {
  late final Dio _dio;

  ApiClient({required String baseUrl}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Interceptor — log request & response
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        debugPrint('[HTTP] ${options.method} ${options.path}');
        handler.next(options);
      },
      onResponse: (response, handler) {
        debugPrint('[HTTP] ${response.statusCode} ${response.requestOptions.path}');
        handler.next(response);
      },
      onError: (error, handler) {
        debugPrint('[HTTP ERROR] ${error.message}');
        handler.next(error);
      },
    ));
  }

  Future<Response> get(String path, {Map<String, dynamic>? params}) {
    return _dio.get(path, queryParameters: params);
  }

  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) {
    return _dio.put(path, data: data);
  }

  Future<Response> delete(String path) {
    return _dio.delete(path);
  }
}

// Service pake ApiClient
class PostService {
  final ApiClient _client = ApiClient(baseUrl: 'https://jsonplaceholder.typicode.com');

  Future<List<Post>> fetchPosts() async {
    final response = await _client.get('/posts');
    final List<dynamic> data = response.data as List<dynamic>;
    return data.map((json) => Post.fromJson(json)).toList();
  }
}
```

```dart
// UI dengan Provider
class ProductScreen extends StatelessWidget {
  const ProductScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ProductProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Produk')),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : provider.error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Error: ${provider.error}'),
                      ElevatedButton(
                        onPressed: () => context
                            .read<ProductProvider>()
                            .loadProducts(),
                        child: const Text('Coba Lagi'),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: provider.products.length,
                  itemBuilder: (context, index) {
                    final p = provider.products[index];
                    return ListTile(title: Text(p.name));
                  },
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () =>
            context.read<ProductProvider>().loadProducts(),
        child: const Icon(Icons.refresh),
      ),
    );
  }
}
```

### Refresh Pake Pull-to-Refresh

```dart
RefreshIndicator(
  onRefresh: () => context.read<ProductProvider>().loadProducts(),
  child: ListView.builder(
    itemCount: provider.products.length,
    itemBuilder: (context, index) {
      return ListTile(title: Text(provider.products[index].name));
    },
  ),
);
```

---

## Latihan

1. **Buat App Multi-Screen** — 3 screen: HomeScreen, AboutScreen, ContactScreen. Pake named routes. BottomNavigationBar buat navigasi antar screen. Tiap screen punya AppBar title beda.

2. **Buat API Call ke JSONPlaceholder** — Pake `https://jsonplaceholder.typicode.com/posts`. Model: Post (userId, id, title, body). Tampilin ListView judul posts. Klik → detail screen pake Navigator push. Tambahin error handling + loading spinner.

3. **Buat Search Screen** — Pake `https://jsonplaceholder.typicode.com/users`. `FutureBuilder`. Tampilin ListTile: nama, email, company name. Tambahin `TextField` buat filter/search by name pake `where()` di list. Refresh pake `RefreshIndicator`.

4. **Gabung Provider + API** — Bikin `UserProvider extends ChangeNotifier`. Method: `loadUsers()`. UI: pake `context.watch<UserProvider>()`. Tampilin loading/error/data. Bonus: tombol retry kalo error.

5. **Dio Client + Interceptor** — Pindahin semua HTTP call dari `http` package ke Dio. Bikin `ApiClient` dengan interceptor logging. Pake di service product. Test fetch produk, tangani error timeout.

6. **Drawer + Tab Navigation Combo** — Bikin app dengan `Drawer` di kiri (menu: Home, Produk, Profile) dan `TabBar` di halaman Produk (tab: Semua, Elektronik, Fashion). Pake navigasi pushNamed dari drawer items.

7. **Search + Debounce** — Bikin search screen yang panggil API pencarian (`/posts?q=searchterm`). Implementasi debounce pake `Timer` — jangan panggil API tiap ketikan, tunggu 500ms setelah user berhenti ngetik. Tampilkan loading indicator.
