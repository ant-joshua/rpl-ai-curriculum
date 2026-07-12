import type { RequestEvent } from '@sveltejs/kit';

export async function GET({ platform }: RequestEvent) {
	const db = platform.env.DB;
	try {
		await db.prepare('SELECT 1').run();
		return new Response(JSON.stringify({ status: 'ok', d1: 'connected' }), {
			headers: { 'content-type': 'application/json' },
		});
	} catch (e) {
		return new Response(JSON.stringify({ status: 'error', d1: 'disconnected', error: String(e) }), {
			status: 500,
			headers: { 'content-type': 'application/json' },
		});
	}
}
