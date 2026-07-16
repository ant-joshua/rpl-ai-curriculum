import { json } from '@sveltejs/kit';
import { SurveyRepository } from '$lib/repositories/survey.repository';

export async function GET({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new SurveyRepository(platform);
		const questions = await repo.getQuestions(tenantId, params.id);
		return json({ success: true, data: questions });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}
