/**
 * GET /api/auth/oauth/redirect/:provider
 *
 * Redirects the user to the OAuth provider's authorization page.
 * In production, replace CLIENT_ID placeholders with actual secrets set
 * in Cloudflare Pages environment variables (OAUTH_GOOGLE_CLIENT_ID,
 * OAUTH_GITHUB_CLIENT_ID).
 *
 * The callback URL is /api/auth/callback which exchanges the code
 * and creates a session.
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';

function getRedirectUri(request: Request, provider: string): string {
	const url = new URL(request.url);
	return `${url.origin}/api/auth/callback?provider=${provider}`;
}

function getSecret(platform: App.Platform, key: string): string | undefined {
	const env = platform.env as unknown as Record<string, unknown>;
	const val = env[key];
	return typeof val === 'string' ? val : undefined;
}

export async function GET({ request, platform, params }: {
	request: Request;
	platform: App.Platform;
	params: { provider: string };
}): Promise<Response> {
	const { provider } = params;

	const redirectUri = getRedirectUri(request, provider);
	const state = crypto.randomUUID();

	let authUrl: string;

	if (provider === 'google') {
		const clientId = getSecret(platform, 'OAUTH_GOOGLE_CLIENT_ID') || 'GOOGLE_CLIENT_ID_PLACEHOLDER';
		authUrl = `${GOOGLE_AUTH_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&state=${state}`;
	} else if (provider === 'github') {
		const clientId = getSecret(platform, 'OAUTH_GITHUB_CLIENT_ID') || 'GITHUB_CLIENT_ID_PLACEHOLDER';
		authUrl = `${GITHUB_AUTH_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user%3Aemail&state=${state}`;
	} else {
		return new Response(JSON.stringify({ success: false, error: `Unknown provider: ${provider}` }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return new Response(null, {
		status: 302,
		headers: { Location: authUrl },
	});
}
