import { getDB, jsonResponse } from '$lib/server/d1';

/**
 * GET /api/content/[dirName]
 *
 * Returns content_blocks for a module in the same format as the static
 * JSON files at /content/<dirName>.json — a flat map of sessionId -> markdown.
 *
 * The frontend module viewer uses this shape:
 *   { "01-session-id": "## markdown...", "02-other-session": "...", "README": "...", "quiz": "..." }
 *
 * This is a migration bridge: the frontend tries this API first, falls
 * back to the static /content/<dirName>.json URL.
 */
export async function GET({ params, platform }: { params: Record<string, string>; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const dirName = params.dirName;

		// Query all content_blocks for this module (identified by meta->dirName)
		const { results } = await db
			.prepare(
				`SELECT id, title, body, body_html, meta, order_index, visibility
				 FROM content_blocks
				 WHERE json_extract(meta, '$.dirName') = ?
				   AND visibility = 'published'
				 ORDER BY order_index ASC`
			)
			.bind(dirName)
			.all<any>();

		if (!results || results.length === 0) {
			return jsonResponse({ success: false, error: 'No content found for this module' }, 404);
		}

		// Build flat map: sessionId -> markdown content
		const contentMap: Record<string, string> = {};
		for (const block of results) {
			const meta = typeof block.meta === 'string' ? JSON.parse(block.meta || '{}') : (block.meta || {});
			const key = meta.sessionId || meta.type || block.id;
			// Prefer body (raw markdown), fall back to body_html
			const markdown = block.body || block.body_html || '';
			contentMap[key] = markdown;
		}

		return jsonResponse(contentMap);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
