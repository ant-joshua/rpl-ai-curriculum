<script lang="ts">
	import { browser } from '$app/environment';
	import { adaptive } from '$lib/stores/adaptive.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();

	let exercisesData = $state<{ exercises: any[] } | null>(null);
	let loading = $state(true);

	let searchQuery = $state('');
	let filterDifficulty = $state('');
	let filterType = $state('');

	$effect(() => {
		async function load() {
			try {
				const res = await fetch('/content/exercises.json');
				const json = await res.json();
				exercisesData = json;
			} catch (e) {
				console.error('Failed to load exercises', e);
			} finally {
				loading = false;
			}
		}
		load();
	});

	onMount(() => {
		adaptive.refresh();
	});

	let filtered = $derived.by(() => {
		if (!exercisesData) return [];
		let list = exercisesData.exercises;
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			list = list.filter(e =>
				e.title.toLowerCase().includes(q) ||
				e.description.toLowerCase().includes(q) ||
				(e.moduleSlug || '').toLowerCase().includes(q)
			);
		}
		if (filterDifficulty) {
			list = list.filter(e => e.difficulty === filterDifficulty);
		}
		if (filterType) {
			list = list.filter(e => e.type === filterType);
		}
		return list;
	});

	let difficulties = $derived.by(() => {
		if (!exercisesData) return [];
		const set = new Set<string>();
		for (const e of exercisesData.exercises) set.add(e.difficulty);
		return [...set].sort();
	});

	let types = $derived.by(() => {
		if (!exercisesData) return [];
		const set = new Set<string>();
		for (const e of exercisesData.exercises) set.add(e.type);
		return [...set].sort();
	});

	const difficultyColors: Record<string, string> = {
		Beginner: 'var(--difficulty-beginner, #10b981)',
		Intermediate: 'var(--difficulty-intermediate, #f59e0b)',
		Advanced: 'var(--difficulty-advanced, #ef4444)',
	};

	const typeLabels: Record<string, string> = {
		js: 'JavaScript',
		html: 'HTML',
		bash: 'Bash',
		python: 'Python',
	};
</script>

<svelte:head>
	<title>🏋️ Latihan Soal — RPL AI Curriculum</title>
</svelte:head>

<div class="exercises-page">
	<header class="page-header">
		<h1>🏋️ Latihan Soal</h1>
		<p class="page-desc">Latihan interaktif untuk setiap modul — tambah pemahaman sebelum lanjut.</p>
	</header>

	{#if loading}
		<div class="loading">Memuat latihan...</div>
	{:else if !exercisesData}
		<div class="error">Gagal memuat data latihan.</div>
	{:else}
		<div class="controls">
			<div class="search-box">
				<span class="search-icon">🔍</span>
				<input
					type="text"
					placeholder="Cari latihan..."
					bind:value={searchQuery}
				/>
			</div>
			<select bind:value={filterDifficulty}>
				<option value="">Semua Level</option>
				{#each difficulties as d}
					<option value={d}>{d}</option>
				{/each}
			</select>
			<select bind:value={filterType}>
				<option value="">Semua Tipe</option>
				{#each types as t}
					<option value={t}>{typeLabels[t] || t}</option>
				{/each}
			</select>
			<span class="count">{filtered.length} dari {exercisesData.exercises.length} latihan</span>
		</div>

		<!-- Adaptive difficulty recommendation -->
		<div class="adaptive-recommendation">
			<h2>🎯 Rekomendasi untukmu (level {adaptive.difficulty})</h2>
			<p class="rec-desc">
				{adaptive.level === 'beginner' ? 'Mulai dengan latihan dasar untuk membangun fondasi.' : ''}
				{adaptive.level === 'intermediate' ? 'Kamu sudah siap untuk latihan tingkat menengah. Terus tingkatkan!' : ''}
				{adaptive.level === 'advanced' ? 'Kamu sudah mahir! Coba latihan tingkat lanjut.' : ''}
			</p>
			<div class="grid">
				{#each filtered.filter(e => e.difficulty?.toLowerCase() === adaptive.difficulty).slice(0, 3) as exercise}
					<a href="/exercises/{exercise.slug}" class="card">
						<div class="card-header">
							<span class="badge rec-badge">🎯 Rekomendasi</span>
							<span
								class="badge difficulty"
								style="background: {difficultyColors[exercise.difficulty] || '#888'}22; color: {difficultyColors[exercise.difficulty] || '#888'}; border-color: {difficultyColors[exercise.difficulty] || '#888'}44"
							>
								{exercise.difficulty}
							</span>
						</div>
						<h3 class="card-title">{exercise.title}</h3>
						<p class="card-desc">{exercise.description || 'Tidak ada deskripsi.'}</p>
						{#if exercise.moduleSlug}
							<span class="module-context">📦 {exercise.moduleSlug}</span>
						{/if}
					</a>
				{/each}
			</div>
			{#if filtered.filter(e => e.difficulty?.toLowerCase() === adaptive.difficulty).length === 0}
				<p class="empty-rec">Tidak ada latihan untuk level ini. Coba filter lain.</p>
			{/if}
		</div>

		<hr class="section-sep" />

		{#if filtered.length === 0}
			<div class="empty">Tidak ada latihan yang cocok dengan filter.</div>
		{:else}
			<div class="grid">
				{#each filtered as exercise}
					<a href="/exercises/{exercise.slug}" class="card">
						<div class="card-header">
							<span
								class="badge difficulty"
								style="background: {difficultyColors[exercise.difficulty] || '#888'}22; color: {difficultyColors[exercise.difficulty] || '#888'}; border-color: {difficultyColors[exercise.difficulty] || '#888'}44"
							>
								{exercise.difficulty}
							</span>
							<span class="badge type">
								{typeLabels[exercise.type] || exercise.type}
							</span>
						</div>
						<h3 class="card-title">{exercise.title}</h3>
						<p class="card-desc">{exercise.description || 'Tidak ada deskripsi.'}</p>
						{#if exercise.moduleSlug}
							<span class="module-context">📦 {exercise.moduleSlug}</span>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.exercises-page {
		max-width: 1100px;
		margin: 0 auto;
	}

	.page-header h1 {
		font-size: 28px;
		font-weight: 700;
		margin-bottom: 8px;
	}

	.page-desc {
		color: var(--text-secondary);
		margin-bottom: 24px;
	}

	.loading, .error, .empty {
		text-align: center;
		padding: 48px 24px;
		color: var(--text-secondary);
		font-size: 16px;
	}

	.controls {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 24px;
	}

	.search-box {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-width: 200px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 8px 12px;
	}

	.search-box input {
		flex: 1;
		border: none;
		outline: none;
		background: transparent;
		color: var(--text);
		font-size: 14px;
	}

	.search-icon {
		font-size: 16px;
		opacity: 0.6;
	}

	.controls select {
		padding: 8px 12px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-size: 14px;
		cursor: pointer;
	}

	.count {
		font-size: 13px;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.adaptive-recommendation {
		margin-bottom: 24px;
	}
	.adaptive-recommendation h2 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 4px;
	}
	.rec-desc {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 12px;
	}
	.rec-badge {
		background: var(--accent) !important;
		color: #fff !important;
	}
	.section-sep {
		border: none;
		border-top: 1px solid var(--border);
		margin: 24px 0;
	}
	.empty-rec {
		font-size: 13px;
		color: var(--text-secondary);
		padding: 20px 0;
		text-align: center;
	}
	@media (max-width: 768px) {
		.adaptive-recommendation h2 { font-size: 16px; }
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 16px;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-decoration: none !important;
		color: inherit;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	.card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0,0,0,0.12);
	}

	.card-header {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.badge {
		font-size: 11px;
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 20px;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.badge.difficulty {
		border: 1px solid;
	}

	.badge.type {
		background: var(--accent-dim);
		color: var(--accent);
	}

	.card-title {
		font-size: 15px;
		font-weight: 600;
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

	.module-context {
		font-size: 12px;
		color: var(--text-secondary);
		opacity: 0.7;
	}

	@media (max-width: 768px) {
		.controls {
			flex-direction: column;
			align-items: stretch;
		}
		.search-box {
			min-width: unset;
		}
		.grid {
			grid-template-columns: 1fr !important;
		}
		.card-title {
			font-size: 13px;
		}
		.card-desc {
			font-size: 12px;
		}
	}
</style>
