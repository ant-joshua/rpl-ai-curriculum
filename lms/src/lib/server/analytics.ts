import { getDB } from '$lib/server/d1';

export async function logActivity(
  platform: App.Platform,
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
  extra?: { path?: string; method?: string; statusCode?: number; durationMs?: number; ipAddress?: string; userAgent?: string },
) {
  try {
    const db = getDB(platform);
    await db
      .prepare(
        'INSERT INTO user_activity_log (id, user_id, action, entity_type, entity_id, metadata, ip_address, path, method, status_code, duration_ms, user_agent, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        crypto.randomUUID(),
        userId,
        action,
        entityType || null,
        entityId || null,
        metadata ? JSON.stringify(metadata) : null,
        extra?.ipAddress || null,
        extra?.path || null,
        extra?.method || null,
        extra?.statusCode || null,
        extra?.durationMs || null,
        extra?.userAgent || null,
        'default',
      )
      .run();
  } catch {
    // analytics logging is best-effort
  }
}
