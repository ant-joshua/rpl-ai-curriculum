export async function GET({ url }: { url: URL }) {
	const baseUrl = `${url.protocol}//${url.host}`;

	const text = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /my/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml
`;

	return new Response(text, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=86400, public',
		},
	});
}
