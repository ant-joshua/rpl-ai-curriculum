import { describe, it, expect, beforeEach } from 'vitest';
import { checkAndAwardBadges } from '../src/lib/server/badges';

const dbState = {
	badges: [] as any[],
	userBadges: [] as any[],
	counts: { lessons: 0, assessments: 0, courses: 0 },
	inserts: [] as any[],
};

const mockDb = {
	prepare: (sql: string) => {
		let boundParams: any[] = [];
		const handlers = {
			all: async () => {
				if (sql.includes('SELECT * FROM badges')) return { results: dbState.badges };
				if (sql.includes('SELECT badge_id FROM user_badges')) return { results: dbState.userBadges };
				return { results: [] };
			},
			first: async () => {
				if (sql.includes('COUNT(*) as count FROM progress')) return { count: dbState.counts.lessons };
				if (sql.includes('COUNT(*) as count FROM assessment_results')) return { count: dbState.counts.assessments };
				if (sql.includes('COUNT(*) as count FROM enrollments')) return { count: dbState.counts.courses };
				return null;
			},
			run: async () => {
				if (sql.includes('INSERT INTO user_badges')) {
					// bind(id, userId, badgeId) → params[2]=badgeId, params[1]=userId
					dbState.inserts.push({ badge_id: boundParams[2], user_id: boundParams[1] });
				}
				return { success: true };
			},
			bind: (...params: any[]) => {
				boundParams = params;
				return handlers;
			},
		};
		return handlers;
	},
};

const mockPlatform = { env: { DB: mockDb } } as any;

beforeEach(() => {
	dbState.badges = [];
	dbState.userBadges = [];
	dbState.counts = { lessons: 0, assessments: 0, courses: 0 };
	dbState.inserts = [];
});

describe('checkAndAwardBadges', () => {
	it('awards lesson badge when threshold met', async () => {
		dbState.badges = [{ id: 'b1', criteria_type: 'lessons_completed', criteria_value: 5 }];
		dbState.counts.lessons = 7;
		const awarded = await checkAndAwardBadges(mockPlatform, 'user-1');
		expect(awarded).toEqual(['b1']);
		expect(dbState.inserts).toHaveLength(1);
		expect(dbState.inserts[0].badge_id).toBe('b1');
	});

	it('does not award when threshold not met', async () => {
		dbState.badges = [{ id: 'b1', criteria_type: 'lessons_completed', criteria_value: 10 }];
		dbState.counts.lessons = 3;
		const awarded = await checkAndAwardBadges(mockPlatform, 'user-1');
		expect(awarded).toEqual([]);
		expect(dbState.inserts).toHaveLength(0);
	});

	it('awards assessment badge', async () => {
		dbState.badges = [{ id: 'b2', criteria_type: 'assessments_passed', criteria_value: 3 }];
		dbState.counts.assessments = 4;
		const awarded = await checkAndAwardBadges(mockPlatform, 'user-1');
		expect(awarded).toEqual(['b2']);
	});

	it('awards course completion badge', async () => {
		dbState.badges = [{ id: 'b3', criteria_type: 'courses_completed', criteria_value: 1 }];
		dbState.counts.courses = 2;
		const awarded = await checkAndAwardBadges(mockPlatform, 'user-1');
		expect(awarded).toEqual(['b3']);
	});

	it('skips already-owned badges', async () => {
		dbState.badges = [{ id: 'b1', criteria_type: 'lessons_completed', criteria_value: 1 }];
		dbState.userBadges = [{ badge_id: 'b1' }];
		dbState.counts.lessons = 10;
		const awarded = await checkAndAwardBadges(mockPlatform, 'user-1');
		expect(awarded).toEqual([]);
		expect(dbState.inserts).toHaveLength(0);
	});

	it('skips custom and unknown criteria', async () => {
		dbState.badges = [
			{ id: 'c1', criteria_type: 'custom', criteria_value: 1 },
			{ id: 'd1', criteria_type: 'streak_days', criteria_value: 5 },
		];
		dbState.counts.lessons = 99;
		const awarded = await checkAndAwardBadges(mockPlatform, 'user-1');
		expect(awarded).toEqual([]);
		expect(dbState.inserts).toHaveLength(0);
	});

	it('awards multiple badges at once', async () => {
		dbState.badges = [
			{ id: 'b1', criteria_type: 'lessons_completed', criteria_value: 1 },
			{ id: 'b2', criteria_type: 'assessments_passed', criteria_value: 1 },
		];
		dbState.counts.lessons = 5;
		dbState.counts.assessments = 2;
		const awarded = await checkAndAwardBadges(mockPlatform, 'user-1');
		expect(awarded).toHaveLength(2);
		expect(dbState.inserts).toHaveLength(2);
	});
});