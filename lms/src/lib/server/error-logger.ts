import { getDB } from '$lib/server/d1';

export interface ErrorLogEntry {
	level: 'error' | 'warning' | 'critical';
	message: string;
	stack?: string;
	url?: string;
	method?: string;
	userId?: string | null;
	userAgent?: string;
	ipAddress?: string;
	tenantId?: string;
	metadata?: Record<string, unknown>;
}

/**
 * Log an error to the error_logs table.
 * Fire-and-forget — never throws.
 */
export async function logError(
	platform: App.Platform | undefined | null,
	entry: ErrorLogEntry,
): Promise<void> {
	if (!platform?.env?.DB) return;
	try {
		const db = getDB(platform);
		await db
			.prepare(
				`INSERT INTO error_logs (id, level, message, stack, url, method, user_id, user_agent, ip_address, tenant_id, metadata)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(
				crypto.randomUUID(),
				entry.level,
				entry.message,
				entry.stack || null,
				entry.url || null,
				entry.method || null,
				entry.userId || null,
				entry.userAgent || null,
				entry.ipAddress || null,
				entry.tenantId || 'default',
				entry.metadata ? JSON.stringify(entry.metadata) : null,
			)
			.run();
	} catch {
		// error logging is best-effort
	}
}
