import { jsonResponse, getDB } from '$lib/server/d1';

// GET /api/cron/reminders — trigger notification check
// Designed to be called by external cron (Hermes, CF Workers Cron, etc.)
// No auth required — only accessible via internal/cron path
export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const now = new Date().toISOString();
		let sent = 0;

		// 1. Quiz due soon (24h) — notify enrolled students who haven't submitted
		const { results: dueAssessments } = await db.prepare(`
			SELECT a.id, a.title, a.due_date, co.id AS offering_id, co.name AS offering_name,
			       co.tenant_id
			FROM assessments a
			JOIN course_offerings co ON co.id = a.course_offering_id
			WHERE a.due_date IS NOT NULL
			  AND a.status = 'published'
			  AND a.due_date >= DATE('now')
			  AND a.due_date <= DATE('now', '+1 day')
		`).all<any>();

		for (const assessment of dueAssessments || []) {
			// Find enrolled students who haven't submitted
			const { results: missing } = await db.prepare(`
				SELECT e.user_id, u.display_name
				FROM enrollments e
				JOIN users u ON u.id = e.user_id
				WHERE e.course_offering_id = ? AND e.status = 'active'
				  AND NOT EXISTS (
					SELECT 1 FROM assessment_submissions asub
					WHERE asub.assessment_id = ? AND asub.user_id = e.user_id
				  )
			`).bind(assessment.offering_id, assessment.id).all<any>();

			for (const student of missing || []) {
				// Check if reminder already sent recently
				const { results: existing } = await db.prepare(`
					SELECT 1 FROM notifications
					WHERE user_id = ? AND title LIKE ?
					  AND created_at > DATE('now', '-12 hours')
					LIMIT 1
				`).bind(student.user_id, `%${assessment.title}%`).first<any>();

				if (!existing) {
					await db.prepare(`
						INSERT INTO notifications (id, user_id, tenant_id, title, message, type, is_read, created_at)
						VALUES (?, ?, ?, ?, ?, 'announcement', 0, ?)
					`).bind(
						crypto.randomUUID(),
						student.user_id,
						assessment.tenant_id,
						`⏰ Quiz mendekati tenggat: ${assessment.title}`,
						`Quiz "${assessment.title}" untuk ${assessment.offering_name} berakhir ${new Date(assessment.due_date + 'T23:59:59').toLocaleDateString('id-ID')}. Kerjakan sekarang!`,
						now
					).run();
					sent++;
				}
			}
		}

		// 2. Students below KKM — notify instructor
		const { results: belowKKM } = await db.prepare(`
			SELECT g.user_id, g.score, g.max_score, g.course_offering_id,
			       u.display_name AS student_name,
			       co.name AS offering_name, co.instructor_id, co.tenant_id,
			       a.title AS assessment_title
			FROM gradebook g
			JOIN users u ON u.id = g.user_id
			JOIN course_offerings co ON co.id = g.course_offering_id
			JOIN assessments a ON a.id = (SELECT assessment_id FROM assessment_submissions WHERE id = g.assessment_submission_id)
			WHERE g.graded_at > DATE('now', '-24 hours')
			  AND g.max_score > 0
			  AND (g.score * 100.0 / g.max_score) < COALESCE(a.passing_score, 60)
		`).all<any>();

		for (const row of belowKKM || []) {
			if (row.instructor_id) {
				const pct = Math.round((row.score / row.max_score) * 100);
				await db.prepare(`
					INSERT INTO notifications (id, user_id, tenant_id, title, message, type, is_read, created_at)
					VALUES (?, ?, ?, ?, ?, 'system', 0, ?)
				`).bind(
					crypto.randomUUID(),
					row.instructor_id,
					row.tenant_id,
					`📊 Siswa di bawah KKM: ${row.student_name}`,
					`${row.student_name} mendapat ${pct}% pada "${row.assessment_title}" di ${row.offering_name} (di bawah passing score).`,
					now
				).run();
				sent++;
			}
		}

		return jsonResponse({
			success: true,
			data: {
				dueAssessments: dueAssessments?.length || 0,
				missingStudents: (belowKKM || []).length,
				notificationsSent: sent,
				timestamp: now,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
