import { getDB } from '$lib/server/d1';
import { createSession, getOrCreateUsersRow } from '$lib/server/auth';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};
}

function getSecret(platform: App.Platform, key: string): string | undefined {
	const env = platform.env as unknown as Record<string, unknown>;
	const val = env[key];
	return typeof val === 'string' ? val : undefined;
}

export async function GET({ request, platform }: {
	request: Request;
	platform: App.Platform;
}): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const provider = url.searchParams.get('provider') || '';
		const code = url.searchParams.get('code');

		if (!code) {
			return new Response(renderError('No authorization code received from provider.'), {
				status: 400, headers: { 'Content-Type': 'text/html' },
			});
		}

		if (!['google', 'github'].includes(provider)) {
			return new Response(renderError(`Invalid provider: "${provider}".`), {
				status: 400, headers: { 'Content-Type': 'text/html' },
			});
		}

		let accessToken: string;
		let userInfo: { id: string; email: string; name: string; avatar: string | null };

		if (provider === 'google') {
			const clientId = getSecret(platform, 'OAUTH_GOOGLE_CLIENT_ID');
			const clientSecret = getSecret(platform, 'OAUTH_GOOGLE_CLIENT_SECRET');
			if (!clientId || !clientSecret) {
				// Dev fallback
				try {
					const decoded = JSON.parse(atob(code));
					if (!decoded.id || !decoded.email) throw new Error('Invalid dev user format');
					userInfo = { id: decoded.id, email: decoded.email, name: decoded.name || decoded.email, avatar: decoded.avatar || null };
					accessToken = 'dev-mode';
				} catch {
					return new Response(renderError(
						'Google OAuth not configured. Set OAUTH_GOOGLE_CLIENT_ID and OAUTH_GOOGLE_CLIENT_SECRET in Cloudflare Pages secrets.'
					), { status: 500, headers: { 'Content-Type': 'text/html' } });
				}
			} else {
				const redirectUri = `${url.origin}/api/auth/callback?provider=google`;
				const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
				});
				const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
				if (!tokenData.access_token) {
					return new Response(renderError('Failed to exchange Google code for token.'), {
						status: 500, headers: { 'Content-Type': 'text/html' },
					});
				}
				accessToken = tokenData.access_token;
				const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
					headers: { Authorization: `Bearer ${accessToken}` },
				});
				const googleUser = await userRes.json() as { id: string; email: string; name: string; picture?: string };
				userInfo = { id: googleUser.id, email: googleUser.email, name: googleUser.name, avatar: googleUser.picture || null };
			}
		} else {
			const clientId = getSecret(platform, 'OAUTH_GITHUB_CLIENT_ID');
			const clientSecret = getSecret(platform, 'OAUTH_GITHUB_CLIENT_SECRET');
			if (!clientId || !clientSecret) {
				try {
					const decoded = JSON.parse(atob(code));
					if (!decoded.id || !decoded.email) throw new Error('Invalid dev user format');
					userInfo = { id: decoded.id, email: decoded.email, name: decoded.name || decoded.email, avatar: decoded.avatar || null };
					accessToken = 'dev-mode';
				} catch {
					return new Response(renderError(
						'GitHub OAuth not configured. Set OAUTH_GITHUB_CLIENT_ID and OAUTH_GITHUB_CLIENT_SECRET in Cloudflare Pages secrets.'
					), { status: 500, headers: { 'Content-Type': 'text/html' } });
				}
			} else {
				const redirectUri = `${url.origin}/api/auth/callback?provider=github`;
				const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
					body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
				});
				const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
				if (!tokenData.access_token) {
					return new Response(renderError('Failed to exchange GitHub code for token.'), {
						status: 500, headers: { 'Content-Type': 'text/html' },
					});
				}
				accessToken = tokenData.access_token;
				const userRes = await fetch('https://api.github.com/user', {
					headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
				});
				const githubUser = await userRes.json() as { id: number; email?: string; name?: string; avatar_url?: string; login: string };
				if (!githubUser.email) {
					const emailRes = await fetch('https://api.github.com/user/emails', {
						headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
					});
					const emails = await emailRes.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
					const primary = emails.find(e => e.primary);
					githubUser.email = primary?.email || `${githubUser.login}@users.noreply.github.com`;
				}
				userInfo = { id: String(githubUser.id), email: githubUser.email!, name: githubUser.name || githubUser.login, avatar: githubUser.avatar_url || null };
			}
		}

		const providerId = userInfo.id;
		const userId = `oauth-${provider}-${providerId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

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
				.prepare('INSERT INTO oauth_users (id, email, name, avatar, provider, provider_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
				.bind(userId, userInfo.email, userInfo.name, userInfo.avatar, provider, providerId, new Date().toISOString(), new Date().toISOString())
				.run();
		}

		const finalUserId = existing?.id || userId;
		await getOrCreateUsersRow(platform, finalUserId, userInfo.email, userInfo.name);
		const token = await createSession(platform, finalUserId, provider);

		const userJson = encodeURIComponent(JSON.stringify({
			id: finalUserId, name: userInfo.name, email: userInfo.email, avatar: userInfo.avatar, provider,
		}));

		return new Response(null, {
			status: 302,
			headers: { Location: `/?oauth_token=${token}&oauth_user=${userJson}` },
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return new Response(renderError(`Authentication failed: ${msg}`), {
			status: 500, headers: { 'Content-Type': 'text/html' },
		});
	}
}

function renderError(message: string): string {
	return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Login Error</title>
<style>
  body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 80vh; background: #0f0f1a; color: #e0e0e0; }
  .card { background: #1a1a2e; border: 1px solid #2d2d4e; border-radius: 16px; padding: 40px; max-width: 480px; text-align: center; }
  h1 { font-size: 24px; margin-bottom: 12px; color: #ff6b6b; }
  p { font-size: 14px; line-height: 1.6; color: #999; }
  a { color: #6c5ce7; text-decoration: none; }
</style></head>
<body><div class="card"><h1>Login Error</h1><p>${message}</p><p><a href="/login">Kembali ke login</a></p></div></body>
</html>`;
}
