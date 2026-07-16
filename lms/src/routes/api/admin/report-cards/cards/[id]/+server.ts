import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';
import { ReportCardRepository } from '$lib/repositories/report-card.repository';

export async function GET({ params, url, platform, request }: { params: { id: string }; url: URL; platform: App.Platform; request: Request }): Promise<Response> {
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
		const repo = new ReportCardRepository(db, tenantId);
		const card = await repo.getReportCard(params.id, tenantId);

		if (!card) {
			return jsonResponse({ success: false, error: 'Report card not found' }, 404);
		}

		// Include sections if requested
		const includeSections = url.searchParams.get('include_sections') === 'true';
		let sections: any[] = [];
		if (includeSections) {
			sections = await repo.getSections(params.id, tenantId);
		}

		return jsonResponse({ success: true, data: { ...card, sections } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function PUT({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
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

		const body = await request.json();
		const { action } = body;

		if (!action || !['publish', 'archive'].includes(action)) {
			return jsonResponse({ success: false, error: 'action must be "publish" or "archive"' }, 400);
		}

		const tenantId = session.user.tenant_id || 'default';
		const repo = new ReportCardRepository(db, tenantId);

		let card;
		if (action === 'publish') {
			card = await repo.publishCard(params.id, tenantId, session.user.id);
		} else {
			card = await repo.archiveCard(params.id, tenantId);
		}

		if (!card) {
			return jsonResponse({ success: false, error: 'Report card not found' }, 404);
		}

		return jsonResponse({ success: true, data: card });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
