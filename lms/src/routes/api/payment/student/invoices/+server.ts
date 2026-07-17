import { jsonResponse } from '$lib/server/d1';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

/**
 * GET /api/payment/student/invoices
 * List invoices for the authenticated student.
 * Auth: Bearer token
 */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }) {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Session tidak valid' }, 401);
		}

		const db = getDB(platform);
		const studentId = session.user.id;

		// Get invoices for this student
		const rows = await db
			.prepare(
				`SELECT i.*,
					COALESCE(
						(SELECT SUM(p.amount) FROM payments p WHERE p.invoice_id = i.id AND p.status = 'verified'),
						0
					) as paid_amount
				 FROM invoices i
				 WHERE i.student_id = ?
				 ORDER BY i.created_at DESC`
			)
			.bind(studentId)
			.all<any>();

		const invoices = rows.results || [];

		// Attach items
		for (const inv of invoices) {
			const items = await db
				.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?')
				.bind(inv.id)
				.all<any>();
			inv.items = items.results || [];
		}

		return jsonResponse({ success: true, data: invoices });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
