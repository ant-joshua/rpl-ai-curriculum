<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Card, CardContent, Progress, Button } from '$lib/components/ui';

	let { data }: { data: import('./$types').PageData } = $props();

	let avgProgress = $derived(data.avgProgress ?? 0);
	let avgScore = $derived(data.avgScore ?? 0);
	let attendanceRate = $derived(data.attendanceRate ?? 0);
	let courseProgress = $derived(data.courseProgress ?? []);
	let enrollmentCount = $derived(data.enrollmentCount ?? 0);
	let completedCourseCount = $derived(data.completedCourseCount ?? 0);
	let gradeTrendData = $derived(data.gradeTrendData ?? []);
	let recentActivity = $derived(data.recentActivity ?? []);
	let xp = $derived(data.xp ?? { totalXp: 0, level: 1, xpInLevel: 0, xpForNextLevel: 100, xpToNext: 100 });
	let badgeCount = $derived(data.badgeCount ?? 0);

	let showAllCourses = $state(false);
	let visibleCourses = $derived(showAllCourses ? courseProgress : courseProgress.slice(0, 6));

	let chartCanvas = $state<HTMLCanvasElement | null>(null);
	let gradeChart: any = null;

	$effect(() => {
		if (!browser || !chartCanvas || gradeTrendData.length === 0) return;
		drawChart();
	});

	function drawChart() {
		const canvas = chartCanvas;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.scale(dpr, dpr);

		const w = rect.width;
		const h = rect.height;
		const pad = { top: 20, right: 20, bottom: 30, left: 40 };
		const chartW = w - pad.left - pad.right;
		const chartH = h - pad.top - pad.bottom;

		const values = gradeTrendData.map((d: any) => d.score);
		const maxVal = Math.max(...values, 100);
		const minVal = Math.min(...values, 0);
		const range = maxVal - minVal || 1;

		ctx.clearRect(0, 0, w, h);

		// Grid lines
		ctx.strokeStyle = 'rgba(255,255,255,0.06)';
		ctx.lineWidth = 1;
		for (let i = 0; i <= 4; i++) {
			const y = pad.top + (chartH / 4) * i;
			ctx.beginPath();
			ctx.moveTo(pad.left, y);
			ctx.lineTo(w - pad.right, y);
			ctx.stroke();
			// Y label
			const val = Math.round(maxVal - (range / 4) * i);
			ctx.fillStyle = 'rgba(255,255,255,0.4)';
			ctx.font = '10px sans-serif';
			ctx.textAlign = 'right';
			ctx.fillText(String(val), pad.left - 6, y + 4);
		}

		if (gradeTrendData.length < 2) {
			// Single point - draw a dot
			const x = pad.left + chartW / 2;
			const y = pad.top + chartH - ((values[0] - minVal) / range) * chartH;
			ctx.fillStyle = '#7170ff';
			ctx.beginPath();
			ctx.arc(x, y, 4, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = 'rgba(255,255,255,0.4)';
			ctx.font = '9px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(gradeTrendData[0].title?.slice(0, 15) || '', x, pad.top + chartH + 16);
			return;
		}

		// Line
		const points = gradeTrendData.map((d: any, i: number) => {
			const x = pad.left + (i / (gradeTrendData.length - 1)) * chartW;
			const y = pad.top + chartH - ((d.score - minVal) / range) * chartH;
			return { x, y, label: d.title, date: d.date };
		});

		// Gradient fill
		const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
		grad.addColorStop(0, 'rgba(113, 112, 255, 0.3)');
		grad.addColorStop(1, 'rgba(113, 112, 255, 0.01)');
		ctx.fillStyle = grad;
		ctx.beginPath();
		ctx.moveTo(points[0].x, pad.top + chartH);
		for (const p of points) ctx.lineTo(p.x, p.y);
		ctx.lineTo(points[points.length - 1].x, pad.top + chartH);
		ctx.closePath();
		ctx.fill();

		// Line stroke
		ctx.strokeStyle = '#7170ff';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
		ctx.stroke();

		// Dots
		for (const p of points) {
			ctx.fillStyle = '#7170ff';
			ctx.beginPath();
			ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = '#0f1011';
			ctx.beginPath();
			ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
			ctx.fill();
		}

		// X labels - every other
		for (let i = 0; i < points.length; i++) {
			if (i % 2 !== 0 && points.length > 6) continue;
			ctx.fillStyle = 'rgba(255,255,255,0.4)';
			ctx.font = '9px sans-serif';
			ctx.textAlign = 'center';
			const label = points[i].date || points[i].label?.slice(0, 12) || '';
			ctx.fillText(label, points[i].x, pad.top + chartH + 16);
		}
	}

	function progressColor(pct: number): string {
		if (pct >= 80) return 'var(--success)';
		if (pct >= 40) return 'var(--warning)';
		return 'var(--accent)';
	}

	function progressVariant(pct: number): 'success' | 'warning' | 'default' {
		if (pct >= 80) return 'success';
		if (pct >= 40) return 'warning';
		return 'default';
	}

	function timeAgo(dateStr: string): string {
		if (!dateStr) return '';
		const now = Date.now();
		const d = new Date(dateStr + 'Z').getTime();
		const diff = Math.floor((now - d) / 1000);
		if (diff < 60) return 'baru saja';
		if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
		return `${Math.floor(diff / 86400)}h lalu`;
	}

	function activityLabel(action: string): string {
		if (action === 'complete_lesson') return 'Menyelesaikan pelajaran';
		if (action === 'start_lesson') return 'Mulai pelajaran';
		if (action === 'view_course') return 'Melihat kursus';
		if (action === 'submit_assignment') return 'Mengumpulkan tugas';
		if (action === 'start_assessment') return 'Mulai penilaian';
		if (action === 'complete_assessment') return 'Menyelesaikan penilaian';
		if (action === 'login') return 'Login';
		return action?.replace(/_/g, ' ') || 'Aktivitas';
	}
</script>

<svelte:head>
	<title>Progres Saya — LMS RPL</title>
</svelte:head>

<div class="progress-page">
	<header class="page-header">
		<h1>📈 Progres Belajar Saya</h1>
		<p class="subtitle">Pantau perkembangan belajar kamu secara detail</p>
	</header>

	<!-- Overview Stats -->
	<section class="stats-grid">
		<Card>
			<CardContent>
				<div class="stat-card-inner">
					<span class="stat-icon">📊</span>
					<span class="stat-value">{avgProgress}%</span>
					<span class="stat-label">Rata-rata Progres</span>
				</div>
			</CardContent>
		</Card>
		<Card>
			<CardContent>
				<div class="stat-card-inner">
					<span class="stat-icon">🎯</span>
					<span class="stat-value">{avgScore}</span>
					<span class="stat-label">Rata-rata Nilai</span>
				</div>
			</CardContent>
		</Card>
		<Card>
			<CardContent>
				<div class="stat-card-inner">
					<span class="stat-icon">✅</span>
					<span class="stat-value">{attendanceRate}%</span>
					<span class="stat-label">Kehadiran</span>
				</div>
			</CardContent>
		</Card>
		<Card>
			<CardContent>
				<div class="stat-card-inner">
					<span class="stat-icon">🎓</span>
					<span class="stat-value">{completedCourseCount}/{enrollmentCount}</span>
					<span class="stat-label">Kursus Selesai</span>
				</div>
			</CardContent>
		</Card>
	</section>

	<!-- XP & Level -->
	<section class="xp-section">
		<Card>
			<CardContent>
				<div class="xp-header">
					<div class="xp-info">
						<span class="xp-level-badge">Level {xp.level}</span>
						<span class="xp-total">{xp.totalXp} XP</span>
					</div>
					<div class="xp-badges">
						<span class="badge-count">🏅 {badgeCount} badge</span>
					</div>
				</div>
				<div class="xp-bar-wrap">
					<div class="xp-bar">
						<div class="xp-bar-fill" style="width: {(xp.xpInLevel / (xp.xpForNextLevel - xp.currentLevelXp)) * 100}%"></div>
					</div>
					<span class="xp-bar-label">{xp.xpInLevel} / {xp.xpForNextLevel - xp.currentLevelXp} XP ke Level {xp.level + 1}</span>
				</div>
			</CardContent>
		</Card>
	</section>

	<!-- Content Grid -->
	<div class="content-grid">
		<!-- Per-Course Progress -->
		<section>
			<div class="section-header">
				<h2>📖 Progres per Kursus</h2>
				{#if courseProgress.length > 6}
					<Button variant="ghost" size="sm" onclick={() => showAllCourses = !showAllCourses}>
						{showAllCourses ? 'Tampilkan sedikit' : `Lihat semua (${courseProgress.length})`}
					</Button>
				{/if}
			</div>

			{#if visibleCourses.length === 0}
				<Card>
					<CardContent>
						<div class="empty-state">Belum ada kursus. Mulai belajar sekarang! 🚀</div>
					</CardContent>
				</Card>
			{:else}
				<div class="course-list">
					{#each visibleCourses as course}
						<a href="/learn/{course.offeringId}" class="course-row">
							<div class="course-row-header">
								<span class="course-icon">{course.courseIcon}</span>
								<div class="course-row-info">
									<span class="course-row-title">{course.courseTitle}</span>
									<span class="course-row-meta">
										{course.completedLessons}/{course.totalLessons} sesi
										· {course.status === 'completed' ? '✅ Selesai' : 'Aktif'}
										{#if course.certificateUrl}
											· <a href={course.certificateUrl} class="cert-link">🎓 Sertifikat</a>
										{/if}
									</span>
								</div>
							</div>
							<div class="course-row-bar">
								<Progress value={course.progress} variant={progressVariant(course.progress)} size="md" />
							</div>
							<span class="course-row-pct" style="color: {progressColor(course.progress)}">{course.progress}%</span>
						</a>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Side Panel -->
		<div class="side-panel">
			<!-- Grade Trend Chart -->
			<section class="chart-section">
				<h2>📈 Tren Nilai</h2>
				{#if gradeTrendData.length === 0}
					<Card>
						<CardContent>
							<p class="empty-text">Belum ada nilai yang tercatat.</p>
						</CardContent>
					</Card>
				{:else}
					<Card>
						<CardContent>
							<div class="chart-container">
								<canvas bind:this={chartCanvas} class="grade-chart"></canvas>
							</div>
						</CardContent>
					</Card>
				{/if}
			</section>

			<!-- Recent Activity -->
			<section class="activity-section">
				<h2>🕐 Aktivitas Terbaru</h2>
				{#if recentActivity.length === 0}
					<Card>
						<CardContent>
							<p class="empty-text">Belum ada aktivitas.</p>
						</CardContent>
					</Card>
				{:else}
					<div class="activity-list">
						{#each recentActivity as act}
							<div class="activity-item">
								<span class="activity-dot"></span>
								<div class="activity-body">
									<span class="activity-action">{activityLabel(act.action)}</span>
									{#if act.metadata?.title}
										<span class="activity-detail">{act.metadata.title}</span>
									{/if}
								</div>
								<span class="activity-time">{timeAgo(act.createdAt)}</span>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	</div>
</div>

<style>
	.progress-page {
		max-width: 1120px;
		margin: 0 auto;
		padding: 24px 20px;
		animation: fadeIn 0.4s ease both;
	}

	.page-header {
		margin-bottom: 24px;
	}
	.page-header h1 {
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 4px;
	}
	.subtitle {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0;
	}

	/* Stats grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		margin-bottom: 16px;
	}
	@media (max-width: 768px) {
		.stats-grid { grid-template-columns: repeat(2, 1fr); }
	}
	.stat-card-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		text-align: center;
	}
	.stat-icon { font-size: 28px; }
	.stat-value {
		font-size: 24px;
		font-weight: 700;
		color: var(--accent);
	}
	.stat-label {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	/* XP Section */
	.xp-section {
		margin-bottom: 20px;
	}
	.xp-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}
	.xp-info {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.xp-level-badge {
		background: linear-gradient(135deg, #7170ff, #5e6ad2);
		color: #fff;
		font-size: 14px;
		font-weight: 700;
		padding: 4px 12px;
		border-radius: 20px;
	}
	.xp-total {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-secondary);
	}
	.badge-count {
		font-size: 13px;
		font-weight: 600;
		color: #f59e0b;
	}
	.xp-bar-wrap {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.xp-bar {
		flex: 1;
		height: 10px;
		background: rgba(255,255,255,0.08);
		border-radius: 5px;
		overflow: hidden;
	}
	.xp-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #5e6ad2, #7170ff);
		border-radius: 5px;
		transition: width 0.5s ease;
	}
	.xp-bar-label {
		font-size: 12px;
		color: var(--text-secondary);
		white-space: nowrap;
		font-weight: 500;
	}

	/* Content Grid */
	.content-grid {
		display: grid;
		grid-template-columns: 1fr 340px;
		gap: 20px;
		align-items: start;
	}
	@media (max-width: 900px) {
		.content-grid { grid-template-columns: 1fr; }
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 14px;
	}
	.section-header h2, section h2 {
		font-size: 17px;
		font-weight: 600;
		margin: 0 0 14px;
	}

	/* Course list */
	.course-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.course-row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-decoration: none !important;
		transition: all 0.2s ease;
	}
	.course-row:hover {
		border-color: var(--accent);
		transform: translateX(2px);
	}
	.course-row-header {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
		flex: 1;
	}
	.course-icon { font-size: 24px; flex-shrink: 0; }
	.course-row-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.course-row-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.course-row-meta {
		font-size: 11px;
		color: var(--text-secondary);
	}
	.course-row-bar {
		flex: 1;
		max-width: 200px;
	}
	.course-row-pct {
		font-size: 14px;
		font-weight: 700;
		min-width: 40px;
		text-align: right;
	}

	.cert-link {
		color: var(--accent);
		text-decoration: none;
		font-weight: 600;
	}
	.cert-link:hover {
		text-decoration: underline;
	}

	/* Chart */
	.chart-section { margin-bottom: 20px; }
	.chart-container {
		width: 100%;
		height: 200px;
		position: relative;
	}
	.grade-chart {
		width: 100%;
		height: 100%;
		border-radius: 8px;
	}

	/* Activity */
	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.activity-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
		border-bottom: 1px solid var(--border);
		font-size: 13px;
	}
	.activity-item:last-child { border-bottom: none; }
	.activity-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
		flex-shrink: 0;
	}
	.activity-body { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
	.activity-action { font-weight: 500; color: var(--text); }
	.activity-detail { font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.activity-time { font-size: 11px; color: var(--text-secondary); white-space: nowrap; }

	.empty-text {
		text-align: center;
		padding: 24px;
		color: var(--text-secondary);
		font-size: 13px;
	}
</style>
