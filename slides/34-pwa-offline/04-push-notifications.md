---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/267350/pexels-pho"
footer: "Sesi 04: Push Notifications"
---

<!-- _class: title -->
# 4. Push Notifications

## Arsitektur Push Notification

Push notification di PWA melibatkan 4 entitas:

```
┌──────────┐          ┌──────────────┐          ┌───────────┐
│  Browser  │ ◄────── │ Push Service  │ ◄────── │ Your      │
│  (Client) │          │ (disediakan   │          │ Backend   │
│           │ ──────▶ │  browser)     │ ──────▶ │ (Server)  │
└──────────┘          └──────────────┘          └──────┬────┘
       │                                                │
       ▼                                                ▼
┌─────────────────┐                            ┌──────────────┐
│  Notification    │                            │  Your App    │
│  (ditampilkan    │                            │  Logic       │
│   oleh browser)  │                            │              │
└─────────────────┘                            └──────────────┘
```

### Alur Lengkap

1. **Subscribe** — Client minta izin ke user, dapet PushSubscription object
2. **Kirim ke server** — Client kirim subscription data ke backend
3. **Simpan** — Backend simpan subscription di database
4. **Trigger push** — Backend kirim push message ke Push Service via Web Push Protocol
5. **Deliver** — Push Service kirim ke browser (walau tab tertutup)
6. **Handle event** — Service Worker terima `push` event, tampilin notification
7. **Interaksi** — User klik notification → `notificationclick` event

## VAPID Keys

VAPID (Voluntary Application Server Identification) — protokol buat identify server yang ngirim push. Biar Push Service tau siapa yang ngirim.

### Generate VAPID Keys

```bash

---

# Via CLI — pake web-push npm package
npx web-push generate-vapid-keys


---

# Output:

---

# =======================================

---

# Public Key:

---

# BParX1x...cYvsbxL8k

---

# Private Key:

---

# n2H3q...vP1C8Y

---

# =======================================
```

### Programmatic Generate

```javascript
// scripts/generate-vapid.js
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();
console.log('VAPID Keys generated:\n');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

### Simpan di Environment Variables

```bash

---

# .env
VAPID_PUBLIC_KEY=BParX1x...cYvsbxL8k
VAPID_PRIVATE_KEY=n2H3q...vP1C8Y
VAPID_EMAIL=admin@notesapp.com
```

## Subscribe User (Client Side)

### Di Halaman Web

```javascript
// push-client.js
const VAPID_PUBLIC_KEY = 'BParX1x...cYvsbxL8k'; // dari server

async function subscribeUser() {
  // 1. Cek support
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[Push] Not supported');
    return null;
  }

  // 2. Daftarkan SW (kalo belum)
  const registration = await navigator.serviceWorker.register('/sw.js');
  console.log('[Push] SW registered');

  // 3. Minta izin notifikasi
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('[Push] Permission denied');
    return null;
  }

  // 4. Subscribe ke push service
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true, // WAJIB — setiap push harus tampil notif
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  console.log('[Push] Subscribed:', JSON.stringify(subscription));
  return subscription;
}

// Helper — convert VAPID key (base64 URL safe → Uint8Array)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

### Kirim Subscription ke Server

```javascript
async function saveSubscription(subscription) {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(
            subscription.getKey('p256dh')
          ))),
          auth: btoa(String.fromCharCode(...new Uint8Array(
            subscription.getKey('auth')
          )))
        },
        userAgent: navigator.userAgent,
        subscribedAt: new Date().toISOString()
      })
    });

    if (response.ok) {
      console.log('[Push] Subscription saved to server');
      return true;
    }
    throw new Error('Failed to save');
  } catch (err) {
    console.error('[Push] Save error:', err);
    return false;
  }
}
```

### Cek Status Subscription & Unsubscribe

```javascript
async function checkSubscription() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    console.log('[Push] Active subscription:', subscription.endpoint);
    return subscription;
  }

  console.log('[Push] No active subscription');
  return null;
}

async function unsubscribeUser() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    const success = await subscription.unsubscribe();
    if (success) {
      console.log('[Push] Unsubscribed');
      // Beritahu server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
    }
  }
}
```

### UI Subscription Toggle

```javascript
// Push toggle button
const pushToggle = document.getElementById('push-toggle');

async function initPushUI() {
  const subscription = await checkSubscription();

  pushToggle.checked = !!subscription;
  pushToggle.addEventListener('change', async event => {
    if (event.target.checked) {
      const sub = await subscribeUser();
      if (sub) await saveSubscription(sub);
    } else {
      await unsubscribeUser();
    }
  });
}

// Tampilkan status di UI
async function updatePushStatus() {
  const status = document.getElementById('push-status');
  const sub = await checkSubscription();

  if (sub) {
    const permission = Notification.permission;
    status.textContent = `✅ Push aktif (${permission})`;
    status.className = 'push-active';
  } else {
    status.textContent = '❌ Push tidak aktif';
    status.className = 'push-inactive';
  }
}
```

## Service Worker: Handle Push Event

```javascript
// sw.js — handle push event

self.addEventListener('push', event => {
  console.log('[SW Push] Received:', event);

  let data = { title: 'Default Title', body: '', icon: '/icons/icon-192x192.png' };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: '/icons/badge-72x72.png',
    image: data.image,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      type: data.type || 'general',
      id: data.id || null,
      dateOfArrival: Date.now()
    },
    tag: data.tag || 'default',
    renotify: data.renotify || false,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );

  // Analytics
  logNotificationReceived(data);
});

function logNotificationReceived(data) {
  // Kirim ke analytics endpoint
  fetch('/api/analytics/push-received', {
    method: 'POST',
    body: JSON.stringify({
      type: data.type,
      timestamp: Date.now()
    }),
    keepalive: true
  }).catch(() => {});
}
```

### Notification Payload dari Server

```javascript
// Server → Push Service → Browser
const pushPayload = {
  title: 'Catatan Baru Tersimpan!',
  body: 'Catatan "Meeting Notes" berhasil di-sync ke cloud.',
  icon: '/icons/icon-192x192.png',
  badge: '/icons/badge-72x72.png',
  image: '/images/sync-complete.png',
  tag: 'sync-notes',
  renotify: false,
  requireInteraction: true,
  silent: false,
  vibrate: [200, 100, 200, 100, 100],
  data: {
    url: '/notes/123',
    type: 'sync',
    id: '123'
  },
  actions: [
    {
      action: 'open',
      title: 'Buka Catatan'
    },
    {
      action: 'dismiss',
      title: 'Tutup'
    }
  ],
  timestamp: Date.now()
};
```

## Handle Notification Click

```javascript
// sw.js — handle notification click

self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  let responsePromise;

  if (action === 'dismiss') {
    // User dismiss — gak perlu action
    responsePromise = Promise.resolve();
  } else if (action === 'open' || !action) {
    // Buka URL yang ditentukan
    responsePromise = handleOpenAction(data);
  } else if (action === 'reply') {
    // Buka halaman dengan reply mode
    responsePromise = handleReplyAction(data);
  } else if (action === 'snooze') {
    // Snooze notification — kirim reminder nanti
    responsePromise = handleSnoozeAction(data);
  } else {
    // Custom action
    responsePromise = handleCustomAction(action, data);
  }

  event.waitUntil(responsePromise);
});

async function handleOpenAction(data) {
  const urlToOpen = data.url || '/';

  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });

  // Cek apakah udah ada tab yang terbuka
  for (const client of clients) {
    if (client.url.includes(urlToOpen) && 'focus' in client) {
      return client.focus();
    }
  }

  // Kalo gak ada — buka tab baru
  if (clients.length === 0) {
    return self.clients.openWindow(urlToOpen);
  }

  // Fokus ke tab pertama
  return clients[0].focus();
}

async function handleReplyAction(data) {
  const replyUrl = `/notes/${data.id}/reply`;
  return self.clients.openWindow(replyUrl);
}

async function handleSnoozeAction(data) {
  // Register periodic sync untuk remind 30 menit lagi
  const registration = await self.registration;
  try {
    await registration.periodicSync.register('remind-' + data.id, {
      minInterval: 30 * 60 * 1000 // 30 menit
    });
  } catch {
    // Fallback: kirim notif lagi dalam 30 detik (simulasi)
    setTimeout(() => {
      self.registration.showNotification('Reminder: ' + (data.reminderTitle || 'Ada yang belum selesai'), {
        body: 'Klik untuk buka.',
        tag: 'reminder-' + data.id
      });
    }, 30000);
  }
}

function handleCustomAction(action, data) {
  // Handler buat custom actions
  console.log('[SW] Custom action:', action, data);
  return self.clients.openWindow(`/${action}?ref=${data.id}`);
}
```

### Notification Close Event

```javascript
self.addEventListener('notificationclose', event => {
  console.log('[SW] Notification dismissed without click:', event.notification.tag);

  // Bisa kirim analytics
  event.waitUntil(
    fetch('/api/analytics/push-dismissed', {
      method: 'POST',
      body: JSON.stringify({
        tag: event.notification.tag,
        timestamp: Date.now()
      })
    }).catch(() => {})
  );
});
```

## Sending Push dari Server

### Setup web-push (Node.js)

```bash
npm install web-push
```

```javascript
// server/push.js
const webpush = require('web-push');
require('dotenv').config();

// Konfigurasi VAPID
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Database subscriptions (simulasi array — ganti pake DB beneran)
let subscriptions = [];

// API: Subscribe
async function handleSubscribe(req, res) {
  const { endpoint, keys, userAgent } = req.body;

  // Validasi
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  // Simpan subscription
  subscriptions.push({
    endpoint,
    keys,
    userAgent,
    subscribedAt: new Date().toISOString(),
    active: true
  });

  console.log('[Push] New subscriber:', endpoint.slice(-20));
  res.json({ success: true });
}

// API: Unsubscribe
async function handleUnsubscribe(req, res) {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter(s => s.endpoint !== endpoint);
  console.log('[Push] Unsubscribed:', endpoint.slice(-20));
  res.json({ success: true });
}

// API: Get subscriptions (admin)
async function getSubscriptions(req, res) {
  res.json({
    total: subscriptions.length,
    subscriptions: subscriptions.map(s => ({
      endpoint: s.endpoint.slice(-20) + '...',
      userAgent: s.userAgent,
      subscribedAt: s.subscribedAt
    }))
  });
}

// Fungsi kirim push ke semua subscriber
async function sendPushToAll(payload) {
  const results = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth
          }
        },
        JSON.stringify(payload),
        {
          TTL: 24 * 60 * 60, // 24 jam — kalo offline, di-retry
          urgency: 'normal'   // 'low' | 'normal' | 'high'
        }
      );
      results.push({ endpoint: sub.endpoint.slice(-20), status: 'sent' });
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription expired / invalid — hapus
        console.log('[Push] Removing invalid subscription');
        subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
        results.push({ endpoint: sub.endpoint.slice(-20), status: 'removed' });
      } else {
        console.error('[Push] Send error:', err);
        results.push({ endpoint: sub.endpoint.slice(-20), status: 'failed', error: err.message });
      }
    }
  }

  return results;
}

// API: Trigger push broadcast
async function handleSendPush(req, res) {
  const { title, body, url, type, tag } = req.body;

  const payload = {
    title: title || 'Pemberitahuan',
    body: body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: tag || 'broadcast',
    requireInteraction: false,
    data: {
      url: url || '/',
      type: type || 'broadcast'
    },
    actions: [
      { action: 'open', title: 'Buka' },
      { action: 'dismiss', title: 'Tutup' }
    ]
  };

  const results = await sendPushToAll(payload);
  res.json({
    sent: results.filter(r => r.status === 'sent').length,
    removed: results.filter(r => r.status === 'removed').length,
    failed: results.filter(r => r.status === 'failed').length,
    details: results
  });
}

// API: Send push to specific user
async function sendPushToUser(endpoint, payload) {
  const sub = subscriptions.find(s => s.endpoint === endpoint);
  if (!sub) throw new Error('Subscription not found');

  await webpush.sendNotification(
    {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth
      }
    },
    JSON.stringify(payload)
  );
}

// Express Router
const express = require('express');
const router = express.Router();

router.post('/subscribe', handleSubscribe);
router.post('/unsubscribe', handleUnsubscribe);
router.get('/subscriptions', getSubscriptions);
router.post('/send', handleSendPush);
router.post('/send/:endpoint', async (req, res) => {
  try {
    await sendPushToUser(req.params.endpoint, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
```

### Express Server Setup

```javascript
// server/index.js
const express = require('express');
const pushRouter = require('./push');

const app = express();
app.use(express.json());
app.use('/api/push', pushRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] VAPID configured: ${!!process.env.VAPID_PUBLIC_KEY}`);
});
```

## Notification Actions & Interaktivitas

### Action Types

| Action | Ikon Deskriptif | Fungsi |
|--------|-----------------|--------|
| `open` | Buka | Navigasi ke URL |
| `dismiss` | Tutup | Tutup notifikasi |
| `reply` | Balas | Buka halaman reply |
| `snooze` | Tunda | Tunda 30 menit |
| `archive` | Arsip | Arsipkan (API call) |
| `mark-read` | Baca | Tandai sudah dibaca |
| `delete` | Hapus | Hapus entri |
| `custom` | ⋯ | Action kustom |

### Rich Notification

```javascript
// sw.js — rich notification dengan image & actions
function showRichNotification(data) {
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image || '/images/default-notif.png',
    vibrate: [200, 100, 200],
    silent: false,
    requireInteraction: true,
    tag: data.tag,

    // Data yang di-pass ke click handler
    data: {
      url: data.url,
      type: data.type,
      metadata: data.metadata
    },

    // Action buttons
    actions: [
      {
        action: 'open',
        title: '👀 Buka',
        icon: '/icons/action-view.png'
      },
      {
        action: 'archive',
        title: '📦 Arsipkan',
        icon: '/icons/action-archive.png'
      },
      {
        action: 'snooze',
        title: '⏰ Tunda 30m',
        icon: '/icons/action-snooze.png'
      },
      {
        action: 'dismiss',
        title: '✖ Tutup'
      }
    ]
  };

  return self.registration.showNotification(data.title, options);
}
```

### Inline Reply (Chrome Desktop)

```javascript
// sw.js — inline reply action
self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data;

  if (action === 'reply') {
    // Chrome 123+ support inline reply
    // event.reply akan berisi text dari user
    const replyText = event.reply || '';

    if (replyText) {
      // Kirim reply ke server
      fetch('/api/notes/' + data.id + '/reply', {
        method: 'POST',
        body: JSON.stringify({ text: replyText }),
        keepalive: true
      });
    }
  }

  notification.close();
});
```

### Notification dengan Progress Bar

```javascript
// Simulasi progress — update notif berulang
async function showProgressNotification() {
  let progress = 0;

  const notification = await self.registration.showNotification('Sync Progress', {
    body: `0% — Memulai sinkronisasi...`,
    tag: 'sync-progress',
    silent: true,
    requireInteraction: true
  });

  const interval = setInterval(async () => {
    progress += 10;

    await self.registration.showNotification('Sync Progress', {
      body: `${progress}% — Sinkronisasi...`,
      tag: 'sync-progress',
      silent: true,
      renotify: true  // Biar notifnya kedengeran
    });

    if (progress >= 100) {
      clearInterval(interval);
      await self.registration.showNotification('Sync Selesai ✅', {
        body: 'Semua catatan tersinkronisasi!',
        tag: 'sync-progress',
        icon: '/icons/icon-192x192.png'
      });
    }
  }, 1000);
}
```

## Notification Analytics

### Track di Client

```javascript
// sw.js — push analytics
self.addEventListener('push', event => {
  // ... show notification ...

  const analyticsData = {
    action: 'push_received',
    type: data.type || 'unknown',
    tag: data.tag || 'default',
    timestamp: Date.now(),
    clientTime: new Date().toISOString()
  };

  event.waitUntil(
    fetch('/api/analytics/push', {
      method: 'POST',
      body: JSON.stringify(analyticsData),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true  // Biar request tetap dikirim walau SW dimatikan
    }).catch(() => {})
  );
});

self.addEventListener('notificationclick', event => {
  const analyticsData = {
    action: 'notification_click',
    tag: event.notification.tag,
    actionName: event.action || 'default',
    timestamp: Date.now()
  };

  event.waitUntil(
    fetch('/api/analytics/push-click', {
      method: 'POST',
      body: JSON.stringify(analyticsData),
      keepalive: true
    }).catch(() => {})
  );
});
```

### Dashboard Analytics (Server)

```javascript
// server/analytics.js
const analytics = {
  totalSent: 0,
  totalReceived: new Set(),  // Set of endpoints
  totalClicks: new Set(),
  actions: {},
  daily: {}
};

function trackSent(payload) {
  analytics.totalSent++;
  const day = new Date().toISOString().slice(0, 10);
  analytics.daily[day] = analytics.daily[day] || { sent: 0, received: 0, clicks: 0 };
  analytics.daily[day].sent++;
}

function trackReceived(endpoint) {
  analytics.totalReceived.add(endpoint);
  const day = new Date().toISOString().slice(0, 10);
  analytics.daily[day] = analytics.daily[day] || { sent: 0, received: 0, clicks: 0 };
  analytics.daily[day].received++;
}

function trackClick(endpoint, action) {
  analytics.totalClicks.add(endpoint);
  analytics.actions[action] = (analytics.actions[action] || 0) + 1;
  const day = new Date().toISOString().slice(0, 10);
  analytics.daily[day] = analytics.daily[day] || { sent: 0, received: 0, clicks: 0 };
  analytics.daily[day].clicks++;
}

function getAnalytics() {
  return {
    totalSent: analytics.totalSent,
    totalReceived: analytics.totalReceived.size,
    totalClicks: analytics.totalClicks.size,
    ctr: analytics.totalSent > 0
      ? ((analytics.totalClicks.size / analytics.totalSent) * 100).toFixed(2) + '%'
      : '0%',
    actionsByType: analytics.actions,
    daily: analytics.daily
  };
}

app.get('/api/analytics/push-summary', (req, res) => {
  res.json(getAnalytics());
});
```

## Full Push Flow Implementation

```javascript
// === CLIENT SIDE ===
// push-client.js — init di halaman utama
import { subscribeUser, saveSubscription, checkSubscription } from './push-client.js';

async function initPush() {
  const sub = await checkSubscription();
  if (!sub) {
    // Tawarkan subscribe pas user melakukan action
    document.getElementById('enable-push').addEventListener('click', async () => {
      const newSub = await subscribeUser();
      if (newSub) {
        await saveSubscription(newSub);
        alert('Notifikasi aktif!');
      }
    });
  }
}

initPush();

// === SERVICE WORKER ===
// sw.js — lengkap
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: { url: data.url || '/', type: data.type },
    actions: data.actions || []
  };
  event.waitUntil(self.registration.showNotification(data.title || 'Notes App', options));
});

self.addEventListener('notificationclick', event => {
  console.log('[SW] Click:', event.action);
  event.notification.close();

  if (event.action !== 'dismiss') {
    const url = event.notification.data?.url || '/';
    event.waitUntil(self.clients.openWindow(url));
  }
});

// === SERVER SIDE ===
// Kirim push via API
fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Catatan Baru',
    body: 'Budi nambahin catatan "Meeting Notes"',
    url: '/notes/123',
    type: 'share',
    tag: 'share-notes'
  })
});
```

## Latihan

1. **Subscribe & save subscription** — Generate VAPID keys pake `npx web-push generate-vapid-keys`. Implementasi subscribe flow di client: minta izin, subscribe, kirim subscription ke server. Verifikasi subscription muncul di server console.

2. **Kirim push dari server** — Setup Express server dengan web-push. Implementasi endpoint POST `/api/push/send` yang kirim notifikasi ke semua subscriber. Payload: title, body, icon, data.url. Test pake curl atau Postman.

3. **Notification actions + click handling** — Tambah 2 action button di notifikasi: "Buka Catatan" dan "Arsipkan". Di `notificationclick`, handle masing-masing action. Buka URL kalo "Buka", kirim DELETE request kalo "Arsipkan". Log analytics ke console.

4. **Unsubscribe & cleanup** — Implementasi tombol "Nonaktifkan Notifikasi" di UI. Handle unsubscribe (client + server). Di server, cleanup subscription yang expired (status 410). Tampilkan status notifikasi (aktif/nonaktif) di halaman.
