import { jsonResponse, getDB } from '$lib/server/d1';

export async function GET({ platform, url }: { platform: App.Platform; url: URL }) {
	try {
		const db = getDB(platform);
		const baseUrl = `${url.protocol}//${url.host}`;

		const { results: offerings } = await db.prepare(
			`SELECT co.id, co.name, co.updated_at, c.title AS course_title, c.description AS course_description
			 FROM course_offerings co
			 JOIN courses c ON c.id = co.course_id
			 WHERE co.status = 'active' OR co.status = 'archived'
			 ORDER BY co.name ASC`
		).all<any>();

		const entries = (offerings || []).map((o: any) => ({
			loc: `${baseUrl}/learn/${o.id}`,
			lastmod: o.updated_at || '',
			priority: '0.8',
			courseTitle: o.course_title,
			courseDescription: o.course_description,
		}));

		return jsonResponse({ success: true, data: entries });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
