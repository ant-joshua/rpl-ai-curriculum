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
					COALESCE(a.title, '') AS assessment_title,
					COALESCE(u.display_name, '') AS student_name,
					COALESCE(CAST(asub.score AS TEXT), '') AS score,
					COALESCE(asub.status, '') AS status,
					COALESCE(asub.submitted_at, '') AS submitted_at,
					COALESCE(asub.graded_at, '') AS graded_at,
					COALESCE(asub.feedback, '') AS feedback
				FROM assessment_submissions asub
				LEFT JOIN assessments a ON asub.assessment_id = a.id
				LEFT JOIN users u ON asub.user_id = u.id
				ORDER BY asub.submitted_at DESC`,
			)
			.all();

		const columns = ['assessment_title', 'student_name', 'score', 'status', 'submitted_at', 'graded_at', 'feedback'];
		const csv = rowsToCsv(columns, rows.results ?? []);

		return new Response(csv, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': 'attachment; filename="grades-export.csv"',
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
