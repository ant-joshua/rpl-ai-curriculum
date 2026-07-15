import { jsonResponse } from '$lib/server/d1';

const PISTON_URL = 'https://piston.ant-joshua.my.id/api/v2/execute';

export async function POST({ request }: { request: Request }): Promise<Response> {
	try {
		const body = await request.json();
		const { language, version, code } = body;

		if (!language || !code) {
			return jsonResponse({ success: false, error: 'language and code required' }, 400);
		}

		const pistonRes = await fetch(PISTON_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				language,
				version: version || '*',
				files: [{ content: code }]
			})
		});

		if (!pistonRes.ok) {
			const errText = await pistonRes.text();
			return jsonResponse({ success: false, error: `Piston error: ${errText}` }, 502);
		}

		const result = await pistonRes.json();
		return jsonResponse({ success: true, data: result });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
