<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { modules } from '$lib/stores/modules';
	import { dailyGoal } from '$lib/stores/daily-goal.svelte';
	import { flashcards } from '$lib/stores/flashcards.svelte';
	import { StatCard } from '$lib/components/ui';
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { reminders, type ReminderSchedule } from '$lib/stores/reminders.svelte';
	import { browser } from '$app/environment';

	// ─── Pomodoro Timer ───
	const FOCUS_OPTIONS = [5, 25, 45];
	let focusMinutes = $state(25);
	let breakMinutes = $state(5);
	let TOTAL_FOCUS_SECS = $derived(focusMinutes * 60);
	let TOTAL_BREAK_SECS = $derived(breakMinutes * 60);

	let timerMode = $state<'focus' | 'break'>('focus');
	let timeLeft = $state(TOTAL_FOCUS_SECS);
	let isRunning = $state(false);
	let timerInterval: ReturnType<typeof setInterval> | undefined;
	let pomodoroCount = $state(0);

	$effect(() => {
		if (!isRunning) {
			if (timerMode === 'focus') timeLeft = TOTAL_FOCUS_SECS;
			else timeLeft = TOTAL_BREAK_SECS;
		}
	});

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

	function setFocusDuration(mins: number) {
		if (isRunning) return;
		focusMinutes = mins;
		if (timerMode === 'focus') timeLeft = mins * 60;
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

	// ─── Flashcards ───
	let flashcardCounts = $derived.by(() => {
		void flashcards.version;
		return flashcards.getCardCounts();
	});

	// ─── Study Streak Calendar ───
	let completionDates = $derived.by(() => {
		void progress.completedCount;
		return progress.getCompletionDates();
	});

	let streakCalendar = $derived.by(() => {
		const cal: { date: string; day: number; active: boolean }[] = [];
		const today = new Date();
		const dates = completionDates;
		for (let i = 29; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const dateStr = d.toISOString().split('T')[0];
			const day = d.getDate();
			const active = dates.includes(dateStr);
			cal.push({ date: dateStr, day, active });
		}
		return cal;
	});

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

	let estimatedMinutes = $derived(completedSessions * (500 / 200));

	let refreshKey = $state(0);
	onMount(() => { refreshKey++; });

	// ─── Study Reminders ───
	let reminderSchedule = $state<ReminderSchedule>({ enabled: false, time: '19:00', days: [] });
	let reminderSaved = $state(false);
	let reminderTime = $state('19:00');
	let reminderDays = $state<number[]>([]);
	let reminderEnabled = $state(false);

	$effect(() => {
		if (!browser) return;
		reminderSchedule = reminders.getSchedule();
		reminderEnabled = reminderSchedule.enabled;
		reminderTime = reminderSchedule.time;
		reminderDays = reminderSchedule.days;
		reminders.startReminderCheck();
	});

	function saveReminder() {
		const schedule: ReminderSchedule = {
			enabled: reminderEnabled,
			time: reminderTime,
			days: reminderDays,
		};
		reminders.saveSchedule(schedule);
		reminderSchedule = schedule;
		reminderSaved = true;
		setTimeout(() => { reminderSaved = false; }, 2000);
	}

	function toggleDay(day: number) {
		if (reminderDays.includes(day)) {
			reminderDays = reminderDays.filter(d => d !== day);
		} else {
			reminderDays = [...reminderDays, day].sort();
		}
	}

	function testNotification() {
		reminders.requestPermission().then(granted => {
			if (granted) {
				reminders.showNotification(t('study.notification_test_title'), t('study.notification_test_body'));
			} else {
				alert(''+t('study.notification_denied')+'');
			}
		});
	}

	const dayLabels = [t('study.day_min'), t('study.day_mon'), t('study.day_tue'), t('study.day_wed'), t('study.day_thu'), t('study.day_fri'), t('study.day_sat')];
</script>

<div class="study-page">
	<h1>{t('study.page_title')}</h1>
	<p class="subtitle">{t('study.page_subtitle')}</p>

	<div class="tools-grid">
		<!-- Pomodoro Timer -->
		<section class="tool-card pomodoro-card" in:fade={{ duration: 300 }}>
			<h2>{t('study.pomodoro_title')}</h2>
			<p class="tool-desc">{t('study.pomodoro_desc', { focus: focusMinutes, break: breakMinutes })}</p>

			<div class="pomodoro-presets">
				<span class="preset-label">{t('study.pomodoro_focus_duration')}</span>
				{#each FOCUS_OPTIONS as opt}
					<button
						class="preset-btn"
						class:active={focusMinutes === opt}
						disabled={isRunning}
						onclick={() => setFocusDuration(opt)}
					>{opt}m</button>
				{/each}
			</div>

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
					{timerMode === 'focus' ? t('study.pomodoro_focus') : t('study.pomodoro_break')}
				</div>
			</div>

			<div class="pomodoro-actions">
				{#if !isRunning}
					<button class="pomodoro-btn primary" onclick={startTimer}>
						{t('study.pomodoro_start')}
					</button>
				{:else}
					<button class="pomodoro-btn" onclick={pauseTimer}>
						{t('study.pomodoro_pause')}
					</button>
				{/if}
				<button class="pomodoro-btn" onclick={resetTimer}>
					{t('study.pomodoro_reset')}
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
					{t('study.pomodoro_completed', { count: pomodoroCount })}
				</div>
			{/if}
		</section>

		<!-- Study Reminders -->
		<section class="tool-card reminder-card" in:fade={{ duration: 300, delay: 50 }}>
			<h2>{t('study.reminder_title')}</h2>
			<p class="tool-desc">{t('study.reminder_desc')}</p>

			<div class="reminder-toggle-row">
				<label class="reminder-label" for="reminder-toggle">{t('study.reminder_toggle')}</label>
				<button
					id="reminder-toggle"
					class="toggle-switch"
					class:active={reminderEnabled}
					onclick={() => { reminderEnabled = !reminderEnabled; }}
					role="switch"
					aria-checked={reminderEnabled}
				>
					<span class="toggle-knob"></span>
				</button>
			</div>

			<div class="reminder-field">
				<label for="reminder-time">{t('study.reminder_time')}</label>
				<input
					id="reminder-time"
					type="time"
					bind:value={reminderTime}
					class="reminder-input"
				/>
			</div>

			<div class="reminder-field">
				<label>{t('study.reminder_days')}</label>
				<div class="reminder-days">
					{#each dayLabels as label, i}
						<button
							class="day-btn"
							class:active={reminderDays.includes(i)}
							onclick={() => toggleDay(i)}
						>{label}</button>
					{/each}
				</div>
			</div>

			<div class="reminder-actions">
				<button class="reminder-save-btn" onclick={saveReminder}>
					{reminderSaved ? t('study.reminder_saved') : t('study.reminder_save')}
				</button>
				<button class="reminder-test-btn" onclick={testNotification}>
					{t('study.reminder_test')}
				</button>
			</div>
		</section>

		<!-- Quick Links -->
		<section class="tool-card quick-links-card" in:fade={{ duration: 300, delay: 150 }}>
			<h2>{t('study.quick_links')}</h2>
			<p class="tool-desc">{t('study.quick_links_desc')}</p>

			<div class="quick-links">
				<a href="/flashcards" class="quick-link">
					<span class="ql-icon">🃏</span>
					<span class="ql-text">
						<span class="ql-title">Flashcards</span>
						<span class="ql-desc">{t('study.flashcards_today', { count: flashcardCounts.dueToday })}</span>
					</span>
					<span class="ql-badge" class:has-items={flashcardCounts.dueToday > 0}>
						{flashcardCounts.dueToday}
					</span>
				</a>
				<a href="/tutor" class="quick-link">
					<span class="ql-icon">🤖</span>
					<span class="ql-text">
						<span class="ql-title">AI Tutor</span>
						<span class="ql-desc">{t('study.ai_tutor_desc')}</span>
					</span>
					<span class="ql-arrow">→</span>
				</a>
			</div>

			<div class="daily-goal-compact">
				<h3>{t('study.daily_goal')}</h3>
				<div class="daily-goal-progress">
					<div class="dgp-bar">
						<div class="dgp-fill" style="width: {todayProgress.pct}%"></div>
					</div>
					<div class="dgp-stats">
						<span class="dgp-done">{todayProgress.completed}</span>
						<span class="dgp-sep">/</span>
						<span class="dgp-target">{todayProgress.target}</span>
						<span class="dgp-label">{t('study.goal_sessions')}</span>
					</div>
				</div>

				{#if showGoalInput}
					<div class="goal-edit-row">
						<input type="number" min="1" max="20" bind:value={editTarget} class="goal-input" />
						<button class="goal-save-btn" onclick={saveDailyTarget}>{t('study.goal_save')}</button>
						<button class="goal-cancel-btn" onclick={() => showGoalInput = false}>{t('study.goal_cancel')}</button>
					</div>
				{:else}
					<button class="change-goal-btn" onclick={() => { editTarget = dailyTarget; showGoalInput = true; }}>
						{t('study.goal_change', { target: dailyTarget })}
					</button>
				{/if}

				{#if todayProgress.completed >= todayProgress.target && todayProgress.target > 0}
					<div class="goal-achieved" in:fade={{ duration: 200 }}>
						{t('study.goal_achieved')}
					</div>
				{/if}
			</div>
		</section>

		<!-- Study Streak Calendar -->
		<section class="tool-card streak-card" in:fade={{ duration: 300, delay: 100 }}>
			<h2>{t('study.streak_calendar')}</h2>
			<p class="tool-desc">{t('study.streak_desc', { streak })}</p>

			<div class="streak-calendar">
				{#each streakCalendar as day}
					<div
						class="streak-day"
						class:active={day.active}
						title="{day.date}: {day.active ? t('study.streak_active') : t('study.streak_inactive')}"
					>
						{day.day}
					</div>
				{/each}
			</div>
			<div class="streak-legend">
				<span class="legend-item">
					<span class="legend-box inactive"></span> Tidak aktif
				</span>
				<span class="legend-item">
					<span class="legend-box active"></span> Aktif
				</span>
			</div>
		</section>

		<!-- Study Stats -->
		<section class="tool-card stats-card" in:fade={{ duration: 300, delay: 200 }}>
			<h2>{t('study.stats_title')}</h2>
			<p class="tool-desc">{t('study.stats_desc')}</p>

			<div class="stats-grid">
			<StatCard icon="✅" value="{completedSessions}/{totalSessions}" label="{t('study.stats_sessions_completed')}" />
			<StatCard icon="📊" value="{overallPct}%" label="{t('study.stats_total_progress')}" />
			<StatCard icon="🔥" value={streak} label="{t('study.stats_streak')}" />
			<StatCard icon="📅" value={todayCompletions} label="{t('study.stats_today_sessions')}" />
			<StatCard icon="📦" value={totalModules} label="{t('study.stats_total_modules')}" />
			<StatCard icon="⏱️" value="~{estimatedMinutes}" label="{t('study.stats_minutes_studied')}" />
			</div>
		</section>
	</div>

	<!-- Google Calendar Sync -->
	<section class="tool-card calendar-card">
		<h2>{t('study.calendar_title')}</h2>
		<p class="tool-desc">{t('study.calendar_desc')}</p>
		<p class="calendar-info">{t('study.calendar_info')}</p>
		<a href="/api/export/ical" class="calendar-btn" target="_blank" download="calendar.ics">
			{t('study.calendar_sync')}
		</a>
	</section>

	<!-- Discord Notification -->
	<section class="tool-card discord-card">
		<h2>{t('study.discord_title')}</h2>
		<p class="tool-desc">{t('study.discord_desc')}</p>
		<div class="discord-info">
			<p>{t('study.discord_info')}</p>
			<p class="discord-note">{t('study.discord_note')} <code>DISCORD_WEBHOOK_URL</code>.</p>
		</div>
	</section>
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

	.pomodoro-presets {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 16px;
	}
	.preset-label {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
		margin-right: 4px;
	}
	.preset-btn {
		padding: 4px 12px;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}
	.preset-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
	.preset-btn.active {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}
	.preset-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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

	/* Quick Links */
	.quick-links-card {
		grid-column: 2;
	}

	.quick-links {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 20px;
	}

	.quick-link {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: 12px;
		border: 1px solid var(--border);
		background: var(--bg);
		text-decoration: none !important;
		transition: all 0.15s ease;
	}
	.quick-link:hover {
		border-color: var(--accent);
		background: var(--accent-dim);
	}

	.ql-icon { font-size: 24px; }
	.ql-text { flex: 1; display: flex; flex-direction: column; }
	.ql-title { font-size: 14px; font-weight: 600; color: var(--text); }
	.ql-desc { font-size: 11px; color: var(--text-secondary); }
	.ql-badge {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--border);
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.ql-badge.has-items {
		background: var(--accent);
		color: #fff;
	}
	.ql-arrow { font-size: 18px; color: var(--accent); }

	/* Daily Goal Compact */
	.daily-goal-compact h3 {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 12px;
		color: var(--text);
	}

	.daily-goal-progress {
		margin-bottom: 12px;
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
		font-size: 22px;
		font-weight: 700;
		color: var(--text);
	}

	.dgp-sep {
		font-size: 18px;
		color: var(--text-secondary);
	}

	.dgp-target {
		font-size: 22px;
		font-weight: 700;
		color: var(--text-secondary);
	}

	.dgp-label {
		font-size: 13px;
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

	/* Streak Calendar */
	.streak-card {
		grid-column: 1;
	}

	.streak-calendar {
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		gap: 4px;
		margin-bottom: 12px;
	}

	.streak-day {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		font-size: 10px;
		font-weight: 600;
		background: var(--bg-secondary);
		color: var(--text-secondary);
		border: 1px solid var(--border);
	}
	.streak-day.active {
		background: var(--accent-dim);
		color: var(--accent);
		border-color: var(--accent);
	}

	.streak-legend {
		display: flex;
		gap: 16px;
		font-size: 11px;
		color: var(--text-secondary);
	}
	.legend-item { display: flex; align-items: center; gap: 6px; }
	.legend-box {
		width: 14px;
		height: 14px;
		border-radius: 4px;
		border: 1px solid var(--border);
	}
	.legend-box.inactive { background: var(--bg-secondary); }
	.legend-box.active { background: var(--accent-dim); border-color: var(--accent); }

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

	/* Reminder Card */
	.reminder-card {
		grid-column: 1;
	}

	.reminder-toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.reminder-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
	}

	.toggle-switch {
		width: 44px;
		height: 24px;
		border-radius: 12px;
		border: none;
		background: var(--border);
		cursor: pointer;
		position: relative;
		transition: background 0.2s ease;
		padding: 0;
	}

	.toggle-switch.active {
		background: var(--accent);
	}

	.toggle-knob {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #fff;
		transition: transform 0.2s ease;
	}

	.toggle-switch.active .toggle-knob {
		transform: translateX(20px);
	}

	.reminder-field {
		margin-bottom: 14px;
	}

	.reminder-field label {
		display: block;
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: 6px;
	}

	.reminder-input {
		width: 120px;
		padding: 6px 10px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
		font-weight: 600;
		font-family: inherit;
	}

	.reminder-days {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}

	.day-btn {
		padding: 4px 10px;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}

	.day-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.day-btn.active {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}

	.reminder-actions {
		display: flex;
		gap: 8px;
		margin-top: 12px;
	}

	.reminder-save-btn {
		flex: 1;
		padding: 8px 16px;
		border-radius: 8px;
		border: none;
		background: var(--accent);
		color: #fff;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}

	.reminder-save-btn:hover {
		opacity: 0.9;
	}

	.reminder-test-btn {
		padding: 8px 16px;
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

	.reminder-test-btn:hover {
		color: var(--text);
		border-color: var(--text-secondary);
	}

	/* Calendar & Discord cards */
	.calendar-card, .discord-card {
		margin-top: 16px;
	}

	.calendar-info {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 12px;
	}

	.calendar-btn {
		display: inline-block;
		padding: 10px 20px;
		border-radius: 8px;
		background: var(--accent);
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		transition: opacity 0.15s ease;
	}
	.calendar-btn:hover {
		opacity: 0.9;
		text-decoration: none;
	}

	.discord-info p {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 6px;
	}

	.discord-note {
		font-size: 11px;
		color: var(--muted);
		background: var(--bg);
		padding: 8px 12px;
		border-radius: 6px;
		border: 1px solid var(--border);
	}

	.discord-note code {
		font-size: 11px;
		background: var(--surface);
		padding: 2px 6px;
		border-radius: 4px;
		color: var(--accent);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.tools-grid {
			grid-template-columns: 1fr;
		}
		.pomodoro-card, .stats-card, .streak-card, .quick-links-card, .reminder-card {
			grid-column: 1;
		}
		.stats-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
