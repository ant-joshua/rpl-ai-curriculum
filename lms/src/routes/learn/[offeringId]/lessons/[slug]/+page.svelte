<script lang="ts">
	import { page } from '$app/stores';
	import LockedLesson from '$lib/components/LockedLesson.svelte';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data } = $props();

	let lesson = $derived(data.lesson);
	let offering = $derived(data.offering);
	let course = $derived(data.course);
	let contentBlock = $derived(data.contentBlock);
	let allLessons = $derived<any[]>(data.allLessons ?? []);
	let params = $derived($page.params);

	// Navigation
	let prevLesson = $derived.by(() => {
		if (!lesson || !allLessons.length) return null;
		const idx = allLessons.findIndex((l: any) => l.id === lesson.id);
		if (idx > 0) return allLessons[idx - 1];
		return null;
	});

	let nextLesson = $derived.by(() => {
		if (!lesson || !allLessons.length) return null;
		const idx = allLessons.findIndex((l: any) => l.id === lesson.id);
		if (idx < allLessons.length - 1) return allLessons[idx + 1];
		return null;
	});

	// Prerequisite access check
	let accessCheck = $state<{ loading: boolean; accessible: boolean; prerequisites: any[] }>({
		loading: true,
		accessible: false,
		prerequisites: []
	});

	$effect(() => {
		if (!lesson) return;
		checkAccess();
	});

	async function checkAccess() {
		if (!lesson) return;
		accessCheck.loading = true;
		try {
			const res = await fetch(`/api/lessons/${lesson.id}/access`, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
				}
			});
			if (res.ok) {
				const json = await res.json();
				accessCheck.accessible = json.accessible !== false;
				accessCheck.prerequisites = json.prerequisites || [];
			} else {
				accessCheck.accessible = true;
				accessCheck.prerequisites = [];
			}
		} catch {
			accessCheck.accessible = true;
			accessCheck.prerequisites = [];
		} finally {
			accessCheck.loading = false;
		}
	}

	async function markComplete() {
		if (!lesson) return;
		try {
			const res = await fetch(`/api/lessons/${lesson.id}/progress`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
				},
				body: JSON.stringify({ completed: true })
			});
			if (res.ok) {
				addToast('Lesson marked as complete!', 'success');
			} else {
				addToast('Failed to save progress', 'error');
			}
		} catch {
			addToast('Failed to save progress', 'error');
		}
	}

	// Content rendering helpers
	function isVideoType(type: string | null | undefined) {
		return type === 'video' || type === 'embed';
	}
</script>

<svelte:head>
	<title>{lesson?.title ?? 'Lesson'} — {course?.title ?? 'RPL AI Curriculum'}</title>
</svelte:head>

<div class="lesson-page">
	{#if !lesson || data.status === 404}
		<div class="error-state">
			<h2>Lesson not found</h2>
			<p class="text-secondary">This lesson may have been removed or is not yet published.</p>
			<a href="/learn/{params.offeringId}" class="back-link">&larr; Back to course</a>
		</div>
	{:else}
		<!-- Back navigation -->
		<a href="/learn/{params.offeringId}" class="back-link">&larr; {course?.title ?? 'Back to course'}</a>

		<!-- Header -->
		<header class="lesson-header">
			<div class="header-top">
				<h1 class="lesson-title">{lesson.title}</h1>
				<div class="badge-group">
					{#if lesson.duration_minutes}
						<span class="badge badge-duration">{lesson.duration_minutes} min</span>
					{/if}
					<span class="badge badge-status" class:published={lesson.status === 'published'} class:draft={lesson.status === 'draft'}>
						{lesson.status}
					</span>
				</div>
			</div>
			{#if offering}
				<p class="offering-name">{offering.name}</p>
			{/if}
		</header>

		<!-- Content area -->
		<div class="lesson-body">
			{#if accessCheck.loading}
				<div class="loading-state">
					<div class="skeleton-block" style="height: 200px;"></div>
				</div>
			{:else if !accessCheck.accessible}
				<LockedLesson prerequisites={accessCheck.prerequisites} />
			{:else if contentBlock}
				{@const blockType = contentBlock.type}

				{#if blockType === 'text'}
					<div class="content-block markdown-content">
						{@html contentBlock.body_html ?? contentBlock.body ?? ''}
					</div>
				{:else if isVideoType(blockType)}
					<div class="content-block video-wrapper">
						{#if contentBlock.body_html}
							<div class="video-embed">{@html contentBlock.body_html}</div>
						{:else if contentBlock.body}
							<div class="video-embed">{@html contentBlock.body}</div>
						{/if}
						{#if contentBlock.title}
							<p class="content-title">{contentBlock.title}</p>
						{/if}
					</div>
				{:else if blockType === 'code'}
					<div class="content-block code-wrapper">
						{#if contentBlock.title}
							<h3 class="content-title">{contentBlock.title}</h3>
						{/if}
						<pre class="code-block"><code>{contentBlock.body ?? ''}</code></pre>
					</div>
				{:else if blockType === 'image'}
					<div class="content-block image-wrapper">
						{#if contentBlock.body}
							<img src={contentBlock.body} alt={contentBlock.title || 'Lesson image'} />
						{/if}
						{#if contentBlock.title}
							<p class="content-caption">{contentBlock.title}</p>
						{/if}
					</div>
				{:else if blockType === 'quiz'}
					<div class="content-block quiz-wrapper">
						<div class="quiz-placeholder">
							<h3>{contentBlock.title || 'Quiz'}</h3>
							{#if contentBlock.body_html}
								<div class="markdown-content">{@html contentBlock.body_html}</div>
							{/if}
						</div>
					</div>
				{:else}
					{#if contentBlock.body_html}
						<div class="content-block markdown-content">
							{@html contentBlock.body_html}
						</div>
					{:else if contentBlock.body}
						<div class="content-block markdown-content">
							{@html contentBlock.body}
						</div>
					{/if}
				{/if}
			{:else}
				<div class="empty-content">
					<p class="text-secondary">No content available for this lesson.</p>
				</div>
			{/if}
		</div>

		<!-- Navigation footer -->
		<nav class="lesson-nav">
			<div class="nav-item">
				{#if prevLesson}
					<a href="/learn/{params.offeringId}/lessons/{prevLesson.slug}" class="nav-btn nav-prev">
						<span class="nav-arrow">&larr;</span>
						<span class="nav-label">
							<span class="nav-dir">Previous</span>
							<span class="nav-title">{prevLesson.title}</span>
						</span>
					</a>
				{/if}
			</div>
			<div class="nav-item nav-right">
				{#if nextLesson}
					<a href="/learn/{params.offeringId}/lessons/{nextLesson.slug}" class="nav-btn nav-next">
						<span class="nav-label">
							<span class="nav-dir">Next</span>
							<span class="nav-title">{nextLesson.title}</span>
						</span>
						<span class="nav-arrow">&rarr;</span>
					</a>
				{/if}
			</div>
		</nav>

		<!-- Mark complete button -->
		<div class="complete-section">
			<button class="complete-btn" onclick={() => markComplete()}>
				Mark as Complete
			</button>
		</div>
	{/if}
</div>

<style>
	.lesson-page {
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
	.lesson-header {
		margin-bottom: 28px;
	}

	.header-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}

	.lesson-title {
		font-size: 26px;
		font-weight: 700;
		color: var(--text);
		margin: 0;
		line-height: 1.3;
	}

	.badge-group {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.badge {
		font-size: 11px;
		font-weight: 600;
		padding: 4px 10px;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.badge-duration {
		background: var(--accent-dim);
		color: var(--accent);
	}

	.badge-status.published {
		background: rgba(34, 197, 94, 0.12);
		color: var(--success);
	}

	.badge-status.draft {
		background: rgba(245, 158, 11, 0.12);
		color: var(--warning);
	}

	.offering-name {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 6px 0 0;
	}

	/* Loading */
	.loading-state {
		padding: 20px 0;
	}

	/* Content blocks */
	.lesson-body {
		margin-bottom: 32px;
	}

	.content-block {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 20px;
		line-height: 1.7;
		font-size: 16px;
	}

	.content-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 12px;
	}

	.content-caption {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 8px 0 0;
		text-align: center;
	}

	/* Video */
	.video-wrapper {
		padding: 16px;
	}

	.video-embed {
		position: relative;
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
	}

	.video-embed :global(iframe) {
		width: 100%;
		aspect-ratio: 16 / 9;
		border: none;
		border-radius: 8px;
	}

	/* Code */
	.code-wrapper {
		padding: 20px;
	}

	.code-block {
		background: #0d0e17;
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 16px;
		overflow-x: auto;
		font-size: 14px;
		line-height: 1.6;
		margin: 0;
	}

	.code-block code {
		background: none;
		padding: 0;
		color: var(--text);
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
	}

	/* Image */
	.image-wrapper {
		padding: 16px;
		text-align: center;
	}

	.image-wrapper img {
		max-width: 100%;
		border-radius: 8px;
		display: block;
		margin: 0 auto;
	}

	/* Quiz */
	.quiz-wrapper {
		padding: 24px;
	}

	/* Empty */
	.empty-content {
		text-align: center;
		padding: 40px 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
	}

	/* Navigation */
	.lesson-nav {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 24px;
	}

	.nav-item {
		flex: 1;
	}

	.nav-right {
		display: flex;
		justify-content: flex-end;
	}

	.nav-btn {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		padding: 14px 18px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-decoration: none;
		transition: all 0.15s ease;
		max-width: 320px;
	}

	.nav-btn:hover {
		background: var(--surface-hover);
		border-color: var(--accent);
	}

	.nav-btn.nav-next {
		text-align: right;
	}

	.nav-arrow {
		font-size: 18px;
		color: var(--accent);
		flex-shrink: 0;
	}

	.nav-label {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.nav-dir {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.nav-title {
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Mark complete */
	.complete-section {
		display: flex;
		justify-content: center;
		padding-top: 8px;
	}

	.complete-btn {
		padding: 12px 32px;
		font-size: 14px;
		font-weight: 600;
		color: #fff;
		background: var(--accent);
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.complete-btn:hover {
		background: var(--accent-secondary);
		transform: translateY(-1px);
	}

	.complete-btn:active {
		transform: translateY(0);
	}

	@media (max-width: 640px) {
		.lesson-title {
			font-size: 22px;
		}

		.header-top {
			flex-direction: column;
			gap: 10px;
		}

		.lesson-nav {
			flex-direction: column;
		}

		.nav-btn {
			max-width: 100%;
		}
	}
</style>
