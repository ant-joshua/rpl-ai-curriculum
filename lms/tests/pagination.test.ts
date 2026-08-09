import { describe, it, expect } from 'vitest';
import { getPaginationParams, buildSearchCondition, paginatedQuery } from '../src/lib/server/pagination';

describe('getPaginationParams', () => {
	it('defaults to page 0 (return all)', () => {
		const p = getPaginationParams(new URL('http://x/api'));
		expect(p.page).toBe(0);
		expect(p.limit).toBe(0); // backward compat: page=0 → limit 0 → all rows
		expect(p.offset).toBe(0);
	});

	it('parses page and limit', () => {
		const p = getPaginationParams(new URL('http://x/api?page=3&limit=10'));
		expect(p.page).toBe(3);
		expect(p.limit).toBe(10);
		expect(p.offset).toBe(20);
	});

	it('page 0 or limit 0 means return all', () => {
		const p = getPaginationParams(new URL('http://x/api?page=0&limit=0'));
		expect(p.limit).toBe(0);
		expect(p.offset).toBe(0);
	});

	it('caps limit at 50', () => {
		const p = getPaginationParams(new URL('http://x/api?page=1&limit=999'));
		expect(p.limit).toBe(50);
	});

	it('negative page clamps to 0', () => {
		const p = getPaginationParams(new URL('http://x/api?page=-5&limit=10'));
		expect(p.page).toBe(0);
		expect(p.offset).toBe(0);
	});

	it('reads search param', () => {
		const p = getPaginationParams(new URL('http://x/api?search=math'));
		expect(p.search).toBe('math');
	});

	it('search undefined when absent', () => {
		const p = getPaginationParams(new URL('http://x/api'));
		expect(p.search).toBeUndefined();
	});
});

describe('buildSearchCondition', () => {
	it('returns empty string when no search', () => {
		expect(buildSearchCondition(undefined, ['title'], [])).toBe('');
	});

	it('returns empty string when no columns', () => {
		expect(buildSearchCondition('x', [], [])).toBe('');
	});

	it('builds OR conditions with LIKE', () => {
		const params: unknown[] = [];
		const sql = buildSearchCondition('math', ['title', 'description'], params);
		expect(sql).toBe('title LIKE ? OR description LIKE ?');
		expect(params).toEqual(['%math%', '%math%']);
	});

	it('prefixes columns with table alias', () => {
		const sql = buildSearchCondition('x', ['name'], [], 'u');
		expect(sql).toBe('u.name LIKE ?');
	});
});

describe('paginatedQuery', () => {
	const mockDb = {
		prepare: (sql: string) => ({
			bind: (...params: unknown[]) => ({
				first: async () => ({ total: 25 }),
				all: async () => ({ results: [{ id: 'a' }, { id: 'b' }] }),
			}),
		}),
	};

	it('returns all rows when page 0', async () => {
		const res = await paginatedQuery(mockDb, 'SELECT * FROM t', 'SELECT COUNT(*) FROM t', [], {
			page: 0, limit: 0, offset: 0,
		});
		expect(res.rows).toHaveLength(2);
		expect(res.total).toBe(25);
		expect(res.totalPages).toBe(1);
	});

	it('paginates with limit/offset', async () => {
		const res = await paginatedQuery(mockDb, 'SELECT * FROM t', 'SELECT COUNT(*) FROM t', [], {
			page: 2, limit: 10, offset: 10,
		});
		expect(res.page).toBe(2);
		expect(res.limit).toBe(10);
		expect(res.totalPages).toBe(3);
	});

	it('handles missing count result', async () => {
		const db = {
			prepare: (sql: string) => ({
				bind: (...p: unknown[]) => ({
					first: async () => null,
					all: async () => ({ results: [] }),
				}),
			}),
		};
		const res = await paginatedQuery(db, 'SELECT * FROM t', 'SELECT COUNT(*) FROM t', [], {
			page: 1, limit: 10, offset: 0,
		});
		expect(res.total).toBe(0);
		expect(res.rows).toEqual([]);
	});
});