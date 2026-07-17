<script lang="ts">
  import { flashcards } from '$lib/stores/flashcards.svelte';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let cards = $state<import('$lib/stores/flashcards.svelte').Flashcard[]>([]);
  let currentIndex = $state(0);
  let flipped = $state(false);
  let rated = $state(false);
  let isFinished = $state(false);
  let reviewCount = $state(0);
  let correctCount = $state(0);
  let streak = $state(0);
  let bestStreak = $state(0);
  let refreshKey = $state(0);
  let deckFilter = $state('');

  let currentCard = $derived(cards[currentIndex]);
  let totalCards = $derived(cards.length);
  let progressPct = $derived(totalCards > 0 ? Math.round((reviewCount / totalCards) * 100) : 0);
  let accuracy = $derived(reviewCount > 0 ? Math.round((correctCount / reviewCount) * 100) : 0);

  onMount(() => {
    // Check for deck filter in URL params
    const params = new URLSearchParams(window.location.search);
    deckFilter = params.get('deck') || '';

    if (deckFilter) {
      cards = flashcards.getCardsDueByDeck(deckFilter);
      if (cards.length === 0) {
        cards = flashcards.getCardsByDeck(deckFilter).sort(() => Math.random() - 0.5);
      }
    } else {
      cards = flashcards.getCardsDueToday();
      if (cards.length === 0) {
        cards = flashcards.getCards().sort(() => Math.random() - 0.5);
      }
    }
    if (cards.length === 0) {
      isFinished = true;
    }
  });

  function flipCard() {
    if (!rated) flipped = !flipped;
  }

  function rateCard(rating: 1 | 2 | 3 | 4) {
    if (!currentCard) return;
    flashcards.reviewCard(currentCard.id, rating);
    rated = true;
    reviewCount++;
    if (rating <= 2) {
      correctCount++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      streak = 0;
    }

    setTimeout(() => {
      if (currentIndex < totalCards - 1) {
        currentIndex++;
        flipped = false;
        rated = false;
      } else {
        isFinished = true;
      }
    }, 400);
  }

  function goBack() {
    goto('/flashcards');
  }

  function restartReview() {
    currentIndex = 0;
    flipped = false;
    rated = false;
    isFinished = false;
    reviewCount = 0;
    correctCount = 0;
    streak = 0;
    cards = [...cards].sort(() => Math.random() - 0.5);
  }
</script>

<div class="page">
  {#if isFinished}
    <!-- End Screen -->
    <div class="end-screen">
      <div class="confetti">🎉</div>
      <h1>Review Selesai!</h1>
      <p class="end-subtitle">Kamu telah mereview {reviewCount} kartu</p>

      <div class="end-stats">
        <div class="end-stat">
          <span class="end-stat-value">{correctCount}/{reviewCount}</span>
          <span class="end-stat-label">Benar</span>
        </div>
        <div class="end-stat">
          <span class="end-stat-value">{accuracy}%</span>
          <span class="end-stat-label">Akurasi</span>
        </div>
        <div class="end-stat">
          <span class="end-stat-value">🔥 {bestStreak}</span>
          <span class="end-stat-label">Streak Terbaik</span>
        </div>
      </div>

      <div class="end-actions">
        {#if cards.length > 0}
          <button class="btn secondary big" onclick={restartReview}>
            🔄 Review Lagi
          </button>
        {/if}
        <button class="btn primary big" onclick={goBack}>
          ↩️ Kembali ke Dashboard
        </button>
      </div>
    </div>
  {:else if currentCard}
    <!-- Header -->
    <div class="review-header">
      {#if deckFilter}
        <span class="deck-label">📂 {deckFilter}</span>
      {/if}
      <span class="streak-display">🔥 {streak}</span>
    </div>

    <!-- Progress bar -->
    <div class="progress-bar-wrap">
      <div class="progress-bar" style="width: {progressPct}%"></div>
      <span class="progress-label">{Math.min(currentIndex + 1, totalCards)}/{totalCards}</span>
    </div>

    <!-- Card -->
    <div class="card-container" onclick={flipCard} role="button" tabindex="0"
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') flipCard(); }}>
      <div class="card" class:flipped>
        <div class="card-face front">
          <div class="card-content">
            <span class="card-label">Pertanyaan</span>
            <p class="card-text">{currentCard.front}</p>
          </div>
          <div class="card-hint">Klik untuk lihat jawaban</div>
        </div>
        <div class="card-face back">
          <div class="card-content">
            <span class="card-label">Jawaban</span>
            <p class="card-text">{currentCard.back}</p>
          </div>
          {#if !rated}
            <div class="card-hint">Klik untuk balik lagi</div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Rating Buttons (shown after flip) -->
    {#if flipped && !rated}
      <div class="rating-section" transition:fade>
        <p class="rating-label">Seberapa mudah kartu ini?</p>
        <div class="rating-buttons">
          <button class="rating-btn very-easy" onclick={() => rateCard(1)}>
            <span class="r-icon">😊</span>
            <span class="r-text">Sangat Mudah</span>
            <span class="r-time">(1 hr)</span>
          </button>
          <button class="rating-btn easy" onclick={() => rateCard(2)}>
            <span class="r-icon">👍</span>
            <span class="r-text">Mudah</span>
            <span class="r-time">(1 hr)</span>
          </button>
          <button class="rating-btn medium" onclick={() => rateCard(3)}>
            <span class="r-icon">🤔</span>
            <span class="r-text">Sedang</span>
            <span class="r-time">(1 hr)</span>
          </button>
          <button class="rating-btn hard" onclick={() => rateCard(4)}>
            <span class="r-icon">😰</span>
            <span class="r-text">Sulit</span>
            <span class="r-time">(1 hr)</span>
          </button>
        </div>
      </div>
    {/if}
  {:else}
    <div class="empty-screen">
      <div class="empty-icon">📭</div>
      <h2>Tidak ada kartu</h2>
      <p>Buat flashcards dari modul terlebih dahulu.</p>
      <button class="btn primary big" onclick={goBack}>
        ↩️ Kembali
      </button>
    </div>
  {/if}
</div>

<style>
  .page {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 60vh;
    padding-top: 20px;
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .deck-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    background: var(--accent-dim);
    padding: 4px 10px;
    border-radius: 6px;
  }
  .streak-display {
    font-size: 14px;
    font-weight: 700;
    color: #f59e0b;
  }

  /* Progress Bar */
  .progress-bar-wrap {
    position: relative;
    height: 24px;
    background: var(--border);
    border-radius: 12px;
    margin-bottom: 24px;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), #a855f7);
    border-radius: 12px;
    transition: width 0.3s ease;
  }
  .progress-label {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  }

  /* Card Flip */
  .card-container {
    perspective: 1000px;
    margin-bottom: 24px;
    cursor: pointer;
  }
  .card {
    position: relative;
    width: 100%;
    min-height: 280px;
    transition: transform 0.5s ease;
    transform-style: preserve-3d;
  }
  .card.flipped { transform: rotateY(180deg); }

  .card-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    min-height: 280px;
  }
  .card-face.back {
    transform: rotateY(180deg);
    border-color: var(--accent);
    box-shadow: 0 4px 20px rgba(108, 92, 231, 0.15);
  }

  .card-content { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; }
  .card-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--accent);
    margin-bottom: 12px;
  }
  .card-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    text-align: center;
    line-height: 1.5;
    word-break: break-word;
  }
  .card-hint {
    font-size: 11px;
    color: var(--text-secondary);
    opacity: 0.6;
    margin-top: 20px;
  }

  /* Rating Buttons */
  .rating-section {
    text-align: center;
    margin-top: 8px;
  }
  .rating-label {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    font-weight: 500;
  }
  .rating-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .rating-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 14px 8px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
  }
  .rating-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .r-icon { font-size: 24px; }
  .r-text { font-size: 13px; font-weight: 600; color: var(--text); }
  .r-time { font-size: 11px; color: var(--text-secondary); }

  .rating-btn.very-easy:hover { border-color: #22c55e; background: rgba(34,197,94,0.08); }
  .rating-btn.easy:hover { border-color: #3b82f6; background: rgba(59,130,246,0.08); }
  .rating-btn.medium:hover { border-color: #f59e0b; background: rgba(245,158,11,0.08); }
  .rating-btn.hard:hover { border-color: #ef4444; background: rgba(239,68,68,0.08); }

  /* End Screen */
  .end-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 20px;
  }
  .confetti { font-size: 64px; margin-bottom: 16px; }
  .end-screen h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
  .end-subtitle { font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; }

  .end-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 28px;
  }
  .end-stat {
    text-align: center;
  }
  .end-stat-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--accent);
  }
  .end-stat-label {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .end-actions {
    width: 100%;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .btn {
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
  .btn.primary {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }
  .btn.primary:hover { opacity: 0.9; }
  .btn.secondary {
    border-color: var(--text-secondary);
    color: var(--text);
  }
  .btn.secondary:hover { border-color: var(--accent); }
  .btn.big { padding: 12px 24px; font-size: 15px; width: 100%; }

  /* Empty */
  .empty-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 8px;
  }
  .empty-icon { font-size: 48px; margin-bottom: 8px; }
  .empty-screen h2 { font-size: 18px; font-weight: 600; }
  .empty-screen p { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }

  @media (max-width: 768px) {
    .page {
      padding: 12px;
      padding-top: 16px;
    }
    .card-container {
      margin-bottom: 16px;
    }
    .card-face {
      padding: 24px 16px;
      min-height: 200px;
    }
    .card-text {
      font-size: 16px;
    }
    .rating-buttons {
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
  }
</style>
