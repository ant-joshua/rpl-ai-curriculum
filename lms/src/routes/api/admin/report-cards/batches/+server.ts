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
		const status = url.searchParams.get('status') || undefined;

		const repo = new ReportCardRepository(db, tenantId);
		const batches = await repo.listBatches(tenantId, status ? { status } : undefined);

		return jsonResponse({ success: true, data: batches });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
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
		const { template_id, academic_year, semester, grade_level_id, class_ids } = body;

		if (!template_id || !academic_year || semester === undefined || !grade_level_id || !class_ids?.length) {
			return jsonResponse({ success: false, error: 'template_id, academic_year, semester, grade_level_id, and class_ids required' }, 400);
		}

		const tenantId = session.user.tenant_id || 'default';
		const repo = new ReportCardRepository(db, tenantId);
		const batch = await repo.createBatch(tenantId, {
			templateId: template_id,
			academicYear: academic_year,
			semester,
			gradeLevelId: grade_level_id,
			classIds: class_ids,
		}, session.user.id);

		return jsonResponse({ success: true, data: batch }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
