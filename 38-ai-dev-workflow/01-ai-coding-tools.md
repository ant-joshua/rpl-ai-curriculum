---

## 1.3 AI Code Completion

Cline & Copilot memberikan **inline completion** saat mengetik.

### Contoh — Fungsi Validasi Email

Ketik komentar atau nama fungsi, AI akan menyarankan implementasi:

```python
# Prompt: "buat fungsi validasi email dengan regex, return boolean"
import re

def validate_email(email: str) -> bool:
    """Validasi format email dengan regex pattern standar."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
```

### Contoh — Generate Function dari Deskripsi

Prompt Cline: *"Buat fungsi Python yang membaca file CSV, validasi kolom required, return list of dict"*

```python
import csv
from pathlib import Path
from typing import List, Dict, Any, Optional

def load_csv_with_validation(
    filepath: str,
    required_columns: List[str]
) -> List[Dict[str, Any]]:
    """
    Baca CSV dan validasi kolom required.

    Args:
        filepath: Path ke file CSV.
        required_columns: Daftar kolom yang wajib ada.

    Returns:
        List of dict dengan data CSV.

    Raises:
        ValueError: Jika kolom required tidak ditemukan.
        FileNotFoundError: Jika file tidak ada.
    """
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"File {filepath} tidak ditemukan")

    with open(path, mode='r', newline='') as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            return []

        missing = [col for col in required_columns if col not in reader.fieldnames]
        if missing:
            raise ValueError(f"Kolom required tidak ditemukan: {missing}")

        return [row for row in reader]
```

---

## 1.4 AI Refactor — Extract Function

### Sebelum Refactor

```python
# Fungsi panjang — banyak tanggung jawab
def process_user_data(raw_data: dict) -> dict:
    # Validasi
    if not raw_data.get('email'):
        raise ValueError("Email required")
    if not raw_data.get('name'):
        raise ValueError("Name required")

    # Transformasi
    email = raw_data['email'].strip().lower()
    name = raw_data['name'].strip().title()
    age = 2025 - int(raw_data.get('birth_year', 2000))

    # Format output
    return {
        'email': email,
        'name': name,
        'age': age,
        'is_adult': age >= 18
    }
```

### Prompt Refactor ke AI

> *"Extract function: pisahkan validasi, transformasi, dan formatting dari process_user_data. Masing-masing jadi fungsi sendiri. Gunakan type hints."*

### Sesudah Refactor

```python
def validate_user_data(raw_data: dict) -> None:
    """Validasi field required dari raw data user."""
    if not raw_data.get('email'):
        raise ValueError("Email required")
    if not raw_data.get('name'):
        raise ValueError("Name required")

def transform_user_data(raw_data: dict) -> dict:
    """Transformasi raw data: bersihkan email, format nama, hitung umur."""
    email = raw_data['email'].strip().lower()
    name = raw_data['name'].strip().title()
    birth_year = int(raw_data.get('birth_year', 2000))
    age = 2025 - birth_year
    return {'email': email, 'name': name, 'age': age}

def format_user_output(data: dict) -> dict:
    """Tambahkan field derived ke data user."""
    return {**data, 'is_adult': data['age'] >= 18}

def process_user_data(raw_data: dict) -> dict:
    """Orkestrasi: validasi → transformasi → format."""
    validate_user_data(raw_data)
    transformed = transform_user_data(raw_data)
    return format_user_output(transformed)
```

---

## 1.5 AI Refactor — Rename & Optimasi

### Rename Variable (Prompt AI)

> *"Rename variable 'd' dan 'tmp' di fungsi berikut supaya deskriptif. Jangan ubah logika."*

```python
# Sebelum
def calc(d: list) -> float:
    tmp = sum(d) / len(d)
    return tmp

# Sesudah
def calculate_average(numbers: list) -> float:
    average = sum(numbers) / len(numbers)
    return average
```

### Optimasi Kode (Prompt AI)

> *"Optimasi fungsi ini: pakai list comprehension, kurangi nested loop, tambahkan type hints."*

```python
# Sebelum
def find_duplicates(items):
    dupes = []
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j] and items[i] not in dupes:
                dupes.append(items[i])
    return dupes

# Sesudah
from collections import Counter
from typing import List, Any

def find_duplicates(items: List[Any]) -> List[Any]:
    """Kembalikan elemen yang muncul lebih dari sekali."""
    return [item for item, count in Counter(items).items() if count > 1]
```

---

## 1.6 Latihan

### Latihan 1.1 — Code Generation dari Prompt

Buat file `src/user_manager.py`. Gunakan AI tool untuk generate fungsi:

1. `create_user(name, email, age)` — validasi input, simpan ke dictionary in-memory
2. `get_user(email)` — cari user by email
3. `list_users(min_age=None)` — list semua user, filter opsional by age
4. `delete_user(email)` — hapus user

**Prompt yang digunakan:** tulis prompt exact yang kamu kirim ke AI. Screenshot hasilnya.

---

### Latihan 1.2 — Extract Function Refactor

Ambil kode berikut. Prompt AI untuk extract function:

```python
def send_email_notification(user_email: str, template: str, data: dict) -> bool:
    # Validate email
    if '@' not in user_email or '.' not in user_email.split('@')[-1]:
        print("Invalid email")
        return False

    # Load template
    if template == 'welcome':
        body = f"Welcome {data['name']}!"
    elif template == 'reset':
        body = f"Reset link sent to {user_email}"
    else:
        body = "Hello!"

    # Send (simulasi)
    print(f"Sending to {user_email}: {body}")
    return True
```

**Output:** 3 fungsi terpisah: `validate_email()`, `render_template()`, `send_email()`. Sertakan prompt AI.

---

### Latihan 1.3 — Optimasi dengan AI

Prompt AI untuk optimasi kode ini. Target: O(n) dari O(n²), pakai data structure lebih efisien.

```python
def get_top_scorers(students: list, threshold: int) -> list:
    result = []
    for s in students:
        score = 0
        for sub in s['subjects']:
            score += sub['score']
        avg = score / len(s['subjects'])
        if avg >= threshold:
            result.append(s)
    return result
```

**Output:** kode optimasi + penjelasan dari AI tentang apa yang diubah.

---

### Latihan 1.4 — AI Explain Code

Berikan kode berikut ke AI dengan prompt *"Explain this code baris per baris. Bahasa Indonesia."*

```python
@dataclass
class Stack:
    items: list = field(default_factory=list)

    def push(self, item): self.items.append(item)
    def pop(self): return self.items.pop()
    def peek(self): return self.items[-1] if self.items else None
    def is_empty(self): return len(self.items) == 0

def is_balanced(expression: str) -> bool:
    stack = Stack()
    pairs = {')': '(', '}': '{', ']': '['}
    for char in expression:
        if char in pairs.values():
            stack.push(char)
        elif char in pairs:
            if stack.is_empty() or stack.pop() != pairs[char]:
                return False
    return stack.is_empty()
```

**Output:** penjelasan per baris dalam Bahasa Indonesia. Screenshot hasil explain dari AI.

---

## Ringkasan Sesi 01

| Area | Alat | Prompt Contoh |
|------|------|---------------|
| Code Generation | Cline / Copilot | "Buat fungsi yang..." |
| Extract Function | Cline | "Extract function: pisahkan..." |
| Rename | Copilot / Cline | "Rename variable d jadi..." |
| Optimasi | Cline | "Optimasi O(n²) jadi O(n)..." |
| Explain | Cline / Claude Code | "Explain code baris per baris..." |
