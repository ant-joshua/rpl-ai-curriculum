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

interface SubmissionRow {
	id: string;
	user_id: string;
	exercise_slug: string;
	code: string;
	language: string;
	result: string;
	passed: number;
	submitted_at: string;
}

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const url = new URL(request.url);
		const exerciseSlug = url.searchParams.get('exercise_slug');

		if (exerciseSlug) {
			// Return submissions for a specific exercise
			const result = await db
				.prepare('SELECT * FROM submissions WHERE user_id = ? AND exercise_slug = ? ORDER BY submitted_at DESC LIMIT 20')
				.bind(deviceId, exerciseSlug)
				.all<SubmissionRow>();

			return json({
				success: true,
				data: result?.results || [],
			});
		} else {
			// Return all recent submissions
			const result = await db
				.prepare('SELECT * FROM submissions WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 50')
				.bind(deviceId)
				.all<SubmissionRow>();

			return json({
				success: true,
				data: result?.results || [],
			});
		}
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}
