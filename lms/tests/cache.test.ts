import { describe, it, expect, beforeEach } from 'vitest';
import { cachedDbQuery, cachedDbFirst, invalidateCache, clearQueryCache } from '../src/lib/server/cache';

const makeDb = () => {
	const calls: string[] = [];
	const db = {
		prepare: (sql: string) => ({
			bind: (...params: unknown[]) => ({
				all: async () => {
					calls.push(sql);
					return { results: [{ from: 'db', sql }] };
				},
				first: async () => {
					calls.push(sql);
					return { from: 'db', sql };
				},
			}),
		}),
		calls,
	};
	return db;
};

describe('cachedDbQuery', () => {
	beforeEach(() => clearQueryCache());

	it('executes and caches result', async () => {
		const db = makeDb();
		const r1 = await cachedDbQuery(db, 'SELECT * FROM t', ['x']);
		expect(r1.results?.[0]).toEqual({ from: 'db', sql: 'SELECT * FROM t' });
		expect(db.calls).toHaveLength(1);
	});

	it('serves second call from cache', async () => {
		const db = makeDb();
		await cachedDbQuery(db, 'SELECT * FROM t', ['x']);
		await cachedDbQuery(db, 'SELECT * FROM t', ['x']);
		expect(db.calls).toHaveLength(1);
	});

	it('distinct params = distinct cache key', async () => {
		const db = makeDb();
		await cachedDbQuery(db, 'SELECT * FROM t', ['x']);
		await cachedDbQuery(db, 'SELECT * FROM t', ['y']);
		expect(db.calls).toHaveLength(2);
	});
});

describe('cachedDbFirst', () => {
	beforeEach(() => clearQueryCache());

	it('caches first() results', async () => {
		const db = makeDb();
		const r1 = await cachedDbFirst(db, 'SELECT * FROM u WHERE id = ?', ['1']);
		expect(r1).toEqual({ from: 'db', sql: 'SELECT * FROM u WHERE id = ?' });
		const r2 = await cachedDbFirst(db, 'SELECT * FROM u WHERE id = ?', ['1']);
		expect(r2).toEqual(r1);
		expect(db.calls).toHaveLength(1);
	});
});

describe('invalidateCache', () => {
	beforeEach(() => clearQueryCache());

	it('clears matching pattern only', async () => {
		const db = makeDb();
		await cachedDbQuery(db, 'SELECT * FROM lessons', []);
		await cachedDbQuery(db, 'SELECT * FROM users', []);
		invalidateCache('SELECT * FROM lessons');
		// lessons re-executes, users still cached
		await cachedDbQuery(db, 'SELECT * FROM lessons', []);
		await cachedDbQuery(db, 'SELECT * FROM users', []);
		expect(db.calls).toEqual(['SELECT * FROM lessons', 'SELECT * FROM users', 'SELECT * FROM lessons']);
	});

	it('clears all when no pattern', async () => {
		const db = makeDb();
		await cachedDbQuery(db, 'SELECT * FROM lessons', []);
		await cachedDbQuery(db, 'SELECT * FROM users', []);
		invalidateCache();
		await cachedDbQuery(db, 'SELECT * FROM lessons', []);
		await cachedDbQuery(db, 'SELECT * FROM users', []);
		expect(db.calls).toHaveLength(4);
	});
});