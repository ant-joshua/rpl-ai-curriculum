<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import ExerciseRunner from '$lib/components/ExerciseRunner.svelte';
	import { submitCode } from '$lib/stores/submissions.svelte';

	let { data } = $props();

	let exercise = $state(data.exercise);

	let markdownHtml = $state('');

	type DifficultyColor = 'Beginner' | 'Intermediate' | 'Advanced';

	const difficultyColors: Record<string, string> = {
		Beginner: '#10b981',
		Intermediate: '#f59e0b',
		Advanced: '#ef4444',
	};

	const typeLabels: Record<string, string> = {
		js: 'JavaScript',
		html: 'HTML',
		bash: 'Bash',
		python: 'Python',
	};

	let showEditor = $state(false);
	let submitStatus = $state<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
	let submitMessage = $state('');

	function handleRun(output: string) {
		if (!exercise) return;
		submitStatus = 'submitting';
		submitMessage = '';
		const lang = exercise.type === 'html' ? 'html' : exercise.type === 'js' ? 'javascript' : exercise.type;
		submitCode(exercise.slug, '', lang, output, true)
			.then((res) => {
				if (res && res.success) {
					submitStatus = 'submitted';
					submitMessage = res.passed
						? `✓ Submitted! +${res.xpAwarded} XP earned`
						: '✓ Submitted (check output)';
				} else {
					submitStatus = 'error';
					submitMessage = res?.errors?.join(', ') || 'Submission failed';
				}
			})
			.catch(() => {
				submitStatus = 'error';
				submitMessage = 'Network error';
			});
	}

	// Simple markdown to HTML renderer (client-side)
	async function renderMarkdown() {
		if (!browser || !exercise) return;
		try {
			// Try using marked if available
			const marked = (await import('marked')).marked;
			markdownHtml = await marked.parse(exercise.content);
		} catch {
			// Fallback: simple render
			let html = exercise.content
				.replace(/^### (.+)$/gm, '<h3>$1</h3>')
				.replace(/^## (.+)$/gm, '<h2>$1</h2>')
				.replace(/^# (.+)$/gm, '<h1>$1</h1>')
				.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
				.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
				.replace(/`([^`]+)`/g, '<code>$1</code>')
				.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
				.replace(/^- (.+)$/gm, '<li>$1</li>')
				.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
				.replace(/\n\n/g, '</p><p>')
				.replace(/^(?!<[hupbcl])/m, '');
			html = '<p>' + html + '</p>';
			markdownHtml = html;
		}
	}

	$effect(() => {
		if (exercise) {
			renderMarkdown();
		}
	});
</script>

<svelte:head>
	<title>{exercise?.title || 'Latihan'} — RPL AI Curriculum</title>
</svelte:head>

<div class="exercise-page">
	{#if !exercise}
		<div class="error-state">
			<h2>Latihan tidak ditemukan</h2>
			<a href="/exercises" class="back-link">&larr; Kembali ke Latihan</a>
		</div>
	{:else}
		<nav class="breadcrumb">
			<a href="/exercises">🏋️ Latihan</a>
			<span class="sep">/</span>
			<span>{exercise.title}</span>
		</nav>

		<header class="exercise-header">
			<h1>{exercise.title}</h1>
			<div class="meta">
				<span
					class="badge difficulty"
					style="background: {difficultyColors[exercise.difficulty] || '#888'}22; color: {difficultyColors[exercise.difficulty] || '#888'}; border-color: {difficultyColors[exercise.difficulty] || '#888'}44"
				>
					{exercise.difficulty}
				</span>
				<span class="badge type">
					{typeLabels[exercise.type] || exercise.type}
				</span>
				{#if exercise.moduleSlug}
					<a href="/module/{exercise.moduleSlug}" class="module-link">
						📦 Modul Terkait
					</a>
				{/if}
			</div>
			{#if exercise.description}
				<p class="description">{exercise.description}</p>
			{/if}
		</header>

		<div class="actions">
			{#if exercise.moduleSlug}
				<a href="/module/{exercise.moduleSlug}" class="btn btn-secondary">
					&larr; Kembali ke Modul
				</a>
			{/if}
		</div>

		{#if exercise.hasCode}
			{#if !showEditor}
				<div class="code-section-prompt">
					<p class="prompt-text">Latihan ini memiliki kode yang bisa kamu coba langsung.</p>
					<button class="btn btn-primary" onclick={() => showEditor = true}>
						▶ Coba Kode
					</button>
				</div>
			{:else}
				<div class="code-section">
					<h2 class="section-title">🏋️ Coba Kode</h2>
					<ExerciseRunner
						language={exercise.type === 'js' ? 'javascript' : exercise.type === 'html' ? 'html' : exercise.type}
						exerciseType={exercise.type === 'html' ? 'html' : 'js'}
						starterCode=""
					/>
					<div class="submit-area">
						<button
							class="btn btn-primary submit-btn"
							onclick={() => submitCode(exercise.slug, '', exercise.type === 'html' ? 'html' : 'javascript', 'Output submitted', true)}
							disabled={submitStatus === 'submitting'}
						>
							{submitStatus === 'submitting' ? '⏳ Mengirim...' : submitStatus === 'submitted' ? '✓ Terkirim' : '📤 Kirim Jawaban'}
						</button>
						{#if submitMessage}
							<p class="submit-message" class:success={submitStatus === 'submitted'} class:error={submitStatus === 'error'}>
								{submitMessage}
							</p>
						{/if}
					</div>
				</div>
			{/if}
		{/if}

		<div class="content">
			{#if markdownHtml}
				<div class="markdown-body">{@html markdownHtml}</div>
			{:else}
				<p class="loading-content">Memuat konten...</p>
			{/if}
		</div>

		<div class="footer-nav">
			<a href="/exercises" class="back-link">&larr; Semua Latihan</a>
		</div>
	{/if}
</div>

<style>
	.exercise-page {
		max-width: 900px;
		margin: 0 auto;
	}

	.error-state {
		text-align: center;
		padding: 60px 24px;
	}

	.error-state h2 {
		margin-bottom: 16px;
		color: var(--text-secondary);
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		margin-bottom: 20px;
		color: var(--text-secondary);
	}

	.breadcrumb a {
		color: var(--accent);
		text-decoration: none;
	}

	.breadcrumb .sep {
		color: var(--border);
	}

	.exercise-header {
		margin-bottom: 20px;
	}

	.exercise-header h1 {
		font-size: 26px;
		font-weight: 700;
		margin-bottom: 12px;
		line-height: 1.3;
	}

	.meta {
		display: flex;
		gap: 10px;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 12px;
	}

	.badge {
		font-size: 11px;
		font-weight: 600;
		padding: 4px 12px;
		border-radius: 20px;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.badge.difficulty {
		border: 1px solid;
	}

	.badge.type {
		background: var(--accent-dim);
		color: var(--accent);
	}

	.module-link {
		font-size: 13px;
		color: var(--accent);
		text-decoration: none;
	}

	.module-link:hover {
		text-decoration: underline;
	}

	.description {
		font-size: 15px;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.actions {
		display: flex;
		gap: 12px;
		margin-bottom: 24px;
		flex-wrap: wrap;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		text-decoration: none !important;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.btn:hover {
		opacity: 0.9;
	}

	.btn-primary {
		background: var(--accent);
		color: #fff;
	}

	.btn-secondary {
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text);
	}

	.content {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 24px;
	}

	.loading-content {
		color: var(--text-secondary);
		text-align: center;
		padding: 24px;
	}

	.markdown-body {
		font-size: 15px;
		line-height: 1.7;
	}

	.markdown-body :global(h2) {
		font-size: 20px;
		font-weight: 700;
		margin: 24px 0 12px;
		padding-bottom: 6px;
		border-bottom: 1px solid var(--border);
	}

	.markdown-body :global(h3) {
		font-size: 17px;
		font-weight: 600;
		margin: 20px 0 10px;
	}

	.markdown-body :global(p) {
		margin-bottom: 12px;
	}

	.markdown-body :global(pre) {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 16px;
		overflow-x: auto;
		margin-bottom: 16px;
		font-size: 13px;
		line-height: 1.5;
	}

	.markdown-body :global(code) {
		background: var(--bg-secondary);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 13px;
	}

	.markdown-body :global(pre code) {
		background: none;
		padding: 0;
	}

	.markdown-body :global(blockquote) {
		border-left: 3px solid var(--accent);
		padding: 8px 16px;
		margin-bottom: 12px;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		border-radius: 4px;
	}

	.markdown-body :global(ul) {
		margin-bottom: 12px;
		padding-left: 24px;
	}

	.markdown-body :global(li) {
		margin-bottom: 4px;
	}

	.footer-nav {
		margin-top: 12px;
		margin-bottom: 32px;
	}

	.back-link {
		color: var(--accent);
		font-size: 14px;
		text-decoration: none;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.code-section-prompt {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 24px;
		text-align: center;
	}

	.prompt-text {
		color: var(--text-secondary);
		margin-bottom: 16px;
		font-size: 14px;
	}

	.code-section {
		margin-bottom: 24px;
	}

	.section-title {
		font-size: 18px;
		font-weight: 700;
		margin-bottom: 12px;
		color: var(--text);
	}

	.submit-area {
		margin-top: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: flex-start;
	}

	.submit-btn {
		background: var(--success) !important;
		color: #fff !important;
		border: none !important;
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.submit-message {
		font-size: 13px;
		margin: 0;
	}

	.submit-message.success {
		color: var(--success);
	}

	.submit-message.error {
		color: var(--danger);
	}
</style>
