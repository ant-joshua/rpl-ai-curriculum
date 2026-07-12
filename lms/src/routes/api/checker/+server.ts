import type { D1Database } from '@cloudflare/workers-types';
import { getDB, getDeviceId } from '$lib/server/d1';

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

interface CheckerRequest {
	exerciseSlug: string;
	code: string;
	language: string;
	output?: string;
	passed?: boolean;
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const body: CheckerRequest = await request.json();
		const { exerciseSlug, code, language, output, passed } = body;

		if (!exerciseSlug || !code || !language) {
			return json({ success: false, error: 'Missing required fields: exerciseSlug, code, language' }, 400);
		}

		// Basic static checks (server-side validation)
		const errors: string[] = [];
		if (code.length < 3) {
			errors.push('Code is too short');
		}
		if (code.includes('import ') && language === 'javascript') {
			errors.push('ES modules (import) not supported in browser runner');
		}

		// Determine pass status: explicit passed flag from frontend takes precedence,
		// otherwise check if no errors and code ran without exceptions
		const finalPassed = passed !== undefined ? passed : (errors.length === 0 && code.length > 0);

		// Save submission to D1
		const id = `sub-${deviceId}-${exerciseSlug}-${Date.now()}`;
		await db
			.prepare(
				'INSERT INTO submissions (id, user_id, exercise_slug, code, language, result, passed) VALUES (?, ?, ?, ?, ?, ?, ?)'
			)
			.bind(id, deviceId, exerciseSlug, code, language, output || '', finalPassed ? 1 : 0)
			.run();

		// If passed, award 15 XP
		if (finalPassed) {
			const now = new Date().toISOString();
			const existing = await db
				.prepare('SELECT xp FROM user_xp WHERE user_id = ?')
				.bind(deviceId)
				.first<{ xp: number }>();

			if (existing) {
				await db
					.prepare('UPDATE user_xp SET xp = xp + 15, updated_at = ? WHERE user_id = ?')
					.bind(now, deviceId)
					.run();
			} else {
				const xpId = `xp-${deviceId}`;
				await db
					.prepare('INSERT INTO user_xp (id, user_id, xp, level, updated_at) VALUES (?, ?, 15, 1, ?)')
					.bind(xpId, deviceId, now)
					.run();
			}
		}

		return json({
			success: true,
			passed: finalPassed,
			output: output || '',
			errors,
			xpAwarded: finalPassed ? 15 : 0,
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}
