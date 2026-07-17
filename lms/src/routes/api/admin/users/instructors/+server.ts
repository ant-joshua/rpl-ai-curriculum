import { jsonResponse, getDB } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }) {
	try {
		const db = getDB(platform);

		const { results } = await db.prepare(
			`SELECT id, display_name AS name, email, role
			 FROM users
			 WHERE role IN ('instructor', 'admin', 'superadmin')
			   AND is_active = 1
			 ORDER BY display_name ASC`
		).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
