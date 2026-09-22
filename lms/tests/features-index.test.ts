import { describe, it, expect, vi } from 'vitest';

vi.mock('$app/environment', () => ({
	browser: true,
}));

import * as coursesFeature from '../src/lib/features/courses';
import * as authFeature from '../src/lib/features/auth';

describe('Features Index Modules', () => {
	it('courses feature exports classes properly', () => {
		expect(coursesFeature.CourseRepository).toBeDefined();
		expect(coursesFeature.ProgressRepository).toBeDefined();
		expect(coursesFeature.CourseService).toBeDefined();
		expect(coursesFeature.ProgressService).toBeDefined();
	});

	it('auth feature exports classes and stores properly', () => {
		expect(authFeature.auth).toBeDefined();
		expect(authFeature.UserRepository).toBeDefined();
		expect(authFeature.UserService).toBeDefined();
	});
});
