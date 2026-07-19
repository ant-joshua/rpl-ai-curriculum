<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';

	const TYPE_LABELS: Record<string, string> = {
		assessment: 'Penilaian',
		assignment: 'Tugas',
		attendance: 'Absensi',
		payment: 'Pembayaran',
		grade: 'Nilai',
		system: 'Sistem',
		announcement: 'Pengumuman',
	};

	const TYPE_ICONS: Record<string, string> = {
		assessment: '📋',
		assignment: '📂',
		attendance: '✅',
		payment: '💰',
		grade: '📝',
		system: '⚙️',
		announcement: '📢',
	};

	let loading = $state(true);
	let error = $state('');
	let notifications = $state<any[]>([]);
	let pagination = $state<any>({ page: 1, totalPages: 1, total: 0 });
	let unreadCount = $state(0);
	let typeFilter = $state('');
	let showArchived = $state(false);
	let selectedIds = $state<Set<string>>(new Set());
	let selectAll = $state(false);
	let pollingInterval: ReturnType<typeof setInterval> | null = null;

	const types = Object.keys(TYPE_LABELS);

	onMount(() => {
		if (browser) loadNotifications();
		if (browser) {
			pollingInterval = setInterval(loadNotifications, 30000);
		}
	});

	onDestroy(() => {
		if (pollingInterval) clearInterval(pollingInterval);
	});

	async function loadNotifications() {
		if (!browser) return;
		loading = true;
		error = '';
		try {
			const token = localStorage.getItem('lms-auth-token');
			if (!token) return;
			const params = new URLSearchParams({
				page: String(pagination.page),
				limit: '20',
			});
			if (typeFilter) params.set('type', typeFilter);
			if (showArchived) params.set('archived', 'true');

			const res = await fetch(`/api/notifications?${params}`, {
				headers: { 'Authorization': `Bearer ${token}` },
			});
			const json = await res.json();
			if (json.success) {
				notifications = json.data || [];
				pagination = json.pagination || pagination;
				unreadCount = json.unreadCount || 0;
			} else {
				error = json.error || 'Gagal memuat notifikasi';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function changePage(delta: number) {
		pagination.page = Math.max(1, Math.min(pagination.totalPages, pagination.page + delta));
		loadNotifications();
	}

	function filterByType(type: string) {
		typeFilter = typeFilter === type ? '' : type;
		pagination.page = 1;
		loadNotifications();
	}

	async function markRead(id: string) {
		const token = localStorage.getItem('lms-auth-token');
		if (!token) return;
		try {
			await fetch(`/api/notifications/${id}/read`, {
				method: 'PUT',
				headers: { 'Authorization': `Bearer ${token}` },
			});
			const n = notifications.find(x => x.id === id);
			if (n) n.is_read = 1;
			unreadCount = Math.max(0, unreadCount - 1);
		} catch {}
	}

	async function markAllRead() {
		const token = localStorage.getItem('lms-auth-token');
		if (!token) return;
		try {
			await fetch('/api/notifications/read-all', {
				method: 'PUT',
				headers: { 'Authorization': `Bearer ${token}` },
			});
			notifications.forEach(n => n.is_read = 1);
			unreadCount = 0;
		} catch {}
	}

	async function archiveNotif(id: string) {
		const token = localStorage.getItem('lms-auth-token');
		if (!token) return;
		try {
			await fetch('/api/notifications', {
				method: 'DELETE',
				headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
				body: JSON.stringify({ id }),
			});
			notifications = notifications.filter(n => n.id !== id);
		} catch {}
	}

	async function markSelectedRead() {
		const token = localStorage.getItem('lms-auth-token');
		if (!token || selectedIds.size === 0) return;
		try {
			await fetch('/api/notifications', {
				method: 'PUT',
				headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids: Array.from(selectedIds) }),
			});
			notifications.forEach(n => { if (selectedIds.has(n.id)) n.is_read = 1; });
			selectedIds.clear();
			selectAll = false;
			loadNotifications();
		} catch {}
	}

	function toggleSelect(id: string) {
		if (selectedIds.has(id)) selectedIds.delete(id);
		else selectedIds.add(id);
	}

	function toggleSelectAll() {
		if (selectAll) {
			selectedIds.clear();
			selectAll = false;
		} else {
			notifications.forEach(n => selectedIds.add(n.id));
			selectAll = true;
		}
	}

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
		return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>Notifikasi — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>🔔 Notifikasi</h1>
			<p class="subtitle">
				{unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
			</p>
		</div>
		<div class="header-actions">
			{#if selectedIds.size > 0}
				<button class="btn-outline" onclick={markSelectedRead}>Tandai {selectedIds.size} Dibaca</button>
			{/if}
			<button class="btn-outline" onclick={markAllRead} disabled={unreadCount === 0}>
				Tandai Semua Dibaca
			</button>
			<button class="btn-refresh" onclick={loadNotifications}>🔄</button>
		</div>
	</div>

	<!-- Filter bar -->
	<div class="filter-bar">
		<button class="filter-btn" class:active={typeFilter === ''} onclick={() => { typeFilter = ''; pagination.page = 1; loadNotifications(); }}>
			Semua
		</button>
		{#each types as t}
			<button class="filter-btn" class:active={typeFilter === t} onclick={() => filterByType(t)}>
				{TYPE_ICONS[t]} {TYPE_LABELS[t]}
			</button>
		{/each}
	</div>

	<!-- Error -->
	{#if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadNotifications}>Coba Lagi</button>
		</div>
	{/if}

	<!-- Loading -->
	{#if loading}
		<div class="loading">Memuat notifikasi...</div>
	<!-- Empty -->
	{:else if notifications.length === 0}
		<div class="empty-state">
			<p>Tidak ada notifikasi</p>
			{#if typeFilter}
				<button class="btn-outline" onclick={() => { typeFilter = ''; loadNotifications(); }}>Tampilkan Semua</button>
			{/if}
		</div>
	<!-- List -->
	{:else}
		<div class="notif-list">
			<!-- Select all -->
			<div class="notif-list-header">
				<label class="checkbox-label">
					<input type="checkbox" checked={selectAll} onchange={toggleSelectAll} />
					<span>Pilih semua</span>
				</label>
				<span class="notif-count">{pagination.total} notifikasi</span>
			</div>

			{#each notifications as n}
				<div class="notif-item" class:unread={!n.is_read} class:selected={selectedIds.has(n.id)}>
					<input
						type="checkbox"
						class="notif-checkbox"
						checked={selectedIds.has(n.id)}
						onchange={() => toggleSelect(n.id)}
					/>
					<div class="notif-icon">{TYPE_ICONS[n.type] || '🔔'}</div>
					<div class="notif-content" onclick={() => !n.is_read && markRead(n.id)} role="button" tabindex="0" onkeypress={() => {}}>
						<div class="notif-title-row">
							<span class="notif-title">{n.title}</span>
							<span class="notif-type-label">{TYPE_LABELS[n.type] || n.type}</span>
						</div>
						{#if n.body}
							<p class="notif-body">{n.body}</p>
						{/if}
						<div class="notif-meta">
							<span class="notif-time">{timeAgo(n.created_at)}</span>
							<span class="notif-channel">{n.channel === 'in_app' ? '📱 In-App' : n.channel === 'email' ? '📧 Email' : '💬 WhatsApp'}</span>
						</div>
					</div>
					<div class="notif-actions">
						{#if !n.is_read}
							<button class="btn-icon" onclick={() => markRead(n.id)} title="Tandai dibaca">✓</button>
						{/if}
						<button class="btn-icon btn-icon-danger" onclick={() => archiveNotif(n.id)} title="Arsipkan">🗑️</button>
					</div>
				</div>
			{/each}
		</div>

		<!-- Pagination -->
		{#if pagination.totalPages > 1}
			<div class="pagination">
				<button class="btn-outline" disabled={pagination.page <= 1} onclick={() => changePage(-1)}>← Sebelumnya</button>
				<span class="page-info">Halaman {pagination.page} dari {pagination.totalPages}</span>
				<button class="btn-outline" disabled={pagination.page >= pagination.totalPages} onclick={() => changePage(1)}>Selanjutnya →</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.page { max-width: 800px; margin: 0 auto; padding: 24px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; flex-wrap: wrap; }

	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-outline { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }
	.btn-outline:hover:not(:disabled) { background: var(--hover); }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-icon { padding: 4px 8px; border: none; border-radius: 6px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 14px; }
	.btn-icon:hover { background: var(--hover); }
	.btn-icon-danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

	/* Filter bar */
	.filter-bar { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
	.filter-btn {
		padding: 6px 14px; border: 1px solid var(--border); border-radius: 8px;
		background: var(--surface); color: var(--text-secondary); font-size: 12px;
		font-weight: 500; cursor: pointer; transition: all 0.15s;
	}
	.filter-btn:hover { background: var(--bg-secondary); color: var(--text); }
	.filter-btn.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent); }

	/* Error/loading/empty */
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.loading { text-align: center; padding: 60px; color: var(--text-secondary); }
	.empty-state { text-align: center; padding: 80px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; font-size: 15px; }

	/* Notification list */
	.notif-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
	.notif-list-header {
		display: flex; justify-content: space-between; align-items: center;
		padding: 12px 16px; background: var(--surface);
		border-bottom: 1px solid var(--border);
	}
	.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); cursor: pointer; }
	.notif-count { font-size: 12px; color: var(--text-secondary); }

	.notif-item {
		display: flex; align-items: flex-start; gap: 10px;
		padding: 14px 16px; background: var(--surface);
		transition: background 0.1s;
	}
	.notif-item:hover { background: var(--hover); }
	.notif-item.unread { background: var(--accent-dim); }
	.notif-item.selected { background: rgba(79,70,229,0.08); }
	.notif-checkbox { margin-top: 4px; accent-color: var(--accent); }
	.notif-icon { font-size: 20px; width: 28px; text-align: center; flex-shrink: 0; margin-top: 2px; }
	.notif-content { flex: 1; min-width: 0; cursor: pointer; }
	.notif-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
	.notif-title { font-size: 14px; font-weight: 600; color: var(--text); }
	.notif-type-label {
		font-size: 10px; padding: 2px 6px; border-radius: 4px;
		background: rgba(98,102,109,0.15); color: #64748b;
		font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em;
	}
	.notif-body { margin: 4px 0; font-size: 13px; color: var(--text-secondary); line-height: 1.4; }
	.notif-meta { display: flex; gap: 12px; margin-top: 4px; }
	.notif-time { font-size: 11px; color: var(--muted); }
	.notif-channel { font-size: 11px; color: var(--muted); }
	.notif-actions { display: flex; gap: 4px; flex-shrink: 0; }

	/* Pagination */
	.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; }
	.page-info { font-size: 13px; color: var(--text-secondary); }

	@media (max-width: 600px) {
		.page { padding: 16px; }
		.header h1 { font-size: 20px; }
		.notif-item { padding: 12px 14px; }
		.notif-actions { flex-direction: column; }
	}
</style>
