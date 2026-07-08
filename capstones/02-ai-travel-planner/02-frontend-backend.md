# Sesi 2: Frontend & Backend — AI Travel Planner

> **Durasi:** 4 minggu (Sprint 2–3) | **Mode:** Individu / Kelompok (maks. 3 orang)

---

## 📋 Ringkasan

Sesi ini mencakup implementasi frontend dan backend AI Travel Planner. Mahasiswa akan membangun aplikasi Next.js dengan Tailwind CSS, integrasi peta (Mapbox/Leaflet), itinerary builder dengan drag-drop, dan autentikasi NextAuth. Backend menggunakan Node.js + Hono/Fastify dengan Drizzle ORM dan integrasi Mastra agent.

---

## 1. Next.js + Tailwind CSS

### 1.1 Setup Project

```bash
npx create-next-app@latest travel-planner --typescript --tailwind --app
cd travel-planner
npm install @prisma/client next-auth bcryptjs
npm install -D prisma @types/bcryptjs
```

### 1.2 Struktur Frontend

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout dengan Navbar + AuthProvider
│   │   ├── page.tsx            # Landing page / Home
│   │   ├── login/page.tsx      # Login page
│   │   ├── register/page.tsx   # Register page
│   │   ├── dashboard/page.tsx  # Daftar trips
│   │   ├── trips/
│   │   │   ├── [id]/page.tsx   # Detail trip + itinerary
│   │   │   └── new/page.tsx    # Buat trip baru
│   │   └── api/
│   │       └── auth/[...nextauth]/route.ts
│   ├── components/
│   │   ├── ui/                 # Button, Card, Input, Modal
│   │   ├── trip/
│   │   │   ├── TripCard.tsx
│   │   │   ├── TripForm.tsx
│   │   │   ├── ItineraryDay.tsx
│   │   │   ├── ActivityItem.tsx
│   │   │   └── GenerateButton.tsx
│   │   ├── map/
│   │   │   └── MapView.tsx
│   │   └── auth/
│   │       └── AuthForm.tsx
│   ├── lib/
│   │   ├── api.ts              # API client wrapper
│   │   └── utils.ts            # Helpers
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── tailwind.config.ts
└── package.json
```

### 1.3 Tampilan Dashboard

```tsx
// src/app/dashboard/page.tsx
'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import TripCard from '@/components/trip/TripCard';
import { api } from '@/lib/api';

interface Trip {
  id: string;
  destination: string;
  duration_days: number;
  total_budget: number;
  status: 'draft' | 'active' | 'completed';
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      api.getTrips(session.accessToken)
        .then(data => setTrips(data))
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trip Saya</h1>
        <a href="/trips/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Trip Baru
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map(trip => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>

      {trips.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">✈️</p>
          <p className="text-lg">Belum ada trip. Buat trip pertama Anda!</p>
        </div>
      )}
    </div>
  );
}
```

---

## 2. Map Integration (Leaflet / Mapbox)

### 2.1 Leaflet Setup

```bash
npm install leaflet react-leaflet @types/leaflet
```

### 2.2 Map Component

```tsx
// src/components/map/MapView.tsx
'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

interface Place {
  lat: number;
  lng: number;
  name: string;
  category: string;
  description?: string;
}

interface MapViewProps {
  places: Place[];
  center?: [number, number];
  zoom?: number;
}

export default function MapView({ places, center = [-7.797068, 110.370529], zoom = 12 }: MapViewProps) {
  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border">
      <MapContainer center={center} zoom={zoom} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((place, i) => (
          <Marker key={i} position={[place.lat, place.lng]}>
            <Popup>
              <div className="font-medium">{place.name}</div>
              <div className="text-sm text-gray-600">{place.category}</div>
              {place.description && <p className="text-xs mt-1">{place.description}</p>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

### 2.3 Integrasi Map di Detail Trip

```tsx
// src/app/trips/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import MapView from '@/components/map/MapView';
import ItineraryDay from '@/components/trip/ItineraryDay';
import GenerateButton from '@/components/trip/GenerateButton';

export default function TripDetail({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/trips/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setTrip(data);
        // Extract all activity locations for map
        const allPlaces = data.days?.flatMap((day: any) =>
          day.activities
            ?.filter((a: any) => a.latitude && a.longitude)
            .map((a: any) => ({
              lat: a.latitude,
              lng: a.longitude,
              name: a.place_name || a.name,
              category: a.category,
            }))
        ) || [];
        setPlaces(allPlaces);
      });
  }, [params.id]);

  if (!trip) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{trip.destination}</h1>
          <p className="text-gray-600">{trip.duration_days} hari • Rp {trip.total_budget.toLocaleString()}</p>
        </div>
        <GenerateButton tripId={trip.id} onGenerated={() => window.location.reload()} />
      </div>

      {/* Map */}
      <div className="mb-6">
        <MapView places={places} />
      </div>

      {/* Budget Progress */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-2">Anggaran</h2>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full"
            style={{ width: `${(trip.used_budget / trip.total_budget) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Terpakai: Rp {trip.used_budget?.toLocaleString()} dari Rp {trip.total_budget?.toLocaleString()}
        </p>
      </div>

      {/* Itinerary Days */}
      <div className="space-y-4">
        {trip.days?.sort((a: any, b: any) => a.day_number - b.day_number).map((day: any) => (
          <ItineraryDay key={day.id} day={day} tripId={trip.id} />
        ))}
      </div>
    </div>
  );
}
```

---

## 3. Itinerary Builder

### 3.1 Drag-Drop dengan dnd-kit

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 3.2 Sortable Activity Item

```tsx
// src/components/trip/ActivityItem.tsx
'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Activity {
  id: string;
  name: string;
  category: string;
  start_time: string;
  estimated_cost: number;
  sort_order: number;
}

export default function ActivityItem({ activity }: { activity: Activity }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryIcons: Record<string, string> = {
    attraction: '🏖️',
    food: '🍜',
    transport: '🚗',
    hotel: '🏨',
    shopping: '🛍️',
    other: '📌',
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white p-3 rounded-lg border hover:shadow-sm transition-shadow">
      <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        ⠿
      </button>
      <span className="text-xl">{categoryIcons[activity.category] || '📌'}</span>
      <div className="flex-1">
        <div className="font-medium">{activity.name}</div>
        {activity.start_time && (
          <div className="text-xs text-gray-500">{activity.start_time}</div>
        )}
      </div>
      <div className="text-sm font-medium">
        Rp {activity.estimated_cost?.toLocaleString()}
      </div>
    </div>
  );
}
```

### 3.3 Itinerary Day dengan Sortable Context

```tsx
// src/components/trip/ItineraryDay.tsx
'use client';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import ActivityItem from './ActivityItem';
import { api } from '@/lib/api';

export default function ItineraryDay({ day, tripId }: { day: any; tripId: string }) {
  const [activities, setActivities] = useState(day.activities || []);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = activities.findIndex((a: any) => a.id === active.id);
      const newIndex = activities.findIndex((a: any) => a.id === over.id);
      const newActivities = arrayMove(activities, oldIndex, newIndex);
      setActivities(newActivities);

      // Update sort_order via API
      await api.reorderActivity(active.id, newIndex);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">📅 Hari {day.day_number}</h3>
        <span className="text-sm text-gray-500">
          Budget: Rp {day.daily_budget?.toLocaleString() || 'Belum diatur'}
        </span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={activities.map((a: any) => a.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {activities.map((activity: any) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
        + Tambah Aktivitas
      </button>
    </div>
  );
}
```

---

## 4. Auth (NextAuth.js)

### 4.1 Setup NextAuth

```tsx
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error('Email tidak terdaftar');

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) throw new Error('Password salah');

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 4.2 AuthProvider Wrapper

```tsx
// src/components/auth/SessionProvider.tsx
'use client';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

### 4.3 Protected Routes

```tsx
// src/components/auth/ProtectedRoute.tsx
'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return null;

  return <>{children}</>;
}
```

---

## 5. Backend (Hono / Express)

### 5.1 Struktur Backend

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── config/
│   │   ├── database.ts       # Drizzle/Prisma setup
│   │   └── auth.ts           # JWT config
│   ├── routes/
│   │   ├── auth.ts           # Register, login, me
│   │   ├── trips.ts          # CRUD trips
│   │   ├── days.ts           # CRUD trip days
│   │   ├── activities.ts     # CRUD activities
│   │   ├── generate.ts       # AI itinerary generation
│   │   └── weather.ts        # Weather endpoint
│   ├── services/
│   │   ├── trip.service.ts
│   │   ├── itinerary.service.ts
│   │   └── ai.service.ts     # Mastra agent calls
│   ├── agents/
│   │   ├── travel.agent.ts   # Mastra agent definition
│   │   └── tools/
│   │       ├── weatherCheck.ts
│   │       ├── budgetOptimizer.ts
│   │       └── placeRecommender.ts
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   └── error.ts          # Global error handler
│   └── types/
│       └── index.ts
├── drizzle/                  # Migrations
├── tests/
└── package.json
```

### 5.2 Contoh Route Handler (Hono)

```typescript
// src/routes/trips.ts
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { TripService } from '../services/trip.service';
import { authMiddleware } from '../middleware/auth';

const trips = new Hono();
const tripService = new TripService();

// All trip routes need auth
trips.use('*', authMiddleware);

// Create trip
trips.post(
  '/',
  zValidator('json', z.object({
    destination: z.string().min(1).max(255),
    duration_days: z.number().int().min(1),
    total_budget: z.number().min(0),
    currency: z.string().length(3).default('IDR'),
  })),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const trip = await tripService.create(userId, body);
    return c.json({ success: true, data: trip }, 201);
  }
);

// List trips (paginated)
trips.get('/', async (c) => {
  const userId = c.get('userId');
  const page = Number(c.req.query('page') || '1');
  const limit = Number(c.req.query('limit') || '20');
  const result = await tripService.list(userId, page, limit);
  return c.json({ success: true, ...result });
});

// Get trip details
trips.get('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const trip = await tripService.getById(userId, id);
  if (!trip) return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Trip tidak ditemukan' } }, 404);
  return c.json({ success: true, data: trip });
});

export { trips };
```

---

## 6. Latihan

> **Latihan 1:** Setup Next.js + Tailwind
> Buat project Next.js baru dengan Tailwind CSS. Setup struktur folder sesuai panduan. Buat halaman landing page sederhana dengan hero section "Rencanakan Perjalanan Anda". Gunakan komponen UI kustom (bukan library).

> **Latihan 2:** Auth dengan NextAuth
> Implementasi autentikasi dengan NextAuth.js + CredentialsProvider. Buat halaman login dan register. Gunakan bcrypt untuk hash password. Implementasi proteksi route dengan middleware. Test alur: register → login → redirect ke dashboard.

> **Latihan 3:** API Client & Dashboard
> Buat API client wrapper di `lib/api.ts` dengan method `getTrips`, `createTrip`, `getTripDetail`. Implementasi halaman dashboard yang menampilkan daftar trip dalam grid card. Handle loading state dengan spinner, empty state dengan ilustrasi.

> **Latihan 4:** Itinerary Builder dengan Drag-Drop
> Implementasi halaman detail trip dengan itinerary per hari. Gunakan @dnd-kit untuk drag-drop reorder aktivitas. Integrasi dengan API PATCH /api/activities/:id/reorder saat drag selesai.

> **Latihan 5:** Map Integration
> Integrasikan Leaflet/Mapbox di halaman detail trip. Tampilkan marker untuk setiap aktivitas yang memiliki koordinat. Buat popup dengan nama tempat dan kategori. Center map otomatis ke lokasi pertama.

> **Latihan 6:** Generate Button & Loading State
> Buat komponen GenerateButton yang memanggil POST /api/trips/:id/generate. Tampilkan animasi loading saat generating. Handle error jika AI timeout. Setelah selesai, reload halaman untuk menampilkan itinerary baru.

> **Latihan 7:** Responsive Layout
> Pastikan semua halaman responsif: (a) Dashboard: grid 1 kolom di mobile, 3 kolom di desktop. (b) Detail trip: map di atas, itinerary di bawah di mobile; map di kiri, itinerary di kanan di desktop. Gunakan Tailwind breakpoints.

---

## 💡 Tips

- **Next.js App Router**: Gunakan `app/` directory pattern. Layout di `layout.tsx`, loading di `loading.tsx`, error di `error.tsx`.
- **Jangan install library UI**: Buat komponen sendiri untuk pembelajaran maksimal.
- **Optimasi gambar peta**: Jangan render 100 marker sekaligus — cluster untuk performa.
- **API error handling**: Selalu handle error response di frontend dengan try/catch dan user-friendly message.

---

| [← Sesi 1: Requirements & Design](01-requirements-design.md) | [Lanjut ke Sesi 3: Deployment & Scaling →](03-deployment-scaling.md) |
|---|---|
