import { modules, type Module } from './modules';

export interface SearchResult {
	slug: string;
	dirName: string;
	title: string;
	matchType: 'module' | 'session' | 'content';
	matchPreview: string;
	sessionId?: string;
}

const contentCache = new Map<string, Record<string, string>>();
const pendingFetches = new Map<string, Promise<Record<string, string> | null>>();

async function getContent(dirName: string): Promise<Record<string, string> | null> {
	if (contentCache.has(dirName)) return contentCache.get(dirName)!;
	if (pendingFetches.has(dirName)) return pendingFetches.get(dirName)!;

	const promise = (async () => {
		try {
			const res = await fetch(`/content/${dirName}.json`);
			if (!res.ok) {
				contentCache.set(dirName, {});
				return null;
			}
			const data: Record<string, string> = await res.json();
			contentCache.set(dirName, data);
			return data;
		} catch {
			contentCache.set(dirName, {});
			return null;
		}
	})();

	pendingFetches.set(dirName, promise);
	return promise;
}

/**
 * Search modules, sessions, and session content.
 * Module/session matches are instant (from modules.ts).
 * Content matches lazy-fetch uncached content files in parallel.
 * Returns max 20 results, case-insensitive.
 */
export async function searchModules(query: string): Promise<SearchResult[]> {
	const q = query.toLowerCase().trim();
	if (!q) return [];

	const results: SearchResult[] = [];
	const modulesToFetch: Module[] = [];

	for (const mod of modules) {
		const titleLower = mod.title.toLowerCase();
		const descLower = mod.description.toLowerCase();

		// Module title & description match
		if (titleLower.includes(q) || descLower.includes(q)) {
			results.push({
				slug: mod.slug,
				dirName: mod.dirName,
				title: mod.title,
				matchType: 'module',
				matchPreview: mod.description.slice(0, 100),
			});
		}

		// Session title match (instant, from modules.ts)
		for (const session of mod.sessions) {
			if (session.title.toLowerCase().includes(q)) {
				results.push({
					slug: mod.slug,
					dirName: mod.dirName,
					title: session.title,
					matchType: 'session',
					matchPreview: mod.title,
					sessionId: session.id,
				});
			}
		}

		// Queue content fetch if not cached (lazy load)
		if (!contentCache.has(mod.dirName)) {
			modulesToFetch.push(mod);
		}
	}

	// Fetch all uncached content in parallel
	if (modulesToFetch.length > 0) {
		await Promise.all(modulesToFetch.map((m) => getContent(m.dirName)));
	}

	// Search session content
	for (const mod of modules) {
		const content = contentCache.get(mod.dirName);
		if (!content) continue;

		for (const [key, text] of Object.entries(content)) {
			const lowerText = text.toLowerCase();
			if (lowerText.includes(q)) {
				const idx = lowerText.indexOf(q);
				const start = Math.max(0, idx - 40);
				let preview =
					(start > 0 ? '\u2026' : '') +
					text.slice(start, start + 100) +
					(start + 100 < text.length ? '\u2026' : '');
				// Highlight matched term
				const lowerPreview = preview.toLowerCase();
				const matchIdx = lowerPreview.indexOf(q);
				if (matchIdx >= 0) {
					preview = preview.slice(0, matchIdx) +
						'<mark>' + preview.slice(matchIdx, matchIdx + q.length) + '</mark>' +
						preview.slice(matchIdx + q.length);
				}
				const matchingSession = mod.sessions.find((s) => s.id === key);
				results.push({
					slug: mod.slug,
					dirName: mod.dirName,
					title: matchingSession?.title ?? key,
					matchType: 'content',
					matchPreview: preview,
					sessionId: key,
				});
			}
		}
	}

	// Limit results to 20
	return results.slice(0, 20);
}
