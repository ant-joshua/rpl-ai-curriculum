import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { token: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const { token } = params;

		if (!token) {
			return jsonResponse({ success: false, error: 'Token required' }, 400);
		}

		const record = await db
			.prepare('SELECT * FROM password_reset_tokens WHERE token = ?')
			.bind(token)
			.first<any>();

		if (!record) {
			return jsonResponse({ success: false, error: 'Invalid token' }, 404);
		}

		if (record.used === 1) {
			return jsonResponse({ success: false, error: 'Token already used' }, 400);
		}

		const now = new Date().toISOString();
		if (record.expires_at < now) {
			return jsonResponse({ success: false, error: 'Token expired' }, 400);
		}

		return jsonResponse({
			success: true,
			valid: true,
			user_id: record.user_id,
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
