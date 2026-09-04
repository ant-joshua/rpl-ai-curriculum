import type { PageLoad } from './$types';
import { aiModules, getAiModule, getNextModule, getPrevModule } from '$lib/stores/ai-course';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const mod = getAiModule(params.slug);
	if (!mod) throw error(404, 'Module not found');

	const next = getNextModule(params.slug);
	const prev = getPrevModule(params.slug);

	return {
		slug: params.slug,
		module: mod,
		next,
		prev,
	};
};
