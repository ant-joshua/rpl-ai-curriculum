---
title: "Latihan Modul 15: Data Science dengan AI"
exercise_type: practice
---

# 📊 Latihan Modul 15: Data Science dengan AI

**Durasi Total:** 60–90 menit
**Tools yang Dibutuhkan:** ChatGPT/Claude, Python (Google Colab), Canva/Flourish

---

## 🎯 Tujuan Latihan

Setelah menyelesaikan latihan ini, kamu akan mampu:
- Menganalisis dataset menggunakan Python dengan bantuan AI
- Membuat berbagai jenis visualisasi data
- Membersihkan data yang kotor
- Menginterpretasi hasil analisis dengan bantuan AI
- Membangun model prediksi sederhana

---

## Exercise 1: Analisis Dataset CSV Sederhana ⭐⭐

**⏱️ Waktu: 15 menit**

### Instruksi

1. Buka [Google Colab](https://colab.research.google.com)
2. Copy dataset CSV berikut ini ke file `data_siswa.csv`:

```csv
nama,jenis_kelamin,umur,nilai_bahasa,nilai_matematika,nilai_ipa,kehadiran
Andi,Laki-laki,15,78,85,80,95
Sari,Perempuan,16,92,88,91,98
Budi,Laki-laki,15,65,72,68,80
Dewi,Perempuan,16,88,90,87,92
Eka,Perempuan,15,70,65,75,85
Fajar,Laki-laki,17,55,60,58,70
Gita,Perempuan,16,95,92,94,100
Hadi,Laki-laki,15,72,78,70,88
Indah,Perempuan,16,82,76,83,90
Joko,Laki-laki,15,60,55,62,75
```

3. Mintalah AI membantu membuat kode Python untuk:
   - Membaca dan menampilkan data
   - Menghitung rata-rata per mata pelajaran
   - Menampilkan siswa terbaik dan terlemah
   - Mengelompokkan berdasarkan jenis kelamin

### Prompt untuk AI

```
Tolong buatkan kode Python di Google Colab untuk menganalisis 
dataset CSV dengan kolom: nama, jenis_kelamin, umur, nilai_bahasa, 
nilai_matematika, nilai_ipa, kehadiran. 

Yang perlu dianalisis:
1. Tampilkan 5 baris pertama dengan head()
2. Info dataset (tipe data, non-null count)
3. Statistik deskriptif
4. Rata-rata nilai per mata pelajaran
5. Siswa dengan nilai tertinggi dan terendah
6. Perbandingan rata-rata laki-laki vs perempuan
```

### Contoh Output yang Diharapkan

```
Rata-rata Nilai:
  Bahasa    : 75.7
  Matematika: 76.1
  IPA       : 76.8

Siswa Terbaik: Gita (Rata-rata: 93.7)
Siswa Terendah: Fajar (Rata-rata: 57.7)

Rata-rata per Gender:
  Laki-laki : 72.8
  Perempuan : 85.4
```

### 💡 Tips
- Jangan langsung copy-paste kode AI, baca dan pahami dulu setiap baris
- Jika ada error, copy-paste error message ke AI dan minta perbaikan
- Simpan kode di Colab agar bisa diakses kembali

---

## Exercise 2: Buat 5 Visualisasi Berbeda ⭐⭐⭐

**⏱️ Waktu: 20 menit**

### Instruksi

Gunakan dataset yang sama, buat **5 jenis visualisasi berbeda** dengan bantuan AI.

### Prompt untuk AI

```
Buatkan kode Python untuk membuat 5 visualisasi dari dataset siswa:
1. Bar chart perbandingan rata-rata nilai per mata pelajaran
2. Pie chart distribusi jenis kelamin
3. Scatter plot hubungan umur vs nilai rata-rata
4. Box plot penyebaran nilai per mata pelajaran
5. Heatmap korelasi antar kolom numerik

Gunakan matplotlib dan seaborn. Beri warna yang menarik dan label yang jelas.
```

### Variasi Visualisasi

| No | Jenis | Kegunaan | Library |
|----|-------|----------|---------|
| 1 | Bar Chart | Perbandingan kategori | matplotlib |
| 2 | Pie Chart | Proporsi | matplotlib |
| 3 | Scatter Plot | Hubungan 2 variabel | matplotlib/seaborn |
| 4 | Box Plot | Distribusi & outlier | seaborn |
| 5 | Heatmap | Korelasi antar variabel | seaborn |

### 💡 Tips
- Pilih jenis visualisasi yang tepat untuk jenis data
- Beri judul, label sumbu, dan legend yang jelas
- Eksperimen dengan warna: gunakan `palette="viridis"` atau `palette="coolwarm"`

---

## Exercise 3: Bersihkan Data Kotor dengan AI ⭐⭐

**⏱️ Waktu: 15 menit**

### Instruksi

Gunakan dataset "kotor" berikut:

```csv
nama,umur,nilai,tanggal_lahir
andi,15,85,2009-01-15
SARI,,92,2008-05-20
budi,Lima belas,72,2009-03-10
Dewi,16,-5,2008-11-05
Eka,15,105,abc-bukan-tanggal
Fajar,15,70,2009/07/22
Gita,16,88,2008-13-45
```

### Masalah Data yang Harus Ditemukan

- [ ] Nilai kosong (missing values)
- [ ] Tipe data salah (umur tertulis sebagai teks)
- [ ] Nilai negatif dan >100 (outlier)
- [ ] Format tanggal tidak konsisten
- [ ] Nama kolom tidak seragam (huruf besar/kecil)
- [ ] Tanggal tidak valid (bulan 13, tanggal 45)

### Prompt untuk AI

```
Dataset ini punya banyak masalah. Tolong:
1. Identifikasi SEMUA masalah data quality
2. Buatkan kode Python untuk membersihkan setiap masalah
3. Jelaskan KENAPA setiap masalah perlu diperbaiki
4. Tampilkan data SEBELUM dan SESUDAH dibersihkan

Data:
[paste dataset di atas]
```

### Contoh Output yang Diharapkan

```
Masalah yang ditemukan:
1. Kolom 'nilai' ada nilai -5 dan 105 (outlier) → filter 0-100
2. Kolom 'umur' ada 'Lima belas' (tipe teks) → konversi ke numerik
3. Tanggal lahir format tidak konsisten → standarisasi YYYY-MM-DD
4. Nilai kosong pada Sari → isi dengan median atau tandai NA
5. Nama kolom tidak seragam → lowercase semua
```

### 💡 Tips
- Selalu tampilkan statistik data setelah cleaning untuk memastikan
- Tanyakan pada AI tentang trade-off: hapus baris vs isi dengan rata-rata

---

## Exercise 4: Buat Dashboard Sederhana ⭐⭐⭐

**⏱️ Waktu: 15 menit**

### Instruksi

Buat dashboard interaktif sederhana menggunakan Python atau tools no-code.

### Opsi A: Python (Streamlit)

Mintalah AI membuatkan aplikasi Streamlit sederhana:

```
Buatkan aplikasi Streamlit dashboard untuk data siswa dengan:
1. Sidebar untuk filter (jenis kelamin, rentang umur)
2. Metrik cards: total siswa, rata-rata nilai, tingkat kehadiran
3. Bar chart nilai per siswa
4. Tabel data lengkap dengan pencarian
5. Download button untuk export CSV

Buat dalam satu file Python (app.py)
```

### Opsi B: No-Code (Canva/Flourish)

1. Buka [Flourish](https://flourish.studio)
2. Upload data manual atau paste
3. Buat 3 chart: bar, pie, scatter
4. Kombinasikan dalam satu "story" presentation

### Deliverable
- Screenshot atau link dashboard yang sudah jadi
- Ceritakan insight apa yang bisa dilihat dari dashboard

---

## Exercise 5: Interpret Hasil Analisis dengan AI ⭐⭐

**⏱️ Waktu: 10 menit**

### Instruksi

Ambil hasil analisis dari Exercise 1, lalu minta AI membantu menginterpretasinya.

### Prompt untuk AI

```
Hasil analisis data siswa saya:
- Rata-rata nilai Bahasa: 75.7
- Rata-rata nilai Matematika: 76.1  
- Rata-rata nilai IPA: 76.8
- Perempuan rata-rata: 85.4, Laki-laki: 72.8
- Kehadiran berkorelasi positif dengan nilai
- Siswa Gita (perempuan, umur 16, kehadiran 100%) memiliki nilai tertinggi
- Siswa Fajar (laki-laki, umur 17, kehadiran 70%) memiliki nilai terendah

Tolong:
1. Buat interpretasi dalam bahasa Indonesia yang mudah dipahami
2. Identifikasi 3 insight menarik
3. Beri rekomendasi untuk guru
4. Buat narasi "story" dari data ini
5. Sebutkan limitasi analisis ini
```

### Contoh Output yang Diharapkan

```
INSIGHT 1: Kehadutan → Nilai
Siswa dengan kehadiran >90% rata-rata memiliki nilai 85+. 
Fajar yang hanya hadir 70% memiliki nilai terendah. 
→ Kehadiran sangat mempengaruhi performa akademik.

INSIGHT 2: Gap Gender
Perempuan (85.4) unggul 12.6 poin dari laki-laki (72.8).
→ Perlu investigasi: metode belajar, motivasi, atau faktor lain?

INSIGHT 3: IPA Unggul
IPA (76.8) sedikit lebih tinggi dari Matematika (76.1) dan 
Bahasa (75.7). → Metode pengajaran IPA mungkin lebih efektif.

REKOMENDASI:
1. Program kehadiran wajib untuk siswa yang sering bolos
2. Mentoring kelompok campuran gender
3. Evaluasi metode pengajaran Bahasa (terendah)
```

### 💡 Tips
- Selalu tanyakan "limitasi" dari analisis agar kamu memahami batasannya
- Minta AI memberikan rekomendasi yang BISA ditindaklanjuti, bukan sekadar observasi

---

## Exercise 6: ML Prediction Sederhana ⭐⭐⭐

**⏱️ Waktu: 15 menit**

### Instruksi

Buat model prediksi sederhana menggunakan **Linear Regression**.

### Prompt untuk AI

```
Buatkan kode Python untuk model prediksi sederhana:

Dataset: hubungan jam belajar vs nilai ujian
- jam_belajar: [2, 4, 6, 8, 3, 7, 1, 9, 5, 10]
- nilai_ujian: [45, 60, 72, 88, 50, 80, 35, 92, 65, 95]

Yang perlu dibuat:
1. Scatter plot data asli
2. Linear regression dengan sklearn
3. Plot garis regresi di atas scatter plot
4. Prediksi nilai untuk jam belajar = 6.5
5. Hitung R-squared score
6. Jelaskan arti dari slope dan intercept

Semua dalam Google Colab. Beri komentar di setiap langkah.
```

### Konsep yang Dipelajari

| Istilah | Arti | Contoh |
|---------|------|--------|
| **Slope (m)** | Kemiringan garis | "Setiap tambah 1 jam belajar → +7.3 nilai" |
| **Intercept (b)** | Titik potong Y | "Nilai dasar tanpa belajar = 28.5" |
| **R-squared** | Akurasi model | "97% variasi nilai bisa dijelaskan oleh jam belajar" |
| **Overfitting** | Terlalu cocok data latih | Model bagus di data latih, jelek di data baru |

### Contoh Output yang Diharapkan

```
Model: nilai = 7.3 × jam_belajar + 28.5
R² Score: 0.97 (Sangat baik!)

Prediksi untuk 6.5 jam belajar: 76.0

Interpretasi:
- Jika seorang siswa tidak belajar sama sekali, 
  diprediksi mendapat nilai ~28.5
- Setiap tambah 1 jam belajar, nilai naik ~7.3 poin
- Model ini menjelaskan 97% variasi data
```

### 💡 Tips
- Coba ganti data: hubungan salary vs pengalaman kerja
- Eksperimen: tambahkan data outlier, lihat pengaruhnya ke R²
- Tanya AI: "Kapan linear regression TIDAK cocok digunakan?"

---

## 📋 Checklist Penyelesaian

- [ ] Exercise 1: Dataset CSV berhasil dianalisis
- [ ] Exercise 2: 5 visualisasi berbeda sudah dibuat
- [ ] Exercise 3: Data kotor berhasil dibersihkan
- [ ] Exercise 4: Dashboard minimal 1 sudah jadi
- [ ] Exercise 5: Interpretasi + rekomendasi sudah ditulis
- [ ] Exercise 6: Model prediksi berjalan dengan benar

## 🏆 Penilaian

| Aspek | Bobot | Kriteria |
|-------|-------|----------|
| Kelengkapan | 30% | Semua exercise selesai |
| Kode Berjalan | 25% | Tidak ada error |
| Visualisasi | 20% | Menarik dan informatif |
| Interpretasi | 15% | Insight yang bermakna |
| Kreativitas | 10% | Eksperimen beyond instruksi |

## ⚠️ Common Pitfalls

1. **Salah paste data** — periksa format CSV sebelum analisis
2. **Library belum install** — jalankan `!pip install pandas matplotlib seaborn scikit-learn` di Colab
3. **Error tipe data** — gunakan `pd.to_numeric()` untuk konversi
4. **Tidak ada insight** — selalu tanyakan "SO WHAT?" dari hasil angka
5. **Copy-paste tanpa pahami** — baca setiap baris kode sebelum jalankan

---

> **🚀 Next Level:** Coba gunakan dataset nyata dari [Kaggle](https://kaggle.com/datasets) dan terapkan semua teknik di atas!
