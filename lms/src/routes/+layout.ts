import type { LayoutLoad } from './$types';

export const load: LayoutLoad = () => {
	if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
		navigator.serviceWorker.register('/sw.js');
	}
	return {};
};
