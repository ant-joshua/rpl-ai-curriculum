import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await fetch('/content/projects.json');
	const data = await res.json();
	const project = data.find((p: any) => p.slug === params.slug);
	if (!project) throw new Error('Project tidak ditemukan');
	return { project };
};
