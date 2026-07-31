<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user.svelte';
	import { pushXpGain } from '$lib/stores/xp-toast.svelte';
	import { fade, fly } from 'svelte/transition';

	interface QueueItem {
		id: string;
		block_id: string;
		question_ref: string | null;
		prompt: string;
		correct_answer: string;
		wrong_count: number;
		practiced_count: number;
	}

	let loading = $state(true);
	let loadError = $state('');
	let items = $state<QueueItem[]>([]);

	let currentIndex = $state(0);
	let answer = $state('');
	let checking = $state(false);
	let result = $state<'correct' | 'wrong' | null>(null);
	let masteredCount = $state(0);

	let confettiPieces = $state<{ x: number; color: string; delay: number; duration: number; size: number; rotation: number }[]>([]);
	let confettiTimer: ReturnType<typeof setTimeout> | null = null;
	let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

	let currentItem = $derived(items[currentIndex] || null);
	let progress = $derived(items.length > 0 ? ((currentIndex + (result !== null ? 1 : 0)) / items.length) * 100 : 0);
	let totalXp = $derived(masteredCount * 5);

	function normalize(s: string): string {
		return s
			.trim()
			.toLowerCase()
			.replace(/[.!?,']/g, '');
	}

	function dispatchConfetti() {
		const colors = ['#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#EC4899'];
		const pieces = [];
		for (let i = 0; i < 60; i++) {
			pieces.push({
				x: Math.random() * 100,
				color: colors[Math.floor(Math.random() * colors.length)],
				delay: Math.random() * 0.5,
				duration: 2 + Math.random() * 2,
				size: 4 + Math.random() * 6,
				rotation: Math.random() * 360
			});
		}
		confettiPieces = pieces;
		confettiTimer = setTimeout(() => {
			confettiPieces = [];
		}, 4000);
	}

	async function checkAnswer() {
		if (!currentItem || !answer.trim() || checking || result) return;
		checking = true;
		const isCorrect = normalize(answer) === normalize(currentItem.correct_answer);

		if (isCorrect) {
			result = 'correct';
			masteredCount++;
			pushXpGain(5);
			// Mark mastered
			try {
				await fetch('/api/practice/queue', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: currentItem.id })
				});
			} catch { /* offline — keep local progress */ }
			// Auto-advance after 1.2s
			autoAdvanceTimer = setTimeout(() => {
				next();
			}, 1200);
		} else {
			result = 'wrong';
			// Re-queue wrong answer (wrong_count++)
			try {
				await fetch('/api/practice/queue', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						blockId: currentItem.block_id,
						questionRef: currentItem.question_ref,
						prompt: currentItem.prompt,
						correctAnswer: currentItem.correct_answer
					})
				});
			} catch { /* offline */ }
		}
		checking = false;
	}

	function next() {
		if (currentIndex < items.length - 1) {
			currentIndex++;
			answer = '';
			result = null;
		} else {
			result = null;
			dispatchConfetti();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !result) {
			checkAnswer();
		}
	}

	onMount(() => {
		if (!user.isLoggedIn) {
			goto('/login');
			return;
		}
		loadQueue();
	});

	async function loadQueue() {
		loading = true;
		loadError = '';
		try {
			const res = await fetch('/api/practice/queue');
			const json = await res.json();
			if (json.success) {
				items = json.data || [];
			} else {
				loadError = json.error || 'Gagal memuat antrean latihan';
			}
		} catch {
			loadError = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	onDestroy(() => {
		if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
		if (confettiTimer) clearTimeout(confettiTimer);
	});
</script>

<svelte:head>
	<title>Latihan — RPL AI Curriculum</title>
</svelte:head>

<div class="practice-page">
	{#if loading}
		<!-- Loading skeleton -->
		<div class="skeleton-wrap">
			<div class="skeleton skeleton-bar"></div>
			<div class="skeleton skeleton-card">
				<div class="skeleton skeleton-line w-60"></div>
				<div class="skeleton skeleton-line w-80"></div>
				<div class="skeleton skeleton-line w-40"></div>
			</div>
		</div>
	{:else if loadError}
		<div class="state-card">
			<div class="state-emoji">😵</div>
			<h2>Ups, terjadi kesalahan</h2>
			<p class="state-desc">{loadError}</p>
			<button class="btn btn-primary" onclick={loadQueue}>Coba Lagi</button>
			<a href="/learn" class="back-link">← Kembali ke Belajar</a>
		</div>
	{:else if items.length === 0}
		<!-- Empty state -->
		<div class="state-card">
			<div class="state-emoji">🎉</div>
			<h2>Tidak ada soal untuk latihan 🎉</h2>
			<p class="state-desc">Selesaikan kuis dulu! Soal yang dijawab salah akan muncul di sini untuk kamu latih lagi.</p>
			<a href="/learn" class="btn btn-primary btn-link">← Kembali ke Belajar</a>
		</div>
	{:else if currentItem && result === null}
		<!-- Question card -->
		<div class="quiz-wrap">
			<div class="progress-container">
				<span class="progress-text">{currentIndex + 1}/{items.length}</span>
				<div class="progress-bar">
					<div class="progress-fill" style="width: {progress}%"></div>
				</div>
			</div>

			<div class="question-card" transition:fade={{ duration: 200 }}>
				<div class="card-top">
					<span class="badge-wrong">Salah {currentItem.wrong_count}x</span>
					{#if currentItem.question_ref}
						<span class="badge-ref">Soal #{currentItem.question_ref}</span>
					{/if}
				</div>
				<p class="question-text">{currentItem.prompt}</p>
			</div>

			<input
				class="answer-input"
				type="text"
				placeholder="Tulis jawabanmu..."
				bind:value={answer}
				onkeydown={handleKeydown}
				autocomplete="off"
				autocapitalize="off"
			/>

			<button
				class="btn btn-primary btn-check"
				onclick={checkAnswer}
				disabled={!answer.trim() || checking}
			>
				{checking ? 'Memeriksa...' : 'Cek Jawaban'}
			</button>
		</div>
	{:else if currentItem && result === 'correct'}
		<!-- Correct feedback -->
		<div class="quiz-wrap">
			<div class="progress-container">
				<span class="progress-text">{currentIndex + 1}/{items.length}</span>
				<div class="progress-bar">
					<div class="progress-fill" style="width: {progress}%"></div>
				</div>
			</div>

			<div class="question-card correct-flash" transition:fly={{ y: 10, duration: 200 }}>
				<div class="result-icon correct-icon">✓</div>
				<p class="result-text">Benar! +5 XP</p>
				<p class="result-sub">Jawaban: {currentItem.correct_answer}</p>
			</div>
		</div>
	{:else if currentItem && result === 'wrong'}
		<!-- Wrong feedback -->
		<div class="quiz-wrap">
			<div class="progress-container">
				<span class="progress-text">{currentIndex + 1}/{items.length}</span>
				<div class="progress-bar">
					<div class="progress-fill" style="width: {progress}%"></div>
				</div>
			</div>

			<div class="question-card wrong-flash" transition:fly={{ y: 10, duration: 200 }}>
				<div class="result-icon wrong-icon">✗</div>
				<p class="result-text">Belum tepat!</p>
				<p class="result-sub">Jawaban yang benar: <strong>{currentItem.correct_answer}</strong></p>
				<p class="result-hint">Soal ini akan muncul lagi sampai kamu benar.</p>
			</div>

			<button class="btn btn-primary btn-continue" onclick={next}>Lanjut</button>
		</div>
	{:else}
		<!-- Completion screen -->
		<div class="state-card complete-screen">
			{#if confettiPieces.length > 0}
				<div class="confetti-container">
					{#each confettiPieces as piece}
						<div
							class="confetti"
							style="
								left: {piece.x}%;
								background: {piece.color};
								animation-delay: {piece.delay}s;
								animation-duration: {piece.duration}s;
								width: {piece.size}px;
								height: {piece.size}px;
								transform: rotate({piece.rotation}deg);
							"
						></div>
					{/each}
				</div>
			{/if}

			<div class="trophy">🏆</div>
			<h2>Latihan Selesai!</h2>
			<p class="state-desc">Kamu berhasil menguasai {masteredCount} soal dan mengumpulkan {totalXp} XP!</p>
			<div class="complete-stats">
				<div class="stat">
					<span class="stat-value">{masteredCount}</span>
					<span class="stat-label">Dikuasai</span>
				</div>
				<div class="stat">
					<span class="stat-value success-text">+{totalXp}</span>
					<span class="stat-label">XP</span>
				</div>
			</div>
			<button class="btn btn-primary btn-big" onclick={() => goto('/learn')}>Kembali ke Belajar</button>
		</div>
	{/if}
</div>

<style>
	.practice-page {
		max-width: 600px;
		margin: 0 auto;
		padding: 32px 16px 64px;
		min-height: 70vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	/* ---------- Buttons (3D solid shadow, Duolingo style) ---------- */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 14px 32px;
		border: none;
		border-radius: 14px;
		font-size: 16px;
		font-weight: 700;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.15s ease;
		box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
		user-select: none;
		text-decoration: none;
	}
	.btn:active:not(:disabled) {
		transform: translateY(2px);
		box-shadow: 0 2px 0 rgba(0, 0, 0, 0.15);
	}
	.btn-primary {
		background: var(--accent, #4F46E5);
		color: #fff;
	}
	.btn-primary:hover:not(:disabled) {
		background: #4338CA;
		transform: translateY(-1px);
		box-shadow: 0 5px 0 rgba(0, 0, 0, 0.15);
	}
	.btn-primary:disabled {
		background: #C7D2FE;
		cursor: not-allowed;
		box-shadow: 0 4px 0 rgba(0, 0, 0, 0.08);
	}
	.btn-check { width: 100%; }
	.btn-continue { width: 100%; }
	.btn-big { font-size: 18px; padding: 16px 48px; }
	.btn-link { color: #fff; }

	/* ---------- Progress ---------- */
	.progress-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 20px;
	}
	.progress-text {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary, #94A3B8);
	}
	.progress-bar {
		height: 12px;
		background: rgba(0, 0, 0, 0.06);
		border-radius: 6px;
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		background: var(--accent, #4F46E5);
		border-radius: 6px;
		transition: width 0.3s ease;
	}

	/* ---------- Question card ---------- */
	.question-card {
		background: var(--surface, #fff);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: 16px;
		padding: 28px 24px;
		margin-bottom: 20px;
		text-align: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}
	.card-top {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}
	.badge-wrong {
		background: rgba(239, 68, 68, 0.1);
		color: var(--error, #EF4444);
		font-size: 12px;
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 10px;
	}
	.badge-ref {
		background: var(--accent-dim, rgba(79, 70, 229, 0.1));
		color: var(--accent, #4F46E5);
		font-size: 12px;
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 10px;
	}
	.question-text {
		font-size: 19px;
		font-weight: 600;
		color: var(--text, #0F172A);
		margin: 0;
		line-height: 1.55;
		text-align: center;
	}

	/* ---------- Answer input ---------- */
	.answer-input {
		width: 100%;
		padding: 16px 18px;
		font-size: 17px;
		font-family: inherit;
		color: var(--text, #0F172A);
		background: var(--surface, #fff);
		border: 2px solid var(--border, #E2E8F0);
		border-radius: 14px;
		margin-bottom: 20px;
		box-sizing: border-box;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.answer-input:focus {
		outline: none;
		border-color: var(--accent, #4F46E5);
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
	}

	/* ---------- Result feedback ---------- */
	.result-icon {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30px;
		font-weight: 800;
		margin: 0 auto 14px;
	}
	.correct-icon {
		background: rgba(34, 197, 94, 0.12);
		color: var(--success, #22C55E);
	}
	.wrong-icon {
		background: rgba(239, 68, 68, 0.12);
		color: var(--error, #EF4444);
	}
	.result-text {
		font-size: 22px;
		font-weight: 800;
		color: var(--text, #0F172A);
		margin: 0 0 8px;
	}
	.result-sub {
		font-size: 15px;
		color: var(--text-secondary, #64748B);
		margin: 0 0 4px;
	}
	.result-hint {
		font-size: 13px;
		color: var(--text-secondary, #94A3B8);
		margin: 12px 0 0;
		font-style: italic;
	}
	.correct-flash {
		border-color: rgba(34, 197, 94, 0.5);
		background: rgba(34, 197, 94, 0.06);
		animation: pop 0.35s ease;
	}
	.wrong-flash {
		border-color: rgba(239, 68, 68, 0.5);
		background: rgba(239, 68, 68, 0.05);
		animation: shake 0.4s ease;
	}

	@keyframes pop {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.03); }
	}
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		20%, 60% { transform: translateX(-6px); }
		40%, 80% { transform: translateX(6px); }
	}

	/* ---------- State cards (empty / error / complete) ---------- */
	.state-card {
		background: var(--surface, #fff);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: 20px;
		padding: 48px 32px;
		text-align: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
		position: relative;
		overflow: hidden;
	}
	.state-emoji {
		font-size: 64px;
		margin-bottom: 16px;
		animation: bounce 1.2s ease infinite;
	}
	.state-card h2 {
		font-size: 24px;
		font-weight: 800;
		color: var(--text, #0F172A);
		margin: 0 0 10px;
	}
	.state-desc {
		font-size: 15px;
		color: var(--text-secondary, #64748B);
		margin: 0 0 24px;
		line-height: 1.6;
	}
	.back-link {
		display: inline-block;
		margin-top: 16px;
		font-size: 14px;
		font-weight: 600;
		color: var(--text-secondary, #64748B);
		text-decoration: none;
	}
	.back-link:hover { color: var(--accent, #4F46E5); }

	/* ---------- Completion ---------- */
	.complete-screen { overflow: hidden; }
	.trophy {
		font-size: 72px;
		margin-bottom: 20px;
		animation: bounce 1s ease infinite;
	}
	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}
	.complete-stats {
		display: flex;
		justify-content: center;
		gap: 40px;
		margin-bottom: 32px;
	}
	.stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.stat-value {
		font-size: 32px;
		font-weight: 800;
		color: var(--text, #0F172A);
	}
	.success-text { color: var(--success, #22C55E); }
	.stat-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary, #94A3B8);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* ---------- Confetti ---------- */
	.confetti-container {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 10;
	}
	.confetti {
		position: absolute;
		top: -20px;
		border-radius: 2px;
		opacity: 0;
		animation: confetti-fall linear forwards;
	}
	@keyframes confetti-fall {
		0% { opacity: 1; transform: translateY(0) rotate(0deg); }
		100% { opacity: 0; transform: translateY(400px) rotate(720deg); }
	}

	/* ---------- Skeleton ---------- */
	.skeleton-wrap {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.skeleton {
		background: linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.09) 50%, rgba(0,0,0,0.05) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.4s infinite;
		border-radius: 8px;
	}
	.skeleton-bar { height: 12px; }
	.skeleton-card {
		background: var(--surface, #fff);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: 16px;
		padding: 28px 24px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.skeleton-line { height: 16px; }
	.w-60 { width: 60%; }
	.w-80 { width: 80%; }
	.w-40 { width: 40%; }
	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
</style>
