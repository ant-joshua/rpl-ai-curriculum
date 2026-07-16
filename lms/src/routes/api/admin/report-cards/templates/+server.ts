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
		const educationLevel = url.searchParams.get('education_level') || undefined;

		const repo = new ReportCardRepository(db, tenantId);
		const templates = await repo.getTemplates(tenantId, educationLevel ? { educationLevel } : undefined);

		return jsonResponse({ success: true, data: templates });
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
		const { name, description, education_level, html_template, css_style, is_default } = body;

		if (!name || !html_template) {
			return jsonResponse({ success: false, error: 'name and html_template required' }, 400);
		}

		const tenantId = session.user.tenant_id || 'default';
		const repo = new ReportCardRepository(db, tenantId);
		const template = await repo.createTemplate(tenantId, {
			name,
			description,
			educationLevel: education_level,
			htmlTemplate: html_template,
			cssStyle: css_style,
			isDefault: is_default ?? false,
		});

		return jsonResponse({ success: true, data: template }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
