import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform, url }) => {
	if (!platform) throw redirect(302, '/?error=no-platform');

	const token = getBearerToken(request) || url.searchParams.get('token');
	if (!token) throw redirect(302, '/login?redirect=/instructor');

	const session = await getSession(platform, token);
	if (!session) throw redirect(302, '/login?redirect=/instructor');

	const userId = session.user.id;
	const db = getDB(platform);

	// --- Courses taught by this instructor ---
	const { results: courses } = await db.prepare(
		`SELECT co.id, co.name AS offering_name, co.status,
		        c.title AS course_title, c.icon AS course_icon,
		        (SELECT COUNT(*) FROM enrollments e WHERE e.course_offering_id = co.id AND e.status = 'active') AS active_enrollments,
		        (SELECT COUNT(*) FROM enrollments e WHERE e.course_offering_id = co.id) AS total_enrollments
		 FROM course_offerings co
		 JOIN courses c ON c.id = co.course_id
		 WHERE co.instructor_id = ? AND co.status != 'archived'
		 ORDER BY co.name ASC`
	).bind(userId).all<any>();

	const courseList = (courses || []).map(c => ({
		id: c.id,
		offeringName: c.offering_name,
		courseTitle: c.course_title,
		courseIcon: c.course_icon || '📚',
		status: c.status,
		activeEnrollments: c.active_enrollments ?? 0,
		totalEnrollments: c.total_enrollments ?? 0,
	}));

	const offeringIds = courseList.map(c => c.id);

	// --- Per-course stats ---
	const courseStats = new Map<string, { avgGrade: number; completionRate: number; attendanceRate: number }>();
	if (offeringIds.length > 0) {
		for (const oid of offeringIds) {
			// Avg grade from gradebook
			const { results: gradeRows } = await db.prepare(
				`SELECT AVG(score / max_score) * 100 as avg_grade
				 FROM gradebook
				 WHERE course_offering_id = ? AND score IS NOT NULL AND max_score > 0`
			).bind(oid).all<any>();
			const avgGrade = Math.round(gradeRows?.[0]?.avg_grade || 0);

			// Completion rate: completed enrollments / total
			const { results: compRows } = await db.prepare(
				`SELECT
					COUNT(*) as total,
					SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
				 FROM enrollments WHERE course_offering_id = ?`
			).bind(oid).all<any>();
			const totalEnr = compRows?.[0]?.total || 0;
			const completedEnr = compRows?.[0]?.completed || 0;
			const completionRate = totalEnr > 0 ? Math.round((completedEnr / totalEnr) * 100) : 0;

			// Attendance rate
			const { results: attSessions } = await db.prepare(
				`SELECT COUNT(*) as total FROM attendance_sessions WHERE course_offering_id = ?`
			).bind(oid).all<any>();
			const { results: attPresent } = await db.prepare(
				`SELECT COUNT(*) as total FROM attendance_records ar
				 JOIN attendance_sessions a_s ON a_s.id = ar.session_id
				 WHERE a_s.course_offering_id = ? AND ar.status = 'present'`
			).bind(oid).all<any>();
			const totalAtt = attSessions?.[0]?.total || 0;
			const totalPrs = attPresent?.[0]?.total || 0;
			const attendanceRate = totalAtt > 0 ? Math.round((totalPrs / totalAtt) * 100) : 0;

			courseStats.set(oid, { avgGrade, completionRate, attendanceRate });
		}
	}

	// --- Recent submissions needing grading ---
	const { results: pendingSubmissions } = await db.prepare(
		`SELECT asub.id, asub.submitted_at, asub.user_id,
		        a.title AS assessment_title, a.id AS assessment_id,
		        co.name AS offering_name, co.id AS offering_id,
		        u.display_name, u.avatar_url
		 FROM assessment_submissions asub
		 JOIN assessments a ON a.id = asub.assessment_id
		 JOIN course_offerings co ON co.id = a.course_offering_id
		 JOIN users u ON u.id = asub.user_id
		 WHERE asub.status = 'submitted'
		   AND co.instructor_id = ?
		 ORDER BY asub.submitted_at ASC
		 LIMIT 20`
	).bind(userId).all<any>();

	const { results: pendingAssignments } = await db.prepare(
		`SELECT asub.id, asub.submitted_at, asub.user_id,
		        a.title AS assignment_title, a.id AS assignment_id,
		        co.name AS offering_name, co.id AS offering_id,
		        u.display_name, u.avatar_url
		 FROM assignment_submissions asub
		 JOIN assignments a ON a.id = asub.assignment_id
		 JOIN course_offerings co ON co.id = a.course_offering_id
		 JOIN users u ON u.id = asub.user_id
		 WHERE asub.status = 'submitted'
		   AND co.instructor_id = ?
		 ORDER BY asub.submitted_at ASC
		 LIMIT 20`
	).bind(userId).all<any>();

	const pendingCount = (pendingSubmissions?.length || 0) + (pendingAssignments?.length || 0);

	// --- Upcoming deadlines ---
	const { results: upcomingDeadlines } = await db.prepare(
		`SELECT a.id, a.title, a.due_date, 'assessment' AS kind,
		        co.name AS offering_name, co.id AS offering_id
		 FROM assessments a
		 JOIN course_offerings co ON co.id = a.course_offering_id
		 WHERE co.instructor_id = ? AND a.due_date IS NOT NULL
		   AND a.due_date >= DATE('now') AND a.status = 'published'
		 UNION ALL
		 SELECT a.id, a.title, a.due_date, 'assignment' AS kind,
		        co.name AS offering_name, co.id AS offering_id
		 FROM assignments a
		 JOIN course_offerings co ON co.id = a.course_offering_id
		 WHERE co.instructor_id = ? AND a.due_date IS NOT NULL
		   AND a.due_date >= DATE('now') AND a.status = 'published'
		 ORDER BY due_date ASC
		 LIMIT 10`
	).bind(userId, userId).all<any>();

	return {
		courses: courseList,
		courseStats: Object.fromEntries(courseStats),
		pendingSubmissions: (pendingSubmissions || []).map(s => ({
			id: s.id,
			title: s.assessment_title,
			type: 'assessment',
			studentName: s.display_name || s.user_id?.slice(0, 8),
			avatarUrl: s.avatar_url || '',
			offeringName: s.offering_name,
			offeringId: s.offering_id,
			submittedAt: s.submitted_at,
		})),
		pendingAssignments: (pendingAssignments || []).map(s => ({
			id: s.id,
			title: s.assignment_title,
			type: 'assignment',
			studentName: s.display_name || s.user_id?.slice(0, 8),
			avatarUrl: s.avatar_url || '',
			offeringName: s.offering_name,
			offeringId: s.offering_id,
			submittedAt: s.submitted_at,
		})),
		pendingCount,
		upcomingDeadlines: (upcomingDeadlines || []).map(d => ({
			id: d.id,
			title: d.title,
			kind: d.kind,
			dueDate: d.due_date,
			offeringName: d.offering_name,
		})),
		token,
	};
};
