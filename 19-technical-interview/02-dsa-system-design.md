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

## Behavioral Question Bank & Salary Discussion

Selain teknis, interview selalu ada sesi **behavioral & tanya jawab gaji**. Persiapkan kedua hal ini.

### Behavioral Question Bank — 20+ Pertanyaan

| Kategori | Pertanyaan | Yang Dinilai |
|----------|-----------|-------------|
| **Pengalaman** | "Ceritakan proyek paling menantang." | Technical depth, problem-solving |
| **Pengalaman** | "Apa pencapaian terbesar di sekolah?" | Inisiatif, dampak |
| **Teamwork** | "Pernah beda pendapat dengan teman tim?" | Conflict resolution |
| **Teamwork** | "Lebih suka kerja sendiri atau tim? Kenapa?" | Kolaborasi |
| **Kegagalan** | "Ceritakan kegagalan terbesar." | Self-awareness, growth |
| **Kegagalan** | "Pernah telak ngasih estimasi? Kenapa?" | Accountability |
| **Motivasi** | "Kenapa milih jadi developer?" | Passion, alasan |
| **Motivasi** | "Apa teknologi favorit? Kenapa?" | Rasa ingin tahu |
| **Ambisi** | "Mau jadi apa dalam 5 tahun?" | Perencanaan karir |
| **Ambisi** | "Skill apa yang ingin kamu kuasai tahun ini?" | Growth mindset |
| **Kritik** | "Pernah dikritik soal kode? Gimana reaksimu?" | Menerima feedback |
| **Kritik** | "Apa kelemahan terbesarmu?" | Self-assessment |
| **Teknis** | "Gimana cara kamu debug kode yang error?" | Proses berpikir |
| **Teknis** | "Framework/library favorit? Kenapa?" | Pengetahuan teknis |
| **Situasional** | "Deadline mepet, fitur gak selesai. Apa yang kamu lakukan?" | Prioritisasi |
| **Situasional** | "Senior ngasih solusi yang menurutmu kurang optimal. Gimana?" | Assertiveness |
| **Situasional** | "Tim pake kode yang kamu rasa rentan bug. Apa yang kamu lakuin?" | Quality ownership |
| **Situasional** | "Client minta fitur yang gak masuk akal. Gimana?" | Negosiasi |
| **Situasional** | "Kamu dikasih tugas di luar job desc. Apa yang kamu lakuin?" | Fleksibilitas |
| **Penutup** | "Ada pertanyaan untuk kami?" | Persiapan, minat |

### Cara Jawab Behavioral: STAR Plus

STAR standar sudah dibahas di file 01. Tapi untuk fresh grad, ada **STAR Plus** — tambahkan **P** (Pembelajaran):

| Huruf | Fokus | Contoh Kalimat |
|-------|-------|---------------|
| **S** | Konteks singkat | "Waktu proyek RPL semester 4..." |
| **T** | Peran spesifik | "Saya bertugas bikin REST API..." |
| **A** | Tindakan detail | "Pertama saya... lalu... akhirnya..." |
| **R** | Hasil terukur | "Selesai 2 hari lebih cepat, nilai 90" |
| **P** | Pembelajaran | "Saya belajar pentingnya... sekarang saya..." |

Dengan STAR Plus, interviewer lihat kamu bukan cuma ngerjain tugas, tapi juga **belajar dari pengalaman**.

### Salary Discussion — Gaji Fresh Grad

#### Riset Gaji — Cara Dapetin Data

| Sumber | Cara Pakai |
|--------|-----------|
| **Glassdoor** | Cari "[posisi] [kota]" — liat salary range |
| **LinkedIn Salary** | Fitur LinkedIn Premium (trial gratis) |
| **Jobstreet / Glints** | Cek range gaji di lowongan serupa |
| **Tanya network** | Tanya senior/kenalan di industri |
| **Survey komunitas** | Grup Telegram / Discord developer Indonesia |

Contoh data gaji fresh grad RPL di Indonesia (2025-2026 estimasi):

| Role | Jakarta | Kota Besar Lain | Startup Kecil |
|------|---------|-----------------|---------------|
| Frontend React | 4-7 jt | 3-5 jt | 2-4 jt |
| Backend Node.js | 5-8 jt | 4-6 jt | 3-5 jt |
| Full-stack | 5-9 jt | 4-7 jt | 3-5 jt |
| Mobile (React Native) | 5-8 jt | 4-6 jt | 3-5 jt |

#### Kapan Ditanya Gaji?

Biasanya di **akhir proses** — pas HR udah yakin mau hire. Atau di screening awal.

Strategi jawab:

| Situasi | Jawaban |
|---------|---------|
| "Ekspektasi gaji berapa?" | "Saya masih fleksibel. Boleh tau range yang perusahaan siapkan?" |
| Dipaksa nyebut angka | Sebut range lebar: "5-8 juta, tergantung benefit dan tanggung jawab." |
| "Gaji kita 4 juta, gimana?" | Minta waktu: "Boleh saya pikir dulu 1-2 hari?" |

#### Script Negosiasi Lengkap

```
"Terima kasih atas tawarannya, Bu/Pak. Saya sangat antusias
untuk bergabung. Sebelum tanda tangan, saya mau tanya —
apakah ada fleksibilitas untuk range gaji?

Berdasarkan riset saya, rata-rata gaji junior developer
di [kota] adalah [nominal]. Dengan skill saya di
[skill A] dan [skill B], saya yakin bisa berkontribusi
sesuai ekspektasi tim.

Mungkin [nominal yang diinginkan] bisa dipertimbangkan?
Atau mungkin ada kompensasi lain seperti training budget?"
```

#### Kalau Gaji Gak Bisa Naik

| Alternatif | Contoh Kalimat |
|-----------|---------------|
| Signing bonus | "Apakah ada signing bonus sekali bayar?" |
| Review lebih awal | "Bisa review gaji di bulan ke-6 instead of 12?" |
| Training budget | "Ada budget untuk kursus atau sertifikasi?" |
| Perangkat | "Apakah perusahaan menyediakan monitor eksternal?" |
| WFH allowance | "Ada budget untuk internet atau listrik?" |
| Equity (startup) | "Apakah ada opsi saham untuk karyawan?" |

---

## Negotiation & Follow-Up Strategy

### Follow-Up Timeline

| Waktu | Tindakan |
|-------|----------|
| **1 jam** | Kirim thank you email ke interviewer |
| **1 hari** | Catat pertanyaan yang diajukan — evaluasi jawaban |
| **3 hari** | Jika belum ada kabar, follow-up sopan |
| **1 minggu** | Jika tidak diterima, minta feedback |
| **2 minggu** | Lanjut apply perusahaan lain |

### Template Thank You Email

```
Subject: Terima kasih — [Posisi] — [Nama Lengkap]

Halo [Nama Interviewer],

Terima kasih atas waktu interview hari ini. Saya makin
yakin kalau [Nama Perusahaan] adalah tempat yang tepat
buat saya berkembang.

Saya sangat tertarik dengan [sebut sesuatu dari interview
— misal: tech stack / budaya perusahaan].

Satu hal yang saya pikirkan setelah interview — [opsional:
tambahan jawaban / koreksi].

Semoga bisa bergabung!

Salam,
[Nama]
[LinkedIn]
[No. HP]
```

### Jika Diterima

1. Baca kontrak dengan teliti.
2. Tanyakan: gaji, tunjangan, jam kerja, probation period, aturan WFH.
3. Konfirmasi tanggal mulai.
4. Minta offer letter resmi (PDF).
5. Beri kabar ke perusahaan lain yang masih proses.

### Jika Tidak Diterima

1. Minta feedback spesifik: "Skill apa yang kurang?"
2. Jangan defensif — catat, evaluasi, perbaiki.
3. Tanya: "Apakah ada rekomendasi course/buku?"
4. Apply ke perusahaan lain dengan perbaikan.
5. Coba lagi 6 bulan kemudian setelah improvement.

> **Penting:** Setiap penolakan adalah data. Gunakan untuk iterasi.

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

5. **Behavioral STAR Practice:** Ambil 5 pertanyaan dari Behavioral Question Bank di atas. Tulis jawaban STAR Plus lengkap. Pastikan ada angka di Result. Baca keras-keras sampai natural.

6. **Riset Gaji:** Cari 3 lowongan fresh grad di LinkedIn/Jobstreet/Glints. Catat posisi, perusahaan, range gaji, lokasi. Hitung rata-rata. Tulis analisis: apakah gaji sesuai skill yang diminta?

7. **Negosiasi Roleplay:** Cari teman. Satu jadi interviewer nawarin gaji 4 juta, satu jadi kandidat. Lakukan negosiasi 5 menit. Rekam. Evaluasi: apa yang kurang percaya diri? Tulis script perbaikan.

8. **Follow-Up Email Draft:** Buat 3 template email untuk perusahaan fiktif "TechIndo Startup":
   - Thank you email setelah interview
   - Follow-up email (3 hari setelah interview, belum ada kabar)
   - Feedback request email (setelah ditolak)

9. **Off-Platform Interview Prep:** Cari 1 perusahaan tech yang kamu incar. Riset: produk mereka, tech stack, budaya perusahaan, review karyawan di Glassdoor. Tulis 3 poin yang bakal kamu sebut kalo ditanya "Kenapa kamu mau kerja di sini?".
