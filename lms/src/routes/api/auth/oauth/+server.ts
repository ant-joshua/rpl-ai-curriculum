import { getDB } from '$lib/server/d1';
import { createSession, getBearerToken, deleteSession } from '$lib/server/auth';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-device-id',
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

/**
 * POST /api/auth/oauth
 *
 * Receives OAuth callback data: { provider, code }
 * Exchanges code for access token (placeholder for now — needs secrets),
 * fetches user info from provider, upserts oauth_users, creates session,
 * returns session token.
 *
 * provider: 'google' | 'github'
 * code: string — OAuth authorization code from the provider
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body: { provider?: string; code?: string; name?: string; email?: string; avatar?: string } = await request.json();

		const provider = body.provider || 'google';
		const code = body.code;

		if (!['google', 'github'].includes(provider)) {
			return json({ success: false, error: 'Invalid provider. Use "google" or "github".' }, 400);
		}

		let userInfo: { id: string; email: string; name: string; avatar: string | null };

		if (code) {
			// Real OAuth flow — exchange code for access token, then fetch user info.
			// Placeholder: in production, environment secrets OAUTH_GOOGLE_CLIENT_ID,
			// OAUTH_GOOGLE_CLIENT_SECRET, OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET
			// would be set in Cloudflare Pages secrets or wrangler.toml [vars].
			//
			// Example for Google:
			//   const tokenRes = await fetch('https://oauth2.googleapis.com/token', { ... });
			//   const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { ... });
			//
			// Example for GitHub:
			//   const tokenRes = await fetch('https://github.com/login/oauth/access_token', { ... });
			//   const userRes = await fetch('https://api.github.com/user', { ... });

			// For now, parse code as a JSON-encoded user info object for dev/testing
			// In production this would be the real OAuth exchange.
			try {
				userInfo = JSON.parse(atob(code));
			} catch {
				return json({ success: false, error: 'Invalid code. Real OAuth requires OAUTH_* secrets configured in Cloudflare Pages.' }, 400);
			}
		} else if (body.name && body.email) {
			// Direct user info provided (dev mode / backward compat)
			userInfo = {
				id: body.email,
				email: body.email,
				name: body.name,
				avatar: body.avatar || null,
			};
		} else {
			return json({ success: false, error: 'Missing code or user info (name, email). For real OAuth, pass a valid authorization code.' }, 400);
		}

		// Create a deterministic ID based on provider + provider_id
		const providerId = userInfo.id || userInfo.email;
		const userId = `oauth-${provider}-${providerId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

		// Upsert user in oauth_users table
		const existing = await db
			.prepare('SELECT id FROM oauth_users WHERE provider = ? AND provider_id = ?')
			.bind(provider, providerId)
			.first<{ id: string }>();

		if (existing) {
			await db
				.prepare('UPDATE oauth_users SET name = ?, email = ?, avatar = ?, updated_at = ? WHERE id = ?')
				.bind(userInfo.name, userInfo.email, userInfo.avatar, new Date().toISOString(), existing.id)
				.run();
		} else {
			await db
				.prepare(
					'INSERT INTO oauth_users (id, email, name, avatar, provider, provider_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
				)
				.bind(userId, userInfo.email, userInfo.name, userInfo.avatar, provider, providerId, new Date().toISOString(), new Date().toISOString())
				.run();
		}

		const finalUserId = existing?.id || userId;

		// Create session
		const token = await createSession(platform, finalUserId, provider);

		return json({
			success: true,
			data: {
				token,
				user: {
					id: finalUserId,
					name: userInfo.name,
					email: userInfo.email,
					avatar: userInfo.avatar,
					provider,
				},
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}
