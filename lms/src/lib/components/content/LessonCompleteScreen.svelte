<script lang="ts">
	import { onMount } from 'svelte';

	let {
		score,
		total,
		xpEarned,
		onContinue
	}: {
		score: number;
		total: number;
		xpEarned: number;
		onContinue: () => void;
	} = $props();

	// CSS-only confetti pieces, generated on mount (SSR-safe)
	let pieces = $state<
		{
			left: number;
			delay: number;
			duration: number;
			color: string;
			width: number;
			height: number;
			drift: number;
			rot: number;
		}[]
	>([]);

	onMount(() => {
		const colors = ['#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6'];
		pieces = Array.from({ length: 30 }, (_, i) => {
			const size = 7 + Math.random() * 7;
			return {
				left: Math.random() * 100,
				delay: Math.random() * 1.2,
				duration: 2.8 + Math.random() * 2.2,
				color: colors[i % colors.length],
				width: size,
				height: size * 0.45,
				drift: (Math.random() - 0.5) * 200,
				rot: (Math.random() - 0.5) * 540
			};
		});
	});

	// XP counter: 0 -> xpEarned over ~1s with ease-out
	let displayedXp = $state(0);

	$effect(() => {
		const target = Math.max(0, xpEarned);
		const duration = 1000;
		const start = performance.now();
		let raf: number;
		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			const eased = 1 - Math.pow(1 - t, 3);
			displayedXp = Math.round(target * eased);
			if (t < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	// Stars: 3 if >= 90%, 2 if >= 60%, else 1 (no quiz data -> 3)
	const stars = $derived(total > 0 ? (score / total >= 0.9 ? 3 : score / total >= 0.6 ? 2 : 1) : 3);
	const starList = $derived([1, 2, 3]);
</script>

<div class="completion-overlay" role="dialog" aria-modal="true" aria-label="Pelajaran Selesai">
	<div class="confetti-layer" aria-hidden="true">
		{#each pieces as piece}
			<span
				class="confetti-piece"
				style="left: {piece.left}%; width: {piece.width}px; height: {piece.height}px; background: {piece.color}; --drift: {piece.drift}px; --rot: {piece.rot}deg; animation-delay: {piece.delay}s; animation-duration: {piece.duration}s;"
			></span>
		{/each}
	</div>

	<div class="celebration-card">
		<div class="trophy">🏆</div>

		<h2 class="title">Pelajaran Selesai!</h2>

		<div class="stars">
			{#each starList as star}
				<span class="star" class:lit={star <= stars} style="animation-delay: {0.15 * star}s">⭐</span>
			{/each}
		</div>

		<p class="score">
			Skor kamu: <strong>{score}/{total}</strong>
		</p>

		<div class="xp-badge">
			<span class="xp-plus">+</span>
			<span class="xp-amount">{displayedXp}</span>
			<span class="xp-label">XP</span>
		</div>

		<p class="streak-text">Pertahankan streak belajarmu! 🔥</p>

		<button class="continue-btn" onclick={onContinue}>Lanjut</button>
	</div>
</div>

<style>
	.completion-overlay {
		position: fixed;
		inset: 0;
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(15, 23, 42, 0.55);
		backdrop-filter: blur(4px);
		padding: 20px;
		animation: overlay-in 0.25s ease both;
		overflow: hidden;
	}

	.confetti-layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.confetti-piece {
		position: absolute;
		top: -20px;
		border-radius: 2px;
		opacity: 0;
		animation-name: confetti-fall;
		animation-timing-function: ease-in;
		animation-fill-mode: forwards;
	}

	@keyframes confetti-fall {
		0% {
			transform: translate3d(0, -5vh, 0) rotate(0deg);
			opacity: 1;
		}
		100% {
			transform: translate3d(var(--drift), 115vh, 0) rotate(var(--rot));
			opacity: 0.85;
		}
	}

	.celebration-card {
		position: relative;
		width: 100%;
		max-width: 420px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 24px;
		padding: 40px 32px 32px;
		text-align: center;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
		animation: card-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}

	@keyframes card-pop {
		0% {
			transform: scale(0.7) translateY(30px);
			opacity: 0;
		}
		100% {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}

	.trophy {
		font-size: 64px;
		line-height: 1;
		margin-bottom: 12px;
		animation: trophy-bounce 1.2s ease-in-out 0.3s both;
	}

	@keyframes trophy-bounce {
		0% {
			transform: scale(0);
		}
		55% {
			transform: scale(1.25);
		}
		100% {
			transform: scale(1);
		}
	}

	.title {
		font-size: 26px;
		font-weight: 800;
		color: var(--text);
		margin: 0 0 10px;
	}

	.stars {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 14px;
	}

	.star {
		font-size: 32px;
		filter: grayscale(1) opacity(0.35);
		transform: scale(0.6);
		animation: star-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}

	.star.lit {
		filter: none;
	}

	@keyframes star-pop {
		0% {
			transform: scale(0);
		}
		100% {
			transform: scale(1);
		}
	}

	.score {
		font-size: 15px;
		color: var(--text-secondary);
		margin: 0 0 16px;
	}

	.score strong {
		color: var(--text);
		font-weight: 700;
	}

	.xp-badge {
		display: inline-flex;
		align-items: baseline;
		gap: 2px;
		background: var(--success-light);
		color: #15803d;
		border: 1px solid rgba(34, 197, 94, 0.35);
		border-radius: var(--radius-full);
		padding: 8px 22px;
		margin-bottom: 16px;
		font-weight: 800;
		animation: xp-pulse 1s ease-in-out 0.6s both;
	}

	@keyframes xp-pulse {
		0% {
			transform: scale(1);
		}
		40% {
			transform: scale(1.15);
		}
		100% {
			transform: scale(1);
		}
	}

	.xp-plus {
		font-size: 18px;
	}

	.xp-amount {
		font-size: 30px;
		font-variant-numeric: tabular-nums;
		min-width: 2ch;
		text-align: right;
	}

	.xp-label {
		font-size: 16px;
	}

	.streak-text {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0 0 24px;
	}

	.continue-btn {
		display: inline-block;
		width: 100%;
		background: var(--success);
		color: #ffffff;
		border: none;
		border-radius: 14px;
		padding: 14px 24px;
		font-size: 16px;
		font-weight: 700;
		font-family: inherit;
		cursor: pointer;
		box-shadow: var(--shadow-3d-success);
		transition: transform 0.08s ease, box-shadow 0.08s ease, filter 0.15s ease;
	}

	.continue-btn:hover {
		filter: brightness(1.05);
	}

	.continue-btn:active {
		transform: translateY(2px);
		box-shadow: 0 2px 0 #15803d;
	}

	@keyframes overlay-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
