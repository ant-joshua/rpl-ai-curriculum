<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { page } from '$app/stores';
	import { Badge, Card, Button, EmptyState, PageHeader } from '$lib/components/ui';

	let { data } = $props();
	let bookmarks = $derived(data.bookmarks ?? []);

	function offeringLink(bookmark: any): string {
		return `/learn/${bookmark.offering_id}/lessons/${bookmark.lesson_slug}`;
	}

	function durationBadge(minutes: number): string {
		if (minutes < 60) return `${minutes} min`;
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		return m > 0 ? `${h}j ${m}m` : `${h}j`;
	}
</script>

<svelte:head>
	<title>My Bookmarks — RPL AI Curriculum</title>
</svelte:head>

<div class="bookmarks-page">
	<PageHeader title="My Bookmarks" subtitle="{bookmarks.length} bookmarked lesson{bookmarks.length !== 1 ? 's' : ''}" />

	{#if bookmarks.length === 0}
		<EmptyState
			icon="🔖"
			title="No bookmarks yet"
			description="Bookmark lessons while learning to find them easily later."
		>
			<Button href="/learn">Browse courses</Button>
		</EmptyState>
	{:else}
		<div class="bookmarks-list">
			{#each bookmarks as bookmark (bookmark.id)}
				<a href={offeringLink(bookmark)} class="bookmark-card">
					<div class="card-icon">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
					</div>
					<div class="card-body">
						<h3 class="card-title">{bookmark.lesson_title}</h3>
						<div class="card-meta">
							<span class="course-label">{bookmark.course_title}</span>
							<span class="sep">&middot;</span>
							<span class="offering-label">{bookmark.offering_name}</span>
							{#if bookmark.duration_minutes}
								<span class="sep">&middot;</span>
								<Badge variant="default">{durationBadge(bookmark.duration_minutes)}</Badge>
							{/if}
						</div>
					</div>
					<div class="card-arrow">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.bookmarks-page {
		max-width: 720px;
		margin: 0 auto;
		padding: 32px 16px;
	}

	.page-header {
		margin-bottom: 28px;
	}

	.page-header h1 {
		font-size: 26px;
		font-weight: 590;
		color: var(--text);
		margin: 0 0 4px;
		font-feature-settings: 'cv01', 'ss03';
		letter-spacing: -0.288px;
	}

	.text-secondary {
		color: var(--text-tertiary);
		font-size: 14px;
		margin: 0;
		font-feature-settings: 'cv01', 'ss03';
	}

	/* Bookmarks list */
	.bookmarks-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.bookmark-card {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 16px;
		background: rgba(0,0,0,0.02);
		border: 1px solid rgba(0,0,0,0.06);
		border-radius: 8px;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.bookmark-card:hover {
		border-color: rgba(79,70,229,0.25);
		background: rgba(0,0,0,0.04);
	}

	.bookmark-card:hover .card-arrow {
		color: var(--accent);
		transform: translateX(2px);
	}

	.card-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		justify-content: center;
		background: rgba(245, 158, 11, 0.1);
		border-radius: 8px;
	}

	.card-body {
		flex: 1;
		min-width: 0;
	}

	.card-title {
		font-size: 15px;
		font-weight: 510;
		color: var(--text);
		margin: 0 0 4px;
		line-height: 1.3;
		font-feature-settings: 'cv01', 'ss03';
	}

	.card-meta {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-wrap: wrap;
		font-size: 12px;
		color: var(--text-tertiary);
		font-feature-settings: 'cv01', 'ss03';
	}

	.card-meta .sep {
		opacity: 0.4;
	}

	.card-arrow {
		flex-shrink: 0;
		color: var(--text-tertiary);
		transition: all 0.15s ease;
	}

	@media (max-width: 640px) {
		.bookmarks-page {
			padding: 20px 12px;
		}

		.page-header h1 {
			font-size: 22px;
		}

		.bookmark-card {
			padding: 12px;
		}

		.card-title {
			font-size: 14px;
		}
	}
</style>
