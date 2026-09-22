export { default as GamificationToasts } from './components/GamificationToasts.svelte';

// Core gamification store
export * from '$lib/stores/gamification.svelte';

// XP Toast store
export {
	pushXpGain,
	pushLevelUp,
	dismissToast as dismissXpToast,
	getVisibleToasts as getVisibleXpToasts,
} from '$lib/stores/xp-toast.svelte';

// Achievement Toast store
export {
	dismissToast as dismissAchievementToast,
	getVisibleToasts as getVisibleAchievementToasts,
	type AchievementToastItem,
} from '$lib/stores/achievement-toast.svelte';

// Quest Complete store
export {
	dismissQuestComplete,
	getQuestCompleteEvent,
	type QuestCompleteEvent,
} from '$lib/stores/quest-complete.svelte';
