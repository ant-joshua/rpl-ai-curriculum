import { describe, it, expect, vi } from 'vitest';

vi.mock('$app/environment', () => ({
	browser: true,
}));

import * as gamificationFeature from '../src/lib/features/gamification';

describe('Gamification Feature Module', () => {
	it('exports expected stores and components', () => {
		expect(gamificationFeature.GamificationToasts).toBeDefined();
		expect(typeof gamificationFeature.pushXpGain).toBe('function');
		expect(typeof gamificationFeature.dismissAchievementToast).toBe('function');
		expect(typeof gamificationFeature.getQuestCompleteEvent).toBe('function');
	});
});
