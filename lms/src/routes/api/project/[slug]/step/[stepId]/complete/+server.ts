import type { D1Database } from '@cloudflare/workers-types';
import { getDB, getDeviceId } from '$lib/server/d1';

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-device-id' },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-device-id' } });
}

export async function POST({ params, request, platform }: { params: { slug: string; stepId: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const stepId = parseInt(params.stepId, 10);
		const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

		// Get project total steps
		const baseUrl = new URL(request.url).origin;
		const projRes = await fetch(`${baseUrl}/content/projects.json`);
		const projects = await projRes.json() as any[];
		const project = projects.find((p: any) => p.slug === params.slug);
		if (!project) return json({ success: false, error: 'Project tidak ditemukan' }, 404);

		const totalSteps = project.steps.length;
		const isLastStep = stepId >= totalSteps;

		// Upsert progress
		const existing = await db.prepare('SELECT * FROM project_progress WHERE user_id = ? AND project_slug = ?')
			.bind(deviceId, params.slug).first<any>();

		let completedSteps: number[] = existing ? JSON.parse(existing.completed_steps || '[]') : [];
		if (!completedSteps.includes(stepId)) completedSteps.push(stepId);

		const nextStep = isLastStep ? totalSteps : stepId + 1;

		const progId = `prog-${deviceId}-${params.slug}`;
		if (existing) {
			await db.prepare('UPDATE project_progress SET current_step = ?, completed_steps = ?, completed_at = ? WHERE user_id = ? AND project_slug = ?')
				.bind(nextStep, JSON.stringify(completedSteps), isLastStep ? now : null, deviceId, params.slug).run();
		} else {
			await db.prepare('INSERT INTO project_progress (id, user_id, project_slug, current_step, completed_steps, started_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
				.bind(progId, deviceId, params.slug, nextStep, JSON.stringify(completedSteps), now, isLastStep ? now : null).run();
		}

		// If last step, create completion record and award 50 XP
		if (isLastStep) {
			const compId = `comp-${deviceId}-${params.slug}`;
			await db.prepare('INSERT OR IGNORE INTO project_completions (id, user_id, project_slug, title, completed_at) VALUES (?, ?, ?, ?, ?)')
				.bind(compId, deviceId, params.slug, project.title, now).run();

			// Award 50 XP
			const existingXp = await db.prepare('SELECT xp FROM user_xp WHERE user_id = ?').bind(deviceId).first<{ xp: number }>();
			if (existingXp) {
				await db.prepare('UPDATE user_xp SET xp = xp + 50, updated_at = ? WHERE user_id = ?').bind(now, deviceId).run();
			} else {
				const xpId = `xp-${deviceId}`;
				await db.prepare('INSERT INTO user_xp (id, user_id, xp, level, updated_at) VALUES (?, ?, 50, 1, ?)').bind(xpId, deviceId, now).run();
			}
		}

		return json({
			success: true,
			data: {
				completed: isLastStep,
				next_step: isLastStep ? null : nextStep,
				completed_steps: completedSteps,
				xp_awarded: isLastStep ? 50 : 0,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}
