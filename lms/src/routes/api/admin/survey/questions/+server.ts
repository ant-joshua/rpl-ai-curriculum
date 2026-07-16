import { json, error } from '@sveltejs/kit';
import { SurveyRepository } from '$lib/repositories/survey.repository';

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new SurveyRepository(platform);
		const body = await request.json();

		if (!body.templateId || !body.questionText) {
			throw error(400, 'templateId dan questionText wajib diisi');
		}

		const question = await repo.createQuestion(tenantId, {
			templateId: body.templateId,
			questionText: body.questionText,
			questionType: body.questionType,
			options: body.options,
			required: body.required,
			sortOrder: body.sortOrder,
		});
		return json({ success: true, data: question }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}
