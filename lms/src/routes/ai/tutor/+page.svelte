<script lang="ts">
	let { data } = $props();

	import { parseMarkdown } from '$lib/utils/markdown';
	import { browser } from '$app/environment';

	type ChatTurn = { role: 'user' | 'assistant'; text: string };

	let message = $state('');
	let turns = $state<ChatTurn[]>([]);
	let loading = $state(false);
	let selectedOfferingId = $state('');
	let error = $state('');

	const offerings = $derived(data.offerings ?? []);
	const suggestedPrompts = [
		'Jelaskan konsep ini',
		'Bantu saya mengerjakan tugas',
		'Berikan contoh kode',
		'Apa perbedaan antara...',
	];

	function getAuthToken(): string | null {
		if (!browser) return null;
		return localStorage.getItem('lms-auth-token');
	}

	async function sendMessage() {
		const text = message.trim();
		if (!text || loading) return;

		turns = [...turns, { role: 'user', text }];
		message = '';
		loading = true;
		error = '';

		try {
			const token = getAuthToken();
			const history = turns.slice(0, -1).map(t => ({ role: t.role, content: t.text }));
			const res = await fetch('/api/ai/tutor', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					message: text,
					courseOfferingId: selectedOfferingId || undefined,
					history,
				}),
			});

			const json = await res.json();

			if (!json.success) {
				throw new Error(json.error || 'Failed to get response');
			}

			turns = [...turns, { role: 'assistant', text: json.data.reply }];
		} catch (e) {
			error = e instanceof Error ? e.message : 'Terjadi kesalahan. Silakan coba lagi.';
		} finally {
			loading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	function usePrompt(prompt: string) {
		message = prompt;
	}

	function clearChat() {
		turns = [];
		error = '';
	}
</script>

<svelte:head>
	<title>AI Tutor — RPL AI Curriculum</title>
</svelte:head>

<div class="tutor-page">
	<div class="tutor-header">
		<div>
			<h1>AI Tutor</h1>
			<p class="subtitle">Asisten belajar RPL berbasis AI. Tanya apa pun tentang materi kuliah.</p>
		</div>
		<div class="header-actions">
			<select bind:value={selectedOfferingId} class="offering-select">
				<option value="">— Semua kursus —</option>
				{#each offerings as offering}
					<option value={offering.id}>{offering.course_title} — {offering.name}</option>
				{/each}
			</select>
			<button onclick={clearChat} class="clear-btn" disabled={turns.length === 0}>Hapus Percakapan</button>
		</div>
	</div>

	<div class="chat-container">
		<div class="messages">
			{#each turns as turn, i (i)}
				<div class="message {turn.role}">
					<div class="bubble">
						{#if turn.role === 'assistant'}
							{@html parseMarkdown(turn.text)}
						{:else}
							{turn.text}
						{/if}
					</div>
				</div>
			{:else}
				<div class="empty-state">
					<div class="empty-icon">🤖</div>
					<p>Ayo bertanya! AI Tutor siap membantu belajarmu.</p>
					<div class="suggested-prompts">
						{#each suggestedPrompts as prompt}
							<button onclick={() => usePrompt(prompt)} class="prompt-chip">
								{prompt}
							</button>
						{/each}
					</div>
				</div>
			{/each}

			{#if loading}
				<div class="message assistant">
					<div class="bubble loading">
						<span class="dot"></span>
						<span class="dot"></span>
						<span class="dot"></span>
					</div>
				</div>
			{/if}

			{#if error}
				<div class="error-msg">
					<span>⚠️ {error}</span>
				</div>
			{/if}
		</div>

		<div class="input-area">
			<textarea
				bind:value={message}
				onkeydown={handleKeydown}
				placeholder="Tulis pertanyaanmu di sini..."
				rows="2"
				disabled={loading}
			></textarea>
			<button onclick={sendMessage} disabled={!message.trim() || loading}>
				Kirim
			</button>
		</div>
	</div>
</div>

<style>
	.tutor-page {
		max-width: 860px;
		margin: 0 auto;
		padding: 24px 16px 48px;
		display: flex;
		flex-direction: column;
		min-height: calc(100vh - 40px);
	}

	.tutor-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 20px;
		flex-wrap: wrap;
	}

	.tutor-header h1 {
		font-size: 26px;
		font-weight: 700;
		color: var(--text);
		margin: 0;
	}

	.subtitle {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 4px 0 0;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.offering-select {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 13px;
		max-width: 240px;
		cursor: pointer;
	}

	.clear-btn {
		padding: 8px 14px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text-secondary);
		font-size: 13px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.clear-btn:hover:not(:disabled) {
		background: var(--hover);
		color: var(--danger);
		border-color: var(--danger);
	}

	.clear-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.chat-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		overflow: hidden;
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-height: 400px;
		max-height: 60vh;
	}

	.message {
		display: flex;
	}

	.message.user {
		justify-content: flex-end;
	}

	.message.assistant {
		justify-content: flex-start;
	}

	.bubble {
		max-width: 80%;
		padding: 12px 16px;
		border-radius: 12px;
		font-size: 14px;
		line-height: 1.6;
		word-wrap: break-word;
	}

	.message.user .bubble {
		background: var(--accent);
		color: #fff;
		border-bottom-right-radius: 4px;
	}

	.message.assistant .bubble {
		background: var(--bg-secondary);
		color: var(--text);
		border-bottom-left-radius: 4px;
	}

	.bubble :global(p) {
		margin: 0 0 8px;
	}

	.bubble :global(p:last-child) {
		margin-bottom: 0;
	}

	.bubble :global(code) {
		background: rgba(0,0,0,0.1);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 13px;
	}

	.bubble :global(pre) {
		background: rgba(0,0,0,0.15);
		padding: 12px;
		border-radius: 8px;
		overflow-x: auto;
		margin: 8px 0;
	}

	.bubble :global(pre code) {
		background: none;
		padding: 0;
	}

	.bubble :global(ul), .bubble :global(ol) {
		padding-left: 20px;
		margin: 8px 0;
	}

	.bubble :global(li) {
		margin-bottom: 4px;
	}

	.loading {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 16px 20px;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--text-secondary);
		animation: bounce 1.4s infinite ease-in-out both;
	}

	.dot:nth-child(1) { animation-delay: -0.32s; }
	.dot:nth-child(2) { animation-delay: -0.16s; }
	.dot:nth-child(3) { animation-delay: 0s; }

	@keyframes bounce {
		0%, 80%, 100% { transform: scale(0); }
		40% { transform: scale(1); }
	}

	.error-msg {
		text-align: center;
		padding: 12px;
		font-size: 13px;
		color: var(--danger);
		background: rgba(239, 68, 68, 0.08);
		border-radius: 8px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		flex: 1;
		padding: 40px 20px;
		gap: 12px;
	}

	.empty-icon {
		font-size: 48px;
	}

	.empty-state p {
		font-size: 15px;
		color: var(--text-secondary);
		max-width: 400px;
	}

	.suggested-prompts {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
		margin-top: 8px;
	}

	.prompt-chip {
		padding: 8px 16px;
		border: 1px solid var(--border);
		border-radius: 20px;
		background: var(--surface);
		color: var(--text-secondary);
		font-size: 13px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.prompt-chip:hover {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-dim);
	}

	.input-area {
		display: flex;
		gap: 10px;
		padding: 16px 20px;
		border-top: 1px solid var(--border);
		background: var(--surface);
	}

	.input-area textarea {
		flex: 1;
		padding: 10px 14px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
		font-family: inherit;
		resize: none;
		line-height: 1.5;
		outline: none;
		transition: border-color 0.15s;
	}

	.input-area textarea:focus {
		border-color: var(--accent);
	}

	.input-area textarea:disabled {
		opacity: 0.5;
	}

	.input-area button {
		padding: 10px 24px;
		border: none;
		border-radius: 10px;
		background: var(--accent);
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
		white-space: nowrap;
	}

	.input-area button:hover:not(:disabled) {
		opacity: 0.9;
	}

	.input-area button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.tutor-header {
			flex-direction: column;
		}

		.bubble {
			max-width: 90%;
		}

		.input-area {
			flex-direction: column;
		}

		.input-area button {
			width: 100%;
		}
	}
</style>
