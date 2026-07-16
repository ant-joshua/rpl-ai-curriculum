import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }) {
	const db = getDB(platform);

	const classData = await db.prepare(`
		SELECT c.*, gl.name AS grade_level_name, gl.sequence AS grade_level_sequence,
					 m.name AS major_name, m.code AS major_code,
					 u.display_name AS homeroom_teacher_name
		FROM classes c
		LEFT JOIN grade_levels gl ON gl.id = c.grade_level_id
		LEFT JOIN majors m ON m.id = c.major_id
		LEFT JOIN users u ON u.id = c.homeroom_teacher_id
		WHERE c.id = ?
	`).bind(params.id).first<any>();

	if (!classData) {
		throw error(404, 'Kelas tidak ditemukan');
	}

	const students = await db.prepare(`
		SELECT cm.*, u.display_name, u.email
		FROM class_members cm
		LEFT JOIN users u ON u.id = cm.user_id
		WHERE cm.class_id = ? AND cm.role = 'student'
		ORDER BY cm.nis ASC
	`).bind(params.id).all();

	return json({ success: true, data: { ...classData, students: students.results } });
}

export async function PATCH({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }) {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const fields = ['name', 'code', 'homeroom_teacher_id', 'room', 'shift', 'grade_level_id', 'major_id'];
		const sets: string[] = [];
		const values: string[] = [];

		for (const f of fields) {
			if (body[f] !== undefined) {
				sets.push(`${f} = ?`);
				values.push(body[f]);
			}
		}

		if (sets.length === 0) {
			return json({ success: false, error: 'No fields to update' }, { status: 400 });
		}

		values.push(params.id);
		await db.prepare(`UPDATE classes SET ${sets.join(', ')} WHERE id = ?`).bind(...values).run();
		return json({ success: true });
	} catch (e) {
		return json({ success: false, error: String(e) }, { status: 500 });
	}
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }) {
	const db = getDB(platform);
	await db.prepare('DELETE FROM class_members WHERE class_id = ?').bind(params.id).run();
	await db.prepare('DELETE FROM class_subjects WHERE class_id = ?').bind(params.id).run();
	await db.prepare('DELETE FROM classes WHERE id = ?').bind(params.id).run();
	return json({ success: true });
}
