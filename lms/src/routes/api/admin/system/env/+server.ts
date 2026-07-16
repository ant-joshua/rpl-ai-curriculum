import { jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		return jsonResponse({
			hasDB: !!(platform.env as any)?.DB,
			hasAssets: !!(platform.env as any)?.ASSETS,
			hasAI: !!(platform.env as any)?.AI,
			worker: 'ok',
			timestamp: new Date().toISOString(),
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
