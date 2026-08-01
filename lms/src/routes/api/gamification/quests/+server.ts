import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { hasFeature } from '$lib/server/tenant-features';

function todayStr(): string {
	return new Date().toISOString().slice(0, 10);
}

interface QuestDef {
	key: string;
	title: string;
	description: string;
	target: number;
	xpReward: number;
}

function questDefs(): QuestDef[] {
	return [
		{
			key: 'complete_lessons',
			title: 'Selesaikan 2 Pelajaran',
			description: 'Tandai selesai 2 pelajaran hari ini',
			target: 2,
			xpReward: 30,
		},
		{
			key: 'earn_xp',
			title: 'Kumpulkan 50 XP',
			description: 'Dapatkan total 50 XP hari ini',
			target: 50,
			xpReward: 40,
		},
		{
			key: 'practice',
			title: 'Latihan 1 Soal Salah',
			description: 'Jawab 1 soal dari mode latihan',
			target: 1,
			xpReward: 20,
		},
		{
			key: 'streak',
			title: 'Pertahankan Streak',
			description: 'Belajar 3 hari berturut-turut',
			target: 3,
			xpReward: 25,
		},
	];
}

/** GET /api/gamification/quests — today's quests with progress */
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		if (!hasFeature(locals?.tenant, 'daily_quests')) {
			return jsonResponse({ success: false, error: 'Fitur quest tidak aktif', disabled: true }, 403);
		}

		const db = getDB(platform);
		const userId = session.user.id;
		const today = todayStr();

		// Ensure today's quests exist
		const defs = questDefs();
		for (const d of defs) {
			await db.prepare(
				`INSERT OR IGNORE INTO daily_quests (id, user_id, quest_date, quest_key, title, description, target, xp_reward)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
			).bind(
				`${userId}-${today}-${d.key}`,
				userId,
				today,
				d.key,
				d.title,
				d.description,
				d.target,
				d.xpReward
			).run();
		}

		const { results: quests } = await db.prepare(
			`SELECT quest_key, title, description, target, progress, xp_reward, claimed
			 FROM daily_quests WHERE user_id = ? AND quest_date = ? ORDER BY rowid`
		).bind(userId, today).all<any>();

		return jsonResponse({ success: true, data: quests || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** POST /api/gamification/quests/progress — increment a quest */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const body = await request.json();
		const { questKey, amount = 1 } = body;

		if (!questKey) return jsonResponse({ success: false, error: 'questKey required' }, 400);

		const today = todayStr();
		const result = await db.prepare(
			`UPDATE daily_quests SET progress = MIN(progress + ?, target)
			 WHERE user_id = ? AND quest_date = ? AND quest_key = ?
			 RETURNING progress, target, claimed, xp_reward`
		).bind(amount, userId, today, questKey).first<any>();

		if (!result) {
			// Quest row missing — try creating + updating
			const def = questDefs().find(d => d.key === questKey);
			if (def) {
				await db.prepare(
					`INSERT OR IGNORE INTO daily_quests (id, user_id, quest_date, quest_key, title, description, target, xp_reward)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
				).bind(`${userId}-${today}-${questKey}`, userId, today, questKey, def.title, def.description, def.target, def.xpReward).run();
				const retry = await db.prepare(
					`UPDATE daily_quests SET progress = MIN(progress + ?, target)
					 WHERE user_id = ? AND quest_date = ? AND quest_key = ?
					 RETURNING progress, target, claimed, xp_reward`
				).bind(amount, userId, today, questKey).first<any>();
				return jsonResponse({ success: true, data: retry });
			}
			return jsonResponse({ success: false, error: 'Unknown quest' }, 400);
		}

		return jsonResponse({ success: true, data: result });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** POST /api/gamification/quests/claim — claim XP reward for completed quest */
export async function PUT({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const body = await request.json();
		const { questKey } = body;

		if (!questKey) return jsonResponse({ success: false, error: 'questKey required' }, 400);

		const today = todayStr();
		const quest = await db.prepare(
			`SELECT * FROM daily_quests WHERE user_id = ? AND quest_date = ? AND quest_key = ?`
		).bind(userId, today, questKey).first<any>();

		if (!quest) return jsonResponse({ success: false, error: 'Quest not found' }, 404);
		if (quest.progress < quest.target) {
			return jsonResponse({ success: false, error: 'Quest not complete yet' }, 400);
		}
		if (quest.claimed) {
			return jsonResponse({ success: false, error: 'Already claimed' }, 400);
		}

		// Mark claimed
		await db.prepare(
			`UPDATE daily_quests SET claimed = 1 WHERE id = ?`
		).bind(quest.id).run();

		// Award XP
		await db.prepare(
			`INSERT INTO user_xp (user_id, total_xp, level)
			 VALUES (?, ?, 1)
			 ON CONFLICT (user_id) DO UPDATE SET total_xp = total_xp + ?`
		).bind(userId, quest.xp_reward, quest.xp_reward).run();

		await db.prepare(
			`INSERT INTO xp_transactions (id, user_id, amount, reason, reference_type, reference_id)
			 VALUES (?, ?, ?, 'quest_claim', 'daily_quest', ?)`
		).bind(crypto.randomUUID(), userId, quest.xp_reward, quest.id).run();

		return jsonResponse({ success: true, data: { claimed: true, xpAwarded: quest.xp_reward } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
