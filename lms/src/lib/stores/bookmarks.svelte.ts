import { browser } from '$app/environment';
import { api } from '$lib/utils/api';

const STORAGE_KEY = 'lms-bookmarks';

function loadBookmarks(): string[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw) as string[];
	} catch {
		return [];
	}
}

function saveBookmarks(slugs: string[]) {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

function createBookmarksStore() {
	let slugs = $state<string[]>(loadBookmarks());

	let count = $derived(slugs.length);

	async function apiSync(moduleSlug: string): Promise<void> {
		if (!browser) return;
		const isBm = slugs.indexOf(moduleSlug) !== -1;
		await api('/api/bookmarks', {
			method: 'POST',
			body: JSON.stringify({
				module_slug: moduleSlug,
				session_id: null,
			}),
		});
		// server returns { bookmarked: bool }, we already toggled locally
	}

	/** Load bookmarks from API and merge into localStorage */
	async function fetchFromApi(): Promise<void> {
		if (!browser) return;
		try {
			const res = await api<Array<{ module_slug: string }>>('/api/bookmarks');
			if (res.success && res.data) {
				const apiSlugs = res.data.map((b) => b.module_slug);
				const merged = [...new Set([...slugs, ...apiSlugs])];
				slugs = merged;
				saveBookmarks(slugs);
			}
		} catch {
			// offline
		}
	}

	// Init: fetch from API once
	if (browser) {
		fetchFromApi();
	}

	function toggle(slug: string) {
		const idx = slugs.indexOf(slug);
		if (idx === -1) {
			slugs = [...slugs, slug];
		} else {
			slugs = slugs.filter(s => s !== slug);
		}
		saveBookmarks(slugs);
		// Async API sync
		apiSync(slug);
	}

	function isBookmarked(slug: string): boolean {
		return slugs.indexOf(slug) !== -1;
	}

	function getAll(): string[] {
		return slugs;
	}

	return {
		get slugs() { return slugs; },
		get count() { return count; },
		toggle,
		isBookmarked,
		getAll,
	};
}

export const bookmarks = createBookmarksStore();
