import { getDB, jsonResponse } from '$lib/server/d1';

export async function PUT({ params, request, platform }: { params: { offeringId: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { grade_weight_config } = body;

		if (grade_weight_config === undefined) {
			return jsonResponse({ success: false, error: 'grade_weight_config is required' }, 400);
		}

		// Validate it's valid JSON
		try {
			JSON.parse(grade_weight_config);
		} catch {
			return jsonResponse({ success: false, error: 'grade_weight_config must be valid JSON string' }, 400);
		}

		const result = await db.prepare(
			'UPDATE course_offerings SET grade_weight_config = ?, updated_at = datetime(\'now\') WHERE id = ?'
		).bind(grade_weight_config, params.offeringId).run();

		if (result.meta.changes === 0) {
			return jsonResponse({ success: false, error: 'Offering not found' }, 404);
		}

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
