<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { user } from '$lib/stores/user.svelte';
  import { progress } from '$lib/stores/progress.svelte';
  import { modules } from '$lib/stores/modules';

  let { data } = $props();

  let questions = $state(data.questions);
  let blockId = $state(data.blockId);
  let errorMsg = $state(data.error);
  let currentIndex = $state(0);
  let selectedOption = $state<number | null>(null);
  let answered = $state(false);
  let finished = $state(false);
  let score = $state(0);
  let timeLeft = $state(300);
  let timerActive = $state(true);
  let passed = $state(false);
  let results = $state<{ question: string; answer: string; correct: string; isCorrect: boolean }[]>([]);

  // Try tracking
  let tries = $state(0);
  let bestScore = $state(0);
  let bestPct = $state(0);

  let timer: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    if (!user.isLoggedIn) {
      goto('/login');
    }
    // Load try history from localStorage
    if (typeof localStorage !== 'undefined') {
      const tryKey = `progquiz-tries-${blockId}`;
      const bestKey = `progquiz-best-${blockId}`;
      tries = parseInt(localStorage.getItem(tryKey) || '0', 10);
      bestScore = parseInt(localStorage.getItem(bestKey) || '0', 10);
      if (bestScore > 0 && questions.length > 0) {
        bestPct = Math.round((bestScore / questions.length) * 100);
      }
    }

    timer = setInterval(() => {
      if (timeLeft > 0 && !finished) {
        timeLeft--;
      } else if (timeLeft <= 0 && !finished) {
        finishQuiz();
      }
    }, 1000);
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });

  let currentQuestion = $derived(questions[currentIndex]);
  let progressPct = $derived(questions.length > 0 ? ((currentIndex + (answered ? 1 : 0)) / questions.length) * 100 : 0);

  const PASS_THRESHOLD = 0.7;

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function selectOption(index: number) {
    if (answered) return;
    selectedOption = index;
  }

  function checkAnswer() {
    if (selectedOption === null || answered) return;
    answered = true;
    if (selectedOption === currentQuestion.correctIndex) {
      score++;
    }
  }

  function nextQuestion() {
    results.push({
      question: currentQuestion.question,
      answer: currentQuestion.options[selectedOption ?? 0],
      correct: currentQuestion.options[currentQuestion.correctIndex],
      isCorrect: selectedOption === currentQuestion.correctIndex,
    });
    if (currentIndex < questions.length - 1) {
      currentIndex++;
      selectedOption = null;
      answered = false;
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    timerActive = false;
    if (timer) clearInterval(timer);
    if (!finished && selectedOption !== null && currentQuestion) {
      results.push({
        question: currentQuestion.question,
        answer: currentQuestion.options[selectedOption] || '—',
        correct: currentQuestion.options[currentQuestion.correctIndex],
        isCorrect: selectedOption === currentQuestion.correctIndex,
      });
    }
    passed = score / questions.length >= PASS_THRESHOLD;
    finished = true;

    // Save try history
    tries++;
    if (typeof localStorage !== 'undefined') {
      const tryKey = `progquiz-tries-${blockId}`;
      const bestKey = `progquiz-best-${blockId}`;
      localStorage.setItem(tryKey, tries.toString());
      const prevBest = parseInt(localStorage.getItem(bestKey) || '0', 10);
      if (score > prevBest) {
        localStorage.setItem(bestKey, score.toString());
      }
      bestScore = Math.max(score, prevBest);
      if (questions.length > 0) {
        bestPct = Math.round((bestScore / questions.length) * 100);
      }
    }
  }
</script>

<div class="progress-quiz-page">
  {#if errorMsg}
    <div class="error-state">
      <p>{errorMsg}</p>
      <button class="btn-secondary" onclick={() => goto('/progress-quiz')}>Kembali</button>
    </div>
  {:else if finished}
    <div class="result-card">
      <div class="result-icon">{passed ? '🎉' : '💪'}</div>
      <h2>Progress Quiz — Blok {blockId + 1}</h2>
      <div class="score-display">
        <span class="score-num">{score}</span>
        <span class="score-sep">/</span>
        <span class="score-total">{questions.length}</span>
      </div>
      <p class="score-pct">
        {Math.round((score / questions.length) * 100)}% benar
      </p>
      {#if passed}
        <p class="pass-msg">✅ Lulus! Minimal 70% tercapai.</p>
      {:else}
        <p class="fail-msg">❌ Belum lulus. Minimal 70% diperlukan.</p>
      {/if}

      <div class="try-info">
        <span class="try-badge">Percobaan ke-{tries}</span>
        {#if bestScore > 0}
          <span class="try-badge best">Skor terbaik: {bestScore}/{questions.length} ({bestPct}%)</span>
        {/if}
      </div>

      <div class="results-list">
        {#each results as r, i}
          <div class="result-item" class:correct={r.isCorrect} class:wrong={!r.isCorrect}>
            <div class="result-q">{i + 1}. {r.question}</div>
            <div class="result-detail">
              <span class="result-your">Jawabanmu: {r.answer}</span>
              {#if !r.isCorrect}
                <span class="result-correct">Benar: {r.correct}</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <div class="result-actions">
        <button class="btn-secondary" onclick={() => goto(`/progress-quiz/${blockId}`)}>🔄 Ulang Quiz</button>
        <button class="btn-primary" onclick={() => goto('/progress-quiz')}>📋 Kembali ke Daftar</button>
      </div>
    </div>
  {:else if currentQuestion}
    <div class="quiz-header">
      <h1>📊 Progress Quiz — Blok {blockId + 1}</h1>
      <div class="timer" class:timer-warning={timeLeft <= 60}>
        ⏱ {formatTime(timeLeft)}
      </div>
    </div>

    <div class="quiz-progress-bar">
      <div class="quiz-progress-fill" style="width: {progressPct}%"></div>
    </div>
    <div class="quiz-counter">Soal {currentIndex + 1} dari {questions.length}</div>

    <div class="question-card">
      <h3 class="question-text">{currentQuestion.question}</h3>

      <div class="options-list">
        {#each currentQuestion.options as option, i}
          <button
            class="option-btn"
            class:selected={selectedOption === i}
            class:correct={answered && i === currentQuestion.correctIndex}
            class:wrong={answered && selectedOption === i && i !== currentQuestion.correctIndex}
            onclick={() => selectOption(i)}
            disabled={answered}
          >
            <span class="option-char">{String.fromCharCode(65 + i)}</span>
            <span class="option-text">{option}</span>
            {#if answered && i === currentQuestion.correctIndex}
              <span class="option-check">✓</span>
            {/if}
            {#if answered && selectedOption === i && i !== currentQuestion.correctIndex}
              <span class="option-cross">✕</span>
            {/if}
          </button>
        {/each}
      </div>

      {#if answered}
        <div class="feedback-box" class:correct={selectedOption === currentQuestion.correctIndex}>
          <p class="feedback-result">
            {selectedOption === currentQuestion.correctIndex ? '✅ Benar!' : '❌ Salah'}
          </p>
          <p class="feedback-explain">{currentQuestion.explanation}</p>
        </div>
      {/if}

      <div class="question-actions">
        {#if !answered}
          <button
            class="btn-primary"
            onclick={checkAnswer}
            disabled={selectedOption === null}
          >
            Cek Jawaban
          </button>
        {:else}
          <button class="btn-primary" onclick={nextQuestion}>
            {currentIndex < questions.length - 1 ? 'Soal Selanjutnya →' : 'Lihat Hasil'}
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .progress-quiz-page {
    max-width: 700px;
    margin: 0 auto;
    padding: 20px 0;
  }

  .error-state { text-align: center; padding: 60px; color: var(--text-secondary); }

  .quiz-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .quiz-header h1 { font-size: 22px; color: var(--text); }
  .timer { font-size: 20px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }
  .timer.timer-warning { color: #ef4444; animation: pulse 1s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

  .quiz-progress-bar { height: 6px; background: var(--bg-secondary); border-radius: 3px; margin-bottom: 12px; overflow: hidden; }
  .quiz-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-secondary)); border-radius: 3px; transition: width 0.3s ease; }
  .quiz-counter { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }

  .question-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
  .question-text { font-size: 18px; color: var(--text); margin-bottom: 20px; line-height: 1.5; }
  .options-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }

  .option-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 16px; border: 2px solid var(--border);
    border-radius: 10px; background: var(--bg-secondary);
    color: var(--text); font-size: 14px; cursor: pointer;
    transition: all 0.15s; text-align: left; font-family: inherit; width: 100%;
  }
  .option-btn:hover:not(:disabled) { border-color: var(--accent); background: var(--hover); }
  .option-btn.selected { border-color: var(--accent); background: var(--accent-dim); }
  .option-btn.correct { border-color: #22c55e; background: rgba(46, 204, 113, 0.1); }
  .option-btn.wrong { border-color: #ef4444; background: rgba(231, 76, 60, 0.1); }
  .option-char { width: 28px; height: 28px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0; }
  .option-btn.correct .option-char { background: #22c55e; color: #fff; border-color: #22c55e; }
  .option-btn.wrong .option-char { background: #ef4444; color: #fff; border-color: #ef4444; }
  .option-text { flex: 1; }
  .option-check { color: #22c55e; font-weight: bold; }
  .option-cross { color: #ef4444; font-weight: bold; }

  .feedback-box { padding: 16px; border-radius: 10px; margin-bottom: 20px; }
  .feedback-box.correct { background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.3); }
  .feedback-box:not(.correct) { background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); }
  .feedback-result { font-weight: 700; font-size: 16px; margin-bottom: 6px; color: var(--text); }
  .feedback-explain { font-size: 14px; color: var(--text-secondary); line-height: 1.5; }

  .question-actions { display: flex; gap: 10px; justify-content: flex-end; }

  .btn-primary {
    padding: 10px 20px; background: var(--accent); color: #fff;
    border: none; border-radius: 10px; font-size: 14px;
    font-weight: 600; cursor: pointer; transition: opacity 0.15s;
  }
  .btn-primary:hover:not(:disabled) { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-secondary {
    padding: 10px 20px; background: var(--surface); color: var(--text);
    border: 1px solid var(--border); border-radius: 10px;
    font-size: 14px; cursor: pointer;
  }

  .result-card { text-align: center; padding: 40px 20px; }
  .result-icon { font-size: 48px; margin-bottom: 16px; }
  .result-card h2 { font-size: 24px; color: var(--text); margin-bottom: 16px; }
  .score-display { font-size: 48px; font-weight: 700; margin-bottom: 8px; }
  .score-num { color: var(--accent); }
  .score-sep, .score-total { color: var(--text-secondary); }
  .score-pct { font-size: 16px; color: var(--text-secondary); margin-bottom: 8px; }
  .pass-msg { color: #22c55e; font-weight: 600; font-size: 16px; margin-bottom: 16px; }
  .fail-msg { color: #ef4444; font-weight: 600; font-size: 16px; margin-bottom: 16px; }

  .try-info { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
  .try-badge { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); }
  .try-badge.best { background: rgba(212, 160, 23, 0.1); color: #d4a017; border-color: rgba(212, 160, 23, 0.3); }

  .results-list { text-align: left; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto; }
  .result-item { padding: 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface); }
  .result-item.correct { border-color: rgba(46, 204, 113, 0.3); }
  .result-item.wrong { border-color: rgba(231, 76, 60, 0.3); }
  .result-q { font-size: 14px; color: var(--text); margin-bottom: 6px; font-weight: 500; }
  .result-detail { font-size: 13px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 2px; }
  .result-correct { color: #22c55e; }

  .result-actions { display: flex; gap: 12px; justify-content: center; }
</style>
