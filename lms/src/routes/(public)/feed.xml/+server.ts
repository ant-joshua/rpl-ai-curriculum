import { modules } from '$lib/stores/modules';

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export function GET() {
	const siteUrl = 'https://lms-syllabus.ant-joshua.my.id';
	const now = new Date().toUTCString();

	const items = modules
		.map(
			(mod) => `
		<item>
			<title>${escapeXml(mod.title)}</title>
			<link>${siteUrl}/module/${mod.slug}</link>
			<description>${escapeXml(mod.description)}</description>
			<guid isPermaLink="true">${siteUrl}/module/${mod.slug}</guid>
			<pubDate>${now}</pubDate>
		</item>`
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>RPL AI Curriculum</title>
		<link>${siteUrl}</link>
		<description>Kurikulum Rekayasa Perangkat Lunak berbasis AI — 57 modul dari fundamental hingga AI development.</description>
		<language>id</language>
		<lastBuildDate>${now}</lastBuildDate>
		<atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
	</channel>
</rss>`;

	return new Response(xml, {
		headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
	});
}
