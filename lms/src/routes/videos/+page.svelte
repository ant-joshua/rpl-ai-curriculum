<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { modules, type Module } from '$lib/stores/modules';
	import { onMount } from 'svelte';

	let videosJson = $state<Record<string, {
		title: string;
		playlistUrl: string | null;
		videos: { id: string; title: string; duration?: string }[];
	}>>({});
	let loading = $state(true);
	let errorMsg = $state('');

	let filterModule = $state('');
	let filterLevel = $state('');
	let searchQuery = $state('');

	onMount(async () => {
		try {
			const res = await fetch('/content/videos.json');
			if (!res.ok) throw new Error('Failed to load');
			const json = await res.json();
			videosJson = json.modules || {};
		} catch {
			errorMsg = t('videos.error');
		}
		loading = false;
	});

	// Derive module-level mapping for quick lookup
	let moduleLevelMap = $derived.by(() => {
		const map: Record<string, string> = {};
		for (const m of modules) {
			map[m.slug] = m.level;
		}
		return map;
	});

	let filteredModules = $derived.by(() => {
		let entries = Object.entries(videosJson);
		if (filterModule) {
			entries = entries.filter(([slug]) => slug === filterModule);
		}
		if (filterLevel) {
			entries = entries.filter(([slug]) => moduleLevelMap[slug] === filterLevel);
		}
		return entries;
	});

	// Flatten all videos for the list view, applying search + filters
	type FlatVideo = {
		moduleSlug: string;
		moduleTitle: string;
		level: string;
		id: string;
		title: string;
		duration?: string;
		playlistUrl?: string | null;
	};
	let flatVideos = $derived.by(() => {
		const result: FlatVideo[] = [];
		for (const [slug, mv] of filteredModules) {
			for (const v of mv.videos) {
				if (searchQuery) {
					const q = searchQuery.toLowerCase();
					if (!v.title.toLowerCase().includes(q)) continue;
				}
				result.push({
					moduleSlug: slug,
					moduleTitle: mv.title,
					level: moduleLevelMap[slug] || '',
					id: v.id,
					title: v.title,
					duration: v.duration,
					playlistUrl: mv.playlistUrl,
				});
			}
		}
		return result;
	});

	let selectedVideo = $state<FlatVideo | null>(null);

	function openPlayer(v: FlatVideo) {
		selectedVideo = v;
	}

	function closePlayer() {
		selectedVideo = null;
	}

	let totalModules = $derived(Object.keys(videosJson).length);
	let totalVideos = $derived(
		Object.values(videosJson).reduce((s, m) => s + m.videos.length, 0)
	);
</script>

<svelte:head>
	<title>{t('videos.page_title')} — RPL AI</title>
</svelte:head>

<div class="video-page">
	<header class="page-header">
		<h1>{t('videos.page_title')}</h1>
		<p class="subtitle">
			{t('videos.subtitle', { modules: totalModules, videos: totalVideos })}
		</p>
	</header>

	<div class="filters">
		<select bind:value={filterModule}>
			<option value="">{t('videos.filter_module')}</option>
			{#each modules as mod}
				<option value={mod.slug}>{mod.title}</option>
			{/each}
		</select>

		<select bind:value={filterLevel}>
			<option value="">{t('videos.filter_level')}</option>
			<option value="Beginner">{t('videos.level_beginner')}</option>
			<option value="Intermediate">{t('videos.level_intermediate')}</option>
			<option value="Advanced">{t('videos.level_advanced')}</option>
		</select>

		<input
			type="search"
			placeholder="{t('videos.search')}"
			bind:value={searchQuery}
			class="search-input"
		/>
	</div>

	{#if loading}
		<div class="loading">
			<p>{t('videos.loading')}</p>
		</div>
	{:else if errorMsg}
		<div class="empty">
			<p>{errorMsg}</p>
		</div>
	{:else if flatVideos.length === 0}
		<div class="empty">
			<p>{t('videos.empty')}</p>
		</div>
	{:else}
		<div class="video-grid">
			{#each flatVideos as v (v.moduleSlug + v.id)}
				<button
					class="video-card"
					onclick={() => openPlayer(v)}
				>
					<div class="thumbnail">
						<img
							src="https://img.youtube.com/vi/{v.id}/mqdefault.jpg"
							alt={v.title}
							loading="lazy"
						/>
						<div class="play-badge">▶</div>
					</div>
					<div class="card-body">
						<h3 class="card-title">{v.title}</h3>
						<div class="card-meta">
							<span class="module-badge">{v.moduleTitle}</span>
							{#if v.level}
								<span
									class="level-badge"
									class:level-beginner={v.level === 'Beginner'}
									class:level-intermediate={v.level === 'Intermediate'}
									class:level-advanced={v.level === 'Advanced'}
								>
									{v.level}
								</span>
							{/if}
							{#if v.duration}
								<span class="duration">{v.duration}</span>
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Video Player Modal -->
{#if selectedVideo}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closePlayer} role="button" tabindex="-1">
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<button class="modal-close" onclick={closePlayer}>&times;</button>
			<h2 class="modal-title">{selectedVideo.title}</h2>
			<div class="module-context">
				<span class="context-badge">{selectedVideo.moduleTitle}</span>
				{#if selectedVideo.level}
					<span class="context-level">{selectedVideo.level}</span>
				{/if}
				{#if selectedVideo.duration}
					<span class="context-duration">{selectedVideo.duration}</span>
				{/if}
			</div>
			<div class="video-wrapper">
				<iframe
					src="https://www.youtube-nocookie.com/embed/{selectedVideo.id}?autoplay=1"
					title={selectedVideo.title}
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			</div>
			{#if selectedVideo.playlistUrl}
				<a href={selectedVideo.playlistUrl} target="_blank" class="playlist-link">
					{t('videos.playlist_link')}
				</a>
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

	.filters select,
	.search-input {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 13px;
		cursor: pointer;
	}

	.search-input {
		flex: 1;
		min-width: 180px;
		cursor: text;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.loading {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
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

	.video-card:hover {
		border-color: var(--accent);
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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

	.level-badge {
		font-size: 10px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 4px;
	}

	.level-beginner {
		background: rgba(59, 130, 246, 0.12);
		color: #3b82f6;
	}

	.level-intermediate {
		background: rgba(234, 179, 8, 0.12);
		color: #eab308;
	}

	.level-advanced {
		background: rgba(168, 85, 247, 0.12);
		color: #a855f7;
	}

	.duration {
		font-size: 11px;
		color: var(--text-secondary);
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
		margin-bottom: 8px;
		padding-right: 32px;
	}

	.module-context {
		display: flex;
		gap: 8px;
		align-items: center;
		margin-bottom: 16px;
		font-size: 12px;
	}

	.context-badge {
		background: var(--accent-dim);
		color: var(--accent);
		padding: 2px 8px;
		border-radius: 4px;
		font-weight: 600;
	}

	.context-level {
		padding: 2px 8px;
		border-radius: 4px;
		background: var(--bg-secondary);
		color: var(--text-secondary);
	}

	.context-duration {
		color: var(--text-secondary);
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

	.playlist-link {
		display: inline-block;
		margin-top: 16px;
		padding: 8px 16px;
		border: 1px solid var(--accent);
		border-radius: 8px;
		color: var(--accent);
		font-size: 13px;
		font-weight: 600;
		text-decoration: none !important;
		transition: all 0.15s ease;
	}

	.playlist-link:hover {
		background: var(--accent-dim);
	}
</style>
