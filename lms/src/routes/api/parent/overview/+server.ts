import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// GET /api/parent/overview — parent dashboard data for linked students
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);

		// Find parent account for this user
		const parent = await db.prepare(
			'SELECT * FROM parent_accounts WHERE user_id = ? LIMIT 1'
		).bind(session.user.id).first<any>();

		if (!parent) return jsonResponse({ success: false, error: 'Not a parent account', notParent: true }, 404);

		// Linked students
		const { results: links } = await db.prepare(`
			SELECT psl.id AS link_id, psl.relationship, psl.access_level,
			       u.id AS student_id, u.display_name, u.username, u.avatar_url
			FROM parent_student_links psl
			JOIN users u ON u.id = psl.student_id
			WHERE psl.parent_id = ?
		`).bind(parent.id).all<any>();

		const students = (links || []).map((l: any) => ({
			linkId: l.link_id,
			relationship: l.relationship,
			accessLevel: l.access_level,
			id: l.student_id,
			name: l.display_name || l.username,
			avatar: l.avatar_url || '',
		}));

		// Fetch per-student summary
		const studentsDetail = [];
		for (const s of students) {
			// Enrollments + courses
			const { results: enrollments } = await db.prepare(`
				SELECT e.course_offering_id, co.name AS offering_name, e.status, e.enrolled_at
				FROM enrollments e
				JOIN course_offerings co ON co.id = e.course_offering_id
				WHERE e.user_id = ? AND e.status IN ('active','completed')
				ORDER BY co.name
			`).bind(s.id).all<any>();

			// Gradebook avg
			const { results: gradeAgg } = await db.prepare(`
				SELECT AVG(score * 100.0 / max_score) AS avg_pct, COUNT(*) AS graded_count
				FROM gradebook WHERE user_id = ? AND max_score > 0
			`).bind(s.id).all<any>();

			// Attendance rate
			const { results: attAgg } = await db.prepare(`
				SELECT
					(SELECT COUNT(*) FROM attendance_records ar
					 JOIN attendance_sessions a_s ON a_s.id = ar.session_id
					 WHERE ar.user_id = ?) AS total,
					(SELECT COUNT(*) FROM attendance_records ar
					 JOIN attendance_sessions a_s ON a_s.id = ar.session_id
					 WHERE ar.user_id = ? AND ar.status = 'present') AS present
			`).bind(s.id, s.id).all<any>();

			// Recent grades
			const { results: recentGrades } = await db.prepare(`
				SELECT g.score, g.max_score, g.graded_at,
				       a.title AS assessment_title
				FROM gradebook g
				LEFT JOIN assessment_submissions asub ON asub.id = g.assessment_submission_id
				LEFT JOIN assessments a ON a.id = asub.assessment_id
				WHERE g.user_id = ? AND g.max_score > 0
				ORDER BY g.graded_at DESC LIMIT 5
			`).bind(s.id).all<any>();

			// Upcoming deadlines
			const { results: deadlines } = await db.prepare(`
				SELECT a.title, a.due_date
				FROM assessments a
				JOIN enrollments e ON e.course_offering_id = a.course_offering_id
				WHERE e.user_id = ? AND e.status = 'active'
				  AND a.due_date IS NOT NULL AND a.due_date >= DATE('now')
				  AND NOT EXISTS (SELECT 1 FROM assessment_submissions asub
				                   WHERE asub.assessment_id = a.id AND asub.user_id = ?)
				ORDER BY a.due_date ASC LIMIT 3
			`).bind(s.id, s.id).all<any>();

			// Unread messages from teachers
			const { results: unreadMsgs } = await db.prepare(`
				SELECT COUNT(*) AS cnt FROM parent_messages
				WHERE student_id = ? AND is_read = 0 AND sender_role IN ('teacher','admin')
			`).bind(s.id).all<any>();

			studentsDetail.push({
				...s,
				enrollments: (enrollments || []).map((e: any) => ({
					offeringId: e.course_offering_id,
					name: e.offering_name,
					status: e.status,
				})),
				avgGrade: Math.round(gradeAgg?.[0]?.avg_pct || 0),
				gradedCount: gradeAgg?.[0]?.graded_count || 0,
				attendance: (() => {
					const t = attAgg?.[0]?.total || 0;
					return t > 0 ? Math.round(((attAgg?.[0]?.present || 0) / t) * 100) : 0;
				})(),
				recentGrades: (recentGrades || []).map((g: any) => ({
					title: g.assessment_title || 'Nilai',
					score: g.score,
					maxScore: g.max_score,
					pct: Math.round((g.score / g.max_score) * 100),
					date: g.graded_at,
				})),
				deadlines: (deadlines || []).map((d: any) => ({
					title: d.title,
					due: d.due_date,
				})),
				unreadMessages: unreadMsgs?.[0]?.cnt || 0,
			});
		}

		return jsonResponse({
			success: true,
			data: {
				parent: { name: parent.name, relationship: parent.relationship },
				students: studentsDetail,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
