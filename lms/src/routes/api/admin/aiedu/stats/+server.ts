import { getDB, jsonResponse } from '$lib/server/d1';

// GET /api/admin/aiedu/stats — AIEdu usage stats
export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		const totalDocs = await db.prepare('SELECT COUNT(*) as c FROM aiedu_documents').first<any>();
		const seedDocs = await db.prepare("SELECT COUNT(*) as c FROM aiedu_documents WHERE source = 'seed'").first<any>();
		const generatedDocs = await db.prepare("SELECT COUNT(*) as c FROM aiedu_documents WHERE source = 'generated'").first<any>();
		const totalGens = await db.prepare('SELECT COUNT(*) as c FROM aiedu_generations').first<any>();
		const totalChats = await db.prepare('SELECT COUNT(*) as c FROM aiedu_chat_threads').first<any>();
		const totalMessages = await db.prepare('SELECT COUNT(*) as c FROM aiedu_chat_messages').first<any>();
		const totalAnalyses = await db.prepare('SELECT COUNT(*) as c FROM aiedu_analyses').first<any>();
		const totalRapors = await db.prepare('SELECT COUNT(*) as c FROM aiedu_rapors').first<any>();

		// Generations per doc type
		const byType = await db.prepare(
			'SELECT doc_type, COUNT(*) as c FROM aiedu_generations GROUP BY doc_type ORDER BY c DESC'
		).all<any>();

		// Generations per user (top 10)
		const byUser = await db.prepare(
			`SELECT g.user_id, u.name, u.email, COUNT(*) as c
			 FROM aiedu_generations g JOIN users u ON u.id = g.user_id
			 GROUP BY g.user_id ORDER BY c DESC LIMIT 10`
		).all<any>();

		// Generations last 7 days
		const last7d = await db.prepare(
			"SELECT COUNT(*) as c FROM aiedu_generations WHERE created_at > datetime('now', '-7 days')"
		).first<any>();

		return jsonResponse({
			success: true,
			data: {
				totalDocs: totalDocs?.c ?? 0,
				seedDocs: seedDocs?.c ?? 0,
				generatedDocs: generatedDocs?.c ?? 0,
				totalGens: totalGens?.c ?? 0,
				totalChats: totalChats?.c ?? 0,
				totalMessages: totalMessages?.c ?? 0,
				totalAnalyses: totalAnalyses?.c ?? 0,
				totalRapors: totalRapors?.c ?? 0,
				last7d: last7d?.c ?? 0,
				byType: byType?.results || [],
				byUser: byUser?.results || [],
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
