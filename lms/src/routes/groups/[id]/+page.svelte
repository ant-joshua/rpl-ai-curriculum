<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { groupsStore } from '$lib/stores/groups.svelte';
	import { page } from '$app/stores';

	let { data } = $props();

	let groupId = $derived($page.params.id);
	let messageText = $state('');
	let sending = $state(false);
	let members = $state<{ id: string; user_id: string; role: string; username?: string }[]>([]);
	let groupName = $state('');

	let pollInterval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		loadGroup();
		groupsStore.loadMessages(groupId);
		pollInterval = setInterval(() => {
			groupsStore.loadMessages(groupId);
		}, 30000);
	});

	onDestroy(() => {
		if (pollInterval) clearInterval(pollInterval);
	});

	async function loadGroup() {
		try {
			const res = await fetch('/api/groups/' + groupId, {
				headers: { 'Content-Type': 'application/json' },
			});
			const json = await res.json();
			if (json.success && json.data) {
				groupName = json.data.name;
				members = json.data.members || [];
			}
		} catch { /* ignore */ }
	}

	async function handleSend() {
		if (!messageText.trim() || sending) return;
		sending = true;
		await groupsStore.sendMessage(groupId, messageText.trim());
		messageText = '';
		sending = false;
	}

	function formatTime(dateStr: string): string {
		const d = new Date(dateStr);
		return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="chat-page">
	<div class="chat-layout">
		<div class="chat-main">
			<div class="chat-header">
				<a href="/groups" class="back-link">← Groups</a>
				<h2>{groupName || 'Loading...'}</h2>
			</div>

			<div class="messages-area">
				{#each groupsStore.messages as msg}
					<div class="message">
						<div class="msg-header">
							<span class="msg-user">{msg.username || msg.user_id.slice(0, 8)}</span>
							<span class="msg-time">{formatTime(msg.created_at)}</span>
						</div>
						<div class="msg-content">{msg.content}</div>
					</div>
				{:else}
					<p class="empty-msg">Belum ada pesan. Mulai diskusi!</p>
				{/each}
			</div>

			<form class="input-area" onsubmit={(e) => { e.preventDefault(); handleSend(); }}>
				<input
					type="text"
					bind:value={messageText}
					placeholder="Tulis pesan..."
					class="msg-input"
					disabled={sending}
				/>
				<button type="submit" class="send-btn" disabled={!messageText.trim() || sending}>
					Kirim
				</button>
			</form>
		</div>

		<aside class="member-sidebar">
			<h3>Anggota ({members.length})</h3>
			<div class="member-list">
				{#each members as m}
					<div class="member-item">
						<span class="member-avatar">👤</span>
						<div class="member-info">
							<span class="member-name">{m.username || m.user_id.slice(0, 8)}</span>
							<span class="member-role">{m.role === 'admin' ? '👑 Admin' : 'Anggota'}</span>
						</div>
					</div>
				{/each}
			</div>
		</aside>
	</div>
</div>

<style>
	.chat-page {
		max-width: 100%;
		height: calc(100vh - 40px);
	}
	.chat-layout {
		display: flex;
		height: 100%;
		gap: 0;
	}
	.chat-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: var(--bg);
		border-radius: 12px;
		border: 1px solid var(--border);
		overflow: hidden;
	}
	.chat-header {
		padding: 16px 20px;
		border-bottom: 1px solid var(--border);
		background: var(--surface);
	}
	.chat-header h2 {
		font-size: 18px;
		font-weight: 600;
		margin-top: 4px;
	}
	.back-link {
		font-size: 13px;
		color: var(--accent);
		text-decoration: none;
	}
	.back-link:hover {
		text-decoration: underline;
	}
	.messages-area {
		flex: 1;
		overflow-y: auto;
		padding: 16px 20px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.message {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 10px 14px;
	}
	.msg-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
	}
	.msg-user {
		font-size: 12px;
		font-weight: 600;
		color: var(--accent);
	}
	.msg-time {
		font-size: 10px;
		color: var(--text-secondary);
	}
	.msg-content {
		font-size: 14px;
		color: var(--text);
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
	}
	.empty-msg {
		text-align: center;
		color: var(--text-secondary);
		padding: 40px;
		font-size: 14px;
	}
	.input-area {
		display: flex;
		gap: 8px;
		padding: 12px 20px;
		border-top: 1px solid var(--border);
		background: var(--surface);
	}
	.msg-input {
		flex: 1;
		padding: 10px 14px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
		font-family: inherit;
	}
	.msg-input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.send-btn {
		padding: 10px 20px;
		border-radius: 8px;
		border: none;
		background: var(--accent);
		color: #fff;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}
	.send-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.send-btn:hover:not(:disabled) {
		opacity: 0.9;
	}
	.member-sidebar {
		width: 220px;
		margin-left: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
	}
	.member-sidebar h3 {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 12px;
	}
	.member-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.member-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		border-radius: 8px;
	}
	.member-item:hover {
		background: var(--hover);
	}
	.member-avatar {
		font-size: 18px;
	}
	.member-info {
		display: flex;
		flex-direction: column;
	}
	.member-name {
		font-size: 13px;
		font-weight: 500;
		color: var(--text);
	}
	.member-role {
		font-size: 10px;
		color: var(--text-secondary);
	}
</style>
