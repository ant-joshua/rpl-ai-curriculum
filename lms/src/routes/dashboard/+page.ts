import { modules } from '$lib/stores/modules';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return {
		modules
	};
};
