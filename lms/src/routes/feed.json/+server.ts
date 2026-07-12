import { modules } from '$lib/stores/modules';

export function GET() {
	const siteUrl = 'https://lms-syllabus.ant-joshua.my.id';
	const now = new Date().toISOString();

	const items = modules.map((mod) => ({
		id: `${siteUrl}/module/${mod.slug}`,
		url: `${siteUrl}/module/${mod.slug}`,
		title: mod.title,
		content_text: mod.description,
		date_published: now,
	}));

	const feed = {
		version: 'https://jsonfeed.org/version/1.1',
		title: 'RPL AI Curriculum',
		home_page_url: siteUrl,
		feed_url: `${siteUrl}/feed.json`,
		description:
			'Kurikulum Rekayasa Perangkat Lunak berbasis AI — 57 modul dari fundamental hingga AI development.',
		language: 'id',
		items,
	};

	return new Response(JSON.stringify(feed, null, 2), {
		headers: { 'content-type': 'application/json; charset=utf-8' },
	});
}
