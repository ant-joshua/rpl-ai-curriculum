<script lang="ts">
	import { t } from '$lib/stores/i18n';
	import { browser } from '$app/environment';
	import { flashcards, type Flashcard } from '$lib/stores/flashcards.svelte';
	import { modules } from '$lib/stores/modules';
	import { Button, EmptyState, Skeleton } from '$lib/components/ui';
	import { fade } from 'svelte/transition';

	let cards = $state<Flashcard[]>([]);
	let decks = $state<{ slug: string; title: string; count: number }[]>([]);
	let loading = $state(true);
	let currentIndex = $state(0);
	let flipped = $state(false);
	let selectedDeck = $state<string>('all');
	let sideBarOpen = $state(true);

	$effect(() => {
		if (browser) {
			loadData();
			loading = false;
		}
	});

	function loadData() {
		const deckList = (flashcards as any).getDecks();
		decks = deckList.map((d: any) => ({
			slug: d.slug,
			title: d.title,
			count: d.cardCount,
		}));
		const store = (flashcards as any);
		if (selectedDeck === 'all') {
			cards = store.getCardsDueToday();
		} else if (selectedDeck === 'new') {
			cards = store.getCards().filter((c: Flashcard) => c.repetitions === 0);
		} else if (selectedDeck) {
			cards = store.getCardsDueByDeck(selectedDeck);
		} else {
			cards = store.getCardsDueToday();
		}
		if (cards.length > 0 && currentIndex >= cards.length) {
			currentIndex = 0;
		}
	}

	function selectDeck(slug: string) {
		selectedDeck = slug;
		flipped = false;
		currentIndex = 0;
		loadData();
	}

	let currentCard = $derived(cards[currentIndex] || null);

	let cardCounts = $derived.by(() => {
		if (!browser) return { total: 0, dueToday: 0, known: 0, learning: 0, newCards: 0, decks: 0 };
		return (flashcards as any).getCardCounts();
	});

	let total = $derived(cards.length);

	function handleFlip() {
		flipped = !flipped;
	}

	function handleRating(rating: 1 | 2 | 3 | 4) {
		if (!currentCard) return;
		flipped = false;
		(flashcards as any).reviewCard(currentCard.id, rating);
		if (currentIndex < cards.length - 1) {
			currentIndex++;
		} else {
			// Reached end, reload to get fresh due cards
			loadData();
			currentIndex = 0;
		}
	}

	function handleNext() {
		if (currentIndex < cards.length - 1) {
			currentIndex++;
			flipped = false;
		}
	}

	function handlePrev() {
		if (currentIndex > 0) {
			currentIndex--;
			flipped = false;
		}
	}

	function handleShuffle() {
		cards = [...cards].sort(() => Math.random() - 0.5);
		currentIndex = 0;
		flipped = false;
	}

	function formatDifficulty(d: string): string {
		const map: Record<string, string> = {
			easy: 'Mudah',
			medium: 'Sedang',
			hard: 'Sulit',
		};
		return map[d] || d;
	}

	let progressPercent = $derived(total > 0 ? Math.round((currentIndex / total) * 100) : 0);
</script>

<svelte:head>
	<title>Flashcards — RPL AI Curriculum</title>
</svelte:head>

<div class="flashcards-page">
	<header class="page-header">
		<h1>🃏 Flashcards</h1>
		<p class="page-desc">Kartu belajar dengan spaced repetition. Balik kartu dan nilai pemahamanmu.</p>
	</header>

	{#if loading}
		<div class="skeleton-wrapper">
			<div style="display:flex;gap:16px">
				<div style="width:220px">
					<Skeleton variant="card" />
				</div>
				<div style="flex:1">
					<Skeleton variant="card" />
				</div>
			</div>
		</div>
	{:else if cards.length === 0}
		<EmptyState
			icon="🃏"
			title="Belum ada kartu"
			description="Generate flashcards dari modul atau import dari quiz untuk mulai belajar."
		/>
	{:else}
		<div class="layout">
			<!-- Sidebar -->
			<aside class="sidebar" class:hidden={!sideBarOpen}>
				<div class="sidebar-header">
					<h3>Deck</h3>
					<Button variant="ghost" size="sm" class="close-sidebar" onclick={() => sideBarOpen = false}>&times;</Button>
				</div>

				<div class="deck-list">
					<Button
						variant="ghost"
						class="deck-item {selectedDeck === 'all' ? 'active' : ''}"
						onclick={() => selectDeck('all')}
					>
						<span class="deck-icon">📚</span>
						<span>Semua Kartu</span>
						<span class="deck-count">{cardCounts.total}</span>
					</Button>
					<Button
						variant="ghost"
						class="deck-item {selectedDeck === 'new' ? 'active' : ''}"
						onclick={() => selectDeck('new')}
					>
						<span class="deck-icon">🆕</span>
						<span>Kartu Baru</span>
						<span class="deck-count">{cardCounts.newCards}</span>
					</Button>
					{#each decks as deck}
						<Button
							variant="ghost"
							class="deck-item {selectedDeck === deck.slug ? 'active' : ''}"
							onclick={() => selectDeck(deck.slug)}
						>
							<span class="deck-icon">📦</span>
							<span class="deck-title">{deck.title}</span>
							<span class="deck-count">{deck.count}</span>
						</Button>
					{/each}
				</div>

				<div class="sidebar-stats">
					<div class="stat-row">
						<span>Total</span>
						<span>{cardCounts.total}</span>
					</div>
					<div class="stat-row">
						<span>Hari ini</span>
						<span>{cardCounts.dueToday}</span>
					</div>
					<div class="stat-row">
						<span>Diketahui</span>
						<span>{cardCounts.known}</span>
					</div>
					<div class="stat-row">
						<span>Diproses</span>
						<span>{cardCounts.learning}</span>
					</div>
				</div>
			</aside>

			<!-- Main area -->
			<main class="main-area">
				<!-- Progress bar -->
				<div class="progress-row">
					<Button variant="ghost" size="sm" class="toggle-sidebar" onclick={() => sideBarOpen = !sideBarOpen}>
						{sideBarOpen ? '◀' : '▶'}
					</Button>
					<div class="progress-info">
						<span>{currentIndex + 1}/{total} kartu</span>
						<span class="progress-pct">{progressPercent}%</span>
					</div>
					<div class="progress-bar-track">
						<div class="progress-bar-fill" style="width: {progressPercent}%"></div>
					</div>
					<div class="progress-actions">
						<Button variant="outline" size="sm" class="action-btn" onclick={handleShuffle} title="Acak">
							🔀
						</Button>
					</div>
				</div>

				<!-- Card -->
				{#if currentCard}
					<div class="card-area" in:fade={{ duration: 200 }}>
						<Button
							variant="ghost"
							class="flashcard flip-card {flipped ? 'flipped' : ''}"
							onclick={handleFlip}
							tabindex={0}
							onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFlip(); } }}
						>
							<div class="flip-inner">
								<div class="flip-front">
									<div class="card-content">
										<p class="card-question">{currentCard.front}</p>
										<span class="flip-hint">Klik untuk balik</span>
									</div>
								</div>
								<div class="flip-back">
									<div class="card-content">
										<p class="card-answer">{currentCard.back}</p>
										<div class="card-tags">
											{#if currentCard.moduleSlug}
												<span class="card-tag module-tag">
													📦 {modules.find(m => m.slug === currentCard.moduleSlug)?.title || currentCard.moduleSlug}
												</span>
											{/if}
											<span class="card-tag difficulty-tag">{formatDifficulty(currentCard.difficulty)}</span>
											{#if currentCard.repetitions > 0}
												<span class="card-tag">Ulang ke-{currentCard.repetitions}</span>
											{/if}
										</div>
									</div>
								</div>
							</div>
						</Button>
					</div>

					<!-- Rating buttons (shown when flipped) -->
					{#if flipped}
						<div class="rating-row" in:fade={{ duration: 200 }}>
							<Button
								variant="outline"
								class="rating-btn btn-again"
								onclick={() => handleRating(4)}
							>
								<span class="rating-emoji">🔄</span>
								<span class="rating-label">Sulit</span>
							</Button>
							<Button
								variant="outline"
								class="rating-btn btn-hard"
								onclick={() => handleRating(3)}
							>
								<span class="rating-emoji">🤔</span>
								<span class="rating-label">Sedang</span>
							</Button>
							<Button
								variant="outline"
								class="rating-btn btn-good"
								onclick={() => handleRating(2)}
							>
								<span class="rating-emoji">✅</span>
								<span class="rating-label">Mudah</span>
							</Button>
							<Button
								variant="outline"
								class="rating-btn btn-easy"
								onclick={() => handleRating(1)}
							>
								<span class="rating-emoji">⚡</span>
								<span class="rating-label">Sangat Mudah</span>
							</Button>
						</div>
					{/if}

					<!-- Navigation -->
					<div class="nav-row">
						<Button
							variant="outline"
							class="nav-btn"
							disabled={currentIndex === 0}
							onclick={handlePrev}
						>◀ Sebelumnya</Button>
						<Button
							variant="outline"
							class="nav-btn"
							disabled={currentIndex >= total - 1}
							onclick={handleNext}
						>Berikutnya ▶</Button>
					</div>
				{/if}
			</main>
		</div>
	{/if}
</div>

<style>
	.flashcards-page {
		max-width: 1100px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 24px;
	}

	.page-header h1 {
		font-size: 28px;
		font-weight: 800;
		margin-bottom: 4px;
	}

	.page-desc {
		font-size: 14px;
		color: var(--text-secondary);
	}

	.skeleton-wrapper {
		padding: 40px 0;
	}

	/* Layout */
	.layout {
		display: flex;
		gap: 20px;
		align-items: flex-start;
	}

	/* Sidebar */
	.sidebar {
		width: 240px;
		min-width: 240px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
		position: sticky;
		top: 24px;
		transition: all 0.2s;
	}

	.sidebar.hidden {
		display: none;
	}

	.sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.sidebar-header h3 {
		font-size: 14px;
		font-weight: 600;
		margin: 0;
	}

	:global(.close-sidebar) {
		background: none !important;
		border: none !important;
		font-size: 20px;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 0 !important;
		line-height: 1;
		min-height: auto !important;
	}

	.deck-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-bottom: 16px;
	}

	:global(.deck-item) {
		display: flex !important;
		align-items: center;
		gap: 8px;
		padding: 8px 10px !important;
		border-radius: 8px !important;
		border: none !important;
		background: transparent !important;
		color: var(--text-secondary);
		font-size: 13px;
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition: all 0.15s;
		min-height: auto !important;
	}

	:global(.deck-item:hover) {
		background: var(--hover) !important;
		color: var(--text);
	}

	:global(.deck-item.active) {
		background: var(--accent-dim) !important;
		color: var(--accent);
		font-weight: 600;
	}

	.deck-icon {
		font-size: 16px;
	}

	.deck-title {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.deck-count {
		font-size: 11px;
		background: var(--bg-secondary);
		padding: 1px 6px;
		border-radius: 10px;
		color: var(--text-secondary);
	}

	:global(.deck-item.active) .deck-count {
		background: var(--accent);
		color: white;
	}

	.sidebar-stats {
		border-top: 1px solid var(--border);
		padding-top: 12px;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		padding: 4px 0;
		color: var(--text-secondary);
	}

	/* Main area */
	.main-area {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	/* Progress */
	.progress-row {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	:global(.toggle-sidebar) {
		background: none !important;
		border: 1px solid var(--border) !important;
		border-radius: 6px !important;
		padding: 4px 8px !important;
		cursor: pointer;
		font-size: 12px;
		color: var(--text-secondary);
		min-height: auto !important;
	}

	:global(.toggle-sidebar:hover) {
		background: var(--hover) !important;
	}

	.progress-info {
		font-size: 13px;
		color: var(--text-secondary);
		white-space: nowrap;
		display: flex;
		gap: 6px;
	}

	.progress-pct {
		color: var(--accent);
		font-weight: 600;
	}

	.progress-bar-track {
		flex: 1;
		height: 6px;
		background: var(--bg-secondary);
		border-radius: 99px;
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 99px;
		transition: width 0.3s ease;
	}

	.progress-actions {
		display: flex;
		gap: 4px;
	}

	:global(.action-btn) {
		background: none !important;
		border: 1px solid var(--border) !important;
		border-radius: 6px !important;
		padding: 4px 8px !important;
		cursor: pointer;
		font-size: 14px;
		transition: all 0.15s;
		min-height: auto !important;
	}

	:global(.action-btn:hover) {
		background: var(--hover) !important;
		border-color: var(--accent) !important;
	}

	/* Flashcard */
	.card-area {
		width: 100%;
		max-width: 520px;
		perspective: 1000px;
	}

	:global(.flashcard) {
		width: 100%;
		min-height: 280px;
		cursor: pointer;
		background: transparent !important;
		border: none !important;
		padding: 0 !important;
	}

	.flip-inner {
		position: relative;
		width: 100%;
		min-height: 280px;
		transition: transform 0.5s ease;
		transform-style: preserve-3d;
	}

	:global(.flashcard.flipped) .flip-inner {
		transform: rotateY(180deg);
	}

	.flip-front, .flip-back {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		border-radius: 16px;
		border: 1px solid var(--border);
		background: var(--surface);
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 280px;
	}

	.flip-back {
		transform: rotateY(180deg);
	}

	.card-content {
		padding: 32px 28px;
		text-align: center;
		width: 100%;
	}

	.card-question {
		font-size: 18px;
		font-weight: 600;
		line-height: 1.5;
		margin: 0;
		color: var(--text);
	}

	.card-answer {
		font-size: 18px;
		font-weight: 500;
		line-height: 1.6;
		margin: 0;
		color: var(--accent);
	}

	.flip-hint {
		display: block;
		margin-top: 24px;
		font-size: 12px;
		color: var(--text-secondary);
		opacity: 0.6;
	}

	.card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		justify-content: center;
		margin-top: 20px;
	}

	.card-tag {
		font-size: 11px;
		padding: 3px 10px;
		border-radius: 20px;
		background: var(--bg-secondary);
		color: var(--text-secondary);
	}

	.module-tag {
		background: var(--accent-dim);
		color: var(--accent);
	}

	.difficulty-tag {
		background: rgba(245, 158, 11, 0.15);
		color: var(--warning);
	}

	/* Rating buttons */
	.rating-row {
		display: flex;
		gap: 10px;
		width: 100%;
		max-width: 520px;
	}

	:global(.rating-btn) {
		flex: 1 !important;
		display: flex !important;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 12px 8px !important;
		border-radius: 12px !important;
		border: 1px solid var(--border) !important;
		background: var(--surface) !important;
		cursor: pointer;
		transition: all 0.15s ease;
		min-height: auto !important;
	}

	:global(.rating-btn:hover) {
		transform: translateY(-2px);
		box-shadow: none;
	}

	.rating-emoji {
		font-size: 24px;
	}

	.rating-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	:global(.btn-again:hover) {
		border-color: var(--danger) !important;
		background: rgba(239, 68, 68, 0.08) !important;
	}

	:global(.btn-hard:hover) {
		border-color: var(--warning) !important;
		background: rgba(245, 158, 11, 0.08) !important;
	}

	:global(.btn-good:hover) {
		border-color: var(--accent) !important;
		background: rgba(59, 130, 246, 0.08) !important;
	}

	:global(.btn-easy:hover) {
		border-color: var(--success) !important;
		background: rgba(16, 185, 129, 0.08) !important;
	}

	/* Navigation */
	.nav-row {
		display: flex;
		gap: 12px;
		width: 100%;
		max-width: 520px;
		justify-content: space-between;
	}

	:global(.nav-btn) {
		padding: 8px 16px !important;
		border: 1px solid var(--border) !important;
		border-radius: 8px !important;
		background: var(--surface) !important;
		color: var(--text-secondary);
		font-size: 13px;
		cursor: pointer;
		transition: all 0.15s;
		min-height: auto !important;
	}

	:global(.nav-btn:hover:not(:disabled)) {
		background: var(--hover) !important;
		border-color: var(--accent) !important;
		color: var(--text);
	}

	:global(.nav-btn:disabled) {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.layout {
			flex-direction: column;
		}
		.sidebar {
			width: 100%;
			min-width: 100%;
			position: static;
		}
		.sidebar.hidden {
			display: none;
		}
		.card-question, .card-answer {
			font-size: 16px;
		}
		.rating-row {
			flex-wrap: wrap;
		}
		:global(.rating-btn) {
			min-width: calc(50% - 6px);
		}
	}
</style>
