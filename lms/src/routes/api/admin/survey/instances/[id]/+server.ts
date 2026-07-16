import { json, error } from '@sveltejs/kit';
import { SurveyRepository } from '$lib/repositories/survey.repository';

export async function GET({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new SurveyRepository(platform);
		const instance = await repo.getInstance(params.id, tenantId);
		if (!instance) throw error(404, 'Instance tidak ditemukan');
		return json({ success: true, data: instance });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function PUT({ request, params, platform, locals }: { request: Request; params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new SurveyRepository(platform);
		const body = await request.json();

		if (!body.status) {
			throw error(400, 'status wajib diisi');
		}

		const validStatuses = ['draft', 'active', 'closed', 'archived'];
		if (!validStatuses.includes(body.status)) {
			throw error(400, 'Status tidak valid. Gunakan: draft, active, closed, archived');
		}

		const instance = await repo.updateInstanceStatus(params.id, tenantId, body.status);
		if (!instance) throw error(404, 'Instance tidak ditemukan');
		return json({ success: true, data: instance });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}
