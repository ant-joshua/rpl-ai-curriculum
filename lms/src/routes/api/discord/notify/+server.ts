function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
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

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const body: { type?: string; user_id?: string; message?: string } = await request.json();

		// Log notification for now
		console.log('[Discord Notify]', {
			type: body.type || 'unknown',
			user_id: body.user_id || 'anonymous',
			message: body.message || '',
		});

		// If webhook URL is configured in env, send there
		const webhookUrl = platform.env?.DISCORD_WEBHOOK_URL as string | undefined;
		if (webhookUrl && body.message) {
			try {
				await fetch(webhookUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						content: `[${body.type}] ${body.message}`,
						username: 'RPL AI LMS Bot',
					}),
				});
			} catch {
				// Webhook failed, just log
				console.log('[Discord] Webhook send failed');
			}
		}

		return json({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}
