import { json, error } from '@sveltejs/kit';
import { SurveyRepository } from '$lib/repositories/survey.repository';

export async function PUT({ request, params, platform, locals }: { request: Request; params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new SurveyRepository(platform);
		const body = await request.json();
		const template = await repo.updateTemplate(params.id, tenantId, {
			name: body.name,
			surveyType: body.surveyType,
			description: body.description,
			isActive: body.isActive,
		});
		if (!template) throw error(404, 'Template tidak ditemukan');
		return json({ success: true, data: template });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function DELETE({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new SurveyRepository(platform);
		await repo.deleteTemplate(params.id, tenantId);
		return json({ success: true });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}
