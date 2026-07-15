<script lang="ts">
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import LockedLesson from '$lib/components/LockedLesson.svelte';
	import DiscussionPanel from '$lib/components/DiscussionPanel.svelte';
	import ContentRenderer from '$lib/components/content/ContentRenderer.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { Badge, Button, Textarea, Skeleton } from '$lib/components/ui';

	let { data } = $props();

	let lesson = $derived(data.lesson);
	let offering = $derived(data.offering);
	let course = $derived(data.course);
	let contentBlocks = $derived<any[]>(data.contentBlocks ?? []);
	let allLessons = $derived<any[]>(data.allLessons ?? []);
	let params = $derived($page.params);

	// Push breadcrumb tail via layout context
	let setBreadcrumbTail = getContext<(items: { label: string; href?: string }[]) => void>('breadcrumb-tail');
	$effect(() => {
		if (lesson) {
			setBreadcrumbTail([
				{ label: lesson.title },
			]);
		}
	});

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

	// Progress state
	let isCompleted = $state(false);
	let isCompleting = $state(false);

	// Bookmark state
	let isBookmarked = $state(false);
	let isBookmarking = $state(false);

	// Notes state
	let noteContent = $state('');
	let isSavingNote = $state(false);
	let isLoadingNote = $state(false);
	let noteId = $state<string | null>(null);
	let noteSaved = $state(false);

	$effect(() => {
		if (!lesson) return;
		checkAccess();
		loadProgress();
		loadBookmark();
		loadNote();
	});

	async function loadProgress() {
		if (!lesson || !params?.offeringId) return;
		try {
			const res = await fetch(`/api/my/progress?offeringId=${params.offeringId}`, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
				}
			});
			if (res.ok) {
				const json = await res.json();
				if (json.success && json.data) {
					isCompleted = json.data.some((p: any) => p.session_id === lesson.slug);
				}
			}
		} catch {
			// progress API not available
		}
	}

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
		if (!lesson || isCompleting) return;
		isCompleting = true;
		try {
			const res = await fetch('/api/my/progress', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
				},
				body: JSON.stringify({
					lessonSlug: lesson.slug,
					courseOfferingId: params.offeringId,
					completed: true,
					timeSpent: 0
				})
			});
			if (res.ok) {
				isCompleted = true;
				addToast('Lesson marked as complete!', 'success');

				// Check if all lessons done → auto-issue certificate
				const summaryRes = await fetch(`/api/my/progress-summary?offeringId=${params.offeringId}`, {
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
					}
				});
				if (summaryRes.ok) {
					const summary = await summaryRes.json();
					if (summary.success && summary.data.isComplete) {
						const certRes = await fetch('/api/certificates/auto-issue', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
							},
							body: JSON.stringify({ offeringId: params.offeringId })
						});
						if (certRes.ok) {
							const certJson = await certRes.json();
							if (certJson.success && certJson.data.newlyIssued) {
								addToast('🎉 Selamat! Kamu lulus course ini. Certificate sudah diterbitkan!', 'success');
							}
						}
					}
				}
			} else {
				addToast('Failed to save progress', 'error');
			}
		} catch {
			addToast('Failed to save progress', 'error');
		} finally {
			isCompleting = false;
		}
	}

	// ---- Bookmarks ----
	async function loadBookmark() {
		if (!lesson) return;
		try {
			const res = await fetch(`/api/my/bookmarks?offeringId=${params.offeringId}`, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
				}
			});
			if (res.ok) {
				const json = await res.json();
				if (json.success && json.data) {
					isBookmarked = json.data.some((b: any) => b.lesson_id === lesson.id);
				}
			}
		} catch { /* ignore */ }
	}

	async function toggleBookmark() {
		if (!lesson || isBookmarking) return;
		isBookmarking = true;
		try {
			const res = await fetch('/api/my/bookmarks', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
				},
				body: JSON.stringify({
					lessonId: lesson.id,
					moduleSlug: params.offeringId,
					sessionId: lesson.slug
				})
			});
			if (res.ok) {
				const json = await res.json();
				isBookmarked = json.data?.bookmarked ?? !isBookmarked;
				addToast(isBookmarked ? 'Lesson bookmarked' : 'Bookmark removed', 'success');
			}
		} catch {
			addToast('Failed to toggle bookmark', 'error');
		} finally {
			isBookmarking = false;
		}
	}

	// ---- Notes ----
	async function loadNote() {
		if (!lesson) return;
		isLoadingNote = true;
		try {
			const res = await fetch(`/api/my/notes?lessonId=${lesson.id}`, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
				}
			});
			if (res.ok) {
				const json = await res.json();
				if (json.success && json.data) {
					noteContent = json.data.content || '';
					noteId = json.data.id || null;
				}
			}
		} catch { /* ignore */ }
		finally { isLoadingNote = false; }
	}

	async function saveNote() {
		if (!lesson || isSavingNote) return;
		isSavingNote = true;
		noteSaved = false;
		try {
			const res = await fetch('/api/my/notes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
				},
				body: JSON.stringify({
					lessonId: lesson.id,
					content: noteContent,
					moduleSlug: params.offeringId,
					sessionId: lesson.slug
				})
			});
			if (res.ok) {
				const json = await res.json();
				if (json.data?.id) noteId = json.data.id;
				noteSaved = true;
				addToast('Note saved!', 'success');
				setTimeout(() => { noteSaved = false; }, 2000);
			} else {
				addToast('Failed to save note', 'error');
			}
		} catch {
			addToast('Failed to save note', 'error');
		} finally {
			isSavingNote = false;
		}
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
		<!-- Header -->
		<header class="lesson-header">
			<div class="header-top">
				<h1 class="lesson-title">{lesson.title}</h1>
				<div class="header-actions">
					<button class="bookmark-btn" class:bookmarked={isBookmarked} onclick={() => toggleBookmark()} disabled={isBookmarking} title={isBookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}>
						{#if isBookmarked}
							<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
						{:else}
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
						{/if}
					</button>
					<div class="badge-group">
						{#if lesson.duration_minutes}
							<Badge variant="primary">{lesson.duration_minutes} min</Badge>
						{/if}
						<Badge
							variant={lesson.status === 'published' ? 'success' : lesson.status === 'draft' ? 'warning' : 'default'}
						>
							{lesson.status}
						</Badge>
					</div>
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
					<Skeleton variant="block" height="200px" />
				</div>
			{:else if !accessCheck.accessible}
				<LockedLesson prerequisites={accessCheck.prerequisites} />
			{:else if contentBlocks.length > 0}
				{#each contentBlocks as block, i}
					<div class="content-block-multi">
						<ContentRenderer block={block} />
					</div>
				{/each}
			{:else}
				<div class="empty-content">
					<p class="text-secondary">No content available for this lesson.</p>
				</div>
			{/if}
		</div>

		<!-- Notes section -->
		<div class="notes-section">
			<h3 class="notes-title">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
				Personal Notes
			</h3>
			{#if isLoadingNote}
				<div class="notes-loading">
					<span class="spinner"></span> Loading notes...
				</div>
			{:else}
				<Textarea
					bind:value={noteContent}
					placeholder="Write your personal notes for this lesson..."
					rows={5}
					class={noteSaved ? 'saved' : ''}
				/>
				<div class="notes-actions">
					<Button onclick={() => saveNote()} disabled={isSavingNote} loading={isSavingNote}>
						{#if !isSavingNote && noteSaved}
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
							Saved
						{:else if !isSavingNote}
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
							Save Notes
						{/if}
					</Button>
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
			<Button
				onclick={() => markComplete()}
				disabled={isCompleted || isCompleting}
				loading={isCompleting}
				variant="primary"
				class={['', isCompleted ? 'done' : '', isCompleting ? 'loading' : ''].filter(Boolean).join(' ')}
			>
				{#if isCompleted}
					<span class="checkmark-icon">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
					</span>
					Selesai
				{:else if isCompleting}
					Menyimpan...
				{:else}
					<span class="checkmark-icon checkmark-empty">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
					</span>
					Tandai Selesai
				{/if}
			</Button>
		</div>
		<!-- Discussion panel -->
		<DiscussionPanel lessonId={lesson.id} offeringId={params.offeringId as string} />
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

	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.badge-group {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.offering-name {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 6px 0 0;
	}

	/* Bookmark button */
	.bookmark-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
		padding: 0;
	}

	.bookmark-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-dim);
	}

	.bookmark-btn.bookmarked {
		color: #f59e0b;
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.1);
	}

	.bookmark-btn:disabled {
		opacity: 0.5;
		cursor: default;
	}

	/* Notes section */
	.notes-section {
		margin: 32px 0;
		padding: 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
	}

	.notes-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 12px;
	}

	.notes-loading {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--text-secondary);
		padding: 8px 0;
	}

	.notes-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 10px;
	}

	/* Loading */
	.loading-state {
		padding: 20px 0;
	}

	.lesson-body {
		margin-bottom: 32px;
	}

	/* Multi-block lesson content */
	.content-block-multi {
		margin-bottom: 24px;
	}
	.content-block-multi:last-child {
		margin-bottom: 0;
	}
	.content-block-multi + .content-block-multi {
		padding-top: 8px;
		border-top: 1px solid var(--border);
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

	.checkmark-icon {
		display: inline-flex;
		align-items: center;
	}

	.checkmark-empty {
		opacity: 0.6;
	}

	/* Spinner */
	.spinner {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid var(--accent);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@media (max-width: 640px) {
		.lesson-page { padding: 16px 12px 48px; }
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

		.complete-section :global(.btn) {
			width: 100%;
			justify-content: center;
		}
	}
</style>
