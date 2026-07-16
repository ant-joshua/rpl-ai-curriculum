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
					COALESCE(asess.title, '') AS session_title,
					COALESCE(asess.created_at, '') AS date,
					COALESCE(u.display_name, '') AS student_name,
					COALESCE(ar.status, '') AS status,
					COALESCE(ar.check_in_time, '') AS check_in_time,
					COALESCE(ar.notes, '') AS notes
				FROM attendance_records ar
				LEFT JOIN attendance_sessions asess ON ar.session_id = asess.id
				LEFT JOIN users u ON ar.student_id = u.id
				ORDER BY asess.created_at DESC, asess.title ASC`,
			)
			.all();

		const columns = ['session_title', 'date', 'student_name', 'status', 'check_in_time', 'notes'];
		const csv = rowsToCsv(columns, rows.results ?? []);

		return new Response(csv, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': 'attachment; filename="attendance-export.csv"',
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
