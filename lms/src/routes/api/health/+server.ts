import type { RequestEvent } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { apiOk, apiError } from '$lib/server/api';

export async function GET({ platform }: RequestEvent) {
	if (!platform) {
		return apiError('Platform runtime unavailable', 500);
	}
	try {
		const db = getDB(platform as App.Platform);
		await db.prepare('SELECT 1').run();
		return apiOk({
			status: 'healthy',
			d1: 'connected',
			timestamp: new Date().toISOString(),
		});
	} catch (e) {
		return apiError(`Database check failed: ${String(e)}`, 500);
	}
}
