import { describe, it, expect } from 'vitest';
import { paths, getPathBySlug, computePathProgress, findNextSession } from '../src/lib/stores/paths';
import { modules } from '../src/lib/stores/modules';

describe('paths store', () => {
	it('has learning paths', () => {
		expect(paths.length).toBeGreaterThan(0);
	});

	it('getPathBySlug finds existing', () => {
		const p = getPathBySlug(paths[0].slug);
		expect(p?.slug).toBe(paths[0].slug);
	});

	it('getPathBySlug returns undefined for unknown', () => {
		expect(getPathBySlug('nope')).toBeUndefined();
	});

	it('computePathProgress returns 0 for unknown path', () => {
		expect(computePathProgress('nope', () => false)).toEqual({ completed: 0, total: 0, pct: 0 });
	});

	it('computePathProgress counts all sessions and completed', () => {
		const slug = paths[0].slug;
		const allCompleted = computePathProgress(slug, () => true);
		expect(allCompleted.total).toBeGreaterThan(0);
		expect(allCompleted.completed).toBe(allCompleted.total);
		expect(allCompleted.pct).toBe(100);

		const noneCompleted = computePathProgress(slug, () => false);
		expect(noneCompleted.completed).toBe(0);
		expect(noneCompleted.pct).toBe(0);
	});

	it('computePathProgress ignores unknown modules in path', () => {
		const p = getPathBySlug(paths[0].slug);
		if (!p) throw new Error('path missing');
		// sum of known module sessions = total
		let knownTotal = 0;
		for (const s of p.modules) {
			if (modules.find((m) => m.slug === s)) knownTotal += modules.find((m) => m.slug === s)!.sessions.length;
		}
		const res = computePathProgress(p.slug, () => false);
		expect(res.total).toBe(knownTotal);
	});

	it('findNextSession returns first incomplete session', () => {
		const slug = paths[0].slug;
		const next = findNextSession(slug, (mod, sesh) => mod === 'web-architecture' && sesh === '01-intro');
		expect(next).not.toBeNull();
		expect(next?.moduleSlug).toBeTruthy();
		expect(next?.sessionTitle).toBeTruthy();
	});

	it('findNextSession null for unknown path', () => {
		expect(findNextSession('nope', () => false)).toBeNull();
	});

	it('findNextSession null when all complete', () => {
		expect(findNextSession(paths[0].slug, () => true)).toBeNull();
	});
});