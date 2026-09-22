import { describe, it, expect, vi } from 'vitest';

vi.mock('$app/environment', () => ({
	browser: true,
}));

import * as coursesServer from '../src/lib/features/courses/server';
import * as authClient from '../src/lib/features/auth';
import * as authServer from '../src/lib/features/auth/server';
import * as notificationsClient from '../src/lib/features/notifications';
import * as notificationsServer from '../src/lib/features/notifications/server';

describe('Features Index Modules', () => {
	it('courses server exports classes properly', () => {
		expect(coursesServer.CourseRepository).toBeDefined();
		expect(coursesServer.ProgressRepository).toBeDefined();
		expect(coursesServer.CourseService).toBeDefined();
		expect(coursesServer.ProgressService).toBeDefined();
	});

	it('auth feature cleanly separates client and server', () => {
		expect(authClient.auth).toBeDefined();
		expect(authServer.UserRepository).toBeDefined();
		expect(authServer.UserService).toBeDefined();
	});

	it('notifications feature cleanly separates client and server', () => {
		expect(notificationsClient.NotificationToast).toBeDefined();
		expect(typeof notificationsClient.startPolling).toBe('function');
		expect(notificationsServer.NotificationRepository).toBeDefined();
	});
});
