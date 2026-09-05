---
title: "AI untuk Data Science"
module: 15
course: "ai-complete-course"
---

# 📊 Modul 15: AI untuk Data Science

> Pelajari cara memanfaatkan AI untuk analisis data, visualisasi, dan machine learning — tanpa harus jago coding!

## 🎯 Tujuan Pembelajaran

Setelah modul ini, Anda akan bisa:
- Menggunakan AI (ChatGPT, Copilot) untuk menulis kode analisis data
- Membersihkan dan memproses data dengan bantuan AI
- Membuat visualisasi data yang menarik
- Memahami dasar machine learning dengan bantuan AI
- Membuat dashboard data sederhana

## 📌 Mengapa Data Science + AI?

Data Science adalah salah satu bidang yang **paling terdampak** oleh AI. Sebelum AI, analis data harus:
- Menulis kode Python/R dari nol
- Membaca dokumentasi library yang panjang
- Trial and error untuk visualisasi

**Sekarang dengan AI**: Anda bisa meminta AI menulis kode analisis, memperbaiki bug, dan menjelaskan hasilnya dalam bahasa manusia.

> 💡 **Insight**: ChatGPT Code Interpreter (Advanced Data Analysis) bisa menganalisis file CSV/Excel langsung tanpa coding!

### 🔄 Data Science Workflow

```
┌───────────────────────────────────────────────────────────────┐
│              DATA SCIENCE PIPELINE                            │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  📥 COLLECT ──→ 🧹 CLEAN ──→ 📊 ANALYZE ──→ 📈 VISUALIZE    │
│       │                                            │          │
│       │            ┌───────────────────┐           │          │
│       │            │   📝 REPORT        │←──────────┘          │
│       │            └───────────────────┘                      │
│       │                    │                                  │
│       │                    ↓                                  │
│       │            ┌───────────────────┐                      │
│       │            │ 🤖 AI ASSISTED?   │                      │
│       │            │  Ya! 80% faster   │                      │
│       │            └───────────────────┘                      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

> ⚡ **Setiap langkah bisa dipermudah dengan AI** — dari mengumpulkan data hingga membuat laporan!

## 🔧 Tools yang Digunakan

### 🐍 Python Data Stack

```
┌───────────────────────────────────────────────────────────┐
│              🐍 PYTHON DATA SCIENCE STACK                 │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  📦 pandas   │  │  🔢 numpy    │  │ 📊 matplotlib│     │
│  │  Data Frame  │  │  Angka &    │  │  Chart &    │      │
│  │  Manipulation│  │  Komputasi  │  │  Grafik     │      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
│         │                │                │               │
│         └────────────────┼────────────────┘               │
│                          │                                │
│                    ┌─────┴─────┐                          │
│                    │  🌊 seaborn│                          │
│                    │  Statistical│                         │
│                    │  Visualization│                       │
│                    └─────┬─────┘                          │
│                          │                                │
│                    ┌─────┴─────┐                          │
│                    │ 🤖 scikit-learn│                     │
│                    │  Machine Learning│                    │
│                    └───────────┘                          │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

| Tool | Fungsi | Gratis? |
|---|---|---|
| Google Colab | Python notebook online | ✅ Ya |
| ChatGPT Code Interpreter | Analisis data dengan AI | ✅ Freemium |
| Julius AI | AI data analyst | ✅ Freemium |
| pandas | Library data manipulation Python | ✅ Ya |
| matplotlib/seaborn | Visualisasi data Python | ✅ Ya |
| scikit-learn | Machine learning Python | ✅ Ya |

## 📖 Bagian 1: Analisis Data dengan AI

### 1.1 Setup Google Colab

Google Colab adalah notebook Python online yang **gratis** — cocok untuk mulai belajar data science.

```
1. Buka colab.research.google.com
2. Login dengan akun Google
3. Klik "New notebook"
4. Siap digunakan!
```

### 1.2 Import Library & Load Data

**Prompt untuk AI:**
```
Buatkan kode Python di Google Colab untuk:
1. Import pandas
2. Baca file CSV bernama "data_penjualan.csv"
5. Tampilkan 5 baris pertama
6. Tampilkan info dataset (tipe data, null values)
```

**Kode yang dihasilkan AI:**
```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load data
df = pd.read_csv("data_penjualan.csv")

# Tampilkan 5 baris pertama
print("=== 5 Baris Pertama ===")
print(df.head())

# Info dataset
print("\n=== Info Dataset ===")
print(df.info())

# Statistik deskriptif
print("\n=== Statistik Deskriptif ===")
print(df.describe())
```

### 1.3 Eksplorasi Data (EDA)

**Prompt untuk AI:**
```
Analisis dataset penjualan ini. Berikan saya:
1. Jumlah baris dan kolom
2. Kolom dengan missing value terbanyak
3. Distribusi data numerik
4. Insight bisnis dari data
```

**Prompt untuk menemukan pola:**
```
Buatkan kode untuk mencari:
1. 5 produk terlaris
2. Bulan dengan penjualan tertinggi
3. Korelasi antar kolom numerik
4. Outlier pada data penjualan
```

## 📖 Bagian 2: Data Cleaning dengan AI

Data cleaning (pembersihan data) adalah langkah kritis — dan AI sangat membantu di sini.

### 2.1 Identifikasi Masalah Data

**Prompt untuk AI:**
```
Dataset saya punya masalah berikut:
- Kolom "harga" ada yang bertipe string (ada simbol Rp)
- Kolom "tanggal" formatnya tidak konsisten
- Ada duplikat data
- Missing value di kolom "kategori"

Buatkan kode Python untuk membersihkan semua masalah ini.
```

**Kode hasil AI:**
```python
# Bersihkan kolom harga
df['harga'] = df['harga'].str.replace('Rp', '').str.replace('.', '').str.replace(',', '.')
df['harga'] = pd.to_numeric(df['harga'], errors='coerce')

# Standarisasi format tanggal
df['tanggal'] = pd.to_datetime(df['tanggal'], infer_datetime_format=True, errors='coerce')

# Hapus duplikat
print(f"Sebelum: {len(df)} baris")
df = df.drop_duplicates()
print(f"Sesudah: {len(df)} baris")

# Isi missing value
df['kategori'].fillna('Lainnya', inplace=True)

# Cek hasil
print(f"Missing values setelah cleaning:")
print(df.isnull().sum())
```

### 2.2 Tips Data Cleaning

| Masalah | Solusi AI | Contoh Prompt |
|---|---|---|
| Tipe data salah | Konversi otomatis | "Konversi kolom X ke tipe data Y" |
| Missing value | Imputasi | "Isi missing value dengan median/rata-rata" |
| Duplikat | Hapus | "Hapus baris duplikat, pertahankan yang pertama" |
| Format tidak konsisten | Standarisasi | "Standarisasi format email/telepon" |
| Outlier | Deteksi & handle | "Deteksi outlier dengan IQR, beri opsi handle" |

## 📖 Bagian 3: Visualisasi Data dengan AI

### 3.1 Membuat Chart dengan Prompt

**Prompt untuk bar chart:**
```
Buatkan kode matplotlib/seaborn untuk membuat:
1. Bar chart top 10 produk terlaris
2. Line chart tren penjualan per bulan
3. Pie chart distribusi kategori
4. Heatmap korelasi antar variabel

Gunakan style yang modern dan warna yang menarik.
```

**Kode hasil AI:**
```python
# Set style
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

# 1. Bar chart top 10 produk
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

top_products = df.groupby('produk')['total_penjualan'].sum().nlargest(10)
axes[0, 0].barh(top_products.index, top_products.values, color=sns.color_palette("viridis", 10))
axes[0, 0].set_title('Top 10 Produk Terlaris', fontsize=14, fontweight='bold')
axes[0, 0].set_xlabel('Total Penjualan (Rp)')

# 2. Line chart tren bulanan
monthly = df.groupby(df['tanggal'].dt.to_period('M'))['total_penjualan'].sum()
axes[0, 1].plot(monthly.index.astype(str), monthly.values, marker='o', linewidth=2)
axes[0, 1].set_title('Tren Penjualan per Bulan', fontsize=14, fontweight='bold')
axes[0, 1].tick_params(axis='x', rotation=45)

# 3. Pie chart kategori
kategori = df['kategori'].value_counts()
axes[1, 0].pie(kategori, labels=kategori.index, autopct='%1.1f%%', startangle=90)
axes[1, 0].set_title('Distribusi Kategori', fontsize=14, fontweight='bold')

# 4. Heatmap korelasi
numeric_df = df.select_dtypes(include='number')
sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', center=0, ax=axes[1, 1])
axes[1, 1].set_title('Korelasi Variabel', fontsize=14, fontweight='bold')

plt.tight_layout()
plt.savefig('dashboard_penjualan.png', dpi=150, bbox_inches='tight')
plt.show()
```

### 3.2 Prompt untuk Visualisasi Spesifik

| Kebutuhan | Prompt yang Efektif |
|---|---|
| Membandingkan data | "Buatkan grouped bar chart untuk membandingkan A vs B per kategori" |
| Melihat distribusi | "Buatkan histogram + KDE plot untuk kolom X, tambahkan mean & median line" |
| Melihat tren | "Line chart dengan trendline dan area shading untuk visualisasi yang jelas" |
| Komposisi | "Stacked bar chart atau treemap untuk menunjukkan komposisi data" |
| Korelasi | "Scatter plot dengan regression line, warna berdasarkan kategori" |

## 📖 Bagian 4: Statistical Analysis dengan AI

### 4.1 Analisis Statistik Dasar

**Prompt untuk AI:**
```
Lakukan analisis statistik untuk dataset ini:
1. Uji normalitas (Shapiro-Wilk)
2. Korelasi Pearson antar variabel numerik
3. Uji t-test untuk membandingkan dua grup
4. ANOVA untuk membandingkan lebih dari dua grup
5. Regresi linier sederhana

Jelaskan arti dari setiap hasil dalam bahasa sederhana.
```

**Kode hasil AI:**
```python
from scipy import stats
import numpy as np

# 1. Uji Normalitas
stat, p_value = stats.shapiro(df['harga'].dropna())
print(f"Shapiro-Wilk Test: stat={stat:.4f}, p={p_value:.4f}")
print(f"  -> Data {'Normal' if p_value > 0.05 else 'Tidak Normal'} (α=0.05)")

# 2. Korelasi Pearson
corr_matrix = numeric_df.corr(method='pearson')
print("\n=== Korelasi Pearson ===")
print(corr_matrix)

# 3. Uji t-test
grup_a = df[df['kategori'] == 'Elektronik']['harga']
grup_b = df[df['kategori'] == 'Fashion']['harga']
t_stat, p_val = stats.ttest_ind(grup_a.dropna(), grup_b.dropna())
print(f"\nt-test: t={t_stat:.4f}, p={p_val:.4f}")
print(f"  -> Perbedaan {'signifikan' if p_val < 0.05 else 'tidak signifikan'}")

# 4. Regresi Linier
from sklearn.linear_model import LinearRegression
X = df[['quantity']].dropna()
y = df.loc[X.index, 'total_penjualan']
model = LinearRegression().fit(X, y)
print(f"\nRegresi: y = {model.coef_[0]:.2f}x + {model.intercept_:.2f}")
print(f"R² Score: {model.score(X, y):.4f}")
```

### 4.2 Memahami Hasil Analisis

**Prompt untuk menjelaskan hasil:**
```
Berikut hasil analisis statistik saya:
[paste hasil kode di atas]

Tolong jelaskan dalam bahasa sederhana:
1. Apa arti p-value ini?
2. Apakah korelasi ini kuat atau lemah?
3. Apa rekomendasi bisnis dari hasil ini?
```

## 📖 Bagian 5: Machine Learning Basics dengan AI

### 🤖 ML Pipeline

```
┌───────────────────────────────────────────────────────────────┐
│                 MACHINE LEARNING PIPELINE                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  📥 DATA ──→ 🔧 FEATURE ──→ 🏋️ TRAIN ──→ 📏 EVALUATE        │
│     │        ENGINEERING      MODEL        MODEL             │
│     │            │               │             │             │
│     ↓            ↓               ↓             ↓             │
│  ┌──────┐   ┌──────┐       ┌──────┐      ┌──────┐          │
│  │ CSV/ │   │Scale/│       │Random│      │Acc:  │          │
│  │ Excel│   │Encode│       │Forest│      │ 92%  │          │
│  │ Data │   │Select│       │ XGB  │      │  ✅  │          │
│  └──────┘   └──────┘       └──────┘      └──┬───┘          │
│                                              │               │
│                                        ┌─────┴─────┐        │
│                                        │ 🚀 DEPLOY  │        │
│                                        │  Prediksi  │        │
│                                        └───────────┘        │
│                                                               │
│  💡 AI bisa membantu di SETIAP langkah pipeline ini!          │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 5.1 Prediksi dengan AI

> 🎯 **AI mempermudah ML** — Anda cukup jelaskan masalah, AI akan buatkan kode pipeline-nya!

```
Buatkan kode machine learning sederhana untuk:
- Target: prediksi apakah pelanggan akan beli lagi (churn prediction)
- Features: usia, total_pembelian, frekuensi_beli, rata_rata_nilai
- Model: Random Forest Classifier
- Tambahkan: train/test split, accuracy, confusion matrix, classification report
```

**Kode hasil AI:**
```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder

# Persiapan data
features = ['usia', 'total_pembelian', 'frekuensi_beli', 'rata_rata_nilai']
X = df[features].dropna()
y = df.loc[X.index, 'churn']  # 1 = churn, 0 = tidak churn

# Encode target jika string
if y.dtype == 'object':
    le = LabelEncoder()
    y = le.fit_transform(y)

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Prediksi
y_pred = model.predict(X_test)

# Evaluasi
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2%}")
print(f"\nConfusion Matrix:\n{confusion_matrix(y_test, y_pred)}")
print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")

# Feature importance
importance = pd.Series(model.feature_importances_, index=features)
print(f"\nFeature Importance:\n{importance.sort_values(ascending=False)}")
```

### 5.2 Jenis ML yang Perlu Diketahui

| Tipe | Kegunaan | Contoh | Prompt AI |
|---|---|---|---|
| **Classification** | Mengelompokkan data | Spam detection | "Buat classifier untuk email spam" |
| **Regression** | Memprediksi angka | Harga rumah | "Prediksi harga rumah berdasarkan fitur" |
| **Clustering** | Mengelompokkan tanpa label | Customer segmentation | "Segmentasi pelanggan dengan K-Means" |
| **Time Series** | Prediksi waktu | Forecast penjualan | "Forecast penjualan 3 bulan ke depan" |

## 📖 Bagian 6: Dashboard Creation

### 📊 Dashboard Layout Wireframe

```
┌───────────────────────────────────────────────────────────────┐
│                   📊 DASHBOARD LAYOUT                         │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                    │
│  │ 📈 KPI │ │ 📉 KPI │ │ 📊 KPI │ │ 🎯 KPI │                   │
│  │Total  │ │Growth │ │Target │ │Score  │                    │
│  │Row 1  │ │Row 2  │ │Row 3  │ │Row 4  │                    │
│  └───────┘ └───────┘ └───────┘ └───────┘                    │
│  ───────────────────────────────────────────────────────────  │
│                                                               │
│  ┌─────────────────────┐ ┌─────────────────────┐            │
│  │                     │ │                     │            │
│  │   📊 BAR CHART      │ │   📈 LINE CHART      │            │
│  │   Top Products     │ │   Tren Bulanan       │            │
│  │                     │ │                     │            │
│  └─────────────────────┘ └─────────────────────┘            │
│  ───────────────────────────────────────────────────────────  │
│                                                               │
│  ┌─────────────────────┐ ┌─────────────────────┐            │
│  │                     │ │                     │            │
│  │   🍩 PIE CHART      │ │   🔥 HEATMAP         │            │
│  │   Kategori         │ │   Korelasi           │            │
│  │                     │ │                     │            │
│  └─────────────────────┘ └─────────────────────┘            │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   📋 RAW DATA TABLE                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

> 🎨 **Desain dashboard**: KPI cards di atas → Chart utama di tengah → Detail data di bawah

### 6.1 Dashboard dengan Streamlit

**Prompt untuk AI:**
```
Buatkan dashboard interaktif menggunakan Streamlit yang:
1. Upload CSV file
2. Tampilkan statistik ringkasan
3. Interaktif: user bisa pilih kolom untuk chart
4. Tampilkan 4 chart: bar, line, scatter, histogram
5. Export hasil analisis

Buat dalam satu file Python yang bisa langsung dijalankan.
```

**Kode hasil AI (app.py):**
```python
import streamlit as st
import pandas as pd
import plotly.express as px

st.set_page_config(page_title="AI Data Dashboard", layout="wide")
st.title("📊 AI Data Dashboard")

# Upload file
uploaded_file = st.file_uploader("Upload CSV", type=['csv', 'xlsx'])

if uploaded_file:
    df = pd.read_csv(uploaded_file)
    
    # Statistik ringkasan
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Baris", f"{len(df):,}")
    col2.metric("Total Kolom", len(df.columns))
    col3.metric("Missing Values", f"{df.isnull().sum().sum():,}")
    col4.metric("Duplikat", f"{df.duplicated().sum():,}")
    
    # Pilihan kolom
    numeric_cols = df.select_dtypes(include='number').columns.tolist()
    categorical_cols = df.select_dtypes(include='object').columns.tolist()
    
    # Chart selection
    chart_type = st.selectbox("Pilih Chart", ["Bar", "Line", "Scatter", "Histogram", "Box Plot"])
    x_col = st.selectbox("X Axis", df.columns)
    y_col = st.selectbox("Y Axis", numeric_cols)
    
    # Generate chart
    if chart_type == "Bar":
        fig = px.bar(df, x=x_col, y=y_col)
    elif chart_type == "Scatter":
        fig = px.scatter(df, x=x_col, y=y_col)
    elif chart_type == "Histogram":
        fig = px.histogram(df, x=x_col)
    elif chart_type == "Box Plot":
        fig = px.box(df, x=x_col, y=y_col)
    else:
        fig = px.line(df, x=x_col, y=y_col)
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Tampilkan data
    st.subheader("📋 Raw Data")
    st.dataframe(df, use_container_width=True)
```

Jalankan dengan:
```bash
pip install streamlit pandas plotly
streamlit run app.py
```

## 📖 Bagian 7: Prompt Templates untuk Data Science

### Template Analisis Data
```
Saya punya dataset [JENIS_DATA] dengan [N] baris dan [M] kolom.
Kolom-kolomnya: [DAFTAR_KOLOM]

Tolong analisis:
1. [PERINTAH_ANALISIS_1]
2. [PERINTAH_ANALISIS_2]
3. [PERINTAH_ANALISIS_3]

Gunakan Python pandas dan berikan insight bisnis dari hasilnya.
```

### Template Machine Learning
```
Saya ingin membangun model [JENIS_ML] untuk [TUJUAN].

Dataset saya:
- Nama kolom: [DAFTAR_KOLOM]
- Target variabel: [KOLOM_TARGET]
- Ukuran data: [N] baris

Buatkan pipeline lengkap:
1. Preprocessing
2. Feature engineering
3. Model training
4. Evaluasi
5. Interpretasi hasil

Gunakan scikit-learn dan jelaskan setiap langkah.
```

### Template Dashboard
```
Buatkan dashboard [TOOLS] yang menampilkan:
1. [METRIK_1]
2. [CHART_1]
3. [CHART_2]

Data saya berasal dari [SUMBER_DATA].
Desain harus [DESKRIPSI_DESIGN].
```

## 💡 Tips & Best Practices

1. **Selalu mulai dari EDA** — Pahami data sebelum analisis
2. **Gunakan ChatGPT untuk debugging** — Paste error, AI akan bantu fix
3. **Simpan prompt yang berhasil** — Buat library prompt sendiri
4. **Validasi hasil AI** — Selalu cek apakah hasil masuk akal
5. **Mulai dari yang sederhana** — Jangan langsung ML, mulai dari cleaning & viz
6. **Google Colab gratis** — Gunakan GPU gratis untuk training model besar
7. **Bangun portfolio** — Simpan analisis terbaik di GitHub

## 🔑 Key Takeaways

- AI bisa menulis kode Python untuk analisis data — Anda cukup jelaskan apa yang mau dianalisis
- Google Colab memberikan Python + GPU gratis untuk mulai belajar data science
- Data cleaning adalah langkah paling penting (dan paling sering dilupakan)
- Visualisasi yang baik bercerita — gunakan prompt untuk meminta AI membuat chart yang informatif
- Machine Learning bukan magi — pahami dulu data sebelum membangun model
- Prompt yang spesifik menghasilkan kode yang lebih baik

## ✏️ Practice Exercises

### Exercise 1: Analisis Dataset Sendiri
Download dataset dari [kaggle.com](https://kaggle.com) (misal: dataset penjualan toko online). Upload ke Google Colab, lalu:
- Buat summary statistics
- Buat minimal 3 jenis chart
- Tulis 3 insight bisnis dari hasil analisis

### Exercise 2: Data Cleaning Pipeline
Buat dataset "sampah" (data yang banyak error):
- Missing values, duplikat, tipe data salah
- Buat cleaning pipeline menggunakan prompt AI
- Bandingkan data sebelum dan sesudah cleaning

### Exercise 3: Dashboard Interaktif
Gunakan prompt template dashboard untuk membuat Streamlit app:
- Upload ke Streamlit Cloud (gratis)
- Bagikan link ke teman
- Minta feedback dan improve

### Exercise 4: Machine Learning Pertama
Buat model prediksi sederhana:
- Pilih dataset dari Kaggle (misal: Titanic survival, House prices)
- Gunakan prompt template ML
- Jelaskan hasil model dalam bahasa Indonesia

### Exercise 5: Analisis dengan ChatGPT Code Interpreter
Upload dataset ke ChatGPT ( Advanced Data Analysis):
- Minta AI menganalisis tanpa coding
- Bandingkan hasilnya dengan analisis manual di Colab
- Catat kelebihan dan kekurangan masing-masing

## 🔗 Sumber Tambahan

- [Pandas Documentation](https://pandas.pydata.org/docs/) — Dokumentasi resmi pandas
- [Kaggle Learn](https://www.kaggle.com/learn) — Kursus data science gratis
- [Google Colab Tutorials](https://colab.research.google.com/notebooks/intro.ipynb) — Tutorial resmi Colab
- [Scikit-learn Documentation](https://scikit-learn.org/stable/) — Dokumentasi machine learning
- [Streamlit Gallery](https://streamlit.io/gallery) — Contoh dashboard untuk inspirasi

---

**⬅️ [Modul 14: AI untuk Bahasa & Terjemahan](14-ai-untuk-bahasa-dan-terjemahan.md) | [Modul 16: AI untuk Bahasa Asing](16-ai-untuk-bahasa-asing.md) ➡️**
