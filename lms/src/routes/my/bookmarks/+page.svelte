<script lang="ts">
	import { page } from '$app/stores';

	let { data } = $props();
	let bookmarks = $derived(data.bookmarks ?? []);

	function offeringLink(bookmark: any): string {
		return `/learn/${bookmark.offering_id}/lessons/${bookmark.lesson_slug}`;
	}
</script>

<svelte:head>
	<title>My Bookmarks — RPL AI Curriculum</title>
</svelte:head>

<div class="bookmarks-page">
	<header class="page-header">
		<h1>My Bookmarks</h1>
		<p class="text-secondary">{bookmarks.length} bookmarked lesson{bookmarks.length !== 1 ? 's' : ''}</p>
	</header>

	{#if bookmarks.length === 0}
		<div class="empty-state">
			<div class="empty-icon">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
			</div>
			<h3>No bookmarks yet</h3>
			<p class="text-secondary">Bookmark lessons while learning to find them easily later.</p>
			<a href="/learn" class="browse-link">Browse courses</a>
		</div>
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
								<span class="duration-label">{bookmark.duration_minutes} min</span>
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
		font-weight: 700;
		color: var(--text);
		margin: 0 0 4px;
	}

	.text-secondary {
		color: var(--text-secondary);
		font-size: 14px;
		margin: 0;
	}

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.empty-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border-radius: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text-secondary);
		margin-bottom: 16px;
	}

	.empty-state h3 {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 6px;
	}

	.empty-state .text-secondary {
		margin-bottom: 20px;
	}

	.browse-link {
		display: inline-block;
		padding: 10px 24px;
		font-size: 14px;
		font-weight: 600;
		color: #fff;
		background: var(--accent);
		border-radius: 10px;
		text-decoration: none;
		transition: background 0.15s;
	}

	.browse-link:hover {
		background: var(--accent-secondary);
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
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.bookmark-card:hover {
		border-color: var(--accent);
		background: var(--surface-hover);
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
		border-radius: 10px;
	}

	.card-body {
		flex: 1;
		min-width: 0;
	}

	.card-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 4px;
		line-height: 1.3;
	}

	.card-meta {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-wrap: wrap;
		font-size: 12px;
		color: var(--text-secondary);
	}

	.card-meta .sep {
		opacity: 0.4;
	}

	.card-arrow {
		flex-shrink: 0;
		color: var(--text-secondary);
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
