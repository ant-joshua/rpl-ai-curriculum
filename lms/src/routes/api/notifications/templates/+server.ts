import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';
import { NotificationRepository } from '$lib/repositories/notification.repository';

// ── Helpers ─────────────────────────────────────
async function getUserAndTenant(request: Request, platform: App.Platform): Promise<{ userId: string; tenantId: string } | Response> {
	const token = getBearerToken(request);
	if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401) as any;
	const session = await getSession(platform, token);
	if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401) as any;
	const db = getDB(platform);
	const tenantRow = await db.prepare('SELECT tenant_id FROM users WHERE id = ?').bind(session.user.id).first<{ tenant_id: string }>();
	return { userId: session.user.id, tenantId: tenantRow?.tenant_id || 'default' };
}

function isErrorResponse(obj: any): obj is Response {
	return obj instanceof Response;
}

/**
 * GET /api/notifications/templates — list templates
 * POST /api/notifications/templates — create template
 */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const auth = await getUserAndTenant(request, platform);
		if (isErrorResponse(auth)) return auth;

		const url = new URL(request.url);
		const type = url.searchParams.get('type') || undefined;

		const templates = await NotificationRepository.getTemplates(platform, auth.tenantId, { type });
		return jsonResponse({ success: true, data: templates });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const auth = await getUserAndTenant(request, platform);
		if (isErrorResponse(auth)) return auth;

		const body = await request.json();
		if (!body.code || !body.type || !body.body_template) {
			return jsonResponse({ success: false, error: 'code, type, dan body_template wajib diisi' }, 400);
		}

		const validTypes = ['assessment','assignment','attendance','payment','grade','system','announcement'];
		if (!validTypes.includes(body.type)) {
			return jsonResponse({ success: false, error: 'Tipe notifikasi tidak valid' }, 400);
		}

		const template = await NotificationRepository.createTemplate(platform, auth.tenantId, {
			code: body.code,
			type: body.type,
			channels: body.channels,
			subject: body.subject,
			body_template: body.body_template,
			variables: body.variables ? JSON.stringify(body.variables) : undefined,
		});
		return jsonResponse({ success: true, data: template }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/**
 * PUT /api/notifications/templates — update template
 * DELETE /api/notifications/templates — delete template
 */
export async function PUT({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const auth = await getUserAndTenant(request, platform);
		if (isErrorResponse(auth)) return auth;

		const body = await request.json();
		if (!body.id) return jsonResponse({ success: false, error: 'id wajib diisi' }, 400);

		await NotificationRepository.updateTemplate(platform, body.id, auth.tenantId, body);
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const auth = await getUserAndTenant(request, platform);
		if (isErrorResponse(auth)) return auth;

		const body = await request.json();
		if (!body.id) return jsonResponse({ success: false, error: 'id wajib diisi' }, 400);

		await NotificationRepository.deleteTemplate(platform, body.id, auth.tenantId);
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
