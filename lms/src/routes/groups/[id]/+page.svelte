<script lang="ts">
	import { t } from '$lib/stores/i18n';
	import { onMount, onDestroy } from 'svelte';
	import { groupsStore } from '$lib/stores/groups.svelte';
	import { page } from '$app/stores';
	import { Button, ConfirmDialog, toast } from '$lib/components/ui';

	let { data } = $props();

	let groupId = $derived($page.params.id);
	let messageText = $state('');
	let sending = $state(false);
	let members = $state<{ id: string; user_id: string; role: string; username?: string; display_name?: string }[]>([]);
	let groupName = $state('');
	let myRole = $state<string | null>(null);
	let groupCreatedBy = $state('');

	let confirmModal = $state<{
		open: boolean;
		title: string;
		message: string;
		confirmText: string;
		variant: 'primary' | 'danger';
		action: () => Promise<void>;
	}>({
		open: false,
		title: '',
		message: '',
		confirmText: '',
		variant: 'primary',
		action: async () => {}
	});

	let pollInterval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		loadGroup();
		groupsStore.loadMessages(groupId);
		pollInterval = setInterval(() => {
			groupsStore.loadMessages(groupId);
			loadGroup();
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
				myRole = json.data.my_role || null;
				groupCreatedBy = json.data.created_by || '';
			}
		} catch { /* ignore */ }
	}

	function memberDisplayName(m: any): string {
		return m.display_name || m.username || m.user_id.slice(0, 8);
	}

	function promptChangeRole(memberId: string, role: string) {
		const isToAdmin = role === 'admin';
		confirmModal = {
			open: true,
			title: isToAdmin ? 'Jadikan Admin?' : 'Turunkan Jadi Anggota?',
			message: isToAdmin ? 'Anggota ini akan memiliki akses admin grup.' : 'Hak akses admin anggota ini akan dicabut.',
			confirmText: isToAdmin ? '⭐ Jadikan Admin' : 'Turunkan Role',
			variant: 'primary',
			action: async () => {
				try {
					const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ role }),
					});
					const json = await res.json();
					if (json.success) {
						toast.success('Role berhasil diubah');
						await loadGroup();
					} else {
						toast.error(json.error || 'Gagal mengubah role');
					}
				} catch {
					toast.error('Gagal terhubung ke server');
				}
			}
		};
	}

	function promptKickMember(memberId: string) {
		confirmModal = {
			open: true,
			title: 'Keluarkan Anggota?',
			message: 'Anggota ini akan dikeluarkan dari grup diskusi.',
			confirmText: '✕ Keluarkan',
			variant: 'danger',
			action: async () => {
				try {
					const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, { method: 'DELETE' });
					const json = await res.json();
					if (json.success) {
						toast.success('Anggota berhasil dikeluarkan');
						await loadGroup();
					} else {
						toast.error(json.error || 'Gagal mengeluarkan anggota');
					}
				} catch {
					toast.error('Gagal terhubung ke server');
				}
			}
		};
	}

	function promptLeaveGroup() {
		confirmModal = {
			open: true,
			title: 'Keluar dari Grup?',
			message: 'Anda tidak akan menerima pesan baru dari grup ini lagi.',
			confirmText: 'Keluar Grup',
			variant: 'danger',
			action: async () => {
				try {
					const res = await fetch(`/api/groups/${groupId}/join`, { method: 'DELETE' });
					const json = await res.json();
					if (json.success) {
						window.location.href = '/groups';
					} else {
						toast.error(json.error || 'Gagal keluar grup');
					}
				} catch {
					toast.error('Gagal terhubung ke server');
				}
			}
		};
	}

	function promptDeleteGroup() {
		confirmModal = {
			open: true,
			title: 'Hapus Grup Diskusi?',
			message: 'Semua pesan dan riwayat diskusi akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
			confirmText: '🗑️ Hapus Grup',
			variant: 'danger',
			action: async () => {
				try {
					const res = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' });
					const json = await res.json();
					if (json.success) {
						window.location.href = '/groups';
					} else {
						toast.error(json.error || 'Gagal menghapus grup');
					}
				} catch {
					toast.error('Gagal terhubung ke server');
				}
			}
		};
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
				<Button type="submit" variant="primary" class="send-btn" disabled={!messageText.trim() || sending} loading={sending}>
					Kirim
				</Button>
			</form>
		</div>

		<aside class="member-sidebar">
			<div class="member-sidebar-head">
				<h3>Anggota ({members.length})</h3>
				{#if myRole === 'admin'}
					<span class="admin-badge">👑 Admin</span>
				{/if}
			</div>
			<div class="member-list">
				{#each members as m}
					<div class="member-item">
						<span class="member-avatar">👤</span>
						<div class="member-info">
							<span class="member-name">{memberDisplayName(m)}</span>
							<span class="member-role">{m.role === 'admin' ? '👑 Admin' : 'Anggota'}</span>
							{#if myRole === 'admin' && m.user_id !== groupCreatedBy}
								<div class="member-actions">
									{#if m.role === 'member'}
										<Button variant="ghost" size="sm" class="mini-btn" onclick={() => promptChangeRole(m.id, 'admin')} title="Jadikan admin">⭐</Button>
									{:else}
										<Button variant="ghost" size="sm" class="mini-btn" onclick={() => promptChangeRole(m.id, 'member')} title="Turunkan jadi anggota">⬇</Button>
									{/if}
									<Button variant="danger" size="sm" class="mini-btn" onclick={() => promptKickMember(m.id)} title="Keluarkan">✕</Button>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			<div class="group-actions">
				{#if myRole !== null}
					<Button variant="outline" class="action-btn leave" onclick={promptLeaveGroup}>Keluar Grup</Button>
				{/if}
				{#if myRole === 'admin'}
					<Button variant="danger" class="action-btn delete" onclick={promptDeleteGroup}>Hapus Grup</Button>
				{/if}
			</div>
		</aside>
	</div>
</div>

<ConfirmDialog
	open={confirmModal.open}
	title={confirmModal.title}
	message={confirmModal.message}
	confirmText={confirmModal.confirmText}
	confirmVariant={confirmModal.variant}
	onconfirm={confirmModal.action}
	oncancel={() => confirmModal.open = false}
/>

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
		color: white;
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
	.member-sidebar-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}
	.member-sidebar-head h3 {
		margin-bottom: 0;
	}
	.admin-badge {
		font-size: 11px;
		font-weight: 600;
		color: var(--warning);
		background: var(--warning-light);
		padding: 2px 8px;
		border-radius: 20px;
	}
	.member-actions {
		display: flex;
		gap: 4px;
		margin-top: 4px;
	}
	.mini-btn {
		width: 22px;
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		cursor: pointer;
		font-size: 11px;
		line-height: 1;
	}
	.mini-btn:hover {
		border-color: var(--accent);
	}
	.mini-btn.danger:hover {
		border-color: var(--danger);
		background: var(--danger-light);
	}
	.group-actions {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 16px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}
	.action-btn {
		padding: 8px 12px;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--text-secondary);
	}
	.action-btn:hover {
		color: var(--text);
		border-color: var(--text-secondary);
	}
	.action-btn.delete {
		color: var(--danger);
	}
	.action-btn.delete:hover {
		background: var(--danger-light);
		border-color: var(--danger);
	}
</style>
