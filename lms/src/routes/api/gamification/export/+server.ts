import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { hasFeature } from '$lib/server/tenant-features';

/** GET /api/gamification/export — CSV of all XP transactions for the user */
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		if (!hasFeature(locals?.tenant, 'gamification')) {
			return jsonResponse({ success: false, error: 'Fitur gamification tidak aktif', disabled: true }, 403);
		}

		const db = getDB(platform);
		const userId = session.user.id;

		const { results: txs } = await db.prepare(
			`SELECT amount, reason, reference_type, reference_id, created_at
			 FROM xp_transactions
			 WHERE user_id = ?
			 ORDER BY created_at DESC`
		).bind(userId).all<any>();

		const rows = txs || [];
		const esc = (s: string) => `"${String(s ?? '').replace(/"/g, '""')}"`;
		const csv = [
			['Tanggal', 'Jumlah XP', 'Alasan', 'Referensi'].map(esc).join(','),
			...rows.map((r: any) => [r.created_at, r.amount, r.reason, r.reference_type ?? ''].map(esc).join(','))
		].join('\n');

		return new Response(csv, {
			status: 200,
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': `attachment; filename="xp-history-${new Date().toISOString().slice(0, 10)}.csv"`,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
