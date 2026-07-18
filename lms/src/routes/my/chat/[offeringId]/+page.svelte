<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';

	let { data } = $props<{ data: import('./$types').PageData }>();

	let offeringId = $derived(data.offeringId);
	let offeringName = $derived(data.offeringName);
	let currentUser = $derived(data.user || {});
	let displayName = $derived(currentUser.name || 'Siswa');
	let initials = $derived(
		displayName.split(' ').map((s: string) => s[0]).join('').toUpperCase().slice(0, 2)
	);
	let avatarUrl = $derived(currentUser.avatar_url || '');

	let messages = $state<any[]>([]);
	let newMessage = $state('');
	let loading = $state(true);
	let error = $state('');
	let totalMessages = $state(0);
	let messageEnd = $state<HTMLDivElement | null>(null);
	let autoScroll = $state(true);
	let pollingId: ReturnType<typeof setInterval> | null = null;
	let lastMessageId = $state<string | null>(null);

	function getToken(): string | null {
		if (!browser) return null;
		return localStorage.getItem('lms-auth-token');
	}

	async function loadMessages() {
		const token = getToken();
		if (!token || !browser) return;
		try {
			const params = new URLSearchParams({ limit: '50' });
			if (lastMessageId) params.set('before', lastMessageId);

			const res = await fetch(`/api/chat/${offeringId}?${params}`, {
				headers: { 'Authorization': `Bearer ${token}` },
			});
			const json = await res.json();
			if (json.success) {
				const newMsgs = json.data || [];
				totalMessages = json.total ?? 0;

				if (lastMessageId && newMsgs.length > 0) {
					// Prepend older messages
					messages = [...newMsgs, ...messages];
				} else if (!lastMessageId) {
					messages = newMsgs;
				}

				// Track earliest message id for pagination
				if (messages.length > 0) {
					lastMessageId = messages[0].id;
				}
			} else {
				error = json.error || 'Gagal memuat pesan';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	async function pollNewMessages() {
		const token = getToken();
		if (!token || !browser) return;
		try {
			const res = await fetch(`/api/chat/${offeringId}?limit=20`, {
				headers: { 'Authorization': `Bearer ${token}` },
			});
			const json = await res.json();
			if (json.success) {
				const newMsgs = json.data || [];
				// Merge: only add messages we don't have
				const existingIds = new Set(messages.map(m => m.id));
				const fresh = newMsgs.filter((m: any) => !existingIds.has(m.id));
				if (fresh.length > 0) {
					messages = [...messages, ...fresh];
					if (autoScroll) {
						// Scroll to bottom on new messages
						setTimeout(() => messageEnd?.scrollIntoView({ behavior: 'smooth' }), 50);
					}
				}
				totalMessages = json.total ?? 0;
			}
		} catch {
			// silent
		}
	}

	async function sendMessage() {
		const msg = newMessage.trim();
		if (!msg) return;
		const token = getToken();
		if (!token) return;

		try {
			const res = await fetch('/api/chat/send', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ offeringId, message: msg }),
			});
			const json = await res.json();
			if (json.success) {
				newMessage = '';
				// Auto-add to messages
				if (json.data) {
					messages = [...messages, json.data];
					setTimeout(() => messageEnd?.scrollIntoView({ behavior: 'smooth' }), 50);
				}
			} else {
				error = json.error || 'Gagal mengirim pesan';
			}
		} catch {
			error = 'Gagal mengirim pesan';
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	function loadOlder() {
		if (messages.length >= totalMessages) return;
		loadMessages();
	}

	function onScroll(e: Event) {
		const el = e.target as HTMLElement;
		autoScroll = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
	}

	onMount(() => {
		if (!browser) return;
		loadMessages().then(() => {
			setTimeout(() => messageEnd?.scrollIntoView({ behavior: 'auto' }), 100);
		});
		// Poll every 5 seconds
		pollingId = setInterval(pollNewMessages, 5000);
	});

	onDestroy(() => {
		if (pollingId) clearInterval(pollingId);
	});

	function timeAgo(dateStr: string): string {
		const now = Date.now();
		const then = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z')).getTime();
		const diff = now - then;
		const minutes = Math.floor(diff / 60000);
		if (minutes < 1) return 'baru saja';
		if (minutes < 60) return `${minutes}m lalu`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}j lalu`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `${days}h lalu`;
		return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
	}
</script>

<svelte:head>
	<title>Chat — {offeringName} — RPL AI Curriculum</title>
</svelte:head>

<div class="chat-page">
	<div class="chat-header">
		<h1>💬 Chat Kursus</h1>
		<p class="chat-subtitle">{offeringName}</p>
	</div>

	<div class="chat-container">
		<!-- Messages -->
		<div class="chat-messages" onscroll={onScroll}>
			{#if loading}
				<div class="chat-loading">Memuat pesan...</div>
			{:else if messages.length === 0}
				<div class="chat-empty">
					<p>Belum ada pesan. Mulai diskusi!</p>
				</div>
			{:else}
				{#if messages.length < totalMessages}
					<button class="load-older" onclick={loadOlder}>
						Muat pesan sebelumnya ({totalMessages - messages.length} lainnya)
					</button>
				{/if}

				{#each messages as msg (msg.id)}
					<div class="chat-message" class:own-message={msg.user_id === currentUser.id}>
						<div class="msg-avatar">
							<Avatar
								src={msg.avatar_url || ''}
								initials={(msg.display_name || '?').split(' ').map((s: string) => s[0]).join('').toUpperCase().slice(0, 2)}
								alt={msg.display_name || 'User'}
								size="sm"
							/>
						</div>
						<div class="msg-content">
							<div class="msg-header">
								<span class="msg-author">{msg.display_name || 'User'}</span>
								<span class="msg-time">{timeAgo(msg.created_at)}</span>
							</div>
							<div class="msg-text">{msg.message}</div>
						</div>
					</div>
				{/each}
			{/if}
			<div bind:this={messageEnd}></div>
		</div>

		<!-- Error -->
		{#if error}
			<div class="chat-error">{error}</div>
		{/if}

		<!-- Input -->
		<div class="chat-input-area">
			<textarea
				class="chat-input"
				bind:value={newMessage}
				onkeydown={handleKeydown}
				placeholder="Ketik pesan... (Enter untuk kirim)"
				rows="2"
				maxlength="1000"
			></textarea>
			<button class="send-btn" onclick={sendMessage} disabled={!newMessage.trim()}>
				Kirim
			</button>
		</div>
	</div>
</div>

<style>
	.chat-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 24px;
		display: flex;
		flex-direction: column;
		height: calc(100vh - 112px);
	}
	.chat-header {
		margin-bottom: 16px;
		flex-shrink: 0;
	}
	.chat-header h1 {
		font-size: 22px;
		font-weight: 700;
		margin: 0;
	}
	.chat-subtitle {
		color: var(--text-secondary);
		font-size: 13px;
		margin: 4px 0 0;
	}

	.chat-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}

	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.chat-loading, .chat-empty {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
		font-size: 14px;
	}

	.load-older {
		align-self: center;
		background: none;
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 8px 16px;
		color: var(--accent);
		font-size: 12px;
		cursor: pointer;
		margin-bottom: 8px;
		transition: all 0.15s;
	}
	.load-older:hover {
		background: var(--accent-dim);
	}

	.chat-message {
		display: flex;
		gap: 10px;
		max-width: 85%;
	}
	.own-message {
		align-self: flex-end;
		flex-direction: row-reverse;
	}
	.own-message .msg-content {
		background: var(--accent-dim);
		border-color: var(--accent);
	}
	.own-message .msg-header {
		flex-direction: row-reverse;
	}

	.msg-avatar {
		flex-shrink: 0;
		margin-top: 2px;
	}
	.msg-content {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 10px 14px;
		min-width: 0;
	}
	.msg-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}
	.msg-author {
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
	}
	.msg-time {
		font-size: 10px;
		color: var(--text-secondary);
	}
	.msg-text {
		font-size: 14px;
		color: var(--text);
		line-height: 1.5;
		word-break: break-word;
		white-space: pre-wrap;
	}

	.chat-error {
		padding: 8px 16px;
		background: rgba(239,68,68,0.08);
		color: #ef4444;
		font-size: 12px;
		border-top: 1px solid var(--border);
	}

	.chat-input-area {
		display: flex;
		gap: 8px;
		padding: 12px;
		border-top: 1px solid var(--border);
		background: var(--surface);
		flex-shrink: 0;
	}
	.chat-input {
		flex: 1;
		padding: 10px 12px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 8px;
		color: var(--text);
		font-family: inherit;
		font-size: 13px;
		resize: none;
		outline: none;
		transition: border-color 0.15s;
	}
	.chat-input:focus {
		border-color: var(--accent);
	}
	.send-btn {
		padding: 10px 20px;
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		align-self: flex-end;
		transition: opacity 0.15s;
	}
	.send-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.send-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	@media (max-width: 600px) {
		.chat-page { padding: 12px; height: calc(100vh - 80px); }
		.chat-messages { padding: 12px; }
		.chat-message { max-width: 95%; }
	}
</style>
