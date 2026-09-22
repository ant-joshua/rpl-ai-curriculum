import { describe, it, expect, vi } from 'vitest';
import { UserRepository } from '../src/lib/repositories/user.repository';
import { CourseRepository } from '../src/lib/repositories/course.repository';
import { ProgressRepository } from '../src/lib/repositories/progress.repository';
import { UserService } from '../src/lib/services/user.service';

describe('Repository & Service Layer', () => {
	it('UserRepository methods work with mock db', async () => {
		const mockFirst = vi.fn().mockResolvedValue({ id: 'user-1', username: 'student1', role: 'student' });
		const mockDb = {
			prepare: vi.fn().mockReturnValue({
				bind: vi.fn().mockReturnValue({
					first: mockFirst,
					run: vi.fn().mockResolvedValue({ success: true }),
				}),
			}),
		};

		const repo = new UserRepository(mockDb);
		const user = await repo.findById('user-1');
		expect(user).toEqual({ id: 'user-1', username: 'student1', role: 'student' });
		expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?');
	});

	it('UserService formats profile data correctly', async () => {
		const mockDb = {
			prepare: vi.fn().mockReturnValue({
				bind: vi.fn().mockReturnValue({
					first: vi.fn().mockResolvedValue({
						id: 'user-123',
						display_name: 'Ant Joshua',
						email: 'ant@example.com',
						avatar_url: 'https://example.com/avatar.png',
						role: 'admin',
						created_at: '2026-01-01T00:00:00Z',
					}),
				}),
			}),
		};

		const service = new UserService(mockDb);
		const profile = await service.getProfile('user-123');
		expect(profile).toEqual({
			id: 'user-123',
			displayName: 'Ant Joshua',
			email: 'ant@example.com',
			avatarUrl: 'https://example.com/avatar.png',
			role: 'admin',
			createdAt: '2026-01-01T00:00:00Z',
		});
	});

	it('CourseRepository.getPublishedLessonCounts aggregates map', async () => {
		const mockDb = {
			prepare: vi.fn().mockReturnValue({
				all: vi.fn().mockResolvedValue({
					results: [
						{ course_offering_id: 'off-1', total: 10 },
						{ course_offering_id: 'off-2', total: 5 },
					],
				}),
			}),
		};

		const repo = new CourseRepository(mockDb);
		const counts = await repo.getPublishedLessonCounts();
		expect(counts.get('off-1')).toBe(10);
		expect(counts.get('off-2')).toBe(5);
		expect(counts.get('non-existent')).toBeUndefined();
	});

	it('ProgressRepository formats completed offerings set', async () => {
		const mockDb = {
			prepare: vi.fn().mockReturnValue({
				bind: vi.fn().mockReturnValue({
					all: vi.fn().mockResolvedValue({
						results: [
							{ session_id: 'lesson-1', completed: 1, course_offering_id: 'off-1' },
							{ session_id: 'lesson-2', completed: 1, course_offering_id: 'off-1' },
							{ session_id: 'lesson-a', completed: 1, course_offering_id: 'off-2' },
						],
					}),
				}),
			}),
		};

		const repo = new ProgressRepository(mockDb);
		const setMap = await repo.getUserProgressByOffering('user-1');
		expect(setMap.get('off-1')?.size).toBe(2);
		expect(setMap.get('off-1')?.has('lesson-1')).toBe(true);
		expect(setMap.get('off-2')?.size).toBe(1);
	});
});
