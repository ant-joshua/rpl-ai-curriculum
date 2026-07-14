<script lang="ts">
	import { parseMarkdown } from '$lib/utils/markdown';
	import { browser } from '$app/environment';

	interface Props {
		courseOfferingId?: string;
		lessonId?: string;
		compact?: boolean;
	}

	let { courseOfferingId = undefined, lessonId = undefined, compact = false }: Props = $props();

	type ChatTurn = { role: 'user' | 'assistant'; text: string };

	let message = $state('');
	let turns = $state<ChatTurn[]>([]);
	let loading = $state(false);
	let error = $state('');
	let showHistory = $state(true);
	// compact is a mount-time prop — start hidden when compact
	$effect(() => { if (compact) showHistory = false; });

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
			const res = await fetch('/api/ai/tutor', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					message: text,
					courseOfferingId: courseOfferingId || undefined,
					lessonId: lessonId || undefined,
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

	function toggleHistory() {
		showHistory = !showHistory;
	}
</script>

<div class="ai-tutor {compact ? 'compact' : ''}">
	{#if !compact}
		<div class="tutor-bar">
			<span class="tutor-label">🤖 AI Tutor</span>
			<button onclick={toggleHistory} class="toggle-btn">
				{showHistory ? 'Sembunyikan' : 'Tampilkan'} riwayat
			</button>
		</div>
	{/if}

	{#if showHistory}
		<div class="messages">
			{#each turns as turn, i (i)}
				<div class="msg {turn.role}">
					<div class="msg-bubble">
						{#if turn.role === 'assistant'}
							{@html parseMarkdown(turn.text)}
						{:else}
							{turn.text}
						{/if}
					</div>
				</div>
			{:else}
				<div class="empty-msg">
					<p>Tanya AI tentang materi ini.</p>
				</div>
			{/each}

			{#if loading}
				<div class="msg assistant">
					<div class="msg-bubble loading-dots">
						<span></span><span></span><span></span>
					</div>
				</div>
			{/if}

			{#if error}
				<div class="error-msg">{error}</div>
			{/if}
		</div>
	{/if}

	<div class="input-row">
		<input
			type="text"
			bind:value={message}
			onkeydown={handleKeydown}
			placeholder={compact ? 'Tanya AI...' : 'Tulis pertanyaan...'}
			disabled={loading}
		/>
		<button onclick={sendMessage} disabled={!message.trim() || loading}>
			Kirim
		</button>
	</div>
</div>

<style>
	.ai-tutor {
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.ai-tutor.compact {
		border-radius: 8px;
	}

	.tutor-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 14px;
		border-bottom: 1px solid var(--border);
		background: var(--bg-secondary);
	}

	.tutor-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
	}

	.toggle-btn {
		font-size: 11px;
		color: var(--text-secondary);
		background: none;
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 4px 10px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.toggle-btn:hover {
		background: var(--hover);
		color: var(--text);
	}

	.messages {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-height: 360px;
		overflow-y: auto;
	}

	.compact .messages {
		max-height: 200px;
		padding: 8px;
	}

	.msg {
		display: flex;
	}

	.msg.user {
		justify-content: flex-end;
	}

	.msg.assistant {
		justify-content: flex-start;
	}

	.msg-bubble {
		max-width: 85%;
		padding: 8px 12px;
		border-radius: 10px;
		font-size: 13px;
		line-height: 1.5;
		word-wrap: break-word;
	}

	.msg.user .msg-bubble {
		background: var(--accent);
		color: #fff;
		border-bottom-right-radius: 3px;
	}

	.msg.assistant .msg-bubble {
		background: var(--bg-secondary);
		color: var(--text);
		border-bottom-left-radius: 3px;
	}

	.msg-bubble :global(p) {
		margin: 0 0 6px;
	}

	.msg-bubble :global(p:last-child) {
		margin-bottom: 0;
	}

	.msg-bubble :global(code) {
		background: rgba(0,0,0,0.08);
		padding: 1px 5px;
		border-radius: 3px;
		font-size: 12px;
	}

	.msg-bubble :global(pre) {
		background: rgba(0,0,0,0.12);
		padding: 10px;
		border-radius: 6px;
		overflow-x: auto;
		margin: 6px 0;
		font-size: 12px;
	}

	.msg-bubble :global(pre code) {
		background: none;
		padding: 0;
	}

	.empty-msg {
		text-align: center;
		padding: 20px 10px;
		font-size: 13px;
		color: var(--text-secondary);
	}

	.compact .empty-msg {
		padding: 10px;
		font-size: 12px;
	}

	.loading-dots {
		display: flex;
		align-items: center;
		gap: 3px;
		padding: 12px 16px;
	}

	.loading-dots span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--text-secondary);
		animation: bounce 1.4s infinite ease-in-out both;
	}

	.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
	.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
	.loading-dots span:nth-child(3) { animation-delay: 0s; }

	@keyframes bounce {
		0%, 80%, 100% { transform: scale(0); }
		40% { transform: scale(1); }
	}

	.error-msg {
		text-align: center;
		padding: 8px;
		font-size: 12px;
		color: var(--danger);
		background: rgba(239, 68, 68, 0.06);
		border-radius: 6px;
	}

	.input-row {
		display: flex;
		gap: 8px;
		padding: 10px 14px;
		border-top: 1px solid var(--border);
	}

	.compact .input-row {
		padding: 8px 10px;
	}

	.input-row input {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-size: 13px;
		font-family: inherit;
		outline: none;
		transition: border-color 0.15s;
	}

	.compact .input-row input {
		padding: 6px 10px;
		font-size: 12px;
	}

	.input-row input:focus {
		border-color: var(--accent);
	}

	.input-row input:disabled {
		opacity: 0.5;
	}

	.input-row button {
		padding: 8px 16px;
		border: none;
		border-radius: 8px;
		background: var(--accent);
		color: #fff;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
		white-space: nowrap;
	}

	.compact .input-row button {
		padding: 6px 12px;
		font-size: 12px;
	}

	.input-row button:hover:not(:disabled) {
		opacity: 0.9;
	}

	.input-row button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
