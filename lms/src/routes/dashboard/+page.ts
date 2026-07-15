import { modules } from '$lib/stores/modules';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	return {
		modules,
		...data,
	};
};
