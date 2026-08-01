import type { D1Database } from '@cloudflare/workers-types';

export interface XpBoost {
	id: string;
	title: string;
	multiplier: number;
	reason_filter: string;
	tenant_id: string | null;
	start_at: string;
	end_at: string;
}

/**
 * Find active XP boost for a tenant+reason at this moment.
 * Returns highest multiplier among matching active events.
 */
export async function getActiveBoost(db: D1Database, tenantId: string | null | undefined, reason: string): Promise<XpBoost | null> {
	try {
		const { results } = await db.prepare(`
			SELECT id, title, multiplier, reason_filter, tenant_id, start_at, end_at
			FROM xp_boost_events
			WHERE enabled = 1
				AND datetime('now') BETWEEN start_at AND end_at
				AND (tenant_id IS NULL OR tenant_id = ?)
			ORDER BY multiplier DESC
			LIMIT 1
		`).bind(tenantId ?? '').all<XpBoost>();

		if (!results || results.length === 0) return null;

		const boost = results[0];
		// reason_filter: 'all' matches everything; otherwise must match
		if (boost.reason_filter !== 'all' && boost.reason_filter !== reason) return null;
		return boost;
	} catch {
		return null;
	}
}

export function applyBoost(baseXp: number, boost: XpBoost | null): number {
	if (!boost || boost.multiplier <= 1) return baseXp;
	return Math.round(baseXp * boost.multiplier);
}
