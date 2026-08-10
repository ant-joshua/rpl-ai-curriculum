import { describe, it, expect, vi } from 'vitest';
import { parseFeatures, hasFeature, getFeatures, DEFAULT_FEATURES } from '../src/lib/server/tenant-features';
import { generateSecret, generateTOTP, verifyTOTP, getOTPAuthURL, generateRecoveryCodes, hashRecoveryCode } from '../src/lib/server/totp';
import { getActiveBoost, applyBoost } from '../src/lib/server/xp-boost';

// ---------------------------------------------------------------
// tenant-features.ts
// ---------------------------------------------------------------
describe('parseFeatures', () => {
	it('parses valid JSON string', () => {
		expect(parseFeatures('{"gamification": false}')).toEqual({ gamification: false });
	});

	it('returns {} for null/undefined', () => {
		expect(parseFeatures(null)).toEqual({});
		expect(parseFeatures(undefined)).toEqual({});
	});

	it('returns {} for invalid JSON', () => {
		expect(parseFeatures('not json')).toEqual({});
	});
});

describe('hasFeature', () => {
	it('returns defaults for null tenant', () => {
		expect(hasFeature(null, 'gamification')).toBe(true);
		expect(hasFeature(undefined, 'leaderboard')).toBe(true);
	});

	it('returns default when key missing in features', () => {
		expect(hasFeature({ features: '{"other": true}' }, 'certificates')).toBe(true);
	});

	it('respects explicit false', () => {
		expect(hasFeature({ features: '{"gamification": false}' }, 'gamification')).toBe(false);
	});

	it('coerces truthy values', () => {
		expect(hasFeature({ features: '{"daily_quests": 1}' }, 'daily_quests')).toBe(true);
		expect(hasFeature({ features: '{"daily_quests": "yes"}' }, 'daily_quests')).toBe(true);
	});

	it('returns true for unknown key via default fallback', () => {
		expect(hasFeature({ features: '{}' }, 'discussions')).toBe(true);
	});
});

describe('getFeatures', () => {
	it('merges defaults with tenant overrides', () => {
		const f = getFeatures({ features: '{"gamification": false}' });
		expect(f.gamification).toBe(false);
		expect(f.leaderboard).toBe(true);
		expect(f.daily_quests).toBe(true);
	});

	it('handles tenant without features', () => {
		const f = getFeatures(null);
		expect(f).toEqual(DEFAULT_FEATURES);
	});

	it('ignores invalid JSON, keeps defaults', () => {
		const f = getFeatures({ features: 'broken' });
		expect(f.gamification).toBe(true);
	});
});

// ---------------------------------------------------------------
// totp.ts
// ---------------------------------------------------------------
describe('TOTP 2FA', () => {
	it('generateSecret returns 26-char base32', () => {
		const s = generateSecret();
		expect(s).toMatch(/^[A-Z2-7]{26}$/);
	});

	it('generateTOTP produces 6-digit code', async () => {
		const secret = 'JBSWY3DPEHPK3PXP';
		const code = await generateTOTP(secret, 1700000000000);
		expect(code).toMatch(/^\d{6}$/);
	});

	it('generateTOTP is deterministic for same timestamp', async () => {
		const secret = 'JBSWY3DPEHPK3PXP';
		const a = await generateTOTP(secret, 1700000000000);
		const b = await generateTOTP(secret, 1700000000000);
		expect(a).toBe(b);
	});

	it('generateTOTP changes between windows', async () => {
		const secret = 'JBSWY3DPEHPK3PXP';
		const a = await generateTOTP(secret, 1700000000000);
		const b = await generateTOTP(secret, 1700000000000 + 30000);
		expect(a).not.toBe(b);
	});

	it('verifyTOTP accepts valid token', async () => {
		const secret = 'JBSWY3DPEHPK3PXP';
		const code = await generateTOTP(secret, 1700000000000);
		vi.setSystemTime(1700000000000);
		const ok = await verifyTOTP(secret, code);
		expect(ok).toBe(true);
		vi.useRealTimers();
	});

	it('verifyTOTP rejects wrong token', async () => {
		const secret = 'JBSWY3DPEHPK3PXP';
		const ok = await verifyTOTP(secret, '000000');
		expect(ok).toBe(false);
	});

	it('verifyTOTP rejects malformed input', async () => {
		expect(await verifyTOTP('', '123456')).toBe(false);
		expect(await verifyTOTP('SECRET', '')).toBe(false);
		expect(await verifyTOTP('SECRET', '12345')).toBe(false);
	});

	it('verifyTOTP allows ±30s skew', async () => {
		const secret = 'JBSWY3DPEHPK3PXP';
		vi.useFakeTimers();
		vi.setSystemTime(1700000000000);
		// token from -30s window
		const past = await generateTOTP(secret, 1700000000000 - 30000);
		expect(await verifyTOTP(secret, past)).toBe(true);
		vi.useRealTimers();
	});

	it('getOTPAuthURL builds otpauth URL', () => {
		const url = getOTPAuthURL('SECRET', 'jane');
		expect(url).toContain('otpauth://totp/RPL%20AI%3Ajane');
		expect(url).toContain('secret=SECRET');
		expect(url).toContain('issuer=RPL%20AI');
	});

	it('generateRecoveryCodes returns N 10-char codes', () => {
		const codes = generateRecoveryCodes(5);
		expect(codes).toHaveLength(5);
		for (const c of codes) expect(c).toMatch(/^[A-Za-z0-9]{10}$/);
	});

	it('generateRecoveryCodes default 8', () => {
		expect(generateRecoveryCodes()).toHaveLength(8);
	});

	it('hashRecoveryCode returns 64-char hex', async () => {
		const h = await hashRecoveryCode('abc123');
		expect(h).toMatch(/^[0-9a-f]{64}$/);
	});

	it('hashRecoveryCode deterministic', async () => {
		const a = await hashRecoveryCode('same');
		const b = await hashRecoveryCode('same');
		expect(a).toBe(b);
	});
});

// ---------------------------------------------------------------
// xp-boost.ts
// ---------------------------------------------------------------
describe('getActiveBoost', () => {
	const makeDb = (results: any[] | null) => ({
		prepare: () => ({
			bind: () => ({ all: async () => ({ results }) }),
		}),
	});

	it('returns null when no rows', async () => {
		const boost = await getActiveBoost(makeDb([]) as any, 't1', 'lesson');
		expect(boost).toBeNull();
	});

	it('returns null on db error', async () => {
		const db = { prepare: () => { throw new Error('db'); } } as any;
		const boost = await getActiveBoost(db, 't1', 'lesson');
		expect(boost).toBeNull();
	});

	it('returns boost when reason_filter all', async () => {
		const row = { id: 'b1', title: 'Double XP', multiplier: 2, reason_filter: 'all', tenant_id: null, start_at: '', end_at: '' };
		const boost = await getActiveBoost(makeDb([row]) as any, 't1', 'lesson');
		expect(boost?.id).toBe('b1');
	});

	it('returns boost when reason_filter matches', async () => {
		const row = { id: 'b1', title: 'Quiz XP', multiplier: 1.5, reason_filter: 'quiz', tenant_id: 't1', start_at: '', end_at: '' };
		const boost = await getActiveBoost(makeDb([row]) as any, 't1', 'quiz');
		expect(boost?.id).toBe('b1');
	});

	it('returns null when reason_filter mismatches', async () => {
		const row = { id: 'b1', title: 'Quiz XP', multiplier: 1.5, reason_filter: 'quiz', tenant_id: 't1', start_at: '', end_at: '' };
		const boost = await getActiveBoost(makeDb([row]) as any, 't1', 'lesson');
		expect(boost).toBeNull();
	});
});

describe('applyBoost', () => {
	it('returns base when null boost', () => {
		expect(applyBoost(100, null)).toBe(100);
	});

	it('returns base when multiplier <= 1', () => {
		expect(applyBoost(100, { multiplier: 1 } as any)).toBe(100);
	});

	it('multiplies and rounds', () => {
		expect(applyBoost(100, { multiplier: 2.5 } as any)).toBe(250);
		expect(applyBoost(101, { multiplier: 1.5 } as any)).toBe(152);
	});
});