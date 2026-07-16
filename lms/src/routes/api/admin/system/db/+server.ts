import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		const [users, tenants, attendanceSessions, payments, enrollments, submissions, tablesRaw] =
			await Promise.all([
				db.prepare('SELECT count(*) as count FROM users').first<{ count: number }>(),
				db.prepare('SELECT count(*) as count FROM tenants').first<{ count: number }>(),
				db.prepare('SELECT count(*) as count FROM attendance_sessions').first<{ count: number }>(),
				db.prepare('SELECT count(*) as count FROM payments').first<{ count: number }>(),
				db.prepare('SELECT count(*) as count FROM enrollments').first<{ count: number }>(),
				db.prepare('SELECT count(*) as count FROM assessment_submissions').first<{ count: number }>(),
				db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all<{ name: string }>(),
			]);

		const tables = (tablesRaw?.results ?? []).map((r) => r.name);

		return jsonResponse({
			users: users?.count ?? 0,
			tenants: tenants?.count ?? 0,
			attendanceSessions: attendanceSessions?.count ?? 0,
			payments: payments?.count ?? 0,
			enrollments: enrollments?.count ?? 0,
			submissions: submissions?.count ?? 0,
			tableCount: tables.length,
			tables,
			dbSize: 'N/A',
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
