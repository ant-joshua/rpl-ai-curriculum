<script lang="ts">
	import { browser } from '$app/environment';

	let {
		initialMinutes = 25,
	}: {
		initialMinutes?: number;
	} = $props();

	const FOCUS_TIME = initialMinutes * 60;
	const BREAK_TIME = 5 * 60;
	const STORAGE_KEY = 'lms-pomodoro-state';
	const COUNT_KEY = 'lms-pomodoro-count';
	const CIRCUMFERENCE = 283; // 2 * PI * 45 (r=45)

	type TimerMode = 'focus' | 'break';

	let mode: TimerMode = $state('focus');
	let remaining: number = $state(FOCUS_TIME);
	let running: boolean = $state(false);
	let sessionCount: number = $state(0);
	let intervalId: ReturnType<typeof setInterval> | null = $state(null);

	const progress = $derived(
		mode === 'focus'
			? 1 - remaining / FOCUS_TIME
			: 1 - remaining / BREAK_TIME
	);

	const dashOffset = $derived(CIRCUMFERENCE * (1 - progress));

	const formattedTime = $derived.by(() => {
		const m = Math.floor(remaining / 60);
		const s = remaining % 60;
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	});

	const label = $derived(mode === 'focus' ? 'Focus' : 'Break');

	function playBeep() {
		try {
			const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.type = 'sine';
			osc.frequency.value = 800;
			gain.gain.setValueAtTime(0.3, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
			osc.start(ctx.currentTime);
			osc.stop(ctx.currentTime + 0.5);

			// Second beep
			const osc2 = ctx.createOscillator();
			const gain2 = ctx.createGain();
			osc2.connect(gain2);
			gain2.connect(ctx.destination);
			osc2.type = 'sine';
			osc2.frequency.value = 1000;
			gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.5);
			gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
			osc2.start(ctx.currentTime + 0.5);
			osc2.stop(ctx.currentTime + 1);
		} catch {
			// Audio not available — silent fallback
		}
	}

	function saveState() {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({
				mode,
				remaining,
				running,
			}));
			localStorage.setItem(COUNT_KEY, String(sessionCount));
		} catch {
			// localStorage unavailable
		}
	}

	function loadState() {
		if (!browser) return;
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				mode = parsed.mode ?? 'focus';
				remaining = parsed.remaining ?? (parsed.mode === 'break' ? BREAK_TIME : FOCUS_TIME);
				running = false; // don't auto-resume timer on load, only show persisted time
			}
			const countStr = localStorage.getItem(COUNT_KEY);
			if (countStr) {
				sessionCount = parseInt(countStr, 10) || 0;
			}
		} catch {
			// localStorage unavailable
		}
	}

	function switchMode() {
		if (mode === 'focus') {
			mode = 'break';
			remaining = BREAK_TIME;
		} else {
			mode = 'focus';
			remaining = FOCUS_TIME;
		}
	}

	function tick() {
		if (remaining <= 1) {
			// Timer complete
			stop();
			playBeep();

			if (mode === 'focus') {
				sessionCount += 1;
				try {
					if (browser) localStorage.setItem(COUNT_KEY, String(sessionCount));
				} catch { /* noop */ }

				// Dispatch custom event
				const el = document.querySelector('[data-pomodoro]');
				if (el) {
					el.dispatchEvent(new CustomEvent('complete', {
						detail: { sessionCount },
						bubbles: true,
					}));
				}
			}

			switchMode();
			return;
		}

		remaining -= 1;
		saveState();
	}

	function start() {
		if (running) return;
		running = true;
		intervalId = setInterval(tick, 1000);
		saveState();
	}

	function pause() {
		running = false;
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
		saveState();
	}

	function reset() {
		pause();
		mode = 'focus';
		remaining = FOCUS_TIME;
		saveState();
	}

	function stop() {
		running = false;
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	$effect(() => {
		loadState();
		return () => {
			if (intervalId !== null) {
				clearInterval(intervalId);
				intervalId = null;
			}
		};
	});
</script>

<div class="pomodoro" data-pomodoro>
	<div class="pomodoro-inner">
		<!-- SVG Circular Progress -->
		<svg class="timer-ring" viewBox="0 0 100 100" aria-label="Timer progress">
			<circle
				class="ring-bg"
				cx="50" cy="50" r="45"
			/>
			<circle
				class="ring-fg"
				class:focus={mode === 'focus'}
				class:break={mode === 'break'}
				cx="50" cy="50" r="45"
				stroke-dasharray={CIRCUMFERENCE}
				stroke-dashoffset={dashOffset}
				stroke-linecap="round"
				transform="rotate(-90 50 50)"
			/>
		</svg>

		<!-- Timer display overlay -->
		<div class="timer-content">
			<span class="timer-label">{label}</span>
			<span class="timer-time">{formattedTime}</span>

			<div class="timer-actions">
				{#if running}
					<button class="timer-btn" onclick={pause} aria-label="Pause timer">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
							<rect x="6" y="4" width="4" height="16" rx="1"/>
							<rect x="14" y="4" width="4" height="16" rx="1"/>
						</svg>
					</button>
				{:else}
					<button class="timer-btn timer-btn--play" onclick={start} aria-label="Start timer">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
							<polygon points="5,3 19,12 5,21"/>
						</svg>
					</button>
				{/if}
				<button class="timer-btn timer-btn--reset" onclick={reset} aria-label="Reset timer">
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
						<path d="M3 3v5h5"/>
					</svg>
				</button>
			</div>
		</div>
	</div>

	<div class="session-count">
		<span class="session-dot"></span>
		{sessionCount} session{sessionCount !== 1 ? 's' : ''} completed
	</div>
</div>

<style>
	.pomodoro {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: var(--surface, #FFFFFF);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: var(--radius, 12px);
		box-shadow: var(--shadow, 0 1px 3px rgba(0,0,0,0.08));
		padding: 20px 16px 14px;
		gap: 10px;
		transition: box-shadow 0.2s ease, transform 0.2s ease;
		width: 100%;
		max-width: 240px;
		box-sizing: border-box;
	}
	.pomodoro:hover {
		box-shadow: var(--shadow-lg, 0 4px 12px rgba(0,0,0,0.08));
		transform: translateY(-1px);
	}

	.pomodoro-inner {
		position: relative;
		width: 120px;
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.timer-ring {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.ring-bg {
		fill: none;
		stroke: var(--border, #E2E8F0);
		stroke-width: 5;
	}

	.ring-fg {
		fill: none;
		stroke-width: 5;
		transition: stroke-dashoffset 0.5s ease, stroke 0.4s ease;
	}
	.ring-fg.focus {
		stroke: #F59E0B;
	}
	.ring-fg.break {
		stroke: #22C55E;
	}

	.timer-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.timer-label {
		font-size: 10px;
		font-weight: 510;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		color: var(--text-secondary, #64748b);
		line-height: 1;
	}

	.timer-time {
		font-size: 26px;
		font-weight: 590;
		font-variant-numeric: tabular-nums;
		color: var(--text, #1a1a2e);
		line-height: 1.1;
		letter-spacing: -0.5px;
	}

	.timer-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 4px;
	}

	.timer-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: 1px solid var(--border, #E2E8F0);
		border-radius: 50%;
		background: var(--surface, #FFFFFF);
		color: var(--text, #1a1a2e);
		cursor: pointer;
		transition: all 0.15s ease;
		padding: 0;
		line-height: 1;
	}
	.timer-btn:hover {
		background: var(--surface-alt, #F1F5F9);
		border-color: var(--text-muted, #94a3b8);
	}
	.timer-btn:active {
		transform: scale(0.94);
	}

	.timer-btn--play {
		background: var(--accent, #4F46E5);
		border-color: var(--accent, #4F46E5);
		color: #fff;
	}
	.timer-btn--play:hover {
		background: var(--accent-hover, #4338CA);
		border-color: var(--accent-hover, #4338CA);
	}

	.timer-btn--reset {
		color: var(--text-secondary, #64748b);
	}

	.session-count {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 11px;
		color: var(--text-secondary, #64748b);
		font-weight: 400;
		line-height: 1;
	}

	.session-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent, #4F46E5);
		flex-shrink: 0;
	}
</style>
