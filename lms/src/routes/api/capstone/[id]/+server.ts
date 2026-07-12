import { getDB, getDeviceId } from '$lib/server/d1';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
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

export async function GET({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const project = await db
			.prepare('SELECT * FROM capstone_projects WHERE id = ?')
			.bind(params.id)
			.first<any>();

		if (!project) {
			return json({ success: false, error: 'Project not found' }, 404);
		}

		// Only owner or mentor can view
		if (project.user_id !== deviceId && project.mentor_id !== deviceId) {
			return json({ success: false, error: 'Forbidden' }, 403);
		}

		return json({ success: true, data: project });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const project = await db
			.prepare('SELECT * FROM capstone_projects WHERE id = ? AND user_id = ?')
			.bind(params.id, deviceId)
			.first<any>();

		if (!project) {
			return json({ success: false, error: 'Project not found or not owned by you' }, 404);
		}

		await db
			.prepare('DELETE FROM capstone_projects WHERE id = ?')
			.bind(params.id)
			.run();

		return json({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}
