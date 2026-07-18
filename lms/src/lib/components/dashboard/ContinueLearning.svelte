<script lang="ts">
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	type Course = {
		offeringId: string;
		courseTitle: string;
		courseIcon: string;
		courseDescription?: string;
		progress: number;
		lastLessonTitle: string | null;
		nextLessonSlug: string | null;
		totalLessons: number;
		completedLessons: number;
	};

	let {
		courses = [] as Course[],
	}: {
		courses?: Course[];
	} = $props();

	const inProgress = $derived(
		courses
			.filter(c => c.progress > 0 && c.progress < 100)
			.sort((a, b) => b.progress - a.progress)
			.slice(0, 4)
	);
</script>

<section class="continue-section">
	<h2 class="section-title">Lanjut Belajar</h2>

	{#if inProgress.length === 0}
		<EmptyState
			icon="📖"
			title="Belum ada kursus yang dimulai"
			description="Mulai belajar dari katalog kursus yang tersedia"
		>
			<Button href="/my/catalog" variant="primary" size="sm">Lihat Katalog</Button>
		</EmptyState>
	{:else}
		<div class="course-grid">
			{#each inProgress as course}
				<a
					href={course.nextLessonSlug ? `/lessons/${course.nextLessonSlug}` : '#'}
					class="course-card"
				>
					<div class="course-card-header">
						<span class="course-icon">{course.courseIcon}</span>
						<div class="course-info">
							<h3 class="course-title">{course.courseTitle}</h3>
							{#if course.lastLessonTitle}
								<p class="course-last">Terakhir: {course.lastLessonTitle}</p>
							{/if}
						</div>
					</div>
					<div class="course-progress-row">
						<div class="course-progress-info">
							<span class="course-pct">{course.progress}%</span>
							<span class="course-count">{course.completedLessons}/{course.totalLessons} sesi</span>
						</div>
						<ProgressBar value={course.completedLessons} max={course.totalLessons} height={4} />
					</div>
					<div class="course-resume">
						<span>Lanjutkan →</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>

<style>
	.continue-section {
		margin-bottom: 20px;
	}

	.section-title {
		font-size: 15px;
		font-weight: 590;
		color: #fff;
		margin: 0 0 12px;
		font-feature-settings: 'cv01', 'ss03';
	}

	.course-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}

	.course-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		padding: 16px;
		text-decoration: none;
		transition: border-color 0.15s ease;
	}

	.course-card:hover {
		border-color: rgba(113, 112, 255, 0.4);
	}

	.course-card-header {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}

	.course-icon {
		font-size: 28px;
		line-height: 1;
		flex-shrink: 0;
	}

	.course-info {
		flex: 1;
		min-width: 0;
	}

	.course-title {
		font-size: 14px;
		font-weight: 510;
		color: #fff;
		margin: 0 0 2px;
		line-height: 1.3;
	}

	.course-last {
		font-size: 12px;
		font-weight: 400;
		color: #8a8f98;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.course-progress-row {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.course-progress-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.course-pct {
		font-size: 13px;
		font-weight: 590;
		color: #7170ff;
	}

	.course-count {
		font-size: 11px;
		font-weight: 400;
		color: #8a8f98;
	}

	.course-resume {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		font-weight: 510;
		color: #5e6ad2;
	}

	@media (max-width: 768px) {
		.course-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
