import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		const [att, pay, grd, enr, usr] = await Promise.all([
			db.prepare('SELECT COUNT(*) as count FROM attendance_records').first<{ count: number }>(),
			db.prepare('SELECT COUNT(*) as count FROM payments').first<{ count: number }>(),
			db.prepare("SELECT COUNT(*) as count FROM assessment_submissions WHERE status IN ('submitted','graded','returned')").first<{ count: number }>(),
			db.prepare('SELECT COUNT(*) as count FROM enrollments').first<{ count: number }>(),
			db.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>(),
		]);

		return jsonResponse({
			success: true,
			data: {
				attendance: { total: att?.count ?? 0, lastExport: null },
				payments: { total: pay?.count ?? 0, lastExport: null },
				grades: { total: grd?.count ?? 0, lastExport: null },
				enrollments: { total: enr?.count ?? 0, lastExport: null },
				users: { total: usr?.count ?? 0, lastExport: null },
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
