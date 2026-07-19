<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { modules, type Module } from '$lib/stores/modules';

	let xpData = $state<number[]>([]);
	let completionDates = $state<string[]>([]);
	let streak = $state(0);
	let longestStreak = $state(0);
	let totalXp = $state(0);
	let level = $state(1);
	let sessionCount = $state(0);
	let quizResults = $state<{ name: string; passed: number; failed: number }[]>([]);
	let moduleProgress = $state<{ slug: string; name: string; done: number; total: number }[]>([]);

	onMount(() => {
		if (!browser) return;
		loadData();
	});

	function loadData() {
		try {
			// XP
			const xpRaw = localStorage.getItem('lms-xp');
			totalXp = xpRaw ? parseInt(xpRaw, 10) || 0 : 0;
			level = Math.max(1, Math.floor(totalXp / 100) + 1);

			// Generate XP timeline (simulated from daily deltas)
			const datesRaw = localStorage.getItem('lms-completion-dates');
			completionDates = datesRaw ? JSON.parse(datesRaw) : [];

			// Streak
			streak = parseInt(localStorage.getItem('lms-streak') || '0', 10);
			longestStreak = parseInt(localStorage.getItem('lms-streak-longest') || '0', 10);

			// XP over last 30 days
			const today = new Date();
			const last30: number[] = [];
			for (let i = 29; i >= 0; i--) {
				const d = new Date(today);
				d.setDate(d.getDate() - i);
				const ds = d.toISOString().split('T')[0];
				const count = completionDates.filter(cd => cd === ds).length;
				// Each session = 10 XP
				last30.push(count * 10);
			}
			xpData = last30;

			// Module progress
			moduleProgress = modules.map(mod => {
				const key = `lms-progress-${mod.slug}`;
				const raw = localStorage.getItem(key);
				const ids: string[] = raw ? JSON.parse(raw) : [];
				return {
					slug: mod.slug,
					name: mod.title || mod.slug,
					done: ids.length,
					total: mod.sessions.length,
				};
			});

			// Quiz results from localStorage
			const qResults: { name: string; passed: number; failed: number }[] = [];
			for (const mod of modules) {
				for (const ses of mod.sessions) {
					const qKey = `lms-quiz-${mod.slug}-${ses.id}`;
					const raw = localStorage.getItem(qKey);
					if (raw) {
						try {
							const parsed = JSON.parse(raw);
							if (typeof parsed === 'object' && parsed !== null) {
								const passed = typeof parsed.passed === 'number' ? parsed.passed : (parsed.score >= 70 ? 1 : 0);
								const failed = typeof parsed.failed === 'number' ? parsed.failed : (parsed.score < 70 ? 1 : 0);
								qResults.push({
									name: ses.title || ses.id,
									passed,
									failed,
								});
							}
						} catch { /* skip */ }
					}
				}
			}
			quizResults = qResults;

			// Session count
			sessionCount = completionDates.length;

		} catch { /* ignore localStorage errors */ }
	}

	function formatDateLabel(index: number): string {
		const today = new Date();
		const d = new Date(today);
		d.setDate(d.getDate() - (29 - index));
		return `${d.getDate()}/${d.getMonth() + 1}`;
	}

	// SVG chart dimensions
	const CHART_W = 600;
	const CHART_H = 180;
	const CHART_PAD = { top: 20, right: 10, bottom: 24, left: 40 };
	const CHART_INNER_W = CHART_W - CHART_PAD.left - CHART_PAD.right;
	const CHART_INNER_H = CHART_H - CHART_PAD.top - CHART_PAD.bottom;

	const maxXp = $derived(Math.max(...xpData, 10));

	const xpLinePath = $derived.by(() => {
		if (xpData.length === 0) return '';
		const stepX = CHART_INNER_W / Math.max(xpData.length - 1, 1);
		const points = xpData.map((v, i) => {
			const x = CHART_PAD.left + i * stepX;
			const y = CHART_PAD.top + CHART_INNER_H - (v / maxXp) * CHART_INNER_H;
			return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
		});
		return points.join(' ');
	});

	const xpFillPath = $derived.by(() => {
		if (xpData.length === 0) return '';
		const stepX = CHART_INNER_W / Math.max(xpData.length - 1, 1);
		let d = '';
		xpData.forEach((v, i) => {
			const x = CHART_PAD.left + i * stepX;
			const y = CHART_PAD.top + CHART_INNER_H - (v / maxXp) * CHART_INNER_H;
			d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
		});
		// Close to bottom
		const lastX = CHART_PAD.left + (xpData.length - 1) * stepX;
		d += `L ${lastX.toFixed(1)} ${CHART_PAD.top + CHART_INNER_H} L ${CHART_PAD.left} ${CHART_PAD.top + CHART_INNER_H} Z`;
		return d;
	});

	// Heatmap data (last 12 weeks)
	const heatmapData = $derived.by(() => {
		const today = new Date();
		const cells: { date: string; count: number; day: number }[] = [];
		// Last 12*7 = 84 days
		for (let i = 83; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const ds = d.toISOString().split('T')[0];
			const count = completionDates.filter(cd => cd === ds).length;
			cells.push({ date: ds, count, day: d.getDay() });
		}
		return cells;
	});

	const CELL_SIZE = 12;
	const CELL_GAP = 2;
	const HEATMAP_COLS = 12;
	const WEEKS = 12;

	const totalCompleted = $derived(sessionCount);
	const totalModulesCount = $derived(moduleProgress.length);
	const completedModulesCount = $derived(moduleProgress.filter(m => m.done >= m.total).length);
	const overallProgress = $derived(
		moduleProgress.length > 0
			? Math.round((completedModulesCount / moduleProgress.length) * 100)
			: 0
	);
</script>

<div class="analytics">
	<!-- Header Stats -->
	<div class="stats-row">
		<div class="stat-card">
			<span class="stat-icon">⭐</span>
			<div class="stat-body">
				<span class="stat-value">{totalXp}</span>
				<span class="stat-label">XP Total</span>
			</div>
		</div>
		<div class="stat-card">
			<span class="stat-icon">🔥</span>
			<div class="stat-body">
				<span class="stat-value">{streak}</span>
				<span class="stat-label">Streak Hari Ini</span>
			</div>
		</div>
		<div class="stat-card">
			<span class="stat-icon">🏆</span>
			<div class="stat-body">
				<span class="stat-value">{longestStreak}</span>
				<span class="stat-label">Streak Terpanjang</span>
			</div>
		</div>
		<div class="stat-card">
			<span class="stat-icon">📚</span>
			<div class="stat-body">
				<span class="stat-value">{completedModulesCount}/{totalModulesCount}</span>
				<span class="stat-label">Modul Selesai</span>
			</div>
		</div>
		<div class="stat-card">
			<span class="stat-icon">📊</span>
			<div class="stat-body">
				<span class="stat-value">{overallProgress}%</span>
				<span class="stat-label">Progres Total</span>
			</div>
		</div>
		<div class="stat-card">
			<span class="stat-icon">💻</span>
			<div class="stat-body">
				<span class="stat-value">{totalCompleted}</span>
				<span class="stat-label">Sesi Belajar</span>
			</div>
		</div>
	</div>

	<!-- XP Over Time -->
	<div class="chart-card">
		<h3 class="chart-title">XP 30 Hari Terakhir</h3>
		{#if xpData.length > 0}
			<div class="chart-container">
				<svg viewBox="0 0 {CHART_W} {CHART_H}" class="chart-svg" preserveAspectRatio="xMidYMid meet">
					<!-- Grid lines -->
					{#each [0, 1, 2, 3, 4] as grid}
						{@const y = CHART_PAD.top + CHART_INNER_H - (grid / 4) * CHART_INNER_H}
						<line x1={CHART_PAD.left} y1={y} x2={CHART_W - CHART_PAD.right} y2={y} stroke="#E2E8F0" stroke-width="1" />
						<text x={CHART_PAD.left - 8} y={y + 4} text-anchor="end" fill="#94a3b8" font-size="10">
							{Math.round((grid / 4) * maxXp)}
						</text>
					{/each}

					<!-- Fill area -->
					<path d={xpFillPath} fill="rgba(79,70,229,0.08)" />

					<!-- Line -->
					<path d={xpLinePath} fill="none" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="line-animate" />

					<!-- Dots -->
					{#each xpData as v, i}
						{@const stepX = CHART_INNER_W / Math.max(xpData.length - 1, 1)}
						{@const x = CHART_PAD.left + i * stepX}
						{@const y = CHART_PAD.top + CHART_INNER_H - (v / maxXp) * CHART_INNER_H}
						<circle cx={x} cy={y} r="3" fill="#4F46E5" stroke="#fff" stroke-width="1.5" class="dot-animate" />
					{/each}

					<!-- X axis labels (every 5th) -->
					{#each xpData as _, i}
						{#if i % 5 === 0}
							<text x={CHART_PAD.left + i * (CHART_INNER_W / Math.max(xpData.length - 1, 1))} y={CHART_H - 4} text-anchor="middle" fill="#94a3b8" font-size="9">{formatDateLabel(i)}</text>
						{/if}
					{/each}
				</svg>
			</div>
		{:else}
			<div class="empty-chart">Belum ada data XP. Mulai belajar untuk melihat progres!</div>
		{/if}
	</div>

	<!-- Study Heatmap -->
	<div class="chart-card">
		<h3 class="chart-title">Aktivitas Belajar (12 Minggu)</h3>
		{#if completionDates.length > 0}
			<div class="heatmap-container">
				<div class="heatmap-labels">
					<span>Sen</span>
					<span>Rab</span>
					<span>Jum</span>
				</div>
				<div class="heatmap-grid">
					{#each heatmapData as cell}
						<div
							class="heatmap-cell"
							data-count={cell.count}
							title="{cell.date}: {cell.count} sesi"
							style="background: {cell.count === 0 ? '#F1F5F9' :
								cell.count <= 1 ? '#C7D2FE' :
								cell.count <= 2 ? '#818CF8' :
								cell.count <= 4 ? '#4F46E5' :
								'#3730A3'}"
						></div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="empty-chart">Belum ada aktivitas belajar.</div>
		{/if}
	</div>

	<!-- Module Progress -->
	<div class="chart-card">
		<h3 class="chart-title">Progres Modul</h3>
		{#if moduleProgress.length > 0}
			<div class="module-list">
				{#each moduleProgress as mp}
					<div class="module-item">
						<div class="module-header">
							<span class="module-name">{mp.name}</span>
							<span class="module-count">{mp.done}/{mp.total} sesi</span>
						</div>
						<div class="module-bar-track">
							<div
								class="module-bar-fill"
								style="width: {mp.total > 0 ? (mp.done / mp.total) * 100 : 0}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-chart">Belum ada progres modul.</div>
		{/if}
	</div>

	<!-- Quiz Accuracy -->
	<div class="chart-card">
		<h3 class="chart-title">Hasil Quiz</h3>
		{#if quizResults.length > 0}
			<div class="quiz-grid">
				{#each quizResults as q}
					<div class="quiz-item">
						<div class="quiz-name">{q.name}</div>
						<div class="quiz-bars">
							<div class="quiz-pass-bar" style="flex: {q.passed || 0.5}">
								<span class="quiz-bar-label">Lulus {q.passed}</span>
							</div>
							<div class="quiz-fail-bar" style="flex: {q.failed || 0.5}">
								<span class="quiz-bar-label">Gagal {q.failed}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-chart">Belum ada hasil quiz.</div>
		{/if}
	</div>
</div>

<style>
	.analytics {
		max-width: 960px;
		margin: 0 auto;
		padding: 0 12px 32px;
	}

	/* Stats row */
	.stats-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		margin-bottom: 16px;
	}
	.stat-card {
		background: var(--surface, #FFF);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: var(--radius, 12px);
		padding: 14px 16px;
		display: flex;
		align-items: center;
		gap: 10px;
		box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}
	.stat-card:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow, 0 1px 3px rgba(0,0,0,0.08));
	}
	.stat-icon { font-size: 22px; }
	.stat-body { display: flex; flex-direction: column; }
	.stat-value {
		font-size: 18px;
		font-weight: 700;
		color: var(--text, #1a1a2e);
		line-height: 1.2;
	}
	.stat-label {
		font-size: 11px;
		font-weight: 400;
		color: var(--text-secondary, #64748b);
	}

	/* Chart cards */
	.chart-card {
		background: var(--surface, #FFF);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: var(--radius, 12px);
		padding: 20px;
		margin-bottom: 14px;
		box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
	}
	.chart-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text, #1a1a2e);
		margin: 0 0 14px;
	}

	/* SVG chart */
	.chart-container {
		width: 100%;
		overflow: visible;
	}
	.chart-svg {
		width: 100%;
		height: auto;
		max-height: 200px;
	}
	.line-animate {
		stroke-dasharray: 1000;
		stroke-dashoffset: 1000;
		animation: drawLine 1.5s ease forwards;
	}
	@keyframes drawLine {
		to { stroke-dashoffset: 0; }
	}
	.dot-animate {
		opacity: 0;
		animation: fadeDot 0.3s ease forwards;
	}
	@keyframes fadeDot {
		to { opacity: 1; }
	}

	/* Heatmap */
	.heatmap-container {
		display: flex;
		gap: 6px;
	}
	.heatmap-labels {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 1px 0;
		font-size: 9px;
		color: #94a3b8;
		min-width: 18px;
	}
	.heatmap-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 2px;
		flex: 1;
	}
	.heatmap-cell {
		aspect-ratio: 1;
		border-radius: 3px;
		transition: transform 0.1s ease;
		cursor: default;
	}
	.heatmap-cell:hover {
		transform: scale(1.3);
		z-index: 1;
	}

	/* Module list */
	.module-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-height: 300px;
		overflow-y: auto;
	}
	.module-item {}
	.module-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
	}
	.module-name {
		font-size: 12px;
		font-weight: 500;
		color: var(--text, #1a1a2e);
	}
	.module-count {
		font-size: 11px;
		color: var(--text-secondary, #64748b);
	}
	.module-bar-track {
		height: 6px;
		background: var(--border, #E2E8F0);
		border-radius: 9999px;
		overflow: hidden;
	}
	.module-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #4F46E5, #6366F1);
		border-radius: 9999px;
		transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Quiz */
	.quiz-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.quiz-item {}
	.quiz-name {
		font-size: 12px;
		font-weight: 500;
		color: var(--text, #1a1a2e);
		margin-bottom: 4px;
	}
	.quiz-bars {
		display: flex;
		gap: 4px;
		height: 20px;
	}
	.quiz-pass-bar {
		background: #22C55E;
		border-radius: 4px;
		display: flex;
		align-items: center;
		padding: 0 6px;
		min-width: 40px;
		transition: flex 0.3s ease;
	}
	.quiz-fail-bar {
		background: #EF4444;
		border-radius: 4px;
		display: flex;
		align-items: center;
		padding: 0 6px;
		min-width: 40px;
		transition: flex 0.3s ease;
	}
	.quiz-bar-label {
		font-size: 9px;
		font-weight: 600;
		color: #fff;
		white-space: nowrap;
	}

	.empty-chart {
		padding: 24px;
		text-align: center;
		color: var(--text-secondary, #64748b);
		font-size: 13px;
	}

	@media (max-width: 768px) {
		.stats-row {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 480px) {
		.stats-row {
			grid-template-columns: 1fr 1fr;
		}
		.heatmap-grid {
			grid-template-columns: repeat(12, 1fr);
		}
	}
</style>
