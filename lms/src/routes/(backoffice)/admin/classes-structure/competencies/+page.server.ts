import { getDB } from '$lib/server/d1';

export async function load({ locals, platform, url }: { locals: any; platform: App.Platform; url: URL }) {
	const user = locals.user;
	const tenantId = locals.tenant?.id || 'default';
	const db = getDB(platform);

	const subjectId = url.searchParams.get('subject_id');
	const type = url.searchParams.get('type');

	let query = 'SELECT kd.*, s.name AS subject_name FROM kompetensi_dasar kd JOIN subjects s ON s.id = kd.subject_id WHERE kd.tenant_id = ?';
	const params: any[] = [tenantId];

	if (subjectId) { query += ' AND kd.subject_id = ?'; params.push(subjectId); }
	if (type) { query += ' AND kd.type = ?'; params.push(type); }

	query += ' ORDER BY kd.code ASC';

	const kds = await db.prepare(query).bind(...params).all<any>();

	// Get subjects for filter
	const subjects = await db.prepare('SELECT id, name, code FROM subjects WHERE tenant_id = ? ORDER BY name').bind(tenantId).all<any>();

	return {
		kds: kds.results || [],
		subjects: subjects.results || [],
		filters: { subjectId, type }
	};
}
