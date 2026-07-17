import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function GET({ request, url, platform }: {
	request: Request; url: URL; platform: App.Platform
}): Promise<Response> {
	try {
		const token = getBearerToken(request) || url.searchParams.get('token');
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session || !['admin', 'superadmin'].includes(session.user.role))
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);

		const db = getDB(platform);
		const startDate = url.searchParams.get('start') || '2000-01-01';
		const endDate = url.searchParams.get('end') || '2099-12-31';

		// Score distribution from assessment_submissions
		const { results: scores } = await db.prepare(
			`SELECT score, max_score FROM assessment_submissions
			 WHERE score IS NOT NULL AND max_score > 0 AND status = 'graded'
			   AND submitted_at >= ? AND submitted_at <= ?`
		).bind(startDate, endDate).all<any>();

		const buckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
		let totalScorePct = 0;
		let scoreCount = 0;

		for (const r of (scores || [])) {
			const pct = Math.round((r.score / r.max_score) * 100);
			totalScorePct += pct;
			scoreCount++;
			if (pct <= 20) buckets['0-20']++;
			else if (pct <= 40) buckets['21-40']++;
			else if (pct <= 60) buckets['41-60']++;
			else if (pct <= 80) buckets['61-80']++;
			else buckets['81-100']++;
		}

		const avgScore = scoreCount > 0 ? Math.round(totalScorePct / scoreCount) : 0;

		return jsonResponse({
			success: true,
			data: {
				buckets,
				avgScore,
				totalSubmissions: scoreCount,
				distribution: Object.entries(buckets).map(([range, count]) => ({ range, count })),
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
