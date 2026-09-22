import { getTokenFromRequest, deleteSession } from '$lib/server/auth';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (token) {
			await deleteSession(platform, token);
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Set-Cookie': 'lms_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return new Response(JSON.stringify({ success: false, error: msg }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Set-Cookie': 'lms_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
			},
		});
	}
}
