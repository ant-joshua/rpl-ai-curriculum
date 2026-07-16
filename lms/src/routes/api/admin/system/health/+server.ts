import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const result = await db.prepare('SELECT 1 as alive').first<{ alive: number }>();

		return jsonResponse({
			database: result?.alive === 1 ? 'ok' : 'error',
			uptime: (platform.env as any)?.CF_WORKER?.created_at || 'unknown',
			version: '1.0.0',
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse(
			{ database: 'error', uptime: (platform.env as any)?.CF_WORKER?.created_at || 'unknown', version: '1.0.0', error: msg },
			500
		);
	}
}
