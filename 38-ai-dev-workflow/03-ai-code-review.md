# Sesi 03 — AI Code Review

**Durasi:** 2 Jam  
**Tujuan:** Menggunakan AI untuk code review workflow, generate unit tests, dokumentasi otomatis, dan PR description generation.

---

## 3.1 AI Code Review Workflow

### Mengapa AI Code Review?

- **Kecepatan:** Review dalam detik, bukan jam
- **Konsistensi:** Aturan yang sama setiap review
- **Coverage:** Tidak ada baris yang terlewat
- **Pendidikan:** AI menjelaskan *kenapa* suatu kode bermasalah

### Workflow Review dengan AI

```
Developer push PR ──► AI review otomatis
                         │
                  ┌──────┴──────┐
                  ▼              ▼
            Found issues    No issues
                  │              │
                  ▼              ▼
            AI comment PR    Approve
                  │
        Developer fix & push
                  │
                  ▼
            AI re-review
```

### Prompt untuk Code Review

> *"Review kode Python berikut. Cari: security issues, bug, performance bottleneck, code style violation. Format: tiap issue punya severity (HIGH/MEDIUM/LOW), lokasi (file:line), dan saran fix. Bahasa Indonesia."*

```python
# Contoh kode untuk direview
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return db.execute(query)
```

### AI Review Output

```
🔴 HIGH — SQL Injection (app.py:2)
   Query menggunakan f-string dengan input user.
   Saran: Gunakan parameterized query.
   Fix: cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

🟡 MEDIUM — Tidak ada error handling (app.py:1-3)
   Fungsi tidak handle case user_id tidak ditemukan.
   Saran: Tambah try/except atau return None handling.

🟢 LOW — Type hint kurang (app.py:1)
   Parameter user_id tanpa type hint.
   Saran: def get_user(user_id: int) -> dict | None:
```

---

## 3.2 AI Generate Unit Tests

### Prompt Template untuk Test Generation

> *"Buat unit test pytest untuk kelas Calculator. Coverage: method add, subtract, multiply, divide. Include: happy path, edge cases (divide by zero, negative numbers), boundary values. Gunakan fixture untuk instance Calculator."*

### Kode yang Di-test

```python
# calculator.py
class Calculator:
    """Kalkulator sederhana dengan 4 operasi dasar."""

    def add(self, a: float, b: float) -> float:
        return a + b

    def subtract(self, a: float, b: float) -> float:
        return a - b

    def multiply(self, a: float, b: float) -> float:
        return a * b

    def divide(self, a: float, b: float) -> float:
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b
```

### AI Generate Test

```python
# test_calculator.py
import pytest
from calculator import Calculator

@pytest.fixture
def calc():
    """Fixture: instance Calculator."""
    return Calculator()

class TestCalculator:
    """Test suite untuk Calculator."""

    def test_add_positive(self, calc):
        assert calc.add(2, 3) == 5

    def test_add_negative(self, calc):
        assert calc.add(-1, -2) == -3

    def test_add_float(self, calc):
        assert calc.add(0.1, 0.2) == pytest.approx(0.3)

    def test_subtract(self, calc):
        assert calc.subtract(10, 3) == 7

    def test_subtract_negative_result(self, calc):
        assert calc.subtract(3, 10) == -7

    def test_multiply(self, calc):
        assert calc.multiply(4, 5) == 20

    def test_multiply_by_zero(self, calc):
        assert calc.multiply(123, 0) == 0

    def test_multiply_negative(self, calc):
        assert calc.multiply(-2, 3) == -6

    def test_divide(self, calc):
        assert calc.divide(10, 2) == 5.0

    def test_divide_by_zero(self, calc):
        with pytest.raises(ValueError, match="Cannot divide by zero"):
            calc.divide(10, 0)

    def test_divide_negative(self, calc):
        assert calc.divide(-10, 2) == -5.0

    @pytest.mark.parametrize("a,b,expected", [
        (0, 0, 0),
        (1, 1, 1),
        (100, 0.5, 200),
    ])
    def test_divide_parametric(self, calc, a, b, expected):
        assert calc.divide(a, b) == expected
```

---

## 3.3 AI Documentation — JSDoc / Docstring

### Generate Docstring untuk Python

**Prompt:**

> *"Generate Google-style docstring untuk fungsi berikut. Include: deskripsi, Args, Returns, Raises. Bahasa Indonesia."*

```python
# Sebelum — tanpa dokumentasi
def fetch_paginated_data(
    api_url: str,
    page_size: int = 50,
    max_pages: int = 10
) -> list[dict]:
    results = []
    for page in range(1, max_pages + 1):
        resp = requests.get(
            f"{api_url}?page={page}&size={page_size}"
        )
        data = resp.json()
        results.extend(data['items'])
        if page >= data['total_pages']:
            break
    return results
```

### Sesudah — dengan Docstring (AI Generated)

```python
def fetch_paginated_data(
    api_url: str,
    page_size: int = 50,
    max_pages: int = 10
) -> list[dict]:
    """Ambil data dari API paginated hingga batas maksimal halaman.

    Melakukan request GET ke endpoint API dengan parameter
    page dan size. Berhenti lebih awal jika total_pages
    dari response lebih kecil dari max_pages.

    Args:
        api_url: Base URL endpoint API.
        page_size: Jumlah item per halaman (default: 50).
        max_pages: Batas maksimal halaman yang diambil (default: 10).

    Returns:
        List of dict berisi semua item dari semua halaman.

    Raises:
        requests.RequestException: Jika request gagal.
        KeyError: Jika response tidak memiliki key 'items' atau 'total_pages'.
    """
    results = []
    for page in range(1, max_pages + 1):
        resp = requests.get(
            f"{api_url}?page={page}&size={page_size}"
        )
        resp.raise_for_status()
        data = resp.json()
        results.extend(data['items'])
        if page >= data['total_pages']:
            break
    return results
```

### Generate README Otomatis

**Prompt:**

> *"Generate README.md untuk proyek Python calculator sederhana. Include: deskripsi, instalasi, usage contoh, testing, lisensi. Target: developer pemula."*

---

## 3.4 PR Description Generation

### Prompt Template

> *"Generate PR description dari diff berikut. Format:\n## Description\n## Changes\n## Testing\n## Screenshots\nBahasa Indonesia."*

```bash
# Ambil diff dari branch feature
git diff main...HEAD
```

### Contoh PR Description Output AI

```markdown
## Deskripsi
Menambahkan fitur autentikasi JWT dengan refresh token.
User bisa login, mendapat access token (15 menit),
dan refresh token (7 hari) untuk mendapatkan token baru.

## Perubahan
- `src/auth/jwt.py` — Helper untuk encode/decode JWT
- `src/auth/middleware.py` — Middleware FastAPI untuk validasi token
- `src/auth/routes.py` — Endpoint POST /auth/login dan /auth/refresh
- `tests/test_auth.py` — Unit test coverage > 90%
- `requirements.txt` — Tambah `pyjwt` dependency

## Testing
- Semua test passing: `pytest tests/ -v` ✅
- Test manual via Swagger UI: login → copy token → akses protected endpoint
- Edge case: expired token returns 401, invalid signature returns 403

## Screenshots
[attach screenshot Swagger UI]
```

---

## 3.5 Review Checklist dengan AI

Buat checklist review yang bisa AI gunakan setiap kali review:

```
□ 1. Security: SQL injection, XSS, hardcoded credential?
□ 2. Error handling: try/except di tempat rawan?
□ 3. Type hints: semua parameter & return di-annotate?
□ 4. Test coverage: fungsi baru punya test?
□ 5. Performance: N+1 query, loop tidak perlu?
□ 6. Code style: sesuai PEP 8 / Black?
□ 7. Dokumentasi: fungsi publik ada docstring?
□ 8. Edge cases: boundary values, empty input?
```

---

## 3.6 Latihan

### Latihan 3.1 — AI Code Review

Kode ini sengaja punya 5+ isu. Prompt AI untuk review.

```python
import os

def save_user_data(user_input: dict):
    name = user_input['name']
    email = user_input['email']

    query = f"INSERT INTO users (name, email) VALUES ('{name}', '{email}')"
    db.execute(query)

    filename = f"/tmp/user_{email}.txt"
    with open(filename, 'w') as f:
        f.write(f"{name},{email}")

def load_user(user_id):
    return db.execute(f"SELECT * FROM users WHERE id = {user_id}")

def admin_check(role):
    if role == 'admin':
        return True
    return False
```

**Output:** daftar isu dengan severity + lokasi + saran fix.

---

### Latihan 3.2 — Generate Unit Test

```python
# cart.py
class ShoppingCart:
    def __init__(self):
        self.items = {}  # {item_id: {'name': str, 'price': int, 'qty': int}}

    def add_item(self, item_id: str, name: str, price: int, qty: int = 1):
        if item_id in self.items:
            self.items[item_id]['qty'] += qty
        else:
            self.items[item_id] = {'name': name, 'price': price, 'qty': qty}

    def remove_item(self, item_id: str, qty: int = 1):
        if item_id not in self.items:
            raise KeyError(f"Item {item_id} not in cart")
        self.items[item_id]['qty'] -= qty
        if self.items[item_id]['qty'] <= 0:
            del self.items[item_id]

    def get_total(self) -> int:
        return sum(item['price'] * item['qty'] for item in self.items.values())

    def clear(self):
        self.items.clear()
```

**Prompt AI:** *"Buat unit test pytest untuk ShoppingCart. Coverage: add, remove, total, clear, edge cases. Gunakan fixture."*

**Output:** file `test_cart.py` hasil generate AI.

---

### Latihan 3.3 — Generate Dokumentasi

Ambil fungsi dari Latihan 3.2. Prompt AI:

> *"Generate Google-style docstring untuk semua method di ShoppingCart. Bahasa Indonesia."*

**Output:** kode dengan docstring lengkap.

---

### Latihan 3.4 — Generate PR Description

Buat branch baru, bikin perubahan kecil (tambah fungsi/class), commit, push.

```bash
git checkout -b feat/latihan-pr-desc
# buat perubahan
git add -A
git commit -m "feat: tambah fitur X"
git push origin feat/latihan-pr-desc
```

Prompt AI:

> *"Generate PR description untuk branch feat/latihan-pr-desc. Format: ## Deskripsi ## Perubahan ## Testing."*

**Output:** PR description yang siap dipakai.

---

## Ringkasan Sesi 03

| Area | Prompt Contoh |
|------|---------------|
| Code Review | "Review kode ini. Cari security, bug, performance issues" |
| Generate Test | "Buat pytest unit test untuk class X" |
| Generate Docstring | "Buat Google-style docstring untuk fungsi ini" |
| Generate README | "Generate README untuk proyek Y" |
| Generate PR Desc | "Generate PR description dari diff" |
