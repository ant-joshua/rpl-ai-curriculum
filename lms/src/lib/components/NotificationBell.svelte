<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let notifications = $state<any[]>([]);
	let unreadCount = $state(0);
	let open = $state(false);
	let loading = $state(true);
	let timer: ReturnType<typeof setInterval> | null = null;

	const typeIcons: Record<string, string> = {
		info: 'ℹ️', success: '✅', warning: '⚠️', question: '💬',
		live: '🔴', cert: '🏆', grade: '📝',
	};

	onMount(() => {
		if (!browser) return;
		load();
		timer = setInterval(load, 60000); // refresh every 60s
	});

	onDestroy(() => {
		if (timer) clearInterval(timer);
	});

	async function load() {
		try {
			const res = await fetch('/api/notifications?limit=15');
			const json = await res.json();
			if (json.success) {
				notifications = json.data || [];
				unreadCount = json.unreadCount || json.pagination?.total_unread || 0;
			}
		} catch { /* ignore */ } finally {
			loading = false;
		}
	}

	function toggle() {
		open = !open;
		if (open) load();
	}

	async function markRead(id: string, link?: string) {
		await fetch(`/api/notifications/${id}/read`, { method: 'POST' }).catch(() => {});
		unreadCount = Math.max(0, unreadCount - 1);
		const n = notifications.find((x: any) => x.id === id);
		if (n) n.is_read = 1;
		if (link) location.href = link;
	}

	async function markAllRead() {
		await fetch('/api/notifications/read-all', { method: 'POST' }).catch(() => {});
		unreadCount = 0;
		notifications.forEach((n: any) => n.is_read = 1);
	}

	function timeAgo(ts: string): string {
		if (!ts) return '';
		const diff = Date.now() - new Date(ts + (ts.includes('T') ? '' : 'Z')).getTime();
		if (diff < 60000) return 'baru saja';
		if (diff < 3600000) return `${Math.floor(diff / 60000)}m lalu`;
		if (diff < 86400000) return `${Math.floor(diff / 3600000)}j lalu`;
		return `${Math.floor(diff / 86400000)}h lalu`;
	}
</script>

<div class="notif-wrap">
	<button class="notif-bell" onclick={toggle} aria-label="Notifikasi">
		🔔
		{#if unreadCount > 0}
			<span class="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
		{/if}
	</button>

	{#if open}
		<div class="notif-dropdown">
			<div class="notif-header">
				<strong>Notifikasi</strong>
				{#if unreadCount > 0}
					<button class="notif-readall" onclick={markAllRead}>Tandai semua dibaca</button>
				{/if}
			</div>
			<div class="notif-list">
				{#if loading}
					<p class="notif-empty">Memuat...</p>
				{:else if notifications.length === 0}
					<p class="notif-empty">Belum ada notifikasi</p>
				{:else}
					{#each notifications as n}
						{#if n.link}
							<a class="notif-item" class:unread={n.is_read == 0} href={n.link} onclick={() => markRead(n.id, n.link)}>
								<span class="notif-icon">{typeIcons[n.type] || 'ℹ️'}</span>
								<div class="notif-body">
									<span class="notif-title">{n.title}</span>
									{#if n.body}<span class="notif-text">{n.body}</span>{/if}
									<span class="notif-time">{timeAgo(n.created_at)}</span>
								</div>
								{#if n.is_read == 0}<span class="notif-dot"></span>{/if}
							</a>
						{:else}
							<button class="notif-item" class:unread={n.is_read == 0} onclick={() => markRead(n.id)}>
								<span class="notif-icon">{typeIcons[n.type] || 'ℹ️'}</span>
								<div class="notif-body">
									<span class="notif-title">{n.title}</span>
									{#if n.body}<span class="notif-text">{n.body}</span>{/if}
									<span class="notif-time">{timeAgo(n.created_at)}</span>
								</div>
								{#if n.is_read == 0}<span class="notif-dot"></span>{/if}
							</button>
						{/if}
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.notif-wrap { position: relative; }
	.notif-bell {
		position: relative; background: none; border: none; cursor: pointer;
		font-size: 19px; padding: 6px; border-radius: 8px; line-height: 1;
	}
	.notif-bell:hover { background: var(--surface); }
	.notif-badge {
		position: absolute; top: 0; right: -2px;
		background: #dc2626; color: white; font-size: 10px; font-weight: 700;
		min-width: 16px; height: 16px; border-radius: 999px;
		display: flex; align-items: center; justify-content: center;
		padding: 0 3px;
	}
	.notif-dropdown {
		position: absolute; right: 0; top: 40px; width: 340px; max-width: 90vw;
		background: white; border: 1px solid var(--border); border-radius: 12px;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15); z-index: 100; overflow: hidden;
	}
	.notif-header {
		display: flex; align-items: center; justify-content: space-between;
		padding: 12px 14px; border-bottom: 1px solid var(--border);
	}
	.notif-header strong { font-size: 14px; }
	.notif-readall { background: none; border: none; color: #2563eb; font-size: 12px; cursor: pointer; }
	.notif-list { max-height: 360px; overflow-y: auto; }
	.notif-empty { text-align: center; color: var(--text-muted); font-size: 13px; padding: 24px 12px; margin: 0; }
	.notif-item {
		display: flex; align-items: flex-start; gap: 10px; width: 100%;
		padding: 10px 14px; border: none; border-bottom: 1px solid var(--border);
		background: none; text-align: left; cursor: pointer; text-decoration: none; color: inherit;
	}
	.notif-item:hover { background: var(--surface); }
	.notif-item.unread { background: #eff6ff; }
	.notif-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
	.notif-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
	.notif-title { font-size: 13px; font-weight: 600; color: var(--text); }
	.notif-text {
		font-size: 12px; color: var(--text-secondary); line-height: 1.4;
		display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
	}
	.notif-time { font-size: 11px; color: #94a3b8; }
	.notif-dot { width: 8px; height: 8px; border-radius: 999px; background: #2563eb; flex-shrink: 0; margin-top: 4px; }
</style>
