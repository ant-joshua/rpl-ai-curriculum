import { getDB } from '$lib/server/d1';

/**
 * Log a user activity event to the analytics table.
 * Silently fails — analytics should never block the main flow.
 */
export async function logActivity(
	platform: App.Platform,
	userId: string,
	action: string,
	entityType?: string,
	entityId?: string,
	metadata?: Record<string, unknown>,
) {
	try {
		const db = getDB(platform);
		await db
			.prepare(
				'INSERT INTO user_activity_log (id, user_id, action, entity_type, entity_id, metadata) VALUES (?, ?, ?, ?, ?, ?)',
			)
			.bind(
				crypto.randomUUID(),
				userId,
				action,
				entityType || null,
				entityId || null,
				metadata ? JSON.stringify(metadata) : null,
			)
			.run();
	} catch {
		// analytics logging is best-effort
	}
}
