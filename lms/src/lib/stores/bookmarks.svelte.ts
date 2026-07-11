import { browser } from '$app/environment';

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

	function toggle(slug: string) {
		const idx = slugs.indexOf(slug);
		if (idx === -1) {
			slugs = [...slugs, slug];
		} else {
			slugs = slugs.filter(s => s !== slug);
		}
		saveBookmarks(slugs);
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
