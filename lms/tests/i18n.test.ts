import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLang, setLang, toggleLang, t, initLang } from '../src/lib/stores/i18n';

beforeEach(() => {
	vi.resetModules();
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

async function loadI18n() {
	const m = await import('../src/lib/stores/i18n');
	return m as typeof import('../src/lib/stores/i18n');
}

describe('i18n', () => {
	it('defaults to Indonesian', async () => {
		const m = await loadI18n();
		expect(m.getLang()).toBe('id');
	});

	it('t returns Indonesian translation', async () => {
		const m = await loadI18n();
		expect(m.t('nav.dashboard')).toBe('Dashboard');
		expect(m.t('common.save')).toBe('Simpan');
	});

	it('t returns key when missing', async () => {
		const m = await loadI18n();
		expect(m.t('nonexistent.key')).toBe('nonexistent.key');
	});

	it('setLang + getLang roundtrip', async () => {
		const m = await loadI18n();
		m.setLang('en');
		expect(m.getLang()).toBe('en');
		expect(m.t('nav.dashboard')).toBe('Dashboard');
		m.setLang('id');
		expect(m.t('common.save')).toBe('Simpan');
	});

	it('toggleLang switches', async () => {
		const m = await loadI18n();
		m.setLang('id');
		m.toggleLang();
		expect(m.getLang()).toBe('en');
		m.toggleLang();
		expect(m.getLang()).toBe('id');
	});

	it('initLang applies saved lang', async () => {
		const m = await loadI18n();
		m.initLang('en');
		expect(m.getLang()).toBe('en');
	});

	it('initLang ignores invalid values', async () => {
		const m = await loadI18n();
		m.initLang('fr');
		expect(m.getLang()).toBe('id');
		m.initLang(null);
		expect(m.getLang()).toBe('id');
	});

	it('t handles empty key', async () => {
		const m = await loadI18n();
		expect(m.t('')).toBe('');
	});

	it('both languages cover same keys', async () => {
		const m = await loadI18n();
		const keys = ['nav.dashboard', 'common.loading', 'common.save', 'nav.profile', 'nav.settings'];
		const idValues = keys.map((k) => m.t(k));
		m.setLang('en');
		const enValues = keys.map((k) => m.t(k));
		for (let i = 0; i < keys.length; i++) {
			expect(idValues[i]).not.toBe(keys[i]);
			expect(enValues[i]).not.toBe(keys[i]);
		}
	});
});