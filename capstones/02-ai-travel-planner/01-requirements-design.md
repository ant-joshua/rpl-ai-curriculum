# Sesi 1: Requirements & Design — AI Travel Planner

> **Durasi:** 2 minggu (Sprint 1) | **Mode:** Individu / Kelompok (maks. 3 orang)

---

## 📋 Ringkasan

Sesi ini berfokus pada analisis kebutuhan dan perancangan AI Travel Planner. Mahasiswa akan menyusun user stories, merancang API design (RESTful), mendesain recommendation algorithm, dan membuat wireframe aplikasi. Output sesi ini adalah dokumen spesifikasi teknis yang menjadi blueprint pengembangan.

---

## 1. User Stories

### 1.1 Epic: Manajemen Trip

| ID | Sebagai | Ingin | Agar | Prioritas | Poin |
|----|---------|-------|------|-----------|------|
| US-01 | Pengguna | Mendaftar akun | Saya bisa login dan menyimpan trip | High | 2 |
| US-02 | Pengguna | Login dengan email & password | Saya mendapat akses fitur lengkap | High | 1 |
| US-03 | Pengguna | Membuat trip baru dengan destinasi, durasi, dan budget | Sistem membuat itinerary untuk saya | High | 3 |
| US-04 | Pengguna | Melihat daftar semua trip saya | Saya bisa memilih trip yang ingin diedit | Medium | 2 |
| US-05 | Pengguna | Mengupdate detail trip | Saya bisa mengubah rencana perjalanan | Medium | 2 |
| US-06 | Pengguna | Menghapus trip | Saya bisa membatalkan rencana perjalanan | Low | 1 |
| US-07 | Pengguna | Melihat detail trip lengkap dengan itinerary harian | Saya tahu rencana setiap hari | High | 3 |

### 1.2 Epic: Itinerary Management

| ID | Sebagai | Ingin | Agar | Prioritas | Poin |
|----|---------|-------|------|-----------|------|
| US-08 | Pengguna | Menambah hari perjalanan ke trip | Trip saya sesuai durasi | High | 2 |
| US-09 | Pengguna | Menambah aktivitas ke hari tertentu | Saya punya rencana detail per hari | High | 3 |
| US-10 | Pengguna | Mengubah urutan aktivitas (drag-drop) | Saya bisa atur jadwal sesuai keinginan | Medium | 3 |
| US-11 | Pengguna | Generate itinerary otomatis dengan AI | Saya tidak perlu menyusun manually | High | 8 |
| US-12 | Pengguna | Validasi budget otomatis | Saya tidak overspend | High | 3 |

### 1.3 Epic: AI Integration

| ID | Sebagai | Ingin | Agar | Prioritas | Poin |
|----|---------|-------|------|-----------|------|
| US-13 | Pengguna | Cek prakiraan cuaca per hari di destinasi | Saya bisa siapkan pakaian sesuai | Medium | 5 |
| US-14 | Pengguna | Optimasi budget per kategori | Anggaran saya teralokasi efisien | High | 5 |
| US-15 | Pengguna | Rekomendasi tempat wisata, restoran, hotel | Saya tidak perlu riset manual | High | 8 |
| US-16 | Pengguna | Generate itinerary lengkap dengan 1 klik | Semua rencana terisi otomatis | High | 8 |

---

## 2. API Design (Amadeus / Skyscanner)

### 2.1 REST API Design Principles

Base URL: `https://api.travelplanner.com/api/v1`

Standar response:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 42
  },
  "error": null
}
```

Error response:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "BUDGET_EXCEEDED",
    "message": "Total aktivitas melebihi budget trip"
  }
}
```

### 2.2 Endpoint Design

#### Auth

| Method | Endpoint | Body / Params | Response | Status |
|--------|----------|---------------|----------|--------|
| POST | /api/auth/register | `{email, password, name}` | `{user, token}` | 201 |
| POST | /api/auth/login | `{email, password}` | `{token, user}` | 200 |
| GET | /api/auth/me | Header: Bearer token | `{user}` | 200 |

#### Trips

| Method | Endpoint | Body / Params | Response | Status |
|--------|----------|---------------|----------|--------|
| GET | /api/trips | `?page=1&limit=20&status=draft` | `{trips[], meta}` | 200 |
| POST | /api/trips | `{destination, duration_days, total_budget, currency}` | `{trip}` | 201 |
| GET | /api/trips/:id | — | `{trip, days[], activities[]}` | 200 |
| PUT | /api/trips/:id | `{destination, total_budget}` | `{trip}` | 200 |
| DELETE | /api/trips/:id | — | — | 204 |

#### Trip Days & Activities

| Method | Endpoint | Body / Params | Response | Status |
|--------|----------|---------------|----------|--------|
| GET | /api/trips/:id/days | — | `{days[]}` | 200 |
| POST | /api/trips/:id/days | `{date?, notes?}` | `{day}` | 201 |
| PATCH | /api/trips/:id/days/:dayId | `{daily_budget, notes}` | `{day}` | 200 |
| DELETE | /api/trips/:id/days/:dayId | — | — | 204 |
| GET | /api/days/:dayId/activities | — | `{activities[]}` | 200 |
| POST | /api/days/:dayId/activities | `{name, category, start_time, end_time, place_name, estimated_cost}` | `{activity}` | 201 |
| PUT | /api/activities/:id | `{name, estimated_cost}` | `{activity}` | 200 |
| DELETE | /api/activities/:id | — | — | 204 |
| PATCH | /api/activities/:id/reorder | `{sort_order}` | `{activity}` | 200 |

#### AI Integration

| Method | Endpoint | Body / Params | Response | Status |
|--------|----------|---------------|----------|--------|
| POST | /api/trips/:id/generate | — | `{trip, generation_status}` | 200 |
| GET | /api/trips/:id/weather | — | `{weather[]}` | 200 |

### 2.3 External API Integration

#### Amadeus API (Flight & Hotel Search)

```typescript
// src/services/amadeus.ts
import Amadeus from 'amadeus';

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

export async function searchFlights(origin: string, destination: string, date: string) {
  const response = await amadeus.shopping.flightOffersSearch.get({
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate: date,
    adults: 1,
    currencyCode: 'IDR',
  });
  return response.data;
}

export async function searchHotels(cityCode: string) {
  const response = await amadeus.referenceData.locations.hotels.byCity.get({
    cityCode,
  });
  return response.data;
}
```

#### OpenWeather API (Weather Forecast)

```typescript
// src/services/weather.ts
const WEATHER_API = 'https://api.openweathermap.org/data/2.5';

export async function getForecast(lat: number, lon: number) {
  const res = await fetch(
    `${WEATHER_API}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
  );
  return res.json();
}
```

---

## 3. Recommendation Algorithm Design

### 3.1 AI Recommendation Flow

```
Input: destinasi, durasi, budget, preferensi
        │
        ▼
┌─────────────────────────────────────┐
│  Step 1: Weather Check              │
│  Tool: weatherCheck(location, date) │
│  Output: suhu, kondisi, rekomendasi │
└──────────────────┬──────────────────┘
                   │
┌──────────────────────────────────────┐
│  Step 2: Budget Optimization         │
│  Tool: budgetOptimizer(budget, days) │
│  Output: alokasi per hari per kategori│
└──────────────────┬───────────────────┘
                   │
┌──────────────────────────────────────────┐
│  Step 3: Place Recommendation            │
│  Tool: placeRecommender(location, type)  │
│  Output: 5 tempat + rating + estimasi    │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────────────────────────┐
│  Step 4: Itinerary Assembly          │
│  Gabung semua hasil → JSON itinerary │
└──────────────────┬───────────────────┘
                   │
                   ▼
        Itinerary: array of days
        masing-masing day punya activities
```

### 3.2 Algorithm Detail

#### Weather Check

```
Function weatherCheck(location, date[]):
  For each date:
    - Fetch forecast from OpenWeather API
    - Parse suhu, kondisi (cerah, hujan, berawan)
    - Generate rekomendasi pakaian:
      IF suhu > 30°C → "Bawa topi dan sunscreen"
      IF suhu < 20°C → "Bawa jaket"
      IF kondisi = "hujan" → "Bawa payung"
  Return {daily_forecasts[], recommendations[]}
```

#### Budget Optimizer

```
Function budgetOptimizer(totalBudget, durationDays, preferences):
  baseAllocation = {
    accommodation: 0.40,  // 40%
    food: 0.20,           // 20%
    transport: 0.20,      // 20%
    activities: 0.15,     // 15%
    buffer: 0.05          // 5%
  }
  
  // Adjust based on preferences
  IF preferences.priority = "food" THEN
    food = 0.30, accommodation = 0.30
  
  perDay = totalBudget / durationDays
  
  For each day:
    allocate(perDay × baseAllocation)
  
  Return {daily_allocations[], total}
```

#### Place Recommender

```
Function placeRecommender(location, category, maxResults=5):
  // Gunakan Google Places API atau database lokal
  places = queryDatabase(location, category)
  
  // Sort by rating (descending)
  places.sort(by: rating, order: desc)
  
  // Ambil top-k
  return places[0:maxResults]
```

### 3.3 Scoring & Ranking

Setiap tempat wisata memiliki skor komposit:

```
score = (rating × 0.4) + (popularity × 0.3) + (budget_fit × 0.2) + (distance × 0.1)
```

- **rating**: dari user reviews (0-5)
- **popularity**: jumlah kunjungan (dinormalisasi 0-1)
- **budget_fit**: apakah biaya masuk sesuai budget harian (0 atau 1)
- **distance**: jarak dari hotel/akomodasi (invers, 1 = dekat)

---

## 4. Wireframe Design

### 4.1 Halaman Utama

```
┌─────────────────────────────────────────┐
│  Logo          [Login] [Register]       │
├─────────────────────────────────────────┤
│                                         │
│  ✈️ Rencanakan Perjalanan Anda          │
│                                         │
│  [Destinasi: _____________]             │
│  [Durasi: ___ hari] [Budget: Rp ____]   │
│                                         │
│  [✨ Generate Itinerary]                │
│                                         │
└─────────────────────────────────────────┘
```

### 4.2 Dashboard Trip

```
┌─────────────────────────────────────────┐
│  ← Dashboard               [+ Trip Baru]│
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ✈️ Liburan ke Bali              │   │
│  │ 5 Hari • Rp 5.000.000 • Active  │   │
│  │ [Lihat Detail] [Edit] [Hapus]   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ✈️ Trip ke Yogyakarta           │   │
│  │ 3 Hari • Rp 2.000.000 • Draft   │   │
│  │ [Lihat Detail] [Edit] [Hapus]   │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 4.3 Detail Trip & Itinerary

```
┌─────────────────────────────────────────┐
│  ← Bali (5 Hari)          [Generate AI]│
├─────────────────────────────────────────┤
│  Budget: Rp 5.000.000                    │
│  Sisa: Rp 450.000                        │
├─────────────────────────────────────────┤
│  📅 Hari 1 — Senin, 12 Jan             │
│  ┌─────────────────────────────────┐   │
│  │ 🏨 Check-in Hotel       Rp 500k │   │
│  │ 🍜 Makan Siang          Rp 100k │   │
│  │ 🏖️ Pantai Kuta          Rp 0    │   │
│  │ 🍽️ Makan Malam         Rp 150k │   │
│  │ ↔ [Drag to reorder]             │   │
│  └─────────────────────────────────┘   │
│  [+ Tambah Aktivitas]                 │
│                                         │
│  📅 Hari 2 — Selasa, 13 Jan           │
│  ...                                   │
└─────────────────────────────────────────┘
```

### 4.4 Generate Itinerary Modal

```
┌─────────────────────────────────────────┐
│  ✨ Generate Itinerary AI              │
├─────────────────────────────────────────┤
│                                         │
│  🤖 AI sedang menganalisis...          │
│                                         │
│  ☀️ Cek cuaca... ✅ 5 hari cerah       │
│  💰 Optimasi budget... ✅              │
│  📍 Cari tempat... ✅ 12 tempat        │
│  📋 Susun itinerary... ✅               │
│                                         │
│  [🔥 Lihat Hasil]                       │
└─────────────────────────────────────────┘
```

---

## 5. Latihan

> **Latihan 1:** User Story Mapping
> Buat user story map untuk fitur generate itinerary. Sisi kiri: aktivitas utama pengguna. Sisi kanan: breakdown teknis. Estimasi story points dengan Fibonacci (1, 2, 3, 5, 8, 13).

> **Latihan 2:** API Contract Documentation
> Tulis API contract untuk endpoint `POST /api/trips/:id/generate`. Sertakan: request body, response body (success + error), status codes, validation rules. Gunakan format OpenAPI 3.0 YAML.

> **Latihan 3:** External API Research
> Riset 3 API eksternal untuk travel: Amadeus (flight), OpenWeather (cuaca), Google Places (tempat). Buat tabel perbandingan: fitur gratis, rate limit, pricing, dokumentasi. Tentukan mana yang dipakai.

> **Latihan 4:** Recommendation Algorithm Pseudocode
> Tulis pseudocode untuk `budgetOptimizer` function. Sertakan: parameter input, langkah-langkah alokasi, edge cases (budget terlalu kecil, durasi 0), return format.

> **Latihan 5:** Wireframe Low-Fidelity
> Buat wireframe untuk 3 halaman: login/register, dashboard trips, detail trip + itinerary. Gunakan Excalidraw atau ASCII art. Tentukan layout, komponen, dan alur navigasi.

> **Latihan 6:** Data Model Design
> Rancang tabel `trips`, `trip_days`, dan `activities` lengkap dengan kolom, tipe data, constraints, foreign keys, dan indexes. Tulis dalam format SQL DDL.

> **Latihan 7:** Product Requirements Document
> Buat PRD 1 halaman untuk AI Travel Planner. Tentukan: 3 masalah utama, target pengguna, 5 fitur prioritas, success metrics (misal: waktu penyusunan itinerary turun 80%).

---

## 💡 Tips

- **API-first**: Desain API contract sebelum coding. Gunakan Swagger/OpenAPI untuk dokumentasi.
- **Mock external API**: Gunakan tools seperti Mockoon atau JSON Server untuk simulasi API eksternal.
- **Wireframe dulu**: Jangan langsung coding UI. Wireframe membantu tim visualize alur.
- **Prioritaskan alur generate**: Fitur AI generate adalah USP (Unique Selling Point) proyek ini.

---

| [← Kembali ke README](README.md) | [Lanjut ke Sesi 2: Frontend & Backend →](02-frontend-backend.md) |
|---|---|
