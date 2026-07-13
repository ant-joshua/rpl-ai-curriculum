<script lang="ts">
	import { user } from '$lib/stores/user.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { modules, type Module } from '$lib/stores/modules';
	import { paths, computePathProgress, findNextSession } from '$lib/stores/paths';
	import { bookmarks } from '$lib/stores/bookmarks.svelte';
	import { lastActivity } from '$lib/stores/last-activity.svelte';
	import { dailyGoal } from '$lib/stores/daily-goal.svelte';
	import ModuleCard from '$lib/components/ModuleCard.svelte';
	import ProgressChart from '$lib/components/ProgressChart.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { moduleVideos } from '$lib/stores/videos';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { fade } from 'svelte/transition';
	import ActivityHeatmap from '$lib/components/ActivityHeatmap.svelte';
	import { api } from '$lib/utils/api';

	let latestAnnouncements = $state<any[]>([]);

	function formatDate(d: string) {
		try {
			return new Date(d + 'Z').toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
		} catch { return d; }
	}

	let loading = $state(true);

	onMount(() => {
		progress.updateStreak();
		initHeatmap();
		loadRecommendations();
		loadLatestAnnouncements();
		// Brief delay so skeleton is visible during hydration
		requestAnimationFrame(() => {
			loading = false;
		});
	});

	// Last activity (session-level tracking)
	let lastActivityData = $derived(lastActivity.get);
	let lastActivityModule = $derived(
		lastActivityData ? modules.find(m => m.slug === lastActivityData.moduleSlug) : null
	);
	let lastActivitySession = $derived(
		lastActivityData && lastActivityModule
			? lastActivityModule.sessions.find(s => s.id === lastActivityData.sessionId)
			: null
	);

	// Level filter
	type Level = 'Beginner' | 'Intermediate' | 'Advanced';
	let activeLevel = $state<string | null>(null);

	// Search filter
	let searchText = $state('');

	let bookmarkedCount = $derived(modules.filter(m => bookmarks.isBookmarked(m.slug)).length);

	let levelFilters = $derived<{ label: string; value: string | null }[]>([
		{ label: 'Semua', value: null },
		{ label: '🌱 Beginner', value: 'Beginner' },
		{ label: '📐 Intermediate', value: 'Intermediate' },
		{ label: '🚀 Advanced', value: 'Advanced' },
		{ label: `⭐ Tersimpan (${bookmarkedCount})`, value: '__bookmarked__' },
	]);

	let filteredByLevel = $derived(
		activeLevel === null
			? modules
			: activeLevel === '__bookmarked__'
				? modules.filter(m => bookmarks.isBookmarked(m.slug))
				: modules.filter(m => m.level === activeLevel)
	);

	let filteredModules = $derived(
		searchText
			? filteredByLevel.filter(m => m.title.toLowerCase().includes(searchText.toLowerCase()))
			: filteredByLevel
	);

	// Video count per module for badge
	let videoCountMap = $derived.by(() => {
		const map: Record<string, number> = {};
		for (const mv of moduleVideos) {
			map[mv.moduleSlug] = mv.videos.length;
		}
		return map;
	});

	// Overview reactive to level filter
	let filteredCompletedCount = $derived(progress.getFilteredCompletedCount(filteredModules));
	let filteredTotalModules = $derived(filteredModules.length);
	let filteredProgress = $derived(progress.getFilteredOverallProgress(filteredModules));

	// ─── Next uncompleted session across ALL modules ───
	let isCompleted = $derived((modSlug: string, sessionId: string) =>
		progress.isSessionCompleted(modSlug, sessionId)
	);

	let nextSessionOverall = $derived.by(() => {
		for (const mod of modules) {
			for (const sesh of mod.sessions) {
				if (!progress.isSessionCompleted(mod.slug, sesh.id)) {
					return { moduleSlug: mod.slug, sessionId: sesh.id, sessionTitle: sesh.title, moduleTitle: mod.title };
				}
			}
		}
		return null;
	});

	// ─── Path Aktif ───
	let activePaths = $derived(
		paths
			.map(p => ({
				path: p,
				progress: computePathProgress(p.slug, isCompleted),
			}))
			.filter(p => p.progress.completed > 0 && p.progress.pct < 100)
			.sort((a, b) => b.progress.pct - a.progress.pct)
			.slice(0, 3)
	);

	// ─── Daily Goal ───
	let dailyTarget = $state(dailyGoal.getTarget());
	let todayProgress = $derived(dailyGoal.getTodayProgress());
	let showGoalInput = $state(false);
	let editTarget = $state(dailyTarget);

	function saveDailyTarget() {
		dailyGoal.setTarget(editTarget);
		dailyTarget = editTarget;
		showGoalInput = false;
	}

	// ─── Activity Heatmap ───
	let heatmapData = $state<Record<string, number>>({});
	let localActivity = $state<{timestamp: number}[]>([]);

	// ─── AI Recommendations ───
	let recommendations = $state<string[]>([]);
	let recWeakTopics = $state<string[]>([]);
	let recLoading = $state(false);
	let recSuggestion = $state('');

	async function loadRecommendations() {
		if (!browser) return;
		recLoading = true;
		try {
			const completedModules: { slug: string; title: string; pct: number }[] = [];
			for (const mod of modules) {
				const pct = progress.getModuleProgress(mod.slug);
				if (pct > 0) {
					completedModules.push({ slug: mod.slug, title: mod.title, pct });
				}
			}
			const res = await api<any>('/api/recommendations', {
				method: 'POST',
				body: JSON.stringify({
					progress: completedModules,
					streak: progress.getStreak(),
					total_sessions: progress.getOverallProgress(),
				}),
			});
			if (res.success && res.data) {
				recommendations = res.data.recommendations || [];
				recWeakTopics = res.data.weak_topics || [];
				recSuggestion = res.data.suggestion || '';
			}
		} catch {
			// fallback - offline
		} finally {
			recLoading = false;
		}
	}

	async function loadLatestAnnouncements() {
		try {
			const res = await fetch('/api/announcements');
			const json = await res.json();
			if (json.success) {
				latestAnnouncements = (json.data || []).slice(0, 3);
			}
		} catch {}
	}

	function initHeatmap() {
		if (!browser) return;
		try {
			const raw = localStorage.getItem('lms-activity');
			if (raw) localActivity = JSON.parse(raw);
		} catch {}
	}
</script>

<div class="dashboard">
	{#if loading}
		<!-- Skeleton: header -->
		<div class="dashboard-header" style="margin-bottom: 16px;">
			<div>
				<Skeleton width="260px" height="24px" />
				<div style="margin-top: 8px;"><Skeleton width="180px" height="14px" /></div>
			</div>
			<Skeleton width="140px" height="28px" borderRadius="20px" />
		</div>

		<!-- Skeleton: overview cards -->
		<section class="overview-cards" style="margin-bottom: 16px;">
			{#each [1, 2, 3] as _}
				<Skeleton height="56px" borderRadius="10px" />
			{/each}
		</section>

		<!-- Skeleton: chart bar -->
		<Skeleton height="60px" borderRadius="10px" />
		<div style="margin-bottom: 16px;"></div>

		<!-- Skeleton: filter tabs -->
		<section class="level-filters" style="margin-bottom: 16px;">
			{#each [1, 2, 3, 4, 5] as _}
				<Skeleton width="80px" height="28px" borderRadius="16px" />
			{/each}
		</section>

		<!-- Skeleton: module grid -->
		<section class="module-section">
			<div class="module-header">
				<Skeleton width="140px" height="18px" />
			</div>
			<div class="module-grid">
				{#each [1, 2, 3, 4, 5, 6] as _}
					<Skeleton variant="card" />
				{/each}
			</div>
		</section>
	{:else}
		<div in:fade={{ duration: 200 }}>
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
				<span class="overview-value">{filteredCompletedCount}/{filteredTotalModules}</span>
				<span class="overview-label">Modul selesai</span>
			</div>
		</div>
		<div class="overview-card">
			<span class="overview-icon">📊</span>
			<div>
				<span class="overview-value">{filteredProgress}%</span>
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

	<!-- Progress chart bar -->
	<ProgressChart
		{filteredCompletedCount}
		{filteredTotalModules}
		{filteredProgress}
		streak={progress.getStreak()}
	/>
		<section class="daily-goal-section">
			<div class="daily-goal-card">
				<div class="daily-goal-header">
					<h2>🎯 Target Harian</h2>
					<button class="edit-goal-btn" onclick={() => { editTarget = dailyTarget; showGoalInput = !showGoalInput; }}>
						{showGoalInput ? 'Simpan' : 'Ubah'}
					</button>
				</div>
				{#if showGoalInput}
					<div class="goal-input-wrap">
						<input type="number" min="1" max="20" bind:value={editTarget} class="goal-input" />
						<button class="goal-save-btn" onclick={saveDailyTarget}>Simpan</button>
					</div>
				{:else}
					<div class="goal-progress">
						<div class="goal-progress-bar">
							<div class="goal-progress-fill" style="width: {todayProgress.pct}%"></div>
						</div>
						<div class="goal-stats">
							<span class="goal-completed">{todayProgress.completed}</span>
							<span class="goal-sep">/</span>
							<span class="goal-target">{todayProgress.target}</span>
							<span class="goal-label">sesi hari ini</span>
						</div>
					</div>
				{/if}
			</div>
		</section>

		<!-- Activity Heatmap -->
		<section class="section-card">
			<h2>🔥 Activity Heatmap</h2>
			<ActivityHeatmap data={localActivity} />
		</section>

		<!-- Next uncompleted session card -->
		{#if nextSessionOverall}
			<section class="continue-reading">
				<h2>📖 Lanjut Belajar</h2>
				<a href="/module/{nextSessionOverall.moduleSlug}" class="continue-card">
					<div class="continue-info">
						<span class="continue-badge">Sesi selanjutnya</span>
						<h3>{nextSessionOverall.moduleTitle}</h3>
						<p>{nextSessionOverall.sessionTitle}</p>
						<span class="continue-cta">Lanjutkan &rarr;</span>
					</div>
					<span class="continue-arrow">&rarr;</span>
				</a>
			</section>
		{:else if lastActivityModule}
			<section class="continue-reading">
				<h2>📖 Lanjut Belajar</h2>
				<a href="/module/{lastActivityModule.slug}" class="continue-card">
					<div class="continue-info">
						{#if lastActivitySession}
							<span class="continue-session-name">{lastActivitySession.title}</span>
						{/if}
						<h3>{lastActivityModule.title}</h3>
						<span class="continue-cta">Lanjutkan &rarr;</span>
					</div>
					<span class="continue-arrow">&rarr;</span>
				</a>
			</section>
		{/if}

		<!-- Path Aktif section -->
		{#if activePaths.length > 0}
			<section class="active-paths-section">
				<h2>🗺️ Path Aktif</h2>
				<div class="active-paths">
					{#each activePaths as ap}
						<a href="/path/{ap.path.slug}" class="active-path-card" style="--ap-color: {ap.path.color}; --ap-color-end: {ap.path.colorEnd}">
							<div class="ap-header">
								<span class="ap-icon">{ap.path.icon}</span>
								<span class="ap-title">{ap.path.title}</span>
							</div>
							<div class="ap-progress-bar">
								<div class="ap-progress-track">
									<div class="ap-progress-fill" style="width: {ap.progress.pct}%; background: linear-gradient(90deg, {ap.path.color}, {ap.path.colorEnd})"></div>
								</div>
								<span class="ap-progress-pct">{ap.progress.pct}%</span>
							</div>
							<div class="ap-stats">
								<span>{ap.progress.completed}/{ap.progress.total} sesi</span>
								<span class="ap-continue">Lanjutkan &rarr;</span>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<!-- AI Recommendations -->
		<section class="section-card">
			<div class="rec-header">
				<h2>🤖 Rekomendasi AI</h2>
				<button class="rec-refresh-btn" onclick={loadRecommendations} disabled={recLoading}>
					{recLoading ? 'Memuat...' : 'Refresh'}
				</button>
			</div>
			{#if recommendations.length > 0}
				<ul class="rec-list">
					{#each recommendations as rec}
						<li class="rec-item">{rec}</li>
					{/each}
				</ul>
				{#if recSuggestion}
					<p class="rec-suggestion">{recSuggestion}</p>
				{/if}
			{:else if !recLoading}
				<p class="empty-text">Belum ada rekomendasi. Klik "Refresh" untuk mendapatkan saran belajar.</p>
			{:else}
				<p class="empty-text">Memuat rekomendasi...</p>
			{/if}
		</section>

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

	<!-- Search input -->
	<div class="search-wrap">
		<input
			type="text"
			class="search-input"
			placeholder="🔍 Cari modul..."
			bind:value={searchText}
		/>
		{#if searchText}
			<button class="search-clear" onclick={() => searchText = ''}>✕</button>
		{/if}
	</div>

	<!-- Login prompt + Module grid -->
	<section class="module-section">
		<div class="module-header">
			<h2>Semua Modul ({filteredModules.length})</h2>
			{#if !user.isLoggedIn}
				<span class="progress-hint">💾 Progress disimpan di browser</span>
			{/if}
		</div>
		<div class="module-grid">
			{#each filteredModules as mod, i}
				<ModuleCard
					index={mod.index}
					level={mod.level}
					slug={mod.slug}
					title={mod.title}
					description={mod.description}
					progress={progress.getModuleProgress(mod.slug)}
					videoCount={videoCountMap[mod.slug] || 0}
					onclick={() => goto('/module/' + mod.slug)}
				/>
			{/each}
		</div>
	</section>

	<!-- Announcements -->
	<section class="section-card">
		<div class="announcements-header">
			<h2>📢 Pengumuman</h2>
			<a href="/announcements" class="see-all">Lihat semua →</a>
		</div>
		<div class="announcements-preview">
			{#each latestAnnouncements as ann}
				<div class="ann-preview-item">
					<div class="ann-preview-title">{ann.title}</div>
					<div class="ann-preview-meta">
						<span>{ann.author}</span>
						<span>{formatDate(ann.created_at)}</span>
					</div>
				</div>
			{:else}
				<p class="empty-text">Belum ada pengumuman.</p>
			{/each}
		</div>
	</section>

	<!-- Project Studio -->
	<section class="section-card">
		<div class="rec-header">
			<h2>🚀 Project Studio</h2>
			<a href="/projects" class="see-all">Lihat semua →</a>
		</div>
		<p class="empty-text">Belajar bikin project nyata step-by-step dengan verifikasi otomatis dan XP!</p>
		<a href="/projects" class="dashboard-cta">Mulai Project →</a>
	</section>
		</div>
	{/if}
</div>

<style>
	.dashboard {
		max-width: 960px;
		margin: 0 auto;
		animation: fadeIn 0.4s ease both;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 12px;
	}

	h1 {
		font-size: 22px;
		font-weight: 700;
		margin-bottom: 2px;
	}
	.subtitle {
		font-size: 14px;
		color: var(--text-secondary);
	}

	/* Streak badge — gradient glow */
	.streak-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
		border: 1px solid rgba(245, 158, 11, 0.3);
		border-radius: 20px;
		padding: 6px 14px;
		font-size: 13px;
		font-weight: 600;
		white-space: nowrap;
		animation: pulse 2s ease-in-out infinite;
	}
	.streak-fire { font-size: 16px; }

	/* Overview cards — glassmorphism */
	.overview-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
		margin-bottom: 20px;
	}
	.overview-card {
		background: var(--gradient-card);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 18px 20px;
		display: flex;
		align-items: center;
		gap: 14px;
		transition: all 0.2s ease;
	}
	.overview-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(108, 92, 231, 0.1);
	}
	.overview-icon { font-size: 28px; }
	.overview-card div { display: flex; flex-direction: column; gap: 2px; }
	.overview-value {
		font-size: 22px;
		font-weight: 700;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	.overview-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }

	.subtitle {
		color: var(--text-secondary);
		font-size: 13px;
	}

	.overview-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-bottom: 16px;
	}

	.overview-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 12px 16px;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.overview-icon {
		font-size: 22px;
	}

	.overview-value {
		display: block;
		font-size: 20px;
		font-weight: 700;
		color: var(--text);
		line-height: 1.2;
	}

	.overview-label {
		display: block;
		font-size: 11px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.continue-reading {
		margin-bottom: 16px;
	}

	.continue-reading h2 {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 8px;
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

	.continue-session-name {
		display: inline-block;
		font-size: 12px;
		font-weight: 500;
		color: var(--accent);
		background: var(--accent-dim);
		padding: 2px 10px;
		border-radius: 20px;
		margin-bottom: 6px;
	}

	.continue-cta {
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
	}

	.continue-arrow {
		font-size: 20px;
		color: var(--accent);
	}

	/* Level filter tabs */
	.level-filters {
		display: flex;
		gap: 6px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}

	.filter-btn {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 5px 14px;
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.module-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.module-header h2 {
		font-size: 16px;
		font-weight: 600;
		margin: 0;
	}

	.module-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 12px;
	}

	.progress-hint {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 400;
	}

	/* Search input */
	.search-wrap {
		position: relative;
		margin-bottom: 16px;
	}

	.search-input {
		width: 100%;
		height: 36px;
		padding: 0 32px 0 12px;
		font-size: 0.85rem;
		color: var(--text);
		background: #13141f;
		border: 1px solid var(--border);
		border-radius: 8px;
		outline: none;
		font-family: inherit;
		box-sizing: border-box;
		transition: border-color 0.2s ease;
	}

	.search-input:focus {
		border-color: var(--accent);
	}

	.search-input::placeholder {
		color: var(--text-secondary);
		opacity: 0.7;
	}

	.search-clear {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: 14px;
		padding: 4px;
		line-height: 1;
		border-radius: 4px;
		transition: color 0.15s ease;
	}

	.search-clear:hover {
		color: var(--text);
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
				font-size: 20px;
			}
		}

		/* ─── Daily Goal ─── */
		.daily-goal-section {
			margin-bottom: 16px;
		}

		.daily-goal-card {
			background: var(--surface);
			border: 1px solid var(--border);
			border-radius: 12px;
			padding: 16px 20px;
		}

		.daily-goal-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 12px;
		}

		.daily-goal-header h2 {
			font-size: 15px;
			font-weight: 600;
			margin: 0;
		}

		.edit-goal-btn {
			font-size: 11px;
			font-weight: 600;
			color: var(--accent);
			background: var(--accent-dim);
			border: none;
			padding: 4px 12px;
			border-radius: 8px;
			cursor: pointer;
			font-family: inherit;
			transition: all 0.15s ease;
		}
		.edit-goal-btn:hover {
			background: var(--accent);
			color: #fff;
		}

		.goal-input-wrap {
			display: flex;
			gap: 8px;
			align-items: center;
		}

		.goal-input {
			width: 80px;
			padding: 6px 10px;
			border-radius: 8px;
			border: 1px solid var(--border);
			background: var(--bg);
			color: var(--text);
			font-size: 16px;
			font-weight: 600;
			font-family: inherit;
			text-align: center;
		}

		.goal-save-btn {
			padding: 6px 16px;
			border-radius: 8px;
			border: none;
			background: var(--accent);
			color: #fff;
			font-size: 13px;
			font-weight: 600;
			cursor: pointer;
			font-family: inherit;
		}

		.goal-progress {
			display: flex;
			align-items: center;
			gap: 16px;
		}

		.goal-progress-bar {
			flex: 1;
			height: 10px;
			background: var(--border);
			border-radius: 5px;
			overflow: hidden;
		}

		.goal-progress-fill {
			height: 100%;
			background: linear-gradient(90deg, #f59e0b, #ef4444);
			border-radius: 5px;
			transition: width 0.4s ease;
		}

		.goal-stats {
			display: flex;
			align-items: baseline;
			gap: 2px;
			flex-shrink: 0;
		}

		.goal-completed {
			font-size: 22px;
			font-weight: 700;
			color: var(--text);
		}

		.goal-sep {
			font-size: 16px;
			color: var(--text-secondary);
		}

		.goal-target {
			font-size: 22px;
			font-weight: 700;
			color: var(--text-secondary);
		}

		.goal-label {
			font-size: 12px;
			color: var(--text-secondary);
			margin-left: 4px;
		}

		/* ─── Active Paths ─── */
		.active-paths-section {
			margin-bottom: 16px;
		}

		.active-paths-section h2 {
			font-size: 15px;
			font-weight: 600;
			margin-bottom: 8px;
		}

		.active-paths {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}

		.active-path-card {
			display: block;
			padding: 14px 18px;
			border-radius: 12px;
			background: var(--surface);
			border: 1px solid var(--border);
			text-decoration: none !important;
			transition: all 0.15s ease;
		}
		.active-path-card:hover {
			border-color: var(--ap-color, var(--accent));
		}

		.ap-header {
			display: flex;
			align-items: center;
			gap: 10px;
			margin-bottom: 10px;
		}

		.ap-icon {
			font-size: 24px;
			line-height: 1;
		}

		.ap-title {
			font-size: 14px;
			font-weight: 600;
			color: var(--text);
		}

		.ap-progress-bar {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-bottom: 6px;
		}

		.ap-progress-track {
			flex: 1;
			height: 6px;
			background: var(--border);
			border-radius: 3px;
			overflow: hidden;
		}

		.ap-progress-fill {
			height: 100%;
			border-radius: 3px;
			transition: width 0.4s ease;
		}

		.ap-progress-pct {
			font-size: 12px;
			font-weight: 600;
			color: var(--text-secondary);
			min-width: 36px;
			text-align: right;
		}

		.ap-stats {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 12px;
			color: var(--text-secondary);
		}

				.ap-continue {
					font-weight: 600;
					color: var(--ap-color, var(--accent));
				}

				/* Section Card for heatmap + recs */
			.section-card {
				background: var(--surface);
				border: 1px solid var(--border);
				border-radius: 12px;
				padding: 20px;
				margin-bottom: 16px;
			}
			.section-card h2 {
				font-size: 15px;
				font-weight: 600;
				margin-bottom: 14px;
			}

			/* Rec header */
			.rec-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 14px;
			}
			.rec-header h2 {
				margin-bottom: 0;
			}
			.rec-refresh-btn {
				background: var(--accent);
				border: none;
				color: #fff;
				padding: 4px 14px;
				border-radius: 8px;
				font-size: 12px;
				font-weight: 600;
				cursor: pointer;
				font-family: inherit;
			}
			.rec-refresh-btn:hover {
				opacity: 0.9;
			}
			.rec-refresh-btn:disabled {
				opacity: 0.5;
				cursor: default;
			}
			.rec-list {
				list-style: none;
				padding: 0;
				display: flex;
				flex-direction: column;
				gap: 8px;
			}
			.rec-item {
				font-size: 13px;
				color: var(--text);
				padding: 8px 12px;
				background: var(--bg);
				border-radius: 8px;
				border: 1px solid var(--border);
				line-height: 1.5;
			}
			.rec-suggestion {
				font-size: 13px;
				color: var(--accent);
				font-weight: 600;
				margin-top: 10px;
				padding: 10px 14px;
				background: var(--accent-dim);
				border-radius: 8px;
			}
						.empty-text {
							font-size: 13px;
							color: var(--text-secondary);
							text-align: center;
							padding: 20px;
						}

						/* Announcements */
						.announcements-header {
							display: flex;
							justify-content: space-between;
							align-items: center;
							margin-bottom: 14px;
						}
						.announcements-header h2 {
							margin-bottom: 0;
						}
						.see-all {
							font-size: 0.8rem;
							font-weight: 600;
							color: var(--accent);
							text-decoration: none;
						}
						.see-all:hover {
							text-decoration: underline;
						}
						.announcements-preview {
							display: flex;
							flex-direction: column;
							gap: 8px;
						}
						.ann-preview-item {
							padding: 10px 12px;
							background: var(--bg);
							border: 1px solid var(--border);
							border-radius: 8px;
						}
						.ann-preview-title {
							font-size: 0.85rem;
							font-weight: 600;
							color: var(--text);
							margin-bottom: 4px;
						}
						.ann-preview-meta {
							display: flex;
							gap: 1rem;
							font-size: 0.7rem;
							color: var(--text-secondary);
						}
						</style>
