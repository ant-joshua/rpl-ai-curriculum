import { describe, it, expect } from 'vitest';
import { getVideosByModule, getPublishedVideos, getVideosGroupedByModule, moduleVideos, videos } from '../src/lib/stores/videos';

describe('videos store', () => {
	it('moduleVideos has entries', () => {
		expect(moduleVideos.length).toBeGreaterThan(0);
	});

	it('getVideosByModule returns videos for existing module', () => {
		const vids = getVideosByModule(moduleVideos[0].moduleSlug);
		expect(vids.length).toBeGreaterThan(0);
		expect(vids[0].moduleSlug).toBe(moduleVideos[0].moduleSlug);
		expect(vids[0].url).toContain('youtube.com/watch?v=');
		expect(vids[0].platform).toBe('youtube');
	});

	it('getVideosByModule returns empty for unknown module', () => {
		expect(getVideosByModule('nonexistent-module')).toEqual([]);
	});

	it('getPublishedVideos flattens all modules', () => {
		const all = getPublishedVideos();
		expect(all.length).toBeGreaterThan(0);
		for (const v of all) {
			expect(v.url).toContain('youtube.com/watch?v=');
			expect(v.moduleSlug).toBeTruthy();
		}
	});

	it('getVideosGroupedByModule groups by slug', () => {
		const grouped = getVideosGroupedByModule();
		const slugs = Object.keys(grouped);
		expect(slugs.length).toBeGreaterThan(0);
		expect(grouped[slugs[0]].length).toBeGreaterThan(0);
	});

	it('videos standalone export has valid entries', () => {
		expect(videos.length).toBeGreaterThan(0);
		for (const v of videos) {
			expect(v.url).toContain('http');
		}
	});

	it('moduleVideos count matches published count', () => {
		const expected = moduleVideos.reduce((acc, mv) => acc + mv.videos.length, 0);
		expect(getPublishedVideos()).toHaveLength(expected);
	});
});