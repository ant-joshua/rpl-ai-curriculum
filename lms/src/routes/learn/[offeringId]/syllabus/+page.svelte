<script lang="ts">
	import type { PageData } from './$types';
	import { getContext, onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	// Push breadcrumb tail via layout context
	let setBreadcrumbTail = getContext<(items: { label: string; href?: string }[]) => void>('breadcrumb-tail');
	onMount(() => {
		setBreadcrumbTail([{ label: 'Silabus' }]);
	});

	let offering = $derived(data.offering);
	let lessons = $derived(data.lessons);
	let weeklyLessons = $derived(data.weeklyLessons);
	let progress = $derived(data.progress);

	let contentTypeIcon: Record<string, string> = {
		text: '📝',
		video: '🎥',
		code: '💻',
		embed: '🔗',
		quiz: '❓',
		assessment: '📋'
	};

	let contentTypeLabel: Record<string, string> = {
		text: 'Teks',
		video: 'Video',
		code: 'Kode',
		embed: 'Embed',
		quiz: 'Kuis',
		assessment: 'Penilaian'
	};

	let totalDuration = $derived(
		lessons.reduce((sum: number, l: any) => sum + (l.durationMinutes || 0), 0)
	);

	let hours = $derived(Math.floor(totalDuration / 60));
	let mins = $derived(totalDuration % 60);
	let durationStr = $derived(hours > 0 ? `${hours}j ${mins}m` : `${mins}m`);

	function typeBadgeClass(type: string): string {
		return `type-badge type-${type}`;
	}
</script>

<svelte:head>
	<title>Silabus — {offering.courseTitle} | LMS RPL</title>
</svelte:head>

<div class="syllabus-page">
	<!-- Header -->
	<div class="syllabus-header">
		<div class="course-icon">{offering.courseIcon}</div>
		<div class="course-info">
			<h1>{offering.courseTitle}</h1>
			<p class="course-desc">{offering.courseDescription || ''}</p>
			<div class="meta-row">
				{#if offering.category}
					<span class="meta-badge">{offering.category}</span>
				{/if}
				{#if offering.level}
					<span class="meta-badge">{offering.level}</span>
				{/if}
				<span class="meta-badge">{durationStr}</span>
				<span class="meta-badge">{lessons.length} pelajaran</span>
			</div>
		</div>
	</div>

	<!-- Progress Bar -->
	<div class="progress-section">
		<div class="progress-header">
			<span class="progress-label">Progress Belajar</span>
			<span class="progress-pct">{progress.percentage}%</span>
		</div>
		<div class="progress-track">
			<div class="progress-fill" style="width: {progress.percentage}%"></div>
		</div>
		<p class="progress-sub">{progress.completed}/{progress.total} selesai</p>
	</div>

	<!-- Weekly Lessons -->
	<div class="weekly-section">
		{#each weeklyLessons as week}
			<div class="week-card">
				<div class="week-header">
					<h3>Minggu {week.week}</h3>
					<span class="week-count">{week.lessons.filter((l: any) => l.isCompleted).length}/{week.lessons.length} selesai</span>
				</div>
				<div class="lesson-list">
					{#each week.lessons as lesson, i}
						<a
							href="/learn/{offering.id}/lessons/{lesson.slug}"
							class="lesson-card"
							class:completed={lesson.isCompleted}
							class:locked={lesson.isLocked}
							tabindex={lesson.isLocked ? -1 : 0}
						>
							<div class="lesson-status">
								{#if lesson.isCompleted}
									<span class="checkmark">✅</span>
								{:else if lesson.isLocked}
									<span class="lock-icon">🔒</span>
								{:else}
									<span class="index-num">{i + 1}</span>
								{/if}
							</div>
							<div class="lesson-body">
								<div class="lesson-title">{lesson.title}</div>
								<div class="lesson-meta">
									<span class={typeBadgeClass(lesson.contentType)}>
										{contentTypeIcon[lesson.contentType] || '📄'} {contentTypeLabel[lesson.contentType] || 'Teks'}
									</span>
									{#if lesson.durationMinutes}
										<span class="duration-badge">⏱ {lesson.durationMinutes}m</span>
									{/if}
									{#if lesson.isOptional}
										<span class="optional-badge">⚡ Tambahan</span>
									{/if}
								</div>
								{#if lesson.isLocked && lesson.lockedReason}
									<p class="lock-reason">{lesson.lockedReason}</p>
								{/if}
							</div>
							{#if !lesson.isLocked && !lesson.isCompleted}
								<div class="lesson-arrow">→</div>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Certificate CTA -->
	{#if progress.percentage === 100}
		<div class="cert-section">
			<div class="cert-card">
				<div class="cert-icon">🎓</div>
				<h3>Selamat! Kamu telah menyelesaikan semua pelajaran</h3>
				<p>Ambil sertifikat kelulusan sebagai bukti penyelesaian kursus ini.</p>
				<a href="/my/certificates" class="cert-btn">Ambil Sertifikat</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.syllabus-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 32px 16px 64px;
	}
	.syllabus-header {
		display: flex;
		gap: 20px;
		align-items: flex-start;
		margin-bottom: 32px;
	}
	.course-icon {
		font-size: 64px;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		flex-shrink: 0;
	}
	.course-info h1 {
		margin: 0 0 4px;
		font-size: 24px;
		font-weight: 700;
		color: var(--text-primary);
	}
	.course-desc {
		color: var(--text-secondary);
		font-size: 14px;
		margin: 0 0 12px;
		line-height: 1.5;
	}
	.meta-row { display: flex; flex-wrap: wrap; gap: 8px; }
	.meta-badge {
		font-size: 12px;
		padding: 4px 10px;
		border-radius: 99px;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text-secondary);
	}
	.progress-section {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 32px;
	}
	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}
	.progress-label { font-weight: 600; color: var(--text-primary); font-size: 14px; }
	.progress-pct { font-weight: 700; color: var(--accent); font-size: 18px; }
	.progress-track {
		height: 8px;
		background: var(--bg-primary);
		border-radius: 99px;
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), #6ee7b7);
		border-radius: 99px;
		transition: width 0.5s ease;
	}
	.progress-sub { font-size: 12px; color: var(--text-secondary); margin: 8px 0 0; }
	.weekly-section { display: flex; flex-direction: column; gap: 24px; }
	.week-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}
	.week-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid var(--border);
	}
	.week-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
	.week-count { font-size: 12px; color: var(--text-secondary); }
	.lesson-list { display: flex; flex-direction: column; }
	.lesson-card {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 20px;
		text-decoration: none;
		border-bottom: 1px solid var(--border);
		transition: background 0.15s;
	}
	.lesson-card:last-child { border-bottom: none; }
	.lesson-card:hover:not(.locked) { background: color-mix(in srgb, var(--accent) 8%, transparent); }
	.lesson-card.locked { opacity: 0.5; cursor: not-allowed; }
	.lesson-card.completed { background: color-mix(in srgb, #22c55e 5%, transparent); }
	.lesson-status {
		width: 36px; height: 36px;
		display: flex; align-items: center; justify-content: center;
		flex-shrink: 0;
	}
	.checkmark { font-size: 20px; }
	.lock-icon { font-size: 16px; }
	.index-num {
		width: 28px; height: 28px; border-radius: 50%;
		background: var(--accent); color: #fff;
		font-size: 12px; font-weight: 600;
		display: flex; align-items: center; justify-content: center;
	}
	.lesson-body { flex: 1; min-width: 0; }
	.lesson-title { font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px; }
	.lesson-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
	.type-badge, .duration-badge, .optional-badge { font-size: 11px; padding: 2px 8px; border-radius: 99px; }
	.type-badge { background: color-mix(in srgb, var(--accent) 15%, transparent); color: var(--accent); }
	.type-video { background: color-mix(in srgb, #a855f7 15%, transparent); color: #a855f7; }
	.type-code { background: color-mix(in srgb, #f59e0b 15%, transparent); color: #f59e0b; }
	.type-quiz { background: color-mix(in srgb, #ef4444 15%, transparent); color: #ef4444; }
	.duration-badge { background: var(--bg-primary); color: var(--text-secondary); }
	.optional-badge { background: color-mix(in srgb, #22c55e 15%, transparent); color: #22c55e; }
	.lock-reason { font-size: 11px; color: var(--text-secondary); margin: 2px 0 0; }
	.lesson-arrow { color: var(--text-secondary); font-size: 16px; flex-shrink: 0; }
	.cert-section { margin-top: 32px; }
	.cert-card {
		background: linear-gradient(135deg, var(--surface), color-mix(in srgb, #f59e0b 10%, var(--surface)));
		border: 1px solid color-mix(in srgb, #f59e0b 30%, transparent);
		border-radius: 16px; padding: 32px; text-align: center;
	}
	.cert-icon { font-size: 64px; margin-bottom: 12px; }
	.cert-card h3 { margin: 0 0 8px; color: var(--text-primary); font-size: 20px; }
	.cert-card p { color: var(--text-secondary); margin: 0 0 20px; }
	.cert-btn {
		display: inline-block; padding: 12px 32px; border-radius: 99px;
		background: var(--accent); color: #fff;
		font-weight: 600; font-size: 14px; text-decoration: none; transition: opacity 0.15s;
	}
	.cert-btn:hover { opacity: 0.9; }

	@media (max-width: 640px) {
		.syllabus-page { padding: 20px 12px 48px; }
		.syllabus-header { flex-direction: column; gap: 12px; }
		.course-icon { font-size: 48px; width: 64px; height: 64px; }
		.course-info h1 { font-size: 20px; }
		.week-header { padding: 12px 14px; flex-wrap: wrap; gap: 4px; }
		.lesson-card { padding: 12px 14px; gap: 10px; }
		.lesson-title { font-size: 13px; }
		.lesson-meta { gap: 4px; }
		.cert-card { padding: 24px 16px; }
		.cert-card h3 { font-size: 17px; }
		.cert-icon { font-size: 48px; }
	}
</style>
