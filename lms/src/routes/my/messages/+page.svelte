<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';

	let conversations: any[] = $state([]);
	let loading = $state(true);
	let searchOpen = $state(false);
	let searchResults: any[] = $state([]);
	let searchQuery = $state('');
	let searching = $state(false);

	onMount(() => { loadConversations(); });

	async function loadConversations() {
		loading = true;
		try {
			const json = await api('/api/direct/conversations');
			if (json.success) conversations = json.data;
		} catch { /* ignore */ }
		loading = false;
	}

	async function doSearch() {
		if (searchQuery.trim().length < 2) return;
		searching = true;
		try {
			const json = await api(`/api/direct/search?q=${encodeURIComponent(searchQuery.trim())}`);
			if (json.success) searchResults = json.data ?? [];
		} catch { searchResults = []; }
		searching = false;
	}

	function openConversation(userId: string) {
		searchOpen = false;
		goto(`/my/messages/${userId}`);
	}

	function avatarFor(name: string): string {
		return (name || '?').trim().charAt(0).toUpperCase();
	}

	function roleLabel(role: string): string {
		const map: Record<string, string> = { superadmin: 'Superadmin', admin: 'Admin', instructor: 'Guru', ta: 'Asisten', student: 'Siswa', parent: 'Orang Tua', guardian: 'Wali' };
		return map[role] || role || '';
	}

	function timeAgo(dateStr: string): string {
		if (!dateStr) return '';
		const d = new Date(dateStr + (dateStr.includes('Z') ? '' : 'Z'));
		const diff = Date.now() - d.getTime();
		const m = Math.floor(diff / 60000);
		if (m < 1) return 'baru saja';
		if (m < 60) return `${m}m`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h}j`;
		const days = Math.floor(h / 24);
		if (days < 7) return `${days}h`;
		return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
	}
</script>

<svelte:head>
	<title>Pesan — RPL AI Curriculum</title>
</svelte:head>

<div class="inbox-page">
	<div class="page-header">
		<div>
			<h1>💬 Pesan</h1>
			<p class="subtitle">Pesan pribadi dengan guru, siswa, atau rekan</p>
		</div>
		<button class="new-btn" onclick={() => (searchOpen = !searchOpen)}>
			{searchOpen ? 'Tutup' : '+ Pesan Baru'}
		</button>
	</div>

	{#if searchOpen}
		<div class="search-box">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari nama guru / siswa..."
				oninput={doSearch}
			/>
			{#if searching}<span class="search-hint">Mencari...</span>{/if}
			<div class="search-results">
				{#each searchResults as u}
					<button class="search-item" onclick={() => openConversation(u.id)}>
						<span class="avatar">{avatarFor(u.name)}</span>
						<div>
							<span class="search-name">{u.name}</span>
							<span class="search-role">{roleLabel(u.role)}</span>
						</div>
					</button>
				{/each}
				{#if !searching && searchQuery.trim().length >= 2 && searchResults.length === 0}
					<div class="search-empty">Tidak ada hasil</div>
				{/if}
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="loading">Memuat...</div>
	{:else if conversations.length === 0}
		<div class="empty">
			<p>Belum ada percakapan.</p>
			<p class="hint">Klik "+ Pesan Baru" untuk mulai chat dengan guru atau teman.</p>
		</div>
	{:else}
		<div class="conv-list">
			{#each conversations as c (c.partner_id)}
				<a class="conv-item" href="/my/messages/{c.partner_id}">
					<span class="avatar">{avatarFor(c.partner_name)}</span>
					<div class="conv-main">
						<div class="conv-top">
							<span class="conv-name">{c.partner_name}</span>
							<span class="conv-time">{timeAgo(c.last_message_at)}</span>
						</div>
						<div class="conv-bottom">
							<span class="conv-preview {c.unread_count > 0 ? 'unread' : ''}">{c.last_message || ''}</span>
							{#if c.unread_count > 0}
								<span class="unread-badge">{c.unread_count}</span>
							{/if}
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.inbox-page { max-width: 640px; margin: 0 auto; padding: 24px 16px 80px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
	.page-header h1 { font-size: 22px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 13px; margin: 4px 0 0; }
	.new-btn { padding: 8px 14px; border-radius: 8px; border: none; background: var(--accent); color: #fff; font-weight: 600; font-size: 13px; cursor: pointer; }
	.search-box { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px; margin-bottom: 16px; }
	.search-box input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 14px; box-sizing: border-box; }
	.searching { font-size: 12px; color: var(--text-secondary); padding: 6px 2px; }
	.search-results { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
	.search-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px; border: none; background: transparent; border-radius: 8px; cursor: pointer; text-align: left; }
	.search-item:hover { background: var(--hover); }
	.search-name { font-size: 14px; font-weight: 500; color: var(--text); display: block; }
	.search-role { font-size: 11px; color: var(--text-secondary); }
	.search-empty { padding: 12px; text-align: center; color: var(--text-secondary); font-size: 13px; }
	.loading, .empty { text-align: center; padding: 50px 20px; color: var(--text-secondary); }
	.empty .hint { font-size: 13px; margin-top: 6px; }
	.conv-list { display: flex; flex-direction: column; gap: 8px; }
	.conv-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; text-decoration: none; }
	.conv-item:hover { border-color: var(--accent); }
	.avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
	.conv-main { flex: 1; min-width: 0; }
	.conv-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
	.conv-name { font-size: 14px; font-weight: 600; color: var(--text); }
	.conv-time { font-size: 11px; color: var(--text-secondary); flex-shrink: 0; }
	.conv-bottom { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 2px; }
	.conv-preview { font-size: 13px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.conv-preview.unread { color: var(--text); font-weight: 600; }
	.unread-badge { background: var(--accent); color: #fff; font-size: 11px; font-weight: 700; border-radius: 20px; padding: 2px 8px; flex-shrink: 0; }
</style>