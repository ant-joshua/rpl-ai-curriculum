<img src="https://images.pexels.com/photos/1482193/pexels-photo-1482193.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&dpr=1" alt="AI Travel Planner" style="width:100%;border-radius:12px;margin:12px 0;">

# ✈️ AI Travel Planner — Showcase Project

> **Contoh hasil jadi Capstone 2: AI Travel Planner**
> Aplikasi perencana perjalanan cerdas dengan agen AI yang generate itinerary, cek cuaca, optimasi budget, dan rekomendasi tempat.

| Metadata | Detail |
|----------|--------|
| **Level** | 🚀 Advanced |
| **Tipe** | Kelompok (2-3 orang) |
| **Durasi** | 8 minggu (4 sprint × 2 minggu) |
| **Stack Utama** | React + Vite, Express, Mastra AI, OpenAI, Weather API |
| **Demo** | [🔗 Live Demo](#) *(isi dengan URL deployment)* |
| **GitHub** | [📦 Repository](#) *(isi dengan URL repo)* |

---

## 📸 Screenshot

<img src="https://via.placeholder.com/800x450/1a1a2e/e0e0e0?text=AI+Travel+Planner+-+Dashboard" alt="Dashboard" style="border-radius:8px;width:100%;max-width:800px;">
<img src="https://via.placeholder.com/800x450/16213e/e0e0e0?text=Itinerary+Generator+AI" alt="Itinerary Generator" style="border-radius:8px;width:100%;max-width:800px;margin-top:8px;">
<img src="https://via.placeholder.com/800x450/0f3460/e0e0e0?text=Weather+%26+Budget+Planner" alt="Weather & Budget" style="border-radius:8px;width:100%;max-width:800px;margin-top:8px;">

---

## 🏗️ Arsitektur Sistem

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React + Vite)                             │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐                 │
│  │ Dashboard    │  │ Trip Detail      │  │ Generate     │                 │
│  │ (daftar trip)│  │ (itinerary per   │  │ Itinerary    │                 │
│  │              │  │  hari + aktivitas│  │ (loading +   │                 │
│  └──────────────┘  └──────────────────┘  │  result)     │                 │
│                                           └──────────────┘                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐                 │
│  │ Auth Pages   │  │ Weather View     │  │ Budget       │                 │
│  │ (login/      │  │ (cuaca per hari) │  │ Calculator   │                 │
│  │  register)   │  │                  │  │ (visualisasi)│                 │
│  └──────────────┘  └──────────────────┘  └──────────────┘                 │
└──────────────────────────┬────────────────────────────────────────────────┘
                           │ HTTP + JSON
                           ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS API SERVER                                 │
│                                                                            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌────────────────┐   │
│  │ Auth Routes │  │ Trip Routes  │  │ AI Routes  │  │ Middleware     │   │
│  │ /api/auth   │  │ /api/trips   │  │ /api/ai/*  │  │ - auth (JWT)   │   │
│  │             │  │ /api/days    │  │            │  │ - rate limit   │   │
│  │             │  │ /api/activities │            │  │ - validation   │   │
│  └─────────────┘  └──────┬───────┘  └──────┬─────┘  │ - error handler│   │
│                          │                  │        └────────────────┘   │
│                          ▼                  ▼                              │
│              ┌────────────────────────────────────────┐                    │
│              │          Mastra Agent Layer            │                    │
│              │                                        │                    │
│              │  ┌──────────────────────────────────┐  │                    │
│              │  │       Travel Planner Agent       │  │                    │
│              │  │  - weatherCheck tool             │  │                    │
│              │  │  - budgetOptimizer tool          │  │                    │
│              │  │  - placeRecommender tool         │  │                    │
│              │  └──────────────┬───────────────────┘  │                    │
│              │                                        │                    │
│              │         ┌──────┴──────┐                │                    │
│              │         │    OpenAI   │                │                    │
│              │         │  GPT-4o-mini│                │                    │
│              │         └─────────────┘                │                    │
│              └────────────────────────────────────────┘                    │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────┐           │
│  │                   Database Layer (Prisma)                  │           │
│  │  ┌───────┐  ┌──────────┐  ┌────────────┐  ┌───────────┐  │           │
│  │  │ users │  │  trips   │  │  trip_days │  │activities │  │           │
│  │  └───────┘  └──────────┘  └────────────┘  └───────────┘  │           │
│  └────────────────────────────────────────────────────────────┘           │
└────────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL Database                                │
│  trips ──< trip_days ──< activities                                        │
│  users ──< trips                                                           │
└────────────────────────────────────────────────────────────────────────────┘

EXTERNAL API INTEGRATIONS:
┌─────────────────┐  ┌────────────────┐  ┌──────────────────┐
│  OpenWeather    │  │  Google Places │  │  OpenAI          │
│  API            │  │  API (opsional)│  │  (LLM + Embed)   │
│  → weatherCheck │  │  → placeRec.  │  │  → Agent core     │
│    tool         │  │    tool        │  │    reasoning       │
└─────────────────┘  └────────────────┘  └──────────────────┘
```

### Alur Generate Itinerary

```
User klik "Generate Itinerary" untuk trip yang sudah dibuat
        │
        ▼
Frontend → POST /api/trips/:id/generate
        │
        ▼
Express API — ambil data trip dari DB (destinasi, durasi, budget)
        │
        ▼
Mastra TravelAgent — execute dengan prompt terstruktur
        │
        ├── 1. weatherCheck("Yogyakarta", "2025-08-10") → suhu 28°C, cerah
        │       └── cache result ke DB (weather_data)
        │
        ├── 2. budgetOptimizer(2000000, 3, {food: "high"})
        │       └── return alokasi per hari
        │
        ├── 3. placeRecommender("Yogyakarta", "attraction")
        │       └── return rekomendasi tempat wisata
        │
        └── 4. LLM synthesize → itinerary JSON lengkap
        │
        ▼
Parse JSON response → insert trip_days + activities ke DB
        │
        ▼
Return itinerary lengkap → React UI render per hari
```

---

## ✨ Fitur Unggulan

### 1. 🤖 Itinerary Generator (AI-powered)

Generate rencana perjalanan harian secara otomatis. Cukup masukkan destinasi, durasi, dan budget — agen AI akan menyusun itinerary lengkap dengan aktivitas per hari, estimasi biaya, dan rekomendasi tempat.

### 2. 🌤️ Weather Check Tool

Cek prakiraan cuaca untuk setiap hari perjalanan. Data cuaca digunakan oleh AI agent untuk merekomendasikan aktivitas yang sesuai (misal: hari hujan → rekomendasi museum/mall).

**Contoh output weather tool:**
```json
{
  "location": "Yogyakarta",
  "date": "2025-08-10",
  "temperature": 28.5,
  "condition": "Cerah Berawan",
  "humidity": 65,
  "recommendation": "Bawa topi dan sunscreen"
}
```

### 3. 💰 Budget Calculator & Optimizer

Alokasi budget pintar per kategori (akomodasi, transportasi, makan, aktivitas). Sistem memastikan total biaya aktivitas tidak melebihi budget trip.

| Kategori | Budget | % Total |
|----------|--------|---------|
| 🏨 Akomodasi | Rp 800.000 | 40% |
| 🍽️ Makan | Rp 450.000 | 22.5% |
| 🚗 Transportasi | Rp 350.000 | 17.5% |
| 🎯 Aktivitas | Rp 400.000 | 20% |
| **Total** | **Rp 2.000.000** | **100%** |

### 4. 🔍 Destination Search

Cari destinasi wisata, restoran, dan hotel dengan rekomendasi AI. Tool `placeRecommender` memberikan daftar tempat lengkap dengan rating, estimasi biaya, dan deskripsi.

---

## 💻 Tech Stack

| Layer | Teknologi | Detail |
|-------|-----------|--------|
| **Frontend** | React 18 + Vite + Tailwind CSS | TypeScript, React Router v6 |
| **Backend** | Express.js + TypeScript | REST API, middleware pattern |
| **AI Framework** | Mastra AI (`@mastra/core`) | Agent + Tool Calling + Memory |
| **LLM** | OpenAI GPT-4o-mini | Temperature: 0.5, Max tokens: 4096 |
| **Weather API** | OpenWeatherMap API | Current + 5-day forecast |
| **ORM** | Prisma | PostgreSQL provider |
| **Database** | PostgreSQL 15 | Trips, trip_days, activities |
| **Auth** | JWT (jsonwebtoken) | Access + refresh token |
| **Validation** | Zod | Request body validation |
| **Deploy** | Vercel (FE) + Railway (BE) | Docker optional |

---

## 🔑 Code Snippet Penting

### 1. Definisi Agent dengan Tools

```typescript
// src/agents/travelAgent.ts
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { weatherCheck } from '../tools/weatherCheck';
import { budgetOptimizer } from '../tools/budgetOptimizer';
import { placeRecommender } from '../tools/placeRecommender';
import { z } from 'zod';

// Schema output itinerary untuk parsing
const ItinerarySchema = z.object({
  tripName: z.string(),
  days: z.array(
    z.object({
      day: z.number(),
      date: z.string(),
      weather: z.object({
        condition: z.string(),
        temperature: z.number(),
        recommendation: z.string(),
      }),
      activities: z.array(
        z.object({
          time: z.string(),
          name: z.string(),
          category: z.enum(['attraction', 'food', 'transport', 'hotel', 'shopping', 'other']),
          place: z.string(),
          estimatedCost: z.number(),
          duration: z.string(),
          notes: z.string(),
        })
      ),
      dailyBudget: z.object({
        accommodation: z.number(),
        food: z.number(),
        transport: z.number(),
        activities: z.number(),
        total: z.number(),
      }),
    })
  ),
  totalCost: z.number(),
  tips: z.array(z.string()),
});

export const travelAgent = new Agent({
  name: 'Travel Planner Agent',
  instructions: `
    Kamu adalah AI Travel Planner — asisten perencana perjalanan.

    TUGAS UTAMA:
    Berdasarkan input pengguna (destinasi, durasi, budget, preferensi):
    1. Gunakan weatherCheck tool untuk cek cuaca SETIAP hari perjalanan.
    2. Gunakan budgetOptimizer tool untuk alokasi budget per hari.
    3. Gunakan placeRecommender tool untuk rekomendasi tempat wisata, makan, dan hotel.
    4. Susun itinerary harian yang logis dan efisien.
    
    ATURAN PENYUSUNAN ITINERARY:
    - Aktivitas pagi (08:00-11:00): tempat wisata outdoor
    - Aktivsi siang (11:00-13:00): makan siang + istirahat
    - Aktivitas sore (13:00-17:00): museum/belanja/cafe
    - Aktivitas malam (18:00-21:00): kuliner/hiburan malam
    - Jangan jadwalkan perjalanan bolak-balik yang tidak efisien
    - Sesuaikan aktivitas dengan kondisi cuaca
    - Prioritaskan tempat dengan rating tinggi
    
    FORMAT OUTPUT: JSON strict sesuai schema.
    - Gunakan bahasa Indonesia untuk nama tempat dan deskripsi.
    - Estimasi biaya dalam Rupiah (IDR).
  `,
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o-mini',
    temperature: 0.5,
    maxTokens: 4096,
  },
  tools: {
    weatherCheck,
    budgetOptimizer,
    placeRecommender,
  },
  output: ItinerarySchema,
  memory: {
    type: 'working',
    lastN: 5,
  },
});
```

### 2. Tool: Weather Check

```typescript
// src/tools/weatherCheck.ts
import { Tool } from '@mastra/core/tool';
import { z } from 'zod';

const weatherInputSchema = z.object({
  location: z.string().describe('Nama kota atau destinasi'),
  date: z.string().describe('Tanggal dalam format YYYY-MM-DD'),
});

const weatherOutputSchema = z.object({
  temperature: z.number(),
  condition: z.string(),
  humidity: z.number(),
  windSpeed: z.number(),
  recommendation: z.string(),
});

export const weatherCheck = new Tool({
  name: 'weatherCheck',
  description: 'Cek prakiraan cuaca untuk lokasi dan tanggal tertentu',
  inputSchema: weatherInputSchema,
  outputSchema: weatherOutputSchema,
  execute: async ({ location, date }: z.infer<typeof weatherInputSchema>) => {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
      );
      const geoData = await geoRes.json();

      if (!geoData.length) {
        return {
          temperature: 0,
          condition: 'Lokasi tidak ditemukan',
          humidity: 0,
          windSpeed: 0,
          recommendation: 'Gunakan nama kota yang valid',
        };
      }

      const { lat, lon } = geoData[0];
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      const weatherData = await weatherRes.json();

      // Cari foreast untuk tanggal yang diminta
      const targetDate = new Date(date).toISOString().split(' ')[0];
      const forecast = weatherData.list.find((item: any) =>
        item.dt_txt.startsWith(targetDate)
      );

      if (!forecast) {
        return {
          temperature: weatherData.list[0].main.temp,
          condition: weatherData.list[0].weather[0].description,
          humidity: weatherData.list[0].main.humidity,
          windSpeed: weatherData.list[0].wind.speed,
          recommendation: 'Data cuaca tersedia, disarankan cek ulang mendekati hari H',
        };
      }

      const condition = forecast.weather[0].description;
      const temp = forecast.main.temp;
      let recommendation = 'Cuaca cukup bersahabat';

      if (condition.includes('rain') || condition.includes('hujan')) {
        recommendation = 'Bawa payung, pilih aktivitas indoor seperti museum atau mall';
      } else if (temp > 32) {
        recommendation = 'Cuaca panas, bawa topi dan banyak minum';
      } else if (temp < 20) {
        recommendation = 'Cuaca dingin, bawa jaket';
      }

      return {
        temperature: Math.round(temp * 10) / 10,
        condition: translateWeatherCondition(condition),
        humidity: forecast.main.humidity,
        windSpeed: forecast.wind.speed,
        recommendation,
      };
    } catch (error) {
      console.error('Weather API error:', error);
      return {
        temperature: 0,
        condition: 'Gagal mengambil data cuaca',
        humidity: 0,
        windSpeed: 0,
        recommendation: 'Gunakan data perkiraan umum, cek manual sebelum berangkat',
      };
    }
  },
});

function translateWeatherCondition(condition: string): string {
  const map: Record<string, string> = {
    'clear sky': 'Cerah',
    'few clouds': 'Cerah Berawan',
    'scattered clouds': 'Berawan',
    'broken clouds': 'Berawan Tebal',
    'overcast clouds': 'Mendung',
    'light rain': 'Hujan Ringan',
    'moderate rain': 'Hujan Sedang',
    'heavy rain': 'Hujan Lebat',
    thunderstorm: 'Badai Petir',
    snow: 'Salju',
    mist: 'Berkabut',
    fog: 'Kabut Tebal',
  };
  return map[condition.toLowerCase()] || condition;
}
```

### 3. Tool: Budget Optimizer

```typescript
// src/tools/budgetOptimizer.ts
import { Tool } from '@mastra/core/tool';
import { z } from 'zod';

const budgetInputSchema = z.object({
  totalBudget: z.number().describe('Total budget perjalanan dalam IDR'),
  durationDays: z.number().describe('Durasi perjalanan dalam hari'),
  preferences: z
    .object({
      accommodation: z.enum(['budget', 'standard', 'luxury']).optional(),
      food: z.enum(['budget', 'standard', 'premium']).optional(),
      transport: z.enum(['public', 'rental', 'private']).optional(),
      activities: z.enum(['minimal', 'moderate', 'maximum']).optional(),
    })
    .optional()
    .describe('Preferensi alokasi budget'),
});

const budgetOutputSchema = z.object({
  dailyAllocations: z.array(
    z.object({
      day: z.number(),
      accommodation: z.number(),
      food: z.number(),
      transport: z.number(),
      activities: z.number(),
      savings: z.number(),
      total: z.number(),
    })
  ),
  total: z.number(),
  summary: z.string(),
});

export const budgetOptimizer = new Tool({
  name: 'budgetOptimizer',
  description: 'Optimasi alokasi budget perjalanan per hari dan per kategori',
  inputSchema: budgetInputSchema,
  outputSchema: budgetOutputSchema,
  execute: async ({
    totalBudget,
    durationDays,
    preferences,
  }: z.infer<typeof budgetInputSchema>) => {
    const defaultWeights = {
      accommodation: 0.4,
      food: 0.2,
      transport: 0.2,
      activities: 0.15,
      savings: 0.05,
    };

    const preferenceWeights = {
      accommodation: preferences?.accommodation === 'budget' ? 0.25
        : preferences?.accommodation === 'standard' ? 0.4
        : 0.5,
      food: preferences?.food === 'budget' ? 0.12
        : preferences?.food === 'standard' ? 0.2
        : 0.3,
      transport: preferences?.transport === 'public' ? 0.1
        : preferences?.transport === 'rental' ? 0.25
        : 0.35,
      activities: preferences?.activities === 'minimal' ? 0.08
        : preferences?.activities === 'moderate' ? 0.15
        : 0.25,
    };

    const weights = {
      accommodation: preferenceWeights.accommodation,
      food: preferenceWeights.food,
      transport: preferenceWeights.transport,
      activities: preferenceWeights.activities,
    };

    // Normalize weights
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    const normalizedWeights = Object.entries(weights).reduce(
      (acc, [key, val]) => ({
        ...acc,
        [key]: val / totalWeight,
      }),
      {} as Record<string, number>
    );

    // Alokasi per hari
    const dailyAllocations = Array.from({ length: durationDays }, (_, i) => {
      const day = i + 1;

      // Day 1 dan terakhir: lebih sedikit aktivitas (perjalanan)
      const isTravelDay = day === 1 || day === durationDays;
      const dailyFactor = isTravelDay ? 0.8 : 1.0;

      const dayBudget = (totalBudget / durationDays) * dailyFactor;

      return {
        day,
        accommodation: Math.round(dayBudget * normalizedWeights.accommodation),
        food: Math.round(dayBudget * normalizedWeights.food),
        transport: Math.round(dayBudget * normalizedWeights.transport),
        activities: Math.round(dayBudget * normalizedWeights.activities),
        savings: Math.round(dayBudget * 0.05),
        total: Math.round(dayBudget * 0.95), // 5% savings buffer
      };
    });

    const totalAllocated = dailyAllocations.reduce((sum, d) => sum + d.total, 0);

    const summary =
      `Budget Rp${totalBudget.toLocaleString('id-ID')} untuk ${durationDays} hari. ` +
      `Alokasi: akomodasi ${(normalizedWeights.accommodation * 100).toFixed(0)}%, ` +
      `makan ${(normalizedWeights.food * 100).toFixed(0)}%, ` +
      `transportasi ${(normalizedWeights.transport * 100).toFixed(0)}%, ` +
      `aktivitas ${(normalizedWeights.activities * 100).toFixed(0)}%. ` +
      `Total teralokasi: Rp${totalAllocated.toLocaleString('id-ID')}.`;

    return {
      dailyAllocations,
      total: totalAllocated,
      summary,
    };
  },
});
```

### 4. Tool: Place Recommender

```typescript
// src/tools/placeRecommender.ts
import { Tool } from '@mastra/core/tool';
import { z } from 'zod';

const placeInputSchema = z.object({
  location: z.string().describe('Destinasi atau kota tujuan'),
  category: z
    .enum(['attraction', 'food', 'hotel', 'shopping', 'all'])
    .describe('Kategori tempat yang dicari'),
  maxResults: z.number().default(5).describe('Jumlah maksimal rekomendasi'),
});

const placeOutputSchema = z.object({
  places: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
      rating: z.number(),
      estimatedCost: z.number(),
      latitude: z.number(),
      longitude: z.number(),
      description: z.string(),
      tips: z.string(),
    })
  ),
  totalFound: z.number(),
});

// Database tempat wisata Indonesia populer (mock)
const INDONESIA_PLACES: Record<string, any[]> = {
  'yogyakarta': [
    {
      name: 'Candi Borobudur',
      category: 'attraction',
      rating: 4.7,
      estimatedCost: 50000,
      latitude: -7.6079,
      longitude: 110.2038,
      description: 'Candi Buddha terbesar di dunia, Situs Warisan Dunia UNESCO',
      tips: 'Datang pagi-pagi untuk melihat sunrise',
    },
    {
      name: 'Malioboro',
      category: 'shopping',
      rating: 4.3,
      estimatedCost: 0,
      latitude: -7.7925,
      longitude: 110.3658,
      description: 'Kawasan perbelanjaan dan kuliner ikonik Yogyakarta',
      tips: 'Coba gudeg dan bakpia khas Jogja',
    },
    {
      name: 'Gudeg Yu Djum',
      category: 'food',
      rating: 4.5,
      estimatedCost: 35000,
      latitude: -7.7825,
      longitude: 110.3758,
      description: 'Warung gudeg legendaris sejak 1951',
      tips: 'Datang sebelum jam 12 siang, sering habis',
    },
    {
      name: 'Taman Sari',
      category: 'attraction',
      rating: 4.2,
      estimatedCost: 15000,
      latitude: -7.8100,
      longitude: 110.3589,
      description: 'Bekas taman kerajaan Kesultanan Yogyakarta',
      tips: 'Gabung dengan tur keraton untuk cerita sejarah lengkap',
    },
    {
      name: 'The Alana Hotel',
      category: 'hotel',
      rating: 4.4,
      estimatedCost: 500000,
      latitude: -7.7833,
      longitude: 110.3667,
      description: 'Hotel bintang 4 di pusat kota dengan view Malioboro',
      tips: 'Pesan minimal H-7 untuk harga terbaik',
    },
  ],
  'bandung': [
    {
      name: 'Kawah Putih',
      category: 'attraction',
      rating: 4.6,
      estimatedCost: 50000,
      latitude: -7.1667,
      longitude: 107.4000,
      description: 'Danau kawah vulkanik dengan air berwarna putih kehijauan',
      tips: 'Bawa jaket, suhu bisa 10-15°C',
    },
    {
      name: 'Street Food Sasak',
      category: 'food',
      rating: 4.4,
      estimatedCost: 50000,
      latitude: -6.9175,
      longitude: 107.6191,
      description: 'Kawasan kuliner malam terkenal di Bandung',
      tips: 'Coba seblak, batagor, dan mie kocok',
    },
  ],
  'bali': [
    {
      name: 'Pantai Kuta',
      category: 'attraction',
      rating: 4.3,
      estimatedCost: 0,
      latitude: -8.7186,
      longitude: 115.1686,
      description: 'Pantai pasir putih dengan sunset spektakuler',
      tips: 'Hindari bulan Desember-Januari (musim hujan)',
    },
  ],
};

export const placeRecommender = new Tool({
  name: 'placeRecommender',
  description: 'Cari rekomendasi tempat wisata, kuliner, dan hotel berdasarkan lokasi',
  inputSchema: placeInputSchema,
  outputSchema: placeOutputSchema,
  execute: async ({
    location,
    category,
    maxResults,
  }: z.infer<typeof placeInputSchema>) => {
    const normalizedLocation = location.toLowerCase().trim();
    const places = INDONESIA_PLACES[normalizedLocation] || [];

    const filtered = category === 'all'
      ? places
      : places.filter((p) => p.category === category);

    // Sort by rating descending
    filtered.sort((a, b) => b.rating - a.rating);

    const topPlaces = filtered.slice(0, maxResults);

    return {
      places: topPlaces,
      totalFound: filtered.length,
    };
  },
});
```

### 5. API Route: Generate Itinerary

```typescript
// src/routes/ai.ts
import { Router, Request, Response } from 'express';
import { travelAgent } from '../agents/travelAgent';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/trips/:id/generate
router.post('/trips/:id/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // 1. Ambil data trip dari DB
    const trip = await prisma.trip.findFirst({
      where: { id, userId },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { code: 'TRIP_NOT_FOUND', message: 'Trip tidak ditemukan' },
      });
    }

    // 2. Hapus data itinerary lama (jika regenerate)
    await prisma.activity.deleteMany({
      where: { tripDay: { tripId: id } },
    });
    await prisma.tripDay.deleteMany({ where: { tripId: id } });

    // 3. Build prompt untuk agent
    const prompt = `
      Buatkan itinerary perjalanan dengan detail berikut:

      DESTINASI: ${trip.destination}
      DURASI: ${trip.durationDays} hari
      TOTAL BUDGET: Rp${Number(trip.totalBudget).toLocaleString('id-ID')}
      PREFERENSI: ${(trip.preferences as any)?.notes || 'Tidak ada preferensi khusus'}

      Gunakan tools yang tersedia:
      1. weatherCheck — cek cuaca untuk setiap hari di ${trip.destination}
      2. budgetOptimizer — alokasi budget Rp${Number(trip.totalBudget).toLocaleString('id-ID')} untuk ${trip.durationDays} hari
      3. placeRecommender — cari tempat di ${trip.destination}

      Hasilkan itinerary dalam format JSON sesuai schema.
    `;

    // 4. Panggil Mastra agent
    const result = await travelAgent.execute(prompt);

    // 5. Parse & validasi output
    const itinerary = ItinerarySchema.parse(result);

    // 6. Simpan ke database
    for (const dayData of itinerary.days) {
      const tripDay = await prisma.tripDay.create({
        data: {
          tripId: id,
          dayNumber: dayData.day,
          date: new Date(dayData.date),
          dailyBudget: dayData.dailyBudget.total,
          notes: `Cuaca: ${dayData.weather.condition}, ${dayData.weather.temperature}°C`,
        },
      });

      for (const activity of dayData.activities) {
        await prisma.activity.create({
          data: {
            tripDayId: tripDay.id,
            name: activity.name,
            description: activity.notes,
            category: activity.category,
            startTime: activity.time,
            placeName: activity.place,
            estimatedCost: activity.estimatedCost,
            sortOrder: dayData.activities.indexOf(activity),
            isAiGenerated: true,
          },
        });
      }
    }

    // 7. Cache weather data ke trip
    await prisma.trip.update({
      where: { id },
      data: {
        weatherData: itinerary.days.map((d) => ({
          day: d.day,
          date: d.date,
          ...d.weather,
        })),
        status: 'active',
      },
    });

    // 8. Return hasil
    const updatedTrip = await prisma.trip.findUnique({
      where: { id },
      include: {
        days: {
          include: { activities: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    return res.json({
      success: true,
      data: {
        trip: updatedTrip,
        totalCost: itinerary.totalCost,
        tips: itinerary.tips,
      },
    });
  } catch (error) {
    console.error('AI Generate error:', error);
    return res.status(503).json({
      success: false,
      error: {
        code: 'AI_GENERATION_FAILED',
        message: 'Gagal generate itinerary. Silakan coba lagi.',
      },
    });
  }
});

export default router;
```

### 6. Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid()) @db.Uuid
  email        String   @unique
  passwordHash String
  fullName     String
  avatarUrl    String?
  createdAt    DateTime @default(now())

  trips Trip[]
}

model Trip {
  id            String   @id @default(uuid()) @db.Uuid
  userId        String   @db.Uuid
  destination   String
  durationDays  Int
  totalBudget   Decimal  @db.Decimal(12, 2)
  currency      String   @default("IDR")
  status        String   @default("draft") // draft | active | completed
  preferences   Json?
  weatherData   Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User          @relation(fields: [userId], references: [id])
  days TripDay[]

  @@index([userId])
  @@index([status])
}

model TripDay {
  id           String   @id @default(uuid()) @db.Uuid
  tripId       String   @db.Uuid
  dayNumber    Int
  date         DateTime?
  dailyBudget  Decimal? @db.Decimal(12, 2)
  notes        String?
  createdAt    DateTime @default(now())

  trip       Trip       @relation(fields: [tripId], references: [id], onDelete: Cascade)
  activities Activity[]

  @@unique([tripId, dayNumber])
  @@index([tripId])
}

model Activity {
  id             String   @id @default(uuid()) @db.Uuid
  tripDayId      String   @db.Uuid
  name           String
  description    String?
  category       String   // attraction | food | transport | hotel | shopping | other
  startTime      String?
  endTime        String?
  placeName      String?
  latitude       Decimal? @db.Decimal(10, 7)
  longitude      Decimal? @db.Decimal(10, 7)
  estimatedCost  Decimal  @default(0) @db.Decimal(12, 2)
  sortOrder      Int      @default(0)
  isAiGenerated  Boolean  @default(false)
  createdAt      DateTime @default(now())

  tripDay TripDay @relation(fields: [tripDayId], references: [id], onDelete: Cascade)

  @@index([tripDayId])
  @@index([tripDayId, sortOrder])
}
```

### 7. Frontend Component: Trip Detail + Itinerary

```tsx
// src/components/TripDetail.tsx
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ItineraryDay } from './ItineraryDay';
import { BudgetChart } from './BudgetChart';
import { WeatherCard } from './WeatherCard';

interface TripDetailProps {
  tripId: string;
}

interface Trip {
  id: string;
  destination: string;
  durationDays: number;
  totalBudget: number;
  status: string;
  days: TripDay[];
}

interface TripDay {
  id: string;
  dayNumber: number;
  date: string;
  dailyBudget: number;
  notes: string;
  activities: Activity[];
}

interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  startTime: string;
  placeName: string;
  estimatedCost: number;
  sortOrder: number;
  isAiGenerated: boolean;
}

export function TripDetail({ tripId }: TripDetailProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  async function loadTrip() {
    try {
      const res = await api.get(`/trips/${tripId}`);
      setTrip(res.data);
    } catch (err) {
      setError('Gagal memuat trip');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await api.post(`/trips/${tripId}/generate`);
      setTrip(res.data.trip);
    } catch (err) {
      setError('Gagal generate itinerary. Coba lagi.');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
        <button onClick={loadTrip} className="ml-2 underline">
          Coba lagi
        </button>
      </div>
    );
  }

  if (!trip) {
    return <div className="text-gray-500">Trip tidak ditemukan</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">{trip.destination}</h1>
        <p className="mt-2 opacity-90">
          {trip.durationDays} hari · Rp{Number(trip.totalBudget).toLocaleString('id-ID')}
        </p>
        <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
          {trip.status === 'draft' ? 'Draft' : trip.status === 'active' ? '✅ Aktif' : '✅ Selesai'}
        </span>
      </div>

      {/* AI Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold
                     hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 shadow-lg"
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              AI Sedang Menyusun Itinerary...
            </span>
          ) : (
            '🤖 Generate Itinerary with AI'
          )}
        </button>
      </div>

      {/* Budget Overview */}
      {trip.days.length > 0 && (
        <BudgetChart days={trip.days} totalBudget={trip.totalBudget} />
      )}

      {/* Itinerary per Day */}
      {trip.days.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-4">🗺️</p>
          <p>Belum ada itinerary. Klik tombol generate untuk memulai!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {trip.days.map((day) => (
            <div key={day.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Day Header */}
              <div className="bg-gray-50 px-6 py-3 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">Hari {day.dayNumber}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(day.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <WeatherCard notes={day.notes} />
              </div>

              {/* Activities */}
              <div className="divide-y">
                {day.activities.map((activity, idx) => (
                  <div key={activity.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50">
                    {/* Time */}
                    <div className="text-center min-w-[60px]">
                      <span className="text-sm font-mono text-gray-500">{activity.startTime}</span>
                    </div>

                    {/* Timeline line */}
                    <div className="relative flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.isAiGenerated ? 'bg-purple-500' : 'bg-blue-500'
                      }`} />
                      {idx < day.activities.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 absolute top-3" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{activity.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          {activity.placeName && (
                            <p className="text-sm text-gray-400 mt-1">📍 {activity.placeName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">
                            Rp{Number(activity.estimatedCost).toLocaleString('id-ID')}
                          </span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            activity.category === 'food' ? 'bg-orange-100 text-orange-700'
                            : activity.category === 'attraction' ? 'bg-green-100 text-green-700'
                            : activity.category === 'hotel' ? 'bg-blue-100 text-blue-700'
                            : activity.category === 'transport' ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}>
                            {activity.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Daily Budget */}
              <div className="bg-gray-50 px-6 py-3 border-t text-sm text-gray-600 flex justify-between">
                <span>Budget Harian</span>
                <span className="font-mono font-medium">
                  Rp{Number(day.dailyBudget).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Contoh Output Itinerary

Berikut contoh output yang dihasilkan AI agent untuk trip **Yogyakarta 3 Hari** dengan budget **Rp2.000.000**:

### Hari 1 — Kedatangan & Eksplorasi Kota

| Waktu | Aktivitas | Tempat | Biaya |
|-------|-----------|--------|-------|
| 08:00 | 🚗 Tiba di Yogyakarta | Stasiun Tugu | Rp50.000 |
| 09:00 | 🏛️ Wisata Sejarah | Keraton Yogyakarta | Rp40.000 |
| 11:30 | 🍜 Makan Siang | Gudeg Yu Djum | Rp50.000 |
| 13:00 | 🛍️ Belanja Oleh-oleh | Malioboro | Rp0 |
| 15:00 | 🏨 Check-in Hotel | The Alana Hotel | Rp300.000 |
| 18:00 | 🌆 Sunset | Tugu Jogja | Rp0 |
| 19:00 | 🍢 Makan Malam | Angkringan Lik Man | Rp30.000 |
| **Total** | | | **Rp470.000** |

### Hari 2 — Wisata Candi

| Waktu | Aktivitas | Tempat | Biaya |
|-------|-----------|--------|-------|
| 05:00 | 🌅 Sunrise Tour | Candi Borobudur | Rp100.000 |
| 09:00 | ☕ Sarapan | Kopi Klotok | Rp35.000 |
| 10:30 | 🛕 Wisata Candi | Candi Prambanan | Rp75.000 |
| 13:00 | 🍲 Makan Siang | Restoran Bale Raos | Rp75.000 |
| 15:00 | 🎨 Belajar Batik | Kampung Batik Giriloyo | Rp50.000 |
| 19:00 | 🎭 Pertunjukan | Ramayana Ballet | Rp100.000 |
| 21:00 | 🍜 Makan Malam | Mie Ayam Jogja | Rp25.000 |
| **Total** | | | **Rp460.000** |

### Hari 3 — Alam & Pulang

| Waktu | Aktivitas | Tempat | Biaya |
|-------|-----------|--------|-------|
| 07:00 | ☕ Sarapan | Hotel | Rp0 |
| 08:30 | 🏞️ Wisata Alam | Tebing Breksi | Rp20.000 |
| 11:00 | 🚣 Goa Pindul | Cave Tubing | Rp75.000 |
| 13:00 | 🍜 Makan Siang | Warung Sawah | Rp40.000 |
| 15:00 | 🚗 Menuju Stasiun | | Rp50.000 |
| **Total** | | | **Rp185.000** |

---

## 📦 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/travel_planner"

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"

# Weather API
OPENWEATHER_API_KEY="..."

# JWT
JWT_SECRET="..."
JWT_EXPIRES_IN="7d"

# App
PORT=3001
NODE_ENV=development
```

---

## 🚀 Cara Menjalankan

```bash
# 1. Clone repo
git clone <repo-url>
cd ai-travel-planner

# 2. Backend setup
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev

# 3. Frontend setup (terminal baru)
cd frontend
npm install
npm run dev

# 4. Buka browser
open http://localhost:5173
```

---

## ✅ Deliverables Checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Repository GitHub | ✅ |
| 2 | Auth flow (register, login, JWT) | ✅ |
| 3 | CRUD trips endpoints | ✅ |
| 4 | CRUD trip_days & activities | ✅ |
| 5 | Budget validation middleware | ✅ |
| 6 | Mastra agent integration (3 tools) | ✅ |
| 7 | WeatherCheck tool | ✅ |
| 8 | BudgetOptimizer tool | ✅ |
| 9 | PlaceRecommender tool | ✅ |
| 10 | AI generate itinerary endpoint | ✅ |
| 11 | AI output caching | ✅ |
| 12 | Frontend — Dashboard | ✅ |
| 13 | Frontend — Trip Detail + Itinerary | ✅ |
| 14 | Frontend — Generate button + loading | ✅ |
| 15 | Frontend — Budget visualization | ✅ |
| 16 | Error handling (timeout, API down, rate limit) | ✅ |
| 17 | Docker Compose | ✅ |
| 18 | Deployment (Vercel + Railway) | ✅ |

---

## 📈 Metrik Keberhasilan

| Metrik | Target | Hasil |
|--------|--------|-------|
| Response time generate | < 15 detik | ⏳ |
| Weather accuracy | > 80% | ⏳ |
| Budget accuracy | ±5% dari alokasi | ⏳ |
| User satisfaction | > 4.0/5.0 | ⏳ |
| Uptime | > 99% | ⏳ |

---

## 📚 Yang Dipelajari dari Project Ini

1. **React + Vite** — Component patterns, hooks, state management, API integration
2. **Express REST API** — Router, middleware, error handling, validation (Zod)
3. **Mastra Agent Framework** — Multi-tool agent, structured output, memory
4. **External API Integration** — OpenWeatherMap, error handling, caching
5. **Database Design** — Relational model trips → days → activities
6. **JWT Authentication** — Access token, middleware guard, refresh token
7. **AI Prompt Engineering** — Structured prompts, tool orchestration, output parsing
8. **Frontend UX** — Loading states, error states, responsive design, drag-drop

---

## 🔗 Link Terkait

- [🔗 Live Demo](#) — *Ganti dengan URL deployment*
- [📦 GitHub Repository](#) — *Ganti dengan URL repo*
- [📹 Video Demo](#) — *Ganti dengan link YouTube*
- [📋 Slide Presentasi](#) — *Ganti dengan link Google Slides*
- [📊 Laporan Akhir](#) — *Ganti dengan link PDF*

---

> **Dibuat oleh:** [Nama Kelompok] — RPL AI Curriculum Capstone 2  
> **Dosen Pembimbing:** [Nama Dosen]  
> **Semester:** Ganjil 2025/2026  

---

*Project showcase ini adalah contoh referensi. Hasil implementasi sesungguhnya dapat bervariasi.*
