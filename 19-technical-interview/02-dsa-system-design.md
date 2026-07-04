# 2. DSA Patterns & System Design Interview

> **Target:** Kuasai 5 pola DSA utama + framework jawab system design dengan metode 1-2-3.

---

## Common DSA Patterns

### 1. Sliding Window

**Gunakan saat:** Input array/string, cari subarray/substring optimal (maks/min/panjang tertentu).

**Pola kunci:**
- Fixed window — geser jendela ukuran tetap, catat nilai tiap posisi.
- Variable window — perluas `right`, ciutkan `left` saat kondisi rusak.

```python
# Substring terpanjang tanpa karakter berulang
def panjang_substring_unik(s: str) -> int:
    seen = set()
    left = max_len = 0
    for right, ch in enumerate(s):
        while ch in seen:
            seen.remove(s[left])
            left += 1
        seen.add(ch)
        max_len = max(max_len, right - left + 1)
    return max_len

# Test
print(panjang_substring_unik("abcabcbb"))  # 3 ("abc")
print(panjang_substring_unik("bbbbb"))     # 1 ("b")
print(panjang_substring_unik(""))           # 0
```

### 2. Two Pointers

**Gunakan saat:** Array sudah terurut atau perlu pasangan elemen.

**Pola kunci:**
- Pointer kiri + kanan, bergerak ke tengah.
- Atau slow/fast pointer satu arah.

```python
# Cari dua angka dalam array terurut yang jumlahnya = target
def dua_jumlah(arr, target):
    kiri, kanan = 0, len(arr) - 1
    while kiri < kanan:
        total = arr[kiri] + arr[kanan]
        if total == target:
            return [arr[kiri], arr[kanan]]
        elif total < target:
            kiri += 1
        else:
            kanan -= 1
    return []

# Test
print(dua_jumlah([1, 2, 3, 4, 6], 6))  # [2, 4]
print(dua_jumlah([1, 2, 3], 10))        # []
```

### 3. Fast & Slow Pointer (Floyd's Algorithm)

**Gunakan saat:** Linked list — deteksi siklus, cari titik tengah.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Deteksi cycle dalam linked list
def ada_siklus(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False

# Membuat linked list dengan cycle
node1 = ListNode(3)
node2 = ListNode(2)
node3 = ListNode(0)
node4 = ListNode(-4)
node1.next = node2
node2.next = node3
node3.next = node4
node4.next = node2  # cycle

print(ada_siklus(node1))  # True
```

### 4. BFS & DFS (Graph/Tree)

**Gunakan saat:** Pencarian jalur, level-order traversal, shortest path.

| Algoritma | Struktur Data | Cocok |
|-----------|-------------|-------|
| **BFS** | Queue | Shortest path di graph tak berbobot, level order |
| **DFS** | Stack (rekursif/eksplisit) | Semua kemungkinan jalur, topological sort |

```python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# BFS — level order traversal
def level_order(root):
    if not root:
        return []
    hasil, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        hasil.append(level)
    return hasil

# DFS — inorder traversal (rekursif)
def inorder(root):
    if not root:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)

# Test
#      1
#    /   \
#   2     3
#  / \
# 4   5
root = TreeNode(1)
root.left = TreeNode(2, TreeNode(4), TreeNode(5))
root.right = TreeNode(3)

print(level_order(root))  # [[1], [2, 3], [4, 5]]
print(inorder(root))      # [4, 2, 5, 1, 3]
```

### 5. Dynamic Programming (DP)

**Gunakan saat:** Soal minta "cara terbanyak", "minimum/maximum", atau punya overlapping subproblems.

**Pola kunci:**
1. Tentukan **state** (biasanya index + parameter).
2. Buat **base case**.
3. Rumus **recurrence**.
4. Optimasi dengan memoization (top-down) atau tabel (bottom-up).

```python
# Fibonacci ke-n (bottom-up)
def fib(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]

# Minimum coins (coin change)
def min_koin(koin, target):
    dp = [float('inf')] * (target + 1)
    dp[0] = 0
    for i in range(1, target + 1):
        for k in koin:
            if i - k >= 0:
                dp[i] = min(dp[i], dp[i - k] + 1)
    return dp[target] if dp[target] != float('inf') else -1

# Test
print(fib(10))          # 55
print(min_koin([1, 3, 4], 6))  # 2 (3+3)
print(min_koin([2], 3))        # -1
```

### Tips Belajar DSA

- Kerjakan soal **bertema sama** (hanya sliding window) sampai pola terasa alami.
- Gunakan **NeetCode 150** atau **Grind 75** — bukan LeetCode acak.
- Batasi waktu: 20-30 menit per soal. Lewat? Lihat solusi, pahami, ulangi 2 hari kemudian.
- Kompleksitas waktu & ruang wajib disebut di setiap jawaban.

---

## System Design Interview Framework (1-2-3 Method)

Untuk fresh grad, system design bukan tentang skalabilitas ribuan server. Fokus pada **fondasi dan struktur berpikir**.

### Metode 1-2-3

| Langkah | Durasi | Aktivitas |
|---------|--------|-----------|
| **1. Klarifikasi** | 3-5 menit | Tanya kebutuhan, batasan, asumsi |
| **2. High-Level** | 5-7 menit | Gambar arsitektur, komponen utama |
| **3. Deep Dive** | 10-15 menit | Detail DB schema, API, trade-off |

### 1. Klarifikasi — Tanyakan Ini

Sebelum jawab, tanya:

- "Berapa banyak pengguna?"
- "Fitur utama apa saja?"
- "Apakah perlu real-time?"
- "Prioritas availability atau consistency?"
- "Pakai database SQL atau NoSQL?"

Ini menunjukkan **cara kerja profesional** — bukan langsung tebak.

### 2. High-Level Architecture

Gambar (di papan tulis / whiteboard):
```
Client → Load Balancer → Web Server → Database
                         ↓
                   Cache (Redis)
```

Sebutkan komponen dan fungsinya secara singkat.

### 3. Deep Dive

Pilih 1-2 area untuk di-explore detail:

- **Database schema:** tabel, kolom, relasi, index.
- **API design:** endpoint, method, request/response.
- **Data flow:** bagaimana data bergerak dari client ke database.

### Contoh: Design URL Shortener

**Klarifikasi:**
- 1000 URL baru/hari.
- URL disimpan 1 tahun.
- Perlu tracking klik.

**High-Level:**
```
Client → POST /shorten → Web Server → DB (URLs)
Client → GET /abc123  → Web Server → Redirect 302
```

**Deep Dive:**

```sql
-- Database schema
CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    long_url TEXT NOT NULL,
    short_code VARCHAR(7) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    click_count INT DEFAULT 0
);

-- Index untuk lookup cepat
CREATE INDEX idx_short_code ON urls(short_code);
```

```python
# Generate short code — Base62
import string

BASE62 = string.digits + string.ascii_lowercase + string.ascii_uppercase

def encode(num):
    if num == 0:
        return BASE62[0]
    result = []
    while num > 0:
        result.append(BASE62[num % 62])
        num //= 62
    return ''.join(reversed(result))

print(encode(123456))  # "W7E"
```

**Trade-off:**
- Base62 vs hash: Base62 simpel, terjamin unik. Hash perlu cek duplikat.
- 302 redirect vs 301: 302 untuk analytics, 301 untuk cache.

### Contoh: Design Chat App

**Klarifikasi:**
- Chat 1-on-1 (bukan grup).
- 10.000 pengguna aktif.
- Perlu status online.

**High-Level:**
```
Client → WebSocket → Chat Server → DB (messages)
                              ↓
                        Redis (online status)
```

**Deep Dive:**

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    online BOOLEAN DEFAULT FALSE
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id),
    receiver_id INT REFERENCES users(id),
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_conversation ON messages(sender_id, receiver_id, sent_at);
```

```python
# WebSocket event handler (pseudo)
async def handle_message(data):
    # data = { "to": user_id, "content": "Halo" }
    msg = {
        "from": current_user.id,
        "content": data["content"],
        "timestamp": now()
    }
    # Simpan ke DB
    await db.messages.insert(msg)
    # Kirim real-time
    await ws_manager.send_to(data["to"], msg)
    return {"status": "sent"}
```

**Trade-off:**
- WebSocket vs Polling: WebSocket lebih efisien untuk real-time.
- SQL vs NoSQL: SQL untuk relationship data, NoSQL untuk scalability.
- Read receipt: Update `is_read` butuh write tambahan — trade-off konsistensi vs performa.

---

## Whiteboard Approach

Saat interview (online/offline), ikuti langkah ini:

1. **Tulis ulang soal** — pastikan tidak salah paham.
2. **Tanya clarifying questions** — input valid? ukuran data? output format?
3. **Buat contoh** — input → output, trace manual.
4. **Brainstorm solusi** — sebut brute force dulu, lalu optimasi.
5. **Pseudocode** — tulis logika pakai bahasa manusia.
6. **Koding** — tulis kode bersih, pakai nama variabel jelas.
7. **Test** — jalanin dengan contoh tadi.
8. **Optimasi & trade-off** — kompleksitas waktu/ruang, alternatif.

> **Paling penting:** Think out loud. Pewawancara nilai **proses berpikir**, bukan jawaban akhir.

---

## Latihan

1. **DSA Coding:** Selesaikan 3 soal berikut pakai pola di atas:
   - *"Cari panjang subarray terpanjang dengan jumlah <= target"* (sliding window)
   - *"Balikkan linked list"* (two pointers)
   - *"Cari jalur terpendek dalam grid 2D dari kiri atas ke kanan bawah"* (BFS)

   Tulis kode + test case + kompleksitas waktu/ruang.

2. **System Design Mini:** Design sistem sederhana. Pilih salah satu:
   - **Design Parking Lot** — kendaraan masuk/keluar, hitung biaya, cek slot kosong.
   - **Design Todo App** — CRUD task, deadline, kategori, filter.

   Ikuti metode 1-2-3. Tulis klarifikasi, high-level, deep dive (schema + API + flow).

3. **Whiteboard Simulasi:** Ambil soal LeetCode mudah (Easy). Rekam diri sendiri (video 10 menit) sambil:
   - Baca soal keras-keras
   - Tanya clarifying questions
   - Tulis pseudocode
   - Koding
   - Test
   - Analisis kompleksitas

4. **Trade-off Analysis:** Dari 2 contoh system design di atas (URL shortener & chat app), tulis 3 trade-off untuk setiap keputusan desain. Format: "Pilih [X] karena [alasan], tapi konsekuensinya [Y]."
