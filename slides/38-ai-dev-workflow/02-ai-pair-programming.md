---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — Modul 38 — AI-Assisted Development Workflow"
footer: "Sesi 02: Ai Pair Programming"
---

<!-- _class: title -->
# Sesi 02 — AI Pair Programming

**Durasi:** 2 Jam  
**Tujuan:** Menggunakan AI sebagai pair programmer untuk TDD, debugging, error analysis, dan commit message generation.

---

## 2.1 AI as Pair Programmer — Bukan Copy-Paste

Prinsip utama: **AI adalah mitra, bukan pengganti.** Jangan langsung copy-paste output AI tanpa dipahami.

### Workflow Pair Programming dengan AI

```
1. Tulis prompt spesifik ──► AI generate kode
2. Review kode AI        ──► Pahami setiap baris
3. Adaptasi ke konteks   ──► Sesuaikan dengan codebase
4. Test hasil            ──► Jalankan test, jangan percaya begitu saja
5. Iterasi               ──► Minta AI refine jika perlu
```

### Prompt Template untuk Pair Programming

| Situasi | Prompt Template |
|---------|-----------------|
| Brainstorm solusi | "Apa 3 cara implementasi fitur X? Pro/cons masing-masing?" |
| Implementasi | "Buat fungsi Y dengan parameter Z. Gunakan pattern A." |
| Refine kode | "Kode ini sudah benar? Kasih saran improvement." |
| Debug | "Test ini fail dengan error X. Bantu analisis." |

---

## 2.2 Test-Driven Development dengan AI

### Workflow TDD + AI

```
1. Tulis test (manual + AI) ──► 2. Lihat test fail (RED)
3. Prompt AI generate kode  ──► 4. Test passing (GREEN)
5. Refactor dengan AI       ──► 6. Test masih passing
```

### Contoh TDD — Kalkulator Diskon

**Step 1: Tulis Test**

```python

---

# test_discount.py
import pytest
from discount import apply_discount

def test_apply_discount_standard():
    """Diskon normal 10% untuk pelanggan reguler."""
    result = apply_discount(amount=100_000, member_tier='regular')
    assert result == 90_000

def test_apply_discount_gold():
    """Diskon 20% untuk member Gold."""
    result = apply_discount(amount=100_000, member_tier='gold')
    assert result == 80_000

def test_apply_discount_platinum():
    """Diskon 30% untuk member Platinum."""
    result = apply_discount(amount=100_000, member_tier='platinum')
    assert result == 70_000

def test_apply_discount_invalid_tier():
    """Error untuk tier tidak dikenal."""
    with pytest.raises(ValueError, match="Unknown tier"):
        apply_discount(amount=100_000, member_tier='diamond')

def test_apply_discount_max_cap():
    """Diskon maksimal Rp 500.000."""
    result = apply_discount(amount=10_000_000, member_tier='platinum')
    assert result == 9_500_000  # diskon 3jt tapi di-cap 500rb
```

**Step 2: Prompt AI untuk Implementasi**

> *"Implementasi fungsi apply_discount(amount: int, member_tier: str) -> int. Aturan: regular=10%, gold=20%, platinum=30%, tier lain raise ValueError, diskon maksimal Rp500.000. Jangan pakai library tambahan."*

**Step 3: Generate Kode (oleh AI)**

```python

---

# discount.py
def apply_discount(amount: int, member_tier: str) -> int:
    """Apply diskon berdasarkan member tier dengan maksimal cap."""
    discount_rates = {
        'regular': 0.10,
        'gold': 0.20,
        'platinum': 0.30,
    }

    if member_tier not in discount_rates:
        raise ValueError(f"Unknown tier: {member_tier}")

    discount = int(amount * discount_rates[member_tier])
    discount = min(discount, 500_000)  # cap maksimal
    return amount - discount
```

**Step 4: Test**

```bash
pytest test_discount.py -v
```

---

## 2.3 AI Debug & Error Analysis

### Teknik Debug dengan AI

1. **Copy-paste error ke AI** — minta analisis
2. **Berikan konteks** — file terkait, input, expected vs actual
3. **Minta fix suggestion** — jangan langsung apply, pahami dulu

### Contoh Debug — IndexError

```python

---

# Kode bermasalah
def get_last_n_items(data: list, n: int) -> list:
    return data[-n:]
```

**Error:**
```
>>> get_last_n_items([1, 2, 3], 5)
[1, 2, 3]  # Seharusnya error atau handle case n > len(data)
```

**Prompt AI:**

> *"Fungsi get_last_n_items tidak handle case n > len(data). Seharusnya return semua data atau raise error. Kasih dua opsi fix dan jelaskan trade-offnya."*

**AI Response:**

```python

---

# Opsi 1: Return semua data jika n > len
def get_last_n_items(data: list, n: int) -> list:
    """Return n item terakhir. Jika n > len, return semua data."""
    return data[-n:] if n <= len(data) else data[:]


---

# Opsi 2: Raise error eksplisit
def get_last_n_items(data: list, n: int) -> list:
    """Return n item terakhir. Raise ValueError jika n > len."""
    if n > len(data):
        raise ValueError(f"n ({n}) larger than list length ({len(data)})")
    return data[-n:]
```

### Contoh Debug — TypeError

```python

---

# Kode bermasalah
def calculate_total(prices: list, quantities: list) -> float:
    return sum(p * q for p, q in zip(prices, quantities))


---

# Test case
print(calculate_total([10_000, 20_000], [2, "3"]))  # TypeError
```

**Prompt AI:**

> *"Kode calculate_total error TypeError: unsupported operand type(s) for *: 'int' and 'str'. Bantu fix: validasi tipe atau konversi otomatis. Tambah test juga."*

**AI Response:**

```python
from typing import Union, List

Number = Union[int, float]

def calculate_total(prices: List[Number], quantities: List[Number]) -> float:
    """Hitung total harga * kuantitas. Handle string numeric."""
    if len(prices) != len(quantities):
        raise ValueError("Panjang prices dan quantities harus sama")

    total = 0.0
    for p, q in zip(prices, quantities):
        try:
            total += float(p) * float(q)
        except (TypeError, ValueError):
            raise TypeError(f"Invalid value: price={p}, quantity={q}")
    return total
```

---

## 2.4 Commit Message Generation

### Conventional Commits

Format: `type(scope): description`

| Type | Kegunaan |
|------|----------|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `refactor` | Refaktor kode |
| `test` | Tambah/ubah test |
| `docs` | Dokumentasi |
| `chore` | Tugas maintenance |

### Prompt AI untuk Commit Message

```bash
git diff --cached | head -100
```

> *"Generate conventional commit message dari diff ini. Format: type(scope): description. Bahasa Indonesia untuk description."*

### Contoh Output AI

```
feat(api): tambah endpoint GET /users/:id dengan caching Redis

- Validasi UUID parameter id
- Cache hit/miss dengan TTL 5 menit
- Fallback ke database jika cache miss
- Unit test coverage > 90%
```

### Auto-generate dengan Script

```bash

---

# Simpan sebagai script atau gunakan AI langsung
git diff --cached | claude -p \
  "Buat conventional commit message dari git diff ini. Format: type(scope): description. Bahasa Indonesia."
```

---

## 2.5 Latihan

### Latihan 2.1 — TDD dengan AI

Buat test dulu untuk fungsi `calculate_shipping(total_belanja: int, kota: str, is_express: bool) -> int`.

Aturan:
- `< Rp50.000`: ongkir Rp10.000 (regular) / Rp20.000 (express)
- `>= Rp50.000`: gratis ongkir untuk kota "Jakarta", Rp5.000 untuk luar Jakarta
- Express: tambah Rp10.000 dari ongkir regular

**Prompt AI untuk test:** tulis prompt yang kamu kirim untuk generate test.
**Langkah:** Tulis test → RED → prompt AI generate kode → GREEN

---

### Latihan 2.2 — Debug dengan AI

Kode berikut punya 3 bug. Prompt AI untuk debug.

```python
def merge_user_data(old: dict, new: dict) -> dict:
    """Merge data user lama dengan baru. Data baru override lama."""
    result = old
    for key, value in new.items():
        if value is not None:
            result[key] = value
    return result


---

# Test
data1 = {'name': 'Budi', 'age': 25}
data2 = {'age': None, 'city': 'Jakarta'}
merged = merge_user_data(data1, data2)
print(merged)

---

# Expected: {'name': 'Budi', 'age': 25, 'city': 'Jakarta'}

---

# Actual juga modifies data1!
```

**Output:** identifikasi 3 bug + fix + penjelasan.

---

### Latihan 2.3 — Error Analysis

```python
import json

def load_config(filepath: str) -> dict:
    with open(filepath, 'r') as f:
        return json.load(f)

def get_nested_config(config: dict, key_path: str):
    keys = key_path.split('.')
    result = config
    for key in keys:
        result = result[key]
    return result
```

**Error saat runtime:**
```
>>> get_nested_config(load_config('config.json'), 'database.host')
KeyError: 'host'
```

**Prompt AI:** *"Analisis error ini. Config.json punya struktur {'database': {'host': 'localhost'}} tapi tetap error. Cari penyebab dan fix."*

**Output:** analisis + fix + test case.

---

### Latihan 2.4 — Commit Message dari Diff

Buat perubahan di repo lokal:

```bash

---

# Buat file baru
echo "def add(a, b): return a + b" > calculator.py
git add calculator.py
```

Prompt AI untuk generate commit message dari diff:

> *"Generate conventional commit message dari git diff --cached. Bahasa Indonesia. Sertakan scope dan type yang tepat."*

**Output:** commit message yang dihasilkan AI + screenshot.

---

## Ringkasan Sesi 02

| Area | Prompt Contoh |
|------|---------------|
| TDD — Test Generation | "Buat unit test untuk fungsi X dengan pytest" |
| TDD — Implementasi | "Implementasi fungsi berdasarkan test ini" |
| Debug | "Error X terjadi saat input Y. Bantu debug" |
| Error Analysis | "Analisis error stack trace ini, cari root cause" |
| Commit Message | "Generate conventional commit dari git diff" |
