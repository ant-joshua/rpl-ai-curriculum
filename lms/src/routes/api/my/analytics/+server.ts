import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// GET /api/my/analytics — real learning analytics from DB
// Returns: xp timeline, subject mastery, quiz performance, attendance, AI insights
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;

		// 1. XP + level from gamification
		const xpRow = await db.prepare(
			'SELECT xp, level FROM gamification_profiles WHERE user_id = ?'
		).bind(userId).first<any>();
		const totalXp = xpRow?.xp || 0;
		const level = xpRow?.level || Math.max(1, Math.floor(totalXp / 100) + 1);

		// 2. XP timeline — last 30 days from gamification_events
		const { results: xpEvents } = await db.prepare(`
			SELECT date(created_at) AS day, SUM(points) AS pts
			FROM gamification_events
			WHERE user_id = ? AND created_at >= datetime('now', '-30 days')
			GROUP BY date(created_at) ORDER BY day ASC
		`).bind(userId).all<any>();

		const xpTimeline: { day: string; pts: number }[] = (xpEvents || []).map((e: any) => ({
			day: e.day,
			pts: Number(e.pts) || 0,
		}));

		// 3. Quiz performance — submissions
		const { results: submissions } = await db.prepare(`
			SELECT asub.*, a.title, a.type, a.course_offering_id, co.name AS offering_name
			FROM assessment_submissions asub
			JOIN assessments a ON a.id = asub.assessment_id
			LEFT JOIN course_offerings co ON co.id = a.course_offering_id
			WHERE asub.user_id = ? AND asub.status = 'submitted'
			ORDER BY asub.submitted_at DESC LIMIT 50
		`).bind(userId).all<any>();

		const quizPerformance = (submissions || []).map((s: any) => ({
			id: s.id,
			title: s.title,
			type: s.type,
			offering: s.offering_name || '',
			score: s.score,
			maxScore: s.max_score,
			pct: s.max_score > 0 ? Math.round((s.score / s.max_score) * 100) : 0,
			passed: s.passed ? true : false,
			date: s.submitted_at,
		}));

		// 4. Subject mastery — group by offering
		const subjectMap = new Map<string, { total: number; earned: number; count: number }>();
		for (const s of quizPerformance) {
			const key = s.offering || 'Lainnya';
			const cur = subjectMap.get(key) || { total: 0, earned: 0, count: 0 };
			cur.total += s.maxScore;
			cur.earned += s.score;
			cur.count += 1;
			subjectMap.set(key, cur);
		}
		const subjectMastery = Array.from(subjectMap.entries()).map(([name, v]) => ({
			name,
			mastery: v.total > 0 ? Math.round((v.earned / v.total) * 100) : 0,
			count: v.count,
		})).sort((a, b) => b.mastery - a.mastery);

		// 5. Attendance
		const { results: attAgg } = await db.prepare(`
			SELECT
				(SELECT COUNT(*) FROM attendance_records ar WHERE ar.user_id = ?) AS total,
				(SELECT COUNT(*) FROM attendance_records ar WHERE ar.user_id = ? AND ar.status = 'present') AS present
		`).bind(userId, userId).all<any>();
		const attendancePct = attAgg?.[0]?.total > 0 ? Math.round((attAgg?.[0]?.present / attAgg?.[0]?.total) * 100) : 0;

		// 6. Streak from events
		const { results: streakRow } = await db.prepare(
			'SELECT current_streak, longest_streak FROM gamification_profiles WHERE user_id = ?'
		).bind(userId).first<any>();

		// 7. Strongest / weakest subjects
		const weakest = subjectMastery.length > 0 ? subjectMastery[subjectMastery.length - 1] : null;
		const strongest = subjectMastery.length > 0 ? subjectMastery[0] : null;

		// 8. AI insight (rule-based fallback, no extra API call)
		const insights: string[] = [];
		if (weakest && weakest.mastery < 65) {
			insights.push(`Fokuskan belajar di **${weakest.name}** (penguasaan ${weakest.mastery}%) — masih di bawah target 65%.`);
		}
		if (strongest && strongest.mastery >= 85) {
			insights.push(`Pertahankan performa di **${strongest.name}** (${strongest.mastery}%) — bagus!`);
		}
		if (quizPerformance.length > 0) {
			const recent = quizPerformance.slice(0, 5);
			const recentAvg = recent.reduce((a: number, s: any) => a + s.pct, 0) / recent.length;
			if (recentAvg >= 80) insights.push('Tren 5 quiz terakhir bagus, lanjutkan ritme belajarmu!');
			else if (recentAvg >= 60) insights.push('Skor 5 quiz terakhir stabil, coba tingkatkan dengan latihan practice mode.');
			else insights.push('Skor 5 quiz terakhir masih rendah — coba ulangi materi lalu gunakan practice mode.');
		}
		if (attendancePct > 0 && attendancePct < 75) {
			insights.push(`Kehadiran ${attendancePct}% di bawah 75% — usahakan hadir rutin agar tidak ketinggalan materi.`);
		}
		if (insights.length === 0) insights.push('Belum cukup data — kerjakan quiz dan materi untuk mendapatkan insight personal.');

		return jsonResponse({
			success: true,
			data: {
				totalXp,
				level,
				xpTimeline,
				quizPerformance,
				subjectMastery,
				attendancePct,
				streak: streakRow?.current_streak || 0,
				longestStreak: streakRow?.longest_streak || 0,
				insights,
				generatedAt: new Date().toISOString(),
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
