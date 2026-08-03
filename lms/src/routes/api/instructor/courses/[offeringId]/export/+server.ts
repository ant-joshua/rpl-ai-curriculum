import { getDB } from '$lib/server/d1';
import { cachedDbFirst } from '$lib/server/cache';

// GET /api/instructor/courses/[offeringId]/export — full course as markdown bundle
export async function GET({ params, platform, locals }: { params: { offeringId: string }; platform: App.Platform; locals: Record<string, any> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;
		if (!user) return new Response('Unauthorized', { status: 401 });

		const offering = await cachedDbFirst<any>(
			db,
			`SELECT co.*, c.curriculum_id, cur.name AS curriculum_name, cur.type AS curriculum_type
			 FROM course_offerings co
			 JOIN courses c ON c.id = co.course_id
			 LEFT JOIN curricula cur ON cur.id = c.curriculum_id
			 WHERE co.id = ?`,
			[params.offeringId]
		);
		if (!offering) return new Response('Course not found', { status: 404 });
		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return new Response('Forbidden', { status: 403 });
		}

		// Lessons + content
		const { results: lessons } = await db.prepare(
			`SELECT l.id, l.title, l.slug, l.order_index, l.duration_minutes, l.is_optional, l.status, cb.body
			 FROM lessons l
			 LEFT JOIN content_blocks cb ON cb.id = l.content_block_id
			 WHERE l.course_offering_id = ?
			 ORDER BY l.order_index ASC`
		).bind(params.offeringId).all<any>();

		// Build markdown
		const lines: string[] = [];
		lines.push(`# ${offering.name}`);
		lines.push('');
		if (offering.code) lines.push(`**Kode:** ${offering.code}`);
		if (offering.curriculum_name) lines.push(`**Kurikulum:** ${offering.curriculum_name} (${offering.curriculum_type || ''})`);
		if (offering.start_date) lines.push(`**Mulai:** ${offering.start_date}`);
		if (offering.end_date) lines.push(`**Selesai:** ${offering.end_date}`);
		lines.push(`**Status:** ${offering.status}`);
		lines.push('');
		lines.push('---');
		lines.push('');

		const published = (lessons || []).filter((l: any) => l.status === 'published');
		const totalMinutes = published.reduce((s: number, l: any) => s + (Number(l.duration_minutes) || 0), 0);
		lines.push(`> ${published.length} lesson · ±${totalMinutes} menit · Kurikulum: ${offering.curriculum_name || 'Merdeka'}`);
		lines.push('');

		for (const l of published) {
			lines.push(`## ${l.order_index}. ${l.title}`);
			lines.push('');
			if (l.duration_minutes) lines.push(`> ⏱️ ${l.duration_minutes} menit${l.is_optional ? ' · opsional' : ''}`);
			lines.push('');
			if (l.body) {
				lines.push(l.body);
				lines.push('');
			}
			lines.push('---');
			lines.push('');
		}

		const md = lines.join('\n');
		const filename = `${offering.code || offering.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-kurikulum-${(offering.curriculum_name || 'merdeka').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;

		return new Response(md, {
			headers: {
				'Content-Type': 'text/markdown; charset=utf-8',
				'Content-Disposition': `attachment; filename="${filename}"`,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return new Response(msg, { status: 500 });
	}
}
