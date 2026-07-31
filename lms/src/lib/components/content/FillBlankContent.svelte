<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { pushXpGain } from '$lib/stores/xp-toast.svelte';

	let { block, onComplete }: { block: any; onComplete?: (score: number, total: number, xp: number) => void } = $props();

	const dispatch = createEventDispatcher();

	let meta: Record<string, any> = $derived(
		typeof block.meta === 'string' ? JSON.parse(block.meta || '{}') : (block.meta || {})
	);

	interface PreparedSentence {
		segments: string[];
		answers: (string | null)[];
		hint?: string;
	}

	let sentences: PreparedSentence[] = $derived(
		(
			Array.isArray(meta?.sentences)
				? meta.sentences
				: meta?.sentence || meta?.answer
					? [{ text: meta.sentence, answer: meta.answer, hint: meta.hint }]
					: []
		).map((s: any) => {
			const text: string = s.text ?? s.sentence ?? '';
			const rawAns = Array.isArray(s.answer) ? s.answer : s.answer != null ? [s.answer] : [];
			const parts = text.split('___');
			const blankCount = Math.max(parts.length - 1, rawAns.length);
			const segments = [...parts];
			while (segments.length < blankCount + 1) segments.push('');
			const answers: (string | null)[] = Array.from({ length: blankCount }, (_, i) =>
				rawAns[i] != null ? String(rawAns[i]) : null
			);
			return { segments, answers, hint: s.hint };
		})
	);

	type SentenceStatus = 'idle' | 'correct' | 'wrong';

	interface SentenceState {
		values: string[];
		status: SentenceStatus;
		attempts: number;
		graded: boolean;
	}

	let state = $state<Record<number, SentenceState>>({});
	let currentIndex = $state(0);
	let completed = $state(false);
	let xpPushed = $state(false);
	let correctCount = $state(0);

	function getState(i: number): SentenceState {
		if (!state[i]) {
			const s = sentences[i];
			state[i] = {
				values: s ? s.answers.map(() => '') : [],
				status: 'idle',
				attempts: 0,
				graded: false
			};
		}
		return state[i];
	}

	function normalize(value: string): string {
		return (value || '')
			.trim()
			.toLowerCase()
			.replace(/[^\p{L}\p{N}\s]/gu, '')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function isBlankCorrect(s: PreparedSentence, st: SentenceState, j: number): boolean {
		const answer = s.answers[j];
		if (answer == null) return st.values[j].trim() !== '';
		return normalize(st.values[j]) === normalize(answer);
	}

	function checkSentence(i: number) {
		const s = sentences[i];
		if (!s) return;
		const st = getState(i);
		st.attempts++;

		const allFilled = s.answers.every((a, j) => a != null || st.values[j].trim() !== '');
		const allCorrect = s.answers.every((_, j) => isBlankCorrect(s, st, j));

		if (allFilled && allCorrect) {
			st.status = 'correct';
			if (!st.graded) {
				st.graded = true;
				correctCount++;
			}
			setTimeout(() => {
				if (i < sentences.length - 1) {
					currentIndex = i + 1;
				} else {
					completed = true;
					if (!xpPushed) {
						xpPushed = true;
						pushXpGain(correctCount * 5);
					}
				}
			}, 750);
		} else {
			st.status = 'wrong';
		}
	}

	function onInput(i: number) {
		const st = getState(i);
		if (st.status !== 'idle') st.status = 'idle';
	}

	function finish() {
		dispatch('complete', { correct: correctCount, total: sentences.length });
		onComplete?.(correctCount, sentences.length, correctCount * 5);
	}
</script>

<div class="fillblank-wrapper">
	<h3 class="fillblank-title">{block.title || 'Fill in the Blanks'}</h3>

	{#if block.body_html}
		<div class="fillblank-intro markdown-content">{@html block.body_html}</div>
	{/if}

	{#if completed}
		<div class="completion-card">
			<div class="completion-icon">🎉</div>
			<h4 class="completion-title">Latihan Selesai!</h4>
			<p class="completion-text">
				Kamu menjawab benar <strong>{correctCount}</strong> dari {sentences.length} kalimat.
			</p>
			<p class="xp-earned">+{correctCount * 5} XP</p>
			<button class="continue-btn" onclick={finish}>Lanjut</button>
		</div>
	{:else if sentences.length === 0}
		<p class="empty-note">Belum ada latihan isian untuk blok ini.</p>
	{:else}
		{#each sentences as s, i (i)}
			{@const st = getState(i)}
			{#key `${st.status}-${st.attempts}`}
				<div
					class="sentence-card"
					class:active={i === currentIndex}
					class:done={i < currentIndex}
					class:correct={st.status === 'correct'}
					class:wrong={st.status === 'wrong'}
				>
					<div class="sentence-text">
						{#each s.segments as seg, j (j)}
							<span class="segment">{seg}</span>
							{#if j < s.segments.length - 1}
								<input
									class="blank-input"
									class:correct={st.status === 'correct'}
									class:wrong={st.status === 'wrong'}
									type="text"
									bind:value={st.values[j]}
									placeholder="…"
									disabled={st.status === 'correct'}
									oninput={() => onInput(i)}
								/>
							{/if}
						{/each}
					</div>

					{#if st.status === 'correct'}
						<div class="feedback correct-feedback">
							<span class="feedback-icon">✓</span> Benar!
						</div>
					{:else if st.status === 'wrong'}
						<div class="feedback wrong-feedback">
							<span class="feedback-icon">✗</span>
							<span>
								Jawaban benar: <strong>{s.answers.filter((a) => a != null).join(', ')}</strong>
							</span>
							{#if s.hint}
								<span class="hint">💡 {s.hint}</span>
							{/if}
						</div>
					{/if}

					{#if i === currentIndex && st.status !== 'correct'}
						<button
							class="check-btn"
							onclick={() => checkSentence(i)}
							disabled={!st.values.some((v) => v.trim() !== '')}
						>
							Check
						</button>
					{/if}
				</div>
			{/key}
		{/each}
	{/if}
</div>

<style>
	.fillblank-wrapper {
		padding: 0;
	}
	.fillblank-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 8px;
	}
	.fillblank-intro {
		font-size: 14px;
		color: var(--text-secondary);
		margin-bottom: 16px;
		line-height: 1.6;
	}
	.sentence-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 12px;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}
	.sentence-card.active {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
	}
	.sentence-card.done {
		opacity: 0.75;
	}
	.sentence-card.correct {
		border-color: var(--success, #22c55e);
		background: rgba(34, 197, 94, 0.06);
		opacity: 1;
		animation: bounce 0.6s ease;
	}
	.sentence-card.wrong {
		border-color: var(--error, #ef4444);
		background: rgba(239, 68, 68, 0.05);
		animation: shake 0.45s ease;
	}
	.sentence-text {
		font-size: 16px;
		font-weight: 500;
		color: var(--text);
		line-height: 2.4;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
	}
	.segment {
		white-space: pre-wrap;
	}
	.blank-input {
		width: 120px;
		padding: 4px 8px;
		font-size: 15px;
		font-weight: 600;
		text-align: center;
		color: var(--text);
		background: var(--surface);
		border: 2px solid var(--border);
		border-radius: 8px;
		outline: none;
		transition: border-color 0.15s ease, background 0.15s ease;
	}
	.blank-input:focus {
		border-color: var(--accent);
	}
	.blank-input.correct {
		border-color: var(--success, #22c55e);
		background: rgba(34, 197, 94, 0.1);
	}
	.blank-input.wrong {
		border-color: var(--error, #ef4444);
		background: rgba(239, 68, 68, 0.08);
	}
	.blank-input:disabled {
		cursor: default;
	}
	.feedback {
		margin-top: 10px;
		font-size: 13px;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}
	.correct-feedback {
		color: var(--success, #22c55e);
	}
	.wrong-feedback {
		color: var(--error, #ef4444);
	}
	.feedback-icon {
		font-weight: 700;
		font-size: 15px;
	}
	.hint {
		color: var(--text-secondary);
		font-weight: 400;
		font-style: italic;
	}
	.check-btn {
		margin-top: 12px;
		padding: 9px 24px;
		font-size: 14px;
		font-weight: 700;
		color: #fff;
		background: var(--accent);
		border: none;
		border-radius: 10px;
		cursor: pointer;
		box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
		transition: transform 0.08s ease, box-shadow 0.08s ease, background 0.12s;
	}
	.check-btn:hover:not(:disabled) {
		background: var(--accent-secondary, var(--accent));
	}
	.check-btn:active:not(:disabled) {
		transform: translateY(2px);
		box-shadow: 0 2px 0 rgba(0, 0, 0, 0.15);
	}
	.check-btn:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.completion-card {
		text-align: center;
		padding: 28px 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
		animation: bounce 0.6s ease;
	}
	.completion-icon {
		font-size: 40px;
		margin-bottom: 8px;
	}
	.completion-title {
		font-size: 20px;
		font-weight: 700;
		color: var(--text);
		margin: 0 0 6px;
	}
	.completion-text {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0 0 8px;
	}
	.xp-earned {
		font-size: 18px;
		font-weight: 700;
		color: var(--accent);
		margin: 0 0 18px;
	}
	.continue-btn {
		padding: 10px 32px;
		font-size: 15px;
		font-weight: 700;
		color: #fff;
		background: var(--accent);
		border: none;
		border-radius: 10px;
		cursor: pointer;
		box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
		transition: transform 0.08s ease, box-shadow 0.08s ease;
	}
	.continue-btn:active {
		transform: translateY(2px);
		box-shadow: 0 2px 0 rgba(0, 0, 0, 0.15);
	}
	.empty-note {
		font-size: 14px;
		color: var(--text-secondary);
	}

	@keyframes bounce {
		0% { transform: scale(1); }
		30% { transform: scale(1.03) translateY(-2px); }
		60% { transform: scale(0.99); }
		100% { transform: scale(1); }
	}
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		20% { transform: translateX(-6px); }
		40% { transform: translateX(6px); }
		60% { transform: translateX(-4px); }
		80% { transform: translateX(4px); }
	}
</style>
