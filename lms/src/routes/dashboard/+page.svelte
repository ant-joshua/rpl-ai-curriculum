<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import type { PageData } from './$types';
	import WelcomeCard from '$lib/components/dashboard/WelcomeCard.svelte';
	import ContinueLearning from '$lib/components/dashboard/ContinueLearning.svelte';
	import DeadlinesWidget from '$lib/components/dashboard/DeadlinesWidget.svelte';
	import RecentActivity from '$lib/components/dashboard/RecentActivity.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';

	let { data }: { data: PageData } = $props();

	let {
		userName,
		activeCourses,
		completedCount,
		totalEnrollments,
		averageProgress,
		gamification,
		upcomingDeadlines,
		recentActivity,
	} = $derived(data);
</script>

<div class="dashboard">
	<!-- Welcome + Stats row -->
	<WelcomeCard
		username={userName}
		level={gamification?.level ?? 1}
		totalXp={gamification?.totalXp ?? 0}
		xpToNext={gamification?.xpToNext ?? 100}
		currentLevelXp={gamification?.currentLevelXp ?? 0}
		streak={gamification?.streak?.current ?? 0}
		{completedCount}
		{totalEnrollments}
		{averageProgress}
	/>

	<!-- Continue Learning -->
	<ContinueLearning courses={activeCourses} />

	<!-- Bottom: deadlines + activity -->
	<div class="bottom-grid">
		<DeadlinesWidget deadlines={upcomingDeadlines} />
		<RecentActivity activities={recentActivity} />
	</div>
</div>

<style>
	.dashboard {
		max-width: 960px;
		margin: 0 auto;
		padding: 0 12px;
		animation: fadeIn 0.3s ease both;
	}

	.bottom-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
		padding-bottom: 32px;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(6px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@media (max-width: 768px) {
		.bottom-grid {
			grid-template-columns: 1fr;
		}
		.dashboard {
			padding: 0 0 24px;
		}
	}
</style>
