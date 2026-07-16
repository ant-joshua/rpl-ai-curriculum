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

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const { results: rows } = await db
			.prepare(
				`SELECT
					COALESCE(u.display_name, '') AS student_name,
					COALESCE(co.name, '') AS course_name,
					COALESCE(e.role, '') AS role,
					COALESCE(e.status, '') AS status,
					COALESCE(e.enrolled_at, '') AS enrolled_at,
					COALESCE(e.final_grade, '') AS final_grade,
					COALESCE(CAST(e.final_score AS TEXT), '') AS final_score
				FROM enrollments e
				LEFT JOIN users u ON e.user_id = u.id
				LEFT JOIN course_offerings co ON e.course_offering_id = co.id
				ORDER BY e.enrolled_at DESC`,
			)
			.all();

		const columns = ['student_name', 'course_name', 'role', 'status', 'enrolled_at', 'final_grade', 'final_score'];
		const csv = rowsToCsv(columns, rows.results ?? []);

		return new Response(csv, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': 'attachment; filename="enrollments-export.csv"',
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
