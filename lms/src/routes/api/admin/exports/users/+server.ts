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
					COALESCE(username, '') AS username,
					COALESCE(display_name, '') AS display_name,
					COALESCE(email, '') AS email,
					COALESCE(role, '') AS role,
					COALESCE(avatar_url, '') AS avatar_url,
					COALESCE(created_at, '') AS created_at
				FROM users
				ORDER BY created_at DESC`,
			)
			.all();

		const columns = ['username', 'display_name', 'email', 'role', 'avatar_url', 'created_at'];
		const csv = rowsToCsv(columns, rows.results ?? []);

		return new Response(csv, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': 'attachment; filename="users-export.csv"',
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
