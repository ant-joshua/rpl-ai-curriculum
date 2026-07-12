<script lang="ts">
	import { progress } from '$lib/stores/progress.svelte';
	import { modules } from '$lib/stores/modules';
	import { dailyGoal } from '$lib/stores/daily-goal.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	// ─── Pomodoro Timer ───
	const FOCUS_MINUTES = 25;
	const BREAK_MINUTES = 5;
	const TOTAL_FOCUS_SECS = FOCUS_MINUTES * 60;
	const TOTAL_BREAK_SECS = BREAK_MINUTES * 60;

	let timerMode = $state<'focus' | 'break'>('focus');
	let timeLeft = $state(TOTAL_FOCUS_SECS);
	let isRunning = $state(false);
	let timerInterval: ReturnType<typeof setInterval> | undefined;
	let pomodoroCount = $state(0);

	let minutes = $derived(Math.floor(timeLeft / 60));
	let seconds = $derived(timeLeft % 60);
	let totalTime = $derived(timerMode === 'focus' ? TOTAL_FOCUS_SECS : TOTAL_BREAK_SECS);
	let progressPct = $derived(((totalTime - timeLeft) / totalTime) * 100);
	let circumference = 2 * Math.PI * 90;
	let dashOffset = $derived(circumference - (progressPct / 100) * circumference);

	function startTimer() {
		if (isRunning) return;
		isRunning = true;
		timerInterval = setInterval(() => {
			timeLeft--;
			if (timeLeft <= 0) {
				clearInterval(timerInterval);
				timerInterval = undefined;
				isRunning = false;
				if (timerMode === 'focus') {
					pomodoroCount++;
					switchToBreak();
				} else {
					switchToFocus();
				}
			}
		}, 1000);
	}

	function pauseTimer() {
		isRunning = false;
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = undefined;
		}
	}

	function resetTimer() {
		pauseTimer();
		pomodoroCount = 0;
		switchToFocus();
	}

	function switchToFocus() {
		timerMode = 'focus';
		timeLeft = TOTAL_FOCUS_SECS;
	}

	function switchToBreak() {
		timerMode = 'break';
		timeLeft = TOTAL_BREAK_SECS;
	}

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

	// ─── Daily Goal ───
	let dailyTarget = $state(dailyGoal.getTarget());
	let todayProgress = $derived(dailyGoal.getTodayProgress());
	let editTarget = $state(dailyTarget);
	let showGoalInput = $state(false);

	function saveDailyTarget() {
		dailyGoal.setTarget(editTarget);
		dailyTarget = editTarget;
		showGoalInput = false;
	}

	// ─── Study Stats ───
	let totalSessions = $derived(modules.reduce((acc, m) => acc + m.sessions.length, 0));
	let totalModules = $derived(modules.length);
	let completedSessions = $derived.by(() => {
		let count = 0;
		for (const mod of modules) {
			for (const sesh of mod.sessions) {
				if (progress.isSessionCompleted(mod.slug, sesh.id)) count++;
			}
		}
		return count;
	});
	let overallPct = $derived(totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0);
	let streak = $derived(progress.getStreak());
	let todayCompletions = $derived(dailyGoal.getTodayCompletions());

	// Estimated study time (500 words/session, 200 wpm reading)
	let estimatedMinutes = $derived(completedSessions * (500 / 200));
</script>

<div class="study-page">
	<h1>🔬 Study Tools</h1>
	<p class="subtitle">Alat bantu belajar untuk meningkatkan fokus dan produktivitas</p>

	<div class="tools-grid">
		<!-- Pomodoro Timer -->
		<section class="tool-card pomodoro-card" in:fade={{ duration: 300 }}>
			<h2>🍅 Pomodoro Timer</h2>
			<p class="tool-desc">{FOCUS_MINUTES} menit fokus / {BREAK_MINUTES} menit istirahat</p>

			<div class="pomodoro-ring-wrap">
				<svg class="pomodoro-ring" viewBox="0 0 200 200">
					<circle class="ring-bg" cx="100" cy="100" r="90" />
					<circle
						class="ring-progress"
						cx="100" cy="100" r="90"
						stroke-dasharray={circumference}
						stroke-dashoffset={dashOffset}
						style="stroke: {timerMode === 'focus' ? '#ef4444' : '#22c55e'}"
					/>
				</svg>
				<div class="pomodoro-time">
					<span class="pomodoro-minutes">{String(minutes).padStart(2, '0')}</span>
					<span class="pomodoro-sep">:</span>
					<span class="pomodoro-seconds">{String(seconds).padStart(2, '0')}</span>
				</div>
				<div class="pomodoro-mode">
					{timerMode === 'focus' ? '🎯 Fokus' : '☕ Istirahat'}
				</div>
			</div>

			<div class="pomodoro-actions">
				{#if !isRunning}
					<button class="pomodoro-btn primary" onclick={startTimer}>
						▶ Mulai
					</button>
				{:else}
					<button class="pomodoro-btn" onclick={pauseTimer}>
						⏸ Jeda
					</button>
				{/if}
				<button class="pomodoro-btn" onclick={resetTimer}>
					↺ Reset
				</button>
			</div>

			<div class="pomodoro-mode-switch">
				<button
					class="mode-btn"
					class:active={timerMode === 'focus'}
					onclick={switchToFocus}
					disabled={isRunning}
				>🎯 Fokus</button>
				<button
					class="mode-btn"
					class:active={timerMode === 'break'}
					onclick={switchToBreak}
					disabled={isRunning}
				>☕ Istirahat</button>
			</div>

			{#if pomodoroCount > 0}
				<div class="pomodoro-stats" in:fade={{ duration: 200 }}>
					🍅 {pomodoroCount} pomodoro selesai
				</div>
			{/if}
		</section>

		<!-- Daily Goal -->
		<section class="tool-card" in:fade={{ duration: 300, delay: 100 }}>
			<h2>🎯 Target Harian</h2>
			<p class="tool-desc">Tetapkan target sesi per hari</p>

			<div class="daily-goal-progress">
				<div class="dgp-bar">
					<div class="dgp-fill" style="width: {todayProgress.pct}%"></div>
				</div>
				<div class="dgp-stats">
					<span class="dgp-done">{todayProgress.completed}</span>
					<span class="dgp-sep">/</span>
					<span class="dgp-target">{todayProgress.target}</span>
					<span class="dgp-label">sesi</span>
				</div>
			</div>

			{#if showGoalInput}
				<div class="goal-edit-row">
					<input type="number" min="1" max="20" bind:value={editTarget} class="goal-input" />
					<button class="goal-save-btn" onclick={saveDailyTarget}>Simpan</button>
					<button class="goal-cancel-btn" onclick={() => showGoalInput = false}>Batal</button>
				</div>
			{:else}
				<button class="change-goal-btn" onclick={() => { editTarget = dailyTarget; showGoalInput = true; }}>
					Ubah target ({dailyTarget} sesi/hari)
				</button>
			{/if}

			{#if todayProgress.completed >= todayProgress.target && todayProgress.target > 0}
				<div class="goal-achieved" in:fade={{ duration: 200 }}>
					🎉 Target hari ini tercapai!
				</div>
			{/if}
		</section>

		<!-- Study Stats -->
		<section class="tool-card stats-card" in:fade={{ duration: 300, delay: 200 }}>
			<h2>📊 Statistik Belajar</h2>
			<p class="tool-desc">Rangkuman progress belajarmu</p>

			<div class="stats-grid">
				<div class="stat-item">
					<span class="stat-value">{completedSessions}/{totalSessions}</span>
					<span class="stat-label">Sesi selesai</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{overallPct}%</span>
					<span class="stat-label">Progress total</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{streak}</span>
					<span class="stat-label">Streak (hari)</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{todayCompletions}</span>
					<span class="stat-label">Sesi hari ini</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{totalModules}</span>
					<span class="stat-label">Total modul</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">~{estimatedMinutes}</span>
					<span class="stat-label">Menit belajar</span>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	.study-page {
		max-width: 900px;
		margin: 0 auto;
	}

	h1 {
		font-size: 22px;
		font-weight: 700;
		margin-bottom: 4px;
	}

	.subtitle {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 24px;
	}

	.tools-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.tool-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 24px;
	}

	.tool-card h2 {
		font-size: 17px;
		font-weight: 600;
		margin-bottom: 4px;
	}

	.tool-desc {
		font-size: 12px;
		color: var(--text-secondary);
		margin-bottom: 20px;
	}

	/* Pomodoro */
	.pomodoro-card {
		grid-column: 1;
	}

	.pomodoro-ring-wrap {
		position: relative;
		width: 200px;
		height: 200px;
		margin: 0 auto 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pomodoro-ring {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.ring-bg {
		fill: none;
		stroke: var(--border);
		stroke-width: 6;
	}

	.ring-progress {
		fill: none;
		stroke-width: 6;
		stroke-linecap: round;
		transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
	}

	.pomodoro-time {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: baseline;
		gap: 2px;
		font-variant-numeric: tabular-nums;
	}

	.pomodoro-minutes, .pomodoro-seconds {
		font-size: 48px;
		font-weight: 700;
		color: var(--text);
		line-height: 1;
	}

	.pomodoro-sep {
		font-size: 32px;
		font-weight: 300;
		color: var(--text-secondary);
		margin: 0 2px;
	}

	.pomodoro-mode {
		position: absolute;
		bottom: 24px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.pomodoro-actions {
		display: flex;
		gap: 8px;
		justify-content: center;
		margin-bottom: 12px;
	}

	.pomodoro-btn {
		padding: 8px 20px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}
	.pomodoro-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.pomodoro-btn.primary {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}
	.pomodoro-btn.primary:hover {
		opacity: 0.9;
	}

	.pomodoro-mode-switch {
		display: flex;
		gap: 6px;
		justify-content: center;
		margin-bottom: 12px;
	}

	.mode-btn {
		padding: 6px 16px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}
	.mode-btn:hover:not(:disabled) {
		color: var(--text);
		border-color: var(--text-secondary);
	}
	.mode-btn.active {
		background: var(--accent-dim);
		color: var(--accent);
		border-color: var(--accent);
	}
	.mode-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.pomodoro-stats {
		text-align: center;
		font-size: 12px;
		font-weight: 600;
		color: var(--accent);
		padding: 6px 12px;
		background: var(--accent-dim);
		border-radius: 8px;
	}

	/* Daily Goal */
	.daily-goal-progress {
		margin-bottom: 16px;
	}

	.dgp-bar {
		height: 14px;
		background: var(--border);
		border-radius: 7px;
		overflow: hidden;
		margin-bottom: 8px;
	}

	.dgp-fill {
		height: 100%;
		background: linear-gradient(90deg, #f59e0b, #ef4444);
		border-radius: 7px;
		transition: width 0.4s ease;
	}

	.dgp-stats {
		display: flex;
		align-items: baseline;
		gap: 2px;
		justify-content: center;
	}

	.dgp-done {
		font-size: 28px;
		font-weight: 700;
		color: var(--text);
	}

	.dgp-sep {
		font-size: 20px;
		color: var(--text-secondary);
	}

	.dgp-target {
		font-size: 28px;
		font-weight: 700;
		color: var(--text-secondary);
	}

	.dgp-label {
		font-size: 14px;
		color: var(--text-secondary);
		margin-left: 4px;
	}

	.goal-edit-row {
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

	.goal-cancel-btn {
		padding: 6px 16px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}

	.change-goal-btn {
		padding: 8px 16px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		width: 100%;
		transition: all 0.15s ease;
	}
	.change-goal-btn:hover {
		color: var(--text);
		border-color: var(--text-secondary);
	}

	.goal-achieved {
		margin-top: 12px;
		padding: 8px 16px;
		background: rgba(34, 197, 94, 0.1);
		color: #22c55e;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		text-align: center;
	}

	/* Stats */
	.stats-card {
		grid-column: 2;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.stat-item {
		text-align: center;
		padding: 12px;
		background: var(--bg);
		border-radius: 12px;
		border: 1px solid var(--border);
	}

	.stat-value {
		display: block;
		font-size: 22px;
		font-weight: 700;
		color: var(--text);
		line-height: 1.2;
		margin-bottom: 2px;
	}

	.stat-label {
		font-size: 11px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.tools-grid {
			grid-template-columns: 1fr;
		}
		.pomodoro-card, .stats-card {
			grid-column: 1;
		}
		.stats-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
