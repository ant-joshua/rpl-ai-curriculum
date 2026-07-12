<script lang="ts">
	import { videos, getPublishedVideos, getVideosByModule, type VideoEntry } from '$lib/stores/videos';
	import { modules } from '$lib/stores/modules';
	import { page } from '$app/stores';

	let filterModule = $state('');
	let showPlanned = $state(true);

	let filtered = $derived.by(() => {
		let list = showPlanned ? videos : getPublishedVideos();
		if (filterModule) {
			list = list.filter((v) => v.moduleSlug === filterModule);
		}
		return list;
	});

	let publishedCount = $derived(getPublishedVideos().length);
	let plannedCount = $derived(videos.length - publishedCount);

	function getModuleTitle(slug?: string): string {
		if (!slug) return 'Lainnya';
		const m = modules.find((x) => x.slug === slug);
		return m ? m.title : slug;
	}

	let selectedVideo = $state<VideoEntry | null>(null);

	function openPlayer(v: VideoEntry) {
		selectedVideo = v;
	}

	function closePlayer() {
		selectedVideo = null;
	}

	function getYoutubeId(url: string): string | null {
		const m = url.match(
			/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
		);
		return m ? m[1] : null;
	}
</script>

<svelte:head>
	<title>Video Pembelajaran — RPL AI</title>
</svelte:head>

<div class="video-page">
	<header class="page-header">
		<h1>🎬 Video Pembelajaran</h1>
		<p class="subtitle">
			Koleksi video pembelajaran RPL AI Curriculum.
			{publishedCount} published &middot; {plannedCount} planned
		</p>
	</header>

	<div class="filters">
		<select bind:value={filterModule}>
			<option value="">Semua Modul</option>
			{#each modules as mod}
				<option value={mod.slug}>{mod.title}</option>
			{/each}
		</select>

		<label class="toggle-planned">
			<input type="checkbox" bind:checked={showPlanned} />
			<span>Tampilkan planned</span>
		</label>
	</div>

	{#if filtered.length === 0}
		<div class="empty">
			<p>Tidak ada video ditemukan.</p>
		</div>
	{:else}
		<div class="video-grid">
			{#each filtered as v (v.title + (v.moduleSlug ?? ''))}
				<button
					class="video-card"
					class:published={!!v.url}
					class:planned={!v.url}
					onclick={() => v.url ? openPlayer(v) : null}
					disabled={!v.url}
				>
					<div class="thumbnail">
						{#if v.url && getYoutubeId(v.url)}
							<img
								src="https://img.youtube.com/vi/{getYoutubeId(v.url)}/mqdefault.jpg"
								alt={v.title}
								loading="lazy"
							/>
							<div class="play-badge">▶</div>
						{:else}
							<div class="placeholder-thumb">
								<span class="placeholder-icon">🎬</span>
								<span class="placeholder-label">Planned</span>
							</div>
						{/if}
					</div>
					<div class="card-body">
						<h3 class="card-title">{v.title}</h3>
						{#if v.description}
							<p class="card-desc">{v.description}</p>
						{/if}
						<div class="card-meta">
							{#if getModuleTitle(v.moduleSlug)}
								<span class="module-badge">{getModuleTitle(v.moduleSlug)}</span>
							{/if}
							{#if v.duration}
								<span class="duration">{v.duration}</span>
							{/if}
							<span class="status-badge" class:status-published={!!v.url} class:status-planned={!v.url}>
								{v.url ? 'Published' : 'Planned'}
							</span>
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Video Player Modal -->
{#if selectedVideo && selectedVideo.url}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closePlayer} role="button" tabindex="-1">
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<button class="modal-close" onclick={closePlayer}>&times;</button>
			<h2 class="modal-title">{selectedVideo.title}</h2>
			{#if selectedVideo.url && getYoutubeId(selectedVideo.url)}
				<div class="video-wrapper">
					<iframe
						src="https://www.youtube-nocookie.com/embed/{getYoutubeId(selectedVideo.url)}?autoplay=1"
						title={selectedVideo.title}
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				</div>
			{/if}
			{#if selectedVideo.description}
				<p class="modal-desc">{selectedVideo.description}</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	.video-page {
		max-width: 1100px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 24px;
	}

	.page-header h1 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 6px;
	}

	.subtitle {
		font-size: 14px;
		color: var(--text-secondary);
	}

	.filters {
		display: flex;
		gap: 12px;
		align-items: center;
		margin-bottom: 24px;
		flex-wrap: wrap;
	}

	.filters select {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 13px;
		cursor: pointer;
	}

	.toggle-planned {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--text-secondary);
		cursor: pointer;
	}

	.video-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 16px;
	}

	.video-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
		text-align: left;
		cursor: pointer;
		transition: all 0.15s ease;
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 0;
	}

	.video-card:hover:not(:disabled) {
		border-color: var(--accent);
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	.video-card:disabled {
		cursor: default;
		opacity: 0.85;
	}

	.thumbnail {
		position: relative;
		aspect-ratio: 16 / 9;
		background: var(--bg-secondary);
		overflow: hidden;
	}

	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.play-badge {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 48px;
		color: rgba(255,255,255,0.9);
		text-shadow: 0 2px 8px rgba(0,0,0,0.5);
		pointer-events: none;
	}

	.placeholder-thumb {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
	}

	.placeholder-icon {
		font-size: 36px;
	}

	.placeholder-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.card-body {
		padding: 12px 14px;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.card-title {
		font-size: 15px;
		font-weight: 600;
		line-height: 1.3;
	}

	.card-desc {
		font-size: 12px;
		color: var(--text-secondary);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
		margin-top: auto;
		padding-top: 8px;
	}

	.module-badge {
		font-size: 10px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 4px;
		background: var(--accent-dim);
		color: var(--accent);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 180px;
	}

	.duration {
		font-size: 11px;
		color: var(--text-secondary);
	}

	.status-badge {
		font-size: 10px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 4px;
		margin-left: auto;
	}

	.status-published {
		background: rgba(34, 197, 94, 0.12);
		color: #22c55e;
	}

	.status-planned {
		background: rgba(245, 158, 11, 0.12);
		color: #f59e0b;
	}

	.empty {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		z-index: 500;
		background: rgba(0,0,0,0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.modal-content {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		max-width: 800px;
		width: 100%;
		padding: 24px;
		position: relative;
	}

	.modal-close {
		position: absolute;
		top: 12px;
		right: 16px;
		background: none;
		border: none;
		font-size: 28px;
		color: var(--text-secondary);
		cursor: pointer;
		line-height: 1;
		z-index: 1;
	}

	.modal-close:hover {
		color: var(--text);
	}

	.modal-title {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 16px;
		padding-right: 32px;
	}

	.video-wrapper {
		position: relative;
		aspect-ratio: 16 / 9;
		background: #000;
		border-radius: 8px;
		overflow: hidden;
	}

	.video-wrapper iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.modal-desc {
		margin-top: 16px;
		font-size: 14px;
		color: var(--text-secondary);
		line-height: 1.5;
	}
</style>
