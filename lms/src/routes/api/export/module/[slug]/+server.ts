import { modules } from '$lib/stores/modules';

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET({ params, fetch }: { params: { slug: string }; fetch: typeof globalThis.fetch }): Promise<Response> {
	const slug = params.slug;
	const mod = modules.find(m => m.slug === slug);

	if (!mod) {
		return new Response(JSON.stringify({ error: 'Module not found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// Fetch module content JSON
	const res = await fetch(`/content/${mod.dirName}.json`);
	if (!res.ok) {
		return new Response(JSON.stringify({ error: 'Module content not found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const contentData: Record<string, string> = await res.json();
	const readmeContent = contentData['README'] || '';
	const cleaned = readmeContent.replace(/^---[\s\S]*?---\n*/, '').trim();

	// Build session content
	let sessionsHtml = '';
	for (const session of mod.sessions) {
		const raw = contentData[session.id];
		if (!raw) continue;
		const sessionBody = raw.replace(/^---[\s\S]*?---\n*/, '').trim();
		sessionsHtml += `
			<section class="session">
				<h2>${escapeHtml(session.title)}</h2>
				<div class="session-content">
					${sessionBody}
				</div>
			</section>
		`;
	}

	const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(mod.title)} — RPL AI Curriculum</title>
<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body {
		font-family: 'Inter', -apple-system, sans-serif;
		line-height: 1.8;
		color: #1e293b;
		background: #fff;
		padding: 40px;
		max-width: 900px;
		margin: 0 auto;
	}
	h1 { font-size: 28px; margin-bottom: 8px; color: #0f172a; }
	h2 { font-size: 22px; margin: 24px 0 12px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
	h3 { font-size: 18px; margin: 20px 0 8px; color: #334155; }
	p { margin-bottom: 12px; }
	pre { background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 16px; font-size: 13px; }
	code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
	pre code { background: none; padding: 0; }
	ul, ol { margin-bottom: 12px; padding-left: 24px; }
	li { margin-bottom: 4px; }
	img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
	blockquote { border-left: 4px solid #3b82f6; padding: 12px 16px; background: #f8fafc; margin-bottom: 16px; }
	table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
	th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
	th { background: #f1f5f9; font-weight: 600; }
	a { color: #3b82f6; }
	.module-meta { color: #64748b; font-size: 14px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
	.session { margin-bottom: 32px; }
	.session-content { font-size: 15px; }
	.module-desc { font-size: 15px; color: #475569; margin-bottom: 24px; }
	@media print {
		body { padding: 20px; }
		.session { page-break-inside: avoid; }
		pre { page-break-inside: avoid; }
	}
</style>
</head>
<body>
	<h1>${escapeHtml(mod.title)}</h1>
	<p class="module-desc">${escapeHtml(mod.description)}</p>
	<div class="module-meta">
		<span>Tingkat: ${mod.level}</span>
		<span> &middot; </span>
		<span>${mod.sessions.length} sesi</span>
	</div>
	${sessionsHtml}
</body>
</html>`;

	return new Response(html, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Content-Disposition': `attachment; filename="${mod.slug}-module.html"`,
		},
	});
}
