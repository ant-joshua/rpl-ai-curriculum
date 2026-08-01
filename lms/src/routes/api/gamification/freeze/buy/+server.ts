import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { hasFeature } from '$lib/server/tenant-features';

const FREEZE_COST = 50; // XP per freeze
const MAX_FREEZES = 3;

/** POST /api/gamification/freeze/buy — spend XP to buy a streak freeze */
export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		if (!hasFeature(locals?.tenant, 'gamification')) {
			return jsonResponse({ success: false, error: 'Fitur gamification tidak aktif', disabled: true }, 403);
		}

		const db = getDB(platform);
		const userId = session.user.id;

		// Check current freeze count
		const freezeRow = await db.prepare(
			'SELECT quantity FROM user_streak_freezes WHERE user_id = ?'
		).bind(userId).first<{ quantity: number }>();
		const currentFreezes = freezeRow?.quantity ?? 0;
		if (currentFreezes >= MAX_FREEZES) {
			return jsonResponse({ success: false, error: `Maksimal ${MAX_FREEZES} streak freeze` }, 400);
		}

		// Check XP balance
		const xpRow = await db.prepare('SELECT total_xp FROM user_xp WHERE user_id = ?').bind(userId).first<{ total_xp: number }>();
		const totalXp = xpRow?.total_xp ?? 0;
		if (totalXp < FREEZE_COST) {
			return jsonResponse({
				success: false,
				error: `XP tidak cukup. Butuh ${FREEZE_COST} XP (punya ${totalXp})`,
				needXp: FREEZE_COST - totalXp,
			}, 400);
		}

		// Deduct XP: insert negative transaction
		await db.prepare(
			`INSERT INTO xp_transactions (id, user_id, amount, reason, reference_type, created_at)
			 VALUES (?, ?, ?, 'freeze_purchase', 'streak_freeze', datetime('now'))`
		).bind(crypto.randomUUID(), userId, -FREEZE_COST).run();

		// Update user_xp + level
		const newTotal = totalXp - FREEZE_COST;
		const newLevel = Math.max(1, Math.floor(newTotal / 100) + 1);
		await db.prepare(
			'UPDATE user_xp SET total_xp = ?, level = ?, updated_at = datetime(\'now\') WHERE user_id = ?'
		).bind(newTotal, newLevel, userId).run();

		// Add freeze
		await db.prepare(
			`INSERT INTO user_streak_freezes (id, user_id, quantity, created_at, updated_at)
			 VALUES (?, ?, 1, datetime('now'), datetime('now'))
			 ON CONFLICT (user_id) DO UPDATE SET quantity = MIN(quantity + 1, 3), updated_at = datetime('now')`
		).bind(crypto.randomUUID(), userId).run();

		return jsonResponse({
			success: true,
			data: { xpSpent: FREEZE_COST, newTotal, newLevel, freezes: Math.min(currentFreezes + 1, MAX_FREEZES) },
		}, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
