<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { user } from '$lib/stores/user.svelte';
	import { modules } from '$lib/stores/modules';

	type QuizResult = {
		module_slug: string;
		session_id: string;
		correct: number;
		question_count: number;
	};

	let quizModules = $state<{ slug: string; title: string; sessions: { id: string; title: string; questions: number }[] }[]>([]);
	let quizResults = $state<Record<string, QuizResult>>({});
	let loading = $state(true);

	onMount(async () => {
		if (!user.isLoggedIn) {
			goto('/login');
			return;
		}

		// Load quiz.json to see which modules/sessions have quizzes
		try {
			const [quizRes, resultsRes] = await Promise.all([
				fetch('/content/quiz.json'),
				fetch('/api/quiz', { headers: { 'x-device-id': user.userId || user.deviceId } }),
			]);

			const quizData = await quizRes.json();
			const resultsData = await resultsRes.json();

			// Build results lookup: module_slug:session_id -> { correct, count }
			const resultMap: Record<string, QuizResult> = {};
			if (resultsData.success) {
				const answers: any[] = resultsData.data;
				// Group by module:session
				const groups: Record<string, { correct: number; count: number }> = {};
				for (const a of answers) {
					const key = `${a.module_slug}:${a.session_id}`;
					if (!groups[key]) groups[key] = { correct: 0, count: 0 };
					groups[key].count++;
					if (a.correct === 1) groups[key].correct++;
				}
				for (const [key, val] of Object.entries(groups)) {
					const [ms, si] = key.split(':');
					resultMap[key] = { module_slug: ms, session_id: si, correct: val.correct, question_count: val.count };
				}
			}
			quizResults = resultMap;

			// Build module/session list from quiz.json
			const list: { slug: string; title: string; sessions: { id: string; title: string; questions: number }[] }[] = [];
			for (const qm of quizData) {
				const mod = modules.find(m => m.slug === qm.module_slug);
				const sessions = qm.sessions.map((s: any) => {
					const modSession = mod?.sessions.find(ms => ms.id === s.session_id || ms.title === s.session_id);
					return {
						id: s.session_id,
						title: modSession?.title || s.session_id,
						questions: s.questions.length,
					};
				});
				list.push({
					slug: qm.module_slug,
					title: mod?.title || qm.module_slug,
					sessions,
				});
			}
			quizModules = list;
		} catch {
			// silent
		} finally {
			loading = false;
		}
	});

	function getResult(modSlug: string, sessionId: string): QuizResult | undefined {
		return quizResults[`${modSlug}:${sessionId}`];
	}

	function getSessionLabel(modSlug: string, sessionId: string): string {
		// Determine the display-friendly session id for URL
		const mod = modules.find(m => m.slug === modSlug);
		if (mod) {
			const sesh = mod.sessions.find(s => s.id === sessionId || s.title === sessionId);
			if (sesh) return sesh.id;
		}
		return sessionId;
	}
</script>

<div class="quiz-list-page">
	<h1>📝 Quiz</h1>
	<p class="subtitle">Kerjakan quiz per sesi untuk menguji pemahamanmu</p>

	{#if loading}
		<div class="loading-state">Memuat quiz...</div>
	{:else if quizModules.length === 0}
		<div class="empty-state">
			<span class="empty-icon">🧪</span>
			<h3>Belum ada quiz</h3>
			<p>Quiz akan tersedia setelah konten siap</p>
		</div>
	{:else}
		<div class="module-list">
			{#each quizModules as mod}
				<div class="module-section">
					<h2 class="module-title">{mod.title}</h2>
					<div class="session-list">
						{#each mod.sessions as session}
							{@const result = getResult(mod.slug, session.id)}
							<a
								href="/quiz/{mod.slug}/{getSessionLabel(mod.slug, session.id)}"
								class="session-card"
							>
								<div class="session-info">
									<span class="session-name">{session.title}</span>
									<span class="session-count">{session.questions} soal</span>
								</div>
								<div class="session-status">
									{#if result}
										<span class="status-done">
											✅ {result.correct}/{result.question_count}
										</span>
									{:else}
										<span class="status-todo">⏳ Belum dikerjakan</span>
									{/if}
									<span class="card-arrow">→</span>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.quiz-list-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px 0;
	}

	h1 {
		font-size: 28px;
		color: var(--text);
		margin-bottom: 4px;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin-bottom: 32px;
	}

	.loading-state, .empty-state {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
	}

	.empty-icon {
		font-size: 48px;
		display: block;
		margin-bottom: 16px;
	}

	.module-list {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.module-section {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
	}

	.module-title {
		font-size: 16px;
		color: var(--text);
		margin-bottom: 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--border);
	}

	.session-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.session-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 14px;
		border-radius: 8px;
		background: var(--bg-secondary);
		text-decoration: none !important;
		transition: background 0.15s;
		cursor: pointer;
	}

	.session-card:hover {
		background: var(--hover);
	}

	.session-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.session-name {
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
	}

	.session-count {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.session-status {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-done {
		font-size: 13px;
		color: #22c55e;
		font-weight: 500;
	}

	.status-todo {
		font-size: 13px;
		color: var(--text-secondary);
	}

	.card-arrow {
		color: var(--text-secondary);
		font-size: 16px;
	}
</style>
