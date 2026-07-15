<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';

	interface Lesson {
		id: string | number;
		title: string;
		slug: string;
		order_index: number;
		duration_minutes?: number;
	}

	interface ProgressItem {
		session_id: string;
		completed?: boolean;
		status?: string;
	}

	let {
		lessons = [],
		currentLessonId,
		progress = [],
		offeringId = '',
		mobileOpen = $bindable(false),
		onclose = () => {},
	}: {
		lessons: Lesson[];
		currentLessonId: string | number;
		progress?: ProgressItem[];
		offeringId?: string;
		mobileOpen?: boolean;
		onclose?: () => void;
	} = $props();

	let completedSlugs = $derived(new Set(progress.map((p: ProgressItem) => String(p.session_id))));

	let currentIdx = $derived(
		lessons.findIndex((l: Lesson) => String(l.id) === String(currentLessonId))
	);

	function isCompleted(lesson: Lesson): boolean {
		return completedSlugs.has(lesson.slug) || completedSlugs.has(String(lesson.id));
	}

	function isLocked(i: number, lesson: Lesson): boolean {
		if (String(lesson.id) === String(currentLessonId)) return false;
		if (isCompleted(lesson)) return false;
		return i > currentIdx + 1;
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="sidebar-overlay"
	class:open={mobileOpen}
	onclick={onclose}
	onkeydown={(e) => e.key === 'Escape' && onclose()}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="sidebar" class:open={mobileOpen} onclick={(e) => e.stopPropagation()}>
		<div class="sidebar-header">
			<span class="sidebar-title">Course Content</span>
			<button class="sidebar-close" onclick={onclose} aria-label="Close sidebar">
				<Icon name="x" size={18} />
			</button>
		</div>
		<nav class="sidebar-nav">
			{#each lessons as lesson, i}
				{@const isCurrent = String(lesson.id) === String(currentLessonId)}
				{@const comp = isCompleted(lesson)}
				{@const locked = isLocked(i, lesson)}
				<a
					href="/learn/{offeringId}/lessons/{lesson.slug}"
					class="sidebar-item"
					class:current={isCurrent}
					class:completed={comp && !isCurrent}
					class:locked={locked}
					onclick={onclose}
				>
					<span class="item-number">{i + 1}</span>
					<span class="item-title">{lesson.title}</span>
					<span class="item-status-icon">
						{#if comp}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
						{:else if isCurrent}
							<span class="current-dot"></span>
						{:else if locked}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
						{/if}
					</span>
				</a>
			{/each}
		</nav>
	</div>
</div>

<style>
	.sidebar-overlay {
		display: none;
	}

	.sidebar {
		width: 280px;
		min-width: 280px;
		height: 100%;
		background: #0f1011;
		border-right: 1px solid rgba(255, 255, 255, 0.06);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: sticky;
		top: 0;
		max-height: 100vh;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 16px 12px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.sidebar-title {
		font-size: 13px;
		font-weight: 600;
		color: #8a8f98;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.sidebar-close {
		display: none;
		width: 28px;
		height: 28px;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		border: none;
		background: transparent;
		color: #8a8f98;
		cursor: pointer;
		transition: all 0.15s;
	}
	.sidebar-close:hover {
		background: rgba(255,255,255,0.06);
		color: #f7f8f8;
	}

	.sidebar-nav {
		flex: 1;
		overflow-y: auto;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.sidebar-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 16px;
		border-radius: 6px;
		text-decoration: none;
		font-size: 13px;
		font-weight: 510;
		color: #8a8f98;
		transition: all 0.15s ease;
		position: relative;
	}

	.sidebar-item:hover:not(.locked) {
		background: rgba(255, 255, 255, 0.04);
		color: #f7f8f8;
	}

	.sidebar-item.current {
		color: #7170ff;
		background: rgba(94, 106, 210, 0.12);
	}

	.sidebar-item.completed {
		color: #8a8f98;
	}

	.sidebar-item.locked {
		color: #62666d;
		opacity: 0.5;
		cursor: default;
		pointer-events: none;
	}

	.item-number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		flex-shrink: 0;
		background: rgba(255,255,255,0.04);
		color: inherit;
	}
	.sidebar-item.current .item-number {
		background: rgba(94, 106, 210, 0.2);
		color: #7170ff;
	}
	.sidebar-item.completed .item-number {
		background: rgba(16, 185, 129, 0.12);
		color: #10b981;
	}
	.sidebar-item.locked .item-number {
		background: transparent;
		opacity: 0.5;
	}

	.item-title {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-status-icon {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		line-height: 1;
	}
	.sidebar-item.completed .item-status-icon {
		color: #10b981;
	}
	.sidebar-item.locked .item-status-icon {
		color: #62666d;
	}

	.current-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #7170ff;
		display: block;
	}

	@media (max-width: 768px) {
		.sidebar-overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0,0,0,0.5);
			z-index: 999;
			opacity: 0;
			pointer-events: none;
			transition: opacity 0.2s ease;
		}
		.sidebar-overlay.open {
			opacity: 1;
			pointer-events: auto;
		}

		.sidebar {
			position: fixed;
			top: 0;
			left: 0;
			bottom: 0;
			z-index: 1000;
			width: 300px;
			min-width: auto;
			transform: translateX(-100%);
			transition: transform 0.25s ease;
			box-shadow: 4px 0 24px rgba(0,0,0,0.4);
		}
		.sidebar.open {
			transform: translateX(0);
		}

		.sidebar-close {
			display: flex;
		}
	}
</style>
