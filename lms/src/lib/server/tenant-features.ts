/**
 * Tenant feature flags — read from tenants.features JSON.
 * Features control which modules are visible/active per tenant
 * (e.g. some schools don't want gamification).
 */

export type TenantFeatureKey =
	| 'gamification'      // XP, level, badges, streak (master switch)
	| 'daily_quests'      // daily quest panel + claim
	| 'leaderboard'       // global + per-path leaderboard
	| 'practice_mode'     // /practice re-drill wrong answers
	| 'certificates'      // certificate generation
	| 'discussions';      // lesson discussion threads

export const DEFAULT_FEATURES: Record<TenantFeatureKey, boolean> = {
	gamification: true,
	daily_quests: true,
	leaderboard: true,
	practice_mode: true,
	certificates: true,
	discussions: true,
};

/** Parse tenant.features JSON (stored as string). */
export function parseFeatures(raw: string | null | undefined): Record<string, boolean> {
	try {
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

/** Check if a tenant has a feature enabled (falls back to default). */
export function hasFeature(tenant: any, key: TenantFeatureKey): boolean {
	if (!tenant) return DEFAULT_FEATURES[key] ?? true;
	const features = parseFeatures(tenant.features);
	const val = features[key];
	return val === undefined ? (DEFAULT_FEATURES[key] ?? true) : Boolean(val);
}

/** Get full feature map for a tenant (defaults merged). */
export function getFeatures(tenant: any): Record<string, boolean> {
	const merged: Record<string, boolean> = { ...DEFAULT_FEATURES };
	const parsed = parseFeatures(tenant?.features);
	for (const [k, v] of Object.entries(parsed)) {
		merged[k] = Boolean(v);
	}
	return merged;
}
