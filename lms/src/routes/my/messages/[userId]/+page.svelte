<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/utils/api';

	let partnerId = $derived(($page.params as any).userId);
	let partner: any = $state(null);
	let messages: any[] = $state([]);
	let messageText = $state('');
	let sending = $state(false);
	let loading = $state(true);
	let pollInterval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		loadThread();
		pollInterval = setInterval(loadThread, 5000);
	});

	onDestroy(() => {
		if (pollInterval) clearInterval(pollInterval);
	});

	async function loadThread() {
		try {
			const json = await api(`/api/direct/conversations/${partnerId}`);
			if (json.success) {
				partner = json.data.partner;
				messages = json.data.messages || [];
			}
		} catch { /* ignore */ }
		loading = false;
	}

	async function handleSend() {
		const content = messageText.trim();
		if (!content || sending) return;
		sending = true;
		try {
			const json = await api(`/api/direct/conversations/${partnerId}`, {
				method: 'POST',
				body: JSON.stringify({ content }),
			});
			if (json.success) {
				messages = [...messages, json.data];
				messageText = '';
			} else {
				alert(json.error || 'Gagal mengirim pesan');
			}
		} catch {
			alert('Gagal mengirim pesan');
		}
		sending = false;
	}

	function isMine(m: any): boolean {
		return m.recipient_id === partnerId;
	}

	function formatTime(dateStr: string): string {
		if (!dateStr) return '';
		const d = new Date(dateStr.includes('Z') ? dateStr : dateStr + 'Z');
		return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
	}

	function roleLabel(role: string): string {
		const map: Record<string, string> = { instructor: 'Guru', ta: 'Asisten', student: 'Siswa', parent: 'Orang Tua', admin: 'Admin', superadmin: 'Superadmin' };
		return map[role] || role || '';
	}

	function avatarFor(name: string): string {
		return (name || '?').trim().charAt(0).toUpperCase();
	}

	$effect(() => {
		// Scroll to bottom on new messages
		const el = document.querySelector('.msg-list');
		if (el) el.scrollTop = el.scrollHeight;
	});
</script>

<svelte:head>
	<title>{partner?.name || 'Pesan'} — RPL AI Curriculum</title>
</svelte:head>

<div class="thread-page">
	<div class="thread-header">
		<a href="/my/messages" class="back-link">← Pesan</a>
		{#if partner}
			<div class="partner-info">
				<span class="avatar">{avatarFor(partner.name)}</span>
				<div>
					<span class="partner-name">{partner.name}</span>
					<span class="partner-role">{roleLabel(partner.role)}</span>
				</div>
			</div>
		{/if}
	</div>

	<div class="msg-area">
		{#if loading}
			<div class="loading">Memuat...</div>
		{:else if messages.length === 0}
			<div class="empty">
				<p>Belum ada pesan.</p>
				<p class="hint">Sapa {partner?.name || 'mereka'} untuk memulai percakapan!</p>
			</div>
		{:else}
			<div class="msg-list">
				{#each messages as m (m.id)}
					<div class="msg-row {isMine(m) ? 'mine' : 'theirs'}">
						<div class="bubble">
							<span class="msg-text">{m.content}</span>
							<span class="msg-time">{formatTime(m.created_at)}</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
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

<style>
	.thread-page { max-width: 640px; margin: 0 auto; padding: 16px; height: calc(100vh - 120px); display: flex; flex-direction: column; }
	.thread-header { display: flex; align-items: center; gap: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
	.back-link { color: var(--text-secondary); text-decoration: none; font-size: 13px; }
	.back-link:hover { color: var(--accent); }
	.partner-info { display: flex; align-items: center; gap: 10px; }
	.avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
	.partner-name { font-size: 14px; font-weight: 600; color: var(--text); display: block; }
	.partner-role { font-size: 11px; color: var(--text-secondary); }
	.msg-area { flex: 1; overflow: hidden; display: flex; flex-direction: column; margin: 12px 0; }
	.msg-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding: 4px 2px; }
	.msg-row { display: flex; }
	.msg-row.mine { justify-content: flex-end; }
	.msg-row.theirs { justify-content: flex-start; }
	.bubble { max-width: 75%; padding: 9px 13px; border-radius: 14px; font-size: 14px; line-height: 1.45; }
	.mine .bubble { background: var(--accent); color: #fff; border-bottom-right-radius: 4px; }
	.theirs .bubble { background: var(--surface); border: 1px solid var(--border); border-bottom-left-radius: 4px; color: var(--text); }
	.msg-time { display: block; font-size: 10px; opacity: 0.75; margin-top: 3px; text-align: right; }
	.loading, .empty { text-align: center; padding: 50px 20px; color: var(--text-secondary); }
	.empty .hint { font-size: 13px; margin-top: 6px; }
	.input-area { display: flex; gap: 8px; }
	.msg-input { flex: 1; padding: 11px 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface); color: var(--text); font-size: 14px; font-family: inherit; }
	.msg-input:focus { outline: none; border-color: var(--accent); }
	.send-btn { padding: 11px 20px; border-radius: 10px; border: none; background: var(--accent); color: #fff; font-weight: 600; font-size: 13px; cursor: pointer; }
	.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>