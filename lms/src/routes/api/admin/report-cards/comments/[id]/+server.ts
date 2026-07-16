import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';
import { ReportCardRepository } from '$lib/repositories/report-card.repository';

export async function PUT({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);

		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);

		const db = getDB(platform);
		const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
		if (!user || !['superadmin', 'admin', 'teacher'].includes(user.role)) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const body = await request.json();
		const { comment } = body;

		if (!comment) {
			return jsonResponse({ success: false, error: 'comment required' }, 400);
		}

		const tenantId = session.user.tenant_id || 'default';
		const repo = new ReportCardRepository(db, tenantId);
		const updated = await repo.updateComment(params.id, tenantId, { comment });

		if (!updated) {
			return jsonResponse({ success: false, error: 'Comment not found' }, 404);
		}

		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
