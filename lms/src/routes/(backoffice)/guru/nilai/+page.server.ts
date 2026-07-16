import { getDB, jsonResponse } from '$lib/server/d1';

export async function load({ locals, platform }: { locals: App.Locals; platform: App.Platform }) {
	const user = locals.user;
	if (!user) {
		return { assignments: [] };
	}
	const db = getDB(platform);
	const tenantId = locals.tenant?.id || 'default';
	const rows = await db.prepare(`
		SELECT cs.id, cs.class_id, cs.subject_id, cs.semester,
			c.name AS class_name, c.code AS class_code,
			s.name AS subject_name, s.code AS subject_code
		FROM class_subjects cs
		JOIN classes c ON c.id = cs.class_id
		JOIN subjects s ON s.id = cs.subject_id
		WHERE cs.tenant_id = ? AND cs.teacher_id = ?
		ORDER BY c.name, s.name
	`).bind(tenantId, user.id).all<any>();
	return { assignments: rows.results || [] };
}
