<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let loading = $state(true);
	let apiError = $state('');
	let totalXp = $state(0);
	let level = $state(1);
	let streak = $state(0);
	let longestStreak = $state(0);
	let attendancePct = $state(0);
	let insights: string[] = $state([]);
	let quizPerformance: any[] = $state([]);
	let subjectMastery: any[] = $state([]);
	let xpTimeline: { day: string; pts: number }[] = $state([]);

	// Map for heatmap from xpTimeline
	let xpMap = $derived(new Map(xpTimeline.map(e => [e.day, e.pts])));

	onMount(() => {
		if (!browser) return;
		loadData();
	});

	async function loadData() {
		loading = true;
		apiError = '';
		try {
			const token = localStorage.getItem('token') || '';
			const res = await fetch('/api/my/analytics', {
				headers: { Authorization: `Bearer ${token}` },
			});
			const json = await res.json();
			if (!json.success) {
				apiError = json.error || 'Gagal memuat data';
				return;
			}
			const d = json.data;
			totalXp = d.totalXp || 0;
			level = d.level || 1;
			streak = d.streak || 0;
			longestStreak = d.longestStreak || 0;
			attendancePct = d.attendancePct || 0;
			insights = d.insights || [];
			quizPerformance = d.quizPerformance || [];
			subjectMastery = d.subjectMastery || [];
			xpTimeline = d.xpTimeline || [];
		} catch {
			apiError = 'Network error';
		} finally {
			loading = false;
		}
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

	// Daily XP for last 30 days (fill missing days with 0)
	let xpData = $derived.by(() => {
		const today = new Date();
		const out: number[] = [];
		for (let i = 29; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const ds = d.toISOString().split('T')[0];
			out.push(xpMap.get(ds) || 0);
		}
		return out;
	});

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
		const lastX = CHART_PAD.left + (xpData.length - 1) * stepX;
		d += `L ${lastX.toFixed(1)} ${CHART_PAD.top + CHART_INNER_H} L ${CHART_PAD.left} ${CHART_PAD.top + CHART_INNER_H} Z`;
		return d;
	});

	// Heatmap data (last 12 weeks)
	const heatmapData = $derived.by(() => {
		const today = new Date();
		const cells: { date: string; count: number; day: number }[] = [];
		for (let i = 83; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const ds = d.toISOString().split('T')[0];
			cells.push({ date: ds, count: xpMap.get(ds) || 0, day: d.getDay() });
		}
		return cells;
	});

	const CELL_SIZE = 12;
	const CELL_GAP = 2;
	const HEATMAP_COLS = 12;
	const WEEKS = 12;

	// Derived stats
	const passedCount = $derived(quizPerformance.filter(q => q.passed).length);
	const failedCount = $derived(quizPerformance.length - passedCount);
	const quizAvg = $derived(
		quizPerformance.length > 0
			? Math.round(quizPerformance.reduce((a: number, q: any) => a + q.pct, 0) / quizPerformance.length)
			: 0
	);
	const overallProgress = $derived(
		subjectMastery.length > 0
			? Math.round(subjectMastery.reduce((a: number, s: any) => a + s.mastery, 0) / subjectMastery.length)
			: 0
	);

	function pctColor(pct: number): string {
		if (pct >= 80) return 'var(--green, #22c55e)';
		if (pct >= 60) return 'var(--amber, #f59e0b)';
		return 'var(--red, #ef4444)';
	}
</script>

<div class="analytics">
	<!-- Loading / Error -->
	{#if loading}
		<div class="empty-chart">Memuat data...</div>
	{:else if apiError}
		<div class="empty-chart" style="color: var(--red, #ef4444)">{apiError}</div>
	{:else}
	<!-- AI Insights Banner -->
	<div class="insights-banner">
		<div class="insights-head">
			<span class="insights-icon">🤖</span>
			<span class="insights-title">AI Insights — Analisis Personal</span>
		</div>
		<ul class="insights-list">
			{#each insights as ins}
				<li class="insight-item">{@html ins}</li>
			{/each}
		</ul>
	</div>

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
			<span class="stat-icon">🎖️</span>
			<div class="stat-body">
				<span class="stat-value">Lv {level}</span>
				<span class="stat-label">Level</span>
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
			<span class="stat-icon">📊</span>
			<div class="stat-body">
				<span class="stat-value">{overallProgress}%</span>
				<span class="stat-label">Penguasaan Mapel</span>
			</div>
		</div>
		<div class="stat-card">
			<span class="stat-icon">📅</span>
			<div class="stat-body">
				<span class="stat-value">{attendancePct}%</span>
				<span class="stat-label">Kehadiran</span>
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
		{#if xpMap.size > 0}
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
							title="{cell.date}: {cell.count} XP"
							style="background: {cell.count === 0 ? '#F1F5F9' :
								cell.count <= 20 ? '#C7D2FE' :
								cell.count <= 50 ? '#818CF8' :
								cell.count <= 100 ? '#4F46E5' :
								'#3730A3'}"
						></div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="empty-chart">Belum ada aktivitas belajar.</div>
		{/if}
	</div>

	<!-- Subject Mastery -->
	<div class="chart-card">
		<h3 class="chart-title">Penguasaan per Mapel</h3>
		{#if subjectMastery.length > 0}
			<div class="module-list">
				{#each subjectMastery as sm}
					<div class="module-item">
						<div class="module-header">
							<span class="module-name">{sm.name}</span>
							<span class="module-count">{sm.mastery}% · {sm.count} quiz</span>
						</div>
						<div class="module-bar-track">
							<div
								class="module-bar-fill"
								style="width: {sm.mastery}%; background: {pctColor(sm.mastery)}"
							></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-chart">Belum cukup data quiz untuk menghitung penguasaan mapel.</div>
		{/if}
	</div>

	<!-- Quiz Performance -->
	<div class="chart-card">
		<h3 class="chart-title">Hasil Quiz</h3>
		<div class="quiz-overview">
			<span class="quiz-avg big">Rata-rata: <strong style="color:{pctColor(quizAvg)}">{quizAvg}%</strong></span>
			<span class="quiz-pass-badge">✓ Lulus {passedCount}</span>
			<span class="quiz-fail-badge">✗ Gagal {failedCount}</span>
		</div>
		{#if quizPerformance.length > 0}
			<div class="quiz-grid">
				{#each quizPerformance as q}
					<div class="quiz-item">
						<div class="quiz-name">{q.title} <span class="quiz-offering">{q.offering}</span></div>
						<div class="quiz-bar-track">
							<div class="quiz-bar-fill" style="width:{q.pct}%; background:{pctColor(q.pct)}"></div>
						</div>
						<div class="quiz-meta">
							<span class="quiz-pct">{q.pct}%</span>
							<span class="quiz-date">{q.date?.slice(0,10)}</span>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-chart">Belum ada hasil quiz.</div>
		{/if}
	</div>
	{/if}
</div>

<style>
	.analytics {
		max-width: 960px;
		margin: 0 auto;
		padding: 0 12px 32px;
	}

	/* AI Insights Banner */
	.insights-banner {
		background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%);
		border: 1px solid #c7d2fe;
		border-radius: var(--radius, 12px);
		padding: 16px 20px;
		margin-bottom: 16px;
	}
	.insights-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
	.insights-icon { font-size: 18px; }
	.insights-title { font-weight: 700; font-size: 14px; color: #3730a3; }
	.insights-list { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; }
	.insight-item { font-size: 13px; color: #4338ca; line-height: 1.5; }

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
		transition: all 0.15s ease;
		animation: fadeSlideIn 0.3s ease both;
		opacity: 0;
	}
	.stat-card:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.08);
		border-color: rgba(79, 70, 229, 0.2);
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
		animation: fadeSlideIn 0.4s ease both;
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
	.quiz-overview { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
	.quiz-avg { font-size: 13px; color: var(--text-secondary, #64748b); }
	.quiz-avg.big { font-size: 15px; }
	.quiz-pass-badge {
		background: #dcfce7; color: #166534; padding: 3px 10px;
		border-radius: 999px; font-size: 12px; font-weight: 600;
	}
	.quiz-fail-badge {
		background: #fee2e2; color: #991b1b; padding: 3px 10px;
		border-radius: 999px; font-size: 12px; font-weight: 600;
	}
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
		display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
	}
	.quiz-offering { font-size: 10px; color: var(--text-secondary, #64748b); font-weight: 400; }
	.quiz-bar-track {
		height: 8px;
		background: var(--border, #E2E8F0);
		border-radius: 9999px;
		overflow: hidden;
	}
	.quiz-bar-fill {
		height: 100%;
		border-radius: 9999px;
		transition: width 0.5s ease;
	}
	.quiz-meta { display: flex; justify-content: space-between; margin-top: 3px; font-size: 10px; color: var(--text-secondary, #64748b); }
	.quiz-pct { font-weight: 700; }
	.quiz-date { }

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
