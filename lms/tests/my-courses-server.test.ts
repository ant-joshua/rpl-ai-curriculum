import { describe, it, expect, vi } from 'vitest';
import { load } from '../src/routes/my/courses/+page.server';

describe('My Courses Server Load', () => {
	it('returns empty list if no platform', async () => {
		const res = await load({
			request: new Request('http://localhost/my/courses'),
			platform: undefined as any,
			locals: {} as any,
			url: new URL('http://localhost/my/courses'),
			params: {},
			route: { id: '/my/courses' },
			cookies: {} as any,
			setHeaders: vi.fn(),
			parent: vi.fn() as any,
			depends: vi.fn(),
			isDataRequest: false,
			untrack: vi.fn(),
		});
		expect(res).toEqual({ courses: [] });
	});

	it('loads courses with progress using CourseService', async () => {
		const mockDb = {
			prepare: vi.fn().mockReturnValue({
				bind: vi.fn().mockReturnValue({
					all: vi.fn().mockResolvedValue({
						results: [
							{
								enrollment_id: 'enr-1',
								course_offering_id: 'off-1',
								offering_id: 'off-1',
								offering_name: 'Pemrograman Web',
								offering_code: 'RPL-101',
								offering_status: 'active',
								enrollment_status: 'enrolled',
								enrolled_at: '2026-01-01',
								course_id: 'c-1',
								course_title: 'Pemrograman Web',
								course_slug: 'pemrograman-web',
								course_icon: 'code',
							},
						],
					}),
				}),
				all: vi.fn().mockResolvedValue({ results: [] }),
			}),
		};

		const mockPlatform = { env: { DB: mockDb } };
		const res = await load({
			request: new Request('http://localhost/my/courses'),
			platform: mockPlatform as any,
			locals: { user: { id: 'usr-1', role: 'student' } } as any,
			url: new URL('http://localhost/my/courses'),
			params: {},
			route: { id: '/my/courses' },
			cookies: {} as any,
			setHeaders: vi.fn(),
			parent: vi.fn() as any,
			depends: vi.fn(),
			isDataRequest: false,
			untrack: vi.fn(),
		});

		expect(res.courses).toHaveLength(1);
		expect(res.courses[0].offeringId).toBe('off-1');
		expect(res.courses[0].title).toBe('Pemrograman Web');
		expect(res.courses[0].progress).toBe(0);
	});
});
