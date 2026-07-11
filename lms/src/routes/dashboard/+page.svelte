<script lang="ts">
	import { user } from '$lib/stores/user.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { modules, type Module } from '$lib/stores/modules';
	import ModuleCard from '$lib/components/ModuleCard.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let lastReadSlug = $state<string | null>(null);

	onMount(() => {
		progress.updateStreak();
		lastReadSlug = progress.getLastRead();
		// No login redirect — dashboard works buat lihat modul
	});

	let lastReadModule = $derived(
		lastReadSlug ? modules.find(m => m.slug === lastReadSlug) : null
	);

	let overallProgress = $derived(progress.getOverallProgress());

	// Level filter
	type Level = 'Beginner' | 'Intermediate' | 'Advanced';
	let activeLevel = $state<string | null>(null);

	const levelFilters: { label: string; value: string | null }[] = [
		{ label: 'Semua', value: null },
		{ label: '🌱 Beginner', value: 'Beginner' },
		{ label: '📐 Intermediate', value: 'Intermediate' },
		{ label: '🚀 Advanced', value: 'Advanced' },
	];

	let filteredModules = $derived(
		activeLevel === null ? modules : modules.filter(m => m.level === activeLevel)
	);
</script>

<div class="dashboard">
	<header class="dashboard-header">
		<div>
			<h1>Selamat datang, {user.isLoggedIn ? user.username : 'Teman'}! 👋</h1>
			<p class="subtitle">Lanjutkan perjalanan belajar RPL AI-mu</p>
		</div>
		<div class="streak-badge">
			<span class="streak-fire">🔥</span>
			<span>{progress.getStreak()} hari berturut-turut</span>
		</div>
	</header>

	<!-- Progress overview -->
	<section class="overview-cards">
		<div class="overview-card">
			<span class="overview-icon">📦</span>
			<div>
				<span class="overview-value">{progress.completedCount}/{progress.totalModules}</span>
				<span class="overview-label">Modul selesai</span>
			</div>
		</div>
		<div class="overview-card">
			<span class="overview-icon">📊</span>
			<div>
				<span class="overview-value">{overallProgress}%</span>
				<span class="overview-label">Progres keseluruhan</span>
			</div>
		</div>
		<div class="overview-card">
			<span class="overview-icon">🔥</span>
			<div>
				<span class="overview-value">{progress.getStreak()}</span>
				<span class="overview-label">Streak</span>
			</div>
		</div>
	</section>

	<!-- Continue reading -->
	{#if lastReadModule}
		<section class="continue-reading">
			<h2>Lanjutkan Belajar</h2>
			<a href="/module/{lastReadModule.slug}" class="continue-card">
				<div class="continue-info">
					<span class="continue-badge">Terakhir dibaca</span>
					<h3>{lastReadModule.title}</h3>
					<p>{lastReadModule.description}</p>
				</div>
				<span class="continue-arrow">&rarr;</span>
			</a>
		</section>
	{/if}

	<!-- Level filter tabs -->
	<section class="level-filters">
		{#each levelFilters as filter}
			<button
				class="filter-btn"
				class:active={activeLevel === filter.value}
				onclick={() => activeLevel = filter.value}
			>
				{filter.label}
			</button>
		{/each}
	</section>

	<!-- Login prompt + Module grid -->
	<section class="module-section">
		<div class="module-header">
			<h2>Semua Modul ({filteredModules.length})</h2>
			{#if !user.isLoggedIn}
				<a href="/login" class="login-prompt">Login untuk sync progress →</a>
			{/if}
		</div>
		<div class="module-grid">
			{#each filteredModules as mod}
				<ModuleCard
					slug={mod.slug}
					title={mod.title}
					description={mod.description}
					progress={progress.getModuleProgress(mod.slug)}
					onclick={() => goto('/module/' + mod.slug)}
				/>
			{/each}
		</div>
	</section>
</div>

<style>
	.dashboard {
		max-width: 960px;
		margin: 0 auto;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 28px;
		gap: 16px;
	}

	h1 {
		font-size: 26px;
		font-weight: 700;
		margin-bottom: 4px;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 14px;
	}

	.streak-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 20px;
		padding: 8px 16px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
	}

	.streak-fire {
		font-size: 18px;
	}

	.overview-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin-bottom: 28px;
	}

	.overview-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.overview-icon {
		font-size: 28px;
	}

	.overview-value {
		display: block;
		font-size: 24px;
		font-weight: 700;
		color: var(--text);
		line-height: 1.2;
	}

	.overview-label {
		display: block;
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.continue-reading {
		margin-bottom: 28px;
	}

	.continue-reading h2 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 12px;
	}

	.continue-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		text-decoration: none !important;
		transition: all 0.2s ease;
	}

	.continue-card:hover {
		border-color: var(--accent);
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(0,0,0,0.1);
	}

	.continue-info h3 {
		font-size: 16px;
		font-weight: 600;
		color: var(--text);
		margin-bottom: 4px;
	}

	.continue-info p {
		font-size: 13px;
		color: var(--text-secondary);
	}

	.continue-badge {
		display: inline-block;
		font-size: 11px;
		font-weight: 600;
		color: var(--accent);
		background: var(--accent-dim);
		padding: 2px 10px;
		border-radius: 20px;
		margin-bottom: 6px;
	}

	.continue-arrow {
		font-size: 20px;
		color: var(--accent);
	}

	/* Level filter tabs */
	.level-filters {
		display: flex;
		gap: 8px;
		margin-bottom: 24px;
		flex-wrap: wrap;
	}

	.filter-btn {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 20px;
		padding: 8px 18px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.filter-btn:hover {
		border-color: var(--accent);
		color: var(--text);
	}

	.filter-btn.active {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}

	.module-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.module-header h2 {
		font-size: 18px;
		font-weight: 600;
		margin: 0;
	}

	.login-prompt {
		font-size: 13px;
		color: var(--accent);
		font-weight: 500;
		text-decoration: none !important;
	}

	.login-prompt:hover {
		text-decoration: underline !important;
	}

	.module-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
	}

	@media (max-width: 768px) {
		.dashboard-header {
			flex-direction: column;
		}

		.overview-cards {
			grid-template-columns: 1fr;
		}

		.module-grid {
			grid-template-columns: 1fr;
		}

		h1 {
			font-size: 22px;
		}
	}
</style>
