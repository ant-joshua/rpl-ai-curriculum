import { getDB, jsonResponse } from '$lib/server/d1';

function csvEscape(val: unknown): string {
	if (val === null || val === undefined) return '';
	const s = String(val);
	if (s.includes(',') || s.includes('"') || s.includes('\n')) {
		return '"' + s.replace(/"/g, '""') + '"';
	}
	return s;
}

function rowsToCsv(columns: string[], rows: Record<string, unknown>[]): string {
	const header = columns.join(',');
	const body = rows.map(row => columns.map(col => csvEscape(row[col])).join(','));
	return [header, ...body].join('\n');
}

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const offeringId = url.searchParams.get('course_offering_id');

		const params: unknown[] = [];
		let where = 'WHERE 1=1';
		if (offeringId) { where += ' AND e.course_offering_id = ?'; params.push(offeringId); }

		const raw = await db.prepare(
			`SELECT
				COALESCE(u.display_name, '') AS nama_siswa,
				COALESCE(u.email, '') AS email,
				COALESCE(co.name, '') AS nama_kursus,
				COALESCE(e.role, '') AS peran,
				COALESCE(e.status, '') AS status,
				COALESCE(e.enrolled_at, '') AS tanggal_daftar,
				COALESCE(CAST(e.final_score AS TEXT), '') AS nilai_akhir
			FROM enrollments e
			LEFT JOIN users u ON e.user_id = u.id
			LEFT JOIN course_offerings co ON e.course_offering_id = co.id
			${where}
			ORDER BY e.enrolled_at DESC`
		).bind(...params).all();

		const columns = ['nama_siswa', 'email', 'nama_kursus', 'peran', 'status', 'tanggal_daftar', 'nilai_akhir'];
		const csv = rowsToCsv(columns, raw.results ?? []);

		const filename = offeringId ? `enrollments-${offeringId}.csv` : 'enrollments-all.csv';
		return new Response(csv, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': `attachment; filename="${filename}"`,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
