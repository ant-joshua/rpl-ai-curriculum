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
					COALESCE(i.invoice_number, '') AS invoice_number,
					COALESCE(u.display_name, '') AS student_name,
					COALESCE(CAST(p.amount AS TEXT), '') AS amount,
					COALESCE(p.payment_type, '') AS payment_type,
					COALESCE(p.status, '') AS status,
					COALESCE(p.payment_date, '') AS payment_date,
					COALESCE(p.reference_number, '') AS reference_number
				FROM payments p
				LEFT JOIN invoices i ON p.invoice_id = i.id
				LEFT JOIN users u ON p.student_id = u.id
				ORDER BY p.payment_date DESC`,
			)
			.all();

		const columns = ['invoice_number', 'student_name', 'amount', 'payment_type', 'status', 'payment_date', 'reference_number'];
		const csv = rowsToCsv(columns, rows.results ?? []);

		return new Response(csv, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': 'attachment; filename="payments-export.csv"',
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
