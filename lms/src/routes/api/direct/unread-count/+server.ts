import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;

		const row = (await db
			.prepare('SELECT COUNT(*) AS c FROM direct_messages WHERE recipient_id = ? AND read_at IS NULL')
			.bind(userId)
			.first()) as any;

		return jsonResponse({ success: true, unread: row?.c || 0 });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}