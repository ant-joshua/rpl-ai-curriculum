import type { D1Database } from '@cloudflare/workers-types';
import { getDB, getDeviceId } from '$lib/server/d1';

const XP_PER_LEVEL = 100;

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, x-device-id',
	};
}

function json(data: unknown, status = 200): Response {
	const body = JSON.stringify(data);
	return new Response(body, {
		status,
		headers: { 'Content-Type': 'application/json', ...corsHeaders() },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: corsHeaders() });
}

interface XpRow {
	id: string;
	user_id: string;
	xp: number;
	updated_at: string;
}

interface BadgeRow {
	id: string;
	user_id: string;
	badge_id: string;
	unlocked_at: string;
}

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const deviceId = url.searchParams.get('device_id') || getDeviceId(request);

		// Fetch XP
		const xpResult = await db
			.prepare('SELECT xp, level FROM user_xp WHERE user_id = ?')
			.bind(deviceId)
			.first<{ xp: number; level: number }>();

		const currentXp = xpResult?.xp || 0;
		const level = Math.max(1, Math.floor(currentXp / XP_PER_LEVEL) + 1);

		// Fetch unlocked badges
		const badgeResult = await db
			.prepare('SELECT badge_id FROM badges WHERE user_id = ?')
			.bind(deviceId)
			.all<{ badge_id: string }>();

		const badges = badgeResult?.results?.map((r) => r.badge_id) || [];

		return json({
			success: true,
			data: {
				xp: currentXp,
				level,
				badges,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body: { xp?: number; device_id?: string; badge_ids?: string[] } = await request.json();
		const deviceId = body.device_id || getDeviceId(request);
		const xpAmount = body.xp || 0;
		const now = new Date().toISOString();

		// Upsert XP
		if (xpAmount > 0) {
			const existing = await db
				.prepare('SELECT xp FROM user_xp WHERE user_id = ?')
				.bind(deviceId)
				.first<{ xp: number }>();

			if (existing) {
				await db
					.prepare('UPDATE user_xp SET xp = xp + ?, updated_at = ? WHERE user_id = ?')
					.bind(xpAmount, now, deviceId)
					.run();
			} else {
				const id = `xp-${deviceId}`;
				await db
					.prepare('INSERT INTO user_xp (id, user_id, xp, level, updated_at) VALUES (?, ?, ?, 1, ?)')
					.bind(id, deviceId, xpAmount, now)
					.run();
			}
		}

		// Store new badges if provided
		if (body.badge_ids && body.badge_ids.length > 0) {
			for (const badgeId of body.badge_ids) {
				const existing = await db
					.prepare('SELECT id FROM badges WHERE user_id = ? AND badge_id = ?')
					.bind(deviceId, badgeId)
					.first();

				if (!existing) {
					const id = `badge-${deviceId}-${badgeId}`;
					await db
						.prepare('INSERT INTO badges (id, user_id, badge_id, unlocked_at) VALUES (?, ?, ?, ?)')
						.bind(id, deviceId, badgeId, now)
						.run();
				}
			}
		}

		// Return new state
		const xpResult = await db
			.prepare('SELECT xp, level FROM user_xp WHERE user_id = ?')
			.bind(deviceId)
			.first<{ xp: number }>();

		const currentXp = xpResult?.xp || 0;
		const level = Math.max(1, Math.floor(currentXp / XP_PER_LEVEL) + 1);

		const badgeResult = await db
			.prepare('SELECT badge_id FROM badges WHERE user_id = ?')
			.bind(deviceId)
			.all<{ badge_id: string }>();

		const badges = badgeResult?.results?.map((r) => r.badge_id) || [];

		return json({
			success: true,
			data: {
				xp: currentXp,
				level,
				badges,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}
