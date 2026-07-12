import type { D1Database } from '@cloudflare/workers-types';
import { getDB, getDeviceId } from '$lib/server/d1';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

interface Row {
	user_id: string;
	xp: number;
	level: number;
	badge_count: number;
}

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const pathSlug = url.searchParams.get('path_slug');
		const currentDevice = url.searchParams.get('current_device') || '';

		let result;

		if (pathSlug) {
			// Filter by users who completed sessions in a specific path
			result = await db
				.prepare(`
					SELECT u.user_id, u.xp, u.level,
						COALESCE(b.badge_count, 0) AS badge_count
					FROM user_xp u
					LEFT JOIN (
						SELECT user_id, COUNT(*) AS badge_count
						FROM badges
						GROUP BY user_id
					) b ON u.user_id = b.user_id
					WHERE u.user_id IN (
						SELECT DISTINCT p.user_id
						FROM progress p
						WHERE p.module_slug = ?
					)
					ORDER BY u.xp DESC
					LIMIT 50
				`)
				.bind(pathSlug)
				.all<Row>();

			// If filtered results empty, fall back to all
			if (!result.results || result.results.length === 0) {
				result = await db
					.prepare(`
						SELECT u.user_id, u.xp, u.level,
							COALESCE(b.badge_count, 0) AS badge_count
						FROM user_xp u
						LEFT JOIN (
							SELECT user_id, COUNT(*) AS badge_count
							FROM badges
							GROUP BY user_id
						) b ON u.user_id = b.user_id
						ORDER BY u.xp DESC
						LIMIT 50
					`)
					.all<Row>();
			}
		} else {
			// Global leaderboard: top 50 by XP
			result = await db
				.prepare(`
					SELECT u.user_id, u.xp, u.level,
						COALESCE(b.badge_count, 0) AS badge_count
					FROM user_xp u
					LEFT JOIN (
						SELECT user_id, COUNT(*) AS badge_count
						FROM badges
						GROUP BY user_id
					) b ON u.user_id = b.user_id
					ORDER BY u.xp DESC
					LIMIT 50
				`)
				.all<Row>();
		}

		const entries: Row[] = result.results ? result.results.map((r: Row) => ({
			user_id: r.user_id,
			xp: r.xp || 0,
			level: r.level || 1,
			badge_count: r.badge_count || 0,
		})) : [];

		return json({
			success: true,
			data: entries,
			current_user: currentDevice,
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}
