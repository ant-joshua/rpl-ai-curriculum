<script lang="ts">
	let { data } = $props();

	let offering = $derived(data.offering);
	let course = $derived(data.course);
	let lessons = $derived<any[]>(data.lessons ?? []);
	let completedCount = $state(0);

	$effect(() => {
		if (lessons.length) {
			loadProgress();
		}
	});

	async function loadProgress() {
		try {
			const res = await fetch(`/api/lessons/progress?course_offering_id=${offering?.id}`, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
				}
			});
			if (res.ok) {
				const json = await res.json();
				if (json.completed_count !== undefined) {
					completedCount = json.completed_count;
				}
			}
		} catch {
			// Progress API not available
		}
	}
</script>

<svelte:head>
	<title>{offering?.name ?? 'Course'} — RPL AI Curriculum</title>
</svelte:head>

<div class="offering-page">
	{#if !offering || data.status === 404}
		<div class="error-state">
			<h2>Course not found</h2>
			<p class="text-secondary">This course offering may have been removed or is not yet available.</p>
			<a href="/learn" class="back-link">&larr; Back to courses</a>
		</div>
	{:else}
		<!-- Breadcrumb -->
		<a href="/learn" class="back-link">&larr; All Courses</a>

		<!-- Header -->
		<header class="offering-header">
			<div class="header-icon">{course?.icon ?? '📚'}</div>
			<div class="header-info">
				<h1 class="course-title">{course?.title ?? offering.name}</h1>
				<p class="offering-name">{offering.name}</p>
				<div class="header-meta">
					{#if offering.code}
						<span class="meta-code">{offering.code}</span>
					{/if}
					<span class="meta-status" class:active={offering.status === 'active'} class:archived={offering.status === 'archived'}>
						{offering.status}
					</span>
					{#if course?.level}
						<span class="meta-level">{course.level}</span>
					{/if}
				</div>
			</div>
		</header>

		<!-- Course description -->
		{#if course?.description}
			<div class="course-description">
				<p>{course.description}</p>
			</div>
		{/if}

		<!-- Progress tracking -->
		<div class="progress-card">
			<div class="progress-header">
				<span class="progress-label">Progress</span>
				<span class="progress-count">{completedCount} of {lessons.length} lessons</span>
			</div>
			<div class="progress-bar-bg">
				<div
					class="progress-bar-fill"
					style="width: {lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0}%"
				></div>
			</div>
		</div>

		<!-- Lesson list -->
		<div class="lesson-list">
			<h2 class="section-title">Lessons</h2>
			{#if lessons.length === 0}
				<div class="empty-state">
					<p class="text-secondary">No lessons available yet.</p>
				</div>
			{:else}
				{#each lessons as lesson, i (lesson.id)}
					<a
						href="/learn/{offering.id}/lessons/{lesson.slug}"
						class="lesson-card animate-in"
						style="animation-delay: {i * 0.04}s"
					>
						<div class="lesson-order">{i + 1}</div>
						<div class="lesson-info">
							<h3 class="lesson-title">{lesson.title}</h3>
							<div class="lesson-meta">
								{#if lesson.duration_minutes}
									<span class="lesson-duration">{lesson.duration_minutes} min</span>
								{/if}
								<span class="lesson-status" class:published={lesson.status === 'published'} class:draft={lesson.status === 'draft'}>
									{lesson.status}
								</span>
							</div>
						</div>
						<div class="lesson-arrow">&rarr;</div>
					</a>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.offering-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 24px 16px 48px;
		animation: fadeIn 0.3s ease both;
	}

	.error-state {
		text-align: center;
		padding: 60px 20px;
	}

	.error-state h2 {
		font-size: 24px;
		margin: 0 0 8px;
		color: var(--text);
	}

	.text-secondary {
		color: var(--text-secondary);
		font-size: 14px;
		margin: 0 0 20px;
	}

	.back-link {
		display: inline-block;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-secondary);
		margin-bottom: 20px;
		text-decoration: none;
		transition: color 0.15s;
	}

	.back-link:hover {
		color: var(--accent);
	}

	/* Header */
	.offering-header {
		display: flex;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 24px;
	}

	.header-icon {
		font-size: 48px;
		line-height: 1;
		flex-shrink: 0;
	}

	.header-info {
		flex: 1;
		min-width: 0;
	}

	.course-title {
		font-size: 26px;
		font-weight: 700;
		color: var(--text);
		margin: 0 0 4px;
		line-height: 1.3;
	}

	.offering-name {
		font-size: 15px;
		color: var(--text-secondary);
		margin: 0 0 10px;
	}

	.header-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.meta-code {
		font-size: 11px;
		font-weight: 600;
		padding: 3px 8px;
		border-radius: 4px;
		background: var(--accent-dim);
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.meta-status {
		font-size: 11px;
		font-weight: 600;
		padding: 3px 8px;
		border-radius: 4px;
		background: var(--bg-secondary);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.meta-status.active {
		background: rgba(34, 197, 94, 0.12);
		color: var(--success);
	}

	.meta-status.archived {
		background: rgba(239, 68, 68, 0.12);
		color: var(--danger);
	}

	.meta-level {
		font-size: 11px;
		font-weight: 600;
		padding: 3px 8px;
		border-radius: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text-secondary);
		text-transform: capitalize;
	}

	/* Description */
	.course-description {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px 20px;
		margin-bottom: 24px;
		font-size: 14px;
		line-height: 1.7;
		color: var(--text-secondary);
	}

	.course-description p {
		margin: 0;
	}

	/* Progress */
	.progress-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px 20px;
		margin-bottom: 28px;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.progress-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
	}

	.progress-count {
		font-size: 13px;
		color: var(--text-secondary);
	}

	.progress-bar-bg {
		width: 100%;
		height: 6px;
		background: var(--bg-secondary);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		background: var(--gradient-primary);
		border-radius: 3px;
		transition: width 0.4s ease;
	}

	/* Section */
	.section-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 16px;
	}

	/* Lesson list */
	.lesson-list {
		margin-bottom: 32px;
	}

	.empty-state {
		text-align: center;
		padding: 40px 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
	}

	.lesson-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		margin-bottom: 10px;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.lesson-card:hover {
		background: var(--surface-hover);
		border-color: var(--accent);
		transform: translateX(4px);
	}

	.lesson-order {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: var(--accent-dim);
		color: var(--accent);
		font-size: 14px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.lesson-info {
		flex: 1;
		min-width: 0;
	}

	.lesson-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 4px;
		line-height: 1.3;
	}

	.lesson-meta {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.lesson-duration {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.lesson-status {
		font-size: 10px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 4px;
		background: var(--bg-secondary);
		color: var(--text-secondary);
		text-transform: uppercase;
	}

	.lesson-status.published {
		background: rgba(34, 197, 94, 0.12);
		color: var(--success);
	}

	.lesson-status.draft {
		background: rgba(245, 158, 11, 0.12);
		color: var(--warning);
	}

	.lesson-arrow {
		font-size: 18px;
		color: var(--text-secondary);
		flex-shrink: 0;
		transition: transform 0.15s;
	}

	.lesson-card:hover .lesson-arrow {
		color: var(--accent);
		transform: translateX(4px);
	}

	@media (max-width: 640px) {
		.course-title {
			font-size: 22px;
		}

		.offering-header {
			flex-direction: column;
			gap: 10px;
		}
	}
</style>
