/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = 'rpl-lms-v1';
const STATIC_ASSETS = [
	'/',
	'/dashboard',
	'/progress',
	'/search',
	'/content/manifest.json',
];

// Install: pre-cache static assets
sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		})
	);
	sw.skipWaiting();
});

// Activate: clean old caches
sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
			);
		})
	);
	sw.clients.claim();
});

// Fetch: cache-first for content JSON, network-first for everything else
sw.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// Only handle same-origin requests
	if (url.origin !== sw.location.origin) return;

	// Content JSON: cache-first (large, rarely changes)
	if (url.pathname.startsWith('/content/') && url.pathname.endsWith('.json')) {
		event.respondWith(cacheFirst(event.request));
		return;
	}

	// App shell & API: network-first with cache fallback
	event.respondWith(networkFirst(event.request));
});

async function cacheFirst(request: Request): Promise<Response> {
	const cached = await caches.match(request);
	if (cached) return cached;
	try {
		const response = await fetch(request);
		if (response.ok) {
			const cache = await caches.open(CACHE);
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		return new Response('Offline', { status: 503 });
	}
}

async function networkFirst(request: Request): Promise<Response> {
	try {
		const response = await fetch(request);
		if (response.ok) {
			const cache = await caches.open(CACHE);
			cache.put(request, response.clone());
		}
		return response;
	} catch (e) {
		const cached = await caches.match(request);
		if (cached) return cached;
		// For page navigations, return the cached index (SPA fallback)
		if (request.mode === 'navigate') {
			const index = await caches.match('/');
			if (index) return index;
		}
		return new Response('Offline', { status: 503 });
	}
}
