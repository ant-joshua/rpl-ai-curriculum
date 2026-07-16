import { json, error } from '@sveltejs/kit';
import { SurveyRepository } from '$lib/repositories/survey.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new SurveyRepository(platform);
		const status = url.searchParams.get('status') || undefined;
		const instances = await repo.listInstances(tenantId, status ? { status } : undefined);
		return json({ success: true, data: instances });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new SurveyRepository(platform);
		const body = await request.json();

		if (!body.templateId || !body.title) {
			throw error(400, 'templateId dan title wajib diisi');
		}

		const instance = await repo.createInstance(tenantId, {
			templateId: body.templateId,
			title: body.title,
			targetType: body.targetType,
			targetId: body.targetId,
			startDate: body.startDate,
			endDate: body.endDate,
		});
		return json({ success: true, data: instance }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}
