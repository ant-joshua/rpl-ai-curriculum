<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { modules } from '$lib/stores/modules';
	import { progress } from '$lib/stores/progress.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		progress.updateStreak();
	});

	function getTotalSessions(): number {
		return modules.reduce((sum, m) => sum + m.sessions.length, 0);
	}

	function getCompletedSessions(): number {
		let count = 0;
		for (const mod of modules) {
			for (const sess of mod.sessions) {
				if (progress.isSessionCompleted(mod.slug, sess.id)) {
					count++;
				}
			}
		}
		return count;
	}

	const ESTIMATE_PER_SESSION_MIN = 15;

	let totalSessions = $derived(getTotalSessions());
	let completedSessions = $derived(getCompletedSessions());
	let overallPercent = $derived(progress.getOverallProgress());
	let completedMinutes = $derived(completedSessions * ESTIMATE_PER_SESSION_MIN);
	let remainingMinutes = $derived((totalSessions - completedSessions) * ESTIMATE_PER_SESSION_MIN);

	// Level filter & search
	let activeLevel = $state<string | null>(null);
	let searchQuery = $state('');

	type FilterTab = { label: string; value: string | null; icon: string };
	const filterTabs: FilterTab[] = [
		{ label: 'Semua', value: null, icon: '' },
		{ label: 'Beginner', value: 'Beginner', icon: '🌱' },
		{ label: 'Intermediate', value: 'Intermediate', icon: '📐' },
		{ label: 'Advanced', value: 'Advanced', icon: '🚀' },
	];

	let filteredModules = $derived(
		modules.filter((mod) => {
			if (activeLevel !== null && mod.level !== activeLevel) return false;
			if (searchQuery && !mod.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
			return true;
		})
	);

	function formatMinutes(mins: number): string {
		if (mins < 60) return `${mins} menit`;
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		return m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
	}

	function getCompletionDate(): string {
		const streak = progress.getStreak();
		if (streak === 0 || overallPercent === 0) return 'Belum diketahui';
		const sessionsPerDay = Math.max(1, streak / 7);
		const remaining = totalSessions - completedSessions;
		const days = Math.ceil(remaining / sessionsPerDay);
		if (days <= 0) return 'Selesai! 🎉';
		return `~${days} hari lagi (dengan kecepatan saat ini)`;
	}
</script>

<div class="progress-page">
	<header class="page-header">
		<h1>📈 Progres Belajar</h1>
		<p class="subtitle">Pantau perjalanan belajar RPL AI-mu</p>
	</header>

	<!-- Overall stats -->
	<section class="stats-grid">
		<div class="stat-card stat-primary">
			<span class="stat-value">{overallPercent}%</span>
			<span class="stat-label">Progres Keseluruhan</span>
			<ProgressBar value={overallPercent} />
		</div>
		<div class="stat-card">
			<span class="stat-value">{completedSessions}/{totalSessions}</span>
			<span class="stat-label">Sesi Selesai</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{progress.completedCount}/{progress.totalModules}</span>
			<span class="stat-label">Modul Selesai</span>
		</div>
	</section>

	<!-- Time & streak -->
	<section class="insight-grid">
		<div class="insight-card">
			<span class="insight-icon">⏱️</span>
			<div>
				<span class="insight-value">{formatMinutes(completedMinutes)}</span>
				<span class="insight-label">Waktu belajar</span>
			</div>
		</div>
		<div class="insight-card">
			<span class="insight-icon">🎯</span>
			<div>
				<span class="insight-value">{formatMinutes(remainingMinutes)}</span>
				<span class="insight-label">Sisa waktu estimasi</span>
			</div>
		</div>
		<div class="insight-card">
			<span class="insight-icon">🔥</span>
			<div>
				<span class="insight-value">{progress.getStreak()} hari</span>
				<span class="insight-label">Streak belajar</span>
			</div>
		</div>
		<div class="insight-card">
			<span class="insight-icon">📅</span>
			<div>
				<span class="insight-value">{getCompletionDate()}</span>
				<span class="insight-label">Estimasi selesai</span>
			</div>
		</div>
	</section>

	<!-- All modules detail -->
	<section class="module-list">
		<h2>Detail Modul</h2>
		<div class="module-controls">
			<!-- Level filter tabs -->
			<div class="filter-tabs">
				{#each filterTabs as tab}
					<button
						class="filter-tab"
						class:active={activeLevel === tab.value}
						onclick={() => activeLevel = tab.value}
					>
						{tab.icon}{tab.label}
					</button>
				{/each}
			</div>
			<!-- Search input -->
			<div class="search-wrapper">
				<input
					type="text"
					class="search-input"
					placeholder="Cari modul..."
					bind:value={searchQuery}
				/>
				{#if searchQuery}
					<button class="search-clear" onclick={() => searchQuery = ''}>×</button>
				{/if}
			</div>
		</div>
		{#each filteredModules as mod}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="module-row" onclick={() => goto('/module/' + mod.slug)} role="button" tabindex="0">
				<div class="module-row-info">
					<span class="module-row-title">{mod.title}</span>
					<span class="module-row-sessions">
						{progress.getCompletedSessions(mod.slug).length}/{mod.sessions.length} sesi
					</span>
				</div>
				<div class="module-row-progress">
					<ProgressBar value={progress.getModuleProgress(mod.slug)} />
					<span class="module-row-pct">{progress.getModuleProgress(mod.slug)}%</span>
				</div>
			</div>
		{/each}
	</section>
</div>

<style>
	.progress-page {
		max-width: 960px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 28px;
	}

	.page-header h1 {
		font-size: 26px;
		font-weight: 700;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin-top: 4px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		gap: 16px;
		margin-bottom: 20px;
	}

	.stat-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
	}

	.stat-primary {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.stat-value {
		display: block;
		font-size: 28px;
		font-weight: 700;
		color: var(--text);
	}

	.stat-label {
		display: block;
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
		margin-bottom: 2px;
	}

	.insight-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		margin-bottom: 28px;
	}

	.insight-card {
		display: flex;
		align-items: center;
		gap: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
	}

	.insight-icon {
		font-size: 24px;
	}

	.insight-value {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
	}

	.insight-label {
		display: block;
		font-size: 11px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.module-list h2 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 12px;
	}

	.module-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}

	.filter-tabs {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.filter-tab {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 6px 16px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.filter-tab:hover {
		border-color: var(--accent);
		color: var(--text);
	}

	.filter-tab.active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--accent-text, #fff);
	}

	.search-wrapper {
		position: relative;
		flex: 1;
		min-width: 180px;
	}

	.search-input {
		width: 100%;
		padding: 8px 32px 8px 12px;
		font-size: 13px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		color: var(--text);
		outline: none;
		transition: border-color 0.15s ease;
		box-sizing: border-box;
	}

	.search-input:focus {
		border-color: var(--accent);
	}

	.search-input::placeholder {
		color: var(--text-secondary);
	}

	.search-clear {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		font-size: 18px;
		line-height: 1;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 2px 6px;
		border-radius: 4px;
		transition: color 0.15s ease;
	}

	.search-clear:hover {
		color: var(--text);
	}

	.module-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		margin-bottom: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.module-row:hover {
		border-color: var(--accent);
	}

	.module-row-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		flex: 1;
	}

	.module-row-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.module-row-sessions {
		font-size: 11px;
		color: var(--text-secondary);
	}

	.module-row-progress {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 200px;
	}

	.module-row-pct {
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
		min-width: 36px;
		text-align: right;
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.insight-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.module-row-progress {
			width: 120px;
		}
	}
</style>
