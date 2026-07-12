<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { modules } from '$lib/stores/modules';
	import { progress } from '$lib/stores/progress.svelte';
	import { stats } from '$lib/stores/stats.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		progress.updateStreak();
	});

	const ESTIMATE_PER_SESSION_MIN = 15;
	const ESTIMATED_WORDS_PER_SESSION = 3000; // ~15 min at 200 wpm
	const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

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

	let totalSessions = $derived(getTotalSessions());
	let completedSessions = $derived(getCompletedSessions());
	let overallPercent = $derived(progress.getOverallProgress());
	let completedMinutes = $derived(completedSessions * ESTIMATE_PER_SESSION_MIN);
	let remainingMinutes = $derived((totalSessions - completedSessions) * ESTIMATE_PER_SESSION_MIN);
	let totalWordsUnread = $derived((totalSessions - completedSessions) * ESTIMATED_WORDS_PER_SESSION);
	let estimatedTimeRemainingMin = $derived(Math.round(totalWordsUnread / 200));

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

	// Sort
	type SortKey = 'title' | 'level' | 'progress';
	let sortKey = $state<SortKey>('progress');
	let sortDir = $state<'asc' | 'desc'>('desc');

	function toggleSort(key: SortKey) {
		if (sortKey === key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDir = key === 'progress' ? 'desc' : 'asc';
		}
	}

	function getSortIndicator(key: SortKey): string {
		if (sortKey !== key) return '';
		return sortDir === 'asc' ? ' ▲' : ' ▼';
	}

	let sortedModules = $derived(
		[...filteredModules].sort((a, b) => {
			let cmp = 0;
			if (sortKey === 'title') cmp = a.title.localeCompare(b.title);
			else if (sortKey === 'level') cmp = a.level.localeCompare(b.level);
			else if (sortKey === 'progress') cmp = progress.getModuleProgress(a.slug) - progress.getModuleProgress(b.slug);
			return sortDir === 'asc' ? cmp : -cmp;
		})
	);

	// Weekly chart data
	let weeklyData = $derived(stats.getWeeklyData());
	// chartData: oldest (6 days ago) → newest (today), left → right
	let chartData = $derived([...weeklyData].reverse());
	let maxVal = $derived(Math.max(...chartData, 1));
	let today = new Date();
	let dayLabels = $derived(
		chartData.map((_, i) => {
			const d = new Date(today);
			d.setDate(d.getDate() - (6 - i));
			return dayNames[d.getDay()];
		})
	);

	// Level progress
	let levelStats = $derived.by(() => {
		const levels = ['Beginner', 'Intermediate', 'Advanced'] as const;
		return levels.map(level => {
			const levelMods = modules.filter(m => m.level === level);
			const total = levelMods.length;
			let completedMods = 0;
			let totalSess = 0;
			let completedSess = 0;
			for (const mod of levelMods) {
				if (progress.getModuleProgress(mod.slug) === 100) completedMods++;
				totalSess += mod.sessions.length;
				completedSess += progress.getCompletedSessions(mod.slug).length;
			}
			return {
				level,
				total,
				completed: completedMods,
				pct: totalSess > 0 ? Math.round((completedSess / totalSess) * 100) : 0
			};
		});
	});

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

	const levelIcons: Record<string, string> = {
		Beginner: '🌱',
		Intermediate: '📐',
		Advanced: '🚀'
	};
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
			<span class="insight-icon">📊</span>
			<div>
				<span class="insight-value">{formatMinutes(estimatedTimeRemainingMin)}</span>
				<span class="insight-label">Estimasi waktu tersisa</span>
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

	<!-- Weekly activity chart -->
	<section class="weekly-section">
		<h2>Aktivitas Mingguan</h2>
		<div class="weekly-chart">
			{#each chartData as count, i}
				<div class="bar-column">
					<div class="bar-count">{count > 0 ? count : ''}</div>
					<div class="bar-track">
						<div
							class="bar-fill"
							class:bar-today={i === chartData.length - 1}
							style="height: {(count / maxVal) * 100}%"
						></div>
					</div>
					<span class="bar-label">{dayLabels[i]}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- Level progress cards -->
	<section class="level-section">
		<h2>Progres per Level</h2>
		<div class="level-grid">
			{#each levelStats as ls}
				<div class="level-card">
					<div class="level-card-header">
						<span class="level-card-icon">{levelIcons[ls.level]}</span>
						<span class="level-card-name">{ls.level}</span>
					</div>
					<div class="level-card-meta">
						{ls.completed}/{ls.total} modul selesai
					</div>
					<div class="level-card-bar">
						<span class="level-card-pct">{ls.pct}%</span>
						<ProgressBar value={ls.pct} />
					</div>
				</div>
			{/each}
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

		<!-- Sortable table header -->
		<div class="table-header">
			<button class="th th-title" onclick={() => toggleSort('title')}>
				Modul<span class="sort-arrow">{getSortIndicator('title')}</span>
			</button>
			<button class="th" onclick={() => toggleSort('level')}>
				Level<span class="sort-arrow">{getSortIndicator('level')}</span>
			</button>
			<span class="th th-sessions">Sesi</span>
			<button class="th th-progress-col" onclick={() => toggleSort('progress')}>
				Progres<span class="sort-arrow">{getSortIndicator('progress')}</span>
			</button>
		</div>

		<!-- Module rows -->
		{#each sortedModules as mod}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="module-row" onclick={() => goto('/module/' + mod.slug)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && goto('/module/' + mod.slug)}>
				<span class="module-row-title">{mod.title}</span>
				<span class="level-badge" class:beginner={mod.level === 'Beginner'} class:intermediate={mod.level === 'Intermediate'} class:advanced={mod.level === 'Advanced'}>
					{levelIcons[mod.level]} {mod.level}
				</span>
				<span class="module-row-sessions">{progress.getCompletedSessions(mod.slug).length}/{mod.sessions.length}</span>
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

	/* ---- Overall stats ---- */
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

	/* ---- Insight grid ---- */
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

	/* ---- Weekly activity chart ---- */
	.weekly-section {
		margin-bottom: 28px;
	}

	.weekly-section h2 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 16px;
	}

	.weekly-chart {
		display: flex;
		align-items: stretch;
		gap: 6px;
		padding: 8px 4px 0;
		height: 170px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
	}

	.bar-column {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.bar-count {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		height: 16px;
		line-height: 16px;
		opacity: 0;
		transition: opacity 0.15s;
	}

	.bar-column:hover .bar-count {
		opacity: 1;
	}

	.bar-track {
		flex: 1;
		width: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.bar-fill {
		width: 100%;
		max-width: 32px;
		border-radius: 4px 4px 0 0;
		background: var(--accent);
		opacity: 0.35;
		min-height: 3px;
		transition: height 0.3s ease, opacity 0.3s ease;
	}

	.bar-fill.bar-today {
		opacity: 1;
		background: var(--accent);
	}

	.bar-label {
		font-size: 10px;
		color: var(--text-secondary);
		font-weight: 500;
		text-align: center;
		margin-top: 2px;
	}

	/* ---- Level progress cards ---- */
	.level-section {
		margin-bottom: 28px;
	}

	.level-section h2 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 12px;
	}

	.level-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.level-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.level-card-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.level-card-icon {
		font-size: 20px;
	}

	.level-card-name {
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
	}

	.level-card-meta {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.level-card-bar {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.level-card-bar > :global(.progress-wrapper) {
		flex: 1;
	}

	.level-card-pct {
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
		min-width: 36px;
		text-align: right;
		order: -1;
	}

	/* ---- Module list ---- */
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
		margin-bottom: 12px;
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

	/* ---- Table header ---- */
	.table-header {
		display: grid;
		grid-template-columns: 1fr 130px 80px 200px;
		gap: 0;
		align-items: center;
		padding: 10px 16px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-bottom: none;
		border-radius: 8px 8px 0 0;
	}

	.th {
		background: none;
		border: none;
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
		cursor: pointer;
		text-align: left;
		padding: 0;
		display: flex;
		align-items: center;
		gap: 2px;
		transition: color 0.15s;
	}

	.th:hover {
		color: var(--text);
	}

	.th-sessions {
		text-align: center;
		justify-content: center;
		cursor: default;
	}

	.th-sessions:hover {
		color: var(--text-secondary);
	}

	.sort-arrow {
		font-size: 10px;
		color: var(--accent);
	}

	/* ---- Module rows ---- */
	.module-row {
		display: grid;
		grid-template-columns: 1fr 130px 80px 200px;
		gap: 0;
		align-items: center;
		padding: 12px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-top: none;
		cursor: pointer;
		transition: all 0.12s ease;
	}

	.module-row:first-of-type {
		border-top: 1px solid var(--border);
	}

	.module-row:last-of-type {
		border-radius: 0 0 8px 8px;
	}

	.module-row:hover {
		background: var(--bg-secondary);
		border-color: var(--accent);
		position: relative;
		z-index: 1;
	}

	.module-row-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding-right: 8px;
	}

	.level-badge {
		font-size: 11px;
		font-weight: 500;
		padding: 3px 10px;
		border-radius: 999px;
		white-space: nowrap;
		width: fit-content;
	}

	.level-badge.beginner {
		background: rgba(76, 175, 80, 0.15);
		color: #4caf50;
	}

	.level-badge.intermediate {
		background: rgba(33, 150, 243, 0.15);
		color: #2196f3;
	}

	.level-badge.advanced {
		background: rgba(156, 39, 176, 0.15);
		color: #9c27b0;
	}

	.module-row-sessions {
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		text-align: center;
	}

	.module-row-progress {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.module-row-progress > :global(.progress-wrapper) {
		flex: 1;
	}

	.module-row-pct {
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
		min-width: 36px;
		text-align: right;
	}

	/* ---- Mobile ---- */
	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.insight-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.level-grid {
			grid-template-columns: 1fr;
		}

		.table-header {
			grid-template-columns: 1fr 100px 60px 140px;
			padding: 8px 12px;
		}

		.module-row {
			grid-template-columns: 1fr 100px 60px 140px;
			padding: 10px 12px;
		}

		.level-badge {
			font-size: 10px;
			padding: 2px 8px;
		}

		.module-row-pct {
			min-width: 28px;
		}

		.bar-fill {
			max-width: 24px;
		}

		.weekly-chart {
			height: 140px;
		}
	}
</style>
