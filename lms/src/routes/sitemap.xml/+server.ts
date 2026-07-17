import { getDB } from '$lib/server/d1';

export async function GET({ platform, url }: { platform: App.Platform; url: URL }) {
	if (!platform) {
		return new Response('Platform not available', { status: 500 });
	}

	const db = getDB(platform);
	const baseUrl = `${url.protocol}//${url.host}`;

	// Static pages
	const staticPages = [
		{ loc: '/', priority: '1.0' },
		{ loc: '/catalog', priority: '0.9' },
		{ loc: '/learn', priority: '0.9' },
		{ loc: '/instructor', priority: '0.7' },
		{ loc: '/register/instructor', priority: '0.6' },
	];

	// Course offerings
	const { results: offerings } = await db.prepare(
		"SELECT id, name, updated_at FROM course_offerings WHERE status = 'active' OR status = 'archived'"
	).all<any>();

	// Admin pages (limited listing)
	const adminPages = [
		'/admin',
		'/admin/users',
		'/admin/enrollments',
		'/admin/course-catalog',
		'/admin/curriculum',
		'/admin/analytics',
		'/admin/instructor-applications',
		'/admin/notifications',
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `\t<url>
\t\t<loc>${baseUrl}${p.loc}</loc>
\t\t<priority>${p.priority}</priority>
\t</url>`).join('\n')}
${(offerings || []).map((o: any) => `\t<url>
\t\t<loc>${baseUrl}/learn/${o.id}</loc>
\t\t<lastmod>${o.updated_at || ''}</lastmod>
\t\t<priority>0.8</priority>
\t</url>`).join('\n')}
${adminPages.map(p => `\t<url>
\t\t<loc>${baseUrl}${p}</loc>
\t\t<priority>0.5</priority>
\t</url>`).join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=3600, public',
		},
	});
}
