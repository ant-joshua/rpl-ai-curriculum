import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		const totalSubmissions = await db
			.prepare(
				"SELECT COUNT(*) as count FROM assessment_submissions WHERE status IN ('submitted', 'graded', 'returned')",
			)
			.first<{ count: number }>();

		const gradedCount = await db
			.prepare("SELECT COUNT(*) as count FROM assessment_submissions WHERE status = 'graded'")
			.first<{ count: number }>();

		const pendingCount = await db
			.prepare("SELECT COUNT(*) as count FROM assessment_submissions WHERE status = 'submitted'")
			.first<{ count: number }>();

		const gradeDist = await db
			.prepare(
				`SELECT
					SUM(CASE WHEN score >= 85 THEN 1 ELSE 0 END) as A,
					SUM(CASE WHEN score >= 75 AND score < 85 THEN 1 ELSE 0 END) as B,
					SUM(CASE WHEN score >= 65 AND score < 75 THEN 1 ELSE 0 END) as C,
					SUM(CASE WHEN score >= 55 AND score < 65 THEN 1 ELSE 0 END) as D,
					SUM(CASE WHEN score < 55 THEN 1 ELSE 0 END) as E
				 FROM assessment_submissions
				 WHERE status = 'graded' AND score IS NOT NULL`,
			)
			.first<{ A: number; B: number; C: number; D: number; E: number }>();

		const avgScore = await db
			.prepare(
				"SELECT AVG(score) as avg FROM assessment_submissions WHERE status = 'graded' AND score IS NOT NULL",
			)
			.first<{ avg: number | null }>();

		return jsonResponse({
			success: true,
			data: {
				totalSubmissions: totalSubmissions?.count ?? 0,
				gradedCount: gradedCount?.count ?? 0,
				pendingCount: pendingCount?.count ?? 0,
				gradeDistribution: {
					A: gradeDist?.A ?? 0,
					B: gradeDist?.B ?? 0,
					C: gradeDist?.C ?? 0,
					D: gradeDist?.D ?? 0,
					E: gradeDist?.E ?? 0,
				},
				avgScore: avgScore?.avg ?? 0,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
