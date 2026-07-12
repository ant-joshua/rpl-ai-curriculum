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

interface StudyPlanRow {
	id: string;
	user_id: string;
	path_slug: string;
	start_date: string;
	target_date: string;
	daily_target: number;
	status: string;
	created_at: string;
	updated_at: string;
}

interface PlanProgressRow {
	id: string;
	plan_id: string;
	session_id: string;
	completed: number;
	completed_date: string | null;
}

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const deviceId = url.searchParams.get('device_id') || getDeviceId(request);

		// Fetch active study plan
		const plan = await db
			.prepare('SELECT * FROM study_plans WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1')
			.bind(deviceId, 'active')
			.first<StudyPlanRow>();

		if (!plan) {
			return json({ success: true, data: null });
		}

		// Fetch progress for this plan
		const progress = await db
			.prepare('SELECT session_id, completed, completed_date FROM plan_progress WHERE plan_id = ?')
			.bind(plan.id)
			.all<{ session_id: string; completed: number; completed_date: string | null }>();

		return json({
			success: true,
			data: {
				id: plan.id,
				pathSlug: plan.path_slug,
				startDate: plan.start_date,
				targetDate: plan.target_date,
				dailyTarget: plan.daily_target,
				status: plan.status,
				createdAt: plan.created_at,
				updatedAt: plan.updated_at,
				progress: progress?.results || [],
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
		const body: {
			id?: string;
			pathSlug?: string;
			startDate?: string;
			targetDate?: string;
			dailyTarget?: number;
			status?: string;
			progress?: { session_id: string; completed: number; completed_date?: string }[];
		} = await request.json();
		const deviceId = body.id?.replace('plan-', '') || getDeviceId(request);
		const now = new Date().toISOString();

		if (body.id) {
			// Update existing plan
			await db
				.prepare(
					'UPDATE study_plans SET path_slug = ?, target_date = ?, daily_target = ?, status = ?, updated_at = ? WHERE id = ? AND user_id = ?'
				)
				.bind(
					body.pathSlug || '',
					body.targetDate || '',
					body.dailyTarget || 1,
					body.status || 'active',
					now,
					body.id,
					deviceId
				)
				.run();

			// Update progress if provided
			if (body.progress && body.progress.length > 0) {
				for (const p of body.progress) {
					const existing = await db
						.prepare('SELECT id FROM plan_progress WHERE plan_id = ? AND session_id = ?')
						.bind(body.id, p.session_id)
						.first();

					if (existing) {
						await db
							.prepare('UPDATE plan_progress SET completed = ?, completed_date = ? WHERE plan_id = ? AND session_id = ?')
							.bind(p.completed, p.completed_date || null, body.id, p.session_id)
							.run();
					} else {
						const pid = `pp-${body.id}-${p.session_id}`;
						await db
							.prepare('INSERT INTO plan_progress (id, plan_id, session_id, completed, completed_date) VALUES (?, ?, ?, ?, ?)')
							.bind(pid, body.id, p.session_id, p.completed, p.completed_date || null)
							.run();
					}
				}
			}
		} else {
			// Create new plan
			const planId = `plan-${Date.now()}`;
			const userId = deviceId;

			// Deactivate any existing active plans
			await db
				.prepare('UPDATE study_plans SET status = ?, updated_at = ? WHERE user_id = ? AND status = ?')
				.bind('abandoned', now, userId, 'active')
				.run();

			await db
				.prepare(
					'INSERT INTO study_plans (id, user_id, path_slug, start_date, target_date, daily_target, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
				)
				.bind(
					planId,
					userId,
					body.pathSlug || '',
					body.startDate || now,
					body.targetDate || now,
					body.dailyTarget || 1,
					'active',
					now,
					now
				)
				.run();

			body.id = planId;
		}

		// Return updated plan
		const plan = await db
			.prepare('SELECT * FROM study_plans WHERE id = ?')
			.bind(body.id)
			.first<StudyPlanRow>();

		const progress = await db
			.prepare('SELECT session_id, completed, completed_date FROM plan_progress WHERE plan_id = ?')
			.bind(body.id)
			.all<{ session_id: string; completed: number; completed_date: string | null }>();

		return json({
			success: true,
			data: {
				id: plan?.id,
				pathSlug: plan?.path_slug,
				startDate: plan?.start_date,
				targetDate: plan?.target_date,
				dailyTarget: plan?.daily_target,
				status: plan?.status,
				createdAt: plan?.created_at,
				updatedAt: plan?.updated_at,
				progress: progress?.results || [],
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}
