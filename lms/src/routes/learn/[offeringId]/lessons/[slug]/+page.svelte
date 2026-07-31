<script lang="ts">
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import LockedLesson from '$lib/components/LockedLesson.svelte';
	import LessonDiscussions from '$lib/components/LessonDiscussions.svelte';
	import ContentRenderer from '$lib/components/content/ContentRenderer.svelte';
	import LessonCompleteScreen from '$lib/components/content/LessonCompleteScreen.svelte';
	import LessonSidebar from '$lib/components/lesson/LessonSidebar.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	let { data } = $props();

	let lesson = $derived(data.lesson);
	let offering = $derived(data.offering);
	let course = $derived(data.course);
	let contentBlocks = $derived<any[]>(data.contentBlocks ?? []);
	let allLessons = $derived<any[]>(data.allLessons ?? []);
	let params = $derived($page.params);

	let setBreadcrumbTail = getContext<(items: { label: string; href?: string }[]) => void>('breadcrumb-tail');
	$effect(() => {
		if (lesson) {
			setBreadcrumbTail([
				{ label: lesson.title },
			]);
		}
	});

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

	let lessonIndex = $derived(
		lesson ? allLessons.findIndex((l: any) => l.id === lesson.id) + 1 : 0
	);
	let totalLessons = $derived(allLessons.length);

	let accessCheck = $state<{ loading: boolean; accessible: boolean; prerequisites: any[] }>({
		loading: true,
		accessible: false,
		prerequisites: []
	});

	let isCompleted = $state(false);
	let isCompleting = $state(false);
	let isBookmarked = $state(false);
	let isBookmarking = $state(false);
	let noteContent = $state('');
	let isSavingNote = $state(false);
	let isLoadingNote = $state(false);
	let noteId = $state<string | null>(null);
	let noteSaved = $state(false);
	let sidebarMobileOpen = $state(false);
	let contentAreaEl = $state<HTMLDivElement | null>(null);
	let hasReached80Pct = $state(false);
	
	// New state for Duolingo complete screen
	let lessonFinished = $state(false);
	let finishedScore = $state(0);
	let finishedTotal = $state(0);
	let finishedXp = $state(0);

	$effect(() => {
		if (!lesson) return;
		checkAccess();
		loadProgress();
		loadBookmark();
		loadNote();
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
		if (e.key === 'ArrowLeft' && prevLesson) {
			e.preventDefault();
			navigateTo(prevLesson.slug);
		} else if (e.key === 'ArrowRight' && nextLesson) {
			e.preventDefault();
			navigateTo(nextLesson.slug);
		} else if (e.key === 'm' && !e.metaKey && !e.ctrlKey) {
			e.preventDefault();
			sidebarMobileOpen = !sidebarMobileOpen;
		}
	}

	function navigateTo(slug: string) {
		window.location.href = `/learn/${params.offeringId}/lessons/${slug}`;
	}

	function handleScroll() {
		if (!contentAreaEl || isCompleted || hasReached80Pct) return;
		const { scrollTop, scrollHeight, clientHeight } = contentAreaEl;
		const scrollPct = scrollHeight > clientHeight ? (scrollTop + clientHeight) / scrollHeight : 1;
		if (scrollPct >= 0.8) {
			hasReached80Pct = true;
			autoMarkProgress();
		}
	}

	async function autoMarkProgress() {
		if (!lesson || isCompleted) return;
		try {
			await fetch('/api/my/progress', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					lessonSlug: lesson.slug,
					courseOfferingId: params.offeringId,
					completed: false,
					status: 'in_progress',
					timeSpent: 0
				})
			});
		} catch { /* silent */ }
	}

	async function loadProgress() {
		if (!lesson || !params?.offeringId) return;
		try {
			const res = await fetch(`/api/my/lessons/${lesson.id}/complete`);
			if (res.ok) {
				const json = await res.json();
				if (json.success) {
					isCompleted = json.data?.completed === true;
				}
				return;
			}
		} catch { /* fallback */ }

		try {
			const res = await fetch(`/api/my/progress?offeringId=${params.offeringId}`);
			if (res.ok) {
				const json = await res.json();
				if (json.success && json.data) {
					isCompleted = json.data.some((p: any) => p.session_id === lesson.slug && (p.completed || p.status === 'completed'));
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
			const res = await fetch(`/api/lessons/${lesson.id}/access`);
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

	function handleInteractiveComplete(score: number, total: number, xp: number) {
		finishedScore = score;
		finishedTotal = total;
		finishedXp = xp;
		lessonFinished = true;
		addToast('Pelajaran selesai! ✨', 'success');
	}

	async function markComplete() {
		if (!lesson || isCompleting) return;
		isCompleting = true;
		try {
			const res = await fetch(`/api/my/lessons/${lesson.id}/complete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ time_spent_seconds: 0 })
			});
			if (res.ok) {
				isCompleted = true;
				addToast('Pelajaran ditandai selesai! ✓', 'success');

				// Quest progress: complete_lessons
				fetch('/api/gamification/quests/progress', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ questKey: 'complete_lessons', amount: 1 })
				}).catch(() => {});

				fetch('/api/gamification/award', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						reason: 'lesson_complete',
						reference_type: 'lesson',
						reference_id: lesson.id
					})
				}).then(r => {
					if (r.ok) {
						r.json().then(j => {
							if (j.success && j.data) {
								addToast(`+${j.data.xpAwarded} XP! Level ${j.data.level}`, 'success');
							}
						});
					}
				}).catch(() => {});

				const summaryRes = await fetch(`/api/my/progress-summary?offeringId=${params.offeringId}`);
				if (summaryRes.ok) {
					const summary = await summaryRes.json();
					if (summary.success && summary.data.isComplete) {
						const certRes = await fetch('/api/certificates/auto-issue', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
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

	async function undoComplete() {
		if (!lesson || isCompleting) return;
		isCompleting = true;
		try {
			const res = await fetch(`/api/my/lessons/${lesson.id}/complete`, {
				method: 'DELETE'
			});
			if (res.ok) {
				isCompleted = false;
				addToast('Tanda selesai dibatalkan', 'success');
			} else {
				const json = await res.json();
				addToast(json.error || 'Gagal membatalkan', 'error');
			}
		} catch {
			addToast('Gagal membatalkan', 'error');
		} finally {
			isCompleting = false;
		}
	}

	async function loadBookmark() {
		if (!lesson) return;
		try {
			const res = await fetch(`/api/my/bookmarks?offeringId=${params.offeringId}`);
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
				headers: { 'Content-Type': 'application/json' },
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

	async function loadNote() {
		if (!lesson) return;
		isLoadingNote = true;
		try {
			const res = await fetch(`/api/my/notes?lessonId=${lesson.id}`);
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
				headers: { 'Content-Type': 'application/json' },
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

<svelte:window onkeydown={handleKeydown} />
<svelte:head>
	<title>{lesson?.title ?? 'Lesson'} — {course?.title ?? 'RPL AI Curriculum'}</title>
</svelte:head>

{#if !lesson || data.status === 404}
	<div class="error-state">
		<h2>Lesson not found</h2>
		<p class="text-secondary">This lesson may have been removed or is not yet published.</p>
		<a href="/learn/{params.offeringId}" class="back-link">&larr; Back to course</a>
	</div>
{:else}
	<div class="lesson-layout">
		<LessonSidebar
			lessons={allLessons}
			currentLessonId={lesson.id}
			progress={[]}
			offeringId={params.offeringId}
			bind:mobileOpen={sidebarMobileOpen}
		/>

		<div class="lesson-content" bind:this={contentAreaEl} onscroll={handleScroll}>
			<div class="mobile-topbar">
				<button class="mobile-menu-btn" onclick={() => (sidebarMobileOpen = !sidebarMobileOpen)} aria-label="Toggle sidebar">
					<Icon name="menu" size={20} />
				</button>
				<span class="mobile-title">{lesson.title}</span>
			</div>

			<nav class="lesson-breadcrumb">
				<a href="/learn/{params.offeringId}" class="bc-link">{offering?.name || course?.title}</a>
				<span class="bc-sep">/</span>
				<span class="bc-current">{lesson.title}</span>
			</nav>

			<div class="progress-section">
				<span class="progress-label">Lesson {lessonIndex} of {totalLessons}</span>
				<ProgressBar value={lessonIndex} max={totalLessons} height={4} />
			</div>

			<header class="lesson-header">
				<div class="header-content">
					<h1 class="lesson-title">{lesson.title}</h1>
					{#if offering}
						<p class="offering-name">{offering.name}</p>
					{/if}
				</div>
				<div class="header-actions">
					<button
						class="bookmark-btn"
						class:bookmarked={isBookmarked}
						onclick={() => toggleBookmark()}
						disabled={isBookmarking}
						title={isBookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
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
			</header>

			<div class="lesson-body">
				{#if accessCheck.loading}
					<div class="loading-state">
						<Skeleton variant="block" height="200px" />
					</div>
				{:else if !accessCheck.accessible}
					<LockedLesson prerequisites={accessCheck.prerequisites} />
				{:else if lessonFinished}
					<LessonCompleteScreen
						score={finishedScore}
						total={finishedTotal}
						xpEarned={finishedXp}
						onContinue={() => {
							if (nextLesson) {
								navigateTo(nextLesson.slug);
							} else {
								window.location.href = `/learn/${params.offeringId}`;
							}
						}}
					/>
				{:else if contentBlocks.length > 0}
					{#each contentBlocks as block, i}
						<div class="content-block">
							<ContentRenderer {block} onComplete={(s, t, x) => handleInteractiveComplete(s, t, x)} />
						</div>
					{/each}
				{:else}
					<div class="empty-content">
						<p class="text-secondary">No content available for this lesson.</p>
					</div>
				{/if}
			</div>

			{#if !lessonFinished}
				<div class="complete-section">
					{#if isCompleted}
						<Button
							onclick={() => undoComplete()}
							disabled={isCompleting}
							variant="secondary"
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="15 9 9 15"/><polyline points="9 9 15 15"/></svg>
							Batalkan Selesai
						</Button>
					{:else}
						<Button
							onclick={() => markComplete()}
							disabled={isCompleting}
							loading={isCompleting}
							variant="primary"
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
							Tandai Selesai
						</Button>
					{/if}
				</div>
			{/if}

			<nav class="lesson-nav">
				<div class="nav-item">
					{#if prevLesson}
						<a href="/learn/{params.offeringId}/lessons/{prevLesson.slug}" class="nav-btn nav-prev">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
							<span class="nav-label">
								<span class="nav-dir">Previous</span>
								<span class="nav-title">{prevLesson.title}</span>
							</span>
						</a>
					{:else}
						<div></div>
					{/if}
				</div>
				<div class="nav-item nav-right">
					{#if nextLesson}
						<a href="/learn/{params.offeringId}/lessons/{nextLesson.slug}" class="nav-btn nav-next">
							<span class="nav-label">
								<span class="nav-dir">Next</span>
								<span class="nav-title">{nextLesson.title}</span>
							</span>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
						</a>
					{:else}
						<div></div>
					{/if}
				</div>
			</nav>

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
					/>
					<div class="notes-actions">
						<Button onclick={() => saveNote()} disabled={isSavingNote} loading={isSavingNote} variant="ghost">
							{#if !isSavingNote && noteSaved}
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
								Saved
							{:else if !isSavingNote}
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
								Save Note
							{:else}
								<span class="spinner"></span> Saving...
							{/if}
						</Button>
					</div>
				{/if}
			</div>

			<div class="discussions-section">
				<LessonDiscussions lessonId={lesson.id} offeringId={params.offeringId ?? ''} />
			</div>
		</div>
	</div>
{/if}

<style>
	/* Existing styles ... */
	.lesson-layout {
		display: flex;
		max-width: 1200px;
		margin: 0 auto;
		padding: 24px;
		gap: 32px;
	}

	.lesson-content {
		flex: 1;
		min-width: 0;
		max-width: 800px;
		margin: 0 auto;
	}

	.mobile-topbar { display: none; }
	.lesson-breadcrumb { font-size: 13px; color: #94a3b8; margin-bottom: 16px; }
	.bc-link { color: #94a3b8; text-decoration: none; }
	.bc-link:hover { color: var(--accent); }
	.bc-sep { margin: 0 8px; }

	.progress-section { margin-bottom: 32px; }
	.progress-label { font-size: 13px; color: #64748b; margin-bottom: 8px; display: block; }

	.lesson-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 32px;
		gap: 16px;
	}

	.header-content { flex: 1; }
	.lesson-title { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
	.offering-name { font-size: 14px; color: #64748b; margin: 0; }
	.header-actions { display: flex; gap: 8px; align-items: center; }

	.bookmark-btn {
		background: var(--surface, #F8FAFC);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: 8px;
		padding: 8px;
		cursor: pointer;
		color: #94a3b8;
		transition: all 0.2s;
	}
	.bookmark-btn.bookmarked { color: var(--accent, #4F46E5); background: rgba(79, 70, 229, 0.05); border-color: rgba(79, 70, 229, 0.2); }
	.badge-group { display: flex; gap: 8px; }

	.lesson-body { margin-bottom: 32px; min-height: 200px; }
	.empty-content { padding: 48px 0; text-align: center; }

	.complete-section { text-align: center; padding: 24px 0; margin-bottom: 32px; border-top: 1px solid rgba(0,0,0,0.06); }
	
	.lesson-nav { display: flex; justify-content: space-between; margin-bottom: 48px; gap: 16px; }
	.nav-item { flex: 1; }
	.nav-right { display: flex; justify-content: flex-end; }
	.nav-btn {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background: var(--surface, #F8FAFC);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: 12px;
		text-decoration: none;
		transition: all 0.2s;
		width: 100%;
	}
	.nav-btn:hover { border-color: var(--accent, #4F46E5); background: rgba(79, 70, 229, 0.03); }
	.nav-label { display: flex; flex-direction: column; gap: 2px; }
	.nav-dir { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
	.nav-title { font-size: 14px; color: #334155; font-weight: 500; }

	.notes-section {
		margin-top: 32px;
		padding: 24px;
		background: var(--surface, #F8FAFC);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: 12px;
	}
	.notes-title { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 16px; }
	.notes-loading { padding: 20px; text-align: center; color: #94a3b8; }
	.notes-actions { margin-top: 12px; display: flex; justify-content: flex-end; }
	.spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(79,70,229,0.2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 8px; vertical-align: middle; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.discussions-section { margin-top: 32px; }

	@media (max-width: 768px) {
		.lesson-layout { padding: 16px; }
		.mobile-topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; position: sticky; top: 0; background: var(--bg); padding: 8px 0; z-index: 10; }
		.mobile-menu-btn { background: none; border: none; padding: 4px; color: #334155; cursor: pointer; }
		.mobile-title { font-size: 16px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.lesson-header { flex-direction: column; }
		.lesson-title { font-size: 24px; }
		.lesson-nav { flex-direction: column; }
	}
</style>