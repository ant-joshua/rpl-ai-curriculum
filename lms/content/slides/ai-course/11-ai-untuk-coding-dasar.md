---
title: "AI untuk Coding Level Pemula"
module: 11
"ai-complete-course"
---

# Module 11: AI untuk Coding Level Pemula

## 🎯 Tujuan Pembelajaran

Setelah modul ini, kamu akan bisa menggunakan AI sebagai partner belajar coding — mulai dari memahami syntax, debug error, hingga membangun CRUD app pertama.

---

## 1. Tools Rekomendasi untuk Pemula

### Tool AI untuk Coding

| Tool | Harga | Keunggulan | Cocok Untuk |
|------|-------|-----------|-------------|
| **GitHub Copilot** | Gratis (student) | Auto-complete di VS Code | Sehari-hari coding |
| **ChatGPT** | Gratis / Plus $20/bln | Penjelasan detail + kode | Belajar konsep |
| **DeepSeek** | Gratis | Kode lengkap + reasoning | Debug & arsitektur |
| **Claude** | Gratis / Pro $20/bln | Analisis kode mendalam | Review & refactor |
| **Cursor** | Gratis (2K commands) | AI-native editor | Full coding workflow |

### Cara Setup GitHub Copilot (Gratis untuk Siswa)

```bash
# 1. Install VS Code dari https://code.visualstudio.com/
# 2. Buat akun GitHub di https://github.com
# 3. Apply GitHub Student Developer Pack:
#    https://education.github.com/pack
# 4. Install ekstensi "GitHub Copilot" di VS Code
# 5. Login dengan akun GitHub yang sudah terverifikasi
# 6. Mulai coding! AI akan memberikan suggestion otomatis
```

> 💡 **Tips:** GitHub Copilot gratis untuk siswa/mahasiswa melalui Student Developer Pack. Manfaatkan sekarang!

---

## 2. Pahami Dasar dengan AI

### Kategori 1: Belajar Syntax Baru

**Prompt 1 — Hello World di Python:**
```
Ajarin saya coding Python dari nol. Mulai dari:
1. Cara install Python
2. Program pertama (Hello World)
3. Cara menjalankannya
Jelaskan setiap langkah dengan detail untuk pemula total.
```

```python
# Program pertama Python
print("Hello, Dunia!")
print("Saya mulai belajar coding!")

# Variabel
nama = "Budi"
umur = 17
print(f"Halo, nama saya {nama}, umur saya {umur} tahun")
```

**Prompt 2 — Perbandingan Syntax:**
```
Saya ingin belajar JavaScript setelah kenal Python.
Tolong buatkan tabel perbandingan:
- Cara deklarasi variabel
- Fungsi
- If-else
- For loop
Sertakan contoh kode kedua bahasa untuk perbandingan.
```

### Kategori 2: Pahami Error

**Prompt 3 — Explicar Error:**
```
Saya dapat error ini saat menjalankan Python:

Traceback (most recent call last):
  File "main.py", line 3, in <module>
    print(nilai + " tambah 5")
TypeError: unsupported operand type(s) for +: 'int' and 'str'

Tolong jelaskan:
1. Apa arti error ini dengan bahasa sederhana?
2. Kenapa error ini terjadi?
3. 3 cara memperbaikinya
4. Contoh kode yang benar
```

**Prompt 4 — Error Handling:**
```
Apa saja jenis error yang paling umum di Python untuk pemula?
Buatkan daftar 10 error, penyebab, dan cara fix dengan
contoh kode untuk masing-masing.
```

| Error Type | Penyebab | Contoh | Fix |
|-----------|----------|--------|-----|
| `SyntaxError` | Tulisan kode salah | `prit("halo")` | `print("halo")` |
| `NameError` | Variabel belum didefinisikan | `print(x)` | `x = 5` dulu |
| `TypeError` | Tipe data tidak cocok | `"5" + 3` | `int("5") + 3` |
| `IndexError` | Index di luar range | `arr[10]` di arr[3] | Cek panjang array |
| `KeyError` | Key tidak ada di dict | `d["a"]` | `d.get("a", None)` |
| `ValueError` | Value salah | `int("abc")` | `int("5")` |
| `ZeroDivisionError` | Bagi dengan nol | `10 / 0` | Validasi dulu |
| `FileNotFoundError` | File tidak ada | `open("x.csv")` | Cek path file |
| `AttributeError` | Method tidak ada | `"hello".push()` | Gunakan method yang benar |
| `ImportError` | Module tidak ada | `import numpy` | `pip install numpy` |

### Kategori 3: Belajar Bahasa Baru

**Prompt 5 — Roadmap Belajar:**
```
Saya sudah bisa Python dasar. Sekarang mau belajar
JavaScript untuk bikin website. Buatkan:
1. Roadmap belajar 30 hari
2. Topik per minggu
3. Project kecil di akhir setiap minggu
4. Resource gratis (YouTube, website)
5. Milestone yang harus dicapai
```

**Prompt 6 — Pemula ke Web Development:**
```
Sebagai pemula SMK, saya mau mulai belajar web development.
Jawab dengan roadmap yang terstruktur:
- Apa yang harus dipelajari duluan?
- HTML → CSS → JavaScript → framework?
- Berapa lama untuk bisa bikin website sederhana?
- Project apa yang realistis untuk pemula?
```

---

## 3. Debug Error dengan AI

### Kategori 4: Debug Kode

**Prompt 7 — Debug Penuh Penjelasan:**
```
Kode saya tidak berjalan benar. Data saya tidak muncul di layar.
Berikut kode lengkapnya:

\`\`\`python
data = [
    {"nama": "Andi", "nilai": 85},
    {"nama": "Budi", "nilai": 92},
    {"nama": "Citra", "nilai": 78}
]

def tampilkan_semua():
    for i in data:
        print(f"Nama: {i['nama']}, Nilai: {i['nilai']}")

def cari_nama(nama):
    for i in data:
        if i["nama"] = nama:
            return i
    return None

# Coba cari
hasil = cari_nama("Budi")
print(hasil["nama"])
\`\`\`

Minta AI untuk:
1. Identifikasi semua error
2. Jelaskan kenapa error
3. Berikan kode yang sudah diperbaiki
4. Jelaskan setiap perubahan
```

**Prompt 8 — Debug Secara Bertahap:**
```
Tolong debug kode ini step by step. Jangan langsung kasih
solusi. Tanya saya pertanyaan untuk membimbing saya menemukan
error sendiri:

\`\`\`python
def hitung_jumlah(items):
    jumlah = 0
    for item in items:
        jumlah = jumlah + item['harga'] * item['qty']
    return jumlah

keranjang = [
    {"nama": "Buku", "harga": 50000},
    {"nama": "Pensil", "harga": 5000, "qty": 3}
]

print(hitung_jumlah(keranjang))
\`\`\`
```

> 💡 **Tips:** Minta AI membimbing secara bertahap agar kamu benar-benar memahami, bukan hanya menyalin solusi.

---

## 4. Buat Function dengan AI

### Kategori 5: Membuat Function

**Prompt 9 — Function Sederhana:**
```
Ajarin saya membuat function di Python untuk:
menghitung luas dan keliling persegi panjang.

Tolong berikan:
1. Penjelasan konsep function
2. Syntax function
3. Parameter dan return value
4. Contoh kode dengan fungsi `hitung_luas` dan `hitung_keliling`
5. Cara memanggil function dengan argumen berbeda
6. Latihan: buat function untuk menghitung volume balok
```

```python
# Function menghitung luas persegi panjang
def hitung_luas(panjang, lebar):
    """Menghitung luas persegi panjang."""
    return panjang * lebar

# Function menghitung keliling
def hitung_keliling(panjang, lebar):
    """Menghitung keliling persegi panjang."""
    return 2 * (panjang + lebar)

# Memanggil function
luas = hitung_luas(10, 5)
keliling = hitung_keliling(10, 5)
print(f"Luas: {luas}")        # Output: 50
print(f"Keliling: {keliling}") # Output: 30
```

**Prompt 10 — Function dengan Validation:**
```
Buatkan versi yang lebih robust dari function di atas.
Tambahkan:
1. Validasi input (harus angka positif)
2. Default value untuk parameter
3. Error handling yang jelas
4. Docstring yang lengkap
```

```python
def hitung_luas(panjang: float, lebar: float) -> float:
    """
    Menghitung luas persegi panjang.

    Args:
        panjang (float): Panjang dalam satuan apapun
        lebar (float): Lebar dalam satuan apapun

    Returns:
        float: Luas persegi panjang

    Raises:
        ValueError: Jika input bukan angka positif
    """
    if not isinstance(panjang, (int, float)):
        raise ValueError("Panjang harus berupa angka")
    if not isinstance(lebar, (int, float)):
        raise ValueError("Lebar harus berupa angka")
    if panjang <= 0 or lebar <= 0:
        raise ValueError("Panjang dan lebar harus positif")

    return panjang * lebar
```

---

## 5. CRUD App Pertama

### Kategori 6: Membangun CRUD

**Prompt 11 — CRUD App Python:**
```
Bantu saya membuat aplikasi CRUD sederhana dengan Python:
- Manajemen data siswa (nama, NIS, kelas, nilai)
- Simpan di file CSV
- Fitur: Tambah, Lihat Semua, Cari, Update, Hapus
- Menu di terminal (console app)
- Gunakan fungsi yang modular

Berikan kode lengkap dengan penjelasan setiap bagian.
```

```python
import csv
import os

FILE_NAME = "data_siswa.csv"

# Header CSV
HEADERS = ["NIS", "Nama", "Kelas", "Nilai"]

def init_file():
    """Buat file CSV jika belum ada."""
    if not os.path.exists(FILE_NAME):
        with open(FILE_NAME, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(HEADERS)

def tambah_siswa():
    """Tambah data siswa baru."""
    nis = input("Masukkan NIS: ")
    nama = input("Masukkan Nama: ")
    kelas = input("Masukkan Kelas: ")
    nilai = input("Masukkan Nilai: ")

    with open(FILE_NAME, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([nis, nama, kelas, nilai])
    print(f"✅ Data {nama} berhasil ditambahkan!")

def lihat_semua():
    """Tampilkan semua data siswa."""
    with open(FILE_NAME, "r") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if len(rows) <= 1:
        print("📭 Belum ada data siswa.")
        return

    print(f"\n{'NIS':<10} {'Nama':<15} {'Kelas':<8} {'Nilai':<6}")
    print("-" * 42)
    for row in rows[1:]:
        print(f"{row[0]:<10} {row[1]:<15} {row[2]:<8} {row[3]:<6}")

def cari_siswa():
    """Cari siswa berdasarkan NIS atau nama."""
    keyword = input("Masukkan NIS atau Nama: ").lower()
    found = False
    with open(FILE_NAME, "r") as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        for row in reader:
            if keyword in row[0].lower() or keyword in row[1].lower():
                print(f"Ditemukan: {row[1]} (NIS: {row[0]}, "
                      f"Kelas: {row[2]}, Nilai: {row[3]})")
                found = True
    if not found:
        print("❌ Data tidak ditemukan.")

def menu():
    """Tampilkan menu utama."""
    init_file()
    while True:
        print("\n===== MENU APLIKASI SISWA =====")
        print("1. Tambah Siswa")
        print("2. Lihat Semua Siswa")
        print("3. Cari Siswa")
        print("4. Keluar")

        pilihan = input("\nPilihan (1-4): ")

        if pilihan == "1":
            tambah_siswa()
        elif pilihan == "2":
            lihat_semua()
        elif pilihan == "3":
            cari_siswa()
        elif pilihan == "4":
            print("👋 Sampai jumpa!")
            break
        else:
            print("❌ Pilihan tidak valid!")

# Jalankan aplikasi
if __name__ == "__main__":
    menu()
```

**Prompt 12 — Upgrade CRUD:**
```
Saya punya CRUD app sederhana di atas. Tolong bantu upgrade:
1. Tambah fitur Update dan Hapus
2. Validasi input (NIS harus unik)
3. Export ke Excel
4. Sortir data berdasarkan nilai
5. Tambahkan warna di terminal output
```

---

## Prompt Templates untuk Coding

Gunakan template ini sebagai starting point saat belajar coding dengan AI:

### Template: Belajar Konsep
```
Saya pemula di [BAHASA]. Jelaskan konsep [TOPIK] dengan:
1. Definisi sederhana
2. Analogi kehidupan nyata
3. Contoh kode (komentari setiap baris)
4. Latihan soal untuk saya coba
```

### Template: Debug
```
Kode [BAHASA] saya error. [PASTE KODE]

Error: [PASTE ERROR]
Yang saya harapkan: [JELASKAN]
Yang terjadi: [JELASKAN]

Tolong bantu saya pahami error-nya dan perbaiki.
Jangan langsung kasih solusi — bimbing saya langkah demi langkah.
```

### Template: Belajar Function
```
Tolong buatkan function di [BAHASA] untuk:
[FUNGSI YANG DIINGINKAN]

Sertakan:
1. Kode dengan komentar
2. Penjelasan parameter dan return
3. Contoh pemanggilan
4. Test case
```

### Template: Build App
```
Saya mau buat [TIPE APP] dengan [BAHASA].
Fitur yang dibutuhkan:
- [FITUR 1]
- [FITUR 2]
- [FITUR 3]

Tolong berikan:
1. Struktur folder
2. Kode lengkap (modular)
3. Cara menjalankan
4. Screenshot deskripsi tampilan
```

---

## Key Takeaways

1. **Mulai dengan tool gratis** — GitHub Copilot (student), ChatGPT, DeepSeek
2. **Baca error dengan sabar** — AI menjelaskan error lebih baik dari buku
3. **Bimbingan bertahap lebih baik** — minta AI membimbing, jangan langsung kasih jawaban
4. **Function adalah fondasi** — kuasai sebelum lanjut ke CRUD
5. **Bangun project nyata** — CRUD app adalah langkah pertama yang bagus
6. **Jangan malu bertanya** — AI tidak akan menghakimi pertanyaanmu

---

## Practice Exercises

1. **Hello World Challenge:** Install Python di komputermu. Buat program pertama yang menampilkan nama, tanggal lahir, dan jurusanmu.

2. **Error Hunter:** Sengaja buat 5 error berbeda dalam kode Python. Gunakan AI untuk membantu memahami dan memperbaiki setiap error.

3. **Function Builder:** Buat 3 function sederhana: menghitung luas lingkaran, konversi suhu Celsius- Fahrenheit, dan menghitung faktorial.

4. **CRUD Mini Project:** Buat aplikasi CRUD untuk data buku (judul, penulis, tahun, kategori) dengan Python. Simpan di file CSV.

5. **Upgrade Challenge:** Ambil CRUD app dari langkah 6. Tambahkan fitur baru yang diusulkan oleh AI.

---

## Next Module

👉 **Module 12: AI untuk Coding Level Lanjutan** — Membahas refactoring, arsitektur, desain database, API, testing, dan membangun full-stack application dengan bantuan AI.
