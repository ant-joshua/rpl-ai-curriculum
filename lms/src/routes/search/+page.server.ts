import type { PageServerLoad } from './$types';

interface SearchResult {
	type: 'lesson' | 'course' | 'offering';
	title: string;
	url: string;
	snippet: string;
	icon: string;
}

export const load: PageServerLoad = async ({ url, fetch }) => {
	const q = url.searchParams.get('q')?.trim() || '';

	if (q.length < 2) {
		return { query: q, results: [] as SearchResult[], total: 0 };
	}

	try {
		const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=20`);
		if (!res.ok) {
			return { query: q, results: [] as SearchResult[], total: 0 };
		}
		const data = await res.json();
		return {
			query: q,
			results: (data.results || []) as SearchResult[],
			total: data.total || 0,
		};
	} catch {
		return { query: q, results: [] as SearchResult[], total: 0 };
	}
};
