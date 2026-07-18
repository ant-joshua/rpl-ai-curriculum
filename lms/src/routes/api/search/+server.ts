import { getDB, jsonResponse } from '$lib/server/d1';
import { cachedDbQuery } from '$lib/server/cache';

interface SearchResultItem {
	type: 'lesson' | 'course' | 'offering';
	title: string;
	url: string;
	snippet: string;
	icon: string;
}

interface SearchResponse {
	results: SearchResultItem[];
	total: number;
	query: string;
}

function buildSnippet(text: string, query: string, maxLen = 120): string {
	if (!text) return '';
	const lower = text.toLowerCase();
	const qLower = query.toLowerCase();
	const idx = lower.indexOf(qLower);
	if (idx < 0) return text.slice(0, maxLen) + (text.length > maxLen ? '…' : '');

	const start = Math.max(0, idx - Math.floor((maxLen - qLower.length) / 2));
	const end = Math.min(text.length, start + maxLen);
	let snippet = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
	return snippet;
}

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const q = url.searchParams.get('q')?.trim();
		const type = url.searchParams.get('type') || 'all';
		const limit = Math.min(Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)), 50);

		if (!q || q.length < 2) {
			return jsonResponse({ results: [], total: 0, query: q || '' } satisfies SearchResponse);
		}

		const db = getDB(platform);
		const results: SearchResultItem[] = [];
		const likeParam = `%${q}%`;

		// Search courses
		if (type === 'all' || type === 'courses') {
			const { results: courses } = await cachedDbQuery<any>(
				db,
				`SELECT id, title, slug, description, icon
				 FROM courses
				 WHERE title LIKE ? OR description LIKE ?
				 ORDER BY title ASC
				 LIMIT ?`,
				[likeParam, likeParam, limit]
			);

			for (const c of courses) {
				results.push({
					type: 'course',
					title: c.title,
					url: `/learn/${c.slug}`,
					snippet: buildSnippet(c.description, q),
					icon: c.icon || '📚',
				});
			}
		}

		// Search course_offerings
		if (type === 'all' || type === 'offerings') {
			const { results: offerings } = await cachedDbQuery<any>(
				db,
				`SELECT co.id, co.name, co.code, c.title AS course_title, c.slug AS course_slug
				 FROM course_offerings co
				 JOIN courses c ON c.id = co.course_id
				 WHERE co.name LIKE ? OR co.code LIKE ?
				 ORDER BY co.name ASC
				 LIMIT ?`,
				[likeParam, likeParam, limit]
			);

			for (const o of offerings) {
				results.push({
					type: 'offering',
					title: o.name || o.course_title,
					url: `/learn/${o.course_slug}`,
					snippet: o.code ? `Kode: ${o.code} · ${o.course_title}` : o.course_title,
					icon: '🗓️',
				});
			}
		}

		// Search lessons + their content blocks
		if (type === 'all' || type === 'lessons') {
			// First: lessons with title match
			const { results: lessons } = await cachedDbQuery<any>(
				db,
				`SELECT l.id, l.title, l.slug, l.course_offering_id,
				        co.course_id, c.slug AS course_slug, c.title AS course_title
				 FROM lessons l
				 JOIN course_offerings co ON co.id = l.course_offering_id
				 JOIN courses c ON c.id = co.course_id
				 WHERE l.title LIKE ?
				 ORDER BY l.title ASC
				 LIMIT ?`,
				[likeParam, limit]
			);

			for (const l of lessons) {
				results.push({
					type: 'lesson',
					title: l.title,
					url: `/learn/${l.course_offering_id}/lessons/${l.slug}`,
					snippet: `Pelajaran dalam ${l.course_title}`,
					icon: '📖',
				});
			}

			// Then: content_blocks with body_html match (joined to lessons)
			if (results.length < limit) {
				const remaining = limit - results.length;
				const { results: blocks } = await cachedDbQuery<any>(
					db,
					`SELECT cb.id, cb.title AS block_title, cb.body_html,
					        l.id AS lesson_id, l.title AS lesson_title, l.slug AS lesson_slug,
					        l.course_offering_id
					 FROM content_blocks cb
					 JOIN lessons l ON l.content_block_id = cb.id
					 WHERE cb.body_html LIKE ?
					 ORDER BY cb.title ASC
					 LIMIT ?`,
					[likeParam, remaining]
				);

				for (const b of blocks) {
					// Strip HTML tags for snippet
					const plainText = (b.body_html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
					results.push({
						type: 'lesson',
						title: b.block_title || b.lesson_title,
						url: `/learn/${b.course_offering_id}/lessons/${b.lesson_slug}`,
						snippet: buildSnippet(plainText, q),
						icon: '📝',
					});
				}
			}
		}

		return jsonResponse({
			results,
			total: results.length,
			query: q,
		} satisfies SearchResponse);
	} catch (err) {
		console.error('Search API error:', err);
		return jsonResponse({ error: 'Internal server error' }, 500);
	}
}
