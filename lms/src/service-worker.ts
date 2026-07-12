/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = 'lms-cache-v1';

// Static assets: build output (JS/CSS) + static files (fonts, favicons, manifest.json)
const ASSETS = [...build, ...files];

// Install: pre-cache all static assets, activate immediately
sw.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}
	event.waitUntil(addFilesToCache());
	sw.skipWaiting();
});

// Activate: prune old caches, take control of all clients
sw.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}
	event.waitUntil(deleteOldCaches());
	sw.clients.claim();
});

// Fetch: network-first for content, cache-first for static assets
sw.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// Only handle same-origin GET requests
	if (url.origin !== sw.location.origin) return;
	if (event.request.method !== 'GET') return;

	const path = url.pathname;

	// Network-first for dynamic content
	if (
		(path.startsWith('/content/') && path.endsWith('.json')) ||
		path.startsWith('/pdfs/') ||
		path.startsWith('/references/')
	) {
		event.respondWith(networkFirst(event.request));
		return;
	}

	// Cache-first for all other requests (static assets, pages)
	event.respondWith(cacheFirst(event.request));
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
	} catch {
		// Offline: fall back to cache
		const cached = await caches.match(request);
		if (cached) return cached;

		// Navigations: serve cached index (SPA fallback)
		if (request.mode === 'navigate') {
			const index = await caches.match('/');
			if (index) return index;
		}

		return new Response('Offline', { status: 503 });
	}
}
