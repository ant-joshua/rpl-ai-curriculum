import { getDB } from './d1';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface OAuthUser {
	id: string;
	email: string;
	name: string;
	avatar: string | null;
	provider: string;
	provider_id: string;
	device_ids: string;
	created_at: string;
	updated_at: string;
}

export interface Session {
	id: string;
	user_id: string;
	provider: string;
	expires_at: string;
	created_at: string;
}

/**
 * Create a session token for a user, store in D1 with expiry.
 * Returns the raw token string.
 */
export async function createSession(
	platform: App.Platform,
	userId: string,
	provider: string = 'oauth',
): Promise<string> {
	const db = getDB(platform);
	const token = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

	await db
		.prepare('INSERT INTO sessions (id, user_id, provider, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
		.bind(token, userId, provider, expiresAt, new Date().toISOString())
		.run();

	return token;
}

/**
 * Validate a session token. Returns the session + user data if valid, null otherwise.
 * Cleans up expired sessions as a side-effect.
 */
export async function getSession(
	platform: App.Platform,
	token: string,
): Promise<{ session: Session; user: OAuthUser } | null> {
	const db = getDB(platform);
	const now = new Date().toISOString();

	// Clean expired sessions occasionally
	await db
		.prepare("DELETE FROM sessions WHERE expires_at < ?")
		.bind(now)
		.run();

	const session = await db
		.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > ?')
		.bind(token, now)
		.first<Session>();

	if (!session) return null;

	const user = await db
		.prepare('SELECT * FROM oauth_users WHERE id = ?')
		.bind(session.user_id)
		.first<OAuthUser>();

	if (!user) {
		// User deleted but session remains — clean it up
		await db.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
		return null;
	}

	return { session, user };
}

/**
 * Delete a session (logout).
 */
export async function deleteSession(platform: App.Platform, token: string): Promise<void> {
	const db = getDB(platform);
	await db.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
}

/**
 * Extract Bearer token from Authorization header, or null.
 */
export function getBearerToken(request: Request): string | null {
	const auth = request.headers.get('Authorization');
	if (!auth || !auth.startsWith('Bearer ')) return null;
	return auth.slice(7).trim() || null;
}
