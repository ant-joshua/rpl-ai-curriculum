# 1.2 Layout & State Management

## Layout Widgets

### Row — horizontal

```dart
Row(
  mainAxisAlignment: MainAxisAlignment.spaceEvenly, // horizontal
  crossAxisAlignment: CrossAxisAlignment.center,     // vertical
  children: [
    Icon(Icons.star, color: Colors.yellow, size: 40),
    Icon(Icons.star, color: Colors.yellow, size: 40),
    Icon(Icons.star, color: Colors.yellow, size: 40),
  ],
);
```

### Column — vertical

```dart
Column(
  mainAxisAlignment: MainAxisAlignment.center,    // vertical
  crossAxisAlignment: CrossAxisAlignment.start,    // horizontal
  children: [
    Text('Nama: Budi'),
    Text('Kelas: XII RPL'),
    Text('Sekolah: SMK Negeri 1'),
  ],
);
```

### Expanded — isi sisa ruang

```dart
Row(
  children: [
    Expanded(
      flex: 2, // 2 bagian
      child: Container(color: Colors.red),
    ),
    Expanded(
      flex: 1, // 1 bagian
      child: Container(color: Colors.blue),
    ),
  ],
);
// Rasio: merah 2/3, biru 1/3
```

### Flexible vs Expanded

```dart
Row(
  children: [
    Container(width: 50, height: 50, color: Colors.red),
    Flexible(
      fit: FlexFit.loose, // bisa lebih kecil dari child
      child: Container(height: 50, color: Colors.green),
    ),
    Expanded(
      // fit: FlexFit.tight — WAJIB isi ruang
      child: Container(height: 50, color: Colors.blue),
    ),
  ],
);
```

### Padding & Margin

```dart
// EdgeInsets — semua cara
EdgeInsets.all(16);                              // semua sisi
EdgeInsets.symmetric(horizontal: 16, vertical: 8); // horizontal + vertical
EdgeInsets.only(left: 16, top: 8);               // spesifik sisi

// Pake di widget
Padding(
  padding: EdgeInsets.all(16),
  child: Text('Hello'),
);

Container(
  margin: EdgeInsets.symmetric(vertical: 8),
  padding: EdgeInsets.all(12),
  child: Text('Container dengan margin + padding'),
);
```

### ListView — scrollable list

```dart
ListView(
  children: [
    ListTile(title: Text('Item 1'), subtitle: Text('Deskripsi')),
    ListTile(title: Text('Item 2'), trailing: Icon(Icons.arrow_forward)),
    ListTile(title: Text('Item 3'), leading: Icon(Icons.person)),
  ],
);

// ListView.builder — performa tinggi
ListView.builder(
  itemCount: 100,
  itemBuilder: (context, index) {
    return ListTile(
      leading: CircleAvatar(child: Text('$index')),
      title: Text('Item ke-$index'),
    );
  },
);
```

### GridView — grid layout

```dart
GridView.count(
  crossAxisCount: 2, // 2 kolom
  crossAxisSpacing: 8,
  mainAxisSpacing: 8,
  padding: EdgeInsets.all(8),
  children: [
    Container(color: Colors.red, height: 100),
    Container(color: Colors.blue, height: 100),
    Container(color: Colors.green, height: 100),
    Container(color: Colors.orange, height: 100),
  ],
);

// GridView.builder — dinamis
GridView.builder(
  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: 2,
    childAspectRatio: 3 / 4, // lebar : tinggi
  ),
  itemCount: products.length,
  itemBuilder: (context, index) {
    return ProductCard(product: products[index]);
  },
);
```

### Layout combo — contoh profile screen

```dart
import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: Column(
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            color: Colors.blue.shade50,
            child: Column(
              children: [
                const CircleAvatar(
                  radius: 50,
                  backgroundImage: NetworkImage('https://i.pravatar.cc/150'),
                ),
                const SizedBox(height: 12),
                const Text('Budi Santoso',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                Text('budi@email.com', style: TextStyle(color: Colors.grey[600])),
              ],
            ),
          ),
          // Menu list
          Expanded(
            child: ListView(
              children: [
                ListTile(leading: Icon(Icons.settings), title: Text('Pengaturan')),
                ListTile(leading: Icon(Icons.info), title: Text('Tentang')),
                ListTile(leading: Icon(Icons.logout), title: Text('Keluar')),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## State Management

### Level 1: setState

```dart
class TodoScreen extends StatefulWidget {
  const TodoScreen({super.key});

  @override
  State<TodoScreen> createState() => _TodoScreenState();
}

class _TodoScreenState extends State<TodoScreen> {
  final List<String> _todos = [];
  final _controller = TextEditingController();

  void _addTodo() {
    if (_controller.text.isNotEmpty) {
      setState(() {
        _todos.add(_controller.text);
        _controller.clear();
      });
    }
  }

  void _removeTodo(int index) {
    setState(() => _todos.removeAt(index));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Todo List')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: 'Tambah todo...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _addTodo,
                  child: const Text('Tambah'),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _todos.length,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(_todos[index]),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () => _removeTodo(index),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

### StatefulWidget Lifecycle

```
createState()            → bikin state object
initState()              → inisialisasi (panggil 1x)
didChangeDependencies()  → dependencies berubah
build()                  → render widget
setState()               → trigger build ulang
didUpdateWidget()        → widget parent berubah
dispose()                → cleanup (panggil 1x)
```

```dart
class LifecycleDemo extends StatefulWidget {
  const LifecycleDemo({super.key});

  @override
  State<LifecycleDemo> createState() => _LifecycleDemoState();
}

class _LifecycleDemoState extends State<LifecycleDemo> {
  @override
  void initState() {
    super.initState();
    print('🔥 initState — jalan 1x');
    // Init controller, stream subscription, API call
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    print('📦 didChangeDependencies — dependencies berubah');
    // Pake context.inheritFromWidgetOfExactType()
  }

  @override
  void didUpdateWidget(covariant LifecycleDemo oldWidget) {
    super.didUpdateWidget(oldWidget);
    print('🔄 didUpdateWidget — parent rebuild');
    // Bandingin widget lama & baru
  }

  @override
  void dispose() {
    print('🗑️ dispose — cleanup');
    // Hapus controller, stream, listener
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    print('🏗️ build — render');
    return const SizedBox.shrink();
  }
}
```

### Level 2: Provider

Provider = state management paling populer di Flutter. Pake pattern **ChangeNotifier + Provider**.

#### Setup pubspec.yaml

```yaml
dependencies:
  flutter:
    sdk: flutter
  provider: ^6.0.0
```

#### Buat Model + ChangeNotifier

```dart
// models/todo_provider.dart
import 'package:flutter/foundation.dart';

class TodoItem {
  final String title;
  bool isDone;

  TodoItem({required this.title, this.isDone = false});
}

class TodoProvider extends ChangeNotifier {
  final List<TodoItem> _items = [];

  List<TodoItem> get items => _items;
  int get doneCount => _items.where((i) => i.isDone).length;
  int get pendingCount => _items.where((i) => !i.isDone).length;

  void add(String title) {
    _items.add(TodoItem(title: title));
    notifyListeners(); // ← WAJIB — trigger rebuild widget
  }

  void toggle(int index) {
    _items[index].isDone = !_items[index].isDone;
    notifyListeners();
  }

  void remove(int index) {
    _items.removeAt(index);
    notifyListeners();
  }
}
```

#### Bungkus App pake Provider

```dart
// main.dart
void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => TodoProvider(),
      child: const MyApp(),
    ),
  );
}
```

#### Pake di Widget

```dart
class TodoListScreen extends StatelessWidget {
  const TodoListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // watch = listen perubahan → rebuild
    final todoProvider = context.watch<TodoProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Todo with Provider')),
      body: Column(
        children: [
          // Stats
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Text('Total: ${todoProvider.items.length}'),
                Text('Done: ${todoProvider.doneCount}'),
                Text('Pending: ${todoProvider.pendingCount}'),
              ],
            ),
          ),
          // List
          Expanded(
            child: ListView.builder(
              itemCount: todoProvider.items.length,
              itemBuilder: (context, index) {
                final item = todoProvider.items[index];
                return ListTile(
                  leading: Checkbox(
                    value: item.isDone,
                    onChanged: (_) => todoProvider.toggle(index),
                  ),
                  title: Text(
                    item.title,
                    style: TextStyle(
                      decoration:
                          item.isDone ? TextDecoration.lineThrough : null,
                    ),
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () => todoProvider.remove(index),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddDialog(BuildContext context) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Tambah Todo'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'Nama todo...'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              // read = panggil method, ga listen
              context.read<TodoProvider>().add(controller.text);
              Navigator.pop(ctx);
            },
            child: const Text('Tambah'),
          ),
        ],
      ),
    );
  }
}
```

### Provider Patterns: watch vs read

```dart
// watch — listen perubahan, rebuild kalo data berubah
final provider = context.watch<TodoProvider>();
Text('Done: ${provider.doneCount}'); // auto update

// read — akses data/method, GA rebuild
context.read<TodoProvider>().add('Belajar Flutter');
```

---

## Latihan

1. **Buat Grid Galeri** — `GridView.count` dengan 3 kolom. Tiap item: Container warna random (pake list warna), tinggi 120, pake margin 4. Klik item → print warna dari item ke console.

2. **Buat Form Login** — `Column` + 2 `TextField` (email, password) + `ElevatedButton`. Pake `TextEditingController`. Kalo submit, print ke console "Login: [email] / [password]". Validasi: jangan kosong.

3. **Buat Counter dengan Provider** — Pindahin logic Counter dari setState ke Provider (`CounterProvider` extends `ChangeNotifier`). Widget listen pake `context.watch<CounterProvider>()`. Method: increment, decrement, reset.

4. **Buat Shopping Cart** — `CartProvider` extends `ChangeNotifier`. `CartItem` class: name, price, quantity. Method: `addItem(name, price)`, `removeItem(index)`, `totalPrice`. UI: ListView item keranjang + total harga di bawah. Pake `FloatingActionButton` buat nambah item (dialog input nama & harga).
