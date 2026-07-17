import { jsonResponse } from '$lib/server/d1';

/**
 * GET /api/admin/notifications/channels — list channels (v2 compatibility stub)
 * Returns empty array — channel config moved to per-type preferences.
 */
export async function GET({ platform, locals }: {
	platform: App.Platform;
	locals: Record<string, any>;
}): Promise<Response> {
	return jsonResponse({ success: true, data: [] });
}

export async function POST({ request, platform, locals }: {
	request: Request;
	platform: App.Platform;
	locals: Record<string, any>;
}): Promise<Response> {
	return jsonResponse({ success: false, error: 'Channels endpoint tidak aktif di v2. Gunakan /api/notifications/settings' }, 400);
}
