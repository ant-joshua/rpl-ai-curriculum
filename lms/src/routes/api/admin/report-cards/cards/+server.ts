import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';
import { ReportCardRepository } from '$lib/repositories/report-card.repository';

export async function GET({ url, platform, request }: { url: URL; platform: App.Platform; request: Request }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);

		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);

		const db = getDB(platform);
		const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
		if (!user || !['superadmin', 'admin'].includes(user.role)) {
			return jsonResponse({ success: false, error: 'Forbidden — admin role required' }, 403);
		}

		const tenantId = url.searchParams.get('tenant_id') || session.user.tenant_id || 'default';
		const batchId = url.searchParams.get('batch_id') || undefined;
		const studentId = url.searchParams.get('student_id') || undefined;

		const repo = new ReportCardRepository(db, tenantId);
		const cards = await repo.listReportCards(tenantId, { batchId, studentId });

		return jsonResponse({ success: true, data: cards });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
