<script lang="ts">
	import ProgressBar from './ProgressBar.svelte';
	import { bookmarks } from '$lib/stores/bookmarks.svelte';

	let {
		slug = '',
		title = '',
		description = '',
		progress = 0,
		index = 0,
		level = '',
		videoCount = 0,
		onclick
	}: {
		slug?: string;
		title?: string;
		description?: string;
		progress?: number;
		index?: number;
		level?: string;
		videoCount?: number;
		onclick?: () => void;
	} = $props();

	let isNew = $derived(index < 3);

	let levelBadge = $derived(
		level === 'Beginner' ? { text: '🔵 Beginner', color: 'var(--level-beginner, #3b82f6)' } :
		level === 'Intermediate' ? { text: '🟡 Intermediate', color: 'var(--level-intermediate, #eab308)' } :
		level === 'Advanced' ? { text: '🟣 Advanced', color: 'var(--level-advanced, #a855f7)' } :
		null
	);

	function handleBookmarkToggle(e: MouseEvent) {
		e.stopPropagation();
		bookmarks.toggle(slug);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="module-card" onclick={onclick} role="button" tabindex={0}>
	<div class="card-header">
		<div class="card-tags">
			{#if levelBadge}
				<span class="level-badge" style="background: {levelBadge.color}22; color: {levelBadge.color}">{levelBadge.text}</span>
			{/if}
			{#if isNew}
				<span class="new-badge">🆕 NEW</span>
			{/if}
		</div>
		<button
			class="bookmark-btn"
			onclick={handleBookmarkToggle}
			aria-label={bookmarks.isBookmarked(slug) ? 'Hapus bookmark' : 'Tambah bookmark'}
		>
			{bookmarks.isBookmarked(slug) ? '⭐' : '☆'}
		</button>
	</div>
	<h3 class="card-title">{title}</h3>
	<p class="card-desc">{description}</p>
	{#if videoCount > 0}
		<div class="video-badge">🎬 {videoCount} Video</div>
	{/if}
	<div class="card-footer">
		<ProgressBar value={progress} />
		<a href="/module/{slug}" class="card-link" onclick={(e) => e.stopPropagation()}>
			Baca &rarr;
		</a>
	</div>
</div>

<style>
	.module-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.module-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0,0,0,0.15);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.bookmark-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 16px;
		padding: 2px;
		line-height: 1;
		transition: transform 0.15s ease;
	}

	.bookmark-btn:hover {
		transform: scale(1.2);
	}

	.card-tags {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
		align-items: center;
	}

	.level-badge {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 20px;
		line-height: 1.4;
	}

	.new-badge {
		font-size: 0.7rem;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 20px;
		line-height: 1.4;
		background: var(--accent-dim, #1e3a5f);
		color: var(--accent, #60a5fa);
	}

	.card-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--text);
		line-height: 1.3;
	}

	.card-desc {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.video-badge {
		font-size: 11px;
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 20px;
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		display: inline-block;
		align-self: flex-start;
		line-height: 1.3;
	}

	.card-footer {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: auto;
	}

	.card-link {
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
		align-self: flex-end;
		text-decoration: none !important;
	}

	.card-link:hover {
		text-decoration: underline !important;
	}
</style>
