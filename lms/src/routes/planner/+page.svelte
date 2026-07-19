<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { planner, type StudyPlan, type DailySession } from '$lib/stores/planner.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { gamification } from '$lib/stores/gamification.svelte';
	import { paths } from '$lib/stores/paths';
	import { modules } from '$lib/stores/modules';

	let selectedPathSlug = $state('');
	let targetDate = $state('');

	let computedDailyTarget = $derived.by(() => {
		if (!selectedPathSlug || !targetDate) return 0;
		const path = paths.find(p => p.slug === selectedPathSlug);
		if (!path) return 0;
		const now = new Date();
		const target = new Date(targetDate);
		if (target <= now) return 0;
		const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
		return Math.max(1, Math.ceil(path.estimatedSessions / diffDays));
	});

	let computedTotalSessions = $derived.by(() => {
		if (!selectedPathSlug) return 0;
		const path = paths.find(p => p.slug === selectedPathSlug);
		return path?.estimatedSessions || 0;
	});

	let computedTotalDays = $derived.by(() => {
		if (!selectedPathSlug || !targetDate) return 0;
		const now = new Date();
		const target = new Date(targetDate);
		if (target <= now) return 0;
		return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
	});

	let plan = $state<StudyPlan | null>(null);
	let dailySessions = $state<DailySession[]>([]);
	let allPlanSessions = $state<DailySession[]>([]);
	let todayCompleted = $state(0);
	let todayTotal = $state(0);
	let onTrack = $state(true);
	let timelinePct = $derived(plan ? Math.min(100, Math.round((plan.completedDays / plan.totalDays) * 100)) : 0);

	let heatmapDates: { date: string; completed: boolean }[] = $state([]);

	function getCompletionDates(): string[] {
		if (!browser) return [];
		try {
			const raw = localStorage.getItem('lms-completion-dates');
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	}

	onMount(() => {
		plan = planner.activePlan;
		if (plan) {
			refreshPlanData();
		}
	});

	function refreshPlanData() {
		if (!plan) return;
		dailySessions = planner.getDailySchedule(plan);
		allPlanSessions = planner.getAllSessionsForPlan(plan);
		todayTotal = dailySessions.length;

		let completed = 0;
		for (const s of dailySessions) {
			if (progress.isSessionCompleted(s.moduleSlug, s.sessionId)) {
				completed++;
			}
		}
		todayCompleted = completed;

		onTrack = planner.isOnTrack(plan, (mslug, sid) => progress.isSessionCompleted(mslug, sid));

		const dates: { date: string; completed: boolean }[] = [];
		const completionDates = getCompletionDates();
		const today = new Date();
		for (let i = 13; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const dateStr = d.toISOString().split('T')[0];
			const found = completionDates.filter((cd: string) => cd === dateStr);
			dates.push({ date: dateStr, completed: found.length > 0 });
		}
		heatmapDates = dates.reverse();
	}

	function handleCreatePlan() {
		if (!selectedPathSlug || !targetDate) return;
		planner.createPlan(selectedPathSlug, targetDate);
		plan = planner.activePlan;
		refreshPlanData();
	}

	function handleAbandon() {
		planner.abandonPlan();
		plan = null;
	}

	function handleCompleteSession(moduleSlug: string, sessionId: string) {
		progress.toggleSession(moduleSlug, sessionId);
		if (plan) refreshPlanData();
	}

	function isSessionDone(moduleSlug: string, sessionId: string): boolean {
		return progress.isSessionCompleted(moduleSlug, sessionId);
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	function formatShortDate(dateStr: string): string {
		const d = new Date(dateStr + 'T00:00:00');
		return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
	}

	function getDayLabel(dateStr: string): string {
		const d = new Date(dateStr + 'T00:00:00');
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const target = new Date(d);
		target.setHours(0, 0, 0, 0);
		const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
		if (diff === 0) return 'Hari Ini';
		if (diff === -1) return 'Kemarin';
		return formatShortDate(dateStr);
	}

	function printPlan() {
		if (!plan) return;
		const win = window.open('', '_blank');
		if (!win) return;
		const path = paths.find(p => p.slug === plan.pathSlug);
		win.document.write(`
			<html>
			<head><title>Rencana Belajar - ${path?.title || plan.pathSlug}</title>
			<style>
				body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #333; }
				h1 { font-size: 24px; margin-bottom: 8px; }
				h2 { font-size: 18px; margin-top: 24px; }
				.meta { color: #666; margin-bottom: 16px; }
				table { width: 100%; border-collapse: collapse; margin: 16px 0; }
				th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
				th { background: #f5f5f5; }
				.done { color: #22c55e; }
				.todo { color: #eab308; }
				.footer { margin-top: 32px; font-size: 12px; color: #64748b; }
				@media print { body { padding: 20px; } }
			</style>
			</head>
			<body>
				<h1>📅 Rencana Belajar — ${path?.title || plan.pathSlug}</h1>
				<div class="meta">
					Mulai: ${formatDate(plan.startDate)} | Target: ${formatDate(plan.targetDate)}<br>
					Target Harian: ${plan.dailyTarget} sesi/hari | Total: ${allPlanSessions.length} sesi
				</div>
				<h2>Daftar Sesi</h2>
				<table>
					<tr><th>Hari</th><th>Modul</th><th>Sesi</th><th>Status</th></tr>
		`);
		for (const s of allPlanSessions) {
			const done = isSessionDone(s.moduleSlug, s.sessionId);
			win.document.write(`
				<tr>
					<td>Hari ${s.day}</td>
					<td>${s.moduleTitle}</td>
					<td>${s.sessionTitle}</td>
					<td class="${done ? 'done' : 'todo'}">${done ? '✅ Selesai' : '⬜ Belum'}</td>
				</tr>
			`);
		}
		win.document.write(`
				</table>
				<div class="footer">Dicetak dari RPL AI Curriculum LMS</div>
			</body>
			</html>
		`);
		win.document.close();
		setTimeout(() => win.print(), 500);
	}
</script>

<svelte:head>
	<title>📅 Planner — RPL AI Curriculum</title>
</svelte:head>

<div class="planner-page">
	<h1>📅 Study Planner</h1>

	{#if !plan}
		<!-- Create Plan Form -->
		<div class="create-plan">
			<h2>Buat Rencana Belajar</h2>
			<p class="subtitle">Pilih learning path dan target deadline untuk membuat rencana belajar harian.</p>

			<div class="form-group">
				<label for="path-select">Learning Path</label>
				<select id="path-select" bind:value={selectedPathSlug}>
					<option value="">— Pilih Path —</option>
					{#each paths as p}
						<option value={p.slug}>{p.icon} {p.title}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="target-date">Target Deadline</label>
				<input id="target-date" type="date" bind:value={targetDate} min={new Date().toISOString().split('T')[0]} />
			</div>

			{#if selectedPathSlug && targetDate && computedTotalDays > 0}
				<div class="plan-preview">
					<div class="preview-item">
						<span class="preview-label">Total Sesi</span>
						<span class="preview-value">{computedTotalSessions}</span>
					</div>
					<div class="preview-item">
						<span class="preview-label">Hari Tersedia</span>
						<span class="preview-value">{computedTotalDays} hari</span>
					</div>
					<div class="preview-item">
						<span class="preview-label">Target Harian</span>
						<span class="preview-value">{computedDailyTarget} sesi/hari</span>
					</div>
					<div class="preview-item">
						<span class="preview-label">Estimasi Selesai</span>
						<span class="preview-value">{formatDate(targetDate)}</span>
					</div>
				</div>
			{/if}

			<button class="btn-primary" onclick={handleCreatePlan} disabled={!selectedPathSlug || !targetDate || computedTotalDays <= 0}>
				🚀 Mulai
			</button>
		</div>
	{:else}
		<!-- Active Plan Dashboard -->
		<div class="plan-dashboard">
			<div class="plan-header">
				<div>
					<h2>{paths.find(p => p.slug === plan.pathSlug)?.icon} {paths.find(p => p.slug === plan.pathSlug)?.title || plan.pathSlug}</h2>
					<p class="plan-meta">
						Mulai {formatDate(plan.startDate)} — Target {formatDate(plan.targetDate)}
					</p>
				</div>
				<div class="plan-actions">
					<button class="btn-secondary" onclick={printPlan}>🖨️ Cetak Rencana</button>
					<button class="btn-danger" onclick={handleAbandon}>🚫 Hentikan</button>
				</div>
			</div>

			<!-- Timeline Progress -->
			<div class="timeline-section">
				<h3>Progress</h3>
				<div class="timeline-bar">
					<div class="timeline-fill" style="width: {timelinePct}%"></div>
				</div>
				<div class="timeline-labels">
					<span>Hari {plan.completedDays}/{plan.totalDays}</span>
					<span>{timelinePct}%</span>
				</div>
			</div>

			<!-- Today's Status -->
			<div class="today-status">
				<div class="status-card">
					<div class="status-label">Target Hari Ini</div>
					<div class="status-value">{plan.dailyTarget} sesi</div>
				</div>
				<div class="status-card">
					<div class="status-label">Progress Hari Ini</div>
					<div class="status-value">{todayCompleted}/{todayTotal}</div>
				</div>
				<div class="status-card">
					<div class="status-label">On Track</div>
					<div class="status-value">{onTrack ? '✅' : '⚠️ Tertinggal'}</div>
				</div>
				<div class="status-card">
					<div class="status-label">Sisa Hari</div>
					<div class="status-value">{planner.getDaysUntilDeadline(plan)} hari</div>
				</div>
			</div>

			<!-- Daily Heatmap -->
			<div class="heatmap-section">
				<h3>14 Hari Terakhir</h3>
				<div class="heatmap-grid">
					{#each heatmapDates as day}
						<div class="heatmap-cell" title="{day.date}: {day.completed ? '✅ Belajar' : '❌ Libur'}">
							<div class="heatmap-block" class:active={day.completed}></div>
							<span class="heatmap-label">{getDayLabel(day.date)}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Hari Ini Sessions -->
			<div class="today-section">
				<h3>📋 Hari Ini</h3>
				{#if dailySessions.length === 0}
					<p class="empty-state">Semua sesi selesai! 🎉</p>
				{:else}
					<div class="session-list">
						{#each dailySessions as session}
							<div class="session-item" class:done={isSessionDone(session.moduleSlug, session.sessionId)}>
								<div class="session-info">
									<span class="session-module">{session.moduleTitle}</span>
									<span class="session-title">{session.sessionTitle}</span>
								</div>
								<button
									class="btn-session"
									class:done={isSessionDone(session.moduleSlug, session.sessionId)}
									onclick={() => handleCompleteSession(session.moduleSlug, session.sessionId)}
								>
									{isSessionDone(session.moduleSlug, session.sessionId) ? '✅ Selesai' : '⬜ Selesaikan'}
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.planner-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px 0;
	}

	h1 {
		font-size: 28px;
		font-weight: 700;
		margin-bottom: 24px;
		color: var(--text);
	}

	h2 {
		font-size: 20px;
		font-weight: 600;
		margin-bottom: 8px;
		color: var(--text);
	}

	h3 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 12px;
		color: var(--text);
	}

	.subtitle {
		color: var(--text-secondary);
		margin-bottom: 24px;
		font-size: 14px;
	}

	.create-plan {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 32px;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group label {
		display: block;
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 6px;
		color: var(--text);
	}

	.form-group select,
	.form-group input {
		width: 100%;
		padding: 10px 14px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
	}

	.plan-preview {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 12px;
		margin: 20px 0;
		padding: 16px;
		background: var(--bg-secondary);
		border-radius: 12px;
	}

	.preview-item {
		text-align: center;
	}

	.preview-label {
		display: block;
		font-size: 12px;
		color: var(--text-secondary);
		margin-bottom: 4px;
	}

	.preview-value {
		font-size: 18px;
		font-weight: 700;
		color: var(--accent);
	}

	.btn-primary {
		display: block;
		width: 100%;
		padding: 12px;
		border: none;
		border-radius: 10px;
		background: var(--accent);
		color: #fff;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.btn-primary:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn-primary:not(:disabled):hover {
		opacity: 0.9;
	}

	.plan-dashboard {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.plan-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		flex-wrap: wrap;
	}

	.plan-meta {
		font-size: 13px;
		color: var(--text-secondary);
		margin-top: 4px;
	}

	.plan-actions {
		display: flex;
		gap: 8px;
	}

	.btn-secondary {
		padding: 8px 16px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: transparent;
		color: var(--text);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-secondary:hover {
		background: var(--hover);
	}

	.btn-danger {
		padding: 8px 16px;
		border: 1px solid var(--danger, #ef4444);
		border-radius: 8px;
		background: transparent;
		color: var(--danger, #ef4444);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-danger:hover {
		background: var(--danger, #ef4444);
		color: #fff;
	}

	.timeline-section {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
	}

	.timeline-bar {
		height: 16px;
		background: var(--bg-secondary);
		border-radius: 8px;
		overflow: hidden;
	}

	.timeline-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
		border-radius: 8px;
		transition: width 0.3s ease;
	}

	.timeline-labels {
		display: flex;
		justify-content: space-between;
		margin-top: 6px;
		font-size: 12px;
		color: var(--text-secondary);
	}

	.today-status {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 12px;
	}

	.status-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
		text-align: center;
	}

	.status-label {
		font-size: 12px;
		color: var(--text-secondary);
		margin-bottom: 6px;
	}

	.status-value {
		font-size: 20px;
		font-weight: 700;
		color: var(--text);
	}

	.heatmap-section {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
	}

	.heatmap-grid {
		display: grid;
		grid-template-columns: repeat(14, 1fr);
		gap: 6px;
	}

	.heatmap-cell {
		text-align: center;
	}

	.heatmap-block {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 4px;
		background: var(--bg-secondary);
		transition: all 0.15s;
	}

	.heatmap-block.active {
		background: var(--accent);
	}

	.heatmap-label {
		font-size: 9px;
		color: var(--text-secondary);
		display: block;
		margin-top: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.today-section {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
	}

	.empty-state {
		color: var(--text-secondary);
		font-size: 14px;
		text-align: center;
		padding: 20px;
	}

	.session-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.session-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background: var(--bg-secondary);
		border-radius: 8px;
		gap: 12px;
	}

	.session-item.done {
		opacity: 0.6;
	}

	.session-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		flex: 1;
	}

	.session-module {
		font-size: 11px;
		color: var(--text-secondary);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.session-title {
		font-size: 14px;
		color: var(--text);
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.btn-session {
		padding: 6px 14px;
		border-radius: 6px;
		border: 1px solid var(--accent);
		background: transparent;
		color: var(--accent);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s;
	}

	.btn-session:hover {
		background: var(--accent);
		color: #fff;
	}

	.btn-session.done {
		border-color: var(--border);
		color: var(--text-secondary);
	}
</style>
